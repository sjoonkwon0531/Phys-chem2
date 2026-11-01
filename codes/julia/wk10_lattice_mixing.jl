# Wk10 — Lattice (regular-solution) model of a binary mixture A/B
# Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
#
# (1) dF/(NkT) = chi phi(1-phi) + phi ln phi + (1-phi) ln(1-phi)
#     spinodal chi_s = 1/(2 phi(1-phi)); binodal ln(phi/(1-phi)) = chi(2phi-1); chi_c = 2
# (2) Kawasaki Monte Carlo (z = 4): unlike-pair cost = kappa/z = chi kT/4.
#     Exact 2D critical point chi_c = 2z/2.269 = 3.53, not the mean-field 2.
#
# Run:  julia wk10_lattice_mixing.jl
using Printf, Random
Random.seed!(10)

function binodal(chi)
    a, b = 1e-12, 0.5 - 1e-9
    g(p) = log(p / (1 - p)) - chi * (2p - 1)
    for _ in 1:200
        m = (a + b) / 2
        g(a) * g(m) <= 0 ? (b = m) : (a = m)
    end
    (a + b) / 2
end
println("(1) mean-field phase boundaries\n     chi    T/Tc    binodal    spinodal")
for chi in (2.2, 2.5, 3.0, 3.5, 4.0)
    @printf("    %4.1f   %5.3f    %.4f     %.4f\n", chi, 2 / chi, binodal(chi), 0.5 * (1 - sqrt(1 - 2 / chi)))
end

function kawasaki(chi; L=64, sweeps=2000)
    s = [rand() < 0.5 ? 1 : -1 for _ in 1:L, _ in 1:L]
    w(i) = mod1(i, L)
    dirs = ((1, 0), (-1, 0), (0, 1), (0, -1))
    unl(i, j, v) = count(d -> s[w(i + d[1]), w(j + d[2])] != v, dirs)
    de = chi / 4
    for _ in 1:sweeps*L*L
        i, j = rand(1:L), rand(1:L); d = dirs[rand(1:4)]; k, l = w(i + d[1]), w(j + d[2])
        v1, v2 = s[i, j], s[k, l]
        v1 == v2 && continue
        before = unl(i, j, v1) + unl(k, l, v2)
        s[i, j], s[k, l] = v2, v1
        after = unl(i, j, v2) + unl(k, l, v1)
        dE = (after - before) * de
        if dE > 0 && rand() >= exp(-dE)
            s[i, j], s[k, l] = v1, v2
        end
    end
    (count(s .!= circshift(s, (1, 0))) + count(s .!= circshift(s, (0, 1)))) / (2L * L)
end
println("\n(2) Kawasaki MC, 64x64, phi = 0.5\n     chi    unlike-bond fraction (random = 0.5)")
for chi in (1.0, 2.5, 3.5, 4.5, 6.0)
    @printf("    %4.1f        %.3f\n", chi, kawasaki(chi))
end
