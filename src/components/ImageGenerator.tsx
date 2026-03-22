import { useState, useCallback } from 'react';
import { ConceptSelector } from './ConceptSelector';
import { VariableBuilder } from './VariableBuilder';
import { LoadingAnimation } from './LoadingAnimation';
import { SCIENCE_CONCEPTS } from '../utils/scienceConcepts';
import { useGeminiApi } from '../hooks/useGeminiApi';
import type { GeneratedImage, ScienceConcept, SimVariable } from '../types';

interface ImageGeneratorProps {
  apiKey: string;
  onImageGenerated: (image: GeneratedImage) => void;
  onApiKeyInvalid: () => void;
}

function makeVar(): SimVariable {
  return { id: crypto.randomUUID(), name: '', effect: '' };
}

/** 이미지 생성 핵심 컴포넌트 — 입력 패널 + 결과 패널 */
export function ImageGenerator({ apiKey, onImageGenerated, onApiKeyInvalid }: ImageGeneratorProps) {
  const [selectedConcept, setSelectedConcept] = useState<ScienceConcept>(SCIENCE_CONCEPTS[0]);
  const [variables, setVariables] = useState<SimVariable[]>([makeVar()]);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const { status, error, retryCountdown, generateImage, reset, isLoading } = useGeminiApi();

  const handleConceptSelect = useCallback((concept: ScienceConcept) => {
    setSelectedConcept(concept);
  }, []);

  const isReady =
    !isLoading &&
    variables.length > 0 &&
    variables.every((v) => v.name.trim().length >= 1 && v.effect.trim().length >= 5);

  const handleGenerate = async () => {
    if (!isReady) return;

    reset();
    setCurrentImage(null);

    const result = await generateImage(
      apiKey,
      selectedConcept.nameEn,
      selectedConcept.nameKo,
      selectedConcept.id,
      variables
    );

    if (result.image) {
      setCurrentImage(result.image);
      onImageGenerated(result.image);
    } else if (result.error?.type === 'INVALID_API_KEY') {
      onApiKeyInvalid();
    }
  };

  const handleDownload = () => {
    if (!currentImage) return;
    const isSvgOnly = currentImage.svgCode.trimStart().startsWith('<svg');
    const blob = new Blob([currentImage.svgCode], {
      type: isSvgOnly ? 'image/svg+xml' : 'text/html',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentImage.conceptId}-particle-sim.${isSvgOnly ? 'svg' : 'html'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* ─── 좌측 입력 패널 ─── */}
      <div className="lg:w-96 flex-shrink-0 space-y-4">
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-5 space-y-5">
          <h2 className="font-mono text-sm text-scigreen-400 tracking-widest uppercase flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            시뮬레이션 설정
          </h2>

          {/* 개념 선택 */}
          <div>
            <label className="block font-mono text-xs text-scigreen-400 mb-2 tracking-widest uppercase">
              과학 개념
            </label>
            <ConceptSelector
              selectedConcept={selectedConcept}
              onSelect={handleConceptSelect}
            />
          </div>

          {/* 구분선 */}
          <div className="border-t border-navy-600" />

          {/* 변수 설정 */}
          <VariableBuilder variables={variables} onChange={setVariables} />

          {/* 안내 문구 */}
          {!isReady && variables.some((v) => v.name.trim()) && (
            <p className="text-xs text-gray-600 font-sans">
              모든 변수에 이름(1자 이상)과 설명(5자 이상)을 입력해주세요.
            </p>
          )}

          {/* 생성 버튼 */}
          <button
            onClick={handleGenerate}
            disabled={!isReady}
            className="w-full relative bg-scigreen-600 hover:bg-scigreen-500 disabled:bg-navy-700 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-mono font-bold py-4 rounded-xl transition-all tracking-wider flex items-center justify-center gap-2 group"
            style={isReady ? { boxShadow: '0 0 10px rgba(22, 163, 74, 0.3)' } : {}}
          >
            {isLoading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {status === 'translating' ? '번역 중...' : '생성 중...'}
              </>
            ) : (
              <>
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                시뮬레이션 생성
              </>
            )}
          </button>
        </div>

        {/* 에러 메시지 패널 */}
        {error && status === 'error' && (
          <div className="bg-red-900 bg-opacity-30 border border-red-500 border-opacity-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-red-300 font-sans text-sm font-semibold">{error.message}</p>
                {error.type === 'RATE_LIMIT' && retryCountdown > 0 && (
                  <p className="text-red-400 font-mono text-xs mt-1">
                    {retryCountdown}초 후 재시도 가능
                  </p>
                )}
                {error.type === 'INVALID_API_KEY' ? (
                  <button
                    onClick={onApiKeyInvalid}
                    className="mt-2 text-xs font-mono text-scigreen-400 hover:text-scigreen-300 transition-colors underline"
                  >
                    API 키 재입력 →
                  </button>
                ) : (
                  <button
                    onClick={() => { reset(); handleGenerate(); }}
                    disabled={retryCountdown > 0}
                    className="mt-2 text-xs font-mono text-scigreen-400 hover:text-scigreen-300 disabled:text-gray-600 transition-colors underline"
                  >
                    {retryCountdown > 0 ? `${retryCountdown}초 후 재시도` : '다시 시도 →'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── 우측 결과 패널 ─── */}
      <div className="flex-1 min-h-[512px]">
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-5 h-full flex flex-col">
          <h2 className="font-mono text-sm text-scigreen-400 tracking-widest uppercase flex items-center gap-2 mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            생성 결과
          </h2>

          <div className="flex-1 flex items-center justify-center">
            {/* 로딩 */}
            {isLoading && <LoadingAnimation status={status} />}

            {/* 대기 */}
            {!isLoading && !currentImage && status !== 'error' && (
              <div className="text-center text-gray-600">
                <div className="mb-4 relative mx-auto w-24 h-24">
                  {[0, 72, 144, 216, 288].map((deg, i) => (
                    <div
                      key={i}
                      className="absolute w-3 h-3 rounded-full opacity-20"
                      style={{
                        backgroundColor: ['#4ade80', '#60a5fa', '#f472b6', '#fb923c', '#a78bfa'][i],
                        top: '50%',
                        left: '50%',
                        transform: `rotate(${deg}deg) translateX(35px) translateY(-50%)`,
                      }}
                    />
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-10 h-10 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="font-mono text-sm">변수를 설정하고</p>
                <p className="font-mono text-sm">시뮬레이션을 생성해보세요</p>
              </div>
            )}

            {/* 생성된 시뮬레이션 */}
            {!isLoading && currentImage && (
              <div className="w-full space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-navy-600 bg-white"
                  style={{ minHeight: '420px' }}>
                  <iframe
                    srcDoc={currentImage.svgCode}
                    title={currentImage.conceptNameKo}
                    className="w-full"
                    style={{ height: '460px', border: 'none' }}
                    sandbox="allow-scripts"
                  />
                </div>

                {/* 액션 버튼들 */}
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-navy-700 hover:bg-navy-600 text-white font-mono text-sm py-2 px-4 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    HTML 저장
                  </button>

                  <button
                    onClick={() => setShowPrompt((v) => !v)}
                    className="flex items-center gap-2 text-gray-500 hover:text-scigreen-400 font-mono text-xs py-2 px-3 rounded-lg transition-colors border border-navy-600 hover:border-scigreen-600"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    {showPrompt ? '프롬프트 숨기기' : '프롬프트 보기'}
                  </button>
                </div>

                {/* 프롬프트 상세 */}
                {showPrompt && (
                  <div className="bg-navy-900 border border-navy-600 rounded-xl p-4 space-y-3">
                    <div>
                      <p className="font-mono text-xs text-scigreen-400 mb-1 tracking-wider">번역된 변수</p>
                      <pre className="font-sans text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {currentImage.translatedDescription}
                      </pre>
                    </div>
                    <div>
                      <p className="font-mono text-xs text-scigreen-400 mb-1 tracking-wider">생성 프롬프트</p>
                      <pre className="font-mono text-xs text-gray-400 leading-relaxed whitespace-pre-wrap break-words">
                        {currentImage.prompt}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
