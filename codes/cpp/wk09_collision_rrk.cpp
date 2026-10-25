// Wk09 — Collision theory, steric factor, and the RRK model
// Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
//
// (1) Z_AA = (1/2) sigma c_rel n^2,  c_rel = (16 kT / pi m)^(1/2)
// (2) steric factor P = A_exp / A_theory
// (3) RRK: P(e1 >= E0 | E) = (1 - E0/E)^(s-1), Monte Carlo on the energy simplex;
//     thermal average with rho ~ E^(s-1) gives k(T) = nu exp(-E0/kT)
//
// Build:  g++ -O2 -std=c++17 wk09_collision_rrk.cpp -o wk09_collision_rrk
#include <cstdio>
#include <cmath>
#include <random>

int main() {
    const double KB = 1.380649e-23, NA = 6.02214076e23, AMU = 1.66053906660e-27;
    std::mt19937_64 rng(9);
    std::exponential_distribution<double> expo(1.0);

    // (1) N2 at 298.15 K, 1 bar, sigma = 0.43 nm^2
    double T = 298.15, p = 1e5, sigma = 0.43e-18, m = 28.0134 * AMU;
    double n = p / (KB * T), cbar = std::sqrt(8 * KB * T / (M_PI * m)), crel = std::sqrt(2.0) * cbar;
    double z = sigma * crel * n, ZAA = 0.5 * sigma * crel * n * n;
    std::printf("(1) N2, 298.15 K, 1 bar, sigma = 0.43 nm^2\n");
    std::printf("    n = %.3e m^-3, mean speed = %.1f m/s, relative speed = %.1f m/s\n", n, cbar, crel);
    std::printf("    z = %.3e s^-1,  Z_AA = %.3e m^-3 s^-1 = %.3e mol dm^-3 s^-1\n", z, ZAA, ZAA / NA / 1e3);
    std::printf("    A_theory = %.3e dm^3 mol^-1 s^-1\n\n", sigma * crel * NA * 1e3);

    // (2) steric factors
    const char* name[4] = {"2NOCl -> 2NO + 2Cl", "2ClO -> Cl2 + O2", "H2 + C2H4 -> C2H6", "K + Br2 -> KBr + Br"};
    double aexp[4] = {9.4e9, 6.3e7, 1.24e6, 1.0e12}, ath[4] = {5.9e10, 2.5e10, 7.4e11, 2.1e11};
    std::printf("(2) steric factor P = A_exp / A_theory\n");
    for (int i = 0; i < 4; ++i) std::printf("    %-22s P = %.2e\n", name[i], aexp[i] / ath[i]);

    // (3) RRK Monte Carlo
    std::printf("\n(3) RRK  P(e1 >= E0|E) = (1 - E0/E)^(s-1)\n     s   E0/E    formula     Monte Carlo\n");
    int svals[4] = {2, 3, 5, 10};
    double xvals[2] = {0.2, 0.5};
    const int N = 400000;
    for (int s : svals) for (double x : xvals) {
        long hit = 0;
        for (int i = 0; i < N; ++i) {
            double g1 = expo(rng), sum = g1;
            for (int j = 1; j < s; ++j) sum += expo(rng);
            if (g1 / sum >= x) ++hit;
        }
        std::printf("    %2d   %.1f   %.5f     %.5f\n", s, x, std::pow(1 - x, s - 1), double(hit) / N);
    }
    // thermal average, s = 6, E0 = 1, kT = 0.25
    int s = 6; double E0 = 1.0, kT = 0.25, num = 0, den = 0, dE = 60 * kT / 600000;
    for (int i = 0; i <= 600000; ++i) {
        double E = i * dE, w = std::pow(E, s - 1) * std::exp(-E / kT);
        den += w;
        if (E >= E0) num += std::pow(1 - E0 / E, s - 1) * w;
    }
    std::printf("\n    thermal average (s = 6, E0/kT = 4): quadrature %.6e   exp(-E0/kT) = %.6e\n",
                num / den, std::exp(-E0 / kT));
    return 0;
}
