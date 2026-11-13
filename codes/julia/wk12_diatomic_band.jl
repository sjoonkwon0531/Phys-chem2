# Week 12 - Two atoms per cell: band gap at the zone boundary
# Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
using Printf
eA, eB, t = 0.5, -0.5, 1.0
D = (eA - eB) / 2
@printf("(a) gap %.4f (|eA - eB| = %.4f)\n", 2sqrt(D^2 + 4t^2 * cos(pi / 2)^2), abs(eA - eB))
t1, t2 = 1.1, 0.9
@printf("(b) gap %.4f (2|t1 - t2| = %.4f)\n", 2abs(t1 + t2 * exp(-im * pi)), 2abs(t1 - t2))
for d in (0.0, 0.05, 0.1, 0.2)
    @printf("    t1 = 1 + %.2f, t2 = 1 - %.2f: gap %.2f t0\n", d, d, 4d)
end
