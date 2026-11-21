/* ============================================================
   Week13Codes.js — Physical Chemistry 2, Week 12
   Raw code samples: Crystal Structure, X-ray Diffraction & Reciprocal Lattice
   - 4 topics: crystal_geometry, reciprocal_lattice,
               structure_factor, powder_xrd
   - 4 languages: Python, MATLAB, Julia, C++
   Imported by Week13App.jsx > RawCodes tab.
   Auto-generated from codes/ — edit the standalone files, then regenerate.
   ============================================================ */

// ── python/wk13_crystal_geometry.py ─────────────────
export const PY_GEOM = `"""
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

print("\\n2) Miller indices from intercepts")
for ic in [(3, 2, 2), (1, 1, 1), (1, None, None), (0.5, 1, None), (2, 3, 6), (1, -1, None)]:
    print(f"   intercepts {str(ic):18s} -> (hkl) = {miller(ic)}")

print("\\n3) Interplanar spacing in a cubic lattice, d = a/sqrt(h2+k2+l2), and 2pi/|G|")
B = 2 * np.pi * np.eye(3)                       # SC reciprocal vectors for a = 1
for hkl in [(1, 0, 0), (1, 1, 0), (1, 1, 1), (2, 0, 0), (2, 1, 0), (2, 1, 1), (2, 2, 0), (3, 1, 1)]:
    G = np.array(hkl) @ B
    d1 = 1 / np.sqrt(sum(h * h for h in hkl))
    print(f"   {str(hkl):10s} d = {d1:.5f} a   2pi/|G| = {2 * np.pi / np.linalg.norm(G):.5f} a")

print("\\n4) Bragg's law example (lecture slide 13)")
lam, twotheta = 154.0, 22.4                     # pm, degrees
d111 = lam / (2 * np.sin(np.radians(twotheta / 2)))
print(f"   d111 = lambda / (2 sin 11.2 deg) = {d111:.1f} pm")
print(f"   a = sqrt(3) d111 = {np.sqrt(3) * d111:.1f} pm")
`;

// ── matlab/wk13_crystal_geometry.m ─────────────────
export const ML_GEOM = `% Week 13 (Physical Chemistry 2) - Crystal geometry of cubic lattices
%   1) cell volumes, nearest neighbours and packing fractions of SC, BCC, FCC
%   2) Miller indices from intercepts
%   3) interplanar spacing d_hkl = a / sqrt(h^2 + k^2 + l^2)
%   4) Bragg's law example: {111} at 2theta = 22.4 deg, lambda = 154 pm
clear; clc;
names = {'SC', 'BCC', 'FCC'};
L = {eye(3), [-1 1 1; 1 -1 1; 1 1 -1] / 2, [0 1 1; 1 0 1; 1 1 0] / 2};
fprintf('1) Cubic lattices (conventional cube edge a = 1)\\n');
for n = 1:3
    A = L{n}; Vp = abs(det(A)); d = [];
    for i = -3:3, for j = -3:3, for k = -3:3
        r = norm(i * A(1, :) + j * A(2, :) + k * A(3, :));
        if r > 1e-9, d(end + 1) = r; end %#ok<AGROW>
    end, end, end
    dnn = min(d); z = sum(abs(d - dnn) < 1e-9);
    pf = 4 / 3 * pi * (dnn / 2)^3 / Vp;
    fprintf('   %-3s: V_prim = %.4f a^3, points per cube = %.0f, z = %2d, d_nn = %.4f a, packing fraction = %.4f\\n', ...
        names{n}, Vp, 1 / Vp, z, dnn, pf);
end

fprintf('\\n2) Miller indices from intercepts (Inf = parallel to that axis)\\n');
IC = [3 2 2; 1 1 1; 1 Inf Inf; 0.5 1 Inf; 2 3 6; 1 -1 Inf];
for r = 1:size(IC, 1)
    rec = 1 ./ IC(r, :);                       % reciprocals, Inf -> 0
    [num, den] = rat(rec);
    l = 1; for q = den, l = lcm(l, q); end
    h = num .* (l ./ den);
    g = 0; for q = abs(h(h ~= 0)), g = gcd(g, q); end
    fprintf('   intercepts (%g, %g, %g) -> (%d %d %d)\\n', IC(r, :), h / g);
end

fprintf('\\n3) Interplanar spacing in a cubic lattice\\n');
H = [1 0 0; 1 1 0; 1 1 1; 2 0 0; 2 1 0; 2 1 1; 2 2 0; 3 1 1];
for r = 1:size(H, 1)
    fprintf('   (%d%d%d)  d = %.5f a\\n', H(r, :), 1 / norm(H(r, :)));
end

fprintf('\\n4) Bragg''s law example (lecture slide 13)\\n');
lam = 154; tth = 22.4;
d111 = lam / (2 * sind(tth / 2));
fprintf('   d111 = %.1f pm, a = sqrt(3) d111 = %.1f pm\\n', d111, sqrt(3) * d111);
`;

// ── julia/wk13_crystal_geometry.jl ─────────────────
export const JL_GEOM = `# Week 13 (Physical Chemistry 2) - Crystal geometry of cubic lattices
#   1) cell volumes, nearest neighbours and packing fractions of SC, BCC, FCC
#   2) Miller indices from intercepts
#   3) interplanar spacing d_hkl = a / sqrt(h^2 + k^2 + l^2)
#   4) Bragg's law example: {111} at 2theta = 22.4 deg, lambda = 154 pm
using LinearAlgebra, Printf

lattices = [("SC", Matrix{Float64}(I, 3, 3)),
            ("BCC", [-1 1 1; 1 -1 1; 1 1 -1] / 2),
            ("FCC", [0 1 1; 1 0 1; 1 1 0] / 2)]
println("1) Cubic lattices (conventional cube edge a = 1)")
for (name, A) in lattices
    Vp = abs(det(A))
    d = [norm(i * A[1, :] + j * A[2, :] + k * A[3, :]) for i in -3:3 for j in -3:3 for k in -3:3]
    d = filter(>(1e-9), d)
    dnn = minimum(d); z = count(x -> abs(x - dnn) < 1e-9, d)
    pf = 4 / 3 * pi * (dnn / 2)^3 / Vp
    @printf("   %-3s: V_prim = %.4f a^3, points per cube = %.0f, z = %2d, d_nn = %.4f a, packing fraction = %.4f\\n",
            name, Vp, 1 / Vp, z, dnn, pf)
end

println("\\n2) Miller indices from intercepts (nothing = parallel to that axis)")
function miller(ic)
    rec = [x === nothing ? 0 // 1 : 1 // rationalize(x) for x in ic]
    l = lcm(denominator.(rec)...)
    h = numerator.(rec .* l)
    g = gcd(filter(!=(0), abs.(h))...)
    return h .÷ g
end
for ic in [(3, 2, 2), (1, 1, 1), (1, nothing, nothing), (0.5, 1, nothing), (2, 3, 6), (1, -1, nothing)]
    println("   intercepts $ic -> $(Tuple(miller(ic)))")
end

println("\\n3) Interplanar spacing in a cubic lattice")
for hkl in [(1,0,0), (1,1,0), (1,1,1), (2,0,0), (2,1,0), (2,1,1), (2,2,0), (3,1,1)]
    @printf("   %s  d = %.5f a\\n", join(hkl), 1 / sqrt(sum(abs2, hkl)))
end

println("\\n4) Bragg's law example (lecture slide 13)")
lam, tth = 154.0, 22.4
d111 = lam / (2 * sind(tth / 2))
@printf("   d111 = %.1f pm, a = sqrt(3) d111 = %.1f pm\\n", d111, sqrt(3) * d111)
`;

// ── cpp/wk13_crystal_geometry.cpp ─────────────────
export const CPP_GEOM = `// Week 13 (Physical Chemistry 2) - Crystal geometry of cubic lattices
//   1) cell volumes, nearest neighbours and packing fractions of SC, BCC, FCC
//   2) Miller indices from intercepts
//   3) interplanar spacing d_hkl = a / sqrt(h^2 + k^2 + l^2)
//   4) Bragg's law example from the lecture: {111} at 2theta = 22.4 deg, lambda = 154 pm
// Build: g++ -O2 -std=c++17 wk13_crystal_geometry.cpp -o geom
#include <cstdio>
#include <cmath>
#include <vector>
#include <numeric>
#include <algorithm>
#include <string>
using V3 = std::array<double, 3>;
#include <array>
static double det3(const double A[3][3]) {
    return A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1])
         - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0])
         + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
}
int main() {
    const double PI = std::acos(-1.0);
    const char* names[3] = {"SC", "BCC", "FCC"};
    const double L[3][3][3] = {
        {{1, 0, 0}, {0, 1, 0}, {0, 0, 1}},
        {{-.5, .5, .5}, {.5, -.5, .5}, {.5, .5, -.5}},
        {{0, .5, .5}, {.5, 0, .5}, {.5, .5, 0}}};
    std::printf("1) Cubic lattices (conventional cube edge a = 1)\\n");
    for (int n = 0; n < 3; ++n) {
        double Vp = std::fabs(det3(L[n]));
        double dnn = 1e9; int z = 0;
        std::vector<double> d;
        for (int i = -3; i <= 3; ++i) for (int j = -3; j <= 3; ++j) for (int k = -3; k <= 3; ++k) {
            double x = i * L[n][0][0] + j * L[n][1][0] + k * L[n][2][0];
            double y = i * L[n][0][1] + j * L[n][1][1] + k * L[n][2][1];
            double w = i * L[n][0][2] + j * L[n][1][2] + k * L[n][2][2];
            double r = std::sqrt(x * x + y * y + w * w);
            if (r > 1e-9) d.push_back(r);
        }
        dnn = *std::min_element(d.begin(), d.end());
        for (double r : d) if (std::fabs(r - dnn) < 1e-9) ++z;
        double rr = dnn / 2, pf = 4.0 / 3.0 * PI * rr * rr * rr / Vp;
        std::printf("   %-3s: V_prim = %.4f a^3, points per cube = %.0f, z = %2d, d_nn = %.4f a, packing fraction = %.4f\\n",
                    names[n], Vp, 1 / Vp, z, dnn, pf);
    }
    std::printf("\\n2) Miller indices from intercepts (0 means parallel to that axis)\\n");
    // intercepts as rationals p/q; reciprocal = q/p; clear denominators
    const int ic[6][3][2] = {{{3,1},{2,1},{2,1}}, {{1,1},{1,1},{1,1}}, {{1,1},{0,1},{0,1}},
                             {{1,2},{1,1},{0,1}}, {{2,1},{3,1},{6,1}}, {{1,1},{-1,1},{0,1}}};
    for (auto& t : ic) {
        long num[3], den[3];
        for (int i = 0; i < 3; ++i) {
            if (t[i][0] == 0) { num[i] = 0; den[i] = 1; }
            else { num[i] = t[i][1]; den[i] = t[i][0]; if (den[i] < 0) { num[i] = -num[i]; den[i] = -den[i]; } }
        }
        long l = 1; for (int i = 0; i < 3; ++i) l = std::lcm(l, den[i]);
        long h[3], g = 0;
        for (int i = 0; i < 3; ++i) { h[i] = num[i] * (l / den[i]); g = std::gcd(g, std::labs(h[i])); }
        for (int i = 0; i < 3; ++i) h[i] /= g;
        std::printf("   intercepts (%g, %g, %g) -> (%ld %ld %ld)\\n",
                    t[0][0] ? double(t[0][0]) / t[0][1] : INFINITY, t[1][0] ? double(t[1][0]) / t[1][1] : INFINITY,
                    t[2][0] ? double(t[2][0]) / t[2][1] : INFINITY, h[0], h[1], h[2]);
    }
    std::printf("\\n3) Interplanar spacing in a cubic lattice\\n");
    const int H[8][3] = {{1,0,0},{1,1,0},{1,1,1},{2,0,0},{2,1,0},{2,1,1},{2,2,0},{3,1,1}};
    for (auto& h : H)
        std::printf("   (%d%d%d)  d = %.5f a\\n", h[0], h[1], h[2], 1 / std::sqrt(double(h[0]*h[0] + h[1]*h[1] + h[2]*h[2])));
    std::printf("\\n4) Bragg's law example (lecture slide 13)\\n");
    double lam = 154.0, tth = 22.4;
    double d111 = lam / (2 * std::sin(tth / 2 * PI / 180));
    std::printf("   d111 = %.1f pm, a = sqrt(3) d111 = %.1f pm\\n", d111, std::sqrt(3.0) * d111);
}
`;

// ── python/wk13_reciprocal_lattice.py ─────────────────
export const PY_RECIP = `"""
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

print("\\n3) First Brillouin zone: volume and number of faces")
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

print("\\n4) 2D Wigner-Seitz cells")
for name, a1, a2 in [("square", np.array([1, 0]), np.array([0, 1])),
                     ("hexagonal", np.array([1, 0]), np.array([0.5, np.sqrt(3) / 2])),
                     ("oblique", np.array([1, 0]), np.array([0.3, 0.8]))]:
    P = ws_cell_2d(a1, a2)
    print(f"   {name:9s}: {len(P)} vertices, WS area = {area(P):.6f}, |a1 x a2| = {abs(a1[0] * a2[1] - a1[1] * a2[0]):.6f}")

print("\\n5) Fourier coefficients of a 1D periodic density (Gaussian atoms, width 0.08a, a = 1)")
N, sig = 4096, 0.08
x = np.arange(N) / N
n = sum(np.exp(-((x - m) ** 2) / (2 * sig ** 2)) for m in (-1, 0, 1)) / (np.sqrt(2 * np.pi) * sig)
for p in range(0, 6):
    n_p = np.mean(n * np.exp(-2j * np.pi * p * x))
    print(f"   p = {p}: n_p = {n_p.real:+.5f}  (analytic exp(-(2 pi p sig)^2/2) = {np.exp(-(2 * np.pi * p * sig) ** 2 / 2):.5f})")
`;

// ── matlab/wk13_reciprocal_lattice.m ─────────────────
export const ML_RECIP = `% Week 13 (Physical Chemistry 2) - Reciprocal lattice and Brillouin zones
%   1) b1 = 2 pi (a2 x a3)/(a1 . a2 x a3), etc.; check b_i . a_j = 2 pi delta_ij
%   2) reciprocal of SC is SC, of BCC is FCC, of FCC is BCC
%   3) BZ volume = (2 pi)^3 / V_cell and number of faces of the first BZ
%   4) 2D Wigner-Seitz cell by half-plane clipping
%   5) Fourier coefficients of a 1D periodic Gaussian density
clear; clc;
names = {'SC', 'BCC', 'FCC'};
L = {eye(3), [-1 1 1; 1 -1 1; 1 1 -1] / 2, [0 1 1; 1 0 1; 1 1 0] / 2};
fprintf('1-3) Reciprocal vectors (units of 2pi/a), BZ volume, faces of the first BZ\\n');
for n = 1:3
    A = L{n}; Vc = dot(A(1, :), cross(A(2, :), A(3, :)));
    B = 2 * pi * [cross(A(2, :), A(3, :)); cross(A(3, :), A(1, :)); cross(A(1, :), A(2, :))] / Vc;
    err = max(max(abs(B * A' / (2 * pi) - eye(3))));
    G = [];
    for i = -2:2, for j = -2:2, for k = -2:2
        g = i * B(1, :) + j * B(2, :) + k * B(3, :);
        if norm(g) > 1e-9, G(end + 1, :) = g; end %#ok<AGROW>
    end, end, end
    faces = 0;
    for p = 1:size(G, 1)
        c = G(p, :) / 2; ok = true;
        for q = 1:size(G, 1)
            if q ~= p && norm(c - G(q, :)) <= norm(c) + 1e-9, ok = false; break; end
        end
        faces = faces + ok;
    end
    fprintf('   %-3s b1 = (%g %g %g), b2 = (%g %g %g), b3 = (%g %g %g); err %.1e; V_BZ V_cell/(2pi)^3 = %.6f; faces = %d\\n', ...
        names{n}, B(1, :) / (2 * pi), B(2, :) / (2 * pi), B(3, :) / (2 * pi), err, ...
        abs(det(B)) * abs(Vc) / (2 * pi)^3, faces);
end

fprintf('\\n4) 2D Wigner-Seitz cells by half-plane clipping\\n');
cases = {'square', [1 0], [0 1]; 'hexagonal', [1 0], [0.5 sqrt(3) / 2]; 'oblique', [1 0], [0.3 0.8]};
for c = 1:3
    a1 = cases{c, 2}; a2 = cases{c, 3};
    P = [-10 -10; 10 -10; 10 10; -10 10];
    for i = -3:3, for j = -3:3
        if i == 0 && j == 0, continue; end
        T = i * a1 + j * a2; cc = dot(T, T) / 2; Q = [];
        for k = 1:size(P, 1)
            p = P(k, :); q = P(mod(k, size(P, 1)) + 1, :);
            fp = dot(p, T) - cc; fq = dot(q, T) - cc;
            if fp <= 0, Q(end + 1, :) = p; end %#ok<AGROW>
            if fp * fq < 0, Q(end + 1, :) = p + (q - p) * fp / (fp - fq); end %#ok<AGROW>
        end
        keep = [true; vecnorm(diff(Q), 2, 2) > 1e-9];
        P = Q(keep, :);
        if size(P, 1) > 1 && norm(P(1, :) - P(end, :)) < 1e-9, P(end, :) = []; end
    end, end
    fprintf('   %-9s: %d vertices, WS area = %.6f, |a1 x a2| = %.6f\\n', cases{c, 1}, size(P, 1), ...
        polyarea(P(:, 1), P(:, 2)), abs(a1(1) * a2(2) - a1(2) * a2(1)));
end

fprintf('\\n5) Fourier coefficients of a 1D Gaussian density (sigma = 0.08 a)\\n');
N = 4096; sig = 0.08; x = (0:N - 1) / N;
n = (exp(-(x + 1).^2 / (2 * sig^2)) + exp(-x.^2 / (2 * sig^2)) + exp(-(x - 1).^2 / (2 * sig^2))) / (sqrt(2 * pi) * sig);
for p = 0:5
    np_ = mean(n .* exp(-2i * pi * p * x));
    fprintf('   p = %d: n_p = %+.5f (analytic %.5f)\\n', p, real(np_), exp(-(2 * pi * p * sig)^2 / 2));
end
`;

// ── julia/wk13_reciprocal_lattice.jl ─────────────────
export const JL_RECIP = `# Week 13 (Physical Chemistry 2) - Reciprocal lattice and Brillouin zones
#   1) b1 = 2 pi (a2 x a3)/(a1 . a2 x a3), etc.; check b_i . a_j = 2 pi delta_ij
#   2) reciprocal of SC is SC, of BCC is FCC, of FCC is BCC
#   3) BZ volume = (2 pi)^3 / V_cell and number of faces of the first BZ
#   4) 2D Wigner-Seitz cell by half-plane clipping
#   5) Fourier coefficients of a 1D periodic Gaussian density
using LinearAlgebra, Printf

function reciprocal(A)
    a1, a2, a3 = A[1, :], A[2, :], A[3, :]
    V = dot(a1, cross(a2, a3))
    return 2pi * vcat(cross(a2, a3)', cross(a3, a1)', cross(a1, a2)') / V
end
lat = [("SC", Matrix{Float64}(I, 3, 3)), ("BCC", [-1 1 1; 1 -1 1; 1 1 -1] / 2), ("FCC", [0 1 1; 1 0 1; 1 1 0] / 2)]
println("1-3) Reciprocal vectors (units of 2pi/a), BZ volume, faces of the first BZ")
for (name, A) in lat
    B = reciprocal(A)
    err = maximum(abs.(B * A' / 2pi - I))
    G = [i * B[1, :] + j * B[2, :] + k * B[3, :] for i in -2:2 for j in -2:2 for k in -2:2]
    G = filter(g -> norm(g) > 1e-9, G)
    faces = count(g -> all(h -> norm(h - g) < 1e-9 || norm(g / 2 - h) > norm(g / 2) + 1e-9, G), G)
    @printf("   %-3s b1 = %s, b2 = %s, b3 = %s; err %.1e; V_BZ V_cell/(2pi)^3 = %.6f; faces = %d\\n",
            name, B[1, :] / 2pi, B[2, :] / 2pi, B[3, :] / 2pi, err, abs(det(B)) * abs(det(A)) / (2pi)^3, faces)
end

function ws_cell_2d(a1, a2; R = 3)
    P = [[-10.0, -10.0], [10.0, -10.0], [10.0, 10.0], [-10.0, 10.0]]
    for i in -R:R, j in -R:R
        (i == 0 && j == 0) && continue
        T = i * a1 + j * a2; c = dot(T, T) / 2
        Q = Vector{Vector{Float64}}()
        for k in eachindex(P)
            p, q = P[k], P[mod1(k + 1, length(P))]
            fp, fq = dot(p, T) - c, dot(q, T) - c
            fp <= 0 && push!(Q, p)
            fp * fq < 0 && push!(Q, p + (q - p) * fp / (fp - fq))
        end
        P = Vector{Vector{Float64}}()
        for q in Q
            (isempty(P) || norm(q - P[end]) > 1e-9) && push!(P, q)
        end
        (length(P) > 1 && norm(P[1] - P[end]) < 1e-9) && pop!(P)
    end
    return P
end
area(P) = abs(sum(P[k][1] * P[mod1(k + 1, length(P))][2] - P[mod1(k + 1, length(P))][1] * P[k][2] for k in eachindex(P))) / 2

println("\\n4) 2D Wigner-Seitz cells by half-plane clipping")
for (name, a1, a2) in [("square", [1.0, 0], [0.0, 1]), ("hexagonal", [1.0, 0], [0.5, sqrt(3) / 2]), ("oblique", [1.0, 0], [0.3, 0.8])]
    P = ws_cell_2d(a1, a2)
    @printf("   %-9s: %d vertices, WS area = %.6f, |a1 x a2| = %.6f\\n", name, length(P), area(P), abs(a1[1] * a2[2] - a1[2] * a2[1]))
end

println("\\n5) Fourier coefficients of a 1D Gaussian density (sigma = 0.08 a)")
N, sig = 4096, 0.08
x = (0:N-1) / N
n = sum(exp.(-(x .- m) .^ 2 / (2sig^2)) for m in -1:1) / (sqrt(2pi) * sig)
for p in 0:5
    np_ = sum(n .* exp.(-2im * pi * p * x)) / N
    @printf("   p = %d: n_p = %+.5f (analytic %.5f)\\n", p, real(np_), exp(-(2pi * p * sig)^2 / 2))
end
`;

// ── cpp/wk13_reciprocal_lattice.cpp ─────────────────
export const CPP_RECIP = `// Week 13 (Physical Chemistry 2) - Reciprocal lattice and Brillouin zones
//   1) b1 = 2 pi (a2 x a3) / (a1 . a2 x a3) etc.; check b_i . a_j = 2 pi delta_ij
//   2) reciprocal of SC is SC, of BCC is FCC, of FCC is BCC
//   3) BZ volume = (2 pi)^3 / V_cell and number of faces of the first BZ
//   4) 2D Wigner-Seitz cell by half-plane clipping
//   5) Fourier coefficients of a 1D periodic Gaussian density
// Build: g++ -O2 -std=c++17 wk13_reciprocal_lattice.cpp -o recip
#include <cstdio>
#include <cmath>
#include <vector>
#include <array>
using V = std::array<double, 3>;
static V cross(V a, V b) { return {a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]}; }
static double dot(V a, V b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
static V sub(V a, V b) { return {a[0]-b[0], a[1]-b[1], a[2]-b[2]}; }
static double nrm(V a) { return std::sqrt(dot(a, a)); }
int main() {
    const double PI = std::acos(-1.0);
    const char* names[3] = {"SC", "BCC", "FCC"};
    std::array<std::array<V, 3>, 3> L = {{
        {{{1,0,0},{0,1,0},{0,0,1}}},
        {{{-.5,.5,.5},{.5,-.5,.5},{.5,.5,-.5}}},
        {{{0,.5,.5},{.5,0,.5},{.5,.5,0}}}}};
    std::printf("1-3) Reciprocal vectors (units of 2pi/a), BZ volume, faces of the first BZ\\n");
    for (int n = 0; n < 3; ++n) {
        auto& A = L[n];
        double Vc = dot(A[0], cross(A[1], A[2]));
        std::array<V, 3> B;
        B[0] = cross(A[1], A[2]); B[1] = cross(A[2], A[0]); B[2] = cross(A[0], A[1]);
        double err = 0;
        for (auto& b : B) for (auto& x : b) x *= 2 * PI / Vc;
        for (int i = 0; i < 3; ++i) for (int j = 0; j < 3; ++j)
            err = std::fmax(err, std::fabs(dot(B[i], A[j]) / (2 * PI) - (i == j)));
        double Vbz = std::fabs(dot(B[0], cross(B[1], B[2])));
        std::vector<V> G;
        for (int i = -2; i <= 2; ++i) for (int j = -2; j <= 2; ++j) for (int k = -2; k <= 2; ++k) {
            V g = {i*B[0][0]+j*B[1][0]+k*B[2][0], i*B[0][1]+j*B[1][1]+k*B[2][1], i*B[0][2]+j*B[1][2]+k*B[2][2]};
            if (nrm(g) > 1e-9) G.push_back(g);
        }
        int faces = 0;
        for (auto& g : G) {
            V c = {g[0]/2, g[1]/2, g[2]/2};
            bool ok = true;
            for (auto& h : G) if (nrm(sub(h, g)) > 1e-9 && nrm(sub(c, h)) <= nrm(c) + 1e-9) { ok = false; break; }
            faces += ok;
        }
        std::printf("   %-3s b1 = (%g %g %g), b2 = (%g %g %g), b3 = (%g %g %g); max err %.1e; "
                    "V_BZ*V_cell/(2pi)^3 = %.6f; faces = %d\\n", names[n],
                    B[0][0]/(2*PI), B[0][1]/(2*PI), B[0][2]/(2*PI), B[1][0]/(2*PI), B[1][1]/(2*PI), B[1][2]/(2*PI),
                    B[2][0]/(2*PI), B[2][1]/(2*PI), B[2][2]/(2*PI), err, Vbz * std::fabs(Vc) / std::pow(2*PI, 3), faces);
    }
    std::printf("\\n4) 2D Wigner-Seitz cells by half-plane clipping\\n");
    struct P { double x, y; };
    auto ws = [](P a1, P a2) {
        std::vector<P> poly = {{-10,-10},{10,-10},{10,10},{-10,10}};
        for (int i = -3; i <= 3; ++i) for (int j = -3; j <= 3; ++j) {
            if (!i && !j) continue;
            P T = {i*a1.x + j*a2.x, i*a1.y + j*a2.y};
            double c = (T.x*T.x + T.y*T.y) / 2;
            std::vector<P> nw;
            for (size_t k = 0; k < poly.size(); ++k) {
                P p = poly[k], q = poly[(k+1) % poly.size()];
                double fp = p.x*T.x + p.y*T.y - c, fq = q.x*T.x + q.y*T.y - c;
                if (fp <= 0) nw.push_back(p);
                if (fp * fq < 0) nw.push_back({p.x + (q.x-p.x)*fp/(fp-fq), p.y + (q.y-p.y)*fp/(fp-fq)});
            }
            poly.clear();
            for (auto& q : nw) if (poly.empty() || std::hypot(q.x-poly.back().x, q.y-poly.back().y) > 1e-9) poly.push_back(q);
            if (poly.size() > 1 && std::hypot(poly[0].x-poly.back().x, poly[0].y-poly.back().y) < 1e-9) poly.pop_back();
        }
        return poly;
    };
    struct Case { const char* n; P a1, a2; };
    Case cs[3] = {{"square", {1,0}, {0,1}}, {"hexagonal", {1,0}, {0.5, std::sqrt(3.0)/2}}, {"oblique", {1,0}, {0.3,0.8}}};
    for (auto& c : cs) {
        auto p = ws(c.a1, c.a2);
        double A = 0;
        for (size_t k = 0; k < p.size(); ++k) { auto& u = p[k]; auto& v = p[(k+1) % p.size()]; A += u.x*v.y - v.x*u.y; }
        std::printf("   %-9s: %zu vertices, WS area = %.6f, |a1 x a2| = %.6f\\n", c.n, p.size(), std::fabs(A)/2,
                    std::fabs(c.a1.x*c.a2.y - c.a1.y*c.a2.x));
    }
    std::printf("\\n5) Fourier coefficients of a 1D Gaussian density (sigma = 0.08 a)\\n");
    const int N = 4096; const double sig = 0.08;
    for (int p = 0; p < 6; ++p) {
        double re = 0;
        for (int i = 0; i < N; ++i) {
            double x = double(i) / N, n = 0;
            for (int m = -1; m <= 1; ++m) n += std::exp(-(x-m)*(x-m) / (2*sig*sig));
            n /= std::sqrt(2*PI) * sig;
            re += n * std::cos(2*PI*p*x);
        }
        std::printf("   p = %d: n_p = %+.5f (analytic %.5f)\\n", p, re / N, std::exp(-std::pow(2*PI*p*sig, 2) / 2));
    }
}
`;

// ── python/wk13_structure_factor.py ─────────────────
export const PY_SF = `"""
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

print("\\n   Allowed reflections (|S| > 1e-6), listed by N = h2+k2+l2:")
for name, b in bases.items():
    Ns = sorted({sum(x * x for x in hkl) for hkl in product(range(0, 6), repeat=3)
                 if any(hkl) and abs(S(b, hkl)) > 1e-6})[:8]
    print(f"   {name:8s}: {Ns}")

print("\\n   KCl (rock salt, f_K = f_Cl = 18): mixed-parity reflections such as (111) vanish")
kcl = [(("K" if s == "Na" else s), xyz) for s, xyz in bases["NaCl"]]
for hkl in [(1, 1, 1), (2, 0, 0), (2, 2, 0), (3, 1, 1), (2, 2, 2)]:
    print(f"   {hkl}: |S_NaCl| = {abs(S(bases['NaCl'], hkl)):5.1f}   |S_KCl| = {abs(S(kcl, hkl)):5.1f}")
`;

// ── matlab/wk13_structure_factor.m ─────────────────
export const ML_SF = `% Week 13 (Physical Chemistry 2) - Structure factor and extinction rules
%   S(hkl) = sum_j f_j exp(-i 2 pi (h x_j + k y_j + l z_j)), I ~ |S|^2
%   ionic form factors at zero angle = number of electrons: Na+ 10, Cl- 18, K+ 18, Cs+ 54
clear; clc;
F = 0.5; Q = 0.25;
fcc = [0 0 0; 0 F F; F 0 F; F F 0];
B.SC      = [1 0 0 0];
B.BCC     = [1 0 0 0; 1 F F F];
B.FCC     = [ones(4, 1) fcc];
B.diamond = [ones(4, 1) fcc; ones(4, 1) fcc + Q];
B.NaCl    = [10 * ones(4, 1) fcc; 18 * ones(4, 1) fcc + [F 0 0]];
B.CsCl    = [54 0 0 0; 18 F F F];
KCl       = [18 * ones(4, 1) fcc; 18 * ones(4, 1) fcc + [F 0 0]];
S = @(b, h) abs(sum(b(:, 1) .* exp(-2i * pi * (b(:, 2:4) * h(:)))));
names = fieldnames(B);
H = [1 0 0; 1 1 0; 1 1 1; 2 0 0; 2 1 0; 2 1 1; 2 2 0; 2 2 1; 3 0 0; 3 1 0; 3 1 1; 2 2 2; 3 2 0; 3 2 1];
fprintf('   hkl   N     SC     BCC     FCC diamond    NaCl    CsCl\\n');
for r = 1:size(H, 1)
    fprintf('   %d%d%d %3d', H(r, :), sum(H(r, :).^2));
    for n = 1:numel(names), fprintf(' %7.2f', S(B.(names{n}), H(r, :))); end
    fprintf('\\n');
end
fprintf('\\n   Allowed N = h2+k2+l2 (first 8):\\n');
for n = 1:numel(names)
    Ns = [];
    for N = 1:40
        ok = false;
        for h = 0:6, for k = 0:6, for l = 0:6
            if h^2 + k^2 + l^2 == N && S(B.(names{n}), [h k l]) > 1e-6, ok = true; end
        end, end, end
        if ok, Ns(end + 1) = N; end %#ok<AGROW>
        if numel(Ns) == 8, break; end
    end
    fprintf('   %-8s: %s\\n', names{n}, num2str(Ns));
end
fprintf('\\n   KCl (f_K = f_Cl = 18) versus NaCl\\n');
for h = [1 1 1; 2 0 0; 2 2 0; 3 1 1; 2 2 2]'
    fprintf('   (%d%d%d): |S_NaCl| = %5.1f  |S_KCl| = %5.1f\\n', h, S(B.NaCl, h), S(KCl, h));
end
`;

// ── julia/wk13_structure_factor.jl ─────────────────
export const JL_SF = `# Week 13 (Physical Chemistry 2) - Structure factor and extinction rules
#   S(hkl) = sum_j f_j exp(-i 2 pi (h x_j + k y_j + l z_j)), I ~ |S|^2
#   ionic form factors at zero angle = number of electrons: Na+ 10, Cl- 18, K+ 18, Cs+ 54
using Printf

const F, Q = 0.5, 0.25
fcc = [(0, 0, 0), (0, F, F), (F, 0, F), (F, F, 0)]
shift(p, d) = (p[1] + d[1], p[2] + d[2], p[3] + d[3])
bases = [
    ("SC",      [(1.0, (0, 0, 0))]),
    ("BCC",     [(1.0, (0, 0, 0)), (1.0, (F, F, F))]),
    ("FCC",     [(1.0, p) for p in fcc]),
    ("diamond", vcat([(1.0, p) for p in fcc], [(1.0, shift(p, (Q, Q, Q))) for p in fcc])),
    ("NaCl",    vcat([(10.0, p) for p in fcc], [(18.0, shift(p, (F, 0, 0))) for p in fcc])),
    ("CsCl",    [(54.0, (0, 0, 0)), (18.0, (F, F, F))]),
]
kcl = vcat([(18.0, p) for p in fcc], [(18.0, shift(p, (F, 0, 0))) for p in fcc])
S(b, h) = abs(sum(f * exp(-2im * pi * (h[1] * x[1] + h[2] * x[2] + h[3] * x[3])) for (f, x) in b))

H = [(1,0,0), (1,1,0), (1,1,1), (2,0,0), (2,1,0), (2,1,1), (2,2,0), (2,2,1), (3,0,0), (3,1,0), (3,1,1), (2,2,2), (3,2,0), (3,2,1)]
println("   hkl   N     SC     BCC     FCC diamond    NaCl    CsCl")
for h in H
    @printf("   %s %3d", join(h), sum(abs2, h))
    for (_, b) in bases
        @printf(" %7.2f", S(b, h))
    end
    println()
end
println("\\n   Allowed N = h2+k2+l2 (first 8):")
for (name, b) in bases
    Ns = Int[]
    for N in 1:40
        any(h -> sum(abs2, h) == N && S(b, h) > 1e-6, ((h, k, l) for h in 0:6 for k in 0:6 for l in 0:6)) && push!(Ns, N)
        length(Ns) == 8 && break
    end
    @printf("   %-8s: %s\\n", name, join(Ns, " "))
end
println("\\n   KCl (f_K = f_Cl = 18) versus NaCl")
for h in [(1,1,1), (2,0,0), (2,2,0), (3,1,1), (2,2,2)]
    @printf("   (%s): |S_NaCl| = %5.1f  |S_KCl| = %5.1f\\n", join(h), S(bases[5][2], h), S(kcl, h))
end
`;

// ── cpp/wk13_structure_factor.cpp ─────────────────
export const CPP_SF = `// Week 13 (Physical Chemistry 2) - Structure factor and extinction rules
//   S(hkl) = sum_j f_j exp(-i 2 pi (h x_j + k y_j + l z_j)), I ~ |S|^2
//   bases in the conventional cubic cell: SC, BCC, FCC, diamond, NaCl, CsCl; and KCl with f_K = f_Cl
//   ionic form factors at zero angle = number of electrons: Na+ 10, Cl- 18, K+ 18, Cs+ 54
// Build: g++ -O2 -std=c++17 wk13_structure_factor.cpp -o sf
#include <cstdio>
#include <cmath>
#include <complex>
#include <vector>
#include <array>
#include <string>
struct Atom { double f; double x, y, z; };
using Basis = std::vector<Atom>;
static double absS(const Basis& b, int h, int k, int l) {
    const double PI = std::acos(-1.0);
    std::complex<double> s = 0;
    for (auto& a : b) s += a.f * std::exp(std::complex<double>(0, -2 * PI * (h * a.x + k * a.y + l * a.z)));
    return std::abs(s);
}
int main() {
    const double F = 0.5, Q = 0.25;
    const double fcc[4][3] = {{0,0,0},{0,F,F},{F,0,F},{F,F,0}};
    Basis sc = {{1,0,0,0}}, bcc = {{1,0,0,0},{1,F,F,F}}, f, dia, nacl, kcl, cscl = {{54,0,0,0},{18,F,F,F}};
    for (auto& p : fcc) {
        f.push_back({1, p[0], p[1], p[2]});
        dia.push_back({1, p[0], p[1], p[2]}); dia.push_back({1, p[0]+Q, p[1]+Q, p[2]+Q});
        nacl.push_back({10, p[0], p[1], p[2]}); nacl.push_back({18, p[0]+F, p[1], p[2]});
        kcl.push_back({18, p[0], p[1], p[2]}); kcl.push_back({18, p[0]+F, p[1], p[2]});
    }
    std::vector<std::pair<std::string, Basis>> all = {{"SC", sc}, {"BCC", bcc}, {"FCC", f}, {"diamond", dia}, {"NaCl", nacl}, {"CsCl", cscl}};
    const int H[14][3] = {{1,0,0},{1,1,0},{1,1,1},{2,0,0},{2,1,0},{2,1,1},{2,2,0},{2,2,1},{3,0,0},{3,1,0},{3,1,1},{2,2,2},{3,2,0},{3,2,1}};
    std::printf("   hkl   N     SC     BCC     FCC diamond    NaCl    CsCl\\n");
    for (auto& h : H) {
        std::printf("   %d%d%d %3d", h[0], h[1], h[2], h[0]*h[0] + h[1]*h[1] + h[2]*h[2]);
        for (auto& b : all) std::printf(" %7.2f", absS(b.second, h[0], h[1], h[2]));
        std::printf("\\n");
    }
    std::printf("\\n   Allowed N = h2+k2+l2 (first 8):\\n");
    for (auto& b : all) {
        std::printf("   %-8s:", b.first.c_str());
        int cnt = 0;
        for (int N = 1; N <= 40 && cnt < 8; ++N) {
            bool ok = false;
            for (int h = 0; h <= 6 && !ok; ++h) for (int k = 0; k <= 6 && !ok; ++k) for (int l = 0; l <= 6 && !ok; ++l)
                if (h*h + k*k + l*l == N && absS(b.second, h, k, l) > 1e-6) ok = true;
            if (ok) { std::printf(" %d", N); ++cnt; }
        }
        std::printf("\\n");
    }
    std::printf("\\n   KCl (f_K = f_Cl = 18) versus NaCl\\n");
    const int K[5][3] = {{1,1,1},{2,0,0},{2,2,0},{3,1,1},{2,2,2}};
    for (auto& h : K)
        std::printf("   (%d%d%d): |S_NaCl| = %5.1f  |S_KCl| = %5.1f\\n", h[0], h[1], h[2],
                    absS(nacl, h[0], h[1], h[2]), absS(kcl, h[0], h[1], h[2]));
}
`;

// ── python/wk13_powder_xrd.py ─────────────────
export const PY_XRD = `"""
Week 13 (Physical Chemistry 2) - Powder X-ray diffraction pattern of cubic crystals
  peak positions: 2 theta from lambda = 2 d sin(theta), d = a / sqrt(h2+k2+l2)
  intensity: |S|^2 x multiplicity x Lorentz-polarization factor (1 + cos^2 2theta)/(sin^2 theta cos theta)
  form factor (teaching model): f(s) = Z exp(-B s^2), s = sin(theta)/lambda, B = 2 A^2 for every atom
  indexing: ratios sin^2(theta_i)/sin^2(theta_1) identify SC / BCC / FCC
  crystallite size: Scherrer equation tau = K lambda / (beta cos theta), K = 0.9
"""
import numpy as np
from itertools import product

LAM = 1.5406                                    # Cu K-alpha1, angstrom
F = 0.5
crystals = {                                    # name: (a in angstrom, basis [(Z, xyz)])
    "Cu (FCC)":   (3.61, [(29, p) for p in [(0, 0, 0), (0, F, F), (F, 0, F), (F, F, 0)]]),
    "a-Fe (BCC)": (2.87, [(26, (0, 0, 0)), (26, (F, F, F))]),
    "Si (diamond)": (5.43, [(14, p) for p in [(0, 0, 0), (0, F, F), (F, 0, F), (F, F, 0)]]
                     + [(14, (p[0] + .25, p[1] + .25, p[2] + .25)) for p in [(0, 0, 0), (0, F, F), (F, 0, F), (F, F, 0)]]),
    "NaCl (rock salt)": (5.63, [(11, p) for p in [(0, 0, 0), (0, F, F), (F, 0, F), (F, F, 0)]]
                         + [(17, (p[0] + F, p[1], p[2])) for p in [(0, 0, 0), (0, F, F), (F, 0, F), (F, F, 0)]]),
}

def pattern(a, basis, B=2.0, tth_max=100):
    peaks = {}
    for hkl in product(range(-6, 7), repeat=3):
        if not any(hkl):
            continue
        N = sum(h * h for h in hkl)
        d = a / np.sqrt(N)
        s = LAM / (2 * d)
        if s >= 1:
            continue
        th = np.arcsin(s)
        if 2 * np.degrees(th) > tth_max:
            continue
        f = lambda Z: Z * np.exp(-B * (s / LAM) ** 2)
        Sg = sum(f(Z) * np.exp(-2j * np.pi * np.dot(hkl, x)) for Z, x in basis)
        if abs(Sg) < 1e-6:
            continue
        key = tuple(sorted(map(abs, hkl), reverse=True))
        lp = (1 + np.cos(2 * th) ** 2) / (np.sin(th) ** 2 * np.cos(th))
        I = abs(Sg) ** 2 * lp
        if key in peaks:
            peaks[key][2] += I          # multiplicity accumulates over equivalent (hkl)
            peaks[key][3] += 1
        else:
            peaks[key] = [2 * np.degrees(th), d, I, 1]
    out = sorted(peaks.items(), key=lambda kv: kv[1][0])
    Imax = max(v[2] for _, v in out)
    return [(k, v[0], v[1], 100 * v[2] / Imax, v[3]) for k, v in out]

for name, (a, basis) in crystals.items():
    print(f"{name}, a = {a} A, Cu K-alpha1 lambda = {LAM} A")
    pk = pattern(a, basis)
    s1 = np.sin(np.radians(pk[0][1] / 2)) ** 2
    for k, tth, d, I, m in pk[:7]:
        r = np.sin(np.radians(tth / 2)) ** 2 / s1
        print(f"   ({''.join(map(str, k))})  2theta = {tth:6.2f} deg  d = {d:.4f} A  mult = {m:2d}  "
              f"I = {I:5.1f}  sin2 ratio = {r:.3f}")
    print()

print("Scherrer crystallite size, Cu (111) peak, K = 0.9")
tth = pattern(*crystals["Cu (FCC)"])[0][1]
for fwhm_deg in (0.1, 0.3, 1.0):
    beta = np.radians(fwhm_deg)
    tau = 0.9 * LAM / (beta * np.cos(np.radians(tth / 2)))
    print(f"   FWHM = {fwhm_deg:.1f} deg -> tau = {tau / 10:.1f} nm")
`;

// ── matlab/wk13_powder_xrd.m ─────────────────
export const ML_XRD = `% Week 13 (Physical Chemistry 2) - Powder XRD pattern of cubic crystals (Cu K-alpha1)
%   2theta from lambda = 2 d sin(theta), d = a / sqrt(h2+k2+l2)
%   I ~ |S|^2 x multiplicity x LP, LP = (1 + cos^2 2theta)/(sin^2 theta cos theta)
%   teaching form factor f = Z exp(-B s^2), s = sin(theta)/lambda, B = 2 A^2
%   Scherrer: tau = K lambda / (beta cos theta), K = 0.9
clear; clc;
LAM = 1.5406; F = 0.5;
fcc = [0 0 0; 0 F F; F 0 F; F F 0];
cr = {'Cu (FCC)', 3.61, [29 * ones(4, 1) fcc];
      'a-Fe (BCC)', 2.87, [26 0 0 0; 26 F F F];
      'Si (diamond)', 5.43, [14 * ones(8, 1) [fcc; fcc + 0.25]];
      'NaCl (rock salt)', 5.63, [11 * ones(4, 1) fcc; 17 * ones(4, 1) fcc + [F 0 0]]};
for c = 1:size(cr, 1)
    a = cr{c, 2}; b = cr{c, 3};
    keys = zeros(0, 3); tth = []; dd = []; I = []; mult = [];
    for h = -6:6, for k = -6:6, for l = -6:6
        if ~any([h k l]), continue; end
        d = a / norm([h k l]); s = LAM / (2 * d);
        if s >= 1, continue; end
        th = asin(s);
        if 2 * th * 180 / pi > 100, continue; end
        Sg = sum(b(:, 1) .* exp(-2 * (s / LAM)^2) .* exp(-2i * pi * (b(:, 2:4) * [h; k; l])));
        if abs(Sg) < 1e-6, continue; end
        key = sort(abs([h k l]), 'descend');
        lp = (1 + cos(2 * th)^2) / (sin(th)^2 * cos(th));
        [tf, idx] = ismember(key, keys, 'rows');
        if tf
            I(idx) = I(idx) + abs(Sg)^2 * lp; mult(idx) = mult(idx) + 1;
        else
            keys(end + 1, :) = key; tth(end + 1) = 2 * th * 180 / pi; dd(end + 1) = d; %#ok<AGROW>
            I(end + 1) = abs(Sg)^2 * lp; mult(end + 1) = 1; %#ok<AGROW>
        end
    end, end, end
    [tth, o] = sort(tth); keys = keys(o, :); dd = dd(o); I = I(o); mult = mult(o);
    if c == 1, tth111 = tth(1); end
    fprintf('%s, a = %.2f A, lambda = %.4f A\\n', cr{c, 1}, a, LAM);
    s1 = sind(tth(1) / 2)^2;
    for p = 1:min(7, numel(tth))
        fprintf('   (%d%d%d)  2theta = %6.2f deg  d = %.4f A  mult = %2d  I = %5.1f  sin2 ratio = %.3f\\n', ...
            keys(p, :), tth(p), dd(p), mult(p), 100 * I(p) / max(I), sind(tth(p) / 2)^2 / s1);
    end
    fprintf('\\n');
end
fprintf('Scherrer crystallite size, Cu (111), K = 0.9\\n');
for w = [0.1 0.3 1.0]
    fprintf('   FWHM = %.1f deg -> tau = %.1f nm\\n', w, 0.9 * LAM / (deg2rad(w) * cosd(tth111 / 2)) / 10);
end
`;

// ── julia/wk13_powder_xrd.jl ─────────────────
export const JL_XRD = `# Week 13 (Physical Chemistry 2) - Powder XRD pattern of cubic crystals (Cu K-alpha1)
#   2theta from lambda = 2 d sin(theta), d = a / sqrt(h2+k2+l2)
#   I ~ |S|^2 x multiplicity x LP, LP = (1 + cos^2 2theta)/(sin^2 theta cos theta)
#   teaching form factor f = Z exp(-B s^2), s = sin(theta)/lambda, B = 2 A^2
#   Scherrer: tau = K lambda / (beta cos theta), K = 0.9
using Printf

const LAM, F = 1.5406, 0.5
fcc = [(0.0, 0.0, 0.0), (0.0, F, F), (F, 0.0, F), (F, F, 0.0)]
sh(p, d) = (p[1] + d[1], p[2] + d[2], p[3] + d[3])
crystals = [
    ("Cu (FCC)", 3.61, [(29.0, p) for p in fcc]),
    ("a-Fe (BCC)", 2.87, [(26.0, (0.0, 0.0, 0.0)), (26.0, (F, F, F))]),
    ("Si (diamond)", 5.43, vcat([(14.0, p) for p in fcc], [(14.0, sh(p, (0.25, 0.25, 0.25))) for p in fcc])),
    ("NaCl (rock salt)", 5.63, vcat([(11.0, p) for p in fcc], [(17.0, sh(p, (F, 0.0, 0.0))) for p in fcc])),
]

function pattern(a, basis; B = 2.0, tmax = 100)
    pk = Dict{NTuple{3,Int}, Vector{Float64}}()   # key => [2theta, d, I, mult]
    for h in -6:6, k in -6:6, l in -6:6
        (h, k, l) == (0, 0, 0) && continue
        d = a / sqrt(h^2 + k^2 + l^2); s = LAM / (2d)
        s >= 1 && continue
        th = asin(s)
        rad2deg(2th) > tmax && continue
        Sg = sum(Z * exp(-B * (s / LAM)^2) * exp(-2im * pi * (h * x[1] + k * x[2] + l * x[3])) for (Z, x) in basis)
        abs(Sg) < 1e-6 && continue
        key = Tuple(sort(abs.([h, k, l]), rev = true))
        lp = (1 + cos(2th)^2) / (sin(th)^2 * cos(th))
        if haskey(pk, key)
            pk[key][3] += abs2(Sg) * lp; pk[key][4] += 1
        else
            pk[key] = [rad2deg(2th), d, abs2(Sg) * lp, 1.0]
        end
    end
    return sort(collect(pk), by = kv -> kv[2][1])
end

tth111 = 0.0
for (name, a, basis) in crystals
    global tth111
    pk = pattern(a, basis)
    Imax = maximum(v[3] for (_, v) in pk)
    s1 = sind(pk[1][2][1] / 2)^2
    name == "Cu (FCC)" && (tth111 = pk[1][2][1])
    @printf("%s, a = %.2f A, lambda = %.4f A\\n", name, a, LAM)
    for (k, v) in pk[1:min(7, end)]
        @printf("   (%s)  2theta = %6.2f deg  d = %.4f A  mult = %2d  I = %5.1f  sin2 ratio = %.3f\\n",
                join(k), v[1], v[2], Int(v[4]), 100v[3] / Imax, sind(v[1] / 2)^2 / s1)
    end
    println()
end
println("Scherrer crystallite size, Cu (111), K = 0.9")
for w in (0.1, 0.3, 1.0)
    @printf("   FWHM = %.1f deg -> tau = %.1f nm\\n", w, 0.9 * LAM / (deg2rad(w) * cosd(tth111 / 2)) / 10)
end
`;

// ── cpp/wk13_powder_xrd.cpp ─────────────────
export const CPP_XRD = `// Week 13 (Physical Chemistry 2) - Powder XRD pattern of cubic crystals (Cu K-alpha1)
//   2theta from lambda = 2 d sin(theta), d = a / sqrt(h2+k2+l2)
//   I ~ |S|^2 x multiplicity x LP, LP = (1 + cos^2 2theta)/(sin^2 theta cos theta)
//   teaching form factor f = Z exp(-B s^2), s = sin(theta)/lambda, B = 2 A^2
//   Scherrer: tau = K lambda / (beta cos theta), K = 0.9
// Build: g++ -O2 -std=c++17 wk13_powder_xrd.cpp -o xrd
#include <cstdio>
#include <cmath>
#include <complex>
#include <vector>
#include <map>
#include <array>
#include <algorithm>
#include <string>
struct Atom { double Z, x, y, z; };
struct Peak { double tth, d, I; int mult; };
const double PI = std::acos(-1.0), LAM = 1.5406;
std::map<std::array<int,3>, Peak> pattern(double a, const std::vector<Atom>& basis, double B = 2.0, double tmax = 100) {
    std::map<std::array<int,3>, Peak> pk;
    for (int h = -6; h <= 6; ++h) for (int k = -6; k <= 6; ++k) for (int l = -6; l <= 6; ++l) {
        if (!h && !k && !l) continue;
        double d = a / std::sqrt(double(h*h + k*k + l*l)), s = LAM / (2 * d);
        if (s >= 1) continue;
        double th = std::asin(s);
        if (2 * th * 180 / PI > tmax) continue;
        std::complex<double> S = 0;
        for (auto& at : basis)
            S += at.Z * std::exp(-B * std::pow(s / LAM, 2)) * std::exp(std::complex<double>(0, -2*PI*(h*at.x + k*at.y + l*at.z)));
        if (std::abs(S) < 1e-6) continue;
        std::array<int,3> key = {std::abs(h), std::abs(k), std::abs(l)};
        std::sort(key.begin(), key.end(), std::greater<int>());
        double lp = (1 + std::pow(std::cos(2*th), 2)) / (std::pow(std::sin(th), 2) * std::cos(th));
        auto it = pk.find(key);
        if (it == pk.end()) pk[key] = {2 * th * 180 / PI, d, std::norm(S) * lp, 1};
        else { it->second.I += std::norm(S) * lp; it->second.mult += 1; }
    }
    return pk;
}
int main() {
    const double F = 0.5;
    const double fcc[4][3] = {{0,0,0},{0,F,F},{F,0,F},{F,F,0}};
    std::vector<Atom> cu, fe = {{26,0,0,0},{26,F,F,F}}, si, nacl;
    for (auto& p : fcc) {
        cu.push_back({29, p[0], p[1], p[2]});
        si.push_back({14, p[0], p[1], p[2]}); si.push_back({14, p[0]+.25, p[1]+.25, p[2]+.25});
        nacl.push_back({11, p[0], p[1], p[2]}); nacl.push_back({17, p[0]+F, p[1], p[2]});
    }
    struct Cr { std::string n; double a; std::vector<Atom> b; };
    std::vector<Cr> cr = {{"Cu (FCC)", 3.61, cu}, {"a-Fe (BCC)", 2.87, fe}, {"Si (diamond)", 5.43, si}, {"NaCl (rock salt)", 5.63, nacl}};
    double tth111 = 0;
    for (auto& c : cr) {
        auto pk = pattern(c.a, c.b);
        std::vector<std::pair<std::array<int,3>, Peak>> v(pk.begin(), pk.end());
        std::sort(v.begin(), v.end(), [](auto& x, auto& y) { return x.second.tth < y.second.tth; });
        double Imax = 0; for (auto& p : v) Imax = std::max(Imax, p.second.I);
        double s1 = std::pow(std::sin(v[0].second.tth / 2 * PI / 180), 2);
        if (c.n == "Cu (FCC)") tth111 = v[0].second.tth;
        std::printf("%s, a = %.2f A, lambda = %.4f A\\n", c.n.c_str(), c.a, LAM);
        for (size_t i = 0; i < v.size() && i < 7; ++i) {
            auto& p = v[i];
            std::printf("   (%d%d%d)  2theta = %6.2f deg  d = %.4f A  mult = %2d  I = %5.1f  sin2 ratio = %.3f\\n",
                        p.first[0], p.first[1], p.first[2], p.second.tth, p.second.d, p.second.mult,
                        100 * p.second.I / Imax, std::pow(std::sin(p.second.tth / 2 * PI / 180), 2) / s1);
        }
        std::printf("\\n");
    }
    std::printf("Scherrer crystallite size, Cu (111), K = 0.9\\n");
    for (double w : {0.1, 0.3, 1.0})
        std::printf("   FWHM = %.1f deg -> tau = %.1f nm\\n", w, 0.9 * LAM / (w * PI / 180 * std::cos(tth111 / 2 * PI / 180)) / 10);
}
`;
