"""
Wk01 — Helmholtz equation: standing-wave modes & mode counting
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) 2D membrane modes  f(x,y) = sin(nx pi x/Lx) sin(ny pi y/Ly)
    with Dirichlet BCs (fixed edges) — the eigenfunctions of nabla^2.
(2) 3D cavity mode counting N(w') vs. the smooth (pi/6) w'^3 law —
    the very counting that leads to Rayleigh-Jeans and Planck.

Run:  python wk01_helmholtz_modes.py
"""
import numpy as np
import matplotlib.pyplot as plt

# -- (1) 2D modes -------------------------------------------
Lx = Ly = 1.0
xs = np.linspace(0, Lx, 160); ys = np.linspace(0, Ly, 160)
X, Y = np.meshgrid(xs, ys)

fig, axes = plt.subplots(1, 4, figsize=(13, 3.1))
for ax, (nx, ny) in zip(axes, [(1, 1), (2, 1), (2, 2), (4, 2)]):
    Z = np.sin(nx*np.pi*X/Lx)*np.sin(ny*np.pi*Y/Ly)
    ax.contourf(X, Y, Z, 41, cmap="RdBu_r")
    w = np.pi*np.sqrt((nx/Lx)**2 + (ny/Ly)**2)   # c = 1
    ax.set_title(f"(nx,ny)=({nx},{ny}),  w={w:.2f}")
    ax.set_xticks([]); ax.set_yticks([])
plt.suptitle("Helmholtz modes on a square membrane (Dirichlet BC)")
plt.tight_layout()

# -- (2) 3D mode counting -----------------------------------
# normalized frequency w' = w L / (c pi):  mode (nx,ny,nz) has
# w' = sqrt(nx^2+ny^2+nz^2);  count N(w') = #{modes with w'_n <= w'}
wmax = 14.0
freqs = []
nmax = int(wmax) + 1
for nx in range(1, nmax+1):
    for ny in range(1, nmax+1):
        for nz in range(1, nmax+1):
            wp = np.hypot(np.hypot(nx, ny), nz)
            if wp <= wmax:
                freqs.append(wp)
freqs = np.sort(np.array(freqs))
N = np.arange(1, len(freqs)+1)

plt.figure(figsize=(6, 4.2))
plt.step(freqs, N, where="post", label="exact staircase N(w')")
ws = np.linspace(0, wmax, 300)
plt.plot(ws, np.pi/6*ws**3, "r--", label="(pi/6) w'^3  (octant sphere)")
plt.xlabel("normalized frequency w'"); plt.ylabel("N(w')")
plt.title("Cavity mode counting -> density of states g(nu) ~ nu^2")
plt.legend(); plt.tight_layout(); plt.show()

print("As w' grows, dN/dw' ~ (pi/2) w'^2  =>  g(nu) = 8 pi V nu^2 / c^3")
print("(x2 polarization) — the seed of the Rayleigh-Jeans law.")
