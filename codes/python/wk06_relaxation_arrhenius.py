"""
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
print(f"  tau = 1/(k+k') = {tau:.3f};  x(tau)/x(0) = {x[i_tau]/x[0]:.4f} (1/e = {np.exp(-1):.4f})\n")

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
print("     yet neutralisation is among the fastest reactions known in solution\n")

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
