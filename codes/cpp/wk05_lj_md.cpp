// Wk05 - 2D Lennard-Jones MD: gas vs liquid & the RDF
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk05_lj_md.cpp -o wk05_lj_md
// Velocity Verlet, reduced units, periodic box; writes rdf_hot/cold.csv.
#include <cmath>
#include <cstdio>
#include <vector>
#include <random>

const int N = 100;
const double L = 12.0, RC2 = 9.0, DT = 0.004;

struct Sys { std::vector<double> x, y, vx, vy, fx, fy; };

double forces(Sys& s) {
    std::fill(s.fx.begin(), s.fx.end(), 0.0);
    std::fill(s.fy.begin(), s.fy.end(), 0.0);
    double pot = 0;
    for (int i = 0; i < N - 1; ++i)
        for (int j = i + 1; j < N; ++j) {
            double dx = s.x[i] - s.x[j], dy = s.y[i] - s.y[j];
            dx -= L * std::round(dx / L); dy -= L * std::round(dy / L);
            double r2 = dx * dx + dy * dy;
            if (r2 > RC2) continue;
            double inv2 = 1 / r2, inv6 = inv2 * inv2 * inv2;
            double f = 24 * inv2 * inv6 * (2 * inv6 - 1);
            s.fx[i] += f * dx; s.fy[i] += f * dy;
            s.fx[j] -= f * dx; s.fy[j] -= f * dy;
            pot += 4 * (inv6 * inv6 - inv6);
        }
    return pot;
}

void rdf(const Sys& s, const char* fname) {
    const int nb = 60; const double rmax = 5.0, dr = rmax / nb;
    std::vector<double> h(nb, 0.0);
    for (int i = 0; i < N - 1; ++i)
        for (int j = i + 1; j < N; ++j) {
            double dx = s.x[i] - s.x[j], dy = s.y[i] - s.y[j];
            dx -= L * std::round(dx / L); dy -= L * std::round(dy / L);
            double r = std::sqrt(dx * dx + dy * dy);
            if (r < rmax) h[std::min(nb - 1, int(r / dr))] += 1;
        }
    FILE* f = std::fopen(fname, "w");
    std::fprintf(f, "r,g\n");
    double peak = 0, rpk = 0;
    for (int k = 0; k < nb; ++k) {
        double rc = (k + 0.5) * dr;
        double ideal = 2 * M_PI * rc * dr * (N * (N - 1) / 2.0) / (L * L) * 2;
        double g = h[k] / ideal;
        if (g > peak) { peak = g; rpk = rc; }
        std::fprintf(f, "%.4f,%.4f\n", rc, g);
    }
    std::fclose(f);
    std::printf("  wrote %s (peak g = %.2f at r* = %.2f; 2^(1/6) = 1.12)\n", fname, peak, rpk);
}

int main() {
    std::mt19937 rng(7);
    std::normal_distribution<double> gauss(0, 1);
    for (double Tt : {1.5, 0.45}) {
        Sys s{std::vector<double>(N), std::vector<double>(N),
              std::vector<double>(N), std::vector<double>(N),
              std::vector<double>(N), std::vector<double>(N)};
        int side = int(std::ceil(std::sqrt(double(N))));
        for (int i = 0; i < N; ++i) {
            s.x[i] = (i % side + 0.5) * L / side;
            s.y[i] = (i / side + 0.5) * L / side;
            s.vx[i] = std::sqrt(Tt) * gauss(rng);
            s.vy[i] = std::sqrt(Tt) * gauss(rng);
        }
        forces(s);
        for (int step = 0; step < 3000; ++step) {
            for (int i = 0; i < N; ++i) { s.vx[i] += 0.5 * DT * s.fx[i]; s.vy[i] += 0.5 * DT * s.fy[i]; }
            for (int i = 0; i < N; ++i) {
                s.x[i] = std::fmod(s.x[i] + DT * s.vx[i] + L, L);
                s.y[i] = std::fmod(s.y[i] + DT * s.vy[i] + L, L);
            }
            forces(s);
            double ke = 0;
            for (int i = 0; i < N; ++i) { s.vx[i] += 0.5 * DT * s.fx[i]; s.vy[i] += 0.5 * DT * s.fy[i]; ke += 0.5 * (s.vx[i]*s.vx[i] + s.vy[i]*s.vy[i]); }
            if (step < 1500) {                       // gentle thermostat
                double lam = std::sqrt(1 + 0.02 * (Tt * N / ke - 1));
                for (int i = 0; i < N; ++i) { s.vx[i] *= lam; s.vy[i] *= lam; }
            }
        }
        std::printf("T* = %.2f:\n", Tt);
        rdf(s, Tt > 1 ? "rdf_hot.csv" : "rdf_cold.csv");
    }
    std::printf("-> cooling the same LJ system condenses it: liquid shells appear in g(r)\n");
    return 0;
}
