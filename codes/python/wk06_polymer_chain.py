"""
Wk06 — Macromolecules: molar-mass averages, random coils, entropic elasticity
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Averages:  Mn = sum(N_i M_i)/sum(N_i),  Mw = sum(N_i M_i^2)/sum(N_i M_i),
               Mz = sum(N_i M_i^3)/sum(N_i M_i^2),  dispersity D = Mw/Mn
    Step-growth (Schulz-Flory) chains at conversion p: D = 1 + p -> 2.
(2) Freely jointed chain (N bonds of length l), Monte Carlo:
      <R^2> = N l^2          (R_rms = N^{1/2} l)
      Rg^2  = N l^2 / 6      (same in 1D and 3D: the derivation only uses
                              <a_k . a_l> = l^2 delta_kl)
    1D end-to-end distribution -> Gaussian  P = (2/pi N)^{1/2} exp(-n^2/2N)
(3) Fixed bond angle (tetrahedral, 109.5 deg): <R^2> = 2 N l^2  (F = sqrt 2)
(4) Conformational entropy & restoring force (nu = n/N):
      dS = -(1/2) k N ln[(1+nu)^(1+nu) (1-nu)^(1-nu)]
      F  = (kT/2l) ln[(1+nu)/(1-nu)]  ~  nu kT / l   (Hooke, small nu)

Run:  python wk06_polymer_chain.py     (~5 s)
"""
import numpy as np
import matplotlib.pyplot as plt
from math import comb

rng = np.random.default_rng(6)
KB = 1.380649e-23

# -- (1) molar-mass averages ----------------------------------
def averages(Ni, Mi):
    Ni, Mi = np.asarray(Ni, float), np.asarray(Mi, float)
    Mn = (Ni * Mi).sum() / Ni.sum()
    Mw = (Ni * Mi**2).sum() / (Ni * Mi).sum()
    Mz = (Ni * Mi**3).sum() / (Ni * Mi**2).sum()
    return Mn, Mw, Mz

Mn, Mw, Mz = averages([1, 1], [10.0, 100.0])       # equal NUMBERS of chains
print("blend: equal numbers of 10 and 100 kg/mol chains")
print(f"  Mn = {Mn:.1f}, Mw = {Mw:.1f}, Mz = {Mz:.1f} kg/mol,  D = Mw/Mn = {Mw/Mn:.3f}")
print("  -> Mw > Mn always: heavy chains count more when weighted by mass\n")

print("Schulz-Flory (most probable) distribution, M0 = 100 g/mol:")
print("   p      Xn=1/(1-p)   Mn        Mw        Mz       D     (1+p)")
i = np.arange(1, 200001)
for p in (0.90, 0.99, 0.999):
    Ni = (1 - p) * p**(i - 1)
    Mn, Mw, Mz = averages(Ni, 100.0 * i)
    print(f"  {p:5.3f}  {1/(1-p):9.0f}  {Mn:8.0f}  {Mw:8.0f}  {Mz:8.0f}  {Mw/Mn:5.3f}  {1+p:5.3f}")
print("  -> Carothers: 99% conversion gives only 100-mers; D -> 2, Mn:Mw:Mz -> 1:2:3\n")

# -- (2) freely jointed chain: Monte Carlo --------------------
def fjc(N, M, dim):
    if dim == 1:
        b = rng.choice([-1.0, 1.0], size=(M, N, 1))
    else:
        b = rng.normal(size=(M, N, 3))
        b /= np.linalg.norm(b, axis=2, keepdims=True)
    r = np.concatenate([np.zeros((M, 1, b.shape[2])), np.cumsum(b, axis=1)], axis=1)
    R2 = (r[:, -1]**2).sum(1).mean()
    Rg2 = ((r - r.mean(1, keepdims=True))**2).sum(2).mean(1).mean()
    return R2, Rg2

N, M = 100, 20000
exact = N * (N + 2) / (6 * (N + 1))                 # N+1 beads, exact
print(f"freely jointed chain, N = {N} bonds, {M} chains (l = 1):")
for dim in (3, 1):
    R2, Rg2 = fjc(N, M, dim)
    print(f"  {dim}D:  <R^2> = {R2:7.2f} (N l^2 = {N}),  Rg^2 = {Rg2:6.2f} "
          f"(exact {exact:.2f} ~ N l^2/6 = {N/6:.2f})")
print("  -> R_rms = N^(1/2) l and Rg = (N/6)^(1/2) l hold in 1D AND 3D\n")

# sum check of the lecture derivation: Rg^2 = l^2/(2N^2) sum_ij |j - i|
idx = np.arange(N)
S = np.abs(idx[:, None] - idx[None, :]).sum()
print(f"direct sum, N = {N} beads: Rg^2 = {S/(2*N*N):.4f} = (l^2/6)(N - 1/N) = {(N - 1/N)/6:.4f}\n")

# 1D distribution: exact binomial vs Gaussian
print("1D end-to-end distribution, N = 100:   n    exact      Gaussian")
for n in (0, 10, 20, 30):
    Pex = comb(N, (N + n) // 2) / 2**N
    Pg = np.sqrt(2 / (np.pi * N)) * np.exp(-n * n / (2 * N))
    print(f"                                     {n:3d}  {Pex:.5f}    {Pg:.5f}")
print()

# -- (3) fixed bond angle (freely rotating chain) -------------
def frc(N, M, cosg):
    sing = np.sqrt(1 - cosg**2)
    b = rng.normal(size=(M, 3)); b /= np.linalg.norm(b, axis=1, keepdims=True)
    R = b.copy()
    for _ in range(N - 1):
        t = rng.normal(size=(M, 3))
        u = t - (t * b).sum(1, keepdims=True) * b
        u /= np.linalg.norm(u, axis=1, keepdims=True)
        b = cosg * b + sing * u                     # fixed angle, free rotation
        R += b
    return (R**2).sum(1).mean()

Nb, c = 200, 1 / 3                                  # bond angle 109.5 deg
fin = (1 + c) / (1 - c) - 2 * c * (1 - c**Nb) / (Nb * (1 - c)**2)
print(f"tetrahedral chain, N = {Nb}: <R^2>/(N l^2) = {frc(Nb, 20000, c)/Nb:.3f} "
      f"(theory {fin:.3f} -> F^2 = 2)")
Npe, lpe = 4000, 0.154                              # polyethylene, C-C bond [nm]
print(f"polyethylene N = {Npe}, l = {lpe} nm: contour {Npe*lpe:.0f} nm, "
      f"R_rms = {np.sqrt(2*Npe)*lpe:.1f} nm, Rg = {np.sqrt(Npe/3)*lpe:.2f} nm\n")

# -- (4) conformational entropy & restoring force -------------
nu = np.linspace(-0.95, 0.95, 381)
dS = -0.5 * np.log((1 + nu)**(1 + nu) * (1 - nu)**(1 - nu))     # per N k
Fr = 0.5 * np.log((1 + nu) / (1 - nu))                          # F l / kT
l_seg, T = 0.5e-9, 298.15
print(f"restoring force, l = 0.5 nm, T = 298 K (kT/l = {KB*T/l_seg*1e12:.2f} pN):")
for x in (0.1, 0.5, 0.9):
    F = KB * T / (2 * l_seg) * np.log((1 + x) / (1 - x))
    print(f"  nu = {x:.1f}: F = {F*1e12:5.2f} pN   (Hooke: {x*KB*T/l_seg*1e12:5.2f} pN)")
print("  -> a purely ENTROPIC spring: F is proportional to T (rubber stiffens when hot)")

fig, ax = plt.subplots(1, 3, figsize=(13, 4))
ii = np.arange(1, 1500)
for p in (0.98, 0.99, 0.995):
    ax[0].plot(ii * 0.1, ii * (1 - p)**2 * p**(ii - 1), label=f"p = {p}")
ax[0].set_xlabel("M [kg/mol]"); ax[0].set_ylabel("weight fraction")
ax[0].set_title("Schulz-Flory distributions"); ax[0].legend()
ax[1].plot(nu, dS); ax[1].set_xlabel("nu = n/N"); ax[1].set_ylabel("dS / Nk")
ax[1].set_title("conformational entropy")
ax[2].plot(nu, Fr, label="exact"); ax[2].plot(nu, nu, "--", label="Hooke")
ax[2].set_ylim(-2.2, 2.2); ax[2].set_xlabel("nu = n/N"); ax[2].set_ylabel("F l / kT")
ax[2].set_title("entropic restoring force"); ax[2].legend()
plt.tight_layout(); plt.show()
