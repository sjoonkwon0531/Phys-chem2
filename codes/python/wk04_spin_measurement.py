"""
Wk04 — Spin-1/2: Pauli algebra, sequential measurement, unitarity
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) S_i = (hbar/2) sigma_i.  Check the algebra:
      [S_x, S_y] = i hbar S_z (cyclic),  [S^2, S_i] = 0,  S^2 = (3/4) hbar^2 I
(2) Measuring S_x on |up_z>: eigenvectors |up_x> = (|up>+|down>)/sqrt2
      -> P(+hbar/2) = P(-hbar/2) = 1/2.  Monte-Carlo a Stern-Gerlach chain
      z-filter -> x-measure -> z-measure: the last z is 50/50 again!
      (measuring S_x ERASES the previously known S_z value)
(3) Basis change |z> <-> |x> is a UNITARY matrix U: U^dag U = I,
      and <f|g> is conserved. [S_y]' = U^-1 [S_y] U as in the lecture.

Run:  python wk04_spin_measurement.py     (hbar = 1)
"""
import numpy as np

rng = np.random.default_rng(42)
hbar = 1.0

I2 = np.eye(2, dtype=complex)
sx = np.array([[0, 1], [1, 0]], dtype=complex)
sy = np.array([[0, -1j], [1j, 0]], dtype=complex)
sz = np.array([[1, 0], [0, -1]], dtype=complex)
Sx, Sy, Sz = 0.5 * hbar * sx, 0.5 * hbar * sy, 0.5 * hbar * sz
S2 = Sx @ Sx + Sy @ Sy + Sz @ Sz

# -- (1) algebra checks --------------------------------------
comm = lambda A, B: A @ B - B @ A
print("|| [Sx,Sy] - i hbar Sz || =", np.abs(comm(Sx, Sy) - 1j * hbar * Sz).max())
print("|| [S^2,Sx] ||            =", np.abs(comm(S2, Sx)).max())
print("S^2 = (3/4) hbar^2 I ?     ", np.allclose(S2, 0.75 * hbar**2 * I2))
print("eigenvalues of Sx:         ", np.round(np.linalg.eigvalsh(Sx), 6), "\n")

# -- (2) sequential Stern-Gerlach ----------------------------
up_z = np.array([1, 0], dtype=complex)
up_x = np.array([1, 1], dtype=complex) / np.sqrt(2)
dn_x = np.array([1, -1], dtype=complex) / np.sqrt(2)

N = 100_000
# start in |up_z>; measure S_x
p_upx = abs(np.vdot(up_x, up_z))**2
got_upx = rng.random(N) < p_upx           # collapse
# those that gave +x are now |up_x>; measure S_z again
p_upz_after = abs(np.vdot(up_z, up_x))**2
got_upz = rng.random(got_upx.sum()) < p_upz_after

print(f"P(Sx=+h/2 | up_z)  theory 0.5, MC {got_upx.mean():.4f}")
print(f"P(Sz=+h/2 | up_x)  theory 0.5, MC {got_upz.mean():.4f}")
print("-> the x-measurement destroyed the z-information: incompatible observables")
print("   ([Sz,Sx] = i hbar Sy != 0 - they share no common eigenvectors)\n")

# -- (3) unitary basis change --------------------------------
U = np.column_stack([up_x, dn_x])          # columns: new basis in old coords
print("U =\n", np.round(U, 4))
print("U^dag U = I ?", np.allclose(U.conj().T @ U, I2))
Sy_p = U.conj().T @ Sy @ U                 # lecture: [Sy]' = U^-1 [Sy] U
print("[Sy]' = U^-1 Sy U =\n", np.round(Sy_p, 4))
print("-> in the x-basis, Sy looks like (hbar/2)[[0,1],[1,0]]: same eigenvalues +-hbar/2")

f = np.array([0.6, 0.8j]); g = np.array([1/np.sqrt(2), -1/np.sqrt(2)])
print("<f|g> before:", np.vdot(f, g).round(6), " after U:", np.vdot(U @ f, U @ g).round(6))
print("-> unitary transformations conserve inner products (continuous symmetries!)")

# -- Zeeman splitting ----------------------------------------
muB = 5.7883818060e-5      # eV/T
g_e = 2.0023
for B in (0.5, 1.0, 5.0):
    dE = g_e * muB * B     # between ms = +-1/2
    print(f"B = {B:4.1f} T: Zeeman splitting g mu_B B = {dE:.3e} eV "
          f"(ESR frequency {dE/4.135667696e-15/1e9:.1f} GHz)")
