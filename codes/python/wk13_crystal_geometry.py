"""
Week 13 (Physical Chemistry 2) - Crystal geometry of cubic lattices
  1) primitive vectors, cell volumes, nearest neighbours, packing fractions (SC, BCC, FCC)
  2) Miller indices from intercepts
  3) interplanar spacing d_hkl = a / sqrt(h^2 + k^2 + l^2) and a check against 1/|G|
  4) Bragg's law worked example from the lecture: {111} reflection at 2theta = 22.4 deg, lambda = 154 pm
"""
import numpy as np
from fractions import Fraction
from math import gcd
from functools import reduce

a = 1.0
lattices = {
    "SC":  np.array([[1, 0, 0], [0, 1, 0], [0, 0, 1]], float) * a,
    "BCC": np.array([[-1, 1, 1], [1, -1, 1], [1, 1, -1]], float) * a / 2,
    "FCC": np.array([[0, 1, 1], [1, 0, 1], [1, 1, 0]], float) * a / 2,
}
print("1) Cubic lattices (conventional cube edge a = 1)")
for name, A in lattices.items():
    Vp = abs(np.linalg.det(A))
    pts = [i * A[0] + j * A[1] + k * A[2] for i in range(-3, 4) for j in range(-3, 4) for k in range(-3, 4)]
    d = sorted(np.linalg.norm(p) for p in pts if np.linalg.norm(p) > 1e-9)
    dnn = d[0]
    z = sum(1 for x in d if abs(x - dnn) < 1e-9)
    r = dnn / 2                                  # touching hard spheres
    pf = (4 / 3) * np.pi * r**3 / Vp             # one lattice point per primitive cell
    print(f"   {name:3s}: V_prim = {Vp:.4f} a^3, points per cube = {1 / Vp:.0f}, "
          f"z = {z:2d}, d_nn = {dnn:.4f} a, packing fraction = {pf:.4f}")
print("   exact: pi/6 = %.4f, sqrt(3)pi/8 = %.4f, sqrt(2)pi/6 = %.4f"
      % (np.pi / 6, np.sqrt(3) * np.pi / 8, np.sqrt(2) * np.pi / 6))

def miller(intercepts):
    """intercepts in units of a1, a2, a3; use None for a plane parallel to an axis"""
    rec = [Fraction(0) if x is None else 1 / Fraction(x).limit_denominator(100) for x in intercepts]
    den = reduce(lambda p, q: p * q // gcd(p, q), [f.denominator for f in rec])
    ints = [int(f * den) for f in rec]
    g = reduce(gcd, [abs(i) for i in ints if i != 0])
    return tuple(i // g for i in ints)

print("\n2) Miller indices from intercepts")
for ic in [(3, 2, 2), (1, 1, 1), (1, None, None), (0.5, 1, None), (2, 3, 6), (1, -1, None)]:
    print(f"   intercepts {str(ic):18s} -> (hkl) = {miller(ic)}")

print("\n3) Interplanar spacing in a cubic lattice, d = a/sqrt(h2+k2+l2), and 2pi/|G|")
B = 2 * np.pi * np.eye(3)                       # SC reciprocal vectors for a = 1
for hkl in [(1, 0, 0), (1, 1, 0), (1, 1, 1), (2, 0, 0), (2, 1, 0), (2, 1, 1), (2, 2, 0), (3, 1, 1)]:
    G = np.array(hkl) @ B
    d1 = 1 / np.sqrt(sum(h * h for h in hkl))
    print(f"   {str(hkl):10s} d = {d1:.5f} a   2pi/|G| = {2 * np.pi / np.linalg.norm(G):.5f} a")

print("\n4) Bragg's law example (lecture slide 13)")
lam, twotheta = 154.0, 22.4                     # pm, degrees
d111 = lam / (2 * np.sin(np.radians(twotheta / 2)))
print(f"   d111 = lambda / (2 sin 11.2 deg) = {d111:.1f} pm")
print(f"   a = sqrt(3) d111 = {np.sqrt(3) * d111:.1f} pm")
