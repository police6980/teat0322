import type { ScienceConcept } from '../types';

/** 과학 개념 프리셋 목록 */
export const SCIENCE_CONCEPTS: ScienceConcept[] = [
  {
    id: 'boyles-law',
    nameKo: '보일의 법칙 (압력-부피 관계)',
    nameEn: "Boyle's Law (Pressure-Volume Relationship)",
    placeholderKo: '',
  },
  {
    id: 'charles-law',
    nameKo: '샤를의 법칙 (온도-부피 관계)',
    nameEn: "Charles's Law (Temperature-Volume Relationship)",
    placeholderKo: '',
  },
  {
    id: 'states-of-matter',
    nameKo: '물질의 상태 변화 (고체/액체/기체)',
    nameEn: 'States of Matter (Solid/Liquid/Gas)',
    placeholderKo: '',
  },
  {
    id: 'diffusion',
    nameKo: '확산 현상',
    nameEn: 'Diffusion Phenomenon',
    placeholderKo: '',
  },
  {
    id: 'osmosis',
    nameKo: '삼투 현상',
    nameEn: 'Osmosis Phenomenon',
    placeholderKo: '',
  },
  {
    id: 'custom',
    nameKo: '직접 입력 (사용자 정의)',
    nameEn: 'Custom Input',
    placeholderKo: '',
  },
];

/** ID로 개념 찾기 */
export function findConceptById(id: string): ScienceConcept | undefined {
  return SCIENCE_CONCEPTS.find((c) => c.id === id);
}
