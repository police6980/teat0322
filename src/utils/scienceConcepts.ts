import type { ScienceConcept } from '../types';

/** 과학 개념 프리셋 목록 */
export const SCIENCE_CONCEPTS: ScienceConcept[] = [
  {
    id: 'boyles-law',
    nameKo: '보일의 법칙 (압력-부피 관계)',
    nameEn: "Boyle's Law (Pressure-Volume Relationship)",
    placeholderKo:
      '예: 압력이 증가하면 기체 입자 간 간격이 좁아지고, 같은 공간에 더 많은 충돌이 일어납니다. 용기가 작아질수록 입자들이 촘촘히 모이는 모습을 보여주세요.',
  },
  {
    id: 'charles-law',
    nameKo: '샤를의 법칙 (온도-부피 관계)',
    nameEn: "Charles's Law (Temperature-Volume Relationship)",
    placeholderKo:
      '예: 온도가 높아지면 기체 입자의 운동 에너지가 증가하여 더 빠르게 움직이고 부피가 팽창합니다. 뜨거운 용기에서 입자들이 활발히 움직이는 모습을 보여주세요.',
  },
  {
    id: 'states-of-matter',
    nameKo: '물질의 상태 변화 (고체/액체/기체)',
    nameEn: 'States of Matter (Solid/Liquid/Gas)',
    placeholderKo:
      '예: 고체는 입자들이 규칙적으로 배열되어 진동만 하고, 액체는 입자들이 자유롭게 움직이며, 기체는 입자들이 매우 빠르게 움직이며 멀리 퍼져 있습니다.',
  },
  {
    id: 'diffusion',
    nameKo: '확산 현상',
    nameEn: 'Diffusion Phenomenon',
    placeholderKo:
      '예: 향수 분자가 고농도 영역에서 저농도 영역으로 자연스럽게 퍼져나가는 과정을 보여주세요. 농도 기울기를 따라 입자들이 이동하는 모습.',
  },
  {
    id: 'osmosis',
    nameKo: '삼투 현상',
    nameEn: 'Osmosis Phenomenon',
    placeholderKo:
      '예: 반투과성 막을 사이에 두고 농도가 낮은 쪽에서 높은 쪽으로 물 분자가 이동하는 과정을 보여주세요. 막의 작은 구멍을 통해 물 분자만 통과하는 모습.',
  },
  {
    id: 'custom',
    nameKo: '직접 입력 (사용자 정의)',
    nameEn: 'Custom Input',
    placeholderKo:
      '입자 모형으로 표현하고 싶은 과학 개념을 자유롭게 설명해주세요. 예: 용해 현상에서 설탕 분자가 물 분자 사이사이로 퍼져 들어가는 모습을 보여주세요.',
  },
];

/** ID로 개념 찾기 */
export function findConceptById(id: string): ScienceConcept | undefined {
  return SCIENCE_CONCEPTS.find((c) => c.id === id);
}
