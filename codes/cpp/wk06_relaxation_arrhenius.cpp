// Wk06 - Chemical kinetics II: approach to equilibrium, relaxation, Arrhenius
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk06_relaxation_arrhenius.cpp -o wk06_relaxation_arrhenius
#include <cmath>
#include <cstdio>
#include <initializer_list>

const double R = 8.314462618;

int main() {
    // (1) A <-> B: RK4 vs closed form
    const double kf = 2, kb = 0.5, A0 = 1, dt = 1e-3;
    auto f = [&](double a) { return -kf*a + kb*(A0 - a); };
    double a = A0, maxerr = 0;
    FILE* out = std::fopen("relaxation.csv", "w");
    std::fprintf(out, "t,A,B\n");
    for (int s = 1; s <= 3000; ++s) {
        double k1 = f(a), k2 = f(a + dt/2*k1), k3 = f(a + dt/2*k2), k4 = f(a + dt*k3);
        a += dt*(k1 + 2*k2 + 2*k3 + k4)/6;
        double ex = A0*(kb + kf*std::exp(-(kf+kb)*s*dt))/(kf+kb);
        maxerr = std::fmax(maxerr, std::fabs(a - ex));
        if (s % 30 == 0) std::fprintf(out, "%.3f,%.6f,%.6f\n", s*dt, a, A0 - a);
    }
    std::fclose(out);
    double Aeq = kb*A0/(kf+kb);
    std::printf("max |RK4 - exact| = %.2e; K = %.3f = k/k' = %.3f; tau = %.3f\n",
                maxerr, (A0-Aeq)/Aeq, kf/kb, 1/(kf+kb));

    // (2) temperature jump: water autoprotolysis
    const double Kw = 1.008e-14, tau = 37e-6, K = Kw/55.6;
    double krev = (1/tau)/(K + 2*std::sqrt(Kw)), kfwd = K*krev;
    std::printf("T-jump: k' = %.2e dm^3/mol/s, k = %.2e 1/s (one event per %.0f h)\n",
                krev, kfwd, 1/kfwd/3600);

    // (3) Arrhenius fit (acetaldehyde decomposition, textbook data)
    const double T[8] = {700, 730, 760, 790, 810, 840, 910, 1000};
    const double k[8] = {0.011, 0.035, 0.105, 0.343, 0.789, 2.17, 20.0, 145.0};
    double sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (int i = 0; i < 8; ++i) { double x = 1/T[i], y = std::log(k[i]); sx += x; sy += y; sxx += x*x; sxy += x*y; }
    double slope = (8*sxy - sx*sy)/(8*sxx - sx*sx), icpt = (sy - slope*sx)/8;
    std::printf("Arrhenius: Ea = %.0f kJ/mol, A = %.2e dm^3/mol/s\n", -slope*R/1e3, std::exp(icpt));
    std::printf("doubling per 10 K at 298 K <-> Ea = %.1f kJ/mol\n", std::log(2.0)*R/(1/298.0 - 1/308.0)/1e3);

    // (4) catalysis
    for (double dEa : {5e3, 19e3, 40e3})
        std::printf("dEa = %2.0f kJ/mol -> rate x %.3g\n", dEa/1e3, std::exp(dEa/(R*298)));
    std::printf("wrote relaxation.csv\n");
    return 0;
}
