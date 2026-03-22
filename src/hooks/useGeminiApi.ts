import { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  GEMINI_IMAGE_MODEL,
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

/** HTTP 상태 코드를 에러 타입으로 변환 */
function classifyError(error: unknown): ApiError {
  const msg = error instanceof Error ? error.message : String(error);
  const lower = msg.toLowerCase();

  let type: ApiErrorType = 'UNKNOWN';
  let message = '알 수 없는 오류가 발생했습니다.';
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

/**
 * Gemini API 호출을 담당하는 커스텀 훅.
 * 텍스트 번역(gemini-2.0-flash) + 이미지 생성(gemini-2.0-flash-preview-image-generation) 순서로 처리.
 */
export function useGeminiApi() {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [error, setError] = useState<ApiError | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number>(0);

  /** 한국어 설명을 영어로 번역 */
  const translateToEnglish = useCallback(
    async (apiKey: string, koreanText: string): Promise<string> => {
      const genAI = new GoogleGenerativeAI(apiKey);
      const textModel = genAI.getGenerativeModel({
        model: GEMINI_TEXT_MODEL,
        systemInstruction: TRANSLATION_SYSTEM_PROMPT,
      });
      const result = await textModel.generateContent(koreanText);
      return result.response.text();
    },
    []
  );

  /** 이미지 생성 실행 */
  const generateImage = useCallback(
    async (
      apiKey: string,
      conceptNameEn: string,
      conceptNameKo: string,
      conceptId: string,
      koreanDescription: string
    ): Promise<GeneratedImage | null> => {
      setStatus('translating');
      setError(null);

      try {
        // 1단계: 한국어 → 영어 번역
        const translatedDescription = await translateToEnglish(apiKey, koreanDescription);

        // 2단계: 이미지 생성 프롬프트 조합
        const imagePrompt = buildImagePrompt(conceptNameEn, translatedDescription);

        setStatus('generating');

        // 3단계: Gemini 이미지 생성 API 호출
        const genAI = new GoogleGenerativeAI(apiKey);

        // responseModalities 설정 필수 — 누락 시 이미지 미반환
        const imageModel = genAI.getGenerativeModel({
          model: GEMINI_IMAGE_MODEL,
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          } as never,
        });

        const result = await imageModel.generateContent(imagePrompt);

        // 4단계: 응답에서 base64 이미지 데이터 추출
        const parts = result.response.candidates?.[0]?.content?.parts ?? [];
        const imagePart = parts.find((p) => p.inlineData != null);

        if (!imagePart?.inlineData) {
          throw new Error('이미지 데이터가 응답에 포함되지 않았습니다.');
        }

        const generatedImage: GeneratedImage = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          conceptId,
          conceptNameKo,
          imageData: imagePart.inlineData.data,
          mimeType: imagePart.inlineData.mimeType,
          prompt: imagePrompt,
          translatedDescription,
          createdAt: new Date(),
        };

        setStatus('success');
        return generatedImage;
      } catch (err) {
        const apiError = classifyError(err);
        setError(apiError);
        setStatus('error');

        // Rate limit 시 카운트다운 시작
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

        return null;
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
