// Wk10 — Lattice (regular-solution) model of a binary mixture A/B
// Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
//
// (1) dF/(NkT) = chi phi(1-phi) + phi ln phi + (1-phi) ln(1-phi)
//     spinodal chi_s = 1/(2 phi(1-phi)); binodal ln(phi/(1-phi)) = chi(2phi-1); chi_c = 2
// (2) Kawasaki Monte Carlo, square lattice (z = 4): unlike-pair cost = kappa/z = chi kT/4.
//     Exact 2D critical point chi_c = 2z/2.269 = 3.53 (Onsager), not the mean-field 2.
//
// Build:  g++ -O2 -std=c++17 wk10_lattice_mixing.cpp -o wk10_lattice_mixing
#include <cstdio>
#include <cmath>
#include <vector>
#include <random>

double binodal(double chi) {           // bisection on (0, 1/2)
    double a = 1e-12, b = 0.5 - 1e-9;
    auto g = [chi](double p) { return std::log(p / (1 - p)) - chi * (2 * p - 1); };
    for (int i = 0; i < 200; ++i) { double m = 0.5 * (a + b); (g(a) * g(m) <= 0 ? b : a) = m; }
    return 0.5 * (a + b);
}

int main() {
    std::printf("(1) mean-field phase boundaries\n     chi    T/Tc    binodal    spinodal\n");
    for (double chi : {2.2, 2.5, 3.0, 3.5, 4.0})
        std::printf("    %4.1f   %5.3f    %.4f     %.4f\n", chi, 2 / chi, binodal(chi), 0.5 * (1 - std::sqrt(1 - 2 / chi)));

    std::mt19937_64 rng(10);
    std::uniform_real_distribution<double> uni(0, 1);
    const int L = 64, sweeps = 2000;
    int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
    std::printf("\n(2) Kawasaki MC, %dx%d, phi = 0.5, %d sweeps\n     chi    unlike-bond fraction (random = 0.5)\n", L, L, sweeps);
    for (double chi : {1.0, 2.5, 3.5, 4.5, 6.0}) {
        std::vector<int> s(L * L);
        for (auto& v : s) v = uni(rng) < 0.5 ? 1 : -1;
        auto at = [&](int i, int j) -> int& { return s[((i + L) % L) * L + (j + L) % L]; };
        auto unlike = [&](int i, int j, int v) { int c = 0; for (int d = 0; d < 4; ++d) c += (at(i + dx[d], j + dy[d]) != v); return c; };
        double de = chi / 4.0;
        std::uniform_int_distribution<int> pos(0, L - 1), dir(0, 3);
        for (long step = 0; step < (long)sweeps * L * L; ++step) {
            int i = pos(rng), j = pos(rng), d = dir(rng), k = i + dx[d], l = j + dy[d];
            int v1 = at(i, j), v2 = at(k, l);
            if (v1 == v2) continue;
            int before = unlike(i, j, v1) + unlike(k, l, v2);
            at(i, j) = v2; at(k, l) = v1;
            int after = unlike(i, j, v2) + unlike(k, l, v1);
            double dE = (after - before) * de;
            if (dE > 0 && uni(rng) >= std::exp(-dE)) { at(i, j) = v1; at(k, l) = v2; }
        }
        int ub = 0;
        for (int i = 0; i < L; ++i) for (int j = 0; j < L; ++j) ub += (at(i, j) != at(i + 1, j)) + (at(i, j) != at(i, j + 1));
        std::printf("    %4.1f        %.3f\n", chi, ub / (2.0 * L * L));
    }
    std::printf("    -> long-range domains need chi > 3.53 (exact 2D), not chi > 2 (mean field)\n");
    return 0;
}
