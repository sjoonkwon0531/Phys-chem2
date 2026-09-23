# Wk04 - Transport properties of a perfect gas
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
# lambda = kT/(sqrt2 sigma P); D = 1/3 lambda v; effusion (Cs example).
using Printf

const kB = 1.380649e-23; const NA = 6.02214076e23; const R = kB * NA
gases = [("He", 0.21, 4.003e-3), ("N2", 0.43, 28.0134e-3),
         ("CO2", 0.52, 44.01e-3), ("C6H6", 0.88, 78.11e-3)]
T, P = 298.15, 101325.0

@printf("gas    sigma[nm2]  v_mean[m/s]  lambda[nm]    z[1/s]\n")
for (g, sn, M) in gases
    s = sn * 1e-18
    vmean = sqrt(8R * T / (π * M))
    lam = kB * T / (sqrt(2) * s * P)
    @printf("%-5s  %9.2f  %11.1f  %10.1f  %9.3e\n", g, sn, vmean, lam * 1e9, vmean / lam)
end
println("-> N2: lambda ~ 67 nm at 1 atm\n")

# transport coefficients for N2
s = 0.43e-18; M = 28.0134e-3
vmean = sqrt(8R * T / (π * M))
lam = kB * T / (sqrt(2) * s * P)
n = P / (kB * T); ρ = n * M / NA
D = lam * vmean / 3; μ = ρ * D
kth = vmean * lam * n / NA * 2.5R / 3
@printf("N2: D = %.2e m2/s, mu = %.1f uPa s, k = %.1f mW/m K, Sc = %.2f\n",
        D, μ * 1e6, kth * 1e3, μ / (ρ * D))

print("mu at 0.1/1/10 atm: ")
for pf in (0.1, 1.0, 10.0)
    lam_ = kB * T / (sqrt(2) * s * P * pf)
    ρ_ = (P * pf / (kB * T)) * M / NA
    @printf("%.1f ", ρ_ * lam_ * vmean / 3 * 1e6)
end
println("uPa s -> constant! (Maxwell's surprise)\n")

# Cs effusion example (lecture): expect 8.7 kPa
M_Cs = 132.905e-3; T_Cs = 500.0; A0 = π * (0.25e-3)^2
P_Cs = sqrt(2π * R * T_Cs / M_Cs) * 385e-6 / (A0 * 100)
@printf("Cs vapor pressure from effusion: %.2f kPa (lecture 8.7 kPa)\n", P_Cs / 1e3)
