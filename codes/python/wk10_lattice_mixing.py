"""
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

print("\n(2) Kawasaki MC, 48 x 48, phi = 0.5, 400 sweeps")
print("     chi    unlike-bond fraction   (random mixing = 0.5)")
for chi in (1.0, 2.5, 3.5, 4.5, 6.0):
    ub, s = kawasaki(chi)
    print(f"    {chi:4.1f}        {ub:.3f}")
print("    -> short-range order grows smoothly with chi; long-range domains need chi > 3.53 (exact 2D), not chi > 2 (mean field)")
