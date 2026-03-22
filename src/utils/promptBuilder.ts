/**
 * SVG 애니메이션 생성용 프롬프트 빌더 유틸리티
 */

/** 텍스트 번역을 위한 시스템 프롬프트 */
export const TRANSLATION_SYSTEM_PROMPT =
  "Translate the following Korean student description to English exactly as written. Do NOT correct any scientific errors or misconceptions — translate the student's words faithfully, even if scientifically wrong. Return only the translated text.";

/**
 * 학생 설명을 SVG 애니메이션 코드 생성 프롬프트로 변환한다.
 */
export function buildImagePrompt(
  conceptNameEn: string,
  translatedDescription: string
): string {
  return `You are visualizing a student's mental model of particle science. Your task is to create an animated SVG that shows EXACTLY what the student described — even if it is scientifically incorrect. This is used by teachers to identify student misconceptions.

Topic: ${conceptNameEn}
Student's description (visualize this exactly, do NOT correct errors): ${translatedDescription}

Output ONLY the raw SVG code. No explanation, no markdown, no code fences.

SVG requirements:
- viewBox="0 0 400 400" width="100%" height="100%"
- White background rectangle filling the entire viewBox
- Represent particles as circles (use colors like #4ade80, #60a5fa, #f87171, #fbbf24, #c084fc)
- Embed CSS @keyframes animations inside a <style> tag within the SVG
- Animate each particle independently to reflect the student's described behavior (e.g. if they said particles move fast, animate fast; if they said particles are stuck together, keep them touching)
- Make all animations infinite and smooth
- No text or labels inside the SVG
- Keep it simple and clear`;
}

/**
 * API 키 형식을 기본 검증한다 (AIza로 시작하는지 확인).
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  return apiKey.trim().startsWith('AIza') && apiKey.trim().length > 20;
}
