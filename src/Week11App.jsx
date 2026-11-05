// ============================================================
// Week11App.jsx — Reaction Dynamics, Electron Transfer & Lattice Vibrations
// Physical Chemistry 2 (물리화학 2)
// SKKU School of Chemical Engineering
// Smart Process & Materials Design Lab (SPMDL)
// Prof. S. Joon Kwon
// ------------------------------------------------------------
// Topics covered (Wk11 Part 1 / Part 2):
//   • Molecular beams, impact parameter b, deflection function theta(b),
//     differential cross section, rainbow and glory scattering
//   • Potential energy surfaces: LEPS surface for A + BC, saddle point,
//     classical trajectories, Polanyi rules (early vs late barrier)
//   • Electron transfer: bimolecular steady state, Marcus parabolas,
//     reorganization energy, inverted region, tunnelling distance
//   • Crystal vibrations: anharmonic potential, thermal expansion,
//     1D monatomic chain dispersion, Brillouin zone, mode counting,
//     phonons and heat capacity; diatomic chain, acoustic / optical
//     branches, band gap, 3D mode counting
// ============================================================
import { useState, useEffect, useRef, useMemo } from "react";
import {
  PY_SCAT, ML_SCAT, JL_SCAT, CPP_SCAT,
  PY_LEPS, ML_LEPS, JL_LEPS, CPP_LEPS,
  PY_MARCUS, ML_MARCUS, JL_MARCUS, CPP_MARCUS,
  PY_PHON, ML_PHON, JL_PHON, CPP_PHON,
} from "./Week11Codes";

// ── i18n ─────────────────────────────────────────────────────
const i18n = {
  ko: {
    weekTitle: "Week 11 — 반응 동역학과 결정 진동",
    subtitle: "분자선 산란 · 퍼텐셜 에너지 면 · Polanyi 규칙 · 전자 전달과 Marcus 이론 · 1D 결정 진동 · 포논",
    tabs: {
      overview: "개요",
      scattering: "분자선 & 산란",
      pes: "퍼텐셜 에너지 면",
      et: "전자 전달 & Marcus",
      chain: "1D 결정 진동",
      phonon: "이원자 사슬 & 포논",
      practice: "연습문제",
      codes: "Raw 코드",
    },
  },
  en: {
    weekTitle: "Week 11 — Reaction Dynamics & Lattice Vibrations",
    subtitle: "Molecular-beam scattering · Potential energy surfaces · Polanyi rules · Electron transfer & Marcus theory · 1D crystal vibrations · Phonons",
    tabs: {
      overview: "Overview",
      scattering: "Molecular Beams & Scattering",
      pes: "Potential Energy Surfaces",
      et: "Electron Transfer & Marcus",
      chain: "1D Crystal Vibrations",
      phonon: "Diatomic Chain & Phonons",
      practice: "Practice",
      codes: "Raw Codes",
    },
  },
};

// ── design tokens (Week 11 accent: orange) ───────────────────
const C = {
  bg: "#0b0f17",
  panel: "#111827",
  card: "#1f2937",
  border: "#374151",
  text: "#e5e7eb",
  textDim: "#9ca3af",
  accent: "#fb923c",
  accentSoft: "#fdba74",
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

// =============================================================
// MAIN COMPONENT
// =============================================================
export default function Week11App({ onBack, lang: langProp, onLangChange }) {
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
        {tab === "scattering" && <ScatterTab lang={lang} />}
        {tab === "pes" && <PesTab lang={lang} />}
        {tab === "et" && <EtTab lang={lang} />}
        {tab === "chain" && <ChainTab lang={lang} />}
        {tab === "phonon" && <PhononTab lang={lang} />}
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
    background: active ? "rgba(251,146,60,0.16)" : "transparent",
    color: active ? C.accentSoft : C.textDim,
    border: `1px solid ${active ? "rgba(251,146,60,0.45)" : "transparent"}`,
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
      tag: "Q1", color: C.accent, tab: "pes",
      ko: "같은 양의 에너지를 준다면, 분자를 빠르게 부딪치게 하는 것과 결합을 세게 진동시키는 것 중 어느 쪽이 반응을 더 잘 일으킬까?",
      en: "Given the same amount of energy, is a reaction driven better by a faster collision or by a more strongly vibrating bond?",
      hint: { ko: "답은 장벽이 어디에 있느냐에 달려 있다 → 퍼텐셜 에너지 면", en: "It depends on where the barrier sits → Potential Energy Surfaces" },
    },
    {
      tag: "Q2", color: C.sky, tab: "et",
      ko: "전자 전달 반응의 구동력(−ΔG°)을 계속 키우면 반응은 계속 빨라질까?",
      en: "If we keep increasing the driving force (−ΔG°) of an electron-transfer reaction, does it keep getting faster?",
      hint: { ko: "어느 지점부터는 오히려 느려진다 → 전자 전달 & Marcus", en: "Beyond a point it slows down → Electron Transfer & Marcus" },
    },
    {
      tag: "Q3", color: C.teal, tab: "phonon",
      ko: "원자 N개로 된 결정은 진동하는 방식이 몇 가지일까? 그리고 소금 결정은 왜 원적외선을 흡수할까?",
      en: "How many ways can a crystal of N atoms vibrate? And why does a salt crystal absorb far-infrared light?",
      hint: { ko: "자유도마다 모드 하나, 그리고 광학 포논 → 이원자 사슬 & 포논", en: "One mode per degree of freedom, and optical phonons → Diatomic Chain & Phonons" },
    },
  ];
  return (
    <div>
      <Card>
        <Hd>{isKo ? "이번 주의 질문" : "This week's questions"}</Hd>
        <Note>
          {isKo
            ? "9주차에는 충돌 이론과 전이 상태 이론으로 속도 상수를 구했습니다. 그때는 모든 충돌을 평균했습니다. 이번 주 전반부에서는 평균을 풀어 헤칩니다. 충돌 하나하나가 어떤 충격 매개변수로, 어떤 에너지 분배로 일어나는지를 봅니다. 후반부에서는 10주차의 Einstein 고체를 한 단계 발전시킵니다. 원자들이 용수철로 서로 연결되면 진동이 결정 전체로 퍼지는 파동, 곧 포논이 됩니다."
            : "In Week 9 we obtained rate constants from collision theory and transition-state theory, averaging over all collisions. In the first half of this week we take that average apart. We look at each collision: its impact parameter and how its energy is split. In the second half we extend the Einstein solid of Week 10. When the atoms are coupled by springs, vibrations become waves that travel through the whole crystal, the phonons."}
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
          <Stat label={isKo ? "강체구 산란의 미분 단면적 (지름 d)" : "Hard-sphere differential cross section (diameter d)"} value="dσ/dΩ = d²/4" color={C.accent} />
          <Stat label={isKo ? "LJ 무지개 각, 환산 에너지 E* = 2" : "LJ rainbow angle at reduced energy E* = 2"} value="−65.3° (b = 1.45σ)" color={C.accent} />
          <Stat label={isKo ? "H + H₂ LEPS 장벽 (Sato K = 0.136)" : "H + H₂ LEPS barrier (Sato K = 0.136)"} value="0.416 eV, r = 0.931 Å" color={C.sky} />
          <Stat label={isKo ? "물에서 확산 지배 속도 상수 8RT/3η" : "Diffusion-limited rate constant in water, 8RT/3η"} value="7.4×10⁹ M⁻¹ s⁻¹" color={C.sky} />
          <Stat label={isKo ? "Marcus 활성화 에너지 (λ = 1 eV, ΔG° = −0.5 eV)" : "Marcus activation energy (λ = 1 eV, ΔG° = −0.5 eV)"} value="ΔG‡ = 0.0625 eV" color={C.purple} />
          <Stat label={isKo ? "단백질 속 전자 터널링: 1.7 Å마다" : "Electron tunnelling in proteins: every 1.7 Å"} value={isKo ? "속도 1/10" : "rate ÷ 10"} color={C.purple} />
          <Stat label={isKo ? "원자 N개 1D 사슬의 정상 모드 수" : "Normal modes of a 1D chain of N atoms"} value="N" color={C.teal} />
          <Stat label={isKo ? "Si 광학 포논 Raman 진동수 (300 K)" : "Si optical-phonon Raman frequency (300 K)"} value="520.2 cm⁻¹" color={C.teal} />
        </StatGrid>
        <Note>
          {isKo
            ? "출처: H₃ 장벽의 정확한 ab initio 값 9.53–9.65 kcal/mol (0.413–0.418 eV)은 B. Liu, J. Chem. Phys. 80, 581 (1984). 단백질 터널링 규칙은 C. C. Moser, S. E. Chobot, C. C. Page, P. L. Dutton, Biochim. Biophys. Acta 1777, 1032 (2008). Si Raman 값은 J. H. Parker, D. W. Feldman, M. Ashkin, Phys. Rev. 155, 712 (1967)."
            : "Sources: the accurate ab initio H₃ barrier of 9.53–9.65 kcal/mol (0.413–0.418 eV) is from B. Liu, J. Chem. Phys. 80, 581 (1984). The protein tunnelling rule is from C. C. Moser, S. E. Chobot, C. C. Page and P. L. Dutton, Biochim. Biophys. Acta 1777, 1032 (2008). The Si Raman value is from J. H. Parker, D. W. Feldman and M. Ashkin, Phys. Rev. 155, 712 (1967)."}
        </Note>
      </Card>
    </div>
  );
}

function LectureMap({ isKo }) {
  const p1 = isKo
    ? [["분자선", "충격 매개변수 b, 편향각 θ(b), 미분 단면적"], ["반응성 충돌", "상태 대 상태 동역학, 적외선 화학 발광"], ["퍼텐셜 에너지 면", "안장점, 궤적, 인력형·반발형 면, Polanyi 규칙"], ["균일계 전자 전달", "정상 상태 속도식, Marcus 포물선, 역전 영역"]]
    : [["Molecular beams", "impact parameter b, deflection angle θ(b), differential cross section"], ["Reactive collisions", "state-to-state dynamics, infrared chemiluminescence"], ["Potential energy surfaces", "saddle point, trajectories, attractive vs repulsive surfaces, Polanyi rules"], ["Electron transfer in solution", "steady-state rate law, Marcus parabolas, inverted region"]];
  const p2 = isKo
    ? [["결정의 실제 퍼텐셜", "용수철 상수, 압축률, 음속, 열팽창"], ["1D 단원자 사슬", "분산 관계 ω(k), 역격자, Brillouin 영역, 모드 수"], ["포논", "양자화된 진동, 열용량"], ["1D 이원자 사슬", "음향·광학 가지, 띠 간격, 3D 모드 세기"]]
    : [["Real potential in a crystal", "spring constant, compressibility, speed of sound, thermal expansion"], ["1D monatomic chain", "dispersion ω(k), reciprocal lattice, Brillouin zone, mode count"], ["Phonons", "quantized vibrations, heat capacity"], ["1D diatomic chain", "acoustic and optical branches, band gap, 3D mode counting"]];
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
      {col(isKo ? "Part 1 · 충돌 이론과 반응 동역학" : "Part 1 · Collision theory for reaction dynamics", p1, C.accent)}
      {col(isKo ? "Part 2 · 고체 물리 입문: 결정 진동과 포논" : "Part 2 · Intro to solid-state physics: crystal vibrations and phonons", p2, C.teal)}
    </div>
  );
}

// =============================================================
// 2) MOLECULAR BEAMS & SCATTERING
// =============================================================
// reduced Lennard-Jones units: eps = sigma = reduced mass = 1
const ljV = r => 4 * (Math.pow(r, -12) - Math.pow(r, -6));
const ljF = r => 24 * (2 * Math.pow(r, -13) - Math.pow(r, -7));   // -dV/dr
function turningPoint(b, E) {
  const f = r => 1 - (b / r) * (b / r) - ljV(r) / E;
  const rmax = Math.max(5, 3 * b), n = 500, dr = (rmax - 0.5) / n;
  for (let i = 0; i < n; i++) {
    const r = rmax - i * dr;
    if (f(r) > 0 && f(r - dr) <= 0) {
      let lo = r - dr, hi = r;
      for (let k = 0; k < 60; k++) { const m = 0.5 * (lo + hi); if (f(m) > 0) hi = m; else lo = m; }
      return 0.5 * (lo + hi);
    }
  }
  return NaN;
}
function deflectionLJ(b, E, N = 400) {
  const r0 = turningPoint(b, E);
  if (!isFinite(r0)) return NaN;
  let s = 0;
  for (let i = 0; i < N; i++) {
    const w = (i + 0.5) / N, u = 1 - w * w;
    const g = 1 - Math.pow(b * u / r0, 2) - ljV(r0 / u) / E;
    s += 2 * w / Math.sqrt(Math.max(g, 1e-300));
  }
  return Math.PI - 2 * b / r0 * s / N;
}
const deflectionHS = b => (b < 1 ? 2 * Math.acos(b) : 0);
// observed scattering angle in [0, pi]
function observed(th) {
  let a = Math.abs(th) % (2 * Math.PI);
  return a > Math.PI ? 2 * Math.PI - a : a;
}
function ljTrajectory(b, E) {
  const v0 = Math.sqrt(2 * E), dt = 0.002, pts = [];
  let x = -4.5, y = b, vx = v0, vy = 0;
  for (let s = 0; s < 40000; s++) {
    const r = Math.hypot(x, y), F = ljF(Math.max(r, 0.6)) / r;
    vx += 0.5 * dt * F * x; vy += 0.5 * dt * F * y;
    x += dt * vx; y += dt * vy;
    const r2 = Math.hypot(x, y), F2 = ljF(Math.max(r2, 0.6)) / r2;
    vx += 0.5 * dt * F2 * x; vy += 0.5 * dt * F2 * y;
    if (s % 20 === 0) pts.push([x, y]);
    if (r2 > 5 && x * vx + y * vy > 0) break;
  }
  return pts;
}
function hsTrajectory(b) {
  if (b >= 1) return [[-4.5, b], [4.5, b]];
  const xc = -Math.sqrt(1 - b * b), th = 2 * Math.acos(b);
  const L = 5;
  return [[-4.5, b], [xc, b], [xc + L * Math.cos(th), b + L * Math.sin(th)]];
}

function ScatterTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <BeamCard isKo={isKo} />
      <DeflectionLab isKo={isKo} />
      <CrossSectionLab isKo={isKo} />
      <ReactiveCard isKo={isKo} />
    </div>
  );
}

function BeamCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "분자선: 충돌 하나를 따로 떼어 보기" : "Molecular beams: isolating a single collision"}</Hd>
      <Note>
        {isKo
          ? "오븐에서 나온 분자를 작은 구멍(skimmer)으로 걸러 내면 방향과 속도가 고른 분자선이 됩니다. 두 분자선을 진공 속에서 교차시키면, 분자는 평생 한 번만 충돌하고 검출기로 날아갑니다. 그래서 기체 실험에서 평균되어 사라지던 정보가 남습니다. 어느 방향으로 튕겨 나가는지, 어떤 상태로 나오는지를 직접 잴 수 있습니다."
          : "Molecules leaving an oven are filtered through a small aperture (a skimmer) into a beam with a well-defined direction and speed. When two beams cross in vacuum, each molecule collides at most once before it reaches the detector. Information that is averaged away in a bulk gas therefore survives: we can measure where the molecules go and in what states they emerge."}
      </Note>
      <HdSub>{isKo ? "핵심 정의" : "Key definitions"}</HdSub>
      <Eq>{isKo ? "충격 매개변수 b: 충돌이 없을 때 두 분자 중심이 가장 가까이 지나가는 거리" : "Impact parameter b: closest distance between the centres if there were no interaction"}</Eq>
      <Eq>dσ/dΩ = (dΩ {isKo ? "방향으로 산란되는 입자 수" : "scattered particles per unit time"}) / ({isKo ? "표적 입자당 입사 선속" : "incident flux per target particle"})  =  b / ( sin θ · |dθ/db| )</Eq>
      <Eq>θ(b) = π − 2b ∫_(r₀)^∞ dr / [ r² √(1 − b²/r² − V(r)/E) ]          σ = ∫ (dσ/dΩ) dΩ</Eq>
      <Note>
        {isKo
          ? "b가 작을수록 상호작용을 강하게 느끼므로 더 크게 꺾입니다. 고리 모양 넓이 2πb db로 들어온 입자가 입체각 2π sin θ dθ로 나가므로, 넓이를 보존하는 관계에서 위의 dσ/dΩ 식이 나옵니다. r₀는 근(根) 아래가 0이 되는 가장 가까운 접근 거리입니다."
          : "A smaller b means a stronger interaction and a larger deflection. Particles entering through the ring of area 2πb db leave into the solid angle 2π sin θ dθ; conserving this area gives the dσ/dΩ formula above. r₀ is the distance of closest approach, where the square root vanishes."}
      </Note>
    </Card>
  );
}

function DeflectionLab({ isKo }) {
  const [pot, setPot] = useState("lj");
  const [E, setE] = useState(2);
  const curve = useMemo(() => {
    const out = [];
    for (let i = 0; i <= 240; i++) {
      const b = 0.01 + i * (3 - 0.01) / 240;
      const th = pot === "hs" ? deflectionHS(b) : deflectionLJ(b, E, 300);
      out.push([b, th * 180 / Math.PI]);
    }
    return out;
  }, [pot, E]);
  const info = useMemo(() => {
    if (pot === "hs") return null;
    let iMin = 0;
    curve.forEach((p, i) => { if (isFinite(p[1]) && p[1] < curve[iMin][1]) iMin = i; });
    let glory = NaN;
    for (let i = 1; i < iMin; i++) if (curve[i - 1][1] > 0 && curve[i][1] <= 0) {
      const [b1, t1] = curve[i - 1], [b2, t2] = curve[i];
      glory = b1 + (b2 - b1) * t1 / (t1 - t2);
    }
    return { rainbow: curve[iMin][1], bR: curve[iMin][0], glory };
  }, [curve, pot]);
  const trajs = useMemo(() => {
    const bs = [];
    for (let b = 0.15; b <= 2.6; b += 0.18) bs.push(b);
    return bs.map(b => ({ b, pts: pot === "hs" ? hsTrajectory(b) : ljTrajectory(b, E) }));
  }, [pot, E]);

  const W = 520, Ht = 330, pad = 10;
  const sx = x => W / 2 + x * 55, sy = y => Ht / 2 - y * 55;
  const W2 = 520, H2 = 330, p2 = 46;
  const { X, Y } = plotScale(0, 3, -190, 190, W2, H2, p2);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ① 궤적과 편향 함수 θ(b)" : "Lab ① Trajectories and the deflection function θ(b)"}</Hd>
      <Row>
        <button style={btnStyle(pot === "hs")} onClick={() => setPot("hs")}>{isKo ? "강체구 (지름 d = σ)" : "Hard sphere (d = σ)"}</button>
        <button style={btnStyle(pot === "lj")} onClick={() => setPot("lj")}>Lennard-Jones</button>
        {pot === "lj" && <Slider label={isKo ? "환산 충돌 에너지 E* = E/ε" : "Reduced energy E* = E/ε"} value={E} min={0.9} max={10} step={0.1} onChange={setE} fmt={v => v.toFixed(1)} />}
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <svg viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <circle cx={sx(0)} cy={sy(0)} r={55} fill={`${C.accent}22`} stroke={C.accent} strokeDasharray="4 3" />
          <circle cx={sx(0)} cy={sy(0)} r={5} fill={C.accent} />
          {trajs.map(({ b, pts }, i) => (
            <path key={i} d={pts.map((p, j) => `${j ? "L" : "M"}${sx(p[0]).toFixed(1)} ${sy(p[1]).toFixed(1)}`).join(" ")}
              fill="none" stroke={`hsl(${200 + i * 9},80%,${55 + (i % 3) * 6}%)`} strokeWidth={1.4} />
          ))}
          <text x={pad} y={18} fill={C.textDim} fontSize={11}>{isKo ? "점선 원: r = σ. 위에서부터 b가 큰 순서" : "dashed circle: r = σ; top lines have the largest b"}</text>
        </svg>
        <svg viewBox={`0 0 ${W2} ${H2}`} style={svgBox(W2)}>
          <Axes W={W2} Ht={H2} pad={p2} xlabel={isKo ? "충격 매개변수 b/σ" : "impact parameter b/σ"} ylabel="θ (deg)" />
          {[-180, -90, 0, 90, 180].map(v => (
            <g key={v}>
              <line x1={p2} x2={W2 - p2} y1={Y(v)} y2={Y(v)} stroke="#1f2937" />
              <text x={p2 - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>
            </g>
          ))}
          {[0, 1, 2, 3].map(v => <text key={v} x={X(v)} y={H2 - p2 + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
          <path d={pathOf(curve.filter(p => isFinite(p[1])).map(([b, t]) => [b, Math.max(-190, Math.min(190, t))]), X, Y)} fill="none" stroke={C.accent} strokeWidth={2} />
          {info && <circle cx={X(info.bR)} cy={Y(Math.max(-190, info.rainbow))} r={5} fill={C.pink} />}
          {info && isFinite(info.glory) && <circle cx={X(info.glory)} cy={Y(0)} r={5} fill={C.sky} />}
        </svg>
      </div>
      {info ? (
        <StatGrid>
          <Stat label={isKo ? "무지개 각 θ_r (분홍 점)" : "Rainbow angle θ_r (pink)"} value={`${info.rainbow.toFixed(1)}°`} color={C.pink} />
          <Stat label={isKo ? "무지개 충격 매개변수 b_r" : "Rainbow impact parameter b_r"} value={`${info.bR.toFixed(3)} σ`} color={C.pink} />
          <Stat label={isKo ? "영광 산란 θ = 0 (하늘색 점)" : "Glory, θ = 0 (blue)"} value={isFinite(info.glory) ? `b = ${info.glory.toFixed(3)} σ` : "—"} color={C.sky} />
          <Stat label={isKo ? "궤도 운동 (E* < 0.8)" : "Orbiting (E* < 0.8)"} value={E < 0.8 ? (isKo ? "가능" : "possible") : (isKo ? "없음" : "none")} color={C.textDim} />
        </StatGrid>
      ) : (
        <StatGrid>
          <Stat label={isKo ? "강체구 편향각" : "Hard-sphere deflection"} value="θ = 2 arccos(b/d)" color={C.accent} />
          <Stat label={isKo ? "미분 단면적 (모든 방향)" : "Differential cross section (all angles)"} value="d²/4" color={C.accent} />
          <Stat label={isKo ? "전체 단면적" : "Total cross section"} value="σ = πd²" color={C.accent} />
        </StatGrid>
      )}
      <Note>
        {isKo
          ? "LJ 퍼텐셜에서 큰 b의 분자는 인력에 끌려 음의 각도로 꺾이고, 작은 b의 분자는 반발벽에 튕겨 양의 각도로 나갑니다. 두 효과가 겹치는 곳에서 θ(b)가 최솟값을 가집니다. 그 근처의 넓은 b 범위가 거의 같은 각도로 모이므로 그 각도에서 산란 세기가 커집니다. 이것이 무지개 산란입니다. 햇빛이 물방울 속에서 꺾일 때 특정 각도에 빛이 모이는 것과 같은 수학입니다. E*를 키우면 무지개 각이 작아지는 것을 확인해 보십시오(E* = 2, 5, 10에서 −65.3°, −24.1°, −11.8°)."
          : "With the LJ potential, molecules at large b are pulled in by the attraction and deflected to negative angles, while those at small b bounce off the repulsive wall to positive angles. Where the two effects compete, θ(b) has a minimum. A wide range of b near that minimum is sent to nearly the same angle, so the scattered intensity piles up there: rainbow scattering. The mathematics is the same as sunlight bent inside raindrops. Raise E* and watch the rainbow angle shrink (−65.3°, −24.1° and −11.8° at E* = 2, 5 and 10)."}
      </Note>
    </Card>
  );
}

function CrossSectionLab({ isKo }) {
  const [pot, setPot] = useState("lj");
  const [E, setE] = useState(2);
  const data = useMemo(() => {
    const bmax = pot === "hs" ? 1 : 3, nb = 500, grid = [];
    for (let i = 0; i <= nb; i++) {
      const b = 1e-3 + i * (bmax - 1e-3) / nb;
      grid.push(pot === "hs" ? deflectionHS(b) : deflectionLJ(b, E, 200));
    }
    const nbins = 45, counts = new Array(nbins).fill(0), n = 60000;
    const rng = makeRng(7);
    for (let s = 0; s < n; s++) {
      const b = bmax * Math.sqrt(rng());
      const f = (b - 1e-3) / (bmax - 1e-3) * nb, i = Math.min(nb - 1, Math.floor(f));
      const th = grid[i] + (grid[i + 1] - grid[i]) * (f - i);
      if (!isFinite(th)) continue;
      const a = observed(th) * 180 / Math.PI;
      if (a < 4) continue;
      counts[Math.min(nbins - 1, Math.floor((a - 4) / (176 / nbins)))]++;
    }
    let gmin = 1e9;
    grid.forEach(g => { if (isFinite(g) && g < gmin) gmin = g; });
    const thetaR = pot === "hs" ? NaN : observed(gmin) * 180 / Math.PI;
    const bars = counts.map((c, k) => {
      const t1 = (4 + k * 176 / nbins) * Math.PI / 180, t2 = (4 + (k + 1) * 176 / nbins) * Math.PI / 180;
      const dsdo = Math.PI * bmax * bmax * c / n / (2 * Math.PI * (Math.cos(t1) - Math.cos(t2)));
      return [(t1 + t2) / 2 * 180 / Math.PI, dsdo];
    });
    return { bars, thetaR };
  }, [pot, E]);
  const W = 640, Ht = 300, pad = 50;
  const ys = data.bars.filter(d => d[1] > 0).map(d => Math.log10(d[1]));
  const yMin = Math.min(-2, Math.floor(Math.min(...ys))), yMax = Math.max(1, Math.ceil(Math.max(...ys)));
  const { X, Y } = plotScale(0, 180, yMin, yMax, W, Ht, pad);
  const bw = (X(176 / 45) - X(0));
  return (
    <Card>
      <Hd>{isKo ? "실험실 ② 미분 단면적: 검출기가 보는 것" : "Lab ② Differential cross section: what the detector sees"}</Hd>
      <Note>
        {isKo
          ? "충격 매개변수가 고르게 분포한 분자 60 000개를 쏘아 보낸 뒤, 나가는 각도를 히스토그램으로 모아 dσ/dΩ로 환산했습니다(세로축은 로그). 강체구는 모든 방향에서 d²/4 = 0.25로 평평합니다. LJ에서는 작은 각도의 전방 산란이 가장 세고, 그 위로 무지개 각(분홍 점선) 바로 안쪽에 작은 봉우리가 생긴 뒤 무지개 각을 넘으면 세기가 뚝 떨어집니다. 무지개 각보다 큰 각도로는 인력에 의한 산란이 갈 수 없기 때문입니다. 고전역학에서는 이 봉우리가 무한대로 발산하지만, 실제 실험에서는 양자 간섭 때문에 진동하는 유한한 봉우리로 보입니다."
          : "We fire 60 000 molecules with uniformly distributed impact parameters, histogram the exit angles and convert to dσ/dΩ (log scale). The hard sphere is flat at d²/4 = 0.25 in every direction. For LJ the small-angle forward scattering is strongest; above it a small peak appears just inside the rainbow angle (pink dashed line), and beyond the rainbow angle the intensity drops sharply, because attractive scattering cannot reach larger angles. Classically the peak diverges; real experiments see a finite peak with oscillations caused by quantum interference."}
      </Note>
      <Row>
        <button style={btnStyle(pot === "hs")} onClick={() => setPot("hs")}>{isKo ? "강체구" : "Hard sphere"}</button>
        <button style={btnStyle(pot === "lj")} onClick={() => setPot("lj")}>Lennard-Jones</button>
        {pot === "lj" && <Slider label="E*" value={E} min={1} max={10} step={0.5} onChange={setE} fmt={v => v.toFixed(1)} />}
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "산란각 θ (deg)" : "scattering angle θ (deg)"} ylabel="log₁₀(dσ/dΩ) [σ²/sr]" />
        {[0, 45, 90, 135, 180].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        {Array.from({ length: yMax - yMin + 1 }, (_, i) => yMin + i).map(v => (
          <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>
        ))}
        {data.bars.map(([t, d], i) => d > 0 && (
          <rect key={i} x={X(t) - bw / 2 + 0.5} y={Y(Math.log10(d))} width={Math.max(1, bw - 1)} height={Math.max(0, Y(yMin) - Y(Math.log10(d)))}
            fill={`${C.accent}aa`} />
        ))}
        {isFinite(data.thetaR) && <line x1={X(data.thetaR)} x2={X(data.thetaR)} y1={Y(yMax)} y2={Y(yMin)} stroke={C.pink} strokeDasharray="5 4" />}
        {isFinite(data.thetaR) && <text x={X(data.thetaR) + 5} y={Y(yMax) + 12} fill={C.pink} fontSize={11}>{isKo ? `무지개 각 ${data.thetaR.toFixed(1)}°` : `rainbow ${data.thetaR.toFixed(1)}°`}</text>}
        {pot === "hs" && <line x1={X(0)} x2={X(180)} y1={Y(Math.log10(0.25))} y2={Y(Math.log10(0.25))} stroke={C.sky} strokeDasharray="5 4" />}
      </svg>
    </Card>
  );
}

function ReactiveCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "반응성 충돌: 생성물이 어떤 상태로 나오는가" : "Reactive collisions: in which states do the products appear?"}</Hd>
      <Note>
        {isKo
          ? "분자선 실험은 반응이 일어났는지뿐 아니라 생성물이 어떤 진동·회전 상태로, 어느 방향으로 나오는지까지 보여 줍니다. 이를 상태 대 상태(state-to-state) 동역학이라 부릅니다. 대표적인 예가 적외선 화학 발광입니다. O + CS → CO + S 반응에서 나온 CO는 Boltzmann 분포가 아니라 높은 진동 준위에 몰려 있습니다. 그래서 들뜬 CO가 내는 적외선 스펙트럼을 재면 반응 직후의 비평형 분포를 읽을 수 있습니다. 진동 준위의 밀도 반전이 충분하면 레이저가 됩니다(화학 레이저)."
          : "Molecular-beam experiments reveal not only whether a reaction happened but also the vibrational and rotational states and directions of the products: state-to-state dynamics. A classic example is infrared chemiluminescence. The CO formed in O + CS → CO + S is not Boltzmann distributed; it is concentrated in high vibrational levels. Measuring the infrared emission of the excited CO reveals this non-equilibrium distribution right after the reaction. If the population inversion is large enough, the system lases (a chemical laser)."}
      </Note>
      <StatGrid min={240}>
        <Stat label={isKo ? "9주차 충돌 이론" : "Week 9 collision theory"} value={isKo ? "모든 b와 에너지를 평균한 k(T)" : "k(T) averaged over b and energy"} color={C.textDim} />
        <Stat label={isKo ? "이번 주 분자선" : "This week: molecular beams"} value={isKo ? "b, θ, 생성물 상태를 하나씩" : "b, θ and product states one by one"} color={C.accent} />
        <Stat label={isKo ? "다음 단계" : "Next step"} value={isKo ? "퍼텐셜 에너지 면 위의 궤적" : "trajectories on a potential energy surface"} color={C.sky} />
      </StatGrid>
    </Card>
  );
}

// =============================================================
// 3) POTENTIAL ENERGY SURFACES (LEPS, collinear A + BC)
// =============================================================
// units: eV, Angstrom, amu  ->  time unit = 10.18 fs
const LEPS = { B: 1.942, RE: 0.742, K: 0.136, M: 1.00784, TU: 10.1805 };
const SURFS = {
  symmetric: { D: [4.746, 4.746, 4.746], ko: "대칭 H + H₂", en: "Symmetric H + H₂", barrier: 0.416, saddle: [0.931, 0.931] },
  early: { D: [5.5, 4.746, 4.746], ko: "이른 장벽 (발열, ΔE = −0.75 eV)", en: "Early barrier (exothermic, ΔE = −0.75 eV)", barrier: 0.168, saddle: [1.181, 0.801] },
  late: { D: [4.746, 5.5, 4.746], ko: "늦은 장벽 (흡열, ΔE = +0.75 eV)", en: "Late barrier (endothermic, ΔE = +0.75 eV)", barrier: 0.922, saddle: [0.801, 1.181] },
};
function lepsQJ(r, D) {
  const { B, RE, K } = LEPS, e1 = Math.exp(-B * (r - RE)), e2 = e1 * e1, c = D / 4 / (1 + K);
  return [c * ((3 + K) * e2 - (2 + 6 * K) * e1), c * ((1 + 3 * K) * e2 - (6 + 2 * K) * e1),
    c * (-2 * B * (3 + K) * e2 + B * (2 + 6 * K) * e1), c * (-2 * B * (1 + 3 * K) * e2 + B * (6 + 2 * K) * e1)];
}
function lepsV(r1, r2, D) {
  const [Q1, J1, dQ1, dJ1] = lepsQJ(r1, D[0]), [Q2, J2, dQ2, dJ2] = lepsQJ(r2, D[1]), [Q3, J3, dQ3, dJ3] = lepsQJ(r1 + r2, D[2]);
  const S = Math.sqrt(0.5 * ((J1 - J2) ** 2 + (J2 - J3) ** 2 + (J3 - J1) ** 2)) + 1e-14;
  const s1 = (2 * J1 - J2 - J3) / (2 * S), s2 = (2 * J2 - J1 - J3) / (2 * S), s3 = (2 * J3 - J1 - J2) / (2 * S);
  return [Q1 + Q2 + Q3 - S, dQ1 + dQ3 - s1 * dJ1 - s3 * dJ3, dQ2 + dQ3 - s2 * dJ2 - s3 * dJ3];
}
function runTrajectory(D, Et, Ev, phase, keep) {
  const { B, RE, M } = LEPS, mu = M / 2, w = B * Math.sqrt(2 * D[1] / mu), A = Math.sqrt(2 * Ev / (mu * w * w));
  const r20 = RE + A * Math.cos(phase), vr = -A * w * Math.sin(phase), vrel = Math.sqrt(2 * Et / (2 * M / 3));
  const x = [-4, 0, r20], v = [2 * vrel / 3, -vr / 2 - vrel / 3, vr / 2 - vrel / 3], f = [0, 0, 0];
  const force = () => { const g = lepsV(x[1] - x[0], x[2] - x[1], D); f[0] = g[1]; f[1] = -g[1] + g[2]; f[2] = -g[2]; };
  force();
  const dt = 0.002, path = [];
  for (let s = 0; s < 7500; s++) {
    for (let i = 0; i < 3; i++) { v[i] += 0.5 * dt * f[i] / M; x[i] += dt * v[i]; }
    force();
    for (let i = 0; i < 3; i++) v[i] += 0.5 * dt * f[i] / M;
    const a = x[1] - x[0], b = x[2] - x[1];
    if (keep && s % 8 === 0) path.push([a, b]);
    if (a > 5 && b < 2) return { out: 0, path };
    if (b > 5 && a < 2) return { out: 1, path };
  }
  return { out: 0.5, path };
}
function reactionProb(D, Et, Ev, n = 24) {
  let P = 0;
  for (let k = 0; k < n; k++) P += runTrajectory(D, Et, Ev, 2 * Math.PI * k / n, false).out;
  return P / n;
}
const H2_HW = 0.5449;   // eV, harmonic quantum of the LEPS H2 well (4395 cm^-1)

function PesTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <PesConceptCard isKo={isKo} />
      <PesLab isKo={isKo} />
      <PolanyiLab isKo={isKo} />
      <SurfaceShapeCard isKo={isKo} />
    </div>
  );
}

function PesConceptCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "퍼텐셜 에너지 면: 반응이 지나가는 지형도" : "Potential energy surface: the landscape a reaction crosses"}</Hd>
      <Note>
        {isKo
          ? "Born–Oppenheimer 근사에서는 전자가 핵보다 훨씬 빨리 움직입니다. 그래서 핵의 배치마다 전자 에너지 하나가 정해지고, 이것이 핵이 움직이는 퍼텐셜이 됩니다. A + BC → AB + C가 일직선 위에서 일어나면 변수는 두 결합 거리 r_AB, r_BC뿐입니다. 따라서 V(r_AB, r_BC)를 등고선 지도로 그릴 수 있습니다. 반응물 골짜기(r_AB 큼)에서 생성물 골짜기(r_BC 큼)로 가는 가장 낮은 길이 반응 경로이고, 그 길의 가장 높은 점이 안장점, 곧 9주차의 전이 상태입니다."
          : "In the Born–Oppenheimer approximation the electrons move much faster than the nuclei, so each nuclear arrangement has one electronic energy, which becomes the potential for nuclear motion. For a collinear A + BC → AB + C reaction the only variables are r_AB and r_BC, so V(r_AB, r_BC) can be drawn as a contour map. The lowest path from the reactant valley (large r_AB) to the product valley (large r_BC) is the reaction path, and its highest point is the saddle point: the transition state of Week 9."}
      </Note>
      <Eq>LEPS: V = Q_AB + Q_BC + Q_AC − √( ½[(J_AB − J_BC)² + (J_BC − J_AC)² + (J_AC − J_AB)²] )</Eq>
      <Eq>Q, J ∝ D [ (3+K, 1+3K) e^(−2β(r−r_e)) − (2+6K, 6+2K) e^(−β(r−r_e)) ] / 4(1+K)</Eq>
      <Note>
        {isKo
          ? "Q는 쿨롱 적분, J는 교환 적분에 해당합니다. 원자 하나가 멀리 떨어지면 V는 남은 두 원자의 Morse 퍼텐셜이 됩니다. H₂ 값은 D = 4.746 eV, β = 1.942 Å⁻¹, r_e = 0.742 Å입니다. Sato 매개변수 K = 0.136으로 두면 안장점이 r = 0.931 Å, 장벽이 0.416 eV에 놓입니다. 정확한 ab initio 계산의 0.413–0.418 eV(B. Liu, 1984)와 맞는 값입니다. '이른'·'늦은' 장벽 면은 D_AB만 바꾼 교육용 모형입니다."
          : "Q plays the role of the Coulomb integral and J of the exchange integral. When one atom is far away, V reduces to the Morse potential of the remaining pair. For H₂, D = 4.746 eV, β = 1.942 Å⁻¹ and r_e = 0.742 Å. With the Sato parameter K = 0.136, the saddle sits at r = 0.931 Å with a 0.416 eV barrier, consistent with the accurate ab initio 0.413–0.418 eV (B. Liu, 1984). The 'early' and 'late' surfaces are teaching models that change only D_AB."}
      </Note>
    </Card>
  );
}

function PesLab({ isKo }) {
  const [surf, setSurf] = useState("symmetric");
  const [Et, setEt] = useState(0.5);
  const [Ev, setEv] = useState(0.27);
  const [phase, setPhase] = useState(0);
  const [res, setRes] = useState(null);
  const [frame, setFrame] = useState(0);
  const [prob, setProb] = useState(null);
  const canvasRef = useRef(null);
  const S = SURFS[surf];
  const W = 420, R0 = 0.5, R1 = 3.0;
  const toPx = r => (r - R0) / (R1 - R0) * W;

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d"), img = ctx.createImageData(W, W), D = S.D, ref = -D[1];
    const stops = [[13, 8, 135], [84, 2, 163], [139, 10, 165], [185, 50, 137], [219, 92, 104], [244, 136, 73], [254, 188, 43], [240, 249, 33]];
    const cmap = f => { const x = Math.max(0, Math.min(1, f)) * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(x)), u = x - i; return stops[i].map((c, j) => c + (stops[i + 1][j] - c) * u); };
    const Emin = -0.8, Emax = 2.0, lv = new Float32Array(W * W);
    for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
      const r1 = R0 + (i + 0.5) / W * (R1 - R0), r2 = R0 + (W - j - 0.5) / W * (R1 - R0);
      lv[j * W + i] = lepsV(r1, r2, D)[0] - ref;
    }
    for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
      const e = lv[j * W + i], k = (j * W + i) * 4, band = Math.floor(e / 0.1);
      const edge = e < Emax && ((i + 1 < W && Math.floor(lv[j * W + i + 1] / 0.1) !== band) || (j + 1 < W && Math.floor(lv[(j + 1) * W + i] / 0.1) !== band));
      const [r, g, b] = e >= Emax ? [250, 250, 245] : cmap((e - Emin) / (Emax - Emin));
      const d = edge ? 0.45 : 1;
      img.data[k] = r * d; img.data[k + 1] = g * d; img.data[k + 2] = b * d; img.data[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [surf]);

  useEffect(() => {
    if (!res) return;
    let id, f = 0;
    const step = () => { f = Math.min(res.path.length, f + 6); setFrame(f); if (f < res.path.length) id = requestAnimationFrame(step); };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [res]);

  const fire = () => { setProb(null); setRes(runTrajectory(S.D, Et, Ev, phase, true)); setFrame(0); };
  const batch = () => { setProb("…"); setTimeout(() => setProb(reactionProb(S.D, Et, Ev, 24)), 20); };
  const pts = res ? res.path.slice(0, frame).filter(([a, b]) => a < R1 + 0.5 && b < R1 + 0.5) : [];
  const outLabel = res && frame >= res.path.length
    ? (res.out === 1 ? (isKo ? "반응함: AB + C" : "Reactive: AB + C") : res.out === 0 ? (isKo ? "되튐: A + BC" : "Non-reactive: A + BC") : (isKo ? "시간 안에 결정 안 됨" : "Undecided"))
    : "";
  return (
    <Card>
      <Hd>{isKo ? "실험실 ③ LEPS 면 위의 고전 궤적" : "Lab ③ Classical trajectories on a LEPS surface"}</Hd>
      <Row>
        {Object.entries(SURFS).map(([k, s]) => (
          <button key={k} style={btnStyle(surf === k)} onClick={() => { setSurf(k); setRes(null); setProb(null); }}>{isKo ? s.ko : s.en}</button>
        ))}
      </Row>
      <Row>
        <Slider label={isKo ? "병진 에너지 E_trans" : "Translational energy E_trans"} value={Et} min={0.02} max={1.6} step={0.02} onChange={setEt} unit=" eV" fmt={v => v.toFixed(2)} />
        <Slider label={isKo ? "BC 진동 에너지 E_vib" : "BC vibrational energy E_vib"} value={Ev} min={0} max={1.6} step={0.02} onChange={setEv} unit=" eV" fmt={v => v.toFixed(2)} />
        <Slider label={isKo ? "진동 위상" : "Vibrational phase"} value={phase} min={0} max={6.28} step={0.05} onChange={setPhase} fmt={v => v.toFixed(2)} />
      </Row>
      <Row>
        <button style={btnStyle(true)} onClick={fire}>{isKo ? "▶ 궤적 하나 쏘기" : "▶ Fire one trajectory"}</button>
        <button style={btnStyle()} onClick={batch}>{isKo ? "위상 24개로 반응 확률 계산" : "Reaction probability over 24 phases"}</button>
        <span style={{ fontSize: 12, color: C.textDim }}>{isKo ? `참고: H₂ 영점 에너지 ½ħω = ${(H2_HW / 2).toFixed(3)} eV, v = 1이면 ${(1.5 * H2_HW).toFixed(3)} eV` : `Reference: H₂ zero-point energy ½ħω = ${(H2_HW / 2).toFixed(3)} eV; v = 1 gives ${(1.5 * H2_HW).toFixed(3)} eV`}</span>
      </Row>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: W }}>
          <canvas ref={canvasRef} width={W} height={W} style={{ width: "100%", borderRadius: 10, border: `1px solid ${C.border}`, display: "block" }} />
          <svg viewBox={`0 0 ${W} ${W}`} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}>
            <circle cx={toPx(S.saddle[0])} cy={W - toPx(S.saddle[1])} r={6} fill="none" stroke="#22d3ee" strokeWidth={2} />
            <text x={toPx(S.saddle[0]) + 9} y={W - toPx(S.saddle[1]) - 8} fill="#22d3ee" fontSize={13} fontWeight={700}>‡</text>
            {pts.length > 1 && <path d={pts.map(([a, b], i) => `${i ? "L" : "M"}${toPx(a).toFixed(1)} ${(W - toPx(b)).toFixed(1)}`).join(" ")} fill="none" stroke="#22d3ee" strokeWidth={2} />}
            <text x={W - 8} y={W - 10} fill="#0b0f17" stroke="#ffffff" strokeWidth={3} paintOrder="stroke" fontWeight={700} fontSize={12} textAnchor="end">r_AB →</text>
            <text x={8} y={16} fill="#0b0f17" stroke="#ffffff" strokeWidth={3} paintOrder="stroke" fontWeight={700} fontSize={12}>↑ r_BC</text>
            <text x={W - 10} y={W - toPx(0.74) - 6} fill="#0b0f17" stroke="#ffffff" strokeWidth={3} paintOrder="stroke" fontWeight={700} fontSize={11} textAnchor="end">{isKo ? "반응물 A + BC" : "reactants A + BC"}</text>
            <text x={toPx(0.74) + 8} y={24} fill="#0b0f17" stroke="#ffffff" strokeWidth={3} paintOrder="stroke" fontWeight={700} fontSize={11}>{isKo ? "생성물 AB + C" : "products AB + C"}</text>
          </svg>
        </div>
        <div style={{ flex: "1 1 280px" }}>
          <StatGrid min={200}>
            <Stat label={isKo ? "장벽 높이 (반응물 바닥 기준)" : "Barrier height (from reactant minimum)"} value={`${S.barrier.toFixed(3)} eV`} color={C.accent} />
            <Stat label={isKo ? "안장점 (r_AB, r_BC)" : "Saddle (r_AB, r_BC)"} value={`${S.saddle[0].toFixed(3)}, ${S.saddle[1].toFixed(3)} Å`} color={C.accent} />
            <Stat label={isKo ? "총에너지 E_trans + E_vib" : "Total energy E_trans + E_vib"} value={`${(Et + Ev).toFixed(2)} eV`} color={C.sky} />
            <Stat label={isKo ? "궤적 결과" : "Trajectory outcome"} value={outLabel || "—"} color={res && res.out === 1 ? C.ok : C.textDim} />
            <Stat label={isKo ? "반응 확률 (위상 24개 평균)" : "Reaction probability (24 phases)"} value={prob === null ? "—" : typeof prob === "string" ? prob : prob.toFixed(2)} color={C.ok} />
          </StatGrid>
          <Note>
            {isKo
              ? "등고선은 0.1 eV 간격이고, 반응물 바닥 기준 2 eV 이상은 흰색으로 남겼습니다. 하늘색 원이 안장점(‡), 하늘색 선이 궤적입니다. 궤적의 지그재그는 BC 결합의 진동이고, 생성물 골짜기에서의 지그재그는 새로 생긴 AB의 진동입니다. 총에너지가 장벽보다 높아도 반응하지 않는 궤적이 있습니다. 장벽을 넘으려면 에너지의 양뿐 아니라 '어느 방향'의 운동인지가 중요하기 때문입니다."
              : "Contours are 0.1 eV apart; regions more than 2 eV above the reactant minimum are left white. The cyan circle marks the saddle point (‡) and the cyan line is the trajectory. The zigzag in the reactant valley is the BC vibration; in the product valley it is the newly formed AB vibration. Some trajectories fail even when the total energy exceeds the barrier, because crossing it depends not only on how much energy there is but also on the direction of the motion."}
          </Note>
        </div>
      </div>
    </Card>
  );
}

function PolanyiLab({ isKo }) {
  const [rows, setRows] = useState(null);
  const run = () => {
    setRows("…");
    setTimeout(() => {
      const out = [];
      [["early", 0.45], ["late", 1.3]].forEach(([s, tot]) => {
        [0.9, 0.5, 0.1].forEach(f => out.push({ s, Et: tot * f, Ev: tot * (1 - f), P: reactionProb(SURFS[s].D, tot * f, tot * (1 - f), 24) }));
      });
      setRows(out);
    }, 20);
  };
  return (
    <Card>
      <Hd>{isKo ? "실험실 ④ Polanyi 규칙: 같은 에너지, 다른 분배" : "Lab ④ Polanyi rules: same energy, different split"}</Hd>
      <Note>
        {isKo
          ? "총에너지를 고정하고 병진과 진동에 나누는 비율만 바꿉니다. 이른 장벽은 0.45 eV, 늦은 장벽은 1.30 eV를 씁니다. 각 조건에서 진동 위상 24개로 궤적을 쏘아 반응 확률을 셉니다."
          : "Fix the total energy and change only how it is split between translation and vibration: 0.45 eV for the early barrier and 1.30 eV for the late barrier. Each condition fires 24 trajectories with different vibrational phases."}
      </Note>
      <button style={btnStyle(true)} onClick={run}>{isKo ? "▶ 실험 실행" : "▶ Run the experiment"}</button>
      {rows === "…" && <Note>{isKo ? "계산 중…" : "Computing…"}</Note>}
      {Array.isArray(rows) && (
        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table style={{ borderCollapse: "collapse", fontSize: 13.5, minWidth: 480 }}>
            <thead>
              <tr>{(isKo ? ["면", "E_trans (eV)", "E_vib (eV)", "반응 확률"] : ["Surface", "E_trans (eV)", "E_vib (eV)", "P_react"]).map(h => (
                <th key={h} style={{ textAlign: "left", padding: "6px 14px", borderBottom: `1px solid ${C.border}`, color: C.accentSoft }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={{ padding: "6px 14px", color: r.s === "early" ? C.sky : C.pink }}>{isKo ? (r.s === "early" ? "이른 장벽" : "늦은 장벽") : r.s}</td>
                  <td style={{ padding: "6px 14px", fontFamily: mono }}>{r.Et.toFixed(2)}</td>
                  <td style={{ padding: "6px 14px", fontFamily: mono }}>{r.Ev.toFixed(2)}</td>
                  <td style={{ padding: "6px 14px", fontFamily: mono, color: C.ok }}>{r.P.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Note>
        {isKo
          ? "결과(Python, C++ 코드와 같음): 이른 장벽에서는 병진 에너지가 많을 때 P = 1.00, 진동 에너지가 많을 때 0.50입니다. 늦은 장벽에서는 거꾸로 병진 위주가 0.00, 진동 위주가 0.44입니다. 이른 장벽은 반응물 골짜기에 있으므로 A가 BC 쪽으로 곧장 달려드는 운동, 곧 병진이 장벽을 넘습니다. 늦은 장벽은 생성물 쪽 모퉁이를 돌아간 곳에 있으므로 BC를 늘이는 운동, 곧 진동이 필요합니다. 이것이 Polanyi 규칙이며, 1986년 노벨 화학상(Herschbach, Lee, Polanyi)의 주제였습니다."
          : "Result (identical to the Python and C++ codes): on the early barrier P = 1.00 when translation dominates and 0.50 when vibration dominates. On the late barrier it is reversed: 0.00 for translation-rich and 0.44 for vibration-rich. An early barrier lies in the reactant valley, so motion of A straight toward BC (translation) carries the system over it. A late barrier lies around the corner on the product side, so motion that stretches BC (vibration) is needed. These are the Polanyi rules, part of the 1986 Nobel Prize in Chemistry (Herschbach, Lee and Polanyi)."}
      </Note>
    </Card>
  );
}

function SurfaceShapeCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "인력형 면과 반발형 면, 그리고 공격 방향" : "Attractive vs repulsive surfaces, and the direction of attack"}</Hd>
      <Note>
        {isKo
          ? "인력형(이른 장벽) 면에서는 A가 다가오는 동안 에너지가 방출됩니다. 이때 새 결합 A–B가 아직 늘어난 채로 만들어지므로 생성물 AB가 강하게 진동합니다. F + H₂ → HF + H가 대표적이며, 진동이 들뜬 HF를 이용하는 것이 HF 화학 레이저입니다. 반발형(늦은 장벽) 면에서는 에너지가 B–C가 끊어질 때 방출되어 생성물의 병진 에너지로 많이 갑니다. 3차원에서는 공격 방향도 중요합니다. 장벽이 낮은 방향(원뿔 모양의 허용 범위)으로 들어와야 반응합니다. 9주차의 입체 인자 P가 바로 이 효과의 평균입니다."
          : "On an attractive (early-barrier) surface, energy is released while A approaches, when the new A–B bond is still stretched, so the product AB emerges strongly vibrating. F + H₂ → HF + H is the classic example, and the vibrationally excited HF drives the HF chemical laser. On a repulsive (late-barrier) surface, energy is released as B–C breaks and goes largely into product translation. In three dimensions the direction of attack also matters: the reaction succeeds only within a cone of low-barrier approach angles. The steric factor P of Week 9 is the average of this effect."}
      </Note>
    </Card>
  );
}

// =============================================================
// 4) ELECTRON TRANSFER & MARCUS THEORY
// =============================================================
const marcusAct = (lam, dG0) => (lam + dG0) * (lam + dG0) / (4 * lam);
function kMarcus(dG0, lam, V, T) {
  const kT = KB_EV * T;
  return 2 * Math.PI / HBAR_EV * V * V / Math.sqrt(4 * Math.PI * lam * kT) * Math.exp(-marcusAct(lam, dG0) / kT);
}
function kBimol(dG0, lam, V, T, ka, KA) {
  const kT = KB_EV * T, karev = ka / KA, kd = karev, ket = kMarcus(dG0, lam, V, T), ketr = ket * Math.exp(dG0 / kT);
  return 1 / (1 / ka + karev / (ka * ket) * (1 + ketr / kd));
}

function EtTab({ lang }) {
  const isKo = lang === "ko";
  const [lam, setLam] = useState(1.0);
  const [dG0, setDG0] = useState(-0.5);
  return (
    <div>
      <SteadyStateCard isKo={isKo} />
      <MarcusParabolaLab isKo={isKo} lam={lam} setLam={setLam} dG0={dG0} setDG0={setDG0} />
      <MarcusRateLab isKo={isKo} lam={lam} dG0={dG0} />
      <TunnelCard isKo={isKo} />
    </div>
  );
}

function SteadyStateCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "용액 속 전자 전달의 속도식" : "Rate law for electron transfer in solution"}</Hd>
      <Note>
        {isKo
          ? "주개 D와 받개 A가 만나 전자를 주고받는 과정은 네 단계로 나눌 수 있습니다. 먼저 둘이 확산으로 만나 만남 쌍 DA를 이룹니다. 그 안에서 전자가 건너가 D⁺A⁻가 되고, 마지막으로 이온 쌍이 흩어집니다. 중간체 DA와 D⁺A⁻에 정상 상태 근사를 쓰면 전체 속도 상수가 나옵니다."
          : "Electron transfer between a donor D and an acceptor A can be split into four steps. The two first meet by diffusion and form an encounter pair DA. The electron then crosses to give D⁺A⁻, and finally the ion pair separates. Applying the steady-state approximation to the intermediates DA and D⁺A⁻ gives the overall rate constant."}
      </Note>
      <Eq>D + A ⇄ DA (k_a, k_a′)      DA ⇄ D⁺A⁻ (k_et, k_et′)      D⁺A⁻ → D⁺ + A⁻ (k_d)</Eq>
      <Eq>d[D⁺A⁻]/dt = k_et[DA] − k_et′[D⁺A⁻] − k_d[D⁺A⁻] = 0   ⇒   [DA] = (k_et′ + k_d)/k_et · [D⁺A⁻]</Eq>
      <Eq>d[DA]/dt = k_a[D][A] − k_a′[DA] − k_et[DA] + k_et′[D⁺A⁻] = 0</Eq>
      <Eq style={{ color: C.accent }}>1/k_r = 1/k_a + (k_a′ / k_a k_et) (1 + k_et′/k_d)</Eq>
      <StatGrid min={260}>
        <Stat label={isKo ? "k_d ≫ k_et′ 이고 k_et ≫ k_a′: 확산 지배" : "k_d ≫ k_et′ and k_et ≫ k_a′: diffusion control"} value="k_r ≈ k_a" color={C.sky} />
        <Stat label={isKo ? "k_d ≫ k_et′ 이고 k_et ≪ k_a′: 활성화 지배" : "k_d ≫ k_et′ and k_et ≪ k_a′: activation control"} value="k_r ≈ (k_a/k_a′) k_et = K k_et" color={C.purple} />
      </StatGrid>
      <Note>
        {isKo
          ? "활성화 지배 영역에서는 만남 쌍의 평형 상수 K와 쌍 안의 전자 전달 속도 k_et의 곱이 관측됩니다. 따라서 k_et가 무엇에 따라 정해지는지 알아야 합니다. 그 답이 Marcus 이론입니다. k_a는 9주차의 확산 지배 속도 상수 8RT/3η와 같은 양입니다."
          : "In the activation-controlled regime we observe the product of the encounter-pair constant K and the in-pair transfer rate k_et, so we need to know what sets k_et. Marcus theory provides the answer. k_a is the diffusion-limited rate constant 8RT/3η of Week 9."}
      </Note>
    </Card>
  );
}

function MarcusParabolaLab({ isKo, lam, setLam, dG0, setDG0 }) {
  const W = 620, Ht = 330, pad = 44;
  const qs = [];
  for (let i = 0; i <= 200; i++) qs.push(-1.6 + i * 4.2 / 200);
  const GR = q => lam * q * q, GP = q => lam * (q - 1) * (q - 1) + dG0;
  const yMax = Math.max(1.6, lam * 1.2 + Math.max(0, dG0)), yMin = Math.min(-0.2, dG0 - 0.3);
  const { X, Y } = plotScale(-1.6, 2.6, yMin, yMax, W, Ht, pad);
  const qs_ = 0.5 * (1 + dG0 / lam), Gs = GR(qs_), act = marcusAct(lam, dG0);
  const regime = Math.abs(dG0 + lam) < 0.03 ? (isKo ? "활성화 없는 영역 (−ΔG° = λ)" : "Activationless (−ΔG° = λ)")
    : (-dG0 < lam ? (isKo ? "정상 영역 (−ΔG° < λ)" : "Normal region (−ΔG° < λ)") : (isKo ? "역전 영역 (−ΔG° > λ)" : "Inverted region (−ΔG° > λ)"));
  const clip = (pts) => pts.filter(([, g]) => g <= yMax);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑤ Marcus 포물선" : "Lab ⑤ Marcus parabolas"}</Hd>
      <Note>
        {isKo
          ? "전자는 핵보다 훨씬 빨리 건너갑니다(전자 전달 ~10⁻¹⁵ s, 핵 진동 ~10⁻¹³ s). 그래서 전자는 핵 배치가 그대로인 채 '수직으로' 건너가야 하고, 에너지가 보존되려면 반응물과 생성물의 에너지가 같아지는 핵 배치, 곧 두 포물선의 교차점까지 먼저 가야 합니다. 핵과 주위 용매의 배치를 좌표 q 하나로 나타내고 각각을 조화 진동자로 둡니다."
          : "The electron moves much faster than the nuclei (electron transfer ~10⁻¹⁵ s, nuclear vibration ~10⁻¹³ s), so it must jump 'vertically' at a fixed nuclear configuration. Energy conservation then requires the nuclei and the surrounding solvent to reach the configuration where reactant and product energies are equal: the crossing point of two parabolas. We describe the nuclear and solvent configuration by one coordinate q and treat each state as a harmonic oscillator."}
      </Note>
      <Eq>G_R(q) = ½k_e q²,   G_P(q) = ½k_e (q − q₀)² + Δ_rG°,   λ = ½k_e q₀²   ⇒   q‡ = (q₀/2)(1 + Δ_rG°/λ),   ΔG‡ = (λ + Δ_rG°)²/4λ</Eq>
      <Row>
        <Slider label={isKo ? "재배열 에너지 λ" : "Reorganization energy λ"} value={lam} min={0.2} max={2.0} step={0.05} onChange={setLam} unit=" eV" fmt={v => v.toFixed(2)} />
        <Slider label="Δ_rG°" value={dG0} min={-3} max={0.5} step={0.05} onChange={setDG0} unit=" eV" fmt={v => v.toFixed(2)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "핵·용매 배치 좌표 q / q₀" : "nuclear–solvent coordinate q / q₀"} ylabel="G (eV)" />
        <line x1={pad} x2={W - pad} y1={Y(0)} y2={Y(0)} stroke="#1f2937" />
        <path d={pathOf(clip(qs.map(q => [q, GR(q)])), X, Y)} fill="none" stroke={C.sky} strokeWidth={2.2} />
        <path d={pathOf(clip(qs.map(q => [q, GP(q)])), X, Y)} fill="none" stroke={C.pink} strokeWidth={2.2} />
        <line x1={X(0)} x2={X(1)} y1={Y(dG0)} y2={Y(dG0)} stroke={C.amber} strokeDasharray="2 3" />
        <line x1={X(0)} x2={X(0)} y1={Y(dG0)} y2={Y(Math.min(yMax, GP(0)))} stroke={C.amber} strokeWidth={1.6} />
        <text x={X(0) - 14} y={Y((dG0 + Math.min(yMax, GP(0))) / 2) + 4} fill={C.amber} fontSize={13} fontWeight={700}>λ</text>
        {Gs <= yMax && <circle cx={X(qs_)} cy={Y(Gs)} r={5} fill="#fde047" />}
        {Gs <= yMax && <text x={X(qs_) + 8} y={Y(Gs) - 6} fill="#fde047" fontSize={12}>‡</text>}
        <text x={X(-1.3)} y={Y(GR(-1.3)) + 16} fill={C.sky} fontSize={12}>D–A</text>
        <text x={X(2.2)} y={Y(Math.min(yMax, GP(2.2))) + 16} fill={C.pink} fontSize={12}>D⁺–A⁻</text>
      </svg>
      <StatGrid>
        <Stat label={isKo ? "활성화 자유 에너지 ΔG‡" : "Activation free energy ΔG‡"} value={`${act.toFixed(4)} eV`} color={C.accent} />
        <Stat label={isKo ? "교차점 q‡/q₀" : "Crossing point q‡/q₀"} value={qs_.toFixed(3)} color="#fde047" />
        <Stat label={isKo ? "영역" : "Regime"} value={regime} color={-dG0 > lam + 0.03 ? C.pink : C.ok} />
      </StatGrid>
      <Note>
        {isKo
          ? "주황 세로선이 λ입니다. 반응물 배치(q = 0) 그대로 전자만 옮겼을 때 생성물이 가지는 여분의 에너지로, 핵과 용매가 새 배치로 바뀌며 내놓는 에너지입니다. Δ_rG°를 0에서 점점 낮춰 보십시오. 처음에는 교차점이 내려가 장벽이 줄어듭니다. −ΔG° = λ에서 교차점이 반응물 바닥에 닿아 장벽이 0이 됩니다. 그보다 더 낮추면 생성물 포물선이 반응물 포물선의 왼쪽 벽을 지나게 되어 장벽이 다시 커집니다. 구동력이 커지는데 반응이 느려지는 이 영역이 Marcus 역전 영역입니다."
          : "The orange vertical line is λ: the extra energy the product has if the electron moves while the nuclei stay in the reactant configuration (q = 0), released as the nuclei and solvent relax to their new arrangement. Lower Δ_rG° gradually from zero. At first the crossing point drops and the barrier shrinks. At −ΔG° = λ the crossing reaches the bottom of the reactant well and the barrier vanishes. Beyond that, the product parabola crosses the left wall of the reactant parabola and the barrier grows again. This region, where a larger driving force makes the reaction slower, is the Marcus inverted region."}
      </Note>
    </Card>
  );
}

function MarcusRateLab({ isKo, lam, dG0 }) {
  const [V, setV] = useState(0.01);
  const [T, setT] = useState(298);
  const [eta, setEta] = useState(0.89);
  const [KA, setKA] = useState(1);
  const ka = 8 * RGAS * T / (3 * eta * 1e-3) * 1e3;
  const W = 640, Ht = 320, pad = 50;
  const xs = [];
  for (let i = 0; i <= 240; i++) xs.push(-0.5 + i * 3.5 / 240);
  const ket = xs.map(x => [x, Math.log10(Math.max(1e-30, kMarcus(-x, lam, V, T)))]);
  const kr = xs.map(x => [x, Math.log10(Math.max(1e-30, kBimol(-x, lam, V, T, ka, KA)))]);
  const yMin = 0, yMax = 14;
  const { X, Y } = plotScale(-0.5, 3, yMin, yMax, W, Ht, pad);
  const cl = pts => pts.map(([x, y]) => [x, Math.max(yMin, Math.min(yMax, y))]);
  const kNow = kMarcus(dG0, lam, V, T), krNow = kBimol(dG0, lam, V, T, ka, KA);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑥ 속도 대 구동력: 분자 내 반응과 분자 간 반응" : "Lab ⑥ Rate vs driving force: intramolecular vs bimolecular"}</Hd>
      <Eq>k_ET = (2π/ħ) |V|² (4πλk_BT)^(−½) exp[ −(λ + Δ_rG°)² / 4λk_BT ]</Eq>
      <Note>
        {isKo
          ? "V는 주개와 받개 사이의 전자 결합 에너지입니다. V가 작으면 전자가 교차점에서 건너갈 확률이 작아지므로(비단열 영역) 속도가 |V|²에 비례합니다. λ와 Δ_rG°는 위 실험실과 공유됩니다. 분홍 곡선은 만남 쌍 안의 k_ET이고, 하늘색 곡선은 정상 상태 식으로 구한 분자 간 k_r입니다."
          : "V is the electronic coupling between donor and acceptor. When V is small the electron crosses only rarely at the intersection (nonadiabatic regime), so the rate is proportional to |V|². λ and Δ_rG° are shared with the lab above. The pink curve is k_ET within the encounter pair; the blue curve is the bimolecular k_r from the steady-state rate law."}
      </Note>
      <Row>
        <Slider label={isKo ? "전자 결합 V" : "Electronic coupling V"} value={V} min={0.001} max={0.05} step={0.001} onChange={setV} unit=" eV" fmt={v => v.toFixed(3)} />
        <Slider label="T" value={T} min={150} max={400} step={5} onChange={setT} unit=" K" />
        <Slider label={isKo ? "용매 점도 η" : "Solvent viscosity η"} value={eta} min={0.3} max={5} step={0.01} onChange={setEta} unit=" mPa·s" fmt={v => v.toFixed(2)} />
        <Slider label={isKo ? "만남 쌍 상수 K = k_a/k_a′" : "Encounter constant K = k_a/k_a′"} value={KA} min={0.1} max={5} step={0.1} onChange={setKA} unit=" M⁻¹" fmt={v => v.toFixed(1)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel="−Δ_rG° (eV)" ylabel="log₁₀ k" />
        {[0, 2, 4, 6, 8, 10, 12, 14].map(v => (
          <g key={v}><line x1={pad} x2={W - pad} y1={Y(v)} y2={Y(v)} stroke="#1f2937" /><text x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text></g>
        ))}
        {[0, 1, 2, 3].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        <line x1={X(lam)} x2={X(lam)} y1={Y(yMin)} y2={Y(yMax)} stroke={C.amber} strokeDasharray="4 4" />
        <text x={X(lam) + 4} y={Y(yMax) + 12} fill={C.amber} fontSize={11}>−ΔG° = λ</text>
        <path d={pathOf(cl(ket), X, Y)} fill="none" stroke={C.pink} strokeWidth={2.2} />
        <path d={pathOf(cl(kr), X, Y)} fill="none" stroke={C.sky} strokeWidth={2.2} />
        <line x1={pad} x2={W - pad} y1={Y(Math.log10(ka))} y2={Y(Math.log10(ka))} stroke={C.sky} strokeDasharray="2 4" />
        <circle cx={X(-dG0)} cy={Y(Math.max(yMin, Math.min(yMax, Math.log10(kNow))))} r={5} fill="#fde047" />
        <text x={W - pad - 4} y={Y(Math.log10(ka)) - 6} fill={C.sky} fontSize={11} textAnchor="end">k_a = 8RT/3η</text>
      </svg>
      <StatGrid>
        <Stat label={isKo ? "확산 속도 상수 k_a" : "Diffusion rate constant k_a"} value={`${sci(ka)} M⁻¹s⁻¹`} color={C.sky} />
        <Stat label={isKo ? "현재 ΔG°에서 k_ET" : "k_ET at current ΔG°"} value={`${sci(kNow)} s⁻¹`} color={C.pink} />
        <Stat label={isKo ? "현재 ΔG°에서 k_r" : "k_r at current ΔG°"} value={`${sci(krNow)} M⁻¹s⁻¹`} color={C.sky} />
        <Stat label={isKo ? "최대 k_ET (−ΔG° = λ)" : "Maximum k_ET (−ΔG° = λ)"} value={`${sci(kMarcus(-lam, lam, V, T))} s⁻¹`} color={C.pink} />
      </StatGrid>
      <Note>
        {isKo
          ? "분자 내 반응(분홍)은 종 모양의 역전 곡선을 그대로 보여 줍니다. 주개와 받개를 단단한 스테로이드 사슬로 묶어 거리를 고정한 Miller, Calcaterra, Closs의 실험(J. Am. Chem. Soc. 106, 3047, 1984)이 역전 영역을 처음 분명히 보인 사례입니다. 분자 간 반응(하늘색)은 다릅니다. k_ET가 확산보다 빠른 넓은 범위에서 k_r이 k_a에 묶여 평평해지므로 역전이 가려집니다. 용액 속 형광 소광 실험에서 속도가 평평하게 유지된 Rehm–Weller 결과(Isr. J. Chem. 8, 259, 1970)가 오랫동안 Marcus 이론과 맞지 않아 보인 이유 중 하나입니다. 기본값(λ = 1 eV, V = 0.01 eV, 298 K)에서 최대 k_ET = 1.68×10¹² s⁻¹, 물에서 k_a = 7.4×10⁹ M⁻¹s⁻¹입니다."
          : "The intramolecular reaction (pink) shows the bell-shaped inverted curve directly. The experiment of Miller, Calcaterra and Closs (J. Am. Chem. Soc. 106, 3047, 1984), which fixed the donor–acceptor distance with a rigid steroid spacer, was the first clear demonstration of the inverted region. The bimolecular reaction (blue) is different: over the wide range where k_ET outruns diffusion, k_r is pinned at k_a and stays flat, hiding the inversion. This is one reason why the flat fluorescence-quenching rates of Rehm and Weller (Isr. J. Chem. 8, 259, 1970) long seemed to contradict Marcus theory. With the defaults (λ = 1 eV, V = 0.01 eV, 298 K), the maximum k_ET is 1.68×10¹² s⁻¹ and k_a in water is 7.4×10⁹ M⁻¹s⁻¹."}
      </Note>
    </Card>
  );
}

function TunnelCard({ isKo }) {
  const [dR, setDR] = useState(5);
  const k = 1e13 * Math.pow(10, -dR / 1.7);
  return (
    <Card>
      <Hd>{isKo ? "전자 터널링과 거리: 단백질 속 전자 전달" : "Electron tunnelling and distance: electron transfer in proteins"}</Hd>
      <Note>
        {isKo
          ? "V는 주개와 받개의 전자 파동 함수가 얼마나 겹치는지로 정해집니다. 파동 함수는 장벽 속에서 지수적으로 줄어들기 때문에(2주차 터널링), 속도도 거리에 지수적으로 줄어듭니다. 단백질 속 전자 전달을 정리한 경험 규칙에 따르면, 가장 가까이 붙었을 때 약 10¹³ s⁻¹이고 거리가 1.7 Å 늘 때마다 10배씩 느려집니다(Moser, Chobot, Page, Dutton, Biochim. Biophys. Acta 1777, 1032, 2008)."
          : "V is set by how much the donor and acceptor wavefunctions overlap. Wavefunctions decay exponentially inside a barrier (Week 2 tunnelling), so the rate also falls exponentially with distance. An empirical rule for electron transfer in proteins gives about 10¹³ s⁻¹ at the closest distances, falling tenfold for every 1.7 Å (Moser, Chobot, Page and Dutton, Biochim. Biophys. Acta 1777, 1032, 2008)."}
      </Note>
      <Row>
        <Slider label={isKo ? "가장 가까운 거리에서 더 떨어진 거리 ΔR" : "Extra distance beyond closest contact ΔR"} value={dR} min={0} max={20} step={0.5} onChange={setDR} unit=" Å" fmt={v => v.toFixed(1)} />
      </Row>
      <StatGrid>
        <Stat label={isKo ? "속도 k ≈ 10¹³ × 10^(−ΔR/1.7 Å)" : "Rate k ≈ 10¹³ × 10^(−ΔR/1.7 Å)"} value={`${sci(k)} s⁻¹`} color={C.purple} />
        <Stat label={isKo ? "시간 상수 1/k" : "Time constant 1/k"} value={`${sci(1 / k)} s`} color={C.purple} />
        <Stat label={isKo ? "속도의 감쇠 상수 β = ln10/1.7 Å" : "Rate decay constant β = ln10/1.7 Å"} value="1.35 Å⁻¹" color={C.textDim} />
      </StatGrid>
      <Note>
        {isKo
          ? "ΔR = 10 Å이면 속도는 10⁻⁵·⁹배, 곧 약 백만 분의 1로 줄어듭니다. 그래서 생체의 산화·환원 단백질은 산화·환원 중심을 14 Å 이내 간격으로 늘어놓고, 더 먼 거리는 보조 인자를 여러 개 이어서 건넙니다(Page, Moser, Chen, Dutton, Nature 402, 47, 1999). 강의의 예인 [Ru(bpy)₃]²⁺의 광유도 전자 전달에서도 받개를 바꿔 ΔG°를 −0.2 eV에서 −2.0 eV까지 조절하면, log k_ET가 −ΔG°에 대해 위로 볼록한 포물선을 그립니다. 이것이 Marcus 식을 로그로 쓴 ln k_ET = 상수 − (λ + Δ_rG°)²/4λRT의 모양입니다."
          : "At ΔR = 10 Å the rate drops by 10⁻⁵·⁹, about a millionfold. Biological redox proteins therefore space their redox centres 14 Å or less apart and cross longer distances with chains of cofactors (Page, Moser, Chen and Dutton, Nature 402, 47, 1999). In the lecture example, photo-induced electron transfer from [Ru(bpy)₃]²⁺, changing the acceptor tunes ΔG° from −0.2 eV to −2.0 eV, and log k_ET traces a downward parabola in −ΔG°. That is the shape of the Marcus equation in logarithmic form, ln k_ET = constant − (λ + Δ_rG°)²/4λRT."}
      </Note>
    </Card>
  );
}

// =============================================================
// 5) 1D CRYSTAL VIBRATIONS (monatomic chain)
// =============================================================
const omegaMono = k => 2 * Math.abs(Math.sin(k / 2));   // units: sqrt(kappa/m) = a = 1
function einsteinC(x) {                                   // x = hbar omega / kT
  if (x < 1e-6) return 1;
  if (x > 700) return 0;
  const e = Math.exp(x);
  return x * x * e / ((e - 1) * (e - 1));
}

function ChainTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <AnharmonicLab isKo={isKo} />
      <ChainDerivCard isKo={isKo} />
      <ChainModeLab isKo={isKo} />
      <ModeCountLab isKo={isKo} />
      <PhononHeatLab isKo={isKo} />
    </div>
  );
}

function AnharmonicLab({ isKo }) {
  const [kT, setKT] = useState(0.06);
  const xeq = Math.pow(2, 1 / 6), Veq = -1;
  const turning = useMemo(() => {
    const target = Veq + kT;
    const f = x => ljV(x) - target;
    const bis = (lo, hi) => { for (let i = 0; i < 80; i++) { const m = 0.5 * (lo + hi); if (Math.sign(f(m)) === Math.sign(f(lo))) lo = m; else hi = m; } return 0.5 * (lo + hi); };
    return [bis(0.9, xeq), bis(xeq, 4)];
  }, [kT]);
  const avg = useMemo(() => {
    let z = 0, s = 0;
    for (let i = 0; i < 4000; i++) {
      const x = 0.9 + (i + 0.5) * (turning[1] + 4 * Math.sqrt(kT) - 0.9) / 4000;
      if (x > 2.2) break;
      const w = Math.exp(-(ljV(x) - Veq) / kT); z += w; s += w * x;
    }
    return s / z;
  }, [kT, turning]);
  const kappa = 72 / Math.pow(2, 1 / 3);
  const W = 600, Ht = 300, pad = 44;
  const { X, Y } = plotScale(0.98, 1.6, -1.02, -0.5, W, Ht, pad);
  const xs = [];
  for (let i = 0; i <= 300; i++) xs.push(0.98 + i * 0.62 / 300);
  const mid = 0.5 * (turning[0] + turning[1]);
  return (
    <Card>
      <Hd>{isKo ? "실제 결정 퍼텐셜: 용수철과 열팽창" : "Real crystal potential: springs and thermal expansion"}</Hd>
      <Note>
        {isKo
          ? "이웃 원자 사이의 퍼텐셜 V(x)를 평형 거리 x_eq = a 근처에서 Taylor 전개하면 V ≈ V(a) + ½κ(x − a)²가 됩니다. 1차 항은 평형이므로 0입니다. 그래서 2차 미분 κ = V″(a)가 Hooke 법칙의 용수철 상수가 됩니다. 실제 V는 비대칭입니다. 압축 쪽 벽은 가파르고 늘어나는 쪽은 완만합니다. 온도가 올라 원자가 kT만큼 에너지를 가지면 움직일 수 있는 범위 x_min ≤ x ≤ x_max가 넓어지는데, 완만한 쪽으로 더 많이 넓어집니다. 그래서 평균 위치가 바깥으로 밀리고 결정이 팽창합니다."
          : "Expanding the pair potential V(x) about the equilibrium spacing x_eq = a gives V ≈ V(a) + ½κ(x − a)²; the linear term vanishes at equilibrium. The second derivative κ = V″(a) is therefore the Hooke's-law spring constant. The real V is asymmetric: the compressive wall is steep and the stretching side is soft. When the atom has thermal energy kT, the allowed range x_min ≤ x ≤ x_max widens, more on the soft side. The average position moves outward and the crystal expands."}
      </Note>
      <Eq>κ = (∂²V/∂x²)_a,   F = −κ(x − a),   {isKo ? "1D 압축률" : "1D compressibility"} β = −(1/L)(∂L/∂F) = 1/(κa),   v_s = a√(κ/m)</Eq>
      <Row>
        <Slider label={isKo ? "열에너지 kT/ε" : "Thermal energy kT/ε"} value={kT} min={0.005} max={0.15} step={0.005} onChange={setKT} fmt={v => v.toFixed(3)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "원자 간 거리 x/σ (Lennard-Jones)" : "interatomic distance x/σ (Lennard-Jones)"} ylabel="V/ε" />
        <path d={pathOf(xs.map(x => [x, Math.min(-0.5, ljV(x))]), X, Y)} fill="none" stroke={C.accent} strokeWidth={2.2} />
        <path d={pathOf(xs.map(x => [x, Math.min(-0.5, Veq + 0.5 * kappa * (x - xeq) ** 2)]), X, Y)} fill="none" stroke={C.textDim} strokeDasharray="5 4" />
        <line x1={X(turning[0])} x2={X(turning[1])} y1={Y(Veq + kT)} y2={Y(Veq + kT)} stroke={C.sky} strokeWidth={2} />
        <line x1={X(xeq)} x2={X(xeq)} y1={Y(-1.02)} y2={Y(-0.5)} stroke="#334155" strokeDasharray="3 3" />
        <circle cx={X(mid)} cy={Y(Veq + kT)} r={5} fill="#fde047" />
        <circle cx={X(avg)} cy={Y(-1.0)} r={5} fill={C.pink} />
        {[-1.0, -0.8, -0.6].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v.toFixed(1)}</text>)}
        {[1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v.toFixed(1)}</text>)}
      </svg>
      <StatGrid>
        <Stat label={isKo ? "용수철 상수 κ = V″(a)" : "Spring constant κ = V″(a)"} value={`${kappa.toFixed(2)} ε/σ²`} color={C.accent} />
        <Stat label={isKo ? "운동 범위 중점 이동 (노란 점)" : "Shift of the midpoint of the range (yellow)"} value={`${(mid - xeq).toFixed(4)} σ`} color="#fde047" />
        <Stat label={isKo ? "Boltzmann 평균 ⟨x⟩ − a (분홍 점)" : "Boltzmann average ⟨x⟩ − a (pink)"} value={`${(avg - xeq).toFixed(4)} σ`} color={C.pink} />
        <Stat label={isKo ? "조화 근사(점선)의 이동" : "Shift in the harmonic approximation (dashed)"} value="0" color={C.textDim} />
      </StatGrid>
      <Note>
        {isKo
          ? "점선 포물선은 조화 근사입니다. 포물선은 좌우 대칭이라 온도가 올라도 중점이 움직이지 않습니다. 따라서 열팽창은 퍼텐셜의 비조화성(3차 이상 항)에서만 생깁니다. 낮은 온도에서 ⟨x⟩ − a는 kT에 거의 비례하므로 선팽창 계수가 일정한 값을 가집니다. Ar 결정에 흔히 쓰는 ε/k ≈ 120 K, σ ≈ 3.4 Å를 넣으면 κ = 0.82 N/m입니다."
          : "The dashed parabola is the harmonic approximation. A parabola is symmetric, so its midpoint does not move with temperature: thermal expansion comes only from the anharmonic (cubic and higher) terms. At low temperature ⟨x⟩ − a is nearly proportional to kT, so the linear expansion coefficient is constant. With the parameters commonly used for argon, ε/k ≈ 120 K and σ ≈ 3.4 Å, κ = 0.82 N/m."}
      </Note>
    </Card>
  );
}

function ChainDerivCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "1D 원자 사슬의 운동 방정식에서 분산 관계까지" : "From the equation of motion of a 1D chain to the dispersion relation"}</Hd>
      <Eq>V_tot = Σ ½κ (x_(i+1) − x_i − a)²   ⇒   F_n = −∂V_tot/∂x_n = κ (x_(n+1) − 2x_n + x_(n−1))</Eq>
      <Eq>m ẍ_n = κ (x_(n+1) − 2x_n + x_(n−1))     {isKo ? "(a → 0이면 파동 방정식 m ∂²x/∂t² = κa² ∂²x/∂z²)" : "(as a → 0: the wave equation m ∂²x/∂t² = κa² ∂²x/∂z²)"}</Eq>
      <Eq>{isKo ? "시도해:" : "Trial:"} x_n = A exp[i(ωt − kna)]   ⇒   mω² = 2κ(1 − cos ka) = 4κ sin²(ka/2)   ⇒   ω = 2√(κ/m) |sin(ka/2)|</Eq>
      <Note>
        {isKo
          ? "결과 ω(k)를 분산 관계라 부릅니다. 결합된 계에서 모든 입자가 같은 진동수로 함께 움직이는 집단 진동을 정상 모드라 합니다. 작은 k(긴 파장)에서는 ω ≈ a√(κ/m)·k로 직선이고, 기울기가 음속입니다. k = π/a(파장 2a)에서 이웃 원자가 정반대로 움직이며 ω가 최대 2√(κ/m)에 이릅니다. 이때 군속도 dω/dk = 0이므로 에너지가 전파되지 않는 정지파가 됩니다."
          : "The result ω(k) is the dispersion relation. In a coupled system, a collective oscillation in which every particle moves at the same frequency is a normal mode. At small k (long wavelength), ω ≈ a√(κ/m)·k is linear and its slope is the speed of sound. At k = π/a (wavelength 2a), neighbouring atoms move in opposite directions and ω reaches its maximum 2√(κ/m). There the group velocity dω/dk = 0, so the wave is a standing wave that carries no energy."}
      </Note>
    </Card>
  );
}

function ChainModeLab({ isKo }) {
  const [kk, setKk] = useState(0.5);          // k in units of pi/a
  const [play, setPlay] = useState(true);
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!play) return;
    let id, last = null;
    const step = ts => { if (last !== null) setT(v => v + (ts - last) / 1000); last = ts; id = requestAnimationFrame(step); };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [play]);
  const k = kk * Math.PI, w = omegaMono(k);
  let kred = k;
  while (kred > Math.PI) kred -= 2 * Math.PI;
  while (kred < -Math.PI) kred += 2 * Math.PI;
  const N = 16, W = 640, Ht = 220, pad = 30, dx = (W - 2 * pad) / (N - 1), amp = 38;
  const phase = 2.2 * t;   // animation uses a common display clock
  const disp = z => amp * Math.cos(k * z - phase * Math.max(w, 0.15) / 2);
  const dispR = z => amp * Math.cos(kred * z - phase * Math.max(w, 0.15) / 2);
  const zs = [];
  for (let i = 0; i <= 300; i++) zs.push(i * (N - 1) / 300);
  const W2 = 640, H2 = 240, p2 = 40;
  const { X, Y } = plotScale(-2, 2, 0, 2.2, W2, H2, p2);
  const curve = [];
  for (let i = 0; i <= 300; i++) { const q = -2 + 4 * i / 300; curve.push([q, omegaMono(q * Math.PI)]); }
  const vg = Math.cos(k / 2) * Math.sign(Math.sin(k / 2) || 1);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑦ 정상 모드와 Brillouin 영역" : "Lab ⑦ Normal modes and the Brillouin zone"}</Hd>
      <Note>
        {isKo
          ? "원자 16개의 변위를 보기 쉽게 세로로 그렸습니다(실제 1D 사슬에서는 사슬 방향의 세로파). 주황 곡선은 고른 k의 연속 파동이고, 하늘색 점선은 k를 제1 Brillouin 영역(−π/a < k ≤ π/a)으로 옮긴 파동입니다. |k| > π/a로 가 보십시오. 두 곡선은 다르지만 원자가 있는 자리에서는 값이 똑같습니다. 원자는 격자점에만 있으므로 k와 k + 2π/a는 같은 운동입니다. 그래서 물리적으로 다른 모드는 제1 Brillouin 영역 안에만 있습니다."
          : "The displacements of 16 atoms are drawn vertically for visibility (in a real 1D chain they are longitudinal). The orange curve is the continuous wave with the chosen k; the blue dashed curve is the wave with k mapped back into the first Brillouin zone (−π/a < k ≤ π/a). Go to |k| > π/a: the two curves differ, but they agree exactly at every atom. Atoms sit only on lattice points, so k and k + 2π/a describe the same motion, and all physically distinct modes lie in the first Brillouin zone."}
      </Note>
      <Row>
        <Slider label={isKo ? "파수 k (π/a 단위)" : "Wavenumber k (units of π/a)"} value={kk} min={-2} max={2} step={0.02} onChange={setKk} fmt={v => v.toFixed(2)} />
        <button style={btnStyle(play)} onClick={() => setPlay(p => !p)}>{play ? (isKo ? "⏸ 멈춤" : "⏸ Pause") : (isKo ? "▶ 재생" : "▶ Play")}</button>
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <line x1={pad} x2={W - pad} y1={Ht / 2} y2={Ht / 2} stroke="#1f2937" />
        <path d={zs.map((z, i) => `${i ? "L" : "M"}${(pad + z * dx).toFixed(1)} ${(Ht / 2 - disp(z)).toFixed(1)}`).join(" ")} fill="none" stroke={C.accent} strokeWidth={1.6} opacity={0.8} />
        <path d={zs.map((z, i) => `${i ? "L" : "M"}${(pad + z * dx).toFixed(1)} ${(Ht / 2 - dispR(z)).toFixed(1)}`).join(" ")} fill="none" stroke={C.sky} strokeWidth={1.6} strokeDasharray="5 4" />
        {Array.from({ length: N }, (_, n) => (
          <circle key={n} cx={pad + n * dx} cy={Ht / 2 - disp(n)} r={8} fill="#e5e7eb" stroke={C.accent} strokeWidth={2} />
        ))}
      </svg>
      <svg viewBox={`0 0 ${W2} ${H2}`} style={{ ...fullSvg(W2), marginTop: 10 }}>
        <rect x={X(-1)} y={p2 - 6} width={X(1) - X(-1)} height={H2 - 2 * p2 + 6} fill={`${C.accent}14`} />
        <Axes W={W2} Ht={H2} pad={p2} xlabel={isKo ? "k (π/a 단위), 음영 = 제1 Brillouin 영역" : "k (units of π/a); shaded = first Brillouin zone"} ylabel="ω/√(κ/m)" />
        {[-2, -1, 0, 1, 2].map(v => <text key={v} x={X(v)} y={H2 - p2 + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        <path d={pathOf(curve, X, Y)} fill="none" stroke={C.accent} strokeWidth={2} />
        <line x1={X(-0.6)} x2={X(0.6)} y1={Y(-0.6 * Math.PI)} y2={Y(0.6 * Math.PI)} stroke={C.textDim} strokeDasharray="4 4" />
        <circle cx={X(kk)} cy={Y(w)} r={6} fill="#fde047" />
        <circle cx={X(kred / Math.PI)} cy={Y(w)} r={5} fill="none" stroke={C.sky} strokeWidth={2} />
      </svg>
      <StatGrid>
        <Stat label="ω / ω_max" value={(w / 2).toFixed(3)} color={C.accent} />
        <Stat label={isKo ? "제1 영역으로 옮긴 k" : "k reduced to the first zone"} value={`${(kred / Math.PI).toFixed(2)} π/a`} color={C.sky} />
        <Stat label={isKo ? "파장 λ = 2π/|k|" : "Wavelength λ = 2π/|k|"} value={Math.abs(kk) < 1e-6 ? "∞" : `${(2 / Math.abs(kk)).toFixed(2)} a`} color={C.textDim} />
        <Stat label={isKo ? "군속도 dω/dk (음속 a√(κ/m) 단위)" : "Group velocity dω/dk (units of a√(κ/m))"} value={vg.toFixed(3)} color={C.ok} />
      </StatGrid>
    </Card>
  );
}

function ModeCountLab({ isKo }) {
  const [N, setN] = useState(8);
  const ks = [];
  for (let p = -Math.floor((N - 1) / 2); p <= Math.floor(N / 2); p++) ks.push(2 * p / N);   // units of pi/a
  const W = 640, Ht = 240, pad = 40;
  const { X, Y } = plotScale(-1.05, 1.05, 0, 2.2, W, Ht, pad);
  const curve = [];
  for (let i = 0; i <= 200; i++) { const q = -1 + 2 * i / 200; curve.push([q, omegaMono(q * Math.PI)]); }
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑧ 정상 모드는 몇 개인가" : "Lab ⑧ How many normal modes are there?"}</Hd>
      <Eq>{isKo ? "주기 경계 조건" : "Periodic boundary condition"} x_(n+N) = x_n   ⇒   e^(ikNa) = 1   ⇒   k = 2πp/(Na),  p = 0, ±1, ±2, …</Eq>
      <Eq>{isKo ? "제1 영역 안의 모드 수" : "Modes in the first zone"} = (2π/a) / (2π/Na) = N</Eq>
      <Row>
        <Slider label={isKo ? "원자 수 N" : "Number of atoms N"} value={N} min={2} max={30} step={1} onChange={setN} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel="k (π/a)" ylabel="ω/√(κ/m)" />
        {[-1, -0.5, 0, 0.5, 1].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        <path d={pathOf(curve, X, Y)} fill="none" stroke={`${C.accent}88`} strokeWidth={1.5} />
        {ks.map((q, i) => (
          <g key={i}>
            <line x1={X(q)} x2={X(q)} y1={Y(0)} y2={Y(omegaMono(q * Math.PI))} stroke={C.teal} />
            <circle cx={X(q)} cy={Y(omegaMono(q * Math.PI))} r={4.5} fill={C.teal} />
          </g>
        ))}
      </svg>
      <StatGrid>
        <Stat label={isKo ? "허용된 k의 수" : "Allowed k values"} value={String(ks.length)} color={C.teal} />
        <Stat label={isKo ? "자유도 수 (1D, 원자당 1)" : "Degrees of freedom (1D, one per atom)"} value={String(N)} color={C.teal} />
        <Stat label={isKo ? "k 간격" : "Spacing of k"} value={`2π/(${N}a)`} color={C.textDim} />
      </StatGrid>
      <Note>
        {isKo
          ? "N이 얼마든 허용된 k는 정확히 N개입니다. 원자 하나에 모드 하나, 다시 말해 자유도 하나에 모드 하나입니다. N개의 독립된 Einstein 진동자 대신, 결합된 사슬은 진동수가 서로 다른 N개의 집단 진동을 가집니다. 10주차에 각 진동자를 양자화했던 것처럼 이 모드들도 하나하나 양자화할 수 있습니다."
          : "Whatever N is, there are exactly N allowed k values: one mode per atom, that is, one mode per degree of freedom. Instead of N independent Einstein oscillators, the coupled chain has N collective oscillations with different frequencies. Just as each oscillator was quantized in Week 10, each of these modes can be quantized."}
      </Note>
    </Card>
  );
}

function PhononHeatLab({ isKo }) {
  const [T, setT] = useState(0.5);     // kT / (hbar sqrt(kappa/m))
  const Nm = 1000;
  const modes = useMemo(() => Array.from({ length: Nm - 1 }, (_, p) => omegaMono(2 * Math.PI * (p + 1) / Nm)), []);
  const cChain = tt => modes.reduce((s, w) => s + einsteinC(w / tt), 0) / modes.length;
  const wE = 4 / Math.PI;                 // mean mode frequency of the chain, used for the Einstein comparison
  const cEin = tt => einsteinC(wE / tt);
  const Ts = [];
  for (let i = 1; i <= 120; i++) Ts.push(i * 2.5 / 120);
  const chain = useMemo(() => Ts.map(tt => [tt, cChain(tt)]), []);
  const ein = Ts.map(tt => [tt, cEin(tt)]);
  const W = 640, Ht = 280, pad = 44;
  const { X, Y } = plotScale(0, 2.5, 0, 1.1, W, Ht, pad);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑨ 포논과 열용량: Einstein 고체 다음 단계" : "Lab ⑨ Phonons and heat capacity: beyond the Einstein solid"}</Hd>
      <Eq>E_(k,n) = ħω(k) (n + ½),  n = 0, 1, 2, …   ⇒   C = k_B Σ_k (ħω_k/kT)² e^(ħω_k/kT) / (e^(ħω_k/kT) − 1)²</Eq>
      <Note>
        {isKo
          ? "3주차 조화 진동자의 에너지 준위가 그대로 쓰입니다. 다만 진동수가 하나가 아니라 ω(k)로 N개입니다. 진동 에너지 양자 ħω(k) 하나를 포논이라 부릅니다. 주황 곡선은 사슬의 모든 모드를 더한 열용량이고, 점선은 모든 원자가 같은 진동수(사슬 모드의 평균 4/π·√(κ/m))로 떠는 Einstein 모형입니다."
          : "The harmonic-oscillator levels of Week 3 are used as they are, except that there are N frequencies ω(k) instead of one. One quantum of vibrational energy ħω(k) is called a phonon. The orange curve sums the heat capacity over all modes of the chain; the dashed curve is the Einstein model with every atom at a single frequency (the mean chain frequency 4/π·√(κ/m))."}
      </Note>
      <Row>
        <Slider label={isKo ? "온도 kT/ħ√(κ/m)" : "Temperature kT/ħ√(κ/m)"} value={T} min={0.02} max={2.5} step={0.02} onChange={setT} fmt={v => v.toFixed(2)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel="kT / ħ√(κ/m)" ylabel="C / Nk" />
        {[0, 0.5, 1].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        {[0, 0.5, 1, 1.5, 2, 2.5].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        <line x1={pad} x2={W - pad} y1={Y(1)} y2={Y(1)} stroke={C.textDim} strokeDasharray="2 4" />
        <path d={pathOf(chain, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.2} />
        <path d={pathOf(ein, X, Y)} fill="none" stroke={C.sky} strokeWidth={2} strokeDasharray="6 4" />
        <path d={pathOf([[0, 0], [0.33, 0.33 * Math.PI / 3]], X, Y)} fill="none" stroke={C.lime} strokeWidth={1.5} />
        <circle cx={X(T)} cy={Y(cChain(T))} r={5} fill="#fde047" />
      </svg>
      <StatGrid>
        <Stat label={isKo ? "사슬 (모든 모드)" : "Chain (all modes)"} value={`C/Nk = ${cChain(T).toFixed(4)}`} color={C.accent} />
        <Stat label={isKo ? "Einstein 모형" : "Einstein model"} value={`C/Nk = ${cEin(T).toFixed(4)}`} color={C.sky} />
        <Stat label={isKo ? "저온 극한 (초록 선)" : "Low-T limit (green line)"} value="C/Nk → (π/3) kT/ħ√(κ/m)" color={C.lime} />
        <Stat label={isKo ? "고온 극한 (고전 등분배)" : "High-T limit (classical equipartition)"} value="C/Nk → 1" color={C.textDim} />
      </StatGrid>
      <Note>
        {isKo
          ? "저온에서 Einstein 모형은 지수 함수로 급격히 0이 되지만, 사슬은 T에 비례하며 천천히 줄어듭니다. 차이의 원인은 음향 모드입니다. 긴 파장 모드는 진동수가 0에 가까워 아무리 낮은 온도에서도 일부가 들뜰 수 있습니다. 3D 결정에서는 같은 논리로 C ∝ T³(Debye 법칙)가 됩니다. 계산값(N = 2000): kT = 0.05, 0.5, 1, 2에서 C/Nk = 0.052, 0.592, 0.855, 0.960."
          : "At low temperature the Einstein model falls to zero exponentially, but the chain decreases only linearly in T. The difference comes from the acoustic modes: long-wavelength modes have frequencies near zero, so some of them are excited at any temperature. In a 3D crystal the same argument gives C ∝ T³ (the Debye law). Computed values (N = 2000): C/Nk = 0.052, 0.592, 0.855 and 0.960 at kT = 0.05, 0.5, 1 and 2."}
      </Note>
    </Card>
  );
}

// =============================================================
// 6) DIATOMIC CHAIN & PHONONS
// =============================================================
// masses m1, m2 (m1 = 1), springs k1 (inside cell), k2 (between cells); a = cell length
function omegaDi(k, m1, m2, k1, k2) {
  const S = k1 + k2, inv = 1 / m1 + 1 / m2, sn = Math.sin(k / 2);
  const root = Math.sqrt(Math.max(S * S * inv * inv - 16 * k1 * k2 * sn * sn / (m1 * m2), 0));
  return [Math.sqrt(Math.max(0.5 * (S * inv - root), 0)), Math.sqrt(0.5 * (S * inv + root))];
}
// eigenvector (u1, u2) for branch w: [(k1+k2) - m1 w^2] u1 = (k1 + k2 e^{-ik}) u2
function eigvecDi(k, w, m1, m2, k1, k2) {
  const a = (k1 + k2) - m1 * w * w;
  const re = k1 + k2 * Math.cos(k), im = -k2 * Math.sin(k);
  // u1 = (re + i im), u2 = a  (unnormalized); returns amplitudes and relative phase
  const A1 = Math.hypot(re, im), A2 = Math.abs(a), ph = Math.atan2(im, re) - (a < 0 ? Math.PI : 0);
  const n = Math.hypot(A1, A2) || 1;
  if (A1 < 1e-12 && A2 < 1e-12) return { A1: 1, A2: 0, ph: 0 };
  return { A1: A1 / n, A2: A2 / n, ph };
}

function PhononTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <DiatomicDerivCard isKo={isKo} />
      <DiatomicLab isKo={isKo} />
      <DosLab isKo={isKo} />
      <Count3DCard isKo={isKo} />
    </div>
  );
}

function DiatomicDerivCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "이원자 사슬: 단위 세포에 원자가 둘일 때" : "Diatomic chain: two atoms per unit cell"}</Hd>
      <Note>
        {isKo
          ? "NaCl이나 GaAs처럼 단위 세포에 서로 다른 원자가 두 개 있으면 운동 방정식도 두 개가 됩니다. 원자 x_n(질량 m₁)과 y_n(질량 m₂)이 세포 안에서는 용수철 κ₁, 세포 사이에서는 κ₂로 연결된다고 둡니다."
          : "When the unit cell contains two different atoms, as in NaCl or GaAs, there are two equations of motion. Atoms x_n (mass m₁) and y_n (mass m₂) are joined by a spring κ₁ inside the cell and κ₂ between cells."}
      </Note>
      <Eq>m₁ ẍ_n = κ₂ (y_(n−1) − x_n) + κ₁ (y_n − x_n),     m₂ ÿ_n = κ₁ (x_n − y_n) + κ₂ (x_(n+1) − y_n)</Eq>
      <Eq>ω² = (κ₁ + κ₂)(m₁ + m₂)/(2m₁m₂) ± ½ √[ (κ₁ + κ₂)²(1/m₁ + 1/m₂)² − 16κ₁κ₂ sin²(ka/2)/(m₁m₂) ]</Eq>
      <Note>
        {isKo
          ? "k 하나마다 해가 두 개입니다. 단위 세포의 자유도가 2이기 때문입니다. 아래 가지(−)는 음향 포논입니다. k → 0에서 ω → 0이고, 두 원자가 같은 방향으로 함께 움직이는 소리 파동입니다. 위 가지(+)는 광학 포논입니다. k → 0에서도 ω ≠ 0이고, 두 원자가 서로 반대로 움직입니다. 이온 결정에서는 이 운동이 진동하는 전기 쌍극자를 만들어 적외선과 직접 결합합니다. 그래서 '광학' 포논이라 부릅니다."
          : "Each k has two solutions because the unit cell has two degrees of freedom. The lower (−) branch is the acoustic phonon: ω → 0 as k → 0, and the two atoms move together like a sound wave. The upper (+) branch is the optical phonon: ω ≠ 0 even at k → 0, and the two atoms move against each other. In an ionic crystal this motion creates an oscillating dipole that couples directly to infrared light, which is why it is called 'optical'."}
      </Note>
    </Card>
  );
}

function DiatomicLab({ isKo }) {
  const [mr, setMr] = useState(2);       // m2/m1
  const [kr, setKr] = useState(1);       // k2/k1
  const [kk, setKk] = useState(0.15);    // k in units of pi/a
  const [branch, setBranch] = useState("ac");
  const [t, setT] = useState(0);
  useEffect(() => {
    let id, last = null;
    const step = ts => { if (last !== null) setT(v => v + (ts - last) / 1000); last = ts; id = requestAnimationFrame(step); };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, []);
  const m1 = 1, m2 = mr, k1 = 1, k2 = kr;
  const curve = useMemo(() => {
    const ac = [], op = [];
    for (let i = 0; i <= 300; i++) { const q = -1 + 2 * i / 300, [a, o] = omegaDi(q * Math.PI, m1, m2, k1, k2); ac.push([q, a]); op.push([q, o]); }
    return { ac, op };
  }, [mr, kr]);
  const [aZB, oZB] = omegaDi(Math.PI, m1, m2, k1, k2);
  const [, o0] = omegaDi(0, m1, m2, k1, k2);
  const k = kk * Math.PI, [wa, wo] = omegaDi(k, m1, m2, k1, k2), w = branch === "ac" ? wa : wo;
  const ev = eigvecDi(k, w, m1, m2, k1, k2);
  const yMax = Math.max(o0, oZB) * 1.1;
  const W = 640, Ht = 260, pad = 44;
  const { X, Y } = plotScale(-1, 1, 0, yMax, W, Ht, pad);
  // chain animation
  const Nc = 8, Wa = 640, Ha = 170, px = 30, dxc = (Wa - 2 * px) / (2 * Nc - 1), amp = 34;
  const tt = 2.4 * t;
  const atoms = [];
  for (let n = 0; n < Nc; n++) {
    atoms.push({ x: px + 2 * n * dxc, y: Ha / 2 - amp * ev.A1 * Math.cos(k * n - tt + ev.ph) / Math.max(ev.A1, ev.A2), heavy: false });
    atoms.push({ x: px + (2 * n + 1) * dxc, y: Ha / 2 - amp * ev.A2 * Math.cos(k * n - tt) / Math.max(ev.A1, ev.A2), heavy: true });
  }
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑩ 음향 가지와 광학 가지, 그리고 띠 간격" : "Lab ⑩ Acoustic and optical branches, and the band gap"}</Hd>
      <Row>
        <Slider label={isKo ? "질량비 m₂/m₁" : "Mass ratio m₂/m₁"} value={mr} min={1} max={5} step={0.05} onChange={setMr} fmt={v => v.toFixed(2)} />
        <Slider label={isKo ? "용수철비 κ₂/κ₁" : "Spring ratio κ₂/κ₁"} value={kr} min={1} max={3} step={0.05} onChange={setKr} fmt={v => v.toFixed(2)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <rect x={pad} y={Y(oZB)} width={W - 2 * pad} height={Math.max(0, Y(aZB) - Y(oZB))} fill={`${C.pink}18`} />
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "k (π/a), 제1 Brillouin 영역" : "k (π/a), first Brillouin zone"} ylabel="ω/√(κ₁/m₁)" />
        {[-1, -0.5, 0, 0.5, 1].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        <path d={pathOf(curve.ac, X, Y)} fill="none" stroke={C.sky} strokeWidth={2.2} />
        <path d={pathOf(curve.op, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.2} />
        <circle cx={X(kk)} cy={Y(w)} r={6} fill="#fde047" />
        <text x={X(0.62)} y={Y(curve.op[250][1]) - 8} fill={C.accent} fontSize={12}>{isKo ? "광학" : "optical"}</text>
        <text x={X(0.62)} y={Y(curve.ac[250][1]) + 16} fill={C.sky} fontSize={12}>{isKo ? "음향" : "acoustic"}</text>
        {oZB - aZB > 0.02 && <text x={W - pad - 4} y={(Y(oZB) + Y(aZB)) / 2 + 4} fill={C.pink} fontSize={11} textAnchor="end">{isKo ? "금지된 진동수 (띠 간격)" : "forbidden frequencies (gap)"}</text>}
      </svg>
      <StatGrid>
        <Stat label={isKo ? "광학 포논 k = 0" : "Optical phonon at k = 0"} value={`${o0.toFixed(4)} √(κ₁/m₁)`} color={C.accent} />
        <Stat label={isKo ? "영역 경계: 음향 최대" : "Zone boundary: acoustic max"} value={aZB.toFixed(4)} color={C.sky} />
        <Stat label={isKo ? "영역 경계: 광학 최소" : "Zone boundary: optical min"} value={oZB.toFixed(4)} color={C.accent} />
        <Stat label={isKo ? "띠 간격" : "Band gap"} value={(oZB - aZB).toFixed(4)} color={C.pink} />
      </StatGrid>
      <HdSub>{isKo ? "원자의 실제 움직임 (흰색 = m₁, 주황 = m₂, 변위는 세로로 그림)" : "How the atoms actually move (white = m₁, orange = m₂; displacement drawn vertically)"}</HdSub>
      <Row>
        <button style={btnStyle(branch === "ac")} onClick={() => setBranch("ac")}>{isKo ? "음향 가지" : "Acoustic branch"}</button>
        <button style={btnStyle(branch === "op")} onClick={() => setBranch("op")}>{isKo ? "광학 가지" : "Optical branch"}</button>
        <Slider label="k (π/a)" value={kk} min={0} max={1} step={0.01} onChange={setKk} fmt={v => v.toFixed(2)} />
      </Row>
      <svg viewBox={`0 0 ${Wa} ${Ha}`} style={fullSvg(Wa)}>
        <line x1={px} x2={Wa - px} y1={Ha / 2} y2={Ha / 2} stroke="#1f2937" />
        {atoms.map((a, i) => i < atoms.length - 1 && <line key={`l${i}`} x1={a.x} y1={a.y} x2={atoms[i + 1].x} y2={atoms[i + 1].y} stroke="#475569" />)}
        {atoms.map((a, i) => <circle key={i} cx={a.x} cy={a.y} r={a.heavy ? 6 + 4 * Math.sqrt(mr) : 8} fill={a.heavy ? C.accent : "#e5e7eb"} />)}
      </svg>
      <Note>
        {isKo
          ? `질량 m₂/m₁ = ${mr.toFixed(2)}에서 영역 경계의 두 진동수는 √(2κ/m₂)와 √(2κ/m₁)입니다(κ₁ = κ₂일 때). 그 사이의 진동수를 가진 파동은 결정 속을 지나갈 수 없습니다. 질량비나 용수철비를 1로 맞추면 간격이 닫힙니다. 이때는 사실상 단위 세포가 a/2인 단원자 사슬이고, 광학 가지는 바깥 영역의 음향 가지를 접어 넣은 것일 뿐입니다. 광학 가지에서 k = 0에 가까이 가면 두 원자가 정확히 반대로, 질량에 반비례하는 진폭으로 움직여 질량 중심이 고정되는 것도 확인해 보십시오.`
          : `At m₂/m₁ = ${mr.toFixed(2)}, the zone-boundary frequencies are √(2κ/m₂) and √(2κ/m₁) (for κ₁ = κ₂). Waves with frequencies in between cannot travel through the crystal. Set the mass and spring ratios to 1 and the gap closes: the system is then really a monatomic chain with cell a/2, and the optical branch is just the acoustic branch folded back from outside the zone. Near k = 0 on the optical branch, check that the two atoms move exactly against each other with amplitudes inversely proportional to their masses, so the centre of mass stays fixed.`}
      </Note>
    </Card>
  );
}

function DosLab({ isKo }) {
  const [mr, setMr] = useState(2);
  const hist = useMemo(() => {
    const nb = 60, h = new Array(nb).fill(0), wmax = omegaDi(0, 1, mr, 1, 1)[1] * 1.0001, n = 20000;
    for (let i = 0; i < n; i++) {
      const k = -Math.PI + 2 * Math.PI * (i + 0.5) / n, [a, o] = omegaDi(k, 1, mr, 1, 1);
      h[Math.min(nb - 1, Math.floor(a / wmax * nb))]++;
      h[Math.min(nb - 1, Math.floor(o / wmax * nb))]++;
    }
    return { h: h.map(c => c / (2 * n) * nb / wmax), wmax, nb };
  }, [mr]);
  const W = 640, Ht = 240, pad = 44;
  const yMax = Math.min(6, Math.max(...hist.h)) * 1.05;
  const { X, Y } = plotScale(0, hist.wmax, 0, yMax, W, Ht, pad);
  const bw = X(hist.wmax / hist.nb) - X(0);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑪ 진동 상태 밀도 g(ω)" : "Lab ⑪ Vibrational density of states g(ω)"}</Hd>
      <Note>
        {isKo
          ? "k를 촘촘히 훑으며 각 진동수 구간에 모드가 몇 개 들어오는지 셉니다. 분산 곡선이 평평해지는 곳(dω/dk = 0, 영역 경계와 광학 가지 꼭대기)에서는 같은 진동수에 모드가 몰려 봉우리가 생깁니다. 간격 안에는 모드가 하나도 없습니다. 이 g(ω)가 열용량, 열전도, 중성자 산란 스펙트럼의 모양을 정합니다."
          : "Sweep k finely and count how many modes fall in each frequency bin. Where the dispersion flattens (dω/dk = 0, at the zone boundary and at the top of the optical branch) many modes share one frequency and a peak appears. The gap contains no modes at all. This g(ω) shapes the heat capacity, the thermal conductivity and neutron-scattering spectra."}
      </Note>
      <Row><Slider label={isKo ? "질량비 m₂/m₁" : "Mass ratio m₂/m₁"} value={mr} min={1} max={5} step={0.05} onChange={setMr} fmt={v => v.toFixed(2)} /></Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel="ω/√(κ/m₁)" ylabel="g(ω)" />
        {hist.h.map((c, i) => (
          <rect key={i} x={X(i * hist.wmax / hist.nb) + 0.5} y={Y(Math.min(c, yMax))} width={Math.max(1, bw - 1)} height={Y(0) - Y(Math.min(c, yMax))} fill={`${C.teal}bb`} />
        ))}
        {[0, 0.5, 1, 1.5].filter(v => v <= hist.wmax).map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
      </svg>
    </Card>
  );
}

function Count3DCard({ isKo }) {
  const rows = isKo
    ? [["Ar (fcc 고체)", "1", "3", "0", "3"], ["Si (다이아몬드)", "2", "3", "3", "6"], ["NaCl (암염)", "2", "3", "3", "6"], ["GaAs (섬아연석)", "2", "3", "3", "6"], ["일반: 원자 M개", "M", "3", "3(M − 1)", "3M"]]
    : [["Ar (fcc solid)", "1", "3", "0", "3"], ["Si (diamond)", "2", "3", "3", "6"], ["NaCl (rock salt)", "2", "3", "3", "6"], ["GaAs (zinc blende)", "2", "3", "3", "6"], ["General: M atoms", "M", "3", "3(M − 1)", "3M"]];
  const head = isKo ? ["결정", "기본 세포의 원자 수 M", "음향 가지", "광학 가지", "k마다 모드 수"] : ["Crystal", "Atoms per primitive cell M", "Acoustic", "Optical", "Modes per k"];
  return (
    <Card>
      <Hd>{isKo ? "3D로 확장: 모드 세기와 실제 사례" : "Extending to 3D: counting modes, and real cases"}</Hd>
      <Note>
        {isKo
          ? "3D에서는 원자마다 x, y, z 세 방향으로 움직일 수 있으므로, 원자가 M개인 기본 세포는 k마다 3M개의 모드를 가집니다. 그중 3개는 k = 0에서 ω = 0인 음향 가지(세로파 1, 가로파 2)이고, 나머지 3(M − 1)개가 광학 가지입니다."
          : "In 3D each atom can move along x, y and z, so a primitive cell with M atoms has 3M modes for every k. Three of them are acoustic branches with ω = 0 at k = 0 (one longitudinal, two transverse); the remaining 3(M − 1) are optical."}
      </Note>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 13.5, minWidth: 560 }}>
          <thead><tr>{head.map(h => <th key={h} style={{ textAlign: "left", padding: "6px 12px", borderBottom: `1px solid ${C.border}`, color: C.accentSoft }}>{h}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={{ padding: "6px 12px", fontFamily: j ? mono : undefined }}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <HdSub>{isKo ? "사례: Si의 광학 포논과 반도체 공정의 Raman 측정" : "Case: the optical phonon of Si and Raman metrology in chip making"}</HdSub>
      <Note>
        {isKo
          ? "Si의 k = 0 광학 포논은 Raman 산란으로 520.2 ± 0.5 cm⁻¹(300 K)에서 관측됩니다(Parker, Feldman, Ashkin, Phys. Rev. 155, 712, 1967). 이 진동수는 원자 사이 '용수철'의 세기를 그대로 반영합니다. 그래서 막에 응력이 걸리거나 온도가 바뀌면 봉우리가 이동하고, 이 이동을 재어 웨이퍼의 국소 응력과 온도를 읽습니다. 1D 이원자 사슬(m₁ = m₂ = m_Si, κ₁ = κ₂)의 식 ω(0) = 2√(κ/m)에 520.2 cm⁻¹를 넣으면 유효 용수철 상수는 약 112 N/m입니다. 3D 구조를 무시한 대략적인 값이지만 크기를 가늠하는 데 유용합니다."
          : "The k = 0 optical phonon of Si is observed by Raman scattering at 520.2 ± 0.5 cm⁻¹ (300 K) (Parker, Feldman and Ashkin, Phys. Rev. 155, 712, 1967). This frequency directly reflects the stiffness of the interatomic 'springs', so the peak shifts when a film is stressed or heated, and measuring the shift reads out local stress and temperature on a wafer. Putting 520.2 cm⁻¹ into the 1D diatomic-chain result ω(0) = 2√(κ/m) (m₁ = m₂ = m_Si, κ₁ = κ₂) gives an effective spring constant of about 112 N/m: a rough value that ignores the 3D structure but sets the scale."}
      </Note>
      <HdSub>{isKo ? "사례: 이온 결정이 원적외선을 흡수하는 이유" : "Case: why ionic crystals absorb far-infrared light"}</HdSub>
      <Note>
        {isKo
          ? "NaCl의 광학 포논에서는 Na⁺와 Cl⁻가 서로 반대로 움직이므로 결정 전체에 진동하는 쌍극자가 생깁니다. 빛의 파수 k_light = 2π/λ는 Brillouin 영역 크기 π/a보다 수백 배 이상 작아서 사실상 k ≈ 0입니다. 따라서 빛은 k ≈ 0의 광학 포논과 진동수가 맞을 때만 강하게 흡수·반사됩니다. 이 진동수가 원적외선 영역에 있습니다. 음향 포논은 k ≈ 0에서 진동수가 0이므로 빛과 이런 식으로 결합하지 못합니다."
          : "In the optical phonon of NaCl, Na⁺ and Cl⁻ move against each other and the whole crystal acquires an oscillating dipole. The wavenumber of light, k_light = 2π/λ, is hundreds of times smaller or more than the Brillouin-zone size π/a, so effectively k ≈ 0. Light is therefore strongly absorbed and reflected only when its frequency matches the k ≈ 0 optical phonon, which lies in the far infrared. Acoustic phonons have zero frequency at k ≈ 0 and cannot couple to light this way."}
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
        q: "P1. N₂ 분자를 지름 d = 0.37 nm의 강체구로 본다. (a) 편향각 θ(b)를 구하고, (b) 미분 단면적 dσ/dΩ와 전체 단면적 σ를 구하시오. (c) 산란이 모든 방향으로 고르다는 것은 무엇을 뜻하는가?",
        s: "(a) 구 표면에서 정반사하므로 입사 방향과 표면 법선이 이루는 각 α에 대해 sin α = b/d이고 θ = π − 2α = 2 arccos(b/d) (b < d), b ≥ d이면 θ = 0입니다. (b) dσ/dΩ = b/(sin θ |dθ/db|) = d²/4 = 0.0342 nm² sr⁻¹. 전 입체각 4π에 대해 적분하면 σ = πd² = 0.430 nm²로, 9주차의 충돌 단면적과 같습니다. (c) dσ/dΩ가 θ에 무관하므로 강체구는 모든 방향으로 똑같이 튕겨 냅니다. 실제 분자에서 특정 각도(무지개 각)에 봉우리가 보인다면 퍼텐셜에 인력 우물이 있다는 증거입니다.",
      },
      en: {
        q: "P1. Treat N₂ as a hard sphere of diameter d = 0.37 nm. (a) Find the deflection angle θ(b). (b) Find dσ/dΩ and the total cross section σ. (c) What does isotropic scattering mean?",
        s: "(a) Specular reflection at the sphere: the angle α between the incoming direction and the surface normal satisfies sin α = b/d, so θ = π − 2α = 2 arccos(b/d) for b < d, and θ = 0 for b ≥ d. (b) dσ/dΩ = b/(sin θ |dθ/db|) = d²/4 = 0.0342 nm² sr⁻¹. Integrating over 4π gives σ = πd² = 0.430 nm², the collision cross section of Week 9. (c) dσ/dΩ does not depend on θ, so a hard sphere scatters equally in all directions. A peak at a particular angle (the rainbow) in a real system is evidence of an attractive well.",
      },
    },
    {
      ko: {
        q: "P2. Ar–Ar 충돌을 LJ 퍼텐셜(ε/k ≈ 120 K, σ ≈ 3.4 Å)로 본다. 환산 에너지 E* = E/ε = 2일 때 무지개 각은 −65.3°, b_r = 1.453σ이다. (a) 실제 충돌 에너지와 상대 속도는? (b) b_r는 몇 Å인가? (c) E*를 키우면 무지개 각이 작아지는 이유는?",
        s: "(a) E = 2ε = 2 × 120 K × k = 3.31×10⁻²¹ J. 환산 질량 μ = 39.948/2 u = 3.32×10⁻²⁶ kg이므로 v_rel = (2E/μ)^½ = 447 m/s. (b) b_r = 1.453 × 3.4 Å = 4.94 Å. (c) 빠른 분자는 인력 우물 근처에 머무는 시간이 짧아 덜 끌려옵니다. 편향은 대략 (퍼텐셜)/(운동 에너지)에 비례하므로 θ_r ≈ −(상수)/E*입니다. 계산값도 E* = 2, 5, 10에서 −65.3°, −24.1°, −11.8°로 거의 1/E*로 줄어듭니다.",
      },
      en: {
        q: "P2. Model Ar–Ar collisions with the LJ potential (ε/k ≈ 120 K, σ ≈ 3.4 Å). At reduced energy E* = E/ε = 2 the rainbow angle is −65.3° with b_r = 1.453σ. (a) What are the collision energy and relative speed? (b) What is b_r in Å? (c) Why does the rainbow angle shrink as E* grows?",
        s: "(a) E = 2ε = 2 × 120 K × k = 3.31×10⁻²¹ J. With μ = 39.948/2 u = 3.32×10⁻²⁶ kg, v_rel = (2E/μ)^½ = 447 m/s. (b) b_r = 1.453 × 3.4 Å = 4.94 Å. (c) A fast molecule spends less time near the well and is pulled in less. The deflection scales roughly as (potential)/(kinetic energy), so θ_r ≈ −(constant)/E*. The computed values −65.3°, −24.1° and −11.8° at E* = 2, 5 and 10 indeed fall nearly as 1/E*.",
      },
    },
    {
      ko: {
        q: "P3. H + H₂ → H₂ + H의 LEPS 장벽은 0.416 eV이다. (a) 300 K와 1000 K에서 Boltzmann 인자 e^(−E_b/kT)는? (b) 고전 궤적 계산에서 '병진 0.30 eV + 진동 0.27 eV'(합 0.57 eV)인데 반응하지 않는 궤적이 있는 이유는? (c) 대칭 장벽에서는 병진과 진동 중 어느 쪽이 더 유리할 것으로 예상하는가?",
        s: "(a) 300 K: E_b/kT = 16.09, e^(−16.09) = 1.0×10⁻⁷. 1000 K: 4.83, 8.0×10⁻³. 온도를 3.3배 올리면 인자가 약 8만 배 커집니다. (b) 장벽을 넘으려면 안장점을 지나는 방향(반응 좌표)으로 충분한 운동량이 있어야 합니다. 에너지가 반응 좌표에 수직인 진동에 묶여 있거나, 진동 위상이 맞지 않아 BC가 압축된 순간에 A가 도착하면 되튀어 나옵니다. (c) 안장점이 r_AB = r_BC인 대칭 위치에 있으므로 어느 한쪽이 압도적이지 않습니다. 대략 병진과 진동이 모두 기여하는 중간 경우입니다.",
      },
      en: {
        q: "P3. The LEPS barrier of H + H₂ → H₂ + H is 0.416 eV. (a) What is the Boltzmann factor e^(−E_b/kT) at 300 K and 1000 K? (b) In the trajectory lab, why do some trajectories with 0.30 eV translation + 0.27 eV vibration (0.57 eV total) fail to react? (c) For a symmetric barrier, which form of energy would you expect to be more effective?",
        s: "(a) At 300 K, E_b/kT = 16.09 and e^(−16.09) = 1.0×10⁻⁷. At 1000 K, 4.83 and 8.0×10⁻³. Raising T by 3.3 times increases the factor about 80 000 times. (b) Crossing the barrier needs enough momentum along the direction through the saddle (the reaction coordinate). If the energy sits in vibration perpendicular to that direction, or A arrives while BC is compressed, the system bounces back. (c) The saddle sits at the symmetric point r_AB = r_BC, so neither form dominates; it is an intermediate case where both contribute.",
      },
    },
    {
      ko: {
        q: "P4. 물(298 K)에서 k_a = 7.4×10⁹ M⁻¹s⁻¹, 만남 쌍 상수 K = k_a/k_a′ = 1 M⁻¹, k_d ≫ k_et′이다. (a) k_et = 1×10⁸ s⁻¹와 (b) k_et = 1×10¹² s⁻¹일 때 관측 속도 상수 k_r을 구하고 어느 영역인지 말하시오.",
        s: "k_d ≫ k_et′이면 1/k_r = 1/k_a + k_a′/(k_a k_et)이므로 k_r = k_a k_et/(k_a′ + k_et), k_a′ = 7.4×10⁹ s⁻¹. (a) k_r = 7.4×10⁹ × 10⁸/(7.4×10⁹ + 10⁸) = 9.9×10⁷ M⁻¹s⁻¹ ≈ K k_et, 활성화 지배. (b) k_r = 7.4×10⁹ × 10¹²/(7.4×10⁹ + 10¹²) = 7.3×10⁹ M⁻¹s⁻¹ ≈ k_a, 확산 지배. (b)에서는 k_et를 열 배 더 키워도 k_r은 거의 변하지 않습니다. 분자 간 반응에서 Marcus 역전 영역이 잘 보이지 않는 이유입니다.",
      },
      en: {
        q: "P4. In water at 298 K, k_a = 7.4×10⁹ M⁻¹s⁻¹, the encounter constant K = k_a/k_a′ = 1 M⁻¹, and k_d ≫ k_et′. Find the observed k_r for (a) k_et = 1×10⁸ s⁻¹ and (b) k_et = 1×10¹² s⁻¹, and name the regime.",
        s: "With k_d ≫ k_et′, 1/k_r = 1/k_a + k_a′/(k_a k_et), so k_r = k_a k_et/(k_a′ + k_et) with k_a′ = 7.4×10⁹ s⁻¹. (a) k_r = 7.4×10⁹ × 10⁸/(7.4×10⁹ + 10⁸) = 9.9×10⁷ M⁻¹s⁻¹ ≈ K k_et: activation control. (b) k_r = 7.4×10⁹ × 10¹²/(7.4×10⁹ + 10¹²) = 7.3×10⁹ M⁻¹s⁻¹ ≈ k_a: diffusion control. In (b), making k_et ten times larger barely changes k_r, which is why the Marcus inverted region is hard to see in bimolecular reactions.",
      },
    },
    {
      ko: {
        q: "P5. λ = 0.8 eV인 계에서 ΔG° = −0.4, −0.8, −1.6 eV일 때 ΔG‡와 298.15 K의 exp(−ΔG‡/kT)를 구하시오. 어느 두 경우의 속도가 같아지는 조건은?",
        s: "ΔG‡ = (λ + ΔG°)²/4λ. −0.4 eV: 0.050 eV, 인자 0.143. −0.8 eV: 0, 인자 1(활성화 없음). −1.6 eV: 0.200 eV, 인자 4.2×10⁻⁴. 구동력이 −0.8에서 −1.6 eV로 두 배가 되었는데 속도는 2400배 느려집니다(역전 영역). 일반적으로 |λ + ΔG°|가 같은 두 반응은 ΔG‡가 같습니다. 예를 들어 λ = 0.8 eV에서 −0.4와 −1.2 eV는 같은 속도를 가집니다.",
      },
      en: {
        q: "P5. For λ = 0.8 eV, find ΔG‡ and exp(−ΔG‡/kT) at 298.15 K for ΔG° = −0.4, −0.8 and −1.6 eV. When do two reactions have the same rate?",
        s: "ΔG‡ = (λ + ΔG°)²/4λ. −0.4 eV: 0.050 eV, factor 0.143. −0.8 eV: 0, factor 1 (activationless). −1.6 eV: 0.200 eV, factor 4.2×10⁻⁴. Doubling the driving force from −0.8 to −1.6 eV makes the reaction 2400 times slower: the inverted region. In general, two reactions with the same |λ + ΔG°| have the same ΔG‡; with λ = 0.8 eV, −0.4 and −1.2 eV give equal rates.",
      },
    },
    {
      ko: {
        q: "P6. 단백질 속 전자 터널링이 '가장 가까울 때 약 10¹³ s⁻¹, 1.7 Å마다 10배 감소'를 따른다. (a) 거리가 5 Å 더 멀어지면 속도는 몇 배가 되는가? (b) 1 ms 안에 전자가 건너가려면 최대 몇 Å까지 더 떨어져도 되는가? (c) 이 결과가 생체 보조 인자 배치에 주는 의미는?",
        s: "(a) 10^(−5/1.7) = 1.1×10⁻³, 약 천 분의 1. (b) k ≥ 10³ s⁻¹이 필요하므로 10¹³ × 10^(−ΔR/1.7) ≥ 10³, ΔR ≤ 17 Å. (c) 수 Å 차이로 속도가 몇 자릿수씩 바뀌므로, 먼 거리를 한 번에 건너는 대신 여러 보조 인자를 가까이 이어 단계적으로 건너는 것이 유리합니다. 실제로 산화·환원 중심은 대체로 14 Å 이내 간격으로 놓여 있습니다(Page et al., Nature 402, 47, 1999).",
      },
      en: {
        q: "P6. Electron tunnelling in proteins follows 'about 10¹³ s⁻¹ at closest approach, tenfold slower every 1.7 Å'. (a) By what factor does the rate change if the distance grows by 5 Å? (b) For transfer within 1 ms, how much farther apart can the centres be? (c) What does this imply for how cofactors are arranged?",
        s: "(a) 10^(−5/1.7) = 1.1×10⁻³, about a thousandfold slower. (b) We need k ≥ 10³ s⁻¹: 10¹³ × 10^(−ΔR/1.7) ≥ 10³ gives ΔR ≤ 17 Å. (c) A few Å change the rate by orders of magnitude, so it pays to hop through a chain of closely spaced cofactors rather than cross a long gap at once. Redox centres are indeed mostly spaced 14 Å or less apart (Page et al., Nature 402, 47, 1999).",
      },
    },
    {
      ko: {
        q: "P7. Ar을 LJ 사슬(ε/k ≈ 120 K, σ ≈ 3.4 Å, m = 39.948 u)로 본다. (a) 용수철 상수 κ = V″(a)와 a를 구하시오. (b) 최대 진동수 ω_max와 파수(cm⁻¹), 1D 음속을 구하시오. (c) 영역 경계 k = π/a에서 군속도가 0인 물리적 의미는?",
        s: "(a) a = 2^(1/6)σ = 3.816 Å, κ = 72ε/(2^(1/3)σ²) = 57.15ε/σ² = 0.819 N/m. (b) √(κ/m) = 3.51×10¹² s⁻¹이므로 ω_max = 2√(κ/m) = 7.03×10¹² rad/s, ν = 1.12 THz, 37.3 cm⁻¹. 음속 v_s = a√(κ/m) = 1.34 km/s. (c) k = π/a에서는 이웃 원자가 정반대로 움직이는 정지파입니다. 오른쪽과 왼쪽으로 가는 파동이 Bragg 반사로 같은 세기로 섞여 있으므로 에너지가 어느 쪽으로도 전달되지 않습니다.",
      },
      en: {
        q: "P7. Model solid argon as an LJ chain (ε/k ≈ 120 K, σ ≈ 3.4 Å, m = 39.948 u). (a) Find the spring constant κ = V″(a) and a. (b) Find ω_max, its wavenumber in cm⁻¹, and the 1D sound speed. (c) What does zero group velocity at the zone boundary k = π/a mean physically?",
        s: "(a) a = 2^(1/6)σ = 3.816 Å and κ = 72ε/(2^(1/3)σ²) = 57.15ε/σ² = 0.819 N/m. (b) √(κ/m) = 3.51×10¹² s⁻¹, so ω_max = 2√(κ/m) = 7.03×10¹² rad/s, ν = 1.12 THz, 37.3 cm⁻¹. The sound speed is v_s = a√(κ/m) = 1.34 km/s. (c) At k = π/a neighbouring atoms move in opposite directions: a standing wave. Right- and left-going waves are mixed equally by Bragg reflection, so no energy is carried either way.",
      },
    },
    {
      ko: {
        q: "P8. NaCl을 1D 이원자 사슬(m_Na = 22.99 u, m_Cl = 35.45 u, 같은 용수철 C)로 본다. (a) 영역 경계의 광학/음향 진동수 비는? (b) 광학 가지의 k = 0 진동수와 음향 가지 최대 진동수의 비는? (c) 3D NaCl 결정 1몰(식 단위)의 고온 열용량은?",
        s: "(a) ω_op(π/a)/ω_ac(π/a) = √(2C/m_Na)/√(2C/m_Cl) = √(35.45/22.99) = 1.242. 이 사이가 띠 간격입니다. (b) ω_op(0) = √(2C(1/m_Na + 1/m_Cl)), ω_ac,max = √(2C/m_Cl)이므로 비는 √(1 + m_Cl/m_Na) = 1.594. (c) 기본 세포에 원자 2개이므로 k마다 6개 모드(음향 3, 광학 3)이고, 식 단위 1몰에 6N_A개 모드가 있습니다. 고온에서 모드마다 k이므로 C_V = 6R = 49.9 J K⁻¹ mol⁻¹(원자 1몰당 3R, Dulong–Petit).",
      },
      en: {
        q: "P8. Model NaCl as a 1D diatomic chain (m_Na = 22.99 u, m_Cl = 35.45 u, equal springs C). (a) What is the ratio of the optical to acoustic frequency at the zone boundary? (b) What is the ratio of the k = 0 optical frequency to the maximum acoustic frequency? (c) What is the high-temperature heat capacity of one mole of 3D NaCl (formula units)?",
        s: "(a) ω_op(π/a)/ω_ac(π/a) = √(2C/m_Na)/√(2C/m_Cl) = √(35.45/22.99) = 1.242; the band gap lies in between. (b) ω_op(0) = √(2C(1/m_Na + 1/m_Cl)) and ω_ac,max = √(2C/m_Cl), so the ratio is √(1 + m_Cl/m_Na) = 1.594. (c) The primitive cell has 2 atoms, so 6 modes per k (3 acoustic, 3 optical) and 6N_A modes per mole of formula units. Each mode contributes k at high temperature, so C_V = 6R = 49.9 J K⁻¹ mol⁻¹ (3R per mole of atoms, Dulong–Petit).",
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
            ? "풀이를 열기 전에 스스로 풀어 보십시오. P1–P2는 분자선 산란, P3은 퍼텐셜 에너지 면, P4–P6은 전자 전달, P7–P8은 결정 진동과 포논입니다. 수치는 Raw 코드 탭의 Python·C++ 코드로 검산했습니다."
            : "Attempt each before opening the solution. P1–P2 cover molecular-beam scattering, P3 potential energy surfaces, P4–P6 electron transfer, and P7–P8 lattice vibrations and phonons. The numbers were checked with the Python and C++ codes in the Raw Codes tab."}
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
  scattering_deflection: {
    ko: "편향 함수·무지개 산란·강체구 검산", en: "Deflection function · rainbow · hard-sphere check",
    codes: { python: PY_SCAT, matlab: ML_SCAT, julia: JL_SCAT, cpp: CPP_SCAT },
  },
  leps_trajectory: {
    ko: "LEPS 면·궤적·Polanyi 규칙", en: "LEPS surface · trajectories · Polanyi rules",
    codes: { python: PY_LEPS, matlab: ML_LEPS, julia: JL_LEPS, cpp: CPP_LEPS },
  },
  marcus_et: {
    ko: "Marcus 속도·정상 상태 분자 간 속도", en: "Marcus rate · bimolecular steady state",
    codes: { python: PY_MARCUS, matlab: ML_MARCUS, julia: JL_MARCUS, cpp: CPP_MARCUS },
  },
  phonon_chain: {
    ko: "1D 사슬 분산·이원자 띠 간격·포논 열용량", en: "1D chain dispersion · diatomic gap · phonon heat capacity",
    codes: { python: PY_PHON, matlab: ML_PHON, julia: JL_PHON, cpp: CPP_PHON },
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
  const [topic, setTopic] = useState("scattering_deflection");
  const [cl, setCl] = useState("python");
  const [copied, setCopied] = useState(false);
  const code = CODE_TOPICS[topic].codes[cl];
  const fname = `wk11_${topic}.${LANG_META[cl].ext}`;

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
            ? "이 페이지의 인터랙티브 뒤에 있는 계산을 직접 실행해 볼 수 있는 독립 코드입니다. Python과 C++은 실행해 확인한 값입니다: 강체구 dσ/dΩ = 0.25(모든 각도, Monte Carlo ±0.004), LJ 무지개 각 −65.31°(E* = 2)·−24.07°(5)·−11.83°(10), LEPS H₃ 안장점 0.931 Å·장벽 0.416 eV, H₂ 조화 양자 4395 cm⁻¹, Polanyi 실험 이른 장벽 P = 1.00(병진)/0.50(진동)·늦은 장벽 0.00/0.44, 물의 k_a = 7.43×10⁹ M⁻¹s⁻¹, λ = 1 eV·V = 0.01 eV의 최대 k_ET = 1.68×10¹² s⁻¹, 역전 영역 대칭 k(−0.5)/k(−1.5) = 1, 유한 사슬 고유값과 해석해의 차이 < 2×10⁻⁸, 포논 열용량 0.052(kT = 0.05)·0.960(kT = 2), Si 유효 용수철 112 N/m. MATLAB과 Julia 판은 같은 알고리즘을 옮긴 것입니다."
            : "Standalone codes for the calculations behind every interactive on this page. The Python and C++ versions were run and give: hard-sphere dσ/dΩ = 0.25 at all angles (Monte Carlo ±0.004); LJ rainbow angles −65.31° (E* = 2), −24.07° (5) and −11.83° (10); LEPS H₃ saddle at 0.931 Å with a 0.416 eV barrier; H₂ harmonic quantum 4395 cm⁻¹; Polanyi experiment P = 1.00 (translation) vs 0.50 (vibration) on the early barrier and 0.00 vs 0.44 on the late barrier; k_a = 7.43×10⁹ M⁻¹s⁻¹ in water; maximum k_ET = 1.68×10¹² s⁻¹ for λ = 1 eV and V = 0.01 eV; inverted-region symmetry k(−0.5)/k(−1.5) = 1; finite-chain eigenvalues within 2×10⁻⁸ of the analytic dispersion; phonon heat capacity 0.052 (kT = 0.05) and 0.960 (kT = 2); effective Si spring 112 N/m. The MATLAB and Julia versions port the same algorithms."}
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
