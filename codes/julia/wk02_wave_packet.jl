# Wk02 - Gaussian wave packet: minimum uncertainty & dispersion
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
# hbar = m = 1.  sigma_x*sigma_p = 1/2;  sigma_x(t)^2 = eps + t^2/(4 eps).
using Plots, Printf

const ħ = 1.0; const m = 1.0; const p0 = 2.0
trapz(x, y) = sum(0.5 .* (y[1:end-1] .+ y[2:end]) .* diff(x))

x = range(-30, 30, length=20001) |> collect
p = range(-10, 14, length=20001) |> collect

@printf("eps    sigma_x    sigma_p    product\n")
for ε in (0.5, 1.0, 2.0, 3.0)
    Px = abs2.((1/(2π*ε))^0.25 .* exp.(-x.^2 ./ (4ε)))
    Pp = abs2.((2ε/(π*ħ^2))^0.25 .* exp.(-ε .* (p .- p0).^2 ./ ħ^2))
    sx = sqrt(trapz(x, x.^2 .* Px) - trapz(x, x .* Px)^2)
    sp = sqrt(trapz(p, p.^2 .* Pp) - trapz(p, p .* Pp)^2)
    @printf("%4.1f  %9.5f  %9.5f  %9.5f\n", ε, sx, sp, sx*sp/ħ)
end

ε = 1.0
xs = range(-8, 28, length=800)
p1 = plot(xlabel="x", ylabel="|Psi|²", title="Free-packet dispersion")
for t in (0.0, 3.0, 6.0)
    s2 = ε + (ħ*t)^2/(4m^2*ε); xc = p0*t/m
    plot!(p1, xs, exp.(-(xs .- xc).^2 ./ (2s2)) ./ sqrt(2π*s2),
          lw=1.4, label=@sprintf("t=%.0f, σ=%.2f", t, sqrt(s2)))
end
ts = range(0, 10, length=300)
p2 = plot(ts, sqrt.(ε .+ (ħ .* ts).^2 ./ (4m^2*ε)), lw=1.6, label="σx(t)",
          xlabel="t", title="σx grows; σp constant")
hline!(p2, [ħ/(2sqrt(ε))], ls=:dash, c=:red, label="σp")
display(plot(p1, p2, layout=(1,2), size=(1000,400)))
readline()
