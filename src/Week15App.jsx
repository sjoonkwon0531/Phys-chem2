// ============================================================
// Week15App.jsx — Pattern Formation by Instability & Processes at Electrodes
// Physical Chemistry 2 (물리화학 2)
// SKKU School of Chemical Engineering
// Smart Process & Materials Design Lab (SPMDL)
// Prof. S. Joon Kwon
// ------------------------------------------------------------
// Topics covered (Wk15 Parts 1–2):
//   • Natural patterns, activation/inhibition, positive/negative feedback
//   • Linear stability of 2x2 systems: Jacobian, trace–determinant diagram
//   • Turing instability: conditions, dispersion relation, live simulations
//   • Gray–Scott, Lotka–Volterra (predator–prey), Gierer–Meinhardt models
//   • Electrical double layer: Helmholtz, Gouy–Chapman, Stern, Debye length
//   • Butler–Volmer equation, Tafel plots, cyclic voltammetry,
//     electrolysis and working galvanic cells
// ============================================================
import { useState, useMemo, useEffect, useRef } from "react";
import {
  PY_STAB, ML_STAB, JL_STAB, CPP_STAB,
  PY_RD, ML_RD, JL_RD, CPP_RD,
  PY_EDL, ML_EDL, JL_EDL, CPP_EDL,
  PY_EK, ML_EK, JL_EK, CPP_EK,
} from "./Week15Codes";

// ── i18n ─────────────────────────────────────────────────────
const i18n = {
  ko: {
    weekTitle: "Week 15 — 불안정성이 만드는 패턴과 전극 과정",
    subtitle: "활성·억제와 되먹임 · 선형 안정성 · Turing 불안정성 · Gray–Scott · Lotka–Volterra · Gierer–Meinhardt · 전기 이중층 · Butler–Volmer · Tafel · 순환 전압전류법",
    tabs: {
      overview: "개요",
      stability: "패턴과 선형 안정성",
      turing: "Turing 불안정성",
      models: "Gray–Scott 외 반응–확산 모형",
      edl: "전기 이중층",
      kinetics: "전극 반응 속도",
      practice: "연습문제",
      codes: "Raw 코드",
    },
  },
  en: {
    weekTitle: "Week 15 — Pattern Formation by Instability & Processes at Electrodes",
    subtitle: "Activation, inhibition and feedback · linear stability · Turing instability · Gray–Scott · Lotka–Volterra · Gierer–Meinhardt · electrical double layer · Butler–Volmer · Tafel · cyclic voltammetry",
    tabs: {
      overview: "Overview",
      stability: "Patterns & Linear Stability",
      turing: "Turing Instability",
      models: "Gray–Scott & Other RD Models",
      edl: "Electrical Double Layer",
      kinetics: "Electrode Kinetics",
      practice: "Practice",
      codes: "Raw Codes",
    },
  },
};

// ── design tokens (Week 15 accent: yellow) ───────────────
const C = {
  bg: "#0b0f17",
  panel: "#111827",
  card: "#1f2937",
  border: "#374151",
  text: "#e5e7eb",
  textDim: "#9ca3af",
  accent: "#fde047",
  accentSoft: "#fef08a",
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
const FARADAY = 96485.332, FRT = FARADAY / (RG * 298.15);   // f = F/RT at 298 K

// =============================================================
// MAIN COMPONENT
// =============================================================
export default function Week15App({ onBack, lang: langProp, onLangChange }) {
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
        {tab === "stability" && <StabilityTab lang={lang} />}
        {tab === "turing" && <TuringTab lang={lang} />}
        {tab === "models" && <ModelsTab lang={lang} />}
        {tab === "edl" && <EdlTab lang={lang} />}
        {tab === "kinetics" && <KineticsTab lang={lang} />}
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
    background: active ? "rgba(253,224,71,0.16)" : "transparent",
    color: active ? C.accentSoft : C.textDim,
    border: `1px solid ${active ? "rgba(253,224,71,0.45)" : "transparent"}`,
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
      tag: "Q1", color: C.accent, tab: "turing",
      ko: "확산은 농도 차이를 지우는 과정이다. 그런데 혼자서는 고르게 섞여 있던 두 화학종에 확산을 '더하면' 오히려 점과 줄무늬가 저절로 생긴다. 지우는 힘이 어떻게 무늬를 만들까?",
      en: "Diffusion erases concentration differences. Yet adding diffusion to two species that stay perfectly mixed on their own makes spots and stripes appear spontaneously. How can an eraser draw a pattern?",
      hint: { ko: "억제자가 활성자보다 빨리 퍼질 때 → Turing 불안정성", en: "When the inhibitor spreads faster than the activator → Turing Instability" },
    },
    {
      tag: "Q2", color: C.teal, tab: "stability",
      ko: "골짜기 바닥의 공은 살짝 밀어도 돌아오고, 말안장 위의 공은 굴러떨어진다. 화학 반응계의 '평형점'이 어느 쪽인지 숫자 두 개로 판정할 수 있을까?",
      en: "A ball in a valley returns when nudged; a ball on a saddle rolls away. Can two numbers tell which kind a chemical steady state is?",
      hint: { ko: "Jacobian의 대각합과 행렬식 → 패턴과 선형 안정성", en: "Trace and determinant of the Jacobian → Patterns & Linear Stability" },
    },
    {
      tag: "Q3", color: C.sky, tab: "edl",
      ko: "전극에 전압을 걸면 용액은 전극 가까이에서만 전기적 중성을 잃는다. 그 '가까이'는 1 M 소금물에서 0.3 nm, 0.1 mM에서는 30 nm다. 이 길이는 무엇이 정할까?",
      en: "Put a voltage on an electrode and the solution loses electroneutrality only close to it: 0.3 nm in 1 M salt water, 30 nm at 0.1 mM. What sets this length?",
      hint: { ko: "Poisson–Boltzmann 식과 Debye 길이 → 전기 이중층", en: "Poisson–Boltzmann equation and Debye length → Electrical Double Layer" },
    },
    {
      tag: "Q4", color: C.pink, tab: "kinetics",
      ko: "은 전극의 전위를 0.4 V 바꾸었을 뿐인데 Ag⁺ 환원 속도가 약 2400배 달라진다. 온도를 0.4 °C 바꾸어서는 절대 일어나지 않을 일이다. 전위는 어떻게 활성화 장벽을 직접 움직일까?",
      en: "Changing the potential of a silver electrode by just 0.4 V changes the Ag⁺ reduction rate about 2400-fold, something a 0.4 °C temperature change could never do. How does potential move the activation barrier directly?",
      hint: { ko: "전위가 장벽을 αFΔφ만큼 낮춘다 → 전극 반응 속도", en: "Potential lowers the barrier by αFΔφ → Electrode Kinetics" },
    },
  ];
  return (
    <div>
      <Card>
        <Hd>{isKo ? "이번 주의 질문" : "This week's questions"}</Hd>
        <Note>
          {isKo
            ? "학기의 마지막 주는 두 가지 '경계'의 이야기입니다. 전반부는 안정과 불안정의 경계입니다. 얼룩말의 줄무늬, 표범의 점, 산호의 미로 무늬는 유전자가 하나하나 그린 것이 아니라, 반응과 확산이 서로 다투다 '균일한 상태'가 불안정해지면서 저절로 생깁니다. 선형 안정성 분석으로 그 조건(Turing 조건)을 유도하고, 실시간 시뮬레이션으로 확인합니다. 후반부는 전극과 용액의 경계입니다. 14주차의 표면 이야기를 전하가 있는 표면으로 넓혀, 전기 이중층의 구조(Gouy–Chapman, Stern)와 전류를 정하는 Butler–Volmer 식, Tafel 분석, 순환 전압전류법, 전기분해와 전지의 전압 손실까지 이어 갑니다."
            : "The last week of the semester is a story about two boundaries. The first half is the boundary between stability and instability. Zebra stripes, leopard spots and the maze patterns of coral are not drawn gene by gene; they appear spontaneously when reaction and diffusion compete and the uniform state becomes unstable. We derive the conditions (the Turing conditions) by linear stability analysis and check them with live simulations. The second half is the boundary between an electrode and a solution. Extending the surfaces of Week 14 to charged surfaces, we follow the structure of the electrical double layer (Gouy–Chapman, Stern), the Butler–Volmer equation that sets the current, Tafel analysis, cyclic voltammetry, and voltage losses in electrolysis and batteries."}
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
          <Stat label={isKo ? "Turing 모형의 임계 확산 비 (억제자/활성자)" : "Critical diffusivity ratio, Turing's model (inhibitor/activator)"} value="D_a/D_b = 4" color={C.accent} />
          <Stat label={isKo ? "가장 빨리 자라는 파장 (D_a 0.1, D_b 0.02)" : "Fastest-growing wavelength (D_a 0.1, D_b 0.02)"} value={isKo ? "6.5 칸" : "6.5 cells"} color={C.accent} />
          <Stat label={isKo ? "Gray–Scott 점 무늬 (F, k)" : "Gray–Scott spots (F, k)"} value="(0.0367, 0.0649)" color={C.lime} />
          <Stat label={isKo ? "Debye 길이 (1:1 전해질, 25 °C)" : "Debye length (1:1 electrolyte, 25 °C)"} value="0.304/√(c/M) nm" color={C.sky} />
          <Stat label={isKo ? "Stern 이중층 용량 (0.1 M)" : "Stern double-layer capacitance (0.1 M)"} value="≈ 14 µF cm⁻²" color={C.sky} />
          <Stat label="RT/F (25 °C)" value="25.69 mV" color={C.pink} />
          <Stat label={isKo ? "Tafel 기울기 (α = 0.5)" : "Tafel slope (α = 0.5)"} value="118 mV/decade" color={C.pink} />
          <Stat label={isKo ? "Pt, Fe³⁺/Fe²⁺: j₀, α (강의 예제)" : "Pt, Fe³⁺/Fe²⁺: j₀, α (lecture example)"} value="2.4 mA cm⁻², 0.58" color={C.pink} />
          <Stat label={isKo ? "가역 CV 봉우리 간격 (25 °C)" : "Reversible CV peak separation (25 °C)"} value="≈ 57–59 mV" color={C.amber} />
        </StatGrid>
        <Note>
          {isKo
            ? "출처: A. M. Turing, Phil. Trans. R. Soc. Lond. B 237, 37 (1952). J. E. Pearson, Science 261, 189 (1993). Tafel 예제 자료는 P. Atkins, J. de Paula, Atkins' Physical Chemistry의 전극 과정 예제. CV 이론은 A. J. Bard, L. R. Faulkner, Electrochemical Methods, 2nd ed. (Wiley, 2001)."
            : "Sources: A. M. Turing, Phil. Trans. R. Soc. Lond. B 237, 37 (1952); J. E. Pearson, Science 261, 189 (1993); the Tafel example data are the electrode-process worked example of P. Atkins, J. de Paula, Atkins' Physical Chemistry; CV theory from A. J. Bard, L. R. Faulkner, Electrochemical Methods, 2nd ed. (Wiley, 2001)."}
        </Note>
      </Card>
    </div>
  );
}

function LectureMap({ isKo }) {
  const p1 = isKo
    ? [["자연의 패턴", "활성 대 억제, 양의 되먹임은 만들고 음의 되먹임은 다듬는다"], ["선형 안정성", "Jacobian, λ² − Tλ + Δ = 0, 대각합–행렬식 상평형도"], ["Turing 불안정성", "확산이 없으면 안정, 있으면 불안정: 두 조건과 분산 관계"], ["확장 모형", "Gray–Scott, Lotka–Volterra, Gierer–Meinhardt, 실험(CIMA)"]]
    : [["Patterns in nature", "activation vs inhibition; positive feedback creates, negative feedback shapes"], ["Linear stability", "Jacobian, λ² − Tλ + Δ = 0, trace–determinant diagram"], ["Turing instability", "stable without diffusion, unstable with it: two conditions and the dispersion relation"], ["Extended models", "Gray–Scott, Lotka–Volterra, Gierer–Meinhardt, experiments (CIMA)"]];
  const p2 = isKo
    ? [["전극–용액 계면", "Helmholtz, Gouy–Chapman, Stern 모형, Poisson–Boltzmann, Debye 길이"], ["전류 밀도", "Butler–Volmer 유도, 교환 전류, 전달 계수"], ["Tafel과 전압전류법", "ln j–η 직선, LSV·CV, 봉우리 간격, 화학 반응이 섞인 CV"], ["전기분해와 전지", "과전압, 옴 강하, 농도 과전압, 예제 세 가지"]]
    : [["Electrode–solution interface", "Helmholtz, Gouy–Chapman, Stern models, Poisson–Boltzmann, Debye length"], ["Current density", "Butler–Volmer derivation, exchange current, transfer coefficient"], ["Tafel and voltammetry", "ln j vs η lines, LSV and CV, peak separation, CV with coupled chemistry"], ["Electrolysis and cells", "overpotential, ohmic drop, concentration overpotential, three examples"]];
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
      {col(isKo ? "Part 1 · 불안정성이 만드는 패턴" : "Part 1 · Pattern formation by instability", p1, C.accent)}
      {col(isKo ? "Part 2 · 전극에서의 과정" : "Part 2 · Processes at electrodes", p2, C.sky)}
    </div>
  );
}

// =============================================================
// 2) PATTERNS & LINEAR STABILITY
// =============================================================
function StabilityTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <FeedbackCard isKo={isKo} />
      <HistoryCard isKo={isKo} />
      <LinearizeCard isKo={isKo} />
      <PhasePlaneLab isKo={isKo} />
    </div>
  );
}

function FeedbackCard({ isKo }) {
  const pairs = isKo ? [
    ["활성 대 억제", "스스로를 늘리는 성분(활성자)과 그것을 누르는 성분(억제자)"],
    ["협력 대 경쟁", "가까이에서는 돕고 멀리에서는 다투는 '경쟁적 협력'"],
    ["증폭 대 감쇠", "작은 요동을 키우는 힘과 안정화하는 힘"],
    ["성장 대 한계", "무한히 자랄 수 없게 만드는 자원·공간의 제약"],
    ["양의 되먹임 대 음의 되먹임", "양의 되먹임은 '만들고', 음의 되먹임은 '다듬는다'"],
  ] : [
    ["Activation vs inhibition", "a component that boosts itself (activator) and one that suppresses it (inhibitor)"],
    ["Cooperation vs competition", "helping nearby and competing far away: 'competitive cooperation'"],
    ["Amplification vs attenuation", "forces that grow small fluctuations and forces that stabilize"],
    ["Growth vs limit", "limits of resources and space that prevent unbounded growth"],
    ["Positive vs negative feedback", "positive feedback creates, negative feedback shapes"],
  ];
  return (
    <Card>
      <Hd>{isKo ? "자연은 무늬를 어떻게 그릴까: 다섯 쌍의 대립" : "How does nature draw patterns? Five opposing pairs"}</Hd>
      <Note>
        {isKo
          ? "얼룩말의 줄무늬, 표범의 점, 열대어의 미로 무늬, 사막의 모래 물결, 산호의 가지, 해바라기 씨의 나선. 이 패턴들은 크기도 재료도 다르지만 공통된 '문법'을 가집니다. 강의 8쪽의 다섯 쌍입니다. 핵심은 한쪽만으로는 무늬가 생기지 않는다는 점입니다. 증폭만 있으면 폭주하고, 억제만 있으면 모든 것이 고르게 평평해집니다. 둘이 다른 거리, 다른 속도로 작용할 때 일정한 간격의 무늬가 생깁니다."
          : "Zebra stripes, leopard spots, maze patterns on tropical fish, sand ripples, coral branches, the spirals of sunflower seeds: different sizes and materials, but a shared grammar, the five pairs on lecture page 8. The key is that neither side alone makes a pattern. Amplification alone runs away; suppression alone flattens everything. A pattern with a regular spacing appears when the two act over different distances and at different speeds."}
      </Note>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
        {pairs.map(([h, d], i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontWeight: 800, color: [C.accent, C.teal, C.sky, C.lime, C.pink][i], marginBottom: 4 }}>{h}</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: C.textDim }}>{d}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function HistoryCard({ isKo }) {
  const rows = [
    ["1952", "Turing", isKo ? "반응–확산으로 배아의 형태 형성(구 위의 두 형태 형성 물질)" : "reaction–diffusion for embryo morphogenesis (two morphogens on a sphere)"],
    ["1972", "Gierer & Meinhardt", isKo ? "국소 활성–측방 억제 모형" : "local activation and lateral inhibition"],
    ["1974", "Bard & Lauder", isKo ? "컴퓨터 시뮬레이션: 잎·모낭 분포처럼 덜 규칙적인 무늬" : "computer simulations of less regular patterns (leaves, hair follicles)"],
    ["1981", "Bard; Murray", isKo ? "동물 털 무늬, 몸 크기에 따른 점과 줄무늬" : "animal coat patterns; spots vs stripes depending on body size"],
    ["1987", "Meinhardt & Klingler", isKo ? "조개껍데기의 색소 무늬" : "pigment patterns on mollusc shells"],
    ["1990–91", "Castets et al.; Ouyang & Swinney", isKo ? "화학 반응(CIMA)에서 Turing 무늬 첫 실험 관찰" : "first experimental Turing patterns in a chemical reaction (CIMA)"],
    ["1991", "Turk", isKo ? "표범 장미 무늬, 임의 곡면 위의 무늬(컴퓨터 그래픽스)" : "leopard rosettes and patterns on arbitrary surfaces (computer graphics)"],
    ["1995", "Kondo & Asai", isKo ? "자라는 열대어(Pomacanthus) 줄무늬가 Turing 예측대로 갈라짐" : "growing angelfish (Pomacanthus) stripes split as Turing predicts"],
  ];
  return (
    <Card>
      <Hd>{isKo ? "Turing의 아이디어가 걸어온 길" : "The path of Turing's idea"}</Hd>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
          <tbody>{rows.map((r, i) => (
            <tr key={i}>
              <td style={{ padding: "6px 10px", color: C.accent, fontFamily: mono, borderBottom: `1px solid ${C.border}55`, whiteSpace: "nowrap" }}>{r[0]}</td>
              <td style={{ padding: "6px 10px", fontWeight: 700, borderBottom: `1px solid ${C.border}55`, whiteSpace: "nowrap" }}>{r[1]}</td>
              <td style={{ padding: "6px 10px", borderBottom: `1px solid ${C.border}55`, lineHeight: 1.5 }}>{r[2]}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <Note>
        {isKo
          ? "출처: A. M. Turing, Phil. Trans. R. Soc. Lond. B 237, 37 (1952); A. Gierer, H. Meinhardt, Kybernetik 12, 30 (1972); V. Castets et al., Phys. Rev. Lett. 64, 2953 (1990); Q. Ouyang, H. L. Swinney, Nature 352, 610 (1991); S. Kondo, R. Asai, Nature 376, 765 (1995)."
          : "Sources: A. M. Turing, Phil. Trans. R. Soc. Lond. B 237, 37 (1952); A. Gierer, H. Meinhardt, Kybernetik 12, 30 (1972); V. Castets et al., Phys. Rev. Lett. 64, 2953 (1990); Q. Ouyang, H. L. Swinney, Nature 352, 610 (1991); S. Kondo, R. Asai, Nature 376, 765 (1995)."}
      </Note>
    </Card>
  );
}

function LinearizeCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "선형 안정성: 평형점 근처에서 일어나는 일" : "Linear stability: what happens near a steady state"}</Hd>
      <Note>
        {isKo
          ? "두 화학종 x, y의 반응 속도식 ẋ = f(x, y), ẏ = g(x, y)가 있고, 평형점(정상 상태) (x*, y*)에서 f = g = 0이라고 합시다. 평형에서 조금 벗어난 Δx = x − x*, Δy = y − y*가 자라는지 사그라드는지가 안정성입니다. Taylor 전개의 1차 항만 남기면(선형화) 다음과 같습니다."
          : "Take two species with rate laws ẋ = f(x, y), ẏ = g(x, y) and a steady state (x*, y*) where f = g = 0. Stability asks whether a small departure Δx = x − x*, Δy = y − y* grows or dies away. Keeping only the first-order Taylor terms (linearization):"}
      </Note>
      <Eq>f(x, y) ≈ f(x*, y*) + (∂f/∂x)* Δx + (∂f/∂y)* Δy,   f(x*, y*) = 0</Eq>
      <Eq>d/dt [Δx, Δy]ᵀ = J [Δx, Δy]ᵀ,   J = [[∂f/∂x, ∂f/∂y], [∂g/∂x, ∂g/∂y]]* = [[A₁₁, A₁₂], [A₂₁, A₂₂]]   {isKo ? "(Jacobian)" : "(Jacobian)"}</Eq>
      <Note>
        {isKo
          ? "1차원 ẋ = λx의 해가 x = Ce^(λt)인 것처럼, 해를 [Δx, Δy] = [X, Y]e^(λt)로 두면 고유값 문제 JX = λX가 됩니다. 0이 아닌 해가 있으려면 det(J − λI) = 0이어야 합니다."
          : "Just as ẋ = λx has the solution x = Ce^(λt), try [Δx, Δy] = [X, Y]e^(λt): this gives the eigenvalue problem JX = λX, which has nonzero solutions only if det(J − λI) = 0."}
      </Note>
      <Eq>(A₁₁ − λ)(A₂₂ − λ) − A₁₂A₂₁ = 0   →   λ² − Tλ + Δ = 0,   T = A₁₁ + A₂₂,   Δ = A₁₁A₂₂ − A₁₂A₂₁</Eq>
      <Eq>λ₁,₂ = [T ± √(T² − 4Δ)]/2,     [Δx, Δy] = C₁X₁e^(λ₁t) + C₂X₂e^(λ₂t)</Eq>
      <Note>
        {isKo
          ? "판정 규칙은 단순합니다. 두 고유값의 실수부가 모두 음수이면 어떤 작은 요동도 사라집니다: T < 0이고 Δ > 0. Δ < 0이면 고유값 하나가 양수인 안장점, T² < 4Δ이면 고유값이 복소수라 나선을 그리며 돕니다. 이 숫자 두 개(T, Δ)만으로 평형점의 성격이 정해진다는 것이 아래 실험실의 내용입니다."
          : "The verdict is simple. If both eigenvalues have negative real parts every small disturbance dies: T < 0 and Δ > 0. Δ < 0 gives a saddle with one positive eigenvalue; T² < 4Δ gives complex eigenvalues and spiralling motion. That two numbers (T, Δ) fix the character of a steady state is what the lab below shows."}
      </Note>
    </Card>
  );
}

const PP_PRESETS = {
  stableNode: [-1, 0.3, 0.2, -2],
  saddle: [1, 0.5, 0.5, -1],
  stableSpiral: [-0.5, -2, 2, -0.5],
  unstableSpiral: [0.2, -1, 1, 0.2],
  centre: [0, -1, 1, 0],
  turing: [-0.08, -0.08, 0.08, 0.06],
};
function classifyTD(T, D, isKo) {
  if (D < -1e-9) return isKo ? "안장점 (불안정)" : "saddle (unstable)";
  if (Math.abs(T) < 1e-9 && D > 0) return isKo ? "중심 (중립)" : "centre (neutral)";
  const spiral = T * T - 4 * D < 0;
  if (T < 0) return spiral ? (isKo ? "안정 나선" : "stable spiral") : (isKo ? "안정 마디" : "stable node");
  return spiral ? (isKo ? "불안정 나선" : "unstable spiral") : (isKo ? "불안정 마디" : "unstable node");
}
function PhasePlaneLab({ isKo }) {
  const [A, setA] = useState(PP_PRESETS.stableSpiral);
  const [a11, a12, a21, a22] = A;
  const set = (i, v) => setA(A.map((x, j) => (j === i ? v : x)));
  const T = a11 + a22, D = a11 * a22 - a12 * a21;
  const disc = T * T - 4 * D;
  const ev = disc >= 0 ? [(T + Math.sqrt(disc)) / 2, (T - Math.sqrt(disc)) / 2].map(v => v.toFixed(3)).join(", ")
    : `${(T / 2).toFixed(3)} ± ${(Math.sqrt(-disc) / 2).toFixed(3)}i`;
  // trace-determinant diagram
  const W = 360, Ht = 300, pad = 36;
  const s1 = plotScale(-3, 3, -2.5, 5.2, W, Ht, pad);
  const par = []; for (let t = -3; t <= 3; t += 0.05) par.push([t, t * t / 4]);
  // phase portrait by RK4
  const W2 = 360, H2 = 300;
  const s2 = plotScale(-2, 2, -2, 2, W2, H2, 20);
  const scale = Math.max(Math.abs(a11), Math.abs(a12), Math.abs(a21), Math.abs(a22), 0.05);
  const dt = 0.02 / scale;
  const trajs = [];
  for (let k = 0; k < 12; k++) {
    const th = 2 * Math.PI * k / 12;
    let x = 1.8 * Math.cos(th), y = 1.8 * Math.sin(th);
    const p = [[x, y]];
    for (let n = 0; n < 600; n++) {
      const fx = (X, Y) => a11 * X + a12 * Y, fy = (X, Y) => a21 * X + a22 * Y;
      const k1x = fx(x, y), k1y = fy(x, y);
      const k2x = fx(x + dt / 2 * k1x, y + dt / 2 * k1y), k2y = fy(x + dt / 2 * k1x, y + dt / 2 * k1y);
      const k3x = fx(x + dt / 2 * k2x, y + dt / 2 * k2y), k3y = fy(x + dt / 2 * k2x, y + dt / 2 * k2y);
      const k4x = fx(x + dt * k3x, y + dt * k3y), k4y = fy(x + dt * k3x, y + dt * k3y);
      x += dt / 6 * (k1x + 2 * k2x + 2 * k3x + k4x); y += dt / 6 * (k1y + 2 * k2y + 2 * k3y + k4y);
      if (Math.abs(x) > 2.2 || Math.abs(y) > 2.2) break;
      p.push([x, y]);
    }
    trajs.push(p);
  }
  const stable = T < 0 && D > 0;
  const tdT = Math.max(-3, Math.min(3, T)), tdD = Math.max(-2.5, Math.min(5.1, D));
  return (
    <Card>
      <Hd>{isKo ? "실험실 ① 대각합–행렬식 지도와 위상 평면" : "Lab ① The trace–determinant map and the phase plane"}</Hd>
      <Row>
        {Object.entries(PP_PRESETS).map(([k, v]) => (
          <button key={k} onClick={() => setA(v)} style={btnStyle(A.join() === v.join())}>
            {{ stableNode: isKo ? "안정 마디" : "stable node", saddle: isKo ? "안장점" : "saddle", stableSpiral: isKo ? "안정 나선" : "stable spiral", unstableSpiral: isKo ? "불안정 나선" : "unstable spiral", centre: isKo ? "중심" : "centre", turing: isKo ? "Turing 모형 J/k (×0.02)" : "Turing model J (k = 0.02)" }[k]}
          </button>
        ))}
      </Row>
      <Row>
        <Slider label="A₁₁" value={a11} min={-2} max={2} step={0.01} onChange={v => set(0, v)} fmt={v => v.toFixed(2)} width={110} />
        <Slider label="A₁₂" value={a12} min={-2} max={2} step={0.01} onChange={v => set(1, v)} fmt={v => v.toFixed(2)} width={110} />
        <Slider label="A₂₁" value={a21} min={-2} max={2} step={0.01} onChange={v => set(2, v)} fmt={v => v.toFixed(2)} width={110} />
        <Slider label="A₂₂" value={a22} min={-2} max={2} step={0.01} onChange={v => set(3, v)} fmt={v => v.toFixed(2)} width={110} />
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <svg viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <rect x={s1.X(-3)} y={s1.Y(5.2)} width={s1.X(0) - s1.X(-3)} height={s1.Y(0) - s1.Y(5.2)} fill={C.ok} fillOpacity={0.12} />
          <line x1={s1.X(-3)} x2={s1.X(3)} y1={s1.Y(0)} y2={s1.Y(0)} stroke="#475569" />
          <line x1={s1.X(0)} x2={s1.X(0)} y1={s1.Y(-2.5)} y2={s1.Y(5.2)} stroke="#475569" />
          <path d={pathOf(par, s1.X, s1.Y)} fill="none" stroke={C.pink} strokeWidth={1.8} />
          <text x={s1.X(2.9)} y={s1.Y(0) - 6} fill={C.textDim} fontSize={11} textAnchor="end">T</text>
          <text x={s1.X(0) + 6} y={s1.Y(5.0)} fill={C.textDim} fontSize={11}>Δ</text>
          <text x={s1.X(-1.5)} y={s1.Y(3.3)} fill={C.ok} fontSize={11} textAnchor="middle">{isKo ? "안정" : "stable"}</text>
          <text x={s1.X(1.5)} y={s1.Y(3.3)} fill={C.pink} fontSize={11} textAnchor="middle">{isKo ? "불안정" : "unstable"}</text>
          <text x={s1.X(0)} y={s1.Y(-1.6)} fill={C.amber} fontSize={11} textAnchor="middle">{isKo ? "안장점 (Δ < 0)" : "saddle (Δ < 0)"}</text>
          <text x={s1.X(2.3)} y={s1.Y(1.1)} fill={C.pink} fontSize={10}>Δ = T²/4</text>
          <text x={s1.X(-2.9)} y={s1.Y(0.6)} fill={C.textDim} fontSize={10}>{isKo ? "마디" : "nodes"}</text>
          <text x={s1.X(-0.9)} y={s1.Y(2.0)} fill={C.textDim} fontSize={10}>{isKo ? "나선" : "spirals"}</text>
          <circle cx={s1.X(tdT)} cy={s1.Y(tdD)} r={7} fill="#fde047" stroke="#0b0f17" />
        </svg>
        <svg viewBox={`0 0 ${W2} ${H2}`} style={svgBox(W2)}>
          <line x1={s2.X(-2)} x2={s2.X(2)} y1={s2.Y(0)} y2={s2.Y(0)} stroke="#334155" />
          <line x1={s2.X(0)} x2={s2.X(0)} y1={s2.Y(-2)} y2={s2.Y(2)} stroke="#334155" />
          {trajs.map((p, i) => <path key={i} d={pathOf(p, s2.X, s2.Y)} fill="none" stroke={stable ? C.teal : C.pink} strokeWidth={1.3} strokeOpacity={0.85} />)}
          {trajs.map((p, i) => <circle key={"c" + i} cx={s2.X(p[0][0])} cy={s2.Y(p[0][1])} r={2.5} fill={C.textDim} />)}
          <circle cx={s2.X(0)} cy={s2.Y(0)} r={4} fill="#fde047" />
          <text x={W2 - 8} y={H2 - 8} fill={C.textDim} fontSize={10} textAnchor="end">Δx</text>
          <text x={s2.X(0) + 6} y={16} fill={C.textDim} fontSize={10}>Δy</text>
        </svg>
      </div>
      <StatGrid>
        <Stat label="T = A₁₁ + A₂₂" value={T.toFixed(3)} color={T < 0 ? C.ok : C.pink} />
        <Stat label="Δ = det J" value={D.toFixed(3)} color={D > 0 ? C.ok : C.amber} />
        <Stat label={isKo ? "고유값 λ" : "Eigenvalues λ"} value={ev} color={C.accent} />
        <Stat label={isKo ? "판정" : "Verdict"} value={classifyTD(T, D, isKo)} color={stable ? C.ok : C.pink} />
      </StatGrid>
      <Note>
        {isKo
          ? "왼쪽 지도의 초록 영역(T < 0, Δ > 0)에 점이 있으면 위상 평면의 모든 궤적이 원점으로 빨려 들어갑니다. 포물선 Δ = T²/4 위는 나선, 아래는 마디입니다. 'Turing 모형' 단추는 다음 탭에서 쓸 Turing의 반응식 f = k(16 − ab), g = k(ab − b − 12)의 Jacobian입니다. 이 반응계는 확산이 없을 때 안정 나선이므로 혼자서는 무늬를 만들지 못합니다. 그런데 확산을 더하면 상황이 바뀝니다."
          : "If the point sits in the green region of the map (T < 0, Δ > 0), every trajectory in the phase plane is sucked into the origin. Above the parabola Δ = T²/4 lie spirals, below it nodes. The 'Turing model' button loads the Jacobian of Turing's reactions f = k(16 − ab), g = k(ab − b − 12) used in the next tab. Without diffusion this system is a stable spiral, so it cannot make a pattern on its own. Adding diffusion changes that."}
      </Note>
    </Card>
  );
}

// =============================================================
// 3) TURING INSTABILITY
// =============================================================
function TuringTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <TuringDerivCard isKo={isKo} />
      <DispersionLab isKo={isKo} />
      <TuringSimLab isKo={isKo} />
      <ExperimentsCard isKo={isKo} />
    </div>
  );
}

function TuringDerivCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "유도: 확산이 안정한 반응계를 불안정하게 만드는 조건" : "Derivation: when diffusion destabilizes a stable reaction"}</Hd>
      <Note>
        {isKo
          ? "두 형태 형성 물질 A, B의 농도가 반응(F, G)과 확산(D_A∇², D_B∇²)으로 변한다고 합시다. 길이를 L, 시간을 t* = L²/D_A로 무차원화하면 확산 계수의 비 d = D_B/D_A와 반응 시간 척도의 비 γ = t*/t_C만 남습니다(강의 22쪽)."
          : "Let the concentrations of two morphogens A and B change by reaction (F, G) and diffusion (D_A∇², D_B∇²). Scaling length by L and time by t* = L²/D_A leaves only the diffusivity ratio d = D_B/D_A and the ratio of time scales γ = t*/t_C (lecture page 22)."}
      </Note>
      <Eq>∂a/∂t̂ = γ f(a, b) + ∇̂²a,     ∂b/∂t̂ = γ g(a, b) + d ∇̂²b</Eq>
      <Eq>{isKo ? "벡터로:" : "As a vector:"}  ∂W/∂t̂ = γ R W + D ∇̂²W,   W = [δa, δb],   D = [[1, 0], [0, d]],   R = J(a*, b*)</Eq>
      <Note>
        {isKo
          ? "평형점 근처의 작은 요동을 Fourier 성분 W ∝ e^(ik·r)로 쓰면(공간에 대한 Fourier 변환) ∇² → −k²이 되어, 편미분 방정식이 파수 k마다 따로 노는 상미분 방정식이 됩니다."
          : "Writing small disturbances near the steady state as Fourier modes W ∝ e^(ik·r) (a spatial Fourier transform) turns ∇² into −k², so the PDE splits into one ODE per wave number k."}
      </Note>
      <Eq>dW_k/dt̂ = Q(k) W_k,   Q = γR − k²D   →   λ(k)² − T(Q)λ + Δ(Q) = 0</Eq>
      <HdSub>{isKo ? "조건 1: 확산이 없으면 안정 (k = 0)" : "Condition 1: stable without diffusion (k = 0)"}</HdSub>
      <Eq>T(R) = R₁₁ + R₂₂ &lt; 0,     Δ(R) = R₁₁R₂₂ − R₁₂R₂₁ &gt; 0</Eq>
      <HdSub>{isKo ? "조건 2: 어떤 k에서는 불안정 (Δ(Q) < 0이 되어야 함)" : "Condition 2: unstable for some k (Δ(Q) must turn negative)"}</HdSub>
      <Eq>T(Q) = γT(R) − (1 + d)k² &lt; 0 {isKo ? "(항상)" : "(always)"}   →   {isKo ? "불안정은 Δ(Q) < 0에서만" : "instability needs Δ(Q) < 0"}</Eq>
      <Eq>Δ(Q) = γ²Δ(R) − γk²(dR₁₁ + R₂₂) + d k⁴</Eq>
      <Eq>{isKo ? "k²에 대한 포물선의 최솟값이 음수:" : "Minimum of this parabola in k² below zero:"}   dR₁₁ + R₂₂ &gt; 0   {isKo ? "그리고" : "and"}   (dR₁₁ + R₂₂)² &gt; 4dΔ(R)</Eq>
      <Eq>k*² = γ(dR₁₁ + R₂₂)/(2d),     {isKo ? "무늬의 파장" : "pattern wavelength"}  L_c = 2π/k*</Eq>
      <Note>
        {isKo
          ? "조건 1에서 R₁₁ + R₂₂ < 0인데 조건 2에서 dR₁₁ + R₂₂ > 0이려면 R₁₁과 R₂₂의 부호가 달라야 하고 d ≠ 1이어야 합니다. 곧 한 종은 스스로를 늘리고(활성자, R > 0), 다른 종은 스스로를 줄이며(억제자, R < 0), 억제자가 훨씬 빨리 퍼져야 합니다. '가까이에서는 활성, 멀리에서는 억제'가 수식으로 나온 것입니다. 무늬의 간격은 확산 계수와 반응 속도로만 정해지고, 처음 요동의 모양과는 무관합니다."
          : "Condition 1 needs R₁₁ + R₂₂ < 0, while condition 2 needs dR₁₁ + R₂₂ > 0, so R₁₁ and R₂₂ must have opposite signs and d ≠ 1. One species boosts itself (activator, R > 0), the other suppresses itself (inhibitor, R < 0), and the inhibitor must spread much faster: 'activate nearby, inhibit far away', now as an equation. The spacing of the pattern is set only by diffusivities and reaction rates, independent of the shape of the initial disturbance."}
      </Note>
    </Card>
  );
}

// Turing's model (lecture form): a = inhibitor, b = activator
const TK = { fa: -4, fb: -4, ga: 4, gb: 3 };   // Jacobian / k at (4, 4)
function DispersionLab({ isKo }) {
  const [Da, setDa] = useState(0.1);
  const [Db, setDb] = useState(0.02);
  const k = 0.02;
  const fa = TK.fa * k, fb = TK.fb * k, ga = TK.ga * k, gb = TK.gb * k;
  const T0 = fa + gb, D0 = fa * gb - fb * ga;
  const lam = q => {
    const a11 = fa - Da * q * q, a22 = gb - Db * q * q;
    const T = a11 + a22, D = a11 * a22 - fb * ga, disc = T * T - 4 * D;
    return disc >= 0 ? (T + Math.sqrt(disc)) / 2 : T / 2;
  };
  const pts = []; let best = [0, -1e9], qlo = null, qhi = null;
  for (let i = 0; i <= 400; i++) {
    const q = 2.0 * i / 400, l = lam(q);
    pts.push([q, l]);
    if (l > best[1]) best = [q, l];
    if (l > 0) { if (qlo === null) qlo = q; qhi = q; }
  }
  const ymin = -0.03, ymax = 0.015;
  const W = 620, Ht = 280, pad = 54;
  const { X, Y } = plotScale(0, 2, ymin, ymax, W, Ht, pad);
  const c1 = Db * fa + Da * gb, c2 = c1 * c1 - 4 * Da * Db * D0;
  const unstable = c1 > 0 && c2 > 0;
  return (
    <Card>
      <Hd>{isKo ? "실험실 ② Turing 모형의 분산 관계: 어떤 파장이 자라는가" : "Lab ② Dispersion relation of Turing's model: which wavelengths grow?"}</Hd>
      <Note>
        {isKo
          ? "강의의 반응식 f = k(16 − ab), g = k(ab − b − 12)는 a* = b* = 4에서 Jacobian이 k[[−4, −4], [4, 3]]입니다. b는 스스로를 늘리는 활성자(+3k), a는 억제자(−4k)입니다. 이 모형에 위의 조건을 넣으면 D_a/D_b > 4가 Turing 불안정의 기준입니다(9r² − 40r + 16 > 0의 큰 근)."
          : "The lecture reactions f = k(16 − ab), g = k(ab − b − 12) have the Jacobian k[[−4, −4], [4, 3]] at a* = b* = 4: b is the self-enhancing activator (+3k) and a the inhibitor (−4k). The conditions above give D_a/D_b > 4 as the Turing threshold for this model (the larger root of 9r² − 40r + 16 > 0)."}
      </Note>
      <Row>
        <Slider label={isKo ? "억제자 D_a" : "Inhibitor D_a"} value={Da} min={0.01} max={0.25} step={0.005} onChange={setDa} fmt={v => v.toFixed(3)} />
        <Slider label={isKo ? "활성자 D_b" : "Activator D_b"} value={Db} min={0.005} max={0.1} step={0.005} onChange={setDb} fmt={v => v.toFixed(3)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "파수 q (격자 간격⁻¹)" : "wave number q (per grid spacing)"} ylabel={isKo ? "성장률 Re λ_max" : "growth rate Re λ_max"} />
        <line x1={pad} x2={W - pad} y1={Y(0)} y2={Y(0)} stroke="#475569" strokeDasharray="3 3" />
        {qlo !== null && <rect x={X(qlo)} y={Y(ymax)} width={X(qhi) - X(qlo)} height={Y(0) - Y(ymax)} fill={C.accent} fillOpacity={0.1} />}
        <path d={pathOf(pts.map(([q, l]) => [q, Math.max(ymin, l)]), X, Y)} fill="none" stroke={C.accent} strokeWidth={2.4} />
        {unstable && <circle cx={X(best[0])} cy={Y(best[1])} r={5} fill={C.pink} />}
        {[0, 0.5, 1, 1.5, 2].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        {[-0.03, -0.015, 0, 0.015].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
      </svg>
      <StatGrid>
        <Stat label="D_a/D_b" value={(Da / Db).toFixed(2)} color={Da / Db > 4 ? C.ok : C.amber} />
        <Stat label={isKo ? "조건 (i) D_b f_a + D_a g_b > 0" : "Condition (i) D_b f_a + D_a g_b > 0"} value={c1 > 0 ? (isKo ? "만족" : "satisfied") : (isKo ? "불만족" : "fails")} color={c1 > 0 ? C.ok : C.pink} />
        <Stat label={isKo ? "조건 (ii) (…)² > 4D_aD_bΔ" : "Condition (ii) (…)² > 4D_aD_bΔ"} value={c2 > 0 ? (isKo ? "만족" : "satisfied") : (isKo ? "불만족" : "fails")} color={c2 > 0 ? C.ok : C.pink} />
        <Stat label={isKo ? "가장 빨리 자라는 파장" : "Fastest-growing wavelength"} value={unstable ? `${(2 * Math.PI / best[0]).toFixed(2)} ${isKo ? "칸" : "cells"}` : "—"} color={C.accent} />
        <Stat label={isKo ? "불안정 띠" : "Unstable band"} value={qlo !== null ? `q = ${qlo.toFixed(2)}–${qhi.toFixed(2)}` : (isKo ? "없음" : "none")} color={C.accent} />
      </StatGrid>
      <Note>
        {isKo
          ? "D_a/D_b를 4 아래로 내리면 곡선 전체가 0 아래로 내려가 모든 요동이 사라집니다. 4를 넘으면 유한한 파수 띠에서만 λ > 0이 됩니다. q = 0(균일한 변화)과 아주 큰 q(짧은 파장)는 여전히 안정하다는 점이 중요합니다. 그래서 무늬에는 '고유한 간격'이 생깁니다. 강의 값(D_a = 0.1, D_b = 0.02)에서는 약 6.5칸 간격이 가장 빨리 자랍니다."
          : "Push D_a/D_b below 4 and the whole curve drops below zero: every disturbance dies. Above 4, λ > 0 only in a finite band of wave numbers. That q = 0 (uniform change) and very large q (short wavelengths) stay stable is the key point: the pattern acquires an intrinsic spacing. At the lecture values (D_a = 0.1, D_b = 0.02) a spacing of about 6.5 cells grows fastest."}
      </Note>
    </Card>
  );
}

function colorMap(t) {   // 0..1 → dark navy → yellow
  const c = Math.max(0, Math.min(1, t));
  const r = Math.round(20 + 233 * Math.pow(c, 0.9)), g = Math.round(24 + 200 * c), b = Math.round(60 + 20 * (1 - c));
  return [r, g, b];
}
function useLoop(running, fn) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!running || typeof window === "undefined") return undefined;
    let id;
    const tick = () => { ref.current(); id = window.requestAnimationFrame(tick); };
    id = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(id);
  }, [running]);
}
function TuringSimLab({ isKo }) {
  const N = 96;
  const [Da, setDa] = useState(0.1);
  const [Db, setDb] = useState(0.02);
  const [noise, setNoise] = useState(0.1);
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState(0);
  const [seed, setSeed] = useState(1);
  const st = useRef(null);
  const cv = useRef(null);
  const init = () => {
    const rnd = makeRng(seed);
    const a = new Float32Array(N * N).fill(4), b = new Float32Array(N * N).fill(4), beta = new Float32Array(N * N);
    for (let i = 0; i < N * N; i++) beta[i] = 12 + noise * (2 * rnd() - 1);
    st.current = { a, b, beta, na: new Float32Array(N * N), nb: new Float32Array(N * N), n: 0 };
    setSteps(0);
  };
  useEffect(() => { init(); draw(); }, [seed, noise]);   // eslint-disable-line react-hooks/exhaustive-deps
  const draw = () => {
    const c = cv.current, s = st.current;
    if (!c || !s) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(N, N);
    let mn = 1e9, mx = -1e9;
    for (let i = 0; i < N * N; i++) { mn = Math.min(mn, s.b[i]); mx = Math.max(mx, s.b[i]); }
    const span = Math.max(mx - mn, 1e-6);
    for (let i = 0; i < N * N; i++) {
      const [r, g, bb] = colorMap((s.b[i] - mn) / span);
      img.data[4 * i] = r; img.data[4 * i + 1] = g; img.data[4 * i + 2] = bb; img.data[4 * i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  };
  const advance = nstep => {
    const s = st.current; if (!s) return;
    const k = 0.02;
    for (let t = 0; t < nstep; t++) {
      const { a, b, beta, na, nb } = s;
      for (let i = 0; i < N; i++) {
        const up = ((i + N - 1) % N) * N, dn = ((i + 1) % N) * N, row = i * N;
        for (let j = 0; j < N; j++) {
          const l = (j + N - 1) % N, r = (j + 1) % N, c = row + j;
          const la = a[up + j] + a[dn + j] + a[row + l] + a[row + r] - 4 * a[c];
          const lb = b[up + j] + b[dn + j] + b[row + l] + b[row + r] - 4 * b[c];
          na[c] = a[c] + Da * la + k * (16 - a[c] * b[c]);
          const v = b[c] + Db * lb + k * (a[c] * b[c] - b[c] - beta[c]);
          nb[c] = v > 0 ? v : 0;
        }
      }
      s.a = na; s.na = a; s.b = nb; s.nb = b;
      s.n++;
    }
    setSteps(s.n);
    draw();
  };
  useLoop(running, () => advance(30));
  return (
    <Card>
      <Hd>{isKo ? "실험실 ③ 실시간 Turing 무늬 (강의의 두 형태 형성 물질 모형, 2D)" : "Lab ③ Live Turing patterns (the lecture's two-morphogen model, 2D)"}</Hd>
      <Eq>a_ij ← a_ij + D_a ∇²a + k(16 − a b),     b_ij ← b_ij + D_b ∇²b + k(a b − b − β_ij),     β_ij = 12 ± {isKo ? "잡음" : "noise"}</Eq>
      <Row>
        <Slider label="D_a" value={Da} min={0.02} max={0.25} step={0.005} onChange={setDa} fmt={v => v.toFixed(3)} width={110} />
        <Slider label="D_b" value={Db} min={0.005} max={0.06} step={0.0025} onChange={setDb} fmt={v => v.toFixed(4)} width={110} />
        <Slider label={isKo ? "β 잡음" : "β noise"} value={noise} min={0.01} max={1} step={0.01} onChange={setNoise} fmt={v => v.toFixed(2)} width={110} />
      </Row>
      <Row>
        <button onClick={() => setRunning(!running)} style={btnStyle(running)}>{running ? (isKo ? "일시 정지" : "Pause") : (isKo ? "실행" : "Run")}</button>
        <button onClick={() => advance(500)} style={btnStyle()}>{isKo ? "+500 단계" : "+500 steps"}</button>
        <button onClick={() => { setSeed(seed + 1); }} style={btnStyle()}>{isKo ? "새 잡음으로 다시" : "Reset with new noise"}</button>
        <span style={{ fontFamily: mono, color: C.textDim, fontSize: 13 }}>{isKo ? "단계" : "step"} {steps} · D_a/D_b = {(Da / Db).toFixed(2)}</span>
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <canvas ref={cv} width={N} height={N} style={{ width: 384, maxWidth: "100%", aspectRatio: "1 / 1", imageRendering: "pixelated", borderRadius: 10, border: `1px solid ${C.border}`, background: "#0d1117" }} />
        <div style={{ flex: "1 1 280px" }}>
          <Note>
            {isKo
              ? "처음에는 모든 칸이 a = b = 4로 똑같고, β에만 아주 작은 잡음이 있습니다. '실행'을 누르면 수천 단계 뒤 잡음이 자라 일정한 간격의 점 또는 미로 무늬가 됩니다(밝을수록 활성자 b가 많음). 시도해 볼 것: ① D_a/D_b를 4 아래로(예: D_a = 0.06) 내리면 무늬가 생기지 않습니다. ② D_a를 키우면 억제가 멀리 미쳐 무늬 간격이 넓어집니다. ③ 잡음을 바꾸어 다시 시작해도 간격은 거의 같고 배치만 바뀝니다. 간격은 물리 상수가, 배치는 우연이 정합니다."
              : "Initially every cell has a = b = 4 and only β carries a tiny noise. Press Run: after a few thousand steps the noise grows into spots or a maze with a regular spacing (brighter = more activator b). Try this: (1) drop D_a/D_b below 4 (e.g. D_a = 0.06) and no pattern forms; (2) raise D_a and the inhibition reaches farther, widening the spacing; (3) restart with new noise: the spacing stays about the same and only the arrangement changes. Physics sets the spacing; chance sets the layout."}
          </Note>
          <Note>
            {isKo
              ? "이 모형과 매개변수 형식은 Turing(1952)의 식을 컴퓨터 그래픽스에 쓴 G. Turk, Comput. Graph. 25(4), 289 (1991)의 형태를 따랐습니다. 음수 농도는 0으로 잘랐습니다."
              : "The model and parameter form follow G. Turk, Comput. Graph. 25(4), 289 (1991), who used Turing's (1952) equations in computer graphics; negative concentrations are clipped at zero."}
          </Note>
        </div>
      </div>
    </Card>
  );
}

function ExperimentsCard({ isKo }) {
  const items = isKo ? [
    ["화학에서의 첫 관찰 (1990–91)", "아염소산–요오드화물–말론산(CIMA) 반응을 녹말이 든 겔 안에서 연속 공급하자 정지한 육각 점·줄무늬가 나타났다. 녹말이 요오드 활성자를 붙잡아 확산을 늦추는 것이 '억제자가 더 빨리 퍼지는' 조건을 만들었다. Lengyel–Epstein 모형이 이를 설명했다.", "Castets et al., PRL 64, 2953 (1990); Ouyang & Swinney, Nature 352, 610 (1991); Lengyel & Epstein, Science 251, 650 (1991)"],
    ["살아 있는 생물 (1995)", "열대어 Pomacanthus는 자라면서 줄무늬 사이에 새 줄무늬가 끼어들고 갈라진다. 고정된 그림이라면 늘어나기만 해야 하지만, 실제로는 간격을 유지하려고 재배열된다. 반응–확산 시뮬레이션이 이를 예측했다.", "Kondo & Asai, Nature 376, 765 (1995)"],
    ["무늬의 혼합 (2010)", "점 무늬 물고기와 미로 무늬 물고기의 잡종은 둘의 중간인 미로·점 혼합 무늬를 갖는다. 반응–확산 매개변수 공간에서 '중간 매개변수'로 예측된다.", "Miyazawa, Okamoto, Kondo, Nat. Commun. 1, 66 (2010)"],
    ["화학공학: Turing 구조 분리막 (2018)", "피페라진–TMC 계면 중합 때 고분자(폴리비닐알코올)를 넣어 단량체의 확산을 조절해 Turing 조건을 만들자, 폴리아마이드 나노여과막 표면에 나노 크기의 점·관 구조가 생겨 물 투과도가 크게 높아졌다.", "Z. Tan et al., Science 360, 518 (2018)"],
  ] : [
    ["First chemical observation (1990–91)", "The chlorite–iodide–malonic acid (CIMA) reaction, fed continuously in a starch-loaded gel, showed stationary hexagonal spots and stripes. Starch binds the iodine activator and slows its diffusion, creating the 'inhibitor spreads faster' condition; the Lengyel–Epstein model explained it.", "Castets et al., PRL 64, 2953 (1990); Ouyang & Swinney, Nature 352, 610 (1991); Lengyel & Epstein, Science 251, 650 (1991)"],
    ["Living organisms (1995)", "As the angelfish Pomacanthus grows, new stripes insert between old ones and branch. A fixed drawing would only stretch; instead the stripes rearrange to keep their spacing, as reaction–diffusion simulations predicted.", "Kondo & Asai, Nature 376, 765 (1995)"],
    ["Blending patterns (2010)", "Hybrids of spotted and maze-patterned fish carry an intermediate maze-spot pattern, predicted by 'intermediate parameters' in reaction–diffusion parameter space.", "Miyazawa, Okamoto, Kondo, Nat. Commun. 1, 66 (2010)"],
    ["Chemical engineering: Turing-structured membranes (2018)", "Adding a polymer (polyvinyl alcohol) during piperazine–TMC interfacial polymerization tuned monomer diffusion to create Turing conditions; nanoscale spots and tubes formed on polyamide nanofiltration membranes and raised water permeance substantially.", "Z. Tan et al., Science 360, 518 (2018)"],
  ];
  return (
    <Card>
      <Hd>{isKo ? "실험과 응용: 수식이 실제 무늬가 되기까지" : "Experiments and applications: from equations to real patterns"}</Hd>
      {items.map(([h, d, src], i) => (
        <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
          <div style={{ fontWeight: 800, color: [C.accent, C.lime, C.teal, C.pink][i], marginBottom: 4 }}>{h}</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.7 }}>{d}</div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 6, fontStyle: "italic" }}>{src}</div>
        </div>
      ))}
    </Card>
  );
}

// =============================================================
// 4) GRAY–SCOTT, LOTKA–VOLTERRA, GIERER–MEINHARDT
// =============================================================
function ModelsTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <GrayScottLab isKo={isKo} />
      <LotkaLab isKo={isKo} />
      <GiererLab isKo={isKo} />
      <CompareCard isKo={isKo} />
    </div>
  );
}

const GS_PRESETS = {
  spots: { F: 0.0367, k: 0.0649, ko: "세포 분열하는 점", en: "dividing spots" },
  maze: { F: 0.029, k: 0.057, ko: "미로·줄무늬", en: "maze / stripes" },
  coral: { F: 0.0545, k: 0.062, ko: "산호", en: "coral" },
  holes: { F: 0.039, k: 0.058, ko: "구멍", en: "holes" },
  waves: { F: 0.014, k: 0.045, ko: "진행파", en: "travelling waves" },
  decay: { F: 0.010, k: 0.070, ko: "소멸", en: "extinction" },
};
function GrayScottLab({ isKo }) {
  const N = 128;
  const [preset, setPreset] = useState("spots");
  const [F, setF] = useState(GS_PRESETS.spots.F);
  const [kk, setK] = useState(GS_PRESETS.spots.k);
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState(0);
  const [seed, setSeed] = useState(3);
  const st = useRef(null), cv = useRef(null);
  const init = () => {
    const rnd = makeRng(seed);
    const U = new Float32Array(N * N).fill(1), V = new Float32Array(N * N);
    for (let s = 0; s < 6; s++) {
      const ci = 20 + Math.floor(rnd() * (N - 40)), cj = 20 + Math.floor(rnd() * (N - 40));
      for (let i = ci - 5; i < ci + 5; i++) for (let j = cj - 5; j < cj + 5; j++) { U[i * N + j] = 0.5; V[i * N + j] = 0.25; }
    }
    for (let i = 0; i < N * N; i++) { U[i] += 0.02 * rnd(); V[i] += 0.02 * rnd(); }
    st.current = { U, V, nU: new Float32Array(N * N), nV: new Float32Array(N * N), n: 0 };
    setSteps(0);
  };
  useEffect(() => { init(); draw(); }, [seed]);   // eslint-disable-line react-hooks/exhaustive-deps
  const draw = () => {
    const c = cv.current, s = st.current; if (!c || !s) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const img = ctx.createImageData(N, N);
    for (let i = 0; i < N * N; i++) {
      const [r, g, b] = colorMap(s.V[i] / 0.4);
      img.data[4 * i] = r; img.data[4 * i + 1] = g; img.data[4 * i + 2] = b; img.data[4 * i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  };
  const advance = nstep => {
    const s = st.current; if (!s) return;
    for (let t = 0; t < nstep; t++) {
      const { U, V, nU, nV } = s;
      for (let i = 0; i < N; i++) {
        const up = ((i + N - 1) % N) * N, dn = ((i + 1) % N) * N, row = i * N;
        for (let j = 0; j < N; j++) {
          const l = (j + N - 1) % N, r = (j + 1) % N, c = row + j;
          const lu = U[up + j] + U[dn + j] + U[row + l] + U[row + r] - 4 * U[c];
          const lv = V[up + j] + V[dn + j] + V[row + l] + V[row + r] - 4 * V[c];
          const uvv = U[c] * V[c] * V[c];
          nU[c] = U[c] + 0.16 * lu - uvv + F * (1 - U[c]);
          nV[c] = V[c] + 0.08 * lv + uvv - (F + kk) * V[c];
        }
      }
      s.U = nU; s.nU = U; s.V = nV; s.nV = V; s.n++;
    }
    setSteps(s.n); draw();
  };
  useLoop(running, () => advance(20));
  const pick = p => { setPreset(p); setF(GS_PRESETS[p].F); setK(GS_PRESETS[p].k); setSeed(seed + 1); };
  return (
    <Card>
      <Hd>{isKo ? "실험실 ④ Gray–Scott 모형: 매개변수 두 개가 만드는 동물원" : "Lab ④ The Gray–Scott model: a zoo from two parameters"}</Hd>
      <Note>
        {isKo
          ? "Gray와 Scott이 연속 교반 반응기(CSTR)의 자기 촉매 반응으로 제안한 모형입니다. U + 2V → 3V(자기 촉매, 속도 상수 1), V → P(속도 k). 원료 U는 공급 속도 F로 들어오고, U와 V는 같은 속도로 씻겨 나갑니다. 1993년 Pearson은 이것을 2차원 반응–확산으로 풀어, 두 매개변수 (F, k)만 바꾸어도 점, 줄, 분열하는 점, 파동, 혼돈이 모두 나온다는 것을 보였습니다."
          : "Gray and Scott proposed this model for autocatalysis in a continuously stirred tank reactor (CSTR): U + 2V → 3V (autocatalysis, rate constant 1) and V → P (rate k), with feed U supplied at rate F and both species washed out. In 1993 Pearson solved it as a 2D reaction–diffusion system and showed that just two parameters (F, k) produce spots, stripes, dividing spots, waves and chaos."}
      </Note>
      <Eq>∂U/∂t = D_U∇²U − UV² + F(1 − U),     ∂V/∂t = D_V∇²V + UV² − (F + k)V,     D_U = 2D_V</Eq>
      <Row>
        {Object.entries(GS_PRESETS).map(([key, p]) => <button key={key} onClick={() => pick(key)} style={btnStyle(preset === key)}>{isKo ? p.ko : p.en}</button>)}
      </Row>
      <Row>
        <Slider label="F" value={F} min={0.005} max={0.08} step={0.0005} onChange={setF} fmt={v => v.toFixed(4)} />
        <Slider label="k" value={kk} min={0.04} max={0.072} step={0.0005} onChange={setK} fmt={v => v.toFixed(4)} />
        <button onClick={() => setRunning(!running)} style={btnStyle(running)}>{running ? (isKo ? "일시 정지" : "Pause") : (isKo ? "실행" : "Run")}</button>
        <button onClick={() => advance(1000)} style={btnStyle()}>{isKo ? "+1000 단계" : "+1000 steps"}</button>
        <button onClick={() => setSeed(seed + 1)} style={btnStyle()}>{isKo ? "다시" : "Reset"}</button>
        <span style={{ fontFamily: mono, color: C.textDim, fontSize: 13 }}>{isKo ? "단계" : "step"} {steps}</span>
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <canvas ref={cv} width={N} height={N} style={{ width: 384, maxWidth: "100%", aspectRatio: "1 / 1", imageRendering: "pixelated", borderRadius: 10, border: `1px solid ${C.border}`, background: "#0d1117" }} />
        <div style={{ flex: "1 1 280px" }}>
          <Note>
            {isKo
              ? "밝은 곳이 자기 촉매종 V입니다. 처음에는 여섯 개의 작은 씨앗만 있습니다. '세포 분열하는 점'에서는 점이 자라다 둘로 갈라지기를 반복해 화면을 채우고, '미로'에서는 씨앗이 구불구불한 띠로 번집니다. F를 낮추고 k를 높이면(원료가 적고 V가 빨리 사라지면) 모든 것이 소멸합니다. Turing 모형과 달리 Gray–Scott 무늬는 균일 상태의 선형 불안정성이 아니라, 국소적인 '씨앗'에서 비선형으로 자라는 경우가 많습니다."
              : "Bright areas are the autocatalyst V; at first there are only six small seeds. With 'dividing spots' each spot grows and splits again and again until the field is full; with 'maze' the seeds spread into winding bands. Lower F and raise k (less feed, faster loss of V) and everything dies out. Unlike Turing's model, Gray–Scott patterns often grow nonlinearly from local seeds rather than from a linear instability of the uniform state."}
          </Note>
          <Note>{isKo ? "출처: P. Gray, S. K. Scott, Chem. Eng. Sci. 38, 29 (1983); J. E. Pearson, Science 261, 189 (1993). 수치: Δx = Δt = 1, D_U = 0.16, D_V = 0.08." : "Sources: P. Gray, S. K. Scott, Chem. Eng. Sci. 38, 29 (1983); J. E. Pearson, Science 261, 189 (1993). Numerics: Δx = Δt = 1, D_U = 0.16, D_V = 0.08."}</Note>
        </div>
      </div>
    </Card>
  );
}

function LotkaLab({ isKo }) {
  const [X0, setX0] = useState(5);
  const [kk, setK] = useState(2);
  const [r0, setR0] = useState(1);
  const traj = useMemo(() => {
    let X = 1.2, Y = 0.6; const dt = 0.01, out = [];
    const fx = (x, y) => x * (r0 * (1 - x / X0) - kk * y / (1 + x));
    const fy = (x, y) => y * (kk * x / (1 + x) - 1);
    for (let n = 0; n < 30000; n++) {
      const a1 = fx(X, Y), b1 = fy(X, Y);
      const a2 = fx(X + dt / 2 * a1, Y + dt / 2 * b1), b2 = fy(X + dt / 2 * a1, Y + dt / 2 * b1);
      const a3 = fx(X + dt / 2 * a2, Y + dt / 2 * b2), b3 = fy(X + dt / 2 * a2, Y + dt / 2 * b2);
      const a4 = fx(X + dt * a3, Y + dt * b3), b4 = fy(X + dt * a3, Y + dt * b3);
      X += dt / 6 * (a1 + 2 * a2 + 2 * a3 + a4); Y += dt / 6 * (b1 + 2 * b2 + 2 * b3 + b4);
      if (n % 20 === 0) out.push([n * dt, X, Y]);
    }
    return out;
  }, [X0, kk, r0]);
  const Xs = kk > 1 ? 1 / (kk - 1) : Infinity;
  const hopf = kk > 1 ? (kk + 1) / (kk - 1) : Infinity;
  const late = traj.slice(Math.floor(traj.length * 0.6));
  const amp = Math.max(...late.map(p => p[1])) - Math.min(...late.map(p => p[1]));
  const W = 380, Ht = 260, pad = 40;
  const tmax = traj[traj.length - 1][0];
  const ymax = Math.max(...traj.map(p => Math.max(p[1], p[2]))) * 1.05 + 0.1;
  const s1 = plotScale(0, tmax, 0, ymax, W, Ht, pad);
  const xmax = Math.max(...traj.map(p => p[1])) * 1.05 + 0.1, ymx = Math.max(...traj.map(p => p[2])) * 1.05 + 0.1;
  const s2 = plotScale(0, xmax, 0, ymx, W, Ht, pad);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑤ 포식자–피식자(Lotka–Volterra형): 풍요의 역설" : "Lab ⑤ Predator–prey (Lotka–Volterra type): the paradox of enrichment"}</Hd>
      <Note>
        {isKo
          ? "강의 41쪽의 모형은 피식자 X의 로지스틱 성장(수용력 X₀)과 포식자 Y의 포화형 사냥 kX/(1 + X)를 담고 있습니다(포식자 자체 경쟁 항은 생략). 확산이 없을 때도 평형점이 불안정해지면 개체 수가 끝없이 진동합니다. 이 시간 진동에 확산을 더하면 강의 42–43쪽의 점·파동 무늬가 됩니다."
          : "The model on lecture page 41 has logistic growth of the prey X (carrying capacity X₀) and saturating predation kX/(1 + X) by the predator Y (the predator self-competition term is omitted here). Even without diffusion, once the steady state becomes unstable the populations oscillate forever; adding diffusion to these oscillations gives the spot and wave patterns of lecture pages 42–43."}
      </Note>
      <Eq>dX/dτ = X[r₀(1 − X/X₀) − kY/(1 + X)],     dY/dτ = Y[kX/(1 + X) − 1]</Eq>
      <Row>
        <Slider label={isKo ? "수용력 X₀" : "Carrying capacity X₀"} value={X0} min={1.5} max={12} step={0.1} onChange={setX0} fmt={v => v.toFixed(1)} />
        <Slider label={isKo ? "사냥 효율 k" : "Predation k"} value={kk} min={1.2} max={4} step={0.05} onChange={setK} fmt={v => v.toFixed(2)} />
        <Slider label="r₀" value={r0} min={0.3} max={2} step={0.05} onChange={setR0} fmt={v => v.toFixed(2)} />
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <svg viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "시간 τ" : "time τ"} ylabel={isKo ? "개체 수" : "population"} />
          <path d={pathOf(traj.map(p => [p[0], p[1]]), s1.X, s1.Y)} fill="none" stroke={C.lime} strokeWidth={1.6} />
          <path d={pathOf(traj.map(p => [p[0], p[2]]), s1.X, s1.Y)} fill="none" stroke={C.pink} strokeWidth={1.6} />
          <text x={W - pad} y={pad - 12} fill={C.lime} fontSize={11} textAnchor="end">{isKo ? "피식자 X" : "prey X"}</text>
          <text x={W - pad} y={pad + 2} fill={C.pink} fontSize={11} textAnchor="end">{isKo ? "포식자 Y" : "predator Y"}</text>
        </svg>
        <svg viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "피식자 X" : "prey X"} ylabel={isKo ? "포식자 Y" : "predator Y"} />
          <path d={pathOf(traj.map(p => [p[1], p[2]]), s2.X, s2.Y)} fill="none" stroke={C.accent} strokeWidth={1.2} />
          {isFinite(Xs) && Xs < xmax && <line x1={s2.X(Xs)} x2={s2.X(Xs)} y1={s2.Y(0)} y2={s2.Y(ymx)} stroke={C.textDim} strokeDasharray="4 3" />}
        </svg>
      </div>
      <StatGrid>
        <Stat label={isKo ? "평형 피식자 X* = 1/(k − 1)" : "Steady prey X* = 1/(k − 1)"} value={isFinite(Xs) ? Xs.toFixed(3) : "—"} color={C.lime} />
        <Stat label={isKo ? "Hopf 분기 X₀ = (k + 1)/(k − 1)" : "Hopf bifurcation X₀ = (k + 1)/(k − 1)"} value={isFinite(hopf) ? hopf.toFixed(3) : "—"} color={C.accent} />
        <Stat label={isKo ? "판정" : "Verdict"} value={amp > 0.05 ? (isKo ? "극한 순환 (지속 진동)" : "limit cycle (sustained oscillation)") : (isKo ? "안정 평형" : "stable steady state")} color={amp > 0.05 ? C.pink : C.ok} />
      </StatGrid>
      <Note>
        {isKo
          ? "수용력 X₀를 Hopf 분기점 (k + 1)/(k − 1) 위로 올리면, 곧 먹이를 '풍부하게' 해 주면 오히려 평형이 무너지고 큰 진동이 생깁니다(Rosenzweig의 풍요의 역설). 평형점 X* = 1/(k − 1)에서 Jacobian의 대각합이 0을 지나며 고유값이 허수축을 건너는 순간입니다. 1번 탭의 지도에서 점이 안정 나선에서 불안정 나선으로 넘어가는 것과 같습니다."
          : "Raise the carrying capacity X₀ above the Hopf point (k + 1)/(k − 1), i.e. make food 'plentiful', and the steady state collapses into large oscillations (Rosenzweig's paradox of enrichment). At X* = 1/(k − 1) the trace of the Jacobian passes through zero and the eigenvalues cross the imaginary axis, the same move as a point crossing from stable to unstable spiral on the map of the first tab."}
      </Note>
    </Card>
  );
}

function GiererLab({ isKo }) {
  const [Dv, setDv] = useState(20);
  const [b, setB] = useState(1.5);
  const sim = useMemo(() => {
    const N = 160, Du = 0.5, dt = 0.02, rnd = makeRng(5);
    let u = new Float64Array(N), v = new Float64Array(N);
    for (let i = 0; i < N; i++) { u[i] = (1 / b) * (1 + 0.02 * (rnd() - 0.5)); v[i] = 1 / (b * b); }
    const rows = [];
    for (let s = 0; s <= 20000; s++) {
      if (s % 400 === 0) rows.push(Array.from(u));
      const nu = new Float64Array(N), nv = new Float64Array(N);
      for (let i = 0; i < N; i++) {
        const l = (i + N - 1) % N, r = (i + 1) % N;
        nu[i] = u[i] + dt * (u[i] * u[i] / v[i] - b * u[i] + Du * (u[l] + u[r] - 2 * u[i]));
        nv[i] = v[i] + dt * (u[i] * u[i] - v[i] + Dv * (v[l] + v[r] - 2 * v[i]));
      }
      u = nu; v = nv;
    }
    let peaks = 0;
    const mean = u.reduce((s, x) => s + x, 0) / N;
    for (let i = 0; i < N; i++) if (u[i] > u[(i + N - 1) % N] && u[i] > u[(i + 1) % N] && u[i] > mean) peaks++;
    return { rows, N, peaks, umax: Math.max(...rows[rows.length - 1]) };
  }, [Dv, b]);
  const cvs = useRef(null);
  useEffect(() => {
    const c = cvs.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const gmax = Math.max(...sim.rows.map(r => Math.max(...r)));
    const img = ctx.createImageData(sim.N, sim.rows.length);
    sim.rows.forEach((r, j) => r.forEach((x, i) => {
      const [cr, cg, cb] = colorMap(x / gmax), p = 4 * (j * sim.N + i);
      img.data[p] = cr; img.data[p + 1] = cg; img.data[p + 2] = cb; img.data[p + 3] = 255;
    }));
    ctx.putImageData(img, 0, 0);
  }, [sim]);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑥ Gierer–Meinhardt: 국소 활성, 측방 억제 (1D 시공간 그림)" : "Lab ⑥ Gierer–Meinhardt: local activation, lateral inhibition (1D space–time plot)"}</Hd>
      <Eq>∂u/∂t = u²/v − bu + D_u ∂²u/∂x²,     ∂v/∂t = u² − v + D_v ∂²v/∂x²</Eq>
      <Note>
        {isKo
          ? "활성자 u는 스스로를 늘리고(u²), 억제자 v를 만들며(u²), 억제자는 활성자를 누릅니다(u²/v). 억제자가 훨씬 멀리 퍼지면(D_v ≫ D_u), 봉우리 하나가 주변에서 새 봉우리가 자라는 것을 막아 봉우리들이 일정한 간격을 둡니다. 아래 그림은 가로가 위치, 세로가 시간(아래로 갈수록 나중)입니다."
          : "The activator u enhances itself (u²) and produces the inhibitor v (u²), which suppresses the activator (u²/v). When the inhibitor spreads much farther (D_v ≫ D_u), each peak prevents new ones from growing nearby, so peaks keep a regular spacing. In the plot, horizontal is position and vertical is time (later downward)."}
      </Note>
      <Row>
        <Slider label="D_v (D_u = 0.5)" value={Dv} min={2} max={40} step={1} onChange={setDv} fmt={v => v.toFixed(0)} />
        <Slider label={isKo ? "활성자 분해 b" : "Activator decay b"} value={b} min={1.1} max={3} step={0.05} onChange={setB} fmt={v => v.toFixed(2)} />
      </Row>
      <canvas ref={cvs} width={sim.N} height={sim.rows.length} style={{ width: "100%", maxWidth: 620, height: 260, imageRendering: "pixelated", borderRadius: 10, border: `1px solid ${C.border}`, background: "#0d1117", display: "block" }} />
      <StatGrid>
        <Stat label={isKo ? "봉우리 수 (160칸)" : "Number of peaks (160 cells)"} value={sim.peaks} color={C.accent} />
        <Stat label={isKo ? "평균 간격" : "Mean spacing"} value={sim.peaks ? `${(sim.N / sim.peaks).toFixed(1)} ${isKo ? "칸" : "cells"}` : "—"} color={C.accent} />
        <Stat label={isKo ? "균일 상태" : "Uniform state"} value={`u* = 1/b = ${(1 / b).toFixed(2)}, v* = ${(1 / (b * b)).toFixed(2)}`} color={C.textDim} />
      </StatGrid>
      <Note>
        {isKo
          ? "D_v를 줄이면 억제가 충분히 멀리 미치지 못해 무늬가 생기지 않거나 간격이 좁아지고, 키우면 봉우리 수가 줄어 간격이 넓어집니다. 히드라의 머리 형성, 잎의 배열처럼 '하나가 생기면 그 근처에는 생기지 않는' 현상을 설명하는 모형입니다. 출처: A. Gierer, H. Meinhardt, Kybernetik 12, 30 (1972)."
          : "Lower D_v and the inhibition no longer reaches far enough: no pattern, or a tighter spacing. Raise it and the number of peaks falls as the spacing widens. The model explains 'one here means none nearby' phenomena such as head formation in Hydra and leaf arrangement. Source: A. Gierer, H. Meinhardt, Kybernetik 12, 30 (1972)."}
      </Note>
    </Card>
  );
}

function CompareCard({ isKo }) {
  const rows = [
    ["Turing (1952)", "f = k(16 − ab)", "g = k(ab − b − β)", isKo ? "선형 불안정, 간격 = 2π/k*" : "linear instability, spacing 2π/k*"],
    ["Gierer–Meinhardt (1972)", "f = u²/v − bu", "g = u² − v", isKo ? "국소 자기 촉매 + 장거리 억제" : "local autocatalysis + long-range inhibition"],
    ["Gray–Scott (1983/1993)", "f = −UV² + F(1 − U)", "g = UV² − (F + k)V", isKo ? "원료 고갈형, 씨앗에서 비선형 성장" : "substrate depletion, nonlinear growth from seeds"],
    ["Lotka–Volterra (prey–predator)", "f = X[r₀(1 − X/X₀) − kY/(1 + X)]", "g = Y[kX/(1 + X) − 1]", isKo ? "시간 진동 + 확산 → 파동" : "oscillation + diffusion → waves"],
  ];
  return (
    <Card>
      <Hd>{isKo ? "네 모형 한눈에" : "Four models at a glance"}</Hd>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
          <thead><tr>{(isKo ? ["모형", "활성자/원료 반응", "억제자/생성물 반응", "무늬가 생기는 방식"] : ["Model", "Activator / substrate term", "Inhibitor / product term", "How patterns arise"]).map(h => <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: `1px solid ${C.border}`, color: C.accentSoft }}>{h}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={{ padding: "7px 10px", borderBottom: `1px solid ${C.border}55`, fontFamily: j === 1 || j === 2 ? mono : undefined, fontSize: j === 1 || j === 2 ? 12 : 13 }}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <Note>
        {isKo
          ? "화학공학의 눈으로 보면 이 모든 것은 '반응기 설계' 문제와 같은 식입니다. 촉매 표면의 CO 산화(Pt(110))에서도 나선파와 줄무늬가 관찰되었고, 이 연구를 포함한 표면 화학의 업적으로 G. Ertl은 2007년 노벨 화학상을 받았습니다. 반응–확산의 불안정성은 촉매 펠릿의 핫스팟, 연소, 전기 도금의 수지상 성장에서도 같은 언어로 분석됩니다."
          : "Through a chemical engineer's eyes, these are the same equations as reactor design. Spiral waves and stripes were observed in CO oxidation on catalytic Pt(110), and G. Ertl's surface-chemistry work including these studies earned the 2007 Nobel Prize in Chemistry. Reaction–diffusion instabilities in hot spots of catalyst pellets, combustion and dendritic electroplating are analysed in the same language."}
      </Note>
    </Card>
  );
}

// =============================================================
// 5) ELECTRICAL DOUBLE LAYER
// =============================================================
function EdlTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <EdlModelsCard isKo={isKo} />
      <PBDerivCard isKo={isKo} />
      <GouyChapmanLab isKo={isKo} />
      <SternLab isKo={isKo} />
    </div>
  );
}

function EdlModelsCard({ isKo }) {
  const W = 620, Ht = 210;
  const prof = (x, kind) => {
    if (kind === "H") return x < 0.12 ? 1 - x / 0.12 : 0;
    if (kind === "GC") return Math.exp(-x / 0.18);
    return x < 0.08 ? 1 - 0.55 * x / 0.08 : 0.45 * Math.exp(-(x - 0.08) / 0.15);
  };
  const panel = (x0, kind, label) => {
    const w = 190, h = 150, y0 = 30;
    const pts = []; for (let x = 0; x <= 1; x += 0.01) pts.push([x0 + 12 + x * (w - 20), y0 + h - 10 - prof(x, kind) * (h - 30)]);
    return (
      <g key={kind}>
        <rect x={x0} y={y0} width={10} height={h} fill={C.amber} fillOpacity={0.5} />
        {[0, 1, 2, 3, 4].map(i => <text key={i} x={x0 + 2} y={y0 + 20 + i * 28} fill="#0b0f17" fontSize={11} fontWeight={700}>+</text>)}
        {kind !== "GC" && <line x1={x0 + 12 + (kind === "H" ? 0.12 : 0.08) * (w - 20)} x2={x0 + 12 + (kind === "H" ? 0.12 : 0.08) * (w - 20)} y1={y0} y2={y0 + h} stroke={C.textDim} strokeDasharray="3 3" />}
        <path d={pts.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ")} fill="none" stroke={C.accent} strokeWidth={2.2} />
        <line x1={x0 + 12} x2={x0 + w} y1={y0 + h - 10} y2={y0 + h - 10} stroke="#475569" />
        <text x={x0 + w / 2} y={y0 + h + 22} fill={C.text} fontSize={12} textAnchor="middle" fontWeight={700}>{label}</text>
      </g>
    );
  };
  return (
    <Card>
      <Hd>{isKo ? "전극–용액 계면: 세 가지 전기 이중층 모형" : "The electrode–solution interface: three double-layer models"}</Hd>
      <Note>
        {isKo
          ? "전극이 양전하를 띠면 용액의 음이온이 끌려와 표면을 덮고, 그 위에 양이온이 다시 모입니다. 이렇게 전하가 두 층으로 나뉜 구조를 전기 이중층(EDL)이라 합니다. 전극 반응이 일어나는 곳이 바로 이 수 nm 두께의 층이고, 전위차 대부분이 여기에 걸립니다. 아래 그림의 곡선은 전극에서 멀어질 때의 전위 φ(x)입니다."
          : "When an electrode carries positive charge, anions are drawn to cover its surface, and cations gather beyond them. This charge split into two layers is the electrical double layer (EDL). Electrode reactions happen within this layer a few nm thick, and most of the potential difference falls across it. The curves below show the potential φ(x) moving away from the electrode."}
      </Note>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        {panel(10, "H", isKo ? "Helmholtz: 단단한 축전기" : "Helmholtz: rigid capacitor")}
        {panel(215, "GC", isKo ? "Gouy–Chapman: 확산층" : "Gouy–Chapman: diffuse layer")}
        {panel(420, "S", isKo ? "Stern: 압축층 + 확산층" : "Stern: compact + diffuse")}
      </svg>
      <Note>
        {isKo
          ? "Helmholtz(1853)는 이온이 표면에 한 줄로 붙은 평행판 축전기로 보았습니다: 전위가 직선으로 떨어집니다. Gouy(1910)와 Chapman(1913)은 이온의 열운동을 넣어, 이온이 Boltzmann 분포로 퍼진 '확산층'을 만들었습니다: 전위가 지수적으로 떨어집니다. Stern(1924)은 둘을 합쳐, 표면에 붙은 이온층(외부 Helmholtz 면, OHP)까지는 직선, 그 바깥은 Gouy–Chapman으로 보았습니다. 두 층은 직렬 연결된 축전기입니다."
          : "Helmholtz (1853) pictured ions stuck to the surface in one row, a parallel-plate capacitor: the potential falls linearly. Gouy (1910) and Chapman (1913) added thermal motion, giving a diffuse layer of Boltzmann-distributed ions: the potential falls exponentially. Stern (1924) combined the two: linear up to the layer of attached ions (the outer Helmholtz plane, OHP), Gouy–Chapman beyond it. The two layers are capacitors in series."}
      </Note>
    </Card>
  );
}

function PBDerivCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "유도: Poisson–Boltzmann 식과 Debye 길이" : "Derivation: the Poisson–Boltzmann equation and the Debye length"}</Hd>
      <HdSub>{isKo ? "① 평형의 이온 분포: 전기화학 퍼텐셜이 어디서나 같다" : "1. Ion distribution at equilibrium: equal electrochemical potential everywhere"}</HdSub>
      <Eq>μ̃_i(x) = μ_i° + k_BT ln c_i(x) + z_i e φ(x) = μ̃_i(∞) = μ_i° + k_BT ln c₀   (φ(∞) = 0)</Eq>
      <Eq>c_i(x) = c₀ exp[−z_i e φ(x)/k_BT]   {isKo ? "(Boltzmann 분포)" : "(Boltzmann distribution)"}</Eq>
      <HdSub>{isKo ? "② 전하와 전위: Poisson 식 (Maxwell 식 ∇·D = ρ에서)" : "2. Charge and potential: the Poisson equation (from Maxwell's ∇·D = ρ)"}</HdSub>
      <Eq>D = εE,  E = −dφ/dx   →   d²φ/dx² = −ρ(x)/ε</Eq>
      <HdSub>{isKo ? "③ 합치기 (z:z 전해질)" : "3. Combine (z:z electrolyte)"}</HdSub>
      <Eq>ρ = zec₊ − zec₋ = −2zec₀ sinh(zeφ/k_BT)   →   d²φ/dx² = (2zec₀/ε) sinh(zeφ/k_BT)</Eq>
      <Eq>{isKo ? "무차원 ψ = zeφ/k_BT:" : "Dimensionless ψ = zeφ/k_BT:"}   d²ψ/dx² = κ² sinh ψ,   κ² = 2z²e²c₀/(εk_BT)</Eq>
      <HdSub>{isKo ? "④ 작은 전위 (ψ ≪ 1): sinh ψ ≈ ψ" : "4. Small potential (ψ ≪ 1): sinh ψ ≈ ψ"}</HdSub>
      <Eq>d²ψ/dx² = κ²ψ   →   φ(x) = φ₀ e^(−κx),   κ⁻¹ = {isKo ? "Debye 길이" : "Debye length"}  (Debye–Hückel)</Eq>
      <HdSub>{isKo ? "⑤ 전체 해 (Gouy–Chapman)와 표면 전하 (Grahame)" : "5. Full solution (Gouy–Chapman) and surface charge (Grahame)"}</HdSub>
      <Eq>tanh(zeφ/4k_BT) = tanh(zeφ₀/4k_BT) e^(−κx),     σ = √(8εk_BTc₀) sinh(zeφ₀/2k_BT)</Eq>
      <Note>
        {isKo
          ? "④에서 '전극 근처에서 전기적 중성이 깨지는 거리'가 Debye 길이 κ⁻¹로 나옵니다. 농도가 높을수록 이온이 전극 전하를 더 가까이에서 가려(차폐) 길이가 짧아집니다: 25 °C 물에서 1:1 전해질이면 κ⁻¹ = 0.304/√(c/M) nm. ⑤의 Grahame 식은 ①의 첫 적분 dψ/dx = −2κ sinh(ψ/2)에 Gauss 법칙 σ = −ε dφ/dx|₀을 적용해 얻습니다."
          : "Step 4 gives the distance over which electroneutrality fails near the electrode: the Debye length κ⁻¹. Higher concentration screens the electrode charge more closely and shortens it: for a 1:1 electrolyte in water at 25 °C, κ⁻¹ = 0.304/√(c/M) nm. The Grahame equation in step 5 follows from the first integral dψ/dx = −2κ sinh(ψ/2) and Gauss's law σ = −ε dφ/dx|₀."}
      </Note>
    </Card>
  );
}

function GouyChapmanLab({ isKo }) {
  const [logc, setLogc] = useState(-2);
  const [z, setZ] = useState(1);
  const [phi0, setPhi0] = useState(100);
  const c = Math.pow(10, logc);
  const T = 298.15, eps = 78.5 * EPS0, kTe = KB * T / EC;
  const kap = Math.sqrt(2 * z * z * EC * EC * c * 1000 * NA / (eps * KB * T));
  const ld = 1e9 / kap;
  const xmax = Math.max(5 * ld, 1);
  const g0 = Math.tanh(z * phi0 / 1000 / (4 * kTe));
  const gc = [], dh = [], cp = [], cm = [];
  for (let i = 0; i <= 200; i++) {
    const x = xmax * i / 200, xm = x * 1e-9;
    const p = 4 * kTe / z * Math.atanh(g0 * Math.exp(-kap * xm));
    gc.push([x, p * 1000]); dh.push([x, phi0 * Math.exp(-kap * xm)]);
    cp.push([x, Math.min(5, Math.exp(-z * p / kTe))]); cm.push([x, Math.min(5, Math.exp(z * p / kTe))]);
  }
  const sigma = Math.sqrt(8 * eps * KB * T * c * 1000 * NA) * Math.sinh(z * phi0 / 1000 / (2 * kTe));
  const Cd = eps * kap * Math.cosh(z * phi0 / 1000 / (2 * kTe));
  const W = 380, Ht = 260, pad = 46;
  const s1 = plotScale(0, xmax, 0, Math.max(phi0, 1) * 1.05, W, Ht, pad);
  const s2 = plotScale(0, xmax, 0, 5, W, Ht, pad);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑦ Gouy–Chapman 확산층과 Debye 길이" : "Lab ⑦ The Gouy–Chapman diffuse layer and the Debye length"}</Hd>
      <Row>
        <Slider label={isKo ? "농도 log₁₀(c/M)" : "Concentration log₁₀(c/M)"} value={logc} min={-4} max={0} step={0.05} onChange={setLogc} fmt={v => `${v.toFixed(2)} (${sci(Math.pow(10, v), 1)} M)`} />
        <Slider label={isKo ? "표면 전위 φ₀" : "Surface potential φ₀"} value={phi0} min={5} max={250} step={5} onChange={setPhi0} unit=" mV" fmt={v => v.toFixed(0)} />
        <button onClick={() => setZ(z === 1 ? 2 : 1)} style={btnStyle(z === 2)}>{z === 1 ? "1:1 (NaCl)" : "2:2 (MgSO₄)"}</button>
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <svg viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "전극에서의 거리 x (nm)" : "distance from electrode x (nm)"} ylabel="φ (mV)" />
          <line x1={s1.X(ld)} x2={s1.X(ld)} y1={s1.Y(0)} y2={pad} stroke={C.textDim} strokeDasharray="4 3" />
          <text x={s1.X(ld) + 4} y={pad + 10} fill={C.textDim} fontSize={10}>κ⁻¹</text>
          <path d={pathOf(dh, s1.X, s1.Y)} fill="none" stroke={C.pink} strokeWidth={1.4} strokeDasharray="5 4" />
          <path d={pathOf(gc, s1.X, s1.Y)} fill="none" stroke={C.accent} strokeWidth={2.4} />
          <text x={W - pad} y={pad - 12} fill={C.accent} fontSize={11} textAnchor="end">Gouy–Chapman</text>
          <text x={W - pad} y={pad + 2} fill={C.pink} fontSize={11} textAnchor="end">{isKo ? "Debye–Hückel (선형)" : "Debye–Hückel (linear)"}</text>
          {[0, 0.5, 1].map(f => <text key={f} x={s1.X(f * xmax)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{(f * xmax).toFixed(1)}</text>)}
        </svg>
        <svg viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "x (nm)" : "x (nm)"} ylabel="c/c₀" />
          <line x1={pad} x2={W - pad} y1={s2.Y(1)} y2={s2.Y(1)} stroke="#475569" strokeDasharray="3 3" />
          <path d={pathOf(cm, s2.X, s2.Y)} fill="none" stroke={C.sky} strokeWidth={2.2} />
          <path d={pathOf(cp, s2.X, s2.Y)} fill="none" stroke={C.amber} strokeWidth={2.2} />
          <text x={W - pad} y={pad - 12} fill={C.sky} fontSize={11} textAnchor="end">{isKo ? "음이온 (끌림)" : "anions (attracted)"}</text>
          <text x={W - pad} y={pad + 2} fill={C.amber} fontSize={11} textAnchor="end">{isKo ? "양이온 (밀림)" : "cations (repelled)"}</text>
          {[0, 1, 2, 3, 4, 5].map(v => <text key={v} x={pad - 6} y={s2.Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        </svg>
      </div>
      <StatGrid>
        <Stat label={isKo ? "Debye 길이 κ⁻¹" : "Debye length κ⁻¹"} value={`${ld.toFixed(3)} nm`} color={C.accent} />
        <Stat label={isKo ? "x = κ⁻¹에서 φ (GC / DH)" : "φ at x = κ⁻¹ (GC / DH)"} value={`${(4 * kTe / z * Math.atanh(g0 * Math.exp(-1)) * 1000).toFixed(1)} / ${(phi0 * Math.exp(-1)).toFixed(1)} mV`} color={C.accent} />
        <Stat label={isKo ? "표면 전하 σ (Grahame)" : "Surface charge σ (Grahame)"} value={`${(sigma * 100).toFixed(2)} µC cm⁻²`} color={C.sky} />
        <Stat label={isKo ? "확산층 용량 C_d" : "Diffuse-layer capacitance C_d"} value={`${(Cd * 100).toFixed(1)} µF cm⁻²`} color={C.sky} />
      </StatGrid>
      <Note>
        {isKo
          ? "농도를 10배 올리면 Debye 길이는 √10 ≈ 3.2배 짧아집니다. 2:2 전해질은 같은 농도에서 길이가 절반입니다. 전위가 k_BT/e ≈ 26 mV보다 크면 Gouy–Chapman 곡선이 선형 근사보다 전극 가까이에서 훨씬 가파르게 떨어집니다: 끌려온 반대 이온이 지수적으로 많아져 전하를 더 빨리 가리기 때문입니다(오른쪽: 표면 근처 음이온 농도가 벌크의 수십 배). 이 길이가 콜로이드 입자의 정전기적 반발 거리(DLVO 이론), 수처리의 축전식 탈염(CDI), 나노 유체 채널의 이온 선택성을 정합니다."
          : "Raise the concentration tenfold and the Debye length shrinks by √10 ≈ 3.2; a 2:2 electrolyte halves it at equal concentration. Above k_BT/e ≈ 26 mV the Gouy–Chapman curve drops much more steeply near the electrode than the linear estimate, because the attracted counter-ions pile up exponentially and screen faster (right: anion concentration near the surface tens of times the bulk). This length sets the electrostatic repulsion range of colloids (DLVO theory), capacitive deionization (CDI) in water treatment, and ion selectivity in nanofluidic channels."}
      </Note>
    </Card>
  );
}

function SternLab({ isKo }) {
  const [dH, setDH] = useState(0.3);
  const [epsH, setEpsH] = useState(6);
  const CH = epsH * EPS0 / (dH * 1e-9) * 100;   // µF/cm²
  const eps = 78.5 * EPS0, T = 298.15;
  const pts = [], pd = [];
  for (let lc = -4; lc <= 0.01; lc += 0.05) {
    const kap = Math.sqrt(2 * EC * EC * Math.pow(10, lc) * 1000 * NA / (eps * KB * T));
    const Cd = eps * kap * 100;
    pts.push([lc, 1 / (1 / CH + 1 / Cd)]); pd.push([lc, Math.min(Cd, 60)]);
  }
  const W = 620, Ht = 260, pad = 50;
  const { X, Y } = plotScale(-4, 0, 0, 60, W, Ht, pad);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑧ Stern 모형: 직렬 축전기로 보는 이중층 용량" : "Lab ⑧ The Stern model: double-layer capacitance as capacitors in series"}</Hd>
      <Eq>1/C = 1/C_H + 1/C_d,     C_H = ε_H/d_H,     C_d = εκ cosh(zeφ_d/2k_BT) ≈ εκ</Eq>
      <Row>
        <Slider label={isKo ? "압축층 두께 d_H" : "Compact layer d_H"} value={dH} min={0.2} max={0.8} step={0.01} onChange={setDH} unit=" nm" fmt={v => v.toFixed(2)} />
        <Slider label={isKo ? "압축층 유전율 ε_H/ε₀" : "Compact-layer ε_H/ε₀"} value={epsH} min={2} max={20} step={0.5} onChange={setEpsH} fmt={v => v.toFixed(1)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "log₁₀(c/M)" : "log₁₀(c/M)"} ylabel="C (µF cm⁻²)" />
        <line x1={pad} x2={W - pad} y1={Y(Math.min(CH, 60))} y2={Y(Math.min(CH, 60))} stroke={C.amber} strokeDasharray="5 4" />
        <path d={pathOf(pd, X, Y)} fill="none" stroke={C.sky} strokeWidth={1.4} strokeDasharray="5 4" />
        <path d={pathOf(pts, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.6} />
        {[-4, -3, -2, -1, 0].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        {[0, 20, 40, 60].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        <text x={pad + 8} y={Y(Math.min(CH, 60)) - 6} fill={C.amber} fontSize={11}>C_H = {CH.toFixed(1)}</text>
        <text x={W - pad} y={pad - 12} fill={C.accent} fontSize={11} textAnchor="end">{isKo ? "전체 (직렬)" : "total (series)"}</text>
        <text x={W - pad} y={pad + 2} fill={C.sky} fontSize={11} textAnchor="end">{isKo ? "확산층 C_d" : "diffuse C_d"}</text>
      </svg>
      <Note>
        {isKo
          ? "직렬 축전기에서는 작은 쪽이 전체를 정합니다. 묽은 용액에서는 확산층이 두꺼워 C_d가 작고, 진한 용액(0.1 M 이상)에서는 C_d가 커져 전체 용량이 압축층 값 C_H(약 10–20 µF/cm²)에 수렴합니다. 이 값이 실험으로 재는 전형적인 이중층 용량입니다. 전기 이중층 축전기(슈퍼커패시터)는 비표면적 1000 m²/g이 넘는 다공성 탄소로 이 용량을 넓이만큼 곱해 패럿 단위의 용량을 얻습니다: 15 µF/cm² × 1000 m²/g = 150 F/g."
          : "In series the smaller capacitor rules. In dilute solutions the diffuse layer is thick and C_d small; in concentrated solutions (above 0.1 M) C_d grows and the total approaches the compact-layer value C_H (about 10–20 µF/cm²), the typical measured double-layer capacitance. Electrical double-layer capacitors (supercapacitors) multiply it by the area of porous carbons above 1000 m²/g to reach farads: 15 µF/cm² × 1000 m²/g = 150 F/g."}
      </Note>
      <Note>{isKo ? "출처: G. Gouy, J. Phys. Théor. Appl. 9, 457 (1910); D. L. Chapman, Phil. Mag. 25, 475 (1913); O. Stern, Z. Elektrochem. 30, 508 (1924); D. C. Grahame, Chem. Rev. 41, 441 (1947)." : "Sources: G. Gouy, J. Phys. Théor. Appl. 9, 457 (1910); D. L. Chapman, Phil. Mag. 25, 475 (1913); O. Stern, Z. Elektrochem. 30, 508 (1924); D. C. Grahame, Chem. Rev. 41, 441 (1947)."}</Note>
    </Card>
  );
}

// =============================================================
// 6) ELECTRODE KINETICS
// =============================================================
function KineticsTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <BVDerivCard isKo={isKo} />
      <BVLab isKo={isKo} />
      <TafelLab isKo={isKo} />
      <CVLab isKo={isKo} />
      <CellLab isKo={isKo} />
      <ExamplesCard isKo={isKo} />
    </div>
  );
}

function BVDerivCard({ isKo }) {
  return (
    <Card>
      <Hd>{isKo ? "유도: Butler–Volmer 식" : "Derivation: the Butler–Volmer equation"}</Hd>
      <Note>
        {isKo
          ? "전극에서 Ox⁺ + e⁻ ⇌ Red가 일어난다고 합시다. 환원(음극 전류 j_c)과 산화(양극 전류 j_a)는 동시에 일어나고, 우리가 재는 것은 그 차이입니다. 각 방향의 속도는 1차 반응 속도식과 활성화 Gibbs 에너지로 씁니다(Faraday 법칙: 전류 = F × 속도)."
          : "Let Ox⁺ + e⁻ ↔ Red occur at an electrode. Reduction (cathodic current j_c) and oxidation (anodic current j_a) run simultaneously, and we measure their difference. Each direction is written with a first-order rate law and an activation Gibbs energy (Faraday's law: current = F × rate)."}
      </Note>
      <Eq>j_c = F k_c[Ox⁺],   j_a = F k_a[Red],   k = B e^(−Δ‡G/RT),   j = j_a − j_c</Eq>
      <Note>
        {isKo
          ? "핵심은 전위입니다. 전극과 용액 사이 전위차 Δφ가 바뀌면 전자의 전기화학 퍼텐셜이 −FΔφ만큼 움직여, 반응물 쪽 Gibbs 에너지가 FΔφ만큼 바뀝니다. 전이 상태는 그 변화의 일부(비율 α, 전달 계수)만 따라갑니다."
          : "The key is potential. A change in the electrode–solution potential difference Δφ shifts the electrochemical potential of the electron by −FΔφ, so the Gibbs energy of the reactant side moves by FΔφ. The transition state follows only a fraction α of that change (the transfer coefficient)."}
      </Note>
      <Eq>Δ‡G_c = Δ‡G_c(0) + αFΔφ,     Δ‡G_a = Δ‡G_a(0) − (1 − α)FΔφ</Eq>
      <Eq>Δφ = E + η   →   j_c = j₀ e^(−αfη),   j_a = j₀ e^((1−α)fη),   f = F/RT</Eq>
      <Eq>j = j₀ [e^((1−α)fη) − e^(−αfη)]   {isKo ? "(Butler–Volmer 식)" : "(the Butler–Volmer equation)"}</Eq>
      <Note>
        {isKo
          ? "j₀는 교환 전류 밀도로, 평형(η = 0)에서 서로 상쇄되는 두 방향 전류의 크기입니다. j₀가 크면 작은 과전압으로도 큰 전류가 흐르는 '좋은 전극'입니다. 두 극한이 중요합니다. 작은 과전압(fη ≪ 1)에서는 지수를 1차까지 전개하면 j ≈ j₀fη로 옴 법칙처럼 되고, 전하 이동 저항 R_ct = RT/(Fj₀)가 나옵니다. 큰 과전압에서는 한 항만 남아 ln j = ln j₀ + (1 − α)fη(Tafel)가 됩니다. f = F/RT = 38.9 V⁻¹이므로 η를 0.1 V만 바꾸어도 지수가 3.9만큼 바뀝니다. 전위가 '장벽을 직접 움직이는 손잡이'인 이유입니다."
          : "j₀ is the exchange current density: the size of the two equal and opposite currents at equilibrium (η = 0). A large j₀ means a 'good electrode' that passes large currents at small overpotential. Two limits matter. At small overpotential (fη ≪ 1), expanding the exponentials to first order gives j ≈ j₀fη, an Ohm's-law form with charge-transfer resistance R_ct = RT/(Fj₀). At large overpotential one term survives: ln j = ln j₀ + (1 − α)fη (Tafel). Since f = F/RT = 38.9 V⁻¹, changing η by just 0.1 V shifts the exponent by 3.9: potential is a knob that moves the barrier directly."}
      </Note>
    </Card>
  );
}

function etaFor(jt, j0, alpha) {   // solve j0[e^((1-α)fη) − e^(−αfη)] = jt for η > 0 by bisection
  let lo = 0, hi = 5;
  for (let i = 0; i < 80; i++) {
    const m = (lo + hi) / 2, j = j0 * (Math.exp((1 - alpha) * FRT * m) - Math.exp(-alpha * FRT * m));
    if (j > jt) hi = m; else lo = m;
  }
  return (lo + hi) / 2;
}
function BVLab({ isKo }) {
  const [alpha, setAlpha] = useState(0.5);
  const [logj0, setLogj0] = useState(0);
  const j0 = Math.pow(10, logj0);
  const W = 380, Ht = 270, pad = 46;
  const s1 = plotScale(-6, 6, -40, 40, W, Ht, pad);
  const s2 = plotScale(-8, 8, -4, 4, W, Ht, pad);
  const net = [], an = [], ca = [], logp = [];
  for (let x = -8; x <= 8.001; x += 0.05) {
    const ja = Math.exp((1 - alpha) * x), jc = Math.exp(-alpha * x);
    if (x >= -6 && x <= 6) { net.push([x, Math.max(-40, Math.min(40, ja - jc))]); an.push([x, Math.min(40, ja)]); ca.push([x, Math.max(-40, -jc)]); }
    logp.push([x, Math.log10(Math.abs(ja - jc) + 1e-12)]);
  }
  const tafA = [[0, 0], [8, (1 - alpha) * 8 / Math.LN10]], tafC = [[0, 0], [-8, alpha * 8 / Math.LN10]];
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑨ Butler–Volmer 곡선과 전달 계수 α" : "Lab ⑨ Butler–Volmer curves and the transfer coefficient α"}</Hd>
      <Row>
        <Slider label={isKo ? "전달 계수 α" : "Transfer coefficient α"} value={alpha} min={0.05} max={0.95} step={0.01} onChange={setAlpha} fmt={v => v.toFixed(2)} />
        <Slider label="log₁₀(j₀ / mA cm⁻²)" value={logj0} min={-6} max={1} step={0.1} onChange={setLogj0} fmt={v => v.toFixed(1)} />
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <svg viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "fη (무차원 과전압)" : "fη (dimensionless overpotential)"} ylabel="j/j₀" />
          <line x1={pad} x2={W - pad} y1={s1.Y(0)} y2={s1.Y(0)} stroke="#475569" />
          <line x1={s1.X(0)} x2={s1.X(0)} y1={pad} y2={Ht - pad} stroke="#475569" />
          <path d={pathOf(an, s1.X, s1.Y)} fill="none" stroke={C.amber} strokeWidth={1.2} strokeDasharray="4 3" />
          <path d={pathOf(ca, s1.X, s1.Y)} fill="none" stroke={C.sky} strokeWidth={1.2} strokeDasharray="4 3" />
          <path d={pathOf(net, s1.X, s1.Y)} fill="none" stroke={C.accent} strokeWidth={2.6} />
          <text x={W - pad} y={pad - 12} fill={C.amber} fontSize={11} textAnchor="end">{isKo ? "양극 j_a" : "anodic j_a"}</text>
          <text x={pad + 4} y={Ht - pad - 6} fill={C.sky} fontSize={11}>{isKo ? "음극 −j_c" : "cathodic −j_c"}</text>
        </svg>
        <svg viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <Axes W={W} Ht={Ht} pad={pad} xlabel="fη" ylabel="log₁₀|j/j₀|" />
          <path d={pathOf(tafA, s2.X, s2.Y)} fill="none" stroke={C.amber} strokeWidth={1.2} strokeDasharray="4 3" />
          <path d={pathOf(tafC, s2.X, s2.Y)} fill="none" stroke={C.sky} strokeWidth={1.2} strokeDasharray="4 3" />
          <path d={pathOf(logp.map(([x, y]) => [x, Math.max(-4, y)]), s2.X, s2.Y)} fill="none" stroke={C.accent} strokeWidth={2.6} />
          <line x1={pad} x2={W - pad} y1={s2.Y(0)} y2={s2.Y(0)} stroke="#475569" strokeDasharray="3 3" />
          <text x={s2.X(0)} y={pad - 6} fill={C.textDim} fontSize={10} textAnchor="middle">{isKo ? "Tafel 그림" : "Tafel plot"}</text>
        </svg>
      </div>
      <StatGrid>
        <Stat label={isKo ? "양극 Tafel 기울기" : "Anodic Tafel slope"} value={`${(2.303 / ((1 - alpha) * FRT) * 1000).toFixed(0)} mV/dec`} color={C.amber} />
        <Stat label={isKo ? "음극 Tafel 기울기" : "Cathodic Tafel slope"} value={`${(2.303 / (alpha * FRT) * 1000).toFixed(0)} mV/dec`} color={C.sky} />
        <Stat label={isKo ? "전하 이동 저항 R_ct = RT/(Fj₀)" : "Charge-transfer resistance R_ct = RT/(Fj₀)"} value={`${(1 / FRT / (j0 * 1e-3)).toExponential(2)} Ω cm²`} color={C.accent} />
        <Stat label={isKo ? "10 mA/cm²에 필요한 과전압" : "Overpotential for 10 mA/cm²"} value={`${(etaFor(10, j0, alpha) * 1000).toFixed(0)} mV`} color={C.pink} />
      </StatGrid>
      <Note>
        {isKo
          ? "α = 0.5이면 곡선이 원점에 대해 대칭(j/j₀ = 2 sinh(fη/2))이고, α = 0.25이면 양극 쪽이, α = 0.75이면 음극 쪽이 더 가파릅니다(강의 16쪽). 오른쪽 로그 그림에서 큰 |fη|의 직선이 Tafel 영역이며, 원점 근처에서 직선에서 벗어나는 부분이 '반대 방향 전류'가 아직 남아 있는 구간입니다. j₀를 10배 키우면 같은 전류에 필요한 과전압이 Tafel 기울기만큼(α = 0.5이면 118 mV) 줄어듭니다. 이것이 수전해 촉매(Pt, IrO₂)가 비싼데도 쓰이는 이유입니다."
          : "With α = 0.5 the curve is symmetric about the origin (j/j₀ = 2 sinh(fη/2)); α = 0.25 makes the anodic side steeper and α = 0.75 the cathodic side (lecture page 16). In the log plot on the right, the straight lines at large |fη| are the Tafel regions; the departure near the origin is where the reverse current still matters. A tenfold j₀ cuts the overpotential needed for a given current by one Tafel slope (118 mV for α = 0.5), which is why electrolysis catalysts such as Pt and IrO₂ are worth their price."}
      </Note>
    </Card>
  );
}

const TF_ETA = [50, 100, 150, 200, 250], TF_I = [8.8, 25.0, 58.0, 131, 298];
function TafelLab({ isKo }) {
  const [skip, setSkip] = useState(1);
  const xs = TF_ETA.slice(skip), ys = TF_I.slice(skip).map(i => Math.log(i / 2));
  const fit = linfit(xs, ys);
  const alpha = 1 - fit.slope / (FRT / 1000);
  const W = 560, Ht = 260, pad = 50;
  const { X, Y } = plotScale(0, 300, 0, 5.5, W, Ht, pad);
  const bv = []; for (let e = 0; e <= 260; e += 2) { const j0 = Math.exp(fit.icpt); bv.push([e, Math.log(j0 * (Math.exp((1 - alpha) * FRT * e / 1000) - Math.exp(-alpha * FRT * e / 1000)) + 1e-9)]); }
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑩ Tafel 분석 (강의 예제: Pt 전극, Fe³⁺/Fe²⁺, 298 K, 2.0 cm²)" : "Lab ⑩ Tafel analysis (lecture example: Pt electrode, Fe³⁺/Fe²⁺, 298 K, 2.0 cm²)"}</Hd>
      <Row>
        <span style={{ color: C.textDim, fontSize: 13 }}>{isKo ? "맞춤에서 뺄 낮은 과전압 점:" : "Low-overpotential points excluded from the fit:"}</span>
        {[0, 1, 2].map(k => <button key={k} onClick={() => setSkip(k)} style={btnStyle(skip === k)}>{k}</button>)}
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel="η (mV)" ylabel="ln(j / mA cm⁻²)" />
        <line x1={X(0)} y1={Y(fit.icpt)} x2={X(300)} y2={Y(fit.icpt + 300 * fit.slope)} stroke={C.accent} strokeWidth={1.8} />
        <path d={pathOf(bv.filter(p => p[1] > 0), X, Y)} fill="none" stroke={C.pink} strokeWidth={1.4} strokeDasharray="5 4" />
        {TF_ETA.map((e, i) => <circle key={i} cx={X(e)} cy={Y(Math.log(TF_I[i] / 2))} r={5} fill={i < skip ? C.textDim : "#fde047"} />)}
        {[0, 100, 200, 300].map(v => <text key={v} x={X(v)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        {[0, 1, 2, 3, 4, 5].map(v => <text key={v} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
        <text x={W - pad} y={pad - 12} fill={C.pink} fontSize={11} textAnchor="end">{isKo ? "같은 j₀, α의 전체 BV 곡선" : "full BV curve with the same j₀, α"}</text>
      </svg>
      <StatGrid>
        <Stat label={isKo ? "기울기 (1 − α)f" : "Slope (1 − α)f"} value={`${fit.slope.toFixed(4)} mV⁻¹`} color={C.accent} />
        <Stat label={isKo ? "절편 ln j₀" : "Intercept ln j₀"} value={fit.icpt.toFixed(2)} color={C.accent} />
        <Stat label="j₀" value={`${Math.exp(fit.icpt).toFixed(2)} mA cm⁻²`} color={C.ok} />
        <Stat label="α" value={alpha.toFixed(2)} color={C.ok} />
      </StatGrid>
      <Note>
        {isKo
          ? "전류를 넓이 2.0 cm²로 나누어 전류 밀도로 바꾼 뒤 ln j를 η에 대해 그립니다. η ≥ 100 mV의 네 점으로 맞추면 기울기 0.0165 mV⁻¹, 절편 0.88로 강의 답(j₀ = 2.4 mA/cm², α = 0.58)과 같습니다. 50 mV 점까지 넣으면 직선이 틀어지는데, fη ≈ 2인 이 영역에서는 반대 방향(음극) 전류가 아직 무시할 수 없기 때문입니다. Tafel 분석은 '충분히 큰 과전압'에서만 해야 합니다."
          : "Divide the current by the 2.0 cm² area to get current density, then plot ln j against η. Fitting the four points with η ≥ 100 mV gives slope 0.0165 mV⁻¹ and intercept 0.88, matching the lecture answer (j₀ = 2.4 mA/cm², α = 0.58). Including the 50 mV point skews the line, because at fη ≈ 2 the reverse (cathodic) current is not yet negligible. Tafel analysis must use sufficiently large overpotentials."}
      </Note>
    </Card>
  );
}

function simulateCV(logk0, v, alpha) {
  // O + e -> R, Butler-Volmer boundary, D = 1e-9 m²/s, C = 1 mol/m³, E0 = 0
  const D = 1e-9, C = 1, Ei = 0.4, Ev = -0.4, nx = 200;
  const tend = 2 * (Ei - Ev) / v, L = 6 * Math.sqrt(D * tend), dx = L / nx, dt = 0.45 * dx * dx / D;
  const k0 = Math.pow(10, logk0);
  let O = new Float64Array(nx).fill(C), R = new Float64Array(nx);
  const out = [], pk = { c: [0, -1e9], a: [0, 1e9] };
  const nsteps = Math.ceil(tend / dt), every = Math.max(1, Math.floor(nsteps / 400));
  for (let n = 0; n < nsteps; n++) {
    const t = n * dt;
    const E = t < tend / 2 ? Ei - v * t : Ev + v * (t - tend / 2);
    const kf = k0 * Math.exp(-alpha * FRT * E), kb = k0 * Math.exp((1 - alpha) * FRT * E);
    // surface balance: D(O1 - O0)/dx = kf O0 - kb R0 ; same for R with opposite sign
    // second-order surface flux: D(−3c0 + 4c1 − c2)/(2dx) balanced against the Butler–Volmer rate
    const bb = D / (2 * dx);
    const SO = bb * (4 * O[1] - O[2]), SR = bb * (4 * R[1] - R[2]);
    const det = (3 * bb + kf) * (3 * bb + kb) - kf * kb;
    const O0 = (SO * (3 * bb + kb) + kb * SR) / det;
    const R0 = (SR * (3 * bb + kf) + kf * SO) / det;
    O[0] = O0; R[0] = R0;
    const i = FARADAY * (kf * O0 - kb * R0);   // cathodic positive, A/m²
    if (n % every === 0) out.push([E, i]);
    if (t < tend / 2) { if (i > pk.c[1]) pk.c = [E, i]; } else if (i < pk.a[1]) pk.a = [E, i];
    const lam = D * dt / (dx * dx);
    const nO = new Float64Array(nx), nR = new Float64Array(nx);
    nO[0] = O0; nR[0] = R0; nO[nx - 1] = C; nR[nx - 1] = 0;
    for (let k = 1; k < nx - 1; k++) { nO[k] = O[k] + lam * (O[k + 1] - 2 * O[k] + O[k - 1]); nR[k] = R[k] + lam * (R[k + 1] - 2 * R[k] + R[k - 1]); }
    O = nO; R = nR;
  }
  return { out, pk };
}
function CVLab({ isKo }) {
  const [logk0, setLogk0] = useState(-2);
  const [logv, setLogv] = useState(-1);
  const v = Math.pow(10, logv);
  const sim = useMemo(() => simulateCV(logk0, v, 0.5), [logk0, v]);
  const data = sim.out, pc = sim.pk.c, pa = sim.pk.a;
  const rs = 0.4463 * FARADAY * 1 * Math.sqrt(FRT * v * 1e-9);
  const lam = Math.pow(10, logk0) / Math.sqrt(1e-9 * FRT * v);
  const W = 560, Ht = 280, pad = 54;
  const imax = Math.max(...data.map(p => Math.abs(p[1]))) * 1.1;
  const { X, Y } = plotScale(0.4, -0.4, -imax, imax, W, Ht, pad);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑪ 순환 전압전류법(CV) 시뮬레이터" : "Lab ⑪ Cyclic voltammetry (CV) simulator"}</Hd>
      <Note>
        {isKo
          ? "전위를 일정한 속도 v로 내렸다가 다시 올리면서(삼각파) 전류를 잽니다. 전위가 E°′ 근처에 오면 환원이 시작되어 전류가 늘지만, 전극 표면의 Ox가 고갈되고 확산층이 두꺼워지면서 전류가 다시 줄어 봉우리가 생깁니다. 되돌아올 때는 만들어 둔 Red가 다시 산화되어 반대 봉우리가 생깁니다. 아래 시뮬레이터는 Fick의 확산 법칙과 Butler–Volmer 경계 조건을 유한 차분으로 풉니다."
          : "Sweep the potential down and back up at a constant rate v (a triangular wave) while recording current. Near E°′ reduction starts and the current rises, but as Ox is depleted at the surface and the diffusion layer thickens the current falls again, making a peak. On the return sweep the Red produced is re-oxidized, giving the opposite peak. The simulator solves Fick's diffusion law with a Butler–Volmer boundary condition by finite differences."}
      </Note>
      <Row>
        <Slider label={isKo ? "표준 속도 상수 log₁₀(k⁰/m s⁻¹)" : "Standard rate constant log₁₀(k⁰/m s⁻¹)"} value={logk0} min={-7} max={-1} step={0.1} onChange={setLogk0} fmt={v => v.toFixed(1)} />
        <Slider label={isKo ? "주사 속도 log₁₀(v/V s⁻¹)" : "Scan rate log₁₀(v/V s⁻¹)"} value={logv} min={-2} max={1} step={0.1} onChange={setLogv} fmt={v => `${v.toFixed(1)} (${Math.pow(10, v).toPrecision(2)} V/s)`} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "E − E°′ (V), 왼쪽으로 갈수록 환원" : "E − E°′ (V), reduction to the left"} ylabel={isKo ? "전류 (A m⁻², 음극 +)" : "current (A m⁻², cathodic +)"} />
        <line x1={pad} x2={W - pad} y1={Y(0)} y2={Y(0)} stroke="#475569" />
        <path d={pathOf(data, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.2} />
        <circle cx={X(pc[0])} cy={Y(pc[1])} r={5} fill={C.sky} />
        <circle cx={X(pa[0])} cy={Y(pa[1])} r={5} fill={C.amber} />
        {[0.4, 0.2, 0, -0.2, -0.4].map(v2 => <text key={v2} x={X(v2)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{v2}</text>)}
      </svg>
      <StatGrid>
        <Stat label={isKo ? "봉우리 간격 ΔE_p" : "Peak separation ΔE_p"} value={`${((pa[0] - pc[0]) * 1000).toFixed(0)} mV`} color={C.accent} />
        <Stat label={isKo ? "음극 봉우리 / Randles–Sevcik" : "Cathodic peak / Randles–Sevcik"} value={`${pc[1].toFixed(2)} / ${rs.toFixed(2)} A m⁻²`} color={C.sky} />
        <Stat label={isKo ? "가역성 Λ = k⁰/√(Dfv)" : "Reversibility Λ = k⁰/√(Dfv)"} value={`${lam.toPrecision(2)} → ${lam > 15 ? (isKo ? "가역" : "reversible") : lam > 1e-3 ? (isKo ? "준가역" : "quasi-reversible") : (isKo ? "비가역" : "irreversible")}`} color={lam > 15 ? C.ok : C.pink} />
      </StatGrid>
      <Note>
        {isKo
          ? "k⁰가 크면(빠른 전자 이동) 표면이 늘 Nernst 평형에 있어 봉우리 간격이 약 57–59 mV이고, 봉우리 전류는 Randles–Sevcik 식 i_p = 0.4463 nFAC√(nFvD/RT)를 따릅니다(√v에 비례). k⁰를 줄이거나 주사 속도를 키우면 전자 이동이 따라가지 못해 봉우리가 벌어지고 낮아집니다. 거꾸로 ΔE_p를 v에 따라 재면 k⁰를 구할 수 있습니다(Nicholson 방법). 강의 21쪽처럼 전자 이동 뒤에 화학 반응이 따라오면(EC 메커니즘), 느린 주사에서는 생성물이 사라져 되돌아오는 산화 봉우리가 없어지고, 빠른 주사에서는 다시 나타납니다."
          : "With large k⁰ (fast electron transfer) the surface stays in Nernstian equilibrium: the peak separation is about 57–59 mV and the peak current obeys the Randles–Sevcik equation i_p = 0.4463 nFAC√(nFvD/RT), proportional to √v. Reduce k⁰ or speed up the scan and electron transfer cannot keep up: the peaks spread and drop. Measuring ΔE_p against v therefore yields k⁰ (Nicholson's method). When a chemical step follows electron transfer (the EC mechanism, lecture page 21), slow scans let the product disappear so the return oxidation peak vanishes, and fast scans bring it back."}
      </Note>
    </Card>
  );
}

function CellLab({ isKo }) {
  const [mode, setMode] = useState("galvanic");
  const [Eeq, setEeq] = useState(1.2);
  const [lj0c, setLj0c] = useState(-3);
  const [Rs, setRs] = useState(0.1);
  const [jlim, setJlim] = useState(1.5);
  const j0a = 0.1, j0c = Math.pow(10, lj0c);
  const sign = mode === "galvanic" ? -1 : 1;
  const pts = [], parts = [];
  for (let j = 0.001; j < jlim * 0.995; j += jlim / 300) {
    const ea = (2 / FRT) * Math.asinh(j / (2 * j0a)), ec = (2 / FRT) * Math.asinh(j / (2 * j0c));
    const econc = -(1 / FRT) * Math.log(1 - j / jlim);
    const V = Eeq + sign * (ea + ec + j * Rs + econc);
    pts.push([j, V]); parts.push([j, ea + ec, j * Rs, econc]);
  }
  const vmax = mode === "galvanic" ? Eeq + 0.1 : Math.max(...pts.map(p => p[1])) + 0.1;
  const vmin = mode === "galvanic" ? Math.min(0, Math.min(...pts.map(p => p[1]))) : Eeq - 0.1;
  const W = 560, Ht = 280, pad = 54;
  const { X, Y } = plotScale(0, jlim, vmin, vmax, W, Ht, pad);
  const P = pts.map(([j, V]) => [j, j * V]);
  const pmax = P.reduce((b, p) => (p[1] > b[1] ? p : b), [0, 0]);
  return (
    <Card>
      <Hd>{isKo ? "실험실 ⑫ 전기분해와 전지: 전압은 어디로 사라지나" : "Lab ⑫ Electrolysis and cells: where does the voltage go?"}</Hd>
      <Eq>{isKo ? "전지:" : "Galvanic cell:"}  V = E_eq − |η_act,a| − |η_act,c| − IR − |η_conc|,     {isKo ? "전해조:" : "electrolyser:"}  V = E_eq + |η_act,a| + |η_act,c| + IR + |η_conc|</Eq>
      <Row>
        <button onClick={() => setMode("galvanic")} style={btnStyle(mode === "galvanic")}>{isKo ? "전지 (연료전지·배터리 방전)" : "Galvanic (fuel cell, battery discharge)"}</button>
        <button onClick={() => setMode("electrolysis")} style={btnStyle(mode === "electrolysis")}>{isKo ? "전기분해 (수전해·충전)" : "Electrolysis (water splitting, charging)"}</button>
      </Row>
      <Row>
        <Slider label="E_eq" value={Eeq} min={0.5} max={2} step={0.01} onChange={setEeq} unit=" V" fmt={v => v.toFixed(2)} />
        <Slider label={isKo ? "느린 전극 log₁₀ j₀" : "Slow electrode log₁₀ j₀"} value={lj0c} min={-7} max={-1} step={0.1} onChange={setLj0c} fmt={v => `${v.toFixed(1)} (A cm⁻²)`} />
        <Slider label="R_s" value={Rs} min={0} max={0.5} step={0.01} onChange={setRs} unit=" Ω cm²" fmt={v => v.toFixed(2)} />
        <Slider label="j_lim" value={jlim} min={0.3} max={3} step={0.05} onChange={setJlim} unit=" A cm⁻²" fmt={v => v.toFixed(2)} />
      </Row>
      <svg viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <Axes W={W} Ht={Ht} pad={pad} xlabel={isKo ? "전류 밀도 j (A cm⁻²)" : "current density j (A cm⁻²)"} ylabel={isKo ? "셀 전압 (V)" : "cell voltage (V)"} />
        <line x1={pad} x2={W - pad} y1={Y(Eeq)} y2={Y(Eeq)} stroke={C.textDim} strokeDasharray="4 3" />
        <text x={W - pad} y={Y(Eeq) - 6} fill={C.textDim} fontSize={11} textAnchor="end">E_eq</text>
        <path d={pathOf(pts, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.6} />
        {[0, 0.5, 1].map(f => <text key={f} x={X(f * jlim)} y={Ht - pad + 14} fill={C.textDim} fontSize={10} textAnchor="middle">{(f * jlim).toFixed(2)}</text>)}
        {[vmin, (vmin + vmax) / 2, vmax].map((v, i) => <text key={i} x={pad - 6} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v.toFixed(2)}</text>)}
      </svg>
      <StatGrid>
        {[0.1, 0.5, 0.9].map(fr => {
          const p = parts[Math.floor(fr * (parts.length - 1))];
          return <Stat key={fr} label={`j = ${p[0].toFixed(2)} A cm⁻²`} value={`${isKo ? "활성화" : "act"} ${p[1].toFixed(2)} · IR ${p[2].toFixed(2)} · ${isKo ? "농도" : "conc"} ${p[3].toFixed(2)} V`} color={C.accent} />;
        })}
        {mode === "galvanic" && <Stat label={isKo ? "최대 출력" : "Peak power"} value={`${pmax[1].toFixed(3)} W cm⁻² @ ${pmax[0].toFixed(2)} A cm⁻²`} color={C.ok} />}
      </StatGrid>
      <Note>
        {isKo
          ? "곡선의 세 구간을 읽어 보십시오. 작은 전류에서는 활성화 과전압(로그 모양의 급한 낙차), 중간에서는 옴 강하(직선), 한계 전류 근처에서는 농도 과전압(급격한 추락)이 지배합니다(강의 23쪽). 산소 환원처럼 j₀가 작은 '느린 전극'이 손실의 대부분을 만듭니다. j₀를 10배 키울 때마다 그 전극의 손실이 Tafel 기울기만큼 줄어듭니다(여기서는 α = 0.5, 2.303 × 2RT/F = 118 mV). 수전해에서는 같은 손실이 전압을 올려 전력 소비를 늘립니다: 효율 = E_eq/V. 강의 22쪽의 결론과 같이, 좋은 전극은 j₀가 커서 작은 과전압으로 같은 전류를 낸다."
          : "Read the three regions of the curve: at small currents activation overpotential (a steep logarithmic drop), in the middle ohmic loss (a straight line), and near the limiting current concentration overpotential (a sudden fall) (lecture page 23). A 'slow electrode' with small j₀, such as oxygen reduction, causes most of the loss; each tenfold increase in its j₀ removes one Tafel slope of loss (here α = 0.5, 2.303 × 2RT/F = 118 mV). In electrolysis the same losses raise the voltage and the power drawn: efficiency = E_eq/V. As lecture page 22 concludes, a good electrode has a large j₀ and delivers the same current at a smaller overpotential."}
      </Note>
    </Card>
  );
}

function ExamplesCard({ isKo }) {
  const f = FRT;
  const r1 = Math.exp(0.5 * f * 0.4);
  const j0 = 0.31 / (Math.exp(0.5 * f * 0.01) - Math.exp(-0.5 * f * 0.01));
  const j100 = j0 * (Math.exp(0.05 * f) - Math.exp(-0.05 * f));
  return (
    <Card>
      <Hd>{isKo ? "강의 예제 세 가지" : "The three lecture examples"}</Hd>
      <HdSub>{isKo ? "예제 1: Ag⁺ + e⁻ → Ag, η = −0.2 V와 +0.2 V의 음극 속도 비 (α = 0.5)" : "Example 1: Ag⁺ + e⁻ → Ag, cathodic rate at η = −0.2 V vs +0.2 V (α = 0.5)"}</HdSub>
      <Eq>j_c(−0.2)/j_c(+0.2) = e^(−αf(−0.2)) / e^(−αf(0.2)) = e^(0.5 × 38.92 × 0.4) = {r1.toFixed(0)}   {isKo ? "(강의는 49/0.02 ≈ 2450으로 반올림)" : "(the lecture rounds 49/0.02 ≈ 2450)"}</Eq>
      <HdSub>{isKo ? "예제 2: Pt 위 H⁺/H₂, 2 cm², η = 10 mV에서 0.62 mA. η = ±100 mV의 전류는?" : "Example 2: H⁺/H₂ on Pt, 2 cm², 0.62 mA at η = 10 mV. Current at η = ±100 mV?"}</HdSub>
      <Eq>0.31 mA cm⁻² = j₀[e^(0.5f × 0.01) − e^(−0.5f × 0.01)]   →   j₀ = {j0.toFixed(3)} mA cm⁻²</Eq>
      <Eq>j(±0.1 V) = ±j₀[e^(0.5f × 0.1) − e^(−0.5f × 0.1)] = ±{j100.toFixed(2)} mA cm⁻²   →   I = ±{(2 * j100).toFixed(1)} mA</Eq>
      <Note>
        {isKo
          ? "강의 슬라이드의 마지막 식은 지수에 0.01이 남아 있지만, η = 0.1 V를 넣어야 5.42 mA/cm²가 나옵니다. (a) η = +100 mV에서는 양극(산화) 전류 +5.42 mA/cm², (b) η = −100 mV에서는 음극 전류 −5.42 mA/cm²입니다. 10 mV는 선형 영역(fη = 0.39)이고 100 mV는 이미 Tafel 영역에 가깝습니다."
          : "The last line of the lecture slide still shows 0.01 in the exponent, but η = 0.1 V is what gives 5.42 mA/cm²: (a) +5.42 mA/cm² (anodic) at η = +100 mV, (b) −5.42 mA/cm² (cathodic) at η = −100 mV. 10 mV lies in the linear region (fη = 0.39); 100 mV is already close to the Tafel region."}
      </Note>
      <HdSub>{isKo ? "예제 3: 토코페롤(비타민 E)의 EC 메커니즘과 CV" : "Example 3: the EC mechanism of tocopherol (vitamin E) and CV"}</HdSub>
      <Note>
        {isKo
          ? "토코페롤 A가 전자와 양성자를 잃어 양이온 B가 되고(E, 전기화학 단계), B는 물과 반응해 C가 됩니다(C, 화학 단계). 빠른 주사: B가 물과 반응하기 전에 되돌아오는 주사가 B를 다시 환원하므로 가역 CV처럼 산화·환원 봉우리 쌍이 보입니다. 느린 주사: B가 C로 바뀌어 사라지므로 되돌아오는 환원 봉우리가 작아지거나 없어집니다(B의 E°_red = 0.8 V 근처). 주사 속도에 따라 봉우리 비가 변하는 것으로 뒤따르는 화학 반응의 속도를 잴 수 있습니다."
          : "Tocopherol A loses an electron and a proton to become the cation B (E, the electrochemical step), and B reacts with water to give C (C, the chemical step). Fast scan: the return sweep re-reduces B before it reacts with water, so a reversible-looking pair of peaks appears. Slow scan: B turns into C and disappears, so the return reduction peak near B's E°_red = 0.8 V shrinks or vanishes. How the peak ratio changes with scan rate measures the rate of the following chemical step."}
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
        q: "P1. (선형 안정성) 두 화학종의 Jacobian이 J = [[−2, 3], [−1, 1]]이다. (a) T와 Δ를 구하고 고유값을 계산하시오. (b) 평형점의 종류는? (c) 작은 요동이 처음의 1/e로 줄어드는 데 걸리는 시간과 진동 주기는?",
        s: "(a) T = −2 + 1 = −1, Δ = (−2)(1) − (3)(−1) = 1. λ = [−1 ± √(1 − 4)]/2 = −0.5 ± 0.866i. (b) T < 0, Δ > 0, T² < 4Δ이므로 안정 나선입니다. (c) 진폭은 e^(Re λ t) = e^(−0.5t)로 줄어 1/e까지 t = 2(시간 단위), 진동 각진동수 0.866이므로 주기 2π/0.866 = 7.26입니다. 감쇠 시간이 주기보다 짧아 한두 바퀴 돌고 멈춥니다.",
      },
      en: {
        q: "P1. (Linear stability) A two-species system has Jacobian J = [[−2, 3], [−1, 1]]. (a) Find T and Δ and the eigenvalues. (b) What kind of steady state is it? (c) How long does a small disturbance take to shrink to 1/e, and what is its period of oscillation?",
        s: "(a) T = −2 + 1 = −1 and Δ = (−2)(1) − (3)(−1) = 1, so λ = [−1 ± √(1 − 4)]/2 = −0.5 ± 0.866i. (b) T < 0, Δ > 0 and T² < 4Δ: a stable spiral. (c) The amplitude decays as e^(Re λ t) = e^(−0.5t), reaching 1/e at t = 2 (time units); the angular frequency is 0.866, so the period is 2π/0.866 = 7.26. Damping is faster than one period, so it circles once or twice and stops.",
      },
    },
    {
      ko: {
        q: "P2. (Turing 조건 일반형) 활성자–억제자 계의 Jacobian이 R = [[1, −1], [2, −1.5]]이고, 확산 행렬이 D = diag(1, d)이다(d = 억제자/활성자 확산 비). (a) 확산이 없을 때 안정함을 보이시오. (b) Turing 불안정이 생기는 d의 범위를 구하시오. (c) 임계점에서 무늬의 파장은? (γ = 1)",
        s: "(a) T(R) = 1 − 1.5 = −0.5 < 0, Δ(R) = (1)(−1.5) − (−1)(2) = 0.5 > 0이므로 안정합니다. (b) 조건 (i) dR₁₁ + R₂₂ = d − 1.5 > 0 → d > 1.5. 조건 (ii) (d − 1.5)² > 4dΔ = 2d → d² − 5d + 2.25 > 0 → d > (5 + √16)/2 = 4.5. 따라서 d > 4.5. (c) k*² = (dR₁₁ + R₂₂)/(2d) = 3/9 = 1/3, k* = 0.577, 파장 2π/k* = 10.9(길이 단위). 억제자가 활성자보다 4.5배 넘게 빨리 퍼져야 무늬가 생깁니다.",
      },
      en: {
        q: "P2. (General Turing conditions) An activator–inhibitor system has Jacobian R = [[1, −1], [2, −1.5]] and diffusion matrix D = diag(1, d) (d = inhibitor/activator diffusivity ratio). (a) Show it is stable without diffusion. (b) Find the range of d for Turing instability. (c) What is the pattern wavelength at threshold (γ = 1)?",
        s: "(a) T(R) = 1 − 1.5 = −0.5 < 0 and Δ(R) = (1)(−1.5) − (−1)(2) = 0.5 > 0: stable. (b) Condition (i): dR₁₁ + R₂₂ = d − 1.5 > 0 → d > 1.5. Condition (ii): (d − 1.5)² > 4dΔ = 2d → d² − 5d + 2.25 > 0 → d > (5 + √16)/2 = 4.5. Hence d > 4.5. (c) k*² = (dR₁₁ + R₂₂)/(2d) = 3/9 = 1/3, k* = 0.577, wavelength 2π/k* = 10.9 (length units). The inhibitor must spread more than 4.5 times faster than the activator.",
      },
    },
    {
      ko: {
        q: "P3. (강의 모형) f = k(16 − ab), g = k(ab − b − 12). (a) 균일 정상 상태 (a*, b*)를 구하시오. (b) Jacobian을 쓰고, 어느 종이 활성자인지 판정하시오. (c) Turing 불안정의 임계 확산 비 D_a/D_b를 유도하시오.",
        s: "(a) ab = 16, b(a − 1) = 12 → 16 − b = 12 → b* = 4, a* = 4. (b) J = k[[−b, −a], [b, a − 1]] = k[[−4, −4], [4, 3]]. ∂g/∂b = +3k > 0이므로 b가 스스로를 늘리는 활성자, ∂f/∂a = −4k < 0인 a가 억제자입니다. T = −k < 0, Δ = 4k² > 0이므로 확산 없이는 안정합니다. (c) r = D_a/D_b로 두면 조건 (i) −4D_b + 3D_a > 0 → r > 4/3, 조건 (ii) (3r − 4)² > 16r → 9r² − 40r + 16 > 0 → r > (40 + 32)/18 = 4. 강의 값 D_a = 0.1, D_b = 0.02(r = 5)는 이 기준을 넘고, 가장 빨리 자라는 파장은 약 6.5칸입니다.",
      },
      en: {
        q: "P3. (Lecture model) f = k(16 − ab), g = k(ab − b − 12). (a) Find the uniform steady state (a*, b*). (b) Write the Jacobian and decide which species is the activator. (c) Derive the critical diffusivity ratio D_a/D_b for Turing instability.",
        s: "(a) ab = 16 and b(a − 1) = 12 → 16 − b = 12 → b* = 4, a* = 4. (b) J = k[[−b, −a], [b, a − 1]] = k[[−4, −4], [4, 3]]. Since ∂g/∂b = +3k > 0, b enhances itself (the activator); a, with ∂f/∂a = −4k < 0, is the inhibitor. T = −k < 0 and Δ = 4k² > 0: stable without diffusion. (c) With r = D_a/D_b, condition (i) −4D_b + 3D_a > 0 → r > 4/3; condition (ii) (3r − 4)² > 16r → 9r² − 40r + 16 > 0 → r > (40 + 32)/18 = 4. The lecture values D_a = 0.1, D_b = 0.02 (r = 5) exceed it, and the fastest-growing wavelength is about 6.5 cells.",
      },
    },
    {
      ko: {
        q: "P4. (포식자–피식자) dX/dτ = X[r₀(1 − X/X₀) − kY/(1 + X)], dY/dτ = Y[kX/(1 + X) − 1]. (a) 공존 평형 X*, Y*를 구하시오. (b) Jacobian의 대각합이 0이 되는 X₀(Hopf 분기)를 유도하시오. (c) k = 2일 때 X₀ = 2와 5에서 무슨 일이 일어나는가?",
        s: "(a) 포식자 식에서 kX*/(1 + X*) = 1 → X* = 1/(k − 1). 피식자 식에서 Y* = r₀(1 − X*/X₀)(1 + X*)/k. (b) 평형에서 J₂₂ = 0이므로 대각합 = J₁₁ = X*[−r₀/X₀ + kY*/(1 + X*)²] = X*r₀[−1/X₀ + (1 − X*/X₀)/(1 + X*)]. 이것이 0이 되는 조건은 1 + X* = X₀ − X*, 곧 X₀ = 1 + 2X* = (k + 1)/(k − 1). (c) k = 2이면 X* = 1, 분기점 X₀ = 3. X₀ = 2이면 대각합 < 0으로 안정 평형(감쇠 진동), X₀ = 5이면 대각합 > 0으로 극한 순환이 됩니다. 먹이를 늘렸더니 오히려 불안정해지는 '풍요의 역설'입니다.",
      },
      en: {
        q: "P4. (Predator–prey) dX/dτ = X[r₀(1 − X/X₀) − kY/(1 + X)], dY/dτ = Y[kX/(1 + X) − 1]. (a) Find the coexistence steady state X*, Y*. (b) Derive the X₀ at which the trace of the Jacobian vanishes (Hopf bifurcation). (c) With k = 2, what happens at X₀ = 2 and at X₀ = 5?",
        s: "(a) The predator equation gives kX*/(1 + X*) = 1 → X* = 1/(k − 1); the prey equation gives Y* = r₀(1 − X*/X₀)(1 + X*)/k. (b) At the steady state J₂₂ = 0, so the trace is J₁₁ = X*[−r₀/X₀ + kY*/(1 + X*)²] = X*r₀[−1/X₀ + (1 − X*/X₀)/(1 + X*)]. This vanishes when 1 + X* = X₀ − X*, i.e. X₀ = 1 + 2X* = (k + 1)/(k − 1). (c) For k = 2, X* = 1 and the bifurcation is at X₀ = 3. At X₀ = 2 the trace is negative: a stable steady state (damped oscillation). At X₀ = 5 it is positive: a limit cycle. More food destabilizes the system, the 'paradox of enrichment'.",
      },
    },
    {
      ko: {
        q: "P5. (Debye 길이) 25 °C 물(ε_r = 78.5)에서 (a) 0.001 M NaCl, (b) 0.01 M NaCl, (c) 0.01 M MgSO₄의 Debye 길이를 구하시오. (d) 콜로이드 분산액에 염을 넣으면 입자가 뭉치는 이유를 설명하시오.",
        s: "κ⁻¹ = √(εk_BT/(2z²e²c₀N_A)), 1:1이면 0.304/√(c/M) nm. (a) 9.62 nm. (b) 3.04 nm. (c) z = 2이므로 2배 짧아 1.52 nm. (d) 입자 사이의 정전기 반발은 대략 e^(−κh)로 줄어듭니다. 염을 넣으면 κ⁻¹이 짧아져 반발이 미치는 거리가 줄고, 늘 작용하는 van der Waals 끌림이 이겨 입자가 뭉칩니다(DLVO 이론). 2가·3가 이온이 훨씬 효과적인 이유(Schulze–Hardy 규칙)도 z²에 있습니다. 정수 처리의 응집제(Al³⁺, Fe³⁺)가 이 원리를 씁니다.",
      },
      en: {
        q: "P5. (Debye length) In water at 25 °C (ε_r = 78.5), find the Debye length of (a) 0.001 M NaCl, (b) 0.01 M NaCl, (c) 0.01 M MgSO₄. (d) Explain why adding salt makes a colloidal dispersion coagulate.",
        s: "κ⁻¹ = √(εk_BT/(2z²e²c₀N_A)), which for 1:1 is 0.304/√(c/M) nm. (a) 9.62 nm. (b) 3.04 nm. (c) z = 2 halves it: 1.52 nm. (d) The electrostatic repulsion between particles decays roughly as e^(−κh). Salt shortens κ⁻¹, so the repulsion reaches less far, and the ever-present van der Waals attraction wins: the particles aggregate (DLVO theory). The far greater effect of di- and trivalent ions (the Schulze–Hardy rule) comes from z². Coagulants in water treatment (Al³⁺, Fe³⁺) use this principle.",
      },
    },
    {
      ko: {
        q: "P6. (Gouy–Chapman) 0.001 M NaCl 속 전극의 표면 전위가 50 mV이다. (a) x = 10 nm에서의 전위를 Gouy–Chapman 해와 Debye–Hückel 근사로 각각 구하시오. (b) 표면에서 음이온 농도는 벌크의 몇 배인가? (c) Grahame 식으로 표면 전하 밀도를 구하시오.",
        s: "(a) κ⁻¹ = 9.62 nm, k_BT/e = 25.69 mV. tanh(φ₀/4·25.69 mV) = tanh(0.4866) = 0.4515. tanh(φ/102.8 mV) = 0.4515 × e^(−10/9.62) = 0.1597 → φ = 102.8 × atanh(0.1597) = 16.5 mV. Debye–Hückel: 50 × e^(−1.040) = 17.7 mV. 전위가 2k_BT/e 정도라 차이가 7%입니다. (b) c₋/c₀ = e^(eφ₀/k_BT) = e^(1.946) = 7.0배. (c) σ = √(8εk_BTc₀N_A) sinh(eφ₀/2k_BT) = 0.42 µC/cm².",
      },
      en: {
        q: "P6. (Gouy–Chapman) An electrode in 0.001 M NaCl has surface potential 50 mV. (a) Find the potential at x = 10 nm from the Gouy–Chapman solution and from the Debye–Hückel approximation. (b) How many times the bulk is the anion concentration at the surface? (c) Use the Grahame equation for the surface charge density.",
        s: "(a) κ⁻¹ = 9.62 nm and k_BT/e = 25.69 mV. tanh(φ₀/(4 × 25.69 mV)) = tanh(0.4866) = 0.4515; tanh(φ/102.8 mV) = 0.4515 × e^(−10/9.62) = 0.1597 → φ = 102.8 × atanh(0.1597) = 16.5 mV. Debye–Hückel: 50 × e^(−1.040) = 17.7 mV. At about 2k_BT/e the two differ by 7%. (b) c₋/c₀ = e^(eφ₀/k_BT) = e^(1.946) = 7.0 times. (c) σ = √(8εk_BTc₀N_A) sinh(eφ₀/2k_BT) = 0.42 µC/cm².",
      },
    },
    {
      ko: {
        q: "P7. (Tafel과 촉매) 산소 환원 반응의 교환 전류 밀도가 j₀ = 1×10⁻⁶ A/cm², α = 0.5이다(25 °C). (a) 음극 Tafel 기울기는? (b) 1 mA/cm²를 얻는 데 필요한 과전압은? (c) 촉매를 바꾸어 j₀가 10⁻⁵ A/cm²가 되면 과전압은 얼마나 줄어드는가? (d) 연료전지 셀 전압에 주는 의미는?",
        s: "(a) b = 2.303RT/(αF) = 2.303 × 25.69 mV/0.5 = 118 mV/decade. (b) Tafel 영역에서 |η| = b log₁₀(j/j₀) = 118 × log₁₀(10⁻³/10⁻⁶) = 118 × 3 = 355 mV. (c) j₀가 10배면 log 항이 1 줄어 236 mV, 곧 118 mV(한 Tafel 기울기) 줄어듭니다. (d) 이론 전압 1.23 V 중 약 0.35 V를 산소 전극 활성화에서 잃는 셈이라, 연료전지 연구의 큰 줄기가 j₀를 키우는 Pt 합금·단원자 촉매 개발입니다. 같은 손실이 수전해에서는 필요한 전압과 전력을 늘립니다.",
      },
      en: {
        q: "P7. (Tafel and catalysts) Oxygen reduction has exchange current density j₀ = 1×10⁻⁶ A/cm² and α = 0.5 at 25 °C. (a) What is the cathodic Tafel slope? (b) What overpotential gives 1 mA/cm²? (c) If a new catalyst raises j₀ to 10⁻⁵ A/cm², how much does the overpotential fall? (d) What does this mean for fuel-cell voltage?",
        s: "(a) b = 2.303RT/(αF) = 2.303 × 25.69 mV/0.5 = 118 mV/decade. (b) In the Tafel region |η| = b log₁₀(j/j₀) = 118 × log₁₀(10⁻³/10⁻⁶) = 118 × 3 = 355 mV. (c) A tenfold j₀ removes one decade: 236 mV, i.e. 118 mV (one Tafel slope) less. (d) About 0.35 V of the theoretical 1.23 V is lost to activating the oxygen electrode, which is why so much fuel-cell research targets larger j₀ with Pt alloys and single-atom catalysts. In electrolysis the same loss raises the voltage and power required.",
      },
    },
    {
      ko: {
        q: "P8. (순환 전압전류법) 1.0 mM 페로센(n = 1, D = 1.0×10⁻⁵ cm²/s)을 넓이 0.070 cm²인 전극에서 v = 0.10 V/s로 측정한다. (a) Randles–Sevcik 식으로 봉우리 전류를 구하시오. (b) 가역이라면 봉우리 간격은? (c) 주사 속도를 100배로 올렸더니 봉우리 간격이 120 mV로 벌어졌다. 무엇을 뜻하는가?",
        s: "(a) i_p = 0.4463 nFAC√(nFvD/RT) = (2.69×10⁵) n^(3/2) A D^(1/2) C v^(1/2) (25 °C, cm 단위) = 2.69×10⁵ × 0.070 × (1.0×10⁻⁵)^(1/2) × 1.0×10⁻⁶ × (0.10)^(1/2) = 1.88×10⁻⁵ A = 18.8 µA. (b) 2.22RT/nF ≈ 57 mV(실측 보통 57–60 mV). (c) 가역이면 v와 무관하게 57 mV여야 합니다. 벌어졌다는 것은 v를 키워 Λ = k⁰/√(Dfv)가 작아지면서 전자 이동이 확산을 따라가지 못하는 준가역 영역에 들어갔다는 뜻이고, ΔE_p–v 관계에서 k⁰를 구할 수 있습니다(Nicholson 방법). 용액 저항(iR 강하)도 같은 효과를 내므로 보정이 필요합니다.",
      },
      en: {
        q: "P8. (Cyclic voltammetry) 1.0 mM ferrocene (n = 1, D = 1.0×10⁻⁵ cm²/s) is measured at an electrode of area 0.070 cm² with v = 0.10 V/s. (a) Use the Randles–Sevcik equation for the peak current. (b) What peak separation is expected if the couple is reversible? (c) At a 100-times faster scan, the separation widens to 120 mV. What does this mean?",
        s: "(a) i_p = 0.4463 nFAC√(nFvD/RT) = (2.69×10⁵) n^(3/2) A D^(1/2) C v^(1/2) (25 °C, cm units) = 2.69×10⁵ × 0.070 × (1.0×10⁻⁵)^(1/2) × 1.0×10⁻⁶ × (0.10)^(1/2) = 1.88×10⁻⁵ A = 18.8 µA. (b) 2.22RT/nF ≈ 57 mV (typically 57–60 mV measured). (c) A reversible couple stays at 57 mV whatever v. The widening means that the larger v has reduced Λ = k⁰/√(Dfv), and electron transfer can no longer keep up with diffusion: the quasi-reversible regime, from which k⁰ follows via the ΔE_p–v relation (Nicholson's method). Uncompensated solution resistance (iR drop) has the same effect and must be corrected.",
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
            ? "풀이를 열기 전에 스스로 풀어 보십시오. P1–P4는 선형 안정성과 Turing 조건, Hopf 분기, P5–P6은 전기 이중층, P7–P8은 전극 반응 속도와 순환 전압전류법입니다. 수치는 Raw 코드 탭의 Python·C++ 코드로 검산했습니다."
            : "Attempt each before opening the solution. P1–P4 cover linear stability, Turing conditions and the Hopf bifurcation, P5–P6 the electrical double layer, and P7–P8 electrode kinetics and cyclic voltammetry. The numbers were checked with the Python and C++ codes in the Raw Codes tab."}
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
  stability: {
    ko: "(T, Δ) 분류·Turing 조건·임계 확산 비·분산 관계", en: "(T, Δ) classification · Turing conditions · critical ratio · dispersion",
    codes: { python: PY_STAB, matlab: ML_STAB, julia: JL_STAB, cpp: CPP_STAB },
  },
  reaction_diffusion: {
    ko: "Turing 1D 시뮬레이션·Gray–Scott 2D", en: "Turing 1D simulation · Gray–Scott 2D",
    codes: { python: PY_RD, matlab: ML_RD, julia: JL_RD, cpp: CPP_RD },
  },
  double_layer: {
    ko: "Debye 길이·Gouy–Chapman·Grahame·Stern 용량", en: "Debye length · Gouy–Chapman · Grahame · Stern capacitance",
    codes: { python: PY_EDL, matlab: ML_EDL, julia: JL_EDL, cpp: CPP_EDL },
  },
  electrode_kinetics: {
    ko: "Butler–Volmer·Tafel 맞춤·강의 예제·CV·셀 전압", en: "Butler–Volmer · Tafel fit · lecture examples · CV · cell voltage",
    codes: { python: PY_EK, matlab: ML_EK, julia: JL_EK, cpp: CPP_EK },
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
  const [topic, setTopic] = useState("stability");
  const [cl, setCl] = useState("python");
  const [copied, setCopied] = useState(false);
  const code = CODE_TOPICS[topic].codes[cl];
  const fname = `wk15_${topic}.${LANG_META[cl].ext}`;

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
            ? "이 페이지의 인터랙티브 뒤에 있는 계산을 직접 실행해 볼 수 있는 독립 코드입니다. Python과 C++은 실행해 확인한 값입니다: (T, Δ)에 따른 다섯 가지 평형점 분류, 강의 모형의 정상 상태 (4, 4)와 T = −0.02·Δ = 0.0016(k = 0.02), 임계 확산 비 D_a/D_b = 4, D_a = 0.1·D_b = 0.02에서 불안정 띠 q = 0.68–1.32와 가장 빨리 자라는 파장 6.50칸, 1D 시뮬레이션의 최종 파장 5.6–5.8칸(잡음에 따라 다름), Gray–Scott 점(F = 0.0367, k = 0.0649)·미로(0.029, 0.057)·소멸(0.010, 0.070), Debye 길이 0.01 M에서 3.04 nm, 100 mV Gouy–Chapman 해와 수치해의 일치(κ⁻¹에서 29.1 mV, Debye–Hückel 36.8 mV), Stern 전체 용량 0.1 M에서 14.2 µF/cm², Tafel 맞춤 j₀ = 2.42 mA/cm²·α = 0.58, Ag⁺ 속도 비 2403, H⁺/H₂ 예제 j₀ = 0.791 mA/cm²·±5.43 mA/cm², 가역 CV 봉우리 간격 57.7 mV와 Randles–Sevcik 비 1.000. MATLAB과 Julia 판은 같은 알고리즘을 옮긴 것입니다."
            : "Standalone codes for the calculations behind every interactive on this page. The Python and C++ versions were run and give: the five steady-state classes from (T, Δ); the lecture model's steady state (4, 4) with T = −0.02 and Δ = 0.0016 (k = 0.02); the critical ratio D_a/D_b = 4; for D_a = 0.1, D_b = 0.02 the unstable band q = 0.68–1.32 and fastest wavelength 6.50 cells; a final 1D simulated wavelength of 5.6–5.8 cells (noise-dependent); Gray–Scott spots (F = 0.0367, k = 0.0649), maze (0.029, 0.057) and extinction (0.010, 0.070); a Debye length of 3.04 nm at 0.01 M; the 100 mV Gouy–Chapman solution matching the numerical one (29.1 mV at κ⁻¹ vs Debye–Hückel 36.8 mV); total Stern capacitance 14.2 µF/cm² at 0.1 M; the Tafel fit j₀ = 2.42 mA/cm² and α = 0.58; the Ag⁺ rate ratio 2403; the H⁺/H₂ example j₀ = 0.791 mA/cm² and ±5.43 mA/cm²; a reversible CV peak separation of 57.7 mV with Randles–Sevcik ratio 1.000. The MATLAB and Julia versions port the same algorithms."}
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
