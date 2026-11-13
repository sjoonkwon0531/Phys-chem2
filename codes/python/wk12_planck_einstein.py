"""
Week 12 - Planck distribution and the Einstein heat capacity
Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)

Quantum oscillator levels E_s = (s + 1/2) hbar*omega, Boltzmann weights exp(-s x), x = hbar*omega/kT.
  <n> = sum_s s e^{-s x} / sum_s e^{-s x} = 1 / (e^x - 1)          (Planck distribution)
  <E> = hbar*omega (<n> + 1/2)
Einstein solid (3N oscillators of one frequency omega_E, theta_E = hbar*omega_E/k):
  C_V = 3 N k x^2 e^x / (e^x - 1)^2,  x = theta_E / T
Checks: direct level sums equal the closed form; C_V -> 3R at high T (Dulong-Petit).
"""
import numpy as np

R = 8.314462618

def planck_n(x):
    return 1.0 / np.expm1(x)

def planck_n_by_sum(x, smax=4000):
    s = np.arange(smax)
    w = np.exp(-s * x)
    return np.sum(s * w) / np.sum(w)

def einstein_cv(T, theta):
    """Molar heat capacity (J mol^-1 K^-1) of an Einstein solid."""
    x = theta / np.asarray(T, dtype=float)
    return 3 * R * x**2 * np.exp(x) / np.expm1(x) ** 2

if __name__ == "__main__":
    print("Planck distribution: direct sum vs 1/(e^x - 1)")
    for x in (0.1, 0.5, 1.0, 2.0, 5.0):
        print(f"  x = {x:3.1f}:  sum = {planck_n_by_sum(x):.8f}   formula = {planck_n(x):.8f}")
    print("\nLevel populations P_s = (1 - e^-x) e^(-s x) at x = 1:",
          np.round((1 - np.exp(-1)) * np.exp(-np.arange(5)), 4))
    print("\nClassical limit: <n> -> kT/(hbar w) - 1/2 for small x;  x = 0.01 gives",
          f"{planck_n(0.01):.4f} vs {1/0.01 - 0.5:.4f}")
    theta = 240.0      # illustrative Einstein temperature (K)
    print(f"\nEinstein solid, theta_E = {theta} K:  C_V / 3R")
    for T in (10, 30, 60, 120, 240, 600, 2000):
        print(f"  T = {T:5d} K:  C_V = {einstein_cv(T, theta):7.3f} J/mol/K   C_V/3R = {einstein_cv(T, theta) / (3 * R):.4f}")
    print(f"\nDulong-Petit 3R = {3 * R:.3f} J/mol/K")
