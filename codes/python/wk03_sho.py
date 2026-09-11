"""
Week 3 - Quantum Harmonic Oscillator
Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)

Solves the SHO via Hermite polynomials:
  psi_n(y) = (1/pi)^(1/4) / sqrt(2^n n!) * H_n(y) * exp(-y^2/2),
  y = sqrt(m*omega/hbar) x,  E_n = (n + 1/2) hbar*omega
Verifies: Hermite orthogonality, normalization, virial theorem,
and the classically forbidden ("tunneling") probability.
"""
import numpy as np
from math import factorial, pi, sqrt

trapz = getattr(np, "trapezoid", getattr(np, "trapz", None))  # numpy 1.x/2.x compat

def hermite(n, y):
    """Physicists' Hermite polynomial H_n(y) via H_{n+1} = 2y H_n - 2n H_{n-1}."""
    if n == 0: return np.ones_like(y)
    if n == 1: return 2.0 * y
    Hm, Hc = np.ones_like(y), 2.0 * y
    for k in range(1, n):
        Hm, Hc = Hc, 2.0 * y * Hc - 2.0 * k * Hm
    return Hc

def psi(n, y):
    """Normalized SHO eigenfunction in dimensionless y (hbar = m = omega = 1)."""
    norm = 1.0 / sqrt(2.0**n * factorial(n)) * (1.0 / pi)**0.25
    return norm * hermite(n, y) * np.exp(-y**2 / 2.0)

if __name__ == "__main__":
    y = np.linspace(-12, 12, 240001)

    # 1) Hermite orthogonality: int e^{-y^2} H_m H_n dy = 2^n n! sqrt(pi) delta_mn
    print("Hermite orthogonality (integral / 2^n n! sqrt(pi)):")
    for m in range(4):
        row = [trapz(np.exp(-y**2) * hermite(m, y) * hermite(n, y), y)
               / (2.0**n * factorial(n) * sqrt(pi)) for n in range(4)]
        print("  ", ["%+.6f" % v for v in row])

    # 2) Normalization of psi_n
    for n in [0, 1, 5, 10]:
        print(f"<psi_{n}|psi_{n}> = {trapz(psi(n, y)**2, y):.6f}")

    # 3) Virial theorem: <V> = E_n/2 (units of hbar*omega)
    for n in [0, 3]:
        V = trapz(0.5 * y**2 * psi(n, y)**2, y)
        print(f"n={n}: <V> = {V:.5f}  (E_n/2 = {(n + 0.5) / 2:.5f})")

    # 4) Classical turning point y_tp = sqrt(2n+1) & forbidden-region probability
    for n in [0, 1, 5]:
        ytp = sqrt(2 * n + 1.0)
        Pout = trapz(np.where(np.abs(y) > ytp, psi(n, y)**2, 0.0), y)
        print(f"n={n}: y_tp = {ytp:.4f}, P(classically forbidden) = {Pout:.4f}")
