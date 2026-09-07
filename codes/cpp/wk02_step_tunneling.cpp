// Wk02 - Step potential & quantum tunneling
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk02_step_tunneling.cpp -o wk02_step_tunneling
// Reproduces the lecture FET / STM numbers; writes T_vs_width.csv.
#include <cmath>
#include <cstdio>
#include <initializer_list>

const double HBARC = 197.3269804;   // eV nm
const double MC2   = 0.51099895e6;  // eV

double kappa_nm(double dE) { return std::sqrt(2*MC2*dE)/HBARC; }
double T_exact(double E, double V0, double w) {
    double s = std::sinh(kappa_nm(V0-E)*w);
    return 1.0/(1.0 + V0*V0*s*s/(4*E*(V0-E)));
}

int main() {
    std::printf("E/V0    R        T        R+T\n");
    for (double r : {1.2, 1.5, 2.0, 4.0}) {
        double k1 = std::sqrt(r), k2 = std::sqrt(r-1.0);
        double R = std::pow((k1-k2)/(k1+k2), 2);
        double T = 4*k1*k2/std::pow(k1+k2, 2);
        std::printf("%4.1f  %.5f  %.5f  %.5f\n", r, R, T, R+T);
    }
    std::printf("\nFET (E=6, V0=12 eV, w=0.18 nm): kappa = %.2f nm^-1, T = %.4f (lecture 0.044)\n",
                kappa_nm(6.0), T_exact(6, 12, 0.18));
    std::printf("STM (E=2, V0=5 eV): T(1.0 nm) = %.2e,  T(0.5 nm) = %.2e\n",
                T_exact(2, 5, 1.0), T_exact(2, 5, 0.5));

    FILE* f = std::fopen("T_vs_width.csv", "w");
    std::fprintf(f, "w_nm,T\n");
    for (int i = 0; i <= 300; ++i) {
        double w = 0.1 + (1.2-0.1)*i/300;
        std::fprintf(f, "%.4f,%.6e\n", w, T_exact(2, 5, w));
    }
    std::fclose(f);
    std::printf("wrote T_vs_width.csv (exponential sensitivity -> STM)\n");
    return 0;
}
