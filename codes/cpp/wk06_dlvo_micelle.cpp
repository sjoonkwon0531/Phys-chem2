// Wk06 - Colloid stability (DLVO) and micelle formation
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk06_dlvo_micelle.cpp -o wk06_dlvo_micelle
#include <cmath>
#include <cstdio>
#include <initializer_list>

const double E = 1.602176634e-19, KB = 1.380649e-23, NA = 6.02214076e23;
const double EPS = 78.5 * 8.8541878128e-12, KT = KB * 298.15;

double kappa(double c, int z = 1) { return std::sqrt(2.0*z*z*E*E*1000*NA*c/(EPS*KT)); }

double dlvo(double h, double c, double a = 100e-9, double AH = 2e-20, double phi0 = 0.030, int z = 1) {
    double k = kappa(c, z), g = std::tanh(z*E*phi0/(4*KT));
    return (-AH*a/(12*h) + 64*M_PI*KT*1000*NA*c*a*g*g/(k*k)*std::exp(-k*h)) / KT;
}

double ccc(int z, double gamma = -1, double phi0 = 0.030, double AH = 2e-20) {
    double g = gamma > 0 ? gamma : std::tanh(z*E*phi0/(4*KT));
    double kc = 384*M_PI*EPS*KT*KT*g*g/(std::exp(1.0)*z*z*E*E*AH);
    return kc*kc*EPS*KT/(2.0*z*z*E*E)/(1000*NA);
}

double monomer(double ct, int N) {
    double lo = 0, hi = ct;
    for (int i = 0; i < 200; ++i) {
        double mid = 0.5*(lo + hi);
        if (mid + N*std::pow(mid, N) > ct) hi = mid; else lo = mid;
    }
    return 0.5*(lo + hi);
}

int main() {
    std::printf("1:1 salt    kappa^-1 [nm]   0.304/sqrt(c)\n");
    for (double c : {1e-3, 1e-2, 0.1, 0.15, 0.6})
        std::printf("  %.3f M   %8.3f      %8.3f\n", c, 1e9/kappa(c), 0.304/std::sqrt(c));

    std::printf("\na = 100 nm, A_H = 2e-20 J, phi0 = 30 mV:\n  c [M]   barrier/kT   h [nm]\n");
    for (double c : {1e-3, 1e-2, 3e-2, 0.1, 0.6}) {
        double Um = -1e300, hm = 0;
        for (int i = 0; i < 6000; ++i) {
            double h = 0.1e-9 * std::pow(1000.0, i/5999.0);
            double U = dlvo(h, c);
            if (U > Um) { Um = U; hm = h; }
        }
        if (Um <= 0) std::printf("  %.3f   no barrier -> rapid coagulation\n", c);
        else std::printf("  %.3f   %8.1f    %6.2f\n", c, Um, hm*1e9);
    }

    std::printf("\nccc at phi0 = 30 mV: z=1 %.1f mM, z=2 %.1f mM, z=3 %.2f mM\n",
                ccc(1)*1e3, ccc(2)*1e3, ccc(3)*1e3);
    std::printf("high-potential limit: 1 : 1/%.0f : 1/%.0f (Schulze-Hardy z^-6)\n",
                ccc(1, 1.0)/ccc(2, 1.0), ccc(1, 1.0)/ccc(3, 1.0));

    std::printf("\nfraction micellised:  c_tot    N=3     N=30    N=100\n");
    for (double ct : {0.5, 0.9, 1.0, 1.5, 3.0, 10.0})
        std::printf("                      %5.2f   %.3f   %.3f   %.3f\n", ct,
                    1 - monomer(ct, 3)/ct, 1 - monomer(ct, 30)/ct, 1 - monomer(ct, 100)/ct);
    std::printf("-> large N: nothing, then suddenly micelles (the CMC)\n");
    return 0;
}
