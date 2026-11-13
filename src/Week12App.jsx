// ============================================================
// Week12App.jsx — Thermal Properties of Solids & Electronic Bands
// Physical Chemistry 2 (물리화학 2)
// SKKU School of Chemical Engineering
// Smart Process & Materials Design Lab (SPMDL)
// Prof. S. Joon Kwon
// ------------------------------------------------------------
// Topics covered (Wk12 Part 1):
//   • Planck distribution, phonon heat capacity, density of states
//   • Einstein model, Debye model (k-space counting, cutoff, T^3 law),
//     low-temperature heat capacity of metals C = gamma T + A T^3
//   • Electrons in a 1D crystal: LCAO, tight-binding Hamiltonian,
//     Bloch solution E(k) = eps0 - 2t cos(ka), band width 4t,
//     band formation, effective mass
//   • Band filling: monovalent metal vs divalent insulator,
//     two atoms per cell, band gap at the zone boundary
// ============================================================
import { useState, useEffect, useRef, useMemo } from "react";
import {
  PY_PLANCK, ML_PLANCK, JL_PLANCK, CPP_PLANCK,
  PY_DEBYE, ML_DEBYE, JL_DEBYE, CPP_DEBYE,
  PY_TB, ML_TB, JL_TB, CPP_TB,
  PY_GAP, ML_GAP, JL_GAP, CPP_GAP,
} from "./Week12Codes";

// ── i18n ─────────────────────────────────────────────────────
const i18n = {
  ko: {
    weekTitle: "Week 12 — 고체의 열적 성질과 전자 띠",
    subtitle: "Planck 분포 · Einstein과 Debye 모형 · T³ 법칙 · LCAO 강결합 모형 · 띠 채움과 금속·절연체 · 띠 간격",
    tabs: {
      overview: "개요",
      planck: "Planck 분포 & 열용량",
      models: "Einstein vs Debye",
      tb: "LCAO & 강결합 띠",
      filling: "띠 채움 & 금속",
      gap: "띠 간격 & 반도체",
      practice: "연습문제",
      codes: "Raw 코드",
    },
  },
  en: {
    weekTitle: "Week 12 — Thermal Properties of Solids & Electronic Bands",
    subtitle: "Planck distribution · Einstein and Debye models · T³ law · LCAO tight binding · Band filling, metals and insulators · Band gaps",
    tabs: {
      overview: "Overview",
      planck: "Planck & Heat Capacity",
      models: "Einstein vs Debye",
      tb: "LCAO & Tight Binding",
      filling: "Band Filling & Metals",
      gap: "Band Gaps & Semiconductors",
      practice: "Practice",
      codes: "Raw Codes",
    },
  },
};

// ── design tokens (Week 12 accent: red) ───────────────────
const C = {
  bg: "#0b0f17",
  panel: "#111827",
  card: "#1f2937",
  border: "#374151",
  text: "#e5e7eb",
  textDim: "#9ca3af",
  accent: "#f87171",
  accentSoft: "#fca5a5",
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

// physical constants
const KB_EV = 8.617333262e-5;      // eV/K
const HBAR_EV = 6.582119569e-16;   // eV s
const RGAS = 8.314462618;
const AMU = 1.66053906660e-27;
const C_CM = 2.99792458e10;
const HBAR2_ME = 7.619964;      // hbar^2/m_e in eV·Å^2

// =============================================================
// MAIN COMPONENT
// =============================================================
export default function Week12App({ onBack, lang: langProp, onLangChange }) {
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
        {tab === "planck" && <PlanckTab lang={lang} />}
        {tab === "models" && <ModelsTab lang={lang} />}
        {tab === "tb" && <TbTab lang={lang} />}
        {tab === "filling" && <FillingTab lang={lang} />}
        {tab === "gap" && <GapTab lang={lang} />}
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
    background: active ? "rgba(248,113,113,0.16)" : "transparent",
    color: active ? C.accentSoft : C.textDim,
    border: `1px solid ${active ? "rgba(248,113,113,0.45)" : "transparent"}`,
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
      tag: "Q1", color: C.accent, tab: "planck",
      ko: "고전 역학은 모든 고체의 몰 열용량이 3R = 24.9 J mol⁻¹ K⁻¹이라고 말한다. 그런데 다이아몬드는 상온에서 그 4분의 1밖에 안 된다. 왜일까?",
      en: "Classical mechanics says every solid has a molar heat capacity of 3R = 24.9 J mol⁻¹ K⁻¹. Yet diamond at room temperature has only a quarter of that. Why?",
      hint: { ko: "진동이 양자화되어 '얼어 있다' → Planck 분포 & 열용량", en: "Its vibrations are quantized and 'frozen' → Planck & Heat Capacity" },
    },
    {
      tag: "Q2", color: C.sky, tab: "models",
      ko: "구리를 상온에서 액체 질소 온도(77 K)까지 식히려면 액체 질소가 얼마나 필요할까? 3R을 쓰면 얼마나 틀릴까?",
      en: "How much liquid nitrogen does it take to cool copper from room temperature to 77 K? How wrong is the answer if we use 3R?",
      hint: { ko: "온도에 따라 열용량이 바뀐다 → Einstein vs Debye", en: "The heat capacity changes with temperature → Einstein vs Debye" },
    },
    {
      tag: "Q3", color: C.teal, tab: "tb",
      ko: "Na 원자는 전자를 하나, Mg 원자는 둘 가진다. 둘 다 금속인데, 전자가 둘인 것이 왜 문제가 될 수 있었을까? 그리고 다이아몬드와 실리콘은 왜 금속이 아닐까?",
      en: "A Na atom has one valence electron and Mg has two. Both are metals, so why could two electrons have been a problem? And why are diamond and silicon not metals?",
      hint: { ko: "원자 궤도함수가 모여 띠를 만들고, 채움이 성질을 정한다 → LCAO & 강결합 띠", en: "Atomic orbitals merge into bands, and filling decides → LCAO & Tight Binding" },
    },
  ];
  return (
    <div>
      <Card>
        <Hd>{isKo ? "이번 주의 질문" : "This week's questions"}</Hd>
        <Note>
          {isKo
            ? "11주차에는 결정의 원자들이 용수철로 이어져 포논이라는 파동을 만든다는 것을 보았습니다. 이번 주 전반부에서는 그 포논을 온도와 연결합니다. 포논이 평균 몇 개 있는지(Planck 분포)를 구하고, 모드들의 진동수 분포를 두 가지로 근사합니다(Einstein, Debye). 그러면 고체의 열용량이 온도에 따라 어떻게 바뀌는지 설명됩니다. 후반부에서는 원자 대신 전자를 봅니다. 분자 궤도함수를 만들 때 쓴 LCAO를 원자 N개에 적용하면, 에너지 준위들이 띠를 이룹니다. 그 띠를 얼마나 채우느냐에 따라 금속, 절연체, 반도체가 갈립니다."
            : "In Week 11 we saw that atoms joined by springs carry waves called phonons. In the first half of this week we connect those phonons to temperature: we find how many phonons sit in a mode on average (the Planck distribution) and approximate the spread of mode frequencies in two ways (Einstein and Debye). This explains how the heat capacity of a solid changes with temperature. In the second half we turn from atoms to electrons. Applying the LCAO method used for molecular orbitals to N atoms turns the energy levels into bands, and how full those bands are decides whether the solid is a metal, an insulator or a semiconductor."}
        </Note>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12, marginTop: 10 }}>
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
          <Stat label={isKo ? "모드 하나의 평균 포논 수 (k_BT = ħω)" : "Mean phonon number of one mode (k_BT = ħω)"} value="⟨n⟩ = 0.582" color={C.accent} />
          <Stat label={isKo ? "Debye T³ 법칙의 계수 (12π⁴/5)R" : "Debye T³ coefficient (12π⁴/5)R"} value="1943.8 J mol⁻¹ K⁻¹" color={C.accent} />
          <Stat label={isKo ? "고온에서 두 모형을 맞추는 조건" : "High-T matching of the two models"} value="θ_E = √0.6 θ_D = 0.775 θ_D" color={C.sky} />
          <Stat label={isKo ? "Cu: 전자와 포논 열용량이 같아지는 온도" : "Cu: electron and phonon heat capacities equal at"} value="3.8 K" color={C.sky} />
          <Stat label={isKo ? "1D 강결합 띠의 폭" : "Width of the 1D tight-binding band"} value="4t" color={C.teal} />
          <Stat label={isKo ? "유효 질량 (t = 1 eV, a = 2.5 Å)" : "Effective mass (t = 1 eV, a = 2.5 Å)"} value="m* = 0.610 m_e" color={C.teal} />
          <Stat label={isKo ? "반만 찬 띠의 결합 에너지 (원자당)" : "Binding energy of a half-filled band (per atom)"} value="−4t/π = −1.273t" color={C.purple} />
          <Stat label={isKo ? "결합 교대 δ가 여는 띠 간격" : "Gap opened by bond alternation δ"} value="E_g = 4δt₀" color={C.purple} />
        </StatGrid>
        <Note>
          {isKo
            ? "출처: Einstein 모형은 A. Einstein, Ann. Phys. (4) 22, 180 (1907). Debye 모형은 P. Debye, Ann. Phys. 344, 789 (1912). Cu의 γ = 0.695 mJ mol⁻¹ K⁻²와 θ_D = 343 K는 C. Kittel, Introduction to Solid State Physics, 8th ed. (Wiley, 2005), 5·6장 표."
            : "Sources: the Einstein model is A. Einstein, Ann. Phys. (4) 22, 180 (1907); the Debye model is P. Debye, Ann. Phys. 344, 789 (1912). For Cu, γ = 0.695 mJ mol⁻¹ K⁻² and θ_D = 343 K are from the tables in Chapters 5 and 6 of C. Kittel, Introduction to Solid State Physics, 8th ed. (Wiley, 2005)."}
        </Note>
      </Card>
    </div>
  );
}

function LectureMap({ isKo }) {
  const p1 = isKo
    ? [["Planck 분포", "포논의 평균 개수, 고전 극한, 모드 하나의 열용량"], ["상태 밀도", "모든 모드를 더하기, C_V = k_B∫D(ω)x²e^x/(e^x − 1)²"], ["Einstein과 Debye 모형", "k 공간 세기, 한계 진동수 ω_D, T³ 법칙"], ["금속의 저온 열용량", "C = γT + AT³, C/T 대 T² 그래프"]]
    : [["Planck distribution", "mean phonon number, classical limit, heat capacity of one mode"], ["Density of states", "summing all modes, C_V = k_B∫D(ω)x²e^x/(e^x − 1)²"], ["Einstein and Debye models", "counting in k-space, cutoff ω_D, the T³ law"], ["Low-T heat capacity of metals", "C = γT + AT³, plotting C/T against T²"]];
  const p2 = isKo
    ? [["LCAO와 강결합 모형", "Hamiltonian 행렬, Bloch 풀이 E = ε₀ − 2t cos ka"], ["띠의 형성", "원자 간격과 띠 폭 4t, 유효 질량"], ["띠 채움", "1가 금속과 2가 절연체, 결합 에너지, 띠 겹침"], ["띠 간격", "세포당 원자 둘, Peierls 불안정성, 반도체"]]
    : [["LCAO and tight binding", "Hamiltonian matrix, Bloch solution E = ε₀ − 2t cos ka"], ["Band formation", "spacing and band width 4t, effective mass"], ["Band filling", "monovalent metal vs divalent insulator, binding energy, band overlap"], ["Band gaps", "two atoms per cell, the Peierls instability, semiconductors"]];
  const col = (title, items, color) => (
    <div style={{ flex: "1 1 320px" }}>
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
      {col(isKo ? "Part 1 · 고체의 열적 성질" : "Part 1 · Thermal properties of solids", p1, C.accent)}
      {col(isKo ? "Part 2 · 결정 속의 전자: 띠 이론" : "Part 2 · Electrons in crystals: band theory", p2, C.teal)}
    </div>
  );
}

// =============================================================
// 2) PLANCK DISTRIBUTION & PHONON HEAT CAPACITY
// =============================================================
const planckN = x => 1 / Math.expm1(x);
function einsteinCx(x) {           // C/k for one oscillator, x = hbar*omega/kT
  if (x < 1e-6) return 1;
  if (x > 700) return 0;
  const e = Math.exp(x);
  return x * x * e / ((e - 1) * (e - 1));
}

function PlanckTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <PlanckDerivCard isKo={isKo} />
      <LadderLab isKo={isKo} />
      <PlanckCurveLab isKo={isKo} />
      <HeatCapGeneralCard isKo={isKo} />
    </div>
  );
}

function PlanckDerivCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "Planck 분포: 진동 모드 하나에 포논이 평균 몇 개 있나" : "Planck distribution: how many phonons sit in one mode on average"}</Hd>
      <Note>
        {isKo
          ? "11주차에 결정의 진동을 정상 모드로 나누었고, 각 모드는 진동수 ω인 조화 진동자였습니다. 3주차에서 배운 대로 조화 진동자의 에너지는 E_s = (s + ½)ħω로 양자화됩니다. 정수 s를 그 모드에 들어 있는 '포논의 개수'로 읽습니다. 그러면 온도 T에서 s의 평균, 곧 평균 포논 수가 열용량 계산의 출발점이 됩니다."
          : "In Week 11 we split crystal vibrations into normal modes, each a harmonic oscillator of frequency ω. As in Week 3, its energy is quantized as E_s = (s + ½)ħω. Read the integer s as the number of phonons in that mode; the average of s at temperature T, the mean phonon number, is then the starting point for the heat capacity."}
      </Note>
      <Eq>N_(s+1)/N_s = exp(−ħω/k_BT) ≡ e^(−x)      {isKo ? "(Boltzmann 비, 이웃한 두 준위)" : "(Boltzmann ratio of neighbouring levels)"}</Eq>
      <Eq>P_s = e^(−sx) / Σ_j e^(−jx) = (1 − e^(−x)) e^(−sx)      {isKo ? "(기하급수 Σ_j e^(−jx) = 1/(1 − e^(−x)))" : "(geometric series Σ_j e^(−jx) = 1/(1 − e^(−x)))"}</Eq>
      <Eq>⟨n⟩ = Σ_s s P_s = −(1 − e^(−x)) d/dx Σ_s e^(−sx) = e^(−x)/(1 − e^(−x)) = 1/(e^x − 1)</Eq>
      <Eq style={{ color: C.accent }}>⟨n⟩ = 1 / [exp(ħω/k_BT) − 1]      {isKo ? "Planck 분포" : "Planck distribution"}</Eq>
      <Note>
        {isKo
          ? "가운데 줄의 요령은 Σ s e^(−sx) = −d/dx Σ e^(−sx)입니다. 기하급수의 합을 미분하면 평균이 바로 나옵니다. 높은 온도(x ≪ 1)에서는 ⟨n⟩ ≈ k_BT/ħω − ½로 고전 등분배와 같아지고, 낮은 온도(x ≫ 1)에서는 ⟨n⟩ ≈ e^(−x)로 지수적으로 사라집니다."
          : "The trick in the middle line is Σ s e^(−sx) = −d/dx Σ e^(−sx): differentiating the geometric sum gives the average directly. At high temperature (x ≪ 1), ⟨n⟩ ≈ k_BT/ħω − ½, matching classical equipartition; at low temperature (x ≫ 1), ⟨n⟩ ≈ e^(−x) vanishes exponentially."}
      </Note>
    </Card>
  );
}

function LadderLab({ isKo }) {
  const [tau, setTau] = useState(1.0);     // kT / hbar omega
  const x = 1 / tau, levels = 8;
  const P = Array.from({ length: levels }, (_, s) => (1 - Math.exp(-x)) * Math.exp(-s * x));
  const n = planckN(x);
  const W = 640, Ht = 300, padL = 70, rowH = (Ht - 30) / levels;
  return (
    <Card>
      <Hd>{isKo ? "실험실 ① 진동 준위 사다리와 점유 확률" : "Lab ① The ladder of vibrational levels and their populations"}</Hd>
      <Row>
        <Slider label={isKo ? "온도 k_BT/ħω" : "Temperature k_BT/ħω"} value={tau} min={0.1} max={5} step={0.05} onChange={setTau} fmt={v => v.toFixed(2)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        {P.map((p, s) => {
          const y = Ht - 20 - s * rowH;
          return (
            <g key={s}>
              <line x1={padL} x2={padL + 120} y1={y} y2={y} stroke="#e5e7eb" strokeWidth={2} />
              <text x={padL - 10} y={y + 4} fill={C.textDim} fontSize={12} textAnchor="end">s = {s}</text>
              <rect x={padL + 140} y={y - rowH * 0.35} width={Math.max(1, p * 420)} height={rowH * 0.6} fill={C.accent} opacity={0.85} />
              <text x={padL + 150 + p * 420} y={y + 4} fill={C.text} fontSize={12}>{(100 * p).toFixed(1)}%</text>
            </g>
          );
        })}
        <text x={padL} y={14} fill={C.textDim} fontSize={12}>{isKo ? "E_s = (s + ½)ħω" : "E_s = (s + ½)ħω"}</text>
        <text x={padL + 140} y={14} fill={C.textDim} fontSize={12}>{isKo ? "점유 확률 P_s" : "population P_s"}</text>
      </svg>
      <StatGrid>
        <Stat label={isKo ? "평균 포논 수 ⟨n⟩ = 1/(e^x − 1)" : "Mean phonon number ⟨n⟩ = 1/(e^x − 1)"} value={n.toFixed(4)} color={C.accent} />
        <Stat label={isKo ? "고전 근사 k_BT/ħω − ½" : "Classical estimate k_BT/ħω − ½"} value={(tau - 0.5).toFixed(4)} color={C.textDim} />
        <Stat label={isKo ? "바닥 상태 비율 P₀ = 1 − e^(−x)" : "Ground-state fraction P₀ = 1 − e^(−x)"} value={`${(100 * P[0]).toFixed(1)}%`} color={C.sky} />
        <Stat label={isKo ? "모드 하나의 열용량 C/k_B" : "Heat capacity of one mode C/k_B"} value={einsteinCx(x).toFixed(4)} color={C.ok} />
      </StatGrid>
      <Note>
        {isKo
          ? "k_BT/ħω = 1이면 바닥 상태가 63.2%, 첫 들뜬 상태가 23.3%이고 ⟨n⟩ = 0.582입니다. 온도를 0.2까지 낮추면 거의 모든 진동자가 바닥에 갇혀 열을 받아들이지 못합니다. 이것이 낮은 온도에서 열용량이 사라지는 양자 효과의 핵심입니다."
          : "At k_BT/ħω = 1 the ground state holds 63.2% and the first excited state 23.3%, with ⟨n⟩ = 0.582. Lower the temperature to 0.2 and almost every oscillator is frozen in the ground state and cannot absorb heat: the quantum origin of the vanishing heat capacity at low temperature."}
      </Note>
    </Card>
  );
}

function PlanckCurveLab({ isKo }) {
  const W = 640, Ht = 300, pad = 48;
  const { X, Y } = plotScale(0, 3, 0, 3, W, Ht, pad);
  const ts = [];
  for (let i = 1; i <= 200; i++) ts.push(i * 3 / 200);
  return (
    <Card>
      <Hd>{isKo ? "⟨n⟩, 평균 에너지, 열용량: 양자와 고전의 비교" : "⟨n⟩, mean energy and heat capacity: quantum versus classical"}</Hd>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel="k_BT / ħω" ylabel={isKo ? "값" : "value"} />
        {[0, 1, 2, 3].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        {[0, 1, 2, 3].map(v => <text key={`y${v}`} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        <path d={pathOf(ts.map(t => [t, Math.min(3, planckN(1 / t))]), X, Y)} fill="none" stroke={C.accent} strokeWidth={2.4} />
        <path d={pathOf(ts.filter(t => t > 0.5).map(t => [t, t - 0.5]), X, Y)} fill="none" stroke={C.textDim} strokeDasharray="5 4" />
        <path d={pathOf(ts.map(t => [t, einsteinCx(1 / t)]), X, Y)} fill="none" stroke={C.ok} strokeWidth={2.4} />
        <text x={X(2.2)} y={Y(planckN(1 / 2.2)) - 8} fill={C.accent} fontSize={12}>⟨n⟩</text>
        <text x={X(2.2)} y={Y(1.0) - 8} fill={C.ok} fontSize={12}>C / k_B</text>
        <text x={X(1.0)} y={Y(0.5) - 10} fill={C.textDim} fontSize={11}>{isKo ? "고전: k_BT/ħω − ½" : "classical: k_BT/ħω − ½"}</text>
      </svg>
      <Note>
        {isKo
          ? "모드 하나의 열용량 C/k_B = x²e^x/(e^x − 1)²는 높은 온도에서 1(고전 등분배)로, 낮은 온도에서 0으로 갑니다. 고전값의 절반이 되는 곳은 k_BT ≈ ħω/3 근처입니다(x = 3에서 0.49). 결정 전체의 열용량은 이런 곡선을 모든 모드에 대해 더한 것이므로, 모드들의 진동수 분포(상태 밀도)가 곡선의 모양을 정합니다."
          : "The single-mode heat capacity C/k_B = x²e^x/(e^x − 1)² tends to 1 (classical equipartition) at high temperature and to 0 at low temperature, reaching half the classical value near k_BT ≈ ħω/3 (0.49 at x = 3). The crystal's heat capacity is the sum of such curves over all modes, so the distribution of mode frequencies (the density of states) sets its shape."}
      </Note>
    </Card>
  );
}

function HeatCapGeneralCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "모든 모드를 더하기: 상태 밀도 D(ω)" : "Summing all modes: the density of states D(ω)"}</Hd>
      <Eq>U = Σ_k ⟨n_k⟩ ħω_k  →  U = ∫ dω D(ω) ħω / [exp(ħω/k_BT) − 1]</Eq>
      <Eq>C_V = (∂U/∂T)_V = k_B ∫ dω D(ω) x² e^x / (e^x − 1)²,   x = ħω/k_BT</Eq>
      <Note>
        {isKo
          ? "D(ω)dω는 진동수가 ω와 ω + dω 사이인 모드의 수입니다. 모드는 모두 3N개이므로 ∫D(ω)dω = 3N입니다. 이제 남은 일은 D(ω)를 정하는 것뿐입니다. 가장 단순한 두 선택이 Einstein 모형(모든 모드가 같은 진동수)과 Debye 모형(음파처럼 ω = vk, 한계 진동수에서 자름)입니다. 다음 탭에서 둘을 비교합니다. 영점 에너지 ½ħω는 온도에 무관하므로 열용량에는 기여하지 않아 U에서 뺐습니다."
          : "D(ω)dω is the number of modes with frequencies between ω and ω + dω; there are 3N modes in all, so ∫D(ω)dω = 3N. All that remains is to choose D(ω). The two simplest choices are the Einstein model (every mode at one frequency) and the Debye model (sound-like ω = vk, cut off at a limiting frequency), compared in the next tab. The zero-point energy ½ħω does not depend on temperature, contributes nothing to the heat capacity, and is dropped from U."}
      </Note>
    </Card>
  );
}

// =============================================================
// 3) EINSTEIN vs DEBYE, AND THE HEAT CAPACITY OF METALS
// =============================================================
const RG = 8.314462618;
function debyeCvMolar(T, th, n = 400) {
  const xD = th / T;
  let s = 0;
  for (let i = 0; i < n; i++) { const x = (i + 0.5) * xD / n; s += x > 700 ? 0 : Math.pow(x, 4) * Math.exp(x) / Math.pow(Math.expm1(x), 2); }
  return 9 * RG * Math.pow(T / th, 3) * s * xD / n;
}
const einsteinCvMolar = (T, th) => 3 * RG * einsteinCx(th / T);
const T3COEF = 12 * Math.pow(Math.PI, 4) / 5 * RG;       // 1943.8 J/mol/K
const THETA_D = [["Pb", 105], ["Ag", 225], ["Cu", 343], ["Ge", 374], ["Al", 428], ["Si", 645], ["C (diamond)", 2230]];

function ModelsTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <EinsteinDebyeDerivCard isKo={isKo} />
      <KCountLab isKo={isKo} />
      <CvCompareLab isKo={isKo} />
      <MetalLab isKo={isKo} />
      <CryoCaseCard isKo={isKo} />
    </div>
  );
}

function EinsteinDebyeDerivCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "두 모형: 상태 밀도를 어떻게 고르는가" : "Two models: how to choose the density of states"}</Hd>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 14 }}>
        <div>
          <HdSub>Einstein (1907)</HdSub>
          <Eq>D(ω) = 3N δ(ω − ω_E)</Eq>
          <Eq>C_V = 3Nk_B x² e^x/(e^x − 1)²,   x = θ_E/T</Eq>
          <Note>{isKo ? "모든 원자가 같은 진동수로 따로 떤다고 본다. 높은 온도에서 3Nk_B(Dulong–Petit)를 주지만, 낮은 온도에서는 e^(−θ_E/T)로 너무 빨리 사라진다." : "Every atom vibrates independently at one frequency. Gives 3Nk_B (Dulong–Petit) at high T, but vanishes too fast, as e^(−θ_E/T), at low T."}</Note>
        </div>
        <div>
          <HdSub>Debye (1912)</HdSub>
          <Eq>D(ω) = 3Vω² / (2π²v³)  (ω ≤ ω_D),   0  (ω &gt; ω_D)</Eq>
          <Eq>C_V = 9Nk_B (T/θ_D)³ ∫₀^(θ_D/T) x⁴e^x/(e^x − 1)² dx</Eq>
          <Note>{isKo ? "11주차의 음향 포논처럼 ω = vk로 두고, 모드 수가 3N이 되는 한계 진동수 ω_D에서 자른다. 낮은 온도에서 T³으로 줄어 실험과 맞는다." : "Take ω = vk like the acoustic phonons of Week 11 and cut off at ω_D so that there are 3N modes. Falls as T³ at low T, matching experiment."}</Note>
        </div>
      </div>
      <HdSub>{isKo ? "Debye 상태 밀도 유도 (한 편광)" : "Debye density of states (one polarization)"}</HdSub>
      <Eq>k = (2π/L)(n_x, n_y, n_z)  →  {isKo ? "k 공간 부피 (2π/L)³마다 k 하나" : "one k per k-space volume (2π/L)³"}</Eq>
      <Eq>N(k) = (4/3)πk³ / (2π/L)³ = Vk³/6π²   →   D(ω) = dN/dω = Vω²/(2π²v³)   (ω = vk)</Eq>
      <Eq>3 × ∫₀^(ω_D) Vω²/(2π²v³) dω = 3N   →   ω_D = v(6π²N/V)^(1/3),   θ_D = ħω_D/k_B</Eq>
    </Card>
  );
}

function KCountLab({ isKo }) {
  const [M, setM] = useState(8);
  const count = useMemo(() => {
    let c = 0;
    for (let i = -M; i <= M; i++) for (let j = -M; j <= M; j++) for (let k = -M; k <= M; k++) if (i * i + j * j + k * k <= M * M) c++;
    return c;
  }, [M]);
  const formula = 4 / 3 * Math.PI * M * M * M;
  const W = 360, Ht = 360, cx = W / 2, cy = Ht / 2, sc = (W / 2 - 14) / (M + 1);
  const pts = [];
  for (let i = -M - 1; i <= M + 1; i++) for (let j = -M - 1; j <= M + 1; j++) pts.push([i, j, i * i + j * j <= M * M]);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ① k 공간에서 모드 세기: 구 안의 격자점" : "Lab ① Counting modes in k-space: lattice points inside a sphere"}</Hd>
      <Note>{isKo ? "주기 경계 조건에서 허용된 k는 간격 2π/L인 3D 격자점입니다. 반지름 k(= M × 2π/L)인 구 안의 점의 수를 직접 세어 공식 (4/3)πM³과 비교합니다. 그림은 k_z = 0 단면입니다." : "With periodic boundary conditions the allowed k form a 3D lattice of spacing 2π/L. Count the points inside a sphere of radius k (= M × 2π/L) directly and compare with (4/3)πM³. The picture shows the k_z = 0 slice."}</Note>
      <Row><Slider label={isKo ? "구의 반지름 M (2π/L 단위)" : "Sphere radius M (units of 2π/L)"} value={M} min={2} max={30} step={1} onChange={setM} /></Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <svg viewBox={`0 0 ${W} ${Ht}`} style={{ ...svgBox(W), flex: "0 1 360px" }}>
          {pts.map(([i, j, inside], n) => <circle key={n} cx={cx + i * sc} cy={cy + j * sc} r={Math.max(1, Math.min(3, sc * 0.18))} fill={inside ? C.accent : "#475569"} />)}
          <circle cx={cx} cy={cy} r={M * sc} fill="none" stroke={C.sky} strokeWidth={2} />
        </svg>
        <div style={{ flex: "1 1 260px" }}>
          <StatGrid min={220}>
            <Stat label={isKo ? "구 안의 격자점 (3D, 직접 셈)" : "Lattice points in the sphere (3D, counted)"} value={count.toLocaleString()} color={C.accent} />
            <Stat label={isKo ? "공식 (4/3)πM³" : "Formula (4/3)πM³"} value={formula.toFixed(1)} color={C.sky} />
            <Stat label={isKo ? "비율" : "Ratio"} value={(count / formula).toFixed(4)} color={C.ok} />
          </StatGrid>
          <Note>{isKo ? "M이 커질수록 비율이 1에 가까워집니다(M = 40에서 0.9988). 실제 결정은 M ~ 10⁸ 정도이므로 공식이 사실상 정확합니다." : "The ratio approaches 1 as M grows (0.9988 at M = 40). A real crystal has M ~ 10⁸, so the formula is effectively exact."}</Note>
        </div>
      </div>
    </Card>
  );
}

function CvCompareLab({ isKo }) {
  const [thD, setThD] = useState(343);
  const [log, setLog] = useState(false);
  const thE = 0.775 * thD;      // same high-T expansion: theta_E^2/12 = theta_D^2/20 -> theta_E = sqrt(0.6) theta_D
  const W = 660, Ht = 320, pad = 54;
  const Tmax = 1.6 * thD;
  const Ts = [];
  for (let i = 1; i <= 220; i++) Ts.push(log ? Math.exp(Math.log(0.01 * thD) + i / 220 * Math.log(160)) : i * Tmax / 220);
  const deb = Ts.map(T => [T, debyeCvMolar(T, thD)]);
  const ein = Ts.map(T => [T, einsteinCvMolar(T, thE)]);
  let X, Y;
  if (log) {
    const s = plotScale(Math.log10(0.01 * thD), Math.log10(1.6 * thD), -6, Math.log10(30), W, Ht, pad);
    X = T => s.X(Math.log10(T)); Y = c => s.Y(Math.log10(Math.max(c, 1e-6)));
  } else {
    const s = plotScale(0, Tmax, 0, 27, W, Ht, pad); X = s.X; Y = s.Y;
  }
  const pathL = pts => pts.map(([a, b], i) => `${i ? "L" : "M"}${X(a).toFixed(1)} ${Y(b).toFixed(1)}`).join(" ");
  return (
    <Card>
      <Hd>{isKo ? "실험실 ② Einstein과 Debye의 열용량 곡선" : "Lab ② Einstein and Debye heat-capacity curves"}</Hd>
      <Row>
        <Slider label={isKo ? "Debye 온도 θ_D" : "Debye temperature θ_D"} value={thD} min={80} max={2300} step={1} onChange={setThD} unit=" K" />
        {THETA_D.map(([nm, th]) => <button key={nm} style={btnStyle(thD === th)} onClick={() => setThD(th)}>{nm}</button>)}
        <button style={btnStyle(log)} onClick={() => setLog(v => !v)}>{isKo ? "로그 눈금" : "log scale"}</button>
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel="T (K)" ylabel="C_V (J mol⁻¹ K⁻¹)" />
        {!log && <line x1={pad} x2={W - pad} y1={Y(3 * RG)} y2={Y(3 * RG)} stroke={C.textDim} strokeDasharray="2 4" />}
        <path d={pathL(deb)} fill="none" stroke={C.accent} strokeWidth={2.4} />
        <path d={pathL(ein)} fill="none" stroke={C.sky} strokeWidth={2.2} strokeDasharray="6 4" />
        {log && <path d={pathL(Ts.filter(T => T < 0.3 * thD).map(T => [T, T3COEF * Math.pow(T / thD, 3)]))} fill="none" stroke={C.lime} strokeWidth={1.5} />}
        <text x={W - pad - 4} y={pad + 4} fill={C.accent} fontSize={12} textAnchor="end">Debye</text>
        <text x={W - pad - 4} y={pad + 20} fill={C.sky} fontSize={12} textAnchor="end">Einstein (θ_E = 0.775 θ_D)</text>
        {log && <text x={W - pad - 4} y={pad + 36} fill={C.lime} fontSize={12} textAnchor="end">T³: 1944 (T/θ_D)³</text>}
        {!log && <text x={W - pad - 4} y={Y(3 * RG) - 6} fill={C.textDim} fontSize={11} textAnchor="end">3R = 24.94</text>}
      </svg>
      <StatGrid>
        <Stat label={isKo ? "Debye C_V at T = θ_D/10" : "Debye C_V at T = θ_D/10"} value={`${debyeCvMolar(thD / 10, thD).toFixed(3)} J/mol·K`} color={C.accent} />
        <Stat label={isKo ? "같은 온도의 Einstein" : "Einstein at the same T"} value={`${einsteinCvMolar(thD / 10, thE).toExponential(2)} J/mol·K`} color={C.sky} />
        <Stat label={isKo ? "T³ 법칙 계수 12π⁴R/5" : "T³ coefficient 12π⁴R/5"} value="1943.8 J/mol·K" color={C.lime} />
        <Stat label={isKo ? "Debye C_V at 300 K" : "Debye C_V at 300 K"} value={`${debyeCvMolar(300, thD).toFixed(2)} J/mol·K`} color={C.textDim} />
      </StatGrid>
      <Note>
        {isKo
          ? "로그 눈금으로 바꿔 보십시오. 낮은 온도에서 Debye 곡선은 기울기 3인 직선(T³)이 되지만 Einstein 곡선은 절벽처럼 떨어집니다. 둘을 비교하려고 고온 전개가 같아지도록 θ_E = √0.6 θ_D = 0.775 θ_D로 맞췄습니다. Debye 온도 값(Pb 105 K부터 다이아몬드 2230 K까지)은 Kittel 교과서 표의 저온값입니다. 다이아몬드는 원자가 가볍고 결합이 단단해 θ_D가 크므로, 상온에서도 C_V가 3R보다 훨씬 작습니다."
          : "Switch to log scale: at low temperature the Debye curve becomes a straight line of slope 3 (T³), while the Einstein curve drops like a cliff. For a fair comparison θ_E = √0.6 θ_D = 0.775 θ_D makes their high-temperature expansions agree. The Debye temperatures (Pb 105 K up to diamond 2230 K) are the low-temperature values tabulated in Kittel. Diamond has light atoms and stiff bonds, hence a large θ_D, so even at room temperature its C_V is far below 3R."}
      </Note>
    </Card>
  );
}

function MetalLab({ isKo }) {
  const [metal, setMetal] = useState(true);
  const gamma = metal ? 0.695e-3 : 0;      // J mol^-1 K^-2 (Cu, observed)
  const thD = 343;
  const A = T3COEF / Math.pow(thD, 3);      // J mol^-1 K^-4
  const W = 620, Ht = 300, pad = 60;
  const T2max = 25;                          // K^2, i.e. T up to 5 K
  const { X, Y } = plotScale(0, T2max, 0, 2.0, W, Ht, pad);
  const pts = [];
  for (let i = 0; i <= 50; i++) { const T2 = i * T2max / 50; pts.push([T2, (gamma + A * T2) * 1e3]); }
  return (
    <Card>
      <Hd>{isKo ? "실험실 ③ 금속의 저온 열용량: C = γT + AT³" : "Lab ③ Low-temperature heat capacity of metals: C = γT + AT³"}</Hd>
      <Note>
        {isKo
          ? "금속에는 포논 말고도 자유롭게 움직이는 전자가 있습니다. 띠가 반만 찬 금속에서는 Fermi 준위 근처의 전자만 열을 받을 수 있고, 그 수가 T에 비례해 전자 열용량 γT가 생깁니다(띠 채움 탭 참고). 그래서 C/T를 T²에 대해 그리면 직선이 되고, 절편이 γ, 기울기가 A입니다. 전자 기여가 없다면 직선은 원점을 지납니다(강의 8쪽)."
          : "Besides phonons, a metal has mobile electrons. In a partly filled band only electrons near the Fermi level can absorb heat, and their number grows as T, giving an electronic heat capacity γT (see the Band Filling tab). Plotting C/T against T² therefore gives a straight line with intercept γ and slope A; without the electronic term the line would pass through the origin (lecture page 8)."}
      </Note>
      <Row>
        <button style={btnStyle(metal)} onClick={() => setMetal(true)}>{isKo ? "Cu (금속)" : "Cu (metal)"}</button>
        <button style={btnStyle(!metal)} onClick={() => setMetal(false)}>{isKo ? "같은 θ_D의 절연체" : "Insulator with the same θ_D"}</button>
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel="T² (K²)" ylabel="C/T (mJ mol⁻¹ K⁻²)" />
        {[0, 5, 10, 15, 20, 25].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        {[0, 0.5, 1, 1.5, 2].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        <path d={pathOf(pts, X, Y)} fill="none" stroke={metal ? C.accent : C.sky} strokeWidth={2.6} />
        <circle cx={X(0)} cy={Y(gamma * 1e3)} r={6} fill="#fde047" />
      </svg>
      <StatGrid>
        <Stat label={isKo ? "절편 γ (Cu, 실측)" : "Intercept γ (Cu, observed)"} value={`${(gamma * 1e3).toFixed(3)} mJ mol⁻¹ K⁻²`} color="#fde047" />
        <Stat label={isKo ? "기울기 A = 1944/θ_D³ (θ_D = 343 K)" : "Slope A = 1944/θ_D³ (θ_D = 343 K)"} value={`${(A * 1e3).toFixed(4)} mJ mol⁻¹ K⁻⁴`} color={C.accent} />
        <Stat label={isKo ? "전자 = 포논이 되는 온도 √(γ/A)" : "Temperature where electrons = phonons, √(γ/A)"} value={metal ? `${Math.sqrt(gamma / A).toFixed(2)} K` : "—"} color={C.ok} />
      </StatGrid>
      <Note>
        {isKo
          ? "Cu의 γ = 0.695 mJ mol⁻¹ K⁻²(자유 전자 모형 값은 0.505)를 쓰면, 약 3.8 K 아래에서는 전자 열용량이 포논보다 큽니다. 극저온 냉각 장치의 설계에서 금속 부품의 열용량을 계산할 때 이 γT 항을 빠뜨리면 안 되는 이유입니다."
          : "With Cu's γ = 0.695 mJ mol⁻¹ K⁻² (free-electron value 0.505), electrons outweigh phonons below about 3.8 K. That is why the γT term cannot be dropped when computing the heat capacity of metal parts in cryogenic equipment."}
      </Note>
    </Card>
  );
}

function CryoCaseCard({ isKo }) {
  const dH = 70.4, dHdp = 87.5, Lv = 199.2, rho = 806;
  return (
    <Card>
      <Hd>{isKo ? "화학공학 사례: 구리 1 kg을 액체 질소로 식히려면" : "Chemical-engineering case: cooling 1 kg of copper with liquid nitrogen"}</Hd>
      <Note>
        {isKo
          ? "극저온 공정(공기 분리, LNG, 초전도 장비)에서는 장비를 처음 식힐 때 필요한 냉매량을 계산해야 합니다. 구리 1 kg을 300 K에서 77 K까지 식힐 때 빼내야 하는 열은 ΔH = ∫C dT입니다. 고체에서는 C_p ≈ C_V로 둡니다."
          : "Cryogenic processes (air separation, LNG, superconducting equipment) require the coolant needed for the initial cool-down. Cooling 1 kg of copper from 300 K to 77 K requires removing ΔH = ∫C dT, with C_p ≈ C_V for a solid."}
      </Note>
      <StatGrid min={240}>
        <Stat label={isKo ? "Debye 모형 ΔH (θ_D = 343 K)" : "Debye model ΔH (θ_D = 343 K)"} value={`${dH} kJ/kg`} color={C.accent} />
        <Stat label={isKo ? "Dulong–Petit 3R × 223 K" : "Dulong–Petit 3R × 223 K"} value={`${dHdp} kJ/kg (+24%)`} color={C.textDim} />
        <Stat label={isKo ? "액체 질소 증발 잠열 (77.36 K)" : "LN₂ latent heat (77.36 K)"} value={`${Lv} kJ/kg`} color={C.sky} />
        <Stat label={isKo ? "필요한 LN₂ (잠열만 사용)" : "LN₂ needed (latent heat only)"} value={`${(dH / Lv).toFixed(2)} kg = ${(dH / Lv / rho * 1000).toFixed(2)} L`} color={C.ok} />
      </StatGrid>
      <Note>
        {isKo
          ? "Dulong–Petit 값을 그대로 쓰면 냉매량을 24% 많게 잡습니다. 낮은 온도에서 열용량이 줄어드는 양자 효과 때문입니다. 실제 공정에서는 증발한 차가운 질소 기체의 현열도 이용하므로 필요량은 더 줄어듭니다. 데이터: 구리 상온 C_p = 24.44 J mol⁻¹ K⁻¹ (NIST-JANAF), 액체 질소 밀도 806 kg/m³ (NIST 기준식, Span 외 2000)."
          : "Using Dulong–Petit overestimates the coolant by 24%, because quantum effects shrink the heat capacity at low temperature. In practice the sensible heat of the cold evaporated nitrogen is also used, so the requirement is lower still. Data: copper C_p at room temperature 24.44 J mol⁻¹ K⁻¹ (NIST-JANAF); liquid-nitrogen density 806 kg/m³ (NIST reference equation, Span et al. 2000)."}
      </Note>
    </Card>
  );
}

// =============================================================
// 4) LCAO & TIGHT-BINDING BAND
// =============================================================
const tbE = (k, t, eps0 = 0) => eps0 - 2 * t * Math.cos(k);   // k in units of 1/a

function TbTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <TbDerivCard isKo={isKo} />
      <RingLab isKo={isKo} />
      <BandFormationLab isKo={isKo} />
      <EffMassLab isKo={isKo} />
    </div>
  );
}

function TbDerivCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "1D 결정의 전자: 원자 궤도함수를 겹쳐서 띠를 만든다" : "Electrons in a 1D crystal: building a band from atomic orbitals"}</Hd>
      <Note>
        {isKo
          ? "11주차의 원자 사슬을 이번에는 전자의 눈으로 봅니다. 원자 n마다 궤도함수 |n⟩가 하나씩 있고, 서로 직교한다고 둡니다(⟨m|n⟩ = δ_mn). 결정 속 전자의 파동 함수를 이 궤도함수들의 선형 결합(LCAO)으로 씁니다. 5주차 이전에 배운 H₂⁺의 결합·반결합 궤도함수를 원자 N개로 늘린 것과 같습니다."
          : "Now look at the atomic chain of Week 11 through the eyes of an electron. Each atom n carries one orbital |n⟩, taken orthonormal (⟨m|n⟩ = δ_mn). Write the crystal wavefunction as a linear combination of these orbitals (LCAO): the bonding and antibonding orbitals of H₂⁺, extended to N atoms."}
      </Note>
      <Eq>|ψ⟩ = Σ_n c_n |n⟩,   H|ψ⟩ = E|ψ⟩   →   Σ_m ⟨n|H|m⟩ c_m = E c_n</Eq>
      <Eq>{isKo ? "강결합 근사:" : "Tight binding:"}  ⟨n|H|m⟩ = ε₀ δ_nm − t (δ_(n,m+1) + δ_(n,m−1)),   ε₀ = ε_atomic + V₀</Eq>
      <Eq>{isKo ? "Bloch 시도해:" : "Bloch trial:"}  c_n = e^(ikna)/√N   →   ε₀ e^(ikna) − t [e^(ik(n+1)a) + e^(ik(n−1)a)] = E e^(ikna)</Eq>
      <Eq style={{ color: C.accent }}>E(k) = ε₀ − 2t cos(ka),   k = 2πp/(Na),   {isKo ? "띠 너비" : "band width"} 4t</Eq>
      <Note>
        {isKo
          ? "t는 이웃한 원자 사이로 전자가 '건너뛰는' 정도를 나타내는 호핑 에너지입니다. 원자가 가까울수록 궤도함수가 많이 겹쳐 t가 커집니다. 결과의 모양에 주목하십시오. 11주차 포논의 분산 관계와 똑같은 cos 꼴이고, k도 같은 Brillouin 영역 −π/a < k ≤ π/a 안에 N개 있습니다. 원자 N개의 궤도함수 N개가 N개의 띠 상태로 바뀝니다."
          : "t is the hopping energy, measuring how easily an electron jumps between neighbouring atoms; closer atoms overlap more and give a larger t. Note the form of the result: the same cosine as the phonon dispersion of Week 11, with N values of k in the same Brillouin zone −π/a < k ≤ π/a. N atomic orbitals become N band states."}
      </Note>
    </Card>
  );
}

function RingLab({ isKo }) {
  const [N, setN] = useState(12);
  const [p, setP] = useState(2);
  const t = 1;
  const pp = Math.min(p, Math.floor(N / 2));
  const states = useMemo(() => {
    const out = [];
    for (let q = -Math.floor((N - 1) / 2); q <= Math.floor(N / 2); q++) out.push({ q, k: 2 * Math.PI * q / N, E: tbE(2 * Math.PI * q / N, t) });
    return out;
  }, [N]);
  const W = 420, Ht = 300, pad = 44;
  const { X, Y } = plotScale(-Math.PI, Math.PI, -2.4, 2.4, W, Ht, pad);
  const curve = [];
  for (let i = 0; i <= 200; i++) { const k = -Math.PI + 2 * Math.PI * i / 200; curve.push([k, tbE(k, t)]); }
  const kSel = 2 * Math.PI * pp / N;
  const W2 = 420, H2 = 300, R2 = 105, cx = W2 / 2, cy = H2 / 2;
  return (
    <Card>
      <Hd>{isKo ? "실험실 ① 원자 N개 고리: 행렬을 풀면 띠가 된다" : "Lab ① A ring of N atoms: diagonalize and a band appears"}</Hd>
      <Row>
        <Slider label={isKo ? "원자 수 N" : "Number of atoms N"} value={N} min={2} max={30} step={1} onChange={setN} />
        <Slider label={isKo ? "상태 번호 p (k = 2πp/Na)" : "State index p (k = 2πp/Na)"} value={pp} min={0} max={Math.floor(N / 2)} step={1} onChange={setP} />
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <svg viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <Axes W={W} Ht={Ht} pad={pad} xlabel="k (1/a)" ylabel="E − ε₀ (t)" />
          {[-2, 0, 2].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
          <text x={X(-Math.PI)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">−π</text>
          <text x={X(Math.PI)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">π</text>
          <path d={pathOf(curve, X, Y)} fill="none" stroke={`${C.accent}66`} strokeWidth={1.5} />
          {states.map(s => <circle key={s.q} cx={X(s.k)} cy={Y(s.E)} r={Math.abs(s.k - kSel) < 1e-9 ? 7 : 4.5} fill={Math.abs(s.k - kSel) < 1e-9 ? "#fde047" : C.accent} />)}
        </svg>
        <svg viewBox={`0 0 ${W2} ${H2}`} style={svgBox(W2)}>
          <circle cx={cx} cy={cy} r={R2} fill="none" stroke="#334155" />
          {Array.from({ length: N }, (_, n) => {
            const ang = 2 * Math.PI * n / N - Math.PI / 2, c = Math.cos(kSel * n);
            const x0 = cx + R2 * Math.cos(ang), y0 = cy + R2 * Math.sin(ang);
            const L = 40 * c;
            return (
              <g key={n}>
                <line x1={x0} y1={y0} x2={x0 + L * Math.cos(ang)} y2={y0 + L * Math.sin(ang)} stroke={c >= 0 ? C.accent : C.sky} strokeWidth={4} />
                <circle cx={x0} cy={y0} r={5} fill="#e5e7eb" />
              </g>
            );
          })}
          <text x={10} y={18} fill={C.textDim} fontSize={11}>{isKo ? "막대: 계수 Re c_n (바깥 +, 안쪽 −)" : "bars: Re c_n (outward +, inward −)"}</text>
        </svg>
      </div>
      <StatGrid>
        <Stat label={isKo ? "고른 상태의 에너지 E − ε₀" : "Energy of the chosen state E − ε₀"} value={`${tbE(kSel, t).toFixed(4)} t`} color="#fde047" />
        <Stat label={isKo ? "상태 수 = 원자 수" : "Number of states = number of atoms"} value={String(N)} color={C.accent} />
        <Stat label={isKo ? "띠 너비 (N → ∞에서 4t)" : "Band width (4t as N → ∞)"} value={`${(Math.max(...states.map(s => s.E)) - Math.min(...states.map(s => s.E))).toFixed(4)} t`} color={C.sky} />
      </StatGrid>
      <Note>
        {isKo
          ? "p = 0(k = 0)은 모든 계수가 같은 부호인 완전 결합 상태로, 에너지가 가장 낮은 ε₀ − 2t입니다. p = N/2(k = π/a)는 이웃끼리 부호가 바뀌는 완전 반결합 상태로 가장 높은 ε₀ + 2t입니다. N = 2를 넣어 보십시오. 결합 궤도함수 ε₀ − t와 반결합 궤도함수 ε₀ + t, 곧 H₂⁺와 같은 두 준위가 나옵니다(고리에서는 두 원자가 두 번 연결되므로 ±2t). N이 커지면 준위가 촘촘해져 연속된 띠가 됩니다."
          : "p = 0 (k = 0) has all coefficients of one sign, the fully bonding state with the lowest energy ε₀ − 2t. p = N/2 (k = π/a) alternates in sign, the fully antibonding state at ε₀ + 2t. Try N = 2: two levels like the bonding and antibonding orbitals of H₂⁺ (±2t here, since on a ring the two atoms are linked twice). As N grows the levels crowd into a continuous band."}
      </Note>
    </Card>
  );
}

function BandFormationLab({ isKo }) {
  const [a, setA] = useState(2.0);
  const t0 = 2, a0 = 1.5, lam = 0.5;
  const tOf = aa => t0 * Math.exp(-(aa - a0) / lam);
  const N = 10;
  const W = 640, Ht = 300, pad = 50;
  const { X, Y } = plotScale(1.5, 4.0, -4.3, 4.3, W, Ht, pad);
  const as = [];
  for (let i = 0; i <= 200; i++) as.push(1.5 + 2.5 * i / 200);
  const lines = [];
  for (let q = 0; q < N; q++) lines.push(as.map(aa => [aa, -2 * tOf(aa) * Math.cos(2 * Math.PI * q / N)]));
  return (
    <Card>
      <Hd>{isKo ? "실험실 ② 원자를 가까이 가져오면 준위가 띠로 퍼진다" : "Lab ② Bring the atoms together and the levels spread into a band"}</Hd>
      <Note>
        {isKo
          ? "호핑 t는 궤도함수의 겹침에 비례하므로 원자 간격 a가 늘면 지수적으로 줄어든다고 둡니다(여기서는 t = 2 exp[−(a − 1.5 Å)/0.5 Å] eV, 교육용 모형). 원자 10개의 준위를 a에 대해 그리면, 멀리 떨어진 원자들은 모두 ε₀ 하나에 겹쳐 있다가 가까워질수록 ε₀ ± 2t 사이로 퍼집니다. 강의 15쪽의 그림입니다."
          : "Hopping t is proportional to orbital overlap, so take it to decay exponentially with spacing a (here t = 2 exp[−(a − 1.5 Å)/0.5 Å] eV, a teaching model). Plotting the levels of 10 atoms against a, isolated atoms all sit at ε₀, and as they approach the levels spread between ε₀ ± 2t: the figure on page 15 of the lecture."}
      </Note>
      <Row><Slider label={isKo ? "원자 간격 a" : "Atomic spacing a"} value={a} min={1.5} max={4} step={0.05} onChange={setA} unit=" Å" fmt={v => v.toFixed(2)} /></Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "원자 간격 a (Å)" : "atomic spacing a (Å)"} ylabel="E − ε₀ (eV)" />
        {[-4, -2, 0, 2, 4].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        {[1.5, 2, 2.5, 3, 3.5, 4].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        {lines.map((l, i) => <path key={i} d={pathOf(l, X, Y)} fill="none" stroke={`${C.accent}99`} strokeWidth={1.2} />)}
        <line x1={X(a)} x2={X(a)} y1={Y(-4.3)} y2={Y(4.3)} stroke="#fde047" strokeDasharray="4 3" />
      </svg>
      <StatGrid>
        <Stat label={isKo ? "호핑 에너지 t(a)" : "Hopping energy t(a)"} value={`${tOf(a).toFixed(3)} eV`} color={C.accent} />
        <Stat label={isKo ? "띠 너비 4t" : "Band width 4t"} value={`${(4 * tOf(a)).toFixed(3)} eV`} color={C.sky} />
        <Stat label={isKo ? "띠 범위" : "Band range"} value={`ε₀ ${(-2 * tOf(a)).toFixed(2)} … ε₀ + ${(2 * tOf(a)).toFixed(2)} eV`} color={C.textDim} />
      </StatGrid>
    </Card>
  );
}

function EffMassLab({ isKo }) {
  const [t, setT] = useState(1.0);
  const [a, setA] = useState(2.5);
  const mstar = HBAR2_ME / (2 * t * a * a);
  const W = 640, Ht = 280, pad = 50;
  const kmax = Math.PI / a;
  const { X, Y } = plotScale(-kmax, kmax, 0, 4.2 * t, W, Ht, pad);
  const ks = [];
  for (let i = 0; i <= 200; i++) ks.push(-kmax + 2 * kmax * i / 200);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ③ 띠 바닥의 전자는 '다른 질량'을 가진 자유 전자처럼 움직인다" : "Lab ③ Near the band bottom an electron moves like a free electron with a different mass"}</Hd>
      <Eq>E(k) = ε₀ − 2t cos(ka) ≈ (ε₀ − 2t) + t a² k²  =  E_min + ħ²k²/2m*   →   m* = ħ² / (2ta²)</Eq>
      <Row>
        <Slider label={isKo ? "호핑 t" : "Hopping t"} value={t} min={0.2} max={3} step={0.05} onChange={setT} unit=" eV" fmt={v => v.toFixed(2)} />
        <Slider label={isKo ? "격자 상수 a" : "Lattice constant a"} value={a} min={1.5} max={5} step={0.05} onChange={setA} unit=" Å" fmt={v => v.toFixed(2)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel="k (Å⁻¹)" ylabel="E − E_min (eV)" />
        <path d={pathOf(ks.map(k => [k, 2 * t * (1 - Math.cos(k * a))]), X, Y)} fill="none" stroke={C.accent} strokeWidth={2.4} />
        <path d={pathOf(ks.map(k => [k, Math.min(4.2 * t, t * a * a * k * k)]), X, Y)} fill="none" stroke={C.sky} strokeDasharray="5 4" strokeWidth={2} />
        <path d={pathOf(ks.map(k => [k, Math.min(4.2 * t, HBAR2_ME * k * k / 2)]), X, Y)} fill="none" stroke={C.textDim} strokeDasharray="2 4" strokeWidth={1.5} />
        <text x={X(0.45 * kmax)} y={Y(Math.min(4.0 * t, t * a * a * (0.45 * kmax) ** 2)) - 8} fill={C.sky} fontSize={12}>ħ²k²/2m*</text>
      </svg>
      <StatGrid>
        <Stat label={isKo ? "유효 질량 m*/m_e" : "Effective mass m*/m_e"} value={mstar.toFixed(3)} color={C.accent} />
        <Stat label={isKo ? "띠 너비 4t" : "Band width 4t"} value={`${(4 * t).toFixed(2)} eV`} color={C.sky} />
        <Stat label="ħ²/m_e" value="7.620 eV·Å²" color={C.textDim} />
      </StatGrid>
      <Note>
        {isKo
          ? "빨간 곡선이 강결합 띠, 하늘색 점선이 그 바닥을 맞춘 포물선 ħ²k²/2m*, 회색 점선이 진짜 자유 전자(m*= m_e)입니다. t = 1 eV, a = 2.5 Å이면 m* = 0.61 m_e입니다. 띠가 넓을수록(t가 클수록) 전자는 가볍게 움직이고, 원자가 멀어 띠가 좁으면 무거워집니다. 반도체 소자에서 이동도를 정하는 유효 질량이 바로 이것입니다."
          : "The red curve is the tight-binding band, the blue dashed curve the parabola ħ²k²/2m* fitted at its bottom, and the grey dotted curve a true free electron (m* = m_e). With t = 1 eV and a = 2.5 Å, m* = 0.61 m_e. A wider band (larger t) makes the electron lighter; distant atoms with a narrow band make it heavier. This is the effective mass that sets carrier mobility in semiconductor devices."}
      </Note>
    </Card>
  );
}

// =============================================================
// 5) BAND FILLING, METALS AND INSULATORS
// =============================================================
const bandEnergyPerSite = f => -(4 / Math.PI) * Math.sin(Math.PI * f / 2);   // units of t, relative to f*eps0

function FillingTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <FillingIdeaCard isKo={isKo} />
      <FermiSeaLab isKo={isKo} />
      <CohesionLab isKo={isKo} />
      <TwoOrbitalLab isKo={isKo} />
      <DbandCard isKo={isKo} />
    </div>
  );
}

function FillingIdeaCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "띠를 얼마나 채우느냐가 금속과 절연체를 가른다" : "How full the band is decides metal versus insulator"}</Hd>
      <Note>
        {isKo
          ? "원자 N개의 띠에는 k 상태가 N개 있고, 각 상태에 스핀이 반대인 전자 2개가 들어갑니다. 따라서 띠 하나는 전자 2N개를 담습니다. 원자마다 전자를 1개 내놓는 1가 원자 결정(Na 같은)은 띠의 절반만 채웁니다. 원자마다 2개를 내놓는 2가 원자 결정은 띠를 꽉 채웁니다. 가장 높은 채워진 준위가 Fermi 준위이고, k 공간의 그 경계(1D에서는 두 점 ±k_F)가 Fermi 면입니다."
          : "A band from N atoms has N k-states, each holding two electrons of opposite spin, so one band holds 2N electrons. A crystal of monovalent atoms (like Na), one electron per atom, fills half the band; divalent atoms, two per atom, fill it completely. The highest filled level is the Fermi level, and its boundary in k-space (two points ±k_F in 1D) is the Fermi surface."}
      </Note>
      <Eq>{isKo ? "원자당 전자 f개:" : "f electrons per atom:"}  2 × (2k_F) / (2π/Na) = fN   →   k_F a = πf/2</Eq>
      <Eq>{isKo ? "띠 에너지 (원자당, f ε₀ 기준):" : "Band energy per atom (relative to f ε₀):"}  ΔE/N = (2/2π) ∫_(−k_F)^(k_F) (−2t cos ka) a dk = −(4t/π) sin(πf/2)</Eq>
    </Card>
  );
}

function FermiSeaLab({ isKo }) {
  const [f, setF] = useState(1);
  const [field, setField] = useState(false);
  const N = 24, t = 1;
  const ks = Array.from({ length: N }, (_, i) => -Math.PI + 2 * Math.PI * (i + 1) / N);   // (-pi, pi]
  const nocc = Math.round(N * f / 2);
  const order = ks.map((k, i) => ({ k, i, E: tbE(k, t) })).sort((a, b) => a.E - b.E || a.k - b.k);
  let occ = new Set(order.slice(0, nocc).map(o => o.i));
  if (field && nocc > 0 && nocc < N) {
    // the field shifts every occupied k by one step (+2pi/N), with wrap-around in the zone
    occ = new Set([...occ].map(i => (i + 1) % N));
  }
  const vel = [...occ].reduce((s, i) => s + 2 * t * Math.sin(ks[i]), 0);   // dE/dk sum (current ~ sum of velocities)
  const W = 640, Ht = 300, pad = 46;
  const { X, Y } = plotScale(-Math.PI, Math.PI, -2.5, 2.5, W, Ht, pad);
  const curve = [];
  for (let i = 0; i <= 200; i++) { const k = -Math.PI + 2 * Math.PI * i / 200; curve.push([k, tbE(k, t)]); }
  const EF = nocc > 0 ? order[nocc - 1].E : -2;
  return (
    <Card>
      <Hd>{isKo ? "실험실 ① 띠 채우기와 전기장: 왜 반만 찬 띠만 전류를 나르나" : "Lab ① Filling the band and applying a field: why only a partly filled band carries current"}</Hd>
      <Row>
        <Slider label={isKo ? "원자당 전자 수 f" : "Electrons per atom f"} value={f} min={0} max={2} step={1 / 12} onChange={setF} fmt={v => v.toFixed(2)} />
        <button style={btnStyle(field)} onClick={() => setField(v => !v)}>{field ? (isKo ? "전기장 끄기" : "Field off") : (isKo ? "전기장 켜기 (k를 한 칸 이동)" : "Field on (shift k by one step)")}</button>
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel="k (1/a)" ylabel="E − ε₀ (t)" />
        <path d={pathOf(curve, X, Y)} fill="none" stroke={`${C.accent}55`} strokeWidth={1.5} />
        {nocc > 0 && nocc < N && <line x1={pad} x2={W - pad} y1={Y(EF)} y2={Y(EF)} stroke="#fde047" strokeDasharray="4 4" />}
        {ks.map((k, i) => <circle key={i} cx={X(k)} cy={Y(tbE(k, t))} r={6} fill={occ.has(i) ? C.accent : "none"} stroke={C.accent} strokeWidth={1.5} />)}
        <text x={X(-Math.PI)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">−π</text>
        <text x={X(Math.PI)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">π</text>
        {nocc > 0 && nocc < N && <text x={W - pad - 4} y={Y(EF) - 6} fill="#fde047" fontSize={11} textAnchor="end">E_F</text>}
      </svg>
      <StatGrid>
        <Stat label={isKo ? "채워진 k 상태 (각 2전자)" : "Filled k-states (2 electrons each)"} value={`${nocc} / ${N}`} color={C.accent} />
        <Stat label={isKo ? "속도의 합 Σ v(k) ∝ 전류" : "Sum of velocities Σ v(k) ∝ current"} value={Math.abs(vel) < 1e-9 ? "0" : vel.toFixed(3)} color={Math.abs(vel) > 1e-9 ? C.ok : C.textDim} />
        <Stat label={isKo ? "판정" : "Verdict"} value={nocc === 0 ? (isKo ? "빈 띠" : "empty band") : nocc === N ? (isKo ? "꽉 찬 띠 → 절연체" : "full band → insulator") : (isKo ? "부분적으로 찬 띠 → 금속" : "partly filled → metal")} color={nocc > 0 && nocc < N ? C.ok : C.pink} />
      </StatGrid>
      <Note>
        {isKo
          ? "전기장은 모든 전자의 k를 같은 방향으로 조금씩 밉니다. f = 1(반만 참)에서 전기장을 켜면, 왼쪽 Fermi 점의 전자가 빠지고 오른쪽에 더해져 속도의 합이 0이 아니게 됩니다. 곧 전류가 흐릅니다. f = 2(꽉 참)에서는 모든 자리가 차 있어서, 밀어도 같은 상태 집합이 그대로 남습니다. 속도의 합은 여전히 0이고 전류가 없습니다. 1가 원자 결정이 대개 금속이고 2가 원자 결정이 (궤도함수가 하나뿐이라면) 절연체인 이유입니다."
          : "A field pushes every electron's k a little in the same direction. At f = 1 (half full), switching it on removes electrons at the left Fermi point and adds them on the right, so the velocities no longer cancel: current flows. At f = 2 (full) every state is occupied, so shifting leaves the same set of states, the velocities still cancel, and there is no current. That is why monovalent crystals are mostly metals and divalent crystals (with only one orbital) would be insulators."}
      </Note>
    </Card>
  );
}

function CohesionLab({ isKo }) {
  const [f, setF] = useState(1);
  const W = 620, Ht = 260, pad = 52;
  const { X, Y } = plotScale(0, 2, -1.4, 0.1, W, Ht, pad);
  const pts = [];
  for (let i = 0; i <= 200; i++) { const ff = 2 * i / 200; pts.push([ff, bandEnergyPerSite(ff)]); }
  return (
    <Card>
      <Hd>{isKo ? "실험실 ② 띠를 반쯤 채울 때 결합이 가장 강하다" : "Lab ② Bonding is strongest when the band is half full"}</Hd>
      <Row><Slider label={isKo ? "원자당 전자 수 f" : "Electrons per atom f"} value={f} min={0} max={2} step={0.01} onChange={setF} fmt={v => v.toFixed(2)} /></Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "원자당 전자 수 f" : "electrons per atom f"} ylabel="ΔE/N (t)" />
        {[0, 0.5, 1, 1.5, 2].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        {[-1.2, -0.8, -0.4, 0].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        <path d={pathOf(pts, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.4} />
        <circle cx={X(f)} cy={Y(bandEnergyPerSite(f))} r={6} fill="#fde047" />
      </svg>
      <StatGrid>
        <Stat label={isKo ? "결합 에너지 ΔE/N = −(4t/π) sin(πf/2)" : "Binding energy ΔE/N = −(4t/π) sin(πf/2)"} value={`${bandEnergyPerSite(f).toFixed(4)} t`} color="#fde047" />
        <Stat label={isKo ? "반만 찼을 때 (f = 1)" : "Half full (f = 1)"} value="−1.273 t" color={C.accent} />
        <Stat label={isKo ? "꽉 찼을 때 (f = 2)" : "Full (f = 2)"} value="0" color={C.textDim} />
      </StatGrid>
      <Note>
        {isKo
          ? "띠의 아래 절반은 결합성(에너지가 ε₀보다 낮음), 위 절반은 반결합성 상태입니다. 반만 채우면 결합성 상태만 차서 결합 에너지가 −4t/π로 가장 큽니다. 꽉 채우면 결합성과 반결합성이 서로 상쇄되어 0이 됩니다. H₂는 결합하지만 He₂는 결합하지 않는 이유와 같은 논리입니다. 원자가 멀어져 t가 작아지면 결합도 약해집니다(강의 15쪽)."
          : "The lower half of the band is bonding (below ε₀) and the upper half antibonding. Filling half the band occupies only bonding states, giving the largest binding −4t/π; filling it completely cancels bonding against antibonding and gives zero. It is the same logic as why H₂ binds and He₂ does not. As the atoms separate, t and the binding shrink (lecture page 15)."}
      </Note>
    </Card>
  );
}

function TwoOrbitalLab({ isKo }) {
  const [a, setA] = useState(3.0);
  const gap0 = 3.0, a0 = 2.0, lam = 0.6;
  const t1 = aa => 0.8 * Math.exp(-(aa - a0) / lam), t2 = aa => 1.4 * Math.exp(-(aa - a0) / lam);
  const top1 = aa => 2 * t1(aa), bot2 = aa => gap0 - 2 * t2(aa);
  const overlap = top1(a) > bot2(a);
  // critical spacing: 2 t1 + 2 t2 = gap0
  const ac = a0 - lam * Math.log(gap0 / (2 * (0.8 + 1.4)));
  const W = 640, Ht = 300, pad = 52;
  const { X, Y } = plotScale(1.8, 5, -3.5, 7, W, Ht, pad);
  const as = [];
  for (let i = 0; i <= 200; i++) as.push(1.8 + 3.2 * i / 200);
  const band = (c, tt, col) => (
    <path d={pathOf(as.map(x => [x, Math.min(7, c + 2 * tt(x))]), X, Y) + " " + pathOf(as.slice().reverse().map(x => [x, Math.max(-3.5, c - 2 * tt(x))]), X, Y).replace("M", "L") + " Z"} fill={col} opacity={0.35} stroke={col} />
  );
  return (
    <Card>
      <Hd>{isKo ? "실험실 ③ 2가 원자인데 왜 금속일까: 두 띠의 겹침" : "Lab ③ Why can divalent atoms be metals? Overlapping bands"}</Hd>
      <Note>
        {isKo
          ? "실제 원자에는 궤도함수가 여러 개 있습니다. 궤도함수 두 개(에너지 ε₀₁ < ε₀₂)가 각각 띠를 만든다고 합시다. 2가 원자는 전자 2N개로 아래 띠를 꽉 채웁니다. 원자가 멀면 두 띠가 떨어져 있어 절연체입니다. 원자가 가까워져 띠가 넓어지면 위 띠의 바닥이 아래 띠의 꼭대기보다 낮아지고, 전자 일부가 위 띠로 넘어갑니다. 두 띠가 모두 부분적으로 차므로 금속이 됩니다. 이것이 강의 18쪽의 금속–절연체 전이입니다(교육용 모형: ε₀₂ − ε₀₁ = 3 eV, 위 궤도함수가 더 많이 겹친다고 둠)."
          : "Real atoms have several orbitals. Let two orbitals (ε₀₁ < ε₀₂) each form a band. Divalent atoms fill the lower band with 2N electrons. With the atoms far apart the bands are separated: an insulator. As the atoms approach and the bands widen, the bottom of the upper band drops below the top of the lower band and some electrons spill over; both bands are then partly filled and the crystal is a metal. This is the metal–insulator transition of lecture page 18 (teaching model: ε₀₂ − ε₀₁ = 3 eV, with the upper orbital overlapping more)."}
      </Note>
      <Row><Slider label={isKo ? "원자 간격 a" : "Atomic spacing a"} value={a} min={1.8} max={5} step={0.02} onChange={setA} unit=" Å" fmt={v => v.toFixed(2)} /></Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "원자 간격 a (Å)" : "atomic spacing a (Å)"} ylabel={isKo ? "에너지 (eV)" : "energy (eV)"} />
        {[2, 3, 4, 5].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        {band(0, t1, C.sky)}
        {band(gap0, t2, C.accent)}
        <line x1={X(ac)} x2={X(ac)} y1={Y(-3.5)} y2={Y(7)} stroke={C.ok} strokeDasharray="5 4" />
        <line x1={X(a)} x2={X(a)} y1={Y(-3.5)} y2={Y(7)} stroke="#fde047" strokeWidth={2} />
        <text x={X(ac) + 4} y={Y(6.5)} fill={C.ok} fontSize={11}>{isKo ? `전이 a_c = ${ac.toFixed(2)} Å` : `transition a_c = ${ac.toFixed(2)} Å`}</text>
      </svg>
      <StatGrid>
        <Stat label={isKo ? "아래 띠 꼭대기 ε₀₁ + 2t₁" : "Top of lower band ε₀₁ + 2t₁"} value={`${top1(a).toFixed(2)} eV`} color={C.sky} />
        <Stat label={isKo ? "위 띠 바닥 ε₀₂ − 2t₂" : "Bottom of upper band ε₀₂ − 2t₂"} value={`${bot2(a).toFixed(2)} eV`} color={C.accent} />
        <Stat label={isKo ? "판정 (원자당 전자 2개)" : "Verdict (2 electrons per atom)"} value={overlap ? (isKo ? "띠 겹침 → 금속" : "bands overlap → metal") : (isKo ? `띠 간격 ${(bot2(a) - top1(a)).toFixed(2)} eV → 절연체` : `gap ${(bot2(a) - top1(a)).toFixed(2)} eV → insulator`)} color={overlap ? C.ok : C.pink} />
      </StatGrid>
      <Note>{isKo ? "Mg, Be 같은 2가 금속은 실제로 이런 띠 겹침 때문에 금속입니다." : "Divalent metals such as Mg and Be are metallic precisely because of such band overlap."}</Note>
    </Card>
  );
}

function DbandCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "화학공학 사례: 띠 채움이 촉매 활성을 정한다 (d-띠 모형)" : "Chemical-engineering case: band filling sets catalytic activity (the d-band model)"}</Hd>
      <Note>
        {isKo
          ? "전이 금속 촉매의 표면에 분자가 흡착할 때, 흡착 결합의 세기는 금속 d 띠의 위치와 채움 정도에 크게 좌우됩니다. Hammer와 Nørskov는 이 생각으로 '금이 가장 귀한(반응성이 낮은) 금속인 이유'를 설명했습니다. 금은 d 띠가 꽉 차 있고 Fermi 준위보다 한참 아래에 있습니다. 그래서 흡착물과 만든 반결합성 상태까지 채워져 결합이 약해집니다. 이번 주의 '반만 찰 때 결합이 가장 강하고, 꽉 차면 결합이 사라진다'는 결과와 같은 논리입니다. 오늘날 촉매 설계에서 d-띠 중심은 흡착 에너지를 어림하는 대표적인 설명 변수(descriptor)입니다."
          : "When molecules adsorb on a transition-metal catalyst, the strength of the surface bond depends strongly on the position and filling of the metal d band. Hammer and Nørskov used this idea to explain why gold is the noblest (least reactive) metal: its d band is full and lies well below the Fermi level, so even the antibonding states formed with the adsorbate are filled and the bond is weak. It is the same logic as this week's result that bonding is strongest at half filling and vanishes for a full band. Today the d-band centre is a standard descriptor for estimating adsorption energies in catalyst design."}
      </Note>
      <Note>B. Hammer, J. K. Nørskov, Nature 376, 238–240 (1995).</Note>
    </Card>
  );
}

// =============================================================
// 6) BAND GAPS: TWO ATOMS PER CELL, PEIERLS, SEMICONDUCTORS
// =============================================================
// two-site cell, k in units of 1/a (a = cell length), reduced zone (-pi, pi]
const gapBands = (k, eA, eB, t1, t2) => {
  const mid = (eA + eB) / 2, d = (eA - eB) / 2;
  const re = t1 + t2 * Math.cos(k), im = -t2 * Math.sin(k);
  const off2 = re * re + im * im;
  const r = Math.sqrt(d * d + off2);
  return [mid - r, mid + r];
};
// electronic energy per atom of a half-filled SSH chain (lower band full), hopping t0(1 +/- delta)
function sshEnergyPerAtom(delta, n = 2000) {
  const t1 = 1 + delta, t2 = 1 - delta;
  let s = 0;
  for (let i = 0; i < n; i++) {
    const k = -Math.PI + 2 * Math.PI * (i + 0.5) / n;
    s += Math.sqrt(t1 * t1 + t2 * t2 + 2 * t1 * t2 * Math.cos(k));
  }
  const mean = s / n;                  // average of |t1 + t2 e^(ik)| over the zone
  return -mean;                        // per cell: 2 electrons x (-mean); per atom: divide by 2
}
const HC_EVNM = 1239.84;               // hc in eV nm

function GapTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <GapDerivCard isKo={isKo} />
      <GapLab isKo={isKo} />
      <PeierlsLab isKo={isKo} />
      <RealGapsCard isKo={isKo} />
      <GapCasesCard isKo={isKo} />
    </div>
  );
}

function GapDerivCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "단위 세포에 원자가 둘이면: 2×2 Hamiltonian과 띠 간격" : "Two atoms per unit cell: a 2×2 Hamiltonian and a band gap"}</Hd>
      <Note>
        {isKo
          ? "세포 길이가 a이고, 세포 n 안에 원자 A와 B가 하나씩 있다고 합시다. 자리 에너지는 ε_A, ε_B이고, 세포 안의 A–B 결합은 t₁, 이웃 세포로 넘어가는 B–A 결합은 t₂입니다. 11주차의 이원자 사슬과 똑같은 구조입니다. Bloch 정리에 따라 계수를 c_n^A = u_A e^(ikna), c_n^B = u_B e^(ikna)로 두면 무한히 많은 방정식이 2개로 줄어듭니다."
          : "Let the cell have length a and contain one atom A and one atom B. The site energies are ε_A and ε_B; the A–B bond inside a cell is t₁ and the B–A bond to the next cell is t₂. This is exactly the structure of the Week 11 diatomic chain. By Bloch's theorem we set c_n^A = u_A e^(ikna) and c_n^B = u_B e^(ikna), and the infinite set of equations collapses to two."}
      </Note>
      <Eq>E u_A = ε_A u_A − (t₁ + t₂ e^(−ika)) u_B</Eq>
      <Eq>E u_B = −(t₁ + t₂ e^(ika)) u_A + ε_B u_B</Eq>
      <Eq>det | ε_A − E      −h(k) ;  −h*(k)      ε_B − E | = 0,   h(k) = t₁ + t₂ e^(−ika)</Eq>
      <Eq style={{ color: C.accent }}>E±(k) = ε̄ ± √[ Δ² + |h(k)|² ],   ε̄ = (ε_A + ε_B)/2,   Δ = (ε_A − ε_B)/2</Eq>
      <Eq>|h(k)|² = t₁² + t₂² + 2t₁t₂ cos ka</Eq>
      <Note>
        {isKo
          ? "띠 간격은 |h(k)|가 가장 작은 곳, 곧 영역 경계 k = π/a에서 생깁니다. 거기서 |h| = |t₁ − t₂|이므로 띠 간격은 E_g = 2√(Δ² + (t₁ − t₂)²)입니다. 두 가지 특별한 경우가 있습니다. (1) 결합은 같고(t₁ = t₂ = t) 원자 종류가 다르면 E_g = |ε_A − ε_B|입니다. (2) 원자는 같고(Δ = 0) 결합이 번갈아 길고 짧으면 E_g = 2|t₁ − t₂|입니다. (2)는 Su–Schrieffer–Heeger(SSH) 모형으로, 폴리아세틸렌의 단일·이중 결합 교대를 나타냅니다. Δ = 0이고 t₁ = t₂이면 간격이 닫혀 원래의 원자 하나짜리 띠(세포를 둘로 접은 것)로 돌아갑니다."
          : "The gap opens where |h(k)| is smallest, at the zone boundary k = π/a, where |h| = |t₁ − t₂|. So E_g = 2√(Δ² + (t₁ − t₂)²). Two special cases: (1) equal bonds (t₁ = t₂ = t) but different atoms give E_g = |ε_A − ε_B|; (2) identical atoms (Δ = 0) with alternating long and short bonds give E_g = 2|t₁ − t₂|. Case (2) is the Su–Schrieffer–Heeger (SSH) model of the single/double bond alternation in polyacetylene. With Δ = 0 and t₁ = t₂ the gap closes and we recover the one-atom band, folded in half."}
      </Note>
      <Note>
        {isKo
          ? "원자당 전자가 1개면 세포당 2개이므로 아래 띠가 정확히 꽉 찹니다. 그러므로 간격이 열리는 순간 금속이 절연체(또는 반도체)로 바뀝니다. 수식은 11주차 이원자 사슬의 음향·광학 가지와 같습니다. 질량 차이가 자리 에너지 차이로, 용수철 차이가 결합 세기 차이로 바뀌었을 뿐입니다."
          : "With one electron per atom there are two per cell, so the lower band is exactly full: as soon as a gap opens, the metal becomes an insulator (or semiconductor). The mathematics is that of the acoustic and optical branches of the Week 11 diatomic chain, with the mass difference replaced by a site-energy difference and the spring difference by a bond-strength difference."}
      </Note>
    </Card>
  );
}

function GapLab({ isKo }) {
  const [dEps, setDEps] = useState(0.0);    // eA - eB in units of t0
  const [delta, setDelta] = useState(0.1);  // t1,2 = 1 +/- delta
  const eA = dEps / 2, eB = -dEps / 2, t1 = 1 + delta, t2 = 1 - delta;
  const W = 640, Ht = 320, pad = 50;
  const { X, Y } = plotScale(-Math.PI, Math.PI, -2.8, 2.8, W, Ht, pad);
  const lo = [], hi = [], folded = [];
  for (let i = 0; i <= 240; i++) {
    const k = -Math.PI + 2 * Math.PI * i / 240;
    const [a, b] = gapBands(k, eA, eB, t1, t2);
    lo.push([k, a]); hi.push([k, b]);
  }
  const [gl, gh] = gapBands(Math.PI, eA, eB, t1, t2);
  const Eg = gh - gl;
  const Egform = 2 * Math.sqrt((dEps / 2) ** 2 + (t1 - t2) ** 2);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ① 간격 열기: 원자 종류를 바꾸거나, 결합을 번갈아 바꾸거나" : "Lab ① Opening a gap: change the atoms, or alternate the bonds"}</Hd>
      <Row>
        <Slider label={isKo ? "자리 에너지 차이 ε_A − ε_B" : "Site-energy difference ε_A − ε_B"} value={dEps} min={0} max={2} step={0.02} onChange={setDEps} unit=" t₀" fmt={v => v.toFixed(2)} />
        <Slider label={isKo ? "결합 교대 δ (t₁,₂ = t₀(1 ± δ))" : "Bond alternation δ (t₁,₂ = t₀(1 ± δ))"} value={delta} min={0} max={0.5} step={0.01} onChange={setDelta} fmt={v => v.toFixed(2)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "k (1/a, a = 세포 길이)" : "k (1/a, a = cell length)"} ylabel="E (t₀)" />
        <rect x={pad} y={Y(gh)} width={W - 2 * pad} height={Math.max(0, Y(gl) - Y(gh))} fill="#fde04722" />
        <path d={pathOf(lo, X, Y)} fill="none" stroke={C.sky} strokeWidth={2.4} />
        <path d={pathOf(hi, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.4} />
        {[-2, -1, 0, 1, 2].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        <text x={X(-Math.PI)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">−π</text>
        <text x={X(0)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">0</text>
        <text x={X(Math.PI)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">π</text>
        <text x={X(0)} y={Y(-2.45)} fill={C.sky} fontSize={12} textAnchor="middle">{isKo ? "가전자 띠 (꽉 참)" : "valence band (full)"}</text>
        <text x={X(0)} y={Y(2.45)} fill={C.accent} fontSize={12} textAnchor="middle">{isKo ? "전도 띠 (빔)" : "conduction band (empty)"}</text>
      </svg>
      <StatGrid>
        <Stat label={isKo ? "k = π/a에서 잰 띠 간격" : "Gap measured at k = π/a"} value={`${Eg.toFixed(4)} t₀`} color="#fde047" />
        <Stat label={isKo ? "공식 2√(Δ² + (t₁ − t₂)²)" : "Formula 2√(Δ² + (t₁ − t₂)²)"} value={`${Egform.toFixed(4)} t₀`} color={C.ok} />
        <Stat label={isKo ? "판정 (원자당 전자 1개)" : "Verdict (1 electron per atom)"} value={Eg < 1e-9 ? (isKo ? "간격 없음 → 금속" : "no gap → metal") : (isKo ? "간격 있음 → 절연체/반도체" : "gap → insulator/semiconductor")} color={Eg < 1e-9 ? C.ok : C.pink} />
      </StatGrid>
      <Note>
        {isKo
          ? "두 슬라이더를 모두 0으로 두면 아래·위 띠가 k = ±π/a에서 만납니다. 이것은 원자 하나짜리 띠 −2t cos(ka/2)를 세포 두 배 기준으로 접어 놓은 그림입니다. 어느 쪽이든 대칭이 깨지면 그 만나는 점에서 간격이 열립니다. 원자 종류의 차이(Δ)와 결합 교대(δ)는 제곱으로 더해집니다."
          : "Set both sliders to zero and the two bands touch at k = ±π/a: this is the one-atom band −2t cos(ka/2) folded into the doubled cell. Breaking the symmetry either way opens a gap at that touching point, and the two causes (Δ and δ) add in quadrature."}
      </Note>
    </Card>
  );
}

function PeierlsLab({ isKo }) {
  const [K, setK] = useState(1.5);    // elastic cost per atom = K delta^2 (units of t0)
  const E0 = sshEnergyPerAtom(0, 1000);
  const ds = [];
  for (let i = 0; i <= 400; i++) ds.push(0.4 * i / 400);
  const tot = ds.map(d => [d, sshEnergyPerAtom(d, 1000) - E0 + K * d * d]);
  const el = ds.map(d => [d, sshEnergyPerAtom(d, 1000) - E0]);
  let best = tot[0];
  for (const p of tot) if (p[1] < best[1]) best = p;
  const W = 640, Ht = 300, pad = 56;
  const { X, Y } = plotScale(0, 0.4, -0.05, 0.03, W, Ht, pad);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ② Peierls 불안정성: 1D 금속은 스스로 간격을 연다" : "Lab ② The Peierls instability: a 1D metal opens its own gap"}</Hd>
      <Note>
        {isKo
          ? "반만 찬 1D 띠에서 원자들이 둘씩 짝지으면(결합 교대 δ), 간격이 열리면서 채워진 상태들의 에너지가 내려갑니다. 대신 격자를 비트는 탄성 에너지 Kδ²를 치러야 합니다. 전자가 얻는 이득은 δ가 작을 때 δ² ln(1/δ)처럼 커지므로, 항상 Kδ²보다 큽니다. 따라서 K가 아무리 커도 0이 아닌 δ에서 총 에너지가 최소가 됩니다. 곧 균일한 1D 금속은 불안정합니다."
          : "If the atoms of a half-filled 1D band pair up (bond alternation δ), a gap opens and the filled states move down in energy. The price is an elastic energy Kδ² for distorting the lattice. For small δ the electronic gain grows like δ² ln(1/δ), which always beats Kδ². So however stiff the lattice, the total energy is lowest at a non-zero δ: a uniform 1D metal is unstable."}
      </Note>
      <Row><Slider label={isKo ? "격자 강성 K (원자당 탄성 에너지 Kδ²)" : "Lattice stiffness K (elastic energy Kδ² per atom)"} value={K} min={1} max={2.5} step={0.05} onChange={setK} unit=" t₀" fmt={v => v.toFixed(2)} /></Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "결합 교대 δ" : "bond alternation δ"} ylabel={isKo ? "원자당 에너지 변화 (t₀)" : "energy change per atom (t₀)"} />
        <line x1={pad} x2={W - pad} y1={Y(0)} y2={Y(0)} stroke="#475569" strokeDasharray="3 3" />
        {[0, 0.1, 0.2, 0.3, 0.4].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        {[-0.04, -0.02, 0, 0.02].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        <path d={pathOf(el.filter(p => p[1] > -0.05), X, Y)} fill="none" stroke={C.sky} strokeWidth={2} strokeDasharray="6 4" />
        <path d={pathOf(tot.filter(p => p[1] < 0.03 && p[1] > -0.05), X, Y)} fill="none" stroke={C.accent} strokeWidth={2.6} />
        <circle cx={X(best[0])} cy={Y(best[1])} r={6} fill="#fde047" />
        <text x={X(0.06)} y={Y(-0.045)} fill={C.sky} fontSize={11}>{isKo ? "전자 에너지 이득" : "electronic gain"}</text>
      </svg>
      <StatGrid>
        <Stat label={isKo ? "평형 결합 교대 δ*" : "Equilibrium alternation δ*"} value={best[0].toFixed(3)} color="#fde047" />
        <Stat label={isKo ? "열린 간격 4δ* t₀" : "Gap opened 4δ* t₀"} value={`${(4 * best[0]).toFixed(3)} t₀`} color={C.accent} />
        <Stat label={isKo ? "안정화 에너지 (원자당)" : "Stabilization energy (per atom)"} value={`${best[1].toExponential(2)} t₀`} color={C.ok} />
      </StatGrid>
      <Note>
        {isKo
          ? "K를 키우면 δ*는 지수적으로 작아지지만 0이 되지는 않습니다. 폴리아세틸렌에서 t₀ ≈ 2.5 eV이고 실제 간격이 약 1.4 eV이면 4δ*t₀ = 1.4 eV에서 δ* ≈ 0.14입니다. 이 실험실에서 K = 1.5로 두면 δ* ≈ 0.14가 나옵니다(K는 교육용 환산 값)."
          : "Increasing K makes δ* exponentially small but never zero. For polyacetylene with t₀ ≈ 2.5 eV and an observed gap of about 1.4 eV, 4δ*t₀ = 1.4 eV gives δ* ≈ 0.14. Setting K = 1.5 in this lab gives δ* ≈ 0.14 (K is a reduced teaching value)."}
      </Note>
    </Card>
  );
}

function RealGapsCard({ isKo }) {
  const rows = [
    ["Ge", 0.661, isKo ? "적외선 검출기" : "infrared detectors"],
    ["Si", 1.12, isKo ? "태양 전지, 집적 회로" : "solar cells, integrated circuits"],
    ["GaAs", 1.424, isKo ? "LED, 고속 소자" : "LEDs, high-speed devices"],
    [isKo ? "폴리아세틸렌 (trans)" : "polyacetylene (trans)", 1.4, isKo ? "전도성 고분자" : "conducting polymer"],
    [isKo ? "TiO₂ 루타일" : "TiO₂ rutile", 3.03, isKo ? "백색 안료" : "white pigment"],
    [isKo ? "TiO₂ 아나타스" : "TiO₂ anatase", 3.20, isKo ? "광촉매" : "photocatalyst"],
    [isKo ? "다이아몬드" : "diamond", 5.47, isKo ? "절연체, 방열" : "insulator, heat spreader"],
  ];
  return (
    <Card>
      <Hd>{isKo ? "실제 물질의 띠 간격 (300 K)과 흡수 경계 파장 λ = hc/E_g" : "Band gaps of real materials (300 K) and absorption edge λ = hc/E_g"}</Hd>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13.5 }}>
          <thead>
            <tr style={{ color: C.textDim, textAlign: "left" }}>
              <th style={{ padding: "6px 10px" }}>{isKo ? "물질" : "Material"}</th>
              <th style={{ padding: "6px 10px" }}>E_g (eV)</th>
              <th style={{ padding: "6px 10px" }}>λ (nm)</th>
              <th style={{ padding: "6px 10px" }}>{isKo ? "쓰임" : "Use"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([m, eg, u]) => (
              <tr key={m} style={{ borderTop: `1px solid ${C.border}` }}>
                <td style={{ padding: "6px 10px", fontWeight: 700 }}>{m}</td>
                <td style={{ padding: "6px 10px", fontFamily: mono, color: C.accent }}>{eg.toFixed(eg < 1 ? 3 : 2)}</td>
                <td style={{ padding: "6px 10px", fontFamily: mono }}>{Math.round(HC_EVNM / eg)}</td>
                <td style={{ padding: "6px 10px", color: C.textDim }}>{u}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note>
        {isKo
          ? "가시광선은 약 400–700 nm(1.8–3.1 eV)입니다. 간격이 3 eV를 넘는 TiO₂와 다이아몬드는 가시광을 흡수하지 않아 희거나 투명하고, Si와 GaAs는 가시광을 모두 흡수해 검게 보입니다. 출처: Si·Ge·GaAs는 S. M. Sze, K. K. Ng, Physics of Semiconductor Devices, 3rd ed. (Wiley, 2007); TiO₂는 H. Tang et al., J. Appl. Phys. 75, 2042 (1994) 및 J. Pascual et al., Phys. Rev. B 18, 5606 (1978); 폴리아세틸렌은 C. R. Fincher et al., Phys. Rev. B 19, 4140 (1979)."
          : "Visible light spans about 400–700 nm (1.8–3.1 eV). TiO₂ and diamond, with gaps above 3 eV, do not absorb visible light and look white or transparent; Si and GaAs absorb all of it and look black. Sources: Si, Ge and GaAs from S. M. Sze and K. K. Ng, Physics of Semiconductor Devices, 3rd ed. (Wiley, 2007); TiO₂ from H. Tang et al., J. Appl. Phys. 75, 2042 (1994) and J. Pascual et al., Phys. Rev. B 18, 5606 (1978); polyacetylene from C. R. Fincher et al., Phys. Rev. B 19, 4140 (1979)."}
      </Note>
    </Card>
  );
}

function GapCasesCard({ isKo }) {
  const box = (title, body, color) => (
    <div style={{ flex: "1 1 320px", background: C.card, border: `1px solid ${color}66`, borderRadius: 12, padding: 16 }}>
      <div style={{ fontWeight: 800, color, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13.5, lineHeight: 1.75 }}>{body}</div>
    </div>
  );
  return (
    <Card>
      <Hd>{isKo ? "화학공학 사례: 띠 간격을 설계 변수로 쓰기" : "Chemical-engineering cases: the band gap as a design variable"}</Hd>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {box(isKo ? "① TiO₂ 광촉매" : "① TiO₂ photocatalysis",
          isKo
            ? "Fujishima와 Honda는 TiO₂ 전극에 자외선을 비추어 물을 분해했습니다(Nature 238, 37, 1972). 띠 간격보다 큰 에너지의 빛이 가전자 띠의 전자를 전도 띠로 올리면, 남은 정공은 산화를, 들뜬 전자는 환원을 일으킵니다. 아나타스의 간격 3.20 eV는 387 nm에 해당하므로 햇빛 중 약 4%인 자외선만 쓸 수 있습니다. 질소·금속 도핑으로 간격을 줄여 가시광 활성을 얻으려는 연구가 이어지는 이유입니다."
            : "Fujishima and Honda split water by shining UV light on a TiO₂ electrode (Nature 238, 37, 1972). Light above the gap lifts an electron from the valence to the conduction band; the hole left behind oxidizes and the excited electron reduces. Anatase's 3.20 eV gap corresponds to 387 nm, so only the UV part of sunlight (about 4%) can be used, which is why doping with N or metals to narrow the gap is an active field.",
          C.accent)}
        {box(isKo ? "② 전도성 고분자" : "② Conducting polymers",
          isKo
            ? "폴리아세틸렌은 탄소 하나당 π 전자가 하나라 띠가 반만 찹니다. 그대로라면 금속이어야 하지만, Peierls 불안정성 때문에 결합이 교대로 짧고 길어져 약 1.4 eV의 간격이 열립니다. Shirakawa, MacDiarmid, Heeger는 이 고분자를 요오드로 도핑해 전도도를 약 천만 배(10⁷) 높였고(J. Chem. Soc., Chem. Commun. 1977, 578), 2000년 노벨 화학상을 받았습니다. 도핑은 꽉 찬 띠에서 전자를 빼내 '부분적으로 찬 띠'를 다시 만드는 일입니다."
            : "Polyacetylene has one π electron per carbon, so its band is half full and it 'should' be a metal. The Peierls instability makes the bonds alternate short and long and opens a gap of about 1.4 eV. Shirakawa, MacDiarmid and Heeger doped it with iodine and raised its conductivity about ten million times (10⁷) (J. Chem. Soc., Chem. Commun. 1977, 578), earning the 2000 Nobel Prize in Chemistry. Doping removes electrons from the full band and restores a partly filled band.",
          C.sky)}
      </div>
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
        q: "P1. 파수 300 cm⁻¹인 진동 모드가 300 K에 있다. (a) x = ħω/k_BT를 구하시오. (b) 평균 포논 수 ⟨n⟩와 바닥 상태 비율 P₀는? (c) 이 모드의 열용량은 고전값 k_B의 몇 %인가?",
        s: "(a) ħω = hc ν̃이므로 x = hcν̃/k_BT = (1.4388 cm K) × 300 cm⁻¹ / 300 K = 1.439. (b) ⟨n⟩ = 1/(e^1.439 − 1) = 1/(4.216 − 1) = 0.311. P₀ = 1 − e^(−x) = 0.763, 곧 76%의 진동자가 바닥 상태에 있습니다. (c) C/k_B = x²e^x/(e^x − 1)² = 2.070 × 4.216 / 3.216² = 0.844, 곧 84%입니다. 300 cm⁻¹ 모드는 상온에서 거의 고전적으로 행동합니다. 같은 계산을 1500 cm⁻¹(x = 7.19) 모드에 하면 C/k_B = 0.039로 거의 얼어 있습니다.",
      },
      en: {
        q: "P1. A vibrational mode of 300 cm⁻¹ is at 300 K. (a) Find x = ħω/k_BT. (b) What are the mean phonon number ⟨n⟩ and the ground-state fraction P₀? (c) What percentage of the classical value k_B is its heat capacity?",
        s: "(a) ħω = hcν̃, so x = hcν̃/k_BT = (1.4388 cm K) × 300 cm⁻¹ / 300 K = 1.439. (b) ⟨n⟩ = 1/(e^1.439 − 1) = 1/(4.216 − 1) = 0.311; P₀ = 1 − e^(−x) = 0.763, so 76% of the oscillators are in the ground state. (c) C/k_B = x²e^x/(e^x − 1)² = 2.070 × 4.216 / 3.216² = 0.844, or 84%. A 300 cm⁻¹ mode is nearly classical at room temperature. The same calculation for a 1500 cm⁻¹ mode (x = 7.19) gives C/k_B = 0.039: almost frozen.",
      },
    },
    {
      ko: {
        q: "P2. 다이아몬드를 Einstein 고체(θ_E = 1320 K)로 본다. (a) 300 K와 1000 K에서 C_V/3R은? (b) 300 K의 몰 열용량을 구하고 실측값 약 6.1 J mol⁻¹ K⁻¹과 비교하시오. (c) 다이아몬드의 θ가 이렇게 큰 이유는?",
        s: "(a) x = θ_E/T. 300 K: x = 4.40, C_V/3R = x²e^x/(e^x − 1)² = 0.244. 1000 K: x = 1.32, 0.867. (b) C_V = 0.244 × 24.94 = 6.08 J mol⁻¹ K⁻¹로 실측값과 잘 맞습니다. Einstein이 1907년 논문에서 보인 것이 바로 이 다이아몬드 자료의 설명이었습니다. (c) ω = √(κ/m)에서 C–C 결합은 매우 단단하고(κ 큼) 탄소는 가볍습니다(m 작음). 그래서 진동 양자 ħω가 크고 θ = ħω/k_B도 큽니다.",
      },
      en: {
        q: "P2. Treat diamond as an Einstein solid with θ_E = 1320 K. (a) What is C_V/3R at 300 K and 1000 K? (b) Find the molar heat capacity at 300 K and compare it with the measured value of about 6.1 J mol⁻¹ K⁻¹. (c) Why is diamond's θ so large?",
        s: "(a) x = θ_E/T. At 300 K, x = 4.40 and C_V/3R = x²e^x/(e^x − 1)² = 0.244; at 1000 K, x = 1.32 and 0.867. (b) C_V = 0.244 × 24.94 = 6.08 J mol⁻¹ K⁻¹, in good agreement. Explaining exactly these diamond data was the point of Einstein's 1907 paper. (c) From ω = √(κ/m): C–C bonds are very stiff (large κ) and carbon is light (small m), so the vibrational quantum ħω and hence θ = ħω/k_B are large.",
      },
    },
    {
      ko: {
        q: "P3. Debye 모형에서 낮은 온도의 열용량은 C_V = (12π⁴/5) R (T/θ_D)³이다. (a) 이 식을 C_V = k_B∫D(ω)… 에서 유도하는 핵심 두 단계를 쓰시오. (b) Cu(θ_D = 343 K)의 10 K 열용량은? (c) Cu의 C_V가 3R의 1%가 되는 온도를 T³ 법칙으로 추정하시오.",
        s: "(a) ① D(ω) = 9Nω²/ω_D³ (Debye 상태 밀도)를 넣고 x = ħω/k_BT로 변수를 바꾸면 C_V = 9Nk_B (T/θ_D)³ ∫₀^(θ_D/T) x⁴e^x/(e^x − 1)² dx. ② T ≪ θ_D이면 위 끝을 ∞로 보내고, 부분 적분으로 ∫₀^∞ x⁴e^x/(e^x − 1)² dx = 4∫₀^∞ x³/(e^x − 1) dx = 4π⁴/15. 따라서 C_V = (12π⁴/5) N k_B (T/θ_D)³. (b) 1943.8 × (10/343)³ = 0.0482 J mol⁻¹ K⁻¹. (c) C_V/3R = (4π⁴/5)(T/θ_D)³ = 77.93 (T/θ_D)³ = 0.01에서 T/θ_D = 0.0504, T = 17.3 K. (실제로 이 온도까지는 T³ 법칙이 잘 맞습니다. 20 K에서 Debye 적분값과 T³ 근사가 0.385로 같습니다.)",
      },
      en: {
        q: "P3. In the Debye model the low-temperature heat capacity is C_V = (12π⁴/5) R (T/θ_D)³. (a) Give the two key steps that derive it from C_V = k_B∫D(ω)…. (b) What is C_V of Cu (θ_D = 343 K) at 10 K? (c) Using the T³ law, estimate the temperature at which C_V of Cu reaches 1% of 3R.",
        s: "(a) ① Insert the Debye density of states D(ω) = 9Nω²/ω_D³ and substitute x = ħω/k_BT: C_V = 9Nk_B (T/θ_D)³ ∫₀^(θ_D/T) x⁴e^x/(e^x − 1)² dx. ② For T ≪ θ_D send the upper limit to ∞; integration by parts gives ∫₀^∞ x⁴e^x/(e^x − 1)² dx = 4∫₀^∞ x³/(e^x − 1) dx = 4π⁴/15, so C_V = (12π⁴/5) N k_B (T/θ_D)³. (b) 1943.8 × (10/343)³ = 0.0482 J mol⁻¹ K⁻¹. (c) C_V/3R = (4π⁴/5)(T/θ_D)³ = 77.93 (T/θ_D)³ = 0.01 gives T/θ_D = 0.0504 and T = 17.3 K. (The T³ law holds well up to here: at 20 K the full Debye integral and the T³ form both give 0.385.)",
      },
    },
    {
      ko: {
        q: "P4. Cu의 저온 열용량을 C/T 대 T²로 그렸더니 절편 0.695 mJ mol⁻¹ K⁻², 기울기 0.0482 mJ mol⁻¹ K⁻⁴인 직선이 나왔다. (a) 각 항의 물리적 기원은? (b) 기울기에서 θ_D를 구하시오. (c) 전자와 포논의 기여가 같아지는 온도는?",
        s: "(a) 절편 γ는 전도 전자의 기여(γT)입니다. Fermi 준위 근처 k_BT 폭의 전자만 열을 받을 수 있어서 T에 비례합니다. 기울기 A는 포논의 Debye T³ 기여(AT³)입니다. (b) A = 1943.8/θ_D³ J mol⁻¹ K⁻⁴이므로 θ_D = (1943.8/4.82×10⁻⁵)^(1/3) = 343 K. (c) γT = AT³에서 T = √(γ/A) = √(0.695/0.0482) = 3.80 K. 이보다 낮은 온도에서는 전자가, 높은 온도에서는 포논이 열용량을 지배합니다.",
      },
      en: {
        q: "P4. The low-temperature heat capacity of Cu, plotted as C/T against T², is a straight line with intercept 0.695 mJ mol⁻¹ K⁻² and slope 0.0482 mJ mol⁻¹ K⁻⁴. (a) What is the physical origin of each term? (b) Find θ_D from the slope. (c) At what temperature are the electron and phonon contributions equal?",
        s: "(a) The intercept γ is the conduction-electron term γT: only electrons within about k_BT of the Fermi level can take up heat, so it is proportional to T. The slope A is the phonon Debye term AT³. (b) A = 1943.8/θ_D³ J mol⁻¹ K⁻⁴, so θ_D = (1943.8/4.82×10⁻⁵)^(1/3) = 343 K. (c) γT = AT³ gives T = √(γ/A) = √(0.695/0.0482) = 3.80 K. Below it the electrons dominate; above it the phonons do.",
      },
    },
    {
      ko: {
        q: "P5. (공정 설계) Cu 부품 1 kg을 300 K에서 77 K까지 액체 질소에 담가 식힌다. Debye 모형으로 계산한 엔탈피 변화는 70.4 kJ/kg이다. LN₂의 증발열 199.2 kJ/kg, 밀도 806 kg/m³. (a) 증발하는 LN₂의 질량과 부피는? (b) 3R(Dulong–Petit)을 쓰면 얼마로 추정되며 몇 % 과대평가인가? (c) 실제 필요량을 더 줄이는 방법은?",
        s: "(a) 70.4/199.2 = 0.353 kg, 0.353/806 = 4.4×10⁻⁴ m³ = 0.44 L. (b) 3R × 223 K / (63.55 g/mol) = 87.5 kJ/kg이므로 0.439 kg, 약 24% 과대평가입니다. 낮은 온도에서 Cu의 진동 모드가 얼어붙어 열용량이 3R보다 작기 때문입니다. (c) 증발한 차가운 N₂ 기체(77 K)의 현열도 냉각에 쓰도록 기체를 부품 위로 흘려보내면 액체 소비가 줄어듭니다. 이 계산은 그 현열을 무시한 최대치입니다.",
      },
      en: {
        q: "P5. (Process design) A 1 kg copper part is cooled from 300 K to 77 K by immersion in liquid nitrogen. The Debye-model enthalpy change is 70.4 kJ/kg. For LN₂, the heat of vaporization is 199.2 kJ/kg and the density 806 kg/m³. (a) What mass and volume of LN₂ boil off? (b) What would 3R (Dulong–Petit) predict, and by what percentage does it overestimate? (c) How can the actual consumption be reduced further?",
        s: "(a) 70.4/199.2 = 0.353 kg, and 0.353/806 = 4.4×10⁻⁴ m³ = 0.44 L. (b) 3R × 223 K / (63.55 g/mol) = 87.5 kJ/kg gives 0.439 kg, about 24% too much, because the vibrational modes of Cu freeze out at low temperature and its heat capacity falls below 3R. (c) Let the cold boil-off N₂ gas (77 K) flow over the part so that its sensible heat also does cooling. This calculation neglects that sensible heat and is an upper bound.",
      },
    },
    {
      ko: {
        q: "P6. 원자 6개로 된 고리(벤젠의 π 궤도함수 모형)를 강결합 모형으로 본다. (a) Bloch 정리로 6개 에너지 준위를 구하시오. (b) 원자당 전자 1개(π 전자 6개)일 때 띠 에너지의 합과 원자당 값을 구하고, 무한 사슬의 −4t/π와 비교하시오.",
        s: "(a) 주기 경계 조건 c_(n+6) = c_n에서 k_p = 2πp/6a (p = 0, ±1, ±2, 3)이고 E_p = ε₀ − 2t cos(2πp/6). 따라서 ε₀ − 2t (1개), ε₀ − t (2개), ε₀ + t (2개), ε₀ + 2t (1개)입니다. 이것은 Hückel 모형의 벤젠 준위 α + 2β, α + β, α − β, α − 2β와 같습니다(β = −t). (b) 6개 전자는 아래 세 준위에 2개씩: 2(−2t − t − t) = −8t, 원자당 −1.333t. 무한 사슬(−1.273t)보다 4.7% 더 안정합니다. 이 여분의 안정화가 고리 크기 4n + 2에서 나타나는 방향족성의 띠 이론식 표현입니다.",
      },
      en: {
        q: "P6. Treat a ring of 6 atoms (a model of the π orbitals of benzene) with the tight-binding model. (a) Use Bloch's theorem to find the 6 energy levels. (b) With one electron per atom (6 π electrons), find the total band energy and its value per atom, and compare with −4t/π for the infinite chain.",
        s: "(a) The periodic condition c_(n+6) = c_n gives k_p = 2πp/6a (p = 0, ±1, ±2, 3) and E_p = ε₀ − 2t cos(2πp/6): ε₀ − 2t (once), ε₀ − t (twice), ε₀ + t (twice) and ε₀ + 2t (once). These are the Hückel benzene levels α + 2β, α + β, α − β, α − 2β with β = −t. (b) The 6 electrons fill the lowest three levels in pairs: 2(−2t − t − t) = −8t, or −1.333t per atom, 4.7% more stable than the infinite chain (−1.273t). This extra stabilization is the band-theory view of the aromaticity of 4n + 2 rings.",
      },
    },
    {
      ko: {
        q: "P7. 원자 간격 a = 2.5 Å인 1D 결정의 띠가 t = 1 eV이다. (a) 띠 폭은? (b) 띠 바닥 근처의 유효 질량 m*을 유도하고 값을 구하시오. (c) 원자를 3 Å으로 벌려 t = 0.5 eV가 되면 m*은 어떻게 되는가? 전자의 이동도에 주는 의미는?",
        s: "(a) 4t = 4 eV. (b) 바닥 k = 0에서 cos ka ≈ 1 − (ka)²/2이므로 E ≈ ε₀ − 2t + t a² k². 자유 전자 E = ħ²k²/2m*와 비교하면 m* = ħ²/(2ta²). ħ²/m_e = 7.620 eV Å²이므로 m*/m_e = 7.620/(2 × 1 × 6.25) = 0.610. (c) 7.620/(2 × 0.5 × 9) = 0.847. 궤도함수의 겹침이 줄면 띠가 좁아지고 전자가 무거워집니다. 이동도는 대략 1/m*에 비례하므로 줄어듭니다. 유기 반도체의 이동도가 실리콘보다 크게 낮은 이유도 분자 사이의 t가 작기 때문입니다.",
      },
      en: {
        q: "P7. A 1D crystal with spacing a = 2.5 Å has a band with t = 1 eV. (a) What is the band width? (b) Derive the effective mass m* near the band bottom and evaluate it. (c) If the atoms are pulled apart to 3 Å and t drops to 0.5 eV, what happens to m*, and what does this mean for electron mobility?",
        s: "(a) 4t = 4 eV. (b) At the bottom k = 0, cos ka ≈ 1 − (ka)²/2, so E ≈ ε₀ − 2t + t a² k². Comparing with E = ħ²k²/2m* gives m* = ħ²/(2ta²). With ħ²/m_e = 7.620 eV Å², m*/m_e = 7.620/(2 × 1 × 6.25) = 0.610. (c) 7.620/(2 × 0.5 × 9) = 0.847. Less orbital overlap means a narrower band and heavier electrons; mobility scales roughly as 1/m* and falls. The small intermolecular t is also why organic semiconductors have much lower mobility than silicon.",
      },
    },
    {
      ko: {
        q: "P8. (a) 같은 결합 세기 t = 1.5 eV에 자리 에너지가 ε_A − ε_B = 2 eV인 AB 사슬의 띠 간격과 흡수 경계 파장은? (b) 폴리아세틸렌을 SSH 모형(t₀ = 2.5 eV, t₁,₂ = t₀(1 ± δ))으로 볼 때 관측 간격 1.4 eV를 주는 δ와 흡수 경계 파장은? (c) 두 경우 모두 원자당 전자가 1개라면 왜 절연체(반도체)인가?",
        s: "(a) t₁ = t₂이면 E_g = 2√(Δ² + 0) = |ε_A − ε_B| = 2 eV, λ = 1239.84/2 = 620 nm. 띠 폭과 무관하게 간격은 자리 에너지 차이로만 정해집니다. (b) Δ = 0이면 E_g = 2|t₁ − t₂| = 4δt₀ = 1.4 eV에서 δ = 0.14, λ = 886 nm(근적외선). (c) 세포에 원자가 둘이므로 세포당 전자가 2개이고, 이는 아래 띠의 k 상태 N/2개를 스핀 둘씩 정확히 채웁니다. 꽉 찬 띠는 전기장을 걸어도 속도의 합이 0이라 전류를 나르지 못합니다.",
      },
      en: {
        q: "P8. (a) An AB chain has equal bonds t = 1.5 eV and site energies ε_A − ε_B = 2 eV. What are its band gap and absorption-edge wavelength? (b) Modelling polyacetylene with the SSH model (t₀ = 2.5 eV, t₁,₂ = t₀(1 ± δ)), what δ gives the observed 1.4 eV gap, and what is the edge wavelength? (c) With one electron per atom in both cases, why are they insulators (semiconductors)?",
        s: "(a) With t₁ = t₂, E_g = 2√(Δ² + 0) = |ε_A − ε_B| = 2 eV and λ = 1239.84/2 = 620 nm; the gap is set by the site-energy difference alone, independent of the band width. (b) With Δ = 0, E_g = 2|t₁ − t₂| = 4δt₀ = 1.4 eV gives δ = 0.14 and λ = 886 nm (near infrared). (c) Two atoms per cell means two electrons per cell, which exactly fill the lower band's states, two spins each. A full band has zero total velocity even under a field, so it carries no current.",
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
            ? "풀이를 열기 전에 스스로 풀어 보십시오. P1–P2는 Planck 분포와 Einstein 모형, P3–P5는 Debye 모형과 저온 열용량(공정 설계 사례 포함), P6–P7은 강결합 띠, P8은 띠 간격입니다. 수치는 Raw 코드 탭의 Python·C++ 코드로 검산했습니다."
            : "Attempt each before opening the solution. P1–P2 cover the Planck distribution and the Einstein model, P3–P5 the Debye model and low-temperature heat capacity (with a process-design case), P6–P7 tight-binding bands, and P8 band gaps. The numbers were checked with the Python and C++ codes in the Raw Codes tab."}
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
  planck_einstein: {
    ko: "Planck 분포·준위 점유·Einstein 열용량", en: "Planck distribution · level populations · Einstein heat capacity",
    codes: { python: PY_PLANCK, matlab: ML_PLANCK, julia: JL_PLANCK, cpp: CPP_PLANCK },
  },
  debye_heat: {
    ko: "k 공간 세기·Debye 열용량·T³ 법칙·Cu 냉각", en: "k-space counting · Debye heat capacity · T³ law · cooling Cu",
    codes: { python: PY_DEBYE, matlab: ML_DEBYE, julia: JL_DEBYE, cpp: CPP_DEBYE },
  },
  tight_binding: {
    ko: "강결합 고리·유효 질량·띠 채움 에너지", en: "Tight-binding ring · effective mass · band-filling energy",
    codes: { python: PY_TB, matlab: ML_TB, julia: JL_TB, cpp: CPP_TB },
  },
  diatomic_band: {
    ko: "세포당 원자 둘·띠 간격·결합 교대", en: "Two atoms per cell · band gap · bond alternation",
    codes: { python: PY_GAP, matlab: ML_GAP, julia: JL_GAP, cpp: CPP_GAP },
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
  const [topic, setTopic] = useState("planck_einstein");
  const [cl, setCl] = useState("python");
  const [copied, setCopied] = useState(false);
  const code = CODE_TOPICS[topic].codes[cl];
  const fname = `wk12_${topic}.${LANG_META[cl].ext}`;

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
            ? "이 페이지의 인터랙티브 뒤에 있는 계산을 직접 실행해 볼 수 있는 독립 코드입니다. Python과 C++은 실행해 확인한 값입니다: Planck 분포 직접 합과 공식의 일치(x = 1에서 0.58197671), 준위 점유 63.2%·23.3%·8.6%, Einstein 고체(θ_E = 240 K)의 C_V/3R = 0.921(240 K)·0.987(600 K), k 공간 격자점 수와 (4/3)πM³의 비 0.9988(M = 40), T³ 계수 1943.8 J mol⁻¹ K⁻¹, Cu(θ_D = 343 K) C_V = 0.385(20 K)·23.39(300 K) J mol⁻¹ K⁻¹, Cu 냉각 엔탈피 70.4 kJ/kg(3R이면 87.5), N = 12 고리 고유값과 해석해의 차이 < 10⁻¹⁵, 유효 질량 0.610·0.847·0.305 m_e, 원자당 띠 에너지 −0.4872t·−0.9003t·−1.2732t·0(f = 0.25, 0.5, 1, 2), 이원자 간격 |ε_A − ε_B|와 2|t₁ − t₂|의 수치 확인. MATLAB과 Julia 판은 같은 알고리즘을 옮긴 것입니다."
            : "Standalone codes for the calculations behind every interactive on this page. The Python and C++ versions were run and give: the Planck direct sum matching the formula (0.58197671 at x = 1); level populations 63.2%, 23.3%, 8.6%; an Einstein solid (θ_E = 240 K) with C_V/3R = 0.921 (240 K) and 0.987 (600 K); a k-space lattice-point count within 0.9988 of (4/3)πM³ (M = 40); the T³ coefficient 1943.8 J mol⁻¹ K⁻¹; Cu (θ_D = 343 K) with C_V = 0.385 (20 K) and 23.39 (300 K) J mol⁻¹ K⁻¹; a Cu cool-down enthalpy of 70.4 kJ/kg (87.5 with 3R); N = 12 ring eigenvalues within 10⁻¹⁵ of the analytic result; effective masses 0.610, 0.847 and 0.305 m_e; band energies per atom −0.4872t, −0.9003t, −1.2732t and 0 (f = 0.25, 0.5, 1, 2); and numerical checks of the gaps |ε_A − ε_B| and 2|t₁ − t₂|. The MATLAB and Julia versions port the same algorithms."}
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
