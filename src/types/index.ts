/** Gemini API 모델 상수 */
export const GEMINI_IMAGE_MODEL = 'gemini-3.1-pro-preview';
export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash';

/** 과학 개념 프리셋 타입 */
export interface ScienceConcept {
  id: string;
  nameKo: string;
  nameEn: string;
  placeholderKo: string;
}

/** 생성된 이미지 항목 타입 */
export interface GeneratedImage {
  id: string;
  conceptId: string;
  conceptNameKo: string;
  imageData: string; // base64
  mimeType: string;
  prompt: string;
  translatedDescription: string;
  createdAt: Date;
}

/** API 에러 종류 */
export type ApiErrorType =
  | 'INVALID_API_KEY'
  | 'RATE_LIMIT'
  | 'NETWORK_ERROR'
  | 'CONTENT_FILTER'
  | 'UNKNOWN';

/** API 에러 정보 */
export interface ApiError {
  type: ApiErrorType;
  message: string;
  retryAfter?: number; // 초 단위
}

/** 이미지 생성 상태 */
export type GenerationStatus =
  | 'idle'
  | 'translating'
  | 'generating'
  | 'success'
  | 'error';

/** 이미지 생성 결과 */
export interface GenerationResult {
  status: GenerationStatus;
  image?: GeneratedImage;
  error?: ApiError;
}

/** Gemini API 응답의 Part 타입 */
export interface GeminiPart {
  text?: string;
  inlineData?: {
    data: string;
    mimeType: string;
  };
}

/** Gemini API 응답의 Candidate 타입 */
export interface GeminiCandidate {
  content: {
    parts: GeminiPart[];
  };
}

/** Gemini API 응답 타입 */
export interface GeminiResponse {
  candidates: GeminiCandidate[];
}

/** 앱 테마 */
export type Theme = 'dark' | 'light';
