// ============================================================
// Week13App.jsx — Crystal Structure, X-ray Diffraction & Reciprocal Lattice
// Physical Chemistry 2 (물리화학 2)
// SKKU School of Chemical Engineering
// Smart Process & Materials Design Lab (SPMDL)
// Prof. S. Joon Kwon
// ------------------------------------------------------------
// Topics covered (Wk13 Part 1):
//   • Lattice + basis = crystal, primitive translation vectors,
//     Bravais lattices (5 in 2D, 14 in 3D), cubic lattices SC/BCC/FCC
//   • Crystal planes: Miller indices, interplanar spacing d_hkl
//   • X-ray diffraction: Bragg's law, powder patterns
//   • Fourier analysis of periodic density, reciprocal lattice,
//     Laue condition Δk = G, 2k·G = G², Ewald construction
//   • Wigner–Seitz cell, Brillouin zones (SC, BCC, FCC)
//   • Structure factor, atomic form factor, extinction rules
// ============================================================
import { useState, useEffect, useRef, useMemo } from "react";
import {
  PY_GEOM, ML_GEOM, JL_GEOM, CPP_GEOM,
  PY_RECIP, ML_RECIP, JL_RECIP, CPP_RECIP,
  PY_SF, ML_SF, JL_SF, CPP_SF,
  PY_XRD, ML_XRD, JL_XRD, CPP_XRD,
} from "./Week13Codes";

// ── i18n ─────────────────────────────────────────────────────
const i18n = {
  ko: {
    weekTitle: "Week 13 — 결정 구조, X선 회절과 역격자",
    subtitle: "격자와 기저 · Bravais 격자 · Miller 지수 · Bragg 법칙 · 역격자와 Laue 조건 · Ewald 작도 · Brillouin 영역 · 구조 인자",
    tabs: {
      overview: "개요",
      lattice: "격자 & Miller 지수",
      bragg: "Bragg 법칙 & 분말 XRD",
      recip: "Fourier & 역격자",
      bz: "Wigner–Seitz & Brillouin 영역",
      sf: "구조 인자 & 소멸 규칙",
      practice: "연습문제",
      codes: "Raw 코드",
    },
  },
  en: {
    weekTitle: "Week 13 — Crystal Structure, X-ray Diffraction & Reciprocal Lattice",
    subtitle: "Lattice and basis · Bravais lattices · Miller indices · Bragg's law · Reciprocal lattice and Laue condition · Ewald construction · Brillouin zones · Structure factor",
    tabs: {
      overview: "Overview",
      lattice: "Lattices & Miller Indices",
      bragg: "Bragg's Law & Powder XRD",
      recip: "Fourier & Reciprocal Lattice",
      bz: "Wigner–Seitz & Brillouin Zones",
      sf: "Structure Factor & Extinctions",
      practice: "Practice",
      codes: "Raw Codes",
    },
  },
};

// ── design tokens (Week 13 accent: fuchsia) ───────────────
const C = {
  bg: "#0b0f17",
  panel: "#111827",
  card: "#1f2937",
  border: "#374151",
  text: "#e5e7eb",
  textDim: "#9ca3af",
  accent: "#e879f9",
  accentSoft: "#f0abfc",
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
const DEG = Math.PI / 180;
const LAMBDA_CU = 1.5406;   // Cu Kα1 wavelength, Å

// =============================================================
// MAIN COMPONENT
// =============================================================
export default function Week13App({ onBack, lang: langProp, onLangChange }) {
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
        {tab === "lattice" && <LatticeTab lang={lang} />}
        {tab === "bragg" && <BraggTab lang={lang} />}
        {tab === "recip" && <RecipTab lang={lang} />}
        {tab === "bz" && <BzTab lang={lang} />}
        {tab === "sf" && <SfTab lang={lang} />}
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
    background: active ? "rgba(232,121,249,0.16)" : "transparent",
    color: active ? C.accentSoft : C.textDim,
    border: `1px solid ${active ? "rgba(232,121,249,0.45)" : "transparent"}`,
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
      tag: "Q1", color: C.accent, tab: "bragg",
      ko: "가시광선 현미경으로는 원자 배열을 볼 수 없다. 그런데 1912년 X선을 결정에 쪼이자 사진판에 규칙적인 점 무늬가 찍혔다. 왜 X선이어야 했을까?",
      en: "Visible-light microscopes cannot see atomic arrangements, yet in 1912 X-rays shone on a crystal left a regular pattern of spots on a photographic plate. Why did it have to be X-rays?",
      hint: { ko: "파장이 원자 간격과 비슷해야 한다 → Bragg 법칙 & 분말 XRD", en: "The wavelength must match atomic spacings → Bragg's Law & Powder XRD" },
    },
    {
      tag: "Q2", color: C.sky, tab: "sf",
      ko: "NaCl과 KCl은 똑같은 암염 구조다. 그런데 KCl의 X선 회절 패턴에서는 NaCl에 있던 (111) 피크가 사라진다. 무엇이 다를까?",
      en: "NaCl and KCl share the same rock-salt structure, yet the (111) peak of NaCl is missing from the X-ray pattern of KCl. What is different?",
      hint: { ko: "세포 안 원자의 산란이 서로 상쇄된다 → 구조 인자 & 소멸 규칙", en: "Scattering from atoms in the cell cancels → Structure Factor & Extinctions" },
    },
    {
      tag: "Q3", color: C.teal, tab: "bz",
      ko: "11·12주차에서 포논과 전자의 파동 벡터는 늘 −π/a에서 π/a 사이로 제한했다. 그리고 경계 π/a에서 군속도가 0이 되고 띠 간격이 열렸다. 경계는 왜 특별할까?",
      en: "In Weeks 11 and 12 the wave vectors of phonons and electrons were always restricted to −π/a … π/a, and at the boundary π/a the group velocity vanished and band gaps opened. What makes the boundary special?",
      hint: { ko: "경계에 닿은 파동은 Bragg 반사된다 → Wigner–Seitz & Brillouin 영역", en: "Waves at the boundary are Bragg-reflected → Wigner–Seitz & Brillouin Zones" },
    },
  ];
  return (
    <div>
      <Card>
        <Hd>{isKo ? "이번 주의 질문" : "This week's questions"}</Hd>
        <Note>
          {isKo
            ? "12주차까지는 결정을 1차원 사슬로 단순화해 진동과 전자를 다루었습니다. 이번 주에는 실제 3차원 결정의 구조를 체계적으로 기술하고, 그 구조를 X선으로 재는 방법을 배웁니다. 먼저 결정을 '격자 + 기저'로 나누고, 격자를 대칭에 따라 분류합니다(Bravais 격자). 결정면에는 Miller 지수로 이름을 붙입니다. 다음으로 X선 회절의 조건을 두 가지 언어로 유도합니다. 하나는 원자면의 반사(Bragg 법칙)이고, 다른 하나는 전자 밀도의 Fourier 분해에서 나오는 역격자와 Laue 조건입니다. 마지막으로 역격자의 Wigner–Seitz 세포인 Brillouin 영역과, 피크의 세기를 정하는 구조 인자를 다룹니다."
            : "Up to Week 12 we simplified crystals to 1D chains to treat vibrations and electrons. This week we describe real 3D crystal structures systematically and learn how X-rays measure them. First we split a crystal into lattice plus basis and classify lattices by symmetry (Bravais lattices), naming crystal planes with Miller indices. Next we derive the X-ray diffraction condition in two languages: reflection from atomic planes (Bragg's law), and the reciprocal lattice and Laue condition that come from the Fourier decomposition of the electron density. Finally we meet the Brillouin zone, the Wigner–Seitz cell of the reciprocal lattice, and the structure factor that sets peak intensities."}
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
          <Stat label={isKo ? "충전율 SC / BCC / FCC" : "Packing fraction SC / BCC / FCC"} value="0.524 / 0.680 / 0.740" color={C.accent} />
          <Stat label={isKo ? "입방 격자의 면간 거리" : "Interplanar spacing (cubic)"} value="d = a/√(h² + k² + l²)" color={C.accent} />
          <Stat label={isKo ? "강의 예제: {111}, 2θ = 22.4°, λ = 154 pm" : "Lecture example: {111}, 2θ = 22.4°, λ = 154 pm"} value="d = 396 pm, a = 687 pm" color={C.sky} />
          <Stat label={isKo ? "Cu (111) 피크 (Cu Kα₁, a = 3.61 Å)" : "Cu (111) peak (Cu Kα₁, a = 3.61 Å)"} value="2θ = 43.4°" color={C.sky} />
          <Stat label={isKo ? "역격자 기본 벡터의 조건" : "Reciprocal primitive vectors"} value="b_i · a_j = 2π δ_ij" color={C.teal} />
          <Stat label={isKo ? "제1 BZ 면의 수 SC / BCC / FCC" : "Faces of the 1st BZ SC / BCC / FCC"} value="6 / 12 / 14" color={C.teal} />
          <Stat label={isKo ? "구조 인자 BCC / FCC (허용될 때)" : "Structure factor BCC / FCC (when allowed)"} value="2f / 4f" color={C.purple} />
          <Stat label={isKo ? "Pt 촉매 (111) 피크 FWHM 2° → 결정 크기" : "Pt catalyst (111) FWHM 2° → crystallite size"} value="4.2 nm" color={C.purple} />
        </StatGrid>
        <Note>
          {isKo
            ? "출처: X선 회절의 발견은 W. Friedrich, P. Knipping, M. Laue, Ann. Phys. 41, 971 (1913). 결정면의 반사 해석은 W. H. Bragg, W. L. Bragg, Proc. R. Soc. Lond. A 88, 428 (1913). 격자 상수는 C. Kittel, Introduction to Solid State Physics, 8th ed. (Wiley, 2005) 1장의 표. Scherrer 식은 P. Scherrer, Nachr. Ges. Wiss. Göttingen 1918, 98."
            : "Sources: the discovery of X-ray diffraction is W. Friedrich, P. Knipping, M. Laue, Ann. Phys. 41, 971 (1913); the plane-reflection analysis is W. H. Bragg, W. L. Bragg, Proc. R. Soc. Lond. A 88, 428 (1913); lattice constants are from the Chapter 1 tables of C. Kittel, Introduction to Solid State Physics, 8th ed. (Wiley, 2005); the Scherrer equation is P. Scherrer, Nachr. Ges. Wiss. Göttingen 1918, 98."}
        </Note>
      </Card>
    </div>
  );
}

function LectureMap({ isKo }) {
  const p1 = isKo
    ? [["결정 = 격자 + 기저", "병진 벡터 T, 기본 세포, 2D 5개·3D 14개 Bravais 격자"], ["입방 격자", "SC, BCC, FCC의 최근접 이웃과 충전율"], ["결정면", "Miller 지수, 면간 거리 d = a/√(h² + k² + l²)"], ["Bragg 법칙", "2d sin θ = nλ, 분말 회절 패턴과 지수 붙이기"]]
    : [["Crystal = lattice + basis", "translation T, primitive cell, 5 Bravais lattices in 2D and 14 in 3D"], ["Cubic lattices", "nearest neighbours and packing in SC, BCC, FCC"], ["Crystal planes", "Miller indices, spacing d = a/√(h² + k² + l²)"], ["Bragg's law", "2d sin θ = nλ, powder patterns and indexing"]];
  const p2 = isKo
    ? [["Fourier 해석과 역격자", "n(r) = Σ n_G e^(iG·r), b_i·a_j = 2πδ_ij"], ["Laue 조건과 Ewald 작도", "Δk = G, 2k·G = G², Bragg 법칙과 같은 내용"], ["Wigner–Seitz 세포와 Brillouin 영역", "SC → 정육면체, BCC → 마름모십이면체, FCC → 깎은 팔면체"], ["구조 인자", "원자 산란 인자, BCC·FCC 소멸 규칙, KCl"]]
    : [["Fourier analysis and the reciprocal lattice", "n(r) = Σ n_G e^(iG·r), b_i·a_j = 2πδ_ij"], ["Laue condition and Ewald construction", "Δk = G, 2k·G = G², equivalent to Bragg's law"], ["Wigner–Seitz cell and Brillouin zone", "SC → cube, BCC → rhombic dodecahedron, FCC → truncated octahedron"], ["Structure factor", "atomic form factor, BCC and FCC extinctions, KCl"]];
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
      {col(isKo ? "Part 1 · 결정 구조와 Bragg 회절" : "Part 1 · Crystal structure and Bragg diffraction", p1, C.accent)}
      {col(isKo ? "Part 2 · 역격자와 회절 이론" : "Part 2 · Reciprocal lattice and diffraction theory", p2, C.teal)}
    </div>
  );
}

// =============================================================
// 2) LATTICES, BRAVAIS LATTICES, CUBIC CELLS, MILLER INDICES
// =============================================================
// isometric-style projection of a 3D point (cube coordinates) for drawing
function proj3(p, yaw, pitch, s, cx, cy) {
  const [x, y, z] = p;
  const cyw = Math.cos(yaw), syw = Math.sin(yaw);
  const x1 = cyw * x - syw * y, y1 = syw * x + cyw * y;
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const y2 = cp * y1 - sp * z, z2 = sp * y1 + cp * z;
  return [cx + s * x1, cy - s * z2, y2];
}
const CUBE_EDGES = [[0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
const CUBE_V = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
const CUBIC = {
  SC: { pts: [[0, 0, 0]], prim: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], z: 6, dnn: 1, pf: Math.PI / 6 },
  BCC: { pts: [[0, 0, 0], [0.5, 0.5, 0.5]], prim: [[-0.5, 0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, -0.5]], z: 8, dnn: Math.sqrt(3) / 2, pf: Math.sqrt(3) * Math.PI / 8 },
  FCC: { pts: [[0, 0, 0], [0, 0.5, 0.5], [0.5, 0, 0.5], [0.5, 0.5, 0]], prim: [[0, 0.5, 0.5], [0.5, 0, 0.5], [0.5, 0.5, 0]], z: 12, dnn: Math.SQRT1_2, pf: Math.SQRT2 * Math.PI / 6 },
};
// all lattice points of a cubic lattice inside the closed unit cube
function cubePoints(type) {
  const out = [];
  for (const b of CUBIC[type].pts)
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) {
      const p = [b[0] + i, b[1] + j, b[2] + k];
      if (p.every(v => v > -1e-9 && v < 1 + 1e-9) && !out.some(q => q.every((v, n) => Math.abs(v - p[n]) < 1e-9))) out.push(p);
    }
  return out;
}
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
// Miller indices from intercepts (Infinity = parallel); intercepts are multiples of 1/2, 1/3, ... up to 6
function millerFromIntercepts(ic) {
  const recips = ic.map(x => (isFinite(x) ? 1 / x : 0));
  for (let m = 1; m <= 360; m++) {
    const v = recips.map(r => r * m);
    if (v.every(x => Math.abs(x - Math.round(x)) < 1e-9)) {
      const ints = v.map(x => Math.round(x));
      const g = ints.reduce((a, b) => gcd(a, Math.abs(b)), 0) || 1;
      return ints.map(x => x / g);
    }
  }
  return [0, 0, 0];
}
// polygon where plane h x + k y + l z = c cuts the unit cube
function planeInCube(h, k, l) {
  const n = [h, k, l];
  const c = 1 + n.reduce((s, v) => s + (v < 0 ? v : 0), 0);
  const pts = [];
  for (const [a, b] of CUBE_EDGES) {
    const P = CUBE_V[a], Q = CUBE_V[b];
    const fp = n[0] * P[0] + n[1] * P[1] + n[2] * P[2] - c, fq = n[0] * Q[0] + n[1] * Q[1] + n[2] * Q[2] - c;
    if (Math.abs(fp) < 1e-9) pts.push(P);
    if (Math.abs(fq) < 1e-9) pts.push(Q);
    if (fp * fq < 0) { const t = fp / (fp - fq); pts.push(P.map((v, i) => v + t * (Q[i] - v))); }
  }
  const uniq = [];
  for (const p of pts) if (!uniq.some(q => q.every((v, i) => Math.abs(v - p[i]) < 1e-9))) uniq.push(p);
  if (uniq.length < 3) return uniq;
  const cen = [0, 1, 2].map(i => uniq.reduce((s, p) => s + p[i], 0) / uniq.length);
  // order the vertices around the centroid in the plane
  const nn = Math.hypot(...n);
  const nu = n.map(v => v / nn);
  let u = Math.abs(nu[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const dotu = u[0] * nu[0] + u[1] * nu[1] + u[2] * nu[2];
  u = u.map((v, i) => v - dotu * nu[i]);
  const un = Math.hypot(...u); u = u.map(v => v / un);
  const w = [nu[1] * u[2] - nu[2] * u[1], nu[2] * u[0] - nu[0] * u[2], nu[0] * u[1] - nu[1] * u[0]];
  return uniq.map(p => {
    const d = p.map((v, i) => v - cen[i]);
    return { p, ang: Math.atan2(d[0] * w[0] + d[1] * w[1] + d[2] * w[2], d[0] * u[0] + d[1] * u[1] + d[2] * u[2]) };
  }).sort((a, b) => a.ang - b.ang).map(o => o.p);
}

function LatticeTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <CrystalIdeaCard isKo={isKo} />
      <Lattice2DLab isKo={isKo} />
      <BravaisCard isKo={isKo} />
      <CubicLab isKo={isKo} />
      <MillerLab isKo={isKo} />
    </div>
  );
}

function CrystalIdeaCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "결정 = 격자 + 기저" : "Crystal = lattice + basis"}</Hd>
      <Note>
        {isKo
          ? "결정은 같은 원자 묶음이 끝없이 반복되어 만들어진 구조입니다. 이 반복되는 묶음을 기저(basis)라고 하고, 기저를 붙이는 점들의 집합을 격자(lattice)라고 합니다. 격자는 수학적인 점의 배열일 뿐이고, 실제 원자는 기저가 정합니다. 예를 들어 NaCl은 면심입방(FCC) 격자의 각 점에 Na⁺와 Cl⁻ 한 쌍을 붙인 구조입니다."
          : "A crystal is a structure built by repeating the same group of atoms without end. The repeated group is the basis, and the set of points where the basis is attached is the lattice. The lattice is only a mathematical array of points; the basis decides where the atoms actually sit. NaCl, for example, is a face-centred cubic (FCC) lattice with one Na⁺–Cl⁻ pair attached to every point."}
      </Note>
      <Eq>r′ = r + T,   T = u₁a₁ + u₂a₂ + u₃a₃   (u₁, u₂, u₃ {isKo ? "정수" : "integers"})</Eq>
      <Note>
        {isKo
          ? "격자의 어느 점 r에서 보아도, T만큼 옮긴 점 r′에서 보는 풍경이 똑같습니다. 이 성질이 병진 대칭입니다. 모든 격자점을 정수 계수로 만들 수 있는 가장 작은 벡터 세 개(a₁, a₂, a₃)가 기본 병진 벡터(primitive translation vectors)입니다. 이 세 벡터가 만드는 평행육면체가 기본 세포(primitive cell)이고, 부피 V_c = |a₁·(a₂ × a₃)|가 가장 작은 세포입니다. 기본 세포 하나에는 격자점이 정확히 1개 들어 있습니다."
          : "Seen from any lattice point r, the surroundings look exactly the same from the point r′ shifted by T: this is translational symmetry. The three smallest vectors that generate every lattice point with integer coefficients (a₁, a₂, a₃) are the primitive translation vectors. The parallelepiped they span is the primitive cell, the cell of minimum volume V_c = |a₁·(a₂ × a₃)|, and it contains exactly one lattice point."}
      </Note>
    </Card>
  );
}

const LAT2D_PRESETS = [
  { id: "square", ko: "정사각", en: "Square", b: 1, g: 90 },
  { id: "rect", ko: "직사각", en: "Rectangular", b: 0.65, g: 90 },
  { id: "crect", ko: "중심 직사각", en: "Centred rectangular", b: 1, g: 70 },
  { id: "hex", ko: "육방", en: "Hexagonal", b: 1, g: 60 },
  { id: "obl", ko: "사방(비스듬)", en: "Oblique", b: 0.8, g: 75 },
];
function classify2D(b, g) {
  const eq = (x, y, t = 0.011) => Math.abs(x - y) < t;
  const gg = g > 90 ? 180 - g : g;
  if (eq(gg, 90, 0.6)) return eq(b, 1) ? "square" : "rect";
  if (eq(b, 1) && eq(gg, 60, 0.6)) return "hex";
  if (eq(b, 1)) return "crect";
  // |a2| cos g = |a1|/2 also gives a centred rectangular lattice
  if (eq(b * Math.cos(gg * DEG), 0.5)) return "crect";
  return "obl";
}
function Lattice2DLab({ isKo }) {
  const [b, setB] = useState(1);
  const [g, setG] = useState(60);
  const [basis, setBasis] = useState(false);
  const type = classify2D(b, g);
  const a1 = [1, 0], a2 = [b * Math.cos(g * DEG), b * Math.sin(g * DEG)];
  const W = 640, Ht = 360, s = 62, cx = W / 2 - 40, cy = Ht / 2 + 20;
  const P = (x, y) => [cx + s * x, cy - s * y];
  const pts = [];
  for (let i = -7; i <= 7; i++) for (let j = -6; j <= 6; j++) {
    const x = i * a1[0] + j * a2[0], y = i * a1[1] + j * a2[1];
    const [X, Y] = P(x, y);
    if (X > 10 && X < W - 10 && Y > 10 && Y < Ht - 10) pts.push([X, Y, i, j]);
  }
  const cell = [[0, 0], a1, [a1[0] + a2[0], a1[1] + a2[1]], a2].map(([x, y]) => P(x, y).join(",")).join(" ");
  const info = LAT2D_PRESETS.find(p => p.id === type);
  const bOff = [0.35 * a1[0] + 0.3 * a2[0], 0.35 * a1[1] + 0.3 * a2[1]];
  return (
    <Card>
      <Hd>{isKo ? "실험실 ① 2차원 격자 만들기: Bravais 격자는 왜 5개뿐인가" : "Lab ① Build a 2D lattice: why there are only five Bravais lattices"}</Hd>
      <Row>
        {LAT2D_PRESETS.map(p => (
          <button key={p.id} style={btnStyle(type === p.id)} onClick={() => { setB(p.b); setG(p.g); }}>{isKo ? p.ko : p.en}</button>
        ))}
      </Row>
      <Row>
        <Slider label="|a₂| / |a₁|" value={b} min={0.5} max={1.5} step={0.01} onChange={setB} fmt={v => v.toFixed(2)} />
        <Slider label={isKo ? "사잇각 γ" : "Angle γ"} value={g} min={45} max={135} step={1} onChange={setG} unit="°" fmt={v => v.toFixed(0)} />
        <button style={btnStyle(basis)} onClick={() => setBasis(v => !v)}>{isKo ? (basis ? "기저 2원자 끄기" : "기저 2원자 붙이기") : (basis ? "Remove 2-atom basis" : "Attach 2-atom basis")}</button>
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <polygon points={cell} fill={`${C.accent}22`} stroke={C.accent} strokeWidth={2} />
        {pts.map(([X, Y, i, j]) => (
          <g key={`${i},${j}`}>
            <circle cx={X} cy={Y} r={basis ? 3 : 5} fill={basis ? "#94a3b8" : C.sky} />
            {basis && <>
              <circle cx={X} cy={Y} r={7} fill={C.sky} opacity={0.9} />
              <circle cx={X + s * bOff[0]} cy={Y - s * bOff[1]} r={5} fill={C.amber} />
            </>}
          </g>
        ))}
        <line x1={P(0, 0)[0]} y1={P(0, 0)[1]} x2={P(...a1)[0]} y2={P(...a1)[1]} stroke={C.pink} strokeWidth={3} markerEnd="url(#arr13)" />
        <line x1={P(0, 0)[0]} y1={P(0, 0)[1]} x2={P(...a2)[0]} y2={P(...a2)[1]} stroke={C.lime} strokeWidth={3} markerEnd="url(#arr13)" />
        <defs><marker id="arr13" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#e5e7eb" /></marker></defs>
        <text x={P(...a1)[0] + 6} y={P(...a1)[1] + 16} fill={C.pink} fontSize={13}>a₁</text>
        <text x={P(...a2)[0] - 22} y={P(...a2)[1] - 4} fill={C.lime} fontSize={13}>a₂</text>
      </svg>
      <StatGrid>
        <Stat label={isKo ? "격자 종류" : "Lattice type"} value={isKo ? info.ko : info.en} color={C.accent} />
        <Stat label={isKo ? "기본 세포 넓이 |a₁ × a₂|" : "Primitive-cell area |a₁ × a₂|"} value={`${(b * Math.sin(g * DEG)).toFixed(3)} a²`} color={C.sky} />
        <Stat label={isKo ? "세포당 격자점" : "Lattice points per cell"} value="1" color={C.ok} />
      </StatGrid>
      <Note>
        {isKo
          ? "길이와 각도를 아무렇게나 고르면 대칭이 없는 사방(비스듬한) 격자가 됩니다. 특별한 값을 고르면 대칭이 높아집니다. γ = 90°이면 직사각, 거기에 |a₂| = |a₁|이면 정사각입니다. |a₂| = |a₁|이고 γ = 60°이면 육방입니다. |a₂| = |a₁|이지만 각도가 특별하지 않으면, 마름모 세포는 사실 '가운데 점이 있는 직사각형'이므로 중심 직사각 격자입니다. 이 다섯 가지 말고는 새로운 대칭이 생기지 않습니다. 기저를 붙이면 결정의 모양은 바뀌지만 격자는 그대로입니다."
          : "Arbitrary lengths and angles give an oblique lattice with no special symmetry. Special values raise the symmetry: γ = 90° gives a rectangular lattice, and with |a₂| = |a₁| a square one; |a₂| = |a₁| with γ = 60° gives a hexagonal lattice. With |a₂| = |a₁| but a general angle, the rhombic cell is really a rectangle with a centre point: the centred rectangular lattice. No other choice produces a new symmetry, so there are five 2D Bravais lattices. Attaching a basis changes the crystal but not the lattice."}
      </Note>
    </Card>
  );
}

function BravaisCard({ isKo }) {
  const rows = isKo
    ? [["삼사정계 (triclinic)", "a ≠ b ≠ c, α ≠ β ≠ γ", "회전 대칭 없음", "P"],
       ["단사정계 (monoclinic)", "a ≠ b ≠ c, α = γ = 90° ≠ β", "2회 축 1개", "P, C"],
       ["사방정계 (orthorhombic)", "a ≠ b ≠ c, α = β = γ = 90°", "서로 수직인 2회 축 3개", "P, C, I, F"],
       ["정방정계 (tetragonal)", "a = b ≠ c, α = β = γ = 90°", "4회 축 1개", "P, I"],
       ["삼방정계 (trigonal)", "a = b = c, α = β = γ < 120°, ≠ 90°", "3회 축 1개", "R"],
       ["육방정계 (hexagonal)", "a = b ≠ c, α = β = 90°, γ = 120°", "6회 축 1개", "P"],
       ["입방정계 (cubic)", "a = b = c, α = β = γ = 90°", "정사면체 꼭짓점을 향한 3회 축 4개", "P, I, F"]]
    : [["Triclinic", "a ≠ b ≠ c, α ≠ β ≠ γ", "no rotational symmetry", "P"],
       ["Monoclinic", "a ≠ b ≠ c, α = γ = 90° ≠ β", "one twofold axis", "P, C"],
       ["Orthorhombic", "a ≠ b ≠ c, α = β = γ = 90°", "three perpendicular twofold axes", "P, C, I, F"],
       ["Tetragonal", "a = b ≠ c, α = β = γ = 90°", "one fourfold axis", "P, I"],
       ["Trigonal (rhombohedral)", "a = b = c, α = β = γ < 120°, ≠ 90°", "one threefold axis", "R"],
       ["Hexagonal", "a = b ≠ c, α = β = 90°, γ = 120°", "one sixfold axis", "P"],
       ["Cubic", "a = b = c, α = β = γ = 90°", "four threefold axes toward tetrahedron corners", "P, I, F"]];
  return (
    <Card>
      <Hd>{isKo ? "3차원: 결정계 7개, Bravais 격자 14개" : "3D: seven crystal systems, fourteen Bravais lattices"}</Hd>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
          <thead>
            <tr style={{ color: C.textDim, textAlign: "left" }}>
              <th style={{ padding: "6px 10px" }}>{isKo ? "결정계" : "Crystal system"}</th>
              <th style={{ padding: "6px 10px" }}>{isKo ? "세포 조건" : "Cell conditions"}</th>
              <th style={{ padding: "6px 10px" }}>{isKo ? "핵심 대칭" : "Essential symmetry"}</th>
              <th style={{ padding: "6px 10px" }}>{isKo ? "Bravais 격자" : "Bravais lattices"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r[0]} style={{ borderTop: `1px solid ${C.border}` }}>
                <td style={{ padding: "6px 10px", fontWeight: 700 }}>{r[0]}</td>
                <td style={{ padding: "6px 10px", fontFamily: mono, fontSize: 12 }}>{r[1]}</td>
                <td style={{ padding: "6px 10px", color: C.textDim }}>{r[2]}</td>
                <td style={{ padding: "6px 10px", color: C.accent, fontFamily: mono }}>{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note>
        {isKo
          ? "P는 꼭짓점에만 격자점이 있는 단순(primitive) 세포, I는 체심(body-centred), F는 면심(face-centred), C(또는 A, B)는 마주 보는 한 쌍의 면에만 점을 더한 저심(side-centred) 세포입니다. 모두 더하면 1 + 2 + 4 + 2 + 1 + 1 + 3 = 14개입니다. 결정계를 정하는 것은 세포의 길이와 각도가 아니라 회전 대칭입니다. 길이와 각도는 그 대칭의 결과로 따라옵니다."
          : "P is a primitive cell with points only at the corners, I is body-centred, F face-centred, and C (or A, B) side-centred, with extra points on one pair of opposite faces. The total is 1 + 2 + 4 + 2 + 1 + 1 + 3 = 14. What defines a crystal system is its rotational symmetry, not the cell lengths and angles; those follow from the symmetry."}
      </Note>
    </Card>
  );
}

function CubicLab({ isKo }) {
  const [type, setType] = useState("BCC");
  const [yaw, setYaw] = useState(-30);
  const [showNN, setShowNN] = useState(true);
  const W = 640, Ht = 360, s = 170, cx = W / 2 - 60, cy = Ht / 2 + 70;
  const pr = p => proj3([p[0] - 0.5, p[1] - 0.5, p[2] - 0.5], yaw * DEG, 0.42, s, cx + 0, cy - 85);
  const pts = cubePoints(type);
  const info = CUBIC[type];
  // nearest-neighbour bonds among points in the cube
  const bonds = [];
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const d = Math.hypot(...pts[i].map((v, n) => v - pts[j][n]));
    if (Math.abs(d - info.dnn) < 1e-6) bonds.push([pts[i], pts[j]]);
  }
  const sorted = pts.map(p => ({ p, q: pr(p) })).sort((a, b) => a.q[2] - b.q[2]);
  const isCorner = p => p.every(v => Math.abs(v) < 1e-9 || Math.abs(v - 1) < 1e-9);
  const cornerShare = isKo ? "꼭짓점 8 × 1/8" : "8 corners × 1/8";
  const extra = { SC: "", BCC: isKo ? " + 중심 1" : " + 1 centre", FCC: isKo ? " + 면 6 × 1/2" : " + 6 faces × 1/2" }[type];
  return (
    <Card>
      <Hd>{isKo ? "실험실 ② 입방 격자 셋: SC, BCC, FCC" : "Lab ② The three cubic lattices: SC, BCC, FCC"}</Hd>
      <Row>
        {["SC", "BCC", "FCC"].map(k => <button key={k} style={btnStyle(type === k)} onClick={() => setType(k)}>{k}</button>)}
        <Slider label={isKo ? "회전" : "Rotate"} value={yaw} min={-90} max={90} step={1} onChange={setYaw} unit="°" fmt={v => v.toFixed(0)} />
        <button style={btnStyle(showNN)} onClick={() => setShowNN(v => !v)}>{isKo ? "최근접 이웃 선" : "Nearest-neighbour lines"}</button>
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        {CUBE_EDGES.map(([a, b2], i) => {
          const A = pr(CUBE_V[a]), B = pr(CUBE_V[b2]);
          return <line key={i} x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke="#475569" strokeWidth={1.5} />;
        })}
        {showNN && bonds.map(([p, q], i) => {
          const A = pr(p), B = pr(q);
          return <line key={`b${i}`} x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={C.amber} strokeWidth={1.6} strokeDasharray="4 3" />;
        })}
        {info.prim.map((v, i) => {
          const A = pr([0, 0, 0]), B = pr(v);
          return <line key={`p${i}`} x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={[C.pink, C.lime, C.sky][i]} strokeWidth={3} />;
        })}
        {sorted.map(({ p, q }, i) => (
          <circle key={i} cx={q[0]} cy={q[1]} r={isCorner(p) ? 9 : 11} fill={isCorner(p) ? C.accent : C.teal} stroke="#0b0f17" strokeWidth={1.5} />
        ))}
        <text x={W - 200} y={40} fill={C.pink} fontSize={12}>a₁</text>
        <text x={W - 170} y={40} fill={C.lime} fontSize={12}>a₂</text>
        <text x={W - 140} y={40} fill={C.sky} fontSize={12}>a₃ {isKo ? "(기본 벡터)" : "(primitive)"}</text>
      </svg>
      <StatGrid>
        <Stat label={isKo ? "입방 세포당 격자점" : "Lattice points per cube"} value={`${cornerShare}${extra} = ${{ SC: 1, BCC: 2, FCC: 4 }[type]}`} color={C.accent} />
        <Stat label={isKo ? "기본 세포 부피" : "Primitive-cell volume"} value={`${{ SC: "1", BCC: "1/2", FCC: "1/4" }[type]} a³`} color={C.sky} />
        <Stat label={isKo ? "최근접 이웃 수 z와 거리" : "Nearest neighbours z and distance"} value={`${info.z},  ${{ SC: "a", BCC: "(√3/2) a", FCC: "a/√2" }[type]}`} color={C.amber} />
        <Stat label={isKo ? "충전율 (닿는 구)" : "Packing fraction (touching spheres)"} value={`${{ SC: "π/6", BCC: "√3π/8", FCC: "√2π/6" }[type]} = ${info.pf.toFixed(3)}`} color={C.ok} />
      </StatGrid>
      <Note>
        {isKo
          ? "기본 벡터(색깔 선)가 만드는 기본 세포에는 격자점이 1개뿐입니다. 입방 세포는 대칭이 잘 보여서 편하지만, BCC에서는 기본 세포 2개, FCC에서는 4개 크기입니다. 충전율은 같은 구를 서로 닿게 놓았을 때 공간을 채운 비율입니다. FCC(Cu, Al, Ni)는 0.740으로 가장 조밀하고, BCC(α-Fe, Na, W)는 0.680, SC는 0.524입니다. 실제로 SC 구조를 갖는 원소는 α-Po 정도로 드뭅니다."
          : "The primitive cell spanned by the primitive vectors (coloured lines) holds a single lattice point. The cubic cell shows the symmetry clearly but is two primitive cells big for BCC and four for FCC. The packing fraction is the share of space filled when identical spheres touch: FCC (Cu, Al, Ni) is densest at 0.740, BCC (α-Fe, Na, W) is 0.680 and SC 0.524. Elements with an SC structure are rare; α-Po is the classic example."}
      </Note>
    </Card>
  );
}

const INTERCEPT_OPTS = [0.5, 1, 2, 3, 6, -1, Infinity];
const icLabel = v => (isFinite(v) ? (v === 0.5 ? "½" : String(v)) : "∞");
function MillerLab({ isKo }) {
  const [ic, setIc] = useState([1, 1, 1]);
  const [yaw, setYaw] = useState(-30);
  const hkl = millerFromIntercepts(ic);
  const valid = hkl.some(v => v !== 0);
  const N = hkl.reduce((s, v) => s + v * v, 0);
  const W = 640, Ht = 340, s = 165, cx = W / 2 - 80, cy = Ht / 2 + 0;
  const pr = p => proj3([p[0] - 0.5, p[1] - 0.5, p[2] - 0.5], yaw * DEG, 0.42, s, cx, cy);
  const poly = valid ? planeInCube(...hkl) : [];
  const fmt = v => (v < 0 ? `${Math.abs(v)}̄` : String(v));
  const presets = [[1, Infinity, Infinity], [1, 1, Infinity], [1, 1, 1], [0.5, 1, Infinity], [1, -1, Infinity], [0.5, 0.5, 0.5]];
  return (
    <Card>
      <Hd>{isKo ? "실험실 ③ Miller 지수: 절편 → 역수 → 정수" : "Lab ③ Miller indices: intercepts → reciprocals → integers"}</Hd>
      <Note>
        {isKo
          ? "결정면의 방향은 세 단계로 이름 붙입니다. (1) 면이 a₁, a₂, a₃ 축을 자르는 절편을 격자 상수 단위로 읽습니다. (2) 그 역수를 취합니다. 축과 평행하면 절편이 ∞이므로 역수는 0입니다. (3) 같은 비율의 가장 작은 정수로 바꿉니다. 그 결과를 괄호에 넣은 (hkl)이 Miller 지수입니다. 음수는 숫자 위에 막대를 그어 표시합니다."
          : "A crystal plane is named in three steps. (1) Read the intercepts on the a₁, a₂, a₃ axes in units of the lattice constants. (2) Take their reciprocals; a plane parallel to an axis has intercept ∞ and reciprocal 0. (3) Reduce to the smallest integers with the same ratio. The result in parentheses, (hkl), is the Miller index; a negative index carries a bar."}
      </Note>
      <Row>
        {presets.map((p, i) => <button key={i} style={btnStyle(ic.every((v, n) => v === p[n]))} onClick={() => setIc(p)}>{p.map(icLabel).join(", ")}</button>)}
      </Row>
      <Row>
        {[0, 1, 2].map(n => (
          <label key={n} style={{ fontSize: 13, color: C.textDim }}>
            {["a₁", "a₂", "a₃"][n]} {isKo ? "절편" : "intercept"}{" "}
            <select value={String(ic[n])} onChange={e => { const v = e.target.value === "Infinity" ? Infinity : +e.target.value; setIc(o => o.map((x, m) => (m === n ? v : x))); }}
              style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 6px", marginLeft: 4 }}>
              {INTERCEPT_OPTS.map(v => <option key={String(v)} value={String(v)}>{icLabel(v)}</option>)}
            </select>
          </label>
        ))}
        <Slider label={isKo ? "회전" : "Rotate"} value={yaw} min={-90} max={90} step={1} onChange={setYaw} unit="°" fmt={v => v.toFixed(0)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        {poly.length >= 3 && <polygon points={poly.map(p => pr(p).slice(0, 2).join(",")).join(" ")} fill={`${C.accent}55`} stroke={C.accent} strokeWidth={2} />}
        {CUBE_EDGES.map(([a, b2], i) => {
          const A = pr(CUBE_V[a]), B = pr(CUBE_V[b2]);
          return <line key={i} x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke="#64748b" strokeWidth={1.5} />;
        })}
        {[[1, 0, 0], [0, 1, 0], [0, 0, 1]].map((v, i) => {
          const A = pr([0, 0, 0]), B = pr(v.map(x => x * 1.25));
          return <g key={i}><line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={[C.pink, C.lime, C.sky][i]} strokeWidth={2} /><text x={B[0] + 4} y={B[1]} fill={[C.pink, C.lime, C.sky][i]} fontSize={13}>{["a₁", "a₂", "a₃"][i]}</text></g>;
        })}
        <text x={W - 170} y={50} fill={C.accent} fontSize={30} fontWeight={800} fontFamily={mono}>({hkl.map(fmt).join("")})</text>
      </svg>
      <StatGrid>
        <Stat label={isKo ? "역수" : "Reciprocals"} value={ic.map(v => (isFinite(v) ? (1 / v === 2 ? "2" : (1 / v).toFixed(3).replace(/\.?0+$/, "")) : "0")).join(", ")} color={C.sky} />
        <Stat label={isKo ? "Miller 지수 (hkl)" : "Miller index (hkl)"} value={`(${hkl.map(fmt).join(" ")})`} color={C.accent} />
        <Stat label={isKo ? "입방 격자의 면간 거리" : "Interplanar spacing (cubic)"} value={valid ? `d = a/√${N} = ${(1 / Math.sqrt(N)).toFixed(4)} a` : "—"} color={C.ok} />
      </StatGrid>
      <Note>
        {isKo
          ? "입방 격자에서 (hkl) 면의 법선은 벡터 (h, k, l) 방향입니다. 원점에서 가장 가까운 면은 hx + ky + lz = a를 만족하므로, 원점까지의 거리가 d = a/√(h² + k² + l²)입니다(강의 10쪽). 지수가 클수록 면 사이가 좁고, 면 하나에 놓인 격자점의 밀도도 낮습니다. 절편 (½, ½, ½)은 (111)과 같은 면 집합입니다. Miller 지수는 면 하나가 아니라 평행한 면 전체의 이름이기 때문입니다."
          : "In a cubic lattice the normal of the (hkl) plane points along (h, k, l). The plane nearest the origin satisfies hx + ky + lz = a, so its distance from the origin is d = a/√(h² + k² + l²) (lecture page 10). Higher indices mean more closely spaced planes, each carrying fewer lattice points per area. Intercepts (½, ½, ½) give the same set as (111), because a Miller index names the whole family of parallel planes, not one plane."}
      </Note>
    </Card>
  );
}

// =============================================================
// 3) BRAGG'S LAW AND POWDER X-RAY DIFFRACTION
// =============================================================
const FCC4 = [[0, 0, 0], [0, 0.5, 0.5], [0.5, 0, 0.5], [0.5, 0.5, 0]];
const shiftB = (b, d) => b.map(p => p.map((v, i) => v + d[i]));
// crystals: conventional cubic cell, basis [Z, [x,y,z]]
const CRYSTALS = {
  Cu: { ko: "Cu (FCC)", en: "Cu (FCC)", a: 3.61, basis: FCC4.map(p => [29, p]) },
  Pt: { ko: "Pt (FCC)", en: "Pt (FCC)", a: 3.92, basis: FCC4.map(p => [78, p]) },
  Fe: { ko: "α-Fe (BCC)", en: "α-Fe (BCC)", a: 2.87, basis: [[26, [0, 0, 0]], [26, [0.5, 0.5, 0.5]]] },
  W: { ko: "W (BCC)", en: "W (BCC)", a: 3.16, basis: [[74, [0, 0, 0]], [74, [0.5, 0.5, 0.5]]] },
  Si: { ko: "Si (다이아몬드)", en: "Si (diamond)", a: 5.43, basis: [...FCC4, ...shiftB(FCC4, [0.25, 0.25, 0.25])].map(p => [14, p]) },
  NaCl: { ko: "NaCl (암염)", en: "NaCl (rock salt)", a: 5.63, basis: [...FCC4.map(p => [10, p]), ...shiftB(FCC4, [0.5, 0, 0]).map(p => [18, p])] },
  KCl: { ko: "KCl (암염)", en: "KCl (rock salt)", a: 6.29, basis: [...FCC4.map(p => [18, p]), ...shiftB(FCC4, [0.5, 0, 0]).map(p => [18, p])] },
  CsCl: { ko: "CsCl", en: "CsCl", a: 4.11, basis: [[54, [0, 0, 0]], [18, [0.5, 0.5, 0.5]]] },
};
// structure factor (complex) for a basis at reciprocal vector (h,k,l), form factor f = Z exp(-B s^2)
function structFactor(basis, h, k, l, s = 0, B = 2) {
  let re = 0, im = 0;
  const damp = Math.exp(-B * s * s);
  for (const [Z, [x, y, z]] of basis) {
    const ph = -2 * Math.PI * (h * x + k * y + l * z);
    re += Z * damp * Math.cos(ph); im += Z * damp * Math.sin(ph);
  }
  return [re, im];
}
// powder pattern: peaks grouped by N = h²+k²+l² (equal 2θ), with multiplicity and LP factor
function powderPattern(a, basis, lam, tthMax = 120) {
  const byN = new Map();
  const M = 8;
  for (let h = -M; h <= M; h++) for (let k = -M; k <= M; k++) for (let l = -M; l <= M; l++) {
    if (!h && !k && !l) continue;
    const N = h * h + k * k + l * l;
    const d = a / Math.sqrt(N), sn = lam / (2 * d);
    if (sn >= 1) continue;
    const th = Math.asin(sn);
    if (2 * th / DEG > tthMax) continue;
    const [re, im] = structFactor(basis, h, k, l, sn / lam);
    const S2 = re * re + im * im;
    if (S2 < 1e-8) continue;
    const lp = (1 + Math.cos(2 * th) ** 2) / (Math.sin(th) ** 2 * Math.cos(th));
    const key = [Math.abs(h), Math.abs(k), Math.abs(l)].sort((p, q) => q - p).join("");
    if (!byN.has(N)) byN.set(N, { N, tth: 2 * th / DEG, d, I: 0, mult: 0, labels: new Set(), S: Math.sqrt(S2) });
    const e = byN.get(N);
    e.I += S2 * lp; e.mult += 1; e.labels.add(key);
  }
  const arr = [...byN.values()].sort((p, q) => p.tth - q.tth);
  const Imax = Math.max(...arr.map(p => p.I), 1e-12);
  arr.forEach(p => { p.Irel = 100 * p.I / Imax; p.label = [...p.labels].sort().reverse().join("/"); });
  return arr;
}

function BraggTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <BraggDerivCard isKo={isKo} />
      <BraggLab isKo={isKo} />
      <BraggExampleCard isKo={isKo} />
      <PowderLab isKo={isKo} />
      <MysteryLab isKo={isKo} />
      <ScherrerCard isKo={isKo} />
    </div>
  );
}

function BraggDerivCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "Bragg 법칙: 평행한 원자면에서 반사된 X선의 경로차" : "Bragg's law: the path difference of X-rays reflected by parallel atomic planes"}</Hd>
      <Note>
        {isKo
          ? "X선의 파장(약 0.5–2.5 Å)은 원자 사이 거리와 비슷합니다. 그래서 결정은 X선에게 회절격자처럼 작용합니다. 원자는 X선을 탄성 산란합니다. 곧 반사된 X선의 에너지(파장)는 바뀌지 않습니다. 간격이 d인 평행한 원자면들을 생각하고, 면과 X선이 이루는 각(glancing angle)을 θ라고 합시다."
          : "X-ray wavelengths (about 0.5–2.5 Å) are comparable to interatomic distances, so a crystal acts as a diffraction grating for X-rays. Atoms scatter X-rays elastically: the reflected X-ray keeps its energy (wavelength). Consider parallel atomic planes a distance d apart, and let θ be the glancing angle between the beam and the planes."}
      </Note>
      <Eq>{isKo ? "아래 면에서 반사된 빛이 더 가는 길:" : "Extra path for the lower plane:"}  d sin θ + d sin θ = 2d sin θ</Eq>
      <Eq>{isKo ? "보강 간섭 조건:" : "Constructive interference:"}  2d sin θ = nλ,   n = 1, 2, 3, …</Eq>
      <Eq>{isKo ? "회절이 가능하려면" : "Diffraction requires"}  sin θ = nλ/2d ≤ 1   →   λ ≤ 2d</Eq>
      <Note>
        {isKo
          ? "검출기는 입사선에서 2θ 꺾인 방향에 놓이므로, 회절 그래프의 가로축은 보통 2θ입니다. n차 반사는 간격 d/n인 가상의 면에서 일어나는 1차 반사로 볼 수 있습니다. 그래서 흔히 n을 Miller 지수에 흡수해 2d_hkl sin θ = λ로 씁니다. 가시광선(약 5000 Å)은 원자 간격보다 훨씬 길어 λ ≤ 2d를 만족하지 못하므로 결정에서 회절하지 않습니다."
          : "The detector sits at 2θ from the incident beam, so diffraction patterns are usually plotted against 2θ. An nth-order reflection can be viewed as a first-order reflection from fictitious planes spaced d/n, so n is usually absorbed into the Miller indices: 2d_hkl sin θ = λ. Visible light (about 5000 Å) is far longer than interatomic distances, fails λ ≤ 2d, and does not diffract from crystals."}
      </Note>
    </Card>
  );
}

function BraggLab({ isKo }) {
  const [th, setTh] = useState(20);
  const [d, setD] = useState(3.0);
  const [lam, setLam] = useState(1.5406);
  const [Np, setNp] = useState(20);
  const pathDiff = 2 * d * Math.sin(th * DEG);
  const order = pathDiff / lam;
  const W = 640, Ht = 290;
  // geometry drawing
  const y0 = 90, gap = 46, x0 = 140, len = 330;
  const rayL = 140;
  const ux = Math.cos(th * DEG), uy = Math.sin(th * DEG);
  const P1 = [x0 + 160, y0], P2 = [x0 + 160 + gap / Math.tan(Math.max(th, 3) * DEG) * 0, y0 + gap];
  // intensity curve vs theta for N planes
  const W2 = 640, H2 = 240, pad = 46;
  const { X, Y } = plotScale(5, 85, 0, 1.05, W2, H2, pad);
  const curve = [];
  for (let i = 0; i <= 800; i++) {
    const t = 5 + 80 * i / 800;
    const phi = 2 * Math.PI * 2 * d * Math.sin(t * DEG) / lam;
    const num = Math.sin(Np * phi / 2), den = Math.sin(phi / 2);
    const I = Math.abs(den) < 1e-9 ? 1 : (num * num) / (den * den) / (Np * Np);
    curve.push([t, I]);
  }
  const peaks = [];
  for (let n = 1; n <= 8; n++) { const s = n * lam / (2 * d); if (s < 1) peaks.push([n, Math.asin(s) / DEG]); }
  return (
    <Card>
      <Hd>{isKo ? "실험실 ① 경로차와 보강 간섭, 그리고 면이 많을수록 날카로워지는 피크" : "Lab ① Path difference, constructive interference, and peaks that sharpen with more planes"}</Hd>
      <Row>
        <Slider label={isKo ? "입사각 θ" : "Glancing angle θ"} value={th} min={3} max={85} step={0.1} onChange={setTh} unit="°" fmt={v => v.toFixed(1)} />
        <Slider label={isKo ? "면간 거리 d" : "Spacing d"} value={d} min={1} max={5} step={0.01} onChange={setD} unit=" Å" fmt={v => v.toFixed(2)} />
        <Slider label={isKo ? "파장 λ" : "Wavelength λ"} value={lam} min={0.5} max={2.5} step={0.0001} onChange={setLam} unit=" Å" fmt={v => v.toFixed(4)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        {[0, 1, 2, 3].map(i => <g key={i}>
          <line x1={x0} x2={x0 + len} y1={y0 + i * gap} y2={y0 + i * gap} stroke="#475569" />
          {Array.from({ length: 12 }, (_, j) => <circle key={j} cx={x0 + 10 + j * 28} cy={y0 + i * gap} r={4} fill={C.sky} />)}
        </g>)}
        {[0, 1].map(i => {
          const px = P1[0], py = y0 + i * gap;
          return <g key={i}>
            <line x1={px - rayL * ux} y1={py - rayL * uy} x2={px} y2={py} stroke={C.accent} strokeWidth={2.4} />
            <line x1={px} y1={py} x2={px + rayL * ux} y2={py - rayL * uy} stroke={C.accent} strokeWidth={2.4} />
          </g>;
        })}
        <line x1={P1[0]} y1={y0} x2={P1[0]} y2={y0 + gap} stroke={C.amber} strokeDasharray="3 3" />
        <text x={P1[0] + 6} y={y0 + gap / 2 + 4} fill={C.amber} fontSize={12}>d</text>
        <text x={P1[0] - 70} y={y0 - 8} fill={C.accent} fontSize={12}>θ</text>
        <text x={20} y={Ht - 12} fill={C.text} fontSize={13}>{isKo ? "경로차" : "Path difference"} 2d sin θ = {pathDiff.toFixed(3)} Å = {order.toFixed(3)} λ</text>
      </svg>
      <StatGrid>
        <Stat label={isKo ? "경로차 / 파장" : "Path difference / wavelength"} value={order.toFixed(3)} color={Math.abs(order - Math.round(order)) < 0.02 && Math.round(order) > 0 ? C.ok : C.amber} />
        <Stat label={isKo ? "판정" : "Verdict"} value={Math.abs(order - Math.round(order)) < 0.02 && Math.round(order) > 0 ? (isKo ? `보강 간섭 (n = ${Math.round(order)})` : `constructive (n = ${Math.round(order)})`) : (isKo ? "상쇄 (거의 0)" : "cancels (nearly zero)")} color={Math.abs(order - Math.round(order)) < 0.02 && Math.round(order) > 0 ? C.ok : C.pink} />
        <Stat label={isKo ? "허용되는 반사 차수 (λ ≤ 2d/n)" : "Allowed orders (λ ≤ 2d/n)"} value={peaks.map(p => `n=${p[0]}: ${p[1].toFixed(1)}°`).join("  ") || (isKo ? "없음" : "none")} color={C.sky} />
      </StatGrid>
      <Row>
        <Slider label={isKo ? "참여하는 면의 수 N" : "Number of planes N"} value={Np} min={2} max={100} step={1} onChange={setNp} fmt={v => v.toFixed(0)} />
      </Row>
      <svg viewBox={`0 0 ${W2} ${H2}`} style={fullSvg(W2)}>
        <Axes W={W2} Ht={H2} pad={pad} xlabel={isKo ? "θ (도)" : "θ (degrees)"} ylabel={isKo ? "세기 / N²" : "intensity / N²"} />
        {[10, 30, 50, 70].map(v => <text key={v} x={X(v)} y={H2 - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        <path d={pathOf(curve, X, Y)} fill="none" stroke={C.accent} strokeWidth={1.8} />
        <line x1={X(th)} x2={X(th)} y1={Y(0)} y2={Y(1.05)} stroke="#fde047" strokeDasharray="4 3" />
      </svg>
      <Note>
        {isKo
          ? "면 N개에서 반사된 파동을 더하면 세기가 sin²(Nφ/2)/sin²(φ/2)에 비례합니다. 여기서 φ = 2π(2d sin θ)/λ는 이웃한 면 사이의 위상차입니다. 경로차가 파장의 정수배이면 N개가 모두 같은 위상이라 세기가 N²입니다. 조금만 벗어나도 위상이 엇갈려 거의 0이 됩니다. N을 키워 보면 피크 폭이 대략 1/N로 좁아집니다. 실제 결정에는 면이 수백만 개 있으므로 Bragg 조건에서만 날카로운 피크가 나타납니다. 거꾸로 피크가 넓으면 결정이 작다는 뜻입니다(아래 Scherrer 식)."
          : "Summing the waves from N planes gives an intensity proportional to sin²(Nφ/2)/sin²(φ/2), where φ = 2π(2d sin θ)/λ is the phase difference between neighbouring planes. When the path difference is a whole number of wavelengths all N waves are in phase and the intensity is N²; a small departure makes the phases spread and the sum nearly vanishes. Increase N and the peak width shrinks roughly as 1/N. A real crystal has millions of planes, so sharp peaks appear only at the Bragg condition; conversely, broad peaks mean small crystals (the Scherrer equation below)."}
      </Note>
    </Card>
  );
}

function BraggExampleCard({ isKo }) {
  const d111 = 154 / (2 * Math.sin(11.2 * DEG));
  return (
    <Card>
      <Hd>{isKo ? "예제 (강의 13쪽): {111} 반사로 격자 상수 구하기" : "Worked example (lecture page 13): lattice constant from a {111} reflection"}</Hd>
      <Note>
        {isKo
          ? "파장 154 pm인 X선을 입방 결정에 쪼였더니 {111} 면의 1차 반사가 2θ = 22.4°에서 나타났다. 격자 상수 a는?"
          : "With 154 pm X-rays, the first-order reflection from the {111} planes of a cubic crystal appears at 2θ = 22.4°. What is the lattice constant a?"}
      </Note>
      <Eq>{isKo ? "① 2θ = 22.4° 이므로 θ = 11.2°" : "① 2θ = 22.4°, so θ = 11.2°"}</Eq>
      <Eq>② d₁₁₁ = λ / (2 sin θ) = 154 pm / (2 × sin 11.2°) = {d111.toFixed(1)} pm</Eq>
      <Eq>③ d₁₁₁ = a/√(1² + 1² + 1²) = a/√3   →   a = √3 d₁₁₁ = {(Math.sqrt(3) * d111).toFixed(0)} pm = {(Math.sqrt(3) * d111 / 1000).toFixed(3)} nm</Eq>
      <Note>
        {isKo
          ? "자주 하는 실수는 측정된 2θ를 그대로 θ로 넣는 것입니다. 그러면 d = 202 pm으로 거의 절반이 됩니다. 검출기 각도 2θ와 Bragg 각 θ를 구분하는 습관이 중요합니다."
          : "A common mistake is to use the measured 2θ as θ, which gives d = 202 pm, almost half. Keep the detector angle 2θ and the Bragg angle θ apart."}
      </Note>
    </Card>
  );
}

function PowderLab({ isKo }) {
  const [key, setKey] = useState("Cu");
  const [lamKey, setLamKey] = useState("Cu");
  const [fwhm, setFwhm] = useState(0.25);
  const lam = lamKey === "Cu" ? LAMBDA_CU : 0.7107;
  const cr = CRYSTALS[key];
  const pk = useMemo(() => powderPattern(cr.a, cr.basis, lam, 120), [key, lam]);
  const W = 680, Ht = 300, pad = 46;
  const { X, Y } = plotScale(10, 120, 0, 115, W, Ht, pad);
  const sig = fwhm / 2.3548;
  const prof = [];
  for (let i = 0; i <= 1100; i++) {
    const t = 10 + 110 * i / 1100;
    let y = 0;
    for (const p of pk) { const u = (t - p.tth) / sig; if (Math.abs(u) < 8) y += p.Irel * Math.exp(-0.5 * u * u); }
    prof.push([t, Math.min(y, 115)]);
  }
  const s1 = pk.length ? Math.sin(pk[0].tth / 2 * DEG) ** 2 : 1;
  return (
    <Card>
      <Hd>{isKo ? "실험실 ② 분말 X선 회절 패턴 시뮬레이터" : "Lab ② Powder X-ray diffraction simulator"}</Hd>
      <Note>
        {isKo
          ? "분말 시료에는 아주 작은 결정들이 모든 방향으로 놓여 있습니다. 그래서 각 (hkl) 면 집합이 Bragg 조건을 만족하는 방향이 항상 있고, 2θ에 따라 피크가 줄지어 나타납니다. 피크 위치는 Bragg 법칙과 d = a/√(h² + k² + l²)로, 세기는 구조 인자 |S|², 같은 d를 갖는 면의 수(다중도), Lorentz–편광 인자로 정합니다. 원자 산란 인자는 교육용 근사 f = Z exp(−B s²), s = sin θ/λ, B = 2 Å²를 썼습니다."
          : "A powder holds tiny crystals in every orientation, so each (hkl) family always has some crystallites at the Bragg condition, and peaks line up along 2θ. Positions follow Bragg's law with d = a/√(h² + k² + l²); intensities come from the structure factor |S|², the multiplicity (planes sharing the same d) and the Lorentz–polarization factor. Atomic form factors use the teaching approximation f = Z exp(−B s²), s = sin θ/λ, B = 2 Å²."}
      </Note>
      <Row>
        {Object.entries(CRYSTALS).map(([k, v]) => <button key={k} style={btnStyle(key === k)} onClick={() => setKey(k)}>{isKo ? v.ko : v.en}</button>)}
      </Row>
      <Row>
        <button style={btnStyle(lamKey === "Cu")} onClick={() => setLamKey("Cu")}>Cu Kα₁ 1.5406 Å</button>
        <button style={btnStyle(lamKey === "Mo")} onClick={() => setLamKey("Mo")}>Mo Kα₁ 0.7107 Å</button>
        <Slider label={isKo ? "피크 폭 (FWHM)" : "Peak width (FWHM)"} value={fwhm} min={0.05} max={2} step={0.01} onChange={setFwhm} unit="°" fmt={v => v.toFixed(2)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel="2θ (°)" ylabel={isKo ? "상대 세기" : "relative intensity"} />
        {[20, 40, 60, 80, 100, 120].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        <path d={pathOf(prof, X, Y)} fill="none" stroke={C.accent} strokeWidth={1.6} />
        {pk.filter(p => p.Irel > 4).map(p => (
          <text key={p.N} x={X(p.tth)} y={Y(Math.min(p.Irel, 100)) - 6} fill={C.textDim} fontSize={10} textAnchor="middle">{p.label}</text>
        ))}
      </svg>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5, fontFamily: mono }}>
          <thead><tr style={{ color: C.textDim }}>
            {["hkl", "N", "2θ (°)", "d (Å)", isKo ? "다중도" : "mult.", "|S|", "I (%)", "sin²θ/sin²θ₁"].map(h => <th key={h} style={{ padding: "4px 8px", textAlign: "right" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {pk.slice(0, 9).map(p => (
              <tr key={p.N} style={{ borderTop: `1px solid ${C.border}` }}>
                <td style={{ padding: "4px 8px", textAlign: "right", color: C.accent }}>{p.label}</td>
                <td style={{ padding: "4px 8px", textAlign: "right" }}>{p.N}</td>
                <td style={{ padding: "4px 8px", textAlign: "right" }}>{p.tth.toFixed(2)}</td>
                <td style={{ padding: "4px 8px", textAlign: "right" }}>{p.d.toFixed(4)}</td>
                <td style={{ padding: "4px 8px", textAlign: "right" }}>{p.mult}</td>
                <td style={{ padding: "4px 8px", textAlign: "right" }}>{p.S.toFixed(1)}</td>
                <td style={{ padding: "4px 8px", textAlign: "right" }}>{p.Irel.toFixed(1)}</td>
                <td style={{ padding: "4px 8px", textAlign: "right", color: C.sky }}>{(Math.sin(p.tth / 2 * DEG) ** 2 / s1).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note>
        {isKo
          ? "격자 상수는 C. Kittel, Introduction to Solid State Physics 8판의 표 값(Cu 3.61, Pt 3.92, α-Fe 2.87, W 3.16, Si 5.43, NaCl 5.63, KCl 6.29, CsCl 4.11 Å)을 썼습니다. 계산값은 Cu (111) 43.4°, α-Fe (110) 44.6°, Si (111) 28.4°입니다. NaCl과 KCl을 번갈아 눌러 보십시오. KCl에서는 (111), (311) 같은 홀수 지수 피크가 사라집니다(구조 인자 탭). Mo Kα로 바꾸면 파장이 짧아 모든 피크가 낮은 각도로 몰립니다."
          : "Lattice constants are the table values of C. Kittel, Introduction to Solid State Physics, 8th ed. (Cu 3.61, Pt 3.92, α-Fe 2.87, W 3.16, Si 5.43, NaCl 5.63, KCl 6.29, CsCl 4.11 Å). Computed positions: Cu (111) 43.4°, α-Fe (110) 44.6°, Si (111) 28.4°. Toggle between NaCl and KCl: in KCl the all-odd peaks such as (111) and (311) disappear (Structure Factor tab). Switching to Mo Kα, with its shorter wavelength, crowds every peak to lower angles."}
      </Note>
    </Card>
  );
}

const MYSTERY_SET = [
  { type: "SC", a: 3.36 }, { type: "BCC", a: 3.30 }, { type: "FCC", a: 4.05 }, { type: "BCC", a: 4.29 },
  { type: "FCC", a: 4.08 }, { type: "SC", a: 2.95 }, { type: "FCC", a: 3.52 }, { type: "BCC", a: 5.02 },
];
function MysteryLab({ isKo }) {
  const [idx, setIdx] = useState(0);
  const [guess, setGuess] = useState(null);
  const m = MYSTERY_SET[idx % MYSTERY_SET.length];
  const basis = { SC: [[20, [0, 0, 0]]], BCC: [[20, [0, 0, 0]], [20, [0.5, 0.5, 0.5]]], FCC: FCC4.map(p => [20, p]) }[m.type];
  const pk = powderPattern(m.a, basis, LAMBDA_CU, 165).slice(0, 8);
  const s1 = Math.sin(pk[0].tth / 2 * DEG) ** 2;
  const ratios = pk.map(p => Math.sin(p.tth / 2 * DEG) ** 2 / s1);
  const firstN = { SC: 1, BCC: 2, FCC: 3 }[m.type];
  return (
    <Card>
      <Hd>{isKo ? "실험실 ③ 미지 시료의 격자 맞히기: sin²θ 비로 지수 붙이기" : "Lab ③ Identify the lattice of an unknown: indexing by sin²θ ratios"}</Hd>
      <Note>
        {isKo
          ? "입방 결정에서는 sin²θ = (λ²/4a²)(h² + k² + l²)입니다. 따라서 피크들의 sin²θ를 첫 피크로 나눈 비는 허용된 N = h² + k² + l² 값들의 비와 같습니다. SC는 N = 1, 2, 3, 4, 5, 6, 8, …(7은 정수 세 개의 제곱합으로 만들 수 없음), BCC는 짝수 N = 2, 4, 6, 8, …, FCC는 N = 3, 4, 8, 11, 12, …입니다. 주의할 점이 있습니다. SC와 BCC는 처음 여섯 피크의 비가 1, 2, 3, 4, 5, 6으로 똑같습니다. 둘을 가르는 것은 일곱 번째 피크입니다. BCC는 7(N = 14)이 나오지만, SC는 7을 건너뛰고 8(N = 8)로 갑니다. 아래 미지 시료의 비를 보고 격자를 고르십시오."
          : "For a cubic crystal sin²θ = (λ²/4a²)(h² + k² + l²), so the ratios of sin²θ to the first peak equal the ratios of the allowed N = h² + k² + l². SC allows N = 1, 2, 3, 4, 5, 6, 8, … (7 is not a sum of three squares), BCC the even N = 2, 4, 6, 8, …, and FCC N = 3, 4, 8, 11, 12, …. Beware: SC and BCC share the same first six ratios, 1, 2, 3, 4, 5, 6. The seventh peak decides: BCC gives 7 (N = 14), while SC skips 7 and jumps to 8 (N = 8). Read the ratios of the unknown below and choose the lattice."}
      </Note>
      <StatGrid min={120}>
        {pk.map((p, i) => <Stat key={i} label={`${isKo ? "피크" : "peak"} ${i + 1}: 2θ = ${p.tth.toFixed(2)}°`} value={`${isKo ? "비" : "ratio"} ${ratios[i].toFixed(3)}`} color={C.sky} />)}
      </StatGrid>
      <Row>
        {["SC", "BCC", "FCC"].map(t => <button key={t} style={btnStyle(guess === t)} onClick={() => setGuess(t)}>{t}</button>)}
        <button style={btnStyle()} onClick={() => { setIdx(i => i + 1); setGuess(null); }}>{isKo ? "다음 시료" : "Next sample"}</button>
      </Row>
      {guess && (
        <Note>
          {guess === m.type
            ? (isKo ? `정답입니다. ${m.type}이고, 첫 피크의 N = ${firstN}이므로 a = λ√${firstN}/(2 sin θ₁) = ${(LAMBDA_CU * Math.sqrt(firstN) / (2 * Math.sin(pk[0].tth / 2 * DEG))).toFixed(3)} Å입니다.`
                    : `Correct: ${m.type}. The first peak has N = ${firstN}, so a = λ√${firstN}/(2 sin θ₁) = ${(LAMBDA_CU * Math.sqrt(firstN) / (2 * Math.sin(pk[0].tth / 2 * DEG))).toFixed(3)} Å.`)
            : (isKo ? `다시 보십시오. 비에 3배를 하면 정수(3, 4, 8, 11…)가 되는지 보십시오. 그렇지 않다면 일곱 번째 비가 7인지(BCC), 8인지(SC) 확인해 보십시오.`
                    : "Look again: check whether multiplying the ratios by 3 gives integers (3, 4, 8, 11, …); if not, see whether the seventh ratio is 7 (BCC) or 8 (SC).")}
        </Note>
      )}
    </Card>
  );
}

function ScherrerCard({ isKo }) {
  const [fw, setFw] = useState(1.0);
  const tth = powderPattern(3.92, CRYSTALS.Pt.basis, LAMBDA_CU, 60)[0].tth;
  const tau = 0.9 * LAMBDA_CU / (fw * DEG * Math.cos(tth / 2 * DEG)) / 10;
  return (
    <Card>
      <Hd>{isKo ? "화학공학 사례: 촉매 나노입자의 크기를 XRD로 재기 (Scherrer 식)" : "Chemical-engineering case: sizing catalyst nanoparticles by XRD (the Scherrer equation)"}</Hd>
      <Note>
        {isKo
          ? "실험실 ①에서 보았듯이 피크 폭은 참여하는 면의 수에 반비례합니다. 결정 크기가 τ이면 면의 수가 τ/d개뿐이므로 피크가 넓어집니다. 이를 정리한 것이 Scherrer 식입니다. β는 라디안으로 잰 피크의 반치폭(FWHM), K ≈ 0.9는 모양 인자입니다."
          : "As Lab ① showed, the peak width is inversely proportional to the number of planes. A crystallite of size τ has only τ/d planes, so its peaks broaden. The Scherrer equation expresses this, with β the full width at half maximum (FWHM) in radians and K ≈ 0.9 a shape factor."}
      </Note>
      <Eq>τ = K λ / (β cos θ)</Eq>
      <Row><Slider label={isKo ? "Pt (111) 피크의 FWHM" : "FWHM of the Pt (111) peak"} value={fw} min={0.1} max={4} step={0.05} onChange={setFw} unit="°" fmt={v => v.toFixed(2)} /></Row>
      <StatGrid>
        <Stat label={isKo ? "Pt (111) 위치 (Cu Kα₁)" : "Pt (111) position (Cu Kα₁)"} value={`2θ = ${tth.toFixed(2)}°`} color={C.sky} />
        <Stat label={isKo ? "결정 크기 τ" : "Crystallite size τ"} value={`${tau.toFixed(1)} nm`} color={C.accent} />
      </StatGrid>
      <Note>
        {isKo
          ? "연료 전지와 수소화 공정의 Pt 촉매는 지름 2–5 nm 입자로 만들어 표면적을 키웁니다. 이런 입자는 피크 폭이 2° 안팎으로 넓습니다. 운전 중 입자가 뭉치면(소결) 피크가 날카로워지므로, XRD 피크 폭은 촉매 열화를 추적하는 간단한 지표가 됩니다. 단, 장비 자체의 폭과 결정 내부 변형(strain)도 피크를 넓히므로, 정밀한 분석에서는 이를 빼야 합니다. 출처: P. Scherrer, Nachr. Ges. Wiss. Göttingen, Math.-Phys. Kl. 1918, 98; A. L. Patterson, Phys. Rev. 56, 978 (1939)."
          : "Pt catalysts for fuel cells and hydrogenation are made as 2–5 nm particles to maximize surface area, and such particles give peaks about 2° wide. When particles coarsen (sinter) during operation the peaks sharpen, so the XRD peak width is a simple marker of catalyst degradation. Instrumental broadening and lattice strain also widen peaks and must be removed in careful work. Sources: P. Scherrer, Nachr. Ges. Wiss. Göttingen, Math.-Phys. Kl. 1918, 98; A. L. Patterson, Phys. Rev. 56, 978 (1939)."}
      </Note>
    </Card>
  );
}

// =============================================================
// 4) FOURIER ANALYSIS, RECIPROCAL LATTICE, LAUE CONDITION, EWALD
// =============================================================
function RecipTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <FourierDerivCard isKo={isKo} />
      <Fourier1DLab isKo={isKo} />
      <Recip2DLab isKo={isKo} />
      <LaueDerivCard isKo={isKo} />
      <EwaldLab isKo={isKo} />
    </div>
  );
}

function FourierDerivCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "주기 함수는 Fourier 급수로 쓴다: 역격자가 나오는 곳" : "A periodic function is a Fourier series: where the reciprocal lattice comes from"}</Hd>
      <Note>
        {isKo
          ? "X선을 산란하는 것은 원자 속의 전자입니다. 따라서 회절 세기를 계산하려면 결정 속 전자 밀도 n(r)이 필요합니다. 결정에서는 n(r)이 주기 함수입니다. 주기 함수를 다루는 가장 좋은 도구가 Fourier 급수입니다. 먼저 주기가 a인 1차원 결정에서 시작합니다."
          : "X-rays are scattered by the electrons in atoms, so the diffracted intensity requires the electron density n(r) of the crystal. In a crystal n(r) is periodic, and the natural tool for periodic functions is the Fourier series. Start with a 1D crystal of period a."}
      </Note>
      <Eq>n(x) = n₀ + Σ_(p≥1) [C_p cos(2πpx/a) + S_p sin(2πpx/a)] = Σ_p n_p exp(i2πpx/a)</Eq>
      <Eq>n(x + a) = Σ_p n_p exp(i2πpx/a) exp(i2πp) = n(x)      {isKo ? "(p가 정수이므로 exp(i2πp) = 1)" : "(p integer, so exp(i2πp) = 1)"}</Eq>
      <Eq>n_p = (1/a) ∫₀^a n(x) exp(−i2πpx/a) dx      {isKo ? "(역 Fourier: 직교성 ∫ e^(i2π(p−p′)x/a) dx = aδ_pp′)" : "(inverse: orthogonality ∫ e^(i2π(p−p′)x/a) dx = aδ_pp′)"}</Eq>
      <Note>
        {isKo
          ? "2πp/a라는 점들이 1차원 역격자입니다. 주기 a인 함수가 가질 수 있는 '파수'는 이 값들뿐입니다. 3차원으로 가면 exp(iG·r)이 모든 병진 T에 대해 불변이어야 하므로 G·T = 2π × 정수여야 합니다. 이 조건을 만족하는 G를 만드는 기본 벡터 b₁, b₂, b₃는 다음과 같습니다(강의 15쪽)."
          : "The points 2πp/a form the 1D reciprocal lattice: the only wavenumbers a function of period a can contain. In 3D, exp(iG·r) must be invariant under every translation T, so G·T must be 2π times an integer. The primitive vectors b₁, b₂, b₃ that build such G are (lecture page 15):"}
      </Note>
      <Eq style={{ color: C.accent }}>b₁ = 2π (a₂ × a₃)/(a₁·a₂ × a₃),  b₂ = 2π (a₃ × a₁)/(a₁·a₂ × a₃),  b₃ = 2π (a₁ × a₂)/(a₁·a₂ × a₃)</Eq>
      <Eq>b_i · a_j = 2π δ_ij   →   G·T = (v₁b₁ + v₂b₂ + v₃b₃)·(u₁a₁ + u₂a₂ + u₃a₃) = 2π(v₁u₁ + v₂u₂ + v₃u₃)</Eq>
      <Eq>n(r) = Σ_G n_G exp(iG·r),   n(r + T) = Σ_G n_G exp(iG·r) exp(iG·T) = n(r)</Eq>
      <Note>
        {isKo
          ? "b₁은 a₂와 a₃에 수직이고, 길이는 대략 2π/a입니다. 실공간 격자가 촘촘할수록 역격자는 성깁니다. 역격자 벡터 G_hkl = hb₁ + kb₂ + lb₃은 (hkl) 면에 수직이고, 길이가 |G_hkl| = 2π/d_hkl입니다. 곧 역격자의 점 하나가 실공간의 면 집합 하나를 나타냅니다."
          : "b₁ is perpendicular to a₂ and a₃ and has length of order 2π/a: the finer the real lattice, the coarser the reciprocal one. The reciprocal vector G_hkl = hb₁ + kb₂ + lb₃ is perpendicular to the (hkl) planes with length |G_hkl| = 2π/d_hkl, so each reciprocal-lattice point stands for one family of real-space planes."}
      </Note>
    </Card>
  );
}

function Fourier1DLab({ isKo }) {
  const [sig, setSig] = useState(0.08);
  const [P, setP] = useState(3);
  const [x2, setX2] = useState(0.5);
  const [w2, setW2] = useState(0);
  // basis: atom 1 (weight 1) at x=0, atom 2 (weight w2) at x2; Gaussian width sig (units of a)
  const coef = p => {
    const g = Math.exp(-((2 * Math.PI * p * sig) ** 2) / 2);
    const re = g * (1 + w2 * Math.cos(2 * Math.PI * p * x2));
    const im = -g * w2 * Math.sin(2 * Math.PI * p * x2);
    return [re, im];
  };
  const nTrue = x => {
    let s = 0;
    for (let m = -2; m <= 3; m++) {
      s += Math.exp(-((x - m) ** 2) / (2 * sig * sig));
      s += w2 * Math.exp(-((x - x2 - m) ** 2) / (2 * sig * sig));
    }
    return s / (Math.sqrt(2 * Math.PI) * sig);
  };
  const nRec = x => {
    let s = coef(0)[0];
    for (let p = 1; p <= P; p++) { const [re, im] = coef(p); s += 2 * (re * Math.cos(2 * Math.PI * p * x) - im * Math.sin(2 * Math.PI * p * x)); }
    return s;
  };
  const W = 640, Ht = 240, pad = 44;
  const yMax = Math.max(...Array.from({ length: 300 }, (_, i) => nTrue(-0.5 + 3 * i / 300))) * 1.1;
  const { X, Y } = plotScale(-0.5, 2.5, -0.3 * yMax / 3, yMax, W, Ht, pad);
  const tr = [], rc = [];
  for (let i = 0; i <= 600; i++) { const x = -0.5 + 3 * i / 600; tr.push([x, nTrue(x)]); rc.push([x, nRec(x)]); }
  const W2 = 640, H2 = 200;
  const { X: X2, Y: Y2 } = plotScale(-8.5, 8.5, 0, 2.1, W2, H2, pad);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ① 1차원 전자 밀도의 Fourier 분해" : "Lab ① Fourier decomposition of a 1D electron density"}</Hd>
      <Row>
        <Slider label={isKo ? "원자 폭 σ" : "Atom width σ"} value={sig} min={0.03} max={0.2} step={0.005} onChange={setSig} unit=" a" fmt={v => v.toFixed(3)} />
        <Slider label={isKo ? "더한 항의 수 P" : "Terms kept P"} value={P} min={0} max={12} step={1} onChange={setP} fmt={v => v.toFixed(0)} />
      </Row>
      <Row>
        <Slider label={isKo ? "두 번째 원자 위치 x₂" : "Second atom at x₂"} value={x2} min={0.1} max={0.9} step={0.01} onChange={setX2} unit=" a" fmt={v => v.toFixed(2)} />
        <Slider label={isKo ? "두 번째 원자 세기 (0 = 없음)" : "Second atom weight (0 = none)"} value={w2} min={0} max={1} step={0.05} onChange={setW2} fmt={v => v.toFixed(2)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel="x / a" ylabel="n(x)" />
        {[0, 1, 2].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        <path d={pathOf(tr, X, Y)} fill="none" stroke="#64748b" strokeWidth={4} opacity={0.6} />
        <path d={pathOf(rc, X, Y)} fill="none" stroke={C.accent} strokeWidth={2} />
        <text x={W - pad} y={pad} fill={C.accent} fontSize={12} textAnchor="end">{isKo ? `p ≤ ${P}까지 더한 급수` : `series up to p = ${P}`}</text>
      </svg>
      <svg viewBox={`0 0 ${W2} ${H2}`} style={fullSvg(W2)}>
        <Axes W={W2} Ht={H2} pad={pad} xlabel={isKo ? "G = 2πp/a  (p)" : "G = 2πp/a  (p)"} ylabel="|n_p|" />
        {Array.from({ length: 17 }, (_, i) => i - 8).map(p => {
          const [re, im] = coef(Math.abs(p)); const mag = Math.hypot(re, p < 0 ? -im : im);
          return <g key={p}>
            <line x1={X2(p)} x2={X2(p)} y1={Y2(0)} y2={Y2(mag)} stroke={Math.abs(p) <= P ? C.accent : "#475569"} strokeWidth={5} />
            <text x={X2(p)} y={H2 - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{p}</text>
          </g>;
        })}
      </svg>
      <Note>
        {isKo
          ? "가우스 모양 원자 하나의 계수는 n_p = exp(−(2πpσ)²/2)입니다(코드에서 수치 적분과 소수 다섯째 자리까지 일치). 원자가 날카로울수록(σ 작음) 높은 p까지 계수가 남아, 많은 항이 있어야 모양이 재현됩니다. 이것이 X선 산란 인자가 각도가 커질수록 줄어드는 이유입니다. 두 번째 원자를 x₂ = 0.5a에 같은 세기로 두면 홀수 p의 계수가 정확히 0이 됩니다. 주기가 사실상 a/2로 줄었기 때문이며, 섹션 '구조 인자'의 소멸 규칙과 같은 원리입니다."
          : "For a Gaussian atom the coefficient is n_p = exp(−(2πpσ)²/2) (the code matches numerical integration to five decimals). Sharper atoms (small σ) keep large coefficients up to high p, so more terms are needed to rebuild the shape; this is why X-ray form factors fall off with angle. Put an equal second atom at x₂ = 0.5a and every odd-p coefficient vanishes exactly: the period has effectively become a/2. It is the same principle as the extinction rules in the Structure Factor tab."}
      </Note>
    </Card>
  );
}

function Recip2DLab({ isKo }) {
  const [b, setB] = useState(1.0);
  const [g, setG] = useState(90);
  const [hk, setHk] = useState([1, 1]);
  const a1 = [1, 0], a2 = [b * Math.cos(g * DEG), b * Math.sin(g * DEG)];
  const A = a1[0] * a2[1] - a1[1] * a2[0];
  // 2D reciprocal: b1 = 2π (a2⊥)/A, with a2⊥ = (a2y, -a2x); b2 = 2π(-a1y, a1x)/A
  const b1 = [2 * Math.PI * a2[1] / A, -2 * Math.PI * a2[0] / A];
  const b2 = [-2 * Math.PI * a1[1] / A, 2 * Math.PI * a1[0] / A];
  const dot = (u, v) => u[0] * v[0] + u[1] * v[1];
  const G = [hk[0] * b1[0] + hk[1] * b2[0], hk[0] * b1[1] + hk[1] * b2[1]];
  const dhk = 2 * Math.PI / Math.hypot(...G);
  const W = 320, Ht = 320;
  const s1 = 50, s2 = 50 / (2 * Math.PI) * 1.0;
  const realPts = [], recPts = [];
  for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) {
    const r = [i * a1[0] + j * a2[0], i * a1[1] + j * a2[1]];
    if (Math.abs(r[0]) < 3 && Math.abs(r[1]) < 3) realPts.push([i, j, r]);
    const q = [i * b1[0] + j * b2[0], i * b1[1] + j * b2[1]];
    if (Math.abs(q[0]) < 3 * 2 * Math.PI && Math.abs(q[1]) < 3 * 2 * Math.PI) recPts.push([i, j, q]);
  }
  // planes (hk) in real space: lines with G·r = 2π m
  const lines = [];
  const Gn = Math.hypot(...G);
  if (Gn > 0) for (let m = -6; m <= 6; m++) {
    const c = 2 * Math.PI * m / (Gn * Gn);
    const p0 = [G[0] * c, G[1] * c], t = [-G[1] / Gn, G[0] / Gn];
    lines.push([[p0[0] - 5 * t[0], p0[1] - 5 * t[1]], [p0[0] + 5 * t[0], p0[1] + 5 * t[1]]]);
  }
  const R = ([x, y]) => [W / 2 + s1 * x, Ht / 2 - s1 * y];
  const Q = ([x, y]) => [W / 2 + s2 * x, Ht / 2 - s2 * y];
  return (
    <Card>
      <Hd>{isKo ? "실험실 ② 실공간 격자와 역격자를 나란히" : "Lab ② Real and reciprocal lattices side by side"}</Hd>
      <Row>
        <Slider label="|a₂| / |a₁|" value={b} min={0.5} max={1.6} step={0.01} onChange={setB} fmt={v => v.toFixed(2)} />
        <Slider label={isKo ? "사잇각 γ" : "Angle γ"} value={g} min={50} max={130} step={1} onChange={setG} unit="°" fmt={v => v.toFixed(0)} />
        <Slider label="h" value={hk[0]} min={-2} max={2} step={1} onChange={v => setHk([v, hk[1]])} fmt={v => v.toFixed(0)} />
        <Slider label="k" value={hk[1]} min={-2} max={2} step={1} onChange={v => setHk([hk[0], v])} fmt={v => v.toFixed(0)} />
      </Row>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <svg viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <clipPath id="clipR"><rect x={0} y={0} width={W} height={Ht} /></clipPath>
          <g clipPath="url(#clipR)">
            {lines.map(([p, q], i) => { const P1 = R(p), P2 = R(q); return <line key={i} x1={P1[0]} y1={P1[1]} x2={P2[0]} y2={P2[1]} stroke={`${C.amber}88`} />; })}
          </g>
          {realPts.map(([i, j, r]) => { const [x, y] = R(r); return <circle key={`${i},${j}`} cx={x} cy={y} r={4} fill={C.sky} />; })}
          {[a1, a2].map((v, i) => { const P0 = R([0, 0]), P1 = R(v); return <line key={i} x1={P0[0]} y1={P0[1]} x2={P1[0]} y2={P1[1]} stroke={[C.pink, C.lime][i]} strokeWidth={3} />; })}
          <text x={10} y={18} fill={C.textDim} fontSize={12}>{isKo ? "실공간: a₁, a₂와 (hk) 면" : "Real space: a₁, a₂ and (hk) planes"}</text>
        </svg>
        <svg viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          {recPts.map(([i, j, q]) => { const [x, y] = Q(q); return <circle key={`${i},${j}`} cx={x} cy={y} r={i === hk[0] && j === hk[1] ? 7 : 4} fill={i === hk[0] && j === hk[1] ? C.amber : C.accent} />; })}
          {[b1, b2].map((v, i) => { const P0 = Q([0, 0]), P1 = Q(v); return <line key={i} x1={P0[0]} y1={P0[1]} x2={P1[0]} y2={P1[1]} stroke={[C.pink, C.lime][i]} strokeWidth={3} />; })}
          {Gn > 0 && (() => { const P0 = Q([0, 0]), P1 = Q(G); return <line x1={P0[0]} y1={P0[1]} x2={P1[0]} y2={P1[1]} stroke={C.amber} strokeWidth={2} strokeDasharray="5 3" />; })()}
          <text x={10} y={18} fill={C.textDim} fontSize={12}>{isKo ? "역공간: b₁, b₂와 G_hk" : "Reciprocal space: b₁, b₂ and G_hk"}</text>
        </svg>
      </div>
      <StatGrid>
        <Stat label="b₁·a₁/2π,  b₁·a₂/2π" value={`${(dot(b1, a1) / (2 * Math.PI)).toFixed(3)},  ${(dot(b1, a2) / (2 * Math.PI)).toFixed(3)}`} color={C.pink} />
        <Stat label="b₂·a₁/2π,  b₂·a₂/2π" value={`${(dot(b2, a1) / (2 * Math.PI)).toFixed(3)},  ${(dot(b2, a2) / (2 * Math.PI)).toFixed(3)}`} color={C.lime} />
        <Stat label={isKo ? "(hk) 면간 거리 2π/|G_hk|" : "(hk) spacing 2π/|G_hk|"} value={Gn > 0 ? `${dhk.toFixed(4)} a` : "—"} color={C.amber} />
      </StatGrid>
      <Note>
        {isKo
          ? "γ = 90°에서 |a₂|를 줄여 보십시오. 실공간에서 a₂ 방향이 촘촘해지면 역격자에서는 b₂ 방향이 성겨집니다. γ를 바꾸면 b₁은 항상 a₂에 수직, b₂는 a₁에 수직으로 따라 돕니다. 노란 선(면)은 언제나 노란 G에 수직이고, 면 사이 거리는 2π/|G|입니다. 이 관계 덕분에 '면에서의 반사'(Bragg)와 '역격자 벡터만큼의 산란'(Laue)이 같은 이야기가 됩니다."
          : "At γ = 90°, shrink |a₂|: as the real lattice tightens along a₂, the reciprocal lattice spreads along b₂. Change γ and b₁ stays perpendicular to a₂, b₂ to a₁. The yellow planes are always perpendicular to the yellow G and spaced 2π/|G|. This is why 'reflection from planes' (Bragg) and 'scattering by a reciprocal-lattice vector' (Laue) are the same story."}
      </Note>
    </Card>
  );
}

function LaueDerivCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "Laue 조건 Δk = G를 유도하고 Bragg 법칙으로 돌아가기" : "Deriving the Laue condition Δk = G and recovering Bragg's law"}</Hd>
      <Note>
        {isKo
          ? "입사 X선의 파동 벡터를 k, 산란된 X선을 k′라 합시다. 탄성 산란이므로 크기는 같습니다(|k| = |k′| = 2π/λ). 위치 r의 부피 요소 dV에서 산란된 파동은 위상 인자 exp(i(k − k′)·r)를 갖고, 세기는 그곳의 전자 밀도에 비례합니다. 모두 더한 산란 진폭은 다음과 같습니다(강의 16–17쪽)."
          : "Let k be the incident wave vector and k′ the scattered one. Scattering is elastic, so |k| = |k′| = 2π/λ. The wave scattered by a volume element dV at r carries the phase factor exp(i(k − k′)·r) and is weighted by the local electron density. The total scattering amplitude is (lecture pages 16–17):"}
      </Note>
      <Eq>F = ∫ n(r) exp(−iΔk·r) dV,   Δk ≡ k′ − k</Eq>
      <Eq>F = Σ_G n_G ∫ exp(i(G − Δk)·r) dV = V n_G  (Δk = G),   ≈ 0  (Δk ≠ G)</Eq>
      <Eq style={{ color: C.accent }}>{isKo ? "회절 조건 (Laue):" : "Diffraction condition (Laue):"}  Δk = G</Eq>
      <Eq>k′ = k + G,  |k′|² = |k|²   →   2k·G + G² = 0   →   2k·G = G²  {isKo ? "(G → −G로 바꿔도 역격자 벡터)" : "(−G is also a reciprocal vector)"}</Eq>
      <Eq>2kG sin θ = G²   →   2 (2π/λ) sin θ = 2π/d_hkl   →   2d_hkl sin θ = λ</Eq>
      <Note>
        {isKo
          ? "두 번째 줄에서 exp(i(G − Δk)·r)를 결정 전체에 대해 적분하면, G = Δk일 때만 모든 위상이 같아 부피 V만큼 쌓이고 나머지는 상쇄됩니다. 마지막 줄에서 k와 G 사이의 각은 90° − θ이므로 k·G = kG sin θ이고, |G| = 2π/d를 썼습니다. 결국 Laue 조건은 Bragg 법칙과 같은 내용입니다. 그러나 역격자 언어로 쓰면 세기(n_G, 곧 구조 인자)까지 한 번에 다룰 수 있다는 장점이 있습니다."
          : "In the second line, integrating exp(i(G − Δk)·r) over the crystal gives the full volume V only when G = Δk, where all phases agree; otherwise it cancels. In the last line the angle between k and G is 90° − θ, so k·G = kG sin θ, and |G| = 2π/d. The Laue condition therefore says the same as Bragg's law, but in reciprocal-lattice language it also carries the intensity (n_G, i.e. the structure factor)."}
      </Note>
    </Card>
  );
}

function EwaldLab({ isKo }) {
  const [phi, setPhi] = useState(14.1);
  const [lam, setLam] = useState(1.5406);
  const a = 3.0;   // square lattice constant (Å)
  const bstar = 2 * Math.PI / a;
  const k = 2 * Math.PI / lam;
  // incident k direction at angle phi (crystal rotated equivalently); k ends at origin
  const kv = [k * Math.cos(phi * DEG), k * Math.sin(phi * DEG)];
  const center = [-kv[0], -kv[1]];
  const W = 640, Ht = 440;
  const span = Math.max(2.2 * k, 6 * bstar);
  const sc = (Math.min(W, Ht) - 40) / span;
  const O = [W * 0.62, Ht * 0.55];
  const P = ([x, y]) => [O[0] + sc * x, O[1] - sc * y];
  const pts = [], hits = [];
  const M = Math.ceil(span / bstar) + 2;
  const tol = 0.012 * k;
  for (let h = -M; h <= M; h++) for (let l = -M; l <= M; l++) {
    const G = [h * bstar, l * bstar];
    const [X, Y] = P(G);
    if (X < 0 || X > W || Y < 0 || Y > Ht) continue;
    const dist = Math.hypot(G[0] - center[0], G[1] - center[1]);
    const on = !(h === 0 && l === 0) && Math.abs(dist - k) < tol;
    pts.push([h, l, X, Y, on]);
    if (on) {
      const Gn = Math.hypot(...G);
      hits.push({ h, l, tth: 2 * Math.asin(Math.min(1, Gn / (2 * k))) / DEG });
    }
  }
  const C0 = P(center), Oo = P([0, 0]);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ③ Ewald 작도: 구면 위에 놓인 역격자점만 회절한다" : "Lab ③ The Ewald construction: only reciprocal points on the sphere diffract"}</Hd>
      <Note>
        {isKo
          ? "Laue 조건을 그림으로 푸는 방법입니다(강의 18쪽). (1) 역격자를 그립니다. (2) 입사 파동 벡터 k를, 끝이 역격자 원점에 오도록 그립니다. (3) k의 시작점을 중심으로 반지름 k = 2π/λ인 구(2D에서는 원)를 그립니다. (4) 이 구 위에 다른 역격자점 G가 놓이면, 중심에서 그 점을 향하는 방향 k′ = k + G로 회절선이 나옵니다. 아래는 a = 3 Å인 정사각 격자입니다. 결정을 돌리거나 파장을 바꿔 원 위에 점이 걸리게 해 보십시오."
          : "A graphical way to solve the Laue condition (lecture page 18). (1) Draw the reciprocal lattice. (2) Draw the incident wave vector k ending at the reciprocal origin. (3) Draw a sphere (a circle in 2D) of radius k = 2π/λ centred at the start of k. (4) Any other reciprocal point G on the sphere gives a diffracted beam along k′ = k + G, from the centre to that point. Below is a square lattice with a = 3 Å; rotate the crystal or change the wavelength until a point lands on the circle."}
      </Note>
      <Row>
        <Slider label={isKo ? "결정 회전 (입사 방향)" : "Crystal rotation (beam direction)"} value={phi} min={0} max={90} step={0.1} onChange={setPhi} unit="°" fmt={v => v.toFixed(1)} />
        <Slider label={isKo ? "파장 λ" : "Wavelength λ"} value={lam} min={0.6} max={3} step={0.001} onChange={setLam} unit=" Å" fmt={v => v.toFixed(3)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <circle cx={C0[0]} cy={C0[1]} r={sc * k} fill="none" stroke={C.sky} strokeWidth={1.6} />
        {pts.map(([h, l, X, Y, on]) => <circle key={`${h},${l}`} cx={X} cy={Y} r={on ? 7 : (h === 0 && l === 0 ? 6 : 3)} fill={on ? "#fde047" : (h === 0 && l === 0 ? C.ok : C.accent)} />)}
        <line x1={C0[0]} y1={C0[1]} x2={Oo[0]} y2={Oo[1]} stroke={C.ok} strokeWidth={2.5} markerEnd="url(#arrE)" />
        {hits.map((hh, i) => { const T = P([hh.h * bstar, hh.l * bstar]); return <g key={i}>
          <line x1={C0[0]} y1={C0[1]} x2={T[0]} y2={T[1]} stroke="#fde047" strokeWidth={2} markerEnd="url(#arrE)" />
          <line x1={Oo[0]} y1={Oo[1]} x2={T[0]} y2={T[1]} stroke={C.pink} strokeWidth={1.6} strokeDasharray="4 3" />
        </g>; })}
        <defs><marker id="arrE" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#e5e7eb" /></marker></defs>
        <text x={14} y={22} fill={C.ok} fontSize={12}>k ({isKo ? "입사" : "incident"})</text>
        <text x={14} y={40} fill="#fde047" fontSize={12}>k′ = k + G ({isKo ? "회절" : "diffracted"})</text>
        <text x={14} y={58} fill={C.pink} fontSize={12}>G</text>
      </svg>
      <StatGrid>
        <Stat label={isKo ? "구의 반지름 k = 2π/λ" : "Sphere radius k = 2π/λ"} value={`${k.toFixed(3)} Å⁻¹`} color={C.sky} />
        <Stat label={isKo ? "역격자 간격 2π/a" : "Reciprocal spacing 2π/a"} value={`${bstar.toFixed(3)} Å⁻¹`} color={C.accent} />
        <Stat label={isKo ? "지금 회절하는 점 (hk)" : "Points diffracting now (hk)"} value={hits.length ? hits.map(h => `(${h.h}${h.l}) 2θ=${h.tth.toFixed(1)}°`).join("  ") : (isKo ? "없음" : "none")} color="#fde047" />
      </StatGrid>
      <Note>
        {isKo
          ? "단결정에 단색 X선을 쪼이면 우연히 구 위에 걸린 점만 회절하므로, 보통은 거의 아무것도 보이지 않습니다. 그래서 단결정 회절에서는 결정을 돌리고(회전 결정법), Laue는 여러 파장을 한꺼번에 썼습니다(구의 반지름이 연속적으로 바뀜). 분말법은 결정이 모든 방향으로 놓여 있어 G가 모든 방향을 가지므로, |G| ≤ 2k인 모든 점이 어딘가에서 구와 만납니다. 원점에 너무 가까운 점, 곧 |G| > 2k인 점은 어떤 방향에서도 회절하지 않는데, 이것이 λ ≤ 2d 조건입니다."
          : "With monochromatic X-rays on a fixed single crystal, only points that happen to lie on the sphere diffract, so usually almost nothing is seen. Single-crystal methods therefore rotate the crystal, while Laue used many wavelengths at once (a continuous range of sphere radii). In the powder method crystallites take every orientation, G points every way, and every point with |G| ≤ 2k meets the sphere somewhere. Points with |G| > 2k never diffract: that is the condition λ ≤ 2d."}
      </Note>
    </Card>
  );
}

// =============================================================
// 5) WIGNER–SEITZ CELLS AND BRILLOUIN ZONES
// =============================================================
// 2D Wigner–Seitz (Voronoi) cell around the origin by half-plane clipping
function wsCell2D(v1, v2, R = 3) {
  let poly = [[-20, -20], [20, -20], [20, 20], [-20, 20]];
  for (let i = -R; i <= R; i++) for (let j = -R; j <= R; j++) {
    if (!i && !j) continue;
    const T = [i * v1[0] + j * v2[0], i * v1[1] + j * v2[1]];
    const c = (T[0] * T[0] + T[1] * T[1]) / 2;
    const nw = [];
    for (let k = 0; k < poly.length; k++) {
      const p = poly[k], q = poly[(k + 1) % poly.length];
      const fp = p[0] * T[0] + p[1] * T[1] - c, fq = q[0] * T[0] + q[1] * T[1] - c;
      if (fp <= 0) nw.push(p);
      if (fp * fq < 0) { const t = fp / (fp - fq); nw.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]); }
    }
    poly = [];
    for (const q of nw) if (!poly.length || Math.hypot(q[0] - poly[poly.length - 1][0], q[1] - poly[poly.length - 1][1]) > 1e-9) poly.push(q);
    if (poly.length > 1 && Math.hypot(poly[0][0] - poly[poly.length - 1][0], poly[0][1] - poly[poly.length - 1][1]) < 1e-9) poly.pop();
  }
  return poly;
}
const polyArea = P => Math.abs(P.reduce((s, p, i) => { const q = P[(i + 1) % P.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;

// 3D convex polyhedron = intersection of half-spaces x·G ≤ |G|²/2, returned as a list of faces
function bz3D(B, R = 2) {
  const s = 30;
  let faces = [
    { n: [1, 0, 0], v: [[s, -s, -s], [s, s, -s], [s, s, s], [s, -s, s]] },
    { n: [-1, 0, 0], v: [[-s, -s, -s], [-s, -s, s], [-s, s, s], [-s, s, -s]] },
    { n: [0, 1, 0], v: [[-s, s, -s], [-s, s, s], [s, s, s], [s, s, -s]] },
    { n: [0, -1, 0], v: [[-s, -s, -s], [s, -s, -s], [s, -s, s], [-s, -s, s]] },
    { n: [0, 0, 1], v: [[-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s]] },
    { n: [0, 0, -1], v: [[-s, -s, -s], [-s, s, -s], [s, s, -s], [s, -s, -s]] },
  ];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  for (let i = -R; i <= R; i++) for (let j = -R; j <= R; j++) for (let k = -R; k <= R; k++) {
    if (!i && !j && !k) continue;
    const G = [0, 1, 2].map(m => i * B[0][m] + j * B[1][m] + k * B[2][m]);
    const c = dot(G, G) / 2;
    const cap = [];
    const nf = [];
    for (const f of faces) {
      const out = [];
      for (let m = 0; m < f.v.length; m++) {
        const p = f.v[m], q = f.v[(m + 1) % f.v.length];
        const fp = dot(p, G) - c, fq = dot(q, G) - c;
        if (fp <= 1e-12) out.push(p);
        if (fp * fq < -1e-24) { const t = fp / (fp - fq); const x = p.map((v, n) => v + t * (q[n] - v)); out.push(x); cap.push(x); }
        else if (Math.abs(fp) <= 1e-12) cap.push(p);
      }
      if (out.length >= 3) nf.push({ n: f.n, v: out });
    }
    if (cap.length >= 3) {
      const uniq = [];
      for (const p of cap) if (!uniq.some(q => Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) < 1e-9)) uniq.push(p);
      if (uniq.length >= 3) {
        const cen = [0, 1, 2].map(m => uniq.reduce((a, p) => a + p[m], 0) / uniq.length);
        const Gn = Math.sqrt(dot(G, G)), nu = G.map(v => v / Gn);
        let u = Math.abs(nu[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
        const du = dot(u, nu); u = u.map((v, m) => v - du * nu[m]);
        const un = Math.sqrt(dot(u, u)); u = u.map(v => v / un);
        const w = [nu[1] * u[2] - nu[2] * u[1], nu[2] * u[0] - nu[0] * u[2], nu[0] * u[1] - nu[1] * u[0]];
        const ordered = uniq.map(p => { const d = p.map((v, m) => v - cen[m]); return { p, a: Math.atan2(dot(d, w), dot(d, u)) }; })
          .sort((x, y) => x.a - y.a).map(o => o.p);
        nf.push({ n: nu, v: ordered, G: [i, j, k] });
      }
    }
    faces = nf;
  }
  return faces.filter(f => f.v.length >= 3);
}
const RECIP3 = {
  SC: { ko: "SC → 역격자 SC → 정육면체 (면 6개)", en: "SC → reciprocal SC → cube (6 faces)", B: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], Vc: 1, faces: 6 },
  BCC: { ko: "BCC → 역격자 FCC → 마름모십이면체 (면 12개)", en: "BCC → reciprocal FCC → rhombic dodecahedron (12 faces)", B: [[0, 1, 1], [1, 0, 1], [1, 1, 0]], Vc: 0.5, faces: 12 },
  FCC: { ko: "FCC → 역격자 BCC → 깎은 팔면체 (면 14개)", en: "FCC → reciprocal BCC → truncated octahedron (14 faces)", B: [[-1, 1, 1], [1, -1, 1], [1, 1, -1]], Vc: 0.25, faces: 14 },
};

function BzTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <WSIdeaCard isKo={isKo} />
      <WS2DLab isKo={isKo} />
      <ZonesLab isKo={isKo} />
      <BZ3DLab isKo={isKo} />
      <ZoneBoundaryCard isKo={isKo} />
    </div>
  );
}

function WSIdeaCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "Wigner–Seitz 세포와 Brillouin 영역" : "The Wigner–Seitz cell and the Brillouin zone"}</Hd>
      <Note>
        {isKo
          ? "기본 세포를 고르는 방법은 여러 가지입니다. 그중 격자의 대칭을 그대로 보여 주는 세포가 Wigner–Seitz 세포입니다. 만드는 법은 세 단계입니다(강의 19쪽). (1) 한 격자점에서 주변 격자점들로 선을 긋습니다. (2) 각 선의 수직 이등분선(3D에서는 수직 이등분면)을 그립니다. (3) 그 선들로 둘러싸인 가장 작은 영역이 Wigner–Seitz 세포입니다. 곧 '다른 어느 격자점보다 이 격자점에 더 가까운 점들의 모임'입니다. 세포 하나에 격자점이 하나이고, 이 세포들로 공간을 빈틈없이 채울 수 있습니다."
          : "There are many ways to choose a primitive cell; the Wigner–Seitz cell is the one that shows the full symmetry of the lattice. It takes three steps (lecture page 19): (1) draw lines from one lattice point to its neighbours; (2) draw the perpendicular bisector of each line (a bisecting plane in 3D); (3) the smallest region enclosed is the Wigner–Seitz cell, i.e. the set of points closer to this lattice point than to any other. It holds one lattice point, and copies of it fill space without gaps."}
      </Note>
      <Eq>{isKo ? "제1 Brillouin 영역 = 역격자의 Wigner–Seitz 세포" : "First Brillouin zone = Wigner–Seitz cell of the reciprocal lattice"}</Eq>
      <Eq>{isKo ? "경계면:" : "Boundary planes:"}  2k·G = G²   ⟺   k·(G/2) = |G/2|²</Eq>
      <Note>
        {isKo
          ? "두 번째 식이 핵심입니다. 회절 조건 2k·G = G²(Laue)을 다시 쓰면, k의 끝이 G의 수직 이등분면 위에 있다는 뜻입니다. 따라서 Brillouin 영역의 경계에 닿는 파동 벡터 k만 Bragg 반사를 일으킵니다. 영역 안쪽의 파동은 결정을 반사 없이 지나갑니다. 11주차 포논과 12주차 전자의 분산 관계가 −π/a < k ≤ π/a에서 정의되고, 경계 π/a에서 특별한 일(정상파, 띠 간격)이 생긴 이유가 바로 이것입니다."
          : "The second equation is the key. Rewriting the Laue condition 2k·G = G² says that the tip of k lies on the perpendicular bisecting plane of G. So only wave vectors that reach a Brillouin-zone boundary are Bragg-reflected; waves inside the zone pass through the crystal unreflected. This is why the phonon and electron dispersions of Weeks 11 and 12 were defined on −π/a < k ≤ π/a, and why something special (standing waves, band gaps) happened at the boundary π/a."}
      </Note>
    </Card>
  );
}

const WS_PRESETS = [
  { ko: "정사각", en: "Square", b: 1, g: 90 }, { ko: "직사각", en: "Rectangular", b: 0.6, g: 90 },
  { ko: "육방", en: "Hexagonal", b: 1, g: 60 }, { ko: "중심 직사각", en: "Centred rect.", b: 1, g: 70 }, { ko: "비스듬", en: "Oblique", b: 0.8, g: 72 },
];
function WS2DLab({ isKo }) {
  const [b, setB] = useState(1);
  const [g, setG] = useState(60);
  const [recip, setRecip] = useState(false);
  const a1 = [1, 0], a2 = [b * Math.cos(g * DEG), b * Math.sin(g * DEG)];
  const A = a1[0] * a2[1] - a1[1] * a2[0];
  const b1 = [2 * Math.PI * a2[1] / A, -2 * Math.PI * a2[0] / A], b2 = [0, 2 * Math.PI / A];
  const [v1, v2] = recip ? [b1, b2] : [a1, a2];
  const cell = wsCell2D(v1, v2);
  const area = polyArea(cell);
  const prim = Math.abs(v1[0] * v2[1] - v1[1] * v2[0]);
  const W = 640, Ht = 380;
  const unit = Math.max(Math.hypot(...v1), Math.hypot(...v2));
  const s = 95 / unit;
  const P = ([x, y]) => [W / 2 + s * x, Ht / 2 - s * y];
  const pts = [];
  for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) {
    const r = [i * v1[0] + j * v2[0], i * v1[1] + j * v2[1]];
    const [X, Y] = P(r);
    if (X > 5 && X < W - 5 && Y > 5 && Y < Ht - 5) pts.push([i, j, r, X, Y]);
  }
  // neighbours that define faces: bisector touches the cell
  const nbr = pts.filter(([i, j, r]) => (i || j) && cell.some(p => Math.abs(p[0] * r[0] + p[1] * r[1] - (r[0] * r[0] + r[1] * r[1]) / 2) < 1e-6));
  return (
    <Card>
      <Hd>{isKo ? "실험실 ① 2차원 Wigner–Seitz 세포 (또는 제1 Brillouin 영역) 만들기" : "Lab ① Build a 2D Wigner–Seitz cell (or first Brillouin zone)"}</Hd>
      <Row>
        {WS_PRESETS.map((p, i) => <button key={i} style={btnStyle(Math.abs(b - p.b) < 1e-9 && g === p.g)} onClick={() => { setB(p.b); setG(p.g); }}>{isKo ? p.ko : p.en}</button>)}
        <button style={btnStyle(recip)} onClick={() => setRecip(v => !v)}>{recip ? (isKo ? "역격자 → 제1 BZ" : "Reciprocal → 1st BZ") : (isKo ? "실공간 → WS 세포" : "Real space → WS cell")}</button>
      </Row>
      <Row>
        <Slider label="|a₂| / |a₁|" value={b} min={0.5} max={1.5} step={0.01} onChange={setB} fmt={v => v.toFixed(2)} />
        <Slider label={isKo ? "사잇각 γ" : "Angle γ"} value={g} min={50} max={130} step={1} onChange={setG} unit="°" fmt={v => v.toFixed(0)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <polygon points={cell.map(p => P(p).join(",")).join(" ")} fill={`${C.accent}33`} stroke={C.accent} strokeWidth={2.4} />
        {nbr.map(([i, j, r]) => {
          const O = P([0, 0]), T = P(r);
          const mid = [r[0] / 2, r[1] / 2], t = [-r[1], r[0]], tn = Math.hypot(...t);
          const L1 = P([mid[0] - 3 * unit * t[0] / tn, mid[1] - 3 * unit * t[1] / tn]), L2 = P([mid[0] + 3 * unit * t[0] / tn, mid[1] + 3 * unit * t[1] / tn]);
          return <g key={`${i},${j}`}>
            <line x1={O[0]} y1={O[1]} x2={T[0]} y2={T[1]} stroke={C.sky} strokeWidth={1.2} strokeDasharray="4 3" />
            <line x1={L1[0]} y1={L1[1]} x2={L2[0]} y2={L2[1]} stroke="#64748b" strokeWidth={1} />
          </g>;
        })}
        {pts.map(([i, j, , X, Y]) => <circle key={`${i},${j}`} cx={X} cy={Y} r={i || j ? 4 : 6} fill={i || j ? C.sky : C.ok} />)}
      </svg>
      <StatGrid>
        <Stat label={isKo ? "세포 모양" : "Cell shape"} value={`${cell.length}${isKo ? "각형" : "-gon"}`} color={C.accent} />
        <Stat label={isKo ? "WS 세포 넓이" : "WS cell area"} value={area.toFixed(4)} color={C.ok} />
        <Stat label={isKo ? "기본 세포 넓이 |v₁ × v₂|" : "Primitive-cell area |v₁ × v₂|"} value={prim.toFixed(4)} color={C.sky} />
        <Stat label={isKo ? "면(변)을 만드는 이웃 수" : "Neighbours that make faces"} value={String(nbr.length)} color={C.amber} />
      </StatGrid>
      <Note>
        {isKo
          ? "어떤 격자를 골라도 WS 세포의 넓이는 기본 세포 넓이와 정확히 같습니다. 세포 하나에 격자점이 하나이기 때문입니다. 정사각과 직사각 격자는 사각형, 육방·중심 직사각·비스듬한 격자는 일반적으로 육각형 세포를 가집니다. 버튼으로 역격자로 바꾸면 같은 작도가 제1 Brillouin 영역을 줍니다. 정사각 격자의 BZ는 −π/a < k_x, k_y ≤ π/a인 정사각형이고, 육방 격자의 BZ는 다시 육각형입니다(그래핀의 BZ)."
          : "Whatever the lattice, the WS cell has exactly the area of the primitive cell, because it holds one lattice point. Square and rectangular lattices give rectangles; hexagonal, centred rectangular and oblique lattices generally give hexagons. Switch to the reciprocal lattice and the same construction gives the first Brillouin zone: the square −π/a < k_x, k_y ≤ π/a for the square lattice, and again a hexagon for the hexagonal lattice (the BZ of graphene)."}
      </Note>
    </Card>
  );
}

function ZonesLab({ isKo }) {
  const [nMax, setNMax] = useState(4);
  const [hex, setHex] = useState(false);
  const b1 = [1, 0], b2 = hex ? [0.5, Math.sqrt(3) / 2] : [0, 1];
  const Gs = [];
  for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) if (i || j) { const G = [i * b1[0] + j * b2[0], i * b1[1] + j * b2[1]]; if (Math.hypot(...G) < 4.6) Gs.push(G); }
  const zoneOf = q => {
    const r0 = q[0] * q[0] + q[1] * q[1];
    let cnt = 0;
    for (const G of Gs) { const dx = q[0] - G[0], dy = q[1] - G[1]; if (dx * dx + dy * dy < r0) cnt++; }
    return cnt + 1;
  };
  const W = 420, Ht = 420, n = 90, L = 2.2;
  const cols = ["#e879f9", "#38bdf8", "#f59e0b", "#10b981", "#f472b6", "#a3e635", "#818cf8", "#fb923c"];
  const cells = [];
  const h = 2 * L / n;
  for (let ix = 0; ix < n; ix++) for (let iy = 0; iy < n; iy++) {
    const zone = zoneOf([-L + (ix + 0.5) * h, -L + (iy + 0.5) * h]);
    if (zone <= nMax) cells.push([ix, iy, zone]);
  }
  // areas on a finer grid than the picture
  const area = useMemo(() => {
    const out = {}, nf = 360, hf = 2 * L / nf;
    for (let ix = 0; ix < nf; ix++) for (let iy = 0; iy < nf; iy++) {
      const z = zoneOf([-L + (ix + 0.5) * hf, -L + (iy + 0.5) * hf]);
      out[z] = (out[z] || 0) + hf * hf;
    }
    return out;
  }, [hex]);
  const cellA = Math.abs(b1[0] * b2[1] - b1[1] * b2[0]);
  const px = W / n;
  return (
    <Card>
      <Hd>{isKo ? "실험실 ② 높은 차수의 Brillouin 영역: 조각은 달라도 넓이는 같다" : "Lab ② Higher Brillouin zones: different pieces, equal area"}</Hd>
      <Note>
        {isKo
          ? "역격자의 원점에서 출발해 수직 이등분선을 하나 넘을 때마다 영역 번호가 하나씩 올라갑니다. 정확히 말하면, 원점보다 k에 더 가까운 역격자점이 n − 1개이면 k는 제 n 영역에 있습니다. 각 영역은 여러 조각으로 흩어져 있지만, 조각들을 역격자 벡터만큼 옮겨 모으면 제1 영역을 정확히 채웁니다."
          : "Starting from the reciprocal origin, the zone number rises by one each time a perpendicular bisector is crossed. Precisely, k is in the nth zone when exactly n − 1 reciprocal-lattice points are closer to k than the origin is. Each higher zone is split into pieces, but shifting the pieces by reciprocal vectors reassembles the first zone exactly."}
      </Note>
      <Row>
        <Slider label={isKo ? "보여 줄 영역 수" : "Zones shown"} value={nMax} min={1} max={8} step={1} onChange={setNMax} fmt={v => v.toFixed(0)} />
        <button style={btnStyle(!hex)} onClick={() => setHex(false)}>{isKo ? "정사각 역격자" : "Square reciprocal lattice"}</button>
        <button style={btnStyle(hex)} onClick={() => setHex(true)}>{isKo ? "육방 역격자" : "Hexagonal reciprocal lattice"}</button>
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <svg viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          {cells.map(([ix, iy, z]) => <rect key={`${ix},${iy}`} x={ix * px} y={Ht - (iy + 1) * px} width={px + 0.4} height={px + 0.4} fill={cols[(z - 1) % cols.length]} opacity={0.85} />)}
          {Gs.concat([[0, 0]]).map((G, i) => { const X = (G[0] + L) / (2 * L) * W, Y = Ht - (G[1] + L) / (2 * L) * Ht; return X > 0 && X < W && Y > 0 && Y < Ht ? <circle key={i} cx={X} cy={Y} r={3} fill="#0b0f17" /> : null; })}
        </svg>
        <div style={{ flex: "1 1 200px" }}>
          {Array.from({ length: nMax }, (_, i) => i + 1).map(z => (
            <div key={z} style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0", fontSize: 13 }}>
              <span style={{ width: 14, height: 14, background: cols[(z - 1) % cols.length], borderRadius: 3, display: "inline-block" }} />
              <span>{isKo ? `제${z} 영역` : `Zone ${z}`}: {isKo ? "넓이" : "area"} {((area[z] || 0) / cellA).toFixed(3)} × {isKo ? "기본 세포" : "cell"}</span>
            </div>
          ))}
          <Note>{isKo ? "그림보다 촘촘한 360 × 360 격자에서 센 넓이입니다. 모든 영역이 기본 세포 넓이 1과 3% 이내로 같습니다(남은 차이는 격자 해상도 오차)." : "Areas counted on a 360 × 360 grid, finer than the picture. Every zone matches the primitive-cell area 1 to within 3% (the rest is grid-resolution error)."}</Note>
        </div>
      </div>
    </Card>
  );
}

function BZ3DLab({ isKo }) {
  const [type, setType] = useState("FCC");
  const [yaw, setYaw] = useState(25);
  const [pitch, setPitch] = useState(20);
  const info = RECIP3[type];
  const faces = useMemo(() => bz3D(info.B), [type]);
  const W = 520, Ht = 400, s = 105;
  const pr = p => proj3(p, yaw * DEG, pitch * DEG, s, W / 2, Ht / 2);
  const light = [0.4, -0.5, 0.75];
  const ln = Math.hypot(...light);
  const drawn = faces.map(f => {
    const q = f.v.map(pr);
    const depth = q.reduce((a, p) => a + p[2], 0) / q.length;
    // rotate normal like the points for shading
    const nr = proj3(f.n, yaw * DEG, pitch * DEG, 1, 0, 0);
    const shade = Math.max(0.15, (nr[0] * light[0] - nr[1] * light[1] + nr[2] * light[2] * -1) / ln * 0.5 + 0.5);
    return { q, depth, shade, sq: f.n.map(v => Math.abs(v)).sort((a, b) => b - a) };
  }).sort((a, b) => b.depth - a.depth);
  const vol = (2 * Math.PI) ** 3 / info.Vc;
  return (
    <Card>
      <Hd>{isKo ? "실험실 ③ 3차원 제1 Brillouin 영역: SC, BCC, FCC" : "Lab ③ First Brillouin zones in 3D: SC, BCC, FCC"}</Hd>
      <Row>
        {["SC", "BCC", "FCC"].map(k => <button key={k} style={btnStyle(type === k)} onClick={() => setType(k)}>{k}</button>)}
        <Slider label={isKo ? "좌우 회전" : "Yaw"} value={yaw} min={-90} max={90} step={1} onChange={setYaw} unit="°" fmt={v => v.toFixed(0)} />
        <Slider label={isKo ? "상하 회전" : "Pitch"} value={pitch} min={-60} max={60} step={1} onChange={setPitch} unit="°" fmt={v => v.toFixed(0)} />
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <svg viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          {drawn.map((f, i) => (
            <polygon key={i} points={f.q.map(p => `${p[0]},${p[1]}`).join(" ")}
              fill={f.sq[0] > 0.99 ? `rgba(56,189,248,${0.25 + 0.5 * f.shade})` : `rgba(232,121,249,${0.25 + 0.5 * f.shade})`}
              stroke="#e5e7eb" strokeWidth={1} strokeOpacity={0.6} />
          ))}
        </svg>
        <div style={{ flex: "1 1 240px" }}>
          <StatGrid min={200}>
            <Stat label={isKo ? "대응" : "Correspondence"} value={isKo ? info.ko : info.en} color={C.accent} />
            <Stat label={isKo ? "역격자 기본 벡터 (2π/a 단위)" : "Reciprocal primitive vectors (2π/a)"} value={info.B.map(v => `(${v.join(",")})`).join(" ")} color={C.sky} />
            <Stat label={isKo ? "면의 수 (계산)" : "Faces (computed)"} value={String(faces.length)} color={C.ok} />
            <Stat label={isKo ? "BZ 부피 = (2π)³/V_c" : "BZ volume = (2π)³/V_c"} value={`${(vol / (2 * Math.PI / 1) ** 3).toFixed(0)} (2π/a)³`} color={C.amber} />
          </StatGrid>
        </div>
      </div>
      <Note>
        {isKo
          ? "BCC의 역격자는 FCC이고, FCC의 역격자는 BCC입니다(강의 22–23쪽). 그래서 BCC 결정(α-Fe, Na)의 BZ는 FCC 격자의 WS 세포인 마름모십이면체(면 12개)입니다. FCC 결정(Cu, Al, Si의 격자)의 BZ는 BCC 격자의 WS 세포인 깎은 팔면체입니다. 깎은 팔면체의 면은 {111} 방향의 육각형 8개와 {100} 방향의 정사각형 6개(파란색)로 모두 14개입니다. BZ 부피는 실공간 기본 세포 부피에 반비례합니다. FCC의 기본 세포가 가장 작으므로 BZ가 가장 큽니다."
          : "The reciprocal of BCC is FCC and the reciprocal of FCC is BCC (lecture pages 22–23). So the BZ of a BCC crystal (α-Fe, Na) is the WS cell of an FCC lattice, a rhombic dodecahedron with 12 faces, and the BZ of an FCC crystal (Cu, Al, and the lattice of Si) is the WS cell of a BCC lattice, a truncated octahedron. Its 14 faces are eight hexagons along {111} and six squares along {100} (blue). The BZ volume is inversely proportional to the real-space primitive-cell volume, so FCC, with the smallest primitive cell, has the largest BZ."}
      </Note>
    </Card>
  );
}

function ZoneBoundaryCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "11·12주차와의 연결: 영역 경계 = Bragg 반사 = 띠 간격" : "Link to Weeks 11 and 12: zone boundary = Bragg reflection = band gap"}</Hd>
      <Note>
        {isKo
          ? "1차원 격자(간격 a)의 역격자는 G = 2πn/a이고, 제1 BZ의 경계는 k = ±π/a입니다. 이 k는 G = 2π/a에 대해 2k·G = G²를 만족하므로 Bragg 조건에 있습니다. 경계에 있는 파동은 반사파와 겹쳐 진행하지 못하는 정상파가 됩니다. 11주차에서 포논의 군속도 dω/dk가 경계에서 0이 된 것, 12주차에서 이원자 사슬의 띠 간격이 경계 π/a에서 열린 것이 모두 이 반사의 결과입니다. 전자의 경우 정상파는 원자 위에 전자가 모인 것(cos)과 원자 사이에 모인 것(sin) 두 가지이고, 둘의 퍼텐셜 에너지 차이가 띠 간격입니다."
          : "For a 1D lattice of spacing a the reciprocal lattice is G = 2πn/a and the first-zone boundary is k = ±π/a. These k satisfy 2k·G = G² for G = 2π/a, so they are at the Bragg condition. A wave at the boundary overlaps its reflection and becomes a standing wave that does not propagate. The vanishing phonon group velocity dω/dk at the boundary in Week 11, and the band gap of the diatomic chain opening at π/a in Week 12, are both results of this reflection. For electrons the two standing waves pile charge either on the atoms (cos) or between them (sin), and the difference in their potential energy is the band gap."}
      </Note>
      <Eq>k = ±π/a:   ψ₊ ∝ cos(πx/a),   ψ₋ ∝ sin(πx/a),   E_g = ⟨ψ₋|U|ψ₋⟩ − ⟨ψ₊|U|ψ₊⟩</Eq>
    </Card>
  );
}

// =============================================================
// 6) STRUCTURE FACTOR AND EXTINCTION RULES
// =============================================================
const SF_STRUCTS = {
  SC: { ko: "SC", en: "SC", basis: () => [[1, [0, 0, 0]]] },
  BCC: { ko: "BCC", en: "BCC", basis: () => [[1, [0, 0, 0]], [1, [0.5, 0.5, 0.5]]] },
  FCC: { ko: "FCC", en: "FCC", basis: () => FCC4.map(p => [1, p]) },
  dia: { ko: "다이아몬드", en: "Diamond", basis: () => [...FCC4, ...shiftB(FCC4, [0.25, 0.25, 0.25])].map(p => [1, p]) },
  NaCl: { ko: "NaCl", en: "NaCl", basis: () => CRYSTALS.NaCl.basis },
  KCl: { ko: "KCl", en: "KCl", basis: () => CRYSTALS.KCl.basis },
  AB: { ko: "CsCl형 AB (f_B 조절)", en: "CsCl-type AB (tune f_B)", basis: fb => [[1, [0, 0, 0]], [fb, [0.5, 0.5, 0.5]]] },
};
const HKL_LIST = [[1, 0, 0], [1, 1, 0], [1, 1, 1], [2, 0, 0], [2, 1, 0], [2, 1, 1], [2, 2, 0], [2, 2, 1], [3, 1, 0], [3, 1, 1], [2, 2, 2], [3, 2, 0], [3, 2, 1], [4, 0, 0]];

function SfTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <SfDerivCard isKo={isKo} />
      <SfCubicDerivCard isKo={isKo} />
      <SfLab isKo={isKo} />
      <SfCasesCard isKo={isKo} />
    </div>
  );
}

function SfDerivCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "구조 인자: 세포 안의 원자 배치가 세기를 정한다" : "The structure factor: the atomic arrangement in the cell sets the intensity"}</Hd>
      <Note>
        {isKo
          ? "Laue 조건 Δk = G는 피크가 '어디에' 나오는지를 정합니다. 피크가 '얼마나 센지'는 산란 진폭 F에 있습니다. 결정이 기본 세포 N개로 이루어져 있으면, 진폭은 세포 하나의 기여에 N을 곱한 것입니다(강의 24쪽)."
          : "The Laue condition Δk = G fixes where peaks appear; how strong they are lies in the scattering amplitude F. For a crystal of N cells, the amplitude is N times the contribution of one cell (lecture page 24)."}
      </Note>
      <Eq>F = N ∫_cell n(r) exp(−iG·r) dV ≡ N S_G</Eq>
      <Eq>{isKo ? "세포 안 원자 s개:" : "s atoms in the cell:"}  n(r) = Σ_j n_j(r − r_j)</Eq>
      <Eq>S_G = Σ_j exp(−iG·r_j) ∫ n_j(ρ) exp(−iG·ρ) dV = Σ_j f_j exp(−iG·r_j),   ρ = r − r_j</Eq>
      <Eq>f_j = ∫ n_j(ρ) exp(−iG·ρ) dV   {isKo ? "(원자 산란 인자, G = 0에서 전자 수 Z)" : "(atomic form factor; equals the electron count Z at G = 0)"}</Eq>
      <Eq>r_j = x_ja₁ + y_ja₂ + z_ja₃,  G = v₁b₁ + v₂b₂ + v₃b₃   →   G·r_j = 2π(v₁x_j + v₂y_j + v₃z_j)</Eq>
      <Eq style={{ color: C.accent }}>S(v₁v₂v₃) = Σ_j f_j exp[−i2π(v₁x_j + v₂y_j + v₃z_j)],   I ∝ |S|²</Eq>
      <Note>
        {isKo
          ? "세 번째 줄에서 적분 변수를 원자 중심 기준 ρ로 바꾸면, 위치 정보(exp(−iG·r_j))와 원자 자체의 정보(f_j)가 깔끔하게 나뉩니다. 구조 인자는 원자마다 길이 f_j인 화살표(복소수)를 위상 2π(v₁x_j + v₂y_j + v₃z_j)만큼 돌려 더한 것입니다. 화살표들이 서로 상쇄되면 Laue 조건을 만족해도 피크가 사라집니다. 이것이 소멸 규칙(systematic absence)입니다."
          : "Changing the integration variable to ρ about each atom's centre neatly separates position (exp(−iG·r_j)) from the atom itself (f_j). The structure factor adds, for each atom, an arrow (a complex number) of length f_j rotated by the phase 2π(v₁x_j + v₂y_j + v₃z_j). When the arrows cancel, the peak vanishes even though the Laue condition holds: a systematic absence, or extinction."}
      </Note>
    </Card>
  );
}

function SfCubicDerivCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "BCC와 FCC의 소멸 규칙 유도 (입방 세포를 기저 있는 SC로 보기)" : "Deriving the BCC and FCC extinction rules (cubic cell as SC with a basis)"}</Hd>
      <Note>
        {isKo
          ? "BCC와 FCC를 '입방 세포 하나에 원자 2개 또는 4개가 든 단순 입방 격자'로 봅니다. 그러면 G는 SC 역격자 (2π/a)(h, k, l)의 모든 정수 조합이 되고, 원자 배치가 그중 일부를 지웁니다(강의 25쪽). 지수 (v₁v₂v₃)는 여기서 (hkl)과 같습니다."
          : "Treat BCC and FCC as a simple cubic lattice with 2 or 4 atoms per cube. Then G runs over every integer combination of the SC reciprocal lattice (2π/a)(h, k, l), and the atomic arrangement erases some of them (lecture page 25). Here (v₁v₂v₃) is just (hkl)."}
      </Note>
      <Eq>{isKo ? "BCC: 원자 (0,0,0), (½,½,½)" : "BCC: atoms at (0,0,0), (½,½,½)"}</Eq>
      <Eq>S = f [1 + exp(−iπ(h + k + l))] = 2f  (h + k + l {isKo ? "짝수" : "even"}),   0  (h + k + l {isKo ? "홀수" : "odd"})</Eq>
      <Eq>{isKo ? "FCC: 원자 (0,0,0), (0,½,½), (½,0,½), (½,½,0)" : "FCC: atoms at (0,0,0), (0,½,½), (½,0,½), (½,½,0)"}</Eq>
      <Eq>S = f [1 + e^(−iπ(k+l)) + e^(−iπ(h+l)) + e^(−iπ(h+k))] = 4f  ({isKo ? "h, k, l 모두 짝수 또는 모두 홀수" : "h, k, l all even or all odd"}),   0  ({isKo ? "섞임" : "mixed"})</Eq>
      <Note>
        {isKo
          ? "FCC에서 h, k, l이 모두 같은 홀짝이면 세 지수의 합 k + l, h + l, h + k가 모두 짝수라 네 항이 모두 1입니다. 하나만 홀짝이 다르면, 예를 들어 (100)에서는 1 + 1 − 1 − 1 = 0입니다. 결과를 역격자로 다시 보면 흥미롭습니다. BCC에서 살아남는 (h + k + l 짝수) 점들은 (2π/a)(1,1,0) 같은 벡터로 만들어지는 FCC 격자를 이룹니다. FCC에서 살아남는 점들은 BCC 격자를 이룹니다. 곧 구조 인자는 '입방 세포라는 편의상 선택'이 만든 가짜 역격자점을 지워서, Brillouin 영역 탭에서 본 진짜 역격자(BCC ↔ FCC)를 되살려 줍니다."
          : "For FCC with h, k, l all of one parity, the sums k + l, h + l, h + k are all even and all four terms are 1; with one index of the other parity, e.g. (100), we get 1 + 1 − 1 − 1 = 0. Seen in reciprocal space the result is striking: the surviving BCC points (h + k + l even) form an FCC lattice generated by vectors like (2π/a)(1,1,0), and the surviving FCC points form a BCC lattice. The structure factor erases the spurious points created by the convenient cubic cell and restores the true reciprocal lattice of the Brillouin Zones tab (BCC ↔ FCC)."}
      </Note>
    </Card>
  );
}

function SfLab({ isKo }) {
  const [key, setKey] = useState("FCC");
  const [fb, setFb] = useState(0.5);
  const [sel, setSel] = useState(2);
  const basis = SF_STRUCTS[key].basis(fb);
  const rows = HKL_LIST.map(([h, k, l]) => {
    const [re, im] = structFactor(basis, h, k, l, 0, 0);
    return { h, k, l, re, im, S: Math.hypot(re, im) };
  });
  const fsum = basis.reduce((s, [Z]) => s + Z, 0);
  const cur = rows[sel];
  const W = 320, Ht = 320, c0 = [W / 2, Ht / 2];
  const sc = 120 / Math.max(fsum, 1e-9);
  let pos = [0, 0];
  const arrows = basis.map(([Z, [x, y, z]], i) => {
    const ph = -2 * Math.PI * (cur.h * x + cur.k * y + cur.l * z);
    const d = [Z * Math.cos(ph), Z * Math.sin(ph)];
    const from = pos; pos = [pos[0] + d[0], pos[1] + d[1]];
    return { from, to: pos, i, Z };
  });
  const toS = ([x, y]) => [c0[0] + sc * x, c0[1] - sc * y];
  const colors = [C.accent, C.sky, C.amber, C.ok, C.pink, C.lime, C.purple, C.teal];
  return (
    <Card>
      <Hd>{isKo ? "실험실 ① 구조 인자 계산기와 위상 화살표" : "Lab ① Structure-factor calculator with phase arrows"}</Hd>
      <Row>
        {Object.entries(SF_STRUCTS).map(([k, v]) => <button key={k} style={btnStyle(key === k)} onClick={() => setKey(k)}>{isKo ? v.ko : v.en}</button>)}
      </Row>
      {key === "AB" && <Row><Slider label={isKo ? "B 원자의 산란 인자 f_B / f_A" : "Form factor of B, f_B / f_A"} value={fb} min={0} max={1} step={0.01} onChange={setFb} fmt={v => v.toFixed(2)} /></Row>}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 320px", overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5, fontFamily: mono }}>
            <thead><tr style={{ color: C.textDim }}>
              {["hkl", "N", "|S|", "|S|²", isKo ? "판정" : "verdict"].map(h => <th key={h} style={{ padding: "4px 8px", textAlign: "right" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} onClick={() => setSel(i)} style={{ borderTop: `1px solid ${C.border}`, cursor: "pointer", background: i === sel ? `${C.accent}22` : "transparent" }}>
                  <td style={{ padding: "4px 8px", textAlign: "right", color: C.accent }}>{`${r.h}${r.k}${r.l}`}</td>
                  <td style={{ padding: "4px 8px", textAlign: "right" }}>{r.h * r.h + r.k * r.k + r.l * r.l}</td>
                  <td style={{ padding: "4px 8px", textAlign: "right" }}>{r.S.toFixed(2)}</td>
                  <td style={{ padding: "4px 8px", textAlign: "right" }}>{(r.S * r.S).toFixed(1)}</td>
                  <td style={{ padding: "4px 8px", textAlign: "right", color: r.S > 1e-6 ? C.ok : C.pink }}>{r.S > 1e-6 ? (isKo ? "보임" : "allowed") : (isKo ? "소멸" : "absent")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Note>{isKo ? "행을 누르면 그 (hkl)의 위상 화살표를 오른쪽에 그립니다. 산란 인자는 각도 의존을 뺀 f(0) = 전자 수(이온 기준: Na⁺ 10, Cl⁻ 18, K⁺ 18)를 썼습니다." : "Click a row to draw its phase arrows on the right. Form factors are the angle-free f(0) = electron count (ions: Na⁺ 10, Cl⁻ 18, K⁺ 18)."}</Note>
        </div>
        <svg viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <circle cx={c0[0]} cy={c0[1]} r={120} fill="none" stroke="#334155" strokeDasharray="3 4" />
          <line x1={c0[0] - 140} x2={c0[0] + 140} y1={c0[1]} y2={c0[1]} stroke="#334155" />
          <line y1={c0[1] - 140} y2={c0[1] + 140} x1={c0[0]} x2={c0[0]} stroke="#334155" />
          {arrows.map(a => { const P1 = toS(a.from), P2 = toS(a.to); return <line key={a.i} x1={P1[0]} y1={P1[1]} x2={P2[0]} y2={P2[1]} stroke={colors[a.i % colors.length]} strokeWidth={3} markerEnd="url(#arrS)" />; })}
          {(() => { const P2 = toS(pos); return <line x1={c0[0]} y1={c0[1]} x2={P2[0]} y2={P2[1]} stroke="#fde047" strokeWidth={2} strokeDasharray="6 3" />; })()}
          <defs><marker id="arrS" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#e5e7eb" /></marker></defs>
          <text x={10} y={20} fill={C.text} fontSize={13}>({cur.h}{cur.k}{cur.l}):  |S| = {cur.S.toFixed(2)}</text>
          <text x={10} y={Ht - 12} fill={C.textDim} fontSize={11}>{isKo ? "점선 원: 모든 화살표가 같은 방향일 때 |S| = Σf" : "dashed circle: |S| = Σf when all arrows align"}</text>
        </svg>
      </div>
      <Note>
        {isKo
          ? "CsCl형 AB를 골라 f_B를 1까지 올려 보십시오. f_B = f_A이면 이것은 BCC이므로 (100), (111) 같은 h + k + l 홀수 피크가 사라집니다. f_B가 작아질수록 두 화살표가 덜 상쇄되어 이 피크들이 |f_A − f_B|에 비례해 다시 나타납니다. 이렇게 순서 있는 합금에서만 나타나는 약한 피크를 초격자선(superlattice line)이라고 합니다."
          : "Choose the CsCl-type AB and raise f_B to 1. With f_B = f_A it is BCC, so the h + k + l odd peaks such as (100) and (111) vanish. As f_B drops the two arrows cancel less, and those peaks return in proportion to |f_A − f_B|. Such weak peaks, present only in ordered alloys, are called superlattice lines."}
      </Note>
    </Card>
  );
}

function SfCasesCard({ isKo }) {
  const rows = isKo
    ? [["SC", "모든 (hkl)", "1, 2, 3, 4, 5, 6, 8, 9, …"], ["BCC", "h + k + l 짝수", "2, 4, 6, 8, 10, 12, …"], ["FCC", "h, k, l 모두 짝수 또는 모두 홀수", "3, 4, 8, 11, 12, 16, …"],
       ["다이아몬드 (Si, Ge, C)", "FCC 규칙 + 모두 짝수이면 h + k + l = 4n", "3, 8, 11, 16, 19, 24, …"], ["NaCl", "FCC 규칙 (모두 홀수: |f_Na − f_Cl|, 모두 짝수: f_Na + f_Cl)", "3, 4, 8, 11, 12, …"], ["KCl", "f_K⁺ ≈ f_Cl⁻ → 모두 짝수만", "4, 8, 12, 16, … (a/2인 SC처럼)"]]
    : [["SC", "all (hkl)", "1, 2, 3, 4, 5, 6, 8, 9, …"], ["BCC", "h + k + l even", "2, 4, 6, 8, 10, 12, …"], ["FCC", "h, k, l all even or all odd", "3, 4, 8, 11, 12, 16, …"],
       ["Diamond (Si, Ge, C)", "FCC rule + if all even, h + k + l = 4n", "3, 8, 11, 16, 19, 24, …"], ["NaCl", "FCC rule (all odd: |f_Na − f_Cl|, all even: f_Na + f_Cl)", "3, 4, 8, 11, 12, …"], ["KCl", "f_K⁺ ≈ f_Cl⁻ → only all even", "4, 8, 12, 16, … (like SC with a/2)"]];
  return (
    <Card>
      <Hd>{isKo ? "소멸 규칙 정리와 화학공학 사례" : "Extinction rules and chemical-engineering cases"}</Hd>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
          <thead><tr style={{ color: C.textDim, textAlign: "left" }}>
            <th style={{ padding: "6px 10px" }}>{isKo ? "구조" : "Structure"}</th><th style={{ padding: "6px 10px" }}>{isKo ? "보이는 반사" : "Observed reflections"}</th><th style={{ padding: "6px 10px" }}>N = h² + k² + l²</th>
          </tr></thead>
          <tbody>{rows.map(r => <tr key={r[0]} style={{ borderTop: `1px solid ${C.border}` }}>
            <td style={{ padding: "6px 10px", fontWeight: 700 }}>{r[0]}</td><td style={{ padding: "6px 10px" }}>{r[1]}</td><td style={{ padding: "6px 10px", fontFamily: mono, color: C.accent }}>{r[2]}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
        {[[isKo ? "① KCl은 왜 단순 입방처럼 보이나" : "① Why KCl looks simple cubic",
           isKo ? "K⁺와 Cl⁻는 둘 다 전자가 18개라 X선에게는 거의 같은 원자로 보입니다. 그래서 NaCl에서 |f_Na − f_Cl|에 비례하던 모두 홀수 피크((111), (311) …)가 KCl에서는 거의 사라집니다. 패턴만 보면 격자 상수 a/2인 단순 입방 결정처럼 보입니다(분말 XRD 탭에서 확인). 같은 이유로 X선은 이웃한 원소(예: Cu와 Zn)를 구별하기 어렵습니다. 이럴 때는 산란 길이가 원소마다 크게 다른 중성자 회절을 씁니다."
                 : "K⁺ and Cl⁻ both have 18 electrons and look almost identical to X-rays. The all-odd peaks ((111), (311), …), proportional to |f_Na − f_Cl| in NaCl, nearly vanish in KCl, whose pattern resembles a simple cubic crystal with lattice constant a/2 (check in the Powder XRD tab). For the same reason X-rays struggle to tell neighbouring elements such as Cu and Zn apart; neutron diffraction, with scattering lengths that differ strongly between elements, is used instead."],
          [isKo ? "② 합금의 질서–무질서 전이" : "② Order–disorder transitions in alloys",
           isKo ? "β-황동(CuZn)은 낮은 온도에서 Cu가 꼭짓점, Zn이 체심에 규칙적으로 놓인 CsCl형 구조입니다. 높은 온도에서는 두 원자가 무작위로 섞여 평균적으로 BCC가 됩니다. 질서 상태에서만 (100) 같은 초격자선이 나타나므로, 그 세기는 질서도를 재는 지표가 됩니다. 다만 f_Cu(29)와 f_Zn(30)이 거의 같아 초격자선이 매우 약하므로 측정에 공이 많이 듭니다. 합금 열처리 공정에서 상태를 확인하는 고전적인 방법입니다."
                 : "β-brass (CuZn) is CsCl-type at low temperature, with Cu on the corners and Zn at the body centres; at high temperature the atoms mix randomly and the average structure is BCC. Superlattice lines such as (100) appear only in the ordered state, so their intensity measures the degree of order. Because f_Cu (29) and f_Zn (30) are nearly equal, the lines are very weak and hard to measure. This is a classic way to check the state of an alloy after heat treatment."]].map(([t, b], i) => (
          <div key={i} style={{ flex: "1 1 320px", background: C.card, border: `1px solid ${[C.accent, C.sky][i]}66`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 800, color: [C.accent, C.sky][i], marginBottom: 8 }}>{t}</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.75 }}>{b}</div>
          </div>
        ))}
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
        q: "P1. Cu Kα₁ X선(λ = 154.06 pm)으로 NaCl 분말을 측정했더니 (200) 피크가 2θ = 31.70°에 나타났다. (a) d₂₀₀은? (b) 입방 격자 상수 a는? (c) 같은 시료의 (220) 피크는 2θ 몇 도에 나타나야 하는가?",
        s: "(a) θ = 15.85°이므로 d₂₀₀ = λ/(2 sin θ) = 154.06/(2 × 0.2731) = 282.0 pm. (b) d₂₀₀ = a/√4 = a/2이므로 a = 564.1 pm. 표의 값 5.63 Å과 맞습니다. (c) d₂₂₀ = a/√8 = 199.4 pm, sin θ = λ/(2d) = 0.3863, θ = 22.73°, 2θ = 45.45°. 측정한 2θ를 θ로 착각하지 않는 것이 핵심입니다.",
      },
      en: {
        q: "P1. With Cu Kα₁ X-rays (λ = 154.06 pm), the (200) peak of NaCl powder appears at 2θ = 31.70°. (a) What is d₂₀₀? (b) What is the cubic lattice constant a? (c) At what 2θ should the (220) peak of the same sample appear?",
        s: "(a) θ = 15.85°, so d₂₀₀ = λ/(2 sin θ) = 154.06/(2 × 0.2731) = 282.0 pm. (b) d₂₀₀ = a/√4 = a/2, so a = 564.1 pm, in line with the table value 5.63 Å. (c) d₂₂₀ = a/√8 = 199.4 pm, sin θ = λ/(2d) = 0.3863, θ = 22.73°, 2θ = 45.45°. The key is not to mistake the measured 2θ for θ.",
      },
    },
    {
      ko: {
        q: "P2. (a) 서로 닿는 같은 구로 BCC와 FCC를 채울 때 충전율을 유도하시오. (b) Cu는 FCC이고 a = 3.615 Å, 몰질량 63.55 g/mol이다. 밀도를 계산하고 실측값 8.96 g/cm³과 비교하시오.",
        s: "(a) BCC: 구는 체대각선을 따라 닿으므로 4r = √3a, 입방 세포당 원자 2개. 충전율 = 2 × (4/3)πr³/a³ = 2 × (4/3)π(√3/4)³ = √3π/8 = 0.680. FCC: 면대각선을 따라 닿으므로 4r = √2a, 원자 4개. 충전율 = 4 × (4/3)π(√2/4)³ = √2π/6 = 0.740. (b) ρ = 4M/(N_A a³) = 4 × 63.55/(6.022×10²³ × (3.615×10⁻⁸ cm)³) = 8.93 g/cm³. 실측값과 0.3% 이내로 맞습니다. 밀도와 XRD 격자 상수를 비교하면 결정 속 빈자리(공공)의 농도를 추정할 수 있습니다.",
      },
      en: {
        q: "P2. (a) Derive the packing fractions of BCC and FCC filled with touching identical spheres. (b) Cu is FCC with a = 3.615 Å and molar mass 63.55 g/mol. Compute its density and compare with the measured 8.96 g/cm³.",
        s: "(a) BCC: spheres touch along the body diagonal, 4r = √3a, with 2 atoms per cube; fraction = 2 × (4/3)πr³/a³ = 2 × (4/3)π(√3/4)³ = √3π/8 = 0.680. FCC: they touch along the face diagonal, 4r = √2a, with 4 atoms; fraction = 4 × (4/3)π(√2/4)³ = √2π/6 = 0.740. (b) ρ = 4M/(N_A a³) = 4 × 63.55/(6.022×10²³ × (3.615×10⁻⁸ cm)³) = 8.93 g/cm³, within 0.3% of the measured value. Comparing density with the XRD lattice constant is a way to estimate vacancy concentrations.",
      },
    },
    {
      ko: {
        q: "P3. (a) 축을 2a, 3a, 6a에서 자르는 면의 Miller 지수는? (b) a₁ 축을 a/2, a₂ 축을 a에서 자르고 a₃ 축과 평행한 면은? (c) a = 4.00 Å인 입방 격자에서 (321) 면의 간격은?",
        s: "(a) 절편 (2, 3, 6) → 역수 (1/2, 1/3, 1/6) → 6을 곱해 (321). (b) 절편 (½, 1, ∞) → 역수 (2, 1, 0) → (210). (c) d = a/√(9 + 4 + 1) = 4.00/√14 = 1.069 Å. 지수가 크면 면 간격이 좁고, 면 하나에 놓인 원자 밀도도 낮습니다.",
      },
      en: {
        q: "P3. (a) What are the Miller indices of a plane cutting the axes at 2a, 3a and 6a? (b) And of a plane cutting a₁ at a/2 and a₂ at a, parallel to a₃? (c) What is the (321) spacing in a cubic lattice with a = 4.00 Å?",
        s: "(a) Intercepts (2, 3, 6) → reciprocals (1/2, 1/3, 1/6) → multiply by 6: (321). (b) Intercepts (½, 1, ∞) → reciprocals (2, 1, 0) → (210). (c) d = a/√(9 + 4 + 1) = 4.00/√14 = 1.069 Å. Higher indices mean narrower spacing and fewer atoms per unit area of plane.",
      },
    },
    {
      ko: {
        q: "P4. FCC의 기본 벡터 a₁ = (a/2)(0,1,1), a₂ = (a/2)(1,0,1), a₃ = (a/2)(1,1,0)이다. (a) b₁을 계산하시오. (b) b₁, b₂, b₃이 BCC 격자를 이룸을 보이시오. (c) 제1 BZ의 부피는?",
        s: "(a) a₂ × a₃ = (a/2)²[(0·0 − 1·1), (1·1 − 1·0), (1·1 − 0·1)] = (a²/4)(−1, 1, 1). V_c = a₁·(a₂ × a₃) = (a/2)(a²/4)(0 + 1 + 1) = a³/4. 따라서 b₁ = 2π(a²/4)(−1,1,1)/(a³/4) = (2π/a)(−1, 1, 1). (b) 같은 방법으로 b₂ = (2π/a)(1, −1, 1), b₃ = (2π/a)(1, 1, −1). 이것은 입방 세포 변이 4π/a인 BCC의 기본 벡터와 같은 꼴입니다(BCC: (a′/2)(−1,1,1) 등, a′ = 4π/a). (c) V_BZ = (2π)³/V_c = 4(2π/a)³. 이 BZ가 면 14개의 깎은 팔면체입니다.",
      },
      en: {
        q: "P4. The FCC primitive vectors are a₁ = (a/2)(0,1,1), a₂ = (a/2)(1,0,1), a₃ = (a/2)(1,1,0). (a) Compute b₁. (b) Show that b₁, b₂, b₃ form a BCC lattice. (c) What is the volume of the first BZ?",
        s: "(a) a₂ × a₃ = (a/2)²[(0·0 − 1·1), (1·1 − 1·0), (1·1 − 0·1)] = (a²/4)(−1, 1, 1), and V_c = a₁·(a₂ × a₃) = (a/2)(a²/4)(0 + 1 + 1) = a³/4. So b₁ = 2π(a²/4)(−1,1,1)/(a³/4) = (2π/a)(−1, 1, 1). (b) Likewise b₂ = (2π/a)(1, −1, 1) and b₃ = (2π/a)(1, 1, −1): the primitive vectors of a BCC lattice with cube edge 4π/a (BCC: (a′/2)(−1,1,1) etc. with a′ = 4π/a). (c) V_BZ = (2π)³/V_c = 4(2π/a)³; this BZ is the 14-faced truncated octahedron.",
      },
    },
    {
      ko: {
        q: "P5. (Ewald 구) Cu(FCC, a = 3.61 Å)를 Cu Kα₁(λ = 1.5406 Å)로 측정한다. (a) 회절이 가능한 반사의 조건 |G| ≤ 2k를 N = h² + k² + l²에 대한 조건으로 바꾸시오. (b) 관측 가능한 반사는 몇 개이고, 가장 높은 각의 피크는 어디인가?",
        s: "(a) |G| = 2π√N/a, k = 2π/λ이므로 2π√N/a ≤ 4π/λ, 곧 N ≤ (2a/λ)² = (2 × 3.61/1.5406)² = 21.96. (b) FCC에서 허용되는 N은 3, 4, 8, 11, 12, 16, 19, 20이고 모두 21.96 이하이므로 8개입니다. 가장 높은 (420)(N = 20)은 sin θ = λ√20/(2a) = 0.9543, 2θ = 145.2°입니다. 파장이 짧은 Mo Kα를 쓰면 (2a/λ)²가 커져 훨씬 많은 반사를 볼 수 있습니다.",
      },
      en: {
        q: "P5. (Ewald sphere) Cu (FCC, a = 3.61 Å) is measured with Cu Kα₁ (λ = 1.5406 Å). (a) Turn the diffraction condition |G| ≤ 2k into a condition on N = h² + k² + l². (b) How many reflections are observable, and where is the highest-angle peak?",
        s: "(a) |G| = 2π√N/a and k = 2π/λ, so 2π√N/a ≤ 4π/λ, i.e. N ≤ (2a/λ)² = (2 × 3.61/1.5406)² = 21.96. (b) The FCC-allowed N are 3, 4, 8, 11, 12, 16, 19, 20, all below 21.96: eight reflections. The highest, (420) with N = 20, has sin θ = λ√20/(2a) = 0.9543 and 2θ = 145.2°. The shorter Mo Kα wavelength enlarges (2a/λ)² and reveals many more reflections.",
      },
    },
    {
      ko: {
        q: "P6. 다이아몬드 구조는 FCC 격자에 원자 2개((0,0,0), (¼,¼,¼))가 붙은 구조이다. (a) 구조 인자를 S = S_FCC × [1 + exp(−iπ(h + k + l)/2)]로 쓸 수 있음을 보이시오. (b) (111), (200), (220), (222)의 |S|/f를 구하시오.",
        s: "(a) 8개 원자 = FCC 4개 위치 각각에 (0,0,0)과 (¼,¼,¼)를 더한 것이므로, 합이 두 인자의 곱으로 나뉩니다. 두 번째 인자의 위상은 2π(h + k + l)/4 = π(h + k + l)/2입니다. (b) S_FCC = 4f(모두 같은 홀짝), 0(섞임). (111): 1 + e^(−i3π/2) = 1 + i, |·| = √2 → |S| = 4√2 f = 5.66f. (200): 1 + e^(−iπ) = 0 → 0. (220): 1 + e^(−i2π) = 2 → 8f. (222): 1 + e^(−i3π) = 0 → 0. FCC에서는 허용되던 (200)과 (222)가 사라지므로, Si의 분말 패턴에는 (111) 다음에 바로 (220)이 나옵니다.",
      },
      en: {
        q: "P6. The diamond structure is an FCC lattice with a two-atom basis at (0,0,0) and (¼,¼,¼). (a) Show that S = S_FCC × [1 + exp(−iπ(h + k + l)/2)]. (b) Find |S|/f for (111), (200), (220) and (222).",
        s: "(a) The eight atoms are the four FCC positions each combined with (0,0,0) and (¼,¼,¼), so the sum factorizes; the second factor carries the phase 2π(h + k + l)/4 = π(h + k + l)/2. (b) S_FCC = 4f (same parity) or 0 (mixed). (111): 1 + e^(−i3π/2) = 1 + i with modulus √2, so |S| = 4√2 f = 5.66f. (200): 1 + e^(−iπ) = 0. (220): 1 + e^(−i2π) = 2, so 8f. (222): 1 + e^(−i3π) = 0. The FCC-allowed (200) and (222) vanish, so in the powder pattern of Si (220) follows straight after (111).",
      },
    },
    {
      ko: {
        q: "P7. (지수 붙이기) 미지의 입방 금속을 Cu Kα₁로 측정했더니 처음 네 피크가 2θ = 38.47°, 44.72°, 65.09°, 78.22°였다. (a) 격자 종류를 정하시오. (b) 격자 상수는? (c) 어떤 금속일까?",
        s: "(a) sin²θ를 첫 피크로 나누면 1, 1.333, 2.667, 3.667입니다. 3을 곱하면 3, 4, 8, 11로, FCC의 (111), (200), (220), (311)과 같습니다. (BCC라면 1, 2, 3, 4, SC라면 1, 2, 3, 4, 5…가 나와야 합니다.) (b) a = λ√3/(2 sin 19.235°) = 1.5406 × 1.732/(2 × 0.3294) = 4.050 Å. (c) a ≈ 4.05 Å인 FCC 금속은 Al입니다(Kittel 표 4.05 Å). 실제 상 분석에서는 이렇게 얻은 격자 상수와 피크 세기를 데이터베이스(ICDD PDF)와 대조합니다.",
      },
      en: {
        q: "P7. (Indexing) An unknown cubic metal measured with Cu Kα₁ shows its first four peaks at 2θ = 38.47°, 44.72°, 65.09° and 78.22°. (a) Determine the lattice type. (b) What is the lattice constant? (c) Which metal might it be?",
        s: "(a) Dividing sin²θ by the first value gives 1, 1.333, 2.667, 3.667; multiplying by 3 gives 3, 4, 8, 11, the FCC sequence (111), (200), (220), (311). (BCC would give 1, 2, 3, 4 and SC 1, 2, 3, 4, 5, ….) (b) a = λ√3/(2 sin 19.235°) = 1.5406 × 1.732/(2 × 0.3294) = 4.050 Å. (c) An FCC metal with a ≈ 4.05 Å is Al (Kittel table: 4.05 Å). Real phase analysis compares such lattice constants and intensities with a database (the ICDD PDF).",
      },
    },
    {
      ko: {
        q: "P8. (촉매 공정) 탄소 담지 Pt 촉매의 Pt (111) 피크가 Cu Kα₁에서 2θ = 39.8°, 반치폭 2.0°로 측정되었다. (a) Scherrer 식(K = 0.9)으로 결정 크기를 구하시오. (b) 500시간 운전 뒤 반치폭이 1.0°로 줄었다. 무엇을 의미하는가? (c) 이 값을 입자 크기로 해석할 때 주의할 점은?",
        s: "(a) β = 2.0° = 0.03491 rad, cos θ = cos 19.9° = 0.9403. τ = 0.9 × 1.5406 Å/(0.03491 × 0.9403) = 42.2 Å = 4.2 nm. (b) τ = 8.4 nm로 결정이 두 배 커졌습니다. 입자가 뭉치거나(소결) Ostwald 숙성으로 자라 표면적이 줄었다는 뜻이며, 같은 Pt 양으로 내는 활성이 떨어집니다. (c) 장비 자체의 폭을 빼야 하고(표준 시료로 보정), 격자 변형도 피크를 넓힙니다. 또 Scherrer 크기는 '결정 영역'의 크기이므로, 여러 결정이 붙은 입자의 실제 크기(TEM)보다 작게 나올 수 있습니다.",
      },
      en: {
        q: "P8. (Catalysis) The Pt (111) peak of a carbon-supported Pt catalyst, measured with Cu Kα₁, sits at 2θ = 39.8° with a FWHM of 2.0°. (a) Use the Scherrer equation (K = 0.9) to find the crystallite size. (b) After 500 h of operation the FWHM has dropped to 1.0°. What does this mean? (c) What care is needed when reading this as a particle size?",
        s: "(a) β = 2.0° = 0.03491 rad and cos θ = cos 19.9° = 0.9403, so τ = 0.9 × 1.5406 Å/(0.03491 × 0.9403) = 42.2 Å = 4.2 nm. (b) τ = 8.4 nm: the crystallites have doubled in size through sintering or Ostwald ripening, the surface area has fallen, and the activity per gram of Pt drops. (c) Instrumental broadening must be subtracted (calibrate with a standard), lattice strain also broadens peaks, and the Scherrer size is that of a coherent crystalline domain, so it can be smaller than the true particle size (TEM) of polycrystalline particles.",
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
            ? "풀이를 열기 전에 스스로 풀어 보십시오. P1–P3은 Bragg 법칙, 충전율, Miller 지수, P4–P5는 역격자와 Ewald 구, P6은 구조 인자, P7–P8은 분말 XRD로 상을 찾고 촉매 입자 크기를 재는 응용입니다. 수치는 Raw 코드 탭의 Python·C++ 코드로 검산했습니다."
            : "Attempt each before opening the solution. P1–P3 cover Bragg's law, packing and Miller indices, P4–P5 the reciprocal lattice and the Ewald sphere, P6 the structure factor, and P7–P8 applications of powder XRD to phase identification and catalyst particle size. The numbers were checked with the Python and C++ codes in the Raw Codes tab."}
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
  crystal_geometry: {
    ko: "입방 격자·충전율·Miller 지수·Bragg 예제", en: "Cubic lattices · packing · Miller indices · Bragg example",
    codes: { python: PY_GEOM, matlab: ML_GEOM, julia: JL_GEOM, cpp: CPP_GEOM },
  },
  reciprocal_lattice: {
    ko: "역격자·BZ 면의 수·2D Wigner–Seitz·Fourier 계수", en: "Reciprocal lattice · BZ faces · 2D Wigner–Seitz · Fourier coefficients",
    codes: { python: PY_RECIP, matlab: ML_RECIP, julia: JL_RECIP, cpp: CPP_RECIP },
  },
  structure_factor: {
    ko: "구조 인자·소멸 규칙·NaCl과 KCl", en: "Structure factor · extinction rules · NaCl vs KCl",
    codes: { python: PY_SF, matlab: ML_SF, julia: JL_SF, cpp: CPP_SF },
  },
  powder_xrd: {
    ko: "분말 XRD 패턴·지수 붙이기·Scherrer 크기", en: "Powder XRD pattern · indexing · Scherrer size",
    codes: { python: PY_XRD, matlab: ML_XRD, julia: JL_XRD, cpp: CPP_XRD },
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
  const [topic, setTopic] = useState("crystal_geometry");
  const [cl, setCl] = useState("python");
  const [copied, setCopied] = useState(false);
  const code = CODE_TOPICS[topic].codes[cl];
  const fname = `wk13_${topic}.${LANG_META[cl].ext}`;

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
            ? "이 페이지의 인터랙티브 뒤에 있는 계산을 직접 실행해 볼 수 있는 독립 코드입니다. Python과 C++은 실행해 확인한 값입니다: 충전율 0.5236·0.6802·0.7405, 강의 예제 d₁₁₁ = 396.4 pm·a = 686.6 pm, d_hkl = a/√N과 2π/|G|의 일치, b_i·a_j = 2πδ_ij(오차 0), SC·BCC·FCC 제1 BZ의 면 6·12·14개와 부피 (2π)³/V_c, 2D Wigner–Seitz 세포 넓이 = 기본 세포 넓이, 가우스 원자 Fourier 계수의 해석해 일치(n₁ = 0.88132), 소멸 규칙(BCC N = 2, 4, 6…, FCC 3, 4, 8, 11…, 다이아몬드 3, 8, 11, 16…), KCl의 (111) 소멸, Cu (111) 43.38°·α-Fe (110) 44.61°·Si (111) 28.45°·NaCl (200) 31.76°, Cu (111) 반치폭 0.3°에서 Scherrer 크기 28.5 nm. MATLAB과 Julia 판은 같은 알고리즘을 옮긴 것입니다."
            : "Standalone codes for the calculations behind every interactive on this page. The Python and C++ versions were run and give: packing fractions 0.5236, 0.6802, 0.7405; the lecture example d₁₁₁ = 396.4 pm, a = 686.6 pm; d_hkl = a/√N matching 2π/|G|; b_i·a_j = 2πδ_ij (zero error); 6, 12 and 14 faces for the first BZ of SC, BCC and FCC with volume (2π)³/V_c; 2D Wigner–Seitz areas equal to the primitive-cell areas; Gaussian-atom Fourier coefficients matching the analytic form (n₁ = 0.88132); extinction rules (BCC N = 2, 4, 6, …, FCC 3, 4, 8, 11, …, diamond 3, 8, 11, 16, …); the vanishing (111) of KCl; Cu (111) 43.38°, α-Fe (110) 44.61°, Si (111) 28.45°, NaCl (200) 31.76°; and a Scherrer size of 28.5 nm for a 0.3° FWHM Cu (111) peak. The MATLAB and Julia versions port the same algorithms."}
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
