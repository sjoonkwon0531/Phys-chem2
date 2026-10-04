"""
Wk06 — Colloid stability (DLVO) and micelle formation
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Electrical double layer: Debye screening length
      kappa = sqrt(2 z^2 e^2 n0 / (eps kT)),  n0 = 1000 N_A c   (z:z salt)
      -> kappa^-1 = 0.304/sqrt(c[M]) nm for a 1:1 salt in water at 25 C
(2) DLVO pair energy of two spheres (radius a, gap h):
      U = -A_H a/(12 h) + (64 pi kT n0 a gamma^2 / kappa^2) exp(-kappa h)
      gamma = tanh(z e phi0 / 4kT)
    Adding salt shrinks kappa^-1, the barrier collapses -> coagulation.
    Critical coagulation concentration scales as z^-6 (Schulze-Hardy).
(3) Micelles, closed-association model  N M <-> M_N  with [M_N] = K [M]^N:
      c_total = [M] + N K [M]^N    -> sharp CMC for large N

Run:  python wk06_dlvo_micelle.py
"""
import numpy as np
import matplotlib.pyplot as plt

E = 1.602176634e-19
KB = 1.380649e-23
NA = 6.02214076e23
EPS = 78.5 * 8.8541878128e-12          # water, 25 C
T = 298.15
KT = KB * T

def kappa(c_M, z=1):
    n0 = 1000 * NA * c_M
    return np.sqrt(2 * z * z * E * E * n0 / (EPS * KT))

# -- (1) Debye length ----------------------------------------
print("1:1 salt      kappa^-1 [nm]    0.304/sqrt(c)")
for c in (1e-3, 1e-2, 0.1, 0.15, 0.6):
    print(f"  {c:6.3f} M   {1e9/kappa(c):10.3f}     {0.304/np.sqrt(c):8.3f}")
print("-> physiological saline (0.15 M): charges are screened beyond ~0.8 nm\n")

# -- (2) DLVO -------------------------------------------------
def dlvo(h, c_M, a=100e-9, AH=2.0e-20, phi0=0.030, z=1):
    k = kappa(c_M, z)
    n0 = 1000 * NA * c_M
    g = np.tanh(z * E * phi0 / (4 * KT))
    Uvdw = -AH * a / (12 * h)
    Uel = 64 * np.pi * KT * n0 * a * g * g / k**2 * np.exp(-k * h)
    return (Uvdw + Uel) / KT

h = np.logspace(np.log10(0.1e-9), np.log10(100e-9), 6000)
print("a = 100 nm, A_H = 2e-20 J, phi0 = 30 mV:")
print("  c [M]    barrier U_max/kT   at h [nm]   verdict")
for c in (1e-3, 1e-2, 3e-2, 0.1, 0.6):
    U = dlvo(h, c)
    j = np.argmax(U)
    if U[j] <= 0:
        print(f"  {c:6.3f}       no barrier                 rapid coagulation")
        continue
    verdict = "stable" if U[j] > 15 else "slow coagulation"
    print(f"  {c:6.3f}   {U[j]:12.1f}      {h[j]*1e9:6.2f}     {verdict}")
print("-> more salt, thinner double layer, lower barrier: why river clay")
print("   settles into a delta where it meets the sea (~0.6 M)\n")

# critical coagulation concentration: the barrier top touches zero,
#   U = 0 and dU/dh = 0  ->  kappa h = 1  ->  n0,c ~ gamma^4 / (z^6 A_H^2)
def ccc(z, phi0=0.030, AH=2.0e-20, gamma=None):
    g = np.tanh(z * E * phi0 / (4 * KT)) if gamma is None else gamma
    kc = 384 * np.pi * EPS * KT**2 * g * g / (np.e * z * z * E * E * AH)
    n0 = kc**2 * EPS * KT / (2 * z * z * E * E)
    return n0 / (1000 * NA)

# numerical cross-check for z = 1: bisect on the barrier height
lo, hi = 1e-3, 1.0
for _ in range(60):
    mid = np.sqrt(lo * hi)
    if dlvo(h, mid).max() > 0:
        lo = mid
    else:
        hi = mid
print(f"critical coagulation concentration, z = 1: analytic {ccc(1)*1e3:.1f} mM, "
      f"numerical {np.sqrt(lo*hi)*1e3:.1f} mM")
print("  fixed phi0 = 30 mV:   z = 1: %.1f mM   z = 2: %.1f mM   z = 3: %.2f mM"
      % (ccc(1) * 1e3, ccc(2) * 1e3, ccc(3) * 1e3))
r2, r3 = ccc(1, gamma=1.0) / ccc(2, gamma=1.0), ccc(1, gamma=1.0) / ccc(3, gamma=1.0)
print(f"  high-potential limit (gamma -> 1):  1 : 1/{r2:.0f} : 1/{r3:.0f}   (z^-6)")
print("-> Schulze-Hardy rule: multivalent counter-ions (Ca2+, Al3+) coagulate")
print("   colloids at far lower concentrations than Na+\n")

# -- (3) micelles: closed association ------------------------
def monomer(ctot, N, K=1.0):
    lo, hi = 0.0, ctot                       # c = m + N K m^N is monotonic in m
    for _ in range(200):
        mid = 0.5 * (lo + hi)
        if mid + N * K * mid**N > ctot:
            hi = mid
        else:
            lo = mid
    return 0.5 * (lo + hi)

print("fraction of surfactant in micelles (K = 1, reduced units):")
print("  c_total     N = 3     N = 30    N = 100")
for ct in (0.5, 0.9, 1.0, 1.5, 3.0, 10.0):
    fr = []
    for N in (3, 30, 100):
        m = monomer(ct, N)
        fr.append(1 - m / ct)
    print(f"  {ct:6.2f}    {fr[0]:6.3f}    {fr[1]:6.3f}    {fr[2]:6.3f}")
print("-> large aggregation number N: nothing, then suddenly micelles (the CMC)")

fig, ax = plt.subplots(1, 2, figsize=(11, 4.2))
for c in (1e-3, 1e-2, 3e-2, 0.1):
    ax[0].semilogx(h * 1e9, dlvo(h, c), label=f"{c*1e3:g} mM")
ax[0].axhline(0, c="gray", lw=0.8); ax[0].set_ylim(-40, 60)
ax[0].set_xlabel("gap h [nm]"); ax[0].set_ylabel("U / kT")
ax[0].set_title("DLVO: salt lowers the barrier"); ax[0].legend()
ct = np.linspace(0.01, 4, 300)
for N in (3, 30, 100):
    m = np.array([monomer(x, N) for x in ct])
    ax[1].plot(ct, m, label=f"monomer, N = {N}")
ax[1].plot(ct, ct, "k:", lw=0.8)
ax[1].set_xlabel("total surfactant"); ax[1].set_ylabel("free monomer")
ax[1].set_title("monomer concentration saturates at the CMC"); ax[1].legend()
plt.tight_layout(); plt.show()
