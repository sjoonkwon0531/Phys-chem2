# Week 3 - Creation & Annihilation Operators (number-basis matrices)
# Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
# a|n> = sqrt(n)|n-1>, a'|n> = sqrt(n+1)|n+1>, [a,a'] = 1, H = a'a + 1/2
using LinearAlgebra, Printf

N = 30
a = diagm(1 => sqrt.(1.0:N-1))     # annihilation
ad = collect(a')                   # creation

# [a, a'] = 1 (exact except truncation corner)
comm = a * ad - ad * a
bulk = comm[1:N-1, 1:N-1] - I
@printf("[a,a'] = 1: max bulk error = %.2e, corner = %+.1f\n", maximum(abs.(bulk)), comm[N, N])

# Hamiltonian eigenvalues (n + 1/2)
H = ad * a + 0.5 * Matrix{Float64}(I, N, N)
ev = sort(eigvals(Symmetric(H)))
println("First 6 eigenvalues of H/hbar*omega: ", round.(ev[1:6]; digits = 6))

# X, P and [X,P] = i
X = (a + ad) / sqrt(2)
P = im .* (ad - a) / sqrt(2)
commXP = X * P - P * X
@printf("Im<0|[X,P]|0> = %.6f (expect 1)\n", imag(commXP[1, 1]))

# Matrix elements <n-1|a|n> = sqrt(n)
println("<n-1|a|n> for n=1..5: ", [round(a[n, n + 1]; digits = 4) for n in 1:5])

# Uncertainty product in |n>: sigma_x sigma_p = (n + 1/2) hbar
for n in (0, 1, 4)
    v = zeros(N); v[n + 1] = 1.0
    sx = sqrt(v' * (X * X) * v - (v' * X * v)^2)
    sp = sqrt(real(v' * (P * P) * v - (v' * P * v)^2))
    @printf("n=%d: sigma_x*sigma_p = %.5f hbar (expect %.1f)\n", n, real(sx * sp), n + 0.5)
end
