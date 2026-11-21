"""
Week 13 (Physical Chemistry 2) - Reciprocal lattice and Brillouin zones
  1) b1 = 2pi (a2 x a3)/(a1 . a2 x a3), etc.; check b_i . a_j = 2 pi delta_ij
  2) reciprocal of SC is SC, of BCC is FCC, of FCC is BCC
  3) Brillouin-zone volume = (2pi)^3 / V_cell, and the number of faces of the first BZ
  4) 2D Wigner-Seitz cell by half-plane clipping (area must equal the primitive-cell area)
  5) 1D Fourier series of a periodic density: coefficients n_p
"""
import numpy as np

def reciprocal(A):
    a1, a2, a3 = A
    V = a1 @ np.cross(a2, a3)
    return 2 * np.pi * np.array([np.cross(a2, a3), np.cross(a3, a1), np.cross(a1, a2)]) / V

a = 1.0
lat = {
    "SC":  np.eye(3) * a,
    "BCC": np.array([[-1, 1, 1], [1, -1, 1], [1, 1, -1]], float) * a / 2,
    "FCC": np.array([[0, 1, 1], [1, 0, 1], [1, 1, 0]], float) * a / 2,
}
print("1-2) Reciprocal primitive vectors (units of 2pi/a)")
for name, A in lat.items():
    B = reciprocal(A)
    chk = B @ A.T / (2 * np.pi)
    print(f"   {name}: b1 = {B[0] / (2 * np.pi)}, b2 = {B[1] / (2 * np.pi)}, b3 = {B[2] / (2 * np.pi)}")
    print(f"        max |b_i.a_j/2pi - delta_ij| = {np.abs(chk - np.eye(3)).max():.1e}")

print("\n3) First Brillouin zone: volume and number of faces")
for name, A in lat.items():
    B = reciprocal(A)
    Vc = abs(np.linalg.det(A))
    Vbz = abs(np.linalg.det(B))
    G = [i * B[0] + j * B[1] + k * B[2] for i in range(-2, 3) for j in range(-2, 3) for k in range(-2, 3)]
    G = [g for g in G if np.linalg.norm(g) > 1e-9]
    # a reciprocal vector G gives a face of the first BZ if its bisecting plane is not cut off by another one:
    # the face centre G/2 must satisfy |G/2 - G'|>=|G/2| for every other G' (Voronoi neighbour test)
    faces = 0
    for g in G:
        c = g / 2
        if all(np.linalg.norm(c - h) >= np.linalg.norm(c) - 1e-9 for h in G if not np.allclose(h, g)):
            if all(np.linalg.norm(c - h) > np.linalg.norm(c) + 1e-9 for h in G if not np.allclose(h, g) and not np.allclose(h, 0)):
                faces += 1
    print(f"   {name}: V_cell = {Vc:.3f} a^3, V_BZ = {Vbz:.3f} (2pi/a)^3 = (2pi)^3/V_cell? "
          f"{np.isclose(Vbz, (2 * np.pi) ** 3 / Vc)}, faces of 1st BZ = {faces}")

def ws_cell_2d(a1, a2, R=3):
    """Wigner-Seitz cell of a 2D lattice: clip a big square by the bisector half-planes of all neighbours"""
    poly = [np.array(p, float) for p in [(-10, -10), (10, -10), (10, 10), (-10, 10)]]
    for i in range(-R, R + 1):
        for j in range(-R, R + 1):
            if i == 0 and j == 0:
                continue
            T = i * a1 + j * a2
            c = T @ T / 2                       # keep points with x.T <= |T|^2/2
            new = []
            for k in range(len(poly)):
                P, Q = poly[k], poly[(k + 1) % len(poly)]
                fp, fq = P @ T - c, Q @ T - c
                if fp <= 0:
                    new.append(P)
                if fp * fq < 0:
                    new.append(P + (Q - P) * fp / (fp - fq))
            poly = []
            for q in new:                        # drop repeated vertices
                if not poly or np.linalg.norm(q - poly[-1]) > 1e-9:
                    poly.append(q)
            if len(poly) > 1 and np.linalg.norm(poly[0] - poly[-1]) < 1e-9:
                poly.pop()
    return poly

def area(poly):
    x = np.array([p[0] for p in poly]); y = np.array([p[1] for p in poly])
    return 0.5 * abs(np.dot(x, np.roll(y, -1)) - np.dot(y, np.roll(x, -1)))

print("\n4) 2D Wigner-Seitz cells")
for name, a1, a2 in [("square", np.array([1, 0]), np.array([0, 1])),
                     ("hexagonal", np.array([1, 0]), np.array([0.5, np.sqrt(3) / 2])),
                     ("oblique", np.array([1, 0]), np.array([0.3, 0.8]))]:
    P = ws_cell_2d(a1, a2)
    print(f"   {name:9s}: {len(P)} vertices, WS area = {area(P):.6f}, |a1 x a2| = {abs(a1[0] * a2[1] - a1[1] * a2[0]):.6f}")

print("\n5) Fourier coefficients of a 1D periodic density (Gaussian atoms, width 0.08a, a = 1)")
N, sig = 4096, 0.08
x = np.arange(N) / N
n = sum(np.exp(-((x - m) ** 2) / (2 * sig ** 2)) for m in (-1, 0, 1)) / (np.sqrt(2 * np.pi) * sig)
for p in range(0, 6):
    n_p = np.mean(n * np.exp(-2j * np.pi * p * x))
    print(f"   p = {p}: n_p = {n_p.real:+.5f}  (analytic exp(-(2 pi p sig)^2/2) = {np.exp(-(2 * np.pi * p * sig) ** 2 / 2):.5f})")
