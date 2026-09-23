"""
Wk04 — Hydrogen atom: Bohr model, spectral series, degeneracy
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Bohr model: force balance + mvr = n hbar gives
      r_n = n^2 a0,   a0 = hbar^2/(k_e m e^2) = 0.529 A
      E_n = -13.606 / n^2  eV        (matches full QM exactly!)
(2) Emission wavelength lambda = hc/(E_n2 - E_n1):
      Lyman (->1, UV), Balmer (->2, visible), Paschen (->3, IR), ...
(3) Degeneracy of level n (with spin): 2 n^2
      counted from l = 0..n-1, m = -l..l, s = up/down.

Run:  python wk04_hydrogen_spectrum.py
"""
import numpy as np
import matplotlib.pyplot as plt

RY = 13.605693          # eV  (Rydberg energy)
HC = 1239.841984        # eV nm
A0 = 0.0529177          # nm  (Bohr radius)

E = lambda n: -RY / n**2

# -- (1) Bohr radii & energies -------------------------------
print(" n   r_n [nm]    E_n [eV]")
for n in range(1, 6):
    print(f"{n:2d}  {n*n*A0:9.4f}  {E(n):9.4f}")
print(f"-> ground state: r = {A0*10:.3f} A, E = {E(1):.3f} eV (ionization 13.6 eV)\n")

# -- (2) spectral series -------------------------------------
series = {1: "Lyman", 2: "Balmer", 3: "Paschen", 4: "Brackett", 5: "Pfund"}
print("series    n2->n1   dE [eV]   lambda [nm]")
for n1, name in series.items():
    for n2 in (n1 + 1, n1 + 2, n1 + 3):
        dE = E(n2) - E(n1)
        print(f"{name:9s} {n2}->{n1}   {dE:7.4f}   {HC/dE:9.1f}")
    print()
# classic checks: Lyman-alpha 121.6 nm, H-alpha 656.3 nm, Balmer limit 364.6 nm
print(f"Balmer limit (n=inf -> 2): {HC/(0 - E(2)):.1f} nm (UV edge of visible series)\n")

# -- (3) degeneracy count ------------------------------------
print(" n   states |n,l,m,s>   2n^2")
for n in range(1, 5):
    cnt = sum(2 * (2 * l + 1) for l in range(n))
    print(f"{n:2d}  {cnt:17d}  {2*n*n:5d}")
print("-> degeneracy 2(1+3+5+...+(2n-1)) = 2n^2: why shells hold 2, 8, 18, 32 electrons\n")

# -- plot: level ladder + Balmer lines -----------------------
fig, ax = plt.subplots(1, 2, figsize=(11, 4.4))
for n in range(1, 8):
    ax[0].axhline(E(n), xmin=0.1, xmax=0.9, color="teal", lw=1.4)
    ax[0].text(0.92, E(n), f"n={n}", fontsize=8, va="center")
ax[0].set_ylabel("E [eV]"); ax[0].set_title("Bohr / Schrodinger levels  E = -13.6/n$^2$ eV")
ax[0].set_xticks([])

for n2 in range(3, 8):
    lam = HC / (E(n2) - E(2))
    ax[1].axvline(lam, color=plt.cm.rainbow((lam - 380) / 320), lw=2.5)
    ax[1].text(lam, 1.02, f"{n2}→2", ha="center", fontsize=8)
ax[1].set_xlim(380, 700); ax[1].set_ylim(0, 1.15)
ax[1].set_xlabel("wavelength [nm]"); ax[1].set_yticks([])
ax[1].set_title("Balmer series (visible H emission)")
plt.tight_layout(); plt.show()
