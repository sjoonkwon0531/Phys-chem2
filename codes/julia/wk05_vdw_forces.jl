# Wk05 - Van der Waals forces: Keesom, induction, London
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
using Plots, Printf

const EPS0 = 8.8541878128e-12; const KB = 1.380649e-23
const NA = 6.02214076e23; const DEBYE = 3.33564e-30
const EV = 1.602176634e-19; const T = 298.15

# (name, mu [D], alpha' [1e-30 m^3], I [eV])
mols = [("Ar", 0.0, 1.66, 15.76), ("CH4", 0.0, 2.60, 12.61),
        ("HCl", 1.08, 2.63, 12.74), ("NH3", 1.47, 2.22, 10.07),
        ("H2O", 1.85, 1.48, 12.62), ("C6H6", 0.0, 10.4, 9.24)]

r = 0.40e-9
@printf("pair        C_Keesom  C_induc  C_London [1e-79 Jm^6]  V(0.4nm) kJ/mol\n")
for (nm, muD, apv, IeV) in mols
    mu = muD * DEBYE; ap = apv * 1e-30; I = IeV * EV
    cK = 2mu^4 / (3 * (4π * EPS0)^2 * KB * T)
    cD = 2mu^2 * ap / (4π * EPS0)
    cL = 1.5 * ap^2 * I / 2
    V = -(cK + cD + cL) / r^6 * NA / 1e3
    @printf("%-5s-%-5s %8.2f  %7.2f  %8.2f  %18.2f\n", nm, nm, cK * 1e79, cD * 1e79, cL * 1e79, V)
end
println("-> benzene: zero dipole yet the largest attraction (polarizability wins)")

# r-dependence for the water pair
mu = 1.85DEBYE; ap = 1.48e-30; I = 12.62EV
Cs = [2mu^4 / (3 * (4π * EPS0)^2 * KB * T), 2mu^2 * ap / (4π * EPS0), 1.5ap^2 * I / 2]
push!(Cs, sum(Cs))
rr = range(0.3, 1.2, length=200) .* 1e-9
p = plot(xlabel="r [nm]", ylabel="V [kJ/mol]", title="H₂O pair: 1/r⁶ family")
for (C, lb) in zip(Cs, ("Keesom", "induction", "London", "total"))
    plot!(p, rr .* 1e9, -C ./ rr .^ 6 .* NA ./ 1e3, label=lb, lw=1.5)
end
display(p); readline()
