/* ============================================================
   Week11Codes.js — Physical Chemistry 2, Week 11
   Raw code samples: Reaction Dynamics, Electron Transfer & Lattice Vibrations
   - 4 topics: scattering_deflection, leps_trajectory,
               marcus_et, phonon_chain
   - 4 languages: Python, MATLAB, Julia, C++
   Imported by Week11App.jsx > RawCodes tab.
   Auto-generated from codes/ — edit the standalone files, then regenerate.
   ============================================================ */

// ── python/wk11_scattering_deflection.py ─────────────────
export const PY_SCAT = `"""
Week 11 - Classical elastic scattering: deflection function and cross sections
Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)

theta(b) = pi - 2 b * Integral_{r0}^{inf} dr / ( r^2 sqrt(1 - b^2/r^2 - V(r)/E) )
r0 = classical turning point (largest root of the square-root argument).
Substitution u = r0/r, u = 1 - w^2 removes the 1/sqrt singularity at r = r0.

Checks:
  * hard sphere (diameter d): theta = 2 arccos(b/d), dsigma/dOmega = d^2/4 (isotropic),
    total cross section = pi d^2
  * Lennard-Jones (reduced units eps = sigma = 1): rainbow angle and glory impact parameter
"""
import numpy as np

def V_lj(r):
    return 4.0 * (r**-12 - r**-6)

def turning_point(b, E, V):
    """Largest r where 1 - b^2/r^2 - V(r)/E = 0 (scan inward, then bisection)."""
    f = lambda r: 1.0 - (b / r)**2 - V(r) / E
    rs = np.linspace(max(5.0, 3.0 * b), 0.5, 6000)
    fv = f(rs)
    for i in range(len(rs) - 1):
        if fv[i] > 0 and fv[i + 1] <= 0:
            lo, hi = rs[i + 1], rs[i]
            for _ in range(80):
                mid = 0.5 * (lo + hi)
                if f(mid) > 0: hi = mid
                else: lo = mid
            return 0.5 * (lo + hi)
    raise ValueError("no turning point")

def deflection(b, E, V=V_lj, N=1000):
    r0 = turning_point(b, E, V)
    w = (np.arange(N) + 0.5) / N
    u = 1.0 - w * w
    g = 1.0 - (b * u / r0)**2 - V(r0 / u) / E
    integral = np.sum(2.0 * w / np.sqrt(np.maximum(g, 1e-300))) / N
    return np.pi - 2.0 * b / r0 * integral

def hard_sphere_check(d=1.0, n=200000, seed=1):
    """Monte Carlo: uniform beam over a disk of radius d; histogram of cos(theta)."""
    rng = np.random.default_rng(seed)
    b = d * np.sqrt(rng.random(n))          # uniform in area
    theta = 2.0 * np.arccos(b / d)
    hist, _ = np.histogram(np.cos(theta), bins=10, range=(-1, 1))
    # dsigma/dOmega = (pi d^2 / n) * counts / (2 pi * dcos)
    dsdo = np.pi * d**2 * hist / n / (2 * np.pi * 0.2)
    return dsdo

if __name__ == "__main__":
    print("Hard sphere dsigma/dOmega per cos-bin (expect d^2/4 = 0.25):")
    print("  ", np.round(hard_sphere_check(), 3))
    print("Hard sphere total cross section = pi d^2 =", round(np.pi, 4))
    print("\\nLennard-Jones deflection function (reduced units)")
    for E in [2.0, 5.0, 10.0]:
        bs = np.linspace(0.02, 3.0, 600)
        th = np.array([deflection(b, E) for b in bs])
        i = int(np.argmin(th))
        glory = bs[:i][np.argmin(np.abs(th[:i]))]
        print(f"  E* = {E:5.1f}: rainbow angle = {np.degrees(th[i]):7.2f} deg at b = {bs[i]:.3f},"
              f"  glory (theta = 0) at b = {glory:.3f}")
    print("\\ntheta(b) table at E* = 2:")
    for b in [0.2, 0.6, 1.0, 1.2, 1.453, 2.0, 2.5]:
        print(f"  b = {b:5.3f}  theta = {np.degrees(deflection(b, 2.0)):8.2f} deg")
`;

// ── matlab/wk11_scattering_deflection.m ─────────────────
export const ML_SCAT = `% Week 11 - Classical elastic scattering: deflection function (Lennard-Jones, reduced units)
% Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
% theta(b) = pi - 2 b Int_{r0}^inf dr / (r^2 sqrt(1 - b^2/r^2 - V(r)/E)),  u = r0/r = 1 - w^2
function wk11_scattering_deflection()
    % hard sphere Monte Carlo: dsigma/dOmega = d^2/4 in every cos(theta) bin
    rng(1); n = 200000; b = sqrt(rand(n,1)); th = 2*acos(b);
    counts = histcounts(cos(th), linspace(-1,1,11));
    fprintf('Hard sphere dsigma/dOmega (expect 0.25): %s\\n', mat2str(round(pi*counts/n/(2*pi*0.2),3)));
    for E = [2 5 10]
        bs = linspace(0.02, 3, 600); th = arrayfun(@(bb) deflection(bb, E), bs);
        [tmin, i] = min(th); [~, j] = min(abs(th(1:i-1)));
        fprintf('E* = %5.1f: rainbow = %7.2f deg at b = %.3f, glory at b = %.3f\\n', E, rad2deg(tmin), bs(i), bs(j));
    end
    figure; plot(bs, rad2deg(th), 'LineWidth', 1.5); xlabel('b/\\sigma'); ylabel('\\theta (deg)');
    title('LJ deflection function, E^* = 10'); grid on;
end
function v = V(r), v = 4*(r.^-12 - r.^-6); end
function r0 = turning(b, E)
    f = @(r) 1 - (b./r).^2 - V(r)/E;
    rs = linspace(max(5, 3*b), 0.5, 6000); fv = f(rs);
    i = find(fv(1:end-1) > 0 & fv(2:end) <= 0, 1);
    r0 = fzero(f, [rs(i+1) rs(i)]);
end
function th = deflection(b, E)
    N = 1000; r0 = turning(b, E); w = ((1:N) - 0.5)/N; u = 1 - w.^2;
    g = 1 - (b*u/r0).^2 - V(r0./u)/E;
    th = pi - 2*b/r0*sum(2*w./sqrt(max(g, 1e-300)))/N;
end
`;

// ── julia/wk11_scattering_deflection.jl ─────────────────
export const JL_SCAT = `# Week 11 - Classical elastic scattering: deflection function (Lennard-Jones, reduced units)
# Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
# theta(b) = pi - 2 b Int_{r0}^inf dr / (r^2 sqrt(1 - b^2/r^2 - V(r)/E)),  u = r0/r = 1 - w^2
using Random, Printf

V(r) = 4.0 * (r^-12 - r^-6)

function turning(b, E)
    f(r) = 1.0 - (b / r)^2 - V(r) / E
    rs = range(max(5.0, 3.0b), 0.5, length=6000)
    for i in 1:length(rs)-1
        if f(rs[i]) > 0 && f(rs[i+1]) <= 0
            lo, hi = rs[i+1], rs[i]
            for _ in 1:80
                m = (lo + hi) / 2
                f(m) > 0 ? (hi = m) : (lo = m)
            end
            return (lo + hi) / 2
        end
    end
    error("no turning point")
end

function deflection(b, E; N=1000)
    r0 = turning(b, E); s = 0.0
    for i in 1:N
        w = (i - 0.5) / N; u = 1 - w^2
        g = 1 - (b * u / r0)^2 - V(r0 / u) / E
        s += 2w / sqrt(max(g, 1e-300))
    end
    return pi - 2b / r0 * s / N
end

Random.seed!(1)
n = 200_000; hist = zeros(Int, 10)
for _ in 1:n
    th = 2acos(sqrt(rand()))
    hist[min(10, floor(Int, (cos(th) + 1) / 0.2) + 1)] += 1
end
println("Hard sphere dsigma/dOmega (expect 0.25): ", round.(pi .* hist ./ n ./ (2pi * 0.2), digits=3))
for E in (2.0, 5.0, 10.0)
    bs = range(0.02, 3.0, length=600)
    th = [deflection(b, E) for b in bs]
    i = argmin(th); j = argmin(abs.(th[1:i-1]))
    @printf("E* = %5.1f: rainbow = %7.2f deg at b = %.3f, glory at b = %.3f\\n", E, rad2deg(th[i]), bs[i], bs[j])
end
`;

// ── cpp/wk11_scattering_deflection.cpp ─────────────────
export const CPP_SCAT = `// Week 11 - Classical elastic scattering: deflection function (Lennard-Jones, reduced units)
// Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
// theta(b) = pi - 2 b Int_{r0}^inf dr / (r^2 sqrt(1 - b^2/r^2 - V(r)/E)),  u = r0/r = 1 - w^2
// Build: g++ -O2 -std=c++17 wk11_scattering_deflection.cpp -o scat
#include <cmath>
#include <cstdio>
#include <initializer_list>
#include <random>
const double PI = 3.14159265358979323846;
double V(double r) { return 4.0 * (std::pow(r, -12) - std::pow(r, -6)); }
double turning(double b, double E) {
    auto f = [&](double r) { return 1.0 - (b / r) * (b / r) - V(r) / E; };
    double rmax = std::fmax(5.0, 3.0 * b), dr = (rmax - 0.5) / 6000.0;
    for (double r = rmax; r > 0.5; r -= dr) {
        if (f(r) > 0 && f(r - dr) <= 0) {
            double lo = r - dr, hi = r;
            for (int i = 0; i < 80; ++i) { double m = 0.5 * (lo + hi); (f(m) > 0 ? hi : lo) = m; }
            return 0.5 * (lo + hi);
        }
    }
    return -1;
}
double deflection(double b, double E, int N = 1000) {
    double r0 = turning(b, E), s = 0;
    for (int i = 0; i < N; ++i) {
        double w = (i + 0.5) / N, u = 1 - w * w;
        double g = 1 - std::pow(b * u / r0, 2) - V(r0 / u) / E;
        s += 2 * w / std::sqrt(std::fmax(g, 1e-300));
    }
    return PI - 2 * b / r0 * s / N;
}
int main() {
    // hard sphere Monte Carlo: dsigma/dOmega should be d^2/4 = 0.25 in every cos(theta) bin
    std::mt19937_64 rng(1); std::uniform_real_distribution<double> U(0, 1);
    int n = 200000, hist[10] = {0};
    for (int i = 0; i < n; ++i) {
        double b = std::sqrt(U(rng)), th = 2 * std::acos(b);
        int k = (int)((std::cos(th) + 1) / 0.2); if (k > 9) k = 9; hist[k]++;
    }
    std::printf("Hard sphere dsigma/dOmega per bin (expect 0.25):");
    for (int k = 0; k < 10; ++k) std::printf(" %.3f", PI * hist[k] / n / (2 * PI * 0.2));
    std::printf("\\n");
    for (double E : {2.0, 5.0, 10.0}) {
        double best = 1e9, bb = 0, glory = 0, gmin = 1e9;
        for (int i = 0; i < 600; ++i) {
            double b = 0.02 + i * (3.0 - 0.02) / 599, th = deflection(b, E);
            if (th < best) { best = th; bb = b; }
        }
        for (int i = 0; i < 600; ++i) {
            double b = 0.02 + i * (3.0 - 0.02) / 599; if (b >= bb) break;
            double th = std::fabs(deflection(b, E)); if (th < gmin) { gmin = th; glory = b; }
        }
        std::printf("E* = %5.1f: rainbow = %7.2f deg at b = %.3f, glory at b = %.3f\\n",
                    E, best * 180 / PI, bb, glory);
    }
    return 0;
}
`;

// ── python/wk11_leps_trajectory.py ─────────────────
export const PY_LEPS = `"""
Week 11 - Collinear A + BC -> AB + C on a LEPS potential energy surface
Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)

LEPS (London-Eyring-Polanyi-Sato) surface with Sato parameter K:
  Q_i = D_i/4 [ (3+K) e^{-2b(r-re)} - (2+6K) e^{-b(r-re)} ] / (1+K)
  J_i = D_i/4 [ (1+3K) e^{-2b(r-re)} - (6+2K) e^{-b(r-re)} ] / (1+K)
  V   = Q1 + Q2 + Q3 - sqrt( [(J1-J2)^2 + (J2-J3)^2 + (J3-J1)^2] / 2 )
  r1 = r_AB, r2 = r_BC, r3 = r1 + r2 (collinear)
H2 Morse parameters: D = 4.746 eV, b = 1.942 1/A, re = 0.742 A.
K = 0.136 puts the H3 saddle at r1 = r2 = 0.931 A with a 0.416 eV barrier,
close to the accurate ab initio value (9.53-9.65 kcal/mol = 0.413-0.418 eV).

Units: eV, A, amu  ->  time unit = sqrt(amu A^2 / eV) = 10.18 fs.
"Early" and "late" model surfaces change only D_AB (exothermic vs endothermic)
to illustrate the Polanyi rules.
"""
import numpy as np

B, RE, K = 1.942, 0.742, 0.136
M = 1.00784                       # H atom mass (amu)
HBAR = 0.6582119569 / 10.1805     # eV * (time unit)

SURF = {"symmetric": (4.746, 4.746, 4.746),   # D_AB, D_BC, D_AC (eV)
        "early":     (5.5,   4.746, 4.746),   # exothermic by 0.754 eV
        "late":      (4.746, 5.5,   4.746)}   # endothermic by 0.754 eV

def qj(r, D):
    e1 = np.exp(-B * (r - RE)); e2 = e1 * e1
    Q = D / 4 * ((3 + K) * e2 - (2 + 6 * K) * e1) / (1 + K)
    J = D / 4 * ((1 + 3 * K) * e2 - (6 + 2 * K) * e1) / (1 + K)
    dQ = D / 4 * (-2 * B * (3 + K) * e2 + B * (2 + 6 * K) * e1) / (1 + K)
    dJ = D / 4 * (-2 * B * (1 + 3 * K) * e2 + B * (6 + 2 * K) * e1) / (1 + K)
    return Q, J, dQ, dJ

def leps(r1, r2, D):
    Q1, J1, dQ1, dJ1 = qj(r1, D[0])
    Q2, J2, dQ2, dJ2 = qj(r2, D[1])
    Q3, J3, dQ3, dJ3 = qj(r1 + r2, D[2])
    S = np.sqrt(0.5 * ((J1 - J2)**2 + (J2 - J3)**2 + (J3 - J1)**2)) + 1e-14
    s1 = (2 * J1 - J2 - J3) / (2 * S)
    s2 = (2 * J2 - J1 - J3) / (2 * S)
    s3 = (2 * J3 - J1 - J2) / (2 * S)
    V = Q1 + Q2 + Q3 - S
    g1 = dQ1 + dQ3 - s1 * dJ1 - s3 * dJ3          # dV/dr1
    g2 = dQ2 + dQ3 - s2 * dJ2 - s3 * dJ3          # dV/dr2
    return V, g1, g2

def barrier(D):
    """Max along x = r2 - r1 of the minimum over y = r1 + r2 (grid minimax)."""
    best, arg = -1e9, None
    for x in np.linspace(-3, 3, 1201):
        ys = np.linspace(abs(x) + 0.5, abs(x) + 4, 700)
        v = leps((ys - x) / 2, (ys + x) / 2, D)[0]
        j = int(np.argmin(v))
        if v[j] > best:
            best, arg = v[j], ((ys[j] - x) / 2, (ys[j] + x) / 2)
    return best + D[1], arg

def trajectory(D, Et, Ev, phase, dt=0.002, tmax=15.0, keep=False):
    """Velocity Verlet for three collinear atoms. Returns 1 (reactive), 0, or 0.5."""
    mu = M / 2
    w = B * np.sqrt(2 * D[1] / mu)                 # BC harmonic frequency
    A = np.sqrt(2 * Ev / (mu * w * w))
    r2 = RE + A * np.cos(phase); vr = -A * w * np.sin(phase)
    vrel = np.sqrt(2 * Et / (2 * M / 3))           # reduced mass of A vs BC
    x = np.array([-4.0, 0.0, r2])
    v = np.array([2 * vrel / 3, -vr / 2 - vrel / 3, vr / 2 - vrel / 3])
    def force(x):
        _, g1, g2 = leps(x[1] - x[0], x[2] - x[1], D)
        return np.array([g1, -g1 + g2, -g2])
    f = force(x); t = 0.0; path = []
    while t < tmax:
        v += 0.5 * dt * f / M; x += dt * v; f = force(x); v += 0.5 * dt * f / M; t += dt
        r1, r2 = x[1] - x[0], x[2] - x[1]
        if keep and int(t / dt) % 10 == 0: path.append((r1, r2))
        if r1 > 5 and r2 < 2: return (0, path) if keep else 0
        if r2 > 5 and r1 < 2: return (1, path) if keep else 1
    return (0.5, path) if keep else 0.5

def reaction_probability(D, Et, Ev, n=24):
    return np.mean([trajectory(D, Et, Ev, p) for p in np.linspace(0, 2 * np.pi, n, endpoint=False)])

if __name__ == "__main__":
    hw = HBAR * B * np.sqrt(2 * 4.746 / (M / 2))
    print(f"H2 harmonic quantum hbar*omega = {hw:.4f} eV  ({hw / 1.239842e-4:.0f} cm^-1)")
    for name, D in SURF.items():
        Eb, (r1, r2) = barrier(D)
        print(f"{name:9s}: barrier = {Eb:.3f} eV at r_AB = {r1:.3f} A, r_BC = {r2:.3f} A,"
              f"  reaction energy = {D[1] - D[0]:+.3f} eV")
    print("\\nPolanyi rules: same total energy, different split (24 vibrational phases each)")
    for name, tot in [("early", 0.45), ("late", 1.30)]:
        for f in (0.9, 0.5, 0.1):
            P = reaction_probability(SURF[name], tot * f, tot * (1 - f))
            print(f"  {name:5s}  E_trans = {tot * f:.2f} eV, E_vib = {tot * (1 - f):.2f} eV  ->  P_react = {P:.2f}")
`;

// ── matlab/wk11_leps_trajectory.m ─────────────────
export const ML_LEPS = `% Week 11 - Collinear A + BC on a LEPS surface: barrier and Polanyi rules
% Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
% Units eV, Angstrom, amu (time unit 10.18 fs). Sato K = 0.136 -> H3 barrier 0.416 eV at 0.931 A.
function wk11_leps_trajectory()
    S.symmetric = [4.746 4.746 4.746]; S.early = [5.5 4.746 4.746]; S.late = [4.746 5.5 4.746];
    names = fieldnames(S);
    for s = 1:3
        D = S.(names{s}); [Eb, r1, r2] = barrier(D);
        fprintf('%-9s barrier = %.3f eV at r_AB = %.3f, r_BC = %.3f A\\n', names{s}, Eb, r1, r2);
    end
    tot = struct('early', 0.45, 'late', 1.30);
    for nm = {'early', 'late'}
        for f = [0.9 0.5 0.1]
            T = tot.(nm{1}); P = 0;
            for k = 0:23, P = P + trajectory(S.(nm{1}), T*f, T*(1-f), 2*pi*k/24); end
            fprintf('  %-5s E_trans = %.2f, E_vib = %.2f eV -> P = %.2f\\n', nm{1}, T*f, T*(1-f), P/24);
        end
    end
    % contour plot of the symmetric surface
    [R1, R2] = meshgrid(linspace(0.5, 3, 200));
    figure; contour(R1, R2, leps(R1, R2, S.symmetric), -4.7:0.1:-3); axis equal;
    xlabel('r_{AB} (A)'); ylabel('r_{BC} (A)'); title('LEPS H + H_2');
end
function [Q, J, dQ, dJ] = qj(r, D)
    B = 1.942; RE = 0.742; K = 0.136; c = D/4/(1+K);
    e1 = exp(-B*(r-RE)); e2 = e1.^2;
    Q = c*((3+K)*e2 - (2+6*K)*e1);  J = c*((1+3*K)*e2 - (6+2*K)*e1);
    dQ = c*(-2*B*(3+K)*e2 + B*(2+6*K)*e1); dJ = c*(-2*B*(1+3*K)*e2 + B*(6+2*K)*e1);
end
function [V, g1, g2] = leps(r1, r2, D)
    [Q1,J1,dQ1,dJ1] = qj(r1, D(1)); [Q2,J2,dQ2,dJ2] = qj(r2, D(2)); [Q3,J3,dQ3,dJ3] = qj(r1+r2, D(3));
    S = sqrt(0.5*((J1-J2).^2 + (J2-J3).^2 + (J3-J1).^2)) + 1e-14;
    V = Q1 + Q2 + Q3 - S;
    g1 = dQ1 + dQ3 - (2*J1-J2-J3)./(2*S).*dJ1 - (2*J3-J1-J2)./(2*S).*dJ3;
    g2 = dQ2 + dQ3 - (2*J2-J1-J3)./(2*S).*dJ2 - (2*J3-J1-J2)./(2*S).*dJ3;
end
function [Eb, R1, R2] = barrier(D)
    best = -1e9;
    for x = linspace(-3, 3, 1201)
        y = linspace(abs(x)+0.5, abs(x)+4, 700); v = leps((y-x)/2, (y+x)/2, D); [vm, j] = min(v);
        if vm > best, best = vm; R1 = (y(j)-x)/2; R2 = (y(j)+x)/2; end
    end
    Eb = best + D(2);
end
function out = trajectory(D, Et, Ev, phase)
    M = 1.00784; B = 1.942; RE = 0.742; mu = M/2; w = B*sqrt(2*D(2)/mu); A = sqrt(2*Ev/(mu*w^2));
    r2 = RE + A*cos(phase); vr = -A*w*sin(phase); vrel = sqrt(2*Et/(2*M/3));
    x = [-4; 0; r2]; v = [2*vrel/3; -vr/2 - vrel/3; vr/2 - vrel/3]; dt = 0.002;
    f = force(x, D); out = 0.5;
    for t = 0:dt:15
        v = v + 0.5*dt*f/M; x = x + dt*v; f = force(x, D); v = v + 0.5*dt*f/M;
        a = x(2)-x(1); b = x(3)-x(2);
        if a > 5 && b < 2, out = 0; return; end
        if b > 5 && a < 2, out = 1; return; end
    end
end
function f = force(x, D)
    [~, g1, g2] = leps(x(2)-x(1), x(3)-x(2), D); f = [g1; -g1+g2; -g2];
end
`;

// ── julia/wk11_leps_trajectory.jl ─────────────────
export const JL_LEPS = `# Week 11 - Collinear A + BC on a LEPS surface: barrier and Polanyi rules
# Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
# Units eV, Angstrom, amu (time unit 10.18 fs). Sato K = 0.136 -> H3 barrier 0.416 eV at 0.931 A.
using Printf
const B, RE, K, M = 1.942, 0.742, 0.136, 1.00784

function qj(r, D)
    e1 = exp(-B * (r - RE)); e2 = e1^2; c = D / 4 / (1 + K)
    (c * ((3 + K) * e2 - (2 + 6K) * e1), c * ((1 + 3K) * e2 - (6 + 2K) * e1),
     c * (-2B * (3 + K) * e2 + B * (2 + 6K) * e1), c * (-2B * (1 + 3K) * e2 + B * (6 + 2K) * e1))
end

function leps(r1, r2, D)
    Q1, J1, dQ1, dJ1 = qj(r1, D[1]); Q2, J2, dQ2, dJ2 = qj(r2, D[2]); Q3, J3, dQ3, dJ3 = qj(r1 + r2, D[3])
    S = sqrt(0.5 * ((J1 - J2)^2 + (J2 - J3)^2 + (J3 - J1)^2)) + 1e-14
    s1 = (2J1 - J2 - J3) / 2S; s2 = (2J2 - J1 - J3) / 2S; s3 = (2J3 - J1 - J2) / 2S
    (Q1 + Q2 + Q3 - S, dQ1 + dQ3 - s1 * dJ1 - s3 * dJ3, dQ2 + dQ3 - s2 * dJ2 - s3 * dJ3)
end

function barrier(D)
    best, R1, R2 = -1e9, 0.0, 0.0
    for x in range(-3, 3, length=1201)
        vmin, y1, y2 = 1e9, 0.0, 0.0
        for y in range(abs(x) + 0.5, abs(x) + 4, length=700)
            v = leps((y - x) / 2, (y + x) / 2, D)[1]
            v < vmin && ((vmin, y1, y2) = (v, (y - x) / 2, (y + x) / 2))
        end
        vmin > best && ((best, R1, R2) = (vmin, y1, y2))
    end
    best + D[2], R1, R2
end

function trajectory(D, Et, Ev, phase; dt=0.002, tmax=15.0)
    mu = M / 2; w = B * sqrt(2D[2] / mu); A = sqrt(2Ev / (mu * w^2))
    r2 = RE + A * cos(phase); vr = -A * w * sin(phase); vrel = sqrt(2Et / (2M / 3))
    x = [-4.0, 0.0, r2]; v = [2vrel / 3, -vr / 2 - vrel / 3, vr / 2 - vrel / 3]
    force(x) = (g = leps(x[2] - x[1], x[3] - x[2], D); [g[2], -g[2] + g[3], -g[3]])
    f = force(x); t = 0.0
    while t < tmax
        v .+= 0.5dt .* f ./ M; x .+= dt .* v; f = force(x); v .+= 0.5dt .* f ./ M; t += dt
        a, b = x[2] - x[1], x[3] - x[2]
        (a > 5 && b < 2) && return 0.0
        (b > 5 && a < 2) && return 1.0
    end
    0.5
end

surf = [("symmetric", (4.746, 4.746, 4.746)), ("early", (5.5, 4.746, 4.746)), ("late", (4.746, 5.5, 4.746))]
for (name, D) in surf
    Eb, r1, r2 = barrier(D)
    @printf("%-9s barrier = %.3f eV at r_AB = %.3f, r_BC = %.3f A\\n", name, Eb, r1, r2)
end
for (name, D, tot) in (("early", surf[2][2], 0.45), ("late", surf[3][2], 1.30)), f in (0.9, 0.5, 0.1)
    P = sum(trajectory(D, tot * f, tot * (1 - f), 2pi * k / 24) for k in 0:23) / 24
    @printf("  %-5s E_trans = %.2f, E_vib = %.2f eV -> P = %.2f\\n", name, tot * f, tot * (1 - f), P)
end
`;

// ── cpp/wk11_leps_trajectory.cpp ─────────────────
export const CPP_LEPS = `// Week 11 - Collinear A + BC on a LEPS surface: barrier location and Polanyi rules
// Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
// Units: eV, Angstrom, amu (time unit 10.18 fs). Sato K = 0.136 -> H3 barrier 0.416 eV at 0.931 A.
// Build: g++ -O2 -std=c++17 wk11_leps_trajectory.cpp -o leps
#include <cmath>
#include <cstdio>
#include <initializer_list>
const double B = 1.942, RE = 0.742, K = 0.136, M = 1.00784, PI = 3.14159265358979323846;
struct QJ { double Q, J, dQ, dJ; };
QJ qj(double r, double D) {
    double e1 = std::exp(-B * (r - RE)), e2 = e1 * e1, c = D / 4 / (1 + K);
    return { c * ((3 + K) * e2 - (2 + 6 * K) * e1), c * ((1 + 3 * K) * e2 - (6 + 2 * K) * e1),
             c * (-2 * B * (3 + K) * e2 + B * (2 + 6 * K) * e1), c * (-2 * B * (1 + 3 * K) * e2 + B * (6 + 2 * K) * e1) };
}
void leps(double r1, double r2, const double* D, double& V, double& g1, double& g2) {
    QJ a = qj(r1, D[0]), b = qj(r2, D[1]), c = qj(r1 + r2, D[2]);
    double S = std::sqrt(0.5 * ((a.J - b.J) * (a.J - b.J) + (b.J - c.J) * (b.J - c.J) + (c.J - a.J) * (c.J - a.J))) + 1e-14;
    double s1 = (2 * a.J - b.J - c.J) / (2 * S), s2 = (2 * b.J - a.J - c.J) / (2 * S), s3 = (2 * c.J - a.J - b.J) / (2 * S);
    V = a.Q + b.Q + c.Q - S;
    g1 = a.dQ + c.dQ - s1 * a.dJ - s3 * c.dJ;
    g2 = b.dQ + c.dQ - s2 * b.dJ - s3 * c.dJ;
}
double barrier(const double* D, double& R1, double& R2) {
    double best = -1e9;
    for (int i = 0; i <= 1200; ++i) {
        double x = -3 + 6.0 * i / 1200, vmin = 1e9, y1 = 0, y2 = 0;
        for (int j = 0; j < 700; ++j) {
            double y = std::fabs(x) + 0.5 + 3.5 * j / 699, V, g1, g2;
            leps((y - x) / 2, (y + x) / 2, D, V, g1, g2);
            if (V < vmin) { vmin = V; y1 = (y - x) / 2; y2 = (y + x) / 2; }
        }
        if (vmin > best) { best = vmin; R1 = y1; R2 = y2; }
    }
    return best + D[1];
}
double trajectory(const double* D, double Et, double Ev, double phase) {
    double mu = M / 2, w = B * std::sqrt(2 * D[1] / mu), A = std::sqrt(2 * Ev / (mu * w * w));
    double r2 = RE + A * std::cos(phase), vr = -A * w * std::sin(phase), vrel = std::sqrt(2 * Et / (2 * M / 3));
    double x[3] = {-4.0, 0.0, r2}, v[3] = {2 * vrel / 3, -vr / 2 - vrel / 3, vr / 2 - vrel / 3}, f[3];
    auto force = [&]() { double V, g1, g2; leps(x[1] - x[0], x[2] - x[1], D, V, g1, g2); f[0] = g1; f[1] = -g1 + g2; f[2] = -g2; };
    force();
    const double dt = 0.002;
    for (double t = 0; t < 15.0; t += dt) {
        for (int i = 0; i < 3; ++i) { v[i] += 0.5 * dt * f[i] / M; x[i] += dt * v[i]; }
        force();
        for (int i = 0; i < 3; ++i) v[i] += 0.5 * dt * f[i] / M;
        double a = x[1] - x[0], b = x[2] - x[1];
        if (a > 5 && b < 2) return 0;
        if (b > 5 && a < 2) return 1;
    }
    return 0.5;
}
int main() {
    const char* names[3] = {"symmetric", "early", "late"};
    double S[3][3] = {{4.746, 4.746, 4.746}, {5.5, 4.746, 4.746}, {4.746, 5.5, 4.746}};
    for (int s = 0; s < 3; ++s) {
        double r1, r2, Eb = barrier(S[s], r1, r2);
        std::printf("%-9s barrier = %.3f eV at r_AB = %.3f, r_BC = %.3f A\\n", names[s], Eb, r1, r2);
    }
    double tot[2] = {0.45, 1.30};
    for (int s = 1; s <= 2; ++s)
        for (double f : {0.9, 0.5, 0.1}) {
            double P = 0;
            for (int k = 0; k < 24; ++k) P += trajectory(S[s], tot[s - 1] * f, tot[s - 1] * (1 - f), 2 * PI * k / 24);
            std::printf("  %-5s E_trans = %.2f, E_vib = %.2f eV -> P = %.2f\\n", names[s], tot[s - 1] * f, tot[s - 1] * (1 - f), P / 24);
        }
    return 0;
}
`;

// ── python/wk11_marcus_et.py ─────────────────
export const PY_MARCUS = `"""
Week 11 - Electron transfer: Marcus theory and the bimolecular steady state
Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)

Marcus parabolas (reaction coordinate q, q0 = displacement of the product well):
  G_R(q) = lam q^2 / q0^2,  G_P(q) = lam (q - q0)^2 / q0^2 + dG0,  lam = k_e q0^2 / 2
  crossing: q* = (q0/2)(1 + dG0/lam),   dG* = (lam + dG0)^2 / (4 lam)
Semiclassical (nonadiabatic) rate:
  k_ET = (2 pi / hbar) |V|^2 (4 pi lam kT)^(-1/2) exp[ -(lam + dG0)^2 / (4 lam kT) ]
Bimolecular steady state (lecture scheme D + A <-> DA <-> D+A- -> products):
  1/k_r = 1/k_a + k_a'/(k_a k_et) (1 + k_et'/k_d),   k_et' = k_et exp(dG0/kT)
"""
import numpy as np

HBAR = 6.582119569e-16      # eV s
KB = 8.617333262e-5         # eV/K

def dG_act(lam, dG0):
    return (lam + dG0)**2 / (4 * lam)

def k_marcus(dG0, lam, V, T=298.15):
    kT = KB * T
    return 2 * np.pi / HBAR * V**2 / np.sqrt(4 * np.pi * lam * kT) * np.exp(-dG_act(lam, dG0) / kT)

def k_bimolecular(dG0, lam, V, ka=7.4e9, KA=1.0, kd=None, T=298.15):
    """ka in M^-1 s^-1 (diffusion), KA = ka/ka' encounter-pair constant in M^-1."""
    kT = KB * T
    ka_rev = ka / KA                         # s^-1
    kd = ka_rev if kd is None else kd        # separation of D+ A- pair (s^-1)
    ket = k_marcus(dG0, lam, V, T)
    ket_rev = ket * np.exp(dG0 / kT)
    return 1.0 / (1.0 / ka + ka_rev / (ka * ket) * (1.0 + ket_rev / kd))

if __name__ == "__main__":
    T = 298.15
    eta = 0.890e-3                                # water viscosity, Pa s
    ka = 8 * 8.314462618 * T / (3 * eta) * 1e3    # m^3 mol^-1 s^-1 -> M^-1 s^-1
    print(f"Diffusion-limited k_a = 8RT/3eta (water, 298 K) = {ka:.2e} M^-1 s^-1")
    lam, V = 1.0, 0.01                            # eV
    kmax = k_marcus(-lam, lam, V, T)
    print(f"lambda = {lam} eV, V = {V} eV:  k_ET(max, at dG0 = -lambda) = {kmax:.3e} s^-1")
    print("\\n  dG0 (eV)   dG* (eV)   k_ET (s^-1)   k_r bimolecular (M^-1 s^-1)")
    for dG0 in [0.2, 0.0, -0.25, -0.5, -1.0, -1.5, -2.0, -2.5, -3.0]:
        print(f"  {dG0:6.2f}   {dG_act(lam, dG0):8.4f}   {k_marcus(dG0, lam, V, T):11.3e}"
              f"   {k_bimolecular(dG0, lam, V, ka=ka, T=T):11.3e}")
    # inverted-region symmetry check: equal |dG0 + lam| -> equal k
    print("\\nSymmetry check k(-0.5) / k(-1.5) =", k_marcus(-0.5, lam, V) / k_marcus(-1.5, lam, V))
    # protein tunnelling: rate at closest contact ~1e13 s^-1, 10x slower per 1.7 A
    beta = np.log(10) / 1.7
    print(f"Tunnelling decay 10x per 1.7 A  ->  beta = {beta:.2f} 1/A (rate),"
          f" k(14 A)/k(4 A) = {np.exp(-beta * 10):.1e}")
`;

// ── matlab/wk11_marcus_et.m ─────────────────
export const ML_MARCUS = `% Week 11 - Marcus electron-transfer rate and bimolecular steady state
% Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
% k_ET = (2pi/hbar)|V|^2 (4 pi lam kT)^(-1/2) exp[-(lam + dG0)^2/(4 lam kT)]
% 1/k_r = 1/k_a + k_a'/(k_a k_et) (1 + k_et'/k_d)
function wk11_marcus_et()
    HBAR = 6.582119569e-16; KB = 8.617333262e-5; T = 298.15; kT = KB*T;
    lam = 1.0; V = 0.01; eta = 0.890e-3; ka = 8*8.314462618*T/(3*eta)*1e3; KA = 1.0;
    kM = @(dG0) 2*pi/HBAR*V^2/sqrt(4*pi*lam*kT)*exp(-(lam+dG0).^2/(4*lam*kT));
    karev = ka/KA; kd = karev;
    kr = @(dG0) 1./(1/ka + karev./(ka*kM(dG0)).*(1 + kM(dG0).*exp(dG0/kT)/kd));
    fprintf('k_a = %.3e M^-1 s^-1, k_ET max = %.4e s^-1\\n', ka, kM(-lam));
    for dG0 = [0.2 0 -0.25 -0.5 -1 -1.5 -2 -2.5 -3]
        fprintf('%6.2f %8.4f %11.3e %11.3e\\n', dG0, (lam+dG0)^2/(4*lam), kM(dG0), kr(dG0));
    end
    g = linspace(-3, 0.5, 400);
    figure; semilogy(-g, kM(g), -g, kr(g), 'LineWidth', 1.5);
    xlabel('-\\Delta G^\\circ (eV)'); ylabel('rate'); legend('k_{ET} (s^{-1})', 'k_r (M^{-1}s^{-1})'); grid on;
end
`;

// ── julia/wk11_marcus_et.jl ─────────────────
export const JL_MARCUS = `# Week 11 - Marcus electron-transfer rate and bimolecular steady state
# Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
# k_ET = (2pi/hbar)|V|^2 (4 pi lam kT)^(-1/2) exp[-(lam + dG0)^2/(4 lam kT)]
# 1/k_r = 1/k_a + k_a'/(k_a k_et) (1 + k_et'/k_d)
using Printf
const HBAR, KB = 6.582119569e-16, 8.617333262e-5

kmarcus(dG0, lam, V, T) = 2pi / HBAR * V^2 / sqrt(4pi * lam * KB * T) * exp(-(lam + dG0)^2 / (4lam * KB * T))
function kbimol(dG0, lam, V, ka, KA, T)
    karev = ka / KA; kd = karev; ket = kmarcus(dG0, lam, V, T); ketr = ket * exp(dG0 / (KB * T))
    1 / (1 / ka + karev / (ka * ket) * (1 + ketr / kd))
end

T = 298.15; eta = 0.890e-3; ka = 8 * 8.314462618 * T / (3eta) * 1e3; lam, V = 1.0, 0.01
@printf("k_a = %.3e M^-1 s^-1, k_ET max = %.4e s^-1\\n", ka, kmarcus(-lam, lam, V, T))
for dG0 in (0.2, 0.0, -0.25, -0.5, -1.0, -1.5, -2.0, -2.5, -3.0)
    @printf("%6.2f %8.4f %11.3e %11.3e\\n", dG0, (lam + dG0)^2 / 4lam, kmarcus(dG0, lam, V, T), kbimol(dG0, lam, V, ka, 1.0, T))
end
@printf("beta from 10x per 1.7 A = %.3f 1/A\\n", log(10) / 1.7)
`;

// ── cpp/wk11_marcus_et.cpp ─────────────────
export const CPP_MARCUS = `// Week 11 - Marcus electron-transfer rate and bimolecular steady state
// Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
// k_ET = (2pi/hbar)|V|^2 (4 pi lam kT)^(-1/2) exp[-(lam + dG0)^2/(4 lam kT)]
// 1/k_r = 1/k_a + k_a'/(k_a k_et) (1 + k_et'/k_d)
// Build: g++ -O2 -std=c++17 wk11_marcus_et.cpp -o marcus
#include <cmath>
#include <cstdio>
#include <initializer_list>
const double HBAR = 6.582119569e-16, KB = 8.617333262e-5, PI = 3.14159265358979323846;
double kMarcus(double dG0, double lam, double V, double T) {
    double kT = KB * T;
    return 2 * PI / HBAR * V * V / std::sqrt(4 * PI * lam * kT) * std::exp(-(lam + dG0) * (lam + dG0) / (4 * lam * kT));
}
double kBimol(double dG0, double lam, double V, double ka, double KA, double T) {
    double kT = KB * T, karev = ka / KA, kd = karev, ket = kMarcus(dG0, lam, V, T), ketr = ket * std::exp(dG0 / kT);
    return 1.0 / (1.0 / ka + karev / (ka * ket) * (1.0 + ketr / kd));
}
int main() {
    double T = 298.15, eta = 0.890e-3, ka = 8 * 8.314462618 * T / (3 * eta) * 1e3, lam = 1.0, V = 0.01;
    std::printf("k_a = 8RT/3eta = %.3e M^-1 s^-1\\n", ka);
    std::printf("k_ET max = %.4e s^-1\\n", kMarcus(-lam, lam, V, T));
    std::printf("  dG0     dG*      k_ET        k_r\\n");
    for (double dG0 : {0.2, 0.0, -0.25, -0.5, -1.0, -1.5, -2.0, -2.5, -3.0})
        std::printf("%6.2f %8.4f %11.3e %11.3e\\n", dG0, (lam + dG0) * (lam + dG0) / (4 * lam),
                    kMarcus(dG0, lam, V, T), kBimol(dG0, lam, V, ka, 1.0, T));
    std::printf("beta from 10x per 1.7 A = %.3f 1/A\\n", std::log(10.0) / 1.7);
    return 0;
}
`;

// ── python/wk11_phonon_chain.py ─────────────────
export const PY_PHON = `"""
Week 11 - Lattice vibrations of 1D chains: dispersion, Brillouin zone, phonon heat capacity
Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)

Monatomic chain (mass m, spring kappa, spacing a):
  m d2x_n/dt2 = kappa (x_{n+1} - 2 x_n + x_{n-1})  ->  omega(k) = 2 sqrt(kappa/m) |sin(ka/2)|
Diatomic chain (masses m1, m2; springs kappa1 inside the cell, kappa2 between cells):
  omega^2 = S/2 (1/m1 + 1/m2) +/- 1/2 sqrt( S^2 (1/m1 + 1/m2)^2 - 16 kappa1 kappa2 sin^2(ka/2)/(m1 m2) ),
  S = kappa1 + kappa2
Checks: eigenvalues of the finite periodic chain (N cells) equal the analytic branches at
k = 2 pi p/(N a); N cells give exactly N (monatomic) or 2N (diatomic) normal modes.
Phonon heat capacity: each mode is a quantum harmonic oscillator (Einstein function).
"""
import numpy as np

def omega_mono(k, kappa=1.0, m=1.0, a=1.0):
    return 2 * np.sqrt(kappa / m) * np.abs(np.sin(k * a / 2))

def omega_di(k, m1, m2, k1, k2, a=1.0):
    S = k1 + k2; inv = 1 / m1 + 1 / m2
    root = np.sqrt(np.maximum(S**2 * inv**2 - 16 * k1 * k2 * np.sin(k * a / 2)**2 / (m1 * m2), 0))
    return np.sqrt(np.maximum(0.5 * (S * inv - root), 0)), np.sqrt(0.5 * (S * inv + root))

def chain_matrix(masses, springs):
    """Mass-weighted dynamical matrix for a periodic chain. springs[i] couples atom i and i+1."""
    n = len(masses); Dm = np.zeros((n, n))
    for i in range(n):
        j = (i + 1) % n; s = springs[i]
        Dm[i, i] += s; Dm[j, j] += s; Dm[i, j] -= s; Dm[j, i] -= s
    msq = np.sqrt(masses)
    return Dm / np.outer(msq, msq)

def heat_capacity_1d(omegas, T):
    """C/(N_modes k) for quantum oscillators, omega in units where hbar = k = 1."""
    x = omegas / T
    with np.errstate(over="ignore", invalid="ignore"):
        c = np.where(x < 1e-8, 1.0, x**2 * np.exp(x) / np.expm1(x)**2)
    return np.mean(c)

if __name__ == "__main__":
    N = 40
    w_num = np.sqrt(np.abs(np.linalg.eigvalsh(chain_matrix(np.ones(N), np.ones(N)))))
    ks = 2 * np.pi * np.arange(N) / N
    w_ana = np.sort(omega_mono(ks))
    print(f"Monatomic N = {N}: modes = {len(w_num)}, max |numeric - analytic| = {np.max(np.abs(np.sort(w_num) - w_ana)):.2e}")
    print(f"  omega_max = 2 sqrt(kappa/m) = {w_num.max():.6f}")
    # diatomic, m2/m1 = 2
    m1, m2, k1, k2 = 1.0, 2.0, 1.0, 1.0
    masses = np.tile([m1, m2], N); springs = np.tile([k1, k2], N)
    w2 = np.sort(np.sqrt(np.abs(np.linalg.eigvalsh(chain_matrix(masses, springs)))))
    ac, op = omega_di(ks, m1, m2, k1, k2)
    w2a = np.sort(np.concatenate([ac, op]))
    print(f"Diatomic N = {N} cells: modes = {len(w2)}, max |numeric - analytic| = {np.max(np.abs(w2 - w2a)):.2e}")
    a_zb, o_zb = omega_di(np.pi, m1, m2, k1, k2)
    print(f"  zone boundary: acoustic = {a_zb:.4f} = sqrt(2C/m2), optical = {o_zb:.4f} = sqrt(2C/m1),"
          f" gap = {o_zb - a_zb:.4f}")
    print(f"  k = 0 optical = sqrt(2C(1/m1+1/m2)) = {omega_di(0.0, m1, m2, k1, k2)[1]:.4f}")
    # sound speed check: d omega/dk at k -> 0 equals a sqrt(kappa/m) for monatomic
    dk = 1e-6
    print(f"Sound speed (monatomic) = {(omega_mono(dk) - omega_mono(0)) / dk:.6f} (expect a sqrt(kappa/m) = 1)")
    # heat capacity of the monatomic chain (hbar = k = 1, omega_max = 2)
    Nbig = 2000
    wk = omega_mono(2 * np.pi * np.arange(1, Nbig) / Nbig)
    for T in [0.05, 0.2, 0.5, 1.0, 2.0, 5.0]:
        print(f"  T = {T:4.2f}: C/Nk = {heat_capacity_1d(wk, T):.4f}")
    # Si estimate from the Raman optical phonon (520.2 cm^-1, Parker et al. 1967)
    c = 2.99792458e10; amu = 1.66053906660e-27
    w = 2 * np.pi * c * 520.2; m = 28.0855 * amu
    print(f"Si: omega_opt = {w:.3e} rad/s -> effective 1D spring kappa = m omega^2/4 = {m * w * w / 4:.0f} N/m")
`;

// ── matlab/wk11_phonon_chain.m ─────────────────
export const ML_PHON = `% Week 11 - 1D monatomic and diatomic chains: dispersion and phonon heat capacity
% Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
function wk11_phonon_chain()
    N = 40; m1 = 1; m2 = 2; k1 = 1; k2 = 1;
    masses = repmat([m1 m2], 1, N); springs = repmat([k1 k2], 1, N);
    wn = sort(sqrt(abs(eig(chainMatrix(masses, springs)))));
    ks = 2*pi*(0:N-1)/N; [ac, op] = omegaDi(ks, m1, m2, k1, k2);
    wa = sort([ac op])';
    fprintf('Diatomic, %d cells: %d modes, max error = %.2e\\n', N, numel(wn), max(abs(wn - wa)));
    [a, o] = omegaDi(pi, m1, m2, k1, k2); fprintf('Zone boundary: acoustic %.4f, optical %.4f\\n', a, o);
    Nb = 2000; w = 2*abs(sin(pi*(1:Nb-1)/Nb));
    for T = [0.05 0.2 0.5 1 2 5]
        x = w/T; c = x.^2.*exp(x)./expm1(x).^2; fprintf('  T = %4.2f: C/Nk = %.4f\\n', T, mean(c));
    end
    k = linspace(-pi, pi, 400); [ac, op] = omegaDi(k, m1, m2, k1, k2);
    figure; plot(k, ac, k, op, 'LineWidth', 1.5); xlabel('ka'); ylabel('\\omega'); grid on;
end
function D = chainMatrix(m, s)
    n = numel(m); D = zeros(n);
    for i = 1:n
        j = mod(i, n) + 1;
        D(i,i) = D(i,i) + s(i); D(j,j) = D(j,j) + s(i); D(i,j) = D(i,j) - s(i); D(j,i) = D(j,i) - s(i);
    end
    D = D ./ sqrt(m' * m);
end
function [ac, op] = omegaDi(k, m1, m2, k1, k2)
    S = k1 + k2; inv = 1/m1 + 1/m2;
    root = sqrt(max(S^2*inv^2 - 16*k1*k2*sin(k/2).^2/(m1*m2), 0));
    ac = sqrt(max(0.5*(S*inv - root), 0)); op = sqrt(0.5*(S*inv + root));
end
`;

// ── julia/wk11_phonon_chain.jl ─────────────────
export const JL_PHON = `# Week 11 - 1D monatomic and diatomic chains: dispersion and phonon heat capacity
# Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
using LinearAlgebra, Printf

function chain_matrix(m, s)
    n = length(m); D = zeros(n, n)
    for i in 1:n
        j = mod(i, n) + 1
        D[i, i] += s[i]; D[j, j] += s[i]; D[i, j] -= s[i]; D[j, i] -= s[i]
    end
    D ./ sqrt.(m * m')
end
function omega_di(k, m1, m2, k1, k2)
    S = k1 + k2; inv = 1 / m1 + 1 / m2
    root = sqrt(max(S^2 * inv^2 - 16k1 * k2 * sin(k / 2)^2 / (m1 * m2), 0))
    sqrt(max(0.5(S * inv - root), 0)), sqrt(0.5(S * inv + root))
end

N = 40; m1, m2, k1, k2 = 1.0, 2.0, 1.0, 1.0
masses = repeat([m1, m2], N); springs = repeat([k1, k2], N)
wn = sort(sqrt.(abs.(eigvals(Symmetric(chain_matrix(masses, springs))))))
wa = sort(vcat([collect(omega_di(2pi * p / N, m1, m2, k1, k2)) for p in 0:N-1]...))
@printf("Diatomic, %d cells: %d modes, max error = %.2e\\n", N, length(wn), maximum(abs.(wn .- wa)))
a, o = omega_di(pi, m1, m2, k1, k2)
@printf("Zone boundary: acoustic %.4f, optical %.4f, gap %.4f\\n", a, o, o - a)
Nb = 2000; w = [2abs(sin(pi * p / Nb)) for p in 1:Nb-1]
for T in (0.05, 0.2, 0.5, 1.0, 2.0, 5.0)
    x = w ./ T
    @printf("  T = %4.2f: C/Nk = %.4f\\n", T, sum(@. x^2 * exp(x) / expm1(x)^2) / length(x))
end
c = 2.99792458e10; amu = 1.66053906660e-27; wSi = 2pi * c * 520.2; mSi = 28.0855amu
@printf("Si effective spring = %.0f N/m\\n", mSi * wSi^2 / 4)
`;

// ── cpp/wk11_phonon_chain.cpp ─────────────────
export const CPP_PHON = `// Week 11 - 1D monatomic and diatomic chains: dispersion and phonon heat capacity
// Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
// Finite periodic chain eigenvalues are compared with the analytic dispersion.
// For a periodic chain the dynamical matrix is block-circulant, so each allowed
// k = 2 pi p / N gives a 2x2 (diatomic) Hermitian matrix that we solve directly,
// and we cross-check with a Jacobi diagonalisation of the full real matrix.
// Build: g++ -O2 -std=c++17 wk11_phonon_chain.cpp -o phonon
#include <cmath>
#include <cstdio>
#include <initializer_list>
#include <vector>
#include <algorithm>
const double PI = 3.14159265358979323846;
using Mat = std::vector<std::vector<double>>;
std::vector<double> jacobiEig(Mat A) {           // symmetric eigenvalues (cyclic Jacobi)
    int n = A.size();
    for (int sweep = 0; sweep < 100; ++sweep) {
        double off = 0;
        for (int p = 0; p < n; ++p) for (int q = p + 1; q < n; ++q) off += A[p][q] * A[p][q];
        if (off < 1e-22) break;
        for (int p = 0; p < n; ++p) for (int q = p + 1; q < n; ++q) {
            if (std::fabs(A[p][q]) < 1e-300) continue;
            double th = 0.5 * std::atan2(2 * A[p][q], A[q][q] - A[p][p]), c = std::cos(th), s = std::sin(th);
            for (int k = 0; k < n; ++k) { double akp = A[k][p], akq = A[k][q]; A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq; }
            for (int k = 0; k < n; ++k) { double apk = A[p][k], aqk = A[q][k]; A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk; }
        }
    }
    std::vector<double> e(n); for (int i = 0; i < n; ++i) e[i] = A[i][i];
    return e;
}
Mat chainMatrix(const std::vector<double>& m, const std::vector<double>& s) {
    int n = m.size(); Mat D(n, std::vector<double>(n, 0));
    for (int i = 0; i < n; ++i) { int j = (i + 1) % n; D[i][i] += s[i]; D[j][j] += s[i]; D[i][j] -= s[i]; D[j][i] -= s[i]; }
    for (int i = 0; i < n; ++i) for (int j = 0; j < n; ++j) D[i][j] /= std::sqrt(m[i] * m[j]);
    return D;
}
void omegaDi(double k, double m1, double m2, double k1, double k2, double& ac, double& op) {
    double S = k1 + k2, inv = 1 / m1 + 1 / m2, sn = std::sin(k / 2);
    double root = std::sqrt(std::fmax(S * S * inv * inv - 16 * k1 * k2 * sn * sn / (m1 * m2), 0));
    ac = std::sqrt(std::fmax(0.5 * (S * inv - root), 0)); op = std::sqrt(0.5 * (S * inv + root));
}
int main() {
    int N = 20; double m1 = 1, m2 = 2, k1 = 1, k2 = 1;
    std::vector<double> mm, ss;
    for (int i = 0; i < N; ++i) { mm.push_back(m1); mm.push_back(m2); ss.push_back(k1); ss.push_back(k2); }
    auto ev = jacobiEig(chainMatrix(mm, ss));
    std::vector<double> wn, wa;
    for (double e : ev) wn.push_back(std::sqrt(std::fabs(e)));
    for (int p = 0; p < N; ++p) { double ac, op; omegaDi(2 * PI * p / N, m1, m2, k1, k2, ac, op); wa.push_back(ac); wa.push_back(op); }
    std::sort(wn.begin(), wn.end()); std::sort(wa.begin(), wa.end());
    double err = 0; for (int i = 0; i < 2 * N; ++i) err = std::fmax(err, std::fabs(wn[i] - wa[i]));
    std::printf("Diatomic chain, %d cells: %zu modes, max |numeric - analytic| = %.2e\\n", N, wn.size(), err);
    double ac, op; omegaDi(PI, m1, m2, k1, k2, ac, op);
    std::printf("Zone boundary: acoustic %.4f, optical %.4f, gap %.4f\\n", ac, op, op - ac);
    // monatomic heat capacity (hbar = k = 1, kappa = m = a = 1)
    int Nb = 2000;
    for (double T : {0.05, 0.2, 0.5, 1.0, 2.0, 5.0}) {
        double C = 0;
        for (int p = 1; p < Nb; ++p) {
            double w = 2 * std::fabs(std::sin(PI * p / Nb)), x = w / T;
            C += (x < 1e-8) ? 1.0 : x * x * std::exp(x) / std::pow(std::expm1(x), 2);
        }
        std::printf("  T = %4.2f: C/Nk = %.4f\\n", T, C / (Nb - 1));
    }
    double c = 2.99792458e10, amu = 1.66053906660e-27, w = 2 * PI * c * 520.2, m = 28.0855 * amu;
    std::printf("Si effective spring = %.0f N/m\\n", m * w * w / 4);
    return 0;
}
`;
