import type { GenerationStatus } from '../types';

interface LoadingAnimationProps {
  status: GenerationStatus;
}

/** 입자들이 모이는 CSS 로딩 애니메이션 컴포넌트 */
export function LoadingAnimation({ status }: LoadingAnimationProps) {
  const isTranslating = status === 'translating';
  const isGenerating = status === 'generating';

  const statusText = isTranslating
    ? '텍스트 번역 중...'
    : isGenerating
      ? '이미지 생성 중...'
      : '';

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      {/* 입자 애니메이션 */}
      <div className="relative w-32 h-32">
        {/* 중심 입자 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-scigreen-500 animate-pulse-glow" />
        </div>

        {/* 궤도 입자들 */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <div
            key={i}
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: `rotate(${deg}deg)` }}
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{
                transform: 'translateX(45px)',
                backgroundColor: [
                  '#4ade80',
                  '#60a5fa',
                  '#f472b6',
                  '#fb923c',
                  '#a78bfa',
                  '#34d399',
                ][i],
                animation: `particleOrbit ${2 + i * 0.3}s linear infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          </div>
        ))}

        {/* 스캔 링 */}
        <div
          className="absolute inset-0 rounded-full border-2 border-scigreen-500 opacity-30"
          style={{ animation: 'spin 3s linear infinite' }}
        />
        <div
          className="absolute inset-2 rounded-full border border-blue-400 opacity-20"
          style={{ animation: 'spin 4s linear infinite reverse' }}
        />
      </div>

      {/* 상태 텍스트 */}
      <div className="text-center">
        <p className="font-mono text-scigreen-500 text-lg font-semibold tracking-wider">
          {statusText}
        </p>
        <div className="flex items-center justify-center gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-scigreen-500"
              style={{
                animation: `particleFloat 1.4s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 진행 표시 */}
      <div className="w-64 h-1 bg-navy-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-scigreen-600 to-scigreen-400 rounded-full"
          style={{
            width: isTranslating ? '40%' : '85%',
            transition: 'width 1s ease-in-out',
          }}
        />
      </div>

      <p className="text-gray-400 text-sm font-sans">
        {isTranslating
          ? 'AI가 과학 개념을 분석하고 있습니다'
          : 'AI가 입자 모형 이미지를 생성하고 있습니다'}
      </p>
    </div>
  );
}
