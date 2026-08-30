/* ============================================================
   Week01Codes.js — Physical Chemistry 2, Week 1
   Raw code samples: Birth of Quantum Mechanics
   - 4 topics: planck_law, action_principle, helmholtz_modes, schrodinger_fdm
   - 4 languages: Python, MATLAB, Julia, C++
   Imported by Week01App.jsx > RawCodes tab.
   Auto-generated from codes/ — edit the standalone files, then regenerate.
   ============================================================ */

// ── python/wk01_planck_law.py ────────────────────
export const PY_PLANCK = `"""
Wk01 — Planck's law of blackbody radiation
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

Compares Rayleigh-Jeans / Wien / Planck spectral emissive power E_b,lambda(T),
then numerically verifies:
  (1) Wien's displacement law   : lambda_max * T = 2898 um*K
  (2) Stefan-Boltzmann law      : integral E_b,lambda dlambda = sigma * T^4

Run:  python wk01_planck_law.py     (needs numpy, matplotlib)
"""
import numpy as np
import matplotlib.pyplot as plt

trapz = getattr(np, "trapezoid", getattr(np, "trapz", None))  # numpy 1.x/2.x compat

# -- physical constants (SI) ---------------------------------
h  = 6.62607015e-34      # Planck constant [J s]
c  = 2.99792458e8        # speed of light [m/s]
kB = 1.380649e-23        # Boltzmann constant [J/K]
sigma = 5.670374419e-8   # Stefan-Boltzmann [W/m^2 K^4]
C1 = 2.0*np.pi*h*c**2    # first radiation constant (hemispherical)
C2 = h*c/kB              # second radiation constant

def planck(lam, T):          # spectral emissive power [W/m^2/m]
    return C1/lam**5/np.expm1(C2/(lam*T))

def rayleigh_jeans(lam, T):  # classical limit -> UV catastrophe
    return 2.0*np.pi*c*kB*T/lam**4

def wien_approx(lam, T):     # Wien's 1896 guess (short-lambda limit)
    return C1/lam**5*np.exp(-C2/(lam*T))

# -- 1) spectra at several temperatures ----------------------
lam = np.logspace(-7, -4.5, 800)          # 100 nm ... ~30 um
Ts  = [3000.0, 4000.0, 5000.0, 5800.0]

plt.figure(figsize=(11, 4.2))
plt.subplot(1, 2, 1)
for T in Ts:
    plt.plot(lam*1e6, planck(lam, T), label=f"Planck {T:.0f} K")
plt.plot(lam*1e6, rayleigh_jeans(lam, 5800.0), "k--",
         label="Rayleigh-Jeans 5800 K (diverges!)")
plt.plot(lam*1e6, wien_approx(lam, 5800.0), "k:", label="Wien approx 5800 K")
plt.ylim(0, 1.15*planck(lam, 5800.0).max()); plt.xlim(0, 3)
plt.xlabel("wavelength [um]"); plt.ylabel("E_b,lambda [W/m^2/m]")
plt.title("Blackbody spectra & UV catastrophe"); plt.legend(fontsize=8)

# -- 2) Wien's displacement law ------------------------------
print("T [K]   lambda_max [um]   lambda_max*T [um K]")
for T in Ts:
    lmax = lam[np.argmax(planck(lam, T))]
    print(f"{T:6.0f}  {lmax*1e6:14.4f}  {lmax*T*1e6:16.1f}")
print("Wien's law predicts lambda_max*T = 2898 um K\\n")

# -- 3) Stefan-Boltzmann by numerical integration ------------
print("T [K]   integral E dlambda      sigma*T^4        ratio")
lam_i = np.logspace(-8, -3, 40000)        # wide range for the integral
for T in Ts:
    E_tot = trapz(planck(lam_i, T), lam_i)
    print(f"{T:6.0f}  {E_tot:16.6e}  {sigma*T**4:14.6e}  {E_tot/(sigma*T**4):8.5f}")

# -- 4) Wien-law check plot: peak locus ----------------------
plt.subplot(1, 2, 2)
Tspan = np.linspace(1000, 8000, 60)
lmaxs = [lam[np.argmax(planck(lam, T))] for T in Tspan]
plt.plot(Tspan, np.array(lmaxs)*1e6, "b-", label="numerical peak")
plt.plot(Tspan, 2898.0/Tspan, "r--", label="2898/T (Wien)")
plt.xlabel("T [K]"); plt.ylabel("lambda_max [um]")
plt.title("Wien's displacement law"); plt.legend()
plt.tight_layout(); plt.show()
`;

// ── python/wk01_action_principle.py ──────────────
export const PY_ACTION = `"""
Wk01 — Least action principle (Lagrangian mechanics)
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

For the simple harmonic oscillator, L = (1/2) m qdot^2 - (1/2) m w^2 q^2.
The classical path between (0, 0) and (T, qT) is q_cl(t) = A sin(w t).
We perturb it as  q(t) = q_cl(t) + eps * sin(n pi t / T)   (endpoints fixed)
and show that the action S[q] is MINIMIZED at eps = 0 (when w T < pi).

Run:  python wk01_action_principle.py
"""
import numpy as np
import matplotlib.pyplot as plt

trapz = getattr(np, "trapezoid", getattr(np, "trapz", None))  # numpy 1.x/2.x compat

m, w = 1.0, 1.0
T, qT = 2.0, 1.0                    # w*T = 2 < pi  ->  true minimum
A = qT/np.sin(w*T)                  # classical amplitude
t = np.linspace(0.0, T, 2001)

def action(q):
    qdot = np.gradient(q, t)
    L = 0.5*m*qdot**2 - 0.5*m*w**2*q**2
    return trapz(L, t)

q_cl = A*np.sin(w*t)
S_cl = action(q_cl)
print(f"classical action  S_cl = {S_cl:.6f}")

# -- S(eps) parabolas for perturbation modes n = 1, 2, 3 -----
eps = np.linspace(-1.0, 1.0, 81)
plt.figure(figsize=(11, 4.2))
plt.subplot(1, 2, 2)
for n in (1, 2, 3):
    S = [action(q_cl + e*np.sin(n*np.pi*t/T)) for e in eps]
    plt.plot(eps, S, label=f"mode n={n}")
plt.axvline(0, color="k", lw=0.7)
plt.scatter([0], [S_cl], zorder=5, color="k", label="classical path")
plt.xlabel("perturbation eps"); plt.ylabel("action S[q]")
plt.title("S is minimized on the classical path"); plt.legend()

# -- family of paths ----------------------------------------
plt.subplot(1, 2, 1)
for e in np.linspace(-0.8, 0.8, 9):
    q = q_cl + e*np.sin(np.pi*t/T)
    plt.plot(t, q, color="0.7", lw=0.8)
plt.plot(t, q_cl, "r-", lw=2.2, label="classical path (Euler-Lagrange)")
plt.scatter([0, T], [0, qT], color="k", zorder=5)
plt.xlabel("t"); plt.ylabel("q(t)")
plt.title("Path family with fixed endpoints"); plt.legend()
plt.tight_layout(); plt.show()

# -- check Euler-Lagrange residual on the classical path -----
qdd = np.gradient(np.gradient(q_cl, t), t)
res = m*qdd + m*w**2*q_cl            # should vanish
print(f"max |E-L residual| on classical path (interior) = "
      f"{np.abs(res[50:-50]).max():.3e}")
`;

// ── python/wk01_helmholtz_modes.py ───────────────
export const PY_HELM = `"""
Wk01 — Helmholtz equation: standing-wave modes & mode counting
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) 2D membrane modes  f(x,y) = sin(nx pi x/Lx) sin(ny pi y/Ly)
    with Dirichlet BCs (fixed edges) — the eigenfunctions of nabla^2.
(2) 3D cavity mode counting N(w') vs. the smooth (pi/6) w'^3 law —
    the very counting that leads to Rayleigh-Jeans and Planck.

Run:  python wk01_helmholtz_modes.py
"""
import numpy as np
import matplotlib.pyplot as plt

# -- (1) 2D modes -------------------------------------------
Lx = Ly = 1.0
xs = np.linspace(0, Lx, 160); ys = np.linspace(0, Ly, 160)
X, Y = np.meshgrid(xs, ys)

fig, axes = plt.subplots(1, 4, figsize=(13, 3.1))
for ax, (nx, ny) in zip(axes, [(1, 1), (2, 1), (2, 2), (4, 2)]):
    Z = np.sin(nx*np.pi*X/Lx)*np.sin(ny*np.pi*Y/Ly)
    ax.contourf(X, Y, Z, 41, cmap="RdBu_r")
    w = np.pi*np.sqrt((nx/Lx)**2 + (ny/Ly)**2)   # c = 1
    ax.set_title(f"(nx,ny)=({nx},{ny}),  w={w:.2f}")
    ax.set_xticks([]); ax.set_yticks([])
plt.suptitle("Helmholtz modes on a square membrane (Dirichlet BC)")
plt.tight_layout()

# -- (2) 3D mode counting -----------------------------------
# normalized frequency w' = w L / (c pi):  mode (nx,ny,nz) has
# w' = sqrt(nx^2+ny^2+nz^2);  count N(w') = #{modes with w'_n <= w'}
wmax = 14.0
freqs = []
nmax = int(wmax) + 1
for nx in range(1, nmax+1):
    for ny in range(1, nmax+1):
        for nz in range(1, nmax+1):
            wp = np.hypot(np.hypot(nx, ny), nz)
            if wp <= wmax:
                freqs.append(wp)
freqs = np.sort(np.array(freqs))
N = np.arange(1, len(freqs)+1)

plt.figure(figsize=(6, 4.2))
plt.step(freqs, N, where="post", label="exact staircase N(w')")
ws = np.linspace(0, wmax, 300)
plt.plot(ws, np.pi/6*ws**3, "r--", label="(pi/6) w'^3  (octant sphere)")
plt.xlabel("normalized frequency w'"); plt.ylabel("N(w')")
plt.title("Cavity mode counting -> density of states g(nu) ~ nu^2")
plt.legend(); plt.tight_layout(); plt.show()

print("As w' grows, dN/dw' ~ (pi/2) w'^2  =>  g(nu) = 8 pi V nu^2 / c^3")
print("(x2 polarization) — the seed of the Rayleigh-Jeans law.")
`;

// ── python/wk01_schrodinger_fdm.py ───────────────
export const PY_SCHRO = `"""
Wk01 — 1D time-independent Schrodinger equation by FDM
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

Solves  -(1/2) psi'' + V(x) psi = E psi   on [0, L]   (hbar = m = 1)
with Dirichlet BCs, discretized by the central 2nd difference:
  psi''_i  ~  (psi_{i+1} - 2 psi_i + psi_{i-1}) / h^2
=> tridiagonal symmetric eigenvalue problem  H psi = E psi.

Same FDM machinery as CFD (Fluid Mechanics Wk11) — now the matrix
eigenvalues ARE the quantized energy levels ("Quantisierung als
Eigenwertproblem", Schrodinger 1926).

Run:  python wk01_schrodinger_fdm.py
"""
import numpy as np
import matplotlib.pyplot as plt

L, N = 1.0, 400
x = np.linspace(0, L, N+2)          # includes boundary points
h = x[1] - x[0]
xi = x[1:-1]                        # interior nodes

def solve(V):
    main = 1.0/h**2 + V             # 2*(1/(2h^2)) + V_i
    off  = -0.5/h**2*np.ones(N-1)
    Hmat = np.diag(main) + np.diag(off, 1) + np.diag(off, -1)
    E, psi = np.linalg.eigh(Hmat)
    psi /= np.sqrt(h)               # normalize: sum |psi|^2 h = 1
    return E, psi

cases = {
    "infinite well (V=0)":            np.zeros(N),
    "harmonic  V=0.5 k (x-L/2)^2":    0.5*8.0e4*(xi-L/2)**2,
    "finite well (V0=2000, w=0.4L)":  np.where(np.abs(xi-L/2) < 0.2*L, 0.0, 2000.0),
}

fig, axes = plt.subplots(1, 3, figsize=(13, 4))
for ax, (name, V) in zip(axes, cases.items()):
    E, psi = solve(V)
    for n in range(4):
        ax.plot(xi, 40*psi[:, n]*np.sign(psi[N//5, n] + 1e-12) + E[n],
                label=f"E{n+1}={E[n]:.1f}")
    if V.max() > 0:
        ax.plot(xi, V, "k--", lw=0.8, alpha=0.5)
        ax.set_ylim(0, 1.3*E[3])
    ax.set_title(name, fontsize=9); ax.set_xlabel("x"); ax.legend(fontsize=7)
axes[0].set_ylabel("energy  (psi offset by E_n)")
plt.suptitle("Quantization as an eigenvalue problem (FDM)")
plt.tight_layout()

# -- validation against analytic solutions -------------------
E_box, _ = solve(np.zeros(N))
print("infinite well:  E_n = n^2 pi^2 / 2   (hbar=m=1, L=1)")
print(" n   FDM          analytic     rel.err")
for n in range(1, 6):
    Ea = n**2*np.pi**2/2
    print(f"{n:2d}  {E_box[n-1]:11.5f}  {Ea:11.5f}  {abs(E_box[n-1]-Ea)/Ea:.2e}")

k = 8.0e4; w = np.sqrt(k)
E_h, _ = solve(0.5*k*(xi-L/2)**2)
print("\\nharmonic:  E_n = (n + 1/2) w,  w = sqrt(k) =", w)
for n in range(4):
    Ea = (n+0.5)*w
    print(f"{n:2d}  {E_h[n]:11.3f}  {Ea:11.3f}  {abs(E_h[n]-Ea)/Ea:.2e}")
plt.show()
`;

// ── matlab/wk01_planck_law.m ─────────────────────
export const ML_PLANCK = `% Wk01 - Planck's law of blackbody radiation
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% Rayleigh-Jeans / Wien / Planck spectra, Wien displacement, Stefan-Boltzmann.

h = 6.62607015e-34; c = 2.99792458e8; kB = 1.380649e-23;
sigma = 5.670374419e-8;
C1 = 2*pi*h*c^2;  C2 = h*c/kB;

planck = @(lam,T) C1./lam.^5 ./ (exp(C2./(lam*T)) - 1);
rj     = @(lam,T) 2*pi*c*kB*T ./ lam.^4;
wienap = @(lam,T) C1./lam.^5 .* exp(-C2./(lam*T));

lam = logspace(-7, -4.5, 800);
Ts  = [3000 4000 5000 5800];

figure(1); subplot(1,2,1); hold on;
for T = Ts, plot(lam*1e6, planck(lam,T), 'LineWidth', 1.5); end
plot(lam*1e6, rj(lam,5800), 'k--');
plot(lam*1e6, wienap(lam,5800), 'k:');
xlim([0 3]); ylim([0 1.15*max(planck(lam,5800))]);
xlabel('wavelength [\\mum]'); ylabel('E_{b\\lambda} [W/m^2/m]');
legend('3000 K','4000 K','5000 K','5800 K','R-J 5800 K','Wien 5800 K');
title('Blackbody spectra & UV catastrophe');

fprintf('T [K]   lambda_max [um]   lambda_max*T [um K]\\n');
for T = Ts
    [~, i] = max(planck(lam, T));
    fprintf('%6.0f  %14.4f  %16.1f\\n', T, lam(i)*1e6, lam(i)*T*1e6);
end
fprintf('Wien predicts lambda_max*T = 2898 um K\\n\\n');

lam_i = logspace(-8, -3, 40000);
fprintf('T [K]    integral            sigma*T^4        ratio\\n');
for T = Ts
    Etot = trapz(lam_i, planck(lam_i, T));
    fprintf('%6.0f  %16.6e  %14.6e  %8.5f\\n', T, Etot, sigma*T^4, Etot/(sigma*T^4));
end

subplot(1,2,2); Tspan = linspace(1000, 8000, 60); lmax = zeros(size(Tspan));
for k = 1:numel(Tspan)
    [~, i] = max(planck(lam, Tspan(k))); lmax(k) = lam(i);
end
plot(Tspan, lmax*1e6, 'b-', Tspan, 2898./Tspan, 'r--', 'LineWidth', 1.5);
xlabel('T [K]'); ylabel('\\lambda_{max} [\\mum]');
legend('numerical peak','2898/T (Wien)'); title("Wien's displacement law");
`;

// ── matlab/wk01_action_principle.m ───────────────
export const ML_ACTION = `% Wk01 - Least action principle (Lagrangian mechanics)
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% SHO paths q = q_cl + eps*sin(n*pi*t/T): S[q] is minimized at eps = 0.

m = 1; w = 1; T = 2; qT = 1;
A = qT/sin(w*T);
t = linspace(0, T, 2001);
q_cl = A*sin(w*t);

action = @(q) trapz(t, 0.5*m*gradient(q, t).^2 - 0.5*m*w^2*q.^2);
S_cl = action(q_cl);
fprintf('classical action S_cl = %.6f\\n', S_cl);

figure(1);
subplot(1,2,1); hold on;
for e = linspace(-0.8, 0.8, 9)
    plot(t, q_cl + e*sin(pi*t/T), 'Color', [0.7 0.7 0.7], 'LineWidth', 0.8);
end
plot(t, q_cl, 'r-', 'LineWidth', 2.2);
scatter([0 T], [0 qT], 40, 'k', 'filled');
xlabel('t'); ylabel('q(t)'); title('Path family (fixed endpoints)');

subplot(1,2,2); hold on;
eps = linspace(-1, 1, 81);
for n = 1:3
    S = arrayfun(@(e) action(q_cl + e*sin(n*pi*t/T)), eps);
    plot(eps, S, 'LineWidth', 1.5, 'DisplayName', sprintf('mode n=%d', n));
end
xline(0, 'k'); scatter(0, S_cl, 40, 'k', 'filled', 'DisplayName', 'classical');
xlabel('\\epsilon'); ylabel('S[q]'); legend;
title('Action is minimized on the classical path');
`;

// ── matlab/wk01_helmholtz_modes.m ────────────────
export const ML_HELM = `% Wk01 - Helmholtz modes & cavity mode counting
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU

Lx = 1; Ly = 1;
[X, Y] = meshgrid(linspace(0,Lx,160), linspace(0,Ly,160));
modes = [1 1; 2 1; 2 2; 4 2];

figure(1);
for k = 1:4
    nx = modes(k,1); ny = modes(k,2);
    subplot(1,4,k);
    contourf(X, Y, sin(nx*pi*X/Lx).*sin(ny*pi*Y/Ly), 41, 'LineStyle', 'none');
    colormap(flipud(redblue_like())); axis square off;
    w = pi*sqrt((nx/Lx)^2 + (ny/Ly)^2);
    title(sprintf('(%d,%d), w=%.2f', nx, ny, w));
end
sgtitle('Helmholtz modes on a square membrane');

% 3D cavity mode counting: w' = sqrt(nx^2+ny^2+nz^2) <= wmax
wmax = 14; freqs = [];
for nx = 1:wmax, for ny = 1:wmax, for nz = 1:wmax
    wp = sqrt(nx^2 + ny^2 + nz^2);
    if wp <= wmax, freqs(end+1) = wp; end %#ok<SAGROW>
end, end, end
freqs = sort(freqs); N = 1:numel(freqs);

figure(2); hold on;
stairs(freqs, N, 'b-', 'LineWidth', 1.2);
ws = linspace(0, wmax, 300);
plot(ws, pi/6*ws.^3, 'r--', 'LineWidth', 1.5);
xlabel("normalized frequency w'"); ylabel("N(w')");
legend('exact staircase', '(\\pi/6) w''^3'); 
title('Mode counting \\rightarrow g(\\nu) \\propto \\nu^2');

function cmap = redblue_like()
    n = 128; up = [linspace(0,1,n)' linspace(0,1,n)' ones(n,1)];
    dn = [ones(n,1) linspace(1,0,n)' linspace(1,0,n)'];
    cmap = [up; dn];
end
`;

// ── matlab/wk01_schrodinger_fdm.m ────────────────
export const ML_SCHRO = `% Wk01 - 1D time-independent Schrodinger equation by FDM
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% -(1/2) psi'' + V psi = E psi on [0,L], hbar = m = 1, Dirichlet BC.

L = 1; N = 400;
x = linspace(0, L, N+2); h = x(2) - x(1); xi = x(2:end-1)';

solveSE = @(V) deal_eigs(V, h, N);

cases = {
  'infinite well (V=0)',            zeros(N,1);
  'harmonic 0.5k(x-L/2)^2',         0.5*8e4*(xi-L/2).^2;
  'finite well (V0=2000, w=0.4L)',  2000*(abs(xi-L/2) >= 0.2*L);
};

figure(1);
for c = 1:3
    V = cases{c,2};
    [E, psi] = solveSE(V);
    subplot(1,3,c); hold on;
    for n = 1:4
        plot(xi, 40*psi(:,n)*sign(psi(round(N/5),n)+1e-12) + E(n), 'LineWidth', 1.3);
    end
    if max(V) > 0, plot(xi, V, 'k--'); ylim([0 1.3*E(4)]); end
    title(cases{c,1}, 'FontSize', 9); xlabel('x');
end
sgtitle('Quantization as an eigenvalue problem (FDM)');

[E_box, ~] = solveSE(zeros(N,1));
fprintf('infinite well: E_n = n^2 pi^2/2\\n n    FDM        analytic    rel.err\\n');
for n = 1:5
    Ea = n^2*pi^2/2;
    fprintf('%2d  %10.5f  %10.5f  %.2e\\n', n, E_box(n), Ea, abs(E_box(n)-Ea)/Ea);
end

function [E, psi] = deal_eigs(V, h, N)
    Hmat = diag(1/h^2 + V) + diag(-0.5/h^2*ones(N-1,1), 1) ...
                            + diag(-0.5/h^2*ones(N-1,1), -1);
    [psi, D] = eig(Hmat, 'vector');
    [E, i] = sort(D); psi = psi(:, i)/sqrt(h);
end
`;

// ── julia/wk01_planck_law.jl ─────────────────────
export const JL_PLANCK = `# Wk01 - Planck's law of blackbody radiation
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
# using Pkg; Pkg.add(["Plots"])
using Plots, Printf

const h  = 6.62607015e-34;  const c  = 2.99792458e8
const kB = 1.380649e-23;    const σSB = 5.670374419e-8
const C1 = 2π*h*c^2;        const C2 = h*c/kB

planck(λ, T) = C1/λ^5 / expm1(C2/(λ*T))
rj(λ, T)     = 2π*c*kB*T / λ^4
wienap(λ, T) = C1/λ^5 * exp(-C2/(λ*T))

λ  = exp10.(range(-7, -4.5, length=800))
Ts = [3000.0, 4000.0, 5000.0, 5800.0]

p1 = plot(xlim=(0,3), xlabel="wavelength [um]", ylabel="E_bλ [W/m^2/m]",
          title="Blackbody spectra & UV catastrophe")
for T in Ts;  plot!(p1, λ*1e6, planck.(λ, T), label="Planck $(Int(T)) K");  end
plot!(p1, λ*1e6, rj.(λ, 5800.0), ls=:dash, c=:black, label="R-J 5800 K")
plot!(p1, λ*1e6, wienap.(λ, 5800.0), ls=:dot, c=:black, label="Wien 5800 K")
ylims!(p1, 0, 1.15*maximum(planck.(λ, 5800.0)))

@printf("T [K]   lambda_max [um]   lambda_max*T [um K]\\n")
for T in Ts
    lmax = λ[argmax(planck.(λ, T))]
    @printf("%6.0f  %14.4f  %16.1f\\n", T, lmax*1e6, lmax*T*1e6)
end
println("Wien predicts lambda_max*T = 2898 um K\\n")

λi = exp10.(range(-8, -3, length=40000))
trapz(x, y) = sum(0.5 .* (y[1:end-1] .+ y[2:end]) .* diff(x))
@printf("T [K]    integral            sigma*T^4        ratio\\n")
for T in Ts
    Etot = trapz(λi, planck.(λi, T))
    @printf("%6.0f  %16.6e  %14.6e  %8.5f\\n", T, Etot, σSB*T^4, Etot/(σSB*T^4))
end

Tspan = range(1000, 8000, length=60)
lmaxs = [λ[argmax(planck.(λ, T))] for T in Tspan]
p2 = plot(Tspan, lmaxs.*1e6, label="numerical peak",
          xlabel="T [K]", ylabel="lambda_max [um]", title="Wien's displacement law")
plot!(p2, Tspan, 2898.0 ./ Tspan, ls=:dash, c=:red, label="2898/T")
display(plot(p1, p2, layout=(1,2), size=(1100,420)))
readline()
`;

// ── julia/wk01_action_principle.jl ───────────────
export const JL_ACTION = `# Wk01 - Least action principle (Lagrangian mechanics)
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
using Plots, Printf

m, ω, T, qT = 1.0, 1.0, 2.0, 1.0
A = qT/sin(ω*T)
t = range(0, T, length=2001);  dt = step(t)
q_cl = A .* sin.(ω .* t)

grad(y) = [ (y[2]-y[1])/dt; (y[3:end].-y[1:end-2])./(2dt); (y[end]-y[end-1])/dt ]
trapz(y) = dt*(sum(y) - 0.5*(y[1]+y[end]))
action(q) = trapz(0.5m .* grad(q).^2 .- 0.5m*ω^2 .* q.^2)

S_cl = action(q_cl)
@printf("classical action S_cl = %.6f\\n", S_cl)

p1 = plot(xlabel="t", ylabel="q(t)", title="Path family (fixed endpoints)", legend=false)
for e in range(-0.8, 0.8, length=9)
    plot!(p1, t, q_cl .+ e .* sin.(π .* t ./ T), c=:gray, lw=0.8)
end
plot!(p1, t, q_cl, c=:red, lw=2.2)
scatter!(p1, [0, T], [0, qT], c=:black)

p2 = plot(xlabel="ε", ylabel="S[q]", title="S minimized on classical path")
eps = range(-1, 1, length=81)
for n in 1:3
    S = [action(q_cl .+ e .* sin.(n*π .* t ./ T)) for e in eps]
    plot!(p2, eps, S, lw=1.5, label="mode n=$n")
end
scatter!(p2, [0.0], [S_cl], c=:black, label="classical")
display(plot(p1, p2, layout=(1,2), size=(1100,420)))
readline()
`;

// ── julia/wk01_helmholtz_modes.jl ────────────────
export const JL_HELM = `# Wk01 - Helmholtz modes & cavity mode counting
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
using Plots, Printf

Lx = Ly = 1.0
xs = range(0, Lx, length=160); ys = range(0, Ly, length=160)
modes = [(1,1), (2,1), (2,2), (4,2)]

ps = []
for (nx, ny) in modes
    Z = [sin(nx*π*x/Lx)*sin(ny*π*y/Ly) for y in ys, x in xs]
    ω = π*sqrt((nx/Lx)^2 + (ny/Ly)^2)
    push!(ps, heatmap(xs, ys, Z, c=:RdBu, clim=(-1,1), aspect_ratio=1,
                      title=@sprintf("(%d,%d), w=%.2f", nx, ny, ω),
                      colorbar=false, axis=false))
end
p_modes = plot(ps..., layout=(1,4), size=(1200,300))

# 3D cavity mode counting
wmax = 14.0
freqs = Float64[]
for nx in 1:15, ny in 1:15, nz in 1:15
    wp = sqrt(nx^2 + ny^2 + nz^2)
    wp <= wmax && push!(freqs, wp)
end
sort!(freqs);  N = 1:length(freqs)

p_count = plot(freqs, N, seriestype=:steppost, label="exact staircase N(w')",
               xlabel="normalized frequency w'", ylabel="N(w')",
               title="Mode counting -> g(ν) ~ ν²")
ws = range(0, wmax, length=300)
plot!(p_count, ws, π/6 .* ws.^3, ls=:dash, c=:red, label="(π/6) w'³")
display(plot(p_modes, p_count, layout=@layout([a; b]), size=(1200,750)))
println("dN/dw' ~ (π/2) w'^2  =>  g(ν) = 8πV ν²/c³ (x2 polarization)")
readline()
`;

// ── julia/wk01_schrodinger_fdm.jl ────────────────
export const JL_SCHRO = `# Wk01 - 1D time-independent Schrodinger equation by FDM
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
# -(1/2) psi'' + V psi = E psi on [0,L], hbar = m = 1, Dirichlet BC.
using LinearAlgebra, Plots, Printf

L, N = 1.0, 400
x = range(0, L, length=N+2);  h = step(x);  xi = collect(x[2:end-1])

function solveSE(V)
    Hmat = SymTridiagonal(1/h^2 .+ V, fill(-0.5/h^2, N-1))
    F = eigen(Hmat)
    return F.values, F.vectors ./ sqrt(h)
end

cases = [
    ("infinite well (V=0)",           zeros(N)),
    ("harmonic 0.5k(x-L/2)^2",        0.5*8e4 .* (xi .- L/2).^2),
    ("finite well (V0=2000, w=0.4L)", [abs(xx-L/2) < 0.2L ? 0.0 : 2000.0 for xx in xi]),
]

ps = []
for (name, V) in cases
    E, ψ = solveSE(V)
    p = plot(title=name, xlabel="x", titlefontsize=9, legend=:topright)
    for n in 1:4
        s = sign(ψ[div(N,5), n] + 1e-12)
        plot!(p, xi, 40 .* ψ[:, n] .* s .+ E[n], lw=1.3,
              label=@sprintf("E%d=%.1f", n, E[n]))
    end
    if maximum(V) > 0
        plot!(p, xi, V, ls=:dash, c=:black, lw=0.8, label="V(x)")
        ylims!(p, 0, 1.3*E[4])
    end
    push!(ps, p)
end
display(plot(ps..., layout=(1,3), size=(1300,420),
             plot_title="Quantization as an eigenvalue problem (FDM)"))

E_box, _ = solveSE(zeros(N))
println("infinite well: E_n = n² π²/2")
for n in 1:5
    Ea = n^2*π^2/2
    @printf("%2d  %10.5f  %10.5f  %.2e\\n", n, E_box[n], Ea, abs(E_box[n]-Ea)/Ea)
end
readline()
`;

// ── cpp/wk01_planck_law.cpp ──────────────────────
export const CPP_PLANCK = `// Wk01 - Planck's law of blackbody radiation
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build:  g++ -O2 -std=c++17 wk01_planck_law.cpp -o wk01_planck_law
// Output: stdout tables + planck_spectra.csv (plot with Excel/gnuplot)
#include <cmath>
#include <cstdio>
#include <vector>

const double h = 6.62607015e-34, c = 2.99792458e8, kB = 1.380649e-23;
const double sigma = 5.670374419e-8;
const double C1 = 2.0*M_PI*h*c*c, C2 = h*c/kB;

double planck(double lam, double T) { return C1/std::pow(lam,5)/std::expm1(C2/(lam*T)); }
double rj(double lam, double T)     { return 2.0*M_PI*c*kB*T/std::pow(lam,4); }

int main() {
    std::vector<double> Ts = {3000, 4000, 5000, 5800};

    // spectra to CSV
    FILE* f = std::fopen("planck_spectra.csv", "w");
    std::fprintf(f, "lambda_um,RJ_5800");
    for (double T : Ts) std::fprintf(f, ",Planck_%.0fK", T);
    std::fprintf(f, "\\n");
    for (int i = 0; i <= 800; ++i) {
        double lam = std::pow(10.0, -7.0 + 2.5*i/800.0);
        std::fprintf(f, "%.6e,%.6e", lam*1e6, rj(lam, 5800));
        for (double T : Ts) std::fprintf(f, ",%.6e", planck(lam, T));
        std::fprintf(f, "\\n");
    }
    std::fclose(f);
    std::printf("wrote planck_spectra.csv\\n\\n");

    // Wien's displacement law
    std::printf("T [K]   lambda_max [um]   lambda_max*T [um K]\\n");
    for (double T : Ts) {
        double best = 0, lmax = 0;
        for (int i = 0; i <= 20000; ++i) {
            double lam = std::pow(10.0, -7.0 + 2.5*i/20000.0);
            double E = planck(lam, T);
            if (E > best) { best = E; lmax = lam; }
        }
        std::printf("%6.0f  %14.4f  %16.1f\\n", T, lmax*1e6, lmax*T*1e6);
    }
    std::printf("Wien predicts lambda_max*T = 2898 um K\\n\\n");

    // Stefan-Boltzmann by trapezoid on log grid
    std::printf("T [K]    integral            sigma*T^4        ratio\\n");
    for (double T : Ts) {
        const int N = 200000;
        double S = 0, lp = std::pow(10.0, -8.0), Ep = planck(lp, T);
        for (int i = 1; i <= N; ++i) {
            double lam = std::pow(10.0, -8.0 + 5.0*i/N);
            double E = planck(lam, T);
            S += 0.5*(E + Ep)*(lam - lp);
            lp = lam; Ep = E;
        }
        std::printf("%6.0f  %16.6e  %14.6e  %8.5f\\n", T, S, sigma*std::pow(T,4), S/(sigma*std::pow(T,4)));
    }
    return 0;
}
`;

// ── cpp/wk01_action_principle.cpp ────────────────
export const CPP_ACTION = `// Wk01 - Least action principle (Lagrangian mechanics)
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build:  g++ -O2 -std=c++17 wk01_action_principle.cpp -o wk01_action_principle
// SHO: q(t) = q_cl(t) + eps*sin(n*pi*t/T)  ->  S(eps) minimized at eps = 0.
#include <cmath>
#include <cstdio>
#include <vector>

int main() {
    const double m = 1, w = 1, T = 2, qT = 1;
    const double A = qT/std::sin(w*T);
    const int Nt = 2000;
    const double dt = T/Nt;

    auto action = [&](double eps, int n) {
        double S = 0;
        for (int i = 0; i < Nt; ++i) {
            double t0 = i*dt, t1 = (i+1)*dt, tm = 0.5*(t0+t1);
            auto q = [&](double t){ return A*std::sin(w*t) + eps*std::sin(n*M_PI*t/T); };
            double qd = (q(t1) - q(t0))/dt;               // midpoint rule
            double qm = q(tm);
            S += (0.5*m*qd*qd - 0.5*m*w*w*qm*qm)*dt;
        }
        return S;
    };

    std::printf("classical action S_cl = %.6f\\n\\n", action(0.0, 1));
    std::printf("%8s  %12s  %12s  %12s\\n", "eps", "S(n=1)", "S(n=2)", "S(n=3)");
    FILE* f = std::fopen("action_vs_eps.csv", "w");
    std::fprintf(f, "eps,S_n1,S_n2,S_n3\\n");
    for (int k = 0; k <= 40; ++k) {
        double eps = -1.0 + 2.0*k/40;
        double s1 = action(eps,1), s2 = action(eps,2), s3 = action(eps,3);
        std::fprintf(f, "%.4f,%.8f,%.8f,%.8f\\n", eps, s1, s2, s3);
        if (k % 5 == 0)
            std::printf("%8.3f  %12.6f  %12.6f  %12.6f\\n", eps, s1, s2, s3);
    }
    std::fclose(f);
    std::printf("\\nwrote action_vs_eps.csv — S(eps) is a parabola with min at eps=0\\n");
    return 0;
}
`;

// ── cpp/wk01_helmholtz_modes.cpp ─────────────────
export const CPP_HELM = `// Wk01 - Helmholtz modes & cavity mode counting
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk01_helmholtz_modes.cpp -o wk01_helmholtz_modes
// Output: mode_XX.pgm images (view: gimp/feh) + mode_counting.csv
#include <cmath>
#include <cstdio>
#include <vector>
#include <algorithm>

void write_mode_pgm(int nx, int ny) {
    const int W = 320, H = 320;
    char name[64];
    std::snprintf(name, 64, "mode_%d%d.pgm", nx, ny);
    FILE* f = std::fopen(name, "w");
    std::fprintf(f, "P2\\n%d %d\\n255\\n", W, H);
    for (int j = 0; j < H; ++j) {
        for (int i = 0; i < W; ++i) {
            double x = double(i)/(W-1), y = double(j)/(H-1);
            double v = std::sin(nx*M_PI*x)*std::sin(ny*M_PI*y);   // in [-1,1]
            std::fprintf(f, "%d ", int(127.5*(v+1.0)));
        }
        std::fprintf(f, "\\n");
    }
    std::fclose(f);
    std::printf("wrote %s  (w = %.3f, c=1, L=1)\\n", name,
                M_PI*std::sqrt(double(nx*nx + ny*ny)));
}

int main() {
    // (1) 2D membrane modes -> PGM heatmaps
    int modes[4][2] = {{1,1},{2,1},{2,2},{4,2}};
    for (auto& m : modes) write_mode_pgm(m[0], m[1]);

    // (2) 3D cavity mode counting: w' = sqrt(nx^2+ny^2+nz^2)
    const double wmax = 14.0;
    std::vector<double> freqs;
    for (int nx = 1; nx <= 15; ++nx)
        for (int ny = 1; ny <= 15; ++ny)
            for (int nz = 1; nz <= 15; ++nz) {
                double wp = std::sqrt(double(nx*nx + ny*ny + nz*nz));
                if (wp <= wmax) freqs.push_back(wp);
            }
    std::sort(freqs.begin(), freqs.end());

    FILE* f = std::fopen("mode_counting.csv", "w");
    std::fprintf(f, "w_prime,N_exact,N_smooth\\n");
    for (size_t i = 0; i < freqs.size(); ++i)
        std::fprintf(f, "%.5f,%zu,%.3f\\n", freqs[i], i+1,
                     M_PI/6.0*std::pow(freqs[i], 3));
    std::fclose(f);
    std::printf("wrote mode_counting.csv  (N ~ (pi/6) w'^3 => g(nu) ~ nu^2)\\n");
    return 0;
}
`;

// ── cpp/wk01_schrodinger_fdm.cpp ─────────────────
export const CPP_SCHRO = `// Wk01 - 1D time-independent Schrodinger equation by FDM
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk01_schrodinger_fdm.cpp -o wk01_schrodinger_fdm
// -(1/2) psi'' + V psi = E psi, hbar=m=1, Dirichlet BC.
// Symmetric tridiagonal eigenproblem solved by cyclic Jacobi rotations.
#include <cmath>
#include <cstdio>
#include <vector>
#include <algorithm>

using Mat = std::vector<std::vector<double>>;

// cyclic Jacobi for dense symmetric NxN (fine for N ~ 200)
void jacobi_eig(Mat& A, Mat& V, std::vector<double>& d) {
    int n = A.size();
    V.assign(n, std::vector<double>(n, 0.0));
    for (int i = 0; i < n; ++i) V[i][i] = 1.0;
    for (int sweep = 0; sweep < 60; ++sweep) {
        double off = 0;
        for (int p = 0; p < n; ++p)
            for (int q = p+1; q < n; ++q) off += A[p][q]*A[p][q];
        if (off < 1e-20) break;
        for (int p = 0; p < n; ++p)
            for (int q = p+1; q < n; ++q) {
                if (std::fabs(A[p][q]) < 1e-15) continue;
                double th = 0.5*(A[q][q]-A[p][p])/A[p][q];
                double t = (th >= 0 ? 1.0 : -1.0)/(std::fabs(th)+std::sqrt(th*th+1));
                double cph = 1.0/std::sqrt(t*t+1), s = t*cph;
                for (int k = 0; k < n; ++k) {
                    double akp = A[k][p], akq = A[k][q];
                    A[k][p] = cph*akp - s*akq;  A[k][q] = s*akp + cph*akq;
                }
                for (int k = 0; k < n; ++k) {
                    double apk = A[p][k], aqk = A[q][k];
                    A[p][k] = cph*apk - s*aqk;  A[q][k] = s*apk + cph*aqk;
                }
                for (int k = 0; k < n; ++k) {
                    double vkp = V[k][p], vkq = V[k][q];
                    V[k][p] = cph*vkp - s*vkq;  V[k][q] = s*vkp + cph*vkq;
                }
            }
    }
    d.resize(n);
    for (int i = 0; i < n; ++i) d[i] = A[i][i];
}

int main() {
    const double L = 1.0; const int N = 200;
    const double hh = L/(N+1);
    std::vector<double> xi(N);
    for (int i = 0; i < N; ++i) xi[i] = (i+1)*hh;

    auto solve = [&](const std::vector<double>& Vpot, const char* name,
                     std::vector<double>& Eout) {
        Mat A(N, std::vector<double>(N, 0.0)), Vec;
        for (int i = 0; i < N; ++i) {
            A[i][i] = 1.0/(hh*hh) + Vpot[i];
            if (i+1 < N) A[i][i+1] = A[i+1][i] = -0.5/(hh*hh);
        }
        std::vector<double> d;
        jacobi_eig(A, Vec, d);
        std::vector<int> idx(N); for (int i = 0; i < N; ++i) idx[i] = i;
        std::sort(idx.begin(), idx.end(), [&](int a, int b){ return d[a] < d[b]; });
        std::printf("%s : lowest 5 eigenvalues:\\n", name);
        Eout.clear();
        for (int n = 0; n < 5; ++n) { Eout.push_back(d[idx[n]]); std::printf("  E%d = %.5f\\n", n+1, d[idx[n]]); }
    };

    std::vector<double> E;
    std::vector<double> V0(N, 0.0);
    solve(V0, "infinite well (V=0)", E);
    std::printf("analytic E_n = n^2 pi^2/2 : ");
    for (int n = 1; n <= 5; ++n) std::printf("%.5f ", n*n*M_PI*M_PI/2);
    std::printf("\\n\\n");

    std::vector<double> Vh(N);
    for (int i = 0; i < N; ++i) Vh[i] = 0.5*8e4*std::pow(xi[i]-L/2, 2);
    solve(Vh, "harmonic (k=8e4)", E);
    double w = std::sqrt(8e4);
    std::printf("analytic E_n = (n+1/2) w : ");
    for (int n = 0; n < 5; ++n) std::printf("%.3f ", (n+0.5)*w);
    std::printf("\\n");
    return 0;
}
`;
