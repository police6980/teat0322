import type { ScienceConcept } from '../types';

/** 과학 개념 프리셋 목록 */
export const SCIENCE_CONCEPTS: ScienceConcept[] = [
  {
    id: 'boyles-law',
    nameKo: '보일의 법칙 (압력-부피 관계)',
    nameEn: "Boyle's Law (Pressure-Volume Relationship)",
    placeholderKo:
      '압력과 부피가 변할 때 입자들이 어떻게 변하는지 설명해주세요.\n예: 압력이 높아지면 입자 사이 간격이 좁아지고 입자들이 더 빨리 충돌합니다. 압력이 낮아지면 입자들이 멀리 퍼져 천천히 움직입니다.',
  },
  {
    id: 'charles-law',
    nameKo: '샤를의 법칙 (온도-부피 관계)',
    nameEn: "Charles's Law (Temperature-Volume Relationship)",
    placeholderKo:
      '온도가 높아지거나 낮아질 때 입자들이 어떻게 변하는지 설명해주세요.\n예: 온도가 올라가면 입자들이 더 빠르게 움직여 공간을 더 많이 차지하고 부피가 커집니다. 온도가 낮아지면 입자들이 느려지고 가까이 모입니다.',
  },
  {
    id: 'states-of-matter',
    nameKo: '물질의 상태 변화 (고체/액체/기체)',
    nameEn: 'States of Matter (Solid/Liquid/Gas)',
    placeholderKo:
      '온도에 따라 물질의 상태가 어떻게 바뀌는지 입자 관점에서 설명해주세요.\n예: 온도가 낮으면 입자들이 규칙적으로 붙어 진동만 하고, 중간이면 자유롭게 흘러다니고, 높으면 빠르게 사방으로 퍼져나갑니다.',
  },
  {
    id: 'diffusion',
    nameKo: '확산 현상',
    nameEn: 'Diffusion Phenomenon',
    placeholderKo:
      '시간이 지나거나 온도가 변할 때 입자들이 어떻게 퍼져나가는지 설명해주세요.\n예: 처음에는 한쪽에 모여 있다가 시간이 지나면서 농도가 높은 곳에서 낮은 곳으로 입자들이 이동합니다. 온도가 높을수록 더 빠르게 퍼집니다.',
  },
  {
    id: 'osmosis',
    nameKo: '삼투 현상',
    nameEn: 'Osmosis Phenomenon',
    placeholderKo:
      '농도 차이와 압력에 따라 막을 사이에 둔 입자들이 어떻게 이동하는지 설명해주세요.\n예: 농도가 낮은 쪽의 물 입자들이 막을 통과해 높은 쪽으로 이동하고, 압력이 높아지면 이동이 멈춥니다.',
  },
  {
    id: 'custom',
    nameKo: '직접 입력 (사용자 정의)',
    nameEn: 'Custom Input',
    placeholderKo:
      '온도나 압력이 변할 때 입자들이 어떻게 행동하는지 설명해주세요.\n예: 온도가 올라갈수록 입자들이 더 빨리 움직이고, 압력이 높아질수록 입자들이 더 촘촘히 모입니다. 어떤 과학 개념이든 자유롭게 설명해주세요.',
  },
];

/** ID로 개념 찾기 */
export function findConceptById(id: string): ScienceConcept | undefined {
  return SCIENCE_CONCEPTS.find((c) => c.id === id);
}
