# Week 13 (Physical Chemistry 2) - Crystal geometry of cubic lattices
#   1) cell volumes, nearest neighbours and packing fractions of SC, BCC, FCC
#   2) Miller indices from intercepts
#   3) interplanar spacing d_hkl = a / sqrt(h^2 + k^2 + l^2)
#   4) Bragg's law example: {111} at 2theta = 22.4 deg, lambda = 154 pm
using LinearAlgebra, Printf

lattices = [("SC", Matrix{Float64}(I, 3, 3)),
            ("BCC", [-1 1 1; 1 -1 1; 1 1 -1] / 2),
            ("FCC", [0 1 1; 1 0 1; 1 1 0] / 2)]
println("1) Cubic lattices (conventional cube edge a = 1)")
for (name, A) in lattices
    Vp = abs(det(A))
    d = [norm(i * A[1, :] + j * A[2, :] + k * A[3, :]) for i in -3:3 for j in -3:3 for k in -3:3]
    d = filter(>(1e-9), d)
    dnn = minimum(d); z = count(x -> abs(x - dnn) < 1e-9, d)
    pf = 4 / 3 * pi * (dnn / 2)^3 / Vp
    @printf("   %-3s: V_prim = %.4f a^3, points per cube = %.0f, z = %2d, d_nn = %.4f a, packing fraction = %.4f\n",
            name, Vp, 1 / Vp, z, dnn, pf)
end

println("\n2) Miller indices from intercepts (nothing = parallel to that axis)")
function miller(ic)
    rec = [x === nothing ? 0 // 1 : 1 // rationalize(x) for x in ic]
    l = lcm(denominator.(rec)...)
    h = numerator.(rec .* l)
    g = gcd(filter(!=(0), abs.(h))...)
    return h .÷ g
end
for ic in [(3, 2, 2), (1, 1, 1), (1, nothing, nothing), (0.5, 1, nothing), (2, 3, 6), (1, -1, nothing)]
    println("   intercepts $ic -> $(Tuple(miller(ic)))")
end

println("\n3) Interplanar spacing in a cubic lattice")
for hkl in [(1,0,0), (1,1,0), (1,1,1), (2,0,0), (2,1,0), (2,1,1), (2,2,0), (3,1,1)]
    @printf("   %s  d = %.5f a\n", join(hkl), 1 / sqrt(sum(abs2, hkl)))
end

println("\n4) Bragg's law example (lecture slide 13)")
lam, tth = 154.0, 22.4
d111 = lam / (2 * sind(tth / 2))
@printf("   d111 = %.1f pm, a = sqrt(3) d111 = %.1f pm\n", d111, sqrt(3) * d111)
