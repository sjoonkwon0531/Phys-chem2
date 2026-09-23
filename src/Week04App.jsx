// ============================================================
// Week04App.jsx — Hydrogen Atom, Spin & Gas Transport
// Physical Chemistry 2 (물리화학 2)
// SKKU School of Chemical Engineering
// Smart Process & Materials Design Lab (SPMDL)
// Prof. S. Joon Kwon
// ------------------------------------------------------------
// Topics covered (Wk04 Part 1 / Part 2):
//   • Hydrogen atom — Bohr model, E = −13.606/n² eV, quantum
//     numbers |n,l,m,s⟩, degeneracy 2n², emission spectral series
//     (Lyman/Balmer/Paschen…), orbitals, electron configurations
//   • Spin — S = (ℏ/2)σ (Pauli matrices), sequential measurement,
//     Zeeman interaction, spin operators & unitary basis change
//   • Kinetic model of gases — P = nM⟨v²⟩/3V, equipartition &
//     heat-capacity ladder, Maxwell-Boltzmann speed distribution
//   • Transport — collision kinetics, mean free path, D/κ/η,
//     Reynolds analogy (Sc·Le·Pr), collision flux & effusion
// ============================================================
import { useState, useEffect, useRef, useMemo } from "react";
import {
  PY_HATOM, ML_HATOM, JL_HATOM, CPP_HATOM,
  PY_SPIN, ML_SPIN, JL_SPIN, CPP_SPIN,
  PY_MAXWELL, ML_MAXWELL, JL_MAXWELL, CPP_MAXWELL,
  PY_TRANSPORT, ML_TRANSPORT, JL_TRANSPORT, CPP_TRANSPORT,
} from "./Week04Codes";

// ── i18n ─────────────────────────────────────────────────────
const i18n = {
  ko: {
    weekTitle: "Week 4 — 수소 원자, 스핀, 기체 수송현상",
    subtitle: "Bohr 사다리 · 스펙트럼 계열 · 스핀 측정 · Maxwell-Boltzmann · 평균자유행로",
    tabs: {
      overview: "개요",
      hydrogen: "수소 스펙트럼",
      atoms: "오비탈 & 주기율표",
      spin: "스핀",
      maxwell: "기체운동론",
      transport: "수송현상",
      practice: "연습문제",
      codes: "Raw 코드",
    },
  },
  en: {
    weekTitle: "Week 4 — Hydrogen Atom, Spin & Gas Transport",
    subtitle: "Bohr ladder · Spectral series · Spin measurement · Maxwell-Boltzmann · Mean free path",
    tabs: {
      overview: "Overview",
      hydrogen: "H Spectrum",
      atoms: "Orbitals & Periodic Table",
      spin: "Spin",
      maxwell: "Kinetic Theory",
      transport: "Transport",
      practice: "Practice",
      codes: "Raw Codes",
    },
  },
};

// ── design tokens (Week 4 accent: emerald) ───────────────────
const C = {
  bg: "#0b0f17",
  panel: "#111827",
  card: "#1f2937",
  border: "#374151",
  text: "#e5e7eb",
  textDim: "#9ca3af",
  accent: "#34d399",
  accentSoft: "#6ee7b7",
  amber: "#f59e0b",
  sky: "#38bdf8",
  blueSoft: "#60a5fa",
  ok: "#10b981",
  err: "#ef4444",
  purple: "#a78bfa",
  cyan: "#22d3ee",
  pink: "#f472b6",
};

// physical constants
const RY = 13.605693;          // eV (Rydberg energy)
const HC = 1239.841984;        // eV·nm
const A0NM = 0.0529177;        // nm (Bohr radius)
const RGAS = 8.314462618;      // J/mol·K
const KB = 1.380649e-23;       // J/K
const NAV = 6.02214076e23;
const MUB = 5.7883818060e-5;   // eV/T (Bohr magneton)
const EH = n => -RY / (n * n); // hydrogen levels [eV]

// visible wavelength [nm] → CSS color
function wlColor(wl) {
  let r = 0, g = 0, b = 0;
  if (wl >= 380 && wl < 440) { r = -(wl - 440) / 60; b = 1; }
  else if (wl >= 440 && wl < 490) { g = (wl - 440) / 50; b = 1; }
  else if (wl >= 490 && wl < 510) { g = 1; b = -(wl - 510) / 20; }
  else if (wl >= 510 && wl < 580) { r = (wl - 510) / 70; g = 1; }
  else if (wl >= 580 && wl < 645) { r = 1; g = -(wl - 645) / 65; }
  else if (wl >= 645 && wl <= 780) { r = 1; }
  else return null;                              // outside visible
  let f = 1;
  if (wl > 700) f = 0.3 + 0.7 * (780 - wl) / 80;
  if (wl < 420) f = 0.3 + 0.7 * (wl - 380) / 40;
  const q = v => Math.round(255 * Math.pow(Math.max(v * f, 0), 0.8));
  return `rgb(${q(r)},${q(g)},${q(b)})`;
}

// =============================================================
// MAIN COMPONENT
// =============================================================
export default function Week04App({ onBack, lang: langProp, onLangChange }) {
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
        {tab === "hydrogen" && <HydrogenTab lang={lang} />}
        {tab === "atoms" && <AtomsTab lang={lang} />}
        {tab === "spin" && <SpinTab lang={lang} />}
        {tab === "maxwell" && <MaxwellTab lang={lang} />}
        {tab === "transport" && <TransportTab lang={lang} />}
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
    background: active ? "rgba(52,211,153,0.14)" : "transparent",
    color: active ? C.accentSoft : C.textDim,
    border: `1px solid ${active ? "rgba(52,211,153,0.4)" : "transparent"}`,
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
function usePlotScale(xMin, xMax, yMin, yMax, W, Ht, pad) {
  const X = x => pad + (W - 2 * pad) * (x - xMin) / (xMax - xMin || 1);
  const Y = y => Ht - pad - (Ht - 2 * pad) * (y - yMin) / (yMax - yMin || 1);
  return { X, Y };
}
function pathOf(pts, X, Y) {
  return pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${X(x).toFixed(2)} ${Y(y).toFixed(2)}`).join(" ");
}
const svgBox = W => ({ background: "#0d1117", borderRadius: 10, border: `1px solid ${C.border}`, flex: `1 1 ${Math.min(W, 380)}px`, maxWidth: "100%", height: "auto" });
const chk = () => ({ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.text, cursor: "pointer" });

// =============================================================
// 1) OVERVIEW
// =============================================================
function Overview({ lang }) {
  const isKo = lang === "ko";
  const timeline = [
    { yr: "1860", who: "Maxwell", ko: "기체 분자 속력 분포 유도 — 통계역학의 여명", en: "Derives the molecular speed distribution — dawn of statistical mechanics", c: C.cyan },
    { yr: "1872", who: "Boltzmann", ko: "e^{−E/kT} 인자 — 에너지와 확률을 잇다", en: "The e^{−E/kT} factor — linking energy and probability", c: C.cyan },
    { yr: "1885", who: "Balmer", ko: "수소 가시광선 4개 선의 정수 공식 발견", en: "Finds the integer formula behind hydrogen's four visible lines", c: C.textDim },
    { yr: "1913", who: "Bohr", ko: "mvr = nℏ 가설로 E = −13.6/n² eV — 스펙트럼 완전 설명", en: "mvr = nℏ gives E = −13.6/n² eV — the spectrum explained", c: C.amber },
    { yr: "1922", who: "Stern & Gerlach", ko: "은 원자빔이 자기장에서 두 갈래로 — 스핀의 실험적 발견", en: "A silver beam splits in two — spin discovered experimentally", c: C.purple },
    { yr: "1925", who: "Pauli · Uhlenbeck · Goudsmit", ko: "배타원리와 스핀 ±ℏ/2 — 네 번째 양자수", en: "Exclusion principle and spin ±ℏ/2 — the fourth quantum number", c: C.purple },
    { yr: "1926", who: "Schrödinger", ko: "파동방정식으로 수소 원자 정확히 풀림 — Bohr와 완벽 일치", en: "Wave equation solves hydrogen exactly — perfect agreement with Bohr", c: C.accent },
    { yr: "1928", who: "Dirac", ko: "상대론적 방정식에서 스핀이 저절로 등장", en: "Spin emerges automatically from the relativistic equation", c: C.purple },
    { yr: "1909", who: "Knudsen", ko: "분출(effusion)로 증기압 측정 — 오늘도 쓰는 기법", en: "Effusion as a vapor-pressure gauge — still in use today", c: C.ok },
  ];
  return (
    <div>
      <Card>
        <Hd>{isKo ? "지난주에서 이번 주로: 원자를 완성하고, 기체로 나간다" : "From last week: finish the atom, then step out into the gas"}</Hd>
        <Note>
          {isKo
            ? "3주차에 우리는 각운동량과 수소 원자의 양자수 n, l, m을 만났습니다. 이번 주 전반부는 그 결실입니다 — 에너지 사다리 E = −13.6/n² eV가 수소의 모든 스펙트럼 선을 설명하고, 축퇴 2n²이 주기율표의 껍질 구조(2, 8, 18, 32)를 만들며, 마지막 양자수인 스핀이 Pauli 배타원리와 함께 화학 전체의 뼈대를 세웁니다. 후반부는 시선을 돌립니다: 원자 하나가 아니라 10²³개가 모이면? Maxwell-Boltzmann 분포와 평균자유행로로부터 확산·점도·열전도 — 화학공학의 수송현상이 탄생합니다."
            : "Week 3 gave us angular momentum and the quantum numbers n, l, m of hydrogen. The first half of this week is the payoff — the ladder E = −13.6/n² eV explains every hydrogen spectral line, the 2n² degeneracy builds the periodic table's shells (2, 8, 18, 32), and the last quantum number, spin, together with Pauli exclusion, erects the skeleton of all chemistry. Then we turn around: what happens when 10²³ atoms gather? From the Maxwell-Boltzmann distribution and the mean free path come diffusion, viscosity, thermal conduction — the birth of transport phenomena, the chemical engineer's home turf."}
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
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: e.c, fontWeight: 700, marginRight: 10 }}>{e.yr}</span>
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
            { name: isKo ? "수소 에너지 준위" : "Hydrogen levels", eq: "Eₙ = −13.606/n² eV,  λ = hc/ΔE", c: C.amber },
            { name: isKo ? "스핀 연산자" : "Spin operators", eq: "S = (ℏ/2)σ,  [Sx,Sy] = iℏSz", c: C.purple },
            { name: isKo ? "Maxwell 속력 분포" : "Maxwell speed distribution", eq: "f(v) = 4π(M/2πRT)^{3/2} v² e^{−Mv²/2RT}", c: C.cyan },
            { name: isKo ? "평균자유행로·수송" : "Mean free path & transport", eq: "λ = kT/√2σP,  D = ⅓λv̄", c: C.ok },
          ].map((k, i) => (
            <div key={i} style={{ background: C.card, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: k.c, marginBottom: 6 }}>{k.name}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: C.text }}>{k.eq}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Hd>{isKo ? "학습 목표" : "Learning outcomes"}</Hd>
        {[
          isKo ? "Bohr 모델의 힘 균형 + mvr = nℏ에서 rₙ = n²a₀, Eₙ = −13.6/n² eV를 유도할 수 있다." : "Derive rₙ = n²a₀ and Eₙ = −13.6/n² eV from force balance plus mvr = nℏ.",
          isKo ? "Lyman·Balmer·Paschen 계열의 방출 파장을 λ = hc/ΔE로 계산하고 가시광 영역 선을 식별할 수 있다." : "Compute emission wavelengths of the Lyman/Balmer/Paschen series via λ = hc/ΔE and identify the visible lines.",
          isKo ? "주어진 n에 대해 |n,l,m,s⟩ 상태를 전부 세어 축퇴 2n²을 확인하고, 껍질 용량 2·8·18·32와 연결할 수 있다." : "Count all |n,l,m,s⟩ states for given n, confirm the 2n² degeneracy, and connect it to shell capacities 2·8·18·32.",
          isKo ? "Aufbau 순서로 Z ≤ 36 원소의 전자배치를 쓰고, 4s가 3d보다 먼저 차는 이유를 설명할 수 있다." : "Write electron configurations up to Z = 36 in aufbau order and explain why 4s fills before 3d.",
          isKo ? "Pauli 행렬로 스핀 측정을 기술하고, 순차 측정(z→x→z)에서 정보가 지워지는 이유를 교환자로 설명할 수 있다." : "Describe spin measurement with Pauli matrices and explain, via commutators, why sequential z→x→z measurements erase information.",
          isKo ? "Zeeman 갈라짐 ΔE = g μB B를 계산하고 ESR/MRI와 연결할 수 있다; 유니터리 기저 변환이 내적을 보존함을 안다." : "Compute the Zeeman splitting ΔE = g μB B (ESR/MRI connection); know that unitary basis changes preserve inner products.",
          isKo ? "운동론에서 PV = ⅓nM⟨v²⟩을 유도하고, Maxwell 분포의 세 특성 속력과 등분배 비열 사다리를 계산할 수 있다." : "Derive PV = ⅓nM⟨v²⟩, compute the three characteristic speeds of the Maxwell distribution, and the equipartition Cv ladder.",
          isKo ? "평균자유행로 λ = kT/√2σP로부터 D·κ·η = ⅓λv̄류 수송계수와 분출 속도(Knudsen 증기압 측정)를 계산할 수 있다." : "From λ = kT/√2σP obtain the ⅓λv̄-family transport coefficients D·κ·η and effusion rates (Knudsen vapor-pressure method).",
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
    { t: isKo ? "수소 원자" : "Hydrogen atom", s: "Eₙ = −13.6/n²", c: C.amber },
    { t: isKo ? "축퇴·주기율표" : "Degeneracy · periodic table", s: "2n² → 2,8,18,32", c: C.blueSoft },
    { t: isKo ? "스핀" : "Spin", s: "S = (ℏ/2)σ", c: C.purple },
    { t: isKo ? "Maxwell 분포" : "Maxwell distribution", s: "f(v) ∝ v²e^{−Mv²/2RT}", c: C.cyan },
    { t: isKo ? "수송현상" : "Transport", s: "D = ⅓λv̄", c: C.ok },
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
            <div style={{ fontSize: 11, color: C.textDim, fontFamily: "'JetBrains Mono',monospace", marginTop: 3 }}>{st.s}</div>
          </div>
          {i < steps.length - 1 && <div style={{ color: C.textDim, padding: "0 8px", fontSize: 18 }}>→</div>}
        </div>
      ))}
    </div>
  );
}

// =============================================================
// 2) HYDROGEN SPECTRUM — Bohr ladder, series explorer, degeneracy
// =============================================================
function HydrogenTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <Card>
        <Hd>{isKo ? "Bohr 모델: 두 줄짜리 가설이 스펙트럼 전체를 열다" : "Bohr's model: a two-line hypothesis unlocks the whole spectrum"}</Hd>
        <Eq>
          mv²/r = Zk_e e²/r²  ({isKo ? "힘 균형" : "force balance"})  +  mvr = nℏ  →  rₙ = n²a₀/Z,  Eₙ = −13.606 Z²/n² eV
        </Eq>
        <Note>
          {isKo
            ? "구심력과 Coulomb 인력의 균형에 '각운동량은 nℏ 단위로만 존재한다'는 가설 하나를 더하면 반지름과 에너지가 모두 양자화됩니다: a₀ = ℏ²/k_e me² = 0.529 Å (Bohr 반지름). 놀라운 점 — 13년 뒤 Schrödinger 방정식을 정확히 풀어도(3주차의 라디얼 방정식) 에너지는 한 치도 다르지 않은 E = −13.606/n² eV가 나옵니다. 옳은 답을 먼저 맞힌 반고전 모델이었던 셈입니다."
            : "Add one hypothesis — angular momentum comes only in units of nℏ — to the balance of centripetal and Coulomb forces, and both radius and energy quantize: a₀ = ℏ²/k_e me² = 0.529 Å. The remarkable part: solving the Schrödinger equation exactly 13 years later (Week 3's radial equation) gives E = −13.606/n² eV to the last digit. A semi-classical model that got the right answer first."}
        </Note>
        <BohrLadder isKo={isKo} />
      </Card>
      <SpectrumLab isKo={isKo} />
      <DegeneracyCard isKo={isKo} />
    </div>
  );
}

function BohrLadder({ isKo }) {
  const [nSel, setNSel] = useState(2);
  const W = 700, Ht = 300, pad = 46;
  const { X, Y } = usePlotScale(0, 1, -14.2, 0.8, W, Ht, pad);
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "8px 0", alignItems: "center" }}>
        {[1, 2, 3, 4, 5, 6].map(n => (
          <button key={n} onClick={() => setNSel(n)} style={{ ...btnStyle(nSel === n), padding: "6px 13px" }}>n = {n}</button>
        ))}
        <Pill color={C.amber}>Eₙ = {EH(nSel).toFixed(3)} eV</Pill>
        <Pill color={C.cyan}>rₙ = n²a₀ = {(nSel * nSel * A0NM * 10).toFixed(2)} Å</Pill>
        <Pill color={C.ok}>{isKo ? "이온화" : "ionization"}: {(-EH(nSel)).toFixed(3)} eV</Pill>
      </div>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={{ ...svgBox(W), flex: "none", width: "100%" }}>
        <line x1={X(0.05)} y1={Y(0)} x2={X(0.72)} y2={Y(0)} stroke="#64748b" strokeDasharray="5 4" />
        <text x={X(0.73)} y={Y(0) + 4} fill={C.textDim} fontSize={10.5}>E = 0 (n = ∞, {isKo ? "이온화" : "ionized"})</text>
        {[1, 2, 3, 4, 5, 6, 7].map(n => (
          <g key={n}>
            <line x1={X(0.05)} y1={Y(EH(n))} x2={X(0.72)} y2={Y(EH(n))}
              stroke={n === nSel ? C.accent : "#3b4a61"} strokeWidth={n === nSel ? 2.4 : 1.3} />
            <text x={X(0.74)} y={Y(EH(n)) + 4} fill={n === nSel ? C.accent : C.textDim} fontSize={10.5}
              fontFamily="'JetBrains Mono',monospace">n={n}  {EH(n).toFixed(2)} eV</text>
          </g>
        ))}
        {/* bound-state brace */}
        <text x={X(0.05)} y={Y(-14) + 2} fill={C.textDim} fontSize={10.5}>
          {isKo ? "결합 상태 (E < 0) · 간격이 1/n²로 좁아지며 사다리가 위로 몰림" : "bound states (E < 0) · rungs crowd upward as 1/n²"}
        </text>
      </svg>
      <Note>
        {isKo
          ? "상자 속 입자(2주차)와 정반대입니다 — 상자는 Eₙ ∝ n²로 위로 벌어졌지만, Coulomb 우물은 Eₙ ∝ −1/n²로 위로 몰립니다. 사다리 꼭대기(E = 0)에 무한히 많은 준위가 쌓이고 그 위는 연속 스펙트럼(이온화된 자유전자)입니다."
          : "The exact opposite of the particle in a box (Week 2) — the box ladder spreads upward as n², while the Coulomb well crowds upward as −1/n². Infinitely many rungs pile up beneath E = 0, and above it lies the continuum of ionized free electrons."}
      </Note>
    </div>
  );
}

// -- spectral series explorer --------------------------------
function SpectrumLab({ isKo }) {
  const [n1, setN1] = useState(2);
  const [n2, setN2] = useState(3);
  const seriesNames = { 1: "Lyman", 2: "Balmer", 3: "Paschen", 4: "Brackett", 5: "Pfund" };
  const n2eff = Math.max(n2, n1 + 1);
  const dE = EH(n2eff) - EH(n1);
  const lam = HC / dE;
  const col = wlColor(lam);
  const region = lam < 380 ? (isKo ? "자외선 (UV)" : "ultraviolet") : lam > 780 ? (isKo ? "적외선 (IR)" : "infrared") : (isKo ? "가시광선" : "visible");

  const W = 720, Ht = 210, pad = 46;
  const { X } = usePlotScale(370, 700, 0, 1, W, Ht, pad);
  const balmer = [];
  for (let m = 3; m <= 12; m++) {
    const l = HC / (EH(m) - EH(2));
    if (l >= 370 && l <= 700) balmer.push([m, l]);
  }
  return (
    <Card>
      <Hd>{isKo ? "방출 스펙트럼 실험실: 어떤 전이가 어떤 색을 내는가" : "Emission-spectrum lab: which jump makes which color?"}</Hd>
      <Eq>λ = hc/ΔE = 1239.84 eV·nm / (E(n₂) − E(n₁)),   n₂ → n₁ ({isKo ? "위에서 아래로 떨어지며 광자 방출" : "falling down emits a photon"})</Eq>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", margin: "10px 0" }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12.5, color: C.textDim }}>{isKo ? "도착 준위 n₁" : "final n₁"}</span>
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => { setN1(n); if (n2 <= n) setN2(n + 1); }}
              style={{ ...btnStyle(n1 === n), padding: "5px 11px", fontSize: 12 }}>{n}</button>
          ))}
        </div>
        <Slider label={isKo ? "출발 준위 n₂" : "initial n₂"} value={n2eff} min={n1 + 1} max={n1 + 8} step={1} onChange={setN2} width={160} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10, marginBottom: 12 }}>
        <Stat label={isKo ? "계열" : "series"} value={`${seriesNames[n1]} (→${n1})`} color={C.accentSoft} />
        <Stat label="ΔE" value={`${dE.toFixed(4)} eV`} color={C.amber} />
        <Stat label="λ" value={`${lam.toFixed(1)} nm`} color={col || C.cyan} />
        <Stat label={isKo ? "영역" : "region"} value={region} color={col || (lam < 380 ? C.purple : C.err)} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
        <div style={{
          width: 66, height: 66, borderRadius: "50%",
          background: col ? `radial-gradient(circle at 35% 35%, ${col}, #0d1117 82%)` : "#1b2233",
          boxShadow: col ? `0 0 22px ${col}` : "none", border: `1px solid ${C.border}`,
        }} />
        <div style={{ fontSize: 12.5, color: C.textDim, lineHeight: 1.7 }}>
          {col
            ? (isKo ? "방출 광자의 실제 색" : "actual color of the emitted photon")
            : (isKo ? "가시광 밖 — 눈에는 보이지 않습니다" : "outside the visible — invisible to the eye")}<br />
          <span style={{ fontFamily: "'JetBrains Mono',monospace", color: C.text }}>
            {n2eff} → {n1},  {lam.toFixed(1)} nm
          </span>
        </div>
      </div>
      <HdSub>{isKo ? "Balmer 계열 (n → 2): 눈에 보이는 수소" : "The Balmer series (n → 2): hydrogen you can see"}</HdSub>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={{ ...svgBox(W), flex: "none", width: "100%" }}>
        <rect x={pad} y={30} width={W - 2 * pad} height={Ht - 90} fill="#05070d" stroke="#273244" />
        {balmer.map(([m, l]) => (
          <g key={m}>
            <line x1={X(l)} y1={30} x2={X(l)} y2={Ht - 60} stroke={wlColor(l) || "#7c3aed"}
              strokeWidth={n1 === 2 && m === n2eff ? 5 : 2.4} />
            {m <= 7 && <text x={X(l)} y={22} fill={m === n2eff && n1 === 2 ? C.accent : C.textDim} fontSize={9.5} textAnchor="middle">{m}→2</text>}
          </g>
        ))}
        {[400, 450, 500, 550, 600, 650, 700].map(v => (
          <text key={v} x={X(v)} y={Ht - 42} fill={C.textDim} fontSize={9.5} textAnchor="middle">{v}</text>
        ))}
        <text x={W / 2} y={Ht - 22} fill={C.textDim} fontSize={11} textAnchor="middle">{isKo ? "파장 [nm] — 방전관 속 수소가 내는 바로 그 선들" : "wavelength [nm] — the very lines a hydrogen discharge tube emits"}</text>
      </svg>
      <Note>
        {isKo
          ? "Hα 656 nm(빨강), Hβ 486 nm(청록), Hγ 434 nm(보라)… 1885년 스위스의 수학 교사 Balmer는 이 네 개의 선에서 정수 공식을 찾아냈고, 28년 뒤 Bohr가 그 이유를 설명했습니다. n₁ = 1로 바꿔 보세요 — Lyman 계열은 전부 자외선(121.6 nm 이하)이라 색 원판이 꺼집니다. n₁ = 3의 Paschen 계열은 전부 적외선입니다. 별의 조성 분석부터 네온사인까지, 원소마다 다른 이 '지문'이 분광학의 출발점입니다."
          : "Hα 656 nm (red), Hβ 486 nm (teal), Hγ 434 nm (violet)… In 1885 Balmer, a Swiss schoolteacher, found the integer formula hiding in these four lines; Bohr explained why 28 years later. Try n₁ = 1 — the Lyman series is entirely ultraviolet (≤ 121.6 nm), so the color disk goes dark. Paschen (n₁ = 3) is all infrared. From stellar composition to neon signs, these element-specific fingerprints are where spectroscopy begins."}
      </Note>
    </Card>
  );
}

// -- degeneracy counter --------------------------------------
function DegeneracyCard({ isKo }) {
  const [n, setN] = useState(3);
  const rows = [];
  for (let l = 0; l < n; l++) rows.push({ l, sub: "spdfgh"[l] || `l=${l}`, m: 2 * l + 1, states: 2 * (2 * l + 1) });
  const total = rows.reduce((s, r) => s + r.states, 0);
  return (
    <Card>
      <Hd>{isKo ? "축퇴 세기: 2n²이 주기율표를 만든다" : "Counting degeneracy: 2n² builds the periodic table"}</Hd>
      <Eq>
        {isKo ? "준위 n의 상태 수" : "states in level n"} = Σ_l 2(2l+1) = 2(1+3+5+…+(2n−1)) = 2n²
      </Eq>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", margin: "8px 0" }}>
        <Slider label="n" value={n} min={1} max={5} step={1} onChange={setN} width={160} />
        <Pill color={C.accent}>{isKo ? "총 상태 수" : "total states"} = {total} = 2·{n}²</Pill>
        <Pill color={C.blueSoft}>{isKo ? "껍질" : "shell"} {"KLMNO"[n - 1]}</Pill>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12.5, fontFamily: "'JetBrains Mono',monospace", minWidth: 480 }}>
          <thead>
            <tr style={{ color: C.textDim }}>
              {["l", isKo ? "부껍질" : "subshell", isKo ? "m 값 (2l+1개)" : "m values (2l+1)", isKo ? "×2 (스핀)" : "×2 (spin)"].map(h => (
                <th key={h} style={{ padding: "6px 14px", borderBottom: `1px solid ${C.border}`, textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.l} style={{ color: C.text }}>
                <td style={{ padding: "5px 14px", color: C.accent }}>{r.l}</td>
                <td style={{ padding: "5px 14px" }}>{n}{r.sub}</td>
                <td style={{ padding: "5px 14px", color: C.textDim }}>
                  {Array.from({ length: 2 * r.l + 1 }, (_, i) => i - r.l).join(", ")}
                </td>
                <td style={{ padding: "5px 14px", color: C.ok }}>{r.states}</td>
              </tr>
            ))}
            <tr style={{ color: C.accentSoft, fontWeight: 700 }}>
              <td colSpan={3} style={{ padding: "6px 14px", borderTop: `1px solid ${C.border}` }}>{isKo ? "합계" : "total"}</td>
              <td style={{ padding: "6px 14px", borderTop: `1px solid ${C.border}` }}>{total}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Note>
        {isKo
          ? "홀수의 합 1+3+5+…+(2n−1) = n²에 스핀 2를 곱하면 2n² — 껍질 용량 2, 8, 18, 32가 바로 이 수열입니다. 순수 Coulomb 퍼텐셜에서는 같은 n의 모든 l이 같은 에너지(축퇴)지만, 다전자 원자에서는 안쪽 전자의 가리움 때문에 l이 낮을수록 에너지가 내려가 s < p < d 순서가 생깁니다 — 다음 탭의 Aufbau가 그 이야기입니다."
          : "The odd-number sum 1+3+5+…+(2n−1) = n², times 2 for spin, gives 2n² — and the shell capacities 2, 8, 18, 32 are exactly this sequence. In a pure Coulomb potential all l of the same n are degenerate, but in many-electron atoms inner-electron screening pushes low-l down, creating the s < p < d ordering — the aufbau story of the next tab."}
      </Note>
    </Card>
  );
}

// =============================================================
// 3) ORBITALS & PERIODIC TABLE — aufbau builder
// =============================================================
// Madelung filling order with capacities
const AUFBAU = [
  ["1s", 2], ["2s", 2], ["2p", 6], ["3s", 2], ["3p", 6], ["4s", 2],
  ["3d", 10], ["4p", 6], ["5s", 2], ["4d", 10], ["5p", 6], ["6s", 2],
];
const SYMBOLS = ["H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne",
  "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca",
  "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn",
  "Ga", "Ge", "As", "Se", "Br", "Kr"];
const NOBLE = { 2: "He", 10: "Ne", 18: "Ar", 36: "Kr" };
// experimental exceptions within Z <= 36
const EXCEPTIONS = { 24: "[Ar] 3d⁵ 4s¹", 29: "[Ar] 3d¹⁰ 4s¹" };
const SUP = { 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", 10: "¹⁰" };

function configOf(Z) {
  let left = Z;
  const filled = [];
  for (const [sub, cap] of AUFBAU) {
    if (left <= 0) break;
    const put = Math.min(left, cap);
    filled.push([sub, put]);
    left -= put;
  }
  return filled;
}
function configString(Z) {
  return configOf(Z).map(([s, e]) => `${s}${SUP[e] || e}`).join(" ");
}

function AtomsTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <Card>
        <Hd>{isKo ? "양자수에서 화학으로: 껍질과 부껍질" : "From quantum numbers to chemistry: shells and subshells"}</Hd>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <table style={{ borderCollapse: "collapse", fontSize: 12.5, fontFamily: "'JetBrains Mono',monospace" }}>
            <thead><tr style={{ color: C.textDim }}>
              <th style={{ padding: "5px 14px", borderBottom: `1px solid ${C.border}` }}>n</th>
              <th style={{ padding: "5px 14px", borderBottom: `1px solid ${C.border}` }}>{isKo ? "껍질" : "shell"}</th>
              <th style={{ padding: "5px 14px", borderBottom: `1px solid ${C.border}` }}>2n²</th>
            </tr></thead>
            <tbody>
              {[1, 2, 3, 4].map(n => (
                <tr key={n} style={{ color: C.text }}>
                  <td style={{ padding: "4px 14px", textAlign: "center", color: C.accent }}>{n}</td>
                  <td style={{ padding: "4px 14px", textAlign: "center" }}>{"KLMN"[n - 1]}</td>
                  <td style={{ padding: "4px 14px", textAlign: "center", color: C.ok }}>{2 * n * n}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table style={{ borderCollapse: "collapse", fontSize: 12.5, fontFamily: "'JetBrains Mono',monospace" }}>
            <thead><tr style={{ color: C.textDim }}>
              <th style={{ padding: "5px 14px", borderBottom: `1px solid ${C.border}` }}>l</th>
              <th style={{ padding: "5px 14px", borderBottom: `1px solid ${C.border}` }}>{isKo ? "부껍질" : "subshell"}</th>
              <th style={{ padding: "5px 14px", borderBottom: `1px solid ${C.border}` }}>{isKo ? "궤도 수" : "orbitals"}</th>
              <th style={{ padding: "5px 14px", borderBottom: `1px solid ${C.border}` }}>{isKo ? "전자 수" : "electrons"}</th>
            </tr></thead>
            <tbody>
              {[["0", "s", 1, 2], ["1", "p", 3, 6], ["2", "d", 5, 10], ["3", "f", 7, 14]].map(r => (
                <tr key={r[1]} style={{ color: C.text }}>
                  <td style={{ padding: "4px 14px", textAlign: "center", color: C.accent }}>{r[0]}</td>
                  <td style={{ padding: "4px 14px", textAlign: "center" }}>{r[1]}</td>
                  <td style={{ padding: "4px 14px", textAlign: "center", color: C.textDim }}>{r[2]}</td>
                  <td style={{ padding: "4px 14px", textAlign: "center", color: C.ok }}>{r[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Note>
          {isKo
            ? "s 궤도는 구형, p는 아령 3개(px·py·pz), d는 클로버 5개 — 3주차 구면조화함수 |Ylm|² 그림이 바로 이 모양들이었습니다. 궤도 하나에는 Pauli 배타원리에 따라 스핀이 반대인 전자 2개까지만 들어갑니다."
            : "s orbitals are spheres, p a trio of dumbbells (px·py·pz), d a five-leaf clover — exactly the |Ylm|² shapes from Week 3's spherical harmonics. Each orbital holds at most two electrons of opposite spin, by Pauli exclusion."}
        </Note>
      </Card>
      <AufbauLab isKo={isKo} />
      <Card>
        <Hd>{isKo ? "수소를 넘어: 왜 헬륨부터는 정확히 못 푸는가" : "Beyond hydrogen: why helium already defeats exact solution"}</Hd>
        <Eq>
          H(He) = −(ℏ²/2m)(∇₁² + ∇₂²) − (1/4πε₀)(2e²/r₁ + 2e²/r₂ − e²/|r₁−r₂|)
        </Eq>
        <Note>
          {isKo
            ? "마지막 항 — 전자 1과 전자 2 사이의 반발 — 이 문제를 비분리형으로 만듭니다. 변수분리가 안 되니 해석해가 없고, 여기서부터는 수소의 고유상태 |n,l,m⟩을 기저로 쓰는 근사(섭동론, 변분법, 그리고 현대의 DFT·양자화학 계산)가 무대에 오릅니다. 수소 원자가 '원자물리의 수소'라 불리는 이유: 모든 다전자 계산의 출발 기저가 바로 이 완전한 직교 기저 ⟨n,l,m,s|n′,l′,m′,s′⟩ = δδδδ이기 때문입니다."
            : "The last term — repulsion between electrons 1 and 2 — makes the problem non-separable: no analytic solution exists. From here on, approximations built on the hydrogen eigenbasis |n,l,m⟩ take the stage (perturbation theory, variational methods, and today's DFT and quantum chemistry). This is why hydrogen is the 'hydrogen of atomic physics': its complete orthonormal basis ⟨n,l,m,s|n′,l′,m′,s′⟩ = δδδδ is the starting point of every many-electron calculation."}
        </Note>
      </Card>
    </div>
  );
}

function AufbauLab({ isKo }) {
  const [Z, setZ] = useState(8);
  const filled = configOf(Z);
  const sym = SYMBOLS[Z - 1];
  // noble-gas core shorthand
  let core = 0, coreSym = null;
  for (const zc of [18, 10, 2]) if (Z > zc) { core = zc; coreSym = NOBLE[zc]; break; }
  const shortCfg = core
    ? `[${coreSym}] ` + configOf(Z).slice(configOf(core).length).map(([s, e]) => `${s}${SUP[e] || e}`).join(" ")
    : configString(Z);

  // orbital boxes: for each filled subshell, draw boxes with arrows
  const boxes = filled.map(([sub, e]) => {
    const nOrb = { s: 1, p: 3, d: 5, f: 7 }[sub[1]];
    const arr = Array.from({ length: nOrb }, (_, i) => {
      const up = e > i ? 1 : 0;
      const dn = e > i + nOrb ? 1 : 0;
      return up + dn;                       // 0, 1, 2 (Hund: fill singly first)
    });
    return { sub, arr };
  });

  return (
    <Card>
      <Hd>{isKo ? "Aufbau 실험실: 전자배치 쌓아 보기 (Z = 1–36)" : "Aufbau lab: build electron configurations (Z = 1–36)"}</Hd>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", margin: "8px 0" }}>
        <Slider label={isKo ? "원자번호 Z" : "atomic number Z"} value={Z} min={1} max={36} step={1} onChange={setZ} width={240} />
        <Pill color={C.accent}>{Z}. {sym}</Pill>
        {NOBLE[Z] && <Pill color={C.amber}>{isKo ? "비활성 기체 — 껍질 마감!" : "noble gas — shell closed!"}</Pill>}
      </div>
      <Eq style={{ fontSize: 15 }}>
        {sym}:  {shortCfg}{EXCEPTIONS[Z] ? `   (${isKo ? "실험값" : "observed"}: ${EXCEPTIONS[Z]})` : ""}
      </Eq>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end", margin: "12px 0 6px" }}>
        {boxes.map(({ sub, arr }) => (
          <div key={sub} style={{ textAlign: "center" }}>
            <div style={{ display: "flex", gap: 3 }}>
              {arr.map((cnt, i) => (
                <div key={i} style={{
                  width: 26, height: 26, border: `1.5px solid ${cnt ? C.accent : C.border}`,
                  borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'JetBrains Mono',monospace", fontSize: 13,
                  color: C.accentSoft, background: cnt ? "rgba(52,211,153,0.10)" : "transparent",
                }}>
                  {cnt === 2 ? "⇅" : cnt === 1 ? "↑" : ""}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 4, fontFamily: "'JetBrains Mono',monospace" }}>{sub}</div>
          </div>
        ))}
      </div>
      <Note>
        {isKo
          ? "채움 순서(Madelung 규칙)는 1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p — K(Z=19)와 Ca(Z=20)에서 4s가 3d보다 먼저 차는 것을 확인해 보세요. 다전자 가리움 효과로 4s의 에너지가 3d 아래로 내려오기 때문입니다. 같은 부껍질 안에서는 전자가 먼저 한 칸씩 흩어져 들어갑니다(Hund 규칙, N의 2p³ = ↑↑↑). Cr(24)·Cu(29)는 반쯤/완전히 찬 d 껍질의 안정성 때문에 규칙을 살짝 벗어나는 실험적 예외입니다."
          : "The Madelung filling order runs 1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p — watch 4s fill before 3d at K (Z=19) and Ca (Z=20): many-electron screening drops 4s below 3d. Within a subshell, electrons first spread out singly (Hund's rule; N's 2p³ = ↑↑↑). Cr (24) and Cu (29) are experimental exceptions, stabilized by half-filled and filled d shells."}
      </Note>
    </Card>
  );
}

// =============================================================
// 4) SPIN — Pauli matrices, Stern-Gerlach, Zeeman, unitarity
// =============================================================
function SpinTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <Card>
        <Hd>{isKo ? "네 번째 양자수: 궤도가 아닌 각운동량" : "The fourth quantum number: angular momentum without an orbit"}</Hd>
        <Note>
          {isKo
            ? "1922년 Stern과 Gerlach는 은 원자빔을 불균일 자기장에 통과시켰습니다. 고전적으로는 연속적인 띠가 나와야 하는데, 빔은 정확히 두 갈래로 갈라졌습니다. 전자에는 공간 운동과 무관한 내재적 각운동량 — 스핀 — 이 있고, 그 z-성분은 ±ℏ/2 두 값만 가집니다. 3주차 각운동량 대수 [Lx,Ly] = iℏLz가 스핀에도 그대로 적용되며, s = 1/2에서는 연산자가 2×2 행렬이 됩니다:"
            : "In 1922 Stern and Gerlach sent a beam of silver atoms through an inhomogeneous magnet. Classically a continuous smear should emerge — instead the beam split cleanly in two. The electron carries an intrinsic angular momentum — spin — unrelated to its spatial motion, whose z-component takes only ±ℏ/2. Week 3's angular-momentum algebra [Lx,Ly] = iℏLz applies verbatim, and for s = 1/2 the operators become 2×2 matrices:"}
        </Note>
        <Eq>
          S = (ℏ/2)σ:   σ₁ = [[0,1],[1,0]],  σ₂ = [[0,−i],[i,0]],  σ₃ = [[1,0],[0,−1]],   S² = (3ℏ²/4)I
        </Eq>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Pill color={C.purple}>[Sx, Sy] = iℏSz ✓</Pill>
          <Pill color={C.purple}>[S², Si] = 0 ✓</Pill>
          <Pill color={C.accent}>S²|s,ms⟩ = ℏ²s(s+1)|s,ms⟩ = (3ℏ²/4)|s,ms⟩</Pill>
          <Pill color={C.cyan}>Sz|½,↑⟩ = +(ℏ/2)|½,↑⟩</Pill>
        </div>
        <Note>
          {isKo
            ? "2주차의 교훈이 여기서 정점을 찍습니다 — Heisenberg의 '관측량은 행렬'이 스핀에서는 근사가 아니라 정확한 서술입니다. 전체 파동함수는 |n,l,m,s⟩ 네 양자수로 완성됩니다."
            : "Week 2's lesson culminates here — Heisenberg's 'observables are matrices' is not an approximation for spin but the exact description. The full wave function is completed by the four quantum numbers |n,l,m,s⟩."}
        </Note>
      </Card>
      <SternGerlachLab isKo={isKo} />
      <ZeemanCard isKo={isKo} />
      <UnitaryCard isKo={isKo} />
    </div>
  );
}

// -- sequential Stern-Gerlach Monte Carlo --------------------
function SternGerlachLab({ isKo }) {
  const [counts, setCounts] = useState(null);
  const [running, setRunning] = useState(false);
  const N = 10000;

  const run = () => {
    setRunning(true);
    setTimeout(() => {
      let upX = 0, upZ2 = 0;
      for (let i = 0; i < N; i++) {
        if (Math.random() < 0.5) {           // Sx on |↑z⟩: P = |⟨↑x|↑z⟩|² = ½
          upX++;
          if (Math.random() < 0.5) upZ2++;   // Sz on |↑x⟩: ½ again!
        }
      }
      setCounts({ upX, upZ2 });
      setRunning(false);
    }, 60);
  };

  const stage = (label, sub, color) => (
    <div style={{
      background: C.card, border: `1px solid ${color}55`, borderRadius: 12,
      padding: "10px 14px", minWidth: 120, textAlign: "center",
    }}>
      <div style={{ fontSize: 13, fontWeight: 800, color }}>{label}</div>
      <div style={{ fontSize: 10.5, color: C.textDim, marginTop: 3 }}>{sub}</div>
    </div>
  );

  return (
    <Card>
      <Hd>{isKo ? "순차 Stern-Gerlach 실험실: 측정이 정보를 지운다" : "Sequential Stern-Gerlach lab: measurement erases information"}</Hd>
      <Eq>
        |½,↑x⟩ = (|↑⟩ + |↓⟩)/√2,   |½,↓x⟩ = (|↑⟩ − |↓⟩)/√2   ({isKo ? "Sx 고유벡터 — 강의 유도 결과" : "Sx eigenvectors, as derived in the lecture"})
      </Eq>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
        {stage(isKo ? "준비" : "prepare", "|↑z⟩ (Sz = +ℏ/2)", C.cyan)}
        <span style={{ color: C.textDim }}>→</span>
        {stage(isKo ? "Sx 측정" : "measure Sx", isKo ? "+ℏ/2만 통과" : "keep +ℏ/2 only", C.purple)}
        <span style={{ color: C.textDim }}>→</span>
        {stage(isKo ? "Sz 재측정" : "measure Sz again", isKo ? "결과는?" : "outcome?", C.amber)}
        <button onClick={run} disabled={running} style={{ ...btnStyle(true), marginLeft: 10 }}>
          {running ? "…" : (isKo ? `원자 ${N.toLocaleString()}개 발사` : `fire ${N.toLocaleString()} atoms`)}
        </button>
      </div>
      {counts && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10, marginBottom: 10 }}>
          <Stat label={isKo ? "Sx = +ℏ/2 비율 (이론 0.5)" : "fraction Sx = +ℏ/2 (theory 0.5)"}
            value={(counts.upX / N).toFixed(4)} color={C.purple} />
          <Stat label={isKo ? "그중 Sz = +ℏ/2 비율 (이론 0.5!)" : "of those, Sz = +ℏ/2 (theory 0.5!)"}
            value={(counts.upZ2 / counts.upX).toFixed(4)} color={C.amber} />
          <Stat label={isKo ? "최종 |↑z⟩ 생존율" : "final |↑z⟩ survival"}
            value={(counts.upZ2 / N).toFixed(4)} color={C.err} />
        </div>
      )}
      <Note>
        {isKo
          ? "처음에 Sz = +ℏ/2로 완벽히 준비했는데, 중간에 Sx를 재고 나면 마지막 Sz 측정은 다시 50:50 동전던지기가 됩니다. [Sz, Sx] = iℏSy ≠ 0 — 두 관측량은 공통 고유벡터가 없어서, Sx를 확정하는 순간 Sz 정보가 소멸합니다. 2주차 불확정성 원리의 가장 극적인 실연이며, 양자 암호(BB84)가 도청을 탐지하는 원리이기도 합니다: 몰래 측정하면 반드시 흔적이 남습니다."
          : "We prepared Sz = +ℏ/2 perfectly, yet after an intervening Sx measurement the final Sz reading is a 50:50 coin flip again. [Sz, Sx] = iℏSy ≠ 0 — the two observables share no eigenvectors, so pinning down Sx annihilates the Sz information. It is the most dramatic demonstration of Week 2's uncertainty principle, and the working principle of quantum cryptography (BB84): eavesdropping by measurement necessarily leaves tracks."}
      </Note>
    </Card>
  );
}

// -- Zeeman splitting ----------------------------------------
function ZeemanCard({ isKo }) {
  const [B, setB] = useState(1.0);
  const ge = 2.0023;
  const dE = ge * MUB * B;                    // eV between ms = ±1/2
  const fGHz = dE / 4.135667696e-15 / 1e9;
  const W = 640, Ht = 230, pad = 46;
  const { X, Y } = usePlotScale(0, 5, -3.2e-4, 3.2e-4, W, Ht, pad);
  const up = [], dn = [];
  for (let i = 0; i <= 100; i++) {
    const b = 5 * i / 100;
    up.push([b, +0.5 * ge * MUB * b]);
    dn.push([b, -0.5 * ge * MUB * b]);
  }
  return (
    <Card>
      <Hd>{isKo ? "약한 자기장과의 상호작용: Zeeman 갈라짐" : "Interaction with a weak magnetic field: Zeeman splitting"}</Hd>
      <Eq>
        H = −μ·B,  μ = −g(e/2mc)S   →   E(ms) = ±½ g μB B,   ΔE = g μB B
      </Eq>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", margin: "8px 0" }}>
        <Slider label={isKo ? "자기장 B" : "field B"} value={B} min={0} max={5} step={0.1} onChange={setB} unit=" T" width={200} fmt={v => v.toFixed(1)} />
        <Pill color={C.accent}>ΔE = {dE.toExponential(3)} eV</Pill>
        <Pill color={C.cyan}>{isKo ? "공명 주파수" : "resonance"} = {fGHz.toFixed(1)} GHz</Pill>
      </div>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={{ ...svgBox(W), flex: "none", width: "100%", maxWidth: W }}>
        <line x1={pad} y1={Y(0)} x2={W - pad} y2={Y(0)} stroke="#334155" strokeDasharray="4 4" />
        <path d={pathOf(up, X, Y)} fill="none" stroke={C.err} strokeWidth={2.2} />
        <path d={pathOf(dn, X, Y)} fill="none" stroke={C.sky} strokeWidth={2.2} />
        <text x={X(4.6)} y={Y(up[92][1]) - 8} fill={C.err} fontSize={11} textAnchor="end">ms = +½ (↑)</text>
        <text x={X(4.6)} y={Y(dn[92][1]) + 16} fill={C.sky} fontSize={11} textAnchor="end">ms = −½ (↓)</text>
        {/* marker at chosen B */}
        <line x1={X(B)} y1={Y(-0.5 * ge * MUB * B)} x2={X(B)} y2={Y(0.5 * ge * MUB * B)} stroke={C.accent} strokeWidth={2} strokeDasharray="3 3" />
        <text x={X(B)} y={Y(0.5 * ge * MUB * B) - 8} fill={C.accent} fontSize={10.5} textAnchor="middle">ΔE</text>
        <text x={W / 2} y={Ht - 12} fill={C.textDim} fontSize={11} textAnchor="middle">B [T]</text>
      </svg>
      <Note>
        {isKo
          ? "자기장이 없으면 ↑와 ↓는 완전히 축퇴 — 자기장을 켜면 에너지가 갈라지고, 그 간격에 해당하는 광자(B = 1 T에서 약 28 GHz, 마이크로파)를 쏘면 스핀이 뒤집힙니다. 이것이 ESR(전자스핀공명)이고, 핵스핀으로 바꾸면 NMR과 병원의 MRI입니다. 슬라이드의 '스펙트럼 선이 자기장에서 여러 개로 갈라진다'는 관찰(정상 Zeeman 효과)은 궤도 m 준위에도 같은 물리가 작동한 결과입니다."
          : "Without a field, ↑ and ↓ are exactly degenerate — switch B on and the levels split; a photon matching the gap (about 28 GHz at 1 T, microwaves) flips the spin. That is ESR (electron spin resonance); with nuclear spins instead it becomes NMR and the hospital MRI. The lecture's observation that spectral lines split in a magnetic field (the Zeeman effect) is the same physics acting on the orbital m levels."}
      </Note>
    </Card>
  );
}

// -- unitary basis change ------------------------------------
function UnitaryCard({ isKo }) {
  const s2 = (1 / Math.sqrt(2)).toFixed(4);
  return (
    <Card>
      <Hd>{isKo ? "기저 변환과 유니터리 연산자" : "Basis change and unitary operators"}</Hd>
      <Note>
        {isKo
          ? "같은 스핀 상태 |f⟩를 Sz 고유벡터 {|↑⟩, |↓⟩}로 쓸 수도, Sx 고유벡터 {|↑x⟩, |↓x⟩}로 쓸 수도 있습니다. 두 좌표 표현을 잇는 행렬 U의 열은 새 기저 벡터들입니다:"
          : "The same spin state |f⟩ can be written in the Sz eigenbasis {|↑⟩, |↓⟩} or the Sx eigenbasis {|↑x⟩, |↓x⟩}. The matrix U connecting the two coordinate representations has the new basis vectors as its columns:"}
      </Note>
      <Eq>
        [f] = U[f]′,   U = (1/√2)[[1,1],[1,−1]],   U†U = I   →   [Sy]′ = U⁻¹[Sy]U
      </Eq>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <Pill color={C.accent}>U†U = I ({isKo ? "수치 확인" : "verified"}: {s2}² + {s2}² = 1.0000)</Pill>
        <Pill color={C.cyan}>⟨f|g⟩ = ⟨Uf|Ug⟩ {isKo ? "— 내적 보존" : "— inner product conserved"}</Pill>
        <Pill color={C.purple}>{isKo ? "고유값은 기저와 무관: 항상 ±ℏ/2" : "eigenvalues are basis-independent: always ±ℏ/2"}</Pill>
      </div>
      <Note>
        {isKo
          ? "U⁻¹ = U†인 행렬이 유니터리입니다. 유니터리 변환은 벡터의 길이와 내적 — 즉 확률 — 을 보존하므로, 양자역학의 모든 '관점 바꾸기'(기저 변환)와 모든 '연속 대칭'(회전·병진, 그리고 시간전개 e^{−iHt/ℏ}까지)이 유니터리입니다. 강의의 [Sy]′ = U⁻¹SyU 계산은 관측량의 행렬 표현이 기저마다 다르되 물리(고유값·확률)는 불변임을 보여줍니다 — 행렬역학과 파동역학이 같은 이론인 이유(2주차)의 완결판입니다."
          : "A matrix with U⁻¹ = U† is unitary. Unitary maps preserve lengths and inner products — hence probabilities — so every change of viewpoint (basis change) and every continuous symmetry in quantum mechanics (rotations, translations, even time evolution e^{−iHt/ℏ}) is unitary. The lecture's [Sy]′ = U⁻¹SyU computation shows that an observable's matrix depends on the basis while the physics (eigenvalues, probabilities) does not — the final word on why matrix and wave mechanics are one theory (Week 2)."}
      </Note>
    </Card>
  );
}

// =============================================================
// 5) KINETIC THEORY — pressure from collisions, Maxwell-Boltzmann, Cv
// =============================================================
function MaxwellTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <Card>
        <Hd>{isKo ? "압력은 충돌이다: 운동론의 세 가정" : "Pressure is collisions: the kinetic model's three assumptions"}</Hd>
        <Note>
          {isKo
            ? "① 기체는 무작위로 움직이는 분자들의 집합이고 ② 분자 크기는 이동 거리보다 훨씬 작으며 ③ 상호작용은 탄성충돌뿐. 이 세 가정만으로 벽에 부딪히는 분자의 운동량 전달(2mvₓ)을 세면 압력이 나옵니다:"
            : "① A gas is a swarm of randomly moving molecules, ② molecular size is far smaller than the travel distance, ③ interactions are elastic collisions only. Counting the momentum kicks (2mvₓ) on a wall from these three assumptions alone yields the pressure:"}
        </Note>
        <Eq>
          P = nM⟨v²⟩/3V   →   PV = nRT {isKo ? "와 비교하면" : "compared with the ideal-gas law gives"}   v_rms = √(3RT/M),  ⟨KE⟩ = (3/2)k_BT
        </Eq>
        <KineticBox isKo={isKo} />
      </Card>
      <MBDistLab isKo={isKo} />
      <CvLadderCard isKo={isKo} />
    </div>
  );
}

// -- bouncing-particle canvas --------------------------------
function KineticBox({ isKo }) {
  const [Tfac, setTfac] = useState(1.0);      // speed scale ~ sqrt(T)
  const [running, setRunning] = useState(true);
  const cvRef = useRef(null);
  const stRef = useRef(null);                 // particles + wall-impulse accumulator

  useEffect(() => {
    if (!stRef.current) {
      const P = [];
      for (let i = 0; i < 60; i++) {
        const th = Math.random() * 2 * Math.PI, sp = 0.8 + Math.random() * 1.6;
        P.push({ x: Math.random(), y: Math.random(), vx: sp * Math.cos(th), vy: sp * Math.sin(th) });
      }
      stRef.current = { P, imp: 0, t: 0, meter: 0 };
    }
    let raf;
    const draw = () => {
      const cv = cvRef.current; if (!cv) return;
      const ctx = cv.getContext("2d");
      const W = cv.width, Ht = cv.height;
      ctx.fillStyle = "#0d1117"; ctx.fillRect(0, 0, W, Ht);
      ctx.strokeStyle = "#475569"; ctx.lineWidth = 2;
      ctx.strokeRect(6, 6, W - 12, Ht - 12);
      const st = stRef.current;
      const s = Math.sqrt(Tfac);              // v ~ sqrt(T)
      const dt = 0.004;
      for (const p of st.P) {
        if (running) {
          p.x += p.vx * s * dt; p.y += p.vy * s * dt;
          if (p.x < 0) { p.x = -p.x; p.vx = -p.vx; st.imp += Math.abs(p.vx) * s; }
          if (p.x > 1) { p.x = 2 - p.x; p.vx = -p.vx; st.imp += Math.abs(p.vx) * s; }
          if (p.y < 0) { p.y = -p.y; p.vy = -p.vy; st.imp += Math.abs(p.vy) * s; }
          if (p.y > 1) { p.y = 2 - p.y; p.vy = -p.vy; st.imp += Math.abs(p.vy) * s; }
        }
        const sp2 = (p.vx * p.vx + p.vy * p.vy) * Tfac;
        const hue = Math.min(200, 40 + sp2 * 28);
        ctx.fillStyle = `hsl(${200 - hue}, 85%, 60%)`;
        ctx.beginPath();
        ctx.arc(8 + p.x * (W - 16), 8 + p.y * (Ht - 16), 3.2, 0, 2 * Math.PI);
        ctx.fill();
      }
      if (running) {
        st.t += dt;
        if (st.t > 0.25) {                    // update pressure meter 4x/s
          st.meter = st.imp / st.t;
          st.imp = 0; st.t = 0;
        }
      }
      ctx.fillStyle = "#9ca3af"; ctx.font = "12px JetBrains Mono, monospace";
      ctx.fillText((isKo ? "벽 운동량 전달률 ∝ P:  " : "wall momentum rate ∝ P:  ") + st.meter.toFixed(0), 14, 24);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [Tfac, running, isKo]);

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
        <button onClick={() => setRunning(r => !r)} style={btnStyle(running)}>{running ? "■" : "▶"}</button>
        <Slider label={isKo ? "온도 T/T₀" : "temperature T/T₀"} value={Tfac} min={0.3} max={4} step={0.1} onChange={setTfac} width={190} fmt={v => v.toFixed(1)} />
        <span style={{ fontSize: 12, color: C.textDim }}>
          {isKo ? "T 2배 → ⟨v²⟩ 2배 → 압력계 눈금 ~2배 (같은 V·N)" : "double T → double ⟨v²⟩ → meter reads ~2× (same V·N)"}
        </span>
      </div>
      <canvas ref={cvRef} width={720} height={240}
        style={{ width: "100%", maxWidth: 720, borderRadius: 10, border: `1px solid ${C.border}` }} />
      <Note>
        {isKo
          ? "색은 순간 속력(빨강 = 빠름)입니다. 압력계가 요동치는 것도 물리입니다 — 압력은 무수한 미시 충돌의 통계 평균이고, 분자 수가 적을수록 요동이 커집니다(브라운 운동이 보이는 이유). 10²³개 스케일에서 요동은 ~10⁻¹¹ 수준으로 사라지고 열역학이 매끈해집니다."
          : "Color encodes instantaneous speed (red = fast). Even the meter's jitter is physics — pressure is the statistical average of countless microscopic kicks, and fewer molecules means larger fluctuations (why Brownian motion is visible). At the 10²³ scale fluctuations shrink to ~10⁻¹¹ and thermodynamics turns smooth."}
      </Note>
    </div>
  );
}

// -- Maxwell-Boltzmann distribution lab ----------------------
const GASES = [
  { key: "H2", lb: "H₂", M: 0.002016, c: "#f472b6" },
  { key: "He", lb: "He", M: 0.004003, c: "#22d3ee" },
  { key: "N2", lb: "N₂", M: 0.0280134, c: "#34d399" },
  { key: "O2", lb: "O₂", M: 0.0319988, c: "#60a5fa" },
  { key: "CO2", lb: "CO₂", M: 0.04401, c: "#f59e0b" },
  { key: "Xe", lb: "Xe", M: 0.131293, c: "#a78bfa" },
];
function fMB(v, M, T) {
  const a = M / (2 * Math.PI * RGAS * T);
  return 4 * Math.PI * Math.pow(a, 1.5) * v * v * Math.exp(-M * v * v / (2 * RGAS * T));
}

function MBDistLab({ isKo }) {
  const [T, setT] = useState(298);
  const [gasKey, setGasKey] = useState("N2");
  const gas = GASES.find(g => g.key === gasKey);
  const vmp = Math.sqrt(2 * RGAS * T / gas.M);
  const vmean = Math.sqrt(8 * RGAS * T / (Math.PI * gas.M));
  const vrms = Math.sqrt(3 * RGAS * T / gas.M);

  const W = 720, Ht = 300, pad = 48;
  const vMax = 3200;
  const fPeak = fMB(vmp, gas.M, T);
  const { X, Y } = usePlotScale(0, vMax, 0, fPeak * 1.12, W, Ht, pad);
  const pts = [];
  for (let i = 0; i <= 360; i++) {
    const v = vMax * i / 360;
    pts.push([v, fMB(v, gas.M, T)]);
  }
  const marker = (v, color, lb, dy) => (
    <g>
      <line x1={X(v)} y1={Y(0)} x2={X(v)} y2={Y(fMB(v, gas.M, T))} stroke={color} strokeWidth={2} strokeDasharray="4 3" />
      <text x={X(v) + 4} y={Y(fMB(v, gas.M, T)) - dy} fill={color} fontSize={10.5} fontFamily="'JetBrains Mono',monospace">{lb} = {v.toFixed(0)}</text>
    </g>
  );
  return (
    <Card>
      <Hd>{isKo ? "Maxwell-Boltzmann 분포 실험실" : "Maxwell-Boltzmann distribution lab"}</Hd>
      <Eq>
        f(v) = 4π(M/2πRT)^{"{3/2}"} v² e^{"{−Mv²/2RT}"}   —   v² ({isKo ? "구 껍질 넓이" : "spherical shell"}) × Boltzmann {isKo ? "인자" : "factor"}
      </Eq>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", margin: "10px 0" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {GASES.map(g => (
            <button key={g.key} onClick={() => setGasKey(g.key)}
              style={{
                ...btnStyle(gasKey === g.key), padding: "5px 11px", fontSize: 12,
                borderColor: gasKey === g.key ? g.c : C.border,
                background: gasKey === g.key ? `${g.c}33` : C.panel,
                color: gasKey === g.key ? "#fff" : C.text,
              }}>{g.lb}</button>
          ))}
        </div>
        <Slider label="T" value={T} min={80} max={1500} step={10} onChange={setT} unit=" K" width={190} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10, marginBottom: 12 }}>
        <Stat label={isKo ? "최빈 속력 √(2RT/M)" : "most probable √(2RT/M)"} value={`${vmp.toFixed(0)} m/s`} color={C.amber} />
        <Stat label={isKo ? "평균 속력 √(8RT/πM)" : "mean √(8RT/πM)"} value={`${vmean.toFixed(0)} m/s`} color={C.accent} />
        <Stat label="v_rms = √(3RT/M)" value={`${vrms.toFixed(0)} m/s`} color={C.cyan} />
        <Stat label={isKo ? "비 1 : 1.128 : 1.225" : "ratio 1 : 1.128 : 1.225"} value={`1 : ${(vmean / vmp).toFixed(3)} : ${(vrms / vmp).toFixed(3)}`} color={C.textDim} />
      </div>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={{ ...svgBox(W), flex: "none", width: "100%" }}>
        <line x1={pad} y1={Y(0)} x2={W - pad} y2={Y(0)} stroke="#334155" />
        <path d={`${pathOf(pts, X, Y)} L ${X(vMax)} ${Y(0)} L ${X(0)} ${Y(0)} Z`} fill={`${gas.c}22`} stroke="none" />
        <path d={pathOf(pts, X, Y)} fill="none" stroke={gas.c} strokeWidth={2.6} />
        {marker(vmp, C.amber, "v_mp", 26)}
        {marker(vmean, C.accent, "v̄", 14)}
        {marker(vrms, C.cyan, "v_rms", 2)}
        {[0, 500, 1000, 1500, 2000, 2500, 3000].map(v => (
          <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={9.5} textAnchor="middle">{v}</text>
        ))}
        <text x={W / 2} y={Ht - 10} fill={C.textDim} fontSize={11} textAnchor="middle">v [m/s]</text>
      </svg>
      <Note>
        {isKo
          ? "곡선이 0에서 시작하는 이유: 속력이 정확히 0인 분자는 v² 껍질 부피가 0이라 없습니다. 꼬리가 긴 이유: e^{−Mv²/2RT}는 느리게 죽습니다 — 이 꼬리의 소수 정예가 화학반응(활성화 에너지!)과 대기 탈출(달에 대기가 없는 이유)을 담당합니다. H₂를 골라 보세요: 298 K에서 v̄ ≈ 1,770 m/s로 지구 탈출속도의 1/6에 이르러, 가벼운 수소는 지질학적 시간에 걸쳐 우주로 새어 나갑니다."
          : "The curve starts at zero because a molecule with exactly zero speed has zero shell volume v². The long tail is the slow death of e^{−Mv²/2RT} — its elite few drive chemical reactions (activation energy!) and atmospheric escape (why the Moon has no atmosphere). Pick H₂: at 298 K its v̄ ≈ 1,770 m/s is a sixth of Earth's escape velocity, so light hydrogen leaks to space over geological time."}
      </Note>
    </Card>
  );
}

// -- heat-capacity ladder ------------------------------------
function CvLadderCard({ isKo }) {
  const W = 680, Ht = 260, pad = 50;
  // log10 T axis from 1 (10 K) to 4 (10000 K); smooth steps at ~80 K and ~3000 K
  const { X, Y } = usePlotScale(1, 4, 0, 4, W, Ht, pad);
  const sig = (x, x0, w) => 1 / (1 + Math.exp(-(x - x0) / w));
  const pts = [];
  for (let i = 0; i <= 300; i++) {
    const lt = 1 + 3 * i / 300;
    const cv = 1.5 + sig(lt, Math.log10(85), 0.09) + sig(lt, Math.log10(3000), 0.09);
    pts.push([lt, cv]);
  }
  return (
    <Card>
      <Hd>{isKo ? "비열 사다리: 양자화가 기체 성질에 남긴 지문" : "The heat-capacity ladder: quantization's fingerprint on a gas"}</Hd>
      <Eq>
        {isKo ? "등분배" : "equipartition"}: U = (f/2)nRT,  Cv = (f/2)R   —   f = 3 ({isKo ? "병진" : "trans"}) + 2 ({isKo ? "회전" : "rot"}) + 2 ({isKo ? "진동" : "vib"})
      </Eq>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={{ ...svgBox(W), flex: "none", width: "100%", maxWidth: W }}>
        {[1.5, 2.5, 3.5].map(v => (
          <g key={v}>
            <line x1={pad} y1={Y(v)} x2={W - pad} y2={Y(v)} stroke="#3b4a61" strokeDasharray="4 4" />
            <text x={W - pad + 4} y={Y(v) + 4} fill={C.textDim} fontSize={10.5} fontFamily="'JetBrains Mono',monospace">{v}R</text>
          </g>
        ))}
        <path d={pathOf(pts, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.6} />
        {[[1.30, 1.5, isKo ? "병진만 (회전 동결)" : "translation only (rotation frozen)"],
          [2.55, 2.5, isKo ? "+ 회전 (실온의 H₂)" : "+ rotation (H₂ at room T)"],
          [3.72, 3.5, isKo ? "+ 진동 (해리 직전)" : "+ vibration (near dissociation)"]].map(([x, y, lb], i) => (
          <text key={i} x={X(x)} y={Y(y) - 10} fill={C.textDim} fontSize={10.5} textAnchor="middle">{lb}</text>
        ))}
        {[1, 2, 3, 4].map(d => (
          <text key={d} x={X(d)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{Math.pow(10, d).toLocaleString()}</text>
        ))}
        <text x={W / 2} y={Ht - 8} fill={C.textDim} fontSize={11} textAnchor="middle">T [K] ({isKo ? "로그 눈금" : "log scale"}) — {isKo ? "H₂ 기체의 몰비열 Cv" : "molar Cv of H₂ gas"}</text>
      </svg>
      <Note>
        {isKo
          ? "고전 등분배로는 모든 자유도가 언제나 ½R씩 내야 하므로 계단이 있을 이유가 없습니다. 계단의 정체는 양자화입니다: 회전 준위 간격(~ℏ²/2I)이나 진동 간격(ℏω)보다 kT가 작으면 그 자유도는 들뜰 수 없어 '동결'됩니다. 저온의 H₂가 단원자처럼 3/2R을 보이는 것, 실온 이원자 기체가 5/2R인 것 — 3주차 조화진동자와 이번 주 회전 양자화가 압력솥 옆 실험실 데이터에 그대로 찍혀 있는 셈입니다. Einstein이 1907년 고체 비열로 같은 논리를 편 것이 양자론 최초의 '물성' 응용이었습니다."
          : "Classical equipartition gives every degree of freedom ½R at all temperatures — no steps allowed. The steps are quantization: when kT is smaller than the rotational spacing (~ℏ²/2I) or vibrational spacing (ℏω), that degree of freedom cannot be excited and freezes out. Cold H₂ acting monoatomic at 3/2R, room-temperature diatomics at 5/2R — Week 3's oscillator and this week's rotational quantization are stamped directly onto tabletop calorimetry. Einstein ran the same logic on solid heat capacities in 1907: the quantum theory's first application to bulk matter."}
      </Note>
    </Card>
  );
}

// =============================================================
// 6) TRANSPORT — mean free path, flux laws, effusion
// =============================================================
const SIGMA_GAS = [
  { key: "He", lb: "He", sig: 0.21, M: 0.004003 },
  { key: "N2", lb: "N₂", sig: 0.43, M: 0.0280134 },
  { key: "CO2", lb: "CO₂", sig: 0.52, M: 0.04401 },
  { key: "C6H6", lb: "C₆H₆", sig: 0.88, M: 0.07811 },
];

function TransportTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <MFPLab isKo={isKo} />
      <FluxCard isKo={isKo} />
      <EffusionLab isKo={isKo} />
    </div>
  );
}

// -- mean free path lab --------------------------------------
function MFPLab({ isKo }) {
  const [gasKey, setGasKey] = useState("N2");
  const [logP, setLogP] = useState(0);          // log10(P/atm)
  const [T, setT] = useState(298);
  const gas = SIGMA_GAS.find(g => g.key === gasKey);
  const P = Math.pow(10, logP) * 101325;
  const sig = gas.sig * 1e-18;
  const vmean = Math.sqrt(8 * RGAS * T / (Math.PI * gas.M));
  const lam = KB * T / (Math.SQRT2 * sig * P);
  const z = vmean / lam;
  const fmtLen = m => m >= 1 ? `${m.toFixed(1)} m` : m >= 1e-3 ? `${(m * 1e3).toFixed(1)} mm` : m >= 1e-6 ? `${(m * 1e6).toFixed(1)} μm` : `${(m * 1e9).toFixed(1)} nm`;

  const W = 700, Ht = 250, pad = 50;
  const { X, Y } = usePlotScale(-9, 1, -9, 2, W, Ht, pad);   // log10 P vs log10 lambda [m]
  const pts = [];
  for (let i = 0; i <= 200; i++) {
    const lp = -9 + 10 * i / 200;
    const lamI = KB * T / (Math.SQRT2 * sig * Math.pow(10, lp) * 101325);
    pts.push([lp, Math.max(-9, Math.min(2, Math.log10(lamI)))]);
  }
  return (
    <Card>
      <Hd>{isKo ? "충돌 운동학: 평균자유행로와 충돌 빈도" : "Collision kinetics: mean free path and collision frequency"}</Hd>
      <Eq>
        z = σ v_rel ℵ = √2 σ v̄ P/k_BT,   λ = v̄/z = k_BT/(√2 σ P)   (σ: {isKo ? "충돌 단면적" : "collision cross-section"}, v_rel = √2 v̄)
      </Eq>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", margin: "10px 0" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {SIGMA_GAS.map(g => (
            <button key={g.key} onClick={() => setGasKey(g.key)}
              style={{ ...btnStyle(gasKey === g.key), padding: "5px 11px", fontSize: 12 }}>{g.lb}</button>
          ))}
        </div>
        <Slider label="log₁₀(P/atm)" value={logP} min={-9} max={1} step={0.1} onChange={setLogP} width={190} fmt={v => v.toFixed(1)} />
        <Slider label="T" value={T} min={100} max={1000} step={10} onChange={setT} unit=" K" width={150} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10, marginBottom: 12 }}>
        <Stat label="σ" value={`${gas.sig.toFixed(2)} nm²`} color={C.purple} />
        <Stat label="v̄" value={`${vmean.toFixed(0)} m/s`} color={C.cyan} />
        <Stat label={isKo ? "평균자유행로 λ" : "mean free path λ"} value={fmtLen(lam)} color={C.accent} />
        <Stat label={isKo ? "충돌 빈도 z" : "collision rate z"} value={`${z.toExponential(2)} s⁻¹`} color={C.amber} />
      </div>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={{ ...svgBox(W), flex: "none", width: "100%", maxWidth: W }}>
        <path d={pathOf(pts, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.4} />
        <circle cx={X(logP)} cy={Y(Math.max(-9, Math.min(2, Math.log10(lam))))} r={5} fill={C.amber} />
        {[[-9, "nPa"], [-6, "μatm"], [-3, "matm"], [0, "1 atm"]].map(([v, lb]) => (
          <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={9.5} textAnchor="middle">{lb}</text>
        ))}
        {[[-9, "nm"], [-6, "μm"], [-3, "mm"], [0, "m"]].map(([v, lb]) => (
          <text key={lb} x={pad - 8} y={Y(v) + 3} fill={C.textDim} fontSize={9.5} textAnchor="end">{lb}</text>
        ))}
        <text x={W / 2} y={Ht - 8} fill={C.textDim} fontSize={11} textAnchor="middle">
          {isKo ? "압력 ↓ → λ ↑ (로그-로그에서 기울기 −1 직선)" : "lower P → longer λ (slope −1 on log-log)"}
        </text>
      </svg>
      <Note>
        {isKo
          ? "N₂·1 atm·298 K에서 λ ≈ 67 nm — 분자 지름의 ~180배이니 '거의 안 부딪히고 난다'는 운동론 가정 ②가 자가정합적으로 성립합니다. 슬라이더를 왼쪽 끝(초고진공, ~10⁻⁹ atm)으로 밀면 λ가 수십 m로 늘어나 분자가 용기 벽하고만 충돌합니다 — 반도체 공정의 스퍼터링·MBE·EUV 챔버가 초고진공을 요구하는 이유가 바로 이 λ 확보입니다."
          : "For N₂ at 1 atm, 298 K: λ ≈ 67 nm — about 180 molecular diameters, so assumption ② of the kinetic model (fly far, rarely collide) is self-consistent. Slide the pressure to ultra-high vacuum (~10⁻⁹ atm) and λ stretches to tens of meters: molecules then hit only the chamber walls — exactly why sputtering, MBE, and EUV tools in semiconductor fabs demand UHV."}
      </Note>
    </Card>
  );
}

// -- unified flux laws + coefficients ------------------------
function FluxCard({ isKo }) {
  const T = 298.15, P = 101325;
  const sig = 0.43e-18, M = 0.0280134;
  const vmean = Math.sqrt(8 * RGAS * T / (Math.PI * M));
  const lam = KB * T / (Math.SQRT2 * sig * P);
  const nDen = P / (KB * T), rho = nDen * M / NAV;
  const D = lam * vmean / 3;
  const mu = rho * D;
  const kth = vmean * lam * nDen / NAV * 2.5 * RGAS / 3;
  return (
    <Card>
      <Hd>{isKo ? "하나의 법칙, 세 개의 이름: Fick · Fourier · Newton" : "One law, three names: Fick · Fourier · Newton"}</Hd>
      <Eq>
        Ψ_z = −δ · dψ/dz   ({isKo ? "플럭스 = 계수 × 기울기" : "flux = coefficient × gradient"})
      </Eq>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12.5, fontFamily: "'JetBrains Mono',monospace", minWidth: 620 }}>
          <thead>
            <tr style={{ color: C.textDim }}>
              {[isKo ? "수송량" : "transported", isKo ? "법칙" : "law", "Ψ (flux)", "ψ (density)", "δ [m²/s]"].map(h => (
                <th key={h} style={{ padding: "6px 14px", borderBottom: `1px solid ${C.border}`, textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              [isKo ? "질량" : "mass", "Fick", "J = −D dℵ/dz", "ℵ (ρ)", "D"],
              [isKo ? "에너지" : "energy", "Fourier", "q = −k dT/dz", "ρCpT", "κ = k/ρCp"],
              [isKo ? "운동량" : "momentum", "Newton", "τ = −μ dvₓ/dz", "ρvₓ", "η = μ/ρ"],
            ].map((r, i) => (
              <tr key={i} style={{ color: C.text }}>
                {r.map((cell, j) => (
                  <td key={j} style={{ padding: "6px 14px", color: j === 0 ? C.accent : j === 4 ? C.ok : C.text }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <HdSub>{isKo ? "운동론이 주는 계수: 전부 ⅓λv̄ 가족" : "The kinetic-theory coefficients: all one ⅓λv̄ family"}</HdSub>
      <Eq>
        D = ⅓λv̄,   κ = ⅓λv̄,   η = ⅓λv̄   →   Sc = η/D ≈ 1,  Le = κ/D ≈ 1,  Pr = η/κ ≈ 1 (Reynolds {isKo ? "유사" : "analogy"})
      </Eq>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10, margin: "10px 0" }}>
        <Stat label={isKo ? "N₂ 확산계수 D (예측)" : "N₂ diffusivity D (predicted)"} value={`${(D * 1e5).toFixed(2)}×10⁻⁵ m²/s`} color={C.accent} />
        <Stat label={isKo ? "N₂ 점도 μ (예측)" : "N₂ viscosity μ (predicted)"} value={`${(mu * 1e6).toFixed(1)} μPa·s`} color={C.cyan} />
        <Stat label={isKo ? "N₂ 열전도도 k (예측)" : "N₂ conductivity k (predicted)"} value={`${(kth * 1e3).toFixed(1)} mW/m·K`} color={C.amber} />
        <Stat label="Sc = μ/ρD" value="1.00" color={C.ok} />
      </div>
      <Note>
        {isKo
          ? "왼쪽에서 오는 분자는 λ 위쪽의 ψ를, 오른쪽에서 오는 분자는 λ 아래쪽의 ψ를 실어 나릅니다 — 순 플럭스는 그 차이 ∝ λ dψ/dz. 강의의 유도(J = ¼ℵv̄ 양방향 셈)에 비행 중 충돌 보정을 넣으면 계수는 ⅓입니다. 실측(N₂: D ≈ 2.0×10⁻⁵, μ ≈ 17.9 μPa·s, k ≈ 25.8 mW/m·K)과 자릿수가 정확히 맞고, 점도가 압력에 무관하다는 Maxwell의 역설적 예측(λ ∝ 1/P와 ℵ ∝ P가 상쇄)까지 재현합니다. Sc·Le·Pr ≈ 1이라는 Reynolds 유사는 유체역학·전달현상 수업에서 다시 만날 화공의 핵심 어림입니다."
          : "Molecules arriving from the left carry ψ from a plane λ above; those from the right carry it from λ below — the net flux is the difference, ∝ λ dψ/dz. Adding the in-flight-collision correction to the lecture's two-sided ¼ℵv̄ bookkeeping gives the ⅓ prefactor. The predictions land within a factor ~2 of experiment (N₂: D ≈ 2.0×10⁻⁵, μ ≈ 17.9 μPa·s, k ≈ 25.8 mW/m·K), and reproduce Maxwell's paradoxical result that viscosity is pressure-independent (λ ∝ 1/P cancels ℵ ∝ P). The Reynolds analogy Sc·Le·Pr ≈ 1 will return in your transport-phenomena courses — a core ChemE estimate."}
      </Note>
    </Card>
  );
}

// -- effusion lab (Knudsen / Cs example) ---------------------
function EffusionLab({ isKo }) {
  const [T, setT] = useState(500);
  const [dHole, setDHole] = useState(0.50);     // mm
  const [dm, setDm] = useState(385);            // mg
  const [dt, setDt] = useState(100);            // s
  const M_Cs = 0.132905;
  const A0 = Math.PI * Math.pow(dHole * 1e-3 / 2, 2);
  const Pcs = Math.sqrt(2 * Math.PI * RGAS * T / M_Cs) * (dm * 1e-6) / (A0 * dt);
  const Zw = Pcs / Math.sqrt(2 * Math.PI * (M_Cs / NAV) * KB * T);
  return (
    <Card>
      <Hd>{isKo ? "분출(Effusion) 실험실: 새어나간 질량으로 증기압 재기" : "Effusion lab: weighing a leak to measure vapor pressure"}</Hd>
      <Eq>
        {isKo ? "분출 속도" : "rate"} = Z_w A₀ = PA₀/√(2πmk_BT)   →   P = √(2πRT/M) · Δm/(A₀Δt)   (Knudsen {isKo ? "법" : "method"})
      </Eq>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", margin: "10px 0" }}>
        <Slider label="T" value={T} min={350} max={700} step={5} onChange={setT} unit=" K" width={150} />
        <Slider label={isKo ? "구멍 지름" : "hole diameter"} value={dHole} min={0.1} max={2} step={0.05} onChange={setDHole} unit=" mm" width={150} fmt={v => v.toFixed(2)} />
        <Slider label="Δm" value={dm} min={50} max={1000} step={5} onChange={setDm} unit=" mg" width={150} />
        <Slider label="Δt" value={dt} min={10} max={600} step={10} onChange={setDt} unit=" s" width={150} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10, marginBottom: 10 }}>
        <Stat label={isKo ? "구멍 면적 A₀" : "hole area A₀"} value={`${(A0 * 1e6).toFixed(3)} mm²`} color={C.textDim} />
        <Stat label={isKo ? "Cs 증기압 P" : "Cs vapor pressure P"} value={`${(Pcs / 1e3).toFixed(2)} kPa`} color={C.accent} />
        <Stat label={isKo ? "충돌 플럭스 Z_w" : "collision flux Z_w"} value={`${Zw.toExponential(2)} m⁻²s⁻¹`} color={C.cyan} />
        <Stat label={isKo ? "강의 예제 값" : "lecture value"} value="8.7 kPa @500 K, 0.5 mm, 385 mg/100 s" color={C.amber} />
      </div>
      <Note>
        {isKo
          ? "기본값이 강의 예제 그대로입니다 — 세슘(mp 29 ℃)을 500 K로 데우고 0.50 mm 구멍을 100초 열었더니 385 mg이 사라졌다면, 증기압은 8.7 kPa. 저울 하나로 증기압을 재는 Knudsen 분출법입니다. 분출 속도의 1/√M 의존성은 Graham 법칙이고, 이 미세한 질량 차별이 맨해튼 프로젝트의 UF₆ 기체확산 동위원소 분리(²³⁵U/²³⁸U, 단당 1.0043배)를 가능하게 했습니다."
          : "The defaults reproduce the lecture example — cesium (m.p. 29 ℃) held at 500 K loses 385 mg through a 0.50 mm hole in 100 s, so its vapor pressure is 8.7 kPa: the Knudsen method measures pressure with a balance. The 1/√M dependence is Graham's law of effusion, and that tiny mass discrimination (a factor 1.0043 per stage for ²³⁵UF₆/²³⁸UF₆) powered the Manhattan Project's gaseous-diffusion isotope separation."}
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
        q: "P1. Balmer 계열의 Hβ 선(n = 4 → 2)의 광자 에너지와 파장을 구하고, 눈에 어떤 색으로 보일지 답하시오.",
        s: "ΔE = E₄ − E₂ = −13.606/16 − (−13.606/4) = −0.8504 + 3.4014 = 2.5511 eV. λ = 1239.84/2.5511 = 486.0 nm — 청록색(cyan-blue)입니다. 같은 방법으로 Hα(3→2)는 1.8897 eV → 656.1 nm 빨강, Hγ(5→2)는 434 nm 보라. 수소 방전관이 분홍빛으로 보이는 것은 강한 Hα 빨강이 지배하기 때문입니다.",
      },
      en: {
        q: "P1. For the Balmer Hβ line (n = 4 → 2), find the photon energy and wavelength, and state its visible color.",
        s: "ΔE = E₄ − E₂ = −13.606/16 + 13.606/4 = 2.5511 eV, so λ = 1239.84/2.5511 = 486.0 nm — cyan-blue. Likewise Hα (3→2) gives 1.8897 eV → 656.1 nm red and Hγ (5→2) → 434 nm violet. A hydrogen discharge tube glows pink because the strong red Hα dominates.",
      },
    },
    {
      ko: {
        q: "P2. n = 3 준위의 모든 상태 |n,l,m,s⟩를 나열해 축퇴도를 세고, 일반식 2n²을 증명하시오.",
        s: "l = 0: m = 0 (1개) / l = 1: m = −1,0,1 (3개) / l = 2: m = −2…2 (5개). 궤도 상태 1+3+5 = 9개, 스핀 ×2 = 18 = 2·3². 일반적으로 Σ_{l=0}^{n−1}(2l+1) = 1+3+…+(2n−1)은 첫 n개 홀수의 합 = n²이고(등차급수), 스핀 2를 곱해 2n². 이것이 K·L·M·N 껍질 용량 2, 8, 18, 32이며 주기율표 주기 길이의 골격입니다.",
      },
      en: {
        q: "P2. List every state |n,l,m,s⟩ of the n = 3 level, count the degeneracy, and prove the general 2n² formula.",
        s: "l = 0: m = 0 (1) / l = 1: m = −1,0,1 (3) / l = 2: m = −2…2 (5). Orbital states 1+3+5 = 9, times spin 2 = 18 = 2·3². In general Σ_{l=0}^{n−1}(2l+1) = 1+3+…+(2n−1) is the sum of the first n odd numbers = n² (arithmetic series), doubled by spin: 2n². Hence the K·L·M·N shell capacities 2, 8, 18, 32 — the skeleton of the periodic table's row lengths.",
      },
    },
    {
      ko: {
        q: "P3. 수소 원자가 n = 2 들뜬 상태에 있다. (a) 이 상태에서의 이온화 에너지, (b) Balmer 계열의 최단 파장(계열 한계)을 구하시오.",
        s: "(a) 이온화는 E = 0까지 올리는 것: ΔE = 0 − (−13.606/4) = 3.401 eV — 바닥상태 13.606 eV의 1/4입니다. (b) 계열 한계는 n = ∞ → 2 전이: 같은 3.401 eV이므로 λ_limit = 1239.84/3.401 = 364.5 nm (근자외선). 이보다 짧은 파장에서는 연속 스펙트럼이 시작됩니다 — 광자가 남는 에너지를 자유전자 운동에너지로 주며 이온화시키기 때문입니다.",
      },
      en: {
        q: "P3. A hydrogen atom sits in the n = 2 excited state. Find (a) its ionization energy and (b) the shortest wavelength (series limit) of the Balmer series.",
        s: "(a) Ionization lifts it to E = 0: ΔE = 13.606/4 = 3.401 eV — a quarter of the ground-state 13.606 eV. (b) The series limit is n = ∞ → 2, the same 3.401 eV, so λ = 1239.84/3.401 = 364.5 nm (near-UV). Below this wavelength the spectrum turns continuous: the photon ionizes the atom and hands the excess to the free electron's kinetic energy.",
      },
    },
    {
      ko: {
        q: "P4. 상태 |↑z⟩에서 Sx를 측정한다. (a) 가능한 결과와 각 확률을 구하시오. (b) +ℏ/2가 나온 직후 Sz를 다시 재면 +ℏ/2가 나올 확률은? 이 결과가 왜 '측정이 상태를 바꾼다'는 공준의 증거인지 설명하시오.",
        s: "(a) |↑z⟩ = (|↑x⟩ + |↓x⟩)/√2이므로 결과는 ±ℏ/2, 확률은 각각 |1/√2|² = 1/2. (b) 측정 직후 상태는 |↑x⟩ = (|↑⟩+|↓⟩)/√2로 붕괴했으므로 P(Sz = +ℏ/2) = 1/2. 처음에 Sz가 확실히 +ℏ/2였는데 Sx 측정 후 다시 반반이 된 것은, 측정이 단순히 '몰랐던 값을 읽는' 행위가 아니라 상태 자체를 고유벡터로 투영하는 행위임을 보여줍니다. [Sz,Sx] = iℏSy ≠ 0인 비양립 관측량의 필연적 귀결입니다.",
      },
      en: {
        q: "P4. Measure Sx on |↑z⟩. (a) Possible outcomes and probabilities? (b) Right after obtaining +ℏ/2, measure Sz again — probability of +ℏ/2? Why is this evidence that measurement changes the state?",
        s: "(a) |↑z⟩ = (|↑x⟩ + |↓x⟩)/√2, so outcomes ±ℏ/2 with probability ½ each. (b) The state has collapsed to |↑x⟩ = (|↑⟩+|↓⟩)/√2, so P(Sz = +ℏ/2) = ½. Sz was certain before, yet is a coin flip after the Sx measurement: measuring is not passively reading a pre-existing value but projecting the state onto an eigenvector — the inescapable consequence of incompatible observables, [Sz,Sx] = iℏSy ≠ 0.",
      },
    },
    {
      ko: {
        q: "P5. B = 1.0 T 자기장 속 자유전자의 Zeeman 갈라짐 ΔE와 공명 주파수를 구하시오 (g = 2.0023, μB = 5.788×10⁻⁵ eV/T). 이 주파수가 어느 전자기파 대역인지, 어떤 분석 기법의 기반인지 답하시오.",
        s: "ΔE = g μB B = 2.0023 × 5.788×10⁻⁵ × 1.0 = 1.159×10⁻⁴ eV. ν = ΔE/h = 1.159×10⁻⁴/4.136×10⁻¹⁵ = 2.80×10¹⁰ Hz = 28.0 GHz — 마이크로파 대역입니다. 이것이 ESR(EPR) 분광학의 공명 조건이며, 라디칼·전이금속 착물의 홀전자를 검출합니다. 핵스핀 버전(양성자, 42.6 MHz/T)이 NMR이고 병원 MRI의 원리입니다.",
      },
      en: {
        q: "P5. For a free electron in B = 1.0 T, find the Zeeman splitting ΔE and resonance frequency (g = 2.0023, μB = 5.788×10⁻⁵ eV/T). Which electromagnetic band is this, and which analytical technique rests on it?",
        s: "ΔE = g μB B = 1.159×10⁻⁴ eV; ν = ΔE/h = 2.80×10¹⁰ Hz = 28.0 GHz — microwaves. That is the resonance condition of ESR (EPR) spectroscopy, which detects unpaired electrons in radicals and transition-metal complexes. The nuclear-spin version (protons, 42.6 MHz/T) is NMR — and the hospital MRI.",
      },
    },
    {
      ko: {
        q: "P6. 298 K의 N₂에 대해 v_mp, v̄, v_rms를 구하고 비가 1 : 1.128 : 1.225임을 확인하시오. 같은 온도의 He은 몇 배 빠른가?",
        s: "M = 0.0280 kg/mol: v_mp = √(2RT/M) = 420.7 m/s, v̄ = √(8RT/πM) = 474.7 m/s, v_rms = √(3RT/M) = 515.2 m/s. 비는 √2 : √(8/π) : √3 = 1 : 1.1284 : 1.2247 — 온도·기체와 무관한 보편 상수입니다. He(M = 0.004003)은 √(28.01/4.003) = 2.65배 빠릅니다(v̄ ≈ 1256 m/s). 모든 속력이 √(T/M) 하나로 정해진다는 것이 Maxwell 분포의 핵심입니다.",
      },
      en: {
        q: "P6. For N₂ at 298 K compute v_mp, v̄, v_rms and confirm the ratio 1 : 1.128 : 1.225. How much faster is He at the same temperature?",
        s: "M = 0.0280 kg/mol: v_mp = 420.7, v̄ = 474.7, v_rms = 515.2 m/s. The ratio √2 : √(8/π) : √3 = 1 : 1.1284 : 1.2247 is a universal constant, independent of gas and temperature. Helium (M = 0.004003) is √(28.01/4.003) = 2.65× faster (v̄ ≈ 1256 m/s). Every characteristic speed hangs on the single combination √(T/M) — the heart of the Maxwell distribution.",
      },
    },
    {
      ko: {
        q: "P7. N₂(σ = 0.43 nm²)의 평균자유행로를 (a) 1 atm, (b) 10⁻³ Torr(진공 펌프 수준), (c) 10⁻⁹ Torr(초고진공)에서 구하시오. 반도체 박막 증착 장비가 초고진공을 쓰는 이유를 λ로 설명하시오.",
        s: "λ = k_BT/(√2σP), T = 298 K. (a) P = 101325 Pa → λ = 4.116×10⁻²¹/(6.16×10⁻¹⁴) ≈ 67 nm. (b) 10⁻³ Torr = 0.1333 Pa → λ ≈ 5.1 cm. (c) 10⁻⁹ Torr → λ ≈ 51 km! 증착 소스에서 웨이퍼까지(수십 cm)를 분자가 무충돌 직선으로 날아가야 균일한 박막과 오염 없는 계면을 얻습니다. λ ≫ 장비 크기가 초고진공의 설계 기준입니다 (Knudsen 수 Kn = λ/L ≫ 1).",
      },
      en: {
        q: "P7. Find the mean free path of N₂ (σ = 0.43 nm²) at (a) 1 atm, (b) 10⁻³ Torr (rough vacuum), (c) 10⁻⁹ Torr (UHV). Use λ to explain why semiconductor thin-film tools run under ultra-high vacuum.",
        s: "λ = k_BT/(√2σP) at 298 K. (a) 101325 Pa → λ ≈ 67 nm. (b) 10⁻³ Torr = 0.1333 Pa → λ ≈ 5.1 cm. (c) 10⁻⁹ Torr → λ ≈ 51 km! Atoms must fly ballistically from source to wafer (tens of cm) without a single collision to give uniform films and clean interfaces. The design rule is λ ≫ chamber size — Knudsen number Kn = λ/L ≫ 1.",
      },
    },
    {
      ko: {
        q: "P8. 강의 예제를 재현하시오: 세슘(M = 132.9 g/mol)을 500 K로 가열한 용기에 지름 0.50 mm 구멍을 100 s 열었더니 385 mg이 새어나갔다. 증기압을 구하고, 분출 속도가 1/√M에 비례한다는 사실의 응용 예를 하나 드시오.",
        s: "A₀ = π(0.25×10⁻³)² = 1.963×10⁻⁷ m². P = √(2πRT/M)·Δm/(A₀Δt) = √(2π×8.314×500/0.1329) × 3.85×10⁻⁴/(1.963×10⁻⁷×100) = 443.3 × 19.61 = 8.69×10³ Pa ≈ 8.7 kPa ✓. 1/√M 의존(Graham 법칙)의 대표 응용은 동위원소 분리입니다: ²³⁵UF₆와 ²³⁸UF₆의 분출 속도비는 √(352.04/349.03) = 1.0043으로, 한 단으로는 0.43%뿐이라 수천 단의 캐스케이드를 씁니다. 우라늄 농축 시설의 규모가 거대한 물리적 이유입니다.",
      },
      en: {
        q: "P8. Reproduce the lecture example: cesium (M = 132.9 g/mol) at 500 K loses 385 mg through a 0.50 mm hole in 100 s. Find the vapor pressure, and give one application of the 1/√M effusion-rate dependence.",
        s: "A₀ = π(0.25×10⁻³)² = 1.963×10⁻⁷ m². P = √(2πRT/M)·Δm/(A₀Δt) = 443.3 × 19.61 = 8.69 kPa ≈ 8.7 kPa ✓. The classic application of the 1/√M dependence (Graham's law) is isotope separation: ²³⁵UF₆ effuses only √(352.04/349.03) = 1.0043× faster than ²³⁸UF₆ — 0.43% per stage — hence cascades of thousands of stages. That is the physical reason uranium-enrichment plants are enormous.",
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
            ? "풀이를 열기 전에 반드시 스스로 풀어보세요. P1–P3은 수소 스펙트럼(λ = 1239.84 eV·nm / ΔE), P4–P5는 스핀, P6–P8은 기체운동론·수송현상 실단위 계산 연습입니다."
            : "Attempt each before opening the solution. P1–P3 drill the hydrogen spectrum (λ = 1239.84 eV·nm / ΔE), P4–P5 spin, P6–P8 real-unit kinetic theory and transport."}
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
  hydrogen_spectrum: {
    ko: "수소: Bohr 준위·스펙트럼 계열·축퇴", en: "Hydrogen: Bohr levels · series · degeneracy",
    codes: { python: PY_HATOM, matlab: ML_HATOM, julia: JL_HATOM, cpp: CPP_HATOM },
  },
  spin_measurement: {
    ko: "스핀: Pauli 대수·순차 측정·유니터리", en: "Spin: Pauli algebra · sequential measurement · unitarity",
    codes: { python: PY_SPIN, matlab: ML_SPIN, julia: JL_SPIN, cpp: CPP_SPIN },
  },
  maxwell_boltzmann: {
    ko: "Maxwell-Boltzmann 분포·특성 속력·비열", en: "Maxwell-Boltzmann · speeds · heat capacity",
    codes: { python: PY_MAXWELL, matlab: ML_MAXWELL, julia: JL_MAXWELL, cpp: CPP_MAXWELL },
  },
  transport: {
    ko: "수송: 평균자유행로·D/κ/η·분출", en: "Transport: mean free path · D/κ/η · effusion",
    codes: { python: PY_TRANSPORT, matlab: ML_TRANSPORT, julia: JL_TRANSPORT, cpp: CPP_TRANSPORT },
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
  const [topic, setTopic] = useState("hydrogen_spectrum");
  const [cl, setCl] = useState("python");
  const [copied, setCopied] = useState(false);
  const code = CODE_TOPICS[topic].codes[cl];
  const fname = `wk04_${topic}.${LANG_META[cl].ext}`;

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
            ? "이 페이지의 모든 인터랙티브 그림 뒤의 물리를 직접 실행해 볼 수 있는 독립 코드입니다. 수치 검증 완료: E₁ = −13.606 eV, Hα = 656.1 nm, 축퇴 2n² = 2·8·18·32, [Sx,Sy] − iℏSz = 0, MC 확률 0.5, ∫f(v)dv = 1.000000, 속력비 1:1.1284:1.2247, λ(N₂) = 66.8 nm, Cs 분출 8.69 kPa."
            : "Standalone codes behind every interactive figure on this page. Validated: E₁ = −13.606 eV, Hα = 656.1 nm, degeneracy 2n² = 2·8·18·32, [Sx,Sy] − iℏSz = 0, MC probability 0.5, ∫f(v)dv = 1.000000, speed ratios 1:1.1284:1.2247, λ(N₂) = 66.8 nm, Cs effusion 8.69 kPa."}
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
          fontFamily: "'JetBrains Mono',monospace", color: "#c9d1d9", maxHeight: 560, overflowY: "auto",
        }}>{code}</pre>
      </Card>
    </div>
  );
}
