# Wk04 - Kinetic model & Maxwell-Boltzmann distribution
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
# f(v) = 4pi (M/2piRT)^{3/2} v^2 exp(-Mv^2/2RT); v_mp < v_mean < v_rms.
using Plots, Printf

const R = 8.314462618
fspeed(v, M, T) = 4π * (M / (2π * R * T))^1.5 * v^2 * exp(-M * v^2 / (2R * T))
trapz(x, y) = sum(0.5 .* (y[1:end-1] .+ y[2:end]) .* diff(x))

M, T = 0.0280134, 298.15                 # N2
v = collect(range(0, 3000, length=60001))
fv = fspeed.(v, M, T)
vmp = sqrt(2R * T / M); vmean = sqrt(8R * T / (π * M)); vrms = sqrt(3R * T / M)
println("N2 at 298 K:")
@printf("  int f dv = %.6f\n", trapz(v, fv))
@printf("  v_mp = %.1f, v_mean = %.1f (num %.1f), v_rms = %.1f (num %.1f) m/s\n",
        vmp, vmean, trapz(v, v .* fv), vrms, sqrt(trapz(v, v .^ 2 .* fv)))
@printf("  <KE>/mol = %.1f J = 3/2 RT = %.1f J\n",
        0.5M * trapz(v, v .^ 2 .* fv), 1.5R * T)
@printf("  ratios 1 : %.4f : %.4f (theory 1 : 1.1284 : 1.2247)\n\n", vmean / vmp, vrms / vmp)

p1 = plot(xlabel="v [m/s]", title="N₂: hotter → broader")
for Tp in (100, 298, 1000)
    plot!(p1, v[1:20000], fspeed.(v[1:20000], M, Tp), lw=1.5, label="T = $Tp K")
end
p2 = plot(xlabel="v [m/s]", title="lighter → faster (298 K)")
for (Mi, lb) in ((0.002016, "H₂"), (0.004003, "He"), (0.0280134, "N₂"), (0.1313, "Xe"))
    plot!(p2, v, fspeed.(v, Mi, 298.15), lw=1.5, label=lb)
end
display(plot(p1, p2, layout=(1, 2), size=(1000, 400)))

println("DOF f -> Cv = f/2 R:")
for fd in (3, 5, 7)
    @printf("  f = %d: Cv = %.2f J/mol K\n", fd, fd / 2 * R)
end
println("-> Cv(T) of H2 steps 3/2R -> 5/2R -> 7/2R (quantum freeze-out)")
readline()
