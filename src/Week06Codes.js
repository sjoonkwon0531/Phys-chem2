/* ============================================================
   Week06Codes.js — Physical Chemistry 2, Week 6
   Raw code samples: Macromolecules, Self-Assembly & Chemical Kinetics
   - 4 topics: polymer_chain, dlvo_micelle, rate_laws,
               relaxation_arrhenius
   - 4 languages: Python, MATLAB, Julia, C++
   Imported by Week06App.jsx > RawCodes tab.
   Auto-generated from codes/ — edit the standalone files, then regenerate.
   ============================================================ */

// ── python/wk06_polymer_chain.py ─────────────────
export const PY_POLYMER = `"""
Wk06 — Macromolecules: molar-mass averages, random coils, entropic elasticity
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Averages:  Mn = sum(N_i M_i)/sum(N_i),  Mw = sum(N_i M_i^2)/sum(N_i M_i),
               Mz = sum(N_i M_i^3)/sum(N_i M_i^2),  dispersity D = Mw/Mn
    Step-growth (Schulz-Flory) chains at conversion p: D = 1 + p -> 2.
(2) Freely jointed chain (N bonds of length l), Monte Carlo:
      <R^2> = N l^2          (R_rms = N^{1/2} l)
      Rg^2  = N l^2 / 6      (same in 1D and 3D: the derivation only uses
                              <a_k . a_l> = l^2 delta_kl)
    1D end-to-end distribution -> Gaussian  P = (2/pi N)^{1/2} exp(-n^2/2N)
(3) Fixed bond angle (tetrahedral, 109.5 deg): <R^2> = 2 N l^2  (F = sqrt 2)
(4) Conformational entropy & restoring force (nu = n/N):
      dS = -(1/2) k N ln[(1+nu)^(1+nu) (1-nu)^(1-nu)]
      F  = (kT/2l) ln[(1+nu)/(1-nu)]  ~  nu kT / l   (Hooke, small nu)

Run:  python wk06_polymer_chain.py     (~5 s)
"""
import numpy as np
import matplotlib.pyplot as plt
from math import comb

rng = np.random.default_rng(6)
KB = 1.380649e-23

# -- (1) molar-mass averages ----------------------------------
def averages(Ni, Mi):
    Ni, Mi = np.asarray(Ni, float), np.asarray(Mi, float)
    Mn = (Ni * Mi).sum() / Ni.sum()
    Mw = (Ni * Mi**2).sum() / (Ni * Mi).sum()
    Mz = (Ni * Mi**3).sum() / (Ni * Mi**2).sum()
    return Mn, Mw, Mz

Mn, Mw, Mz = averages([1, 1], [10.0, 100.0])       # equal NUMBERS of chains
print("blend: equal numbers of 10 and 100 kg/mol chains")
print(f"  Mn = {Mn:.1f}, Mw = {Mw:.1f}, Mz = {Mz:.1f} kg/mol,  D = Mw/Mn = {Mw/Mn:.3f}")
print("  -> Mw > Mn always: heavy chains count more when weighted by mass\\n")

print("Schulz-Flory (most probable) distribution, M0 = 100 g/mol:")
print("   p      Xn=1/(1-p)   Mn        Mw        Mz       D     (1+p)")
i = np.arange(1, 200001)
for p in (0.90, 0.99, 0.999):
    Ni = (1 - p) * p**(i - 1)
    Mn, Mw, Mz = averages(Ni, 100.0 * i)
    print(f"  {p:5.3f}  {1/(1-p):9.0f}  {Mn:8.0f}  {Mw:8.0f}  {Mz:8.0f}  {Mw/Mn:5.3f}  {1+p:5.3f}")
print("  -> Carothers: 99% conversion gives only 100-mers; D -> 2, Mn:Mw:Mz -> 1:2:3\\n")

# -- (2) freely jointed chain: Monte Carlo --------------------
def fjc(N, M, dim):
    if dim == 1:
        b = rng.choice([-1.0, 1.0], size=(M, N, 1))
    else:
        b = rng.normal(size=(M, N, 3))
        b /= np.linalg.norm(b, axis=2, keepdims=True)
    r = np.concatenate([np.zeros((M, 1, b.shape[2])), np.cumsum(b, axis=1)], axis=1)
    R2 = (r[:, -1]**2).sum(1).mean()
    Rg2 = ((r - r.mean(1, keepdims=True))**2).sum(2).mean(1).mean()
    return R2, Rg2

N, M = 100, 20000
exact = N * (N + 2) / (6 * (N + 1))                 # N+1 beads, exact
print(f"freely jointed chain, N = {N} bonds, {M} chains (l = 1):")
for dim in (3, 1):
    R2, Rg2 = fjc(N, M, dim)
    print(f"  {dim}D:  <R^2> = {R2:7.2f} (N l^2 = {N}),  Rg^2 = {Rg2:6.2f} "
          f"(exact {exact:.2f} ~ N l^2/6 = {N/6:.2f})")
print("  -> R_rms = N^(1/2) l and Rg = (N/6)^(1/2) l hold in 1D AND 3D\\n")

# sum check of the lecture derivation: Rg^2 = l^2/(2N^2) sum_ij |j - i|
idx = np.arange(N)
S = np.abs(idx[:, None] - idx[None, :]).sum()
print(f"direct sum, N = {N} beads: Rg^2 = {S/(2*N*N):.4f} = (l^2/6)(N - 1/N) = {(N - 1/N)/6:.4f}\\n")

# 1D distribution: exact binomial vs Gaussian
print("1D end-to-end distribution, N = 100:   n    exact      Gaussian")
for n in (0, 10, 20, 30):
    Pex = comb(N, (N + n) // 2) / 2**N
    Pg = np.sqrt(2 / (np.pi * N)) * np.exp(-n * n / (2 * N))
    print(f"                                     {n:3d}  {Pex:.5f}    {Pg:.5f}")
print()

# -- (3) fixed bond angle (freely rotating chain) -------------
def frc(N, M, cosg):
    sing = np.sqrt(1 - cosg**2)
    b = rng.normal(size=(M, 3)); b /= np.linalg.norm(b, axis=1, keepdims=True)
    R = b.copy()
    for _ in range(N - 1):
        t = rng.normal(size=(M, 3))
        u = t - (t * b).sum(1, keepdims=True) * b
        u /= np.linalg.norm(u, axis=1, keepdims=True)
        b = cosg * b + sing * u                     # fixed angle, free rotation
        R += b
    return (R**2).sum(1).mean()

Nb, c = 200, 1 / 3                                  # bond angle 109.5 deg
fin = (1 + c) / (1 - c) - 2 * c * (1 - c**Nb) / (Nb * (1 - c)**2)
print(f"tetrahedral chain, N = {Nb}: <R^2>/(N l^2) = {frc(Nb, 20000, c)/Nb:.3f} "
      f"(theory {fin:.3f} -> F^2 = 2)")
Npe, lpe = 4000, 0.154                              # polyethylene, C-C bond [nm]
print(f"polyethylene N = {Npe}, l = {lpe} nm: contour {Npe*lpe:.0f} nm, "
      f"R_rms = {np.sqrt(2*Npe)*lpe:.1f} nm, Rg = {np.sqrt(Npe/3)*lpe:.2f} nm\\n")

# -- (4) conformational entropy & restoring force -------------
nu = np.linspace(-0.95, 0.95, 381)
dS = -0.5 * np.log((1 + nu)**(1 + nu) * (1 - nu)**(1 - nu))     # per N k
Fr = 0.5 * np.log((1 + nu) / (1 - nu))                          # F l / kT
l_seg, T = 0.5e-9, 298.15
print(f"restoring force, l = 0.5 nm, T = 298 K (kT/l = {KB*T/l_seg*1e12:.2f} pN):")
for x in (0.1, 0.5, 0.9):
    F = KB * T / (2 * l_seg) * np.log((1 + x) / (1 - x))
    print(f"  nu = {x:.1f}: F = {F*1e12:5.2f} pN   (Hooke: {x*KB*T/l_seg*1e12:5.2f} pN)")
print("  -> a purely ENTROPIC spring: F is proportional to T (rubber stiffens when hot)")

fig, ax = plt.subplots(1, 3, figsize=(13, 4))
ii = np.arange(1, 1500)
for p in (0.98, 0.99, 0.995):
    ax[0].plot(ii * 0.1, ii * (1 - p)**2 * p**(ii - 1), label=f"p = {p}")
ax[0].set_xlabel("M [kg/mol]"); ax[0].set_ylabel("weight fraction")
ax[0].set_title("Schulz-Flory distributions"); ax[0].legend()
ax[1].plot(nu, dS); ax[1].set_xlabel("nu = n/N"); ax[1].set_ylabel("dS / Nk")
ax[1].set_title("conformational entropy")
ax[2].plot(nu, Fr, label="exact"); ax[2].plot(nu, nu, "--", label="Hooke")
ax[2].set_ylim(-2.2, 2.2); ax[2].set_xlabel("nu = n/N"); ax[2].set_ylabel("F l / kT")
ax[2].set_title("entropic restoring force"); ax[2].legend()
plt.tight_layout(); plt.show()
`;

// ── python/wk06_dlvo_micelle.py ──────────────────
export const PY_DLVO = `"""
Wk06 — Colloid stability (DLVO) and micelle formation
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Electrical double layer: Debye screening length
      kappa = sqrt(2 z^2 e^2 n0 / (eps kT)),  n0 = 1000 N_A c   (z:z salt)
      -> kappa^-1 = 0.304/sqrt(c[M]) nm for a 1:1 salt in water at 25 C
(2) DLVO pair energy of two spheres (radius a, gap h):
      U = -A_H a/(12 h) + (64 pi kT n0 a gamma^2 / kappa^2) exp(-kappa h)
      gamma = tanh(z e phi0 / 4kT)
    Adding salt shrinks kappa^-1, the barrier collapses -> coagulation.
    Critical coagulation concentration scales as z^-6 (Schulze-Hardy).
(3) Micelles, closed-association model  N M <-> M_N  with [M_N] = K [M]^N:
      c_total = [M] + N K [M]^N    -> sharp CMC for large N

Run:  python wk06_dlvo_micelle.py
"""
import numpy as np
import matplotlib.pyplot as plt

E = 1.602176634e-19
KB = 1.380649e-23
NA = 6.02214076e23
EPS = 78.5 * 8.8541878128e-12          # water, 25 C
T = 298.15
KT = KB * T

def kappa(c_M, z=1):
    n0 = 1000 * NA * c_M
    return np.sqrt(2 * z * z * E * E * n0 / (EPS * KT))

# -- (1) Debye length ----------------------------------------
print("1:1 salt      kappa^-1 [nm]    0.304/sqrt(c)")
for c in (1e-3, 1e-2, 0.1, 0.15, 0.6):
    print(f"  {c:6.3f} M   {1e9/kappa(c):10.3f}     {0.304/np.sqrt(c):8.3f}")
print("-> physiological saline (0.15 M): charges are screened beyond ~0.8 nm\\n")

# -- (2) DLVO -------------------------------------------------
def dlvo(h, c_M, a=100e-9, AH=2.0e-20, phi0=0.030, z=1):
    k = kappa(c_M, z)
    n0 = 1000 * NA * c_M
    g = np.tanh(z * E * phi0 / (4 * KT))
    Uvdw = -AH * a / (12 * h)
    Uel = 64 * np.pi * KT * n0 * a * g * g / k**2 * np.exp(-k * h)
    return (Uvdw + Uel) / KT

h = np.logspace(np.log10(0.1e-9), np.log10(100e-9), 6000)
print("a = 100 nm, A_H = 2e-20 J, phi0 = 30 mV:")
print("  c [M]    barrier U_max/kT   at h [nm]   verdict")
for c in (1e-3, 1e-2, 3e-2, 0.1, 0.6):
    U = dlvo(h, c)
    j = np.argmax(U)
    if U[j] <= 0:
        print(f"  {c:6.3f}       no barrier                 rapid coagulation")
        continue
    verdict = "stable" if U[j] > 15 else "slow coagulation"
    print(f"  {c:6.3f}   {U[j]:12.1f}      {h[j]*1e9:6.2f}     {verdict}")
print("-> more salt, thinner double layer, lower barrier: why river clay")
print("   settles into a delta where it meets the sea (~0.6 M)\\n")

# critical coagulation concentration: the barrier top touches zero,
#   U = 0 and dU/dh = 0  ->  kappa h = 1  ->  n0,c ~ gamma^4 / (z^6 A_H^2)
def ccc(z, phi0=0.030, AH=2.0e-20, gamma=None):
    g = np.tanh(z * E * phi0 / (4 * KT)) if gamma is None else gamma
    kc = 384 * np.pi * EPS * KT**2 * g * g / (np.e * z * z * E * E * AH)
    n0 = kc**2 * EPS * KT / (2 * z * z * E * E)
    return n0 / (1000 * NA)

# numerical cross-check for z = 1: bisect on the barrier height
lo, hi = 1e-3, 1.0
for _ in range(60):
    mid = np.sqrt(lo * hi)
    if dlvo(h, mid).max() > 0:
        lo = mid
    else:
        hi = mid
print(f"critical coagulation concentration, z = 1: analytic {ccc(1)*1e3:.1f} mM, "
      f"numerical {np.sqrt(lo*hi)*1e3:.1f} mM")
print("  fixed phi0 = 30 mV:   z = 1: %.1f mM   z = 2: %.1f mM   z = 3: %.2f mM"
      % (ccc(1) * 1e3, ccc(2) * 1e3, ccc(3) * 1e3))
r2, r3 = ccc(1, gamma=1.0) / ccc(2, gamma=1.0), ccc(1, gamma=1.0) / ccc(3, gamma=1.0)
print(f"  high-potential limit (gamma -> 1):  1 : 1/{r2:.0f} : 1/{r3:.0f}   (z^-6)")
print("-> Schulze-Hardy rule: multivalent counter-ions (Ca2+, Al3+) coagulate")
print("   colloids at far lower concentrations than Na+\\n")

# -- (3) micelles: closed association ------------------------
def monomer(ctot, N, K=1.0):
    lo, hi = 0.0, ctot                       # c = m + N K m^N is monotonic in m
    for _ in range(200):
        mid = 0.5 * (lo + hi)
        if mid + N * K * mid**N > ctot:
            hi = mid
        else:
            lo = mid
    return 0.5 * (lo + hi)

print("fraction of surfactant in micelles (K = 1, reduced units):")
print("  c_total     N = 3     N = 30    N = 100")
for ct in (0.5, 0.9, 1.0, 1.5, 3.0, 10.0):
    fr = []
    for N in (3, 30, 100):
        m = monomer(ct, N)
        fr.append(1 - m / ct)
    print(f"  {ct:6.2f}    {fr[0]:6.3f}    {fr[1]:6.3f}    {fr[2]:6.3f}")
print("-> large aggregation number N: nothing, then suddenly micelles (the CMC)")

fig, ax = plt.subplots(1, 2, figsize=(11, 4.2))
for c in (1e-3, 1e-2, 3e-2, 0.1):
    ax[0].semilogx(h * 1e9, dlvo(h, c), label=f"{c*1e3:g} mM")
ax[0].axhline(0, c="gray", lw=0.8); ax[0].set_ylim(-40, 60)
ax[0].set_xlabel("gap h [nm]"); ax[0].set_ylabel("U / kT")
ax[0].set_title("DLVO: salt lowers the barrier"); ax[0].legend()
ct = np.linspace(0.01, 4, 300)
for N in (3, 30, 100):
    m = np.array([monomer(x, N) for x in ct])
    ax[1].plot(ct, m, label=f"monomer, N = {N}")
ax[1].plot(ct, ct, "k:", lw=0.8)
ax[1].set_xlabel("total surfactant"); ax[1].set_ylabel("free monomer")
ax[1].set_title("monomer concentration saturates at the CMC"); ax[1].legend()
plt.tight_layout(); plt.show()
`;

// ── python/wk06_rate_laws.py ─────────────────────
export const PY_RATES = `"""
Wk06 — Chemical kinetics I: rate laws, initial rates, integrated rate laws
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Following a reaction by pressure:  2 N2O5 -> 4 NO2 + O2
      P = (1 + 3 alpha / 2) P0        (alpha = fraction decomposed)
(2) Method of initial rates:  2 I + Ar -> I2 + Ar
      log v0 = log k' + a log[I]0,   log k' = log k + b log[Ar]0
      -> a = 2, b = 1, k = 8.7e9 dm^6 mol^-2 s^-1
(3) Integrated rate laws and half-lives
      0th: [A] = [A]0 - kt            t1/2 = [A]0/2k
      1st: [A] = [A]0 exp(-kt)        t1/2 = ln2/k        (constant!)
      2nd: 1/[A] = 1/[A]0 + kt        t1/2 = 1/(k[A]0)
(4) Azomethane decomposition at 600 K: first-order test, k and t1/2
(5) A + B -> P with [A]0 != [B]0: integrated form vs RK4 integration

Run:  python wk06_rate_laws.py
"""
import numpy as np
import matplotlib.pyplot as plt

def linfit(x, y):
    s, i = np.polyfit(x, y, 1)
    res = y - (s * x + i)
    return s, i, 1 - res.var() / y.var()

# -- (1) N2O5 total pressure ---------------------------------
print("2 N2O5 -> 4 NO2 + O2 at constant V:   alpha   P/P0")
for al in (0.0, 0.25, 0.5, 1.0):
    print(f"                                       {al:4.2f}   {1 + 1.5*al:.3f}")
print("-> a pressure gauge is a kinetics instrument: alpha = (2/3)(P/P0 - 1)\\n")

# -- (2) method of initial rates -----------------------------
I0 = np.array([1.0, 2.0, 4.0, 6.0]) * 1e-5          # mol/dm^3
Ar = np.array([1.0e-3, 5.0e-3, 1.0e-2])             # mol/dm^3
v0 = np.array([[8.70e-4, 3.48e-3, 1.39e-2, 3.13e-2],
               [4.35e-3, 1.74e-2, 6.96e-2, 1.57e-1],
               [8.69e-3, 3.47e-2, 1.38e-1, 3.13e-1]])   # mol dm^-3 s^-1
logk_eff = []
print("2 I + Ar -> I2 + Ar:  [Ar]0 [mM]   slope a   log k'")
for j in range(3):
    a, lk, _ = linfit(np.log10(I0), np.log10(v0[j]))
    logk_eff.append(lk)
    print(f"                      {Ar[j]*1e3:6.1f}     {a:6.3f}   {lk:6.3f}")
b, logk, _ = linfit(np.log10(Ar), np.array(logk_eff))
print(f"  order in Ar: b = {b:.3f},  log k = {logk:.3f}")
k_pts = v0 / (I0[None, :]**2 * Ar[:, None])
print(f"  k = v0/([I]^2[Ar]) over all 12 points = {k_pts.mean():.2e} dm^6 mol^-2 s^-1 "
      f"(spread {100*k_pts.std()/k_pts.mean():.2f} %)")
print("-> v0 = k [I]^2 [Ar]: second order in I, first in Ar, third overall")
bad = linfit(np.log10(np.array([1, 2, 3, 4]) * 1e-5), np.log10(v0[0]))[0]
print(f"   (check: reading the same rates against [I]0 = 1,2,3,4 x 1e-5 gives slope {bad:.2f},")
print("    so the rate table belongs to [I]0 = 1,2,4,6 x 1e-5)\\n")

# -- (3) integrated rate laws & successive half-lives --------
def conc(order, k, A0, t):
    if order == 0:
        return np.maximum(A0 - k * t, 0.0)
    if order == 1:
        return A0 * np.exp(-k * t)
    return A0 / (1 + k * t * A0)

def half_life(order, k, A0):
    return {0: A0 / (2 * k), 1: np.log(2) / k, 2: 1 / (k * A0)}[order]

print("successive half-lives (k = 1, [A]0 = 1):")
for order in (0, 1, 2):
    A, hl = 1.0, []
    for _ in range(3):
        hl.append(half_life(order, 1.0, A)); A /= 2
    print(f"  order {order}: {hl[0]:.3f}, {hl[1]:.3f}, {hl[2]:.3f}")
print("-> halving / constant / doubling: the half-life pattern reveals the order\\n")

# -- (4) azomethane, 600 K -----------------------------------
t = np.array([0, 1000, 2000, 3000, 4000.0])          # s
p = np.array([10.9, 7.63, 5.32, 3.71, 2.59])         # Pa
s1, _, r1 = linfit(t, np.log(p / p[0]))
_, _, r0 = linfit(t, p)
_, _, r2 = linfit(t, 1 / p)
k1 = -s1
print("azomethane CH3N2CH3 -> C2H6 + N2 at 600 K:")
print("  p/p0 =", np.round(p / p[0], 3))
print(f"  linearity R^2:  zeroth {r0:.4f} | first {r1:.6f} | second {r2:.4f}")
print(f"  k = {k1:.2e} s^-1,  t1/2 = ln2/k = {np.log(2)/k1:.0f} s,  tau = 1/k = {1/k1:.0f} s")
print(f"  time to 10 % remaining = ln10/k = {np.log(10)/k1:.0f} s\\n")

# -- (5) A + B -> P, unequal concentrations ------------------
kr, A0, B0 = 2.0, 1.0, 1.5
def rhs(y):
    r = kr * y[0] * y[1]
    return np.array([-r, -r])
y, dt = np.array([A0, B0]), 1e-3
for _ in range(1000):                                # RK4 to t = 1
    k1_ = rhs(y); k2_ = rhs(y + 0.5 * dt * k1_)
    k3_ = rhs(y + 0.5 * dt * k2_); k4_ = rhs(y + dt * k3_)
    y = y + dt * (k1_ + 2 * k2_ + 2 * k3_ + k4_) / 6
lhs = np.log((y[1] / B0) / (y[0] / A0))
print(f"A + B -> P at t = 1: ln[([B]/[B]0)/([A]/[A]0)] = {lhs:.6f}, "
      f"([B]0-[A]0) k t = {(B0-A0)*kr*1.0:.6f}")

fig, ax = plt.subplots(1, 3, figsize=(13, 4))
tt = np.linspace(0, 4, 300)
for order in (0, 1, 2):
    ax[0].plot(tt, conc(order, 1.0, 1.0, tt), label=f"order {order}")
ax[0].set_xlabel("k t"); ax[0].set_ylabel("[A]/[A]0"); ax[0].legend()
ax[0].set_title("integrated rate laws")
for j in range(3):
    ax[1].loglog(I0, v0[j], "o-", label=f"[Ar] = {Ar[j]*1e3:g} mM")
ax[1].set_xlabel("[I]0 [mol/dm3]"); ax[1].set_ylabel("v0"); ax[1].legend()
ax[1].set_title("initial rates: slope = 2")
ax[2].plot(t, np.log(p / p[0]), "o"); ax[2].plot(t, s1 * t, "-")
ax[2].set_xlabel("t [s]"); ax[2].set_ylabel("ln(p/p0)")
ax[2].set_title("azomethane: slope = -k")
plt.tight_layout(); plt.show()
`;

// ── python/wk06_relaxation_arrhenius.py ──────────
export const PY_RELAX = `"""
Wk06 — Chemical kinetics II: approach to equilibrium, relaxation, Arrhenius
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) A <-> B (k forward, k' reverse):
      [A] = [A]0 (k' + k exp(-(k+k')t)) / (k + k'),   K = [B]eq/[A]eq = k/k'
    Any deviation x from equilibrium relaxes as  x = x0 exp(-t/tau),
      tau = 1/(k + k')            (the SUM of the two rate constants)
(2) Temperature jump on water autoprotolysis  H2O <-> H+ + OH-:
      1/tau = k + k'([H+]eq + [OH-]eq),  K = k/k' = Kw/55.6
      tau = 37 us  ->  k' = 1.4e11 dm^3 mol^-1 s^-1,  k = 2.4e-5 s^-1
(3) Arrhenius:  k = A exp(-Ea/RT),  ln k = ln A - Ea/RT
    Fit of acetaldehyde decomposition data -> Ea ~ 188 kJ/mol
(4) Catalyst: lowers Ea for forward AND reverse; K is untouched.

Run:  python wk06_relaxation_arrhenius.py
"""
import numpy as np
import matplotlib.pyplot as plt

R = 8.314462618

# -- (1) A <-> B: RK4 vs closed form --------------------------
kf, kb, A0 = 2.0, 0.5, 1.0
def rhs(a):
    return -kf * a + kb * (A0 - a)
a, dt, nsteps = A0, 1e-3, 3000
traj = [a]
for _ in range(nsteps):
    k1 = rhs(a); k2 = rhs(a + 0.5 * dt * k1)
    k3 = rhs(a + 0.5 * dt * k2); k4 = rhs(a + dt * k3)
    a += dt * (k1 + 2 * k2 + 2 * k3 + k4) / 6
    traj.append(a)
tt = np.arange(nsteps + 1) * dt
exact = A0 * (kb + kf * np.exp(-(kf + kb) * tt)) / (kf + kb)
print("A <-> B  (k = 2.0, k' = 0.5):")
print(f"  max |RK4 - closed form| = {np.abs(np.array(traj) - exact).max():.2e}")
Aeq = kb * A0 / (kf + kb); Beq = A0 - Aeq
print(f"  [A]eq = {Aeq:.3f}, [B]eq = {Beq:.3f},  K = [B]eq/[A]eq = {Beq/Aeq:.3f} = k/k' = {kf/kb:.3f}")
tau = 1 / (kf + kb)
x = np.array(traj) - Aeq
i_tau = int(round(tau / dt))
print(f"  tau = 1/(k+k') = {tau:.3f};  x(tau)/x(0) = {x[i_tau]/x[0]:.4f} (1/e = {np.exp(-1):.4f})\\n")

# -- (2) temperature jump: water autoprotolysis ---------------
Kw, tau_w, cw = 1.008e-14, 37e-6, 55.6              # 298 K
K = Kw / cw                                         # k/k' [mol/dm^3]
k_rev = (1 / tau_w) / (K + 2 * np.sqrt(Kw))
k_fwd = K * k_rev
print("T-jump, H2O <-> H+ + OH-  (tau = 37 us, 298 K):")
print(f"  K = Kw/55.6 = {K:.3e} mol/dm^3")
print(f"  k' (H+ + OH- -> H2O) = {k_rev:.2e} dm^3 mol^-1 s^-1")
print(f"  k  (H2O -> H+ + OH-) = {k_fwd:.2e} s^-1")
print(f"  -> one given water molecule dissociates about once every {1/k_fwd/3600:.0f} hours,")
print("     yet neutralisation is among the fastest reactions known in solution\\n")

# -- (3) Arrhenius fit ----------------------------------------
# second-order decomposition of acetaldehyde (textbook data set)
T = np.array([700, 730, 760, 790, 810, 840, 910, 1000.0])          # K
k = np.array([0.011, 0.035, 0.105, 0.343, 0.789, 2.17, 20.0, 145.0])  # dm^3 mol^-1 s^-1
slope, icpt = np.polyfit(1 / T, np.log(k), 1)
Ea, A = -slope * R, np.exp(icpt)
print("Arrhenius fit, CH3CHO decomposition:")
print(f"  Ea = {Ea/1e3:.0f} kJ/mol,  A = {A:.2e} dm^3 mol^-1 s^-1")
Ea10 = np.log(2) * R / (1 / 298 - 1 / 308)
print(f"  rule of thumb 'rate doubles per 10 K' (298 -> 308 K) means Ea = {Ea10/1e3:.1f} kJ/mol")
for Ea_ in (20e3, 50e3, 100e3, 200e3):
    print(f"    Ea = {Ea_/1e3:5.0f} kJ/mol: k(308)/k(298) = {np.exp(Ea_/R*(1/298-1/308)):6.2f}")
print()

# -- (4) catalysis --------------------------------------------
Tc = 298.0
print("lowering the barrier at 298 K:")
for dEa in (5e3, 19e3, 40e3):
    print(f"  dEa = {dEa/1e3:4.0f} kJ/mol -> rate x {np.exp(dEa/(R*Tc)):.3g}")
print("  (H2O2 decomposition, 76 -> 57 kJ/mol with iodide: ~2000-fold)")
print("  forward and reverse barriers drop by the same amount, so K = k/k' is unchanged")

fig, ax = plt.subplots(1, 3, figsize=(13, 4))
ax[0].plot(tt, traj, label="[A]"); ax[0].plot(tt, A0 - np.array(traj), label="[B]")
ax[0].axhline(Aeq, ls=":", c="gray"); ax[0].axhline(Beq, ls=":", c="gray")
ax[0].set_xlabel("t"); ax[0].legend(); ax[0].set_title("A <-> B: approach to equilibrium")
ax[1].plot(1e3 / T, np.log(k), "o"); ax[1].plot(1e3 / T, slope / T + icpt, "-")
ax[1].set_xlabel("1000/T [1/K]"); ax[1].set_ylabel("ln k")
ax[1].set_title("Arrhenius plot: slope = -Ea/R")
xi = np.linspace(0, 1, 200)
for Eb, lb in ((1.0, "uncatalysed"), (0.55, "catalysed")):
    ax[2].plot(xi, Eb * np.exp(-((xi - 0.45) / 0.16)**2) - 0.35 / (1 + np.exp(-(xi - 0.5) / 0.05)), label=lb)
ax[2].set_xlabel("reaction coordinate"); ax[2].set_ylabel("energy")
ax[2].set_title("catalyst: lower barrier, same dG"); ax[2].legend()
plt.tight_layout(); plt.show()
`;

// ── matlab/wk06_polymer_chain.m ──────────────────
export const ML_POLYMER = `% Wk06 - Macromolecules: molar-mass averages, random coils, entropic elasticity
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% Mn, Mw, Mz, D; freely jointed chain <R^2> = N l^2, Rg^2 = N l^2/6;
% tetrahedral chain F^2 = 2; F = (kT/2l) ln[(1+nu)/(1-nu)].

rng(6); KB = 1.380649e-23;

% (1) molar-mass averages
avg = @(Ni, Mi) [sum(Ni.*Mi)/sum(Ni), sum(Ni.*Mi.^2)/sum(Ni.*Mi), sum(Ni.*Mi.^3)/sum(Ni.*Mi.^2)];
m = avg([1 1], [10 100]);
fprintf('blend (equal numbers of 10 & 100 kg/mol): Mn = %.1f, Mw = %.1f, Mz = %.1f, D = %.3f\\n', ...
        m(1), m(2), m(3), m(2)/m(1));
fprintf('Schulz-Flory, M0 = 100 g/mol:\\n   p      Mn       Mw       Mz      D    1+p\\n');
i = 1:200000;
for p = [0.90 0.99 0.999]
    m = avg((1-p)*p.^(i-1), 100*i);
    fprintf('  %.3f  %7.0f  %7.0f  %7.0f  %.3f  %.3f\\n', p, m(1), m(2), m(3), m(2)/m(1), 1+p);
end

% (2) freely jointed chain Monte Carlo (3D and 1D)
N = 100; M = 20000;
for dim = [3 1]
    if dim == 1
        b = sign(rand(M, N, 1) - 0.5);
    else
        b = randn(M, N, 3); b = b ./ sqrt(sum(b.^2, 3));
    end
    r = cat(2, zeros(M, 1, dim), cumsum(b, 2));
    R2 = mean(sum(r(:, end, :).^2, 3));
    Rg2 = mean(mean(sum((r - mean(r, 2)).^2, 3), 2));
    fprintf('%dD FJC: <R^2> = %.2f (N l^2 = %d), Rg^2 = %.2f (N l^2/6 = %.2f)\\n', ...
            dim, R2, N, Rg2, N/6);
end
idx = 0:N-1; S = sum(sum(abs(idx' - idx)));
fprintf('direct sum: Rg^2 = %.4f = (l^2/6)(N - 1/N) = %.4f\\n', S/(2*N^2), (N - 1/N)/6);

% 1D distribution: exact binomial vs Gaussian
for n = [0 10 20 30]
    fprintf('  n = %2d: exact %.5f, Gaussian %.5f\\n', n, ...
            exp(gammaln(N+1) - gammaln((N+n)/2+1) - gammaln((N-n)/2+1) - N*log(2)), ...
            sqrt(2/(pi*N))*exp(-n^2/(2*N)));
end

% (3) fixed bond angle (freely rotating chain), cos(gamma) = 1/3
Nb = 200; c = 1/3; s = sqrt(1 - c^2);
b = randn(M, 3); b = b ./ vecnorm(b, 2, 2); R = b;
for k = 1:Nb-1
    t = randn(M, 3);
    u = t - sum(t.*b, 2).*b; u = u ./ vecnorm(u, 2, 2);
    b = c*b + s*u; R = R + b;
end
fprintf('tetrahedral chain: <R^2>/(N l^2) = %.3f (F^2 = 2)\\n', mean(sum(R.^2, 2))/Nb);
fprintf('polyethylene N = 4000, l = 0.154 nm: contour %.0f nm, R_rms = %.1f nm, Rg = %.2f nm\\n', ...
        4000*0.154, sqrt(8000)*0.154, sqrt(4000/3)*0.154);

% (4) entropy and restoring force
l = 0.5e-9; T = 298.15;
for x = [0.1 0.5 0.9]
    fprintf('nu = %.1f: F = %.2f pN (Hooke %.2f pN)\\n', x, ...
            KB*T/(2*l)*log((1+x)/(1-x))*1e12, x*KB*T/l*1e12);
end
nu = linspace(-0.95, 0.95, 381);
figure(1);
subplot(1,2,1); plot(nu, -0.5*log((1+nu).^(1+nu).*(1-nu).^(1-nu)));
xlabel('\\nu = n/N'); ylabel('\\DeltaS / Nk'); title('conformational entropy');
subplot(1,2,2); plot(nu, 0.5*log((1+nu)./(1-nu)), nu, nu, '--'); ylim([-2.2 2.2]);
xlabel('\\nu = n/N'); ylabel('F l / kT'); legend('exact', 'Hooke'); title('entropic force');
`;

// ── matlab/wk06_dlvo_micelle.m ───────────────────
export const ML_DLVO = `% Wk06 - Colloid stability (DLVO) and micelle formation
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% U = -A a/12h + (64 pi kT n0 a gamma^2/kappa^2) exp(-kappa h); CMC model.

E = 1.602176634e-19; KB = 1.380649e-23; NA = 6.02214076e23;
EPS = 78.5*8.8541878128e-12; T = 298.15; KT = KB*T;
kappa = @(c, z) sqrt(2*z^2*E^2*1000*NA*c/(EPS*KT));

fprintf('1:1 salt    kappa^-1 [nm]   0.304/sqrt(c)\\n');
for c = [1e-3 1e-2 0.1 0.15 0.6]
    fprintf('  %.3f M   %8.3f      %8.3f\\n', c, 1e9/kappa(c,1), 0.304/sqrt(c));
end

a = 100e-9; AH = 2e-20; phi0 = 0.030; z = 1;
g = tanh(z*E*phi0/(4*KT));
dlvo = @(h, c) (-AH*a./(12*h) + 64*pi*KT*1000*NA*c*a*g^2/kappa(c,z)^2 .* exp(-kappa(c,z)*h))/KT;
h = logspace(log10(0.1e-9), log10(100e-9), 6000);
fprintf('\\na = 100 nm, A_H = 2e-20 J, phi0 = 30 mV:\\n  c [M]   barrier/kT   h [nm]\\n');
for c = [1e-3 1e-2 3e-2 0.1 0.6]
    [Um, j] = max(dlvo(h, c));
    if Um <= 0
        fprintf('  %.3f   no barrier -> rapid coagulation\\n', c);
    else
        fprintf('  %.3f   %8.1f    %6.2f\\n', c, Um, h(j)*1e9);
    end
end

% critical coagulation concentration (kappa h = 1 at the vanishing barrier)
ccc = @(zz, gg) (384*pi*EPS*KT^2*gg^2/(exp(1)*zz^2*E^2*AH))^2 * EPS*KT/(2*zz^2*E^2)/(1000*NA);
fprintf('\\nccc at phi0 = 30 mV: z=1 %.1f mM, z=2 %.1f mM, z=3 %.2f mM\\n', ...
        ccc(1, tanh(E*phi0/(4*KT)))*1e3, ccc(2, tanh(2*E*phi0/(4*KT)))*1e3, ...
        ccc(3, tanh(3*E*phi0/(4*KT)))*1e3);
fprintf('high-potential limit: 1 : 1/%.0f : 1/%.0f (Schulze-Hardy z^-6)\\n', ...
        ccc(1,1)/ccc(2,1), ccc(1,1)/ccc(3,1));

% micelles: closed association, c = m + N K m^N (K = 1)
fprintf('\\nfraction micellised:  c_tot    N=3     N=30    N=100\\n');
for ct = [0.5 0.9 1.0 1.5 3.0 10.0]
    fr = zeros(1,3); Ns = [3 30 100];
    for q = 1:3
        lo = 0; hi = ct;
        for it = 1:200
            mid = (lo+hi)/2;
            if mid + Ns(q)*mid^Ns(q) > ct, hi = mid; else, lo = mid; end
        end
        fr(q) = 1 - lo/ct;
    end
    fprintf('                      %5.2f   %.3f   %.3f   %.3f\\n', ct, fr);
end

figure(1); hold on;
for c = [1e-3 1e-2 3e-2 0.1]
    plot(h*1e9, dlvo(h, c), 'DisplayName', sprintf('%g mM', c*1e3));
end
set(gca, 'XScale', 'log'); ylim([-40 60]); yline(0, ':');
xlabel('gap h [nm]'); ylabel('U / kT'); legend; title('DLVO: salt lowers the barrier');
`;

// ── matlab/wk06_rate_laws.m ──────────────────────
export const ML_RATES = `% Wk06 - Chemical kinetics I: rate laws, initial rates, integrated rate laws
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU

% (1) 2 N2O5 -> 4 NO2 + O2: P = (1 + 3 alpha/2) P0
for al = [0 0.25 0.5 1]
    fprintf('alpha = %.2f: P/P0 = %.3f\\n', al, 1 + 1.5*al);
end

% (2) method of initial rates: 2 I + Ar -> I2 + Ar
I0 = [1 2 4 6]*1e-5; Ar = [1e-3 5e-3 1e-2];
v0 = [8.70e-4 3.48e-3 1.39e-2 3.13e-2;
      4.35e-3 1.74e-2 6.96e-2 1.57e-1;
      8.69e-3 3.47e-2 1.38e-1 3.13e-1];
lk = zeros(1,3);
for j = 1:3
    p = polyfit(log10(I0), log10(v0(j,:)), 1); lk(j) = p(2);
    fprintf('[Ar] = %4.1f mM: slope a = %.3f, log k'' = %.3f\\n', Ar(j)*1e3, p(1), p(2));
end
p = polyfit(log10(Ar), lk, 1);
kall = v0 ./ (I0.^2 .* Ar');
fprintf('order in Ar b = %.3f; k = %.2e dm^6 mol^-2 s^-1 (12-point mean)\\n', p(1), mean(kall(:)));

% (3) successive half-lives
hl = {@(k,A) A/(2*k), @(k,A) log(2)/k, @(k,A) 1/(k*A)};
for n = 0:2
    fprintf('order %d half-lives: %.3f, %.3f, %.3f\\n', n, hl{n+1}(1,1), hl{n+1}(1,0.5), hl{n+1}(1,0.25));
end

% (4) azomethane at 600 K
t = [0 1000 2000 3000 4000]; pr = [10.9 7.63 5.32 3.71 2.59];
q = polyfit(t, log(pr/pr(1)), 1); k1 = -q(1);
fprintf('azomethane: k = %.2e s^-1, t1/2 = %.0f s, tau = %.0f s\\n', k1, log(2)/k1, 1/k1);

% (5) A + B -> P, unequal concentrations: RK4 vs integrated form
kr = 2; A0 = 1; B0 = 1.5; y = [A0; B0]; dt = 1e-3;
f = @(y) -kr*y(1)*y(2)*[1; 1];
for s = 1:1000
    k1_ = f(y); k2_ = f(y + dt/2*k1_); k3_ = f(y + dt/2*k2_); k4_ = f(y + dt*k3_);
    y = y + dt*(k1_ + 2*k2_ + 2*k3_ + k4_)/6;
end
fprintf('A + B -> P: ln ratio = %.6f, (B0-A0) k t = %.6f\\n', log((y(2)/B0)/(y(1)/A0)), (B0-A0)*kr);

figure(1);
subplot(1,2,1); loglog(I0, v0', 'o-'); xlabel('[I]_0'); ylabel('v_0'); title('initial rates: slope 2');
subplot(1,2,2); plot(t, log(pr/pr(1)), 'o', t, q(1)*t, '-'); xlabel('t [s]'); ylabel('ln(p/p_0)');
title('azomethane: slope = -k');
`;

// ── matlab/wk06_relaxation_arrhenius.m ───────────
export const ML_RELAX = `% Wk06 - Chemical kinetics II: approach to equilibrium, relaxation, Arrhenius
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU

R = 8.314462618;

% (1) A <-> B: RK4 vs closed form
kf = 2; kb = 0.5; A0 = 1; dt = 1e-3; n = 3000;
a = A0; traj = zeros(1, n+1); traj(1) = a; f = @(a) -kf*a + kb*(A0 - a);
for s = 1:n
    k1 = f(a); k2 = f(a + dt/2*k1); k3 = f(a + dt/2*k2); k4 = f(a + dt*k3);
    a = a + dt*(k1 + 2*k2 + 2*k3 + k4)/6; traj(s+1) = a;
end
tt = (0:n)*dt; ex = A0*(kb + kf*exp(-(kf+kb)*tt))/(kf+kb);
Aeq = kb*A0/(kf+kb);
fprintf('max |RK4 - exact| = %.2e; K = %.3f = k/k'' = %.3f; tau = %.3f\\n', ...
        max(abs(traj - ex)), (A0-Aeq)/Aeq, kf/kb, 1/(kf+kb));

% (2) temperature jump: water autoprotolysis
Kw = 1.008e-14; tau = 37e-6; K = Kw/55.6;
krev = (1/tau)/(K + 2*sqrt(Kw)); kfwd = K*krev;
fprintf('T-jump: k'' = %.2e dm^3/mol/s, k = %.2e 1/s (one event per %.0f h)\\n', ...
        krev, kfwd, 1/kfwd/3600);

% (3) Arrhenius fit (acetaldehyde decomposition, textbook data)
T = [700 730 760 790 810 840 910 1000];
k = [0.011 0.035 0.105 0.343 0.789 2.17 20.0 145.0];
p = polyfit(1./T, log(k), 1);
fprintf('Arrhenius: Ea = %.0f kJ/mol, A = %.2e dm^3/mol/s\\n', -p(1)*R/1e3, exp(p(2)));
fprintf('doubling per 10 K at 298 K <-> Ea = %.1f kJ/mol\\n', log(2)*R/(1/298 - 1/308)/1e3);

% (4) catalysis
for dEa = [5e3 19e3 40e3]
    fprintf('dEa = %2.0f kJ/mol -> rate x %.3g\\n', dEa/1e3, exp(dEa/(R*298)));
end

figure(1);
subplot(1,2,1); plot(tt, traj, tt, A0 - traj); yline(Aeq, ':'); legend('[A]', '[B]');
xlabel('t'); title('A <-> B');
subplot(1,2,2); plot(1e3./T, log(k), 'o', 1e3./T, polyval(p, 1./T), '-');
xlabel('1000/T'); ylabel('ln k'); title('Arrhenius plot');
`;

// ── julia/wk06_polymer_chain.jl ──────────────────
export const JL_POLYMER = `# Wk06 - Macromolecules: molar-mass averages, random coils, entropic elasticity
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
# Mn, Mw, Mz, D; freely jointed chain <R^2> = N l^2, Rg^2 = N l^2/6;
# tetrahedral chain F^2 = 2; F = (kT/2l) ln[(1+nu)/(1-nu)].
using Plots, Printf, Random, LinearAlgebra

Random.seed!(6)
const KB = 1.380649e-23

# (1) molar-mass averages
averages(Ni, Mi) = (sum(Ni .* Mi) / sum(Ni), sum(Ni .* Mi .^ 2) / sum(Ni .* Mi),
                    sum(Ni .* Mi .^ 3) / sum(Ni .* Mi .^ 2))
Mn, Mw, Mz = averages([1.0, 1.0], [10.0, 100.0])
@printf("blend (equal numbers of 10 & 100 kg/mol): Mn = %.1f, Mw = %.1f, Mz = %.1f, D = %.3f\\n",
        Mn, Mw, Mz, Mw / Mn)
println("Schulz-Flory, M0 = 100 g/mol:\\n   p      Mn       Mw       Mz      D    1+p")
i = 1:200000
for p in (0.90, 0.99, 0.999)
    a, b, c = averages((1 - p) .* p .^ (i .- 1), 100.0 .* i)
    @printf("  %.3f  %7.0f  %7.0f  %7.0f  %.3f  %.3f\\n", p, a, b, c, b / a, 1 + p)
end

# (2) freely jointed chain Monte Carlo
function fjc(N, M, dim)
    R2 = 0.0; Rg2 = 0.0
    r = zeros(N + 1, dim)
    for _ in 1:M
        for k in 1:N
            b = dim == 1 ? [rand(Bool) ? 1.0 : -1.0] : normalize(randn(3))
            r[k+1, :] .= r[k, :] .+ b
        end
        R2 += sum(abs2, r[end, :])
        rc = sum(r, dims=1) ./ (N + 1)
        Rg2 += sum(abs2, r .- rc) / (N + 1)
    end
    R2 / M, Rg2 / M
end
N = 100
for dim in (3, 1)
    R2, Rg2 = fjc(N, 20000, dim)
    @printf("%dD FJC: <R^2> = %.2f (N l^2 = %d), Rg^2 = %.2f (N l^2/6 = %.2f)\\n",
            dim, R2, N, Rg2, N / 6)
end
S = sum(abs(a - b) for a in 0:N-1, b in 0:N-1)
@printf("direct sum: Rg^2 = %.4f = (l^2/6)(N - 1/N) = %.4f\\n", S / (2N^2), (N - 1 / N) / 6)
for n in (0, 10, 20, 30)
    @printf("  n = %2d: exact %.5f, Gaussian %.5f\\n", n,
            Float64(binomial(big(N), (N + n) ÷ 2) / big(2)^N), sqrt(2 / (π * N)) * exp(-n^2 / (2N)))
end

# (3) fixed bond angle (freely rotating chain), cos(gamma) = 1/3
function frc(N, M, c)
    s = sqrt(1 - c^2); acc = 0.0
    for _ in 1:M
        b = normalize(randn(3)); R = copy(b)
        for _ in 1:N-1
            t = randn(3); u = normalize(t .- dot(t, b) .* b)
            b = c .* b .+ s .* u; R .+= b
        end
        acc += sum(abs2, R)
    end
    acc / M
end
@printf("tetrahedral chain: <R^2>/(N l^2) = %.3f (F^2 = 2)\\n", frc(200, 20000, 1 / 3) / 200)
@printf("polyethylene N = 4000, l = 0.154 nm: contour %.0f nm, R_rms = %.1f nm, Rg = %.2f nm\\n",
        4000 * 0.154, sqrt(8000) * 0.154, sqrt(4000 / 3) * 0.154)

# (4) entropy and restoring force
l, T = 0.5e-9, 298.15
for x in (0.1, 0.5, 0.9)
    @printf("nu = %.1f: F = %.2f pN (Hooke %.2f pN)\\n", x,
            KB * T / (2l) * log((1 + x) / (1 - x)) * 1e12, x * KB * T / l * 1e12)
end
ν = range(-0.95, 0.95, length=381)
p1 = plot(ν, -0.5 .* log.((1 .+ ν) .^ (1 .+ ν) .* (1 .- ν) .^ (1 .- ν)), xlabel="ν = n/N",
          ylabel="ΔS / Nk", title="conformational entropy", legend=false)
p2 = plot(ν, 0.5 .* log.((1 .+ ν) ./ (1 .- ν)), label="exact", xlabel="ν = n/N",
          ylabel="F l / kT", ylims=(-2.2, 2.2), title="entropic force")
plot!(p2, ν, ν, ls=:dash, label="Hooke")
display(plot(p1, p2, layout=(1, 2), size=(1000, 400))); readline()
`;

// ── julia/wk06_dlvo_micelle.jl ───────────────────
export const JL_DLVO = `# Wk06 - Colloid stability (DLVO) and micelle formation
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
using Plots, Printf

const E = 1.602176634e-19; const KB = 1.380649e-23; const NA = 6.02214076e23
const EPS = 78.5 * 8.8541878128e-12; const KT = KB * 298.15
kappa(c, z=1) = sqrt(2 * z^2 * E^2 * 1000 * NA * c / (EPS * KT))

println("1:1 salt    kappa^-1 [nm]   0.304/sqrt(c)")
for c in (1e-3, 1e-2, 0.1, 0.15, 0.6)
    @printf("  %.3f M   %8.3f      %8.3f\\n", c, 1e9 / kappa(c), 0.304 / sqrt(c))
end

function dlvo(h, c; a=100e-9, AH=2e-20, phi0=0.030, z=1)
    k = kappa(c, z); g = tanh(z * E * phi0 / (4KT))
    (-AH * a / (12h) + 64π * KT * 1000 * NA * c * a * g^2 / k^2 * exp(-k * h)) / KT
end
h = 10 .^ range(log10(0.1e-9), log10(100e-9), length=6000)
println("\\na = 100 nm, A_H = 2e-20 J, phi0 = 30 mV:\\n  c [M]   barrier/kT   h [nm]")
for c in (1e-3, 1e-2, 3e-2, 0.1, 0.6)
    U = dlvo.(h, c); j = argmax(U)
    if U[j] <= 0
        @printf("  %.3f   no barrier -> rapid coagulation\\n", c)
    else
        @printf("  %.3f   %8.1f    %6.2f\\n", c, U[j], h[j] * 1e9)
    end
end

# critical coagulation concentration (kappa h = 1 where the barrier vanishes)
function ccc(z; phi0=0.030, AH=2e-20, gamma=nothing)
    g = gamma === nothing ? tanh(z * E * phi0 / (4KT)) : gamma
    kc = 384π * EPS * KT^2 * g^2 / (exp(1) * z^2 * E^2 * AH)
    kc^2 * EPS * KT / (2 * z^2 * E^2) / (1000 * NA)
end
@printf("\\nccc at phi0 = 30 mV: z=1 %.1f mM, z=2 %.1f mM, z=3 %.2f mM\\n",
        ccc(1) * 1e3, ccc(2) * 1e3, ccc(3) * 1e3)
@printf("high-potential limit: 1 : 1/%.0f : 1/%.0f (Schulze-Hardy z^-6)\\n",
        ccc(1, gamma=1.0) / ccc(2, gamma=1.0), ccc(1, gamma=1.0) / ccc(3, gamma=1.0))

# micelles: closed association, c = m + N K m^N (K = 1)
function monomer(ct, N)
    lo, hi = 0.0, ct
    for _ in 1:200
        mid = (lo + hi) / 2
        mid + N * mid^N > ct ? (hi = mid) : (lo = mid)
    end
    (lo + hi) / 2
end
println("\\nfraction micellised:  c_tot    N=3     N=30    N=100")
for ct in (0.5, 0.9, 1.0, 1.5, 3.0, 10.0)
    @printf("                      %5.2f   %.3f   %.3f   %.3f\\n", ct,
            1 - monomer(ct, 3) / ct, 1 - monomer(ct, 30) / ct, 1 - monomer(ct, 100) / ct)
end

p1 = plot(xscale=:log10, ylims=(-40, 60), xlabel="gap h [nm]", ylabel="U / kT",
          title="DLVO: salt lowers the barrier")
for c in (1e-3, 1e-2, 3e-2, 0.1)
    plot!(p1, h .* 1e9, dlvo.(h, c), label="$(c*1e3) mM", lw=1.5)
end
hline!(p1, [0.0], c=:gray, label=false)
ct = range(0.01, 4, length=300)
p2 = plot(xlabel="total surfactant", ylabel="free monomer", title="monomer saturates at the CMC")
for N in (3, 30, 100)
    plot!(p2, ct, [monomer(x, N) for x in ct], label="N = $N", lw=1.5)
end
display(plot(p1, p2, layout=(1, 2), size=(1000, 400))); readline()
`;

// ── julia/wk06_rate_laws.jl ──────────────────────
export const JL_RATES = `# Wk06 - Chemical kinetics I: rate laws, initial rates, integrated rate laws
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
using Plots, Printf, Statistics

linfit(x, y) = (s = cov(x, y) / var(x); (s, mean(y) - s * mean(x)))

# (1) 2 N2O5 -> 4 NO2 + O2: P = (1 + 3 alpha/2) P0
for al in (0.0, 0.25, 0.5, 1.0)
    @printf("alpha = %.2f: P/P0 = %.3f\\n", al, 1 + 1.5al)
end

# (2) method of initial rates: 2 I + Ar -> I2 + Ar
I0 = [1.0, 2.0, 4.0, 6.0] .* 1e-5; Ar = [1e-3, 5e-3, 1e-2]
v0 = [8.70e-4 3.48e-3 1.39e-2 3.13e-2;
      4.35e-3 1.74e-2 6.96e-2 1.57e-1;
      8.69e-3 3.47e-2 1.38e-1 3.13e-1]
lk = zeros(3)
for j in 1:3
    a, lk[j] = linfit(log10.(I0), log10.(v0[j, :]))
    @printf("[Ar] = %4.1f mM: slope a = %.3f, log k' = %.3f\\n", Ar[j] * 1e3, a, lk[j])
end
b, _ = linfit(log10.(Ar), lk)
kall = v0 ./ (I0' .^ 2 .* Ar)
@printf("order in Ar b = %.3f; k = %.2e dm^6 mol^-2 s^-1 (12-point mean)\\n", b, mean(kall))

# (3) successive half-lives
hl(order, k, A) = order == 0 ? A / (2k) : order == 1 ? log(2) / k : 1 / (k * A)
for n in 0:2
    @printf("order %d half-lives: %.3f, %.3f, %.3f\\n", n, hl(n, 1, 1.0), hl(n, 1, 0.5), hl(n, 1, 0.25))
end

# (4) azomethane at 600 K
t = [0.0, 1000, 2000, 3000, 4000]; pr = [10.9, 7.63, 5.32, 3.71, 2.59]
s, _ = linfit(t, log.(pr ./ pr[1])); k1 = -s
@printf("azomethane: k = %.2e s^-1, t1/2 = %.0f s, tau = %.0f s\\n", k1, log(2) / k1, 1 / k1)

# (5) A + B -> P, unequal concentrations: RK4 vs integrated form
kr, A0, B0, dt = 2.0, 1.0, 1.5, 1e-3
f(y) = -kr * y[1] * y[2] .* [1.0, 1.0]
y = [A0, B0]
for _ in 1:1000
    k1_ = f(y); k2_ = f(y .+ dt / 2 .* k1_); k3_ = f(y .+ dt / 2 .* k2_); k4_ = f(y .+ dt .* k3_)
    global y = y .+ dt .* (k1_ .+ 2k2_ .+ 2k3_ .+ k4_) ./ 6
end
@printf("A + B -> P: ln ratio = %.6f, (B0-A0) k t = %.6f\\n", log((y[2] / B0) / (y[1] / A0)), (B0 - A0) * kr)

p1 = plot(I0, v0', xscale=:log10, yscale=:log10, marker=:o, xlabel="[I]0", ylabel="v0",
          label=["1 mM" "5 mM" "10 mM"], title="initial rates: slope 2")
p2 = scatter(t, log.(pr ./ pr[1]), xlabel="t [s]", ylabel="ln(p/p0)", label="data",
             title="azomethane: slope = -k")
plot!(p2, t, s .* t, label="fit")
display(plot(p1, p2, layout=(1, 2), size=(1000, 400))); readline()
`;

// ── julia/wk06_relaxation_arrhenius.jl ───────────
export const JL_RELAX = `# Wk06 - Chemical kinetics II: approach to equilibrium, relaxation, Arrhenius
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
using Plots, Printf, Statistics

const R = 8.314462618

# (1) A <-> B: RK4 vs closed form
kf, kb, A0, dt, n = 2.0, 0.5, 1.0, 1e-3, 3000
f(a) = -kf * a + kb * (A0 - a)
traj = zeros(n + 1); traj[1] = A0
for s in 1:n
    a = traj[s]
    k1 = f(a); k2 = f(a + dt / 2 * k1); k3 = f(a + dt / 2 * k2); k4 = f(a + dt * k3)
    traj[s+1] = a + dt * (k1 + 2k2 + 2k3 + k4) / 6
end
tt = (0:n) .* dt
ex = @. A0 * (kb + kf * exp(-(kf + kb) * tt)) / (kf + kb)
Aeq = kb * A0 / (kf + kb)
@printf("max |RK4 - exact| = %.2e; K = %.3f = k/k' = %.3f; tau = %.3f\\n",
        maximum(abs.(traj .- ex)), (A0 - Aeq) / Aeq, kf / kb, 1 / (kf + kb))

# (2) temperature jump: water autoprotolysis
Kw, τ = 1.008e-14, 37e-6
K = Kw / 55.6
krev = (1 / τ) / (K + 2sqrt(Kw)); kfwd = K * krev
@printf("T-jump: k' = %.2e dm^3/mol/s, k = %.2e 1/s (one event per %.0f h)\\n",
        krev, kfwd, 1 / kfwd / 3600)

# (3) Arrhenius fit (acetaldehyde decomposition, textbook data)
T = [700.0, 730, 760, 790, 810, 840, 910, 1000]
k = [0.011, 0.035, 0.105, 0.343, 0.789, 2.17, 20.0, 145.0]
x, y = 1 ./ T, log.(k)
slope = cov(x, y) / var(x); icpt = mean(y) - slope * mean(x)
@printf("Arrhenius: Ea = %.0f kJ/mol, A = %.2e dm^3/mol/s\\n", -slope * R / 1e3, exp(icpt))
@printf("doubling per 10 K at 298 K <-> Ea = %.1f kJ/mol\\n", log(2) * R / (1 / 298 - 1 / 308) / 1e3)

# (4) catalysis
for dEa in (5e3, 19e3, 40e3)
    @printf("dEa = %2.0f kJ/mol -> rate x %.3g\\n", dEa / 1e3, exp(dEa / (R * 298)))
end

p1 = plot(tt, traj, label="[A]", xlabel="t", title="A <-> B")
plot!(p1, tt, A0 .- traj, label="[B]"); hline!(p1, [Aeq], ls=:dot, c=:gray, label=false)
p2 = scatter(1e3 ./ T, y, label="data", xlabel="1000/T", ylabel="ln k", title="Arrhenius plot")
plot!(p2, 1e3 ./ T, slope .* x .+ icpt, label="fit")
display(plot(p1, p2, layout=(1, 2), size=(1000, 400))); readline()
`;

// ── cpp/wk06_polymer_chain.cpp ───────────────────
export const CPP_POLYMER = `// Wk06 - Macromolecules: molar-mass averages, random coils, entropic elasticity
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk06_polymer_chain.cpp -o wk06_polymer_chain
// Mn, Mw, Mz, D; FJC <R^2> = N l^2, Rg^2 = N l^2/6; tetrahedral F^2 = 2.
#include <cmath>
#include <cstdio>
#include <vector>
#include <random>
#include <array>
#include <initializer_list>

const double KB = 1.380649e-23;
std::mt19937_64 rng(6);
std::normal_distribution<double> gauss(0.0, 1.0);

std::array<double, 3> unit3() {
    std::array<double, 3> v{gauss(rng), gauss(rng), gauss(rng)};
    double n = std::sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    for (auto& c : v) c /= n;
    return v;
}

int main() {
    // (1) molar-mass averages
    {
        double N[2] = {1, 1}, M[2] = {10, 100}, s0 = 0, s1 = 0, s2 = 0, s3 = 0;
        for (int i = 0; i < 2; ++i) { s0 += N[i]; s1 += N[i]*M[i]; s2 += N[i]*M[i]*M[i]; s3 += N[i]*M[i]*M[i]*M[i]; }
        std::printf("blend (equal numbers of 10 & 100 kg/mol): Mn = %.1f, Mw = %.1f, Mz = %.1f, D = %.3f\\n",
                    s1/s0, s2/s1, s3/s2, (s2/s1)/(s1/s0));
    }
    std::printf("Schulz-Flory, M0 = 100 g/mol:\\n   p      Mn       Mw       Mz      D    1+p\\n");
    for (double p : {0.90, 0.99, 0.999}) {
        double s0 = 0, s1 = 0, s2 = 0, s3 = 0, w = 1 - p;
        for (int i = 1; i <= 200000; ++i) {
            double M = 100.0 * i;
            s0 += w; s1 += w*M; s2 += w*M*M; s3 += w*M*M*M;
            w *= p;
        }
        std::printf("  %.3f  %7.0f  %7.0f  %7.0f  %.3f  %.3f\\n", p, s1/s0, s2/s1, s3/s2, (s2/s1)/(s1/s0), 1 + p);
    }

    // (2) freely jointed chain Monte Carlo, 3D and 1D
    const int N = 100, M = 20000;
    std::uniform_int_distribution<int> coin(0, 1);
    for (int dim : {3, 1}) {
        double R2 = 0, Rg2 = 0;
        std::vector<std::array<double, 3>> r(N + 1);
        for (int c = 0; c < M; ++c) {
            r[0] = {0, 0, 0};
            for (int k = 0; k < N; ++k) {
                std::array<double, 3> b = dim == 1 ? std::array<double, 3>{coin(rng) ? 1.0 : -1.0, 0, 0} : unit3();
                for (int d = 0; d < 3; ++d) r[k+1][d] = r[k][d] + b[d];
            }
            double cm[3] = {0, 0, 0};
            for (auto& q : r) for (int d = 0; d < 3; ++d) cm[d] += q[d] / (N + 1);
            double g = 0;
            for (auto& q : r) for (int d = 0; d < 3; ++d) g += (q[d]-cm[d])*(q[d]-cm[d]);
            Rg2 += g / (N + 1);
            for (int d = 0; d < 3; ++d) R2 += r[N][d]*r[N][d];
        }
        std::printf("%dD FJC: <R^2> = %.2f (N l^2 = %d), Rg^2 = %.2f (N l^2/6 = %.2f)\\n",
                    dim, R2/M, N, Rg2/M, N/6.0);
    }
    long S = 0;
    for (int i = 0; i < N; ++i) for (int j = 0; j < N; ++j) S += std::abs(i - j);
    std::printf("direct sum: Rg^2 = %.4f = (l^2/6)(N - 1/N) = %.4f\\n", S/(2.0*N*N), (N - 1.0/N)/6);
    for (int n : {0, 10, 20, 30}) {
        double lnP = std::lgamma(N + 1.0) - std::lgamma((N+n)/2 + 1.0) - std::lgamma((N-n)/2 + 1.0) - N*std::log(2.0);
        std::printf("  n = %2d: exact %.5f, Gaussian %.5f\\n", n, std::exp(lnP),
                    std::sqrt(2/(M_PI*N))*std::exp(-n*n/(2.0*N)));
    }

    // (3) fixed bond angle (freely rotating chain), cos(gamma) = 1/3
    const int Nb = 200; const double c = 1.0/3, s = std::sqrt(1 - c*c);
    double acc = 0;
    for (int ch = 0; ch < M; ++ch) {
        auto b = unit3(); auto R = b;
        for (int k = 0; k < Nb - 1; ++k) {
            std::array<double, 3> t{gauss(rng), gauss(rng), gauss(rng)};
            double dp = t[0]*b[0] + t[1]*b[1] + t[2]*b[2];
            std::array<double, 3> u{t[0]-dp*b[0], t[1]-dp*b[1], t[2]-dp*b[2]};
            double un = std::sqrt(u[0]*u[0] + u[1]*u[1] + u[2]*u[2]);
            for (int d = 0; d < 3; ++d) { b[d] = c*b[d] + s*u[d]/un; R[d] += b[d]; }
        }
        acc += R[0]*R[0] + R[1]*R[1] + R[2]*R[2];
    }
    std::printf("tetrahedral chain: <R^2>/(N l^2) = %.3f (F^2 = 2)\\n", acc/M/Nb);
    std::printf("polyethylene N = 4000, l = 0.154 nm: contour %.0f nm, R_rms = %.1f nm, Rg = %.2f nm\\n",
                4000*0.154, std::sqrt(8000.0)*0.154, std::sqrt(4000/3.0)*0.154);

    // (4) entropic restoring force
    const double l = 0.5e-9, T = 298.15;
    for (double x : {0.1, 0.5, 0.9})
        std::printf("nu = %.1f: F = %.2f pN (Hooke %.2f pN)\\n", x,
                    KB*T/(2*l)*std::log((1+x)/(1-x))*1e12, x*KB*T/l*1e12);
    return 0;
}
`;

// ── cpp/wk06_dlvo_micelle.cpp ────────────────────
export const CPP_DLVO = `// Wk06 - Colloid stability (DLVO) and micelle formation
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk06_dlvo_micelle.cpp -o wk06_dlvo_micelle
#include <cmath>
#include <cstdio>
#include <initializer_list>

const double E = 1.602176634e-19, KB = 1.380649e-23, NA = 6.02214076e23;
const double EPS = 78.5 * 8.8541878128e-12, KT = KB * 298.15;

double kappa(double c, int z = 1) { return std::sqrt(2.0*z*z*E*E*1000*NA*c/(EPS*KT)); }

double dlvo(double h, double c, double a = 100e-9, double AH = 2e-20, double phi0 = 0.030, int z = 1) {
    double k = kappa(c, z), g = std::tanh(z*E*phi0/(4*KT));
    return (-AH*a/(12*h) + 64*M_PI*KT*1000*NA*c*a*g*g/(k*k)*std::exp(-k*h)) / KT;
}

double ccc(int z, double gamma = -1, double phi0 = 0.030, double AH = 2e-20) {
    double g = gamma > 0 ? gamma : std::tanh(z*E*phi0/(4*KT));
    double kc = 384*M_PI*EPS*KT*KT*g*g/(std::exp(1.0)*z*z*E*E*AH);
    return kc*kc*EPS*KT/(2.0*z*z*E*E)/(1000*NA);
}

double monomer(double ct, int N) {
    double lo = 0, hi = ct;
    for (int i = 0; i < 200; ++i) {
        double mid = 0.5*(lo + hi);
        if (mid + N*std::pow(mid, N) > ct) hi = mid; else lo = mid;
    }
    return 0.5*(lo + hi);
}

int main() {
    std::printf("1:1 salt    kappa^-1 [nm]   0.304/sqrt(c)\\n");
    for (double c : {1e-3, 1e-2, 0.1, 0.15, 0.6})
        std::printf("  %.3f M   %8.3f      %8.3f\\n", c, 1e9/kappa(c), 0.304/std::sqrt(c));

    std::printf("\\na = 100 nm, A_H = 2e-20 J, phi0 = 30 mV:\\n  c [M]   barrier/kT   h [nm]\\n");
    for (double c : {1e-3, 1e-2, 3e-2, 0.1, 0.6}) {
        double Um = -1e300, hm = 0;
        for (int i = 0; i < 6000; ++i) {
            double h = 0.1e-9 * std::pow(1000.0, i/5999.0);
            double U = dlvo(h, c);
            if (U > Um) { Um = U; hm = h; }
        }
        if (Um <= 0) std::printf("  %.3f   no barrier -> rapid coagulation\\n", c);
        else std::printf("  %.3f   %8.1f    %6.2f\\n", c, Um, hm*1e9);
    }

    std::printf("\\nccc at phi0 = 30 mV: z=1 %.1f mM, z=2 %.1f mM, z=3 %.2f mM\\n",
                ccc(1)*1e3, ccc(2)*1e3, ccc(3)*1e3);
    std::printf("high-potential limit: 1 : 1/%.0f : 1/%.0f (Schulze-Hardy z^-6)\\n",
                ccc(1, 1.0)/ccc(2, 1.0), ccc(1, 1.0)/ccc(3, 1.0));

    std::printf("\\nfraction micellised:  c_tot    N=3     N=30    N=100\\n");
    for (double ct : {0.5, 0.9, 1.0, 1.5, 3.0, 10.0})
        std::printf("                      %5.2f   %.3f   %.3f   %.3f\\n", ct,
                    1 - monomer(ct, 3)/ct, 1 - monomer(ct, 30)/ct, 1 - monomer(ct, 100)/ct);
    std::printf("-> large N: nothing, then suddenly micelles (the CMC)\\n");
    return 0;
}
`;

// ── cpp/wk06_rate_laws.cpp ───────────────────────
export const CPP_RATES = `// Wk06 - Chemical kinetics I: rate laws, initial rates, integrated rate laws
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk06_rate_laws.cpp -o wk06_rate_laws
#include <cmath>
#include <cstdio>
#include <vector>
#include <initializer_list>

void linfit(const std::vector<double>& x, const std::vector<double>& y, double& s, double& b) {
    double n = x.size(), sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (size_t i = 0; i < x.size(); ++i) { sx += x[i]; sy += y[i]; sxx += x[i]*x[i]; sxy += x[i]*y[i]; }
    s = (n*sxy - sx*sy)/(n*sxx - sx*sx); b = (sy - s*sx)/n;
}

int main() {
    // (1) 2 N2O5 -> 4 NO2 + O2
    for (double al : {0.0, 0.25, 0.5, 1.0}) std::printf("alpha = %.2f: P/P0 = %.3f\\n", al, 1 + 1.5*al);

    // (2) method of initial rates: 2 I + Ar -> I2 + Ar
    const double I0[4] = {1e-5, 2e-5, 4e-5, 6e-5}, Ar[3] = {1e-3, 5e-3, 1e-2};
    const double v0[3][4] = {{8.70e-4, 3.48e-3, 1.39e-2, 3.13e-2},
                             {4.35e-3, 1.74e-2, 6.96e-2, 1.57e-1},
                             {8.69e-3, 3.47e-2, 1.38e-1, 3.13e-1}};
    std::vector<double> lI, lAr, lk;
    for (double c : I0) lI.push_back(std::log10(c));
    double ksum = 0;
    for (int j = 0; j < 3; ++j) {
        std::vector<double> lv;
        for (int i = 0; i < 4; ++i) { lv.push_back(std::log10(v0[j][i])); ksum += v0[j][i]/(I0[i]*I0[i]*Ar[j]); }
        double a, b; linfit(lI, lv, a, b);
        lAr.push_back(std::log10(Ar[j])); lk.push_back(b);
        std::printf("[Ar] = %4.1f mM: slope a = %.3f, log k' = %.3f\\n", Ar[j]*1e3, a, b);
    }
    double bo, lkr; linfit(lAr, lk, bo, lkr);
    std::printf("order in Ar b = %.3f; k = %.2e dm^6 mol^-2 s^-1 (12-point mean)\\n", bo, ksum/12);

    // (3) successive half-lives
    for (int n = 0; n <= 2; ++n) {
        std::printf("order %d half-lives:", n);
        for (double A : {1.0, 0.5, 0.25})
            std::printf(" %.3f", n == 0 ? A/2 : n == 1 ? std::log(2.0) : 1/A);
        std::printf("\\n");
    }

    // (4) azomethane at 600 K
    std::vector<double> t{0, 1000, 2000, 3000, 4000}, p{10.9, 7.63, 5.32, 3.71, 2.59}, lp;
    for (double q : p) lp.push_back(std::log(q/p[0]));
    double s, b; linfit(t, lp, s, b);
    std::printf("azomethane: k = %.2e s^-1, t1/2 = %.0f s, tau = %.0f s\\n", -s, std::log(2.0)/-s, 1/-s);

    // (5) A + B -> P, unequal concentrations: RK4 vs integrated form
    const double kr = 2, A0 = 1, B0 = 1.5, dt = 1e-3;
    double A = A0, B = B0;
    auto f = [&](double a, double bb) { return -kr*a*bb; };
    for (int i = 0; i < 1000; ++i) {
        double k1 = f(A, B), k2 = f(A + dt/2*k1, B + dt/2*k1);
        double k3 = f(A + dt/2*k2, B + dt/2*k2), k4 = f(A + dt*k3, B + dt*k3);
        double d = dt*(k1 + 2*k2 + 2*k3 + k4)/6;
        A += d; B += d;
    }
    std::printf("A + B -> P: ln ratio = %.6f, (B0-A0) k t = %.6f\\n", std::log((B/B0)/(A/A0)), (B0-A0)*kr);
    return 0;
}
`;

// ── cpp/wk06_relaxation_arrhenius.cpp ────────────
export const CPP_RELAX = `// Wk06 - Chemical kinetics II: approach to equilibrium, relaxation, Arrhenius
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk06_relaxation_arrhenius.cpp -o wk06_relaxation_arrhenius
#include <cmath>
#include <cstdio>
#include <initializer_list>

const double R = 8.314462618;

int main() {
    // (1) A <-> B: RK4 vs closed form
    const double kf = 2, kb = 0.5, A0 = 1, dt = 1e-3;
    auto f = [&](double a) { return -kf*a + kb*(A0 - a); };
    double a = A0, maxerr = 0;
    FILE* out = std::fopen("relaxation.csv", "w");
    std::fprintf(out, "t,A,B\\n");
    for (int s = 1; s <= 3000; ++s) {
        double k1 = f(a), k2 = f(a + dt/2*k1), k3 = f(a + dt/2*k2), k4 = f(a + dt*k3);
        a += dt*(k1 + 2*k2 + 2*k3 + k4)/6;
        double ex = A0*(kb + kf*std::exp(-(kf+kb)*s*dt))/(kf+kb);
        maxerr = std::fmax(maxerr, std::fabs(a - ex));
        if (s % 30 == 0) std::fprintf(out, "%.3f,%.6f,%.6f\\n", s*dt, a, A0 - a);
    }
    std::fclose(out);
    double Aeq = kb*A0/(kf+kb);
    std::printf("max |RK4 - exact| = %.2e; K = %.3f = k/k' = %.3f; tau = %.3f\\n",
                maxerr, (A0-Aeq)/Aeq, kf/kb, 1/(kf+kb));

    // (2) temperature jump: water autoprotolysis
    const double Kw = 1.008e-14, tau = 37e-6, K = Kw/55.6;
    double krev = (1/tau)/(K + 2*std::sqrt(Kw)), kfwd = K*krev;
    std::printf("T-jump: k' = %.2e dm^3/mol/s, k = %.2e 1/s (one event per %.0f h)\\n",
                krev, kfwd, 1/kfwd/3600);

    // (3) Arrhenius fit (acetaldehyde decomposition, textbook data)
    const double T[8] = {700, 730, 760, 790, 810, 840, 910, 1000};
    const double k[8] = {0.011, 0.035, 0.105, 0.343, 0.789, 2.17, 20.0, 145.0};
    double sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (int i = 0; i < 8; ++i) { double x = 1/T[i], y = std::log(k[i]); sx += x; sy += y; sxx += x*x; sxy += x*y; }
    double slope = (8*sxy - sx*sy)/(8*sxx - sx*sx), icpt = (sy - slope*sx)/8;
    std::printf("Arrhenius: Ea = %.0f kJ/mol, A = %.2e dm^3/mol/s\\n", -slope*R/1e3, std::exp(icpt));
    std::printf("doubling per 10 K at 298 K <-> Ea = %.1f kJ/mol\\n", std::log(2.0)*R/(1/298.0 - 1/308.0)/1e3);

    // (4) catalysis
    for (double dEa : {5e3, 19e3, 40e3})
        std::printf("dEa = %2.0f kJ/mol -> rate x %.3g\\n", dEa/1e3, std::exp(dEa/(R*298)));
    std::printf("wrote relaxation.csv\\n");
    return 0;
}
`;
