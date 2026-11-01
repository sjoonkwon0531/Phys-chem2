/* ============================================================
   Week10Codes.js — Physical Chemistry 2, Week 10
   Raw code samples: Statistical Mechanics & Phase Separation
   - 4 topics: boltzmann_exchange, partition_thermo,
               lattice_mixing, cahn_hilliard
   - 4 languages: Python, MATLAB, Julia, C++
   Imported by Week10App.jsx > RawCodes tab.
   Auto-generated from codes/ — edit the standalone files, then regenerate.
   ============================================================ */

// ── python/wk10_boltzmann_exchange.py ─────────────────
export const PY_BOLTZ = `"""
Wk10 — Where the Boltzmann distribution comes from
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Stirling:  ln N! ~ N ln N - N   (relative error -> 0 as N grows)
(2) Exact counting (Einstein solid): N oscillators share Q quanta.
    Probability that one oscillator holds n quanta:
        P(n) = C(Q - n + N - 2, N - 2) / C(Q + N - 1, N - 1)
    For large N it becomes the Boltzmann (geometric) law
        P(n) = (1 - x) x^n,   x = exp(-beta*eps) = Q / (Q + N)
(3) Energy-exchange game: random pairs pass one quantum at a time.
    Whatever the start, the histogram relaxes to exp(-beta*eps).
(4) beta from the slope: ln P(n) = const - beta*eps*n,
    and 1/beta = kT agrees with d(ln W)/dE = beta  (lecture p. 7).

Run:  python wk10_boltzmann_exchange.py     (~5 s)
"""
import numpy as np
from math import lgamma, log, exp

rng = np.random.default_rng(10)

# -- (1) Stirling ------------------------------------------------
print("(1) Stirling: ln N!  vs  N ln N - N")
print("        N        ln N!            N lnN - N        rel. error")
for N in (10, 100, 1000, 10**6):
    exact = lgamma(N + 1)
    approx = N * log(N) - N
    print(f"  {N:8d}   {exact:14.4f}   {approx:14.4f}     {(exact-approx)/exact:9.2e}")

# -- (2) exact counting vs Boltzmann -------------------------------
def lnC(n, k):
    return lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1)

print("\\n(2) Einstein solid, <n> = Q/N = 1  ->  Boltzmann x = 1/2")
print("     n   N=10 exact   N=100 exact   N=1000 exact   Boltzmann (1-x)x^n")
for n in range(0, 7):
    row = []
    for N in (10, 100, 1000):
        Q = N
        row.append(exp(lnC(Q - n + N - 2, N - 2) - lnC(Q + N - 1, N - 1)))
    print(f"    {n:2d}    {row[0]:.5f}      {row[1]:.5f}       {row[2]:.5f}        {0.5*0.5**n:.5f}")

# -- (3) energy-exchange game -------------------------------------
N, q0, sweeps = 2000, 2, 400
n = np.full(N, q0)                      # everyone starts with the SAME energy
hist = np.zeros(15)
for sweep in range(sweeps):
    pairs = rng.integers(N, size=(N, 2))
    for i, j in pairs:
        if i != j and n[i] > 0:
            n[i] -= 1; n[j] += 1
    if sweep >= sweeps // 2:             # average snapshots after equilibration
        hist += np.bincount(n, minlength=15)[:15]
hist = hist / (N * (sweeps - sweeps // 2))
x = q0 / (q0 + 1.0)                     # <n> = x/(1-x) = q0
print(f"\\n(3) exchange game: N = {N}, start n = {q0} for all, {sweeps} sweeps (second half averaged)")
print("     n   simulation   Boltzmann")
for k in range(8):
    print(f"    {k:2d}    {hist[k]:.4f}       {(1-x)*x**k:.4f}")
nz = hist[:10] > 0
slope = np.polyfit(np.arange(10)[nz], np.log(hist[:10][nz]), 1)[0]
print(f"    fitted beta*eps = {-slope:.3f}   exact ln((q0+1)/q0) = {np.log((q0+1)/q0):.3f}")
print(f"    total energy conserved: {n.sum()} = {N*q0}")

# -- (4) beta = d ln W / dE  (Einstein solid) ------------------------
N = 1000
for Q in (500, 1000, 2000):
    dlnW = lnC(Q + 1 + N - 1, N - 1) - lnC(Q + N - 1, N - 1)   # ln W(Q+1) - ln W(Q)
    print(f"(4) N = {N}, Q = {Q}:  d lnW/dQ = {dlnW:.4f}   ln((Q+N)/Q) = {np.log((Q+N)/Q):.4f}   (= beta*eps)")
`;

// ── matlab/wk10_boltzmann_exchange.m ─────────────────
export const ML_BOLTZ = `% Wk10 — Where the Boltzmann distribution comes from
% Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
%
% (1) Stirling: ln N! ~ N ln N - N
% (2) Einstein solid: P(n) = C(Q-n+N-2, N-2)/C(Q+N-1, N-1) -> (1-x) x^n, x = Q/(Q+N)
% (3) Energy-exchange game relaxes to exp(-beta eps)
% (4) beta = d ln W / dE
%
% Run:  wk10_boltzmann_exchange     (~20 s)
clear; rng(10);
lnC = @(n, k) gammaln(n + 1) - gammaln(k + 1) - gammaln(n - k + 1);

fprintf('(1) Stirling: ln N!  vs  N ln N - N\\n');
for N = [10 100 1000 1e6]
    ex = gammaln(N + 1); ap = N*log(N) - N;
    fprintf('  %10.0f   %16.4f   %16.4f   rel. error %9.2e\\n', N, ex, ap, (ex - ap)/ex);
end

fprintf('\\n(2) Einstein solid, <n> = 1 -> Boltzmann x = 1/2\\n     n   N=10      N=100     N=1000    Boltzmann\\n');
for n = 0:6
    fprintf('    %2d', n);
    for N = [10 100 1000]
        Q = N; fprintf('   %.5f', exp(lnC(Q - n + N - 2, N - 2) - lnC(Q + N - 1, N - 1)));
    end
    fprintf('   %.5f\\n', 0.5*0.5^n);
end

N = 2000; q0 = 2; sweeps = 400;
e = q0*ones(N, 1); hist = zeros(15, 1);
for s = 1:sweeps
    pairs = randi(N, N, 2);
    for k = 1:N
        i = pairs(k, 1); j = pairs(k, 2);
        if i ~= j && e(i) > 0, e(i) = e(i) - 1; e(j) = e(j) + 1; end
    end
    if s > sweeps/2, hist = hist + accumarray(min(e, 14) + 1, 1, [15 1]); end
end
hist = hist / (N*sweeps/2); x = q0/(q0 + 1);
fprintf('\\n(3) exchange game: N = %d, start n = %d\\n     n   simulation   Boltzmann\\n', N, q0);
for k = 0:7, fprintf('    %2d    %.4f       %.4f\\n', k, hist(k + 1), (1 - x)*x^k); end
pf = polyfit((0:9)', log(hist(1:10)), 1);
fprintf('    fitted beta*eps = %.3f   exact ln((q0+1)/q0) = %.3f\\n', -pf(1), log((q0 + 1)/q0));

for Q = [500 1000 2000]
    Nn = 1000; d = lnC(Q + 1 + Nn - 1, Nn - 1) - lnC(Q + Nn - 1, Nn - 1);
    fprintf('(4) N = 1000, Q = %d: d lnW/dQ = %.4f   ln((Q+N)/Q) = %.4f\\n', Q, d, log((Q + Nn)/Q));
end
`;

// ── julia/wk10_boltzmann_exchange.jl ─────────────────
export const JL_BOLTZ = `# Wk10 — Where the Boltzmann distribution comes from
# Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
#
# (1) Stirling: ln N! ~ N ln N - N
# (2) Einstein solid: P(n) = C(Q-n+N-2, N-2)/C(Q+N-1, N-1) -> (1-x) x^n, x = Q/(Q+N)
# (3) Energy-exchange game relaxes to exp(-beta eps)
# (4) beta = d ln W / dE
#
# Run:  julia wk10_boltzmann_exchange.jl      (needs SpecialFunctions: ] add SpecialFunctions)
using Printf, Random, SpecialFunctions
Random.seed!(10)
lnC(n, k) = loggamma(n + 1) - loggamma(k + 1) - loggamma(n - k + 1)

println("(1) Stirling: ln N!  vs  N ln N - N")
for N in (10.0, 100.0, 1000.0, 1e6)
    ex = loggamma(N + 1); ap = N * log(N) - N
    @printf("  %10.0f   %16.4f   %16.4f   rel. error %9.2e\\n", N, ex, ap, (ex - ap) / ex)
end

println("\\n(2) Einstein solid, <n> = 1 -> Boltzmann x = 1/2\\n     n   N=10      N=100     N=1000    Boltzmann")
for n in 0:6
    @printf("    %2d", n)
    for N in (10.0, 100.0, 1000.0)
        Q = N; @printf("   %.5f", exp(lnC(Q - n + N - 2, N - 2) - lnC(Q + N - 1, N - 1)))
    end
    @printf("   %.5f\\n", 0.5 * 0.5^n)
end

function exchange(N, q0, sweeps)
    e = fill(q0, N); hist = zeros(15)
    for s in 1:sweeps
        for _ in 1:N
            i, j = rand(1:N), rand(1:N)
            if i != j && e[i] > 0
                e[i] -= 1; e[j] += 1
            end
        end
        if s > sweeps ÷ 2
            for v in e
                v < 15 && (hist[v+1] += 1)
            end
        end
    end
    hist ./ (N * (sweeps - sweeps ÷ 2))
end
N, q0 = 2000, 2
hist = exchange(N, q0, 400); x = q0 / (q0 + 1)
@printf("\\n(3) exchange game: N = %d, start n = %d\\n     n   simulation   Boltzmann\\n", N, q0)
for k in 0:7
    @printf("    %2d    %.4f       %.4f\\n", k, hist[k+1], (1 - x) * x^k)
end
ks = collect(0:9); ys = log.(hist[1:10])
mk, my = sum(ks) / 10, sum(ys) / 10
slope = sum((ks .- mk) .* (ys .- my)) / sum((ks .- mk) .^ 2)
@printf("    fitted beta*eps = %.3f   exact ln((q0+1)/q0) = %.3f\\n", -slope, log((q0 + 1) / q0))

for Q in (500.0, 1000.0, 2000.0)
    Nn = 1000.0; d = lnC(Q + 1 + Nn - 1, Nn - 1) - lnC(Q + Nn - 1, Nn - 1)
    @printf("(4) N = 1000, Q = %.0f: d lnW/dQ = %.4f   ln((Q+N)/Q) = %.4f\\n", Q, d, log((Q + Nn) / Q))
end
`;

// ── cpp/wk10_boltzmann_exchange.cpp ─────────────────
export const CPP_BOLTZ = `// Wk10 — Where the Boltzmann distribution comes from
// Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
//
// (1) Stirling: ln N! ~ N ln N - N
// (2) Einstein solid: P(n) = C(Q-n+N-2, N-2)/C(Q+N-1, N-1) -> (1-x) x^n, x = Q/(Q+N)
// (3) Energy-exchange game relaxes to exp(-beta eps)
// (4) beta = d ln W / dE
//
// Build:  g++ -O2 -std=c++17 wk10_boltzmann_exchange.cpp -o wk10_boltzmann_exchange
#include <cstdio>
#include <cmath>
#include <vector>
#include <random>

double lnC(double n, double k) { return std::lgamma(n + 1) - std::lgamma(k + 1) - std::lgamma(n - k + 1); }

int main() {
    std::printf("(1) Stirling: ln N!  vs  N ln N - N\\n");
    for (double N : {10.0, 100.0, 1000.0, 1e6}) {
        double ex = std::lgamma(N + 1), ap = N * std::log(N) - N;
        std::printf("  %10.0f   %16.4f   %16.4f   rel. error %9.2e\\n", N, ex, ap, (ex - ap) / ex);
    }
    std::printf("\\n(2) Einstein solid, <n> = 1 -> Boltzmann x = 1/2\\n     n   N=10      N=100     N=1000    Boltzmann\\n");
    for (int n = 0; n < 7; ++n) {
        std::printf("    %2d", n);
        for (double N : {10.0, 100.0, 1000.0}) {
            double Q = N;
            std::printf("   %.5f", std::exp(lnC(Q - n + N - 2, N - 2) - lnC(Q + N - 1, N - 1)));
        }
        std::printf("   %.5f\\n", 0.5 * std::pow(0.5, n));
    }
    // (3) exchange game
    std::mt19937_64 rng(10);
    const int N = 2000, q0 = 2, sweeps = 400;
    std::uniform_int_distribution<int> pick(0, N - 1);
    std::vector<int> e(N, q0);
    std::vector<double> hist(15, 0.0);
    for (int s = 0; s < sweeps; ++s) {
        for (int k = 0; k < N; ++k) {
            int i = pick(rng), j = pick(rng);
            if (i != j && e[i] > 0) { e[i]--; e[j]++; }
        }
        if (s >= sweeps / 2) for (int v : e) if (v < 15) hist[v] += 1.0;
    }
    double norm = double(N) * (sweeps - sweeps / 2);
    double x = q0 / (q0 + 1.0);
    std::printf("\\n(3) exchange game: N = %d, start n = %d, second half averaged\\n     n   simulation   Boltzmann\\n", N, q0);
    for (int k = 0; k < 8; ++k) std::printf("    %2d    %.4f       %.4f\\n", k, hist[k] / norm, (1 - x) * std::pow(x, k));
    double sx = 0, sy = 0, sxx = 0, sxy = 0; int m = 10;
    for (int k = 0; k < m; ++k) { double y = std::log(hist[k] / norm); sx += k; sy += y; sxx += k * k; sxy += k * y; }
    double slope = (m * sxy - sx * sy) / (m * sxx - sx * sx);
    std::printf("    fitted beta*eps = %.3f   exact ln((q0+1)/q0) = %.3f\\n", -slope, std::log((q0 + 1.0) / q0));
    // (4)
    for (double Q : {500.0, 1000.0, 2000.0}) {
        double Nn = 1000, d = lnC(Q + 1 + Nn - 1, Nn - 1) - lnC(Q + Nn - 1, Nn - 1);
        std::printf("(4) N = 1000, Q = %.0f: d lnW/dQ = %.4f   ln((Q+N)/Q) = %.4f\\n", Q, d, std::log((Q + Nn) / Q));
    }
    return 0;
}
`;

// ── python/wk10_partition_thermo.py ─────────────────
export const PY_PART = `"""
Wk10 — From the partition function to thermodynamics
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Two-level system (gap eps): Z = 1 + exp(-beta*eps)
      U = -d lnZ/d beta,  F = -kT lnZ,  S = (U - F)/T,
      C_V = dU/dT = sigma_E^2 / (k T^2)        (lecture p. 11)
    Schottky peak: C_max = 0.439 k at kT/eps = 0.417
(2) Fluctuations of N independent two-level units:
      sigma_E / <E>  ~  N^(-1/2)                (lecture p. 12)
(3) Diatomic molecules, q = q_T q_R q_V q_E      (lecture p. 19)
      q_T/V = 1/Lambda^3,  Lambda = h/(2 pi m kT)^(1/2)
      q_R = kT/(sigma h c B),  q_V = 1/(1 - exp(-h c nu/kT))  (ZPE excluded)
    Standard molar entropy at 298.15 K, 1 bar vs. CODATA key values
      S_trans = R [ln(q_T/N) + 5/2]      (Sackur-Tetrode)
      S_rot   = R [ln q_R + 1],  S_vib = R [x/(e^x - 1) - ln(1 - e^-x)],  S_el = R ln g0
(4) Grand canonical lattice gas (Langmuir): M sites, lambda = exp(beta mu)
      Xi = (1 + lambda q)^M,  theta = lambda q/(1 + lambda q),
      sigma_N^2 = kT d<N>/d mu = M theta (1 - theta)
(5) Ideal-gas chemical potential (translation only): mu = kT ln(n Lambda^3)

Run:  python wk10_partition_thermo.py
"""
import numpy as np

KB, H, C, NA, R = 1.380649e-23, 6.62607015e-34, 2.99792458e10, 6.02214076e23, 8.314462618  # C in cm/s
AMU = 1.66053906660e-27

# -- (1) two-level system -----------------------------------------
t = np.linspace(0.05, 3, 6000)            # t = kT/eps
beta = 1 / t
Z = 1 + np.exp(-beta)
U = np.exp(-beta) / Z                     # in units of eps
CV = np.gradient(U, t)                    # in units of k
var = np.exp(-beta) / Z - U**2            # <E^2> - <E>^2 in eps^2
CV_fluct = var / t**2
i = np.argmax(CV)
print("(1) two-level system")
print(f"    Schottky peak  C_max = {CV[i]:.4f} k  at kT/eps = {t[i]:.4f}")
print(f"    max |C_V(dU/dT) - sigma_E^2/kT^2| = {np.max(np.abs(CV - CV_fluct)[50:-50]):.2e}")
tb = 1e4; Zb = 1 + np.exp(-1 / tb); Ub = np.exp(-1 / tb) / Zb
print(f"    high-T limit (kT = 10^4 eps): S/k = {np.log(Zb) + Ub/tb:.4f} (ln 2 = {np.log(2):.4f}),  U/eps = {Ub:.4f} (1/2)\\n")

# -- (2) fluctuations shrink as N^-1/2 -------------------------------
p = np.exp(-1) / (1 + np.exp(-1))         # kT = eps: excitation probability
print("(2) N two-level units at kT = eps:  sigma_E/<E> = sqrt((1-p)/(N p))")
rng = np.random.default_rng(10)
for N in (10, 100, 1000, 10000, 10**6):
    E = rng.binomial(N, p, size=20000)
    print(f"    N = {N:>8d}:  simulated {E.std()/E.mean():.5f}   theory {np.sqrt((1-p)/(N*p)):.5f}")

# -- (3) diatomic partition functions and entropies ----------------
# NIST CCCBDB experimental constants (omega_e, B_e in cm^-1); sigma = symmetry number; g0 = ground electronic degeneracy
mols = {"N2": (28.0134, 2358.57, 1.998241, 2, 1, 191.609),
        "O2": (31.9988, 1580.161, 1.44562, 2, 3, 205.152),
        "CO": (28.0101, 2169.756, 1.931602, 1, 1, 197.660),
        "HCl": (36.461, 2990.925, 10.5933, 1, 1, 186.902),
        "I2": (253.809, 214.502, 0.037372, 2, 1, 260.687)}
T, p0 = 298.15, 1e5
print(f"\\n(3) diatomics at {T} K, 1 bar  (constants: NIST CCCBDB; S° reference: CODATA key values)")
print("     mol   Lambda[pm]  qT/N       qR       qV      S_tr   S_rot  S_vib  S_el   S_total  CODATA")
for name, (M, nu, B, sig, g0, Sref) in mols.items():
    m = M * AMU
    Lam = H / np.sqrt(2 * np.pi * m * KB * T)
    qT_N = (KB * T / p0) / Lam**3
    qR = KB * T / (sig * H * C * B)
    x = H * C * nu / (KB * T)
    qV = 1 / (1 - np.exp(-x))
    S_tr = R * (np.log(qT_N) + 2.5)
    S_rot = R * (np.log(qR) + 1)
    S_vib = R * (x / np.expm1(x) - np.log(1 - np.exp(-x)))
    S_el = R * np.log(g0)
    S = S_tr + S_rot + S_vib + S_el
    print(f"    {name:4s}  {Lam*1e12:8.3f}  {qT_N:.3e}  {qR:7.1f}  {qV:7.4f}  {S_tr:6.1f}  {S_rot:5.1f}  {S_vib:5.2f}  {S_el:5.2f}   {S:6.1f}   {Sref:6.1f}")
print("    -> rigid-rotor/harmonic-oscillator q reproduces S° to about 0.1-0.3 J/K/mol\\n")

# -- (4) grand canonical Langmuir lattice gas -----------------------
M = 1000
print("(4) Langmuir lattice gas, M = 1000 sites")
for bmu in (-2.0, 0.0, 2.0):             # beta*mu with q = 1
    theta = np.exp(bmu) / (1 + np.exp(bmu))
    h = 1e-5
    dN = M * (np.exp(bmu + h) / (1 + np.exp(bmu + h)) - np.exp(bmu - h) / (1 + np.exp(bmu - h))) / (2 * h)
    occ = rng.random((20000, M)) < theta if M <= 1000 else None
    simvar = occ.sum(1).var()
    print(f"    beta*mu = {bmu:+.1f}: theta = {theta:.4f},  kT d<N>/dmu = {dN:.2f},  M theta(1-theta) = {M*theta*(1-theta):.2f},  sampled var = {simvar:.1f}")

# -- (5) ideal-gas chemical potential -------------------------------
m = 28.0134 * AMU
Lam = H / np.sqrt(2 * np.pi * m * KB * T)
n = p0 / (KB * T)
print(f"\\n(5) N2 at {T} K, 1 bar: n Lambda^3 = {n*Lam**3:.3e}  (<< 1: classical gas)")
print(f"    mu_trans = kT ln(n Lambda^3) = {np.log(n*Lam**3):.2f} kT = {R*T*np.log(n*Lam**3)/1e3:.1f} kJ/mol")
`;

// ── matlab/wk10_partition_thermo.m ─────────────────
export const ML_PART = `% Wk10 — From the partition function to thermodynamics
% Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
%
% (1) two-level system: C_V = dU/dT = sigma_E^2/kT^2, Schottky peak
% (2) sigma_E/<E> ~ N^(-1/2)
% (3) diatomic q = qT qR qV qE and S° vs CODATA (constants: NIST CCCBDB)
% (4) Langmuir lattice gas: sigma_N^2 = kT d<N>/dmu = M theta(1-theta)
% (5) mu_trans = kT ln(n Lambda^3)
%
% Run:  wk10_partition_thermo
clear; rng(10);
KB = 1.380649e-23; H = 6.62607015e-34; C = 2.99792458e10; R = 8.314462618; AMU = 1.66053906660e-27;

t = linspace(0.05, 3, 6000); b = 1./t; Z = 1 + exp(-b);
U = exp(-b)./Z; CV = gradient(U, t); var = exp(-b)./Z - U.^2;
[cmax, i] = max(CV);
fprintf('(1) two-level: C_max = %.4f k at kT/eps = %.4f; max|dU/dT - sigma^2/kT^2| = %.1e\\n\\n', cmax, t(i), max(abs(CV(50:end-50) - var(50:end-50)./t(50:end-50).^2)));

p = exp(-1)/(1 + exp(-1));
fprintf('(2) sigma_E/<E> at kT = eps\\n');
for N = [10 100 1000 10000 1e6]
    E = binornd(N, p, 20000, 1);
    fprintf('    N = %8d: simulated %.5f  theory %.5f\\n', N, std(E)/mean(E), sqrt((1 - p)/(N*p)));
end

names = {'N2', 'O2', 'CO', 'HCl', 'I2'};
data = [28.0134 2358.57 1.998241 2 1 191.609; 31.9988 1580.161 1.44562 2 3 205.152;
        28.0101 2169.756 1.931602 1 1 197.660; 36.461 2990.925 10.5933 1 1 186.902;
        253.809 214.502 0.037372 2 1 260.687];
T = 298.15; p0 = 1e5;
fprintf('\\n(3) S° at 298.15 K, 1 bar\\n     mol    qR       qV      S_total   CODATA\\n');
for k = 1:5
    m = data(k, 1)*AMU; Lam = H/sqrt(2*pi*m*KB*T);
    qTN = (KB*T/p0)/Lam^3; qR = KB*T/(data(k, 4)*H*C*data(k, 3));
    x = H*C*data(k, 2)/(KB*T); qV = 1/(1 - exp(-x));
    S = R*(log(qTN) + 2.5) + R*(log(qR) + 1) + R*(x/expm1(x) - log(1 - exp(-x))) + R*log(data(k, 5));
    fprintf('    %-4s  %7.1f  %7.4f   %6.1f    %6.1f\\n', names{k}, qR, qV, S, data(k, 6));
end

fprintf('\\n(4) Langmuir, M = 1000\\n');
Nf = @(bmu) 1000*exp(bmu)./(1 + exp(bmu));
for bmu = [-2 0 2]
    th = exp(bmu)/(1 + exp(bmu)); h = 1e-5;
    fprintf('    beta mu = %+.1f: theta = %.4f, kT d<N>/dmu = %.2f, M theta(1-theta) = %.2f\\n', bmu, th, (Nf(bmu + h) - Nf(bmu - h))/(2*h), 1000*th*(1 - th));
end

m = 28.0134*AMU; Lam = H/sqrt(2*pi*m*KB*T); n = p0/(KB*T);
fprintf('\\n(5) N2: n Lambda^3 = %.3e, mu_trans = %.2f kT = %.1f kJ/mol\\n', n*Lam^3, log(n*Lam^3), R*T*log(n*Lam^3)/1e3);
`;

// ── julia/wk10_partition_thermo.jl ─────────────────
export const JL_PART = `# Wk10 — From the partition function to thermodynamics
# Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
#
# (1) two-level system: C_V = dU/dT = sigma_E^2/kT^2, Schottky peak
# (2) sigma_E/<E> ~ N^(-1/2)
# (3) diatomic q = qT qR qV qE and S° vs CODATA (constants: NIST CCCBDB)
# (4) Langmuir lattice gas: sigma_N^2 = kT d<N>/dmu = M theta(1-theta)
# (5) mu_trans = kT ln(n Lambda^3)
#
# Run:  julia wk10_partition_thermo.jl
using Printf, Random
Random.seed!(10)
const KB, H, C, R, AMU = 1.380649e-23, 6.62607015e-34, 2.99792458e10, 8.314462618, 1.66053906660e-27

Utl(t) = exp(-1 / t) / (1 + exp(-1 / t))
ts = range(0.05, 3, length=6000); h = 1e-5
cv = [(Utl(t + h) - Utl(t - h)) / (2h) for t in ts]
dev = maximum(abs.(cv .- [(Utl(t) - Utl(t)^2) / t^2 for t in ts]))
i = argmax(cv)
@printf("(1) two-level: C_max = %.4f k at kT/eps = %.4f; max|dU/dT - sigma^2/kT^2| = %.1e\\n\\n", cv[i], ts[i], dev)

p = exp(-1) / (1 + exp(-1))
println("(2) sigma_E/<E> at kT = eps")
for N in (10, 100, 1000, 10000, 1_000_000)
    E = [count(<(p), rand(N)) for _ in 1:(N > 10000 ? 500 : 20000)]
    m = sum(E) / length(E); sd = sqrt(sum((E .- m) .^ 2) / length(E))
    @printf("    N = %8d: simulated %.5f  theory %.5f\\n", N, sd / m, sqrt((1 - p) / (N * p)))
end

mols = [("N2", 28.0134, 2358.57, 1.998241, 2, 1, 191.609), ("O2", 31.9988, 1580.161, 1.44562, 2, 3, 205.152),
        ("CO", 28.0101, 2169.756, 1.931602, 1, 1, 197.660), ("HCl", 36.461, 2990.925, 10.5933, 1, 1, 186.902),
        ("I2", 253.809, 214.502, 0.037372, 2, 1, 260.687)]
T, p0 = 298.15, 1e5
println("\\n(3) S° at 298.15 K, 1 bar\\n     mol    qR       qV      S_total   CODATA")
for (n, M, nu, B, sig, g0, Sref) in mols
    m = M * AMU; Λ = H / sqrt(2π * m * KB * T)
    qTN = (KB * T / p0) / Λ^3; qR = KB * T / (sig * H * C * B)
    x = H * C * nu / (KB * T); qV = 1 / (1 - exp(-x))
    S = R * (log(qTN) + 2.5) + R * (log(qR) + 1) + R * (x / expm1(x) - log(1 - exp(-x))) + R * log(g0)
    @printf("    %-4s  %7.1f  %7.4f   %6.1f    %6.1f\\n", n, qR, qV, S, Sref)
end

println("\\n(4) Langmuir, M = 1000")
Nf(b) = 1000 * exp(b) / (1 + exp(b))
for bmu in (-2.0, 0.0, 2.0)
    th = exp(bmu) / (1 + exp(bmu))
    @printf("    beta mu = %+.1f: theta = %.4f, kT d<N>/dmu = %.2f, M theta(1-theta) = %.2f\\n", bmu, th, (Nf(bmu + h) - Nf(bmu - h)) / (2h), 1000 * th * (1 - th))
end

m = 28.0134 * AMU; Λ = H / sqrt(2π * m * KB * T); n = p0 / (KB * T)
@printf("\\n(5) N2: n Lambda^3 = %.3e, mu_trans = %.2f kT = %.1f kJ/mol\\n", n * Λ^3, log(n * Λ^3), R * T * log(n * Λ^3) / 1e3)
`;

// ── cpp/wk10_partition_thermo.cpp ─────────────────
export const CPP_PART = `// Wk10 — From the partition function to thermodynamics
// Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
//
// (1) two-level system: C_V = dU/dT = sigma_E^2/kT^2, Schottky peak
// (2) sigma_E/<E> ~ N^(-1/2)
// (3) diatomic q = qT qR qV qE and standard molar entropy vs CODATA
// (4) Langmuir lattice gas (grand canonical): sigma_N^2 = kT d<N>/dmu = M theta(1-theta)
// (5) mu_trans = kT ln(n Lambda^3)
//
// Build:  g++ -O2 -std=c++17 wk10_partition_thermo.cpp -o wk10_partition_thermo
#include <cstdio>
#include <cmath>
#include <random>

const double KB = 1.380649e-23, H = 6.62607015e-34, C = 2.99792458e10, R = 8.314462618, AMU = 1.66053906660e-27;

int main() {
    // (1)
    double best = 0, tbest = 0, maxdev = 0;
    for (int i = 1; i < 6000; ++i) {
        double t = 0.05 + 2.95 * i / 6000.0, h = 1e-5;
        auto U = [](double tt) { double b = 1 / tt; return std::exp(-b) / (1 + std::exp(-b)); };
        double cv = (U(t + h) - U(t - h)) / (2 * h);
        double var = U(t) - U(t) * U(t);
        maxdev = std::fmax(maxdev, std::fabs(cv - var / (t * t)));
        if (cv > best) { best = cv; tbest = t; }
    }
    std::printf("(1) two-level system: C_max = %.4f k at kT/eps = %.4f;  max|dU/dT - sigma^2/kT^2| = %.1e\\n\\n", best, tbest, maxdev);
    // (2)
    std::mt19937_64 rng(10);
    double p = std::exp(-1.0) / (1 + std::exp(-1.0));
    std::printf("(2) sigma_E/<E> at kT = eps\\n");
    for (int N : {10, 100, 1000, 10000, 1000000}) {
        std::binomial_distribution<long> bin(N, p);
        double s = 0, s2 = 0; int M = 20000;
        for (int k = 0; k < M; ++k) { double e = bin(rng); s += e; s2 += e * e; }
        double mean = s / M, sd = std::sqrt(s2 / M - mean * mean);
        std::printf("    N = %8d: simulated %.5f  theory %.5f\\n", N, sd / mean, std::sqrt((1 - p) / (N * p)));
    }
    // (3)
    struct Mol { const char* n; double M, nu, B; int sig, g0; double Sref; };
    Mol mols[5] = {{"N2", 28.0134, 2358.57, 1.998241, 2, 1, 191.609}, {"O2", 31.9988, 1580.161, 1.44562, 2, 3, 205.152},
                   {"CO", 28.0101, 2169.756, 1.931602, 1, 1, 197.660}, {"HCl", 36.461, 2990.925, 10.5933, 1, 1, 186.902},
                   {"I2", 253.809, 214.502, 0.037372, 2, 1, 260.687}};
    double T = 298.15, p0 = 1e5;
    std::printf("\\n(3) S° at 298.15 K, 1 bar (NIST CCCBDB constants; CODATA reference)\\n     mol    qR       qV      S_total   CODATA\\n");
    for (auto& m : mols) {
        double mass = m.M * AMU, Lam = H / std::sqrt(2 * M_PI * mass * KB * T);
        double qTN = (KB * T / p0) / std::pow(Lam, 3), qR = KB * T / (m.sig * H * C * m.B);
        double x = H * C * m.nu / (KB * T), qV = 1 / (1 - std::exp(-x));
        double S = R * (std::log(qTN) + 2.5) + R * (std::log(qR) + 1) + R * (x / std::expm1(x) - std::log(1 - std::exp(-x))) + R * std::log((double)m.g0);
        std::printf("    %-4s  %7.1f  %7.4f   %6.1f    %6.1f\\n", m.n, qR, qV, S, m.Sref);
    }
    // (4)
    std::printf("\\n(4) Langmuir, M = 1000\\n");
    for (double bmu : {-2.0, 0.0, 2.0}) {
        double th = std::exp(bmu) / (1 + std::exp(bmu)), h = 1e-5;
        auto Nf = [](double b) { return 1000 * std::exp(b) / (1 + std::exp(b)); };
        std::printf("    beta mu = %+.1f: theta = %.4f, kT d<N>/dmu = %.2f, M theta(1-theta) = %.2f\\n", bmu, th, (Nf(bmu + h) - Nf(bmu - h)) / (2 * h), 1000 * th * (1 - th));
    }
    // (5)
    double mass = 28.0134 * AMU, Lam = H / std::sqrt(2 * M_PI * mass * KB * T), n = p0 / (KB * T);
    std::printf("\\n(5) N2: n Lambda^3 = %.3e, mu_trans = %.2f kT = %.1f kJ/mol\\n", n * std::pow(Lam, 3), std::log(n * std::pow(Lam, 3)), R * T * std::log(n * std::pow(Lam, 3)) / 1e3);
    return 0;
}
`;

// ── python/wk10_lattice_mixing.py ─────────────────
export const PY_MIX = `"""
Wk10 — Lattice (regular-solution) model of a binary mixture A/B
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Mean-field free energy of mixing (lecture p. 3-6)
      dF/(N kT) = chi phi(1-phi) + phi ln phi + (1-phi) ln(1-phi)
      chi = kappa/kT,  kappa = (z/2)(2 eps_AB - eps_AA - eps_BB)
    spinodal  f'' = 0:            chi_s(phi) = 1 / (2 phi (1-phi))
    binodal (symmetric):          ln(phi/(1-phi)) = chi (2 phi - 1)
    critical point:               phi_c = 1/2, chi_c = 2  (T_c = kappa / 2k)
(2) Kawasaki Monte Carlo on a square lattice (z = 4): A and B swap places,
    Metropolis with the cost of one unlike neighbor pair = kappa/z = chi kT/4.
    The exact 2D answer (Onsager; Ising mapping J = kappa/2z) puts the
    critical point at chi_c = 2z / 2.269 = 3.53, not 2: mean-field theory
    ignores the local ordering that fluctuations create.

Run:  python wk10_lattice_mixing.py     (~60 s)
"""
import numpy as np
from scipy.optimize import brentq

rng = np.random.default_rng(10)

def f(phi, chi):
    return chi * phi * (1 - phi) + phi * np.log(phi) + (1 - phi) * np.log(1 - phi)

# -- (1) spinodal and binodal --------------------------------------
print("(1) mean-field phase boundaries (symmetric mixture)")
print("     chi    T/Tc    binodal phi    spinodal phi")
for chi in (2.0, 2.2, 2.5, 3.0, 3.5, 4.0):
    if chi <= 2.0:
        print(f"    {chi:4.1f}   {2/chi:5.3f}      0.5000          0.5000   (critical point)")
        continue
    b = brentq(lambda p: np.log(p / (1 - p)) - chi * (2 * p - 1), 1e-12, 0.5 - 1e-9)
    s = 0.5 * (1 - np.sqrt(1 - 2 / chi))
    print(f"    {chi:4.1f}   {2/chi:5.3f}      {b:.4f}          {s:.4f}")
x = np.linspace(1e-4, 1 - 1e-4, 200001)
for chi in (1.0, 2.0, 3.0):
    fpp = np.gradient(np.gradient(f(x, chi), x), x)
    print(f"    chi = {chi}: min f'' = {fpp[1000:-1000].min():+.3f}  ->  {'unstable region exists' if fpp[1000:-1000].min() < 0 else 'always stable'}")

# -- (2) Kawasaki Monte Carlo ---------------------------------------
def kawasaki(chi, L=48, sweeps=400):
    s = np.where(rng.random((L, L)) < 0.5, 1, -1)
    de = chi / 4.0                                   # cost of one unlike bond = kappa/z = chi kT / 4
    nbr = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    def unlike(i, j, v):
        return sum(v != s[(i + a) % L, (j + b) % L] for a, b in nbr)
    for _ in range(sweeps * L * L):
        i, j = rng.integers(L, size=2)
        a, b = nbr[rng.integers(4)]
        k, l = (i + a) % L, (j + b) % L
        if s[i, j] == s[k, l]:
            continue
        v1, v2 = s[i, j], s[k, l]
        before = unlike(i, j, v1) + unlike(k, l, v2)
        s[i, j], s[k, l] = v2, v1
        after = unlike(i, j, v2) + unlike(k, l, v1)
        dE = (after - before) * de
        if dE > 0 and rng.random() >= np.exp(-dE):
            s[i, j], s[k, l] = v1, v2                # reject
    ub = (np.sum(s != np.roll(s, 1, 0)) + np.sum(s != np.roll(s, 1, 1))) / (2 * L * L)
    return ub, s

print("\\n(2) Kawasaki MC, 48 x 48, phi = 0.5, 400 sweeps")
print("     chi    unlike-bond fraction   (random mixing = 0.5)")
for chi in (1.0, 2.5, 3.5, 4.5, 6.0):
    ub, s = kawasaki(chi)
    print(f"    {chi:4.1f}        {ub:.3f}")
print("    -> short-range order grows smoothly with chi; long-range domains need chi > 3.53 (exact 2D), not chi > 2 (mean field)")
`;

// ── matlab/wk10_lattice_mixing.m ─────────────────
export const ML_MIX = `% Wk10 — Lattice (regular-solution) model of a binary mixture A/B
% Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
%
% (1) dF/(NkT) = chi phi(1-phi) + phi ln phi + (1-phi) ln(1-phi)
%     spinodal chi_s = 1/(2 phi(1-phi)); binodal ln(phi/(1-phi)) = chi(2phi-1); chi_c = 2
% (2) Kawasaki Monte Carlo (z = 4): unlike-pair cost = kappa/z = chi kT/4.
%     Exact 2D critical point chi_c = 2z/2.269 = 3.53, not the mean-field 2.
%
% Run:  wk10_lattice_mixing     (Monte Carlo loops: a few minutes in MATLAB)
clear; rng(10);
fprintf('(1) mean-field phase boundaries\\n     chi    T/Tc    binodal    spinodal\\n');
for chi = [2.2 2.5 3.0 3.5 4.0]
    b = fzero(@(p) log(p/(1 - p)) - chi*(2*p - 1), [1e-12 0.5 - 1e-6]);
    fprintf('    %4.1f   %5.3f    %.4f     %.4f\\n', chi, 2/chi, b, 0.5*(1 - sqrt(1 - 2/chi)));
end

L = 48; sweeps = 400; dx = [1 -1 0 0]; dy = [0 0 1 -1];
wrap = @(i) mod(i - 1, L) + 1;
fprintf('\\n(2) Kawasaki MC, %dx%d, phi = 0.5\\n     chi    unlike-bond fraction (random = 0.5)\\n', L, L);
for chi = [1.0 2.5 3.5 4.5 6.0]
    s = 2*(rand(L) < 0.5) - 1; de = chi/4;
    for step = 1:sweeps*L*L
        i = randi(L); j = randi(L); d = randi(4); k = wrap(i + dx(d)); l = wrap(j + dy(d));
        v1 = s(i, j); v2 = s(k, l);
        if v1 == v2, continue; end
        before = unl(s, i, j, v1, L) + unl(s, k, l, v2, L);
        s(i, j) = v2; s(k, l) = v1;
        after = unl(s, i, j, v2, L) + unl(s, k, l, v1, L);
        dE = (after - before)*de;
        if dE > 0 && rand >= exp(-dE), s(i, j) = v1; s(k, l) = v2; end
    end
    ub = (sum(s(:) ~= reshape(circshift(s, 1, 1), [], 1)) + sum(s(:) ~= reshape(circshift(s, 1, 2), [], 1)))/(2*L*L);
    fprintf('    %4.1f        %.3f\\n', chi, ub);
end
figure; imagesc(s); axis image off; colormap(gray); title('last configuration');

function c = unl(s, i, j, v, L)
    w = @(a) mod(a - 1, L) + 1;
    c = (s(w(i + 1), j) ~= v) + (s(w(i - 1), j) ~= v) + (s(i, w(j + 1)) ~= v) + (s(i, w(j - 1)) ~= v);
end
`;

// ── julia/wk10_lattice_mixing.jl ─────────────────
export const JL_MIX = `# Wk10 — Lattice (regular-solution) model of a binary mixture A/B
# Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
#
# (1) dF/(NkT) = chi phi(1-phi) + phi ln phi + (1-phi) ln(1-phi)
#     spinodal chi_s = 1/(2 phi(1-phi)); binodal ln(phi/(1-phi)) = chi(2phi-1); chi_c = 2
# (2) Kawasaki Monte Carlo (z = 4): unlike-pair cost = kappa/z = chi kT/4.
#     Exact 2D critical point chi_c = 2z/2.269 = 3.53, not the mean-field 2.
#
# Run:  julia wk10_lattice_mixing.jl
using Printf, Random
Random.seed!(10)

function binodal(chi)
    a, b = 1e-12, 0.5 - 1e-9
    g(p) = log(p / (1 - p)) - chi * (2p - 1)
    for _ in 1:200
        m = (a + b) / 2
        g(a) * g(m) <= 0 ? (b = m) : (a = m)
    end
    (a + b) / 2
end
println("(1) mean-field phase boundaries\\n     chi    T/Tc    binodal    spinodal")
for chi in (2.2, 2.5, 3.0, 3.5, 4.0)
    @printf("    %4.1f   %5.3f    %.4f     %.4f\\n", chi, 2 / chi, binodal(chi), 0.5 * (1 - sqrt(1 - 2 / chi)))
end

function kawasaki(chi; L=64, sweeps=2000)
    s = [rand() < 0.5 ? 1 : -1 for _ in 1:L, _ in 1:L]
    w(i) = mod1(i, L)
    dirs = ((1, 0), (-1, 0), (0, 1), (0, -1))
    unl(i, j, v) = count(d -> s[w(i + d[1]), w(j + d[2])] != v, dirs)
    de = chi / 4
    for _ in 1:sweeps*L*L
        i, j = rand(1:L), rand(1:L); d = dirs[rand(1:4)]; k, l = w(i + d[1]), w(j + d[2])
        v1, v2 = s[i, j], s[k, l]
        v1 == v2 && continue
        before = unl(i, j, v1) + unl(k, l, v2)
        s[i, j], s[k, l] = v2, v1
        after = unl(i, j, v2) + unl(k, l, v1)
        dE = (after - before) * de
        if dE > 0 && rand() >= exp(-dE)
            s[i, j], s[k, l] = v1, v2
        end
    end
    (count(s .!= circshift(s, (1, 0))) + count(s .!= circshift(s, (0, 1)))) / (2L * L)
end
println("\\n(2) Kawasaki MC, 64x64, phi = 0.5\\n     chi    unlike-bond fraction (random = 0.5)")
for chi in (1.0, 2.5, 3.5, 4.5, 6.0)
    @printf("    %4.1f        %.3f\\n", chi, kawasaki(chi))
end
`;

// ── cpp/wk10_lattice_mixing.cpp ─────────────────
export const CPP_MIX = `// Wk10 — Lattice (regular-solution) model of a binary mixture A/B
// Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
//
// (1) dF/(NkT) = chi phi(1-phi) + phi ln phi + (1-phi) ln(1-phi)
//     spinodal chi_s = 1/(2 phi(1-phi)); binodal ln(phi/(1-phi)) = chi(2phi-1); chi_c = 2
// (2) Kawasaki Monte Carlo, square lattice (z = 4): unlike-pair cost = kappa/z = chi kT/4.
//     Exact 2D critical point chi_c = 2z/2.269 = 3.53 (Onsager), not the mean-field 2.
//
// Build:  g++ -O2 -std=c++17 wk10_lattice_mixing.cpp -o wk10_lattice_mixing
#include <cstdio>
#include <cmath>
#include <vector>
#include <random>

double binodal(double chi) {           // bisection on (0, 1/2)
    double a = 1e-12, b = 0.5 - 1e-9;
    auto g = [chi](double p) { return std::log(p / (1 - p)) - chi * (2 * p - 1); };
    for (int i = 0; i < 200; ++i) { double m = 0.5 * (a + b); (g(a) * g(m) <= 0 ? b : a) = m; }
    return 0.5 * (a + b);
}

int main() {
    std::printf("(1) mean-field phase boundaries\\n     chi    T/Tc    binodal    spinodal\\n");
    for (double chi : {2.2, 2.5, 3.0, 3.5, 4.0})
        std::printf("    %4.1f   %5.3f    %.4f     %.4f\\n", chi, 2 / chi, binodal(chi), 0.5 * (1 - std::sqrt(1 - 2 / chi)));

    std::mt19937_64 rng(10);
    std::uniform_real_distribution<double> uni(0, 1);
    const int L = 64, sweeps = 2000;
    int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
    std::printf("\\n(2) Kawasaki MC, %dx%d, phi = 0.5, %d sweeps\\n     chi    unlike-bond fraction (random = 0.5)\\n", L, L, sweeps);
    for (double chi : {1.0, 2.5, 3.5, 4.5, 6.0}) {
        std::vector<int> s(L * L);
        for (auto& v : s) v = uni(rng) < 0.5 ? 1 : -1;
        auto at = [&](int i, int j) -> int& { return s[((i + L) % L) * L + (j + L) % L]; };
        auto unlike = [&](int i, int j, int v) { int c = 0; for (int d = 0; d < 4; ++d) c += (at(i + dx[d], j + dy[d]) != v); return c; };
        double de = chi / 4.0;
        std::uniform_int_distribution<int> pos(0, L - 1), dir(0, 3);
        for (long step = 0; step < (long)sweeps * L * L; ++step) {
            int i = pos(rng), j = pos(rng), d = dir(rng), k = i + dx[d], l = j + dy[d];
            int v1 = at(i, j), v2 = at(k, l);
            if (v1 == v2) continue;
            int before = unlike(i, j, v1) + unlike(k, l, v2);
            at(i, j) = v2; at(k, l) = v1;
            int after = unlike(i, j, v2) + unlike(k, l, v1);
            double dE = (after - before) * de;
            if (dE > 0 && uni(rng) >= std::exp(-dE)) { at(i, j) = v1; at(k, l) = v2; }
        }
        int ub = 0;
        for (int i = 0; i < L; ++i) for (int j = 0; j < L; ++j) ub += (at(i, j) != at(i + 1, j)) + (at(i, j) != at(i, j + 1));
        std::printf("    %4.1f        %.3f\\n", chi, ub / (2.0 * L * L));
    }
    std::printf("    -> long-range domains need chi > 3.53 (exact 2D), not chi > 2 (mean field)\\n");
    return 0;
}
`;

// ── python/wk10_cahn_hilliard.py ─────────────────
export const PY_CH = `"""
Wk10 — Cahn-Hilliard spinodal decomposition and Allen-Cahn coarsening
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

Free energy (per site, units of kT), lecture p. 10-13:
    F = sum [ f(phi) + kappa |grad phi|^2 ],
    f(phi) = chi phi(1-phi) + phi ln phi + (1-phi) ln(1-phi)
    mu = df/dphi - 2 kappa lap(phi)
Cahn-Hilliard (conserved):   d phi/dt =  M lap(mu)
Allen-Cahn (non-conserved):  d phi/dt = -L (phi^3 - phi - 2 kappa lap(phi))
Linear stability (Fourier mode q):
    R(q) = -M q^2 [ f''(phi0) + 2 kappa q^2 ],  unstable when f''(phi0) < 0
    fastest mode q_m^2 = -f''(phi0) / (4 kappa),  lambda_m = 2 pi / q_m
    (marginal mode q_th = sqrt(2) q_m; cf. lecture p. 14)
Numerics: semi-implicit Fourier spectral method, periodic box.

Run:  python wk10_cahn_hilliard.py     (~90 s)
"""
import numpy as np

rng = np.random.default_rng(10)
N, dx = 128, 1.0
k = 2 * np.pi * np.fft.fftfreq(N, d=dx)
KX, KY = np.meshgrid(k, k, indexing="ij")
K2 = KX**2 + KY**2
KMAG = np.sqrt(K2)

def fprime(p, chi):
    p = np.clip(p, 1e-9, 1 - 1e-9)
    return np.log(p / (1 - p)) + chi * (1 - 2 * p)

def radial_peak(phi):
    S = np.abs(np.fft.fft2(phi - phi.mean()))**2
    bins = np.arange(0.5, N // 2) * (2 * np.pi / (N * dx))
    idx = np.digitize(KMAG.ravel(), bins)
    Sq = np.bincount(idx, weights=S.ravel(), minlength=len(bins) + 1)
    cnt = np.bincount(idx, minlength=len(bins) + 1)
    Sq = Sq[1:len(bins)] / np.maximum(cnt[1:len(bins)], 1)
    qc = 0.5 * (bins[1:] + bins[:-1])
    qmean = np.sum(qc * Sq) / np.sum(Sq)
    return qc[np.argmax(Sq)], qmean

def cahn_hilliard(chi, phi0, kappa=1.0, t_end=10.0, dt=0.05, amp=1e-3, snaps=()):
    phi = phi0 + amp * rng.standard_normal((N, N))
    A = 2.0 * chi                                   # stabilizing constant
    den = 1 + dt * K2 * (A + 2 * kappa * K2)
    out, t, nsteps = {}, 0.0, int(round(t_end / dt))
    for n in range(1, nsteps + 1):
        ph = np.fft.fft2(phi)
        muh = np.fft.fft2(fprime(phi, chi))
        ph = (ph - dt * K2 * (muh - A * ph)) / den
        phi = np.real(np.fft.ifft2(ph))
        t = n * dt
        for ts in snaps:
            if abs(t - ts) < dt / 2:
                out[ts] = phi.copy()
    return phi, out

# -- (1) linear regime: the fastest-growing wavelength ----------------
print("(1) early-time dominant wavelength vs linear theory (kappa = 1)")
print("    chi   phi0    f''(phi0)   lambda_m theory   lambda measured (t when amp ~ 0.05)")
for chi, phi0 in ((3.0, 0.5), (2.6, 0.5), (3.0, 0.35)):
    fpp = 1 / (phi0 * (1 - phi0)) - 2 * chi
    qm = np.sqrt(-fpp / 4.0)
    Rm = qm**2 * (-fpp - 2 * qm**2)                 # max growth rate
    t_lin = np.log(50) / Rm
    phi, _ = cahn_hilliard(chi, phi0, t_end=t_lin)
    qpk, _ = radial_peak(phi)
    print(f"    {chi:3.1f}   {phi0:4.2f}   {fpp:+7.3f}       {2*np.pi/qm:7.2f}            {2*np.pi/qpk:7.2f}   (t = {t_lin:.1f})")

# -- (2) late stage: phases, mass conservation, coarsening ------------
chi, phi0 = 3.0, 0.5
times = (50, 100, 200, 400, 800)
phi, snaps = cahn_hilliard(chi, phi0, t_end=800, dt=0.1, amp=1e-2, snaps=times)
phi_start = snaps[50].mean()
print(f"\\n(2) chi = {chi}, phi0 = {phi0}: late-stage spinodal decomposition")
print(f"    mean phi conserved: {phi.mean():.8f} at t = 800 vs {phi_start:.8f} at t = 50")
print(f"    phase compositions: {np.percentile(phi, 2):.3f} / {np.percentile(phi, 98):.3f}   binodal 0.071 / 0.929")
Ls = []
for t in times:
    _, qmean = radial_peak(snaps[t])
    Ls.append(2 * np.pi / qmean)
    print(f"    t = {t:4d}:  domain size L = 2pi/<q> = {Ls[-1]:6.2f}")
slope = np.polyfit(np.log(times), np.log(Ls), 1)[0]
print(f"    coarsening exponent L ~ t^n:  n = {slope:.2f}   (Lifshitz-Slyozov: 1/3)")

# -- (3) Allen-Cahn: non-conserved order parameter --------------------
N2 = 256
k2 = 2 * np.pi * np.fft.fftfreq(N2, d=dx)
KX2, KY2 = np.meshgrid(k2, k2, indexing="ij")
K2b = KX2**2 + KY2**2
Kb = np.sqrt(K2b)
def domain_size(phi):
    """area per unit interface length: L = 1 / (sign changes per site per direction)"""
    s = np.sign(phi)
    walls = np.mean(s != np.roll(s, 1, 0)) + np.mean(s != np.roll(s, 1, 1))
    return 2.0 / walls
phi = 0.0 + 0.1 * rng.standard_normal((N2, N2))
L_ac, kap, dt = 1.0, 0.5, 0.05
den = 1 + dt * L_ac * 2 * kap * K2b                  # implicit gradient term
sizes = []
for n in range(1, 6401):
    ph = np.fft.fft2(phi + dt * L_ac * (phi - phi**3))
    phi = np.real(np.fft.ifft2(ph / den))
    if n in (800, 1600, 3200, 6400):
        sizes.append((n * dt, domain_size(phi), phi.mean()))
print("\\n(3) Allen-Cahn (non-conserved), 256 x 256, start phi = 0 +/- noise")
for t, Lt, m in sizes:
    print(f"    t = {t:5.0f}:  domain size {Lt:6.2f},  mean phi = {m:+.3f}  (not conserved)")
slope = np.polyfit(np.log([s[0] for s in sizes]), np.log([s[1] for s in sizes]), 1)[0]
print(f"    coarsening exponent n = {slope:.2f}   (curvature-driven Allen-Cahn: 1/2 at late times)")
`;

// ── matlab/wk10_cahn_hilliard.m ─────────────────
export const ML_CH = `% Wk10 — Cahn-Hilliard spinodal decomposition and Allen-Cahn coarsening
% Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
%
% f(phi) = chi phi(1-phi) + phi ln phi + (1-phi) ln(1-phi),  mu = f'(phi) - 2 kappa lap(phi)
% Cahn-Hilliard: d phi/dt = lap(mu);  Allen-Cahn: d phi/dt = -(phi^3 - phi - 2 kappa lap(phi))
% Linear theory: R(q) = -q^2 (f'' + 2 kappa q^2), q_m^2 = -f''/(4 kappa), lambda_m = 2 pi/q_m
%
% Run:  wk10_cahn_hilliard
clear; rng(10);
N = 128; kappa = 1;
k = 2*pi*[0:N/2-1, -N/2:-1]/N; [KX, KY] = ndgrid(k, k); K2 = KX.^2 + KY.^2; K = sqrt(K2);
fp = @(p, chi) log(min(max(p, 1e-9), 1 - 1e-9)./(1 - min(max(p, 1e-9), 1 - 1e-9))) + chi*(1 - 2*min(max(p, 1e-9), 1 - 1e-9));

cases = [3.0 0.5; 2.6 0.5; 3.0 0.35];
fprintf('(1) early dominant wavelength vs linear theory\\n    chi   phi0   lambda_m theory   measured\\n');
for c = 1:3
    chi = cases(c, 1); p0 = cases(c, 2);
    fpp = 1/(p0*(1 - p0)) - 2*chi; qm = sqrt(-fpp/4); Rm = qm^2*(-fpp - 2*qm^2);
    phi = ch(p0 + 1e-3*randn(N), chi, kappa, K2, log(50)/Rm, 0.05, fp);
    fprintf('    %3.1f   %4.2f      %7.2f        %7.2f\\n', chi, p0, 2*pi/qm, 2*pi/peakq(phi, K, N));
end

phi = ch(0.5 + 1e-2*randn(N), 3.0, kappa, K2, 400, 0.1, fp);
s = sort(phi(:));
fprintf('\\n(2) chi = 3, t = 400: mean phi = %.6f, phases %.3f / %.3f (binodal 0.071 / 0.929)\\n', mean(phi(:)), s(round(0.02*N^2)), s(round(0.98*N^2)));
figure; imagesc(phi); axis image off; colormap(parula); title('Cahn-Hilliard, \\chi = 3, t = 400');

% Allen-Cahn
phi = 0.1*randn(N); dt = 0.05; den = 1 + dt*2*0.5*K2;
for n = 1:4000
    phi = real(ifft2(fft2(phi + dt*(phi - phi.^3))./den));
end
fprintf('\\n(3) Allen-Cahn: mean phi drifts to %+.3f (non-conserved order parameter)\\n', mean(phi(:)));
figure; imagesc(phi); axis image off; title('Allen-Cahn, t = 200');

function phi = ch(phi, chi, kappa, K2, tend, dt, fp)
    A = 2*chi; den = 1 + dt*K2.*(A + 2*kappa*K2);
    for n = 1:round(tend/dt)
        ph = fft2(phi); muh = fft2(fp(phi, chi));
        phi = real(ifft2((ph - dt*K2.*(muh - A*ph))./den));
    end
end
function q = peakq(phi, K, N)
    S = abs(fft2(phi - mean(phi(:)))).^2; dq = 2*pi/N;
    b = round(K/dq); Sq = accumarray(b(:) + 1, S(:)); c = accumarray(b(:) + 1, 1);
    Sq = Sq(2:N/2)./c(2:N/2); [~, i] = max(Sq); q = i*dq;
end
`;

// ── julia/wk10_cahn_hilliard.jl ─────────────────
export const JL_CH = `# Wk10 — Cahn-Hilliard spinodal decomposition and Allen-Cahn coarsening
# Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
#
# f(phi) = chi phi(1-phi) + phi ln phi + (1-phi) ln(1-phi),  mu = f'(phi) - 2 kappa lap(phi)
# Cahn-Hilliard: d phi/dt = lap(mu);  Allen-Cahn: d phi/dt = -(phi^3 - phi - 2 kappa lap(phi))
# Linear theory: R(q) = -q^2 (f'' + 2 kappa q^2), q_m^2 = -f''/(4 kappa), lambda_m = 2 pi/q_m
#
# Run:  julia wk10_cahn_hilliard.jl      (needs FFTW: ] add FFTW)
using Printf, Random, FFTW
Random.seed!(10)
const N = 128
const κ = 1.0
k = 2π .* vcat(0:N÷2-1, -N÷2:-1) ./ N
K2 = [kx^2 + ky^2 for kx in k, ky in k]; K = sqrt.(K2)
clampp(p) = min(max(p, 1e-9), 1 - 1e-9)
fp(p, chi) = (q = clampp(p); log(q / (1 - q)) + chi * (1 - 2q))

function ch(phi, chi, tend, dt)
    A = 2chi; den = 1 .+ dt .* K2 .* (A .+ 2κ .* K2)
    for _ in 1:round(Int, tend / dt)
        ph = fft(phi); muh = fft(fp.(phi, chi))
        phi = real.(ifft((ph .- dt .* K2 .* (muh .- A .* ph)) ./ den))
    end
    phi
end
function peakq(phi)
    S = abs2.(fft(phi .- sum(phi) / length(phi))); dq = 2π / N
    Sq = zeros(N ÷ 2); c = zeros(N ÷ 2)
    for idx in eachindex(S)
        b = round(Int, K[idx] / dq)
        if 1 <= b < N ÷ 2
            Sq[b] += S[idx]; c[b] += 1
        end
    end
    argmax(Sq ./ max.(c, 1)) * dq
end

println("(1) early dominant wavelength vs linear theory\\n    chi   phi0   lambda_m theory   measured")
for (chi, p0) in ((3.0, 0.5), (2.6, 0.5), (3.0, 0.35))
    fpp = 1 / (p0 * (1 - p0)) - 2chi; qm = sqrt(-fpp / 4); Rm = qm^2 * (-fpp - 2qm^2)
    phi = ch(p0 .+ 1e-3 .* randn(N, N), chi, log(50) / Rm, 0.05)
    @printf("    %3.1f   %4.2f      %7.2f        %7.2f\\n", chi, p0, 2π / qm, 2π / peakq(phi))
end
phi = ch(0.5 .+ 1e-2 .* randn(N, N), 3.0, 400, 0.1)
s = sort(vec(phi))
@printf("\\n(2) chi = 3, t = 400: mean phi = %.6f, phases %.3f / %.3f (binodal 0.071 / 0.929)\\n",
        sum(phi) / N^2, s[round(Int, 0.02N^2)], s[round(Int, 0.98N^2)])

phi = 0.1 .* randn(N, N); dt = 0.05; den = 1 .+ dt .* 2 * 0.5 .* K2
for _ in 1:4000
    global phi = real.(ifft(fft(phi .+ dt .* (phi .- phi .^ 3)) ./ den))
end
@printf("\\n(3) Allen-Cahn: mean phi drifts to %+.3f (non-conserved order parameter)\\n", sum(phi) / N^2)
`;

// ── cpp/wk10_cahn_hilliard.cpp ─────────────────
export const CPP_CH = `// Wk10 — Cahn-Hilliard spinodal decomposition (semi-implicit Fourier spectral)
// Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
//
// f(phi) = chi phi(1-phi) + phi ln phi + (1-phi) ln(1-phi),  mu = f'(phi) - 2 kappa lap(phi)
// d phi/dt = lap(mu);  linear theory: R(q) = -q^2 (f'' + 2 kappa q^2),
// q_m^2 = -f''/(4 kappa), lambda_m = 2 pi/q_m.
// Checks: early dominant wavelength, mass conservation, late-stage phases vs binodal.
//
// Build:  g++ -O2 -std=c++17 wk10_cahn_hilliard.cpp -o wk10_cahn_hilliard
#include <cstdio>
#include <cmath>
#include <complex>
#include <vector>
#include <random>
#include <algorithm>
typedef std::complex<double> cd;

void fft1(std::vector<cd>& a, bool inv) {            // iterative radix-2
    int n = a.size();
    for (int i = 1, j = 0; i < n; ++i) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) std::swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        double ang = 2 * M_PI / len * (inv ? 1 : -1);
        cd wl(std::cos(ang), std::sin(ang));
        for (int i = 0; i < n; i += len) {
            cd w(1);
            for (int j = 0; j < len / 2; ++j) {
                cd u = a[i + j], v = a[i + j + len / 2] * w;
                a[i + j] = u + v; a[i + j + len / 2] = u - v; w *= wl;
            }
        }
    }
    if (inv) for (auto& x : a) x /= n;
}
void fft2(std::vector<cd>& f, int N, bool inv) {
    std::vector<cd> row(N);
    for (int i = 0; i < N; ++i) { for (int j = 0; j < N; ++j) row[j] = f[i * N + j]; fft1(row, inv); for (int j = 0; j < N; ++j) f[i * N + j] = row[j]; }
    for (int j = 0; j < N; ++j) { for (int i = 0; i < N; ++i) row[i] = f[i * N + j]; fft1(row, inv); for (int i = 0; i < N; ++i) f[i * N + j] = row[i]; }
}

int main() {
    const int N = 128; const double kappa = 1.0;
    std::vector<double> K2(N * N), K(N * N);
    for (int i = 0; i < N; ++i) for (int j = 0; j < N; ++j) {
        double kx = 2 * M_PI * (i < N / 2 ? i : i - N) / N, ky = 2 * M_PI * (j < N / 2 ? j : j - N) / N;
        K2[i * N + j] = kx * kx + ky * ky; K[i * N + j] = std::sqrt(K2[i * N + j]);
    }
    std::mt19937_64 rng(10);
    std::normal_distribution<double> g(0, 1);
    auto run = [&](double chi, double phi0, double tend, double dt, double amp, std::vector<double>& phi) {
        phi.assign(N * N, 0);
        for (auto& p : phi) p = phi0 + amp * g(rng);
        double A = 2 * chi;
        std::vector<cd> ph(N * N), mh(N * N);
        int steps = (int)std::lround(tend / dt);
        for (int n = 0; n < steps; ++n) {
            for (int s = 0; s < N * N; ++s) {
                double p = std::min(std::max(phi[s], 1e-9), 1 - 1e-9);
                ph[s] = phi[s]; mh[s] = std::log(p / (1 - p)) + chi * (1 - 2 * p);
            }
            fft2(ph, N, false); fft2(mh, N, false);
            for (int s = 0; s < N * N; ++s) ph[s] = (ph[s] - dt * K2[s] * (mh[s] - A * ph[s])) / (1 + dt * K2[s] * (A + 2 * kappa * K2[s]));
            fft2(ph, N, true);
            for (int s = 0; s < N * N; ++s) phi[s] = ph[s].real();
        }
    };
    auto peak = [&](const std::vector<double>& phi) {
        double mean = 0; for (double p : phi) mean += p; mean /= N * N;
        std::vector<cd> f(N * N); for (int s = 0; s < N * N; ++s) f[s] = phi[s] - mean;
        fft2(f, N, false);
        int nb = N / 2; std::vector<double> S(nb, 0), c(nb, 0);
        double dq = 2 * M_PI / N;
        for (int s = 0; s < N * N; ++s) { int b = (int)std::lround(K[s] / dq); if (b > 0 && b < nb) { S[b] += std::norm(f[s]); c[b] += 1; } }
        int best = 1; for (int b = 1; b < nb; ++b) if (S[b] / std::max(c[b], 1.0) > S[best] / std::max(c[best], 1.0)) best = b;
        return best * dq;
    };
    std::printf("(1) early dominant wavelength vs linear theory\\n    chi   phi0   lambda_m theory   measured\\n");
    double cases[3][2] = {{3.0, 0.5}, {2.6, 0.5}, {3.0, 0.35}};
    std::vector<double> phi;
    for (auto& cs : cases) {
        double chi = cs[0], p0 = cs[1], fpp = 1 / (p0 * (1 - p0)) - 2 * chi, qm = std::sqrt(-fpp / 4);
        double Rm = qm * qm * (-fpp - 2 * qm * qm), tl = std::log(50.0) / Rm;
        run(chi, p0, tl, 0.05, 1e-3, phi);
        std::printf("    %3.1f   %4.2f      %7.2f        %7.2f\\n", chi, p0, 2 * M_PI / qm, 2 * M_PI / peak(phi));
    }
    run(3.0, 0.5, 400, 0.1, 1e-2, phi);
    std::vector<double> sorted = phi; std::sort(sorted.begin(), sorted.end());
    double mean = 0; for (double p : phi) mean += p; mean /= N * N;
    std::printf("\\n(2) chi = 3, t = 400: mean phi = %.6f, phases %.3f / %.3f (binodal 0.071 / 0.929), domain 2pi/q_peak = %.1f\\n",
                mean, sorted[(size_t)(0.02 * N * N)], sorted[(size_t)(0.98 * N * N)], 2 * M_PI / peak(phi));
    return 0;
}
`;
