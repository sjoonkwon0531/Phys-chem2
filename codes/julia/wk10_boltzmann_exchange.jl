# Wk10 — Where the Boltzmann distribution comes from
# Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
#
# (1) Stirling: ln N! ~ N ln N - N
# (2) Einstein solid: P(n) = C(Q-n+N-2, N-2)/C(Q+N-1, N-1) -> (1-x) x^n, x = Q/(Q+N)
# (3) Energy-exchange game relaxes to exp(-beta eps)
# (4) beta = d ln W / dE
#
# Run:  julia wk10_boltzmann_exchange.jl      (needs SpecialFunctions: ] add SpecialFunctions)
using Printf, Random, SpecialFunctions
Random.seed!(10)
lnC(n, k) = loggamma(n + 1) - loggamma(k + 1) - loggamma(n - k + 1)

println("(1) Stirling: ln N!  vs  N ln N - N")
for N in (10.0, 100.0, 1000.0, 1e6)
    ex = loggamma(N + 1); ap = N * log(N) - N
    @printf("  %10.0f   %16.4f   %16.4f   rel. error %9.2e\n", N, ex, ap, (ex - ap) / ex)
end

println("\n(2) Einstein solid, <n> = 1 -> Boltzmann x = 1/2\n     n   N=10      N=100     N=1000    Boltzmann")
for n in 0:6
    @printf("    %2d", n)
    for N in (10.0, 100.0, 1000.0)
        Q = N; @printf("   %.5f", exp(lnC(Q - n + N - 2, N - 2) - lnC(Q + N - 1, N - 1)))
    end
    @printf("   %.5f\n", 0.5 * 0.5^n)
end

function exchange(N, q0, sweeps)
    e = fill(q0, N); hist = zeros(15)
    for s in 1:sweeps
        for _ in 1:N
            i, j = rand(1:N), rand(1:N)
            if i != j && e[i] > 0
                e[i] -= 1; e[j] += 1
            end
        end
        if s > sweeps ÷ 2
            for v in e
                v < 15 && (hist[v+1] += 1)
            end
        end
    end
    hist ./ (N * (sweeps - sweeps ÷ 2))
end
N, q0 = 2000, 2
hist = exchange(N, q0, 400); x = q0 / (q0 + 1)
@printf("\n(3) exchange game: N = %d, start n = %d\n     n   simulation   Boltzmann\n", N, q0)
for k in 0:7
    @printf("    %2d    %.4f       %.4f\n", k, hist[k+1], (1 - x) * x^k)
end
ks = collect(0:9); ys = log.(hist[1:10])
mk, my = sum(ks) / 10, sum(ys) / 10
slope = sum((ks .- mk) .* (ys .- my)) / sum((ks .- mk) .^ 2)
@printf("    fitted beta*eps = %.3f   exact ln((q0+1)/q0) = %.3f\n", -slope, log((q0 + 1) / q0))

for Q in (500.0, 1000.0, 2000.0)
    Nn = 1000.0; d = lnC(Q + 1 + Nn - 1, Nn - 1) - lnC(Q + Nn - 1, Nn - 1)
    @printf("(4) N = 1000, Q = %.0f: d lnW/dQ = %.4f   ln((Q+N)/Q) = %.4f\n", Q, d, log((Q + Nn) / Q))
end
