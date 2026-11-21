# Week 13 (Physical Chemistry 2) - Powder XRD pattern of cubic crystals (Cu K-alpha1)
#   2theta from lambda = 2 d sin(theta), d = a / sqrt(h2+k2+l2)
#   I ~ |S|^2 x multiplicity x LP, LP = (1 + cos^2 2theta)/(sin^2 theta cos theta)
#   teaching form factor f = Z exp(-B s^2), s = sin(theta)/lambda, B = 2 A^2
#   Scherrer: tau = K lambda / (beta cos theta), K = 0.9
using Printf

const LAM, F = 1.5406, 0.5
fcc = [(0.0, 0.0, 0.0), (0.0, F, F), (F, 0.0, F), (F, F, 0.0)]
sh(p, d) = (p[1] + d[1], p[2] + d[2], p[3] + d[3])
crystals = [
    ("Cu (FCC)", 3.61, [(29.0, p) for p in fcc]),
    ("a-Fe (BCC)", 2.87, [(26.0, (0.0, 0.0, 0.0)), (26.0, (F, F, F))]),
    ("Si (diamond)", 5.43, vcat([(14.0, p) for p in fcc], [(14.0, sh(p, (0.25, 0.25, 0.25))) for p in fcc])),
    ("NaCl (rock salt)", 5.63, vcat([(11.0, p) for p in fcc], [(17.0, sh(p, (F, 0.0, 0.0))) for p in fcc])),
]

function pattern(a, basis; B = 2.0, tmax = 100)
    pk = Dict{NTuple{3,Int}, Vector{Float64}}()   # key => [2theta, d, I, mult]
    for h in -6:6, k in -6:6, l in -6:6
        (h, k, l) == (0, 0, 0) && continue
        d = a / sqrt(h^2 + k^2 + l^2); s = LAM / (2d)
        s >= 1 && continue
        th = asin(s)
        rad2deg(2th) > tmax && continue
        Sg = sum(Z * exp(-B * (s / LAM)^2) * exp(-2im * pi * (h * x[1] + k * x[2] + l * x[3])) for (Z, x) in basis)
        abs(Sg) < 1e-6 && continue
        key = Tuple(sort(abs.([h, k, l]), rev = true))
        lp = (1 + cos(2th)^2) / (sin(th)^2 * cos(th))
        if haskey(pk, key)
            pk[key][3] += abs2(Sg) * lp; pk[key][4] += 1
        else
            pk[key] = [rad2deg(2th), d, abs2(Sg) * lp, 1.0]
        end
    end
    return sort(collect(pk), by = kv -> kv[2][1])
end

tth111 = 0.0
for (name, a, basis) in crystals
    global tth111
    pk = pattern(a, basis)
    Imax = maximum(v[3] for (_, v) in pk)
    s1 = sind(pk[1][2][1] / 2)^2
    name == "Cu (FCC)" && (tth111 = pk[1][2][1])
    @printf("%s, a = %.2f A, lambda = %.4f A\n", name, a, LAM)
    for (k, v) in pk[1:min(7, end)]
        @printf("   (%s)  2theta = %6.2f deg  d = %.4f A  mult = %2d  I = %5.1f  sin2 ratio = %.3f\n",
                join(k), v[1], v[2], Int(v[4]), 100v[3] / Imax, sind(v[1] / 2)^2 / s1)
    end
    println()
end
println("Scherrer crystallite size, Cu (111), K = 0.9")
for w in (0.1, 0.3, 1.0)
    @printf("   FWHM = %.1f deg -> tau = %.1f nm\n", w, 0.9 * LAM / (deg2rad(w) * cosd(tth111 / 2)) / 10)
end
