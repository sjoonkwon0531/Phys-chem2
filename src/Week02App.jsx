// ============================================================
// Week02App.jsx — Wave Mechanics & Matrix Mechanics
// Physical Chemistry 2 (물리화학 2)
// SKKU School of Chemical Engineering
// Smart Process & Materials Design Lab (SPMDL)
// Prof. S. Joon Kwon
// ------------------------------------------------------------
// Topics covered (Wk02 Part 1 / Part 2 / Part 3):
//   • Free particle — plane waves, momentum eigenstates, Fourier
//     x-space ↔ p-space, Gaussian wave packets, minimum uncertainty,
//     dispersion of the packet
//   • Step potential (E>V0, E<V0), finite-barrier tunneling,
//     FET leakage & STM applications
//   • Particle in a box — quantization, zero-point energy, basis
//     expansion, measurement postulate, expectation values, 3D box
//     (quantum dots), time-dependent superpositions
//   • Matrix mechanics — Heisenberg / Born-Jordan, [q̂,p̂] = iℏ,
//     uncertainty principle from Cauchy-Schwarz
// ============================================================
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  PY_PACKET, ML_PACKET, JL_PACKET, CPP_PACKET,
  PY_TUNNEL, ML_TUNNEL, JL_TUNNEL, CPP_TUNNEL,
  PY_BOX, ML_BOX, JL_BOX, CPP_BOX,
  PY_MATRIX, ML_MATRIX, JL_MATRIX, CPP_MATRIX,
} from "./Week02Codes";

// ── i18n ─────────────────────────────────────────────────────
const i18n = {
  ko: {
    weekTitle: "Week 2 — 파동역학과 행렬역학",
    subtitle: "자유입자 · 터널링 · 상자 속 입자 · Heisenberg 행렬역학",
    tabs: {
      overview: "개요",
      free: "자유입자 & 파속",
      scatter: "계단 & 터널링",
      box: "상자 속 입자",
      dynamics: "시간전개 & 3D",
      matrix: "행렬역학",
      practice: "연습문제",
      codes: "Raw 코드",
    },
  },
  en: {
    weekTitle: "Week 2 — Wave Mechanics & Matrix Mechanics",
    subtitle: "Free particles · Tunneling · Particle in a box · Heisenberg's matrix mechanics",
    tabs: {
      overview: "Overview",
      free: "Free Particle & Packets",
      scatter: "Step & Tunneling",
      box: "Particle in a Box",
      dynamics: "Dynamics & 3D",
      matrix: "Matrix Mechanics",
      practice: "Practice",
      codes: "Raw Codes",
    },
  },
};

// ── design tokens (Week 2 accent: sky) ───────────────────────
const C = {
  bg: "#0b0f17",
  panel: "#111827",
  card: "#1f2937",
  border: "#374151",
  text: "#e5e7eb",
  textDim: "#9ca3af",
  accent: "#38bdf8",
  accentSoft: "#7dd3fc",
  amber: "#f59e0b",
  blue: "#3b82f6",
  blueSoft: "#60a5fa",
  ok: "#10b981",
  err: "#ef4444",
  purple: "#a78bfa",
  cyan: "#22d3ee",
  pink: "#f472b6",
};

// physical constants for real-unit tunneling (electron, eV, nm)
const HBARC = 197.3269804;      // eV·nm
const MC2 = 0.51099895e6;       // eV
const kappaNm = dE => Math.sqrt(2 * MC2 * Math.max(dE, 1e-12)) / HBARC;   // nm⁻¹

// =============================================================
// MAIN COMPONENT
// =============================================================
export default function Week02App({ onBack, lang: langProp, onLangChange }) {
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
        {tab === "free" && <FreeParticle lang={lang} />}
        {tab === "scatter" && <Scattering lang={lang} />}
        {tab === "box" && <BoxTab lang={lang} />}
        {tab === "dynamics" && <DynamicsTab lang={lang} />}
        {tab === "matrix" && <MatrixTab lang={lang} />}
        {tab === "practice" && <Practice lang={lang} />}
        {tab === "codes" && <RawCodes lang={lang} />}
      </div>
    </div>
  );
}

// =============================================================
// SHARED UI PRIMITIVES (repo pattern)
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
    background: active ? "rgba(56,189,248,0.14)" : "transparent",
    color: active ? C.accentSoft : C.textDim,
    border: `1px solid ${active ? "rgba(56,189,248,0.4)" : "transparent"}`,
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
function H2({ children }) {
  return <h2 style={{
    fontSize: 20, fontWeight: 800, margin: "0 0 12px",
    fontFamily: "'Space Grotesk','Noto Sans KR',sans-serif", color: C.text,
  }}>{children}</h2>;
}
function H3({ children }) {
  return <h3 style={{ fontSize: 15, fontWeight: 700, margin: "16px 0 8px", color: C.accentSoft }}>{children}</h3>;
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
function Stat({ label, value, color }) {
  return (
    <div style={{ background: C.card, borderRadius: 10, padding: "10px 14px", border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
function usePlotScale(xMin, xMax, yMin, yMax, W, H, pad) {
  const X = x => pad + (W - 2 * pad) * (x - xMin) / (xMax - xMin || 1);
  const Y = y => H - pad - (H - 2 * pad) * (y - yMin) / (yMax - yMin || 1);
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
    { yr: "1924", who: "de Broglie", ko: "물질파 가설 λ = h/p — 입자도 파동이다", en: "Matter waves λ = h/p — particles are waves too", c: C.textDim },
    { yr: "1925", who: "Heisenberg", ko: "헬골란트 섬에서 행렬역학 착상 — '관측 가능한 것만 말하자'", en: "Matrix mechanics conceived on Helgoland — 'speak only of observables'", c: C.purple },
    { yr: "1925", who: "Born & Jordan", ko: "[q̂, p̂] = iℏ — 근본 교환관계 정식화", en: "[q̂, p̂] = iℏ — the fundamental commutation relation", c: C.purple },
    { yr: "1926", who: "Schrödinger", ko: "파동역학 발표 + 두 형식화의 동등성 증명", en: "Wave mechanics + proof that the two formulations are equivalent", c: C.accent },
    { yr: "1926", who: "Born", ko: "|ψ|² = 확률밀도 — 파동함수의 확률 해석", en: "|ψ|² = probability density — the statistical interpretation", c: C.accent },
    { yr: "1927", who: "Heisenberg", ko: "불확정성 원리 Δx·Δp ≥ ℏ/2", en: "Uncertainty principle Δx·Δp ≥ ℏ/2", c: C.err },
    { yr: "1928", who: "Gamow", ko: "α 붕괴 = 양자 터널링 — 첫 터널링 응용", en: "α decay = quantum tunneling — its first application", c: C.ok },
    { yr: "1981", who: "Binnig & Rohrer", ko: "터널링으로 원자를 보다: STM (1986 노벨상)", en: "Seeing atoms via tunneling: the STM (Nobel 1986)", c: C.ok },
    { yr: "2023", who: "Bawendi · Brus · Ekimov", ko: "'3D 상자 속 입자' = 양자점 — 노벨 화학상", en: "'Particle in a 3D box' = quantum dots — Nobel Prize in Chemistry", c: C.cyan },
  ];
  return (
    <div>
      <Card>
        <H2>{isKo ? "지난주에서 이번 주로" : "From last week to this week"}</H2>
        <Note>
          {isKo
            ? "1주차에 우리는 Schrödinger 방정식이 어떻게 태어났는지 보았습니다. 이번 주는 그 방정식을 실제로 풀어봅니다 — 가장 단순한 자유입자에서 출발해, 퍼텐셜 계단·장벽(터널링!), 상자 속 입자까지. 그리고 Schrödinger보다 1년 먼저 나온 또 하나의 양자역학, Heisenberg의 행렬역학을 만납니다. 두 형식화는 완전히 달라 보이지만 수학적으로 동등합니다."
            : "Last week we watched the Schrödinger equation being born. This week we actually solve it — from the simplest free particle, through potential steps and barriers (tunneling!), to the particle in a box. Then we meet the other quantum mechanics, born a year earlier: Heisenberg's matrix mechanics. The two formulations look utterly different but are mathematically equivalent."}
        </Note>
        <FlowDiagram isKo={isKo} />
      </Card>

      <Card>
        <H2>{isKo ? "이번 주 연대기" : "Timeline of this week's ideas"}</H2>
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
            { name: isKo ? "자유입자 평면파" : "Free-particle plane wave", eq: "ψ = e^{i(kx−ωt)},  p̂ψ = ±ℏk ψ", c: C.accent },
            { name: isKo ? "터널링 투과율" : "Tunneling probability", eq: "T ≈ 16(E/V₀)(1−E/V₀) e^{−2κw}", c: C.ok },
            { name: isKo ? "상자 고유상태" : "Box eigenstates", eq: "ψₙ = √(2/L) sin(nπx/L),  Eₙ = n²π²ℏ²/2mL²", c: C.blueSoft },
            { name: isKo ? "근본 교환관계" : "Fundamental commutator", eq: "[q̂, p̂] = iℏ  →  Δx·Δp ≥ ℏ/2", c: C.purple },
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
          isKo ? "자유입자의 평면파 해와 운동량 고유상태 |k⟩를 설명하고, x-공간과 p-공간이 Fourier 변환으로 연결됨을 안다." : "Explain plane-wave solutions and momentum eigenstates |k⟩; connect x-space and p-space by Fourier transform.",
          isKo ? "Gaussian 파속이 최소 불확정성 σ(x)σ(p) = ℏ/2를 가지며, 자유 전개 시 위치 불확정성이 커짐(분산)을 계산할 수 있다." : "Show the Gaussian packet saturates σ(x)σ(p) = ℏ/2 and compute how it disperses under free evolution.",
          isKo ? "퍼텐셜 계단에서 R, T를 유도하고 R + T = 1 (확률 보존)을 확인할 수 있다." : "Derive R and T at a potential step and verify R + T = 1 (probability conservation).",
          isKo ? "유한 장벽의 터널링 투과율 공식을 적용해 FET 누설·STM 감도를 정량적으로 평가할 수 있다." : "Apply the finite-barrier transmission formula to quantify FET leakage and STM sensitivity.",
          isKo ? "상자 속 입자의 임의 상태를 고유상태로 전개하고, 측정 확률 |cₙ|²과 기대값 ⟨E⟩ = Σ|cₙ|²Eₙ을 계산할 수 있다." : "Expand an arbitrary box state in eigenstates; compute measurement probabilities |cₙ|² and ⟨E⟩ = Σ|cₙ|²Eₙ.",
          isKo ? "정상상태는 |ψ|²이 시간에 불변이지만 중첩상태는 ω₂₁ = (E₂−E₁)/ℏ로 진동함을 보일 수 있다." : "Show stationary states have time-independent |ψ|² while superpositions oscillate at ω₂₁ = (E₂−E₁)/ℏ.",
          isKo ? "3D 상자의 축퇴를 세고, 크기 의존 에너지 갭으로 양자점 발광색을 추정할 수 있다." : "Count degeneracies of the 3D box; estimate quantum-dot emission color from the size-dependent gap.",
          isKo ? "위치·운동량을 행렬로 표현해 [X, P] = iℏ를 수치로 확인하고, Cauchy-Schwarz로 불확정성 원리를 유도할 수 있다." : "Represent x̂, p̂ as matrices, verify [X, P] = iℏ numerically, and derive the uncertainty principle via Cauchy-Schwarz.",
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
    { t: isKo ? "자유입자" : "Free particle", s: "e^{i(kx−ωt)}", c: C.accent },
    { t: isKo ? "파속·불확정성" : "Packets & uncertainty", s: "σxσp = ℏ/2", c: C.cyan },
    { t: isKo ? "계단·터널링" : "Step & tunneling", s: "T ~ e^{−2κw}", c: C.ok },
    { t: isKo ? "상자 속 입자" : "Particle in a box", s: "Eₙ ∝ n²", c: C.blueSoft },
    { t: isKo ? "행렬역학" : "Matrix mechanics", s: "[q̂,p̂] = iℏ", c: C.purple },
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
// 2) FREE PARTICLE — plane wave, Gaussian packet, dispersion
// =============================================================
function FreeParticle({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <Card>
        <H2>{isKo ? "자유입자: 가장 단순한 Schrödinger 문제" : "Free particle: the simplest Schrödinger problem"}</H2>
        <Eq>Ĥψ = −(ℏ²/2m) d²ψ/dx² = Eψ   →   ψ(x) = e^{"{±ikx}"},   k = √(2mE)/ℏ,   {isKo ? "경계조건 없음!" : "no BCs!"}</Eq>
        <Note>
          {isKo
            ? "경계조건이 없으므로 어떤 E ≥ 0도 허용 — 에너지는 연속입니다 (양자화는 경계조건의 산물임을 다시 확인). e^{+ikx}와 e^{−ikx}는 같은 E의 축퇴된 기저이며, 운동량 연산자 p̂ = −iℏ d/dx의 고유상태이기도 합니다: p̂ψ = ±ℏk ψ. 부호가 곧 진행 방향입니다."
            : "With no boundary conditions every E ≥ 0 is allowed — the energy is continuous (quantization really is a child of boundary conditions). e^{+ikx} and e^{−ikx} are degenerate basis states of the same E and are eigenstates of p̂ = −iℏ d/dx: p̂ψ = ±ℏk ψ. The sign is the direction of travel."}
        </Note>
        <PlaneWaveAnim isKo={isKo} />
        <Note>
          {isKo
            ? "정규화된 운동량 고유상태 |k⟩ = e^{ikx}/√2π 는 ⟨k|k′⟩ = δ(k−k′)를 만족하고, ⟨k|f⟩는 정확히 f(x)의 Fourier 변환 — 즉 운동량 공간의 파동함수입니다. x-공간과 p-공간은 같은 상태를 보는 두 좌표계입니다."
            : "The normalized momentum eigenstate |k⟩ = e^{ikx}/√2π satisfies ⟨k|k′⟩ = δ(k−k′), and ⟨k|f⟩ is exactly the Fourier transform of f(x) — the wave function in momentum space. x-space and p-space are two coordinate systems for the same state."}
        </Note>
      </Card>

      <GaussianPacketCard isKo={isKo} />
      <DispersionCard isKo={isKo} />
    </div>
  );
}

function PlaneWaveAnim({ isKo }) {
  const [k, setK] = useState(3);
  const [running, setRunning] = useState(true);
  const cvRef = useRef(null);
  const tRef = useRef(0);
  useEffect(() => {
    let raf;
    const draw = () => {
      const cv = cvRef.current; if (!cv) return;
      const ctx = cv.getContext("2d");
      const W = cv.width, H = cv.height, mid = H / 2;
      ctx.fillStyle = "#0d1117"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#273244"; ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();
      const t = tRef.current, A = H * 0.32, om = 0.5 * k * k;   // ω = ħk²/2m (ħ=m=1 toy units)
      const drawW = (fn, color, lw) => {
        ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath();
        for (let i = 0; i <= W; i += 2) {
          const x = 8 * i / W;
          const y = mid - A * fn(k * x - om * t);
          if (i === 0) ctx.moveTo(i, y); else ctx.lineTo(i, y);
        }
        ctx.stroke();
      };
      drawW(Math.cos, "#38bdf8", 2.4);
      drawW(Math.sin, "rgba(244,114,182,0.75)", 1.6);
      ctx.fillStyle = "#9ca3af"; ctx.font = "12px JetBrains Mono, monospace";
      ctx.fillText("Re ψ", 10, 18); ctx.fillStyle = "#f472b6"; ctx.fillText("Im ψ", 60, 18);
      if (running) tRef.current += 0.035;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [k, running]);
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
        <button onClick={() => setRunning(r => !r)} style={btnStyle(running)}>{running ? "■" : "▶"}</button>
        <Slider label="k" value={k} min={1} max={7} step={0.5} onChange={setK} width={150} />
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: C.cyan }}>
          ψ = e^(i(kx−ωt)),  ω = ℏk²/2m,  {isKo ? "위상속도" : "phase velocity"} = ω/k = ℏk/2m
        </span>
      </div>
      <canvas ref={cvRef} width={760} height={150}
        style={{ width: "100%", maxWidth: 760, borderRadius: 10, border: `1px solid ${C.border}` }} />
      <Note>
        {isKo
          ? "|ψ|² = 1로 모든 곳에서 균일 — 운동량이 확정(Δp = 0)이면 위치는 완전히 불확정(Δx = ∞). 실제 입자를 기술하려면 여러 k를 겹친 파속(wave packet)이 필요합니다."
          : "|ψ|² = 1 everywhere — a definite momentum (Δp = 0) means completely indefinite position (Δx = ∞). To describe a real particle we superpose many k's into a wave packet."}
      </Note>
    </div>
  );
}

// -- Gaussian packet: reciprocal widths ----------------------
function GaussianPacketCard({ isKo }) {
  const [eps, setEps] = useState(1.0);
  const hbar = 1, p0 = 3;
  const sx = Math.sqrt(eps), sp = hbar / (2 * Math.sqrt(eps));
  const W = 430, H = 250, pad = 42;
  const mkGauss = (s, x0, xMin, xMax) => {
    const pts = [];
    for (let i = 0; i <= 200; i++) {
      const x = xMin + (xMax - xMin) * i / 200;
      pts.push([x, Math.exp(-(x - x0) * (x - x0) / (2 * s * s)) / Math.sqrt(2 * Math.PI * s * s)]);
    }
    return pts;
  };
  const xPts = mkGauss(sx, 0, -6, 6);
  const pPts = mkGauss(sp, p0, 0, 6);
  const yMaxX = 1 / Math.sqrt(2 * Math.PI * 0.35 * 0.35);   // fixed axis for eps range
  const P1 = usePlotScale(-6, 6, 0, yMaxX * 1.05, W, H, pad);
  const P2 = usePlotScale(0, 6, 0, 1 / Math.sqrt(2 * Math.PI * 0.288 * 0.288) * 1.05, W, H, pad);
  return (
    <Card>
      <H2>{isKo ? "Gaussian 파속: 최소 불확정성" : "Gaussian wave packet: minimum uncertainty"}</H2>
      <Eq>ψ(x) = (1/2πε)^{"{1/4}"} e^{"{−x²/4ε + ip₀x/ℏ}"}   ⇄   φ(p) = (2ε/πℏ²)^{"{1/4}"} e^{"{−ε(p−p₀)²/ℏ²}"}</Eq>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", margin: "10px 0" }}>
        <Slider label={isKo ? "폭 파라미터 ε" : "width parameter ε"} value={eps} min={0.15} max={3} step={0.05} onChange={setEps} width={200} />
        <Pill color={C.accent}>σ(x) = √ε = {sx.toFixed(3)}</Pill>
        <Pill color={C.pink}>σ(p) = ℏ/2√ε = {sp.toFixed(3)}</Pill>
        <Pill color={C.ok}>σ(x)·σ(p) = {(sx * sp).toFixed(4)} ℏ = ℏ/2 ✓</Pill>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={svgBox(W)}>
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#334155" />
          <path d={pathOf(xPts, P1.X, P1.Y)} fill="none" stroke={C.accent} strokeWidth={2.4} />
          <text x={W / 2} y={pad - 8} fill={C.accent} fontSize={12} fontWeight={700} textAnchor="middle">
            |ψ(x)|²  ({isKo ? "위치 공간" : "position space"})
          </text>
          <text x={W - pad} y={H - pad + 16} fill={C.textDim} fontSize={11} textAnchor="end">x</text>
          {/* sigma bracket */}
          <line x1={P1.X(-sx)} y1={P1.Y(0) + 10} x2={P1.X(sx)} y2={P1.Y(0) + 10} stroke={C.cyan} strokeWidth={2} />
          <text x={P1.X(0)} y={P1.Y(0) + 24} fill={C.cyan} fontSize={10.5} textAnchor="middle">2σ(x)</text>
        </svg>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={svgBox(W)}>
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#334155" />
          <path d={pathOf(pPts, P2.X, P2.Y)} fill="none" stroke={C.pink} strokeWidth={2.4} />
          <text x={W / 2} y={pad - 8} fill={C.pink} fontSize={12} fontWeight={700} textAnchor="middle">
            |φ(p)|²  ({isKo ? "운동량 공간" : "momentum space"})
          </text>
          <text x={W - pad} y={H - pad + 16} fill={C.textDim} fontSize={11} textAnchor="end">p</text>
          <line x1={P2.X(p0 - sp)} y1={P2.Y(0) + 10} x2={P2.X(p0 + sp)} y2={P2.Y(0) + 10} stroke={C.cyan} strokeWidth={2} />
          <text x={P2.X(p0)} y={P2.Y(0) + 24} fill={C.cyan} fontSize={10.5} textAnchor="middle">2σ(p)</text>
        </svg>
      </div>
      <Note>
        {isKo
          ? "ε을 움직여 보세요 — x-공간에서 좁아지면 p-공간에서는 반드시 넓어집니다 (Fourier 쌍의 상반 관계). 곱은 언제나 정확히 ℏ/2: Gaussian은 Heisenberg 한계 Δx·Δp ≥ ℏ/2를 등호로 만족하는 유일한 모양입니다."
          : "Move ε — squeezing in x-space necessarily broadens p-space (the reciprocity of Fourier pairs). The product is always exactly ℏ/2: the Gaussian is the unique shape that saturates the Heisenberg bound Δx·Δp ≥ ℏ/2."}
      </Note>
    </Card>
  );
}

// -- dispersion animation ------------------------------------
function DispersionCard({ isKo }) {
  const [running, setRunning] = useState(true);
  const [mEff, setMEff] = useState(1.0);
  const cvRef = useRef(null);
  const tRef = useRef(0);
  const eps = 0.6, p0 = 2.2, hbar = 1, tMax = 9;

  useEffect(() => {
    let raf;
    const draw = () => {
      const cv = cvRef.current; if (!cv) return;
      const ctx = cv.getContext("2d");
      const W = cv.width, H = cv.height;
      ctx.fillStyle = "#0d1117"; ctx.fillRect(0, 0, W, H);
      const t = tRef.current % tMax;
      const s2 = eps + (hbar * t) * (hbar * t) / (4 * mEff * mEff * eps);
      const xc = p0 * t / mEff;
      const xMin = -5, xMax = 26;
      // ghost t=0
      const drawG = (sig2, cen, color, lw, dash) => {
        ctx.strokeStyle = color; ctx.lineWidth = lw;
        ctx.setLineDash(dash || []);
        ctx.beginPath();
        for (let i = 0; i <= W; i += 2) {
          const x = xMin + (xMax - xMin) * i / W;
          const P = Math.exp(-(x - cen) * (x - cen) / (2 * sig2)) / Math.sqrt(2 * Math.PI * sig2);
          const y = H - 24 - P * (H - 60) * 1.55;
          if (i === 0) ctx.moveTo(i, y); else ctx.lineTo(i, y);
        }
        ctx.stroke(); ctx.setLineDash([]);
      };
      ctx.strokeStyle = "#273244"; ctx.beginPath(); ctx.moveTo(0, H - 24); ctx.lineTo(W, H - 24); ctx.stroke();
      drawG(eps, 0, "rgba(148,163,184,0.5)", 1.2, [4, 4]);
      drawG(s2, xc, "#38bdf8", 2.6);
      ctx.fillStyle = "#9ca3af"; ctx.font = "12px JetBrains Mono, monospace";
      ctx.fillText(`t = ${t.toFixed(1)}   σx(t) = ${Math.sqrt(s2).toFixed(2)}   ` + (isKo ? "중심 = p₀t/m" : "center = p₀t/m"), 12, 20);
      if (running) tRef.current += 0.03;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [running, mEff, isKo]);

  return (
    <Card>
      <H2>{isKo ? "파속의 분산: 위치 불확정성은 시간에 따라 커진다" : "Packet dispersion: position uncertainty grows with time"}</H2>
      <Eq>σx(t)² = ε + ℏ²t²/(4m²ε),   σp(t) = ℏ/2√ε = const   ({isKo ? "자유입자 · 운동량은 보존" : "free particle · momentum conserved"})</Eq>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
        <button onClick={() => setRunning(r => !r)} style={btnStyle(running)}>{running ? "■" : "▶"}</button>
        <button onClick={() => { tRef.current = 0; }} style={btnStyle()}>↺</button>
        <Slider label={isKo ? "질량 m" : "mass m"} value={mEff} min={0.4} max={3} step={0.1} onChange={setMEff} width={160} />
      </div>
      <canvas ref={cvRef} width={760} height={200}
        style={{ width: "100%", maxWidth: 760, borderRadius: 10, border: `1px solid ${C.border}` }} />
      <Note>
        {isKo
          ? "각 운동량 성분이 서로 다른 위상속도 ω/k = ℏk/2m로 달리기 때문에 파속이 퍼집니다. 질량이 클수록 분산이 느립니다 — 전자를 0.1 nm에 가두면 폭이 두 배 되는 데 ~0.3 fs밖에 걸리지 않지만, 야구공은 우주의 나이보다 깁니다. 거시세계가 고전적으로 보이는 이유입니다."
          : "Each momentum component runs at a different phase velocity ω/k = ℏk/2m, so the packet spreads. Heavier means slower dispersion — an electron confined to 0.1 nm doubles its width in ~0.3 fs, while a baseball would take longer than the age of the universe. This is why the macroscopic world looks classical."}
      </Note>
    </Card>
  );
}

// =============================================================
// 3) STEP & TUNNELING
// =============================================================
// complex helpers
const cx = (re, im) => ({ re, im });
const cAdd = (a, b) => cx(a.re + b.re, a.im + b.im);
const cMul = (a, b) => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const cDiv = (a, b) => {
  const d = b.re * b.re + b.im * b.im;
  return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
};
const cAbs2 = a => a.re * a.re + a.im * a.im;

function Scattering({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <StepCard isKo={isKo} />
      <RTCurveCard isKo={isKo} />
      <TunnelCard isKo={isKo} />
    </div>
  );
}

// -- potential step ------------------------------------------
function StepCard({ isKo }) {
  const [ratio, setRatio] = useState(1.5);     // E / V0
  const V0 = 1, E = ratio * V0;
  const above = E > V0;
  const k1 = Math.sqrt(E);
  const W = 720, H = 300, pad = 46;
  const xMin = -12, xMax = 12;

  let r, R, T, k2 = 0, kap = 0;
  if (above) {
    k2 = Math.sqrt(E - V0);
    r = (k1 - k2) / (k1 + k2);
    R = r * r; T = 4 * k1 * k2 / ((k1 + k2) * (k1 + k2));
  } else {
    kap = Math.sqrt(V0 - E);
    R = 1; T = 0;
  }

  // Re psi(x): region1 e^{ik1x} + r e^{-ik1x}; region2: t2 e^{ik2x} or C e^{-kap x}
  const pts = [];
  for (let i = 0; i <= 480; i++) {
    const x = xMin + (xMax - xMin) * i / 480;
    let re;
    if (x < 0) {
      if (above) re = Math.cos(k1 * x) + r * Math.cos(-k1 * x);
      else {
        // r complex: r = (1 + iκ/k1)/(1 − iκ/k1)  →  Re ψ1 = cos k1x + Re(r e^{−ik1x})
        const rc = cDiv(cx(1, kap / k1), cx(1, -kap / k1));
        re = Math.cos(k1 * x) + rc.re * Math.cos(k1 * x) + rc.im * Math.sin(k1 * x);
      }
    } else {
      if (above) {
        const t2 = 2 * k1 / (k1 + k2);
        re = t2 * Math.cos(k2 * x);
      } else {
        const tc = cDiv(cx(2, 0), cx(1, -kap / k1));
        re = tc.re * Math.exp(-kap * x);
      }
    }
    pts.push([x, re]);
  }
  const yAbs = Math.max(...pts.map(p => Math.abs(p[1]))) * 1.15;
  const { X, Y } = usePlotScale(xMin, xMax, -yAbs, yAbs, W, H, pad);
  const delta = above ? null : 1 / kap;

  return (
    <Card>
      <H2>{isKo ? "퍼텐셜 계단: 부분 반사와 전반사" : "Potential step: partial vs total reflection"}</H2>
      <Eq>
        E &gt; V₀:  R = ((k₁−k₂)/(k₁+k₂))²,  T = 4k₁k₂/(k₁+k₂)²,  k₂/k₁ = √(1−V₀/E)
        {"      "}E &lt; V₀:  ψ₂ ∝ e^{"{−κx}"},  R = 1
      </Eq>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", margin: "10px 0" }}>
        <Slider label="E / V₀" value={ratio} min={0.2} max={3} step={0.05} onChange={setRatio} width={210} fmt={v => v.toFixed(2)} />
        <Pill color={C.err}>R = {R.toFixed(4)}</Pill>
        <Pill color={C.ok}>T = {T.toFixed(4)}</Pill>
        <Pill color={C.cyan}>R + T = {(R + T).toFixed(4)}</Pill>
        {!above && <Pill color={C.purple}>{isKo ? "침투깊이" : "penetration"} 1/κ = {delta.toFixed(2)}</Pill>}
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ ...svgBox(W), flex: "none", width: "100%" }}>
        {/* potential */}
        <rect x={X(0)} y={pad - 6} width={X(xMax) - X(0)} height={H - 2 * pad + 6} fill="rgba(96,165,250,0.08)" />
        <line x1={X(0)} y1={pad - 6} x2={X(0)} y2={H - pad} stroke={C.blueSoft} strokeWidth={2} />
        <text x={X(0.4)} y={pad + 10} fill={C.blueSoft} fontSize={11}>V = V₀</text>
        <text x={X(xMin + 0.4)} y={pad + 10} fill={C.textDim} fontSize={11}>V = 0</text>
        <line x1={pad} y1={Y(0)} x2={W - pad} y2={Y(0)} stroke="#273244" />
        {/* energy line */}
        <line x1={pad} y1={pad + (above ? 18 : 34)} x2={W - pad} y2={pad + (above ? 18 : 34)} stroke="#9ca3af" strokeDasharray="6 5" strokeWidth={1} />
        <text x={W - pad - 4} y={pad + (above ? 14 : 30)} fill="#9ca3af" fontSize={10.5} textAnchor="end">E {above ? ">" : "<"} V₀</text>
        {/* wave */}
        <path d={pathOf(pts, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.4} />
        {!above && (
          <text x={X(2.2)} y={Y(0) - 12} fill={C.purple} fontSize={11.5} fontWeight={700}>e^(−κx)</text>
        )}
      </svg>
      <Note>
        {isKo
          ? above
            ? "고전역학이라면 E > V₀인 입자는 100% 넘어갑니다. 양자역학에서는 파동의 임피던스 불일치(k₁ ≠ k₂) 때문에 일부가 반사됩니다 — 빛이 유리 표면에서 일부 반사되는 것과 같은 수학입니다."
            : "E < V₀: 전부 반사되지만(R = 1), 파동함수는 장벽 안으로 e^{−κx}만큼 스며듭니다. 이 evanescent 꼬리가 다음 카드의 터널링을 예고합니다 — 장벽이 유한한 두께라면 꼬리가 반대편에 닿을 수 있으니까요."
          : above
            ? "Classically a particle with E > V₀ always gets through. Quantum mechanically the wave impedance mismatch (k₁ ≠ k₂) reflects part of it — the same mathematics as light partially reflecting off glass."
            : "E < V₀: everything reflects (R = 1), yet the wave function leaks into the barrier as e^{−κx}. This evanescent tail foreshadows tunneling — if the barrier had finite thickness, the tail could reach the far side."}
      </Note>
    </Card>
  );
}

// -- R,T curve vs E/V0 (slide figure) ------------------------
function RTCurveCard({ isKo }) {
  const W = 620, H = 280, pad = 48;
  const { X, Y } = usePlotScale(1, 7, 0, 1.05, W, H, pad);
  const Tp = [], Rp = [];
  for (let i = 0; i <= 240; i++) {
    const rr = 1.0001 + 6 * i / 240;
    const k1 = Math.sqrt(rr), k2 = Math.sqrt(rr - 1);
    Tp.push([rr, 4 * k1 * k2 / ((k1 + k2) * (k1 + k2))]);
    Rp.push([rr, ((k1 - k2) / (k1 + k2)) ** 2]);
  }
  return (
    <Card>
      <H2>{isKo ? "계단의 R·T 곡선 (강의 슬라이드 재현)" : "Step R & T curves (from the lecture)"}</H2>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ ...svgBox(W), flex: "none", width: "100%", maxWidth: W }}>
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#334155" />
        <line x1={pad} y1={pad - 6} x2={pad} y2={H - pad} stroke="#334155" />
        <line x1={pad} y1={Y(1)} x2={W - pad} y2={Y(1)} stroke="#475569" strokeDasharray="4 4" />
        {[1, 2, 3, 4, 5, 6, 7].map(v => (
          <text key={v} x={X(v)} y={H - pad + 15} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>
        ))}
        <text x={W - pad} y={H - pad + 30} fill={C.textDim} fontSize={11} textAnchor="end">E / V₀</text>
        <path d={pathOf(Tp, X, Y)} fill="none" stroke={C.ok} strokeWidth={2.4} />
        <path d={pathOf(Rp, X, Y)} fill="none" stroke={C.err} strokeWidth={2.4} />
        <text x={X(2.2)} y={Y(0.93)} fill={C.ok} fontSize={13} fontWeight={800}>T</text>
        <text x={X(2.2)} y={Y(0.1)} fill={C.err} fontSize={13} fontWeight={800}>R</text>
        <text x={X(5.2)} y={Y(0.55)} fill={C.textDim} fontSize={12}>T + R = 1</text>
      </svg>
      <Note>
        {isKo
          ? "E → V₀⁺에서 T → 0 (k₂ → 0: 넘어가도 멈춰버림), E ≫ V₀에서 T → 1 (대응원리 — 고전 극한 회복). k₂/k₁ = √(1 − V₀/E)."
          : "As E → V₀⁺, T → 0 (k₂ → 0: it barely crawls over), and for E ≫ V₀, T → 1 (correspondence principle — the classical limit returns). k₂/k₁ = √(1 − V₀/E)."}
      </Note>
    </Card>
  );
}

// -- finite barrier tunneling --------------------------------
function TunnelCard({ isKo }) {
  const [V0, setV0] = useState(5);      // eV
  const [E, setE] = useState(2);        // eV
  const [w, setW] = useState(0.5);      // nm
  const Ec = Math.min(E, V0 * 0.98);
  const kap = kappaNm(V0 - Ec);
  const s = Math.sinh(kap * w);
  const Tex = 1 / (1 + V0 * V0 * s * s / (4 * Ec * (V0 - Ec)));
  const Tap = 16 * (Ec / V0) * (1 - Ec / V0) * Math.exp(-2 * kap * w);

  // exact interior coefficients for the wave drawing (verified: continuity ~1e-16, |τ|² = T)
  const k = kappaNm(Ec);               // nm^-1 in region 1/3
  const ch = Math.cosh(kap * w), sh = s;
  const denom = cx(ch, 0.5 * (kap / k - k / kap) * sh);
  const tau = cDiv(cx(1, 0), denom);                                 // amplitude of e^{ik(x−w)}
  const rC = cMul(tau, cx(0, -0.5 * (kap / k + k / kap) * sh));      // reflected amplitude
  const Cc = cMul(tau, cx(0.5, 0.5 * k / kap));                      // coeff of e^{κ(x−w)}
  const Dd = cMul(tau, cx(0.5, -0.5 * k / kap));                     // coeff of e^{−κ(x−w)}

  const W_ = 720, H_ = 300, pad = 46;
  const span = Math.max(3 * w, 1.2);
  const xMin = -span, xMax = w + span;
  const pts = [];
  for (let i = 0; i <= 520; i++) {
    const x = xMin + (xMax - xMin) * i / 520;
    let re;
    if (x < 0) {
      re = Math.cos(k * x) + rC.re * Math.cos(k * x) + rC.im * Math.sin(k * x);
    } else if (x <= w) {
      const eP = Math.exp(kap * (x - w)), eM = Math.exp(-kap * (x - w));
      re = Cc.re * eP + Dd.re * eM;    // Re[C e^{κ(x−w)} + D e^{−κ(x−w)}]
    } else {
      re = tau.re * Math.cos(k * (x - w)) - tau.im * Math.sin(k * (x - w));
    }
    pts.push([x, re]);
  }
  const yAbs = Math.max(...pts.map(p => Math.abs(p[1]))) * 1.15;
  const { X, Y } = usePlotScale(xMin, xMax, -yAbs, yAbs, W_, H_, pad);

  const presets = [
    { lb: isKo ? "FET 게이트 (강의 예제)" : "FET gate (lecture)", v: [12, 6, 0.18] },
    { lb: "STM 1.0 nm", v: [5, 2, 1.0] },
    { lb: "STM 0.5 nm", v: [5, 2, 0.5] },
  ];

  return (
    <Card>
      <H2>{isKo ? "유한 장벽: 양자 터널링" : "Finite barrier: quantum tunneling"}</H2>
      <Eq>
        T = [1 + V₀² sinh²(κw) / 4E(V₀−E)]⁻¹  ≈  16(E/V₀)(1−E/V₀) e^{"{−2κw}"},   κ = √(2m(V₀−E))/ℏ
      </Eq>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", margin: "10px 0" }}>
        <Slider label="V₀" value={V0} min={1} max={15} step={0.5} onChange={setV0} unit=" eV" width={150} />
        <Slider label="E" value={E} min={0.2} max={Math.min(14.5, V0 - 0.2)} step={0.1} onChange={setE} unit=" eV" width={150} fmt={v => v.toFixed(1)} />
        <Slider label={isKo ? "폭 w" : "width w"} value={w} min={0.05} max={1.5} step={0.01} onChange={setW} unit=" nm" width={150} fmt={v => v.toFixed(2)} />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        {presets.map((p, i) => (
          <button key={i} onClick={() => { setV0(p.v[0]); setE(p.v[1]); setW(p.v[2]); }} style={{ ...btnStyle(), padding: "6px 12px", fontSize: 12 }}>{p.lb}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10, marginBottom: 12 }}>
        <Stat label="κ" value={`${kap.toFixed(2)} nm⁻¹`} color={C.purple} />
        <Stat label={isKo ? "T (정확식)" : "T (exact)"} value={Tex >= 1e-3 ? Tex.toFixed(4) : Tex.toExponential(2)} color={C.ok} />
        <Stat label={isKo ? "T (두꺼운 장벽 근사)" : "T (thick-barrier approx.)"} value={Tap >= 1e-3 ? Tap.toFixed(4) : Tap.toExponential(2)} color={C.cyan} />
        <Stat label="log₁₀ T" value={Math.log10(Tex).toFixed(2)} color={C.accent} />
      </div>
      <svg width={W_} height={H_} viewBox={`0 0 ${W_} ${H_}`} style={{ ...svgBox(W_), flex: "none", width: "100%" }}>
        <rect x={X(0)} y={pad - 6} width={X(w) - X(0)} height={H_ - 2 * pad + 6} fill="rgba(167,139,250,0.14)" stroke="rgba(167,139,250,0.5)" />
        <text x={(X(0) + X(w)) / 2} y={pad + 10} fill={C.purple} fontSize={11} textAnchor="middle">V₀</text>
        <line x1={pad} y1={Y(0)} x2={W_ - pad} y2={Y(0)} stroke="#273244" />
        <path d={pathOf(pts, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.2} />
        <text x={X(xMin + 0.1 * span)} y={pad + 10} fill={C.textDim} fontSize={10.5}>{isKo ? "입사+반사" : "incident + reflected"}</text>
        <text x={X(w + 0.35 * span)} y={pad + 10} fill={C.ok} fontSize={10.5}>{isKo ? "투과 (진폭 √T)" : "transmitted (amplitude √T)"}</text>
      </svg>
      <Note>
        {isKo
          ? `강의 예제 검증: FET 프리셋에서 κ = 12.55 nm⁻¹, T = 0.0427 (슬라이드 값 0.044) — 게이트 산화막이 0.18 nm면 전자의 4%가 새어나갑니다. 트랜지스터 미세화의 근본 한계입니다. STM 프리셋: w를 1.0 → 0.5 nm로 줄이면 T가 ~7×10⁻⁸ → ~5×10⁻⁴로 7,000배 뛰는 지수 민감도가 원자 하나(~0.01 nm)의 높이 차도 전류로 구별하게 해줍니다.`
          : `Lecture check: the FET preset gives κ = 12.55 nm⁻¹, T = 0.0427 (slide: 0.044) — with a 0.18 nm gate oxide, 4% of electrons leak through: the fundamental limit of transistor scaling. STM presets: shrinking w from 1.0 to 0.5 nm boosts T from ~7×10⁻⁸ to ~5×10⁻⁴ — a 7,000× jump whose exponential sensitivity lets the STM resolve single-atom (~0.01 nm) height differences as current.`}
      </Note>
      <Note>
        {isKo
          ? "장벽 안(보라 영역)에서 파동함수는 진동하지 않고 지수적으로 감쇠하며, 반대편에서 같은 파장·작아진 진폭으로 다시 진동합니다 — 슬라이드의 그림 그대로입니다. Gamow는 1928년 이 수학으로 α 붕괴 수명이 왜 10⁻⁷초에서 10¹⁰년까지 걸치는지 설명했습니다: 지수함수의 위력입니다."
          : "Inside the barrier (purple) the wave doesn't oscillate — it decays exponentially, re-emerging with the same wavelength but smaller amplitude, exactly as in the lecture figure. In 1928 Gamow used this to explain why α-decay lifetimes span 10⁻⁷ s to 10¹⁰ years: the power of the exponential."}
      </Note>
    </Card>
  );
}

// =============================================================
// 4) PARTICLE IN A BOX — states, expansion, measurement
// =============================================================
function BoxTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <Card>
        <H2>{isKo ? "상자 속 입자: 해석해" : "Particle in a box: the analytic solution"}</H2>
        <Eq>ψₙ(x) = √(2/L) sin(nπx/L),   Eₙ = n²π²ℏ²/2mL²,   n = 1, 2, 3, …</Eq>
        <Note>
          {isKo
            ? "지난주 FDM 고유값 풀이가 수치로 찾아냈던 바로 그 해입니다 — 이번 주는 종이와 연필로 정확하게 얻습니다. 경계조건 ψ(0) = ψ(L) = 0이 sin만 남기고 k = nπ/L로 양자화합니다. n = 0은 ψ ≡ 0 (입자 없음)이라 금지 — 최소 에너지 E₁ > 0, 영점에너지입니다: 양자역학에서 입자는 완전히 멈출 수 없습니다."
            : "This is exactly what last week's FDM eigensolver found numerically — this week we get it exactly with pen and paper. The boundary conditions ψ(0) = ψ(L) = 0 keep only sines and quantize k = nπ/L. n = 0 gives ψ ≡ 0 (no particle), so the minimum energy E₁ > 0 is the zero-point energy: a quantum particle can never be completely stopped."}
        </Note>
        <EigenLadder isKo={isKo} />
      </Card>
      <ExpansionLab isKo={isKo} />
      <UncertaintyCard isKo={isKo} />
    </div>
  );
}

function EigenLadder({ isKo }) {
  const [nSel, setNSel] = useState(2);
  const W = 700, H = 300, pad = 46;
  const nMax = 6;
  const Emax = nMax * nMax;
  const { X, Y } = usePlotScale(0, 1, 0, Emax * 1.06, W, H, pad);
  const psiPts = [];
  for (let i = 0; i <= 240; i++) {
    const x = i / 240;
    psiPts.push([x, nSel * nSel + 4.4 * Math.sqrt(2) * Math.sin(nSel * Math.PI * x)]);
  }
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "8px 0" }}>
        {[1, 2, 3, 4, 5, 6].map(n => (
          <button key={n} onClick={() => setNSel(n)} style={{ ...btnStyle(nSel === n), padding: "6px 13px" }}>n = {n}</button>
        ))}
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ ...svgBox(W), flex: "none", width: "100%" }}>
        <line x1={X(0)} y1={pad - 6} x2={X(0)} y2={H - pad} stroke={C.border} strokeWidth={2} />
        <line x1={X(1)} y1={pad - 6} x2={X(1)} y2={H - pad} stroke={C.border} strokeWidth={2} />
        <line x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(0)} stroke={C.border} strokeWidth={2} />
        {Array.from({ length: nMax }, (_, i) => i + 1).map(n => (
          <g key={n}>
            <line x1={X(0.03)} y1={Y(n * n)} x2={X(0.97)} y2={Y(n * n)}
              stroke={n === nSel ? C.accent : "#3b4a61"} strokeWidth={n === nSel ? 2.2 : 1.2}
              strokeDasharray={n === nSel ? "" : "5 5"} />
            <text x={X(1) + 8} y={Y(n * n) + 4} fill={n === nSel ? C.accent : C.textDim} fontSize={11}
              fontFamily="'JetBrains Mono',monospace">E{n} = {n * n}E₁</text>
          </g>
        ))}
        <path d={pathOf(psiPts, X, Y)} fill="none" stroke={C.cyan} strokeWidth={2.4} />
        <text x={X(0.5)} y={pad - 12} fill={C.cyan} fontSize={12} textAnchor="middle">
          ψ{nSel}(x): {nSel - 1} {isKo ? "개의 마디" : (nSel === 2 ? "node" : "nodes")}
        </text>
      </svg>
      <Note>
        {isKo
          ? "간격이 n²으로 벌어지는 사다리 — 마디 수 = n − 1. L이 작을수록(구속이 강할수록) 사다리 전체가 1/L²로 치솟습니다. 이 스케일링이 뒤의 양자점 색을 결정합니다."
          : "A ladder whose rungs spread as n² — with n − 1 nodes each. Shrinking L scales the whole ladder up as 1/L²; this scaling will set quantum-dot colors later."}
      </Note>
    </div>
  );
}

// -- basis expansion & measurement ---------------------------
function ExpansionLab({ isKo }) {
  const [Nsum, setNsum] = useState(1);
  const L = 1;
  // c_n for f = sqrt(30) x (x - 1): analytic  c_n = -8*sqrt(15)/(n^3 pi^3) (odd n)
  const NC = 15;
  const cn = useMemo(() => Array.from({ length: NC }, (_, i) => {
    const n = i + 1;
    return n % 2 === 1 ? -8 * Math.sqrt(15) / (n ** 3 * Math.PI ** 3) : 0;
  }), []);
  const En = n => n * n * Math.PI * Math.PI / 2;
  const parseval = cn.reduce((s, c) => s + c * c, 0);
  const Emean = cn.reduce((s, c, i) => s + c * c * En(i + 1), 0);

  const W = 460, H = 260, pad = 42;
  const { X, Y } = usePlotScale(0, 1, -1.45, 0.15, W, H, pad);
  const fPts = [], gPts = [];
  for (let i = 0; i <= 240; i++) {
    const x = i / 240;
    fPts.push([x, Math.sqrt(30) * x * (x - 1)]);
    let g = 0;
    for (let n = 1; n <= Nsum; n++) g += cn[n - 1] * Math.sqrt(2) * Math.sin(n * Math.PI * x);
    gPts.push([x, g]);
  }
  // stem plot scale (log)
  const W2 = 460, H2 = 260, pad2 = 42;
  const logMap = v => Math.max(Math.log10(Math.max(v, 1e-9)), -8);
  const P2 = usePlotScale(0.5, NC + 0.5, -8, 0.3, W2, H2, pad2);

  const rows = [1, 3, 5, 7].map(n => ({
    n, c: cn[n - 1], p: cn[n - 1] ** 2, E: En(n),
  }));

  return (
    <Card>
      <H2>{isKo ? "기저함수 전개 실험실: 측정은 무엇을 주는가" : "Basis-expansion lab: what does a measurement return?"}</H2>
      <Eq>
        |f⟩ = √30 x(x−L) = Σ cₙ|n⟩,   cₙ = ⟨n|f⟩ = −8√15/(n³π³) ({isKo ? "홀수 n만" : "odd n only"}),   ⟨E⟩ = Σ|cₙ|²Eₙ
      </Eq>
      <Note>
        {isKo
          ? "f는 경계조건과 정규화를 만족하는 멀쩡한 파동함수지만 Ĥ의 고유상태가 아닙니다. 에너지를 재면 무엇이 나올까요? 항상 고유값 중 하나 Eₙ이, 확률 |cₙ|²으로 나옵니다 — 측정 공준입니다. 여러 번 재서 평균하면 ⟨E⟩ = Σ|cₙ|²Eₙ으로 수렴합니다."
          : "f is a perfectly legal wave function (right BCs, normalized) but not an eigenstate of Ĥ. What does an energy measurement give? Always one of the eigenvalues Eₙ, with probability |cₙ|² — the measurement postulate. Repeat many times and the average converges to ⟨E⟩ = Σ|cₙ|²Eₙ."}
      </Note>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", margin: "10px 0" }}>
        <Slider label={isKo ? "부분합 N" : "partial sum N"} value={Nsum} min={1} max={NC} step={1} onChange={setNsum} width={190} />
        <Pill color={C.ok}>Σ|cₙ|² = {parseval.toFixed(6)} → 1 (Parseval)</Pill>
        <Pill color={C.accent}>⟨E⟩ = {Emean.toFixed(4)} → 5 ℏ²/mL²</Pill>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={svgBox(W)}>
          <line x1={pad} y1={Y(0)} x2={W - pad} y2={Y(0)} stroke="#334155" />
          <path d={pathOf(fPts, X, Y)} fill="none" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 4" />
          <path d={pathOf(gPts, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.4} />
          <text x={W / 2} y={pad - 8} fill={C.text} fontSize={12} textAnchor="middle" fontWeight={700}>
            f(x) {isKo ? "vs 부분합" : "vs partial sum"} (N = {Nsum})
          </text>
          <text x={W - pad} y={H - pad + 16} fill={C.textDim} fontSize={11} textAnchor="end">x/L</text>
        </svg>
        <svg width={W2} height={H2} viewBox={`0 0 ${W2} ${H2}`} style={svgBox(W2)}>
          {cn.map((c, i) => {
            const n = i + 1, v = c * c;
            const y0 = P2.Y(-8), y1 = P2.Y(logMap(v));
            return (
              <g key={n}>
                <line x1={P2.X(n)} y1={y0} x2={P2.X(n)} y2={y1}
                  stroke={n <= Nsum ? C.accent : "#3b4a61"} strokeWidth={7} />
                {v > 1e-9 && <text x={P2.X(n)} y={y1 - 5} fill={C.textDim} fontSize={8.5} textAnchor="middle">
                  {v > 1e-3 ? v.toFixed(3) : v.toExponential(0)}
                </text>}
              </g>
            );
          })}
          {[1, 5, 10, 15].map(n => (
            <text key={n} x={P2.X(n)} y={H2 - pad2 + 15} fill={C.textDim} fontSize={10} textAnchor="middle">{n}</text>
          ))}
          <text x={W2 / 2} y={pad2 - 8} fill={C.text} fontSize={12} textAnchor="middle" fontWeight={700}>
            |cₙ|² ({isKo ? "로그 눈금 · 측정 확률" : "log scale · measurement probabilities"})
          </text>
          <text x={W2 - pad2} y={H2 - pad2 + 15} fill={C.textDim} fontSize={10} textAnchor="end">n</text>
        </svg>
      </div>
      <div style={{ overflowX: "auto", marginTop: 10 }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12.5, fontFamily: "'JetBrains Mono',monospace", minWidth: 480 }}>
          <thead>
            <tr style={{ color: C.textDim }}>
              {["n", "cₙ", `|cₙ|² ${isKo ? "(확률)" : "(prob.)"}`, "Eₙ [ℏ²/mL²]", "|cₙ|²Eₙ"].map(h => (
                <th key={h} style={{ padding: "6px 14px", borderBottom: `1px solid ${C.border}`, textAlign: "right" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.n} style={{ color: C.text }}>
                <td style={{ padding: "5px 14px", textAlign: "right", color: C.accent }}>{r.n}</td>
                <td style={{ padding: "5px 14px", textAlign: "right" }}>{r.c.toFixed(6)}</td>
                <td style={{ padding: "5px 14px", textAlign: "right", color: C.ok }}>{r.p.toFixed(6)}</td>
                <td style={{ padding: "5px 14px", textAlign: "right" }}>{r.E.toFixed(3)}</td>
                <td style={{ padding: "5px 14px", textAlign: "right", color: C.accentSoft }}>{(r.p * r.E).toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note>
        {isKo
          ? "N = 1만으로도 이미 |c₁|² = 99.86% — f는 거의 바닥상태입니다. 짝수 n이 전부 0인 이유: f는 상자 중심에 대해 대칭(우함수)인데 짝수 ψₙ은 반대칭이라 내적이 사라집니다. 대칭성이 계산을 공짜로 해주는 첫 사례 — 나중에 분광학 선택규칙으로 다시 만납니다."
          : "N = 1 alone already carries |c₁|² = 99.86% — f is almost the ground state. Why do all even n vanish? f is symmetric about the box center while even-n states are antisymmetric, so the inner product dies. Symmetry doing the work for free — we'll meet this again as spectroscopic selection rules."}
      </Note>
    </Card>
  );
}

// -- uncertainty product for eigenstates ---------------------
function UncertaintyCard({ isKo }) {
  const [n, setN] = useState(1);
  const sx = Math.sqrt(1 / 12 - 1 / (2 * n * n * Math.PI * Math.PI));
  const sp = n * Math.PI;
  const prod = sx * sp;
  const W = 620, H = 240, pad = 46;
  const { X, Y } = usePlotScale(0.5, 8.5, 0, 8, W, H, pad);
  const pts = Array.from({ length: 8 }, (_, i) => {
    const m = i + 1;
    return [m, Math.sqrt(1 / 12 - 1 / (2 * m * m * Math.PI * Math.PI)) * m * Math.PI];
  });
  return (
    <Card>
      <H2>{isKo ? "고유상태의 불확정성 곱: 한계 위에서" : "Uncertainty product of eigenstates: above the bound"}</H2>
      <Eq>σ(x) = L√(1/12 − 1/2n²π²),   σ(p) = nπℏ/L   →   σ(x)σ(p) = ℏ√(n²π²/12 − 1/2)</Eq>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", margin: "8px 0" }}>
        <Slider label="n" value={n} min={1} max={8} step={1} onChange={setN} width={170} />
        <Pill color={C.accent}>σ(x) = {sx.toFixed(4)} L</Pill>
        <Pill color={C.pink}>σ(p) = {sp.toFixed(3)} ℏ/L</Pill>
        <Pill color={prod > 0.5 ? C.ok : C.err}>σ(x)σ(p) = {prod.toFixed(4)} ℏ ≥ 0.5 ℏ ✓</Pill>
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ ...svgBox(W), flex: "none", width: "100%", maxWidth: W }}>
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#334155" />
        <line x1={pad} y1={Y(0.5)} x2={W - pad} y2={Y(0.5)} stroke={C.err} strokeDasharray="5 4" />
        <text x={W - pad - 4} y={Y(0.5) - 6} fill={C.err} fontSize={10.5} textAnchor="end">ℏ/2 (Heisenberg)</text>
        {pts.map(([m, v]) => (
          <g key={m}>
            <circle cx={X(m)} cy={Y(v)} r={m === n ? 6 : 4} fill={m === n ? C.accent : "#3b4a61"} />
            <text x={X(m)} y={H - pad + 15} fill={C.textDim} fontSize={10} textAnchor="middle">{m}</text>
          </g>
        ))}
        <path d={pathOf(pts, X, Y)} fill="none" stroke="#3b4a61" strokeWidth={1.4} />
        <text x={W / 2} y={pad - 6} fill={C.text} fontSize={12} textAnchor="middle" fontWeight={700}>σ(x)σ(p)/ℏ vs n</text>
      </svg>
      <Note>
        {isKo
          ? "n = 1에서 0.5679 ℏ — 한계 ℏ/2보다 14% 위입니다 (Gaussian만이 등호를 만듭니다). n이 커질수록 곱은 거의 nπ/√12로 선형 증가: 마디가 많아져 운동량 성분이 넓게 퍼지기 때문입니다. 슬라이드의 '불확정성 원리 재확인'을 전 n에 대해 본 것입니다."
          : "At n = 1 the product is 0.5679 ℏ — 14% above the ℏ/2 bound (only Gaussians saturate it). For large n it grows almost linearly as nπ/√12: more nodes spread the momentum content. This is the lecture's 'uncertainty principle confirmed again', now for every n."}
      </Note>
    </Card>
  );
}

// =============================================================
// 5) DYNAMICS & 3D — superposition sloshing, 3D box, quantum dots
// =============================================================
function DynamicsTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <SuperposCard isKo={isKo} />
      <Box3DCard isKo={isKo} />
      <QuantumDotCard isKo={isKo} />
    </div>
  );
}

// -- time-dependent superposition ----------------------------
function SuperposCard({ isKo }) {
  const [theta, setTheta] = useState(0.464);   // c1=cosθ, c2=sinθ; 0.464 ≈ atan(1/2) → (2|1>+|2>)/√5
  const [stationary, setStationary] = useState(false);
  const [running, setRunning] = useState(true);
  const cvRef = useRef(null);
  const tRef = useRef(0);
  const E1 = Math.PI * Math.PI / 2, E2 = 4 * E1;
  const Tp = 2 * Math.PI / (E2 - E1);

  useEffect(() => {
    let raf;
    const draw = () => {
      const cv = cvRef.current; if (!cv) return;
      const ctx = cv.getContext("2d");
      const W = cv.width, H = cv.height;
      ctx.fillStyle = "#0d1117"; ctx.fillRect(0, 0, W, H);
      const t = tRef.current;
      const c1 = Math.cos(theta), c2 = Math.sin(theta);
      // walls
      ctx.strokeStyle = "#475569"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(20, 16); ctx.lineTo(20, H - 20); ctx.lineTo(W - 20, H - 20); ctx.lineTo(W - 20, 16); ctx.stroke();
      // density
      ctx.beginPath();
      for (let i = 0; i <= 300; i++) {
        const x = i / 300;
        const s1 = Math.SQRT2 * Math.sin(Math.PI * x);
        const s2 = Math.SQRT2 * Math.sin(2 * Math.PI * x);
        let rho;
        if (stationary) {
          rho = s1 * s1;                                          // any single |n>: static
        } else {
          const re = c1 * s1 * Math.cos(E1 * t) + c2 * s2 * Math.cos(E2 * t);
          const im = -c1 * s1 * Math.sin(E1 * t) - c2 * s2 * Math.sin(E2 * t);
          rho = re * re + im * im;
        }
        const px = 20 + (W - 40) * x;
        const py = H - 20 - rho * (H - 50) / 3.6;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 2.6; ctx.stroke();
      ctx.lineTo(W - 20, H - 20); ctx.lineTo(20, H - 20); ctx.closePath();
      ctx.fillStyle = "rgba(56,189,248,0.12)"; ctx.fill();
      // <x> marker
      if (!stationary) {
        let num = 0, den = 0;
        for (let i = 0; i <= 120; i++) {
          const x = i / 120;
          const s1 = Math.SQRT2 * Math.sin(Math.PI * x), s2 = Math.SQRT2 * Math.sin(2 * Math.PI * x);
          const re = c1 * s1 * Math.cos(E1 * t) + c2 * s2 * Math.cos(E2 * t);
          const im = -c1 * s1 * Math.sin(E1 * t) - c2 * s2 * Math.sin(E2 * t);
          const r = re * re + im * im;
          num += x * r; den += r;
        }
        const xm = num / den;
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath(); ctx.arc(20 + (W - 40) * xm, H - 20, 5, 0, 2 * Math.PI); ctx.fill();
        ctx.fillStyle = "#9ca3af"; ctx.font = "11px JetBrains Mono, monospace";
        ctx.fillText("⟨x⟩", 20 + (W - 40) * xm - 10, H - 30);
      }
      ctx.fillStyle = "#9ca3af"; ctx.font = "12px JetBrains Mono, monospace";
      ctx.fillText(stationary
        ? (isKo ? "정상상태 |1⟩: |ψ|² 은 시간에 불변" : "stationary |1⟩: |ψ|² frozen in time")
        : `t/T = ${((t / Tp) % 1).toFixed(2)}   ω₂₁ = (E₂−E₁)/ℏ`, 26, 16);
      if (running) tRef.current += 0.0022;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [theta, stationary, running, isKo]);

  const c1 = Math.cos(theta), c2 = Math.sin(theta);
  return (
    <Card>
      <H2>{isKo ? "시간의존 Schrödinger 방정식: 출렁이는 확률" : "Time-dependent Schrödinger: sloshing probability"}</H2>
      <Eq>|Ψ(t)⟩ = c₁e^{"{−iE₁t/ℏ}"}|1⟩ + c₂e^{"{−iE₂t/ℏ}"}|2⟩   →   |Ψ|² {isKo ? "은" : "has a"} cos(ω₂₁t) {isKo ? "항으로 진동" : "cross term"},  ω₂₁ = (E₂−E₁)/ℏ</Eq>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", margin: "8px 0" }}>
        <button onClick={() => setRunning(r => !r)} style={btnStyle(running)}>{running ? "■" : "▶"}</button>
        <button onClick={() => { tRef.current = 0; }} style={btnStyle()}>↺</button>
        <label style={chk()}>
          <input type="checkbox" checked={stationary} onChange={e => setStationary(e.target.checked)} />
          {isKo ? "정상상태만 보기" : "stationary state only"}
        </label>
        <Slider label={isKo ? "혼합각 θ" : "mixing θ"} value={theta} min={0} max={1.57} step={0.01} onChange={setTheta} width={160}
          fmt={v => `${Math.cos(v).toFixed(2)}|1⟩+${Math.sin(v).toFixed(2)}|2⟩`} />
      </div>
      <canvas ref={cvRef} width={760} height={210}
        style={{ width: "100%", maxWidth: 760, borderRadius: 10, border: `1px solid ${C.border}` }} />
      <Note>
        {isKo
          ? `강의의 (2|1⟩+|2⟩)/√5 예제가 기본값입니다 (c₁ = ${c1.toFixed(2)}, c₂ = ${c2.toFixed(2)}). 정상상태 하나만 있으면 위상 e^{−iEt/ℏ}가 |ψ|²에서 지워져 확률이 얼어붙지만, 두 상태를 겹치면 교차항이 살아남아 확률이 좌우로 출렁입니다. 이 진동하는 전하 분포가 곧 진동하는 쌍극자 — 원자가 빛을 흡수·방출하는 이유이며, 방출 진동수가 정확히 ω₂₁ = (E₂−E₁)/ℏ인 이유입니다 (Bohr 조건의 재발견!)`
          : `The lecture's (2|1⟩+|2⟩)/√5 is the default (c₁ = ${c1.toFixed(2)}, c₂ = ${c2.toFixed(2)}). A single stationary state's phase e^{−iEt/ℏ} cancels in |ψ|², freezing the probability; superpose two and the cross term survives — the density sloshes side to side. That oscillating charge is an oscillating dipole: why atoms absorb and emit light, and why the emitted frequency is exactly ω₂₁ = (E₂−E₁)/ℏ (Bohr's condition rediscovered!).`}
      </Note>
    </Card>
  );
}

// -- 3D box degeneracy ---------------------------------------
function Box3DCard({ isKo }) {
  const levels = useMemo(() => {
    const map = new Map();
    for (let nx = 1; nx <= 6; nx++)
      for (let ny = 1; ny <= 6; ny++)
        for (let nz = 1; nz <= 6; nz++) {
          const s = nx * nx + ny * ny + nz * nz;
          if (!map.has(s)) map.set(s, []);
          map.get(s).push(`(${nx},${ny},${nz})`);
        }
    return [...map.entries()].sort((a, b) => a[0] - b[0]).slice(0, 10);
  }, []);
  return (
    <Card>
      <H2>{isKo ? "3D 상자: 축퇴의 등장" : "3D box: degeneracy appears"}</H2>
      <Eq>E(nx,ny,nz) = (nx² + ny² + nz²) π²ℏ²/2mL²   ({isKo ? "정육면체" : "cube"}) — {isKo ? "양자수 3개!" : "three quantum numbers!"}</Eq>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12.5, fontFamily: "'JetBrains Mono',monospace", minWidth: 560 }}>
          <thead>
            <tr style={{ color: C.textDim }}>
              <th style={{ padding: "6px 12px", borderBottom: `1px solid ${C.border}`, textAlign: "right" }}>nx²+ny²+nz²</th>
              <th style={{ padding: "6px 12px", borderBottom: `1px solid ${C.border}`, textAlign: "right" }}>{isKo ? "축퇴도 g" : "degeneracy g"}</th>
              <th style={{ padding: "6px 12px", borderBottom: `1px solid ${C.border}`, textAlign: "left" }}>{isKo ? "상태들" : "states"}</th>
            </tr>
          </thead>
          <tbody>
            {levels.map(([s, states]) => (
              <tr key={s} style={{ color: C.text, background: s === 27 ? "rgba(56,189,248,0.08)" : "transparent" }}>
                <td style={{ padding: "4px 12px", textAlign: "right", color: C.accent }}>{s}</td>
                <td style={{ padding: "4px 12px", textAlign: "right", color: states.length > 1 ? C.ok : C.textDim }}>{states.length}</td>
                <td style={{ padding: "4px 12px", color: C.textDim }}>{states.join("  ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note>
        {isKo
          ? "대칭성(x·y·z 교환)이 축퇴를 낳습니다: (2,1,1)·(1,2,1)·(1,1,2)는 서로 다른 상태지만 같은 에너지. 강조된 27은 특별합니다 — (3,3,3)과 (5,1,1)형이 순열로는 연결되지 않는데도 우연히 같은 에너지를 갖는 '우연 축퇴'입니다. 원자 오비탈의 s·p·d 축퇴, 그리고 화학 결합의 방향성이 모두 이 대칭성 이야기의 연장선입니다."
          : "Symmetry (permuting x·y·z) creates degeneracy: (2,1,1)·(1,2,1)·(1,1,2) are distinct states with identical energy. The highlighted 27 is special — (3,3,3) and the (5,1,1) family share an energy without being permutations: an 'accidental degeneracy'. Atomic s·p·d degeneracies and the directionality of chemical bonds are continuations of this symmetry story."}
      </Note>
    </Card>
  );
}

// -- quantum dot color ---------------------------------------
function wavelengthToRGB(wl) {
  let r = 0, g = 0, b = 0;
  if (wl >= 380 && wl < 440) { r = -(wl - 440) / 60; b = 1; }
  else if (wl >= 440 && wl < 490) { g = (wl - 440) / 50; b = 1; }
  else if (wl >= 490 && wl < 510) { g = 1; b = -(wl - 510) / 20; }
  else if (wl >= 510 && wl < 580) { r = (wl - 510) / 70; g = 1; }
  else if (wl >= 580 && wl < 645) { r = 1; g = -(wl - 645) / 65; }
  else if (wl >= 645 && wl <= 780) { r = 1; }
  let f = 1;
  if (wl > 700) f = 0.3 + 0.7 * (780 - wl) / 80;
  if (wl < 420 && wl >= 380) f = 0.3 + 0.7 * (wl - 380) / 40;
  const q = v => Math.round(255 * Math.pow(Math.max(v * f, 0), 0.8));
  return `rgb(${q(r)},${q(g)},${q(b)})`;
}

function QuantumDotCard({ isKo }) {
  const [L, setL] = useState(4);      // nm
  // toy CdSe: Eg = Eg0 + (ħ²π²/2L²)(1/me* + 1/mh*),  (ħc)²π²/(2·mc²) with m* in me units
  const Eg0 = 1.74;                                       // eV (bulk CdSe)
  const conf = HBARC * HBARC * Math.PI * Math.PI / (2 * MC2) * (1 / 0.13 + 1 / 0.45) / (L * L);
  const Eg = Eg0 + conf;
  const wl = 1240 / Eg;                                   // nm
  const visible = wl >= 380 && wl <= 780;
  const color = visible ? wavelengthToRGB(wl) : (wl > 780 ? "#3d0f0f" : "#1b1040");
  const dots = [2.0, 2.6, 3.4, 4.5, 6.0, 8.5];
  return (
    <Card>
      <H2>{isKo ? "양자점: '3D 상자'가 만든 무지개 (2023 노벨 화학상)" : "Quantum dots: a rainbow from the '3D box' (Nobel 2023)"}</H2>
      <Eq>E_gap(L) ≈ E_bulk + (π²ℏ²/2L²)(1/mₑ* + 1/mₕ*),   λ = hc/E_gap = 1240 nm·eV / E_gap</Eq>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", margin: "10px 0" }}>
        <Slider label={isKo ? "점 크기 L" : "dot size L"} value={L} min={1.8} max={10} step={0.1} onChange={setL} unit=" nm" width={210} fmt={v => v.toFixed(1)} />
        <Pill color={C.purple}>{isKo ? "구속 에너지" : "confinement"} = {conf.toFixed(2)} eV</Pill>
        <Pill color={C.accent}>E_gap = {Eg.toFixed(2)} eV</Pill>
        <Pill color={C.ok}>λ = {wl.toFixed(0)} nm {visible ? "" : (wl > 780 ? "(IR)" : "(UV)")}</Pill>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap", margin: "6px 0 12px" }}>
        <div style={{
          width: Math.max(26, L * 9), height: Math.max(26, L * 9), borderRadius: "50%",
          background: `radial-gradient(circle at 35% 35%, ${color}, #0d1117 85%)`,
          boxShadow: visible ? `0 0 ${16 + L * 3}px ${color}` : "none",
          border: `1px solid ${C.border}`, transition: "all 0.15s",
        }} />
        <div style={{ fontSize: 12.5, color: C.textDim, lineHeight: 1.7 }}>
          {isKo ? "CdSe 토이 모델 · 발광색" : "toy CdSe model · emission color"}<br />
          <span style={{ color, fontWeight: 800, fontSize: 14 }}>{wl.toFixed(0)} nm</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          {dots.map(d => {
            const eg = Eg0 + HBARC * HBARC * Math.PI * Math.PI / (2 * MC2) * (1 / 0.13 + 1 / 0.45) / (d * d);
            const w2 = 1240 / eg;
            const cc = w2 >= 380 && w2 <= 780 ? wavelengthToRGB(w2) : "#3d0f0f";
            return (
              <div key={d} style={{ textAlign: "center" }}>
                <div style={{
                  width: 8 + d * 3.4, height: 8 + d * 3.4, borderRadius: "50%", margin: "0 auto",
                  background: cc, boxShadow: `0 0 10px ${cc}`,
                }} />
                <div style={{ fontSize: 9.5, color: C.textDim, marginTop: 4 }}>{d} nm</div>
              </div>
            );
          })}
        </div>
      </div>
      <Note>
        {isKo
          ? "같은 물질(CdSe)인데 크기만 바꾸면 색이 변합니다 — E ∝ 1/L² 구속 에너지 때문입니다. 작을수록 상자가 좁아 에너지 갭이 커지고 빛이 파랗게, 클수록 빨갛게 이동합니다. 슬라이드의 형광 병 사진이 바로 이 원리이며, QLED TV·바이오 이미징이 상자 속 입자 공식의 상용화입니다. 화학공학자가 나노입자 합성 온도·시간으로 L을 제어한다는 점이 핵심입니다."
          : "Same material (CdSe), different size, different color — thanks to the 1/L² confinement energy. Smaller boxes mean bigger gaps and bluer light; larger dots glow red. The glowing vials in the lecture slide are exactly this, and QLED TVs and bio-imaging are the particle-in-a-box formula commercialized. The chemical engineer's job: controlling L via synthesis temperature and time."}
      </Note>
    </Card>
  );
}

// =============================================================
// 6) MATRIX MECHANICS
// =============================================================
function MatrixTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <Card>
        <H2>{isKo ? "1925년 헬골란트: 또 하나의 양자역학" : "Helgoland, 1925: the other quantum mechanics"}</H2>
        <Note>
          {isKo
            ? "Schrödinger의 파동방정식보다 1년 앞서, 23세의 Heisenberg는 꽃가루 알레르기를 피해 북해의 헬골란트 섬에서 급진적인 아이디어를 밀어붙였습니다: 전자 궤도처럼 관측 불가능한 것은 이론에서 지우고, 관측 가능한 전이 진동수와 세기만으로 역학을 다시 쓰자. 궤도 운동을 Fourier 급수로 쓰면 x(t)의 성분들이 두 개의 준위 첨자 (n, n−α)를 갖는 표가 되는데 — 이 표들의 곱셈 규칙이 정확히 행렬 곱셈이었습니다. Born과 Jordan이 이를 다듬어 근본 관계식에 도달합니다:"
            : "A year before Schrödinger's wave equation, the 23-year-old Heisenberg — exiled to the North-Sea island of Helgoland by hay fever — pushed a radical idea: erase unobservables like electron orbits and rebuild mechanics from observable transition frequencies and intensities alone. Writing orbital motion as a Fourier series turns the components of x(t) into a table indexed by two levels (n, n−α) — and the multiplication rule for these tables is exactly matrix multiplication. Born and Jordan polished this into the fundamental relation:"}
        </Note>
        <Eq>[q̂, p̂] = q̂p̂ − p̂q̂ = iℏ   ({isKo ? "Born–Jordan의 강한 양자화 조건 · 1주차의 '1차 양자화'" : "Born–Jordan's strong quantization condition · Week 1's 'first quantization'"})</Eq>
        <Note>
          {isKo
            ? "지난주 FDM에서 우리는 미분연산자 d²/dx²를 행렬로 바꿔 컴퓨터로 풀었습니다. Heisenberg는 그것이 수치 기법이 아니라 자연의 문법이라고 선언한 셈입니다: 위치와 운동량 자체가 (무한) 행렬이고, 행렬이라서 qp ≠ pq — 이 비가환성이 양자역학의 전부입니다. 아래에서 직접 확인해 봅시다."
            : "Last week's FDM turned the differential operator d²/dx² into a matrix so a computer could solve it. Heisenberg effectively declared this is not a numerical trick but nature's grammar: position and momentum ARE (infinite) matrices, and matrices don't commute — qp ≠ pq. That non-commutativity is the whole of quantum mechanics. Let's verify it directly below."}
        </Note>
      </Card>
      <CommutatorLab isKo={isKo} />
      <UncertaintyDerivCard isKo={isKo} />
    </div>
  );
}

// -- numerical [X,P] in the box basis ------------------------
function CommutatorLab({ isKo }) {
  const [Nb, setNb] = useState(12);
  const { M, X12 } = useMemo(() => {
    const Ng = 1201, L = 1, hbar = 1;
    const xs = Array.from({ length: Ng }, (_, i) => L * i / (Ng - 1));
    const h = xs[1] - xs[0];
    const psi = [], dpsi = [];
    for (let n = 1; n <= Nb; n++) {
      psi.push(xs.map(x => Math.SQRT2 * Math.sin(n * Math.PI * x)));
      dpsi.push(xs.map(x => Math.SQRT2 * n * Math.PI * Math.cos(n * Math.PI * x)));
    }
    const trap = arr => {
      let sum = 0;
      for (let i = 0; i < Ng; i++) sum += (i === 0 || i === Ng - 1 ? 0.5 : 1) * arr[i];
      return sum * h;
    };
    const Xm = [], Pi = [];
    for (let m = 0; m < Nb; m++) {
      Xm.push([]); Pi.push([]);
      for (let n = 0; n < Nb; n++) {
        Xm[m].push(trap(xs.map((x, i) => psi[m][i] * x * psi[n][i])));
        Pi[m].push(-hbar * trap(xs.map((_, i) => psi[m][i] * dpsi[n][i])));
      }
    }
    // M = X·Pi − Pi·X = Im(XP − PX)  (since P = i·Pi, X real)
    const Mm = [];
    for (let i = 0; i < Nb; i++) {
      Mm.push([]);
      for (let j = 0; j < Nb; j++) {
        let s = 0;
        for (let k = 0; k < Nb; k++) s += Xm[i][k] * Pi[k][j] - Pi[i][k] * Xm[k][j];
        Mm[i].push(s);
      }
    }
    return { M: Mm, X12: Xm[0][1] };
  }, [Nb]);

  const cell = Math.min(22, Math.floor(300 / Nb));
  const heat = v => {
    const t = Math.max(-1, Math.min(1, v));
    return t >= 0
      ? `rgba(56,189,248,${(0.08 + 0.85 * t).toFixed(2)})`
      : `rgba(239,68,68,${(0.08 + 0.85 * -t).toFixed(2)})`;
  };
  const W = 620, H = 250, pad = 46;
  const { X, Y } = usePlotScale(0.5, Nb + 0.5, -0.3, 1.35, W, H, pad);
  const dPts = M.map((row, i) => [i + 1, Math.max(-0.3, Math.min(1.35, row[i]))]);

  return (
    <Card>
      <H2>{isKo ? "교환자 실험실: [X, P] = iℏ 를 눈으로 보기" : "Commutator lab: seeing [X, P] = iℏ"}</H2>
      <Eq>X_mn = ⟨m|x̂|n⟩,  P_mn = ⟨m|p̂|n⟩ = i·Π_mn   →   Im(XP − PX) = XΠ − ΠX  →  ℏ·I ?</Eq>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", margin: "8px 0" }}>
        <Slider label={isKo ? "행렬 크기 N" : "matrix size N"} value={Nb} min={4} max={20} step={1} onChange={setNb} width={190} />
        <Pill color={C.accent}>X₁₂ = {X12.toFixed(5)} ({isKo ? "해석값" : "analytic"} −8·2/9π² = {(-16 / (9 * Math.PI * Math.PI)).toFixed(5)})</Pill>
      </div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 6 }}>
            Im(XP−PX)/ℏ {isKo ? "히트맵 (파랑 = +1)" : "heatmap (blue = +1)"}
          </div>
          <div style={{ display: "inline-block", background: "#0d1117", padding: 8, borderRadius: 10, border: `1px solid ${C.border}` }}>
            {M.map((row, i) => (
              <div key={i} style={{ display: "flex" }}>
                {row.map((v, j) => (
                  <div key={j} title={`(${i + 1},${j + 1}): ${v.toFixed(3)}`}
                    style={{ width: cell, height: cell, background: heat(v), borderRadius: 2, margin: 0.5 }} />
                ))}
              </div>
            ))}
          </div>
        </div>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ ...svgBox(W), flex: "1 1 320px" }}>
          <line x1={pad} y1={Y(0)} x2={W - pad} y2={Y(0)} stroke="#334155" />
          <line x1={pad} y1={Y(1)} x2={W - pad} y2={Y(1)} stroke={C.ok} strokeDasharray="5 4" />
          <text x={W - pad - 4} y={Y(1) - 6} fill={C.ok} fontSize={10.5} textAnchor="end">ℏ</text>
          {dPts.map(([n, v]) => (
            <circle key={n} cx={X(n)} cy={Y(v)} r={4} fill={v > 0.97 && v < 1.03 ? C.accent : C.err} />
          ))}
          <path d={pathOf(dPts, X, Y)} fill="none" stroke="#3b4a61" strokeWidth={1.3} />
          <text x={W / 2} y={pad - 6} fill={C.text} fontSize={12} textAnchor="middle" fontWeight={700}>
            {isKo ? "대각성분" : "diagonal"} Im[X,P]ₙₙ/ℏ
          </text>
          {[1, Math.round(Nb / 2), Nb].map(n => (
            <text key={n} x={X(n)} y={H - pad + 15} fill={C.textDim} fontSize={10} textAnchor="middle">{n}</text>
          ))}
        </svg>
      </div>
      <Note>
        {isKo
          ? "내부(n ≪ N)에서는 대각성분이 정확히 1·ℏ — Born-Jordan 조건이 수치로 재현됩니다 (N = 20, n = 1이면 0.9999). 그러나 n이 N에 가까워지면 급격히 무너집니다(마지막 성분은 음수까지!). 잘려나간 행렬은 X·P 곱에 필요한 높은 상태들을 잃기 때문입니다. Heisenberg의 행렬이 반드시 무한차원이어야 하는 이유이자, 유한 기저를 쓰는 모든 양자화학 계산(basis set!)이 안는 근본 오차의 축소판입니다."
          : "In the interior (n ≪ N) the diagonal is exactly 1·ℏ — Born-Jordan reproduced numerically (0.9999 at n = 1 for N = 20). But it collapses as n approaches N (the last element even goes negative!): a truncated matrix loses the high states the X·P product needs. This is why Heisenberg's matrices must be infinite — and a miniature of the basis-set error inherent in every quantum-chemistry calculation."}
      </Note>
    </Card>
  );
}

// -- uncertainty from Cauchy-Schwarz -------------------------
function UncertaintyDerivCard({ isKo }) {
  const steps = isKo ? [
    ["1", "요동 연산자 정의: Âf = Â − ⟨Â⟩, B̂f = B̂ − ⟨B̂⟩, 그리고 [Âf, B̂f] = [Â, B̂] = iĈ."],
    ["2", "분산은 내적: (ΔA)² = ⟨ψ|Âf²|ψ⟩ = ⟨Âfψ|Âfψ⟩ — 벡터 Âfψ의 길이 제곱."],
    ["3", "Cauchy–Schwarz: ⟨α|α⟩⟨β|β⟩ ≥ |⟨α|β⟩|² 를 α = Âfψ, β = B̂fψ에 적용."],
    ["4", "⟨ψ|ÂfB̂f|ψ⟩를 대칭(실수)+반대칭(허수) 부분으로 쪼개면 |·|² ≥ ¼|⟨[Â,B̂]⟩|²."],
    ["5", "결론: ΔA·ΔB ≥ ½|⟨[Â, B̂]⟩|. [q̂,p̂] = iℏ를 넣으면 Δq·Δp ≥ ℏ/2."],
  ] : [
    ["1", "Define fluctuation operators: Âf = Â − ⟨Â⟩, B̂f = B̂ − ⟨B̂⟩, with [Âf, B̂f] = [Â, B̂] = iĈ."],
    ["2", "Variances are inner products: (ΔA)² = ⟨ψ|Âf²|ψ⟩ = ⟨Âfψ|Âfψ⟩ — squared length of Âfψ."],
    ["3", "Cauchy–Schwarz: ⟨α|α⟩⟨β|β⟩ ≥ |⟨α|β⟩|² with α = Âfψ, β = B̂fψ."],
    ["4", "Split ⟨ψ|ÂfB̂f|ψ⟩ into symmetric (real) + antisymmetric (imaginary) parts: |·|² ≥ ¼|⟨[Â,B̂]⟩|²."],
    ["5", "Hence ΔA·ΔB ≥ ½|⟨[Â, B̂]⟩|. Insert [q̂,p̂] = iℏ: Δq·Δp ≥ ℏ/2."],
  ];
  return (
    <Card>
      <H2>{isKo ? "불확정성 원리는 정리다: Cauchy-Schwarz 5단계" : "The uncertainty principle is a theorem: Cauchy-Schwarz in 5 steps"}</H2>
      {steps.map(([n, s]) => (
        <div key={n} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 9, fontSize: 13.5, lineHeight: 1.65 }}>
          <span style={{
            minWidth: 24, height: 24, borderRadius: "50%", background: "rgba(167,139,250,0.15)",
            color: C.purple, fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
          }}>{n}</span>
          <span style={{ color: C.text, fontFamily: s.includes("⟨") ? "'DM Sans','Noto Sans KR',sans-serif" : undefined }}>{s}</span>
        </div>
      ))}
      <Eq>ΔA·ΔB ≥ ½|⟨[Â, B̂]⟩|   →   Δq·Δp ≥ ℏ/2,   ΔE·Δt ≥ ℏ/2</Eq>
      <Note>
        {isKo
          ? "측정 기기의 한계가 아니라 비가환 연산자의 수학적 귀결입니다 — 벡터 두 개가 이루는 각도에 대한 Cauchy-Schwarz 부등식과 같은 급의 사실입니다. 교환자가 0인 짝(예: x̂와 p̂y)은 동시에 정밀 측정 가능; iℏ인 짝은 불가능합니다. 에너지-시간 버전 ΔE·Δt ≥ ℏ/2는 스펙트럼 선폭과 들뜬상태 수명을 묶어줍니다 — 분광학에서 다시 만납니다."
          : "Not a limitation of instruments but a mathematical consequence of non-commuting operators — a fact of the same rank as Cauchy-Schwarz itself. Pairs that commute (e.g., x̂ and p̂y) can be measured sharply together; pairs with iℏ cannot. The energy-time version ΔE·Δt ≥ ℏ/2 ties spectral linewidths to excited-state lifetimes — we'll meet it again in spectroscopy."}
      </Note>
    </Card>
  );
}

// =============================================================
// 7) PRACTICE PROBLEMS
// =============================================================
function Practice({ lang }) {
  const isKo = lang === "ko";
  const problems = [
    {
      ko: {
        q: "P1. Gaussian 파속 ψ(x) = (1/2πε)^{1/4} e^{−x²/4ε}에 대해 σ(x), σ(p)를 각각 계산하고 σ(x)σ(p) = ℏ/2임을 보이시오.",
        s: "|ψ(x)|²은 분산 ε인 Gaussian이므로 ⟨x⟩ = 0, ⟨x²⟩ = ε → σ(x) = √ε. Fourier 변환 φ(p) ∝ e^{−εp²/ℏ²}에서 |φ(p)|²은 분산 ℏ²/4ε인 Gaussian → σ(p) = ℏ/2√ε. 곱하면 σ(x)σ(p) = √ε · ℏ/2√ε = ℏ/2. Heisenberg 한계를 등호로 만족하는 최소 불확정성 상태이며, 등호는 Gaussian에서만 성립한다.",
      },
      en: {
        q: "P1. For the Gaussian packet ψ(x) = (1/2πε)^{1/4} e^{−x²/4ε}, compute σ(x) and σ(p) and show σ(x)σ(p) = ℏ/2.",
        s: "|ψ(x)|² is a Gaussian of variance ε, so ⟨x⟩ = 0, ⟨x²⟩ = ε → σ(x) = √ε. The Fourier transform φ(p) ∝ e^{−εp²/ℏ²} gives |φ(p)|² of variance ℏ²/4ε → σ(p) = ℏ/2√ε. The product is √ε · ℏ/2√ε = ℏ/2: a minimum-uncertainty state, with equality unique to Gaussians.",
      },
    },
    {
      ko: {
        q: "P2. 전자를 σ(x) = 0.1 nm로 가둔 파속의 폭이 두 배가 되는 시간을 구하시오. (ε = σ², σx(t)² = ε + ℏ²t²/4m²ε)",
        s: "σx(t) = 2√ε 조건은 ε + ℏ²t²/4m²ε = 4ε → ℏt/2mε = √3 → t = 2√3 mε/ℏ. ε = (10⁻¹⁰ m)² = 10⁻²⁰ m², m = 9.11×10⁻³¹ kg 대입: t = 2(1.732)(9.11×10⁻³¹)(10⁻²⁰)/1.055×10⁻³⁴ ≈ 3.0×10⁻¹⁶ s ≈ 0.3 fs. 원자 스케일 전자는 순식간에 퍼진다 — 반면 1 g 먼지는 같은 조건에서 우주 나이보다 오래 걸린다 (m이 분자에!).",
      },
      en: {
        q: "P2. An electron packet starts with σ(x) = 0.1 nm. Find the time for its width to double. (ε = σ², σx(t)² = ε + ℏ²t²/4m²ε)",
        s: "σx(t) = 2√ε requires ε + ℏ²t²/4m²ε = 4ε → ℏt/2mε = √3 → t = 2√3 mε/ℏ. With ε = 10⁻²⁰ m², m = 9.11×10⁻³¹ kg: t ≈ 3.0×10⁻¹⁶ s ≈ 0.3 fs. An atomic-scale electron spreads almost instantly — while a 1 g dust grain would take longer than the age of the universe (m sits in the numerator!).",
      },
    },
    {
      ko: {
        q: "P3. 퍼텐셜 계단에서 E = 2V₀인 전자의 R과 T를 구하고 R + T = 1을 확인하시오.",
        s: "k₂/k₁ = √(1 − V₀/E) = √(1/2) = 0.7071. R = ((1 − 0.7071)/(1 + 0.7071))² = (0.2929/1.7071)² = 0.0294, T = 4(0.7071)/(1.7071)² = 0.9706. 합은 1.0000 ✓. 고전적으로는 R = 0이어야 하니 3%의 반사는 순수한 파동 효과 — E/V₀가 커질수록 R → 0으로 고전 극한을 회복한다.",
      },
      en: {
        q: "P3. At a potential step with E = 2V₀, find R and T and verify R + T = 1.",
        s: "k₂/k₁ = √(1 − V₀/E) = √½ = 0.7071. R = ((1 − 0.7071)/(1 + 0.7071))² = 0.0294, T = 4(0.7071)/(1.7071)² = 0.9706; sum = 1.0000 ✓. Classically R = 0, so the 3% reflection is purely a wave effect — and R → 0 as E/V₀ grows, recovering the classical limit.",
      },
    },
    {
      ko: {
        q: "P4. E = 4 eV 전자가 V₀ = 5 eV 계단에 부딪힌다(전반사). 침투깊이 δ = 1/κ를 구하시오.",
        s: "κ = √(2m(V₀−E))/ℏ = √(2·511000·1)/197.33 = 1011/197.33 ≈ 5.12 nm⁻¹ (실단위 공식: √(2mc²ΔE)/ℏc). δ = 1/κ ≈ 0.195 nm — 원자 두 개 정도 두께만큼 '금지 영역'에 스며든다. R = 1이라 결국 다 돌아오지만, 이 evanescent 꼬리가 존재하기에 장벽이 얇으면 터널링이 가능해진다.",
      },
      en: {
        q: "P4. An E = 4 eV electron hits a V₀ = 5 eV step (total reflection). Find the penetration depth δ = 1/κ.",
        s: "κ = √(2m(V₀−E))/ℏ = √(2·511000·1)/197.33 ≈ 5.12 nm⁻¹ (real-unit form √(2mc²ΔE)/ℏc). δ = 1/κ ≈ 0.195 nm — the wave seeps a couple of atoms deep into the 'forbidden' region. Everything eventually reflects (R = 1), but this evanescent tail is precisely what enables tunneling through thin barriers.",
      },
    },
    {
      ko: {
        q: "P5. 강의 예제: E = 6 eV, V₀ = 12 eV, 장벽 폭 w = 0.18 nm. κ와 T를 계산하고, w가 0.02 nm 늘어나면 T가 몇 배 줄어드는지 근사식으로 추정하시오.",
        s: "κ = √(2·511000·6)/197.33 = 12.55 nm⁻¹, κw = 2.26. 정확식: V₀²/4E(V₀−E) = 144/144 = 1, sinh²(2.26) = 22.4 → T = 1/23.4 = 0.0427 (슬라이드 0.044). 근사식 T ∝ e^{−2κw}이므로 Δw = 0.02 nm이면 배율 e^{−2κΔw} = e^{−0.502} ≈ 0.61 — 폭 11% 증가에 투과율 40% 감소. 이 지수 민감도가 FET 게이트 산화막 두께 공차를 지배한다.",
      },
      en: {
        q: "P5. Lecture example: E = 6 eV, V₀ = 12 eV, barrier width w = 0.18 nm. Compute κ and T, then estimate how much T drops if w grows by 0.02 nm.",
        s: "κ = √(2·511000·6)/197.33 = 12.55 nm⁻¹, κw = 2.26. Exact: V₀²/4E(V₀−E) = 1, sinh²(2.26) = 22.4 → T = 0.0427 (slide: 0.044). Since T ∝ e^{−2κw}, Δw = 0.02 nm multiplies T by e^{−0.502} ≈ 0.61 — an 11% thicker barrier cuts transmission 40%. This exponential sensitivity dictates gate-oxide tolerances in FETs.",
      },
    },
    {
      ko: {
        q: "P6. f(x) = √(30/L⁵)x(x−L)에 대해 (a) 짝수 n에서 cₙ = 0인 이유를 대칭성으로 설명하고, (b) |c₁|²과 ⟨E⟩를 구하시오.",
        s: "(a) f는 상자 중심 x = L/2에 대해 우함수, ψₙ은 n 홀수면 우함수·짝수면 기함수. 우×기의 적분은 0 → 짝수 cₙ = 0. (b) c₁ = −8√15/π³ → |c₁|² = 960/π⁶ = 0.9986 (한 번 측정하면 99.86% 확률로 E₁). ⟨E⟩ = Σ|cₙ|²Eₙ = (960/π⁶)(π²ℏ²/2mL²)Σ_odd n⁻⁴ = (480ℏ²/π⁴mL²)(π⁴/96) = 5ℏ²/mL². 직접 적분 ⟨f|Ĥ|f⟩ = −(ℏ²/2m)∫f·f″dx도 같은 값을 준다 (f″ = 2√(30/L⁵)).",
      },
      en: {
        q: "P6. For f(x) = √(30/L⁵)x(x−L): (a) explain via symmetry why cₙ = 0 for even n; (b) find |c₁|² and ⟨E⟩.",
        s: "(a) f is even about the box center x = L/2; ψₙ is even for odd n, odd for even n. Even × odd integrates to zero → even cₙ vanish. (b) c₁ = −8√15/π³ → |c₁|² = 960/π⁶ = 0.9986 (a single measurement returns E₁ 99.86% of the time). ⟨E⟩ = Σ|cₙ|²Eₙ = (960/π⁶)(π²ℏ²/2mL²)Σ_odd n⁻⁴ = 5ℏ²/mL². Direct integration ⟨f|Ĥ|f⟩ = −(ℏ²/2m)∫f·f″dx (f″ = 2√(30/L⁵)) gives the same.",
      },
    },
    {
      ko: {
        q: "P7. 정육면체 3D 상자에서 nx²+ny²+nz² = 27인 상태를 모두 나열하고 축퇴도를 구하시오. 이 축퇴가 왜 특별한가?",
        s: "(3,3,3) 1개 + (5,1,1)의 순열 3개 = 총 4중 축퇴. (2,1,1)형처럼 좌표축 순열로 생기는 축퇴는 정육면체 대칭성의 직접 귀결이지만, (3,3,3)과 (5,1,1)은 순열로 연결되지 않는데도 9+9+9 = 25+1+1로 같은 에너지 — '우연 축퇴'다. 상자를 조금 찌그러뜨리면(Lx ≠ Ly) 대칭 축퇴는 규칙적으로 갈라지고 우연 축퇴는 즉시 사라진다. 분자 진동·전자 준위의 대칭성 분석(군론)의 출발점이다.",
      },
      en: {
        q: "P7. In a cubic 3D box, list all states with nx²+ny²+nz² = 27 and their degeneracy. Why is this one special?",
        s: "(3,3,3) plus the 3 permutations of (5,1,1): 4-fold degenerate. Permutation degeneracies like the (2,1,1) family follow directly from cubic symmetry, but (3,3,3) and (5,1,1) are NOT permutations of each other yet share 9+9+9 = 25+1+1 — an 'accidental' degeneracy. Squash the box slightly (Lx ≠ Ly) and symmetry degeneracies split predictably while accidental ones vanish at once. This is the doorway to group-theoretic analysis of molecular levels.",
      },
    },
    {
      ko: {
        q: "P8. (a) 임의의 f(x)에 대해 [x̂, p̂]f = iℏf를 미분으로 증명하시오. (b) 교환자 실험실에서 N×N 절단 행렬의 대각이 n ≈ N 근처에서 무너지는 이유를 설명하시오.",
        s: "(a) x̂p̂f = −iℏx f′, p̂x̂f = −iℏ d(xf)/dx = −iℏf − iℏx f′. 빼면 (x̂p̂ − p̂x̂)f = iℏf ✓ — 1주차의 '1차 양자화' 계산과 동일하다. (b) 행렬곱 (XP)ₙₙ = Σₖ XₙₖPₖₙ은 무한합인데, X와 P는 이웃 준위들을 강하게 연결하므로(선택규칙 m±n 홀수) n이 절단 경계 N에 가까우면 합에 필요한 k > N 항들이 잘려나간다. 내부에서는 기여가 이미 수렴해 iℏ가 정확히 나온다. 무한 행렬의 필요성과 유한 basis set 오차의 본질을 동시에 보여준다.",
      },
      en: {
        q: "P8. (a) Prove [x̂, p̂]f = iℏf for arbitrary f(x). (b) Explain why the diagonal of the truncated N×N commutator collapses near n ≈ N.",
        s: "(a) x̂p̂f = −iℏx f′ while p̂x̂f = −iℏ d(xf)/dx = −iℏf − iℏx f′; subtracting gives (x̂p̂ − p̂x̂)f = iℏf ✓ — the same 'first quantization' computation as Week 1. (b) (XP)ₙₙ = Σₖ XₙₖPₖₙ is an infinite sum, and X, P couple neighboring levels strongly (selection rule: m±n odd); when n nears the cutoff N, the needed k > N terms are amputated. In the interior the sum has already converged, so iℏ emerges exactly — showing at once why Heisenberg's matrices are infinite and what finite-basis-set error really is.",
      },
    },
  ];
  const [open, setOpen] = useState({});
  return (
    <div>
      <Card>
        <H2>{lang === "ko" ? "연습문제 8제" : "Eight practice problems"}</H2>
        <Note>
          {lang === "ko"
            ? "각 문제의 '풀이 보기'를 누르기 전에 반드시 스스로 풀어보세요. P2·P4·P5는 실단위 계산 연습입니다 (√(2mc²ΔE)/ℏc 공식, ℏc = 197.3 eV·nm, mc² = 511 keV)."
            : "Try each one before opening the solution. P2·P4·P5 practice real-unit arithmetic (√(2mc²ΔE)/ℏc with ℏc = 197.3 eV·nm, mc² = 511 keV)."}
        </Note>
      </Card>
      {problems.map((p, i) => {
        const d = lang === "ko" ? p.ko : p.en;
        return (
          <Card key={i}>
            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.7, color: C.text }}>{d.q}</div>
            <button onClick={() => setOpen(o => ({ ...o, [i]: !o[i] }))}
              style={{ ...btnStyle(open[i]), marginTop: 12, padding: "6px 14px", fontSize: 12 }}>
              {open[i] ? (lang === "ko" ? "풀이 닫기" : "Hide solution") : (lang === "ko" ? "풀이 보기" : "Show solution")}
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
  wave_packet: {
    ko: "Gaussian 파속 · 최소 불확정성 · 분산", en: "Gaussian packet · min. uncertainty · dispersion",
    codes: { python: PY_PACKET, matlab: ML_PACKET, julia: JL_PACKET, cpp: CPP_PACKET },
  },
  step_tunneling: {
    ko: "퍼텐셜 계단 & 터널링 (FET·STM 검증)", en: "Step potential & tunneling (FET·STM checks)",
    codes: { python: PY_TUNNEL, matlab: ML_TUNNEL, julia: JL_TUNNEL, cpp: CPP_TUNNEL },
  },
  box_superposition: {
    ko: "상자: 기저 전개·측정·시간전개", en: "Box: expansion · measurement · dynamics",
    codes: { python: PY_BOX, matlab: ML_BOX, julia: JL_BOX, cpp: CPP_BOX },
  },
  matrix_mechanics: {
    ko: "행렬역학: [X,P] = iℏ 수치 확인", en: "Matrix mechanics: [X,P] = iℏ numerically",
    codes: { python: PY_MATRIX, matlab: ML_MATRIX, julia: JL_MATRIX, cpp: CPP_MATRIX },
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
  const [topic, setTopic] = useState("wave_packet");
  const [cl, setCl] = useState("python");
  const [copied, setCopied] = useState(false);
  const code = CODE_TOPICS[topic].codes[cl];
  const fname = `wk02_${topic}.${LANG_META[cl].ext}`;

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
        <H2>{isKo ? "시뮬레이션 코드 (4개 주제 × 4개 언어)" : "Simulation codes (4 topics × 4 languages)"}</H2>
        <Note>
          {isKo
            ? "이 페이지의 모든 인터랙티브 그림 뒤에 있는 물리를 직접 실행해 볼 수 있는 독립 실행 코드입니다. 수치 검증 완료: σxσp = 0.50000ℏ, R+T = 1.00000, FET T = 0.0427, Parseval = 1.000000, ⟨E⟩ → 5ℏ²/mL², Im[X,P]₁₁/ℏ = 0.9999."
            : "Standalone codes behind every interactive figure on this page. Numerically validated: σxσp = 0.50000ℏ, R+T = 1.00000, FET T = 0.0427, Parseval = 1.000000, ⟨E⟩ → 5ℏ²/mL², Im[X,P]₁₁/ℏ = 0.9999."}
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
