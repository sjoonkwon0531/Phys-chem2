"""
Wk09 — Diffusion-limited and reaction-limited aggregation
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Particle-cluster aggregation on a 2D square lattice (Witten-Sander):
    walkers are released on a circle, random-walk, and stick to the
    cluster with probability alpha when they touch it.
      alpha = 1   : DLA  (open, branched)     d_f ~ 1.71 in 2D
      alpha << 1  : RLA  (denser, rounder)    d_f grows towards 2
    d_f from the growth history N ~ Rg^d_f (Rg measured about the seed).
    Note: the lecture values (2D: 1.45 DLA, 1.55 RLA; 3D: 1.7-1.9, 2.1-2.2)
    are for CLUSTER-cluster aggregation (DLCA / RLCA), where clusters
    themselves diffuse and collide.
(2) Smoluchowski coagulation with a constant kernel k (the lecture result
    k_ij ~ const for fractal clusters):
      dc_s/dt = (1/2) sum_{i+j=s} k c_i c_j - c_s sum_j k c_j
    exact solution with tau = k c0 t / 2:
      c_s = c0 tau^(s-1) / (1 + tau)^(s+1),   <S> = 1 + tau  (linear in t)

Run:  python wk09_dla_aggregation.py     (~30 s)
"""
import numpy as np

rng = np.random.default_rng(9)
STEPS = np.array([(1, 0), (-1, 0), (0, 1), (0, -1)])

def grow(Npart, alpha, L=401):
    grid = np.zeros((L, L), bool)
    c = L // 2; grid[c, c] = True
    rmax = 1.0; pts = [(0, 0)]; sum2 = 0.0; hist = []
    for _ in range(Npart - 1):
        while True:
            th = rng.uniform(0, 2*np.pi)
            x, y = int(round((rmax + 5) * np.cos(th))), int(round((rmax + 5) * np.sin(th)))
            stuck = False
            while True:
                dx, dy = STEPS[rng.integers(4)]
                if grid[c+x+dx, c+y+dy]:          # cannot step onto the cluster
                    continue
                x += dx; y += dy
                r2 = x*x + y*y
                if r2 > (2*rmax + 20)**2:          # wandered off: release a new walker
                    break
                if r2 > (rmax + 3)**2:
                    continue
                if (grid[c+x+1, c+y] or grid[c+x-1, c+y] or grid[c+x, c+y+1] or grid[c+x, c+y-1]) \
                        and not grid[c+x, c+y] and rng.random() < alpha:
                    grid[c+x, c+y] = True; pts.append((x, y))
                    sum2 += r2; hist.append((len(pts), np.sqrt(sum2 / len(pts))))
                    rmax = max(rmax, np.sqrt(r2)); stuck = True
                    break
            if stuck:
                break
    return np.array(pts, float), np.array(hist)

def fractal_dim(hist, nmin=200):
    """growth history: N ~ Rg^d_f  (Rg about the seed)"""
    h = hist[hist[:, 0] >= nmin]
    return np.polyfit(np.log(h[:, 1]), np.log(h[:, 0]), 1)[0], h[-1, 1]

print("(1) 2D lattice particle-cluster aggregation")
for alpha, Np in [(1.0, 2500), (0.1, 2500)]:
    pts, hist = grow(Np, alpha)
    df, Rg = fractal_dim(hist)
    print(f"    alpha = {alpha:4.2f}, N = {Np}:  Rg = {Rg:6.1f} lattice units,  d_f (N ~ Rg^d_f) = {df:.2f}")
print("    reference: Witten-Sander DLA d_f = 1.71 (2D); small clusters read a little high\n")

# -- (2) Smoluchowski, constant kernel ------------------------------
k, c0, Smax = 1.0, 1.0, 400
c = np.zeros(Smax + 1); c[1] = c0
dt, tend = 1e-3, 10.0
for _ in range(int(tend / dt)):
    def rhs(c):
        conv = 0.5 * k * np.convolve(c, c)[:Smax + 1]
        return conv - k * c * c.sum()
    k1 = rhs(c); k2 = rhs(c + dt/2*k1); k3 = rhs(c + dt/2*k2); k4 = rhs(c + dt*k3)
    c += dt / 6 * (k1 + 2*k2 + 2*k3 + k4)
tau = k * c0 * tend / 2
s = np.arange(Smax + 1)
exact = np.zeros(Smax + 1)
exact[1:] = c0 * np.exp((s[1:] - 1) * np.log(tau) - (s[1:] + 1) * np.log(1 + tau))
print(f"(2) Smoluchowski, constant kernel, t = {tend}, tau = {tau}")
print(f"    total clusters  numeric {c.sum():.6f}   exact c0/(1+tau) = {c0/(1+tau):.6f}")
print(f"    mass (sum s c_s) numeric {(s*c).sum():.6f}   exact {c0:.6f}")
print(f"    <S> = mass / number      numeric {(s*c).sum()/c.sum():.4f}   exact 1 + tau = {1+tau:.4f}")
for si in (1, 2, 5, 10):
    print(f"    c_{si:<2d} numeric {c[si]:.6e}   exact {exact[si]:.6e}")
