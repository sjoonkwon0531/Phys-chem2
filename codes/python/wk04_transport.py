"""
Wk04 — Transport properties of a perfect gas
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Collision kinetics:  z = sigma v_rel N/V,  lambda = kT/(sqrt2 sigma P)
    -> N2 at 1 atm, 25 C: lambda ~ 67 nm (the lecture's number)
(2) Transport coefficients from the same random walk:
      D  = (1/3) lambda v_mean            [m^2/s]
      k  = (1/3) lambda v_mean rho Cp ... kappa = (1/3) lambda v_mean
      eta= (1/3) lambda v_mean rho  (kinematic; mu = eta rho form in slides)
    Reynolds analogy: Sc = eta/D, Pr = eta/kappa, Le = kappa/D ~ O(1)
(3) Effusion (Knudsen): rate = P A0 / sqrt(2 pi m k T)
    -> lecture example: Cs at 500 K, 0.50 mm hole, 385 mg in 100 s
       P = sqrt(2 pi R T / M) dm/(A0 dt) = 8.7 kPa

Run:  python wk04_transport.py
"""
import numpy as np

kB = 1.380649e-23        # J/K
NA = 6.02214076e23
R = kB * NA

# collision cross sections from the lecture table [nm^2]
sigma = {"He": 0.21, "N2": 0.43, "CO2": 0.52, "C6H6": 0.88}
Mmol = {"He": 4.003e-3, "N2": 28.0134e-3, "CO2": 44.01e-3, "C6H6": 78.11e-3}

T, P = 298.15, 101325.0
print(f"gas    sigma[nm^2]  v_mean[m/s]  lambda[nm]   z[1/s]")
for g in ("He", "N2", "CO2", "C6H6"):
    s = sigma[g] * 1e-18
    vmean = np.sqrt(8 * R * T / (np.pi * Mmol[g]))
    lam = kB * T / (np.sqrt(2) * s * P)
    z = vmean / lam
    print(f"{g:5s}  {sigma[g]:10.2f}  {vmean:11.1f}  {lam*1e9:10.1f}  {z:.3e}")
print("-> N2: lambda ~ 67 nm at 1 atm — ~200x the molecular size; "
      "each molecule collides ~7 billion times per second\n")

# -- (2) transport coefficients for N2 ------------------------
s = sigma["N2"] * 1e-18
vmean = np.sqrt(8 * R * T / (np.pi * Mmol["N2"]))
lam = kB * T / (np.sqrt(2) * s * P)
n_dens = P / (kB * T)                     # molecules / m^3
rho = n_dens * Mmol["N2"] / NA            # kg/m^3
D = lam * vmean / 3
eta_kin = D                               # same 1/3 lambda v for kinematic visc.
mu_dyn = rho * eta_kin                    # dynamic viscosity
CVm = 2.5 * R                             # diatomic near RT
kth = (1/3) * vmean * lam * n_dens / NA * CVm   # = 1/3 v lambda [J] Cv,m
print(f"N2 (298 K, 1 atm):")
print(f"  D (self-diffusion) = {D*1e5:.2f} x 10^-5 m^2/s  (exp ~2.0 x 10^-5)")
print(f"  mu (dyn viscosity) = {mu_dyn*1e6:.1f} uPa s      (exp ~17.9 uPa s)")
print(f"  k (thermal cond.)  = {kth*1e3:.1f} mW/m K      (exp ~25.8 mW/m K)")
print(f"  Sc = mu/(rho D)    = {mu_dyn/(rho*D):.2f},  Pr ~ Sc ~ 1 (Reynolds analogy)")
print("  (order-of-magnitude agreement: the kinetic model earns its keep)\n")

# pressure independence of viscosity! (lambda ~ 1/P but n ~ P)
print("mu at 0.1, 1, 10 atm:", end=" ")
for Pfac in (0.1, 1.0, 10.0):
    lam_ = kB * T / (np.sqrt(2) * s * (P * Pfac))
    rho_ = (P * Pfac / (kB * T)) * Mmol["N2"] / NA
    print(f"{rho_ * lam_ * vmean / 3 * 1e6:.1f}", end=" ")
print("uPa s -> INDEPENDENT of P (Maxwell's surprise, verified by experiment)\n")

# -- (3) effusion: Cs vapor-pressure example ------------------
M_Cs = 132.905e-3
T_Cs = 500.0
d_hole = 0.50e-3
A0 = np.pi * (d_hole / 2)**2
dm, dt = 385e-6, 100.0
P_Cs = np.sqrt(2 * np.pi * R * T_Cs / M_Cs) * dm / (A0 * dt)
print(f"Cs effusion (lecture example): A0 = {A0*1e6:.3f} mm^2")
print(f"  P = sqrt(2 pi R T / M) dm/(A0 dt) = {P_Cs/1e3:.2f} kPa  (lecture: 8.7 kPa)")
Zw = P_Cs / np.sqrt(2 * np.pi * (M_Cs / NA) * kB * T_Cs)
print(f"  collision flux Zw = {Zw:.3e} m^-2 s^-1 = 1/4 n v_mean")
