"""
Wk10 — Where the Boltzmann distribution comes from
Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU

(1) Stirling:  ln N! ~ N ln N - N   (relative error -> 0 as N grows)
(2) Exact counting (Einstein solid): N oscillators share Q quanta.
    Probability that one oscillator holds n quanta:
        P(n) = C(Q - n + N - 2, N - 2) / C(Q + N - 1, N - 1)
    For large N it becomes the Boltzmann (geometric) law
        P(n) = (1 - x) x^n,   x = exp(-beta*eps) = Q / (Q + N)
(3) Energy-exchange game: random pairs pass one quantum at a time.
    Whatever the start, the histogram relaxes to exp(-beta*eps).
(4) beta from the slope: ln P(n) = const - beta*eps*n,
    and 1/beta = kT agrees with d(ln W)/dE = beta  (lecture p. 7).

Run:  python wk10_boltzmann_exchange.py     (~5 s)
"""
import numpy as np
from math import lgamma, log, exp

rng = np.random.default_rng(10)

# -- (1) Stirling ------------------------------------------------
print("(1) Stirling: ln N!  vs  N ln N - N")
print("        N        ln N!            N lnN - N        rel. error")
for N in (10, 100, 1000, 10**6):
    exact = lgamma(N + 1)
    approx = N * log(N) - N
    print(f"  {N:8d}   {exact:14.4f}   {approx:14.4f}     {(exact-approx)/exact:9.2e}")

# -- (2) exact counting vs Boltzmann -------------------------------
def lnC(n, k):
    return lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1)

print("\n(2) Einstein solid, <n> = Q/N = 1  ->  Boltzmann x = 1/2")
print("     n   N=10 exact   N=100 exact   N=1000 exact   Boltzmann (1-x)x^n")
for n in range(0, 7):
    row = []
    for N in (10, 100, 1000):
        Q = N
        row.append(exp(lnC(Q - n + N - 2, N - 2) - lnC(Q + N - 1, N - 1)))
    print(f"    {n:2d}    {row[0]:.5f}      {row[1]:.5f}       {row[2]:.5f}        {0.5*0.5**n:.5f}")

# -- (3) energy-exchange game -------------------------------------
N, q0, sweeps = 2000, 2, 400
n = np.full(N, q0)                      # everyone starts with the SAME energy
hist = np.zeros(15)
for sweep in range(sweeps):
    pairs = rng.integers(N, size=(N, 2))
    for i, j in pairs:
        if i != j and n[i] > 0:
            n[i] -= 1; n[j] += 1
    if sweep >= sweeps // 2:             # average snapshots after equilibration
        hist += np.bincount(n, minlength=15)[:15]
hist = hist / (N * (sweeps - sweeps // 2))
x = q0 / (q0 + 1.0)                     # <n> = x/(1-x) = q0
print(f"\n(3) exchange game: N = {N}, start n = {q0} for all, {sweeps} sweeps (second half averaged)")
print("     n   simulation   Boltzmann")
for k in range(8):
    print(f"    {k:2d}    {hist[k]:.4f}       {(1-x)*x**k:.4f}")
nz = hist[:10] > 0
slope = np.polyfit(np.arange(10)[nz], np.log(hist[:10][nz]), 1)[0]
print(f"    fitted beta*eps = {-slope:.3f}   exact ln((q0+1)/q0) = {np.log((q0+1)/q0):.3f}")
print(f"    total energy conserved: {n.sum()} = {N*q0}")

# -- (4) beta = d ln W / dE  (Einstein solid) ------------------------
N = 1000
for Q in (500, 1000, 2000):
    dlnW = lnC(Q + 1 + N - 1, N - 1) - lnC(Q + N - 1, N - 1)   # ln W(Q+1) - ln W(Q)
    print(f"(4) N = {N}, Q = {Q}:  d lnW/dQ = {dlnW:.4f}   ln((Q+N)/Q) = {np.log((Q+N)/Q):.4f}   (= beta*eps)")
