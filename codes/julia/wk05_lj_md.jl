# Wk05 - 2D Lennard-Jones MD: gas vs liquid & the RDF
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
# Velocity Verlet, reduced units, periodic box. Cooling condenses the gas.
using Plots, Printf, Random

Random.seed!(7)
const N = 100; const L = 12.0; const RC2 = 9.0; const DT = 0.004

function forces(pos)
    F = zeros(N, 2); pot = 0.0
    @inbounds for i in 1:N-1, j in i+1:N
        dx = pos[i, 1] - pos[j, 1]; dy = pos[i, 2] - pos[j, 2]
        dx -= L * round(dx / L); dy -= L * round(dy / L)
        r2 = dx^2 + dy^2
        r2 > RC2 && continue
        inv2 = 1 / r2; inv6 = inv2^3
        f = 24 * inv2 * inv6 * (2inv6 - 1)
        F[i, 1] += f * dx; F[i, 2] += f * dy
        F[j, 1] -= f * dx; F[j, 2] -= f * dy
        pot += 4 * (inv6^2 - inv6)
    end
    F, pot
end

function runmd(Tt; neq=1500, nprod=1500)
    side = ceil(Int, sqrt(N))
    pos = [((i - 1) % side + 0.5) * L / side for i in 1:N, _ in 1:1]
    pos = hcat([(mod(i - 1, side) + 0.5) * L / side for i in 1:N],
               [(div(i - 1, side) + 0.5) * L / side for i in 1:N])
    vel = sqrt(Tt) .* randn(N, 2); vel .-= sum(vel, dims=1) ./ N
    F, _ = forces(pos)
    for s in 1:neq+nprod
        vel .+= 0.5DT .* F
        pos .= mod.(pos .+ DT .* vel, L)
        F, _ = forces(pos)
        vel .+= 0.5DT .* F
        ke = 0.5 * sum(abs2, vel)
        s <= neq && (vel .*= sqrt(1 + 0.02 * (Tt * N / ke - 1)))
    end
    pos
end

function rdf(pos; nbins=60, rmax=5.0)
    h = zeros(nbins); dr = rmax / nbins
    for i in 1:N-1, j in i+1:N
        dx = pos[i, 1] - pos[j, 1]; dy = pos[i, 2] - pos[j, 2]
        dx -= L * round(dx / L); dy -= L * round(dy / L)
        r = sqrt(dx^2 + dy^2)
        r < rmax && (h[clamp(ceil(Int, r / dr), 1, nbins)] += 1)
    end
    rc = [(k - 0.5) * dr for k in 1:nbins]
    ideal = 2π .* rc .* dr .* (N * (N - 1) / 2) ./ L^2 .* 2
    rc, h ./ ideal
end

plt = plot(layout=(1, 3), size=(1300, 400))
for (k, (Tt, lb)) in enumerate(((1.5, "hot gas T*=1.5"), (0.45, "cold liquid T*=0.45")))
    pos = runmd(Tt)
    rr, g = rdf(pos)
    @printf("%s: RDF peak at r* = %.2f (2^(1/6) = 1.12)\n", lb, rr[argmax(g)])
    scatter!(plt[k], pos[:, 1], pos[:, 2], ms=3, legend=false,
             xlims=(0, L), ylims=(0, L), aspect_ratio=1, title=lb)
    plot!(plt[3], rr, g, label=lb, lw=1.5)
end
hline!(plt[3], [1.0], ls=:dash, c=:gray, label=false)
vline!(plt[3], [2^(1 / 6)], ls=:dot, c=:black, label=false)
plot!(plt[3], xlabel="r/σ", ylabel="g(r)", title="RDF")
display(plt); readline()
