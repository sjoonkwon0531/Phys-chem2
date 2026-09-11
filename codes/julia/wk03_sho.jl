# Week 3 - Quantum Harmonic Oscillator (Hermite polynomials)
# Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
# psi_n(y) = (1/pi)^(1/4)/sqrt(2^n n!) H_n(y) exp(-y^2/2), E_n = (n+1/2) hbar*w
using Printf

"Physicists' Hermite polynomial via H_{n+1} = 2y H_n - 2n H_{n-1}"
function hermiteH(n::Int, y)
    n == 0 && return one.(y)
    n == 1 && return 2 .* y
    Hm, Hc = one.(y), 2 .* y
    for k in 1:n-1
        Hm, Hc = Hc, 2 .* y .* Hc .- 2k .* Hm
    end
    return Hc
end

"Normalized SHO eigenfunction (hbar = m = omega = 1)"
psiSHO(n, y) = 1 / sqrt(2.0^n * factorial(big(n))) * (1 / pi)^0.25 .* hermiteH(n, y) .* exp.(-y .^ 2 ./ 2)

trapz(x, f) = sum((f[1:end-1] .+ f[2:end]) .* diff(x)) / 2

y = range(-12, 12; length = 240001) |> collect

# 1) Hermite orthogonality
println("Hermite orthogonality (normalized):")
for m in 0:3
    row = [trapz(y, exp.(-y .^ 2) .* hermiteH(m, y) .* hermiteH(n, y)) /
           (2.0^n * factorial(n) * sqrt(pi)) for n in 0:3]
    @printf("  %+.6f %+.6f %+.6f %+.6f\n", row...)
end

# 2) Normalization & virial theorem
for n in (0, 1, 5, 10)
    @printf("<psi_%d|psi_%d> = %.6f\n", n, n, trapz(y, psiSHO(n, y) .^ 2))
end
for n in (0, 3)
    V = trapz(y, 0.5 .* y .^ 2 .* psiSHO(n, y) .^ 2)
    @printf("n=%d: <V> = %.5f (E_n/2 = %.5f)\n", n, V, (n + 0.5) / 2)
end

# 3) Classically forbidden probability beyond y_tp = sqrt(2n+1)
for n in (0, 1, 5)
    ytp = sqrt(2n + 1)
    Pout = trapz(y, (abs.(y) .> ytp) .* psiSHO(n, y) .^ 2)
    @printf("n=%d: y_tp = %.4f, P(forbidden) = %.4f\n", n, ytp, Pout)
end
