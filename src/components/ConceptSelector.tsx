import { SCIENCE_CONCEPTS } from '../utils/scienceConcepts';
import type { ScienceConcept } from '../types';

interface ConceptSelectorProps {
  selectedConcept: ScienceConcept;
  onSelect: (concept: ScienceConcept) => void;
}

/** 과학 개념 선택 드롭다운 컴포넌트 */
export function ConceptSelector({ selectedConcept, onSelect }: ConceptSelectorProps) {
  return (
    <div>
      <label className="block font-mono text-xs text-scigreen-400 mb-2 tracking-widest uppercase">
        과학 개념 선택
      </label>
      <div className="relative">
        <select
          value={selectedConcept.id}
          onChange={(e) => {
            const concept = SCIENCE_CONCEPTS.find((c) => c.id === e.target.value);
            if (concept) onSelect(concept);
          }}
          className="w-full appearance-none bg-navy-900 border border-navy-600 focus:border-scigreen-500 rounded-lg px-4 py-3 pr-10 text-white font-sans text-sm outline-none transition-colors cursor-pointer"
        >
          {SCIENCE_CONCEPTS.map((concept) => (
            <option key={concept.id} value={concept.id} className="bg-navy-900">
              {concept.nameKo}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-scigreen-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
