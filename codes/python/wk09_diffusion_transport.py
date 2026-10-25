"""
Wk09 — Reactions in solution: encounter pairs, diffusion control,
        and the material-balance (reaction-diffusion-convection) equation
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Encounter pair (QSSA):  k_r = k_a k_d / (k_a + k_d')
      k_d' << k_a : k_r -> k_d           (diffusion control)
      k_a << k_d' : k_r -> k_a k_d/k_d'  (activation control)
(2) Smoluchowski: steady state around an absorbing sphere R*
      [B](r) = (1 - R*/r)[B]bulk,  k_d = 4 pi R* (D_A + D_B) N_A
    Stokes-Einstein + R_A = R_B = R*/2  ->  k_d = 8RT/(3 eta)
    Brownian Monte Carlo check of the time-dependent rate
      k(t) = 4 pi R* D (1 + R*/sqrt(pi D t))
(3) Material balance in 1D:
      dc/dt = D d2c/dx2 - v dc/dx - k c
    Finite differences vs. the analytic pulse
      c = n0/(2A sqrt(pi D t)) exp(-(x - v t)^2/4Dt) exp(-k t)   (full line)
    (the lecture form n0/(A sqrt(pi D t)) is the same pulse against a wall)

Run:  python wk09_diffusion_transport.py     (~10 s)
"""
import numpy as np

R, NA = 8.314462618, 6.02214076e23
rng = np.random.default_rng(9)

# -- (1) encounter pair -----------------------------------------
print("(1) k_r / k_d = k_a / (k_a + k_d')")
for ka, kdp in [(1e12, 1e10), (1e10, 1e10), (1e8, 1e10)]:
    print(f"    k_a = {ka:.0e}, k_d' = {kdp:.0e}:  k_r/k_d = {ka/(ka+kdp):.4f}")

# -- (2) diffusion-controlled rate constants ----------------------
T = 298.15
print("\n(2) k_d = 8RT/(3 eta) at 298.15 K")
for name, eta in [("hexane", 0.300e-3), ("water", 0.890e-3), ("ethylene glycol", 16.06e-3), ("glycerol", 0.934)]:
    print(f"    {name:16s} eta = {eta*1e3:8.3f} mPa s   k_d = {8*R*T/(3*eta)*1e3:.2e} dm^3 mol^-1 s^-1")
Rs, Dsum = 0.4e-9, 4.0e-9
print(f"    Smoluchowski, R* = 0.4 nm, D_A + D_B = 4e-9 m^2/s: k_d = {4*np.pi*Rs*Dsum*NA*1e3:.3e} dm^3 mol^-1 s^-1")

# Brownian dynamics: B particles around a fixed absorbing sphere (units R* = 1, D = 1)
Np, Rout, dt, nstep = 100000, 8.0, 1e-3, 1500
u = rng.normal(size=(Np, 3)); u /= np.linalg.norm(u, axis=1)[:, None]
r = (1 + (Rout**3 - 1) * rng.random(Np))**(1/3)        # uniform in the shell
pos = u * r[:, None]
c0 = Np / (4/3 * np.pi * (Rout**3 - 1))
alive = np.ones(Np, bool); captured = 0
print("\n    Brownian MC (R* = 1, D = 1):  captures vs. Smoluchowski")
print("      t      MC      theory    MC/theory    theory = 4 pi c0 (t + 2 sqrt(t/pi))")
for step in range(1, nstep + 1):
    r_old = np.linalg.norm(pos, axis=1)
    pos[alive] += np.sqrt(2 * dt) * rng.normal(size=(alive.sum(), 3))
    rr = np.linalg.norm(pos, axis=1)
    # Brownian-bridge correction: a path that starts and ends outside the sphere
    # may still have touched it during the step (probability for a flat wall)
    graze = rng.random(Np) < np.exp(-np.clip((r_old - 1) * (rr - 1), 0, None) / dt)
    hit = alive & ((rr < 1.0) | graze)
    captured += hit.sum(); alive &= ~hit
    out = alive & (rr > Rout)                          # reflect at the outer wall
    pos[out] *= ((2 * Rout - rr[out]) / rr[out])[:, None]
    if step % 250 == 0:
        t = step * dt
        theory = 4 * np.pi * c0 * (t + 2 * np.sqrt(t / np.pi))
        print(f"    {t:5.2f}   {captured:6d}  {theory:8.1f}    {captured/theory:6.3f}")
print("    -> agreement within Monte Carlo noise (a few percent); stop at t = 1.5 so the\n       depletion zone sqrt(4Dt) stays well inside the outer wall")

# -- (3) 1D material balance -------------------------------------
D, v, k = 1.0e-9, 2.0e-6, 50.0                        # m^2/s, m/s, 1/s
L, nx = 1.2e-4, 1601
x = np.linspace(-L/2, L/2, nx); dx = x[1] - x[0]
dt = 0.2 * dx**2 / D
t0 = 1e-3                                              # start from the analytic pulse at t0
pulse = lambda t: np.exp(-(x - v*t)**2 / (4*D*t)) / (2*np.sqrt(np.pi*D*t)) * np.exp(-k*t)
c = pulse(t0); t = t0
tend = 0.03
while t < tend - 1e-15:
    h = min(dt, tend - t)
    lap = (np.roll(c, -1) - 2*c + np.roll(c, 1)) / dx**2
    grad = (np.roll(c, -1) - np.roll(c, 1)) / (2*dx)
    c = c + h * (D*lap - v*grad - k*c)
    c[0] = c[-1] = 0.0
    t += h
ca = pulse(t)
mass = c.sum()*dx; mean = (x*c).sum()*dx/mass; var = ((x-mean)**2*c).sum()*dx/mass
print(f"\n(3) material balance, D = {D:.0e} m^2/s, v = {v*1e6:.0f} um/s, k = {k:.0f} 1/s, t = {t*1e3:.0f} ms")
print(f"    max |FD - analytic| / peak = {np.abs(c-ca).max()/ca.max():.2e}")
print(f"    amount  {mass:.5f}   e^-kt = {np.exp(-k*t):.5f}")
print(f"    mean    {mean*1e6:.4f} um   v t = {v*t*1e6:.4f} um")
print(f"    var     {var*1e12:.4f} um^2 2Dt = {2*D*t*1e12:.4f} um^2 (pulse started at t0, so 2D t holds)")
print(f"    reaction-diffusion length sqrt(D/k) = {np.sqrt(D/k)*1e6:.2f} um")
