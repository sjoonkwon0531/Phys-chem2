/* ============================================================
   Week14Codes.js — Physical Chemistry 2, Week 14
   Raw code samples: Bonding in Solids, Adsorption & Surface Catalysis
   - 4 topics: solid_bonding, huckel_bands, isotherms, surface_kinetics
   - 4 languages: Python, MATLAB, Julia, C++
   Imported by Week14App.jsx > RawCodes tab.
   Auto-generated from codes/ — edit the standalone files, then regenerate.
   ============================================================ */

// ── python/wk14_solid_bonding.py ─────────────────
export const PY_BOND = `"""
Week 14 (Physical Chemistry 2) - Bonding in solids
  1) packing fractions of hard-sphere structures (SC, BCC, FCC/HCP, diamond)
  2) Madelung constants: Evjen neutral-cube sum (NaCl) and Ewald sums (NaCl, CsCl, ZnS)
  3) Born-Mayer lattice energies of alkali halides (d* = 34.5 pm)
  4) bulk modulus of NaCl from the curvature of U(r) = -A e^2/(4 pi eps0 r) + B exp(-r/rho)
"""
import numpy as np
from scipy.special import erfc

# ---------- 1) packing fractions ----------
print("1) Packing fractions of touching hard spheres")
pf = {
    "SC      (2r = a)":         np.pi / 6,
    "BCC     (4r = sqrt3 a)":   np.sqrt(3) * np.pi / 8,
    "FCC/HCP (4r = sqrt2 a)":   np.sqrt(2) * np.pi / 6,
    "diamond (8r = sqrt3 a)":   np.sqrt(3) * np.pi / 16,
}
for k, v in pf.items():
    print(f"   {k:26s} phi = {v:.5f}")
print("   random close packing (experiment) ~ 0.64")

# ---------- 2) Madelung constants by Evjen sums ----------
def weight(coords, n):
    """Evjen weight: 1/2 per coordinate lying on the cube face |x| = n."""
    w = 1.0
    for c in coords:
        if abs(abs(c) - n) < 1e-9:
            w *= 0.5
    return w

def madelung_nacl(n):
    s = 0.0
    r = np.arange(-n, n + 1)
    X, Y, Z = np.meshgrid(r, r, r, indexing="ij")
    X, Y, Z = X.ravel(), Y.ravel(), Z.ravel()
    for x, y, z in zip(X, Y, Z):
        if x == 0 and y == 0 and z == 0:
            continue
        q = (-1) ** int(abs(x) + abs(y) + abs(z))       # ion at origin is +
        s += -q * weight((x, y, z), n) / np.sqrt(x * x + y * y + z * z)
    return s  # in units of the nearest-neighbour distance (=1)

def ewald_madelung(basis, q, rnn, eta=3.0, R=4, Gm=6):
    """Madelung constant of the ion basis[0] in a cubic cell of edge 1 (Ewald sum)."""
    basis = np.array(basis, float); q = np.array(q, float)
    r0 = basis[0]; phi = 0.0
    shifts = np.array([[i, j, k] for i in range(-R, R + 1) for j in range(-R, R + 1) for k in range(-R, R + 1)])
    for b, qj in zip(basis, q):                      # real-space part
        d = np.linalg.norm(b + shifts - r0, axis=1)
        d = d[d > 1e-12]
        phi += qj * np.sum(erfc(eta * d) / d)
    for i in range(-Gm, Gm + 1):                     # reciprocal-space part
        for j in range(-Gm, Gm + 1):
            for k in range(-Gm, Gm + 1):
                if i == 0 and j == 0 and k == 0:
                    continue
                G = 2 * np.pi * np.array([i, j, k]); G2 = G @ G
                S = np.sum(q * np.cos((basis - r0) @ G))
                phi += 4 * np.pi * np.exp(-G2 / (4 * eta**2)) / G2 * S
    phi -= 2 * eta * q[0] / np.sqrt(np.pi)           # self term
    return -phi * rnn / q[0]

print("\\n2) Madelung constants")
print("   (a) Evjen neutral cubes for NaCl (n = half edge, nearest-neighbour distance = 1)")
for n in (1, 2, 4, 8, 12):
    print(f"       n = {n:2d}:  A = {madelung_nacl(n):.6f}")
fcc = [(0, 0, 0), (.5, .5, 0), (.5, 0, .5), (0, .5, .5)]
nacl = fcc + [(x + .5, y, z) for x, y, z in fcc]
zb = fcc + [(x + .25, y + .25, z + .25) for x, y, z in fcc]
q8 = [1, 1, 1, 1, -1, -1, -1, -1]
print("   (b) Ewald sums (cube edge a = 1, A referred to the nearest-neighbour distance)")
for name, bas, qq, rnn in [("NaCl (rock salt)", nacl, q8, 0.5),
                           ("CsCl", [(0, 0, 0), (.5, .5, .5)], [1, -1], np.sqrt(3) / 2),
                           ("ZnS (zinc blende)", zb, q8, np.sqrt(3) / 4)]:
    print(f"       {name:18s} A = {ewald_madelung(bas, qq, rnn):.6f}")
print("   reference: NaCl 1.747565, CsCl 1.762675, zinc blende 1.638055")

# ---------- 3) Born-Mayer lattice energies ----------
NA, e, eps0 = 6.02214076e23, 1.602176634e-19, 8.8541878128e-12
kcoul = NA * e**2 / (4 * np.pi * eps0) * 1e-3 * 1e12   # kJ mol^-1 pm
dstar = 34.5
print("\\n3) Born-Mayer lattice energy  U = N_A A e^2/(4 pi eps0 d) (1 - d*/d)")
# d = nearest-neighbour distance from the lattice constant; Born-Haber values (CRC Handbook)
salts = [("NaF", 1.747565, 231.5, 923), ("NaCl", 1.747565, 282.0, 787),
         ("KCl", 1.747565, 314.5, 715), ("CsCl", 1.762675, 356.8, 659)]
for name, A, d, exp in salts:
    U = kcoul * A / d * (1 - dstar / d)
    print(f"   {name:5s} d = {d:.1f} pm   U = {U:6.0f} kJ/mol   Born-Haber {exp} kJ/mol   ratio {U/exp:.3f}")

# ---------- 4) bulk modulus of NaCl ----------
A, r0, rho = 1.747565, 2.82e-10, 0.345e-10
ke2 = e**2 / (4 * np.pi * eps0)
U2 = A * ke2 / r0**3 * (r0 / rho - 2)          # d2U/dr2 at r0 per ion pair, J/m^2
V0 = 2 * r0**3                                 # volume per ion pair (a^3/4, a = 2 r0)
K = U2 / (18 * r0)                             # K = V d2U/dV2 with dV/dr = 6 r^2
print("\\n4) Bulk modulus of NaCl")
print(f"   U''(r0) = {U2:.1f} N/m,  V0 = {V0*1e30:.2f} A^3 per ion pair")
print(f"   K = A e^2 (r0/rho - 2)/(72 pi eps0 r0^4) = {K/1e9:.1f} GPa   (experiment ~ 24 GPa)")
`;

// ── matlab/wk14_solid_bonding.m ─────────────────
export const ML_BOND = `% Week 14 (Physical Chemistry 2) - Bonding in solids
%   1) packing fractions  2) Madelung constants (Evjen NaCl, Ewald NaCl/CsCl/ZnS)
%   3) Born-Mayer lattice energies  4) bulk modulus of NaCl
function wk14_solid_bonding()
fprintf('1) Packing fractions\\n');
fprintf('   SC %.5f  BCC %.5f  FCC/HCP %.5f  diamond %.5f\\n', pi/6, sqrt(3)*pi/8, sqrt(2)*pi/6, sqrt(3)*pi/16);

fprintf('\\n2) Madelung constants\\n   Evjen NaCl:');
for n = [1 2 4 8 12]
    fprintf('  n=%d %.6f', n, evjen_nacl(n));
end
fcc = [0 0 0; .5 .5 0; .5 0 .5; 0 .5 .5];
nacl = [fcc; fcc + [.5 0 0]];
zb   = [fcc; fcc + [.25 .25 .25]];
q8 = [1 1 1 1 -1 -1 -1 -1];
fprintf('\\n   Ewald: NaCl %.6f  CsCl %.6f  ZnS %.6f\\n', ewald(nacl, q8, 0.5), ...
        ewald([0 0 0; .5 .5 .5], [1 -1], sqrt(3)/2), ewald(zb, q8, sqrt(3)/4));

NA = 6.02214076e23; e = 1.602176634e-19; eps0 = 8.8541878128e-12;
kc = NA*e^2/(4*pi*eps0)*1e-3*1e12; dstar = 34.5;
names = {'NaF','NaCl','KCl','CsCl'};
A = [1.747565 1.747565 1.747565 1.762675];
d = [231.5 282.0 314.5 356.8];  BH = [923 787 715 659];
fprintf('\\n3) Born-Mayer lattice energies (d* = 34.5 pm)\\n');
for i = 1:4
    U = kc*A(i)/d(i)*(1 - dstar/d(i));
    fprintf('   %-5s d = %.1f pm  U = %.0f kJ/mol  Born-Haber %d  ratio %.3f\\n', names{i}, d(i), U, BH(i), U/BH(i));
end
r0 = 2.82e-10; rho = 0.345e-10; ke2 = e^2/(4*pi*eps0);
U2 = 1.747565*ke2/r0^3*(r0/rho - 2);  K = U2/(18*r0);
fprintf('\\n4) NaCl: U''''(r0) = %.1f N/m, K = %.1f GPa (experiment ~ 24 GPa)\\n', U2, K/1e9);
end

function s = evjen_nacl(n)
s = 0;
for x = -n:n, for y = -n:n, for z = -n:n
    if x == 0 && y == 0 && z == 0, continue; end
    w = 1; for c = [x y z], if abs(abs(c) - n) < 1e-9, w = w/2; end, end
    q = (-1)^(abs(x) + abs(y) + abs(z));
    s = s - q*w/sqrt(x^2 + y^2 + z^2);
end, end, end
end

function A = ewald(b, q, rnn)
eta = 3; R = 4; Gm = 6; r0 = b(1,:); phi = 0;
[I1, I2, I3] = ndgrid(-R:R); sh = [I1(:) I2(:) I3(:)];
for j = 1:size(b,1)
    d = sqrt(sum((b(j,:) + sh - r0).^2, 2)); d = d(d > 1e-12);
    phi = phi + q(j)*sum(erfc(eta*d)./d);
end
for i1 = -Gm:Gm, for i2 = -Gm:Gm, for i3 = -Gm:Gm
    if i1 == 0 && i2 == 0 && i3 == 0, continue; end
    G = 2*pi*[i1 i2 i3]; G2 = G*G';
    S = sum(q(:).*cos((b - r0)*G'));
    phi = phi + 4*pi*exp(-G2/(4*eta^2))/G2*S;
end, end, end
phi = phi - 2*eta*q(1)/sqrt(pi);
A = -phi*rnn/q(1);
end
`;

// ── julia/wk14_solid_bonding.jl ─────────────────
export const JL_BOND = `# Week 14 (Physical Chemistry 2) - Bonding in solids
#   1) packing fractions  2) Madelung constants (Evjen NaCl, Ewald NaCl/CsCl/ZnS)
#   3) Born-Mayer lattice energies  4) bulk modulus of NaCl
using Printf, SpecialFunctions, LinearAlgebra

println("1) Packing fractions")
@printf("   SC %.5f  BCC %.5f  FCC/HCP %.5f  diamond %.5f\\n", π/6, √3*π/8, √2*π/6, √3*π/16)

function evjen_nacl(n)
    s = 0.0
    for x in -n:n, y in -n:n, z in -n:n
        (x == 0 && y == 0 && z == 0) && continue
        w = 1.0
        for c in (x, y, z); abs(abs(c) - n) < 1e-9 && (w /= 2); end
        q = iseven(abs(x) + abs(y) + abs(z)) ? 1 : -1
        s -= q * w / sqrt(x^2 + y^2 + z^2)
    end
    s
end

function ewald(b, q, rnn; eta = 3.0, R = 4, Gm = 6)
    r0 = b[1]; phi = 0.0
    for (bj, qj) in zip(b, q), i in -R:R, j in -R:R, k in -R:R
        r = norm(bj .+ (i, j, k) .- r0)
        r < 1e-12 && continue
        phi += qj * erfc(eta * r) / r
    end
    for i in -Gm:Gm, j in -Gm:Gm, k in -Gm:Gm
        (i == 0 && j == 0 && k == 0) && continue
        G = 2π .* (i, j, k); G2 = sum(G .^ 2)
        S = sum(qj * cos(sum(G .* (bj .- r0))) for (bj, qj) in zip(b, q))
        phi += 4π * exp(-G2 / (4eta^2)) / G2 * S
    end
    phi -= 2eta * q[1] / sqrt(π)
    -phi * rnn / q[1]
end

println("\\n2) Madelung constants")
print("   Evjen NaCl:")
for n in (1, 2, 4, 8, 12); @printf("  n=%d %.6f", n, evjen_nacl(n)); end
fcc = [(0.0, 0.0, 0.0), (0.5, 0.5, 0.0), (0.5, 0.0, 0.5), (0.0, 0.5, 0.5)]
nacl = vcat(fcc, [p .+ (0.5, 0.0, 0.0) for p in fcc])
zb = vcat(fcc, [p .+ (0.25, 0.25, 0.25) for p in fcc])
q8 = [1, 1, 1, 1, -1, -1, -1, -1]
@printf("\\n   Ewald: NaCl %.6f  CsCl %.6f  ZnS %.6f\\n", ewald(nacl, q8, 0.5),
        ewald([(0.0, 0.0, 0.0), (0.5, 0.5, 0.5)], [1, -1], √3/2), ewald(zb, q8, √3/4))

NA, e, eps0 = 6.02214076e23, 1.602176634e-19, 8.8541878128e-12
kc = NA * e^2 / (4π * eps0) * 1e-3 * 1e12; dstar = 34.5
println("\\n3) Born-Mayer lattice energies (d* = 34.5 pm)")
for (name, A, d, bh) in (("NaF", 1.747565, 231.5, 923), ("NaCl", 1.747565, 282.0, 787),
                         ("KCl", 1.747565, 314.5, 715), ("CsCl", 1.762675, 356.8, 659))
    U = kc * A / d * (1 - dstar / d)
    @printf("   %-5s d = %.1f pm  U = %.0f kJ/mol  Born-Haber %d  ratio %.3f\\n", name, d, U, bh, U / bh)
end
r0, rho = 2.82e-10, 0.345e-10
ke2 = e^2 / (4π * eps0)
U2 = 1.747565 * ke2 / r0^3 * (r0 / rho - 2); K = U2 / (18r0)
@printf("\\n4) NaCl: U''(r0) = %.1f N/m, K = %.1f GPa (experiment ~ 24 GPa)\\n", U2, K / 1e9)
`;

// ── cpp/wk14_solid_bonding.cpp ─────────────────
export const CPP_BOND = `// Week 14 (Physical Chemistry 2) - Bonding in solids
//   1) packing fractions  2) Madelung constants (Evjen for NaCl, Ewald for NaCl/CsCl/ZnS)
//   3) Born-Mayer lattice energies  4) bulk modulus of NaCl
// build: g++ -O2 -std=c++17 wk14_solid_bonding.cpp -o solid && ./solid
#include <cstdio>
#include <cmath>
#include <vector>
#include <array>
using V3 = std::array<double, 3>;
const double PI = 3.14159265358979323846;

double weight(double x, double y, double z, int n) {
    double w = 1.0;
    for (double c : {x, y, z}) if (std::fabs(std::fabs(c) - n) < 1e-9) w *= 0.5;
    return w;
}
double madelungNaClEvjen(int n) {
    double s = 0;
    for (int x = -n; x <= n; ++x) for (int y = -n; y <= n; ++y) for (int z = -n; z <= n; ++z) {
        if (!x && !y && !z) continue;
        int q = ((std::abs(x) + std::abs(y) + std::abs(z)) % 2) ? -1 : 1;
        s += -q * weight(x, y, z, n) / std::sqrt(double(x * x + y * y + z * z));
    }
    return s;
}
double ewald(const std::vector<V3>& b, const std::vector<double>& q, double rnn,
             double eta = 3.0, int R = 4, int Gm = 6) {
    double phi = 0; V3 r0 = b[0];
    for (size_t j = 0; j < b.size(); ++j)
        for (int i1 = -R; i1 <= R; ++i1) for (int i2 = -R; i2 <= R; ++i2) for (int i3 = -R; i3 <= R; ++i3) {
            double dx = b[j][0] + i1 - r0[0], dy = b[j][1] + i2 - r0[1], dz = b[j][2] + i3 - r0[2];
            double r = std::sqrt(dx * dx + dy * dy + dz * dz);
            if (r < 1e-12) continue;
            phi += q[j] * std::erfc(eta * r) / r;
        }
    for (int i1 = -Gm; i1 <= Gm; ++i1) for (int i2 = -Gm; i2 <= Gm; ++i2) for (int i3 = -Gm; i3 <= Gm; ++i3) {
        if (!i1 && !i2 && !i3) continue;
        double G[3] = {2 * PI * i1, 2 * PI * i2, 2 * PI * i3};
        double G2 = G[0] * G[0] + G[1] * G[1] + G[2] * G[2], S = 0;
        for (size_t j = 0; j < b.size(); ++j)
            S += q[j] * std::cos(G[0] * (b[j][0] - r0[0]) + G[1] * (b[j][1] - r0[1]) + G[2] * (b[j][2] - r0[2]));
        phi += 4 * PI * std::exp(-G2 / (4 * eta * eta)) / G2 * S;
    }
    phi -= 2 * eta * q[0] / std::sqrt(PI);
    return -phi * rnn / q[0];
}
int main() {
    std::printf("1) Packing fractions\\n");
    std::printf("   SC %.5f  BCC %.5f  FCC/HCP %.5f  diamond %.5f\\n",
                PI / 6, std::sqrt(3.0) * PI / 8, std::sqrt(2.0) * PI / 6, std::sqrt(3.0) * PI / 16);
    std::printf("\\n2) Madelung constants\\n   Evjen NaCl:");
    for (int n : {1, 2, 4, 8, 12}) std::printf("  n=%d %.6f", n, madelungNaClEvjen(n));
    std::vector<V3> fcc = {{0, 0, 0}, {.5, .5, 0}, {.5, 0, .5}, {0, .5, .5}}, nacl = fcc, zb = fcc;
    for (auto p : fcc) { nacl.push_back({p[0] + .5, p[1], p[2]}); zb.push_back({p[0] + .25, p[1] + .25, p[2] + .25}); }
    std::vector<double> q8 = {1, 1, 1, 1, -1, -1, -1, -1};
    std::printf("\\n   Ewald: NaCl %.6f  CsCl %.6f  ZnS %.6f\\n", ewald(nacl, q8, 0.5),
                ewald({{0, 0, 0}, {.5, .5, .5}}, {1, -1}, std::sqrt(3.0) / 2), ewald(zb, q8, std::sqrt(3.0) / 4));
    const double NA = 6.02214076e23, e = 1.602176634e-19, eps0 = 8.8541878128e-12;
    double kc = NA * e * e / (4 * PI * eps0) * 1e-3 * 1e12, dstar = 34.5;   // kJ/mol * pm
    struct S { const char* n; double A, d, exp; } salts[] = {
        {"NaF", 1.747565, 231.5, 923}, {"NaCl", 1.747565, 282.0, 787},
        {"KCl", 1.747565, 314.5, 715}, {"CsCl", 1.762675, 356.8, 659}};
    std::printf("\\n3) Born-Mayer lattice energies (d* = 34.5 pm)\\n");
    for (auto& s : salts) {
        double U = kc * s.A / s.d * (1 - dstar / s.d);
        std::printf("   %-5s d = %.1f pm  U = %.0f kJ/mol  Born-Haber %.0f  ratio %.3f\\n", s.n, s.d, U, s.exp, U / s.exp);
    }
    double A = 1.747565, r0 = 2.82e-10, rho = 0.345e-10, ke2 = e * e / (4 * PI * eps0);
    double U2 = A * ke2 / std::pow(r0, 3) * (r0 / rho - 2), K = U2 / (18 * r0);
    std::printf("\\n4) NaCl: U''(r0) = %.1f N/m, K = %.1f GPa (experiment ~ 24 GPa)\\n", U2, K / 1e9);
}
`;

// ── python/wk14_huckel_bands.py ─────────────────
export const PY_HUCKEL = `"""
Week 14 (Physical Chemistry 2) - From Hueckel molecular orbitals to bands
  1) H = alpha I + beta A (A = adjacency matrix): linear chain and ring of N atoms
  2) analytic levels E_k = alpha + 2 beta cos(k pi/(N+1)) checked against numerical diagonalisation
  3) butadiene, hexatriene and benzene: pi energies, HOMO-LUMO gap, delocalisation energy
  4) band formation: total width -> 4|beta| and gap -> 0 as N grows
  5) Fermi-Dirac occupation and intrinsic carriers of Si: n_i = sqrt(Nc Nv) exp(-Eg/2kT)
"""
import numpy as np

def chain(N, ring=False):
    A = np.zeros((N, N))
    for i in range(N - 1):
        A[i, i + 1] = A[i + 1, i] = 1
    if ring and N > 2:
        A[0, N - 1] = A[N - 1, 0] = 1
    return A

# energies in units with alpha = 0, beta = -1 (beta < 0), so E = -lambda
alpha, beta = 0.0, -1.0
print("1-2) Linear chain: numerical eigenvalues of beta*A vs 2 beta cos(k pi/(N+1))")
for N in (2, 4, 6):
    num = np.sort(alpha + beta * np.linalg.eigvalsh(chain(N)))
    ana = np.sort([alpha + 2 * beta * np.cos(k * np.pi / (N + 1)) for k in range(1, N + 1)])
    print(f"   N = {N}: {np.round(num, 4)}  max |diff| = {np.max(np.abs(num - ana)):.1e}")

print("\\n3) pi systems (energies in units of |beta|, measured from alpha; negative = bonding)")
def pi_summary(name, A, nel):
    E = np.sort(alpha + beta * np.linalg.eigvalsh(A))
    occ = np.zeros_like(E); left = nel
    for i in range(len(E)):
        occ[i] = min(2, left); left -= occ[i]
    Etot = np.sum(occ * E)
    homo = E[nel // 2 - 1]; lumo = E[nel // 2]
    Eloc = nel / 2 * 2 * beta        # isolated ethene pi bonds: alpha + beta each electron
    print(f"   {name:11s} levels {np.round(E, 3)}")
    print(f"   {'':11s} E_pi = {nel} alpha + {Etot / beta:.3f} beta,  HOMO-LUMO gap = {lumo - homo:.3f}|beta|,"
          f"  extra stabilisation vs isolated C=C = {(Etot - Eloc) / beta:.3f}|beta|")
pi_summary("butadiene", chain(4), 4)
pi_summary("hexatriene", chain(6), 6)
pi_summary("benzene", chain(6, ring=True), 6)
print("   with |beta| ~ 75 kJ/mol the benzene delocalisation is ~150 kJ/mol")

print("\\n4) Band formation in a chain of N atoms (half filled, one electron per atom)")
for N in (2, 5, 10, 20, 50, 100, 1000):
    k = np.arange(1, N + 1)
    E = np.sort(2 * beta * np.cos(k * np.pi / (N + 1)))
    gap = E[N // 2] - E[N // 2 - 1] if N % 2 == 0 else E[N // 2 + 1] - E[N // 2]
    print(f"   N = {N:5d}: width = {E[-1] - E[0]:.4f}|beta|   level spacing at band centre = {gap:.4f}|beta|")
print("   limit: width 4|beta|, spacing ~ 2 pi |beta|/N -> 0 (a continuous band)")

print("\\n   density of states of the infinite chain g(E) = 1/(pi sqrt(4 beta^2 - E^2)) per atom")
N = 100000
E = 2 * beta * np.cos(np.arange(1, N + 1) * np.pi / (N + 1))
frac = np.mean(np.abs(E) < 1.0)
print(f"   fraction of levels with |E| < |beta|: counted {frac:.4f}, analytic (2/pi) asin(1/2) = {2 / np.pi * np.arcsin(0.5):.4f}")
print("   (g piles up at the band edges E = +-2|beta|: van Hove singularities)")

print("\\n5) Fermi-Dirac statistics and intrinsic Si")
kB = 8.617333e-5     # eV/K
for T in (10, 300, 1000):
    f = lambda dE: 0.5 * (1 - np.tanh(dE / (2 * kB * T)))     # = 1/(exp(dE/kT) + 1), overflow-safe
    print(f"   T = {T:6.0f} K: f(E_F + 0.1 eV) = {f(0.1):.3e},  f(E_F - 0.1 eV) = {f(-0.1):.6f}")
Nc, Nv, Eg = 2.8e19, 1.04e19, 1.12   # cm^-3 at 300 K, eV
for T in (250, 300, 350, 400):
    sc = (T / 300) ** 1.5
    ni = np.sqrt(Nc * sc * Nv * sc) * np.exp(-Eg / (2 * kB * T))
    print(f"   T = {T} K: n_i = {ni:.2e} cm^-3")
print("   (with refined effective masses the accepted 300 K value is ~1e10 cm^-3)")
print("   compare a metal: n ~ 8.5e22 cm^-3 for Cu -> conductivity differs by > 10 orders")
`;

// ── matlab/wk14_huckel_bands.m ─────────────────
export const ML_HUCKEL = `% Week 14 (Physical Chemistry 2) - From Hueckel molecular orbitals to bands
%   H = alpha I + beta A; chain/ring levels, pi systems, band formation,
%   Fermi-Dirac statistics and intrinsic Si.  Units: alpha = 0, beta = -1.
function wk14_huckel_bands()
fprintf('1-2) Chain: numerical vs analytic\\n');
for N = [2 4 6]
    E = sort(-eig(chainA(N, false)));
    a = sort(-2*cos((1:N)*pi/(N+1)));
    fprintf('   N = %d: %s  max|diff| = %.1e\\n', N, mat2str(round(E', 4)), max(abs(E' - a)));
end
fprintf('\\n3) pi systems (E_pi = n alpha + X beta)\\n');
sysn = {'butadiene','hexatriene','benzene'}; As = {chainA(4,false), chainA(6,false), chainA(6,true)}; ne = [4 6 6];
for i = 1:3
    E = sort(-eig(As{i}));  Et = 2*sum(E(1:ne(i)/2));
    fprintf('   %-10s X = %.3f  gap = %.3f|beta|  extra stabilisation = %.3f|beta|\\n', ...
            sysn{i}, -Et, E(ne(i)/2+1) - E(ne(i)/2), -Et - ne(i));
end
fprintf('\\n4) Band formation\\n');
for N = [2 5 10 20 50 100 1000]
    E = sort(-2*cos((1:N)*pi/(N+1)));
    if mod(N,2) == 0, g = E(N/2+1) - E(N/2); else, g = E((N+1)/2+1) - E((N+1)/2); end
    fprintf('   N = %5d: width = %.4f|beta|  spacing at centre = %.4f|beta|\\n', N, E(end) - E(1), g);
end
N = 100000; E = 2*cos((1:N)*pi/(N+1));
fprintf('   fraction |E| < |beta|: %.4f (analytic %.4f)\\n', mean(abs(E) < 1), 2/pi*asin(0.5));
fprintf('\\n5) Fermi-Dirac and intrinsic Si\\n');
kB = 8.617333e-5;
for T = [10 300 1000]
    f = @(dE) 0.5*(1 - tanh(dE/(2*kB*T)));
    fprintf('   T = %6.0f K: f(EF+0.1) = %.3e  f(EF-0.1) = %.6f\\n', T, f(0.1), f(-0.1));
end
Nc = 2.8e19; Nv = 1.04e19; Eg = 1.12;
for T = [250 300 350 400]
    sc = (T/300)^1.5;
    fprintf('   T = %d K: n_i = %.2e cm^-3\\n', T, sqrt(Nc*sc*Nv*sc)*exp(-Eg/(2*kB*T)));
end
end
function A = chainA(N, ring)
A = diag(ones(N-1,1), 1) + diag(ones(N-1,1), -1);
if ring && N > 2, A(1,N) = 1; A(N,1) = 1; end
end
`;

// ── julia/wk14_huckel_bands.jl ─────────────────
export const JL_HUCKEL = `# Week 14 (Physical Chemistry 2) - From Hueckel molecular orbitals to bands
#   H = alpha I + beta A; chain/ring levels, pi systems, band formation,
#   Fermi-Dirac statistics and intrinsic Si.  Units: alpha = 0, beta = -1.
using LinearAlgebra, Printf, Statistics

function chainA(N; ring = false)
    A = zeros(N, N)
    for i in 1:N-1; A[i, i+1] = A[i+1, i] = 1; end
    ring && N > 2 && (A[1, N] = A[N, 1] = 1)
    A
end
println("1-2) Chain: numerical vs analytic")
for N in (2, 4, 6)
    E = sort(-eigvals(Symmetric(chainA(N))))
    a = sort(-2 .* cos.((1:N) .* π ./ (N + 1)))
    @printf("   N = %d: %s  max|diff| = %.1e\\n", N, string(round.(E, digits = 4)), maximum(abs.(E .- a)))
end
println("\\n3) pi systems (E_pi = n alpha + X beta)")
for (name, A, ne) in (("butadiene", chainA(4), 4), ("hexatriene", chainA(6), 6), ("benzene", chainA(6, ring = true), 6))
    E = sort(-eigvals(Symmetric(A))); Et = 2sum(E[1:ne÷2])
    @printf("   %-10s X = %.3f  gap = %.3f|beta|  extra stabilisation = %.3f|beta|\\n",
            name, -Et, E[ne÷2+1] - E[ne÷2], -Et - ne)
end
println("\\n4) Band formation")
for N in (2, 5, 10, 20, 50, 100, 1000)
    E = sort(-2 .* cos.((1:N) .* π ./ (N + 1)))
    g = iseven(N) ? E[N÷2+1] - E[N÷2] : E[N÷2+2] - E[N÷2+1]
    @printf("   N = %5d: width = %.4f|beta|  spacing at centre = %.4f|beta|\\n", N, E[end] - E[1], g)
end
N = 100000; E = 2 .* cos.((1:N) .* π ./ (N + 1))
@printf("   fraction |E| < |beta|: %.4f (analytic %.4f)\\n", mean(abs.(E) .< 1), 2 / π * asin(0.5))
println("\\n5) Fermi-Dirac and intrinsic Si")
kB = 8.617333e-5
for T in (10, 300, 1000)
    f(dE) = 0.5 * (1 - tanh(dE / (2kB * T)))
    @printf("   T = %6.0f K: f(EF+0.1) = %.3e  f(EF-0.1) = %.6f\\n", T, f(0.1), f(-0.1))
end
Nc, Nv, Eg = 2.8e19, 1.04e19, 1.12
for T in (250, 300, 350, 400)
    sc = (T / 300)^1.5
    @printf("   T = %d K: n_i = %.2e cm^-3\\n", T, sqrt(Nc * sc * Nv * sc) * exp(-Eg / (2kB * T)))
end
`;

// ── cpp/wk14_huckel_bands.cpp ─────────────────
export const CPP_HUCKEL = `// Week 14 (Physical Chemistry 2) - From Hueckel molecular orbitals to bands
//   chain/ring eigenvalues by Jacobi diagonalisation vs 2 beta cos(k pi/(N+1)),
//   pi systems, band formation, Fermi-Dirac and intrinsic Si
// build: g++ -O2 -std=c++17 wk14_huckel_bands.cpp -o huckel && ./huckel
#include <cstdio>
#include <cmath>
#include <vector>
#include <algorithm>
using Mat = std::vector<std::vector<double>>;
const double PI = 3.14159265358979323846;

std::vector<double> jacobiEig(Mat A) {           // symmetric eigenvalues (cyclic Jacobi)
    int n = A.size();
    for (int sweep = 0; sweep < 100; ++sweep) {
        double off = 0;
        for (int p = 0; p < n; ++p) for (int q = p + 1; q < n; ++q) off += A[p][q] * A[p][q];
        if (off < 1e-24) break;
        for (int p = 0; p < n; ++p) for (int q = p + 1; q < n; ++q) {
            if (std::fabs(A[p][q]) < 1e-30) continue;
            double th = 0.5 * std::atan2(2 * A[p][q], A[q][q] - A[p][p]);
            double c = std::cos(th), s = std::sin(th);
            for (int k = 0; k < n; ++k) {
                double akp = A[k][p], akq = A[k][q];
                A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq;
            }
            for (int k = 0; k < n; ++k) {
                double apk = A[p][k], aqk = A[q][k];
                A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk;
            }
        }
    }
    std::vector<double> ev(n);
    for (int i = 0; i < n; ++i) ev[i] = A[i][i];
    std::sort(ev.begin(), ev.end());
    return ev;
}
Mat chain(int N, bool ring = false) {
    Mat A(N, std::vector<double>(N, 0));
    for (int i = 0; i + 1 < N; ++i) A[i][i + 1] = A[i + 1][i] = 1;
    if (ring && N > 2) A[0][N - 1] = A[N - 1][0] = 1;
    return A;
}
// energies with alpha = 0, beta = -1  ->  E = -lambda
std::vector<double> levels(const Mat& A) {
    auto ev = jacobiEig(A);
    for (auto& x : ev) x = -x;
    std::sort(ev.begin(), ev.end());
    return ev;
}
int main() {
    std::printf("1-2) Chain: numerical vs analytic\\n");
    for (int N : {2, 4, 6}) {
        auto E = levels(chain(N));
        std::vector<double> a;
        for (int k = 1; k <= N; ++k) a.push_back(-2 * std::cos(k * PI / (N + 1)));
        std::sort(a.begin(), a.end());
        double md = 0;
        for (int i = 0; i < N; ++i) md = std::max(md, std::fabs(E[i] - a[i]));
        std::printf("   N = %d:", N);
        for (double x : E) std::printf(" %.4f", x);
        std::printf("   max|diff| = %.1e\\n", md);
    }
    std::printf("\\n3) pi systems (E_pi = n alpha + X beta)\\n");
    struct P { const char* n; Mat A; int ne; } sys[] = {
        {"butadiene", chain(4), 4}, {"hexatriene", chain(6), 6}, {"benzene", chain(6, true), 6}};
    for (auto& s : sys) {
        auto E = levels(s.A);
        double Et = 0; for (int i = 0; i < s.ne / 2; ++i) Et += 2 * E[i];
        double gap = E[s.ne / 2] - E[s.ne / 2 - 1];
        std::printf("   %-10s X = %.3f  gap = %.3f|beta|  extra stabilisation = %.3f|beta|\\n",
                    s.n, -Et, gap, -Et - s.ne);
    }
    std::printf("\\n4) Band formation\\n");
    for (int N : {2, 5, 10, 20, 50, 100, 1000}) {
        std::vector<double> E;
        for (int k = 1; k <= N; ++k) E.push_back(-2 * std::cos(k * PI / (N + 1)));
        std::sort(E.begin(), E.end());
        double gap = (N % 2 == 0) ? E[N / 2] - E[N / 2 - 1] : E[N / 2 + 1] - E[N / 2];
        std::printf("   N = %5d: width = %.4f|beta|  spacing at centre = %.4f|beta|\\n", N, E.back() - E.front(), gap);
    }
    int N = 100000, cnt = 0;
    for (int k = 1; k <= N; ++k) if (std::fabs(2 * std::cos(k * PI / (N + 1))) < 1.0) ++cnt;
    std::printf("   fraction |E| < |beta|: %.4f (analytic %.4f)\\n", double(cnt) / N, 2 / PI * std::asin(0.5));
    std::printf("\\n5) Fermi-Dirac and intrinsic Si\\n");
    const double kB = 8.617333e-5;
    for (double T : {10.0, 300.0, 1000.0}) {
        auto f = [&](double dE) { return 0.5 * (1 - std::tanh(dE / (2 * kB * T))); };
        std::printf("   T = %6.0f K: f(EF+0.1) = %.3e  f(EF-0.1) = %.6f\\n", T, f(0.1), f(-0.1));
    }
    double Nc = 2.8e19, Nv = 1.04e19, Eg = 1.12;
    for (double T : {250.0, 300.0, 350.0, 400.0}) {
        double sc = std::pow(T / 300, 1.5);
        std::printf("   T = %.0f K: n_i = %.2e cm^-3\\n", T, std::sqrt(Nc * sc * Nv * sc) * std::exp(-Eg / (2 * kB * T)));
    }
}
`;

// ── python/wk14_isotherms.py ─────────────────
export const PY_ISO = `"""
Week 14 (Physical Chemistry 2) - Gas-surface collisions and adsorption isotherms
  1) collision flux J = p / sqrt(2 pi m kT) and the time to cover a clean surface
  2) Langmuir isotherm: linear fit p/V = p/V_inf + 1/(K V_inf) for CO on charcoal (273 K)
  3) isosteric enthalpy from ln p vs 1/T at constant coverage (van 't Hoff / Gibbs-Helmholtz)
  4) BET isotherm: z/((1-z)V) = 1/(c V_mon) + (c-1) z/(c V_mon) for N2 on rutile (75 K)
     and the BET surface area
  5) Freundlich and Temkin forms compared with Langmuir
"""
import numpy as np

kB, NA, R = 1.380649e-23, 6.02214076e23, 8.314462618
amu = 1.66053907e-27

def linfit(x, y):
    A = np.vstack([x, np.ones_like(x)]).T
    (m, c), *_ = np.linalg.lstsq(A, y, rcond=None)
    r2 = 1 - np.sum((y - (m * x + c))**2) / np.sum((y - y.mean())**2)
    return m, c, r2

# ---------- 1) collision flux ----------
print("1) Collision flux J = p / sqrt(2 pi m k T)")
for gas, M in (("N2", 28.0), ("H2", 2.016), ("O2", 32.0)):
    m = M * amu
    J = 1e5 / np.sqrt(2 * np.pi * m * kB * 298)
    print(f"   {gas}: 1 bar, 298 K  J = {J:.2e} m^-2 s^-1 = {J * 1e-4:.2e} cm^-2 s^-1")
m = 28 * amu
J = 1e5 / np.sqrt(2 * np.pi * m * kB * 298)
print(f"   N2 on a surface with 1e19 atoms m^-2: {J / 1e19:.1e} hits per atom per second")
for p_Pa, label in ((1e5, "1 bar"), (1.33e-4, "1e-6 Torr"), (1.33e-8, "1e-10 Torr (UHV)")):
    Jp = p_Pa / np.sqrt(2 * np.pi * m * kB * 298)
    print(f"   monolayer time (sticking 1, 1e19 sites/m^2) at {label:17s}: {1e19 / Jp:.2e} s")

# ---------- 2) Langmuir: CO on charcoal at 273 K ----------
p = np.array([13.3, 26.7, 40.0, 53.3, 66.7, 80.0, 93.3])      # kPa
V = np.array([10.2, 18.6, 25.5, 31.5, 36.9, 41.6, 46.1])      # cm^3 (corrected to 1 atm)
mL, cL, r2 = linfit(p, p / V)
Vinf = 1 / mL
K = mL / cL
print("\\n2) Langmuir fit of p/V vs p (CO on charcoal, 273 K)")
print(f"   slope = {mL:.5f} cm^-3, intercept = {cL:.3f} kPa cm^-3, R^2 = {r2:.5f}")
print(f"   V_inf = {Vinf:.1f} cm^3,  K = {K:.2e} kPa^-1 = {K * 1e-3:.2e} Pa^-1")
print(f"   coverage at 80.0 kPa: theta = V/V_inf = {41.6 / Vinf:.3f}"
      f"  (model K p/(1+K p) = {K*80/(1+K*80):.3f})")

# ---------- 3) isosteric enthalpy ----------
T = np.array([200, 210, 220, 230, 240, 250.0])
pT = np.array([4.00, 4.95, 6.03, 7.20, 8.47, 9.85])               # kPa at V = 10.0 cm^3
mI, cI, r2I = linfit(1 / T, np.log(pT))
print("\\n3) Isosteric enthalpy: ln p vs 1/T at V = 10.0 cm^3")
print(f"   slope = {mI:.1f} K, R^2 = {r2I:.5f}  ->  Delta_ads H = slope * R = {mI * R / 1000:.2f} kJ/mol")

# ---------- 4) BET: N2 on rutile at 75 K ----------
pB = np.array([0.160, 1.87, 6.11, 11.67, 17.02, 21.92, 27.29])    # kPa
VB = np.array([601, 720, 822, 935, 1046, 1146, 1254.0])           # mm^3
pstar = 76.0                                                       # kPa, vapour pressure of N2 at 75 K
z = pB / pstar
y = z / ((1 - z) * VB)
mB, cB, r2B = linfit(z, y)
c = 1 + mB / cB
Vmon = 1 / (cB * c)
print("\\n4) BET fit z/((1-z)V) vs z (N2 on rutile, 75 K, p* = 76.0 kPa)")
print(f"   slope = {mB:.3e} mm^-3, intercept = {cB:.3e} mm^-3, R^2 = {r2B:.5f}")
print(f"   c = {c:.0f},  V_mon = {Vmon:.0f} mm^3")
n_mon = 101325 * Vmon * 1e-9 / (R * 273.15)                      # mol (volume at 1 atm, 273 K)
sigma = 0.162e-18                                                  # m^2 per N2 molecule
print(f"   monolayer = {n_mon * 1e6:.1f} umol N2 -> area = n NA sigma = {n_mon * NA * sigma:.2f} m^2")
dE = R * 75 * np.log(c)
print(f"   E1 - E_L = RT ln c = {dE / 1000:.2f} kJ/mol (how much more the first layer is favoured)")

# ---------- 5) Freundlich, Temkin vs Langmuir ----------
print("\\n5) Isotherm shapes (dimensionless pressure x = K p)")
for x in (0.01, 0.1, 1, 10, 100):
    lang = x / (1 + x)
    freund = 0.3 * x ** 0.4
    temkin = max(0.0, 0.15 * np.log(10 * x))
    print(f"   Kp = {x:7.2f}: Langmuir {lang:.3f}   Freundlich 0.3(Kp)^0.4 = {freund:.3f}   Temkin 0.15 ln(10 Kp) = {temkin:.3f}")
`;

// ── matlab/wk14_isotherms.m ─────────────────
export const ML_ISO = `% Week 14 (Physical Chemistry 2) - Gas-surface collisions and adsorption isotherms
%   collision flux, Langmuir fit (CO/charcoal, 273 K), isosteric enthalpy,
%   BET fit (N2 on rutile, 75 K) and BET surface area
function wk14_isotherms()
kB = 1.380649e-23; NA = 6.02214076e23; R = 8.314462618; amu = 1.66053907e-27;
fprintf('1) Collision flux J = p/sqrt(2 pi m k T)\\n');
gas = {'N2','H2','O2'}; M = [28.0 2.016 32.0];
for i = 1:3
    fprintf('   %s: J = %.2e m^-2 s^-1\\n', gas{i}, 1e5/sqrt(2*pi*M(i)*amu*kB*298));
end
m = 28*amu; J = 1e5/sqrt(2*pi*m*kB*298);
fprintf('   N2 hits per surface atom (1e19 m^-2): %.1e s^-1\\n', J/1e19);
for p = [1e5 1.33e-4 1.33e-8]
    fprintf('   monolayer time at %.2e Pa: %.2e s\\n', p, 1e19/(p/sqrt(2*pi*m*kB*298)));
end
p = [13.3 26.7 40.0 53.3 66.7 80.0 93.3];  V = [10.2 18.6 25.5 31.5 36.9 41.6 46.1];
[mL, cL, r2] = linfit(p, p./V);
fprintf('\\n2) Langmuir: slope %.5f, intercept %.3f, R^2 %.5f -> V_inf = %.1f cm^3, K = %.2e kPa^-1\\n', ...
        mL, cL, r2, 1/mL, mL/cL);
T = [200 210 220 230 240 250];  pT = [4.00 4.95 6.03 7.20 8.47 9.85];
[mI, ~, r2I] = linfit(1./T, log(pT));
fprintf('\\n3) Isosteric: slope %.1f K, R^2 %.5f -> Delta_ads H = %.2f kJ/mol\\n', mI, r2I, mI*R/1000);
pB = [0.160 1.87 6.11 11.67 17.02 21.92 27.29];  VB = [601 720 822 935 1046 1146 1254];
z = pB/76.0;  [mB, cB, r2B] = linfit(z, z./((1 - z).*VB));
c = 1 + mB/cB;  Vmon = 1/(cB*c);  nmon = 101325*Vmon*1e-9/(R*273.15);
fprintf('\\n4) BET: slope %.3e, intercept %.3e, R^2 %.5f -> c = %.0f, V_mon = %.0f mm^3, area = %.2f m^2\\n', ...
        mB, cB, r2B, c, Vmon, nmon*NA*0.162e-18);
fprintf('   E1 - EL = RT ln c = %.2f kJ/mol\\n', R*75*log(c)/1000);
end
function [m, c, r2] = linfit(x, y)
P = polyfit(x, y, 1); m = P(1); c = P(2);
r2 = 1 - sum((y - polyval(P, x)).^2)/sum((y - mean(y)).^2);
end
`;

// ── julia/wk14_isotherms.jl ─────────────────
export const JL_ISO = `# Week 14 (Physical Chemistry 2) - Gas-surface collisions and adsorption isotherms
#   collision flux, Langmuir fit (CO/charcoal, 273 K), isosteric enthalpy,
#   BET fit (N2 on rutile, 75 K) and BET surface area
using Printf, Statistics
const kB, NA, R, amu = 1.380649e-23, 6.02214076e23, 8.314462618, 1.66053907e-27
function linfit(x, y)
    m = sum((x .- mean(x)) .* (y .- mean(y))) / sum((x .- mean(x)) .^ 2)
    c = mean(y) - m * mean(x)
    r2 = 1 - sum((y .- (m .* x .+ c)) .^ 2) / sum((y .- mean(y)) .^ 2)
    m, c, r2
end
println("1) Collision flux J = p/sqrt(2 pi m k T)")
for (g, M) in (("N2", 28.0), ("H2", 2.016), ("O2", 32.0))
    @printf("   %s: J = %.2e m^-2 s^-1\\n", g, 1e5 / sqrt(2π * M * amu * kB * 298))
end
m = 28amu; J = 1e5 / sqrt(2π * m * kB * 298)
@printf("   N2 hits per surface atom (1e19 m^-2): %.1e s^-1\\n", J / 1e19)
for p in (1e5, 1.33e-4, 1.33e-8)
    @printf("   monolayer time at %.2e Pa: %.2e s\\n", p, 1e19 / (p / sqrt(2π * m * kB * 298)))
end
p = [13.3, 26.7, 40.0, 53.3, 66.7, 80.0, 93.3]; V = [10.2, 18.6, 25.5, 31.5, 36.9, 41.6, 46.1]
mL, cL, r2 = linfit(p, p ./ V)
@printf("\\n2) Langmuir: slope %.5f, intercept %.3f, R^2 %.5f -> V_inf = %.1f cm^3, K = %.2e kPa^-1\\n",
        mL, cL, r2, 1 / mL, mL / cL)
T = [200, 210, 220, 230, 240, 250.0]; pT = [4.00, 4.95, 6.03, 7.20, 8.47, 9.85]
mI, _, r2I = linfit(1 ./ T, log.(pT))
@printf("\\n3) Isosteric: slope %.1f K, R^2 %.5f -> Delta_ads H = %.2f kJ/mol\\n", mI, r2I, mI * R / 1000)
pB = [0.160, 1.87, 6.11, 11.67, 17.02, 21.92, 27.29]; VB = [601, 720, 822, 935, 1046, 1146, 1254.0]
z = pB ./ 76.0
mB, cB, r2B = linfit(z, z ./ ((1 .- z) .* VB))
c = 1 + mB / cB; Vmon = 1 / (cB * c); nmon = 101325 * Vmon * 1e-9 / (R * 273.15)
@printf("\\n4) BET: slope %.3e, intercept %.3e, R^2 %.5f -> c = %.0f, V_mon = %.0f mm^3, area = %.2f m^2\\n",
        mB, cB, r2B, c, Vmon, nmon * NA * 0.162e-18)
@printf("   E1 - EL = RT ln c = %.2f kJ/mol\\n", R * 75 * log(c) / 1000)
`;

// ── cpp/wk14_isotherms.cpp ─────────────────
export const CPP_ISO = `// Week 14 (Physical Chemistry 2) - Gas-surface collisions and adsorption isotherms
//   collision flux, Langmuir fit (CO/charcoal), isosteric enthalpy, BET fit (N2/rutile)
// build: g++ -O2 -std=c++17 wk14_isotherms.cpp -o iso && ./iso
#include <cstdio>
#include <cmath>
#include <vector>
const double PI = 3.14159265358979323846, kB = 1.380649e-23, NA = 6.02214076e23,
             R = 8.314462618, amu = 1.66053907e-27;
struct Fit { double m, c, r2; };
Fit linfit(const std::vector<double>& x, const std::vector<double>& y) {
    int n = x.size(); double sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (int i = 0; i < n; ++i) { sx += x[i]; sy += y[i]; sxx += x[i] * x[i]; sxy += x[i] * y[i]; }
    double m = (n * sxy - sx * sy) / (n * sxx - sx * sx), c = (sy - m * sx) / n;
    double ym = sy / n, ss = 0, st = 0;
    for (int i = 0; i < n; ++i) { double r = y[i] - (m * x[i] + c); ss += r * r; st += (y[i] - ym) * (y[i] - ym); }
    return {m, c, 1 - ss / st};
}
int main() {
    std::printf("1) Collision flux\\n");
    struct G { const char* n; double M; } gases[] = {{"N2", 28.0}, {"H2", 2.016}, {"O2", 32.0}};
    for (auto& g : gases) {
        double J = 1e5 / std::sqrt(2 * PI * g.M * amu * kB * 298);
        std::printf("   %s: J = %.2e m^-2 s^-1\\n", g.n, J);
    }
    double m = 28 * amu;
    double J = 1e5 / std::sqrt(2 * PI * m * kB * 298);
    std::printf("   N2 hits per surface atom (1e19 m^-2): %.1e s^-1\\n", J / 1e19);
    for (double p : {1e5, 1.33e-4, 1.33e-8})
        std::printf("   monolayer time at %.2e Pa: %.2e s\\n", p, 1e19 / (p / std::sqrt(2 * PI * m * kB * 298)));

    std::vector<double> p = {13.3, 26.7, 40.0, 53.3, 66.7, 80.0, 93.3}, V = {10.2, 18.6, 25.5, 31.5, 36.9, 41.6, 46.1}, y;
    for (size_t i = 0; i < p.size(); ++i) y.push_back(p[i] / V[i]);
    Fit L = linfit(p, y);
    std::printf("\\n2) Langmuir: slope %.5f, intercept %.3f, R^2 %.5f -> V_inf = %.1f cm^3, K = %.2e kPa^-1\\n",
                L.m, L.c, L.r2, 1 / L.m, L.m / L.c);

    std::vector<double> T = {200, 210, 220, 230, 240, 250}, pT = {4.00, 4.95, 6.03, 7.20, 8.47, 9.85}, xi, yi;
    for (size_t i = 0; i < T.size(); ++i) { xi.push_back(1 / T[i]); yi.push_back(std::log(pT[i])); }
    Fit I = linfit(xi, yi);
    std::printf("\\n3) Isosteric: slope %.1f K, R^2 %.5f -> Delta_ads H = %.2f kJ/mol\\n", I.m, I.r2, I.m * R / 1000);

    std::vector<double> pB = {0.160, 1.87, 6.11, 11.67, 17.02, 21.92, 27.29}, VB = {601, 720, 822, 935, 1046, 1146, 1254}, z, yb;
    double ps = 76.0;
    for (size_t i = 0; i < pB.size(); ++i) { double zz = pB[i] / ps; z.push_back(zz); yb.push_back(zz / ((1 - zz) * VB[i])); }
    Fit B = linfit(z, yb);
    double c = 1 + B.m / B.c, Vmon = 1 / (B.c * c);
    double nmon = 101325 * Vmon * 1e-9 / (R * 273.15);
    std::printf("\\n4) BET: slope %.3e, intercept %.3e, R^2 %.5f -> c = %.0f, V_mon = %.0f mm^3, area = %.2f m^2\\n",
                B.m, B.c, B.r2, c, Vmon, nmon * NA * 0.162e-18);
    std::printf("   E1 - EL = RT ln c = %.2f kJ/mol\\n", R * 75 * std::log(c) / 1000);
}
`;

// ── python/wk14_surface_kinetics.py ─────────────────
export const PY_KIN = `"""
Week 14 (Physical Chemistry 2) - Rates at surfaces and heterogeneous catalysis
  1) residence time tau = (1/nu) exp(E_des/kT) for physisorbed and chemisorbed species
  2) temperature-programmed desorption (Polanyi-Wigner, first order) and the Redhead formula
  3) surface diffusion: D = a^2 k_hop/4 and the diffusion length L = sqrt(D tau)
  4) Langmuir-Hinshelwood vs Eley-Rideal rates and the LH maximum at K_A p_A = 1 + K_B p_B
  5) a Sabatier volcano: rate = min(adsorption-limited, desorption-limited) vs binding energy
"""
import numpy as np

kB = 8.617333e-5       # eV/K
kJ = 96.485            # kJ/mol per eV

# ---------- 1) residence time ----------
print("1) Residence time tau = (1/nu) exp(E_des/kT), nu = 1e13 s^-1")
for E_kJ, label in ((25, "physisorbed (25 kJ/mol)"), (100, "weak chemisorption (100 kJ/mol)"),
                    (200, "strong chemisorption (200 kJ/mol)")):
    for T in (300, 600):
        tau = 1e-13 * np.exp(E_kJ / kJ / (kB * T))
        print(f"   {label:34s} T = {T} K: tau = {tau:.2e} s")

# ---------- 2) TPD ----------
def tpd(E, nu=1e13, beta=10.0, T0=100.0, T1=900.0, dT=0.01, n=1):
    T = np.arange(T0, T1, dT)
    th = 1.0; rate = np.zeros_like(T)
    for i, Ti in enumerate(T):
        r = nu * th**n * np.exp(-E / (kB * Ti))      # Polanyi-Wigner, per second
        rate[i] = r / beta                           # -d theta/dT
        th = max(th - rate[i] * dT, 0.0)
    return T, rate

print("\\n2) TPD, first order, nu = 1e13 s^-1, heating rate 10 K/s")
for E in (0.5, 1.0, 1.5):
    T, r = tpd(E)
    Tp = T[np.argmax(r)]
    # Redhead: E = k Tp [ln(nu Tp/beta) - 3.64]
    Ered = kB * Tp * (np.log(1e13 * Tp / 10.0) - 3.64)
    print(f"   E_des = {E:.1f} eV ({E * kJ:5.1f} kJ/mol): T_peak = {Tp:6.1f} K,  Redhead estimate {Ered:.3f} eV")
for beta in (1, 10, 100):
    T, r = tpd(1.0, beta=beta)
    print(f"   E = 1.0 eV, beta = {beta:3d} K/s: T_peak = {T[np.argmax(r)]:.1f} K  (faster heating -> higher T_peak)")

# ---------- 3) surface diffusion ----------
print("\\n3) Surface diffusion (a = 0.3 nm, nu = 1e13 s^-1, E_des = 1.0 eV, E_diff = 0.5 eV)")
a, nu, Ed, Edf = 0.3e-9, 1e13, 1.0, 0.5
for T in (300, 500, 700):
    khop = nu * np.exp(-Edf / (kB * T))
    D = a**2 * khop / 4
    tau = np.exp(Ed / (kB * T)) / nu
    L = np.sqrt(D * tau)
    L2 = a / 2 * np.exp((Ed - Edf) / (2 * kB * T))
    print(f"   T = {T} K: k_hop = {khop:.2e} s^-1, D = {D:.2e} m^2/s, tau = {tau:.2e} s, L = {L*1e9:.3g} nm (closed form {L2*1e9:.3g} nm)")

# ---------- 4) LH vs ER ----------
print("\\n4) Rates at fixed k = 1 and K_B p_B = 1")
KB_pB = 1.0
print("   K_A p_A   LH = th_A th_B        ER = th_A (B from gas, rate ~ th_A p_B)")
for x in (0.1, 0.5, 1, 2, 4, 10, 100):
    thA_LH = x / (1 + x + KB_pB); thB_LH = KB_pB / (1 + x + KB_pB)
    thA_ER = x / (1 + x)
    print(f"   {x:7.1f}   {thA_LH * thB_LH:.4f}               {thA_ER:.4f}")
print("   LH maximum where K_A p_A = 1 + K_B p_B = 2: rate = 1/8 = 0.125;"
      " beyond it A crowds out B (self-poisoning). ER saturates instead.")

# ---------- 5) Sabatier volcano ----------
print("\\n5) Volcano: rate = min(r_ads, r_des), BEP barriers vs binding energy Delta E (eV, negative = strong)")
Ea0, gam = 0.9, 0.5
T = 600.0
best = None
for dE in np.round(np.arange(-1.2, 0.41, 0.1), 1) + 0.0:
    Eads = max(0.0, Ea0 + gam * dE)               # activation of the dissociative adsorption step
    Edes = max(0.0, -dE + 0.4)                    # product must leave: harder when binding is strong
    r = min(np.exp(-Eads / (kB * T)), np.exp(-Edes / (kB * T)))
    if best is None or r > best[1]:
        best = (dE, r)
    print(f"   dE = {dE:+.1f} eV: log10(rate) = {np.log10(r):6.2f}")
print(f"   peak near dE = {best[0]:+.1f} eV (analytic: Ea0 + gam dE = -dE + 0.4 -> dE = {(0.4 - Ea0) / (1 + gam):+.2f} eV)")
`;

// ── matlab/wk14_surface_kinetics.m ─────────────────
export const ML_KIN = `% Week 14 (Physical Chemistry 2) - Rates at surfaces and heterogeneous catalysis
%   residence time, TPD (Polanyi-Wigner + Redhead), surface diffusion length,
%   Langmuir-Hinshelwood vs Eley-Rideal, Sabatier volcano
function wk14_surface_kinetics()
kB = 8.617333e-5; kJ = 96.485;
fprintf('1) Residence time (nu = 1e13 s^-1)\\n');
for E = [25 100 200], for T = [300 600]
    fprintf('   E = %3d kJ/mol, T = %d K: tau = %.2e s\\n', E, T, 1e-13*exp(E/kJ/(kB*T)));
end, end
fprintf('\\n2) TPD (first order, beta = 10 K/s)\\n');
for E = [0.5 1.0 1.5]
    Tp = tpdPeak(E, 10, kB);
    fprintf('   E = %.1f eV: T_peak = %.1f K, Redhead %.3f eV\\n', E, Tp, kB*Tp*(log(1e13*Tp/10) - 3.64));
end
for b = [1 10 100]
    fprintf('   E = 1.0 eV, beta = %3d K/s: T_peak = %.1f K\\n', b, tpdPeak(1.0, b, kB));
end
fprintf('\\n3) Surface diffusion (a = 0.3 nm, Edes = 1.0 eV, Ediff = 0.5 eV)\\n');
a = 0.3e-9; nu = 1e13;
for T = [300 500 700]
    khop = nu*exp(-0.5/(kB*T)); D = a^2*khop/4; tau = exp(1.0/(kB*T))/nu;
    fprintf('   T = %d K: D = %.2e m^2/s, tau = %.2e s, L = %.3g nm\\n', T, D, tau, sqrt(D*tau)*1e9);
end
fprintf('\\n4) LH vs ER (K_B p_B = 1)\\n');
for x = [0.1 0.5 1 2 4 10 100]
    fprintf('   K_A p_A = %6.1f: LH %.4f  ER %.4f\\n', x, x/(2 + x)^2, x/(1 + x));
end
fprintf('\\n5) Volcano (T = 600 K)\\n');
dE = (-12:4)/10;
Ea = max(0, 0.9 + 0.5*dE); Ed = max(0, -dE + 0.4);
r = min(exp(-Ea/(kB*600)), exp(-Ed/(kB*600)));
for i = 1:numel(dE), fprintf('   dE = %+.1f eV: log10 rate = %6.2f\\n', dE(i), log10(r(i))); end
[~, k] = max(r); fprintf('   peak near dE = %+.1f eV\\n', dE(k));
end
function Tp = tpdPeak(E, beta, kB)
th = 1; best = 0; Tp = 0; dT = 0.01;
for T = 100:dT:900
    r = 1e13*th*exp(-E/(kB*T))/beta;
    if r > best, best = r; Tp = T; end
    th = max(th - r*dT, 0);
end
end
`;

// ── julia/wk14_surface_kinetics.jl ─────────────────
export const JL_KIN = `# Week 14 (Physical Chemistry 2) - Rates at surfaces and heterogeneous catalysis
#   residence time, TPD (Polanyi-Wigner + Redhead), surface diffusion length,
#   Langmuir-Hinshelwood vs Eley-Rideal, Sabatier volcano
using Printf
const kB, kJ = 8.617333e-5, 96.485
println("1) Residence time (nu = 1e13 s^-1)")
for E in (25, 100, 200), T in (300, 600)
    @printf("   E = %3d kJ/mol, T = %d K: tau = %.2e s\\n", E, T, 1e-13 * exp(E / kJ / (kB * T)))
end
function tpdPeak(E, beta; nu = 1e13)
    th, best, Tp = 1.0, 0.0, 0.0
    for T in 100:0.01:900
        r = nu * th * exp(-E / (kB * T)) / beta
        r > best && ((best, Tp) = (r, T))
        th = max(th - r * 0.01, 0.0)
    end
    Tp
end
println("\\n2) TPD (first order, beta = 10 K/s)")
for E in (0.5, 1.0, 1.5)
    Tp = tpdPeak(E, 10)
    @printf("   E = %.1f eV: T_peak = %.1f K, Redhead %.3f eV\\n", E, Tp, kB * Tp * (log(1e13 * Tp / 10) - 3.64))
end
for b in (1, 10, 100); @printf("   E = 1.0 eV, beta = %3d K/s: T_peak = %.1f K\\n", b, tpdPeak(1.0, b)); end
println("\\n3) Surface diffusion (a = 0.3 nm, Edes = 1.0 eV, Ediff = 0.5 eV)")
a, nu = 0.3e-9, 1e13
for T in (300, 500, 700)
    khop = nu * exp(-0.5 / (kB * T)); D = a^2 * khop / 4; tau = exp(1.0 / (kB * T)) / nu
    @printf("   T = %d K: D = %.2e m^2/s, tau = %.2e s, L = %.3g nm\\n", T, D, tau, sqrt(D * tau) * 1e9)
end
println("\\n4) LH vs ER (K_B p_B = 1)")
for x in (0.1, 0.5, 1, 2, 4, 10, 100)
    @printf("   K_A p_A = %6.1f: LH %.4f  ER %.4f\\n", x, x / (2 + x)^2, x / (1 + x))
end
println("\\n5) Volcano (T = 600 K)")
dE = (-12:4) ./ 10
r = [min(exp(-max(0, 0.9 + 0.5d) / (kB * 600)), exp(-max(0, -d + 0.4) / (kB * 600))) for d in dE]
for (d, ri) in zip(dE, r); @printf("   dE = %+.1f eV: log10 rate = %6.2f\\n", d, log10(ri)); end
@printf("   peak near dE = %+.1f eV\\n", dE[argmax(r)])
`;

// ── cpp/wk14_surface_kinetics.cpp ─────────────────
export const CPP_KIN = `// Week 14 (Physical Chemistry 2) - Rates at surfaces and heterogeneous catalysis
//   residence time, TPD (Polanyi-Wigner + Redhead), surface diffusion length,
//   Langmuir-Hinshelwood vs Eley-Rideal, Sabatier volcano
// build: g++ -O2 -std=c++17 wk14_surface_kinetics.cpp -o kin && ./kin
#include <cstdio>
#include <cmath>
#include <algorithm>
const double kB = 8.617333e-5, kJ = 96.485;

double tpdPeak(double E, double beta, double nu = 1e13) {
    double th = 1, best = 0, Tp = 0, dT = 0.01;
    for (double T = 100; T < 900; T += dT) {
        double r = nu * th * std::exp(-E / (kB * T)) / beta;
        if (r > best) { best = r; Tp = T; }
        th = std::max(th - r * dT, 0.0);
    }
    return Tp;
}
int main() {
    std::printf("1) Residence time (nu = 1e13 s^-1)\\n");
    for (double E : {25.0, 100.0, 200.0}) for (double T : {300.0, 600.0})
        std::printf("   E = %3.0f kJ/mol, T = %.0f K: tau = %.2e s\\n", E, T, 1e-13 * std::exp(E / kJ / (kB * T)));
    std::printf("\\n2) TPD (first order, beta = 10 K/s)\\n");
    for (double E : {0.5, 1.0, 1.5}) {
        double Tp = tpdPeak(E, 10);
        std::printf("   E = %.1f eV: T_peak = %.1f K, Redhead %.3f eV\\n", E, Tp, kB * Tp * (std::log(1e13 * Tp / 10) - 3.64));
    }
    for (double b : {1.0, 10.0, 100.0}) std::printf("   E = 1.0 eV, beta = %3.0f K/s: T_peak = %.1f K\\n", b, tpdPeak(1.0, b));
    std::printf("\\n3) Surface diffusion (a = 0.3 nm, Edes = 1.0 eV, Ediff = 0.5 eV)\\n");
    double a = 0.3e-9, nu = 1e13;
    for (double T : {300.0, 500.0, 700.0}) {
        double khop = nu * std::exp(-0.5 / (kB * T)), D = a * a * khop / 4, tau = std::exp(1.0 / (kB * T)) / nu;
        std::printf("   T = %.0f K: D = %.2e m^2/s, tau = %.2e s, L = %.3g nm\\n", T, D, tau, std::sqrt(D * tau) * 1e9);
    }
    std::printf("\\n4) LH vs ER (K_B p_B = 1)\\n");
    for (double x : {0.1, 0.5, 1.0, 2.0, 4.0, 10.0, 100.0})
        std::printf("   K_A p_A = %6.1f: LH %.4f  ER %.4f\\n", x, x / (2 + x) / (2 + x), x / (1 + x));
    std::printf("\\n5) Volcano (T = 600 K)\\n");
    double bestR = -1, bestE = 0;
    for (int i = -12; i <= 4; ++i) {
        double dE = i / 10.0;
        double Ea = std::max(0.0, 0.9 + 0.5 * dE), Ed = std::max(0.0, -dE + 0.4);
        double r = std::min(std::exp(-Ea / (kB * 600)), std::exp(-Ed / (kB * 600)));
        if (r > bestR) { bestR = r; bestE = dE; }
        std::printf("   dE = %+.1f eV: log10 rate = %6.2f\\n", dE, std::log10(r));
    }
    std::printf("   peak near dE = %+.1f eV\\n", bestE);
}
`;
