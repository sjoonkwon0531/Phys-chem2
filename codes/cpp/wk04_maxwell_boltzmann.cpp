// Wk04 - Kinetic model & Maxwell-Boltzmann distribution
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk04_maxwell_boltzmann.cpp -o wk04_maxwell_boltzmann
// f(v) = 4pi (M/2piRT)^{3/2} v^2 exp(-Mv^2/2RT). Writes maxwell.csv.
#include <cmath>
#include <cstdio>
#include <initializer_list>

const double R = 8.314462618;

double fspeed(double v, double M, double T) {
    double a = M / (2 * M_PI * R * T);
    return 4 * M_PI * std::pow(a, 1.5) * v * v * std::exp(-M * v * v / (2 * R * T));
}

int main() {
    const double M = 0.0280134, T = 298.15;    // N2
    const int N = 60001;
    const double vmax = 3000.0, h = vmax / (N - 1);

    double s0 = 0, s1 = 0, s2 = 0;             // trapezoid moments
    for (int k = 0; k < N; ++k) {
        double v = k * h, f = fspeed(v, M, T);
        double w = (k == 0 || k == N - 1) ? 0.5 : 1.0;
        s0 += w * f; s1 += w * v * f; s2 += w * v * v * f;
    }
    s0 *= h; s1 *= h; s2 *= h;

    double vmp = std::sqrt(2 * R * T / M);
    double vmean = std::sqrt(8 * R * T / (M_PI * M));
    double vrms = std::sqrt(3 * R * T / M);
    std::printf("N2 at 298 K:\n");
    std::printf("  int f dv = %.6f (-> 1)\n", s0);
    std::printf("  v_mp = %.1f, v_mean = %.1f (num %.1f), v_rms = %.1f (num %.1f) m/s\n",
                vmp, vmean, s1, vrms, std::sqrt(s2));
    std::printf("  <KE>/mol = %.1f J = 3/2 RT = %.1f J\n", 0.5 * M * s2, 1.5 * R * T);
    std::printf("  ratios 1 : %.4f : %.4f (theory 1 : 1.1284 : 1.2247)\n\n",
                vmean / vmp, vrms / vmp);

    FILE* f = std::fopen("maxwell.csv", "w");
    std::fprintf(f, "v,f100,f298,f1000\n");
    for (int k = 0; k <= 300; ++k) {
        double v = 2500.0 * k / 300;
        std::fprintf(f, "%.1f,%.6e,%.6e,%.6e\n", v,
                     fspeed(v, M, 100), fspeed(v, M, 298.15), fspeed(v, M, 1000));
    }
    std::fclose(f);
    std::printf("wrote maxwell.csv (N2 at 100/298/1000 K)\n\n");

    std::printf("DOF f -> Cv = f/2 R:\n");
    for (int fd : {3, 5, 7})
        std::printf("  f = %d: Cv = %.2f J/mol K\n", fd, fd / 2.0 * R);
    std::printf("-> H2's Cv(T) steps 3/2R -> 5/2R -> 7/2R (quantum freeze-out)\n");
    return 0;
}
