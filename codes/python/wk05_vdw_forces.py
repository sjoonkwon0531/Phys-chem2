"""
Wk05 — Van der Waals forces: Keesom, induction, London
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

All three attractive mechanisms share the same -C/r^6 form:
  Keesom  (rotating dipole-dipole): C = 2 mu1^2 mu2^2 / (3 (4 pi eps0)^2 kT)
  Debye   (dipole-induced dipole):  C = mu1^2 alpha2' / (4 pi eps0)
  London  (dispersion):             C = (3/2) alpha1' alpha2' I1 I2/(I1+I2)
Adding them for real molecules shows the (surprising) dominance of
dispersion — even for polar HCl.

Run:  python wk05_vdw_forces.py
"""
import numpy as np
import matplotlib.pyplot as plt

EPS0 = 8.8541878128e-12
KB = 1.380649e-23
NA = 6.02214076e23
DEBYE = 3.33564e-30
EV = 1.602176634e-19
T = 298.15

# molecule data: mu [D], alpha' [1e-30 m^3], I [eV]
MOL = {
    "Ar":   (0.00, 1.66, 15.76),
    "CH4":  (0.00, 2.60, 12.61),
    "HCl":  (1.08, 2.63, 12.74),
    "NH3":  (1.47, 2.22, 10.07),
    "H2O":  (1.85, 1.48, 12.62),
    "C6H6": (0.00, 10.4,  9.24),
}

def keesom(m1, m2):
    return 2 * (m1 * DEBYE)**2 * (m2 * DEBYE)**2 / (3 * (4 * np.pi * EPS0)**2 * KB * T)

def induction(m1, a2p):
    return (m1 * DEBYE)**2 * (a2p * 1e-30) / (4 * np.pi * EPS0)

def london(a1p, a2p, I1, I2):
    return 1.5 * (a1p * 1e-30) * (a2p * 1e-30) * (I1 * I2 / (I1 + I2)) * EV

r = 0.40e-9                    # typical contact separation 0.4 nm
print(f"pair          C_Keesom   C_induc    C_London   [1e-79 J m^6]   V(0.4nm) [kJ/mol]")
for name, (mu, ap, I) in MOL.items():
    cK = keesom(mu, mu)
    cD = 2 * induction(mu, ap)          # both directions (1 induces 2 & 2 induces 1)
    cL = london(ap, ap, I, I)
    Ctot = cK + cD + cL
    V = -Ctot / r**6 * NA / 1e3
    print(f"{name:6s}-{name:6s} {cK*1e79:8.2f}  {cD*1e79:8.2f}  {cL*1e79:9.2f}"
          f"   {'':4s}  {V:10.2f}")
print("-> London dispersion dominates for every pair except H2O")
print("   (benzene: zero dipole yet the LARGEST attraction — polarizability wins)\n")

# distance dependence comparison (slide's interaction table)
print("interaction        power   typical E [kJ/mol]  (lecture Table 16B.1)")
for nm, p, e in (("ion-ion", "1/r", 250), ("H-bond", "-", 20), ("ion-dipole", "1/r^2", 15),
                 ("dipole-dipole (fixed)", "1/r^3", 2), ("dipole-dipole (rot.)", "1/r^6", 0.3),
                 ("London", "1/r^6", 2)):
    print(f"  {nm:22s} {p:6s}  {e}")

# plot: r-dependence for H2O pair
rr = np.linspace(0.3, 1.2, 200) * 1e-9
cK, cD = keesom(1.85, 1.85), 2 * induction(1.85, 1.48)
cL = london(1.48, 1.48, 12.62, 12.62)
plt.figure(figsize=(6.5, 4.4))
for C, lb in ((cK, "Keesom"), (cD, "induction"), (cL, "London"), (cK + cD + cL, "total")):
    plt.plot(rr * 1e9, -C / rr**6 * NA / 1e3, label=lb)
plt.xlabel("r [nm]"); plt.ylabel("V [kJ/mol]"); plt.legend()
plt.title("H2O pair: all three share the 1/r$^6$ law")
plt.tight_layout(); plt.show()
