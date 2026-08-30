# Wk01 - Planck's law of blackbody radiation
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
# using Pkg; Pkg.add(["Plots"])
using Plots, Printf

const h  = 6.62607015e-34;  const c  = 2.99792458e8
const kB = 1.380649e-23;    const σSB = 5.670374419e-8
const C1 = 2π*h*c^2;        const C2 = h*c/kB

planck(λ, T) = C1/λ^5 / expm1(C2/(λ*T))
rj(λ, T)     = 2π*c*kB*T / λ^4
wienap(λ, T) = C1/λ^5 * exp(-C2/(λ*T))

λ  = exp10.(range(-7, -4.5, length=800))
Ts = [3000.0, 4000.0, 5000.0, 5800.0]

p1 = plot(xlim=(0,3), xlabel="wavelength [um]", ylabel="E_bλ [W/m^2/m]",
          title="Blackbody spectra & UV catastrophe")
for T in Ts;  plot!(p1, λ*1e6, planck.(λ, T), label="Planck $(Int(T)) K");  end
plot!(p1, λ*1e6, rj.(λ, 5800.0), ls=:dash, c=:black, label="R-J 5800 K")
plot!(p1, λ*1e6, wienap.(λ, 5800.0), ls=:dot, c=:black, label="Wien 5800 K")
ylims!(p1, 0, 1.15*maximum(planck.(λ, 5800.0)))

@printf("T [K]   lambda_max [um]   lambda_max*T [um K]\n")
for T in Ts
    lmax = λ[argmax(planck.(λ, T))]
    @printf("%6.0f  %14.4f  %16.1f\n", T, lmax*1e6, lmax*T*1e6)
end
println("Wien predicts lambda_max*T = 2898 um K\n")

λi = exp10.(range(-8, -3, length=40000))
trapz(x, y) = sum(0.5 .* (y[1:end-1] .+ y[2:end]) .* diff(x))
@printf("T [K]    integral            sigma*T^4        ratio\n")
for T in Ts
    Etot = trapz(λi, planck.(λi, T))
    @printf("%6.0f  %16.6e  %14.6e  %8.5f\n", T, Etot, σSB*T^4, Etot/(σSB*T^4))
end

Tspan = range(1000, 8000, length=60)
lmaxs = [λ[argmax(planck.(λ, T))] for T in Tspan]
p2 = plot(Tspan, lmaxs.*1e6, label="numerical peak",
          xlabel="T [K]", ylabel="lambda_max [um]", title="Wien's displacement law")
plot!(p2, Tspan, 2898.0 ./ Tspan, ls=:dash, c=:red, label="2898/T")
display(plot(p1, p2, layout=(1,2), size=(1100,420)))
readline()
