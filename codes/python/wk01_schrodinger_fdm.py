"""
Wk01 — 1D time-independent Schrodinger equation by FDM
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

Solves  -(1/2) psi'' + V(x) psi = E psi   on [0, L]   (hbar = m = 1)
with Dirichlet BCs, discretized by the central 2nd difference:
  psi''_i  ~  (psi_{i+1} - 2 psi_i + psi_{i-1}) / h^2
=> tridiagonal symmetric eigenvalue problem  H psi = E psi.

Same FDM machinery as CFD (Fluid Mechanics Wk11) — now the matrix
eigenvalues ARE the quantized energy levels ("Quantisierung als
Eigenwertproblem", Schrodinger 1926).

Run:  python wk01_schrodinger_fdm.py
"""
import numpy as np
import matplotlib.pyplot as plt

L, N = 1.0, 400
x = np.linspace(0, L, N+2)          # includes boundary points
h = x[1] - x[0]
xi = x[1:-1]                        # interior nodes

def solve(V):
    main = 1.0/h**2 + V             # 2*(1/(2h^2)) + V_i
    off  = -0.5/h**2*np.ones(N-1)
    Hmat = np.diag(main) + np.diag(off, 1) + np.diag(off, -1)
    E, psi = np.linalg.eigh(Hmat)
    psi /= np.sqrt(h)               # normalize: sum |psi|^2 h = 1
    return E, psi

cases = {
    "infinite well (V=0)":            np.zeros(N),
    "harmonic  V=0.5 k (x-L/2)^2":    0.5*8.0e4*(xi-L/2)**2,
    "finite well (V0=2000, w=0.4L)":  np.where(np.abs(xi-L/2) < 0.2*L, 0.0, 2000.0),
}

fig, axes = plt.subplots(1, 3, figsize=(13, 4))
for ax, (name, V) in zip(axes, cases.items()):
    E, psi = solve(V)
    for n in range(4):
        ax.plot(xi, 40*psi[:, n]*np.sign(psi[N//5, n] + 1e-12) + E[n],
                label=f"E{n+1}={E[n]:.1f}")
    if V.max() > 0:
        ax.plot(xi, V, "k--", lw=0.8, alpha=0.5)
        ax.set_ylim(0, 1.3*E[3])
    ax.set_title(name, fontsize=9); ax.set_xlabel("x"); ax.legend(fontsize=7)
axes[0].set_ylabel("energy  (psi offset by E_n)")
plt.suptitle("Quantization as an eigenvalue problem (FDM)")
plt.tight_layout()

# -- validation against analytic solutions -------------------
E_box, _ = solve(np.zeros(N))
print("infinite well:  E_n = n^2 pi^2 / 2   (hbar=m=1, L=1)")
print(" n   FDM          analytic     rel.err")
for n in range(1, 6):
    Ea = n**2*np.pi**2/2
    print(f"{n:2d}  {E_box[n-1]:11.5f}  {Ea:11.5f}  {abs(E_box[n-1]-Ea)/Ea:.2e}")

k = 8.0e4; w = np.sqrt(k)
E_h, _ = solve(0.5*k*(xi-L/2)**2)
print("\nharmonic:  E_n = (n + 1/2) w,  w = sqrt(k) =", w)
for n in range(4):
    Ea = (n+0.5)*w
    print(f"{n:2d}  {E_h[n]:11.3f}  {Ea:11.3f}  {abs(E_h[n]-Ea)/Ea:.2e}")
plt.show()
