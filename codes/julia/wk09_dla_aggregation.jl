# Wk09 — Diffusion- and reaction-limited aggregation; Smoluchowski coagulation
# Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
#
# (1) 2D lattice particle-cluster aggregation with sticking probability alpha
#     (alpha = 1: DLA, d_f ~ 1.71; alpha << 1: RLA, denser). d_f from N ~ Rg^d_f.
#     Lecture values 1.45 / 1.55 (2D) refer to cluster-cluster aggregation.
# (2) Smoluchowski, constant kernel: c_s = c0 tau^(s-1)/(1+tau)^(s+1), tau = k c0 t/2
#
# Run:  julia wk09_dla_aggregation.jl
using Printf, Random
Random.seed!(9)

function grow(Npart, α; L=801)
    c = L ÷ 2 + 1
    G = falses(L, L); G[c, c] = true
    rmax = 1.0; sum2 = 0.0; lnN = Float64[]; lnR = Float64[]
    DX = (1, -1, 0, 0); DY = (0, 0, 1, -1)
    for n in 2:Npart
        stuck = false
        while !stuck
            θ = 2π * rand()
            x = round(Int, (rmax + 5) * cos(θ)); y = round(Int, (rmax + 5) * sin(θ))
            while true
                d = rand(1:4)
                G[c+x+DX[d], c+y+DY[d]] && continue          # cannot step onto the cluster
                x += DX[d]; y += DY[d]
                r2 = x^2 + y^2
                r2 > (2rmax + 20)^2 && break
                r2 > (rmax + 3)^2 && continue
                if (G[c+x+1, c+y] || G[c+x-1, c+y] || G[c+x, c+y+1] || G[c+x, c+y-1]) && rand() < α
                    G[c+x, c+y] = true; sum2 += r2; rmax = max(rmax, sqrt(r2)); stuck = true
                    if n >= 200
                        push!(lnN, log(n)); push!(lnR, 0.5log(sum2 / n))
                    end
                    break
                end
            end
        end
    end
    mx, my = sum(lnR) / length(lnR), sum(lnN) / length(lnN)
    df = sum((lnR .- mx) .* (lnN .- my)) / sum((lnR .- mx) .^ 2)
    return sqrt(sum2 / Npart), df
end

println("(1) 2D lattice particle-cluster aggregation")
for N in (2500, 10000), α in (1.0, 0.1)
    Rg, df = grow(N, α)
    @printf("    alpha = %4.2f, N = %5d:  Rg = %6.1f,  d_f = %.2f\n", α, N, Rg, df)
end
println("    reference: Witten-Sander DLA d_f = 1.71 (2D); larger N lands within scatter of it\n")

function smol!(out, y, k)
    Smax = length(y); tot = sum(y)
    for s in 1:Smax
        a = 0.0
        for i in 1:s-1
            a += y[i] * y[s-i]
        end
        out[s] = 0.5k * a - k * y[s] * tot
    end
    out
end
k, c0, Smax, dt, tend = 1.0, 1.0, 400, 1e-3, 10.0
c = zeros(Smax); c[1] = c0
k1, k2, k3, k4 = (zeros(Smax) for _ in 1:4)
for _ in 1:round(Int, tend / dt)
    smol!(k1, c, k); smol!(k2, c .+ dt / 2 .* k1, k); smol!(k3, c .+ dt / 2 .* k2, k); smol!(k4, c .+ dt .* k3, k)
    c .+= dt / 6 .* (k1 .+ 2k2 .+ 2k3 .+ k4)
end
τ = k * c0 * tend / 2; s = 1:Smax
@printf("(2) Smoluchowski, constant kernel, tau = %.1f\n", τ)
@printf("    clusters %.6f (exact %.6f)   mass %.6f   <S> %.4f (exact %.4f)\n",
        sum(c), c0 / (1 + τ), sum(s .* c), sum(s .* c) / sum(c), 1 + τ)
for si in (1, 2, 5, 10)
    @printf("    c_%-2d numeric %.6e   exact %.6e\n", si, c[si], c0 * τ^(si - 1) / (1 + τ)^(si + 1))
end
