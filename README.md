# Physical Chemistry 2 — Interactive Learning Modules

**물리화학 2 인터랙티브 학습 웹앱**
성균관대학교 화학공학부 · Smart Process & Materials Design Lab (SPMDL) · Prof. S. Joon Kwon

Undergraduate Physical Chemistry 2 (quantum mechanics · spectroscopy · statistical
thermodynamics) course materials, built as a Vite + React single-page app.
Companion repo to [Fluid-Mechanics-ChE-Undergrad](https://github.com/sjoonkwon0531/Fluid-Mechanics-ChE-Undergrad).

## Weeks

| Week | Topic | Highlights |
|---|---|---|
| 1 | 양자역학의 탄생 (Birth of Quantum Mechanics) | Planck 법칙 탐색기, 최소작용 실험실, Helmholtz 2D 모드, 브라우저 내 Schrödinger FDM 고유값 솔버 |
| 2 | 파동역학과 행렬역학 (Wave Mechanics & Matrix Mechanics) | Gaussian 파속·분산 애니메이션, 계단/터널링 (FET·STM 실단위), 기저 전개·측정 실험실, 중첩상태 시간전개, 양자점 색 시뮬레이터, [X,P]=iℏ 교환자 실험실 |
| 3 | 조화진동자와 각운동량 (Harmonic Oscillator & Angular Momentum) | Hermite 고유상태 뷰어, 생성·소멸 연산자 실험실, 각운동량 교환자·벡터 모델, 구면조화함수 갤러리, 수소 원자 라디얼 함수·준위도 |
| 4 | 수소 원자, 스핀, 기체 수송현상 (Hydrogen Atom, Spin & Gas Transport) | Bohr 사다리·방출 스펙트럼 실험실(색 재현), 축퇴 2n² 카운터, Aufbau 전자배치 빌더, Stern-Gerlach 순차측정 MC, Zeeman 갈라짐, 운동론 입자상자·Maxwell-Boltzmann 분포, 평균자유행로·수송계수, Knudsen 분출(Cs 8.7 kPa) |
| 5 | 분자간 힘과 액체 (Intermolecular Forces & Liquids) | 쌍극자 벡터합성 실험실(다이클로로벤젠), Debye 플롯, van der Waals 계산기(Keesom·유도·London), 브라우저 라이브 2D Lennard-Jones MD + 실시간 g(r), Young-Laplace·모세관 시뮬레이터, 접촉각·Young 방정식, Kelvin 식·CMC |
| 6 | 고분자·자기조립과 화학 반응속도론 (Macromolecules, Self-Assembly & Chemical Kinetics) | 두 사슬·Schulz–Flory 분자량 실험실, Zimm 그림, 랜덤 코일 시뮬레이터(Rg·끝–끝 거리), 엔트로피 탄성, DLVO 실험실(염·전하수·임계 응집 농도), 미셀 CMC 모형, 초기 속도법 차수 맞히기, 적분 속도식, 완화법(T-jump), Arrhenius·촉매 |
| 복습 | 중간고사 복습 (Midterm Review, Weeks 1–6) | 주차 지도·자가 점검, 주차별 핵심 공식(검색·필터), 개념 퀴즈 24문항(즉시 채점·해설), 새 손계산 연습문제 13개(힌트·풀이), 2025 중간고사와 풀이, 상수표·자주 하는 실수, Python 검산 코드 |

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build (dist/)
```

## Structure

```
src/App.jsx          hub (landing + week registry)
src/WeekNNApp.jsx    self-contained weekly module (ko/en, tabs, live simulations)
src/WeekNNCodes.js   raw code strings shown in each module's Raw Codes tab
codes/               standalone hands-on codes (Python · MATLAB · Julia · C++)
docs/                integration guides
```

To add a week: import the module in `src/App.jsx`, add its metadata to `weeks`,
and register it in `comps` — three edits total (see `docs/WEEK01_INTEGRATION_GUIDE.md`).

**Language**: on first visit students choose **KOR / ENG** on a landing gate;
the choice persists (localStorage) and applies across the hub and every weekly
module. It can be switched anytime from the top-right toggle.

All simulations run client-side; no backend required. Deployed on Vercel.
