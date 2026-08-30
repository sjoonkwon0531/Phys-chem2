# Wk01 - 1D time-independent Schrodinger equation by FDM
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
# -(1/2) psi'' + V psi = E psi on [0,L], hbar = m = 1, Dirichlet BC.
using LinearAlgebra, Plots, Printf

L, N = 1.0, 400
x = range(0, L, length=N+2);  h = step(x);  xi = collect(x[2:end-1])

function solveSE(V)
    Hmat = SymTridiagonal(1/h^2 .+ V, fill(-0.5/h^2, N-1))
    F = eigen(Hmat)
    return F.values, F.vectors ./ sqrt(h)
end

cases = [
    ("infinite well (V=0)",           zeros(N)),
    ("harmonic 0.5k(x-L/2)^2",        0.5*8e4 .* (xi .- L/2).^2),
    ("finite well (V0=2000, w=0.4L)", [abs(xx-L/2) < 0.2L ? 0.0 : 2000.0 for xx in xi]),
]

ps = []
for (name, V) in cases
    E, ψ = solveSE(V)
    p = plot(title=name, xlabel="x", titlefontsize=9, legend=:topright)
    for n in 1:4
        s = sign(ψ[div(N,5), n] + 1e-12)
        plot!(p, xi, 40 .* ψ[:, n] .* s .+ E[n], lw=1.3,
              label=@sprintf("E%d=%.1f", n, E[n]))
    end
    if maximum(V) > 0
        plot!(p, xi, V, ls=:dash, c=:black, lw=0.8, label="V(x)")
        ylims!(p, 0, 1.3*E[4])
    end
    push!(ps, p)
end
display(plot(ps..., layout=(1,3), size=(1300,420),
             plot_title="Quantization as an eigenvalue problem (FDM)"))

E_box, _ = solveSE(zeros(N))
println("infinite well: E_n = n² π²/2")
for n in 1:5
    Ea = n^2*π^2/2
    @printf("%2d  %10.5f  %10.5f  %.2e\n", n, E_box[n], Ea, abs(E_box[n]-Ea)/Ea)
end
readline()
