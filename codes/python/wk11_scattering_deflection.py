"""
Week 11 - Classical elastic scattering: deflection function and cross sections
Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)

theta(b) = pi - 2 b * Integral_{r0}^{inf} dr / ( r^2 sqrt(1 - b^2/r^2 - V(r)/E) )
r0 = classical turning point (largest root of the square-root argument).
Substitution u = r0/r, u = 1 - w^2 removes the 1/sqrt singularity at r = r0.

Checks:
  * hard sphere (diameter d): theta = 2 arccos(b/d), dsigma/dOmega = d^2/4 (isotropic),
    total cross section = pi d^2
  * Lennard-Jones (reduced units eps = sigma = 1): rainbow angle and glory impact parameter
"""
import numpy as np

def V_lj(r):
    return 4.0 * (r**-12 - r**-6)

def turning_point(b, E, V):
    """Largest r where 1 - b^2/r^2 - V(r)/E = 0 (scan inward, then bisection)."""
    f = lambda r: 1.0 - (b / r)**2 - V(r) / E
    rs = np.linspace(max(5.0, 3.0 * b), 0.5, 6000)
    fv = f(rs)
    for i in range(len(rs) - 1):
        if fv[i] > 0 and fv[i + 1] <= 0:
            lo, hi = rs[i + 1], rs[i]
            for _ in range(80):
                mid = 0.5 * (lo + hi)
                if f(mid) > 0: hi = mid
                else: lo = mid
            return 0.5 * (lo + hi)
    raise ValueError("no turning point")

def deflection(b, E, V=V_lj, N=1000):
    r0 = turning_point(b, E, V)
    w = (np.arange(N) + 0.5) / N
    u = 1.0 - w * w
    g = 1.0 - (b * u / r0)**2 - V(r0 / u) / E
    integral = np.sum(2.0 * w / np.sqrt(np.maximum(g, 1e-300))) / N
    return np.pi - 2.0 * b / r0 * integral

def hard_sphere_check(d=1.0, n=200000, seed=1):
    """Monte Carlo: uniform beam over a disk of radius d; histogram of cos(theta)."""
    rng = np.random.default_rng(seed)
    b = d * np.sqrt(rng.random(n))          # uniform in area
    theta = 2.0 * np.arccos(b / d)
    hist, _ = np.histogram(np.cos(theta), bins=10, range=(-1, 1))
    # dsigma/dOmega = (pi d^2 / n) * counts / (2 pi * dcos)
    dsdo = np.pi * d**2 * hist / n / (2 * np.pi * 0.2)
    return dsdo

if __name__ == "__main__":
    print("Hard sphere dsigma/dOmega per cos-bin (expect d^2/4 = 0.25):")
    print("  ", np.round(hard_sphere_check(), 3))
    print("Hard sphere total cross section = pi d^2 =", round(np.pi, 4))
    print("\nLennard-Jones deflection function (reduced units)")
    for E in [2.0, 5.0, 10.0]:
        bs = np.linspace(0.02, 3.0, 600)
        th = np.array([deflection(b, E) for b in bs])
        i = int(np.argmin(th))
        glory = bs[:i][np.argmin(np.abs(th[:i]))]
        print(f"  E* = {E:5.1f}: rainbow angle = {np.degrees(th[i]):7.2f} deg at b = {bs[i]:.3f},"
              f"  glory (theta = 0) at b = {glory:.3f}")
    print("\ntheta(b) table at E* = 2:")
    for b in [0.2, 0.6, 1.0, 1.2, 1.453, 2.0, 2.5]:
        print(f"  b = {b:5.3f}  theta = {np.degrees(deflection(b, 2.0)):8.2f} deg")
