"""
Wk05 — 2D Lennard-Jones molecular dynamics: gas vs liquid & the RDF
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

V(r) = 4 eps [ (sigma/r)^12 - (sigma/r)^6 ]   (minimum at 2^{1/6} sigma)
Velocity-Verlet integration in reduced units (sigma = eps = m = 1),
periodic box.  Cooling the SAME system condenses it:
  hot (T* = 1.5): ideal-gas-like, g(r) ~ 1 beyond contact
  cold (T* = 0.45): droplets form, g(r) shows liquid shells at ~1.12, ~2.2
Energy conservation is checked in an NVE segment (relative drift ~1e-3).

Run:  python wk05_lj_md.py     (~10 s)
"""
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(7)
N, L = 100, 12.0                    # particles, box size
rc = 3.0                             # cutoff
dt = 0.004

def forces(pos):
    d = pos[:, None, :] - pos[None, :, :]
    d -= L * np.round(d / L)                       # minimum image
    r2 = (d**2).sum(-1)
    np.fill_diagonal(r2, np.inf)
    inv2 = np.where(r2 < rc**2, 1.0 / r2, 0.0)
    inv6 = inv2**3
    fmag = 24 * inv2 * inv6 * (2 * inv6 - 1)       # (1/r dV/dr) factor
    F = (fmag[:, :, None] * d).sum(1)
    pot = 2 * (inv6**2 - inv6).sum()               # 4*0.5 double count
    return F, pot

def run(Ttarget, nequil=1500, nprod=1500, nve_check=False):
    side = int(np.ceil(np.sqrt(N)))
    g = np.array([(i, j) for i in range(side) for j in range(side)][:N], float)
    pos = (g + 0.5) * (L / side)
    vel = rng.normal(0, np.sqrt(Ttarget), (N, 2))
    vel -= vel.mean(0)
    F, _ = forces(pos)
    Es = []
    for step in range(nequil + nprod):
        vel += 0.5 * dt * F
        pos = (pos + dt * vel) % L
        F, pot = forces(pos)
        vel += 0.5 * dt * F
        ke = 0.5 * (vel**2).sum()
        if step < nequil and not nve_check:        # Berendsen-like rescale
            lam = np.sqrt(1 + 0.02 * (Ttarget * N / ke - 1))
            vel *= lam
        Es.append(ke + pot)
    return pos, np.array(Es)

def rdf(pos, nbins=60, rmax=5.0):
    d = pos[:, None, :] - pos[None, :, :]
    d -= L * np.round(d / L)
    r = np.sqrt((d**2).sum(-1))[np.triu_indices(N, 1)]
    h, edges = np.histogram(r, bins=nbins, range=(0, rmax))
    rc_ = 0.5 * (edges[1:] + edges[:-1])
    dr = edges[1] - edges[0]
    shell = 2 * np.pi * rc_ * dr                   # 2D shell area
    ideal = shell * N * (N - 1) / 2 / L**2 * 2     # pair density norm
    return rc_, h / ideal

# -- energy conservation (NVE) --------------------------------
_, E = run(0.8, nequil=0, nprod=1200, nve_check=True)
drift = abs(E[-1] - E[0]) / abs(E[0])
print(f"NVE energy drift over 1200 steps: {drift:.2e}  (velocity Verlet is symplectic)")

# -- gas vs liquid --------------------------------------------
plt.figure(figsize=(12, 4.2))
for i, (Tt, lb) in enumerate ((( 1.5, "hot gas  T*=1.5"), (0.45, "cold liquid  T*=0.45"))):
    pos, _ = run(Tt)
    rr, g = rdf(pos)
    peak = rr[np.argmax(g)]
    print(f"{lb}:  RDF peak at r* = {peak:.2f}  "
          f"({'~2^(1/6)=1.12 (LJ contact!)' if Tt < 1 else 'weak structure'})")
    plt.subplot(1, 3, i + 1)
    plt.scatter(pos[:, 0], pos[:, 1], s=14)
    plt.title(lb); plt.xlim(0, L); plt.ylim(0, L); plt.gca().set_aspect(1)
    plt.subplot(1, 3, 3)
    plt.plot(rr, g, label=lb)
plt.subplot(1, 3, 3)
plt.axhline(1, ls="--", c="gray"); plt.axvline(2**(1/6), ls=":", c="k")
plt.xlabel("r / sigma"); plt.ylabel("g(r)"); plt.legend(fontsize=8)
plt.title("radial distribution function")
plt.tight_layout(); plt.show()

print("\n-> same particles, same forces — only T differs. Condensation is")
print("   nothing but the LJ well (-eps) winning over thermal motion (kT).")
