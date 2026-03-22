# SciViz — 과학 개념 시각화 AI

중학교/고등학교 과학 수업에서 학생들이 입자 모형으로 설명한 과학 개념을 Gemini AI로 즉시 시각화해주는 교육용 웹 애플리케이션입니다.

## 주요 기능

- **과학 개념 프리셋**: 보일의 법칙, 샤를의 법칙, 물질의 상태 변화, 확산 현상, 삼투 현상 등
- **AI 자동 번역 + 이미지 생성**: 한국어 설명 → 영어 번역 → 입자 모형 이미지 생성
- **세션 갤러리**: 현재 세션에서 생성된 이미지 최대 10개 보관
- **이미지 다운로드 / 클립보드 복사**
- **프롬프트 투명성**: 교사가 AI에게 어떤 요청을 했는지 확인 가능
- **다크/라이트 모드**
- **보안**: API 키는 sessionStorage에만 저장 (탭 닫으면 삭제)

## 기술 스택

| 항목 | 버전 |
|------|------|
| React | 18 |
| TypeScript | 5.x |
| Vite | 5.x |
| Tailwind CSS | v3 |
| @google/generative-ai | 최신 |

## 로컬 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 후 Gemini API 키를 입력하면 시작됩니다.

### Gemini API 키 발급

1. [Google AI Studio](https://aistudio.google.com/app/apikey) 접속
2. API 키 생성
3. 앱 시작 시 입력 (AIza로 시작하는 형식)

## 빌드

```bash
npm run build
```

빌드 결과는 `dist/` 폴더에 생성됩니다.

## Netlify 배포 방법

### 방법 1: Netlify CLI

```bash
npm run build
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

### 방법 2: Netlify 대시보드

1. [netlify.com](https://netlify.com) 접속 및 로그인
2. "New site from Git" 클릭
3. GitHub 레포지토리 연결
4. 빌드 설정 (자동으로 `netlify.toml` 감지):
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Deploy 클릭

### 방법 3: 드래그 앤 드롭

```bash
npm run build
```

빌드 후 `dist/` 폴더를 Netlify 대시보드에 드래그 앤 드롭합니다.

## 파일 구조

```
src/
├── components/
│   ├── ApiKeyModal.tsx        # API 키 입력 모달
│   ├── ConceptSelector.tsx    # 개념 선택 드롭다운
│   ├── ImageGenerator.tsx     # 이미지 생성 핵심 컴포넌트
│   ├── ImageGallery.tsx       # 세션 갤러리
│   └── LoadingAnimation.tsx   # 입자 로딩 애니메이션
├── hooks/
│   ├── useGeminiApi.ts        # Gemini API 호출 커스텀 훅
│   └── useApiKey.ts           # API 키 세션 관리 훅
├── utils/
│   ├── promptBuilder.ts       # 프롬프트 생성 로직
│   └── scienceConcepts.ts     # 과학 개념 프리셋 데이터
├── types/
│   └── index.ts               # 공통 타입 정의
└── App.tsx
public/
└── _redirects                 # Netlify SPA 라우팅
netlify.toml                   # Netlify 배포 설정
```

## 사용 모델

| 용도 | 모델 |
|------|------|
| 한국어 → 영어 번역 | `gemini-2.0-flash` |
| 입자 모형 이미지 생성 | `gemini-2.0-flash-preview-image-generation` |

모델명은 `src/types/index.ts`의 상수로 분리되어 있어 쉽게 교체 가능합니다.

## 보안 참고사항

- API 키는 **sessionStorage에만 저장** (localStorage 사용 안 함)
- 브라우저 탭을 닫으면 API 키가 자동 삭제됩니다
- 모든 API 호출은 브라우저에서 직접 수행 (서버 없음)
- API 키가 서버로 전송되지 않습니다
