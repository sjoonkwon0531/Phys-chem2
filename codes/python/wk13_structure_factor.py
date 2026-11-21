"""
Week 13 (Physical Chemistry 2) - Structure factor and extinction rules
  S(hkl) = sum_j f_j exp(-i 2 pi (h x_j + k y_j + l z_j)), intensity I ~ |S|^2
  bases in the conventional cubic cell: SC, BCC, FCC, diamond, NaCl (rock salt), CsCl, KCl
  KCl: K+ and Cl- both have 18 electrons, so f_K ~ f_Cl and KCl diffracts like a simple cubic lattice of edge a/2
"""
import numpy as np
from itertools import product

F, H = 0.5, 0.25
bases = {
    "SC":      [("A", (0, 0, 0))],
    "BCC":     [("A", (0, 0, 0)), ("A", (F, F, F))],
    "FCC":     [("A", (0, 0, 0)), ("A", (0, F, F)), ("A", (F, 0, F)), ("A", (F, F, 0))],
    "diamond": [("A", p) for p in [(0, 0, 0), (0, F, F), (F, 0, F), (F, F, 0)]]
             + [("A", (p[0] + H, p[1] + H, p[2] + H)) for p in [(0, 0, 0), (0, F, F), (F, 0, F), (F, F, 0)]],
    "NaCl":    [("Na", p) for p in [(0, 0, 0), (0, F, F), (F, 0, F), (F, F, 0)]]
             + [("Cl", (p[0] + F, p[1], p[2])) for p in [(0, 0, 0), (0, F, F), (F, 0, F), (F, F, 0)]],
    "CsCl":    [("Cs", (0, 0, 0)), ("Cl", (F, F, F))],
}
# forward-scattering form factors f(0) = number of electrons
f0 = {"A": 1.0, "Na": 10.0, "Cl": 18.0, "Cs": 54.0, "K": 18.0}

def S(basis, hkl, f=f0):
    return sum(f[s] * np.exp(-2j * np.pi * np.dot(hkl, xyz)) for s, xyz in basis)

hkls = sorted({tuple(sorted(map(abs, t), reverse=True)) for t in product(range(0, 5), repeat=3)} - {(0, 0, 0)},
              key=lambda t: (t[0] ** 2 + t[1] ** 2 + t[2] ** 2, t))[:14]
print("   hkl      N=h2+k2+l2 " + " ".join(f"{k:>9s}" for k in bases))
for hkl in hkls:
    row = " ".join(f"{abs(S(b, hkl)):9.2f}" for b in bases.values())
    print(f"   {''.join(map(str, hkl)):8s} {sum(x * x for x in hkl):5d}     {row}")

print("\n   Allowed reflections (|S| > 1e-6), listed by N = h2+k2+l2:")
for name, b in bases.items():
    Ns = sorted({sum(x * x for x in hkl) for hkl in product(range(0, 6), repeat=3)
                 if any(hkl) and abs(S(b, hkl)) > 1e-6})[:8]
    print(f"   {name:8s}: {Ns}")

print("\n   KCl (rock salt, f_K = f_Cl = 18): mixed-parity reflections such as (111) vanish")
kcl = [(("K" if s == "Na" else s), xyz) for s, xyz in bases["NaCl"]]
for hkl in [(1, 1, 1), (2, 0, 0), (2, 2, 0), (3, 1, 1), (2, 2, 2)]:
    print(f"   {hkl}: |S_NaCl| = {abs(S(bases['NaCl'], hkl)):5.1f}   |S_KCl| = {abs(S(kcl, hkl)):5.1f}")
