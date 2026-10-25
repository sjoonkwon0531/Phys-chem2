"""
Wk09 — Collision theory, steric factor, and the RRK model
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Hard-sphere collision theory
      sigma = pi d^2,  d = (dA + dB)/2,  mu = mA mB/(mA + mB)
      c_rel = (8 kT / pi mu)^{1/2}
      Z_AB  = sigma c_rel nA nB              (collisions m^-3 s^-1)
      Z_AA  = (1/2) sigma c_rel nA^2,  c_rel = (16 kT / pi mA)^{1/2}
      k_r   = P sigma c_rel N_A exp(-Ea/RT)  (m^3 mol^-1 s^-1)
(2) Steric factor P = A_exp / A_theory (Atkins Table 27.1 data)
(3) RRK: energy E shared at random over s modes. Probability that one
    chosen mode holds at least E0:
      P(e1 >= E0 | E) = (1 - E0/E)^(s-1)     -> checked by Monte Carlo
    Thermal average with rho(E) ~ E^(s-1):
      k(T) = nu exp(-E0/kT)                  -> checked by quadrature

Run:  python wk09_collision_rrk.py     (~2 s)
"""
import numpy as np

KB, NA, AMU = 1.380649e-23, 6.02214076e23, 1.66053906660e-27
rng = np.random.default_rng(9)

# -- (1) N2 at 298.15 K and 1 bar, sigma = 0.43 nm^2 -------------
T, p, sigma, m = 298.15, 1.0e5, 0.43e-18, 28.0134 * AMU
n = p / (KB * T)
cbar = np.sqrt(8 * KB * T / (np.pi * m))
crel = np.sqrt(2) * cbar                   # = (16 kT / pi m)^(1/2)
z = sigma * crel * n                       # collisions per molecule per second
ZAA = 0.5 * sigma * crel * n**2
print("(1) N2, 298.15 K, 1 bar, sigma = 0.43 nm^2")
print(f"    n = {n:.3e} m^-3,  mean speed = {cbar:.1f} m/s,  relative speed = {crel:.1f} m/s")
print(f"    z = {z:.3e} s^-1 (one collision every {1e12/z:.0f} ps)")
print(f"    Z_AA = {ZAA:.3e} m^-3 s^-1 = {ZAA/NA/1e3:.3e} mol dm^-3 s^-1")
print(f"    A_theory = sigma c_rel N_A = {sigma*crel*NA*1e3:.3e} dm^3 mol^-1 s^-1\n")

# -- (2) steric factors from the lecture table -------------------
table = [("2NOCl -> 2NO + 2Cl", 9.4e9, 5.9e10), ("2ClO -> Cl2 + O2", 6.3e7, 2.5e10),
         ("H2 + C2H4 -> C2H6", 1.24e6, 7.4e11), ("K + Br2 -> KBr + Br", 1.0e12, 2.1e11)]
print("(2) steric factor P = A_exp / A_theory")
for name, aexp, ath in table:
    print(f"    {name:22s} P = {aexp/ath:.2e}")
print("    -> P > 1 for K + Br2: the electron 'harpoon' reacts before contact\n")

# -- (3) RRK: Monte Carlo on the energy simplex -------------------
def rrk_mc(s, x, N=400_000):
    """share E = 1 uniformly among s modes (Dirichlet(1,...,1)); P(e1 >= x)"""
    g = rng.exponential(size=(N, s))
    e1 = g[:, 0] / g.sum(axis=1)
    return (e1 >= x).mean()

print("(3) RRK  P(e1 >= E0 | E) = (1 - E0/E)^(s-1)")
print("     s   E0/E    formula       Monte Carlo")
for s in (2, 3, 5, 10):
    for x in (0.2, 0.5):
        print(f"    {s:2d}   {x:.1f}   {(1-x)**(s-1):.5f}      {rrk_mc(s, x):.5f}")

# thermal average: k(T)/nu = int k(E) rho e^{-E/kT} / int rho e^{-E/kT}
s, E0, kT = 6, 1.0, 0.25
E = np.linspace(0, 60 * kT, 600_001)
dE = E[1] - E[0]
w = E**(s - 1) * np.exp(-E / kT)
kE = np.zeros_like(E)
msk = E >= E0
kE[msk] = (1 - E0 / E[msk])**(s - 1)
ratio = (kE * w).sum() * dE / (w.sum() * dE)
print(f"\n    thermal average (s = {s}, E0/kT = {E0/kT:.0f}):  quadrature {ratio:.6e}"
      f"   exp(-E0/kT) = {np.exp(-E0/kT):.6e}")
print("    -> the s-dependence cancels: RRK reproduces the Arrhenius factor")
