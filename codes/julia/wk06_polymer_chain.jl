# Wk06 - Macromolecules: molar-mass averages, random coils, entropic elasticity
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
# Mn, Mw, Mz, D; freely jointed chain <R^2> = N l^2, Rg^2 = N l^2/6;
# tetrahedral chain F^2 = 2; F = (kT/2l) ln[(1+nu)/(1-nu)].
using Plots, Printf, Random, LinearAlgebra

Random.seed!(6)
const KB = 1.380649e-23

# (1) molar-mass averages
averages(Ni, Mi) = (sum(Ni .* Mi) / sum(Ni), sum(Ni .* Mi .^ 2) / sum(Ni .* Mi),
                    sum(Ni .* Mi .^ 3) / sum(Ni .* Mi .^ 2))
Mn, Mw, Mz = averages([1.0, 1.0], [10.0, 100.0])
@printf("blend (equal numbers of 10 & 100 kg/mol): Mn = %.1f, Mw = %.1f, Mz = %.1f, D = %.3f\n",
        Mn, Mw, Mz, Mw / Mn)
println("Schulz-Flory, M0 = 100 g/mol:\n   p      Mn       Mw       Mz      D    1+p")
i = 1:200000
for p in (0.90, 0.99, 0.999)
    a, b, c = averages((1 - p) .* p .^ (i .- 1), 100.0 .* i)
    @printf("  %.3f  %7.0f  %7.0f  %7.0f  %.3f  %.3f\n", p, a, b, c, b / a, 1 + p)
end

# (2) freely jointed chain Monte Carlo
function fjc(N, M, dim)
    R2 = 0.0; Rg2 = 0.0
    r = zeros(N + 1, dim)
    for _ in 1:M
        for k in 1:N
            b = dim == 1 ? [rand(Bool) ? 1.0 : -1.0] : normalize(randn(3))
            r[k+1, :] .= r[k, :] .+ b
        end
        R2 += sum(abs2, r[end, :])
        rc = sum(r, dims=1) ./ (N + 1)
        Rg2 += sum(abs2, r .- rc) / (N + 1)
    end
    R2 / M, Rg2 / M
end
N = 100
for dim in (3, 1)
    R2, Rg2 = fjc(N, 20000, dim)
    @printf("%dD FJC: <R^2> = %.2f (N l^2 = %d), Rg^2 = %.2f (N l^2/6 = %.2f)\n",
            dim, R2, N, Rg2, N / 6)
end
S = sum(abs(a - b) for a in 0:N-1, b in 0:N-1)
@printf("direct sum: Rg^2 = %.4f = (l^2/6)(N - 1/N) = %.4f\n", S / (2N^2), (N - 1 / N) / 6)
for n in (0, 10, 20, 30)
    @printf("  n = %2d: exact %.5f, Gaussian %.5f\n", n,
            Float64(binomial(big(N), (N + n) ÷ 2) / big(2)^N), sqrt(2 / (π * N)) * exp(-n^2 / (2N)))
end

# (3) fixed bond angle (freely rotating chain), cos(gamma) = 1/3
function frc(N, M, c)
    s = sqrt(1 - c^2); acc = 0.0
    for _ in 1:M
        b = normalize(randn(3)); R = copy(b)
        for _ in 1:N-1
            t = randn(3); u = normalize(t .- dot(t, b) .* b)
            b = c .* b .+ s .* u; R .+= b
        end
        acc += sum(abs2, R)
    end
    acc / M
end
@printf("tetrahedral chain: <R^2>/(N l^2) = %.3f (F^2 = 2)\n", frc(200, 20000, 1 / 3) / 200)
@printf("polyethylene N = 4000, l = 0.154 nm: contour %.0f nm, R_rms = %.1f nm, Rg = %.2f nm\n",
        4000 * 0.154, sqrt(8000) * 0.154, sqrt(4000 / 3) * 0.154)

# (4) entropy and restoring force
l, T = 0.5e-9, 298.15
for x in (0.1, 0.5, 0.9)
    @printf("nu = %.1f: F = %.2f pN (Hooke %.2f pN)\n", x,
            KB * T / (2l) * log((1 + x) / (1 - x)) * 1e12, x * KB * T / l * 1e12)
end
ν = range(-0.95, 0.95, length=381)
p1 = plot(ν, -0.5 .* log.((1 .+ ν) .^ (1 .+ ν) .* (1 .- ν) .^ (1 .- ν)), xlabel="ν = n/N",
          ylabel="ΔS / Nk", title="conformational entropy", legend=false)
p2 = plot(ν, 0.5 .* log.((1 .+ ν) ./ (1 .- ν)), label="exact", xlabel="ν = n/N",
          ylabel="F l / kT", ylims=(-2.2, 2.2), title="entropic force")
plot!(p2, ν, ν, ls=:dash, label="Hooke")
display(plot(p1, p2, layout=(1, 2), size=(1000, 400))); readline()
