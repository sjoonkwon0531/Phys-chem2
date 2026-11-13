"""
Week 12 - Tight-binding band of a 1D crystal (LCAO)
Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)

H_nm = eps0 delta_nm - t (delta_{n,m+1} + delta_{n,m-1}),  periodic ring of N atoms.
Bloch trial c_n = exp(i k n a)/sqrt(N)  ->  E(k) = eps0 - 2 t cos(k a),  k = 2 pi p / (N a).
Band width 4t; near k = 0, E ~ eps0 - 2t + t a^2 k^2  ->  m* = hbar^2 / (2 t a^2).
Band energy with f electrons per atom (two spins), relative to N f eps0:
  dE / N = -(4 t / pi) sin(pi f / 2)     (maximal binding at half filling, f = 1; zero for f = 2)
"""
import numpy as np

HBAR2_ME = 7.619964   # hbar^2 / m_e in eV * Angstrom^2

def ring_hamiltonian(N, eps0=0.0, t=1.0):
    H = eps0 * np.eye(N)
    for n in range(N):
        H[n, (n + 1) % N] = H[(n + 1) % N, n] = -t
    return H

def band_energy_per_site(f, t=1.0, N=2000):
    """Fill the lowest N*f/2 orbitals with 2 electrons each (numerical, ring of N sites)."""
    E = np.sort(np.linalg.eigvalsh(ring_hamiltonian(N, 0.0, t))) if N <= 600 else \
        np.sort(-2 * t * np.cos(2 * np.pi * np.arange(N) / N))
    nocc = int(round(N * f / 2))
    return 2 * np.sum(E[:nocc]) / N

if __name__ == "__main__":
    N, t = 12, 1.0
    num = np.sort(np.linalg.eigvalsh(ring_hamiltonian(N, 0.0, t)))
    ana = np.sort(-2 * t * np.cos(2 * np.pi * np.arange(N) / N))
    print(f"Ring of N = {N}: max |numerical - analytic| = {np.max(np.abs(num - ana)):.2e}")
    print("  eigenvalues:", np.round(num, 4))
    print(f"  band width = {num.max() - num.min():.4f} t (expect 4t)")
    for a, tt in ((2.5, 1.0), (3.0, 0.5), (2.5, 2.0)):
        print(f"Effective mass m*/m_e for t = {tt} eV, a = {a} A: {HBAR2_ME / (2 * tt * a**2):.3f}")
    print("\nBand energy per site (two spins), units of t:")
    for f in (0.25, 0.5, 1.0, 1.5, 2.0):
        print(f"  f = {f:4.2f} electrons/atom: numerical {band_energy_per_site(f, N=400):+.4f},"
              f"  analytic {-(4 / np.pi) * np.sin(np.pi * f / 2):+.4f}")
    # band formation: t decays with spacing a
    print("\nBand edges eps0 +/- 2t for t(a) = 2 exp(-(a - 1.5)/0.5) eV:")
    for a in (1.5, 2.0, 3.0, 4.0):
        ta = 2 * np.exp(-(a - 1.5) / 0.5)
        print(f"  a = {a:.1f} A: t = {ta:.3f} eV, band from {-2 * ta:+.3f} to {2 * ta:+.3f} eV")
