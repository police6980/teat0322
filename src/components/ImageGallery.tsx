import { useState } from 'react';
import type { GeneratedImage } from '../types';

interface ImageGalleryProps {
  images: GeneratedImage[];
  onClear: () => void;
}

/** 세션 갤러리 컴포넌트 — 현재 세션 생성 이미지 썸네일 표시 */
export function ImageGallery({ images, onClear }: ImageGalleryProps) {
  const [modalImage, setModalImage] = useState<GeneratedImage | null>(null);

  if (images.length === 0) return null;

  const handleDownload = (image: GeneratedImage) => {
    const a = document.createElement('a');
    a.href = `data:${image.mimeType};base64,${image.imageData}`;
    a.download = `${image.conceptId}-${image.id}.png`;
    a.click();
  };

  return (
    <>
      <div className="bg-navy-800 border border-navy-600 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-mono text-sm text-scigreen-400 tracking-wider uppercase">
            세션 갤러리
            <span className="ml-2 text-gray-500">({images.length}/10)</span>
          </h3>
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-red-400 font-sans transition-colors"
          >
            갤러리 초기화
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => setModalImage(img)}
              className="group relative aspect-square rounded-lg overflow-hidden border border-navy-600 hover:border-scigreen-500 transition-colors"
            >
              <img
                src={`data:${img.mimeType};base64,${img.imageData}`}
                alt={img.conceptNameKo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-sans leading-tight truncate">
                  {img.conceptNameKo.split(' (')[0]}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 이미지 상세 모달 */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setModalImage(null)}
        >
          <div
            className="bg-navy-800 rounded-2xl p-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-sans font-semibold text-white text-sm">
                {modalImage.conceptNameKo}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(modalImage)}
                  className="text-xs font-mono text-scigreen-400 hover:text-scigreen-300 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  다운로드
                </button>
                <button
                  onClick={() => setModalImage(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <img
              src={`data:${modalImage.mimeType};base64,${modalImage.imageData}`}
              alt={modalImage.conceptNameKo}
              className="w-full rounded-xl"
            />
            <p className="mt-3 text-xs text-gray-500 font-sans">
              생성 시간: {modalImage.createdAt.toLocaleTimeString('ko-KR')}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
