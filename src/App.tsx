import { useState, useCallback } from 'react';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ImageGenerator } from './components/ImageGenerator';
import { ImageGallery } from './components/ImageGallery';
import { BoyleLaw } from './components/simulations/BoyleLaw';
import { useApiKey } from './hooks/useApiKey';
import type { GeneratedImage, Theme } from './types';

type AppTab = 'lab' | 'ai';

/** 세션 갤러리 최대 이미지 수 */
const MAX_GALLERY_IMAGES = 10;

export default function App() {
  const { apiKey, setApiKey, clearApiKey, hasApiKey } = useApiKey();
  const [showApiKeyModal, setShowApiKeyModal] = useState(!hasApiKey);
  const [apiKeyError, setApiKeyError] = useState('');
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);
  const [theme, setTheme] = useState<Theme>('dark');
  const [activeTab, setActiveTab] = useState<AppTab>('lab');

  const handleApiKeySubmit = useCallback(
    (key: string) => {
      setApiKey(key);
      setApiKeyError('');
      setShowApiKeyModal(false);
    },
    [setApiKey]
  );

  const handleApiKeyInvalid = useCallback(() => {
    clearApiKey();
    setApiKeyError('API 키가 유효하지 않습니다. 다시 입력해주세요.');
    setShowApiKeyModal(true);
  }, [clearApiKey]);

  const handleImageGenerated = useCallback((image: GeneratedImage) => {
    setGallery((prev) => {
      const updated = [image, ...prev];
      // 최대 10개 유지
      return updated.slice(0, MAX_GALLERY_IMAGES);
    });
  }, []);

  const handleClearGallery = useCallback(() => {
    setGallery([]);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div
        className="min-h-screen font-sans"
        style={{
          background:
            theme === 'dark'
              ? 'linear-gradient(135deg, #0a0f1e 0%, #0d1530 50%, #0a0f1e 100%)'
              : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)',
        }}
      >
        {/* ─── API 키 입력 모달 ─── */}
        {showApiKeyModal && (
          <ApiKeyModal
            onSubmit={handleApiKeySubmit}
            error={apiKeyError}
          />
        )}

        {/* ─── 헤더 ─── */}
        <header
          className="border-b sticky top-0 z-40 backdrop-blur-md"
          style={{
            borderColor: theme === 'dark' ? 'rgba(22, 163, 74, 0.2)' : 'rgba(22, 163, 74, 0.3)',
            backgroundColor: theme === 'dark' ? 'rgba(10, 15, 30, 0.9)' : 'rgba(240, 249, 255, 0.9)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            {/* 로고 */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-navy-800 border border-scigreen-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-scigreen-400" />
                </div>
                <div
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-scigreen-400 opacity-70"
                  style={{ animation: 'pulseGlow 2s ease-in-out infinite' }}
                />
              </div>
              <div>
                <h1 className="font-mono text-base font-bold text-white tracking-wider leading-tight">
                  SciViz
                </h1>
                <p className="font-sans text-xs text-gray-500">과학 개념 시각화 AI</p>
              </div>
            </div>

            {/* 탭 내비게이션 */}
            <nav className="flex gap-1 bg-navy-900 rounded-xl p-1 border border-navy-700">
              {([
                { id: 'lab', label: '🔬 실험실', sub: '개념 확인' },
                { id: 'ai',  label: '✨ AI 생성', sub: '오개념 시각화' },
              ] as { id: AppTab; label: string; sub: string }[]).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2 rounded-lg transition-all font-mono text-xs flex flex-col items-center leading-tight ${
                    activeTab === t.id
                      ? 'bg-scigreen-600 text-white shadow'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <span>{t.label}</span>
                  <span className="text-[10px] opacity-70">{t.sub}</span>
                </button>
              ))}
            </nav>

            {/* 우측 컨트롤 */}
            <div className="flex items-center gap-3">
              {/* 테마 토글 */}
              <button
                onClick={toggleTheme}
                className="text-gray-400 hover:text-scigreen-400 transition-colors p-2 rounded-lg hover:bg-navy-700"
                title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* API 키 변경 버튼 */}
              {hasApiKey && (
                <button
                  onClick={() => {
                    setApiKeyError('');
                    setShowApiKeyModal(true);
                  }}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-scigreen-400 font-mono text-xs transition-colors border border-navy-600 hover:border-scigreen-600 px-3 py-1.5 rounded-lg"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  키 변경
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ─── 메인 콘텐츠 ─── */}
        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* ── 실험실 탭 (API 키 불필요) ── */}
          {activeTab === 'lab' && (
            <div className="space-y-4">
              {/* 개념 선택 (지금은 보일의 법칙만) */}
              <div className="flex gap-2 flex-wrap">
                <button className="font-mono text-xs bg-scigreen-600 text-white px-4 py-2 rounded-xl">
                  보일의 법칙
                </button>
                <button className="font-mono text-xs text-gray-600 border border-navy-700 px-4 py-2 rounded-xl cursor-not-allowed" disabled title="준비 중">
                  샤를의 법칙 (준비 중)
                </button>
                <button className="font-mono text-xs text-gray-600 border border-navy-700 px-4 py-2 rounded-xl cursor-not-allowed" disabled title="준비 중">
                  확산 현상 (준비 중)
                </button>
              </div>
              <BoyleLaw />
            </div>
          )}

          {/* ── AI 생성 탭 ── */}
          {activeTab === 'ai' && (
            hasApiKey ? (
              <>
                <ImageGenerator
                  apiKey={apiKey}
                  onImageGenerated={handleImageGenerated}
                  onApiKeyInvalid={handleApiKeyInvalid}
                />
                <ImageGallery images={gallery} onClear={handleClearGallery} />
              </>
            ) : (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center text-gray-500">
                  <div className="mb-6 relative mx-auto w-32 h-32">
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                      <div
                        key={i}
                        className="absolute w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: `hsl(${i * 45}, 70%, 60%)`,
                          top: '50%', left: '50%',
                          transform: `rotate(${deg}deg) translateX(48px) translateY(-50%)`,
                          opacity: 0.3,
                          animation: `particleFloat ${1.5 + i * 0.2}s ease-in-out infinite`,
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full border-2 border-navy-600" />
                    </div>
                  </div>
                  <p className="font-mono text-lg mb-2">API 키를 입력해주세요</p>
                  <button
                    onClick={() => setShowApiKeyModal(true)}
                    className="font-mono text-sm text-scigreen-400 hover:text-scigreen-300 transition-colors underline"
                  >
                    API 키 입력하기 →
                  </button>
                </div>
              </div>
            )
          )}
        </main>

        {/* ─── 푸터 ─── */}
        <footer className="border-t border-navy-700 mt-12 py-4">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="font-mono text-xs text-gray-700">
              SciViz · 과학 개념 시각화 교육 앱 · Powered by Google Gemini AI
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
