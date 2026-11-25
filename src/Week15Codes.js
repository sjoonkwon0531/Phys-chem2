/* ============================================================
   Week15Codes.js — Physical Chemistry 2, Week 15
   Raw code samples: Pattern Formation by Instability & Processes at Electrodes
   - 4 topics: stability, reaction_diffusion, double_layer, electrode_kinetics
   - 4 languages: Python, MATLAB, Julia, C++
   Imported by Week15App.jsx > RawCodes tab.
   Auto-generated from codes/ — edit the standalone files, then regenerate.
   ============================================================ */

// ── python/wk15_stability.py ─────────────────
export const PY_STAB = `"""
Week 15 (Physical Chemistry 2) - Linear stability and the Turing instability
  1) 2x2 linear systems: eigenvalues from trace T and determinant Delta, classification
  2) Turing's two-morphogen model used in the lecture (Turing 1952, Turk 1991 form):
        da/dt = Da lap a + k(16 - a b)          (a: inhibitor)
        db/dt = Db lap b + k(a b - b - beta)    (b: activator, beta = 12)
     steady state, Jacobian, stability without diffusion
  3) Turing conditions with diffusion and the critical diffusivity ratio Da/Db = 4
  4) dispersion relation lambda(q) and the fastest-growing wavelength
"""
import numpy as np

def classify(T, D):
    disc = T * T - 4 * D
    if D < 0: return "saddle (unstable)"
    if abs(T) < 1e-12: return "centre"
    kind = "node" if disc >= 0 else "spiral"
    return ("stable " if T < 0 else "unstable ") + kind

print("1) Classification of fixed points by (T, Delta)")
for A in ([[-1, 0], [0, -2]], [[1, 0], [0, -1]], [[-0.5, -2], [2, -0.5]], [[0.2, -1], [1, 0.2]], [[0, -1], [1, 0]]):
    A = np.array(A, float); T = np.trace(A); D = np.linalg.det(A)
    lam = np.linalg.eigvals(A)
    print(f"   T = {T:+.2f}, Delta = {D:+.2f}: lambda = {np.round(lam, 3)}  -> {classify(T, D)}")

print("\\n2) Turing's model: f = k(16 - ab), g = k(ab - b - 12)")
k = 0.02
a0, b0 = 4.0, 4.0
print(f"   steady state: ab = 16 and b(a - 1) = 12 -> a* = {a0}, b* = {b0}")
J = k * np.array([[-b0, -a0], [b0, a0 - 1]])
T = np.trace(J); D = np.linalg.det(J)
print(f"   J = k * {np.round(J / k, 3).tolist()},  T = {T:.4f} (< 0), Delta = {D:.6f} (> 0)")
print(f"   -> {classify(T, D)} without diffusion; eigenvalues {np.round(np.linalg.eigvals(J), 5)}")

print("\\n3) Turing conditions with diffusion D = diag(Da, Db)")
fa, fb, ga, gb = J[0, 0], J[0, 1], J[1, 0], J[1, 1]
print("   (i)  Db fa + Da gb > 0      (ii) (Db fa + Da gb)^2 > 4 Da Db Delta")
print("   with fa = -4k, gb = 3k: (i) Da/Db > 4/3,  (ii) 9r^2 - 40r + 16 > 0 -> r = Da/Db > 4")
for r in (2, 3, 4, 5, 8):
    Da, Db = 0.02 * r, 0.02
    c1 = Db * fa + Da * gb
    c2 = c1**2 - 4 * Da * Db * D
    verdict = "threshold (marginal)" if abs(c2) < 1e-15 else ("Turing unstable" if (c1 > 0 and c2 > 0) else "stable")
    print(f"   Da/Db = {r}: (i) {c1:+.2e}  (ii) {c2:+.2e}  -> {verdict}")

print("\\n4) Dispersion relation lambda(q) for Da = 0.1, Db = 0.02 (lecture values), grid spacing 1")
Da, Db = 0.1, 0.02
q = np.linspace(0, 2.0, 2001)
lam_max = []
for qq in q:
    Q = J - qq**2 * np.diag([Da, Db])
    lam_max.append(np.max(np.linalg.eigvals(Q).real))
lam_max = np.array(lam_max)
i = np.argmax(lam_max)
band = q[lam_max > 0]
print(f"   unstable band q = {band.min():.3f} ... {band.max():.3f}")
print(f"   fastest mode q* = {q[i]:.3f}, growth rate {lam_max[i]:.5f} per step, wavelength 2pi/q* = {2*np.pi/q[i]:.2f} cells")
qc2 = np.sqrt(D / (Da * Db))
print(f"   estimate at threshold q_c^2 = sqrt(Delta/(Da Db)) -> q_c = {np.sqrt(qc2):.3f}, wavelength {2*np.pi/np.sqrt(qc2):.2f} cells")
print("   (on a grid, the discrete Laplacian gives -(2 - 2cos q) instead of -q^2; the difference is small for q < 1)")
`;

// ── matlab/wk15_stability.m ─────────────────
export const ML_STAB = `% Week 15 (Physical Chemistry 2) - Linear stability and the Turing instability
%   (T, Delta) classification, Turing's model f = k(16 - ab), g = k(ab - b - 12),
%   Turing conditions (critical Da/Db = 4) and the dispersion relation
function wk15_stability()
fprintf('1) Classification by (T, Delta)\\n');
Ms = {[-1 0; 0 -2], [1 0; 0 -1], [-0.5 -2; 2 -0.5], [0.2 -1; 1 0.2], [0 -1; 1 0]};
for i = 1:numel(Ms)
    A = Ms{i}; T = trace(A); D = det(A); l = eig(A);
    fprintf('   T = %+.2f, Delta = %+.2f: lambda = %s -> %s\\n', T, D, mat2str(round(l.', 3)), classify(T, D));
end
k = 0.02; a0 = 4; b0 = 4;
J = k*[-b0 -a0; b0 a0-1]; T = trace(J); D = det(J);
fprintf('\\n2) Turing model at (4, 4): T = %.4f, Delta = %.6f -> %s\\n', T, D, classify(T, D));
fprintf('\\n3) Turing conditions\\n');
for r = [2 3 4 5 8]
    Da = 0.02*r; Db = 0.02; c1 = Db*J(1,1) + Da*J(2,2); c2 = c1^2 - 4*Da*Db*D;
    if abs(c2) < 1e-15, v = 'threshold (marginal)'; elseif c1 > 0 && c2 > 0, v = 'Turing unstable'; else, v = 'stable'; end
    fprintf('   Da/Db = %d: (i) %+.2e (ii) %+.2e -> %s\\n', r, c1, c2, v);
end
Da = 0.1; Db = 0.02; q = linspace(0, 2, 2001); lm = zeros(size(q));
for i = 1:numel(q), lm(i) = max(real(eig(J - q(i)^2*diag([Da Db])))); end
[best, ib] = max(lm); band = q(lm > 0);
fprintf('\\n4) Unstable band q = %.3f ... %.3f; fastest q* = %.3f, rate %.5f, wavelength %.2f cells\\n', ...
        min(band), max(band), q(ib), best, 2*pi/q(ib));
end
function s = classify(T, D)
if D < 0, s = 'saddle (unstable)'; return; end
if abs(T) < 1e-12, s = 'centre'; return; end
if T^2 - 4*D >= 0, kind = 'node'; else, kind = 'spiral'; end
if T < 0, s = ['stable ' kind]; else, s = ['unstable ' kind]; end
end
`;

// ── julia/wk15_stability.jl ─────────────────
export const JL_STAB = `# Week 15 (Physical Chemistry 2) - Linear stability and the Turing instability
#   (T, Delta) classification, Turing's model f = k(16 - ab), g = k(ab - b - 12),
#   Turing conditions (critical Da/Db = 4) and the dispersion relation
using LinearAlgebra, Printf
function classify(T, D)
    D < 0 && return "saddle (unstable)"
    abs(T) < 1e-12 && return "centre"
    kind = T^2 - 4D >= 0 ? "node" : "spiral"
    (T < 0 ? "stable " : "unstable ") * kind
end
println("1) Classification by (T, Delta)")
for A in ([-1 0; 0 -2], [1 0; 0 -1], [-0.5 -2; 2 -0.5], [0.2 -1; 1 0.2], [0 -1; 1 0])
    A = float.(A); T = tr(A); D = det(A)
    @printf("   T = %+.2f, Delta = %+.2f: lambda = %s -> %s\\n", T, D, string(round.(eigvals(A), digits = 3)), classify(T, D))
end
k = 0.02; J = k .* [-4.0 -4.0; 4.0 3.0]; T = tr(J); D = det(J)
@printf("\\n2) Turing model at (4, 4): T = %.4f, Delta = %.6f -> %s\\n", T, D, classify(T, D))
println("\\n3) Turing conditions")
for r in (2, 3, 4, 5, 8)
    Da, Db = 0.02r, 0.02
    c1 = Db * J[1, 1] + Da * J[2, 2]; c2 = c1^2 - 4Da * Db * D
    v = abs(c2) < 1e-15 ? "threshold (marginal)" : (c1 > 0 && c2 > 0 ? "Turing unstable" : "stable")
    @printf("   Da/Db = %d: (i) %+.2e (ii) %+.2e -> %s\\n", r, c1, c2, v)
end
Da, Db = 0.1, 0.02
q = range(0, 2, length = 2001)
lm = [maximum(real.(eigvals(J - qq^2 * Diagonal([Da, Db])))) for qq in q]
ib = argmax(lm); band = q[lm .> 0]
@printf("\\n4) Unstable band q = %.3f ... %.3f; fastest q* = %.3f, rate %.5f, wavelength %.2f cells\\n",
        minimum(band), maximum(band), q[ib], lm[ib], 2π / q[ib])
`;

// ── cpp/wk15_stability.cpp ─────────────────
export const CPP_STAB = `// Week 15 (Physical Chemistry 2) - Linear stability and the Turing instability
//   (T, Delta) classification, Turing's model f = k(16 - ab), g = k(ab - b - 12),
//   Turing conditions (critical Da/Db = 4) and the dispersion relation
// build: g++ -O2 -std=c++17 wk15_stability.cpp -o stab && ./stab
#include <cstdio>
#include <cmath>
#include <initializer_list>
#include <complex>
#include <string>
using cd = std::complex<double>;
const double PI = 3.14159265358979323846;

void eig2(double a, double b, double c, double d, cd& l1, cd& l2) {
    double T = a + d, D = a * d - b * c;
    cd s = std::sqrt(cd(T * T - 4 * D, 0));
    l1 = (T + s) / 2.0; l2 = (T - s) / 2.0;
}
std::string classify(double T, double D) {
    if (D < 0) return "saddle (unstable)";
    if (std::fabs(T) < 1e-12) return "centre";
    std::string kind = (T * T - 4 * D >= 0) ? "node" : "spiral";
    return (T < 0 ? "stable " : "unstable ") + kind;
}
int main() {
    std::printf("1) Classification by (T, Delta)\\n");
    double M[5][4] = {{-1, 0, 0, -2}, {1, 0, 0, -1}, {-0.5, -2, 2, -0.5}, {0.2, -1, 1, 0.2}, {0, -1, 1, 0}};
    for (auto& m : M) {
        cd l1, l2; eig2(m[0], m[1], m[2], m[3], l1, l2);
        double T = m[0] + m[3], D = m[0] * m[3] - m[1] * m[2];
        std::printf("   T = %+.2f, Delta = %+.2f: lambda = %.3f%+.3fi, %.3f%+.3fi -> %s\\n", T, D,
                    l1.real(), l1.imag(), l2.real(), l2.imag(), classify(T, D).c_str());
    }
    double k = 0.02, a0 = 4, b0 = 4;
    double fa = -k * b0, fb = -k * a0, ga = k * b0, gb = k * (a0 - 1);
    double T = fa + gb, D = fa * gb - fb * ga;
    std::printf("\\n2) Turing's model at (a*, b*) = (4, 4): T = %.4f, Delta = %.6f -> %s\\n", T, D, classify(T, D).c_str());
    std::printf("\\n3) Turing conditions\\n");
    for (int r : {2, 3, 4, 5, 8}) {
        double Da = 0.02 * r, Db = 0.02, c1 = Db * fa + Da * gb, c2 = c1 * c1 - 4 * Da * Db * D;
        const char* v = std::fabs(c2) < 1e-15 ? "threshold (marginal)" : (c1 > 0 && c2 > 0 ? "Turing unstable" : "stable");
        std::printf("   Da/Db = %d: (i) %+.2e (ii) %+.2e -> %s\\n", r, c1, c2, v);
    }
    std::printf("\\n4) Dispersion relation, Da = 0.1, Db = 0.02\\n");
    double Da = 0.1, Db = 0.02, best = -1, qbest = 0, qlo = -1, qhi = -1;
    for (int i = 0; i <= 2000; ++i) {
        double q = 2.0 * i / 2000;
        cd l1, l2; eig2(fa - Da * q * q, fb, ga, gb - Db * q * q, l1, l2);
        double lm = std::max(l1.real(), l2.real());
        if (lm > best) { best = lm; qbest = q; }
        if (lm > 0) { if (qlo < 0) qlo = q; qhi = q; }
    }
    std::printf("   unstable band q = %.3f ... %.3f; fastest q* = %.3f, rate %.5f, wavelength %.2f cells\\n",
                qlo, qhi, qbest, best, 2 * PI / qbest);
}
`;

// ── python/wk15_reaction_diffusion.py ─────────────────
export const PY_RD = `"""
Week 15 (Physical Chemistry 2) - Reaction-diffusion simulations
  1) Turing's model on a 1D ring of cells (finite differences, as in the lecture):
        a_i' = Da (a_{i+1} + a_{i-1} - 2a_i) + k(16 - a_i b_i)
        b_i' = Db (b_{i+1} + b_{i-1} - 2b_i) + k(a_i b_i - b_i - beta_i),  beta_i = 12 + noise
     -> measured wavelength vs linear theory (6.5 cells)
  2) Gray-Scott model (Pearson 1993) on a 2D grid:
        U' = Du lap U - U V^2 + F(1 - U),   V' = Dv lap V + U V^2 - (F + k) V
     -> pattern statistics for a few (F, k)
"""
import numpy as np

rng = np.random.default_rng(1)

# ---------- 1) Turing 1D ----------
N, Da, Db, k = 400, 0.1, 0.02, 0.02
a = np.full(N, 4.0); b = np.full(N, 4.0)
beta = 12 + rng.uniform(-0.1, 0.1, N)
lap = lambda x: np.roll(x, 1) + np.roll(x, -1) - 2 * x
for step in range(40000):
    fa = k * (16 - a * b); fb = k * (a * b - b - beta)
    a += Da * lap(a) + fa
    b += Db * lap(b) + fb
    b = np.maximum(b, 0)
spec = np.abs(np.fft.rfft(b - b.mean()))**2
m = np.argmax(spec[1:]) + 1
print("1) Turing model, 1D ring of 400 cells, Da = 0.1, Db = 0.02, k = 0.02, 40 000 steps")
print(f"   b range {b.min():.2f} ... {b.max():.2f} (uniform state b = 4 has become a pattern)")
print(f"   FFT dominant mode m = {m} -> wavelength {N/m:.2f} cells (linear theory: fastest 6.50, band 4.8-9.3)")
print("   the nonlinear pattern settles inside the unstable band, slightly shorter than the fastest linear mode")

# ---------- 2) Gray-Scott 2D ----------
def gray_scott(F, kk, n=128, steps=8000, Du=0.16, Dv=0.08):
    U = np.ones((n, n)); V = np.zeros((n, n))
    c = slice(n // 2 - 8, n // 2 + 8)
    U[c, c] = 0.50; V[c, c] = 0.25
    U += 0.02 * rng.random((n, n)); V += 0.02 * rng.random((n, n))
    L = lambda X: np.roll(X, 1, 0) + np.roll(X, -1, 0) + np.roll(X, 1, 1) + np.roll(X, -1, 1) - 4 * X
    for _ in range(steps):
        uvv = U * V * V
        U += Du * L(U) - uvv + F * (1 - U)
        V += Dv * L(V) + uvv - (F + kk) * V
    return U, V

print("\\n2) Gray-Scott, 128 x 128, Du = 0.16, Dv = 0.08, dt = dx = 1, 8000 steps")
for name, F, kk in (("spots (mitosis-like)", 0.0367, 0.0649), ("stripes / labyrinth", 0.029, 0.057),
                    ("decay to U = 1", 0.010, 0.070)):
    U, V = gray_scott(F, kk)
    frac = np.mean(V > 0.2)
    print(f"   {name:22s} F = {F:.4f}, k = {kk:.4f}: area fraction with V > 0.2 = {frac:.3f}, V max = {V.max():.3f}")
print("   (outcome depends on (F, k): Pearson's map has spots, stripes, waves, chaos and extinction)")
`;

// ── matlab/wk15_reaction_diffusion.m ─────────────────
export const ML_RD = `% Week 15 (Physical Chemistry 2) - Reaction-diffusion simulations
%   1) Turing's model on a 1D ring (lecture finite-difference form), dominant wavelength by FFT
%   2) Gray-Scott (Pearson 1993) on a 128x128 periodic grid for three (F, k)
function wk15_reaction_diffusion()
rng(1);
N = 400; Da = 0.1; Db = 0.02; k = 0.02;
a = 4*ones(N,1); b = 4*ones(N,1); beta = 12 + 0.2*(rand(N,1) - 0.5);
lap = @(x) circshift(x,1) + circshift(x,-1) - 2*x;
for s = 1:40000
    fa = k*(16 - a.*b); fb = k*(a.*b - b - beta);
    a = a + Da*lap(a) + fa; b = max(b + Db*lap(b) + fb, 0);
end
P = abs(fft(b - mean(b))).^2; [~, m] = max(P(2:N/2+1));
fprintf('1) Turing 1D: b range %.2f ... %.2f, dominant mode m = %d -> wavelength %.2f cells (linear 6.50)\\n', min(b), max(b), m, N/m);
fprintf('\\n2) Gray-Scott 128x128, Du = 0.16, Dv = 0.08, 8000 steps\\n');
names = {'spots','stripes','decay'}; FF = [0.0367 0.029 0.010]; KK = [0.0649 0.057 0.070];
L = @(X) circshift(X,1,1) + circshift(X,-1,1) + circshift(X,1,2) + circshift(X,-1,2) - 4*X;
for p = 1:3
    n = 128; U = ones(n); V = zeros(n); c = n/2-7:n/2+8;
    U(c,c) = 0.5; V(c,c) = 0.25; U = U + 0.02*rand(n); V = V + 0.02*rand(n);
    for s = 1:8000
        uvv = U.*V.^2;
        U = U + 0.16*L(U) - uvv + FF(p)*(1 - U);
        V = V + 0.08*L(V) + uvv - (FF(p) + KK(p))*V;
    end
    fprintf('   %-8s F = %.4f, k = %.4f: area fraction V > 0.2 = %.3f, V max = %.3f\\n', names{p}, FF(p), KK(p), mean(V(:) > 0.2), max(V(:)));
end
end
`;

// ── julia/wk15_reaction_diffusion.jl ─────────────────
export const JL_RD = `# Week 15 (Physical Chemistry 2) - Reaction-diffusion simulations
#   1) Turing's model on a 1D ring (lecture finite-difference form), dominant wavelength by DFT
#   2) Gray-Scott (Pearson 1993) on a 128x128 periodic grid for three (F, k)
using Printf, Random, Statistics
Random.seed!(1)
N, Da, Db, k = 400, 0.1, 0.02, 0.02
a = fill(4.0, N); b = fill(4.0, N); beta = 12 .+ 0.2 .* (rand(N) .- 0.5)
lap(x) = circshift(x, 1) .+ circshift(x, -1) .- 2 .* x
for s in 1:40000
    fa = k .* (16 .- a .* b); fb = k .* (a .* b .- b .- beta)
    global a = a .+ Da .* lap(a) .+ fa
    global b = max.(b .+ Db .* lap(b) .+ fb, 0.0)
end
bm = b .- mean(b)
pw = [abs2(sum(bm .* cis.(-2π * m .* (0:N-1) ./ N))) for m in 1:N÷2]
m = argmax(pw)
@printf("1) Turing 1D: b range %.2f ... %.2f, dominant mode m = %d -> wavelength %.2f cells (linear 6.50)\\n", minimum(b), maximum(b), m, N / m)
println("\\n2) Gray-Scott 128x128, Du = 0.16, Dv = 0.08, 8000 steps")
L(X) = circshift(X, (1, 0)) .+ circshift(X, (-1, 0)) .+ circshift(X, (0, 1)) .+ circshift(X, (0, -1)) .- 4 .* X
for (name, F, kk) in (("spots", 0.0367, 0.0649), ("stripes", 0.029, 0.057), ("decay", 0.010, 0.070))
    n = 128; U = ones(n, n); V = zeros(n, n); c = n÷2-7:n÷2+8
    U[c, c] .= 0.5; V[c, c] .= 0.25; U .+= 0.02 .* rand(n, n); V .+= 0.02 .* rand(n, n)
    for s in 1:8000
        uvv = U .* V .^ 2
        U .+= 0.16 .* L(U) .- uvv .+ F .* (1 .- U)
        V .+= 0.08 .* L(V) .+ uvv .- (F + kk) .* V
    end
    @printf("   %-8s F = %.4f, k = %.4f: area fraction V > 0.2 = %.3f, V max = %.3f\\n", name, F, kk, mean(V .> 0.2), maximum(V))
end
`;

// ── cpp/wk15_reaction_diffusion.cpp ─────────────────
export const CPP_RD = `// Week 15 (Physical Chemistry 2) - Reaction-diffusion simulations
//   1) Turing's model on a 1D ring (lecture finite-difference form), dominant wavelength by DFT
//   2) Gray-Scott (Pearson 1993) on a 128x128 periodic grid for three (F, k)
// build: g++ -O2 -std=c++17 wk15_reaction_diffusion.cpp -o rd && ./rd
#include <cstdio>
#include <cmath>
#include <initializer_list>
#include <vector>
#include <random>
const double PI = 3.14159265358979323846;
int main() {
    std::mt19937 rng(1);
    std::uniform_real_distribution<double> U(-0.1, 0.1), U01(0, 1);
    const int N = 400; double Da = 0.1, Db = 0.02, k = 0.02;
    std::vector<double> a(N, 4.0), b(N, 4.0), beta(N), na(N), nb(N);
    for (auto& x : beta) x = 12 + U(rng);
    for (int s = 0; s < 40000; ++s) {
        for (int i = 0; i < N; ++i) {
            int l = (i + N - 1) % N, r = (i + 1) % N;
            na[i] = a[i] + Da * (a[l] + a[r] - 2 * a[i]) + k * (16 - a[i] * b[i]);
            nb[i] = b[i] + Db * (b[l] + b[r] - 2 * b[i]) + k * (a[i] * b[i] - b[i] - beta[i]);
            if (nb[i] < 0) nb[i] = 0;
        }
        a.swap(na); b.swap(nb);
    }
    double mean = 0, mn = 1e9, mx = -1e9;
    for (double x : b) { mean += x / N; mn = std::min(mn, x); mx = std::max(mx, x); }
    int mbest = 1; double pbest = 0;
    for (int m = 1; m <= N / 2; ++m) {
        double re = 0, im = 0;
        for (int i = 0; i < N; ++i) { re += (b[i] - mean) * std::cos(2 * PI * m * i / N); im -= (b[i] - mean) * std::sin(2 * PI * m * i / N); }
        if (re * re + im * im > pbest) { pbest = re * re + im * im; mbest = m; }
    }
    std::printf("1) Turing 1D: b range %.2f ... %.2f, dominant mode m = %d -> wavelength %.2f cells (linear: 6.50)\\n", mn, mx, mbest, double(N) / mbest);

    std::printf("\\n2) Gray-Scott 128x128, Du = 0.16, Dv = 0.08, 8000 steps\\n");
    struct P { const char* n; double F, k; } ps[] = {{"spots", 0.0367, 0.0649}, {"stripes", 0.029, 0.057}, {"decay", 0.010, 0.070}};
    const int n = 128;
    for (auto& p : ps) {
        std::vector<double> Uu(n * n, 1.0), V(n * n, 0.0), Un(n * n), Vn(n * n);
        for (int i = n / 2 - 8; i < n / 2 + 8; ++i) for (int j = n / 2 - 8; j < n / 2 + 8; ++j) { Uu[i * n + j] = 0.5; V[i * n + j] = 0.25; }
        for (int i = 0; i < n * n; ++i) { Uu[i] += 0.02 * U01(rng); V[i] += 0.02 * U01(rng); }
        for (int s = 0; s < 8000; ++s) {
            for (int i = 0; i < n; ++i) for (int j = 0; j < n; ++j) {
                int c = i * n + j, up = ((i + n - 1) % n) * n + j, dn = ((i + 1) % n) * n + j, lf = i * n + (j + n - 1) % n, rt = i * n + (j + 1) % n;
                double lu = Uu[up] + Uu[dn] + Uu[lf] + Uu[rt] - 4 * Uu[c], lv = V[up] + V[dn] + V[lf] + V[rt] - 4 * V[c];
                double uvv = Uu[c] * V[c] * V[c];
                Un[c] = Uu[c] + 0.16 * lu - uvv + p.F * (1 - Uu[c]);
                Vn[c] = V[c] + 0.08 * lv + uvv - (p.F + p.k) * V[c];
            }
            Uu.swap(Un); V.swap(Vn);
        }
        int cnt = 0; double vmax = 0;
        for (double x : V) { if (x > 0.2) ++cnt; vmax = std::max(vmax, x); }
        std::printf("   %-8s F = %.4f, k = %.4f: area fraction V > 0.2 = %.3f, V max = %.3f\\n", p.n, p.F, p.k, double(cnt) / (n * n), vmax);
    }
}
`;

// ── python/wk15_double_layer.py ─────────────────
export const PY_EDL = `"""
Week 15 (Physical Chemistry 2) - The electrical double layer
  1) Debye length kappa^-1 = sqrt(eps kB T / (2 z^2 e^2 c0 NA)) for a z:z electrolyte
  2) Gouy-Chapman: Poisson-Boltzmann d2psi/dx2 = (2 z e c0 NA/eps) sinh(z e psi / kB T)
     analytic solution tanh(z e psi/4kT) = tanh(z e psi0/4kT) exp(-kappa x)
     checked against a numerical shooting solution
  3) Grahame equation sigma = sqrt(8 eps kB T c0 NA) sinh(z e psi0 / 2kT) and capacitances
  4) Stern model: compact (Helmholtz) and diffuse capacitors in series
"""
import numpy as np
from scipy.integrate import solve_ivp

e, kB, NA, eps0 = 1.602176634e-19, 1.380649e-23, 6.02214076e23, 8.8541878128e-12
T, epsr = 298.15, 78.5
eps = epsr * eps0
kT_e = kB * T / e

print("1) Debye length in water at 298 K")
for c in (1e-4, 1e-3, 1e-2, 0.1, 1.0):
    for z in (1, 2):
        kap = np.sqrt(2 * z * z * e * e * c * 1000 * NA / (eps * kB * T))
        print(f"   c = {c:7.4f} M, z = {z}: 1/kappa = {1e9 / kap:7.3f} nm", end="")
        if z == 1: print(f"   (rule of thumb 0.304/sqrt(c) = {0.304 / np.sqrt(c):.3f} nm)")
        else: print()

print("\\n2) Gouy-Chapman profile, 0.01 M 1:1, psi0 = 100 mV")
c, z, psi0 = 0.01, 1, 0.100
kap = np.sqrt(2 * z * z * e * e * c * 1000 * NA / (eps * kB * T))
x = np.linspace(0, 5 / kap, 6)
g0 = np.tanh(z * psi0 / (4 * kT_e))
psi_an = 4 * kT_e / z * np.arctanh(g0 * np.exp(-kap * x))
# numerical: first integral gives dpsi/dx = -(2 kT kappa / z e) sinh(z e psi / 2kT); integrate it
sol = solve_ivp(lambda xx, p: [-(2 * kT_e * kap / z) * np.sinh(z * p[0] / (2 * kT_e))], [0, x[-1]], [psi0],
                t_eval=x, rtol=1e-10, atol=1e-14)
psi_dh = psi0 * np.exp(-kap * x)
for xi, pa, pn, pd in zip(x, psi_an, sol.y[0], psi_dh):
    print(f"   x = {xi*1e9:5.2f} nm: analytic {pa*1000:7.3f} mV, numerical {pn*1000:7.3f} mV, Debye-Hueckel {pd*1000:7.3f} mV")
print("   near the wall the full PB potential falls faster than the linear (Debye-Hueckel) estimate")

print("\\n3) Grahame equation and diffuse-layer capacitance (0.01 M, 1:1)")
for p0 in (0.025, 0.05, 0.1, 0.2):
    sig = np.sqrt(8 * eps * kB * T * c * 1000 * NA) * np.sinh(z * p0 / (2 * kT_e))
    Cd = eps * kap * np.cosh(z * p0 / (2 * kT_e))
    print(f"   psi0 = {p0*1000:5.0f} mV: sigma = {sig*100:.2f} uC/cm^2, C_diffuse = {Cd*100:.1f} uF/cm^2")
print(f"   small-potential limit C_d = eps kappa = {eps*kap*100:.1f} uF/cm^2")

print("\\n4) Stern model: 1/C = 1/C_H + 1/C_d")
dH = 0.3e-9; epsH = 6 * eps0
CH = epsH / dH
for c in (1e-3, 1e-2, 0.1, 1.0):
    kap = np.sqrt(2 * e * e * c * 1000 * NA / (eps * kB * T))
    Cd = eps * kap
    Ct = 1 / (1 / CH + 1 / Cd)
    print(f"   c = {c:6.3f} M: C_H = {CH*100:.1f}, C_d = {Cd*100:.1f}, total = {Ct*100:.1f} uF/cm^2")
print("   at high concentration the compact layer dominates (C -> C_H ~ 10-20 uF/cm^2, as measured)")
`;

// ── matlab/wk15_double_layer.m ─────────────────
export const ML_EDL = `% Week 15 (Physical Chemistry 2) - The electrical double layer
%   Debye length, Gouy-Chapman profile (analytic vs ode45), Grahame equation, Stern capacitance
function wk15_double_layer()
e = 1.602176634e-19; kB = 1.380649e-23; NA = 6.02214076e23; eps0 = 8.8541878128e-12;
T = 298.15; eps = 78.5*eps0; kTe = kB*T/e;
kap = @(c, z) sqrt(2*z^2*e^2*c*1000*NA/(eps*kB*T));
fprintf('1) Debye length\\n');
for c = [1e-4 1e-3 1e-2 0.1 1]
    fprintf('   c = %7.4f M: 1/kappa = %7.3f nm (1:1), %7.3f nm (2:2)\\n', c, 1e9/kap(c,1), 1e9/kap(c,2));
end
c = 0.01; z = 1; psi0 = 0.1; k1 = kap(c, z);
g0 = tanh(z*psi0/(4*kTe)); x = linspace(0, 5/k1, 6);
psiA = 4*kTe/z*atanh(g0*exp(-k1*x));
opts = odeset('RelTol', 1e-10, 'AbsTol', 1e-14);
[~, P] = ode45(@(xx, p) -(2*kTe*k1/z)*sinh(z*p/(2*kTe)), x, psi0, opts);
fprintf('\\n2) Gouy-Chapman, 0.01 M, psi0 = 100 mV\\n');
for i = 1:6
    fprintf('   x = %5.2f nm: analytic %7.3f mV, ode45 %7.3f mV, Debye-Hueckel %7.3f mV\\n', x(i)*1e9, psiA(i)*1e3, P(i)*1e3, psi0*exp(-k1*x(i))*1e3);
end
fprintf('\\n3) Grahame equation (0.01 M)\\n');
for p0 = [0.025 0.05 0.1 0.2]
    sig = sqrt(8*eps*kB*T*c*1000*NA)*sinh(z*p0/(2*kTe)); Cd = eps*k1*cosh(z*p0/(2*kTe));
    fprintf('   psi0 = %3.0f mV: sigma = %.2f uC/cm^2, C_d = %.1f uF/cm^2\\n', p0*1e3, sig*100, Cd*100);
end
fprintf('\\n4) Stern model (d_H = 0.3 nm, eps_H = 6)\\n');
CH = 6*eps0/0.3e-9;
for cc = [1e-3 1e-2 0.1 1]
    Cd = eps*kap(cc,1); Ct = 1/(1/CH + 1/Cd);
    fprintf('   c = %6.3f M: C_H = %.1f, C_d = %.1f, total = %.1f uF/cm^2\\n', cc, CH*100, Cd*100, Ct*100);
end
end
`;

// ── julia/wk15_double_layer.jl ─────────────────
export const JL_EDL = `# Week 15 (Physical Chemistry 2) - The electrical double layer
#   Debye length, Gouy-Chapman profile (analytic vs RK4), Grahame equation, Stern capacitance
using Printf
const e, kB, NA, eps0 = 1.602176634e-19, 1.380649e-23, 6.02214076e23, 8.8541878128e-12
const T = 298.15; const eps = 78.5eps0; const kTe = kB * T / e
kap(c, z) = sqrt(2z^2 * e^2 * c * 1000 * NA / (eps * kB * T))
println("1) Debye length")
for c in (1e-4, 1e-3, 1e-2, 0.1, 1.0)
    @printf("   c = %7.4f M: 1/kappa = %7.3f nm (1:1), %7.3f nm (2:2)\\n", c, 1e9 / kap(c, 1), 1e9 / kap(c, 2))
end
c, z, psi0 = 0.01, 1, 0.1; k1 = kap(c, z); g0 = tanh(z * psi0 / (4kTe))
rhs(p) = -(2kTe * k1 / z) * sinh(z * p / (2kTe))
println("\\n2) Gouy-Chapman, 0.01 M, psi0 = 100 mV")
let p = psi0, h = 1e-12, x = 0.0, every = round(Int, (1 / k1) / h)
    for i in 0:5every
        if i % every == 0
            an = 4kTe / z * atanh(g0 * exp(-k1 * x))
            @printf("   x = %5.2f nm: analytic %7.3f mV, RK4 %7.3f mV, Debye-Hueckel %7.3f mV\\n", x * 1e9, an * 1e3, p * 1e3, psi0 * exp(-k1 * x) * 1e3)
        end
        q1 = rhs(p); q2 = rhs(p + h / 2 * q1); q3 = rhs(p + h / 2 * q2); q4 = rhs(p + h * q3)
        p += h / 6 * (q1 + 2q2 + 2q3 + q4); x += h
    end
end
println("\\n3) Grahame equation (0.01 M)")
for p0 in (0.025, 0.05, 0.1, 0.2)
    sig = sqrt(8eps * kB * T * c * 1000 * NA) * sinh(z * p0 / (2kTe)); Cd = eps * k1 * cosh(z * p0 / (2kTe))
    @printf("   psi0 = %3.0f mV: sigma = %.2f uC/cm^2, C_d = %.1f uF/cm^2\\n", p0 * 1e3, sig * 100, Cd * 100)
end
println("\\n4) Stern model (d_H = 0.3 nm, eps_H = 6)")
CH = 6eps0 / 0.3e-9
for cc in (1e-3, 1e-2, 0.1, 1.0)
    Cd = eps * kap(cc, 1); Ct = 1 / (1 / CH + 1 / Cd)
    @printf("   c = %6.3f M: C_H = %.1f, C_d = %.1f, total = %.1f uF/cm^2\\n", cc, CH * 100, Cd * 100, Ct * 100)
end
`;

// ── cpp/wk15_double_layer.cpp ─────────────────
export const CPP_EDL = `// Week 15 (Physical Chemistry 2) - The electrical double layer
//   Debye length, Gouy-Chapman profile (analytic vs RK4), Grahame equation, Stern capacitance
// build: g++ -O2 -std=c++17 wk15_double_layer.cpp -o edl && ./edl
#include <cstdio>
#include <cmath>
#include <initializer_list>
const double e = 1.602176634e-19, kB = 1.380649e-23, NA = 6.02214076e23, eps0 = 8.8541878128e-12;
const double T = 298.15, eps = 78.5 * eps0, kTe = kB * T / e;
double kappa(double c, int z) { return std::sqrt(2.0 * z * z * e * e * c * 1000 * NA / (eps * kB * T)); }
int main() {
    std::printf("1) Debye length\\n");
    for (double c : {1e-4, 1e-3, 1e-2, 0.1, 1.0})
        std::printf("   c = %7.4f M: 1/kappa = %7.3f nm (1:1), %7.3f nm (2:2)\\n", c, 1e9 / kappa(c, 1), 1e9 / kappa(c, 2));
    double c = 0.01, psi0 = 0.1; int z = 1; double kap = kappa(c, z);
    std::printf("\\n2) Gouy-Chapman, 0.01 M, psi0 = 100 mV (analytic vs RK4 of dpsi/dx = -(2kT kappa/ze) sinh(ze psi/2kT))\\n");
    double g0 = std::tanh(z * psi0 / (4 * kTe));
    auto rhs = [&](double p) { return -(2 * kTe * kap / z) * std::sinh(z * p / (2 * kTe)); };
    double p = psi0, x = 0, h = 1e-12, xmax = 5 / kap;
    int every = int(std::round((1 / kap) / h));
    for (int i = 0; x <= xmax + 1e-15; ++i) {
        if (i % every == 0) {
            double an = 4 * kTe / z * std::atanh(g0 * std::exp(-kap * x));
            std::printf("   x = %5.2f nm: analytic %7.3f mV, RK4 %7.3f mV, Debye-Hueckel %7.3f mV\\n", x * 1e9, an * 1e3, p * 1e3, psi0 * std::exp(-kap * x) * 1e3);
        }
        double k1 = rhs(p), k2 = rhs(p + h / 2 * k1), k3 = rhs(p + h / 2 * k2), k4 = rhs(p + h * k3);
        p += h / 6 * (k1 + 2 * k2 + 2 * k3 + k4); x += h;
    }
    std::printf("\\n3) Grahame equation (0.01 M)\\n");
    for (double p0 : {0.025, 0.05, 0.1, 0.2}) {
        double sig = std::sqrt(8 * eps * kB * T * c * 1000 * NA) * std::sinh(z * p0 / (2 * kTe));
        double Cd = eps * kap * std::cosh(z * p0 / (2 * kTe));
        std::printf("   psi0 = %3.0f mV: sigma = %.2f uC/cm^2, C_d = %.1f uF/cm^2\\n", p0 * 1e3, sig * 100, Cd * 100);
    }
    std::printf("\\n4) Stern model (d_H = 0.3 nm, eps_H = 6)\\n");
    double CH = 6 * eps0 / 0.3e-9;
    for (double cc : {1e-3, 1e-2, 0.1, 1.0}) {
        double Cd = eps * kappa(cc, 1), Ct = 1 / (1 / CH + 1 / Cd);
        std::printf("   c = %6.3f M: C_H = %.1f, C_d = %.1f, total = %.1f uF/cm^2\\n", cc, CH * 100, Cd * 100, Ct * 100);
    }
}
`;

// ── python/wk15_electrode_kinetics.py ─────────────────
export const PY_EK = `"""
Week 15 (Physical Chemistry 2) - Electrode kinetics
  1) Butler-Volmer j = j0 [exp((1-a) f eta) - exp(-a f eta)], f = F/RT; low- and high-overpotential limits
  2) Tafel analysis of the lecture data (Pt, Fe3+/Fe2+, 298 K, area 2.0 cm^2)
  3) lecture examples: Ag+ reduction rate ratio, and the H+/H2 example (j0 from a 10 mV measurement)
  4) cyclic voltammetry of a reversible couple by finite differences:
     peak separation ~ 57 mV and the Randles-Sevcik peak current 0.4463 n F A C sqrt(n F v D / RT)
  5) cell voltage of a working cell: E_eq - eta_act - IR - eta_conc
"""
import numpy as np

F, R, T = 96485.332, 8.314462618, 298.15
f = F / (R * T)
print(f"f = F/RT = {f:.3f} V^-1  (RT/F = {1000/f:.2f} mV)")

# ---------- 1) Butler-Volmer ----------
def bv(eta, j0=1.0, a=0.5):
    return j0 * (np.exp((1 - a) * f * eta) - np.exp(-a * f * eta))
print("\\n1) Butler-Volmer, j0 = 1, alpha = 0.5")
for eta in (0.005, 0.025, 0.1, 0.2):
    print(f"   eta = {eta*1000:5.0f} mV: j/j0 = {bv(eta):10.4f}   linear f*eta = {f*eta:8.4f}   Tafel exp((1-a)f eta) = {np.exp(0.5*f*eta):10.4f}")
print(f"   charge-transfer resistance R_ct = RT/(F j0) = {1000/f:.2f} mV per unit j0")
print(f"   Tafel slope for alpha = 0.5: 2.303 RT/((1-a)F) = {2.303/(0.5*f)*1000:.1f} mV/decade")

# ---------- 2) Tafel fit ----------
eta = np.array([50, 100, 150, 200, 250.0])          # mV
I = np.array([8.8, 25.0, 58.0, 131, 298])           # mA
j = I / 2.0                                          # mA/cm^2
y = np.log(j)
m, c = np.polyfit(eta[1:], y[1:], 1)                 # high-overpotential points (eta >= 100 mV)
alpha = 1 - m / (f / 1000)
print("\\n2) Tafel plot of ln(j) vs eta (eta >= 100 mV)")
print(f"   ln j values: {np.round(y, 2)}")
print(f"   slope (1-a)f = {m:.4f} mV^-1, intercept ln j0 = {c:.2f} -> j0 = {np.exp(c):.2f} mA/cm^2, alpha = {alpha:.2f}")
print("   (the 50 mV point lies below the line: the reverse current is not yet negligible)")

# ---------- 3) lecture examples ----------
r = np.exp(-0.5 * f * (-0.2)) / np.exp(-0.5 * f * 0.2)
print("\\n3a) Ag+ + e- -> Ag: cathodic rate at eta = -0.2 V vs +0.2 V (alpha = 0.5)")
print(f"   ratio = exp(alpha f 0.4) = {r:.0f}  (lecture rounds 49/0.02 = 2450)")
jm = 0.62 / 2.0
j0 = jm / (np.exp(0.5 * f * 0.010) - np.exp(-0.5 * f * 0.010))
print("3b) H+/H2 on Pt, 2 cm^2, I = 0.62 mA at eta = 10 mV, alpha = 0.5")
print(f"   j0 = {j0:.3f} mA/cm^2;  j(+100 mV) = {j0*(np.exp(0.5*f*0.1)-np.exp(-0.5*f*0.1)):.2f} mA/cm^2,"
      f"  j(-100 mV) = {j0*(np.exp(-0.5*f*0.1)-np.exp(0.5*f*0.1)):.2f} mA/cm^2")

# ---------- 4) CV simulation ----------
def cv(v=0.1, D=1e-9, C=1.0, E0=0.0, Ei=0.3, Ev=-0.3, n=1, nx=1000):
    # reduction O + e -> R, Nernstian boundary; units SI (C in mol/m^3)
    t_end = 2 * (Ei - Ev) / v
    L = 6 * np.sqrt(D * t_end)
    dx = L / nx
    dt = 0.4 * dx * dx / D
    O = np.full(nx, C); Rr = np.zeros(nx)
    t, Es, Is = 0.0, [], []
    while t < t_end:
        E = Ei - v * t if t < t_end / 2 else Ev + v * (t - t_end / 2)
        th = np.exp(n * f * (E - E0))           # O/R at surface
        tot = C                                 # equal D: O + R = C at the surface
        O[0] = tot * th / (1 + th); Rr[0] = tot - O[0]
        flux = D * (-3 * O[0] + 4 * O[1] - O[2]) / (2 * dx)   # mol m^-2 s^-1 of O consumed (2nd order)
        Is.append(n * F * flux); Es.append(E)
        O[1:-1] += D * dt / dx**2 * (O[2:] - 2 * O[1:-1] + O[:-2])
        Rr[1:-1] += D * dt / dx**2 * (Rr[2:] - 2 * Rr[1:-1] + Rr[:-2])
        t += dt
    return np.array(Es), np.array(Is)
E, Ic = cv()
half = len(E) // 2
Epc = E[:half][np.argmax(Ic[:half])]; Epa = E[half:][np.argmin(Ic[half:])]
ip = Ic[:half].max()
rs = 0.4463 * F * 1.0 * np.sqrt(F * 0.1 * 1e-9 / (R * T))
print("\\n4) CV, reversible one-electron couple, v = 0.1 V/s, D = 1e-9 m^2/s, C = 1 mM")
print(f"   E_pc = {Epc*1000:.1f} mV, E_pa = {Epa*1000:.1f} mV, separation = {(Epa-Epc)*1000:.1f} mV (theory ~57-59 mV)")
print(f"   i_p = {ip:.3f} A/m^2 vs Randles-Sevcik {rs:.3f} A/m^2 (ratio {ip/rs:.3f})")

# ---------- 5) working cell ----------
print("\\n5) Working galvanic cell: V = E_eq - (2RT/F) asinh(j/2j0) x 2 electrodes - j R_s - eta_conc")
Eeq, j0a, j0c, Rs, jlim = 1.20, 0.1, 1e-3, 0.1, 1.5   # V, A/cm^2, A/cm^2, ohm cm^2, A/cm^2 (fuel-cell-like)
for jj in (0.01, 0.2, 0.5, 1.0, 1.4):
    ea = (2 / f) * np.arcsinh(jj / (2 * j0a)); ec = (2 / f) * np.arcsinh(jj / (2 * j0c))
    econc = -(1 / f) * np.log(1 - jj / jlim)
    print(f"   j = {jj:.2f} A/cm^2: eta_act = {ea+ec:.3f} V, IR = {jj*Rs:.3f} V, eta_conc = {econc:.3f} V -> V_cell = {Eeq-ea-ec-jj*Rs-econc:.3f} V")
`;

// ── matlab/wk15_electrode_kinetics.m ─────────────────
export const ML_EK = `% Week 15 (Physical Chemistry 2) - Electrode kinetics
%   Butler-Volmer, Tafel fit of the lecture data, lecture examples, reversible CV, working-cell voltage
function wk15_electrode_kinetics()
F = 96485.332; R = 8.314462618; T = 298.15; f = F/(R*T);
fprintf('f = F/RT = %.3f V^-1\\n\\n1) Butler-Volmer, alpha = 0.5\\n', f);
for eta = [0.005 0.025 0.1 0.2]
    fprintf('   eta = %3.0f mV: j/j0 = %9.4f (linear %7.4f, Tafel %9.4f)\\n', eta*1e3, exp(0.5*f*eta) - exp(-0.5*f*eta), f*eta, exp(0.5*f*eta));
end
eta = [50 100 150 200 250]; I = [8.8 25.0 58.0 131 298];
P = polyfit(eta(2:end), log(I(2:end)/2), 1);
fprintf('\\n2) Tafel fit: slope %.4f mV^-1, ln j0 = %.2f -> j0 = %.2f mA/cm^2, alpha = %.2f\\n', P(1), P(2), exp(P(2)), 1 - P(1)/(f/1000));
fprintf('\\n3a) Ag+ rate ratio: %.0f\\n', exp(0.5*f*0.4));
j0 = 0.31/(exp(0.5*f*0.01) - exp(-0.5*f*0.01));
fprintf('3b) H+/H2: j0 = %.3f mA/cm^2, j(+/-100 mV) = +/-%.2f mA/cm^2\\n', j0, j0*(exp(0.05*f) - exp(-0.05*f)));
v = 0.1; D = 1e-9; C = 1; Ei = 0.3; Ev = -0.3; nx = 1000;
tend = 2*(Ei - Ev)/v; L = 6*sqrt(D*tend); dx = L/nx; dt = 0.4*dx^2/D; lam = D*dt/dx^2;
O = C*ones(nx,1); Rr = zeros(nx,1); ipc = -inf; ipa = inf; Epc = 0; Epa = 0;
for t = 0:dt:tend
    if t < tend/2, E = Ei - v*t; else, E = Ev + v*(t - tend/2); end
    th = exp(f*E); O(1) = C*th/(1 + th); Rr(1) = C - O(1);
    i = F*D*(-3*O(1) + 4*O(2) - O(3))/(2*dx);
    if t < tend/2 && i > ipc, ipc = i; Epc = E; end
    if t >= tend/2 && i < ipa, ipa = i; Epa = E; end
    O(2:end-1) = O(2:end-1) + lam*(O(3:end) - 2*O(2:end-1) + O(1:end-2));
    Rr(2:end-1) = Rr(2:end-1) + lam*(Rr(3:end) - 2*Rr(2:end-1) + Rr(1:end-2));
end
rs = 0.4463*F*C*sqrt(F*v*D/(R*T));
fprintf('\\n4) CV: E_pc = %.1f mV, E_pa = %.1f mV, separation %.1f mV; i_p = %.3f vs Randles-Sevcik %.3f A/m^2\\n', Epc*1e3, Epa*1e3, (Epa - Epc)*1e3, ipc, rs);
fprintf('\\n5) Working cell\\n');
for j = [0.01 0.2 0.5 1.0 1.4]
    ea = 2/f*asinh(j/0.2); ec = 2/f*asinh(j/2e-3); ecn = -log(1 - j/1.5)/f;
    fprintf('   j = %.2f A/cm^2: eta_act = %.3f, IR = %.3f, eta_conc = %.3f -> V = %.3f V\\n', j, ea + ec, 0.1*j, ecn, 1.2 - ea - ec - 0.1*j - ecn);
end
end
`;

// ── julia/wk15_electrode_kinetics.jl ─────────────────
export const JL_EK = `# Week 15 (Physical Chemistry 2) - Electrode kinetics
#   Butler-Volmer, Tafel fit of the lecture data, lecture examples, reversible CV, working-cell voltage
using Printf, Statistics
const F, R, T = 96485.332, 8.314462618, 298.15
const f = F / (R * T)
@printf("f = F/RT = %.3f V^-1\\n\\n1) Butler-Volmer, alpha = 0.5\\n", f)
for eta in (0.005, 0.025, 0.1, 0.2)
    @printf("   eta = %3.0f mV: j/j0 = %9.4f (linear %7.4f, Tafel %9.4f)\\n", eta * 1e3, exp(0.5f * eta) - exp(-0.5f * eta), f * eta, exp(0.5f * eta))
end
eta = [100, 150, 200, 250.0]; y = log.([25.0, 58.0, 131, 298] ./ 2)
m = sum((eta .- mean(eta)) .* (y .- mean(y))) / sum((eta .- mean(eta)) .^ 2); c = mean(y) - m * mean(eta)
@printf("\\n2) Tafel fit: slope %.4f mV^-1, ln j0 = %.2f -> j0 = %.2f mA/cm^2, alpha = %.2f\\n", m, c, exp(c), 1 - m / (f / 1000))
@printf("\\n3a) Ag+ rate ratio: %.0f\\n", exp(0.5f * 0.4))
j0 = 0.31 / (exp(0.005f) - exp(-0.005f))
@printf("3b) H+/H2: j0 = %.3f mA/cm^2, j(+/-100 mV) = +/-%.2f mA/cm^2\\n", j0, j0 * (exp(0.05f) - exp(-0.05f)))
function cv(; v = 0.1, D = 1e-9, C = 1.0, Ei = 0.3, Ev = -0.3, nx = 1000)
    tend = 2(Ei - Ev) / v; L = 6sqrt(D * tend); dx = L / nx; dt = 0.4dx^2 / D; lam = D * dt / dx^2
    O = fill(C, nx); Rr = zeros(nx); ipc, ipa, Epc, Epa = -Inf, Inf, 0.0, 0.0
    t = 0.0
    while t < tend
        E = t < tend / 2 ? Ei - v * t : Ev + v * (t - tend / 2)
        th = exp(f * E); O[1] = C * th / (1 + th); Rr[1] = C - O[1]
        i = F * D * (-3O[1] + 4O[2] - O[3]) / (2dx)
        if t < tend / 2 && i > ipc; ipc, Epc = i, E; end
        if t >= tend / 2 && i < ipa; ipa, Epa = i, E; end
        O[2:end-1] .+= lam .* (O[3:end] .- 2 .* O[2:end-1] .+ O[1:end-2])
        Rr[2:end-1] .+= lam .* (Rr[3:end] .- 2 .* Rr[2:end-1] .+ Rr[1:end-2])
        t += dt
    end
    Epc, Epa, ipc, 0.4463F * C * sqrt(F * v * D / (R * T))
end
Epc, Epa, ip, rs = cv()
@printf("\\n4) CV: E_pc = %.1f mV, E_pa = %.1f mV, separation %.1f mV; i_p = %.3f vs Randles-Sevcik %.3f A/m^2\\n", Epc * 1e3, Epa * 1e3, (Epa - Epc) * 1e3, ip, rs)
println("\\n5) Working cell")
for j in (0.01, 0.2, 0.5, 1.0, 1.4)
    ea = 2 / f * asinh(j / 0.2); ec = 2 / f * asinh(j / 2e-3); ecn = -log(1 - j / 1.5) / f
    @printf("   j = %.2f A/cm^2: eta_act = %.3f, IR = %.3f, eta_conc = %.3f -> V = %.3f V\\n", j, ea + ec, 0.1j, ecn, 1.2 - ea - ec - 0.1j - ecn)
end
`;

// ── cpp/wk15_electrode_kinetics.cpp ─────────────────
export const CPP_EK = `// Week 15 (Physical Chemistry 2) - Electrode kinetics
//   Butler-Volmer, Tafel fit of the lecture data, lecture examples, reversible CV, working-cell voltage
// build: g++ -O2 -std=c++17 wk15_electrode_kinetics.cpp -o ek && ./ek
#include <cstdio>
#include <cmath>
#include <initializer_list>
#include <vector>
const double F = 96485.332, R = 8.314462618, T = 298.15, f = F / (R * T);
int main() {
    std::printf("f = F/RT = %.3f V^-1\\n\\n1) Butler-Volmer, alpha = 0.5\\n", f);
    for (double eta : {0.005, 0.025, 0.1, 0.2})
        std::printf("   eta = %3.0f mV: j/j0 = %9.4f  (linear %7.4f, Tafel %9.4f)\\n", eta * 1e3,
                    std::exp(0.5 * f * eta) - std::exp(-0.5 * f * eta), f * eta, std::exp(0.5 * f * eta));
    std::printf("   Tafel slope (alpha = 0.5) = %.1f mV/decade\\n", 2.303 / (0.5 * f) * 1e3);

    double eta[] = {50, 100, 150, 200, 250}, I[] = {8.8, 25.0, 58.0, 131, 298};
    double sx = 0, sy = 0, sxx = 0, sxy = 0; int n = 0;
    for (int i = 1; i < 5; ++i) { double y = std::log(I[i] / 2.0); sx += eta[i]; sy += y; sxx += eta[i] * eta[i]; sxy += eta[i] * y; ++n; }
    double m = (n * sxy - sx * sy) / (n * sxx - sx * sx), c = (sy - m * sx) / n;
    std::printf("\\n2) Tafel fit: slope %.4f mV^-1, ln j0 = %.2f -> j0 = %.2f mA/cm^2, alpha = %.2f\\n", m, c, std::exp(c), 1 - m / (f / 1000));

    std::printf("\\n3a) Ag+ rate ratio (eta = -0.2 vs +0.2 V): %.0f\\n", std::exp(0.5 * f * 0.4));
    double j0 = 0.31 / (std::exp(0.5 * f * 0.01) - std::exp(-0.5 * f * 0.01));
    std::printf("3b) H+/H2: j0 = %.3f mA/cm^2, j(+100 mV) = %.2f, j(-100 mV) = %.2f mA/cm^2\\n", j0,
                j0 * (std::exp(0.05 * f) - std::exp(-0.05 * f)), -j0 * (std::exp(0.05 * f) - std::exp(-0.05 * f)));

    // CV
    double v = 0.1, D = 1e-9, C = 1.0, Ei = 0.3, Ev = -0.3; int nx = 1000;
    double tend = 2 * (Ei - Ev) / v, L = 6 * std::sqrt(D * tend), dx = L / nx, dt = 0.4 * dx * dx / D;
    std::vector<double> O(nx, C), Rr(nx, 0.0), On(nx), Rn(nx);
    double ipc = -1e9, Epc = 0, ipa = 1e9, Epa = 0;
    for (double t = 0; t < tend; t += dt) {
        double E = t < tend / 2 ? Ei - v * t : Ev + v * (t - tend / 2);
        double th = std::exp(f * E);
        O[0] = C * th / (1 + th); Rr[0] = C - O[0];
        double i = F * D * (-3 * O[0] + 4 * O[1] - O[2]) / (2 * dx);
        if (t < tend / 2 && i > ipc) { ipc = i; Epc = E; }
        if (t >= tend / 2 && i < ipa) { ipa = i; Epa = E; }
        double lam = D * dt / (dx * dx);
        for (int k = 1; k < nx - 1; ++k) { On[k] = O[k] + lam * (O[k + 1] - 2 * O[k] + O[k - 1]); Rn[k] = Rr[k] + lam * (Rr[k + 1] - 2 * Rr[k] + Rr[k - 1]); }
        On[0] = O[0]; Rn[0] = Rr[0]; On[nx - 1] = C; Rn[nx - 1] = 0;
        O.swap(On); Rr.swap(Rn);
    }
    double rs = 0.4463 * F * C * std::sqrt(F * v * D / (R * T));
    std::printf("\\n4) CV: E_pc = %.1f mV, E_pa = %.1f mV, separation %.1f mV; i_p = %.3f A/m^2 vs Randles-Sevcik %.3f\\n",
                Epc * 1e3, Epa * 1e3, (Epa - Epc) * 1e3, ipc, rs);

    std::printf("\\n5) Working cell (E_eq 1.20 V, j0a 0.1, j0c 1e-3 A/cm^2, R_s 0.1 ohm cm^2, j_lim 1.5 A/cm^2)\\n");
    for (double j : {0.01, 0.2, 0.5, 1.0, 1.4}) {
        double ea = 2 / f * std::asinh(j / 0.2), ec = 2 / f * std::asinh(j / 2e-3), ecn = -std::log(1 - j / 1.5) / f;
        std::printf("   j = %.2f: eta_act = %.3f, IR = %.3f, eta_conc = %.3f -> V = %.3f V\\n", j, ea + ec, 0.1 * j, ecn, 1.2 - ea - ec - 0.1 * j - ecn);
    }
}
`;
