"""
Week 3 - Angular Momentum Operators & Ladder Operators
Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)

Builds Lz, L+, L-, Lx, Ly, L^2 as (2l+1)x(2l+1) matrices in the |l,m> basis
(hbar = 1) and verifies:
  [Lx, Ly] = i Lz (cyclic),  [L^2, Lz] = 0,
  L^2 = l(l+1) * Identity,
  L+|l,m> = sqrt((l-m)(l+m+1)) |l,m+1>,
  b_max = l, b_min = -l (ladder termination),
and the generalized uncertainty  sigma_Lx * sigma_Ly >= |<Lz>|/2.
"""
import numpy as np

def angmom_ops(l):
    """Return (Lx, Ly, Lz, Lp, Lm, L2) in the basis m = l, l-1, ..., -l."""
    dim = int(round(2 * l)) + 1
    ms = np.array([l - k for k in range(dim)], dtype=float)
    Lz = np.diag(ms)
    Lp = np.zeros((dim, dim))
    for k in range(1, dim):            # raises m: |l, m> -> |l, m+1>
        m = ms[k]
        Lp[k - 1, k] = np.sqrt(l * (l + 1) - m * (m + 1))
    Lm = Lp.T.copy()
    Lx = 0.5 * (Lp + Lm)
    Ly = -0.5j * (Lp - Lm)
    L2 = Lx @ Lx + Ly @ Ly + Lz @ Lz
    return Lx, Ly, Lz, Lp, Lm, L2

if __name__ == "__main__":
    for l in [1, 2]:
        Lx, Ly, Lz, Lp, Lm, L2 = angmom_ops(l)
        dim = Lz.shape[0]
        I = np.eye(dim)
        e1 = np.max(np.abs(Lx @ Ly - Ly @ Lx - 1j * Lz))   # [Lx,Ly] = i Lz
        e2 = np.max(np.abs(L2 @ Lz - Lz @ L2))             # [L^2,Lz] = 0
        e3 = np.max(np.abs(L2 - l * (l + 1) * I))          # L^2 = l(l+1) I
        print(f"l={l}: |[Lx,Ly]-iLz| = {e1:.2e},  |[L2,Lz]| = {e2:.2e},  |L2 - l(l+1)I| = {e3:.2e}")

    # Ladder coefficients for l = 2: c+(l,m) = sqrt((l-m)(l+m+1))
    l = 2
    _, _, _, Lp, Lm, _ = angmom_ops(l)
    print("c+(2,m) for m = 1, 0, -1, -2:",
          [f"{Lp[k - 1, k]:.4f}" for k in range(1, 5)],
          "  (exact: sqrt(4), sqrt(6), sqrt(6), sqrt(4) reversed order in m)")

    # Ladder termination: L+|l,l> = 0, L-|l,-l> = 0
    top = np.zeros(5); top[0] = 1.0     # |2, +2>
    bot = np.zeros(5); bot[-1] = 1.0    # |2, -2>
    print(f"|L+|2,+2>| = {np.linalg.norm(Lp @ top):.1e},  |L-|2,-2>| = {np.linalg.norm(Lm @ bot):.1e}")

    # Generalized uncertainty in |l=1, m=1>: sigma_Lx sigma_Ly >= |<Lz>|/2
    Lx, Ly, Lz, _, _, _ = angmom_ops(1)
    v = np.array([1.0, 0.0, 0.0])       # |1, +1>
    sx = np.sqrt(np.real(v @ (Lx @ Lx) @ v) - np.real(v @ Lx @ v)**2)
    sy = np.sqrt(np.real(v @ (Ly @ Ly) @ v) - np.real(v @ Ly @ v)**2)
    print(f"|1,+1>: sigma_Lx*sigma_Ly = {sx * sy:.4f} >= |<Lz>|/2 = {abs(np.real(v @ Lz @ v)) / 2:.4f}")

    # Vector model: |L| = sqrt(l(l+1)), cone half-angle for each m (l = 2)
    L = np.sqrt(2 * 3.0)
    for m in [2, 1, 0, -1, -2]:
        theta = np.degrees(np.arccos(m / L))
        print(f"l=2, m={m:+d}: |L| = sqrt(6) = {L:.4f} hbar, cone angle = {theta:.2f} deg")
