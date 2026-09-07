# Wk02 - Matrix mechanics: [X,P] = i hbar seen numerically
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
# X, P (= i*Pi) in the box basis; diag Im[X,P] -> hbar in the interior.
using Plots, Printf, LinearAlgebra

const L = 1.0; const ħ = 1.0; const Nb = 20
x = range(0, L, length=6001) |> collect
trapz(y) = (x[2]-x[1])*(sum(y) - 0.5*(y[1]+y[end]))
ψ(n)  = sqrt(2/L) .* sin.(n*π .* x ./ L)
dψ(n) = sqrt(2/L)*(n*π/L) .* cos.(n*π .* x ./ L)

X  = [trapz(ψ(m) .* x .* ψ(n)) for m in 1:Nb, n in 1:Nb]
Pi = [-ħ*trapz(ψ(m) .* dψ(n))  for m in 1:Nb, n in 1:Nb]
M = X*Pi - Pi*X                       # Im part of (XP - PX)
d = diag(M) ./ ħ

@printf("n   Im[X,P]_nn/hbar\n")
for n in (1, 2, 5, 10, 15, 19, 20); @printf("%2d  %10.5f\n", n, d[n]); end
println("-> 1 in the interior; fails near n ~ N (infinite matrices!)")
@printf("X_12: %.6f vs analytic %.6f\n", X[1,2], -8*1*2/(π^2*(1-4)^2))

@printf("\n n  sigma_x*sigma_p/hbar (bound 0.5)\n")
for n in 1:5
    @printf("%2d  %.5f\n", n, sqrt(1/12 - 1/(2n^2*π^2))*n*π)
end

p1 = heatmap(M ./ ħ, c=:RdBu, clim=(-1.2, 1.2), yflip=true,
             title="Im(XP-PX)/ħ ~ identity", aspect_ratio=1)
p2 = plot(1:Nb, d, marker=:o, ylim=(-2, 2), label=false,
          xlabel="n", title="diagonal -> ħ (interior)")
hline!(p2, [1.0], ls=:dash, c=:red, label=false)
display(plot(p1, p2, layout=(1,2), size=(1000,420)))
readline()
