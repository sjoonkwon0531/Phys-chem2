# Week 13 (Physical Chemistry 2) - Structure factor and extinction rules
#   S(hkl) = sum_j f_j exp(-i 2 pi (h x_j + k y_j + l z_j)), I ~ |S|^2
#   ionic form factors at zero angle = number of electrons: Na+ 10, Cl- 18, K+ 18, Cs+ 54
using Printf

const F, Q = 0.5, 0.25
fcc = [(0, 0, 0), (0, F, F), (F, 0, F), (F, F, 0)]
shift(p, d) = (p[1] + d[1], p[2] + d[2], p[3] + d[3])
bases = [
    ("SC",      [(1.0, (0, 0, 0))]),
    ("BCC",     [(1.0, (0, 0, 0)), (1.0, (F, F, F))]),
    ("FCC",     [(1.0, p) for p in fcc]),
    ("diamond", vcat([(1.0, p) for p in fcc], [(1.0, shift(p, (Q, Q, Q))) for p in fcc])),
    ("NaCl",    vcat([(10.0, p) for p in fcc], [(18.0, shift(p, (F, 0, 0))) for p in fcc])),
    ("CsCl",    [(54.0, (0, 0, 0)), (18.0, (F, F, F))]),
]
kcl = vcat([(18.0, p) for p in fcc], [(18.0, shift(p, (F, 0, 0))) for p in fcc])
S(b, h) = abs(sum(f * exp(-2im * pi * (h[1] * x[1] + h[2] * x[2] + h[3] * x[3])) for (f, x) in b))

H = [(1,0,0), (1,1,0), (1,1,1), (2,0,0), (2,1,0), (2,1,1), (2,2,0), (2,2,1), (3,0,0), (3,1,0), (3,1,1), (2,2,2), (3,2,0), (3,2,1)]
println("   hkl   N     SC     BCC     FCC diamond    NaCl    CsCl")
for h in H
    @printf("   %s %3d", join(h), sum(abs2, h))
    for (_, b) in bases
        @printf(" %7.2f", S(b, h))
    end
    println()
end
println("\n   Allowed N = h2+k2+l2 (first 8):")
for (name, b) in bases
    Ns = Int[]
    for N in 1:40
        any(h -> sum(abs2, h) == N && S(b, h) > 1e-6, ((h, k, l) for h in 0:6 for k in 0:6 for l in 0:6)) && push!(Ns, N)
        length(Ns) == 8 && break
    end
    @printf("   %-8s: %s\n", name, join(Ns, " "))
end
println("\n   KCl (f_K = f_Cl = 18) versus NaCl")
for h in [(1,1,1), (2,0,0), (2,2,0), (3,1,1), (2,2,2)]
    @printf("   (%s): |S_NaCl| = %5.1f  |S_KCl| = %5.1f\n", join(h), S(bases[5][2], h), S(kcl, h))
end
