"""
Week 3 - Spherical Harmonics & the Hydrogen Atom
Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)

Spherical harmonics Y_l^m(theta, phi) and hydrogen radial functions
R_nl(r) (in Bohr radii, a0 = 1), with:
  psi_nlm = R_nl(r) Y_l^m(theta, phi),  E_n = -13.6057 / n^2 eV.
Verifies: Y_l^m orthonormality on the sphere, R_nl normalization
int |R_nl|^2 r^2 dr = 1, <r>_1s = 1.5 a0, most-probable r_1s = a0,
and the virial theorem <V> = 2E.
"""
import numpy as np
from math import factorial, pi, sqrt

trapz = getattr(np, "trapezoid", getattr(np, "trapz", None))  # numpy 1.x/2.x compat

def assoc_legendre(l, m, x):
    """Associated Legendre P_l^m(x) (m >= 0) via stable recurrences."""
    m = abs(m)
    Pmm = np.ones_like(x)
    if m > 0:
        somx2 = np.sqrt((1.0 - x) * (1.0 + x))
        fact = 1.0
        for _ in range(m):
            Pmm *= -fact * somx2
            fact += 2.0
    if l == m: return Pmm
    Pm1 = x * (2 * m + 1) * Pmm
    if l == m + 1: return Pm1
    for ll in range(m + 2, l + 1):
        Pll = (x * (2 * ll - 1) * Pm1 - (ll + m - 1) * Pmm) / (ll - m)
        Pmm, Pm1 = Pm1, Pll
    return Pm1

def Ylm(l, m, theta, phi):
    """Complex spherical harmonic (Condon-Shortley phase)."""
    N = sqrt((2 * l + 1) / (4 * pi) * factorial(l - abs(m)) / factorial(l + abs(m)))
    P = assoc_legendre(l, m, np.cos(theta))
    Y = N * P * np.exp(1j * abs(m) * phi)
    if m < 0:
        Y = (-1.0) ** m * np.conj(Y)
    return Y

def laguerre(k, alpha, x):
    """Associated (generalized) Laguerre polynomial L_k^{(alpha)}(x) by recurrence."""
    if k == 0: return np.ones_like(x)
    Lm, Lc = np.ones_like(x), 1.0 + alpha - x
    for i in range(1, k):
        Lm, Lc = Lc, ((2 * i + 1 + alpha - x) * Lc - (i + alpha) * Lm) / (i + 1)
    return Lc

def R_nl(n, l, r):
    """Hydrogen radial function (a0 = 1): R_nl = N rho^l e^{-rho/2} L_{n-l-1}^{(2l+1)}(rho), rho = 2r/n."""
    rho = 2.0 * r / n
    N = sqrt((2.0 / n) ** 3 * factorial(n - l - 1) / (2.0 * n * factorial(n + l)))
    return N * rho ** l * np.exp(-rho / 2.0) * laguerre(n - l - 1, 2 * l + 1, rho)

if __name__ == "__main__":
    # 1) Y_l^m orthonormality: <l'm'|lm> over the sphere
    th = np.linspace(0, pi, 1201); ph = np.linspace(0, 2 * pi, 1201)
    TH, PH = np.meshgrid(th, ph, indexing="ij")
    dOm = np.sin(TH)
    def inner(l1, m1, l2, m2):
        f = np.conj(Ylm(l1, m1, TH, PH)) * Ylm(l2, m2, TH, PH) * dOm
        return trapz(trapz(f, ph, axis=1), th)
    print(f"<Y_0^0|Y_0^0> = {inner(0,0,0,0).real:.6f}")
    print(f"<Y_1^0|Y_1^0> = {inner(1,0,1,0).real:.6f}, <Y_2^1|Y_2^1> = {inner(2,1,2,1).real:.6f}")
    print(f"<Y_1^0|Y_2^0> = {inner(1,0,2,0).real:+.2e}, <Y_1^1|Y_1^-1> = {abs(inner(1,1,1,-1)):.2e}")

    # 2) Radial normalization: int R_nl^2 r^2 dr = 1
    r = np.linspace(1e-8, 120, 400001)
    for (n, l) in [(1, 0), (2, 0), (2, 1), (3, 2)]:
        I = trapz(R_nl(n, l, r) ** 2 * r ** 2, r)
        print(f"int R_{n}{l}^2 r^2 dr = {I:.6f}")

    # 3) <r>_1s = 1.5 a0, most probable r = a0
    P1s = R_nl(1, 0, r) ** 2 * r ** 2
    print(f"<r>_1s = {trapz(r * P1s, r):.5f} a0 (exact 1.5), r_mp = {r[np.argmax(P1s)]:.4f} a0 (exact 1)")

    # 4) Energy levels E_n = -13.6057 / n^2 eV and virial <V> = 2E
    Ry = 13.605693
    for n in [1, 2, 3]:
        print(f"E_{n} = {-Ry / n**2:.4f} eV")
    Vexp = trapz(-1.0 / r * P1s, r)          # <V> in Hartree = <-1/r>
    print(f"<V>_1s = {Vexp:.5f} Ha = 2*E_1 = {2 * (-0.5):.5f} Ha (virial)")

    # 5) Degeneracy without spin: sum_{l=0}^{n-1} (2l+1) = n^2
    for n in [1, 2, 3, 4]:
        print(f"n={n}: degeneracy = {sum(2 * l + 1 for l in range(n))} = n^2 = {n**2}")
