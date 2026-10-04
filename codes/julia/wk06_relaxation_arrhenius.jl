# Wk06 - Chemical kinetics II: approach to equilibrium, relaxation, Arrhenius
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
using Plots, Printf, Statistics

const R = 8.314462618

# (1) A <-> B: RK4 vs closed form
kf, kb, A0, dt, n = 2.0, 0.5, 1.0, 1e-3, 3000
f(a) = -kf * a + kb * (A0 - a)
traj = zeros(n + 1); traj[1] = A0
for s in 1:n
    a = traj[s]
    k1 = f(a); k2 = f(a + dt / 2 * k1); k3 = f(a + dt / 2 * k2); k4 = f(a + dt * k3)
    traj[s+1] = a + dt * (k1 + 2k2 + 2k3 + k4) / 6
end
tt = (0:n) .* dt
ex = @. A0 * (kb + kf * exp(-(kf + kb) * tt)) / (kf + kb)
Aeq = kb * A0 / (kf + kb)
@printf("max |RK4 - exact| = %.2e; K = %.3f = k/k' = %.3f; tau = %.3f\n",
        maximum(abs.(traj .- ex)), (A0 - Aeq) / Aeq, kf / kb, 1 / (kf + kb))

# (2) temperature jump: water autoprotolysis
Kw, τ = 1.008e-14, 37e-6
K = Kw / 55.6
krev = (1 / τ) / (K + 2sqrt(Kw)); kfwd = K * krev
@printf("T-jump: k' = %.2e dm^3/mol/s, k = %.2e 1/s (one event per %.0f h)\n",
        krev, kfwd, 1 / kfwd / 3600)

# (3) Arrhenius fit (acetaldehyde decomposition, textbook data)
T = [700.0, 730, 760, 790, 810, 840, 910, 1000]
k = [0.011, 0.035, 0.105, 0.343, 0.789, 2.17, 20.0, 145.0]
x, y = 1 ./ T, log.(k)
slope = cov(x, y) / var(x); icpt = mean(y) - slope * mean(x)
@printf("Arrhenius: Ea = %.0f kJ/mol, A = %.2e dm^3/mol/s\n", -slope * R / 1e3, exp(icpt))
@printf("doubling per 10 K at 298 K <-> Ea = %.1f kJ/mol\n", log(2) * R / (1 / 298 - 1 / 308) / 1e3)

# (4) catalysis
for dEa in (5e3, 19e3, 40e3)
    @printf("dEa = %2.0f kJ/mol -> rate x %.3g\n", dEa / 1e3, exp(dEa / (R * 298)))
end

p1 = plot(tt, traj, label="[A]", xlabel="t", title="A <-> B")
plot!(p1, tt, A0 .- traj, label="[B]"); hline!(p1, [Aeq], ls=:dot, c=:gray, label=false)
p2 = scatter(1e3 ./ T, y, label="data", xlabel="1000/T", ylabel="ln k", title="Arrhenius plot")
plot!(p2, 1e3 ./ T, slope .* x .+ icpt, label="fit")
display(plot(p1, p2, layout=(1, 2), size=(1000, 400))); readline()
