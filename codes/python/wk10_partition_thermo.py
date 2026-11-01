"""
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
print(f"    high-T limit (kT = 10^4 eps): S/k = {np.log(Zb) + Ub/tb:.4f} (ln 2 = {np.log(2):.4f}),  U/eps = {Ub:.4f} (1/2)\n")

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
print(f"\n(3) diatomics at {T} K, 1 bar  (constants: NIST CCCBDB; S° reference: CODATA key values)")
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
print("    -> rigid-rotor/harmonic-oscillator q reproduces S° to about 0.1-0.3 J/K/mol\n")

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
print(f"\n(5) N2 at {T} K, 1 bar: n Lambda^3 = {n*Lam**3:.3e}  (<< 1: classical gas)")
print(f"    mu_trans = kT ln(n Lambda^3) = {np.log(n*Lam**3):.2f} kT = {R*T*np.log(n*Lam**3)/1e3:.1f} kJ/mol")
