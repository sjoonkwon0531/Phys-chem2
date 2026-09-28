// Wk05 - Van der Waals forces: Keesom, induction, London
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk05_vdw_forces.cpp -o wk05_vdw
// All three attractions share -C/r^6; dispersion usually dominates.
#include <cmath>
#include <cstdio>
#include <initializer_list>

const double EPS0 = 8.8541878128e-12, KB = 1.380649e-23;
const double NA = 6.02214076e23, DEBYE = 3.33564e-30, EV = 1.602176634e-19;
const double T = 298.15;

int main() {
    struct Mol { const char* n; double mu, ap, I; };   // D, 1e-30 m^3, eV
    const double r = 0.40e-9;
    std::printf("pair        C_Keesom  C_induc  C_London [1e-79 Jm^6]  V(0.4nm) kJ/mol\n");
    for (Mol m : {Mol{"Ar", 0, 1.66, 15.76}, Mol{"CH4", 0, 2.60, 12.61},
                  Mol{"HCl", 1.08, 2.63, 12.74}, Mol{"NH3", 1.47, 2.22, 10.07},
                  Mol{"H2O", 1.85, 1.48, 12.62}, Mol{"C6H6", 0, 10.4, 9.24}}) {
        double mu = m.mu * DEBYE, ap = m.ap * 1e-30, I = m.I * EV;
        double f = 4 * M_PI * EPS0;
        double cK = 2 * std::pow(mu, 4) / (3 * f * f * KB * T);
        double cD = 2 * mu * mu * ap / f;
        double cL = 1.5 * ap * ap * I / 2;
        double V = -(cK + cD + cL) / std::pow(r, 6) * NA / 1e3;
        std::printf("%-5s-%-5s %8.2f  %7.2f  %8.2f  %18.2f\n",
                    m.n, m.n, cK * 1e79, cD * 1e79, cL * 1e79, V);
    }
    std::printf("-> benzene: zero dipole yet the largest attraction (polarizability wins)\n");
    std::printf("\nlecture Table 16B.1: ion-ion 1/r 250 | H-bond 20 | ion-dipole 1/r^2 15\n");
    std::printf("dipole-dipole 1/r^3 2 (fixed), 1/r^6 0.3 (rotating) | London 1/r^6 2 kJ/mol\n");
    return 0;
}
