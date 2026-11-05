# Week 11 - Collinear A + BC on a LEPS surface: barrier and Polanyi rules
# Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
# Units eV, Angstrom, amu (time unit 10.18 fs). Sato K = 0.136 -> H3 barrier 0.416 eV at 0.931 A.
using Printf
const B, RE, K, M = 1.942, 0.742, 0.136, 1.00784

function qj(r, D)
    e1 = exp(-B * (r - RE)); e2 = e1^2; c = D / 4 / (1 + K)
    (c * ((3 + K) * e2 - (2 + 6K) * e1), c * ((1 + 3K) * e2 - (6 + 2K) * e1),
     c * (-2B * (3 + K) * e2 + B * (2 + 6K) * e1), c * (-2B * (1 + 3K) * e2 + B * (6 + 2K) * e1))
end

function leps(r1, r2, D)
    Q1, J1, dQ1, dJ1 = qj(r1, D[1]); Q2, J2, dQ2, dJ2 = qj(r2, D[2]); Q3, J3, dQ3, dJ3 = qj(r1 + r2, D[3])
    S = sqrt(0.5 * ((J1 - J2)^2 + (J2 - J3)^2 + (J3 - J1)^2)) + 1e-14
    s1 = (2J1 - J2 - J3) / 2S; s2 = (2J2 - J1 - J3) / 2S; s3 = (2J3 - J1 - J2) / 2S
    (Q1 + Q2 + Q3 - S, dQ1 + dQ3 - s1 * dJ1 - s3 * dJ3, dQ2 + dQ3 - s2 * dJ2 - s3 * dJ3)
end

function barrier(D)
    best, R1, R2 = -1e9, 0.0, 0.0
    for x in range(-3, 3, length=1201)
        vmin, y1, y2 = 1e9, 0.0, 0.0
        for y in range(abs(x) + 0.5, abs(x) + 4, length=700)
            v = leps((y - x) / 2, (y + x) / 2, D)[1]
            v < vmin && ((vmin, y1, y2) = (v, (y - x) / 2, (y + x) / 2))
        end
        vmin > best && ((best, R1, R2) = (vmin, y1, y2))
    end
    best + D[2], R1, R2
end

function trajectory(D, Et, Ev, phase; dt=0.002, tmax=15.0)
    mu = M / 2; w = B * sqrt(2D[2] / mu); A = sqrt(2Ev / (mu * w^2))
    r2 = RE + A * cos(phase); vr = -A * w * sin(phase); vrel = sqrt(2Et / (2M / 3))
    x = [-4.0, 0.0, r2]; v = [2vrel / 3, -vr / 2 - vrel / 3, vr / 2 - vrel / 3]
    force(x) = (g = leps(x[2] - x[1], x[3] - x[2], D); [g[2], -g[2] + g[3], -g[3]])
    f = force(x); t = 0.0
    while t < tmax
        v .+= 0.5dt .* f ./ M; x .+= dt .* v; f = force(x); v .+= 0.5dt .* f ./ M; t += dt
        a, b = x[2] - x[1], x[3] - x[2]
        (a > 5 && b < 2) && return 0.0
        (b > 5 && a < 2) && return 1.0
    end
    0.5
end

surf = [("symmetric", (4.746, 4.746, 4.746)), ("early", (5.5, 4.746, 4.746)), ("late", (4.746, 5.5, 4.746))]
for (name, D) in surf
    Eb, r1, r2 = barrier(D)
    @printf("%-9s barrier = %.3f eV at r_AB = %.3f, r_BC = %.3f A\n", name, Eb, r1, r2)
end
for (name, D, tot) in (("early", surf[2][2], 0.45), ("late", surf[3][2], 1.30)), f in (0.9, 0.5, 0.1)
    P = sum(trajectory(D, tot * f, tot * (1 - f), 2pi * k / 24) for k in 0:23) / 24
    @printf("  %-5s E_trans = %.2f, E_vib = %.2f eV -> P = %.2f\n", name, tot * f, tot * (1 - f), P)
end
