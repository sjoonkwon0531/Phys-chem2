// ============================================================
// MidtermReviewApp.jsx — Midterm review, Weeks 1–6
// Physical Chemistry 2 (물리화학 2)
// SKKU School of Chemical Engineering
// Smart Process & Materials Design Lab (SPMDL)
// Prof. S. Joon Kwon
// ------------------------------------------------------------
// Tabs: overview & week map · key formulas · concept quiz ·
//       practice (new problems) · 2025 midterm · constants &
//       pitfalls · check code (Python)
// Content lives in MidtermReviewData.js; the Python script that
// reproduces every number lives in MidtermReviewCodes.js.
// ============================================================
import { useState } from "react";
import { WEEKS, SKILLS, FORMULAS, QUIZ, PRACTICE, PAST, CONSTANTS, PITFALLS } from "./MidtermReviewData";
import { PY_REVIEW } from "./MidtermReviewCodes";

// ── i18n ─────────────────────────────────────────────────────
const i18n = {
  ko: {
    title: "중간고사 복습 — 1~6주차",
    subtitle: "핵심 공식 · 개념 퀴즈 · 새 연습문제 · 2025 중간고사 · 상수와 자주 하는 실수",
    tabs: {
      overview: "개요 · 주차 지도",
      formulas: "핵심 공식",
      quiz: "개념 퀴즈",
      practice: "연습문제",
      past: "2025 중간고사",
      notes: "상수 · 실수 노트",
      codes: "검산 코드",
    },
  },
  en: {
    title: "Midterm Review — Weeks 1–6",
    subtitle: "Key formulas · Concept quiz · New practice problems · 2025 midterm · Constants & common pitfalls",
    tabs: {
      overview: "Overview & Week Map",
      formulas: "Key Formulas",
      quiz: "Concept Quiz",
      practice: "Practice",
      past: "2025 Midterm",
      notes: "Constants & Pitfalls",
      codes: "Check Code",
    },
  },
};

// ── design tokens (review accent: orange) ────────────────────
const C = {
  bg: "#0b0f17",
  panel: "#111827",
  card: "#1f2937",
  border: "#374151",
  text: "#e5e7eb",
  textDim: "#9ca3af",
  accent: "#fb923c",
  accentSoft: "#fdba74",
  ok: "#10b981",
  err: "#ef4444",
  sky: "#38bdf8",
};
const mono = "'JetBrains Mono',monospace";
const weekColor = w => (WEEKS.find(x => x.w === w) || {}).color || C.accent;

// =============================================================
// MAIN COMPONENT
// =============================================================
export default function MidtermReviewApp({ onBack, lang: langProp, onLangChange }) {
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
        ::-webkit-scrollbar{height:8px;width:8px}
        ::-webkit-scrollbar-thumb{background:#374151;border-radius:4px}
        .rvopt{transition:border-color .12s, background .12s}
        .rvopt:hover{border-color:${C.accent}}
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
            <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Space Grotesk','Noto Sans KR',sans-serif" }}>
              {t.title}
            </div>
            <div style={{ fontSize: 12, color: C.textDim }}>{t.subtitle}</div>
          </div>
          <div style={{ display: "flex", gap: 4, background: C.panel, borderRadius: 10, padding: 4, border: `1px solid ${C.border}` }}>
            {[["ko", "한국어"], ["en", "EN"]].map(([k, lb]) => (
              <button key={k} onClick={() => setLang(k)} style={{
                padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                background: lang === k ? C.accent : "transparent",
                color: lang === k ? "#0b0f17" : C.textDim,
                fontSize: 12, fontWeight: 700, fontFamily: mono,
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
        {tab === "overview" && <Overview lang={lang} goTo={setTab} />}
        {tab === "formulas" && <Formulas lang={lang} />}
        {tab === "quiz" && <Quiz lang={lang} />}
        {tab === "practice" && <Practice lang={lang} />}
        {tab === "past" && <Past lang={lang} />}
        {tab === "notes" && <Notes lang={lang} />}
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
    background: active ? "rgba(251,146,60,0.14)" : "transparent",
    color: active ? C.accentSoft : C.textDim,
    border: `1px solid ${active ? "rgba(251,146,60,0.4)" : "transparent"}`,
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
function HdSub({ children, color }) {
  return <h3 style={{ fontSize: 15, fontWeight: 700, margin: "16px 0 8px", color: color || C.accentSoft }}>{children}</h3>;
}
function Eq({ children, style }) {
  return (
    <div style={{
      background: "#0d1117", border: `1px solid ${C.border}`, borderRadius: 10,
      padding: "10px 14px", margin: "8px 0",
      fontFamily: mono, fontSize: 13.5, lineHeight: 1.75,
      color: C.accentSoft, overflowX: "auto", whiteSpace: "nowrap", ...style,
    }}>{children}</div>
  );
}
function Note({ children }) {
  return <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.7, margin: "8px 0" }}>{children}</p>;
}
function Pill({ color, children }) {
  return <span style={{
    display: "inline-block", padding: "2px 10px", borderRadius: 999,
    background: `${color}22`, color, fontSize: 11, fontWeight: 700,
    border: `1px solid ${color}55`, marginRight: 6, marginBottom: 4, whiteSpace: "nowrap",
  }}>{children}</span>;
}
function WeekFilter({ lang, value, onChange, counts }) {
  const isKo = lang === "ko";
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "4px 0 12px" }}>
      <button onClick={() => onChange(0)} style={{ ...btnStyle(value === 0), padding: "6px 12px", fontSize: 12 }}>
        {isKo ? "전체" : "All"}{counts ? ` (${counts[0]})` : ""}
      </button>
      {WEEKS.map(wk => (
        <button key={wk.w} onClick={() => onChange(wk.w)} style={{
          ...btnStyle(value === wk.w), padding: "6px 12px", fontSize: 12,
          background: value === wk.w ? wk.color : C.panel,
          borderColor: value === wk.w ? wk.color : `${wk.color}66`,
        }}>
          W{wk.w}{counts ? ` (${counts[wk.w]})` : ""}
        </button>
      ))}
    </div>
  );
}
function Toggle({ open, onClick, onLabel, offLabel }) {
  return (
    <button onClick={onClick} style={{ ...btnStyle(open), padding: "6px 14px", fontSize: 12, marginRight: 8, marginTop: 10 }}>
      {open ? onLabel : offLabel}
    </button>
  );
}
function StepList({ lines, color }) {
  return (
    <div style={{
      background: "#0d1117", border: `1px solid ${color || C.border}55`, borderRadius: 10,
      padding: "10px 14px", marginTop: 10,
    }}>
      {lines.map((ln, i) => (
        <div key={i} style={{ fontFamily: mono, fontSize: 13, lineHeight: 1.8, color: C.text, overflowX: "auto" }}>{ln}</div>
      ))}
    </div>
  );
}

// =============================================================
// 1) OVERVIEW & WEEK MAP
// =============================================================
function Overview({ lang, goTo }) {
  const isKo = lang === "ko";
  const [done, setDone] = useState({});
  const total = SKILLS.reduce((n, s) => n + s.ko.s.length, 0);
  const nDone = Object.values(done).filter(Boolean).length;
  const steps = isKo
    ? [["formulas", "핵심 공식을 주차별로 훑으며 각 식이 '무엇을 계산하는 식인지' 한 문장으로 말해 본다"],
       ["quiz", "개념 퀴즈 24문항으로 약한 주차를 찾는다"],
       ["practice", "연습문제를 종이와 계산기로 먼저 풀고, 막히면 힌트, 그다음 풀이를 연다"],
       ["past", "2025 중간고사를 시간을 재고 풀어 본 뒤 풀이와 비교한다"],
       ["notes", "상수표와 실수 노트로 단위·로그·인자 2π 같은 실수를 점검한다"]]
    : [["formulas", "Skim the key formulas week by week and say in one sentence what each one computes"],
       ["quiz", "Use the 24-question concept quiz to find your weakest weeks"],
       ["practice", "Solve the practice problems on paper with a calculator first; open the hint, then the solution, only when stuck"],
       ["past", "Do the 2025 midterm against the clock, then compare with the solutions"],
       ["notes", "Use the constants table and the pitfall notes to check units, logarithms and stray factors of 2π"]];
  return (
    <div>
      <Card>
        <Hd>{isKo ? "이 페이지의 사용법" : "How to use this page"}</Hd>
        <Note>
          {isKo
            ? "1~6주차 내용을 한곳에 모은 복습 자료입니다. 각 주차 모듈의 시뮬레이션으로 개념을 익혔다면, 여기서는 손으로 계산하고 식을 쓰는 연습에 집중합니다. 연습문제는 주차 모듈의 문제와 겹치지 않게 새로 만들었고, 모든 수치는 '검산 코드' 탭의 Python 스크립트로 다시 계산할 수 있습니다."
            : "A single review of Weeks 1–6. If the weekly modules' simulations built your intuition, this page is about calculating and writing equations by hand. The practice problems are new (they do not repeat the weekly modules), and every number can be recomputed with the Python script in the Check Code tab."}
        </Note>
        <HdSub>{isKo ? "추천 순서" : "Suggested order"}</HdSub>
        {steps.map(([k, txt], i) => (
          <div key={k} style={{ display: "flex", gap: 12, alignItems: "flex-start", margin: "8px 0" }}>
            <span style={{
              flex: "none", width: 26, height: 26, borderRadius: 999, background: `${C.accent}22`,
              border: `1px solid ${C.accent}66`, color: C.accentSoft, fontFamily: mono, fontSize: 12,
              display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
            }}>{i + 1}</span>
            <span style={{ fontSize: 13.5, lineHeight: 1.65, flex: 1 }}>{txt}</span>
            <button onClick={() => goTo(k)} style={{ ...btnStyle(), padding: "4px 12px", fontSize: 12, flex: "none" }}>
              {i18n[lang].tabs[k]} →
            </button>
          </div>
        ))}
      </Card>

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <Hd>{isKo ? "주차 지도와 자가 점검" : "Week map and self-check"}</Hd>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: mono, fontSize: 13, color: C.accentSoft }}>
            {nDone} / {total} {isKo ? "완료" : "done"}
          </span>
        </div>
        <div style={{ height: 8, background: C.card, borderRadius: 999, overflow: "hidden", margin: "0 0 14px" }}>
          <div style={{ width: `${(100 * nDone) / total}%`, height: "100%", background: C.accent, transition: "width .2s" }} />
        </div>
        <Note>
          {isKo
            ? "각 주차의 핵심 질문에 답할 수 있고, 아래 세 가지를 공식표를 보지 않고 할 수 있으면 체크하세요(체크는 이 화면에만 남습니다)."
            : "Tick a skill when you can answer the week's guiding question and do it without looking at the formula sheet (ticks stay on this screen only)."}
        </Note>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(330px,1fr))", gap: 14 }}>
          {SKILLS.map(sk => {
            const wk = WEEKS.find(x => x.w === sk.w);
            const L = isKo ? sk.ko : sk.en;
            return (
              <div key={sk.w} style={{ background: C.card, border: `1px solid ${wk.color}55`, borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: wk.color }}>Week {sk.w}</div>
                <div style={{ fontSize: 15, fontWeight: 800, margin: "4px 0 6px" }}>{isKo ? wk.ko : wk.en}</div>
                <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6, marginBottom: 8 }}>{L.q}</div>
                {L.s.map((s, i) => {
                  const key = `${sk.w}-${i}`;
                  return (
                    <label key={key} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, lineHeight: 1.55, margin: "6px 0", cursor: "pointer" }}>
                      <input type="checkbox" checked={!!done[key]}
                        onChange={() => setDone(d => ({ ...d, [key]: !d[key] }))}
                        style={{ marginTop: 3, accentColor: wk.color }} />
                      <span style={{ color: done[key] ? C.textDim : C.text, textDecoration: done[key] ? "line-through" : "none" }}>{s}</span>
                    </label>
                  );
                })}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// =============================================================
// 2) KEY FORMULAS
// =============================================================
function Formulas({ lang }) {
  const isKo = lang === "ko";
  const [wf, setWf] = useState(0);
  const [qry, setQry] = useState("");
  const counts = { 0: FORMULAS.length };
  WEEKS.forEach(wk => { counts[wk.w] = FORMULAS.filter(f => f.w === wk.w).length; });
  const q = qry.trim().toLowerCase();
  const list = FORMULAS.filter(f => (wf === 0 || f.w === wf) &&
    (!q || `${f.eq} ${f.en_eq || ""} ${f.ko} ${f.en}`.toLowerCase().includes(q)));
  return (
    <div>
      <Card>
        <Hd>{isKo ? "핵심 공식 (1~6주차)" : "Key formulas (Weeks 1–6)"}</Hd>
        <Note>
          {isKo
            ? "공식만 외우기보다 각 식이 무엇을 계산하는지, 언제 쓰는지를 함께 보세요. 주차 버튼으로 거르거나 검색창에 'Arrhenius', '상자', 'Debye' 같은 단어를 넣어 찾을 수 있습니다."
            : "Read each formula together with what it computes and when to use it. Filter by week, or search for words such as 'Arrhenius', 'box' or 'Debye'."}
        </Note>
        <WeekFilter lang={lang} value={wf} onChange={setWf} counts={counts} />
        <input value={qry} onChange={e => setQry(e.target.value)}
          placeholder={isKo ? "검색 (예: 반감기, Kelvin, 각운동량)" : "Search (e.g. half-life, Kelvin, angular)"}
          style={{
            width: "100%", maxWidth: 420, padding: "8px 12px", borderRadius: 10, background: C.card,
            border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: "none",
          }} />
      </Card>
      {WEEKS.filter(wk => list.some(f => f.w === wk.w)).map(wk => (
        <Card key={wk.w} style={{ borderColor: `${wk.color}55` }}>
          <HdSub color={wk.color}>Week {wk.w} · {isKo ? wk.ko : wk.en}</HdSub>
          {list.filter(f => f.w === wk.w).map((f, i) => (
            <div key={i} style={{ margin: "10px 0 14px" }}>
              <Eq style={{ color: wk.color }}>{isKo ? f.eq : (f.en_eq || f.eq)}</Eq>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.65, paddingLeft: 4 }}>{isKo ? f.ko : f.en}</div>
            </div>
          ))}
        </Card>
      ))}
      {list.length === 0 && (
        <Card><Note>{isKo ? "검색 결과가 없습니다." : "No matches."}</Note></Card>
      )}
    </div>
  );
}

// =============================================================
// 3) CONCEPT QUIZ
// =============================================================
function Quiz({ lang }) {
  const isKo = lang === "ko";
  const [wf, setWf] = useState(0);
  const [ans, setAns] = useState({});
  const items = QUIZ.map((qz, idx) => ({ ...qz, idx })).filter(qz => wf === 0 || qz.w === wf);
  const answered = items.filter(qz => ans[qz.idx] != null);
  const right = answered.filter(qz => ans[qz.idx] === qz.a).length;
  const counts = { 0: QUIZ.length };
  WEEKS.forEach(wk => { counts[wk.w] = QUIZ.filter(q => q.w === wk.w).length; });
  // per-week score summary
  const perWeek = WEEKS.map(wk => {
    const qs = QUIZ.map((qz, idx) => ({ ...qz, idx })).filter(qz => qz.w === wk.w && ans[qz.idx] != null);
    return { wk, n: qs.length, ok: qs.filter(qz => ans[qz.idx] === qz.a).length };
  });
  return (
    <div>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Hd>{isKo ? "개념 퀴즈" : "Concept quiz"}</Hd>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: mono, fontSize: 14, color: C.accentSoft }}>
            {isKo ? "정답" : "Correct"} {right} / {answered.length}
          </span>
          <button onClick={() => setAns({})} style={{ ...btnStyle(), padding: "6px 12px", fontSize: 12 }}>
            {isKo ? "다시 풀기" : "Reset"}
          </button>
        </div>
        <Note>
          {isKo
            ? "보기를 고르면 바로 채점되고 해설이 나옵니다. 계산보다 '왜'를 묻는 문항들이니, 틀린 문항의 주차를 공식표와 연습문제로 다시 보세요."
            : "Each choice is marked at once and the explanation appears. These ask 'why' more than 'how much'; revisit the weeks you miss in the formula sheet and the practice problems."}
        </Note>
        <WeekFilter lang={lang} value={wf} onChange={setWf} counts={counts} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {perWeek.map(({ wk, n, ok }) => (
            <Pill key={wk.w} color={n === 0 ? C.textDim : ok === n ? C.ok : ok >= n / 2 ? wk.color : C.err}>
              W{wk.w}: {n === 0 ? "—" : `${ok}/${n}`}
            </Pill>
          ))}
        </div>
      </Card>
      {items.map((qz, k) => {
        const L = isKo ? qz.ko : qz.en;
        const chosen = ans[qz.idx];
        const col = weekColor(qz.w);
        return (
          <Card key={qz.idx} style={{ borderColor: `${col}44` }}>
            <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 8 }}>
              <Pill color={col}>W{qz.w}</Pill>
              <span style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.6 }}>Q{k + 1}. {L.q}</span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {L.o.map((opt, j) => {
                const isChosen = chosen === j, isRight = qz.a === j, shown = chosen != null;
                const bc = shown && isRight ? C.ok : shown && isChosen ? C.err : C.border;
                const bg = shown && isRight ? `${C.ok}1f` : shown && isChosen ? `${C.err}1f` : C.card;
                return (
                  <button key={j} className="rvopt" disabled={shown}
                    onClick={() => setAns(a => ({ ...a, [qz.idx]: j }))}
                    style={{
                      textAlign: "left", padding: "9px 12px", borderRadius: 10, border: `1px solid ${bc}`,
                      background: bg, color: C.text, fontSize: 13.5, cursor: shown ? "default" : "pointer",
                      fontFamily: "inherit", lineHeight: 1.5,
                    }}>
                    <span style={{ fontFamily: mono, color: C.textDim, marginRight: 8 }}>{"ABCD"[j]}</span>
                    {opt}
                    {shown && isRight ? "  ✓" : ""}
                  </button>
                );
              })}
            </div>
            {chosen != null && (
              <div style={{
                marginTop: 10, padding: "10px 12px", borderRadius: 10, fontSize: 13, lineHeight: 1.65,
                background: chosen === qz.a ? `${C.ok}14` : `${C.err}14`,
                border: `1px solid ${chosen === qz.a ? C.ok : C.err}55`,
              }}>
                <b style={{ color: chosen === qz.a ? C.ok : C.err }}>
                  {chosen === qz.a ? (isKo ? "정답입니다. " : "Correct. ") : (isKo ? "다시 생각해 봅시다. " : "Not quite. ")}
                </b>
                {L.x}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// =============================================================
// 4) PRACTICE (new problems)
// =============================================================
function Practice({ lang }) {
  const isKo = lang === "ko";
  const [wf, setWf] = useState(0);
  const [hint, setHint] = useState({});
  const [sol, setSol] = useState({});
  const counts = { 0: PRACTICE.length };
  WEEKS.forEach(wk => { counts[wk.w] = PRACTICE.filter(p => p.w === wk.w).length; });
  const list = PRACTICE.filter(p => wf === 0 || p.w === wf);
  return (
    <div>
      <Card>
        <Hd>{isKo ? "연습문제 (손계산)" : "Practice problems (by hand)"}</Hd>
        <Note>
          {isKo
            ? "주차마다 2~3문제, 모두 13문제입니다. 종이와 계산기로 먼저 푼 뒤 힌트를, 그다음 풀이를 여세요. '설명용 가상 데이터'라고 적힌 문제의 수치는 계산 연습을 위해 만든 값입니다."
            : "Two or three problems per week, thirteen in all. Work each on paper with a calculator before opening the hint, then the solution. Numbers marked 'illustrative data' were made up for calculation practice."}
        </Note>
        <WeekFilter lang={lang} value={wf} onChange={setWf} counts={counts} />
      </Card>
      {list.map(p => {
        const L = isKo ? p.ko : p.en;
        const col = weekColor(p.w);
        return (
          <Card key={p.id} style={{ borderColor: `${col}44` }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <Pill color={col}>{p.id}</Pill>
              <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Space Grotesk','Noto Sans KR',sans-serif" }}>{L.t}</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.75, margin: "10px 0 0" }}>{L.q}</p>
            <div>
              <Toggle open={!!hint[p.id]} onClick={() => setHint(h => ({ ...h, [p.id]: !h[p.id] }))}
                onLabel={isKo ? "힌트 닫기" : "Hide hint"} offLabel={isKo ? "힌트" : "Hint"} />
              <Toggle open={!!sol[p.id]} onClick={() => setSol(s => ({ ...s, [p.id]: !s[p.id] }))}
                onLabel={isKo ? "풀이 닫기" : "Hide solution"} offLabel={isKo ? "풀이 보기" : "Show solution"} />
            </div>
            {hint[p.id] && (
              <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.65, color: C.accentSoft, background: `${C.accent}12`, border: `1px solid ${C.accent}44`, borderRadius: 10, padding: "8px 12px" }}>
                💡 {L.h}
              </div>
            )}
            {sol[p.id] && (
              <div>
                <StepList lines={L.s} color={col} />
                <div style={{ marginTop: 8, fontSize: 13.5, fontWeight: 700, color: C.ok }}>
                  {isKo ? "답: " : "Answer: "}<span style={{ fontWeight: 600, color: C.text }}>{L.a}</span>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// =============================================================
// 5) 2025 MIDTERM
// =============================================================
function Past({ lang }) {
  const isKo = lang === "ko";
  const [open, setOpen] = useState({});
  const allIds = PAST.flatMap(pb => pb.parts.map(pt => pt.id));
  const allOpen = allIds.every(id => open[id]);
  const toggleAll = () => {
    const next = {};
    allIds.forEach(id => { next[id] = !allOpen; });
    setOpen(next);
  };
  return (
    <div>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Hd>{isKo ? "2025년 가을 중간고사 (35점)" : "Fall 2025 midterm (35 points)"}</Hd>
          <div style={{ flex: 1 }} />
          <button onClick={toggleAll} style={{ ...btnStyle(allOpen), padding: "6px 12px", fontSize: 12 }}>
            {allOpen ? (isKo ? "풀이 모두 닫기" : "Hide all solutions") : (isKo ? "풀이 모두 펴기" : "Show all solutions")}
          </button>
        </div>
        <Note>
          {isKo
            ? "작년 시험 문제를 원문(영어) 그대로 싣고, 풀이는 다시 정리했습니다. 실제 시험처럼 시간을 재고 먼저 풀어 본 뒤 소문항별로 풀이를 열어 보세요. 작년 시험은 답안을 영어로 쓰는 형식이었습니다."
            : "Last year's questions are reproduced as written, with the solutions re-typeset. Time yourself as in the real exam, then open the solutions part by part. Answers were written in English."}
        </Note>
      </Card>
      {PAST.map(pb => (
        <Card key={pb.head}>
          <HdSub>{pb.head}</HdSub>
          <p style={{ fontSize: 14, lineHeight: 1.75, margin: "4px 0 6px" }}>{pb.intro}</p>
          {pb.parts.map(pt => (
            <div key={pt.id} style={{ borderTop: `1px solid ${C.border}`, padding: "12px 0 4px", marginTop: 10 }}>
              <div style={{ fontSize: 14, lineHeight: 1.75 }}>
                <b>{pt.id} ({pt.pts} {pt.pts === 1 ? "point" : "points"}).</b> {pt.q}
              </div>
              <Toggle open={!!open[pt.id]} onClick={() => setOpen(o => ({ ...o, [pt.id]: !o[pt.id] }))}
                onLabel={isKo ? "풀이 닫기" : "Hide solution"} offLabel={isKo ? "풀이 보기" : "Show solution"} />
              {open[pt.id] && (
                <div>
                  <StepList lines={pt.s} color={C.accent} />
                  {pt.note && <Note>※ {isKo ? pt.note.ko : pt.note.en}</Note>}
                </div>
              )}
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
}

// =============================================================
// 6) CONSTANTS & PITFALLS
// =============================================================
function Notes({ lang }) {
  const isKo = lang === "ko";
  return (
    <div>
      <Card>
        <Hd>{isKo ? "자주 쓰는 상수" : "Frequently used constants"}</Hd>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 8 }}>
          {CONSTANTS.map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px" }}>
              <span style={{ fontFamily: mono, fontSize: 13, color: C.accentSoft }}>{k}</span>
              <span style={{ fontFamily: mono, fontSize: 13, color: C.text, textAlign: "right" }}>{v}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <Hd>{isKo ? "자주 하는 실수 12가지" : "Twelve common pitfalls"}</Hd>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(330px,1fr))", gap: 12 }}>
          {PITFALLS.map((p, i) => {
            const [title, body] = isKo ? p.ko : p.en;
            return (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>
                  <span style={{ fontFamily: mono, color: C.accent, marginRight: 8 }}>{String(i + 1).padStart(2, "0")}</span>{title}
                </div>
                <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.65 }}>{body}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// =============================================================
// 7) CHECK CODE (Python)
// =============================================================
function RawCodes({ lang }) {
  const isKo = lang === "ko";
  const [copied, setCopied] = useState(false);
  const fname = "midterm_review_check.py";
  const doCopy = () => {
    const ta = document.createElement("textarea");
    ta.value = PY_REVIEW; document.body.appendChild(ta);
    ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };
  const doDownload = () => {
    const blob = new Blob([PY_REVIEW], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = fname; a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <Card>
      <Hd>{isKo ? "검산 코드 (Python)" : "Check code (Python)"}</Hd>
      <Note>
        {isKo
          ? "연습문제와 2025 중간고사 풀이에 나오는 모든 수치를 다시 계산하는 스크립트입니다. 손으로 푼 답을 맞춰 보거나, 입력값(상자 길이, 온도, 데이터)을 바꿔 결과가 어떻게 달라지는지 확인해 보세요. 실행: python midterm_review_check.py"
          : "This script recomputes every number in the practice problems and the 2025 midterm solutions. Check your hand calculations, or change the inputs (box length, temperature, data) and see how the results move. Run: python midterm_review_check.py"}
      </Note>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "10px 0" }}>
        <button onClick={doCopy} style={btnStyle()}>{copied ? "✓ " + (isKo ? "복사됨" : "Copied") : (isKo ? "복사" : "Copy")}</button>
        <button onClick={doDownload} style={btnStyle()}>{isKo ? "다운로드" : "Download"} {fname}</button>
      </div>
      <pre style={{
        background: "#0d1117", border: `1px solid ${C.border}`, borderRadius: 10,
        padding: 18, overflowX: "auto", fontSize: 12.5, lineHeight: 1.6,
        fontFamily: mono, color: "#c9d1d9", maxHeight: 620, overflowY: "auto",
      }}>{PY_REVIEW}</pre>
    </Card>
  );
}
