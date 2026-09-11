# Week 3 - Angular Momentum & Ladder Operators (|l,m> basis, hbar = 1)
# Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
# [Lx,Ly] = i Lz, [L^2,Lz] = 0, L^2 = l(l+1) I, L+|l,m> = c+(l,m)|l,m+1>
using LinearAlgebra, Printf

"Return (Lx, Ly, Lz, Lp, Lm, L2) in basis m = l, l-1, ..., -l"
function angmom(l)
    d = 2l + 1
    ms = collect(l:-1:-l) .* 1.0
    Lz = diagm(ms)
    Lp = zeros(d, d)
    for k in 2:d
        m = ms[k]
        Lp[k - 1, k] = sqrt(l * (l + 1) - m * (m + 1))
    end
    Lm = collect(Lp')
    Lx = (Lp + Lm) / 2
    Ly = (Lp - Lm) / (2im)
    L2 = Lx * Lx + Ly * Ly + Lz * Lz
    return Lx, Ly, Lz, Lp, Lm, L2
end

for l in (1, 2)
    Lx, Ly, Lz, Lp, Lm, L2 = angmom(l)
    d = 2l + 1
    e1 = maximum(abs.(Lx * Ly - Ly * Lx - im * Lz))
    e2 = maximum(abs.(L2 * Lz - Lz * L2))
    e3 = maximum(abs.(L2 - l * (l + 1) * I))
    @printf("l=%d: |[Lx,Ly]-iLz| = %.2e, |[L2,Lz]| = %.2e, |L2-l(l+1)I| = %.2e\n", l, e1, e2, e3)
end

# Ladder termination for l = 2
_, _, _, Lp, Lm, _ = angmom(2)
top = [1.0, 0, 0, 0, 0]; bot = [0, 0, 0, 0, 1.0]
@printf("|L+|2,+2>| = %.1e, |L-|2,-2>| = %.1e\n", norm(Lp * top), norm(Lm * bot))

# Generalized uncertainty in |1,+1>: sigma_Lx sigma_Ly >= |<Lz>|/2
Lx, Ly, Lz, _, _, _ = angmom(1)
v = [1.0, 0, 0]
sx = sqrt(real(v' * (Lx * Lx) * v) - real(v' * Lx * v)^2)
sy = sqrt(real(v' * (Ly * Ly) * v) - real(v' * Ly * v)^2)
@printf("|1,+1>: sLx*sLy = %.4f >= |<Lz>|/2 = %.4f\n", sx * sy, abs(real(v' * Lz * v)) / 2)

# Vector model: cone angles for l = 2
L = sqrt(2 * 3)
for m in 2:-1:-2
    @printf("l=2, m=%+d: cone angle = %.2f deg\n", m, acosd(m / L))
end
