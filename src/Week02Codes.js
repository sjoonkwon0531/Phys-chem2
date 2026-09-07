/* ============================================================
   Week02Codes.js — Physical Chemistry 2, Week 2
   Raw code samples: Wave Mechanics & Matrix Mechanics
   - 4 topics: wave_packet, step_tunneling, box_superposition, matrix_mechanics
   - 4 languages: Python, MATLAB, Julia, C++
   Imported by Week02App.jsx > RawCodes tab.
   Auto-generated from codes/ — edit the standalone files, then regenerate.
   ============================================================ */

// ── python/wk02_wave_packet.py ───────────────────
export const PY_PACKET = `"""
Wk02 — Gaussian wave packet: minimum uncertainty & dispersion
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

psi(x) = (1/2 pi eps)^{1/4} exp(-x^2/4eps + i p0 x / hbar)
 -> |psi(x)|^2 Gaussian with sigma_x = sqrt(eps)
 -> |phi(p)|^2 Gaussian with sigma_p = hbar/(2 sqrt(eps))
 -> sigma_x sigma_p = hbar/2  (minimum uncertainty packet!)
Free-particle time evolution disperses the packet:
 sigma_x(t)^2 = eps + hbar^2 t^2 / (4 m^2 eps)   (sigma_p stays constant)

Run:  python wk02_wave_packet.py     (hbar = m = 1 units)
"""
import numpy as np
import matplotlib.pyplot as plt

trapz = getattr(np, "trapezoid", getattr(np, "trapz", None))  # numpy 1.x/2.x compat

hbar, m = 1.0, 1.0
p0 = 2.0

def psi_x(x, eps):
    return (1/(2*np.pi*eps))**0.25 * np.exp(-x**2/(4*eps) + 1j*p0*x/hbar)

def phi_p(p, eps):          # Fourier transform (analytic)
    return (2*eps/(np.pi*hbar**2))**0.25 * np.exp(-eps*(p-p0)**2/hbar**2)

# -- 1) verify sigma_x * sigma_p = hbar/2 numerically --------
x = np.linspace(-30, 30, 20001)
p = np.linspace(-10, 14, 20001)
print("eps    sigma_x     sigma_p     product/hbar")
for eps in (0.5, 1.0, 2.0, 3.0):
    Px = np.abs(psi_x(x, eps))**2
    Pp = np.abs(phi_p(p, eps))**2
    sx = np.sqrt(trapz(x**2*Px, x) - trapz(x*Px, x)**2)
    sp = np.sqrt(trapz(p**2*Pp, p) - trapz(p*Pp, p)**2)
    print(f"{eps:4.1f}  {sx:9.5f}  {sp:9.5f}  {sx*sp/hbar:11.5f}")
print("-> minimum uncertainty: sigma_x sigma_p = hbar/2 for every eps\\n")

# -- 2) dispersion of the packet -----------------------------
eps = 1.0
def sigma_x_t(t):
    return np.sqrt(eps + (hbar*t)**2/(4*m**2*eps))

plt.figure(figsize=(11, 4.2))
plt.subplot(1, 2, 1)
xs = np.linspace(-8, 28, 800)
for t in (0.0, 3.0, 6.0):
    s2 = eps + (hbar*t)**2/(4*m**2*eps)
    xc = p0*t/m                                   # packet center drifts at v = p0/m
    P = 1/np.sqrt(2*np.pi*s2) * np.exp(-(xs-xc)**2/(2*s2))
    plt.plot(xs, P, label=f"t = {t:.0f},  sigma_x = {np.sqrt(s2):.2f}")
plt.xlabel("x"); plt.ylabel("|Psi(x,t)|^2")
plt.title("Free-packet dispersion (center moves at p0/m)")
plt.legend(fontsize=8)

plt.subplot(1, 2, 2)
ts = np.linspace(0, 10, 300)
plt.plot(ts, sigma_x_t(ts), "b-", label="sigma_x(t)")
plt.plot(ts, np.full_like(ts, hbar/(2*np.sqrt(eps))), "r--", label="sigma_p (constant)")
plt.plot(ts, hbar*ts/(2*m*np.sqrt(eps)), "k:", label="asymptote hbar t / 2 m sqrt(eps)")
plt.xlabel("t"); plt.legend(); plt.title("Position uncertainty grows with time")
plt.tight_layout(); plt.show()

# electron localized to 0.1 nm: how fast does it spread? (SI aside)
hbar_SI, me = 1.054571817e-34, 9.1093837015e-31
eps_SI = (1e-10)**2
t2 = 2*np.sqrt(3)*me*eps_SI/hbar_SI               # time to double sigma_x
print(f"electron packet with sigma_x = 0.1 nm doubles its width in {t2:.2e} s (~0.3 fs)")
`;

// ── python/wk02_step_tunneling.py ────────────────
export const PY_TUNNEL = `"""
Wk02 — Step potential & quantum tunneling
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Step (E > V0):  R = ((k1-k2)/(k1+k2))^2,  T = 4 k1 k2/(k1+k2)^2,  R+T = 1
    Step (E < V0):  total reflection R = 1, evanescent tail exp(-kappa x)
(2) Barrier of height V0, width w (= 2a in the lecture):
    T = 1 / (1 + V0^2 sinh^2(kappa w) / (4 E (V0-E)))
    ~ 16 (E/V0)(1-E/V0) exp(-2 kappa w)    for kappa w >> 1
Real-unit checks reproduce the lecture examples (FET / STM).

Run:  python wk02_step_tunneling.py
"""
import numpy as np
import matplotlib.pyplot as plt

# -- real-unit constants (electron, eV, nm) ------------------
HBARC = 197.3269804          # eV nm
MC2   = 0.51099895e6         # eV (electron)
def kappa_nm(dE_eV):         # sqrt(2m dE)/hbar in nm^-1
    return np.sqrt(2*MC2*dE_eV)/HBARC
def k_nm(E_eV):
    return np.sqrt(2*MC2*E_eV)/HBARC

# -- (1) step potential --------------------------------------
def step_RT(E, V0):
    if E <= V0:
        return 1.0, 0.0
    k1, k2 = np.sqrt(E), np.sqrt(E - V0)          # common factor cancels
    R = ((k1-k2)/(k1+k2))**2
    T = 4*k1*k2/(k1+k2)**2
    return R, T

print("E/V0    R        T        R+T")
for r in (1.2, 1.5, 2.0, 4.0):
    R, T = step_RT(r, 1.0)
    print(f"{r:4.1f}  {R:.5f}  {T:.5f}  {R+T:.5f}")
print()

# -- (2) barrier tunneling -----------------------------------
def T_exact(E, V0, w_nm):
    kap = kappa_nm(V0 - E)
    s = np.sinh(kap*w_nm)
    return 1.0/(1.0 + V0**2*s**2/(4*E*(V0-E)))

def T_approx(E, V0, w_nm):
    kap = kappa_nm(V0 - E)
    return 16*E*(V0-E)/V0**2*np.exp(-2*kap*w_nm)

# lecture example 1 (FET): E = 6 eV, V0 = 12 eV, w = 0.18 nm
kap = kappa_nm(6.0)
print(f"FET:  kappa = {kap:.2f} nm^-1 (lecture: 12.6),  "
      f"T = {T_exact(6, 12, 0.18):.4f} (lecture: 0.044)")
# lecture example 2 (STM-like): V0 = 5 eV, E = 2 eV
print(f"STM:  T(w=1.0 nm) = {T_exact(2, 5, 1.0):.2e} (lecture: ~7e-8)")
print(f"      T(w=0.5 nm) = {T_exact(2, 5, 0.5):.2e} (lecture: ~5e-4)\\n")

plt.figure(figsize=(12, 4))
# T vs E/V0 for the step
plt.subplot(1, 3, 1)
rr = np.linspace(1.0001, 7, 400)
RT = np.array([step_RT(r, 1.0) for r in rr])
plt.plot(rr, RT[:, 1], "b-", label="T")
plt.plot(rr, RT[:, 0], "r-", label="R")
plt.axhline(1, color="k", lw=0.6, ls="--")
plt.xlabel("E / V0"); plt.title("Step: R & T (E > V0)"); plt.legend()

# T vs E/V0 for the barrier
plt.subplot(1, 3, 2)
EE = np.linspace(0.02, 0.98, 300)*5.0
plt.plot(EE/5.0, [T_exact(E, 5.0, 0.4) for E in EE], "b-", label="exact")
plt.plot(EE/5.0, [T_approx(E, 5.0, 0.4) for E in EE], "r--", label="thick-barrier approx")
plt.yscale("log"); plt.xlabel("E / V0"); plt.title("Barrier: T (V0=5 eV, w=0.4 nm)")
plt.legend(fontsize=8)

# T vs width -> STM principle (exponential sensitivity)
plt.subplot(1, 3, 3)
ww = np.linspace(0.1, 1.2, 300)
plt.semilogy(ww, [T_exact(2, 5, w) for w in ww], "b-")
plt.xlabel("barrier width w [nm]"); plt.title("T(w): why STM resolves 0.01 nm")
plt.tight_layout(); plt.show()

dT = T_exact(2, 5, 0.50)/T_exact(2, 5, 0.51)
print(f"STM sensitivity: shrinking w by 0.01 nm multiplies T by {dT:.2f}")
`;

// ── python/wk02_box_superposition.py ─────────────
export const PY_BOX = `"""
Wk02 — Particle in a box: basis expansion, measurement & dynamics
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Expand f(x) = sqrt(30/L^5) x (x-L) in box eigenstates |n>:
      c_n = <n|f> = -8 sqrt(15) / (n^3 pi^3)   (odd n only)
    -> sum |c_n|^2 = 1 (Parseval), and the 'measured' mean energy
      <E> = sum |c_n|^2 E_n = 5 hbar^2 / (m L^2)
(2) Superposition dynamics: Psi = (2|1> + |2>)/sqrt(5)
    |Psi(x,t)|^2 oscillates ("sloshes") at omega_21 = (E2-E1)/hbar,
    while a single stationary state |n> gives a time-independent density.

Run:  python wk02_box_superposition.py   (hbar = m = L = 1)
"""
import numpy as np
import matplotlib.pyplot as plt

trapz = getattr(np, "trapezoid", getattr(np, "trapz", None))  # numpy 1.x/2.x compat

L = 1.0
x = np.linspace(0, L, 4001)
psi = lambda n: np.sqrt(2/L)*np.sin(n*np.pi*x/L)
E   = lambda n: n**2*np.pi**2/2                      # hbar = m = 1

# -- (1) basis expansion of f(x) -----------------------------
f = np.sqrt(30/L**5)*x*(x - L)          # lecture convention (negative in the well)
print("check normalization of f:", f"{trapz(f**2, x):.6f}")

N = 15
c = np.array([trapz(psi(n)*f, x) for n in range(1, N+1)])
print("\\n n     c_n (numeric)   c_n (analytic)    |c_n|^2")
for n in range(1, 8):
    ca = -8*np.sqrt(15)/(n**3*np.pi**3) if n % 2 == 1 else 0.0
    print(f"{n:2d}  {c[n-1]:14.6f}  {ca:14.6f}  {c[n-1]**2:10.6f}")

print(f"\\nParseval:  sum |c_n|^2      = {np.sum(c**2):.6f}  (-> 1)")
Emean = np.sum(c**2*np.array([E(n) for n in range(1, N+1)]))
print(f"mean energy sum |c_n|^2 E_n = {Emean:.5f}  (analytic 5 hbar^2/mL^2 = 5)")
print("single measurement returns ONE eigenvalue E_n with probability |c_n|^2\\n")

plt.figure(figsize=(12, 4))
plt.subplot(1, 3, 1)
plt.plot(x, f, "k-", lw=2, label="f(x)")
for Np in (1, 3, 5):
    g = sum(c[n-1]*psi(n) for n in range(1, Np+1))
    plt.plot(x, g, "--", label=f"partial sum N={Np}")
plt.legend(fontsize=8); plt.title("Basis-function expansion")

plt.subplot(1, 3, 2)
plt.bar(range(1, N+1), c**2)
plt.yscale("log"); plt.ylim(1e-8, 2)
plt.xlabel("n"); plt.title("measurement probabilities |c_n|^2")

# -- (2) superposition dynamics ------------------------------
c1, c2 = 2/np.sqrt(5), 1/np.sqrt(5)
w21 = E(2) - E(1)
Tp = 2*np.pi/w21
print(f"beat period T = 2 pi hbar/(E2-E1) = {Tp:.4f}")
plt.subplot(1, 3, 3)
for frac in (0.0, 0.25, 0.5):
    t = frac*Tp
    Psi = c1*psi(1)*np.exp(-1j*E(1)*t) + c2*psi(2)*np.exp(-1j*E(2)*t)
    plt.plot(x, np.abs(Psi)**2, label=f"t = {frac:.2f} T")
plt.plot(x, psi(1)**2, "k:", lw=1, label="stationary |1> (static)")
plt.legend(fontsize=7); plt.title("|Psi(x,t)|^2 sloshes at omega_21")
plt.tight_layout(); plt.show()
`;

// ── python/wk02_matrix_mechanics.py ──────────────
export const PY_MATRIX = `"""
Wk02 — Matrix mechanics: [X, P] = i hbar, seen numerically
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

Build the position and momentum MATRICES in the particle-in-a-box basis:
  X_mn = <m| x |n>,   P_mn = <m| -i hbar d/dx |n>
X is real symmetric; P is purely imaginary antisymmetric: P = i * Pi.
Then  XP - PX = i (X Pi - Pi X)  ->  its diagonal should equal i hbar
(Born-Jordan's "strong quantization condition", 1925).
A truncated N x N matrix reproduces i*hbar on the diagonal in the interior,
but fails near n ~ N: Heisenberg's matrices must be INFINITE.

Also: uncertainty products for eigenstates,
  sigma_x sigma_p = hbar sqrt(n^2 pi^2/12 - 1/2) >= hbar/2.

Run:  python wk02_matrix_mechanics.py   (hbar = m = L = 1)
"""
import numpy as np
import matplotlib.pyplot as plt

trapz = getattr(np, "trapezoid", getattr(np, "trapz", None))  # numpy 1.x/2.x compat

L, hbar = 1.0, 1.0
Nb = 20                                   # basis size (try 10, 20, 40)
x = np.linspace(0, L, 6001)
psis  = [np.sqrt(2/L)*np.sin(n*np.pi*x/L) for n in range(1, Nb+1)]
dpsis = [np.sqrt(2/L)*(n*np.pi/L)*np.cos(n*np.pi*x/L) for n in range(1, Nb+1)]

X  = np.array([[trapz(psis[m]*x*psis[n], x) for n in range(Nb)] for m in range(Nb)])
Pi = np.array([[-hbar*trapz(psis[m]*dpsis[n], x) for n in range(Nb)] for m in range(Nb)])
# P = i * Pi  (purely imaginary, antisymmetric)

M = X @ Pi - Pi @ X                       # Im part of (XP - PX)
diag = np.diag(M)/hbar

print("n   Im[X,P]_nn / hbar   (should be 1 in the interior)")
for n in (1, 2, 5, 10, 15, 18, 19, 20):
    print(f"{n:2d}  {diag[n-1]:12.6f}")
print("\\n-> plateau at 1, drooping near n ~ N: the matrices are truly infinite!")

# analytic X matrix elements as a check (m != n, m+n odd):
m_, n_ = 1, 2
Xa = -8*L*m_*n_/(np.pi**2*(m_**2 - n_**2)**2)
print(f"\\ncheck X_12: numeric {X[0,1]:.6f}, analytic -8Lmn/pi^2(m^2-n^2)^2 = {Xa:.6f}")

# uncertainty product for eigenstates
print("\\n n   sigma_x/L     sigma_p*L/hbar   product/hbar  (bound 0.5)")
for n in range(1, 6):
    sx = np.sqrt(1/12 - 1/(2*n**2*np.pi**2))
    sp = n*np.pi
    print(f"{n:2d}  {sx:10.5f}  {sp:13.5f}  {sx*sp:12.5f}")

fig, ax = plt.subplots(1, 2, figsize=(10.5, 4))
im = ax[0].imshow(M/hbar, cmap="RdBu_r", vmin=-1.2, vmax=1.2)
ax[0].set_title("Im(XP - PX)/hbar : ~ identity"); plt.colorbar(im, ax=ax[0])
ax[1].plot(range(1, Nb+1), diag, "o-")
ax[1].axhline(1, color="r", ls="--"); ax[1].set_xlabel("n")
ax[1].set_title("diagonal: [X,P] = i hbar (interior)")
plt.tight_layout(); plt.show()
`;

// ── matlab/wk02_wave_packet.m ────────────────────
export const ML_PACKET = `% Wk02 - Gaussian wave packet: minimum uncertainty & dispersion
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% hbar = m = 1.  sigma_x sigma_p = hbar/2;  sigma_x(t)^2 = eps + t^2/(4 eps).

hbar = 1; m = 1; p0 = 2;
x = linspace(-30, 30, 20001);
p = linspace(-10, 14, 20001);

fprintf('eps    sigma_x    sigma_p    product/hbar\\n');
for eps = [0.5 1 2 3]
    Px = abs((1/(2*pi*eps))^0.25 * exp(-x.^2/(4*eps))).^2;
    Pp = abs((2*eps/(pi*hbar^2))^0.25 * exp(-eps*(p-p0).^2/hbar^2)).^2;
    sx = sqrt(trapz(x, x.^2.*Px) - trapz(x, x.*Px)^2);
    sp = sqrt(trapz(p, p.^2.*Pp) - trapz(p, p.*Pp)^2);
    fprintf('%4.1f  %9.5f  %9.5f  %11.5f\\n', eps, sx, sp, sx*sp/hbar);
end

eps = 1.0;
figure(1);
subplot(1,2,1); hold on;
xs = linspace(-8, 28, 800);
for t = [0 3 6]
    s2 = eps + (hbar*t)^2/(4*m^2*eps); xc = p0*t/m;
    plot(xs, exp(-(xs-xc).^2/(2*s2))/sqrt(2*pi*s2), 'LineWidth', 1.4, ...
         'DisplayName', sprintf('t=%d, sigma=%.2f', t, sqrt(s2)));
end
xlabel('x'); ylabel('|\\Psi(x,t)|^2'); legend; title('Free-packet dispersion');

subplot(1,2,2); hold on;
ts = linspace(0, 10, 300);
plot(ts, sqrt(eps + (hbar*ts).^2/(4*m^2*eps)), 'b-', 'LineWidth', 1.5);
yline(hbar/(2*sqrt(eps)), 'r--');
plot(ts, hbar*ts/(2*m*sqrt(eps)), 'k:');
xlabel('t'); legend('\\sigma_x(t)', '\\sigma_p (const)', 'asymptote');
title('Position uncertainty grows with time');
`;

// ── matlab/wk02_step_tunneling.m ─────────────────
export const ML_TUNNEL = `% Wk02 - Step potential & quantum tunneling
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% Reproduces the lecture's FET / STM tunneling numbers.

HBARC = 197.3269804;  MC2 = 0.51099895e6;   % eV nm, eV
kappa = @(dE) sqrt(2*MC2*dE)/HBARC;         % nm^-1

Texact = @(E, V0, w) 1./(1 + V0^2*sinh(kappa(V0-E)*w).^2/(4*E*(V0-E)));

fprintf('E/V0    R        T        R+T\\n');
for r = [1.2 1.5 2 4]
    k1 = sqrt(r); k2 = sqrt(r-1);
    R = ((k1-k2)/(k1+k2))^2; T = 4*k1*k2/(k1+k2)^2;
    fprintf('%4.1f  %.5f  %.5f  %.5f\\n', r, R, T, R+T);
end
fprintf('FET: kappa = %.2f nm^-1, T = %.4f (lecture 0.044)\\n', kappa(6), Texact(6,12,0.18));
fprintf('STM: T(1.0 nm) = %.2e,  T(0.5 nm) = %.2e\\n', Texact(2,5,1), Texact(2,5,0.5));

figure(1);
subplot(1,3,1); rr = linspace(1.0001, 7, 400);
k1 = sqrt(rr); k2 = sqrt(rr-1);
plot(rr, 4*k1.*k2./(k1+k2).^2, 'b-', rr, ((k1-k2)./(k1+k2)).^2, 'r-', 'LineWidth', 1.4);
yline(1, 'k--'); xlabel('E/V_0'); legend('T', 'R'); title('Step: R & T');

subplot(1,3,2); EE = linspace(0.02, 0.98, 300)*5;
semilogy(EE/5, arrayfun(@(E) Texact(E,5,0.4), EE), 'b-', 'LineWidth', 1.4);
xlabel('E/V_0'); title('Barrier T (V_0=5 eV, w=0.4 nm)');

subplot(1,3,3); ww = linspace(0.1, 1.2, 300);
semilogy(ww, arrayfun(@(w) Texact(2,5,w), ww), 'b-', 'LineWidth', 1.4);
xlabel('width w [nm]'); title('T(w): STM principle');
`;

// ── matlab/wk02_box_superposition.m ──────────────
export const ML_BOX = `% Wk02 - Particle in a box: basis expansion, measurement & dynamics
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% hbar = m = L = 1.  c_n = -8 sqrt(15)/(n^3 pi^3) (odd n), <E> = 5.

L = 1; x = linspace(0, L, 4001);
psi = @(n) sqrt(2/L)*sin(n*pi*x/L);
En  = @(n) n^2*pi^2/2;

f = sqrt(30/L^5)*x.*(x - L);                 % lecture convention
fprintf('normalization: %.6f\\n', trapz(x, f.^2));

N = 15; c = zeros(1, N);
for n = 1:N, c(n) = trapz(x, psi(n).*f); end
fprintf(' n   c_n         analytic     |c_n|^2\\n');
for n = 1:2:7
    fprintf('%2d  %10.6f  %10.6f  %10.6f\\n', n, c(n), -8*sqrt(15)/(n^3*pi^3), c(n)^2);
end
fprintf('Parseval: %.6f,  <E> = %.5f (analytic 5)\\n', sum(c.^2), sum(c.^2.*arrayfun(En, 1:N)));

figure(1);
subplot(1,3,1); hold on; plot(x, f, 'k-', 'LineWidth', 2);
for Np = [1 3 5]
    g = zeros(size(x)); for n = 1:Np, g = g + c(n)*psi(n); end
    plot(x, g, '--');
end
title('Basis expansion'); legend('f', 'N=1', 'N=3', 'N=5');

subplot(1,3,2); bar(1:N, max(c.^2, 1e-12)); set(gca, 'YScale', 'log');
xlabel('n'); title('|c_n|^2 (measurement probabilities)');

subplot(1,3,3); hold on;
c1 = 2/sqrt(5); c2 = 1/sqrt(5); Tp = 2*pi/(En(2) - En(1));
for frac = [0 0.25 0.5]
    t = frac*Tp;
    Psi = c1*psi(1)*exp(-1i*En(1)*t) + c2*psi(2)*exp(-1i*En(2)*t);
    plot(x, abs(Psi).^2, 'LineWidth', 1.3, 'DisplayName', sprintf('t=%.2fT', frac));
end
plot(x, psi(1).^2, 'k:', 'DisplayName', 'stationary |1>');
legend; title('|\\Psi(x,t)|^2 sloshing');
`;

// ── matlab/wk02_matrix_mechanics.m ───────────────
export const ML_MATRIX = `% Wk02 - Matrix mechanics: [X,P] = i hbar seen numerically
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% X_mn = <m|x|n>, P = i*Pi in the box basis; diag Im[X,P] -> hbar.

L = 1; hbar = 1; Nb = 20;
x = linspace(0, L, 6001);
X = zeros(Nb); Pi_ = zeros(Nb);
for m = 1:Nb
    pm = sqrt(2/L)*sin(m*pi*x/L);
    for n = 1:Nb
        pn  = sqrt(2/L)*sin(n*pi*x/L);
        dpn = sqrt(2/L)*(n*pi/L)*cos(n*pi*x/L);
        X(m,n)   = trapz(x, pm.*x.*pn);
        Pi_(m,n) = -hbar*trapz(x, pm.*dpn);
    end
end
M = X*Pi_ - Pi_*X;                 % Im part of (XP - PX)
d = diag(M)/hbar;
fprintf('n   Im[X,P]_nn/hbar\\n');
for n = [1 2 5 10 15 19 20], fprintf('%2d  %10.5f\\n', n, d(n)); end
fprintf('-> 1 in the interior; fails near n ~ N (infinite matrices!)\\n');
fprintf('X_12: %.6f vs analytic %.6f\\n', X(1,2), -8*1*2/(pi^2*(1-4)^2));

fprintf('\\n n  sigma_x*sigma_p/hbar (bound 0.5)\\n');
for n = 1:5
    fprintf('%2d  %.5f\\n', n, sqrt(1/12 - 1/(2*n^2*pi^2))*n*pi);
end

figure(1);
subplot(1,2,1); imagesc(M/hbar, [-1.2 1.2]); colorbar; axis square;
title('Im(XP-PX)/hbar ~ identity');
subplot(1,2,2); plot(1:Nb, d, 'o-'); yline(1, 'r--'); ylim([-2 2]);
xlabel('n'); title('diagonal -> hbar (interior)');
`;

// ── julia/wk02_wave_packet.jl ────────────────────
export const JL_PACKET = `# Wk02 - Gaussian wave packet: minimum uncertainty & dispersion
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
# hbar = m = 1.  sigma_x*sigma_p = 1/2;  sigma_x(t)^2 = eps + t^2/(4 eps).
using Plots, Printf

const ħ = 1.0; const m = 1.0; const p0 = 2.0
trapz(x, y) = sum(0.5 .* (y[1:end-1] .+ y[2:end]) .* diff(x))

x = range(-30, 30, length=20001) |> collect
p = range(-10, 14, length=20001) |> collect

@printf("eps    sigma_x    sigma_p    product\\n")
for ε in (0.5, 1.0, 2.0, 3.0)
    Px = abs2.((1/(2π*ε))^0.25 .* exp.(-x.^2 ./ (4ε)))
    Pp = abs2.((2ε/(π*ħ^2))^0.25 .* exp.(-ε .* (p .- p0).^2 ./ ħ^2))
    sx = sqrt(trapz(x, x.^2 .* Px) - trapz(x, x .* Px)^2)
    sp = sqrt(trapz(p, p.^2 .* Pp) - trapz(p, p .* Pp)^2)
    @printf("%4.1f  %9.5f  %9.5f  %9.5f\\n", ε, sx, sp, sx*sp/ħ)
end

ε = 1.0
xs = range(-8, 28, length=800)
p1 = plot(xlabel="x", ylabel="|Psi|²", title="Free-packet dispersion")
for t in (0.0, 3.0, 6.0)
    s2 = ε + (ħ*t)^2/(4m^2*ε); xc = p0*t/m
    plot!(p1, xs, exp.(-(xs .- xc).^2 ./ (2s2)) ./ sqrt(2π*s2),
          lw=1.4, label=@sprintf("t=%.0f, σ=%.2f", t, sqrt(s2)))
end
ts = range(0, 10, length=300)
p2 = plot(ts, sqrt.(ε .+ (ħ .* ts).^2 ./ (4m^2*ε)), lw=1.6, label="σx(t)",
          xlabel="t", title="σx grows; σp constant")
hline!(p2, [ħ/(2sqrt(ε))], ls=:dash, c=:red, label="σp")
display(plot(p1, p2, layout=(1,2), size=(1000,400)))
readline()
`;

// ── julia/wk02_step_tunneling.jl ─────────────────
export const JL_TUNNEL = `# Wk02 - Step potential & quantum tunneling
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
using Plots, Printf

const HBARC = 197.3269804   # eV nm
const MC2   = 0.51099895e6  # eV
κnm(dE) = sqrt(2*MC2*dE)/HBARC
Texact(E, V0, w) = 1/(1 + V0^2*sinh(κnm(V0-E)*w)^2/(4E*(V0-E)))

@printf("E/V0    R        T        R+T\\n")
for r in (1.2, 1.5, 2.0, 4.0)
    k1, k2 = sqrt(r), sqrt(r-1)
    R = ((k1-k2)/(k1+k2))^2; T = 4k1*k2/(k1+k2)^2
    @printf("%4.1f  %.5f  %.5f  %.5f\\n", r, R, T, R+T)
end
@printf("FET: kappa = %.2f nm^-1, T = %.4f (lecture 0.044)\\n", κnm(6.0), Texact(6.0,12.0,0.18))
@printf("STM: T(1.0nm) = %.2e,  T(0.5nm) = %.2e\\n", Texact(2.0,5.0,1.0), Texact(2.0,5.0,0.5))

rr = range(1.0001, 7, length=400)
p1 = plot(rr, [4sqrt(r)*sqrt(r-1)/(sqrt(r)+sqrt(r-1))^2 for r in rr], lw=1.5,
          label="T", xlabel="E/V0", title="Step: R & T")
plot!(p1, rr, [((sqrt(r)-sqrt(r-1))/(sqrt(r)+sqrt(r-1)))^2 for r in rr], lw=1.5, label="R")
hline!(p1, [1.0], ls=:dash, c=:black, label=false)

EE = range(0.1, 4.9, length=300)
p2 = plot(EE ./ 5, [Texact(E, 5.0, 0.4) for E in EE], yscale=:log10, lw=1.5,
          xlabel="E/V0", title="Barrier T (V0=5eV, w=0.4nm)", label=false)
ww = range(0.1, 1.2, length=300)
p3 = plot(ww, [Texact(2.0, 5.0, w) for w in ww], yscale=:log10, lw=1.5,
          xlabel="width w [nm]", title="T(w): STM principle", label=false)
display(plot(p1, p2, p3, layout=(1,3), size=(1300,380)))
readline()
`;

// ── julia/wk02_box_superposition.jl ──────────────
export const JL_BOX = `# Wk02 - Particle in a box: basis expansion, measurement & dynamics
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
# hbar = m = L = 1.  c_n = -8 sqrt(15)/(n^3 pi^3) (odd n), <E> = 5.
using Plots, Printf

const L = 1.0
x = range(0, L, length=4001) |> collect
trapz(y) = (x[2]-x[1])*(sum(y) - 0.5*(y[1]+y[end]))
ψ(n) = sqrt(2/L) .* sin.(n*π .* x ./ L)
En(n) = n^2*π^2/2

f = sqrt(30/L^5) .* x .* (x .- L)
@printf("normalization: %.6f\\n", trapz(f.^2))

N = 15
c = [trapz(ψ(n) .* f) for n in 1:N]
@printf(" n   c_n         analytic     |c_n|^2\\n")
for n in 1:2:7
    @printf("%2d  %10.6f  %10.6f  %10.6f\\n", n, c[n], -8sqrt(15)/(n^3*π^3), c[n]^2)
end
@printf("Parseval: %.6f,  <E> = %.5f (analytic 5)\\n",
        sum(c.^2), sum(c[n]^2*En(n) for n in 1:N))

p1 = plot(x, f, c=:black, lw=2, label="f(x)", title="Basis expansion")
for Np in (1, 3, 5)
    g = sum(c[n] .* ψ(n) for n in 1:Np)
    plot!(p1, x, g, ls=:dash, label="N=$Np")
end
p2 = bar(1:N, max.(c.^2, 1e-12), yscale=:log10, label=false,
         xlabel="n", title="|c_n|² (measurement prob.)")

c1, c2 = 2/sqrt(5), 1/sqrt(5)
Tp = 2π/(En(2) - En(1))
p3 = plot(title="|Psi(x,t)|² sloshing", xlabel="x")
for frac in (0.0, 0.25, 0.5)
    t = frac*Tp
    Ψ = c1 .* ψ(1) .* exp(-im*En(1)*t) .+ c2 .* ψ(2) .* exp(-im*En(2)*t)
    plot!(p3, x, abs2.(Ψ), lw=1.3, label=@sprintf("t=%.2fT", frac))
end
plot!(p3, x, ψ(1).^2, ls=:dot, c=:black, label="stationary |1>")
display(plot(p1, p2, p3, layout=(1,3), size=(1300,380)))
readline()
`;

// ── julia/wk02_matrix_mechanics.jl ───────────────
export const JL_MATRIX = `# Wk02 - Matrix mechanics: [X,P] = i hbar seen numerically
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
# X, P (= i*Pi) in the box basis; diag Im[X,P] -> hbar in the interior.
using Plots, Printf, LinearAlgebra

const L = 1.0; const ħ = 1.0; const Nb = 20
x = range(0, L, length=6001) |> collect
trapz(y) = (x[2]-x[1])*(sum(y) - 0.5*(y[1]+y[end]))
ψ(n)  = sqrt(2/L) .* sin.(n*π .* x ./ L)
dψ(n) = sqrt(2/L)*(n*π/L) .* cos.(n*π .* x ./ L)

X  = [trapz(ψ(m) .* x .* ψ(n)) for m in 1:Nb, n in 1:Nb]
Pi = [-ħ*trapz(ψ(m) .* dψ(n))  for m in 1:Nb, n in 1:Nb]
M = X*Pi - Pi*X                       # Im part of (XP - PX)
d = diag(M) ./ ħ

@printf("n   Im[X,P]_nn/hbar\\n")
for n in (1, 2, 5, 10, 15, 19, 20); @printf("%2d  %10.5f\\n", n, d[n]); end
println("-> 1 in the interior; fails near n ~ N (infinite matrices!)")
@printf("X_12: %.6f vs analytic %.6f\\n", X[1,2], -8*1*2/(π^2*(1-4)^2))

@printf("\\n n  sigma_x*sigma_p/hbar (bound 0.5)\\n")
for n in 1:5
    @printf("%2d  %.5f\\n", n, sqrt(1/12 - 1/(2n^2*π^2))*n*π)
end

p1 = heatmap(M ./ ħ, c=:RdBu, clim=(-1.2, 1.2), yflip=true,
             title="Im(XP-PX)/ħ ~ identity", aspect_ratio=1)
p2 = plot(1:Nb, d, marker=:o, ylim=(-2, 2), label=false,
          xlabel="n", title="diagonal -> ħ (interior)")
hline!(p2, [1.0], ls=:dash, c=:red, label=false)
display(plot(p1, p2, layout=(1,2), size=(1000,420)))
readline()
`;

// ── cpp/wk02_wave_packet.cpp ─────────────────────
export const CPP_PACKET = `// Wk02 - Gaussian wave packet: minimum uncertainty & dispersion
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk02_wave_packet.cpp -o wk02_wave_packet
// hbar = m = 1. Verifies sigma_x*sigma_p = 1/2; writes dispersion.csv.
#include <cmath>
#include <cstdio>
#include <initializer_list>

int main() {
    const double hbar = 1.0, m = 1.0, p0 = 2.0;
    const int N = 200001;

    std::printf("eps    sigma_x    sigma_p    product\\n");
    for (double eps : {0.5, 1.0, 2.0, 3.0}) {
        double sx2 = 0, sp2 = 0, nx = 0, np_ = 0;
        for (int i = 0; i < N; ++i) {                    // quadrature
            double x = -30.0 + 60.0*i/(N-1);
            double Px = std::exp(-x*x/(2*eps))/std::sqrt(2*M_PI*eps);
            sx2 += x*x*Px; nx += Px;
            double p = -10.0 + 24.0*i/(N-1);
            double Pp = std::exp(-2*eps*(p-p0)*(p-p0)/(hbar*hbar));
            sp2 += (p-p0)*(p-p0)*Pp; np_ += Pp;
        }
        double sx = std::sqrt(sx2/nx), sp = std::sqrt(sp2/np_);
        std::printf("%4.1f  %9.5f  %9.5f  %9.5f\\n", eps, sx, sp, sx*sp/hbar);
    }

    const double eps = 1.0;
    FILE* f = std::fopen("dispersion.csv", "w");
    std::fprintf(f, "t,sigma_x,sigma_p\\n");
    for (int i = 0; i <= 300; ++i) {
        double t = 10.0*i/300;
        double sx = std::sqrt(eps + hbar*hbar*t*t/(4*m*m*eps));
        std::fprintf(f, "%.4f,%.6f,%.6f\\n", t, sx, hbar/(2*std::sqrt(eps)));
    }
    std::fclose(f);
    std::printf("wrote dispersion.csv  (sigma_x grows, sigma_p constant)\\n");

    // electron localized to 0.1 nm doubles its width in ~0.3 fs
    const double hSI = 1.054571817e-34, me = 9.1093837015e-31, epsSI = 1e-20;
    std::printf("electron 0.1 nm packet doubling time: %.2e s\\n",
                2*std::sqrt(3.0)*me*epsSI/hSI);
    return 0;
}
`;

// ── cpp/wk02_step_tunneling.cpp ──────────────────
export const CPP_TUNNEL = `// Wk02 - Step potential & quantum tunneling
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk02_step_tunneling.cpp -o wk02_step_tunneling
// Reproduces the lecture FET / STM numbers; writes T_vs_width.csv.
#include <cmath>
#include <cstdio>
#include <initializer_list>

const double HBARC = 197.3269804;   // eV nm
const double MC2   = 0.51099895e6;  // eV

double kappa_nm(double dE) { return std::sqrt(2*MC2*dE)/HBARC; }
double T_exact(double E, double V0, double w) {
    double s = std::sinh(kappa_nm(V0-E)*w);
    return 1.0/(1.0 + V0*V0*s*s/(4*E*(V0-E)));
}

int main() {
    std::printf("E/V0    R        T        R+T\\n");
    for (double r : {1.2, 1.5, 2.0, 4.0}) {
        double k1 = std::sqrt(r), k2 = std::sqrt(r-1.0);
        double R = std::pow((k1-k2)/(k1+k2), 2);
        double T = 4*k1*k2/std::pow(k1+k2, 2);
        std::printf("%4.1f  %.5f  %.5f  %.5f\\n", r, R, T, R+T);
    }
    std::printf("\\nFET (E=6, V0=12 eV, w=0.18 nm): kappa = %.2f nm^-1, T = %.4f (lecture 0.044)\\n",
                kappa_nm(6.0), T_exact(6, 12, 0.18));
    std::printf("STM (E=2, V0=5 eV): T(1.0 nm) = %.2e,  T(0.5 nm) = %.2e\\n",
                T_exact(2, 5, 1.0), T_exact(2, 5, 0.5));

    FILE* f = std::fopen("T_vs_width.csv", "w");
    std::fprintf(f, "w_nm,T\\n");
    for (int i = 0; i <= 300; ++i) {
        double w = 0.1 + (1.2-0.1)*i/300;
        std::fprintf(f, "%.4f,%.6e\\n", w, T_exact(2, 5, w));
    }
    std::fclose(f);
    std::printf("wrote T_vs_width.csv (exponential sensitivity -> STM)\\n");
    return 0;
}
`;

// ── cpp/wk02_box_superposition.cpp ───────────────
export const CPP_BOX = `// Wk02 - Particle in a box: basis expansion, measurement & dynamics
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk02_box_superposition.cpp -o wk02_box_superposition
// hbar = m = L = 1.  c_n -> -8 sqrt(15)/(n^3 pi^3), <E> -> 5.
#include <cmath>
#include <cstdio>
#include <vector>
#include <complex>

int main() {
    const double L = 1.0; const int Nx = 4001, N = 15;
    std::vector<double> x(Nx);
    for (int i = 0; i < Nx; ++i) x[i] = L*i/(Nx-1);
    double h = x[1] - x[0];
    auto trapz = [&](const std::vector<double>& y) {
        double s = 0; for (int i = 0; i < Nx; ++i) s += y[i];
        return h*(s - 0.5*(y[0] + y[Nx-1]));
    };
    auto psi = [&](int n, int i) { return std::sqrt(2.0/L)*std::sin(n*M_PI*x[i]/L); };
    auto En  = [](int n) { return n*n*M_PI*M_PI/2.0; };

    std::vector<double> f(Nx), tmp(Nx);
    for (int i = 0; i < Nx; ++i) f[i] = std::sqrt(30.0)*x[i]*(x[i] - L);
    for (int i = 0; i < Nx; ++i) tmp[i] = f[i]*f[i];
    std::printf("normalization: %.6f\\n", trapz(tmp));

    std::vector<double> c(N+1, 0.0);
    for (int n = 1; n <= N; ++n) {
        for (int i = 0; i < Nx; ++i) tmp[i] = psi(n, i)*f[i];
        c[n] = trapz(tmp);
    }
    std::printf(" n   c_n         analytic     |c_n|^2\\n");
    for (int n = 1; n <= 7; n += 2)
        std::printf("%2d  %10.6f  %10.6f  %10.6f\\n", n, c[n],
                    -8*std::sqrt(15.0)/(n*n*n*M_PI*M_PI*M_PI), c[n]*c[n]);
    double S = 0, Em = 0;
    for (int n = 1; n <= N; ++n) { S += c[n]*c[n]; Em += c[n]*c[n]*En(n); }
    std::printf("Parseval: %.6f,  <E> = %.5f (analytic 5)\\n\\n", S, Em);

    // superposition (2|1> + |2>)/sqrt(5): density at x = L/4 over one beat
    double c1 = 2/std::sqrt(5.0), c2 = 1/std::sqrt(5.0);
    double Tp = 2*M_PI/(En(2) - En(1));
    std::printf("beat period T = %.4f;  |Psi(L/4,t)|^2:\\n  t/T   density\\n", Tp);
    for (double frac : {0.0, 0.25, 0.5, 0.75}) {
        double t = frac*Tp, xx = L/4;
        std::complex<double> Psi =
            c1*std::sqrt(2/L)*std::sin(M_PI*xx/L)*std::exp(std::complex<double>(0, -En(1)*t)) +
            c2*std::sqrt(2/L)*std::sin(2*M_PI*xx/L)*std::exp(std::complex<double>(0, -En(2)*t));
        std::printf("%5.2f  %.5f\\n", frac, std::norm(Psi));
    }
    std::printf("-> the density sloshes: superpositions move, eigenstates don't.\\n");
    return 0;
}
`;

// ── cpp/wk02_matrix_mechanics.cpp ────────────────
export const CPP_MATRIX = `// Wk02 - Matrix mechanics: [X,P] = i hbar seen numerically
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk02_matrix_mechanics.cpp -o wk02_matrix_mechanics
// X real symmetric, P = i*Pi (Pi real antisymmetric) in the box basis.
// Im(XP-PX) = X*Pi - Pi*X -> hbar * I in the interior of the matrix.
#include <cmath>
#include <cstdio>
#include <vector>

int main() {
    const double L = 1.0, hbar = 1.0;
    const int Nb = 20, Nx = 6001;
    std::vector<double> x(Nx);
    for (int i = 0; i < Nx; ++i) x[i] = L*i/(Nx-1);
    double h = x[1] - x[0];

    auto X  = std::vector<std::vector<double>>(Nb, std::vector<double>(Nb));
    auto Pi = X, M = X;
    for (int mq = 1; mq <= Nb; ++mq)
        for (int nq = 1; nq <= Nb; ++nq) {
            double sX = 0, sP = 0;
            for (int i = 0; i < Nx; ++i) {
                double pm  = std::sqrt(2/L)*std::sin(mq*M_PI*x[i]/L);
                double pn  = std::sqrt(2/L)*std::sin(nq*M_PI*x[i]/L);
                double dpn = std::sqrt(2/L)*(nq*M_PI/L)*std::cos(nq*M_PI*x[i]/L);
                double wgt = (i == 0 || i == Nx-1) ? 0.5 : 1.0;
                sX += wgt*pm*x[i]*pn;
                sP += wgt*pm*dpn;
            }
            X[mq-1][nq-1]  = h*sX;
            Pi[mq-1][nq-1] = -hbar*h*sP;
        }
    for (int i = 0; i < Nb; ++i)
        for (int j = 0; j < Nb; ++j) {
            double s = 0;
            for (int k = 0; k < Nb; ++k) s += X[i][k]*Pi[k][j] - Pi[i][k]*X[k][j];
            M[i][j] = s;
        }

    std::printf("n   Im[X,P]_nn/hbar (should be 1 in the interior)\\n");
    for (int n : {1, 2, 5, 10, 15, 19, 20})
        std::printf("%2d  %10.5f\\n", n, M[n-1][n-1]/hbar);
    std::printf("-> plateau at 1, breakdown near n ~ N: infinite matrices needed!\\n");
    std::printf("X_12: %.6f vs analytic %.6f\\n", X[0][1], -8.0*1*2/(M_PI*M_PI*9));

    std::printf("\\n n  sigma_x*sigma_p/hbar (bound 0.5)\\n");
    for (int n = 1; n <= 5; ++n)
        std::printf("%2d  %.5f\\n", n, std::sqrt(1.0/12 - 1.0/(2*n*n*M_PI*M_PI))*n*M_PI);
    return 0;
}
`;
