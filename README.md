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
| 11 | 반응 동역학과 결정 진동 (Reaction Dynamics & Lattice Vibrations) | 강체구·Lennard-Jones 궤적과 편향 함수 θ(b)(무지개 각 E* = 2에서 −65.3°, 영광 산란), 60 000개 입자 미분 단면적 히스토그램, LEPS H + H₂ 면(장벽 0.416 eV, 안장점 0.931 Å) 위 라이브 고전 궤적, 이른·늦은 장벽 Polanyi 실험(P = 1.00/0.50 대 0.00/0.44), 전자 전달 정상 상태 속도식, Marcus 포물선·역전 영역, 분자 내 k_ET 대 분자 간 k_r(확산 8RT/3η 한계), 단백질 터널링 거리 규칙, LJ 비조화성과 열팽창, 1D 사슬 정상 모드 애니메이션·Brillouin 영역 접힘, 모드 세기, 포논 열용량 대 Einstein, 이원자 사슬 음향·광학 가지와 띠 간격, 고유 벡터 애니메이션, 상태 밀도, 3D 모드 세기·Si Raman 520.2 cm⁻¹ |
| 12 | 고체의 열적 성질과 전자 띠 (Thermal Properties of Solids & Electronic Bands) | Planck 분포 유도와 진동 준위 점유 실험실(k_BT = ħω에서 ⟨n⟩ = 0.582), 모드 하나의 열용량, 상태 밀도, Einstein·Debye 모형 비교(θ_E = 0.775 θ_D), 3D k 공간 격자점 세기, T³ 법칙(1943.8 J mol⁻¹ K⁻¹)·로그 그래프, 금속 C/T 대 T²(Cu 교차 3.8 K), LN₂로 Cu 냉각 공정 사례(0.44 L/kg), LCAO 강결합 Hamiltonian·고리 Bloch 상태, 원자 간격에 따른 띠 형성, 유효 질량(0.610 m_e), 띠 채움과 전기장 속 전류, 결합 에너지 −(4t/π) sin(πf/2), 두 띠 겹침 금속–절연체 전이, d-띠 모형, 세포당 원자 둘 2×2 띠 간격, SSH 결합 교대·Peierls 불안정성, 실제 반도체 간격 표, TiO₂ 광촉매·전도성 고분자 사례 |
| 13 | 결정 구조, X선 회절과 역격자 (Crystal Structure, X-ray Diffraction & Reciprocal Lattice) | 격자 + 기저, 2D Bravais 격자 5종 만들기 실험실, 3D 결정계 7개·Bravais 격자 14개, SC·BCC·FCC 회전 입방 세포(충전율 0.524·0.680·0.740), Miller 지수(절편 → 역수 → 정수)와 입방 세포 속 (hkl) 면, Bragg 법칙 경로차와 N개 면 간섭, 강의 예제(d₁₁₁ = 396 pm, a = 687 pm), 분말 XRD 시뮬레이터(Cu·Pt·α-Fe·W·Si·NaCl·KCl·CsCl, Cu/Mo Kα), 미지 시료 지수 붙이기, Scherrer 식과 Pt 촉매 입자 크기, 1D 전자 밀도 Fourier 분해, 실공간·역격자 나란히 보기, Laue 조건 유도, Ewald 작도, 2D Wigner–Seitz 세포·제1 BZ, 고차 Brillouin 영역, 3D BZ(정육면체·마름모십이면체·깎은 팔면체), 영역 경계와 11·12주차 띠 간격의 연결, 구조 인자 유도와 위상 화살표, BCC·FCC·다이아몬드·NaCl·KCl 소멸 규칙, CuZn 질서–무질서 초격자선 |
| 14 | 고체의 결합, 표면 흡착과 불균일 촉매 (Bonding in Solids, Adsorption & Heterogeneous Catalysis) | hcp·ccp 층 쌓기 실험실(적층 결함 판정), 충전율 표(FCC 0.7405, 무작위 0.64, 타원체 0.7707, 정사면체 0.856), 반지름 비 구조 예측(Shannon 반지름), Madelung 상수 구 합 대 Evjen 합 수렴(NaCl 1.747565), Born–Mayer 퍼텐셜과 격자 에너지(NaF·NaCl·KCl·KBr·CsCl·MgO, Born–Haber 비교), 곡률에서 체적 탄성률(NaCl 21.9 GPa)·탄성 상수 계산기, Hückel π 준위(에틸렌~β-카로틴, 벤젠 비편재화 2|β|), N원자 사슬 띠 형성·상태 밀도·채움에 따른 금속/절연체, Bloch 강결합 띠, Fermi–Dirac·진성 Si 운반자, 충돌 선속 유도·단일층 시간(UHV, Langmuir 단위), 물리/화학 흡착, Langmuir 유도·CO/숯 맞춤(V∞ = 111 cm³), 등량 엔탈피(−7.5 kJ/mol), 표면 분석 기법 표, BET 유도·N₂/루타일 맞춤(c ≈ 300)·비표면적, Freundlich·Temkin, 전구체 상태 퍼텐셜 곡선, TPD 시뮬레이터·Redhead 식, 표면 확산 길이와 마구걷기, 단분자·LH·ER 속도식과 LH 최대, Sabatier 화산 그래프, d-띠 중심 이론, Haber–Bosch·3원 촉매·CVD/ALD 사례 |
| 15 | 불안정성이 만드는 패턴과 전극 과정 (Pattern Formation by Instability & Processes at Electrodes) | 활성·억제와 양·음의 되먹임, Turing 아이디어의 역사(1952–1995), 선형화와 Jacobian, λ² − Tλ + Δ = 0 유도, 대각합–행렬식 지도와 위상 평면 실험실, Turing 불안정성 조건 유도(분산 관계, k*² = γ(dR₁₁ + R₂₂)/2d), 강의 모형 f = k(16 − ab), g = k(ab − b − 12)의 임계 확산 비 D_a/D_b = 4와 가장 빨리 자라는 파장 6.5칸, 실시간 2D Turing 시뮬레이션, CIMA·Pomacanthus·잡종 무늬·Turing 구조 나노여과막 사례, 실시간 Gray–Scott(점 분열·미로·산호·파동·소멸), 포식자–피식자 모형과 Hopf 분기(풍요의 역설), Gierer–Meinhardt 1D 시공간 그림, 네 모형 비교, Helmholtz·Gouy–Chapman·Stern 이중층, Poisson–Boltzmann 유도와 Debye 길이, Gouy–Chapman 전위·이온 분포·Grahame 표면 전하 실험실, Stern 직렬 용량과 슈퍼커패시터, Butler–Volmer 유도와 α·j₀ 실험실, Tafel 분석(j₀ = 2.4 mA/cm², α = 0.58), 순환 전압전류법 시뮬레이터(봉우리 간격 58 mV, Randles–Sevcik), 전지·전해조 분극 곡선, 강의 예제 세 가지 |

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
