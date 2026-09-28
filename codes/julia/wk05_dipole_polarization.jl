# Wk05 - Dipole moments, polarizability & the Debye equation
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
using Plots, Printf, Statistics

const EPS0 = 8.8541878128e-12; const KB = 1.380649e-23
const NA = 6.02214076e23; const DEBYE = 3.33564e-30

# (1) dichlorobenzene isomers: mu_res = 2 mu1 cos(theta/2)
mu1 = 1.57
@printf("isomer  angle  mu_calc [D]  mu_obs [D]\n")
for (name, th, obs) in (("ortho", 60, 2.25), ("meta", 120, 1.48), ("para", 180, 0.0))
    @printf("%-6s  %4d   %8.2f   %8.2f\n", name, th, 2mu1 * cosd(th / 2), obs)
end

# (2) Debye plot
mu_w = 1.85DEBYE; α = 4π * EPS0 * 1.48e-30
T = collect(range(300, 500, length=9))
Pm = NA / (3EPS0) .* (α .+ mu_w^2 ./ (3KB .* T))
x = 1 ./ T
slope = cov(x, Pm) / var(x)
intercept = mean(Pm) - slope * mean(x)
@printf("\nDebye plot: mu = %.3f D (input 1.850), alpha' = %.3f e-30 m^3 (input 1.480)\n",
        sqrt(9EPS0 * KB * slope / NA) / DEBYE, 3EPS0 * intercept / NA / (4π * EPS0) * 1e30)
p1 = plot(1e3 ./ T, Pm .* 1e6, marker=:o, xlabel="1000/T [1/K]",
          ylabel="Pm [cm³/mol]", title="Debye plot", legend=false)

# (3) Clausius-Mossotti for CCl4
xcm = 4π * 1590 * NA * 10.5e-30 / (3 * 0.1538)
εr = (1 + 2xcm) / (1 - xcm)
@printf("CCl4: eps_r = %.3f, n = %.3f (experimental 1.4607)\n", εr, sqrt(εr))
println("water: eps_r(static) = 78 but n^2 = 1.77 - dipoles cannot follow light")
display(p1); readline()
