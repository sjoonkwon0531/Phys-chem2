// ============================================================
// Week06App.jsx — Macromolecules, Self-Assembly & Chemical Kinetics
// Physical Chemistry 2 (물리화학 2)
// SKKU School of Chemical Engineering
// Smart Process & Materials Design Lab (SPMDL)
// Prof. S. Joon Kwon
// ------------------------------------------------------------
// Topics covered (Wk06 Part 1 / Part 2):
//   • Macromolecules — average molar masses (Mn, Mw, Mz, dispersity),
//     GPC & light scattering (Zimm), random coils (R_rms, Rg),
//     constrained chains, conformational entropy & entropic elasticity,
//     glass transition
//   • Self-assembly — colloids, electrical double layer, DLVO,
//     hydrophobic interaction, micelles, bilayers & membranes
//   • Chemical kinetics — rate definition, rate laws & reaction order,
//     isolation / initial-rate methods, integrated rate laws, half-life
//   • Approach to equilibrium, relaxation (T-jump), Arrhenius
//     equation, activation energy, catalysis
// ============================================================
import { useState, useEffect, useRef } from "react";
import {
  PY_POLYMER, ML_POLYMER, JL_POLYMER, CPP_POLYMER,
  PY_DLVO, ML_DLVO, JL_DLVO, CPP_DLVO,
  PY_RATES, ML_RATES, JL_RATES, CPP_RATES,
  PY_RELAX, ML_RELAX, JL_RELAX, CPP_RELAX,
} from "./Week06Codes";

// ── i18n ─────────────────────────────────────────────────────
const i18n = {
  ko: {
    weekTitle: "Week 6 — 고분자·자기조립과 화학 반응속도론",
    subtitle: "평균 분자량 · 랜덤 코일 · 엔트로피 탄성 · DLVO · 미셀 · 속도식 · Arrhenius",
    tabs: {
      overview: "개요",
      molar: "평균 분자량",
      coil: "랜덤 코일 & 탄성",
      assembly: "콜로이드 & 자기조립",
      rates: "속도식",
      equil: "평형 접근 & Arrhenius",
      practice: "연습문제",
      codes: "Raw 코드",
    },
  },
  en: {
    weekTitle: "Week 6 — Macromolecules, Self-Assembly & Chemical Kinetics",
    subtitle: "Molar-mass averages · Random coils · Entropic elasticity · DLVO · Micelles · Rate laws · Arrhenius",
    tabs: {
      overview: "Overview",
      molar: "Molar Masses",
      coil: "Random Coils & Elasticity",
      assembly: "Colloids & Self-Assembly",
      rates: "Rate Laws",
      equil: "Equilibrium & Arrhenius",
      practice: "Practice",
      codes: "Raw Codes",
    },
  },
};

// ── design tokens (Week 6 accent: lime) ──────────────────────
const C = {
  bg: "#0b0f17",
  panel: "#111827",
  card: "#1f2937",
  border: "#374151",
  text: "#e5e7eb",
  textDim: "#9ca3af",
  accent: "#a3e635",
  accentSoft: "#bef264",
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
const KB = 1.380649e-23;
const NAV = 6.02214076e23;
const QE = 1.602176634e-19;
const EPSW = 78.5 * 8.8541878128e-12;     // water, 25 °C
const RGAS = 8.314462618;

// =============================================================
// MAIN COMPONENT
// =============================================================
export default function Week06App({ onBack, lang: langProp, onLangChange }) {
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
        {tab === "molar" && <MolarTab lang={lang} />}
        {tab === "coil" && <CoilTab lang={lang} />}
        {tab === "assembly" && <AssemblyTab lang={lang} />}
        {tab === "rates" && <RatesTab lang={lang} />}
        {tab === "equil" && <EquilTab lang={lang} />}
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
    background: active ? "rgba(163,230,53,0.14)" : "transparent",
    color: active ? C.accentSoft : C.textDim,
    border: `1px solid ${active ? "rgba(163,230,53,0.4)" : "transparent"}`,
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

// =============================================================
// 1) OVERVIEW
// =============================================================
function Overview({ lang }) {
  const isKo = lang === "ko";
  const timeline = [
    { yr: "1889", who: "Arrhenius", ko: "k = A·e^(−Ea/RT) — 반응 속도의 온도 의존성", en: "k = A·e^(−Ea/RT) — the temperature dependence of rates", c: C.amber },
    { yr: "1920", who: "Staudinger", ko: "고분자는 공유결합으로 이어진 '거대 분자'다 (1953 노벨상)", en: "Polymers are covalently bonded 'macromolecules' (Nobel 1953)", c: C.accent },
    { yr: "1934", who: "Kuhn", ko: "사슬을 무작위 걸음으로 — 랜덤 코일의 통계", en: "A chain as a random walk — statistics of the random coil", c: C.accent },
    { yr: "1941–48", who: "Derjaguin · Landau · Verwey · Overbeek", ko: "DLVO 이론: 콜로이드 안정성 = van der Waals 인력 + 이중층 반발", en: "DLVO theory: colloid stability = van der Waals attraction + double-layer repulsion", c: C.cyan },
    { yr: "1959", who: "Kauzmann", ko: "소수성 상호작용 — 단백질 접힘의 주된 추진력", en: "The hydrophobic interaction — the main driving force of protein folding", c: C.cyan },
    { yr: "1967", who: "Eigen · Norrish · Porter", ko: "완화법(온도 점프)으로 초고속 반응을 재다 — 노벨 화학상", en: "Relaxation methods (T-jump) clock ultrafast reactions — Nobel Prize", c: C.amber },
    { yr: "1974", who: "Flory", ko: "고분자 물리화학의 체계화 — 노벨 화학상", en: "The physical chemistry of macromolecules — Nobel Prize", c: C.accent },
    { yr: "2000", who: "Heeger · MacDiarmid · Shirakawa", ko: "전기가 통하는 고분자 — 노벨 화학상", en: "Conducting polymers — Nobel Prize", c: C.purple },
    { yr: "2024", who: "Baker · Hassabis · Jumper", ko: "단백질 구조 예측·설계(AlphaFold) — 노벨 화학상", en: "Protein structure prediction and design (AlphaFold) — Nobel Prize", c: C.purple },
  ];
  return (
    <div>
      <Card>
        <Hd>{isKo ? "지난주에서 이번 주로: 큰 분자, 그리고 '얼마나 빨리'" : "From last week: big molecules, and 'how fast'"}</Hd>
        <Note>
          {isKo
            ? "5주차에 분자와 분자 사이의 힘을 배웠습니다. 이번 주 전반부는 그 힘이 '아주 큰 분자'에서 무엇을 만드는지 봅니다. 수천 개의 단위체가 이어진 사슬은 한 가지 분자량으로 말할 수 없어 평균(Mn, Mw)이 필요하고, 곧게 펴지지 않고 랜덤 코일로 뭉치며, 잡아당기면 에너지가 아니라 엔트로피 때문에 되돌아옵니다(고무의 탄성). 물속의 콜로이드 입자는 5주차의 van der Waals 인력과 전기 이중층 반발의 줄다리기(DLVO)로 안정성이 정해지고, 양친매성 분자는 미셀과 막으로 스스로 조립됩니다. 후반부는 질문 자체가 바뀝니다. 지금까지는 '평형에서 어떤 상태인가'였다면, 이제 '그 상태에 얼마나 빨리 가는가'를 묻습니다. 속도식, 적분 속도식, 그리고 4주차 Boltzmann 인자의 직계 후손인 Arrhenius 식입니다."
            : "Week 5 taught the forces between molecules. The first half of this week asks what those forces build when the molecules are very large. A chain of thousands of monomers has no single molar mass, so we need averages (Mn, Mw); it does not stretch out straight but curls into a random coil; and when pulled it springs back because of entropy, not energy (rubber elasticity). Colloidal particles in water are stabilised or destroyed by a tug-of-war between Week 5's van der Waals attraction and electrical double-layer repulsion (DLVO), and amphiphiles assemble themselves into micelles and membranes. The second half changes the question itself. So far we asked 'what is the state at equilibrium'; now we ask 'how fast do we get there'. Rate laws, integrated rate laws, and the Arrhenius equation, a direct descendant of Week 4's Boltzmann factor."}
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
            { name: isKo ? "분자량 분산도" : "Dispersity", eq: "Đ = Mw/Mn ≥ 1", c: C.accent },
            { name: isKo ? "랜덤 코일의 크기" : "Random-coil size", eq: "R_rms = N^½ l,  Rg = (N/6)^½ l", c: C.cyan },
            { name: isKo ? "1차 반응" : "First-order reaction", eq: "[A] = [A]₀ e^(−kt),  t½ = ln2/k", c: C.amber },
            { name: "Arrhenius", eq: "k = A e^(−Ea/RT)", c: C.purple },
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
          isKo ? "수평균·중량평균 분자량과 분산도 Đ를 계산하고, 어떤 측정법이 어떤 평균을 주는지 설명할 수 있다." : "Compute number- and weight-average molar masses and the dispersity Đ, and say which experiment yields which average.",
          isKo ? "자유 연결 사슬의 윤곽 길이 Nl, 제곱평균제곱근 거리 N^½ l, 회전 반지름 (N/6)^½ l을 유도하고 계산할 수 있다." : "Derive and evaluate the contour length Nl, the rms separation N^½ l, and the radius of gyration (N/6)^½ l of a freely jointed chain.",
          isKo ? "배좌 엔트로피에서 복원력 F = (kT/2l) ln[(1+ν)/(1−ν)]을 얻고, 고무 탄성이 엔트로피적임을 설명할 수 있다." : "Obtain the restoring force F = (kT/2l) ln[(1+ν)/(1−ν)] from conformational entropy and explain why rubber elasticity is entropic.",
          isKo ? "DLVO 퍼텐셜로 염 농도·이온 전하가 콜로이드 안정성에 미치는 영향을 정량적으로 판단할 수 있다." : "Use the DLVO potential to judge quantitatively how salt concentration and ion valence control colloid stability.",
          isKo ? "소수성 상호작용이 엔트로피 주도임을 ΔG = ΔH − TΔS로 설명하고, 미셀 형성과 CMC를 모형으로 이해한다." : "Explain via ΔG = ΔH − TΔS that the hydrophobic interaction is entropy-driven, and model micelle formation and the CMC.",
          isKo ? "초기 속도법과 고립법으로 실험 데이터에서 반응 차수와 속도 상수를 결정할 수 있다." : "Determine reaction orders and rate constants from data using the isolation and initial-rate methods.",
          isKo ? "0·1·2차 적분 속도식과 반감기를 쓰고, 선형화 그림으로 차수를 판별할 수 있다." : "Write the zeroth-, first-, and second-order integrated rate laws and half-lives, and identify the order from linearised plots.",
          isKo ? "평형 접근의 완화 시간 τ = 1/(k + k′)과 K = k/k′을 연결하고, Arrhenius 그림에서 Ea와 A를 구할 수 있다." : "Connect the relaxation time τ = 1/(k + k′) with K = k/k′, and extract Ea and A from an Arrhenius plot.",
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
    { t: isKo ? "평균 분자량" : "Molar-mass averages", s: "Mn, Mw, Đ", c: C.accent },
    { t: isKo ? "랜덤 코일" : "Random coil", s: "N^½ l", c: C.cyan },
    { t: isKo ? "자기조립" : "Self-assembly", s: "DLVO · CMC", c: C.sky },
    { t: isKo ? "속도식" : "Rate laws", s: "v = k[A]ᵃ[B]ᵇ", c: C.amber },
    { t: "Arrhenius", s: "A e^(−Ea/RT)", c: C.purple },
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
            <div style={{ fontSize: 11, color: C.textDim, fontFamily: mono, marginTop: 3 }}>{st.s}</div>
          </div>
          {i < steps.length - 1 && <div style={{ color: C.textDim, padding: "0 8px", fontSize: 18 }}>→</div>}
        </div>
      ))}
    </div>
  );
}

// =============================================================
// 2) MOLAR MASSES
// =============================================================
function MolarTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <Card>
        <Hd>{isKo ? "고분자에는 '분자량'이 하나가 아니다" : "A polymer does not have one molar mass"}</Hd>
        <Eq>{"Mn = Σ NᵢMᵢ / Σ Nᵢ      Mw = Σ NᵢMᵢ² / Σ NᵢMᵢ      Mz = Σ NᵢMᵢ³ / Σ NᵢMᵢ²      Đ = Mw / Mn"}</Eq>
        <Note>
          {isKo
            ? "합성된 고분자 시료는 길이가 제각각인 사슬의 혼합물입니다. 그래서 평균을 말해야 하는데, 무엇으로 가중하느냐에 따라 값이 달라집니다. 수평균 Mn은 사슬을 '한 가닥씩' 세고, 중량평균 Mw는 '질량만큼' 셉니다. 무거운 사슬은 질량 기준에서 더 큰 발언권을 가지므로 항상 Mw ≥ Mn이고, 그 비 Đ(분산도, 예전 이름 PDI)가 분포의 폭을 알려줍니다. 모든 사슬이 같으면 Đ = 1입니다."
            : "A synthetic polymer sample is a mixture of chains of many lengths, so we must quote an average, and the answer depends on the weighting. The number average Mn counts each chain once; the weight average Mw counts each chain in proportion to its mass. Heavy chains get a louder voice in the mass-weighted count, so Mw ≥ Mn always, and the ratio Đ (dispersity, formerly PDI) measures the breadth of the distribution. If every chain is identical, Đ = 1."}
        </Note>
      </Card>
      <BlendLab isKo={isKo} />
      <FloryLab isKo={isKo} />
      <ZimmLab isKo={isKo} />
    </div>
  );
}

function BlendLab({ isKo }) {
  const [m2, setM2] = useState(100);        // kg/mol
  const [x2, setX2] = useState(0.5);        // number fraction of long chains
  const m1 = 10;
  const Mn = (1 - x2) * m1 + x2 * m2;
  const Mw = ((1 - x2) * m1 * m1 + x2 * m2 * m2) / Mn;
  const Mz = ((1 - x2) * m1 ** 3 + x2 * m2 ** 3) / ((1 - x2) * m1 * m1 + x2 * m2 * m2);
  const massFrac2 = x2 * m2 / Mn;
  const bar = (frac, label) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: C.textDim, marginBottom: 4 }}>{label}</div>
      <div style={{ display: "flex", height: 22, borderRadius: 6, overflow: "hidden", border: `1px solid ${C.border}` }}>
        <div style={{ width: `${(1 - frac) * 100}%`, background: C.sky }} />
        <div style={{ width: `${frac * 100}%`, background: C.accent }} />
      </div>
    </div>
  );
  return (
    <Card>
      <Hd>{isKo ? "두 사슬 실험실: 세는 법이 평균을 바꾼다" : "Two-chain lab: how you count changes the average"}</Hd>
      <Row>
        <Slider label={isKo ? "긴 사슬의 분자량" : "long-chain molar mass"} value={m2} min={10} max={500} step={5} onChange={setM2} unit=" kg/mol" width={180} />
        <Slider label={isKo ? "긴 사슬의 개수 분율" : "number fraction of long chains"} value={x2} min={0} max={1} step={0.01} onChange={setX2} width={180} fmt={v => v.toFixed(2)} />
        <Pill color={C.sky}>{isKo ? "짧은 사슬: 10 kg/mol" : "short chains: 10 kg/mol"}</Pill>
      </Row>
      {bar(x2, isKo ? `개수 기준 (긴 사슬 ${(x2 * 100).toFixed(0)}%)` : `by number (long chains ${(x2 * 100).toFixed(0)}%)`)}
      {bar(massFrac2, isKo ? `질량 기준 (긴 사슬 ${(massFrac2 * 100).toFixed(0)}%)` : `by mass (long chains ${(massFrac2 * 100).toFixed(0)}%)`)}
      <StatGrid>
        <Stat label="Mn" value={`${Mn.toFixed(1)} kg/mol`} color={C.sky} />
        <Stat label="Mw" value={`${Mw.toFixed(1)} kg/mol`} color={C.accent} />
        <Stat label="Mz" value={`${Mz.toFixed(1)} kg/mol`} color={C.purple} />
        <Stat label={isKo ? "분산도 Đ = Mw/Mn" : "dispersity Đ = Mw/Mn"} value={(Mw / Mn).toFixed(3)} color={C.amber} />
      </StatGrid>
      <Note>
        {isKo
          ? "기본값(10과 100 kg/mol을 같은 개수로)에서 Mn = 55.0, Mw = 91.8, Đ = 1.67입니다. 개수로는 반반이지만 질량으로는 긴 사슬이 91%를 차지하기 때문입니다. 긴 사슬 분율을 0.01로 낮춰 보십시오. 개수로는 1%뿐인데도 Mw는 크게 올라갑니다. 고분자의 점도와 강도는 대체로 Mw를, 삼투압 같은 총괄성은 Mn을 따르므로, 소량의 초고분자량 성분이 가공성을 좌우하는 일이 흔합니다."
          : "At the default (equal numbers of 10 and 100 kg/mol chains) Mn = 55.0, Mw = 91.8, Đ = 1.67: half the chains are long by number, but they carry 91% of the mass. Drop the long-chain fraction to 0.01 and watch Mw stay high even though only 1% of the chains are long. Viscosity and strength mostly follow Mw, while colligative properties such as osmotic pressure follow Mn, which is why a small ultra-high-mass tail often dominates processing behaviour."}
      </Note>
    </Card>
  );
}

function FloryLab({ isKo }) {
  const [p, setP] = useState(0.99);
  const M0 = 100;
  const Xn = 1 / (1 - p);
  const Mn = M0 * Xn, Mw = M0 * (1 + p) / (1 - p);
  const Mz = M0 * (1 + 4 * p + p * p) / ((1 + p) * (1 - p));
  const W = 700, Ht = 280, pad = 50;
  const iMax = 8 * Xn;
  const pts = [];
  let yMax = 0;
  for (let j = 0; j <= 300; j++) {
    const i = 1 + (iMax - 1) * j / 300;
    const w = i * (1 - p) * (1 - p) * Math.pow(p, i - 1);
    pts.push([i, w]); if (w > yMax) yMax = w;
  }
  const { X, Y } = plotScale(0, iMax, 0, yMax * 1.15, W, Ht, pad);
  const mark = (M, lb, color, dy) => (
    <g>
      <line x1={X(M / M0)} y1={Y(0)} x2={X(M / M0)} y2={pad + dy} stroke={color} strokeWidth={1.8} strokeDasharray="5 4" />
      <text x={X(M / M0) + 5} y={pad + dy + 10} fill={color} fontSize={11.5} fontFamily={mono}>{lb}</text>
    </g>
  );
  return (
    <Card>
      <Hd>{isKo ? "축합 중합의 분포: 전환율 99%로도 100량체" : "Step-growth distributions: 99% conversion gives only 100-mers"}</Hd>
      <Eq>{"wᵢ = i (1−p)² p^(i−1)      Xn = 1/(1−p)      Đ = 1 + p   (Schulz–Flory, Carothers)"}</Eq>
      <Row>
        <Slider label={isKo ? "반응 진행도 p" : "extent of reaction p"} value={p} min={0.9} max={0.999} step={0.001} onChange={setP} width={260} fmt={v => v.toFixed(3)} />
        <Pill color={C.textDim}>{isKo ? "단위체 M₀ = 100 g/mol" : "monomer M₀ = 100 g/mol"}</Pill>
      </Row>
      <StatGrid>
        <Stat label={isKo ? "수평균 중합도 Xn" : "number-average degree Xn"} value={Xn.toFixed(0)} color={C.textDim} />
        <Stat label="Mn" value={`${(Mn / 1000).toFixed(1)} kg/mol`} color={C.sky} />
        <Stat label="Mw" value={`${(Mw / 1000).toFixed(1)} kg/mol`} color={C.accent} />
        <Stat label="Mz" value={`${(Mz / 1000).toFixed(1)} kg/mol`} color={C.purple} />
        <Stat label="Đ = 1 + p" value={(Mw / Mn).toFixed(3)} color={C.amber} />
      </StatGrid>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <line x1={pad} y1={Y(0)} x2={W - pad} y2={Y(0)} stroke="#334155" />
        <path d={`${pathOf(pts, X, Y)} L ${X(iMax)} ${Y(0)} L ${X(1)} ${Y(0)} Z`} fill="rgba(163,230,53,0.10)" />
        <path d={pathOf(pts, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.4} />
        {mark(Mn, "Mn", C.sky, 44)}
        {mark(Mw, "Mw", C.accentSoft, 22)}
        {mark(Mz, "Mz", C.purple, 0)}
        <text x={W / 2} y={Ht - 12} fill={C.textDim} fontSize={11} textAnchor="middle">
          {isKo ? `분자량 M (가로축 끝 = ${(iMax * M0 / 1000).toFixed(0)} kg/mol)` : `molar mass M (axis end = ${(iMax * M0 / 1000).toFixed(0)} kg/mol)`}
        </text>
        <text x={14} y={pad - 12} fill={C.textDim} fontSize={11}>{isKo ? "무게 분율" : "weight fraction"}</text>
      </svg>
      <Note>
        {isKo
          ? "작용기 100개 중 99개가 반응해도(p = 0.99) 평균 사슬은 겨우 100량체입니다. 고분자량 나일론이나 폴리에스터를 얻으려면 p를 0.999 가까이 밀어붙여야 하고, 그래서 축합 중합 공정에서는 부산물 제거와 정확한 몰비가 승부처가 됩니다. 분포의 꼬리가 길어 Mn : Mw : Mz가 1 : 2 : 3으로 수렴하고 Đ는 2에 다가갑니다. 리빙 중합으로 만든 사슬이 Đ ≈ 1.05 수준인 것과 대비됩니다."
          : "Even when 99 of every 100 functional groups have reacted (p = 0.99), the average chain is only a 100-mer. High-mass nylon or polyester requires pushing p towards 0.999, which is why by-product removal and exact stoichiometry decide step-growth processes. The long tail makes Mn : Mw : Mz approach 1 : 2 : 3 and Đ approach 2, in contrast with living polymerisations that reach Đ ≈ 1.05."}
      </Note>
    </Card>
  );
}

function ZimmLab({ isKo }) {
  const [MwK, setMwK] = useState(100);     // kg/mol
  const [A2, setA2] = useState(4);         // 1e-4 cm^3 mol g^-2
  const invMw = 1 / (MwK * 1000);          // mol/g
  const cs = [1, 2.5, 4, 6, 8];            // mg/mL
  const y = c => invMw + 2 * (A2 * 1e-4) * (c * 1e-3);
  const yMaxV = Math.max(y(10), invMw) * 1.2;
  const yMinV = Math.min(0, y(10) * 1.2);
  const W = 640, Ht = 280, pad = 54;
  const { X, Y } = plotScale(0, 10, yMinV, yMaxV, W, Ht, pad);
  const quality = A2 > 0.2 ? (isKo ? "좋은 용매 (사슬이 부풂)" : "good solvent (coil swells)")
    : A2 < -0.2 ? (isKo ? "나쁜 용매 (사슬이 수축, 침전 직전)" : "poor solvent (coil collapses, near precipitation)")
    : (isKo ? "θ 용매 (이상 사슬)" : "θ solvent (ideal chain)");
  return (
    <Card>
      <Hd>{isKo ? "분자량 재기: 어떤 실험이 어떤 평균을 주는가" : "Measuring molar mass: which experiment gives which average"}</Hd>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12.5, minWidth: 560 }}>
          <thead>
            <tr style={{ color: C.textDim }}>
              {[isKo ? "측정법" : "method", isKo ? "원리" : "principle", isKo ? "얻는 평균" : "average obtained"].map(h => (
                <th key={h} style={{ padding: "6px 14px", borderBottom: `1px solid ${C.border}`, textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              [isKo ? "삼투압·말단기 분석" : "osmometry, end-group analysis", isKo ? "분자 '개수'를 센다" : "counts molecules", "Mn"],
              [isKo ? "정적 광산란" : "static light scattering", isKo ? "산란 세기 ∝ 농도 × 분자량" : "scattered intensity ∝ concentration × molar mass", "Mw"],
              [isKo ? "점도법" : "viscometry", "[η] = K·Mᵃ", "Mv"],
              [isKo ? "초원심 침강" : "sedimentation", isKo ? "침강 평형" : "sedimentation equilibrium", "Mz"],
              ["GPC / SEC", isKo ? "다공성 충전재: 큰 사슬이 먼저 용출" : "porous packing: large chains elute first", isKo ? "분포 전체" : "the whole distribution"],
            ].map((r, i) => (
              <tr key={i} style={{ color: C.text }}>
                <td style={{ padding: "5px 14px" }}>{r[0]}</td>
                <td style={{ padding: "5px 14px", color: C.textDim }}>{r[1]}</td>
                <td style={{ padding: "5px 14px", color: C.accent, fontFamily: mono }}>{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <HdSub>{isKo ? "광산란의 Debye–Zimm 그림" : "The Debye–Zimm plot of light scattering"}</HdSub>
      <Eq>{"Kc/ΔR ≈ 1/Mw + 2A₂c   (θ → 0)"}</Eq>
      <Row>
        <Slider label="Mw" value={MwK} min={20} max={500} step={5} onChange={setMwK} unit=" kg/mol" width={170} />
        <Slider label="A₂" value={A2} min={-2} max={10} step={0.5} onChange={setA2} unit="×10⁻⁴ cm³·mol/g²" width={170} fmt={v => v.toFixed(1)} />
        <Pill color={A2 > 0.2 ? C.ok : A2 < -0.2 ? C.err : C.amber}>{quality}</Pill>
      </Row>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <line x1={pad} y1={Y(0)} x2={W - pad} y2={Y(0)} stroke="#334155" />
        <line x1={pad} y1={pad - 8} x2={pad} y2={Y(0)} stroke="#334155" />
        <line x1={X(0)} y1={Y(y(0))} x2={X(10)} y2={Y(y(10))} stroke={C.accent} strokeWidth={2} strokeDasharray="6 4" />
        {cs.map(c => <rect key={c} x={X(c) - 5} y={Y(y(c)) - 5} width={10} height={10} fill={C.err} transform={`rotate(45 ${X(c)} ${Y(y(c))})`} />)}
        <circle cx={X(0)} cy={Y(invMw)} r={5} fill={C.amber} />
        <text x={X(0) + 10} y={Y(invMw) + 16} fill={C.amber} fontSize={11.5} fontFamily={mono}>1/Mw = {sci(invMw)} mol/g</text>
        {[0, 2, 4, 6, 8, 10].map(v => (
          <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>
        ))}
        <text x={W / 2} y={Ht - 10} fill={C.textDim} fontSize={11} textAnchor="middle">c [mg/mL]</text>
        <text x={14} y={pad - 14} fill={C.textDim} fontSize={11}>Kc/ΔR [mol/g]</text>
      </svg>
      <Note>
        {isKo
          ? "여러 농도에서 산란을 재어 c → 0으로 외삽하면 절편이 1/Mw, 기울기가 2A₂입니다. 5주차의 Debye 그림(절편에서 편극성, 기울기에서 쌍극자)과 같은 발상으로, 한 직선에서 두 물리량을 읽습니다. 제2 비리얼 계수 A₂는 사슬과 용매의 궁합입니다. 양수면 사슬이 용매를 좋아해 부풀고, 0이면 사슬끼리의 인력과 배제 부피가 정확히 상쇄되는 θ 조건이며, 음수면 사슬이 뭉쳐 침전으로 향합니다."
          : "Measure scattering at several concentrations, extrapolate to c → 0, and the intercept is 1/Mw while the slope is 2A₂. It is the same idea as Week 5's Debye plot (polarizability from the intercept, dipole from the slope): two quantities from one straight line. The second virial coefficient A₂ reports how well chain and solvent get along: positive means the coil swells, zero is the θ condition where attraction and excluded volume cancel exactly, and negative means the chains clump and head for precipitation."}
      </Note>
    </Card>
  );
}

// =============================================================
// 3) RANDOM COILS & ELASTICITY
// =============================================================
function CoilTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <RandomWalkLab isKo={isKo} />
      <GaussCard isKo={isKo} />
      <SizeCard isKo={isKo} />
      <ElasticLab isKo={isKo} />
      <ThermalCard isKo={isKo} />
    </div>
  );
}

function makeChain(N) {
  const pts = [[0, 0]];
  let x = 0, y = 0;
  for (let i = 0; i < N; i++) {
    const a = Math.random() * 2 * Math.PI;
    x += Math.cos(a); y += Math.sin(a);
    pts.push([x, y]);
  }
  return pts;
}
function chainStats(pts) {
  const n = pts.length;
  let cx = 0, cy = 0;
  for (const q of pts) { cx += q[0]; cy += q[1]; }
  cx /= n; cy /= n;
  let g = 0;
  for (const q of pts) g += (q[0] - cx) ** 2 + (q[1] - cy) ** 2;
  const e = pts[n - 1];
  return { R2: e[0] * e[0] + e[1] * e[1], Rg2: g / n, cx, cy };
}

function RandomWalkLab({ isKo }) {
  const [N, setN] = useState(500);
  const [chain, setChain] = useState(() => makeChain(500));
  const [ens, setEns] = useState(null);
  const cvRef = useRef(null);
  const st = chainStats(chain);

  const regen = n => { setChain(makeChain(n)); };
  const runEnsemble = () => {
    const M = 400;
    let sR = 0, sG = 0;
    for (let m = 0; m < M; m++) {
      const s = chainStats(makeChain(N));
      sR += s.R2; sG += s.Rg2;
    }
    setEns({ N, M, R2: sR / M, Rg2: sG / M });
  };

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const W = cv.width, Ht = cv.height;
    ctx.fillStyle = "#0d1117"; ctx.fillRect(0, 0, W, Ht);
    let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
    for (const q of chain) {
      if (q[0] < xmin) xmin = q[0]; if (q[0] > xmax) xmax = q[0];
      if (q[1] < ymin) ymin = q[1]; if (q[1] > ymax) ymax = q[1];
    }
    const span = Math.max(xmax - xmin, ymax - ymin, 1) * 1.15;
    const sc = Math.min(W, Ht) / span;
    const ox = W / 2 - sc * (xmin + xmax) / 2, oy = Ht / 2 - sc * (ymin + ymax) / 2;
    const PX = q => [ox + sc * q[0], oy + sc * q[1]];
    // chain
    ctx.lineWidth = chain.length > 1500 ? 0.7 : 1.2;
    ctx.strokeStyle = "rgba(163,230,53,0.75)";
    ctx.beginPath();
    chain.forEach((q, i) => { const [a, b] = PX(q); if (i === 0) ctx.moveTo(a, b); else ctx.lineTo(a, b); });
    ctx.stroke();
    // radius of gyration circle about the centre of mass
    const [gx, gy] = PX([st.cx, st.cy]);
    ctx.setLineDash([6, 5]); ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(gx, gy, Math.sqrt(st.Rg2) * sc, 0, 2 * Math.PI); ctx.stroke();
    ctx.setLineDash([]);
    // end-to-end vector
    const [sx, sy] = PX(chain[0]); const [ex, ey] = PX(chain[chain.length - 1]);
    ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.fillStyle = "#38bdf8"; ctx.beginPath(); ctx.arc(sx, sy, 4.5, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = "#f59e0b"; ctx.beginPath(); ctx.arc(ex, ey, 4.5, 0, 2 * Math.PI); ctx.fill();
  }, [chain]);

  return (
    <Card>
      <Hd>{isKo ? "랜덤 코일 실험실: 사슬은 펴지지 않는다" : "Random-coil lab: chains do not stretch out"}</Hd>
      <Note>
        {isKo
          ? "자유 연결 사슬(freely jointed chain)은 길이 l인 결합 N개가 서로 아무 각도로나 이어진 모형입니다. 결합 하나하나가 무작위 걸음의 한 발짝이므로, 사슬의 모양은 술 취한 사람의 발자국과 같습니다."
          : "A freely jointed chain is N bonds of length l joined at arbitrary angles. Each bond is one step of a random walk, so the shape of the chain is a drunkard's trail."}
      </Note>
      <Row>
        <Slider label={isKo ? "결합 수 N" : "bonds N"} value={N} min={20} max={3000} step={20} onChange={v => { setN(v); regen(v); setEns(null); }} width={220} />
        <button onClick={() => regen(N)} style={btnStyle(true)}>{isKo ? "새 사슬" : "new chain"}</button>
        <button onClick={runEnsemble} style={btnStyle()}>{isKo ? "사슬 400개 평균" : "average 400 chains"}</button>
      </Row>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <canvas ref={cvRef} width={420} height={420}
          style={{ borderRadius: 10, border: `1px solid ${C.border}`, width: "min(420px, 100%)" }} />
        <div style={{ flex: "1 1 280px", minWidth: 260 }}>
          <StatGrid min={150}>
            <Stat label={isKo ? "윤곽 길이 Rc = Nl" : "contour length Rc = Nl"} value={`${N} l`} color={C.textDim} />
            <Stat label={isKo ? "이 사슬의 끝–끝 거리" : "this chain's end-to-end R"} value={`${Math.sqrt(st.R2).toFixed(1)} l`} color={C.amber} />
            <Stat label="R_rms = N^½ l" value={`${Math.sqrt(N).toFixed(1)} l`} color={C.accent} />
            <Stat label={isKo ? "이 사슬의 Rg" : "this chain's Rg"} value={`${Math.sqrt(st.Rg2).toFixed(1)} l`} color={C.cyan} />
            <Stat label="Rg = (N/6)^½ l" value={`${Math.sqrt(N / 6).toFixed(1)} l`} color={C.accent} />
          </StatGrid>
          {ens && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 12.5, lineHeight: 1.8 }}>
              <div style={{ color: C.textDim }}>{isKo ? `앙상블 평균 (N = ${ens.N}, 사슬 ${ens.M}개)` : `ensemble average (N = ${ens.N}, ${ens.M} chains)`}</div>
              <div style={{ fontFamily: mono, color: C.accentSoft }}>⟨R²⟩ / Nl² = {(ens.R2 / ens.N).toFixed(3)}</div>
              <div style={{ fontFamily: mono, color: C.accentSoft }}>⟨Rg²⟩ / (Nl²/6) = {(ens.Rg2 / (ens.N / 6)).toFixed(3)}</div>
            </div>
          )}
          <Note>
            {isKo
              ? "주황 선이 끝–끝 벡터 R, 청록 점선 원이 질량중심 주위의 회전 반지름 Rg입니다. '새 사슬'을 여러 번 눌러 보면 R은 사슬마다 크게 요동치지만, 400개를 평균하면 ⟨R²⟩ = Nl²과 ⟨Rg²⟩ = Nl²/6에 수렴합니다."
              : "The amber line is the end-to-end vector R; the dashed cyan circle is the radius of gyration Rg about the centre of mass. Press 'new chain' a few times: R fluctuates wildly from chain to chain, yet averaging 400 chains converges on ⟨R²⟩ = Nl² and ⟨Rg²⟩ = Nl²/6."}
          </Note>
        </div>
      </div>
      <Eq>{"⟨R²⟩ = ⟨|Σ aₖ|²⟩ = Σₖ Σₗ ⟨aₖ·aₗ⟩ = N l²   (⟨aₖ·aₗ⟩ = l² δₖₗ)      Rg² = (1/2N²) Σᵢⱼ ⟨|rᵢ − rⱼ|²⟩ = (l²/6)(N − 1/N) ≈ N l²/6"}</Eq>
      <Note>
        {isKo
          ? "핵심은 교차항이 모두 사라진다는 것입니다. 서로 다른 결합은 방향이 무관하므로 ⟨aₖ·aₗ⟩ = 0이고, 남는 것은 N개의 l²뿐입니다. 그래서 크기가 N이 아니라 √N에 비례합니다. 이 유도는 결합이 몇 차원에서 움직이는지와 무관하므로, Rg² = Nl²/6은 1차원·2차원·3차원 사슬 모두에서 성립합니다(이 화면의 사슬은 2차원입니다)."
          : "The key is that every cross term vanishes: different bonds point in unrelated directions, so ⟨aₖ·aₗ⟩ = 0 and only N copies of l² survive. That is why the size grows as √N rather than N. Nothing in the derivation depends on the dimension the bonds move in, so Rg² = Nl²/6 holds for chains in one, two, and three dimensions alike (the chain on this screen is two-dimensional)."}
      </Note>
    </Card>
  );
}

function GaussCard({ isKo }) {
  const [N, setN] = useState(40);
  const W = 680, Ht = 270, pad = 50;
  const bars = [];
  // exact binomial: P(n) = C(N, (N+n)/2) / 2^N, n = -N, -N+2, ..., N
  let cur = Math.pow(0.5, N);
  for (let k = 0; k <= N; k++) {
    bars.push([2 * k - N, cur]);
    cur = cur * (N - k) / (k + 1);
  }
  const xr = Math.min(N, Math.ceil(4 * Math.sqrt(N)));
  const pk = Math.sqrt(2 / (Math.PI * N));
  const { X, Y } = plotScale(-xr, xr, 0, pk * 1.18, W, Ht, pad);
  const gpts = [];
  for (let j = 0; j <= 240; j++) {
    const n = -xr + 2 * xr * j / 240;
    gpts.push([n, pk * Math.exp(-n * n / (2 * N))]);
  }
  const bw = Math.max(2, (X(2) - X(0)) * 0.7);
  return (
    <Card>
      <Hd>{isKo ? "끝–끝 거리의 분포: 이항 분포에서 Gaussian으로" : "End-to-end distribution: from binomial to Gaussian"}</Hd>
      <Eq>{"P = W/2ᴺ = N! / {[½(N+n)]! [½(N−n)]! 2ᴺ}   →   P ≈ (2/πN)^½ e^(−n²/2N)   (Stirling)"}</Eq>
      <Row>
        <Slider label={isKo ? "결합 수 N" : "bonds N"} value={N} min={6} max={200} step={2} onChange={setN} width={240} />
        <Pill color={C.accent}>{isKo ? "막대: 정확한 이항 분포" : "bars: exact binomial"}</Pill>
        <Pill color={C.amber}>{isKo ? "곡선: Gaussian 근사" : "curve: Gaussian approximation"}</Pill>
      </Row>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <line x1={pad} y1={Y(0)} x2={W - pad} y2={Y(0)} stroke="#334155" />
        {bars.filter(b => Math.abs(b[0]) <= xr).map(b => (
          <rect key={b[0]} x={X(b[0]) - bw / 2} y={Y(b[1])} width={bw} height={Math.max(0, Y(0) - Y(b[1]))} fill="rgba(163,230,53,0.55)" />
        ))}
        <path d={pathOf(gpts, X, Y)} fill="none" stroke={C.amber} strokeWidth={2.2} />
        {[-xr, -Math.round(xr / 2), 0, Math.round(xr / 2), xr].map(v => (
          <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>
        ))}
        <text x={W / 2} y={Ht - 10} fill={C.textDim} fontSize={11} textAnchor="middle">
          {isKo ? "n = N_R − N_L (끝–끝 거리 = nl)" : "n = N_R − N_L (end-to-end distance = nl)"}
        </text>
      </svg>
      <Note>
        {isKo
          ? "1차원 사슬에서 오른쪽 결합이 N_R개, 왼쪽이 N_L개이면 끝–끝 거리는 (N_R − N_L)l = nl이고, 그런 배열의 수는 이항 계수입니다. N을 6에서 200으로 올리면 막대가 곡선에 빠르게 달라붙습니다. 가장 흔한 배열은 n = 0, 즉 끝이 제자리로 돌아온 상태이고, 완전히 펴진 n = N은 경우의 수가 단 하나라 확률이 2⁻ᴺ입니다. 사슬을 당기는 일이 어려운 이유가 여기서 이미 보입니다. 3차원에서는 같은 Gaussian에 껍질 인자 4πr²이 곱해져 f(r) = 4π(a/π^½)³ r² e^(−a²r²), a = (3/2Nl²)^½이 됩니다. 4주차 Maxwell 속력 분포와 수학적으로 같은 모양입니다."
          : "In a one-dimensional chain with N_R bonds to the right and N_L to the left, the end-to-end distance is (N_R − N_L)l = nl, and the number of such arrangements is a binomial coefficient. Raise N from 6 to 200 and the bars hug the curve almost at once. The commonest arrangement is n = 0 (the end returns to the start), while the fully extended n = N can be built in exactly one way, with probability 2⁻ᴺ: the reason pulling a chain is hard is already visible. In three dimensions the same Gaussian picks up the shell factor 4πr², giving f(r) = 4π(a/π^½)³ r² e^(−a²r²) with a = (3/2Nl²)^½, mathematically the same shape as Week 4's Maxwell speed distribution."}
      </Note>
    </Card>
  );
}

function SizeCard({ isKo }) {
  const [logN, setLogN] = useState(Math.log10(4000));
  const [l, setL] = useState(0.154);
  const [tetra, setTetra] = useState(true);
  const N = Math.round(Math.pow(10, logN));
  const F = tetra ? Math.SQRT2 : 1;
  const Rc = N * l, Rrms = Math.sqrt(N) * l * F, Rg = Math.sqrt(N / 6) * l * F;
  return (
    <Card>
      <Hd>{isKo ? "크기의 세 가지 척도, 그리고 결합각의 효과" : "Three measures of size, and the effect of bond angles"}</Hd>
      <Eq>{"Rc = N l      R_rms = N^½ l F      Rg = (N/6)^½ l F      F = [(1 − cos θ)/(1 + cos θ)]^½"}</Eq>
      <Row>
        <Slider label="log₁₀ N" value={logN} min={2} max={5} step={0.05} onChange={setLogN} width={170} fmt={v => `N = ${Math.round(Math.pow(10, v)).toLocaleString()}`} />
        <Slider label={isKo ? "결합 길이 l" : "bond length l"} value={l} min={0.1} max={0.6} step={0.002} onChange={setL} unit=" nm" width={150} fmt={v => v.toFixed(3)} />
        <button onClick={() => setTetra(v => !v)} style={btnStyle(tetra)}>
          {tetra ? (isKo ? "사면체 결합각 109.5° (F = √2)" : "tetrahedral angle 109.5° (F = √2)") : (isKo ? "자유 연결 (F = 1)" : "freely jointed (F = 1)")}
        </button>
      </Row>
      <StatGrid>
        <Stat label={isKo ? "윤곽 길이 Rc" : "contour length Rc"} value={`${Rc.toFixed(0)} nm`} color={C.textDim} />
        <Stat label="R_rms" value={`${Rrms.toFixed(1)} nm`} color={C.amber} />
        <Stat label="Rg" value={`${Rg.toFixed(2)} nm`} color={C.cyan} />
        <Stat label="Rc / R_rms" value={(Rc / Rrms).toFixed(0)} color={C.accent} />
      </StatGrid>
      <Note>
        {isKo
          ? "기본값은 폴리에틸렌입니다. C–C 결합 4,000개(l = 0.154 nm)를 일직선으로 펴면 616 nm이지만, 용액 속 코일의 R_rms는 13.8 nm, Rg는 5.6 nm에 불과합니다. 45배나 접혀 있는 셈입니다. 실제 사슬은 결합각이 고정되어 있어 완전히 자유롭지 않습니다. 결합각 θ = 109.5°(cos θ = −1/3)를 유지한 채 결합 축 둘레로만 자유롭게 도는 사슬은 F = √2만큼 부풀어 R_rms = (2N)^½ l, Rg = (N/3)^½ l이 됩니다. 코일의 크기는 여전히 √N에 비례하고, 비례 상수만 달라집니다."
          : "The default is polyethylene. 4,000 C–C bonds (l = 0.154 nm) laid end to end span 616 nm, but the coil in solution has R_rms of only 13.8 nm and Rg of 5.6 nm, folded 45-fold. Real chains are not perfectly free, because bond angles are fixed. A chain that keeps θ = 109.5° (cos θ = −1/3) and rotates freely only about each bond axis swells by F = √2, giving R_rms = (2N)^½ l and Rg = (N/3)^½ l. The coil still scales as √N; only the prefactor changes."}
      </Note>
    </Card>
  );
}

function ElasticLab({ isKo }) {
  const [nu, setNu] = useState(0.5);
  const [T, setT] = useState(298);
  const [l, setL] = useState(0.5);
  const dS = x => -0.5 * Math.log(Math.pow(1 + x, 1 + x) * Math.pow(1 - x, 1 - x));
  const fr = x => 0.5 * Math.log((1 + x) / (1 - x));
  const unitF = KB * T / (l * 1e-9) * 1e12;         // kT/l in pN
  const Fpn = fr(nu) * unitF, Fhooke = nu * unitF;
  const W = 420, Ht = 260, pad = 46;
  const P1 = plotScale(-1, 1, -0.75, 0.05, W, Ht, pad);
  const P2 = plotScale(-1, 1, -2.4, 2.4, W, Ht, pad);
  const sPts = [], fPts = [];
  for (let j = 0; j <= 200; j++) {
    const x = -0.98 + 1.96 * j / 200;
    sPts.push([x, Math.max(-0.75, dS(x))]);
    fPts.push([x, Math.max(-2.4, Math.min(2.4, fr(x)))]);
  }
  return (
    <Card>
      <Hd>{isKo ? "엔트로피 용수철: 고무는 왜 되돌아오는가" : "The entropic spring: why rubber snaps back"}</Hd>
      <Eq>{"ΔS = −½ kN ln[(1+ν)^(1+ν) (1−ν)^(1−ν)]      F = (kT/2l) ln[(1+ν)/(1−ν)] ≈ νkT/l      (ν = n/N)"}</Eq>
      <Row>
        <Slider label={isKo ? "신장 ν = n/N" : "extension ν = n/N"} value={nu} min={-0.95} max={0.95} step={0.01} onChange={setNu} width={200} fmt={v => v.toFixed(2)} />
        <Slider label="T" value={T} min={200} max={450} step={2} onChange={setT} unit=" K" width={140} />
        <Slider label={isKo ? "마디 길이 l" : "segment length l"} value={l} min={0.2} max={1.0} step={0.05} onChange={setL} unit=" nm" width={130} fmt={v => v.toFixed(2)} />
      </Row>
      <StatGrid>
        <Stat label="ΔS / Nk" value={dS(nu).toFixed(4)} color={C.cyan} />
        <Stat label={isKo ? "복원력 F" : "restoring force F"} value={`${Fpn.toFixed(2)} pN`} color={C.accent} />
        <Stat label={isKo ? "Hooke 근사 νkT/l" : "Hooke estimate νkT/l"} value={`${Fhooke.toFixed(2)} pN`} color={C.amber} />
        <Stat label={isKo ? "Hooke 법칙과의 차이" : "departure from Hooke"} value={`${Math.abs(nu) < 1e-6 ? "0.0" : ((Fpn / Fhooke - 1) * 100).toFixed(1)} %`} color={C.textDim} />
      </StatGrid>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <line x1={pad} y1={P1.Y(0)} x2={W - pad} y2={P1.Y(0)} stroke="#334155" />
          <path d={pathOf(sPts, P1.X, P1.Y)} fill="none" stroke={C.cyan} strokeWidth={2.4} />
          <circle cx={P1.X(nu)} cy={P1.Y(dS(nu))} r={5} fill={C.amber} />
          {[-1, -0.5, 0, 0.5, 1].map(v => <text key={v} x={P1.X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
          <text x={W / 2} y={pad - 14} fill={C.cyan} fontSize={12} fontWeight={700} textAnchor="middle">ΔS / Nk</text>
          <text x={W / 2} y={Ht - 8} fill={C.textDim} fontSize={11} textAnchor="middle">ν = n/N</text>
        </svg>
        <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <line x1={pad} y1={P2.Y(0)} x2={W - pad} y2={P2.Y(0)} stroke="#334155" />
          <line x1={P2.X(-1)} y1={P2.Y(-1)} x2={P2.X(1)} y2={P2.Y(1)} stroke={C.amber} strokeWidth={1.6} strokeDasharray="6 4" />
          <path d={pathOf(fPts, P2.X, P2.Y)} fill="none" stroke={C.accent} strokeWidth={2.4} />
          <circle cx={P2.X(nu)} cy={P2.Y(Math.max(-2.4, Math.min(2.4, fr(nu))))} r={5} fill={C.amber} />
          {[-1, -0.5, 0, 0.5, 1].map(v => <text key={v} x={P2.X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
          <text x={W / 2} y={pad - 14} fill={C.accent} fontSize={12} fontWeight={700} textAnchor="middle">
            F·l / kT {isKo ? "(점선: Hooke)" : "(dashed: Hooke)"}
          </text>
          <text x={W / 2} y={Ht - 8} fill={C.textDim} fontSize={11} textAnchor="middle">ν = n/N</text>
        </svg>
      </div>
      <Note>
        {isKo
          ? "사슬을 당기면 가능한 배좌의 수가 줄어 엔트로피가 내려갑니다(ΔS < 0). 이상 사슬에서는 내부 에너지가 신장과 무관하므로 복원력은 F = −T(∂S/∂x), 순전히 엔트로피에서 나옵니다. 그래서 두 가지 특이한 성질이 생깁니다. 첫째, 힘이 T에 비례합니다. T 슬라이더를 올리면 같은 신장에서 힘이 커지는데, 추를 매단 고무줄을 데우면 오히려 줄어드는 현상이 이것입니다. 금속 용수철과는 정반대입니다. 둘째, 작은 신장에서는 Hooke 법칙을 따르지만 ν → 1에서 힘이 발산합니다. 다 펴진 사슬에는 더 줄어들 배좌가 없기 때문입니다. 힘의 크기가 피코뉴턴이라는 점도 눈여겨보십시오. 광집게와 원자힘 현미경으로 DNA 한 가닥을 당길 때 재는 힘이 바로 이 영역입니다."
          : "Pulling a chain reduces the number of available conformations, so the entropy falls (ΔS < 0). For an ideal chain the internal energy does not depend on extension, so the restoring force is F = −T(∂S/∂x), purely entropic. Two unusual properties follow. First, the force is proportional to T: raise the T slider and the force at fixed extension grows, which is why a loaded rubber band contracts when warmed, the opposite of a metal spring. Second, the chain obeys Hooke's law at small extension but the force diverges as ν → 1, because a fully stretched chain has no conformations left to lose. Note the piconewton scale: this is exactly the force range measured when a single DNA molecule is pulled with optical tweezers or an atomic force microscope."}
      </Note>
    </Card>
  );
}

function ThermalCard({ isKo }) {
  const [x, setX] = useState(1.15);            // T / Tg
  const W = 680, Ht = 250, pad = 52;
  const { X, Y } = plotScale(0.6, 1.9, 0, 4.6, W, Ht, pad);
  const sg = (v, v0, w) => 1 / (1 + Math.exp((v - v0) / w));
  const modulus = v => 0.5 + 3.3 * sg(v, 1.0, 0.035) + 0.9 * sg(v, 1.62, 0.05) - 0.25 * (v - 0.6);
  const pts = [];
  for (let j = 0; j <= 260; j++) { const v = 0.6 + 1.3 * j / 260; pts.push([v, Math.max(0.05, modulus(v))]); }
  const regime = x < 0.97 ? (isKo ? "유리 상태: 단단하고 잘 깨짐" : "glassy: hard and brittle")
    : x < 1.06 ? (isKo ? "유리 전이: 사슬 마디가 움직이기 시작" : "glass transition: segments start to move")
    : x < 1.55 ? (isKo ? "고무 상태: 부드럽고 탄성" : "rubbery: soft and elastic")
    : (isKo ? "점성 흐름: 사슬 전체가 미끄러짐" : "viscous flow: whole chains slide");
  return (
    <Card>
      <Hd>{isKo ? "열적·전기적 성질: 유리 전이" : "Thermal and electrical properties: the glass transition"}</Hd>
      <Row>
        <Slider label="T / Tg" value={x} min={0.6} max={1.9} step={0.01} onChange={setX} width={260} fmt={v => v.toFixed(2)} />
        <Pill color={x < 0.97 ? C.sky : x < 1.55 ? C.accent : C.amber}>{regime}</Pill>
      </Row>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <path d={pathOf(pts, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.6} />
        <line x1={X(1)} y1={pad - 8} x2={X(1)} y2={Y(0)} stroke="#475569" strokeDasharray="4 4" />
        <text x={X(1) + 6} y={pad + 4} fill={C.textDim} fontSize={11}>Tg</text>
        <line x1={X(x)} y1={Y(0)} x2={X(x)} y2={Y(Math.max(0.05, modulus(x)))} stroke={C.amber} strokeWidth={1.8} strokeDasharray="4 3" />
        <circle cx={X(x)} cy={Y(Math.max(0.05, modulus(x)))} r={5} fill={C.amber} />
        {[[0.78, 4.25, isKo ? "유리" : "glassy"], [1.3, 1.5, isKo ? "고무 평탄역" : "rubbery plateau"], [1.76, 0.75, isKo ? "흐름" : "flow"]].map((r, i) => (
          <text key={i} x={X(r[0])} y={Y(r[1])} fill={C.textDim} fontSize={11} textAnchor="middle">{r[2]}</text>
        ))}
        <text x={W / 2} y={Ht - 12} fill={C.textDim} fontSize={11} textAnchor="middle">{isKo ? "온도 →" : "temperature →"}</text>
        <text x={14} y={pad - 14} fill={C.textDim} fontSize={11}>{isKo ? "log(탄성률), 개략도" : "log(modulus), schematic"}</text>
      </svg>
      <Note>
        {isKo
          ? "유리 전이 온도 Tg 아래에서는 사슬 마디가 얼어붙어 고분자가 유리처럼 단단하고, Tg를 넘으면 마디가 움직일 수 있게 되어 탄성률이 몇 자릿수 떨어지며 고무처럼 됩니다. 비부피–온도 그림의 기울기가 꺾이는 점이 Tg입니다. 같은 고분자라도 쓰임새는 실온이 Tg의 어느 쪽에 있느냐로 갈립니다. 폴리스타이렌(Tg 약 100 ℃)은 실온에서 유리이고, 천연고무(Tg 약 −70 ℃)는 실온에서 고무입니다. 앞 카드의 엔트로피 탄성은 이 고무 평탄역에서 작동합니다. 전기적 성질도 사슬 구조에서 나옵니다. 단일·이중 결합이 번갈아 놓인 공액 사슬(폴리아세틸렌)을 부분 산화시키면 생긴 전하가 사슬을 따라 움직일 수 있어 전기가 통합니다. 2000년 노벨 화학상의 주제이고, OLED 디스플레이로 이어집니다."
          : "Below the glass transition temperature Tg the chain segments are frozen and the polymer is hard like glass; above Tg the segments can move, the modulus drops by orders of magnitude, and the material turns rubbery. Tg is the kink in a plot of specific volume against temperature. What a polymer is used for depends on which side of Tg room temperature lies: polystyrene (Tg about 100 ℃) is a glass at room temperature, natural rubber (Tg about −70 ℃) is a rubber. The entropic elasticity of the previous card operates on this rubbery plateau. Electrical properties also come from chain structure: partially oxidising a conjugated chain of alternating single and double bonds (polyacetylene) creates charges that can move along the chain, so it conducts. That was the subject of the 2000 Nobel Prize in Chemistry and leads to OLED displays."}
      </Note>
    </Card>
  );
}

// =============================================================
// 4) COLLOIDS & SELF-ASSEMBLY
// =============================================================
function AssemblyTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <ColloidCard isKo={isKo} />
      <DlvoLab isKo={isKo} />
      <HydrophobicCard isKo={isKo} />
      <MicelleLab isKo={isKo} />
    </div>
  );
}

function ColloidCard({ isKo }) {
  const rows = [
    [isKo ? "졸 (sol)" : "sol", isKo ? "고체" : "solid", isKo ? "액체" : "liquid", isKo ? "페인트, 잉크, 금 나노입자 분산액" : "paint, ink, gold nanoparticle dispersions"],
    [isKo ? "에멀션" : "emulsion", isKo ? "액체" : "liquid", isKo ? "액체" : "liquid", isKo ? "우유, 마요네즈" : "milk, mayonnaise"],
    [isKo ? "폼 (foam)" : "foam", isKo ? "기체" : "gas", isKo ? "액체" : "liquid", isKo ? "맥주 거품, 휘핑크림" : "beer froth, whipped cream"],
    [isKo ? "에어로졸" : "aerosol", isKo ? "액체·고체" : "liquid or solid", isKo ? "기체" : "gas", isKo ? "안개, 연기, 미세먼지" : "fog, smoke, fine dust"],
    [isKo ? "젤 (gel)" : "gel", isKo ? "액체" : "liquid", isKo ? "고체" : "solid", isKo ? "젤라틴, 실리카젤" : "gelatin, silica gel"],
    [isKo ? "고체 졸" : "solid sol", isKo ? "고체" : "solid", isKo ? "고체" : "solid", isKo ? "루비 유리(유리 속 금), 합금" : "ruby glass (gold in glass), alloys"],
  ];
  return (
    <Card>
      <Hd>{isKo ? "콜로이드: 용액과 덩어리 사이, 1 nm에서 1 μm" : "Colloids: between solution and bulk, 1 nm to 1 μm"}</Hd>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12.5, minWidth: 560 }}>
          <thead>
            <tr style={{ color: C.textDim }}>
              {[isKo ? "이름" : "name", isKo ? "분산상" : "dispersed phase", isKo ? "분산매" : "medium", isKo ? "예" : "examples"].map(h => (
                <th key={h} style={{ padding: "6px 14px", borderBottom: `1px solid ${C.border}`, textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ color: C.text }}>
                <td style={{ padding: "5px 14px", color: C.accent, fontWeight: 700 }}>{r[0]}</td>
                <td style={{ padding: "5px 14px" }}>{r[1]}</td>
                <td style={{ padding: "5px 14px" }}>{r[2]}</td>
                <td style={{ padding: "5px 14px", color: C.textDim }}>{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note>
        {isKo
          ? "콜로이드 입자는 분자보다 훨씬 크지만 가라앉을 만큼 크지는 않습니다. 부피에 비해 표면이 엄청나게 넓어서 5주차의 표면·계면 물리가 성질을 지배하고, 입자끼리 붙어 버리려는 van der Waals 인력을 무엇으로 막느냐가 안정성의 전부입니다. 수용액에서는 표면 전하와 그 주위에 모인 반대 이온의 구름, 즉 전기 이중층이 그 방패입니다."
          : "Colloidal particles are far larger than molecules but not large enough to settle. Their surface is enormous relative to their volume, so the surface physics of Week 5 dominates, and the whole question of stability is what stops van der Waals attraction from gluing the particles together. In water the shield is surface charge together with its cloud of counter-ions: the electrical double layer."}
      </Note>
    </Card>
  );
}

function dlvoParams(cM, phi0mV, AH20, aNm, z) {
  const n0 = 1000 * NAV * cM, kT = KB * 298.15;
  const kap = Math.sqrt(2 * z * z * QE * QE * n0 / (EPSW * kT));
  const g = Math.tanh(z * QE * phi0mV * 1e-3 / (4 * kT));
  const a = aNm * 1e-9, AH = AH20 * 1e-20;
  const Bel = 64 * Math.PI * n0 * a * g * g / (kap * kap);     // in units of kT
  const Avdw = AH * a / (12 * kT);                              // kT·m
  const kc = 384 * Math.PI * EPSW * kT * kT * g * g / (Math.E * z * z * QE * QE * AH);
  const ccc = kc * kc * EPSW * kT / (2 * z * z * QE * QE) / (1000 * NAV);
  return { kap, g, Bel, Avdw, ccc };
}

function DlvoLab({ isKo }) {
  const [logc, setLogc] = useState(-3);
  const [phi0, setPhi0] = useState(30);
  const [AH, setAH] = useState(2.0);
  const [aNm, setANm] = useState(100);
  const [z, setZ] = useState(1);
  const cM = Math.pow(10, logc);
  const { kap, Bel, Avdw, ccc } = dlvoParams(cM, phi0, AH, aNm, z);
  const Uv = h => -Avdw / h, Ue = h => Bel * Math.exp(-kap * h);
  const W = 720, Ht = 320, pad = 54;
  const lx0 = Math.log10(0.1e-9), lx1 = Math.log10(100e-9);
  let Umax = -1e300, hmax = 0;
  const tot = [], vd = [], el = [];
  for (let j = 0; j <= 400; j++) {
    const lh = lx0 + (lx1 - lx0) * j / 400, h = Math.pow(10, lh);
    const u = Uv(h) + Ue(h);
    if (u > Umax) { Umax = u; hmax = h; }
    tot.push([lh, u]); vd.push([lh, Uv(h)]); el.push([lh, Ue(h)]);
  }
  const yTop = Math.max(40, Math.min(400, Umax * 1.35)), yBot = -0.6 * yTop;
  const { X, Y } = plotScale(lx0, lx1, yBot, yTop, W, Ht, pad);
  const clip = arr => arr.map(([a, b]) => [a, Math.max(yBot * 3, Math.min(yTop * 3, b))]);
  const yStep = yTop <= 60 ? 20 : yTop <= 160 ? 50 : 100;
  const yTicks = [];
  for (let v = Math.ceil(yBot / yStep) * yStep; v <= yTop; v += yStep) yTicks.push(v);
  const barrier = Umax > 0;
  const verdict = !barrier ? (isKo ? "장벽 없음: 급속 응집" : "no barrier: rapid coagulation")
    : Umax > 15 ? (isKo ? "안정한 분산" : "stable dispersion")
    : (isKo ? "낮은 장벽: 느린 응집" : "low barrier: slow coagulation");
  const presets = [
    { lb: isKo ? "강물 (1 mM)" : "river water (1 mM)", v: -3 },
    { lb: isKo ? "생리식염수 (0.15 M)" : "saline (0.15 M)", v: Math.log10(0.15) },
    { lb: isKo ? "바닷물 (0.6 M)" : "seawater (0.6 M)", v: Math.log10(0.6) },
  ];
  return (
    <Card>
      <Hd>{isKo ? "DLVO 실험실: 소금 한 줌이 콜로이드를 무너뜨린다" : "DLVO lab: a pinch of salt topples a colloid"}</Hd>
      <Eq>{"U = −A_H a/12h + (64π k_BT n₀ a γ²/κ²) e^(−κh)      κ = (2z²e²n₀/ε k_BT)^½      γ = tanh(zeφ₀/4k_BT)"}</Eq>
      <Row>
        <Slider label={isKo ? "염 농도 log₁₀(c/M)" : "salt log₁₀(c/M)"} value={logc} min={-4} max={0} step={0.02} onChange={setLogc} width={190} fmt={v => `${(Math.pow(10, v) * 1e3).toPrecision(3)} mM`} />
        <Slider label="φ₀" value={phi0} min={10} max={100} step={1} onChange={setPhi0} unit=" mV" width={130} />
        <Slider label="A_H" value={AH} min={0.5} max={10} step={0.1} onChange={setAH} unit="×10⁻²⁰ J" width={130} fmt={v => v.toFixed(1)} />
        <Slider label={isKo ? "반지름 a" : "radius a"} value={aNm} min={20} max={500} step={10} onChange={setANm} unit=" nm" width={130} />
      </Row>
      <Row>
        <span style={{ fontSize: 12.5, color: C.textDim }}>{isKo ? "이온 전하수 z" : "ion valence z"}</span>
        {[1, 2, 3].map(v => (
          <button key={v} onClick={() => setZ(v)} style={{ ...btnStyle(z === v), padding: "5px 12px", fontSize: 12 }}>{v}:{v}</button>
        ))}
        {presets.map(pz => (
          <button key={pz.lb} onClick={() => setLogc(pz.v)} style={{ ...btnStyle(), padding: "5px 11px", fontSize: 12 }}>{pz.lb}</button>
        ))}
      </Row>
      <StatGrid>
        <Stat label={isKo ? "Debye 길이 κ⁻¹" : "Debye length κ⁻¹"} value={`${(1e9 / kap).toFixed(2)} nm`} color={C.cyan} />
        <Stat label={isKo ? "에너지 장벽" : "energy barrier"} value={barrier ? `${Umax.toFixed(1)} kT` : (isKo ? "없음" : "none")} color={C.accent} />
        <Stat label={isKo ? "장벽 위치 h" : "barrier position h"} value={barrier ? `${(hmax * 1e9).toFixed(2)} nm` : "—"} color={C.textDim} />
        <Stat label={isKo ? "임계 응집 농도" : "critical coagulation conc."} value={ccc >= 1 ? `${ccc.toFixed(2)} M` : `${(ccc * 1e3).toFixed(1)} mM`} color={C.amber} />
        <Stat label={isKo ? "판정" : "verdict"} value={verdict} color={!barrier ? C.err : Umax > 15 ? C.ok : C.amber} />
      </StatGrid>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <defs>
          <clipPath id="wk06DlvoClip"><rect x={pad} y={pad - 6} width={W - 2 * pad} height={Ht - 2 * pad + 12} /></clipPath>
        </defs>
        {yTicks.map(v => (
          <g key={v}>
            <line x1={pad} y1={Y(v)} x2={W - pad} y2={Y(v)} stroke={v === 0 ? "#475569" : "#1e293b"} />
            <text x={pad - 8} y={Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>
          </g>
        ))}
        <g clipPath="url(#wk06DlvoClip)">
          <path d={pathOf(clip(el), X, Y)} fill="none" stroke={C.sky} strokeWidth={1.6} strokeDasharray="6 4" />
          <path d={pathOf(clip(vd), X, Y)} fill="none" stroke={C.pink} strokeWidth={1.6} strokeDasharray="6 4" />
          <path d={pathOf(clip(tot), X, Y)} fill="none" stroke={C.accent} strokeWidth={2.8} />
        </g>
        {barrier && <circle cx={X(Math.log10(hmax))} cy={Y(Math.min(yTop, Umax))} r={5} fill={C.amber} />}
        {[[-10, "0.1"], [-9, "1"], [-8, "10"], [-7, "100"]].map(([v, lb]) => (
          <text key={lb} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{lb}</text>
        ))}
        <text x={W / 2} y={Ht - 10} fill={C.textDim} fontSize={11} textAnchor="middle">{isKo ? "표면 사이 거리 h [nm] (로그 눈금)" : "surface separation h [nm] (log scale)"}</text>
        <text x={14} y={pad - 14} fill={C.textDim} fontSize={11}>U / kT</text>
        <text x={W - pad} y={pad + 2} fill={C.sky} fontSize={11} textAnchor="end">{isKo ? "이중층 반발" : "double-layer repulsion"}</text>
        <text x={W - pad} y={pad + 18} fill={C.pink} fontSize={11} textAnchor="end">{isKo ? "van der Waals 인력" : "van der Waals attraction"}</text>
        <text x={W - pad} y={pad + 34} fill={C.accent} fontSize={11} textAnchor="end">{isKo ? "합" : "total"}</text>
      </svg>
      <Note>
        {isKo
          ? "인력은 5주차의 분산력을 입자 전체에 대해 더한 것(Hamaker 상수 A_H)이고, 반발은 겹치는 이온 구름의 삼투압입니다. 염 농도를 올려 보십시오. 반발 항의 세기는 그대로인데 닿는 거리 κ⁻¹만 9.6 nm(1 mM)에서 0.39 nm(0.6 M)로 줄어듭니다. 이온이 표면 전하를 가려 버리기 때문입니다. 기본값에서 장벽은 1 mM일 때 53 kT로 넉넉하지만 임계 응집 농도 62 mM을 넘으면 사라지고, 열운동으로 만난 입자는 그대로 달라붙습니다. 강이 실어 온 점토가 바다를 만나는 하구에서 가라앉아 삼각주를 만드는 이유입니다."
          : "The attraction is Week 5's dispersion force summed over whole particles (the Hamaker constant A_H); the repulsion is the osmotic pressure of overlapping ion clouds. Raise the salt concentration: the strength of the repulsive term does not change, only its range κ⁻¹, which shrinks from 9.6 nm (1 mM) to 0.39 nm (0.6 M) as ions screen the surface charge. At the defaults the barrier is a comfortable 53 kT at 1 mM but vanishes above the critical coagulation concentration of 62 mM, after which every thermal encounter sticks. That is why river-borne clay settles where the river meets the sea and builds a delta."}
      </Note>
      <Note>
        {isKo
          ? "전하수 버튼을 2:2, 3:3으로 바꾸면 임계 응집 농도가 급격히 내려갑니다. 장벽이 사라지는 조건(U = 0과 dU/dh = 0, 곧 κh = 1)을 풀면 임계 농도가 γ⁴/(z⁶A_H²)에 비례하기 때문입니다. 표면 전위가 높아 γ → 1인 극한에서는 정확히 z⁻⁶, 곧 1 : 1/64 : 1/729이 되며 이것이 경험 법칙으로 먼저 알려진 Schulze–Hardy 규칙입니다. 정수장에서 응집제로 Al³⁺ 염을 쓰는 이유입니다."
          : "Switch the valence to 2:2 or 3:3 and the critical coagulation concentration plunges. Solving for the vanishing barrier (U = 0 with dU/dh = 0, which gives κh = 1) shows the critical concentration is proportional to γ⁴/(z⁶A_H²). In the high-potential limit γ → 1 this is exactly z⁻⁶, that is 1 : 1/64 : 1/729, the empirical Schulze–Hardy rule. It is why water-treatment plants use Al³⁺ salts as coagulants."}
      </Note>
    </Card>
  );
}

function HydrophobicCard({ isKo }) {
  const cell = { padding: "7px 14px", borderBottom: `1px solid ${C.border}` };
  return (
    <Card>
      <Hd>{isKo ? "소수성 상호작용: 물이 얻는 엔트로피" : "The hydrophobic interaction: entropy gained by water"}</Hd>
      <Eq>{"ΔG = ΔH − TΔS"}</Eq>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 13, minWidth: 560 }}>
          <thead>
            <tr style={{ color: C.textDim, textAlign: "left" }}>
              <th style={cell}>{isKo ? "과정" : "process"}</th>
              <th style={cell}>ΔH</th><th style={cell}>ΔS</th><th style={cell}>ΔG</th>
              <th style={cell}>{isKo ? "결과" : "outcome"}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}>{isKo ? "소수성 분자가 물에 따로따로 녹음" : "hydrophobes dissolve separately in water"}</td>
              <td style={{ ...cell, fontFamily: mono }}>{"< 0"}</td>
              <td style={{ ...cell, fontFamily: mono, color: C.err }}>{"< 0"}</td>
              <td style={{ ...cell, fontFamily: mono, color: C.err }}>{"> 0"}</td>
              <td style={{ ...cell, color: C.textDim }}>{isKo ? "비자발적" : "not spontaneous"}</td>
            </tr>
            <tr>
              <td style={cell}>{isKo ? "소수성 분자끼리 모임" : "hydrophobes cluster together"}</td>
              <td style={{ ...cell, fontFamily: mono }}>{"> 0"}</td>
              <td style={{ ...cell, fontFamily: mono, color: C.ok }}>{"> 0"}</td>
              <td style={{ ...cell, fontFamily: mono, color: C.ok }}>{"< 0"}</td>
              <td style={{ ...cell, color: C.textDim }}>{isKo ? "자발적" : "spontaneous"}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Note>
        {isKo
          ? "기름이 물에 섞이지 않는 것은 기름 분자끼리 강하게 끌려서가 아닙니다. 무극성 분자 주위의 물은 수소결합을 유지하려고 얼음 비슷한 정돈된 새장(클라스레이트)을 만들고, 그만큼 물의 엔트로피가 줄어듭니다. 엔탈피 변화는 작아서 승부는 −TΔS가 결정하고 ΔG > 0이 됩니다. 반대로 소수성 분자가 서로 모이면 새장으로 묶여 있던 물이 풀려나 엔트로피가 늘어납니다. 수소결합 일부가 끊어져 ΔH > 0이어도 ΔG < 0입니다. 소수성 '인력'의 정체는 용매의 엔트로피입니다. 단백질이 소수성 잔기를 안쪽에 묻으며 접히고, 다음 카드의 미셀과 막이 스스로 조립되는 추진력이 이것입니다."
          : "Oil does not refuse to mix with water because oil molecules attract each other strongly. Water around a nonpolar solute keeps its hydrogen bonds by building an ordered, ice-like cage (a clathrate), and the entropy of the water falls. The enthalpy change is small, so −TΔS decides the contest and ΔG > 0. Conversely, when hydrophobes cluster, the caged water is released and the entropy rises; even though some hydrogen bonds break (ΔH > 0), ΔG < 0. The hydrophobic 'attraction' is really the entropy of the solvent. It is the driving force by which proteins fold with their hydrophobic residues buried inside, and by which the micelles and membranes of the next card assemble themselves."}
      </Note>
    </Card>
  );
}

function monomerConc(ct, N) {
  let lo = 0, hi = ct;
  for (let i = 0; i < 80; i++) {
    const mid = 0.5 * (lo + hi);
    if (mid + N * Math.pow(mid, N) > ct) hi = mid; else lo = mid;
  }
  return 0.5 * (lo + hi);
}

function MicelleLab({ isKo }) {
  const [N, setN] = useState(30);
  const [ct, setCt] = useState(1.5);
  const W = 680, Ht = 280, pad = 52;
  const { X, Y } = plotScale(0, 4, 0, 4, W, Ht, pad);
  const mono_ = [], mic = [];
  for (let j = 1; j <= 200; j++) {
    const c = 4 * j / 200, m = monomerConc(c, N);
    mono_.push([c, m]); mic.push([c, c - m]);
  }
  const m = monomerConc(ct, N);
  return (
    <Card>
      <Hd>{isKo ? "미셀 실험실: 임계 미셀 농도는 왜 '임계'인가" : "Micelle lab: why the critical micelle concentration is critical"}</Hd>
      <Eq>{"N M ⇌ M_N      [M_N] = K [M]ᴺ      c_total = [M] + N K [M]ᴺ"}</Eq>
      <Row>
        <Slider label={isKo ? "회합수 N" : "aggregation number N"} value={N} min={2} max={100} step={1} onChange={setN} width={200} />
        <Slider label={isKo ? "전체 농도" : "total concentration"} value={ct} min={0.05} max={4} step={0.05} onChange={setCt} width={200} fmt={v => v.toFixed(2)} />
        <Pill color={C.accent}>{isKo ? "미셀에 든 분율" : "fraction in micelles"} = {(1 - m / ct).toFixed(3)}</Pill>
      </Row>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <line x1={pad} y1={Y(0)} x2={W - pad} y2={Y(0)} stroke="#334155" />
        <line x1={X(0)} y1={Y(0)} x2={X(4)} y2={Y(4)} stroke="#475569" strokeDasharray="3 5" />
        <path d={pathOf(mono_, X, Y)} fill="none" stroke={C.sky} strokeWidth={2.4} />
        <path d={pathOf(mic, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.4} />
        <line x1={X(ct)} y1={Y(0)} x2={X(ct)} y2={Y(Math.max(m, ct - m))} stroke={C.amber} strokeWidth={1.6} strokeDasharray="4 3" />
        <circle cx={X(ct)} cy={Y(m)} r={5} fill={C.sky} />
        <circle cx={X(ct)} cy={Y(ct - m)} r={5} fill={C.accent} />
        {[0, 1, 2, 3, 4].map(v => <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        <text x={X(3.3)} y={Y(monomerConc(3.3, N)) - 10} fill={C.sky} fontSize={11.5}>{isKo ? "자유 단량체" : "free monomer"}</text>
        <text x={X(3.3)} y={Y(3.3 - monomerConc(3.3, N)) - 10} fill={C.accent} fontSize={11.5}>{isKo ? "미셀 속" : "in micelles"}</text>
        <text x={W / 2} y={Ht - 10} fill={C.textDim} fontSize={11} textAnchor="middle">{isKo ? "계면활성제 전체 농도 (K = 1인 환산 단위)" : "total surfactant concentration (reduced units, K = 1)"}</text>
      </svg>
      <Note>
        {isKo
          ? "N을 2나 3으로 낮추면 회합이 서서히 일어나 뚜렷한 문턱이 없습니다. N을 30 이상으로 올리면 그림이 꺾입니다. 농도 1 근처까지는 거의 전부 단량체로 남다가, 그 뒤로는 더 넣은 분자가 모두 미셀로 가고 단량체 농도는 평평해집니다. [M]ᴺ의 높은 차수가 사실상 '전부 아니면 전무'를 만들기 때문이며, 이 꺾이는 점이 CMC입니다. 5주차에서 본 표면장력이 CMC에서 더 내려가지 않는 것도 표면을 채우는 단량체 농도가 고정되기 때문이고, 몰 전도도와 삼투압이 같은 농도에서 일제히 꺾이는 것도 같은 이유입니다."
          : "With N of 2 or 3, association is gradual and there is no clear threshold. Raise N to 30 or more and the curve develops a kink: up to a concentration near 1 almost everything stays as monomer, and beyond it every added molecule goes into micelles while the monomer concentration flattens. The high power [M]ᴺ makes the process effectively all-or-nothing, and the kink is the CMC. The surface tension of Week 5 stops falling at the CMC because the monomer concentration that feeds the surface is pinned, and molar conductivity and osmotic pressure all break at the same concentration for the same reason."}
      </Note>
      <Note>
        {isKo
          ? "어떤 모양으로 조립되는지는 분자의 생김새가 정합니다. 머리가 크고 꼬리가 하나인 계면활성제는 원뿔 모양이라 구형 미셀로, 꼬리가 둘인 인지질은 원통에 가까워 평평한 이중층으로 쌓이고, 이중층이 닫히면 소포(vesicle)가 됩니다. 세포막은 이 인지질 이중층에 단백질과 콜레스테롤이 떠 있는 2차원 유체입니다."
          : "The shape of the assembly is set by the shape of the molecule. A single-tailed surfactant with a large head is cone-like and packs into spherical micelles; a two-tailed phospholipid is closer to a cylinder and stacks into flat bilayers, which close up into vesicles. A cell membrane is such a phospholipid bilayer, a two-dimensional fluid in which proteins and cholesterol float."}
      </Note>
    </Card>
  );
}

// =============================================================
// 5) RATE LAWS
// =============================================================
// 2 I + Ar -> I2 + Ar, initial rates (lecture example)
const IR_I0 = [1.0e-5, 2.0e-5, 4.0e-5, 6.0e-5];             // mol dm^-3
const IR_AR = [1.0e-3, 5.0e-3, 1.0e-2];                       // mol dm^-3
const IR_V0 = [[8.70e-4, 3.48e-3, 1.39e-2, 3.13e-2],
               [4.35e-3, 1.74e-2, 6.96e-2, 1.57e-1],
               [8.69e-3, 3.47e-2, 1.38e-1, 3.13e-1]];        // mol dm^-3 s^-1
// azomethane at 600 K (lecture example)
const AZ_T = [0, 1000, 2000, 3000, 4000];
const AZ_P = [10.9, 7.63, 5.32, 3.71, 2.59];

function RatesTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <RateDefCard isKo={isKo} />
      <InitialRatesLab isKo={isKo} />
      <IntegratedLab isKo={isKo} />
      <AzomethaneCard isKo={isKo} />
    </div>
  );
}

function RateDefCard({ isKo }) {
  const [al, setAl] = useState(0.4);
  const parts = [
    { lb: "N₂O₅", v: 1 - al, c: C.pink },
    { lb: "NO₂", v: 2 * al, c: C.amber },
    { lb: "O₂", v: 0.5 * al, c: C.sky },
  ];
  const total = 1 + 1.5 * al;
  return (
    <Card>
      <Hd>{isKo ? "반응 속도: 무엇을, 어떻게 재는가" : "Reaction rate: what we measure and how"}</Hd>
      <Eq>{"A + 2B → 3C + D:   v = −d[A]/dt = −½ d[B]/dt = ⅓ d[C]/dt = d[D]/dt      v = (1/ν_J) d[J]/dt = (1/V) dξ/dt"}</Eq>
      <Note>
        {isKo
          ? "B는 A보다 두 배 빨리 사라지고 C는 세 배 빨리 생기므로, 어느 물질을 재느냐에 따라 '속도'가 달라져 버립니다. 화학량론 계수 ν_J로 나누면(반응물은 음수) 어느 물질로 재든 같은 하나의 반응 속도 v가 됩니다. 실험에서는 농도에 비례하는 무엇이든 시간에 따라 추적하면 됩니다. 빛 흡수(Br₂의 색), pH(H⁺ 생성), 그리고 기체 반응이라면 압력입니다."
          : "B disappears twice as fast as A and C appears three times as fast, so the 'rate' would depend on which species we watch. Dividing by the stoichiometric number ν_J (negative for reactants) gives one reaction rate v whichever species is monitored. Experimentally we follow anything proportional to concentration: light absorption (the colour of Br₂), pH (H⁺ production), or, for gas reactions, the pressure."}
      </Note>
      <HdSub>{isKo ? "압력으로 반응 따라가기: 2 N₂O₅(g) → 4 NO₂(g) + O₂(g)" : "Following a reaction by pressure: 2 N₂O₅(g) → 4 NO₂(g) + O₂(g)"}</HdSub>
      <Row>
        <Slider label={isKo ? "분해된 분율 α" : "fraction decomposed α"} value={al} min={0} max={1} step={0.01} onChange={setAl} width={240} fmt={v => v.toFixed(2)} />
        <Pill color={C.accent}>P/P₀ = 1 + (3/2)α = {total.toFixed(3)}</Pill>
      </Row>
      <div style={{ display: "flex", height: 30, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}`, width: `${(total / 2.5) * 100}%`, minWidth: 120, transition: "width 0.1s" }}>
        {parts.map(q => (
          <div key={q.lb} style={{ width: `${(q.v / total) * 100}%`, background: q.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#0b0f17", overflow: "hidden", whiteSpace: "nowrap" }}>
            {q.v / total > 0.09 ? q.lb : ""}
          </div>
        ))}
      </div>
      <StatGrid>
        <Stat label="n(N₂O₅)" value={`${(1 - al).toFixed(2)} n`} color={C.pink} />
        <Stat label="n(NO₂)" value={`${(2 * al).toFixed(2)} n`} color={C.amber} />
        <Stat label="n(O₂)" value={`${(0.5 * al).toFixed(2)} n`} color={C.sky} />
        <Stat label={isKo ? "전체" : "total"} value={`${total.toFixed(2)} n`} color={C.accent} />
      </StatGrid>
      <Note>
        {isKo
          ? "막대의 전체 길이가 압력입니다. N₂O₅ 두 분자가 기체 다섯 분자로 바뀌므로 부피가 일정한 용기에서 압력은 P₀에서 2.5P₀까지 오릅니다. 거꾸로 읽으면 α = (2/3)(P/P₀ − 1)이니, 압력계 하나로 반응의 진행을 실시간으로 알 수 있습니다."
          : "The total length of the bar is the pressure. Two N₂O₅ molecules become five gas molecules, so in a rigid vessel the pressure climbs from P₀ to 2.5P₀. Read backwards, α = (2/3)(P/P₀ − 1): a single pressure gauge reports the progress of the reaction in real time."}
      </Note>
    </Card>
  );
}

function InitialRatesLab({ isKo }) {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  // k_i = v0 / ([I]^a [Ar]^b) for all 12 runs
  const ks = [];
  IR_V0.forEach((row, j) => row.forEach((v, i) => ks.push({ j, i, k: v / (Math.pow(IR_I0[i], a) * Math.pow(IR_AR[j], b)) })));
  const lks = ks.map(q => Math.log10(q.k));
  const lmean = lks.reduce((s, v) => s + v, 0) / lks.length;
  const spread = Math.pow(10, Math.max(...lks) - Math.min(...lks));
  const good = spread < 1.05;
  const fits = IR_V0.map(row => linfit(IR_I0.map(Math.log10), row.map(Math.log10)));
  const fitB = linfit(IR_AR.map(Math.log10), fits.map(f => f.icpt));
  const colors = [C.sky, C.pink, C.accent];
  const W = 400, Ht = 290, pad = 50;
  const P1 = plotScale(-5.1, -4.1, -3.3, -0.3, W, Ht, pad);
  const P2 = plotScale(-2.2, 2.2, -0.6, 2.6, W, Ht, pad);
  return (
    <Card>
      <Hd>{isKo ? "초기 속도법 실험실: 차수를 맞혀 보라" : "Initial-rate lab: find the orders"}</Hd>
      <Eq>{"2 I(g) + Ar(g) → I₂(g) + Ar(g)      v₀ = k [I]₀ᵃ [Ar]₀ᵇ      log v₀ = log k′ + a log[I]₀,   k′ = k [Ar]₀ᵇ"}</Eq>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12.5, fontFamily: mono, minWidth: 560 }}>
          <thead>
            <tr style={{ color: C.textDim }}>
              <th style={{ padding: "6px 12px", borderBottom: `1px solid ${C.border}`, textAlign: "left" }}>[I]₀ / 10⁻⁵ mol dm⁻³</th>
              {IR_I0.map(v => <th key={v} style={{ padding: "6px 12px", borderBottom: `1px solid ${C.border}`, textAlign: "right" }}>{(v * 1e5).toFixed(1)}</th>)}
            </tr>
          </thead>
          <tbody>
            {IR_V0.map((row, j) => (
              <tr key={j}>
                <td style={{ padding: "4px 12px", color: colors[j] }}>v₀, [Ar]₀ = {(IR_AR[j] * 1e3).toFixed(1)} mmol dm⁻³</td>
                {row.map((v, i) => <td key={i} style={{ padding: "4px 12px", textAlign: "right", color: C.text }}>{sci(v)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Row>
        <Slider label={isKo ? "I에 대한 차수 a" : "order in I, a"} value={a} min={0} max={3} step={0.5} onChange={setA} width={170} fmt={v => v.toFixed(1)} />
        <Slider label={isKo ? "Ar에 대한 차수 b" : "order in Ar, b"} value={b} min={0} max={2} step={0.5} onChange={setB} width={170} fmt={v => v.toFixed(1)} />
        <Pill color={good ? C.ok : C.err}>
          {isKo ? "12개 k의 최대/최소" : "max/min of the 12 k values"} = {spread < 100 ? spread.toFixed(2) : sci(spread, 1)}
        </Pill>
        {good && <Pill color={C.accent}>k = {sci(Math.pow(10, lmean))} dm⁶ mol⁻² s⁻¹</Pill>}
      </Row>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <line x1={pad} y1={Ht - pad} x2={W - pad} y2={Ht - pad} stroke="#334155" />
          <line x1={pad} y1={pad - 6} x2={pad} y2={Ht - pad} stroke="#334155" />
          {IR_V0.map((row, j) => (
            <g key={j}>
              <line x1={P1.X(-5.05)} y1={P1.Y(fits[j].slope * -5.05 + fits[j].icpt)} x2={P1.X(-4.15)} y2={P1.Y(fits[j].slope * -4.15 + fits[j].icpt)} stroke={colors[j]} strokeWidth={1.6} />
              {row.map((v, i) => <circle key={i} cx={P1.X(Math.log10(IR_I0[i]))} cy={P1.Y(Math.log10(v))} r={4.5} fill="#0d1117" stroke={colors[j]} strokeWidth={2} />)}
              <text x={pad + 10} y={pad + 8 + (2 - j) * 15} fill={colors[j]} fontSize={10.5}>
                [Ar]₀ = {(IR_AR[j] * 1e3).toFixed(0)} mM: {isKo ? "기울기" : "slope"} {fits[j].slope.toFixed(2)}
              </text>
            </g>
          ))}
          {[-5, -4.8, -4.6, -4.4, -4.2].map(v => <text key={v} x={P1.X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
          {[-3, -2, -1].map(v => <text key={v} x={pad - 8} y={P1.Y(v) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{v}</text>)}
          <text x={W / 2} y={Ht - 8} fill={C.textDim} fontSize={11} textAnchor="middle">log([I]₀ / mol dm⁻³)</text>
          <text x={W / 2} y={pad - 16} fill={C.text} fontSize={12} fontWeight={700} textAnchor="middle">log v₀</text>
        </svg>
        <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <line x1={P2.X(0)} y1={pad - 6} x2={P2.X(0)} y2={Ht - pad} stroke="#475569" strokeDasharray="4 4" />
          {ks.map((q, n) => (
            <circle key={n} cx={P2.X(Math.max(-2.2, Math.min(2.2, lks[n] - lmean)))} cy={P2.Y(q.j)} r={5} fill={colors[q.j]} opacity={0.85} />
          ))}
          {IR_AR.map((v, j) => <text key={j} x={pad - 8} y={P2.Y(j) + 4} fill={colors[j]} fontSize={10} textAnchor="end">{(v * 1e3).toFixed(0)} mM</text>)}
          {[-2, -1, 0, 1, 2].map(v => <text key={v} x={P2.X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
          <text x={W / 2} y={Ht - 8} fill={C.textDim} fontSize={11} textAnchor="middle">{isKo ? "log k − 평균 (자릿수)" : "log k − mean (decades)"}</text>
          <text x={W / 2} y={pad - 16} fill={C.text} fontSize={12} fontWeight={700} textAnchor="middle">
            {isKo ? "k = v₀/([I]ᵃ[Ar]ᵇ)의 흩어짐" : "scatter of k = v₀/([I]ᵃ[Ar]ᵇ)"}
          </text>
        </svg>
      </div>
      <Note>
        {isKo
          ? `왼쪽: [Ar]을 고정하면(고립법) log v₀ 대 log[I]₀이 직선이고, 세 직선의 기울기가 모두 2.00입니다. 절편 log k′을 log[Ar]₀에 대해 다시 그리면 기울기 ${fitB.slope.toFixed(2)}, 절편에서 k가 나옵니다. 오른쪽은 같은 일을 다르게 봅니다. 올바른 속도식이라면 12번의 실험 어디서 구하든 k가 같아야 합니다. a와 b를 움직여 열두 점이 한 줄로 모이게 해 보십시오. a = 2, b = 1에서만 모이고, 그때 k = 8.7×10⁹ dm⁶ mol⁻² s⁻¹입니다.`
          : `Left: with [Ar] held fixed (the isolation method) log v₀ against log[I]₀ is a straight line, and all three slopes are 2.00. Plot the intercepts log k′ against log[Ar]₀ and the slope is ${fitB.slope.toFixed(2)}, with k from the intercept. The right panel views the same task differently: if the rate law is right, k must come out the same from every one of the 12 runs. Move a and b until the twelve points line up. They do so only at a = 2, b = 1, where k = 8.7×10⁹ dm⁶ mol⁻² s⁻¹.`}
      </Note>
      <Note>
        {isKo
          ? "요오드 원자 둘이 만나는 반응이 왜 Ar에 대해 1차일까요. 두 원자가 결합하면서 내놓는 에너지를 가져갈 제3의 입자가 없으면 I₂는 곧바로 다시 쪼개지기 때문입니다. 차수는 화학량론이 아니라 메커니즘이 정하며, 실험으로만 알 수 있습니다. H₂ + Br₂ → 2HBr의 속도식 v = k_a[H₂][Br₂]^(3/2) / ([Br₂] + k_b[HBr])처럼 차수를 아예 정의할 수 없는 반응도 있습니다."
          : "Why is the meeting of two iodine atoms first order in Ar? Without a third body to carry away the energy released on bond formation, the new I₂ flies apart again at once. Orders are set by mechanism, not stoichiometry, and can only be found by experiment. Some reactions have no order at all, such as H₂ + Br₂ → 2HBr with v = k_a[H₂][Br₂]^(3/2) / ([Br₂] + k_b[HBr])."}
      </Note>
    </Card>
  );
}

function IntegratedLab({ isKo }) {
  const [order, setOrder] = useState(1);
  const [k, setK] = useState(1.0);
  const [A0, setA0] = useState(1.0);
  const conc = t => order === 0 ? Math.max(A0 - k * t, 0) : order === 1 ? A0 * Math.exp(-k * t) : A0 / (1 + k * t * A0);
  const hl = A => order === 0 ? A / (2 * k) : order === 1 ? Math.LN2 / k : 1 / (k * A);
  const t1 = hl(A0), t2 = hl(A0 / 2), t3 = hl(A0 / 4);
  const tEnd = 5;
  const W = 420, Ht = 270, pad = 48;
  const P1 = plotScale(0, tEnd, 0, 2.1, W, Ht, pad);
  const pts = [];
  for (let j = 0; j <= 250; j++) { const t = tEnd * j / 250; pts.push([t, conc(t)]); }
  // linearised coordinate
  const lin = t => order === 0 ? conc(t) : order === 1 ? Math.log(Math.max(conc(t), 1e-9)) : 1 / Math.max(conc(t), 1e-9);
  const tLin = order === 0 ? Math.min(tEnd, A0 / k) : tEnd;
  const lp = [];
  for (let j = 0; j <= 100; j++) { const t = tLin * j / 100; lp.push([t, lin(t)]); }
  const ys = lp.map(q => q[1]);
  const P2 = plotScale(0, tEnd, Math.min(...ys) - 0.1, Math.max(...ys) + 0.1, W, Ht, pad);
  const linLabel = ["[A]", "ln[A]", "1/[A]"][order];
  const marks = [[t1, A0 / 2], [t1 + t2, A0 / 4], [t1 + t2 + t3, A0 / 8]].filter(q => q[0] <= tEnd);
  return (
    <Card>
      <Hd>{isKo ? "적분 속도식: 농도는 시간에 따라 어떻게 줄어드는가" : "Integrated rate laws: how concentration falls with time"}</Hd>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12.5, fontFamily: mono, minWidth: 600 }}>
          <thead>
            <tr style={{ color: C.textDim, textAlign: "left" }}>
              {[isKo ? "차수" : "order", isKo ? "속도식" : "rate law", isKo ? "적분형" : "integrated form", isKo ? "직선이 되는 그림" : "linear plot", "t½"].map(h => (
                <th key={h} style={{ padding: "6px 12px", borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["0", "v = k", "[A] = [A]₀ − kt", "[A] vs t", "[A]₀/2k"],
              ["1", "v = k[A]", "[A] = [A]₀ e^(−kt)", "ln[A] vs t", "ln2/k"],
              ["2", "v = k[A]²", "1/[A] = 1/[A]₀ + kt", "1/[A] vs t", "1/k[A]₀"],
            ].map((r, i) => (
              <tr key={i} style={{ color: i === order ? C.accentSoft : C.text, background: i === order ? "rgba(163,230,53,0.07)" : "transparent" }}>
                {r.map((cell, j) => <td key={j} style={{ padding: "5px 12px" }}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Row>
        {[0, 1, 2].map(n => (
          <button key={n} onClick={() => setOrder(n)} style={{ ...btnStyle(order === n), padding: "6px 14px" }}>{isKo ? `${n}차` : `order ${n}`}</button>
        ))}
        <Slider label="k" value={k} min={0.2} max={3} step={0.05} onChange={setK} width={150} fmt={v => v.toFixed(2)} />
        <Slider label="[A]₀" value={A0} min={0.5} max={2} step={0.05} onChange={setA0} width={150} fmt={v => v.toFixed(2)} />
      </Row>
      <StatGrid>
        <Stat label={isKo ? "첫 번째 반감기" : "1st half-life"} value={t1.toFixed(3)} color={C.accent} />
        <Stat label={isKo ? "두 번째 반감기" : "2nd half-life"} value={t2.toFixed(3)} color={C.accent} />
        <Stat label={isKo ? "세 번째 반감기" : "3rd half-life"} value={t3.toFixed(3)} color={C.accent} />
        <Stat label={isKo ? "반감기의 변화" : "pattern"} value={[isKo ? "절반씩 줄어듦" : "halves each time", isKo ? "일정" : "constant", isKo ? "두 배씩 늘어남" : "doubles each time"][order]} color={C.amber} />
      </StatGrid>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <line x1={pad} y1={P1.Y(0)} x2={W - pad} y2={P1.Y(0)} stroke="#334155" />
          <path d={pathOf(pts, P1.X, P1.Y)} fill="none" stroke={C.accent} strokeWidth={2.6} />
          {marks.map((q, i) => (
            <g key={i}>
              <line x1={P1.X(q[0])} y1={P1.Y(0)} x2={P1.X(q[0])} y2={P1.Y(q[1])} stroke={C.amber} strokeDasharray="4 3" />
              <circle cx={P1.X(q[0])} cy={P1.Y(q[1])} r={4} fill={C.amber} />
            </g>
          ))}
          {[0, 1, 2, 3, 4, 5].map(v => <text key={v} x={P1.X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
          <text x={W / 2} y={pad - 16} fill={C.text} fontSize={12} fontWeight={700} textAnchor="middle">[A] vs t</text>
          <text x={W / 2} y={Ht - 8} fill={C.textDim} fontSize={11} textAnchor="middle">t</text>
        </svg>
        <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <path d={pathOf(lp, P2.X, P2.Y)} fill="none" stroke={C.cyan} strokeWidth={2.6} />
          {[0, 1, 2, 3, 4, 5].map(v => <text key={v} x={P2.X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
          <text x={W / 2} y={pad - 16} fill={C.cyan} fontSize={12} fontWeight={700} textAnchor="middle">
            {linLabel} vs t ({isKo ? "기울기" : "slope"} = {order === 2 ? "+k" : "−k"})
          </text>
          <text x={W / 2} y={Ht - 8} fill={C.textDim} fontSize={11} textAnchor="middle">t</text>
        </svg>
      </div>
      <Note>
        {isKo
          ? "주황 점은 농도가 절반, 4분의 1, 8분의 1이 되는 시각입니다. 1차 반응에서는 간격이 일정합니다. 반감기 ln2/k가 처음 농도와 무관하기 때문이며, 방사성 붕괴의 연대 측정이 가능한 이유입니다. 2차 반응은 묽어질수록 만날 상대가 줄어 반감기가 두 배씩 늘어나고(긴 꼬리), 0차 반응은 일정한 속도로 줄다가 유한한 시간에 완전히 끝납니다. 차수를 알아내는 가장 깔끔한 방법은 오른쪽처럼 세 가지 좌표로 그려 보고 어느 것이 직선인지 보는 것입니다. 일반식은 t½ = (2ⁿ⁻¹ − 1)/[(n − 1)k[A]₀ⁿ⁻¹]입니다."
          : "The amber dots mark when the concentration reaches one half, one quarter, and one eighth. For a first-order reaction they are equally spaced: the half-life ln2/k does not depend on the starting concentration, which is what makes radioactive dating possible. A second-order reaction slows as it dilutes because partners become scarce, so each half-life doubles (a long tail), while a zeroth-order reaction falls at a steady rate and finishes completely in a finite time. The cleanest way to find the order is the right-hand panel: plot the data in all three coordinates and see which one is straight. The general result is t½ = (2ⁿ⁻¹ − 1)/[(n − 1)k[A]₀ⁿ⁻¹]."}
      </Note>
    </Card>
  );
}

function AzomethaneCard({ isKo }) {
  const [mode, setMode] = useState(1);
  const tr = [p => p, p => Math.log(p / AZ_P[0]), p => 1 / p];
  const ys = AZ_P.map(tr[mode]);
  const fit = linfit(AZ_T, ys);
  const f1 = linfit(AZ_T, AZ_P.map(tr[1]));
  const kk = -f1.slope;
  const r2all = [0, 1, 2].map(n => linfit(AZ_T, AZ_P.map(tr[n])).r2);
  const W = 640, Ht = 280, pad = 56;
  const lo = Math.min(...ys), hi = Math.max(...ys), m = (hi - lo) * 0.12;
  const { X, Y } = plotScale(0, 4000, lo - m, hi + m, W, Ht, pad);
  const labels = [isKo ? "0차: p vs t" : "zeroth: p vs t", isKo ? "1차: ln(p/p₀) vs t" : "first: ln(p/p₀) vs t", isKo ? "2차: 1/p vs t" : "second: 1/p vs t"];
  return (
    <Card>
      <Hd>{isKo ? "예제: 아조메테인 분해는 몇 차인가 (600 K)" : "Example: what order is azomethane decomposition? (600 K)"}</Hd>
      <Eq>{"CH₃N₂CH₃(g) → CH₃CH₃(g) + N₂(g)      ln(p/p₀) = −k t"}</Eq>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12.5, fontFamily: mono, minWidth: 480 }}>
          <tbody>
            <tr><td style={{ padding: "4px 12px", color: C.textDim }}>t / s</td>{AZ_T.map(v => <td key={v} style={{ padding: "4px 12px", textAlign: "right" }}>{v}</td>)}</tr>
            <tr><td style={{ padding: "4px 12px", color: C.textDim }}>p / Pa</td>{AZ_P.map(v => <td key={v} style={{ padding: "4px 12px", textAlign: "right" }}>{v}</td>)}</tr>
            <tr><td style={{ padding: "4px 12px", color: C.textDim }}>p/p₀</td>{AZ_P.map(v => <td key={v} style={{ padding: "4px 12px", textAlign: "right", color: C.accentSoft }}>{(v / AZ_P[0]).toFixed(3)}</td>)}</tr>
            <tr><td style={{ padding: "4px 12px", color: C.textDim }}>ln(p/p₀)</td>{AZ_P.map(v => <td key={v} style={{ padding: "4px 12px", textAlign: "right", color: C.accentSoft }}>{Math.log(v / AZ_P[0]).toFixed(3)}</td>)}</tr>
          </tbody>
        </table>
      </div>
      <Row>
        {labels.map((lb, n) => (
          <button key={n} onClick={() => setMode(n)} style={{ ...btnStyle(mode === n), padding: "6px 12px", fontSize: 12 }}>{lb}</button>
        ))}
        <Pill color={r2all[mode] > 0.9999 ? C.ok : C.err}>R² = {r2all[mode].toFixed(mode === 1 ? 6 : 4)}</Pill>
      </Row>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <line x1={pad} y1={Ht - pad} x2={W - pad} y2={Ht - pad} stroke="#334155" />
        <line x1={X(0)} y1={Y(fit.icpt)} x2={X(4000)} y2={Y(fit.icpt + fit.slope * 4000)} stroke={C.accent} strokeWidth={2} />
        {AZ_T.map((t, i) => <circle key={t} cx={X(t)} cy={Y(ys[i])} r={5} fill="#0d1117" stroke={C.amber} strokeWidth={2.2} />)}
        {AZ_T.map(v => <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        <text x={W / 2} y={Ht - 10} fill={C.textDim} fontSize={11} textAnchor="middle">t [s]</text>
        <text x={14} y={pad - 16} fill={C.textDim} fontSize={11}>{["p [Pa]", "ln(p/p₀)", "1/p [Pa⁻¹]"][mode]}</text>
      </svg>
      <StatGrid>
        <Stat label="k" value={`${sci(kk)} s⁻¹`} color={C.accent} />
        <Stat label={isKo ? "반감기 ln2/k" : "half-life ln2/k"} value={`${(Math.LN2 / kk).toFixed(0)} s`} color={C.amber} />
        <Stat label={isKo ? "시간 상수 τ = 1/k" : "time constant τ = 1/k"} value={`${(1 / kk).toFixed(0)} s`} color={C.cyan} />
        <Stat label={isKo ? "10%만 남는 시각 ln10/k" : "time to 10% left, ln10/k"} value={`${(Math.log(10) / kk).toFixed(0)} s`} color={C.textDim} />
      </StatGrid>
      <Note>
        {isKo
          ? "세 버튼을 차례로 눌러 보십시오. 0차와 2차 좌표에서는 점들이 직선에서 눈에 띄게 휘지만(R² 약 0.96), ln(p/p₀) 대 t에서는 다섯 점이 한 직선에 놓입니다(R² = 0.999996). 따라서 1차 반응이고, 기울기에서 k = 3.6×10⁻⁴ s⁻¹, 반감기 1.9×10³ s입니다. 시간 상수 τ = 1/k는 농도가 1/e로 줄어드는 시간입니다."
          : "Press the three buttons in turn. In the zeroth- and second-order coordinates the points bend visibly away from a line (R² about 0.96), but in ln(p/p₀) against t all five fall on one straight line (R² = 0.999996). The reaction is first order, with k = 3.6×10⁻⁴ s⁻¹ from the slope and a half-life of 1.9×10³ s. The time constant τ = 1/k is the time for the concentration to fall to 1/e."}
      </Note>
    </Card>
  );
}

// =============================================================
// 6) APPROACH TO EQUILIBRIUM & ARRHENIUS
// =============================================================
// second-order decomposition of acetaldehyde (textbook data set)
const AC_T = [700, 730, 760, 790, 810, 840, 910, 1000];
const AC_K = [0.011, 0.035, 0.105, 0.343, 0.789, 2.17, 20.0, 145.0];

function EquilTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <RelaxLab isKo={isKo} />
      <TJumpCard isKo={isKo} />
      <ArrheniusLab isKo={isKo} />
      <CatalystCard isKo={isKo} />
    </div>
  );
}

function RelaxLab({ isKo }) {
  const [kf, setKf] = useState(2.0);
  const [kb, setKb] = useState(0.5);
  const tau = 1 / (kf + kb), Aeq = kb / (kf + kb), Beq = 1 - Aeq;
  const W = 680, Ht = 290, pad = 52;
  const tEnd = 3;
  const { X, Y } = plotScale(0, tEnd, 0, 1.05, W, Ht, pad);
  const aPts = [], bPts = [];
  for (let j = 0; j <= 240; j++) {
    const t = tEnd * j / 240;
    const a = (kb + kf * Math.exp(-(kf + kb) * t)) / (kf + kb);
    aPts.push([t, a]); bPts.push([t, 1 - a]);
  }
  return (
    <Card>
      <Hd>{isKo ? "평형으로 가는 길: 역반응이 있는 1차 반응" : "The road to equilibrium: a first-order reaction with its reverse"}</Hd>
      <Eq>{"A ⇌ B   (k, k′):   d[A]/dt = −k[A] + k′[B]      [A] = [A]₀ (k′ + k e^(−(k+k′)t)) / (k + k′)      K = [B]eq/[A]eq = k/k′"}</Eq>
      <Row>
        <Slider label={isKo ? "정반응 k" : "forward k"} value={kf} min={0.1} max={5} step={0.1} onChange={setKf} width={190} fmt={v => v.toFixed(1)} />
        <Slider label={isKo ? "역반응 k′" : "reverse k′"} value={kb} min={0.1} max={5} step={0.1} onChange={setKb} width={190} fmt={v => v.toFixed(1)} />
      </Row>
      <StatGrid>
        <Stat label="K = k/k′" value={(kf / kb).toFixed(3)} color={C.accent} />
        <Stat label="[A]eq / [A]₀" value={Aeq.toFixed(3)} color={C.pink} />
        <Stat label="[B]eq / [A]₀" value={Beq.toFixed(3)} color={C.sky} />
        <Stat label={isKo ? "완화 시간 τ = 1/(k+k′)" : "relaxation time τ = 1/(k+k′)"} value={tau.toFixed(3)} color={C.amber} />
      </StatGrid>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <line x1={pad} y1={Y(0)} x2={W - pad} y2={Y(0)} stroke="#334155" />
        <line x1={pad} y1={Y(Aeq)} x2={W - pad} y2={Y(Aeq)} stroke={C.pink} strokeDasharray="3 5" opacity={0.6} />
        <line x1={pad} y1={Y(Beq)} x2={W - pad} y2={Y(Beq)} stroke={C.sky} strokeDasharray="3 5" opacity={0.6} />
        <path d={pathOf(aPts, X, Y)} fill="none" stroke={C.pink} strokeWidth={2.6} />
        <path d={pathOf(bPts, X, Y)} fill="none" stroke={C.sky} strokeWidth={2.6} />
        {tau < tEnd && <line x1={X(tau)} y1={Y(0)} x2={X(tau)} y2={Y(1.02)} stroke={C.amber} strokeDasharray="4 3" />}
        {tau < tEnd && <text x={X(tau) + 5} y={Y(1.0)} fill={C.amber} fontSize={11}>τ</text>}
        <text x={W - pad - 4} y={Y(aPts[240][1]) - 8} fill={C.pink} fontSize={12} textAnchor="end">[A]</text>
        <text x={W - pad - 4} y={Y(bPts[240][1]) - 8} fill={C.sky} fontSize={12} textAnchor="end">[B]</text>
        {[0, 1, 2, 3].map(v => <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        <text x={W / 2} y={Ht - 10} fill={C.textDim} fontSize={11} textAnchor="middle">t</text>
      </svg>
      <Note>
        {isKo
          ? "평형은 반응이 멈춘 상태가 아니라 정반응과 역반응의 속도가 같아진 상태입니다. k[A]eq = k′[B]eq에서 곧바로 K = k/k′이 나옵니다. 열역학량인 평형 상수가 두 속도 상수의 비라는 것, 이것이 속도론과 열역학을 잇는 다리입니다. 눈여겨볼 점은 평형에 다가가는 빠르기입니다. 지수에 들어가는 것은 k도 k′도 아니고 합 k + k′입니다. k′ 슬라이더만 올려 보십시오. 생성물은 줄어드는데 평형에는 오히려 더 빨리 도달합니다."
          : "Equilibrium is not a state where reaction has stopped, but one where forward and reverse rates are equal. From k[A]eq = k′[B]eq we get K = k/k′ at once: a thermodynamic quantity, the equilibrium constant, is the ratio of two rate constants, and that is the bridge between kinetics and thermodynamics. Notice how fast equilibrium is approached. The exponent contains neither k nor k′ alone but the sum k + k′. Raise only the k′ slider: less product forms, yet equilibrium is reached sooner."}
      </Note>
    </Card>
  );
}

function TJumpCard({ isKo }) {
  const [tauUs, setTauUs] = useState(37);
  const Kw = 1.008e-14, cw = 55.6;
  const K = Kw / cw;
  const kRev = (1 / (tauUs * 1e-6)) / (K + 2 * Math.sqrt(Kw));
  const kFwd = K * kRev;
  const W = 640, Ht = 220, pad = 50;
  const { X, Y } = plotScale(-40, 200, 0, 1.15, W, Ht, pad);
  const pts = [[-40, 0.12], [0, 0.12]];
  for (let j = 0; j <= 200; j++) { const t = 200 * j / 200; pts.push([t, 1 - 0.88 * Math.exp(-t / tauUs)]); }
  return (
    <Card>
      <Hd>{isKo ? "완화법: 너무 빨라서 섞을 수 없는 반응 재기" : "Relaxation methods: clocking reactions too fast to mix"}</Hd>
      <Eq>{"x = x₀ e^(−t/τ)      H₂O ⇌ H⁺ + OH⁻:   1/τ = k + k′([H⁺]eq + [OH⁻]eq),   K = k/k′ = K_w/55.6"}</Eq>
      <Note>
        {isKo
          ? "두 용액을 섞는 데만 밀리초가 걸리므로, 그보다 빠른 반응은 섞어서 시작할 수 없습니다. Eigen의 해법은 이미 평형에 있는 용액의 온도를 순식간에 올리는 것입니다. 평형 상수가 온도에 따라 달라지므로 계는 갑자기 평형에서 벗어난 상태가 되고, 새 평형으로 지수적으로 '완화'합니다. 그 시간 상수 τ를 재면 속도 상수가 나옵니다."
          : "Mixing two solutions takes milliseconds, so faster reactions cannot be started by mixing. Eigen's answer was to heat a solution already at equilibrium almost instantaneously. Because the equilibrium constant depends on temperature, the system is suddenly out of equilibrium and relaxes exponentially to the new one. Measuring the time constant τ gives the rate constants."}
      </Note>
      <Row>
        <Slider label={isKo ? "측정한 완화 시간 τ" : "measured relaxation time τ"} value={tauUs} min={10} max={100} step={1} onChange={setTauUs} unit=" μs" width={220} />
        <Pill color={C.textDim}>K_w = 1.008×10⁻¹⁴, 298 K, pH ≈ 7</Pill>
      </Row>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <rect x={X(-40)} y={pad - 10} width={X(0) - X(-40)} height={Y(0) - pad + 10} fill="rgba(245,158,11,0.10)" />
        <text x={(X(-40) + X(0)) / 2} y={Y(0) - 8} fill={C.amber} fontSize={11} textAnchor="middle">T₁</text>
        <text x={X(100)} y={Y(0) - 8} fill={C.textDim} fontSize={11} textAnchor="middle">T₂</text>
        <line x1={pad} y1={Y(1)} x2={W - pad} y2={Y(1)} stroke="#475569" strokeDasharray="3 5" />
        <path d={pathOf(pts, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.6} />
        <line x1={X(tauUs)} y1={Y(0)} x2={X(tauUs)} y2={Y(1 - 0.88 / Math.E)} stroke={C.amber} strokeDasharray="4 3" />
        <text x={X(tauUs) + 5} y={Y(0.3)} fill={C.amber} fontSize={11}>τ</text>
        {[0, 50, 100, 150, 200].map(v => <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>)}
        <text x={W / 2} y={Ht - 10} fill={C.textDim} fontSize={11} textAnchor="middle">{isKo ? "온도 점프 이후 시간 [μs]" : "time after the temperature jump [μs]"}</text>
        <text x={W - pad} y={Y(1) - 6} fill={C.textDim} fontSize={10.5} textAnchor="end">{isKo ? "새 평형" : "new equilibrium"}</text>
      </svg>
      <StatGrid min={200}>
        <Stat label="K = K_w / 55.6" value={`${sci(K)} mol dm⁻³`} color={C.textDim} />
        <Stat label={isKo ? "k′ (H⁺ + OH⁻ → H₂O)" : "k′ (H⁺ + OH⁻ → H₂O)"} value={`${sci(kRev)} dm³ mol⁻¹ s⁻¹`} color={C.accent} />
        <Stat label={isKo ? "k (H₂O → H⁺ + OH⁻)" : "k (H₂O → H⁺ + OH⁻)"} value={`${sci(kFwd)} s⁻¹`} color={C.cyan} />
        <Stat label={isKo ? "물 분자 하나가 해리하기까지 1/k" : "wait for one molecule to dissociate, 1/k"} value={`${(1 / kFwd / 3600).toFixed(1)} h`} color={C.amber} />
      </StatGrid>
      <Note>
        {isKo
          ? "강의 예제(τ = 37 μs)를 풀면 1/τ = k′(K + 2K_w^½) ≈ 2.0×10⁻⁷ k′이므로 k′ = 1.4×10¹¹ dm³ mol⁻¹ s⁻¹, k = K·k′ = 2.4×10⁻⁵ s⁻¹입니다. 중화 반응은 용액에서 가장 빠른 반응에 속하며, 보통의 확산 지배 반응(약 10¹⁰ dm³ mol⁻¹ s⁻¹)보다도 빠릅니다. 양성자가 물의 수소결합 그물을 따라 '건너뛰기' 때문입니다. 반대로 물 분자 하나가 스스로 이온화하는 것은 약 11시간에 한 번입니다. 이 극단적인 두 속도의 비가 K_w를 10⁻¹⁴이라는 작은 값으로 만듭니다."
          : "Working the lecture example (τ = 37 μs): 1/τ = k′(K + 2K_w^½) ≈ 2.0×10⁻⁷ k′, so k′ = 1.4×10¹¹ dm³ mol⁻¹ s⁻¹ and k = K·k′ = 2.4×10⁻⁵ s⁻¹. Neutralisation is among the fastest reactions in solution, faster even than ordinary diffusion-controlled reactions (about 10¹⁰ dm³ mol⁻¹ s⁻¹), because the proton hops along water's hydrogen-bond network. In contrast, a given water molecule ionises on its own only about once every 11 hours. The ratio of these two extreme rates is what makes K_w as small as 10⁻¹⁴."}
      </Note>
    </Card>
  );
}

function ArrheniusLab({ isKo }) {
  const [Ea, setEa] = useState(188);            // kJ/mol
  const [logA, setLogA] = useState(12.03);
  const [T, setT] = useState(800);
  const lnk = Tk => logA * Math.LN10 - Ea * 1e3 / (RGAS * Tk);
  const fit = linfit(AC_T.map(v => 1 / v), AC_K.map(Math.log));
  const EaFit = -fit.slope * RGAS / 1e3, AFit = Math.exp(fit.icpt);
  const W = 680, Ht = 300, pad = 54;
  const xMin = 0.9, xMax = 1.5;                 // 1000/T
  const yLo = Math.min(-6, lnk(1000 / xMax) - 1), yHi = Math.max(6, lnk(1000 / xMin) + 1);
  const { X, Y } = plotScale(xMin, xMax, yLo, yHi, W, Ht, pad);
  const cl = v => Math.max(yLo, Math.min(yHi, v));
  const ratio10 = Math.exp(lnk(T + 10) - lnk(T));
  return (
    <Card>
      <Hd>{isKo ? "Arrhenius 실험실: 온도가 속도를 정한다" : "Arrhenius lab: temperature sets the pace"}</Hd>
      <Eq>{"k = A e^(−Ea/RT)      ln k = ln A − Ea/RT      ln(k₂/k₁) = (Ea/R)(1/T₁ − 1/T₂)"}</Eq>
      <Row>
        <Slider label="Ea" value={Ea} min={20} max={300} step={1} onChange={setEa} unit=" kJ/mol" width={170} />
        <Slider label="log₁₀ A" value={logA} min={6} max={16} step={0.01} onChange={setLogA} width={150} fmt={v => v.toFixed(2)} />
        <Slider label="T" value={T} min={680} max={1100} step={5} onChange={setT} unit=" K" width={150} />
        <button onClick={() => { setEa(Math.round(EaFit)); setLogA(Math.round(Math.log10(AFit) * 100) / 100); }} style={{ ...btnStyle(), padding: "6px 12px", fontSize: 12 }}>
          {isKo ? "데이터에 맞춘 값" : "best fit to data"}
        </button>
      </Row>
      <StatGrid>
        <Stat label={`k(${T} K)`} value={sci(Math.exp(lnk(T)))} color={C.accent} />
        <Stat label="e^(−Ea/RT)" value={sci(Math.exp(-Ea * 1e3 / (RGAS * T)))} color={C.cyan} />
        <Stat label={`k(${T + 10} K) / k(${T} K)`} value={ratio10.toFixed(3)} color={C.amber} />
        <Stat label={isKo ? "최소제곱 적합" : "least-squares fit"} value={`${EaFit.toFixed(0)} kJ/mol, ${sci(AFit)}`} color={C.textDim} />
      </StatGrid>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <line x1={pad} y1={Ht - pad} x2={W - pad} y2={Ht - pad} stroke="#334155" />
        <line x1={pad} y1={pad - 6} x2={pad} y2={Ht - pad} stroke="#334155" />
        <line x1={X(xMin)} y1={Y(cl(lnk(1000 / xMin)))} x2={X(xMax)} y2={Y(cl(lnk(1000 / xMax)))} stroke={C.accent} strokeWidth={2.4} />
        {AC_T.map((v, i) => <circle key={v} cx={X(1000 / v)} cy={Y(cl(Math.log(AC_K[i])))} r={5} fill="#0d1117" stroke={C.amber} strokeWidth={2.2} />)}
        <line x1={X(1000 / T)} y1={Ht - pad} x2={X(1000 / T)} y2={Y(cl(lnk(T)))} stroke={C.cyan} strokeDasharray="4 3" />
        {[0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5].map(v => <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v.toFixed(1)}</text>)}
        <text x={W / 2} y={Ht - 10} fill={C.textDim} fontSize={11} textAnchor="middle">1000 / T [K⁻¹]</text>
        <text x={14} y={pad - 14} fill={C.textDim} fontSize={11}>ln k</text>
        <text x={W - pad} y={pad + 4} fill={C.accent} fontSize={11} textAnchor="end">{isKo ? "기울기 = −Ea/R" : "slope = −Ea/R"}</text>
      </svg>
      <Note>
        {isKo
          ? "점은 아세트알데하이드 열분해(2차 반응)의 교재 데이터입니다. ln k를 1/T에 대해 그리면 직선이고, 기울기 −Ea/R에서 Ea ≈ 188 kJ/mol, 절편에서 A ≈ 1.1×10¹² dm³ mol⁻¹ s⁻¹이 나옵니다. Ea 슬라이더를 움직여 직선을 점에서 떼어 보면 기울기가 얼마나 민감한지 알 수 있습니다. 인자 e^(−Ea/RT)는 4주차의 Boltzmann 인자 그대로이며, 충돌하는 분자 가운데 장벽을 넘을 만큼의 에너지를 가진 분율입니다. Maxwell–Boltzmann 분포의 꼬리에 있는 소수만 반응하므로, 온도를 조금만 올려도 그 꼬리가 크게 두꺼워져 속도가 급증합니다. '10도 오르면 속도가 두 배'라는 어림은 실온에서 Ea ≈ 53 kJ/mol인 반응에 해당합니다."
          : "The points are textbook data for the thermal decomposition of acetaldehyde (second order). A plot of ln k against 1/T is a straight line: the slope −Ea/R gives Ea ≈ 188 kJ/mol and the intercept gives A ≈ 1.1×10¹² dm³ mol⁻¹ s⁻¹. Drag the Ea slider to pull the line off the points and see how sensitive the slope is. The factor e^(−Ea/RT) is Week 4's Boltzmann factor unchanged: the fraction of colliding molecules with enough energy to cross the barrier. Only the few in the tail of the Maxwell–Boltzmann distribution react, and a small rise in temperature fattens that tail dramatically. The rule of thumb 'ten degrees doubles the rate' corresponds to Ea ≈ 53 kJ/mol near room temperature."}
      </Note>
    </Card>
  );
}

function CatalystCard({ isKo }) {
  const [Ea, setEa] = useState(76);
  const [dEa, setDEa] = useState(19);
  const [dH, setDH] = useState(-40);
  const [T, setT] = useState(298);
  const speed = Math.exp(dEa * 1e3 / (RGAS * T));
  const W = 680, Ht = 300, pad = 46;
  const yMaxV = Math.max(Ea, 20) * 1.25, yMinV = Math.min(dH, 0) - 20;
  const { X, Y } = plotScale(0, 1, yMinV, yMaxV, W, Ht, pad);
  const prof = Eb => {
    const pts = [];
    for (let j = 0; j <= 200; j++) {
      const s = j / 200;
      const step = dH / (1 + Math.exp(-(s - 0.5) / 0.045));
      const bump = (Eb - dH * 0.5) * Math.exp(-Math.pow((s - 0.5) / 0.13, 2));
      pts.push([s, step + bump]);
    }
    return pts;
  };
  const EaCat = Math.max(Ea - dEa, 1);
  return (
    <Card>
      <Hd>{isKo ? "촉매: 장벽을 낮추되 평형은 건드리지 않는다" : "Catalysts: lower the barrier, leave the equilibrium alone"}</Hd>
      <Row>
        <Slider label={isKo ? "촉매 없는 Ea" : "uncatalysed Ea"} value={Ea} min={30} max={150} step={1} onChange={setEa} unit=" kJ/mol" width={150} />
        <Slider label={isKo ? "촉매가 낮추는 양 ΔEa" : "lowering by catalyst ΔEa"} value={dEa} min={0} max={Math.min(80, Ea - 5)} step={1} onChange={setDEa} unit=" kJ/mol" width={150} />
        <Slider label="ΔH" value={dH} min={-80} max={40} step={2} onChange={setDH} unit=" kJ/mol" width={130} />
        <Slider label="T" value={T} min={250} max={800} step={2} onChange={setT} unit=" K" width={120} />
      </Row>
      <StatGrid>
        <Stat label={isKo ? "정반응 장벽" : "forward barrier"} value={`${Ea} → ${EaCat} kJ/mol`} color={C.accent} />
        <Stat label={isKo ? "역반응 장벽" : "reverse barrier"} value={`${Ea - dH} → ${EaCat - dH} kJ/mol`} color={C.cyan} />
        <Stat label={isKo ? "속도 증가 e^(ΔEa/RT)" : "rate enhancement e^(ΔEa/RT)"} value={speed < 1e4 ? `×${speed.toFixed(0)}` : `×${sci(speed, 1)}`} color={C.amber} />
        <Stat label={isKo ? "평형 상수 K" : "equilibrium constant K"} value={isKo ? "변하지 않음" : "unchanged"} color={C.ok} />
      </StatGrid>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={fullSvg(W)}>
        <line x1={pad} y1={Y(0)} x2={X(0.3)} y2={Y(0)} stroke="#475569" strokeDasharray="3 5" />
        <line x1={X(0.7)} y1={Y(dH)} x2={W - pad} y2={Y(dH)} stroke="#475569" strokeDasharray="3 5" />
        <path d={pathOf(prof(Ea), X, Y)} fill="none" stroke={C.text} strokeWidth={2.4} />
        <path d={pathOf(prof(EaCat), X, Y)} fill="none" stroke={C.err} strokeWidth={2.4} strokeDasharray="7 5" />
        <text x={X(0.06)} y={Y(0) - 8} fill={C.textDim} fontSize={11.5}>{isKo ? "반응물" : "reactants"}</text>
        <text x={X(0.94)} y={Y(dH) - 8} fill={C.textDim} fontSize={11.5} textAnchor="end">{isKo ? "생성물" : "products"}</text>
        <line x1={W - pad - 150} y1={pad - 2} x2={W - pad - 118} y2={pad - 2} stroke={C.text} strokeWidth={2.4} />
        <text x={W - pad - 110} y={pad + 2} fill={C.text} fontSize={11.5}>{isKo ? "촉매 없음" : "no catalyst"}</text>
        <line x1={W - pad - 150} y1={pad + 16} x2={W - pad - 118} y2={pad + 16} stroke={C.err} strokeWidth={2.4} strokeDasharray="7 5" />
        <text x={W - pad - 110} y={pad + 20} fill={C.err} fontSize={11.5}>{isKo ? "촉매 있음" : "with catalyst"}</text>
        <text x={W / 2} y={Ht - 12} fill={C.textDim} fontSize={11} textAnchor="middle">{isKo ? "반응 좌표" : "reaction coordinate"}</text>
        <text x={14} y={pad - 14} fill={C.textDim} fontSize={11}>{isKo ? "에너지 [kJ/mol]" : "energy [kJ/mol]"}</text>
      </svg>
      <Note>
        {isKo
          ? "기본값은 과산화수소 분해입니다. 촉매 없이 76 kJ/mol인 장벽이 요오드화 이온 촉매로 57 kJ/mol이 되면 298 K에서 속도는 e^(19000/RT) ≈ 2,100배가 됩니다. 장벽을 4분의 1만 낮춰도 속도가 수천 배 뛰는 것이 지수 함수의 위력입니다. 촉매는 새로운 반응 경로를 제공할 뿐 반응물과 생성물의 에너지는 바꾸지 않으므로, 정반응과 역반응의 장벽이 똑같이 낮아지고 K = k/k′은 그대로입니다. 촉매는 평형에 도달하는 시간을 줄일 뿐 평형의 위치를 옮기지 못합니다. 반응물과 다른 상인 불균일 촉매(자동차 배기 정화, 암모니아 합성)와 같은 상인 균일 촉매(효소, 산·염기 촉매)로 나뉘며, 화학공정의 대부분이 촉매 위에서 돌아갑니다."
          : "The default is the decomposition of hydrogen peroxide. The uncatalysed barrier of 76 kJ/mol falls to 57 kJ/mol with iodide ion, and at 298 K the rate rises by e^(19000/RT) ≈ 2,100. Lowering the barrier by a quarter multiplies the rate thousands of times: such is the power of the exponential. A catalyst provides a new pathway but does not change the energies of reactants or products, so forward and reverse barriers fall by the same amount and K = k/k′ stays put. A catalyst shortens the time to reach equilibrium; it cannot move the equilibrium. Heterogeneous catalysts are in a different phase from the reactants (car exhaust converters, ammonia synthesis) and homogeneous ones in the same phase (enzymes, acid–base catalysis); most of the chemical industry runs on catalysts."}
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
        q: "P1. 분자량 10 kg/mol인 사슬과 100 kg/mol인 사슬이 같은 개수로 섞여 있다. Mn, Mw, 분산도 Đ를 구하시오.",
        s: "Mn = (10 + 100)/2 = 55.0 kg/mol. Mw = (10² + 100²)/(10 + 100) = 10100/110 = 91.8 kg/mol. Đ = Mw/Mn = 1.67. 개수로는 반반이지만 질량으로는 긴 사슬이 100/110 = 91%를 차지하므로 중량평균이 긴 사슬 쪽으로 끌려갑니다. 삼투압으로 재면 55, 광산란으로 재면 92가 나오는 시료입니다.",
      },
      en: {
        q: "P1. A sample contains equal numbers of chains of molar mass 10 kg/mol and 100 kg/mol. Find Mn, Mw, and the dispersity Đ.",
        s: "Mn = (10 + 100)/2 = 55.0 kg/mol. Mw = (10² + 100²)/(10 + 100) = 10100/110 = 91.8 kg/mol. Đ = Mw/Mn = 1.67. The chains are half and half by number, but the long ones carry 100/110 = 91% of the mass, which drags the weight average towards them. Osmometry would report 55 for this sample and light scattering 92.",
      },
    },
    {
      ko: {
        q: "P2. C–C 결합 4,000개(l = 0.154 nm)로 된 폴리에틸렌 사슬의 윤곽 길이, R_rms, Rg를 (a) 자유 연결 사슬과 (b) 사면체 결합각을 유지하는 사슬에 대해 구하시오.",
        s: "윤곽 길이 Rc = Nl = 4000 × 0.154 = 616 nm (두 모형 공통). (a) R_rms = N^½ l = 63.2 × 0.154 = 9.74 nm, Rg = (N/6)^½ l = 3.98 nm. (b) cos θ = −1/3이므로 F = [(1 + 1/3)/(1 − 1/3)]^½ = √2. R_rms = (2N)^½ l = 13.8 nm, Rg = (N/3)^½ l = 5.62 nm. 616 nm짜리 사슬이 지름 십여 nm의 코일로 뭉쳐 있습니다. 크기는 N이 아니라 √N에 비례하므로 사슬 길이를 100배 늘려도 코일은 10배만 커집니다.",
      },
      en: {
        q: "P2. For a polyethylene chain of 4,000 C–C bonds (l = 0.154 nm), find the contour length, R_rms, and Rg for (a) a freely jointed chain and (b) a chain that keeps the tetrahedral bond angle.",
        s: "Contour length Rc = Nl = 4000 × 0.154 = 616 nm (both models). (a) R_rms = N^½ l = 63.2 × 0.154 = 9.74 nm, Rg = (N/6)^½ l = 3.98 nm. (b) cos θ = −1/3, so F = [(1 + 1/3)/(1 − 1/3)]^½ = √2: R_rms = (2N)^½ l = 13.8 nm and Rg = (N/3)^½ l = 5.62 nm. A 616 nm chain is balled up into a coil a dozen nanometres across. Size scales as √N, not N, so a chain 100 times longer makes a coil only 10 times larger.",
      },
    },
    {
      ko: {
        q: "P3. 마디 길이 l = 0.5 nm인 1차원 랜덤 코일을 298 K에서 ν = n/N = 0.1과 0.5까지 당기는 데 필요한 힘을 구하고 Hooke 법칙 근사와 비교하시오. 온도를 350 K로 올리면 ν = 0.5에서의 힘은 어떻게 되는가?",
        s: "F = (kT/2l) ln[(1+ν)/(1−ν)], kT/2l = (1.381×10⁻²³ × 298)/(2 × 0.5×10⁻⁹) = 4.12 pN. ν = 0.1: 4.12 × ln(1.1/0.9) = 0.826 pN (Hooke νkT/l = 0.823 pN, 0.3% 차이). ν = 0.5: 4.12 × ln 3 = 4.52 pN (Hooke 4.12 pN, 10% 차이). 작은 신장에서는 Hooke 법칙이 훌륭하지만 사슬이 펴질수록 실제 힘이 더 큽니다. 350 K에서는 힘이 T에 비례하므로 4.52 × 350/298 = 5.31 pN으로 커집니다. 복원력이 엔트로피에서 나오기 때문에 뜨거울수록 더 세게 되돌아옵니다.",
      },
      en: {
        q: "P3. A one-dimensional random coil has segment length l = 0.5 nm. Find the force needed to hold it at ν = n/N = 0.1 and 0.5 at 298 K and compare with the Hooke approximation. What happens to the force at ν = 0.5 if the temperature rises to 350 K?",
        s: "F = (kT/2l) ln[(1+ν)/(1−ν)] with kT/2l = 4.12 pN. ν = 0.1: 4.12 × ln(1.1/0.9) = 0.826 pN (Hooke νkT/l = 0.823 pN, 0.3% off). ν = 0.5: 4.12 × ln 3 = 4.52 pN (Hooke 4.12 pN, 10% off). Hooke's law is excellent at small extension but underestimates the force as the chain straightens. At 350 K the force, being proportional to T, rises to 4.52 × 350/298 = 5.31 pN: an entropic spring pulls back harder when hot.",
      },
    },
    {
      ko: {
        q: "P4. 25 ℃ 수용액에서 1:1 전해질의 Debye 길이는 κ⁻¹ = 0.304/√c nm (c는 mol/dm³)이다. (a) 1 mM과 0.15 M에서 κ⁻¹을 구하시오. (b) 강물의 점토 입자가 바다와 만나는 곳에서 가라앉는 이유를 DLVO로 설명하시오. (c) Al³⁺가 Na⁺보다 훨씬 좋은 응집제인 이유는?",
        s: "(a) 1 mM: 0.304/√0.001 = 9.6 nm. 0.15 M: 0.304/√0.15 = 0.78 nm. (b) 점토 표면의 전하가 만드는 이중층 반발은 κ⁻¹ 정도의 거리까지 미칩니다. 강물에서는 반발이 van der Waals 인력보다 멀리 닿아 수십 kT의 장벽이 입자를 떼어 놓습니다. 바닷물(약 0.6 M)에서는 κ⁻¹이 0.4 nm로 줄어 장벽이 사라지고, 충돌한 입자가 인력의 깊은 우물로 떨어져 응집·침강합니다. (c) 임계 응집 농도가 높은 표면 전위 극한에서 z⁻⁶에 비례하므로(Schulze–Hardy), 3가 이온은 1가 이온의 1/729 농도로 같은 일을 합니다.",
      },
      en: {
        q: "P4. For a 1:1 electrolyte in water at 25 ℃ the Debye length is κ⁻¹ = 0.304/√c nm (c in mol/dm³). (a) Find κ⁻¹ at 1 mM and 0.15 M. (b) Use DLVO to explain why river clay settles where the river meets the sea. (c) Why is Al³⁺ a far better coagulant than Na⁺?",
        s: "(a) 1 mM: 0.304/√0.001 = 9.6 nm. 0.15 M: 0.304/√0.15 = 0.78 nm. (b) Double-layer repulsion from the charged clay surface reaches out a distance of about κ⁻¹. In river water it reaches further than the van der Waals attraction and a barrier of tens of kT keeps particles apart. In seawater (about 0.6 M) κ⁻¹ shrinks to 0.4 nm, the barrier disappears, and colliding particles fall into the deep attractive well, coagulate, and settle. (c) The critical coagulation concentration scales as z⁻⁶ in the high-potential limit (Schulze–Hardy), so a trivalent ion does the same job at 1/729 of the concentration of a monovalent one.",
      },
    },
    {
      ko: {
        q: "P5. 2 I(g) + Ar(g) → I₂(g) + Ar(g)의 초기 속도가 [Ar]₀ = 1.0 mmol dm⁻³에서 [I]₀ = 1.0, 2.0, 4.0, 6.0 ×10⁻⁵ mol dm⁻³일 때 각각 8.70×10⁻⁴, 3.48×10⁻³, 1.39×10⁻², 3.13×10⁻² mol dm⁻³ s⁻¹였다. [Ar]₀를 5.0 mmol dm⁻³로 올리면 모든 속도가 5배가 된다. 반응 차수와 속도 상수를 구하시오.",
        s: "[I]₀를 2배(1.0 → 2.0)로 하면 속도가 3.48×10⁻³/8.70×10⁻⁴ = 4.0배, 다시 2배(2.0 → 4.0)로 하면 4.0배, 6배(1.0 → 6.0)로 하면 36배입니다. 따라서 I에 대해 2차. [Ar]₀를 5배 하면 속도가 5배이므로 Ar에 대해 1차. v₀ = k[I]₀²[Ar]₀, 전체 3차. k = 8.70×10⁻⁴ / [(1.0×10⁻⁵)² × 1.0×10⁻³] = 8.7×10⁹ dm⁶ mol⁻² s⁻¹. 로그–로그 그림의 기울기로 구해도 2.00과 1.00이 나옵니다.",
      },
      en: {
        q: "P5. For 2 I(g) + Ar(g) → I₂(g) + Ar(g) with [Ar]₀ = 1.0 mmol dm⁻³, the initial rates at [I]₀ = 1.0, 2.0, 4.0, 6.0 ×10⁻⁵ mol dm⁻³ were 8.70×10⁻⁴, 3.48×10⁻³, 1.39×10⁻², 3.13×10⁻² mol dm⁻³ s⁻¹. Raising [Ar]₀ to 5.0 mmol dm⁻³ multiplies every rate by 5. Find the orders and the rate constant.",
        s: "Doubling [I]₀ (1.0 → 2.0) multiplies the rate by 3.48×10⁻³/8.70×10⁻⁴ = 4.0; doubling again (2.0 → 4.0) by 4.0; a sixfold increase (1.0 → 6.0) by 36. So the reaction is second order in I. A fivefold increase in [Ar]₀ gives a fivefold rate, so first order in Ar. v₀ = k[I]₀²[Ar]₀, third order overall, with k = 8.70×10⁻⁴ / [(1.0×10⁻⁵)² × 1.0×10⁻³] = 8.7×10⁹ dm⁶ mol⁻² s⁻¹. The log–log slopes give 2.00 and 1.00 as well.",
      },
    },
    {
      ko: {
        q: "P6. 600 K에서 아조메테인의 분압이 0, 1000, 2000, 3000, 4000 s에 10.9, 7.63, 5.32, 3.71, 2.59 Pa였다. (a) 1차 반응임을 확인하고 k와 반감기를 구하시오. (b) 분압이 처음의 10%로 떨어지는 데 걸리는 시간은?",
        s: "(a) ln(p/p₀) = 0, −0.357, −0.717, −1.078, −1.437. 1000 s마다 약 −0.36씩 일정하게 줄어드므로 ln p 대 t가 직선이고 1차 반응입니다. 기울기에서 k = 3.6×10⁻⁴ s⁻¹, t½ = ln2/k = 1.9×10³ s. 확인: 2000 s(반감기 한 번 남짓)에 p/p₀ = 0.488, 4000 s에 0.238 ≈ 0.488². (b) ln(0.10) = −kt이므로 t = ln10/k = 2.303/3.6×10⁻⁴ = 6.4×10³ s, 반감기의 약 3.3배입니다.",
      },
      en: {
        q: "P6. At 600 K the partial pressure of azomethane was 10.9, 7.63, 5.32, 3.71, 2.59 Pa at 0, 1000, 2000, 3000, 4000 s. (a) Confirm that the reaction is first order and find k and the half-life. (b) How long until the pressure has fallen to 10% of its initial value?",
        s: "(a) ln(p/p₀) = 0, −0.357, −0.717, −1.078, −1.437: it drops by about 0.36 every 1000 s, so ln p against t is linear and the reaction is first order. The slope gives k = 3.6×10⁻⁴ s⁻¹ and t½ = ln2/k = 1.9×10³ s. Check: p/p₀ = 0.488 at 2000 s and 0.238 ≈ 0.488² at 4000 s. (b) ln(0.10) = −kt, so t = ln10/k = 2.303/3.6×10⁻⁴ = 6.4×10³ s, about 3.3 half-lives.",
      },
    },
    {
      ko: {
        q: "P7. 물의 자동 이온화 H₂O ⇌ H⁺ + OH⁻는 298 K에서 K_w = 1.008×10⁻¹⁴이고, 온도 점프 뒤 완화 시간이 37 μs였다. 정반응이 1차, 역반응이 2차일 때 두 속도 상수를 구하시오.",
        s: "평형에서 벗어난 양을 x라 하면 dx/dt = −[k + k′([H⁺]eq + [OH⁻]eq)]x (x² 항 무시)이므로 1/τ = k + k′([H⁺]eq + [OH⁻]eq). K = k/k′ = [H⁺][OH⁻]/[H₂O] = K_w/55.6 = 1.81×10⁻¹⁶ mol dm⁻³, [H⁺]eq = [OH⁻]eq = K_w^½ = 1.004×10⁻⁷. 1/τ = k′(K + 2K_w^½) = k′ × 2.01×10⁻⁷. 따라서 k′ = (1/37×10⁻⁶)/2.01×10⁻⁷ = 1.4×10¹¹ dm³ mol⁻¹ s⁻¹, k = K·k′ = 2.4×10⁻⁵ s⁻¹. 역반응은 용액 반응 가운데 최고 수준으로 빠르고, 정반응은 분자 하나당 11시간에 한 번꼴입니다.",
      },
      en: {
        q: "P7. For the autoprotolysis of water, H₂O ⇌ H⁺ + OH⁻, K_w = 1.008×10⁻¹⁴ at 298 K and the relaxation time after a temperature jump is 37 μs. Taking the forward reaction as first order and the reverse as second order, find both rate constants.",
        s: "With x the displacement from equilibrium, dx/dt = −[k + k′([H⁺]eq + [OH⁻]eq)]x (dropping x²), so 1/τ = k + k′([H⁺]eq + [OH⁻]eq). K = k/k′ = [H⁺][OH⁻]/[H₂O] = K_w/55.6 = 1.81×10⁻¹⁶ mol dm⁻³ and [H⁺]eq = [OH⁻]eq = K_w^½ = 1.004×10⁻⁷. Then 1/τ = k′(K + 2K_w^½) = k′ × 2.01×10⁻⁷, giving k′ = (1/37×10⁻⁶)/2.01×10⁻⁷ = 1.4×10¹¹ dm³ mol⁻¹ s⁻¹ and k = K·k′ = 2.4×10⁻⁵ s⁻¹. The reverse reaction is about as fast as solution reactions get; the forward one happens once per molecule every 11 hours.",
      },
    },
    {
      ko: {
        q: "P8. (a) 온도가 298 K에서 308 K로 오를 때 속도가 정확히 두 배가 되는 반응의 활성화 에너지를 구하시오. (b) 과산화수소 분해의 활성화 에너지는 촉매 없이 76 kJ/mol, 요오드화 이온 촉매에서 57 kJ/mol이다. A가 같다고 할 때 298 K에서 속도는 몇 배가 되는가? 촉매는 평형 상수를 바꾸는가?",
        s: "(a) ln(k₂/k₁) = (Ea/R)(1/T₁ − 1/T₂)에서 ln 2 = (Ea/8.314)(1/298 − 1/308) = (Ea/8.314)(1.090×10⁻⁴). Ea = 0.693 × 8.314/1.090×10⁻⁴ = 52.9 kJ/mol. '10도에 두 배'는 Ea가 약 50 kJ/mol인 반응의 이야기이고, Ea = 100 kJ/mol이면 같은 구간에서 3.7배가 됩니다. (b) k_cat/k = e^(ΔEa/RT) = e^(19000/(8.314 × 298)) = e^7.67 ≈ 2.1×10³배. 촉매는 정반응과 역반응의 장벽을 같은 양만큼 낮추므로 k와 k′이 같은 배율로 커지고 K = k/k′은 변하지 않습니다.",
      },
      en: {
        q: "P8. (a) Find the activation energy of a reaction whose rate exactly doubles between 298 K and 308 K. (b) The activation energy of hydrogen peroxide decomposition is 76 kJ/mol uncatalysed and 57 kJ/mol with iodide ion. Assuming the same A, by what factor does the rate increase at 298 K? Does the catalyst change the equilibrium constant?",
        s: "(a) From ln(k₂/k₁) = (Ea/R)(1/T₁ − 1/T₂): ln 2 = (Ea/8.314)(1/298 − 1/308) = (Ea/8.314)(1.090×10⁻⁴), so Ea = 52.9 kJ/mol. 'Doubling every ten degrees' describes reactions with Ea near 50 kJ/mol; with Ea = 100 kJ/mol the same interval gives a factor of 3.7. (b) k_cat/k = e^(ΔEa/RT) = e^(19000/(8.314 × 298)) = e^7.67 ≈ 2.1×10³. A catalyst lowers the forward and reverse barriers by the same amount, so k and k′ grow by the same factor and K = k/k′ is unchanged.",
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
            ? "풀이를 열기 전에 스스로 풀어 보십시오. P1–P4는 고분자와 콜로이드, P5–P8은 반응속도론입니다. P5–P7은 강의 예제를 그대로 따라가며 확인하는 문제입니다."
            : "Attempt each before opening the solution. P1–P4 cover macromolecules and colloids, P5–P8 kinetics. P5–P7 retrace the lecture examples."}
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
  polymer_chain: {
    ko: "고분자: 평균 분자량·랜덤 코일·엔트로피 힘", en: "Polymers: molar masses · random coils · entropic force",
    codes: { python: PY_POLYMER, matlab: ML_POLYMER, julia: JL_POLYMER, cpp: CPP_POLYMER },
  },
  dlvo_micelle: {
    ko: "콜로이드: DLVO·임계 응집 농도·미셀", en: "Colloids: DLVO · critical coagulation · micelles",
    codes: { python: PY_DLVO, matlab: ML_DLVO, julia: JL_DLVO, cpp: CPP_DLVO },
  },
  rate_laws: {
    ko: "속도론 I: 초기 속도법·적분 속도식", en: "Kinetics I: initial rates · integrated rate laws",
    codes: { python: PY_RATES, matlab: ML_RATES, julia: JL_RATES, cpp: CPP_RATES },
  },
  relaxation_arrhenius: {
    ko: "속도론 II: 평형 접근·온도 점프·Arrhenius", en: "Kinetics II: equilibrium · T-jump · Arrhenius",
    codes: { python: PY_RELAX, matlab: ML_RELAX, julia: JL_RELAX, cpp: CPP_RELAX },
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
  const [topic, setTopic] = useState("polymer_chain");
  const [cl, setCl] = useState("python");
  const [copied, setCopied] = useState(false);
  const code = CODE_TOPICS[topic].codes[cl];
  const fname = `wk06_${topic}.${LANG_META[cl].ext}`;

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
            ? "이 페이지의 인터랙티브 뒤에 있는 계산을 직접 실행해 볼 수 있는 독립 코드입니다. Python과 C++은 실행해 확인한 값입니다: Schulz–Flory Đ = 1 + p, 자유 연결 사슬 ⟨R²⟩ = Nl²·Rg² = Nl²/6(1차원과 3차원 모두), 사면체 사슬 ⟨R²⟩/Nl² = 2, Debye 길이 0.304/√c nm, 임계 응집 농도 62.3 mM(해석식과 수치해 일치), 초기 속도법 차수 2.00과 1.00·k = 8.7×10⁹, 아조메테인 k = 3.60×10⁻⁴ s⁻¹, 온도 점프 k′ = 1.35×10¹¹·k = 2.44×10⁻⁵, Arrhenius 적합 Ea = 188 kJ/mol."
            : "Standalone codes for the calculations behind every interactive on this page. The Python and C++ versions were run and give: Schulz–Flory Đ = 1 + p; freely jointed chain ⟨R²⟩ = Nl² and Rg² = Nl²/6 (in both 1D and 3D); tetrahedral chain ⟨R²⟩/Nl² = 2; Debye length 0.304/√c nm; critical coagulation concentration 62.3 mM (analytic and numerical agree); initial-rate orders 2.00 and 1.00 with k = 8.7×10⁹; azomethane k = 3.60×10⁻⁴ s⁻¹; T-jump k′ = 1.35×10¹¹ and k = 2.44×10⁻⁵; Arrhenius fit Ea = 188 kJ/mol."}
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
