// Wk09 — Encounter pairs, diffusion control, and the 1D material balance
// Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
//
// (1) k_r/k_d = k_a/(k_a + k_d')
// (2) k_d = 8RT/(3 eta);  Smoluchowski k_d = 4 pi R* (D_A + D_B) N_A
//     Brownian MC around an absorbing sphere vs. 4 pi c0 (t + 2 sqrt(t/pi))  (R* = D = 1)
// (3) dc/dt = D c'' - v c' - k c, finite differences vs. the analytic pulse
//
// Build:  g++ -O2 -std=c++17 wk09_diffusion_transport.cpp -o wk09_diffusion_transport
#include <cstdio>
#include <cmath>
#include <vector>
#include <random>
#include <algorithm>

int main() {
    const double R = 8.314462618, NA = 6.02214076e23;
    std::mt19937_64 rng(9);
    std::normal_distribution<double> gauss(0.0, 1.0);
    std::uniform_real_distribution<double> uni(0.0, 1.0);

    std::printf("(1) k_r/k_d = k_a/(k_a + k_d')\n");
    double kas[3] = {1e12, 1e10, 1e8};
    for (double ka : kas) std::printf("    k_a = %.0e, k_d' = 1e10:  k_r/k_d = %.4f\n", ka, ka / (ka + 1e10));

    const double T = 298.15;
    const char* sol[4] = {"hexane", "water", "ethylene glycol", "glycerol"};
    double eta[4] = {0.300e-3, 0.890e-3, 16.06e-3, 0.934};
    std::printf("\n(2) k_d = 8RT/(3 eta) at 298.15 K\n");
    for (int i = 0; i < 4; ++i)
        std::printf("    %-16s eta = %8.3f mPa s   k_d = %.2e dm^3 mol^-1 s^-1\n", sol[i], eta[i] * 1e3, 8 * R * T / (3 * eta[i]) * 1e3);
    std::printf("    Smoluchowski, R* = 0.4 nm, D = 4e-9 m^2/s: k_d = %.3e dm^3 mol^-1 s^-1\n",
                4 * M_PI * 0.4e-9 * 4e-9 * NA * 1e3);

    // Brownian dynamics
    const int Np = 100000, nstep = 1500; const double Rout = 8.0, dt = 1e-3;
    std::vector<double> X(Np), Y(Np), Z(Np); std::vector<char> alive(Np, 1);
    for (int i = 0; i < Np; ++i) {
        double ux = gauss(rng), uy = gauss(rng), uz = gauss(rng), un = std::sqrt(ux*ux + uy*uy + uz*uz);
        double r = std::cbrt(1 + (Rout*Rout*Rout - 1) * uni(rng));
        X[i] = r*ux/un; Y[i] = r*uy/un; Z[i] = r*uz/un;
    }
    double c0 = Np / (4.0/3.0 * M_PI * (Rout*Rout*Rout - 1));
    long cap = 0; double sq = std::sqrt(2 * dt);
    std::printf("\n    Brownian MC (R* = 1, D = 1)\n      t      MC      theory   MC/theory\n");
    for (int st = 1; st <= nstep; ++st) {
        for (int i = 0; i < Np; ++i) {
            if (!alive[i]) continue;
            double ro = std::sqrt(X[i]*X[i] + Y[i]*Y[i] + Z[i]*Z[i]);
            X[i] += sq * gauss(rng); Y[i] += sq * gauss(rng); Z[i] += sq * gauss(rng);
            double rr = std::sqrt(X[i]*X[i] + Y[i]*Y[i] + Z[i]*Z[i]);
            bool hit = rr < 1.0;
            if (!hit) hit = uni(rng) < std::exp(-(ro - 1) * (rr - 1) / dt);   // Brownian-bridge correction
            if (hit) { alive[i] = 0; ++cap; continue; }
            if (rr > Rout) { double f = (2*Rout - rr) / rr; X[i] *= f; Y[i] *= f; Z[i] *= f; }
        }
        if (st % 250 == 0) {
            double t = st * dt, th = 4 * M_PI * c0 * (t + 2 * std::sqrt(t / M_PI));
            std::printf("    %5.2f   %6ld   %8.1f    %6.3f\n", t, cap, th, cap / th);
        }
    }

    // (3) material balance
    const double D = 1e-9, v = 2e-6, k = 50.0, L = 1.2e-4; const int nx = 1601;
    double dx = L / (nx - 1), h = 0.2 * dx * dx / D, t0 = 1e-3, tend = 0.03;
    std::vector<double> x(nx), c(nx), cn(nx);
    auto pulse = [&](double xx, double t) {
        return std::exp(-(xx - v*t)*(xx - v*t) / (4*D*t)) / (2*std::sqrt(M_PI*D*t)) * std::exp(-k*t); };
    for (int i = 0; i < nx; ++i) { x[i] = -L/2 + i*dx; c[i] = pulse(x[i], t0); }
    double t = t0;
    while (t < tend - 1e-15) {
        double hh = std::min(h, tend - t);
        for (int i = 1; i < nx - 1; ++i)
            cn[i] = c[i] + hh * (D*(c[i+1] - 2*c[i] + c[i-1])/(dx*dx) - v*(c[i+1] - c[i-1])/(2*dx) - k*c[i]);
        cn[0] = cn[nx-1] = 0; c.swap(cn); t += hh;
    }
    double mass = 0, mean = 0, var = 0, err = 0, peak = 0;
    for (int i = 0; i < nx; ++i) { mass += c[i]*dx; mean += x[i]*c[i]*dx; }
    mean /= mass;
    for (int i = 0; i < nx; ++i) {
        var += (x[i]-mean)*(x[i]-mean)*c[i]*dx;
        double a = pulse(x[i], t); err = std::max(err, std::fabs(c[i]-a)); peak = std::max(peak, a);
    }
    var /= mass;
    std::printf("\n(3) material balance, t = %.0f ms\n", t*1e3);
    std::printf("    max |FD - analytic|/peak = %.2e\n", err/peak);
    std::printf("    amount %.5f  e^-kt = %.5f\n    mean %.4f um  vt = %.4f um\n    var %.4f um^2  2Dt = %.4f um^2\n",
                mass, std::exp(-k*t), mean*1e6, v*t*1e6, var*1e12, 2*D*t*1e12);
    std::printf("    sqrt(D/k) = %.2f um\n", std::sqrt(D/k)*1e6);
    return 0;
}
