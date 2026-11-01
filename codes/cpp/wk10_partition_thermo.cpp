// Wk10 — From the partition function to thermodynamics
// Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
//
// (1) two-level system: C_V = dU/dT = sigma_E^2/kT^2, Schottky peak
// (2) sigma_E/<E> ~ N^(-1/2)
// (3) diatomic q = qT qR qV qE and standard molar entropy vs CODATA
// (4) Langmuir lattice gas (grand canonical): sigma_N^2 = kT d<N>/dmu = M theta(1-theta)
// (5) mu_trans = kT ln(n Lambda^3)
//
// Build:  g++ -O2 -std=c++17 wk10_partition_thermo.cpp -o wk10_partition_thermo
#include <cstdio>
#include <cmath>
#include <random>

const double KB = 1.380649e-23, H = 6.62607015e-34, C = 2.99792458e10, R = 8.314462618, AMU = 1.66053906660e-27;

int main() {
    // (1)
    double best = 0, tbest = 0, maxdev = 0;
    for (int i = 1; i < 6000; ++i) {
        double t = 0.05 + 2.95 * i / 6000.0, h = 1e-5;
        auto U = [](double tt) { double b = 1 / tt; return std::exp(-b) / (1 + std::exp(-b)); };
        double cv = (U(t + h) - U(t - h)) / (2 * h);
        double var = U(t) - U(t) * U(t);
        maxdev = std::fmax(maxdev, std::fabs(cv - var / (t * t)));
        if (cv > best) { best = cv; tbest = t; }
    }
    std::printf("(1) two-level system: C_max = %.4f k at kT/eps = %.4f;  max|dU/dT - sigma^2/kT^2| = %.1e\n\n", best, tbest, maxdev);
    // (2)
    std::mt19937_64 rng(10);
    double p = std::exp(-1.0) / (1 + std::exp(-1.0));
    std::printf("(2) sigma_E/<E> at kT = eps\n");
    for (int N : {10, 100, 1000, 10000, 1000000}) {
        std::binomial_distribution<long> bin(N, p);
        double s = 0, s2 = 0; int M = 20000;
        for (int k = 0; k < M; ++k) { double e = bin(rng); s += e; s2 += e * e; }
        double mean = s / M, sd = std::sqrt(s2 / M - mean * mean);
        std::printf("    N = %8d: simulated %.5f  theory %.5f\n", N, sd / mean, std::sqrt((1 - p) / (N * p)));
    }
    // (3)
    struct Mol { const char* n; double M, nu, B; int sig, g0; double Sref; };
    Mol mols[5] = {{"N2", 28.0134, 2358.57, 1.998241, 2, 1, 191.609}, {"O2", 31.9988, 1580.161, 1.44562, 2, 3, 205.152},
                   {"CO", 28.0101, 2169.756, 1.931602, 1, 1, 197.660}, {"HCl", 36.461, 2990.925, 10.5933, 1, 1, 186.902},
                   {"I2", 253.809, 214.502, 0.037372, 2, 1, 260.687}};
    double T = 298.15, p0 = 1e5;
    std::printf("\n(3) S° at 298.15 K, 1 bar (NIST CCCBDB constants; CODATA reference)\n     mol    qR       qV      S_total   CODATA\n");
    for (auto& m : mols) {
        double mass = m.M * AMU, Lam = H / std::sqrt(2 * M_PI * mass * KB * T);
        double qTN = (KB * T / p0) / std::pow(Lam, 3), qR = KB * T / (m.sig * H * C * m.B);
        double x = H * C * m.nu / (KB * T), qV = 1 / (1 - std::exp(-x));
        double S = R * (std::log(qTN) + 2.5) + R * (std::log(qR) + 1) + R * (x / std::expm1(x) - std::log(1 - std::exp(-x))) + R * std::log((double)m.g0);
        std::printf("    %-4s  %7.1f  %7.4f   %6.1f    %6.1f\n", m.n, qR, qV, S, m.Sref);
    }
    // (4)
    std::printf("\n(4) Langmuir, M = 1000\n");
    for (double bmu : {-2.0, 0.0, 2.0}) {
        double th = std::exp(bmu) / (1 + std::exp(bmu)), h = 1e-5;
        auto Nf = [](double b) { return 1000 * std::exp(b) / (1 + std::exp(b)); };
        std::printf("    beta mu = %+.1f: theta = %.4f, kT d<N>/dmu = %.2f, M theta(1-theta) = %.2f\n", bmu, th, (Nf(bmu + h) - Nf(bmu - h)) / (2 * h), 1000 * th * (1 - th));
    }
    // (5)
    double mass = 28.0134 * AMU, Lam = H / std::sqrt(2 * M_PI * mass * KB * T), n = p0 / (KB * T);
    std::printf("\n(5) N2: n Lambda^3 = %.3e, mu_trans = %.2f kT = %.1f kJ/mol\n", n * std::pow(Lam, 3), std::log(n * std::pow(Lam, 3)), R * T * std::log(n * std::pow(Lam, 3)) / 1e3);
    return 0;
}
