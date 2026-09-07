"""
Wk02 — Gaussian wave packet: minimum uncertainty & dispersion
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

psi(x) = (1/2 pi eps)^{1/4} exp(-x^2/4eps + i p0 x / hbar)
 -> |psi(x)|^2 Gaussian with sigma_x = sqrt(eps)
 -> |phi(p)|^2 Gaussian with sigma_p = hbar/(2 sqrt(eps))
 -> sigma_x sigma_p = hbar/2  (minimum uncertainty packet!)
Free-particle time evolution disperses the packet:
 sigma_x(t)^2 = eps + hbar^2 t^2 / (4 m^2 eps)   (sigma_p stays constant)

Run:  python wk02_wave_packet.py     (hbar = m = 1 units)
"""
import numpy as np
import matplotlib.pyplot as plt

trapz = getattr(np, "trapezoid", getattr(np, "trapz", None))  # numpy 1.x/2.x compat

hbar, m = 1.0, 1.0
p0 = 2.0

def psi_x(x, eps):
    return (1/(2*np.pi*eps))**0.25 * np.exp(-x**2/(4*eps) + 1j*p0*x/hbar)

def phi_p(p, eps):          # Fourier transform (analytic)
    return (2*eps/(np.pi*hbar**2))**0.25 * np.exp(-eps*(p-p0)**2/hbar**2)

# -- 1) verify sigma_x * sigma_p = hbar/2 numerically --------
x = np.linspace(-30, 30, 20001)
p = np.linspace(-10, 14, 20001)
print("eps    sigma_x     sigma_p     product/hbar")
for eps in (0.5, 1.0, 2.0, 3.0):
    Px = np.abs(psi_x(x, eps))**2
    Pp = np.abs(phi_p(p, eps))**2
    sx = np.sqrt(trapz(x**2*Px, x) - trapz(x*Px, x)**2)
    sp = np.sqrt(trapz(p**2*Pp, p) - trapz(p*Pp, p)**2)
    print(f"{eps:4.1f}  {sx:9.5f}  {sp:9.5f}  {sx*sp/hbar:11.5f}")
print("-> minimum uncertainty: sigma_x sigma_p = hbar/2 for every eps\n")

# -- 2) dispersion of the packet -----------------------------
eps = 1.0
def sigma_x_t(t):
    return np.sqrt(eps + (hbar*t)**2/(4*m**2*eps))

plt.figure(figsize=(11, 4.2))
plt.subplot(1, 2, 1)
xs = np.linspace(-8, 28, 800)
for t in (0.0, 3.0, 6.0):
    s2 = eps + (hbar*t)**2/(4*m**2*eps)
    xc = p0*t/m                                   # packet center drifts at v = p0/m
    P = 1/np.sqrt(2*np.pi*s2) * np.exp(-(xs-xc)**2/(2*s2))
    plt.plot(xs, P, label=f"t = {t:.0f},  sigma_x = {np.sqrt(s2):.2f}")
plt.xlabel("x"); plt.ylabel("|Psi(x,t)|^2")
plt.title("Free-packet dispersion (center moves at p0/m)")
plt.legend(fontsize=8)

plt.subplot(1, 2, 2)
ts = np.linspace(0, 10, 300)
plt.plot(ts, sigma_x_t(ts), "b-", label="sigma_x(t)")
plt.plot(ts, np.full_like(ts, hbar/(2*np.sqrt(eps))), "r--", label="sigma_p (constant)")
plt.plot(ts, hbar*ts/(2*m*np.sqrt(eps)), "k:", label="asymptote hbar t / 2 m sqrt(eps)")
plt.xlabel("t"); plt.legend(); plt.title("Position uncertainty grows with time")
plt.tight_layout(); plt.show()

# electron localized to 0.1 nm: how fast does it spread? (SI aside)
hbar_SI, me = 1.054571817e-34, 9.1093837015e-31
eps_SI = (1e-10)**2
t2 = 2*np.sqrt(3)*me*eps_SI/hbar_SI               # time to double sigma_x
print(f"electron packet with sigma_x = 0.1 nm doubles its width in {t2:.2e} s (~0.3 fs)")
