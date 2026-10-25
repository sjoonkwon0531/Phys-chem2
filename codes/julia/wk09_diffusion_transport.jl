# Wk09 — Encounter pairs, diffusion control, and the 1D material balance
# Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
#
# (1) k_r/k_d = k_a/(k_a + k_d')
# (2) k_d = 8RT/(3 eta);  Smoluchowski k_d = 4 pi R* (D_A + D_B) N_A
#     Brownian MC around an absorbing sphere vs. 4 pi c0 (t + 2 sqrt(t/pi))  (R* = D = 1)
# (3) dc/dt = D c'' - v c' - k c, finite differences vs. the analytic pulse
#
# Run:  julia wk09_diffusion_transport.jl
using Printf, Random, LinearAlgebra
Random.seed!(9)
const R, NA = 8.314462618, 6.02214076e23

println("(1) k_r/k_d = k_a/(k_a + k_d')")
for ka in (1e12, 1e10, 1e8)
    @printf("    k_a = %.0e, k_d' = 1e10:  k_r/k_d = %.4f\n", ka, ka / (ka + 1e10))
end

T = 298.15
println("\n(2) k_d = 8RT/(3 eta) at 298.15 K")
for (name, η) in [("hexane", 0.300e-3), ("water", 0.890e-3), ("ethylene glycol", 16.06e-3), ("glycerol", 0.934)]
    @printf("    %-16s eta = %8.3f mPa s   k_d = %.2e dm^3 mol^-1 s^-1\n", name, η * 1e3, 8R * T / (3η) * 1e3)
end
@printf("    Smoluchowski, R* = 0.4 nm, D = 4e-9 m^2/s: k_d = %.3e dm^3 mol^-1 s^-1\n", 4π * 0.4e-9 * 4e-9 * NA * 1e3)

function brownian(; Np=100_000, Rout=8.0, dt=1e-3, nstep=1500)
    X = zeros(3, Np)
    for i in 1:Np
        u = randn(3); u ./= norm(u)
        X[:, i] = u * cbrt(1 + (Rout^3 - 1) * rand())
    end
    c0 = Np / (4 / 3 * π * (Rout^3 - 1))
    alive = trues(Np); cap = 0; sq = sqrt(2dt)
    println("\n    Brownian MC (R* = 1, D = 1)\n      t      MC      theory   MC/theory")
    for st in 1:nstep
        for i in 1:Np
            alive[i] || continue
            ro = sqrt(X[1, i]^2 + X[2, i]^2 + X[3, i]^2)
            X[1, i] += sq * randn(); X[2, i] += sq * randn(); X[3, i] += sq * randn()
            rr = sqrt(X[1, i]^2 + X[2, i]^2 + X[3, i]^2)
            hit = rr < 1 || rand() < exp(-max((ro - 1) * (rr - 1), 0) / dt)   # Brownian-bridge correction
            if hit
                alive[i] = false; cap += 1; continue
            end
            if rr > Rout
                X[:, i] .*= (2Rout - rr) / rr
            end
        end
        if st % 250 == 0
            t = st * dt; th = 4π * c0 * (t + 2sqrt(t / π))
            @printf("    %5.2f   %6d   %8.1f    %6.3f\n", t, cap, th, cap / th)
        end
    end
end
brownian()

# (3) material balance
D, v, k, L, nx = 1e-9, 2e-6, 50.0, 1.2e-4, 1601
x = collect(range(-L / 2, L / 2, length=nx)); dx = x[2] - x[1]; h = 0.2dx^2 / D
pulse(t) = @. exp(-(x - v * t)^2 / (4D * t)) / (2sqrt(π * D * t)) * exp(-k * t)
t0, tend = 1e-3, 0.03
c = pulse(t0); t = t0
while t < tend - 1e-15
    global c, t
    hh = min(h, tend - t)
    cn = copy(c)
    for i in 2:nx-1
        cn[i] = c[i] + hh * (D * (c[i+1] - 2c[i] + c[i-1]) / dx^2 - v * (c[i+1] - c[i-1]) / (2dx) - k * c[i])
    end
    cn[1] = cn[end] = 0.0
    c = cn; t += hh
end
ca = pulse(t)
mass = sum(c) * dx; μ = sum(x .* c) * dx / mass; vr = sum((x .- μ) .^ 2 .* c) * dx / mass
@printf("\n(3) material balance, t = %.0f ms\n", t * 1e3)
@printf("    max |FD - analytic|/peak = %.2e\n", maximum(abs.(c .- ca)) / maximum(ca))
@printf("    amount %.5f  e^-kt = %.5f\n    mean %.4f um  vt = %.4f um\n    var %.4f um^2  2Dt = %.4f um^2\n",
        mass, exp(-k * t), μ * 1e6, v * t * 1e6, vr * 1e12, 2D * t * 1e12)
@printf("    sqrt(D/k) = %.2f um\n", sqrt(D / k) * 1e6)
