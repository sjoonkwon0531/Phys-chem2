// Week 12 - Planck distribution and the Einstein heat capacity
// Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
// <n> = 1/(e^x - 1), x = hbar w / kT;  C_V = 3R x^2 e^x / (e^x - 1)^2 (Einstein solid)
// Build: g++ -O2 -std=c++17 wk12_planck_einstein.cpp -o planck
#include <cmath>
#include <cstdio>
#include <initializer_list>
const double R = 8.314462618;
double planckSum(double x) { double num = 0, den = 0; for (int s = 0; s < 4000; ++s) { double w = std::exp(-s * x); num += s * w; den += w; } return num / den; }
double einsteinCv(double T, double th) { double x = th / T; return 3 * R * x * x * std::exp(x) / std::pow(std::expm1(x), 2); }
int main() {
    for (double x : {0.1, 0.5, 1.0, 2.0, 5.0}) std::printf("x = %.1f: sum %.8f formula %.8f\n", x, planckSum(x), 1 / std::expm1(x));
    for (double T : {10.0, 30.0, 60.0, 120.0, 240.0, 600.0, 2000.0}) std::printf("T = %6.0f K: C_V = %7.3f J/mol/K (C_V/3R = %.4f)\n", T, einsteinCv(T, 240), einsteinCv(T, 240) / (3 * R));
    return 0;
}
