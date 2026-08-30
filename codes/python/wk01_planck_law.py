"""
Wk01 — Planck's law of blackbody radiation
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

Compares Rayleigh-Jeans / Wien / Planck spectral emissive power E_b,lambda(T),
then numerically verifies:
  (1) Wien's displacement law   : lambda_max * T = 2898 um*K
  (2) Stefan-Boltzmann law      : integral E_b,lambda dlambda = sigma * T^4

Run:  python wk01_planck_law.py     (needs numpy, matplotlib)
"""
import numpy as np
import matplotlib.pyplot as plt

trapz = getattr(np, "trapezoid", getattr(np, "trapz", None))  # numpy 1.x/2.x compat

# -- physical constants (SI) ---------------------------------
h  = 6.62607015e-34      # Planck constant [J s]
c  = 2.99792458e8        # speed of light [m/s]
kB = 1.380649e-23        # Boltzmann constant [J/K]
sigma = 5.670374419e-8   # Stefan-Boltzmann [W/m^2 K^4]
C1 = 2.0*np.pi*h*c**2    # first radiation constant (hemispherical)
C2 = h*c/kB              # second radiation constant

def planck(lam, T):          # spectral emissive power [W/m^2/m]
    return C1/lam**5/np.expm1(C2/(lam*T))

def rayleigh_jeans(lam, T):  # classical limit -> UV catastrophe
    return 2.0*np.pi*c*kB*T/lam**4

def wien_approx(lam, T):     # Wien's 1896 guess (short-lambda limit)
    return C1/lam**5*np.exp(-C2/(lam*T))

# -- 1) spectra at several temperatures ----------------------
lam = np.logspace(-7, -4.5, 800)          # 100 nm ... ~30 um
Ts  = [3000.0, 4000.0, 5000.0, 5800.0]

plt.figure(figsize=(11, 4.2))
plt.subplot(1, 2, 1)
for T in Ts:
    plt.plot(lam*1e6, planck(lam, T), label=f"Planck {T:.0f} K")
plt.plot(lam*1e6, rayleigh_jeans(lam, 5800.0), "k--",
         label="Rayleigh-Jeans 5800 K (diverges!)")
plt.plot(lam*1e6, wien_approx(lam, 5800.0), "k:", label="Wien approx 5800 K")
plt.ylim(0, 1.15*planck(lam, 5800.0).max()); plt.xlim(0, 3)
plt.xlabel("wavelength [um]"); plt.ylabel("E_b,lambda [W/m^2/m]")
plt.title("Blackbody spectra & UV catastrophe"); plt.legend(fontsize=8)

# -- 2) Wien's displacement law ------------------------------
print("T [K]   lambda_max [um]   lambda_max*T [um K]")
for T in Ts:
    lmax = lam[np.argmax(planck(lam, T))]
    print(f"{T:6.0f}  {lmax*1e6:14.4f}  {lmax*T*1e6:16.1f}")
print("Wien's law predicts lambda_max*T = 2898 um K\n")

# -- 3) Stefan-Boltzmann by numerical integration ------------
print("T [K]   integral E dlambda      sigma*T^4        ratio")
lam_i = np.logspace(-8, -3, 40000)        # wide range for the integral
for T in Ts:
    E_tot = trapz(planck(lam_i, T), lam_i)
    print(f"{T:6.0f}  {E_tot:16.6e}  {sigma*T**4:14.6e}  {E_tot/(sigma*T**4):8.5f}")

# -- 4) Wien-law check plot: peak locus ----------------------
plt.subplot(1, 2, 2)
Tspan = np.linspace(1000, 8000, 60)
lmaxs = [lam[np.argmax(planck(lam, T))] for T in Tspan]
plt.plot(Tspan, np.array(lmaxs)*1e6, "b-", label="numerical peak")
plt.plot(Tspan, 2898.0/Tspan, "r--", label="2898/T (Wien)")
plt.xlabel("T [K]"); plt.ylabel("lambda_max [um]")
plt.title("Wien's displacement law"); plt.legend()
plt.tight_layout(); plt.show()
