# Wk10 — From the partition function to thermodynamics
# Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
#
# (1) two-level system: C_V = dU/dT = sigma_E^2/kT^2, Schottky peak
# (2) sigma_E/<E> ~ N^(-1/2)
# (3) diatomic q = qT qR qV qE and S° vs CODATA (constants: NIST CCCBDB)
# (4) Langmuir lattice gas: sigma_N^2 = kT d<N>/dmu = M theta(1-theta)
# (5) mu_trans = kT ln(n Lambda^3)
#
# Run:  julia wk10_partition_thermo.jl
using Printf, Random
Random.seed!(10)
const KB, H, C, R, AMU = 1.380649e-23, 6.62607015e-34, 2.99792458e10, 8.314462618, 1.66053906660e-27

Utl(t) = exp(-1 / t) / (1 + exp(-1 / t))
ts = range(0.05, 3, length=6000); h = 1e-5
cv = [(Utl(t + h) - Utl(t - h)) / (2h) for t in ts]
dev = maximum(abs.(cv .- [(Utl(t) - Utl(t)^2) / t^2 for t in ts]))
i = argmax(cv)
@printf("(1) two-level: C_max = %.4f k at kT/eps = %.4f; max|dU/dT - sigma^2/kT^2| = %.1e\n\n", cv[i], ts[i], dev)

p = exp(-1) / (1 + exp(-1))
println("(2) sigma_E/<E> at kT = eps")
for N in (10, 100, 1000, 10000, 1_000_000)
    E = [count(<(p), rand(N)) for _ in 1:(N > 10000 ? 500 : 20000)]
    m = sum(E) / length(E); sd = sqrt(sum((E .- m) .^ 2) / length(E))
    @printf("    N = %8d: simulated %.5f  theory %.5f\n", N, sd / m, sqrt((1 - p) / (N * p)))
end

mols = [("N2", 28.0134, 2358.57, 1.998241, 2, 1, 191.609), ("O2", 31.9988, 1580.161, 1.44562, 2, 3, 205.152),
        ("CO", 28.0101, 2169.756, 1.931602, 1, 1, 197.660), ("HCl", 36.461, 2990.925, 10.5933, 1, 1, 186.902),
        ("I2", 253.809, 214.502, 0.037372, 2, 1, 260.687)]
T, p0 = 298.15, 1e5
println("\n(3) S° at 298.15 K, 1 bar\n     mol    qR       qV      S_total   CODATA")
for (n, M, nu, B, sig, g0, Sref) in mols
    m = M * AMU; Λ = H / sqrt(2π * m * KB * T)
    qTN = (KB * T / p0) / Λ^3; qR = KB * T / (sig * H * C * B)
    x = H * C * nu / (KB * T); qV = 1 / (1 - exp(-x))
    S = R * (log(qTN) + 2.5) + R * (log(qR) + 1) + R * (x / expm1(x) - log(1 - exp(-x))) + R * log(g0)
    @printf("    %-4s  %7.1f  %7.4f   %6.1f    %6.1f\n", n, qR, qV, S, Sref)
end

println("\n(4) Langmuir, M = 1000")
Nf(b) = 1000 * exp(b) / (1 + exp(b))
for bmu in (-2.0, 0.0, 2.0)
    th = exp(bmu) / (1 + exp(bmu))
    @printf("    beta mu = %+.1f: theta = %.4f, kT d<N>/dmu = %.2f, M theta(1-theta) = %.2f\n", bmu, th, (Nf(bmu + h) - Nf(bmu - h)) / (2h), 1000 * th * (1 - th))
end

m = 28.0134 * AMU; Λ = H / sqrt(2π * m * KB * T); n = p0 / (KB * T)
@printf("\n(5) N2: n Lambda^3 = %.3e, mu_trans = %.2f kT = %.1f kJ/mol\n", n * Λ^3, log(n * Λ^3), R * T * log(n * Λ^3) / 1e3)
