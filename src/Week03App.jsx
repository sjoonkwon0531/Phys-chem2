// ============================================================
// Week 3 — Harmonic Oscillator & Angular Momentum
// Physical Chemistry 2 · SKKU School of Chemical Engineering
// Smart Process & Materials Design Lab · Prof. S. Joon Kwon
// ------------------------------------------------------------
// Covers (lecture parts 1–3):
//   • Harmonic oscillator — series solution, Hermite polynomials,
//     quantized E_n = (n+1/2)ħω, zero-point energy, Hermitian operators
//   • Creation & annihilation operators — â, â†, [â,â†]=1,
//     number-basis matrices, energy ladder
//   • Angular momentum — [Lx,Ly]=iħLz, Levi-Civita, compatible
//     observables, ladder operators L±, vector model
//   • Spherical harmonics — Y_l^m from ladder construction, shapes,
//     orthonormality, real combinations → p/d orbitals
//   • Hydrogen atom — radial equation, Laguerre polynomials,
//     E_n = −13.6/n² eV, quantum numbers n, l, m + spin
// ============================================================
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  PY_SHO, ML_SHO, JL_SHO, CPP_SHO,
  PY_LADDER, ML_LADDER, JL_LADDER, CPP_LADDER,
  PY_ANGMOM, ML_ANGMOM, JL_ANGMOM, CPP_ANGMOM,
  PY_HYDROGEN, ML_HYDROGEN, JL_HYDROGEN, CPP_HYDROGEN,
} from "./Week03Codes";

// ── i18n ─────────────────────────────────────────────────────
const i18n = {
  ko: {
    weekTitle: "Week 3 — 조화진동자와 각운동량",
    subtitle: "Hermite 다항식 · 생성/소멸 연산자 · 각운동량 사다리 · 구면조화함수 · 수소 원자",
    tabs: {
      overview: "개요",
      sho: "조화진동자",
      ladder: "생성·소멸 연산자",
      angmom: "각운동량",
      sph: "구면조화함수",
      hydrogen: "수소 원자",
      practice: "연습문제",
      codes: "Raw 코드",
    },
  },
  en: {
    weekTitle: "Week 3 — Harmonic Oscillator & Angular Momentum",
    subtitle: "Hermite polynomials · Creation/annihilation · Angular momentum ladders · Spherical harmonics · Hydrogen atom",
    tabs: {
      overview: "Overview",
      sho: "Harmonic Oscillator",
      ladder: "Ladder Operators",
      angmom: "Angular Momentum",
      sph: "Spherical Harmonics",
      hydrogen: "Hydrogen Atom",
      practice: "Practice",
      codes: "Raw Codes",
    },
  },
};

// ── design tokens (Week 3 accent: violet) ────────────────────
const C = {
  bg: "#0b0f17",
  panel: "#111827",
  card: "#1f2937",
  border: "#374151",
  text: "#e5e7eb",
  textDim: "#9ca3af",
  accent: "#a78bfa",
  accentSoft: "#c4b5fd",
  amber: "#f59e0b",
  sky: "#38bdf8",
  blue: "#3b82f6",
  blueSoft: "#60a5fa",
  ok: "#10b981",
  err: "#ef4444",
  cyan: "#22d3ee",
  pink: "#f472b6",
  gold: "#fbbf24",
};

// ── math helpers (shared across tabs) ────────────────────────
const FACT = (() => { const f = [1]; for (let i = 1; i <= 24; i++) f[i] = f[i - 1] * i; return f; })();

function hermiteH(n, y) {
  if (n === 0) return 1;
  if (n === 1) return 2 * y;
  let hm = 1, hc = 2 * y;
  for (let k = 1; k < n; k++) { const hn = 2 * y * hc - 2 * k * hm; hm = hc; hc = hn; }
  return hc;
}
function psiSHO(n, y) {
  const norm = 1 / Math.sqrt(Math.pow(2, n) * FACT[n]) * Math.pow(Math.PI, -0.25);
  return norm * hermiteH(n, y) * Math.exp(-y * y / 2);
}
function assocLegendre(l, m, x) {
  let pmm = 1;
  if (m > 0) {
    const somx2 = Math.sqrt(Math.max(0, (1 - x) * (1 + x)));
    let fact = 1;
    for (let i = 0; i < m; i++) { pmm *= -fact * somx2; fact += 2; }
  }
  if (l === m) return pmm;
  let pm1 = x * (2 * m + 1) * pmm;
  if (l === m + 1) return pm1;
  let pll = 0;
  for (let ll = m + 2; ll <= l; ll++) {
    pll = (x * (2 * ll - 1) * pm1 - (ll + m - 1) * pmm) / (ll - m);
    pmm = pm1; pm1 = pll;
  }
  return pll;
}
// |Y_l^m|-related magnitude (φ-independent): N * P_l^|m|(cosθ)
function YlmTheta(l, m, theta) {
  const am = Math.abs(m);
  const N = Math.sqrt((2 * l + 1) / (4 * Math.PI) * FACT[l - am] / FACT[l + am]);
  return N * assocLegendre(l, am, Math.cos(theta));
}
function laguerreL(k, alpha, x) {
  if (k === 0) return 1;
  let lm = 1, lc = 1 + alpha - x;
  for (let i = 1; i < k; i++) { const ln = ((2 * i + 1 + alpha - x) * lc - (i + alpha) * lm) / (i + 1); lm = lc; lc = ln; }
  return lc;
}
function Rnl(n, l, r) {
  const rho = 2 * r / n;
  const N = Math.sqrt(Math.pow(2 / n, 3) * FACT[n - l - 1] / (2 * n * FACT[n + l]));
  return N * Math.pow(rho, l) * Math.exp(-rho / 2) * laguerreL(n - l - 1, 2 * l + 1, rho);
}

// ── shared UI primitives ─────────────────────────────────────
const Card = ({ children, style }) => (
  <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px", marginBottom: 16, ...style }}>{children}</div>
);
const Hd = ({ children, color }) => (
  <div style={{ fontSize: 17.5, fontWeight: 800, color: color || C.accentSoft, marginBottom: 10, letterSpacing: 0.2 }}>{children}</div>
);
const HdSub = ({ children, color }) => (
  <div style={{ fontSize: 14.5, fontWeight: 700, color: color || C.text, margin: "12px 0 6px" }}>{children}</div>
);
const Note = ({ children, style }) => (
  <div style={{ fontSize: 13.5, lineHeight: 1.75, color: C.text, ...style }}>{children}</div>
);
const Dim = ({ children, style }) => (
  <div style={{ fontSize: 12.5, lineHeight: 1.7, color: C.textDim, ...style }}>{children}</div>
);
const Eq = ({ children, size }) => (
  <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic", fontSize: size || 15.5, color: "#f3f4f6", background: "#0d1117", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", margin: "8px 0", overflowX: "auto", whiteSpace: "nowrap" }}>{children}</div>
);
const Pill = ({ children, color, on, onClick }) => (
  <button onClick={onClick} style={{
    background: on ? (color || C.accent) : C.card, color: on ? "#0b0f17" : C.text,
    border: `1px solid ${on ? (color || C.accent) : C.border}`, borderRadius: 999,
    padding: "6px 13px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", marginRight: 8, marginBottom: 8,
  }}>{children}</button>
);
const Slider = ({ label, value, min, max, step, onChange, fmt, color }) => (
  <div style={{ margin: "8px 0", minWidth: 220, flex: "1 1 240px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: C.text, marginBottom: 4 }}>
      <span>{label}</span>
      <span style={{ color: color || C.accentSoft, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{fmt ? fmt(value) : value}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} style={{ width: "100%", accentColor: color || C.accent }} />
  </div>
);
const Row = ({ children, style }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "flex-start", ...style }}>{children}</div>
);
const KV = ({ k, v, color }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", minWidth: 130 }}>
    <div style={{ fontSize: 11.5, color: C.textDim }}>{k}</div>
    <div style={{ fontSize: 14.5, fontWeight: 800, color: color || C.accentSoft, fontVariantNumeric: "tabular-nums" }}>{v}</div>
  </div>
);
const svgBox = W => ({ background: "#0d1117", borderRadius: 10, border: `1px solid ${C.border}`, flex: `1 1 ${Math.min(W, 380)}px`, maxWidth: "100%", height: "auto" });
const pathFrom = pts => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ");

// =============================================================
// 1) OVERVIEW
// =============================================================
function Overview({ lang }) {
  const isKo = lang === "ko";
  const timeline = [
    { yr: "1900", who: "Planck", ko: "흑체 복사 — 진동자 에너지의 양자화 E = nhν", en: "Blackbody radiation — oscillator energies quantized, E = nhν", c: C.amber },
    { yr: "1922", who: "Stern & Gerlach", ko: "은 원자빔이 자기장에서 둘로 갈라지다 — 스핀의 실험적 발견", en: "A silver beam splits in two in a magnet — spin discovered experimentally", c: C.ok },
    { yr: "1925", who: "Born & Jordan", ko: "[q̂,p̂] = iℏ — 사다리 대수의 토대가 되는 교환관계", en: "[q̂,p̂] = iℏ — the commutator that powers all ladder algebra", c: C.accent },
    { yr: "1925", who: "Uhlenbeck & Goudsmit", ko: "전자의 스핀 s = ±½ 제안", en: "Electron spin s = ±½ proposed", c: C.ok },
    { yr: "1926", who: "Pauli", ko: "행렬역학만으로 수소 스펙트럼 유도 — 사다리 연산자의 승리", en: "Hydrogen spectrum from matrix mechanics alone — ladder operators triumph", c: C.accent },
    { yr: "1926", who: "Schrödinger", ko: "파동방정식으로 수소 원자 풀이 — Y_l^m과 Laguerre 다항식", en: "Hydrogen solved with the wave equation — Y_l^m and Laguerre polynomials", c: C.sky },
    { yr: "1928", who: "Dirac", ko: "상대론적 방정식에서 스핀이 저절로 나오다", en: "Spin emerges automatically from the relativistic equation", c: C.pink },
    { yr: "오늘", who: "IR/Raman·NMR·MRI", ko: "조화진동자 = 분자 진동 분광, 스핀 = NMR/MRI의 심장", en: "SHO = vibrational spectroscopy; spin = the heart of NMR/MRI", c: C.cyan },
  ];
  const flow = isKo
    ? ["임의 퍼텐셜의 극소점", "2차 근사 → 조화진동자", "Hermite / 사다리 연산자", "회전 문제 → 각운동량", "구면조화함수 Y_l^m", "수소 원자 ψ_nlm"]
    : ["Any potential minimum", "Quadratic approx → SHO", "Hermite / ladder ops", "Rotation → angular momentum", "Spherical harmonics Y_l^m", "Hydrogen atom ψ_nlm"];
  return (
    <div>
      <Card>
        <Hd>{isKo ? "지난주에서 이번 주로" : "From last week to this week"}</Hd>
        <Note>
          {isKo
            ? "2주차에는 자유입자·계단·상자처럼 퍼텐셜이 조각별로 일정한 문제를 풀었습니다. 이번 주는 연속적으로 변하는 퍼텐셜의 두 왕(王)을 만납니다 — 모든 안정 평형점 근처를 지배하는 조화진동자, 그리고 모든 회전 문제를 지배하는 각운동량입니다. 두 문제 모두 '사다리 연산자'라는 같은 대수적 열쇠로 풀리고, 그 열쇠는 마지막에 수소 원자의 문을 엽니다: ψ_nlm = R_nl(r) Y_l^m(θ,φ)."
            : "Last week the potentials were piecewise flat — free particles, steps, boxes. This week we meet the two royalty of smoothly varying potentials: the harmonic oscillator, which rules near every stable equilibrium, and angular momentum, which rules every rotation problem. Both yield to the same algebraic key — ladder operators — and that key finally opens the hydrogen atom: ψ_nlm = R_nl(r) Y_l^m(θ,φ)."}
        </Note>
      </Card>

      <Card>
        <Hd>{isKo ? "이번 주의 흐름" : "This week's flow"}</Hd>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          {flow.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ background: C.card, border: `1px solid ${i >= 4 ? C.accent : C.border}`, color: i >= 4 ? C.accentSoft : C.text, borderRadius: 10, padding: "8px 12px", fontSize: 12.5, fontWeight: 700 }}>{s}</div>
              {i < flow.length - 1 && <span style={{ color: C.textDim, fontWeight: 800 }}>→</span>}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Hd>{isKo ? "타임라인" : "Timeline"}</Hd>
        {timeline.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: i < timeline.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ minWidth: 52, color: t.c, fontWeight: 800, fontSize: 13 }}>{t.yr}</div>
            <div style={{ minWidth: 150, color: C.text, fontWeight: 700, fontSize: 13 }}>{t.who}</div>
            <div style={{ color: C.textDim, fontSize: 13, lineHeight: 1.6 }}>{isKo ? t.ko : t.en}</div>
          </div>
        ))}
      </Card>

      <Card>
        <Hd>{isKo ? "핵심 방정식" : "Key equations"}</Hd>
        <Row>
          <div style={{ flex: "1 1 300px" }}>
            <HdSub color={C.accentSoft}>{isKo ? "조화진동자" : "Harmonic oscillator"}</HdSub>
            <Eq>E&#8345; = (n + ½)ℏω, n = 0, 1, 2, …</Eq>
            <Eq>ψ&#8345;(y) = N&#8345; H&#8345;(y) e<sup>−y²/2</sup>, y = √(mω/ℏ) x</Eq>
            <Eq>â|n⟩ = √n |n−1⟩, â†|n⟩ = √(n+1) |n+1⟩, [â, â†] = 1</Eq>
          </div>
          <div style={{ flex: "1 1 300px" }}>
            <HdSub color={C.sky}>{isKo ? "각운동량 · 수소" : "Angular momentum · hydrogen"}</HdSub>
            <Eq>[Lₓ, Lᵧ] = iℏLz, [L², Lz] = 0</Eq>
            <Eq>L²|l,m⟩ = ℏ²l(l+1)|l,m⟩, Lz|l,m⟩ = ℏm|l,m⟩</Eq>
            <Eq>ψ&#8345;&#8343;&#8344; = R&#8345;&#8343;(r) Y&#8343;&#8344;(θ,φ), E&#8345; = −13.6 eV / n²</Eq>
          </div>
        </Row>
      </Card>

      <Card>
        <Hd>{isKo ? "학습 목표" : "Learning outcomes"}</Hd>
        <Note>
          {(isKo
            ? [
              "급수해 절단(cut-off)이 어떻게 E_n = (n+½)ℏω 양자화를 강제하는지 설명한다.",
              "Hermite 다항식의 직교성으로 고유함수의 직교규격성을 확인한다.",
              "â, â†의 대수만으로 스펙트럼과 행렬원소 √n, √(n+1)을 유도한다.",
              "[Lx,Ly] = iℏLz에서 '동시 측정 불가'와 양립 가능 관측량의 의미를 설명한다.",
              "L±로 |l,m⟩ 사다리를 오르내리고 m의 범위 −l ≤ m ≤ l을 유도한다.",
              "Y_l^m의 모양과 실수 결합(p_x, p_y, d_xy …)의 관계를 그림으로 설명한다.",
              "수소 원자에서 지름 방정식 → Laguerre → E_n = −13.6/n² eV의 논리를 재구성한다.",
              "양자수 위계 n → l → m (+ 스핀 s)와 겹침수 n²(스핀 포함 2n²)를 계산한다.",
            ]
            : [
              "Explain how truncating the series solution forces E_n = (n+½)ℏω.",
              "Verify eigenfunction orthonormality from Hermite orthogonality.",
              "Derive the spectrum and the √n, √(n+1) matrix elements using only â, â† algebra.",
              "Read [Lx,Ly] = iℏLz as a statement about simultaneous measurability; define compatible observables.",
              "Climb the |l,m⟩ ladder with L± and derive −l ≤ m ≤ l.",
              "Connect the shapes of Y_l^m with the real combinations p_x, p_y, d_xy, …",
              "Reconstruct the hydrogen logic: radial equation → Laguerre → E_n = −13.6/n² eV.",
              "Count states with the hierarchy n → l → m (+ spin s): degeneracy n² (2n² with spin).",
            ]
          ).map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 8, padding: "3px 0" }}>
              <span style={{ color: C.accent, fontWeight: 800 }}>{i + 1}.</span><span>{s}</span>
            </div>
          ))}
        </Note>
      </Card>
    </div>
  );
}

// =============================================================
// 2) HARMONIC OSCILLATOR
// =============================================================
function EigenViewer({ lang }) {
  const isKo = lang === "ko";
  const [n, setN] = useState(0);
  const [showP, setShowP] = useState(false);   // false: ψ, true: |ψ|²
  const [showCl, setShowCl] = useState(false); // classical density overlay
  const W = 560, Hp = 360, pad = 42;
  const ymax = 8.2, Emax = 9.2;
  const X = y => pad + (y + ymax) / (2 * ymax) * (W - 2 * pad);
  const Y = E => Hp - pad - E / Emax * (Hp - 2 * pad);
  const ytp = Math.sqrt(2 * n + 1);
  const pot = useMemo(() => {
    const pts = [];
    for (let y = -ymax; y <= ymax; y += 0.05) {
      const V = 0.5 * y * y;
      if (V <= Emax) pts.push([X(y), Y(V)]);
    }
    return pathFrom(pts);
  }, []);
  const curve = useMemo(() => {
    const pts = [];
    const amp = showP ? 1.9 : 1.15;
    for (let y = -ymax; y <= ymax; y += 0.02) {
      const p = psiSHO(n, y);
      const v = showP ? amp * p * p : amp * p;
      pts.push([X(y), Y(n + 0.5 + v)]);
    }
    return pathFrom(pts);
  }, [n, showP]);
  const classical = useMemo(() => {
    if (!showP) return "";
    const pts = [];
    const amp = 1.9;
    for (let y = -ytp + 0.02; y <= ytp - 0.02; y += 0.01) {
      const pc = 1 / (Math.PI * Math.sqrt(Math.max(1e-6, ytp * ytp - y * y)));
      pts.push([X(y), Y(n + 0.5 + amp * Math.min(pc, 1.4))]);
    }
    return pathFrom(pts);
  }, [n, showP]);
  // classically forbidden probability (trapezoid, precomputed style)
  const Pforb = useMemo(() => {
    let s = 0; const dy = 0.005;
    for (let y = ytp; y <= 10; y += dy) { const p = psiSHO(n, y); s += p * p * dy; }
    return 2 * s;
  }, [n]);
  return (
    <Card>
      <Hd>{isKo ? "고유함수 뷰어 — 퍼텐셜 위의 ψₙ" : "Eigenfunction viewer — ψₙ on the potential"}</Hd>
      <Note style={{ marginBottom: 8 }}>
        {isKo
          ? "슬라이더로 n을 바꿔 보세요. 각 고유함수는 자기 에너지 Eₙ = (n+½)ℏω 높이에 그려져 있습니다. 마디(node) 수 = n, 그리고 파동함수는 고전적 전환점 y_tp = √(2n+1) 밖까지 스며듭니다 — 금지 영역 확률이 오른쪽에 표시됩니다."
          : "Slide n. Each eigenfunction is drawn at its own energy Eₙ = (n+½)ℏω. Node count = n, and the wavefunction leaks beyond the classical turning point y_tp = √(2n+1) — the forbidden-region probability is shown on the right."}
      </Note>
      <Row>
        <svg viewBox={`0 0 ${W} ${Hp}`} style={svgBox(W)}>
          <rect x={X(ytp)} y={pad / 2} width={W - pad - X(ytp)} height={Hp - 1.5 * pad} fill={C.err} opacity={0.07} />
          <rect x={pad} y={pad / 2} width={X(-ytp) - pad} height={Hp - 1.5 * pad} fill={C.err} opacity={0.07} />
          <path d={pot} fill="none" stroke={C.textDim} strokeWidth={1.6} />
          {[...Array(9)].map((_, k) => (
            <line key={k} x1={X(-Math.sqrt(2 * k + 1))} x2={X(Math.sqrt(2 * k + 1))} y1={Y(k + 0.5)} y2={Y(k + 0.5)}
              stroke={k === n ? C.accent : C.border} strokeWidth={k === n ? 1.8 : 1} strokeDasharray={k === n ? "" : "4 4"} />
          ))}
          {showP && showCl && <path d={classical} fill="none" stroke={C.amber} strokeWidth={1.6} strokeDasharray="5 4" />}
          <path d={curve} fill="none" stroke={C.accentSoft} strokeWidth={2.2} />
          <line x1={X(ytp)} x2={X(ytp)} y1={pad / 2} y2={Hp - pad} stroke={C.err} strokeWidth={1} strokeDasharray="3 4" />
          <line x1={X(-ytp)} x2={X(-ytp)} y1={pad / 2} y2={Hp - pad} stroke={C.err} strokeWidth={1} strokeDasharray="3 4" />
          <text x={X(ytp) + 4} y={pad / 2 + 12} fill={C.err} fontSize={11}>y_tp</text>
          <text x={pad} y={Hp - 12} fill={C.textDim} fontSize={11}>y = √(mω/ℏ)·x</text>
          <text x={W - pad - 60} y={Y(n + 0.5) - 8} fill={C.accent} fontSize={12} fontWeight={800}>E{n} = {(n + 0.5).toFixed(1)} ℏω</text>
        </svg>
        <div style={{ flex: "1 1 240px" }}>
          <Slider label={isKo ? "양자수 n" : "Quantum number n"} value={n} min={0} max={8} step={1} onChange={setN} />
          <div style={{ margin: "6px 0" }}>
            <Pill on={!showP} onClick={() => setShowP(false)}>ψₙ(y)</Pill>
            <Pill on={showP} onClick={() => setShowP(true)}>|ψₙ(y)|²</Pill>
            {showP && <Pill on={showCl} color={C.amber} onClick={() => setShowCl(v => !v)}>{isKo ? "고전 밀도" : "classical"}</Pill>}
          </div>
          <Row>
            <KV k={isKo ? "에너지 Eₙ" : "Energy Eₙ"} v={`${(n + 0.5).toFixed(1)} ℏω`} />
            <KV k={isKo ? "마디 수" : "Nodes"} v={n} color={C.sky} />
            <KV k="y_tp = √(2n+1)" v={ytp.toFixed(3)} color={C.err} />
            <KV k={isKo ? "금지영역 확률" : "P(forbidden)"} v={(100 * Pforb).toFixed(2) + " %"} color={C.err} />
          </Row>
          <Dim style={{ marginTop: 8 }}>
            {isKo
              ? `n = 0에서 15.73 %나 되는 확률이 고전적으로 금지된 영역에 있습니다. n이 커질수록 이 값은 줄고(${n}에서 ${(100 * Pforb).toFixed(2)} %), |ψ|²는 고전 밀도(주황 점선)에 다가갑니다 — 대응원리입니다.`
              : `At n = 0 a striking 15.73 % of the probability lives in the classically forbidden region. It shrinks as n grows (${(100 * Pforb).toFixed(2)} % here), and |ψ|² approaches the classical density (amber dashes) — the correspondence principle.`}
          </Dim>
        </div>
      </Row>
    </Card>
  );
}

function HarmonicTab({ lang }) {
  const isKo = lang === "ko";
  const herm = [
    ["H₀(y) = 1"], ["H₁(y) = 2y"], ["H₂(y) = 4y² − 2"], ["H₃(y) = 8y³ − 12y"], ["H₄(y) = 16y⁴ − 48y² + 12"],
  ];
  return (
    <div>
      <Card>
        <Hd>{isKo ? "왜 조화진동자인가 — 모든 극소점의 보편 근사" : "Why the SHO — the universal approximation at every minimum"}</Hd>
        <Note>
          {isKo
            ? "임의의 퍼텐셜 V(x)를 안정 평형점 x₀ 근처에서 Taylor 전개하면 1차항은 사라지고(극소점!) 2차항이 남습니다. 즉 충분히 작은 진동은 언제나 조화진동자입니다. 분자 결합의 진동(IR 분광), 고체 격자의 포논, 전자기장의 광자 모드 — 전부 이 하나의 문제로 환원됩니다."
            : "Taylor-expand any potential V(x) around a stable equilibrium x₀: the first-order term vanishes (it's a minimum!) and the quadratic term survives. Every small oscillation is a harmonic oscillator — molecular bond vibrations (IR spectroscopy), lattice phonons, photon modes of the electromagnetic field all reduce to this one problem."}
        </Note>
        <Eq>V(x) ≈ V(x₀) + ½ V″(x₀)(x−x₀)², V(x) = ½mω²x²</Eq>
      </Card>

      <Card>
        <Hd>{isKo ? "급수해 → 절단 → 양자화" : "Series solution → cut-off → quantization"}</Hd>
        <Note>
          {isKo
            ? "무차원화 y = √(mω/ℏ)x, ε = E/ℏω 후 ψ = u(y)e^{−y²/2}로 놓으면 u″ − 2yu′ + (2ε−1)u = 0. 급수 u = ΣCₙyⁿ의 점화식은"
            : "With y = √(mω/ℏ)x, ε = E/ℏω and the ansatz ψ = u(y)e^{−y²/2} we get u″ − 2yu′ + (2ε−1)u = 0. The series u = ΣCₙyⁿ obeys"}
        </Note>
        <Eq>C&#8345;&#8330;&#8322; = C&#8345; · (2ε − 2n − 1) / [(n+2)(n+1)]</Eq>
        <Note>
          {isKo
            ? "급수가 무한히 이어지면 u ~ e^{y²}처럼 발산해 ψ가 규격화 불가능해집니다. 물리적 해가 되려면 급수가 유한 차수에서 끊겨야 하고, 그 조건 2ε − 2n − 1 = 0이 곧 에너지 양자화입니다:"
            : "If the series never terminates, u grows like e^{y²} and ψ cannot be normalized. Physics demands the series be cut off at finite order — and that condition, 2ε − 2n − 1 = 0, is the quantization:"}
        </Note>
        <Eq size={17}>E&#8345; = (n + ½)ℏω, n = 0, 1, 2, … — {isKo ? "영점에너지" : "zero-point energy"} E₀ = ℏω/2 ≠ 0</Eq>
        <Dim>
          {isKo
            ? "고전 진동자의 최저 에너지는 0이지만 양자 진동자는 ℏω/2를 결코 내려놓지 못합니다 — 불확정성 원리가 x = 0, p = 0의 동시 실현을 금지하기 때문입니다. HCl 분자(ω̃ ≈ 2990 cm⁻¹)의 영점에너지는 약 0.185 eV로, 절대영도에서도 결합은 떨고 있습니다."
            : "A classical oscillator can rest at zero energy; the quantum one can never surrender its ℏω/2 — the uncertainty principle forbids x = 0 and p = 0 simultaneously. For HCl (ω̃ ≈ 2990 cm⁻¹) the zero-point energy is ≈ 0.185 eV: even at absolute zero the bond trembles."}
        </Dim>
      </Card>

      <Card>
        <Hd>{isKo ? "Hermite 다항식 — 절단된 급수의 정체" : "Hermite polynomials — the truncated series, named"}</Hd>
        <Row>
          <div style={{ flex: "1 1 260px" }}>
            {herm.map((h, i) => <Eq key={i}>{h[0]}</Eq>)}
          </div>
          <div style={{ flex: "1 1 300px" }}>
            <HdSub>{isKo ? "성질" : "Properties"}</HdSub>
            <Eq>H&#8345;₊₁ = 2y H&#8345; − 2n H&#8345;₋₁ ({isKo ? "점화식" : "recurrence"})</Eq>
            <Eq>∫ e<sup>−y²</sup> H&#8344;H&#8345; dy = 2ⁿ n! √π δ&#8344;&#8345;</Eq>
            <Note>
              {isKo
                ? "이 직교성이 ⟨ψₘ|ψₙ⟩ = δₘₙ을 보장합니다 — 시뮬레이션 코드에서 4×4 직교성 행렬이 정확히 단위행렬(1.000000)로 나오는 것을 확인하세요."
                : "This orthogonality guarantees ⟨ψₘ|ψₙ⟩ = δₘₙ — check in the simulation codes that the 4×4 orthogonality matrix comes out exactly as the identity (1.000000)."}
            </Note>
          </div>
        </Row>
      </Card>

      <EigenViewer lang={lang} />
    </div>
  );
}

// =============================================================
// 3) CREATION & ANNIHILATION OPERATORS
// =============================================================
function LadderLab({ lang }) {
  const isKo = lang === "ko";
  const [n, setN] = useState(2);
  const [flash, setFlash] = useState(null); // {dir, amp}
  const apply = dir => {
    if (dir === -1 && n === 0) { setFlash({ dir, amp: 0 }); return; }
    const amp = dir === 1 ? Math.sqrt(n + 1) : Math.sqrt(n);
    setFlash({ dir, amp });
    setN(v => Math.max(0, Math.min(8, v + dir)));
  };
  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 1400);
    return () => clearTimeout(t);
  }, [flash]);
  const W = 300, Hp = 340, pad = 30;
  const Y = k => Hp - pad - k * (Hp - 2 * pad) / 8.6;
  return (
    <Card>
      <Hd>{isKo ? "사다리 실험실 — â†로 오르고 â로 내려가기" : "Ladder lab — climb with â†, descend with â"}</Hd>
      <Row>
        <svg viewBox={`0 0 ${W} ${Hp}`} style={svgBox(W)}>
          {[...Array(9)].map((_, k) => (
            <g key={k}>
              <line x1={pad + 30} x2={W - pad - 30} y1={Y(k + 0.5)} y2={Y(k + 0.5)}
                stroke={k === n ? C.accent : C.border} strokeWidth={k === n ? 3 : 1.4} />
              <text x={W - pad - 24} y={Y(k + 0.5) + 4} fill={k === n ? C.accentSoft : C.textDim} fontSize={11}>|{k}⟩</text>
              <text x={6} y={Y(k + 0.5) + 4} fill={C.textDim} fontSize={10}>{(k + 0.5).toFixed(1)}ℏω</text>
            </g>
          ))}
          {flash && flash.amp > 0 && (
            <g>
              <line x1={W / 2} x2={W / 2}
                y1={Y(n - flash.dir + 0.5)} y2={Y(n + 0.5)}
                stroke={flash.dir === 1 ? C.ok : C.amber} strokeWidth={2.5} markerEnd="url(#wk3arrow)" />
              <text x={W / 2 + 8} y={(Y(n + 0.5) + Y(n - flash.dir + 0.5)) / 2} fill={flash.dir === 1 ? C.ok : C.amber} fontSize={12} fontWeight={800}>
                ×{flash.amp.toFixed(3)}
              </text>
            </g>
          )}
          {flash && flash.amp === 0 && (
            <text x={W / 2 - 52} y={Y(0.5) + 24} fill={C.err} fontSize={12} fontWeight={800}>â|0⟩ = 0 !</text>
          )}
          <defs>
            <marker id="wk3arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill={flash && flash.dir === 1 ? C.ok : C.amber} />
            </marker>
          </defs>
        </svg>
        <div style={{ flex: "1 1 260px" }}>
          <div style={{ margin: "4px 0 10px" }}>
            <Pill color={C.ok} on onClick={() => apply(1)}>â† {isKo ? "적용 (생성)" : "apply (create)"}</Pill>
            <Pill color={C.amber} on onClick={() => apply(-1)}>â {isKo ? "적용 (소멸)" : "apply (annihilate)"}</Pill>
          </div>
          <Row>
            <KV k={isKo ? "현재 상태" : "Current state"} v={`|${n}⟩`} />
            <KV k="â†|n⟩" v={`√${n + 1} |${n + 1}⟩`} color={C.ok} />
            <KV k="â|n⟩" v={n === 0 ? "0" : `√${n} |${n - 1}⟩`} color={C.amber} />
            <KV k="n̂ = â†â" v={`${n}`} color={C.sky} />
          </Row>
          <Note style={{ marginTop: 8 }}>
            {isKo
              ? "사다리는 아래로는 |0⟩에서 끝납니다: â|0⟩ = 0. 이 종결 조건에서 최저 에너지 ℏω/2가 나오고, â†를 n번 적용하면 Eₙ = (n+½)ℏω 전체 스펙트럼이 나옵니다 — 미분방정식 없이 대수만으로!"
              : "The ladder terminates at the bottom: â|0⟩ = 0. That single condition yields the minimum energy ℏω/2, and applying â† n times generates the whole spectrum Eₙ = (n+½)ℏω — pure algebra, no differential equation!"}
          </Note>
        </div>
      </Row>
    </Card>
  );
}

function MatrixHeat({ lang }) {
  const isKo = lang === "ko";
  const [which, setWhich] = useState("a");
  const N = 8;
  const mats = useMemo(() => {
    const a = Array.from({ length: N }, () => Array(N).fill(0));
    for (let k = 1; k < N; k++) a[k - 1][k] = Math.sqrt(k);
    const ad = a[0].map((_, j) => a.map(r => r[j]));           // transpose
    const X = a.map((r, i) => r.map((v, j) => (v + ad[i][j]) / Math.SQRT2));
    const Pim = a.map((r, i) => r.map((v, j) => (ad[i][j] - v) / Math.SQRT2)); // imaginary part of P
    const Hn = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => (i === j ? i + 0.5 : 0)));
    return { a, ad, X, P: Pim, H: Hn };
  }, []);
  const M = mats[which];
  const vmax = Math.max(...M.flat().map(Math.abs), 1e-9);
  const label = { a: "⟨m|â|n⟩", ad: "⟨m|â†|n⟩", X: "⟨m|X̂|n⟩·√(mω/ℏ)", P: "Im⟨m|P̂|n⟩/√(mℏω)", H: "⟨m|Ĥ|n⟩/ℏω" }[which];
  const cell = 34, off = 40;
  return (
    <Card>
      <Hd>{isKo ? "수 기저 행렬 — Heisenberg가 본 진동자" : "Number-basis matrices — the oscillator as Heisenberg saw it"}</Hd>
      <div style={{ marginBottom: 8 }}>
        {["a", "ad", "X", "P", "H"].map(k => (
          <Pill key={k} on={which === k} onClick={() => setWhich(k)}>
            {{ a: "â", ad: "â†", X: "X̂", P: "P̂", H: "Ĥ" }[k]}
          </Pill>
        ))}
      </div>
      <Row>
        <svg viewBox={`0 0 ${off + N * cell + 10} ${off + N * cell + 10}`} style={svgBox(off + N * cell + 10)}>
          {M.map((row, i) => row.map((v, j) => {
            const t = Math.abs(v) / vmax;
            const col = v === 0 ? "#111827" : (v > 0 ? `rgba(167,139,250,${0.15 + 0.85 * t})` : `rgba(244,114,182,${0.15 + 0.85 * t})`);
            return (
              <g key={`${i}-${j}`}>
                <rect x={off + j * cell} y={off + i * cell} width={cell - 2} height={cell - 2} rx={4} fill={col} />
                {Math.abs(v) > 1e-9 && <text x={off + j * cell + cell / 2 - 1} y={off + i * cell + cell / 2 + 3} textAnchor="middle" fill="#0b0f17" fontSize={9.5} fontWeight={800}>{v.toFixed(2)}</text>}
              </g>
            );
          }))}
          {[...Array(N)].map((_, k) => (
            <g key={k}>
              <text x={off + k * cell + cell / 2 - 1} y={off - 8} textAnchor="middle" fill={C.textDim} fontSize={10}>n={k}</text>
              <text x={off - 8} y={off + k * cell + cell / 2 + 3} textAnchor="end" fill={C.textDim} fontSize={10}>m={k}</text>
            </g>
          ))}
        </svg>
        <div style={{ flex: "1 1 260px" }}>
          <Eq>{label}</Eq>
          <Note>
            {isKo
              ? { a: "â는 상단 부대각선에만 √n이 있습니다 — 한 계단 내려가는 연산자.", ad: "â†는 하단 부대각선에만 √(n+1) — 한 계단 올라가는 연산자.", X: "X̂ = (â+â†)/√2 는 두 부대각선의 합: 위치를 재면 이웃 상태들과 섞입니다. 대각원소는 전부 0 → ⟨X⟩ₙ = 0.", P: "P̂ = i(â†−â)/√2 도 부대각 구조(허수부 표시). Week 2의 행렬역학 [X,P] = iℏ가 여기서 그대로 성립합니다.", H: "Ĥ/ℏω = n̂+½ 은 대각행렬 — 고유값 (n+½)이 바로 읽힙니다. '대각화된 행렬 = 풀린 문제'라는 Heisenberg 프로그램의 완성." }[which]
              : { a: "â lives only on the upper off-diagonal with entries √n — the step-down operator.", ad: "â† lives on the lower off-diagonal with √(n+1) — the step-up operator.", X: "X̂ = (â+â†)/√2 is the sum of both off-diagonals: measuring position mixes neighboring states. All diagonal entries are 0 → ⟨X⟩ₙ = 0.", P: "P̂ = i(â†−â)/√2 shares the off-diagonal structure (imaginary part shown). Week 2's matrix mechanics [X,P] = iℏ holds verbatim here.", H: "Ĥ/ℏω = n̂+½ is diagonal — the eigenvalues (n+½) can be read off directly. A diagonal matrix is a solved problem: Heisenberg's program completed." }[which]}
          </Note>
          <Row style={{ marginTop: 8 }}>
            <KV k="[â,â†]" v="1 (~1e-15)" color={C.ok} />
            <KV k="Im[X̂,P̂]₀₀/ℏ" v="1.000000" color={C.ok} />
            <KV k="σₓσₚ (|n⟩)" v="(n+½)ℏ" color={C.sky} />
          </Row>
        </div>
      </Row>
    </Card>
  );
}

function LadderTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <Card>
        <Hd>{isKo ? "Hermitian 연산자 — 측정 가능한 것의 조건" : "Hermitian operators — the license to be measured"}</Hd>
        <Note>
          {isKo
            ? "⟨f|T̂g⟩ = ⟨T̂†f|g⟩로 정의되는 수반 연산자 T̂†가 자기 자신과 같으면(T̂ = T̂†) Hermitian입니다. Hermitian 연산자의 고유값은 반드시 실수 — 측정값은 실수여야 하므로, 모든 관측 가능량에는 Hermitian 연산자가 대응합니다. X̂, P̂, Ĥ는 Hermitian이지만 â는 아닙니다(â† ≠ â) — 그래서 â 자체는 관측량이 아니라 도구입니다."
            : "The adjoint T̂† is defined by ⟨f|T̂g⟩ = ⟨T̂†f|g⟩; if T̂ = T̂† the operator is Hermitian. Hermitian eigenvalues are necessarily real — and since measured values must be real, every observable is represented by a Hermitian operator. X̂, P̂, Ĥ are Hermitian; â is not (â† ≠ â) — â is a tool, not an observable."}
        </Note>
        <Eq>⟨f|T̂(g)⟩ = ⟨T̂†(f)|g⟩, T̂ = T̂† ⇒ {isKo ? "고유값 ∈ ℝ" : "eigenvalues ∈ ℝ"}</Eq>
      </Card>

      <Card>
        <Hd>{isKo ? "인수분해의 마법 — Ĥ = ℏω(â†â + ½)" : "The factorization trick — Ĥ = ℏω(â†â + ½)"}</Hd>
        <Note>
          {isKo
            ? "고전 해밀토니안 H = p²/2m + mω²x²/2 를 '제곱의 합'으로 보고 인수분해하고 싶지만, 연산자는 교환하지 않습니다. [X,P] = iℏ의 대가로 ½이 남습니다:"
            : "The classical H = p²/2m + mω²x²/2 begs to be factored as a sum of squares — but operators don't commute. The price of [X,P] = iℏ is the leftover ½:"}
        </Note>
        <Eq>â = √(mω/2ℏ) X̂ + i√(1/2mℏω) P̂, â† = √(mω/2ℏ) X̂ − i√(1/2mℏω) P̂</Eq>
        <Eq>[â, â†] = 1, Ĥ = ℏω(â†â + ½), [â, Ĥ] = ℏωâ, [â†, Ĥ] = −ℏωâ†</Eq>
        <Note>
          {isKo
            ? "[â,Ĥ] = ℏωâ에서: Ĥ(â|ψ⟩) = (E−ℏω)(â|ψ⟩). â|ψ⟩는 에너지가 ℏω 낮은 고유상태입니다. 사다리를 무한히 내려갈 수는 없으므로(E ≥ 0) â|0⟩ = 0인 바닥이 존재하고, 그로부터 E₀ = ℏω/2."
            : "From [â,Ĥ] = ℏωâ: Ĥ(â|ψ⟩) = (E−ℏω)(â|ψ⟩) — â|ψ⟩ is an eigenstate one rung lower. The descent cannot continue forever (E ≥ 0), so a floor with â|0⟩ = 0 must exist, giving E₀ = ℏω/2."}
        </Note>
      </Card>

      <LadderLab lang={lang} />
      <MatrixHeat lang={lang} />
    </div>
  );
}

// =============================================================
// 4) ANGULAR MOMENTUM
// =============================================================
function buildAngMom(l) {
  const d = 2 * l + 1;
  const ms = Array.from({ length: d }, (_, k) => l - k);
  const Lz = ms.map((m, i) => ms.map((_, j) => (i === j ? m : 0)));
  const Lp = Array.from({ length: d }, () => Array(d).fill(0));
  for (let k = 1; k < d; k++) {
    const m = ms[k];
    Lp[k - 1][k] = Math.sqrt(l * (l + 1) - m * (m + 1));
  }
  const Lm = Lp[0].map((_, j) => Lp.map(r => r[j]));
  return { d, ms, Lz, Lp, Lm };
}
// complex matrix ops as [re, im] pairs for the commutator lab
function cmul(A, B) {
  const n = A.length;
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => {
    let re = 0, im = 0;
    for (let k = 0; k < n; k++) {
      re += A[i][k][0] * B[k][j][0] - A[i][k][1] * B[k][j][1];
      im += A[i][k][0] * B[k][j][1] + A[i][k][1] * B[k][j][0];
    }
    return [re, im];
  }));
}
const toC = M => M.map(r => r.map(v => [v, 0]));

function CommutatorLab({ lang }) {
  const isKo = lang === "ko";
  const [l, setL] = useState(1);
  const res = useMemo(() => {
    const { d, Lz, Lp, Lm } = buildAngMom(l);
    const Lx = toC(Lp.map((r, i) => r.map((v, j) => (v + Lm[i][j]) / 2)));
    const Ly = Lp.map((r, i) => r.map((v, j) => [0, -(v - Lm[i][j]) / 2]));
    const LzC = toC(Lz);
    const comm = cmul(Lx, Ly).map((r, i) => r.map((v, j) => [v[0] - cmul(Ly, Lx)[i][j][0], v[1] - cmul(Ly, Lx)[i][j][1]]));
    // [Lx,Ly] - i Lz
    let err = 0;
    for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) {
      const dre = comm[i][j][0] - 0, dim = comm[i][j][1] - Lz[i][j];
      err = Math.max(err, Math.hypot(dre, dim));
    }
    // L^2 = Lx^2 + Ly^2 + Lz^2
    const L2 = [cmul(Lx, Lx), cmul(Ly, Ly), cmul(LzC, LzC)].reduce((S, M) =>
      S.map((r, i) => r.map((v, j) => [v[0] + M[i][j][0], v[1] + M[i][j][1]])));
    let e2 = 0;
    for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) {
      const target = i === j ? l * (l + 1) : 0;
      e2 = Math.max(e2, Math.hypot(L2[i][j][0] - target, L2[i][j][1]));
    }
    return { err, e2, comm, d };
  }, [l]);
  return (
    <Card>
      <Hd>{isKo ? "교환자 실험실 — [L̂ₓ, L̂ᵧ] = iℏL̂z 를 수치로" : "Commutator lab — [L̂ₓ, L̂ᵧ] = iℏL̂z, numerically"}</Hd>
      <Note style={{ marginBottom: 6 }}>
        {isKo
          ? "선택한 l에 대해 (2l+1)×(2l+1) 행렬 L̂ₓ = (L̂₊+L̂₋)/2, L̂ᵧ = (L̂₊−L̂₋)/2i 를 브라우저에서 직접 곱해 교환자를 계산합니다."
          : "For the chosen l the browser builds the (2l+1)×(2l+1) matrices L̂ₓ = (L̂₊+L̂₋)/2, L̂ᵧ = (L̂₊−L̂₋)/2i and multiplies them out."}
      </Note>
      <div>
        {[1, 2, 3].map(v => <Pill key={v} on={l === v} onClick={() => setL(v)}>l = {v}</Pill>)}
      </div>
      <Row style={{ marginTop: 6 }}>
        <KV k={`max |[L̂ₓ,L̂ᵧ] − iL̂z|  (${res.d}×${res.d})`} v={res.err.toExponential(1)} color={C.ok} />
        <KV k="max |L̂² − l(l+1)ℏ²·I|" v={res.e2.toExponential(1)} color={C.ok} />
        <KV k="ℏ√(l(l+1))" v={Math.sqrt(l * (l + 1)).toFixed(4) + " ℏ"} color={C.sky} />
      </Row>
      <Dim style={{ marginTop: 8 }}>
        {isKo
          ? "오차가 기계 정밀도(~10⁻¹⁶)뿐입니다: 교환관계는 근사가 아니라 항등식입니다. Lₓ, Lᵧ, Lz는 서로 교환하지 않으므로 셋을 동시에 확정할 수 없고, 대신 [L², Lz] = 0이므로 L²과 Lz 짝만 동시 측정 가능합니다 — 그래서 상태 라벨이 |l, m⟩ 딱 두 개입니다."
          : "The error is machine precision (~10⁻¹⁶): the commutation relations are identities, not approximations. Since Lₓ, Lᵧ, Lz don't commute, no state can pin all three; but [L², Lz] = 0, so the compatible pair L², Lz can be fixed together — which is exactly why states carry the two labels |l, m⟩."}
      </Dim>
    </Card>
  );
}

function VectorModel({ lang }) {
  const isKo = lang === "ko";
  const [l, setL] = useState(2);
  const [phase, setPhase] = useState(0);
  const [spin, setSpin] = useState(true);
  useEffect(() => {
    if (!spin) return;
    let raf; let t0 = null;
    const step = ts => { if (t0 === null) t0 = ts; setPhase(((ts - t0) / 1200) % (2 * Math.PI)); raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [spin]);
  const W = 460, Hp = 400, cx = W / 2, cy = Hp / 2 + 8;
  const Lmag = Math.sqrt(l * (l + 1));
  const scale = 140 / Math.sqrt(3 * 4); // fits l=3
  const R = Lmag * scale;
  const ms = Array.from({ length: 2 * l + 1 }, (_, k) => l - k);
  return (
    <Card>
      <Hd>{isKo ? "벡터 모델 — 길이는 √(l(l+1))ℏ, 그림자는 mℏ" : "Vector model — length √(l(l+1))ℏ, shadow mℏ"}</Hd>
      <Row>
        <svg viewBox={`0 0 ${W} ${Hp}`} style={svgBox(W)}>
          <line x1={cx} x2={cx} y1={cy + R + 24} y2={cy - R - 26} stroke={C.textDim} strokeWidth={1.4} markerEnd="url(#wk3zax)" />
          <text x={cx + 8} y={cy - R - 14} fill={C.textDim} fontSize={12}>z</text>
          <defs>
            <marker id="wk3zax" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill={C.textDim} /></marker>
          </defs>
          {ms.map((m, i) => {
            const zpix = m * scale;
            const rho = Math.sqrt(Math.max(0, R * R - zpix * zpix));
            return (
              <g key={i}>
                <ellipse cx={cx} cy={cy - zpix} rx={rho} ry={rho * 0.28} fill="none" stroke={C.border} strokeDasharray="4 4" />
                <line x1={cx - 168} x2={cx - rho - 6} y1={cy - zpix} y2={cy - zpix} stroke={C.border} strokeWidth={1} />
                <text x={cx - 172} y={cy - zpix + 4} textAnchor="end" fill={C.text} fontSize={11.5}>m = {m > 0 ? "+" + m : m}</text>
              </g>
            );
          })}
          {ms.map((m, i) => {
            const zpix = m * scale;
            const rho = Math.sqrt(Math.max(0, R * R - zpix * zpix));
            const px = cx + rho * Math.cos(phase + i * 1.1);
            const py = cy - zpix - rho * 0.28 * Math.sin(phase + i * 1.1);
            return (
              <g key={"v" + i}>
                <line x1={cx} y1={cy} x2={px} y2={py} stroke={C.accent} strokeWidth={2.2} opacity={0.9} />
                <circle cx={px} cy={py} r={4} fill={C.accentSoft} />
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r={3.5} fill={C.text} />
          <text x={cx + R * 0.42} y={cy + R * 0.72} fill={C.accentSoft} fontSize={12.5} fontWeight={700}>|L| = √{l * (l + 1)} ℏ = {Lmag.toFixed(3)} ℏ</text>
        </svg>
        <div style={{ flex: "1 1 260px" }}>
          <div>
            {[1, 2, 3].map(v => <Pill key={v} on={l === v} onClick={() => setL(v)}>l = {v}</Pill>)}
            <Pill on={spin} color={C.cyan} onClick={() => setSpin(v => !v)}>{spin ? (isKo ? "세차 ⏸" : "precess ⏸") : (isKo ? "세차 ▶" : "precess ▶")}</Pill>
          </div>
          <Note style={{ marginTop: 6 }}>
            {isKo
              ? `벡터 길이는 lℏ가 아니라 √(l(l+1))ℏ입니다 — 그래서 m = +l이어도 벡터는 z축에 완전히 눕지 못합니다(최소 원뿔각 ${(Math.acos(l / Lmag) * 180 / Math.PI).toFixed(2)}°). z축을 확정하면 [Lz,Lx] ≠ 0 때문에 Lx, Ly는 원뿔 위 어딘가로 퍼져 있어야 합니다.`
              : `The vector's length is √(l(l+1))ℏ, not lℏ — so even m = +l cannot lie flat on the z-axis (minimum cone angle ${(Math.acos(l / Lmag) * 180 / Math.PI).toFixed(2)}°). Fixing z forces Lx, Ly to smear over the cone, because [Lz,Lx] ≠ 0.`}
          </Note>
          <Row style={{ marginTop: 8 }}>
            {ms.filter(m => m >= 0).map(m => (
              <KV key={m} k={`θ(m=${m >= 0 ? "+" + m : m})`} v={(Math.acos(m / Lmag) * 180 / Math.PI).toFixed(2) + "°"} color={C.sky} />
            ))}
          </Row>
          <Dim style={{ marginTop: 8 }}>
            {isKo ? "l = 2, m = +2의 35.26°는 강의 슬라이드의 원뿔 그림과 정확히 같은 값입니다." : "For l = 2, m = +2 the 35.26° matches the cone diagram on the lecture slide exactly."}
          </Dim>
        </div>
      </Row>
    </Card>
  );
}

function AngMomTab({ lang }) {
  const isKo = lang === "ko";
  const { Lp } = buildAngMom(2);
  return (
    <div>
      <Card>
        <Hd>{isKo ? "고전에서 양자로 — L̂ = r̂ × p̂" : "Classical to quantum — L̂ = r̂ × p̂"}</Hd>
        <Note>
          {isKo
            ? "고전 각운동량 l = r × p의 각 성분에 x → X̂, p → −iℏ∂를 대입하면 양자 연산자가 됩니다. [X̂ₗ, P̂ₘ] = iℏδₗₘ 하나만으로 다음이 따라 나옵니다:"
            : "Substitute x → X̂, p → −iℏ∂ into each component of the classical l = r × p. From the single relation [X̂ₗ, P̂ₘ] = iℏδₗₘ everything follows:"}
        </Note>
        <Eq>[L̂ₗ, L̂ₘ] = iℏ Σₙ εₗₘₙ L̂ₙ (Levi-Civita ε), [L̂², L̂ₘ] = 0</Eq>
        <Note>
          {isKo
            ? "εₗₘₙ은 (1,2,3)의 짝순열에서 +1, 홀순열에서 −1, 그 외 0인 기호로, 세 교환관계 [Lx,Ly] = iℏLz(순환)를 한 줄로 요약합니다."
            : "The Levi-Civita symbol εₗₘₙ (+1 for even permutations of (1,2,3), −1 for odd, 0 otherwise) packs the three cyclic relations [Lx,Ly] = iℏLz into one line."}
        </Note>
      </Card>

      <Card>
        <Hd>{isKo ? "양립 가능 관측량 — 언제 동시 측정이 되는가" : "Compatible observables — when simultaneous measurement works"}</Hd>
        <Note>
          {isKo
            ? "일반화 불확정성 원리 (ΔA)²(ΔB)² ≥ |⟨[A,B]⟩/2i|² 에 따르면, 교환하지 않는 두 관측량에는 언제나 0이 아닌 불확정성이 남습니다. 반대로 [A,B] = 0이면 두 연산자는 공통 고유벡터(동시 대각화)를 가지며, A 측정 → B 측정 → 다시 A 측정을 해도 처음 값 aᵢ가 그대로 나옵니다 — 파동함수 붕괴가 서로의 결과를 망가뜨리지 않습니다. 불확정성 0의 동시 측정!"
            : "By the generalized uncertainty principle (ΔA)²(ΔB)² ≥ |⟨[A,B]⟩/2i|², non-commuting observables always carry residual uncertainty. If instead [A,B] = 0, the operators share common eigenvectors (simultaneous diagonalization): measuring A → B → A again returns the original aᵢ — each collapse leaves the other's result intact. Simultaneous measurement with zero uncertainty!"}
        </Note>
        <Eq>(ΔA)²(ΔB)² ≥ |⟨ψ|[A,B]|ψ⟩ / 2i|²</Eq>
        <Row>
          <KV k={isKo ? "동시 측정 가능" : "Compatible"} v="{L², Lz}" color={C.ok} />
          <KV k={isKo ? "동시 측정 불가" : "Incompatible"} v="{Lx, Ly, Lz}" color={C.err} />
          <KV k={isKo ? "상태 라벨" : "State labels"} v="|l, m⟩" color={C.accentSoft} />
        </Row>
      </Card>

      <Card>
        <Hd>{isKo ? "사다리 연산자 L̂± — m의 범위가 결정되다" : "Ladder operators L̂± — the range of m, decided"}</Hd>
        <Note>
          {isKo
            ? "L̂± = L̂ₓ ± iL̂ᵧ 는 [L̂z, L̂±] = ±ℏL̂± 를 만족하므로 m을 한 칸씩 올리고 내립니다. ⟨L² − Lz²⟩ = ⟨Lx² + Ly²⟩ ≥ 0 에서 m에 최대·최소가 있어야 하고, L̂₊|l, mₘₐₓ⟩ = 0 조건에서 mₘₐₓ = l, mₘᵢₙ = −l이 나옵니다. 계수까지:"
            : "L̂± = L̂ₓ ± iL̂ᵧ satisfy [L̂z, L̂±] = ±ℏL̂±, stepping m up and down. Since ⟨L² − Lz²⟩ = ⟨Lx² + Ly²⟩ ≥ 0, m must be bounded; termination L̂₊|l, mₘₐₓ⟩ = 0 gives mₘₐₓ = l, mₘᵢₙ = −l. With coefficients:"}
        </Note>
        <Eq>L̂±|l,m⟩ = ℏ√((l∓m)(l±m+1)) |l, m±1⟩</Eq>
        <HdSub>{isKo ? "예: l = 2 사다리 (c₊/ℏ 값)" : "Example: the l = 2 ladder (c₊/ℏ values)"}</HdSub>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 6 }}>
          {[-2, -1, 0, 1, 2].map((m, i) => (
            <div key={m} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ background: C.card, border: `1px solid ${C.accent}`, borderRadius: 10, padding: "6px 10px", fontSize: 12.5, fontWeight: 800, color: C.accentSoft }}>|2,{m > 0 ? "+" + m : m}⟩</div>
              {i < 4 && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: C.ok, fontSize: 11, fontWeight: 800 }}>→ {Lp[3 - i][4 - i].toFixed(3)}</div>
                </div>
              )}
            </div>
          ))}
        </div>
        <Dim style={{ marginTop: 6 }}>
          {isKo ? "√4 = 2.000, √6 = 2.449 — 시뮬레이션 코드의 c₊(2,m) 출력과 동일합니다. 양 끝에서는 L₊|2,+2⟩ = L₋|2,−2⟩ = 0 (사다리 종결)." : "√4 = 2.000, √6 = 2.449 — identical to the c₊(2,m) output of the simulation codes. At both ends L₊|2,+2⟩ = L₋|2,−2⟩ = 0 (ladder termination)."}
        </Dim>
      </Card>

      <CommutatorLab lang={lang} />
      <VectorModel lang={lang} />
    </div>
  );
}

// =============================================================
// 5) SPHERICAL HARMONICS
// =============================================================
function SphGallery({ lang }) {
  const isKo = lang === "ko";
  const [l, setL] = useState(1);
  const [m, setM] = useState(0);
  const [mode, setMode] = useState("Y");   // "Y": |Y_l^m|, "P": |Y|^2
  const mm = Math.min(Math.abs(m), l) * Math.sign(m || 1);
  const W = 420, Hp = 400, cx = W / 2, cy = Hp / 2;
  const norm = useMemo(() => {
    let vmax = 0;
    for (let t = 0; t <= Math.PI + 1e-9; t += 0.01) vmax = Math.max(vmax, Math.abs(YlmTheta(l, mm, t)));
    return vmax;
  }, [l, mm]);
  const lobes = useMemo(() => {
    const pos = [], neg = [];
    const S = 150;
    for (let t = 0; t <= 2 * Math.PI + 1e-9; t += 0.005) {
      const th = t <= Math.PI ? t : 2 * Math.PI - t;       // symmetric continuation
      const val = YlmTheta(l, mm, th);
      const r = mode === "Y" ? Math.abs(val) / norm : (val * val) / (norm * norm);
      const px = cx + S * r * Math.sin(t);                  // z-axis vertical
      const py = cy - S * r * Math.cos(t);
      (val >= 0 ? pos : neg).push([px, py, t]);
    }
    // split into contiguous segments
    const seg = arr => {
      const out = []; let cur = [];
      for (let i = 0; i < arr.length; i++) {
        if (cur.length && Math.abs(arr[i][2] - cur[cur.length - 1][2]) > 0.05) { out.push(cur); cur = []; }
        cur.push(arr[i]);
      }
      if (cur.length) out.push(cur);
      return out.filter(s => s.length > 3);
    };
    return { pos: seg(pos), neg: seg(neg) };
  }, [l, mm, mode, norm]);
  const formulas = {
    "0,0": "Y₀⁰ = (1/4π)^½",
    "1,0": "Y₁⁰ = (3/4π)^½ cosθ",
    "1,1": "Y₁±¹ = ∓(3/8π)^½ sinθ e^{±iφ}",
    "2,0": "Y₂⁰ = (5/16π)^½ (3cos²θ − 1)",
    "2,1": "Y₂±¹ = ∓(15/8π)^½ sinθcosθ e^{±iφ}",
    "2,2": "Y₂±² = (15/32π)^½ sin²θ e^{±2iφ}",
    "3,0": "Y₃⁰ = (7/16π)^½ (5cos³θ − 3cosθ)",
  };
  const fkey = `${l},${Math.abs(mm)}`;
  return (
    <Card>
      <Hd>{isKo ? "Y_l^m 갤러리 — 각도 확률의 지형" : "Y_l^m gallery — the landscape of angular probability"}</Hd>
      <Note style={{ marginBottom: 6 }}>
        {isKo
          ? "z축(세로) 주위로 회전 대칭인 단면 |Y_l^m(θ)|을 극좌표로 그렸습니다. 보라 = 양(+), 분홍 = 음(−) 부호 영역. |m|이 클수록 로브가 적도로 눕고, l − |m| = θ 방향 마디 수입니다."
          : "A polar cross-section of |Y_l^m(θ)|, rotationally symmetric about the vertical z-axis. Violet = positive, pink = negative sign regions. Larger |m| flattens the lobes toward the equator; l − |m| counts the θ-direction nodes."}
      </Note>
      <Row>
        <svg viewBox={`0 0 ${W} ${Hp}`} style={svgBox(W)}>
          <line x1={cx} x2={cx} y1={30} y2={Hp - 30} stroke={C.border} strokeWidth={1} strokeDasharray="4 4" />
          <line x1={40} x2={W - 40} y1={cy} y2={cy} stroke={C.border} strokeWidth={1} strokeDasharray="4 4" />
          <text x={cx + 6} y={40} fill={C.textDim} fontSize={12}>z</text>
          {lobes.pos.map((s, i) => <path key={"p" + i} d={pathFrom(s) + " Z"} fill={C.accent} opacity={0.5} stroke={C.accentSoft} strokeWidth={1.5} />)}
          {lobes.neg.map((s, i) => <path key={"n" + i} d={pathFrom(s) + " Z"} fill={C.pink} opacity={0.45} stroke={C.pink} strokeWidth={1.5} />)}
        </svg>
        <div style={{ flex: "1 1 260px" }}>
          <div>
            {[0, 1, 2, 3].map(v => <Pill key={v} on={l === v} onClick={() => { setL(v); setM(Math.min(Math.abs(m), v) * Math.sign(m || 1)); }}>l = {v}</Pill>)}
          </div>
          <div>
            {Array.from({ length: 2 * l + 1 }, (_, k) => k - l).map(v => (
              <Pill key={v} color={C.sky} on={mm === v} onClick={() => setM(v)}>m = {v > 0 ? "+" + v : v}</Pill>
            ))}
          </div>
          <div>
            <Pill on={mode === "Y"} onClick={() => setMode("Y")}>|Y|</Pill>
            <Pill on={mode === "P"} onClick={() => setMode("P")}>|Y|²</Pill>
          </div>
          {formulas[fkey] && <Eq>{formulas[fkey]}</Eq>}
          <Row style={{ marginTop: 4 }}>
            <KV k={isKo ? "θ 마디 수" : "θ nodes"} v={l - Math.abs(mm)} color={C.sky} />
            <KV k={isKo ? "겹침 (같은 l)" : "Degeneracy (per l)"} v={2 * l + 1} />
          </Row>
          <Dim style={{ marginTop: 8 }}>
            {isKo
              ? "l = 0: 완전 구형(s). l = 1, m = 0: z축 아령(p_z). l = 2, m = 0: 아령+도넛(d_z²). 강의 슬라이드의 3D 그림과 같은 단면입니다."
              : "l = 0: perfect sphere (s). l = 1, m = 0: dumbbell along z (p_z). l = 2, m = 0: dumbbell + donut (d_z²). These are cross-sections of the 3D figures on the lecture slide."}
          </Dim>
        </div>
      </Row>
    </Card>
  );
}

function SphHarmTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <Card>
        <Hd>{isKo ? "사다리로 짓는 Y_l^m — 미분방정식 없이" : "Building Y_l^m with ladders — no differential equation needed"}</Hd>
        <Note>
          {isKo
            ? "구면좌표에서 L̂z = −iℏ∂/∂φ 이므로 고유함수는 Y_l^m = ψ_l^m(θ)e^{imφ} 꼴입니다. 꼭대기 상태는 L̂₊Y_l^l = 0 을 만족해야 하고, 이 1계 ODE의 해가 ψ_l^l ∝ (sinθ)^l 입니다. 이제 L̂₋를 반복 적용하면 아래층 Y_l^{l−1}, Y_l^{l−2}, … 이 차례로 생성됩니다 — 조화진동자에서 â†로 사다리를 오르던 것과 완전히 같은 구조입니다."
            : "In spherical coordinates L̂z = −iℏ∂/∂φ, so eigenfunctions look like Y_l^m = ψ_l^m(θ)e^{imφ}. The top state must satisfy L̂₊Y_l^l = 0, a first-order ODE solved by ψ_l^l ∝ (sinθ)^l. Repeatedly applying L̂₋ then generates Y_l^{l−1}, Y_l^{l−2}, … — structurally identical to climbing the oscillator ladder with â†."}
        </Note>
        <Eq>{"L̂± = ±ℏe^{±iφ}(∂/∂θ ± i cotθ ∂/∂φ),   L̂₊Y_l^l = 0  ⇒  ψ_l^l = A(sinθ)^l"}</Eq>
        <Eq>L²Y_l^m = ℏ²l(l+1)Y_l^m, L̂zY_l^m = ℏmY_l^m</Eq>
      </Card>

      <SphGallery lang={lang} />

      <Card>
        <Hd>{isKo ? "직교규격성과 완전성" : "Orthonormality and completeness"}</Hd>
        <Eq>∫ (Y_l'^m')* Y_l^m sinθ dθdφ = δ&#8343;&#8343;' δ&#8344;&#8344;'</Eq>
        <Note>
          {isKo
            ? "구면 위 임의 함수는 f(θ,φ) = Σ c_lm Y_l^m 으로 전개됩니다(완전성). 시뮬레이션 코드의 수치 적분: ⟨Y₁⁰|Y₁⁰⟩ = 1.000000, ⟨Y₂¹|Y₂¹⟩ = 1.000000, 교차항 ⟨Y₁⁰|Y₂⁰⟩ ~ 10⁻¹⁶."
            : "Any function on the sphere expands as f(θ,φ) = Σ c_lm Y_l^m (completeness). Numerical quadrature from the simulation codes: ⟨Y₁⁰|Y₁⁰⟩ = 1.000000, ⟨Y₂¹|Y₂¹⟩ = 1.000000, cross terms ⟨Y₁⁰|Y₂⁰⟩ ~ 10⁻¹⁶."}
        </Note>
        <Note style={{ marginTop: 6 }}>
          {isKo
            ? "좌표와의 연결: 고정된 r에서 z = rcosθ = r(4π/3)^½ Y₁⁰. 즉 '방향 함수로서의 z'가 곧 Y₁⁰이고, 같은 방식으로 x, y는 Y₁±¹의 결합입니다 — 다음 절의 분자 궤도 그림이 여기서 나옵니다."
            : "The coordinate connection: at fixed r, z = rcosθ = r(4π/3)^½ Y₁⁰ — 'z as a function of direction' is Y₁⁰ itself, and likewise x, y are combinations of Y₁±¹. The molecular-orbital pictures of the next section follow from exactly this."}
        </Note>
      </Card>

      <Card>
        <Hd>{isKo ? "실수 결합 — 화학자의 p, d 궤도" : "Real combinations — the chemist's p and d orbitals"}</Hd>
        <Note>
          {isKo
            ? "복소함수 Y₁±¹은 그림으로 그리기 불편하므로, 같은 고유공간 안에서 실수 기저로 재조합합니다:"
            : "The complex Y₁±¹ are awkward to draw, so within the same eigenspace we recombine into a real basis:"}
        </Note>
        <Eq>pₓ = (Y₁⁻¹ − Y₁¹)/√2, pᵧ = i(Y₁⁻¹ + Y₁¹)/√2, p_z = Y₁⁰</Eq>
        <Eq>d_xy = i(Y₂⁻² − Y₂²)/√2, d_yz = i(Y₂⁻¹ + Y₂¹)/√2, d_z² = Y₂⁰, d_xz = i(Y₂⁻¹ − Y₂¹)/√2, d_x²₋y² = i(Y₂⁻² + Y₂²)/√2</Eq>
        <Dim>
          {isKo
            ? "결합은 L²의 고유값(같은 l)을 보존하지만, 서로 다른 m을 섞으므로 Lz 고유상태는 아닙니다. 화학 결합 방향성(σ, π 결합)을 설명할 때는 이 실수 궤도가 훨씬 자연스럽습니다."
            : "The combinations preserve the L² eigenvalue (same l) but mix different m, so they are not Lz eigenstates. For directional chemical bonding (σ, π), the real orbitals are far more natural."}
        </Dim>
      </Card>
    </div>
  );
}

// =============================================================
// 6) HYDROGEN ATOM
// =============================================================
function RadialViewer({ lang }) {
  const isKo = lang === "ko";
  const [n, setN] = useState(1);
  const [l, setL] = useState(0);
  const [showR, setShowR] = useState(false); // false: r²R², true: R
  const lc = Math.min(l, n - 1);
  const W = 560, Hp = 340, pad = 44;
  const rmax = Math.max(14, 2.2 * n * n);
  const data = useMemo(() => {
    const pts = [];
    let vmax = 0, pmax = 0;
    for (let r = 1e-4; r <= rmax; r += rmax / 700) {
      const R = Rnl(n, lc, r);
      const P = R * R * r * r;
      pts.push([r, R, P]);
      vmax = Math.max(vmax, Math.abs(R));
      pmax = Math.max(pmax, P);
    }
    // <r> and r_mp numerically
    let num = 0, den = 0, rmp = 0, best = -1;
    for (const [r, , P] of pts) { num += r * P; den += P; if (P > best) { best = P; rmp = r; } }
    return { pts, vmax, pmax, ravg: num / den, rmp };
  }, [n, lc, rmax]);
  const X = r => pad + r / rmax * (W - 2 * pad);
  const Y = v => {
    const scale = showR ? data.vmax : data.pmax;
    return Hp - pad - Math.max(0, v + (showR ? data.vmax * 0.25 : 0)) / (scale * (showR ? 1.3 : 1.05)) * (Hp - 2 * pad);
  };
  const curve = pathFrom(data.pts.map(([r, R, P]) => [X(r), Y(showR ? R : P)]));
  const zero = Y(0);
  return (
    <Card>
      <Hd>{isKo ? "지름 함수 뷰어 — R_nl 과 r²R²_nl" : "Radial viewer — R_nl and r²R²_nl"}</Hd>
      <Row>
        <svg viewBox={`0 0 ${W} ${Hp}`} style={svgBox(W)}>
          <line x1={pad} x2={W - pad} y1={zero} y2={zero} stroke={C.border} strokeWidth={1} />
          <path d={curve} fill="none" stroke={C.accentSoft} strokeWidth={2.2} />
          {!showR && (
            <g>
              <line x1={X(data.ravg)} x2={X(data.ravg)} y1={pad / 2} y2={Hp - pad} stroke={C.ok} strokeWidth={1.2} strokeDasharray="4 4" />
              <text x={X(data.ravg) + 4} y={pad / 2 + 12} fill={C.ok} fontSize={11}>⟨r⟩ = {data.ravg.toFixed(2)} a₀</text>
              <line x1={X(data.rmp)} x2={X(data.rmp)} y1={pad / 2 + 22} y2={Hp - pad} stroke={C.amber} strokeWidth={1.2} strokeDasharray="4 4" />
              <text x={X(data.rmp) + 4} y={pad / 2 + 34} fill={C.amber} fontSize={11}>r_mp = {data.rmp.toFixed(2)} a₀</text>
            </g>
          )}
          <text x={pad} y={Hp - 12} fill={C.textDim} fontSize={11}>r / a₀ (0 … {rmax.toFixed(0)})</text>
          <text x={W - pad - 130} y={pad / 2 + 12} fill={C.accentSoft} fontSize={12} fontWeight={800}>{showR ? `R_${n}${lc}(r)` : `P(r) = r²R²_${n}${lc}`}</text>
        </svg>
        <div style={{ flex: "1 1 240px" }}>
          <Slider label={isKo ? "주양자수 n" : "Principal n"} value={n} min={1} max={5} step={1} onChange={v => { setN(v); if (l > v - 1) setL(v - 1); }} />
          <div>
            {Array.from({ length: n }, (_, k) => k).map(v => (
              <Pill key={v} color={C.sky} on={lc === v} onClick={() => setL(v)}>l = {v} ({["s", "p", "d", "f", "g"][v]})</Pill>
            ))}
          </div>
          <div>
            <Pill on={!showR} onClick={() => setShowR(false)}>r²R²</Pill>
            <Pill on={showR} onClick={() => setShowR(true)}>R(r)</Pill>
          </div>
          <Row>
            <KV k="Eₙ" v={`${(-13.6057 / (n * n)).toFixed(4)} eV`} color={C.err} />
            <KV k={isKo ? "지름 마디 수" : "Radial nodes"} v={`n−l−1 = ${n - lc - 1}`} color={C.sky} />
            <KV k="⟨r⟩" v={`${data.ravg.toFixed(2)} a₀`} color={C.ok} />
          </Row>
          <Dim style={{ marginTop: 8 }}>
            {isKo
              ? "1s의 최빈 반지름은 정확히 a₀ = 0.529 Å — Bohr 반지름이 파동역학 안에서 '가장 확률 높은 거리'로 되살아납니다. ⟨r⟩_1s = 1.5a₀는 분포의 꼬리 때문입니다."
              : "The most probable radius of 1s is exactly a₀ = 0.529 Å — Bohr's radius reborn as the most likely distance. ⟨r⟩_1s = 1.5a₀ exceeds it because of the distribution's tail."}
          </Dim>
        </div>
      </Row>
    </Card>
  );
}

function LevelDiagram({ lang }) {
  const isKo = lang === "ko";
  const [withSpin, setWithSpin] = useState(false);
  const W = 560, Hp = 360, pad = 46;
  const yOf = E => pad + ((-E) / 14.2) * (Hp - 2 * pad);
  const levels = [1, 2, 3, 4, 5].map(n => ({ n, E: -13.6057 / (n * n) }));
  return (
    <Card>
      <Hd>{isKo ? "에너지 준위와 겹침" : "Energy levels and degeneracy"}</Hd>
      <Row>
        <svg viewBox={`0 0 ${W} ${Hp}`} style={svgBox(W)}>
          <line x1={pad} x2={W - pad} y1={yOf(0)} y2={yOf(0)} stroke={C.textDim} strokeWidth={1} strokeDasharray="2 4" />
          <text x={W - pad - 66} y={yOf(0) - 6} fill={C.textDim} fontSize={11}>E = 0 ({isKo ? "이온화" : "ionized"})</text>
          {levels.map(({ n, E }) => (
            <g key={n}>
              <line x1={pad + 20} x2={W - pad - 130} y1={yOf(E)} y2={yOf(E)} stroke={n === 1 ? C.accent : C.sky} strokeWidth={n === 1 ? 3 : 2} />
              <text x={pad - 4} y={yOf(E) + 4} textAnchor="end" fill={C.text} fontSize={11.5} fontWeight={700}>n={n}</text>
              <text x={W - pad - 124} y={yOf(E) + 4} fill={C.textDim} fontSize={11}>{E.toFixed(3)} eV · g = {withSpin ? 2 * n * n : n * n}</text>
            </g>
          ))}
          <line x1={pad + 70} x2={pad + 70} y1={yOf(-13.6057)} y2={yOf(-3.4014)} stroke={C.gold} strokeWidth={2} markerEnd="url(#wk3ly)" />
          <text x={pad + 76} y={(yOf(-13.6057) + yOf(-3.4014)) / 2} fill={C.gold} fontSize={11.5} fontWeight={700}>Lyman α 121.5 nm</text>
          <defs><marker id="wk3ly" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill={C.gold} /></marker></defs>
        </svg>
        <div style={{ flex: "1 1 240px" }}>
          <Eq>E&#8345; = −me⁴/(32π²ε₀²ℏ²) · 1/n² = −13.6057 eV / n²</Eq>
          <div>
            <Pill on={!withSpin} onClick={() => setWithSpin(false)}>{isKo ? "스핀 제외: g = n²" : "no spin: g = n²"}</Pill>
            <Pill on={withSpin} color={C.cyan} onClick={() => setWithSpin(true)}>{isKo ? "스핀 포함: g = 2n²" : "with spin: g = 2n²"}</Pill>
          </div>
          <Note style={{ marginTop: 6 }}>
            {isKo
              ? "E가 l, m에 무관한 것은 쿨롱 1/r 퍼텐셜만의 특별한 '우연 겹침'입니다(Week 2의 3D 상자 우연 겹침과 비교). n² = Σ(2l+1)이고, 스핀 s = ±½ 까지 세면 2n² — 주기율표 껍질 크기 2, 8, 18, 32가 여기서 나옵니다."
              : "The independence of E from l and m is an accidental degeneracy peculiar to the Coulomb 1/r potential (compare Week 2's 3D-box accident). n² = Σ(2l+1), and counting spin s = ±½ doubles it to 2n² — the periodic-table shell sizes 2, 8, 18, 32."}
          </Note>
        </div>
      </Row>
    </Card>
  );
}

function HydrogenTab({ lang }) {
  const isKo = lang === "ko";
  const steps = isKo
    ? [
      ["1", "분리", "[H, L²] = [H, Lz] = 0 이므로 ψ = R(r)Y_l^m(θ,φ) — 각도 부분은 이미 풀려 있다"],
      ["2", "치환", "U = rR 로 놓으면 1D Schrödinger 꼴 + 유효 퍼텐셜(원심 항 ℏ²l(l+1)/2mr²)"],
      ["3", "급수해", "U = e^{−λρ}ρ^{l+1}Σc_kρ^k → 점화식 k(k+2l+1)c_k = [2(k+l)λ−2]c_{k−1}"],
      ["4", "절단", "규격화 가능하려면 급수가 q차에서 종결 → λ = 1/(q+l) ≡ 1/n"],
      ["5", "해의 정체", "절단된 급수 = 연관 Laguerre 다항식 L_{n−l−1}^{(2l+1)}(ρ)"],
      ["6", "스펙트럼", "E_n = −13.6057/n² eV — Rydberg 공식이 유도되었다"],
    ]
    : [
      ["1", "Separate", "[H, L²] = [H, Lz] = 0, so ψ = R(r)Y_l^m(θ,φ) — the angular part is already solved"],
      ["2", "Substitute", "U = rR turns the radial equation into 1D Schrödinger form + centrifugal term ℏ²l(l+1)/2mr²"],
      ["3", "Series", "U = e^{−λρ}ρ^{l+1}Σc_kρ^k → recursion k(k+2l+1)c_k = [2(k+l)λ−2]c_{k−1}"],
      ["4", "Truncate", "Normalizability forces termination at order q → λ = 1/(q+l) ≡ 1/n"],
      ["5", "Identify", "The truncated series = associated Laguerre polynomial L_{n−l−1}^{(2l+1)}(ρ)"],
      ["6", "Spectrum", "E_n = −13.6057/n² eV — the Rydberg formula, derived"],
    ];
  return (
    <div>
      <Card>
        <Hd>{isKo ? "수소 원자 — 이번 주 전체가 모이는 곳" : "The hydrogen atom — where the whole week converges"}</Hd>
        <Note>
          {isKo
            ? "쿨롱 퍼텐셜 V = −e²/4πε₀r 은 구대칭이므로 각운동량이 보존되고([H,L²] = [H,Lz] = 0), 해는 자동으로 ψ_nlm = R_nl(r)Y_l^m(θ,φ)로 갈라집니다. 각도 문제는 구면조화함수가 이미 끝냈고, 남은 것은 1차원 지름 방정식 — 조화진동자에서 연습한 '급수해 + 절단' 기술을 그대로 다시 씁니다."
            : "The Coulomb potential V = −e²/4πε₀r is spherically symmetric, so angular momentum is conserved ([H,L²] = [H,Lz] = 0) and the solution factorizes as ψ_nlm = R_nl(r)Y_l^m(θ,φ). The angular problem is already done by the spherical harmonics; what remains is a 1D radial equation — attacked with exactly the series-plus-truncation technique rehearsed on the oscillator."}
        </Note>
        {steps.map(([num, t, d]) => (
          <div key={num} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ minWidth: 22, height: 22, borderRadius: 999, background: C.accent, color: "#0b0f17", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{num}</div>
            <div style={{ minWidth: 92, fontWeight: 800, color: C.accentSoft, fontSize: 13 }}>{t}</div>
            <Dim style={{ flex: 1 }}>{d}</Dim>
          </div>
        ))}
        <Eq size={14}>R&#8345;&#8343;(r) = N ρ^l e^{"{−ρ/2}"} L&#8345;₋&#8343;₋₁^{"{(2l+1)}"}(ρ), ρ = 2r/na₀, a₀ = 4πε₀ℏ²/me²</Eq>
      </Card>

      <RadialViewer lang={lang} />
      <LevelDiagram lang={lang} />

      <Card>
        <Hd>{isKo ? "양자수의 위계 — 그리고 스핀" : "The hierarchy of quantum numbers — and spin"}</Hd>
        <Row>
          <div style={{ flex: "1 1 300px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(isKo
                ? [["n = 1, 2, 3, …", "주양자수 — 에너지 결정", C.accent], ["l = 0, …, n−1", "방위양자수 — |L| = √(l(l+1))ℏ", C.sky], ["m = −l, …, +l", "자기양자수 — Lz = mℏ", C.cyan], ["s = ±½", "스핀 — 파동함수 밖의 자유도", C.pink]]
                : [["n = 1, 2, 3, …", "principal — sets the energy", C.accent], ["l = 0, …, n−1", "azimuthal — |L| = √(l(l+1))ℏ", C.sky], ["m = −l, …, +l", "magnetic — Lz = mℏ", C.cyan], ["s = ±½", "spin — a degree of freedom beyond ψ(r)", C.pink]]
              ).map(([a, b, col], i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ background: C.card, border: `1px solid ${col}`, color: col, borderRadius: 10, padding: "7px 11px", fontWeight: 800, fontSize: 12.5, minWidth: 130, textAlign: "center" }}>{a}</div>
                  <Dim>{b}</Dim>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: "1 1 300px" }}>
            <Note>
              {isKo
                ? "1922년 Stern-Gerlach 실험에서 은 원자빔은 자기장 속에서 연속 분포가 아니라 정확히 두 줄로 갈라졌습니다. 궤도 각운동량으로는 설명되지 않는(2l+1은 홀수!) 이 '2'가 스핀 s = ±½의 서명입니다. 스핀 연산자는 같은 대수를 따릅니다:"
                : "In the 1922 Stern-Gerlach experiment a silver beam split into exactly two spots, not a continuum. Orbital angular momentum cannot give an even count (2l+1 is odd!) — that '2' is the signature of spin s = ±½. The spin operators obey the same algebra:"}
            </Note>
            <Eq>S²ψ = ℏ²·½(½+1)ψ = (3ℏ²/4)ψ, Szψ = ±(ℏ/2)ψ</Eq>
            <Dim>
              {isKo
                ? "완전한 전자 상태는 |n, l, m, s⟩. 이번 주에 만든 각운동량 대수가 반정수 l = ½도 허용했던 것을 기억하세요 — 자연은 그 가능성을 스핀으로 사용했습니다."
                : "The full electron state is |n, l, m, s⟩. Recall that our ladder algebra allowed half-integer l = ½ — nature took that option and called it spin."}
            </Dim>
          </div>
        </Row>
      </Card>
    </div>
  );
}

// =============================================================
// 7) PRACTICE
// =============================================================
function Problem({ idx, title, children, solution, lang }) {
  const isKo = lang === "ko";
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
        <div style={{ fontWeight: 800, color: C.accentSoft, fontSize: 14.5 }}>P{idx}. {title}</div>
        <button onClick={() => setOpen(v => !v)} style={{ background: open ? C.accent : C.card, color: open ? "#0b0f17" : C.text, border: `1px solid ${open ? C.accent : C.border}`, borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
          {open ? (isKo ? "풀이 닫기" : "Hide solution") : (isKo ? "풀이 보기" : "Show solution")}
        </button>
      </div>
      <Note style={{ marginTop: 6 }}>{children}</Note>
      {open && <div style={{ marginTop: 10, borderTop: `1px dashed ${C.border}`, paddingTop: 10 }}>{solution}</div>}
    </Card>
  );
}

function PracticeTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <Problem idx={1} lang={lang} title={isKo ? "HCl의 영점에너지" : "Zero-point energy of HCl"}
        solution={<Note>
          {isKo ? "E₀ = ½ℏω = ½hcω̃. 1 cm⁻¹ = 1.2398×10⁻⁴ eV 이므로 ℏω = 2990 × 1.2398×10⁻⁴ = 0.3707 eV, 따라서 E₀ ≈ 0.185 eV. 실온 kT ≈ 0.026 eV의 14배 — 진동은 실온에서 사실상 전부 바닥상태에 얼어 있습니다." : "E₀ = ½ℏω = ½hcω̃. With 1 cm⁻¹ = 1.2398×10⁻⁴ eV, ℏω = 2990 × 1.2398×10⁻⁴ = 0.3707 eV, so E₀ ≈ 0.185 eV — about 14× room-temperature kT ≈ 0.026 eV, so the vibration is frozen in its ground state at 300 K."}
        </Note>}>
        {isKo ? "HCl의 진동수 ω̃ ≈ 2990 cm⁻¹ 이다. 영점에너지를 eV로 구하고 실온 kT와 비교하라." : "HCl vibrates at ω̃ ≈ 2990 cm⁻¹. Find the zero-point energy in eV and compare with room-temperature kT."}
      </Problem>

      <Problem idx={2} lang={lang} title={isKo ? "점화식으로 H₃ 만들기" : "Building H₃ from the recurrence"}
        solution={<Note>
          <Eq>H₃ = 2y·H₂ − 2·2·H₁ = 2y(4y² − 2) − 4(2y) = 8y³ − 12y</Eq>
          {isKo ? "3개의 실근(마디) y = 0, ±√(3/2) — ψ₃의 마디 수 3과 일치합니다." : "Three real roots (nodes) at y = 0, ±√(3/2) — matching the 3 nodes of ψ₃."}
        </Note>}>
        {isKo ? "H₁ = 2y, H₂ = 4y²−2 와 점화식 Hₙ₊₁ = 2yHₙ − 2nHₙ₋₁ 로 H₃를 구하고, 마디 수를 확인하라." : "Using H₁ = 2y, H₂ = 4y²−2 and Hₙ₊₁ = 2yHₙ − 2nHₙ₋₁, find H₃ and check its node count."}
      </Problem>

      <Problem idx={3} lang={lang} title={isKo ? "â|n⟩ = √n|n−1⟩ 유도" : "Deriving â|n⟩ = √n|n−1⟩"}
        solution={<Note>
          {isKo ? "â|n⟩ = cₙ|n−1⟩로 놓으면 |cₙ|² = ⟨n|â†â|n⟩ = ⟨n|(Ĥ/ℏω − ½)|n⟩ = (n+½) − ½ = n. 위상을 실수로 잡으면 cₙ = √n. 같은 방법으로 â†|n⟩ = √(n+1)|n+1⟩ — 행렬 히트맵의 부대각 원소들이 바로 이 값입니다." : "Set â|n⟩ = cₙ|n−1⟩. Then |cₙ|² = ⟨n|â†â|n⟩ = ⟨n|(Ĥ/ℏω − ½)|n⟩ = (n+½) − ½ = n; choosing a real phase, cₙ = √n. Likewise â†|n⟩ = √(n+1)|n+1⟩ — exactly the off-diagonal entries in the matrix heatmap."}
        </Note>}>
        {isKo ? "규격화 조건과 n̂ = â†â 를 이용해 â|n⟩ = √n|n−1⟩ 임을 보여라." : "Use normalization and n̂ = â†â to show â|n⟩ = √n|n−1⟩."}
      </Problem>

      <Problem idx={4} lang={lang} title={isKo ? "[L̂ₓ, L̂ᵧ] = iℏL̂z 유도" : "Deriving [L̂ₓ, L̂ᵧ] = iℏL̂z"}
        solution={<Note>
          <Eq size={13.5}>[YPz−ZPᵧ, ZPₓ−XPz] = [YPz, ZPₓ] + [ZPᵧ, XPz] = Y[Pz,Z]Pₓ + X[Z,Pz]Pᵧ</Eq>
          {isKo ? "= −iℏYPₓ + iℏXPᵧ = iℏ(XPᵧ − YPₓ) = iℏL̂z. 좌표와 운동량 중 짝이 맞는 [Pz,Z] = −iℏ 항만 살아남습니다." : "= −iℏYPₓ + iℏXPᵧ = iℏ(XPᵧ − YPₓ) = iℏL̂z. Only the matched pair [Pz,Z] = −iℏ survives."}
        </Note>}>
        {isKo ? "L̂ₓ = ŶP̂z − ẐP̂ᵧ, L̂ᵧ = ẐP̂ₓ − X̂P̂z 와 [X̂ₗ, P̂ₘ] = iℏδₗₘ 만으로 [L̂ₓ, L̂ᵧ]를 계산하라." : "From L̂ₓ = ŶP̂z − ẐP̂ᵧ, L̂ᵧ = ẐP̂ₓ − X̂P̂z and [X̂ₗ, P̂ₘ] = iℏδₗₘ alone, evaluate [L̂ₓ, L̂ᵧ]."}
      </Problem>

      <Problem idx={5} lang={lang} title={isKo ? "l = 2 상태의 측정값" : "Measured values in an l = 2 state"}
        solution={<Note>
          {isKo ? "L² 측정값은 ℏ²·2·3 = 6ℏ² 하나뿐(|L| = √6 ℏ = 2.449ℏ). Lz는 mℏ = −2ℏ … +2ℏ 다섯 값. m = +1의 원뿔각은 cosθ = 1/√6 → θ = 65.91°. m = +2라도 θ = 35.26° > 0 — 벡터는 결코 z축에 눕지 못합니다." : "L² can only give ℏ²·2·3 = 6ℏ² (so |L| = √6 ℏ = 2.449ℏ). Lz gives one of five values mℏ = −2ℏ … +2ℏ. For m = +1 the cone angle is cosθ = 1/√6 → θ = 65.91°; even m = +2 keeps θ = 35.26° > 0 — the vector never lies on the z-axis."}
        </Note>}>
        {isKo ? "l = 2인 상태에서 L²과 Lz의 가능한 측정값을 모두 나열하고, m = +1일 때 L 벡터와 z축 사이 각을 구하라." : "For an l = 2 state list every possible outcome of L² and Lz, and find the angle between L and the z-axis when m = +1."}
      </Problem>

      <Problem idx={6} lang={lang} title={isKo ? "Y₁⁰ 의 규격화" : "Normalizing Y₁⁰"}
        solution={<Note>
          <Eq size={13.5}>∫|Y₁⁰|²dΩ = (3/4π)·2π ∫₀^π cos²θ sinθ dθ = (3/2)·[−cos³θ/3]₀^π = (3/2)(2/3) = 1 ✓</Eq>
          {isKo ? "u = cosθ 치환으로 ∫u²du = 2/3. 시뮬레이션의 수치 적분 1.000000과 일치." : "Substituting u = cosθ gives ∫u²du = 2/3. Matches the numerical quadrature 1.000000 in the codes."}
        </Note>}>
        {isKo ? "Y₁⁰ = (3/4π)^½ cosθ 가 구면에서 규격화되어 있음을 적분으로 보여라." : "Show by direct integration that Y₁⁰ = (3/4π)^½ cosθ is normalized on the sphere."}
      </Problem>

      <Problem idx={7} lang={lang} title={isKo ? "Lyman α 파장" : "The Lyman α wavelength"}
        solution={<Note>
          {isKo ? "ΔE = 13.6057(1 − ¼) = 10.204 eV. λ = hc/ΔE = 1239.84 eV·nm / 10.204 eV = 121.50 nm — 자외선. 수소가 우주에서 내는 가장 밝은 선이며, 관측 우주론의 'Lyman-α 숲'이 바로 이 전이입니다." : "ΔE = 13.6057(1 − ¼) = 10.204 eV. λ = hc/ΔE = 1239.84 eV·nm / 10.204 eV = 121.50 nm — ultraviolet. It is hydrogen's brightest line in the cosmos; the 'Lyman-α forest' of observational cosmology is this very transition."}
        </Note>}>
        {isKo ? "수소의 n = 2 → 1 전이에서 방출되는 광자의 파장을 구하라 (hc = 1239.84 eV·nm)." : "Find the wavelength of the photon emitted in hydrogen's n = 2 → 1 transition (hc = 1239.84 eV·nm)."}
      </Problem>

      <Problem idx={8} lang={lang} title={isKo ? "n = 3 껍질의 상태 세기" : "Counting states in the n = 3 shell"}
        solution={<Note>
          {isKo ? "l = 0(1개) + l = 1(3개) + l = 2(5개) = 9 = n². 스핀 s = ±½ 를 곱하면 18 = 2n². 허용되는 (n,l,m) 예: (3,2,−2) ✓, (3,3,0) ✗ (l ≤ n−1 위반), (3,1,+2) ✗ (|m| ≤ l 위반)." : "l = 0 (1) + l = 1 (3) + l = 2 (5) = 9 = n². Times spin s = ±½: 18 = 2n². Valid (n,l,m) check: (3,2,−2) ✓; (3,3,0) ✗ (violates l ≤ n−1); (3,1,+2) ✗ (violates |m| ≤ l)."}
        </Note>}>
        {isKo ? "n = 3에서 허용되는 (l, m) 조합을 모두 세어 겹침수를 구하고, 스핀 포함 값도 구하라. (3,3,0)과 (3,1,+2)는 왜 불가능한가?" : "Count all allowed (l, m) pairs for n = 3 and give the degeneracy with and without spin. Why are (3,3,0) and (3,1,+2) impossible?"}
      </Problem>
    </div>
  );
}

// =============================================================
// 8) RAW CODES
// =============================================================
function CodesTab({ lang }) {
  const isKo = lang === "ko";
  const [topic, setTopic] = useState("SHO");
  const [cl, setCl] = useState("PY");
  const bank = {
    SHO: { PY: PY_SHO, ML: ML_SHO, JL: JL_SHO, CPP: CPP_SHO },
    LADDER: { PY: PY_LADDER, ML: ML_LADDER, JL: JL_LADDER, CPP: CPP_LADDER },
    ANGMOM: { PY: PY_ANGMOM, ML: ML_ANGMOM, JL: JL_ANGMOM, CPP: CPP_ANGMOM },
    HYDROGEN: { PY: PY_HYDROGEN, ML: ML_HYDROGEN, JL: JL_HYDROGEN, CPP: CPP_HYDROGEN },
  };
  const tnames = {
    SHO: isKo ? "조화진동자" : "Harmonic oscillator",
    LADDER: isKo ? "사다리 연산자" : "Ladder operators",
    ANGMOM: isKo ? "각운동량" : "Angular momentum",
    HYDROGEN: isKo ? "수소 원자" : "Hydrogen atom",
  };
  const lnames = { PY: "Python", ML: "MATLAB", JL: "Julia", CPP: "C++" };
  return (
    <div>
      <Card>
        <Hd>{isKo ? "시뮬레이션 원본 코드 (4 토픽 × 4 언어)" : "Raw simulation codes (4 topics × 4 languages)"}</Hd>
        <Note style={{ marginBottom: 8 }}>
          {isKo
            ? "이 페이지의 모든 수치(직교성 1.000000, [â,â†] = 1, 원뿔각 35.26°, ⟨r⟩₁ₛ = 1.5a₀ …)는 아래 코드로 재현됩니다. 복사해서 직접 실행해 보세요."
            : "Every number on these pages (orthogonality 1.000000, [â,â†] = 1, cone angle 35.26°, ⟨r⟩₁ₛ = 1.5a₀ …) is reproduced by the codes below. Copy and run them yourself."}
        </Note>
        <div>{Object.keys(bank).map(k => <Pill key={k} on={topic === k} onClick={() => setTopic(k)}>{tnames[k]}</Pill>)}</div>
        <div>{Object.keys(lnames).map(k => <Pill key={k} color={C.sky} on={cl === k} onClick={() => setCl(k)}>{lnames[k]}</Pill>)}</div>
        <pre style={{ background: "#0d1117", border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, fontSize: 11.5, lineHeight: 1.55, color: "#d1d5db", overflowX: "auto", maxHeight: 560 }}>
          <code>{bank[topic][cl]}</code>
        </pre>
      </Card>
    </div>
  );
}

// =============================================================
// MAIN COMPONENT
// =============================================================
export default function Week03App({ onBack, lang: langProp, onLangChange }) {
  const [langLocal, setLangLocal] = useState(langProp || "ko");
  const lang = langProp != null ? langProp : langLocal;
  const setLang = v => { if (onLangChange) onLangChange(v); setLangLocal(v); };
  const [tab, setTab] = useState("overview");
  const t = i18n[lang];
  const tabs = Object.keys(t.tabs);
  const comps = {
    overview: Overview, sho: HarmonicTab, ladder: LadderTab, angmom: AngMomTab,
    sph: SphHarmTab, hydrogen: HydrogenTab, practice: PracticeTab, codes: CodesTab,
  };
  const Active = comps[tab];
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Pretendard', 'Noto Sans KR', -apple-system, 'Segoe UI', sans-serif", padding: "22px 4vw 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 6 }}>
        <div>
          {onBack && (
            <button onClick={onBack} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.textDim, borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: "pointer", marginBottom: 10 }}>
              ← {lang === "ko" ? "주차 목록" : "All weeks"}
            </button>
          )}
          <div style={{ fontSize: 24, fontWeight: 900, color: C.accentSoft, letterSpacing: 0.2 }}>{t.weekTitle}</div>
          <div style={{ fontSize: 13, color: C.textDim, marginTop: 4 }}>{t.subtitle}</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["ko", "en"].map(v => (
            <button key={v} onClick={() => setLang(v)} style={{ background: lang === v ? C.accent : C.card, color: lang === v ? "#0b0f17" : C.text, border: `1px solid ${lang === v ? C.accent : C.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 12.5, fontWeight: 800, cursor: "pointer" }}>
              {v === "ko" ? "한국어" : "EN"}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "14px 0 20px" }}>
        {tabs.map(k => (
          <button key={k} onClick={() => setTab(k)} style={{
            background: tab === k ? C.accent : C.panel, color: tab === k ? "#0b0f17" : C.text,
            border: `1px solid ${tab === k ? C.accent : C.border}`, borderRadius: 10,
            padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>{t.tabs[k]}</button>
        ))}
      </div>
      <Active lang={lang} />
      <div style={{ marginTop: 40, borderTop: `1px solid ${C.border}`, paddingTop: 14, fontSize: 11.5, color: C.textDim }}>
        Physical Chemistry 2 · Week 3 — Harmonic Oscillator & Angular Momentum · School of Chemical Engineering, SKKU · SPMDL · Prof. S. Joon Kwon
      </div>
    </div>
  );
}
