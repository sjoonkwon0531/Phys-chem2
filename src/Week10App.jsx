// ============================================================
// Week10App.jsx — Statistical Mechanics & Phase Separation
// Physical Chemistry 2 (물리화학 2)
// SKKU School of Chemical Engineering
// Smart Process & Materials Design Lab (SPMDL)
// Prof. S. Joon Kwon
// ------------------------------------------------------------
// Topics covered (Wk10 Part 1 / Part 2):
//   • Microscopic thermodynamics — W, Stirling, Boltzmann distribution,
//     Lagrange multipliers, beta = 1/kT, S = k ln W
//   • Canonical ensemble — Z, U, F, S, p, mu, C_V = sigma_E^2/kT^2,
//     fluctuations ~ N^(-1/2), molecular partition functions q_T q_R q_V q_E
//   • Ensembles — NVE, NVT, muVT, NPT; bridge equations; grand canonical
//     Langmuir lattice gas; ideal-gas mu; ergodicity (time vs ensemble)
//   • Lattice-gas (regular-solution) model — chi, mixing entropy, dF,
//     spinodal / binodal, T_c = kappa/2k; Kawasaki Monte Carlo
//   • Cahn–Hilliard (conserved) and Allen–Cahn (non-conserved) dynamics,
//     linear stability, fastest wavelength, coarsening; case studies
// ============================================================
import { useState, useEffect, useRef, useMemo } from "react";
import {
  PY_BOLTZ, ML_BOLTZ, JL_BOLTZ, CPP_BOLTZ,
  PY_PART, ML_PART, JL_PART, CPP_PART,
  PY_MIX, ML_MIX, JL_MIX, CPP_MIX,
  PY_CH, ML_CH, JL_CH, CPP_CH,
} from "./Week10Codes";

// ── i18n ─────────────────────────────────────────────────────
const i18n = {
  ko: {
    weekTitle: "Week 10 — 통계역학과 상분리",
    subtitle: "Boltzmann 분포 · 분배 함수 · 앙상블 · 격자 혼합 모형 · 스피노달 분해 · Cahn–Hilliard",
    tabs: {
      overview: "개요",
      boltzmann: "Boltzmann 분포",
      canonical: "분배 함수 → 열역학",
      ensembles: "앙상블 & 에르고딕성",
      mixing: "격자 혼합 모형",
      cahn: "Cahn–Hilliard 동역학",
      practice: "연습문제",
      codes: "Raw 코드",
    },
  },
  en: {
    weekTitle: "Week 10 — Statistical Mechanics & Phase Separation",
    subtitle: "Boltzmann distribution · Partition functions · Ensembles · Lattice mixing · Spinodal decomposition · Cahn–Hilliard",
    tabs: {
      overview: "Overview",
      boltzmann: "Boltzmann Distribution",
      canonical: "Partition Function → Thermo",
      ensembles: "Ensembles & Ergodicity",
      mixing: "Lattice Mixing Model",
      cahn: "Cahn–Hilliard Dynamics",
      practice: "Practice",
      codes: "Raw Codes",
    },
  },
};

// ── design tokens (Week 10 accent: indigo) ───────────────────
const C = {
  bg: "#0b0f17",
  panel: "#111827",
  card: "#1f2937",
  border: "#374151",
  text: "#e5e7eb",
  textDim: "#9ca3af",
  accent: "#818cf8",
  accentSoft: "#a5b4fc",
  amber: "#f59e0b",
  sky: "#38bdf8",
  blueSoft: "#60a5fa",
  ok: "#10b981",
  err: "#ef4444",
  purple: "#c084fc",
  teal: "#2dd4bf",
  pink: "#f472b6",
  lime: "#a3e635",
};

// physical constants (SI; C_CM in cm/s)
const KB = 1.380649e-23;
const HPL = 6.62607015e-34;
const C_CM = 2.99792458e10;
const RGAS = 8.314462618;
const AMU = 1.66053906660e-27;

// =============================================================
// MAIN COMPONENT
// =============================================================
export default function Week10App({ onBack, lang: langProp, onLangChange }) {
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
        {tab === "boltzmann" && <BoltzmannTab lang={lang} />}
        {tab === "canonical" && <CanonicalTab lang={lang} />}
        {tab === "ensembles" && <EnsemblesTab lang={lang} />}
        {tab === "mixing" && <MixingTab lang={lang} />}
        {tab === "cahn" && <CahnTab lang={lang} />}
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
    background: active ? "rgba(129,140,248,0.16)" : "transparent",
    color: active ? C.accentSoft : C.textDim,
    border: `1px solid ${active ? "rgba(129,140,248,0.45)" : "transparent"}`,
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

// log-gamma (Lanczos, g = 7) for exact counting
const LG = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
function lgamma(z) {
  if (z < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * z))) - lgamma(1 - z);
  z -= 1;
  let x = LG[0];
  for (let i = 1; i < 9; i++) x += LG[i] / (z + i);
  const t = z + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}
const lnFact = n => lgamma(n + 1);
const lnChoose = (n, k) => lnFact(n) - lnFact(k) - lnFact(n - k);

// =============================================================
// 1) OVERVIEW
// =============================================================
function Overview({ lang }) {
  const isKo = lang === "ko";
  const timeline = [
    { yr: "1860", who: "Maxwell", ko: "기체 분자의 속도 분포: 확률과 통계를 물리에 들여오다", en: "Velocity distribution of gas molecules: probability enters physics", c: C.sky },
    { yr: "1877", who: "Boltzmann", ko: "S = k ln W: 엔트로피는 미시 상태의 개수다", en: "S = k ln W: entropy counts microstates", c: C.accent },
    { yr: "1902", who: "Gibbs", ko: "앙상블과 분배 함수: 통계역학의 체계", en: "Ensembles and partition functions: the framework of statistical mechanics", c: C.accent },
    { yr: "1905", who: "Einstein", ko: "Brown 운동 이론: 원자는 실재한다", en: "Theory of Brownian motion: atoms are real", c: C.sky },
    { yr: "1925", who: "Ising", ko: "격자 위 이웃 상호작용 모형: 격자 혼합 모형의 원형", en: "Nearest-neighbor lattice model: the prototype of the lattice mixture", c: C.teal },
    { yr: "1944", who: "Onsager", ko: "2차원 Ising 모형의 정확해: 평균장 이론이 틀리는 곳", en: "Exact solution of the 2D Ising model: where mean-field theory fails", c: C.teal },
    { yr: "1958", who: "Cahn · Hilliard", ko: "확산 계면 자유 에너지: 기울기 에너지 κ|∇φ|²", en: "Diffuse-interface free energy: the gradient energy κ|∇φ|²", c: C.pink },
    { yr: "1961", who: "Lifshitz · Slyozov · Wagner", ko: "조대화 법칙 L ∝ t^(1/3)", en: "Coarsening law L ∝ t^(1/3)", c: C.pink },
    { yr: "1979", who: "Allen · Cahn", ko: "보존되지 않는 질서 변수의 동역학: 결정립 성장", en: "Dynamics of a non-conserved order parameter: grain growth", c: C.amber },
  ];
  return (
    <div>
      <Card>
        <Hd>{isKo ? "미시에서 거시로, 그리고 무늬로" : "From the microscopic to the macroscopic, and on to patterns"}</Hd>
        <Note>
          {isKo
            ? "4주차에 Boltzmann 인자 e^(−E/kT)를 썼고, 9주차에는 그것으로 반응 속도를 계산했습니다. 이번 주 전반부는 그 인자가 어디서 오는지 처음부터 세어 봅니다. N개 분자가 에너지를 나누어 갖는 방법의 수 W를 세고, 그 수가 가장 커지는 분포를 찾으면 Boltzmann 분포가 나옵니다. 그 분포의 규격화 상수가 분배 함수 Z이고, Z 하나에서 내부 에너지·엔트로피·자유 에너지·압력·화학 퍼텐셜이 모두 나옵니다. 후반부는 이 도구로 혼합물을 봅니다. 격자 위에 A와 B를 놓고 섞임 엔트로피와 상호작용 에너지를 경쟁시키면 임계 온도 아래에서 혼합물이 스스로 갈라집니다. 그 갈라짐의 동역학이 Cahn–Hilliard 식이고, 합금·고분자 블렌드·태양전지 활성층·세포막에서 보이는 무늬가 모두 여기서 나옵니다."
            : "Week 4 used the Boltzmann factor e^(−E/kT), and Week 9 used it to compute reaction rates. The first half of this week counts where that factor comes from. Count the number of ways W in which N molecules can share their energy, find the distribution that makes W largest, and the Boltzmann distribution appears. Its normalizing constant is the partition function Z, and Z alone yields the internal energy, entropy, free energy, pressure and chemical potential. The second half turns these tools on mixtures. Put A and B on a lattice, let the entropy of mixing compete with the interaction energy, and below a critical temperature the mixture splits by itself. The dynamics of that splitting is the Cahn–Hilliard equation, and the patterns seen in alloys, polymer blends, solar-cell active layers and cell membranes all come from it."}
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
            { name: isKo ? "Boltzmann 분포" : "Boltzmann distribution", eq: "Nᵢ/N = e^(−εᵢ/kT) / q", c: C.accent },
            { name: isKo ? "분배 함수 → 자유 에너지" : "Partition function → free energy", eq: "F = −kT ln Z,  U = −∂lnZ/∂β", c: C.sky },
            { name: isKo ? "혼합 자유 에너지" : "Free energy of mixing", eq: "ΔF/NkT = χφ(1−φ) + φlnφ + (1−φ)ln(1−φ)", c: C.teal },
            { name: "Cahn–Hilliard", eq: "∂φ/∂t = M∇²[f′(φ) − 2κ∇²φ]", c: C.pink },
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
          isKo ? "W = N!/ΠNᵢ!와 Stirling 근사로 ln W를 쓰고, Lagrange 승수법으로 Boltzmann 분포를 유도할 수 있다." : "Write ln W from W = N!/ΠNᵢ! and Stirling's approximation, and derive the Boltzmann distribution with Lagrange multipliers.",
          isKo ? "S = k ln W와 (∂S/∂E)_N = 1/T에서 β = 1/kT임을 보일 수 있다." : "Show β = 1/kT from S = k ln W and (∂S/∂E)_N = 1/T.",
          isKo ? "Z에서 U, F, S, p, μ, C_V를 구하고, C_V = σ_E²/kT²로 에너지 요동과 열용량을 연결할 수 있다." : "Obtain U, F, S, p, μ and C_V from Z, and connect energy fluctuations to heat capacity through C_V = σ_E²/kT².",
          isKo ? "요동의 상대 크기가 N^(−1/2)로 줄어 열역학 극한에서 앙상블들이 같아짐을 설명할 수 있다." : "Explain why relative fluctuations shrink as N^(−1/2), so that ensembles agree in the thermodynamic limit.",
          isKo ? "분자 분배 함수 q = q_T q_R q_V q_E로 이원자 기체의 표준 엔트로피를 계산하고 실험값과 비교할 수 있다." : "Compute the standard entropy of a diatomic gas from q = q_T q_R q_V q_E and compare it with experiment.",
          isKo ? "NVE·NVT·μVT·NPT 앙상블의 분배 함수, 열역학 퍼텐셜, 요동 공식을 짝지을 수 있다." : "Match the NVE, NVT, μVT and NPT ensembles with their partition functions, thermodynamic potentials and fluctuation formulas.",
          isKo ? "격자 모형에서 χ, 스피노달, 바이노달, 임계점 T_c = κ/2k를 유도하고, 평균장 이론의 한계를 설명할 수 있다." : "Derive χ, the spinodal, the binodal and the critical point T_c = κ/2k for the lattice model, and explain the limits of mean-field theory.",
          isKo ? "Cahn–Hilliard 식의 선형 안정성으로 가장 빨리 자라는 파장 λ_m을 구하고, 핵생성과 스피노달 분해를 구별할 수 있다." : "Find the fastest-growing wavelength λ_m from the linear stability of the Cahn–Hilliard equation, and distinguish nucleation from spinodal decomposition.",
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
    { t: isKo ? "상태 세기" : "Count states", s: "W, ln W", c: C.accent },
    { t: "Boltzmann", s: "e^(−βε)/q", c: C.accent },
    { t: isKo ? "분배 함수" : "Partition function", s: "F = −kT ln Z", c: C.sky },
    { t: isKo ? "혼합 자유 에너지" : "Mixing free energy", s: "χ, φ", c: C.teal },
    { t: isKo ? "상분리 동역학" : "Phase-separation dynamics", s: "Cahn–Hilliard", c: C.pink },
  ];
  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 0, flexWrap: "wrap", marginTop: 10 }}>
      {steps.map((st, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ background: C.card, border: `1px solid ${st.c}55`, borderRadius: 12, padding: "10px 14px", minWidth: 128, textAlign: "center" }}>
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
// 2) BOLTZMANN DISTRIBUTION
// =============================================================
function BoltzmannTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <StirlingCard isKo={isKo} />
      <ExchangeLab isKo={isKo} />
      <CountingCard isKo={isKo} />
      <LagrangeCard isKo={isKo} />
    </div>
  );
}

function StirlingCard({ isKo }) {
  const [lgN, setLgN] = useState(2);
  const N = Math.round(Math.pow(10, lgN));
  const ex = lnFact(N), st = N * Math.log(N) - N, st2 = st + 0.5 * Math.log(2 * Math.PI * N);
  const W = 680, Ht = 240, pad = 50;
  const { X, Y } = plotScale(0, 6, -8, 0, W, Ht, pad);
  const pts = [], pts2 = [];
  for (let j = 0; j <= 120; j++) {
    const l = 0.3 + 5.7 * j / 120, n = Math.pow(10, l), e = lnFact(n);
    pts.push([l, Math.log10(Math.abs(e - (n * Math.log(n) - n)) / e)]);
    pts2.push([l, Math.max(-8, Math.log10(Math.abs(e - (n * Math.log(n) - n + 0.5 * Math.log(2 * Math.PI * n))) / e))]);
  }
  return (
    <Card>
      <Hd>{isKo ? "W를 세는 법과 Stirling 근사" : "Counting W, and Stirling's approximation"}</Hd>
      <Eq>{"W = N! / (N₀! N₁! N₂! ⋯)      ln x! ≈ x ln x − x      ⇒   ln W ≈ N ln N − Σᵢ Nᵢ ln Nᵢ"}</Eq>
      <Note>
        {isKo
          ? "N개의 구별 가능한 분자를 에너지 준위에 N₀, N₁, …개씩 나누는 방법의 수가 W입니다. 계승은 너무 커서 직접 다룰 수 없으므로 로그를 취하고 Stirling 근사를 씁니다. 오차는 N이 커질수록 빠르게 사라집니다. 분자 수가 10²³개 수준이면 근사는 사실상 정확합니다."
          : "W is the number of ways to put N distinguishable molecules into energy levels with N₀, N₁, … in each. Factorials are far too large to handle directly, so we take logarithms and use Stirling's approximation. Its error vanishes quickly as N grows; for 10²³ molecules it is exact for all practical purposes."}
      </Note>
      <Row>
        <Slider label="N" value={lgN} min={0.3} max={6} step={0.01} onChange={setLgN} width={220} fmt={() => N.toLocaleString()} />
      </Row>
      <StatGrid>
        <Stat label="ln N!" value={ex.toFixed(3)} color={C.accent} />
        <Stat label="N ln N − N" value={st.toFixed(3)} color={C.amber} />
        <Stat label={isKo ? "상대 오차" : "relative error"} value={sci((ex - st) / ex)} color={C.pink} />
        <Stat label={isKo ? "+ ½ln(2πN) 보정 후" : "with + ½ln(2πN)"} value={sci(Math.abs(ex - st2) / ex)} color={C.ok} />
      </StatGrid>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel="log₁₀ N" ylabel={isKo ? "log₁₀(상대 오차)" : "log₁₀(relative error)"} />
        <path d={pathOf(pts, X, Y)} fill="none" stroke={C.amber} strokeWidth={2.6} />
        <path d={pathOf(pts2, X, Y)} fill="none" stroke={C.ok} strokeWidth={2} strokeDasharray="6 4" />
        <circle cx={X(lgN)} cy={Y(Math.log10(Math.abs(ex - st) / ex))} r={6} fill={C.accent} />
        {[0, 2, 4, 6].map(v => <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        {[0, -2, -4, -6, -8].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        <text x={W - pad} y={pad + 4} fill={C.amber} fontSize={11} textAnchor="end">x ln x − x</text>
        <text x={W - pad} y={pad + 20} fill={C.ok} fontSize={11} textAnchor="end">{isKo ? "+ ½ln(2πx) (더 정확)" : "+ ½ln(2πx) (sharper)"}</text>
      </svg>
    </Card>
  );
}

function ExchangeLab({ isKo }) {
  const NAG = 1000, NB = 16;
  const [q0, setQ0] = useState(2);
  const [start, setStart] = useState("equal");
  const [running, setRunning] = useState(false);
  const [snap, setSnap] = useState({ hist: new Array(NB).fill(0), sweeps: 0, lnW: [[0, 0]] });
  const simRef = useRef(null);
  const rafRef = useRef(null);

  const init = (qq, st) => {
    const e = new Int32Array(NAG);
    if (st === "equal") e.fill(qq); else e[0] = qq * NAG;
    simRef.current = { e, rand: makeRng(12345 + qq), sweeps: 0, lnW: [], avg: new Array(NB).fill(0), navg: 0 };
    record();
  };
  const record = () => {
    const s = simRef.current;
    const counts = new Map();
    for (let i = 0; i < NAG; i++) counts.set(s.e[i], (counts.get(s.e[i]) || 0) + 1);
    let lnW = lnFact(NAG);
    counts.forEach(c => { lnW -= lnFact(c); });
    const hist = new Array(NB).fill(0);
    for (let i = 0; i < NAG; i++) if (s.e[i] < NB) hist[s.e[i]] += 1 / NAG;
    if (s.sweeps >= 200) { for (let n = 0; n < NB; n++) s.avg[n] += hist[n]; s.navg++; }
    s.lnW.push([s.sweeps, lnW / NAG]);
    if (s.lnW.length > 400) s.lnW.shift();
    setSnap({ hist, sweeps: s.sweeps, lnW: s.lnW.slice(), avg: s.navg ? s.avg.map(v => v / s.navg) : null });
  };
  const step = () => {
    const s = simRef.current;
    for (let k = 0; k < 2 * NAG; k++) {
      const i = Math.floor(s.rand() * NAG), j = Math.floor(s.rand() * NAG);
      if (i !== j && s.e[i] > 0) { s.e[i]--; s.e[j]++; }
    }
    s.sweeps += 2;
    record();
    if (s.sweeps < 800) rafRef.current = requestAnimationFrame(step); else setRunning(false);
  };
  useEffect(() => { init(q0, start); return () => cancelAnimationFrame(rafRef.current); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const reset = (qq = q0, st = start) => { cancelAnimationFrame(rafRef.current); setRunning(false); init(qq, st); };
  const toggle = () => {
    if (running) { cancelAnimationFrame(rafRef.current); setRunning(false); }
    else { setRunning(true); rafRef.current = requestAnimationFrame(step); }
  };

  const x = q0 / (q0 + 1);
  const boltz = Array.from({ length: NB }, (_, n) => (1 - x) * Math.pow(x, n));
  const Sbz = (1 + q0) * Math.log(1 + q0) - q0 * Math.log(q0);       // -Σ p ln p for the geometric law
  const lnWnow = snap.lnW.length ? snap.lnW[snap.lnW.length - 1][1] : 0;
  const nz = (snap.avg || snap.hist).slice(0, 8).map((p, n) => [n, p]).filter(([, p]) => p > 0);
  const fit = nz.length > 2 ? linfit(nz.map(a => a[0]), nz.map(a => Math.log(a[1]))) : null;
  const W = 440, Ht = 280, pad = 46;
  const yMax = Math.max(0.55, ...snap.hist.slice(0, 12)) * 1.05;
  const { X, Y } = plotScale(-0.5, 11.5, 0, yMax, W, Ht, pad);
  const bw = (X(1) - X(0)) * 0.7;
  const W2 = 400, Ht2 = 280;
  const sMax = Math.max(snap.sweeps, 10);
  const yTop = Sbz * 1.15;
  const p2 = plotScale(0, sMax, 0, yTop, W2, Ht2, pad);
  return (
    <Card>
      <Hd>{isKo ? "에너지 나눠 갖기 게임: 누구나 Boltzmann 분포에 도착한다" : "The energy-sharing game: everyone arrives at Boltzmann"}</Hd>
      <Note>
        {isKo
          ? "분자 1,000개가 에너지 양자를 나눠 갖습니다. 매 단계 무작위로 두 분자를 골라 한쪽이 양자 하나를 다른 쪽에 건넵니다. 총에너지는 변하지 않습니다. 처음에 모두 같은 에너지로 시작하든, 한 분자가 전부를 가진 채 시작하든, 분포는 같은 지수 함수 e^(−βε)로 갑니다. 오른쪽 그래프의 ln W/N(구성의 수, 곧 엔트로피)은 올라가기만 하다가 Boltzmann 분포의 값에서 멈춥니다. 이것이 '가장 가능성 높은 분포'라는 말의 뜻입니다."
          : "A thousand molecules share energy quanta. At each step two molecules are picked at random and one hands a quantum to the other; the total energy never changes. Whether everyone starts with the same energy or one molecule starts with all of it, the distribution heads for the same exponential, e^(−βε). On the right, ln W/N, the number of arrangements and hence the entropy, only climbs, and stops at the Boltzmann value. That is what 'the most probable distribution' means."}
      </Note>
      <Row>
        <Slider label={isKo ? "분자당 평균 양자 ⟨n⟩" : "mean quanta per molecule ⟨n⟩"} value={q0} min={1} max={5} step={1} onChange={v => { setQ0(v); reset(v, start); }} width={140} />
        <button onClick={() => { setStart("equal"); reset(q0, "equal"); }} style={{ ...btnStyle(start === "equal"), padding: "6px 12px", fontSize: 12 }}>{isKo ? "모두 같게 시작" : "start all equal"}</button>
        <button onClick={() => { setStart("rich"); reset(q0, "rich"); }} style={{ ...btnStyle(start === "rich"), padding: "6px 12px", fontSize: 12 }}>{isKo ? "한 분자가 전부" : "one molecule has it all"}</button>
        <button onClick={toggle} style={btnStyle(running)}>{running ? (isKo ? "일시정지" : "Pause") : (isKo ? "실행" : "Run")}</button>
        <button onClick={() => reset()} style={btnStyle()}>{isKo ? "처음부터" : "Reset"}</button>
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={{ ...svgBox(W), maxWidth: W }}>
          <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "양자 수 n (에너지 nε)" : "quanta n (energy nε)"} ylabel={isKo ? "분율" : "fraction"} />
          {snap.hist.slice(0, 12).map((p, n) => <rect key={n} x={X(n) - bw / 2} y={Y(Math.min(p, yMax))} width={bw} height={Math.max(Y(0) - Y(Math.min(p, yMax)), 0)} fill={C.accent} opacity={0.75} />)}
          <path d={pathOf(boltz.slice(0, 12).map((p, n) => [n, p]), X, Y)} fill="none" stroke={C.amber} strokeWidth={2.4} />
          {boltz.slice(0, 12).map((p, n) => <circle key={n} cx={X(n)} cy={Y(p)} r={3.5} fill={C.amber} />)}
          {[0, 2, 4, 6, 8, 10].map(v => <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
          <text x={W - pad} y={pad} fill={C.amber} fontSize={11} textAnchor="end">{isKo ? "Boltzmann (1−x)xⁿ" : "Boltzmann (1−x)xⁿ"}</text>
        </svg>
        <svg width={W2} height={Ht2} viewBox={`0 0 ${W2} ${Ht2}`} style={{ ...svgBox(W2), maxWidth: W2 }}>
          <Axes W={W2} Ht={Ht2} pad={pad} xlabel={isKo ? "스윕 수" : "sweeps"} ylabel="ln W / N" />
          <line x1={pad} y1={p2.Y(Sbz)} x2={W2 - pad} y2={p2.Y(Sbz)} stroke={C.amber} strokeDasharray="5 4" />
          <path d={pathOf(snap.lnW.map(([s, v]) => [s, Math.max(0, v)]), p2.X, p2.Y)} fill="none" stroke={C.accent} strokeWidth={2.4} />
          <text x={W2 - pad} y={p2.Y(Sbz) - 6} fill={C.amber} fontSize={11} textAnchor="end">{isKo ? `Boltzmann 최댓값 ${Sbz.toFixed(3)}` : `Boltzmann maximum ${Sbz.toFixed(3)}`}</text>
          <text x={W2 / 2} y={Ht2 - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{`0 – ${sMax}`}</text>
        </svg>
      </div>
      <StatGrid>
        <Stat label={isKo ? "경과 스윕" : "sweeps"} value={String(snap.sweeps)} color={C.textDim} />
        <Stat label="ln W / N" value={lnWnow.toFixed(3)} color={C.accent} />
        <Stat label={isKo ? (snap.avg ? "기울기로 맞춘 βε (200 스윕 이후 평균)" : "기울기로 맞춘 βε (현재 분포)") : (snap.avg ? "βε from the slope (averaged after 200 sweeps)" : "βε from the slope (current snapshot)")} value={fit ? (-fit.slope).toFixed(3) : "—"} color={C.pink} />
        <Stat label={isKo ? "이론 βε = ln((⟨n⟩+1)/⟨n⟩)" : "theory βε = ln((⟨n⟩+1)/⟨n⟩)"} value={Math.log((q0 + 1) / q0).toFixed(3)} color={C.amber} />
      </StatGrid>
      <Note>
        {isKo
          ? "온도는 따로 넣지 않았습니다. 분자당 평균 에너지 ⟨n⟩ε만 정했는데, 분포의 기울기에서 βε = ln((⟨n⟩+1)/⟨n⟩)가 저절로 정해집니다. 평균 에너지가 클수록 β가 작아지고, 곧 온도가 높아집니다. 강의 5쪽의 '온도는 평형에서 가장 가능성 높은 분포를 정하는 유일한 매개변수'라는 문장이 이것입니다. 막대가 무작위로 흔들리는 것은 분자가 1,000개뿐이기 때문입니다. 요동의 크기는 N^(−1/2)로 줄어듭니다(다음 탭)."
          : "No temperature was put in. Only the mean energy per molecule ⟨n⟩ε was fixed, and the slope of the distribution sets βε = ln((⟨n⟩+1)/⟨n⟩) by itself: the larger the mean energy, the smaller β and the higher the temperature. This is the lecture's statement (page 5) that temperature is the unique parameter governing the most probable populations at equilibrium. The bars jitter because there are only 1,000 molecules; fluctuations shrink as N^(−1/2) (next tab)."}
      </Note>
    </Card>
  );
}

function CountingCard({ isKo }) {
  const [lgN, setLgN] = useState(1);
  const N = Math.max(3, Math.round(Math.pow(10, lgN)));
  const Q = N;                                     // <n> = 1
  const exact = Array.from({ length: 9 }, (_, n) => n > Q ? 0 : Math.exp(lnChoose(Q - n + N - 2, N - 2) - lnChoose(Q + N - 1, N - 1)));
  const boltz = Array.from({ length: 9 }, (_, n) => 0.5 * Math.pow(0.5, n));
  const W = 680, Ht = 260, pad = 52;
  const { X, Y } = plotScale(-0.3, 8.3, -3.5, 0, W, Ht, pad);
  const lg = v => Math.max(-3.5, Math.log10(Math.max(v, 1e-12)));
  return (
    <Card>
      <Hd>{isKo ? "정확히 세어 보기: N이 커지면 Boltzmann이 된다" : "Counting exactly: Boltzmann emerges as N grows"}</Hd>
      <Eq>{"P(n) = C(Q − n + N − 2, N − 2) / C(Q + N − 1, N − 1)   →   (1 − x) xⁿ,   x = e^(−βε) = Q/(Q + N)"}</Eq>
      <Note>
        {isKo
          ? "N개의 진동자가 양자 Q개를 나눠 갖는 모든 방법을 똑같이 가능하다고 보면(첫째 공준), 한 진동자가 양자 n개를 가질 확률은 위의 조합 공식으로 정확히 셀 수 있습니다. 나머지 N − 1개가 남은 Q − n개를 나눠 갖는 방법의 수이기 때문입니다. 여기서는 ⟨n⟩ = Q/N = 1로 두었습니다. N이 작으면 꼬리가 잘리고, N이 커질수록 Boltzmann 분포와 구별할 수 없어집니다. 나머지 N − 1개가 열 저장조 역할을 하는 셈입니다."
          : "If every way for N oscillators to share Q quanta is equally likely (the first postulate), the probability that one oscillator holds n quanta can be counted exactly with the formula above: it is the number of ways for the other N − 1 to share the remaining Q − n. Here ⟨n⟩ = Q/N = 1. For small N the tail is cut off; as N grows the result becomes indistinguishable from the Boltzmann law. The other N − 1 oscillators act as the heat reservoir."}
      </Note>
      <Row>
        <Slider label={isKo ? "진동자 수 N (Q = N)" : "oscillators N (Q = N)"} value={lgN} min={0.5} max={3} step={0.01} onChange={setLgN} width={220} fmt={() => String(N)} />
      </Row>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "양자 수 n" : "quanta n"} ylabel="log₁₀ P(n)" />
        <path d={pathOf(boltz.map((p, n) => [n, lg(p)]), X, Y)} fill="none" stroke={C.amber} strokeWidth={2.2} strokeDasharray="6 4" />
        <path d={pathOf(exact.map((p, n) => [n, lg(p)]), X, Y)} fill="none" stroke={C.accent} strokeWidth={2.6} />
        {exact.map((p, n) => <circle key={n} cx={X(n)} cy={Y(lg(p))} r={4} fill={C.accent} />)}
        {[0, 2, 4, 6, 8].map(v => <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        {[0, -1, -2, -3].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        <text x={W - pad} y={pad} fill={C.accent} fontSize={11} textAnchor="end">{isKo ? `정확한 세기 (N = ${N})` : `exact count (N = ${N})`}</text>
        <text x={W - pad} y={pad + 16} fill={C.amber} fontSize={11} textAnchor="end">Boltzmann</text>
      </svg>
      <StatGrid>
        <Stat label="P(0) exact" value={exact[0].toFixed(5)} color={C.accent} />
        <Stat label="P(0) Boltzmann" value="0.50000" color={C.amber} />
        <Stat label="P(5) exact" value={exact[5].toFixed(5)} color={C.accent} />
        <Stat label="P(5) Boltzmann" value={boltz[5].toFixed(5)} color={C.amber} />
      </StatGrid>
    </Card>
  );
}

function LagrangeCard({ isKo }) {
  const steps = [
    { eq: "Φ = ln W − α(ΣNᵢ − N) − β(ΣεᵢNᵢ − E)", ko: "W를 최대로 하되 두 제약(입자 수, 총에너지)을 Lagrange 승수 α, β로 붙입니다.", en: "Maximize W subject to two constraints (number and total energy) attached with Lagrange multipliers α and β." },
    { eq: "∂Φ/∂Nᵢ = ln(N/Nᵢ) − α − βεᵢ = 0", ko: "Stirling 근사로 ∂lnW/∂Nᵢ = ln(N/Nᵢ)입니다. 모든 i에 대해 0으로 둡니다.", en: "With Stirling, ∂lnW/∂Nᵢ = ln(N/Nᵢ); set the derivative to zero for every i." },
    { eq: "pᵢ = Nᵢ/N = e^(−α) e^(−βεᵢ),   e^α = Σ e^(−βεᵢ) = q", ko: "확률의 합이 1이라는 조건이 α를 정하고, 그 규격화 상수가 분배 함수 q입니다.", en: "Normalization fixes α, and the normalizing constant is the partition function q." },
    { eq: "d lnW = α dN + β dE  ⇒  (∂lnW/∂E)_N = β", ko: "최대점에서 ln W의 변화를 쓰면 β가 ln W를 에너지로 미분한 값임이 드러납니다.", en: "Writing the change of ln W at the maximum shows that β is the energy derivative of ln W." },
    { eq: "S = k ln W,  (∂S/∂E)_N = 1/T  ⇒  β = 1/kT", ko: "열역학의 온도 정의와 비교하면 β = 1/kT가 확정됩니다. 미시 세계의 승수가 거시 세계의 온도입니다.", en: "Compared with the thermodynamic definition of temperature, β = 1/kT: the microscopic multiplier is the macroscopic temperature." },
  ];
  return (
    <Card>
      <Hd>{isKo ? "Lagrange 승수로 유도하기 (강의 5–7쪽)" : "The derivation with Lagrange multipliers (lecture pp. 5–7)"}</Hd>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ minWidth: 28, height: 28, borderRadius: "50%", background: "rgba(129,140,248,0.18)", color: C.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>{i + 1}</div>
          <div style={{ flex: 1 }}>
            <Eq style={{ margin: "0 0 4px" }}>{s.eq}</Eq>
            <Note>{isKo ? s.ko : s.en}</Note>
          </div>
        </div>
      ))}
    </Card>
  );
}

// =============================================================
// 3) CANONICAL ENSEMBLE: Z -> THERMODYNAMICS
// =============================================================
function CanonicalTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <BridgeCard isKo={isKo} />
      <ZLab isKo={isKo} />
      <FluctLab isKo={isKo} />
      <DiatomicLab isKo={isKo} />
    </div>
  );
}

function BridgeCard({ isKo }) {
  const rows = [
    ["U", "−(∂ln Z/∂β)_V", isKo ? "평균 에너지" : "mean energy"],
    ["F", "−kT ln Z", isKo ? "다리 방정식: 미시와 거시를 잇는다" : "the bridge equation"],
    ["S", "(U − F)/T = k ln Z + U/T", isKo ? "Boltzmann 엔트로피와 같다" : "equals the Boltzmann entropy"],
    ["p", "kT (∂ln Z/∂V)_{T,N}", isKo ? "이상 기체: Z ∝ Vᴺ이면 pV = NkT" : "ideal gas: Z ∝ Vᴺ gives pV = NkT"],
    ["μ", "−kT (∂ln Z/∂N)_{T,V}", isKo ? "다음 탭에서 다시 만난다" : "returns in the next tab"],
    ["C_V", "σ_E² / kT²", isKo ? "요동 = 응답 (요동-소산의 가장 단순한 예)" : "fluctuation = response"],
  ];
  return (
    <Card>
      <Hd>{isKo ? "Z 하나에서 열역학 전부를" : "All of thermodynamics from one Z"}</Hd>
      <Eq>{isKo
        ? "Z = Σ_states e^(−βE_s),     독립 입자:  Z = qᴺ (구별 가능)  또는  qᴺ/N! (구별 불가능)"
        : "Z = Σ_states e^(−βE_s),     independent particles:  Z = qᴺ (distinguishable)  or  qᴺ/N! (indistinguishable)"}</Eq>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "8px 10px", fontWeight: 800, color: C.accent, fontFamily: mono, width: 60 }}>{r[0]}</td>
                <td style={{ padding: "8px 10px", fontFamily: mono, color: C.text, whiteSpace: "nowrap" }}>{r[1]}</td>
                <td style={{ padding: "8px 10px", color: C.textDim }}>{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note>
        {isKo
          ? "N!은 같은 종류의 분자를 서로 바꿔도 새로운 상태가 아니기 때문에 나눕니다. 결정 속 원자처럼 자리가 정해져 있으면 나누지 않습니다. 이 N! 하나가 Gibbs 역설(같은 기체를 섞어도 엔트로피가 늘어나는 모순)을 없앱니다."
          : "The N! is divided out because swapping two identical molecules does not create a new state. For atoms on fixed lattice sites it is not. This single N! removes the Gibbs paradox, in which mixing a gas with itself would seem to raise the entropy."}
      </Note>
    </Card>
  );
}

function levelThermo(model, t) {             // t = kT/eps, returns per-particle quantities
  const x = 1 / t;
  if (model === "two") {
    const e = Math.exp(-x), Z = 1 + e;
    const U = e / Z, C = x * x * e / (Z * Z), S = Math.log(Z) + U * x;
    return { Z, U, C, S, pops: [1 / Z, e / Z] };
  }
  const e = Math.exp(-x), Z = 1 / (1 - e);
  const U = 1 / Math.expm1(x), C = x * x * Math.exp(x) / (Math.expm1(x) ** 2), S = x / Math.expm1(x) - Math.log(1 - e);
  return { Z, U, C, S, pops: Array.from({ length: 8 }, (_, n) => (1 - e) * Math.pow(e, n)) };
}

function ZLab({ isKo }) {
  const [model, setModel] = useState("two");
  const [t, setT] = useState(1);
  const th = levelThermo(model, t);
  const W = 560, Ht = 280, pad = 48;
  const yMax = model === "two" ? 1.0 : 3.0;
  const { X, Y } = plotScale(0, 4, 0, yMax, W, Ht, pad);
  const curve = key => { const p = []; for (let j = 1; j <= 200; j++) { const tt = 4 * j / 200; p.push([tt, Math.min(levelThermo(model, tt)[key], yMax)]); } return p; };
  const series = [["U", isKo ? "U/Nε" : "U/Nε", C.accent], ["C", "C_V/Nk", C.pink], ["S", "S/Nk", C.teal]];
  const PW = 220, PH = 280;
  const np = th.pops.length;
  return (
    <Card>
      <Hd>{isKo ? "실험실: 에너지 준위에서 열역학 곡선까지" : "Lab: from energy levels to thermodynamic curves"}</Hd>
      <Row>
        <button onClick={() => setModel("two")} style={btnStyle(model === "two")}>{isKo ? "2준위 계 (0, ε)" : "two-level (0, ε)"}</button>
        <button onClick={() => setModel("ho")} style={btnStyle(model === "ho")}>{isKo ? "조화 진동자 사다리 (nε)" : "harmonic ladder (nε)"}</button>
        <Slider label="kT/ε" value={t} min={0.05} max={4} step={0.01} onChange={setT} width={200} fmt={v => v.toFixed(2)} />
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={{ ...svgBox(W), maxWidth: W }}>
          <Axes W={W} Ht={Ht} pad={pad} xlabel="kT/ε" ylabel="" />
          {series.map(([k, lb, c], i) => (
            <g key={k}>
              <path d={pathOf(curve(k), X, Y)} fill="none" stroke={c} strokeWidth={2.4} />
              <circle cx={X(t)} cy={Y(Math.min(th[k], yMax))} r={5} fill={c} />
              <text x={W - pad} y={pad + 14 * i} fill={c} fontSize={11} textAnchor="end">{lb}</text>
            </g>
          ))}
          {model === "two" && <line x1={X(0.4168)} y1={pad} x2={X(0.4168)} y2={Ht - pad} stroke={C.pink} strokeDasharray="3 4" opacity={0.6} />}
          {[0, 1, 2, 3, 4].map(v => <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
          {[0, yMax / 2, yMax].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v.toFixed(1)}</text>)}
        </svg>
        <svg width={PW} height={PH} viewBox={`0 0 ${PW} ${PH}`} style={{ ...svgBox(PW), flex: "0 1 220px" }}>
          <text x={PW / 2} y={20} fill={C.textDim} fontSize={11} textAnchor="middle">{isKo ? "준위별 점유율" : "level populations"}</text>
          {th.pops.map((p, n) => {
            const y = PH - 30 - n * ((PH - 60) / Math.max(np - 1, 1));
            return (
              <g key={n}>
                <line x1={30} y1={y} x2={60} y2={y} stroke={C.textDim} strokeWidth={2} />
                <rect x={66} y={y - 6} width={130 * p} height={12} fill={C.accent} opacity={0.8} />
                <text x={24} y={y + 4} fill={C.textDim} fontSize={10} textAnchor="end">{n}ε</text>
                <text x={70 + 130 * p} y={y + 4} fill={C.text} fontSize={10}>{p.toFixed(3)}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <StatGrid>
        <Stat label="q" value={th.Z.toFixed(4)} color={C.amber} />
        <Stat label="U/Nε" value={th.U.toFixed(4)} color={C.accent} />
        <Stat label="C_V/Nk" value={th.C.toFixed(4)} color={C.pink} />
        <Stat label="S/Nk" value={th.S.toFixed(4)} color={C.teal} />
      </StatGrid>
      <Note>
        {model === "two"
          ? (isKo
            ? "2준위 계의 열용량은 kT/ε = 0.417에서 최댓값 0.439k를 갖고 다시 줄어듭니다(Schottky 이상). 온도가 아주 높아도 위 준위의 점유율은 1/2을 넘지 못하므로 에너지를 더 흡수할 수 없기 때문입니다. 고온 극한에서 S/Nk는 ln 2 = 0.693으로 갑니다. 상태가 2개뿐이기 때문입니다. kT = ε에서 q = 1.3679, U/Nε = 0.2689, S/Nk = 0.5822, C_V/Nk = 0.1966입니다."
            : "The heat capacity of a two-level system peaks at 0.439k when kT/ε = 0.417 and then falls (the Schottky anomaly). Even at very high temperature the upper level can hold no more than half the molecules, so the system stops absorbing energy. At high temperature S/Nk approaches ln 2 = 0.693, because there are only two states. At kT = ε: q = 1.3679, U/Nε = 0.2689, S/Nk = 0.5822, C_V/Nk = 0.1966.")
          : (isKo
            ? "조화 진동자는 준위가 끝없이 이어지므로 열용량이 줄지 않고 고온에서 k(등분배)로 갑니다. 저온에서는 e^(−ε/kT)로 급히 사라집니다. 이것이 Einstein 고체 모형이고, 아래 이원자 분자 실험실의 진동 기여도 같은 함수입니다."
            : "The harmonic ladder never runs out of levels, so its heat capacity does not fall; it rises to k (equipartition) at high temperature and vanishes as e^(−ε/kT) at low temperature. This is the Einstein solid, and it is the same function as the vibrational contribution in the diatomic lab below.")}
      </Note>
    </Card>
  );
}

function FluctLab({ isKo }) {
  const [lgN, setLgN] = useState(2);
  const N = Math.round(Math.pow(10, lgN));
  const p = Math.exp(-1) / (1 + Math.exp(-1));     // two-level at kT = eps
  const rel = Math.sqrt((1 - p) / (N * p));
  const W = 680, Ht = 260, pad = 48;
  const xs = [], ys = [];
  const sd = Math.sqrt(p * (1 - p) / N);
  for (let j = 0; j <= 400; j++) {
    const f = 0.4 * j / 400;
    xs.push(f);
    ys.push(Math.exp(-((f - p) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI)));
  }
  const yMax = Math.max(...ys) * 1.08;
  const { X, Y } = plotScale(0, 0.4, 0, yMax, W, Ht, pad);
  return (
    <Card>
      <Hd>{isKo ? "요동은 N^(−1/2)로 사라진다" : "Fluctuations vanish as N^(−1/2)"}</Hd>
      <Eq>{"σ_E² = ⟨E²⟩ − ⟨E⟩² = kT² C_V      ⇒      σ_E / ⟨E⟩ ∝ N^(−1/2)"}</Eq>
      <Note>
        {isKo
          ? "N개의 2준위 계를 kT = ε인 열 저장조에 담그면 총에너지는 고정되지 않고 흔들립니다. 그러나 분포의 폭은 N^(1/2)로, 평균은 N으로 자라므로 상대 폭은 N^(−1/2)로 줄어듭니다. 분자가 10²⁰개면 상대 요동이 10⁻¹⁰ 수준입니다. 그래서 에너지를 고정한 앙상블(NVE)과 온도를 고정한 앙상블(NVT)이 거시적으로 같은 답을 줍니다."
          : "Put N two-level systems in contact with a reservoir at kT = ε and the total energy is no longer fixed; it fluctuates. The width grows as N^(1/2) while the mean grows as N, so the relative width falls as N^(−1/2). For 10²⁰ molecules the relative fluctuation is about 10⁻¹⁰. That is why the fixed-energy (NVE) and fixed-temperature (NVT) ensembles give the same macroscopic answers."}
      </Note>
      <Row>
        <Slider label="N" value={lgN} min={1} max={6} step={0.01} onChange={setLgN} width={240} fmt={() => N.toLocaleString()} />
      </Row>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "E / Nε (입자당 에너지)" : "E / Nε (energy per particle)"} ylabel={isKo ? "확률 밀도" : "probability density"} />
        <path d={pathOf(xs.map((x, i) => [x, ys[i]]), X, Y) + ` L ${X(0.4)} ${Y(0)} L ${X(0)} ${Y(0)} Z`} fill={`${C.accent}33`} stroke={C.accent} strokeWidth={2.2} />
        <line x1={X(p)} y1={pad} x2={X(p)} y2={Ht - pad} stroke={C.amber} strokeDasharray="5 4" />
        {[0, 0.1, 0.2, 0.3, 0.4].map(v => <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v.toFixed(1)}</text>)}
        <text x={X(p) + 6} y={pad + 4} fill={C.amber} fontSize={11}>{`⟨E⟩/Nε = ${p.toFixed(4)}`}</text>
      </svg>
      <StatGrid>
        <Stat label="σ_E / ⟨E⟩" value={rel < 1e-3 ? sci(rel) : rel.toFixed(4)} color={C.accent} />
        <Stat label={isKo ? "N = 10²³이면" : "for N = 10²³"} value={sci(Math.sqrt((1 - p) / (1e23 * p)))} color={C.pink} />
        <Stat label={isKo ? "σ_E²/(N(kT)²) = C_V/Nk" : "σ_E²/(N(kT)²) = C_V/Nk"} value={(p * (1 - p)).toFixed(4)} color={C.teal} />
      </StatGrid>
      <Note>
        {isKo
          ? "마지막 칸은 요동에서 구한 열용량입니다. 위 실험실에서 kT = ε일 때 미분으로 구한 C_V/Nk = 0.1966과 같습니다. 열을 넣어 온도를 재지 않고도, 평형에서의 에너지 흔들림만 보면 열용량을 알 수 있다는 뜻입니다. 분자 동역학 시뮬레이션이 열용량을 구하는 방법이 바로 이것입니다."
          : "The last box is the heat capacity obtained from the fluctuations. It equals C_V/Nk = 0.1966, obtained by differentiation at kT = ε in the lab above. Without adding any heat, the energy jitter at equilibrium tells you the heat capacity. This is how molecular dynamics simulations compute it."}
      </Note>
    </Card>
  );
}

// NIST CCCBDB constants: M (g/mol), omega_e (cm^-1), B_e (cm^-1), symmetry number, ground degeneracy, CODATA S° (J/K/mol)
const DIATOMICS = {
  N2: { M: 28.0134, w: 2358.57, B: 1.998241, sig: 2, g0: 1, Sref: 191.609 },
  O2: { M: 31.9988, w: 1580.161, B: 1.44562, sig: 2, g0: 3, Sref: 205.152 },
  CO: { M: 28.0101, w: 2169.756, B: 1.931602, sig: 1, g0: 1, Sref: 197.660 },
  HCl: { M: 36.461, w: 2990.925, B: 10.5933, sig: 1, g0: 1, Sref: 186.902 },
  I2: { M: 253.809, w: 214.502, B: 0.037372, sig: 2, g0: 1, Sref: 260.687 },
};
function diatomicS(d, T, p0 = 1e5) {
  const m = d.M * AMU;
  const Lam = HPL / Math.sqrt(2 * Math.PI * m * KB * T);
  const qTN = (KB * T / p0) / Lam ** 3;
  const thR = HPL * C_CM * d.B / KB, thV = HPL * C_CM * d.w / KB;
  const qR = T / (d.sig * thR);
  const x = thV / T;
  const qV = 1 / (1 - Math.exp(-x));
  const Str = RGAS * (Math.log(qTN) + 2.5);
  const Srot = RGAS * (Math.log(qR) + 1);
  const Svib = RGAS * (x / Math.expm1(x) - Math.log(1 - Math.exp(-x)));
  const Sel = RGAS * Math.log(d.g0);
  return { Lam, qTN, qR, qV, thR, thV, Str, Srot, Svib, Sel, S: Str + Srot + Svib + Sel };
}
function rotCv(thR, T) {                  // exact rigid-rotor sum, heteronuclear counting
  const b = thR / T;
  if (b < 0.01) return 1;              // classical limit (sum would need > 400 terms)
  let z = 0, e1 = 0, e2 = 0;
  for (let J = 0; J < 400; J++) {
    const E = J * (J + 1), g = 2 * J + 1, w = g * Math.exp(-b * E);
    z += w; e1 += w * E; e2 += w * E * E;
    if (w < 1e-14 * z && J > 5) break;
  }
  const m1 = e1 / z, m2 = e2 / z;
  return b * b * (m2 - m1 * m1);
}

function DiatomicLab({ isKo }) {
  const [mol, setMol] = useState("N2");
  const [lgT, setLgT] = useState(Math.log10(298.15));
  const T = Math.pow(10, lgT);
  const d = DIATOMICS[mol];
  const r = diatomicS(d, T);
  const W = 680, Ht = 260, pad = 52;
  const { X, Y } = plotScale(0, 4, 0, 4.2, W, Ht, pad);
  const cv = [];
  for (let j = 0; j <= 240; j++) {
    const lt = 4 * j / 240, TT = Math.pow(10, lt), x = r.thV / TT;
    const cvib = x > 300 ? 0 : x * x * Math.exp(x) / Math.expm1(x) ** 2;
    cv.push([lt, 1.5 + rotCv(r.thR, TT) + cvib]);
  }
  return (
    <Card>
      <Hd>{isKo ? "실험실: 이원자 기체의 분자 분배 함수와 표준 엔트로피" : "Lab: molecular partition functions and standard entropies of diatomic gases"}</Hd>
      <Eq>{"q = q_T q_R q_V q_E,   q_T/V = 1/Λ³,  Λ = h/(2πmkT)^½,   q_R = T/(σθ_R),   q_V = 1/(1 − e^(−θ_V/T)),   q_E = g₀"}</Eq>
      <Row>
        {Object.keys(DIATOMICS).map(k => <button key={k} onClick={() => setMol(k)} style={{ ...btnStyle(mol === k), padding: "6px 12px" }}>{k}</button>)}
        <Slider label="T" value={lgT} min={1} max={3.7} step={0.005} onChange={setLgT} width={200} fmt={() => `${T.toFixed(T < 100 ? 1 : 0)} K`} />
        <button onClick={() => setLgT(Math.log10(298.15))} style={{ ...btnStyle(), padding: "6px 12px", fontSize: 12 }}>298.15 K</button>
      </Row>
      <StatGrid min={150}>
        <Stat label="Λ" value={`${(r.Lam * 1e12).toFixed(2)} pm`} color={C.sky} />
        <Stat label="q_T / N (1 bar)" value={sci(r.qTN)} color={C.sky} />
        <Stat label={`θ_R = ${r.thR.toFixed(r.thR < 1 ? 4 : 2)} K`} value={`q_R = ${r.qR.toFixed(1)}`} color={C.accent} />
        <Stat label={`θ_V = ${r.thV.toFixed(0)} K`} value={`q_V = ${r.qV.toFixed(4)}`} color={C.pink} />
        <Stat label="q_E = g₀" value={String(d.g0)} color={C.amber} />
      </StatGrid>
      <StatGrid min={130}>
        <Stat label="S_trans" value={r.Str.toFixed(1)} color={C.sky} />
        <Stat label="S_rot" value={r.Srot.toFixed(1)} color={C.accent} />
        <Stat label="S_vib" value={r.Svib.toFixed(2)} color={C.pink} />
        <Stat label="S_el" value={r.Sel.toFixed(2)} color={C.amber} />
        <Stat label={isKo ? "S° 합 (J K⁻¹ mol⁻¹)" : "S° total (J K⁻¹ mol⁻¹)"} value={r.S.toFixed(1)} color={C.ok} />
      </StatGrid>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel="T (K, log)" ylabel="C_V / R" />
        {[1.5, 2.5, 3.5].map(v => <line key={v} x1={pad} y1={Y(v)} x2={W - pad} y2={Y(v)} stroke={C.border} strokeDasharray="3 5" />)}
        <path d={pathOf(cv, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.6} />
        <line x1={X(lgT)} y1={pad} x2={X(lgT)} y2={Ht - pad} stroke={C.amber} strokeDasharray="5 4" />
        {[0, 1, 2, 3, 4].map(v => <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{`10${"⁰¹²³⁴"[v]}`}</text>)}
        {[1.5, 2.5, 3.5].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        <text x={W - pad} y={Y(1.5) + 14} fill={C.textDim} fontSize={10} textAnchor="end">{isKo ? "병진 3/2" : "translation 3/2"}</text>
        <text x={W - pad} y={Y(2.5) + 14} fill={C.textDim} fontSize={10} textAnchor="end">{isKo ? "+ 회전 1" : "+ rotation 1"}</text>
        <text x={W - pad} y={Y(3.5) - 6} fill={C.textDim} fontSize={10} textAnchor="end">{isKo ? "+ 진동 1" : "+ vibration 1"}</text>
      </svg>
      <Note>
        {isKo
          ? "회전은 θ_R보다 조금 높은 온도에서 켜지고, 진동은 θ_V 근처에서 켜집니다. N₂의 θ_V는 3,393 K라서 상온에서 진동은 거의 얼어 있습니다. 그래서 공기의 C_V가 5/2 R입니다. I₂는 무겁고 결합이 약해서 θ_V = 309 K이고, 상온에서 이미 진동이 절반쯤 켜져 있습니다. (그래프는 강체 회전자를 이핵 분자처럼 센 것이고, 동핵 분자의 ortho/para 구분은 무시했습니다.)"
          : "Rotation switches on a little above θ_R and vibration near θ_V. For N₂, θ_V = 3,393 K, so vibration is almost frozen at room temperature; that is why C_V of air is 5/2 R. I₂ is heavy and weakly bound, θ_V = 309 K, so its vibration is already about half active at room temperature. (The curve counts the rigid rotor as if heteronuclear and ignores the ortho/para distinction of homonuclear molecules.)"}
      </Note>
      <HdSub>{isKo ? "298.15 K, 1 bar에서 계산값 대 CODATA 값" : "Computed versus CODATA at 298.15 K, 1 bar"}</HdSub>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13, fontFamily: mono }}>
          <thead>
            <tr style={{ color: C.textDim, borderBottom: `1px solid ${C.border}` }}>
              {[isKo ? "분자" : "molecule", "σ", "g₀", "S_trans", "S_rot", "S_vib", "S_el", isKo ? "계산 S°" : "computed S°", "CODATA", "Δ"].map(h => <th key={h} style={{ padding: "6px 8px", textAlign: "right" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {Object.entries(DIATOMICS).map(([k, dd]) => {
              const s = diatomicS(dd, 298.15);
              return (
                <tr key={k} style={{ borderBottom: `1px solid ${C.border}`, color: k === mol ? C.accentSoft : C.text }}>
                  {[k, dd.sig, dd.g0, s.Str.toFixed(1), s.Srot.toFixed(1), s.Svib.toFixed(2), s.Sel.toFixed(2), s.S.toFixed(1), dd.Sref.toFixed(1), (s.S - dd.Sref).toFixed(2)].map((v, i) => <td key={i} style={{ padding: "6px 8px", textAlign: "right" }}>{v}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Note>
        {isKo
          ? "단위는 J K⁻¹ mol⁻¹입니다. 분광학으로 잰 분자 상수 다섯 개(질량, ω_e, B_e, σ, g₀)만으로 열량계로 잰 엔트로피를 0.3 J K⁻¹ mol⁻¹ 안에서 맞춥니다. O₂는 바닥 상태가 삼중항(³Σ_g⁻)이라 R ln 3 = 9.13이 더해집니다. 이 항을 빼면 9 J K⁻¹ mol⁻¹나 틀립니다. 대칭수 σ = 2를 빼먹으면 R ln 2 = 5.76만큼 틀립니다. 분자 상수: NIST CCCBDB. 기준값: CODATA Key Values."
          : "Units are J K⁻¹ mol⁻¹. Five spectroscopic constants (mass, ω_e, B_e, σ, g₀) reproduce the calorimetric entropy to within 0.3 J K⁻¹ mol⁻¹. O₂ has a triplet ground state (³Σ_g⁻), which adds R ln 3 = 9.13; leaving it out costs 9 J K⁻¹ mol⁻¹. Forgetting the symmetry number σ = 2 costs R ln 2 = 5.76. Constants: NIST CCCBDB. Reference values: CODATA Key Values."}
      </Note>
    </Card>
  );
}

// =============================================================
// 4) ENSEMBLES & ERGODICITY
// =============================================================
function EnsemblesTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <EnsembleTable isKo={isKo} />
      <LangmuirLab isKo={isKo} />
      <MuLab isKo={isKo} />
      <ErgodicLab isKo={isKo} />
    </div>
  );
}

function EnsembleTable({ isKo }) {
  const rows = [
    { n: isKo ? "소정준 (미시정준)" : "microcanonical", fix: "N, V, E", pf: "Ω(N,V,E)", pot: "S = k ln Ω", fl: isKo ? "에너지 요동 없음" : "no energy fluctuation", use: isKo ? "고립계, NVE 분자 동역학" : "isolated systems, NVE molecular dynamics", c: C.sky },
    { n: isKo ? "정준" : "canonical", fix: "N, V, T", pf: "Z = Σ e^(−βE)", pot: "F = −kT ln Z", fl: "σ_E² = kT² C_V", use: isKo ? "열 저장조와 닿은 계, 대부분의 계산" : "systems in a heat bath, most calculations", c: C.accent },
    { n: isKo ? "대정준" : "grand canonical", fix: "μ, V, T", pf: "Ξ = Σ λᴺ Z_N,  λ = e^(βμ)", pot: "pV = kT ln Ξ", fl: "σ_N² = kT (∂⟨N⟩/∂μ)", use: isKo ? "흡착, 열린 계, 기공 속 유체" : "adsorption, open systems, fluids in pores", c: C.teal },
    { n: isKo ? "등온등압" : "isothermal–isobaric", fix: "N, p, T", pf: "Δ = Σ e^(−βpV) Z(V)", pot: "G = −kT ln Δ", fl: "σ_V² = kT V κ_T", use: isKo ? "실험실 조건, NPT 분자 동역학" : "laboratory conditions, NPT molecular dynamics", c: C.pink },
  ];
  return (
    <Card>
      <Hd>{isKo ? "네 가지 앙상블: 무엇을 고정하느냐에 따라" : "Four ensembles, by what is held fixed"}</Hd>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
          <thead>
            <tr style={{ color: C.textDim, borderBottom: `1px solid ${C.border}` }}>
              {(isKo ? ["앙상블", "고정", "분배 함수", "다리 방정식", "요동", "쓰임"] : ["ensemble", "fixed", "partition function", "bridge equation", "fluctuation", "use"]).map(h => <th key={h} style={{ padding: "8px", textAlign: "left" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "8px", fontWeight: 800, color: r.c, whiteSpace: "nowrap" }}>{r.n}</td>
                <td style={{ padding: "8px", fontFamily: mono, whiteSpace: "nowrap" }}>{r.fix}</td>
                <td style={{ padding: "8px", fontFamily: mono, whiteSpace: "nowrap" }}>{r.pf}</td>
                <td style={{ padding: "8px", fontFamily: mono, whiteSpace: "nowrap" }}>{r.pot}</td>
                <td style={{ padding: "8px", fontFamily: mono, whiteSpace: "nowrap" }}>{r.fl}</td>
                <td style={{ padding: "8px", color: C.textDim }}>{r.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note>
        {isKo
          ? "규칙은 하나입니다. 고정하지 않고 저장조와 주고받는 양(에너지, 입자, 부피)마다 짝이 되는 세기 변수(T, μ, p)가 Boltzmann 인자에 들어갑니다. 그리고 주고받는 양은 요동합니다. 요동의 크기는 응답 함수(C_V, ∂N/∂μ, 압축률 κ_T)로 정해집니다. 열역학 극한에서는 상대 요동이 N^(−1/2)로 사라지므로 어느 앙상블로 계산해도 같은 열역학을 얻습니다. 계산하기 편한 것을 고르면 됩니다."
          : "One rule covers all four. For every quantity exchanged with the reservoir instead of fixed (energy, particles, volume), its conjugate intensive variable (T, μ, p) enters the Boltzmann factor, and the exchanged quantity fluctuates, by an amount set by a response function (C_V, ∂N/∂μ, the compressibility κ_T). In the thermodynamic limit relative fluctuations die as N^(−1/2), so every ensemble gives the same thermodynamics; choose whichever is easiest to compute."}
      </Note>
    </Card>
  );
}

function LangmuirLab({ isKo }) {
  const Ls = 20, M = Ls * Ls;
  const [bmu, setBmu] = useState(0);
  const [beps, setBeps] = useState(0);
  const [seed, setSeed] = useState(1);
  const lam = Math.exp(bmu), q = Math.exp(beps);
  const theta = lam * q / (1 + lam * q);
  const { grid, hist, mean, varN } = useMemo(() => {
    const rand = makeRng(777 + seed);
    const g = Array.from({ length: M }, () => rand() < theta);
    const NS = 3000, h = new Array(M + 1).fill(0);
    let s1 = 0, s2 = 0;
    for (let k = 0; k < NS; k++) {
      let n = 0;
      for (let i = 0; i < M; i++) if (rand() < theta) n++;
      h[n]++; s1 += n; s2 += n * n;
    }
    const mu1 = s1 / NS;
    return { grid: g, hist: h.map(v => v / NS), mean: mu1, varN: s2 / NS - mu1 * mu1 };
  }, [theta, seed]);       // eslint-disable-line react-hooks/exhaustive-deps
  const cell = 12, GW = Ls * cell;
  const W = 420, Ht = 240, pad = 44;
  const sd = Math.sqrt(Math.max(M * theta * (1 - theta), 1e-9));
  const lo = Math.max(0, Math.floor(M * theta - 5 * sd - 2)), hi = Math.min(M, Math.ceil(M * theta + 5 * sd + 2));
  const yMax = Math.max(...hist.slice(lo, hi + 1), 1 / (sd * Math.sqrt(2 * Math.PI))) * 1.1;
  const { X, Y } = plotScale(lo, hi, 0, yMax, W, Ht, pad);
  const gauss = [];
  for (let j = 0; j <= 120; j++) { const n = lo + (hi - lo) * j / 120; gauss.push([n, Math.exp(-((n - M * theta) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI))]); }
  const W2 = 300, p2 = plotScale(-6, 6, 0, 1, W2, Ht, pad);
  const iso = [];
  for (let j = 0; j <= 120; j++) { const bm = -6 + 12 * j / 120, l = Math.exp(bm) * q; iso.push([bm, l / (1 + l)]); }
  return (
    <Card>
      <Hd>{isKo ? "실험실: 대정준 앙상블로 본 Langmuir 흡착" : "Lab: Langmuir adsorption in the grand canonical ensemble"}</Hd>
      <Eq>{"Ξ = (1 + λq)ᴹ,   θ = ⟨N⟩/M = λq/(1 + λq),   σ_N² = kT ∂⟨N⟩/∂μ = Mθ(1 − θ)"}</Eq>
      <Note>
        {isKo
          ? "표면에 흡착 자리 M = 400개가 있고, 각 자리는 비거나 분자 하나를 붙잡습니다(결합 에너지 ε, q = e^(βε)). 표면은 기체와 분자를 주고받으므로 입자 수가 고정되지 않습니다. 대신 기체의 화학 퍼텐셜 μ가 고정됩니다. 자리마다 독립이라 Ξ가 곱으로 갈라지고, 덮임률 θ는 Langmuir 등온식이 됩니다. 이상 기체에서 λ = e^(βμ) ∝ p이므로 θ = Kp/(1 + Kp)입니다."
          : "A surface has M = 400 adsorption sites, each empty or holding one molecule (binding energy ε, q = e^(βε)). The surface trades molecules with the gas, so the particle number is not fixed; the chemical potential μ of the gas is. Sites are independent, so Ξ factorizes and the coverage θ is the Langmuir isotherm. For an ideal gas λ = e^(βμ) ∝ p, so θ = Kp/(1 + Kp)."}
      </Note>
      <Row>
        <Slider label="βμ" value={bmu} min={-6} max={6} step={0.05} onChange={setBmu} width={160} fmt={v => v.toFixed(2)} />
        <Slider label="βε" value={beps} min={-2} max={4} step={0.05} onChange={setBeps} width={140} fmt={v => v.toFixed(2)} />
        <button onClick={() => setSeed(s => s + 1)} style={btnStyle()}>{isKo ? "다시 표본 추출" : "Resample"}</button>
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <svg width={GW + 20} height={GW + 20} viewBox={`0 0 ${GW + 20} ${GW + 20}`} style={{ ...svgBox(GW + 20), flex: "0 1 260px" }}>
          {grid.map((o, i) => <rect key={i} x={10 + (i % Ls) * cell + 1} y={10 + Math.floor(i / Ls) * cell + 1} width={cell - 2} height={cell - 2} rx={2} fill={o ? C.teal : "#1e293b"} />)}
        </svg>
        <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={{ ...svgBox(W), maxWidth: W }}>
          <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "흡착 분자 수 N" : "adsorbed molecules N"} ylabel="P(N)" />
          {hist.slice(lo, hi + 1).map((p, k) => { const n = lo + k, bw = Math.max((X(1) - X(0)) * 0.8, 1); return <rect key={n} x={X(n) - bw / 2} y={Y(p)} width={bw} height={Math.max(Y(0) - Y(p), 0)} fill={C.teal} opacity={0.7} />; })}
          <path d={pathOf(gauss, X, Y)} fill="none" stroke={C.amber} strokeWidth={2} />
          <text x={pad + 4} y={Ht - pad + 16} fill={C.textDim} fontSize={10}>{lo}</text>
          <text x={W - pad} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="end">{hi}</text>
        </svg>
        <svg width={W2} height={Ht} viewBox={`0 0 ${W2} ${Ht}`} style={svgBox(W2)}>
          <Axes W={W2} Ht={Ht} pad={pad} xlabel="βμ  (∝ ln p)" ylabel="θ" />
          <path d={pathOf(iso, p2.X, p2.Y)} fill="none" stroke={C.teal} strokeWidth={2.4} />
          <circle cx={p2.X(bmu)} cy={p2.Y(theta)} r={5} fill={C.amber} />
          {[-6, 0, 6].map(v => <text key={v} x={p2.X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
          {[0, 0.5, 1].map(v => <text key={v} x={pad - 6} y={p2.Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        </svg>
      </div>
      <StatGrid>
        <Stat label="θ" value={theta.toFixed(4)} color={C.teal} />
        <Stat label={isKo ? "표본 ⟨N⟩ / 이론 Mθ" : "sampled ⟨N⟩ / theory Mθ"} value={`${mean.toFixed(1)} / ${(M * theta).toFixed(1)}`} color={C.accent} />
        <Stat label={isKo ? "표본 σ_N² / 이론 Mθ(1−θ)" : "sampled σ_N² / theory Mθ(1−θ)"} value={`${varN.toFixed(1)} / ${(M * theta * (1 - theta)).toFixed(1)}`} color={C.pink} />
        <Stat label="σ_N / ⟨N⟩" value={theta > 0.001 ? Math.sqrt((1 - theta) / (M * theta)).toFixed(4) : "—"} color={C.amber} />
      </StatGrid>
      <Note>
        {isKo
          ? "요동은 θ = 1/2에서 가장 큽니다. 꽉 찬 표면(θ → 1)이나 빈 표면(θ → 0)은 거의 흔들리지 않습니다. 등온식의 기울기 ∂θ/∂(βμ)가 곧 요동의 크기라는 점을 오른쪽 그래프에서 확인해 보십시오."
          : "Fluctuations are largest at θ = 1/2; a full (θ → 1) or empty (θ → 0) surface barely fluctuates. Check on the right that the slope of the isotherm, ∂θ/∂(βμ), is the size of the fluctuation."}
      </Note>
    </Card>
  );
}

function MuLab({ isKo }) {
  const gases = { N2: 28.0134, He: 4.002602, Ar: 39.948, H2: 2.01588 };
  const [gas, setGas] = useState("N2");
  const [lgT, setLgT] = useState(Math.log10(298.15));
  const [lgP, setLgP] = useState(0);
  const T = Math.pow(10, lgT), p = Math.pow(10, lgP) * 1e5;
  const m = gases[gas] * AMU;
  const Lam = HPL / Math.sqrt(2 * Math.PI * m * KB * T);
  const n = p / (KB * T);
  const nL3 = n * Lam ** 3;
  const mu = Math.log(nL3);
  const spacing = Math.pow(1 / n, 1 / 3);
  return (
    <Card>
      <Hd>{isKo ? "이상 기체의 화학 퍼텐셜과 고전 극한" : "Chemical potential of an ideal gas and the classical limit"}</Hd>
      <Eq>{`μ = −kT ln(q_T/N) = kT ln(nΛ³),     nΛ³ ≪ 1  ⇔  ${isKo ? "고전 기체" : "classical gas"}`}</Eq>
      <Note>
        {isKo
          ? "Λ는 열적 de Broglie 파장, n^(−1/3)은 분자 사이 평균 거리입니다. nΛ³ ≪ 1이면 파동 묶음이 서로 겹치지 않으므로 분자를 고전 입자로 셀 수 있습니다. 이때 μ는 크게 음수입니다. 밀도를 높이거나 온도를 낮추면 nΛ³가 1에 다가가고, 양자 통계(Bose 또는 Fermi)가 필요해집니다."
          : "Λ is the thermal de Broglie wavelength and n^(−1/3) the mean spacing between molecules. When nΛ³ ≪ 1 the wave packets do not overlap, molecules can be counted as classical particles, and μ is large and negative. Raise the density or lower the temperature and nΛ³ approaches 1; quantum (Bose or Fermi) statistics are then needed."}
      </Note>
      <Row>
        {Object.keys(gases).map(k => <button key={k} onClick={() => setGas(k)} style={{ ...btnStyle(gas === k), padding: "6px 12px" }}>{k}</button>)}
        <Slider label="T" value={lgT} min={0} max={3.5} step={0.005} onChange={setLgT} width={170} fmt={() => `${T.toFixed(T < 10 ? 2 : 1)} K`} />
        <Slider label="p" value={lgP} min={-3} max={3} step={0.01} onChange={setLgP} width={150} fmt={() => `${(p / 1e5).toPrecision(3)} bar`} />
        <button onClick={() => { setGas("He"); setLgT(Math.log10(4.2)); setLgP(0); }} style={{ ...btnStyle(), padding: "6px 12px", fontSize: 12 }}>{isKo ? "He, 4.2 K" : "He at 4.2 K"}</button>
      </Row>
      <StatGrid>
        <Stat label="Λ" value={`${(Lam * 1e12).toFixed(2)} pm`} color={C.sky} />
        <Stat label="n^(−1/3)" value={`${(spacing * 1e9).toFixed(2)} nm`} color={C.textDim} />
        <Stat label="nΛ³" value={sci(nL3)} color={nL3 > 0.05 ? C.err : C.ok} />
        <Stat label="μ / kT" value={mu.toFixed(2)} color={C.accent} />
        <Stat label="μ (kJ/mol)" value={(RGAS * T * mu / 1000).toFixed(2)} color={C.accent} />
      </StatGrid>
      <Note>
        {nL3 > 0.05
          ? (isKo ? "nΛ³가 0.05를 넘었습니다. 고전 통계가 흔들리기 시작하는 영역입니다. 1 bar, 4.2 K의 He에서 nΛ³ = 0.133입니다. 끓는 액체 헬륨 바로 위의 기체도 이미 양자 효과가 무시할 수 없는 수준입니다." : "nΛ³ exceeds 0.05: classical statistics begins to fail. For He at 1 bar and 4.2 K, nΛ³ = 0.133; even the vapor just above boiling liquid helium shows non-negligible quantum effects.")
          : (isKo ? "상온 1 bar의 N₂에서 nΛ³ = 1.69×10⁻⁷, μ = −15.6 kT ≈ −38.7 kJ/mol입니다(병진만 고려). He는 상온에서도 nΛ³ = 3.1×10⁻⁶으로 고전 기체입니다." : "For N₂ at room temperature and 1 bar, nΛ³ = 1.69×10⁻⁷ and μ = −15.6 kT ≈ −38.7 kJ/mol (translation only). Helium at room temperature, nΛ³ = 3.1×10⁻⁶, is also classical.")}
      </Note>
    </Card>
  );
}

// ---- ergodicity: billiards ----------------------------------
function inside(shape, x, y) {
  if (shape === "circle") return x * x + y * y <= 1;
  if (Math.abs(x) <= 1) return Math.abs(y) <= 1;
  const cx = x > 0 ? 1 : -1;
  return (x - cx) ** 2 + y * y <= 1;
}
function normalAt(shape, x, y) {
  if (shape === "circle") { const r = Math.hypot(x, y); return [x / r, y / r]; }
  if (Math.abs(x) <= 1) return [0, Math.sign(y) || 1];
  const cx = x > 0 ? 1 : -1, r = Math.hypot(x - cx, y);
  return [(x - cx) / r, y / r];
}
function ErgodicLab({ isKo }) {
  const [ang, setAng] = useState(1.2);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({ circ: { cov: 0, r2: 0, t: 0 }, stad: { cov: 0, r2: 0, t: 0 } });
  const cRef = useRef(null), sRef = useRef(null), simRef = useRef(null), rafRef = useRef(null);
  const NX = { circle: 64, stadium: 128 }, NY = 64;
  const box = { circle: [-1, 1], stadium: [-2, 2] };
  const ens = useMemo(() => {
    const out = {};
    ["circle", "stadium"].forEach(sh => {
      let n = 0, s = 0;
      const [x0, x1] = box[sh];
      for (let i = 0; i < NX[sh]; i++) for (let j = 0; j < NY; j++) {
        const x = x0 + (x1 - x0) * (i + 0.5) / NX[sh], y = -1 + 2 * (j + 0.5) / NY;
        if (inside(sh, x, y)) { n++; s += x * x + y * y; }
      }
      out[sh] = { cells: n, r2: s / n };
    });
    return out;
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  const init = a => {
    const mk = sh => ({ sh, x: 0.6, y: 0, vx: Math.cos(a), vy: Math.sin(a), grid: new Float32Array(NX[sh] * NY), r2: 0, t: 0 });
    simRef.current = [mk("circle"), mk("stadium")];
    draw();
  };
  const advance = p => {
    const dt = 0.004;
    for (let k = 0; k < 3000; k++) {
      let nx = p.x + p.vx * dt, ny = p.y + p.vy * dt;
      if (!inside(p.sh, nx, ny)) {
        // locate the wall hit by bisection so the reflection uses the true normal
        let lo = 0, hi = 1;
        for (let it = 0; it < 30; it++) { const m = 0.5 * (lo + hi); if (inside(p.sh, p.x + p.vx * dt * m, p.y + p.vy * dt * m)) lo = m; else hi = m; }
        const hx = p.x + p.vx * dt * lo, hy = p.y + p.vy * dt * lo;
        const [ux, uy] = normalAt(p.sh, hx, hy);
        const dot = p.vx * ux + p.vy * uy;
        p.vx -= 2 * dot * ux; p.vy -= 2 * dot * uy;
        nx = hx + p.vx * dt * (1 - lo); ny = hy + p.vy * dt * (1 - lo);
        if (!inside(p.sh, nx, ny)) { nx = hx; ny = hy; }
      }
      p.x = nx; p.y = ny;
      const [x0, x1] = box[p.sh];
      const i = Math.min(NX[p.sh] - 1, Math.max(0, Math.floor((p.x - x0) / (x1 - x0) * NX[p.sh])));
      const j = Math.min(NY - 1, Math.max(0, Math.floor((p.y + 1) / 2 * NY)));
      p.grid[i * NY + j] += 1;
      p.r2 += p.x * p.x + p.y * p.y; p.t += 1;
    }
  };
  const draw = () => {
    const sims = simRef.current;
    if (!sims) return;
    const res = {};
    sims.forEach((p, idx) => {
      const cv = (idx === 0 ? cRef : sRef).current;
      const nx = NX[p.sh], [x0, x1] = box[p.sh];
      let mx = 0, vis = 0;
      for (let k = 0; k < p.grid.length; k++) { if (p.grid[k] > mx) mx = p.grid[k]; }
      for (let i = 0; i < nx; i++) for (let j = 0; j < NY; j++) {
        const x = x0 + (x1 - x0) * (i + 0.5) / nx, y = -1 + 2 * (j + 0.5) / NY;
        if (inside(p.sh, x, y) && p.grid[i * NY + j] > 0) vis++;
      }
      if (cv) {
        const ctx = cv.getContext("2d"), s = 4;
        ctx.fillStyle = "#0d1117"; ctx.fillRect(0, 0, cv.width, cv.height);
        for (let i = 0; i < nx; i++) for (let j = 0; j < NY; j++) {
          const x = x0 + (x1 - x0) * (i + 0.5) / nx, y = -1 + 2 * (j + 0.5) / NY;
          if (!inside(p.sh, x, y)) continue;
          const v = mx > 0 ? Math.sqrt(p.grid[i * NY + j] / mx) : 0;
          ctx.fillStyle = v > 0 ? `rgba(129,140,248,${0.15 + 0.85 * v})` : "#1e293b";
          ctx.fillRect(i * s, (NY - 1 - j) * s, s, s);
        }
        ctx.fillStyle = C.amber;
        ctx.beginPath();
        ctx.arc((p.x - x0) / (x1 - x0) * nx * s, (1 - (p.y + 1) / 2) * NY * s, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
      res[idx === 0 ? "circ" : "stad"] = { cov: vis / ens[p.sh].cells, r2: p.t ? p.r2 / p.t : 0, t: p.t };
    });
    setStats(res);
  };
  const loop = () => {
    simRef.current.forEach(advance);
    draw();
    if (simRef.current[0].t < 3e6) rafRef.current = requestAnimationFrame(loop); else setRunning(false);
  };
  useEffect(() => { init(ang); return () => cancelAnimationFrame(rafRef.current); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const reset = a => { cancelAnimationFrame(rafRef.current); setRunning(false); init(a); };
  const toggle = () => {
    if (running) { cancelAnimationFrame(rafRef.current); setRunning(false); }
    else { setRunning(true); rafRef.current = requestAnimationFrame(loop); }
  };
  const caustic = Math.abs(0.6 * Math.sin(ang));
  const r2circ = (1 + 2 * caustic * caustic) / 3;
  return (
    <Card>
      <Hd>{isKo ? "에르고딕성: 시간 평균 = 앙상블 평균인가?" : "Ergodicity: does the time average equal the ensemble average?"}</Hd>
      <Note>
        {isKo
          ? "앙상블 평균은 가능한 모든 상태를 똑같은 가중치로 평균한 값입니다. 실험은 한 계를 오래 관찰한 시간 평균을 잽니다. 둘이 같으려면 계가 시간이 지나며 허용된 상태를 모두 골고루 돌아다녀야 합니다(에르고딕 가설). 당구대 위 공 하나로 시험해 봅니다. 원형 당구대에서는 각운동량이 보존되므로 공은 반지름 |L|인 안쪽 원(caustic)에 영영 들어가지 못합니다. 경기장 모양(Bunimovich stadium)에서는 운동이 혼돈적이어서 공이 결국 모든 곳을 고르게 방문합니다."
          : "An ensemble average weights every allowed state equally; an experiment measures the time average of one system watched for a long time. They agree only if the system eventually visits all allowed states evenly (the ergodic hypothesis). Test it with a single ball on a billiard table. In a circular table angular momentum is conserved, so the ball can never enter an inner circle (the caustic) of radius |L|. In a stadium (Bunimovich) the motion is chaotic and the ball eventually visits everywhere evenly."}
      </Note>
      <Row>
        <Slider label={isKo ? "처음 발사 각도" : "launch angle"} value={ang} min={0} max={3.14} step={0.01} onChange={v => { setAng(v); reset(v); }} width={180} fmt={v => `${(v * 180 / Math.PI).toFixed(0)}°`} />
        <button onClick={toggle} style={btnStyle(running)}>{running ? (isKo ? "일시정지" : "Pause") : (isKo ? "실행" : "Run")}</button>
        <button onClick={() => reset(ang)} style={btnStyle()}>{isKo ? "처음부터" : "Reset"}</button>
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "0 1 260px" }}>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 4 }}>{isKo ? "원형 (적분 가능)" : "circle (integrable)"}</div>
          <canvas ref={cRef} width={256} height={256} style={{ width: "100%", maxWidth: 256, height: "auto", borderRadius: 10, border: `1px solid ${C.border}` }} />
        </div>
        <div style={{ flex: "1 1 400px" }}>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 4 }}>{isKo ? "경기장형 (혼돈)" : "stadium (chaotic)"}</div>
          <canvas ref={sRef} width={512} height={256} style={{ width: "100%", maxWidth: 512, height: "auto", borderRadius: 10, border: `1px solid ${C.border}` }} />
        </div>
      </div>
      <StatGrid>
        <Stat label={isKo ? "원형: 방문한 면적 비율" : "circle: area fraction visited"} value={stats.circ.cov.toFixed(3)} color={C.accent} />
        <Stat label={isKo ? "원형: 시간 평균 ⟨r²⟩ / 앙상블" : "circle: time ⟨r²⟩ / ensemble"} value={`${stats.circ.r2.toFixed(3)} / ${ens.circle.r2.toFixed(3)}`} color={C.accent} />
        <Stat label={isKo ? "경기장: 방문한 면적 비율" : "stadium: area fraction visited"} value={stats.stad.cov.toFixed(3)} color={C.teal} />
        <Stat label={isKo ? "경기장: 시간 평균 ⟨r²⟩ / 앙상블" : "stadium: time ⟨r²⟩ / ensemble"} value={`${stats.stad.r2.toFixed(3)} / ${ens.stadium.r2.toFixed(3)}`} color={C.teal} />
        <Stat label={isKo ? "원형의 금지 반지름 |L|" : "circle: forbidden radius |L|"} value={caustic.toFixed(3)} color={C.amber} />
        <Stat label={isKo ? "원형 이론: 1 − L², (1 + 2L²)/3" : "circle theory: 1 − L², (1 + 2L²)/3"} value={`${(1 - caustic * caustic).toFixed(3)}, ${r2circ.toFixed(3)}`} color={C.amber} />
      </StatGrid>
      <Note>
        {isKo
          ? "원형에서는 아무리 오래 기다려도 방문 비율이 1 − L²에서 멈춥니다. 시간 평균 ⟨r²⟩도 앙상블 값 0.5가 아니라 (1 + 2L²)/3으로 갑니다. 공이 거리 |L|인 현(chord) 위만 오가기 때문입니다. 경기장에서는 둘이 같아집니다. 실제 분자계는 자유도가 아주 많고 충돌이 혼돈적이라 보통 경기장 쪽입니다. 그래도 유리, 단백질의 느린 접힘처럼 장벽이 높아 관찰 시간 안에 일부 상태만 돌아다니는 계에서는 에르고딕성이 실제로 깨집니다. 분자 동역학 결과를 해석할 때 꼭 확인해야 할 점입니다."
          : "In the circle the visited fraction stalls at 1 − L² however long you wait, and the time-averaged ⟨r²⟩ goes to (1 + 2L²)/3 instead of the ensemble value 0.5, because the ball only travels along chords at distance |L| from the center. In the stadium the two agree. Real molecular systems have many degrees of freedom and chaotic collisions, so they usually behave like the stadium. Ergodicity does break in practice, though, when high barriers confine a system to part of its states within the observation time, as in glasses or slow protein folding. This is worth checking whenever you interpret a molecular dynamics run."}
      </Note>
    </Card>
  );
}

// =============================================================
// 5) LATTICE MIXING MODEL
// =============================================================
const fMix = (p, chi) => chi * p * (1 - p) + p * Math.log(p) + (1 - p) * Math.log(1 - p);
function binodalPhi(chi) {
  if (chi <= 2) return 0.5;
  let a = 1e-12, b = 0.5 - 1e-9;
  const g = p => Math.log(p / (1 - p)) - chi * (2 * p - 1);
  for (let k = 0; k < 200; k++) { const m = 0.5 * (a + b); if (g(m) < 0) a = m; else b = m; }
  return 0.5 * (a + b);
}
const spinodalPhi = chi => chi <= 2 ? 0.5 : 0.5 * (1 - Math.sqrt(1 - 2 / chi));

function MixingTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <LatticeDerivCard isKo={isKo} />
      <FreeEnergyLab isKo={isKo} />
      <KawasakiLab isKo={isKo} />
    </div>
  );
}

function LatticeDerivCard({ isKo }) {
  const steps = [
    { eq: "ΔS_mix/Nk = −[φ ln φ + (1 − φ) ln(1 − φ)]", ko: "A와 B를 N개 격자 자리에 놓는 방법의 수 W = N!/(N_A! N_B!)에 Stirling 근사를 씁니다. 섞으면 항상 엔트로피가 늘어납니다.", en: "Stirling applied to W = N!/(N_A! N_B!), the number of ways to place A and B on N sites. Mixing always raises the entropy." },
    { eq: "ΔU_mix/N = (z/2)(2ε_AB − ε_AA − ε_BB) φ(1 − φ) ≡ κ φ(1 − φ)", ko: "평균장 가정: 이웃이 무작위로 섞여 있다고 보고, 한 자리의 이웃 z개 중 상대 성분은 z(1 − φ)개입니다. 같은 종끼리 더 좋아하면 κ > 0입니다.", en: "Mean-field assumption: neighbors are randomly mixed, so z(1 − φ) of a site's z neighbors are the other species. κ > 0 when like neighbors are preferred." },
    { eq: "ΔF_mix/NkT = χ φ(1 − φ) + φ ln φ + (1 − φ) ln(1 − φ),   χ = κ/kT", ko: "에너지는 섞임을 막고(χ > 0), 엔트로피는 섞임을 돕습니다. χ 하나가 둘의 경쟁을 요약합니다. 고분자 블렌드에서는 Flory–Huggins 매개변수가 같은 역할을 합니다.", en: "Energy opposes mixing (χ > 0) and entropy favors it; χ alone sums up the contest. In polymer blends the Flory–Huggins parameter plays the same role." },
    { eq: "f″ = −2χ + 1/[φ(1 − φ)] = 0   ⇒   χ_s = 1/[2φ(1 − φ)]", ko: "곡률이 음수인 곳(스피노달 안쪽)에서는 아주 작은 조성 요동도 자라서 저절로 갈라집니다.", en: "Where the curvature is negative (inside the spinodal), even an infinitesimal composition fluctuation grows and the mixture splits by itself." },
    { eq: "ln[φ/(1 − φ)] = χ(2φ − 1)   (대칭 바이노달)".replace("(대칭 바이노달)", isKo ? "(대칭 바이노달)" : "(symmetric binodal)"), ko: "공통 접선 조건 μ_A(α) = μ_A(β), μ_B(α) = μ_B(β)가 대칭 모형에서는 f′(φ) = 0이 됩니다. 이 조성이 평형에서 공존하는 두 상입니다.", en: "The common-tangent conditions μ_A(α) = μ_A(β), μ_B(α) = μ_B(β) reduce to f′(φ) = 0 for the symmetric model; these are the two coexisting phases." },
    { eq: "φ_c = 1/2,   χ_c = 2,   T_c = κ/2k", ko: "스피노달의 최솟값이 임계점입니다. 이 위에서는 어떤 조성이든 섞입니다.", en: "The minimum of the spinodal is the critical point. Above it every composition mixes." },
  ];
  return (
    <Card>
      <Hd>{isKo ? "격자 모형에서 상평형도까지 (강의 Part 2, 3–9쪽)" : "From the lattice model to the phase diagram (lecture Part 2, pp. 3–9)"}</Hd>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ minWidth: 28, height: 28, borderRadius: "50%", background: "rgba(45,212,191,0.16)", color: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>{i + 1}</div>
          <div style={{ flex: 1 }}>
            <Eq style={{ margin: "0 0 4px" }}>{s.eq}</Eq>
            <Note>{isKo ? s.ko : s.en}</Note>
          </div>
        </div>
      ))}
    </Card>
  );
}

function FreeEnergyLab({ isKo }) {
  const [chi, setChi] = useState(2.5);
  const [phi0, setPhi0] = useState(0.3);
  const [kap, setKap] = useState(5);
  const pb = binodalPhi(chi), ps = spinodalPhi(chi);
  const fpp = -2 * chi + 1 / (phi0 * (1 - phi0));
  let region, rc;
  if (chi <= 2 || phi0 <= pb || phi0 >= 1 - pb) { region = isKo ? "안정: 균일하게 섞인다" : "stable: stays mixed"; rc = C.ok; }
  else if (phi0 <= ps || phi0 >= 1 - ps) { region = isKo ? "준안정: 핵생성이 필요하다" : "metastable: needs nucleation"; rc = C.amber; }
  else { region = isKo ? "불안정: 스피노달 분해" : "unstable: spinodal decomposition"; rc = C.err; }
  const W = 440, Ht = 300, pad = 50;
  const fs = []; let fmin = 0, fmax = 0;
  for (let j = 1; j < 300; j++) { const p = j / 300, v = fMix(p, chi); fs.push([p, v]); fmin = Math.min(fmin, v); fmax = Math.max(fmax, v); }
  const { X, Y } = plotScale(0, 1, fmin - 0.05, Math.max(fmax, 0.05) + 0.05, W, Ht, pad);
  const W2 = 400;
  const p2 = plotScale(0, 1, 0, 1.6, W2, Ht, pad);
  const bin = [], spi = [];
  for (let j = 0; j <= 200; j++) {
    const c = 2 + 0.0001 + 6 * j / 200, tt = 2 / c;
    const b = binodalPhi(c), s = spinodalPhi(c);
    bin.push([b, tt]); spi.push([s, tt]);
  }
  const mirror = arr => arr.slice().reverse().map(([x, y]) => [1 - x, y]);
  const binC = [...bin.slice().reverse(), ...mirror(bin.slice().reverse())];
  const spiC = [...spi.slice().reverse(), ...mirror(spi.slice().reverse())];
  const Tc = kap * 1000 / (2 * RGAS);
  return (
    <Card>
      <Hd>{isKo ? "실험실: 자유 에너지 곡선과 상평형도" : "Lab: free-energy curve and phase diagram"}</Hd>
      <Row>
        <Slider label="χ = κ/kT" value={chi} min={0.5} max={5} step={0.01} onChange={setChi} width={180} fmt={v => v.toFixed(2)} />
        <Slider label="φ₀" value={phi0} min={0.02} max={0.98} step={0.005} onChange={setPhi0} width={180} fmt={v => v.toFixed(3)} />
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={{ ...svgBox(W), maxWidth: W }}>
          <Axes W={W} Ht={Ht} pad={pad} xlabel="φ" ylabel="ΔF_mix / NkT" />
          <line x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(0)} stroke={C.border} strokeDasharray="3 4" />
          {chi > 2 && <rect x={X(ps)} y={pad} width={X(1 - ps) - X(ps)} height={Ht - 2 * pad} fill={`${C.err}14`} />}
          <path d={pathOf(fs, X, Y)} fill="none" stroke={C.teal} strokeWidth={2.6} />
          {chi > 2 && <line x1={X(pb)} y1={Y(fMix(pb, chi))} x2={X(1 - pb)} y2={Y(fMix(pb, chi))} stroke={C.amber} strokeWidth={1.8} strokeDasharray="6 4" />}
          {chi > 2 && [pb, 1 - pb].map((p, i) => <circle key={i} cx={X(p)} cy={Y(fMix(p, chi))} r={5} fill={C.amber} />)}
          {chi > 2 && [ps, 1 - ps].map((p, i) => <circle key={i} cx={X(p)} cy={Y(fMix(p, chi))} r={4} fill={C.err} />)}
          <circle cx={X(phi0)} cy={Y(fMix(phi0, chi))} r={6} fill="none" stroke={C.text} strokeWidth={2} />
          {[0, 0.5, 1].map(v => <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
          <text x={W - pad} y={pad} fill={C.amber} fontSize={11} textAnchor="end">{isKo ? "● 바이노달 (공통 접선)" : "● binodal (common tangent)"}</text>
          <text x={W - pad} y={pad + 15} fill={C.err} fontSize={11} textAnchor="end">{isKo ? "● 스피노달 (f″ = 0)" : "● spinodal (f″ = 0)"}</text>
        </svg>
        <svg width={W2} height={Ht} viewBox={`0 0 ${W2} ${Ht}`} style={svgBox(W2)}>
          <Axes W={W2} Ht={Ht} pad={pad} xlabel="φ" ylabel="T / T_c = 2/χ" />
          <path d={pathOf(binC, p2.X, p2.Y)} fill={`${C.amber}12`} stroke={C.amber} strokeWidth={2.4} />
          <path d={pathOf(spiC, p2.X, p2.Y)} fill={`${C.err}18`} stroke={C.err} strokeWidth={2} strokeDasharray="6 4" />
          <line x1={pad} y1={p2.Y(1)} x2={W2 - pad} y2={p2.Y(1)} stroke={C.border} strokeDasharray="3 4" />
          <circle cx={p2.X(phi0)} cy={p2.Y(Math.min(2 / chi, 1.6))} r={6} fill={rc} />
          {[0, 0.5, 1].map(v => <text key={v} x={p2.X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
          {[0.5, 1, 1.5].map(v => <text key={v} x={pad - 6} y={p2.Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
          <text x={p2.X(0.5)} y={p2.Y(1) - 8} fill={C.textDim} fontSize={10} textAnchor="middle">{isKo ? "임계점" : "critical point"}</text>
          <text x={p2.X(0.5)} y={p2.Y(0.45)} fill={C.err} fontSize={11} textAnchor="middle">{isKo ? "불안정" : "unstable"}</text>
          <text x={p2.X(0.12)} y={p2.Y(0.62)} fill={C.amber} fontSize={11} textAnchor="middle">{isKo ? "준안정" : "metastable"}</text>
        </svg>
      </div>
      <StatGrid>
        <Stat label={isKo ? "상태" : "state"} value={region} color={rc} />
        <Stat label="f″(φ₀)" value={fpp.toFixed(3)} color={fpp < 0 ? C.err : C.ok} />
        <Stat label={isKo ? "바이노달 φ" : "binodal φ"} value={chi > 2 ? `${pb.toFixed(4)} / ${(1 - pb).toFixed(4)}` : "—"} color={C.amber} />
        <Stat label={isKo ? "스피노달 φ" : "spinodal φ"} value={chi > 2 ? `${ps.toFixed(4)} / ${(1 - ps).toFixed(4)}` : "—"} color={C.err} />
        <Stat label={isKo ? "φ₀에서 스피노달 χ_s" : "spinodal χ_s at φ₀"} value={(1 / (2 * phi0 * (1 - phi0))).toFixed(3)} color={C.textDim} />
      </StatGrid>
      <Note>
        {isKo
          ? "χ = 2.5에서 바이노달은 0.145, 스피노달은 0.276입니다. φ₀ = 0.2처럼 그 사이에 있으면 혼합물은 국소적으로 안정합니다. 작은 요동은 되돌아오고, 충분히 큰 핵이 생겨야만 분리가 시작됩니다(핵생성과 성장). 스피노달 안쪽에서는 장벽이 없으므로 모든 곳에서 동시에 갈라집니다(스피노달 분해). 다음 탭에서 이 차이를 직접 봅니다."
          : "At χ = 2.5 the binodal is at 0.145 and the spinodal at 0.276. Between them (φ₀ = 0.2, say) the mixture is locally stable: small fluctuations decay, and separation starts only when a large enough nucleus forms (nucleation and growth). Inside the spinodal there is no barrier, and the mixture splits everywhere at once (spinodal decomposition). The next tab shows the difference directly."}
      </Note>
      <HdSub>{isKo ? "κ에서 임계 온도로" : "From κ to the critical temperature"}</HdSub>
      <Row>
        <Slider label={isKo ? "κ (kJ/mol)" : "κ (kJ/mol)"} value={kap} min={0.5} max={15} step={0.1} onChange={setKap} width={180} fmt={v => v.toFixed(1)} />
      </Row>
      <StatGrid>
        <Stat label="T_c = κ/2R" value={`${Tc.toFixed(1)} K`} color={C.accent} />
        <Stat label={isKo ? "298 K에서 χ" : "χ at 298 K"} value={(kap * 1000 / (RGAS * 298.15)).toFixed(3)} color={C.teal} />
        <Stat label={isKo ? "298 K, φ = 0.5" : "298 K, φ = 0.5"} value={kap * 1000 / (RGAS * 298.15) > 2 ? (isKo ? "상분리" : "phase-separated") : (isKo ? "섞임" : "mixed")} color={kap * 1000 / (RGAS * 298.15) > 2 ? C.err : C.ok} />
      </StatGrid>
    </Card>
  );
}

function KawasakiLab({ isKo }) {
  const L = 96, S = 4;
  const [chi, setChi] = useState(4.5);
  const [phi0, setPhi0] = useState(0.5);
  const [running, setRunning] = useState(false);
  const [info, setInfo] = useState({ sweeps: 0, ub: 0 });
  const cvRef = useRef(null), simRef = useRef(null), rafRef = useRef(null), chiRef = useRef(chi);
  chiRef.current = chi;
  const init = ph => {
    const rand = makeRng(2026);
    const s = new Int8Array(L * L);
    for (let i = 0; i < L * L; i++) s[i] = rand() < ph ? 1 : 0;
    simRef.current = { s, rand, sweeps: 0 };
    paint();
  };
  const unlikeAround = (s, i, j, v) => {
    let c = 0;
    if (s[((i + 1) % L) * L + j] !== v) c++;
    if (s[((i - 1 + L) % L) * L + j] !== v) c++;
    if (s[i * L + (j + 1) % L] !== v) c++;
    if (s[i * L + (j - 1 + L) % L] !== v) c++;
    return c;
  };
  const sweep = () => {
    const sim = simRef.current, s = sim.s, rand = sim.rand, de = chiRef.current / 4;
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (let n = 0; n < L * L; n++) {
      const i = Math.floor(rand() * L), j = Math.floor(rand() * L);
      const d = dirs[Math.floor(rand() * 4)];
      const k = (i + d[0] + L) % L, l = (j + d[1] + L) % L;
      const a = i * L + j, b = k * L + l;
      const v1 = s[a], v2 = s[b];
      if (v1 === v2) continue;
      const before = unlikeAround(s, i, j, v1) + unlikeAround(s, k, l, v2);
      s[a] = v2; s[b] = v1;
      const after = unlikeAround(s, i, j, v2) + unlikeAround(s, k, l, v1);
      const dE = (after - before) * de;
      if (dE > 0 && rand() >= Math.exp(-dE)) { s[a] = v1; s[b] = v2; }
    }
    sim.sweeps++;
  };
  const paint = () => {
    const sim = simRef.current, cv = cvRef.current;
    if (!sim) return;
    let ub = 0;
    for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) {
      const v = sim.s[i * L + j];
      if (sim.s[((i + 1) % L) * L + j] !== v) ub++;
      if (sim.s[i * L + (j + 1) % L] !== v) ub++;
    }
    if (cv) {
      const ctx = cv.getContext("2d");
      const img = ctx.createImageData(L * S, L * S);
      for (let y = 0; y < L * S; y++) for (let x = 0; x < L * S; x++) {
        const v = sim.s[Math.floor(y / S) * L + Math.floor(x / S)], o = 4 * (y * L * S + x);
        if (v) { img.data[o] = 129; img.data[o + 1] = 140; img.data[o + 2] = 248; }
        else { img.data[o] = 245; img.data[o + 1] = 158; img.data[o + 2] = 11; }
        img.data[o + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    }
    setInfo({ sweeps: sim.sweeps, ub: ub / (2 * L * L) });
  };
  const loop = () => {
    for (let k = 0; k < 4; k++) sweep();
    paint();
    if (simRef.current.sweeps < 4000) rafRef.current = requestAnimationFrame(loop); else setRunning(false);
  };
  useEffect(() => { init(phi0); return () => cancelAnimationFrame(rafRef.current); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const reset = ph => { cancelAnimationFrame(rafRef.current); setRunning(false); init(ph); };
  const toggle = () => {
    if (running) { cancelAnimationFrame(rafRef.current); setRunning(false); }
    else { setRunning(true); rafRef.current = requestAnimationFrame(loop); }
  };
  const mfRandom = 2 * phi0 * (1 - phi0);
  return (
    <Card>
      <Hd>{isKo ? "실험실: Kawasaki Monte Carlo로 격자 혼합물 풀어 보기" : "Lab: solving the lattice mixture with Kawasaki Monte Carlo"}</Hd>
      <Note>
        {isKo
          ? "평균장 이론을 쓰지 않고 격자 모형을 그대로 풉니다. 96 × 96 정사각 격자(z = 4)에서 이웃한 A와 B를 맞바꾸는 시도를 반복합니다. 조성은 보존됩니다. 바꾼 뒤 서로 다른 이웃 쌍이 늘면 쌍마다 κ/z = χkT/4의 에너지가 들고, Metropolis 규칙 min(1, e^(−ΔE/kT))로 받아들일지 정합니다. 이 규칙을 따르면 시간이 지나며 Boltzmann 분포가 됩니다."
          : "Solve the lattice model as it is, without mean-field theory. On a 96 × 96 square lattice (z = 4), repeatedly try to swap neighboring A and B; the composition is conserved. Each new unlike pair costs κ/z = χkT/4, and the swap is accepted with the Metropolis probability min(1, e^(−ΔE/kT)). Following this rule, the lattice relaxes to the Boltzmann distribution."}
      </Note>
      <Row>
        <Slider label="χ" value={chi} min={0} max={8} step={0.05} onChange={setChi} width={180} fmt={v => v.toFixed(2)} />
        <Slider label="φ₀" value={phi0} min={0.1} max={0.5} step={0.01} onChange={v => { setPhi0(v); reset(v); }} width={140} fmt={v => v.toFixed(2)} />
        <button onClick={toggle} style={btnStyle(running)}>{running ? (isKo ? "일시정지" : "Pause") : (isKo ? "실행" : "Run")}</button>
        <button onClick={() => reset(phi0)} style={btnStyle()}>{isKo ? "무작위로 다시" : "Re-randomize"}</button>
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <canvas ref={cvRef} width={L * S} height={L * S} style={{ width: "100%", maxWidth: 384, height: "auto", borderRadius: 10, border: `1px solid ${C.border}`, imageRendering: "pixelated", flex: "0 1 384px" }} />
        <div style={{ flex: "1 1 280px" }}>
          <StatGrid min={150}>
            <Stat label={isKo ? "스윕 수" : "sweeps"} value={String(info.sweeps)} color={C.textDim} />
            <Stat label={isKo ? "다른 이웃 쌍 비율" : "unlike-pair fraction"} value={info.ub.toFixed(3)} color={C.accent} />
            <Stat label={isKo ? "무작위 혼합 값 2φ(1−φ)" : "random mixing 2φ(1−φ)"} value={mfRandom.toFixed(3)} color={C.amber} />
            <Stat label={isKo ? "평균장 χ_c" : "mean-field χ_c"} value="2.00" color={C.teal} />
            <Stat label={isKo ? "정확한 2D χ_c (Onsager)" : "exact 2D χ_c (Onsager)"} value="3.53" color={C.pink} />
          </StatGrid>
          <Note>
            {isKo
              ? "χ = 2.5로 두고 돌려 보십시오. 평균장 이론은 χ > 2이면 갈라진다고 말하지만, 격자에는 작은 덩어리만 생겼다 사라집니다. 큰 영역이 자라는 것은 χ가 약 3.5를 넘을 때입니다. 이 모형은 Ising 모형과 같고(J = κ/2z), Onsager의 정확해 kT_c = 2.269J를 쓰면 χ_c = 2z/2.269 = 3.53입니다. 평균장 이론은 이웃이 무작위로 섞여 있다고 가정해서, 이미 같은 종끼리 모여 있는 국소 질서를 무시합니다. 그래서 T_c를 1.76배 높게 예측합니다."
              : "Run it at χ = 2.5. Mean-field theory says the mixture splits for χ > 2, but the lattice only shows small clusters that come and go; large domains grow only above χ ≈ 3.5. The model is the Ising model (J = κ/2z), and Onsager's exact kT_c = 2.269J gives χ_c = 2z/2.269 = 3.53. Mean-field theory assumes random neighbors and so ignores the local order already present, overestimating T_c by a factor of 1.76."}
          </Note>
        </div>
      </div>
    </Card>
  );
}

// =============================================================
// 6) CAHN–HILLIARD DYNAMICS
// =============================================================
function fft1(re, im, inv) {                 // in-place radix-2, length power of 2
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (inv ? 2 : -2) * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
        re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
  if (inv) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
}
function fft2(re, im, N, inv) {
  const r = new Float64Array(N), m = new Float64Array(N);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) { r[x] = re[y * N + x]; m[x] = im[y * N + x]; }
    fft1(r, m, inv);
    for (let x = 0; x < N; x++) { re[y * N + x] = r[x]; im[y * N + x] = m[x]; }
  }
  for (let x = 0; x < N; x++) {
    for (let y = 0; y < N; y++) { r[y] = re[y * N + x]; m[y] = im[y * N + x]; }
    fft1(r, m, inv);
    for (let y = 0; y < N; y++) { re[y * N + x] = r[y]; im[y * N + x] = m[y]; }
  }
}

function CahnTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <CHDerivCard isKo={isKo} />
      <StabilityLab isKo={isKo} />
      <CHSimLab isKo={isKo} />
      <CaseCard isKo={isKo} />
    </div>
  );
}

function CHDerivCard({ isKo }) {
  const steps = [
    { eq: "F[φ] = ∫ [ f(φ) + κ|∇φ|² ] dV", ko: "Cahn과 Hilliard(1958)는 균일하지 않은 혼합물의 자유 에너지에 기울기 항을 더했습니다. 조성이 급히 바뀌는 계면에는 에너지가 듭니다. 이 항이 계면 장력과 계면 두께를 줍니다.", en: "Cahn and Hilliard (1958) added a gradient term to the free energy of a non-uniform mixture. A sharp change in composition costs energy; this term gives the interfacial tension and the interface width." },
    { eq: "μ = δF/δφ = f′(φ) − 2κ∇²φ", ko: "범함수 미분이 국소 화학 퍼텐셜(정확히는 교환 화학 퍼텐셜 μ_B − μ_A)입니다.", en: "The functional derivative is the local (exchange) chemical potential μ_B − μ_A." },
    { eq: "∂φ/∂t = −∇·J,   J = −M∇μ   ⇒   ∂φ/∂t = M∇²[f′(φ) − 2κ∇²φ]", ko: "물질은 보존되므로 연속 방정식을 씁니다. 흐름은 농도가 아니라 화학 퍼텐셜의 기울기를 따라갑니다. 그래서 스피노달 안쪽에서는 진한 쪽으로 물질이 흘러가는 오르막 확산(uphill diffusion)이 일어납니다. 유효 확산 계수 D_eff = M f″가 음수이기 때문입니다.", en: "Material is conserved, so a continuity equation applies. The flux follows the gradient of chemical potential, not of concentration. Inside the spinodal this produces uphill diffusion toward the richer region, because the effective diffusivity D_eff = M f″ is negative." },
    { eq: "φ = φ₀ + δφ e^(R t + iq·r)   ⇒   R(q) = −M q² [ f″(φ₀) + 2κ q² ]", ko: "작은 요동을 넣고 선형화합니다. f″ < 0이면 장파장 요동이 자랍니다. 아주 짧은 파장은 기울기 에너지가 막습니다.", en: "Insert a small fluctuation and linearize. When f″ < 0 long-wavelength fluctuations grow; very short wavelengths are suppressed by the gradient energy." },
    { eq: "q_m² = −f″/(4κ),   λ_m = 2π/q_m,   q_th = √2 q_m", ko: "dR/dq = 0에서 가장 빨리 자라는 파수 q_m을 얻습니다. 이 파장이 초기 무늬의 크기를 정합니다. 강의 Part 2의 20쪽에 q_m² = −F₀″/(2κl²)로 적힌 식은 분모가 4κl²이어야 합니다. 14쪽의 q_c = q_th/√2와 맞추어 보면 확인할 수 있습니다.", en: "Setting dR/dq = 0 gives the fastest-growing wavenumber q_m, which fixes the size of the early pattern. On page 20 of lecture Part 2, q_m² = −F₀″/(2κl²) should read 4κl² in the denominator; this agrees with q_c = q_th/√2 on page 14." },
    { eq: "Allen–Cahn:  ∂φ/∂t = −L δF/δφ", ko: "질서 변수가 보존되지 않을 때(결정 방위, 자기화)는 연속 방정식 없이 자유 에너지를 바로 내려갑니다. 영역 크기는 t^(1/2)로 자랍니다. 보존되는 Cahn–Hilliard에서는 물질이 확산으로 먼 거리를 옮겨 가야 하므로 t^(1/3)로 더 느립니다(Lifshitz–Slyozov).", en: "When the order parameter is not conserved (crystal orientation, magnetization), the system descends the free energy directly, with no continuity equation, and domains grow as t^(1/2). In conserved Cahn–Hilliard dynamics material must diffuse over long distances, so growth is slower, t^(1/3) (Lifshitz–Slyozov)." },
  ];
  return (
    <Card>
      <Hd>{isKo ? "Cahn–Hilliard 식 유도하기 (강의 Part 2, 10–20쪽)" : "Deriving the Cahn–Hilliard equation (lecture Part 2, pp. 10–20)"}</Hd>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ minWidth: 28, height: 28, borderRadius: "50%", background: "rgba(244,114,182,0.16)", color: C.pink, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>{i + 1}</div>
          <div style={{ flex: 1 }}>
            <Eq style={{ margin: "0 0 4px" }}>{s.eq}</Eq>
            <Note>{isKo ? s.ko : s.en}</Note>
          </div>
        </div>
      ))}
    </Card>
  );
}

function StabilityLab({ isKo }) {
  const [chi, setChi] = useState(3);
  const [phi0, setPhi0] = useState(0.5);
  const [kap, setKap] = useState(1);
  const fpp = 1 / (phi0 * (1 - phi0)) - 2 * chi;
  const unstable = fpp < 0;
  const qm = unstable ? Math.sqrt(-fpp / (4 * kap)) : 0;
  const Rmax = unstable ? fpp * fpp / (8 * kap) : 0;
  const qth = Math.SQRT2 * qm;
  const qMaxPlot = 1.6;
  const pts = [];
  for (let j = 0; j <= 300; j++) { const q = qMaxPlot * j / 300; pts.push([q, -q * q * (fpp + 2 * kap * q * q)]); }
  const yTop = Math.max(Rmax * 1.25, 0.05), yBot = -Math.max(Rmax * 1.25, 0.05);
  const W = 680, Ht = 280, pad = 52;
  const { X, Y } = plotScale(0, qMaxPlot, yBot, yTop, W, Ht, pad);
  const clip = pts.map(([q, r]) => [q, Math.max(yBot, Math.min(yTop, r))]);
  return (
    <Card>
      <Hd>{isKo ? "실험실: 선형 안정성과 가장 빨리 자라는 파장" : "Lab: linear stability and the fastest-growing wavelength"}</Hd>
      <Row>
        <Slider label="χ" value={chi} min={1} max={5} step={0.01} onChange={setChi} width={160} fmt={v => v.toFixed(2)} />
        <Slider label="φ₀" value={phi0} min={0.05} max={0.95} step={0.005} onChange={setPhi0} width={160} fmt={v => v.toFixed(3)} />
        <Slider label="κ" value={kap} min={0.25} max={4} step={0.05} onChange={setKap} width={140} fmt={v => v.toFixed(2)} />
      </Row>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "파수 q" : "wavenumber q"} ylabel="R(q) / M" />
        <line x1={pad} y1={Y(0)} x2={W - pad} y2={Y(0)} stroke={C.border} />
        <path d={pathOf(clip, X, Y)} fill="none" stroke={C.pink} strokeWidth={2.6} />
        {unstable && <line x1={X(qm)} y1={Y(Rmax)} x2={X(qm)} y2={Y(0)} stroke={C.amber} strokeDasharray="5 4" />}
        {unstable && <circle cx={X(qm)} cy={Y(Rmax)} r={6} fill={C.amber} />}
        {unstable && qth < qMaxPlot && <circle cx={X(qth)} cy={Y(0)} r={5} fill={C.teal} />}
        {unstable && <text x={X(qm) + 8} y={Y(Rmax) - 4} fill={C.amber} fontSize={11}>q_m</text>}
        {unstable && qth < qMaxPlot && <text x={X(qth) + 6} y={Y(0) - 8} fill={C.teal} fontSize={11}>q_th = √2 q_m</text>}
        {[0, 0.4, 0.8, 1.2, 1.6].map(v => <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v.toFixed(1)}</text>)}
      </svg>
      <StatGrid>
        <Stat label="f″(φ₀)" value={fpp.toFixed(3)} color={unstable ? C.err : C.ok} />
        <Stat label="q_m" value={unstable ? qm.toFixed(4) : "—"} color={C.amber} />
        <Stat label={isKo ? "λ_m = 2π/q_m (격자 단위)" : "λ_m = 2π/q_m (lattice units)"} value={unstable ? (2 * Math.PI / qm).toFixed(2) : "—"} color={C.amber} />
        <Stat label="R_max / M = f″²/8κ" value={unstable ? Rmax.toFixed(4) : "—"} color={C.pink} />
        <Stat label="D_eff / M = f″" value={fpp.toFixed(3)} color={fpp < 0 ? C.err : C.ok} />
      </StatGrid>
      <Note>
        {unstable
          ? (isKo
            ? `스피노달 안쪽입니다. 0 < q < q_th인 모든 요동이 자라고, 그중 q_m 근처가 가장 빨리 자랍니다. κ를 4배로 하면 λ_m은 2배가 됩니다(λ_m ∝ κ^(1/2)). 스피노달 경계에 다가가면 f″ → 0이므로 λ_m은 무한히 길어지고 성장은 멈춥니다. χ = 3, φ₀ = 0.5, κ = 1이면 λ_m = 8.89입니다. 아래 시뮬레이션의 초기 무늬와 비교해 보십시오.`
            : `Inside the spinodal. All fluctuations with 0 < q < q_th grow, fastest near q_m. Quadrupling κ doubles λ_m (λ_m ∝ κ^(1/2)). Approaching the spinodal, f″ → 0, so λ_m diverges and growth stops. For χ = 3, φ₀ = 0.5, κ = 1, λ_m = 8.89; compare it with the early pattern in the simulation below.`)
          : (isKo
            ? "f″ > 0이므로 모든 q에서 R < 0입니다. 작은 요동은 모두 사라집니다. 이 조성이 바이노달 안쪽(준안정)이라면 분리는 큰 요동, 곧 핵생성을 통해서만 일어납니다. 선형 이론은 그것을 볼 수 없습니다."
            : "f″ > 0, so R < 0 for every q and every small fluctuation decays. If this composition is inside the binodal (metastable), separation can only happen through a large fluctuation, a nucleus, which linear theory cannot see.")}
      </Note>
    </Card>
  );
}

function CHSimLab({ isKo }) {
  const N = 128, S = 3;
  const [mode, setMode] = useState("ch");
  const [chi, setChi] = useState(3);
  const [phi0, setPhi0] = useState(0.5);
  const [running, setRunning] = useState(false);
  const [info, setInfo] = useState({ t: 0, mean: 0, lo: 0, hi: 0, lam: 0, Ld: 0, hist: [], early: null });
  const cvRef = useRef(null), simRef = useRef(null), rafRef = useRef(null);
  const dt = 0.1;
  const kapOf = md => (md === "ch" ? 1 : 0.5);

  const K2 = useMemo(() => {
    const k = new Float64Array(N);
    for (let i = 0; i < N; i++) k[i] = 2 * Math.PI * (i < N / 2 ? i : i - N) / N;
    const a = new Float64Array(N * N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) a[y * N + x] = k[x] * k[x] + k[y] * k[y];
    return a;
  }, []);

  const init = (md, c, p0) => {
    const rand = makeRng(10), g = gaussFrom(rand);
    const phi = new Float64Array(N * N);
    for (let i = 0; i < N * N; i++) phi[i] = md === "ch" ? p0 + 0.01 * g() : 0.05 * g();
    simRef.current = { phi, t: 0, md, chi: c, phi0: p0, hist: [], early: null };
    paint();
  };
  const step = () => {
    const sim = simRef.current, phi = sim.phi, n2 = N * N;
    const re = new Float64Array(phi), im = new Float64Array(n2);
    const nr = new Float64Array(n2), ni = new Float64Array(n2);
    if (sim.md === "ch") {
      const c = sim.chi, A = 2 * c, kappa = kapOf("ch");
      for (let i = 0; i < n2; i++) { const p = Math.min(1 - 1e-6, Math.max(1e-6, phi[i])); nr[i] = Math.log(p / (1 - p)) + c * (1 - 2 * p); }
      fft2(re, im, N, false); fft2(nr, ni, N, false);
      for (let i = 0; i < n2; i++) {
        const k2 = K2[i], den = 1 + dt * k2 * (A + 2 * kappa * k2);
        re[i] = (re[i] - dt * k2 * (nr[i] - A * re[i])) / den;
        im[i] = (im[i] - dt * k2 * (ni[i] - A * im[i])) / den;
      }
    } else {
      const A = 2, Lc = 1, kappa = kapOf("ac");
      for (let i = 0; i < n2; i++) { const p = phi[i]; nr[i] = p * p * p - p; }
      fft2(re, im, N, false); fft2(nr, ni, N, false);
      for (let i = 0; i < n2; i++) {
        const den = 1 + dt * Lc * (A + 2 * kappa * K2[i]);
        re[i] = (re[i] - dt * Lc * (nr[i] - A * re[i])) / den;
        im[i] = (im[i] - dt * Lc * (ni[i] - A * im[i])) / den;
      }
    }
    fft2(re, im, N, true);
    for (let i = 0; i < n2; i++) phi[i] = re[i];
    sim.t += dt;
  };
  const measure = () => {
    const sim = simRef.current, phi = sim.phi, n2 = N * N;
    let s = 0, lo = Infinity, hi = -Infinity;
    for (let i = 0; i < n2; i++) { s += phi[i]; if (phi[i] < lo) lo = phi[i]; if (phi[i] > hi) hi = phi[i]; }
    const mean = s / n2;
    const thr = sim.md === "ch" ? mean : 0;
    let ib = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const a = phi[y * N + x] > thr;
      if ((phi[y * N + (x + 1) % N] > thr) !== a) ib++;
      if ((phi[((y + 1) % N) * N + x] > thr) !== a) ib++;
    }
    const Ld = ib > 0 ? 2 * n2 / ib : N;
    // radial structure factor peak
    const re = new Float64Array(n2), im = new Float64Array(n2);
    for (let i = 0; i < n2; i++) re[i] = phi[i] - mean;
    fft2(re, im, N, false);
    const nb = N / 2, Sq = new Float64Array(nb), cnt = new Float64Array(nb);
    for (let i = 0; i < n2; i++) {
      const b = Math.round(Math.sqrt(K2[i]) * N / (2 * Math.PI));
      if (b > 0 && b < nb) { Sq[b] += re[i] * re[i] + im[i] * im[i]; cnt[b]++; }
    }
    let bm = 1;
    for (let b = 1; b < nb; b++) { Sq[b] /= Math.max(cnt[b], 1); if (Sq[b] > Sq[bm]) bm = b; }
    return { mean, lo, hi, lam: N / bm, Ld };
  };
  const paint = () => {
    const sim = simRef.current, cv = cvRef.current;
    if (!sim) return;
    const m = measure();
    if (sim.t > 0) { sim.hist.push([sim.t, m.Ld]); if (sim.hist.length > 2000) sim.hist.shift(); }
    if (sim.md === "ch" && sim.early === null && m.hi - m.lo > 0.2) sim.early = { t: sim.t, lam: m.lam };
    if (cv) {
      const ctx = cv.getContext("2d");
      const img = ctx.createImageData(N * S, N * S);
      const [a, b] = sim.md === "ch" ? [0, 1] : [-1, 1];
      for (let y = 0; y < N * S; y++) for (let x = 0; x < N * S; x++) {
        const v = Math.max(0, Math.min(1, (sim.phi[Math.floor(y / S) * N + Math.floor(x / S)] - a) / (b - a)));
        const o = 4 * (y * N * S + x);
        img.data[o] = 15 + v * (245 - 15); img.data[o + 1] = 23 + v * (158 - 23); img.data[o + 2] = 60 + v * (11 - 60) + (1 - Math.abs(2 * v - 1)) * 120; img.data[o + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    }
    setInfo({ t: sim.t, ...m, hist: sim.hist.slice(), early: sim.early });
  };
  const loop = () => {
    for (let k = 0; k < 6; k++) step();
    paint();
    if (simRef.current.t < (simRef.current.md === "ch" ? 1000 : 400)) rafRef.current = requestAnimationFrame(loop); else setRunning(false);
  };
  useEffect(() => { init(mode, chi, phi0); return () => cancelAnimationFrame(rafRef.current); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const reset = (md = mode, c = chi, p0 = phi0) => { cancelAnimationFrame(rafRef.current); setRunning(false); init(md, c, p0); };
  const toggle = () => {
    if (running) { cancelAnimationFrame(rafRef.current); setRunning(false); }
    else { setRunning(true); rafRef.current = requestAnimationFrame(loop); }
  };
  const fpp = 1 / (phi0 * (1 - phi0)) - 2 * chi;
  const lamTh = fpp < 0 ? 2 * Math.PI / Math.sqrt(-fpp / (4 * kapOf("ch"))) : null;
  const pb = binodalPhi(chi);
  const late = info.hist.filter(([t]) => (mode === "ch" ? t >= 40 : t >= 10 && t <= 100));
  const fit = late.length > 8 ? linfit(late.map(a => Math.log(a[0])), late.map(a => Math.log(a[1]))) : null;
  const W = 380, Ht = 260, pad = 48;
  const { X, Y } = plotScale(0, 3, 0, 1.8, W, Ht, pad);
  const lg = info.hist.filter(([t, l]) => t > 1 && l > 0).map(([t, l]) => [Math.log10(t), Math.log10(l)]);
  return (
    <Card>
      <Hd>{isKo ? "실험실: 스피노달 분해와 조대화 시뮬레이션 (128 × 128)" : "Lab: spinodal decomposition and coarsening (128 × 128)"}</Hd>
      <Note>
        {isKo
          ? "주기 경계 상자에서 Fourier 스펙트럼 반암시적(semi-implicit) 방법으로 식을 풉니다. 기울기 항은 Fourier 공간에서 정확히 다루고, 비선형 항은 안정화 상수 A = 2χ와 함께 명시적으로 다룹니다. Cahn–Hilliard에서는 φ가 보존되고, Allen–Cahn에서는 질서 변수 φ ∈ [−1, 1]이 보존되지 않습니다. κ = 1(Allen–Cahn은 0.5), Δt = 0.1입니다."
          : "The equation is solved in a periodic box with a semi-implicit Fourier spectral method: the gradient term is handled exactly in Fourier space and the nonlinear term explicitly, with a stabilizing constant A = 2χ. In Cahn–Hilliard φ is conserved; in Allen–Cahn the order parameter φ ∈ [−1, 1] is not. κ = 1 (0.5 for Allen–Cahn), Δt = 0.1."}
      </Note>
      <Row>
        <button onClick={() => { setMode("ch"); reset("ch"); }} style={btnStyle(mode === "ch")}>{isKo ? "Cahn–Hilliard (보존)" : "Cahn–Hilliard (conserved)"}</button>
        <button onClick={() => { setMode("ac"); reset("ac"); }} style={btnStyle(mode === "ac")}>{isKo ? "Allen–Cahn (비보존)" : "Allen–Cahn (non-conserved)"}</button>
      </Row>
      {mode === "ch" && (
        <Row>
          <Slider label="χ" value={chi} min={2.2} max={4} step={0.05} onChange={v => { setChi(v); reset("ch", v, phi0); }} width={150} fmt={v => v.toFixed(2)} />
          <Slider label="φ₀" value={phi0} min={0.2} max={0.5} step={0.01} onChange={v => { setPhi0(v); reset("ch", chi, v); }} width={150} fmt={v => v.toFixed(2)} />
        </Row>
      )}
      <Row>
        <button onClick={toggle} style={btnStyle(running)}>{running ? (isKo ? "일시정지" : "Pause") : (isKo ? "실행" : "Run")}</button>
        <button onClick={() => reset()} style={btnStyle()}>{isKo ? "처음부터" : "Reset"}</button>
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <canvas ref={cvRef} width={N * S} height={N * S} style={{ width: "100%", maxWidth: 384, height: "auto", borderRadius: 10, border: `1px solid ${C.border}`, flex: "0 1 384px" }} />
        <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={{ ...svgBox(W), maxWidth: W }}>
          <Axes W={W} Ht={Ht} pad={pad} xlabel="log₁₀ t" ylabel={isKo ? "log₁₀ L (영역 크기)" : "log₁₀ L (domain size)"} />
          <path d={pathOf(lg, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.4} />
          {[[1 / 3, C.pink, "t^(1/3)"], [1 / 2, C.teal, "t^(1/2)"]].map(([s, c, lb]) => {
            const y0 = 0.35;
            return <g key={lb}><line x1={X(1)} y1={Y(y0 + s)} x2={X(3)} y2={Y(y0 + 3 * s)} stroke={c} strokeDasharray="5 4" /><text x={X(3) - 4} y={Y(y0 + 3 * s) - 6} fill={c} fontSize={11} textAnchor="end">{lb}</text></g>;
          })}
          {[0, 1, 2, 3].map(v => <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
          {[0, 0.5, 1, 1.5].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        </svg>
      </div>
      <StatGrid min={150}>
        <Stat label={isKo ? "시간 t" : "time t"} value={info.t.toFixed(1)} color={C.textDim} />
        <Stat label={isKo ? "평균 φ" : "mean φ"} value={info.mean.toFixed(5)} color={C.accent} />
        <Stat label={isKo ? "최소 / 최대 φ" : "min / max φ"} value={`${info.lo.toFixed(3)} / ${info.hi.toFixed(3)}`} color={C.amber} />
        {mode === "ch" && <Stat label={isKo ? "바이노달 (평형 조성)" : "binodal (equilibrium)"} value={`${pb.toFixed(3)} / ${(1 - pb).toFixed(3)}`} color={C.amber} />}
        <Stat label={isKo ? "S(q) 최고점 파장" : "S(q) peak wavelength"} value={info.lam.toFixed(2)} color={C.pink} />
        {mode === "ch" && <Stat label={isKo ? "선형 이론 λ_m" : "linear theory λ_m"} value={lamTh ? lamTh.toFixed(2) : (isKo ? "스피노달 밖" : "outside spinodal")} color={C.pink} />}
        {mode === "ch" && <Stat label={isKo ? "초기 무늬 파장 (진폭 0.2일 때)" : "early-pattern wavelength (amplitude 0.2)"} value={info.early ? `${info.early.lam.toFixed(2)} (t = ${info.early.t.toFixed(1)})` : "—"} color={C.pink} />}
        <Stat label={isKo ? (mode === "ch" ? "조대화 지수 (t ≥ 40)" : "조대화 지수 (10 ≤ t ≤ 100)") : (mode === "ch" ? "coarsening exponent (t ≥ 40)" : "coarsening exponent (10 ≤ t ≤ 100)")} value={fit ? fit.slope.toFixed(2) : "—"} color={C.teal} />
      </StatGrid>
      <Note>
        {isKo
          ? "Cahn–Hilliard에서 t ≈ 10 무렵 처음 나타나는 무늬의 파장은 선형 이론의 λ_m과 거의 같습니다(격자가 유한해서 q 간격만큼 차이가 납니다). 그 뒤 두 상의 조성은 바이노달 값 0.071/0.929로 다가가고, 평균 φ는 끝까지 변하지 않습니다. 무늬는 계속 굵어집니다. 계면의 총 면적을 줄여 기울기 에너지를 낮추려는 것입니다. φ₀ = 0.3으로 낮추면 서로 이어진 미로 대신 섬 모양의 방울이 생깁니다. Allen–Cahn으로 바꾸면 평균 φ가 보존되지 않고, 조대화가 더 빠릅니다. 영역 크기 L은 계면 길이로 잰 값(2N²/계면 결합 수)입니다. 주어진 실행 시간 안에서는 지수가 이론값(1/3, 1/2)보다 조금 크거나 작게 나옵니다. Allen–Cahn에서 영역이 상자를 가로지르는 띠 모양이 되면 곡률이 0이라 더 이상 줄지 않습니다. 그래서 지수를 초기 구간(10 ≤ t ≤ 100)에서만 맞춥니다."
          : "In Cahn–Hilliard, the wavelength of the first pattern near t ≈ 10 is close to the linear-theory λ_m (the finite box limits the q spacing). Later the two phase compositions approach the binodal values 0.071/0.929, while the mean φ never changes. The pattern keeps coarsening, reducing the total interface and with it the gradient energy. Lower φ₀ to 0.3 and isolated droplets replace the interconnected maze. Switch to Allen–Cahn: the mean φ is no longer conserved and coarsening is faster. The domain size L is measured from the interface length (2N² / number of interface bonds); within a run of this length the exponents come out a little off the theoretical 1/3 and 1/2. In Allen–Cahn, once a domain becomes a stripe spanning the box its curvature is zero and it stops shrinking, so the exponent is fitted only over the early window 10 ≤ t ≤ 100."}
      </Note>
    </Card>
  );
}

function CaseCard({ isKo }) {
  const cases = [
    { t: isKo ? "Zn–Al 합금 (Zn-15Al-3Cu)" : "Zn–Al alloys (Zn-15Al-3Cu)", c: C.amber, ko: "Zn–Al계는 고온의 고용체를 담금질하면 Zn이 풍부한 상과 Al이 풍부한 상으로 아주 미세하게 갈라집니다. 시효 처리 온도와 시간이 무늬의 크기를 정하고, 무늬의 크기가 기계적 성질을 정합니다.", en: "Quenching the high-temperature Zn–Al solid solution splits it into a very fine mixture of Zn-rich and Al-rich phases. Aging temperature and time set the pattern size, and the pattern size sets the mechanical properties." },
    { t: isKo ? "Al–Cu 합금의 CuAl₂ 석출" : "CuAl₂ precipitation in Al–Cu", c: C.amber, ko: "준안정 영역에서는 핵생성과 성장이 일어납니다. GP 영역에서 θ′을 거쳐 θ(CuAl₂)로 가는 석출이 항공기 두랄루민을 강하게 합니다. 스피노달 분해와의 대조 사례입니다.", en: "In the metastable region separation proceeds by nucleation and growth; the GP zone → θ′ → θ (CuAl₂) sequence hardens aircraft duralumin. The contrast case to spinodal decomposition." },
    { t: isKo ? "P3HT:PCBM 유기 태양전지" : "P3HT:PCBM organic solar cells", c: C.pink, ko: "엑시톤은 약 10 nm만 확산하므로 공여체와 수용체가 그 크기로 서로 얽혀 있어야 합니다. 열처리와 용매 증기 처리로 상분리의 정도를 조절하는 것은 λ_m과 조대화 시간을 고르는 일입니다.", en: "Excitons diffuse only about 10 nm, so donor and acceptor must interpenetrate on that scale. Tuning phase separation by annealing or solvent vapor amounts to choosing λ_m and the coarsening time." },
    { t: isKo ? "지질 소포의 액체 영역 (Veatch & Keller 2003)" : "Liquid domains in lipid vesicles (Veatch & Keller 2003)", c: C.teal, ko: "포화 지질, 불포화 지질, 콜레스테롤의 세 성분 소포가 온도를 내리면 두 액상으로 갈라집니다. 형광 현미경으로 바이노달을 그리고 임계점 근처의 요동까지 보였습니다. 세포막 '래프트' 논의의 출발점입니다.", en: "Ternary vesicles of saturated lipid, unsaturated lipid and cholesterol split into two liquid phases on cooling. Fluorescence microscopy mapped the binodal and even critical fluctuations; a starting point for the membrane 'raft' debate." },
    { t: isKo ? "콜로이드와 액정" : "Colloids and liquid crystals", c: C.sky, ko: "콜로이드는 원자보다 훨씬 크고 느리므로, 콜로이드-고분자 혼합물의 스피노달 분해는 광학 현미경으로 실시간 관찰할 수 있습니다. 액정의 등방-네마틱 전이는 보존되지 않는 질서 변수의 예입니다.", en: "Colloids are far larger and slower than atoms, so spinodal decomposition in colloid–polymer mixtures can be watched in real time under an optical microscope. The isotropic–nematic transition of liquid crystals is an example of a non-conserved order parameter." },
    { t: isKo ? "결정립 성장 (Allen & Cahn 1979)" : "Grain growth (Allen & Cahn 1979)", c: C.lime, ko: "Fe–Al 합금의 반위상 경계(antiphase boundary) 이동을 설명하려고 Allen–Cahn 식이 나왔습니다. 경계는 곡률에 비례해 움직이고 영역 크기는 t^(1/2)로 자랍니다.", en: "The Allen–Cahn equation was introduced to explain antiphase-boundary motion in Fe–Al alloys; boundaries move in proportion to their curvature and domains grow as t^(1/2)." },
  ];
  return (
    <Card>
      <Hd>{isKo ? "사례 연구" : "Case studies"}</Hd>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 12 }}>
        {cases.map((cs, i) => (
          <div key={i} style={{ background: C.card, borderRadius: 10, padding: 14, border: `1px solid ${cs.c}44` }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: cs.c, marginBottom: 6 }}>{cs.t}</div>
            <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.65 }}>{isKo ? cs.ko : cs.en}</div>
          </div>
        ))}
      </div>
      <Note>
        {isKo
          ? "참고문헌: J. W. Cahn & J. E. Hilliard, J. Chem. Phys. 28, 258 (1958); J. W. Cahn, Acta Metall. 9, 795 (1961); S. M. Allen & J. W. Cahn, Acta Metall. 27, 1085 (1979); S. L. Veatch & S. L. Keller, Biophys. J. 85, 3074 (2003)."
          : "References: J. W. Cahn & J. E. Hilliard, J. Chem. Phys. 28, 258 (1958); J. W. Cahn, Acta Metall. 9, 795 (1961); S. M. Allen & J. W. Cahn, Acta Metall. 27, 1085 (1979); S. L. Veatch & S. L. Keller, Biophys. J. 85, 3074 (2003)."}
      </Note>
    </Card>
  );
}

// =============================================================
// 7) PRACTICE
// =============================================================
function Practice({ lang }) {
  const problems = [
    {
      ko: {
        q: "P1. 분자 100개가 두 상태(에너지가 같음)에 나뉘어 있다. (a) 50/50 배치와 60/40 배치의 ln W를 정확히 구하시오. (b) 두 배치가 나타날 확률의 비는? (c) Stirling 근사로 구한 50/50의 ln W와 비교하시오.",
        s: "(a) ln W = ln[100!/(50! 50!)] = 66.78, ln[100!/(60! 40!)] = 64.79. (b) W의 비 = e^(66.78 − 64.79) = e^1.99 = 7.34. 50/50이 7.3배 더 자주 나타납니다. (c) Stirling: ln W ≈ −N Σ pᵢ ln pᵢ = 100 ln 2 = 69.31. N = 100에서는 ½ln(2πN) 정도의 보정이 남아 4% 크게 나옵니다. N = 10²³이면 같은 10% 조성 변화의 확률비는 e^(−2×10²¹) 수준이 됩니다. 거시계에서 가장 가능성 높은 분포만 보이는 이유입니다.",
      },
      en: {
        q: "P1. 100 molecules are divided between two states of equal energy. (a) Compute ln W exactly for the 50/50 and 60/40 arrangements. (b) What is the ratio of their probabilities? (c) Compare ln W for 50/50 with Stirling's approximation.",
        s: "(a) ln W = ln[100!/(50! 50!)] = 66.78 and ln[100!/(60! 40!)] = 64.79. (b) The ratio of W is e^(66.78 − 64.79) = e^1.99 = 7.34, so 50/50 occurs 7.3 times as often. (c) Stirling gives ln W ≈ −N Σ pᵢ ln pᵢ = 100 ln 2 = 69.31, 4% high at N = 100 because of the ½ln(2πN)-type correction. For N = 10²³ the same 10% composition shift has a probability ratio of order e^(−2×10²¹), which is why a macroscopic system shows only the most probable distribution.",
      },
    },
    {
      ko: {
        q: "P2. 바닥 상태보다 1000 cm⁻¹ 위에 있는 준위(비축퇴)의 상대 점유율 N₁/N₀를 298 K와 1000 K에서 구하시오.",
        s: "hcν̃/kT = (6.626×10⁻³⁴ × 2.998×10¹⁰ × 1000)/(1.381×10⁻²³ × 298.15) = 4.83이므로 N₁/N₀ = e^(−4.83) = 0.0080. 1000 K에서는 hcν̃/kT = 1.44, N₁/N₀ = 0.237입니다. 유용한 기억법: 상온에서 kT/hc ≈ 207 cm⁻¹입니다. 그보다 훨씬 높은 진동 준위는 상온에서 거의 비어 있습니다.",
      },
      en: {
        q: "P2. Find the relative population N₁/N₀ of a non-degenerate level 1000 cm⁻¹ above the ground state at 298 K and at 1000 K.",
        s: "hcν̃/kT = (6.626×10⁻³⁴ × 2.998×10¹⁰ × 1000)/(1.381×10⁻²³ × 298.15) = 4.83, so N₁/N₀ = e^(−4.83) = 0.0080. At 1000 K, hcν̃/kT = 1.44 and N₁/N₀ = 0.237. A handy number: kT/hc ≈ 207 cm⁻¹ at room temperature, so vibrational levels far above that are nearly empty.",
      },
    },
    {
      ko: {
        q: "P3. 에너지 0과 ε인 2준위 계 N개가 kT = ε에 있다. 입자당 q, U, S, C_V를 구하시오. 고온 극한에서 S/Nk는?",
        s: "q = 1 + e^(−1) = 1.3679. U/Nε = e^(−1)/q = 0.2689. S/Nk = ln q + U/NkT = 0.3133 + 0.2689 = 0.5822. C_V/Nk = (ε/kT)² e^(−ε/kT)/q² = 0.1966. 고온에서 두 준위가 똑같이 차므로 S/Nk → ln 2 = 0.693입니다. 열용량은 kT = 0.417ε에서 최댓값 0.439k를 갖는 Schottky 봉우리를 그립니다.",
      },
      en: {
        q: "P3. N two-level systems (energies 0 and ε) are at kT = ε. Find q, U, S and C_V per particle. What is S/Nk in the high-temperature limit?",
        s: "q = 1 + e^(−1) = 1.3679. U/Nε = e^(−1)/q = 0.2689. S/Nk = ln q + U/NkT = 0.3133 + 0.2689 = 0.5822. C_V/Nk = (ε/kT)² e^(−ε/kT)/q² = 0.1966. At high temperature both levels are equally filled, so S/Nk → ln 2 = 0.693. The heat capacity traces a Schottky peak with maximum 0.439k at kT = 0.417ε.",
      },
    },
    {
      ko: {
        q: "P4. (a) 정준 앙상블에서 σ_E² = ⟨E²⟩ − ⟨E⟩² = kT²C_V를 보이시오. (b) P3의 계가 N = 10²⁰개일 때 σ_E/⟨E⟩는?",
        s: "(a) ⟨E⟩ = −∂ln Z/∂β이고 ∂⟨E⟩/∂β = −(⟨E²⟩ − ⟨E⟩²)입니다. Z⁻¹ΣE e^(−βE)를 β로 한 번 더 미분하면 나옵니다. dβ = −dT/kT²이므로 C_V = ∂⟨E⟩/∂T = σ_E²/kT². (b) 이항 분포이므로 σ_E² = Nε²p(1 − p), ⟨E⟩ = Npε, p = 0.2689. σ_E/⟨E⟩ = [(1 − p)/(Np)]^½ = 1.6×10⁻¹⁰. 에너지를 열 자리까지 재야 요동이 보입니다.",
      },
      en: {
        q: "P4. (a) Show that σ_E² = ⟨E²⟩ − ⟨E⟩² = kT²C_V in the canonical ensemble. (b) For N = 10²⁰ copies of the system in P3, what is σ_E/⟨E⟩?",
        s: "(a) ⟨E⟩ = −∂ln Z/∂β, and differentiating Z⁻¹ΣE e^(−βE) once more gives ∂⟨E⟩/∂β = −(⟨E²⟩ − ⟨E⟩²). With dβ = −dT/kT², C_V = ∂⟨E⟩/∂T = σ_E²/kT². (b) The distribution is binomial, so σ_E² = Nε²p(1 − p) and ⟨E⟩ = Npε with p = 0.2689; σ_E/⟨E⟩ = [(1 − p)/(Np)]^½ = 1.6×10⁻¹⁰. You would need to measure the energy to ten digits to see the fluctuation.",
      },
    },
    {
      ko: {
        q: "P5. N₂(B_e = 1.998 cm⁻¹, ω_e = 2358.6 cm⁻¹, σ = 2)의 θ_R, θ_V를 구하고, 298.15 K에서 q_R, q_V, 몰당 회전 엔트로피를 구하시오.",
        s: "θ_R = hcB/k = 1.4388 cm K × 1.998 cm⁻¹ = 2.875 K, θ_V = 1.4388 × 2358.6 = 3393 K. q_R = T/(σθ_R) = 298.15/(2 × 2.875) = 51.9, q_V = 1/(1 − e^(−3393/298.15)) = 1.00001. S_rot = R(ln q_R + 1) = 8.314 × (3.949 + 1) = 41.1 J K⁻¹ mol⁻¹. 진동은 상온에서 사실상 얼어 있어 S_vib ≈ 0.001 J K⁻¹ mol⁻¹입니다. 병진 150.4를 더하면 S° = 191.6으로 CODATA의 191.61과 맞습니다.",
      },
      en: {
        q: "P5. For N₂ (B_e = 1.998 cm⁻¹, ω_e = 2358.6 cm⁻¹, σ = 2), find θ_R and θ_V, and at 298.15 K find q_R, q_V and the molar rotational entropy.",
        s: "θ_R = hcB/k = 1.4388 cm K × 1.998 cm⁻¹ = 2.875 K and θ_V = 1.4388 × 2358.6 = 3393 K. q_R = T/(σθ_R) = 298.15/(2 × 2.875) = 51.9 and q_V = 1/(1 − e^(−3393/298.15)) = 1.00001. S_rot = R(ln q_R + 1) = 8.314 × (3.949 + 1) = 41.1 J K⁻¹ mol⁻¹. Vibration is effectively frozen at room temperature, S_vib ≈ 0.001 J K⁻¹ mol⁻¹. Adding the translational 150.4 gives S° = 191.6, matching CODATA's 191.61.",
      },
    },
    {
      ko: {
        q: "P6. O₂의 표준 엔트로피를 계산할 때 (a) 바닥 전자 상태의 축퇴도 g₀ = 3을 빠뜨리면, (b) 대칭수 σ = 2를 빠뜨리면 각각 얼마나 틀리는가? 각 항의 물리적 의미는?",
        s: "(a) S_el = R ln g₀ = R ln 3 = 9.13 J K⁻¹ mol⁻¹만큼 작게 나옵니다. O₂의 바닥 상태 ³Σ_g⁻는 짝짓지 않은 전자 두 개의 스핀 삼중항이라 상태가 3개입니다. O₂가 상자성인 이유와 같습니다. (b) q_R이 2배가 되므로 R ln 2 = 5.76 J K⁻¹ mol⁻¹만큼 크게 나옵니다. 동핵 분자는 180° 돌려도 같은 분자이므로 회전 상태의 절반만 허용됩니다. 두 항은 실험 엔트로피로 검증됩니다. 계산값 205.1은 CODATA 205.15와 맞습니다.",
      },
      en: {
        q: "P6. In computing the standard entropy of O₂, how far off are you if you omit (a) the ground-state degeneracy g₀ = 3, or (b) the symmetry number σ = 2? What does each term mean physically?",
        s: "(a) S comes out low by S_el = R ln 3 = 9.13 J K⁻¹ mol⁻¹. The ³Σ_g⁻ ground state is a spin triplet of two unpaired electrons, three states in all, the same reason O₂ is paramagnetic. (b) q_R doubles, so S comes out high by R ln 2 = 5.76 J K⁻¹ mol⁻¹. A homonuclear molecule rotated by 180° is the same molecule, so only half of the rotational states are allowed. Experiment confirms both terms: the computed 205.1 matches CODATA's 205.15.",
      },
    },
    {
      ko: {
        q: "P7. 흡착 자리 M = 1000개의 Langmuir 표면이 θ = 0.5에 있다. (a) 흡착 분자 수의 표준 편차는? (b) θ = 0.9이면? (c) σ_N² = kT(∂⟨N⟩/∂μ)를 대정준 분배 함수에서 유도하시오.",
        s: "(a) σ_N² = Mθ(1 − θ) = 250, σ_N = 15.8, 상대 요동 3.2%. (b) σ_N² = 90, σ_N = 9.5, 상대 요동 1.1%. (c) ⟨N⟩ = kT ∂ln Ξ/∂μ이고, 한 번 더 미분하면 kT ∂⟨N⟩/∂μ = ⟨N²⟩ − ⟨N⟩²입니다. 에너지 요동이 열용량을 주듯, 입자 수 요동은 흡착 등온식의 기울기를 줍니다. Ξ = (1 + λq)ᴹ에서 ∂θ/∂(βμ) = θ(1 − θ)이므로 결과가 확인됩니다.",
      },
      en: {
        q: "P7. A Langmuir surface with M = 1000 sites is at θ = 0.5. (a) What is the standard deviation of the number adsorbed? (b) And at θ = 0.9? (c) Derive σ_N² = kT(∂⟨N⟩/∂μ) from the grand partition function.",
        s: "(a) σ_N² = Mθ(1 − θ) = 250, σ_N = 15.8, a relative fluctuation of 3.2%. (b) σ_N² = 90, σ_N = 9.5, 1.1%. (c) ⟨N⟩ = kT ∂ln Ξ/∂μ, and one more derivative gives kT ∂⟨N⟩/∂μ = ⟨N²⟩ − ⟨N⟩². Just as energy fluctuations give the heat capacity, number fluctuations give the slope of the isotherm. With Ξ = (1 + λq)ᴹ, ∂θ/∂(βμ) = θ(1 − θ), which confirms the result.",
      },
    },
    {
      ko: {
        q: "P8. 1 bar의 He 기체에 대해 4.2 K와 298.15 K에서 열적 파장 Λ와 nΛ³를 구하시오. 각각 고전 기체로 다뤄도 되는가?",
        s: "Λ = h/(2πmkT)^½, m = 4.0026 u. 4.2 K: Λ = 426 pm, n = p/kT = 1.72×10²⁷ m⁻³, nΛ³ = 0.133. 분자 간 거리 n^(−1/3) = 0.83 nm가 Λ의 2배 정도에 불과하여 양자 효과가 무시할 수 없습니다. 298.15 K: Λ = 50.5 pm, nΛ³ = 3.1×10⁻⁶으로 충분히 고전적입니다. Λ ∝ T^(−1/2), n ∝ 1/T이므로 nΛ³ ∝ T^(−5/2)입니다.",
      },
      en: {
        q: "P8. For helium gas at 1 bar, find the thermal wavelength Λ and nΛ³ at 4.2 K and at 298.15 K. Can it be treated as a classical gas in each case?",
        s: "Λ = h/(2πmkT)^½ with m = 4.0026 u. At 4.2 K: Λ = 426 pm, n = p/kT = 1.72×10²⁷ m⁻³, nΛ³ = 0.133. The spacing n^(−1/3) = 0.83 nm is only about twice Λ, so quantum effects are not negligible. At 298.15 K: Λ = 50.5 pm and nΛ³ = 3.1×10⁻⁶, safely classical. Since Λ ∝ T^(−1/2) and n ∝ 1/T, nΛ³ ∝ T^(−5/2).",
      },
    },
    {
      ko: {
        q: "P9. 정규 용액 모형에서 κ = 5.0 kJ/mol이다. (a) 임계 온도는? (b) 250 K에서 χ, 바이노달 조성, 스피노달 조성을 구하시오. (c) 250 K로 담금질한 φ = 0.30 혼합물은 어떻게 갈라지는가?",
        s: "(a) T_c = κ/2R = 5000/(2 × 8.314) = 300.7 K. (b) χ = κ/RT = 5000/(8.314 × 250) = 2.405. 바이노달은 ln[φ/(1 − φ)] = χ(2φ − 1)의 해 φ = 0.169 (와 0.831). 스피노달 φ = ½[1 − (1 − 2/χ)^½] = 0.295 (와 0.705). (c) φ = 0.30에서 χ_s = 1/(2 × 0.3 × 0.7) = 2.381 < 2.405이므로 스피노달 바로 안쪽입니다. 장벽 없이 스피노달 분해가 일어나지만 f″ = −0.050으로 아주 작아서 λ_m이 길고 성장이 느립니다. 결국 0.169와 0.831의 두 상이 공존합니다(지렛대 규칙으로 0.831 상의 분율은 (0.30 − 0.169)/(0.831 − 0.169) = 0.20).",
      },
      en: {
        q: "P9. In the regular-solution model κ = 5.0 kJ/mol. (a) What is the critical temperature? (b) At 250 K, find χ and the binodal and spinodal compositions. (c) How does a φ = 0.30 mixture quenched to 250 K separate?",
        s: "(a) T_c = κ/2R = 5000/(2 × 8.314) = 300.7 K. (b) χ = κ/RT = 5000/(8.314 × 250) = 2.405. The binodal solves ln[φ/(1 − φ)] = χ(2φ − 1): φ = 0.169 (and 0.831). The spinodal is φ = ½[1 − (1 − 2/χ)^½] = 0.295 (and 0.705). (c) At φ = 0.30, χ_s = 1/(2 × 0.3 × 0.7) = 2.381 < 2.405, just inside the spinodal. Spinodal decomposition proceeds without a barrier, but f″ = −0.050 is tiny, so λ_m is long and growth slow. Eventually phases of 0.169 and 0.831 coexist; by the lever rule the 0.831 phase makes up (0.30 − 0.169)/(0.831 − 0.169) = 0.20 of the system.",
      },
    },
    {
      ko: {
        q: "P10. Cahn–Hilliard 식 ∂φ/∂t = M∇²[f′(φ) − 2κ∇²φ]를 선형화하여 R(q)를 구하고, κ = 1(격자 단위)일 때 (a) χ = 3, φ₀ = 0.5와 (b) χ = 3, φ₀ = 0.35의 λ_m을 구하시오. (c) κ를 4배로 하면?",
        s: "φ = φ₀ + δφ e^(Rt + iq·r)를 넣으면 ∇² → −q²이므로 R = −Mq²[f″(φ₀) + 2κq²]. dR/dq = 0에서 q_m² = −f″/4κ. f″ = 1/[φ₀(1 − φ₀)] − 2χ. (a) f″ = 4 − 6 = −2, q_m = 0.707, λ_m = 2π/q_m = 8.89. (b) f″ = 4.396 − 6 = −1.604, λ_m = 9.92. 스피노달 경계에 가까울수록 무늬가 굵습니다. (c) λ_m ∝ κ^(1/2)이므로 2배, 각각 17.8과 19.8입니다. 강의 Part 2의 20쪽 식은 분모를 2κl²로 적었는데 4κl²가 맞습니다.",
      },
      en: {
        q: "P10. Linearize the Cahn–Hilliard equation ∂φ/∂t = M∇²[f′(φ) − 2κ∇²φ] to find R(q). With κ = 1 (lattice units), find λ_m for (a) χ = 3, φ₀ = 0.5 and (b) χ = 3, φ₀ = 0.35. (c) What happens if κ is quadrupled?",
        s: "Insert φ = φ₀ + δφ e^(Rt + iq·r); ∇² → −q², so R = −Mq²[f″(φ₀) + 2κq²]. Setting dR/dq = 0 gives q_m² = −f″/4κ, with f″ = 1/[φ₀(1 − φ₀)] − 2χ. (a) f″ = 4 − 6 = −2, q_m = 0.707, λ_m = 2π/q_m = 8.89. (b) f″ = 4.396 − 6 = −1.604, λ_m = 9.92; the closer to the spinodal, the coarser the pattern. (c) λ_m ∝ κ^(1/2), so it doubles, to 17.8 and 19.8. The formula on page 20 of lecture Part 2 has 2κl² in the denominator; it should be 4κl².",
      },
    },
    {
      ko: {
        q: "P11. (a) 시간을 8배로 늘리면 Cahn–Hilliard 영역과 Allen–Cahn 영역의 크기는 각각 몇 배가 되는가? (b) 2차원 정사각 격자에서 평균장 이론은 χ_c = 2, 정확해는 χ_c = 3.53이다. 평균장 이론은 T_c를 몇 배로 예측하며 왜 틀리는가?",
        s: "(a) CH: L ∝ t^(1/3)이므로 8^(1/3) = 2배. AC: L ∝ t^(1/2)이므로 8^(1/2) = 2.83배. 보존계는 물질이 확산으로 먼 거리를 옮겨야 하므로 느립니다. (b) T_c ∝ 1/χ_c이므로 3.53/2 = 1.76배 높게 예측합니다. 평균장 이론은 이웃이 무작위로 섞여 있다고 가정해 이미 생긴 국소 질서(같은 종끼리 모임)를 무시합니다. 국소 질서가 에너지를 미리 낮추므로 장거리 상분리에 필요한 '추가 이득'이 줄어 실제 T_c는 더 낮습니다. 차원이 높고 이웃 수 z가 클수록 평균장 이론이 정확해집니다.",
      },
      en: {
        q: "P11. (a) If time increases eightfold, by what factor do Cahn–Hilliard and Allen–Cahn domains grow? (b) On a 2D square lattice mean-field theory gives χ_c = 2 while the exact answer is χ_c = 3.53. By what factor does mean-field theory overestimate T_c, and why?",
        s: "(a) CH: L ∝ t^(1/3), so 8^(1/3) = 2 times. AC: L ∝ t^(1/2), so 8^(1/2) = 2.83 times. The conserved system is slower because material must diffuse over long distances. (b) T_c ∝ 1/χ_c, so mean-field theory is high by 3.53/2 = 1.76. It assumes randomly mixed neighbors and ignores the local order (like species clustering) that is already present. That local order lowers the energy in advance, leaving less to gain from long-range separation, so the true T_c is lower. Mean-field theory improves in higher dimensions and with more neighbors z.",
      },
    },
  ];
  const [open, setOpen] = useState({});
  const isKo = lang === "ko";
  return (
    <div>
      <Card>
        <Hd>{isKo ? "연습문제 11제" : "Eleven practice problems"}</Hd>
        <Note>
          {isKo
            ? "풀이를 열기 전에 스스로 풀어 보십시오. P1–P4는 Boltzmann 분포와 정준 앙상블, P5–P6은 분자 분배 함수, P7–P8은 대정준 앙상블과 고전 극한, P9–P11은 격자 혼합 모형과 Cahn–Hilliard 동역학입니다. 모든 수치는 Raw 코드 탭의 Python·C++ 코드로 검산했습니다."
            : "Attempt each before opening the solution. P1–P4 cover the Boltzmann distribution and the canonical ensemble, P5–P6 molecular partition functions, P7–P8 the grand canonical ensemble and the classical limit, and P9–P11 the lattice mixture and Cahn–Hilliard dynamics. Every number was checked with the Python and C++ codes in the Raw Codes tab."}
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
  boltzmann_exchange: {
    ko: "W 세기·Stirling·에너지 교환 게임", en: "Counting W · Stirling · energy-exchange game",
    codes: { python: PY_BOLTZ, matlab: ML_BOLTZ, julia: JL_BOLTZ, cpp: CPP_BOLTZ },
  },
  partition_thermo: {
    ko: "분배 함수·요동·이원자 엔트로피·Langmuir", en: "Partition functions · fluctuations · diatomic entropy · Langmuir",
    codes: { python: PY_PART, matlab: ML_PART, julia: JL_PART, cpp: CPP_PART },
  },
  lattice_mixing: {
    ko: "격자 혼합 모형·바이노달·Kawasaki MC", en: "Lattice mixing · binodal · Kawasaki MC",
    codes: { python: PY_MIX, matlab: ML_MIX, julia: JL_MIX, cpp: CPP_MIX },
  },
  cahn_hilliard: {
    ko: "Cahn–Hilliard·Allen–Cahn·조대화", en: "Cahn–Hilliard · Allen–Cahn · coarsening",
    codes: { python: PY_CH, matlab: ML_CH, julia: JL_CH, cpp: CPP_CH },
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
  const [topic, setTopic] = useState("boltzmann_exchange");
  const [cl, setCl] = useState("python");
  const [copied, setCopied] = useState(false);
  const code = CODE_TOPICS[topic].codes[cl];
  const fname = `wk10_${topic}.${LANG_META[cl].ext}`;

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
            ? "이 페이지의 인터랙티브 뒤에 있는 계산을 직접 실행해 볼 수 있는 독립 코드입니다. Python과 C++은 실행해 확인한 값입니다: Stirling 상대 오차 0.14(N = 10)에서 6×10⁻⁷(N = 10⁶)까지 감소, 에너지 교환 게임의 기울기 βε = 0.407(이론 0.405), Schottky 봉우리 C_max = 0.4392k(kT = 0.4168ε), 요동으로 구한 C_V가 미분값과 10⁻⁶ 안에서 일치, 298.15 K 표준 엔트로피 N₂ 191.6·O₂ 205.1·CO 197.6·HCl 186.7·I₂ 260.5 J K⁻¹ mol⁻¹(CODATA와 0.3 이내), Langmuir kT∂N/∂μ = Mθ(1 − θ), χ = 2.5의 바이노달 0.1448·스피노달 0.2764, Cahn–Hilliard 초기 파장 9.1(이론 8.89), 평형 조성 0.068/0.932(바이노달 0.071/0.929), 조대화 지수 CH 0.36·AC 0.43. MATLAB과 Julia 판은 같은 알고리즘을 옮긴 것입니다(Julia는 SpecialFunctions, FFTW 패키지 필요)."
            : "Standalone codes for the calculations behind every interactive on this page. The Python and C++ versions were run and give: Stirling relative error falling from 0.14 (N = 10) to 6×10⁻⁷ (N = 10⁶); exchange-game slope βε = 0.407 (theory 0.405); Schottky peak C_max = 0.4392k at kT = 0.4168ε; C_V from fluctuations agrees with the derivative to 10⁻⁶; standard entropies at 298.15 K of N₂ 191.6, O₂ 205.1, CO 197.6, HCl 186.7 and I₂ 260.5 J K⁻¹ mol⁻¹ (within 0.3 of CODATA); Langmuir kT∂N/∂μ = Mθ(1 − θ); binodal 0.1448 and spinodal 0.2764 at χ = 2.5; Cahn–Hilliard early wavelength 9.1 (theory 8.89); equilibrium compositions 0.068/0.932 (binodal 0.071/0.929); coarsening exponents CH 0.36 and AC 0.43. The MATLAB and Julia versions port the same algorithms (Julia needs the SpecialFunctions and FFTW packages)."}
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
