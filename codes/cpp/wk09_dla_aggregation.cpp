// Wk09 — Diffusion- and reaction-limited aggregation; Smoluchowski coagulation
// Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
//
// (1) 2D lattice particle-cluster aggregation with sticking probability alpha
//     (alpha = 1: DLA, d_f ~ 1.71; alpha << 1: RLA, denser). d_f from N ~ Rg^d_f.
//     Lecture values 1.45 / 1.55 (2D) refer to cluster-cluster aggregation.
// (2) Smoluchowski, constant kernel: c_s = c0 tau^(s-1)/(1+tau)^(s+1), tau = k c0 t/2
//
// Build:  g++ -O2 -std=c++17 wk09_dla_aggregation.cpp -o wk09_dla_aggregation
#include <cstdio>
#include <cmath>
#include <vector>
#include <random>

std::mt19937_64 rng(9);

double grow(int Npart, double alpha, double& RgOut) {
    const int L = 801, c = L / 2;
    std::vector<char> g(L * L, 0);
    auto at = [&](int x, int y) -> char& { return g[(c + x) * L + (c + y)]; };
    std::uniform_real_distribution<double> uni(0, 1);
    std::uniform_int_distribution<int> dir(0, 3);
    const int DX[4] = {1, -1, 0, 0}, DY[4] = {0, 0, 1, -1};
    at(0, 0) = 1;
    double rmax = 1, sum2 = 0;
    std::vector<double> lnN, lnR;
    for (int n = 1; n < Npart; ++n) {
        bool stuck = false;
        while (!stuck) {
            double th = 2 * M_PI * uni(rng);
            int x = (int)std::lround((rmax + 5) * std::cos(th)), y = (int)std::lround((rmax + 5) * std::sin(th));
            while (true) {
                int d = dir(rng);
                if (at(x + DX[d], y + DY[d])) continue;          // cannot step onto the cluster
                x += DX[d]; y += DY[d];
                double r2 = double(x) * x + double(y) * y;
                if (r2 > (2 * rmax + 20) * (2 * rmax + 20)) break;
                if (r2 > (rmax + 3) * (rmax + 3)) continue;
                if ((at(x + 1, y) || at(x - 1, y) || at(x, y + 1) || at(x, y - 1)) && uni(rng) < alpha) {
                    at(x, y) = 1; sum2 += r2; rmax = std::max(rmax, std::sqrt(r2)); stuck = true;
                    int N = n + 1;
                    if (N >= 200) { lnN.push_back(std::log((double)N)); lnR.push_back(0.5 * std::log(sum2 / N)); }
                    break;
                }
            }
        }
    }
    RgOut = std::sqrt(sum2 / Npart);
    double mx = 0, my = 0; int m = lnN.size();
    for (int i = 0; i < m; ++i) { mx += lnR[i]; my += lnN[i]; }
    mx /= m; my /= m;
    double sxy = 0, sxx = 0;
    for (int i = 0; i < m; ++i) { sxy += (lnR[i] - mx) * (lnN[i] - my); sxx += (lnR[i] - mx) * (lnR[i] - mx); }
    return sxy / sxx;
}

int main() {
    std::printf("(1) 2D lattice particle-cluster aggregation\n");
    double alphas[2] = {1.0, 0.1};
    int Ns[2] = {2500, 10000};
    for (int N : Ns) for (double a : alphas) {
        double Rg, df = grow(N, a, Rg);
        std::printf("    alpha = %4.2f, N = %5d:  Rg = %6.1f,  d_f = %.2f\n", a, N, Rg, df);
    }
    std::printf("    reference: Witten-Sander DLA d_f = 1.71 (2D); larger N lands within scatter of it\n\n");

    const int Smax = 400; const double k = 1, c0 = 1, dt = 1e-3, tend = 10;
    std::vector<double> c(Smax + 1, 0.0), k1, k2, k3, k4, tmp(Smax + 1);
    c[1] = c0;
    auto rhs = [&](const std::vector<double>& y) {
        std::vector<double> out(Smax + 1, 0.0); double tot = 0;
        for (int s = 1; s <= Smax; ++s) tot += y[s];
        for (int s = 2; s <= Smax; ++s) { double a = 0; for (int i = 1; i < s; ++i) a += y[i] * y[s - i]; out[s] = 0.5 * k * a; }
        for (int s = 1; s <= Smax; ++s) out[s] -= k * y[s] * tot;
        return out;
    };
    for (int n = 0; n < (int)std::lround(tend / dt); ++n) {
        k1 = rhs(c);
        for (int s = 0; s <= Smax; ++s) tmp[s] = c[s] + dt / 2 * k1[s]; k2 = rhs(tmp);
        for (int s = 0; s <= Smax; ++s) tmp[s] = c[s] + dt / 2 * k2[s]; k3 = rhs(tmp);
        for (int s = 0; s <= Smax; ++s) tmp[s] = c[s] + dt * k3[s]; k4 = rhs(tmp);
        for (int s = 0; s <= Smax; ++s) c[s] += dt / 6 * (k1[s] + 2 * k2[s] + 2 * k3[s] + k4[s]);
    }
    double tau = k * c0 * tend / 2, num = 0, mass = 0;
    for (int s = 1; s <= Smax; ++s) { num += c[s]; mass += s * c[s]; }
    std::printf("(2) Smoluchowski, constant kernel, tau = %.1f\n", tau);
    std::printf("    clusters %.6f (exact %.6f)   mass %.6f   <S> %.4f (exact %.4f)\n", num, c0 / (1 + tau), mass, mass / num, 1 + tau);
    int ss[4] = {1, 2, 5, 10};
    for (int s : ss) std::printf("    c_%-2d numeric %.6e   exact %.6e\n", s, c[s], c0 * std::pow(tau, s - 1) / std::pow(1 + tau, s + 1));
    return 0;
}
