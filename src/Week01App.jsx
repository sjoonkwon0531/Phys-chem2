// ============================================================
// Week01App.jsx — Birth of Quantum Mechanics
// Physical Chemistry 2 (물리화학 2)
// SKKU School of Chemical Engineering
// Smart Process & Materials Design Lab (SPMDL)
// Prof. S. Joon Kwon
// ------------------------------------------------------------
// Topics covered (Wk01 Part 1 / Part 2 / Part 3):
//   • Part 1 — Thermal radiation, blackbody, solid angle,
//              Rayleigh-Jeans & UV catastrophe, Planck's law,
//              Stefan-Boltzmann, Wien's displacement law
//   • Part 2 — Newtonian → Lagrangian (least action, Euler-Lagrange)
//              → Hamiltonian (canonical eqns) → Hamilton-Jacobi
//   • Part 3 — Maxwell → wave equation, Helmholtz modes,
//              Schrödinger equation, quantization as eigenvalue problem
// ============================================================
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  PY_PLANCK, ML_PLANCK, JL_PLANCK, CPP_PLANCK,
  PY_ACTION, ML_ACTION, JL_ACTION, CPP_ACTION,
  PY_HELM, ML_HELM, JL_HELM, CPP_HELM,
  PY_SCHRO, ML_SCHRO, JL_SCHRO, CPP_SCHRO,
} from "./Week01Codes";

// ── i18n ─────────────────────────────────────────────────────
const i18n = {
  ko: {
    weekTitle: "Week 1 — 양자역학의 탄생",
    subtitle: "흑체복사 · 고전역학의 완성 · Schrödinger 방정식",
    tabs: {
      overview: "개요",
      radiation: "열복사",
      planck: "Planck 법칙",
      classical: "고전역학",
      wave: "파동 & Helmholtz",
      schrodinger: "Schrödinger",
      practice: "연습문제",
      codes: "Raw 코드",
    },
    run: "▶ 실행", stop: "■ 정지", reset: "↺ 초기화",
    download: "다운로드", show: "보기", hide: "숨기기",
    temperature: "온도 T",
  },
  en: {
    weekTitle: "Week 1 — Birth of Quantum Mechanics",
    subtitle: "Blackbody radiation · Classical mechanics · Schrödinger equation",
    tabs: {
      overview: "Overview",
      radiation: "Thermal Radiation",
      planck: "Planck's Law",
      classical: "Classical Mech.",
      wave: "Wave & Helmholtz",
      schrodinger: "Schrödinger",
      practice: "Practice",
      codes: "Raw Codes",
    },
    run: "▶ Run", stop: "■ Stop", reset: "↺ Reset",
    download: "Download", show: "Show", hide: "Hide",
    temperature: "Temperature T",
  },
};

// ── Common style tokens (matching repo design system) ────────
const C = {
  bg: "#0b0f17",
  panel: "#111827",
  card: "#1f2937",
  border: "#374151",
  text: "#e5e7eb",
  textDim: "#9ca3af",
  accent: "#f59e0b",
  accentSoft: "#fbbf24",
  blue: "#3b82f6",
  blueSoft: "#60a5fa",
  warn: "#f59e0b",
  ok: "#10b981",
  err: "#ef4444",
  purple: "#a78bfa",
  cyan: "#22d3ee",
  pink: "#f472b6",
};

// physical constants (SI)
const PH = {
  h: 6.62607015e-34, c: 2.99792458e8, kB: 1.380649e-23,
  sigma: 5.670374419e-8,
};
PH.C1 = 2 * Math.PI * PH.h * PH.c * PH.c;
PH.C2 = PH.h * PH.c / PH.kB;

// =============================================================
// MAIN COMPONENT
// =============================================================
export default function Week01App({ onBack, lang: langProp, onLangChange }) {
  // If the hub passes `lang`, follow it (KOR/ENG chosen on the landing gate);
  // otherwise fall back to internal state so the module also works standalone.
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
        {/* Tab bar */}
        <div style={{ maxWidth: 1200, margin: "10px auto 0", display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
          {tabs.map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} style={tabBtnStyle(tab === k)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1200, margin: "24px auto 0", padding: "0 20px" }}>
        {tab === "overview" && <Overview lang={lang} />}
        {tab === "radiation" && <Radiation lang={lang} />}
        {tab === "planck" && <PlanckExplorer lang={lang} />}
        {tab === "classical" && <ClassicalMech lang={lang} />}
        {tab === "wave" && <WaveHelmholtz lang={lang} />}
        {tab === "schrodinger" && <Schrodinger lang={lang} />}
        {tab === "practice" && <Practice lang={lang} />}
        {tab === "codes" && <RawCodes lang={lang} />}
      </div>
    </div>
  );
}

// =============================================================
// SHARED UI PRIMITIVES
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
    background: active ? "rgba(245,158,11,0.14)" : "transparent",
    color: active ? C.accentSoft : C.textDim,
    border: `1px solid ${active ? "rgba(245,158,11,0.4)" : "transparent"}`,
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
function Slider({ label, value, min, max, step, onChange, unit, width }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: C.text, minWidth: 0 }}>
      <span style={{ color: C.textDim, whiteSpace: "nowrap" }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: width || 140 }} />
      <span style={{ fontFamily: "'JetBrains Mono',monospace", color: C.accentSoft, whiteSpace: "nowrap", minWidth: 60 }}>
        {value}{unit || ""}
      </span>
    </label>
  );
}
function H2({ children }) {
  return <h2 style={{
    fontSize: 20, fontWeight: 800, margin: "0 0 12px",
    fontFamily: "'Space Grotesk','Noto Sans KR',sans-serif", color: C.text,
  }}>{children}</h2>;
}
function H3({ children }) {
  return <h3 style={{
    fontSize: 15, fontWeight: 700, margin: "16px 0 8px", color: C.accentSoft,
  }}>{children}</h3>;
}
function Note({ children }) {
  return <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.7, margin: "8px 0" }}>{children}</p>;
}
function Pill({ color, children }) {
  return <span style={{
    display: "inline-block", padding: "2px 10px", borderRadius: 999,
    background: `${color}22`, color, fontSize: 11, fontWeight: 700,
    border: `1px solid ${color}55`, marginRight: 6,
  }}>{children}</span>;
}

// SVG plot scaffold helper
function usePlotScale(xMin, xMax, yMin, yMax, W, H, pad) {
  const X = x => pad + (W - 2 * pad) * (x - xMin) / (xMax - xMin || 1);
  const Y = y => H - pad - (H - 2 * pad) * (y - yMin) / (yMax - yMin || 1);
  return { X, Y };
}
function pathOf(pts, X, Y) {
  return pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${X(x).toFixed(2)} ${Y(y).toFixed(2)}`).join(" ");
}

// =============================================================
// 1) OVERVIEW — timeline of the birth of QM + week structure
// =============================================================
function Overview({ lang }) {
  const isKo = lang === "ko";
  const timeline = [
    { yr: "1859", who: "Kirchhoff", ko: "흑체 개념 제안 — 좋은 흡수체는 좋은 방출체 (ε=α)", en: "Blackbody concept — good absorbers are good emitters (ε=α)", c: C.textDim },
    { yr: "1879·84", who: "Stefan & Boltzmann", ko: "총 복사 에너지 ∝ T⁴ (실험 → 열역학 유도)", en: "Total radiated energy ∝ T⁴ (experiment → thermodynamic derivation)", c: C.textDim },
    { yr: "1893", who: "Wien", ko: "변위법칙 λmax·T = 상수", en: "Displacement law λmax·T = const", c: C.textDim },
    { yr: "1900", who: "Rayleigh (& Jeans)", ko: "고전 등분배 → 자외선 파탄 (BIG problem!)", en: "Classical equipartition → ultraviolet catastrophe (BIG problem!)", c: C.err },
    { yr: "1900", who: "Planck", ko: "에너지 양자화 E = nhν → Planck 복사법칙", en: "Energy quantization E = nhν → Planck's radiation law", c: C.accent },
    { yr: "1905", who: "Einstein", ko: "광양자 가설: E = hν (광전효과)", en: "Light quantum: E = hν (photoelectric effect)", c: C.accent },
    { yr: "1923", who: "Compton", ko: "광자의 운동량 p = h/λ 실증", en: "Photon momentum p = h/λ confirmed", c: C.accent },
    { yr: "1834~", who: "Hamilton · Jacobi", ko: "고전역학의 완성: 최소작용 → 정준방정식 → H-J 방정식", en: "Classical mechanics perfected: least action → canonical eqns → H-J equation", c: C.blueSoft },
    { yr: "1926", who: "Schrödinger", ko: "\"고유값 문제로서의 양자화\" — 파동방정식 탄생", en: "\"Quantization as an eigenvalue problem\" — the wave equation is born", c: C.ok },
  ];
  return (
    <div>
      <Card>
        <H2>{isKo ? "이번 주의 큰 그림" : "The big picture of Week 1"}</H2>
        <Note>
          {isKo
            ? "물리화학 2는 양자역학·분광학·통계열역학을 다룹니다. 1주차는 그 출발점 — 고전물리가 설명하지 못한 흑체복사 문제에서 시작해, 고전역학의 가장 세련된 형태(Lagrangian → Hamiltonian → Hamilton-Jacobi)를 복습하고, 파동방정식을 거쳐 Schrödinger 방정식이 '고유값 문제'로 태어나는 순간까지 하나의 서사로 연결합니다."
            : "Physical Chemistry 2 covers quantum mechanics, spectroscopy and statistical thermodynamics. Week 1 is the origin story — from the blackbody problem classical physics could not explain, through the most refined forms of classical mechanics (Lagrangian → Hamiltonian → Hamilton-Jacobi), to the moment the Schrödinger equation is born as an eigenvalue problem."}
        </Note>
        <FlowDiagram isKo={isKo} />
      </Card>

      <Card>
        <H2>{isKo ? "양자역학 탄생 연대기" : "Timeline: birth of quantum mechanics"}</H2>
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
        <H2>{isKo ? "이번 주 핵심 방정식 4개" : "Four key equations this week"}</H2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
          {[
            { name: isKo ? "Planck 복사법칙" : "Planck's law", eq: "E_λ = (2πhc²/λ⁵) · 1/(e^{hc/λk_BT} − 1)", c: C.accent },
            { name: isKo ? "Euler-Lagrange 방정식" : "Euler-Lagrange equation", eq: "d/dt (∂L/∂q̇) − ∂L/∂q = 0", c: C.blueSoft },
            { name: isKo ? "Hamilton 정준방정식" : "Hamilton's canonical equations", eq: "q̇ = ∂H/∂p ,   ṗ = −∂H/∂q", c: C.purple },
            { name: isKo ? "Schrödinger 방정식" : "Schrödinger equation", eq: "−(ℏ²/2m)∇²ψ + Vψ = Eψ", c: C.ok },
          ].map((k, i) => (
            <div key={i} style={{ background: C.card, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: k.c, marginBottom: 6 }}>{k.name}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: C.text }}>{k.eq}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <H2>{isKo ? "학습 목표" : "Learning outcomes"}</H2>
        {[
          isKo ? "흑체·방사율·Kirchhoff 법칙을 설명하고 입체각으로 E = πI를 유도할 수 있다." : "Explain blackbody, emissivity, Kirchhoff's law; derive E = πI using solid angles.",
          isKo ? "공동 모드 계수 → Rayleigh-Jeans → 자외선 파탄의 논리를 재구성할 수 있다." : "Reconstruct the logic: cavity mode counting → Rayleigh-Jeans → UV catastrophe.",
          isKo ? "Planck의 양자화 가설로 ⟨E⟩ = hν/(e^{hν/kT}−1)를 분배함수로 유도할 수 있다." : "Derive ⟨E⟩ = hν/(e^{hν/kT}−1) from Planck's quantization via the partition function.",
          isKo ? "Planck 법칙의 극한으로 Stefan-Boltzmann·Wien·Rayleigh-Jeans를 복원할 수 있다." : "Recover Stefan-Boltzmann, Wien and Rayleigh-Jeans as limits of Planck's law.",
          isKo ? "최소작용 원리에서 Euler-Lagrange 방정식을 유도하고 SHO에 적용할 수 있다." : "Derive the Euler-Lagrange equation from least action and apply it to the SHO.",
          isKo ? "Legendre 변환으로 Hamiltonian을 정의하고 정준방정식·위상공간을 그릴 수 있다." : "Define the Hamiltonian via Legendre transform; draw canonical equations & phase space.",
          isKo ? "파동방정식 → Helmholtz 방정식 → 경계조건에 의한 모드 양자화를 설명할 수 있다." : "Explain wave equation → Helmholtz equation → mode quantization by boundary conditions.",
          isKo ? "1D Schrödinger 방정식을 FDM 고유값 문제로 풀고 해석해와 비교할 수 있다." : "Solve the 1D Schrödinger equation as an FDM eigenvalue problem; compare with analytic results.",
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
    { t: isKo ? "열복사 문제" : "Thermal radiation", s: isKo ? "자외선 파탄" : "UV catastrophe", c: C.err },
    { t: isKo ? "Planck 양자화" : "Planck quantization", s: "E = nhν", c: C.accent },
    { t: isKo ? "고전역학 완성" : "Classical mechanics", s: "L → H → H-J", c: C.blueSoft },
    { t: isKo ? "파동방정식" : "Wave equation", s: "∇²f = (1/c²)∂²f/∂t²", c: C.purple },
    { t: "Schrödinger", s: "Ĥψ = Eψ", c: C.ok },
  ];
  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 0, flexWrap: "wrap", marginTop: 10 }}>
      {steps.map((st, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div style={{
            background: C.card, border: `1px solid ${st.c}55`, borderRadius: 12,
            padding: "10px 14px", minWidth: 130, textAlign: "center",
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
// 2) THERMAL RADIATION — EM spectrum, solid angle, E = πI
// =============================================================
function Radiation({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <Card>
        <H2>{isKo ? "전자기 스펙트럼과 열복사" : "EM spectrum & thermal radiation"}</H2>
        <Note>
          {isKo
            ? "온도 T의 모든 물체는 전자기파를 방출합니다. 표면에 입사한 복사는 반사(ρ)·흡수(α)·투과(τ)로 나뉘며 ρ+α+τ=1. 모든 파장에서 완전 흡수(α=1)하는 이상적인 물체가 흑체(blackbody)입니다 — Vantablack은 가시광 99.999% 이상을 흡수하는 실제 근사물입니다."
            : "Every body at temperature T emits EM waves. Incident radiation splits into reflection (ρ), absorption (α), transmission (τ) with ρ+α+τ=1. The ideal perfect absorber (α=1 at all wavelengths) is a blackbody — Vantablack (>99.999% visible absorption) is a real-world approximation."}
        </Note>
        <SpectrumBar isKo={isKo} />
      </Card>

      <Card>
        <H2>{isKo ? "방사율과 Kirchhoff 법칙" : "Emissivity & Kirchhoff's law"}</H2>
        <Eq>ε = E / E_b   (0 ≤ ε ≤ 1),    ε_λ = E_λ / E_{"{b,λ}"}</Eq>
        <Note>
          {isKo
            ? "방사율 ε은 같은 온도의 흑체 대비 실제 표면의 방출능입니다. 열평형에서 Kirchhoff 법칙: ε_λ = α_λ — 잘 흡수하는 표면은 그 파장에서 잘 방출합니다."
            : "Emissivity ε compares a real surface to a blackbody at the same T. In thermal equilibrium Kirchhoff's law states ε_λ = α_λ — a good absorber at a wavelength is a good emitter there."}
        </Note>
      </Card>

      <SolidAngleDemo isKo={isKo} />

      <Card>
        <H2>{isKo ? "복사강도에서 방출능으로: E = πI" : "From intensity to emissive power: E = πI"}</H2>
        <Note>
          {isKo
            ? "면적요소 dA가 방향 (θ, φ)로 내보내는 에너지는 투영면적 dA·cosθ에 비례합니다 (Lambert). 반구 전체로 적분하면:"
            : "The energy leaving surface element dA toward (θ, φ) scales with the projected area dA·cosθ (Lambert). Integrating over the hemisphere:"}
        </Note>
        <Eq>I = dq / (dA cosθ · dΩ),    dΩ = sinθ dθ dφ</Eq>
        <Eq>E = ∫₀^{"{2π}"} ∫₀^{"{π/2}"} I cosθ sinθ dθ dφ = I · 2π · (1/2) = πI</Eq>
        <Note>
          {isKo
            ? "확산(diffuse) 방출이면 I가 방향과 무관하므로 총 반구 방출능은 πI — 2π(반구 입체각)가 아니라 π가 나오는 이유는 cosθ 투영 때문입니다."
            : "For diffuse emission I is direction-independent, so the hemispherical emissive power is πI — the factor is π, not 2π (the hemisphere solid angle), because of the cosθ projection."}
        </Note>
      </Card>
    </div>
  );
}

function SpectrumBar({ isKo }) {
  const bands = [
    { name: "γ", from: -12, to: -11, c: "#7c3aed" },
    { name: "X-ray", from: -11, to: -8, c: "#8b5cf6" },
    { name: "UV", from: -8, to: -6.42, c: "#a78bfa" },
    { name: isKo ? "가시광" : "Visible", from: -6.42, to: -6.15, c: "#fbbf24" },
    { name: "IR", from: -6.15, to: -3, c: "#ef4444" },
    { name: isKo ? "마이크로파" : "Microwave", from: -3, to: -1, c: "#f97316" },
    { name: isKo ? "라디오" : "Radio", from: -1, to: 2, c: "#64748b" },
  ];
  const min = -12, max = 2;
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", height: 46, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
        {bands.map((b, i) => (
          <div key={i} style={{
            width: `${100 * (b.to - b.from) / (max - min)}%`,
            background: `${b.c}33`, borderRight: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: b.c, textAlign: "center",
          }}>{b.name}</div>
        ))}
      </div>
      {/* visible-light zoom */}
      <div style={{ display: "flex", height: 16, borderRadius: 6, overflow: "hidden", marginTop: 8, maxWidth: 420 }}>
        {["#7c3aed", "#3b82f6", "#22d3ee", "#10b981", "#facc15", "#f97316", "#ef4444"].map((c, i) => (
          <div key={i} style={{ flex: 1, background: c }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", maxWidth: 420, fontSize: 10.5, color: C.textDim, fontFamily: "'JetBrains Mono',monospace", marginTop: 2 }}>
        <span>380 nm</span><span>{isKo ? "가시광 (0.38–0.76 μm)" : "visible (0.38–0.76 μm)"}</span><span>760 nm</span>
      </div>
      <Note>
        {isKo
          ? "열복사는 대부분 0.1–100 μm (UV 일부·가시광·적외선) 영역에서 일어납니다. 태양(5,800 K)의 피크는 ~0.5 μm(초록빛), 상온 물체(300 K)의 피크는 ~10 μm(원적외선)."
          : "Thermal radiation lives mostly in 0.1–100 μm (part of UV, visible, IR). The Sun (5,800 K) peaks near 0.5 μm (green); room-temperature objects (300 K) near 10 μm (far IR)."}
      </Note>
    </div>
  );
}

// interactive solid-angle hemisphere
function SolidAngleDemo({ isKo }) {
  const [thetaDeg, setThetaDeg] = useState(40);
  const th = thetaDeg * Math.PI / 180;
  const omega = 2 * Math.PI * (1 - Math.cos(th));      // cone solid angle
  const W = 460, H = 300, cx = W / 2, cy = H - 50, R = 170;
  // hemisphere outline (ellipse-ish 2D projection)
  const arc = [];
  for (let a = 0; a <= 180; a += 3) {
    const rad = a * Math.PI / 180;
    arc.push([cx - R * Math.cos(rad), cy - R * Math.sin(rad)]);
  }
  const conePts = [];
  for (let a = -thetaDeg; a <= thetaDeg; a += 2) {
    const rad = (90 - a) * Math.PI / 180;
    conePts.push([cx + R * Math.cos(rad), cy - R * Math.sin(rad)]);
  }
  return (
    <Card>
      <H2>{isKo ? "입체각 (solid angle) 인터랙티브" : "Solid angle interactive"}</H2>
      <Note>
        {isKo
          ? "입체각 Ω = A/r² [sr]. 전구는 4π sr, 반구는 2π sr. 반각 θ의 원뿔이 덮는 입체각은 Ω = 2π(1−cosθ)."
          : "Solid angle Ω = A/r² [sr]. Full sphere 4π sr, hemisphere 2π sr. A cone of half-angle θ subtends Ω = 2π(1−cosθ)."}
      </Note>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
        <svg width={W} height={H} style={{ background: "#0d1117", borderRadius: 10, border: `1px solid ${C.border}`, maxWidth: "100%", height: "auto" }} viewBox={`0 0 ${W} ${H}`}>
          {/* ground */}
          <line x1={cx - R - 20} y1={cy} x2={cx + R + 20} y2={cy} stroke="#334155" strokeWidth={2} />
          {/* hemisphere */}
          <path d={arc.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ")} fill="none" stroke={C.blueSoft} strokeWidth={1.5} strokeDasharray="5 4" />
          {/* cone fill */}
          <path d={`M ${cx} ${cy} L ${conePts.map(p => `${p[0]} ${p[1]}`).join(" L ")} Z`} fill="rgba(245,158,11,0.18)" stroke={C.accent} strokeWidth={1.5} />
          {/* emitter dA */}
          <rect x={cx - 12} y={cy - 3} width={24} height={6} rx={2} fill={C.accent} />
          <text x={cx + 18} y={cy + 16} fill={C.textDim} fontSize={11}>dA</text>
          {/* normal */}
          <line x1={cx} y1={cy} x2={cx} y2={cy - R - 14} stroke="#64748b" strokeWidth={1} strokeDasharray="3 3" />
          <text x={cx + 5} y={cy - R - 4} fill={C.textDim} fontSize={11}>n̂</text>
          {/* theta arc */}
          <path d={`M ${cx} ${cy - 46} A 46 46 0 0 1 ${cx + 46 * Math.sin(th)} ${cy - 46 * Math.cos(th)}`} fill="none" stroke={C.cyan} strokeWidth={1.5} />
          <text x={cx + 54 * Math.sin(th / 2) + 4} y={cy - 54 * Math.cos(th / 2)} fill={C.cyan} fontSize={12} fontWeight={700}>θ</text>
        </svg>
        <div style={{ minWidth: 260, flex: 1 }}>
          <Slider label={isKo ? "원뿔 반각 θ" : "cone half-angle θ"} value={thetaDeg} min={5} max={90} step={1} onChange={setThetaDeg} unit="°" width={180} />
          <Eq style={{ marginTop: 14 }}>Ω = 2π(1 − cosθ) = {omega.toFixed(3)} sr</Eq>
          <Eq>Ω / 2π = {(omega / (2 * Math.PI) * 100).toFixed(1)}% {isKo ? "of 반구" : "of hemisphere"}</Eq>
          <Note>
            {isKo
              ? "θ=90°일 때 Ω=2π(반구 전체). 하지만 방출능 E에는 cosθ 가중이 붙어 반구 적분이 π가 됩니다."
              : "At θ=90°, Ω=2π (full hemisphere). But emissive power E carries a cosθ weight, so the hemispherical integral gives π."}
          </Note>
        </div>
      </div>
    </Card>
  );
}

// =============================================================
// 3) PLANCK EXPLORER — RJ vs Wien vs Planck, Wien law, σT⁴, color
// =============================================================
const planckE = (lam, T) => PH.C1 / Math.pow(lam, 5) / Math.expm1(PH.C2 / (lam * T));
const rjE = (lam, T) => 2 * Math.PI * PH.c * PH.kB * T / Math.pow(lam, 4);
const wienE = (lam, T) => PH.C1 / Math.pow(lam, 5) * Math.exp(-PH.C2 / (lam * T));

// approximate blackbody color (Tanner Helland fit, T in K)
function bbColor(T) {
  const t = Math.min(40000, Math.max(1000, T)) / 100;
  let r, g, b;
  if (t <= 66) { r = 255; g = 99.47 * Math.log(t) - 161.12; }
  else { r = 329.7 * Math.pow(t - 60, -0.1332); g = 288.12 * Math.pow(t - 60, -0.0755); }
  if (t >= 66) b = 255;
  else if (t <= 19) b = 0;
  else b = 138.52 * Math.log(t - 10) - 305.04;
  const cl = v => Math.round(Math.min(255, Math.max(0, v)));
  return `rgb(${cl(r)},${cl(g)},${cl(b)})`;
}

function PlanckExplorer({ lang }) {
  const isKo = lang === "ko";
  const [T, setT] = useState(5800);
  const [showRJ, setShowRJ] = useState(true);
  const [showWien, setShowWien] = useState(false);
  const [logY, setLogY] = useState(false);

  const lamMaxUm = 2898 / T;                       // Wien [μm]
  const Etot = PH.sigma * Math.pow(T, 4);

  return (
    <div>
      <Card>
        <H2>{isKo ? "Planck 복사법칙 탐색기" : "Planck's law explorer"}</H2>
        <Eq>
          E_λ(T) = (2πhc²/λ⁵) · 1/(e^{"{hc/λk_BT}"} − 1)
          {"    "}vs.{"    "}E_λ^RJ = 2πck_BT/λ⁴
        </Eq>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center", margin: "12px 0" }}>
          <Slider label={isKo ? "온도 T" : "Temperature T"} value={T} min={1000} max={10000} step={50} onChange={setT} unit=" K" width={220} />
          <label style={chk()}><input type="checkbox" checked={showRJ} onChange={e => setShowRJ(e.target.checked)} /> Rayleigh-Jeans</label>
          <label style={chk()}><input type="checkbox" checked={showWien} onChange={e => setShowWien(e.target.checked)} /> Wien approx.</label>
          <label style={chk()}><input type="checkbox" checked={logY} onChange={e => setLogY(e.target.checked)} /> log y</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.textDim }}>
            {isKo ? "흑체 색" : "glow color"}
            <div style={{ width: 34, height: 22, borderRadius: 6, background: bbColor(T), border: `1px solid ${C.border}`, boxShadow: `0 0 14px ${bbColor(T)}` }} />
          </div>
        </div>
        <PlanckPlot T={T} showRJ={showRJ} showWien={showWien} logY={logY} isKo={isKo} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10, marginTop: 14 }}>
          <Stat label={isKo ? "Wien 피크 λmax = 2898/T" : "Wien peak λmax = 2898/T"} value={`${lamMaxUm.toFixed(3)} μm`} color={C.accent} />
          <Stat label={isKo ? "총 방출능 σT⁴" : "Total emissive power σT⁴"} value={`${Etot.toExponential(3)} W/m²`} color={C.ok} />
          <Stat label={isKo ? "피크 영역" : "Peak region"} value={lamMaxUm < 0.38 ? "UV" : lamMaxUm <= 0.76 ? (isKo ? "가시광 ✓" : "visible ✓") : "IR"} color={C.cyan} />
        </div>
        <Note>
          {isKo
            ? "T를 5,800 K(태양 표면)로 놓으면 피크가 ~0.5 μm — 우리가 초록-노랑 빛에 가장 민감하게 진화한 이유입니다. Rayleigh-Jeans 곡선은 λ→0에서 발산(자외선 파탄)하지만, Planck 곡선은 hν ≫ k_BT인 모드가 '얼어붙어' 유한합니다."
            : "At T = 5,800 K (solar surface) the peak sits near 0.5 μm — why our eyes evolved to be most sensitive there. The Rayleigh-Jeans curve diverges as λ→0 (UV catastrophe); Planck's curve stays finite because modes with hν ≫ k_BT are frozen out."}
        </Note>
      </Card>

      <QuantizationCard isKo={isKo} />
      <StefanBoltzmannCard isKo={isKo} T={T} />
    </div>
  );
}
const chk = () => ({ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.text, cursor: "pointer" });

function Stat({ label, value, color }) {
  return (
    <div style={{ background: C.card, borderRadius: 10, padding: "10px 14px", border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function PlanckPlot({ T, showRJ, showWien, logY, isKo }) {
  const W = 720, H = 340, pad = 52;
  const lamMinUm = 0.05, lamMaxUm = 3.0;
  const N = 320;
  const data = [];
  let yMax = 0;
  for (let i = 0; i <= N; i++) {
    const um = lamMinUm + (lamMaxUm - lamMinUm) * i / N;
    const lam = um * 1e-6;
    const p = planckE(lam, T), r = rjE(lam, T), w = wienE(lam, T);
    data.push({ um, p, r, w });
    yMax = Math.max(yMax, p);
  }
  const yTop = logY ? Math.log10(yMax * 3) : yMax * 1.12;
  const yBot = logY ? Math.log10(yMax) - 6 : 0;
  const tf = v => (logY ? Math.log10(Math.max(v, 1e-30)) : v);
  const { X, Y } = usePlotScale(lamMinUm, lamMaxUm, yBot, yTop, W, H, pad);
  const clipY = v => Math.max(pad - 6, Math.min(H - pad, v));
  const mkPath = key => data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${X(d.um).toFixed(1)} ${clipY(Y(tf(d[key]))).toFixed(1)}`)
    .join(" ");
  const peakUm = 2898 / T;
  // visible band
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ background: "#0d1117", borderRadius: 10, border: `1px solid ${C.border}`, width: "100%", maxWidth: W, height: "auto" }}>
      {/* visible band */}
      <rect x={X(0.38)} y={pad - 6} width={X(0.76) - X(0.38)} height={H - 2 * pad + 6} fill="rgba(250,204,21,0.06)" />
      <text x={(X(0.38) + X(0.76)) / 2} y={pad + 8} fill="#facc15" fontSize={10} textAnchor="middle" opacity={0.8}>{isKo ? "가시광" : "visible"}</text>
      {/* axes */}
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#334155" />
      <line x1={pad} y1={pad - 6} x2={pad} y2={H - pad} stroke="#334155" />
      {[0.5, 1, 1.5, 2, 2.5, 3].map(um => (
        <g key={um}>
          <line x1={X(um)} y1={H - pad} x2={X(um)} y2={H - pad + 4} stroke="#334155" />
          <text x={X(um)} y={H - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{um}</text>
        </g>
      ))}
      <text x={W - pad} y={H - pad + 30} fill={C.textDim} fontSize={11} textAnchor="end">λ [μm]</text>
      <text x={pad - 40} y={pad - 12} fill={C.textDim} fontSize={11}>{logY ? "log₁₀ E_λ" : "E_λ [W/m²·m]"}</text>
      {/* curves */}
      {showRJ && <path d={mkPath("r")} fill="none" stroke={C.err} strokeWidth={2} strokeDasharray="6 4" />}
      {showWien && <path d={mkPath("w")} fill="none" stroke={C.purple} strokeWidth={2} strokeDasharray="2 4" />}
      <path d={mkPath("p")} fill="none" stroke={C.accent} strokeWidth={2.6} />
      {/* Wien peak marker */}
      {peakUm > lamMinUm && peakUm < lamMaxUm && (
        <g>
          <line x1={X(peakUm)} y1={clipY(Y(tf(planckE(peakUm * 1e-6, T))))} x2={X(peakUm)} y2={H - pad} stroke={C.cyan} strokeWidth={1.2} strokeDasharray="3 3" />
          <circle cx={X(peakUm)} cy={clipY(Y(tf(planckE(peakUm * 1e-6, T))))} r={4.5} fill={C.cyan} />
          <text x={X(peakUm) + 6} y={clipY(Y(tf(planckE(peakUm * 1e-6, T)))) - 8} fill={C.cyan} fontSize={11} fontWeight={700}>λmax = {peakUm.toFixed(2)} μm</text>
        </g>
      )}
      {/* legend */}
      <g transform={`translate(${W - 230}, ${pad + 4})`}>
        <rect x={0} y={0} width={220} height={showRJ && showWien ? 66 : showRJ || showWien ? 50 : 32} rx={6} fill="#0a0e15" stroke={C.border} />
        <line x1={10} y1={16} x2={32} y2={16} stroke={C.accent} strokeWidth={2.6} />
        <text x={38} y={20} fill={C.text} fontSize={11}>Planck ({T} K)</text>
        {showRJ && <>
          <line x1={10} y1={34} x2={32} y2={34} stroke={C.err} strokeWidth={2} strokeDasharray="6 4" />
          <text x={38} y={38} fill={C.text} fontSize={11}>Rayleigh-Jeans → {isKo ? "발산!" : "diverges!"}</text>
        </>}
        {showWien && <>
          <line x1={10} y1={showRJ ? 52 : 34} x2={32} y2={showRJ ? 52 : 34} stroke={C.purple} strokeWidth={2} strokeDasharray="2 4" />
          <text x={38} y={showRJ ? 56 : 38} fill={C.text} fontSize={11}>Wien approx.</text>
        </>}
      </g>
    </svg>
  );
}

// -- quantized vs continuous ⟨E⟩ ------------------------------
function QuantizationCard({ isKo }) {
  const [x, setX] = useState(1.0);   // x = hν / k_B T
  const meanQ = x / Math.expm1(x);   // ⟨E⟩/k_BT quantized
  const W = 620, H = 240, pad = 46;
  const N = 200;
  const pts = [];
  for (let i = 1; i <= N; i++) {
    const xx = 6 * i / N;
    pts.push([xx, xx / Math.expm1(xx)]);
  }
  const { X, Y } = usePlotScale(0, 6, 0, 1.1, W, H, pad);
  return (
    <Card>
      <H2>{isKo ? "Planck의 아이디어: 에너지 양자화" : "Planck's idea: energy quantization"}</H2>
      <Note>
        {isKo
          ? "고전 등분배는 모든 진동 모드에 ⟨E⟩ = k_BT를 배정합니다 (모드 수는 ν²로 증가 → 파탄). Planck는 모드의 에너지를 E = nhν (n = 0,1,2,…)로 제한하고 볼츠만 통계로 평균을 취했습니다:"
          : "Classical equipartition gives every mode ⟨E⟩ = k_BT (mode count grows as ν² → catastrophe). Planck restricted mode energies to E = nhν (n = 0,1,2,…) and averaged with Boltzmann statistics:"}
      </Note>
      <Eq>⟨E⟩ = Σ nhν e^{"{−nhν/k_BT}"} / Σ e^{"{−nhν/k_BT}"} = hν / (e^{"{hν/k_BT}"} − 1)</Eq>
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "flex-start" }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ background: "#0d1117", borderRadius: 10, border: `1px solid ${C.border}`, maxWidth: "100%", height: "auto", flex: "1 1 380px" }}>
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#334155" />
          <line x1={pad} y1={pad - 8} x2={pad} y2={H - pad} stroke="#334155" />
          {/* classical line ⟨E⟩=kT */}
          <line x1={pad} y1={Y(1)} x2={W - pad} y2={Y(1)} stroke={C.err} strokeWidth={1.8} strokeDasharray="6 4" />
          <text x={W - pad - 4} y={Y(1) - 6} fill={C.err} fontSize={11} textAnchor="end">{isKo ? "고전: ⟨E⟩ = k_BT" : "classical: ⟨E⟩ = k_BT"}</text>
          {/* quantized curve */}
          <path d={pathOf(pts, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.6} />
          <circle cx={X(x)} cy={Y(meanQ)} r={5} fill={C.cyan} />
          <text x={X(x) + 8} y={Y(meanQ) - 8} fill={C.cyan} fontSize={11.5} fontWeight={700}>⟨E⟩/k_BT = {meanQ.toFixed(3)}</text>
          {[0, 1, 2, 3, 4, 5, 6].map(v => (
            <text key={v} x={X(v)} y={H - pad + 15} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>
          ))}
          <text x={W - pad} y={H - pad + 30} fill={C.textDim} fontSize={11} textAnchor="end">x = hν / k_BT</text>
        </svg>
        <div style={{ flex: "1 1 220px", minWidth: 220 }}>
          <Slider label="x = hν/k_BT" value={x} min={0.05} max={6} step={0.05} onChange={setX} width={170} />
          <Note>
            {isKo
              ? x < 0.5
                ? "저주파(hν ≪ k_BT): 준위 간격이 촘촘해 사실상 연속 — 고전값 k_BT를 회복합니다 (대응원리)."
                : x > 3
                  ? "고주파(hν ≫ k_BT): 첫 들뜸조차 어려워 모드가 '얼어붙음' — ⟨E⟩ → 0. 자외선 파탄이 사라지는 이유!"
                  : "중간 영역: 양자화 효과가 ⟨E⟩를 고전값 아래로 끌어내립니다."
              : x < 0.5
                ? "Low frequency (hν ≪ k_BT): levels are dense, effectively continuous — the classical k_BT is recovered (correspondence principle)."
                : x > 3
                  ? "High frequency (hν ≫ k_BT): even the first excitation is unlikely — the mode freezes out, ⟨E⟩ → 0. This kills the UV catastrophe!"
                  : "Intermediate: quantization pulls ⟨E⟩ below the classical value."}
          </Note>
        </div>
      </div>
    </Card>
  );
}

// -- Stefan-Boltzmann numeric integral -----------------------
function StefanBoltzmannCard({ isKo, T }) {
  const integ = useMemo(() => {
    // trapezoid on log-λ grid, 0.01–1000 μm
    const N = 4000;
    let S = 0, lp = 1e-8, Ep = planckE(lp, T);
    for (let i = 1; i <= N; i++) {
      const lam = Math.pow(10, -8 + 5 * i / N);
      const E = planckE(lam, T);
      S += 0.5 * (E + Ep) * (lam - lp);
      lp = lam; Ep = E;
    }
    return S;
  }, [T]);
  const sig = PH.sigma * Math.pow(T, 4);
  return (
    <Card>
      <H2>{isKo ? "Stefan-Boltzmann 법칙: 곡선 아래 면적" : "Stefan-Boltzmann law: area under the curve"}</H2>
      <Eq>∫₀^∞ E_λ dλ = (2π⁵k_B⁴ / 15h³c²) · T⁴ = σT⁴,   σ = 5.670×10⁻⁸ W/m²K⁴</Eq>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
        <Stat label={isKo ? `수치 적분 (T = ${T} K)` : `Numerical integral (T = ${T} K)`} value={`${integ.toExponential(4)} W/m²`} color={C.accent} />
        <Stat label="σT⁴" value={`${sig.toExponential(4)} W/m²`} color={C.ok} />
        <Stat label={isKo ? "비율" : "Ratio"} value={(integ / sig).toFixed(5)} color={C.cyan} />
      </div>
      <Note>
        {isKo
          ? "온도를 두 배로 올리면 복사 에너지는 16배! Boltzmann은 1884년, 복사압 p = u/3와 열역학(dU = TdS − pdV)만으로 u = aT⁴를 유도했습니다 — Planck 모델이 나오기 16년 전입니다."
          : "Double the temperature → 16× the radiated energy! In 1884 Boltzmann derived u = aT⁴ using only radiation pressure p = u/3 and thermodynamics (dU = TdS − pdV) — 16 years before Planck's model."}
      </Note>
    </Card>
  );
}

// =============================================================
// 4) CLASSICAL MECHANICS — least action + phase space
// =============================================================
function ClassicalMech({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <Card>
        <H2>{isKo ? "세 가지 언어, 하나의 역학" : "Three languages, one mechanics"}</H2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
          {[
            {
              n: "Newton", eq: "F = ma = −∇U", c: C.text,
              ko: "힘 중심. 직관적이지만 구속조건·좌표 선택에 취약.",
              en: "Force-based. Intuitive but awkward with constraints & coordinates.",
            },
            {
              n: "Lagrange", eq: "L = T − U,  d/dt(∂L/∂q̇) = ∂L/∂q", c: C.blueSoft,
              ko: "에너지 중심 + 최소작용 원리 δS = 0. 일반화 좌표 q 자유롭게 선택.",
              en: "Energy-based + least action δS = 0. Free choice of generalized coordinates q.",
            },
            {
              n: "Hamilton", eq: "H = pq̇ − L,  q̇ = ∂H/∂p, ṗ = −∂H/∂q", c: C.purple,
              ko: "Legendre 변환으로 (q, q̇) → (q, p). 위상공간의 1차 방정식 — 양자역학의 관문.",
              en: "Legendre transform (q, q̇) → (q, p). First-order flow in phase space — the gateway to QM.",
            },
          ].map((m, i) => (
            <div key={i} style={{ background: C.card, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
              <div style={{ fontWeight: 800, color: m.c, marginBottom: 6 }}>{m.n}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: C.accentSoft, marginBottom: 8 }}>{m.eq}</div>
              <div style={{ fontSize: 12.5, color: C.textDim, lineHeight: 1.6 }}>{isKo ? m.ko : m.en}</div>
            </div>
          ))}
        </div>
        <Note>
          {isKo
            ? "p = ∂L/∂q̇ 와 q는 공액변수(conjugate variables) — 양자역학에서 [q̂, p̂] = iℏ 교환자로 승격되는 쌍입니다. Hamilton-Jacobi 방정식 H(q, ∂S/∂q) + ∂S/∂t = 0은 Schrödinger가 ψ = e^{iS/ℏ} 형태로 파동방정식을 찾는 다리가 됩니다."
            : "p = ∂L/∂q̇ and q are conjugate variables — the pair promoted to the commutator [q̂, p̂] = iℏ in QM. The Hamilton-Jacobi equation H(q, ∂S/∂q) + ∂S/∂t = 0 is the bridge Schrödinger crossed via ψ = e^{iS/ℏ}."}
        </Note>
      </Card>

      <LeastAction isKo={isKo} />
      <PhaseSpace isKo={isKo} />
    </div>
  );
}

// -- interactive least action --------------------------------
function LeastAction({ isKo }) {
  const [eps, setEps] = useState(0.5);
  const [mode, setMode] = useState(1);
  const m = 1, w = 1, Tf = 2, qT = 1;
  const A = qT / Math.sin(w * Tf);
  const Nt = 400;

  const calc = useCallback((e, n) => {
    const q = [], t = [];
    for (let i = 0; i <= Nt; i++) {
      const tt = Tf * i / Nt;
      t.push(tt);
      q.push(A * Math.sin(w * tt) + e * Math.sin(n * Math.PI * tt / Tf));
    }
    const dt = Tf / Nt;
    let S = 0;
    for (let i = 0; i < Nt; i++) {
      const qd = (q[i + 1] - q[i]) / dt;
      const qm = 0.5 * (q[i + 1] + q[i]);
      S += (0.5 * m * qd * qd - 0.5 * m * w * w * qm * qm) * dt;
    }
    return { t, q, S };
  }, [A]);

  const cur = calc(eps, mode);
  const cl = calc(0, mode);
  const sCurve = useMemo(() => {
    const out = [];
    for (let i = 0; i <= 60; i++) {
      const e = -1 + 2 * i / 60;
      out.push([e, calc(e, mode).S]);
    }
    return out;
  }, [mode, calc]);

  // left plot: paths
  const W1 = 430, H1 = 280, pad = 42;
  const qAll = [...cur.q, ...cl.q];
  const qMin = Math.min(...qAll, 0) - 0.15, qMax = Math.max(...qAll, qT) + 0.15;
  const P1 = usePlotScale(0, Tf, qMin, qMax, W1, H1, pad);
  // right plot: S(eps)
  const W2 = 430, H2 = 280;
  const sVals = sCurve.map(p => p[1]);
  const sMin = Math.min(...sVals), sMax = Math.max(...sVals);
  const P2 = usePlotScale(-1, 1, sMin - 0.05 * (sMax - sMin || 1), sMax + 0.05 * (sMax - sMin || 1), W2, H2, pad);

  return (
    <Card>
      <H2>{isKo ? "최소작용 원리 실험실" : "Least-action laboratory"}</H2>
      <Note>
        {isKo
          ? "SHO의 두 점 (0,0) → (T,q_T)을 잇는 경로를 q(t) = q_cl(t) + ε·sin(nπt/T)로 교란합니다 (끝점 고정). 작용 S = ∫(½mq̇² − ½mω²q²)dt 를 계산해 보세요 — 어떤 모드로 흔들어도 ε = 0 (고전 경로)에서 S가 최소가 됩니다. 이것이 δS = 0, 곧 Euler-Lagrange 방정식입니다."
            : "Perturb the SHO path between (0,0) and (T,q_T) as q(t) = q_cl(t) + ε·sin(nπt/T) (endpoints fixed). Compute the action S = ∫(½mq̇² − ½mω²q²)dt — whatever the mode, S is minimized at ε = 0 (the classical path). That is δS = 0, i.e. the Euler-Lagrange equation."}
      </Note>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <Slider label={isKo ? "교란 크기 ε" : "perturbation ε"} value={eps} min={-1} max={1} step={0.02} onChange={setEps} width={190} />
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3].map(n => (
            <button key={n} onClick={() => setMode(n)} style={btnStyle(mode === n)}>n = {n}</button>
          ))}
        </div>
        <button onClick={() => setEps(0)} style={btnStyle()}>{isKo ? "↺ 고전 경로로" : "↺ classical path"}</button>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {/* paths */}
        <svg width={W1} height={H1} viewBox={`0 0 ${W1} ${H1}`} style={svgBox(W1)}>
          <line x1={pad} y1={H1 - pad} x2={W1 - pad} y2={H1 - pad} stroke="#334155" />
          <line x1={pad} y1={pad - 6} x2={pad} y2={H1 - pad} stroke="#334155" />
          <text x={W1 - pad} y={H1 - pad + 26} fill={C.textDim} fontSize={11} textAnchor="end">t</text>
          <text x={pad - 30} y={pad - 10} fill={C.textDim} fontSize={11}>q(t)</text>
          {/* ghost family */}
          {[-0.8, -0.4, 0.4, 0.8].map((e, i) => (
            <path key={i} d={pathOf(calc(e, mode).t.map((tt, j) => [tt, calc(e, mode).q[j]]), P1.X, P1.Y)} fill="none" stroke="#3a4657" strokeWidth={1} />
          ))}
          {/* classical */}
          <path d={pathOf(cl.t.map((tt, j) => [tt, cl.q[j]]), P1.X, P1.Y)} fill="none" stroke={C.err} strokeWidth={2} strokeDasharray="5 4" />
          {/* current */}
          <path d={pathOf(cur.t.map((tt, j) => [tt, cur.q[j]]), P1.X, P1.Y)} fill="none" stroke={C.accent} strokeWidth={2.6} />
          <circle cx={P1.X(0)} cy={P1.Y(0)} r={4.5} fill="#e5e7eb" />
          <circle cx={P1.X(Tf)} cy={P1.Y(qT)} r={4.5} fill="#e5e7eb" />
          <g transform={`translate(${pad + 8}, ${pad})`}>
            <rect x={0} y={0} width={172} height={40} rx={6} fill="#0a0e15" stroke={C.border} />
            <line x1={8} y1={13} x2={26} y2={13} stroke={C.accent} strokeWidth={2.6} />
            <text x={32} y={17} fill={C.text} fontSize={10.5}>{isKo ? "현재 경로" : "current path"}</text>
            <line x1={8} y1={29} x2={26} y2={29} stroke={C.err} strokeWidth={2} strokeDasharray="5 4" />
            <text x={32} y={33} fill={C.text} fontSize={10.5}>{isKo ? "고전 경로 (E-L 해)" : "classical (E-L soln)"}</text>
          </g>
        </svg>
        {/* S(eps) */}
        <svg width={W2} height={H2} viewBox={`0 0 ${W2} ${H2}`} style={svgBox(W2)}>
          <line x1={pad} y1={H2 - pad} x2={W2 - pad} y2={H2 - pad} stroke="#334155" />
          <line x1={pad} y1={pad - 6} x2={pad} y2={H2 - pad} stroke="#334155" />
          <text x={W2 - pad} y={H2 - pad + 26} fill={C.textDim} fontSize={11} textAnchor="end">ε</text>
          <text x={pad - 30} y={pad - 10} fill={C.textDim} fontSize={11}>S[q]</text>
          {[-1, -0.5, 0, 0.5, 1].map(e => (
            <text key={e} x={P2.X(e)} y={H2 - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{e}</text>
          ))}
          <path d={pathOf(sCurve, P2.X, P2.Y)} fill="none" stroke={C.blueSoft} strokeWidth={2.4} />
          <line x1={P2.X(0)} y1={pad - 6} x2={P2.X(0)} y2={H2 - pad} stroke="#475569" strokeWidth={1} strokeDasharray="3 3" />
          <circle cx={P2.X(0)} cy={P2.Y(cl.S)} r={5} fill={C.err} />
          <circle cx={P2.X(eps)} cy={P2.Y(cur.S)} r={5.5} fill={C.accent} stroke="#0d1117" strokeWidth={1.5} />
          <text x={P2.X(eps)} y={P2.Y(cur.S) - 12} fill={C.accent} fontSize={11.5} fontWeight={700} textAnchor="middle">
            S = {cur.S.toFixed(4)}
          </text>
          <text x={P2.X(0) + 6} y={P2.Y(cl.S) + 16} fill={C.err} fontSize={10.5}>S_cl = {cl.S.toFixed(4)}</text>
        </svg>
      </div>
      <Note>
        {isKo
          ? `ΔS = S − S_cl = ${(cur.S - cl.S).toFixed(5)} ≥ 0. (ωT = ${(w * Tf).toFixed(1)} < π 이므로 진짜 최소입니다. ωT > π면 안장점이 될 수 있습니다 — '최소'가 아닌 '정류' 작용 원리라 부르는 이유.)`
          : `ΔS = S − S_cl = ${(cur.S - cl.S).toFixed(5)} ≥ 0. (Since ωT = ${(w * Tf).toFixed(1)} < π this is a true minimum; for ωT > π it can be a saddle — why it's really the "stationary" action principle.)`}
      </Note>
    </Card>
  );
}
const svgBox = W => ({ background: "#0d1117", borderRadius: 10, border: `1px solid ${C.border}`, flex: `1 1 ${Math.min(W, 380)}px`, maxWidth: "100%", height: "auto" });

// -- phase space (Hamiltonian flow) ---------------------------
function PhaseSpace({ isKo }) {
  const [running, setRunning] = useState(true);
  const [E0, setE0] = useState(0.5);
  const canvasRef = useRef(null);
  const stRef = useRef({ th: 0 });

  useEffect(() => {
    let raf;
    const draw = () => {
      const cv = canvasRef.current;
      if (!cv) return;
      const ctx = cv.getContext("2d");
      const W = cv.width, H = cv.height, cx = W / 2, cy = H / 2;
      const scale = Math.min(W, H) / 2 - 30;
      ctx.fillStyle = "#0d1117";
      ctx.fillRect(0, 0, W, H);
      // axes
      ctx.strokeStyle = "#334155"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(W - 12, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, 12); ctx.lineTo(cx, H - 12); ctx.stroke();
      ctx.fillStyle = "#9ca3af"; ctx.font = "12px JetBrains Mono, monospace";
      ctx.fillText("q", W - 22, cy - 8);
      ctx.fillText("p", cx + 8, 22);
      // energy contours H = p²/2m + mω²q²/2 (m=ω=1): circles r=√(2E)
      [0.125, 0.5, 1.125, 2].forEach(E => {
        const r = Math.sqrt(2 * E) * scale / 2;
        ctx.strokeStyle = "rgba(96,165,250,0.35)";
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.stroke();
      });
      // active orbit
      const r0 = Math.sqrt(2 * E0) * scale / 2;
      ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, r0, 0, 2 * Math.PI); ctx.stroke();
      // moving point (clockwise: q̇=p, ṗ=−q)
      const th = stRef.current.th;
      const q = Math.sqrt(2 * E0) * Math.cos(th), p = -Math.sqrt(2 * E0) * Math.sin(th);
      const px = cx + q * scale / 2, py = cy - p * scale / 2;
      ctx.fillStyle = "#22d3ee";
      ctx.beginPath(); ctx.arc(px, py, 7, 0, 2 * Math.PI); ctx.fill();
      // velocity vector (Hamiltonian flow)
      ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(px, py);
      ctx.lineTo(px + p * 26, py + q * 26); ctx.stroke();
      if (running) stRef.current.th += 0.028;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [running, E0]);

  return (
    <Card>
      <H2>{isKo ? "위상공간과 Hamiltonian 흐름 (SHO)" : "Phase space & Hamiltonian flow (SHO)"}</H2>
      <Eq>H(q, p) = p²/2m + ½mω²q²  →  q̇ = ∂H/∂p = p,   ṗ = −∂H/∂q = −q   (m = ω = 1)</Eq>
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "flex-start" }}>
        <canvas ref={canvasRef} width={380} height={380}
          style={{ borderRadius: 10, border: `1px solid ${C.border}`, maxWidth: "100%" }} />
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <button onClick={() => setRunning(r => !r)} style={btnStyle(running)}>{running ? "■" : "▶"}</button>
            <Slider label="E" value={E0} min={0.1} max={2} step={0.05} onChange={setE0} width={150} />
          </div>
          <Note>
            {isKo
              ? "에너지 보존 dH/dt = 0이므로 궤적은 H = const 등고선(타원, m=ω=1이면 원) 위에 갇힙니다. 파란 원들은 서로 다른 에너지의 등고선 — Liouville 정리에 따라 위상공간 부피는 흐름을 따라 보존됩니다."
              : "Energy conservation dH/dt = 0 traps the trajectory on an H = const contour (an ellipse; a circle for m=ω=1). Blue circles are contours of other energies — by Liouville's theorem, phase-space volume is preserved along the flow."}
          </Note>
          <Note>
            {isKo
              ? "고전 상태 = 위상공간의 한 점 (q, p). 양자역학에서는 불확정성 ΔqΔp ≥ ℏ/2 때문에 한 점이 아닌 최소 면적 ~h의 '셀'이 됩니다 — 다음 주들의 예고편입니다."
              : "A classical state is a point (q, p) in phase space. In QM, uncertainty ΔqΔp ≥ ℏ/2 replaces the point with a minimal cell of area ~h — a preview of the weeks ahead."}
          </Note>
        </div>
      </div>
    </Card>
  );
}

// =============================================================
// 5) WAVE & HELMHOLTZ — 1D wave anim, 2D modes, mode counting
// =============================================================
function WaveHelmholtz({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <Card>
        <H2>{isKo ? "Maxwell에서 파동방정식으로" : "From Maxwell to the wave equation"}</H2>
        <Note>
          {isKo
            ? "전하·전류가 없는 자유공간에서 Maxwell 방정식에 회전(∇×)을 한 번 더 걸면 전기장 E가 만족하는 파동방정식이 나옵니다. 속도는 c = 1/√(μ₀ε₀) — 빛이 전자기파라는 결정적 증거였습니다."
            : "In free space (no charge, no current) taking another curl of Maxwell's equations yields the wave equation for E, with speed c = 1/√(μ₀ε₀) — the decisive evidence that light is an EM wave."}
        </Note>
        <Eq>∇²E − (1/c²) ∂²E/∂t² = 0,    E(x,t) = E₀ exp[i(kx − ωt)],   ω = ck</Eq>
        <Note>
          {isKo
            ? "여기에 Einstein의 ε = hν = ℏω 와 Compton의 p = h/λ = ℏk 를 얹으면, 평면파의 위상 (kx − ωt)는 (px − εt)/ℏ 가 됩니다 — 파동과 입자를 잇는 사전(translation dictionary)입니다."
            : "Add Einstein's ε = hν = ℏω and Compton's p = h/λ = ℏk, and the plane-wave phase (kx − ωt) becomes (px − εt)/ℏ — the dictionary between waves and particles."}
        </Note>
        <WaveAnim isKo={isKo} />
      </Card>

      <HelmholtzModes isKo={isKo} />
      <ModeCounting isKo={isKo} />
    </div>
  );
}

// -- 1D standing wave animation ------------------------------
function WaveAnim({ isKo }) {
  const [n, setN] = useState(2);
  const [running, setRunning] = useState(true);
  const canvasRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    let raf;
    const draw = () => {
      const cv = canvasRef.current;
      if (!cv) return;
      const ctx = cv.getContext("2d");
      const W = cv.width, H = cv.height, mid = H / 2, m = 34;
      ctx.fillStyle = "#0d1117"; ctx.fillRect(0, 0, W, H);
      // walls
      ctx.strokeStyle = "#64748b"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(m, 14); ctx.lineTo(m, H - 14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W - m, 14); ctx.lineTo(W - m, H - 14); ctx.stroke();
      ctx.strokeStyle = "#273244"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(m, mid); ctx.lineTo(W - m, mid); ctx.stroke();
      const t = tRef.current;
      // two counter-propagating waves (thin) + standing wave (thick)
      const L = W - 2 * m, k = n * Math.PI / L, om = 2.2 * k * 60;
      const drawWave = (fn, color, lw) => {
        ctx.strokeStyle = color; ctx.lineWidth = lw;
        ctx.beginPath();
        for (let i = 0; i <= L; i += 2) {
          const y = mid - fn(i);
          if (i === 0) ctx.moveTo(m + i, y); else ctx.lineTo(m + i, y);
        }
        ctx.stroke();
      };
      const A = H * 0.3;
      drawWave(x => 0.5 * A * Math.sin(k * x - om * t * 0.002), "rgba(96,165,250,0.4)", 1.2);
      drawWave(x => 0.5 * A * Math.sin(k * x + om * t * 0.002), "rgba(244,114,182,0.4)", 1.2);
      drawWave(x => A * Math.sin(k * x) * Math.cos(om * t * 0.002), "#f59e0b", 2.6);
      // nodes
      ctx.fillStyle = "#22d3ee";
      for (let j = 0; j <= n; j++) {
        const x = m + j * L / n;
        ctx.beginPath(); ctx.arc(x, mid, 4, 0, 2 * Math.PI); ctx.fill();
      }
      if (running) tRef.current += 16;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [n, running]);

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
        <button onClick={() => setRunning(r => !r)} style={btnStyle(running)}>{running ? "■" : "▶"}</button>
        <Slider label={isKo ? "모드 n (마디 n−1개)" : "mode n (n−1 nodes)"} value={n} min={1} max={6} step={1} onChange={setN} width={160} />
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5, color: C.cyan }}>
          sin(kL) = 0 → k = nπ/L → ν_n = nc/2L
        </span>
      </div>
      <canvas ref={canvasRef} width={760} height={190}
        style={{ width: "100%", maxWidth: 760, borderRadius: 10, border: `1px solid ${C.border}` }} />
      <Note>
        {isKo
          ? "고정된 양 끝(Dirichlet 경계조건)이 허용 파수를 k = nπ/L로 제한합니다 — 연속이던 ν가 이산화되는 것. 흑체 공동 속 전자기파도, 기타 줄도, 훗날의 ψ도 똑같은 이유로 양자화됩니다. 파란/분홍 얇은 선은 좌우로 진행하는 두 파동이고, 노란 정상파는 그 합입니다."
          : "Fixed ends (Dirichlet BCs) restrict the allowed wavenumbers to k = nπ/L — a continuous ν becomes discrete. EM waves in a blackbody cavity, a guitar string, and later ψ itself are all quantized for exactly this reason. The thin blue/pink lines are counter-propagating waves; the yellow standing wave is their sum."}
      </Note>
    </div>
  );
}

// -- 2D Helmholtz membrane modes (matches lecture slides) ----
function HelmholtzModes({ isKo }) {
  const [nx, setNx] = useState(2);
  const [ny, setNy] = useState(1);
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const S = cv.width;
    const img = ctx.createImageData(S, S);
    for (let j = 0; j < S; j++) {
      for (let i = 0; i < S; i++) {
        const x = i / (S - 1), y = 1 - j / (S - 1);
        const v = Math.sin(nx * Math.PI * x) * Math.sin(ny * Math.PI * y); // [-1,1]
        // RdBu-like: v=+1 red, v=0 white, v=-1 blue
        let r, g, b;
        if (v >= 0) { r = 255; g = Math.round(255 * (1 - v * 0.85)); b = Math.round(255 * (1 - v)); }
        else { r = Math.round(255 * (1 + v)); g = Math.round(255 * (1 + v * 0.85)); b = 255; }
        const idx = 4 * (j * S + i);
        img.data[idx] = r; img.data[idx + 1] = g; img.data[idx + 2] = b; img.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [nx, ny]);

  const om = Math.PI * Math.sqrt(nx * nx + ny * ny); // c = L = 1
  return (
    <Card>
      <H2>{isKo ? "Helmholtz 방정식: 2D 막의 고유모드" : "Helmholtz equation: eigenmodes of a 2D membrane"}</H2>
      <Eq>(∇² + k²) f = 0,   f(x,y) = sin(nₓπx/L)·sin(n_yπy/L),   ω = cπ√(nₓ² + n_y²)/L</Eq>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <canvas ref={canvasRef} width={280} height={280}
            style={{ borderRadius: 10, border: `1px solid ${C.border}`, imageRendering: "auto", maxWidth: "100%" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textDim, fontFamily: "'JetBrains Mono',monospace", width: 280, maxWidth: "100%", marginTop: 4 }}>
            <span style={{ color: "#60a5fa" }}>{isKo ? "− 위상" : "− phase"}</span>
            <span>0</span>
            <span style={{ color: "#ef4444" }}>{isKo ? "+ 위상" : "+ phase"}</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 250 }}>
          <Slider label="nₓ" value={nx} min={1} max={6} step={1} onChange={setNx} width={170} />
          <div style={{ height: 8 }} />
          <Slider label="n_y" value={ny} min={1} max={6} step={1} onChange={setNy} width={170} />
          <Eq style={{ marginTop: 14 }}>ω′ = ω/(cπ/L) = √(nₓ²+n_y²) = {Math.sqrt(nx * nx + ny * ny).toFixed(3)}</Eq>
          <Note>
            {isKo
              ? "Helmholtz 공명기(빈 병에 바람 불기!)의 공명 주파수가 이산적인 것과 같은 수학입니다. 시간의존 파동방정식에서 f(x,y,t) = f(x,y)·T(t)로 변수분리하면 공간부는 Helmholtz 방정식이 되고, Dirichlet 경계조건이 (nₓ, n_y) 정수쌍만 허용합니다. Schrödinger 방정식의 시간독립형이 정확히 이 구조입니다: (∇² + 2m(E−V)/ℏ²)ψ = 0."
              : "The same math behind a Helmholtz resonator (blowing over a bottle!). Separating f(x,y,t) = f(x,y)·T(t) in the wave equation gives the Helmholtz equation for the spatial part; Dirichlet BCs admit only integer pairs (nₓ, n_y). The time-independent Schrödinger equation has exactly this structure: (∇² + 2m(E−V)/ℏ²)ψ = 0."}
          </Note>
        </div>
      </div>
    </Card>
  );
}

// -- 3D cavity mode counting N(w') ---------------------------
function ModeCounting({ isKo }) {
  const [wmax, setWmax] = useState(8);
  const data = useMemo(() => {
    const freqs = [];
    const nlim = Math.ceil(wmax) + 1;
    for (let a = 1; a <= nlim; a++)
      for (let b = 1; b <= nlim; b++)
        for (let cc = 1; cc <= nlim; cc++) {
          const wp = Math.sqrt(a * a + b * b + cc * cc);
          if (wp <= wmax) freqs.push(wp);
        }
    freqs.sort((x, y) => x - y);
    return freqs;
  }, [wmax]);

  const W = 640, H = 300, pad = 50;
  const Nmax = Math.max(data.length, Math.PI / 6 * Math.pow(wmax, 3)) * 1.08;
  const { X, Y } = usePlotScale(0, wmax, 0, Nmax, W, H, pad);
  // staircase path
  let stair = `M ${X(0)} ${Y(0)}`;
  data.forEach((f, i) => { stair += ` L ${X(f).toFixed(1)} ${Y(i).toFixed(1)} L ${X(f).toFixed(1)} ${Y(i + 1).toFixed(1)}`; });
  const smooth = [];
  for (let i = 0; i <= 100; i++) {
    const w = wmax * i / 100;
    smooth.push([w, Math.PI / 6 * w * w * w]);
  }
  return (
    <Card>
      <H2>{isKo ? "공동 모드 세기 → 상태밀도 g(ν)" : "Cavity mode counting → density of states g(ν)"}</H2>
      <Note>
        {isKo
          ? "한 변 L인 3D 공동의 정상파는 정수 3중항 (nₓ, n_y, n_z)로 지정되고 ω′ = √(nₓ²+n_y²+n_z²). ω′ 이하의 모드 수는 반지름 ω′인 구의 1/8(제1팔분공간) 부피 ≈ (π/6)ω′³. 미분하면 dN/dω′ ∝ ω′² — 편광 2를 곱해 g(ν) = 8πVν²/c³. 이 ν² 인자가 등분배 k_BT와 만나 자외선 파탄을 낳았고, Planck의 ⟨E⟩와 만나 Planck 법칙이 됩니다."
          : "Standing waves in a 3D cavity of side L are labeled by integer triplets (nₓ, n_y, n_z) with ω′ = √(nₓ²+n_y²+n_z²). The number of modes below ω′ is one octant of a sphere ≈ (π/6)ω′³. Differentiate: dN/dω′ ∝ ω′² — times 2 polarizations, g(ν) = 8πVν²/c³. This ν² factor times equipartition k_BT gives the UV catastrophe; times Planck's ⟨E⟩ it gives Planck's law."}
      </Note>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
        <Slider label="ω′ max" value={wmax} min={3} max={14} step={0.5} onChange={setWmax} width={190} />
        <Pill color={C.cyan}>{isKo ? `모드 수 N = ${data.length}` : `N = ${data.length} modes`}</Pill>
        <Pill color={C.err}>(π/6)ω′³ = {(Math.PI / 6 * Math.pow(wmax, 3)).toFixed(1)}</Pill>
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ background: "#0d1117", borderRadius: 10, border: `1px solid ${C.border}`, width: "100%", maxWidth: W, height: "auto" }}>
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#334155" />
        <line x1={pad} y1={pad - 6} x2={pad} y2={H - pad} stroke="#334155" />
        <text x={W - pad} y={H - pad + 28} fill={C.textDim} fontSize={11} textAnchor="end">ω′</text>
        <text x={pad - 36} y={pad - 10} fill={C.textDim} fontSize={11}>N(ω′)</text>
        <path d={stair} fill="none" stroke={C.accent} strokeWidth={1.8} />
        <path d={pathOf(smooth, X, Y)} fill="none" stroke={C.err} strokeWidth={2} strokeDasharray="6 4" />
        <g transform={`translate(${pad + 10}, ${pad})`}>
          <rect x={0} y={0} width={210} height={44} rx={6} fill="#0a0e15" stroke={C.border} />
          <line x1={8} y1={14} x2={28} y2={14} stroke={C.accent} strokeWidth={2} />
          <text x={34} y={18} fill={C.text} fontSize={10.5}>{isKo ? "정확한 계단 N(ω′)" : "exact staircase N(ω′)"}</text>
          <line x1={8} y1={32} x2={28} y2={32} stroke={C.err} strokeWidth={2} strokeDasharray="6 4" />
          <text x={34} y={36} fill={C.text} fontSize={10.5}>(π/6)ω′³</text>
        </g>
      </svg>
    </Card>
  );
}

// =============================================================
// 6) SCHRÖDINGER — 1D FDM eigenvalue solver (live, in-browser)
// =============================================================
// symmetric tridiagonal eigensolver (QL with implicit shifts, EISPACK tql2)
function tql2(dIn, eIn, wantVecs = true) {
  const n = dIn.length;
  const d = dIn.slice(), e = eIn.slice();
  e.push(0);
  let z = null;
  if (wantVecs) {
    z = Array.from({ length: n }, (_, i) =>
      Float64Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  }
  for (let l = 0; l < n; l++) {
    let iter = 0, m;
    do {
      for (m = l; m < n - 1; m++) {
        const dd = Math.abs(d[m]) + Math.abs(d[m + 1]);
        if (Math.abs(e[m]) <= 1e-14 * dd) break;
      }
      if (m !== l) {
        if (iter++ === 50) break;
        let g = (d[l + 1] - d[l]) / (2 * e[l]);
        let r = Math.hypot(g, 1);
        g = d[m] - d[l] + e[l] / (g + (g >= 0 ? Math.abs(r) : -Math.abs(r)));
        let s = 1, cc = 1, p = 0;
        for (let i = m - 1; i >= l; i--) {
          let f = s * e[i], b = cc * e[i];
          r = Math.hypot(f, g);
          e[i + 1] = r;
          if (r === 0) { d[i + 1] -= p; e[m] = 0; break; }
          s = f / r; cc = g / r;
          g = d[i + 1] - p;
          r = (d[i] - g) * s + 2 * cc * b;
          p = s * r;
          d[i + 1] = g + p;
          g = cc * r - b;
          if (z) {
            for (let k = 0; k < n; k++) {
              f = z[k][i + 1];
              z[k][i + 1] = s * z[k][i] + cc * f;
              z[k][i] = cc * z[k][i] - s * f;
            }
          }
        }
        d[l] -= p; e[l] = g; e[m] = 0;
      }
    } while (m !== l);
  }
  // sort ascending
  const idx = Array.from({ length: n }, (_, i) => i).sort((a, b) => d[a] - d[b]);
  const dS = idx.map(i => d[i]);
  const zS = z ? idx.map(i => Float64Array.from({ length: n }, (_, k) => z[k][i])) : null;
  return { E: dS, vecs: zS }; // vecs[state][node]
}

const POTENTIALS = {
  box: {
    ko: "무한 우물 (V = 0)", en: "Infinite well (V = 0)",
    V: () => 0,
    analytic: (nn) => nn * nn * Math.PI * Math.PI / 2,
    analyticLabel: "E_n = n²π²/2",
  },
  harmonic: {
    ko: "조화 퍼텐셜 ½k(x−½)²", en: "Harmonic ½k(x−½)²",
    V: x => 0.5 * 8e4 * (x - 0.5) * (x - 0.5),
    analytic: (nn) => (nn - 0.5) * Math.sqrt(8e4),
    analyticLabel: "E_n = (n−½)√k,  k = 8×10⁴",
  },
  finite: {
    ko: "유한 우물 (V₀ = 2000)", en: "Finite well (V₀ = 2000)",
    V: x => (Math.abs(x - 0.5) < 0.2 ? 0 : 2000),
    analytic: null,
    analyticLabel: null,
  },
  ramp: {
    ko: "기울어진 우물 V = 300x", en: "Tilted well V = 300x",
    V: x => 300 * x,
    analytic: null,
    analyticLabel: null,
  },
};

function Schrodinger({ lang }) {
  const isKo = lang === "ko";
  const [pot, setPot] = useState("box");
  const [Ngrid, setNgrid] = useState(120);

  const sol = useMemo(() => {
    const N = Ngrid, L = 1, h = L / (N + 1);
    const xi = Array.from({ length: N }, (_, i) => (i + 1) * h);
    const Vf = POTENTIALS[pot].V;
    const dDiag = xi.map(x => 1 / (h * h) + Vf(x));
    const eSub = Array(N - 1).fill(-0.5 / (h * h));
    const { E, vecs } = tql2(dDiag, eSub);
    // normalize: Σψ²h = 1
    const psi = vecs.slice(0, 4).map(v => {
      let s = 0;
      for (let i = 0; i < N; i++) s += v[i] * v[i];
      const nrm = 1 / Math.sqrt(s * h);
      const sign = v[Math.floor(N / 5)] >= 0 ? 1 : -1;
      return Float64Array.from(v, x => x * nrm * sign);
    });
    return { xi, E: E.slice(0, 6), psi, Vf, h };
  }, [pot, Ngrid]);

  return (
    <div>
      <Card>
        <H2>{isKo ? "\"고유값 문제로서의 양자화\" — 브라우저 안의 Schrödinger" : "\"Quantization as an eigenvalue problem\" — Schrödinger in your browser"}</H2>
        <Note>
          {isKo
            ? "Schrödinger의 1926년 첫 논문 제목이 바로 'Quantisierung als Eigenwertproblem'입니다. 시간독립 방정식 −½ψ″ + V(x)ψ = Eψ (ℏ = m = 1)를 유체역학(Wk11)에서 배운 것과 똑같은 중심차분 FDM으로 이산화하면 대칭 삼중대각 행렬의 고유값 문제가 됩니다. 아래 솔버는 지금 이 페이지에서 실시간으로 그 행렬을 대각화합니다 — 고유값이 곧 허용된 에너지 준위입니다."
            : "Schrödinger's first 1926 paper is literally titled 'Quantisierung als Eigenwertproblem'. Discretizing the time-independent equation −½ψ″ + V(x)ψ = Eψ (ℏ = m = 1) with the same central-difference FDM you used in Fluid Mechanics (Wk11) yields a symmetric tridiagonal eigenvalue problem. The solver below diagonalizes that matrix live on this page — the eigenvalues are the allowed energy levels."}
        </Note>
        <Eq>−(1/2)·(ψᵢ₊₁ − 2ψᵢ + ψᵢ₋₁)/h² + Vᵢψᵢ = Eψᵢ   →   Hψ = Eψ,  H {isKo ? "대칭 삼중대각" : "symmetric tridiagonal"}</Eq>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", margin: "12px 0" }}>
          {Object.entries(POTENTIALS).map(([k, p]) => (
            <button key={k} onClick={() => setPot(k)} style={btnStyle(pot === k)}>{isKo ? p.ko : p.en}</button>
          ))}
          <Slider label={isKo ? "격자 N" : "grid N"} value={Ngrid} min={40} max={200} step={10} onChange={setNgrid} width={140} />
        </div>
        <SchroPlot sol={sol} isKo={isKo} pot={pot} />
        <EigenTable sol={sol} isKo={isKo} pot={pot} />
      </Card>

      <Card>
        <H2>{isKo ? "왜 에너지가 양자화되는가?" : "Why is energy quantized?"}</H2>
        <Note>
          {isKo
            ? "경계조건 때문입니다. ψ(0) = ψ(L) = 0 (또는 ψ → 0 as x → ±∞)을 만족하면서 방정식을 푸는 것은, 기타 줄이 특정 배음만 낼 수 있는 것과 같은 이유로 특정 E에서만 가능합니다. Schrödinger는 이를 '정수는 더 이상 신비한 규칙이 아니라, 진동하는 줄의 마디 수처럼 자연스럽게 나온다'고 표현했습니다."
            : "Boundary conditions. Solving the equation with ψ(0) = ψ(L) = 0 (or ψ → 0 as x → ±∞) is possible only at special E — for the same reason a guitar string plays only certain harmonics. Schrödinger wrote that integers now arise 'in the same natural way as the number of nodes of a vibrating string', no longer as a mysterious rule."}
        </Note>
        <Eq>S = K·logψ  →  H(q, ∂S/∂q) = E  {isKo ? "(Hamilton-Jacobi와의 연결)" : "(the Hamilton-Jacobi connection)"}</Eq>
        <Note>
          {isKo
            ? "Schrödinger는 Hamilton-Jacobi 방정식의 생성함수 S를 S = K·logψ로 치환하고, 그 결과를 '최소화해야 할 범함수 J의 피적분함수'로 보아 변분법(2주차의 Euler-Lagrange!)을 적용해 고유값 문제를 얻었습니다. 이번 주에 배운 세 갈래 — 열복사의 양자화, 고전역학의 변분 구조, 파동의 모드 — 가 한 방정식에서 만납니다."
            : "Schrödinger substituted S = K·logψ into the Hamilton-Jacobi generator, treated the result as the integrand of a functional J to be minimized, and applied the calculus of variations (the Euler-Lagrange machinery of Part 2!) to obtain the eigenvalue problem. The three threads of this week — quantized radiation, the variational structure of classical mechanics, and wave modes — meet in one equation."}
        </Note>
        <Note>
          {isKo
            ? "덤: 1D 속박상태는 축퇴가 없습니다. 두 해 ψ₁, ψ₂가 같은 E를 가지면 Wronskian ψ₁ψ₂′ − ψ₂ψ₁′ = const = 0 (무한원점에서 0이므로), 따라서 ψ₂ ∝ ψ₁ — 슬라이드 마지막 페이지의 정리입니다."
            : "Bonus: 1D bound states are non-degenerate. If ψ₁, ψ₂ share the same E, the Wronskian ψ₁ψ₂′ − ψ₂ψ₁′ = const = 0 (it vanishes at infinity), so ψ₂ ∝ ψ₁ — the theorem on the last lecture slide."}
        </Note>
      </Card>
    </div>
  );
}

function SchroPlot({ sol, isKo, pot }) {
  const W = 720, H = 380, pad = 52;
  const { xi, E, psi, Vf } = sol;
  const Etop = E[3] * 1.35 + (pot === "box" ? 8 : 0);
  const { X, Y } = usePlotScale(0, 1, 0, Etop, W, H, pad);
  const colors = [C.accent, C.cyan, C.ok, C.pink];
  const amp = Etop * 0.09;
  // potential curve (clipped)
  const vPts = [];
  for (let i = 0; i <= 160; i++) {
    const x = i / 160;
    vPts.push([x, Math.min(Vf(x), Etop)]);
  }
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ background: "#0d1117", borderRadius: 10, border: `1px solid ${C.border}`, width: "100%", maxWidth: W, height: "auto" }}>
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#334155" />
      <line x1={pad} y1={pad - 8} x2={pad} y2={H - pad} stroke="#334155" />
      <text x={W - pad} y={H - pad + 28} fill={C.textDim} fontSize={11} textAnchor="end">x / L</text>
      <text x={pad - 38} y={pad - 12} fill={C.textDim} fontSize={11}>E,  ψ {isKo ? "(준위에 겹침)" : "(offset by Eₙ)"}</text>
      {/* infinite well walls */}
      {pot === "box" && <>
        <line x1={X(0)} y1={pad - 8} x2={X(0)} y2={H - pad} stroke="#64748b" strokeWidth={3} />
        <line x1={X(1)} y1={pad - 8} x2={X(1)} y2={H - pad} stroke="#64748b" strokeWidth={3} />
      </>}
      {/* potential */}
      {pot !== "box" && <path d={pathOf(vPts, X, Y)} fill="none" stroke="#64748b" strokeWidth={1.6} strokeDasharray="5 4" />}
      {/* eigenstates */}
      {psi.map((v, n) => {
        const pts = xi.map((x, i) => [x, E[n] + amp * v[i] / Math.max(...psi[0].map(Math.abs))]);
        return (
          <g key={n}>
            <line x1={X(0)} y1={Y(E[n])} x2={X(1)} y2={Y(E[n])} stroke={colors[n]} strokeWidth={0.8} opacity={0.4} strokeDasharray="2 4" />
            <path d={pathOf(pts, X, Y)} fill="none" stroke={colors[n]} strokeWidth={2.2} />
            <text x={W - pad + 4} y={Y(E[n]) + 4} fill={colors[n]} fontSize={11} fontWeight={700}>E{n + 1}</text>
          </g>
        );
      })}
    </svg>
  );
}

function EigenTable({ sol, isKo, pot }) {
  const an = POTENTIALS[pot].analytic;
  const th = () => ({ padding: "7px 10px", textAlign: "left", fontSize: 12, color: C.textDim, borderBottom: `1px solid ${C.border}` });
  const td = () => ({ padding: "6px 10px", borderBottom: `1px solid ${C.border}22`, fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5 });
  return (
    <div style={{ overflowX: "auto", marginTop: 14 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", color: C.text }}>
        <thead>
          <tr style={{ background: C.card }}>
            <th style={th()}>n</th>
            <th style={th()}>{isKo ? "FDM 고유값 Eₙ" : "FDM eigenvalue Eₙ"}</th>
            {an && <th style={th()}>{isKo ? "해석해" : "Analytic"} ({POTENTIALS[pot].analyticLabel})</th>}
            {an && <th style={th()}>{isKo ? "상대오차" : "Rel. error"}</th>}
          </tr>
        </thead>
        <tbody>
          {sol.E.slice(0, 5).map((e, i) => {
            const ea = an ? an(i + 1) : null;
            return (
              <tr key={i}>
                <td style={td()}>{i + 1}</td>
                <td style={{ ...td(), color: C.accentSoft }}>{e.toFixed(4)}</td>
                {an && <td style={{ ...td(), color: C.ok }}>{ea.toFixed(4)}</td>}
                {an && <td style={{ ...td(), color: C.textDim }}>{(Math.abs(e - ea) / ea).toExponential(1)}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
      <Note>
        {isKo
          ? "격자 N을 키우면 오차가 O(h²)로 줄어듭니다 — Wk11 수치미분의 수렴 차수 그대로입니다."
          : "Increase N and the error shrinks as O(h²) — the same convergence order as the finite differences of Wk11."}
      </Note>
    </div>
  );
}

// =============================================================
// 7) PRACTICE — 8 problems with solutions
// =============================================================
function Practice({ lang }) {
  const isKo = lang === "ko";
  const problems = [
    {
      q: isKo
        ? "P1. 태양 표면 온도를 5,800 K로 볼 때 (a) 방출 피크 파장, (b) 단위면적당 총 방출능을 구하라. 인체(310 K)에 대해서도 반복하고 두 결과를 비교하라."
        : "P1. Taking the solar surface at 5,800 K, find (a) the peak emission wavelength and (b) the total emissive power per unit area. Repeat for the human body (310 K) and compare.",
      s: isKo
        ? "Wien: λmax = 2898/5800 ≈ 0.50 μm (가시광 초록). σT⁴ = 5.67×10⁻⁸ × 5800⁴ ≈ 6.42×10⁷ W/m². 인체: λmax = 2898/310 ≈ 9.35 μm (원적외선 — 열화상 카메라 대역), σT⁴ ≈ 524 W/m². 온도비 18.7배 → 방출능은 18.7⁴ ≈ 1.2×10⁵배."
        : "Wien: λmax = 2898/5800 ≈ 0.50 μm (green visible). σT⁴ = 5.67×10⁻⁸ × 5800⁴ ≈ 6.42×10⁷ W/m². Body: λmax = 2898/310 ≈ 9.35 μm (far-IR — thermal camera band), σT⁴ ≈ 524 W/m². Temperature ratio 18.7 → power ratio 18.7⁴ ≈ 1.2×10⁵.",
    },
    {
      q: isKo
        ? "P2. Rayleigh-Jeans 법칙 E_λ = 2πck_BT/λ⁴를 Planck 법칙의 λ→∞ 극한으로 유도하라. 이 결과가 h를 포함하지 않는 이유를 물리적으로 설명하라."
        : "P2. Derive the Rayleigh-Jeans law E_λ = 2πck_BT/λ⁴ as the λ→∞ limit of Planck's law. Explain physically why the result contains no h.",
      s: isKo
        ? "hc/λk_BT ≪ 1이면 e^x − 1 ≈ x이므로 E_λ = (2πhc²/λ⁵)·(λk_BT/hc) = 2πck_BT/λ⁴. h가 소거되는 것은 준위 간격 hν ≪ k_BT여서 양자화가 보이지 않는 고전 극한이기 때문 — 대응원리의 예."
        : "For hc/λk_BT ≪ 1, e^x − 1 ≈ x, so E_λ = (2πhc²/λ⁵)·(λk_BT/hc) = 2πck_BT/λ⁴. h cancels because the level spacing hν ≪ k_BT — quantization is invisible in this classical limit, an instance of the correspondence principle.",
    },
    {
      q: isKo
        ? "P3. Planck 분포에서 모드 하나의 평균 에너지 ⟨E⟩ = hν/(e^{hν/k_BT} − 1)를 분배함수 Z = Σ e^{−nhν/k_BT}로부터 유도하라."
        : "P3. Starting from the partition function Z = Σ e^{−nhν/k_BT}, derive the mean energy per mode ⟨E⟩ = hν/(e^{hν/k_BT} − 1).",
      s: isKo
        ? "β = 1/k_BT, x = e^{−βhν}로 두면 Z = 1/(1−x) (기하급수). ⟨E⟩ = −∂lnZ/∂β = hν·x/(1−x) = hν/(e^{βhν} − 1). 저주파 극한에서 ⟨E⟩ → k_BT (등분배 회복)."
        : "With β = 1/k_BT and x = e^{−βhν}, Z = 1/(1−x) (geometric series). ⟨E⟩ = −∂lnZ/∂β = hν·x/(1−x) = hν/(e^{βhν} − 1). In the low-frequency limit ⟨E⟩ → k_BT (equipartition recovered).",
    },
    {
      q: isKo
        ? "P4. 변분법: 두 점을 잇는 평면 곡선 중 길이 L = ∫√(1+y′²)dx 가 최소인 것이 직선임을 Euler 방정식(또는 Beltrami 항등식)으로 보여라."
        : "P4. Calculus of variations: using the Euler equation (or the Beltrami identity), show that the plane curve of minimal length L = ∫√(1+y′²)dx between two points is a straight line.",
      s: isKo
        ? "f = √(1+y′²)는 y를 포함하지 않으므로 ∂f/∂y = 0 → d/dx(∂f/∂y′) = 0 → y′/√(1+y′²) = C → y′ = const → y = ax + b."
        : "f = √(1+y′²) has no explicit y, so ∂f/∂y = 0 → d/dx(∂f/∂y′) = 0 → y′/√(1+y′²) = C → y′ = const → y = ax + b.",
    },
    {
      q: isKo
        ? "P5. SHO의 L = ½mq̇² − ½mω²q²에 대해 (a) Euler-Lagrange 방정식, (b) 일반화 운동량 p, (c) Legendre 변환으로 H(q,p)를 구하고 H = T + U임을 확인하라."
        : "P5. For the SHO Lagrangian L = ½mq̇² − ½mω²q², find (a) the Euler-Lagrange equation, (b) the generalized momentum p, (c) H(q,p) via Legendre transform, and verify H = T + U.",
      s: isKo
        ? "(a) mq̈ = −mω²q. (b) p = ∂L/∂q̇ = mq̇. (c) H = pq̇ − L = p²/m − (p²/2m − ½mω²q²) = p²/2m + ½mω²q² = T + U. 정준방정식 q̇ = p/m, ṗ = −mω²q가 (a)를 재현."
        : "(a) mq̈ = −mω²q. (b) p = ∂L/∂q̇ = mq̇. (c) H = pq̇ − L = p²/m − (p²/2m − ½mω²q²) = p²/2m + ½mω²q² = T + U. The canonical equations q̇ = p/m, ṗ = −mω²q reproduce (a).",
    },
    {
      q: isKo
        ? "P6. 평면파 ψ = A exp[i(kx − ωt)]에 운동량 연산자 p̂ = −iℏ∂/∂x 와 에너지 연산자 Ê = iℏ∂/∂t 를 적용해 고유값이 각각 ℏk, ℏω임을 보이고, 자유입자 관계 E = p²/2m로부터 Schrödinger 방정식을 구성하라."
        : "P6. Apply p̂ = −iℏ∂/∂x and Ê = iℏ∂/∂t to the plane wave ψ = A exp[i(kx − ωt)]; show the eigenvalues are ℏk and ℏω. Then use E = p²/2m to assemble the Schrödinger equation.",
      s: isKo
        ? "p̂ψ = ℏkψ, Êψ = ℏωψ. E = p²/2m에 연산자를 대입: iℏ∂ψ/∂t = −(ℏ²/2m)∂²ψ/∂x². 퍼텐셜 V가 있으면 우변에 Vψ 추가 — 시간의존 Schrödinger 방정식."
        : "p̂ψ = ℏkψ, Êψ = ℏωψ. Substituting operators into E = p²/2m: iℏ∂ψ/∂t = −(ℏ²/2m)∂²ψ/∂x². With a potential, add Vψ — the time-dependent Schrödinger equation.",
    },
    {
      q: isKo
        ? "P7. 2D 정사각 막(한 변 L, 고정 경계)의 모드 (nₓ, n_y) = (2,1)과 (1,2)의 진동수가 같음을 보이고(축퇴), 직사각형 막(Lₓ ≠ L_y)에서는 이 축퇴가 깨짐을 설명하라."
        : "P7. Show that modes (nₓ, n_y) = (2,1) and (1,2) of a square membrane (side L, fixed edges) share the same frequency (degeneracy), and explain why a rectangular membrane (Lₓ ≠ L_y) breaks it.",
      s: isKo
        ? "ω = cπ√(nₓ² + n_y²)/L이므로 (2,1)과 (1,2) 모두 ω = cπ√5/L — 대칭에 의한 축퇴. 직사각형이면 ω = cπ√((nₓ/Lₓ)² + (n_y/L_y)²)로 두 값이 달라짐. 대칭이 낮아지면 축퇴가 풀린다는 일반 원리(분광학에서 재등장!)."
        : "ω = cπ√(nₓ² + n_y²)/L gives ω = cπ√5/L for both — degeneracy by symmetry. For a rectangle, ω = cπ√((nₓ/Lₓ)² + (n_y/L_y)²) differs. Lowering symmetry lifts degeneracy — a principle that returns in spectroscopy!",
    },
    {
      q: isKo
        ? "P8. (수치) Raw 코드 탭의 schrodinger_fdm을 실행해 무한 우물의 E₁~E₅를 해석해 n²π²/2와 비교하라. N을 100 → 400으로 올릴 때 오차가 몇 배로 줄어드는지 확인하고 이유를 설명하라."
        : "P8. (Numerical) Run schrodinger_fdm from the Raw Codes tab; compare E₁–E₅ of the infinite well with n²π²/2. Quadruple N from 100 to 400 and explain the factor by which the error drops.",
      s: isKo
        ? "중심차분의 절단오차는 O(h²). N을 4배 → h가 1/4 → 오차 약 1/16. 높은 준위일수록 ψ의 곡률(마디 수)이 커서 같은 N에서 오차가 더 큽니다 — 파장당 격자점 수가 정확도를 결정."
        : "Central differences truncate at O(h²). Quadrupling N → h/4 → error ≈ 1/16. Higher states have more curvature (nodes), so at fixed N their error is larger — points-per-wavelength controls accuracy.",
    },
  ];
  return (
    <div>
      <Card>
        <H2>{isKo ? "연습문제 (풀이 포함)" : "Practice problems (with solutions)"}</H2>
        <Note>
          {isKo
            ? "P1–P3은 Part 1(복사), P4–P5는 Part 2(고전역학), P6–P8은 Part 3(파동·Schrödinger)에 대응합니다."
            : "P1–P3 map to Part 1 (radiation), P4–P5 to Part 2 (classical mechanics), P6–P8 to Part 3 (waves & Schrödinger)."}
        </Note>
      </Card>
      {problems.map((p, i) => <Problem key={i} p={p} isKo={isKo} />)}
    </div>
  );
}

function Problem({ p, isKo }) {
  const [open, setOpen] = useState(false);
  return (
    <Card style={{ padding: "16px 20px" }}>
      <div style={{ fontSize: 13.5, lineHeight: 1.75, color: C.text }}>{p.q}</div>
      <button onClick={() => setOpen(o => !o)} style={{ ...btnStyle(open), marginTop: 12, padding: "6px 12px", fontSize: 12 }}>
        {open ? (isKo ? "풀이 숨기기" : "Hide solution") : (isKo ? "풀이 보기" : "Show solution")}
      </button>
      {open && (
        <div style={{
          marginTop: 12, padding: "12px 16px", background: "#0d1117",
          borderLeft: `3px solid ${C.ok}`, borderRadius: 8,
          fontSize: 13, lineHeight: 1.8, color: C.textDim,
        }}>{p.s}</div>
      )}
    </Card>
  );
}

// =============================================================
// 8) RAW CODES — 4 topics × 4 languages, view & download
// =============================================================
const CODE_TOPICS = {
  planck_law: {
    ko: "Planck 복사법칙", en: "Planck's law",
    desc_ko: "RJ/Wien/Planck 스펙트럼 비교, Wien 변위법칙·Stefan-Boltzmann 수치 검증",
    desc_en: "RJ/Wien/Planck spectra; numerical checks of Wien & Stefan-Boltzmann laws",
    files: { python: PY_PLANCK, matlab: ML_PLANCK, julia: JL_PLANCK, cpp: CPP_PLANCK },
  },
  action_principle: {
    ko: "최소작용 원리", en: "Least action",
    desc_ko: "SHO 경로 교란 → S(ε) 계산으로 고전 경로가 작용을 최소화함을 확인",
    desc_en: "Perturb SHO paths → compute S(ε); the classical path minimizes the action",
    files: { python: PY_ACTION, matlab: ML_ACTION, julia: JL_ACTION, cpp: CPP_ACTION },
  },
  helmholtz_modes: {
    ko: "Helmholtz 모드", en: "Helmholtz modes",
    desc_ko: "2D 막 고유모드 히트맵 + 3D 공동 모드 계수 N(ω′) vs (π/6)ω′³",
    desc_en: "2D membrane eigenmode heatmaps + 3D cavity mode counting N(ω′) vs (π/6)ω′³",
    files: { python: PY_HELM, matlab: ML_HELM, julia: JL_HELM, cpp: CPP_HELM },
  },
  schrodinger_fdm: {
    ko: "Schrödinger FDM", en: "Schrödinger FDM",
    desc_ko: "1D 시간독립 Schrödinger 방정식을 삼중대각 고유값 문제로 풀고 해석해와 비교",
    desc_en: "Solve the 1D TISE as a tridiagonal eigenvalue problem; compare with analytic levels",
    files: { python: PY_SCHRO, matlab: ML_SCHRO, julia: JL_SCHRO, cpp: CPP_SCHRO },
  },
};
const LANG_META = {
  python: { label: "Python", ext: "py", hint: "python wk01_*.py  (numpy, matplotlib)" },
  matlab: { label: "MATLAB", ext: "m", hint: "run in MATLAB / Octave" },
  julia: { label: "Julia", ext: "jl", hint: "julia wk01_*.jl  (Plots)" },
  cpp: { label: "C++", ext: "cpp", hint: "g++ -O2 -std=c++17 … && ./a.out" },
};

function RawCodes({ lang }) {
  const isKo = lang === "ko";
  const [topic, setTopic] = useState("planck_law");
  const [cl, setCl] = useState("python");
  const meta = CODE_TOPICS[topic];
  const code = meta.files[cl];
  const fname = `wk01_${topic}.${LANG_META[cl].ext}`;

  const download = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fname;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const copy = () => navigator.clipboard && navigator.clipboard.writeText(code);

  return (
    <div>
      <Card>
        <H2>{isKo ? "실습 코드 (4개 주제 × 4개 언어)" : "Hands-on codes (4 topics × 4 languages)"}</H2>
        <Note>
          {isKo
            ? "이번 주의 모든 인터랙티브 데모 뒤에는 아래 코드가 있습니다. 원하는 언어로 내려받아 직접 실행해 보세요 — 수치가 강의 슬라이드·이 페이지의 결과와 일치하는지 확인하는 것까지가 실습입니다."
            : "Every interactive demo this week is powered by the codes below. Download in your language of choice and run them — verifying the numbers against the lecture slides and this page is part of the exercise."}
        </Note>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {Object.entries(CODE_TOPICS).map(([k, m]) => (
            <button key={k} onClick={() => setTopic(k)} style={btnStyle(topic === k)}>{isKo ? m.ko : m.en}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {Object.entries(LANG_META).map(([k, m]) => (
            <button key={k} onClick={() => setCl(k)} style={{ ...btnStyle(cl === k), padding: "6px 13px", fontSize: 12 }}>{m.label}</button>
          ))}
          <span style={{ fontSize: 11.5, color: C.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{LANG_META[cl].hint}</span>
        </div>
        <div style={{ fontSize: 12.5, color: C.textDim, margin: "10px 0 6px" }}>{isKo ? meta.desc_ko : meta.desc_en}</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button onClick={download} style={btnStyle(true)}>⬇ {fname}</button>
          <button onClick={copy} style={btnStyle()}>{isKo ? "복사" : "Copy"}</button>
        </div>
        <pre style={{
          background: "#0d1117", border: `1px solid ${C.border}`, borderRadius: 10,
          padding: 16, overflowX: "auto", fontSize: 12, lineHeight: 1.6,
          fontFamily: "'JetBrains Mono',monospace", color: "#c9d1d9", maxHeight: 560,
        }}>{code}</pre>
      </Card>
    </div>
  );
}
