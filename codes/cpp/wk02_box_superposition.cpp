// Wk02 - Particle in a box: basis expansion, measurement & dynamics
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk02_box_superposition.cpp -o wk02_box_superposition
// hbar = m = L = 1.  c_n -> -8 sqrt(15)/(n^3 pi^3), <E> -> 5.
#include <cmath>
#include <cstdio>
#include <vector>
#include <complex>

int main() {
    const double L = 1.0; const int Nx = 4001, N = 15;
    std::vector<double> x(Nx);
    for (int i = 0; i < Nx; ++i) x[i] = L*i/(Nx-1);
    double h = x[1] - x[0];
    auto trapz = [&](const std::vector<double>& y) {
        double s = 0; for (int i = 0; i < Nx; ++i) s += y[i];
        return h*(s - 0.5*(y[0] + y[Nx-1]));
    };
    auto psi = [&](int n, int i) { return std::sqrt(2.0/L)*std::sin(n*M_PI*x[i]/L); };
    auto En  = [](int n) { return n*n*M_PI*M_PI/2.0; };

    std::vector<double> f(Nx), tmp(Nx);
    for (int i = 0; i < Nx; ++i) f[i] = std::sqrt(30.0)*x[i]*(x[i] - L);
    for (int i = 0; i < Nx; ++i) tmp[i] = f[i]*f[i];
    std::printf("normalization: %.6f\n", trapz(tmp));

    std::vector<double> c(N+1, 0.0);
    for (int n = 1; n <= N; ++n) {
        for (int i = 0; i < Nx; ++i) tmp[i] = psi(n, i)*f[i];
        c[n] = trapz(tmp);
    }
    std::printf(" n   c_n         analytic     |c_n|^2\n");
    for (int n = 1; n <= 7; n += 2)
        std::printf("%2d  %10.6f  %10.6f  %10.6f\n", n, c[n],
                    -8*std::sqrt(15.0)/(n*n*n*M_PI*M_PI*M_PI), c[n]*c[n]);
    double S = 0, Em = 0;
    for (int n = 1; n <= N; ++n) { S += c[n]*c[n]; Em += c[n]*c[n]*En(n); }
    std::printf("Parseval: %.6f,  <E> = %.5f (analytic 5)\n\n", S, Em);

    // superposition (2|1> + |2>)/sqrt(5): density at x = L/4 over one beat
    double c1 = 2/std::sqrt(5.0), c2 = 1/std::sqrt(5.0);
    double Tp = 2*M_PI/(En(2) - En(1));
    std::printf("beat period T = %.4f;  |Psi(L/4,t)|^2:\n  t/T   density\n", Tp);
    for (double frac : {0.0, 0.25, 0.5, 0.75}) {
        double t = frac*Tp, xx = L/4;
        std::complex<double> Psi =
            c1*std::sqrt(2/L)*std::sin(M_PI*xx/L)*std::exp(std::complex<double>(0, -En(1)*t)) +
            c2*std::sqrt(2/L)*std::sin(2*M_PI*xx/L)*std::exp(std::complex<double>(0, -En(2)*t));
        std::printf("%5.2f  %.5f\n", frac, std::norm(Psi));
    }
    std::printf("-> the density sloshes: superpositions move, eigenstates don't.\n");
    return 0;
}
