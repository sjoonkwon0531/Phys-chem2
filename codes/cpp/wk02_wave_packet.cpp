// Wk02 - Gaussian wave packet: minimum uncertainty & dispersion
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk02_wave_packet.cpp -o wk02_wave_packet
// hbar = m = 1. Verifies sigma_x*sigma_p = 1/2; writes dispersion.csv.
#include <cmath>
#include <cstdio>
#include <initializer_list>

int main() {
    const double hbar = 1.0, m = 1.0, p0 = 2.0;
    const int N = 200001;

    std::printf("eps    sigma_x    sigma_p    product\n");
    for (double eps : {0.5, 1.0, 2.0, 3.0}) {
        double sx2 = 0, sp2 = 0, nx = 0, np_ = 0;
        for (int i = 0; i < N; ++i) {                    // quadrature
            double x = -30.0 + 60.0*i/(N-1);
            double Px = std::exp(-x*x/(2*eps))/std::sqrt(2*M_PI*eps);
            sx2 += x*x*Px; nx += Px;
            double p = -10.0 + 24.0*i/(N-1);
            double Pp = std::exp(-2*eps*(p-p0)*(p-p0)/(hbar*hbar));
            sp2 += (p-p0)*(p-p0)*Pp; np_ += Pp;
        }
        double sx = std::sqrt(sx2/nx), sp = std::sqrt(sp2/np_);
        std::printf("%4.1f  %9.5f  %9.5f  %9.5f\n", eps, sx, sp, sx*sp/hbar);
    }

    const double eps = 1.0;
    FILE* f = std::fopen("dispersion.csv", "w");
    std::fprintf(f, "t,sigma_x,sigma_p\n");
    for (int i = 0; i <= 300; ++i) {
        double t = 10.0*i/300;
        double sx = std::sqrt(eps + hbar*hbar*t*t/(4*m*m*eps));
        std::fprintf(f, "%.4f,%.6f,%.6f\n", t, sx, hbar/(2*std::sqrt(eps)));
    }
    std::fclose(f);
    std::printf("wrote dispersion.csv  (sigma_x grows, sigma_p constant)\n");

    // electron localized to 0.1 nm doubles its width in ~0.3 fs
    const double hSI = 1.054571817e-34, me = 9.1093837015e-31, epsSI = 1e-20;
    std::printf("electron 0.1 nm packet doubling time: %.2e s\n",
                2*std::sqrt(3.0)*me*epsSI/hSI);
    return 0;
}
