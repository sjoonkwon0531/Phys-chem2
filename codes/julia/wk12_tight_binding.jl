# Week 12 - 1D tight-binding band E(k) = eps0 - 2t cos(ka)
# Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
using LinearAlgebra, Printf
N = 12; t = 1.0
H = zeros(N, N)
for n in 1:N
    m = mod(n, N) + 1; H[n, m] = -t; H[m, n] = -t
end
e = sort(eigvals(Symmetric(H))); a = sort([-2t * cos(2pi * p / N) for p in 0:N-1])
@printf("N = %d: max error %.2e, band width %.4f t\n", N, maximum(abs.(e .- a)), e[end] - e[1])
@printf("m*/m_e (t = 1 eV, a = 2.5 A) = %.3f\n", 7.619964 / (2 * 1.0 * 2.5^2))
for f in (0.25, 0.5, 1.0, 1.5, 2.0)
    @printf("f = %.2f: band energy per site %+.4f t\n", f, -(4 / pi) * sin(pi * f / 2))
end
