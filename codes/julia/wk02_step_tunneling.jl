# Wk02 - Step potential & quantum tunneling
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
using Plots, Printf

const HBARC = 197.3269804   # eV nm
const MC2   = 0.51099895e6  # eV
κnm(dE) = sqrt(2*MC2*dE)/HBARC
Texact(E, V0, w) = 1/(1 + V0^2*sinh(κnm(V0-E)*w)^2/(4E*(V0-E)))

@printf("E/V0    R        T        R+T\n")
for r in (1.2, 1.5, 2.0, 4.0)
    k1, k2 = sqrt(r), sqrt(r-1)
    R = ((k1-k2)/(k1+k2))^2; T = 4k1*k2/(k1+k2)^2
    @printf("%4.1f  %.5f  %.5f  %.5f\n", r, R, T, R+T)
end
@printf("FET: kappa = %.2f nm^-1, T = %.4f (lecture 0.044)\n", κnm(6.0), Texact(6.0,12.0,0.18))
@printf("STM: T(1.0nm) = %.2e,  T(0.5nm) = %.2e\n", Texact(2.0,5.0,1.0), Texact(2.0,5.0,0.5))

rr = range(1.0001, 7, length=400)
p1 = plot(rr, [4sqrt(r)*sqrt(r-1)/(sqrt(r)+sqrt(r-1))^2 for r in rr], lw=1.5,
          label="T", xlabel="E/V0", title="Step: R & T")
plot!(p1, rr, [((sqrt(r)-sqrt(r-1))/(sqrt(r)+sqrt(r-1)))^2 for r in rr], lw=1.5, label="R")
hline!(p1, [1.0], ls=:dash, c=:black, label=false)

EE = range(0.1, 4.9, length=300)
p2 = plot(EE ./ 5, [Texact(E, 5.0, 0.4) for E in EE], yscale=:log10, lw=1.5,
          xlabel="E/V0", title="Barrier T (V0=5eV, w=0.4nm)", label=false)
ww = range(0.1, 1.2, length=300)
p3 = plot(ww, [Texact(2.0, 5.0, w) for w in ww], yscale=:log10, lw=1.5,
          xlabel="width w [nm]", title="T(w): STM principle", label=false)
display(plot(p1, p2, p3, layout=(1,3), size=(1300,380)))
readline()
