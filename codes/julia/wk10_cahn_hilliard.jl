# Wk10 — Cahn-Hilliard spinodal decomposition and Allen-Cahn coarsening
# Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
#
# f(phi) = chi phi(1-phi) + phi ln phi + (1-phi) ln(1-phi),  mu = f'(phi) - 2 kappa lap(phi)
# Cahn-Hilliard: d phi/dt = lap(mu);  Allen-Cahn: d phi/dt = -(phi^3 - phi - 2 kappa lap(phi))
# Linear theory: R(q) = -q^2 (f'' + 2 kappa q^2), q_m^2 = -f''/(4 kappa), lambda_m = 2 pi/q_m
#
# Run:  julia wk10_cahn_hilliard.jl      (needs FFTW: ] add FFTW)
using Printf, Random, FFTW
Random.seed!(10)
const N = 128
const κ = 1.0
k = 2π .* vcat(0:N÷2-1, -N÷2:-1) ./ N
K2 = [kx^2 + ky^2 for kx in k, ky in k]; K = sqrt.(K2)
clampp(p) = min(max(p, 1e-9), 1 - 1e-9)
fp(p, chi) = (q = clampp(p); log(q / (1 - q)) + chi * (1 - 2q))

function ch(phi, chi, tend, dt)
    A = 2chi; den = 1 .+ dt .* K2 .* (A .+ 2κ .* K2)
    for _ in 1:round(Int, tend / dt)
        ph = fft(phi); muh = fft(fp.(phi, chi))
        phi = real.(ifft((ph .- dt .* K2 .* (muh .- A .* ph)) ./ den))
    end
    phi
end
function peakq(phi)
    S = abs2.(fft(phi .- sum(phi) / length(phi))); dq = 2π / N
    Sq = zeros(N ÷ 2); c = zeros(N ÷ 2)
    for idx in eachindex(S)
        b = round(Int, K[idx] / dq)
        if 1 <= b < N ÷ 2
            Sq[b] += S[idx]; c[b] += 1
        end
    end
    argmax(Sq ./ max.(c, 1)) * dq
end

println("(1) early dominant wavelength vs linear theory\n    chi   phi0   lambda_m theory   measured")
for (chi, p0) in ((3.0, 0.5), (2.6, 0.5), (3.0, 0.35))
    fpp = 1 / (p0 * (1 - p0)) - 2chi; qm = sqrt(-fpp / 4); Rm = qm^2 * (-fpp - 2qm^2)
    phi = ch(p0 .+ 1e-3 .* randn(N, N), chi, log(50) / Rm, 0.05)
    @printf("    %3.1f   %4.2f      %7.2f        %7.2f\n", chi, p0, 2π / qm, 2π / peakq(phi))
end
phi = ch(0.5 .+ 1e-2 .* randn(N, N), 3.0, 400, 0.1)
s = sort(vec(phi))
@printf("\n(2) chi = 3, t = 400: mean phi = %.6f, phases %.3f / %.3f (binodal 0.071 / 0.929)\n",
        sum(phi) / N^2, s[round(Int, 0.02N^2)], s[round(Int, 0.98N^2)])

phi = 0.1 .* randn(N, N); dt = 0.05; den = 1 .+ dt .* 2 * 0.5 .* K2
for _ in 1:4000
    global phi = real.(ifft(fft(phi .+ dt .* (phi .- phi .^ 3)) ./ den))
end
@printf("\n(3) Allen-Cahn: mean phi drifts to %+.3f (non-conserved order parameter)\n", sum(phi) / N^2)
