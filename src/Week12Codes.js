/* ============================================================
   Week12Codes.js — Physical Chemistry 2, Week 12
   Raw code samples: Thermal Properties of Solids & Electronic Bands
   - 4 topics: planck_einstein, debye_heat,
               tight_binding, diatomic_band
   - 4 languages: Python, MATLAB, Julia, C++
   Imported by Week12App.jsx > RawCodes tab.
   Auto-generated from codes/ — edit the standalone files, then regenerate.
   ============================================================ */

// ── python/wk12_planck_einstein.py ─────────────────
export const PY_PLANCK = `"""
Week 12 - Planck distribution and the Einstein heat capacity
Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)

Quantum oscillator levels E_s = (s + 1/2) hbar*omega, Boltzmann weights exp(-s x), x = hbar*omega/kT.
  <n> = sum_s s e^{-s x} / sum_s e^{-s x} = 1 / (e^x - 1)          (Planck distribution)
  <E> = hbar*omega (<n> + 1/2)
Einstein solid (3N oscillators of one frequency omega_E, theta_E = hbar*omega_E/k):
  C_V = 3 N k x^2 e^x / (e^x - 1)^2,  x = theta_E / T
Checks: direct level sums equal the closed form; C_V -> 3R at high T (Dulong-Petit).
"""
import numpy as np

R = 8.314462618

def planck_n(x):
    return 1.0 / np.expm1(x)

def planck_n_by_sum(x, smax=4000):
    s = np.arange(smax)
    w = np.exp(-s * x)
    return np.sum(s * w) / np.sum(w)

def einstein_cv(T, theta):
    """Molar heat capacity (J mol^-1 K^-1) of an Einstein solid."""
    x = theta / np.asarray(T, dtype=float)
    return 3 * R * x**2 * np.exp(x) / np.expm1(x) ** 2

if __name__ == "__main__":
    print("Planck distribution: direct sum vs 1/(e^x - 1)")
    for x in (0.1, 0.5, 1.0, 2.0, 5.0):
        print(f"  x = {x:3.1f}:  sum = {planck_n_by_sum(x):.8f}   formula = {planck_n(x):.8f}")
    print("\\nLevel populations P_s = (1 - e^-x) e^(-s x) at x = 1:",
          np.round((1 - np.exp(-1)) * np.exp(-np.arange(5)), 4))
    print("\\nClassical limit: <n> -> kT/(hbar w) - 1/2 for small x;  x = 0.01 gives",
          f"{planck_n(0.01):.4f} vs {1/0.01 - 0.5:.4f}")
    theta = 240.0      # illustrative Einstein temperature (K)
    print(f"\\nEinstein solid, theta_E = {theta} K:  C_V / 3R")
    for T in (10, 30, 60, 120, 240, 600, 2000):
        print(f"  T = {T:5d} K:  C_V = {einstein_cv(T, theta):7.3f} J/mol/K   C_V/3R = {einstein_cv(T, theta) / (3 * R):.4f}")
    print(f"\\nDulong-Petit 3R = {3 * R:.3f} J/mol/K")
`;

// ── matlab/wk12_planck_einstein.m ─────────────────
export const ML_PLANCK = `% Week 12 - Planck distribution and the Einstein heat capacity
% Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
% <n> = 1/(e^x - 1), x = hbar w/kT;  C_V = 3R x^2 e^x/(e^x - 1)^2
function wk12_planck_einstein()
    R = 8.314462618; s = 0:3999;
    for x = [0.1 0.5 1 2 5]
        w = exp(-s*x); fprintf('x = %.1f: sum %.8f  formula %.8f\\n', x, sum(s.*w)/sum(w), 1/expm1(x));
    end
    th = 240; T = [10 30 60 120 240 600 2000]; x = th./T;
    Cv = 3*R*x.^2.*exp(x)./expm1(x).^2;
    for i = 1:numel(T), fprintf('T = %5d K: C_V = %7.3f J/mol/K (C_V/3R = %.4f)\\n', T(i), Cv(i), Cv(i)/(3*R)); end
    Tp = linspace(2, 600, 300); xp = th./Tp;
    figure; plot(Tp, 3*R*xp.^2.*exp(xp)./expm1(xp).^2/(3*R), 'LineWidth', 1.5); xlabel('T (K)'); ylabel('C_V/3R'); grid on;
end
`;

// ── julia/wk12_planck_einstein.jl ─────────────────
export const JL_PLANCK = `# Week 12 - Planck distribution and the Einstein heat capacity
# Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
using Printf
const R = 8.314462618
planck_sum(x) = (s = 0:3999; w = exp.(-s .* x); sum(s .* w) / sum(w))
einstein_cv(T, th) = (x = th / T; 3R * x^2 * exp(x) / expm1(x)^2)
for x in (0.1, 0.5, 1.0, 2.0, 5.0)
    @printf("x = %.1f: sum %.8f formula %.8f\\n", x, planck_sum(x), 1 / expm1(x))
end
for T in (10, 30, 60, 120, 240, 600, 2000)
    @printf("T = %5d K: C_V = %7.3f J/mol/K (C_V/3R = %.4f)\\n", T, einstein_cv(T, 240), einstein_cv(T, 240) / 3R)
end
`;

// ── cpp/wk12_planck_einstein.cpp ─────────────────
export const CPP_PLANCK = `// Week 12 - Planck distribution and the Einstein heat capacity
// Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
// <n> = 1/(e^x - 1), x = hbar w / kT;  C_V = 3R x^2 e^x / (e^x - 1)^2 (Einstein solid)
// Build: g++ -O2 -std=c++17 wk12_planck_einstein.cpp -o planck
#include <cmath>
#include <cstdio>
#include <initializer_list>
const double R = 8.314462618;
double planckSum(double x) { double num = 0, den = 0; for (int s = 0; s < 4000; ++s) { double w = std::exp(-s * x); num += s * w; den += w; } return num / den; }
double einsteinCv(double T, double th) { double x = th / T; return 3 * R * x * x * std::exp(x) / std::pow(std::expm1(x), 2); }
int main() {
    for (double x : {0.1, 0.5, 1.0, 2.0, 5.0}) std::printf("x = %.1f: sum %.8f formula %.8f\\n", x, planckSum(x), 1 / std::expm1(x));
    for (double T : {10.0, 30.0, 60.0, 120.0, 240.0, 600.0, 2000.0}) std::printf("T = %6.0f K: C_V = %7.3f J/mol/K (C_V/3R = %.4f)\\n", T, einsteinCv(T, 240), einsteinCv(T, 240) / (3 * R));
    return 0;
}
`;

// ── python/wk12_debye_heat.py ─────────────────
export const PY_DEBYE = `"""
Week 12 - Debye model: counting phonon modes and the T^3 law
Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)

Periodic box of side L: k = (2 pi / L)(n_x, n_y, n_z). Number of k points inside a sphere of radius k:
  N(k) = V k^3 / (6 pi^2)        ->   D(omega) = V omega^2 / (2 pi^2 v^3) per polarization
Debye: 3 polarizations, linear dispersion omega = v k, cutoff omega_D so that the total is 3N modes.
  U = 9 N k T (T/theta_D)^3 int_0^{x_D} x^3/(e^x - 1) dx
  C_V = 9 N k (T/theta_D)^3 int_0^{x_D} x^4 e^x/(e^x - 1)^2 dx,   x_D = theta_D / T
Limits: T >> theta_D -> 3Nk;  T << theta_D -> (12 pi^4/5) N k (T/theta_D)^3.
"""
import numpy as np

R = 8.314462618

def count_k_points(L_over_2pi_kmax):
    """Count integer triples (n_x,n_y,n_z) with |n| <= M, compare with (4/3) pi M^3."""
    M = L_over_2pi_kmax
    n = np.arange(-int(M) - 1, int(M) + 2)
    nx, ny, nz = np.meshgrid(n, n, n, indexing="ij")
    return np.count_nonzero(nx**2 + ny**2 + nz**2 <= M**2), 4 / 3 * np.pi * M**3

def debye_cv(T, theta, n=4000):
    """Molar heat capacity of a Debye solid (J mol^-1 K^-1), Simpson-free midpoint rule in x."""
    T = np.atleast_1d(np.asarray(T, dtype=float))
    out = []
    for t in T:
        xD = theta / t
        x = (np.arange(n) + 0.5) * xD / n
        f = x**4 * np.exp(x) / np.expm1(x) ** 2
        out.append(9 * R * (t / theta) ** 3 * np.sum(f) * xD / n)
    return np.array(out)

def debye_u(T, theta, n=4000):
    """Thermal energy U(T) - U(0) per mole (J/mol)."""
    xD = theta / T
    x = (np.arange(n) + 0.5) * xD / n
    return 9 * R * T * (T / theta) ** 3 * np.sum(x**3 / np.expm1(x)) * xD / n

if __name__ == "__main__":
    print("Counting allowed k points in a sphere (radius M in units of 2 pi / L):")
    for M in (5, 10, 20, 40):
        c, f = count_k_points(M)
        print(f"  M = {M:3d}: lattice points {c:8d}, (4/3) pi M^3 = {f:10.1f}, ratio {c / f:.4f}")
    A = 12 * np.pi**4 / 5 * R
    print(f"\\nT^3-law coefficient (12 pi^4/5) R = {A:.1f} J mol^-1 K^-1")
    print(f"integral_0^inf x^3/(e^x-1) dx = pi^4/15 = {np.pi**4 / 15:.6f}")
    theta = 343.0      # Debye temperature of copper (K)
    print(f"\\nDebye solid with theta_D = {theta} K (copper):")
    for T in (5, 10, 20, 40, 100, 200, 300, 1000):
        cv = debye_cv(T, theta)[0]
        low = A * (T / theta) ** 3
        print(f"  T = {T:5d} K: C_V = {cv:8.4f} J/mol/K   T^3 law = {low:9.4f}   C_V/3R = {cv / (3 * R):.4f}")
    # cooling 1 kg of copper from 300 K to 77 K: enthalpy released (C_p ~ C_V for solids)
    M_cu = 63.546e-3
    dU = debye_u(300.0, theta) - debye_u(77.0, theta)
    print(f"\\nCooling copper 300 K -> 77 K: Debye  dH = {dU / M_cu / 1e3:.1f} kJ/kg;"
          f"  Dulong-Petit 3R dT = {3 * R * 223 / M_cu / 1e3:.1f} kJ/kg")
`;

// ── matlab/wk12_debye_heat.m ─────────────────
export const ML_DEBYE = `% Week 12 - Debye model: k-point counting and the T^3 law
% Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
function wk12_debye_heat()
    R = 8.314462618;
    for M = [5 10 20 40]
        n = -M:M; [a, b, c] = ndgrid(n, n, n);
        fprintf('M = %2d: points %d, (4/3)pi M^3 = %.1f\\n', M, nnz(a.^2 + b.^2 + c.^2 <= M^2), 4/3*pi*M^3);
    end
    A = 12*pi^4/5*R; th = 343; fprintf('T^3 coefficient = %.1f J/mol/K\\n', A);
    for T = [5 10 20 40 100 200 300 1000]
        fprintf('T = %5d K: C_V = %8.4f, T^3 law %10.4f\\n', T, debyeCv(T, th), A*(T/th)^3);
    end
    dU = debyeU(300, th) - debyeU(77, th);
    fprintf('Cu 300->77 K: Debye %.1f kJ/kg, Dulong-Petit %.1f kJ/kg\\n', dU/63.546e-3/1e3, 3*R*223/63.546e-3/1e3);
end
function c = debyeCv(T, th)
    R = 8.314462618; n = 4000; xD = th/T; x = ((1:n) - 0.5)*xD/n;
    c = 9*R*(T/th)^3*sum(x.^4.*exp(x)./expm1(x).^2)*xD/n;
end
function u = debyeU(T, th)
    R = 8.314462618; n = 4000; xD = th/T; x = ((1:n) - 0.5)*xD/n;
    u = 9*R*T*(T/th)^3*sum(x.^3./expm1(x))*xD/n;
end
`;

// ── julia/wk12_debye_heat.jl ─────────────────
export const JL_DEBYE = `# Week 12 - Debye model: k-point counting and the T^3 law
# Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
using Printf
const R = 8.314462618
function debye_cv(T, th; n=4000)
    xD = th / T; x = ((1:n) .- 0.5) .* xD ./ n
    9R * (T / th)^3 * sum(@. x^4 * exp(x) / expm1(x)^2) * xD / n
end
function debye_u(T, th; n=4000)
    xD = th / T; x = ((1:n) .- 0.5) .* xD ./ n
    9R * T * (T / th)^3 * sum(@. x^3 / expm1(x)) * xD / n
end
for M in (5, 10, 20, 40)
    c = count(i^2 + j^2 + k^2 <= M^2 for i in -M:M, j in -M:M, k in -M:M)
    @printf("M = %2d: points %d, (4/3)pi M^3 = %.1f\\n", M, c, 4 / 3 * pi * M^3)
end
A = 12pi^4 / 5 * R; th = 343.0
@printf("T^3 coefficient = %.1f J/mol/K\\n", A)
for T in (5, 10, 20, 40, 100, 200, 300, 1000)
    @printf("T = %5d K: C_V = %8.4f, T^3 law %10.4f\\n", T, debye_cv(T, th), A * (T / th)^3)
end
dU = debye_u(300.0, th) - debye_u(77.0, th)
@printf("Cu 300->77 K: Debye %.1f kJ/kg, Dulong-Petit %.1f kJ/kg\\n", dU / 63.546e-3 / 1e3, 3R * 223 / 63.546e-3 / 1e3)
`;

// ── cpp/wk12_debye_heat.cpp ─────────────────
export const CPP_DEBYE = `// Week 12 - Debye model: k-point counting and the T^3 law
// Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
// C_V = 9R (T/thD)^3 Int_0^{thD/T} x^4 e^x/(e^x-1)^2 dx ;  low T: (12 pi^4/5) R (T/thD)^3
// Build: g++ -O2 -std=c++17 wk12_debye_heat.cpp -o debye
#include <cmath>
#include <cstdio>
#include <initializer_list>
const double R = 8.314462618, PI = 3.14159265358979323846;
double debyeCv(double T, double th, int n = 4000) {
    double xD = th / T, s = 0;
    for (int i = 0; i < n; ++i) { double x = (i + 0.5) * xD / n; s += std::pow(x, 4) * std::exp(x) / std::pow(std::expm1(x), 2); }
    return 9 * R * std::pow(T / th, 3) * s * xD / n;
}
double debyeU(double T, double th, int n = 4000) {
    double xD = th / T, s = 0;
    for (int i = 0; i < n; ++i) { double x = (i + 0.5) * xD / n; s += x * x * x / std::expm1(x); }
    return 9 * R * T * std::pow(T / th, 3) * s * xD / n;
}
int main() {
    for (int M : {5, 10, 20, 40}) {
        long c = 0;
        for (int i = -M; i <= M; ++i) for (int j = -M; j <= M; ++j) for (int k = -M; k <= M; ++k) if (i * i + j * j + k * k <= M * M) ++c;
        std::printf("M = %2d: points %ld, (4/3)pi M^3 = %.1f\\n", M, c, 4.0 / 3 * PI * M * M * M);
    }
    double A = 12 * std::pow(PI, 4) / 5 * R, th = 343;
    std::printf("T^3 coefficient = %.1f J/mol/K\\n", A);
    for (double T : {5.0, 10.0, 20.0, 40.0, 100.0, 200.0, 300.0, 1000.0})
        std::printf("T = %6.0f K: C_V = %8.4f, T^3 law %10.4f, C_V/3R = %.4f\\n", T, debyeCv(T, th), A * std::pow(T / th, 3), debyeCv(T, th) / (3 * R));
    double dU = debyeU(300, th) - debyeU(77, th);
    std::printf("Cu 300->77 K: Debye %.1f kJ/kg, Dulong-Petit %.1f kJ/kg\\n", dU / 63.546e-3 / 1e3, 3 * R * 223 / 63.546e-3 / 1e3);
    return 0;
}
`;

// ── python/wk12_tight_binding.py ─────────────────
export const PY_TB = `"""
Week 12 - Tight-binding band of a 1D crystal (LCAO)
Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)

H_nm = eps0 delta_nm - t (delta_{n,m+1} + delta_{n,m-1}),  periodic ring of N atoms.
Bloch trial c_n = exp(i k n a)/sqrt(N)  ->  E(k) = eps0 - 2 t cos(k a),  k = 2 pi p / (N a).
Band width 4t; near k = 0, E ~ eps0 - 2t + t a^2 k^2  ->  m* = hbar^2 / (2 t a^2).
Band energy with f electrons per atom (two spins), relative to N f eps0:
  dE / N = -(4 t / pi) sin(pi f / 2)     (maximal binding at half filling, f = 1; zero for f = 2)
"""
import numpy as np

HBAR2_ME = 7.619964   # hbar^2 / m_e in eV * Angstrom^2

def ring_hamiltonian(N, eps0=0.0, t=1.0):
    H = eps0 * np.eye(N)
    for n in range(N):
        H[n, (n + 1) % N] = H[(n + 1) % N, n] = -t
    return H

def band_energy_per_site(f, t=1.0, N=2000):
    """Fill the lowest N*f/2 orbitals with 2 electrons each (numerical, ring of N sites)."""
    E = np.sort(np.linalg.eigvalsh(ring_hamiltonian(N, 0.0, t))) if N <= 600 else \\
        np.sort(-2 * t * np.cos(2 * np.pi * np.arange(N) / N))
    nocc = int(round(N * f / 2))
    return 2 * np.sum(E[:nocc]) / N

if __name__ == "__main__":
    N, t = 12, 1.0
    num = np.sort(np.linalg.eigvalsh(ring_hamiltonian(N, 0.0, t)))
    ana = np.sort(-2 * t * np.cos(2 * np.pi * np.arange(N) / N))
    print(f"Ring of N = {N}: max |numerical - analytic| = {np.max(np.abs(num - ana)):.2e}")
    print("  eigenvalues:", np.round(num, 4))
    print(f"  band width = {num.max() - num.min():.4f} t (expect 4t)")
    for a, tt in ((2.5, 1.0), (3.0, 0.5), (2.5, 2.0)):
        print(f"Effective mass m*/m_e for t = {tt} eV, a = {a} A: {HBAR2_ME / (2 * tt * a**2):.3f}")
    print("\\nBand energy per site (two spins), units of t:")
    for f in (0.25, 0.5, 1.0, 1.5, 2.0):
        print(f"  f = {f:4.2f} electrons/atom: numerical {band_energy_per_site(f, N=400):+.4f},"
              f"  analytic {-(4 / np.pi) * np.sin(np.pi * f / 2):+.4f}")
    # band formation: t decays with spacing a
    print("\\nBand edges eps0 +/- 2t for t(a) = 2 exp(-(a - 1.5)/0.5) eV:")
    for a in (1.5, 2.0, 3.0, 4.0):
        ta = 2 * np.exp(-(a - 1.5) / 0.5)
        print(f"  a = {a:.1f} A: t = {ta:.3f} eV, band from {-2 * ta:+.3f} to {2 * ta:+.3f} eV")
`;

// ── matlab/wk12_tight_binding.m ─────────────────
export const ML_TB = `% Week 12 - 1D tight-binding band E(k) = eps0 - 2t cos(ka)
% Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
function wk12_tight_binding()
    N = 12; t = 1; H = zeros(N);
    for n = 1:N, m = mod(n, N) + 1; H(n, m) = -t; H(m, n) = -t; end
    e = sort(eig(H)); a = sort(-2*t*cos(2*pi*(0:N-1)'/N));
    fprintf('N = %d: max error %.2e, band width %.4f t\\n', N, max(abs(e - a)), e(end) - e(1));
    fprintf('m*/m_e (t = 1 eV, a = 2.5 A) = %.3f\\n', 7.619964/(2*1*2.5^2));
    for f = [0.25 0.5 1 1.5 2], fprintf('f = %.2f: band energy %+.4f t\\n', f, -(4/pi)*sin(pi*f/2)); end
    k = linspace(-pi, pi, 200); figure; plot(k, -2*t*cos(k), 'LineWidth', 1.5); xlabel('ka'); ylabel('E/t'); grid on;
end
`;

// ── julia/wk12_tight_binding.jl ─────────────────
export const JL_TB = `# Week 12 - 1D tight-binding band E(k) = eps0 - 2t cos(ka)
# Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
using LinearAlgebra, Printf
N = 12; t = 1.0
H = zeros(N, N)
for n in 1:N
    m = mod(n, N) + 1; H[n, m] = -t; H[m, n] = -t
end
e = sort(eigvals(Symmetric(H))); a = sort([-2t * cos(2pi * p / N) for p in 0:N-1])
@printf("N = %d: max error %.2e, band width %.4f t\\n", N, maximum(abs.(e .- a)), e[end] - e[1])
@printf("m*/m_e (t = 1 eV, a = 2.5 A) = %.3f\\n", 7.619964 / (2 * 1.0 * 2.5^2))
for f in (0.25, 0.5, 1.0, 1.5, 2.0)
    @printf("f = %.2f: band energy per site %+.4f t\\n", f, -(4 / pi) * sin(pi * f / 2))
end
`;

// ── cpp/wk12_tight_binding.cpp ─────────────────
export const CPP_TB = `// Week 12 - 1D tight-binding band: E(k) = eps0 - 2t cos(ka)
// Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
// Ring of N sites diagonalized with Jacobi rotations and compared with the Bloch result.
// Build: g++ -O2 -std=c++17 wk12_tight_binding.cpp -o tb
#include <cmath>
#include <cstdio>
#include <vector>
#include <algorithm>
#include <initializer_list>
const double PI = 3.14159265358979323846, HBAR2_ME = 7.619964;
using Mat = std::vector<std::vector<double>>;
std::vector<double> jacobi(Mat A) {
    int n = A.size();
    for (int sw = 0; sw < 100; ++sw) {
        double off = 0; for (int p = 0; p < n; ++p) for (int q = p + 1; q < n; ++q) off += A[p][q] * A[p][q];
        if (off < 1e-24) break;
        for (int p = 0; p < n; ++p) for (int q = p + 1; q < n; ++q) {
            if (std::fabs(A[p][q]) < 1e-300) continue;
            double th = 0.5 * std::atan2(2 * A[p][q], A[q][q] - A[p][p]), c = std::cos(th), s = std::sin(th);
            for (int k = 0; k < n; ++k) { double a = A[k][p], b = A[k][q]; A[k][p] = c * a - s * b; A[k][q] = s * a + c * b; }
            for (int k = 0; k < n; ++k) { double a = A[p][k], b = A[q][k]; A[p][k] = c * a - s * b; A[q][k] = s * a + c * b; }
        }
    }
    std::vector<double> e(n); for (int i = 0; i < n; ++i) e[i] = A[i][i]; std::sort(e.begin(), e.end()); return e;
}
int main() {
    int N = 12; double t = 1.0;
    Mat H(N, std::vector<double>(N, 0));
    for (int n = 0; n < N; ++n) { H[n][(n + 1) % N] = -t; H[(n + 1) % N][n] = -t; }
    auto e = jacobi(H); std::vector<double> a;
    for (int p = 0; p < N; ++p) a.push_back(-2 * t * std::cos(2 * PI * p / N));
    std::sort(a.begin(), a.end());
    double err = 0; for (int i = 0; i < N; ++i) err = std::fmax(err, std::fabs(e[i] - a[i]));
    std::printf("N = %d ring: max error %.2e, band width %.4f t\\n", N, err, e.back() - e.front());
    std::printf("m*/m_e (t = 1 eV, a = 2.5 A) = %.3f\\n", HBAR2_ME / (2 * 1.0 * 2.5 * 2.5));
    for (double f : {0.25, 0.5, 1.0, 1.5, 2.0}) std::printf("f = %.2f: band energy per site %+.4f t\\n", f, -(4 / PI) * std::sin(PI * f / 2));
    return 0;
}
`;

// ── python/wk12_diatomic_band.py ─────────────────
export const PY_GAP = `"""
Week 12 - Two atoms per unit cell: opening a band gap at the Brillouin-zone boundary
Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)

(a) Different site energies eps_A, eps_B, equal hopping t (cell length a, two atoms per cell):
    H(k) = [[eps_A, -t(1 + e^{-ika})], [c.c., eps_B]]
    E_pm(k) = ebar +/- sqrt(D^2 + 4 t^2 cos^2(ka/2)),  ebar = (eps_A+eps_B)/2, D = (eps_A-eps_B)/2
    gap at k = pi/a:  E_g = |eps_A - eps_B|
(b) Equal sites, alternating hopping t1, t2 (bond alternation, as in polyacetylene):
    E_pm(k) = +/- |t1 + t2 e^{-ika}|,   gap at k = pi/a:  E_g = 2 |t1 - t2|
Checks: diagonalize finite rings and compare with the formulas.
"""
import numpy as np

def ring(eps, hops):
    """Ring Hamiltonian with site energies eps[n] and hopping hops[n] between n and n+1."""
    N = len(eps); H = np.diag(np.asarray(eps, dtype=float))
    for n in range(N):
        H[n, (n + 1) % N] = H[(n + 1) % N, n] = -hops[n]
    return np.sort(np.linalg.eigvalsh(H))

def bands_sites(k, eA, eB, t):
    eb, D = 0.5 * (eA + eB), 0.5 * (eA - eB)
    r = np.sqrt(D**2 + 4 * t**2 * np.cos(k / 2) ** 2)
    return eb - r, eb + r

def bands_hops(k, t1, t2):
    r = np.abs(t1 + t2 * np.exp(-1j * k))
    return -r, r

if __name__ == "__main__":
    Nc = 40
    ks = 2 * np.pi * np.arange(Nc) / Nc
    eA, eB, t = 0.5, -0.5, 1.0
    num = ring(np.tile([eA, eB], Nc), np.full(2 * Nc, t))
    lo, hi = bands_sites(ks, eA, eB, t)
    ana = np.sort(np.concatenate([lo, hi]))
    print(f"(a) site energies {eA}, {eB}, t = {t}: max error {np.max(np.abs(num - ana)):.2e}")
    lo, hi = bands_sites(np.pi, eA, eB, t)
    print(f"    gap at k = pi/a: {hi - lo:.4f} (expect |eA - eB| = {abs(eA - eB):.4f}); "
          f"total width {2 * np.sqrt(0.25 + 4):.4f}")
    t1, t2 = 1.1, 0.9
    num = ring(np.zeros(2 * Nc), np.tile([t1, t2], Nc))
    lo, hi = bands_hops(ks, t1, t2)
    ana = np.sort(np.concatenate([lo, hi]))
    print(f"(b) alternating hopping {t1}, {t2}: max error {np.max(np.abs(num - ana)):.2e}")
    lo, hi = bands_hops(np.pi, t1, t2)
    print(f"    gap at k = pi/a: {hi - lo:.4f} (expect 2|t1 - t2| = {2 * abs(t1 - t2):.4f})")
    print("\\nWith one electron per atom the lower band is exactly full -> insulator / semiconductor.")
    for d in (0.0, 0.05, 0.1, 0.2):
        print(f"  bond alternation t1 = 1 + {d}, t2 = 1 - {d}: gap = {4 * d:.2f} t0")
`;

// ── matlab/wk12_diatomic_band.m ─────────────────
export const ML_GAP = `% Week 12 - Two atoms per cell: band gap at the zone boundary
% Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
function wk12_diatomic_band()
    eA = 0.5; eB = -0.5; t = 1; k = linspace(-pi, pi, 400);
    eb = (eA + eB)/2; D = (eA - eB)/2; r = sqrt(D^2 + 4*t^2*cos(k/2).^2);
    fprintf('(a) gap %.4f (|eA - eB| = %.4f)\\n', 2*sqrt(D^2 + 4*t^2*cos(pi/2)^2), abs(eA - eB));
    t1 = 1.1; t2 = 0.9; rb = abs(t1 + t2*exp(-1i*k));
    fprintf('(b) gap %.4f (2|t1 - t2| = %.4f)\\n', 2*abs(t1 + t2*exp(-1i*pi)), 2*abs(t1 - t2));
    figure; plot(k, eb - r, 'b', k, eb + r, 'b', k, -rb, 'r--', k, rb, 'r--', 'LineWidth', 1.5);
    xlabel('ka'); ylabel('E/t'); legend('site energies', '', 'alternating hopping', ''); grid on;
end
`;

// ── julia/wk12_diatomic_band.jl ─────────────────
export const JL_GAP = `# Week 12 - Two atoms per cell: band gap at the zone boundary
# Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
using Printf
eA, eB, t = 0.5, -0.5, 1.0
D = (eA - eB) / 2
@printf("(a) gap %.4f (|eA - eB| = %.4f)\\n", 2sqrt(D^2 + 4t^2 * cos(pi / 2)^2), abs(eA - eB))
t1, t2 = 1.1, 0.9
@printf("(b) gap %.4f (2|t1 - t2| = %.4f)\\n", 2abs(t1 + t2 * exp(-im * pi)), 2abs(t1 - t2))
for d in (0.0, 0.05, 0.1, 0.2)
    @printf("    t1 = 1 + %.2f, t2 = 1 - %.2f: gap %.2f t0\\n", d, d, 4d)
end
`;

// ── cpp/wk12_diatomic_band.cpp ─────────────────
export const CPP_GAP = `// Week 12 - Two atoms per cell: band gap at the zone boundary
// Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
// (a) site energies eA, eB:  E = ebar +/- sqrt(D^2 + 4t^2 cos^2(ka/2)),  gap |eA - eB|
// (b) alternating hopping t1, t2:  E = +/- |t1 + t2 e^{-ika}|,  gap 2|t1 - t2|
// Build: g++ -O2 -std=c++17 wk12_diatomic_band.cpp -o dimer
#include <cmath>
#include <complex>
#include <cstdio>
#include <initializer_list>
const double PI = 3.14159265358979323846;
int main() {
    double eA = 0.5, eB = -0.5, t = 1.0, eb = 0.5 * (eA + eB), D = 0.5 * (eA - eB);
    double rZB = std::sqrt(D * D + 4 * t * t * std::pow(std::cos(PI / 2), 2));
    std::printf("(a) gap at k = pi/a: %.4f (|eA - eB| = %.4f)\\n", 2 * rZB, std::fabs(eA - eB));
    double t1 = 1.1, t2 = 0.9;
    double r = std::abs(std::complex<double>(t1, 0) + t2 * std::exp(std::complex<double>(0, -PI)));
    std::printf("(b) gap at k = pi/a: %.4f (2|t1 - t2| = %.4f)\\n", 2 * r, 2 * std::fabs(t1 - t2));
    for (double d : {0.0, 0.05, 0.1, 0.2}) std::printf("    t1 = 1 + %.2f, t2 = 1 - %.2f: gap %.2f t0\\n", d, d, 4 * d);
    return 0;
}
`;
