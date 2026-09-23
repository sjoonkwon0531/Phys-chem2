// Wk04 - Hydrogen atom: Bohr model, spectral series, degeneracy
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk04_hydrogen_spectrum.cpp -o wk04_hydrogen_spectrum
// E_n = -13.606/n^2 eV; lambda = hc/dE; degeneracy 2n^2. Writes balmer.csv.
#include <cmath>
#include <cstdio>

const double RY = 13.605693;      // eV
const double HC = 1239.841984;    // eV nm
const double A0 = 0.0529177;      // nm

double E(int n) { return -RY / (n * n); }

int main() {
    std::printf(" n   r_n [nm]    E_n [eV]\n");
    for (int n = 1; n <= 5; ++n)
        std::printf("%2d  %9.4f  %9.4f\n", n, n * n * A0, E(n));

    const char* names[] = {"Lyman", "Balmer", "Paschen", "Brackett", "Pfund"};
    std::printf("\nseries    n2->n1   dE [eV]   lambda [nm]\n");
    for (int n1 = 1; n1 <= 5; ++n1)
        for (int n2 = n1 + 1; n2 <= n1 + 3; ++n2) {
            double dE = E(n2) - E(n1);
            std::printf("%-9s %d->%d   %7.4f   %9.1f\n", names[n1-1], n2, n1, dE, HC / dE);
        }
    std::printf("Balmer limit: %.1f nm\n\n", HC / (0 - E(2)));

    std::printf(" n   #states |n,l,m,s>   2n^2\n");
    for (int n = 1; n <= 4; ++n) {
        int cnt = 0;
        for (int l = 0; l < n; ++l) cnt += 2 * (2 * l + 1);
        std::printf("%2d  %18d  %5d\n", n, cnt, 2 * n * n);
    }
    std::printf("-> shells hold 2, 8, 18, 32 electrons\n");

    FILE* f = std::fopen("balmer.csv", "w");
    std::fprintf(f, "n2,dE_eV,lambda_nm\n");
    for (int n2 = 3; n2 <= 9; ++n2)
        std::fprintf(f, "%d,%.5f,%.2f\n", n2, E(n2) - E(2), HC / (E(n2) - E(2)));
    std::fclose(f);
    std::printf("wrote balmer.csv (H-alpha 656 nm ... series limit 365 nm)\n");
    return 0;
}
