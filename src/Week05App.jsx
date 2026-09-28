// ============================================================
// Week05App.jsx — Intermolecular Forces & Liquids
// Physical Chemistry 2 (물리화학 2)
// SKKU School of Chemical Engineering
// Smart Process & Materials Design Lab (SPMDL)
// Prof. S. Joon Kwon
// ------------------------------------------------------------
// Topics covered (Wk05 Part 1 / Part 2):
//   • Electric properties of molecules — dipole moments (Debye),
//     vector addition, polarizability, orientation polarization,
//     Debye equation & Clausius-Mossotti, refractive index
//   • Intermolecular forces — charge-dipole, dipole-dipole,
//     Keesom / induction / London (all −C/r⁶), hydrogen bonding,
//     Lennard-Jones potential, MD force fields
//   • Liquids — radial distribution function g(r), cohesion,
//     surface tension, Young-Laplace equation, capillary rise
//   • Wetting & curvature — Young's equation, contact angles,
//     work of adhesion, surfactants & CMC, Kelvin equation,
//     Ostwald ripening
// ============================================================
import { useState, useEffect, useRef, useMemo } from "react";
import {
  PY_DIPOLE, ML_DIPOLE, JL_DIPOLE, CPP_DIPOLE,
  PY_VDW, ML_VDW, JL_VDW, CPP_VDW,
  PY_LJMD, ML_LJMD, JL_LJMD, CPP_LJMD,
  PY_CAP, ML_CAP, JL_CAP, CPP_CAP,
} from "./Week05Codes";

// ── i18n ─────────────────────────────────────────────────────
const i18n = {
  ko: {
    weekTitle: "Week 5 — 분자간 힘과 액체",
    subtitle: "쌍극자 · van der Waals 힘 · Lennard-Jones MD · 표면장력 · 젖음 · Kelvin 식",
    tabs: {
      overview: "개요",
      dipole: "쌍극자 & 편극",
      forces: "분자간 힘",
      lj: "LJ 분자동역학",
      surface: "표면장력",
      wetting: "젖음 & 곡률",
      practice: "연습문제",
      codes: "Raw 코드",
    },
  },
  en: {
    weekTitle: "Week 5 — Intermolecular Forces & Liquids",
    subtitle: "Dipoles · van der Waals forces · Lennard-Jones MD · Surface tension · Wetting · Kelvin equation",
    tabs: {
      overview: "Overview",
      dipole: "Dipoles & Polarization",
      forces: "Intermolecular Forces",
      lj: "LJ Molecular Dynamics",
      surface: "Surface Tension",
      wetting: "Wetting & Curvature",
      practice: "Practice",
      codes: "Raw Codes",
    },
  },
};

// ── design tokens (Week 5 accent: pink) ──────────────────────
const C = {
  bg: "#0b0f17",
  panel: "#111827",
  card: "#1f2937",
  border: "#374151",
  text: "#e5e7eb",
  textDim: "#9ca3af",
  accent: "#f472b6",
  accentSoft: "#f9a8d4",
  amber: "#f59e0b",
  sky: "#38bdf8",
  blueSoft: "#60a5fa",
  ok: "#10b981",
  err: "#ef4444",
  purple: "#a78bfa",
  cyan: "#22d3ee",
  emerald: "#34d399",
};

// physical constants
const EPS0 = 8.8541878128e-12;
const KB = 1.380649e-23;
const NAV = 6.02214076e23;
const DEBYE = 3.33564e-30;
const EVJ = 1.602176634e-19;
const RGAS = 8.314462618;
const GRAV = 9.80665;

// =============================================================
// MAIN COMPONENT
// =============================================================
export default function Week05App({ onBack, lang: langProp, onLangChange }) {
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
        {tab === "dipole" && <DipoleTab lang={lang} />}
        {tab === "forces" && <ForcesTab lang={lang} />}
        {tab === "lj" && <LJTab lang={lang} />}
        {tab === "surface" && <SurfaceTab lang={lang} />}
        {tab === "wetting" && <WettingTab lang={lang} />}
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
    background: active ? "rgba(244,114,182,0.14)" : "transparent",
    color: active ? C.accentSoft : C.textDim,
    border: `1px solid ${active ? "rgba(244,114,182,0.4)" : "transparent"}`,
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

// =============================================================
// 1) OVERVIEW
// =============================================================
function Overview({ lang }) {
  const isKo = lang === "ko";
  const timeline = [
    { yr: "1805", who: "Young & Laplace", ko: "곡면의 압력 ΔP = σ(1/R₁+1/R₂) — 계면과학의 출발", en: "Curved-surface pressure ΔP = σ(1/R₁+1/R₂) — interfacial science begins", c: C.cyan },
    { yr: "1871", who: "Kelvin", ko: "작은 방울일수록 증기압이 높다 — 곡률의 열역학", en: "Smaller droplets have higher vapor pressure — thermodynamics of curvature", c: C.cyan },
    { yr: "1873", who: "van der Waals", ko: "기체도 서로 끌린다: (P + a/V²)(V − b) = nRT", en: "Even gases attract: (P + a/V²)(V − b) = nRT", c: C.amber },
    { yr: "1912", who: "Debye", ko: "쌍극자 모멘트로 분자 구조를 읽다 (단위 D의 그 Debye)", en: "Reading molecular structure from dipole moments (the D of debye)", c: C.accent },
    { yr: "1917", who: "Langmuir", ko: "단분자막과 계면 화학 (1932 노벨상)", en: "Monolayers and surface chemistry (Nobel 1932)", c: C.emerald },
    { yr: "1921", who: "Keesom", ko: "회전하는 쌍극자쌍의 평균 인력 ∝ 1/r⁶", en: "Average attraction of rotating dipole pairs ∝ 1/r⁶", c: C.accent },
    { yr: "1924", who: "Lennard-Jones", ko: "12-6 퍼텐셜 — 분자 시뮬레이션의 표준 모델", en: "The 12-6 potential — the standard model of molecular simulation", c: C.purple },
    { yr: "1930", who: "London", ko: "무극성 분자도 끌리는 이유: 양자 요동의 분산력", en: "Why nonpolar molecules attract: dispersion from quantum fluctuations", c: C.purple },
    { yr: "2013", who: "Karplus · Levitt · Warshel", ko: "다중스케일 분자 시뮬레이션 — 노벨 화학상", en: "Multiscale molecular simulation — Nobel Prize in Chemistry", c: C.ok },
  ];
  return (
    <div>
      <Card>
        <Hd>{isKo ? "지난주에서 이번 주로: 분자 하나에서 분자들 사이로" : "From last week: from one molecule to the space between them"}</Hd>
        <Note>
          {isKo
            ? "4주차까지 우리는 분자 하나의 내부(전자 상태)와 이상기체(상호작용 없음)를 다뤘습니다. 이번 주는 그 사이의 빈칸 — 분자와 분자 사이에 작용하는 힘 — 을 채웁니다. 앞 절반: 쌍극자와 편극성이라는 두 재료로 Keesom·유도·London 힘이 모두 −C/r⁶ 꼴로 나오고, 척력과 합치면 Lennard-Jones 퍼텐셜이 됩니다. 뒤 절반: 이 작은 힘이 10²³개 모이면 액체가 응축하고, 표면이 팽팽해지고(표면장력), 물이 유리관을 기어오르고, 작은 방울이 큰 방울에게 먹힙니다(Ostwald 숙성). London의 양자역학(2~4주차!)이 국수 한 그릇의 표면장력까지 이어지는 주간입니다."
            : "Through Week 4 we treated the inside of one molecule (electronic states) and the ideal gas (no interactions). This week fills the gap between: the forces molecules exert on each other. First half: from just two ingredients — dipole moment and polarizability — the Keesom, induction, and London forces all emerge as −C/r⁶, and adding repulsion gives the Lennard-Jones potential. Second half: multiply this tiny force by 10²³ and liquids condense, surfaces tighten (surface tension), water climbs glass tubes, and small droplets feed large ones (Ostwald ripening). A week that runs from London's quantum mechanics (Weeks 2–4!) all the way to the surface of a bowl of soup."}
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
            { name: isKo ? "몰편극 (Debye 식)" : "Molar polarization (Debye)", eq: "Pm = (NA/3ε₀)(α + μ²/3kT)", c: C.accent },
            { name: isKo ? "van der Waals 인력" : "van der Waals attraction", eq: "⟨V⟩ = −C/r⁶ (Keesom·유도·London)", c: C.purple },
            { name: "Lennard-Jones", eq: "V = 4ε[(r₀/r)¹² − (r₀/r)⁶]", c: C.amber },
            { name: "Young-Laplace · Kelvin", eq: "ΔP = 2σ/r,  p = p*e^{2σVm/rRT}", c: C.cyan },
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
          isKo ? "결합 쌍극자의 벡터 합 μres = 2μ₁cos(θ/2)로 이성질체(o/m/p-다이클로로벤젠)의 쌍극자를 예측할 수 있다." : "Predict isomer dipoles (o/m/p-dichlorobenzene) from the vector sum μres = 2μ₁cos(θ/2).",
          isKo ? "편극성 α와 배향 편극 μ²/3kT를 구분하고, Debye 플롯(Pm vs 1/T)에서 μ와 α를 동시에 추출할 수 있다." : "Distinguish polarizability α from orientation polarization μ²/3kT; extract both μ and α from a Debye plot (Pm vs 1/T).",
          isKo ? "Clausius-Mossotti 식으로 분자 편극성에서 유전율과 굴절률 n = √εr을 예측할 수 있다." : "Predict dielectric constant and refractive index n = √εr from molecular polarizability via Clausius-Mossotti.",
          isKo ? "Keesom·유도·London 힘의 C 계수를 계산하고, 대부분의 분자쌍에서 분산력이 지배함을 정량적으로 보일 수 있다." : "Compute the C coefficients of Keesom, induction, and London forces and show quantitatively that dispersion dominates most pairs.",
          isKo ? "Lennard-Jones 퍼텐셜의 최소점 2^{1/6}r₀·우물깊이 ε을 해석하고, MD 시뮬레이션에서 온도에 따른 기체↔액체 전이를 관찰할 수 있다." : "Interpret the LJ minimum at 2^{1/6}r₀ and well depth ε; observe the gas↔liquid transition with temperature in an MD simulation.",
          isKo ? "동경분포함수 g(r)로 기체·액체·결정의 질서를 구분할 수 있다." : "Distinguish gas, liquid, and crystal order using the radial distribution function g(r).",
          isKo ? "Young-Laplace 식을 유도하고 모세관 상승 σ = ρgha/2cosθ로 표면장력을 측정할 수 있다." : "Derive the Young-Laplace equation and measure surface tension via capillary rise σ = ρgha/2cosθ.",
          isKo ? "Young 방정식으로 접촉각과 젖음을 판정하고, Kelvin 식으로 곡률에 따른 증기압 상승과 Ostwald 숙성을 설명할 수 있다." : "Judge wetting via Young's equation and contact angles; explain curvature-enhanced vapor pressure and Ostwald ripening via the Kelvin equation.",
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
    { t: isKo ? "쌍극자·편극성" : "Dipoles & polarizability", s: "μ, α", c: C.accent },
    { t: isKo ? "van der Waals 힘" : "van der Waals forces", s: "−C/r⁶", c: C.purple },
    { t: "Lennard-Jones", s: "4ε[(r₀/r)¹²−(r₀/r)⁶]", c: C.amber },
    { t: isKo ? "액체·g(r)" : "Liquids · g(r)", s: isKo ? "응축!" : "condensation!", c: C.emerald },
    { t: isKo ? "표면·곡률" : "Surfaces & curvature", s: "2σ/r", c: C.cyan },
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
// 2) DIPOLES & POLARIZATION
// =============================================================
function DipoleTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <Card>
        <Hd>{isKo ? "쌍극자 모멘트: 분자의 전기적 지문" : "The dipole moment: a molecule's electric fingerprint"}</Hd>
        <Eq>μ = QR,   1 D (debye) = 3.33564×10⁻³⁰ C·m   ({isKo ? "e·1Å ≈ 4.8 D — 작은 분자는 보통 ~1 D" : "e·1Å ≈ 4.8 D — small molecules are typically ~1 D"})</Eq>
        <Note>
          {isKo
            ? "전기음성도 차이가 결합에 부분전하를 남기면 영구 쌍극자가 생깁니다(극성 분자). 무극성 분자도 전기장 안에서는 전자구름이 일그러져 유도 쌍극자를 가집니다 — 장을 끄면 사라지는 일시적 쌍극자입니다. 분자의 쌍극자는 결합 쌍극자들의 벡터 합이므로, 기하학이 곧 전기적 성질을 결정합니다:"
            : "Electronegativity differences leave partial charges on bonds, creating a permanent dipole (polar molecules). Even nonpolar molecules acquire an induced dipole in a field as their electron cloud distorts — temporary, vanishing with the field. A molecule's dipole is the vector sum of its bond dipoles, so geometry dictates electric character:"}
        </Note>
        <VectorAddLab isKo={isKo} />
      </Card>
      <DebyePlotLab isKo={isKo} />
      <FreqPolarCard isKo={isKo} />
    </div>
  );
}

// -- vector addition of bond dipoles -------------------------
function VectorAddLab({ isKo }) {
  const [th, setTh] = useState(60);
  const mu1 = 1.57;
  const mures = 2 * mu1 * Math.cos((th * Math.PI / 180) / 2);
  const presets = [
    { lb: "ortho (60°)", th: 60, obs: 2.25 },
    { lb: "meta (120°)", th: 120, obs: 1.48 },
    { lb: "para (180°)", th: 180, obs: 0.0 },
  ];
  const cur = presets.find(p => Math.abs(p.th - th) < 3);
  const W = 380, Ht = 260, cx0 = 130, cy0 = 170, sc = 46;
  const a1 = -th / 2 * Math.PI / 180, a2 = th / 2 * Math.PI / 180;
  const v1 = [Math.cos(a1) * mu1 * sc, Math.sin(a1) * mu1 * sc];
  const v2 = [Math.cos(a2) * mu1 * sc, Math.sin(a2) * mu1 * sc];
  const vr = [v1[0] + v2[0], v1[1] + v2[1]];
  const arrow = (x1, y1, x2, y2, color, wdt) => {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const ah = 9;
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={wdt} />
        <path d={`M ${x2} ${y2} L ${x2 - ah * Math.cos(ang - 0.42)} ${y2 - ah * Math.sin(ang - 0.42)} L ${x2 - ah * Math.cos(ang + 0.42)} ${y2 - ah * Math.sin(ang + 0.42)} Z`} fill={color} />
      </g>
    );
  };
  return (
    <div>
      <Eq>μres = 2μ₁cos(θ/2)   ({isKo ? "같은 크기 μ₁ 두 개, 사이각 θ" : "two equal arms μ₁ at angle θ"})</Eq>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", margin: "8px 0" }}>
        <Slider label={isKo ? "사이각 θ" : "angle θ"} value={th} min={0} max={180} step={1} onChange={setTh} unit="°" width={200} />
        {presets.map(p => (
          <button key={p.lb} onClick={() => setTh(p.th)} style={{ ...btnStyle(Math.abs(th - p.th) < 3), padding: "5px 11px", fontSize: 12 }}>{p.lb}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
        <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={svgBox(W)}>
          <circle cx={cx0} cy={cy0} r={4} fill={C.textDim} />
          {arrow(cx0, cy0, cx0 + v1[0], cy0 + v1[1], C.sky, 2.4)}
          {arrow(cx0, cy0, cx0 + v2[0], cy0 + v2[1], C.sky, 2.4)}
          {arrow(cx0, cy0, cx0 + vr[0], cy0 + vr[1], C.accent, 3.2)}
          <line x1={cx0 + v1[0]} y1={cy0 + v1[1]} x2={cx0 + vr[0]} y2={cy0 + vr[1]} stroke="#3b4a61" strokeDasharray="4 4" />
          <line x1={cx0 + v2[0]} y1={cy0 + v2[1]} x2={cx0 + vr[0]} y2={cy0 + vr[1]} stroke="#3b4a61" strokeDasharray="4 4" />
          <text x={cx0 + v1[0] * 0.65 - 8} y={cy0 + v1[1] * 0.65 - 8} fill={C.sky} fontSize={12}>μ₁</text>
          <text x={cx0 + v2[0] * 0.65 - 8} y={cy0 + v2[1] * 0.65 + 16} fill={C.sky} fontSize={12}>μ₁</text>
          <text x={cx0 + vr[0] + 10} y={cy0 + vr[1] + 4} fill={C.accent} fontSize={13} fontWeight={700}>μres</text>
        </svg>
        <div style={{ minWidth: 250 }}>
          <div style={{ display: "grid", gap: 10 }}>
            <Stat label={isKo ? "계산값 (μ₁ = 1.57 D, 클로로벤젠)" : "calculated (μ₁ = 1.57 D, chlorobenzene)"} value={`${mures.toFixed(2)} D`} color={C.accent} />
            {cur && <Stat label={isKo ? `${cur.lb} 실측값` : `${cur.lb} observed`} value={`${cur.obs.toFixed(2)} D`} color={C.emerald} />}
          </div>
          <Note>
            {isKo
              ? "다이클로로벤젠: ortho(60°) 계산 2.72 vs 실측 2.25, meta(120°) 1.57 vs 1.48, para(180°) 0 vs 0. 기하학만으로 서열이 정확히 나오고, 잔차는 유도 효과·입체 반발의 몫입니다. 실험실에서 이성질체를 쌍극자로 구별하는 고전적 방법입니다."
              : "Dichlorobenzene: ortho (60°) calc 2.72 vs obs 2.25, meta (120°) 1.57 vs 1.48, para (180°) 0 vs 0. Geometry alone nails the ordering; the residuals belong to induction and sterics. The classic laboratory trick for telling isomers apart."}
          </Note>
        </div>
      </div>
    </div>
  );
}

// -- Debye plot lab ------------------------------------------
function DebyePlotLab({ isKo }) {
  const [muD, setMuD] = useState(1.85);
  const [alphaP, setAlphaP] = useState(1.48);
  const W = 620, Ht = 280, pad = 52;
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const T = 300 + 200 * i / 40;
    const Pm = NAV / (3 * EPS0) * (4 * Math.PI * EPS0 * alphaP * 1e-30 + Math.pow(muD * DEBYE, 2) / (3 * KB * T));
    pts.push([1000 / T, Pm * 1e6]);       // cm^3/mol
  }
  const yMin = Math.min(...pts.map(p => p[1])), yMax = Math.max(...pts.map(p => p[1]));
  const { X, Y } = usePlotScale(1.9, 3.4, yMin * 0.9, yMax * 1.06, W, Ht, pad);
  const orient = Pv => NAV / (3 * EPS0) * Math.pow(muD * DEBYE, 2) / (3 * KB * (1000 / Pv)) * 1e6;
  const interc = NAV / (3 * EPS0) * 4 * Math.PI * EPS0 * alphaP * 1e-30 * 1e6;
  return (
    <Card>
      <Hd>{isKo ? "Debye 플롯: 한 실험으로 μ와 α를 동시에" : "The Debye plot: one experiment, both μ and α"}</Hd>
      <Eq>
        Pm = (NA/3ε₀)(α + μ²/3kT),   (εr−1)/(εr+2) = ρPm/M   →   Pm vs 1/T {isKo ? "는 직선!" : "is a LINE!"}
      </Eq>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", margin: "8px 0" }}>
        <Slider label="μ" value={muD} min={0} max={3} step={0.05} onChange={setMuD} unit=" D" width={170} fmt={v => v.toFixed(2)} />
        <Slider label="α′" value={alphaP} min={0.5} max={11} step={0.1} onChange={setAlphaP} unit="×10⁻³⁰ m³" width={170} fmt={v => v.toFixed(1)} />
        <Pill color={C.accent}>{isKo ? "기울기 ∝ μ²" : "slope ∝ μ²"}</Pill>
        <Pill color={C.cyan}>{isKo ? "절편 ∝ α" : "intercept ∝ α"} = {interc.toFixed(1)} cm³/mol</Pill>
      </div>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={{ ...svgBox(W), flex: "none", width: "100%", maxWidth: W }}>
        <path d={pathOf(pts, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.6} />
        {/* orientation vs distortion shading at left edge */}
        {pts.filter((_, i) => i % 8 === 0).map(([xv, yv], i) => (
          <circle key={i} cx={X(xv)} cy={Y(yv)} r={4} fill={C.accentSoft} />
        ))}
        {[2.0, 2.4, 2.8, 3.2].map(v => (
          <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v.toFixed(1)}</text>
        ))}
        <text x={W / 2} y={Ht - 10} fill={C.textDim} fontSize={11} textAnchor="middle">1000/T [K⁻¹]</text>
        <text x={16} y={pad - 10} fill={C.textDim} fontSize={11}>Pm [cm³/mol]</text>
      </svg>
      <Note>
        {isKo
          ? "μ를 0으로 내려 보세요 — 직선이 수평이 됩니다: 무극성 분자는 온도 의존이 없습니다(왜곡 편극만 남음). 반대로 α′를 줄이면 절편이 내려갑니다. 실제 실험에서는 여러 온도에서 εr을 재서 이 직선을 그리고, 기울기에서 μ, 절편에서 α를 읽습니다 — 1912년 Debye가 분자 구조론에 준 첫 정량 도구이며, 그의 이름이 단위(D)가 된 이유입니다. 배향 항 μ²/3kT의 1/T은 4주차 Boltzmann 인자에서 온 것입니다: 열운동이 정렬을 방해합니다."
          : "Slide μ to zero — the line goes flat: nonpolar molecules have no temperature dependence (only distortion polarization remains). Lower α′ and the intercept drops. Experimentally one measures εr at several temperatures, draws this line, and reads μ from the slope and α from the intercept — the first quantitative tool Debye (1912) handed structural chemistry, and why the unit bears his name. The 1/T in the orientation term μ²/3kT comes straight from Week 4's Boltzmann factor: thermal motion fights alignment."}
      </Note>
    </Card>
  );
}

// -- frequency dependence of polarization --------------------
function FreqPolarCard({ isKo }) {
  const [logF, setLogF] = useState(2);
  const W = 680, Ht = 250, pad = 50;
  const { X, Y } = usePlotScale(0, 17, 0, 3.4, W, Ht, pad);
  const sig = (x, x0) => 1 / (1 + Math.exp((x - x0) * 2.2));
  const curve = [];
  for (let i = 0; i <= 340; i++) {
    const lf = 17 * i / 340;
    curve.push([lf, 1 + 0.9 * sig(lf, 14.8) + 0.5 * sig(lf, 12.5) + 0.9 * sig(lf, 9.5)]);
  }
  const at = lf => 1 + 0.9 * sig(lf, 14.8) + 0.5 * sig(lf, 12.5) + 0.9 * sig(lf, 9.5);
  const mech = logF < 9.5 ? (isKo ? "배향 + 이온 + 전자" : "orientation + ionic + electronic")
    : logF < 12.5 ? (isKo ? "이온 + 전자 (쌍극자 탈락)" : "ionic + electronic (dipoles dropped out)")
    : logF < 14.8 ? (isKo ? "전자만 (이온 탈락)" : "electronic only (ions dropped out)")
    : (isKo ? "전자도 못 따라감 → εr → 1" : "even electrons fail → εr → 1");
  return (
    <Card>
      <Hd>{isKo ? "편극의 주파수 의존성: 누가 장을 따라갈 수 있는가" : "Frequency dependence: who can keep up with the field?"}</Hd>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", margin: "8px 0" }}>
        <Slider label="log₁₀(f/Hz)" value={logF} min={0} max={17} step={0.1} onChange={setLogF} width={230} fmt={v => v.toFixed(1)} />
        <Pill color={C.accent}>{mech}</Pill>
      </div>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={{ ...svgBox(W), flex: "none", width: "100%", maxWidth: W }}>
        <path d={pathOf(curve, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.6} />
        <line x1={X(logF)} y1={Y(0)} x2={X(logF)} y2={Y(at(logF))} stroke={C.amber} strokeWidth={2} strokeDasharray="4 3" />
        <circle cx={X(logF)} cy={Y(at(logF))} r={5} fill={C.amber} />
        {[[3, isKo ? "라디오" : "radio"], [9, isKo ? "마이크로파" : "microwave"], [13, "IR"], [15, isKo ? "가시광" : "visible"], [16.5, "UV"]].map(([v, lb]) => (
          <text key={lb} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={9.5} textAnchor="middle">{lb}</text>
        ))}
        {[[4.5, 2.95, isKo ? "배향 (분자 회전)" : "orientation (rotation)"], [11, 2.05, isKo ? "이온 변위" : "ionic displacement"], [13.8, 1.55, isKo ? "전자 구름" : "electron cloud"]].map(([x, y, lb], i) => (
          <text key={i} x={X(x)} y={Y(y)} fill={C.textDim} fontSize={10.5}>{lb}</text>
        ))}
        <text x={16} y={pad - 10} fill={C.textDim} fontSize={11}>{isKo ? "편극 기여 (개략)" : "polarization (schematic)"}</text>
      </svg>
      <Note>
        {isKo
          ? "무거운 것부터 탈락합니다. 분자 전체의 회전(배향)은 마이크로파쯤에서, 핵의 변위(이온)는 적외선에서, 전자 구름은 자외선 너머에서 못 따라갑니다. 그래서 물은 정적 εr = 78이지만 가시광에서는 n² = 1.77뿐입니다 — 굴절률 n = √εr에 들어가는 εr은 '그 주파수에서 살아남은 편극'만의 것입니다. 전자레인지(2.45 GHz)는 물 쌍극자의 배향 완화가 일으키는 유전 손실로 음식을 데우고, 파랑이 빨강보다 강하게 편극을 일으켜 프리즘 분산과 파란 하늘이 생깁니다."
          : "The heaviest responders drop out first: whole-molecule rotation (orientation) fails around microwaves, nuclear displacement (ionic) in the IR, and the electron cloud beyond the UV. Hence water's static εr = 78 but only n² = 1.77 at visible frequencies — the εr entering n = √εr is only the polarization that survives at that frequency. A microwave oven (2.45 GHz) heats food through the dielectric loss of water's orientation relaxation, and blue light polarizes matter more strongly than red — giving prism dispersion and blue skies."}
      </Note>
    </Card>
  );
}

// =============================================================
// 3) INTERMOLECULAR FORCES
// =============================================================
const MOLS = [
  { key: "Ar", lb: "Ar", mu: 0.0, ap: 1.66, I: 15.76 },
  { key: "CH4", lb: "CH₄", mu: 0.0, ap: 2.60, I: 12.61 },
  { key: "HCl", lb: "HCl", mu: 1.08, ap: 2.63, I: 12.74 },
  { key: "NH3", lb: "NH₃", mu: 1.47, ap: 2.22, I: 10.07 },
  { key: "H2O", lb: "H₂O", mu: 1.85, ap: 1.48, I: 12.62 },
  { key: "C6H6", lb: "C₆H₆", mu: 0.0, ap: 10.4, I: 9.24 },
];
function vdwC(m, T) {
  const mu = m.mu * DEBYE, ap = m.ap * 1e-30, I = m.I * EVJ;
  const f = 4 * Math.PI * EPS0;
  const cK = 2 * Math.pow(mu, 4) / (3 * f * f * KB * T);
  const cD = 2 * mu * mu * ap / f;
  const cL = 1.5 * ap * ap * I / 2;
  return { cK, cD, cL };
}

function ForcesTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <Card>
        <Hd>{isKo ? "상호작용의 사다리: 1/r에서 1/r⁶까지" : "The ladder of interactions: from 1/r to 1/r⁶"}</Hd>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", fontSize: 12.5, fontFamily: "'JetBrains Mono',monospace", minWidth: 560 }}>
            <thead>
              <tr style={{ color: C.textDim }}>
                {[isKo ? "상호작용" : "interaction", isKo ? "거리 의존" : "distance", isKo ? "전형적 크기 [kJ/mol]" : "typical [kJ/mol]", isKo ? "비고" : "note"].map(h => (
                  <th key={h} style={{ padding: "6px 14px", borderBottom: `1px solid ${C.border}`, textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                [isKo ? "이온-이온" : "ion-ion", "1/r", "250", isKo ? "이온 사이에서만" : "ions only"],
                [isKo ? "수소결합" : "H-bond", "—", "20", "X–H···Y (X,Y = N,O,F)"],
                [isKo ? "이온-쌍극자" : "ion-dipole", "1/r²", "15", ""],
                [isKo ? "쌍극자-쌍극자 (고정)" : "dipole-dipole (fixed)", "1/r³", "2", isKo ? "결정 속 극성 분자" : "polar molecules held still"],
                [isKo ? "쌍극자-쌍극자 (회전, Keesom)" : "dipole-dipole (rotating, Keesom)", "1/r⁶", "0.3", isKo ? "기체·액체" : "gases & liquids"],
                [isKo ? "London 분산" : "London dispersion", "1/r⁶", "2", isKo ? "모든 분자쌍!" : "ALL pairs!"],
              ].map((r, i) => (
                <tr key={i} style={{ color: C.text }}>
                  {r.map((cell, j) => (
                    <td key={j} style={{ padding: "5px 14px", color: j === 1 ? C.accent : j === 2 ? C.emerald : C.text }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Note>
          {isKo
            ? "고정 쌍극자쌍은 1/r³이지만 자유 회전하면 ⟨V⟩ = 0이 될 뻔합니다 — 4주차 Boltzmann 인자 덕분에 낮은 에너지 배향이 아주 살짝 더 자주 나와, 평균이 1/r⁶ 인력으로 살아남습니다(Keesom). 온도가 오르면 회전이 정렬을 이기므로 C ∝ 1/kT — 인력이 약해집니다."
            : "A fixed dipole pair goes as 1/r³, but free rotation would average to ⟨V⟩ = 0 — except that Week 4's Boltzmann factor makes low-energy orientations slightly more frequent, leaving a surviving 1/r⁶ attraction (Keesom). Raising T lets rotation beat alignment, so C ∝ 1/kT: the attraction weakens."}
        </Note>
      </Card>
      <VdwLab isKo={isKo} />
    </div>
  );
}

function VdwLab({ isKo }) {
  const [molKey, setMolKey] = useState("HCl");
  const m = MOLS.find(x => x.key === molKey);
  const T = 298.15;
  const { cK, cD, cL } = vdwC(m, T);
  const Ctot = cK + cD + cL;
  const r0 = 0.4e-9;
  const Vtot = -Ctot / Math.pow(r0, 6) * NAV / 1e3;
  const share = c => Ctot > 0 ? (100 * c / Ctot).toFixed(1) : "0.0";

  const W = 640, Ht = 270, pad = 52;
  const { X, Y } = usePlotScale(0.3, 1.0, -4.2, 0.15, W, Ht, pad);
  const mk = Cc => {
    const pts = [];
    for (let i = 0; i <= 200; i++) {
      const r = (0.3 + 0.7 * i / 200) * 1e-9;
      pts.push([r * 1e9, Math.max(-4.2, -Cc / Math.pow(r, 6) * NAV / 1e3)]);
    }
    return pts;
  };
  return (
    <Card>
      <Hd>{isKo ? "van der Waals 계산기: 세 힘의 분해" : "The van der Waals calculator: three forces, one law"}</Hd>
      <Eq>
        Keesom: C = 2μ⁴/3(4πε₀)²kT   ·   {isKo ? "유도" : "induction"}: C = 2μ²α′/4πε₀   ·   London: C = (3/2)α′²·(I/2)
      </Eq>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "10px 0" }}>
        {MOLS.map(g => (
          <button key={g.key} onClick={() => setMolKey(g.key)}
            style={{ ...btnStyle(molKey === g.key), padding: "5px 12px", fontSize: 12 }}>{g.lb}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10, marginBottom: 8 }}>
        <Stat label={`μ / α′ / I`} value={`${m.mu} D / ${m.ap} / ${m.I} eV`} color={C.textDim} />
        <Stat label={`Keesom (${share(cK)}%)`} value={`${(cK * 1e79).toFixed(1)}`} color={C.accent} />
        <Stat label={`${isKo ? "유도" : "induction"} (${share(cD)}%)`} value={`${(cD * 1e79).toFixed(1)}`} color={C.amber} />
        <Stat label={`London (${share(cL)}%)`} value={`${(cL * 1e79).toFixed(1)}`} color={C.purple} />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <Pill color={C.emerald}>C {isKo ? "합계" : "total"} = {(Ctot * 1e79).toFixed(1)} ×10⁻⁷⁹ J·m⁶</Pill>
        <Pill color={C.cyan}>V(0.4 nm) = {Vtot.toFixed(2)} kJ/mol</Pill>
        <Pill color={C.textDim}>{isKo ? "비교: kT(298 K) = 2.48 kJ/mol" : "compare: kT(298 K) = 2.48 kJ/mol"}</Pill>
      </div>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={{ ...svgBox(W), flex: "none", width: "100%", maxWidth: W }}>
        <line x1={pad} y1={Y(0)} x2={W - pad} y2={Y(0)} stroke="#334155" />
        <path d={pathOf(mk(cK), X, Y)} fill="none" stroke={C.accent} strokeWidth={1.8} strokeDasharray="5 4" />
        <path d={pathOf(mk(cD), X, Y)} fill="none" stroke={C.amber} strokeWidth={1.8} strokeDasharray="5 4" />
        <path d={pathOf(mk(cL), X, Y)} fill="none" stroke={C.purple} strokeWidth={1.8} strokeDasharray="5 4" />
        <path d={pathOf(mk(Ctot), X, Y)} fill="none" stroke={C.emerald} strokeWidth={2.6} />
        {[[0.62, "Keesom", C.accent], [0.72, isKo ? "유도" : "induction", C.amber], [0.82, "London", C.purple], [0.5, isKo ? "합계" : "total", C.emerald]].map(([x, lb, col], i) => (
          <text key={i} x={X(x)} y={Y(-3.4 + i * 0.5)} fill={col} fontSize={10.5}>{lb}</text>
        ))}
        {[0.4, 0.6, 0.8, 1.0].map(v => (
          <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v.toFixed(1)}</text>
        ))}
        <text x={W / 2} y={Ht - 10} fill={C.textDim} fontSize={11} textAnchor="middle">r [nm]</text>
        <text x={16} y={pad - 10} fill={C.textDim} fontSize={11}>V [kJ/mol]</text>
      </svg>
      <Note>
        {isKo
          ? "분자를 바꿔 보세요. Ar·CH₄는 London 100% — 무극성인데도 액화하는 이유가 순수 분산력입니다. HCl조차 London이 79%로 지배하고, 물만이 Keesom(81%)이 이깁니다. 벤젠은 쌍극자가 0인데 C가 가장 큽니다 — 큰 전자 구름(α′ = 10.4)이 요동 쌍극자를 크게 만들기 때문입니다. '극성 = 강한 인력'이라는 직관을 정량이 뒤집는 순간이며, 끓는점 서열(He < CH₄ < ... < 벤젠)의 미시적 기원입니다."
          : "Switch molecules. Ar and CH₄ are 100% London — pure dispersion is why nonpolar gases liquefy at all. Even HCl is 79% dispersion-dominated; only water lets Keesom win (81%). Benzene has zero dipole yet the largest C — its big electron cloud (α′ = 10.4) makes large fluctuating dipoles. Quantification overturning the 'polar = sticky' intuition, and the microscopic origin of boiling-point orderings (He < CH₄ < … < benzene)."}
      </Note>
    </Card>
  );
}

// =============================================================
// 4) LENNARD-JONES MOLECULAR DYNAMICS (live)
// =============================================================
function LJTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <LJPotentialCard isKo={isKo} />
      <MDLab isKo={isKo} />
    </div>
  );
}

function LJPotentialCard({ isKo }) {
  const [eps, setEps] = useState(1.0);
  const W = 640, Ht = 280, pad = 52;
  const { X, Y } = usePlotScale(0.85, 2.6, -1.6, 2.2, W, Ht, pad);
  const V = r => 4 * eps * (Math.pow(1 / r, 12) - Math.pow(1 / r, 6));
  const F = r => 24 * eps * (2 * Math.pow(1 / r, 13) - Math.pow(1 / r, 7));
  const vPts = [], fPts = [];
  for (let i = 0; i <= 300; i++) {
    const r = 0.85 + 1.75 * i / 300;
    vPts.push([r, Math.min(2.2, V(r))]);
    fPts.push([r, Math.max(-1.6, Math.min(2.2, F(r) / 8))]);
  }
  const rmin = Math.pow(2, 1 / 6);
  return (
    <Card>
      <Hd>{isKo ? "Lennard-Jones 퍼텐셜: 분자 시뮬레이션의 표준 모델" : "The Lennard-Jones potential: molecular simulation's standard model"}</Hd>
      <Eq>
        V(r) = 4ε[(r₀/r)¹² − (r₀/r)⁶]   —   {isKo ? "인력은 이번 주의 1/r⁶, 척력 1/r¹²는 Pauli 배타(경험식)" : "the 1/r⁶ is this week's attraction; 1/r¹² repulsion is Pauli exclusion (empirical)"}
      </Eq>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", margin: "8px 0" }}>
        <Slider label={isKo ? "우물 깊이 ε" : "well depth ε"} value={eps} min={0.4} max={1.6} step={0.05} onChange={setEps} width={190} fmt={v => v.toFixed(2)} />
        <Pill color={C.amber}>{isKo ? "최소점" : "minimum"} r = 2^(1/6) r₀ = {rmin.toFixed(3)} r₀</Pill>
        <Pill color={C.emerald}>V(min) = −ε = {(-eps).toFixed(2)}</Pill>
        <Pill color={C.cyan}>F(2^(1/6)r₀) = 0</Pill>
      </div>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={{ ...svgBox(W), flex: "none", width: "100%", maxWidth: W }}>
        <line x1={pad} y1={Y(0)} x2={W - pad} y2={Y(0)} stroke="#334155" />
        <path d={pathOf(vPts, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.6} />
        <path d={pathOf(fPts, X, Y)} fill="none" stroke={C.cyan} strokeWidth={1.8} strokeDasharray="5 4" />
        <line x1={X(rmin)} y1={Y(-eps)} x2={X(rmin)} y2={Y(0)} stroke={C.amber} strokeWidth={1.6} strokeDasharray="3 3" />
        <circle cx={X(rmin)} cy={Y(-eps)} r={5} fill={C.amber} />
        <text x={X(rmin) + 6} y={Y(-eps) + 16} fill={C.amber} fontSize={10.5}>2^(1/6) r₀</text>
        <text x={X(1.7)} y={Y(0.72)} fill={C.cyan} fontSize={10.5}>F(r)/8 ({isKo ? "점선" : "dashed"})</text>
        <text x={X(1.9)} y={Y(-0.55)} fill={C.accent} fontSize={10.5}>V(r)</text>
        {[1.0, 1.5, 2.0, 2.5].map(v => (
          <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v.toFixed(1)}</text>
        ))}
        <text x={W / 2} y={Ht - 10} fill={C.textDim} fontSize={11} textAnchor="middle">r / r₀</text>
      </svg>
      <Note>
        {isKo
          ? "가파른 1/r¹² 벽(전자구름 겹침의 Pauli 반발)과 완만한 −1/r⁶ 꼬리(방금 계산한 van der Waals 인력)의 합입니다. '정확한 모델이 아니라'(강의 슬라이드의 단서!) 계산이 편한 근사지만, 아르곤·메테인 같은 단순 유체의 상거동을 훌륭히 재현해 MD 힘장(AMBER·CHARMM·OPLS)의 비결합 항으로 지금도 쓰입니다. 아래에서 이 퍼텐셜 하나로 기체가 액체로 응축하는 것을 직접 보십시오."
          : "A steep 1/r¹² wall (Pauli repulsion of overlapping clouds) plus the gentle −1/r⁶ tail we just computed. 'Not an exact model' (the lecture's own caveat!) but computationally kind, it reproduces the phase behavior of simple fluids so well that it still serves as the nonbonded term of MD force fields (AMBER, CHARMM, OPLS). Below, watch this single potential condense a gas into a liquid."}
      </Note>
    </Card>
  );
}

// -- live 2D LJ MD -------------------------------------------
function MDLab({ isKo }) {
  const [Tstar, setTstar] = useState(1.2);
  const [running, setRunning] = useState(true);
  const [showRdf, setShowRdf] = useState(true);
  const cvRef = useRef(null);
  const rdfRef = useRef(null);
  const simRef = useRef(null);
  const TRef = useRef(Tstar);
  TRef.current = Tstar;

  useEffect(() => {
    const N = 80, L = 13.0, rc2 = 9.0, dt = 0.004;
    if (!simRef.current) {
      const side = Math.ceil(Math.sqrt(N));
      const pos = [], vel = [];
      for (let i = 0; i < N; i++) {
        pos.push([((i % side) + 0.5) * L / side, (Math.floor(i / side) + 0.5) * L / side]);
        vel.push([(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2]);
      }
      simRef.current = { pos, vel, F: pos.map(() => [0, 0]), frame: 0, gHist: new Array(48).fill(0), gCnt: 0 };
    }
    const sim = simRef.current;
    const forces = () => {
      const { pos, F } = sim;
      for (let i = 0; i < N; i++) { F[i][0] = 0; F[i][1] = 0; }
      for (let i = 0; i < N - 1; i++)
        for (let j = i + 1; j < N; j++) {
          let dx = pos[i][0] - pos[j][0], dy = pos[i][1] - pos[j][1];
          dx -= L * Math.round(dx / L); dy -= L * Math.round(dy / L);
          let r2 = dx * dx + dy * dy;
          if (r2 > rc2) continue;
          if (r2 < 0.6) r2 = 0.6;                       // soft cap: no blow-ups
          const inv2 = 1 / r2, inv6 = inv2 * inv2 * inv2;
          const f = 24 * inv2 * inv6 * (2 * inv6 - 1);
          F[i][0] += f * dx; F[i][1] += f * dy;
          F[j][0] -= f * dx; F[j][1] -= f * dy;
        }
    };
    const step = () => {
      const { pos, vel, F } = sim;
      for (let i = 0; i < N; i++) {
        vel[i][0] += 0.5 * dt * F[i][0]; vel[i][1] += 0.5 * dt * F[i][1];
        pos[i][0] = (pos[i][0] + dt * vel[i][0] + L) % L;
        pos[i][1] = (pos[i][1] + dt * vel[i][1] + L) % L;
      }
      forces();
      let ke = 0;
      for (let i = 0; i < N; i++) {
        vel[i][0] += 0.5 * dt * F[i][0]; vel[i][1] += 0.5 * dt * F[i][1];
        ke += 0.5 * (vel[i][0] ** 2 + vel[i][1] ** 2);
      }
      const lam = Math.sqrt(1 + 0.03 * (TRef.current * N / ke - 1));   // gentle thermostat
      for (let i = 0; i < N; i++) { vel[i][0] *= lam; vel[i][1] *= lam; }
    };
    forces();
    let raf;
    const draw = () => {
      const cv = cvRef.current;
      if (!cv) return;
      if (running) for (let s = 0; s < 6; s++) step();
      const ctx = cv.getContext("2d");
      const Wp = cv.width, Hp = cv.height, sc = Wp / L;
      ctx.fillStyle = "#0d1117"; ctx.fillRect(0, 0, Wp, Hp);
      for (const [x, y] of sim.pos) {
        ctx.fillStyle = "#f472b6";
        ctx.beginPath();
        ctx.arc(x * sc, y * sc, 0.5 * sc * 0.5, 0, 2 * Math.PI);   // radius ~ 0.5 sigma
        ctx.fill();
      }
      ctx.strokeStyle = "#475569"; ctx.strokeRect(0.5, 0.5, Wp - 1, Hp - 1);
      // RDF accumulate every 10 frames
      sim.frame++;
      if (showRdf && sim.frame % 10 === 0) {
        const nb = sim.gHist.length, rmax = 4.0, dr = rmax / nb;
        if (sim.gCnt > 24) { sim.gHist.fill(0); sim.gCnt = 0; }     // rolling window
        for (let i = 0; i < N - 1; i++)
          for (let j = i + 1; j < N; j++) {
            let dx = sim.pos[i][0] - sim.pos[j][0], dy = sim.pos[i][1] - sim.pos[j][1];
            dx -= L * Math.round(dx / L); dy -= L * Math.round(dy / L);
            const r = Math.sqrt(dx * dx + dy * dy);
            if (r < rmax) sim.gHist[Math.min(nb - 1, Math.floor(r / dr))]++;
          }
        sim.gCnt++;
        const rc = rdfRef.current;
        if (rc) {
          const rctx = rc.getContext("2d");
          const Wr = rc.width, Hr = rc.height;
          rctx.fillStyle = "#0d1117"; rctx.fillRect(0, 0, Wr, Hr);
          const pairD = N * (N - 1) / 2 / (L * L) * 2;
          let gMax = 3.0;
          for (let k = 0; k < nb; k++) {
            const rmid = (k + 0.5) * dr;
            const ideal = 2 * Math.PI * rmid * dr * pairD * sim.gCnt;
            const g = ideal > 0 ? sim.gHist[k] / ideal : 0;
            const h = Math.min(g / gMax, 1) * (Hr - 26);
            rctx.fillStyle = rmid < 1.2 ? "#f472b6" : "#38bdf8";
            rctx.fillRect(6 + k * (Wr - 12) / nb, Hr - 18 - h, (Wr - 12) / nb - 1, h);
          }
          // g = 1 line
          const y1 = Hr - 18 - (1 / gMax) * (Hr - 26);
          rctx.strokeStyle = "#64748b"; rctx.setLineDash([4, 4]);
          rctx.beginPath(); rctx.moveTo(6, y1); rctx.lineTo(Wr - 6, y1); rctx.stroke();
          rctx.setLineDash([]);
          rctx.fillStyle = "#9ca3af"; rctx.font = "10px JetBrains Mono, monospace";
          rctx.fillText("g(r)  r: 0 - 4σ   (dashed: g = 1)", 8, 12);
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [running, showRdf]);

  return (
    <Card>
      <Hd>{isKo ? "라이브 MD 실험실: 온도를 내려 기체를 응축시키기" : "Live MD lab: cool the gas until it condenses"}</Hd>
      <Note>
        {isKo
          ? "입자 80개가 지금 이 브라우저에서 Newton 방정식(velocity Verlet)을 풀며 움직이고 있습니다. 힘은 위의 Lennard-Jones 하나뿐입니다."
          : "Eighty particles are integrating Newton's equations (velocity Verlet) in your browser right now. The only force is the Lennard-Jones potential above."}
      </Note>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", margin: "8px 0" }}>
        <button onClick={() => setRunning(r => !r)} style={btnStyle(running)}>{running ? "■" : "▶"}</button>
        <Slider label={isKo ? "온도 T* = kT/ε" : "temperature T* = kT/ε"} value={Tstar} min={0.2} max={2.5} step={0.05} onChange={setTstar} width={210} fmt={v => v.toFixed(2)} />
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.text, cursor: "pointer" }}>
          <input type="checkbox" checked={showRdf} onChange={e => setShowRdf(e.target.checked)} />
          {isKo ? "실시간 g(r)" : "live g(r)"}
        </label>
        <Pill color={Tstar > 0.9 ? C.amber : C.cyan}>{Tstar > 0.9 ? (isKo ? "기체 영역" : "gas regime") : (isKo ? "응축 영역" : "condensing regime")}</Pill>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <canvas ref={cvRef} width={380} height={380}
          style={{ borderRadius: 10, border: `1px solid ${C.border}`, width: "min(380px, 100%)" }} />
        {showRdf && <canvas ref={rdfRef} width={340} height={380}
          style={{ borderRadius: 10, border: `1px solid ${C.border}`, width: "min(340px, 100%)" }} />}
      </div>
      <Note>
        {isKo
          ? "T* ≈ 2에서 시작해 천천히 0.4까지 내려 보세요. 어느 순간 입자들이 방울로 뭉치고 — 응축! — g(r)에 2^{1/6}σ ≈ 1.12 위치의 접촉 피크와 두 번째 껍질(~2.2σ)이 자랍니다. 상전이를 만든 것은 새로운 물리가 아니라 ε(인력 우물)과 kT(열운동)의 시소일 뿐입니다. 다시 데우면 방울이 증발합니다. 액체의 '단거리 질서'(첫 피크는 또렷, 먼 곳은 g → 1)와 결정의 장거리 질서의 차이도 이 히스토그램에서 읽을 수 있습니다 — X선 산란이 재는 구조인자 S(q)가 바로 이 g(r)의 Fourier 변환입니다."
          : "Start near T* ≈ 2 and cool slowly to 0.4. At some point the particles clump into droplets — condensation! — and g(r) grows a contact peak at 2^{1/6}σ ≈ 1.12 plus a second shell near 2.2σ. No new physics made the phase transition: only the seesaw between ε (attractive well) and kT (thermal motion). Reheat and the droplet evaporates. The histogram also shows the liquid's short-range order (sharp first peak, g → 1 far away) versus a crystal's long-range order — and the structure factor S(q) measured by X-ray scattering is exactly the Fourier transform of this g(r)."}
      </Note>
    </Card>
  );
}

// =============================================================
// 5) SURFACE TENSION — Young-Laplace, capillary rise
// =============================================================
const LIQUIDS = [
  { key: "water", lb: "H₂O", sig: 72.75, rho: 998, theta: 0, c: "#38bdf8" },
  { key: "methanol", lb: "MeOH", sig: 22.6, rho: 791, theta: 0, c: "#34d399" },
  { key: "benzene", lb: "C₆H₆", sig: 28.88, rho: 876, theta: 0, c: "#f59e0b" },
  { key: "mercury", lb: "Hg", sig: 472, rho: 13546, theta: 140, c: "#f472b6" },
];

function SurfaceTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <Card>
        <Hd>{isKo ? "표면장력: 표면은 비싸다" : "Surface tension: surfaces are expensive"}</Hd>
        <Eq>dw = σ da   ({isKo ? "면적을 늘리는 데 드는 일" : "work to create area"}),   d(U−TS)V,T = σ dA {"<"} 0 → {isKo ? "표면은 저절로 줄어든다" : "area shrinks spontaneously"}</Eq>
        <Note>
          {isKo
            ? "액체 내부의 분자는 사방에서 이웃의 인력(방금 배운 van der Waals!)을 받지만, 표면 분자는 반쪽을 잃습니다. 표면에 있다는 것 자체가 에너지 비용이므로 액체는 면적을 최소화합니다 — 방울이 구형인 이유, 소금쟁이가 물 위를 걷는 이유입니다. 표에서: 물 72.75(수소결합!), 벤젠 28.88, 메탄올 22.6, 수은 472 mN/m(금속결합)."
            : "A molecule inside the liquid is pulled by neighbors on all sides (the van der Waals forces we just met); a surface molecule loses half of them. Being at the surface costs energy, so liquids minimize area — why droplets are spheres and water striders walk on ponds. From the table: water 72.75 (hydrogen bonds!), benzene 28.88, methanol 22.6, mercury 472 mN/m (metallic bonding)."}
        </Note>
      </Card>
      <LaplaceCard isKo={isKo} />
      <CapillaryLab isKo={isKo} />
    </div>
  );
}

function LaplaceCard({ isKo }) {
  const [logR, setLogR] = useState(-6);          // log10(r/m)
  const [liqKey, setLiqKey] = useState("water");
  const liq = LIQUIDS.find(l => l.key === liqKey);
  const r = Math.pow(10, logR);
  const dp = 2 * liq.sig * 1e-3 / r;
  const fmtR = r >= 1e-3 ? `${(r * 1e3).toFixed(1)} mm` : r >= 1e-6 ? `${(r * 1e6).toFixed(1)} μm` : `${(r * 1e9).toFixed(1)} nm`;
  return (
    <Card>
      <Hd>{isKo ? "Young-Laplace: 곡면이 만드는 압력" : "Young-Laplace: the pressure of curvature"}</Hd>
      <Eq>
        ΔP = σ(1/R₁ + 1/R₂)   →   {isKo ? "구" : "sphere"}: 2σ/r,   {isKo ? "원통" : "cylinder"}: σ/r   ({isKo ? "강의의 미소 곡면 힘 균형 유도" : "from the lecture's force balance on a curved patch"})
      </Eq>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", margin: "10px 0" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {LIQUIDS.map(l => (
            <button key={l.key} onClick={() => setLiqKey(l.key)}
              style={{ ...btnStyle(liqKey === l.key), padding: "5px 11px", fontSize: 12 }}>{l.lb}</button>
          ))}
        </div>
        <Slider label={isKo ? "방울 반지름 log₁₀(r/m)" : "droplet radius log₁₀(r/m)"} value={logR} min={-8.5} max={-3} step={0.1} onChange={setLogR} width={210} fmt={v => v.toFixed(1)} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
        <div style={{
          width: Math.max(30, 30 + (logR + 8.5) * 22), height: Math.max(30, 30 + (logR + 8.5) * 22),
          borderRadius: "50%", background: `radial-gradient(circle at 35% 32%, ${liq.c}cc, ${liq.c}33 70%, transparent)`,
          border: `1.5px solid ${liq.c}88`, transition: "all 0.15s",
        }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, flex: "1 1 300px" }}>
          <Stat label={isKo ? "반지름" : "radius"} value={fmtR} color={C.textDim} />
          <Stat label="σ" value={`${liq.sig} mN/m`} color={liq.c} />
          <Stat label={isKo ? "내부 초과압력 2σ/r" : "excess pressure 2σ/r"} value={dp > 1e5 ? `${(dp / 1e5).toFixed(1)} bar` : `${dp.toFixed(0)} Pa`} color={C.accent} />
        </div>
      </div>
      <Note>
        {isKo
          ? "1 mm 물방울의 초과압력은 겨우 146 Pa지만, 1 μm에서는 1.4 기압, 10 nm에서는 140 기압을 넘습니다. 안개·에멀션·나노입자의 세계에서 곡률 압력이 지배적인 이유이자, 다음 탭의 Kelvin 효과(작은 방울의 증기압 상승)의 역학적 뿌리입니다. 비눗방울은 막에 표면이 두 개라 ΔP = 4σ/r — 작은 비눗방울이 큰 것에 연결되면 작은 쪽이 큰 쪽으로 공기를 밀어 넣는 역직관적 실험도 여기서 나옵니다."
          : "A 1 mm water droplet holds only 146 Pa of excess pressure, but 1 μm gives 1.4 bar and 10 nm over 140 bar. This is why curvature pressure rules the world of fogs, emulsions, and nanoparticles — and it is the mechanical root of the next tab's Kelvin effect. A soap bubble has two surfaces, so ΔP = 4σ/r: connect a small bubble to a big one and the small inflates the large — the classic counterintuitive demo."}
      </Note>
    </Card>
  );
}

function CapillaryLab({ isKo }) {
  const [aMM, setAMM] = useState(0.5);
  const [liqKey, setLiqKey] = useState("water");
  const liq = LIQUIDS.find(l => l.key === liqKey);
  const a = aMM * 1e-3;
  const h = 2 * liq.sig * 1e-3 * Math.cos(liq.theta * Math.PI / 180) / (liq.rho * GRAV * a);
  const hMM = h * 1e3;
  const W = 620, Ht = 300, pad = 40;
  const tubeX = W / 2, tubeW = Math.max(10, aMM * 26);
  const baseY = Ht - 70;
  const scale = 1.6;                       // px per mm (display)
  const hPx = Math.max(-110, Math.min(150, hMM * scale));
  return (
    <Card>
      <Hd>{isKo ? "모세관 실험실: 저울 없이 표면장력 재기" : "Capillary lab: measuring σ without a balance"}</Hd>
      <Eq>
        2σcosθ/a = ρgh   →   σ = ρgha/2cosθ   ({isKo ? "강의의 점 1→4 압력 추적 유도" : "the lecture's point-1-to-4 pressure walk"})
      </Eq>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", margin: "8px 0" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {LIQUIDS.map(l => (
            <button key={l.key} onClick={() => setLiqKey(l.key)}
              style={{ ...btnStyle(liqKey === l.key), padding: "5px 11px", fontSize: 12 }}>{l.lb}</button>
          ))}
        </div>
        <Slider label={isKo ? "관 반지름 a" : "tube radius a"} value={aMM} min={0.1} max={2} step={0.05} onChange={setAMM} unit=" mm" width={190} fmt={v => v.toFixed(2)} />
        <Pill color={hMM >= 0 ? C.emerald : C.err}>h = {hMM.toFixed(1)} mm {hMM < 0 ? (isKo ? "(하강!)" : "(depression!)") : ""}</Pill>
      </div>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={{ ...svgBox(W), flex: "none", width: "100%", maxWidth: W }}>
        {/* reservoir */}
        <rect x={40} y={baseY} width={W - 80} height={44} fill={`${liq.c}33`} stroke={`${liq.c}66`} />
        {/* tube */}
        <rect x={tubeX - tubeW / 2 - 4} y={30} width={4} height={baseY - 26 + 40} fill="#475569" />
        <rect x={tubeX + tubeW / 2} y={30} width={4} height={baseY - 26 + 40} fill="#475569" />
        {/* liquid column */}
        <rect x={tubeX - tubeW / 2} y={Math.min(baseY, baseY - hPx)} width={tubeW}
          height={Math.abs(hPx) + (hPx >= 0 ? 44 : 44 - Math.abs(hPx))} fill={`${liq.c}66`} />
        {/* meniscus */}
        <path d={liq.theta < 90
          ? `M ${tubeX - tubeW / 2} ${baseY - hPx} Q ${tubeX} ${baseY - hPx + tubeW * 0.45} ${tubeX + tubeW / 2} ${baseY - hPx}`
          : `M ${tubeX - tubeW / 2} ${baseY - hPx} Q ${tubeX} ${baseY - hPx - tubeW * 0.45} ${tubeX + tubeW / 2} ${baseY - hPx}`}
          fill="none" stroke={liq.c} strokeWidth={2.4} />
        {/* h marker */}
        <line x1={tubeX + tubeW / 2 + 26} y1={baseY} x2={tubeX + tubeW / 2 + 26} y2={baseY - hPx} stroke={C.amber} strokeWidth={1.6} />
        <text x={tubeX + tubeW / 2 + 34} y={baseY - hPx / 2 + 4} fill={C.amber} fontSize={11.5} fontFamily="'JetBrains Mono',monospace">h</text>
        <text x={44} y={baseY + 26} fill={C.textDim} fontSize={10.5}>{isKo ? "액체 저장조" : "reservoir"}</text>
        <text x={tubeX - tubeW / 2 - 10} y={44} fill={C.textDim} fontSize={10.5} textAnchor="end">2a = {(2 * aMM).toFixed(2)} mm</text>
      </svg>
      <Note>
        {isKo
          ? "물·유리(θ ≈ 0°)는 a = 0.2 mm에서 74 mm나 올라갑니다 — 종이 타월과 식물 물관의 원리입니다. 수은은 θ = 140°로 cosθ < 0이라 오히려 내려갑니다(수은 온도계 눈금을 읽을 때 볼록한 메니스커스가 이것). 유도의 핵심은 한 문장입니다: 오목한 메니스커스 바로 아래(점 2)는 Young-Laplace 때문에 대기압보다 2σcosθ/a만큼 낮고, 그 부족분을 액체 기둥의 무게 ρgh가 채울 때까지 액체가 밀려 올라간다."
          : "Water on glass (θ ≈ 0°) climbs 74 mm in a 0.2 mm tube — the physics of paper towels and plant xylem. Mercury, with θ = 140° and cosθ < 0, is depressed instead (the convex meniscus you see on mercury thermometers). The derivation in one sentence: just under the concave meniscus (point 2) the pressure sits 2σcosθ/a below atmospheric by Young-Laplace, and liquid rises until the column's weight ρgh makes up the deficit."}
      </Note>
      <HdSub>{isKo ? "다른 측정법 두 가지" : "Two more measurement methods"}</HdSub>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
        <div style={{ background: C.card, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.cyan, marginBottom: 6 }}>{isKo ? "낙적법 (drop weight)" : "Drop-weight method"}</div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: C.text }}>σ = Mg/πD</div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 6 }}>
            {isKo ? "지름 D 모세관 끝에서 방울이 떨어지는 순간 σπD = Mg. D = 3 mm면 물방울 ~70 mg." : "A drop detaches when σπD = Mg. For D = 3 mm, water drops weigh ~70 mg."}
          </div>
        </div>
        <div style={{ background: C.card, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.purple, marginBottom: 6 }}>{isKo ? "고리법 (du Noüy ring)" : "Ring (du Noüy) method"}</div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: C.text }}>σ = F/2P</div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 6 }}>
            {isKo ? "둘레 P인 고리를 들어올릴 때 액막 양면이 당기므로 2σP — 장력계가 F를 읽습니다." : "Lifting a ring of perimeter P pulls a two-sided film, force 2σP — the tensiometer reads F."}
          </div>
        </div>
      </div>
    </Card>
  );
}

// =============================================================
// 6) WETTING & CURVATURE — Young equation, Kelvin, surfactants
// =============================================================
function WettingTab({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <ContactAngleLab isKo={isKo} />
      <KelvinCard isKo={isKo} />
      <SurfactantCard isKo={isKo} />
    </div>
  );
}

function ContactAngleLab({ isKo }) {
  const [sgs, setSgs] = useState(45);      // mN/m
  const [sls, setSls] = useState(30);
  const [slg, setSlg] = useState(72.75);
  const cosT = Math.max(-1, Math.min(1, (sgs - sls) / slg));
  const theta = Math.acos(cosT) * 180 / Math.PI;
  const wad = slg * (1 + cosT);
  const regime = theta < 5 ? (isKo ? "퍼짐 (완전 젖음)" : "spreading (complete wetting)")
    : theta < 90 ? (isKo ? "좋은 젖음" : "good wetting")
    : theta < 150 ? (isKo ? "젖지 않음" : "non-wetting")
    : (isKo ? "초소수성 영역" : "superhydrophobic regime");
  const presets = [
    { lb: isKo ? "유리+물" : "glass+water", v: [72, 20, 72.75] },
    { lb: isKo ? "폴리머+물" : "polymer+water", v: [40, 46, 72.75] },
    { lb: "PTFE+H₂O", v: [20, 62, 72.75] },
  ];

  // droplet shape: circular cap with contact angle theta
  const W = 560, Ht = 260;
  const baseY = Ht - 60, cxD = W / 2;
  const thR = theta * Math.PI / 180;
  const Rc = 88;                                      // circle radius px
  const yc = baseY + Rc * Math.cos(thR);              // center below/above base
  const half = Rc * Math.sin(thR);
  const largeArc = theta > 90 ? 1 : 0;
  const dropPath = `M ${cxD - half} ${baseY} A ${Rc} ${Rc} 0 ${largeArc} 1 ${cxD + half} ${baseY} Z`;
  return (
    <Card>
      <Hd>{isKo ? "접촉각 실험실: Young 방정식" : "Contact-angle lab: Young's equation"}</Hd>
      <Eq>
        σ_gs = σ_ls + σ_lg cosθc   →   cosθc = (σ_gs − σ_ls)/σ_lg,   w_ad = σ_lg(1 + cosθc)
      </Eq>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", margin: "8px 0" }}>
        <Slider label="σ_gs" value={sgs} min={5} max={80} step={1} onChange={setSgs} unit="" width={140} />
        <Slider label="σ_ls" value={sls} min={5} max={80} step={1} onChange={setSls} unit="" width={140} />
        <Slider label="σ_lg" value={slg} min={20} max={80} step={0.25} onChange={setSlg} unit="" width={140} fmt={v => v.toFixed(1)} />
        {presets.map(p => (
          <button key={p.lb} onClick={() => { setSgs(p.v[0]); setSls(p.v[1]); setSlg(p.v[2]); }}
            style={{ ...btnStyle(), padding: "5px 11px", fontSize: 12 }}>{p.lb}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10, marginBottom: 10 }}>
        <Stat label="cosθc" value={cosT.toFixed(3)} color={C.cyan} />
        <Stat label={isKo ? "접촉각 θc" : "contact angle θc"} value={`${theta.toFixed(1)}°`} color={C.accent} />
        <Stat label={isKo ? "부착일 w_ad/σ_lg" : "adhesion w_ad/σ_lg"} value={(wad / slg).toFixed(3)} color={C.emerald} />
        <Stat label={isKo ? "판정" : "regime"} value={regime} color={theta < 90 ? C.emerald : C.err} />
      </div>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={{ ...svgBox(W), flex: "none", width: "100%", maxWidth: W }}>
        <rect x={30} y={baseY} width={W - 60} height={34} fill="#2a3648" stroke="#3b4a61" />
        <text x={W - 40} y={baseY + 22} fill={C.textDim} fontSize={10.5} textAnchor="end">{isKo ? "고체" : "solid"}</text>
        <path d={dropPath} fill="rgba(56,189,248,0.30)" stroke={C.sky} strokeWidth={2.2} />
        {/* tangent + angle marker at left contact point */}
        {(() => {
          const px = cxD - half, py = baseY;
          const tx = Math.cos(Math.PI - thR), ty = -Math.sin(Math.PI - thR);
          return (
            <g>
              <line x1={px} y1={py} x2={px - tx * 54} y2={py - ty * 54} stroke={C.amber} strokeWidth={2} strokeDasharray="4 3" />
              <text x={px - tx * 66 - 8} y={py - ty * 66} fill={C.amber} fontSize={11.5}>θc</text>
            </g>
          );
        })()}
      </svg>
      <Note>
        {isKo
          ? "σ_gs(고체가 마르고 싶어하는 정도)를 키우면 액체가 퍼지고, σ_ls를 키우면 액체가 움츠러듭니다. PTFE 프리셋(θ ≈ 125°)이 프라이팬 코팅이고, 연꽃잎은 여기에 마이크로 돌기 구조를 더해 θ > 150°의 초소수성(자가 세정!)을 만듭니다. 판정 기준은 부착일로도 씁니다: 1 < w_ad/σ_lg < 2면 젖고, 0 < w_ad/σ_lg < 1이면 젖지 않습니다 — 강의 유도의 세 힘 균형(Neumann 삼각형)에서 고체 표면이 평평하다는 조건(β = π)을 넣으면 바로 Young 방정식이 나옵니다."
          : "Raise σ_gs (how much the solid 'wants' to stay dry) and the liquid spreads; raise σ_ls and it balls up. The PTFE preset (θ ≈ 125°) is your frying-pan coating; the lotus leaf adds micro-bumps to reach θ > 150° superhydrophobicity (self-cleaning!). The adhesion criterion reads the same physics: 1 < w_ad/σ_lg < 2 wets, 0 < w_ad/σ_lg < 1 does not — and setting the solid flat (β = π) in the lecture's three-force Neumann balance collapses it straight into Young's equation."}
      </Note>
    </Card>
  );
}

function KelvinCard({ isKo }) {
  const [logR, setLogR] = useState(-8);
  const T = 298.15, SIG = 72.75e-3, VM = 1.807e-5;
  const r = Math.pow(10, logR);
  const ratio = Math.exp(2 * SIG * VM / (r * RGAS * T));
  const W = 640, Ht = 260, pad = 52;
  const { X, Y } = usePlotScale(-9, -6, 1, 3.0, W, Ht, pad);
  const pts = [];
  for (let i = 0; i <= 240; i++) {
    const lr = -9 + 3 * i / 240;
    pts.push([lr, Math.min(3.0, Math.exp(2 * SIG * VM / (Math.pow(10, lr) * RGAS * T)))]);
  }
  return (
    <Card>
      <Hd>{isKo ? "Kelvin 식: 작은 방울은 더 증발하고 싶다" : "The Kelvin equation: small droplets want to evaporate"}</Hd>
      <Eq>
        p = p* e^{"{2σVm/rRT}"}   ({isKo ? "화학퍼텐셜 균형 + Young-Laplace에서 유도" : "from chemical-potential balance + Young-Laplace"})
      </Eq>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", margin: "8px 0" }}>
        <Slider label={isKo ? "방울 반지름 log₁₀(r/m)" : "droplet radius log₁₀(r/m)"} value={logR} min={-9} max={-6} step={0.05} onChange={setLogR} width={230} fmt={v => v.toFixed(2)} />
        <Pill color={C.accent}>r = {(r * 1e9).toFixed(1)} nm</Pill>
        <Pill color={C.cyan}>p/p* = {ratio.toFixed(3)}</Pill>
        <Pill color={C.amber}>{isKo ? "과포화" : "supersaturation"} {((ratio - 1) * 100).toFixed(1)}%</Pill>
      </div>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={{ ...svgBox(W), flex: "none", width: "100%", maxWidth: W }}>
        <line x1={pad} y1={Y(1)} x2={W - pad} y2={Y(1)} stroke="#475569" strokeDasharray="4 4" />
        <path d={pathOf(pts, X, Y)} fill="none" stroke={C.accent} strokeWidth={2.6} />
        <circle cx={X(logR)} cy={Y(Math.min(3, ratio))} r={5} fill={C.amber} />
        {[[-9, "1 nm"], [-8, "10 nm"], [-7, "100 nm"], [-6, "1 μm"]].map(([v, lb]) => (
          <text key={lb} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{lb}</text>
        ))}
        <text x={W - pad} y={Y(1) - 8} fill={C.textDim} fontSize={10.5} textAnchor="end">p/p* = 1 ({isKo ? "평평한 표면" : "flat surface"})</text>
        <text x={16} y={pad - 10} fill={C.textDim} fontSize={11}>p/p*</text>
      </svg>
      <Note>
        {isKo
          ? "물에서 r = 10 nm면 p/p* = 1.11, r = 1 nm면 2.9배. 결과 두 가지: ① 구름은 저절로 못 생깁니다 — 씨앗 없이 응결하려면 첫 방울(나노 크기)이 넘어야 할 증기압 문턱이 너무 높아, 먼지·해염 같은 응결핵이 필요합니다(인공강우의 원리). ② Ostwald 숙성: 같은 지수(2γVm/rRT)가 용해도에도 적용되어 작은 입자는 녹고 큰 입자는 자랍니다 — 나노입자 합성에서 크기 분포가 저절로 좁아지는(또는 원치 않게 굵어지는) 메커니즘이자, 아이스크림이 오래되면 서걱거리는 이유입니다."
          : "For water, r = 10 nm gives p/p* = 1.11 and r = 1 nm nearly 2.9×. Two consequences: ① clouds cannot self-start — the first nano-droplet faces a prohibitive vapor-pressure threshold, so condensation nuclei (dust, sea salt) are required (the principle of cloud seeding). ② Ostwald ripening: the same exponent (2γVm/rRT) applies to solubility, so small particles dissolve and feed large ones — the mechanism that narrows (or unwantedly coarsens) size distributions in nanoparticle synthesis, and why old ice cream turns gritty."}
      </Note>
    </Card>
  );
}

function SurfactantCard({ isKo }) {
  const [logC, setLogC] = useState(-4);
  const cmcLog = -2.6;                        // ~2.5 mM (SDS-like)
  const sig0 = 72.75, sigCmc = 35;
  const sig = logC < cmcLog ? sig0 - (sig0 - sigCmc) * Math.max(0, (logC + 5) / (cmcLog + 5)) : sigCmc;
  const W = 620, Ht = 240, pad = 52;
  const { X, Y } = usePlotScale(-5, -1, 30, 78, W, Ht, pad);
  const pts = [];
  for (let i = 0; i <= 200; i++) {
    const lc = -5 + 4 * i / 200;
    pts.push([lc, lc < cmcLog ? sig0 - (sig0 - sigCmc) * Math.max(0, (lc + 5) / (cmcLog + 5)) : sigCmc]);
  }
  return (
    <Card>
      <Hd>{isKo ? "계면활성제와 CMC: 표면장력을 설계하다" : "Surfactants & the CMC: engineering surface tension"}</Hd>
      <Eq>π = σ* − σ   ({isKo ? "표면압: 순수 용매 대비 낮아진 만큼" : "surface pressure: the drop below the pure solvent"})</Eq>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", margin: "8px 0" }}>
        <Slider label="log₁₀(c/M)" value={logC} min={-5} max={-1} step={0.05} onChange={setLogC} width={210} fmt={v => v.toFixed(1)} />
        <Pill color={C.cyan}>σ = {sig.toFixed(1)} mN/m</Pill>
        <Pill color={logC >= cmcLog ? C.accent : C.textDim}>{logC >= cmcLog ? (isKo ? "CMC 초과 — 미셀 형성!" : "above CMC — micelles!") : (isKo ? "CMC 미만 — 표면 흡착 중" : "below CMC — adsorbing to surface")}</Pill>
      </div>
      <svg width={W} height={Ht} viewBox={`0 0 ${W} ${Ht}`} style={{ ...svgBox(W), flex: "none", width: "100%", maxWidth: W }}>
        <path d={pathOf(pts, X, Y)} fill="none" stroke={C.cyan} strokeWidth={2.6} />
        <line x1={X(cmcLog)} y1={Y(30)} x2={X(cmcLog)} y2={Y(78)} stroke={C.accent} strokeWidth={1.6} strokeDasharray="5 4" />
        <text x={X(cmcLog) + 6} y={Y(74)} fill={C.accent} fontSize={11} fontWeight={700}>CMC</text>
        <circle cx={X(logC)} cy={Y(sig)} r={5} fill={C.amber} />
        {[-5, -4, -3, -2, -1].map(v => (
          <text key={v} x={X(v)} y={Ht - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{v}</text>
        ))}
        <text x={W / 2} y={Ht - 8} fill={C.textDim} fontSize={11} textAnchor="middle">log₁₀({isKo ? "농도" : "concentration"}/M)</text>
        <text x={16} y={pad - 10} fill={C.textDim} fontSize={11}>σ [mN/m]</text>
      </svg>
      <Note>
        {isKo
          ? "친수성 머리·소수성 꼬리를 가진 계면활성제는 표면에 흡착해 σ를 낮춥니다(비누가 때를 빼는 원리). 농도를 올리면 σ가 계속 내려가다가 CMC(임계 미셀 농도)에서 뚝 멈춥니다 — 표면이 가득 차서, 추가 분자는 용액 속에서 미셀로 뭉치기 때문입니다. Langmuir-Blodgett 트로프는 이 단분자막을 압축해 2D 기체→액체→고체 상전이를 표면압-면적 등온선으로 보여줍니다 — 3주 뒤 흡착 등온선에서 Langmuir를 다시 만납니다."
          : "A surfactant's hydrophilic head and hydrophobic tail drive it to the surface, lowering σ (how soap lifts grease). Raising concentration keeps lowering σ until the CMC, where it abruptly stops — the surface is full, and extra molecules bundle into micelles in the bulk instead. A Langmuir-Blodgett trough compresses such a monolayer and displays 2D gas→liquid→solid transitions in its surface pressure-area isotherm — we will meet Langmuir again in adsorption isotherms a few weeks from now."}
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
        q: "P1. 클로로벤젠의 쌍극자 모멘트는 1.57 D다. o-, m-, p-다이클로로벤젠의 쌍극자를 벡터 합으로 예측하고 실측값(2.25, 1.48, 0 D)과 비교하시오.",
        s: "두 C–Cl 결합 쌍극자의 사이각은 ortho 60°, meta 120°, para 180°. μres = 2μ₁cos(θ/2)이므로 ortho: 2(1.57)cos30° = 2.72 D, meta: 2(1.57)cos60° = 1.57 D, para: 2(1.57)cos90° = 0. 서열과 크기가 실측(2.25/1.48/0)과 잘 맞고, ortho의 편차는 두 Cl이 가까워 서로의 전자구름을 편극시키고(유도) 입체적으로 밀치기 때문입니다. 쌍극자 측정만으로 이성질체를 구별할 수 있다는 것이 핵심입니다.",
      },
      en: {
        q: "P1. Chlorobenzene has μ = 1.57 D. Predict the dipoles of o-, m-, p-dichlorobenzene by vector addition and compare with experiment (2.25, 1.48, 0 D).",
        s: "The two C–Cl bond dipoles subtend 60° (ortho), 120° (meta), 180° (para). μres = 2μ₁cos(θ/2) gives ortho 2.72 D, meta 1.57 D, para 0. Ordering and magnitudes match experiment (2.25/1.48/0); the ortho discrepancy comes from mutual induction and sterics of the adjacent Cl atoms. The point: dipole measurements alone distinguish isomers.",
      },
    },
    {
      ko: {
        q: "P2. 기체 시료의 몰편극 Pm을 두 온도에서 측정했더니 350 K에서 62.5, 450 K에서 52.3 cm³/mol이었다. μ와 α′를 구하시오.",
        s: "Pm = (NA/3ε₀)(α + μ²/3kT) = A + B/T 꼴. B = (62.5−52.3)/(1/350−1/450) = 10.2/(6.349×10⁻⁴) = 1.607×10⁴ cm³·K/mol. μ² = 9ε₀kB·B/NA: SI로 환산해 계산하면 μ ≈ 1.85 D (물 수준의 극성). A = 62.5 − 1.607×10⁴/350 = 16.6 cm³/mol → α′ = 3ε₀A/NA/(4πε₀) ≈ 6.6×10⁻³⁰ m³. 한 직선의 기울기와 절편이 분자의 두 전기적 성질을 동시에 줍니다.",
      },
      en: {
        q: "P2. A gas shows molar polarization 62.5 cm³/mol at 350 K and 52.3 at 450 K. Find μ and α′.",
        s: "Pm = A + B/T with B = (62.5−52.3)/(1/350−1/450) = 1.607×10⁴ cm³·K/mol. Converting to SI, μ = √(9ε₀kB·B/NA) ≈ 1.85 D (water-like polarity). A = 62.5 − B/350 = 16.6 cm³/mol → α′ = 3ε₀A/(4πε₀NA) ≈ 6.6×10⁻³⁰ m³. One line's slope and intercept deliver both electric properties at once.",
      },
    },
    {
      ko: {
        q: "P3. CCl₄는 무극성이고 α′ = 10.5×10⁻³⁰ m³, ρ = 1.59 g/cm³, M = 153.8 g/mol이다. Clausius-Mossotti 식으로 εr와 굴절률을 예측하시오.",
        s: "(εr−1)/(εr+2) = 4πρNAα′/3M = 4π(1590)(6.022×10²³)(10.5×10⁻³⁰)/(3×0.1538) = 0.274. εr = (1+2×0.274)/(1−0.274) = 2.13, n = √2.13 = 1.460 — 실측 1.4607과 소수 셋째 자리까지 일치합니다. 분자 하나의 편극성이 벌크 액체의 광학 성질을 결정하는 것을 보여주는 교과서적 검증입니다. (물이라면 실패합니다 — 배향 항이 빠졌으므로 εr = 78이 아니라 n² ≈ 1.8쪽이 나옵니다. 어떤 항이 언제 살아있는지가 핵심.)",
      },
      en: {
        q: "P3. CCl₄ is nonpolar with α′ = 10.5×10⁻³⁰ m³, ρ = 1.59 g/cm³, M = 153.8 g/mol. Predict εr and the refractive index via Clausius-Mossotti.",
        s: "(εr−1)/(εr+2) = 4πρNAα′/3M = 0.274, so εr = 2.13 and n = √εr = 1.460 — matching the measured 1.4607 to three decimals. A textbook demonstration that single-molecule polarizability fixes a bulk optical property. (Try water and it fails: with the orientation term absent you get n² ≈ 1.8, not εr = 78 — knowing which term survives at which frequency is the point.)",
      },
    },
    {
      ko: {
        q: "P4. HCl 쌍(μ = 1.08 D, α′ = 2.63×10⁻³⁰ m³, I = 12.74 eV)의 Keesom·유도·London 계수를 298 K에서 구하고, 분산력의 비중을 평가하시오.",
        s: "C_K = 2μ⁴/3(4πε₀)²kT = 22.0, C_D = 2μ²α′/4πε₀ = 6.1, C_L = (3/2)α′²(I/2) = 105.9 (×10⁻⁷⁹ J·m⁶). 합계 134.0 중 분산력이 79%. '극성 분자니까 쌍극자 힘이 주도하겠지'라는 직관과 달리, 웬만한 극성으로는 London을 못 이깁니다(물 정도는 되어야 역전). 총 C로 r = 0.4 nm에서 V ≈ −2.0 kJ/mol — kT(2.48 kJ/mol)와 비슷한 크기라 HCl이 상온에서 기체인 것도 설명됩니다.",
      },
      en: {
        q: "P4. For an HCl pair (μ = 1.08 D, α′ = 2.63×10⁻³⁰ m³, I = 12.74 eV) find the Keesom, induction, and London coefficients at 298 K and assess the dispersion share.",
        s: "C_K = 22.0, C_D = 6.1, C_L = 105.9 (×10⁻⁷⁹ J·m⁶): dispersion is 79% of the total 134.0. Against the 'polar molecules are dipole-dominated' intuition, ordinary polarity cannot beat London (only water-class dipoles manage it). The total gives V(0.4 nm) ≈ −2.0 kJ/mol, comparable to kT = 2.48 kJ/mol — consistent with HCl being a gas at room temperature.",
      },
    },
    {
      ko: {
        q: "P5. Lennard-Jones 퍼텐셜 V = 4ε[(r₀/r)¹² − (r₀/r)⁶]에 대해 (a) 최소점 위치와 깊이를 유도하고, (b) 그 위치에서 힘이 0임을 확인하시오.",
        s: "(a) dV/dr = 4ε[−12r₀¹²/r¹³ + 6r₀⁶/r⁷] = 0 → r¹³/r⁷ = 2r₀⁶ → r = 2^{1/6}r₀ ≈ 1.122r₀. 대입하면 V = 4ε[(1/2)² − (1/2)] = 4ε(1/4 − 1/2) = −ε: 우물 깊이가 정확히 ε입니다. (b) F = −dV/dr이므로 극값에서 자동으로 0 — 인력(−6항)과 척력(−12항)이 정확히 상쇄되는 평형 간격입니다. MD 탭의 응축된 액체에서 g(r) 첫 피크가 1.12σ에 서는 이유가 바로 이것입니다.",
      },
      en: {
        q: "P5. For V = 4ε[(r₀/r)¹² − (r₀/r)⁶]: (a) derive the location and depth of the minimum; (b) verify the force vanishes there.",
        s: "(a) dV/dr = 0 gives r = 2^{1/6}r₀ ≈ 1.122r₀, and substituting, V = 4ε(1/4 − 1/2) = −ε: the well depth is exactly ε. (b) F = −dV/dr is automatically zero at the extremum — attraction (the −6 term) and repulsion (−12) cancel at this equilibrium spacing. This is precisely why the condensed liquid's g(r) in the MD tab peaks at 1.12σ.",
      },
    },
    {
      ko: {
        q: "P6. (a) 반지름 1 μm 물방울 내부의 초과압력을 구하시오 (σ = 72.75 mN/m). (b) 반지름 0.2 mm 유리 모세관에서 물의 상승 높이를 구하시오 (θ ≈ 0°).",
        s: "(a) ΔP = 2σ/r = 2(0.07275)/10⁻⁶ = 1.455×10⁵ Pa ≈ 1.44 atm — 대기압보다 1.4기압 높습니다. 안개 방울 하나가 소형 압력용기인 셈입니다. (b) h = 2σcosθ/ρga = 2(0.07275)(1)/(998×9.807×2×10⁻⁴) = 74.3 mm ≈ 7.4 cm. 관이 가늘수록 h ∝ 1/a로 커집니다 — 식물 물관(수십 μm)이라면 수 m 스케일이 되어, 나무의 수분 수송에서 모세관·증산 장력이 함께 일하는 배경이 됩니다.",
      },
      en: {
        q: "P6. (a) Find the excess pressure inside a 1 μm water droplet (σ = 72.75 mN/m). (b) Find the capillary rise of water in a glass tube of radius 0.2 mm (θ ≈ 0°).",
        s: "(a) ΔP = 2σ/r = 1.455×10⁵ Pa ≈ 1.44 atm above ambient — every fog droplet is a tiny pressure vessel. (b) h = 2σcosθ/ρga = 74.3 mm ≈ 7.4 cm. Since h ∝ 1/a, xylem-sized channels (tens of μm) reach meter scale — part of how trees move water, together with transpiration tension.",
      },
    },
    {
      ko: {
        q: "P7. 어떤 고체 위 물방울의 접촉각이 125°(PTFE)다. (a) σ_gs − σ_ls를 구하시오. (b) 부착일 w_ad를 구하고 젖음 판정 기준과 비교하시오.",
        s: "(a) Young 방정식: σ_gs − σ_ls = σ_lg cosθ = 72.75 × cos125° = −41.7 mN/m. 음수 — 고체는 물에 덮이는 것보다 마른 채가 에너지적으로 유리합니다. (b) w_ad = σ_lg(1 + cosθ) = 72.75(1 − 0.574) = 31.0 mN/m, w_ad/σ_lg = 0.426. 판정 기준 0 < w_ad/σ_lg < 1이므로 비젖음. 접촉각 하나에서 계면 에너지 관계와 부착 성능까지 읽어내는 것이 코팅·프린팅·반도체 세정 공정의 일상 계산입니다.",
      },
      en: {
        q: "P7. A water droplet on a solid shows θc = 125° (PTFE). (a) Find σ_gs − σ_ls. (b) Compute the work of adhesion and compare with the wetting criterion.",
        s: "(a) Young: σ_gs − σ_ls = σ_lg cosθ = 72.75 cos125° = −41.7 mN/m. Negative — the solid is energetically happier dry than covered. (b) w_ad = σ_lg(1 + cosθ) = 31.0 mN/m, so w_ad/σ_lg = 0.426, inside the non-wetting window 0–1. Reading interfacial energetics and adhesion from a single angle is daily arithmetic in coating, printing, and wafer-cleaning processes.",
      },
    },
    {
      ko: {
        q: "P8. Kelvin 식으로 반지름 10 nm와 1 nm 물방울의 상대 증기압 p/p*를 구하고 (Vm = 1.807×10⁻⁵ m³/mol, 298 K), 구름 형성과 Ostwald 숙성에 대한 함의를 설명하시오.",
        s: "지수 = 2σVm/rRT. r = 10 nm: 2(0.07275)(1.807×10⁻⁵)/(10⁻⁸×8.314×298.15) = 0.106 → p/p* = 1.11. r = 1 nm: 1.06 → p/p* = 2.89. 함의: ① 순수한 수증기는 상대습도 100%를 훨씬 넘어도(과포화) 첫 나노 방울을 만들지 못합니다 — 방울이 작을수록 자기 증기압이 커서 도로 증발하기 때문. 그래서 응결핵(먼지·해염·요오드화은)이 필요합니다. ② 같은 지수의 용해도 버전 ln(c/c₀) = 2γVm/rRT가 Ostwald 숙성: 작은 결정이 녹아 큰 결정을 키웁니다. 나노입자 합성의 크기 집속(size focusing)과 노화, 제약 결정의 다형 숙성까지 지배하는 화공의 핵심 식입니다.",
      },
      en: {
        q: "P8. Use the Kelvin equation to find p/p* for water droplets of r = 10 nm and 1 nm (Vm = 1.807×10⁻⁵ m³/mol, 298 K), and explain the implications for cloud formation and Ostwald ripening.",
        s: "Exponent = 2σVm/rRT: r = 10 nm gives 0.106 → p/p* = 1.11; r = 1 nm gives 1.06 → p/p* = 2.89. Implications: ① pure vapor cannot nucleate its first nano-droplet even far above 100% humidity — the smaller the droplet, the higher its own vapor pressure, so it re-evaporates; hence condensation nuclei (dust, sea salt, silver iodide). ② The solubility version ln(c/c₀) = 2γVm/rRT is Ostwald ripening: small crystals dissolve to feed large ones — governing size focusing and aging in nanoparticle synthesis and polymorph ripening in pharmaceuticals.",
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
            ? "풀이를 열기 전에 반드시 스스로 풀어보세요. P1–P4는 분자의 전기적 성질·분자간 힘, P5는 Lennard-Jones, P6–P8은 표면·곡률 실단위 계산입니다."
            : "Attempt each before opening the solution. P1–P4 drill electric properties and intermolecular forces, P5 the Lennard-Jones potential, P6–P8 real-unit surface and curvature arithmetic."}
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
  dipole_polarization: {
    ko: "쌍극자·Debye 플롯·Clausius-Mossotti", en: "Dipoles · Debye plot · Clausius-Mossotti",
    codes: { python: PY_DIPOLE, matlab: ML_DIPOLE, julia: JL_DIPOLE, cpp: CPP_DIPOLE },
  },
  vdw_forces: {
    ko: "van der Waals 힘 (Keesom·유도·London)", en: "van der Waals forces (Keesom · induction · London)",
    codes: { python: PY_VDW, matlab: ML_VDW, julia: JL_VDW, cpp: CPP_VDW },
  },
  lj_md: {
    ko: "2D Lennard-Jones MD·RDF", en: "2D Lennard-Jones MD · RDF",
    codes: { python: PY_LJMD, matlab: ML_LJMD, julia: JL_LJMD, cpp: CPP_LJMD },
  },
  capillarity: {
    ko: "표면장력·모세관·젖음·Kelvin", en: "Surface tension · capillarity · wetting · Kelvin",
    codes: { python: PY_CAP, matlab: ML_CAP, julia: JL_CAP, cpp: CPP_CAP },
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
  const [topic, setTopic] = useState("dipole_polarization");
  const [cl, setCl] = useState("python");
  const [copied, setCopied] = useState(false);
  const code = CODE_TOPICS[topic].codes[cl];
  const fname = `wk05_${topic}.${LANG_META[cl].ext}`;

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
            ? "이 페이지의 인터랙티브 뒤의 물리를 직접 실행해 볼 수 있는 독립 코드입니다. 수치 검증 완료: 다이클로로벤젠 μ = 2.72/1.57/0 D, Debye 플롯 μ·α 정확 회수, CCl₄ n = 1.460 (실측 1.4607), LJ MD 에너지 드리프트 ~10⁻³·RDF 피크 1.12σ, 모세관 h(0.2 mm) = 74.3 mm, Kelvin p/p*(10 nm) = 1.112."
            : "Standalone codes behind every interactive on this page. Validated: dichlorobenzene μ = 2.72/1.57/0 D, Debye-plot recovery of μ and α, CCl₄ n = 1.460 (exp 1.4607), LJ MD energy drift ~1e-3 with RDF peak at 1.12σ, capillary h(0.2 mm) = 74.3 mm, Kelvin p/p*(10 nm) = 1.112."}
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
