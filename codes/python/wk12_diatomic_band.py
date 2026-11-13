"""
Week 12 - Two atoms per unit cell: opening a band gap at the Brillouin-zone boundary
Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)

(a) Different site energies eps_A, eps_B, equal hopping t (cell length a, two atoms per cell):
    H(k) = [[eps_A, -t(1 + e^{-ika})], [c.c., eps_B]]
    E_pm(k) = ebar +/- sqrt(D^2 + 4 t^2 cos^2(ka/2)),  ebar = (eps_A+eps_B)/2, D = (eps_A-eps_B)/2
    gap at k = pi/a:  E_g = |eps_A - eps_B|
(b) Equal sites, alternating hopping t1, t2 (bond alternation, as in polyacetylene):
    E_pm(k) = +/- |t1 + t2 e^{-ika}|,   gap at k = pi/a:  E_g = 2 |t1 - t2|
Checks: diagonalize finite rings and compare with the formulas.
"""
import numpy as np

def ring(eps, hops):
    """Ring Hamiltonian with site energies eps[n] and hopping hops[n] between n and n+1."""
    N = len(eps); H = np.diag(np.asarray(eps, dtype=float))
    for n in range(N):
        H[n, (n + 1) % N] = H[(n + 1) % N, n] = -hops[n]
    return np.sort(np.linalg.eigvalsh(H))

def bands_sites(k, eA, eB, t):
    eb, D = 0.5 * (eA + eB), 0.5 * (eA - eB)
    r = np.sqrt(D**2 + 4 * t**2 * np.cos(k / 2) ** 2)
    return eb - r, eb + r

def bands_hops(k, t1, t2):
    r = np.abs(t1 + t2 * np.exp(-1j * k))
    return -r, r

if __name__ == "__main__":
    Nc = 40
    ks = 2 * np.pi * np.arange(Nc) / Nc
    eA, eB, t = 0.5, -0.5, 1.0
    num = ring(np.tile([eA, eB], Nc), np.full(2 * Nc, t))
    lo, hi = bands_sites(ks, eA, eB, t)
    ana = np.sort(np.concatenate([lo, hi]))
    print(f"(a) site energies {eA}, {eB}, t = {t}: max error {np.max(np.abs(num - ana)):.2e}")
    lo, hi = bands_sites(np.pi, eA, eB, t)
    print(f"    gap at k = pi/a: {hi - lo:.4f} (expect |eA - eB| = {abs(eA - eB):.4f}); "
          f"total width {2 * np.sqrt(0.25 + 4):.4f}")
    t1, t2 = 1.1, 0.9
    num = ring(np.zeros(2 * Nc), np.tile([t1, t2], Nc))
    lo, hi = bands_hops(ks, t1, t2)
    ana = np.sort(np.concatenate([lo, hi]))
    print(f"(b) alternating hopping {t1}, {t2}: max error {np.max(np.abs(num - ana)):.2e}")
    lo, hi = bands_hops(np.pi, t1, t2)
    print(f"    gap at k = pi/a: {hi - lo:.4f} (expect 2|t1 - t2| = {2 * abs(t1 - t2):.4f})")
    print("\nWith one electron per atom the lower band is exactly full -> insulator / semiconductor.")
    for d in (0.0, 0.05, 0.1, 0.2):
        print(f"  bond alternation t1 = 1 + {d}, t2 = 1 - {d}: gap = {4 * d:.2f} t0")
