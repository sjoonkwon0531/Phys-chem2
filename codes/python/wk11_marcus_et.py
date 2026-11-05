"""
Week 11 - Electron transfer: Marcus theory and the bimolecular steady state
Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)

Marcus parabolas (reaction coordinate q, q0 = displacement of the product well):
  G_R(q) = lam q^2 / q0^2,  G_P(q) = lam (q - q0)^2 / q0^2 + dG0,  lam = k_e q0^2 / 2
  crossing: q* = (q0/2)(1 + dG0/lam),   dG* = (lam + dG0)^2 / (4 lam)
Semiclassical (nonadiabatic) rate:
  k_ET = (2 pi / hbar) |V|^2 (4 pi lam kT)^(-1/2) exp[ -(lam + dG0)^2 / (4 lam kT) ]
Bimolecular steady state (lecture scheme D + A <-> DA <-> D+A- -> products):
  1/k_r = 1/k_a + k_a'/(k_a k_et) (1 + k_et'/k_d),   k_et' = k_et exp(dG0/kT)
"""
import numpy as np

HBAR = 6.582119569e-16      # eV s
KB = 8.617333262e-5         # eV/K

def dG_act(lam, dG0):
    return (lam + dG0)**2 / (4 * lam)

def k_marcus(dG0, lam, V, T=298.15):
    kT = KB * T
    return 2 * np.pi / HBAR * V**2 / np.sqrt(4 * np.pi * lam * kT) * np.exp(-dG_act(lam, dG0) / kT)

def k_bimolecular(dG0, lam, V, ka=7.4e9, KA=1.0, kd=None, T=298.15):
    """ka in M^-1 s^-1 (diffusion), KA = ka/ka' encounter-pair constant in M^-1."""
    kT = KB * T
    ka_rev = ka / KA                         # s^-1
    kd = ka_rev if kd is None else kd        # separation of D+ A- pair (s^-1)
    ket = k_marcus(dG0, lam, V, T)
    ket_rev = ket * np.exp(dG0 / kT)
    return 1.0 / (1.0 / ka + ka_rev / (ka * ket) * (1.0 + ket_rev / kd))

if __name__ == "__main__":
    T = 298.15
    eta = 0.890e-3                                # water viscosity, Pa s
    ka = 8 * 8.314462618 * T / (3 * eta) * 1e3    # m^3 mol^-1 s^-1 -> M^-1 s^-1
    print(f"Diffusion-limited k_a = 8RT/3eta (water, 298 K) = {ka:.2e} M^-1 s^-1")
    lam, V = 1.0, 0.01                            # eV
    kmax = k_marcus(-lam, lam, V, T)
    print(f"lambda = {lam} eV, V = {V} eV:  k_ET(max, at dG0 = -lambda) = {kmax:.3e} s^-1")
    print("\n  dG0 (eV)   dG* (eV)   k_ET (s^-1)   k_r bimolecular (M^-1 s^-1)")
    for dG0 in [0.2, 0.0, -0.25, -0.5, -1.0, -1.5, -2.0, -2.5, -3.0]:
        print(f"  {dG0:6.2f}   {dG_act(lam, dG0):8.4f}   {k_marcus(dG0, lam, V, T):11.3e}"
              f"   {k_bimolecular(dG0, lam, V, ka=ka, T=T):11.3e}")
    # inverted-region symmetry check: equal |dG0 + lam| -> equal k
    print("\nSymmetry check k(-0.5) / k(-1.5) =", k_marcus(-0.5, lam, V) / k_marcus(-1.5, lam, V))
    # protein tunnelling: rate at closest contact ~1e13 s^-1, 10x slower per 1.7 A
    beta = np.log(10) / 1.7
    print(f"Tunnelling decay 10x per 1.7 A  ->  beta = {beta:.2f} 1/A (rate),"
          f" k(14 A)/k(4 A) = {np.exp(-beta * 10):.1e}")
