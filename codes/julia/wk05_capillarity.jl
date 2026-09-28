# Wk05 - Surface tension: Young-Laplace, capillary rise, wetting, Kelvin
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
using Plots, Printf

const Rg = 8.314462618; const G = 9.80665
const SIG = 72.75e-3; const RHO = 998.0; const VM = 1.807e-5   # water

# (1) Young-Laplace
println("water droplet r      excess pressure 2σ/r")
for r in (1e-3, 1e-6, 1e-8)
    dp = 2SIG / r
    @printf("  %10.0f nm   %10.3e Pa = %8.3f atm\n", r * 1e9, dp, dp / 101325)
end

# (2) capillary rise
println("\ncapillary rise h = 2σcosθ/(ρga):")
for a in (0.2e-3, 0.5e-3, 1e-3)
    @printf("  water, a = %.1f mm: h = %6.1f mm\n", a * 1e3, 2SIG / (RHO * G * a) * 1e3)
end
h_hg = 2 * 472e-3 * cosd(140) / (13546 * G * 0.5e-3)
@printf("  mercury (140°), a = 0.5 mm: h = %6.1f mm (depression)\n", h_hg * 1e3)

# (3) Young equation & wetting
println("\nsurface        θc     1+cosθ = w_ad/σ_lg")
for (nm, th) in (("glass", 5), ("polymer", 95), ("rubber", 110), ("PTFE", 125))
    @printf("  %-10s %4d   %7.3f  (%s)\n", nm, th, 1 + cosd(th),
            th < 90 ? "wets" : "non-wetting")
end

# (4) Kelvin equation
T = 298.15
println("\nKelvin: p/p* = exp(2σVm/rRT)")
for r in (1e-6, 1e-7, 1e-8, 1e-9)
    @printf("  r = %6.0f nm: p/p* = %7.3f\n", r * 1e9, exp(2SIG * VM / (r * Rg * T)))
end
println("-> Ostwald ripening: small droplets feed the large ones")

rr = 10 .^ range(-9, -6, length=200)
p1 = plot(rr .* 1e9, 2SIG ./ rr ./ 1e5, xscale=:log10, yscale=:log10,
          xlabel="r [nm]", ylabel="Δp [bar]", title="Laplace pressure", legend=false)
p2 = plot(rr .* 1e9, exp.(2SIG * VM ./ (rr .* Rg .* T)), xscale=:log10,
          xlabel="r [nm]", ylabel="p/p*", title="Kelvin equation", legend=false)
hline!(p2, [1.0], ls=:dash, c=:gray)
display(plot(p1, p2, layout=(1, 2), size=(1000, 400))); readline()
