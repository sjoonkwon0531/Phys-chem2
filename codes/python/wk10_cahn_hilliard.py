"""
Wk10 — Cahn-Hilliard spinodal decomposition and Allen-Cahn coarsening
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

Free energy (per site, units of kT), lecture p. 10-13:
    F = sum [ f(phi) + kappa |grad phi|^2 ],
    f(phi) = chi phi(1-phi) + phi ln phi + (1-phi) ln(1-phi)
    mu = df/dphi - 2 kappa lap(phi)
Cahn-Hilliard (conserved):   d phi/dt =  M lap(mu)
Allen-Cahn (non-conserved):  d phi/dt = -L (phi^3 - phi - 2 kappa lap(phi))
Linear stability (Fourier mode q):
    R(q) = -M q^2 [ f''(phi0) + 2 kappa q^2 ],  unstable when f''(phi0) < 0
    fastest mode q_m^2 = -f''(phi0) / (4 kappa),  lambda_m = 2 pi / q_m
    (marginal mode q_th = sqrt(2) q_m; cf. lecture p. 14)
Numerics: semi-implicit Fourier spectral method, periodic box.

Run:  python wk10_cahn_hilliard.py     (~90 s)
"""
import numpy as np

rng = np.random.default_rng(10)
N, dx = 128, 1.0
k = 2 * np.pi * np.fft.fftfreq(N, d=dx)
KX, KY = np.meshgrid(k, k, indexing="ij")
K2 = KX**2 + KY**2
KMAG = np.sqrt(K2)

def fprime(p, chi):
    p = np.clip(p, 1e-9, 1 - 1e-9)
    return np.log(p / (1 - p)) + chi * (1 - 2 * p)

def radial_peak(phi):
    S = np.abs(np.fft.fft2(phi - phi.mean()))**2
    bins = np.arange(0.5, N // 2) * (2 * np.pi / (N * dx))
    idx = np.digitize(KMAG.ravel(), bins)
    Sq = np.bincount(idx, weights=S.ravel(), minlength=len(bins) + 1)
    cnt = np.bincount(idx, minlength=len(bins) + 1)
    Sq = Sq[1:len(bins)] / np.maximum(cnt[1:len(bins)], 1)
    qc = 0.5 * (bins[1:] + bins[:-1])
    qmean = np.sum(qc * Sq) / np.sum(Sq)
    return qc[np.argmax(Sq)], qmean

def cahn_hilliard(chi, phi0, kappa=1.0, t_end=10.0, dt=0.05, amp=1e-3, snaps=()):
    phi = phi0 + amp * rng.standard_normal((N, N))
    A = 2.0 * chi                                   # stabilizing constant
    den = 1 + dt * K2 * (A + 2 * kappa * K2)
    out, t, nsteps = {}, 0.0, int(round(t_end / dt))
    for n in range(1, nsteps + 1):
        ph = np.fft.fft2(phi)
        muh = np.fft.fft2(fprime(phi, chi))
        ph = (ph - dt * K2 * (muh - A * ph)) / den
        phi = np.real(np.fft.ifft2(ph))
        t = n * dt
        for ts in snaps:
            if abs(t - ts) < dt / 2:
                out[ts] = phi.copy()
    return phi, out

# -- (1) linear regime: the fastest-growing wavelength ----------------
print("(1) early-time dominant wavelength vs linear theory (kappa = 1)")
print("    chi   phi0    f''(phi0)   lambda_m theory   lambda measured (t when amp ~ 0.05)")
for chi, phi0 in ((3.0, 0.5), (2.6, 0.5), (3.0, 0.35)):
    fpp = 1 / (phi0 * (1 - phi0)) - 2 * chi
    qm = np.sqrt(-fpp / 4.0)
    Rm = qm**2 * (-fpp - 2 * qm**2)                 # max growth rate
    t_lin = np.log(50) / Rm
    phi, _ = cahn_hilliard(chi, phi0, t_end=t_lin)
    qpk, _ = radial_peak(phi)
    print(f"    {chi:3.1f}   {phi0:4.2f}   {fpp:+7.3f}       {2*np.pi/qm:7.2f}            {2*np.pi/qpk:7.2f}   (t = {t_lin:.1f})")

# -- (2) late stage: phases, mass conservation, coarsening ------------
chi, phi0 = 3.0, 0.5
times = (50, 100, 200, 400, 800)
phi, snaps = cahn_hilliard(chi, phi0, t_end=800, dt=0.1, amp=1e-2, snaps=times)
phi_start = snaps[50].mean()
print(f"\n(2) chi = {chi}, phi0 = {phi0}: late-stage spinodal decomposition")
print(f"    mean phi conserved: {phi.mean():.8f} at t = 800 vs {phi_start:.8f} at t = 50")
print(f"    phase compositions: {np.percentile(phi, 2):.3f} / {np.percentile(phi, 98):.3f}   binodal 0.071 / 0.929")
Ls = []
for t in times:
    _, qmean = radial_peak(snaps[t])
    Ls.append(2 * np.pi / qmean)
    print(f"    t = {t:4d}:  domain size L = 2pi/<q> = {Ls[-1]:6.2f}")
slope = np.polyfit(np.log(times), np.log(Ls), 1)[0]
print(f"    coarsening exponent L ~ t^n:  n = {slope:.2f}   (Lifshitz-Slyozov: 1/3)")

# -- (3) Allen-Cahn: non-conserved order parameter --------------------
N2 = 256
k2 = 2 * np.pi * np.fft.fftfreq(N2, d=dx)
KX2, KY2 = np.meshgrid(k2, k2, indexing="ij")
K2b = KX2**2 + KY2**2
Kb = np.sqrt(K2b)
def domain_size(phi):
    """area per unit interface length: L = 1 / (sign changes per site per direction)"""
    s = np.sign(phi)
    walls = np.mean(s != np.roll(s, 1, 0)) + np.mean(s != np.roll(s, 1, 1))
    return 2.0 / walls
phi = 0.0 + 0.1 * rng.standard_normal((N2, N2))
L_ac, kap, dt = 1.0, 0.5, 0.05
den = 1 + dt * L_ac * 2 * kap * K2b                  # implicit gradient term
sizes = []
for n in range(1, 6401):
    ph = np.fft.fft2(phi + dt * L_ac * (phi - phi**3))
    phi = np.real(np.fft.ifft2(ph / den))
    if n in (800, 1600, 3200, 6400):
        sizes.append((n * dt, domain_size(phi), phi.mean()))
print("\n(3) Allen-Cahn (non-conserved), 256 x 256, start phi = 0 +/- noise")
for t, Lt, m in sizes:
    print(f"    t = {t:5.0f}:  domain size {Lt:6.2f},  mean phi = {m:+.3f}  (not conserved)")
slope = np.polyfit(np.log([s[0] for s in sizes]), np.log([s[1] for s in sizes]), 1)[0]
print(f"    coarsening exponent n = {slope:.2f}   (curvature-driven Allen-Cahn: 1/2 at late times)")
