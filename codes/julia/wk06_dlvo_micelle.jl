# Wk06 - Colloid stability (DLVO) and micelle formation
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
using Plots, Printf

const E = 1.602176634e-19; const KB = 1.380649e-23; const NA = 6.02214076e23
const EPS = 78.5 * 8.8541878128e-12; const KT = KB * 298.15
kappa(c, z=1) = sqrt(2 * z^2 * E^2 * 1000 * NA * c / (EPS * KT))

println("1:1 salt    kappa^-1 [nm]   0.304/sqrt(c)")
for c in (1e-3, 1e-2, 0.1, 0.15, 0.6)
    @printf("  %.3f M   %8.3f      %8.3f\n", c, 1e9 / kappa(c), 0.304 / sqrt(c))
end

function dlvo(h, c; a=100e-9, AH=2e-20, phi0=0.030, z=1)
    k = kappa(c, z); g = tanh(z * E * phi0 / (4KT))
    (-AH * a / (12h) + 64π * KT * 1000 * NA * c * a * g^2 / k^2 * exp(-k * h)) / KT
end
h = 10 .^ range(log10(0.1e-9), log10(100e-9), length=6000)
println("\na = 100 nm, A_H = 2e-20 J, phi0 = 30 mV:\n  c [M]   barrier/kT   h [nm]")
for c in (1e-3, 1e-2, 3e-2, 0.1, 0.6)
    U = dlvo.(h, c); j = argmax(U)
    if U[j] <= 0
        @printf("  %.3f   no barrier -> rapid coagulation\n", c)
    else
        @printf("  %.3f   %8.1f    %6.2f\n", c, U[j], h[j] * 1e9)
    end
end

# critical coagulation concentration (kappa h = 1 where the barrier vanishes)
function ccc(z; phi0=0.030, AH=2e-20, gamma=nothing)
    g = gamma === nothing ? tanh(z * E * phi0 / (4KT)) : gamma
    kc = 384π * EPS * KT^2 * g^2 / (exp(1) * z^2 * E^2 * AH)
    kc^2 * EPS * KT / (2 * z^2 * E^2) / (1000 * NA)
end
@printf("\nccc at phi0 = 30 mV: z=1 %.1f mM, z=2 %.1f mM, z=3 %.2f mM\n",
        ccc(1) * 1e3, ccc(2) * 1e3, ccc(3) * 1e3)
@printf("high-potential limit: 1 : 1/%.0f : 1/%.0f (Schulze-Hardy z^-6)\n",
        ccc(1, gamma=1.0) / ccc(2, gamma=1.0), ccc(1, gamma=1.0) / ccc(3, gamma=1.0))

# micelles: closed association, c = m + N K m^N (K = 1)
function monomer(ct, N)
    lo, hi = 0.0, ct
    for _ in 1:200
        mid = (lo + hi) / 2
        mid + N * mid^N > ct ? (hi = mid) : (lo = mid)
    end
    (lo + hi) / 2
end
println("\nfraction micellised:  c_tot    N=3     N=30    N=100")
for ct in (0.5, 0.9, 1.0, 1.5, 3.0, 10.0)
    @printf("                      %5.2f   %.3f   %.3f   %.3f\n", ct,
            1 - monomer(ct, 3) / ct, 1 - monomer(ct, 30) / ct, 1 - monomer(ct, 100) / ct)
end

p1 = plot(xscale=:log10, ylims=(-40, 60), xlabel="gap h [nm]", ylabel="U / kT",
          title="DLVO: salt lowers the barrier")
for c in (1e-3, 1e-2, 3e-2, 0.1)
    plot!(p1, h .* 1e9, dlvo.(h, c), label="$(c*1e3) mM", lw=1.5)
end
hline!(p1, [0.0], c=:gray, label=false)
ct = range(0.01, 4, length=300)
p2 = plot(xlabel="total surfactant", ylabel="free monomer", title="monomer saturates at the CMC")
for N in (3, 30, 100)
    plot!(p2, ct, [monomer(x, N) for x in ct], label="N = $N", lw=1.5)
end
display(plot(p1, p2, layout=(1, 2), size=(1000, 400))); readline()
