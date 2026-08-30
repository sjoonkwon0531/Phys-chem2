// Wk01 - Planck's law of blackbody radiation
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build:  g++ -O2 -std=c++17 wk01_planck_law.cpp -o wk01_planck_law
// Output: stdout tables + planck_spectra.csv (plot with Excel/gnuplot)
#include <cmath>
#include <cstdio>
#include <vector>

const double h = 6.62607015e-34, c = 2.99792458e8, kB = 1.380649e-23;
const double sigma = 5.670374419e-8;
const double C1 = 2.0*M_PI*h*c*c, C2 = h*c/kB;

double planck(double lam, double T) { return C1/std::pow(lam,5)/std::expm1(C2/(lam*T)); }
double rj(double lam, double T)     { return 2.0*M_PI*c*kB*T/std::pow(lam,4); }

int main() {
    std::vector<double> Ts = {3000, 4000, 5000, 5800};

    // spectra to CSV
    FILE* f = std::fopen("planck_spectra.csv", "w");
    std::fprintf(f, "lambda_um,RJ_5800");
    for (double T : Ts) std::fprintf(f, ",Planck_%.0fK", T);
    std::fprintf(f, "\n");
    for (int i = 0; i <= 800; ++i) {
        double lam = std::pow(10.0, -7.0 + 2.5*i/800.0);
        std::fprintf(f, "%.6e,%.6e", lam*1e6, rj(lam, 5800));
        for (double T : Ts) std::fprintf(f, ",%.6e", planck(lam, T));
        std::fprintf(f, "\n");
    }
    std::fclose(f);
    std::printf("wrote planck_spectra.csv\n\n");

    // Wien's displacement law
    std::printf("T [K]   lambda_max [um]   lambda_max*T [um K]\n");
    for (double T : Ts) {
        double best = 0, lmax = 0;
        for (int i = 0; i <= 20000; ++i) {
            double lam = std::pow(10.0, -7.0 + 2.5*i/20000.0);
            double E = planck(lam, T);
            if (E > best) { best = E; lmax = lam; }
        }
        std::printf("%6.0f  %14.4f  %16.1f\n", T, lmax*1e6, lmax*T*1e6);
    }
    std::printf("Wien predicts lambda_max*T = 2898 um K\n\n");

    // Stefan-Boltzmann by trapezoid on log grid
    std::printf("T [K]    integral            sigma*T^4        ratio\n");
    for (double T : Ts) {
        const int N = 200000;
        double S = 0, lp = std::pow(10.0, -8.0), Ep = planck(lp, T);
        for (int i = 1; i <= N; ++i) {
            double lam = std::pow(10.0, -8.0 + 5.0*i/N);
            double E = planck(lam, T);
            S += 0.5*(E + Ep)*(lam - lp);
            lp = lam; Ep = E;
        }
        std::printf("%6.0f  %16.6e  %14.6e  %8.5f\n", T, S, sigma*std::pow(T,4), S/(sigma*std::pow(T,4)));
    }
    return 0;
}
