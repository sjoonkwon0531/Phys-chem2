# Week 11 - 1D monatomic and diatomic chains: dispersion and phonon heat capacity
# Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
using LinearAlgebra, Printf

function chain_matrix(m, s)
    n = length(m); D = zeros(n, n)
    for i in 1:n
        j = mod(i, n) + 1
        D[i, i] += s[i]; D[j, j] += s[i]; D[i, j] -= s[i]; D[j, i] -= s[i]
    end
    D ./ sqrt.(m * m')
end
function omega_di(k, m1, m2, k1, k2)
    S = k1 + k2; inv = 1 / m1 + 1 / m2
    root = sqrt(max(S^2 * inv^2 - 16k1 * k2 * sin(k / 2)^2 / (m1 * m2), 0))
    sqrt(max(0.5(S * inv - root), 0)), sqrt(0.5(S * inv + root))
end

N = 40; m1, m2, k1, k2 = 1.0, 2.0, 1.0, 1.0
masses = repeat([m1, m2], N); springs = repeat([k1, k2], N)
wn = sort(sqrt.(abs.(eigvals(Symmetric(chain_matrix(masses, springs))))))
wa = sort(vcat([collect(omega_di(2pi * p / N, m1, m2, k1, k2)) for p in 0:N-1]...))
@printf("Diatomic, %d cells: %d modes, max error = %.2e\n", N, length(wn), maximum(abs.(wn .- wa)))
a, o = omega_di(pi, m1, m2, k1, k2)
@printf("Zone boundary: acoustic %.4f, optical %.4f, gap %.4f\n", a, o, o - a)
Nb = 2000; w = [2abs(sin(pi * p / Nb)) for p in 1:Nb-1]
for T in (0.05, 0.2, 0.5, 1.0, 2.0, 5.0)
    x = w ./ T
    @printf("  T = %4.2f: C/Nk = %.4f\n", T, sum(@. x^2 * exp(x) / expm1(x)^2) / length(x))
end
c = 2.99792458e10; amu = 1.66053906660e-27; wSi = 2pi * c * 520.2; mSi = 28.0855amu
@printf("Si effective spring = %.0f N/m\n", mSi * wSi^2 / 4)
