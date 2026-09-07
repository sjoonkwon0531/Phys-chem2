"""
Wk02 — Matrix mechanics: [X, P] = i hbar, seen numerically
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

Build the position and momentum MATRICES in the particle-in-a-box basis:
  X_mn = <m| x |n>,   P_mn = <m| -i hbar d/dx |n>
X is real symmetric; P is purely imaginary antisymmetric: P = i * Pi.
Then  XP - PX = i (X Pi - Pi X)  ->  its diagonal should equal i hbar
(Born-Jordan's "strong quantization condition", 1925).
A truncated N x N matrix reproduces i*hbar on the diagonal in the interior,
but fails near n ~ N: Heisenberg's matrices must be INFINITE.

Also: uncertainty products for eigenstates,
  sigma_x sigma_p = hbar sqrt(n^2 pi^2/12 - 1/2) >= hbar/2.

Run:  python wk02_matrix_mechanics.py   (hbar = m = L = 1)
"""
import numpy as np
import matplotlib.pyplot as plt

trapz = getattr(np, "trapezoid", getattr(np, "trapz", None))  # numpy 1.x/2.x compat

L, hbar = 1.0, 1.0
Nb = 20                                   # basis size (try 10, 20, 40)
x = np.linspace(0, L, 6001)
psis  = [np.sqrt(2/L)*np.sin(n*np.pi*x/L) for n in range(1, Nb+1)]
dpsis = [np.sqrt(2/L)*(n*np.pi/L)*np.cos(n*np.pi*x/L) for n in range(1, Nb+1)]

X  = np.array([[trapz(psis[m]*x*psis[n], x) for n in range(Nb)] for m in range(Nb)])
Pi = np.array([[-hbar*trapz(psis[m]*dpsis[n], x) for n in range(Nb)] for m in range(Nb)])
# P = i * Pi  (purely imaginary, antisymmetric)

M = X @ Pi - Pi @ X                       # Im part of (XP - PX)
diag = np.diag(M)/hbar

print("n   Im[X,P]_nn / hbar   (should be 1 in the interior)")
for n in (1, 2, 5, 10, 15, 18, 19, 20):
    print(f"{n:2d}  {diag[n-1]:12.6f}")
print("\n-> plateau at 1, drooping near n ~ N: the matrices are truly infinite!")

# analytic X matrix elements as a check (m != n, m+n odd):
m_, n_ = 1, 2
Xa = -8*L*m_*n_/(np.pi**2*(m_**2 - n_**2)**2)
print(f"\ncheck X_12: numeric {X[0,1]:.6f}, analytic -8Lmn/pi^2(m^2-n^2)^2 = {Xa:.6f}")

# uncertainty product for eigenstates
print("\n n   sigma_x/L     sigma_p*L/hbar   product/hbar  (bound 0.5)")
for n in range(1, 6):
    sx = np.sqrt(1/12 - 1/(2*n**2*np.pi**2))
    sp = n*np.pi
    print(f"{n:2d}  {sx:10.5f}  {sp:13.5f}  {sx*sp:12.5f}")

fig, ax = plt.subplots(1, 2, figsize=(10.5, 4))
im = ax[0].imshow(M/hbar, cmap="RdBu_r", vmin=-1.2, vmax=1.2)
ax[0].set_title("Im(XP - PX)/hbar : ~ identity"); plt.colorbar(im, ax=ax[0])
ax[1].plot(range(1, Nb+1), diag, "o-")
ax[1].axhline(1, color="r", ls="--"); ax[1].set_xlabel("n")
ax[1].set_title("diagonal: [X,P] = i hbar (interior)")
plt.tight_layout(); plt.show()
