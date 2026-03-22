import type { SimVariable } from '../types';

interface VariableBuilderProps {
  variables: SimVariable[];
  onChange: (vars: SimVariable[]) => void;
}

const MAX_VARS = 3;

export function VariableBuilder({ variables, onChange }: VariableBuilderProps) {
  const addVariable = () => {
    if (variables.length >= MAX_VARS) return;
    onChange([
      ...variables,
      { id: crypto.randomUUID(), name: '', effect: '' },
    ]);
  };

  const removeVariable = (id: string) => {
    onChange(variables.filter((v) => v.id !== id));
  };

  const updateVariable = (id: string, field: 'name' | 'effect', value: string) => {
    onChange(variables.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-mono text-xs text-scigreen-400 tracking-widest uppercase">
          변수 설정
        </label>
        {variables.length < MAX_VARS && (
          <button
            type="button"
            onClick={addVariable}
            className="flex items-center gap-1 text-xs font-mono text-scigreen-400 hover:text-scigreen-300 transition-colors border border-navy-600 hover:border-scigreen-600 rounded-lg px-2 py-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            변수 추가
          </button>
        )}
      </div>

      {variables.length === 0 && (
        <p className="text-xs text-gray-600 font-sans text-center py-3">
          변수를 추가해 시뮬레이션의 슬라이더를 만드세요
        </p>
      )}

      {variables.map((v, i) => (
        <div
          key={v.id}
          className="bg-navy-900 border border-navy-600 rounded-xl p-4 space-y-3"
        >
          {/* 변수 헤더 */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-500">변수 {i + 1}</span>
            {variables.length > 1 && (
              <button
                type="button"
                onClick={() => removeVariable(v.id)}
                className="text-gray-600 hover:text-red-400 transition-colors"
                aria-label="변수 삭제"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* 변수 이름 */}
          <div>
            <label className="block font-mono text-xs text-gray-400 mb-1">
              변수 이름
            </label>
            <input
              type="text"
              value={v.name}
              onChange={(e) => updateVariable(v.id, 'name', e.target.value)}
              placeholder="예: 온도, 압력, 농도, 입자 크기…"
              maxLength={30}
              className="w-full bg-navy-800 border border-navy-600 focus:border-scigreen-500 rounded-lg px-3 py-2 text-white font-sans text-sm outline-none transition-colors placeholder-gray-600"
            />
          </div>

          {/* 변수 증가 시 설명 */}
          <div>
            <label className="block font-mono text-xs text-gray-400 mb-1">
              이 값이 커지면 입자들이 어떻게 되나요?
            </label>
            <textarea
              value={v.effect}
              onChange={(e) => updateVariable(v.id, 'effect', e.target.value)}
              placeholder="예: 입자들이 더 빠르게 움직이고 서로 자주 충돌한다. 빈 공간이 많아지고 입자들이 퍼져나간다."
              maxLength={300}
              rows={3}
              className="w-full bg-navy-800 border border-navy-600 focus:border-scigreen-500 rounded-lg px-3 py-2 text-white font-sans text-sm outline-none transition-colors placeholder-gray-600 resize-none leading-relaxed"
            />
            <p className="text-right text-xs font-mono text-gray-600 mt-0.5">
              {v.effect.length}/300
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
