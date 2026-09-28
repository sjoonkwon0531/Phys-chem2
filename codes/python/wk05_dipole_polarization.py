"""
Wk05 — Dipole moments, polarizability & the Debye equation
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Vector addition of bond dipoles:
      mu_res = 2 mu1 cos(theta/2)
    -> predicts the dichlorobenzene isomers (ortho/meta/para) from the
       chlorobenzene value mu1 = 1.57 D alone.
(2) Debye equation & molar polarization:
      P_m = (N_A/3 eps0) (alpha + mu^2/3kT),  (eps_r-1)/(eps_r+2) = rho P_m / M
    A plot of P_m vs 1/T is a LINE: slope -> mu, intercept -> alpha.
(3) Clausius-Mossotti (nonpolar): predicts eps_r and n = sqrt(eps_r)
    for CCl4 from its polarizability volume alone -> n ~ 1.46 (exp 1.4607!)

Run:  python wk05_dipole_polarization.py
"""
import numpy as np
import matplotlib.pyplot as plt

EPS0 = 8.8541878128e-12       # F/m
KB = 1.380649e-23
NA = 6.02214076e23
DEBYE = 3.33564e-30           # C m

# -- (1) dichlorobenzene isomers ------------------------------
mu1 = 1.57                    # D, chlorobenzene (one C-Cl "arm")
print("isomer   angle   mu_calc [D]   mu_obs [D]")
for name, th, obs in (("ortho", 60, 2.25), ("meta", 120, 1.48), ("para", 180, 0.0)):
    mu = 2 * mu1 * np.cos(np.radians(th) / 2)
    print(f"{name:6s}  {th:4d}    {mu:9.2f}   {obs:9.2f}")
print("-> geometry alone predicts the trend (differences: induction & sterics)\n")

# -- (2) Debye plot: extract mu and alpha from P_m(T) ---------
mu_w = 1.85 * DEBYE           # water vapor
alpha_p = 1.48e-30            # polarizability volume [m^3]
alpha = 4 * np.pi * EPS0 * alpha_p
T = np.linspace(300, 500, 9)
Pm = NA / (3 * EPS0) * (alpha + mu_w**2 / (3 * KB * T))   # [m^3/mol]

slope, intercept = np.polyfit(1 / T, Pm, 1)
mu_fit = np.sqrt(9 * EPS0 * KB * slope / NA)
alpha_fit = 3 * EPS0 * intercept / NA
print("Debye plot (water vapor, synthetic data):")
print(f"  slope     -> mu    = {mu_fit/DEBYE:.3f} D   (input 1.850 D)")
print(f"  intercept -> alpha'= {alpha_fit/(4*np.pi*EPS0)*1e30:.3f} x10^-30 m^3 (input 1.480)")
print("-> ONE experiment (P_m vs T) separates permanent dipole from polarizability\n")

plt.figure(figsize=(6, 4))
plt.plot(1e3 / T, Pm * 1e6, "o-")
plt.xlabel("1000/T [1/K]"); plt.ylabel("P$_m$ [cm$^3$/mol]")
plt.title("Debye plot: slope ∝ μ², intercept ∝ α")
plt.tight_layout(); plt.show()

# -- (3) Clausius-Mossotti for a NONPOLAR liquid --------------
# CCl4: alpha' = 10.5e-30 m^3, rho = 1590 kg/m^3, M = 153.8 g/mol
x = 4 * np.pi * 1590 * NA * 10.5e-30 / (3 * 0.1538)
eps_r = (1 + 2 * x) / (1 - x)
print("Clausius-Mossotti for CCl4 (nonpolar, orientation term absent):")
print(f"  (eps_r-1)/(eps_r+2) = {x:.4f}  ->  eps_r = {eps_r:.3f}")
print(f"  refractive index n = sqrt(eps_r) = {np.sqrt(eps_r):.3f}  (experimental 1.4607)")
print("-> molecular polarizability predicts a BULK optical property\n")

# orientation term freeze-out with frequency (qualitative check)
print("frequency window   surviving polarization      typical eps_r of water")
for f, mech, e in (("static-radio", "orientation + ionic + electronic", 78.4),
                   ("microwave-IR", "ionic + electronic", "~5"),
                   ("visible-UV", "electronic only (-> n^2 = 1.77)", 1.77)):
    print(f"  {f:13s}  {mech:33s}  {e}")
print("-> water: eps_r = 78 but n^2 = 1.77 — dipoles cannot follow light!")
