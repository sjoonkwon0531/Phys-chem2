"""
Wk04 — Kinetic model & Maxwell-Boltzmann distribution
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Kinetic pressure: P V = (1/3) n M <v^2>  ->  v_rms = sqrt(3RT/M)
(2) Maxwell speed distribution
      f(v) = 4 pi (M/2 pi R T)^{3/2} v^2 exp(-M v^2 / 2RT)
    characteristic speeds  v_mp = sqrt(2RT/M) < v_mean = sqrt(8RT/piM)
                           < v_rms = sqrt(3RT/M)
(3) Equipartition -> heat capacity ladder: Cv = (f/2) R with accessible
    degrees of freedom f = 3 (trans) + 2 (rot) + 2 (vib) as T grows.

Run:  python wk04_maxwell_boltzmann.py
"""
import numpy as np
import matplotlib.pyplot as plt

trapz = getattr(np, "trapezoid", getattr(np, "trapz", None))
R = 8.314462618          # J/mol K

def f_speed(v, M, T):
    a = M / (2 * np.pi * R * T)
    return 4 * np.pi * a**1.5 * v**2 * np.exp(-M * v**2 / (2 * R * T))

def speeds(M, T):
    return (np.sqrt(2 * R * T / M),        # most probable
            np.sqrt(8 * R * T / (np.pi * M)),  # mean
            np.sqrt(3 * R * T / M))        # rms

# -- (1)(2) normalization + moments for N2 at 298 K ----------
M_N2, T = 0.0280134, 298.15
v = np.linspace(0, 3000, 60001)
fv = f_speed(v, M_N2, T)
vmp, vmean, vrms = speeds(M_N2, T)
print("N2 at 298 K:")
print(f"  int f dv        = {trapz(fv, v):.6f} (-> 1)")
print(f"  v_mp            = {vmp:7.1f} m/s  (numeric argmax {v[np.argmax(fv)]:.1f})")
print(f"  v_mean          = {vmean:7.1f} m/s  (numeric {trapz(v*fv, v):.1f})")
print(f"  v_rms           = {vrms:7.1f} m/s  (numeric {np.sqrt(trapz(v**2*fv, v)):.1f})")
print(f"  <KE> per mole   = {0.5*M_N2*trapz(v**2*fv, v):.1f} J = 3/2 RT = {1.5*R*T:.1f} J")
print(f"  ratio v_mp : v_mean : v_rms = 1 : {vmean/vmp:.4f} : {vrms/vmp:.4f} "
      f"(theory 1 : 1.1284 : 1.2247)\n")

# -- plot distributions --------------------------------------
plt.figure(figsize=(11, 4.2))
plt.subplot(1, 2, 1)
for Tp in (100, 298, 1000):
    plt.plot(v[:20000], f_speed(v[:20000], M_N2, Tp), label=f"N$_2$, T = {Tp} K")
plt.xlabel("v [m/s]"); plt.ylabel("f(v)"); plt.legend()
plt.title("hotter -> broader & faster")
plt.subplot(1, 2, 2)
for Mi, lb in ((0.002016, "H$_2$"), (0.004003, "He"), (0.0280134, "N$_2$"), (0.1313, "Xe")):
    plt.plot(v, f_speed(v, Mi, 298.15), label=lb)
plt.xlabel("v [m/s]"); plt.legend(); plt.title("lighter -> faster (T = 298 K)")
plt.tight_layout(); plt.show()

# -- (3) equipartition heat-capacity ladder (diatomic) -------
print("accessible DOF f  ->  Cv = f/2 R      (diatomic gas, schematic)")
for f_dof, regime in ((3, "T < ~80 K   translation only"),
                      (5, "300 K       + rotation"),
                      (7, "T > ~3000 K + vibration")):
    print(f"  f = {f_dof}: Cv = {f_dof/2:.1f} R = {f_dof/2*R:6.2f} J/mol K   {regime}")
print("-> quantum energy spacing freezes DOF out: Cv steps 3/2R -> 5/2R -> 7/2R")
print("   (rotation/vibration quantization from Weeks 3-4 explains a GAS property!)")
