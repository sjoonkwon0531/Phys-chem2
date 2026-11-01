// Wk10 — Cahn-Hilliard spinodal decomposition (semi-implicit Fourier spectral)
// Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
//
// f(phi) = chi phi(1-phi) + phi ln phi + (1-phi) ln(1-phi),  mu = f'(phi) - 2 kappa lap(phi)
// d phi/dt = lap(mu);  linear theory: R(q) = -q^2 (f'' + 2 kappa q^2),
// q_m^2 = -f''/(4 kappa), lambda_m = 2 pi/q_m.
// Checks: early dominant wavelength, mass conservation, late-stage phases vs binodal.
//
// Build:  g++ -O2 -std=c++17 wk10_cahn_hilliard.cpp -o wk10_cahn_hilliard
#include <cstdio>
#include <cmath>
#include <complex>
#include <vector>
#include <random>
#include <algorithm>
typedef std::complex<double> cd;

void fft1(std::vector<cd>& a, bool inv) {            // iterative radix-2
    int n = a.size();
    for (int i = 1, j = 0; i < n; ++i) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) std::swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        double ang = 2 * M_PI / len * (inv ? 1 : -1);
        cd wl(std::cos(ang), std::sin(ang));
        for (int i = 0; i < n; i += len) {
            cd w(1);
            for (int j = 0; j < len / 2; ++j) {
                cd u = a[i + j], v = a[i + j + len / 2] * w;
                a[i + j] = u + v; a[i + j + len / 2] = u - v; w *= wl;
            }
        }
    }
    if (inv) for (auto& x : a) x /= n;
}
void fft2(std::vector<cd>& f, int N, bool inv) {
    std::vector<cd> row(N);
    for (int i = 0; i < N; ++i) { for (int j = 0; j < N; ++j) row[j] = f[i * N + j]; fft1(row, inv); for (int j = 0; j < N; ++j) f[i * N + j] = row[j]; }
    for (int j = 0; j < N; ++j) { for (int i = 0; i < N; ++i) row[i] = f[i * N + j]; fft1(row, inv); for (int i = 0; i < N; ++i) f[i * N + j] = row[i]; }
}

int main() {
    const int N = 128; const double kappa = 1.0;
    std::vector<double> K2(N * N), K(N * N);
    for (int i = 0; i < N; ++i) for (int j = 0; j < N; ++j) {
        double kx = 2 * M_PI * (i < N / 2 ? i : i - N) / N, ky = 2 * M_PI * (j < N / 2 ? j : j - N) / N;
        K2[i * N + j] = kx * kx + ky * ky; K[i * N + j] = std::sqrt(K2[i * N + j]);
    }
    std::mt19937_64 rng(10);
    std::normal_distribution<double> g(0, 1);
    auto run = [&](double chi, double phi0, double tend, double dt, double amp, std::vector<double>& phi) {
        phi.assign(N * N, 0);
        for (auto& p : phi) p = phi0 + amp * g(rng);
        double A = 2 * chi;
        std::vector<cd> ph(N * N), mh(N * N);
        int steps = (int)std::lround(tend / dt);
        for (int n = 0; n < steps; ++n) {
            for (int s = 0; s < N * N; ++s) {
                double p = std::min(std::max(phi[s], 1e-9), 1 - 1e-9);
                ph[s] = phi[s]; mh[s] = std::log(p / (1 - p)) + chi * (1 - 2 * p);
            }
            fft2(ph, N, false); fft2(mh, N, false);
            for (int s = 0; s < N * N; ++s) ph[s] = (ph[s] - dt * K2[s] * (mh[s] - A * ph[s])) / (1 + dt * K2[s] * (A + 2 * kappa * K2[s]));
            fft2(ph, N, true);
            for (int s = 0; s < N * N; ++s) phi[s] = ph[s].real();
        }
    };
    auto peak = [&](const std::vector<double>& phi) {
        double mean = 0; for (double p : phi) mean += p; mean /= N * N;
        std::vector<cd> f(N * N); for (int s = 0; s < N * N; ++s) f[s] = phi[s] - mean;
        fft2(f, N, false);
        int nb = N / 2; std::vector<double> S(nb, 0), c(nb, 0);
        double dq = 2 * M_PI / N;
        for (int s = 0; s < N * N; ++s) { int b = (int)std::lround(K[s] / dq); if (b > 0 && b < nb) { S[b] += std::norm(f[s]); c[b] += 1; } }
        int best = 1; for (int b = 1; b < nb; ++b) if (S[b] / std::max(c[b], 1.0) > S[best] / std::max(c[best], 1.0)) best = b;
        return best * dq;
    };
    std::printf("(1) early dominant wavelength vs linear theory\n    chi   phi0   lambda_m theory   measured\n");
    double cases[3][2] = {{3.0, 0.5}, {2.6, 0.5}, {3.0, 0.35}};
    std::vector<double> phi;
    for (auto& cs : cases) {
        double chi = cs[0], p0 = cs[1], fpp = 1 / (p0 * (1 - p0)) - 2 * chi, qm = std::sqrt(-fpp / 4);
        double Rm = qm * qm * (-fpp - 2 * qm * qm), tl = std::log(50.0) / Rm;
        run(chi, p0, tl, 0.05, 1e-3, phi);
        std::printf("    %3.1f   %4.2f      %7.2f        %7.2f\n", chi, p0, 2 * M_PI / qm, 2 * M_PI / peak(phi));
    }
    run(3.0, 0.5, 400, 0.1, 1e-2, phi);
    std::vector<double> sorted = phi; std::sort(sorted.begin(), sorted.end());
    double mean = 0; for (double p : phi) mean += p; mean /= N * N;
    std::printf("\n(2) chi = 3, t = 400: mean phi = %.6f, phases %.3f / %.3f (binodal 0.071 / 0.929), domain 2pi/q_peak = %.1f\n",
                mean, sorted[(size_t)(0.02 * N * N)], sorted[(size_t)(0.98 * N * N)], 2 * M_PI / peak(phi));
    return 0;
}
