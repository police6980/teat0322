/**
 * 이미지 생성용 프롬프트 빌더 유틸리티
 * 번역된 학생 설명을 Gemini 이미지 생성에 최적화된 프롬프트로 조합
 */

/** 텍스트 번역을 위한 시스템 프롬프트 */
export const TRANSLATION_SYSTEM_PROMPT =
  'Translate the following Korean science concept description to English for scientific image generation. Keep scientific terms accurate. Return only the translated text.';

/**
 * 번역된 설명과 개념명으로 이미지 생성 프롬프트를 조합한다.
 *
 * @param conceptNameEn - 선택된 과학 개념의 영문명
 * @param translatedDescription - 번역된 학생 설명 텍스트
 * @returns 이미지 생성에 최적화된 영문 프롬프트
 */
export function buildImagePrompt(
  conceptNameEn: string,
  translatedDescription: string
): string {
  return `Scientific particle model diagram, educational illustration style.

Concept: ${conceptNameEn}
Visualization request: ${translatedDescription}

Style requirements:
- Clear particle representations as colored circles
- Show relative distances and arrangements between particles
- Use arrows to indicate movement or force direction
- Clean white background with labeled elements
- Elementary/middle school educational diagram style
- No text overlays in the image
- 2D flat illustration, scientific accuracy`;
}

/**
 * API 키 형식을 기본 검증한다 (AIza로 시작하는지 확인).
 *
 * @param apiKey - 검증할 API 키 문자열
 * @returns 유효한 형식이면 true
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  return apiKey.trim().startsWith('AIza') && apiKey.trim().length > 20;
}
