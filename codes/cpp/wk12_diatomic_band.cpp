// Week 12 - Two atoms per cell: band gap at the zone boundary
// Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
// (a) site energies eA, eB:  E = ebar +/- sqrt(D^2 + 4t^2 cos^2(ka/2)),  gap |eA - eB|
// (b) alternating hopping t1, t2:  E = +/- |t1 + t2 e^{-ika}|,  gap 2|t1 - t2|
// Build: g++ -O2 -std=c++17 wk12_diatomic_band.cpp -o dimer
#include <cmath>
#include <complex>
#include <cstdio>
#include <initializer_list>
const double PI = 3.14159265358979323846;
int main() {
    double eA = 0.5, eB = -0.5, t = 1.0, eb = 0.5 * (eA + eB), D = 0.5 * (eA - eB);
    double rZB = std::sqrt(D * D + 4 * t * t * std::pow(std::cos(PI / 2), 2));
    std::printf("(a) gap at k = pi/a: %.4f (|eA - eB| = %.4f)\n", 2 * rZB, std::fabs(eA - eB));
    double t1 = 1.1, t2 = 0.9;
    double r = std::abs(std::complex<double>(t1, 0) + t2 * std::exp(std::complex<double>(0, -PI)));
    std::printf("(b) gap at k = pi/a: %.4f (2|t1 - t2| = %.4f)\n", 2 * r, 2 * std::fabs(t1 - t2));
    for (double d : {0.0, 0.05, 0.1, 0.2}) std::printf("    t1 = 1 + %.2f, t2 = 1 - %.2f: gap %.2f t0\n", d, d, 4 * d);
    return 0;
}
