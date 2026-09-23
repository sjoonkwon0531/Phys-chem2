# Wk04 - Hydrogen atom: Bohr model, spectral series, degeneracy
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
# E_n = -13.606/n^2 eV; lambda = hc/dE; degeneracy 2n^2.
using Plots, Printf

const RY = 13.605693; const HC = 1239.841984; const A0 = 0.0529177
E(n) = -RY / n^2

@printf(" n   r_n [nm]    E_n [eV]\n")
for n in 1:5
    @printf("%2d  %9.4f  %9.4f\n", n, n^2 * A0, E(n))
end

names = ["Lyman", "Balmer", "Paschen", "Brackett", "Pfund"]
@printf("\nseries    n2->n1   dE [eV]   lambda [nm]\n")
for n1 in 1:5, n2 in n1+1:n1+3
    dE = E(n2) - E(n1)
    @printf("%-9s %d->%d   %7.4f   %9.1f\n", names[n1], n2, n1, dE, HC / dE)
end
@printf("Balmer limit: %.1f nm\n\n", HC / (0 - E(2)))

@printf(" n   #states |n,l,m,s>   2n^2\n")
for n in 1:4
    cnt = sum(2 * (2l + 1) for l in 0:n-1)
    @printf("%2d  %18d  %5d\n", n, cnt, 2n^2)
end

p1 = plot(title="E = -13.6/n² eV", ylabel="E [eV]", xticks=false, legend=false)
for n in 1:7
    hline!(p1, [E(n)], c=:teal, lw=1.4)
    annotate!(p1, 0.9, E(n) + 0.25, text("n=$n", 7))
end
p2 = plot(title="Balmer series (visible)", xlabel="wavelength [nm]",
          xlims=(380, 700), ylims=(0, 1.15), yticks=false, legend=false)
for n2 in 3:7
    lam = HC / (E(n2) - E(2))
    vline!(p2, [lam], lw=2.5)
    annotate!(p2, lam, 1.07, text("$(n2)→2", 7))
end
display(plot(p1, p2, layout=(1, 2), size=(1000, 420)))
readline()
