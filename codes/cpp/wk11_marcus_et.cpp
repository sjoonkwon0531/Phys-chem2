// Week 11 - Marcus electron-transfer rate and bimolecular steady state
// Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
// k_ET = (2pi/hbar)|V|^2 (4 pi lam kT)^(-1/2) exp[-(lam + dG0)^2/(4 lam kT)]
// 1/k_r = 1/k_a + k_a'/(k_a k_et) (1 + k_et'/k_d)
// Build: g++ -O2 -std=c++17 wk11_marcus_et.cpp -o marcus
#include <cmath>
#include <cstdio>
#include <initializer_list>
const double HBAR = 6.582119569e-16, KB = 8.617333262e-5, PI = 3.14159265358979323846;
double kMarcus(double dG0, double lam, double V, double T) {
    double kT = KB * T;
    return 2 * PI / HBAR * V * V / std::sqrt(4 * PI * lam * kT) * std::exp(-(lam + dG0) * (lam + dG0) / (4 * lam * kT));
}
double kBimol(double dG0, double lam, double V, double ka, double KA, double T) {
    double kT = KB * T, karev = ka / KA, kd = karev, ket = kMarcus(dG0, lam, V, T), ketr = ket * std::exp(dG0 / kT);
    return 1.0 / (1.0 / ka + karev / (ka * ket) * (1.0 + ketr / kd));
}
int main() {
    double T = 298.15, eta = 0.890e-3, ka = 8 * 8.314462618 * T / (3 * eta) * 1e3, lam = 1.0, V = 0.01;
    std::printf("k_a = 8RT/3eta = %.3e M^-1 s^-1\n", ka);
    std::printf("k_ET max = %.4e s^-1\n", kMarcus(-lam, lam, V, T));
    std::printf("  dG0     dG*      k_ET        k_r\n");
    for (double dG0 : {0.2, 0.0, -0.25, -0.5, -1.0, -1.5, -2.0, -2.5, -3.0})
        std::printf("%6.2f %8.4f %11.3e %11.3e\n", dG0, (lam + dG0) * (lam + dG0) / (4 * lam),
                    kMarcus(dG0, lam, V, T), kBimol(dG0, lam, V, ka, 1.0, T));
    std::printf("beta from 10x per 1.7 A = %.3f 1/A\n", std::log(10.0) / 1.7);
    return 0;
}
