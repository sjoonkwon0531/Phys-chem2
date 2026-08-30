"""
Wk01 — Least action principle (Lagrangian mechanics)
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

For the simple harmonic oscillator, L = (1/2) m qdot^2 - (1/2) m w^2 q^2.
The classical path between (0, 0) and (T, qT) is q_cl(t) = A sin(w t).
We perturb it as  q(t) = q_cl(t) + eps * sin(n pi t / T)   (endpoints fixed)
and show that the action S[q] is MINIMIZED at eps = 0 (when w T < pi).

Run:  python wk01_action_principle.py
"""
import numpy as np
import matplotlib.pyplot as plt

trapz = getattr(np, "trapezoid", getattr(np, "trapz", None))  # numpy 1.x/2.x compat

m, w = 1.0, 1.0
T, qT = 2.0, 1.0                    # w*T = 2 < pi  ->  true minimum
A = qT/np.sin(w*T)                  # classical amplitude
t = np.linspace(0.0, T, 2001)

def action(q):
    qdot = np.gradient(q, t)
    L = 0.5*m*qdot**2 - 0.5*m*w**2*q**2
    return trapz(L, t)

q_cl = A*np.sin(w*t)
S_cl = action(q_cl)
print(f"classical action  S_cl = {S_cl:.6f}")

# -- S(eps) parabolas for perturbation modes n = 1, 2, 3 -----
eps = np.linspace(-1.0, 1.0, 81)
plt.figure(figsize=(11, 4.2))
plt.subplot(1, 2, 2)
for n in (1, 2, 3):
    S = [action(q_cl + e*np.sin(n*np.pi*t/T)) for e in eps]
    plt.plot(eps, S, label=f"mode n={n}")
plt.axvline(0, color="k", lw=0.7)
plt.scatter([0], [S_cl], zorder=5, color="k", label="classical path")
plt.xlabel("perturbation eps"); plt.ylabel("action S[q]")
plt.title("S is minimized on the classical path"); plt.legend()

# -- family of paths ----------------------------------------
plt.subplot(1, 2, 1)
for e in np.linspace(-0.8, 0.8, 9):
    q = q_cl + e*np.sin(np.pi*t/T)
    plt.plot(t, q, color="0.7", lw=0.8)
plt.plot(t, q_cl, "r-", lw=2.2, label="classical path (Euler-Lagrange)")
plt.scatter([0, T], [0, qT], color="k", zorder=5)
plt.xlabel("t"); plt.ylabel("q(t)")
plt.title("Path family with fixed endpoints"); plt.legend()
plt.tight_layout(); plt.show()

# -- check Euler-Lagrange residual on the classical path -----
qdd = np.gradient(np.gradient(q_cl, t), t)
res = m*qdd + m*w**2*q_cl            # should vanish
print(f"max |E-L residual| on classical path (interior) = "
      f"{np.abs(res[50:-50]).max():.3e}")
