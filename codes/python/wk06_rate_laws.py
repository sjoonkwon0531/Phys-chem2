"""
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
print("-> a pressure gauge is a kinetics instrument: alpha = (2/3)(P/P0 - 1)\n")

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
print("    so the rate table belongs to [I]0 = 1,2,4,6 x 1e-5)\n")

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
print("-> halving / constant / doubling: the half-life pattern reveals the order\n")

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
print(f"  time to 10 % remaining = ln10/k = {np.log(10)/k1:.0f} s\n")

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
