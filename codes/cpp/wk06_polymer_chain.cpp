// Wk06 - Macromolecules: molar-mass averages, random coils, entropic elasticity
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk06_polymer_chain.cpp -o wk06_polymer_chain
// Mn, Mw, Mz, D; FJC <R^2> = N l^2, Rg^2 = N l^2/6; tetrahedral F^2 = 2.
#include <cmath>
#include <cstdio>
#include <vector>
#include <random>
#include <array>
#include <initializer_list>

const double KB = 1.380649e-23;
std::mt19937_64 rng(6);
std::normal_distribution<double> gauss(0.0, 1.0);

std::array<double, 3> unit3() {
    std::array<double, 3> v{gauss(rng), gauss(rng), gauss(rng)};
    double n = std::sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    for (auto& c : v) c /= n;
    return v;
}

int main() {
    // (1) molar-mass averages
    {
        double N[2] = {1, 1}, M[2] = {10, 100}, s0 = 0, s1 = 0, s2 = 0, s3 = 0;
        for (int i = 0; i < 2; ++i) { s0 += N[i]; s1 += N[i]*M[i]; s2 += N[i]*M[i]*M[i]; s3 += N[i]*M[i]*M[i]*M[i]; }
        std::printf("blend (equal numbers of 10 & 100 kg/mol): Mn = %.1f, Mw = %.1f, Mz = %.1f, D = %.3f\n",
                    s1/s0, s2/s1, s3/s2, (s2/s1)/(s1/s0));
    }
    std::printf("Schulz-Flory, M0 = 100 g/mol:\n   p      Mn       Mw       Mz      D    1+p\n");
    for (double p : {0.90, 0.99, 0.999}) {
        double s0 = 0, s1 = 0, s2 = 0, s3 = 0, w = 1 - p;
        for (int i = 1; i <= 200000; ++i) {
            double M = 100.0 * i;
            s0 += w; s1 += w*M; s2 += w*M*M; s3 += w*M*M*M;
            w *= p;
        }
        std::printf("  %.3f  %7.0f  %7.0f  %7.0f  %.3f  %.3f\n", p, s1/s0, s2/s1, s3/s2, (s2/s1)/(s1/s0), 1 + p);
    }

    // (2) freely jointed chain Monte Carlo, 3D and 1D
    const int N = 100, M = 20000;
    std::uniform_int_distribution<int> coin(0, 1);
    for (int dim : {3, 1}) {
        double R2 = 0, Rg2 = 0;
        std::vector<std::array<double, 3>> r(N + 1);
        for (int c = 0; c < M; ++c) {
            r[0] = {0, 0, 0};
            for (int k = 0; k < N; ++k) {
                std::array<double, 3> b = dim == 1 ? std::array<double, 3>{coin(rng) ? 1.0 : -1.0, 0, 0} : unit3();
                for (int d = 0; d < 3; ++d) r[k+1][d] = r[k][d] + b[d];
            }
            double cm[3] = {0, 0, 0};
            for (auto& q : r) for (int d = 0; d < 3; ++d) cm[d] += q[d] / (N + 1);
            double g = 0;
            for (auto& q : r) for (int d = 0; d < 3; ++d) g += (q[d]-cm[d])*(q[d]-cm[d]);
            Rg2 += g / (N + 1);
            for (int d = 0; d < 3; ++d) R2 += r[N][d]*r[N][d];
        }
        std::printf("%dD FJC: <R^2> = %.2f (N l^2 = %d), Rg^2 = %.2f (N l^2/6 = %.2f)\n",
                    dim, R2/M, N, Rg2/M, N/6.0);
    }
    long S = 0;
    for (int i = 0; i < N; ++i) for (int j = 0; j < N; ++j) S += std::abs(i - j);
    std::printf("direct sum: Rg^2 = %.4f = (l^2/6)(N - 1/N) = %.4f\n", S/(2.0*N*N), (N - 1.0/N)/6);
    for (int n : {0, 10, 20, 30}) {
        double lnP = std::lgamma(N + 1.0) - std::lgamma((N+n)/2 + 1.0) - std::lgamma((N-n)/2 + 1.0) - N*std::log(2.0);
        std::printf("  n = %2d: exact %.5f, Gaussian %.5f\n", n, std::exp(lnP),
                    std::sqrt(2/(M_PI*N))*std::exp(-n*n/(2.0*N)));
    }

    // (3) fixed bond angle (freely rotating chain), cos(gamma) = 1/3
    const int Nb = 200; const double c = 1.0/3, s = std::sqrt(1 - c*c);
    double acc = 0;
    for (int ch = 0; ch < M; ++ch) {
        auto b = unit3(); auto R = b;
        for (int k = 0; k < Nb - 1; ++k) {
            std::array<double, 3> t{gauss(rng), gauss(rng), gauss(rng)};
            double dp = t[0]*b[0] + t[1]*b[1] + t[2]*b[2];
            std::array<double, 3> u{t[0]-dp*b[0], t[1]-dp*b[1], t[2]-dp*b[2]};
            double un = std::sqrt(u[0]*u[0] + u[1]*u[1] + u[2]*u[2]);
            for (int d = 0; d < 3; ++d) { b[d] = c*b[d] + s*u[d]/un; R[d] += b[d]; }
        }
        acc += R[0]*R[0] + R[1]*R[1] + R[2]*R[2];
    }
    std::printf("tetrahedral chain: <R^2>/(N l^2) = %.3f (F^2 = 2)\n", acc/M/Nb);
    std::printf("polyethylene N = 4000, l = 0.154 nm: contour %.0f nm, R_rms = %.1f nm, Rg = %.2f nm\n",
                4000*0.154, std::sqrt(8000.0)*0.154, std::sqrt(4000/3.0)*0.154);

    // (4) entropic restoring force
    const double l = 0.5e-9, T = 298.15;
    for (double x : {0.1, 0.5, 0.9})
        std::printf("nu = %.1f: F = %.2f pN (Hooke %.2f pN)\n", x,
                    KB*T/(2*l)*std::log((1+x)/(1-x))*1e12, x*KB*T/l*1e12);
    return 0;
}
