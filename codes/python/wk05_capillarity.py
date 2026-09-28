"""
Wk05 — Surface tension: Young-Laplace, capillary rise, wetting, Kelvin
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Young-Laplace: Delta p = sigma (1/R1 + 1/R2)  -> 2 sigma/r for a sphere
(2) Capillary rise: sigma = rho g h a / (2 cos theta)  (lecture derivation)
(3) Young's equation: cos theta_c = (sigma_sg - sigma_sl)/sigma_lg,
    work of adhesion  w_ad = sigma_lg (1 + cos theta_c)
(4) Kelvin equation: p/p* = exp(2 sigma V_m / r R T)  -> Ostwald ripening

Run:  python wk05_capillarity.py
"""
import numpy as np
import matplotlib.pyplot as plt

R = 8.314462618
G = 9.80665
SIG_W = 72.75e-3          # N/m, water 293 K (lecture table)
RHO_W = 998.0
VM_W = 1.807e-5           # m^3/mol, water molar volume

# -- (1) Young-Laplace ----------------------------------------
print("water droplet radius     excess pressure 2 sigma/r")
for r in (1e-3, 1e-6, 1e-8):
    dp = 2 * SIG_W / r
    print(f"  {r*1e9:12.0f} nm    {dp:12.3e} Pa  = {dp/101325:8.3f} atm")
print("-> a 10 nm droplet carries ~140 atm of Laplace pressure!\n")

# -- (2) capillary rise ---------------------------------------
def rise(sigma, rho, a, theta_deg=0.0):
    return 2 * sigma * np.cos(np.radians(theta_deg)) / (rho * G * a)

print("capillary rise h = 2 sigma cos(theta) / (rho g a):")
for a in (0.2e-3, 0.5e-3, 1e-3):
    print(f"  water, glass tube a = {a*1e3:.1f} mm: h = {rise(SIG_W, RHO_W, a)*1e3:7.1f} mm")
hg = rise(472e-3, 13546.0, 0.5e-3, 140.0)
print(f"  mercury (theta=140deg), a = 0.5 mm: h = {hg*1e3:7.1f} mm (DEPRESSION)\n")

# drop-weight method sanity: water drop from D = 3 mm tip
D = 3e-3
M = SIG_W * np.pi * D / G
print(f"drop-weight method: tip D = 3 mm releases drops of m = {M*1e6:.1f} mg "
      f"(sigma = Mg/pi D)\n")

# -- (3) Young's equation & wetting ---------------------------
print("surface           theta_c   cos     w_ad/sigma_lg = 1+cos")
for name, th in (("clean glass", 5.0), ("polymer", 95.0), ("rubber", 110.0), ("PTFE", 125.0)):
    c = np.cos(np.radians(th))
    print(f"  {name:14s}  {th:6.0f}   {c:+.3f}   {1+c:7.3f}   "
          f"{'wets' if th < 90 else 'does not wet'}")
print("-> 1 < w_ad/sigma_lg < 2 : wetting;  0 < ratio < 1 : non-wetting\n")

# -- (4) Kelvin equation --------------------------------------
T = 298.15
print("Kelvin equation for water droplets, p/p* = exp(2 sigma Vm / r R T):")
for r in (1e-6, 1e-7, 1e-8, 1e-9):
    ratio = np.exp(2 * SIG_W * VM_W / (r * R * T))
    print(f"  r = {r*1e9:6.0f} nm:  p/p* = {ratio:8.3f}")
print("-> small droplets evaporate into big ones: Ostwald ripening")
print("   (why cloud formation needs nucleation seeds, and why nanocrystal")
print("    syntheses ripen — the SAME 2 sigma Vm / rRT exponent)\n")

# plots
fig, ax = plt.subplots(1, 2, figsize=(10.5, 4))
rr = np.logspace(-9, -6, 200)
ax[0].loglog(rr * 1e9, 2 * SIG_W / rr / 1e5)
ax[0].set_xlabel("r [nm]"); ax[0].set_ylabel("Laplace pressure [bar]")
ax[0].set_title("2$\\sigma$/r: why nano-emulsions are stiff")
ax[1].semilogx(rr * 1e9, np.exp(2 * SIG_W * VM_W / (rr * R * T)))
ax[1].axhline(1, ls="--", c="gray")
ax[1].set_xlabel("r [nm]"); ax[1].set_ylabel("p/p*")
ax[1].set_title("Kelvin: vapor pressure of curved surfaces")
plt.tight_layout(); plt.show()
