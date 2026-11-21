"""
Week 13 (Physical Chemistry 2) - Powder X-ray diffraction pattern of cubic crystals
  peak positions: 2 theta from lambda = 2 d sin(theta), d = a / sqrt(h2+k2+l2)
  intensity: |S|^2 x multiplicity x Lorentz-polarization factor (1 + cos^2 2theta)/(sin^2 theta cos theta)
  form factor (teaching model): f(s) = Z exp(-B s^2), s = sin(theta)/lambda, B = 2 A^2 for every atom
  indexing: ratios sin^2(theta_i)/sin^2(theta_1) identify SC / BCC / FCC
  crystallite size: Scherrer equation tau = K lambda / (beta cos theta), K = 0.9
"""
import numpy as np
from itertools import product

LAM = 1.5406                                    # Cu K-alpha1, angstrom
F = 0.5
crystals = {                                    # name: (a in angstrom, basis [(Z, xyz)])
    "Cu (FCC)":   (3.61, [(29, p) for p in [(0, 0, 0), (0, F, F), (F, 0, F), (F, F, 0)]]),
    "a-Fe (BCC)": (2.87, [(26, (0, 0, 0)), (26, (F, F, F))]),
    "Si (diamond)": (5.43, [(14, p) for p in [(0, 0, 0), (0, F, F), (F, 0, F), (F, F, 0)]]
                     + [(14, (p[0] + .25, p[1] + .25, p[2] + .25)) for p in [(0, 0, 0), (0, F, F), (F, 0, F), (F, F, 0)]]),
    "NaCl (rock salt)": (5.63, [(11, p) for p in [(0, 0, 0), (0, F, F), (F, 0, F), (F, F, 0)]]
                         + [(17, (p[0] + F, p[1], p[2])) for p in [(0, 0, 0), (0, F, F), (F, 0, F), (F, F, 0)]]),
}

def pattern(a, basis, B=2.0, tth_max=100):
    peaks = {}
    for hkl in product(range(-6, 7), repeat=3):
        if not any(hkl):
            continue
        N = sum(h * h for h in hkl)
        d = a / np.sqrt(N)
        s = LAM / (2 * d)
        if s >= 1:
            continue
        th = np.arcsin(s)
        if 2 * np.degrees(th) > tth_max:
            continue
        f = lambda Z: Z * np.exp(-B * (s / LAM) ** 2)
        Sg = sum(f(Z) * np.exp(-2j * np.pi * np.dot(hkl, x)) for Z, x in basis)
        if abs(Sg) < 1e-6:
            continue
        key = tuple(sorted(map(abs, hkl), reverse=True))
        lp = (1 + np.cos(2 * th) ** 2) / (np.sin(th) ** 2 * np.cos(th))
        I = abs(Sg) ** 2 * lp
        if key in peaks:
            peaks[key][2] += I          # multiplicity accumulates over equivalent (hkl)
            peaks[key][3] += 1
        else:
            peaks[key] = [2 * np.degrees(th), d, I, 1]
    out = sorted(peaks.items(), key=lambda kv: kv[1][0])
    Imax = max(v[2] for _, v in out)
    return [(k, v[0], v[1], 100 * v[2] / Imax, v[3]) for k, v in out]

for name, (a, basis) in crystals.items():
    print(f"{name}, a = {a} A, Cu K-alpha1 lambda = {LAM} A")
    pk = pattern(a, basis)
    s1 = np.sin(np.radians(pk[0][1] / 2)) ** 2
    for k, tth, d, I, m in pk[:7]:
        r = np.sin(np.radians(tth / 2)) ** 2 / s1
        print(f"   ({''.join(map(str, k))})  2theta = {tth:6.2f} deg  d = {d:.4f} A  mult = {m:2d}  "
              f"I = {I:5.1f}  sin2 ratio = {r:.3f}")
    print()

print("Scherrer crystallite size, Cu (111) peak, K = 0.9")
tth = pattern(*crystals["Cu (FCC)"])[0][1]
for fwhm_deg in (0.1, 0.3, 1.0):
    beta = np.radians(fwhm_deg)
    tau = 0.9 * LAM / (beta * np.cos(np.radians(tth / 2)))
    print(f"   FWHM = {fwhm_deg:.1f} deg -> tau = {tau / 10:.1f} nm")
