"""
Week 3 - Creation & Annihilation (Ladder) Operators for the SHO
Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)

Builds a, a^dagger, X, P, H as matrices in the number basis |n> and verifies:
  a|n> = sqrt(n)|n-1>,  a^dag|n> = sqrt(n+1)|n+1>,  [a, a^dag] = 1,
  H = hbar*omega (a^dag a + 1/2) with eigenvalues (n + 1/2) hbar*omega,
  [X, P] = i*hbar  (hbar = m = omega = 1).
Note: in a truncated N x N basis the identities hold exactly except
in the last row/column (truncation edge) - a nice teaching point.
"""
import numpy as np

def ladder_ops(N):
    """Return (a, adag) as N x N matrices in the number basis."""
    a = np.zeros((N, N))
    for n in range(1, N):
        a[n - 1, n] = np.sqrt(n)          # <n-1| a |n> = sqrt(n)
    return a, a.T.copy()

if __name__ == "__main__":
    N = 30
    a, ad = ladder_ops(N)

    # 1) [a, a^dag] = 1 (exact except the (N-1, N-1) truncation corner)
    comm = a @ ad - ad @ a
    I = np.eye(N)
    err_bulk = np.max(np.abs((comm - I)[:N - 1, :N - 1]))
    print(f"[a, a^dag] = 1: max bulk error = {err_bulk:.2e}, corner value = {comm[-1, -1]:+.1f}")

    # 2) Number operator & Hamiltonian
    H = ad @ a + 0.5 * I
    evals = np.sort(np.linalg.eigvalsh(H))[:6]
    print("First 6 eigenvalues of H/hbar*omega:", np.round(evals, 6))

    # 3) X, P from ladder operators; check [X, P] = i (bulk)
    X = (a + ad) / np.sqrt(2.0)
    P = 1j * (ad - a) / np.sqrt(2.0)
    commXP = X @ P - P @ X
    print(f"Im<0|[X,P]|0> = {commXP[0, 0].imag:.6f} (expect 1)")
    print(f"max bulk |[X,P] - i| = {np.max(np.abs((commXP - 1j * I)[:N-1, :N-1])):.2e}")

    # 4) Matrix elements: <n-1|a|n> = sqrt(n)
    print("a matrix elements <n-1|a|n>:", [f"{a[n-1, n]:.4f}" for n in range(1, 6)],
          "vs sqrt(n):", [f"{np.sqrt(n):.4f}" for n in range(1, 6)])

    # 5) Uncertainty product in state |n>: sigma_x * sigma_p = (n + 1/2) hbar
    for n in [0, 1, 4]:
        v = np.zeros(N); v[n] = 1.0
        sx = np.sqrt(v @ (X @ X) @ v - (v @ X @ v)**2)
        sp = np.sqrt(np.real(v @ (P @ P) @ v - (v @ P @ v)**2))
        print(f"n={n}: sigma_x*sigma_p = {sx * sp:.5f} hbar (expect {n + 0.5})")
