import { useState } from 'react';
import { validateApiKeyFormat } from '../utils/promptBuilder';

interface ApiKeyModalProps {
  onSubmit: (apiKey: string) => void;
  error?: string;
}

/** API 키 입력 온보딩 모달 */
export function ApiKeyModal({ onSubmit, error }: ApiKeyModalProps) {
  const [input, setInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();

    if (!trimmed) {
      setValidationError('API 키를 입력해주세요.');
      return;
    }

    if (!validateApiKeyFormat(trimmed)) {
      setValidationError('유효하지 않은 API 키 형식입니다. (AIza로 시작해야 합니다)');
      return;
    }

    setValidationError('');
    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-navy-900 bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="bg-navy-800 border border-scigreen-500 border-opacity-30 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {/* 헤더 로고 */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-navy-700 border-2 border-scigreen-500 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-scigreen-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                />
              </svg>
            </div>
            <div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-scigreen-400"
              style={{ animation: 'pulseGlow 2s ease-in-out infinite' }}
            />
          </div>
        </div>

        <h1 className="font-mono text-xl font-bold text-center text-white mb-1 tracking-wider">
          과학 개념 시각화
        </h1>
        <p className="font-sans text-center text-gray-400 text-sm mb-6">
          AI가 입자 모형 이미지를 즉시 생성합니다
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-scigreen-400 mb-2 tracking-widest uppercase">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setValidationError('');
                }}
                placeholder="AIzaSy..."
                className="w-full bg-navy-900 border border-navy-600 focus:border-scigreen-500 rounded-lg px-4 py-3 pr-12 text-white font-mono text-sm outline-none transition-colors placeholder-gray-600"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-scigreen-400 transition-colors"
                tabIndex={-1}
              >
                {showKey ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* 에러 메시지 */}
            {(validationError || error) && (
              <p className="mt-2 text-red-400 text-xs font-sans flex items-center gap-1">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationError || error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!input.trim()}
            className="w-full bg-scigreen-600 hover:bg-scigreen-500 disabled:bg-navy-700 disabled:text-gray-600 text-white font-mono font-semibold py-3 rounded-lg transition-colors tracking-wider"
          >
            시작하기 →
          </button>
        </form>

        <div className="mt-6 p-3 bg-navy-900 rounded-lg border border-navy-600">
          <p className="text-xs text-gray-500 font-sans leading-relaxed">
            <span className="text-scigreen-400 font-semibold">보안:</span> API 키는 이 브라우저 탭에만 저장되며, 탭을 닫으면 자동으로 삭제됩니다. 서버에 전송되지 않습니다.
          </p>
        </div>

        <p className="text-center mt-4 text-xs text-gray-600 font-sans">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-scigreen-600 hover:text-scigreen-400 transition-colors"
          >
            Google AI Studio에서 API 키 발급 →
          </a>
        </p>
      </div>
    </div>
  );
}
