# Wk04 - Spin-1/2: Pauli algebra, sequential measurement, unitarity
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
# hbar = 1. [Sx,Sy] = i Sz; Stern-Gerlach chain; unitary basis change.
using LinearAlgebra, Random, Printf

const ħ = 1.0
sx = ComplexF64[0 1; 1 0]; sy = ComplexF64[0 -im; im 0]; sz = ComplexF64[1 0; 0 -1]
Sx, Sy, Sz = ħ/2 * sx, ħ/2 * sy, ħ/2 * sz
S2 = Sx^2 + Sy^2 + Sz^2

comm(A, B) = A * B - B * A
@printf("||[Sx,Sy]-i hbar Sz|| = %.2e\n", maximum(abs.(comm(Sx, Sy) - im * ħ * Sz)))
@printf("||[S^2,Sx]||          = %.2e\n", maximum(abs.(comm(S2, Sx))))
println("S^2 = 3/4 I ? ", S2 ≈ 0.75 * ħ^2 * I)
println("eig(Sx) = ", round.(eigvals(Hermitian(Sx)), digits=4), "\n")

# sequential Stern-Gerlach Monte Carlo
Random.seed!(42)
N = 100_000
up_z = ComplexF64[1, 0]; up_x = ComplexF64[1, 1] / sqrt(2); dn_x = ComplexF64[1, -1] / sqrt(2)
p1 = abs2(dot(up_x, up_z))
got_x = rand(N) .< p1
p2 = abs2(dot(up_z, up_x))
got_z = rand(count(got_x)) .< p2
@printf("P(Sx=+h/2 | up_z): theory 0.5, MC %.4f\n", sum(got_x) / N)
@printf("P(Sz=+h/2 | up_x): theory 0.5, MC %.4f\n", sum(got_z) / count(got_x))
println("-> measuring Sx erased the known Sz value (incompatible observables)\n")

# unitary basis change
U = [up_x dn_x]
println("U'U = I ? ", U' * U ≈ I)
println("[Sy]' = U^-1 Sy U = ", round.(U' * Sy * U, digits=4))
f = ComplexF64[0.6, 0.8im]; g = ComplexF64[1, -1] / sqrt(2)
@printf("<f|g> before %s after %s (conserved)\n\n",
        string(round(dot(f, g), digits=6)), string(round(dot(U * f, U * g), digits=6)))

# Zeeman splitting
const μB = 5.7883818060e-5; const ge = 2.0023
for B in (0.5, 1.0, 5.0)
    dE = ge * μB * B
    @printf("B = %.1f T: splitting %.3e eV (ESR %.1f GHz)\n", B, dE, dE / 4.135667696e-15 / 1e9)
end
