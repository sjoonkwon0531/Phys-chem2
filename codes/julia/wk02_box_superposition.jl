# Wk02 - Particle in a box: basis expansion, measurement & dynamics
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
# hbar = m = L = 1.  c_n = -8 sqrt(15)/(n^3 pi^3) (odd n), <E> = 5.
using Plots, Printf

const L = 1.0
x = range(0, L, length=4001) |> collect
trapz(y) = (x[2]-x[1])*(sum(y) - 0.5*(y[1]+y[end]))
ψ(n) = sqrt(2/L) .* sin.(n*π .* x ./ L)
En(n) = n^2*π^2/2

f = sqrt(30/L^5) .* x .* (x .- L)
@printf("normalization: %.6f\n", trapz(f.^2))

N = 15
c = [trapz(ψ(n) .* f) for n in 1:N]
@printf(" n   c_n         analytic     |c_n|^2\n")
for n in 1:2:7
    @printf("%2d  %10.6f  %10.6f  %10.6f\n", n, c[n], -8sqrt(15)/(n^3*π^3), c[n]^2)
end
@printf("Parseval: %.6f,  <E> = %.5f (analytic 5)\n",
        sum(c.^2), sum(c[n]^2*En(n) for n in 1:N))

p1 = plot(x, f, c=:black, lw=2, label="f(x)", title="Basis expansion")
for Np in (1, 3, 5)
    g = sum(c[n] .* ψ(n) for n in 1:Np)
    plot!(p1, x, g, ls=:dash, label="N=$Np")
end
p2 = bar(1:N, max.(c.^2, 1e-12), yscale=:log10, label=false,
         xlabel="n", title="|c_n|² (measurement prob.)")

c1, c2 = 2/sqrt(5), 1/sqrt(5)
Tp = 2π/(En(2) - En(1))
p3 = plot(title="|Psi(x,t)|² sloshing", xlabel="x")
for frac in (0.0, 0.25, 0.5)
    t = frac*Tp
    Ψ = c1 .* ψ(1) .* exp(-im*En(1)*t) .+ c2 .* ψ(2) .* exp(-im*En(2)*t)
    plot!(p3, x, abs2.(Ψ), lw=1.3, label=@sprintf("t=%.2fT", frac))
end
plot!(p3, x, ψ(1).^2, ls=:dot, c=:black, label="stationary |1>")
display(plot(p1, p2, p3, layout=(1,3), size=(1300,380)))
readline()
