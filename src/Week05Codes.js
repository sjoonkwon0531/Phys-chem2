/* ============================================================
   Week05Codes.js — Physical Chemistry 2, Week 5
   Raw code samples: Intermolecular Forces & Liquids
   - 4 topics: dipole_polarization, vdw_forces, lj_md, capillarity
   - 4 languages: Python, MATLAB, Julia, C++
   Imported by Week05App.jsx > RawCodes tab.
   Auto-generated from codes/ — edit the standalone files, then regenerate.
   ============================================================ */

// ── python/wk05_dipole_polarization.py ───────────
export const PY_DIPOLE = `"""
Wk05 — Dipole moments, polarizability & the Debye equation
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Vector addition of bond dipoles:
      mu_res = 2 mu1 cos(theta/2)
    -> predicts the dichlorobenzene isomers (ortho/meta/para) from the
       chlorobenzene value mu1 = 1.57 D alone.
(2) Debye equation & molar polarization:
      P_m = (N_A/3 eps0) (alpha + mu^2/3kT),  (eps_r-1)/(eps_r+2) = rho P_m / M
    A plot of P_m vs 1/T is a LINE: slope -> mu, intercept -> alpha.
(3) Clausius-Mossotti (nonpolar): predicts eps_r and n = sqrt(eps_r)
    for CCl4 from its polarizability volume alone -> n ~ 1.46 (exp 1.4607!)

Run:  python wk05_dipole_polarization.py
"""
import numpy as np
import matplotlib.pyplot as plt

EPS0 = 8.8541878128e-12       # F/m
KB = 1.380649e-23
NA = 6.02214076e23
DEBYE = 3.33564e-30           # C m

# -- (1) dichlorobenzene isomers ------------------------------
mu1 = 1.57                    # D, chlorobenzene (one C-Cl "arm")
print("isomer   angle   mu_calc [D]   mu_obs [D]")
for name, th, obs in (("ortho", 60, 2.25), ("meta", 120, 1.48), ("para", 180, 0.0)):
    mu = 2 * mu1 * np.cos(np.radians(th) / 2)
    print(f"{name:6s}  {th:4d}    {mu:9.2f}   {obs:9.2f}")
print("-> geometry alone predicts the trend (differences: induction & sterics)\\n")

# -- (2) Debye plot: extract mu and alpha from P_m(T) ---------
mu_w = 1.85 * DEBYE           # water vapor
alpha_p = 1.48e-30            # polarizability volume [m^3]
alpha = 4 * np.pi * EPS0 * alpha_p
T = np.linspace(300, 500, 9)
Pm = NA / (3 * EPS0) * (alpha + mu_w**2 / (3 * KB * T))   # [m^3/mol]

slope, intercept = np.polyfit(1 / T, Pm, 1)
mu_fit = np.sqrt(9 * EPS0 * KB * slope / NA)
alpha_fit = 3 * EPS0 * intercept / NA
print("Debye plot (water vapor, synthetic data):")
print(f"  slope     -> mu    = {mu_fit/DEBYE:.3f} D   (input 1.850 D)")
print(f"  intercept -> alpha'= {alpha_fit/(4*np.pi*EPS0)*1e30:.3f} x10^-30 m^3 (input 1.480)")
print("-> ONE experiment (P_m vs T) separates permanent dipole from polarizability\\n")

plt.figure(figsize=(6, 4))
plt.plot(1e3 / T, Pm * 1e6, "o-")
plt.xlabel("1000/T [1/K]"); plt.ylabel("P$_m$ [cm$^3$/mol]")
plt.title("Debye plot: slope ∝ μ², intercept ∝ α")
plt.tight_layout(); plt.show()

# -- (3) Clausius-Mossotti for a NONPOLAR liquid --------------
# CCl4: alpha' = 10.5e-30 m^3, rho = 1590 kg/m^3, M = 153.8 g/mol
x = 4 * np.pi * 1590 * NA * 10.5e-30 / (3 * 0.1538)
eps_r = (1 + 2 * x) / (1 - x)
print("Clausius-Mossotti for CCl4 (nonpolar, orientation term absent):")
print(f"  (eps_r-1)/(eps_r+2) = {x:.4f}  ->  eps_r = {eps_r:.3f}")
print(f"  refractive index n = sqrt(eps_r) = {np.sqrt(eps_r):.3f}  (experimental 1.4607)")
print("-> molecular polarizability predicts a BULK optical property\\n")

# orientation term freeze-out with frequency (qualitative check)
print("frequency window   surviving polarization      typical eps_r of water")
for f, mech, e in (("static-radio", "orientation + ionic + electronic", 78.4),
                   ("microwave-IR", "ionic + electronic", "~5"),
                   ("visible-UV", "electronic only (-> n^2 = 1.77)", 1.77)):
    print(f"  {f:13s}  {mech:33s}  {e}")
print("-> water: eps_r = 78 but n^2 = 1.77 — dipoles cannot follow light!")
`;

// ── python/wk05_vdw_forces.py ────────────────────
export const PY_VDW = `"""
Wk05 — Van der Waals forces: Keesom, induction, London
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

All three attractive mechanisms share the same -C/r^6 form:
  Keesom  (rotating dipole-dipole): C = 2 mu1^2 mu2^2 / (3 (4 pi eps0)^2 kT)
  Debye   (dipole-induced dipole):  C = mu1^2 alpha2' / (4 pi eps0)
  London  (dispersion):             C = (3/2) alpha1' alpha2' I1 I2/(I1+I2)
Adding them for real molecules shows the (surprising) dominance of
dispersion — even for polar HCl.

Run:  python wk05_vdw_forces.py
"""
import numpy as np
import matplotlib.pyplot as plt

EPS0 = 8.8541878128e-12
KB = 1.380649e-23
NA = 6.02214076e23
DEBYE = 3.33564e-30
EV = 1.602176634e-19
T = 298.15

# molecule data: mu [D], alpha' [1e-30 m^3], I [eV]
MOL = {
    "Ar":   (0.00, 1.66, 15.76),
    "CH4":  (0.00, 2.60, 12.61),
    "HCl":  (1.08, 2.63, 12.74),
    "NH3":  (1.47, 2.22, 10.07),
    "H2O":  (1.85, 1.48, 12.62),
    "C6H6": (0.00, 10.4,  9.24),
}

def keesom(m1, m2):
    return 2 * (m1 * DEBYE)**2 * (m2 * DEBYE)**2 / (3 * (4 * np.pi * EPS0)**2 * KB * T)

def induction(m1, a2p):
    return (m1 * DEBYE)**2 * (a2p * 1e-30) / (4 * np.pi * EPS0)

def london(a1p, a2p, I1, I2):
    return 1.5 * (a1p * 1e-30) * (a2p * 1e-30) * (I1 * I2 / (I1 + I2)) * EV

r = 0.40e-9                    # typical contact separation 0.4 nm
print(f"pair          C_Keesom   C_induc    C_London   [1e-79 J m^6]   V(0.4nm) [kJ/mol]")
for name, (mu, ap, I) in MOL.items():
    cK = keesom(mu, mu)
    cD = 2 * induction(mu, ap)          # both directions (1 induces 2 & 2 induces 1)
    cL = london(ap, ap, I, I)
    Ctot = cK + cD + cL
    V = -Ctot / r**6 * NA / 1e3
    print(f"{name:6s}-{name:6s} {cK*1e79:8.2f}  {cD*1e79:8.2f}  {cL*1e79:9.2f}"
          f"   {'':4s}  {V:10.2f}")
print("-> London dispersion dominates for every pair except H2O")
print("   (benzene: zero dipole yet the LARGEST attraction — polarizability wins)\\n")

# distance dependence comparison (slide's interaction table)
print("interaction        power   typical E [kJ/mol]  (lecture Table 16B.1)")
for nm, p, e in (("ion-ion", "1/r", 250), ("H-bond", "-", 20), ("ion-dipole", "1/r^2", 15),
                 ("dipole-dipole (fixed)", "1/r^3", 2), ("dipole-dipole (rot.)", "1/r^6", 0.3),
                 ("London", "1/r^6", 2)):
    print(f"  {nm:22s} {p:6s}  {e}")

# plot: r-dependence for H2O pair
rr = np.linspace(0.3, 1.2, 200) * 1e-9
cK, cD = keesom(1.85, 1.85), 2 * induction(1.85, 1.48)
cL = london(1.48, 1.48, 12.62, 12.62)
plt.figure(figsize=(6.5, 4.4))
for C, lb in ((cK, "Keesom"), (cD, "induction"), (cL, "London"), (cK + cD + cL, "total")):
    plt.plot(rr * 1e9, -C / rr**6 * NA / 1e3, label=lb)
plt.xlabel("r [nm]"); plt.ylabel("V [kJ/mol]"); plt.legend()
plt.title("H2O pair: all three share the 1/r$^6$ law")
plt.tight_layout(); plt.show()
`;

// ── python/wk05_lj_md.py ─────────────────────────
export const PY_LJMD = `"""
Wk05 — 2D Lennard-Jones molecular dynamics: gas vs liquid & the RDF
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

V(r) = 4 eps [ (sigma/r)^12 - (sigma/r)^6 ]   (minimum at 2^{1/6} sigma)
Velocity-Verlet integration in reduced units (sigma = eps = m = 1),
periodic box.  Cooling the SAME system condenses it:
  hot (T* = 1.5): ideal-gas-like, g(r) ~ 1 beyond contact
  cold (T* = 0.45): droplets form, g(r) shows liquid shells at ~1.12, ~2.2
Energy conservation is checked in an NVE segment (relative drift ~1e-3).

Run:  python wk05_lj_md.py     (~10 s)
"""
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(7)
N, L = 100, 12.0                    # particles, box size
rc = 3.0                             # cutoff
dt = 0.004

def forces(pos):
    d = pos[:, None, :] - pos[None, :, :]
    d -= L * np.round(d / L)                       # minimum image
    r2 = (d**2).sum(-1)
    np.fill_diagonal(r2, np.inf)
    inv2 = np.where(r2 < rc**2, 1.0 / r2, 0.0)
    inv6 = inv2**3
    fmag = 24 * inv2 * inv6 * (2 * inv6 - 1)       # (1/r dV/dr) factor
    F = (fmag[:, :, None] * d).sum(1)
    pot = 2 * (inv6**2 - inv6).sum()               # 4*0.5 double count
    return F, pot

def run(Ttarget, nequil=1500, nprod=1500, nve_check=False):
    side = int(np.ceil(np.sqrt(N)))
    g = np.array([(i, j) for i in range(side) for j in range(side)][:N], float)
    pos = (g + 0.5) * (L / side)
    vel = rng.normal(0, np.sqrt(Ttarget), (N, 2))
    vel -= vel.mean(0)
    F, _ = forces(pos)
    Es = []
    for step in range(nequil + nprod):
        vel += 0.5 * dt * F
        pos = (pos + dt * vel) % L
        F, pot = forces(pos)
        vel += 0.5 * dt * F
        ke = 0.5 * (vel**2).sum()
        if step < nequil and not nve_check:        # Berendsen-like rescale
            lam = np.sqrt(1 + 0.02 * (Ttarget * N / ke - 1))
            vel *= lam
        Es.append(ke + pot)
    return pos, np.array(Es)

def rdf(pos, nbins=60, rmax=5.0):
    d = pos[:, None, :] - pos[None, :, :]
    d -= L * np.round(d / L)
    r = np.sqrt((d**2).sum(-1))[np.triu_indices(N, 1)]
    h, edges = np.histogram(r, bins=nbins, range=(0, rmax))
    rc_ = 0.5 * (edges[1:] + edges[:-1])
    dr = edges[1] - edges[0]
    shell = 2 * np.pi * rc_ * dr                   # 2D shell area
    ideal = shell * N * (N - 1) / 2 / L**2 * 2     # pair density norm
    return rc_, h / ideal

# -- energy conservation (NVE) --------------------------------
_, E = run(0.8, nequil=0, nprod=1200, nve_check=True)
drift = abs(E[-1] - E[0]) / abs(E[0])
print(f"NVE energy drift over 1200 steps: {drift:.2e}  (velocity Verlet is symplectic)")

# -- gas vs liquid --------------------------------------------
plt.figure(figsize=(12, 4.2))
for i, (Tt, lb) in enumerate ((( 1.5, "hot gas  T*=1.5"), (0.45, "cold liquid  T*=0.45"))):
    pos, _ = run(Tt)
    rr, g = rdf(pos)
    peak = rr[np.argmax(g)]
    print(f"{lb}:  RDF peak at r* = {peak:.2f}  "
          f"({'~2^(1/6)=1.12 (LJ contact!)' if Tt < 1 else 'weak structure'})")
    plt.subplot(1, 3, i + 1)
    plt.scatter(pos[:, 0], pos[:, 1], s=14)
    plt.title(lb); plt.xlim(0, L); plt.ylim(0, L); plt.gca().set_aspect(1)
    plt.subplot(1, 3, 3)
    plt.plot(rr, g, label=lb)
plt.subplot(1, 3, 3)
plt.axhline(1, ls="--", c="gray"); plt.axvline(2**(1/6), ls=":", c="k")
plt.xlabel("r / sigma"); plt.ylabel("g(r)"); plt.legend(fontsize=8)
plt.title("radial distribution function")
plt.tight_layout(); plt.show()

print("\\n-> same particles, same forces — only T differs. Condensation is")
print("   nothing but the LJ well (-eps) winning over thermal motion (kT).")
`;

// ── python/wk05_capillarity.py ───────────────────
export const PY_CAP = `"""
Wk05 — Surface tension: Young-Laplace, capillary rise, wetting, Kelvin
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Young-Laplace: Delta p = sigma (1/R1 + 1/R2)  -> 2 sigma/r for a sphere
(2) Capillary rise: sigma = rho g h a / (2 cos theta)  (lecture derivation)
(3) Young's equation: cos theta_c = (sigma_sg - sigma_sl)/sigma_lg,
    work of adhesion  w_ad = sigma_lg (1 + cos theta_c)
(4) Kelvin equation: p/p* = exp(2 sigma V_m / r R T)  -> Ostwald ripening

Run:  python wk05_capillarity.py
"""
import numpy as np
import matplotlib.pyplot as plt

R = 8.314462618
G = 9.80665
SIG_W = 72.75e-3          # N/m, water 293 K (lecture table)
RHO_W = 998.0
VM_W = 1.807e-5           # m^3/mol, water molar volume

# -- (1) Young-Laplace ----------------------------------------
print("water droplet radius     excess pressure 2 sigma/r")
for r in (1e-3, 1e-6, 1e-8):
    dp = 2 * SIG_W / r
    print(f"  {r*1e9:12.0f} nm    {dp:12.3e} Pa  = {dp/101325:8.3f} atm")
print("-> a 10 nm droplet carries ~140 atm of Laplace pressure!\\n")

# -- (2) capillary rise ---------------------------------------
def rise(sigma, rho, a, theta_deg=0.0):
    return 2 * sigma * np.cos(np.radians(theta_deg)) / (rho * G * a)

print("capillary rise h = 2 sigma cos(theta) / (rho g a):")
for a in (0.2e-3, 0.5e-3, 1e-3):
    print(f"  water, glass tube a = {a*1e3:.1f} mm: h = {rise(SIG_W, RHO_W, a)*1e3:7.1f} mm")
hg = rise(472e-3, 13546.0, 0.5e-3, 140.0)
print(f"  mercury (theta=140deg), a = 0.5 mm: h = {hg*1e3:7.1f} mm (DEPRESSION)\\n")

# drop-weight method sanity: water drop from D = 3 mm tip
D = 3e-3
M = SIG_W * np.pi * D / G
print(f"drop-weight method: tip D = 3 mm releases drops of m = {M*1e6:.1f} mg "
      f"(sigma = Mg/pi D)\\n")

# -- (3) Young's equation & wetting ---------------------------
print("surface           theta_c   cos     w_ad/sigma_lg = 1+cos")
for name, th in (("clean glass", 5.0), ("polymer", 95.0), ("rubber", 110.0), ("PTFE", 125.0)):
    c = np.cos(np.radians(th))
    print(f"  {name:14s}  {th:6.0f}   {c:+.3f}   {1+c:7.3f}   "
          f"{'wets' if th < 90 else 'does not wet'}")
print("-> 1 < w_ad/sigma_lg < 2 : wetting;  0 < ratio < 1 : non-wetting\\n")

# -- (4) Kelvin equation --------------------------------------
T = 298.15
print("Kelvin equation for water droplets, p/p* = exp(2 sigma Vm / r R T):")
for r in (1e-6, 1e-7, 1e-8, 1e-9):
    ratio = np.exp(2 * SIG_W * VM_W / (r * R * T))
    print(f"  r = {r*1e9:6.0f} nm:  p/p* = {ratio:8.3f}")
print("-> small droplets evaporate into big ones: Ostwald ripening")
print("   (why cloud formation needs nucleation seeds, and why nanocrystal")
print("    syntheses ripen — the SAME 2 sigma Vm / rRT exponent)\\n")

# plots
fig, ax = plt.subplots(1, 2, figsize=(10.5, 4))
rr = np.logspace(-9, -6, 200)
ax[0].loglog(rr * 1e9, 2 * SIG_W / rr / 1e5)
ax[0].set_xlabel("r [nm]"); ax[0].set_ylabel("Laplace pressure [bar]")
ax[0].set_title("2$\\\\sigma$/r: why nano-emulsions are stiff")
ax[1].semilogx(rr * 1e9, np.exp(2 * SIG_W * VM_W / (rr * R * T)))
ax[1].axhline(1, ls="--", c="gray")
ax[1].set_xlabel("r [nm]"); ax[1].set_ylabel("p/p*")
ax[1].set_title("Kelvin: vapor pressure of curved surfaces")
plt.tight_layout(); plt.show()
`;

// ── matlab/wk05_dipole_polarization.m ────────────
export const ML_DIPOLE = `% Wk05 - Dipole moments, polarizability & the Debye equation
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% Vector addition of bond dipoles; Debye plot; Clausius-Mossotti -> n(CCl4).

EPS0 = 8.8541878128e-12; KB = 1.380649e-23; NA = 6.02214076e23;
DEBYE = 3.33564e-30;

% (1) dichlorobenzene isomers: mu_res = 2 mu1 cos(theta/2)
mu1 = 1.57;   % D (chlorobenzene)
iso = {'ortho' 60 2.25; 'meta' 120 1.48; 'para' 180 0.0};
fprintf('isomer  angle  mu_calc [D]  mu_obs [D]\\n');
for i = 1:3
    mu = 2*mu1*cosd(iso{i,2}/2);
    fprintf('%-6s  %4d   %8.2f   %8.2f\\n', iso{i,1}, iso{i,2}, mu, iso{i,3});
end

% (2) Debye plot: P_m = NA/(3 eps0) (alpha + mu^2/3kT)
mu_w = 1.85*DEBYE; alpha = 4*pi*EPS0*1.48e-30;
T = linspace(300, 500, 9);
Pm = NA/(3*EPS0)*(alpha + mu_w^2./(3*KB*T));
p = polyfit(1./T, Pm, 1);
mu_fit = sqrt(9*EPS0*KB*p(1)/NA);
alpha_fit = 3*EPS0*p(2)/NA;
fprintf('\\nDebye plot: mu = %.3f D (input 1.850), alpha'' = %.3f e-30 m^3 (input 1.480)\\n', ...
        mu_fit/DEBYE, alpha_fit/(4*pi*EPS0)*1e30);
figure(1); plot(1e3./T, Pm*1e6, 'o-');
xlabel('1000/T [1/K]'); ylabel('P_m [cm^3/mol]'); title('Debye plot');

% (3) Clausius-Mossotti for CCl4
x = 4*pi*1590*NA*10.5e-30/(3*0.1538);
eps_r = (1+2*x)/(1-x);
fprintf('CCl4: eps_r = %.3f, n = %.3f (experimental 1.4607)\\n', eps_r, sqrt(eps_r));
fprintf('water: eps_r(static) = 78 but n^2 = 1.77 - dipoles cannot follow light\\n');
`;

// ── matlab/wk05_vdw_forces.m ─────────────────────
export const ML_VDW = `% Wk05 - Van der Waals forces: Keesom, induction, London
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% All three share -C/r^6; dispersion dominates for most pairs.

EPS0 = 8.8541878128e-12; KB = 1.380649e-23; NA = 6.02214076e23;
DEBYE = 3.33564e-30; EV = 1.602176634e-19; T = 298.15;

% name, mu [D], alpha' [1e-30 m^3], I [eV]
mol = {'Ar' 0 1.66 15.76; 'CH4' 0 2.60 12.61; 'HCl' 1.08 2.63 12.74; ...
       'NH3' 1.47 2.22 10.07; 'H2O' 1.85 1.48 12.62; 'C6H6' 0 10.4 9.24};

r = 0.40e-9;
fprintf('pair         C_Keesom  C_induc  C_London [1e-79 Jm^6]  V(0.4nm) kJ/mol\\n');
for i = 1:size(mol,1)
    mu = mol{i,2}*DEBYE; ap = mol{i,3}*1e-30; I = mol{i,4}*EV;
    cK = 2*mu^4/(3*(4*pi*EPS0)^2*KB*T);
    cD = 2*mu^2*ap/(4*pi*EPS0);
    cL = 1.5*ap^2*(I/2);
    V  = -(cK+cD+cL)/r^6*NA/1e3;
    fprintf('%-5s-%-5s  %8.2f  %7.2f  %8.2f  %18.2f\\n', ...
            mol{i,1}, mol{i,1}, cK*1e79, cD*1e79, cL*1e79, V);
end
fprintf('-> benzene: zero dipole yet largest attraction (polarizability wins)\\n');

% r-dependence for the water pair
mu = 1.85*DEBYE; ap = 1.48e-30; I = 12.62*EV;
cK = 2*mu^4/(3*(4*pi*EPS0)^2*KB*T); cD = 2*mu^2*ap/(4*pi*EPS0); cL = 1.5*ap^2*I/2;
rr = linspace(0.3, 1.2, 200)*1e-9;
figure(1); hold on;
Cs = [cK cD cL cK+cD+cL]; lb = {'Keesom','induction','London','total'};
for k = 1:4, plot(rr*1e9, -Cs(k)./rr.^6*NA/1e3, 'DisplayName', lb{k}); end
xlabel('r [nm]'); ylabel('V [kJ/mol]'); legend; title('H_2O pair: 1/r^6 family');
`;

// ── matlab/wk05_lj_md.m ──────────────────────────
export const ML_LJMD = `% Wk05 - 2D Lennard-Jones MD: gas vs liquid & the RDF
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% Velocity Verlet, reduced units, periodic box. Cooling condenses the gas.

rng(7);
N = 100; L = 12.0; rc2 = 9.0; dt = 0.004;

figure(1); clf;
Ts = [1.5 0.45]; lbs = {'hot gas T*=1.5', 'cold liquid T*=0.45'};
for k = 1:2
    [pos, ~] = runmd(Ts(k), N, L, rc2, dt, 1500, 1500);
    [rr, g] = rdf(pos, N, L);
    [~, im] = max(g);
    fprintf('%s: RDF peak at r* = %.2f (2^(1/6) = 1.12)\\n', lbs{k}, rr(im));
    subplot(1,3,k); scatter(pos(:,1), pos(:,2), 14, 'filled');
    axis([0 L 0 L]); axis square; title(lbs{k});
    subplot(1,3,3); hold on; plot(rr, g, 'DisplayName', lbs{k});
end
subplot(1,3,3); yline(1,'--'); xline(2^(1/6),':');
xlabel('r/\\sigma'); ylabel('g(r)'); legend; title('RDF');

function [pos, E] = runmd(Tt, N, L, rc2, dt, neq, nprod)
    side = ceil(sqrt(N));
    [gx, gy] = meshgrid(0:side-1, 0:side-1);
    g = [gx(:) gy(:)]; g = g(1:N,:);
    pos = (g + 0.5)*(L/side);
    vel = sqrt(Tt)*randn(N,2); vel = vel - mean(vel);
    [F, ~] = forces(pos, N, L, rc2);
    E = zeros(neq+nprod,1);
    for s = 1:neq+nprod
        vel = vel + 0.5*dt*F;
        pos = mod(pos + dt*vel, L);
        [F, pot] = forces(pos, N, L, rc2);
        vel = vel + 0.5*dt*F;
        ke = 0.5*sum(vel(:).^2);
        if s <= neq
            vel = vel*sqrt(1 + 0.02*(Tt*N/ke - 1));   % gentle thermostat
        end
        E(s) = ke + pot;
    end
end

function [F, pot] = forces(pos, N, L, rc2)
    dx = pos(:,1) - pos(:,1)'; dy = pos(:,2) - pos(:,2)';
    dx = dx - L*round(dx/L); dy = dy - L*round(dy/L);
    r2 = dx.^2 + dy.^2 + eye(N)*1e9;
    inv2 = (r2 < rc2)./r2; inv6 = inv2.^3;
    fmag = 24*inv2.*inv6.*(2*inv6 - 1);
    F = [sum(fmag.*dx, 2), sum(fmag.*dy, 2)];
    pot = 2*sum(inv6(:).^2 - inv6(:));
end

function [rc_, g] = rdf(pos, N, L)
    dx = pos(:,1) - pos(:,1)'; dy = pos(:,2) - pos(:,2)';
    dx = dx - L*round(dx/L); dy = dy - L*round(dy/L);
    r = sqrt(dx.^2 + dy.^2); r = r(triu(true(N),1));
    edges = linspace(0, 5, 61);
    h = histcounts(r, edges);
    rc_ = 0.5*(edges(1:end-1) + edges(2:end)); dr = edges(2) - edges(1);
    ideal = 2*pi*rc_*dr * N*(N-1)/2 / L^2 * 2;
    g = h ./ ideal;
end
`;

// ── matlab/wk05_capillarity.m ────────────────────
export const ML_CAP = `% Wk05 - Surface tension: Young-Laplace, capillary rise, wetting, Kelvin
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU

Rg = 8.314462618; G = 9.80665;
SIG = 72.75e-3; RHO = 998.0; VM = 1.807e-5;   % water

% (1) Young-Laplace
fprintf('water droplet r      excess pressure 2 sigma/r\\n');
for r = [1e-3 1e-6 1e-8]
    dp = 2*SIG/r;
    fprintf('  %10.0f nm   %10.3e Pa = %8.3f atm\\n', r*1e9, dp, dp/101325);
end

% (2) capillary rise sigma = rho g h a / (2 cos theta)
fprintf('\\ncapillary rise:\\n');
for a = [0.2e-3 0.5e-3 1e-3]
    h = 2*SIG/(RHO*G*a);
    fprintf('  water, a = %.1f mm: h = %6.1f mm\\n', a*1e3, h*1e3);
end
h_hg = 2*472e-3*cosd(140)/(13546*G*0.5e-3);
fprintf('  mercury (140 deg), a = 0.5 mm: h = %6.1f mm (depression)\\n', h_hg*1e3);

% (3) Young equation & wetting
fprintf('\\nsurface        theta_c   1+cos(theta) = w_ad/sigma_lg\\n');
surfs = {'glass' 5; 'polymer' 95; 'rubber' 110; 'PTFE' 125};
for i = 1:4
    fprintf('  %-10s %6d   %7.3f  (%s)\\n', surfs{i,1}, surfs{i,2}, ...
            1+cosd(surfs{i,2}), ternary(surfs{i,2} < 90, 'wets', 'non-wetting'));
end

% (4) Kelvin equation
T = 298.15;
fprintf('\\nKelvin: p/p* = exp(2 sigma Vm / r R T)\\n');
for r = [1e-6 1e-7 1e-8 1e-9]
    fprintf('  r = %6.0f nm: p/p* = %7.3f\\n', r*1e9, exp(2*SIG*VM/(r*Rg*T)));
end
fprintf('-> Ostwald ripening: small droplets feed the large ones\\n');

figure(1);
rr = logspace(-9, -6, 200);
subplot(1,2,1); loglog(rr*1e9, 2*SIG./rr/1e5);
xlabel('r [nm]'); ylabel('\\Delta p [bar]'); title('Laplace pressure');
subplot(1,2,2); semilogx(rr*1e9, exp(2*SIG*VM./(rr*Rg*T))); yline(1,'--');
xlabel('r [nm]'); ylabel('p/p*'); title('Kelvin equation');

function s = ternary(c, a, b)
    if c, s = a; else, s = b; end
end
`;

// ── julia/wk05_dipole_polarization.jl ────────────
export const JL_DIPOLE = `# Wk05 - Dipole moments, polarizability & the Debye equation
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
using Plots, Printf, Statistics

const EPS0 = 8.8541878128e-12; const KB = 1.380649e-23
const NA = 6.02214076e23; const DEBYE = 3.33564e-30

# (1) dichlorobenzene isomers: mu_res = 2 mu1 cos(theta/2)
mu1 = 1.57
@printf("isomer  angle  mu_calc [D]  mu_obs [D]\\n")
for (name, th, obs) in (("ortho", 60, 2.25), ("meta", 120, 1.48), ("para", 180, 0.0))
    @printf("%-6s  %4d   %8.2f   %8.2f\\n", name, th, 2mu1 * cosd(th / 2), obs)
end

# (2) Debye plot
mu_w = 1.85DEBYE; α = 4π * EPS0 * 1.48e-30
T = collect(range(300, 500, length=9))
Pm = NA / (3EPS0) .* (α .+ mu_w^2 ./ (3KB .* T))
x = 1 ./ T
slope = cov(x, Pm) / var(x)
intercept = mean(Pm) - slope * mean(x)
@printf("\\nDebye plot: mu = %.3f D (input 1.850), alpha' = %.3f e-30 m^3 (input 1.480)\\n",
        sqrt(9EPS0 * KB * slope / NA) / DEBYE, 3EPS0 * intercept / NA / (4π * EPS0) * 1e30)
p1 = plot(1e3 ./ T, Pm .* 1e6, marker=:o, xlabel="1000/T [1/K]",
          ylabel="Pm [cm³/mol]", title="Debye plot", legend=false)

# (3) Clausius-Mossotti for CCl4
xcm = 4π * 1590 * NA * 10.5e-30 / (3 * 0.1538)
εr = (1 + 2xcm) / (1 - xcm)
@printf("CCl4: eps_r = %.3f, n = %.3f (experimental 1.4607)\\n", εr, sqrt(εr))
println("water: eps_r(static) = 78 but n^2 = 1.77 - dipoles cannot follow light")
display(p1); readline()
`;

// ── julia/wk05_vdw_forces.jl ─────────────────────
export const JL_VDW = `# Wk05 - Van der Waals forces: Keesom, induction, London
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
using Plots, Printf

const EPS0 = 8.8541878128e-12; const KB = 1.380649e-23
const NA = 6.02214076e23; const DEBYE = 3.33564e-30
const EV = 1.602176634e-19; const T = 298.15

# (name, mu [D], alpha' [1e-30 m^3], I [eV])
mols = [("Ar", 0.0, 1.66, 15.76), ("CH4", 0.0, 2.60, 12.61),
        ("HCl", 1.08, 2.63, 12.74), ("NH3", 1.47, 2.22, 10.07),
        ("H2O", 1.85, 1.48, 12.62), ("C6H6", 0.0, 10.4, 9.24)]

r = 0.40e-9
@printf("pair        C_Keesom  C_induc  C_London [1e-79 Jm^6]  V(0.4nm) kJ/mol\\n")
for (nm, muD, apv, IeV) in mols
    mu = muD * DEBYE; ap = apv * 1e-30; I = IeV * EV
    cK = 2mu^4 / (3 * (4π * EPS0)^2 * KB * T)
    cD = 2mu^2 * ap / (4π * EPS0)
    cL = 1.5 * ap^2 * I / 2
    V = -(cK + cD + cL) / r^6 * NA / 1e3
    @printf("%-5s-%-5s %8.2f  %7.2f  %8.2f  %18.2f\\n", nm, nm, cK * 1e79, cD * 1e79, cL * 1e79, V)
end
println("-> benzene: zero dipole yet the largest attraction (polarizability wins)")

# r-dependence for the water pair
mu = 1.85DEBYE; ap = 1.48e-30; I = 12.62EV
Cs = [2mu^4 / (3 * (4π * EPS0)^2 * KB * T), 2mu^2 * ap / (4π * EPS0), 1.5ap^2 * I / 2]
push!(Cs, sum(Cs))
rr = range(0.3, 1.2, length=200) .* 1e-9
p = plot(xlabel="r [nm]", ylabel="V [kJ/mol]", title="H₂O pair: 1/r⁶ family")
for (C, lb) in zip(Cs, ("Keesom", "induction", "London", "total"))
    plot!(p, rr .* 1e9, -C ./ rr .^ 6 .* NA ./ 1e3, label=lb, lw=1.5)
end
display(p); readline()
`;

// ── julia/wk05_lj_md.jl ──────────────────────────
export const JL_LJMD = `# Wk05 - 2D Lennard-Jones MD: gas vs liquid & the RDF
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
# Velocity Verlet, reduced units, periodic box. Cooling condenses the gas.
using Plots, Printf, Random

Random.seed!(7)
const N = 100; const L = 12.0; const RC2 = 9.0; const DT = 0.004

function forces(pos)
    F = zeros(N, 2); pot = 0.0
    @inbounds for i in 1:N-1, j in i+1:N
        dx = pos[i, 1] - pos[j, 1]; dy = pos[i, 2] - pos[j, 2]
        dx -= L * round(dx / L); dy -= L * round(dy / L)
        r2 = dx^2 + dy^2
        r2 > RC2 && continue
        inv2 = 1 / r2; inv6 = inv2^3
        f = 24 * inv2 * inv6 * (2inv6 - 1)
        F[i, 1] += f * dx; F[i, 2] += f * dy
        F[j, 1] -= f * dx; F[j, 2] -= f * dy
        pot += 4 * (inv6^2 - inv6)
    end
    F, pot
end

function runmd(Tt; neq=1500, nprod=1500)
    side = ceil(Int, sqrt(N))
    pos = [((i - 1) % side + 0.5) * L / side for i in 1:N, _ in 1:1]
    pos = hcat([(mod(i - 1, side) + 0.5) * L / side for i in 1:N],
               [(div(i - 1, side) + 0.5) * L / side for i in 1:N])
    vel = sqrt(Tt) .* randn(N, 2); vel .-= sum(vel, dims=1) ./ N
    F, _ = forces(pos)
    for s in 1:neq+nprod
        vel .+= 0.5DT .* F
        pos .= mod.(pos .+ DT .* vel, L)
        F, _ = forces(pos)
        vel .+= 0.5DT .* F
        ke = 0.5 * sum(abs2, vel)
        s <= neq && (vel .*= sqrt(1 + 0.02 * (Tt * N / ke - 1)))
    end
    pos
end

function rdf(pos; nbins=60, rmax=5.0)
    h = zeros(nbins); dr = rmax / nbins
    for i in 1:N-1, j in i+1:N
        dx = pos[i, 1] - pos[j, 1]; dy = pos[i, 2] - pos[j, 2]
        dx -= L * round(dx / L); dy -= L * round(dy / L)
        r = sqrt(dx^2 + dy^2)
        r < rmax && (h[clamp(ceil(Int, r / dr), 1, nbins)] += 1)
    end
    rc = [(k - 0.5) * dr for k in 1:nbins]
    ideal = 2π .* rc .* dr .* (N * (N - 1) / 2) ./ L^2 .* 2
    rc, h ./ ideal
end

plt = plot(layout=(1, 3), size=(1300, 400))
for (k, (Tt, lb)) in enumerate(((1.5, "hot gas T*=1.5"), (0.45, "cold liquid T*=0.45")))
    pos = runmd(Tt)
    rr, g = rdf(pos)
    @printf("%s: RDF peak at r* = %.2f (2^(1/6) = 1.12)\\n", lb, rr[argmax(g)])
    scatter!(plt[k], pos[:, 1], pos[:, 2], ms=3, legend=false,
             xlims=(0, L), ylims=(0, L), aspect_ratio=1, title=lb)
    plot!(plt[3], rr, g, label=lb, lw=1.5)
end
hline!(plt[3], [1.0], ls=:dash, c=:gray, label=false)
vline!(plt[3], [2^(1 / 6)], ls=:dot, c=:black, label=false)
plot!(plt[3], xlabel="r/σ", ylabel="g(r)", title="RDF")
display(plt); readline()
`;

// ── julia/wk05_capillarity.jl ────────────────────
export const JL_CAP = `# Wk05 - Surface tension: Young-Laplace, capillary rise, wetting, Kelvin
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
using Plots, Printf

const Rg = 8.314462618; const G = 9.80665
const SIG = 72.75e-3; const RHO = 998.0; const VM = 1.807e-5   # water

# (1) Young-Laplace
println("water droplet r      excess pressure 2σ/r")
for r in (1e-3, 1e-6, 1e-8)
    dp = 2SIG / r
    @printf("  %10.0f nm   %10.3e Pa = %8.3f atm\\n", r * 1e9, dp, dp / 101325)
end

# (2) capillary rise
println("\\ncapillary rise h = 2σcosθ/(ρga):")
for a in (0.2e-3, 0.5e-3, 1e-3)
    @printf("  water, a = %.1f mm: h = %6.1f mm\\n", a * 1e3, 2SIG / (RHO * G * a) * 1e3)
end
h_hg = 2 * 472e-3 * cosd(140) / (13546 * G * 0.5e-3)
@printf("  mercury (140°), a = 0.5 mm: h = %6.1f mm (depression)\\n", h_hg * 1e3)

# (3) Young equation & wetting
println("\\nsurface        θc     1+cosθ = w_ad/σ_lg")
for (nm, th) in (("glass", 5), ("polymer", 95), ("rubber", 110), ("PTFE", 125))
    @printf("  %-10s %4d   %7.3f  (%s)\\n", nm, th, 1 + cosd(th),
            th < 90 ? "wets" : "non-wetting")
end

# (4) Kelvin equation
T = 298.15
println("\\nKelvin: p/p* = exp(2σVm/rRT)")
for r in (1e-6, 1e-7, 1e-8, 1e-9)
    @printf("  r = %6.0f nm: p/p* = %7.3f\\n", r * 1e9, exp(2SIG * VM / (r * Rg * T)))
end
println("-> Ostwald ripening: small droplets feed the large ones")

rr = 10 .^ range(-9, -6, length=200)
p1 = plot(rr .* 1e9, 2SIG ./ rr ./ 1e5, xscale=:log10, yscale=:log10,
          xlabel="r [nm]", ylabel="Δp [bar]", title="Laplace pressure", legend=false)
p2 = plot(rr .* 1e9, exp.(2SIG * VM ./ (rr .* Rg .* T)), xscale=:log10,
          xlabel="r [nm]", ylabel="p/p*", title="Kelvin equation", legend=false)
hline!(p2, [1.0], ls=:dash, c=:gray)
display(plot(p1, p2, layout=(1, 2), size=(1000, 400))); readline()
`;

// ── cpp/wk05_dipole_polarization.cpp ─────────────
export const CPP_DIPOLE = `// Wk05 - Dipole moments, polarizability & the Debye equation
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk05_dipole_polarization.cpp -o wk05_dipole
// Vector addition; Debye plot fit; Clausius-Mossotti -> n(CCl4) ~ 1.46.
#include <cmath>
#include <cstdio>
#include <vector>
#include <initializer_list>

const double EPS0 = 8.8541878128e-12, KB = 1.380649e-23;
const double NA = 6.02214076e23, DEBYE = 3.33564e-30;

int main() {
    // (1) dichlorobenzene isomers: mu_res = 2 mu1 cos(theta/2)
    const double mu1 = 1.57;   // D
    struct Iso { const char* n; double th, obs; };
    std::printf("isomer  angle  mu_calc [D]  mu_obs [D]\\n");
    for (Iso s : {Iso{"ortho", 60, 2.25}, Iso{"meta", 120, 1.48}, Iso{"para", 180, 0.0}})
        std::printf("%-6s  %4.0f   %8.2f   %8.2f\\n", s.n, s.th,
                    2 * mu1 * std::cos(s.th * M_PI / 360), s.obs);

    // (2) Debye plot: least-squares on Pm vs 1/T
    const double mu_w = 1.85 * DEBYE, alpha = 4 * M_PI * EPS0 * 1.48e-30;
    std::vector<double> x, y;
    for (int i = 0; i <= 8; ++i) {
        double T = 300 + 25.0 * i;
        x.push_back(1 / T);
        y.push_back(NA / (3 * EPS0) * (alpha + mu_w * mu_w / (3 * KB * T)));
    }
    double n = x.size(), sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (size_t i = 0; i < x.size(); ++i) { sx += x[i]; sy += y[i]; sxx += x[i]*x[i]; sxy += x[i]*y[i]; }
    double slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    double inter = (sy - slope * sx) / n;
    std::printf("\\nDebye plot: mu = %.3f D (input 1.850), alpha' = %.3f e-30 m^3 (input 1.480)\\n",
                std::sqrt(9 * EPS0 * KB * slope / NA) / DEBYE,
                3 * EPS0 * inter / NA / (4 * M_PI * EPS0) * 1e30);

    // (3) Clausius-Mossotti for CCl4
    double xc = 4 * M_PI * 1590 * NA * 10.5e-30 / (3 * 0.1538);
    double eps_r = (1 + 2 * xc) / (1 - xc);
    std::printf("CCl4: eps_r = %.3f, n = %.3f (experimental 1.4607)\\n", eps_r, std::sqrt(eps_r));
    std::printf("water: eps_r(static) = 78 but n^2 = 1.77 - dipoles cannot follow light\\n");
    return 0;
}
`;

// ── cpp/wk05_vdw_forces.cpp ──────────────────────
export const CPP_VDW = `// Wk05 - Van der Waals forces: Keesom, induction, London
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk05_vdw_forces.cpp -o wk05_vdw
// All three attractions share -C/r^6; dispersion usually dominates.
#include <cmath>
#include <cstdio>
#include <initializer_list>

const double EPS0 = 8.8541878128e-12, KB = 1.380649e-23;
const double NA = 6.02214076e23, DEBYE = 3.33564e-30, EV = 1.602176634e-19;
const double T = 298.15;

int main() {
    struct Mol { const char* n; double mu, ap, I; };   // D, 1e-30 m^3, eV
    const double r = 0.40e-9;
    std::printf("pair        C_Keesom  C_induc  C_London [1e-79 Jm^6]  V(0.4nm) kJ/mol\\n");
    for (Mol m : {Mol{"Ar", 0, 1.66, 15.76}, Mol{"CH4", 0, 2.60, 12.61},
                  Mol{"HCl", 1.08, 2.63, 12.74}, Mol{"NH3", 1.47, 2.22, 10.07},
                  Mol{"H2O", 1.85, 1.48, 12.62}, Mol{"C6H6", 0, 10.4, 9.24}}) {
        double mu = m.mu * DEBYE, ap = m.ap * 1e-30, I = m.I * EV;
        double f = 4 * M_PI * EPS0;
        double cK = 2 * std::pow(mu, 4) / (3 * f * f * KB * T);
        double cD = 2 * mu * mu * ap / f;
        double cL = 1.5 * ap * ap * I / 2;
        double V = -(cK + cD + cL) / std::pow(r, 6) * NA / 1e3;
        std::printf("%-5s-%-5s %8.2f  %7.2f  %8.2f  %18.2f\\n",
                    m.n, m.n, cK * 1e79, cD * 1e79, cL * 1e79, V);
    }
    std::printf("-> benzene: zero dipole yet the largest attraction (polarizability wins)\\n");
    std::printf("\\nlecture Table 16B.1: ion-ion 1/r 250 | H-bond 20 | ion-dipole 1/r^2 15\\n");
    std::printf("dipole-dipole 1/r^3 2 (fixed), 1/r^6 0.3 (rotating) | London 1/r^6 2 kJ/mol\\n");
    return 0;
}
`;

// ── cpp/wk05_lj_md.cpp ───────────────────────────
export const CPP_LJMD = `// Wk05 - 2D Lennard-Jones MD: gas vs liquid & the RDF
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk05_lj_md.cpp -o wk05_lj_md
// Velocity Verlet, reduced units, periodic box; writes rdf_hot/cold.csv.
#include <cmath>
#include <cstdio>
#include <vector>
#include <random>

const int N = 100;
const double L = 12.0, RC2 = 9.0, DT = 0.004;

struct Sys { std::vector<double> x, y, vx, vy, fx, fy; };

double forces(Sys& s) {
    std::fill(s.fx.begin(), s.fx.end(), 0.0);
    std::fill(s.fy.begin(), s.fy.end(), 0.0);
    double pot = 0;
    for (int i = 0; i < N - 1; ++i)
        for (int j = i + 1; j < N; ++j) {
            double dx = s.x[i] - s.x[j], dy = s.y[i] - s.y[j];
            dx -= L * std::round(dx / L); dy -= L * std::round(dy / L);
            double r2 = dx * dx + dy * dy;
            if (r2 > RC2) continue;
            double inv2 = 1 / r2, inv6 = inv2 * inv2 * inv2;
            double f = 24 * inv2 * inv6 * (2 * inv6 - 1);
            s.fx[i] += f * dx; s.fy[i] += f * dy;
            s.fx[j] -= f * dx; s.fy[j] -= f * dy;
            pot += 4 * (inv6 * inv6 - inv6);
        }
    return pot;
}

void rdf(const Sys& s, const char* fname) {
    const int nb = 60; const double rmax = 5.0, dr = rmax / nb;
    std::vector<double> h(nb, 0.0);
    for (int i = 0; i < N - 1; ++i)
        for (int j = i + 1; j < N; ++j) {
            double dx = s.x[i] - s.x[j], dy = s.y[i] - s.y[j];
            dx -= L * std::round(dx / L); dy -= L * std::round(dy / L);
            double r = std::sqrt(dx * dx + dy * dy);
            if (r < rmax) h[std::min(nb - 1, int(r / dr))] += 1;
        }
    FILE* f = std::fopen(fname, "w");
    std::fprintf(f, "r,g\\n");
    double peak = 0, rpk = 0;
    for (int k = 0; k < nb; ++k) {
        double rc = (k + 0.5) * dr;
        double ideal = 2 * M_PI * rc * dr * (N * (N - 1) / 2.0) / (L * L) * 2;
        double g = h[k] / ideal;
        if (g > peak) { peak = g; rpk = rc; }
        std::fprintf(f, "%.4f,%.4f\\n", rc, g);
    }
    std::fclose(f);
    std::printf("  wrote %s (peak g = %.2f at r* = %.2f; 2^(1/6) = 1.12)\\n", fname, peak, rpk);
}

int main() {
    std::mt19937 rng(7);
    std::normal_distribution<double> gauss(0, 1);
    for (double Tt : {1.5, 0.45}) {
        Sys s{std::vector<double>(N), std::vector<double>(N),
              std::vector<double>(N), std::vector<double>(N),
              std::vector<double>(N), std::vector<double>(N)};
        int side = int(std::ceil(std::sqrt(double(N))));
        for (int i = 0; i < N; ++i) {
            s.x[i] = (i % side + 0.5) * L / side;
            s.y[i] = (i / side + 0.5) * L / side;
            s.vx[i] = std::sqrt(Tt) * gauss(rng);
            s.vy[i] = std::sqrt(Tt) * gauss(rng);
        }
        forces(s);
        for (int step = 0; step < 3000; ++step) {
            for (int i = 0; i < N; ++i) { s.vx[i] += 0.5 * DT * s.fx[i]; s.vy[i] += 0.5 * DT * s.fy[i]; }
            for (int i = 0; i < N; ++i) {
                s.x[i] = std::fmod(s.x[i] + DT * s.vx[i] + L, L);
                s.y[i] = std::fmod(s.y[i] + DT * s.vy[i] + L, L);
            }
            forces(s);
            double ke = 0;
            for (int i = 0; i < N; ++i) { s.vx[i] += 0.5 * DT * s.fx[i]; s.vy[i] += 0.5 * DT * s.fy[i]; ke += 0.5 * (s.vx[i]*s.vx[i] + s.vy[i]*s.vy[i]); }
            if (step < 1500) {                       // gentle thermostat
                double lam = std::sqrt(1 + 0.02 * (Tt * N / ke - 1));
                for (int i = 0; i < N; ++i) { s.vx[i] *= lam; s.vy[i] *= lam; }
            }
        }
        std::printf("T* = %.2f:\\n", Tt);
        rdf(s, Tt > 1 ? "rdf_hot.csv" : "rdf_cold.csv");
    }
    std::printf("-> cooling the same LJ system condenses it: liquid shells appear in g(r)\\n");
    return 0;
}
`;

// ── cpp/wk05_capillarity.cpp ─────────────────────
export const CPP_CAP = `// Wk05 - Surface tension: Young-Laplace, capillary rise, wetting, Kelvin
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk05_capillarity.cpp -o wk05_capillarity
#include <cmath>
#include <cstdio>
#include <initializer_list>

const double Rg = 8.314462618, G = 9.80665;
const double SIG = 72.75e-3, RHO = 998.0, VM = 1.807e-5;   // water

int main() {
    std::printf("water droplet r      excess pressure 2 sigma/r\\n");
    for (double r : {1e-3, 1e-6, 1e-8}) {
        double dp = 2 * SIG / r;
        std::printf("  %10.0f nm   %10.3e Pa = %8.3f atm\\n", r * 1e9, dp, dp / 101325);
    }

    std::printf("\\ncapillary rise h = 2 sigma cos(theta)/(rho g a):\\n");
    for (double a : {0.2e-3, 0.5e-3, 1e-3})
        std::printf("  water, a = %.1f mm: h = %6.1f mm\\n", a * 1e3,
                    2 * SIG / (RHO * G * a) * 1e3);
    double h_hg = 2 * 472e-3 * std::cos(140 * M_PI / 180) / (13546 * G * 0.5e-3);
    std::printf("  mercury (140 deg), a = 0.5 mm: h = %6.1f mm (depression)\\n", h_hg * 1e3);

    std::printf("\\ndrop-weight: tip D = 3 mm -> m = sigma pi D / g = %.1f mg\\n",
                SIG * M_PI * 3e-3 / G * 1e6);

    std::printf("\\nsurface        theta_c  1+cos = w_ad/sigma_lg\\n");
    struct S { const char* n; double th; };
    for (S s : {S{"glass", 5}, S{"polymer", 95}, S{"rubber", 110}, S{"PTFE", 125}})
        std::printf("  %-10s %6.0f   %7.3f  (%s)\\n", s.n, s.th,
                    1 + std::cos(s.th * M_PI / 180), s.th < 90 ? "wets" : "non-wetting");

    const double T = 298.15;
    std::printf("\\nKelvin: p/p* = exp(2 sigma Vm / r R T)\\n");
    for (double r : {1e-6, 1e-7, 1e-8, 1e-9})
        std::printf("  r = %6.0f nm: p/p* = %7.3f\\n", r * 1e9,
                    std::exp(2 * SIG * VM / (r * Rg * T)));
    std::printf("-> Ostwald ripening: small droplets feed the large ones\\n");
    return 0;
}
`;
