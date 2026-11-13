// Week 12 - Debye model: k-point counting and the T^3 law
// Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
// C_V = 9R (T/thD)^3 Int_0^{thD/T} x^4 e^x/(e^x-1)^2 dx ;  low T: (12 pi^4/5) R (T/thD)^3
// Build: g++ -O2 -std=c++17 wk12_debye_heat.cpp -o debye
#include <cmath>
#include <cstdio>
#include <initializer_list>
const double R = 8.314462618, PI = 3.14159265358979323846;
double debyeCv(double T, double th, int n = 4000) {
    double xD = th / T, s = 0;
    for (int i = 0; i < n; ++i) { double x = (i + 0.5) * xD / n; s += std::pow(x, 4) * std::exp(x) / std::pow(std::expm1(x), 2); }
    return 9 * R * std::pow(T / th, 3) * s * xD / n;
}
double debyeU(double T, double th, int n = 4000) {
    double xD = th / T, s = 0;
    for (int i = 0; i < n; ++i) { double x = (i + 0.5) * xD / n; s += x * x * x / std::expm1(x); }
    return 9 * R * T * std::pow(T / th, 3) * s * xD / n;
}
int main() {
    for (int M : {5, 10, 20, 40}) {
        long c = 0;
        for (int i = -M; i <= M; ++i) for (int j = -M; j <= M; ++j) for (int k = -M; k <= M; ++k) if (i * i + j * j + k * k <= M * M) ++c;
        std::printf("M = %2d: points %ld, (4/3)pi M^3 = %.1f\n", M, c, 4.0 / 3 * PI * M * M * M);
    }
    double A = 12 * std::pow(PI, 4) / 5 * R, th = 343;
    std::printf("T^3 coefficient = %.1f J/mol/K\n", A);
    for (double T : {5.0, 10.0, 20.0, 40.0, 100.0, 200.0, 300.0, 1000.0})
        std::printf("T = %6.0f K: C_V = %8.4f, T^3 law %10.4f, C_V/3R = %.4f\n", T, debyeCv(T, th), A * std::pow(T / th, 3), debyeCv(T, th) / (3 * R));
    double dU = debyeU(300, th) - debyeU(77, th);
    std::printf("Cu 300->77 K: Debye %.1f kJ/kg, Dulong-Petit %.1f kJ/kg\n", dU / 63.546e-3 / 1e3, 3 * R * 223 / 63.546e-3 / 1e3);
    return 0;
}
