// Wk06 - Chemical kinetics I: rate laws, initial rates, integrated rate laws
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk06_rate_laws.cpp -o wk06_rate_laws
#include <cmath>
#include <cstdio>
#include <vector>
#include <initializer_list>

void linfit(const std::vector<double>& x, const std::vector<double>& y, double& s, double& b) {
    double n = x.size(), sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (size_t i = 0; i < x.size(); ++i) { sx += x[i]; sy += y[i]; sxx += x[i]*x[i]; sxy += x[i]*y[i]; }
    s = (n*sxy - sx*sy)/(n*sxx - sx*sx); b = (sy - s*sx)/n;
}

int main() {
    // (1) 2 N2O5 -> 4 NO2 + O2
    for (double al : {0.0, 0.25, 0.5, 1.0}) std::printf("alpha = %.2f: P/P0 = %.3f\n", al, 1 + 1.5*al);

    // (2) method of initial rates: 2 I + Ar -> I2 + Ar
    const double I0[4] = {1e-5, 2e-5, 4e-5, 6e-5}, Ar[3] = {1e-3, 5e-3, 1e-2};
    const double v0[3][4] = {{8.70e-4, 3.48e-3, 1.39e-2, 3.13e-2},
                             {4.35e-3, 1.74e-2, 6.96e-2, 1.57e-1},
                             {8.69e-3, 3.47e-2, 1.38e-1, 3.13e-1}};
    std::vector<double> lI, lAr, lk;
    for (double c : I0) lI.push_back(std::log10(c));
    double ksum = 0;
    for (int j = 0; j < 3; ++j) {
        std::vector<double> lv;
        for (int i = 0; i < 4; ++i) { lv.push_back(std::log10(v0[j][i])); ksum += v0[j][i]/(I0[i]*I0[i]*Ar[j]); }
        double a, b; linfit(lI, lv, a, b);
        lAr.push_back(std::log10(Ar[j])); lk.push_back(b);
        std::printf("[Ar] = %4.1f mM: slope a = %.3f, log k' = %.3f\n", Ar[j]*1e3, a, b);
    }
    double bo, lkr; linfit(lAr, lk, bo, lkr);
    std::printf("order in Ar b = %.3f; k = %.2e dm^6 mol^-2 s^-1 (12-point mean)\n", bo, ksum/12);

    // (3) successive half-lives
    for (int n = 0; n <= 2; ++n) {
        std::printf("order %d half-lives:", n);
        for (double A : {1.0, 0.5, 0.25})
            std::printf(" %.3f", n == 0 ? A/2 : n == 1 ? std::log(2.0) : 1/A);
        std::printf("\n");
    }

    // (4) azomethane at 600 K
    std::vector<double> t{0, 1000, 2000, 3000, 4000}, p{10.9, 7.63, 5.32, 3.71, 2.59}, lp;
    for (double q : p) lp.push_back(std::log(q/p[0]));
    double s, b; linfit(t, lp, s, b);
    std::printf("azomethane: k = %.2e s^-1, t1/2 = %.0f s, tau = %.0f s\n", -s, std::log(2.0)/-s, 1/-s);

    // (5) A + B -> P, unequal concentrations: RK4 vs integrated form
    const double kr = 2, A0 = 1, B0 = 1.5, dt = 1e-3;
    double A = A0, B = B0;
    auto f = [&](double a, double bb) { return -kr*a*bb; };
    for (int i = 0; i < 1000; ++i) {
        double k1 = f(A, B), k2 = f(A + dt/2*k1, B + dt/2*k1);
        double k3 = f(A + dt/2*k2, B + dt/2*k2), k4 = f(A + dt*k3, B + dt*k3);
        double d = dt*(k1 + 2*k2 + 2*k3 + k4)/6;
        A += d; B += d;
    }
    std::printf("A + B -> P: ln ratio = %.6f, (B0-A0) k t = %.6f\n", std::log((B/B0)/(A/A0)), (B0-A0)*kr);
    return 0;
}
