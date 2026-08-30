# Week 1 통합 가이드 — 물리화학 2 신규 레포

## A. 신규 레포 생성 (최초 1회)

1. GitHub에 새 레포 생성 (예: `Physical-Chemistry-2-ChE-Undergrad`)
2. `scaffold/`의 내용물을 레포 루트에 복사:
   ```
   index.html  package.json  vite.config.js  src/main.jsx  src/App.jsx
   ```
3. 이 패키지의 `src/Week01App.jsx`, `src/Week01Codes.js`를 레포 `src/`에 복사
4. 로컬 확인:
   ```bash
   npm install
   npm run dev        # http://localhost:5173
   npm run build      # 배포 전 빌드 확인 (이 패키지는 vite 6.4 기준 빌드 검증 완료)
   ```
5. Vercel에서 해당 레포 Import → Framework preset: **Vite** → Deploy.
   이후 `git push`마다 자동 재배포됩니다 (유체역학 레포와 동일).

## B. 이후 주차 추가 방법 (매주 반복)

`src/App.jsx`에서 세 곳만 수정합니다:

```jsx
// 1) import 추가
import Week02App from "./Week02App";

// 2) weeks 메타데이터 (ko / en 배열 각각)
{ id: 2, title: "Week 2", subtitle: "…", topics: […], color: "#38bdf8" },

// 3) 컴포넌트 레지스트리
const comps = { 1: Week01App, 2: Week02App };
```

주차 모듈은 `window.__backToHome()` 또는 `onBack` prop으로 허브 복귀를 처리합니다
(Week01App.jsx 헤더 참조).

## C. 파일별 역할

| 파일 | 역할 | 수정 시점 |
|---|---|---|
| `src/App.jsx` | 랜딩 + 주차 라우팅 | 주차 추가 시 |
| `src/Week01App.jsx` | 1주차 전체 (탭 8개, i18n, 시뮬레이션) | 콘텐츠 수정 시 |
| `src/Week01Codes.js` | Raw 코드 탭에 표시되는 코드 문자열 | codes/ 수정 후 재생성 |
| `codes/` | 학생 배포용 standalone 파일 | 원본 — 여기를 먼저 수정 |

`Week01Codes.js`는 `codes/`의 파일에서 자동 생성되었습니다(백틱·`${}` 이스케이프 처리).
코드를 수정할 때는 standalone 파일을 고친 뒤 동일한 규칙으로 재생성하는 것을 권장합니다.

## D. 검증 체크리스트 (완료 상태)

- [x] `npm run build` 성공 (vite 6.4.3, 248 kB / gzip 84 kB)
- [x] esbuild JSX 문법 검사 통과 (Week01App.jsx, App.jsx)
- [x] Python 4종 실행 검증 (numpy 1.x/2.x 호환 trapz 별칭 포함)
- [x] C++ 4종 g++ -O2 -std=c++17 컴파일·실행 검증
- [x] 물리 검증: Wien 2898 μm·K / σT⁴ 비율 1.00000 / 무한우물·조화 고유값 해석해 일치
- [x] 브라우저 내 tql2 고유값 솔버: 고유값 정확도 + 고유벡터 직교성(~10⁻¹⁶) 확인

## E. 주의 사항

- `Week01App.jsx`는 외부 라이브러리 의존이 없습니다(react만 사용). katex/recharts를
  쓰는 주차가 생기면 유체역학 레포처럼 `package.json`에 추가하세요.
- 폰트는 Google Fonts CDN에서 로드합니다(DM Sans, Space Grotesk, JetBrains Mono, Noto Sans KR).
- Schrödinger 탭의 고유값 솔버는 N ≤ 200에서 즉각 반응하도록 설계했습니다.
  N을 더 키우려면 `Slider`의 `max`를 조정하면 되지만 O(N²)~O(N³) 비용을 고려하세요.
