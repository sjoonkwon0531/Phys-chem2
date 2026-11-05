"""
Week 11 - Collinear A + BC -> AB + C on a LEPS potential energy surface
Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)

LEPS (London-Eyring-Polanyi-Sato) surface with Sato parameter K:
  Q_i = D_i/4 [ (3+K) e^{-2b(r-re)} - (2+6K) e^{-b(r-re)} ] / (1+K)
  J_i = D_i/4 [ (1+3K) e^{-2b(r-re)} - (6+2K) e^{-b(r-re)} ] / (1+K)
  V   = Q1 + Q2 + Q3 - sqrt( [(J1-J2)^2 + (J2-J3)^2 + (J3-J1)^2] / 2 )
  r1 = r_AB, r2 = r_BC, r3 = r1 + r2 (collinear)
H2 Morse parameters: D = 4.746 eV, b = 1.942 1/A, re = 0.742 A.
K = 0.136 puts the H3 saddle at r1 = r2 = 0.931 A with a 0.416 eV barrier,
close to the accurate ab initio value (9.53-9.65 kcal/mol = 0.413-0.418 eV).

Units: eV, A, amu  ->  time unit = sqrt(amu A^2 / eV) = 10.18 fs.
"Early" and "late" model surfaces change only D_AB (exothermic vs endothermic)
to illustrate the Polanyi rules.
"""
import numpy as np

B, RE, K = 1.942, 0.742, 0.136
M = 1.00784                       # H atom mass (amu)
HBAR = 0.6582119569 / 10.1805     # eV * (time unit)

SURF = {"symmetric": (4.746, 4.746, 4.746),   # D_AB, D_BC, D_AC (eV)
        "early":     (5.5,   4.746, 4.746),   # exothermic by 0.754 eV
        "late":      (4.746, 5.5,   4.746)}   # endothermic by 0.754 eV

def qj(r, D):
    e1 = np.exp(-B * (r - RE)); e2 = e1 * e1
    Q = D / 4 * ((3 + K) * e2 - (2 + 6 * K) * e1) / (1 + K)
    J = D / 4 * ((1 + 3 * K) * e2 - (6 + 2 * K) * e1) / (1 + K)
    dQ = D / 4 * (-2 * B * (3 + K) * e2 + B * (2 + 6 * K) * e1) / (1 + K)
    dJ = D / 4 * (-2 * B * (1 + 3 * K) * e2 + B * (6 + 2 * K) * e1) / (1 + K)
    return Q, J, dQ, dJ

def leps(r1, r2, D):
    Q1, J1, dQ1, dJ1 = qj(r1, D[0])
    Q2, J2, dQ2, dJ2 = qj(r2, D[1])
    Q3, J3, dQ3, dJ3 = qj(r1 + r2, D[2])
    S = np.sqrt(0.5 * ((J1 - J2)**2 + (J2 - J3)**2 + (J3 - J1)**2)) + 1e-14
    s1 = (2 * J1 - J2 - J3) / (2 * S)
    s2 = (2 * J2 - J1 - J3) / (2 * S)
    s3 = (2 * J3 - J1 - J2) / (2 * S)
    V = Q1 + Q2 + Q3 - S
    g1 = dQ1 + dQ3 - s1 * dJ1 - s3 * dJ3          # dV/dr1
    g2 = dQ2 + dQ3 - s2 * dJ2 - s3 * dJ3          # dV/dr2
    return V, g1, g2

def barrier(D):
    """Max along x = r2 - r1 of the minimum over y = r1 + r2 (grid minimax)."""
    best, arg = -1e9, None
    for x in np.linspace(-3, 3, 1201):
        ys = np.linspace(abs(x) + 0.5, abs(x) + 4, 700)
        v = leps((ys - x) / 2, (ys + x) / 2, D)[0]
        j = int(np.argmin(v))
        if v[j] > best:
            best, arg = v[j], ((ys[j] - x) / 2, (ys[j] + x) / 2)
    return best + D[1], arg

def trajectory(D, Et, Ev, phase, dt=0.002, tmax=15.0, keep=False):
    """Velocity Verlet for three collinear atoms. Returns 1 (reactive), 0, or 0.5."""
    mu = M / 2
    w = B * np.sqrt(2 * D[1] / mu)                 # BC harmonic frequency
    A = np.sqrt(2 * Ev / (mu * w * w))
    r2 = RE + A * np.cos(phase); vr = -A * w * np.sin(phase)
    vrel = np.sqrt(2 * Et / (2 * M / 3))           # reduced mass of A vs BC
    x = np.array([-4.0, 0.0, r2])
    v = np.array([2 * vrel / 3, -vr / 2 - vrel / 3, vr / 2 - vrel / 3])
    def force(x):
        _, g1, g2 = leps(x[1] - x[0], x[2] - x[1], D)
        return np.array([g1, -g1 + g2, -g2])
    f = force(x); t = 0.0; path = []
    while t < tmax:
        v += 0.5 * dt * f / M; x += dt * v; f = force(x); v += 0.5 * dt * f / M; t += dt
        r1, r2 = x[1] - x[0], x[2] - x[1]
        if keep and int(t / dt) % 10 == 0: path.append((r1, r2))
        if r1 > 5 and r2 < 2: return (0, path) if keep else 0
        if r2 > 5 and r1 < 2: return (1, path) if keep else 1
    return (0.5, path) if keep else 0.5

def reaction_probability(D, Et, Ev, n=24):
    return np.mean([trajectory(D, Et, Ev, p) for p in np.linspace(0, 2 * np.pi, n, endpoint=False)])

if __name__ == "__main__":
    hw = HBAR * B * np.sqrt(2 * 4.746 / (M / 2))
    print(f"H2 harmonic quantum hbar*omega = {hw:.4f} eV  ({hw / 1.239842e-4:.0f} cm^-1)")
    for name, D in SURF.items():
        Eb, (r1, r2) = barrier(D)
        print(f"{name:9s}: barrier = {Eb:.3f} eV at r_AB = {r1:.3f} A, r_BC = {r2:.3f} A,"
              f"  reaction energy = {D[1] - D[0]:+.3f} eV")
    print("\nPolanyi rules: same total energy, different split (24 vibrational phases each)")
    for name, tot in [("early", 0.45), ("late", 1.30)]:
        for f in (0.9, 0.5, 0.1):
            P = reaction_probability(SURF[name], tot * f, tot * (1 - f))
            print(f"  {name:5s}  E_trans = {tot * f:.2f} eV, E_vib = {tot * (1 - f):.2f} eV  ->  P_react = {P:.2f}")
