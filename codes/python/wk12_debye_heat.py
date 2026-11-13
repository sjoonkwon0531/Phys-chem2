"""
Week 12 - Debye model: counting phonon modes and the T^3 law
Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)

Periodic box of side L: k = (2 pi / L)(n_x, n_y, n_z). Number of k points inside a sphere of radius k:
  N(k) = V k^3 / (6 pi^2)        ->   D(omega) = V omega^2 / (2 pi^2 v^3) per polarization
Debye: 3 polarizations, linear dispersion omega = v k, cutoff omega_D so that the total is 3N modes.
  U = 9 N k T (T/theta_D)^3 int_0^{x_D} x^3/(e^x - 1) dx
  C_V = 9 N k (T/theta_D)^3 int_0^{x_D} x^4 e^x/(e^x - 1)^2 dx,   x_D = theta_D / T
Limits: T >> theta_D -> 3Nk;  T << theta_D -> (12 pi^4/5) N k (T/theta_D)^3.
"""
import numpy as np

R = 8.314462618

def count_k_points(L_over_2pi_kmax):
    """Count integer triples (n_x,n_y,n_z) with |n| <= M, compare with (4/3) pi M^3."""
    M = L_over_2pi_kmax
    n = np.arange(-int(M) - 1, int(M) + 2)
    nx, ny, nz = np.meshgrid(n, n, n, indexing="ij")
    return np.count_nonzero(nx**2 + ny**2 + nz**2 <= M**2), 4 / 3 * np.pi * M**3

def debye_cv(T, theta, n=4000):
    """Molar heat capacity of a Debye solid (J mol^-1 K^-1), Simpson-free midpoint rule in x."""
    T = np.atleast_1d(np.asarray(T, dtype=float))
    out = []
    for t in T:
        xD = theta / t
        x = (np.arange(n) + 0.5) * xD / n
        f = x**4 * np.exp(x) / np.expm1(x) ** 2
        out.append(9 * R * (t / theta) ** 3 * np.sum(f) * xD / n)
    return np.array(out)

def debye_u(T, theta, n=4000):
    """Thermal energy U(T) - U(0) per mole (J/mol)."""
    xD = theta / T
    x = (np.arange(n) + 0.5) * xD / n
    return 9 * R * T * (T / theta) ** 3 * np.sum(x**3 / np.expm1(x)) * xD / n

if __name__ == "__main__":
    print("Counting allowed k points in a sphere (radius M in units of 2 pi / L):")
    for M in (5, 10, 20, 40):
        c, f = count_k_points(M)
        print(f"  M = {M:3d}: lattice points {c:8d}, (4/3) pi M^3 = {f:10.1f}, ratio {c / f:.4f}")
    A = 12 * np.pi**4 / 5 * R
    print(f"\nT^3-law coefficient (12 pi^4/5) R = {A:.1f} J mol^-1 K^-1")
    print(f"integral_0^inf x^3/(e^x-1) dx = pi^4/15 = {np.pi**4 / 15:.6f}")
    theta = 343.0      # Debye temperature of copper (K)
    print(f"\nDebye solid with theta_D = {theta} K (copper):")
    for T in (5, 10, 20, 40, 100, 200, 300, 1000):
        cv = debye_cv(T, theta)[0]
        low = A * (T / theta) ** 3
        print(f"  T = {T:5d} K: C_V = {cv:8.4f} J/mol/K   T^3 law = {low:9.4f}   C_V/3R = {cv / (3 * R):.4f}")
    # cooling 1 kg of copper from 300 K to 77 K: enthalpy released (C_p ~ C_V for solids)
    M_cu = 63.546e-3
    dU = debye_u(300.0, theta) - debye_u(77.0, theta)
    print(f"\nCooling copper 300 K -> 77 K: Debye  dH = {dU / M_cu / 1e3:.1f} kJ/kg;"
          f"  Dulong-Petit 3R dT = {3 * R * 223 / M_cu / 1e3:.1f} kJ/kg")
