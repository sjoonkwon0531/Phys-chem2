# Wk09 — Collision theory, steric factor, and the RRK model
# Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
#
# (1) Z_AA = (1/2) sigma c_rel n^2,  c_rel = (16 kT / pi m)^(1/2)
# (2) steric factor P = A_exp / A_theory
# (3) RRK: P(e1 >= E0 | E) = (1 - E0/E)^(s-1), Monte Carlo on the energy simplex;
#     thermal average with rho ~ E^(s-1) gives k(T) = nu exp(-E0/kT)
#
# Run:  julia wk09_collision_rrk.jl
using Printf, Random, Statistics
Random.seed!(9)
const KB, NA, AMU = 1.380649e-23, 6.02214076e23, 1.66053906660e-27

# (1) N2 at 298.15 K, 1 bar, sigma = 0.43 nm^2
T, p, σ, m = 298.15, 1e5, 0.43e-18, 28.0134AMU
n = p / (KB * T); cbar = sqrt(8KB * T / (π * m)); crel = sqrt(2) * cbar
z = σ * crel * n; ZAA = 0.5σ * crel * n^2
println("(1) N2, 298.15 K, 1 bar, sigma = 0.43 nm^2")
@printf("    n = %.3e m^-3, mean speed = %.1f m/s, relative speed = %.1f m/s\n", n, cbar, crel)
@printf("    z = %.3e s^-1,  Z_AA = %.3e m^-3 s^-1 = %.3e mol dm^-3 s^-1\n", z, ZAA, ZAA / NA / 1e3)
@printf("    A_theory = %.3e dm^3 mol^-1 s^-1\n\n", σ * crel * NA * 1e3)

# (2) steric factors
table = [("2NOCl -> 2NO + 2Cl", 9.4e9, 5.9e10), ("2ClO -> Cl2 + O2", 6.3e7, 2.5e10),
         ("H2 + C2H4 -> C2H6", 1.24e6, 7.4e11), ("K + Br2 -> KBr + Br", 1.0e12, 2.1e11)]
println("(2) steric factor P = A_exp / A_theory")
for (name, a, b) in table
    @printf("    %-22s P = %.2e\n", name, a / b)
end

# (3) RRK Monte Carlo
println("\n(3) RRK  P(e1 >= E0|E) = (1 - E0/E)^(s-1)\n     s   E0/E    formula     Monte Carlo")
N = 400_000
for s in (2, 3, 5, 10), x in (0.2, 0.5)
    g = randexp(N, s)
    e1 = g[:, 1] ./ vec(sum(g, dims=2))
    @printf("    %2d   %.1f   %.5f     %.5f\n", s, x, (1 - x)^(s - 1), mean(e1 .>= x))
end
s, E0, kT = 6, 1.0, 0.25
E = range(0, 60kT, length=600_001)
w = E .^ (s - 1) .* exp.(-E ./ kT)
kE = [e >= E0 ? (1 - E0 / e)^(s - 1) : 0.0 for e in E]
@printf("\n    thermal average (s = 6, E0/kT = 4): quadrature %.6e   exp(-E0/kT) = %.6e\n",
        sum(kE .* w) / sum(w), exp(-E0 / kT))
