// Wk04 - Transport properties of a perfect gas
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk04_transport.cpp -o wk04_transport
// lambda = kT/(sqrt2 sigma P); D = 1/3 lambda v; effusion (Cs example).
#include <cmath>
#include <cstdio>
#include <initializer_list>

const double kB = 1.380649e-23, NA = 6.02214076e23;
const double R = kB * NA;

int main() {
    struct Gas { const char* name; double sigma_nm2, M; };
    const Gas gases[] = {{"He", 0.21, 4.003e-3}, {"N2", 0.43, 28.0134e-3},
                         {"CO2", 0.52, 44.01e-3}, {"C6H6", 0.88, 78.11e-3}};
    const double T = 298.15, P = 101325.0;

    std::printf("gas    sigma[nm2]  v_mean[m/s]  lambda[nm]    z[1/s]\n");
    for (auto& g : gases) {
        double s = g.sigma_nm2 * 1e-18;
        double vmean = std::sqrt(8 * R * T / (M_PI * g.M));
        double lam = kB * T / (std::sqrt(2.0) * s * P);
        std::printf("%-5s  %9.2f  %11.1f  %10.1f  %9.3e\n",
                    g.name, g.sigma_nm2, vmean, lam * 1e9, vmean / lam);
    }
    std::printf("-> N2: lambda ~ 67 nm at 1 atm (the lecture's number)\n\n");

    // transport coefficients for N2
    double s = 0.43e-18, M = 28.0134e-3;
    double vmean = std::sqrt(8 * R * T / (M_PI * M));
    double lam = kB * T / (std::sqrt(2.0) * s * P);
    double n = P / (kB * T), rho = n * M / NA;
    double D = lam * vmean / 3, mu = rho * D;
    double kth = vmean * lam * n / NA * 2.5 * R / 3;
    std::printf("N2: D = %.2e m2/s, mu = %.1f uPa s, k = %.1f mW/m K, Sc = %.2f\n",
                D, mu * 1e6, kth * 1e3, mu / (rho * D));

    std::printf("mu at 0.1/1/10 atm: ");
    for (double pf : {0.1, 1.0, 10.0}) {
        double lam_ = kB * T / (std::sqrt(2.0) * s * P * pf);
        double rho_ = (P * pf / (kB * T)) * M / NA;
        std::printf("%.1f ", rho_ * lam_ * vmean / 3 * 1e6);
    }
    std::printf("uPa s -> INDEPENDENT of pressure (Maxwell's surprise)\n\n");

    // Cs effusion example (lecture): expect 8.7 kPa
    double M_Cs = 132.905e-3, T_Cs = 500.0;
    double A0 = M_PI * 0.25e-3 * 0.25e-3;
    double P_Cs = std::sqrt(2 * M_PI * R * T_Cs / M_Cs) * 385e-6 / (A0 * 100.0);
    std::printf("Cs vapor pressure from effusion: %.2f kPa (lecture 8.7 kPa)\n",
                P_Cs / 1e3);
    return 0;
}
