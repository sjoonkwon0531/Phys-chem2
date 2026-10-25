"""
Wk09 — Transition state theory (Eyring equation)
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Vibrational partition function (energies measured from the ZPE)
      q_vib = 1 / (1 - exp(-h nu / kT))  ->  kT / (h nu)   when h nu << kT
    The soft mode along the reaction coordinate is the one that becomes kT/h nu.
(2) Eyring equation
      k_r = kappa (kT/h) (RT/p0) K_bar(double dagger)
          = kappa (kT/h) exp(dS/R) exp(-dH/RT)      (solution, per c0 = 1 mol/dm^3)
(3) Two structureless atoms A + B: TST with an atom-pair activated complex
      K_bar = N_A Lambda_A^3 Lambda_B^3 / (Lambda_C^3 V_m0) * (2 I kT / hbar^2) e^{-dE0/RT}
    gives exactly the collision-theory result  N_A sigma (8kT/pi mu)^{1/2} e^{-dE0/RT}
    with sigma = pi r^2 (checked numerically below).

Run:  python wk09_eyring_tst.py
"""
import numpy as np

KB, H, NA, R = 1.380649e-23, 6.62607015e-34, 6.02214076e23, 8.314462618
HBAR, AMU, C2 = H / (2 * np.pi), 1.66053906660e-27, 1.438776877e-2   # C2 = hc/k [m K]

# -- (1) exact vs high-temperature q_vib ----------------------------
T = 298.15
print(f"(1) q_vib at {T} K   (wavenumber in cm^-1)")
print("    nu      h nu/kT    exact      kT/h nu    error")
for wn in (2000, 1000, 300, 100, 30, 10):
    x = wn * 100 * C2 / T
    ex, ap = 1 / (1 - np.exp(-x)), 1 / x
    print(f"    {wn:5d}   {x:7.3f}   {ex:9.4f}   {ap:9.4f}   {100*(ap-ex)/ex:+7.1f} %")
print(f"    kT/h = {KB*T/H:.4e} s^-1 at {T} K\n")

# -- (2) Eyring equation ------------------------------------------
print("(2) k = (kT/h) exp(dS/R) exp(-dH/RT),  kappa = 1")
for dH, dS in [(60e3, -50.0), (60e3, 0.0), (80e3, -50.0)]:
    k = KB * T / H * np.exp(dS / R) * np.exp(-dH / (R * T))
    print(f"    dH = {dH/1e3:4.0f} kJ/mol, dS = {dS:+5.0f} J/K/mol:  k = {k:.3e} dm^3 mol^-1 s^-1")
# Ea from an Eyring line: Ea = dH + RT (solution) -> slope check
Ts = np.array([280.0, 300.0, 320.0])
ks = KB * Ts / H * np.exp(-50 / R) * np.exp(-60e3 / (R * Ts))
Ea = -R * np.polyfit(1 / Ts, np.log(ks), 1)[0]
print(f"    Arrhenius slope of the Eyring k(T): Ea = {Ea/1e3:.2f} kJ/mol  (dH + R<T> = {(60e3+R*300)/1e3:.2f})\n")

# -- (3) TST = collision theory for two atoms ------------------------
def Lam(m, T):
    return H / np.sqrt(2 * np.pi * m * KB * T)
mA, mB, r = 1.008 * AMU, 35.45 * AMU, 0.30e-9      # H + Cl-like masses, r = 0.30 nm
mu = mA * mB / (mA + mB); I = mu * r**2
print("(3) atom + atom, r = 0.30 nm, masses 1.008 and 35.45 u, dE0 = 0")
print("     T [K]    TST [dm3/mol/s]    collision theory    ratio")
for T in (300.0, 1000.0):
    p0 = 1e5; Vm = R * T / p0
    Kbar = NA * Lam(mA, T)**3 * Lam(mB, T)**3 / (Lam(mA + mB, T)**3 * Vm) * (2 * I * KB * T / HBAR**2)
    k_tst = KB * T / H * (R * T / p0) * Kbar
    k_ct = NA * np.pi * r**2 * np.sqrt(8 * KB * T / (np.pi * mu))
    print(f"    {T:6.0f}    {k_tst*1e3:.6e}       {k_ct*1e3:.6e}      {k_tst/k_ct:.12f}")
print("    -> identical: collision theory is TST for structureless reactants")
