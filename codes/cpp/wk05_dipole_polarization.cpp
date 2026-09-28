// Wk05 - Dipole moments, polarizability & the Debye equation
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk05_dipole_polarization.cpp -o wk05_dipole
// Vector addition; Debye plot fit; Clausius-Mossotti -> n(CCl4) ~ 1.46.
#include <cmath>
#include <cstdio>
#include <vector>
#include <initializer_list>

const double EPS0 = 8.8541878128e-12, KB = 1.380649e-23;
const double NA = 6.02214076e23, DEBYE = 3.33564e-30;

int main() {
    // (1) dichlorobenzene isomers: mu_res = 2 mu1 cos(theta/2)
    const double mu1 = 1.57;   // D
    struct Iso { const char* n; double th, obs; };
    std::printf("isomer  angle  mu_calc [D]  mu_obs [D]\n");
    for (Iso s : {Iso{"ortho", 60, 2.25}, Iso{"meta", 120, 1.48}, Iso{"para", 180, 0.0}})
        std::printf("%-6s  %4.0f   %8.2f   %8.2f\n", s.n, s.th,
                    2 * mu1 * std::cos(s.th * M_PI / 360), s.obs);

    // (2) Debye plot: least-squares on Pm vs 1/T
    const double mu_w = 1.85 * DEBYE, alpha = 4 * M_PI * EPS0 * 1.48e-30;
    std::vector<double> x, y;
    for (int i = 0; i <= 8; ++i) {
        double T = 300 + 25.0 * i;
        x.push_back(1 / T);
        y.push_back(NA / (3 * EPS0) * (alpha + mu_w * mu_w / (3 * KB * T)));
    }
    double n = x.size(), sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (size_t i = 0; i < x.size(); ++i) { sx += x[i]; sy += y[i]; sxx += x[i]*x[i]; sxy += x[i]*y[i]; }
    double slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    double inter = (sy - slope * sx) / n;
    std::printf("\nDebye plot: mu = %.3f D (input 1.850), alpha' = %.3f e-30 m^3 (input 1.480)\n",
                std::sqrt(9 * EPS0 * KB * slope / NA) / DEBYE,
                3 * EPS0 * inter / NA / (4 * M_PI * EPS0) * 1e30);

    // (3) Clausius-Mossotti for CCl4
    double xc = 4 * M_PI * 1590 * NA * 10.5e-30 / (3 * 0.1538);
    double eps_r = (1 + 2 * xc) / (1 - xc);
    std::printf("CCl4: eps_r = %.3f, n = %.3f (experimental 1.4607)\n", eps_r, std::sqrt(eps_r));
    std::printf("water: eps_r(static) = 78 but n^2 = 1.77 - dipoles cannot follow light\n");
    return 0;
}
