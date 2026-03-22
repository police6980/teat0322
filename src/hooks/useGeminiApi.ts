import { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import {
  GEMINI_SVG_MODEL,
  GEMINI_TEXT_MODEL,
  type ApiError,
  type ApiErrorType,
  type GeneratedImage,
  type GenerationStatus,
  type SimVariable,
} from '../types';
import {
  buildImagePrompt,
  TRANSLATION_SYSTEM_PROMPT,
  type TranslatedVariable,
} from '../utils/promptBuilder';

/** 에러를 분류해 사용자 친화적 ApiError로 변환 */
function classifyError(error: unknown): ApiError {
  const msg = error instanceof Error ? error.message : String(error);
  const lower = msg.toLowerCase();

  let type: ApiErrorType = 'UNKNOWN';
  let message = `오류가 발생했습니다: ${msg}`;
  let retryAfter: number | undefined;

  if (lower.includes('api key') || lower.includes('401') || lower.includes('api_key_invalid')) {
    type = 'INVALID_API_KEY';
    message = 'API 키가 유효하지 않습니다. 다시 입력해주세요.';
  } else if (lower.includes('429') || lower.includes('quota') || lower.includes('rate')) {
    type = 'RATE_LIMIT';
    message = '잠시 후 다시 시도해주세요.';
    retryAfter = 30;
  } else if (lower.includes('fetch') || lower.includes('network') || lower.includes('failed to fetch')) {
    type = 'NETWORK_ERROR';
    message = '인터넷 연결을 확인해주세요.';
  } else if (
    lower.includes('safety') ||
    lower.includes('blocked') ||
    lower.includes('harm') ||
    lower.includes('filter')
  ) {
    type = 'CONTENT_FILTER';
    message = '입력 내용을 수정해주세요.';
  }

  return { type, message, retryAfter };
}

/** 응답 텍스트에서 HTML 또는 SVG 코드를 추출 */
function extractCode(text: string): string {
  // 코드 펜스 안의 HTML/SVG 추출
  const fenceMatch = text.match(/```(?:html|svg|xml)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // <!DOCTYPE html> 포함된 전체 HTML 문서
  const htmlDocMatch = text.match(/<!DOCTYPE[\s\S]*<\/html>/i);
  if (htmlDocMatch) return htmlDocMatch[0].trim();

  // <html> 태그로 시작하는 경우
  const htmlMatch = text.match(/<html[\s\S]*<\/html>/i);
  if (htmlMatch) return htmlMatch[0].trim();

  // 코드 펜스 없이 <svg> 태그만 있는 경우
  const tagMatch = text.match(/<svg[\s\S]*<\/svg>/);
  if (tagMatch) return tagMatch[0].trim();

  return '';
}

export function useGeminiApi() {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [error, setError] = useState<ApiError | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number>(0);

  /** 한국어 변수 정보를 영어로 번역 */
  const translateVariables = useCallback(
    async (apiKey: string, variables: SimVariable[]): Promise<TranslatedVariable[]> => {
      const genAI = new GoogleGenAI({ apiKey });

      const results: TranslatedVariable[] = [];
      for (const v of variables) {
        const text = `Variable name: ${v.name}\nEffect description: ${v.effect}`;
        const result = await genAI.models.generateContent({
          model: GEMINI_TEXT_MODEL,
          contents: text,
          config: { systemInstruction: TRANSLATION_SYSTEM_PROMPT },
        });
        const translated = result.text ?? '';
        // 각 줄 파싱
        const nameMatch = translated.match(/Variable name:\s*(.+)/i);
        const effectMatch = translated.match(/Effect description:\s*([\s\S]+)/i);
        results.push({
          nameEn: nameMatch?.[1]?.trim() ?? v.name,
          effectEn: effectMatch?.[1]?.trim() ?? v.effect,
        });
      }
      return results;
    },
    []
  );

  /** 인터랙티브 HTML 시뮬레이션 생성 */
  const generateImage = useCallback(
    async (
      apiKey: string,
      conceptNameEn: string,
      conceptNameKo: string,
      conceptId: string,
      variables: SimVariable[]
    ): Promise<{ image: GeneratedImage; error: null } | { image: null; error: ApiError }> => {
      setStatus('translating');
      setError(null);

      try {
        // 1단계: 변수 정보 번역
        const translatedVars = await translateVariables(apiKey, variables);

        // 2단계: 프롬프트 생성
        const prompt = buildImagePrompt(conceptNameEn, translatedVars);

        setStatus('generating');

        // 3단계: Gemini로 HTML 코드 생성
        const genAI = new GoogleGenAI({ apiKey });
        const result = await genAI.models.generateContent({
          model: GEMINI_SVG_MODEL,
          contents: prompt,
        });

        const svgCode = extractCode(result.text ?? '');

        if (!svgCode) {
          throw new Error('HTML 코드가 응답에 포함되지 않았습니다. 다시 시도해주세요.');
        }

        // 번역된 변수 요약을 translatedDescription에 저장
        const translatedDescription = translatedVars
          .map((v) => `${v.nameEn}: ${v.effectEn}`)
          .join('\n');

        const generatedImage: GeneratedImage = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          conceptId,
          conceptNameKo,
          svgCode,
          prompt,
          translatedDescription,
          createdAt: new Date(),
        };

        setStatus('success');
        return { image: generatedImage, error: null };
      } catch (err) {
        const apiError = classifyError(err);
        setError(apiError);
        setStatus('error');

        if (apiError.retryAfter) {
          let remaining = apiError.retryAfter;
          setRetryCountdown(remaining);
          const timer = setInterval(() => {
            remaining -= 1;
            setRetryCountdown(remaining);
            if (remaining <= 0) {
              clearInterval(timer);
              setRetryCountdown(0);
            }
          }, 1000);
        }

        return { image: null, error: apiError };
      }
    },
    [translateVariables]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setRetryCountdown(0);
  }, []);

  return {
    status,
    error,
    retryCountdown,
    generateImage,
    reset,
    isLoading: status === 'translating' || status === 'generating',
  };
}
