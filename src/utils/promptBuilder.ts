/**
 * 이미지 생성용 프롬프트 빌더 유틸리티
 * 번역된 학생 설명을 Gemini 이미지 생성에 최적화된 프롬프트로 조합
 */

/** 텍스트 번역을 위한 시스템 프롬프트 */
export const TRANSLATION_SYSTEM_PROMPT =
  'Translate the following Korean student description to English exactly as written. Do NOT correct any scientific errors or misconceptions — translate the student\'s words faithfully, even if scientifically wrong. Return only the translated text.';

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
  return `Draw a particle model diagram exactly as a student described it. This is for identifying student misconceptions, so you MUST draw what the student said, NOT what is scientifically correct.

Topic context: ${conceptNameEn}
Student's description (draw this exactly): ${translatedDescription}

Drawing rules:
- Represent particles as simple colored circles
- Follow ONLY the student's description for arrangement, spacing, size, and movement
- Do NOT correct scientific errors — if the student says particles touch each other in a gas, draw them touching
- Use arrows only if the student mentioned movement or direction
- Clean white background
- No text labels in the image
- 2D flat illustration style`;
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
