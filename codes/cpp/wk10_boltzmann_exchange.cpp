// Wk10 — Where the Boltzmann distribution comes from
// Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
//
// (1) Stirling: ln N! ~ N ln N - N
// (2) Einstein solid: P(n) = C(Q-n+N-2, N-2)/C(Q+N-1, N-1) -> (1-x) x^n, x = Q/(Q+N)
// (3) Energy-exchange game relaxes to exp(-beta eps)
// (4) beta = d ln W / dE
//
// Build:  g++ -O2 -std=c++17 wk10_boltzmann_exchange.cpp -o wk10_boltzmann_exchange
#include <cstdio>
#include <cmath>
#include <vector>
#include <random>

double lnC(double n, double k) { return std::lgamma(n + 1) - std::lgamma(k + 1) - std::lgamma(n - k + 1); }

int main() {
    std::printf("(1) Stirling: ln N!  vs  N ln N - N\n");
    for (double N : {10.0, 100.0, 1000.0, 1e6}) {
        double ex = std::lgamma(N + 1), ap = N * std::log(N) - N;
        std::printf("  %10.0f   %16.4f   %16.4f   rel. error %9.2e\n", N, ex, ap, (ex - ap) / ex);
    }
    std::printf("\n(2) Einstein solid, <n> = 1 -> Boltzmann x = 1/2\n     n   N=10      N=100     N=1000    Boltzmann\n");
    for (int n = 0; n < 7; ++n) {
        std::printf("    %2d", n);
        for (double N : {10.0, 100.0, 1000.0}) {
            double Q = N;
            std::printf("   %.5f", std::exp(lnC(Q - n + N - 2, N - 2) - lnC(Q + N - 1, N - 1)));
        }
        std::printf("   %.5f\n", 0.5 * std::pow(0.5, n));
    }
    // (3) exchange game
    std::mt19937_64 rng(10);
    const int N = 2000, q0 = 2, sweeps = 400;
    std::uniform_int_distribution<int> pick(0, N - 1);
    std::vector<int> e(N, q0);
    std::vector<double> hist(15, 0.0);
    for (int s = 0; s < sweeps; ++s) {
        for (int k = 0; k < N; ++k) {
            int i = pick(rng), j = pick(rng);
            if (i != j && e[i] > 0) { e[i]--; e[j]++; }
        }
        if (s >= sweeps / 2) for (int v : e) if (v < 15) hist[v] += 1.0;
    }
    double norm = double(N) * (sweeps - sweeps / 2);
    double x = q0 / (q0 + 1.0);
    std::printf("\n(3) exchange game: N = %d, start n = %d, second half averaged\n     n   simulation   Boltzmann\n", N, q0);
    for (int k = 0; k < 8; ++k) std::printf("    %2d    %.4f       %.4f\n", k, hist[k] / norm, (1 - x) * std::pow(x, k));
    double sx = 0, sy = 0, sxx = 0, sxy = 0; int m = 10;
    for (int k = 0; k < m; ++k) { double y = std::log(hist[k] / norm); sx += k; sy += y; sxx += k * k; sxy += k * y; }
    double slope = (m * sxy - sx * sy) / (m * sxx - sx * sx);
    std::printf("    fitted beta*eps = %.3f   exact ln((q0+1)/q0) = %.3f\n", -slope, std::log((q0 + 1.0) / q0));
    // (4)
    for (double Q : {500.0, 1000.0, 2000.0}) {
        double Nn = 1000, d = lnC(Q + 1 + Nn - 1, Nn - 1) - lnC(Q + Nn - 1, Nn - 1);
        std::printf("(4) N = 1000, Q = %.0f: d lnW/dQ = %.4f   ln((Q+N)/Q) = %.4f\n", Q, d, std::log((Q + Nn) / Q));
    }
    return 0;
}
