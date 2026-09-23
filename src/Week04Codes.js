/* ============================================================
   Week04Codes.js — Physical Chemistry 2, Week 4
   Raw code samples: Hydrogen Atom, Spin & Gas Transport
   - 4 topics: hydrogen_spectrum, spin_measurement,
               maxwell_boltzmann, transport
   - 4 languages: Python, MATLAB, Julia, C++
   Imported by Week04App.jsx > RawCodes tab.
   Auto-generated from codes/ — edit the standalone files, then regenerate.
   ============================================================ */

// ── python/wk04_hydrogen_spectrum.py ─────────────
export const PY_HATOM = `"""
Wk04 — Hydrogen atom: Bohr model, spectral series, degeneracy
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Bohr model: force balance + mvr = n hbar gives
      r_n = n^2 a0,   a0 = hbar^2/(k_e m e^2) = 0.529 A
      E_n = -13.606 / n^2  eV        (matches full QM exactly!)
(2) Emission wavelength lambda = hc/(E_n2 - E_n1):
      Lyman (->1, UV), Balmer (->2, visible), Paschen (->3, IR), ...
(3) Degeneracy of level n (with spin): 2 n^2
      counted from l = 0..n-1, m = -l..l, s = up/down.

Run:  python wk04_hydrogen_spectrum.py
"""
import numpy as np
import matplotlib.pyplot as plt

RY = 13.605693          # eV  (Rydberg energy)
HC = 1239.841984        # eV nm
A0 = 0.0529177          # nm  (Bohr radius)

E = lambda n: -RY / n**2

# -- (1) Bohr radii & energies -------------------------------
print(" n   r_n [nm]    E_n [eV]")
for n in range(1, 6):
    print(f"{n:2d}  {n*n*A0:9.4f}  {E(n):9.4f}")
print(f"-> ground state: r = {A0*10:.3f} A, E = {E(1):.3f} eV (ionization 13.6 eV)\\n")

# -- (2) spectral series -------------------------------------
series = {1: "Lyman", 2: "Balmer", 3: "Paschen", 4: "Brackett", 5: "Pfund"}
print("series    n2->n1   dE [eV]   lambda [nm]")
for n1, name in series.items():
    for n2 in (n1 + 1, n1 + 2, n1 + 3):
        dE = E(n2) - E(n1)
        print(f"{name:9s} {n2}->{n1}   {dE:7.4f}   {HC/dE:9.1f}")
    print()
# classic checks: Lyman-alpha 121.6 nm, H-alpha 656.3 nm, Balmer limit 364.6 nm
print(f"Balmer limit (n=inf -> 2): {HC/(0 - E(2)):.1f} nm (UV edge of visible series)\\n")

# -- (3) degeneracy count ------------------------------------
print(" n   states |n,l,m,s>   2n^2")
for n in range(1, 5):
    cnt = sum(2 * (2 * l + 1) for l in range(n))
    print(f"{n:2d}  {cnt:17d}  {2*n*n:5d}")
print("-> degeneracy 2(1+3+5+...+(2n-1)) = 2n^2: why shells hold 2, 8, 18, 32 electrons\\n")

# -- plot: level ladder + Balmer lines -----------------------
fig, ax = plt.subplots(1, 2, figsize=(11, 4.4))
for n in range(1, 8):
    ax[0].axhline(E(n), xmin=0.1, xmax=0.9, color="teal", lw=1.4)
    ax[0].text(0.92, E(n), f"n={n}", fontsize=8, va="center")
ax[0].set_ylabel("E [eV]"); ax[0].set_title("Bohr / Schrodinger levels  E = -13.6/n$^2$ eV")
ax[0].set_xticks([])

for n2 in range(3, 8):
    lam = HC / (E(n2) - E(2))
    ax[1].axvline(lam, color=plt.cm.rainbow((lam - 380) / 320), lw=2.5)
    ax[1].text(lam, 1.02, f"{n2}→2", ha="center", fontsize=8)
ax[1].set_xlim(380, 700); ax[1].set_ylim(0, 1.15)
ax[1].set_xlabel("wavelength [nm]"); ax[1].set_yticks([])
ax[1].set_title("Balmer series (visible H emission)")
plt.tight_layout(); plt.show()
`;

// ── python/wk04_spin_measurement.py ──────────────
export const PY_SPIN = `"""
Wk04 — Spin-1/2: Pauli algebra, sequential measurement, unitarity
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) S_i = (hbar/2) sigma_i.  Check the algebra:
      [S_x, S_y] = i hbar S_z (cyclic),  [S^2, S_i] = 0,  S^2 = (3/4) hbar^2 I
(2) Measuring S_x on |up_z>: eigenvectors |up_x> = (|up>+|down>)/sqrt2
      -> P(+hbar/2) = P(-hbar/2) = 1/2.  Monte-Carlo a Stern-Gerlach chain
      z-filter -> x-measure -> z-measure: the last z is 50/50 again!
      (measuring S_x ERASES the previously known S_z value)
(3) Basis change |z> <-> |x> is a UNITARY matrix U: U^dag U = I,
      and <f|g> is conserved. [S_y]' = U^-1 [S_y] U as in the lecture.

Run:  python wk04_spin_measurement.py     (hbar = 1)
"""
import numpy as np

rng = np.random.default_rng(42)
hbar = 1.0

I2 = np.eye(2, dtype=complex)
sx = np.array([[0, 1], [1, 0]], dtype=complex)
sy = np.array([[0, -1j], [1j, 0]], dtype=complex)
sz = np.array([[1, 0], [0, -1]], dtype=complex)
Sx, Sy, Sz = 0.5 * hbar * sx, 0.5 * hbar * sy, 0.5 * hbar * sz
S2 = Sx @ Sx + Sy @ Sy + Sz @ Sz

# -- (1) algebra checks --------------------------------------
comm = lambda A, B: A @ B - B @ A
print("|| [Sx,Sy] - i hbar Sz || =", np.abs(comm(Sx, Sy) - 1j * hbar * Sz).max())
print("|| [S^2,Sx] ||            =", np.abs(comm(S2, Sx)).max())
print("S^2 = (3/4) hbar^2 I ?     ", np.allclose(S2, 0.75 * hbar**2 * I2))
print("eigenvalues of Sx:         ", np.round(np.linalg.eigvalsh(Sx), 6), "\\n")

# -- (2) sequential Stern-Gerlach ----------------------------
up_z = np.array([1, 0], dtype=complex)
up_x = np.array([1, 1], dtype=complex) / np.sqrt(2)
dn_x = np.array([1, -1], dtype=complex) / np.sqrt(2)

N = 100_000
# start in |up_z>; measure S_x
p_upx = abs(np.vdot(up_x, up_z))**2
got_upx = rng.random(N) < p_upx           # collapse
# those that gave +x are now |up_x>; measure S_z again
p_upz_after = abs(np.vdot(up_z, up_x))**2
got_upz = rng.random(got_upx.sum()) < p_upz_after

print(f"P(Sx=+h/2 | up_z)  theory 0.5, MC {got_upx.mean():.4f}")
print(f"P(Sz=+h/2 | up_x)  theory 0.5, MC {got_upz.mean():.4f}")
print("-> the x-measurement destroyed the z-information: incompatible observables")
print("   ([Sz,Sx] = i hbar Sy != 0 - they share no common eigenvectors)\\n")

# -- (3) unitary basis change --------------------------------
U = np.column_stack([up_x, dn_x])          # columns: new basis in old coords
print("U =\\n", np.round(U, 4))
print("U^dag U = I ?", np.allclose(U.conj().T @ U, I2))
Sy_p = U.conj().T @ Sy @ U                 # lecture: [Sy]' = U^-1 [Sy] U
print("[Sy]' = U^-1 Sy U =\\n", np.round(Sy_p, 4))
print("-> in the x-basis, Sy looks like (hbar/2)[[0,1],[1,0]]: same eigenvalues +-hbar/2")

f = np.array([0.6, 0.8j]); g = np.array([1/np.sqrt(2), -1/np.sqrt(2)])
print("<f|g> before:", np.vdot(f, g).round(6), " after U:", np.vdot(U @ f, U @ g).round(6))
print("-> unitary transformations conserve inner products (continuous symmetries!)")

# -- Zeeman splitting ----------------------------------------
muB = 5.7883818060e-5      # eV/T
g_e = 2.0023
for B in (0.5, 1.0, 5.0):
    dE = g_e * muB * B     # between ms = +-1/2
    print(f"B = {B:4.1f} T: Zeeman splitting g mu_B B = {dE:.3e} eV "
          f"(ESR frequency {dE/4.135667696e-15/1e9:.1f} GHz)")
`;

// ── python/wk04_maxwell_boltzmann.py ─────────────
export const PY_MAXWELL = `"""
Wk04 — Kinetic model & Maxwell-Boltzmann distribution
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Kinetic pressure: P V = (1/3) n M <v^2>  ->  v_rms = sqrt(3RT/M)
(2) Maxwell speed distribution
      f(v) = 4 pi (M/2 pi R T)^{3/2} v^2 exp(-M v^2 / 2RT)
    characteristic speeds  v_mp = sqrt(2RT/M) < v_mean = sqrt(8RT/piM)
                           < v_rms = sqrt(3RT/M)
(3) Equipartition -> heat capacity ladder: Cv = (f/2) R with accessible
    degrees of freedom f = 3 (trans) + 2 (rot) + 2 (vib) as T grows.

Run:  python wk04_maxwell_boltzmann.py
"""
import numpy as np
import matplotlib.pyplot as plt

trapz = getattr(np, "trapezoid", getattr(np, "trapz", None))
R = 8.314462618          # J/mol K

def f_speed(v, M, T):
    a = M / (2 * np.pi * R * T)
    return 4 * np.pi * a**1.5 * v**2 * np.exp(-M * v**2 / (2 * R * T))

def speeds(M, T):
    return (np.sqrt(2 * R * T / M),        # most probable
            np.sqrt(8 * R * T / (np.pi * M)),  # mean
            np.sqrt(3 * R * T / M))        # rms

# -- (1)(2) normalization + moments for N2 at 298 K ----------
M_N2, T = 0.0280134, 298.15
v = np.linspace(0, 3000, 60001)
fv = f_speed(v, M_N2, T)
vmp, vmean, vrms = speeds(M_N2, T)
print("N2 at 298 K:")
print(f"  int f dv        = {trapz(fv, v):.6f} (-> 1)")
print(f"  v_mp            = {vmp:7.1f} m/s  (numeric argmax {v[np.argmax(fv)]:.1f})")
print(f"  v_mean          = {vmean:7.1f} m/s  (numeric {trapz(v*fv, v):.1f})")
print(f"  v_rms           = {vrms:7.1f} m/s  (numeric {np.sqrt(trapz(v**2*fv, v)):.1f})")
print(f"  <KE> per mole   = {0.5*M_N2*trapz(v**2*fv, v):.1f} J = 3/2 RT = {1.5*R*T:.1f} J")
print(f"  ratio v_mp : v_mean : v_rms = 1 : {vmean/vmp:.4f} : {vrms/vmp:.4f} "
      f"(theory 1 : 1.1284 : 1.2247)\\n")

# -- plot distributions --------------------------------------
plt.figure(figsize=(11, 4.2))
plt.subplot(1, 2, 1)
for Tp in (100, 298, 1000):
    plt.plot(v[:20000], f_speed(v[:20000], M_N2, Tp), label=f"N$_2$, T = {Tp} K")
plt.xlabel("v [m/s]"); plt.ylabel("f(v)"); plt.legend()
plt.title("hotter -> broader & faster")
plt.subplot(1, 2, 2)
for Mi, lb in ((0.002016, "H$_2$"), (0.004003, "He"), (0.0280134, "N$_2$"), (0.1313, "Xe")):
    plt.plot(v, f_speed(v, Mi, 298.15), label=lb)
plt.xlabel("v [m/s]"); plt.legend(); plt.title("lighter -> faster (T = 298 K)")
plt.tight_layout(); plt.show()

# -- (3) equipartition heat-capacity ladder (diatomic) -------
print("accessible DOF f  ->  Cv = f/2 R      (diatomic gas, schematic)")
for f_dof, regime in ((3, "T < ~80 K   translation only"),
                      (5, "300 K       + rotation"),
                      (7, "T > ~3000 K + vibration")):
    print(f"  f = {f_dof}: Cv = {f_dof/2:.1f} R = {f_dof/2*R:6.2f} J/mol K   {regime}")
print("-> quantum energy spacing freezes DOF out: Cv steps 3/2R -> 5/2R -> 7/2R")
print("   (rotation/vibration quantization from Weeks 3-4 explains a GAS property!)")
`;

// ── python/wk04_transport.py ─────────────────────
export const PY_TRANSPORT = `"""
Wk04 — Transport properties of a perfect gas
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Collision kinetics:  z = sigma v_rel N/V,  lambda = kT/(sqrt2 sigma P)
    -> N2 at 1 atm, 25 C: lambda ~ 67 nm (the lecture's number)
(2) Transport coefficients from the same random walk:
      D  = (1/3) lambda v_mean            [m^2/s]
      k  = (1/3) lambda v_mean rho Cp ... kappa = (1/3) lambda v_mean
      eta= (1/3) lambda v_mean rho  (kinematic; mu = eta rho form in slides)
    Reynolds analogy: Sc = eta/D, Pr = eta/kappa, Le = kappa/D ~ O(1)
(3) Effusion (Knudsen): rate = P A0 / sqrt(2 pi m k T)
    -> lecture example: Cs at 500 K, 0.50 mm hole, 385 mg in 100 s
       P = sqrt(2 pi R T / M) dm/(A0 dt) = 8.7 kPa

Run:  python wk04_transport.py
"""
import numpy as np

kB = 1.380649e-23        # J/K
NA = 6.02214076e23
R = kB * NA

# collision cross sections from the lecture table [nm^2]
sigma = {"He": 0.21, "N2": 0.43, "CO2": 0.52, "C6H6": 0.88}
Mmol = {"He": 4.003e-3, "N2": 28.0134e-3, "CO2": 44.01e-3, "C6H6": 78.11e-3}

T, P = 298.15, 101325.0
print(f"gas    sigma[nm^2]  v_mean[m/s]  lambda[nm]   z[1/s]")
for g in ("He", "N2", "CO2", "C6H6"):
    s = sigma[g] * 1e-18
    vmean = np.sqrt(8 * R * T / (np.pi * Mmol[g]))
    lam = kB * T / (np.sqrt(2) * s * P)
    z = vmean / lam
    print(f"{g:5s}  {sigma[g]:10.2f}  {vmean:11.1f}  {lam*1e9:10.1f}  {z:.3e}")
print("-> N2: lambda ~ 67 nm at 1 atm — ~200x the molecular size; "
      "each molecule collides ~7 billion times per second\\n")

# -- (2) transport coefficients for N2 ------------------------
s = sigma["N2"] * 1e-18
vmean = np.sqrt(8 * R * T / (np.pi * Mmol["N2"]))
lam = kB * T / (np.sqrt(2) * s * P)
n_dens = P / (kB * T)                     # molecules / m^3
rho = n_dens * Mmol["N2"] / NA            # kg/m^3
D = lam * vmean / 3
eta_kin = D                               # same 1/3 lambda v for kinematic visc.
mu_dyn = rho * eta_kin                    # dynamic viscosity
CVm = 2.5 * R                             # diatomic near RT
kth = (1/3) * vmean * lam * n_dens / NA * CVm   # = 1/3 v lambda [J] Cv,m
print(f"N2 (298 K, 1 atm):")
print(f"  D (self-diffusion) = {D*1e5:.2f} x 10^-5 m^2/s  (exp ~2.0 x 10^-5)")
print(f"  mu (dyn viscosity) = {mu_dyn*1e6:.1f} uPa s      (exp ~17.9 uPa s)")
print(f"  k (thermal cond.)  = {kth*1e3:.1f} mW/m K      (exp ~25.8 mW/m K)")
print(f"  Sc = mu/(rho D)    = {mu_dyn/(rho*D):.2f},  Pr ~ Sc ~ 1 (Reynolds analogy)")
print("  (order-of-magnitude agreement: the kinetic model earns its keep)\\n")

# pressure independence of viscosity! (lambda ~ 1/P but n ~ P)
print("mu at 0.1, 1, 10 atm:", end=" ")
for Pfac in (0.1, 1.0, 10.0):
    lam_ = kB * T / (np.sqrt(2) * s * (P * Pfac))
    rho_ = (P * Pfac / (kB * T)) * Mmol["N2"] / NA
    print(f"{rho_ * lam_ * vmean / 3 * 1e6:.1f}", end=" ")
print("uPa s -> INDEPENDENT of P (Maxwell's surprise, verified by experiment)\\n")

# -- (3) effusion: Cs vapor-pressure example ------------------
M_Cs = 132.905e-3
T_Cs = 500.0
d_hole = 0.50e-3
A0 = np.pi * (d_hole / 2)**2
dm, dt = 385e-6, 100.0
P_Cs = np.sqrt(2 * np.pi * R * T_Cs / M_Cs) * dm / (A0 * dt)
print(f"Cs effusion (lecture example): A0 = {A0*1e6:.3f} mm^2")
print(f"  P = sqrt(2 pi R T / M) dm/(A0 dt) = {P_Cs/1e3:.2f} kPa  (lecture: 8.7 kPa)")
Zw = P_Cs / np.sqrt(2 * np.pi * (M_Cs / NA) * kB * T_Cs)
print(f"  collision flux Zw = {Zw:.3e} m^-2 s^-1 = 1/4 n v_mean")
`;

// ── matlab/wk04_hydrogen_spectrum.m ──────────────
export const ML_HATOM = `% Wk04 - Hydrogen atom: Bohr model, spectral series, degeneracy
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% E_n = -13.606/n^2 eV;  lambda = hc/dE;  degeneracy 2n^2.

RY = 13.605693; HC = 1239.841984; A0 = 0.0529177;   % eV, eV nm, nm
E = @(n) -RY ./ n.^2;

fprintf(' n   r_n [nm]    E_n [eV]\\n');
for n = 1:5
    fprintf('%2d  %9.4f  %9.4f\\n', n, n^2*A0, E(n));
end

names = {'Lyman', 'Balmer', 'Paschen', 'Brackett', 'Pfund'};
fprintf('\\nseries    n2->n1   dE [eV]   lambda [nm]\\n');
for n1 = 1:5
    for n2 = n1+1 : n1+3
        dE = E(n2) - E(n1);
        fprintf('%-9s %d->%d   %7.4f   %9.1f\\n', names{n1}, n2, n1, dE, HC/dE);
    end
end
fprintf('Balmer limit: %.1f nm\\n\\n', HC/(0 - E(2)));

fprintf(' n   #states |n,l,m,s>   2n^2\\n');
for n = 1:4
    cnt = 0;
    for l = 0:n-1, cnt = cnt + 2*(2*l+1); end
    fprintf('%2d  %18d  %5d\\n', n, cnt, 2*n^2);
end

figure(1);
subplot(1,2,1); hold on;
for n = 1:7
    yline(E(n), 'Color', [0 0.5 0.5]); text(0.92, E(n), sprintf('n=%d', n));
end
ylabel('E [eV]'); title('E = -13.6/n^2 eV'); xticks([]);
subplot(1,2,2); hold on;
for n2 = 3:7
    lam = HC/(E(n2) - E(2));
    xline(lam, 'LineWidth', 2); text(lam, 1.02, sprintf('%d\\\\rightarrow2', n2));
end
xlim([380 700]); ylim([0 1.15]); xlabel('wavelength [nm]');
title('Balmer series (visible)'); yticks([]);
`;

// ── matlab/wk04_spin_measurement.m ───────────────
export const ML_SPIN = `% Wk04 - Spin-1/2: Pauli algebra, sequential measurement, unitarity
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% hbar = 1. Checks [Sx,Sy]=i Sz, Stern-Gerlach chain, unitary basis change.

hbar = 1; I2 = eye(2);
sx = [0 1; 1 0]; sy = [0 -1i; 1i 0]; sz = [1 0; 0 -1];
Sx = hbar/2*sx; Sy = hbar/2*sy; Sz = hbar/2*sz;
S2 = Sx^2 + Sy^2 + Sz^2;

fprintf('||[Sx,Sy]-i hbar Sz|| = %.2e\\n', max(abs(Sx*Sy-Sy*Sx - 1i*hbar*Sz), [], 'all'));
fprintf('||[S^2,Sx]||          = %.2e\\n', max(abs(S2*Sx-Sx*S2), [], 'all'));
fprintf('S^2 = 3/4 I ? %d;  eig(Sx) = %s\\n\\n', isequal(round(S2,10), 0.75*I2), ...
        mat2str(round(eig(Sx)', 4)));

% sequential Stern-Gerlach (Monte Carlo)
rng(42); N = 1e5;
up_z = [1; 0]; up_x = [1; 1]/sqrt(2);
p1 = abs(up_x' * up_z)^2;             % P(Sx=+ | up_z)
got_x = rand(N,1) < p1;
p2 = abs(up_z' * up_x)^2;             % P(Sz=+ | up_x)
got_z = rand(sum(got_x),1) < p2;
fprintf('P(Sx=+h/2 | up_z): theory 0.5, MC %.4f\\n', mean(got_x));
fprintf('P(Sz=+h/2 | up_x): theory 0.5, MC %.4f\\n', mean(got_z));
fprintf('-> measuring Sx erased the known Sz value (incompatible observables)\\n\\n');

% unitary basis change (lecture: [Sy]'' = U^-1 [Sy] U)
dn_x = [1; -1]/sqrt(2);
U = [up_x, dn_x];
fprintf('U''*U = I ? %d\\n', isequal(round(U'*U, 10), I2));
disp('[Sy]'' = U^-1 Sy U ='); disp(round(U' * Sy * U, 4));
f = [0.6; 0.8i]; g = [1; -1]/sqrt(2);
fprintf('<f|g> before %s  after %s (conserved)\\n\\n', ...
        num2str(f'*g), num2str((U*f)'*(U*g)));

% Zeeman splitting
muB = 5.7883818060e-5; ge = 2.0023;   % eV/T
for B = [0.5 1 5]
    dE = ge*muB*B;
    fprintf('B = %.1f T: splitting %.3e eV (ESR %.1f GHz)\\n', ...
            B, dE, dE/4.135667696e-15/1e9);
end
`;

// ── matlab/wk04_maxwell_boltzmann.m ──────────────
export const ML_MAXWELL = `% Wk04 - Kinetic model & Maxwell-Boltzmann distribution
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% f(v) = 4 pi (M/2piRT)^{3/2} v^2 exp(-Mv^2/2RT); v_mp < v_mean < v_rms.

R = 8.314462618;
fspeed = @(v, M, T) 4*pi*(M/(2*pi*R*T)).^1.5 .* v.^2 .* exp(-M*v.^2/(2*R*T));

M = 0.0280134; T = 298.15;             % N2
v = linspace(0, 3000, 60001);
fv = fspeed(v, M, T);
vmp = sqrt(2*R*T/M); vmean = sqrt(8*R*T/(pi*M)); vrms = sqrt(3*R*T/M);
fprintf('N2 at 298 K:\\n');
fprintf('  int f dv = %.6f\\n', trapz(v, fv));
fprintf('  v_mp = %.1f, v_mean = %.1f (num %.1f), v_rms = %.1f (num %.1f) m/s\\n', ...
        vmp, vmean, trapz(v, v.*fv), vrms, sqrt(trapz(v, v.^2.*fv)));
fprintf('  <KE>/mol = %.1f J = 3/2 RT = %.1f J\\n', ...
        0.5*M*trapz(v, v.^2.*fv), 1.5*R*T);
fprintf('  ratios 1 : %.4f : %.4f (theory 1 : 1.1284 : 1.2247)\\n\\n', vmean/vmp, vrms/vmp);

figure(1);
subplot(1,2,1); hold on;
for Tp = [100 298 1000]
    plot(v(1:20000), fspeed(v(1:20000), M, Tp), 'DisplayName', sprintf('T = %d K', Tp));
end
xlabel('v [m/s]'); legend; title('N_2: hotter -> broader');
subplot(1,2,2); hold on;
gases = {0.002016 'H_2'; 0.004003 'He'; 0.0280134 'N_2'; 0.1313 'Xe'};
for i = 1:4
    plot(v, fspeed(v, gases{i,1}, 298.15), 'DisplayName', gases{i,2});
end
xlabel('v [m/s]'); legend; title('lighter -> faster (298 K)');

% equipartition ladder
fprintf('DOF f -> Cv = f/2 R:\\n');
for fd = [3 5 7]
    fprintf('  f = %d: Cv = %.2f J/mol K\\n', fd, fd/2*R);
end
fprintf('-> Cv(T) of H2 steps 3/2R -> 5/2R -> 7/2R (quantum freeze-out)\\n');
`;

// ── matlab/wk04_transport.m ──────────────────────
export const ML_TRANSPORT = `% Wk04 - Transport properties of a perfect gas
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% lambda = kT/(sqrt2 sigma P); D = 1/3 lambda v; effusion (Cs example).

kB = 1.380649e-23; NA = 6.02214076e23; R = kB*NA;
gases = {'He' 0.21 4.003e-3; 'N2' 0.43 28.0134e-3; ...
         'CO2' 0.52 44.01e-3; 'C6H6' 0.88 78.11e-3};
T = 298.15; P = 101325;

fprintf('gas    sigma[nm2]  v_mean[m/s]  lambda[nm]    z[1/s]\\n');
for i = 1:4
    s = gases{i,2}*1e-18; M = gases{i,3};
    vmean = sqrt(8*R*T/(pi*M));
    lam = kB*T/(sqrt(2)*s*P);
    fprintf('%-5s  %9.2f  %11.1f  %10.1f  %9.3e\\n', ...
            gases{i,1}, gases{i,2}, vmean, lam*1e9, vmean/lam);
end
fprintf('-> N2: lambda ~ 67 nm at 1 atm\\n\\n');

% transport coefficients for N2
s = 0.43e-18; M = 28.0134e-3;
vmean = sqrt(8*R*T/(pi*M));
lam = kB*T/(sqrt(2)*s*P);
n = P/(kB*T); rho = n*M/NA;
D = lam*vmean/3; mu = rho*D;
kth = vmean*lam*n/NA*2.5*R/3;
fprintf('N2: D = %.2e m2/s, mu = %.1f uPa s, k = %.1f mW/m K, Sc = %.2f\\n', ...
        D, mu*1e6, kth*1e3, mu/(rho*D));

% viscosity is independent of P
fprintf('mu at 0.1/1/10 atm: ');
for pf = [0.1 1 10]
    lam_ = kB*T/(sqrt(2)*s*P*pf); rho_ = (P*pf/(kB*T))*M/NA;
    fprintf('%.1f ', rho_*lam_*vmean/3*1e6);
end
fprintf('uPa s -> constant!\\n\\n');

% Cs effusion example (lecture): expect 8.7 kPa
M_Cs = 132.905e-3; T_Cs = 500; A0 = pi*(0.25e-3)^2;
P_Cs = sqrt(2*pi*R*T_Cs/M_Cs) * 385e-6/(A0*100);
fprintf('Cs vapor pressure from effusion: %.2f kPa (lecture 8.7 kPa)\\n', P_Cs/1e3);
`;

// ── julia/wk04_hydrogen_spectrum.jl ──────────────
export const JL_HATOM = `# Wk04 - Hydrogen atom: Bohr model, spectral series, degeneracy
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
# E_n = -13.606/n^2 eV; lambda = hc/dE; degeneracy 2n^2.
using Plots, Printf

const RY = 13.605693; const HC = 1239.841984; const A0 = 0.0529177
E(n) = -RY / n^2

@printf(" n   r_n [nm]    E_n [eV]\\n")
for n in 1:5
    @printf("%2d  %9.4f  %9.4f\\n", n, n^2 * A0, E(n))
end

names = ["Lyman", "Balmer", "Paschen", "Brackett", "Pfund"]
@printf("\\nseries    n2->n1   dE [eV]   lambda [nm]\\n")
for n1 in 1:5, n2 in n1+1:n1+3
    dE = E(n2) - E(n1)
    @printf("%-9s %d->%d   %7.4f   %9.1f\\n", names[n1], n2, n1, dE, HC / dE)
end
@printf("Balmer limit: %.1f nm\\n\\n", HC / (0 - E(2)))

@printf(" n   #states |n,l,m,s>   2n^2\\n")
for n in 1:4
    cnt = sum(2 * (2l + 1) for l in 0:n-1)
    @printf("%2d  %18d  %5d\\n", n, cnt, 2n^2)
end

p1 = plot(title="E = -13.6/n² eV", ylabel="E [eV]", xticks=false, legend=false)
for n in 1:7
    hline!(p1, [E(n)], c=:teal, lw=1.4)
    annotate!(p1, 0.9, E(n) + 0.25, text("n=$n", 7))
end
p2 = plot(title="Balmer series (visible)", xlabel="wavelength [nm]",
          xlims=(380, 700), ylims=(0, 1.15), yticks=false, legend=false)
for n2 in 3:7
    lam = HC / (E(n2) - E(2))
    vline!(p2, [lam], lw=2.5)
    annotate!(p2, lam, 1.07, text("$(n2)→2", 7))
end
display(plot(p1, p2, layout=(1, 2), size=(1000, 420)))
readline()
`;

// ── julia/wk04_spin_measurement.jl ───────────────
export const JL_SPIN = `# Wk04 - Spin-1/2: Pauli algebra, sequential measurement, unitarity
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
# hbar = 1. [Sx,Sy] = i Sz; Stern-Gerlach chain; unitary basis change.
using LinearAlgebra, Random, Printf

const ħ = 1.0
sx = ComplexF64[0 1; 1 0]; sy = ComplexF64[0 -im; im 0]; sz = ComplexF64[1 0; 0 -1]
Sx, Sy, Sz = ħ/2 * sx, ħ/2 * sy, ħ/2 * sz
S2 = Sx^2 + Sy^2 + Sz^2

comm(A, B) = A * B - B * A
@printf("||[Sx,Sy]-i hbar Sz|| = %.2e\\n", maximum(abs.(comm(Sx, Sy) - im * ħ * Sz)))
@printf("||[S^2,Sx]||          = %.2e\\n", maximum(abs.(comm(S2, Sx))))
println("S^2 = 3/4 I ? ", S2 ≈ 0.75 * ħ^2 * I)
println("eig(Sx) = ", round.(eigvals(Hermitian(Sx)), digits=4), "\\n")

# sequential Stern-Gerlach Monte Carlo
Random.seed!(42)
N = 100_000
up_z = ComplexF64[1, 0]; up_x = ComplexF64[1, 1] / sqrt(2); dn_x = ComplexF64[1, -1] / sqrt(2)
p1 = abs2(dot(up_x, up_z))
got_x = rand(N) .< p1
p2 = abs2(dot(up_z, up_x))
got_z = rand(count(got_x)) .< p2
@printf("P(Sx=+h/2 | up_z): theory 0.5, MC %.4f\\n", sum(got_x) / N)
@printf("P(Sz=+h/2 | up_x): theory 0.5, MC %.4f\\n", sum(got_z) / count(got_x))
println("-> measuring Sx erased the known Sz value (incompatible observables)\\n")

# unitary basis change
U = [up_x dn_x]
println("U'U = I ? ", U' * U ≈ I)
println("[Sy]' = U^-1 Sy U = ", round.(U' * Sy * U, digits=4))
f = ComplexF64[0.6, 0.8im]; g = ComplexF64[1, -1] / sqrt(2)
@printf("<f|g> before %s after %s (conserved)\\n\\n",
        string(round(dot(f, g), digits=6)), string(round(dot(U * f, U * g), digits=6)))

# Zeeman splitting
const μB = 5.7883818060e-5; const ge = 2.0023
for B in (0.5, 1.0, 5.0)
    dE = ge * μB * B
    @printf("B = %.1f T: splitting %.3e eV (ESR %.1f GHz)\\n", B, dE, dE / 4.135667696e-15 / 1e9)
end
`;

// ── julia/wk04_maxwell_boltzmann.jl ──────────────
export const JL_MAXWELL = `# Wk04 - Kinetic model & Maxwell-Boltzmann distribution
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
# f(v) = 4pi (M/2piRT)^{3/2} v^2 exp(-Mv^2/2RT); v_mp < v_mean < v_rms.
using Plots, Printf

const R = 8.314462618
fspeed(v, M, T) = 4π * (M / (2π * R * T))^1.5 * v^2 * exp(-M * v^2 / (2R * T))
trapz(x, y) = sum(0.5 .* (y[1:end-1] .+ y[2:end]) .* diff(x))

M, T = 0.0280134, 298.15                 # N2
v = collect(range(0, 3000, length=60001))
fv = fspeed.(v, M, T)
vmp = sqrt(2R * T / M); vmean = sqrt(8R * T / (π * M)); vrms = sqrt(3R * T / M)
println("N2 at 298 K:")
@printf("  int f dv = %.6f\\n", trapz(v, fv))
@printf("  v_mp = %.1f, v_mean = %.1f (num %.1f), v_rms = %.1f (num %.1f) m/s\\n",
        vmp, vmean, trapz(v, v .* fv), vrms, sqrt(trapz(v, v .^ 2 .* fv)))
@printf("  <KE>/mol = %.1f J = 3/2 RT = %.1f J\\n",
        0.5M * trapz(v, v .^ 2 .* fv), 1.5R * T)
@printf("  ratios 1 : %.4f : %.4f (theory 1 : 1.1284 : 1.2247)\\n\\n", vmean / vmp, vrms / vmp)

p1 = plot(xlabel="v [m/s]", title="N₂: hotter → broader")
for Tp in (100, 298, 1000)
    plot!(p1, v[1:20000], fspeed.(v[1:20000], M, Tp), lw=1.5, label="T = $Tp K")
end
p2 = plot(xlabel="v [m/s]", title="lighter → faster (298 K)")
for (Mi, lb) in ((0.002016, "H₂"), (0.004003, "He"), (0.0280134, "N₂"), (0.1313, "Xe"))
    plot!(p2, v, fspeed.(v, Mi, 298.15), lw=1.5, label=lb)
end
display(plot(p1, p2, layout=(1, 2), size=(1000, 400)))

println("DOF f -> Cv = f/2 R:")
for fd in (3, 5, 7)
    @printf("  f = %d: Cv = %.2f J/mol K\\n", fd, fd / 2 * R)
end
println("-> Cv(T) of H2 steps 3/2R -> 5/2R -> 7/2R (quantum freeze-out)")
readline()
`;

// ── julia/wk04_transport.jl ──────────────────────
export const JL_TRANSPORT = `# Wk04 - Transport properties of a perfect gas
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
# lambda = kT/(sqrt2 sigma P); D = 1/3 lambda v; effusion (Cs example).
using Printf

const kB = 1.380649e-23; const NA = 6.02214076e23; const R = kB * NA
gases = [("He", 0.21, 4.003e-3), ("N2", 0.43, 28.0134e-3),
         ("CO2", 0.52, 44.01e-3), ("C6H6", 0.88, 78.11e-3)]
T, P = 298.15, 101325.0

@printf("gas    sigma[nm2]  v_mean[m/s]  lambda[nm]    z[1/s]\\n")
for (g, sn, M) in gases
    s = sn * 1e-18
    vmean = sqrt(8R * T / (π * M))
    lam = kB * T / (sqrt(2) * s * P)
    @printf("%-5s  %9.2f  %11.1f  %10.1f  %9.3e\\n", g, sn, vmean, lam * 1e9, vmean / lam)
end
println("-> N2: lambda ~ 67 nm at 1 atm\\n")

# transport coefficients for N2
s = 0.43e-18; M = 28.0134e-3
vmean = sqrt(8R * T / (π * M))
lam = kB * T / (sqrt(2) * s * P)
n = P / (kB * T); ρ = n * M / NA
D = lam * vmean / 3; μ = ρ * D
kth = vmean * lam * n / NA * 2.5R / 3
@printf("N2: D = %.2e m2/s, mu = %.1f uPa s, k = %.1f mW/m K, Sc = %.2f\\n",
        D, μ * 1e6, kth * 1e3, μ / (ρ * D))

print("mu at 0.1/1/10 atm: ")
for pf in (0.1, 1.0, 10.0)
    lam_ = kB * T / (sqrt(2) * s * P * pf)
    ρ_ = (P * pf / (kB * T)) * M / NA
    @printf("%.1f ", ρ_ * lam_ * vmean / 3 * 1e6)
end
println("uPa s -> constant! (Maxwell's surprise)\\n")

# Cs effusion example (lecture): expect 8.7 kPa
M_Cs = 132.905e-3; T_Cs = 500.0; A0 = π * (0.25e-3)^2
P_Cs = sqrt(2π * R * T_Cs / M_Cs) * 385e-6 / (A0 * 100)
@printf("Cs vapor pressure from effusion: %.2f kPa (lecture 8.7 kPa)\\n", P_Cs / 1e3)
`;

// ── cpp/wk04_hydrogen_spectrum.cpp ───────────────
export const CPP_HATOM = `// Wk04 - Hydrogen atom: Bohr model, spectral series, degeneracy
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk04_hydrogen_spectrum.cpp -o wk04_hydrogen_spectrum
// E_n = -13.606/n^2 eV; lambda = hc/dE; degeneracy 2n^2. Writes balmer.csv.
#include <cmath>
#include <cstdio>

const double RY = 13.605693;      // eV
const double HC = 1239.841984;    // eV nm
const double A0 = 0.0529177;      // nm

double E(int n) { return -RY / (n * n); }

int main() {
    std::printf(" n   r_n [nm]    E_n [eV]\\n");
    for (int n = 1; n <= 5; ++n)
        std::printf("%2d  %9.4f  %9.4f\\n", n, n * n * A0, E(n));

    const char* names[] = {"Lyman", "Balmer", "Paschen", "Brackett", "Pfund"};
    std::printf("\\nseries    n2->n1   dE [eV]   lambda [nm]\\n");
    for (int n1 = 1; n1 <= 5; ++n1)
        for (int n2 = n1 + 1; n2 <= n1 + 3; ++n2) {
            double dE = E(n2) - E(n1);
            std::printf("%-9s %d->%d   %7.4f   %9.1f\\n", names[n1-1], n2, n1, dE, HC / dE);
        }
    std::printf("Balmer limit: %.1f nm\\n\\n", HC / (0 - E(2)));

    std::printf(" n   #states |n,l,m,s>   2n^2\\n");
    for (int n = 1; n <= 4; ++n) {
        int cnt = 0;
        for (int l = 0; l < n; ++l) cnt += 2 * (2 * l + 1);
        std::printf("%2d  %18d  %5d\\n", n, cnt, 2 * n * n);
    }
    std::printf("-> shells hold 2, 8, 18, 32 electrons\\n");

    FILE* f = std::fopen("balmer.csv", "w");
    std::fprintf(f, "n2,dE_eV,lambda_nm\\n");
    for (int n2 = 3; n2 <= 9; ++n2)
        std::fprintf(f, "%d,%.5f,%.2f\\n", n2, E(n2) - E(2), HC / (E(n2) - E(2)));
    std::fclose(f);
    std::printf("wrote balmer.csv (H-alpha 656 nm ... series limit 365 nm)\\n");
    return 0;
}
`;

// ── cpp/wk04_spin_measurement.cpp ────────────────
export const CPP_SPIN = `// Wk04 - Spin-1/2: Pauli algebra, sequential measurement, unitarity
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk04_spin_measurement.cpp -o wk04_spin_measurement
// hbar = 1. 2x2 complex matrices: [Sx,Sy] = i Sz; SG chain; unitary check.
#include <cmath>
#include <cstdio>
#include <complex>
#include <random>
#include <array>

using C = std::complex<double>;
using M2 = std::array<std::array<C, 2>, 2>;

M2 mul(const M2& A, const M2& B) {
    M2 R{};
    for (int i = 0; i < 2; ++i)
        for (int j = 0; j < 2; ++j)
            for (int k = 0; k < 2; ++k) R[i][j] += A[i][k] * B[k][j];
    return R;
}
M2 sub(const M2& A, const M2& B) {
    M2 R{};
    for (int i = 0; i < 2; ++i)
        for (int j = 0; j < 2; ++j) R[i][j] = A[i][j] - B[i][j];
    return R;
}
double maxabs(const M2& A) {
    double m = 0;
    for (auto& r : A) for (auto& v : r) m = std::max(m, std::abs(v));
    return m;
}

int main() {
    const double hbar = 1.0;
    const C i(0, 1);
    M2 Sx{{{C(0), C(0.5)}, {C(0.5), C(0)}}};
    M2 Sy{{{C(0), C(0, -0.5)}, {C(0, 0.5), C(0)}}};
    M2 Sz{{{C(0.5), C(0)}, {C(0), C(-0.5)}}};

    // [Sx,Sy] - i Sz
    M2 comm = sub(mul(Sx, Sy), mul(Sy, Sx));
    M2 iSz{};
    for (int a = 0; a < 2; ++a) for (int b = 0; b < 2; ++b) iSz[a][b] = i * hbar * Sz[a][b];
    std::printf("||[Sx,Sy] - i hbar Sz|| = %.2e\\n", maxabs(sub(comm, iSz)));

    M2 S2 = mul(Sx, Sx);
    M2 t = mul(Sy, Sy);
    for (int a = 0; a < 2; ++a) for (int b = 0; b < 2; ++b) S2[a][b] += t[a][b];
    t = mul(Sz, Sz);
    for (int a = 0; a < 2; ++a) for (int b = 0; b < 2; ++b) S2[a][b] += t[a][b];
    std::printf("S^2 diag = %.4f, %.4f (-> 3/4 hbar^2)\\n\\n",
                S2[0][0].real(), S2[1][1].real());

    // sequential Stern-Gerlach Monte Carlo: |up_z> -> Sx -> Sz
    std::mt19937 rng(42);
    std::uniform_real_distribution<double> uni(0, 1);
    const int N = 100000;
    // P(Sx=+ | up_z) = |<up_x|up_z>|^2 = 1/2; then P(Sz=+ | up_x) = 1/2
    int nx = 0, nz = 0, nxTot = 0;
    for (int k = 0; k < N; ++k) {
        if (uni(rng) < 0.5) {            // collapsed to |up_x>
            ++nx; ++nxTot;
            if (uni(rng) < 0.5) ++nz;    // z-measurement is 50/50 AGAIN
        }
    }
    std::printf("P(Sx=+h/2 | up_z): theory 0.5, MC %.4f\\n", double(nx) / N);
    std::printf("P(Sz=+h/2 | up_x): theory 0.5, MC %.4f\\n", double(nz) / nxTot);
    std::printf("-> measuring Sx erased the known Sz value\\n\\n");

    // unitary basis change U = [up_x dn_x]; [Sy]' = U^dag Sy U
    const double s2 = 1 / std::sqrt(2.0);
    M2 U{{{C(s2), C(s2)}, {C(s2), C(-s2)}}};
    M2 Ud{{{C(s2), C(s2)}, {C(s2), C(-s2)}}};   // real symmetric here
    M2 UdU = mul(Ud, U);
    std::printf("U^dag U = [[%.3f,%.3f],[%.3f,%.3f]] (-> I)\\n",
                UdU[0][0].real(), UdU[0][1].real(), UdU[1][0].real(), UdU[1][1].real());
    M2 Syp = mul(Ud, mul(Sy, U));
    std::printf("[Sy]' = [[%.3f%+.3fi, %.3f%+.3fi],[%.3f%+.3fi, %.3f%+.3fi]]\\n\\n",
                Syp[0][0].real(), Syp[0][0].imag(), Syp[0][1].real(), Syp[0][1].imag(),
                Syp[1][0].real(), Syp[1][0].imag(), Syp[1][1].real(), Syp[1][1].imag());

    // Zeeman splitting
    const double muB = 5.7883818060e-5, ge = 2.0023, h_eVs = 4.135667696e-15;
    for (double B : {0.5, 1.0, 5.0})
        std::printf("B = %.1f T: splitting %.3e eV (ESR %.1f GHz)\\n",
                    B, ge * muB * B, ge * muB * B / h_eVs / 1e9);
    return 0;
}
`;

// ── cpp/wk04_maxwell_boltzmann.cpp ───────────────
export const CPP_MAXWELL = `// Wk04 - Kinetic model & Maxwell-Boltzmann distribution
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk04_maxwell_boltzmann.cpp -o wk04_maxwell_boltzmann
// f(v) = 4pi (M/2piRT)^{3/2} v^2 exp(-Mv^2/2RT). Writes maxwell.csv.
#include <cmath>
#include <cstdio>
#include <initializer_list>

const double R = 8.314462618;

double fspeed(double v, double M, double T) {
    double a = M / (2 * M_PI * R * T);
    return 4 * M_PI * std::pow(a, 1.5) * v * v * std::exp(-M * v * v / (2 * R * T));
}

int main() {
    const double M = 0.0280134, T = 298.15;    // N2
    const int N = 60001;
    const double vmax = 3000.0, h = vmax / (N - 1);

    double s0 = 0, s1 = 0, s2 = 0;             // trapezoid moments
    for (int k = 0; k < N; ++k) {
        double v = k * h, f = fspeed(v, M, T);
        double w = (k == 0 || k == N - 1) ? 0.5 : 1.0;
        s0 += w * f; s1 += w * v * f; s2 += w * v * v * f;
    }
    s0 *= h; s1 *= h; s2 *= h;

    double vmp = std::sqrt(2 * R * T / M);
    double vmean = std::sqrt(8 * R * T / (M_PI * M));
    double vrms = std::sqrt(3 * R * T / M);
    std::printf("N2 at 298 K:\\n");
    std::printf("  int f dv = %.6f (-> 1)\\n", s0);
    std::printf("  v_mp = %.1f, v_mean = %.1f (num %.1f), v_rms = %.1f (num %.1f) m/s\\n",
                vmp, vmean, s1, vrms, std::sqrt(s2));
    std::printf("  <KE>/mol = %.1f J = 3/2 RT = %.1f J\\n", 0.5 * M * s2, 1.5 * R * T);
    std::printf("  ratios 1 : %.4f : %.4f (theory 1 : 1.1284 : 1.2247)\\n\\n",
                vmean / vmp, vrms / vmp);

    FILE* f = std::fopen("maxwell.csv", "w");
    std::fprintf(f, "v,f100,f298,f1000\\n");
    for (int k = 0; k <= 300; ++k) {
        double v = 2500.0 * k / 300;
        std::fprintf(f, "%.1f,%.6e,%.6e,%.6e\\n", v,
                     fspeed(v, M, 100), fspeed(v, M, 298.15), fspeed(v, M, 1000));
    }
    std::fclose(f);
    std::printf("wrote maxwell.csv (N2 at 100/298/1000 K)\\n\\n");

    std::printf("DOF f -> Cv = f/2 R:\\n");
    for (int fd : {3, 5, 7})
        std::printf("  f = %d: Cv = %.2f J/mol K\\n", fd, fd / 2.0 * R);
    std::printf("-> H2's Cv(T) steps 3/2R -> 5/2R -> 7/2R (quantum freeze-out)\\n");
    return 0;
}
`;

// ── cpp/wk04_transport.cpp ───────────────────────
export const CPP_TRANSPORT = `// Wk04 - Transport properties of a perfect gas
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk04_transport.cpp -o wk04_transport
// lambda = kT/(sqrt2 sigma P); D = 1/3 lambda v; effusion (Cs example).
#include <cmath>
#include <cstdio>
#include <initializer_list>

const double kB = 1.380649e-23, NA = 6.02214076e23;
const double R = kB * NA;

int main() {
    struct Gas { const char* name; double sigma_nm2, M; };
    const Gas gases[] = {{"He", 0.21, 4.003e-3}, {"N2", 0.43, 28.0134e-3},
                         {"CO2", 0.52, 44.01e-3}, {"C6H6", 0.88, 78.11e-3}};
    const double T = 298.15, P = 101325.0;

    std::printf("gas    sigma[nm2]  v_mean[m/s]  lambda[nm]    z[1/s]\\n");
    for (auto& g : gases) {
        double s = g.sigma_nm2 * 1e-18;
        double vmean = std::sqrt(8 * R * T / (M_PI * g.M));
        double lam = kB * T / (std::sqrt(2.0) * s * P);
        std::printf("%-5s  %9.2f  %11.1f  %10.1f  %9.3e\\n",
                    g.name, g.sigma_nm2, vmean, lam * 1e9, vmean / lam);
    }
    std::printf("-> N2: lambda ~ 67 nm at 1 atm (the lecture's number)\\n\\n");

    // transport coefficients for N2
    double s = 0.43e-18, M = 28.0134e-3;
    double vmean = std::sqrt(8 * R * T / (M_PI * M));
    double lam = kB * T / (std::sqrt(2.0) * s * P);
    double n = P / (kB * T), rho = n * M / NA;
    double D = lam * vmean / 3, mu = rho * D;
    double kth = vmean * lam * n / NA * 2.5 * R / 3;
    std::printf("N2: D = %.2e m2/s, mu = %.1f uPa s, k = %.1f mW/m K, Sc = %.2f\\n",
                D, mu * 1e6, kth * 1e3, mu / (rho * D));

    std::printf("mu at 0.1/1/10 atm: ");
    for (double pf : {0.1, 1.0, 10.0}) {
        double lam_ = kB * T / (std::sqrt(2.0) * s * P * pf);
        double rho_ = (P * pf / (kB * T)) * M / NA;
        std::printf("%.1f ", rho_ * lam_ * vmean / 3 * 1e6);
    }
    std::printf("uPa s -> INDEPENDENT of pressure (Maxwell's surprise)\\n\\n");

    // Cs effusion example (lecture): expect 8.7 kPa
    double M_Cs = 132.905e-3, T_Cs = 500.0;
    double A0 = M_PI * 0.25e-3 * 0.25e-3;
    double P_Cs = std::sqrt(2 * M_PI * R * T_Cs / M_Cs) * 385e-6 / (A0 * 100.0);
    std::printf("Cs vapor pressure from effusion: %.2f kPa (lecture 8.7 kPa)\\n",
                P_Cs / 1e3);
    return 0;
}
`;
