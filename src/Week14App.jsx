// ============================================================
// Week14App.jsx — Bonding in Solids, Adsorption & Surface Catalysis
// Physical Chemistry 2 (물리화학 2)
// SKKU School of Chemical Engineering
// Smart Process & Materials Design Lab (SPMDL)
// Prof. S. Joon Kwon
// ------------------------------------------------------------
// Topics covered (Wk14 Parts 1–3):
//   • Close packing (hcp, ccp), packing densities, ionic solids,
//     Madelung constant, Born–Mayer lattice energy, bulk modulus
//   • Hückel / tight-binding: from molecular orbitals to bands,
//     Fermi–Dirac statistics, metals, semiconductors, insulators
//   • Collision flux at surfaces, physisorption vs chemisorption,
//     Langmuir isotherm, isosteric enthalpy, surface techniques
//   • BET, Freundlich, Temkin isotherms, precursor state, TPD,
//     residence time and surface diffusion
//   • Heterogeneous catalysis: unimolecular, Langmuir–Hinshelwood,
//     Eley–Rideal, Sabatier principle, volcano plot, d-band centre
// ============================================================
import { useState, useMemo } from "react";
import {
  PY_BOND, ML_BOND, JL_BOND, CPP_BOND,
  PY_HUCKEL, ML_HUCKEL, JL_HUCKEL, CPP_HUCKEL,
  PY_ISO, ML_ISO, JL_ISO, CPP_ISO,
  PY_KIN, ML_KIN, JL_KIN, CPP_KIN,
} from "./Week14Codes";

// ── i18n ─────────────────────────────────────────────────────
const i18n = {
  ko: {
    weekTitle: "Week 14 — 고체의 결합, 표면 흡착과 불균일 촉매",
    subtitle: "조밀 쌓임 · Madelung 상수 · 격자 에너지 · Hückel에서 띠로 · 충돌 선속 · Langmuir·BET 등온선 · TPD · 표면 확산 · Langmuir–Hinshelwood · Sabatier 화산 그래프",
    tabs: {
      overview: "개요",
      solids: "결정의 쌓임과 이온 결합",
      bands: "Hückel에서 띠로",
      adsorb: "표면 충돌과 Langmuir 흡착",
      isotherm: "BET·실제 표면·탈착 속도",
      catalysis: "불균일 촉매",
      practice: "연습문제",
      codes: "Raw 코드",
    },
  },
  en: {
    weekTitle: "Week 14 — Bonding in Solids, Adsorption & Heterogeneous Catalysis",
    subtitle: "Close packing · Madelung constant · lattice energy · Hückel to bands · collision flux · Langmuir and BET isotherms · TPD · surface diffusion · Langmuir–Hinshelwood · Sabatier volcano",
    tabs: {
      overview: "Overview",
      solids: "Packing & Ionic Bonding",
      bands: "From Hückel to Bands",
      adsorb: "Surface Collisions & Langmuir",
      isotherm: "BET, Real Surfaces & Desorption",
      catalysis: "Heterogeneous Catalysis",
      practice: "Practice",
      codes: "Raw Codes",
    },
  },
};

// ── design tokens (Week 14 accent: cyan) ───────────────
const C = {
  bg: "#0b0f17",
  panel: "#111827",
  card: "#1f2937",
  border: "#374151",
  text: "#e5e7eb",
  textDim: "#9ca3af",
  accent: "#22d3ee",
  accentSoft: "#67e8f9",
  amber: "#f59e0b",
  sky: "#38bdf8",
  blueSoft: "#60a5fa",
  ok: "#10b981",
  err: "#ef4444",
  purple: "#c084fc",
  teal: "#2dd4bf",
  pink: "#f472b6",
  lime: "#a3e635",
  orange: "#fb923c",
};
// physical constants (SI)
const KB = 1.380649e-23, NA = 6.02214076e23, RG = 8.314462618, AMU = 1.66053907e-27;
const KB_EV = 8.617333e-5, EC = 1.602176634e-19, EPS0 = 8.8541878128e-12;

// =============================================================
// MAIN COMPONENT
// =============================================================
export default function Week14App({ onBack, lang: langProp, onLangChange }) {
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
        {tab === "overview" && <Overview lang={lang} go={setTab} />}
        {tab === "solids" && <SolidsTab lang={lang} />}
        {tab === "bands" && <BandsTab lang={lang} />}
        {tab === "adsorb" && <AdsorbTab lang={lang} />}
        {tab === "isotherm" && <IsothermTab lang={lang} />}
        {tab === "catalysis" && <CatalysisTab lang={lang} />}
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
    background: active ? "rgba(34,211,238,0.16)" : "transparent",
    color: active ? C.accentSoft : C.textDim,
    border: `1px solid ${active ? "rgba(34,211,238,0.45)" : "transparent"}`,
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
function Overview({ lang, go }) {
  const isKo = lang === "ko";
  const riddles = [
    {
      tag: "Q1", color: C.accent, tab: "solids",
      ko: "소금 결정 속 Na⁺ 하나는 가까운 Cl⁻에 끌리지만, 조금 더 먼 Na⁺에는 밀린다. 이런 끌림과 밀림을 결정 끝까지 더하면 얼마가 남을까? 그 값이 NaCl을 녹이는 데 801 °C가 필요한 이유다.",
      en: "An Na⁺ ion in rock salt is attracted by nearby Cl⁻ but repelled by the Na⁺ just beyond. If we add up all these attractions and repulsions to the edge of the crystal, what is left? That number is why NaCl needs 801 °C to melt.",
      hint: { ko: "모든 이온의 쿨롱 에너지를 더한다 → 결정의 쌓임과 이온 결합", en: "Sum the Coulomb energy of every ion → Packing & Ionic Bonding" },
    },
    {
      tag: "Q2", color: C.lime, tab: "bands",
      ko: "에틸렌의 π 오비탈은 두 개, 벤젠은 여섯 개다. 원자가 10²³개인 구리 조각에는 오비탈이 10²³개 생긴다. 띄엄띄엄하던 에너지 준위는 언제 '띠'가 되고, 왜 어떤 고체는 전기를 통하고 어떤 고체는 통하지 않을까?",
      en: "Ethene has two π orbitals and benzene six; a piece of copper with 10²³ atoms has 10²³ of them. When do discrete levels merge into a band, and why do some solids conduct while others do not?",
      hint: { ko: "H = αI + βA의 고유값을 N에 따라 본다 → Hückel에서 띠로", en: "Watch the eigenvalues of H = αI + βA as N grows → From Hückel to Bands" },
    },
    {
      tag: "Q3", color: C.amber, tab: "adsorb",
      ko: "1기압 공기 속에서 갓 깎은 금속 표면의 원자 하나는 1초에 약 3억 번 기체 분자에 얻어맞는다. 그렇다면 '깨끗한 표면'은 몇 초나 깨끗할까? 표면 과학자들은 왜 10⁻¹⁰ Torr의 초고진공이 필요할까?",
      en: "In air at 1 atm, each atom of a freshly cut metal surface is hit about 300 million times a second by gas molecules. How long does a 'clean surface' stay clean, and why do surface scientists need an ultra-high vacuum of 10⁻¹⁰ Torr?",
      hint: { ko: "Maxwell–Boltzmann 분포에서 충돌 선속을 구한다 → 표면 충돌과 Langmuir 흡착", en: "Collision flux from the Maxwell–Boltzmann distribution → Surface Collisions & Langmuir" },
    },
    {
      tag: "Q4", color: C.pink, tab: "catalysis",
      ko: "암모니아 합성에는 Fe·Ru가 좋고, Au는 거의 반응하지 않으며, W 위에서는 질소가 너무 단단히 붙어 반응이 멈춘다. 촉매는 반응물을 '적당히' 붙잡아야 한다는데, 그 '적당히'는 무엇으로 정해질까?",
      en: "Fe and Ru are good catalysts for ammonia synthesis, Au hardly reacts, and on W nitrogen binds so strongly that the reaction stops. A catalyst must hold reactants 'just right', but what sets 'just right'?",
      hint: { ko: "흡착 에너지에 대한 화산 그래프와 d-띠 중심 → 불균일 촉매", en: "The volcano plot against adsorption energy and the d-band centre → Heterogeneous Catalysis" },
    },
  ];
  return (
    <div>
      <Card>
        <Hd>{isKo ? "이번 주의 질문" : "This week's questions"}</Hd>
        <Note>
          {isKo
            ? "13주차에 결정의 '모양'(격자와 대칭)을 배웠다면, 이번 주에는 무엇이 그 모양을 붙들고 있는지 묻습니다. 먼저 공을 가장 빽빽하게 쌓는 방법(hcp와 ccp)에서 출발해, 이온 결정의 쿨롱 에너지를 결정 전체에 걸쳐 더하는 Madelung 상수와 Born–Mayer 격자 에너지를 유도합니다. 이어서 Hückel 모형으로 원자 N개의 오비탈이 띠로 바뀌는 과정을 따라가며 금속·반도체·절연체를 구분합니다. 후반부에서는 결정이 끝나는 곳, 곧 표면으로 갑니다. 기체 분자가 표면을 때리는 빈도에서 시작해 Langmuir·BET 등온선, 탈착 속도와 표면 확산, 그리고 화학공학의 핵심인 불균일 촉매(Langmuir–Hinshelwood, Eley–Rideal, Sabatier 원리)까지 하나의 이야기로 잇습니다. 전극 표면의 전기 이중층과 Butler–Volmer 식은 15주차에 다룹니다."
            : "Week 13 taught the shape of crystals (lattices and symmetry); this week asks what holds that shape together. Starting from the densest way to stack spheres (hcp and ccp), we derive the Madelung constant, which sums the Coulomb energy of an ionic crystal over the whole lattice, and the Born–Mayer lattice energy. With the Hückel model we then follow how the orbitals of N atoms turn into bands and sort solids into metals, semiconductors and insulators. In the second half we go where the crystal ends: the surface. From the rate at which gas molecules hit a surface we build one story through the Langmuir and BET isotherms, desorption rates and surface diffusion, to heterogeneous catalysis, the heart of chemical engineering (Langmuir–Hinshelwood, Eley–Rideal, the Sabatier principle). The electrical double layer and the Butler–Volmer equation at electrode surfaces are covered in Week 15."}
        </Note>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 12, marginTop: 10 }}>
          {riddles.map(r => (
            <div key={r.tag} style={{ background: C.card, border: `1px solid ${r.color}66`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 800, color: r.color }}>{r.tag}</div>
              <div style={{ fontSize: 14.5, lineHeight: 1.7, margin: "6px 0 10px" }}>{isKo ? r.ko : r.en}</div>
              <button onClick={() => go && go(r.tab)} style={{ ...btnStyle(), fontSize: 12, padding: "6px 12px" }}>
                {isKo ? r.hint.ko : r.hint.en}
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Hd>{isKo ? "강의 지도" : "Lecture map"}</Hd>
        <LectureMap isKo={isKo} />
      </Card>

      <Card>
        <Hd>{isKo ? "이번 주의 핵심 수치" : "Key numbers this week"}</Hd>
        <Note>{isKo ? "모두 이 페이지의 계산기나 Raw 코드로 다시 확인할 수 있습니다." : "Each can be reproduced with a calculator on this page or with the Raw Codes."}</Note>
        <StatGrid min={250}>
          <Stat label={isKo ? "조밀 쌓임(FCC/HCP) 충전율" : "Close-packed (FCC/HCP) packing fraction"} value="π/√18 = 0.7405" color={C.accent} />
          <Stat label={isKo ? "Madelung 상수 NaCl / CsCl / ZnS" : "Madelung constant NaCl / CsCl / ZnS"} value="1.7476 / 1.7627 / 1.6381" color={C.accent} />
          <Stat label={isKo ? "NaCl 격자 에너지 Born–Mayer / Born–Haber" : "NaCl lattice energy Born–Mayer / Born–Haber"} value="756 / 787 kJ mol⁻¹" color={C.accent} />
          <Stat label={isKo ? "N원자 사슬의 띠 너비 (N → ∞)" : "Band width of an N-atom chain (N → ∞)"} value="4|β|" color={C.lime} />
          <Stat label={isKo ? "N₂ 충돌 선속 (1 bar, 298 K)" : "N₂ collision flux (1 bar, 298 K)"} value="2.9×10²⁷ m⁻² s⁻¹" color={C.amber} />
          <Stat label={isKo ? "CO/숯 Langmuir V∞, K (273 K)" : "CO on charcoal: Langmuir V∞, K (273 K)"} value="111 cm³, 7.5×10⁻³ kPa⁻¹" color={C.amber} />
          <Stat label={isKo ? "등량 흡착 엔탈피 (CO/숯)" : "Isosteric enthalpy (CO on charcoal)"} value="−7.5 kJ mol⁻¹" color={C.amber} />
          <Stat label={isKo ? "N₂/루타일 BET c, V_mon (75 K)" : "N₂ on rutile: BET c, V_mon (75 K)"} value="≈ 300, ≈ 810 mm³" color={C.teal} />
          <Stat label={isKo ? "표면 확산 길이 300 K / 500 K" : "Surface diffusion length 300 K / 500 K"} value="2.4 µm / 50 nm" color={C.teal} />
          <Stat label={isKo ? "Langmuir–Hinshelwood 속도 최대 조건" : "Langmuir–Hinshelwood rate maximum"} value="K_A p_A = 1 + K_B p_B" color={C.pink} />
        </StatGrid>
        <Note>
          {isKo
            ? "출처: 강의 예제(CO/숯, N₂/루타일, 등량 엔탈피)는 P. Atkins, J. de Paula, Atkins' Physical Chemistry, 10th ed. (Oxford University Press, 2014), Topic 22의 예제 자료. Born–Haber 격자 엔탈피는 표준 열화학 표(CRC Handbook of Chemistry and Physics 등)의 값. Langmuir 등온선은 I. Langmuir, J. Am. Chem. Soc. 40, 1361 (1918). BET 등온선은 S. Brunauer, P. H. Emmett, E. Teller, J. Am. Chem. Soc. 60, 309 (1938)."
            : "Sources: the lecture examples (CO on charcoal, N₂ on rutile, isosteric enthalpy) are the worked-example data of P. Atkins, J. de Paula, Atkins' Physical Chemistry, 10th ed. (Oxford University Press, 2014), Topic 22. Born–Haber lattice enthalpies are standard thermochemical table values (e.g. the CRC Handbook of Chemistry and Physics). The Langmuir isotherm is I. Langmuir, J. Am. Chem. Soc. 40, 1361 (1918); the BET isotherm is S. Brunauer, P. H. Emmett, E. Teller, J. Am. Chem. Soc. 60, 309 (1938)."}
        </Note>
      </Card>
    </div>
  );
}

function LectureMap({ isKo }) {
  const p1 = isKo
    ? [["조밀 쌓임", "ABAB(hcp)와 ABCABC(ccp), 충전율 0.7405, 무작위 쌓임 0.64"], ["이온 결정", "반지름 비, Madelung 상수, Born–Mayer 식, 체적 탄성률"], ["Hückel에서 띠로", "H = αI + βA, E_k = α + 2β cos(kπ/(N + 1)), 띠 너비 4|β|"], ["전기적 성질", "Fermi–Dirac 분포, 금속·반도체·절연체, 초전도"]]
    : [["Close packing", "ABAB (hcp) and ABCABC (ccp), packing 0.7405, random packing 0.64"], ["Ionic solids", "radius ratio, Madelung constant, Born–Mayer equation, bulk modulus"], ["Hückel to bands", "H = αI + βA, E_k = α + 2β cos(kπ/(N + 1)), band width 4|β|"], ["Electrical properties", "Fermi–Dirac distribution, metals, semiconductors, insulators, superconductors"]];
  const p2 = isKo
    ? [["표면 충돌", "J = p/√(2πmk_BT), 단일층이 덮이는 시간"], ["흡착 등온선", "Langmuir, 해리 흡착, 등량 엔탈피, BET, Freundlich, Temkin"], ["흡착·탈착 속도", "전구체 상태, 부착 확률, TPD, 체류 시간, 표면 확산"]]
    : [["Surface collisions", "J = p/√(2πmk_BT), time to form a monolayer"], ["Adsorption isotherms", "Langmuir, dissociative adsorption, isosteric enthalpy, BET, Freundlich, Temkin"], ["Rates of adsorption and desorption", "precursor state, sticking probability, TPD, residence time, surface diffusion"]];
  const p3 = isKo
    ? [["반응 메커니즘", "단분자, Langmuir–Hinshelwood, Eley–Rideal"], ["촉매 활성", "Sabatier 원리, 화산 그래프, d-띠 중심 이론"], ["공정 사례", "Haber–Bosch, 3원 촉매, CVD, 플라즈마 촉매"]]
    : [["Mechanisms", "unimolecular, Langmuir–Hinshelwood, Eley–Rideal"], ["Catalytic activity", "Sabatier principle, volcano plot, d-band centre theory"], ["Process cases", "Haber–Bosch, three-way catalysts, CVD, plasma catalysis"]];
  const col = (title, items, color) => (
    <div style={{ flex: "1 1 300px" }}>
      <div style={{ fontWeight: 800, color, marginBottom: 8 }}>{title}</div>
      {items.map(([h, d], i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 12, border: `2px solid ${color}`, color, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{i + 1}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{h}</div>
            <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6 }}>{d}</div>
          </div>
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      {col(isKo ? "Part 1 · 고체의 결합" : "Part 1 · Bonding in solids", p1, C.accent)}
      {col(isKo ? "Part 2 · 고체 표면의 과정" : "Part 2 · Processes at solid surfaces", p2, C.amber)}
      {col(isKo ? "Part 3 · 불균일 촉매" : "Part 3 · Heterogeneous catalysis", p3, C.pink)}
    </div>
  );
}

// =============================================================
// 2) PACKING & IONIC BONDING
// =============================================================
function SolidsTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <ClosePackCard isKo={isKo} />
      <StackLab isKo={isKo} />
      <PackingTableCard isKo={isKo} />
      <RadiusRatioLab isKo={isKo} />
      <MadelungDerivCard isKo={isKo} />
      <MadelungLab isKo={isKo} />
      <BornMayerLab isKo={isKo} />
      <ModuliCard isKo={isKo} />
    </div>
  );
}

function ClosePackCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "같은 공을 가장 빽빽하게 쌓는 두 가지 방법" : "Two ways to stack identical spheres as densely as possible"}</Hd>
      <Note>
        {isKo
          ? "금속 원자처럼 방향성이 없는 결합은 '이웃을 최대한 많이' 두려고 합니다. 평면 위에서는 공 하나를 여섯 개가 둘러싸는 육각 배열(층 A)이 가장 빽빽합니다. 층 A 위에는 움푹 팬 자리가 두 종류(B, C) 있고, 두 번째 층은 그중 한 종류(B)에만 앉을 수 있습니다. 갈림길은 세 번째 층입니다. 첫 층 바로 위(A)에 앉으면 ABAB…, 곧 육방 조밀 쌓임(hcp)이 되고, 아직 쓰지 않은 자리(C)에 앉으면 ABCABC…, 곧 입방 조밀 쌓임(ccp)이 됩니다. ccp는 13주차의 FCC 격자와 같은 구조이고, 층은 FCC의 (111) 면입니다."
          : "Non-directional bonding, as in metals, tries to have as many neighbours as possible. In a plane the densest arrangement is the hexagonal layer (layer A) in which each sphere touches six others. On top of layer A there are two kinds of hollows (B and C), and the second layer can occupy only one kind (B). The choice comes at the third layer. Sitting directly above the first layer (A) gives ABAB…, hexagonal close packing (hcp); using the unused hollows (C) gives ABCABC…, cubic close packing (ccp). ccp is the same structure as the FCC lattice of Week 13, and its layers are the FCC (111) planes."}
      </Note>
      <HdSub>{isKo ? "ccp(FCC)의 충전율 유도" : "Packing fraction of ccp (FCC)"}</HdSub>
      <Eq>{isKo ? "입방 세포 안 원자 수:  8 × ⅛ (꼭짓점) + 6 × ½ (면) = 4" : "Atoms per cubic cell:  8 × ⅛ (corners) + 6 × ½ (faces) = 4"}</Eq>
      <Eq>{isKo ? "면 대각선에서 공이 닿음:" : "Spheres touch along the face diagonal:"}  4r = √2 a   →   a = 2√2 r</Eq>
      <Eq>φ = 4 × (4/3)πr³ / a³ = (16/3)πr³ / (16√2 r³) = π/(3√2) = π/√18 = 0.7405</Eq>
      <Note>
        {isKo
          ? "hcp도 원자마다 이웃이 12개이고 충전율도 똑같이 0.7405입니다. 두 구조는 둘째 이웃부터 다릅니다. 실제 금속은 둘 중 하나를 고르는데(Mg·Zn·Ti는 hcp, Cu·Al·Ni·Au는 ccp), 그 차이는 결합 에너지의 1% 미만입니다. 쌓임 순서가 한 번 어긋난 곳(…ABCAB|ABC…)을 '적층 결함'이라 하며, 합금의 강도와 연성을 좌우합니다."
          : "hcp also gives every atom 12 neighbours and the same packing fraction 0.7405; the two differ only from the second neighbours on. Real metals pick one or the other (Mg, Zn, Ti are hcp; Cu, Al, Ni, Au are ccp), and the energy difference is below 1% of the bonding energy. A place where the stacking sequence slips (…ABCAB|ABC…) is a stacking fault, which governs the strength and ductility of alloys."}
      </Note>
    </Card>
  );
}

function StackLab({ isKo }) {
  const [seq, setSeq] = useState(["A", "B", "C"]);
  const add = L => { if (seq.length < 12 && L !== seq[seq.length - 1]) setSeq([...seq, L]); };
  const reset = s => setSeq(s);
  // classify
  let hcp = true, ccp = true;
  for (let i = 2; i < seq.length; i++) {
    if (seq[i] !== seq[i - 2]) hcp = false;
    if (seq[i] === seq[i - 2]) ccp = false;
  }
  const kind = seq.length < 3 ? (isKo ? "층이 셋 이상 필요" : "need three or more layers")
    : hcp ? "hcp (ABAB…)" : ccp ? "ccp = FCC (ABCABC…)" : (isKo ? "혼합 쌓임 (적층 결함 포함)" : "mixed stacking (contains stacking faults)");
  // hexagonal positions
  const W = 420, Ht = 300, s = 46;
  const off = { A: [0, 0], B: [s / 2, s / (2 * Math.sqrt(3))], C: [s, s / Math.sqrt(3)] };
  const col = { A: C.accent, B: C.amber, C: C.pink };
  const pts = L => {
    const out = [];
    for (let i = -8; i < 12; i++) for (let j = -2; j < 10; j++) {
      const x = 40 + i * s + j * s / 2 + off[L][0], y = 30 + j * s * Math.sqrt(3) / 2 + off[L][1];
      if (x > 10 && x < W - 10 && y > 10 && y < Ht - 10) out.push([x, y]);
    }
    return out;
  };
  const shown = seq.slice(-3);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ① 층을 직접 쌓아 hcp와 ccp 만들기" : "Lab ① Stack the layers yourself to build hcp and ccp"}</Hd>
      <Row>
        {["A", "B", "C"].map(L => (
          <button key={L} onClick={() => add(L)} style={{ ...btnStyle(), borderColor: col[L], color: col[L] }}>
            {isKo ? `${L} 층 올리기` : `add layer ${L}`}
          </button>
        ))}
        <button onClick={() => reset(["A", "B", "A", "B"])} style={btnStyle()}>ABAB</button>
        <button onClick={() => reset(["A", "B", "C", "A", "B", "C"])} style={btnStyle()}>ABCABC</button>
        <button onClick={() => reset(["A", "B", "C", "A", "B", "A", "B", "C"])} style={btnStyle()}>{isKo ? "적층 결함" : "stacking fault"}</button>
        <button onClick={() => reset(["A"])} style={btnStyle()}>{isKo ? "처음부터" : "restart"}</button>
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <svg viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          {shown.map((L, k) => pts(L).map(([x, y], i) => (
            k === 0
              ? <circle key={`${k}-${i}`} cx={x} cy={y} r={s / 2 - 1} fill={col[L]} fillOpacity={0.14} stroke={col[L]} strokeWidth={1} />
              : <circle key={`${k}-${i}`} cx={x} cy={y} r={k === 1 ? s * 0.22 : s * 0.13} fill={col[L]} fillOpacity={0.9} stroke="#0d1117" strokeWidth={1} />
          )))}
          <rect x={0} y={Ht - 26} width={W} height={26} fill="#0d1117" />
          <text x={12} y={Ht - 10} fill={C.textDim} fontSize={11}>{isKo ? "위에서 본 마지막 세 층: 큰 원 = 맨 아래, 중간 점 = 가운데, 작은 점 = 맨 위" : "top view of the last three layers: large circles = bottom, medium dots = middle, small dots = top"}</text>
        </svg>
        <div style={{ flex: "1 1 260px" }}>
          <div style={{ display: "flex", flexDirection: "column-reverse", gap: 4 }}>
            {seq.map((L, i) => (
              <div key={i} style={{ height: 18, borderRadius: 6, background: `${col[L]}33`, border: `1px solid ${col[L]}`, color: col[L], fontSize: 11, fontWeight: 700, paddingLeft: 8, fontFamily: mono }}>
                {isKo ? `층 ${i + 1}: ${L}` : `layer ${i + 1}: ${L}`}
              </div>
            ))}
          </div>
          <StatGrid min={200}>
            <Stat label={isKo ? "쌓임 순서" : "Stacking sequence"} value={seq.join("")} color={C.accent} />
            <Stat label={isKo ? "판정" : "Verdict"} value={kind} color={hcp || ccp ? C.ok : C.amber} />
          </StatGrid>
        </div>
      </div>
      <Note>
        {isKo
          ? "같은 글자를 연달아 쌓을 수는 없습니다(공이 바로 위에 얹혀 빈틈이 커집니다). 그래서 매 층마다 선택지는 두 개뿐이고, 두 층 전의 글자와 같으면 hcp형, 다르면 ccp형 쌓임입니다. 'ABCAB|ABC' 같은 섞인 순서는 FCC 결정 안의 적층 결함이며, 그 경계는 국소적으로 hcp처럼 보입니다."
          : "The same letter cannot be stacked twice in a row (a sphere would sit right on top of another and open a large gap), so each new layer has only two options: repeating the letter from two layers below gives hcp-type stacking, using the third letter gives ccp-type stacking. A mixed sequence such as 'ABCAB|ABC' is a stacking fault inside an FCC crystal, and locally it looks like hcp."}
      </Note>
    </Card>
  );
}

function PackingTableCard({ isKo }) {
  const rows = isKo ? [
    ["입방 조밀(FCC) · hcp", "0.7405", "이웃 12개; 같은 공으로 가능한 최대값(Kepler 추측, Hales 증명)"],
    ["체심 입방(BCC)", "0.680", "이웃 8개 + 조금 먼 6개; Fe·W·Na"],
    ["단순 입방(SC)", "0.524", "이웃 6개; Po만 해당"],
    ["다이아몬드", "0.340", "이웃 4개; 공유 결합의 방향성이 빈 공간을 남김"],
    ["무작위 조밀 쌓임 (MRJ)", "≈ 0.64", "가장 무작위한 '꽉 끼인' 상태; 국소적으로는 유리, 장거리로는 초균일"],
    ["타원체 (종횡비 약 √3)", "0.7707", "이웃 14개; 공보다 더 빽빽하게 쌓일 수 있음 (2004)"],
    ["초구(superball)", "≈ 0.77", "|x|^(2p) + |y|^(2p) + |z|^(2p) ≤ 1 (2009)"],
    ["정사면체", "0.8555–0.8563", "준결정·이중 격자 쌓임 (2009–2010)"],
  ] : [
    ["Cubic close (FCC) · hcp", "0.7405", "12 neighbours; the maximum for identical spheres (Kepler conjecture, proved by Hales)"],
    ["Body-centred cubic (BCC)", "0.680", "8 neighbours plus 6 slightly farther; Fe, W, Na"],
    ["Simple cubic (SC)", "0.524", "6 neighbours; only Po"],
    ["Diamond", "0.340", "4 neighbours; directional covalent bonds leave empty space"],
    ["Random close packing (MRJ)", "≈ 0.64", "the most random jammed state; glassy locally, hyperuniform at long range"],
    ["Ellipsoids (aspect ratio about √3)", "0.7707", "14 neighbours; denser than spheres (2004)"],
    ["Superballs", "≈ 0.77", "|x|^(2p) + |y|^(2p) + |z|^(2p) ≤ 1 (2009)"],
    ["Regular tetrahedra", "0.8555–0.8563", "quasicrystal and double-lattice packings (2009–2010)"],
  ];
  return (
    <Card>
      <Hd>{isKo ? "충전율 표: 공에서 모양이 다른 입자까지" : "Packing fractions: from spheres to other shapes"}</Hd>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
          <thead><tr>{(isKo ? ["쌓임", "충전율 φ", "비고"] : ["Packing", "Fraction φ", "Notes"]).map(h => (
            <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: `1px solid ${C.border}`, color: C.accentSoft }}>{h}</th>))}</tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => (
              <td key={j} style={{ padding: "7px 10px", borderBottom: `1px solid ${C.border}55`, fontFamily: j === 1 ? mono : undefined, color: j === 1 ? C.accent : C.text }}>{c}</td>))}</tr>
          ))}</tbody>
        </table>
      </div>
      <Note>
        {isKo
          ? "왜 화학공학자가 충전율을 알아야 할까요? 충전층 반응기와 흡착탑의 공극률(1 − φ)은 압력 강하(Ergun 식)와 체류 시간을 정합니다. 구형 촉매 펠릿을 무작위로 채우면 공극률이 약 0.36–0.40이 되고, 분말 성형과 소결, 콘크리트의 골재 배합, 배터리 전극의 활물질 밀도도 같은 질문입니다. 모양을 바꾸면(타원체, 사면체) 공보다 더 빽빽하게 쌓을 수 있다는 사실은 입자 설계로 밀도를 높일 수 있음을 뜻합니다."
          : "Why should a chemical engineer care? The void fraction (1 − φ) of packed-bed reactors and adsorption columns sets the pressure drop (Ergun equation) and the residence time. Random packing of spherical catalyst pellets gives a voidage of about 0.36–0.40, and powder compaction and sintering, aggregate grading in concrete and the active-material density of battery electrodes ask the same question. That non-spherical shapes (ellipsoids, tetrahedra) can pack denser than spheres means density can be raised by particle design."}
      </Note>
      <Note>
        {isKo
          ? "출처: 무작위 조밀 쌓임은 S. Torquato, T. M. Truskett, P. G. Debenedetti, Phys. Rev. Lett. 84, 2064 (2000). 타원체는 A. Donev, F. H. Stillinger, P. M. Chaikin, S. Torquato, Phys. Rev. Lett. 92, 255506 (2004). 초구는 Y. Jiao, F. H. Stillinger, S. Torquato, Phys. Rev. E 79, 041309 (2009). 정사면체는 A. Haji-Akbari et al., Nature 462, 773 (2009)과 E. R. Chen, M. Engel, S. C. Glotzer, Discrete Comput. Geom. 44, 253 (2010)."
          : "Sources: random close packing, S. Torquato, T. M. Truskett, P. G. Debenedetti, Phys. Rev. Lett. 84, 2064 (2000); ellipsoids, A. Donev, F. H. Stillinger, P. M. Chaikin, S. Torquato, Phys. Rev. Lett. 92, 255506 (2004); superballs, Y. Jiao, F. H. Stillinger, S. Torquato, Phys. Rev. E 79, 041309 (2009); tetrahedra, A. Haji-Akbari et al., Nature 462, 773 (2009) and E. R. Chen, M. Engel, S. C. Glotzer, Discrete Comput. Geom. 44, 253 (2010)."}
      </Note>
    </Card>
  );
}

const ION_R = {   // Shannon radii, pm (CN 6 unless noted)
  "Li⁺": 76, "Na⁺": 102, "K⁺": 138, "Rb⁺": 152, "Cs⁺": 167, "Mg²⁺": 72, "Ca²⁺": 100, "Zn²⁺": 74,
  "F⁻": 133, "Cl⁻": 181, "Br⁻": 196, "I⁻": 220, "O²⁻": 140, "S²⁻": 184,
};
function RadiusRatioLab({ isKo }) {
  const [cat, setCat] = useState("Na⁺");
  const [an, setAn] = useState("Cl⁻");
  const rc = ION_R[cat], ra = ION_R[an];
  const g = Math.min(rc, ra) / Math.max(rc, ra);
  const pred = g >= 0.732 ? ["CsCl", 8] : g >= 0.414 ? (isKo ? ["암염 NaCl", 6] : ["rock salt NaCl", 6]) : g >= 0.225 ? (isKo ? ["섬아연석 ZnS", 4] : ["zinc blende ZnS", 4]) : (isKo ? ["배위수 3 이하", 3] : ["CN ≤ 3", 3]);
  const W = 560, Ht = 70, pad = 20;
  const X = v => pad + (W - 2 * pad) * v;
  const zones = [[0, 0.225, "≤3"], [0.225, 0.414, "4"], [0.414, 0.732, "6"], [0.732, 1, "8"]];
  return (
    <Card>
      <Hd>{isKo ? "실험실 ② 반지름 비로 이온 결정의 구조 예측하기" : "Lab ② Predicting ionic structures from the radius ratio"}</Hd>
      <Note>
        {isKo
          ? "작은 이온이 큰 이온 사이의 틈에 들어갈 때, 반대 전하끼리는 닿아 있고 같은 전하끼리는 서로 떨어져 있어야 안정합니다. 작은 이온 둘레에 큰 이온을 몇 개 두를 수 있는지는 기하학으로 정해집니다. 예를 들어 정팔면체(배위수 6)에서 큰 이온 넷이 한 평면에서 서로 닿으려면 2(r₊ + r₋) = √2 × 2r₋, 곧 γ = r₊/r₋ = √2 − 1 = 0.414가 하한입니다. 같은 방법으로 정육면체(배위수 8)의 하한은 √3 − 1 = 0.732, 정사면체(배위수 4)는 √(3/2) − 1 = 0.225입니다."
          : "When a small ion sits in the gap between large ions, the structure is stable if opposite charges touch while like charges stay apart. Geometry decides how many large ions fit around a small one. In an octahedron (coordination 6), for four large ions in one plane to touch each other, 2(r₊ + r₋) = √2 × 2r₋, so γ = r₊/r₋ = √2 − 1 = 0.414 is the lower limit. In the same way the cube (coordination 8) needs √3 − 1 = 0.732 and the tetrahedron (coordination 4) √(3/2) − 1 = 0.225."}
      </Note>
      <Row>
        <label style={{ fontSize: 13, color: C.textDim }}>{isKo ? "양이온" : "Cation"}{" "}
          <select value={cat} onChange={e => setCat(e.target.value)} style={{ background: C.card, color: C.text, border: `1px solid ${C.border}`, borderRadius: 6, padding: 4 }}>
            {Object.keys(ION_R).filter(k => k.includes("⁺")).map(k => <option key={k}>{k}</option>)}
          </select></label>
        <label style={{ fontSize: 13, color: C.textDim }}>{isKo ? "음이온" : "Anion"}{" "}
          <select value={an} onChange={e => setAn(e.target.value)} style={{ background: C.card, color: C.text, border: `1px solid ${C.border}`, borderRadius: 6, padding: 4 }}>
            {Object.keys(ION_R).filter(k => k.includes("⁻")).map(k => <option key={k}>{k}</option>)}
          </select></label>
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        {zones.map(([a, b, l], i) => (
          <g key={i}>
            <rect x={X(a)} y={14} width={X(b) - X(a)} height={22} fill={[C.purple, C.lime, C.accent, C.amber][i]} fillOpacity={0.25} />
            <text x={(X(a) + X(b)) / 2} y={30} fill={C.text} fontSize={11} textAnchor="middle">{isKo ? `배위수 ${l}` : `CN ${l}`}</text>
          </g>
        ))}
        {[0.225, 0.414, 0.732].map(v => <text key={v} x={X(v)} y={52} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        <line x1={X(g)} x2={X(g)} y1={8} y2={42} stroke="#fde047" strokeWidth={3} />
        <text x={X(g)} y={66} fill="#fde047" fontSize={11} textAnchor="middle">γ = {g.toFixed(3)}</text>
      </svg>
      <StatGrid>
        <Stat label="r₊, r₋ (pm)" value={`${rc}, ${ra}`} color={C.accent} />
        <Stat label={isKo ? "반지름 비 γ (작은/큰)" : "Radius ratio γ (small/large)"} value={g.toFixed(3)} color={C.accent} />
        <Stat label={isKo ? "예측 구조 (배위수)" : "Predicted structure (CN)"} value={`${pred[0]} (${pred[1]})`} color={C.ok} />
      </StatGrid>
      <Note>
        {isKo
          ? "규칙이 잘 맞는 경우: CsCl(γ = 0.92 → 배위수 8), NaCl(0.56 → 6), ZnS(0.40 → 4에 가까움). 맞지 않는 경우도 많습니다. KCl(γ = 0.76)과 RbCl은 규칙으로는 CsCl형이어야 하지만 실제로는 암염형이고, LiI(0.35)도 암염형입니다. 이온은 단단한 공이 아니고, 결합에 공유성이 섞이며, 두 구조의 에너지 차이가 작기 때문입니다. 반지름 비는 첫 짐작일 뿐이고, 최종 판정은 다음 카드의 격자 에너지 계산이 합니다. (반지름: R. D. Shannon, Acta Cryst. A32, 751 (1976), 배위수 6 값)"
          : "Where the rule works: CsCl (γ = 0.92 → CN 8), NaCl (0.56 → 6), ZnS (0.40 → close to 4). It also fails often: KCl (γ = 0.76) and RbCl should be CsCl-type by the rule but are rock salt, and so is LiI (0.35). Ions are not hard spheres, bonds have some covalent character, and the energy difference between structures is small. The radius ratio is only a first guess; the lattice-energy calculation in the next cards makes the final call. (Radii: R. D. Shannon, Acta Cryst. A32, 751 (1976), coordination-6 values)"}
      </Note>
    </Card>
  );
}

function MadelungDerivCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "Madelung 상수: 결정 전체의 쿨롱 에너지를 숫자 하나로" : "The Madelung constant: the Coulomb energy of the whole crystal in one number"}</Hd>
      <Note>
        {isKo
          ? "이온 하나(전하 z₊e)를 골라 나머지 모든 이온과의 쿨롱 에너지를 더해 봅시다. 이온 j까지의 거리를 가장 가까운 거리 d의 배수 r_j = p_j d로 쓰면, 합은 d와 무관한 순수한 기하학적 수와 1/d의 곱으로 갈라집니다."
          : "Pick one ion (charge z₊e) and add its Coulomb energy with every other ion. Writing the distance to ion j as a multiple of the nearest-neighbour distance d, r_j = p_j d, the sum splits into 1/d times a pure geometric number that does not depend on d."}
      </Note>
      <Eq>U_coul = Σ_j z_i z_j e²/(4πε₀ r_j) = −(|z₊z₋| e²/4πε₀d) × A,   A = −Σ_j (z_j/z_i)/(|z₋| p_j) {isKo ? "(부호 붙은 거리 역수의 합)" : "(signed sum of inverse distances)"}</Eq>
      <HdSub>{isKo ? "1차원 연습: +−+−… 사슬" : "1D warm-up: the +−+−… chain"}</HdSub>
      <Eq>A = 2(1 − 1/2 + 1/3 − 1/4 + …) = 2 ln 2 = 1.386</Eq>
      <Note>
        {isKo
          ? "양쪽에 이웃이 있으므로 2가 곱해지고, 반대 전하(거리 1, 3, 5…)는 +, 같은 전하(2, 4, 6…)는 −입니다. 이 급수는 ln(1 + x)의 x = 1 값입니다. 3차원 NaCl에서는 이웃 껍질이 6개(거리 1, Cl⁻), 12개(√2, Na⁺), 8개(√3, Cl⁻), 6개(2, Na⁺)…로 이어집니다."
          : "The factor 2 counts neighbours on both sides; opposite charges (distances 1, 3, 5, …) enter with +, like charges (2, 4, 6, …) with −. The series is ln(1 + x) at x = 1. In 3D NaCl the shells are 6 (distance 1, Cl⁻), 12 (√2, Na⁺), 8 (√3, Cl⁻), 6 (2, Na⁺), …"}
      </Note>
      <Eq>A_NaCl = 6/1 − 12/√2 + 8/√3 − 6/2 + 24/√5 − …  =  1.74756</Eq>
      <Note>
        {isKo
          ? "그런데 이 껍질 합은 6 → −2.49 → 2.13 → −0.87 → 9.86 …처럼 요동만 칠 뿐 수렴하지 않습니다. 껍질마다 이온 수가 거리의 제곱으로 늘어 1/r의 감소를 상쇄하기 때문입니다(조건 수렴). 해결책은 '전기적으로 중성인 덩어리'씩 더하는 것입니다. Evjen은 정육면체 경계에 걸친 이온을 면에서는 ½, 모서리에서는 ¼, 꼭짓점에서는 ⅛만 세어 매 단계의 덩어리를 중성으로 만들었고, 그러면 합이 빠르게 수렴합니다. 더 일반적인 방법은 합을 실공간과 역공간(13주차) 두 부분으로 나누는 Ewald 합입니다."
          : "But this shell sum only oscillates (6 → −2.49 → 2.13 → −0.87 → 9.86 …) and never converges: the number of ions per shell grows as distance squared, cancelling the 1/r decay (conditional convergence). The cure is to add electrically neutral chunks. Evjen counted ions on the faces of a cube with weight ½, on edges ¼ and on corners ⅛, making each chunk neutral, and the sum then converges quickly. The general method is the Ewald sum, which splits the sum into a real-space part and a reciprocal-space part (Week 13)."}
      </Note>
    </Card>
  );
}

function evjenNaCl(n) {
  let s = 0;
  for (let x = -n; x <= n; x++) for (let y = -n; y <= n; y++) for (let z = -n; z <= n; z++) {
    if (!x && !y && !z) continue;
    let w = 1;
    if (Math.abs(x) === n) w *= 0.5;
    if (Math.abs(y) === n) w *= 0.5;
    if (Math.abs(z) === n) w *= 0.5;
    const q = (Math.abs(x) + Math.abs(y) + Math.abs(z)) % 2 ? -1 : 1;
    s += -q * w / Math.sqrt(x * x + y * y + z * z);
  }
  return s;
}
function sphereNaCl(R) {
  let s = 0;
  const n = Math.ceil(R);
  for (let x = -n; x <= n; x++) for (let y = -n; y <= n; y++) for (let z = -n; z <= n; z++) {
    const r2 = x * x + y * y + z * z;
    if (!r2 || r2 > R * R + 1e-9) continue;
    const q = (Math.abs(x) + Math.abs(y) + Math.abs(z)) % 2 ? -1 : 1;
    s += -q / Math.sqrt(r2);
  }
  return s;
}
function MadelungLab({ isKo }) {
  const [nmax, setNmax] = useState(8);
  const data = useMemo(() => {
    const ev = [], sp = [];
    for (let n = 1; n <= 10; n++) { ev.push([n, evjenNaCl(n)]); sp.push([n, sphereNaCl(n)]); }
    return { ev, sp };
  }, []);
  const W = 620, Ht = 280, pad = 50;
  const { X, Y } = plotScale(0.5, 10.5, -4, 10, W, Ht, pad);
  const cl = v => Math.max(-4, Math.min(10, v));
  const evN = data.ev[nmax - 1][1], spN = data.sp[nmax - 1][1];
  return (
    <Card>
      <Hd>{isKo ? "실험실 ③ 구 모양으로 더할까, 중성 정육면체로 더할까" : "Lab ③ Summing in spheres or in neutral cubes"}</Hd>
      <Row>
        <Slider label={isKo ? "반지름·반변 n" : "Radius / half-edge n"} value={nmax} min={1} max={10} step={1} onChange={setNmax} fmt={v => v.toFixed(0)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "n (가장 가까운 거리 단위)" : "n (units of the nearest-neighbour distance)"} ylabel={isKo ? "부분합 A(n)" : "partial sum A(n)"} />
        {[-4, -2, 0, 2, 4, 6, 8, 10].map(v => <text key={v} x={pad - 8} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        {[2, 4, 6, 8, 10].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        <line x1={pad} x2={W - pad} y1={Y(1.74756)} y2={Y(1.74756)} stroke={C.ok} strokeDasharray="5 4" />
        <text x={W - pad} y={Y(1.74756) - 6} fill={C.ok} fontSize={11} textAnchor="end">1.74756</text>
        <path d={pathOf(data.sp.slice(0, nmax).map(([x, y]) => [x, cl(y)]), X, Y)} fill="none" stroke={C.pink} strokeWidth={1.6} />
        <path d={pathOf(data.ev.slice(0, nmax), X, Y)} fill="none" stroke={C.accent} strokeWidth={2.2} />
        {data.sp.slice(0, nmax).map(([x, y], i) => <circle key={"s" + i} cx={X(x)} cy={Y(cl(y))} r={3.5} fill={C.pink} />)}
        {data.ev.slice(0, nmax).map(([x, y], i) => <circle key={"e" + i} cx={X(x)} cy={Y(y)} r={3.5} fill={C.accent} />)}
        <text x={pad + 130} y={pad - 14} fill={C.pink} fontSize={11}>{isKo ? "● 반지름 n인 구 안의 이온만" : "● ions inside a sphere of radius n"}</text>
        <text x={pad + 360} y={pad - 14} fill={C.accent} fontSize={11}>{isKo ? "● Evjen 중성 정육면체" : "● Evjen neutral cube"}</text>
      </svg>
      <StatGrid>
        <Stat label={isKo ? `구 합 (n = ${nmax})` : `sphere sum (n = ${nmax})`} value={spN.toFixed(4)} color={C.pink} />
        <Stat label={isKo ? `Evjen 합 (n = ${nmax})` : `Evjen sum (n = ${nmax})`} value={evN.toFixed(6)} color={C.accent} />
        <Stat label={isKo ? "정확한 값 (Ewald)" : "Exact value (Ewald)"} value="1.747565" color={C.ok} />
      </StatGrid>
      <Note>
        {isKo
          ? "구 합은 경계에 어떤 이온이 걸리는지에 따라 크게 출렁입니다. 경계에 양전하가 몰리느냐 음전하가 몰리느냐가 1/r보다 빨리 줄지 않는 '표면 전하' 기여를 만들기 때문입니다. Evjen 합은 n = 2에서 이미 0.2% 이내, n = 8에서 소수 다섯째 자리까지 맞습니다. Raw 코드 탭의 Ewald 합은 CsCl(1.762675)과 섬아연석(1.638055)도 같은 방식으로 계산합니다. CsCl은 정육면체 Evjen 합이 잘못된 값으로 가므로 Ewald 합이 필요합니다."
          : "The sphere sum swings wildly depending on which ions happen to sit on the boundary: an excess of positive or negative charge at the surface makes a contribution that does not fall faster than 1/r. The Evjen sum is within 0.2% at n = 2 and good to five decimals at n = 8. The Ewald sum in the Raw Codes tab gets CsCl (1.762675) and zinc blende (1.638055) the same way; for CsCl the cubic Evjen sum goes to a wrong value, so Ewald is needed."}
      </Note>
    </Card>
  );
}

const SALTS = {
  NaF: { A: 1.747565, d: 231.5, bh: 923 },
  NaCl: { A: 1.747565, d: 282.0, bh: 787 },
  KCl: { A: 1.747565, d: 314.5, bh: 715 },
  KBr: { A: 1.747565, d: 329.9, bh: 682 },
  CsCl: { A: 1.762675, d: 356.8, bh: 659 },
  MgO: { A: 1.747565, d: 210.6, bh: 3795, z: 2 },
};
function BornMayerLab({ isKo }) {
  const [salt, setSalt] = useState("NaCl");
  const [rho, setRho] = useState(34.5);
  const s = SALTS[salt];
  const z = s.z || 1;
  const kc = NA * EC * EC / (4 * Math.PI * EPS0) * 1e-3 * 1e12;   // kJ/mol pm
  const d = s.d;
  const U0 = -kc * z * z * s.A / d * (1 - rho / d);              // kJ/mol (negative)
  // B chosen so that the minimum sits at d: B e^{-d/rho} = kc z² A rho / d²
  const Bexp = kc * z * z * s.A * rho / (d * d);                  // = B e^{-d/rho}
  const Ur = r => -kc * z * z * s.A / r + Bexp * Math.exp(-(r - d) / rho);
  const pts = [];
  for (let r = 0.6 * d; r <= 2.2 * d; r += d / 200) pts.push([r, Ur(r)]);
  const W = 620, Ht = 300, pad = 54;
  const ymin = 1.25 * U0, ymax = -0.15 * U0;
  const { X, Y } = plotScale(0.6 * d, 2.2 * d, ymin, ymax, W, Ht, pad);
  const coul = pts.map(([r]) => [r, Math.max(ymin, -kc * z * z * s.A / r)]);
  const rep = pts.map(([r]) => [r, Math.min(ymax, Bexp * Math.exp(-(r - d) / rho))]);
  const clip = pts.map(([r, u]) => [r, Math.min(ymax, Math.max(ymin, u))]);
  // bulk modulus (rock-salt geometry, V = 2 r³ per ion pair)
  const ke2 = EC * EC / (4 * Math.PI * EPS0);
  const U2 = z * z * s.A * ke2 / Math.pow(d * 1e-12, 3) * (d / rho - 2);
  const K = salt === "CsCl" ? null : U2 / (18 * d * 1e-12) / 1e9;
  return (
    <Card>
      <Hd>{isKo ? "실험실 ④ Born–Mayer 퍼텐셜: 끌림과 밀림의 줄다리기" : "Lab ④ The Born–Mayer potential: a tug of war between attraction and repulsion"}</Hd>
      <Note>
        {isKo
          ? "쿨롱 끌림만 있다면 이온은 한 점으로 무너집니다. 전자 구름이 겹치기 시작하면 Pauli 원리 때문에 강한 반발이 생기는데, Born과 Mayer는 이를 지수 함수 B e^(−r/ρ)로 나타냈습니다. ρ는 반발이 얼마나 '딱딱한지'를 나타내는 길이로, 결정의 압축률에서 정해지며 많은 알칼리 할로젠화물에서 약 34.5 pm입니다."
          : "With Coulomb attraction alone, the ions would collapse to a point. When the electron clouds begin to overlap, the Pauli principle produces a strong repulsion, which Born and Mayer wrote as an exponential B e^(−r/ρ). The length ρ measures how 'hard' the repulsion is; it is fixed by the compressibility of the crystal and is about 34.5 pm for many alkali halides."}
      </Note>
      <Eq>U(r) = −N_A A |z₊z₋| e²/(4πε₀ r) + N_A B e^(−r/ρ)</Eq>
      <Eq>dU/dr |_d = 0   →   N_A B e^(−d/ρ) = N_A A |z₊z₋| e² ρ/(4πε₀ d²)</Eq>
      <Eq>U(d) = −(N_A A |z₊z₋| e²/4πε₀ d)(1 − ρ/d)   {isKo ? "(Born–Mayer 식, ρ = d*)" : "(Born–Mayer equation, ρ = d*)"}</Eq>
      <Row>
        {Object.keys(SALTS).map(k => <button key={k} onClick={() => setSalt(k)} style={btnStyle(salt === k)}>{k}</button>)}
        <Slider label="ρ = d*" value={rho} min={20} max={50} step={0.5} onChange={setRho} unit=" pm" fmt={v => v.toFixed(1)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "이온 간 거리 r (pm)" : "interionic distance r (pm)"} ylabel="U (kJ mol⁻¹)" />
        <line x1={pad} x2={W - pad} y1={Y(0)} y2={Y(0)} stroke="#475569" strokeDasharray="3 3" />
        <path d={pathOf(coul, X, Y)} fill="none" stroke={C.sky} strokeWidth={1.4} strokeDasharray="5 4" />
        <path d={pathOf(rep, X, Y)} fill="none" stroke={C.pink} strokeWidth={1.4} strokeDasharray="5 4" />
        <path d={pathOf(clip, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.4} />
        <circle cx={X(d)} cy={Y(U0)} r={5} fill="#fde047" />
        <text x={X(d) + 8} y={Y(U0) + 16} fill="#fde047" fontSize={12}>d = {d} pm, U = {U0.toFixed(0)}</text>
        {Array.from({ length: 30 }, (_, i) => -i * (ymin < -2000 ? 1000 : 200)).filter(v => v >= ymin && v <= ymax).map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        {[1, 1.5, 2].map(f => <text key={f} x={X(f * d)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{Math.round(f * d)}</text>)}
        <text x={W - pad} y={pad} fill={C.sky} fontSize={11} textAnchor="end">{isKo ? "쿨롱 끌림" : "Coulomb attraction"}</text>
        <text x={W - pad} y={pad + 16} fill={C.pink} fontSize={11} textAnchor="end">{isKo ? "Pauli 반발" : "Pauli repulsion"}</text>
      </svg>
      <StatGrid>
        <Stat label={isKo ? "Madelung 상수 A" : "Madelung constant A"} value={s.A.toFixed(4)} color={C.accent} />
        <Stat label={isKo ? "Born–Mayer 격자 에너지" : "Born–Mayer lattice energy"} value={`${(-U0).toFixed(0)} kJ mol⁻¹`} color={C.accent} />
        <Stat label={isKo ? "Born–Haber 순환 (실험)" : "Born–Haber cycle (experiment)"} value={`${s.bh} kJ mol⁻¹`} color={C.ok} />
        <Stat label={isKo ? "계산/실험" : "calc/exp"} value={(-U0 / s.bh).toFixed(3)} color={Math.abs(-U0 / s.bh - 1) < 0.06 ? C.ok : C.amber} />
        {K !== null && <Stat label={isKo ? "체적 탄성률 K (암염 구조)" : "Bulk modulus K (rock salt)"} value={`${K.toFixed(1)} GPa`} color={C.purple} />}
      </StatGrid>
      <Note>
        {isKo
          ? "반발 항이 쿨롱 에너지를 ρ/d ≈ 12%만큼 깎는다는 점에 주목하십시오. 계산값이 실험값보다 3–6% 작은 이유는 van der Waals 끌림과 영점 에너지를 빼먹었기 때문입니다. MgO는 전하가 ±2라 쿨롱 항이 z² = 4배로 커지고, 그래서 녹는점이 2852 °C에 이르러 용광로 내화물로 쓰입니다. 오른쪽 아래의 체적 탄성률은 퍼텐셜 우물의 곡률에서 나옵니다(아래 카드)."
          : "Note that the repulsion trims the Coulomb energy by ρ/d ≈ 12%. The calculation falls 3–6% below experiment because van der Waals attraction and zero-point energy are left out. MgO has charges ±2, so the Coulomb term grows by z² = 4; hence its melting point of 2852 °C and its use as a furnace refractory. The bulk modulus at the bottom right comes from the curvature of the potential well (next card)."}
      </Note>
    </Card>
  );
}

function ModuliCard({ isKo }) {
  const [E, setE] = useState(200);
  const [nu, setNu] = useState(0.30);
  const G = E / (2 * (1 + nu)), K = E / (3 * (1 - 2 * nu));
  return (
    <Card>
      <Hd>{isKo ? "퍼텐셜 우물의 곡률이 곧 결정의 단단함" : "The curvature of the potential well is the stiffness of the crystal"}</Hd>
      <Note>
        {isKo
          ? "부피를 조금 줄이면 압력이 얼마나 오를까요? 체적 탄성률 K = −V(∂p/∂V)는 p = −∂U/∂V를 이용하면 K = V ∂²U/∂V²가 됩니다. 암염 구조에서 이온 쌍 하나가 차지하는 부피는 V = a³/4 = 2r³(a = 2r)이므로 dV/dr = 6r²이고, 평형점(dU/dr = 0)에서 체인 규칙을 쓰면 다음과 같습니다."
          : "How much does the pressure rise when the volume shrinks slightly? With p = −∂U/∂V the bulk modulus K = −V(∂p/∂V) becomes K = V ∂²U/∂V². In rock salt each ion pair occupies V = a³/4 = 2r³ (a = 2r), so dV/dr = 6r², and at equilibrium (dU/dr = 0) the chain rule gives"}
      </Note>
      <Eq>∂²U/∂V² = (∂²U/∂r²)/(dV/dr)² = U″(r₀)/(36 r₀⁴)   →   K = 2r₀³ U″/(36 r₀⁴) = U″(r₀)/(18 r₀)</Eq>
      <Eq>U″(r₀) = (A e²/4πε₀ r₀³)(r₀/ρ − 2)   →   K = A e²(r₀/ρ − 2)/(72πε₀ r₀⁴)</Eq>
      <Note>
        {isKo
          ? "NaCl(r₀ = 282 pm, ρ = 34.5 pm)에 넣으면 K ≈ 22 GPa로, 실측값 약 24 GPa와 잘 맞습니다. 뒤집어 보면, 압축률을 재서 ρ를 정하는 것이 Born–Mayer 식의 출발점입니다. 아래 계산기는 등방성 고체의 탄성 상수 사이 관계입니다: 독립인 것은 두 개뿐입니다."
          : "For NaCl (r₀ = 282 pm, ρ = 34.5 pm) this gives K ≈ 22 GPa, close to the measured value of about 24 GPa. Turned around, measuring the compressibility is how ρ in the Born–Mayer equation is fixed. The calculator below uses the relations between the elastic constants of an isotropic solid: only two are independent."}
      </Note>
      <Eq>E = 2G(1 + ν) = 3K(1 − 2ν),   σ = 2Gε + λ tr(ε) I</Eq>
      <Row>
        <Slider label={isKo ? "Young 률 E" : "Young's modulus E"} value={E} min={1} max={1000} step={1} onChange={setE} unit=" GPa" fmt={v => v.toFixed(0)} />
        <Slider label={isKo ? "Poisson 비 ν" : "Poisson's ratio ν"} value={nu} min={0} max={0.49} step={0.01} onChange={setNu} fmt={v => v.toFixed(2)} />
      </Row>
      <StatGrid>
        <Stat label={isKo ? "전단 탄성률 G" : "Shear modulus G"} value={`${G.toFixed(1)} GPa`} color={C.accent} />
        <Stat label={isKo ? "체적 탄성률 K" : "Bulk modulus K"} value={`${K.toFixed(1)} GPa`} color={C.accent} />
      </StatGrid>
      <Note>
        {isKo
          ? "강철은 E ≈ 200 GPa, ν ≈ 0.30으로 G ≈ 77 GPa, K ≈ 167 GPa입니다. ν → 0.5이면 K → ∞, 곧 고무처럼 부피는 거의 변하지 않고 모양만 바뀌는 물질이 됩니다."
          : "Steel has E ≈ 200 GPa and ν ≈ 0.30, giving G ≈ 77 GPa and K ≈ 167 GPa. As ν → 0.5, K → ∞: the material changes shape but hardly changes volume, like rubber."}
      </Note>
    </Card>
  );
}

// =============================================================
// 3) FROM HÜCKEL TO BANDS
// =============================================================
function BandsTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <HuckelDerivCard isKo={isKo} />
      <HuckelLab isKo={isKo} />
      <BandFormLab isKo={isKo} />
      <BlochCard isKo={isKo} />
      <FermiLab isKo={isKo} />
      <OtherPropsCard isKo={isKo} />
    </div>
  );
}

function HuckelDerivCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "Hückel 근사: 오비탈 문제를 '연결 그래프'의 문제로" : "The Hückel approximation: turning an orbital problem into a graph problem"}</Hd>
      <Note>
        {isKo
          ? "탄소 원자마다 분자 평면에 수직인 2p_z 오비탈 χ_i가 하나씩 있다고 하고, π 분자 오비탈을 그 선형 결합 ψ = Σ c_i χ_i로 씁니다(LCAO). 에너지를 최소화하는 변분 원리에서 영년 방정식이 나옵니다."
          : "Give each carbon one 2p_z orbital χ_i perpendicular to the molecular plane and write a π molecular orbital as the linear combination ψ = Σ c_i χ_i (LCAO). The variational principle, which minimizes the energy, gives the secular equations."}
      </Note>
      <Eq>Σ_j (H_ij − E S_ij) c_j = 0,   H_ij = ∫χ_i Ĥ χ_j dτ,   S_ij = ∫χ_i χ_j dτ</Eq>
      <Note>
        {isKo
          ? "Hückel은 세 가지를 과감하게 단순화했습니다. ① 대각 원소는 모두 같다: H_ii = α(쿨롱 적분, 탄소 2p 전자의 에너지). ② 결합으로 이어진 이웃끼리만 H_ij = β(공명 적분, β < 0), 나머지는 0. ③ 겹침은 무시한다: S_ij = δ_ij. 그러면 Hamiltonian 행렬은 '누가 누구와 이어져 있는가'를 적은 인접 행렬 A로 쓰입니다."
          : "Hückel made three bold simplifications. (1) All diagonal elements are equal: H_ii = α (the Coulomb integral, the energy of a carbon 2p electron). (2) Only bonded neighbours couple: H_ij = β (the resonance integral, β < 0), all others zero. (3) Overlap is neglected: S_ij = δ_ij. The Hamiltonian matrix is then written with the adjacency matrix A, which records who is bonded to whom."}
      </Note>
      <Eq>H = αI + βA   →   Hc = Ec   →   E_k = α + β λ_k   (λ_k {isKo ? "= A의 고유값" : "= eigenvalues of A"})</Eq>
      <HdSub>{isKo ? "원자 두 개(에틸렌)" : "Two atoms (ethene)"}</HdSub>
      <Eq>det[[α − E, β], [β, α − E]] = 0   →   (α − E)² = β²   →   E = α ± β</Eq>
      <Note>
        {isKo
          ? "β < 0이므로 α + β가 결합 오비탈(아래), α − β가 반결합 오비탈(위)입니다. 원자 N개의 선형 사슬이면 A는 대각선 바로 위아래만 1인 삼중대각 행렬이고, 시험해 c_j = sin(jkπ/(N + 1))을 넣으면 c_{j−1} + c_{j+1} = 2cos(kπ/(N + 1)) c_j가 성립해 고유값이 바로 나옵니다. 고리(벤젠)라면 끝이 이어져 c_j = e^(2πijk/N)이 됩니다."
          : "Since β < 0, α + β is the bonding orbital (lower) and α − β the antibonding one (upper). For a linear chain of N atoms, A is tridiagonal with ones just above and below the diagonal. Trying c_j = sin(jkπ/(N + 1)) gives c_{j−1} + c_{j+1} = 2cos(kπ/(N + 1)) c_j, so the eigenvalues follow at once. For a ring (benzene) the ends join and c_j = e^(2πijk/N)."}
      </Note>
      <Eq>{isKo ? "사슬:" : "chain:"} E_k = α + 2β cos(kπ/(N + 1)),  k = 1…N        {isKo ? "고리:" : "ring:"} E_k = α + 2β cos(2πk/N),  k = 0…N − 1</Eq>
    </Card>
  );
}

const MOLS = {
  ethene: { N: 2, ring: false, ne: 2, ko: "에틸렌", en: "ethene" },
  allyl: { N: 3, ring: false, ne: 3, ko: "알릴 라디칼", en: "allyl radical" },
  butadiene: { N: 4, ring: false, ne: 4, ko: "부타다이엔", en: "butadiene" },
  cyclobutadiene: { N: 4, ring: true, ne: 4, ko: "사이클로부타다이엔", en: "cyclobutadiene" },
  hexatriene: { N: 6, ring: false, ne: 6, ko: "헥사트라이엔", en: "hexatriene" },
  benzene: { N: 6, ring: true, ne: 6, ko: "벤젠", en: "benzene" },
  carotene: { N: 22, ring: false, ne: 22, ko: "β-카로틴 사슬(22)", en: "β-carotene chain (22)" },
};
function huckelLevels(N, ring) {
  const E = [];
  if (ring) for (let k = 0; k < N; k++) E.push(-2 * Math.cos(2 * Math.PI * k / N));
  else for (let k = 1; k <= N; k++) E.push(-2 * Math.cos(k * Math.PI / (N + 1)));
  return E.map(v => Math.abs(v) < 1e-12 ? 0 : v).sort((a, b) => a - b);   // units: α = 0, β = −1, so E = −λ|β|
}
function HuckelLab({ isKo }) {
  const [mol, setMol] = useState("benzene");
  const m = MOLS[mol];
  const E = huckelLevels(m.N, m.ring);
  // degenerate groups, then Aufbau filling with Hund's rule
  const groups = [];
  E.forEach((e, k) => { const g = groups.find(gr => Math.abs(gr.e - e) < 1e-9); if (g) g.ks.push(k); else groups.push({ e, ks: [k] }); });
  const occ = new Array(E.length).fill(0);
  let left = m.ne;
  groups.forEach(g => {
    const n = g.ks.length, put = Math.min(left, 2 * n);
    g.ks.forEach((k, q) => { occ[k] = put >= n ? 1 : (q < put ? 1 : 0); });
    for (let q = 0; q < put - n; q++) occ[g.ks[q]] = 2;
    left -= put;
  });
  const Epi = E.reduce((s, e, k) => s + occ[k] * e, 0);      // in |β|, negative = bonding
  const homo = Math.max(...E.filter((e, k) => occ[k] > 0));
  const lumo = Math.min(...E.filter((e, k) => occ[k] < 2));
  const W = 560, Ht = 300, pad = 40;
  const Y = e => Ht / 2 - e * (Ht / 2 - pad) / 2.2;
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑤ π 분자 오비탈 준위 쌓기" : "Lab ⑤ Building π molecular-orbital levels"}</Hd>
      <Row>
        {Object.entries(MOLS).map(([k, v]) => <button key={k} onClick={() => setMol(k)} style={btnStyle(mol === k)}>{isKo ? v.ko : v.en}</button>)}
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <line x1={70} x2={70} y1={pad - 10} y2={Ht - pad + 10} stroke="#334155" />
        {[-2, -1, 0, 1, 2].map(v => <g key={v}>
          <line x1={66} x2={W - 20} y1={Y(v)} y2={Y(v)} stroke="#1f2937" />
          <text x={60} y={Y(v) + 4} fill={C.textDim} fontSize={11} textAnchor="end">{v === 0 ? "α" : `α ${v < 0 ? "+" : "−"} ${Math.abs(v) === 1 ? "" : Math.abs(v)}β`}</text>
        </g>)}
        {groups.map((g, gi) => g.ks.map((k, q) => {
          const wdt = Math.min(70, 300 / g.ks.length), x0 = 140 + (q - (g.ks.length - 1) / 2) * (wdt + 18) + 120;
          return <g key={`${gi}-${q}`}>
            <line x1={x0 - wdt / 2} x2={x0 + wdt / 2} y1={Y(g.e)} y2={Y(g.e)} stroke={g.e < -1e-9 ? C.accent : g.e > 1e-9 ? C.pink : C.amber} strokeWidth={2.4} />
            {occ[k] >= 1 && <text x={x0 - 8} y={Y(g.e) + 5} fill="#fde047" fontSize={15} textAnchor="middle">↑</text>}
            {occ[k] >= 2 && <text x={x0 + 8} y={Y(g.e) + 5} fill="#fde047" fontSize={15} textAnchor="middle">↓</text>}
          </g>;
        }))}
        <text x={W - 24} y={pad} fill={C.pink} fontSize={11} textAnchor="end">{isKo ? "반결합" : "antibonding"}</text>
        <text x={W - 24} y={Ht - pad + 4} fill={C.accent} fontSize={11} textAnchor="end">{isKo ? "결합" : "bonding"}</text>
      </svg>
      <StatGrid>
        <Stat label={isKo ? "준위 (α 기준, |β| 단위)" : "Levels (from α, units of |β|)"} value={E.map(e => e.toFixed(3)).join(", ")} color={C.accent} />
        <Stat label={isKo ? "π 에너지" : "π energy"} value={`${m.ne}α ${Epi <= 0 ? "+" : "−"} ${Math.abs(Epi).toFixed(3)}β`} color={C.accent} />
        <Stat label={isKo ? "고립 C=C 대비 추가 안정화" : "Extra stabilization vs isolated C=C"} value={m.ne % 2 === 0 ? `${(-Epi - m.ne).toFixed(3)}|β|` : "—"} color={C.ok} />
        <Stat label={isKo ? "HOMO–LUMO 간격" : "HOMO–LUMO gap"} value={lumo - homo > 1e-9 ? `${(lumo - homo).toFixed(3)}|β|` : (isKo ? "0 (반만 찬 준위)" : "0 (half-filled level)")} color={C.lime} />
      </StatGrid>
      <Note>
        {isKo
          ? "벤젠은 결합 준위 셋(α + 2β, α + β 둘)이 꽉 차 π 에너지가 6α + 8β입니다. 고립된 C=C 세 개(6α + 6β)보다 2|β| ≈ 150 kJ/mol 더 안정한데, 이것이 비편재화(공명) 에너지입니다. 사이클로부타다이엔은 α에 겹친 두 준위에 전자가 하나씩 들어가 라디칼 두 개처럼 행동하므로 불안정합니다(반방향족성). 사슬이 길어질수록 HOMO–LUMO 간격이 줄어드는 것도 보십시오: β-카로틴처럼 공액 사슬이 긴 분자는 간격이 가시광선 에너지까지 내려와 색을 띱니다. 이 간격이 0으로 가는 극한이 다음 실험실의 '띠'입니다."
          : "Benzene fills three bonding levels (α + 2β and two at α + β), giving a π energy of 6α + 8β. This is 2|β| ≈ 150 kJ/mol more stable than three isolated C=C bonds (6α + 6β): the delocalization (resonance) energy. Cyclobutadiene puts one electron in each of two degenerate levels at α and behaves like a diradical, so it is unstable (antiaromatic). Notice also that the HOMO–LUMO gap shrinks as the chain lengthens: long conjugated chains such as β-carotene bring the gap down to visible-light energies and are coloured. The limit in which this gap goes to zero is the 'band' of the next lab."}
      </Note>
    </Card>
  );
}

function BandFormLab({ isKo }) {
  const [N, setN] = useState(10);
  const [fill, setFill] = useState(0.5);
  const Ns = [2, 5, 10, 20, 50, 100];
  const W = 640, Ht = 300, pad = 40;
  const Y = e => Ht / 2 - e * (Ht / 2 - pad) / 2.1;
  const colW = (W - 120) / (Ns.length + 1);
  const levels = huckelLevels(N, false);
  const nocc = Math.round(fill * N);
  const width = levels[N - 1] - levels[0];
  // DOS histogram for current N vs analytic
  const W2 = 360, H2 = 300, pad2 = 40, nb = Math.max(4, Math.min(30, Math.round(N / 4)));
  const hist = new Array(nb).fill(0);
  levels.forEach(e => { const b = Math.min(nb - 1, Math.floor((e + 2) / 4 * nb)); hist[b]++; });
  const maxh = Math.max(...hist.map(h => h / N / (4 / nb)), 0.6);
  const Xd = g => pad2 + (W2 - 2 * pad2) * g / (maxh * 1.05);
  const Yd = e => H2 / 2 - e * (H2 / 2 - pad2) / 2.1;
  const ana = [];
  for (let e = -1.98; e <= 1.98; e += 0.02) ana.push([1 / (Math.PI * Math.sqrt(4 - e * e)), e]);
  const EF = nocc > 0 && nocc < N ? (levels[nocc - 1] + levels[nocc]) / 2 : null;
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑥ 원자 N개가 만드는 띠" : "Lab ⑥ The band made by N atoms"}</Hd>
      <Row>
        <Slider label={isKo ? "원자 수 N" : "Number of atoms N"} value={N} min={2} max={200} step={1} onChange={setN} fmt={v => v.toFixed(0)} />
        <Slider label={isKo ? "채움 비율 (전자/원자 ÷ 2)" : "Filling (electrons per atom ÷ 2)"} value={fill} min={0} max={1} step={0.05} onChange={setFill} fmt={v => v.toFixed(2)} />
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <svg viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          {[-2, 0, 2].map(v => <g key={v}><line x1={50} x2={W - 10} y1={Y(v)} y2={Y(v)} stroke="#1f2937" />
            <text x={44} y={Y(v) + 4} fill={C.textDim} fontSize={11} textAnchor="end">{v === 0 ? "α" : `α ${v < 0 ? "+" : "−"} 2β`}</text></g>)}
          {[...Ns, N].map((n, ci) => {
            const L = huckelLevels(n, false), x0 = 70 + ci * colW;
            return <g key={ci}>
              {L.map((e, k) => <line key={k} x1={x0} x2={x0 + colW - 16} y1={Y(e)} y2={Y(e)} stroke={ci === Ns.length ? (k < Math.round(fill * n) ? "#fde047" : C.accent) : C.textDim} strokeWidth={n > 50 ? 0.6 : 1.4} />)}
              <text x={x0 + (colW - 16) / 2} y={Ht - 8} fill={ci === Ns.length ? C.accent : C.textDim} fontSize={11} textAnchor="middle">N = {n}</text>
            </g>;
          })}
        </svg>
        <svg viewBox={`0 0 ${W2} ${H2}`} style={svgBox(W2)}>
          <line x1={pad2} x2={pad2} y1={pad2 - 10} y2={H2 - pad2 + 10} stroke="#334155" />
          {hist.map((h, b) => {
            const e0 = -2 + 4 * b / nb, e1 = e0 + 4 / nb, g = h / N / (4 / nb);
            return <rect key={b} x={pad2} y={Yd(e1)} width={Xd(g) - pad2} height={Yd(e0) - Yd(e1) - 1} fill={C.accent} fillOpacity={0.45} />;
          })}
          <path d={ana.map(([g, e], i) => `${i ? "L" : "M"} ${Xd(Math.min(g, maxh)).toFixed(1)} ${Yd(e).toFixed(1)}`).join(" ")} fill="none" stroke="#fde047" strokeWidth={1.6} />
          {EF !== null && <><line x1={pad2} x2={W2 - 10} y1={Yd(EF)} y2={Yd(EF)} stroke={C.pink} strokeDasharray="4 3" />
            <text x={W2 - 12} y={Yd(EF) - 5} fill={C.pink} fontSize={11} textAnchor="end">E_F</text></>}
          <text x={W2 / 2} y={H2 - 8} fill={C.textDim} fontSize={11} textAnchor="middle">{isKo ? "상태 밀도 g(E)" : "density of states g(E)"}</text>
        </svg>
      </div>
      <StatGrid>
        <Stat label={isKo ? "띠 너비" : "Band width"} value={`${width.toFixed(4)}|β|  (→ 4|β|)`} color={C.accent} />
        <Stat label={isKo ? "띠 가운데 준위 간격" : "Level spacing at band centre"} value={`${(N > 1 ? levels[Math.floor(N / 2)] - levels[Math.floor(N / 2) - 1] : 0).toFixed(4)}|β|`} color={C.lime} />
        <Stat label={isKo ? "채워진 준위 / 전체" : "Filled levels / total"} value={`${nocc} / ${N}`} color="#fde047" />
        <Stat label={isKo ? "판정" : "Verdict"} value={nocc === 0 || nocc === N ? (isKo ? "빈 띠 / 꽉 찬 띠 → 절연체" : "empty / full band → insulator") : (isKo ? "부분적으로 찬 띠 → 금속" : "partly filled band → metal")} color={nocc === 0 || nocc === N ? C.amber : C.ok} />
      </StatGrid>
      <Note>
        {isKo
          ? "N이 커질수록 준위는 α ± 2|β| 사이에 점점 촘촘히 들어차고, 준위 간격은 약 2π|β|/N으로 0에 가까워집니다. 원자가 10²³개면 간격은 10⁻²³|β| 정도라 사실상 연속, 곧 '띠'입니다. 오른쪽 상태 밀도는 띠 가장자리에서 1/√(4β² − E²)처럼 치솟습니다(van Hove 특이점). 채움 비율을 0.5로 두면(원자마다 전자 하나, Na처럼) 띠가 반쯤 차서, 바로 위에 빈 준위가 붙어 있으므로 작은 전기장에도 전자가 움직입니다: 금속. 1로 두면 띠가 꽉 차서 전자가 갈 곳이 없습니다: 다음 띠까지의 간격(띠 간격)이 크면 절연체, 작으면 반도체입니다."
          : "As N grows the levels crowd ever more densely between α ± 2|β|, and the spacing shrinks to about 2π|β|/N. With 10²³ atoms the spacing is about 10⁻²³|β|, effectively continuous: a band. The density of states on the right shoots up as 1/√(4β² − E²) at the band edges (van Hove singularities). With filling 0.5 (one electron per atom, like Na) the band is half full and empty levels sit right above the occupied ones, so a small field moves electrons: a metal. With filling 1 the band is full and electrons have nowhere to go; if the gap to the next band is large the solid is an insulator, if small a semiconductor."}
      </Note>
    </Card>
  );
}

function BlochCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "고리에서 무한 결정으로: 강결합 띠 E(k)" : "From the ring to the infinite crystal: the tight-binding band E(k)"}</Hd>
      <Note>
        {isKo
          ? "고리의 해 c_j = e^(2πijk/N)에서 원자 위치 x_j = ja와 파수 k_B = 2πk/(Na)를 쓰면 c_j = e^(i k_B x_j)입니다. 이것이 Bloch 정리입니다: 주기적인 결정에서 고유 상태는 원자 오비탈에 평면파 위상을 곱한 합입니다. 12주차의 강결합 모형은 같은 결과를 t = −β로 쓴 것입니다."
          : "In the ring solution c_j = e^(2πijk/N), with atomic positions x_j = ja and wave number k_B = 2πk/(Na), we have c_j = e^(i k_B x_j). This is Bloch's theorem: in a periodic crystal the eigenstates are sums of atomic orbitals multiplied by plane-wave phases. The tight-binding model of Week 12 is the same result written with t = −β."}
      </Note>
      <Eq>ψ_k(r) = Σ_R e^(ik·R) χ(r − R),   E(k) = α + 2β cos(ka),   −π/a &lt; k ≤ π/a</Eq>
      <Note>
        {isKo
          ? "띠 너비 4|β|는 이웃 오비탈이 얼마나 겹치느냐(β)로 정해집니다. 그래서 겹침이 큰 s·p 오비탈은 넓은 띠(수 eV)를, 원자핵 가까이 웅크린 d·f 오비탈은 좁은 띠를 만듭니다. 전이 금속의 좁은 d 띠는 '불균일 촉매' 탭의 d-띠 중심 이론에서 다시 등장합니다."
          : "The band width 4|β| is set by how much neighbouring orbitals overlap (β). Strongly overlapping s and p orbitals make wide bands (several eV), while d and f orbitals, huddled close to the nucleus, make narrow ones. The narrow d bands of transition metals return in the d-band centre theory of the Heterogeneous Catalysis tab."}
      </Note>
    </Card>
  );
}

function FermiLab({ isKo }) {
  const [T, setT] = useState(300);
  const [Eg, setEg] = useState(1.12);
  const W = 620, Ht = 260, pad = 46;
  const { X, Y } = plotScale(-0.5, 0.5, 0, 1.05, W, Ht, pad);
  const f = (dE, TT) => 0.5 * (1 - Math.tanh(dE / (2 * KB_EV * Math.max(TT, 1e-3))));
  const curve = TT => { const p = []; for (let i = 0; i <= 400; i++) { const e = -0.5 + i / 400; p.push([e, f(e, TT)]); } return p; };
  const sc = Math.pow(T / 300, 1.5);
  const ni = Math.sqrt(2.8e19 * 1.04e19) * sc * Math.exp(-Eg / (2 * KB_EV * T));
  const sigma = ni * 1.602e-19 * (1400 + 450);    // S/cm with Si-like mobilities (cm²/Vs)
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑦ Fermi–Dirac 분포와 금속·반도체·절연체" : "Lab ⑦ The Fermi–Dirac distribution and metals, semiconductors, insulators"}</Hd>
      <Note>
        {isKo
          ? "전자는 페르미온이어서 한 상태에 하나(스핀 포함 둘)만 들어갑니다. 그래서 온도 T에서 에너지 E인 상태가 차 있을 확률은 Boltzmann 인자가 아니라 Fermi–Dirac 분포입니다. T = 0에서는 E_F 아래가 모두 차고(f = 1) 위는 비어 있으며(f = 0), 온도가 오르면 E_F 근처 약 k_BT 폭에서만 경계가 무너집니다."
          : "Electrons are fermions, so each state holds only one (two with spin). The probability that a state at energy E is occupied at temperature T is therefore not a Boltzmann factor but the Fermi–Dirac distribution. At T = 0 everything below E_F is full (f = 1) and everything above is empty (f = 0); as T rises the edge softens only within about k_BT of E_F."}
      </Note>
      <Eq>f(E) = 1/(e^((E − E_F)/k_BT) + 1),     n = ∫_(E_C) g_C(E) f(E) dE ≈ N_C e^(−(E_C − E_F)/k_BT)</Eq>
      <Eq>{isKo ? "진성 반도체:" : "intrinsic semiconductor:"} n = p = n_i = √(N_C N_V) e^(−E_g/2k_BT),     σ = e(nμ_n + pμ_p)</Eq>
      <Row>
        <Slider label={isKo ? "온도 T" : "Temperature T"} value={T} min={10} max={1500} step={10} onChange={setT} unit=" K" fmt={v => v.toFixed(0)} />
        <Slider label={isKo ? "띠 간격 E_g" : "Band gap E_g"} value={Eg} min={0.1} max={6} step={0.01} onChange={setEg} unit=" eV" fmt={v => v.toFixed(2)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel="E − E_F (eV)" ylabel="f(E)" />
        {[-0.4, -0.2, 0, 0.2, 0.4].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        {[0, 0.5, 1].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        <path d={pathOf(curve(1), X, Y)} fill="none" stroke={C.textDim} strokeWidth={1.2} strokeDasharray="4 3" />
        <path d={pathOf(curve(T), X, Y)} fill="none" stroke={C.accent} strokeWidth={2.4} />
        <rect x={X(-2 * KB_EV * T)} y={Y(1.05)} width={X(2 * KB_EV * T) - X(-2 * KB_EV * T)} height={Y(0) - Y(1.05)} fill={C.accent} fillOpacity={0.08} />
        <text x={X(0) + 6} y={Y(1.0) - 4} fill={C.accent} fontSize={11}>±2k_BT = ±{(2 * KB_EV * T * 1000).toFixed(0)} meV</text>
      </svg>
      <StatGrid>
        <Stat label={isKo ? "k_BT" : "k_BT"} value={`${(KB_EV * T * 1000).toFixed(1)} meV`} color={C.accent} />
        <Stat label="f(E_F + 0.1 eV)" value={sci(f(0.1, T), 2)} color={C.accent} />
        <Stat label={isKo ? "진성 운반자 농도 n_i" : "Intrinsic carrier density n_i"} value={`${sci(ni, 2)} cm⁻³`} color={C.lime} />
        <Stat label={isKo ? "진성 전도도 (Si 이동도)" : "Intrinsic conductivity (Si mobilities)"} value={`${sci(sigma, 2)} S cm⁻¹`} color={C.lime} />
        <Stat label={isKo ? "비교: Cu 금속" : "Compare: Cu metal"} value="6×10⁵ S cm⁻¹" color={C.amber} />
      </StatGrid>
      <Note>
        {isKo
          ? "E_g = 1.12 eV(Si), 300 K에서 n_i ≈ 10¹⁰ cm⁻³입니다(이 단순 계산은 6.7×10⁹). Si 원자 약 10¹²개에 하나 꼴이라 순수한 Si는 전기를 거의 통하지 않지만, 온도를 올리면 지수적으로 늘어납니다: 반도체의 저항은 온도가 오르면 줄고, 금속의 저항은 포논 산란 때문에 늘어납니다. E_g를 5.5 eV(다이아몬드)로 올리면 n_i가 사실상 0이 되어 절연체입니다. 실제 소자는 P나 B를 10¹⁵–10¹⁹ cm⁻³ 넣는 도핑으로 운반자 농도를 정합니다. N_C, N_V는 Si의 300 K 값(2.8×10¹⁹, 1.04×10¹⁹ cm⁻³)을 T^(3/2)로 늘렸고, 이동도는 상온 값으로 고정한 근사입니다."
          : "For E_g = 1.12 eV (Si) at 300 K, n_i ≈ 10¹⁰ cm⁻³ (this simple estimate gives 6.7×10⁹). That is one carrier per 10¹² atoms, so pure Si barely conducts, but the number grows exponentially with temperature: a semiconductor's resistance falls on heating, whereas a metal's rises because of phonon scattering. Raise E_g to 5.5 eV (diamond) and n_i is effectively zero: an insulator. Real devices set the carrier density by doping with 10¹⁵–10¹⁹ cm⁻³ of P or B. N_C and N_V are the Si values at 300 K (2.8×10¹⁹ and 1.04×10¹⁹ cm⁻³) scaled as T^(3/2), and the mobilities are held at room-temperature values: an approximation."}
      </Note>
    </Card>
  );
}

function OtherPropsCard({ isKo }) {
  const rows = isKo ? [
    ["금속 도체", "E_F가 띠 안에 있음", "σ = ne²τ/m* (Drude), 온도↑ → σ↓", "Cu, Al 배선, 전극"],
    ["반도체", "E_g ≈ k_BT의 수십 배 (0.1–3 eV)", "n_i ∝ e^(−E_g/2k_BT), 도핑으로 조절", "Si, GaAs, TiO₂ 광촉매"],
    ["절연체", "E_g ≫ k_BT (> 4 eV)", "운반자 거의 없음", "SiO₂, Al₂O₃ 담체"],
    ["초전도체", "T < T_c에서 전자쌍 응축", "ρ = 0, Meissner 효과(B = 0, 완전 반자성)", "MRI 자석, Nb₃Sn"],
    ["반자성 / 상자성 / 강자성", "짝지은 전자 / 짝짓지 않은 스핀 / 정렬된 스핀", "χ < 0 / χ > 0 작음 / χ ≫ 1", "자기 분리, 자성 촉매 회수"],
  ] : [
    ["Metallic conductor", "E_F inside a band", "σ = ne²τ/m* (Drude); σ falls as T rises", "Cu and Al wiring, electrodes"],
    ["Semiconductor", "E_g a few tens of k_BT (0.1–3 eV)", "n_i ∝ e^(−E_g/2k_BT), tuned by doping", "Si, GaAs, TiO₂ photocatalysts"],
    ["Insulator", "E_g ≫ k_BT (> 4 eV)", "almost no carriers", "SiO₂, Al₂O₃ supports"],
    ["Superconductor", "electron pairs condense below T_c", "ρ = 0, Meissner effect (B = 0, perfect diamagnet)", "MRI magnets, Nb₃Sn"],
    ["Dia- / para- / ferromagnet", "paired electrons / unpaired spins / aligned spins", "χ < 0 / small χ > 0 / χ ≫ 1", "magnetic separation, recovery of magnetic catalysts"],
  ];
  return (
    <Card>
      <Hd>{isKo ? "띠 그림 하나로 읽는 고체의 성질" : "Reading solid properties from one band picture"}</Hd>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
          <thead><tr>{(isKo ? ["종류", "띠 구조", "핵심 식·현상", "공정 예"] : ["Class", "Band structure", "Key relation / phenomenon", "Process examples"]).map(h => (
            <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: `1px solid ${C.border}`, color: C.accentSoft }}>{h}</th>))}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={{ padding: "7px 10px", borderBottom: `1px solid ${C.border}55`, lineHeight: 1.5 }}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <Note>
        {isKo
          ? "부피 자화율 χ는 M = χH로 정의합니다(몰 자화율 χ_m = χV_m). 짝짓지 않은 스핀이 서로 같은 방향으로 정렬하면 강자성, 반대 방향이지만 크기가 달라 알짜 모멘트가 남으면 준강자성(자철석 Fe₃O₄)입니다."
          : "The volume susceptibility χ is defined by M = χH (molar susceptibility χ_m = χV_m). Unpaired spins aligned in parallel give ferromagnetism; antiparallel spins of unequal size that leave a net moment give ferrimagnetism (magnetite Fe₃O₄)."}
      </Note>
    </Card>
  );
}

// =============================================================
// 4) SURFACE COLLISIONS & LANGMUIR ADSORPTION
// =============================================================
function AdsorbTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <FluxDerivCard isKo={isKo} />
      <FluxLab isKo={isKo} />
      <PhysChemCard isKo={isKo} />
      <LangmuirDerivCard isKo={isKo} />
      <LangmuirLab isKo={isKo} />
      <IsostericLab isKo={isKo} />
      <TechniquesCard isKo={isKo} />
    </div>
  );
}

function FluxDerivCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "표면은 1초에 몇 번 얻어맞을까: 충돌 선속의 유도" : "How often is a surface hit? Deriving the collision flux"}</Hd>
      <Note>
        {isKo
          ? "결정이 끝나는 곳, 표면에서는 원자의 이웃이 모자랍니다. 그래서 표면은 주변 기체 분자를 붙잡으려 하고, 그 첫 단계는 '충돌'입니다. 충돌 선속 J는 단위 넓이, 단위 시간에 표면을 때리는 분자 수입니다. 표면을 z = 0 평면에 두고, 속도 성분 v_z > 0인 분자만 표면을 향해 날아온다고 합시다. 시간 dt 동안 넓이 A를 때리는 분자는 밑넓이 A, 높이 v_z dt인 기둥 안에 있던 분자들입니다."
          : "Where the crystal ends, at the surface, atoms lack neighbours, so the surface tries to capture surrounding gas molecules, and the first step is a collision. The collision flux J is the number of molecules hitting unit area per unit time. Put the surface in the plane z = 0 and count only molecules with v_z > 0, flying towards it. In time dt the molecules that hit an area A are those inside a column of base A and height v_z dt."}
      </Note>
      <Eq>f(v) = (m/2πk_BT)^(3/2) exp[−m(v_x² + v_y² + v_z²)/2k_BT]   {isKo ? "(Maxwell–Boltzmann)" : "(Maxwell–Boltzmann)"}</Eq>
      <Eq>J = n ∫∫∫_{'{v_z > 0}'} v_z f(v) d³v = n (m/2πk_BT)^(1/2) ∫₀^∞ v_z e^(−mv_z²/2k_BT) dv_z</Eq>
      <Note>
        {isKo
          ? "v_x, v_y 적분은 각각 (2πk_BT/m)^(1/2)이 되어 앞 인자의 3/2 제곱 중 1을 지웁니다. 남은 v_z 적분은 u = mv_z²/2k_BT로 바꾸면 k_BT/m입니다."
          : "The v_x and v_y integrals each give (2πk_BT/m)^(1/2), cancelling one power of the prefactor. The remaining v_z integral, with u = mv_z²/2k_BT, equals k_BT/m."}
      </Note>
      <Eq>J = n (m/2πk_BT)^(1/2)(k_BT/m) = n (k_BT/2πm)^(1/2) = n ⟨v⟩/4,   ⟨v⟩ = (8k_BT/πm)^(1/2)</Eq>
      <Eq>{isKo ? "이상 기체 n = p/k_BT를 넣으면" : "With the ideal gas n = p/k_BT,"}   J = p / (2πm k_BT)^(1/2)</Eq>
      <Note>
        {isKo
          ? "N₂(M = 28 g/mol), 1.0 bar, 298 K에서 J = 2.9×10²⁷ m⁻² s⁻¹입니다. 금속 표면 1 m²에는 원자가 약 10¹⁹개 있으므로, 원자 하나가 1초에 약 3×10⁸번 얻어맞습니다. 충돌의 일부만 붙어도 '깨끗한 표면'은 나노초 만에 덮입니다. 이것이 표면 과학 실험을 초고진공에서 하는 이유이고, 반대로 촉매 반응기에서는 이 엄청난 충돌 빈도가 반응물을 계속 공급해 줍니다."
          : "For N₂ (M = 28 g/mol) at 1.0 bar and 298 K, J = 2.9×10²⁷ m⁻² s⁻¹. A square metre of metal surface has about 10¹⁹ atoms, so each atom is hit about 3×10⁸ times a second. Even if only a few collisions stick, a 'clean surface' is covered within nanoseconds. That is why surface-science experiments run in ultra-high vacuum; in a catalytic reactor the same enormous collision rate keeps feeding reactants to the surface."}
      </Note>
    </Card>
  );
}

const GASES = { H2: 2.016, He: 4.003, N2: 28.01, CO: 28.01, O2: 32.0, Ar: 39.95, CO2: 44.01 };
function FluxLab({ isKo }) {
  const [gas, setGas] = useState("N2");
  const [logp, setLogp] = useState(5);
  const [T, setT] = useState(298);
  const [S, setS] = useState(1);
  const [ns, setNs] = useState(1.0);
  const m = GASES[gas] * AMU, p = Math.pow(10, logp);
  const J = p / Math.sqrt(2 * Math.PI * m * KB * T);
  const sites = ns * 1e19;
  const tmono = sites / (S * J);
  const torr = p / 133.322;
  // plot monolayer time vs pressure
  const W = 620, Ht = 260, pad = 52;
  const { X, Y } = plotScale(-10, 5, -10, 12, W, Ht, pad);
  const line = [];
  for (let lp = -10; lp <= 5; lp += 0.1) {
    const tt = sites / (S * Math.pow(10, lp) / Math.sqrt(2 * Math.PI * m * KB * T));
    line.push([lp, Math.log10(tt)]);
  }
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑧ 충돌 선속과 단일층이 덮이는 시간" : "Lab ⑧ Collision flux and the time to cover a monolayer"}</Hd>
      <Row>
        {Object.keys(GASES).map(g => <button key={g} onClick={() => setGas(g)} style={btnStyle(gas === g)}>{g}</button>)}
      </Row>
      <Row>
        <Slider label={isKo ? "압력 log₁₀(p/Pa)" : "Pressure log₁₀(p/Pa)"} value={logp} min={-10} max={5} step={0.1} onChange={setLogp} fmt={v => v.toFixed(1)} />
        <Slider label={isKo ? "온도" : "Temperature"} value={T} min={50} max={1200} step={1} onChange={setT} unit=" K" fmt={v => v.toFixed(0)} />
        <Slider label={isKo ? "부착 확률 s" : "Sticking probability s"} value={S} min={0.01} max={1} step={0.01} onChange={setS} fmt={v => v.toFixed(2)} />
        <Slider label={isKo ? "자리 밀도 (10¹⁹ m⁻²)" : "Site density (10¹⁹ m⁻²)"} value={ns} min={0.5} max={2} step={0.05} onChange={setNs} fmt={v => v.toFixed(2)} />
      </Row>
      <StatGrid>
        <Stat label={isKo ? "압력" : "Pressure"} value={`${sci(p, 2)} Pa = ${sci(torr, 2)} Torr`} color={C.accent} />
        <Stat label={isKo ? "충돌 선속 J" : "Collision flux J"} value={`${sci(J, 2)} m⁻² s⁻¹`} color={C.accent} />
        <Stat label={isKo ? "표면 원자 하나당 충돌" : "Hits per surface atom"} value={`${sci(J / sites, 2)} s⁻¹`} color={C.amber} />
        <Stat label={isKo ? "단일층 시간 t = n_s/(sJ)" : "Monolayer time t = n_s/(sJ)"} value={tmono < 1 ? `${sci(tmono, 2)} s` : tmono < 3600 ? `${tmono.toFixed(1)} s` : `${(tmono / 3600).toFixed(1)} h`} color={C.ok} />
      </StatGrid>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel="log₁₀(p/Pa)" ylabel={isKo ? "log₁₀(단일층 시간/s)" : "log₁₀(monolayer time/s)"} />
        {[-10, -5, 0, 5].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        {[-8, -4, 0, 4, 8, 12].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        <rect x={X(-10)} y={Y(12)} width={X(-6.9) - X(-10)} height={Y(-10) - Y(12)} fill={C.ok} fillOpacity={0.07} />
        <text x={X(-8.4)} y={Y(11) } fill={C.ok} fontSize={11} textAnchor="middle">{isKo ? "초고진공 (UHV)" : "UHV"}</text>
        <line x1={pad} x2={W - pad} y1={Y(0)} y2={Y(0)} stroke="#475569" strokeDasharray="3 3" />
        <path d={pathOf(line.filter(([, y]) => y >= -10 && y <= 12), X, Y)} fill="none" stroke={C.accent} strokeWidth={2.2} />
        <circle cx={X(logp)} cy={Y(Math.max(-10, Math.min(12, Math.log10(tmono))))} r={6} fill="#fde047" />
      </svg>
      <Note>
        {isKo
          ? "1 bar에서는 나노초, 10⁻⁶ Torr(일반 고진공)에서는 약 1초, 10⁻¹⁰ Torr(초고진공)에서야 몇 시간 동안 표면이 깨끗하게 유지됩니다. 이 '1초에 단일층 하나'가 되는 노출량 10⁻⁶ Torr·s를 1 Langmuir(L)라 부르며, 표면 과학에서 기체 노출량의 단위로 씁니다. 가벼운 H₂는 같은 압력에서 N₂보다 √(28/2) ≈ 3.7배 자주 부딪칩니다. CVD·ALD 공정에서 전구체 펄스 길이를 정할 때도 같은 계산을 합니다."
          : "At 1 bar the surface is covered in nanoseconds, at 10⁻⁶ Torr (ordinary high vacuum) in about a second, and only at 10⁻¹⁰ Torr (ultra-high vacuum) does it stay clean for hours. The exposure that gives one monolayer per second, 10⁻⁶ Torr·s, is called 1 Langmuir (L) and is the surface-science unit of gas exposure. Light H₂ hits √(28/2) ≈ 3.7 times as often as N₂ at the same pressure. The same calculation sets precursor pulse lengths in CVD and ALD."}
      </Note>
    </Card>
  );
}

function PhysChemCard({ isKo }) {
  const rows = isKo ? [
    ["결합의 종류", "van der Waals (분산력)", "화학 결합 (공유·이온)"],
    ["흡착 엔탈피", "약 −20 kJ/mol (응축 엔탈피 정도)", "약 −200 kJ/mol (수백 kJ/mol)"],
    ["층수", "다층 가능 (BET)", "단일층까지"],
    ["선택성", "거의 없음", "표면·분자에 따라 큼"],
    ["분자 구조", "그대로 유지", "끊어지거나(해리) 재배열"],
    ["활성화 에너지", "거의 0, 빠름", "있을 수 있음 (활성화 흡착)"],
    ["활용", "BET 표면적, 기체 분리, 저장", "촉매 반응의 첫 단계, 피독"],
  ] : [
    ["Interaction", "van der Waals (dispersion)", "chemical bond (covalent, ionic)"],
    ["Adsorption enthalpy", "about −20 kJ/mol (like condensation)", "about −200 kJ/mol (hundreds of kJ/mol)"],
    ["Layers", "multilayers possible (BET)", "up to a monolayer"],
    ["Selectivity", "little", "strongly surface- and molecule-dependent"],
    ["Molecular structure", "preserved", "broken (dissociation) or rearranged"],
    ["Activation energy", "about zero, fast", "may be present (activated adsorption)"],
    ["Uses", "BET surface area, gas separation, storage", "first step of catalysis, poisoning"],
  ];
  return (
    <Card>
      <Hd>{isKo ? "물리 흡착과 화학 흡착, 그리고 '흡착은 왜 늘 발열일까'" : "Physisorption, chemisorption, and why adsorption is always exothermic"}</Hd>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
          <thead><tr>{(isKo ? ["", "물리 흡착", "화학 흡착"] : ["", "Physisorption", "Chemisorption"]).map((h, i) => (
            <th key={i} style={{ textAlign: "left", padding: "8px 10px", borderBottom: `1px solid ${C.border}`, color: C.accentSoft }}>{h}</th>))}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={{ padding: "7px 10px", borderBottom: `1px solid ${C.border}55`, color: j === 0 ? C.textDim : C.text }}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <Eq>ΔG_ads = ΔH_ads − TΔS_ads &lt; 0 {isKo ? "(저절로 일어남)" : "(spontaneous)"},   ΔS_ads &lt; 0 {isKo ? "(병진 자유도 상실)" : "(translational freedom lost)"}   ⇒   ΔH_ads &lt; 0</Eq>
      <Note>
        {isKo
          ? "기체 분자가 표면에 붙으면 3차원으로 날아다니던 자유를 잃으므로 엔트로피가 줄어듭니다. 그런데도 흡착이 저절로 일어나려면 −TΔS의 손해를 ΔH가 갚아야 하므로, 흡착은 거의 언제나 발열입니다. 그래서 온도를 올리면 덮임률이 줄고(Le Chatelier), 흡착탑의 재생은 가열(TSA)이나 감압(PSA)으로 합니다. 예외는 H₂가 해리하면서 원자 둘의 자유도가 늘어나는 일부 경우뿐입니다."
          : "A molecule that sticks loses its freedom to fly in three dimensions, so the entropy falls. For adsorption still to be spontaneous, ΔH must pay for the −TΔS penalty, so adsorption is almost always exothermic. Raising the temperature therefore lowers the coverage (Le Chatelier), and adsorption columns are regenerated by heating (TSA) or by lowering the pressure (PSA). The rare exceptions involve dissociation, such as H₂ splitting into two atoms that gain freedom."}
      </Note>
    </Card>
  );
}

function LangmuirDerivCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "Langmuir 등온선: 빈자리와 찬자리의 동적 평형" : "The Langmuir isotherm: dynamic equilibrium between empty and filled sites"}</Hd>
      <Note>
        {isKo
          ? "흡착 등온선은 일정 온도에서 덮임률 θ(또는 흡착량 V)와 압력 p의 관계입니다. Langmuir(1918)는 세 가지를 가정했습니다. ① 단일층까지만 흡착한다. ② 모든 자리는 똑같다. ③ 이웃 자리가 찼는지와 무관하게 흡착한다(흡착 분자끼리 상호작용 없음). 자리 수를 N, 덮임률을 θ = V/V∞라 하면 A(g) + M(표면) ⇌ AM의 정방향·역방향 속도는 다음과 같습니다."
          : "An adsorption isotherm is the relation between coverage θ (or adsorbed amount V) and pressure p at constant temperature. Langmuir (1918) assumed: (1) adsorption stops at a monolayer; (2) all sites are equivalent; (3) adsorption at a site does not depend on whether neighbours are occupied (no interactions between adsorbed molecules). With N sites and coverage θ = V/V∞, the forward and reverse rates of A(g) + M(surface) ⇌ AM are"}
      </Note>
      <Eq>dθ/dt = k_a p N(1 − θ)   {isKo ? "(빈자리 × 충돌)" : "(empty sites × collisions)"},     dθ/dt = −k_d N θ   {isKo ? "(찬자리에서 떨어짐)" : "(departures from filled sites)"}</Eq>
      <Eq>{isKo ? "평형:" : "Equilibrium:"}  k_a p (1 − θ) = k_d θ   →   θ = Kp/(1 + Kp),   K = k_a/k_d</Eq>
      <Note>
        {isKo
          ? "낮은 압력(Kp ≪ 1)에서는 θ ≈ Kp로 Henry 법칙처럼 직선이고, 높은 압력(Kp ≫ 1)에서는 θ → 1로 포화합니다. 분자가 붙으면서 둘로 쪼개지면(해리 흡착, 예: H₂ → 2H*) 빈자리 두 개가 필요하고 떨어질 때도 원자 둘이 만나야 합니다."
          : "At low pressure (Kp ≪ 1), θ ≈ Kp, a straight line like Henry's law; at high pressure (Kp ≫ 1), θ → 1 and the surface saturates. If the molecule splits on adsorption (dissociative adsorption, e.g. H₂ → 2H*), two empty sites are needed, and two atoms must meet to desorb."}
      </Note>
      <Eq>k_a p [N(1 − θ)]² = k_d (Nθ)²   →   θ = (Kp)^(1/2)/(1 + (Kp)^(1/2))</Eq>
      <HdSub>{isKo ? "실험 데이터를 직선으로: 선형화" : "Turning data into a straight line"}</HdSub>
      <Eq>θ = V/V∞ = Kp/(1 + Kp)   →   p/V = p/V∞ + 1/(K V∞)</Eq>
      <Note>
        {isKo
          ? "p/V를 p에 대해 그리면 기울기 1/V∞, 절편 1/(KV∞)인 직선이 됩니다. 기울기에서 단일층 용량 V∞, 기울기/절편에서 K를 얻습니다. 해리 흡착이면 p^(1/2)에 대해 그려야 직선이 되므로, 어느 그래프가 직선인지로 해리 여부를 판별할 수 있습니다."
          : "Plotting p/V against p gives a straight line of slope 1/V∞ and intercept 1/(KV∞): the slope gives the monolayer capacity V∞ and slope/intercept gives K. For dissociative adsorption the plot must be made against p^(1/2) to be straight, so which plot is linear tells whether the molecule dissociates."}
      </Note>
    </Card>
  );
}

const CO_P = [13.3, 26.7, 40.0, 53.3, 66.7, 80.0, 93.3];
const CO_V = [10.2, 18.6, 25.5, 31.5, 36.9, 41.6, 46.1];
function LangmuirLab({ isKo }) {
  const [K, setK] = useState(0.0075);
  const [diss, setDiss] = useState(false);
  const fit = linfit(CO_P, CO_P.map((p, i) => p / CO_V[i]));
  const Vinf = 1 / fit.slope, Kfit = fit.slope / fit.icpt;
  const W = 380, Ht = 270, pad = 46;
  const s1 = plotScale(0, 100, 0, 2.2, W, Ht, pad);
  const s2 = plotScale(0, 100, 0, 1.0, W, Ht, pad);
  const th = p => { const x = diss ? Math.sqrt(K * p) : K * p; return x / (1 + x); };
  const curve = []; for (let p = 0; p <= 100; p += 0.5) curve.push([p, th(p)]);
  const ref = []; for (let p = 0; p <= 100; p += 0.5) ref.push([p, Kfit * p / (1 + Kfit * p)]);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑨ CO/숯 데이터(273 K)를 Langmuir 직선으로" : "Lab ⑨ CO on charcoal (273 K) as a Langmuir straight line"}</Hd>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <svg viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <Axes W={W} Ht={Ht} pad={pad} xlabel="p (kPa)" ylabel="p/V (kPa cm⁻³)" />
          {[0, 50, 100].map(v => <text key={v} x={s1.X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
          {[0, 1, 2].map(v => <text key={v} x={pad - 6} y={s1.Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
          <line x1={s1.X(0)} y1={s1.Y(fit.icpt)} x2={s1.X(100)} y2={s1.Y(fit.icpt + 100 * fit.slope)} stroke={C.accent} strokeWidth={1.8} />
          {CO_P.map((p, i) => <circle key={i} cx={s1.X(p)} cy={s1.Y(p / CO_V[i])} r={4.5} fill="#fde047" />)}
        </svg>
        <svg viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <Axes W={W} Ht={Ht} pad={pad} xlabel="p (kPa)" ylabel="θ" />
          {[0, 50, 100].map(v => <text key={v} x={s2.X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
          {[0, 0.5, 1].map(v => <text key={v} x={pad - 6} y={s2.Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
          <path d={pathOf(ref, s2.X, s2.Y)} fill="none" stroke={C.accent} strokeWidth={1.4} strokeDasharray="5 4" />
          <path d={pathOf(curve, s2.X, s2.Y)} fill="none" stroke={C.pink} strokeWidth={2.2} />
          {CO_P.map((p, i) => <circle key={i} cx={s2.X(p)} cy={s2.Y(CO_V[i] / Vinf)} r={4.5} fill="#fde047" />)}
        </svg>
      </div>
      <StatGrid>
        <Stat label={isKo ? "기울기 = 1/V∞" : "Slope = 1/V∞"} value={`${fit.slope.toFixed(5)} cm⁻³`} color={C.accent} />
        <Stat label={isKo ? "절편 = 1/(KV∞)" : "Intercept = 1/(KV∞)"} value={`${fit.icpt.toFixed(3)} kPa cm⁻³`} color={C.accent} />
        <Stat label="R²" value={fit.r2.toFixed(5)} color={C.ok} />
        <Stat label="V∞" value={`${Vinf.toFixed(1)} cm³`} color={C.ok} />
        <Stat label="K" value={`${Kfit.toExponential(2)} kPa⁻¹`} color={C.ok} />
        <Stat label={isKo ? "80 kPa에서 θ" : "θ at 80 kPa"} value={(41.6 / Vinf).toFixed(3)} color={C.amber} />
      </StatGrid>
      <Row>
        <Slider label={isKo ? "분홍 곡선의 K" : "K of the pink curve"} value={K} min={0.0005} max={0.1} step={0.0005} onChange={setK} unit=" kPa⁻¹" fmt={v => v.toFixed(4)} />
        <button onClick={() => setDiss(!diss)} style={btnStyle(diss)}>{isKo ? "해리 흡착 θ = √(Kp)/(1 + √(Kp))" : "dissociative θ = √(Kp)/(1 + √(Kp))"}</button>
      </Row>
      <Note>
        {isKo
          ? "일곱 점이 직선 위에 잘 놓이므로(R² = 0.998) Langmuir 모형이 이 데이터를 잘 설명합니다. V∞ = 111 cm³, K = 7.5×10⁻³ kPa⁻¹이고, 80 kPa에서도 표면의 약 38%만 덮여 있습니다. 오른쪽의 분홍 곡선으로 K를 바꿔 보면 K가 클수록(결합이 셀수록) 낮은 압력에서 빨리 포화합니다. 해리 흡착 단추를 누르면 낮은 압력에서 θ가 √p로 훨씬 가파르게 오릅니다."
          : "The seven points lie on a line (R² = 0.998), so the Langmuir model describes these data well: V∞ = 111 cm³ and K = 7.5×10⁻³ kPa⁻¹, and even at 80 kPa only about 38% of the surface is covered. Vary K for the pink curve on the right: a larger K (stronger binding) saturates at lower pressure. With the dissociative button, θ rises much more steeply at low pressure, as √p."}
      </Note>
    </Card>
  );
}

const ISO_T = [200, 210, 220, 230, 240, 250];
const ISO_P = [4.00, 4.95, 6.03, 7.20, 8.47, 9.85];
function IsostericLab({ isKo }) {
  const fit = linfit(ISO_T.map(t => 1 / t), ISO_P.map(Math.log));
  const dH = fit.slope * RG / 1000;
  const W = 560, Ht = 260, pad = 56;
  const x0 = 1 / 255, x1 = 1 / 195;
  const { X, Y } = plotScale(x0, x1, 1.2, 2.4, W, Ht, pad);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑩ 같은 덮임률에서 온도를 바꾸면: 등량 흡착 엔탈피" : "Lab ⑩ Changing temperature at fixed coverage: the isosteric enthalpy"}</Hd>
      <Note>
        {isKo
          ? "Langmuir의 K는 흡착 평형 상수이므로 van 't Hoff 식(Gibbs–Helmholtz 식에서 유도)을 따릅니다. 덮임률 θ를 고정하면 Kp가 일정하므로 ln K = 상수 − ln p이고, 다음이 성립합니다."
          : "Langmuir's K is an adsorption equilibrium constant, so it obeys the van 't Hoff equation (derived from the Gibbs–Helmholtz equation). At fixed coverage θ the product Kp is constant, so ln K = const − ln p, which gives"}
      </Note>
      <Eq>(∂ ln K/∂(1/T))_θ = −Δ_adsH°/R   {isKo ? "그리고" : "and"}   ln K = c − ln p   →   (∂ ln p/∂(1/T))_θ = Δ_adsH°/R</Eq>
      <Note>
        {isKo
          ? "그래서 같은 양(10.0 cm³)을 흡착시키는 데 필요한 압력을 여러 온도에서 재고, ln p를 1/T에 대해 그리면 기울기가 Δ_adsH°/R입니다. 같은 덮임률(iso-steric)에서 얻은 값이라 '등량 엔탈피'라 부릅니다."
          : "So measure the pressure needed to adsorb the same amount (10.0 cm³) at several temperatures and plot ln p against 1/T: the slope is Δ_adsH°/R. Because it is taken at constant coverage (iso-steric), it is called the isosteric enthalpy."}
      </Note>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "1/T (10⁻³ K⁻¹)" : "1/T (10⁻³ K⁻¹)"} ylabel="ln(p/kPa)" />
        {[4.0, 4.4, 4.8].map(v => <text key={v} x={X(v / 1000)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v.toFixed(1)}</text>)}
        {[1.4, 1.8, 2.2].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v.toFixed(1)}</text>)}
        <line x1={X(x0)} y1={Y(fit.icpt + fit.slope * x0)} x2={X(x1)} y2={Y(fit.icpt + fit.slope * x1)} stroke={C.accent} strokeWidth={1.8} />
        {ISO_T.map((t, i) => <circle key={i} cx={X(1 / t)} cy={Y(Math.log(ISO_P[i]))} r={4.5} fill="#fde047" />)}
      </svg>
      <StatGrid>
        <Stat label={isKo ? "기울기" : "Slope"} value={`${fit.slope.toFixed(1)} K`} color={C.accent} />
        <Stat label="R²" value={fit.r2.toFixed(5)} color={C.ok} />
        <Stat label="Δ_adsH°" value={`${dH.toFixed(2)} kJ mol⁻¹`} color={C.ok} />
      </StatGrid>
      <Note>
        {isKo
          ? "−7.5 kJ/mol은 CO의 응축 엔탈피(약 −6 kJ/mol)와 비슷한 크기라, 숯 위의 CO는 물리 흡착임을 알 수 있습니다. 실제 표면에서는 덮임률이 커질수록 등량 엔탈피의 크기가 줄어드는 경우가 많은데, 강한 자리부터 먼저 차기 때문입니다. 이것이 Langmuir 가정 ②가 깨지는 지점이고, 다음 탭의 Temkin·Freundlich 등온선으로 이어집니다."
          : "−7.5 kJ/mol is about the size of the condensation enthalpy of CO (about −6 kJ/mol), so CO on charcoal is physisorbed. On real surfaces the magnitude of the isosteric enthalpy often falls as coverage rises, because the strongest sites fill first. This is where Langmuir assumption (2) breaks down, leading to the Temkin and Freundlich isotherms of the next tab."}
      </Note>
    </Card>
  );
}

function TechniquesCard({ isKo }) {
  const rows = isKo ? [
    ["STM (주사 터널링 현미경)", "탐침–표면 터널링 전류 ∝ e^(−2κd)", "원자 하나하나의 배열, Si(111) 7×7 재구성", "전도성 표면"],
    ["AFM (원자간력 현미경)", "탐침에 걸리는 힘", "절연체·고분자·나노입자 형상", "어떤 표면이든"],
    ["XPS (ESCA)", "X선 → 광전자, E_B = hν − E_k − φ", "원소 조성, 산화 상태", "깊이 1–10 nm"],
    ["UPS", "자외선 → 가전자 광전자", "가전자띠, 일함수", "가장 바깥층"],
    ["AES (Auger)", "내각 구멍 → Auger 전자", "원소 지도 (고분해능)", "0.5–7.5 nm"],
    ["SEM / EDS (EPMA)", "전자빔 → 2차 전자 / 특성 X선", "형상 / 원소 분석", "2차 전자 < 10 nm, X선 1–3 µm"],
    ["LEED", "저에너지 전자 회절 (13주차의 2D 역격자)", "표면 주기성, 재구성", "몇 개 층"],
    ["SPR", "금속 박막의 표면 플라즈몬 공명각 변화", "흡착량과 흡착 속도 실시간", "바이오센서, 흡착 동역학"],
  ] : [
    ["STM (scanning tunnelling microscopy)", "tip–surface tunnelling current ∝ e^(−2κd)", "individual atoms; the Si(111) 7×7 reconstruction", "conducting surfaces"],
    ["AFM (atomic force microscopy)", "force on the tip", "shape of insulators, polymers, nanoparticles", "any surface"],
    ["XPS (ESCA)", "X-ray → photoelectron, E_B = hν − E_k − φ", "composition, oxidation state", "1–10 nm deep"],
    ["UPS", "UV → valence photoelectrons", "valence band, work function", "outermost layer"],
    ["AES (Auger)", "core hole → Auger electron", "high-resolution elemental maps", "0.5–7.5 nm"],
    ["SEM / EDS (EPMA)", "electron beam → secondary electrons / characteristic X-rays", "topography / elemental analysis", "secondary < 10 nm, X-rays 1–3 µm"],
    ["LEED", "low-energy electron diffraction (the 2D reciprocal lattice of Week 13)", "surface periodicity, reconstruction", "a few layers"],
    ["SPR", "shift of the surface-plasmon resonance angle of a metal film", "amount and rate of adsorption in real time", "biosensors, adsorption kinetics"],
  ];
  return (
    <Card>
      <Hd>{isKo ? "표면을 보는 눈: 실험 기법 한눈에" : "Eyes on the surface: experimental techniques at a glance"}</Hd>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
          <thead><tr>{(isKo ? ["기법", "원리", "알아내는 것", "깊이·대상"] : ["Technique", "Principle", "What it tells", "Depth / target"]).map(h => (
            <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: `1px solid ${C.border}`, color: C.accentSoft }}>{h}</th>))}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={{ padding: "7px 10px", borderBottom: `1px solid ${C.border}55`, lineHeight: 1.5, color: j === 0 ? C.accent : C.text }}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <Note>
        {isKo
          ? "전자 분광법이 '표면'에 민감한 이유는 수십–수백 eV 전자가 고체 속에서 몇 nm만 가도 비탄성 산란으로 에너지를 잃기 때문입니다. 깊은 곳에서 나온 전자는 원래 에너지를 간직한 채 빠져나오지 못합니다."
          : "Electron spectroscopies are surface-sensitive because electrons of tens to hundreds of eV lose energy by inelastic scattering within a few nm of solid; electrons from deeper down cannot escape with their original energy."}
      </Note>
    </Card>
  );
}

// =============================================================
// 5) BET, REAL SURFACES & RATES OF ADSORPTION/DESORPTION
// =============================================================
function IsothermTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <BETDerivCard isKo={isKo} />
      <BETLab isKo={isKo} />
      <RealSurfaceLab isKo={isKo} />
      <PrecursorLab isKo={isKo} />
      <TPDLab isKo={isKo} />
      <DiffusionLab isKo={isKo} />
    </div>
  );
}

function BETDerivCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "BET 등온선: 층 위에 층이 쌓일 때" : "The BET isotherm: when layers pile on layers"}</Hd>
      <Note>
        {isKo
          ? "Langmuir 모형은 단일층에서 멈추지만, 물리 흡착에서는 첫 층 위에 둘째·셋째 층이 쌓이고, 증기압 p*에 가까워지면 결국 액체처럼 응축합니다. Brunauer, Emmett, Teller(1938)는 표면을 '분자가 i층 쌓인 부분의 넓이 s_i'로 나누고, 각 층에 Langmuir식 평형을 적용했습니다. 첫 층은 표면과 직접 닿아 탈착 에너지가 E₁이고, 둘째 층부터는 분자 위의 분자이므로 응축 에너지 E_L로 모두 같다고 둡니다."
          : "The Langmuir model stops at a monolayer, but in physisorption second and third layers pile on the first, and near the vapour pressure p* the adsorbate finally condenses like a liquid. Brunauer, Emmett and Teller (1938) divided the surface into areas s_i covered by i layers and applied a Langmuir-type equilibrium to each layer. The first layer touches the surface and has desorption energy E₁; from the second layer on, molecules sit on molecules, so all share the condensation energy E_L."}
      </Note>
      <Eq>s₁/s₀ = (a₁/b₁) p e^(E₁/RT) ≡ c x,     s_i/s_(i−1) = (a/b) p e^(E_L/RT) ≡ x = p/p*   (i ≥ 2)</Eq>
      <Eq>c = (a₁b/ab₁) e^((E₁ − E_L)/RT) ≈ e^((E₁ − E_L)/RT)   {isKo ? "(첫 층이 얼마나 더 유리한가)" : "(how much the first layer is favoured)"}</Eq>
      <Note>
        {isKo
          ? "그러면 s_i = c x^i s₀ (i ≥ 1)입니다. 전체 넓이와 흡착량은 기하 급수 두 개로 정리됩니다. Σ x^i = x/(1 − x), Σ i x^i = x/(1 − x)²을 쓰면"
          : "So s_i = c x^i s₀ for i ≥ 1. The total area and the adsorbed amount reduce to two geometric series; with Σ x^i = x/(1 − x) and Σ i x^i = x/(1 − x)²,"}
      </Note>
      <Eq>A = s₀ + Σ s_i = s₀[1 + cx/(1 − x)],     V/V_mon = Σ i s_i / A = cx / {"{"}(1 − x)[1 − x + cx]{"}"}</Eq>
      <Eq>{isKo ? "선형화:" : "Linearized:"}   x / [(1 − x)V] = 1/(cV_mon) + [(c − 1)/(cV_mon)] x,   x = p/p*</Eq>
      <Note>
        {isKo
          ? "x/[(1 − x)V]를 x에 대해 그리면 기울기 S = (c − 1)/(cV_mon), 절편 I = 1/(cV_mon)인 직선이고, V_mon = 1/(S + I), c = 1 + S/I입니다. V_mon(1 atm, 273 K 기준 부피)을 분자 수로 바꾸고 분자 하나의 단면적(N₂는 0.162 nm²)을 곱하면 표면적이 나옵니다. 이 'BET 표면적'은 촉매·활성탄·MOF·배터리 소재의 사양서에 빠지지 않는 숫자입니다. 보통 0.05 < x < 0.3 범위에서 직선이 잘 맞습니다."
          : "Plotting x/[(1 − x)V] against x gives a line of slope S = (c − 1)/(cV_mon) and intercept I = 1/(cV_mon), so V_mon = 1/(S + I) and c = 1 + S/I. Converting V_mon (volume at 1 atm, 273 K) to a number of molecules and multiplying by the cross-section of one molecule (0.162 nm² for N₂) gives the surface area. This 'BET surface area' appears on the data sheet of every catalyst, activated carbon, MOF and battery material. The line usually fits well for 0.05 < x < 0.3."}
      </Note>
    </Card>
  );
}

const BET_P = [0.160, 1.87, 6.11, 11.67, 17.02, 21.92, 27.29];
const BET_V = [601, 720, 822, 935, 1046, 1146, 1254];
function BETLab({ isKo }) {
  const [c, setC] = useState(100);
  const [mass, setMass] = useState(1.0);
  const ps = 76.0;
  const zs = BET_P.map(p => p / ps);
  const fit = linfit(zs, zs.map((z, i) => z / ((1 - z) * BET_V[i])));
  const cf = 1 + fit.slope / fit.icpt, Vm = 1 / (fit.slope + fit.icpt);
  const nmon = 101325 * Vm * 1e-9 / (RG * 273.15);
  const area = nmon * NA * 0.162e-18;
  const W = 380, Ht = 270, pad = 50;
  const s1 = plotScale(0, 0.4, 0, 6e-4, W, Ht, pad);
  const s2 = plotScale(0, 0.95, 0, 6, W, Ht, pad);
  const bet = (x, cc) => cc * x / ((1 - x) * (1 - x + cc * x));
  const curves = [1, 10, 100, 1000].map(cc => { const p = []; for (let x = 0.002; x < 0.95; x += 0.004) p.push([x, Math.min(6, bet(x, cc))]); return [cc, p]; });
  const mine = []; for (let x = 0.002; x < 0.95; x += 0.004) mine.push([x, Math.min(6, bet(x, c))]);
  const lang1 = []; for (let x = 0.002; x < 0.95; x += 0.004) lang1.push([x, c * x / (1 + c * x)]);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑪ N₂/루타일(TiO₂, 75 K) BET 분석과 c의 의미" : "Lab ⑪ BET analysis of N₂ on rutile (TiO₂, 75 K) and the meaning of c"}</Hd>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <svg viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <Axes W={W} Ht={Ht} pad={pad} xlabel="x = p/p*" ylabel="x/[(1 − x)V] (mm⁻³)" />
          {[0, 0.2, 0.4].map(v => <text key={v} x={s1.X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
          {[0, 2e-4, 4e-4, 6e-4].map(v => <text key={v} x={pad - 6} y={s1.Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{(v * 1e4).toFixed(0)}</text>)}
          <text x={pad + 2} y={pad - 2} fill={C.textDim} fontSize={10}>×10⁻⁴</text>
          <line x1={s1.X(0)} y1={s1.Y(fit.icpt)} x2={s1.X(0.4)} y2={s1.Y(fit.icpt + 0.4 * fit.slope)} stroke={C.accent} strokeWidth={1.8} />
          {zs.map((z, i) => <circle key={i} cx={s1.X(z)} cy={s1.Y(z / ((1 - z) * BET_V[i]))} r={4.5} fill="#fde047" />)}
        </svg>
        <svg viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <Axes W={W} Ht={Ht} pad={pad} xlabel="x = p/p*" ylabel="V/V_mon" />
          {[0, 0.5, 0.9].map(v => <text key={v} x={s2.X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
          {[0, 1, 2, 4, 6].map(v => <text key={v} x={pad - 6} y={s2.Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
          <line x1={pad} x2={W - pad} y1={s2.Y(1)} y2={s2.Y(1)} stroke="#475569" strokeDasharray="3 3" />
          {curves.map(([cc, p]) => <path key={cc} d={pathOf(p, s2.X, s2.Y)} fill="none" stroke={C.textDim} strokeWidth={0.9} />)}
          <path d={pathOf(lang1, s2.X, s2.Y)} fill="none" stroke={C.sky} strokeWidth={1.4} strokeDasharray="5 4" />
          <path d={pathOf(mine, s2.X, s2.Y)} fill="none" stroke={C.pink} strokeWidth={2.4} />
          <text x={W - pad} y={pad} fill={C.pink} fontSize={11} textAnchor="end">BET c = {c}</text>
          <text x={W - pad} y={pad + 15} fill={C.sky} fontSize={11} textAnchor="end">{isKo ? "Langmuir (같은 c)" : "Langmuir (same c)"}</text>
        </svg>
      </div>
      <Row>
        <Slider label={isKo ? "BET 상수 c" : "BET constant c"} value={c} min={1} max={1000} step={1} onChange={setC} fmt={v => v.toFixed(0)} />
        <Slider label={isKo ? "시료 질량" : "Sample mass"} value={mass} min={0.1} max={5} step={0.1} onChange={setMass} unit=" g" fmt={v => v.toFixed(1)} />
      </Row>
      <StatGrid>
        <Stat label={isKo ? "기울기 S / 절편 I" : "Slope S / intercept I"} value={`${fit.slope.toExponential(3)} / ${fit.icpt.toExponential(3)}`} color={C.accent} />
        <Stat label="R²" value={fit.r2.toFixed(5)} color={C.ok} />
        <Stat label={isKo ? "c = 1 + S/I" : "c = 1 + S/I"} value={cf.toFixed(0)} color={C.ok} />
        <Stat label="V_mon = 1/(S + I)" value={`${Vm.toFixed(0)} mm³`} color={C.ok} />
        <Stat label={isKo ? "표면적 (N₂ 0.162 nm²)" : "Surface area (N₂ 0.162 nm²)"} value={`${area.toFixed(2)} m² → ${(area / mass).toFixed(2)} m² g⁻¹`} color={C.amber} />
        <Stat label="E₁ − E_L = RT ln c" value={`${(RG * 75 * Math.log(cf) / 1000).toFixed(2)} kJ mol⁻¹`} color={C.amber} />
      </StatGrid>
      <Note>
        {isKo
          ? "최소제곱으로 맞추면 c ≈ 300, V_mon ≈ 814 mm³입니다(교재는 그래프에서 읽어 c = 310, V_mon = 811 mm³). 오른쪽 그림에서 c가 클수록 첫 층이 먼저 뚜렷하게 차서 '무릎'(B점)이 생기고, 그 뒤 x → 1에서 다층 응축으로 치솟습니다(IUPAC II형). c ≈ 1이면 무릎이 사라져 첫 층과 응축의 구분이 없어집니다(III형). 루타일의 c ≈ 300은 첫 층이 응축보다 RT ln c ≈ 3.6 kJ/mol 더 안정함을 뜻합니다. 시료 질량을 넣으면 비표면적(m²/g)으로 바뀝니다: 실제 촉매 담체는 수십–수백 m²/g, 활성탄과 MOF는 1000 m²/g을 넘습니다."
          : "A least-squares fit gives c ≈ 300 and V_mon ≈ 814 mm³ (the textbook, reading a graph, gives c = 310 and V_mon = 811 mm³). On the right, a larger c fills the first layer distinctly first and forms a 'knee' (point B), after which multilayer condensation shoots up as x → 1 (IUPAC type II). With c ≈ 1 the knee disappears and first-layer filling merges with condensation (type III). The c ≈ 300 of rutile means the first layer is RT ln c ≈ 3.6 kJ/mol more stable than condensation. Enter the sample mass to get the specific area (m²/g): real catalyst supports have tens to hundreds of m²/g, activated carbons and MOFs over 1000 m²/g."}
      </Note>
    </Card>
  );
}

function RealSurfaceLab({ isKo }) {
  const [n, setN] = useState(2.5);
  const [bT, setBT] = useState(0.15);
  const W = 620, Ht = 280, pad = 50;
  const { X, Y } = plotScale(-3, 2, 0, 1.4, W, Ht, pad);
  const L = [], F = [], Tm = [];
  for (let lx = -3; lx <= 2; lx += 0.02) {
    const x = Math.pow(10, lx);
    L.push([lx, x / (1 + x)]);
    F.push([lx, Math.min(1.4, 0.5 * Math.pow(x, 1 / n))]);
    const t = bT * Math.log(20 * x);
    if (t >= 0) Tm.push([lx, Math.min(1.4, t)]);
  }
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑫ 실제 표면: Freundlich와 Temkin 등온선" : "Lab ⑫ Real surfaces: the Freundlich and Temkin isotherms"}</Hd>
      <Note>
        {isKo
          ? "실제 표면은 고르지 않습니다. 계단, 모서리, 결함, 서로 다른 결정면이 섞여 흡착 에너지가 넓게 분포하고, 흡착 분자끼리도 밀어내거나 끌어당깁니다. 그래서 흡착열이 덮임률에 따라 변합니다. 두 가지 대표적 보정이 있습니다."
          : "Real surfaces are not uniform. Steps, edges, defects and different crystal facets spread the adsorption energies widely, and adsorbed molecules push or pull each other, so the heat of adsorption changes with coverage. There are two classic corrections."}
      </Note>
      <HdSub>{isKo ? "Freundlich: 자리마다 흡착 에너지가 다르다 (지수 분포)" : "Freundlich: each site has its own adsorption energy (exponential distribution)"}</HdSub>
      <Eq>θ = ∫ θ_L(E) g(E) dE,   θ_L(E) = b(E)c/(1 + b(E)c),   b(E) = b₀ e^(E/k_BT),   g(E) ∝ e^(−E/E_m)   →   θ ∝ c^(1/n),   1/n = k_BT/E_m</Eq>
      <Eq>q_e = K_F C_e^(1/n)   →   log q_e = log K_F + (1/n) log C_e</Eq>
      <Note>
        {isKo
          ? "각 자리는 Langmuir를 따르지만 자리마다 에너지가 다르고, 에너지가 큰 자리가 지수적으로 드물다고 하면 평균이 거듭제곱 법칙이 됩니다. 1/n < 1이면 흔한 '쉬운 흡착'(위로 볼록), 1/n이 작을수록 표면이 더 불균일합니다. 활성탄의 유기 오염물·중금속 제거, 금속 산화물 나노입자의 염료 흡착, 제올라이트의 기체 흡착에 널리 씁니다. 다만 포화가 없어서 높은 농도에서는 맞지 않습니다."
          : "Each site obeys Langmuir, but energies differ from site to site; if high-energy sites are exponentially rare, the average becomes a power law. 1/n < 1 is the usual 'favourable' (concave) shape, and a smaller 1/n means a more heterogeneous surface. It is widely used for organic pollutants and heavy metals on activated carbon, dyes on metal-oxide nanoparticles, and gases on zeolites, but it has no saturation and fails at high concentrations."}
      </Note>
      <HdSub>{isKo ? "Temkin: 흡착열이 덮임률에 따라 직선으로 줄어든다" : "Temkin: the heat of adsorption falls linearly with coverage"}</HdSub>
      <Eq>ΔH_ads(θ) = ΔH₀(1 − αθ)   →   K(θ) = K₀ e^(−γθ)   →   θ ≈ (RT/b_T) ln(A C)</Eq>
      <Note>
        {isKo
          ? "Langmuir 식 θ/(1 − θ) = K(θ)C에 K(θ) = K₀e^(−γθ)를 넣고 중간 덮임률에서 θ/(1 − θ)의 변화가 지수 인자보다 훨씬 느리다고 보면 θ가 ln C에 비례합니다. 금속·금속 산화물 촉매 위의 CO·H·NH₃ 화학 흡착, 고체산 위의 NH₃, 전극 위의 전기화학 흡착에서 잘 맞습니다. Haber–Bosch 반응 속도를 분석한 Temkin–Pyzhev 식이 이 등온선에서 나왔습니다."
          : "Insert K(θ) = K₀e^(−γθ) into the Langmuir form θ/(1 − θ) = K(θ)C and note that at intermediate coverage θ/(1 − θ) varies far more slowly than the exponential factor: θ becomes proportional to ln C. It fits chemisorption of CO, H and NH₃ on metal and metal-oxide catalysts, NH₃ on solid acids, and electrochemical adsorption on electrodes. The Temkin–Pyzhev rate law for the Haber–Bosch reaction came from this isotherm."}
      </Note>
      <Row>
        <Slider label="Freundlich n" value={n} min={1} max={6} step={0.1} onChange={setN} fmt={v => v.toFixed(1)} />
        <Slider label={isKo ? "Temkin RT/b_T" : "Temkin RT/b_T"} value={bT} min={0.05} max={0.3} step={0.01} onChange={setBT} fmt={v => v.toFixed(2)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "log₁₀(KC) (농도 또는 압력)" : "log₁₀(KC) (concentration or pressure)"} ylabel={isKo ? "덮임률 θ (상대)" : "coverage θ (relative)"} />
        {[-3, -2, -1, 0, 1, 2].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        {[0, 0.5, 1].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        <path d={pathOf(L, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.2} />
        <path d={pathOf(F, X, Y)} fill="none" stroke={C.amber} strokeWidth={2.2} />
        <path d={pathOf(Tm, X, Y)} fill="none" stroke={C.pink} strokeWidth={2.2} />
        <text x={pad + 8} y={pad - 14} fill={C.accent} fontSize={11}>Langmuir</text>
        <text x={pad + 90} y={pad - 14} fill={C.amber} fontSize={11}>Freundlich 0.5(KC)^(1/n)</text>
        <text x={pad + 290} y={pad - 14} fill={C.pink} fontSize={11}>Temkin (RT/b_T) ln(20KC)</text>
      </svg>
      <Note>
        {isKo
          ? "로그 가로축에서 Temkin은 직선, Freundlich는 지수 곡선(로그–로그에서 직선), Langmuir는 S자 모양입니다. 실험 데이터가 어느 그래프에서 직선이 되는지가 표면의 성격을 알려 줍니다."
          : "On a logarithmic axis Temkin is a straight line, Freundlich an exponential curve (straight on log–log axes) and Langmuir an S shape. Which plot makes the data straight tells you about the surface."}
      </Note>
    </Card>
  );
}

function PrecursorLab({ isKo }) {
  const [Ea, setEa] = useState(-10);
  const W = 620, Ht = 280, pad = 46;
  const { X, Y } = plotScale(0, 6, -110, 70, W, Ht, pad);
  // physisorption well (Morse-like) and chemisorption well, crossing gives the barrier
  const phys = z => 18 * (Math.exp(-2 * 1.6 * (z - 3.2)) - 2 * Math.exp(-1.6 * (z - 3.2)));
  const chem = z => 100 * (Math.exp(-2 * 2.0 * (z - 1.6)) - 2 * Math.exp(-2.0 * (z - 1.6))) + 200;
  // shift chem curve so the crossing energy equals Ea
  let shift = 0;
  {
    let lo = -400, hi = 400;
    for (let it = 0; it < 60; it++) {
      const mid = (lo + hi) / 2;
      let zc = 2.4, best = 1e9;
      for (let z = 1.2; z <= 4; z += 0.002) { const d = Math.abs(phys(z) - (chem(z) - 200 + mid)); if (d < best) { best = d; zc = z; } }
      const ec = phys(zc);
      if (ec > Ea) hi = mid; else lo = mid;
      shift = mid;
    }
  }
  const chemS = z => chem(z) - 200 + shift;
  const total = [], pc = [], cc = [];
  for (let z = 0.9; z <= 6; z += 0.01) {
    pc.push([z, Math.max(-110, Math.min(70, phys(z)))]);
    cc.push([z, Math.max(-110, Math.min(70, chemS(z)))]);
    total.push([z, Math.max(-110, Math.min(70, Math.min(phys(z), chemS(z))))]);
  }
  const Echem = -100 + shift;
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑬ 전구체 상태와 활성화 흡착: 퍼텐셜 에너지 곡선" : "Lab ⑬ The precursor state and activated adsorption: potential-energy curves"}</Hd>
      <Note>
        {isKo
          ? "분자가 표면에 다가오면 먼저 얕은 물리 흡착 우물(전구체 상태)에 걸립니다. 거기서 표면 위를 미끄러지다가, 물리 흡착 곡선과 화학 흡착 곡선이 만나는 지점을 넘으면 깊은 화학 흡착 우물로 떨어집니다. 교차점의 높이 E_a가 기체 에너지 기준(0)보다 낮으면 활성화 에너지 없이 흡착하고(부착 단계가 속도 결정), 높으면 활성화 흡착이 됩니다(활성화가 속도 결정)."
          : "A molecule approaching the surface is first caught in a shallow physisorption well (the precursor state). Skating over the surface, it drops into the deep chemisorption well once it passes the point where the physisorption and chemisorption curves cross. If the crossing height E_a lies below the gas-phase zero, adsorption needs no activation (sticking limits the rate); if above, adsorption is activated (activation limits the rate)."}
      </Note>
      <Row>
        <Slider label={isKo ? "교차점 높이 E_a" : "Crossing height E_a"} value={Ea} min={-12} max={40} step={1} onChange={setEa} unit=" kJ mol⁻¹" fmt={v => v.toFixed(0)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "표면에서의 거리 z (Å)" : "distance from the surface z (Å)"} ylabel={isKo ? "퍼텐셜 에너지 (kJ mol⁻¹)" : "potential energy (kJ mol⁻¹)"} />
        <line x1={pad} x2={W - pad} y1={Y(0)} y2={Y(0)} stroke="#475569" strokeDasharray="3 3" />
        {[-100, -50, 0, 50].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        {[1, 2, 3, 4, 5, 6].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        <path d={pathOf(pc, X, Y)} fill="none" stroke={C.sky} strokeWidth={1.2} strokeDasharray="5 4" />
        <path d={pathOf(cc, X, Y)} fill="none" stroke={C.pink} strokeWidth={1.2} strokeDasharray="5 4" />
        <path d={pathOf(total, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.6} />
        <text x={X(3.3)} y={Y(-18) + 16} fill={C.sky} fontSize={11}>{isKo ? "물리 흡착 (전구체)" : "physisorbed (precursor)"}</text>
        <text x={X(1.95)} y={Y(Echem) + 4} fill={C.pink} fontSize={11}>{isKo ? "화학 흡착" : "chemisorbed"}</text>
        <text x={W - pad} y={pad} fill={Ea > 0 ? C.amber : C.ok} fontSize={12} textAnchor="end">{Ea > 0 ? (isKo ? "활성화 흡착" : "activated adsorption") : (isKo ? "비활성화 흡착" : "non-activated adsorption")}</text>
      </svg>
      <StatGrid>
        <Stat label={isKo ? "흡착 활성화 에너지 E_ads" : "Adsorption activation E_ads"} value={`${Math.max(0, Ea).toFixed(0)} kJ mol⁻¹`} color={Ea > 0 ? C.amber : C.ok} />
        <Stat label={isKo ? "탈착 활성화 에너지 E_des" : "Desorption activation E_des"} value={`${(Math.max(0, Ea) - Echem).toFixed(0)} kJ mol⁻¹`} color={C.accent} />
      </StatGrid>
      <Note>
        {isKo
          ? "어느 경우든 탈착은 항상 활성화 과정입니다. 우물 바닥에서 기체 상태까지(활성화 흡착이면 교차점까지) 올라와야 하기 때문입니다: E_des = E_a − E_chem. 활성화가 없으면 E_des = |E_chem|입니다. 활성화 흡착이 있으면 흡착 속도는 온도에 따라 빠르게 늘고, 부착 확률 s = s₀(1 − θ)가 그 배경에 깔립니다."
          : "In either case desorption is always activated: the molecule must climb from the bottom of the well to the gas phase (or to the crossing point if adsorption is activated): E_des = E_a − E_chem, and without activation E_des = |E_chem|. With activated adsorption the adsorption rate rises steeply with temperature, on top of the sticking probability s = s₀(1 − θ)."}
      </Note>
    </Card>
  );
}

function tpdCurve(E, nu, beta, order, theta0) {
  const out = [];
  let th = theta0;
  const dT = 0.25;
  for (let T = 100; T <= 900; T += dT) {
    const r = nu * Math.pow(th, order) * Math.exp(-E / (KB_EV * T)) / beta;
    out.push([T, r]);
    th = Math.max(th - r * dT, 0);
  }
  return out;
}
function TPDLab({ isKo }) {
  const [E, setE] = useState(1.0);
  const [lognu, setLognu] = useState(13);
  const [beta, setBeta] = useState(10);
  const [order, setOrder] = useState(1);
  const nu = Math.pow(10, lognu);
  const covs = [1, 0.5, 0.25];
  const curves = covs.map(t0 => tpdCurve(E, nu, beta, order, t0));
  const peaks = curves.map(c => c.reduce((b, p) => (p[1] > b[1] ? p : b), [0, 0]));
  const ymax = Math.max(...peaks.map(p => p[1])) * 1.1 || 1;
  const W = 620, Ht = 280, pad = 50;
  const { X, Y } = plotScale(100, 900, 0, ymax, W, Ht, pad);
  const Tp = peaks[0][0];
  const Ered = KB_EV * Tp * (Math.log(nu * Tp / beta) - 3.64);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑭ 승온 탈착(TPD): 봉우리 온도로 결합 세기 읽기" : "Lab ⑭ Temperature-programmed desorption: reading binding strength from the peak temperature"}</Hd>
      <Note>
        {isKo
          ? "흡착된 표면을 일정한 속도 β = dT/dt로 가열하면서 떨어져 나오는 분자를 질량 분석기로 셉니다. 탈착 속도는 Polanyi–Wigner 식을 따릅니다. 온도가 오르면 지수 인자가 커져 속도가 늘다가, 표면에 남은 분자(θ)가 바닥나면 줄어들어 봉우리가 생깁니다."
          : "Heat an adsorbate-covered surface at a constant rate β = dT/dt and count the departing molecules with a mass spectrometer. The desorption rate follows the Polanyi–Wigner equation: as T rises the exponential grows and the rate increases, until the molecules left on the surface (θ) run out and the rate falls, producing a peak."}
      </Note>
      <Eq>r_des = −dθ/dt = ν θⁿ e^(−E_des/k_BT),   −dθ/dT = (ν/β) θⁿ e^(−E_des/k_BT)</Eq>
      <Eq>{isKo ? "1차, 봉우리 조건 d²θ/dT² = 0:" : "First order, peak condition d²θ/dT² = 0:"}  E_des/(k_B T_p²) = (ν/β) e^(−E_des/k_BT_p)   →   E_des ≈ k_BT_p[ln(νT_p/β) − 3.64]   {isKo ? "(Redhead)" : "(Redhead)"}</Eq>
      <Row>
        <Slider label="E_des" value={E} min={0.3} max={2.0} step={0.01} onChange={setE} fmt={v => `${v.toFixed(2)} eV (${(v * 96.485).toFixed(0)} kJ/mol)`} />
        <Slider label="log₁₀ ν" value={lognu} min={10} max={16} step={0.1} onChange={setLognu} fmt={v => v.toFixed(1)} />
        <Slider label="β" value={beta} min={0.5} max={100} step={0.5} onChange={setBeta} unit=" K/s" fmt={v => v.toFixed(1)} />
        <button onClick={() => setOrder(order === 1 ? 2 : 1)} style={btnStyle(order === 2)}>{isKo ? `${order}차 탈착 (바꾸기)` : `order ${order} (toggle)`}</button>
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "온도 T (K)" : "temperature T (K)"} ylabel={isKo ? "탈착 속도 −dθ/dT" : "desorption rate −dθ/dT"} />
        {[200, 400, 600, 800].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        {curves.map((c, i) => <path key={i} d={pathOf(c, X, Y)} fill="none" stroke={[C.accent, C.amber, C.pink][i]} strokeWidth={2} />)}
        {peaks.map((p, i) => <line key={i} x1={X(p[0])} x2={X(p[0])} y1={Y(0)} y2={Y(p[1])} stroke={[C.accent, C.amber, C.pink][i]} strokeDasharray="3 3" />)}
        {covs.map((t0, i) => <text key={i} x={W - pad} y={pad + i * 15} fill={[C.accent, C.amber, C.pink][i]} fontSize={11} textAnchor="end">θ₀ = {t0}: T_p = {peaks[i][0].toFixed(0)} K</text>)}
      </svg>
      <StatGrid>
        <Stat label={isKo ? "봉우리 온도 (θ₀ = 1)" : "Peak temperature (θ₀ = 1)"} value={`${Tp.toFixed(1)} K`} color={C.accent} />
        <Stat label={isKo ? "Redhead 추정" : "Redhead estimate"} value={`${Ered.toFixed(3)} eV`} color={C.ok} />
        <Stat label={isKo ? "300 K 체류 시간 τ = e^(E/k_BT)/ν" : "Residence time at 300 K, τ = e^(E/k_BT)/ν"} value={(() => { const t = Math.exp(E / (KB_EV * 300)) / nu; return t < 1 ? `${sci(t, 2)} s` : t < 3.15e7 ? `${sci(t, 2)} s` : `${sci(t / 3.15e7, 2)} yr`; })()} color={C.amber} />
      </StatGrid>
      <Note>
        {isKo
          ? "E_des를 키우면 봉우리가 오른쪽으로 갑니다: ν = 10¹³ s⁻¹, β = 10 K/s에서 1 eV(96 kJ/mol)는 약 385 K, 1.5 eV는 약 570 K입니다. 1차 탈착은 처음 덮임률 θ₀가 달라도 봉우리 온도가 같고 모양이 비대칭입니다. 2차(재결합 탈착, 예: 2H* → H₂)로 바꾸면 θ₀가 클수록 봉우리가 낮은 온도로 옮겨 가고 모양이 대칭에 가까워지므로, 봉우리의 거동만으로 탈착 차수를 판별할 수 있습니다. β를 키우면 봉우리가 높은 온도로 밀려나는데, 여러 β에서 T_p를 재어 ln(T_p²/β)를 1/T_p에 대해 그리면 ν를 가정하지 않고 E_des를 얻습니다. 촉매 연구에서는 NH₃-TPD로 산점의 세기를, H₂-TPR(승온 환원)로 금속 산화물의 환원성을 봅니다."
          : "Raise E_des and the peak moves right: with ν = 10¹³ s⁻¹ and β = 10 K/s, 1 eV (96 kJ/mol) desorbs near 385 K and 1.5 eV near 570 K. First-order peaks stay at the same temperature whatever the initial coverage θ₀, and are asymmetric. Switch to second order (recombinative desorption, e.g. 2H* → H₂) and larger θ₀ shifts the peak to lower temperature with a more symmetric shape, so the peak behaviour alone reveals the desorption order. A larger β pushes the peak to higher temperature; measuring T_p at several β and plotting ln(T_p²/β) against 1/T_p gives E_des without assuming ν. In catalysis research, NH₃-TPD measures acid-site strength and H₂-TPR (temperature-programmed reduction) the reducibility of metal oxides."}
      </Note>
    </Card>
  );
}

function DiffusionLab({ isKo }) {
  const [T, setT] = useState(300);
  const [Ed, setEd] = useState(1.0);
  const [Ef, setEf] = useState(0.5);
  const a = 0.3e-9, nu = 1e13;
  const khop = nu * Math.exp(-Ef / (KB_EV * T));
  const D = a * a * khop / 4;
  const tau = Math.exp(Ed / (KB_EV * T)) / nu;
  const L = Math.sqrt(D * tau);
  const hops = khop * tau;
  // random walk picture with a capped number of hops
  const nshow = Math.min(4000, Math.max(1, Math.round(hops)));
  const walk = useMemo(() => {
    const rnd = makeRng(7);
    const pts = [[0, 0]];
    let x = 0, y = 0;
    for (let i = 0; i < nshow; i++) {
      const r = Math.floor(rnd() * 4);
      if (r === 0) x++; else if (r === 1) x--; else if (r === 2) y++; else y--;
      pts.push([x, y]);
    }
    return pts;
  }, [nshow]);
  const ext = Math.max(10, ...walk.map(([x, y]) => Math.max(Math.abs(x), Math.abs(y)))) + 2;
  const W = 300, Ht = 300;
  const sx = v => W / 2 + v * (W / 2 - 10) / ext, sy = v => Ht / 2 - v * (Ht / 2 - 10) / ext;
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑮ 떨어지기 전까지 얼마나 돌아다닐까: 표면 확산 길이" : "Lab ⑮ How far does an adatom wander before it leaves? The surface diffusion length"}</Hd>
      <Note>
        {isKo
          ? "흡착 원자는 가만히 있지 않습니다. 이웃 자리로 넘어가는 장벽 E_diff는 탈착 장벽 E_des보다 낮아서(보통 그 10–20% 이상), 떨어지기 전에 여러 번 깡충깡충 뜁니다. 2차원 마구걷기에서 D = a²k_hop/4이고, 체류 시간 τ 동안의 이동 거리는 L = √(Dτ)입니다."
          : "Adsorbed atoms do not sit still. The barrier to hop to a neighbouring site, E_diff, is lower than the desorption barrier E_des (often a fraction of it), so the atom hops many times before leaving. For a 2D random walk D = a²k_hop/4, and the distance covered during the residence time τ is L = √(Dτ)."}
      </Note>
      <Eq>k_hop = ν e^(−E_diff/k_BT),   τ = ν⁻¹ e^(E_des/k_BT),   L = √(Dτ) = (a/2) e^((E_des − E_diff)/2k_BT)</Eq>
      <Row>
        <Slider label="T" value={T} min={200} max={900} step={5} onChange={setT} unit=" K" fmt={v => v.toFixed(0)} />
        <Slider label="E_des" value={Ed} min={0.4} max={2} step={0.01} onChange={setEd} unit=" eV" fmt={v => v.toFixed(2)} />
        <Slider label="E_diff" value={Ef} min={0.05} max={1.0} step={0.01} onChange={setEf} unit=" eV" fmt={v => v.toFixed(2)} />
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <svg viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <path d={walk.map(([x, y], i) => `${i ? "L" : "M"} ${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`).join(" ")} fill="none" stroke={C.accent} strokeWidth={0.8} strokeOpacity={0.8} />
          <circle cx={sx(0)} cy={sy(0)} r={4} fill={C.ok} />
          <circle cx={sx(walk[walk.length - 1][0])} cy={sy(walk[walk.length - 1][1])} r={4} fill={C.pink} />
          <text x={8} y={Ht - 8} fill={C.textDim} fontSize={10}>{hops > 4000 ? (isKo ? `처음 4000번만 표시 (전체 ${sci(hops, 1)}번)` : `first 4000 hops shown (of ${sci(hops, 1)})`) : (isKo ? `${Math.round(hops)}번 뛰고 탈착` : `${Math.round(hops)} hops, then desorbs`)}</text>
        </svg>
        <div style={{ flex: "1 1 300px" }}>
          <StatGrid min={190}>
            <Stat label="k_hop" value={`${sci(khop, 2)} s⁻¹`} color={C.accent} />
            <Stat label="D" value={`${sci(D, 2)} m² s⁻¹`} color={C.accent} />
            <Stat label="τ" value={`${sci(tau, 2)} s`} color={C.amber} />
            <Stat label={isKo ? "뛰는 횟수 k_hop τ" : "Hops k_hop τ"} value={sci(hops, 2)} color={C.amber} />
            <Stat label={isKo ? "확산 길이 L" : "Diffusion length L"} value={L > 1e-6 ? `${(L * 1e6).toFixed(2)} µm` : `${(L * 1e9).toFixed(1)} nm`} color={C.ok} />
          </StatGrid>
        </div>
      </div>
      <Note>
        {isKo
          ? "강의 예제(a = 0.3 nm, ν = 10¹³ s⁻¹, E_des = 1.0 eV, E_diff = 0.5 eV)에서 300 K이면 L ≈ 2.4 µm, 500 K이면 L ≈ 50 nm입니다. 온도를 올리면 더 잘 뛰지만 훨씬 빨리 떨어지므로(E_des > E_diff) 확산 길이는 오히려 줄어듭니다. 이 길이가 박막 성장의 모양을 정합니다. 확산 길이가 계단 사이 거리보다 길면 원자가 계단 끝에 붙어 매끈한 층이 자라고(step-flow), 짧으면 표면 곳곳에 섬이 생깁니다. MBE·CVD에서 기판 온도와 공급 속도를 고르는 기준이 바로 이것입니다."
          : "For the lecture example (a = 0.3 nm, ν = 10¹³ s⁻¹, E_des = 1.0 eV, E_diff = 0.5 eV), L ≈ 2.4 µm at 300 K and L ≈ 50 nm at 500 K. Heating makes the atom hop faster but leave much sooner (E_des > E_diff), so the diffusion length actually shrinks. This length shapes thin-film growth: if it exceeds the spacing between steps, atoms reach step edges and smooth layers grow (step flow); if it is shorter, islands nucleate all over the surface. It is the criterion for choosing substrate temperature and flux in MBE and CVD."}
      </Note>
    </Card>
  );
}

// =============================================================
// 6) HETEROGENEOUS CATALYSIS
// =============================================================
function CatalysisTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <MechDerivCard isKo={isKo} />
      <MechLab isKo={isKo} />
      <VolcanoLab isKo={isKo} />
      <DBandCard isKo={isKo} />
      <ProcessCasesCard isKo={isKo} />
    </div>
  );
}

function MechDerivCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "표면 반응의 세 가지 길: 속도식 유도" : "Three routes for surface reactions: deriving the rate laws"}</Hd>
      <Note>
        {isKo
          ? "촉매는 반응물을 표면에 붙잡아(흡착) 결합을 약하게 하거나 끊고, 반응한 뒤 생성물을 놓아줍니다(탈착). 표면 반응 단계가 느리고 흡착·탈착은 빠른 평형이라고 하면, 반응 속도는 '덮임률 × 표면 반응 속도 상수'이고 덮임률은 앞 탭의 Langmuir 등온선이 알려 줍니다."
          : "A catalyst captures reactants on its surface (adsorption), weakens or breaks their bonds, and releases the products after reaction (desorption). If the surface reaction step is slow while adsorption and desorption are fast equilibria, the rate is coverage times the surface rate constant, and the Langmuir isotherm of the previous tab supplies the coverage."}
      </Note>
      <HdSub>{isKo ? "(a) 단분자 반응: A* → P" : "(a) Unimolecular: A* → P"}</HdSub>
      <Eq>v = k θ_A = k K p_A/(1 + K p_A)   →   {isKo ? "낮은 p: v ≈ kKp_A (1차),  높은 p: v ≈ k (0차)" : "low p: v ≈ kKp_A (first order),  high p: v ≈ k (zero order)"}</Eq>
      <Note>
        {isKo
          ? "예: 텅스텐 위 NH₃ 분해는 고압에서 0차입니다. 표면이 이미 꽉 차서 압력을 더 올려도 반응할 자리가 늘지 않습니다."
          : "Example: decomposition of NH₃ on tungsten is zero order at high pressure. The surface is already full, so raising the pressure adds no reaction sites."}
      </Note>
      <HdSub>{isKo ? "(b) Langmuir–Hinshelwood: 둘 다 붙은 뒤 표면 위에서 만난다 (A* + B* → P)" : "(b) Langmuir–Hinshelwood: both adsorb, then meet on the surface (A* + B* → P)"}</HdSub>
      <Eq>{isKo ? "경쟁 흡착:" : "Competitive adsorption:"}  θ_A = K_A p_A/(1 + K_A p_A + K_B p_B),   θ_B = K_B p_B/(1 + K_A p_A + K_B p_B)</Eq>
      <Eq>v = k θ_A θ_B = k K_A K_B p_A p_B/(1 + K_A p_A + K_B p_B)²</Eq>
      <Eq>∂v/∂p_A = 0   →   K_A p_A = 1 + K_B p_B,   v_max = k K_B p_B/[4(1 + K_B p_B)]</Eq>
      <Note>
        {isKo
          ? "A의 압력을 올리면 처음에는 빨라지지만, 어느 순간부터 A가 자리를 독차지해 B가 붙을 곳이 없어지면서 오히려 느려집니다(자기 피독). Pt·Pd 위 CO 산화(2CO + O₂ → 2CO₂)가 대표적입니다. 저온에서는 CO가 표면을 덮어 O₂가 해리 흡착하지 못하므로, 자동차 3원 촉매는 시동 직후 데워질 때까지('light-off') 거의 작동하지 않습니다. Fe 위 Haber–Bosch 반응(N₂* + H* → … → NH₃)도 LH 경로입니다."
          : "Raising p_A speeds the reaction at first, but past a point A monopolizes the sites, B has nowhere to land, and the rate falls (self-poisoning). CO oxidation on Pt and Pd (2CO + O₂ → 2CO₂) is the classic case: at low temperature CO blankets the surface and O₂ cannot adsorb dissociatively, so an automotive three-way catalyst hardly works after a cold start until it warms up ('light-off'). The Haber–Bosch reaction on Fe (N₂* + H* → … → NH₃) also follows the LH route."}
      </Note>
      <HdSub>{isKo ? "(c) Eley–Rideal: 붙은 A를 기체 B가 직접 때린다 (A* + B(g) → P)" : "(c) Eley–Rideal: gas-phase B strikes adsorbed A (A* + B(g) → P)"}</HdSub>
      <Eq>v = k θ_A p_B = k K_A p_A p_B/(1 + K_A p_A),     {isKo ? "A가 해리 흡착이면" : "if A adsorbs dissociatively"}   θ_A = (K_A p_A)^(1/2)/(1 + (K_A p_A)^(1/2))</Eq>
      <Note>
        {isKo
          ? "ER 속도는 p_A를 올리면 포화될 뿐 줄어들지 않습니다. 열적 촉매에서는 드물지만 원자 빔(H(g) + Cl* → HCl(g)), 플라즈마 촉매(NOx·VOC 분해에서 라디칼이 흡착종을 직접 때림), 그리고 CVD/PECVD의 표면 성장에서 중요합니다. 실험적으로 p_A를 올렸을 때 속도에 최대가 나타나면 LH, 단조 증가 후 포화하면 ER을 의심할 수 있습니다."
          : "The ER rate merely saturates as p_A rises; it never falls. It is rare in thermal catalysis but important in atomic beams (H(g) + Cl* → HCl(g)), plasma catalysis (radicals striking adsorbates in NOx and VOC abatement) and surface growth in CVD/PECVD. Experimentally, a rate maximum as p_A rises points to LH, while a monotonic rise to saturation suggests ER."}
      </Note>
    </Card>
  );
}

function MechLab({ isKo }) {
  const [KBpB, setKBpB] = useState(1);
  const [diss, setDiss] = useState(false);
  const W = 620, Ht = 280, pad = 50;
  const { X, Y } = plotScale(-2, 2.5, 0, 1.05, W, Ht, pad);
  const uni = [], lh = [], er = [];
  for (let lx = -2; lx <= 2.5; lx += 0.01) {
    const x = Math.pow(10, lx);
    const xa = diss ? Math.sqrt(x) : x;
    uni.push([lx, xa / (1 + xa)]);
    const den = 1 + xa + KBpB;
    lh.push([lx, (xa / den) * (KBpB / den) / (KBpB / (4 * (1 + KBpB)))]);
    er.push([lx, xa / (1 + xa)]);
  }
  const xmax = 1 + KBpB;
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑯ 압력을 올리면 반응은 늘 빨라질까: LH 대 ER" : "Lab ⑯ Does raising the pressure always speed the reaction? LH vs ER"}</Hd>
      <Row>
        <Slider label="K_B p_B" value={KBpB} min={0.1} max={20} step={0.1} onChange={setKBpB} fmt={v => v.toFixed(1)} />
        <button onClick={() => setDiss(!diss)} style={btnStyle(diss)}>{isKo ? "A 해리 흡착" : "A adsorbs dissociatively"}</button>
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel="log₁₀(K_A p_A)" ylabel={isKo ? "속도 / 최대 속도" : "rate / maximum rate"} />
        {[-2, -1, 0, 1, 2].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        {[0, 0.5, 1].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        <path d={pathOf(er, X, Y)} fill="none" stroke={C.amber} strokeWidth={2.2} />
        <path d={pathOf(lh, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.6} />
        {!diss && <line x1={X(Math.log10(xmax))} x2={X(Math.log10(xmax))} y1={Y(0)} y2={Y(1)} stroke={C.accent} strokeDasharray="4 3" />}
        <text x={W - pad} y={pad - 10} fill={C.accent} fontSize={11} textAnchor="end">Langmuir–Hinshelwood θ_Aθ_B</text>
        <text x={W - pad} y={pad + 6} fill={C.amber} fontSize={11} textAnchor="end">{isKo ? "Eley–Rideal θ_A p_B (= 단분자 꼴)" : "Eley–Rideal θ_A p_B (same shape as unimolecular)"}</text>
      </svg>
      <StatGrid>
        <Stat label={isKo ? "LH 최대 위치 K_A p_A" : "LH maximum at K_A p_A"} value={diss ? `√(K_A p_A) = ${xmax.toFixed(2)}` : xmax.toFixed(2)} color={C.accent} />
        <Stat label={isKo ? "LH 최대 속도 / k" : "LH maximum rate / k"} value={(KBpB / (4 * (1 + KBpB))).toFixed(4)} color={C.accent} />
      </StatGrid>
      <Note>
        {isKo
          ? "LH 곡선은 K_A p_A = 1 + K_B p_B에서 최대가 되고, 그 뒤로 A가 B를 밀어내며 떨어집니다. B를 더 많이 넣으면(K_B p_B↑) 최대가 오른쪽으로 옮겨 갑니다. 공정 설계에서는 이 최대 근처로 원료 비를 맞추고, 너무 강하게 붙는 성분(CO, 황 화합물)을 미리 제거합니다."
          : "The LH curve peaks at K_A p_A = 1 + K_B p_B and then falls as A displaces B; adding more B (larger K_B p_B) moves the maximum to the right. Process design sets the feed ratio near this maximum and removes strongly binding species (CO, sulfur compounds) upstream."}
      </Note>
    </Card>
  );
}

const VOLCANO_METALS = [
  { m: "Mo", x: -1.05 }, { m: "Re", x: -0.85 }, { m: "Fe", x: -0.45 }, { m: "Ru", x: -0.36 },
  { m: "Os", x: -0.22 }, { m: "Co", x: 0.05 }, { m: "Ni", x: 0.2 }, { m: "Pt", x: 0.45 },
];
function VolcanoLab({ isKo }) {
  const [T, setT] = useState(600);
  const [gam, setGam] = useState(0.5);
  const [Ea0, setEa0] = useState(0.9);
  const [Ed0, setEd0] = useState(0.4);
  const rate = dE => {
    const Ea = Math.max(0, Ea0 + gam * dE), Ed = Math.max(0, -dE + Ed0);
    return { ads: -Ea / (KB_EV * T) / Math.LN10, des: -Ed / (KB_EV * T) / Math.LN10 };
  };
  const W = 620, Ht = 300, pad = 54;
  const pts = [];
  for (let dE = -1.4; dE <= 0.8; dE += 0.01) { const r = rate(dE); pts.push([dE, r.ads, r.des, Math.min(r.ads, r.des)]); }
  const ymin = Math.min(...pts.map(p => p[3])) - 1, ymax = Math.max(...pts.map(p => p[3])) + 1.5;
  const { X, Y } = plotScale(-1.4, 0.8, ymin, ymax, W, Ht, pad);
  const best = pts.reduce((b, p) => (p[3] > b[3] ? p : b), pts[0]);
  const dEopt = (Ed0 - Ea0) / (1 + gam);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑰ Sabatier 원리와 화산 그래프" : "Lab ⑰ The Sabatier principle and the volcano plot"}</Hd>
      <Note>
        {isKo
          ? "Sabatier 원리: 좋은 촉매는 반응물을 '적당히' 붙잡는다. 너무 약하게 붙으면(오른쪽) 반응물을 활성화하지 못해 흡착·해리 단계가 느리고, 너무 세게 붙으면(왼쪽) 생성물이나 중간체가 떨어지지 않아 표면이 막힙니다(피독). 아래 모형에서는 해리 흡착 장벽이 결합 에너지 ΔE에 비례해 낮아지고(Brønsted–Evans–Polanyi 관계, 기울기 γ), 탈착 장벽은 결합이 셀수록 높아집니다. 전체 속도는 둘 중 느린 쪽이 정합니다."
          : "The Sabatier principle: a good catalyst binds reactants 'just right'. Binding too weakly (right) fails to activate the reactants and the adsorption–dissociation step is slow; binding too strongly (left) keeps products or intermediates from leaving and the surface clogs (poisoning). In the model below the dissociative adsorption barrier falls in proportion to the binding energy ΔE (a Brønsted–Evans–Polanyi relation with slope γ), and the desorption barrier grows as binding strengthens. The slower of the two sets the overall rate."}
      </Note>
      <Eq>E_a,ads = E_a⁰ + γ ΔE,   E_a,des = −ΔE + E_d⁰,   log₁₀ r = min(−E_a,ads, −E_a,des)/(k_BT ln 10)   →   ΔE_opt = (E_d⁰ − E_a⁰)/(1 + γ)</Eq>
      <Row>
        <Slider label="T" value={T} min={300} max={1000} step={10} onChange={setT} unit=" K" fmt={v => v.toFixed(0)} />
        <Slider label={isKo ? "BEP 기울기 γ" : "BEP slope γ"} value={gam} min={0.2} max={1} step={0.05} onChange={setGam} fmt={v => v.toFixed(2)} />
        <Slider label="E_a⁰" value={Ea0} min={0.3} max={1.5} step={0.05} onChange={setEa0} unit=" eV" fmt={v => v.toFixed(2)} />
        <Slider label="E_d⁰" value={Ed0} min={0} max={1} step={0.05} onChange={setEd0} unit=" eV" fmt={v => v.toFixed(2)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "결합 에너지 ΔE (eV) ← 강하게 붙음 · 약하게 붙음 →" : "binding energy ΔE (eV)  ← strong · weak →"} ylabel={isKo ? "log₁₀(속도, 상대)" : "log₁₀(rate, relative)"} />
        {[-1.2, -0.8, -0.4, 0, 0.4, 0.8].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        <path d={pathOf(pts.map(p => [p[0], Math.max(ymin, p[1])]), X, Y)} fill="none" stroke={C.sky} strokeWidth={1.2} strokeDasharray="5 4" />
        <path d={pathOf(pts.map(p => [p[0], Math.max(ymin, p[2])]), X, Y)} fill="none" stroke={C.pink} strokeWidth={1.2} strokeDasharray="5 4" />
        <path d={pathOf(pts.map(p => [p[0], p[3]]), X, Y)} fill="none" stroke={C.accent} strokeWidth={2.8} />
        <circle cx={X(best[0])} cy={Y(best[3])} r={6} fill="#fde047" />
        <text x={X(-1.35)} y={Y(ymax) + 14} fill={C.pink} fontSize={11}>{isKo ? "탈착 제한 (피독)" : "desorption-limited (poisoned)"}</text>
        <text x={X(0.75)} y={Y(ymax) + 14} fill={C.sky} fontSize={11} textAnchor="end">{isKo ? "흡착·활성화 제한" : "activation-limited"}</text>
        {VOLCANO_METALS.map(({ m, x }) => <g key={m}>
          <line x1={X(x)} x2={X(x)} y1={Ht - pad} y2={Ht - pad - 8} stroke={C.textDim} />
          <text x={X(x)} y={Ht - pad - 12} fill={C.textDim} fontSize={10} textAnchor="middle">{m}</text>
        </g>)}
      </svg>
      <StatGrid>
        <Stat label={isKo ? "최적 결합 에너지" : "Optimal binding energy"} value={`${best[0].toFixed(2)} eV (${isKo ? "해석해" : "analytic"} ${dEopt.toFixed(2)})`} color={C.ok} />
        <Stat label={isKo ? "꼭대기 속도 log₁₀ r" : "Peak log₁₀ r"} value={best[3].toFixed(2)} color={C.ok} />
      </StatGrid>
      <Note>
        {isKo
          ? "두 직선의 교점이 화산의 꼭대기이고, 그 위치는 온도와 무관하게 ΔE_opt = (E_d⁰ − E_a⁰)/(1 + γ)입니다. 아래 축의 금속 이름은 암모니아 합성에서 질소 결합 세기의 대략적인 순서만 나타낸 개념도입니다(숫자 자체는 이 모형의 가정). 실제 DFT·실험 화산 그래프에서도 Mo·Re처럼 N을 너무 세게 붙잡는 금속은 왼쪽 비탈, Co·Ni처럼 약한 금속은 오른쪽 비탈에 놓이고, Ru·Os·Fe가 꼭대기 근처에 옵니다. 그래서 공업 촉매는 Fe(값이 싸고 꼭대기 근처), 고성능 촉매는 Ru입니다. 꼭대기에 없는 원소라도 섞으면 그 사이 값을 낼 수 있습니다: Co와 Mo를 섞은 Co₃Mo₃N이 꼭대기 근처에 오도록 '보간'으로 설계된 촉매가 대표적입니다."
          : "The intersection of the two lines is the top of the volcano, at ΔE_opt = (E_d⁰ − E_a⁰)/(1 + γ) whatever the temperature. The metal labels on the axis only sketch the rough order of nitrogen binding strength in ammonia synthesis (the numbers themselves are assumptions of this model). Real DFT and experimental volcano plots likewise put metals that hold N too tightly, such as Mo and Re, on the left slope, weak binders such as Co and Ni on the right slope, and Ru, Os and Fe near the top. Hence Fe as the industrial catalyst (cheap and near the top) and Ru as the high-performance one. Mixing elements that are not at the top can give an intermediate value: Co₃Mo₃N, designed by 'interpolating' between Co and Mo to land near the top, is the classic example."}
      </Note>
      <Note>
        {isKo
          ? "출처: 보간 설계는 C. J. H. Jacobsen et al., J. Am. Chem. Soc. 123, 8404 (2001). 암모니아 합성의 화산 그래프와 BEP 관계는 J. K. Nørskov et al., Nature Chem. 1, 37 (2009)의 해설 참고."
          : "Sources: the interpolation design is C. J. H. Jacobsen et al., J. Am. Chem. Soc. 123, 8404 (2001); for the ammonia volcano and BEP relations see the review J. K. Nørskov et al., Nature Chem. 1, 37 (2009)."}
      </Note>
    </Card>
  );
}

function DBandCard({ isKo }) {
  const W = 620, Ht = 270;
  return (
    <Card>
      <Hd>{isKo ? "d-띠 중심 이론: '적당히'를 정하는 전자 구조" : "d-band centre theory: the electronic structure behind 'just right'"}</Hd>
      <Note>
        {isKo
          ? "흡착 분자의 프런티어 오비탈(CO라면 채워진 5σ와 빈 2π*)은 먼저 금속의 넓은 sp 띠와 섞여 넓게 퍼지고 아래로 내려갑니다. 이 부분은 금속마다 비슷합니다. 차이를 만드는 것은 좁은 d 띠와의 결합입니다. 흡착 준위와 d 띠가 섞이면 '결합' 상태와 '반결합' 상태가 생기는데(Hückel의 α ± β와 같은 이야기), 반결합 상태가 Fermi 준위보다 위에 있으면 비어 있어 결합이 강하고, 아래로 내려와 채워질수록 결합이 약해집니다."
          : "The adsorbate's frontier orbitals (the filled 5σ and empty 2π* for CO) first mix with the metal's broad sp band, broadening and shifting down; this part is similar for all metals. The difference comes from coupling to the narrow d band. Mixing the adsorbate level with the d band creates bonding and antibonding states (the same story as Hückel's α ± β). If the antibonding state lies above the Fermi level it is empty and the bond is strong; the more it drops below E_F and fills, the weaker the bond."}
      </Note>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        {[[90, 0, isKo ? "Sc·Ti·V·Y·Zr" : "Sc, Ti, V, Y, Zr", isKo ? "d 띠 높음 → 반결합 비어 있음 → 강한 흡착" : "d band high → antibonding empty → strong"], [300, 40, isKo ? "Fe·Ru·Os" : "Fe, Ru, Os", isKo ? "적당한 흡착 (화산 꼭대기)" : "moderate (top of the volcano)"], [510, 80, isKo ? "Cu·Ag·Au" : "Cu, Ag, Au", isKo ? "d 띠 낮음 → 반결합 채워짐 → 약한 흡착" : "d band low → antibonding filled → weak"]].map(([x, dy, name, desc], i) => (
          <g key={i}>
            <line x1={x - 70} x2={x + 70} y1={110} y2={110} stroke={C.pink} strokeDasharray="5 4" />
            <text x={x + 72} y={106} fill={C.pink} fontSize={10}>E_F</text>
            <rect x={x - 20} y={120 + dy - 25} width={40} height={50} fill={C.amber} fillOpacity={0.35} stroke={C.amber} />
            <text x={x - 24} y={120 + dy + 4} fill={C.amber} fontSize={10} textAnchor="end">ε_d</text>
            <line x1={x + 30} x2={x + 62} y1={60 + dy} y2={60 + dy} stroke={C.accent} strokeWidth={2.4} />
            <text x={x + 46} y={52 + dy} fill={C.accent} fontSize={10} textAnchor="middle">{isKo ? "반결합" : "anti"}</text>
            {60 + dy > 110 && <text x={x + 46} y={64 + dy} fill="#fde047" fontSize={13} textAnchor="middle">↑↓</text>}
            <line x1={x + 30} x2={x + 62} y1={200 + dy * 0.3} y2={200 + dy * 0.3} stroke={C.accent} strokeWidth={2.4} />
            <text x={x + 46} y={204 + dy * 0.3} fill="#fde047" fontSize={13} textAnchor="middle">↑↓</text>
            <text x={x} y={240} fill={C.text} fontSize={12} textAnchor="middle" fontWeight={700}>{name}</text>
            <text x={x} y={256} fill={C.textDim} fontSize={10} textAnchor="middle">{desc}</text>
          </g>
        ))}
      </svg>
      <Note>
        {isKo
          ? "주기율표에서 왼쪽 위(d 전자가 적은) 금속일수록 d 띠 중심 ε_d가 Fermi 준위에 가깝고 반결합 상태가 비어 있어 흡착이 강합니다. 오른쪽(Cu·Ag·Au)으로 갈수록 d 띠가 꽉 차고 깊어져 반결합 상태까지 채워지므로 흡착이 약합니다. Au가 '고귀한' 이유, 그리고 Pt 표면에 다른 금속을 얇게 입히거나 격자를 늘이고 줄여(변형) ε_d를 옮기면 결합 세기를 미세 조정할 수 있는 이유가 여기에 있습니다. ε_d는 화산 그래프의 가로축을 전자 구조로 바꿔 주는 '기술자(descriptor)'입니다."
          : "Metals toward the upper left of the transition series (fewer d electrons) have a d-band centre ε_d close to the Fermi level and empty antibonding states, so they bind strongly. Toward the right (Cu, Ag, Au) the d band is full and deep, the antibonding states fill too, and binding is weak. This is why Au is 'noble', and why coating Pt with a thin layer of another metal or stretching and compressing its lattice (strain) to move ε_d fine-tunes binding strength. ε_d is the descriptor that turns the horizontal axis of the volcano plot into electronic structure."}
      </Note>
      <Note>
        {isKo
          ? "출처: B. Hammer, J. K. Nørskov, Nature 376, 238 (1995); B. Hammer, J. K. Nørskov, Adv. Catal. 45, 71 (2000)."
          : "Sources: B. Hammer, J. K. Nørskov, Nature 376, 238 (1995); B. Hammer, J. K. Nørskov, Adv. Catal. 45, 71 (2000)."}
      </Note>
    </Card>
  );
}

function ProcessCasesCard({ isKo }) {
  const cases = isKo ? [
    ["Haber–Bosch 암모니아 합성", "N₂ + 3H₂ ⇌ 2NH₃, 철 촉매(K₂O·Al₂O₃ 조촉매), 400–500 °C, 150–300 bar", "속도 결정 단계는 N₂의 해리 흡착(LH). 평형은 저온·고압이 유리하지만 해리가 느려 고온이 필요한 타협. 세계 질소 비료의 기반."],
    ["자동차 3원 촉매", "Pt·Pd·Rh / CeO₂–ZrO₂ / 코디어라이트 벌집", "CO·탄화수소 산화와 NO 환원을 동시에. 공기–연료 비를 이론값(λ = 1) 근처로 맞춤. CeO₂가 산소를 저장·방출해 λ의 흔들림을 흡수. CO 자기 피독 때문에 냉시동 배출이 문제."],
    ["CO 산화와 연료전지", "Pt 위 2CO + O₂ → 2CO₂ (LH)", "수소 연료의 ppm 수준 CO도 Pt 전극을 덮어 성능을 떨어뜨림(피독). Pt–Ru 합금은 d 띠를 옮겨 CO 결합을 약화."],
    ["CVD / PECVD / ALD 박막 성장", "SiH₄ → Si(s) + 2H₂, TiCl₄ + H₂O → TiO₂ …", "전구체가 표면에 흡착해 반응(LH형)하거나 라디칼이 흡착종을 직접 때림(ER형). ALD는 자기 제한적 흡착(단일층 포화)을 이용해 원자층 하나씩 쌓음."],
    ["플라즈마 촉매", "NOx·VOC 분해, 저온 NH₃ 합성", "플라즈마가 만든 라디칼과 들뜬 분자가 촉매 표면의 흡착종과 ER 경로로 반응해 열적 장벽을 우회."],
  ] : [
    ["Haber–Bosch ammonia synthesis", "N₂ + 3H₂ ⇌ 2NH₃, iron catalyst (K₂O, Al₂O₃ promoters), 400–500 °C, 150–300 bar", "The rate-limiting step is dissociative adsorption of N₂ (LH). Equilibrium favours low T and high p, but slow dissociation demands high T: a compromise. The basis of the world's nitrogen fertilizer."],
    ["Automotive three-way catalyst", "Pt, Pd, Rh / CeO₂–ZrO₂ / cordierite honeycomb", "Oxidizes CO and hydrocarbons and reduces NO at once, with the air–fuel ratio held near stoichiometric (λ = 1). CeO₂ stores and releases oxygen to buffer swings in λ. CO self-poisoning makes cold-start emissions the main problem."],
    ["CO oxidation and fuel cells", "2CO + O₂ → 2CO₂ on Pt (LH)", "Even ppm-level CO in hydrogen fuel blankets Pt electrodes and degrades performance (poisoning). Pt–Ru alloys shift the d band and weaken CO binding."],
    ["CVD / PECVD / ALD film growth", "SiH₄ → Si(s) + 2H₂, TiCl₄ + H₂O → TiO₂, …", "Precursors adsorb and react on the surface (LH-like) or radicals strike adsorbates directly (ER-like). ALD exploits self-limiting adsorption (monolayer saturation) to grow one atomic layer at a time."],
    ["Plasma catalysis", "NOx and VOC abatement, low-temperature NH₃ synthesis", "Radicals and excited molecules made by the plasma react with adsorbates by ER routes, bypassing thermal barriers."],
  ];
  return (
    <Card>
      <Hd>{isKo ? "화학공학 현장의 표면 반응" : "Surface reactions in chemical engineering practice"}</Hd>
      {cases.map(([t, cond, d], i) => (
        <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
          <div style={{ fontWeight: 800, color: C.accent, marginBottom: 4 }}>{t}</div>
          <div style={{ fontSize: 12.5, color: C.amber, fontFamily: mono, marginBottom: 6 }}>{cond}</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.7 }}>{d}</div>
        </div>
      ))}
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
        q: "P1. (조밀 쌓임의 틈) 반지름 r인 공의 ccp(FCC) 결정에는 팔면체 틈과 사면체 틈이 있다. (a) 각 틈에 꼭 맞게 들어가는 작은 공의 반지름을 r로 나타내시오. (b) 입방 세포 하나에 각 틈이 몇 개 있는가? (c) NaCl과 ZnS 구조를 이 틈으로 설명하시오.",
        s: "(a) 팔면체 틈: 면 대각선 방향이 아니라 모서리 방향으로 보면 두 큰 공 중심 사이 거리 a = 2√2 r에 작은 공이 끼므로 2r + 2r_o = a = 2√2 r → r_o = (√2 − 1)r = 0.414r. 사면체 틈: 정사면체 꼭짓점의 공 넷 사이, 중심에서 꼭짓점까지 √(3/8) × (변 2r) = √(3/2) r이므로 r_t = (√(3/2) − 1)r = 0.225r. (b) 팔면체 틈은 체심 1개 + 모서리 12개 × ¼ = 4개(원자 수와 같음), 사면체 틈은 세포를 8개 작은 정육면체로 나눈 각 중심에 1개씩 8개(원자 수의 2배). (c) Cl⁻의 ccp에서 팔면체 틈을 모두 Na⁺로 채우면 암염 구조, S²⁻의 ccp에서 사면체 틈의 절반을 Zn²⁺로 채우면 섬아연석 구조입니다. 반지름 비의 한계 0.414와 0.225가 바로 이 틈의 크기입니다.",
      },
      en: {
        q: "P1. (Holes in close packing) A ccp (FCC) crystal of spheres of radius r has octahedral and tetrahedral holes. (a) Express the radius of the small sphere that just fits each hole in terms of r. (b) How many of each hole are there per cubic cell? (c) Explain the NaCl and ZnS structures with these holes.",
        s: "(a) Octahedral hole: along a cube edge the small sphere sits between two large spheres whose centres are a = 2√2 r apart, so 2r + 2r_o = 2√2 r and r_o = (√2 − 1)r = 0.414r. Tetrahedral hole: among the four spheres at the vertices of a tetrahedron of edge 2r, the centre-to-vertex distance is √(3/8) × 2r = √(3/2) r, so r_t = (√(3/2) − 1)r = 0.225r. (b) Octahedral: 1 at the body centre + 12 edges × ¼ = 4 (as many as atoms). Tetrahedral: one at the centre of each of the 8 small cubes = 8 (twice the atoms). (c) Filling all octahedral holes of a Cl⁻ ccp with Na⁺ gives rock salt; filling half the tetrahedral holes of an S²⁻ ccp with Zn²⁺ gives zinc blende. The radius-ratio limits 0.414 and 0.225 are exactly these hole sizes.",
      },
    },
    {
      ko: {
        q: "P2. (Born–Mayer) (a) KCl(암염, d = 314.5 pm)의 격자 에너지를 Born–Mayer 식(A = 1.7476, d* = 34.5 pm)으로 구하고 Born–Haber 값 715 kJ/mol과 비교하시오. N_Ae²/(4πε₀) = 1.389×10⁵ kJ mol⁻¹ pm. (b) 같은 구조의 MgO(d = 210.6 pm)는? (c) MgO의 녹는점이 NaCl보다 2000 °C 이상 높은 이유는?",
        s: "(a) U = 1.389×10⁵ × 1.7476/314.5 × (1 − 34.5/314.5) = 772.0 × 0.8903 = 687 kJ/mol, 실험값의 96%. (b) 전하가 ±2라 z² = 4배: U = 4 × 1.389×10⁵ × 1.7476/210.6 × (1 − 34.5/210.6) = 3856 kJ/mol(Born–Haber 3795 kJ/mol). (c) 격자 에너지가 NaCl의 약 5배입니다. 전하 곱이 4배이고 이온 간 거리가 짧아(282 → 211 pm) 1/d 인자도 1.3배 커지기 때문입니다. MgO는 2852 °C에서 녹아 제강로의 내화물로 쓰입니다.",
      },
      en: {
        q: "P2. (Born–Mayer) (a) Use the Born–Mayer equation (A = 1.7476, d* = 34.5 pm) for the lattice energy of KCl (rock salt, d = 314.5 pm) and compare with the Born–Haber value of 715 kJ/mol. N_Ae²/(4πε₀) = 1.389×10⁵ kJ mol⁻¹ pm. (b) What about MgO with the same structure (d = 210.6 pm)? (c) Why does MgO melt more than 2000 °C higher than NaCl?",
        s: "(a) U = 1.389×10⁵ × 1.7476/314.5 × (1 − 34.5/314.5) = 772.0 × 0.8903 = 687 kJ/mol, 96% of experiment. (b) Charges ±2 give z² = 4: U = 4 × 1.389×10⁵ × 1.7476/210.6 × (1 − 34.5/210.6) = 3856 kJ/mol (Born–Haber 3795 kJ/mol). (c) The lattice energy is about five times that of NaCl: the charge product is 4 times larger and the shorter distance (282 → 211 pm) raises the 1/d factor by 1.3. MgO melts at 2852 °C and is used as a refractory in steel furnaces.",
      },
    },
    {
      ko: {
        q: "P3. (Hückel) (a) 부타다이엔의 π 준위 네 개를 구하고 π 에너지와 비편재화 에너지를 계산하시오. (b) 벤젠과 비교하시오. (c) 탄소 N개 사슬에서 N → ∞일 때 띠 너비와 반만 찬 띠의 의미는?",
        s: "(a) E_k = α + 2β cos(kπ/5): α + 1.618β, α + 0.618β, α − 0.618β, α − 1.618β. 전자 4개가 아래 두 준위를 채우므로 E_π = 4α + 2(1.618 + 0.618)β = 4α + 4.472β. 고립된 C=C 둘(4α + 4β)보다 0.472|β| ≈ 35 kJ/mol(|β| ≈ 75 kJ/mol) 더 안정합니다. (b) 벤젠은 6α + 8β로 고립 C=C 셋보다 2|β| ≈ 150 kJ/mol, 탄소 하나당 0.33|β| 안정해 부타다이엔(0.12|β|/C)보다 훨씬 큽니다: 방향족성. (c) 준위가 α ± 2|β| 사이를 메워 띠 너비 4|β|가 되고, 탄소마다 π 전자가 하나이면 띠가 반만 차서 금속처럼 행동해야 합니다. 실제 폴리아세틸렌은 결합 길이가 번갈아 바뀌어(Peierls 불안정성, 12주차) 띠 간격이 열리고 반도체가 되며, 도핑하면 전도성 고분자가 됩니다.",
      },
      en: {
        q: "P3. (Hückel) (a) Find the four π levels of butadiene and compute its π energy and delocalization energy. (b) Compare with benzene. (c) For an N-carbon chain with N → ∞, what are the band width and the meaning of a half-filled band?",
        s: "(a) E_k = α + 2β cos(kπ/5): α + 1.618β, α + 0.618β, α − 0.618β, α − 1.618β. Four electrons fill the lower two, so E_π = 4α + 2(1.618 + 0.618)β = 4α + 4.472β, which is 0.472|β| ≈ 35 kJ/mol (|β| ≈ 75 kJ/mol) more stable than two isolated C=C (4α + 4β). (b) Benzene has 6α + 8β, 2|β| ≈ 150 kJ/mol below three isolated C=C, or 0.33|β| per carbon, far more than butadiene's 0.12|β| per carbon: aromaticity. (c) The levels fill α ± 2|β|, a band of width 4|β|; with one π electron per carbon the band is half full and the chain should be metallic. Real polyacetylene alternates its bond lengths (Peierls instability, Week 12), opening a gap to become a semiconductor, and doping turns it into a conducting polymer.",
      },
    },
    {
      ko: {
        q: "P4. (충돌 선속) 300 K, 1.0×10⁻⁶ Torr의 O₂가 자리 밀도 1.5×10¹⁹ m⁻²인 표면에 닿는다. (a) 충돌 선속은? (b) 부착 확률 0.5이면 단일층이 덮이는 데 걸리는 시간은? (c) 이 결과가 '1 Langmuir' 단위와 어떻게 연결되는가?",
        s: "(a) p = 1.0×10⁻⁶ × 133.32 = 1.333×10⁻⁴ Pa, m = 32 × 1.661×10⁻²⁷ = 5.31×10⁻²⁶ kg. J = p/√(2πmk_BT) = 1.333×10⁻⁴/√(2π × 5.31×10⁻²⁶ × 1.381×10⁻²³ × 300) = 3.59×10¹⁸ m⁻² s⁻¹. (b) t = n_s/(sJ) = 1.5×10¹⁹/(0.5 × 3.59×10¹⁸) = 8.4 s. (c) 10⁻⁶ Torr에서 1초 노출(= 1 L)이 대략 단일층 하나에 해당하는 충돌 수를 주므로, 표면 과학에서는 노출량을 L로 셉니다. 여기서는 부착 확률이 0.5이고 자리가 조금 많아 약 8 L가 필요합니다.",
      },
      en: {
        q: "P4. (Collision flux) O₂ at 300 K and 1.0×10⁻⁶ Torr hits a surface with 1.5×10¹⁹ sites m⁻². (a) What is the collision flux? (b) With sticking probability 0.5, how long does a monolayer take? (c) How does this connect to the unit '1 Langmuir'?",
        s: "(a) p = 1.0×10⁻⁶ × 133.32 = 1.333×10⁻⁴ Pa and m = 32 × 1.661×10⁻²⁷ = 5.31×10⁻²⁶ kg, so J = p/√(2πmk_BT) = 1.333×10⁻⁴/√(2π × 5.31×10⁻²⁶ × 1.381×10⁻²³ × 300) = 3.59×10¹⁸ m⁻² s⁻¹. (b) t = n_s/(sJ) = 1.5×10¹⁹/(0.5 × 3.59×10¹⁸) = 8.4 s. (c) One second at 10⁻⁶ Torr (= 1 L) gives roughly one monolayer's worth of collisions, so surface science counts exposure in L. Here the sticking probability of 0.5 and the slightly higher site density mean about 8 L are needed.",
      },
    },
    {
      ko: {
        q: "P5. (Langmuir) CO/숯(273 K)의 Langmuir 맞춤에서 V∞ = 111 cm³, K = 7.55×10⁻³ kPa⁻¹를 얻었다. (a) 표면의 절반이 덮이는 압력은? (b) 90%가 덮이는 압력은? (c) 등량 흡착 엔탈피가 −7.5 kJ/mol이면, 같은 θ = 0.5를 300 K에서 얻으려면 압력이 얼마나 필요한가?",
        s: "(a) θ = 0.5이면 Kp = 1, p = 1/K = 132 kPa. (b) θ/(1 − θ) = 9 = Kp, p = 9/K = 1192 kPa ≈ 12 bar. 반에서 90%로 가는 데 압력이 9배 필요합니다. 이것이 포화의 의미입니다. (c) θ 고정에서 ln(p₂/p₁) = (Δ_adsH/R)(1/T₂ − 1/T₁) = (−7500/8.314)(1/300 − 1/273) = (−902)(−3.297×10⁻⁴) = 0.297, p₂ = 132 × e^0.297 = 178 kPa. 흡착은 발열이므로 온도를 올리면 같은 덮임률에 더 높은 압력이 필요합니다.",
      },
      en: {
        q: "P5. (Langmuir) The Langmuir fit for CO on charcoal (273 K) gave V∞ = 111 cm³ and K = 7.55×10⁻³ kPa⁻¹. (a) At what pressure is half the surface covered? (b) At what pressure is 90% covered? (c) With an isosteric enthalpy of −7.5 kJ/mol, what pressure gives the same θ = 0.5 at 300 K?",
        s: "(a) θ = 0.5 means Kp = 1, p = 1/K = 132 kPa. (b) θ/(1 − θ) = 9 = Kp, so p = 9/K = 1192 kPa ≈ 12 bar: going from half to 90% needs nine times the pressure, which is what saturation means. (c) At fixed θ, ln(p₂/p₁) = (Δ_adsH/R)(1/T₂ − 1/T₁) = (−7500/8.314)(1/300 − 1/273) = (−902)(−3.297×10⁻⁴) = 0.297, so p₂ = 132 × e^0.297 = 178 kPa. Adsorption is exothermic, so higher temperature needs higher pressure for the same coverage.",
      },
    },
    {
      ko: {
        q: "P6. (BET) 촉매 담체 0.50 g의 N₂ 흡착(77 K) 데이터를 x/[(1 − x)V]–x로 그렸더니 기울기 0.0302 cm⁻³, 절편 3.02×10⁻⁴ cm⁻³였다(V는 1 atm, 273 K 기준). (a) V_mon과 c는? (b) BET 비표면적은? (N₂ 단면적 0.162 nm²) (c) c가 100인 것의 의미는?",
        s: "(a) V_mon = 1/(S + I) = 1/(0.0302 + 0.000302) = 32.8 cm³, c = 1 + S/I = 101. (b) n = pV/RT = 101325 × 32.8×10⁻⁶/(8.314 × 273.15) = 1.463×10⁻³ mol, 넓이 = nN_Aσ = 1.463×10⁻³ × 6.022×10²³ × 0.162×10⁻¹⁸ = 143 m², 비표면적 = 285 m²/g. γ-알루미나 담체의 전형적인 값입니다. (c) E₁ − E_L = RT ln c = 8.314 × 77 × ln 101 = 2.95 kJ/mol: 첫 층이 응축보다 뚜렷이 유리해 등온선에 무릎(B점)이 생기는 II형이며, BET 분석이 믿을 만한 경우입니다.",
      },
      en: {
        q: "P6. (BET) N₂ adsorption (77 K) on 0.50 g of a catalyst support, plotted as x/[(1 − x)V] against x, gives a slope of 0.0302 cm⁻³ and an intercept of 3.02×10⁻⁴ cm⁻³ (V at 1 atm, 273 K). (a) Find V_mon and c. (b) What is the BET specific area (N₂ cross-section 0.162 nm²)? (c) What does c = 100 mean?",
        s: "(a) V_mon = 1/(S + I) = 1/(0.0302 + 0.000302) = 32.8 cm³ and c = 1 + S/I = 101. (b) n = pV/RT = 101325 × 32.8×10⁻⁶/(8.314 × 273.15) = 1.463×10⁻³ mol; area = nN_Aσ = 1.463×10⁻³ × 6.022×10²³ × 0.162×10⁻¹⁸ = 143 m², or 285 m²/g, typical of a γ-alumina support. (c) E₁ − E_L = RT ln c = 8.314 × 77 × ln 101 = 2.95 kJ/mol: the first layer is clearly favoured over condensation, giving a type II isotherm with a knee (point B), the case in which BET analysis is reliable.",
      },
    },
    {
      ko: {
        q: "P7. (TPD) 어떤 분자의 1차 TPD 봉우리가 가열 속도 5 K/s에서 450 K에 나타났다. ν = 10¹³ s⁻¹로 가정한다. (a) Redhead 식으로 E_des를 구하시오. (b) 300 K와 450 K에서 체류 시간은? (c) 가열 속도를 50 K/s로 올리면 봉우리는 어디로 움직이는가?",
        s: "(a) E = k_BT_p[ln(νT_p/β) − 3.64] = 8.617×10⁻⁵ × 450 × [ln(10¹³ × 450/5) − 3.64] = 0.03878 × (34.43 − 3.64) = 1.19 eV ≈ 115 kJ/mol(봉우리 조건을 정확히 풀면 1.20 eV). (b) τ = e^(E/k_BT)/ν: 300 K에서 1.1×10⁷ s(약 4개월), 450 K에서 2.4 s. 상온에서는 사실상 떨어지지 않는 화학 흡착입니다. (c) 봉우리 조건 E/(k_BT_p²) = (ν/β)e^(−E/k_BT_p)에서 β를 10배 올리면 T_p는 약 25–30 K 높아집니다(Raw 코드 실험: 1 eV에서 1 → 10 → 100 K/s에 359 → 385 → 414 K).",
      },
      en: {
        q: "P7. (TPD) A first-order TPD peak appears at 450 K with a heating rate of 5 K/s. Assume ν = 10¹³ s⁻¹. (a) Use the Redhead formula to find E_des. (b) What are the residence times at 300 K and 450 K? (c) Where does the peak move if the heating rate is raised to 50 K/s?",
        s: "(a) E = k_BT_p[ln(νT_p/β) − 3.64] = 8.617×10⁻⁵ × 450 × [ln(10¹³ × 450/5) − 3.64] = 0.03878 × (34.43 − 3.64) = 1.19 eV ≈ 115 kJ/mol (solving the peak condition exactly gives 1.20 eV). (b) τ = e^(E/k_BT)/ν: 1.1×10⁷ s (about four months) at 300 K and 2.4 s at 450 K, so at room temperature this chemisorbed species practically never leaves. (c) From the peak condition E/(k_BT_p²) = (ν/β)e^(−E/k_BT_p), a tenfold β raises T_p by about 25–30 K (Raw Codes: for 1 eV, 1 → 10 → 100 K/s gives 359 → 385 → 414 K).",
      },
    },
    {
      ko: {
        q: "P8. (Langmuir–Hinshelwood) Pt 위 CO 산화를 CO*와 O* 사이의 LH 반응으로 단순화하고, O₂는 비해리 흡착이라 가정하자. (a) 속도식을 쓰고 CO 압력에 대한 최대 조건을 유도하시오. (b) K_O p_O = 2일 때 최대 속도에서의 θ_CO와 θ_O는? (c) 냉시동 때 배기가스 정화가 잘 안 되는 이유를 이 식으로 설명하시오.",
        s: "(a) v = kθ_COθ_O = kK_COp_COK_Op_O/(1 + K_COp_CO + K_Op_O)². x = K_COp_CO로 미분하면 (1 + x + y)² − 2x(1 + x + y) = 0, 곧 x = 1 + y (y = K_Op_O). (b) x = 3, 분모 1 + 3 + 2 = 6: θ_CO = 0.5, θ_O = 0.333, 빈자리 0.167. v_max = k × 0.5 × 0.333 = 0.167k. (c) 저온에서는 CO의 흡착 평형 상수 K_CO = K₀e^(−ΔH/RT)가 매우 커서(ΔH ≈ −140 kJ/mol 수준의 강한 화학 흡착) x ≫ 1 + y가 되고, 속도가 v ≈ kK_Op_O/(K_COp_CO)로 CO 압력에 반비례합니다: CO 자기 피독. 촉매가 데워져 K_CO가 작아져야 최대 근처로 올라옵니다(light-off). 그래서 촉매를 엔진 가까이 두거나 전기로 미리 데우는 설계를 씁니다.",
      },
      en: {
        q: "P8. (Langmuir–Hinshelwood) Simplify CO oxidation on Pt to an LH reaction between CO* and O*, assuming non-dissociative O₂ adsorption. (a) Write the rate law and derive the maximum condition with respect to CO pressure. (b) With K_O p_O = 2, what are θ_CO and θ_O at the maximum? (c) Use the equation to explain why exhaust clean-up is poor after a cold start.",
        s: "(a) v = kθ_COθ_O = kK_COp_COK_Op_O/(1 + K_COp_CO + K_Op_O)². Differentiating with respect to x = K_COp_CO gives (1 + x + y)² − 2x(1 + x + y) = 0, i.e. x = 1 + y (y = K_Op_O). (b) x = 3 and the denominator is 1 + 3 + 2 = 6: θ_CO = 0.5, θ_O = 0.333, empty sites 0.167; v_max = k × 0.5 × 0.333 = 0.167k. (c) At low temperature the CO adsorption constant K_CO = K₀e^(−ΔH/RT) is huge (strong chemisorption with ΔH of order −140 kJ/mol), so x ≫ 1 + y and v ≈ kK_Op_O/(K_COp_CO): the rate is inversely proportional to CO pressure, CO self-poisoning. Only when the catalyst warms and K_CO shrinks does the rate climb toward the maximum (light-off). Hence designs that mount the catalyst close to the engine or preheat it electrically.",
      },
    },
  ];
  const [open, setOpen] = useState({});
  const isKo = lang === "ko";
  return (
    <div>
      <Card>
        <Hd>{isKo ? "연습문제 8제" : "Eight practice problems"}</Hd>
        <Note>
          {isKo
            ? "풀이를 열기 전에 스스로 풀어 보십시오. P1–P3은 고체의 결합(쌓임의 틈, 격자 에너지, Hückel 띠), P4–P6은 표면 충돌과 등온선(Langmuir, BET), P7–P8은 탈착 속도와 촉매 반응 속도식입니다. 수치는 Raw 코드 탭의 Python·C++ 코드로 검산했습니다."
            : "Attempt each before opening the solution. P1–P3 cover bonding in solids (holes, lattice energy, Hückel bands), P4–P6 surface collisions and isotherms (Langmuir, BET), and P7–P8 desorption rates and catalytic rate laws. The numbers were checked with the Python and C++ codes in the Raw Codes tab."}
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
  solid_bonding: {
    ko: "충전율·Madelung 상수(Evjen·Ewald)·Born–Mayer·체적 탄성률", en: "Packing · Madelung constant (Evjen, Ewald) · Born–Mayer · bulk modulus",
    codes: { python: PY_BOND, matlab: ML_BOND, julia: JL_BOND, cpp: CPP_BOND },
  },
  huckel_bands: {
    ko: "Hückel 사슬·고리·띠 형성·Fermi–Dirac·진성 Si", en: "Hückel chains and rings · band formation · Fermi–Dirac · intrinsic Si",
    codes: { python: PY_HUCKEL, matlab: ML_HUCKEL, julia: JL_HUCKEL, cpp: CPP_HUCKEL },
  },
  isotherms: {
    ko: "충돌 선속·Langmuir·등량 엔탈피·BET 표면적", en: "Collision flux · Langmuir · isosteric enthalpy · BET area",
    codes: { python: PY_ISO, matlab: ML_ISO, julia: JL_ISO, cpp: CPP_ISO },
  },
  surface_kinetics: {
    ko: "체류 시간·TPD·표면 확산·LH 대 ER·화산 그래프", en: "Residence time · TPD · surface diffusion · LH vs ER · volcano",
    codes: { python: PY_KIN, matlab: ML_KIN, julia: JL_KIN, cpp: CPP_KIN },
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
  const [topic, setTopic] = useState("solid_bonding");
  const [cl, setCl] = useState("python");
  const [copied, setCopied] = useState(false);
  const code = CODE_TOPICS[topic].codes[cl];
  const fname = `wk14_${topic}.${LANG_META[cl].ext}`;

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
            ? "이 페이지의 인터랙티브 뒤에 있는 계산을 직접 실행해 볼 수 있는 독립 코드입니다. Python과 C++은 실행해 확인한 값입니다: 충전율 0.5236·0.6802·0.7405·0.3401, NaCl Evjen 합 1.747567(n = 12), Ewald 합 NaCl 1.747565·CsCl 1.762675·ZnS 1.638055, Born–Mayer 격자 에너지 NaF 893·NaCl 756·KCl 687·CsCl 620 kJ/mol(Born–Haber의 94–97%), NaCl 체적 탄성률 21.9 GPa, Hückel 사슬 고유값의 해석해 일치(오차 10⁻¹⁵), 부타다이엔·벤젠 비편재화 0.472·2.000|β|, 띠 너비 → 4|β|, 진성 Si n_i = 6.7×10⁹ cm⁻³(300 K), N₂ 충돌 선속 2.88×10²⁷ m⁻² s⁻¹, CO/숯 V∞ = 110.6 cm³·K = 7.55×10⁻³ kPa⁻¹, 등량 엔탈피 −7.49 kJ/mol, N₂/루타일 c = 302·V_mon = 814 mm³, TPD 봉우리 1 eV → 385 K와 Redhead 0.992 eV, 확산 길이 300 K 2.4 µm·500 K 50 nm, LH 최대 0.125(K_Ap_A = 2). MATLAB과 Julia 판은 같은 알고리즘을 옮긴 것입니다."
            : "Standalone codes for the calculations behind every interactive on this page. The Python and C++ versions were run and give: packing fractions 0.5236, 0.6802, 0.7405, 0.3401; the NaCl Evjen sum 1.747567 (n = 12); Ewald sums NaCl 1.747565, CsCl 1.762675, ZnS 1.638055; Born–Mayer lattice energies NaF 893, NaCl 756, KCl 687, CsCl 620 kJ/mol (94–97% of Born–Haber); NaCl bulk modulus 21.9 GPa; Hückel chain eigenvalues matching the analytic form (error 10⁻¹⁵); delocalization of butadiene and benzene 0.472 and 2.000|β|; band width → 4|β|; intrinsic Si n_i = 6.7×10⁹ cm⁻³ (300 K); N₂ collision flux 2.88×10²⁷ m⁻² s⁻¹; CO on charcoal V∞ = 110.6 cm³ and K = 7.55×10⁻³ kPa⁻¹; isosteric enthalpy −7.49 kJ/mol; N₂ on rutile c = 302 and V_mon = 814 mm³; a TPD peak at 385 K for 1 eV with Redhead estimate 0.992 eV; diffusion lengths 2.4 µm (300 K) and 50 nm (500 K); LH maximum 0.125 (K_Ap_A = 2). The MATLAB and Julia versions port the same algorithms."}
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
