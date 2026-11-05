# Week 11 - Marcus electron-transfer rate and bimolecular steady state
# Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
# k_ET = (2pi/hbar)|V|^2 (4 pi lam kT)^(-1/2) exp[-(lam + dG0)^2/(4 lam kT)]
# 1/k_r = 1/k_a + k_a'/(k_a k_et) (1 + k_et'/k_d)
using Printf
const HBAR, KB = 6.582119569e-16, 8.617333262e-5

kmarcus(dG0, lam, V, T) = 2pi / HBAR * V^2 / sqrt(4pi * lam * KB * T) * exp(-(lam + dG0)^2 / (4lam * KB * T))
function kbimol(dG0, lam, V, ka, KA, T)
    karev = ka / KA; kd = karev; ket = kmarcus(dG0, lam, V, T); ketr = ket * exp(dG0 / (KB * T))
    1 / (1 / ka + karev / (ka * ket) * (1 + ketr / kd))
end

T = 298.15; eta = 0.890e-3; ka = 8 * 8.314462618 * T / (3eta) * 1e3; lam, V = 1.0, 0.01
@printf("k_a = %.3e M^-1 s^-1, k_ET max = %.4e s^-1\n", ka, kmarcus(-lam, lam, V, T))
for dG0 in (0.2, 0.0, -0.25, -0.5, -1.0, -1.5, -2.0, -2.5, -3.0)
    @printf("%6.2f %8.4f %11.3e %11.3e\n", dG0, (lam + dG0)^2 / 4lam, kmarcus(dG0, lam, V, T), kbimol(dG0, lam, V, ka, 1.0, T))
end
@printf("beta from 10x per 1.7 A = %.3f 1/A\n", log(10) / 1.7)
