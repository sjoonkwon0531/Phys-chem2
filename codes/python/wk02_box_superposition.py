"""
Wk02 — Particle in a box: basis expansion, measurement & dynamics
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Expand f(x) = sqrt(30/L^5) x (x-L) in box eigenstates |n>:
      c_n = <n|f> = -8 sqrt(15) / (n^3 pi^3)   (odd n only)
    -> sum |c_n|^2 = 1 (Parseval), and the 'measured' mean energy
      <E> = sum |c_n|^2 E_n = 5 hbar^2 / (m L^2)
(2) Superposition dynamics: Psi = (2|1> + |2>)/sqrt(5)
    |Psi(x,t)|^2 oscillates ("sloshes") at omega_21 = (E2-E1)/hbar,
    while a single stationary state |n> gives a time-independent density.

Run:  python wk02_box_superposition.py   (hbar = m = L = 1)
"""
import numpy as np
import matplotlib.pyplot as plt

trapz = getattr(np, "trapezoid", getattr(np, "trapz", None))  # numpy 1.x/2.x compat

L = 1.0
x = np.linspace(0, L, 4001)
psi = lambda n: np.sqrt(2/L)*np.sin(n*np.pi*x/L)
E   = lambda n: n**2*np.pi**2/2                      # hbar = m = 1

# -- (1) basis expansion of f(x) -----------------------------
f = np.sqrt(30/L**5)*x*(x - L)          # lecture convention (negative in the well)
print("check normalization of f:", f"{trapz(f**2, x):.6f}")

N = 15
c = np.array([trapz(psi(n)*f, x) for n in range(1, N+1)])
print("\n n     c_n (numeric)   c_n (analytic)    |c_n|^2")
for n in range(1, 8):
    ca = -8*np.sqrt(15)/(n**3*np.pi**3) if n % 2 == 1 else 0.0
    print(f"{n:2d}  {c[n-1]:14.6f}  {ca:14.6f}  {c[n-1]**2:10.6f}")

print(f"\nParseval:  sum |c_n|^2      = {np.sum(c**2):.6f}  (-> 1)")
Emean = np.sum(c**2*np.array([E(n) for n in range(1, N+1)]))
print(f"mean energy sum |c_n|^2 E_n = {Emean:.5f}  (analytic 5 hbar^2/mL^2 = 5)")
print("single measurement returns ONE eigenvalue E_n with probability |c_n|^2\n")

plt.figure(figsize=(12, 4))
plt.subplot(1, 3, 1)
plt.plot(x, f, "k-", lw=2, label="f(x)")
for Np in (1, 3, 5):
    g = sum(c[n-1]*psi(n) for n in range(1, Np+1))
    plt.plot(x, g, "--", label=f"partial sum N={Np}")
plt.legend(fontsize=8); plt.title("Basis-function expansion")

plt.subplot(1, 3, 2)
plt.bar(range(1, N+1), c**2)
plt.yscale("log"); plt.ylim(1e-8, 2)
plt.xlabel("n"); plt.title("measurement probabilities |c_n|^2")

# -- (2) superposition dynamics ------------------------------
c1, c2 = 2/np.sqrt(5), 1/np.sqrt(5)
w21 = E(2) - E(1)
Tp = 2*np.pi/w21
print(f"beat period T = 2 pi hbar/(E2-E1) = {Tp:.4f}")
plt.subplot(1, 3, 3)
for frac in (0.0, 0.25, 0.5):
    t = frac*Tp
    Psi = c1*psi(1)*np.exp(-1j*E(1)*t) + c2*psi(2)*np.exp(-1j*E(2)*t)
    plt.plot(x, np.abs(Psi)**2, label=f"t = {frac:.2f} T")
plt.plot(x, psi(1)**2, "k:", lw=1, label="stationary |1> (static)")
plt.legend(fontsize=7); plt.title("|Psi(x,t)|^2 sloshes at omega_21")
plt.tight_layout(); plt.show()
