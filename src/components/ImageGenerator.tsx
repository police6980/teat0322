import { useState, useRef, useCallback } from 'react';
import { ConceptSelector } from './ConceptSelector';
import { LoadingAnimation } from './LoadingAnimation';
import { SCIENCE_CONCEPTS } from '../utils/scienceConcepts';
import { useGeminiApi } from '../hooks/useGeminiApi';
import type { GeneratedImage, ScienceConcept } from '../types';

interface ImageGeneratorProps {
  apiKey: string;
  onImageGenerated: (image: GeneratedImage) => void;
  onApiKeyInvalid: () => void;
}

/** 이미지 생성 핵심 컴포넌트 — 입력 패널 + 결과 패널 */
export function ImageGenerator({ apiKey, onImageGenerated, onApiKeyInvalid }: ImageGeneratorProps) {
  const [selectedConcept, setSelectedConcept] = useState<ScienceConcept>(SCIENCE_CONCEPTS[0]);
  const [description, setDescription] = useState('');
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const { status, error, retryCountdown, generateImage, reset, isLoading } = useGeminiApi();

  // 개념 변경 시 description 초기화
  const handleConceptSelect = useCallback((concept: ScienceConcept) => {
    setSelectedConcept(concept);
    setDescription('');
  }, []);

  const handleGenerate = async () => {
    if (!description.trim() || isLoading) return;

    reset();
    setCurrentImage(null);

    const result = await generateImage(
      apiKey,
      selectedConcept.nameEn,
      selectedConcept.nameKo,
      selectedConcept.id,
      description
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
    const a = document.createElement('a');
    a.href = `data:${currentImage.mimeType};base64,${currentImage.imageData}`;
    a.download = `${currentImage.conceptId}-particle-model.png`;
    a.click();
  };

  const handleCopyToClipboard = async () => {
    if (!currentImage) return;
    try {
      // base64를 Blob으로 변환 후 클립보드에 복사
      const byteString = atob(currentImage.imageData);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: currentImage.mimeType });
      await navigator.clipboard.write([
        new ClipboardItem({ [currentImage.mimeType]: blob }),
      ]);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // 클립보드 API 미지원 시 data URL 복사
      await navigator.clipboard.writeText(
        `data:${currentImage.mimeType};base64,${currentImage.imageData}`
      );
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const isButtonDisabled =
    isLoading || description.trim().length < 10 || description.trim().length > 500;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* ─── 좌측 입력 패널 ─── */}
      <div className="lg:w-96 flex-shrink-0 space-y-4">
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-5 space-y-4">
          <h2 className="font-mono text-sm text-scigreen-400 tracking-widest uppercase flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            개념 입력
          </h2>

          {/* 개념 선택 */}
          <ConceptSelector
            selectedConcept={selectedConcept}
            onSelect={handleConceptSelect}
          />

          {/* 설명 입력 */}
          <div>
            <label className="block font-mono text-xs text-scigreen-400 mb-2 tracking-widest uppercase">
              입자 모형 설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={selectedConcept.placeholderKo}
              minLength={10}
              maxLength={500}
              rows={6}
              className="w-full bg-navy-900 border border-navy-600 focus:border-scigreen-500 rounded-lg px-4 py-3 text-white font-sans text-sm outline-none transition-colors placeholder-gray-600 resize-none leading-relaxed"
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-600 font-sans">최소 10자, 최대 500자</p>
              <p
                className={`text-xs font-mono ${
                  description.length > 450 ? 'text-red-400' : 'text-gray-600'
                }`}
              >
                {description.length}/500
              </p>
            </div>
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={handleGenerate}
            disabled={isButtonDisabled}
            className="w-full relative bg-scigreen-600 hover:bg-scigreen-500 disabled:bg-navy-700 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-mono font-bold py-4 rounded-xl transition-all tracking-wider flex items-center justify-center gap-2 group"
            style={
              !isButtonDisabled
                ? { boxShadow: '0 0 10px rgba(22, 163, 74, 0.3)' }
                : {}
            }
          >
            {isLoading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                처리 중...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                이미지 생성
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
                {error.type === 'INVALID_API_KEY' && (
                  <button
                    onClick={onApiKeyInvalid}
                    className="mt-2 text-xs font-mono text-scigreen-400 hover:text-scigreen-300 transition-colors underline"
                  >
                    API 키 재입력 →
                  </button>
                )}
                {error.type !== 'INVALID_API_KEY' && (
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            생성 결과
          </h2>

          <div className="flex-1 flex items-center justify-center">
            {/* 로딩 상태 */}
            {isLoading && <LoadingAnimation status={status} />}

            {/* 대기 상태 (이미지 없음) */}
            {!isLoading && !currentImage && status !== 'error' && (
              <div className="text-center text-gray-600">
                <div className="mb-4 relative mx-auto w-24 h-24">
                  {/* 대기 중 입자 장식 */}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="font-mono text-sm">과학 개념을 입력하고</p>
                <p className="font-mono text-sm">이미지를 생성해보세요</p>
              </div>
            )}

            {/* 생성된 이미지 */}
            {!isLoading && currentImage && (
              <div className="w-full space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-navy-600 bg-white">
                  <img
                    ref={imgRef}
                    src={`data:${currentImage.mimeType};base64,${currentImage.imageData}`}
                    alt={currentImage.conceptNameKo}
                    className="w-full object-contain"
                    style={{ minHeight: '300px', maxHeight: '600px' }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
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
                    PNG 저장
                  </button>
                  <button
                    onClick={handleCopyToClipboard}
                    className="flex items-center gap-2 bg-navy-700 hover:bg-navy-600 text-white font-mono text-sm py-2 px-4 rounded-lg transition-colors"
                  >
                    {copySuccess ? (
                      <>
                        <svg className="w-4 h-4 text-scigreen-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        복사됨!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        클립보드 복사
                      </>
                    )}
                  </button>

                  {/* 프롬프트 표시 토글 */}
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

                {/* 프롬프트 상세 표시 */}
                {showPrompt && (
                  <div className="bg-navy-900 border border-navy-600 rounded-xl p-4 space-y-3">
                    <div>
                      <p className="font-mono text-xs text-scigreen-400 mb-1 tracking-wider">번역된 설명</p>
                      <p className="font-sans text-xs text-gray-300 leading-relaxed">
                        {currentImage.translatedDescription}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-xs text-scigreen-400 mb-1 tracking-wider">이미지 생성 프롬프트</p>
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
