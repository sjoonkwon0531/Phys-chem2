// Auto-generated from codes/python/final_review_check.py — do not edit by hand
export const PY_REVIEW = `"""
Final review (Weeks 9-14) - numerical answers to the practice problems and the mock final
Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU

Run:  python final_review_check.py
Every number quoted in the "Practice" and "Mock final" tabs is printed here,
so you can check your hand calculation or change the inputs and explore.
"""
import numpy as np
from scipy.integrate import quad

h, c, kB, NA = 6.62607015e-34, 2.99792458e8, 1.380649e-23, 6.02214076e23
hbar, e, me, eps0 = h / (2 * np.pi), 1.602176634e-19, 9.1093837e-31, 8.8541878128e-12
R, amu, F = 8.314462618, 1.66053907e-27, 96485.332
kB_eV = kB / e

def head(s):
    print("\\n" + s + "\\n" + "-" * len(s))

# ---------------- Week 9 ----------------
head("W9-A  collision theory for H2 + C2H4 (300 K, 1 bar each)")
T = 300.0
mH2, mC2H4 = 2.016 * amu, 28.05 * amu
mu = mH2 * mC2H4 / (mH2 + mC2H4)
sigma = 0.27e-18
crel = np.sqrt(8 * kB * T / (np.pi * mu))
A_th = sigma * crel * NA * 1e3            # dm^3 mol^-1 s^-1
print(f"reduced mass = {mu / amu:.3f} u, c_rel = {crel:.0f} m/s")
print(f"A_theory = sigma c_rel N_A = {A_th:.2e} dm^3 mol^-1 s^-1")
A_exp = 1.24e6
print(f"steric factor P = A_exp/A_theory = {A_exp / A_th:.2e}")
Ea = 180e3
print(f"fraction with E > Ea: exp(-Ea/RT) at 300 K = {np.exp(-Ea / (R * T)):.2e}, at 600 K = {np.exp(-Ea / (R * 600)):.2e}")

head("W9-B  Eyring analysis of a unimolecular rearrangement")
T1, T2, k1, k2 = 300.0, 320.0, 1.0e-3, 8.0e-3
Ea = R * np.log(k2 / k1) / (1 / T1 - 1 / T2)
dH = Ea - R * T1
dS = R * (np.log(k1 * h / (kB * T1)) + dH / (R * T1))
print(f"Ea = {Ea / 1000:.1f} kJ/mol, dH = Ea - RT = {dH / 1000:.1f} kJ/mol, dS = {dS:.1f} J/K/mol")
print(f"kT/h at 300 K = {kB * T1 / h:.3e} s^-1")

# ---------------- Week 10 ----------------
head("W10-A  vibrational partition function (500 cm^-1, 300 K)")
nu = 500.0
x = h * c * 100 * nu / (kB * 300)
q = 1 / (1 - np.exp(-x))
P0 = 1 - np.exp(-x)
U = nu / (np.exp(x) - 1)                    # cm^-1 above zero point
Cv = x**2 * np.exp(x) / (np.exp(x) - 1)**2
print(f"x = hc nu/kT = {x:.3f}, q = {q:.4f}, P0 = {P0:.4f}, P1 = {P0 * np.exp(-x):.4f}")
print(f"mean energy above ZPE = {U:.1f} cm^-1, C_v/R = {Cv:.4f}")

head("W10-B  regular solution and Cahn-Hilliard (kappa_int = 6.0 kJ/mol)")
kap = 6.0e3
Tc = kap / (2 * R)
T = 320.0
chi = kap / (R * T)
phi_s = 0.5 * (1 - np.sqrt(1 - 2 / chi))
from scipy.optimize import brentq
phi_b = brentq(lambda p: np.log(p / (1 - p)) - chi * (2 * p - 1), 1e-6, 0.4999)
print(f"T_c = {Tc:.1f} K, chi(320 K) = {chi:.3f}, spinodal phi = {phi_s:.3f}, binodal phi = {phi_b:.3f}")
f2 = 1 / 0.5 + 1 / 0.5 - 2 * chi          # f''(phi) at 0.5 (per site, kT units)
lam_m = 2 * np.pi * np.sqrt(4 * 1.0 / (-f2))   # kappa_grad = 1: R(q) = -Mq^2 (f'' + 2 kappa q^2) -> q_m^2 = -f''/(4 kappa)
print(f"f''(0.5) = {f2:.3f} kT, fastest-growing wavelength (kappa_grad = 1) = {lam_m:.2f} lattice units")

# ---------------- Week 11 ----------------
head("W11-A  Marcus theory (lambda = 1.2 eV)")
lam_r = 1.2
for dG in (-0.3, -0.6, -1.2, -2.0):
    dGa = (lam_r + dG)**2 / (4 * lam_r)
    print(f"dG0 = {dG:+.1f} eV: dG_act = {dGa:.4f} eV, exp(-dG_act/kT) at 298 K = {np.exp(-dGa / (kB_eV * 298.15)):.3e}")

head("W11-B  1D monatomic chain (C = 20 N/m, m = 40 u, a = 0.40 nm)")
C, m, a = 20.0, 40 * amu, 0.40e-9
wmax = 2 * np.sqrt(C / m)
vs = a * np.sqrt(C / m)
print(f"omega_max = {wmax:.3e} rad/s = {wmax / (2 * np.pi * c * 100):.1f} cm^-1, sound speed = {vs:.0f} m/s")
k = np.pi / (2 * a)
vg = a * np.sqrt(C / m) * np.cos(k * a / 2)
print(f"group velocity at k = pi/2a: {vg:.0f} m/s ({vg / vs:.3f} of v_s); at k = pi/a: 0")

# ---------------- Week 12 ----------------
head("W12-A  heat capacity of aluminium at low T (theta_D = 428 K, gamma = 1.35 mJ/mol/K^2)")
A3 = 12 * np.pi**4 / 5 * R / 428**3
gam = 1.35e-3
for T in (2.0, 10.0):
    print(f"T = {T:4.1f} K: lattice {A3 * T**3 * 1e3:.4f} mJ/mol/K, electronic {gam * T * 1e3:.3f} mJ/mol/K")
print(f"crossover T* = sqrt(gamma/A) = {np.sqrt(gam / A3):.2f} K")
def debye(T, th):
    I, _ = quad(lambda x: x**4 * np.exp(x) / (np.exp(x) - 1)**2, 0, th / T)
    return 9 * R * (T / th)**3 * I
print(f"full Debye C_V at 300 K = {debye(300, 428):.2f} J/mol/K (3R = {3 * R:.2f})")

head("W12-B  tight-binding band (t = 0.8 eV, a = 3.0 A)")
t, aA = 0.8, 3.0
print(f"band width 4t = {4 * t:.1f} eV, m*/me = hbar^2/(2 t a^2 me) = {7.620 / (2 * t * aA**2):.3f}")
print(f"half filled: E_F at band centre, binding energy per atom -4t/pi = {-4 * t / np.pi:.3f} eV")

# ---------------- Week 13 ----------------
head("W13-A  powder pattern of BCC tungsten (a = 3.165 A, Cu K-alpha1)")
lam = 1.5406
for hkl in [(1, 1, 0), (2, 0, 0), (2, 1, 1), (2, 2, 0)]:
    N = sum(i * i for i in hkl); d = 3.165 / np.sqrt(N)
    print(f"{hkl}: d = {d:.4f} A, 2theta = {2 * np.degrees(np.arcsin(lam / (2 * d))):.2f} deg")
beta = np.radians(0.40); th = np.radians(40.26 / 2)
print(f"Scherrer size for FWHM 0.40 deg on (110): {0.9 * lam / (beta * np.cos(th)) / 10:.1f} nm")

head("W13-B  CsCl structure factor (f ~ electron count: Cs+ 54, Cl- 18)")
for hkl in [(1, 0, 0), (1, 1, 0), (1, 1, 1), (2, 0, 0)]:
    S = 54 + 18 * np.exp(-1j * np.pi * sum(hkl))
    print(f"{hkl}: S = {S.real:+.0f}, |S|^2 = {abs(S)**2:.0f}")

# ---------------- Week 14 ----------------
head("W14-A  Langmuir and isosteric enthalpy")
K300 = 0.20   # kPa^-1
for p in (1, 5, 20):
    print(f"p = {p} kPa: theta = {K300 * p / (1 + K300 * p):.3f}")
dH = -40e3
K350 = K300 * np.exp(-dH / R * (1 / 350 - 1 / 300))
print(f"K(350 K) = {K350:.4f} kPa^-1; pressure for theta = 0.5 at 350 K = {1 / K350:.1f} kPa")

head("W14-B  TPD and Langmuir-Hinshelwood")
Tp, beta, nu = 520.0, 8.0, 1e13
E = kB_eV * Tp * (np.log(nu * Tp / beta) - 3.64)
print(f"Redhead E_des = {E:.3f} eV = {E * 96.485:.0f} kJ/mol, tau(300 K) = {np.exp(E / (kB_eV * 300)) / nu:.2e} s")
y = 3.0
print(f"LH maximum at K_A p_A = 1 + K_B p_B = {1 + y:.1f}; theta_A = {(1 + y) / (2 + 2 * y):.3f}, theta_B = {y / (2 + 2 * y):.3f}, rate/k = {y / (4 * (1 + y)):.4f}")

# ================= Mock final =================
head("MOCK 1  collision theory and transition-state theory")
T = 500.0
m = 30.0 * amu; d = 0.36e-9
sig = np.pi * d**2
cbar = np.sqrt(8 * kB * T / (np.pi * m)); crel = np.sqrt(2) * cbar
n = 1e5 / (kB * T)
z = sig * crel * n
print(f"sigma = {sig * 1e18:.3f} nm^2, c_rel = {crel:.0f} m/s, n = {n:.3e} m^-3, z = {z:.3e} s^-1")
A_th = sig * crel * NA * 1e3
print(f"A_theory = {A_th:.3e} dm^3/mol/s")
dH, dS = 80e3, -60.0
kTST = kB * T / h * np.exp(dS / R) * np.exp(-dH / (R * T))
print(f"Eyring k = {kTST:.3e} dm^3/mol/s; Ea = dH + 2RT (bimolecular gas, c-standard) = {(dH + 2 * R * T) / 1000:.1f} kJ/mol")

head("MOCK 2  two-level system and ensemble")
eps_cm = 400.0
for T in (300.0, 1000.0):
    x = h * c * 100 * eps_cm / (kB * T)
    qq = 1 + 3 * np.exp(-x)
    U = 3 * np.exp(-x) / qq
    Cv = x**2 * 3 * np.exp(-x) / qq**2
    S = np.log(qq) + x * U
    print(f"T = {T:.0f} K: x = {x:.3f}, q = {qq:.4f}, U/(N eps) = {U:.4f}, S/Nk = {S:.4f}, C_V/Nk = {Cv:.4f}")
print(f"high-T limit S/Nk = ln 4 = {np.log(4):.4f}")

head("MOCK 3  diatomic chain and Einstein/Debye")
m1, m2, Cs = 24.31 * amu, 16.00 * amu, 60.0
w_op0 = np.sqrt(2 * Cs * (1 / m1 + 1 / m2))
w_op_b = np.sqrt(2 * Cs / m2); w_ac_b = np.sqrt(2 * Cs / m1)
tocm = lambda w: w / (2 * np.pi * c * 100)
print(f"optical k=0: {tocm(w_op0):.0f} cm^-1; zone boundary optical {tocm(w_op_b):.0f}, acoustic {tocm(w_ac_b):.0f} cm^-1 (gap {tocm(w_op_b) - tocm(w_ac_b):.0f})")
thE = h * c * 100 * tocm(w_op0) / kB
xE = thE / 300
print(f"theta_E (from optical k=0) = {thE:.0f} K; Einstein C_V/3R at 300 K = {xE**2 * np.exp(xE) / (np.exp(xE) - 1)**2:.3f}")

head("MOCK 4  Hueckel ring of 4 and band")
for N in (4, 6):
    lv = sorted(-2 * np.cos(2 * np.pi * np.arange(N) / N))
    print(f"ring N = {N}: levels (units |beta|, alpha = 0) {np.round(lv, 3)}")
print("cyclobutadiene: 4 e- -> 2 in alpha+2beta, 1 each in two alpha levels -> E_pi = 4alpha + 4beta; delocalisation 0")

head("MOCK 5  crystallography (FCC Ni, a = 3.524 A, Cu K-alpha1)")
a = 3.524
allowed = [(1, 1, 1), (2, 0, 0), (2, 2, 0), (3, 1, 1), (2, 2, 2)]
for hkl in allowed:
    N = sum(i * i for i in hkl); d = a / np.sqrt(N)
    print(f"{hkl}: N = {N}, d = {d:.4f} A, 2theta = {2 * np.degrees(np.arcsin(lam / (2 * d))):.2f} deg")
print(f"density = 4 x 58.69/(N_A a^3) = {4 * 58.69 / (NA * (a * 1e-8)**3):.3f} g/cm^3")
print(f"N_max = (2a/lam)^2 = {(2 * a / lam)**2:.2f}")
print(f"(110) plane intercepts a,a,inf; d_110 = {a / np.sqrt(2):.4f} A (absent in FCC)")

head("MOCK 6  BET surface area and LH")
S_, I_ = 4.95e-3, 2.5e-5      # cm^-3 (STP)
Vm = 1 / (S_ + I_); cBET = 1 + S_ / I_
nmon = 101325 * Vm * 1e-6 / (R * 273.15)
area = nmon * NA * 0.162e-18
print(f"V_mon = {Vm:.1f} cm^3, c = {cBET:.0f}, area = {area:.1f} m^2 -> {area / 0.80:.0f} m^2/g for 0.80 g")
print(f"E1 - EL = RT ln c (77 K) = {R * 77 * np.log(cBET) / 1000:.2f} kJ/mol")
`;
