// Week 11 - Classical elastic scattering: deflection function (Lennard-Jones, reduced units)
// Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
// theta(b) = pi - 2 b Int_{r0}^inf dr / (r^2 sqrt(1 - b^2/r^2 - V(r)/E)),  u = r0/r = 1 - w^2
// Build: g++ -O2 -std=c++17 wk11_scattering_deflection.cpp -o scat
#include <cmath>
#include <cstdio>
#include <initializer_list>
#include <random>
const double PI = 3.14159265358979323846;
double V(double r) { return 4.0 * (std::pow(r, -12) - std::pow(r, -6)); }
double turning(double b, double E) {
    auto f = [&](double r) { return 1.0 - (b / r) * (b / r) - V(r) / E; };
    double rmax = std::fmax(5.0, 3.0 * b), dr = (rmax - 0.5) / 6000.0;
    for (double r = rmax; r > 0.5; r -= dr) {
        if (f(r) > 0 && f(r - dr) <= 0) {
            double lo = r - dr, hi = r;
            for (int i = 0; i < 80; ++i) { double m = 0.5 * (lo + hi); (f(m) > 0 ? hi : lo) = m; }
            return 0.5 * (lo + hi);
        }
    }
    return -1;
}
double deflection(double b, double E, int N = 1000) {
    double r0 = turning(b, E), s = 0;
    for (int i = 0; i < N; ++i) {
        double w = (i + 0.5) / N, u = 1 - w * w;
        double g = 1 - std::pow(b * u / r0, 2) - V(r0 / u) / E;
        s += 2 * w / std::sqrt(std::fmax(g, 1e-300));
    }
    return PI - 2 * b / r0 * s / N;
}
int main() {
    // hard sphere Monte Carlo: dsigma/dOmega should be d^2/4 = 0.25 in every cos(theta) bin
    std::mt19937_64 rng(1); std::uniform_real_distribution<double> U(0, 1);
    int n = 200000, hist[10] = {0};
    for (int i = 0; i < n; ++i) {
        double b = std::sqrt(U(rng)), th = 2 * std::acos(b);
        int k = (int)((std::cos(th) + 1) / 0.2); if (k > 9) k = 9; hist[k]++;
    }
    std::printf("Hard sphere dsigma/dOmega per bin (expect 0.25):");
    for (int k = 0; k < 10; ++k) std::printf(" %.3f", PI * hist[k] / n / (2 * PI * 0.2));
    std::printf("\n");
    for (double E : {2.0, 5.0, 10.0}) {
        double best = 1e9, bb = 0, glory = 0, gmin = 1e9;
        for (int i = 0; i < 600; ++i) {
            double b = 0.02 + i * (3.0 - 0.02) / 599, th = deflection(b, E);
            if (th < best) { best = th; bb = b; }
        }
        for (int i = 0; i < 600; ++i) {
            double b = 0.02 + i * (3.0 - 0.02) / 599; if (b >= bb) break;
            double th = std::fabs(deflection(b, E)); if (th < gmin) { gmin = th; glory = b; }
        }
        std::printf("E* = %5.1f: rainbow = %7.2f deg at b = %.3f, glory at b = %.3f\n",
                    E, best * 180 / PI, bb, glory);
    }
    return 0;
}
