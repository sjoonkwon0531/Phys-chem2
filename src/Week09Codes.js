/* ============================================================
   Week09Codes.js — Physical Chemistry 2, Week 9
   Raw code samples: Reaction Dynamics
   - 4 topics: collision_rrk, diffusion_transport,
               eyring_tst, dla_aggregation
   - 4 languages: Python, MATLAB, Julia, C++
   Imported by Week09App.jsx > RawCodes tab.
   Auto-generated from codes/ — edit the standalone files, then regenerate.
   ============================================================ */

// ── python/wk09_collision_rrk.py ─────────────────
export const PY_COLL = `"""
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
print(f"    A_theory = sigma c_rel N_A = {sigma*crel*NA*1e3:.3e} dm^3 mol^-1 s^-1\\n")

# -- (2) steric factors from the lecture table -------------------
table = [("2NOCl -> 2NO + 2Cl", 9.4e9, 5.9e10), ("2ClO -> Cl2 + O2", 6.3e7, 2.5e10),
         ("H2 + C2H4 -> C2H6", 1.24e6, 7.4e11), ("K + Br2 -> KBr + Br", 1.0e12, 2.1e11)]
print("(2) steric factor P = A_exp / A_theory")
for name, aexp, ath in table:
    print(f"    {name:22s} P = {aexp/ath:.2e}")
print("    -> P > 1 for K + Br2: the electron 'harpoon' reacts before contact\\n")

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
print(f"\\n    thermal average (s = {s}, E0/kT = {E0/kT:.0f}):  quadrature {ratio:.6e}"
      f"   exp(-E0/kT) = {np.exp(-E0/kT):.6e}")
print("    -> the s-dependence cancels: RRK reproduces the Arrhenius factor")
`;

// ── matlab/wk09_collision_rrk.m ─────────────────
export const ML_COLL = `% Wk09 — Collision theory, steric factor, and the RRK model
% Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
%
% (1) Z_AA = (1/2) sigma c_rel n^2,  c_rel = (16 kT / pi m)^(1/2)
% (2) steric factor P = A_exp / A_theory
% (3) RRK: P(e1 >= E0 | E) = (1 - E0/E)^(s-1), Monte Carlo on the energy simplex;
%     thermal average with rho ~ E^(s-1) gives k(T) = nu exp(-E0/kT)
%
% Run:  wk09_collision_rrk
clear; rng(9);
KB = 1.380649e-23; NA = 6.02214076e23; AMU = 1.66053906660e-27;

% (1) N2 at 298.15 K, 1 bar, sigma = 0.43 nm^2
T = 298.15; p = 1e5; sigma = 0.43e-18; m = 28.0134*AMU;
n = p/(KB*T); cbar = sqrt(8*KB*T/(pi*m)); crel = sqrt(2)*cbar;
z = sigma*crel*n; ZAA = 0.5*sigma*crel*n^2;
fprintf('(1) N2, 298.15 K, 1 bar, sigma = 0.43 nm^2\\n');
fprintf('    n = %.3e m^-3, mean speed = %.1f m/s, relative speed = %.1f m/s\\n', n, cbar, crel);
fprintf('    z = %.3e s^-1,  Z_AA = %.3e m^-3 s^-1 = %.3e mol dm^-3 s^-1\\n', z, ZAA, ZAA/NA/1e3);
fprintf('    A_theory = %.3e dm^3 mol^-1 s^-1\\n\\n', sigma*crel*NA*1e3);

% (2) steric factors
names = {'2NOCl -> 2NO + 2Cl', '2ClO -> Cl2 + O2', 'H2 + C2H4 -> C2H6', 'K + Br2 -> KBr + Br'};
Aexp = [9.4e9 6.3e7 1.24e6 1.0e12]; Ath = [5.9e10 2.5e10 7.4e11 2.1e11];
fprintf('(2) steric factor P = A_exp / A_theory\\n');
for i = 1:4, fprintf('    %-22s P = %.2e\\n', names{i}, Aexp(i)/Ath(i)); end

% (3) RRK Monte Carlo: uniform point on the simplex = normalised exponentials
fprintf('\\n(3) RRK  P(e1 >= E0|E) = (1 - E0/E)^(s-1)\\n     s   E0/E    formula     Monte Carlo\\n');
N = 400000;
for s = [2 3 5 10]
    for x = [0.2 0.5]
        g = -log(rand(N, s));
        e1 = g(:,1) ./ sum(g, 2);
        fprintf('    %2d   %.1f   %.5f     %.5f\\n', s, x, (1-x)^(s-1), mean(e1 >= x));
    end
end
s = 6; E0 = 1; kT = 0.25;
E = linspace(0, 60*kT, 600001);
w = E.^(s-1) .* exp(-E/kT);
kE = zeros(size(E)); msk = E >= E0; kE(msk) = (1 - E0./E(msk)).^(s-1);
fprintf('\\n    thermal average (s = 6, E0/kT = 4): quadrature %.6e   exp(-E0/kT) = %.6e\\n', ...
        trapz(E, kE.*w)/trapz(E, w), exp(-E0/kT));
`;

// ── julia/wk09_collision_rrk.jl ─────────────────
export const JL_COLL = `# Wk09 — Collision theory, steric factor, and the RRK model
# Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
#
# (1) Z_AA = (1/2) sigma c_rel n^2,  c_rel = (16 kT / pi m)^(1/2)
# (2) steric factor P = A_exp / A_theory
# (3) RRK: P(e1 >= E0 | E) = (1 - E0/E)^(s-1), Monte Carlo on the energy simplex;
#     thermal average with rho ~ E^(s-1) gives k(T) = nu exp(-E0/kT)
#
# Run:  julia wk09_collision_rrk.jl
using Printf, Random, Statistics
Random.seed!(9)
const KB, NA, AMU = 1.380649e-23, 6.02214076e23, 1.66053906660e-27

# (1) N2 at 298.15 K, 1 bar, sigma = 0.43 nm^2
T, p, σ, m = 298.15, 1e5, 0.43e-18, 28.0134AMU
n = p / (KB * T); cbar = sqrt(8KB * T / (π * m)); crel = sqrt(2) * cbar
z = σ * crel * n; ZAA = 0.5σ * crel * n^2
println("(1) N2, 298.15 K, 1 bar, sigma = 0.43 nm^2")
@printf("    n = %.3e m^-3, mean speed = %.1f m/s, relative speed = %.1f m/s\\n", n, cbar, crel)
@printf("    z = %.3e s^-1,  Z_AA = %.3e m^-3 s^-1 = %.3e mol dm^-3 s^-1\\n", z, ZAA, ZAA / NA / 1e3)
@printf("    A_theory = %.3e dm^3 mol^-1 s^-1\\n\\n", σ * crel * NA * 1e3)

# (2) steric factors
table = [("2NOCl -> 2NO + 2Cl", 9.4e9, 5.9e10), ("2ClO -> Cl2 + O2", 6.3e7, 2.5e10),
         ("H2 + C2H4 -> C2H6", 1.24e6, 7.4e11), ("K + Br2 -> KBr + Br", 1.0e12, 2.1e11)]
println("(2) steric factor P = A_exp / A_theory")
for (name, a, b) in table
    @printf("    %-22s P = %.2e\\n", name, a / b)
end

# (3) RRK Monte Carlo
println("\\n(3) RRK  P(e1 >= E0|E) = (1 - E0/E)^(s-1)\\n     s   E0/E    formula     Monte Carlo")
N = 400_000
for s in (2, 3, 5, 10), x in (0.2, 0.5)
    g = randexp(N, s)
    e1 = g[:, 1] ./ vec(sum(g, dims=2))
    @printf("    %2d   %.1f   %.5f     %.5f\\n", s, x, (1 - x)^(s - 1), mean(e1 .>= x))
end
s, E0, kT = 6, 1.0, 0.25
E = range(0, 60kT, length=600_001)
w = E .^ (s - 1) .* exp.(-E ./ kT)
kE = [e >= E0 ? (1 - E0 / e)^(s - 1) : 0.0 for e in E]
@printf("\\n    thermal average (s = 6, E0/kT = 4): quadrature %.6e   exp(-E0/kT) = %.6e\\n",
        sum(kE .* w) / sum(w), exp(-E0 / kT))
`;

// ── cpp/wk09_collision_rrk.cpp ─────────────────
export const CPP_COLL = `// Wk09 — Collision theory, steric factor, and the RRK model
// Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
//
// (1) Z_AA = (1/2) sigma c_rel n^2,  c_rel = (16 kT / pi m)^(1/2)
// (2) steric factor P = A_exp / A_theory
// (3) RRK: P(e1 >= E0 | E) = (1 - E0/E)^(s-1), Monte Carlo on the energy simplex;
//     thermal average with rho ~ E^(s-1) gives k(T) = nu exp(-E0/kT)
//
// Build:  g++ -O2 -std=c++17 wk09_collision_rrk.cpp -o wk09_collision_rrk
#include <cstdio>
#include <cmath>
#include <random>

int main() {
    const double KB = 1.380649e-23, NA = 6.02214076e23, AMU = 1.66053906660e-27;
    std::mt19937_64 rng(9);
    std::exponential_distribution<double> expo(1.0);

    // (1) N2 at 298.15 K, 1 bar, sigma = 0.43 nm^2
    double T = 298.15, p = 1e5, sigma = 0.43e-18, m = 28.0134 * AMU;
    double n = p / (KB * T), cbar = std::sqrt(8 * KB * T / (M_PI * m)), crel = std::sqrt(2.0) * cbar;
    double z = sigma * crel * n, ZAA = 0.5 * sigma * crel * n * n;
    std::printf("(1) N2, 298.15 K, 1 bar, sigma = 0.43 nm^2\\n");
    std::printf("    n = %.3e m^-3, mean speed = %.1f m/s, relative speed = %.1f m/s\\n", n, cbar, crel);
    std::printf("    z = %.3e s^-1,  Z_AA = %.3e m^-3 s^-1 = %.3e mol dm^-3 s^-1\\n", z, ZAA, ZAA / NA / 1e3);
    std::printf("    A_theory = %.3e dm^3 mol^-1 s^-1\\n\\n", sigma * crel * NA * 1e3);

    // (2) steric factors
    const char* name[4] = {"2NOCl -> 2NO + 2Cl", "2ClO -> Cl2 + O2", "H2 + C2H4 -> C2H6", "K + Br2 -> KBr + Br"};
    double aexp[4] = {9.4e9, 6.3e7, 1.24e6, 1.0e12}, ath[4] = {5.9e10, 2.5e10, 7.4e11, 2.1e11};
    std::printf("(2) steric factor P = A_exp / A_theory\\n");
    for (int i = 0; i < 4; ++i) std::printf("    %-22s P = %.2e\\n", name[i], aexp[i] / ath[i]);

    // (3) RRK Monte Carlo
    std::printf("\\n(3) RRK  P(e1 >= E0|E) = (1 - E0/E)^(s-1)\\n     s   E0/E    formula     Monte Carlo\\n");
    int svals[4] = {2, 3, 5, 10};
    double xvals[2] = {0.2, 0.5};
    const int N = 400000;
    for (int s : svals) for (double x : xvals) {
        long hit = 0;
        for (int i = 0; i < N; ++i) {
            double g1 = expo(rng), sum = g1;
            for (int j = 1; j < s; ++j) sum += expo(rng);
            if (g1 / sum >= x) ++hit;
        }
        std::printf("    %2d   %.1f   %.5f     %.5f\\n", s, x, std::pow(1 - x, s - 1), double(hit) / N);
    }
    // thermal average, s = 6, E0 = 1, kT = 0.25
    int s = 6; double E0 = 1.0, kT = 0.25, num = 0, den = 0, dE = 60 * kT / 600000;
    for (int i = 0; i <= 600000; ++i) {
        double E = i * dE, w = std::pow(E, s - 1) * std::exp(-E / kT);
        den += w;
        if (E >= E0) num += std::pow(1 - E0 / E, s - 1) * w;
    }
    std::printf("\\n    thermal average (s = 6, E0/kT = 4): quadrature %.6e   exp(-E0/kT) = %.6e\\n",
                num / den, std::exp(-E0 / kT));
    return 0;
}
`;

// ── python/wk09_diffusion_transport.py ─────────────────
export const PY_DIFF = `"""
Wk09 — Reactions in solution: encounter pairs, diffusion control,
        and the material-balance (reaction-diffusion-convection) equation
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Encounter pair (QSSA):  k_r = k_a k_d / (k_a + k_d')
      k_d' << k_a : k_r -> k_d           (diffusion control)
      k_a << k_d' : k_r -> k_a k_d/k_d'  (activation control)
(2) Smoluchowski: steady state around an absorbing sphere R*
      [B](r) = (1 - R*/r)[B]bulk,  k_d = 4 pi R* (D_A + D_B) N_A
    Stokes-Einstein + R_A = R_B = R*/2  ->  k_d = 8RT/(3 eta)
    Brownian Monte Carlo check of the time-dependent rate
      k(t) = 4 pi R* D (1 + R*/sqrt(pi D t))
(3) Material balance in 1D:
      dc/dt = D d2c/dx2 - v dc/dx - k c
    Finite differences vs. the analytic pulse
      c = n0/(2A sqrt(pi D t)) exp(-(x - v t)^2/4Dt) exp(-k t)   (full line)
    (the lecture form n0/(A sqrt(pi D t)) is the same pulse against a wall)

Run:  python wk09_diffusion_transport.py     (~10 s)
"""
import numpy as np

R, NA = 8.314462618, 6.02214076e23
rng = np.random.default_rng(9)

# -- (1) encounter pair -----------------------------------------
print("(1) k_r / k_d = k_a / (k_a + k_d')")
for ka, kdp in [(1e12, 1e10), (1e10, 1e10), (1e8, 1e10)]:
    print(f"    k_a = {ka:.0e}, k_d' = {kdp:.0e}:  k_r/k_d = {ka/(ka+kdp):.4f}")

# -- (2) diffusion-controlled rate constants ----------------------
T = 298.15
print("\\n(2) k_d = 8RT/(3 eta) at 298.15 K")
for name, eta in [("hexane", 0.300e-3), ("water", 0.890e-3), ("ethylene glycol", 16.06e-3), ("glycerol", 0.934)]:
    print(f"    {name:16s} eta = {eta*1e3:8.3f} mPa s   k_d = {8*R*T/(3*eta)*1e3:.2e} dm^3 mol^-1 s^-1")
Rs, Dsum = 0.4e-9, 4.0e-9
print(f"    Smoluchowski, R* = 0.4 nm, D_A + D_B = 4e-9 m^2/s: k_d = {4*np.pi*Rs*Dsum*NA*1e3:.3e} dm^3 mol^-1 s^-1")

# Brownian dynamics: B particles around a fixed absorbing sphere (units R* = 1, D = 1)
Np, Rout, dt, nstep = 100000, 8.0, 1e-3, 1500
u = rng.normal(size=(Np, 3)); u /= np.linalg.norm(u, axis=1)[:, None]
r = (1 + (Rout**3 - 1) * rng.random(Np))**(1/3)        # uniform in the shell
pos = u * r[:, None]
c0 = Np / (4/3 * np.pi * (Rout**3 - 1))
alive = np.ones(Np, bool); captured = 0
print("\\n    Brownian MC (R* = 1, D = 1):  captures vs. Smoluchowski")
print("      t      MC      theory    MC/theory    theory = 4 pi c0 (t + 2 sqrt(t/pi))")
for step in range(1, nstep + 1):
    r_old = np.linalg.norm(pos, axis=1)
    pos[alive] += np.sqrt(2 * dt) * rng.normal(size=(alive.sum(), 3))
    rr = np.linalg.norm(pos, axis=1)
    # Brownian-bridge correction: a path that starts and ends outside the sphere
    # may still have touched it during the step (probability for a flat wall)
    graze = rng.random(Np) < np.exp(-np.clip((r_old - 1) * (rr - 1), 0, None) / dt)
    hit = alive & ((rr < 1.0) | graze)
    captured += hit.sum(); alive &= ~hit
    out = alive & (rr > Rout)                          # reflect at the outer wall
    pos[out] *= ((2 * Rout - rr[out]) / rr[out])[:, None]
    if step % 250 == 0:
        t = step * dt
        theory = 4 * np.pi * c0 * (t + 2 * np.sqrt(t / np.pi))
        print(f"    {t:5.2f}   {captured:6d}  {theory:8.1f}    {captured/theory:6.3f}")
print("    -> agreement within Monte Carlo noise (a few percent); stop at t = 1.5 so the\\n       depletion zone sqrt(4Dt) stays well inside the outer wall")

# -- (3) 1D material balance -------------------------------------
D, v, k = 1.0e-9, 2.0e-6, 50.0                        # m^2/s, m/s, 1/s
L, nx = 1.2e-4, 1601
x = np.linspace(-L/2, L/2, nx); dx = x[1] - x[0]
dt = 0.2 * dx**2 / D
t0 = 1e-3                                              # start from the analytic pulse at t0
pulse = lambda t: np.exp(-(x - v*t)**2 / (4*D*t)) / (2*np.sqrt(np.pi*D*t)) * np.exp(-k*t)
c = pulse(t0); t = t0
tend = 0.03
while t < tend - 1e-15:
    h = min(dt, tend - t)
    lap = (np.roll(c, -1) - 2*c + np.roll(c, 1)) / dx**2
    grad = (np.roll(c, -1) - np.roll(c, 1)) / (2*dx)
    c = c + h * (D*lap - v*grad - k*c)
    c[0] = c[-1] = 0.0
    t += h
ca = pulse(t)
mass = c.sum()*dx; mean = (x*c).sum()*dx/mass; var = ((x-mean)**2*c).sum()*dx/mass
print(f"\\n(3) material balance, D = {D:.0e} m^2/s, v = {v*1e6:.0f} um/s, k = {k:.0f} 1/s, t = {t*1e3:.0f} ms")
print(f"    max |FD - analytic| / peak = {np.abs(c-ca).max()/ca.max():.2e}")
print(f"    amount  {mass:.5f}   e^-kt = {np.exp(-k*t):.5f}")
print(f"    mean    {mean*1e6:.4f} um   v t = {v*t*1e6:.4f} um")
print(f"    var     {var*1e12:.4f} um^2 2Dt = {2*D*t*1e12:.4f} um^2 (pulse started at t0, so 2D t holds)")
print(f"    reaction-diffusion length sqrt(D/k) = {np.sqrt(D/k)*1e6:.2f} um")
`;

// ── matlab/wk09_diffusion_transport.m ─────────────────
export const ML_DIFF = `% Wk09 — Encounter pairs, diffusion control, and the 1D material balance
% Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
%
% (1) k_r/k_d = k_a/(k_a + k_d')
% (2) k_d = 8RT/(3 eta);  Smoluchowski k_d = 4 pi R* (D_A + D_B) N_A
%     Brownian MC around an absorbing sphere vs. 4 pi c0 (t + 2 sqrt(t/pi))  (R* = D = 1)
% (3) dc/dt = D c'' - v c' - k c, finite differences vs. the analytic pulse
%
% Run:  wk09_diffusion_transport     (~30 s)
clear; rng(9);
R = 8.314462618; NA = 6.02214076e23;

fprintf('(1) k_r/k_d = k_a/(k_a + k_d'')\\n');
for ka = [1e12 1e10 1e8]
    fprintf('    k_a = %.0e, k_d'' = 1e10:  k_r/k_d = %.4f\\n', ka, ka/(ka+1e10));
end

T = 298.15;
sol = {'hexane', 'water', 'ethylene glycol', 'glycerol'}; eta = [0.300e-3 0.890e-3 16.06e-3 0.934];
fprintf('\\n(2) k_d = 8RT/(3 eta) at 298.15 K\\n');
for i = 1:4
    fprintf('    %-16s eta = %8.3f mPa s   k_d = %.2e dm^3 mol^-1 s^-1\\n', sol{i}, eta(i)*1e3, 8*R*T/(3*eta(i))*1e3);
end
fprintf('    Smoluchowski, R* = 0.4 nm, D = 4e-9 m^2/s: k_d = %.3e dm^3 mol^-1 s^-1\\n', 4*pi*0.4e-9*4e-9*NA*1e3);

% Brownian dynamics (units R* = 1, D = 1)
Np = 100000; Rout = 8; dt = 1e-3; nstep = 1500;
u = randn(Np, 3); u = u ./ vecnorm(u, 2, 2);
r = (1 + (Rout^3 - 1)*rand(Np, 1)).^(1/3);
pos = u .* r;
c0 = Np / (4/3*pi*(Rout^3 - 1));
alive = true(Np, 1); cap = 0;
fprintf('\\n    Brownian MC (R* = 1, D = 1)\\n      t      MC      theory   MC/theory\\n');
for st = 1:nstep
    ro = vecnorm(pos, 2, 2);
    pos(alive, :) = pos(alive, :) + sqrt(2*dt)*randn(nnz(alive), 3);
    rr = vecnorm(pos, 2, 2);
    graze = rand(Np, 1) < exp(-max((ro - 1).*(rr - 1), 0)/dt);   % Brownian-bridge correction
    hit = alive & ((rr < 1) | graze);
    cap = cap + nnz(hit); alive = alive & ~hit;
    out = alive & (rr > Rout);
    pos(out, :) = pos(out, :) .* ((2*Rout - rr(out)) ./ rr(out));
    if mod(st, 250) == 0
        t = st*dt; th = 4*pi*c0*(t + 2*sqrt(t/pi));
        fprintf('    %5.2f   %6d   %8.1f    %6.3f\\n', t, cap, th, cap/th);
    end
end

% (3) material balance
D = 1e-9; v = 2e-6; k = 50; L = 1.2e-4; nx = 1601;
x = linspace(-L/2, L/2, nx)'; dx = x(2) - x(1); h = 0.2*dx^2/D;
pulse = @(t) exp(-(x - v*t).^2/(4*D*t)) ./ (2*sqrt(pi*D*t)) * exp(-k*t);
t0 = 1e-3; tend = 0.03; t = t0; c = pulse(t0);
while t < tend - 1e-15
    hh = min(h, tend - t);
    lap = ([c(2:end); 0] - 2*c + [0; c(1:end-1)]) / dx^2;
    grad = ([c(2:end); 0] - [0; c(1:end-1)]) / (2*dx);
    c = c + hh*(D*lap - v*grad - k*c); c([1 end]) = 0; t = t + hh;
end
ca = pulse(t);
mass = sum(c)*dx; mu = sum(x.*c)*dx/mass; var = sum((x - mu).^2.*c)*dx/mass;
fprintf('\\n(3) material balance, t = %.0f ms\\n', t*1e3);
fprintf('    max |FD - analytic|/peak = %.2e\\n', max(abs(c - ca))/max(ca));
fprintf('    amount %.5f  e^-kt = %.5f\\n    mean %.4f um  vt = %.4f um\\n    var %.4f um^2  2Dt = %.4f um^2\\n', ...
        mass, exp(-k*t), mu*1e6, v*t*1e6, var*1e12, 2*D*t*1e12);
fprintf('    sqrt(D/k) = %.2f um\\n', sqrt(D/k)*1e6);
`;

// ── julia/wk09_diffusion_transport.jl ─────────────────
export const JL_DIFF = `# Wk09 — Encounter pairs, diffusion control, and the 1D material balance
# Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
#
# (1) k_r/k_d = k_a/(k_a + k_d')
# (2) k_d = 8RT/(3 eta);  Smoluchowski k_d = 4 pi R* (D_A + D_B) N_A
#     Brownian MC around an absorbing sphere vs. 4 pi c0 (t + 2 sqrt(t/pi))  (R* = D = 1)
# (3) dc/dt = D c'' - v c' - k c, finite differences vs. the analytic pulse
#
# Run:  julia wk09_diffusion_transport.jl
using Printf, Random, LinearAlgebra
Random.seed!(9)
const R, NA = 8.314462618, 6.02214076e23

println("(1) k_r/k_d = k_a/(k_a + k_d')")
for ka in (1e12, 1e10, 1e8)
    @printf("    k_a = %.0e, k_d' = 1e10:  k_r/k_d = %.4f\\n", ka, ka / (ka + 1e10))
end

T = 298.15
println("\\n(2) k_d = 8RT/(3 eta) at 298.15 K")
for (name, η) in [("hexane", 0.300e-3), ("water", 0.890e-3), ("ethylene glycol", 16.06e-3), ("glycerol", 0.934)]
    @printf("    %-16s eta = %8.3f mPa s   k_d = %.2e dm^3 mol^-1 s^-1\\n", name, η * 1e3, 8R * T / (3η) * 1e3)
end
@printf("    Smoluchowski, R* = 0.4 nm, D = 4e-9 m^2/s: k_d = %.3e dm^3 mol^-1 s^-1\\n", 4π * 0.4e-9 * 4e-9 * NA * 1e3)

function brownian(; Np=100_000, Rout=8.0, dt=1e-3, nstep=1500)
    X = zeros(3, Np)
    for i in 1:Np
        u = randn(3); u ./= norm(u)
        X[:, i] = u * cbrt(1 + (Rout^3 - 1) * rand())
    end
    c0 = Np / (4 / 3 * π * (Rout^3 - 1))
    alive = trues(Np); cap = 0; sq = sqrt(2dt)
    println("\\n    Brownian MC (R* = 1, D = 1)\\n      t      MC      theory   MC/theory")
    for st in 1:nstep
        for i in 1:Np
            alive[i] || continue
            ro = sqrt(X[1, i]^2 + X[2, i]^2 + X[3, i]^2)
            X[1, i] += sq * randn(); X[2, i] += sq * randn(); X[3, i] += sq * randn()
            rr = sqrt(X[1, i]^2 + X[2, i]^2 + X[3, i]^2)
            hit = rr < 1 || rand() < exp(-max((ro - 1) * (rr - 1), 0) / dt)   # Brownian-bridge correction
            if hit
                alive[i] = false; cap += 1; continue
            end
            if rr > Rout
                X[:, i] .*= (2Rout - rr) / rr
            end
        end
        if st % 250 == 0
            t = st * dt; th = 4π * c0 * (t + 2sqrt(t / π))
            @printf("    %5.2f   %6d   %8.1f    %6.3f\\n", t, cap, th, cap / th)
        end
    end
end
brownian()

# (3) material balance
D, v, k, L, nx = 1e-9, 2e-6, 50.0, 1.2e-4, 1601
x = collect(range(-L / 2, L / 2, length=nx)); dx = x[2] - x[1]; h = 0.2dx^2 / D
pulse(t) = @. exp(-(x - v * t)^2 / (4D * t)) / (2sqrt(π * D * t)) * exp(-k * t)
t0, tend = 1e-3, 0.03
c = pulse(t0); t = t0
while t < tend - 1e-15
    global c, t
    hh = min(h, tend - t)
    cn = copy(c)
    for i in 2:nx-1
        cn[i] = c[i] + hh * (D * (c[i+1] - 2c[i] + c[i-1]) / dx^2 - v * (c[i+1] - c[i-1]) / (2dx) - k * c[i])
    end
    cn[1] = cn[end] = 0.0
    c = cn; t += hh
end
ca = pulse(t)
mass = sum(c) * dx; μ = sum(x .* c) * dx / mass; vr = sum((x .- μ) .^ 2 .* c) * dx / mass
@printf("\\n(3) material balance, t = %.0f ms\\n", t * 1e3)
@printf("    max |FD - analytic|/peak = %.2e\\n", maximum(abs.(c .- ca)) / maximum(ca))
@printf("    amount %.5f  e^-kt = %.5f\\n    mean %.4f um  vt = %.4f um\\n    var %.4f um^2  2Dt = %.4f um^2\\n",
        mass, exp(-k * t), μ * 1e6, v * t * 1e6, vr * 1e12, 2D * t * 1e12)
@printf("    sqrt(D/k) = %.2f um\\n", sqrt(D / k) * 1e6)
`;

// ── cpp/wk09_diffusion_transport.cpp ─────────────────
export const CPP_DIFF = `// Wk09 — Encounter pairs, diffusion control, and the 1D material balance
// Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
//
// (1) k_r/k_d = k_a/(k_a + k_d')
// (2) k_d = 8RT/(3 eta);  Smoluchowski k_d = 4 pi R* (D_A + D_B) N_A
//     Brownian MC around an absorbing sphere vs. 4 pi c0 (t + 2 sqrt(t/pi))  (R* = D = 1)
// (3) dc/dt = D c'' - v c' - k c, finite differences vs. the analytic pulse
//
// Build:  g++ -O2 -std=c++17 wk09_diffusion_transport.cpp -o wk09_diffusion_transport
#include <cstdio>
#include <cmath>
#include <vector>
#include <random>
#include <algorithm>

int main() {
    const double R = 8.314462618, NA = 6.02214076e23;
    std::mt19937_64 rng(9);
    std::normal_distribution<double> gauss(0.0, 1.0);
    std::uniform_real_distribution<double> uni(0.0, 1.0);

    std::printf("(1) k_r/k_d = k_a/(k_a + k_d')\\n");
    double kas[3] = {1e12, 1e10, 1e8};
    for (double ka : kas) std::printf("    k_a = %.0e, k_d' = 1e10:  k_r/k_d = %.4f\\n", ka, ka / (ka + 1e10));

    const double T = 298.15;
    const char* sol[4] = {"hexane", "water", "ethylene glycol", "glycerol"};
    double eta[4] = {0.300e-3, 0.890e-3, 16.06e-3, 0.934};
    std::printf("\\n(2) k_d = 8RT/(3 eta) at 298.15 K\\n");
    for (int i = 0; i < 4; ++i)
        std::printf("    %-16s eta = %8.3f mPa s   k_d = %.2e dm^3 mol^-1 s^-1\\n", sol[i], eta[i] * 1e3, 8 * R * T / (3 * eta[i]) * 1e3);
    std::printf("    Smoluchowski, R* = 0.4 nm, D = 4e-9 m^2/s: k_d = %.3e dm^3 mol^-1 s^-1\\n",
                4 * M_PI * 0.4e-9 * 4e-9 * NA * 1e3);

    // Brownian dynamics
    const int Np = 100000, nstep = 1500; const double Rout = 8.0, dt = 1e-3;
    std::vector<double> X(Np), Y(Np), Z(Np); std::vector<char> alive(Np, 1);
    for (int i = 0; i < Np; ++i) {
        double ux = gauss(rng), uy = gauss(rng), uz = gauss(rng), un = std::sqrt(ux*ux + uy*uy + uz*uz);
        double r = std::cbrt(1 + (Rout*Rout*Rout - 1) * uni(rng));
        X[i] = r*ux/un; Y[i] = r*uy/un; Z[i] = r*uz/un;
    }
    double c0 = Np / (4.0/3.0 * M_PI * (Rout*Rout*Rout - 1));
    long cap = 0; double sq = std::sqrt(2 * dt);
    std::printf("\\n    Brownian MC (R* = 1, D = 1)\\n      t      MC      theory   MC/theory\\n");
    for (int st = 1; st <= nstep; ++st) {
        for (int i = 0; i < Np; ++i) {
            if (!alive[i]) continue;
            double ro = std::sqrt(X[i]*X[i] + Y[i]*Y[i] + Z[i]*Z[i]);
            X[i] += sq * gauss(rng); Y[i] += sq * gauss(rng); Z[i] += sq * gauss(rng);
            double rr = std::sqrt(X[i]*X[i] + Y[i]*Y[i] + Z[i]*Z[i]);
            bool hit = rr < 1.0;
            if (!hit) hit = uni(rng) < std::exp(-(ro - 1) * (rr - 1) / dt);   // Brownian-bridge correction
            if (hit) { alive[i] = 0; ++cap; continue; }
            if (rr > Rout) { double f = (2*Rout - rr) / rr; X[i] *= f; Y[i] *= f; Z[i] *= f; }
        }
        if (st % 250 == 0) {
            double t = st * dt, th = 4 * M_PI * c0 * (t + 2 * std::sqrt(t / M_PI));
            std::printf("    %5.2f   %6ld   %8.1f    %6.3f\\n", t, cap, th, cap / th);
        }
    }

    // (3) material balance
    const double D = 1e-9, v = 2e-6, k = 50.0, L = 1.2e-4; const int nx = 1601;
    double dx = L / (nx - 1), h = 0.2 * dx * dx / D, t0 = 1e-3, tend = 0.03;
    std::vector<double> x(nx), c(nx), cn(nx);
    auto pulse = [&](double xx, double t) {
        return std::exp(-(xx - v*t)*(xx - v*t) / (4*D*t)) / (2*std::sqrt(M_PI*D*t)) * std::exp(-k*t); };
    for (int i = 0; i < nx; ++i) { x[i] = -L/2 + i*dx; c[i] = pulse(x[i], t0); }
    double t = t0;
    while (t < tend - 1e-15) {
        double hh = std::min(h, tend - t);
        for (int i = 1; i < nx - 1; ++i)
            cn[i] = c[i] + hh * (D*(c[i+1] - 2*c[i] + c[i-1])/(dx*dx) - v*(c[i+1] - c[i-1])/(2*dx) - k*c[i]);
        cn[0] = cn[nx-1] = 0; c.swap(cn); t += hh;
    }
    double mass = 0, mean = 0, var = 0, err = 0, peak = 0;
    for (int i = 0; i < nx; ++i) { mass += c[i]*dx; mean += x[i]*c[i]*dx; }
    mean /= mass;
    for (int i = 0; i < nx; ++i) {
        var += (x[i]-mean)*(x[i]-mean)*c[i]*dx;
        double a = pulse(x[i], t); err = std::max(err, std::fabs(c[i]-a)); peak = std::max(peak, a);
    }
    var /= mass;
    std::printf("\\n(3) material balance, t = %.0f ms\\n", t*1e3);
    std::printf("    max |FD - analytic|/peak = %.2e\\n", err/peak);
    std::printf("    amount %.5f  e^-kt = %.5f\\n    mean %.4f um  vt = %.4f um\\n    var %.4f um^2  2Dt = %.4f um^2\\n",
                mass, std::exp(-k*t), mean*1e6, v*t*1e6, var*1e12, 2*D*t*1e12);
    std::printf("    sqrt(D/k) = %.2f um\\n", std::sqrt(D/k)*1e6);
    return 0;
}
`;

// ── python/wk09_eyring_tst.py ─────────────────
export const PY_TST = `"""
Wk09 — Transition state theory (Eyring equation)
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Vibrational partition function (energies measured from the ZPE)
      q_vib = 1 / (1 - exp(-h nu / kT))  ->  kT / (h nu)   when h nu << kT
    The soft mode along the reaction coordinate is the one that becomes kT/h nu.
(2) Eyring equation
      k_r = kappa (kT/h) (RT/p0) K_bar(double dagger)
          = kappa (kT/h) exp(dS/R) exp(-dH/RT)      (solution, per c0 = 1 mol/dm^3)
(3) Two structureless atoms A + B: TST with an atom-pair activated complex
      K_bar = N_A Lambda_A^3 Lambda_B^3 / (Lambda_C^3 V_m0) * (2 I kT / hbar^2) e^{-dE0/RT}
    gives exactly the collision-theory result  N_A sigma (8kT/pi mu)^{1/2} e^{-dE0/RT}
    with sigma = pi r^2 (checked numerically below).

Run:  python wk09_eyring_tst.py
"""
import numpy as np

KB, H, NA, R = 1.380649e-23, 6.62607015e-34, 6.02214076e23, 8.314462618
HBAR, AMU, C2 = H / (2 * np.pi), 1.66053906660e-27, 1.438776877e-2   # C2 = hc/k [m K]

# -- (1) exact vs high-temperature q_vib ----------------------------
T = 298.15
print(f"(1) q_vib at {T} K   (wavenumber in cm^-1)")
print("    nu      h nu/kT    exact      kT/h nu    error")
for wn in (2000, 1000, 300, 100, 30, 10):
    x = wn * 100 * C2 / T
    ex, ap = 1 / (1 - np.exp(-x)), 1 / x
    print(f"    {wn:5d}   {x:7.3f}   {ex:9.4f}   {ap:9.4f}   {100*(ap-ex)/ex:+7.1f} %")
print(f"    kT/h = {KB*T/H:.4e} s^-1 at {T} K\\n")

# -- (2) Eyring equation ------------------------------------------
print("(2) k = (kT/h) exp(dS/R) exp(-dH/RT),  kappa = 1")
for dH, dS in [(60e3, -50.0), (60e3, 0.0), (80e3, -50.0)]:
    k = KB * T / H * np.exp(dS / R) * np.exp(-dH / (R * T))
    print(f"    dH = {dH/1e3:4.0f} kJ/mol, dS = {dS:+5.0f} J/K/mol:  k = {k:.3e} dm^3 mol^-1 s^-1")
# Ea from an Eyring line: Ea = dH + RT (solution) -> slope check
Ts = np.array([280.0, 300.0, 320.0])
ks = KB * Ts / H * np.exp(-50 / R) * np.exp(-60e3 / (R * Ts))
Ea = -R * np.polyfit(1 / Ts, np.log(ks), 1)[0]
print(f"    Arrhenius slope of the Eyring k(T): Ea = {Ea/1e3:.2f} kJ/mol  (dH + R<T> = {(60e3+R*300)/1e3:.2f})\\n")

# -- (3) TST = collision theory for two atoms ------------------------
def Lam(m, T):
    return H / np.sqrt(2 * np.pi * m * KB * T)
mA, mB, r = 1.008 * AMU, 35.45 * AMU, 0.30e-9      # H + Cl-like masses, r = 0.30 nm
mu = mA * mB / (mA + mB); I = mu * r**2
print("(3) atom + atom, r = 0.30 nm, masses 1.008 and 35.45 u, dE0 = 0")
print("     T [K]    TST [dm3/mol/s]    collision theory    ratio")
for T in (300.0, 1000.0):
    p0 = 1e5; Vm = R * T / p0
    Kbar = NA * Lam(mA, T)**3 * Lam(mB, T)**3 / (Lam(mA + mB, T)**3 * Vm) * (2 * I * KB * T / HBAR**2)
    k_tst = KB * T / H * (R * T / p0) * Kbar
    k_ct = NA * np.pi * r**2 * np.sqrt(8 * KB * T / (np.pi * mu))
    print(f"    {T:6.0f}    {k_tst*1e3:.6e}       {k_ct*1e3:.6e}      {k_tst/k_ct:.12f}")
print("    -> identical: collision theory is TST for structureless reactants")
`;

// ── matlab/wk09_eyring_tst.m ─────────────────
export const ML_TST = `% Wk09 — Transition state theory (Eyring equation)
% Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
%
% (1) q_vib = 1/(1 - exp(-h nu/kT)) vs. the high-T limit kT/(h nu)
% (2) k = kappa (kT/h) exp(dS/R) exp(-dH/RT)
% (3) atom + atom: TST rate equals collision theory N_A pi r^2 (8kT/pi mu)^(1/2)
%
% Run:  wk09_eyring_tst
clear;
KB = 1.380649e-23; H = 6.62607015e-34; NA = 6.02214076e23; R = 8.314462618;
HBAR = H/(2*pi); AMU = 1.66053906660e-27; C2 = 1.438776877e-2;
Lam = @(m, T) H ./ sqrt(2*pi*m*KB*T);

T = 298.15;
fprintf('(1) q_vib at %.2f K\\n    nu      h nu/kT    exact      kT/h nu    error\\n', T);
for wn = [2000 1000 300 100 30 10]
    x = wn*100*C2/T; ex = 1/(1 - exp(-x)); ap = 1/x;
    fprintf('    %5d   %7.3f   %9.4f   %9.4f   %+7.1f %%\\n', wn, x, ex, ap, 100*(ap - ex)/ex);
end
fprintf('    kT/h = %.4e s^-1\\n\\n', KB*T/H);

fprintf('(2) Eyring, kappa = 1\\n');
dH = [60e3 60e3 80e3]; dS = [-50 0 -50];
for i = 1:3
    fprintf('    dH = %4.0f kJ/mol, dS = %+5.0f J/K/mol: k = %.3e dm^3 mol^-1 s^-1\\n', dH(i)/1e3, dS(i), ...
            KB*T/H*exp(dS(i)/R)*exp(-dH(i)/(R*T)));
end
kE = @(TT) KB*TT/H .* exp(-50/R) .* exp(-60e3./(R*TT));
Ts = [280 300 320]; pf = polyfit(1./Ts, log(kE(Ts)), 1);
fprintf('    Arrhenius Ea of the Eyring k(T) = %.2f kJ/mol (dH + RT = %.2f)\\n\\n', -R*pf(1)/1e3, (60e3 + R*300)/1e3);

mA = 1.008*AMU; mB = 35.45*AMU; r = 0.30e-9; mu = mA*mB/(mA + mB); I = mu*r^2;
fprintf('(3) atom + atom, r = 0.30 nm\\n     T [K]    TST              collision theory   ratio\\n');
for TT = [300 1000]
    p0 = 1e5; Vm = R*TT/p0;
    Kbar = NA*Lam(mA, TT)^3*Lam(mB, TT)^3/(Lam(mA + mB, TT)^3*Vm) * (2*I*KB*TT/HBAR^2);
    ktst = KB*TT/H*(R*TT/p0)*Kbar;
    kct = NA*pi*r^2*sqrt(8*KB*TT/(pi*mu));
    fprintf('    %6.0f   %.6e     %.6e       %.12f\\n', TT, ktst*1e3, kct*1e3, ktst/kct);
end
`;

// ── julia/wk09_eyring_tst.jl ─────────────────
export const JL_TST = `# Wk09 — Transition state theory (Eyring equation)
# Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
#
# (1) q_vib = 1/(1 - exp(-h nu/kT)) vs. the high-T limit kT/(h nu)
# (2) k = kappa (kT/h) exp(dS/R) exp(-dH/RT)
# (3) atom + atom: TST rate equals collision theory N_A pi r^2 (8kT/pi mu)^(1/2)
#
# Run:  julia wk09_eyring_tst.jl
using Printf
const KB, H, NA, R = 1.380649e-23, 6.62607015e-34, 6.02214076e23, 8.314462618
const HBAR, AMU, C2 = H / 2π, 1.66053906660e-27, 1.438776877e-2
Λ(m, T) = H / sqrt(2π * m * KB * T)

T = 298.15
@printf("(1) q_vib at %.2f K\\n    nu      h nu/kT    exact      kT/h nu    error\\n", T)
for wn in (2000, 1000, 300, 100, 30, 10)
    x = wn * 100 * C2 / T; ex = 1 / (1 - exp(-x)); ap = 1 / x
    @printf("    %5d   %7.3f   %9.4f   %9.4f   %+7.1f %%\\n", wn, x, ex, ap, 100 * (ap - ex) / ex)
end
@printf("    kT/h = %.4e s^-1\\n\\n", KB * T / H)

println("(2) Eyring, kappa = 1")
for (dH, dS) in ((60e3, -50.0), (60e3, 0.0), (80e3, -50.0))
    @printf("    dH = %4.0f kJ/mol, dS = %+5.0f J/K/mol: k = %.3e dm^3 mol^-1 s^-1\\n", dH / 1e3, dS,
            KB * T / H * exp(dS / R) * exp(-dH / (R * T)))
end
kE(TT) = KB * TT / H * exp(-50 / R) * exp(-60e3 / (R * TT))
Ea = -R * (log(kE(320)) - log(kE(280))) / (1 / 320 - 1 / 280)
@printf("    Arrhenius Ea of the Eyring k(T) = %.2f kJ/mol (dH + RT = %.2f)\\n\\n", Ea / 1e3, (60e3 + R * 300) / 1e3)

mA, mB, r = 1.008AMU, 35.45AMU, 0.30e-9
μ = mA * mB / (mA + mB); I = μ * r^2
println("(3) atom + atom, r = 0.30 nm\\n     T [K]    TST              collision theory   ratio")
for TT in (300.0, 1000.0)
    p0 = 1e5; Vm = R * TT / p0
    Kbar = NA * Λ(mA, TT)^3 * Λ(mB, TT)^3 / (Λ(mA + mB, TT)^3 * Vm) * (2I * KB * TT / HBAR^2)
    ktst = KB * TT / H * (R * TT / p0) * Kbar
    kct = NA * π * r^2 * sqrt(8KB * TT / (π * μ))
    @printf("    %6.0f   %.6e     %.6e       %.12f\\n", TT, ktst * 1e3, kct * 1e3, ktst / kct)
end
`;

// ── cpp/wk09_eyring_tst.cpp ─────────────────
export const CPP_TST = `// Wk09 — Transition state theory (Eyring equation)
// Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
//
// (1) q_vib = 1/(1 - exp(-h nu/kT)) vs. the high-T limit kT/(h nu)
// (2) k = kappa (kT/h) exp(dS/R) exp(-dH/RT)
// (3) atom + atom: TST rate equals collision theory N_A pi r^2 (8kT/pi mu)^(1/2)
//
// Build:  g++ -O2 -std=c++17 wk09_eyring_tst.cpp -o wk09_eyring_tst
#include <cstdio>
#include <cmath>

const double KB = 1.380649e-23, H = 6.62607015e-34, NA = 6.02214076e23, R = 8.314462618;
const double HBAR = H / (2 * M_PI), AMU = 1.66053906660e-27, C2 = 1.438776877e-2;

double Lam(double m, double T) { return H / std::sqrt(2 * M_PI * m * KB * T); }

int main() {
    double T = 298.15;
    std::printf("(1) q_vib at %.2f K\\n    nu      h nu/kT    exact      kT/h nu    error\\n", T);
    int wns[6] = {2000, 1000, 300, 100, 30, 10};
    for (int wn : wns) {
        double x = wn * 100 * C2 / T, ex = 1 / (1 - std::exp(-x)), ap = 1 / x;
        std::printf("    %5d   %7.3f   %9.4f   %9.4f   %+7.1f %%\\n", wn, x, ex, ap, 100 * (ap - ex) / ex);
    }
    std::printf("    kT/h = %.4e s^-1\\n\\n", KB * T / H);

    std::printf("(2) Eyring, kappa = 1\\n");
    double dHs[3] = {60e3, 60e3, 80e3}, dSs[3] = {-50, 0, -50};
    for (int i = 0; i < 3; ++i)
        std::printf("    dH = %4.0f kJ/mol, dS = %+5.0f J/K/mol: k = %.3e dm^3 mol^-1 s^-1\\n", dHs[i] / 1e3, dSs[i],
                    KB * T / H * std::exp(dSs[i] / R) * std::exp(-dHs[i] / (R * T)));
    // Arrhenius slope between 280 and 320 K
    auto kE = [](double TT) { return KB * TT / H * std::exp(-50 / R) * std::exp(-60e3 / (R * TT)); };
    double Ea = -R * (std::log(kE(320)) - std::log(kE(280))) / (1 / 320.0 - 1 / 280.0);
    std::printf("    Arrhenius Ea of the Eyring k(T) = %.2f kJ/mol (dH + RT = %.2f)\\n\\n", Ea / 1e3, (60e3 + R * 300) / 1e3);

    double mA = 1.008 * AMU, mB = 35.45 * AMU, r = 0.30e-9, mu = mA * mB / (mA + mB), I = mu * r * r;
    std::printf("(3) atom + atom, r = 0.30 nm\\n     T [K]    TST              collision theory   ratio\\n");
    double Ts[2] = {300, 1000};
    for (double TT : Ts) {
        double p0 = 1e5, Vm = R * TT / p0;
        double Kbar = NA * std::pow(Lam(mA, TT), 3) * std::pow(Lam(mB, TT), 3) / (std::pow(Lam(mA + mB, TT), 3) * Vm)
                      * (2 * I * KB * TT / (HBAR * HBAR));
        double ktst = KB * TT / H * (R * TT / p0) * Kbar;
        double kct = NA * M_PI * r * r * std::sqrt(8 * KB * TT / (M_PI * mu));
        std::printf("    %6.0f   %.6e     %.6e       %.12f\\n", TT, ktst * 1e3, kct * 1e3, ktst / kct);
    }
    return 0;
}
`;

// ── python/wk09_dla_aggregation.py ─────────────────
export const PY_DLA = `"""
Wk09 — Diffusion-limited and reaction-limited aggregation
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Particle-cluster aggregation on a 2D square lattice (Witten-Sander):
    walkers are released on a circle, random-walk, and stick to the
    cluster with probability alpha when they touch it.
      alpha = 1   : DLA  (open, branched)     d_f ~ 1.71 in 2D
      alpha << 1  : RLA  (denser, rounder)    d_f grows towards 2
    d_f from the growth history N ~ Rg^d_f (Rg measured about the seed).
    Note: the lecture values (2D: 1.45 DLA, 1.55 RLA; 3D: 1.7-1.9, 2.1-2.2)
    are for CLUSTER-cluster aggregation (DLCA / RLCA), where clusters
    themselves diffuse and collide.
(2) Smoluchowski coagulation with a constant kernel k (the lecture result
    k_ij ~ const for fractal clusters):
      dc_s/dt = (1/2) sum_{i+j=s} k c_i c_j - c_s sum_j k c_j
    exact solution with tau = k c0 t / 2:
      c_s = c0 tau^(s-1) / (1 + tau)^(s+1),   <S> = 1 + tau  (linear in t)

Run:  python wk09_dla_aggregation.py     (~30 s)
"""
import numpy as np

rng = np.random.default_rng(9)
STEPS = np.array([(1, 0), (-1, 0), (0, 1), (0, -1)])

def grow(Npart, alpha, L=401):
    grid = np.zeros((L, L), bool)
    c = L // 2; grid[c, c] = True
    rmax = 1.0; pts = [(0, 0)]; sum2 = 0.0; hist = []
    for _ in range(Npart - 1):
        while True:
            th = rng.uniform(0, 2*np.pi)
            x, y = int(round((rmax + 5) * np.cos(th))), int(round((rmax + 5) * np.sin(th)))
            stuck = False
            while True:
                dx, dy = STEPS[rng.integers(4)]
                if grid[c+x+dx, c+y+dy]:          # cannot step onto the cluster
                    continue
                x += dx; y += dy
                r2 = x*x + y*y
                if r2 > (2*rmax + 20)**2:          # wandered off: release a new walker
                    break
                if r2 > (rmax + 3)**2:
                    continue
                if (grid[c+x+1, c+y] or grid[c+x-1, c+y] or grid[c+x, c+y+1] or grid[c+x, c+y-1]) \\
                        and not grid[c+x, c+y] and rng.random() < alpha:
                    grid[c+x, c+y] = True; pts.append((x, y))
                    sum2 += r2; hist.append((len(pts), np.sqrt(sum2 / len(pts))))
                    rmax = max(rmax, np.sqrt(r2)); stuck = True
                    break
            if stuck:
                break
    return np.array(pts, float), np.array(hist)

def fractal_dim(hist, nmin=200):
    """growth history: N ~ Rg^d_f  (Rg about the seed)"""
    h = hist[hist[:, 0] >= nmin]
    return np.polyfit(np.log(h[:, 1]), np.log(h[:, 0]), 1)[0], h[-1, 1]

print("(1) 2D lattice particle-cluster aggregation")
for alpha, Np in [(1.0, 2500), (0.1, 2500)]:
    pts, hist = grow(Np, alpha)
    df, Rg = fractal_dim(hist)
    print(f"    alpha = {alpha:4.2f}, N = {Np}:  Rg = {Rg:6.1f} lattice units,  d_f (N ~ Rg^d_f) = {df:.2f}")
print("    reference: Witten-Sander DLA d_f = 1.71 (2D); small clusters read a little high\\n")

# -- (2) Smoluchowski, constant kernel ------------------------------
k, c0, Smax = 1.0, 1.0, 400
c = np.zeros(Smax + 1); c[1] = c0
dt, tend = 1e-3, 10.0
for _ in range(int(tend / dt)):
    def rhs(c):
        conv = 0.5 * k * np.convolve(c, c)[:Smax + 1]
        return conv - k * c * c.sum()
    k1 = rhs(c); k2 = rhs(c + dt/2*k1); k3 = rhs(c + dt/2*k2); k4 = rhs(c + dt*k3)
    c += dt / 6 * (k1 + 2*k2 + 2*k3 + k4)
tau = k * c0 * tend / 2
s = np.arange(Smax + 1)
exact = np.zeros(Smax + 1)
exact[1:] = c0 * np.exp((s[1:] - 1) * np.log(tau) - (s[1:] + 1) * np.log(1 + tau))
print(f"(2) Smoluchowski, constant kernel, t = {tend}, tau = {tau}")
print(f"    total clusters  numeric {c.sum():.6f}   exact c0/(1+tau) = {c0/(1+tau):.6f}")
print(f"    mass (sum s c_s) numeric {(s*c).sum():.6f}   exact {c0:.6f}")
print(f"    <S> = mass / number      numeric {(s*c).sum()/c.sum():.4f}   exact 1 + tau = {1+tau:.4f}")
for si in (1, 2, 5, 10):
    print(f"    c_{si:<2d} numeric {c[si]:.6e}   exact {exact[si]:.6e}")
`;

// ── matlab/wk09_dla_aggregation.m ─────────────────
export const ML_DLA = `% Wk09 — Diffusion- and reaction-limited aggregation; Smoluchowski coagulation
% Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
%
% (1) 2D lattice particle-cluster aggregation with sticking probability alpha
%     (alpha = 1: DLA, d_f ~ 1.71; alpha << 1: RLA, denser). d_f from N ~ Rg^d_f.
%     Lecture values 1.45 / 1.55 (2D) refer to cluster-cluster aggregation.
% (2) Smoluchowski, constant kernel: c_s = c0 tau^(s-1)/(1+tau)^(s+1), tau = k c0 t/2
%
% Run:  wk09_dla_aggregation     (DLA loops take a few minutes in MATLAB)
clear; rng(9);
fprintf('(1) 2D lattice particle-cluster aggregation\\n');
for alpha = [1.0 0.1]
    [Rg, df, G] = grow(2500, alpha);
    fprintf('    alpha = %4.2f, N = 2500:  Rg = %6.1f,  d_f = %.2f\\n', alpha, Rg, df);
end
fprintf('    reference: Witten-Sander DLA d_f = 1.71 (2D); small clusters read a little high\\n\\n');
figure; imagesc(G); axis image off; colormap(gray); title('last cluster');

k = 1; c0 = 1; Smax = 400; dt = 1e-3; tend = 10;
c = zeros(Smax, 1); c(1) = c0;
rhs = @(y) smol(y, k, Smax);
for nstep = 1:round(tend/dt)
    k1 = rhs(c); k2 = rhs(c + dt/2*k1); k3 = rhs(c + dt/2*k2); k4 = rhs(c + dt*k3);
    c = c + dt/6*(k1 + 2*k2 + 2*k3 + k4);
end
tau = k*c0*tend/2; s = (1:Smax)';
exact = c0*exp((s - 1)*log(tau) - (s + 1)*log(1 + tau));
fprintf('(2) Smoluchowski, constant kernel, tau = %.1f\\n', tau);
fprintf('    clusters %.6f (exact %.6f)   mass %.6f   <S> %.4f (exact %.4f)\\n', ...
        sum(c), c0/(1 + tau), sum(s.*c), sum(s.*c)/sum(c), 1 + tau);
for si = [1 2 5 10], fprintf('    c_%-2d numeric %.6e   exact %.6e\\n', si, c(si), exact(si)); end

function out = smol(y, k, Smax)
    conv2 = conv(y, y);                 % conv2(s-1) = sum_{i+j=s} y_i y_j  (1-based shift)
    out = zeros(Smax, 1);
    out(2:Smax) = 0.5*k*conv2(1:Smax-1);
    out = out - k*y*sum(y);
end

function [Rg, df, G] = grow(Npart, alpha)
    L = 401; c = (L + 1)/2; G = false(L);
    G(c, c) = true; rmax = 1; sum2 = 0; hist = zeros(0, 2);
    DX = [1 -1 0 0]; DY = [0 0 1 -1];
    for n = 2:Npart
        stuck = false;
        while ~stuck
            th = 2*pi*rand; x = round((rmax + 5)*cos(th)); y = round((rmax + 5)*sin(th));
            while true
                d = randi(4);
                if G(c + x + DX(d), c + y + DY(d)), continue; end
                x = x + DX(d); y = y + DY(d); r2 = x^2 + y^2;
                if r2 > (2*rmax + 20)^2, break; end
                if r2 > (rmax + 3)^2, continue; end
                if (G(c+x+1, c+y) || G(c+x-1, c+y) || G(c+x, c+y+1) || G(c+x, c+y-1)) && rand < alpha
                    G(c + x, c + y) = true; sum2 = sum2 + r2; rmax = max(rmax, sqrt(r2));
                    hist(end+1, :) = [n, sqrt(sum2/n)]; %#ok<AGROW>
                    stuck = true; break;
                end
            end
        end
    end
    Rg = hist(end, 2);
    h = hist(hist(:,1) >= 200, :);
    pf = polyfit(log(h(:,2)), log(h(:,1)), 1); df = pf(1);
end
`;

// ── julia/wk09_dla_aggregation.jl ─────────────────
export const JL_DLA = `# Wk09 — Diffusion- and reaction-limited aggregation; Smoluchowski coagulation
# Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
#
# (1) 2D lattice particle-cluster aggregation with sticking probability alpha
#     (alpha = 1: DLA, d_f ~ 1.71; alpha << 1: RLA, denser). d_f from N ~ Rg^d_f.
#     Lecture values 1.45 / 1.55 (2D) refer to cluster-cluster aggregation.
# (2) Smoluchowski, constant kernel: c_s = c0 tau^(s-1)/(1+tau)^(s+1), tau = k c0 t/2
#
# Run:  julia wk09_dla_aggregation.jl
using Printf, Random
Random.seed!(9)

function grow(Npart, α; L=801)
    c = L ÷ 2 + 1
    G = falses(L, L); G[c, c] = true
    rmax = 1.0; sum2 = 0.0; lnN = Float64[]; lnR = Float64[]
    DX = (1, -1, 0, 0); DY = (0, 0, 1, -1)
    for n in 2:Npart
        stuck = false
        while !stuck
            θ = 2π * rand()
            x = round(Int, (rmax + 5) * cos(θ)); y = round(Int, (rmax + 5) * sin(θ))
            while true
                d = rand(1:4)
                G[c+x+DX[d], c+y+DY[d]] && continue          # cannot step onto the cluster
                x += DX[d]; y += DY[d]
                r2 = x^2 + y^2
                r2 > (2rmax + 20)^2 && break
                r2 > (rmax + 3)^2 && continue
                if (G[c+x+1, c+y] || G[c+x-1, c+y] || G[c+x, c+y+1] || G[c+x, c+y-1]) && rand() < α
                    G[c+x, c+y] = true; sum2 += r2; rmax = max(rmax, sqrt(r2)); stuck = true
                    if n >= 200
                        push!(lnN, log(n)); push!(lnR, 0.5log(sum2 / n))
                    end
                    break
                end
            end
        end
    end
    mx, my = sum(lnR) / length(lnR), sum(lnN) / length(lnN)
    df = sum((lnR .- mx) .* (lnN .- my)) / sum((lnR .- mx) .^ 2)
    return sqrt(sum2 / Npart), df
end

println("(1) 2D lattice particle-cluster aggregation")
for N in (2500, 10000), α in (1.0, 0.1)
    Rg, df = grow(N, α)
    @printf("    alpha = %4.2f, N = %5d:  Rg = %6.1f,  d_f = %.2f\\n", α, N, Rg, df)
end
println("    reference: Witten-Sander DLA d_f = 1.71 (2D); larger N lands within scatter of it\\n")

function smol!(out, y, k)
    Smax = length(y); tot = sum(y)
    for s in 1:Smax
        a = 0.0
        for i in 1:s-1
            a += y[i] * y[s-i]
        end
        out[s] = 0.5k * a - k * y[s] * tot
    end
    out
end
k, c0, Smax, dt, tend = 1.0, 1.0, 400, 1e-3, 10.0
c = zeros(Smax); c[1] = c0
k1, k2, k3, k4 = (zeros(Smax) for _ in 1:4)
for _ in 1:round(Int, tend / dt)
    smol!(k1, c, k); smol!(k2, c .+ dt / 2 .* k1, k); smol!(k3, c .+ dt / 2 .* k2, k); smol!(k4, c .+ dt .* k3, k)
    c .+= dt / 6 .* (k1 .+ 2k2 .+ 2k3 .+ k4)
end
τ = k * c0 * tend / 2; s = 1:Smax
@printf("(2) Smoluchowski, constant kernel, tau = %.1f\\n", τ)
@printf("    clusters %.6f (exact %.6f)   mass %.6f   <S> %.4f (exact %.4f)\\n",
        sum(c), c0 / (1 + τ), sum(s .* c), sum(s .* c) / sum(c), 1 + τ)
for si in (1, 2, 5, 10)
    @printf("    c_%-2d numeric %.6e   exact %.6e\\n", si, c[si], c0 * τ^(si - 1) / (1 + τ)^(si + 1))
end
`;

// ── cpp/wk09_dla_aggregation.cpp ─────────────────
export const CPP_DLA = `// Wk09 — Diffusion- and reaction-limited aggregation; Smoluchowski coagulation
// Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
//
// (1) 2D lattice particle-cluster aggregation with sticking probability alpha
//     (alpha = 1: DLA, d_f ~ 1.71; alpha << 1: RLA, denser). d_f from N ~ Rg^d_f.
//     Lecture values 1.45 / 1.55 (2D) refer to cluster-cluster aggregation.
// (2) Smoluchowski, constant kernel: c_s = c0 tau^(s-1)/(1+tau)^(s+1), tau = k c0 t/2
//
// Build:  g++ -O2 -std=c++17 wk09_dla_aggregation.cpp -o wk09_dla_aggregation
#include <cstdio>
#include <cmath>
#include <vector>
#include <random>

std::mt19937_64 rng(9);

double grow(int Npart, double alpha, double& RgOut) {
    const int L = 801, c = L / 2;
    std::vector<char> g(L * L, 0);
    auto at = [&](int x, int y) -> char& { return g[(c + x) * L + (c + y)]; };
    std::uniform_real_distribution<double> uni(0, 1);
    std::uniform_int_distribution<int> dir(0, 3);
    const int DX[4] = {1, -1, 0, 0}, DY[4] = {0, 0, 1, -1};
    at(0, 0) = 1;
    double rmax = 1, sum2 = 0;
    std::vector<double> lnN, lnR;
    for (int n = 1; n < Npart; ++n) {
        bool stuck = false;
        while (!stuck) {
            double th = 2 * M_PI * uni(rng);
            int x = (int)std::lround((rmax + 5) * std::cos(th)), y = (int)std::lround((rmax + 5) * std::sin(th));
            while (true) {
                int d = dir(rng);
                if (at(x + DX[d], y + DY[d])) continue;          // cannot step onto the cluster
                x += DX[d]; y += DY[d];
                double r2 = double(x) * x + double(y) * y;
                if (r2 > (2 * rmax + 20) * (2 * rmax + 20)) break;
                if (r2 > (rmax + 3) * (rmax + 3)) continue;
                if ((at(x + 1, y) || at(x - 1, y) || at(x, y + 1) || at(x, y - 1)) && uni(rng) < alpha) {
                    at(x, y) = 1; sum2 += r2; rmax = std::max(rmax, std::sqrt(r2)); stuck = true;
                    int N = n + 1;
                    if (N >= 200) { lnN.push_back(std::log((double)N)); lnR.push_back(0.5 * std::log(sum2 / N)); }
                    break;
                }
            }
        }
    }
    RgOut = std::sqrt(sum2 / Npart);
    double mx = 0, my = 0; int m = lnN.size();
    for (int i = 0; i < m; ++i) { mx += lnR[i]; my += lnN[i]; }
    mx /= m; my /= m;
    double sxy = 0, sxx = 0;
    for (int i = 0; i < m; ++i) { sxy += (lnR[i] - mx) * (lnN[i] - my); sxx += (lnR[i] - mx) * (lnR[i] - mx); }
    return sxy / sxx;
}

int main() {
    std::printf("(1) 2D lattice particle-cluster aggregation\\n");
    double alphas[2] = {1.0, 0.1};
    int Ns[2] = {2500, 10000};
    for (int N : Ns) for (double a : alphas) {
        double Rg, df = grow(N, a, Rg);
        std::printf("    alpha = %4.2f, N = %5d:  Rg = %6.1f,  d_f = %.2f\\n", a, N, Rg, df);
    }
    std::printf("    reference: Witten-Sander DLA d_f = 1.71 (2D); larger N lands within scatter of it\\n\\n");

    const int Smax = 400; const double k = 1, c0 = 1, dt = 1e-3, tend = 10;
    std::vector<double> c(Smax + 1, 0.0), k1, k2, k3, k4, tmp(Smax + 1);
    c[1] = c0;
    auto rhs = [&](const std::vector<double>& y) {
        std::vector<double> out(Smax + 1, 0.0); double tot = 0;
        for (int s = 1; s <= Smax; ++s) tot += y[s];
        for (int s = 2; s <= Smax; ++s) { double a = 0; for (int i = 1; i < s; ++i) a += y[i] * y[s - i]; out[s] = 0.5 * k * a; }
        for (int s = 1; s <= Smax; ++s) out[s] -= k * y[s] * tot;
        return out;
    };
    for (int n = 0; n < (int)std::lround(tend / dt); ++n) {
        k1 = rhs(c);
        for (int s = 0; s <= Smax; ++s) tmp[s] = c[s] + dt / 2 * k1[s]; k2 = rhs(tmp);
        for (int s = 0; s <= Smax; ++s) tmp[s] = c[s] + dt / 2 * k2[s]; k3 = rhs(tmp);
        for (int s = 0; s <= Smax; ++s) tmp[s] = c[s] + dt * k3[s]; k4 = rhs(tmp);
        for (int s = 0; s <= Smax; ++s) c[s] += dt / 6 * (k1[s] + 2 * k2[s] + 2 * k3[s] + k4[s]);
    }
    double tau = k * c0 * tend / 2, num = 0, mass = 0;
    for (int s = 1; s <= Smax; ++s) { num += c[s]; mass += s * c[s]; }
    std::printf("(2) Smoluchowski, constant kernel, tau = %.1f\\n", tau);
    std::printf("    clusters %.6f (exact %.6f)   mass %.6f   <S> %.4f (exact %.4f)\\n", num, c0 / (1 + tau), mass, mass / num, 1 + tau);
    int ss[4] = {1, 2, 5, 10};
    for (int s : ss) std::printf("    c_%-2d numeric %.6e   exact %.6e\\n", s, c[s], c0 * std::pow(tau, s - 1) / std::pow(1 + tau, s + 1));
    return 0;
}
`;
