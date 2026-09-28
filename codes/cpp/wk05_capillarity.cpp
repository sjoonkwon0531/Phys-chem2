// Wk05 - Surface tension: Young-Laplace, capillary rise, wetting, Kelvin
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk05_capillarity.cpp -o wk05_capillarity
#include <cmath>
#include <cstdio>
#include <initializer_list>

const double Rg = 8.314462618, G = 9.80665;
const double SIG = 72.75e-3, RHO = 998.0, VM = 1.807e-5;   // water

int main() {
    std::printf("water droplet r      excess pressure 2 sigma/r\n");
    for (double r : {1e-3, 1e-6, 1e-8}) {
        double dp = 2 * SIG / r;
        std::printf("  %10.0f nm   %10.3e Pa = %8.3f atm\n", r * 1e9, dp, dp / 101325);
    }

    std::printf("\ncapillary rise h = 2 sigma cos(theta)/(rho g a):\n");
    for (double a : {0.2e-3, 0.5e-3, 1e-3})
        std::printf("  water, a = %.1f mm: h = %6.1f mm\n", a * 1e3,
                    2 * SIG / (RHO * G * a) * 1e3);
    double h_hg = 2 * 472e-3 * std::cos(140 * M_PI / 180) / (13546 * G * 0.5e-3);
    std::printf("  mercury (140 deg), a = 0.5 mm: h = %6.1f mm (depression)\n", h_hg * 1e3);

    std::printf("\ndrop-weight: tip D = 3 mm -> m = sigma pi D / g = %.1f mg\n",
                SIG * M_PI * 3e-3 / G * 1e6);

    std::printf("\nsurface        theta_c  1+cos = w_ad/sigma_lg\n");
    struct S { const char* n; double th; };
    for (S s : {S{"glass", 5}, S{"polymer", 95}, S{"rubber", 110}, S{"PTFE", 125}})
        std::printf("  %-10s %6.0f   %7.3f  (%s)\n", s.n, s.th,
                    1 + std::cos(s.th * M_PI / 180), s.th < 90 ? "wets" : "non-wetting");

    const double T = 298.15;
    std::printf("\nKelvin: p/p* = exp(2 sigma Vm / r R T)\n");
    for (double r : {1e-6, 1e-7, 1e-8, 1e-9})
        std::printf("  r = %6.0f nm: p/p* = %7.3f\n", r * 1e9,
                    std::exp(2 * SIG * VM / (r * Rg * T)));
    std::printf("-> Ostwald ripening: small droplets feed the large ones\n");
    return 0;
}
