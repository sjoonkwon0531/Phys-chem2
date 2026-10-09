"""
Midterm review (Weeks 1-6) - numerical answers to the practice problems
Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU

Run:  python midterm_review_check.py
Every number quoted in the "Practice" and "2025 midterm" tabs is printed here,
so you can check your hand calculation or change the inputs and explore.
"""
import numpy as np

h, c, kB, NA = 6.62607015e-34, 2.99792458e8, 1.380649e-23, 6.02214076e23
hbar, e, me, eps0 = h / (2 * np.pi), 1.602176634e-19, 9.1093837e-31, 8.8541878128e-12
R, g = 8.314462618, 9.81

def head(s):
    print("\n" + s + "\n" + "-" * len(s))

# ---------------- Week 1 ----------------
head("W1-A  laser pointer and blackbody")
P, lam = 5.0e-3, 532e-9
print(f"photons per second      = {P * lam / (h * c):.3e} s^-1")
T = 2.898e-3 / lam
print(f"T with peak at 532 nm   = {T:.0f} K")
x = h * c / (lam * kB * T)
print(f"x = hc/(lam kB T)       = {x:.3f}   Rayleigh-Jeans / Planck = (e^x - 1)/x = {(np.exp(x) - 1) / x:.1f}")

head("W1-B  simple pendulum")
for L in (0.50, 1.00):
    print(f"l = {L:.2f} m: small-angle period 2 pi sqrt(l/g) = {2 * np.pi * np.sqrt(L / g):.3f} s")

# ---------------- Week 2 ----------------
head("W2-A  electron through 150 V")
p = np.sqrt(2 * me * e * 150)
print(f"p = {p:.3e} kg m/s, lambda = h/p = {h / p * 1e9:.4f} nm")
dp = hbar / (2 * 0.10e-9)
print(f"dx = 0.10 nm -> dp_min = {dp:.3e} kg m/s, dp/p = {dp / p:.3f}")

head("W2-B  8 pi-electrons in a 0.95 nm box")
L = 0.95e-9
E1 = h**2 / (8 * me * L**2)
dE = (25 - 16) * E1
print(f"E1 = {E1:.4e} J, dE(4->5) = {dE:.4e} J = {dE / e:.3f} eV, lambda = {h * c / dE * 1e9:.0f} nm")
print(f"P(n=1, 0..L/3) = 1/3 - sin(2pi/3)/(2pi) = {1/3 - np.sin(2 * np.pi / 3) / (2 * np.pi):.4f}")

head("W2-C  tunnelling, E = 1.0 eV, V = 2.0 eV")
E, V = 1.0 * e, 2.0 * e
kap = np.sqrt(2 * me * (V - E)) / hbar
for a in (0.50e-9, 1.00e-9):
    exact = 1 / (1 + V**2 * np.sinh(kap * a)**2 / (4 * E * (V - E)))
    approx = 16 * (E / V) * (1 - E / V) * np.exp(-2 * kap * a)
    print(f"a = {a * 1e9:.2f} nm: kappa = {kap:.3e} 1/m, 2 kappa a = {2 * kap * a:.3f}, T_exact = {exact:.3e}, T_approx = {approx:.3e}")

# ---------------- Week 3 ----------------
head("W3-A  diatomic oscillator, k = 500 N/m, mu = 1.60e-27 kg")
k, mu = 500.0, 1.60e-27
w = np.sqrt(k / mu)
print(f"omega = {w:.4e} rad/s, wavenumber = {w / (2 * np.pi * c * 100):.0f} cm^-1")
E0 = 0.5 * hbar * w
print(f"E0 = {E0:.4e} J = {E0 / e:.4f} eV = {E0 * NA / 1e3:.2f} kJ/mol")
print(f"classical turning point (n=0) = {np.sqrt(hbar / (mu * w)) * 1e12:.2f} pm")
print(f"<x^2>_0 = hbar/(2 mu omega) = {hbar / (2 * mu * w):.3e} m^2, x_rms = {np.sqrt(hbar / (2 * mu * w)) * 1e12:.2f} pm")

head("W3-B  angular momentum l = 2")
print(f"|L| = sqrt(6) hbar = {np.sqrt(6) * hbar:.4e} J s;  min angle to z = {np.degrees(np.arccos(2 / np.sqrt(6))):.1f} deg")
print(f"L+|2,1> coefficient = hbar*sqrt((l-m)(l+m+1)) = {np.sqrt((2 - 1) * (2 + 1 + 1)):.0f} hbar")

# ---------------- Week 4 ----------------
head("W4-A  hydrogen, Paschen alpha (4 -> 3)")
dE = 13.6057 * (1 / 9 - 1 / 16)
print(f"dE = {dE:.4f} eV, lambda = 1239.84/dE = {1239.84 / dE:.0f} nm")
print(f"n = 4: n^2 = 16 orbitals, 32 states with spin;  ionization from n = 3: {13.6057 / 9:.3f} eV")

head("W4-B  O2 at 300 K")
M, T = 0.032, 300.0
vmp, vbar, vrms = np.sqrt(2 * R * T / M), np.sqrt(8 * R * T / (np.pi * M)), np.sqrt(3 * R * T / M)
print(f"v_mp = {vmp:.0f}, v_mean = {vbar:.0f}, v_rms = {vrms:.0f} m/s  (ratio 1 : {vbar / vmp:.3f} : {vrms / vmp:.3f})")
sig = 0.40e-18
lam1 = kB * T / (np.sqrt(2) * sig * 1e5)
print(f"mean free path at 1 bar (sigma = 0.40 nm^2) = {lam1 * 1e9:.0f} nm")
print(f"pressure for a 1.0 mm mean free path = {kB * T / (np.sqrt(2) * sig * 1e-3):.2f} Pa")
print(f"effusion rate H2 : O2 = sqrt(32/2.0) = {np.sqrt(32 / 2.0):.1f}")

# ---------------- Week 5 ----------------
head("W5-A  Debye plot from two temperatures (illustrative data)")
P1, T1, P2, T2 = 57.6e-6, 300.0, 50.3e-6, 400.0          # m^3/mol
B = (P1 - P2) / (1 / T1 - 1 / T2)
A = P1 - B / T1
mu_d = np.sqrt(9 * eps0 * kB * B / NA)
alpha = 3 * A / (4 * np.pi * NA)
print(f"slope B = {B * 1e6:.0f} cm^3 K/mol, intercept A = {A * 1e6:.1f} cm^3/mol")
print(f"mu = {mu_d:.3e} C m = {mu_d / 3.33564e-30:.2f} D;  alpha' = {alpha:.3e} m^3 = {alpha * 1e30:.1f} A^3")

head("W5-B  capillarity and Kelvin")
print(f"surface tension from rise: rho g h r / 2 = {789 * g * 0.0295 * 0.20e-3 / 2 * 1e3:.1f} mN/m")
print(f"Laplace pressure, r = 1.0 um, sigma = 72.0 mN/m: {2 * 0.0720 / 1.0e-6:.3e} Pa")
Vm, T = 1.807e-5, 298.0
ell = 2 * 0.0720 * Vm / (R * T)
print(f"2 sigma Vm/RT = {ell * 1e9:.3f} nm;  p(2 nm)/p(20 nm) = {np.exp(ell * (1 / 2e-9 - 1 / 20e-9)):.3f}")

# ---------------- Week 6 ----------------
head("W6-A  number blend, step growth, Debye length")
Ni, Mi = np.array([2, 3, 1.0]), np.array([10, 30, 90.0])
Mn, Mw = (Ni * Mi).sum() / Ni.sum(), (Ni * Mi**2).sum() / (Ni * Mi).sum()
print(f"Mn = {Mn:.2f}, Mw = {Mw:.2f} kg/mol, D = {Mw / Mn:.3f}")
p = 1 - 1 / 200
print(f"Xn = 200 needs p = {p:.4f}; Schulz-Flory D = 1 + p = {1 + p:.3f}")
for cM in (0.005, 0.5):
    print(f"Debye length, 1:1 salt {cM} M: {0.304 / np.sqrt(cM):.2f} nm")

head("W6-B  second-order data (illustrative), Arrhenius, catalyst")
t = np.array([0, 50, 100, 200, 400.0])
A_ = 0.0500 / (1 + 0.200 * 0.0500 * t)
print("[A] =", np.round(A_, 5), " 1/[A] =", np.round(1 / A_, 2))
print("ln[A] =", np.round(np.log(A_), 3))
s = np.polyfit(t, 1 / A_, 1)[0]
print(f"slope of 1/[A] vs t = {s:.3f} M^-1 s^-1, first half-life 1/(k[A]0) = {1 / (s * 0.05):.0f} s")
Ea = R * np.log(3.0) / (1 / 298.15 - 1 / 318.15)
print(f"k x3.0 from 25 to 45 C: Ea = {Ea / 1e3:.1f} kJ/mol")
print(f"lowering Ea by 10 kJ/mol at 298.15 K: rate x {np.exp(10e3 / (R * 298.15)):.1f}")

# ---------------- 2025 midterm ----------------
head("2025 midterm numbers")
print(f"P1.6  n = 1: sigma_x sigma_p / (hbar/2) = sqrt(pi^2/3 - 2) = {np.sqrt(np.pi**2 / 3 - 2):.4f}")
print(f"P2.4  k = 0.6102 min^-1 / (60 s/min) / 1e-2 M = {0.6102 / 60 / 1e-2:.3f} M^-1 s^-1")
print(f"P2.5  [X]0 = e^-1 [A]0 / (1 + e^-1) = {np.exp(-1) * 1e-2 / (1 + np.exp(-1)):.3e} M")
print(f"P3.3  t >= (10 + ln 100) tau = {10 + np.log(100):.4f} tau")
