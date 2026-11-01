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
| 9 | 반응 동역학: 충돌·확산·전이상태 (Reaction Dynamics: Collisions, Diffusion, Transition States) | 충돌 밀도 계산기(N₂ z = 7.0×10⁹ s⁻¹), Boltzmann 꼬리 시각화, 입체 인자 표·작살 메커니즘 계산기, RRK Monte Carlo, 만남 쌍 QSSA, Smoluchowski 프로필·k_d = 8RT/3η 용매 비교, 상대 좌표 확산 검증, 라이브 3D Brownian 포획 시뮬레이션, 물질수지 식(확산·대류·반응)과 유한차분 검산, 반응–확산 길이, 진동 분배 함수·Eyring 실험실, TST = 충돌 이론 검증, 라이브 DLA/RLA 성장과 프랙탈 차원, Smoluchowski 응집 |
| 10 | 통계역학과 상분리 (Statistical Mechanics & Phase Separation) | Stirling 근사 계산기, 라이브 에너지 교환 게임(Boltzmann 분포·ln W 증가·βε 맞춤), Einstein 고체 정확한 세기, Lagrange 승수 유도, 2준위·조화 진동자 열역학(Schottky 봉우리), 요동 N^(−1/2)와 C_V = σ_E²/kT², 이원자 분자 분배 함수와 S°(N₂·O₂·CO·HCl·I₂, CODATA 비교), 앙상블 표, 대정준 Langmuir 흡착, 이상 기체 μ와 nΛ³, 원형/경기장 당구 에르고딕성, 혼합 자유 에너지·바이노달·스피노달 상평형도, 라이브 Kawasaki Monte Carlo(평균장 χ_c = 2 대 정확해 3.53), Cahn–Hilliard 선형 안정성, 라이브 CH/Allen–Cahn 128² 스펙트럼 시뮬레이션과 조대화 지수, 사례 연구 |

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
