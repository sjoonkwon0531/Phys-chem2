"""
Wk02 — Step potential & quantum tunneling
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Step (E > V0):  R = ((k1-k2)/(k1+k2))^2,  T = 4 k1 k2/(k1+k2)^2,  R+T = 1
    Step (E < V0):  total reflection R = 1, evanescent tail exp(-kappa x)
(2) Barrier of height V0, width w (= 2a in the lecture):
    T = 1 / (1 + V0^2 sinh^2(kappa w) / (4 E (V0-E)))
    ~ 16 (E/V0)(1-E/V0) exp(-2 kappa w)    for kappa w >> 1
Real-unit checks reproduce the lecture examples (FET / STM).

Run:  python wk02_step_tunneling.py
"""
import numpy as np
import matplotlib.pyplot as plt

# -- real-unit constants (electron, eV, nm) ------------------
HBARC = 197.3269804          # eV nm
MC2   = 0.51099895e6         # eV (electron)
def kappa_nm(dE_eV):         # sqrt(2m dE)/hbar in nm^-1
    return np.sqrt(2*MC2*dE_eV)/HBARC
def k_nm(E_eV):
    return np.sqrt(2*MC2*E_eV)/HBARC

# -- (1) step potential --------------------------------------
def step_RT(E, V0):
    if E <= V0:
        return 1.0, 0.0
    k1, k2 = np.sqrt(E), np.sqrt(E - V0)          # common factor cancels
    R = ((k1-k2)/(k1+k2))**2
    T = 4*k1*k2/(k1+k2)**2
    return R, T

print("E/V0    R        T        R+T")
for r in (1.2, 1.5, 2.0, 4.0):
    R, T = step_RT(r, 1.0)
    print(f"{r:4.1f}  {R:.5f}  {T:.5f}  {R+T:.5f}")
print()

# -- (2) barrier tunneling -----------------------------------
def T_exact(E, V0, w_nm):
    kap = kappa_nm(V0 - E)
    s = np.sinh(kap*w_nm)
    return 1.0/(1.0 + V0**2*s**2/(4*E*(V0-E)))

def T_approx(E, V0, w_nm):
    kap = kappa_nm(V0 - E)
    return 16*E*(V0-E)/V0**2*np.exp(-2*kap*w_nm)

# lecture example 1 (FET): E = 6 eV, V0 = 12 eV, w = 0.18 nm
kap = kappa_nm(6.0)
print(f"FET:  kappa = {kap:.2f} nm^-1 (lecture: 12.6),  "
      f"T = {T_exact(6, 12, 0.18):.4f} (lecture: 0.044)")
# lecture example 2 (STM-like): V0 = 5 eV, E = 2 eV
print(f"STM:  T(w=1.0 nm) = {T_exact(2, 5, 1.0):.2e} (lecture: ~7e-8)")
print(f"      T(w=0.5 nm) = {T_exact(2, 5, 0.5):.2e} (lecture: ~5e-4)\n")

plt.figure(figsize=(12, 4))
# T vs E/V0 for the step
plt.subplot(1, 3, 1)
rr = np.linspace(1.0001, 7, 400)
RT = np.array([step_RT(r, 1.0) for r in rr])
plt.plot(rr, RT[:, 1], "b-", label="T")
plt.plot(rr, RT[:, 0], "r-", label="R")
plt.axhline(1, color="k", lw=0.6, ls="--")
plt.xlabel("E / V0"); plt.title("Step: R & T (E > V0)"); plt.legend()

# T vs E/V0 for the barrier
plt.subplot(1, 3, 2)
EE = np.linspace(0.02, 0.98, 300)*5.0
plt.plot(EE/5.0, [T_exact(E, 5.0, 0.4) for E in EE], "b-", label="exact")
plt.plot(EE/5.0, [T_approx(E, 5.0, 0.4) for E in EE], "r--", label="thick-barrier approx")
plt.yscale("log"); plt.xlabel("E / V0"); plt.title("Barrier: T (V0=5 eV, w=0.4 nm)")
plt.legend(fontsize=8)

# T vs width -> STM principle (exponential sensitivity)
plt.subplot(1, 3, 3)
ww = np.linspace(0.1, 1.2, 300)
plt.semilogy(ww, [T_exact(2, 5, w) for w in ww], "b-")
plt.xlabel("barrier width w [nm]"); plt.title("T(w): why STM resolves 0.01 nm")
plt.tight_layout(); plt.show()

dT = T_exact(2, 5, 0.50)/T_exact(2, 5, 0.51)
print(f"STM sensitivity: shrinking w by 0.01 nm multiplies T by {dT:.2f}")
