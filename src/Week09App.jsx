// ============================================================
// Week09App.jsx — Reaction Dynamics
// Physical Chemistry 2 (물리화학 2)
// SKKU School of Chemical Engineering
// Smart Process & Materials Design Lab (SPMDL)
// Prof. S. Joon Kwon
// ------------------------------------------------------------
// Topics covered (Wk09 Part 1):
//   • Collision theory — reactive encounters, collision density Z_AB,
//     energy requirement (Boltzmann factor), steric factor P, σ* = Pσ
//   • RRK model — P = (1 − E*/E)^(s−1), thermal average k(T) = ν e^(−E0/kT)
//   • Reactions in solution — encounter pairs (QSSA), diffusion- vs.
//     activation-controlled limits, Smoluchowski k_d = 4πR*(D_A+D_B)N_A,
//     Stokes–Einstein k_d = 8RT/3η, relative-coordinate diffusion
//   • Material-balance equation — diffusion, convection, reaction
//   • Transition state theory — Eyring equation, partition functions,
//     q_vib → kT/hν, recovering collision theory
//   • Diffusion-limited aggregation (DLA / RLA), Smoluchowski coagulation
// ============================================================
import { useState, useEffect, useRef } from "react";
import {
  PY_COLL, ML_COLL, JL_COLL, CPP_COLL,
  PY_DIFF, ML_DIFF, JL_DIFF, CPP_DIFF,
  PY_TST, ML_TST, JL_TST, CPP_TST,
  PY_DLA, ML_DLA, JL_DLA, CPP_DLA,
} from "./Week09Codes";

// ── i18n ─────────────────────────────────────────────────────
const i18n = {
  ko: {
    weekTitle: "Week 9 — 반응 동역학: 충돌·확산·전이상태",
    subtitle: "충돌 이론 · 입체 인자 · RRK · 확산 지배 반응 · 물질수지 식 · Eyring 식 · DLA",
    tabs: {
      overview: "개요",
      collision: "충돌 이론 & RRK",
      solution: "용액 반응 & 확산 지배",
      transport: "물질수지 식",
      tst: "전이상태 이론",
      aggregation: "확산 지배 응집",
      practice: "연습문제",
      codes: "Raw 코드",
    },
  },
  en: {
    weekTitle: "Week 9 — Reaction Dynamics: Collisions, Diffusion, Transition States",
    subtitle: "Collision theory · Steric factor · RRK · Diffusion control · Material balance · Eyring equation · DLA",
    tabs: {
      overview: "Overview",
      collision: "Collisions & RRK",
      solution: "Reactions in Solution",
      transport: "Material Balance",
      tst: "Transition State Theory",
      aggregation: "Aggregation (DLA)",
      practice: "Practice",
      codes: "Raw Codes",
    },
  },
};

// ── design tokens (Week 9 accent: teal) ──────────────────────
const C = {
  bg: "#0b0f17",
  panel: "#111827",
  card: "#1f2937",
  border: "#374151",
  text: "#e5e7eb",
  textDim: "#9ca3af",
  accent: "#2dd4bf",
  accentSoft: "#5eead4",
  amber: "#f59e0b",
  sky: "#38bdf8",
  blueSoft: "#60a5fa",
  ok: "#10b981",
  err: "#ef4444",
  purple: "#a78bfa",
  lime: "#a3e635",
  pink: "#f472b6",
};

// physical constants (SI)
const KB = 1.380649e-23;
const NAV = 6.02214076e23;
const HPL = 6.62607015e-34;
const HBAR = HPL / (2 * Math.PI);
const RGAS = 8.314462618;
const AMU = 1.66053906660e-27;
const C2RAD = 1.438776877e-2;          // hc/k [m K]

// =============================================================
// MAIN COMPONENT
// =============================================================
export default function Week09App({ onBack, lang: langProp, onLangChange }) {
  const [langLocal, setLangLocal] = useState(langProp || "ko");
  const lang = langProp != null ? langProp : langLocal;
  const setLang = k => {
    setLangLocal(k);
    if (onLangChange) onLangChange(k);
  };
  const [tab, setTab] = useState("overview");
  const t = i18n[lang];
  const tabs = Object.entries(t.tabs);

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'DM Sans','Noto Sans KR',-apple-system,sans-serif",
      paddingBottom: 60,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Noto+Sans+KR:wght@400;500;700&display=swap');
        *{box-sizing:border-box}
        input[type=range]{accent-color:${C.accent}}
        ::-webkit-scrollbar{height:8px;width:8px}
        ::-webkit-scrollbar-thumb{background:#374151;border-radius:4px}
      `}</style>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(11,15,23,0.92)", backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${C.border}`, padding: "14px 20px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <button
            onClick={() => (onBack ? onBack() : window.__backToHome && window.__backToHome())}
            style={{ ...btnStyle(), padding: "8px 14px" }}>
            ← Home
          </button>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif" }}>
              {t.weekTitle}
            </div>
            <div style={{ fontSize: 12, color: C.textDim }}>{t.subtitle}</div>
          </div>
          <div style={{ display: "flex", gap: 4, background: C.panel, borderRadius: 10, padding: 4, border: `1px solid ${C.border}` }}>
            {[["ko", "한국어"], ["en", "EN"]].map(([k, lb]) => (
              <button key={k} onClick={() => setLang(k)} style={{
                padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                background: lang === k ? C.accent : "transparent",
                color: lang === k ? "#0b0f17" : C.textDim,
                fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace",
              }}>{lb}</button>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: "10px auto 0", display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
          {tabs.map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} style={tabBtnStyle(tab === k)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "24px auto 0", padding: "0 20px" }}>
        {tab === "overview" && <Overview lang={lang} />}
        {tab === "collision" && <CollisionTab lang={lang} />}
        {tab === "solution" && <SolutionTab lang={lang} />}
        {tab === "transport" && <TransportTab lang={lang} />}
        {tab === "tst" && <TstTab lang={lang} />}
        {tab === "aggregation" && <AggregationTab lang={lang} />}
        {tab === "practice" && <Practice lang={lang} />}
        {tab === "codes" && <RawCodes lang={lang} />}
      </div>
    </div>
  );
}

// =============================================================
// SHARED UI PRIMITIVES (repo pattern; headings are Hd/HdSub)
// =============================================================
function btnStyle(active = false) {
  return {
    padding: "8px 16px", borderRadius: 10, cursor: "pointer",
    background: active ? C.accent : C.panel,
    color: active ? "#0b0f17" : C.text,
    border: `1px solid ${active ? C.accent : C.border}`,
    fontSize: 13, fontWeight: 600,
    fontFamily: "'DM Sans','Noto Sans KR',sans-serif",
    transition: "all 0.15s",
  };
}
function tabBtnStyle(active) {
  return {
    padding: "8px 14px", borderRadius: 10, cursor: "pointer", whiteSpace: "nowrap",
    background: active ? "rgba(45,212,191,0.14)" : "transparent",
    color: active ? C.accentSoft : C.textDim,
    border: `1px solid ${active ? "rgba(45,212,191,0.4)" : "transparent"}`,
    fontSize: 13, fontWeight: 700,
  };
}
function Card({ children, style }) {
  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14,
      padding: "20px 22px", marginBottom: 18, ...style,
    }}>{children}</div>
  );
}
function Hd({ children }) {
  return <h2 style={{
    fontSize: 20, fontWeight: 800, margin: "0 0 12px",
    fontFamily: "'Space Grotesk','Noto Sans KR',sans-serif", color: C.text,
  }}>{children}</h2>;
}
function HdSub({ children }) {
  return <h3 style={{ fontSize: 15, fontWeight: 700, margin: "16px 0 8px", color: C.accentSoft }}>{children}</h3>;
}
function Eq({ children, style }) {
  return (
    <div style={{
      background: "#0d1117", border: `1px solid ${C.border}`, borderRadius: 10,
      padding: "12px 16px", margin: "10px 0",
      fontFamily: "'JetBrains Mono',monospace", fontSize: 14, lineHeight: 1.8,
      color: C.accentSoft, overflowX: "auto", whiteSpace: "nowrap", ...style,
    }}>{children}</div>
  );
}
function Slider({ label, value, min, max, step, onChange, unit, width, fmt }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: C.text, minWidth: 0 }}>
      <span style={{ color: C.textDim, whiteSpace: "nowrap" }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: width || 140 }} />
      <span style={{ fontFamily: "'JetBrains Mono',monospace", color: C.accentSoft, whiteSpace: "nowrap", minWidth: 58 }}>
        {fmt ? fmt(value) : value}{unit || ""}
      </span>
    </label>
  );
}
function Note({ children }) {
  return <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.7, margin: "8px 0" }}>{children}</p>;
}
function Pill({ color, children }) {
  return <span style={{
    display: "inline-block", padding: "2px 10px", borderRadius: 999,
    background: `${color}22`, color, fontSize: 11, fontWeight: 700,
    border: `1px solid ${color}55`, marginRight: 6, marginBottom: 4,
  }}>{children}</span>;
}
function Stat({ label, value, color }) {
  return (
    <div style={{ background: C.card, borderRadius: 10, padding: "10px 14px", border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
function StatGrid({ children, min }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit,minmax(${min || 170}px,1fr))`, gap: 10, margin: "8px 0 12px" }}>
      {children}
    </div>
  );
}
function Row({ children }) {
  return <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", margin: "8px 0" }}>{children}</div>;
}
function plotScale(xMin, xMax, yMin, yMax, W, Ht, pad) {
  const X = x => pad + (W - 2 * pad) * (x - xMin) / (xMax - xMin || 1);
  const Y = y => Ht - pad - (Ht - 2 * pad) * (y - yMin) / (yMax - yMin || 1);
  return { X, Y };
}
function pathOf(pts, X, Y) {
  return pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${X(x).toFixed(2)} ${Y(y).toFixed(2)}`).join(" ");
}
const svgBox = W => ({ background: "#0d1117", borderRadius: 10, border: `1px solid ${C.border}`, flex: `1 1 ${Math.min(W, 380)}px`, maxWidth: "100%", height: "auto" });
const fullSvg = W => ({ ...svgBox(W), flex: "none", width: "100%", maxWidth: W });
const mono = "'JetBrains Mono',monospace";
const sci = (v, d = 2) => {
  if (!isFinite(v) || v === 0) return "0";
  const e = Math.floor(Math.log10(Math.abs(v)));
  const sup = String(e).replace(/-/g, "⁻").replace(/\d/g, ch => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+ch]);
  return `${(v / Math.pow(10, e)).toFixed(d)}×10${sup}`;
};
function linfit(xs, ys) {
  const n = xs.length;
  let sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0;
  for (let i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; sxx += xs[i] * xs[i]; sxy += xs[i] * ys[i]; syy += ys[i] * ys[i]; }
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const icpt = (sy - slope * sx) / n;
  const r = (n * sxy - sx * sy) / Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy));
  return { slope, icpt, r2: r * r };
}
// seeded PRNG (mulberry32) so simulations are reproducible
function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gaussFrom(rand) {
  let spare = null;
  return () => {
    if (spare !== null) { const s = spare; spare = null; return s; }
    let u = 0, v = 0;
    while (u === 0) u = rand();
    v = rand();
    const m = Math.sqrt(-2 * Math.log(u));
    spare = m * Math.sin(2 * Math.PI * v);
    return m * Math.cos(2 * Math.PI * v);
  };
}
function Axes({ W, Ht, pad, xlabel, ylabel }) {
  return (
    <g>
      <line x1={pad} y1={Ht - pad} x2={W - pad} y2={Ht - pad} stroke="#334155" />
      <line x1={pad} y1={pad - 6} x2={pad} y2={Ht - pad} stroke="#334155" />
      {xlabel && <text x={W / 2} y={Ht - 10} fill={C.textDim} fontSize={11} textAnchor="middle">{xlabel}</text>}
      {ylabel && <text x={14} y={pad - 14} fill={C.textDim} fontSize={11}>{ylabel}</text>}
    </g>
  );
}

// =============================================================
// 1) OVERVIEW
// =============================================================
function Overview({ lang }) {
  const isKo = lang === "ko";
  const timeline = [
    { yr: "1889", who: "Arrhenius", ko: "k = A e^(−Ea/RT): 경험식으로 시작한 반응 속도의 온도 의존성", en: "k = A e^(−Ea/RT): the temperature dependence of rates, first as an empirical law", c: C.amber },
    { yr: "1905", who: "Einstein · Sutherland", ko: "Stokes–Einstein 관계 D = kT/6πηR: 확산 계수와 점도를 잇다", en: "Stokes–Einstein relation D = kT/6πηR links diffusion to viscosity", c: C.sky },
    { yr: "1916–18", who: "Trautz · Lewis", ko: "충돌 이론: A를 분자 크기와 평균 속력으로 계산하다", en: "Collision theory: A computed from molecular size and mean speed", c: C.accent },
    { yr: "1917", who: "Smoluchowski", ko: "확산 지배 충돌 속도 4πR*D와 응집 방정식", en: "Diffusion-limited encounter rate 4πR*D and the coagulation equation", c: C.sky },
    { yr: "1927–28", who: "Rice · Ramsperger · Kassel", ko: "RRK 모형: 에너지가 여러 진동 모드에 퍼지면 반응이 늦어진다", en: "RRK model: energy spread over many modes slows the reaction", c: C.purple },
    { yr: "1935", who: "Eyring · Evans · Polanyi", ko: "전이상태 이론: 활성화 착물과의 준평형", en: "Transition state theory: quasi-equilibrium with the activated complex", c: C.pink },
    { yr: "1981", who: "Witten · Sander", ko: "확산 지배 응집(DLA): 무작위 걸음이 프랙탈을 만든다", en: "Diffusion-limited aggregation: random walks build fractals", c: C.lime },
    { yr: "1986", who: "Herschbach · Lee · Polanyi", ko: "분자선으로 본 반응 동역학 (K + Br₂ '작살' 메커니즘) — 노벨 화학상", en: "Reaction dynamics with molecular beams (the K + Br₂ 'harpoon') — Nobel Prize", c: C.accent },
    { yr: "1999", who: "Zewail", ko: "펨토초 분광으로 전이상태를 '보다' — 노벨 화학상", en: "Femtosecond spectroscopy 'sees' the transition state — Nobel Prize", c: C.pink },
  ];
  return (
    <div>
      <Card>
        <Hd>{isKo ? "6주차의 질문을 한 단계 더: A와 Ea는 어디서 오는가" : "Week 6's question, one level deeper: where do A and Ea come from?"}</Hd>
        <Note>
          {isKo
            ? "6주차에서 Arrhenius 식 k = A e^(−Ea/RT)를 실험 데이터에 맞춰 A와 Ea를 구했습니다. 이번 주에는 그 두 숫자를 분자 수준에서 계산합니다. 세 가지 그림이 있습니다. 첫째, 기체 반응은 분자끼리 부딪혀야 일어나므로 충돌 빈도(4주차 기체 운동론)와 에너지 조건(Boltzmann 인자)과 방향 조건(입체 인자 P)을 곱하면 속도 상수가 됩니다. 둘째, 용액에서는 분자가 용매에 갇혀 있으므로 먼저 확산으로 서로 만나야 합니다. 만나기만 하면 반응하는 경우 속도는 점도로 정해집니다(확산 지배). 셋째, 전이상태 이론은 장벽 꼭대기의 '활성화 착물'을 하나의 분자처럼 다루고 분배 함수로 그 농도를 셉니다. 마지막으로 반응 대신 '달라붙기'가 일어나면 같은 확산 수학이 프랙탈 응집체(DLA)를 만듭니다."
            : "In Week 6 we fitted the Arrhenius equation k = A e^(−Ea/RT) to data to find A and Ea. This week we compute those two numbers from molecular properties, using three pictures. First, a gas-phase reaction needs a collision, so the rate constant is the collision rate (Week 4 kinetic theory) times an energy condition (the Boltzmann factor) times an orientation condition (the steric factor P). Second, in solution the molecules are caged by solvent and must first meet by diffusion; if every meeting leads to reaction, the viscosity sets the rate (diffusion control). Third, transition state theory treats the 'activated complex' at the top of the barrier as a molecule in its own right and counts its population with partition functions. Finally, when particles stick instead of react, the same diffusion mathematics builds fractal aggregates (DLA)."}
        </Note>
        <FlowDiagram isKo={isKo} />
      </Card>

      <Card>
        <Hd>{isKo ? "이번 주 연대기" : "Timeline of this week's ideas"}</Hd>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {timeline.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: e.c, marginTop: 5 }} />
                {i < timeline.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 28, background: C.border }} />}
              </div>
              <div style={{ paddingBottom: 16 }}>
                <span style={{ fontFamily: mono, fontSize: 12, color: e.c, fontWeight: 700, marginRight: 10 }}>{e.yr}</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{e.who}</span>
                <div style={{ fontSize: 13, color: C.textDim, marginTop: 2 }}>{isKo ? e.ko : e.en}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Hd>{isKo ? "이번 주 핵심 방정식 4개" : "Four key equations this week"}</Hd>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
          {[
            { name: isKo ? "충돌 이론" : "Collision theory", eq: "k_r = Pσ (8kT/πμ)^½ N_A e^(−Ea/RT)", c: C.accent },
            { name: isKo ? "RRK 입체 인자" : "RRK steric factor", eq: "P = (1 − E*/E)^(s−1)", c: C.purple },
            { name: isKo ? "확산 지배 속도 상수" : "Diffusion-controlled rate", eq: "k_d = 4πR*(D_A+D_B)N_A = 8RT/3η", c: C.sky },
            { name: isKo ? "Eyring 식" : "Eyring equation", eq: "k_r = κ (kT/h)(RT/p°) K̄‡", c: C.pink },
          ].map((k, i) => (
            <div key={i} style={{ background: C.card, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: k.c, marginBottom: 6 }}>{k.name}</div>
              <div style={{ fontFamily: mono, fontSize: 13, color: C.text }}>{k.eq}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Hd>{isKo ? "학습 목표" : "Learning outcomes"}</Hd>
        {[
          isKo ? "충돌 단면적 σ, 환산 질량 μ, 상대 속력 (8kT/πμ)^½로 충돌 밀도 Z_AB와 이론적 A를 계산할 수 있다." : "Compute the collision density Z_AB and the theoretical A from the cross-section σ, reduced mass μ, and relative speed (8kT/πμ)^½.",
          isKo ? "입체 인자 P = A_exp/A_theory를 구하고, P ≪ 1과 P > 1(작살 메커니즘)을 분자 수준에서 설명할 수 있다." : "Obtain the steric factor P = A_exp/A_theory and explain both P ≪ 1 and P > 1 (the harpoon mechanism) at the molecular level.",
          isKo ? "에너지를 s개 모드에 무작위로 나누는 RRK 모형에서 P = (1 − E*/E)^(s−1)을 유도하고, 열평균이 다시 Arrhenius 인자를 줌을 보일 수 있다." : "Derive P = (1 − E*/E)^(s−1) from the RRK picture of energy shared at random among s modes, and show that the thermal average returns the Arrhenius factor.",
          isKo ? "만남 쌍에 준정상 상태 근사를 적용해 k_r = k_a k_d/(k_a + k_d′)를 얻고, 확산 지배와 활성화 지배 극한을 구분할 수 있다." : "Apply the steady-state approximation to the encounter pair to get k_r = k_a k_d/(k_a + k_d′) and distinguish the diffusion- and activation-controlled limits.",
          isKo ? "흡수 구 주위의 정상 확산을 풀어 k_d = 4πR*D N_A를 얻고, Stokes–Einstein으로 k_d = 8RT/3η를 계산할 수 있다." : "Solve steady diffusion around an absorbing sphere to get k_d = 4πR*D N_A, and use Stokes–Einstein to evaluate k_d = 8RT/3η.",
          isKo ? "확산·대류·반응이 함께 있는 물질수지 식을 세우고, 펄스 해의 양·평균·분산이 각각 e^(−kt), vt, 2Dt임을 해석할 수 있다." : "Write the material-balance equation with diffusion, convection, and reaction, and interpret the amount, mean, and variance of the pulse solution as e^(−kt), vt, and 2Dt.",
          isKo ? "분배 함수로 활성화 착물의 농도를 세어 Eyring 식을 유도하고, 원자 두 개의 경우 충돌 이론과 정확히 같아짐을 보일 수 있다." : "Derive the Eyring equation by counting the activated complex with partition functions, and show it reduces exactly to collision theory for two atoms.",
          isKo ? "부착 확률 α에 따라 DLA와 RLA의 구조가 어떻게 달라지는지 프랙탈 차원으로 설명할 수 있다." : "Explain with the fractal dimension how the sticking probability α changes DLA into RLA.",
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8, fontSize: 13.5, color: C.text, lineHeight: 1.6 }}>
            <span style={{ color: C.accent, fontWeight: 800 }}>{i + 1}.</span><span>{s}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function FlowDiagram({ isKo }) {
  const steps = [
    { t: isKo ? "충돌" : "Collision", s: "Z_AB · e^(−Ea/RT) · P", c: C.accent },
    { t: "RRK", s: "(1 − E*/E)^(s−1)", c: C.purple },
    { t: isKo ? "용액·확산" : "Solution · diffusion", s: "4πR*D N_A", c: C.sky },
    { t: isKo ? "전이상태" : "Transition state", s: "κ kT/h · K‡", c: C.pink },
    { t: isKo ? "응집" : "Aggregation", s: "DLA · d_f", c: C.lime },
  ];
  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 0, flexWrap: "wrap", marginTop: 10 }}>
      {steps.map((st, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div style={{
            background: C.card, border: `1px solid ${st.c}55`, borderRadius: 12,
            padding: "10px 14px", minWidth: 128, textAlign: "center",
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: st.c }}>{st.t}</div>
            <div style={{ fontSize: 11, color: C.textDim, fontFamily: mono, marginTop: 3 }}>{st.s}</div>
          </div>
          {i < steps.length - 1 && <div style={{ color: C.textDim, padding: "0 8px", fontSize: 18 }}>→</div>}
        </div>
      ))}
    </div>
  );
}

// =============================================================
// 2) COLLISION THEORY & RRK
// =============================================================
function CollisionTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <Card>
        <Hd>{isKo ? "반응하려면 먼저 부딪혀야 한다" : "To react, molecules must first collide"}</Hd>
        <Eq>{"A + B → P,   v = k_r[A][B]      v ∝ σ* (T/M)^½ [A][B] e^(−E′/RT)      k_r ∝ (P) × {σ (T/M)^½} × (e^(−E′/RT))"}</Eq>
        <Note>
          {isKo
            ? "강의 첫 장의 마지막 줄이 이번 탭의 요약입니다. 속도 상수는 세 인자의 곱입니다. 가운데 {σ(T/M)^½}는 '얼마나 자주 만나는가'(충돌 빈도), 오른쪽 e^(−E′/RT)는 '만났을 때 에너지가 충분한가'(Boltzmann 인자), 왼쪽 P는 '방향이 맞는가'(입체 인자)입니다. 반응 속도가 두 농도의 곱 [A][B]에 비례하는 이유도 여기서 나옵니다. A 하나가 B를 만나는 빈도는 B의 개수 밀도에 비례하고, 그런 A가 [A]만큼 있기 때문입니다."
            : "The last line of the first lecture slide summarises this whole tab. The rate constant is a product of three factors. The middle one, {σ(T/M)^½}, says how often molecules meet (the collision rate); e^(−E′/RT) says whether a meeting carries enough energy (the Boltzmann factor); and P says whether the orientation is right (the steric factor). It also explains why the rate is proportional to the product [A][B]: one A meets B at a rate proportional to the number density of B, and there are [A] such A molecules."}
        </Note>
      </Card>
      <CollisionDensityLab isKo={isKo} />
      <EnergyTailLab isKo={isKo} />
      <StericCard isKo={isKo} />
      <RRKLab isKo={isKo} />
    </div>
  );
}

function CollisionDensityLab({ isKo }) {
  const [T, setT] = useState(298);
  const [p, setP] = useState(1.0);           // bar
  const [sig, setSig] = useState(0.43);      // nm^2
  const [M, setM] = useState(28.0);          // g/mol
  const m = M * 1e-3 / NAV;
  const n = p * 1e5 / (KB * T);
  const cbar = Math.sqrt(8 * KB * T / (Math.PI * m));
  const crel = Math.SQRT2 * cbar;
  const s = sig * 1e-18;
  const z = s * crel * n;
  const ZAA = 0.5 * s * crel * n * n;
  const lam = 1 / (Math.SQRT2 * s * n);
  const Ath = s * crel * NAV * 1e3;
  const d = Math.sqrt(sig / Math.PI);
  // geometry sketch
  const W = 640, Ht = 220;
  const rPx = 34, dPx = 2 * rPx;
  return (
    <Card>
      <Hd>{isKo ? "충돌 밀도 계산기: 1초에 몇 번 부딪히는가" : "Collision-density calculator: how many collisions per second?"}</Hd>
      <Eq>{"Z_AB = σ (8kT/πμ)^½ N_A²[A][B]      σ = πd²,  d = ½(d_A + d_B),  μ = m_A m_B/(m_A + m_B)      Z_AA = ½ σ (16kT/πm_A)^½ N_A²[A]²"}</Eq>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <circle cx={200} cy={110} r={rPx} fill="rgba(245,158,11,0.25)" stroke={C.amber} strokeWidth={2} />
        <text x={200} y={115} fill={C.amber} fontSize={14} textAnchor="middle" fontWeight={700}>A</text>
        <ellipse cx={200} cy={110} rx={14} ry={dPx} fill="rgba(45,212,191,0.10)" stroke={C.accent} strokeDasharray="4 3" />
        <line x1={30} y1={110 - dPx} x2={600} y2={110 - dPx} stroke={C.accent} strokeDasharray="2 5" opacity={0.6} />
        <line x1={30} y1={110 + dPx} x2={600} y2={110 + dPx} stroke={C.accent} strokeDasharray="2 5" opacity={0.6} />
        <circle cx={430} cy={110 - rPx * 1.3} r={rPx} fill="rgba(56,189,248,0.22)" stroke={C.sky} strokeWidth={2} />
        <text x={430} y={110 - rPx * 1.3 + 5} fill={C.sky} fontSize={14} textAnchor="middle" fontWeight={700}>B</text>
        <line x1={470} y1={110 - rPx * 1.3} x2={540} y2={110 - rPx * 1.3} stroke={C.sky} strokeWidth={2} markerEnd="url(#arw9)" />
        <defs>
          <marker id="arw9" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 z" fill={C.sky} />
          </marker>
        </defs>
        <line x1={110} y1={110 - dPx} x2={110} y2={110 + dPx} stroke={C.text} />
        <text x={100} y={114} fill={C.text} fontSize={12} textAnchor="end">2d</text>
        <text x={200} y={110 + dPx + 18} fill={C.accent} fontSize={12} textAnchor="middle">{isKo ? "면적 σ = πd²" : "area σ = πd²"}</text>
        <text x={440} y={196} fill={C.textDim} fontSize={11.5} textAnchor="middle">
          {isKo ? "B의 중심이 이 원통 안을 지나가면 충돌" : "a collision whenever B's centre passes inside this tube"}
        </text>
      </svg>
      <Row>
        <Slider label="T" value={T} min={200} max={1500} step={1} onChange={setT} unit=" K" width={150} />
        <Slider label="p" value={p} min={0.1} max={10} step={0.1} onChange={setP} unit=" bar" width={130} fmt={v => v.toFixed(1)} />
        <Slider label="σ" value={sig} min={0.1} max={1.2} step={0.01} onChange={setSig} unit=" nm²" width={130} fmt={v => v.toFixed(2)} />
        <Slider label="M" value={M} min={2} max={200} step={0.5} onChange={setM} unit=" g/mol" width={130} />
        <button onClick={() => { setT(298); setP(1); setSig(0.43); setM(28.0); }} style={{ ...btnStyle(), padding: "6px 12px", fontSize: 12 }}>
          N₂, 298 K, 1 bar
        </button>
      </Row>
      <StatGrid min={190}>
        <Stat label={isKo ? "개수 밀도 n = p/kT" : "number density n = p/kT"} value={`${sci(n)} m⁻³`} color={C.textDim} />
        <Stat label={isKo ? "평균 속력 c̄" : "mean speed c̄"} value={`${cbar.toFixed(0)} m/s`} color={C.sky} />
        <Stat label={isKo ? "상대 속력 √2 c̄" : "relative speed √2 c̄"} value={`${crel.toFixed(0)} m/s`} color={C.sky} />
        <Stat label={isKo ? "분자당 충돌 빈도 z" : "collisions per molecule z"} value={`${sci(z)} s⁻¹`} color={C.accent} />
        <Stat label={isKo ? "평균 자유 행로 λ" : "mean free path λ"} value={`${(lam * 1e9).toFixed(1)} nm`} color={C.purple} />
        <Stat label="Z_AA" value={`${sci(ZAA)} m⁻³ s⁻¹`} color={C.amber} />
        <Stat label={isKo ? "이론 A = σ c_rel N_A" : "theoretical A = σ c_rel N_A"} value={`${sci(Ath)} dm³ mol⁻¹ s⁻¹`} color={C.pink} />
        <Stat label={isKo ? "충돌 지름 d" : "collision diameter d"} value={`${(d * 1e3).toFixed(0)} pm`} color={C.textDim} />
      </StatGrid>
      <Note>
        {isKo
          ? "기본값(N₂, 298 K, 1 bar)에서 분자 하나는 1초에 약 7×10⁹번, 즉 0.14 ns마다 한 번 부딪힙니다. 1 m³ 안에서는 1초에 약 8.5×10³⁴번의 충돌이 일어납니다. 이 충돌이 모두 반응으로 이어진다면 모든 기체 반응은 순식간에 끝날 것입니다. 실제로 그렇지 않은 이유가 다음 카드의 에너지 조건입니다. 압력을 두 배로 하면 z는 두 배, Z_AA는 네 배가 되는 것(n에 1차, n²에 비례)도 확인해 보십시오. λ = c̄/z는 4주차에서 계산한 평균 자유 행로와 같은 양입니다. 동일한 분자의 Z_AA에 ½이 붙는 것은 같은 충돌을 두 번 세지 않기 위해서입니다."
          : "At the default (N₂, 298 K, 1 bar) a molecule is hit about 7×10⁹ times a second, once every 0.14 ns, and a cubic metre hosts about 8.5×10³⁴ collisions per second. If every collision led to reaction, every gas-phase reaction would be over in an instant; the energy condition on the next card is why that does not happen. Check that doubling the pressure doubles z but quadruples Z_AA (first order in n versus n²). λ = c̄/z is the same mean free path we computed in Week 4. The factor ½ in Z_AA stops us from counting each A–A collision twice."}
      </Note>
    </Card>
  );
}

function EnergyTailLab({ isKo }) {
  const [Ea, setEa] = useState(50);         // kJ/mol
  const [T, setT] = useState(300);
  const RT = RGAS * T / 1e3;                // kJ/mol
  const f = Math.exp(-Ea / RT);
  const f10 = Math.exp(-Ea / (RGAS * (T + 10) / 1e3));
  const W = 680, Ht = 280, pad = 52;
  const xMax = Math.max(1.6 * Ea, 8 * RT);
  const yMin = -xMax / RT / Math.LN10;
  const { X, Y } = plotScale(0, xMax, yMin, 0.3, W, Ht, pad);
  const line = [[0, 0], [xMax, yMin]];
  const tail = [[Ea, -Ea / RT / Math.LN10], [xMax, yMin], [xMax, yMin], [Ea, yMin]];
  const ticksY = [];
  for (let k = 0; k >= Math.ceil(yMin); k -= Math.max(1, Math.round(-yMin / 6))) ticksY.push(k);
  return (
    <Card>
      <Hd>{isKo ? "에너지 조건: Boltzmann 꼬리만 반응한다" : "The energy requirement: only the Boltzmann tail reacts"}</Hd>
      <Eq>{"d[A]/dt = −Z_AB f / N_A,   f = e^(−Ea/RT)   ⇒   k_r = σ (8kT/πμ)^½ N_A e^(−Ea/RT)"}</Eq>
      <Row>
        <Slider label="Ea" value={Ea} min={5} max={200} step={1} onChange={setEa} unit=" kJ/mol" width={180} />
        <Slider label="T" value={T} min={200} max={1500} step={5} onChange={setT} unit=" K" width={180} />
      </Row>
      <StatGrid>
        <Stat label="RT" value={`${RT.toFixed(2)} kJ/mol`} color={C.textDim} />
        <Stat label={isKo ? "반응 가능한 충돌 분율 f" : "fraction of reactive collisions f"} value={sci(f)} color={C.accent} />
        <Stat label={isKo ? "1/f: 몇 번 부딪혀야 한 번 반응?" : "1/f: collisions per reaction"} value={sci(1 / f)} color={C.amber} />
        <Stat label={`f(${T + 10} K)/f(${T} K)`} value={(f10 / f).toFixed(3)} color={C.pink} />
      </StatGrid>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "충돌 에너지 ε (중심선 방향) [kJ/mol]" : "collision energy ε along the line of centres [kJ/mol]"} ylabel="log₁₀[RT · p(ε)]" />
        <polygon points={tail.map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")} fill="rgba(45,212,191,0.18)" />
        <path d={pathOf(line, X, Y)} stroke={C.accent} strokeWidth={2.6} fill="none" />
        <line x1={X(Ea)} y1={Y(0.3)} x2={X(Ea)} y2={Ht - pad} stroke={C.amber} strokeDasharray="5 4" />
        <text x={X(Ea) + 6} y={Y(0.1)} fill={C.amber} fontSize={12}>Ea</text>
        {ticksY.map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        {[0, 0.25, 0.5, 0.75, 1].map(fr => <text key={fr} x={X(fr * xMax)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{(fr * xMax).toFixed(0)}</text>)}
        <text x={W - pad} y={pad + 4} fill={C.accent} fontSize={11.5} textAnchor="end">{isKo ? `음영 넓이 = e^(−Ea/RT) = ${sci(f)}` : `shaded area = e^(−Ea/RT) = ${sci(f)}`}</text>
      </svg>
      <Note>
        {isKo
          ? "두 분자가 중심을 잇는 선을 따라 가져오는 에너지 ε의 분포는 p(ε) = (1/RT)e^(−ε/RT)이고, 로그로 그리면 직선입니다. Ea 이상인 꼬리의 넓이가 바로 f = e^(−Ea/RT)입니다. Ea = 50 kJ/mol, 300 K에서 f ≈ 2×10⁻⁹이므로 5억 번쯤 부딪혀야 한 번 반응합니다. 앞 카드의 충돌 빈도(초당 10⁹번 수준)와 곱하면 1 bar에서 분자 하나가 반응하는 데 0.1초 정도 걸린다는 감이 나옵니다(P = 1이라 할 때). 온도를 10 K 올리면 꼬리가 두 배 가까이 두꺼워지는데, 6주차의 '10도에 두 배' 어림이 여기서 나옵니다. 정교하게는 충돌 에너지에 따라 반응 단면적이 σ(ε) = σ(1 − Ea/ε)로 커진다고 놓고 Maxwell–Boltzmann 분포로 평균하면 정확히 e^(−Ea/RT)가 나옵니다."
          : "The energy two molecules bring along their line of centres is distributed as p(ε) = (1/RT)e^(−ε/RT), a straight line on a log scale. The area of the tail above Ea is exactly f = e^(−Ea/RT). With Ea = 50 kJ/mol at 300 K, f ≈ 2×10⁻⁹: about half a billion collisions per reaction. Combined with the collision rate of the previous card (of order 10⁹ s⁻¹), one molecule at 1 bar takes about a tenth of a second to react (taking P = 1). Raise T by 10 K and the tail nearly doubles: that is Week 6's 'doubling every ten degrees'. A more careful treatment lets the reactive cross-section grow with collision energy as σ(ε) = σ(1 − Ea/ε); averaging over the Maxwell–Boltzmann distribution then gives exactly e^(−Ea/RT)."}
      </Note>
    </Card>
  );
}

const STERIC = [
  { rx: "2NOCl → 2NO + 2Cl", aexp: 9.4e9, ath: 5.9e10, ea: 102.0,
    ko: "두 NOCl의 Cl 쪽 끝이 서로 마주 보아야 Cl–Cl이 생길 수 있습니다. 방향 조건이 중간 정도라 P ≈ 0.16, 즉 여섯 번 중 한 번꼴로 방향이 맞습니다.",
    en: "The Cl ends of the two NOCl molecules must face each other for a Cl–Cl bond to form. A moderate orientation constraint: P ≈ 0.16, about one collision in six has the right geometry." },
  { rx: "2ClO → Cl₂ + O₂", aexp: 6.3e7, ath: 2.5e10, ea: 0.0,
    ko: "활성화 에너지가 0인데도 대부분의 충돌이 헛됩니다. 두 라디칼이 Cl–Cl과 O–O를 동시에 만들도록 재배열되어야 하므로 기하 조건이 까다롭습니다.",
    en: "Even with zero activation energy most collisions are wasted: the two radicals must rearrange to form Cl–Cl and O–O at the same time, a demanding geometry." },
  { rx: "H₂ + C₂H₄ → C₂H₆", aexp: 1.24e6, ath: 7.4e11, ea: 180.0,
    ko: "네 원자가 한꺼번에 결합을 바꾸는 협동 경로라 백만 번에 한 번꼴로만 방향이 맞습니다. 또한 충돌 에너지가 끊어질 결합 하나에 모여야 하는데, 이것이 다음 카드 RRK 모형의 주제입니다.",
    en: "A concerted four-centre pathway: only about one collision in a million has the right orientation. The collision energy must also gather in the bond that breaks, which is the subject of the RRK card below." },
  { rx: "K + Br₂ → KBr + Br", aexp: 1.0e12, ath: 2.1e11, ea: 0.0,
    ko: "P > 1! 충돌 단면적보다 반응 단면적이 더 큽니다. K가 Br₂에 닿기 훨씬 전에 전자를 '작살'처럼 던져 K⁺와 Br₂⁻가 되고, 두 이온이 Coulomb 인력으로 끌려와 반응합니다. 아래 계산기에서 그 거리를 구해 보십시오.",
    en: "P > 1! The reactive cross-section exceeds the collision cross-section. Long before K touches Br₂ it throws an electron like a harpoon; K⁺ and Br₂⁻ are then reeled in by Coulomb attraction. Estimate that distance with the calculator below." },
];

function StericCard({ isKo }) {
  const [sel, setSel] = useState(3);
  const [IE, setIE] = useState(4.34);        // eV, K
  const [EA, setEA] = useState(2.55);        // eV, Br2 (value used in Vallance's Cs + Br2 problem)
  const [sHS, setSHS] = useState(0.45);      // nm^2, assumed hard-sphere cross-section
  const Rstar = 1.43996 / Math.max(IE - EA, 0.05);   // nm, e^2/(4 pi eps0) = 1.44 eV nm
  const sStar = Math.PI * Rstar * Rstar;
  const W = 680, Ht = 230, pad = 44;
  const { X } = plotScale(-7, 2.6, 0, 1, W, Ht, pad);
  return (
    <Card>
      <Hd>{isKo ? "입체 인자 P: 방향까지 맞아야 한다" : "The steric factor P: the orientation must be right too"}</Hd>
      <Eq>{"k_r = P σ N_A (8kT/πμ)^½ e^(−Ea/RT)      σ* = Pσ (reactive cross-section)      P = A_exp / A_theory"}</Eq>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 560 }}>
          <thead>
            <tr style={{ color: C.textDim, textAlign: "left" }}>
              <th style={{ padding: "6px 8px" }}>{isKo ? "반응" : "Reaction"}</th>
              <th style={{ padding: "6px 8px" }}>A_exp</th>
              <th style={{ padding: "6px 8px" }}>A_theory</th>
              <th style={{ padding: "6px 8px" }}>Ea [kJ/mol]</th>
              <th style={{ padding: "6px 8px" }}>P</th>
            </tr>
          </thead>
          <tbody>
            {STERIC.map((r, i) => (
              <tr key={i} onClick={() => setSel(i)} style={{
                cursor: "pointer", background: sel === i ? "rgba(45,212,191,0.10)" : "transparent",
                borderTop: `1px solid ${C.border}`,
              }}>
                <td style={{ padding: "7px 8px", fontWeight: 600 }}>{r.rx}</td>
                <td style={{ padding: "7px 8px", fontFamily: mono }}>{sci(r.aexp, 2)}</td>
                <td style={{ padding: "7px 8px", fontFamily: mono }}>{sci(r.ath, 1)}</td>
                <td style={{ padding: "7px 8px", fontFamily: mono }}>{r.ea.toFixed(1)}</td>
                <td style={{ padding: "7px 8px", fontFamily: mono, color: r.aexp / r.ath > 1 ? C.amber : C.accent }}>{sci(r.aexp / r.ath, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={{ ...fullSvg(W), marginTop: 12 }}>
        {[-7, -6, -5, -4, -3, -2, -1, 0, 1].map(v => (
          <g key={v}>
            <line x1={X(v)} y1={pad - 10} x2={X(v)} y2={Ht - pad} stroke="#1e293b" />
            <text x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">10{String(v).replace("-", "⁻").replace(/\d/, ch => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+ch])}</text>
          </g>
        ))}
        <line x1={X(0)} y1={pad - 14} x2={X(0)} y2={Ht - pad} stroke={C.amber} strokeDasharray="4 3" />
        <text x={X(0) + 4} y={pad - 16} fill={C.amber} fontSize={11}>P = 1</text>
        {STERIC.map((r, i) => {
          const lp = Math.log10(r.aexp / r.ath);
          const y = pad + i * 38;
          return (
            <g key={i} onClick={() => setSel(i)} style={{ cursor: "pointer" }}>
              <rect x={Math.min(X(lp), X(0))} y={y} width={Math.abs(X(lp) - X(0))} height={22}
                fill={sel === i ? C.accent : "rgba(45,212,191,0.35)"} rx={4} />
              <text x={lp < 0 ? X(lp) - 6 : X(lp) + 6} y={y + 15} fill={C.text} fontSize={11.5} textAnchor={lp < 0 ? "end" : "start"}>{r.rx}</text>
            </g>
          );
        })}
        <text x={W / 2} y={Ht - 8} fill={C.textDim} fontSize={11} textAnchor="middle">{isKo ? "입체 인자 P (로그 눈금)" : "steric factor P (log scale)"}</text>
      </svg>
      <div style={{
        marginTop: 10, padding: "12px 14px", background: "#0d1117", borderRadius: 10,
        borderLeft: `3px solid ${C.accent}`, fontSize: 13.5, lineHeight: 1.7,
      }}>
        <b style={{ color: C.accentSoft }}>{STERIC[sel].rx}: </b>{isKo ? STERIC[sel].ko : STERIC[sel].en}
      </div>

      <HdSub>{isKo ? "작살 메커니즘 계산기 (K + Br₂)" : "Harpoon-mechanism calculator (K + Br₂)"}</HdSub>
      <Eq>{(isKo ? "전자 이동 조건: " : "electron jumps when: ") + "e²/(4πε₀R*) = I(K) − E_ea(Br₂)   ⇒   R* = 1.44 eV·nm / (I − E_ea),   σ* = πR*²,   P ≈ σ*/σ"}</Eq>
      <Row>
        <Slider label={isKo ? "K 이온화 에너지 I" : "K ionization energy I"} value={IE} min={3.5} max={5.5} step={0.01} onChange={setIE} unit=" eV" width={140} fmt={v => v.toFixed(2)} />
        <Slider label={isKo ? "Br₂ 전자 친화도 E_ea" : "Br₂ electron affinity E_ea"} value={EA} min={0.5} max={3.2} step={0.01} onChange={setEA} unit=" eV" width={140} fmt={v => v.toFixed(2)} />
        <Slider label={isKo ? "강체구 σ (가정)" : "hard-sphere σ (assumed)"} value={sHS} min={0.2} max={1.0} step={0.01} onChange={setSHS} unit=" nm²" width={120} fmt={v => v.toFixed(2)} />
      </Row>
      <StatGrid>
        <Stat label={isKo ? "전자를 던지는 거리 R*" : "harpoon range R*"} value={`${Rstar.toFixed(2)} nm`} color={C.amber} />
        <Stat label="σ* = πR*²" value={`${sStar.toFixed(2)} nm²`} color={C.accent} />
        <Stat label="P ≈ σ*/σ" value={(sStar / sHS).toFixed(1)} color={C.pink} />
        <Stat label={isKo ? "실험 P (표)" : "experimental P (table)"} value="4.8" color={C.textDim} />
      </StatGrid>
      <Note>
        {isKo
          ? "전자가 K에서 Br₂로 넘어가려면 I − E_ea만큼의 에너지가 필요하고, 그 비용은 생긴 두 이온 사이의 Coulomb 인력 e²/(4πε₀R)이 갚아 줍니다. 두 값이 같아지는 거리 R*부터 전자 이동이 가능해집니다. I(K) = 4.34 eV, E_ea = 2.55 eV(Oxford Vallance 교재의 Cs + Br₂ 예제에 쓰인 값)를 넣으면 R* ≈ 0.8 nm, σ* ≈ 2 nm²입니다. 강체구 σ를 0.4–0.5 nm² 정도로 가정하면 P는 4–5가 되어 표의 4.8과 잘 맞습니다. 강체구 σ는 이 계산기에서 가정한 값이므로 보고서에 쓸 때는 출처를 따로 확인하십시오. 이온화 에너지가 작은 알칼리 금속일수록(Cs < K < Na) R*가 커지고 반응 단면적도 커집니다."
          : "Moving the electron from K to Br₂ costs I − E_ea, and the Coulomb attraction e²/(4πε₀R) of the resulting ion pair pays it back. Transfer becomes possible from the distance R* where the two are equal. With I(K) = 4.34 eV and E_ea = 2.55 eV (the value used in the Cs + Br₂ problem of the Oxford Vallance tutorials), R* ≈ 0.8 nm and σ* ≈ 2 nm². Assuming a hard-sphere σ of 0.4–0.5 nm² gives P ≈ 4–5, in line with the 4.8 in the table. The hard-sphere σ is an assumption of this calculator, so check a source before using it in a report. The lower the ionization energy of the alkali metal (Cs < K < Na), the larger R* and the reactive cross-section."}
      </Note>
    </Card>
  );
}

function RRKLab({ isKo }) {
  const [s, setS] = useState(10);
  const [ratio, setRatio] = useState(2.0);      // E/E*
  const [mc, setMc] = useState(null);
  const [seed, setSeed] = useState(1);
  const x = 1 / ratio;                          // E*/E
  const P = Math.pow(1 - x, s - 1);
  const W = 680, Ht = 300, pad = 54;
  const { X, Y } = plotScale(0, 1, -6, 0, W, Ht, pad);
  const curve = ss => {
    const pts = [];
    for (let j = 0; j <= 200; j++) {
      const r = 1 + 9 * j / 200;
      pts.push([Math.log10(r), Math.max(-6, (ss - 1) * Math.log10(1 - 1 / r || 1e-300))]);
    }
    return pts;
  };
  const runMC = () => {
    const rand = makeRng(seed * 7919 + s * 31);
    const N = 100000;
    let hit = 0;
    const show = [];
    for (let i = 0; i < N; i++) {
      const g = [];
      let tot = 0;
      for (let j = 0; j < s; j++) { const e = -Math.log(1 - rand()); g.push(e); tot += e; }
      if (g[0] / tot >= x) hit++;
      if (i < 12) show.push(g.map(e => e / tot));
    }
    setMc({ frac: hit / N, N, show, s, x });
    setSeed(v => v + 1);
  };
  const mcValid = mc && mc.s === s && Math.abs(mc.x - x) < 1e-12;
  return (
    <Card>
      <Hd>{isKo ? "RRK 모형: 에너지가 한 결합에 모일 확률" : "The RRK model: the chance that energy gathers in one bond"}</Hd>
      <Eq>{"P(ε₁ ≥ E*|E) = Area{ε₁ ≥ E*, Σεᵢ = E} / Area{Σεᵢ = E} = ∫(E−x)^(s−2)dx / ∫(E−x)^(s−2)dx = (1 − E*/E)^(s−1)"}</Eq>
      <Note>
        {isKo
          ? "충돌로 분자가 에너지 E를 얻어도, 그 에너지는 s개의 진동 모드에 무작위로 퍼집니다(등분배). 반응하려면 끊어질 결합 하나에 E* 이상이 모여야 합니다. 합이 E인 모든 분배가 똑같이 가능하다면 그 확률이 (1 − E*/E)^(s−1)입니다. 모드가 많은 큰 분자일수록 에너지가 흩어져 P가 급격히 작아집니다."
          : "A collision may give a molecule energy E, but that energy is spread at random over s vibrational modes (equipartition). To react, at least E* must gather in the one bond that breaks. If every way of sharing E is equally likely, the probability is (1 − E*/E)^(s−1). A large molecule with many modes dilutes its energy, and P collapses."}
      </Note>
      <Row>
        <Slider label={isKo ? "모드 수 s" : "number of modes s"} value={s} min={1} max={25} step={1} onChange={v => setS(v)} width={170} />
        <Slider label="E / E*" value={ratio} min={1.05} max={10} step={0.05} onChange={setRatio} width={170} fmt={v => v.toFixed(2)} />
        <button onClick={runMC} style={{ ...btnStyle(), padding: "6px 12px", fontSize: 12 }}>
          {isKo ? "분자 100,000개 Monte Carlo" : "Monte Carlo, 100,000 molecules"}
        </button>
      </Row>
      <StatGrid>
        <Stat label="E*/E" value={x.toFixed(3)} color={C.textDim} />
        <Stat label={isKo ? "공식 (1 − E*/E)^(s−1)" : "formula (1 − E*/E)^(s−1)"} value={P < 1e-3 ? sci(P) : P.toFixed(4)} color={C.purple} />
        <Stat label={isKo ? "Monte Carlo 추정" : "Monte Carlo estimate"} value={mcValid ? `${mc.frac.toFixed(4)} ± ${Math.sqrt(mc.frac * (1 - mc.frac) / mc.N).toFixed(4)}` : "—"} color={C.accent} />
        <Stat label={isKo ? "k(E)/ν" : "k(E)/ν"} value={P < 1e-3 ? sci(P) : P.toFixed(4)} color={C.amber} />
      </StatGrid>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={{ ...svgBox(W), maxWidth: W }}>
          <Axes W={W} Ht={Ht} pad={pad} xlabel="E / E*  (log)" ylabel="log₁₀ P" />
          {[1, 2, 5, 10].map(v => <text key={v} x={X(Math.log10(v))} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
          {[0, -2, -4, -6].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
          {[2, 5, 10, 20].map(ss => (
            <path key={ss} d={pathOf(curve(ss), X, Y)} fill="none" stroke="#475569" strokeWidth={1.2} />
          ))}
          <text x={W - pad} y={Y(-4.6)} fill={C.textDim} fontSize={11} textAnchor="end">{isKo ? "가는 선: s = 2, 5, 10, 20 (위에서 아래로)" : "thin lines: s = 2, 5, 10, 20 (top to bottom)"}</text>
          <text x={W - pad} y={Y(-5.1)} fill={C.purple} fontSize={11} textAnchor="end">{isKo ? `굵은 선: s = ${s}` : `thick line: s = ${s}`}</text>
          <path d={pathOf(curve(s), X, Y)} fill="none" stroke={C.purple} strokeWidth={2.8} />
          <circle cx={X(Math.log10(ratio))} cy={Y(Math.max(-6, Math.log10(P)))} r={6} fill={C.purple} />
          {mcValid && mc.frac > 0 && <circle cx={X(Math.log10(ratio))} cy={Y(Math.max(-6, Math.log10(mc.frac)))} r={9} fill="none" stroke={C.accent} strokeWidth={2} />}
        </svg>
        {mcValid && (
          <svg width={300} height={Ht} viewBox={`0 0 300 ${Ht}`} style={{ ...svgBox(300), maxWidth: 340 }}>
            <text x={150} y={20} fill={C.textDim} fontSize={11} textAnchor="middle">{isKo ? "무작위 분배 12개 (모드 1 = 색칠)" : "12 random partitions (mode 1 coloured)"}</text>
            {mc.show.map((parts, i) => {
              let acc = 0;
              const y = 34 + i * 20;
              return (
                <g key={i}>
                  {parts.map((pp, j) => {
                    const x0 = 20 + 260 * acc;
                    acc += pp;
                    return <rect key={j} x={x0} y={y} width={Math.max(260 * pp - 1, 0.5)} height={14}
                      fill={j === 0 ? (pp >= x ? C.accent : C.err) : "#334155"} />;
                  })}
                </g>
              );
            })}
            <line x1={20 + 260 * x} y1={30} x2={20 + 260 * x} y2={34 + 12 * 20} stroke={C.amber} strokeDasharray="4 3" />
            <text x={20 + 260 * x} y={Ht - 14} fill={C.amber} fontSize={10.5} textAnchor="middle">E*/E</text>
          </svg>
        )}
      </div>
      <Note>
        {isKo
          ? "Monte Carlo는 합이 E인 에너지 분배를 균일하게 뽑습니다(독립 지수 난수를 합으로 나누면 단체 위의 균일 분포가 됩니다). 오른쪽 막대에서 첫 칸(모드 1)이 주황 점선을 넘으면 초록, 못 넘으면 빨강입니다. s = 10, E = 2E*이면 P = 0.5⁹ ≈ 2×10⁻³이므로 같은 에너지를 받아도 500번에 한 번만 반응합니다. 이 확률을 열분포로 평균하면 놀랍게도 s가 사라집니다. 상태 밀도 ρ(E) ∝ E^(s−1)과 Boltzmann 인자로 평균하면 k(T) = ν∫(E−E₀)^(s−1)e^(−E/kT)dE / ∫E^(s−1)e^(−E/kT)dE = ν e^(−E₀/kT)가 되어, 다시 Arrhenius 형태로 돌아옵니다. 모드 수는 '얼마나 오래 기다려야 하는가'(k(E))를 바꾸지만, 열평형 집단 전체의 평균 속도는 장벽 높이만으로 정해집니다."
          : "The Monte Carlo draws energy partitions uniformly from all those summing to E (independent exponential numbers divided by their sum are uniform on the simplex). In the bars on the right, the first segment (mode 1) is green if it crosses the orange line and red if not. With s = 10 and E = 2E*, P = 0.5⁹ ≈ 2×10⁻³: even with the same energy, only one molecule in 500 reacts. Average this over a thermal distribution and, remarkably, s disappears. With density of states ρ(E) ∝ E^(s−1) and the Boltzmann factor, k(T) = ν∫(E−E₀)^(s−1)e^(−E/kT)dE / ∫E^(s−1)e^(−E/kT)dE = ν e^(−E₀/kT), the Arrhenius form again. The number of modes changes how long an energised molecule must wait (k(E)), but the average over a thermal population is set by the barrier height alone."}
      </Note>
    </Card>
  );
}

// =============================================================
// 3) REACTIONS IN SOLUTION: ENCOUNTER PAIRS & DIFFUSION CONTROL
// =============================================================
const SOLVENTS = [
  { ko: "헥세인", en: "hexane", eta: 0.300 },
  { ko: "물", en: "water", eta: 0.890 },
  { ko: "에틸렌 글리콜", en: "ethylene glycol", eta: 16.06 },
  { ko: "글리세롤", en: "glycerol", eta: 934 },
];

function SolutionTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <EncounterLab isKo={isKo} />
      <SmoluchowskiCard isKo={isKo} />
      <RelativeDiffusionLab isKo={isKo} />
      <BrownianCaptureLab isKo={isKo} />
    </div>
  );
}

function EncounterLab({ isKo }) {
  const [lka, setLka] = useState(11);       // log10 k_a [s^-1]
  const [lkdp, setLkdp] = useState(10);     // log10 k_d' [s^-1]
  const kd = 7.4e9;                          // water, 298 K
  const ka = Math.pow(10, lka), kdp = Math.pow(10, lkdp);
  const kr = ka * kd / (ka + kdp);
  const u = lka - lkdp;                      // log10(k_a/k_d')
  const regime = u > 1 ? (isKo ? "확산 지배" : "diffusion controlled") : u < -1 ? (isKo ? "활성화 지배" : "activation controlled") : (isKo ? "중간 영역" : "intermediate");
  const W = 680, Ht = 300, pad = 54;
  const { X, Y } = plotScale(-4, 4, -4.5, 0.5, W, Ht, pad);
  const pts = [];
  for (let j = 0; j <= 200; j++) { const uu = -4 + 8 * j / 200; pts.push([uu, Math.log10(1 / (1 + Math.pow(10, -uu)))]); }
  return (
    <Card>
      <Hd>{isKo ? "만남 쌍: 만나는 것과 반응하는 것은 다르다" : "The encounter pair: meeting is not the same as reacting"}</Hd>
      <Eq>{"A + B → AB (k_d),   AB → A + B (k_d′),   AB → P (k_a)      QSSA: d[AB]/dt = 0  ⇒  k_r = k_a k_d / (k_a + k_d′)"}</Eq>
      <Note>
        {isKo
          ? "용액에서는 A와 B가 만나면 주변 용매 분자에 갇혀 한동안 '만남 쌍' AB로 붙어 있습니다(용매 우리 효과). 그 사이에 반응하든지(k_a), 다시 흩어지든지(k_d′) 둘 중 하나입니다. AB의 농도는 작고 거의 일정하므로 준정상 상태 근사(QSSA)를 쓰면 위 식이 나옵니다. k_a/(k_a + k_d′)는 '만남 한 번이 반응으로 이어질 확률'입니다."
          : "In solution, once A and B meet they are trapped by surrounding solvent molecules and stay together for a while as an encounter pair AB (the solvent cage effect). In that time they either react (k_a) or drift apart (k_d′). [AB] is small and nearly constant, so the quasi-steady-state approximation (QSSA) gives the expression above. k_a/(k_a + k_d′) is the probability that one encounter ends in reaction."}
      </Note>
      <Row>
        <Slider label="log₁₀ k_a" value={lka} min={6} max={14} step={0.1} onChange={setLka} unit=" (s⁻¹)" width={170} fmt={v => v.toFixed(1)} />
        <Slider label="log₁₀ k_d′" value={lkdp} min={8} max={12} step={0.1} onChange={setLkdp} unit=" (s⁻¹)" width={170} fmt={v => v.toFixed(1)} />
      </Row>
      <StatGrid>
        <Stat label={isKo ? "k_d (물, 298 K)" : "k_d (water, 298 K)"} value={`${sci(kd)} dm³ mol⁻¹ s⁻¹`} color={C.sky} />
        <Stat label={isKo ? "만남당 반응 확률" : "reaction probability per encounter"} value={(ka / (ka + kdp)).toFixed(4)} color={C.accent} />
        <Stat label="k_r" value={`${sci(kr)} dm³ mol⁻¹ s⁻¹`} color={C.amber} />
        <Stat label={isKo ? "영역" : "regime"} value={regime} color={C.pink} />
      </StatGrid>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel="log₁₀(k_a / k_d′)" ylabel="log₁₀(k_r / k_d)" />
        <line x1={X(0)} y1={Y(0)} x2={X(4)} y2={Y(0)} stroke={C.sky} strokeDasharray="5 4" />
        <line x1={X(-4)} y1={Y(-4)} x2={X(0.5)} y2={Y(0.5)} stroke={C.amber} strokeDasharray="5 4" />
        <path d={pathOf(pts, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.6} />
        <circle cx={X(Math.max(-4, Math.min(4, u)))} cy={Y(Math.log10(kr / kd))} r={6} fill={C.pink} />
        <text x={X(2.2)} y={Y(0) - 8} fill={C.sky} fontSize={11.5}>{isKo ? "k_r → k_d (확산 지배)" : "k_r → k_d (diffusion control)"}</text>
        <text x={X(-3.8)} y={Y(-2.6)} fill={C.amber} fontSize={11.5}>{isKo ? "k_r → k_a·k_d/k_d′ = k_a K" : "k_r → k_a·k_d/k_d′ = k_a K"}</text>
        {[-4, -2, 0, 2, 4].map(v => <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        {[0, -1, -2, -3, -4].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
      </svg>
      <Note>
        {isKo
          ? "k_d′ ≪ k_a(오른쪽)이면 만나기만 하면 반응하므로 k_r = k_d입니다. 반응 속도는 화학이 아니라 분자가 용매를 헤치고 만나는 빠르기, 곧 확산으로 정해집니다. k_a ≪ k_d′(왼쪽)이면 만남 쌍이 여러 번 생겼다 흩어진 뒤에야 반응하므로 k_r = k_a(k_d/k_d′) = k_a K입니다. 여기서 K는 만남 쌍의 평형 상수이고, 반응은 AB → P 단계의 활성화 에너지가 결정합니다. 측정한 k_r이 10⁹–10¹⁰ dm³ mol⁻¹ s⁻¹ 근처이면 확산 지배를 의심해 볼 만합니다."
          : "When k_d′ ≪ k_a (right), every meeting leads to reaction and k_r = k_d: the rate is set not by chemistry but by how fast molecules push through the solvent to meet, that is, by diffusion. When k_a ≪ k_d′ (left), an encounter pair forms and breaks up many times before reacting, and k_r = k_a(k_d/k_d′) = k_a K, where K is the equilibrium constant for forming the pair; the activation energy of AB → P is in control. A measured k_r near 10⁹–10¹⁰ dm³ mol⁻¹ s⁻¹ is a hint of diffusion control."}
      </Note>
    </Card>
  );
}

function SmoluchowskiCard({ isKo }) {
  const [sol, setSol] = useState(1);
  const [T, setT] = useState(298);
  const [Rs, setRs] = useState(0.4);          // nm
  const [Dsum, setDsum] = useState(4.0);      // 1e-9 m^2/s
  const eta = SOLVENTS[sol].eta * 1e-3;
  const kdSE = 8 * RGAS * T / (3 * eta) * 1e3;
  const kdSm = 4 * Math.PI * Rs * 1e-9 * Dsum * 1e-9 * NAV * 1e3;
  const DSE = KB * T / (6 * Math.PI * eta * (Rs * 1e-9 / 2));
  const W = 680, Ht = 270, pad = 50;
  const { X, Y } = plotScale(0, 10, 0, 1.05, W, Ht, pad);
  const pts = [];
  for (let j = 0; j <= 200; j++) { const r = 1 + 9 * j / 200; pts.push([r, 1 - 1 / r]); }
  return (
    <Card>
      <Hd>{isKo ? "Smoluchowski: 흡수하는 구 주위의 확산" : "Smoluchowski: diffusion towards an absorbing sphere"}</Hd>
      <Eq>{"∂[B]/∂t = D_B∇²[B] → " + (isKo ? "(정상 상태) " : "(steady state) ") + "d²[B]/dr² + (2/r) d[B]/dr = 0,   [B](∞) = [B]bulk,  [B](R*) = 0   ⇒   [B] = (1 − R*/r)[B]bulk"}</Eq>
      <Eq>{"4πR*²J = 4πR*² D_B (d[B]/dr)|R* = 4πR* D_B [B]   ⇒   k_d = 4πR*(D_A + D_B)N_A,   D = kT/6πηR,  R_A = R_B = R*/2   ⇒   k_d = 8RT/3η"}</Eq>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel="r / R*" ylabel="[B] / [B]bulk" />
        <rect x={X(0)} y={Y(1.05)} width={X(1) - X(0)} height={Y(0) - Y(1.05)} fill="rgba(239,68,68,0.10)" />
        <text x={(X(0) + X(1)) / 2} y={Y(0.55)} fill={C.err} fontSize={11} textAnchor="middle">A</text>
        <line x1={X(1)} y1={Y(1)} x2={X(10)} y2={Y(1)} stroke="#475569" strokeDasharray="3 5" />
        <path d={pathOf(pts, X, Y)} fill="none" stroke={C.sky} strokeWidth={2.8} />
        <line x1={X(1)} y1={Y(0)} x2={X(2)} y2={Y(1)} stroke={C.amber} strokeDasharray="4 3" />
        <text x={X(2) + 6} y={Y(0.95)} fill={C.amber} fontSize={11}>{isKo ? "R*에서의 기울기 = 플럭스" : "slope at R* = flux"}</text>
        {[1, 2, 4, 6, 8, 10].map(v => <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        {[0, 0.5, 1].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        <text x={X(5)} y={Y(0.62)} fill={C.textDim} fontSize={11.5}>{isKo ? "r = 2R*에서도 아직 절반이 고갈" : "still half depleted at r = 2R*"}</text>
      </svg>
      <HdSub>{isKo ? "k_d를 직접 계산하기" : "Compute k_d yourself"}</HdSub>
      <Row>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {SOLVENTS.map((sv, i) => (
            <button key={i} onClick={() => setSol(i)} style={{ ...btnStyle(sol === i), padding: "6px 12px", fontSize: 12 }}>
              {isKo ? sv.ko : sv.en} ({sv.eta} mPa·s)
            </button>
          ))}
        </div>
        <Slider label="T" value={T} min={273} max={373} step={1} onChange={setT} unit=" K" width={140} />
      </Row>
      <Row>
        <Slider label="R*" value={Rs} min={0.2} max={1.5} step={0.01} onChange={setRs} unit=" nm" width={150} fmt={v => v.toFixed(2)} />
        <Slider label="D_A + D_B" value={Dsum} min={0.1} max={10} step={0.1} onChange={setDsum} unit=" ×10⁻⁹ m²/s" width={150} fmt={v => v.toFixed(1)} />
      </Row>
      <StatGrid min={200}>
        <Stat label={isKo ? "k_d = 8RT/3η (Stokes–Einstein)" : "k_d = 8RT/3η (Stokes–Einstein)"} value={`${sci(kdSE)} dm³ mol⁻¹ s⁻¹`} color={C.sky} />
        <Stat label={isKo ? "k_d = 4πR*(D_A+D_B)N_A (슬라이더)" : "k_d = 4πR*(D_A+D_B)N_A (sliders)"} value={`${sci(kdSm)} dm³ mol⁻¹ s⁻¹`} color={C.accent} />
        <Stat label={isKo ? "R*/2 크기 분자의 D (Stokes–Einstein)" : "D of a molecule of radius R*/2 (S–E)"} value={`${sci(DSE)} m²/s`} color={C.purple} />
        <Stat label={isKo ? "물 대비 k_d" : "k_d relative to water"} value={`×${(0.890e-3 / eta).toFixed(3)}`} color={C.amber} />
      </StatGrid>
      <Note>
        {isKo
          ? "흡수 구 바로 바깥의 B는 다 잡아먹혀 0이 되고, 멀리서는 bulk 농도로 돌아갑니다. 그 사이의 기울기가 B를 안쪽으로 밀어 넣는 플럭스이고, 표면적 4πR*²를 곱한 값이 초당 반응 횟수입니다. 놀라운 결론은 마지막 식입니다. Stokes–Einstein을 넣고 R_A = R_B로 두면 반지름이 약분되어 k_d = 8RT/3η가 됩니다. 큰 분자는 표적이 크지만 그만큼 느리게 움직이므로 두 효과가 상쇄됩니다. 그래서 확산 지배 속도 상수는 분자 종류와 거의 무관하게 용매 점도만으로 정해집니다. 298 K 물에서 7.4×10⁹ dm³ mol⁻¹ s⁻¹, 헥세인에서는 약 2.2×10¹⁰, 글리세롤에서는 천 배 이상 느린 7×10⁶입니다."
          : "Right outside the absorbing sphere every B is consumed and the concentration is zero; far away it returns to the bulk value. The gradient in between is the flux that drives B inwards, and multiplied by the area 4πR*² it gives the number of reactions per second. The striking result is the last equation. Insert Stokes–Einstein with R_A = R_B and the radii cancel: k_d = 8RT/3η. A big molecule is a bigger target but moves more slowly, and the two effects cancel. A diffusion-controlled rate constant is therefore set almost entirely by the solvent viscosity, not by the molecules: 7.4×10⁹ dm³ mol⁻¹ s⁻¹ in water at 298 K, about 2.2×10¹⁰ in hexane, and over a thousand times slower, 7×10⁶, in glycerol."}
      </Note>
    </Card>
  );
}

function RelativeDiffusionLab({ isKo }) {
  const [DA, setDA] = useState(1.0);
  const [DB, setDB] = useState(2.0);
  const [res, setRes] = useState(null);
  const run = () => {
    const rand = makeRng(Math.floor(DA * 1000 + DB * 7));
    const g = gaussFrom(rand);
    const N = 4000, nstep = 200, dt = 0.01;
    const xa = new Float64Array(N), xb = new Float64Array(N);
    const sa = Math.sqrt(2 * DA * dt), sb = Math.sqrt(2 * DB * dt);
    for (let k = 0; k < nstep; k++) {
      for (let i = 0; i < N; i++) { xa[i] += sa * g(); xb[i] += sb * g(); }
    }
    const t = nstep * dt;
    let vr = 0, vc = 0, cov = 0;
    for (let i = 0; i < N; i++) {
      const r = xb[i] - xa[i], R = 0.5 * (xa[i] + xb[i]);
      vr += r * r; vc += R * R; cov += r * R;
    }
    setRes({ Drel: vr / N / (2 * t), Dcm: vc / N / (2 * t), cross: cov / N / (2 * t), DA, DB });
  };
  const valid = res && res.DA === DA && res.DB === DB;
  return (
    <Card>
      <Hd>{isKo ? "상대 좌표로 보면 확산 계수가 더해진다" : "In the relative coordinate the diffusion coefficients add"}</Hd>
      <Eq>{"∂P/∂t = D_A∇²_rA P + D_B∇²_rB P,   r = r_B − r_A,  R = ½(r_A + r_B)   ⇒   ∂p/∂t = (D_A + D_B)∇²_r p,   p(r,t) = ∫P dR"}</Eq>
      <Note>
        {isKo
          ? "강의 10–11쪽의 유도는 '두 분자가 모두 움직이면 상대 거리는 어떤 확산 계수로 변하는가'에 답합니다. 좌표를 바꾸면 ∇²_rA = ¼∇²_R − ∇_R·∇_r + ∇²_r 같은 항이 나오고, 교차항 ∇_R·∇_r은 R에 대해 적분하면 경계(무한대)에서 P가 0이므로 사라집니다. 남는 것은 상대 좌표에 대한 확산 방정식 하나이고, 계수는 D_A + D_B입니다. Smoluchowski 식에서 D_B 대신 D_A + D_B를 쓰는 근거가 이것입니다. 아래 버튼은 1차원 무작위 걸음 4,000쌍으로 이 결과를 확인합니다."
          : "The derivation on lecture pages 10–11 answers one question: if both molecules move, with what diffusion coefficient does their separation change? Changing coordinates produces terms such as ∇²_rA = ¼∇²_R − ∇_R·∇_r + ∇²_r; the cross term ∇_R·∇_r vanishes on integrating over R because P is zero at infinity. What remains is one diffusion equation in the relative coordinate with coefficient D_A + D_B, which is why the Smoluchowski result uses D_A + D_B instead of D_B. The button checks this with 4,000 pairs of one-dimensional random walkers."}
      </Note>
      <Row>
        <Slider label="D_A" value={DA} min={0} max={5} step={0.1} onChange={setDA} width={150} fmt={v => v.toFixed(1)} />
        <Slider label="D_B" value={DB} min={0} max={5} step={0.1} onChange={setDB} width={150} fmt={v => v.toFixed(1)} />
        <button onClick={run} style={{ ...btnStyle(), padding: "6px 12px", fontSize: 12 }}>{isKo ? "무작위 걸음 4,000쌍 실행" : "Run 4,000 walker pairs"}</button>
      </Row>
      <StatGrid>
        <Stat label={isKo ? "⟨r²⟩/2t (시뮬레이션)" : "⟨r²⟩/2t (simulation)"} value={valid ? res.Drel.toFixed(3) : "—"} color={C.accent} />
        <Stat label={isKo ? "이론 D_A + D_B" : "theory D_A + D_B"} value={(DA + DB).toFixed(3)} color={C.sky} />
        <Stat label={isKo ? "⟨R²⟩/2t (무게중심)" : "⟨R²⟩/2t (centre)"} value={valid ? `${res.Dcm.toFixed(3)} (${((DA + DB) / 4).toFixed(3)})` : "—"} color={C.purple} />
        <Stat label={isKo ? "⟨rR⟩/2t (교차항)" : "⟨rR⟩/2t (cross term)"} value={valid ? `${res.cross.toFixed(3)} (${((DB - DA) / 2).toFixed(3)})` : "—"} color={C.amber} />
      </StatGrid>
      <Note>
        {isKo
          ? "괄호 안은 이론값입니다. 무게중심 R은 (D_A + D_B)/4로 확산합니다. r과 R의 상관 ⟨rR⟩은 D_A ≠ D_B이면 0이 아니지만(괄호 값 (D_B − D_A)/2), R에 대해 적분한 상대 분포 p(r,t)의 방정식에는 들어오지 않습니다. D_A = 0으로 두면 고정된 표적을 향한 확산(Smoluchowski의 원래 그림)이 됩니다."
          : "Values in brackets are the theory. The centre R diffuses with (D_A + D_B)/4. The correlation ⟨rR⟩ is nonzero when D_A ≠ D_B (bracketed value (D_B − D_A)/2), but it drops out of the equation for the relative distribution p(r,t) obtained by integrating over R. Set D_A = 0 to recover diffusion towards a fixed target, Smoluchowski's original picture."}
      </Note>
    </Card>
  );
}

function BrownianCaptureLab({ isKo }) {
  const NP = 20000, ROUT = 6, DT = 2e-3, TMAX = 1.5, SPF = 5;
  const c0 = NP / (4 / 3 * Math.PI * (ROUT * ROUT * ROUT - 1));
  const canvasRef = useRef(null);
  const simRef = useRef(null);
  const rafRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [hist, setHist] = useState([[0, 0]]);
  const [seed, setSeed] = useState(1);

  const init = sd => {
    const rand = makeRng(sd * 104729);
    const g = gaussFrom(rand);
    const x = new Float64Array(NP), y = new Float64Array(NP), z = new Float64Array(NP);
    const alive = new Uint8Array(NP).fill(1);
    for (let i = 0; i < NP; i++) {
      let ux = g(), uy = g(), uz = g();
      const un = Math.hypot(ux, uy, uz);
      const r = Math.cbrt(1 + (ROUT * ROUT * ROUT - 1) * rand());
      x[i] = r * ux / un; y[i] = r * uy / un; z[i] = r * uz / un;
    }
    simRef.current = { x, y, z, alive, rand, g, t: 0, cap: 0 };
    setHist([[0, 0]]);
    draw();
  };
  const draw = () => {
    const cv = canvasRef.current, s = simRef.current;
    if (!cv || !s) return;
    const ctx = cv.getContext("2d");
    const Wc = cv.width, sc = Wc / (2 * ROUT);
    ctx.fillStyle = "#0d1117"; ctx.fillRect(0, 0, Wc, Wc);
    ctx.fillStyle = "rgba(56,189,248,0.75)";
    for (let i = 0; i < NP; i++) {
      if (!s.alive[i] || Math.abs(s.z[i]) > 0.6) continue;
      ctx.fillRect(Wc / 2 + s.x[i] * sc - 1, Wc / 2 - s.y[i] * sc - 1, 2.2, 2.2);
    }
    ctx.beginPath(); ctx.arc(Wc / 2, Wc / 2, sc, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(239,68,68,0.55)"; ctx.fill();
    ctx.strokeStyle = "#475569"; ctx.beginPath(); ctx.arc(Wc / 2, Wc / 2, ROUT * sc - 1, 0, 2 * Math.PI); ctx.stroke();
    ctx.fillStyle = "#9ca3af"; ctx.font = "12px monospace";
    ctx.fillText(`t = ${s.t.toFixed(2)}   captured = ${s.cap}`, 8, 16);
  };
  const step = () => {
    const s = simRef.current;
    if (!s) return;
    const sq = Math.sqrt(2 * DT);
    for (let k = 0; k < SPF && s.t < TMAX - 1e-12; k++) {
      for (let i = 0; i < NP; i++) {
        if (!s.alive[i]) continue;
        const ro = Math.hypot(s.x[i], s.y[i], s.z[i]);
        s.x[i] += sq * s.g(); s.y[i] += sq * s.g(); s.z[i] += sq * s.g();
        const rr = Math.hypot(s.x[i], s.y[i], s.z[i]);
        let hit = rr < 1;
        if (!hit) hit = s.rand() < Math.exp(-Math.max((ro - 1) * (rr - 1), 0) / DT);   // Brownian-bridge correction
        if (hit) { s.alive[i] = 0; s.cap++; continue; }
        if (rr > ROUT) { const f = (2 * ROUT - rr) / rr; s.x[i] *= f; s.y[i] *= f; s.z[i] *= f; }
      }
      s.t += DT;
    }
    setHist(h => [...h, [s.t, s.cap]]);
    draw();
    if (s.t < TMAX - 1e-12) rafRef.current = requestAnimationFrame(step);
    else setRunning(false);
  };
  useEffect(() => { init(1); return () => cancelAnimationFrame(rafRef.current); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const toggle = () => {
    if (running) { cancelAnimationFrame(rafRef.current); setRunning(false); }
    else { setRunning(true); rafRef.current = requestAnimationFrame(step); }
  };
  const reset = () => { cancelAnimationFrame(rafRef.current); setRunning(false); const ns = seed + 1; setSeed(ns); init(ns); };

  const theo = t => 4 * Math.PI * c0 * (t + 2 * Math.sqrt(t / Math.PI));
  const steady = t => 4 * Math.PI * c0 * t;
  const W = 420, Ht = 340, pad = 52;
  const yMax = theo(TMAX) * 1.08;
  const { X, Y } = plotScale(0, TMAX, 0, yMax, W, Ht, pad);
  const tp = [], sp = [];
  for (let j = 0; j <= 100; j++) { const t = TMAX * j / 100; tp.push([t, theo(t)]); sp.push([t, steady(t)]); }
  const last = hist[hist.length - 1];
  return (
    <Card>
      <Hd>{isKo ? "라이브 Brownian 시뮬레이션: 흡수 구가 잡아먹는 속도" : "Live Brownian simulation: how fast an absorbing sphere eats"}</Hd>
      <Eq>{"k(t) = 4πR*D (1 + R*/√(πDt))   ⇒   N_captured(t) = 4πR*D c₀ [t + 2R*√(t/πD)]      (R* = D = 1)"}</Eq>
      <Note>
        {isKo
          ? "반지름 1인 흡수 구(빨강) 주위에 B 입자 20,000개를 균일하게 뿌리고 3차원 무작위 걸음을 시킵니다. 그림은 |z| < 0.6인 얇은 단면만 보여 줍니다. 시간이 지나면 구 주위에 입자가 빈 '고갈 영역'이 자라는 것이 보입니다. 오른쪽 그래프는 잡힌 입자 수를 Smoluchowski 이론과 비교합니다. 처음에는 구 바로 옆의 입자가 한꺼번에 잡혀 정상 상태(점선)보다 빠르고, 시간이 지나면 기울기가 4πR*Dc₀로 수렴합니다. 정상 상태 k_d는 이 긴 시간 극한입니다."
          : "Twenty thousand B particles are scattered uniformly around an absorbing sphere of radius 1 (red) and perform three-dimensional random walks. The picture shows only a thin slice |z| < 0.6. As time passes a depleted zone grows around the sphere. The graph on the right compares the number captured with Smoluchowski's theory. Early on the particles right next to the sphere are swallowed at once and capture outpaces the steady state (dashed); later the slope settles to 4πR*Dc₀. The steady-state k_d is this long-time limit."}
      </Note>
      <Row>
        <button onClick={toggle} style={btnStyle(running)}>{running ? (isKo ? "일시정지" : "Pause") : (isKo ? "실행" : "Run")}</button>
        <button onClick={reset} style={btnStyle()}>{isKo ? "새로 뿌리기" : "Reset"}</button>
        <Pill color={C.textDim}>{`c₀ = ${c0.toFixed(2)},  dt = ${DT},  ${isKo ? "외벽 반사" : "reflecting wall"} r = ${ROUT}`}</Pill>
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <canvas ref={canvasRef} width={340} height={340} style={{ width: 340, height: "auto", maxWidth: "100%", borderRadius: 10, border: `1px solid ${C.border}` }} />
        <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={{ ...svgBox(W), maxWidth: W }}>
          <Axes W={W} Ht={Ht} pad={pad} xlabel="t  (R*²/D)" ylabel={isKo ? "잡힌 입자 수" : "captured"} />
          <path d={pathOf(sp, X, Y)} fill="none" stroke="#64748b" strokeWidth={1.6} strokeDasharray="5 4" />
          <path d={pathOf(tp, X, Y)} fill="none" stroke={C.amber} strokeWidth={2.2} />
          <path d={pathOf(hist, X, Y)} fill="none" stroke={C.sky} strokeWidth={2.4} />
          {[0, 0.5, 1, 1.5].map(v => <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
          {[0, 0.5, 1].map(f => <text key={f} x={pad - 6} y={Y(f * yMax / 1.08) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{Math.round(f * yMax / 1.08)}</text>)}
          <text x={X(0.05)} y={Y(yMax * 0.92)} fill={C.amber} fontSize={11}>{isKo ? "이론 (과도항 포함)" : "theory (with transient)"}</text>
          <text x={X(0.05)} y={Y(yMax * 0.84)} fill="#94a3b8" fontSize={11}>{isKo ? "정상 상태 4πR*Dc₀t" : "steady state 4πR*Dc₀t"}</text>
          <text x={X(0.05)} y={Y(yMax * 0.76)} fill={C.sky} fontSize={11}>{isKo ? "시뮬레이션" : "simulation"}</text>
        </svg>
      </div>
      <StatGrid>
        <Stat label="t" value={last[0].toFixed(2)} color={C.textDim} />
        <Stat label={isKo ? "잡힌 수 (시뮬레이션)" : "captured (simulation)"} value={String(last[1])} color={C.sky} />
        <Stat label={isKo ? "이론" : "theory"} value={theo(last[0]).toFixed(0)} color={C.amber} />
        <Stat label={isKo ? "비 (시뮬레이션/이론)" : "ratio (simulation/theory)"} value={last[0] > 0 ? (last[1] / theo(last[0])).toFixed(3) : "—"} color={C.accent} />
      </StatGrid>
      <Note>
        {isKo
          ? "비는 Monte Carlo 잡음 범위(수 %) 안에서 1 근처입니다. 유한한 시간 간격 dt 동안 구를 '스치고 지나간' 경로를 놓치지 않도록, 각 걸음마다 Brownian 다리 확률 exp[−(r₀−1)(r₁−1)/(D·dt)]로 포획을 보정했습니다. 같은 계산을 4개 언어로 담은 코드가 Raw 코드 탭에 있습니다."
          : "The ratio stays near 1 within the Monte Carlo noise (a few percent). So that paths which graze the sphere within one time step dt are not missed, every step applies the Brownian-bridge capture probability exp[−(r₀−1)(r₁−1)/(D·dt)]. The same calculation in four languages is in the Raw Codes tab."}
      </Note>
    </Card>
  );
}

// =============================================================
// 4) MATERIAL BALANCE (REACTION–DIFFUSION–CONVECTION)
// =============================================================
function TransportTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <MaterialBalanceLab isKo={isKo} />
      <SteadySourceCard isKo={isKo} />
    </div>
  );
}

function MaterialBalanceLab({ isKo }) {
  const [D, setD] = useState(1.0);         // 1e-9 m^2/s
  const [v, setV] = useState(200);         // um/s
  const [k, setK] = useState(20);          // 1/s
  const [tms, setTms] = useState(40);      // ms
  const [playing, setPlaying] = useState(false);
  const [fd, setFd] = useState(null);
  const rafRef = useRef(null);
  useEffect(() => {
    if (!playing) return undefined;
    let last = null;
    const tick = ts => {
      if (last === null) last = ts;
      const dtms = (ts - last) / 1000 * 40;     // 40 ms of model time per second
      last = ts;
      setTms(t => {
        const nt = t + dtms;
        if (nt >= 150) { setPlaying(false); return 150; }
        return nt;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);
  const Dsi = D * 1e-9, vsi = v * 1e-6, t = Math.max(tms, 0.5) * 1e-3;
  const sig = Math.sqrt(2 * Dsi * t) * 1e6;     // um
  const mean = vsi * t * 1e6;                   // um
  const amt = Math.exp(-k * t);
  const peak0 = 1 / (Math.sqrt(2 * Math.PI) * sig);
  const cx = (x, kk) => Math.exp(-((x - mean) ** 2) / (2 * sig * sig)) / (Math.sqrt(2 * Math.PI) * sig) * Math.exp(-kk * t);
  const xr = 60;
  const W = 680, Ht = 300, pad = 50;
  const yMaxP = Math.max(peak0, 1e-9) * 1.15;
  const { X, Y } = plotScale(-xr, xr, 0, yMaxP, W, Ht, pad);
  const pr = [], pn = [];
  for (let j = 0; j <= 300; j++) { const x = -xr + 2 * xr * j / 300; pr.push([x, cx(x, k)]); pn.push([x, cx(x, 0)]); }
  const fdValid = fd && fd.D === D && fd.v === v && fd.k === k && Math.abs(fd.tms - tms) < 1e-9;
  const runFD = () => {
    const nx = 801, L = 2 * xr * 1e-6, dx = L / (nx - 1);
    const xs = new Float64Array(nx);
    for (let i = 0; i < nx; i++) xs[i] = -xr * 1e-6 + i * dx;
    const t0 = Math.min(1e-3, t / 2);
    const pulse = (xx, tt) => Math.exp(-((xx - vsi * tt) ** 2) / (4 * Dsi * tt)) / (2 * Math.sqrt(Math.PI * Dsi * tt)) * Math.exp(-k * tt);
    let c = new Float64Array(nx), cn = new Float64Array(nx);
    for (let i = 0; i < nx; i++) c[i] = pulse(xs[i], t0);
    const h0 = 0.2 * dx * dx / Dsi;
    let tt = t0;
    while (tt < t - 1e-15) {
      const h = Math.min(h0, t - tt);
      for (let i = 1; i < nx - 1; i++)
        cn[i] = c[i] + h * (Dsi * (c[i + 1] - 2 * c[i] + c[i - 1]) / (dx * dx) - vsi * (c[i + 1] - c[i - 1]) / (2 * dx) - k * c[i]);
      cn[0] = cn[nx - 1] = 0;
      const tmp = c; c = cn; cn = tmp; tt += h;
    }
    let err = 0, pk = 0, mass = 0;
    const pts = [];
    for (let i = 0; i < nx; i++) {
      const a = pulse(xs[i], t);
      err = Math.max(err, Math.abs(c[i] - a)); pk = Math.max(pk, a); mass += c[i] * dx;
      if (i % 16 === 0) pts.push([xs[i] * 1e6, c[i] * 1e-6]);
    }
    setFd({ D, v, k, tms, err: err / pk, mass, pts });
  };
  return (
    <Card>
      <Hd>{isKo ? "물질수지 식: 확산 + 대류 + 반응" : "The material-balance equation: diffusion + convection + reaction"}</Hd>
      <Eq>{"∂[J]/∂t = D ∂²[J]/∂x² − v ∂[J]/∂x − k_r[J]      " + (isKo ? "(확산: 무작위 걸음 · 대류: 흐름 · 반응: 소멸)" : "(diffusion: random walk · convection: flow · reaction: loss)")}</Eq>
      <Eq>{"v = 0:  [J] = n₀ e^(−x²/4Dt) / A(πDt)^½   →   " + (isKo ? "반응 추가: " : "with reaction: ") + "[J]* = [J] e^(−k_r t)"}</Eq>
      <Row>
        <Slider label="D" value={D} min={0.1} max={5} step={0.1} onChange={setD} unit=" ×10⁻⁹ m²/s" width={130} fmt={v2 => v2.toFixed(1)} />
        <Slider label="v" value={v} min={0} max={600} step={10} onChange={setV} unit=" μm/s" width={130} />
        <Slider label="k_r" value={k} min={0} max={100} step={1} onChange={setK} unit=" s⁻¹" width={130} />
        <Slider label="t" value={tms} min={0.5} max={150} step={0.5} onChange={setTms} unit=" ms" width={150} fmt={v2 => v2.toFixed(1)} />
        <button onClick={() => { if (tms >= 150) setTms(0.5); setPlaying(p => !p); }} style={{ ...btnStyle(playing), padding: "6px 12px", fontSize: 12 }}>
          {playing ? (isKo ? "정지" : "Stop") : (isKo ? "재생" : "Play")}
        </button>
        <button onClick={runFD} style={{ ...btnStyle(), padding: "6px 12px", fontSize: 12 }}>{isKo ? "유한차분으로 검산" : "Check with finite differences"}</button>
      </Row>
      <StatGrid>
        <Stat label={isKo ? "남은 양 = e^(−k_r t)" : "amount left = e^(−k_r t)"} value={amt.toFixed(4)} color={C.accent} />
        <Stat label={isKo ? "평균 위치 = vt" : "mean position = vt"} value={`${mean.toFixed(2)} μm`} color={C.amber} />
        <Stat label={isKo ? "퍼짐 σ = √(2Dt)" : "spread σ = √(2Dt)"} value={`${sig.toFixed(2)} μm`} color={C.sky} />
        <Stat label={isKo ? "대류/확산 = vt/σ" : "convection/diffusion = vt/σ"} value={(mean / sig).toFixed(2)} color={C.pink} />
      </StatGrid>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel="x [μm]" ylabel={isKo ? "[J] / n₀ (단위 넓이당)" : "[J] / n₀ (per unit area)"} />
        <line x1={X(0)} y1={pad - 6} x2={X(0)} y2={Ht - pad} stroke="#334155" strokeDasharray="3 4" />
        <path d={pathOf(pn, X, Y)} fill="none" stroke="#64748b" strokeWidth={1.8} strokeDasharray="6 4" />
        <path d={pathOf(pr, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.8} />
        <line x1={X(mean)} y1={Y(cx(mean, k))} x2={X(mean)} y2={Ht - pad} stroke={C.amber} strokeDasharray="4 3" />
        {fdValid && fd.pts.map(([x, y], i) => <circle key={i} cx={X(x)} cy={Y(y)} r={3} fill="none" stroke={C.pink} strokeWidth={1.5} />)}
        {[-60, -30, 0, 30, 60].map(v2 => <text key={v2} x={X(v2)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v2}</text>)}
        <text x={W - pad} y={pad} fill="#94a3b8" fontSize={11} textAnchor="end">{isKo ? "점선: 반응 없음 (k_r = 0)" : "dashed: no reaction (k_r = 0)"}</text>
        <text x={W - pad} y={pad + 16} fill={C.accent} fontSize={11} textAnchor="end">{isKo ? "실선: 반응 있음" : "solid: with reaction"}</text>
        {fdValid && <text x={W - pad} y={pad + 32} fill={C.pink} fontSize={11} textAnchor="end">{isKo ? "○: 유한차분 수치해" : "○: finite-difference solution"}</text>}
      </svg>
      {fdValid && (
        <StatGrid>
          <Stat label={isKo ? "최대 오차 / 최고점" : "max error / peak"} value={sci(fd.err)} color={C.pink} />
          <Stat label={isKo ? "수치해의 양" : "amount (numerical)"} value={fd.mass.toFixed(4)} color={C.pink} />
        </StatGrid>
      )}
      <Note>
        {isKo
          ? "세 항은 각자 하나씩의 일을 합니다. 확산은 펄스를 넓히고(분산 2Dt), 대류는 통째로 옮기고(평균 vt), 반응은 높이를 깎습니다(넓이 e^(−k_r t)). 1차 반응은 위치와 무관하게 모든 곳에서 같은 비율로 일어나므로, 반응이 있는 해는 반응이 없는 해에 e^(−k_r t)를 곱하기만 하면 됩니다. 강의의 n₀/A(πDt)^½은 x = 0에 벽이 있어 한쪽으로만 퍼지는 경우이고, 여기서는 양쪽으로 퍼지는 무한 영역이라 분모에 2가 더 붙습니다. 대류/확산 비 vt/σ가 1보다 크면 흐름이, 작으면 확산이 물질 이동을 지배합니다. 이 비가 Péclet 수의 출발점입니다. '유한차분으로 검산'을 누르면 같은 식을 직접 수치로 풀어 해석해와 비교합니다."
          : "Each term does one job. Diffusion widens the pulse (variance 2Dt), convection carries it bodily (mean vt), and reaction shaves its height (area e^(−k_r t)). A first-order reaction removes the same fraction everywhere, so the solution with reaction is simply the solution without reaction times e^(−k_r t). The lecture's n₀/A(πDt)^½ describes spreading into one side only, from a wall at x = 0; here the pulse spreads both ways in an unbounded domain, which puts an extra factor 2 in the denominator. When the ratio vt/σ exceeds 1, flow dominates transport; when it is below 1, diffusion does. That ratio is the seed of the Péclet number. 'Check with finite differences' solves the same equation numerically and compares it with the analytic result."}
      </Note>
    </Card>
  );
}

function SteadySourceCard({ isKo }) {
  const [D, setD] = useState(1.0);         // 1e-9 m^2/s
  const [k, setK] = useState(100);         // 1/s
  const [v, setV] = useState(0);           // um/s
  const Dsi = D * 1e-9, vsi = v * 1e-6;
  const root = Math.sqrt(vsi * vsi + 4 * Dsi * k);
  const lp = (vsi + root) / (2 * Dsi);     // decay rate upstream (x < 0): c ~ e^{lp x}
  const lm = (vsi - root) / (2 * Dsi);     // downstream (x > 0): c ~ e^{lm x}
  const ell = Math.sqrt(Dsi / k) * 1e6;
  const xr = Math.max(8 * ell, 20);
  const W = 680, Ht = 260, pad = 46;
  const { X, Y } = plotScale(-xr, xr, 0, 1.08, W, Ht, pad);
  const pts = [];
  for (let j = 0; j <= 300; j++) {
    const x = -xr + 2 * xr * j / 300;
    pts.push([x, x < 0 ? Math.exp(lp * x * 1e-6) : Math.exp(lm * x * 1e-6)]);
  }
  return (
    <Card>
      <Hd>{isKo ? "반응하는 물질은 얼마나 멀리 가는가: 반응–확산 길이" : "How far does a reactive species travel? The reaction–diffusion length"}</Hd>
      <Eq>{"0 = D c″ − v c′ − k_r c   ⇒   c ∝ e^(λx),  λ = [v ± √(v² + 4Dk_r)] / 2D      v = 0:  c ∝ e^(−|x|/ℓ),  ℓ = √(D/k_r)"}</Eq>
      <Row>
        <Slider label="D" value={D} min={0.1} max={5} step={0.1} onChange={setD} unit=" ×10⁻⁹ m²/s" width={140} fmt={v2 => v2.toFixed(1)} />
        <Slider label="k_r" value={k} min={1} max={1000} step={1} onChange={setK} unit=" s⁻¹" width={140} />
        <Slider label="v" value={v} min={0} max={2000} step={10} onChange={setV} unit=" μm/s" width={140} />
      </Row>
      <StatGrid>
        <Stat label="ℓ = √(D/k_r)" value={`${ell.toFixed(2)} μm`} color={C.accent} />
        <Stat label={isKo ? "하류 감쇠 길이 1/|λ₋|" : "downstream decay length 1/|λ₋|"} value={`${(1e6 / Math.abs(lm)).toFixed(2)} μm`} color={C.amber} />
        <Stat label={isKo ? "상류 감쇠 길이 1/λ₊" : "upstream decay length 1/λ₊"} value={`${(1e6 / lp).toFixed(2)} μm`} color={C.sky} />
        <Stat label={isKo ? "v/√(Dk_r) (대류 세기)" : "v/√(Dk_r) (strength of flow)"} value={(vsi / Math.sqrt(Dsi * k)).toFixed(2)} color={C.pink} />
      </StatGrid>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "원천으로부터의 거리 x [μm]" : "distance from the source x [μm]"} ylabel="c / c(0)" />
        <line x1={X(0)} y1={pad - 6} x2={X(0)} y2={Ht - pad} stroke={C.err} strokeWidth={2} />
        <path d={pathOf(pts, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.8} />
        {[-1, -0.5, 0, 0.5, 1].map(f => <text key={f} x={X(f * xr)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{(f * xr).toFixed(0)}</text>)}
        <text x={X(0) + 6} y={pad + 4} fill={C.err} fontSize={11}>{isKo ? "연속 원천" : "steady source"}</text>
      </svg>
      <Note>
        {isKo
          ? "한 점에서 반응성 물질이 계속 만들어지고(예: 전극 표면의 라디칼, 빛을 받은 감광제 주변의 산) 1차 반응으로 사라지면, 정상 상태 농도는 지수적으로 줄어들고 그 길이 척도가 ℓ = √(D/k_r)입니다. 물속 작은 분자(D ≈ 10⁻⁹ m²/s)가 k_r = 100 s⁻¹로 사라지면 ℓ ≈ 3 μm입니다. 수명이 짧을수록(k_r 큼) 영향 범위가 좁아지고, ℓ는 k_r의 제곱근에만 반비례하므로 수명을 100배 줄여야 범위가 10배 줄어듭니다. 흐름을 켜면 하류 쪽으로 꼬리가 길어지고 상류 쪽은 짧아집니다. 이 길이와 계의 크기를 비교한 것이 Damköhler 수(반응 속도 대 수송 속도)이고, 물리화학 2 term paper Subject 2의 핵심 도구입니다."
          : "If a reactive species is produced continuously at one point (radicals at an electrode, acid around an exposed photoacid generator) and removed by a first-order reaction, the steady-state concentration decays exponentially with length scale ℓ = √(D/k_r). A small molecule in water (D ≈ 10⁻⁹ m²/s) destroyed at k_r = 100 s⁻¹ reaches ℓ ≈ 3 μm. A shorter lifetime (larger k_r) shrinks the range, but only as the square root: cutting the lifetime a hundredfold shrinks the range only tenfold. Switch on the flow and the tail stretches downstream while the upstream side shortens. Comparing this length with the system size gives the Damköhler number (reaction rate versus transport rate), a central tool for Subject 2 of the term paper."}
      </Note>
    </Card>
  );
}

// =============================================================
// 5) TRANSITION STATE THEORY (EYRING)
// =============================================================
function TstTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <EyringDerivationCard isKo={isKo} />
      <QvibLab isKo={isKo} />
      <EyringLab isKo={isKo} />
      <TstCollisionCard isKo={isKo} />
    </div>
  );
}

function EyringDerivationCard({ isKo }) {
  const steps = [
    {
      h: isKo ? "(a) 활성화 착물과의 준평형" : "(a) Quasi-equilibrium with the activated complex",
      eq: "A + B ⇌ C‡,  K‡ = p_C‡ p° / (p_A p_B),  [C‡] = (RT/p°) K‡[A][B]      C‡ → P,  v = k‡[C‡] = (RT/p°) k‡K‡ [A][B]",
      ko: "반응물과 장벽 꼭대기의 착물 C‡가 평형에 있다고 가정합니다. 그러면 C‡의 농도는 평형 상수로 정해지고, 속도는 그 농도에 '착물이 넘어가는 빈도' k‡를 곱한 것입니다.",
      en: "Assume the reactants are in equilibrium with the complex C‡ at the top of the barrier. Its concentration then follows from an equilibrium constant, and the rate is that concentration times the frequency k‡ with which the complex passes over.",
    },
    {
      h: isKo ? "(b) 착물이 넘어가는 빈도" : "(b) How often the complex passes over",
      eq: "k‡ = κ ν‡      (κ: transmission coefficient,  ν‡: frequency of motion along the reaction coordinate)",
      ko: "반응 좌표 방향의 운동을 아주 무른 진동으로 봅니다. ν‡는 그 진동수이고, κ는 꼭대기에 도달한 착물 가운데 실제로 생성물 쪽으로 넘어가는 분율입니다(보통 1 근처).",
      en: "Motion along the reaction coordinate is treated as a very soft vibration with frequency ν‡; κ is the fraction of complexes reaching the top that actually cross to products (usually close to 1).",
    },
    {
      h: isKo ? "(c) 분배 함수로 착물 세기" : "(c) Counting the complex with partition functions",
      eq: "K‡ = N_A q_C‡ / (q_A q_B) · e^(−ΔE₀/kT),   q_vib = 1/(1 − e^(−hν/kT)) → kT/hν  (hν ≪ kT)   ⇒   K‡ ≈ (kT/hν‡) K̄‡",
      ko: "희박한 계에서 [X] ∝ q_X e^(μ/kT)이고 평형 조건 μ_C‡ = μ_A + μ_B에서 K‡가 분배 함수의 비로 나옵니다. 착물의 분배 함수에서 반응 좌표 방향의 무른 진동 하나를 떼어 내면 kT/hν‡가 되고, 나머지를 K̄‡로 씁니다.",
      en: "For a dilute system [X] ∝ q_X e^(μ/kT), and the equilibrium condition μ_C‡ = μ_A + μ_B gives K‡ as a ratio of partition functions. Pull out of the complex's partition function the soft vibration along the reaction coordinate: it contributes kT/hν‡, and the rest is called K̄‡.",
    },
    {
      h: isKo ? "(d) Eyring 식" : "(d) The Eyring equation",
      eq: "k_r = (RT/p°) k‡K‡ = κ ν‡ (kT/hν‡)(RT/p°) K̄‡ = κ (kT/h)(RT/p°) K̄‡",
      ko: "ν‡가 약분되어 사라집니다. 반응 좌표의 진동수를 몰라도 되고, 모든 반응에 공통인 보편 빈도 kT/h(298 K에서 6.2×10¹² s⁻¹)가 남습니다. 남은 문제는 K̄‡, 곧 착물의 구조(질량, 관성 모멘트, 진동수)를 아는 것입니다.",
      en: "ν‡ cancels. We need not know the frequency of the reaction coordinate; what remains is the universal frequency kT/h (6.2×10¹² s⁻¹ at 298 K), common to every reaction. The remaining task is K̄‡, that is, knowing the structure of the complex (masses, moments of inertia, frequencies).",
    },
  ];
  return (
    <Card>
      <Hd>{isKo ? "전이상태 이론: 장벽 꼭대기의 분자를 센다" : "Transition state theory: count the molecules at the top of the barrier"}</Hd>
      <Note>
        {isKo
          ? "충돌 이론은 분자를 딱딱한 공으로 보기 때문에 P를 계산할 수 없었습니다. 전이상태 이론은 분자의 내부 구조를 통계역학(분배 함수)으로 다룹니다. 그래서 충돌 이론이 실험값에 맞추어야 했던 입체 인자가 엔트로피의 언어로 자연스럽게 나옵니다. 유도는 네 단계입니다."
          : "Collision theory treats molecules as hard balls and therefore cannot compute P. Transition state theory treats internal structure with statistical mechanics (partition functions), so the steric factor that collision theory had to fit to experiment appears naturally in the language of entropy. The derivation takes four steps."}
      </Note>
      {steps.map((st, i) => (
        <div key={i} style={{ marginTop: 10 }}>
          <HdSub>{st.h}</HdSub>
          <Eq>{st.eq}</Eq>
          <Note>{isKo ? st.ko : st.en}</Note>
        </div>
      ))}
    </Card>
  );
}

function QvibLab({ isKo }) {
  const [lwn, setLwn] = useState(2.0);       // log10 wavenumber [cm^-1]
  const [T, setT] = useState(298);
  const wn = Math.pow(10, lwn);
  const x = wn * 100 * C2RAD / T;
  const ex = 1 / (1 - Math.exp(-x)), ap = 1 / x;
  const W = 680, Ht = 300, pad = 54;
  const { X, Y } = plotScale(0, 3.5, -1.5, 2.5, W, Ht, pad);
  const pe = [], pa = [];
  for (let j = 0; j <= 200; j++) {
    const lw = 3.5 * j / 200, xx = Math.pow(10, lw) * 100 * C2RAD / T;
    pe.push([lw, Math.log10(1 / (1 - Math.exp(-xx)))]);
    pa.push([lw, Math.max(-1.5, Math.log10(1 / xx))]);
  }
  return (
    <Card>
      <Hd>{isKo ? "진동 분배 함수: 언제 kT/hν가 되는가" : "The vibrational partition function: when does it become kT/hν?"}</Hd>
      <Eq>{"E_n = (n + ½)hν   ⇒   q_vib = Σ e^(−E_n/kT) = e^(−hν/2kT) / (1 − e^(−hν/kT))   " + (isKo ? "(ZPE 제외: " : "(ZPE excluded: ") + "1/(1 − e^(−hν/kT)) ≈ kT/hν)"}</Eq>
      <Row>
        <Slider label={isKo ? "진동수 ν̃" : "wavenumber ν̃"} value={lwn} min={0} max={3.5} step={0.01} onChange={setLwn} unit=" cm⁻¹" width={200} fmt={v => Math.pow(10, v).toFixed(v < 1 ? 1 : 0)} />
        <Slider label="T" value={T} min={100} max={2000} step={10} onChange={setT} unit=" K" width={180} />
      </Row>
      <StatGrid>
        <Stat label="hν/kT" value={x.toFixed(3)} color={C.textDim} />
        <Stat label={isKo ? "정확한 q_vib" : "exact q_vib"} value={ex.toFixed(4)} color={C.accent} />
        <Stat label={isKo ? "근사 kT/hν" : "approximation kT/hν"} value={ap.toFixed(4)} color={C.amber} />
        <Stat label={isKo ? "근사의 오차" : "error of the approximation"} value={`${(100 * (ap - ex) / ex).toFixed(1)} %`} color={Math.abs(ap - ex) / ex < 0.1 ? C.ok : C.err} />
      </StatGrid>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "진동수 ν̃ [cm⁻¹] (로그)" : "wavenumber ν̃ [cm⁻¹] (log)"} ylabel="log₁₀ q_vib" />
        <path d={pathOf(pa, X, Y)} fill="none" stroke={C.amber} strokeWidth={2} strokeDasharray="6 4" />
        <path d={pathOf(pe, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.8} />
        <line x1={X(Math.log10(KB * T / (HPL * 2.99792458e10)))} y1={pad - 6} x2={X(Math.log10(KB * T / (HPL * 2.99792458e10)))} y2={Ht - pad} stroke={C.pink} strokeDasharray="3 4" />
        <text x={X(Math.log10(KB * T / (HPL * 2.99792458e10))) + 5} y={pad + 4} fill={C.pink} fontSize={11}>kT/hc = {(KB * T / (HPL * 2.99792458e10)).toFixed(0)} cm⁻¹</text>
        <circle cx={X(lwn)} cy={Y(Math.log10(ex))} r={6} fill={C.accent} />
        {[1, 10, 100, 1000].map(v => <text key={v} x={X(Math.log10(v))} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        {[-1, 0, 1, 2].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        <text x={W - pad} y={Y(2.2)} fill={C.accent} fontSize={11} textAnchor="end">{isKo ? "실선: 정확한 값" : "solid: exact"}</text>
        <text x={W - pad} y={Y(1.9)} fill={C.amber} fontSize={11} textAnchor="end">{isKo ? "점선: kT/hν" : "dashed: kT/hν"}</text>
      </svg>
      <Note>
        {isKo
          ? "근사 kT/hν는 hν ≪ kT, 곧 진동수가 kT/hc(298 K에서 약 207 cm⁻¹)보다 훨씬 낮을 때만 맞습니다. 보통의 결합 진동(1000 cm⁻¹ 이상)은 실온에서 바닥 상태에 갇혀 q_vib ≈ 1이고, kT/hν(≈ 0.2)는 완전히 틀립니다. 그런데 Eyring 유도에서 이 근사를 쓰는 곳은 반응 좌표 방향의 운동, 곧 장벽 꼭대기에서 거의 복원력이 없는 매우 '무른' 모드입니다. 그 모드에서는 ν‡ → 0이므로 근사가 정확해지고, 그 덕분에 ν‡가 약분되어 kT/h만 남습니다. 강의 16쪽에서 ν_C‡ = ν_A = ν_B로 놓고 나머지 진동을 약분하는 단계는 계산을 단순하게 하려는 가정입니다."
          : "The approximation kT/hν holds only when hν ≪ kT, that is, for frequencies far below kT/hc (about 207 cm⁻¹ at 298 K). An ordinary bond vibration (1000 cm⁻¹ and up) is frozen in its ground state at room temperature, q_vib ≈ 1, and kT/hν (≈ 0.2) is badly wrong. But the Eyring derivation uses the approximation only for motion along the reaction coordinate, an extremely 'soft' mode with almost no restoring force at the top of the barrier. There ν‡ → 0, the approximation becomes exact, and ν‡ cancels to leave kT/h. Setting ν_C‡ = ν_A = ν_B on lecture page 16 to cancel the remaining vibrations is a simplifying assumption."}
      </Note>
    </Card>
  );
}

function EyringLab({ isKo }) {
  const [dH, setDH] = useState(60);          // kJ/mol
  const [dS, setDS] = useState(-50);         // J/K/mol
  const [T, setT] = useState(298);
  const [kap, setKap] = useState(1.0);
  const kfun = TT => kap * KB * TT / HPL * Math.exp(dS / RGAS) * Math.exp(-dH * 1e3 / (RGAS * TT));
  const k = kfun(T);
  const Ea = dH + RGAS * T / 1e3;
  const A = Math.E * kap * KB * T / HPL * Math.exp(dS / RGAS);
  const W = 680, Ht = 300, pad = 56;
  const T1 = 250, T2 = 500;
  const y1 = Math.log(kfun(T1) / T1), y2 = Math.log(kfun(T2) / T2);
  const { X, Y } = plotScale(1000 / T2, 1000 / T1, Math.min(y1, y2) - 1, Math.max(y1, y2) + 1, W, Ht, pad);
  const pts = [];
  for (let j = 0; j <= 100; j++) { const TT = T1 + (T2 - T1) * j / 100; pts.push([1000 / TT, Math.log(kfun(TT) / TT)]); }
  return (
    <Card>
      <Hd>{isKo ? "Eyring 실험실: 활성화 엔탈피와 엔트로피" : "Eyring lab: enthalpy and entropy of activation"}</Hd>
      <Eq>{"k_r = κ (kT/h) e^(ΔS‡/R) e^(−ΔH‡/RT)      ln(k/T) = ln(κk_B/h) + ΔS‡/R − ΔH‡/RT      Ea = ΔH‡ + RT,  A = e κ (kT/h) e^(ΔS‡/R)"}</Eq>
      <Row>
        <Slider label="ΔH‡" value={dH} min={10} max={150} step={1} onChange={setDH} unit=" kJ/mol" width={150} />
        <Slider label="ΔS‡" value={dS} min={-150} max={50} step={1} onChange={setDS} unit=" J/K/mol" width={150} />
        <Slider label="T" value={T} min={250} max={500} step={1} onChange={setT} unit=" K" width={130} />
        <Slider label="κ" value={kap} min={0.1} max={1} step={0.01} onChange={setKap} width={110} fmt={v => v.toFixed(2)} />
      </Row>
      <StatGrid>
        <Stat label="kT/h" value={`${sci(KB * T / HPL)} s⁻¹`} color={C.textDim} />
        <Stat label={isKo ? "k_r (c° = 1 mol dm⁻³ 기준)" : "k_r (per c° = 1 mol dm⁻³)"} value={sci(k)} color={C.accent} />
        <Stat label="e^(ΔS‡/R)" value={sci(Math.exp(dS / RGAS))} color={C.pink} />
        <Stat label="Ea = ΔH‡ + RT" value={`${Ea.toFixed(1)} kJ/mol`} color={C.amber} />
        <Stat label="A = e κ (kT/h) e^(ΔS‡/R)" value={sci(A)} color={C.purple} />
        <Stat label={isKo ? "반감기 (1차로 볼 때)" : "half-life (if first order)"} value={`${sci(Math.LN2 / k)} s`} color={C.sky} />
      </StatGrid>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel="1000 / T [K⁻¹]" ylabel="ln(k/T)" />
        <path d={pathOf(pts, X, Y)} fill="none" stroke={C.pink} strokeWidth={2.6} />
        <circle cx={X(1000 / T)} cy={Y(Math.log(k / T))} r={6} fill={C.accent} />
        {[2.0, 2.4, 2.8, 3.2, 3.6, 4.0].map(v => <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v.toFixed(1)}</text>)}
        <text x={W - pad} y={pad + 4} fill={C.pink} fontSize={11} textAnchor="end">{isKo ? "기울기 = −ΔH‡/R,  절편 → ΔS‡" : "slope = −ΔH‡/R,  intercept → ΔS‡"}</text>
      </svg>
      <Note>
        {isKo
          ? "Eyring 식은 속도 상수를 활성화 Gibbs 에너지 ΔG‡ = ΔH‡ − TΔS‡로 씁니다. ΔH‡는 Arrhenius의 Ea와 거의 같고(용액에서 Ea = ΔH‡ + RT), ΔS‡가 새로운 정보입니다. 두 분자가 하나의 착물로 묶이면 병진·회전 자유도를 잃으므로 이분자 반응의 ΔS‡는 보통 음수이고, e^(ΔS‡/R)가 1보다 작아집니다. 이것이 충돌 이론의 입체 인자 P를 열역학의 언어로 다시 쓴 것입니다. 기본값(ΔS‡ = −50 J K⁻¹ mol⁻¹)에서 e^(ΔS‡/R) ≈ 2.4×10⁻³인데, 이는 표의 2ClO 반응의 P와 같은 수준입니다. 실험에서는 ln(k/T)를 1/T에 대해 그린 Eyring 그림의 기울기에서 ΔH‡를, 절편에서 ΔS‡를 얻습니다."
          : "The Eyring equation writes the rate constant through the Gibbs energy of activation, ΔG‡ = ΔH‡ − TΔS‡. ΔH‡ is nearly the Arrhenius Ea (in solution Ea = ΔH‡ + RT); ΔS‡ is the new information. When two molecules are bound into one complex they lose translational and rotational freedom, so ΔS‡ of a bimolecular reaction is usually negative and e^(ΔS‡/R) < 1. That is the steric factor P of collision theory rewritten in the language of thermodynamics. At the default (ΔS‡ = −50 J K⁻¹ mol⁻¹), e^(ΔS‡/R) ≈ 2.4×10⁻³, the same order as P for the 2ClO reaction in the table. Experimentally, an Eyring plot of ln(k/T) against 1/T gives ΔH‡ from the slope and ΔS‡ from the intercept."}
      </Note>
    </Card>
  );
}

function TstCollisionCard({ isKo }) {
  const [mAu, setMA] = useState(1.008);
  const [mBu, setMB] = useState(35.45);
  const [r, setR] = useState(0.30);           // nm
  const [T, setT] = useState(300);
  const mA = mAu * AMU, mB = mBu * AMU, mu = mA * mB / (mA + mB), rr = r * 1e-9;
  const I = mu * rr * rr;
  const Lam = m => HPL / Math.sqrt(2 * Math.PI * m * KB * T);
  const p0 = 1e5, Vm = RGAS * T / p0;
  const Kbar = NAV * Math.pow(Lam(mA), 3) * Math.pow(Lam(mB), 3) / (Math.pow(Lam(mA + mB), 3) * Vm) * (2 * I * KB * T / (HBAR * HBAR));
  const ktst = KB * T / HPL * (RGAS * T / p0) * Kbar * 1e3;
  const kct = NAV * Math.PI * rr * rr * Math.sqrt(8 * KB * T / (Math.PI * mu)) * 1e3;
  return (
    <Card>
      <Hd>{isKo ? "원자 두 개라면: 전이상태 이론 = 충돌 이론" : "For two atoms: transition state theory = collision theory"}</Hd>
      <Eq>{"K̄‡ = N_A Λ_A³Λ_B³/(Λ_C‡³ V_m°) · (2IkT/ℏ²) e^(−ΔE₀/RT),   I = μr²,  Λ = h/(2πmkT)^½   ⇒   k_r = N_A (8kT/πμ)^½ πr² e^(−ΔE₀/RT)"}</Eq>
      <Row>
        <Slider label="m_A" value={mAu} min={1} max={200} step={0.01} onChange={setMA} unit=" u" width={140} fmt={v => v.toFixed(2)} />
        <Slider label="m_B" value={mBu} min={1} max={200} step={0.01} onChange={setMB} unit=" u" width={140} fmt={v => v.toFixed(2)} />
        <Slider label="r" value={r} min={0.1} max={0.8} step={0.01} onChange={setR} unit=" nm" width={130} fmt={v => v.toFixed(2)} />
        <Slider label="T" value={T} min={100} max={2000} step={10} onChange={setT} unit=" K" width={130} />
      </Row>
      <StatGrid min={200}>
        <Stat label={isKo ? "TST (분배 함수로 계산)" : "TST (from partition functions)"} value={`${sci(ktst, 6)} dm³ mol⁻¹ s⁻¹`} color={C.pink} />
        <Stat label={isKo ? "충돌 이론 σ = πr²" : "collision theory σ = πr²"} value={`${sci(kct, 6)} dm³ mol⁻¹ s⁻¹`} color={C.accent} />
        <Stat label={isKo ? "비" : "ratio"} value={(ktst / kct).toFixed(10)} color={C.ok} />
      </StatGrid>
      <Note>
        {isKo
          ? "강의 17쪽의 결론을 숫자로 확인합니다. 구조가 없는 원자 A와 B가 만드는 착물은 거리 r만큼 떨어진 이원자 분자입니다. 그 분배 함수에는 병진(Λ_C‡)과 회전(2IkT/ℏ²)만 있고, 진동 하나는 반응 좌표로 빠져 kT/h가 됩니다. 정리하면 Λ_AΛ_B/Λ_C‡ = h/(2πμkT)^½이고 h²/ℏ² = 4π²이므로 모든 상수가 맞아떨어져 충돌 이론의 식이 정확히 나옵니다. 질량과 거리를 아무리 바꿔도 비는 1입니다. 거꾸로 말하면, 실제 분자에서 TST가 충돌 이론과 다른 부분, 곧 회전·진동 자유도의 변화가 입체 인자 P의 정체입니다."
          : "This checks the conclusion of lecture page 17 with numbers. Two structureless atoms A and B form a complex that is a diatomic of bond length r. Its partition function has only translation (Λ_C‡) and rotation (2IkT/ℏ²); its one vibration becomes the reaction coordinate and turns into kT/h. Since Λ_AΛ_B/Λ_C‡ = h/(2πμkT)^½ and h²/ℏ² = 4π², every constant falls into place and the collision-theory formula emerges exactly. However you change the masses and the distance, the ratio stays 1. Put the other way round: for real molecules, whatever makes TST differ from collision theory, the change in rotational and vibrational freedom, is what the steric factor P really is."}
      </Note>
    </Card>
  );
}

// =============================================================
// 6) DIFFUSION-LIMITED AGGREGATION
// =============================================================
function AggregationTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <DLALab isKo={isKo} />
      <FractalTableCard isKo={isKo} />
      <SmolCoagLab isKo={isKo} />
    </div>
  );
}

function DLALab({ isKo }) {
  const L = 401, CEN = 200;
  const [alpha, setAlpha] = useState(1.0);
  const [target, setTarget] = useState(3000);
  const [running, setRunning] = useState(false);
  const [info, setInfo] = useState({ N: 1, Rg: 0, df: null });
  const canvasRef = useRef(null);
  const simRef = useRef(null);
  const rafRef = useRef(null);

  const init = (a, seed) => {
    const grid = new Uint8Array(L * L);
    grid[CEN * L + CEN] = 1;
    simRef.current = { grid, order: [[0, 0]], rmax: 1, sum2: 0, hist: [], rand: makeRng(seed), alpha: a, walker: null, full: false };
    setInfo({ N: 1, Rg: 0, df: null });
    const cv = canvasRef.current;
    if (cv) {
      const ctx = cv.getContext("2d");
      ctx.fillStyle = "#0d1117"; ctx.fillRect(0, 0, L, L);
      ctx.fillStyle = "#fde68a"; ctx.fillRect(CEN, CEN, 1, 1);
    }
  };
  const colorFor = n => {
    const f = Math.min(1, n / Math.max(target, 1));
    const h = 170 - 120 * f;                 // teal → yellow-green
    return `hsl(${h},80%,${60 - 10 * f}%)`;
  };
  const stepSim = () => {
    const s = simRef.current;
    if (!s) return;
    const { grid, rand } = s;
    const at = (x, y) => grid[(CEN + x) * L + (CEN + y)];
    const ctx = canvasRef.current ? canvasRef.current.getContext("2d") : null;
    let budget = 300000;
    while (budget > 0 && s.order.length < target && !s.full) {
      if (!s.walker) {
        const th = 2 * Math.PI * rand();
        s.walker = [Math.round((s.rmax + 5) * Math.cos(th)), Math.round((s.rmax + 5) * Math.sin(th))];
      }
      let [x, y] = s.walker;
      const kill = Math.min(2 * s.rmax + 20, CEN - 3);
      let done = false;
      while (budget > 0) {
        budget--;
        const d = Math.floor(rand() * 4);
        const nx = x + (d === 0 ? 1 : d === 1 ? -1 : 0), ny = y + (d === 2 ? 1 : d === 3 ? -1 : 0);
        if (at(nx, ny)) continue;
        x = nx; y = ny;
        const r2 = x * x + y * y;
        if (r2 > kill * kill) { s.walker = null; done = true; break; }
        if (r2 > (s.rmax + 3) * (s.rmax + 3)) continue;
        if ((at(x + 1, y) || at(x - 1, y) || at(x, y + 1) || at(x, y - 1)) && rand() < s.alpha) {
          grid[(CEN + x) * L + (CEN + y)] = 1;
          s.order.push([x, y]);
          s.sum2 += r2;
          s.rmax = Math.max(s.rmax, Math.sqrt(r2));
          const N = s.order.length;
          s.hist.push([N, Math.sqrt(s.sum2 / N)]);
          if (ctx) { ctx.fillStyle = colorFor(N); ctx.fillRect(CEN + x, CEN - y, 1, 1); }
          s.walker = null; done = true;
          if (s.rmax > CEN - 25) s.full = true;   // stop before the cluster reaches the canvas edge
          break;
        }
      }
      if (!done) s.walker = [x, y];
    }
    const N = s.order.length;
    let df = null;
    const h = s.hist.filter(([n]) => n >= 200);
    if (h.length > 20) {
      const fit = linfit(h.map(([, rg]) => Math.log(rg)), h.map(([n]) => Math.log(n)));
      df = fit.slope;
    }
    setInfo({ N, Rg: N > 1 ? Math.sqrt(s.sum2 / N) : 0, df });
    if (N < target && !s.full) rafRef.current = requestAnimationFrame(stepSim);
    else setRunning(false);
  };
  useEffect(() => { init(1.0, 11); return () => cancelAnimationFrame(rafRef.current); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const start = () => {
    if (running) { cancelAnimationFrame(rafRef.current); setRunning(false); return; }
    setRunning(true); rafRef.current = requestAnimationFrame(stepSim);
  };
  const reset = (a = alpha) => { cancelAnimationFrame(rafRef.current); setRunning(false); init(a, Math.floor(Math.random() * 1e9)); };
  return (
    <Card>
      <Hd>{isKo ? "라이브 DLA / RLA: 무작위 걸음이 프랙탈을 만든다" : "Live DLA / RLA: random walks build a fractal"}</Hd>
      <Eq>{"k_ij^diff = 4π(R_i + R_j)(D_i + D_j),   k_ij^obs = α k_ij^diff      DLA: α = 1      RLA: α ≪ 1      N ∝ R_g^(d_f)"}</Eq>
      <Note>
        {isKo
          ? "가운데 씨앗 하나에서 시작합니다. 먼 곳에서 입자를 하나씩 풀어 격자 위를 무작위로 걷게 하고, 덩어리에 닿으면 확률 α로 달라붙게 합니다. α = 1(DLA)이면 닿자마자 붙으므로, 뻗어 나온 가지 끝이 입자를 먼저 잡아 안쪽 틈은 채워지지 않습니다(차폐 효과). 그래서 나뭇가지 모양의 성긴 구조가 됩니다. α를 0.05 정도로 낮추면(RLA) 입자가 여러 번 튕기다가 안쪽까지 들어가 붙으므로 더 촘촘하고 둥근 덩어리가 됩니다. 색은 붙은 순서입니다(청록 → 연두)."
          : "Start from a single seed in the centre. Walkers are released one at a time far away, random-walk on the lattice, and stick with probability α when they touch the cluster. With α = 1 (DLA) a walker sticks on first contact, so the tips of the branches catch walkers before they reach the gaps (screening), and an open, branched structure grows. Lower α to about 0.05 (RLA) and walkers bounce many times and penetrate before sticking, giving a denser, rounder cluster. Colour shows the order of arrival (teal → yellow-green)."}
      </Note>
      <Row>
        <Slider label={isKo ? "부착 확률 α" : "sticking probability α"} value={alpha} min={0.02} max={1} step={0.01} onChange={v => { setAlpha(v); reset(v); }} width={170} fmt={v => v.toFixed(2)} />
        <Slider label={isKo ? "목표 입자 수" : "target size"} value={target} min={500} max={5000} step={100} onChange={setTarget} width={150} />
        <button onClick={start} style={btnStyle(running)}>{running ? (isKo ? "일시정지" : "Pause") : (isKo ? "성장 시작" : "Grow")}</button>
        <button onClick={() => reset()} style={btnStyle()}>{isKo ? "처음부터" : "Reset"}</button>
        <button onClick={() => { setAlpha(1); reset(1); }} style={{ ...btnStyle(), padding: "6px 12px", fontSize: 12 }}>DLA (α = 1)</button>
        <button onClick={() => { setAlpha(0.05); reset(0.05); }} style={{ ...btnStyle(), padding: "6px 12px", fontSize: 12 }}>RLA (α = 0.05)</button>
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <canvas ref={canvasRef} width={L} height={L} style={{ width: 401, height: "auto", maxWidth: "100%", borderRadius: 10, border: `1px solid ${C.border}`, imageRendering: "pixelated" }} />
        <div style={{ flex: "1 1 240px" }}>
          <StatGrid min={150}>
            <Stat label={isKo ? "입자 수 N" : "particles N"} value={String(info.N)} color={C.accent} />
            <Stat label={isKo ? "회전 반지름 R_g" : "radius of gyration R_g"} value={info.Rg.toFixed(1)} color={C.sky} />
            <Stat label={isKo ? "프랙탈 차원 d_f (N ≥ 200 적합)" : "fractal dimension d_f (fit N ≥ 200)"} value={info.df ? info.df.toFixed(2) : "—"} color={C.amber} />
            <Stat label={isKo ? "참고: 2D DLA" : "reference: 2D DLA"} value="1.71" color={C.textDim} />
          </StatGrid>
          <Note>
            {isKo
              ? "d_f는 성장 과정의 기록(N, R_g)에서 N ∝ R_g^(d_f)로 맞춘 기울기입니다. 꽉 찬 원판이면 2, 선이면 1입니다. DLA는 수천 개 규모에서 1.7–1.8 근처가 나오고(무한히 크면 1.71), RLA는 같은 크기에서 1.9–2.0으로 더 큽니다. 입자 수가 작으면 값이 조금 높게 나오는 유한 크기 효과가 있습니다."
              : "d_f is the slope of the growth record (N, R_g) fitted to N ∝ R_g^(d_f): 2 for a filled disc, 1 for a line. DLA gives 1.7–1.8 at a few thousand particles (1.71 for an infinite cluster); RLA at the same size comes out higher, 1.9–2.0. Small clusters read slightly high, a finite-size effect."}
          </Note>
        </div>
      </div>
    </Card>
  );
}

function FractalTableCard({ isKo }) {
  const rows = [
    { m: isKo ? "입자–덩어리 DLA (Witten–Sander)" : "particle–cluster DLA (Witten–Sander)", d2: "≈ 1.71", d3: "—", src: "Witten & Sander, Phys. Rev. Lett. 47, 1400 (1981)" },
    { m: isKo ? "덩어리–덩어리, 확산 지배 (DLCA)" : "cluster–cluster, diffusion-limited (DLCA)", d2: "≈ 1.45", d3: "≈ 1.7–1.9", src: "Meakin, Phys. Rev. Lett. 51, 1119 (1983); Kolb, Botet & Jullien, Phys. Rev. Lett. 51, 1123 (1983)" },
    { m: isKo ? "덩어리–덩어리, 반응 지배 (RLCA)" : "cluster–cluster, reaction-limited (RLCA)", d2: "≈ 1.55", d3: "≈ 2.0–2.2", src: isKo ? "강의 18쪽; 3D 실험은 Lin et al., Nature 339, 360 (1989)" : "Lecture p. 18; 3D experiments in Lin et al., Nature 339, 360 (1989)" },
  ];
  return (
    <Card>
      <Hd>{isKo ? "프랙탈 차원 표: 어떤 '응집'인지 먼저 구분하자" : "Fractal dimensions: first ask which kind of aggregation"}</Hd>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 560 }}>
          <thead>
            <tr style={{ color: C.textDim, textAlign: "left" }}>
              <th style={{ padding: "6px 8px" }}>{isKo ? "모형" : "Model"}</th>
              <th style={{ padding: "6px 8px" }}>2D d_f</th>
              <th style={{ padding: "6px 8px" }}>3D d_f</th>
              <th style={{ padding: "6px 8px" }}>{isKo ? "출처" : "Source"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                <td style={{ padding: "7px 8px", fontWeight: 600 }}>{r.m}</td>
                <td style={{ padding: "7px 8px", fontFamily: mono, color: C.accent }}>{r.d2}</td>
                <td style={{ padding: "7px 8px", fontFamily: mono, color: C.amber }}>{r.d3}</td>
                <td style={{ padding: "7px 8px", fontSize: 12, color: C.textDim }}>{r.src}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note>
        {isKo
          ? "강의 18쪽의 값(2D: DLA ≈ 1.45, RLA ≈ 1.55; 3D: 1.7–1.9, 2.1–2.2)은 Smoluchowski 방정식과 함께 나오는 덩어리–덩어리 응집, 곧 덩어리 자체가 확산하며 서로 부딪혀 붙는 경우의 값입니다. 위 시뮬레이터처럼 고정된 덩어리 하나에 입자가 하나씩 붙는 Witten–Sander 모형은 2D에서 1.71로 더 큽니다. 같은 'DLA'라는 이름이 두 모형에 쓰이니 보고서에서는 어떤 모형인지 밝혀 두는 것이 좋습니다. 공통된 경향은 같습니다. 부착이 확실할수록(α → 1) 덩어리가 성기고 d_f가 작아집니다."
          : "The values on lecture page 18 (2D: DLA ≈ 1.45, RLA ≈ 1.55; 3D: 1.7–1.9, 2.1–2.2) belong to cluster–cluster aggregation, which goes with the Smoluchowski equation: the clusters themselves diffuse, collide, and stick. The Witten–Sander model in the simulator above, where particles join one fixed cluster one at a time, gives a larger value, 1.71 in 2D. The name 'DLA' is used for both, so say which model you mean in a report. The trend is the same in both: the surer the sticking (α → 1), the more open the cluster and the smaller d_f."}
      </Note>
    </Card>
  );
}

function SmolCoagLab({ isKo }) {
  const [tau, setTau] = useState(4);
  const [df, setDf] = useState(1.8);
  const cs = s => Math.pow(tau, s - 1) / Math.pow(1 + tau, s + 1);
  const W = 680, Ht = 280, pad = 50;
  const Smax = 40;
  const yMax = Math.max(cs(1), 1e-6) * 1.1;
  const { X, Y } = plotScale(0.5, Smax + 0.5, 0, yMax, W, Ht, pad);
  const bw = (X(2) - X(1)) * 0.75;
  const kern = (i, j) => (Math.pow(i, 1 / df) + Math.pow(j, 1 / df)) * (Math.pow(i, -1 / df) + Math.pow(j, -1 / df)) / 4;
  return (
    <Card>
      <Hd>{isKo ? "Smoluchowski 응집 방정식: 덩어리 크기 분포의 진화" : "The Smoluchowski coagulation equation: how the size distribution evolves"}</Hd>
      <Eq>{"dc_S/dt = ½ Σ_(i+j=S) k_ij c_i c_j − c_S Σ_j k_Sj c_j      k = const:  c_S = c₀ τ^(S−1)/(1+τ)^(S+1),  τ = k c₀ t/2,  ⟨S⟩ = 1 + τ"}</Eq>
      <Row>
        <Slider label="τ = k c₀ t / 2" value={tau} min={0} max={20} step={0.1} onChange={setTau} width={200} fmt={v => v.toFixed(1)} />
        <Slider label="d_f" value={df} min={1.2} max={3} step={0.05} onChange={setDf} width={150} fmt={v => v.toFixed(2)} />
      </Row>
      <StatGrid>
        <Stat label={isKo ? "덩어리 수 / 처음 수" : "clusters / initial"} value={(1 / (1 + tau)).toFixed(4)} color={C.accent} />
        <Stat label={isKo ? "평균 크기 ⟨S⟩ = 1 + τ" : "mean size ⟨S⟩ = 1 + τ"} value={(1 + tau).toFixed(2)} color={C.amber} />
        <Stat label={isKo ? "커널 k(S,S)/k(1,1)" : "kernel k(S,S)/k(1,1)"} value="1" color={C.textDim} />
        <Stat label="k(1,10)/k(1,1)" value={kern(1, 10).toFixed(2)} color={C.pink} />
        <Stat label="k(1,100)/k(1,1)" value={kern(1, 100).toFixed(2)} color={C.pink} />
      </StatGrid>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "덩어리 크기 S (입자 수)" : "cluster size S (particles)"} ylabel="c_S / c₀" />
        {Array.from({ length: Smax }, (_, i) => i + 1).map(s => (
          <rect key={s} x={X(s) - bw / 2} y={Y(cs(s))} width={bw} height={Math.max(Y(0) - Y(cs(s)), 0)} fill={C.lime} opacity={0.8} />
        ))}
        {[1, 10, 20, 30, 40].map(v => <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        <line x1={X(1 + tau)} y1={pad - 6} x2={X(1 + tau)} y2={Ht - pad} stroke={C.amber} strokeDasharray="4 3" />
        <text x={X(1 + tau) + 5} y={pad + 6} fill={C.amber} fontSize={11}>⟨S⟩</text>
      </svg>
      <Note>
        {isKo
          ? "강의 18쪽의 논리를 따라가 봅시다. 프랙탈 덩어리는 반지름 R_S ∝ S^(1/d_f)이고, Stokes–Einstein에 따라 확산 계수 D_S ∝ 1/R_S입니다. 그러면 k_ij ∝ (R_i + R_j)(D_i + D_j) ∝ (i^(1/d_f) + j^(1/d_f))(i^(−1/d_f) + j^(−1/d_f))가 되고, 크기가 같은 덩어리끼리는 i, j와 무관한 상수(= 4)입니다. Smoluchowski가 확산 지배 응집에서 찾아낸 '반지름이 약분된다'는 결론, 곧 k_d = 8RT/3η와 같은 이유입니다. 상수 커널이면 방정식이 정확히 풀리고 평균 크기가 시간에 정비례해 자랍니다(⟨S⟩ = 1 + τ ~ αt). 다만 위 통계의 k(1,100)이 보여 주듯, 크기가 아주 다른 덩어리끼리는 작은 쪽이 빠르고 큰 쪽이 큰 표적이라 커널이 몇 배 커집니다. 상수 커널은 분포가 너무 넓지 않을 때의 근사입니다. 막대 그래프에서 τ가 커지면 단량체가 빠르게 사라지고 분포가 넓고 평평해지는 것을 보십시오."
          : "Follow the argument on lecture page 18. A fractal cluster has radius R_S ∝ S^(1/d_f), and by Stokes–Einstein its diffusion coefficient D_S ∝ 1/R_S. Then k_ij ∝ (R_i + R_j)(D_i + D_j) ∝ (i^(1/d_f) + j^(1/d_f))(i^(−1/d_f) + j^(−1/d_f)), which for equal sizes is a constant (= 4) independent of i and j. It is the same 'the radii cancel' result that gave k_d = 8RT/3η. With a constant kernel the equation solves exactly and the mean size grows linearly in time (⟨S⟩ = 1 + τ ~ αt). But as k(1,100) above shows, for very unequal clusters the kernel grows several-fold, because the small one is fast and the large one is a big target; the constant kernel is an approximation for distributions that are not too broad. In the bar chart, watch the monomers disappear quickly as τ grows while the distribution broadens and flattens."}
      </Note>
    </Card>
  );
}

// =============================================================
// 7) PRACTICE PROBLEMS
// =============================================================
function Practice({ lang }) {
  const problems = [
    {
      ko: {
        q: "P1. 298 K, 1 bar의 N₂(M = 28.01 g/mol, σ = 0.43 nm²)에 대해 (a) 개수 밀도, (b) 상대 평균 속력, (c) 분자 하나의 충돌 빈도 z, (d) 충돌 밀도 Z_AA, (e) 이론적 A = σ c_rel N_A를 구하시오.",
        s: "(a) n = p/kT = 10⁵/(1.381×10⁻²³ × 298) = 2.43×10²⁵ m⁻³. (b) c̄ = (8kT/πm)^½ = 475 m/s, 같은 분자끼리는 μ = m/2이므로 c_rel = √2 c̄ = 671 m/s. (c) z = σ c_rel n = 0.43×10⁻¹⁸ × 671 × 2.43×10²⁵ = 7.0×10⁹ s⁻¹ (0.14 ns마다 한 번). (d) Z_AA = ½ σ c_rel n² = 8.5×10³⁴ m⁻³ s⁻¹ = 1.4×10⁸ mol dm⁻³ s⁻¹. ½은 같은 충돌을 두 번 세지 않기 위함입니다. (e) A = 0.43×10⁻¹⁸ × 671 × 6.022×10²³ = 1.74×10⁸ m³ mol⁻¹ s⁻¹ = 1.7×10¹¹ dm³ mol⁻¹ s⁻¹. 기체 반응의 이론적 A가 대개 10¹⁰–10¹¹ dm³ mol⁻¹ s⁻¹인 이유입니다.",
      },
      en: {
        q: "P1. For N₂ at 298 K and 1 bar (M = 28.01 g/mol, σ = 0.43 nm²), find (a) the number density, (b) the mean relative speed, (c) the collision frequency z of one molecule, (d) the collision density Z_AA, and (e) the theoretical A = σ c_rel N_A.",
        s: "(a) n = p/kT = 10⁵/(1.381×10⁻²³ × 298) = 2.43×10²⁵ m⁻³. (b) c̄ = (8kT/πm)^½ = 475 m/s; for like molecules μ = m/2, so c_rel = √2 c̄ = 671 m/s. (c) z = σ c_rel n = 0.43×10⁻¹⁸ × 671 × 2.43×10²⁵ = 7.0×10⁹ s⁻¹ (once every 0.14 ns). (d) Z_AA = ½ σ c_rel n² = 8.5×10³⁴ m⁻³ s⁻¹ = 1.4×10⁸ mol dm⁻³ s⁻¹; the ½ avoids counting each collision twice. (e) A = 0.43×10⁻¹⁸ × 671 × 6.022×10²³ = 1.74×10⁸ m³ mol⁻¹ s⁻¹ = 1.7×10¹¹ dm³ mol⁻¹ s⁻¹, which is why theoretical A values for gas reactions are typically 10¹⁰–10¹¹ dm³ mol⁻¹ s⁻¹.",
      },
    },
    {
      ko: {
        q: "P2. 강의 표의 A_exp와 A_theory로 네 반응의 입체 인자 P를 구하시오. 2ClO → Cl₂ + O₂는 Ea = 0인데도 왜 느린가? K + Br₂ → KBr + Br의 P가 1보다 큰 것은 어떻게 설명하는가?",
        s: "P = A_exp/A_theory: 2NOCl 9.4×10⁹/5.9×10¹⁰ = 0.16, 2ClO 6.3×10⁷/2.5×10¹⁰ = 2.5×10⁻³, H₂ + C₂H₄ 1.24×10⁶/7.4×10¹¹ = 1.7×10⁻⁶, K + Br₂ 1.0×10¹²/2.1×10¹¹ = 4.8. 2ClO는 에너지 장벽이 없어도 두 라디칼이 Cl–Cl과 O–O를 동시에 만드는 배향이어야 하므로 충돌 400번 중 한 번만 반응합니다. K + Br₂는 작살 메커니즘입니다. K가 Br₂에 닿기 전, I − E_ea = e²/4πε₀R*를 만족하는 거리(약 0.8 nm)에서 전자가 넘어가 K⁺Br₂⁻ 이온쌍이 되고, Coulomb 인력이 둘을 끌어당깁니다. 반응 단면적 πR*² ≈ 2 nm²가 강체구 단면적보다 커서 P > 1이 됩니다.",
      },
      en: {
        q: "P2. Use A_exp and A_theory from the lecture table to find the steric factor P for the four reactions. Why is 2ClO → Cl₂ + O₂ slow even though Ea = 0? How do you explain P > 1 for K + Br₂ → KBr + Br?",
        s: "P = A_exp/A_theory: 2NOCl 9.4×10⁹/5.9×10¹⁰ = 0.16; 2ClO 6.3×10⁷/2.5×10¹⁰ = 2.5×10⁻³; H₂ + C₂H₄ 1.24×10⁶/7.4×10¹¹ = 1.7×10⁻⁶; K + Br₂ 1.0×10¹²/2.1×10¹¹ = 4.8. For 2ClO there is no energy barrier, but the two radicals must be oriented to form Cl–Cl and O–O at once, so only one collision in 400 reacts. K + Br₂ is the harpoon mechanism: before K touches Br₂, at the distance where I − E_ea = e²/4πε₀R* (about 0.8 nm), the electron jumps and forms the ion pair K⁺Br₂⁻, which Coulomb attraction reels in. The reactive cross-section πR*² ≈ 2 nm² exceeds the hard-sphere value, so P > 1.",
      },
    },
    {
      ko: {
        q: "P3. RRK 모형에서 (a) s = 10개 모드를 가진 분자가 E = 2E*를 얻었을 때 반응 확률은? (b) s = 5이면? (c) 같은 E/E*에서 s가 큰 분자가 느린 물리적 이유는? (d) 열평균 k(T)는 왜 s와 무관한가?",
        s: "(a) P = (1 − ½)⁹ = 1/512 = 1.95×10⁻³. (b) (½)⁴ = 0.0625, 32배 큽니다. (c) 에너지가 무작위로 s개 모드에 퍼지는데, 반응하려면 그중 하나에 E* 이상이 모여야 합니다. 모드가 많을수록 그런 '쏠림'이 드뭅니다. 그래서 큰 분자의 단분자 반응은 충분히 에너지를 받은 뒤에도 한동안 기다려야 합니다. (d) 상태 밀도 ρ(E) ∝ E^(s−1)과 Boltzmann 인자로 평균하면 k(E)ρ(E) = ν(E − E₀)^(s−1)이므로 분자와 분모가 같은 Γ(s)(kT)^s 꼴이 되어 약분되고 k(T) = ν e^(−E₀/kT)가 남습니다. 모드가 많아 '쏠림'이 드문 효과와, 모드가 많아 높은 에너지 상태가 많은 효과가 정확히 상쇄됩니다.",
      },
      en: {
        q: "P3. In the RRK model, (a) what is the reaction probability for a molecule with s = 10 modes that has acquired E = 2E*? (b) And for s = 5? (c) Why is the molecule with larger s slower at the same E/E*? (d) Why is the thermal average k(T) independent of s?",
        s: "(a) P = (1 − ½)⁹ = 1/512 = 1.95×10⁻³. (b) (½)⁴ = 0.0625, 32 times larger. (c) The energy spreads at random over s modes, and reaction needs E* or more in one of them; the more modes, the rarer such a concentration. So a large molecule must wait a while even after it has enough energy. (d) Averaging with the density of states ρ(E) ∝ E^(s−1) and the Boltzmann factor, k(E)ρ(E) = ν(E − E₀)^(s−1), so numerator and denominator both take the form Γ(s)(kT)^s, cancel, and leave k(T) = ν e^(−E₀/kT). The rarity of concentrating energy among many modes exactly offsets the larger number of high-energy states that many modes provide.",
      },
    },
    {
      ko: {
        q: "P4. 298 K에서 확산 지배 속도 상수 k_d = 8RT/3η를 물(η = 0.890 mPa s)과 헥세인(0.300 mPa s)에서 구하시오. 물에서 잰 이분자 속도 상수가 1.0×10⁸ dm³ mol⁻¹ s⁻¹이면 이 반응은 확산 지배인가?",
        s: "물: k_d = 8 × 8.314 × 298 / (3 × 0.890×10⁻³) = 7.42×10⁶ m³ mol⁻¹ s⁻¹ = 7.4×10⁹ dm³ mol⁻¹ s⁻¹. 헥세인: 점도가 약 3배 작으므로 2.2×10¹⁰ dm³ mol⁻¹ s⁻¹. 단위에 주의하십시오. J mol⁻¹ / (Pa s) = m³ mol⁻¹ s⁻¹이고 1 m³ = 10³ dm³입니다. 측정값 1.0×10⁸은 k_d의 약 1/74이므로 만남 쌍 가운데 1.3%만 반응합니다. 활성화 지배 쪽에 가깝고, k_r = k_a K에서 k_a의 활성화 에너지가 속도를 정합니다.",
      },
      en: {
        q: "P4. Compute the diffusion-controlled rate constant k_d = 8RT/3η at 298 K in water (η = 0.890 mPa s) and hexane (0.300 mPa s). If a bimolecular rate constant measured in water is 1.0×10⁸ dm³ mol⁻¹ s⁻¹, is the reaction diffusion controlled?",
        s: "Water: k_d = 8 × 8.314 × 298 / (3 × 0.890×10⁻³) = 7.42×10⁶ m³ mol⁻¹ s⁻¹ = 7.4×10⁹ dm³ mol⁻¹ s⁻¹. Hexane: about three times less viscous, so 2.2×10¹⁰ dm³ mol⁻¹ s⁻¹. Mind the units: J mol⁻¹ / (Pa s) = m³ mol⁻¹ s⁻¹, and 1 m³ = 10³ dm³. The measured 1.0×10⁸ is about 1/74 of k_d, so only 1.3% of encounter pairs react. The reaction is closer to activation control, with k_r = k_a K governed by the activation energy of the k_a step.",
      },
    },
    {
      ko: {
        q: "P5. 만남 쌍 모형에서 k_d = 1.0×10¹⁰ dm³ mol⁻¹ s⁻¹, k_d′ = 1.0×10¹⁰ s⁻¹이다. (a) k_a = 1.0×10¹² s⁻¹, (b) k_a = 1.0×10⁸ s⁻¹일 때 k_r을 구하고 각각 어느 극한인지 말하시오.",
        s: "k_r = k_a k_d/(k_a + k_d′). (a) 10¹² × 10¹⁰/(10¹² + 10¹⁰) = 0.990×10¹⁰ dm³ mol⁻¹ s⁻¹. k_d′ ≪ k_a이므로 확산 지배이고 k_r ≈ k_d입니다. (b) 10⁸ × 10¹⁰/(10⁸ + 10¹⁰) = 9.9×10⁷ dm³ mol⁻¹ s⁻¹. k_a ≪ k_d′이므로 활성화 지배이고, k_r ≈ k_a(k_d/k_d′) = k_a K, K = 1 dm³ mol⁻¹입니다. 만남 쌍은 반응하기 전에 평균 k_d′/k_a = 100번 흩어집니다.",
      },
      en: {
        q: "P5. In the encounter-pair model k_d = 1.0×10¹⁰ dm³ mol⁻¹ s⁻¹ and k_d′ = 1.0×10¹⁰ s⁻¹. Find k_r for (a) k_a = 1.0×10¹² s⁻¹ and (b) k_a = 1.0×10⁸ s⁻¹, and name the limit in each case.",
        s: "k_r = k_a k_d/(k_a + k_d′). (a) 10¹² × 10¹⁰/(10¹² + 10¹⁰) = 0.990×10¹⁰ dm³ mol⁻¹ s⁻¹: k_d′ ≪ k_a, diffusion control, k_r ≈ k_d. (b) 10⁸ × 10¹⁰/(10⁸ + 10¹⁰) = 9.9×10⁷ dm³ mol⁻¹ s⁻¹: k_a ≪ k_d′, activation control, k_r ≈ k_a(k_d/k_d′) = k_a K with K = 1 dm³ mol⁻¹. The pair breaks up on average k_d′/k_a = 100 times before reacting.",
      },
    },
    {
      ko: {
        q: "P6. 반응 거리 R* = 0.40 nm, D_A + D_B = 4.0×10⁻⁹ m²/s인 두 분자의 확산 지배 속도 상수를 Smoluchowski 식으로 구하고, P4의 물에서의 값과 비교하시오. 정상 상태에서 r = 2R*의 농도는 bulk의 몇 %인가?",
        s: "k_d = 4πR*(D_A + D_B)N_A = 4π × 0.40×10⁻⁹ × 4.0×10⁻⁹ × 6.022×10²³ = 1.21×10⁷ m³ mol⁻¹ s⁻¹ = 1.2×10¹⁰ dm³ mol⁻¹ s⁻¹. 물에서 8RT/3η = 7.4×10⁹보다 약 1.6배 큽니다. Stokes–Einstein으로 예측한 D보다 실제 작은 분자의 D가 큰 경우가 많기 때문입니다(Stokes 식은 거시적 구에 대한 식). [B](2R*) = (1 − R*/2R*)[B]bulk = 50%. 반응 중심 주위의 고갈 영역은 반지름의 몇 배까지 넓게 퍼져 있습니다.",
      },
      en: {
        q: "P6. Two molecules react at a distance R* = 0.40 nm with D_A + D_B = 4.0×10⁻⁹ m²/s. Find the diffusion-controlled rate constant from Smoluchowski's formula and compare it with the water value of P4. At steady state, what percentage of the bulk concentration is found at r = 2R*?",
        s: "k_d = 4πR*(D_A + D_B)N_A = 4π × 0.40×10⁻⁹ × 4.0×10⁻⁹ × 6.022×10²³ = 1.21×10⁷ m³ mol⁻¹ s⁻¹ = 1.2×10¹⁰ dm³ mol⁻¹ s⁻¹, about 1.6 times the water value 8RT/3η = 7.4×10⁹. Small molecules often diffuse faster than Stokes–Einstein predicts (Stokes' law is for macroscopic spheres). [B](2R*) = (1 − R*/2R*)[B]bulk = 50%: the depleted zone around a reaction centre extends several radii out.",
      },
    },
    {
      ko: {
        q: "P7. 물속에서 D = 1.0×10⁻⁹ m²/s인 물질이 x = 0에 펄스로 주입되고 k_r = 50 s⁻¹의 1차 반응으로 사라진다. 흐름 속도는 v = 2.0 μm/s이다. t = 30 ms에서 (a) 남은 양의 분율, (b) 퍼짐 σ, (c) 이동 거리를 구하고, (d) 대류가 중요한지 판단하시오. (e) 연속 원천이라면 반응–확산 길이는?",
        s: "(a) e^(−k_r t) = e^(−1.5) = 0.223. (b) σ = √(2Dt) = √(2 × 10⁻⁹ × 0.030) = 7.75 μm. (c) vt = 2.0 × 0.030 = 0.060 μm. (d) vt/σ = 0.008 ≪ 1이므로 대류는 무시할 수 있고 확산이 지배합니다. (e) ℓ = √(D/k_r) = √(10⁻⁹/50) = 4.47 μm. 반응이 확산을 몇 μm 안에 묶어 둡니다. Raw 코드 탭의 유한차분 계산이 (a)–(c)를 각각 0.22312, 0.0600 μm, 분산 60.00 μm²로 재현합니다.",
      },
      en: {
        q: "P7. A species with D = 1.0×10⁻⁹ m²/s in water is injected as a pulse at x = 0 and destroyed by a first-order reaction with k_r = 50 s⁻¹, while the liquid flows at v = 2.0 μm/s. At t = 30 ms find (a) the fraction remaining, (b) the spread σ, (c) the distance travelled, and (d) decide whether convection matters. (e) For a continuous source, what is the reaction–diffusion length?",
        s: "(a) e^(−k_r t) = e^(−1.5) = 0.223. (b) σ = √(2Dt) = √(2 × 10⁻⁹ × 0.030) = 7.75 μm. (c) vt = 2.0 × 0.030 = 0.060 μm. (d) vt/σ = 0.008 ≪ 1: convection is negligible and diffusion dominates. (e) ℓ = √(D/k_r) = √(10⁻⁹/50) = 4.47 μm: reaction confines diffusion to a few micrometres. The finite-difference code in the Raw Codes tab reproduces (a)–(c) as 0.22312, 0.0600 μm, and a variance of 60.00 μm².",
      },
    },
    {
      ko: {
        q: "P8. 298.15 K에서 (a) 1000 cm⁻¹와 (b) 100 cm⁻¹ 진동의 q_vib를 정확한 식 1/(1 − e^(−hν/kT))와 근사 kT/hν로 각각 구하시오. Eyring 유도에서 kT/hν 근사를 쓰는 것이 왜 정당한가?",
        s: "hc/k = 1.4388 cm K이므로 hν/kT = 1.4388ν̃/T. (a) hν/kT = 4.83: 정확 1.008, 근사 0.207 (80% 오차). (b) hν/kT = 0.483: 정확 2.61, 근사 2.07 (21% 오차). 보통의 결합 진동에서는 근사가 전혀 맞지 않습니다. Eyring 유도에서 이 근사를 쓰는 곳은 장벽 꼭대기에서 반응 좌표 방향의 운동뿐입니다. 이 모드는 복원력이 거의 없어 ν‡ → 0이므로 근사가 정확해지고, ν‡가 k‡ = κν‡와 약분되어 보편 빈도 kT/h = 6.21×10¹² s⁻¹만 남습니다.",
      },
      en: {
        q: "P8. At 298.15 K compute q_vib for vibrations of (a) 1000 cm⁻¹ and (b) 100 cm⁻¹, both exactly, 1/(1 − e^(−hν/kT)), and with the approximation kT/hν. Why is the kT/hν approximation justified in the Eyring derivation?",
        s: "With hc/k = 1.4388 cm K, hν/kT = 1.4388ν̃/T. (a) hν/kT = 4.83: exact 1.008, approximation 0.207 (80% off). (b) hν/kT = 0.483: exact 2.61, approximation 2.07 (21% off). For ordinary bond vibrations the approximation fails completely. The Eyring derivation uses it only for motion along the reaction coordinate at the top of the barrier. That mode has almost no restoring force, ν‡ → 0, so the approximation becomes exact; ν‡ then cancels against k‡ = κν‡ and leaves the universal frequency kT/h = 6.21×10¹² s⁻¹.",
      },
    },
    {
      ko: {
        q: "P9. 용액 속 이분자 반응의 ΔH‡ = 60 kJ/mol, ΔS‡ = −50 J K⁻¹ mol⁻¹이다(κ = 1, c° = 1 mol dm⁻³). 298.15 K에서 (a) k_r, (b) Arrhenius 활성화 에너지 Ea, (c) A를 구하고, (d) e^(ΔS‡/R)를 충돌 이론의 입체 인자와 연결하시오.",
        s: "(a) k_r = (kT/h)e^(ΔS‡/R)e^(−ΔH‡/RT) = 6.21×10¹² × e^(−6.014) × e^(−24.20) = 6.21×10¹² × 2.44×10⁻³ × 3.08×10⁻¹¹ = 0.468 dm³ mol⁻¹ s⁻¹. (b) d ln k/dT = 1/T + ΔH‡/RT²에서 Ea = ΔH‡ + RT = 60 + 2.48 = 62.5 kJ/mol. (c) A = e(kT/h)e^(ΔS‡/R) = 2.718 × 6.21×10¹² × 2.44×10⁻³ = 4.1×10¹⁰ dm³ mol⁻¹ s⁻¹. (d) e^(ΔS‡/R) = 2.4×10⁻³는 착물을 만들며 잃는 자유도의 비용입니다. 표의 2ClO 반응(P = 2.5×10⁻³)과 같은 크기로, 입체 인자를 엔트로피로 해석한 것입니다.",
      },
      en: {
        q: "P9. A bimolecular reaction in solution has ΔH‡ = 60 kJ/mol and ΔS‡ = −50 J K⁻¹ mol⁻¹ (κ = 1, c° = 1 mol dm⁻³). At 298.15 K find (a) k_r, (b) the Arrhenius activation energy Ea, (c) A, and (d) connect e^(ΔS‡/R) with the steric factor of collision theory.",
        s: "(a) k_r = (kT/h)e^(ΔS‡/R)e^(−ΔH‡/RT) = 6.21×10¹² × e^(−6.014) × e^(−24.20) = 6.21×10¹² × 2.44×10⁻³ × 3.08×10⁻¹¹ = 0.468 dm³ mol⁻¹ s⁻¹. (b) From d ln k/dT = 1/T + ΔH‡/RT², Ea = ΔH‡ + RT = 60 + 2.48 = 62.5 kJ/mol. (c) A = e(kT/h)e^(ΔS‡/R) = 2.718 × 6.21×10¹² × 2.44×10⁻³ = 4.1×10¹⁰ dm³ mol⁻¹ s⁻¹. (d) e^(ΔS‡/R) = 2.4×10⁻³ is the cost of the freedom lost in forming the complex. It is the same size as P for the 2ClO reaction in the table (2.5×10⁻³): the steric factor read as an entropy.",
      },
    },
    {
      ko: {
        q: "P10. 2차원 격자 DLA 시뮬레이션에서 N = 1000일 때 R_g = 25.0, N = 4000일 때 R_g = 56.2(격자 단위)였다. (a) 프랙탈 차원을 구하시오. (b) 같은 덩어리가 N = 16000으로 자라면 R_g는? (c) 강의 18쪽의 2D DLA 값 1.45와 다른 이유는?",
        s: "(a) N ∝ R_g^(d_f)이므로 d_f = ln(4000/1000)/ln(56.2/25.0) = 1.386/0.810 = 1.71. (b) N이 4배가 될 때마다 R_g는 4^(1/1.71) = 2.25배이므로 56.2 × 2.25 = 126. 꽉 찬 원판(d_f = 2)이었다면 2배인 112에 그쳤을 것입니다. 성긴 덩어리일수록 같은 입자 수로 더 크게 퍼집니다. (c) 1.71은 고정된 덩어리에 입자가 하나씩 붙는 Witten–Sander 모형의 값이고, 강의 18쪽의 1.45는 덩어리끼리 확산하며 서로 붙는 덩어리–덩어리 응집(DLCA)의 값입니다. 덩어리끼리 붙으면 큰 빈 공간이 남아 더 성기므로 d_f가 더 작습니다.",
      },
      en: {
        q: "P10. In a 2D lattice DLA simulation, R_g = 25.0 at N = 1000 and R_g = 56.2 at N = 4000 (lattice units). (a) Find the fractal dimension. (b) What is R_g when the same cluster grows to N = 16000? (c) Why does it differ from the 2D DLA value 1.45 on lecture page 18?",
        s: "(a) N ∝ R_g^(d_f), so d_f = ln(4000/1000)/ln(56.2/25.0) = 1.386/0.810 = 1.71. (b) Each fourfold increase in N multiplies R_g by 4^(1/1.71) = 2.25, so 56.2 × 2.25 = 126. A filled disc (d_f = 2) would grow only twofold, to 112: the more open the cluster, the further the same number of particles spreads. (c) 1.71 belongs to the Witten–Sander model, where particles join one fixed cluster one at a time; 1.45 on page 18 belongs to cluster–cluster aggregation (DLCA), where clusters diffuse and stick to one another. Joining clusters leaves large voids, so the aggregate is more open and d_f smaller.",
      },
    },
  ];
  const [open, setOpen] = useState({});
  const isKo = lang === "ko";
  return (
    <div>
      <Card>
        <Hd>{isKo ? "연습문제 10제" : "Ten practice problems"}</Hd>
        <Note>
          {isKo
            ? "풀이를 열기 전에 스스로 풀어 보십시오. P1–P3은 충돌 이론과 RRK, P4–P7은 용액 반응과 물질수지, P8–P9는 전이상태 이론, P10은 확산 지배 응집입니다. 모든 수치는 Raw 코드 탭의 Python·C++ 코드로 검산했습니다."
            : "Attempt each before opening the solution. P1–P3 cover collision theory and RRK, P4–P7 reactions in solution and the material balance, P8–P9 transition state theory, and P10 diffusion-limited aggregation. Every number was checked with the Python and C++ codes in the Raw Codes tab."}
        </Note>
      </Card>
      {problems.map((p, i) => {
        const d = isKo ? p.ko : p.en;
        return (
          <Card key={i}>
            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.7, color: C.text }}>{d.q}</div>
            <button onClick={() => setOpen(o => ({ ...o, [i]: !o[i] }))}
              style={{ ...btnStyle(open[i]), marginTop: 12, padding: "6px 14px", fontSize: 12 }}>
              {open[i] ? (isKo ? "풀이 닫기" : "Hide solution") : (isKo ? "풀이 보기" : "Show solution")}
            </button>
            {open[i] && (
              <div style={{
                marginTop: 12, padding: "14px 16px", background: "#0d1117",
                borderRadius: 10, borderLeft: `3px solid ${C.ok}`,
                fontSize: 13.5, lineHeight: 1.8, color: C.text,
              }}>{d.s}</div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// =============================================================
// 8) RAW CODES
// =============================================================
const CODE_TOPICS = {
  collision_rrk: {
    ko: "충돌 이론·입체 인자·RRK", en: "Collision theory · steric factor · RRK",
    codes: { python: PY_COLL, matlab: ML_COLL, julia: JL_COLL, cpp: CPP_COLL },
  },
  diffusion_transport: {
    ko: "만남 쌍·Smoluchowski·물질수지 식", en: "Encounter pair · Smoluchowski · material balance",
    codes: { python: PY_DIFF, matlab: ML_DIFF, julia: JL_DIFF, cpp: CPP_DIFF },
  },
  eyring_tst: {
    ko: "전이상태 이론·Eyring 식", en: "Transition state theory · Eyring equation",
    codes: { python: PY_TST, matlab: ML_TST, julia: JL_TST, cpp: CPP_TST },
  },
  dla_aggregation: {
    ko: "DLA·RLA·Smoluchowski 응집", en: "DLA · RLA · Smoluchowski coagulation",
    codes: { python: PY_DLA, matlab: ML_DLA, julia: JL_DLA, cpp: CPP_DLA },
  },
};
const LANG_META = {
  python: { label: "Python", ext: "py", color: "#3776ab" },
  matlab: { label: "MATLAB", ext: "m", color: "#e16737" },
  julia: { label: "Julia", ext: "jl", color: "#9558b2" },
  cpp: { label: "C++", ext: "cpp", color: "#649ad2" },
};

function RawCodes({ lang }) {
  const isKo = lang === "ko";
  const [topic, setTopic] = useState("collision_rrk");
  const [cl, setCl] = useState("python");
  const [copied, setCopied] = useState(false);
  const code = CODE_TOPICS[topic].codes[cl];
  const fname = `wk09_${topic}.${LANG_META[cl].ext}`;

  const doCopy = () => {
    const ta = document.createElement("textarea");
    ta.value = code; document.body.appendChild(ta);
    ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };
  const doDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = fname; a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      <Card>
        <Hd>{isKo ? "시뮬레이션 코드 (4개 주제 × 4개 언어)" : "Simulation codes (4 topics × 4 languages)"}</Hd>
        <Note>
          {isKo
            ? "이 페이지의 인터랙티브 뒤에 있는 계산을 직접 실행해 볼 수 있는 독립 코드입니다. Python과 C++은 실행해 확인한 값입니다: N₂ 충돌 빈도 7.01×10⁹ s⁻¹·Z_AA 8.52×10³⁴ m⁻³ s⁻¹, RRK Monte Carlo가 (1 − E*/E)^(s−1)과 통계 오차 안에서 일치, RRK 열평균 = e^(−E₀/kT)(유효숫자 7자리), 물의 k_d = 7.43×10⁹ dm³ mol⁻¹ s⁻¹, Brownian 포획 수가 Smoluchowski 이론과 수 % 안에서 일치, 물질수지 유한차분의 오차 7×10⁻⁵·양 0.22312(e^(−kt) = 0.22313), Eyring k = 0.468 dm³ mol⁻¹ s⁻¹, 원자 쌍에서 TST/충돌 이론 = 1.000000000000, 2D DLA d_f ≈ 1.7–1.8과 RLA ≈ 1.9, 상수 커널 Smoluchowski의 수치해 = 해석해(7자리)."
            : "Standalone codes for the calculations behind every interactive on this page. The Python and C++ versions were run and give: N₂ collision frequency 7.01×10⁹ s⁻¹ and Z_AA 8.52×10³⁴ m⁻³ s⁻¹; RRK Monte Carlo agrees with (1 − E*/E)^(s−1) within statistical error; the RRK thermal average equals e^(−E₀/kT) to 7 digits; k_d in water 7.43×10⁹ dm³ mol⁻¹ s⁻¹; Brownian captures agree with Smoluchowski's theory within a few percent; the material-balance finite differences have error 7×10⁻⁵ and amount 0.22312 (e^(−kt) = 0.22313); Eyring k = 0.468 dm³ mol⁻¹ s⁻¹; TST/collision theory for an atom pair = 1.000000000000; 2D DLA d_f ≈ 1.7–1.8 and RLA ≈ 1.9; constant-kernel Smoluchowski numerical = analytic to 7 digits."}
        </Note>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0 8px" }}>
          {Object.entries(CODE_TOPICS).map(([k, v]) => (
            <button key={k} onClick={() => setTopic(k)} style={btnStyle(topic === k)}>
              {isKo ? v.ko : v.en}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {Object.entries(LANG_META).map(([k, m]) => (
            <button key={k} onClick={() => setCl(k)} style={{
              ...btnStyle(cl === k),
              borderColor: cl === k ? m.color : C.border,
              background: cl === k ? `${m.color}33` : C.panel,
              color: cl === k ? "#fff" : C.text,
            }}>{m.label}</button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={doCopy} style={btnStyle()}>{copied ? "✓ " + (isKo ? "복사됨" : "Copied") : (isKo ? "복사" : "Copy")}</button>
          <button onClick={doDownload} style={btnStyle()}>{isKo ? "다운로드" : "Download"} {fname}</button>
        </div>
        <pre style={{
          background: "#0d1117", border: `1px solid ${C.border}`, borderRadius: 10,
          padding: 18, overflowX: "auto", fontSize: 12.5, lineHeight: 1.6,
          fontFamily: mono, color: "#c9d1d9", maxHeight: 560, overflowY: "auto",
        }}>{code}</pre>
      </Card>
    </div>
  );
}
