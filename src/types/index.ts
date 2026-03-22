/** Gemini API 모델 상수 */
export const GEMINI_SVG_MODEL = 'gemini-2.5-pro';
export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash';

/** 시뮬레이션 변수 (슬라이더 하나) */
export interface SimVariable {
  id: string;
  name: string;    // 한국어 변수 이름 (예: 온도)
  effect: string;  // 이 변수가 커질 때 입자 행동 설명
}

/** 과학 개념 프리셋 타입 */
export interface ScienceConcept {
  id: string;
  nameKo: string;
  nameEn: string;
  placeholderKo: string;
}

/** 생성된 시각화 항목 타입 */
export interface GeneratedImage {
  id: string;
  conceptId: string;
  conceptNameKo: string;
  svgCode: string;
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

/** 앱 테마 */
export type Theme = 'dark' | 'light';
