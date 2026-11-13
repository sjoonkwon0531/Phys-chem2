# Week 12 - Planck distribution and the Einstein heat capacity
# Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
using Printf
const R = 8.314462618
planck_sum(x) = (s = 0:3999; w = exp.(-s .* x); sum(s .* w) / sum(w))
einstein_cv(T, th) = (x = th / T; 3R * x^2 * exp(x) / expm1(x)^2)
for x in (0.1, 0.5, 1.0, 2.0, 5.0)
    @printf("x = %.1f: sum %.8f formula %.8f\n", x, planck_sum(x), 1 / expm1(x))
end
for T in (10, 30, 60, 120, 240, 600, 2000)
    @printf("T = %5d K: C_V = %7.3f J/mol/K (C_V/3R = %.4f)\n", T, einstein_cv(T, 240), einstein_cv(T, 240) / 3R)
end
