# Wk06 - Chemical kinetics I: rate laws, initial rates, integrated rate laws
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
using Plots, Printf, Statistics

linfit(x, y) = (s = cov(x, y) / var(x); (s, mean(y) - s * mean(x)))

# (1) 2 N2O5 -> 4 NO2 + O2: P = (1 + 3 alpha/2) P0
for al in (0.0, 0.25, 0.5, 1.0)
    @printf("alpha = %.2f: P/P0 = %.3f\n", al, 1 + 1.5al)
end

# (2) method of initial rates: 2 I + Ar -> I2 + Ar
I0 = [1.0, 2.0, 4.0, 6.0] .* 1e-5; Ar = [1e-3, 5e-3, 1e-2]
v0 = [8.70e-4 3.48e-3 1.39e-2 3.13e-2;
      4.35e-3 1.74e-2 6.96e-2 1.57e-1;
      8.69e-3 3.47e-2 1.38e-1 3.13e-1]
lk = zeros(3)
for j in 1:3
    a, lk[j] = linfit(log10.(I0), log10.(v0[j, :]))
    @printf("[Ar] = %4.1f mM: slope a = %.3f, log k' = %.3f\n", Ar[j] * 1e3, a, lk[j])
end
b, _ = linfit(log10.(Ar), lk)
kall = v0 ./ (I0' .^ 2 .* Ar)
@printf("order in Ar b = %.3f; k = %.2e dm^6 mol^-2 s^-1 (12-point mean)\n", b, mean(kall))

# (3) successive half-lives
hl(order, k, A) = order == 0 ? A / (2k) : order == 1 ? log(2) / k : 1 / (k * A)
for n in 0:2
    @printf("order %d half-lives: %.3f, %.3f, %.3f\n", n, hl(n, 1, 1.0), hl(n, 1, 0.5), hl(n, 1, 0.25))
end

# (4) azomethane at 600 K
t = [0.0, 1000, 2000, 3000, 4000]; pr = [10.9, 7.63, 5.32, 3.71, 2.59]
s, _ = linfit(t, log.(pr ./ pr[1])); k1 = -s
@printf("azomethane: k = %.2e s^-1, t1/2 = %.0f s, tau = %.0f s\n", k1, log(2) / k1, 1 / k1)

# (5) A + B -> P, unequal concentrations: RK4 vs integrated form
kr, A0, B0, dt = 2.0, 1.0, 1.5, 1e-3
f(y) = -kr * y[1] * y[2] .* [1.0, 1.0]
y = [A0, B0]
for _ in 1:1000
    k1_ = f(y); k2_ = f(y .+ dt / 2 .* k1_); k3_ = f(y .+ dt / 2 .* k2_); k4_ = f(y .+ dt .* k3_)
    global y = y .+ dt .* (k1_ .+ 2k2_ .+ 2k3_ .+ k4_) ./ 6
end
@printf("A + B -> P: ln ratio = %.6f, (B0-A0) k t = %.6f\n", log((y[2] / B0) / (y[1] / A0)), (B0 - A0) * kr)

p1 = plot(I0, v0', xscale=:log10, yscale=:log10, marker=:o, xlabel="[I]0", ylabel="v0",
          label=["1 mM" "5 mM" "10 mM"], title="initial rates: slope 2")
p2 = scatter(t, log.(pr ./ pr[1]), xlabel="t [s]", ylabel="ln(p/p0)", label="data",
             title="azomethane: slope = -k")
plot!(p2, t, s .* t, label="fit")
display(plot(p1, p2, layout=(1, 2), size=(1000, 400))); readline()
