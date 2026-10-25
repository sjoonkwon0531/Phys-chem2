# Wk09 — Transition state theory (Eyring equation)
# Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
#
# (1) q_vib = 1/(1 - exp(-h nu/kT)) vs. the high-T limit kT/(h nu)
# (2) k = kappa (kT/h) exp(dS/R) exp(-dH/RT)
# (3) atom + atom: TST rate equals collision theory N_A pi r^2 (8kT/pi mu)^(1/2)
#
# Run:  julia wk09_eyring_tst.jl
using Printf
const KB, H, NA, R = 1.380649e-23, 6.62607015e-34, 6.02214076e23, 8.314462618
const HBAR, AMU, C2 = H / 2π, 1.66053906660e-27, 1.438776877e-2
Λ(m, T) = H / sqrt(2π * m * KB * T)

T = 298.15
@printf("(1) q_vib at %.2f K\n    nu      h nu/kT    exact      kT/h nu    error\n", T)
for wn in (2000, 1000, 300, 100, 30, 10)
    x = wn * 100 * C2 / T; ex = 1 / (1 - exp(-x)); ap = 1 / x
    @printf("    %5d   %7.3f   %9.4f   %9.4f   %+7.1f %%\n", wn, x, ex, ap, 100 * (ap - ex) / ex)
end
@printf("    kT/h = %.4e s^-1\n\n", KB * T / H)

println("(2) Eyring, kappa = 1")
for (dH, dS) in ((60e3, -50.0), (60e3, 0.0), (80e3, -50.0))
    @printf("    dH = %4.0f kJ/mol, dS = %+5.0f J/K/mol: k = %.3e dm^3 mol^-1 s^-1\n", dH / 1e3, dS,
            KB * T / H * exp(dS / R) * exp(-dH / (R * T)))
end
kE(TT) = KB * TT / H * exp(-50 / R) * exp(-60e3 / (R * TT))
Ea = -R * (log(kE(320)) - log(kE(280))) / (1 / 320 - 1 / 280)
@printf("    Arrhenius Ea of the Eyring k(T) = %.2f kJ/mol (dH + RT = %.2f)\n\n", Ea / 1e3, (60e3 + R * 300) / 1e3)

mA, mB, r = 1.008AMU, 35.45AMU, 0.30e-9
μ = mA * mB / (mA + mB); I = μ * r^2
println("(3) atom + atom, r = 0.30 nm\n     T [K]    TST              collision theory   ratio")
for TT in (300.0, 1000.0)
    p0 = 1e5; Vm = R * TT / p0
    Kbar = NA * Λ(mA, TT)^3 * Λ(mB, TT)^3 / (Λ(mA + mB, TT)^3 * Vm) * (2I * KB * TT / HBAR^2)
    ktst = KB * TT / H * (R * TT / p0) * Kbar
    kct = NA * π * r^2 * sqrt(8KB * TT / (π * μ))
    @printf("    %6.0f   %.6e     %.6e       %.12f\n", TT, ktst * 1e3, kct * 1e3, ktst / kct)
end
