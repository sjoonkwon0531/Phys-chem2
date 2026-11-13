# Week 12 - Debye model: k-point counting and the T^3 law
# Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
using Printf
const R = 8.314462618
function debye_cv(T, th; n=4000)
    xD = th / T; x = ((1:n) .- 0.5) .* xD ./ n
    9R * (T / th)^3 * sum(@. x^4 * exp(x) / expm1(x)^2) * xD / n
end
function debye_u(T, th; n=4000)
    xD = th / T; x = ((1:n) .- 0.5) .* xD ./ n
    9R * T * (T / th)^3 * sum(@. x^3 / expm1(x)) * xD / n
end
for M in (5, 10, 20, 40)
    c = count(i^2 + j^2 + k^2 <= M^2 for i in -M:M, j in -M:M, k in -M:M)
    @printf("M = %2d: points %d, (4/3)pi M^3 = %.1f\n", M, c, 4 / 3 * pi * M^3)
end
A = 12pi^4 / 5 * R; th = 343.0
@printf("T^3 coefficient = %.1f J/mol/K\n", A)
for T in (5, 10, 20, 40, 100, 200, 300, 1000)
    @printf("T = %5d K: C_V = %8.4f, T^3 law %10.4f\n", T, debye_cv(T, th), A * (T / th)^3)
end
dU = debye_u(300.0, th) - debye_u(77.0, th)
@printf("Cu 300->77 K: Debye %.1f kJ/kg, Dulong-Petit %.1f kJ/kg\n", dU / 63.546e-3 / 1e3, 3R * 223 / 63.546e-3 / 1e3)
