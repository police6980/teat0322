import { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import {
  GEMINI_SVG_MODEL,
  GEMINI_TEXT_MODEL,
  type ApiError,
  type ApiErrorType,
  type GeneratedImage,
  type GenerationStatus,
} from '../types';
import {
  buildImagePrompt,
  TRANSLATION_SYSTEM_PROMPT,
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

/** 응답 텍스트에서 SVG 코드를 추출 */
function extractSvg(text: string): string {
  // 코드 펜스 안의 SVG 추출
  const fenceMatch = text.match(/```(?:svg|xml)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // 코드 펜스 없이 <svg> 태그만 있는 경우
  const tagMatch = text.match(/<svg[\s\S]*<\/svg>/);
  if (tagMatch) return tagMatch[0].trim();

  return '';
}

export function useGeminiApi() {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [error, setError] = useState<ApiError | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number>(0);

  /** 한국어 설명을 영어로 번역 */
  const translateToEnglish = useCallback(
    async (apiKey: string, koreanText: string): Promise<string> => {
      const genAI = new GoogleGenAI({ apiKey });
      const result = await genAI.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: koreanText,
        config: {
          systemInstruction: TRANSLATION_SYSTEM_PROMPT,
        },
      });
      return result.text ?? '';
    },
    []
  );

  /** SVG 애니메이션 생성 */
  const generateImage = useCallback(
    async (
      apiKey: string,
      conceptNameEn: string,
      conceptNameKo: string,
      conceptId: string,
      koreanDescription: string
    ): Promise<{ image: GeneratedImage; error: null } | { image: null; error: ApiError }> => {
      setStatus('translating');
      setError(null);

      try {
        // 1단계: 한국어 → 영어 번역
        const translatedDescription = await translateToEnglish(apiKey, koreanDescription);

        // 2단계: SVG 생성 프롬프트 조합
        const svgPrompt = buildImagePrompt(conceptNameEn, translatedDescription);

        setStatus('generating');

        // 3단계: Gemini로 SVG 코드 생성
        const genAI = new GoogleGenAI({ apiKey });
        const result = await genAI.models.generateContent({
          model: GEMINI_SVG_MODEL,
          contents: svgPrompt,
        });

        const svgCode = extractSvg(result.text ?? '');

        if (!svgCode) {
          throw new Error('SVG 코드가 응답에 포함되지 않았습니다. 다시 시도해주세요.');
        }

        const generatedImage: GeneratedImage = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          conceptId,
          conceptNameKo,
          svgCode,
          prompt: svgPrompt,
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
    [translateToEnglish]
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
