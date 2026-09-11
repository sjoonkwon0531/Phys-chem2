# Week 3 - Spherical Harmonics & the Hydrogen Atom (a0 = 1)
# Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
# psi_nlm = R_nl(r) Y_l^m(theta,phi), E_n = -13.6057/n^2 eV
using Printf

trapz(x, f) = sum((f[1:end-1] .+ f[2:end]) .* diff(x)) / 2

"Associated Legendre P_l^m(x) (m >= 0, Condon-Shortley) via stable recurrences"
function assoc_legendre(l, m, x)
    Pmm = one.(x)
    if m > 0
        somx2 = sqrt.((1 .- x) .* (1 .+ x))
        fact = 1.0
        for _ in 1:m
            Pmm = Pmm .* (-fact) .* somx2
            fact += 2
        end
    end
    l == m && return Pmm
    Pm1 = x .* (2m + 1) .* Pmm
    l == m + 1 && return Pm1
    local Pll
    for ll in (m + 2):l
        Pll = (x .* (2ll - 1) .* Pm1 .- (ll + m - 1) .* Pmm) ./ (ll - m)
        Pmm, Pm1 = Pm1, Pll
    end
    return Pm1
end

"Complex spherical harmonic Y_l^m"
function Ylm(l, m, theta, phi)
    am = abs(m)
    N = sqrt((2l + 1) / (4pi) * factorial(l - am) / factorial(l + am))
    Y = N .* assoc_legendre(l, am, cos.(theta)) .* exp.(im * am .* phi)
    m < 0 && (Y = (-1)^m .* conj.(Y))
    return Y
end

"Associated Laguerre L_k^(alpha)(x) by recurrence"
function laguerreL(k, alpha, x)
    k == 0 && return one.(x)
    Lm, Lc = one.(x), 1 .+ alpha .- x
    for i in 1:k-1
        Lm, Lc = Lc, ((2i + 1 + alpha .- x) .* Lc .- (i + alpha) .* Lm) ./ (i + 1)
    end
    return Lc
end

"Hydrogen radial function (a0 = 1)"
function Rnl(n, l, r)
    rho = 2 .* r ./ n
    N = sqrt((2 / n)^3 * factorial(n - l - 1) / (2n * factorial(n + l)))
    return N .* rho .^ l .* exp.(-rho ./ 2) .* laguerreL(n - l - 1, 2l + 1, rho)
end

# 1) Y_l^m orthonormality on the sphere
th = range(0, pi; length = 1201) |> collect
ph = range(0, 2pi; length = 1201) |> collect
function innerY(l1, m1, l2, m2)
    g = [conj(Ylm(l1, m1, t, p)) * Ylm(l2, m2, t, p) * sin(t) for t in th, p in ph]
    rowint = [trapz(ph, g[i, :]) for i in eachindex(th)]
    return trapz(th, rowint)
end
@printf("<Y_1^0|Y_1^0> = %.6f\n", real(innerY(1, 0, 1, 0)))
@printf("<Y_2^1|Y_2^1> = %.6f\n", real(innerY(2, 1, 2, 1)))
@printf("<Y_1^0|Y_2^0> = %+.2e\n", real(innerY(1, 0, 2, 0)))

# 2) Radial normalization, <r>_1s, virial
r = range(1e-8, 120; length = 400001) |> collect
for (n, l) in ((1, 0), (2, 0), (2, 1), (3, 2))
    I = trapz(r, Rnl(n, l, r) .^ 2 .* r .^ 2)
    @printf("int R_%d%d^2 r^2 dr = %.6f\n", n, l, I)
end
P1s = Rnl(1, 0, r) .^ 2 .* r .^ 2
@printf("<r>_1s = %.5f a0, r_mp = %.4f a0\n", trapz(r, r .* P1s), r[argmax(P1s)])
@printf("<V>_1s = %.5f Ha (= 2E_1 = -1)\n", trapz(r, -1 ./ r .* P1s))

# 3) Energy levels & degeneracy
Ry = 13.605693
for n in 1:3
    @printf("E_%d = %.4f eV\n", n, -Ry / n^2)
end
for n in 1:4
    println("n=$n: degeneracy = ", sum(2l + 1 for l in 0:n-1), " = n^2 = ", n^2)
end
