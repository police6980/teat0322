import { useState, useCallback } from 'react';

const SESSION_KEY = 'gemini_api_key';

/**
 * Gemini API 키를 sessionStorage로 관리하는 커스텀 훅.
 * localStorage 사용 금지 — 탭 닫으면 자동 삭제.
 */
export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string>(
    () => sessionStorage.getItem(SESSION_KEY) ?? ''
  );

  const setApiKey = useCallback((key: string) => {
    const trimmed = key.trim();
    if (trimmed) {
      sessionStorage.setItem(SESSION_KEY, trimmed);
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
    setApiKeyState(trimmed);
  }, []);

  const clearApiKey = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setApiKeyState('');
  }, []);

  return {
    apiKey,
    setApiKey,
    clearApiKey,
    hasApiKey: apiKey.length > 0,
  };
}
