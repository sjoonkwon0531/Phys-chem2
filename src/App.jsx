// ============================================================
// App.jsx — Physical Chemistry 2 hub
// SKKU School of Chemical Engineering — SPMDL — Prof. S. Joon Kwon
// ------------------------------------------------------------
// To add a new week:
//   1) import WeekNNApp from "./WeekNNApp"
//   2) add metadata to `weeks` (both ko / en arrays)
//   3) register the component in `comps`
// ============================================================
import { useState } from "react";
import Week01App from "./Week01App";

const T = {
  ko: {
    title: "물리화학 2",
    subtitle: "Physical Chemistry 2 — 인터랙티브 학습 모듈",
    dept: "성균관대학교 화학공학부 · Smart Process & Materials Design Lab (SPMDL)",
    prof: "권석준 교수",
    footer: "각 주차 카드를 눌러 학습을 시작하세요. 모든 시뮬레이션은 브라우저에서 실시간으로 실행됩니다.",
    weeks: [
      {
        id: 1,
        title: "Week 1",
        subtitle: "양자역학의 탄생",
        topics: ["흑체복사·자외선 파탄", "Planck 양자화", "최소작용·Lagrangian·Hamiltonian", "Hamilton-Jacobi", "파동방정식·Helmholtz 모드", "Schrödinger 고유값 문제"],
        color: "#f59e0b",
      },
    ],
  },
  en: {
    title: "Physical Chemistry 2",
    subtitle: "Interactive learning modules",
    dept: "School of Chemical Engineering, SKKU · Smart Process & Materials Design Lab (SPMDL)",
    prof: "Prof. S. Joon Kwon",
    footer: "Click a week card to begin. All simulations run live in your browser.",
    weeks: [
      {
        id: 1,
        title: "Week 1",
        subtitle: "Birth of Quantum Mechanics",
        topics: ["Blackbody & UV catastrophe", "Planck quantization", "Least action · Lagrangian · Hamiltonian", "Hamilton-Jacobi", "Wave equation · Helmholtz modes", "Schrödinger as eigenvalue problem"],
        color: "#f59e0b",
      },
    ],
  },
};

const comps = {
  1: Week01App,
};

// language persistence (safe if storage is unavailable)
const loadLang = () => {
  try { return localStorage.getItem("pchem2_lang"); } catch { return null; }
};
const saveLang = k => {
  try { localStorage.setItem("pchem2_lang", k); } catch { /* ignore */ }
};

export default function App() {
  const [lang, setLangState] = useState(loadLang);   // null → show language gate
  const [week, setWeek] = useState(null);
  const setLang = k => { setLangState(k); saveLang(k); };

  // global back-to-home hook used by week modules
  window.__backToHome = () => setWeek(null);

  // ── first visit: KOR / ENG selection screen ────────────────
  if (lang === null) {
    return <LanguageGate onSelect={setLang} />;
  }

  const t = T[lang];

  if (week !== null) {
    const W = comps[week];
    return <W onBack={() => setWeek(null)} lang={lang} onLangChange={setLang} />;
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0b0f17", color: "#e5e7eb",
      fontFamily: "'DM Sans','Noto Sans KR',-apple-system,sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Space+Grotesk:wght@600;700&family=JetBrains+Mono:wght@400;700&family=Noto+Sans+KR:wght@400;500;700&display=swap');
        *{box-sizing:border-box}
        .wkcard{transition:transform .18s, box-shadow .18s; cursor:pointer}
        .wkcard:hover{transform:translateY(-4px)}
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px" }}>
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: "#9ca3af", fontFamily: "'JetBrains Mono',monospace", marginBottom: 10 }}>
              SKKU ChE · 2026 Fall
            </div>
            <h1 style={{
              fontSize: 42, fontWeight: 800, margin: 0,
              fontFamily: "'Space Grotesk','Noto Sans KR',sans-serif",
              background: "linear-gradient(90deg,#f59e0b,#f472b6 60%,#a78bfa)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>⚛️ {t.title}</h1>
            <div style={{ fontSize: 15, color: "#9ca3af", marginTop: 8 }}>{t.subtitle}</div>
            <div style={{ fontSize: 12.5, color: "#6b7280", marginTop: 12, lineHeight: 1.7 }}>
              {t.dept}<br />{t.prof}
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, background: "#111827", borderRadius: 10, padding: 4, border: "1px solid #374151" }}>
            {[["ko", "한국어"], ["en", "EN"]].map(([k, lb]) => (
              <button key={k} onClick={() => setLang(k)} style={{
                padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                background: lang === k ? "#f59e0b" : "transparent",
                color: lang === k ? "#0b0f17" : "#9ca3af",
                fontSize: 12.5, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace",
              }}>{lb}</button>
            ))}
          </div>
        </div>

        {/* week cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
          gap: 18, marginTop: 44,
        }}>
          {t.weeks.map(w => (
            <div key={w.id} className="wkcard" onClick={() => setWeek(w.id)} style={{
              background: "#111827", border: `1px solid ${w.color}44`, borderRadius: 16,
              padding: "22px 24px", boxShadow: `0 0 0 rgba(0,0,0,0)`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{
                  fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700,
                  color: w.color,
                }}>{w.title}</span>
                <span style={{ fontSize: 20 }}>→</span>
              </div>
              <div style={{ fontSize: 19, fontWeight: 800, margin: "8px 0 14px", fontFamily: "'Space Grotesk','Noto Sans KR',sans-serif" }}>
                {w.subtitle}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {w.topics.map((tp, i) => (
                  <span key={i} style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: 999,
                    background: `${w.color}18`, color: "#d1d5db", border: `1px solid ${w.color}33`,
                  }}>{tp}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 40, fontSize: 13, color: "#6b7280" }}>{t.footer}</p>
      </div>
    </div>
  );
}

// =============================================================
// LanguageGate — first-visit KOR / ENG selection screen
// =============================================================
function LanguageGate({ onSelect }) {
  return (
    <div style={{
      minHeight: "100vh", background: "#0b0f17", color: "#e5e7eb",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans','Noto Sans KR',-apple-system,sans-serif",
      padding: 24,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Space+Grotesk:wght@600;700&family=JetBrains+Mono:wght@400;700&family=Noto+Sans+KR:wght@400;500;700&display=swap');
        *{box-sizing:border-box}
        .langbtn{transition:transform .15s, border-color .15s, background .15s; cursor:pointer}
        .langbtn:hover{transform:translateY(-3px); border-color:#f59e0b; background:rgba(245,158,11,0.08)}
      `}</style>
      <div style={{ textAlign: "center", maxWidth: 640 }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>⚛️</div>
        <h1 style={{
          fontSize: 34, fontWeight: 800, margin: 0,
          fontFamily: "'Space Grotesk','Noto Sans KR',sans-serif",
          background: "linear-gradient(90deg,#f59e0b,#f472b6 60%,#a78bfa)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          물리화학 2 · Physical Chemistry 2
        </h1>
        <div style={{ fontSize: 13.5, color: "#9ca3af", marginTop: 10, lineHeight: 1.7 }}>
          School of Chemical Engineering, SKKU<br />
          Smart Process &amp; Materials Design Lab (SPMDL) · Prof. S. Joon Kwon
        </div>

        <div style={{
          fontSize: 14, color: "#d1d5db", marginTop: 36, marginBottom: 16, fontWeight: 500,
        }}>
          언어를 선택하세요 &nbsp;·&nbsp; Choose your language
        </div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="langbtn" onClick={() => onSelect("ko")} style={gateBtn()}>
            <div style={{ fontSize: 30 }}>🇰🇷</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 8 }}>한국어</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>한국어로 학습하기</div>
          </button>
          <button className="langbtn" onClick={() => onSelect("en")} style={gateBtn()}>
            <div style={{ fontSize: 30 }}>🇺🇸</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 8 }}>English</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Learn in English</div>
          </button>
        </div>
        <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 24 }}>
          언제든지 우측 상단에서 변경할 수 있습니다 · You can switch anytime from the top-right corner
        </div>
      </div>
    </div>
  );
}
const gateBtn = () => ({
  width: 200, padding: "26px 20px", borderRadius: 16,
  background: "#111827", border: "1px solid #374151", color: "#e5e7eb",
  fontFamily: "inherit",
});
