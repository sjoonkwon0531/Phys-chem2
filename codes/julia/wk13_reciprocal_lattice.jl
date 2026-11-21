# Week 13 (Physical Chemistry 2) - Reciprocal lattice and Brillouin zones
#   1) b1 = 2 pi (a2 x a3)/(a1 . a2 x a3), etc.; check b_i . a_j = 2 pi delta_ij
#   2) reciprocal of SC is SC, of BCC is FCC, of FCC is BCC
#   3) BZ volume = (2 pi)^3 / V_cell and number of faces of the first BZ
#   4) 2D Wigner-Seitz cell by half-plane clipping
#   5) Fourier coefficients of a 1D periodic Gaussian density
using LinearAlgebra, Printf

function reciprocal(A)
    a1, a2, a3 = A[1, :], A[2, :], A[3, :]
    V = dot(a1, cross(a2, a3))
    return 2pi * vcat(cross(a2, a3)', cross(a3, a1)', cross(a1, a2)') / V
end
lat = [("SC", Matrix{Float64}(I, 3, 3)), ("BCC", [-1 1 1; 1 -1 1; 1 1 -1] / 2), ("FCC", [0 1 1; 1 0 1; 1 1 0] / 2)]
println("1-3) Reciprocal vectors (units of 2pi/a), BZ volume, faces of the first BZ")
for (name, A) in lat
    B = reciprocal(A)
    err = maximum(abs.(B * A' / 2pi - I))
    G = [i * B[1, :] + j * B[2, :] + k * B[3, :] for i in -2:2 for j in -2:2 for k in -2:2]
    G = filter(g -> norm(g) > 1e-9, G)
    faces = count(g -> all(h -> norm(h - g) < 1e-9 || norm(g / 2 - h) > norm(g / 2) + 1e-9, G), G)
    @printf("   %-3s b1 = %s, b2 = %s, b3 = %s; err %.1e; V_BZ V_cell/(2pi)^3 = %.6f; faces = %d\n",
            name, B[1, :] / 2pi, B[2, :] / 2pi, B[3, :] / 2pi, err, abs(det(B)) * abs(det(A)) / (2pi)^3, faces)
end

function ws_cell_2d(a1, a2; R = 3)
    P = [[-10.0, -10.0], [10.0, -10.0], [10.0, 10.0], [-10.0, 10.0]]
    for i in -R:R, j in -R:R
        (i == 0 && j == 0) && continue
        T = i * a1 + j * a2; c = dot(T, T) / 2
        Q = Vector{Vector{Float64}}()
        for k in eachindex(P)
            p, q = P[k], P[mod1(k + 1, length(P))]
            fp, fq = dot(p, T) - c, dot(q, T) - c
            fp <= 0 && push!(Q, p)
            fp * fq < 0 && push!(Q, p + (q - p) * fp / (fp - fq))
        end
        P = Vector{Vector{Float64}}()
        for q in Q
            (isempty(P) || norm(q - P[end]) > 1e-9) && push!(P, q)
        end
        (length(P) > 1 && norm(P[1] - P[end]) < 1e-9) && pop!(P)
    end
    return P
end
area(P) = abs(sum(P[k][1] * P[mod1(k + 1, length(P))][2] - P[mod1(k + 1, length(P))][1] * P[k][2] for k in eachindex(P))) / 2

println("\n4) 2D Wigner-Seitz cells by half-plane clipping")
for (name, a1, a2) in [("square", [1.0, 0], [0.0, 1]), ("hexagonal", [1.0, 0], [0.5, sqrt(3) / 2]), ("oblique", [1.0, 0], [0.3, 0.8])]
    P = ws_cell_2d(a1, a2)
    @printf("   %-9s: %d vertices, WS area = %.6f, |a1 x a2| = %.6f\n", name, length(P), area(P), abs(a1[1] * a2[2] - a1[2] * a2[1]))
end

println("\n5) Fourier coefficients of a 1D Gaussian density (sigma = 0.08 a)")
N, sig = 4096, 0.08
x = (0:N-1) / N
n = sum(exp.(-(x .- m) .^ 2 / (2sig^2)) for m in -1:1) / (sqrt(2pi) * sig)
for p in 0:5
    np_ = sum(n .* exp.(-2im * pi * p * x)) / N
    @printf("   p = %d: n_p = %+.5f (analytic %.5f)\n", p, real(np_), exp(-(2pi * p * sig)^2 / 2))
end
