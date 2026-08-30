# Physical Chemistry 2 — Interactive Learning Modules

**물리화학 2 인터랙티브 학습 웹앱**
성균관대학교 화학공학부 · Smart Process & Materials Design Lab (SPMDL) · Prof. S. Joon Kwon

Undergraduate Physical Chemistry 2 (quantum mechanics · spectroscopy · statistical
thermodynamics) course materials, built as a Vite + React single-page app.
Companion repo to [Fluid-Mechanics-ChE-Undergrad](https://github.com/sjoonkwon0531/Fluid-Mechanics-ChE-Undergrad).

## Weeks

| Week | Topic | Highlights |
|---|---|---|
| 1 | 양자역학의 탄생 (Birth of Quantum Mechanics) | Planck 법칙 탐색기, 최소작용 실험실, Helmholtz 2D 모드, 브라우저 내 Schrödinger FDM 고유값 솔버 |

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build (dist/)
```

## Structure

```
src/App.jsx          hub (landing + week registry)
src/WeekNNApp.jsx    self-contained weekly module (ko/en, tabs, live simulations)
src/WeekNNCodes.js   raw code strings shown in each module's Raw Codes tab
codes/               standalone hands-on codes (Python · MATLAB · Julia · C++)
docs/                integration guides
```

To add a week: import the module in `src/App.jsx`, add its metadata to `weeks`,
and register it in `comps` — three edits total (see `docs/WEEK01_INTEGRATION_GUIDE.md`).

All simulations run client-side; no backend required. Deployed on Vercel.
