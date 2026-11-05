"""
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
