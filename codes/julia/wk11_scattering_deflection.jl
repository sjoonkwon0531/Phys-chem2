# Week 11 - Classical elastic scattering: deflection function (Lennard-Jones, reduced units)
# Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
# theta(b) = pi - 2 b Int_{r0}^inf dr / (r^2 sqrt(1 - b^2/r^2 - V(r)/E)),  u = r0/r = 1 - w^2
using Random, Printf

V(r) = 4.0 * (r^-12 - r^-6)

function turning(b, E)
    f(r) = 1.0 - (b / r)^2 - V(r) / E
    rs = range(max(5.0, 3.0b), 0.5, length=6000)
    for i in 1:length(rs)-1
        if f(rs[i]) > 0 && f(rs[i+1]) <= 0
            lo, hi = rs[i+1], rs[i]
            for _ in 1:80
                m = (lo + hi) / 2
                f(m) > 0 ? (hi = m) : (lo = m)
            end
            return (lo + hi) / 2
        end
    end
    error("no turning point")
end

function deflection(b, E; N=1000)
    r0 = turning(b, E); s = 0.0
    for i in 1:N
        w = (i - 0.5) / N; u = 1 - w^2
        g = 1 - (b * u / r0)^2 - V(r0 / u) / E
        s += 2w / sqrt(max(g, 1e-300))
    end
    return pi - 2b / r0 * s / N
end

Random.seed!(1)
n = 200_000; hist = zeros(Int, 10)
for _ in 1:n
    th = 2acos(sqrt(rand()))
    hist[min(10, floor(Int, (cos(th) + 1) / 0.2) + 1)] += 1
end
println("Hard sphere dsigma/dOmega (expect 0.25): ", round.(pi .* hist ./ n ./ (2pi * 0.2), digits=3))
for E in (2.0, 5.0, 10.0)
    bs = range(0.02, 3.0, length=600)
    th = [deflection(b, E) for b in bs]
    i = argmin(th); j = argmin(abs.(th[1:i-1]))
    @printf("E* = %5.1f: rainbow = %7.2f deg at b = %.3f, glory at b = %.3f\n", E, rad2deg(th[i]), bs[i], bs[j])
end
