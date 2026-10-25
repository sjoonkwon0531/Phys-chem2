// Wk09 — Transition state theory (Eyring equation)
// Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
//
// (1) q_vib = 1/(1 - exp(-h nu/kT)) vs. the high-T limit kT/(h nu)
// (2) k = kappa (kT/h) exp(dS/R) exp(-dH/RT)
// (3) atom + atom: TST rate equals collision theory N_A pi r^2 (8kT/pi mu)^(1/2)
//
// Build:  g++ -O2 -std=c++17 wk09_eyring_tst.cpp -o wk09_eyring_tst
#include <cstdio>
#include <cmath>

const double KB = 1.380649e-23, H = 6.62607015e-34, NA = 6.02214076e23, R = 8.314462618;
const double HBAR = H / (2 * M_PI), AMU = 1.66053906660e-27, C2 = 1.438776877e-2;

double Lam(double m, double T) { return H / std::sqrt(2 * M_PI * m * KB * T); }

int main() {
    double T = 298.15;
    std::printf("(1) q_vib at %.2f K\n    nu      h nu/kT    exact      kT/h nu    error\n", T);
    int wns[6] = {2000, 1000, 300, 100, 30, 10};
    for (int wn : wns) {
        double x = wn * 100 * C2 / T, ex = 1 / (1 - std::exp(-x)), ap = 1 / x;
        std::printf("    %5d   %7.3f   %9.4f   %9.4f   %+7.1f %%\n", wn, x, ex, ap, 100 * (ap - ex) / ex);
    }
    std::printf("    kT/h = %.4e s^-1\n\n", KB * T / H);

    std::printf("(2) Eyring, kappa = 1\n");
    double dHs[3] = {60e3, 60e3, 80e3}, dSs[3] = {-50, 0, -50};
    for (int i = 0; i < 3; ++i)
        std::printf("    dH = %4.0f kJ/mol, dS = %+5.0f J/K/mol: k = %.3e dm^3 mol^-1 s^-1\n", dHs[i] / 1e3, dSs[i],
                    KB * T / H * std::exp(dSs[i] / R) * std::exp(-dHs[i] / (R * T)));
    // Arrhenius slope between 280 and 320 K
    auto kE = [](double TT) { return KB * TT / H * std::exp(-50 / R) * std::exp(-60e3 / (R * TT)); };
    double Ea = -R * (std::log(kE(320)) - std::log(kE(280))) / (1 / 320.0 - 1 / 280.0);
    std::printf("    Arrhenius Ea of the Eyring k(T) = %.2f kJ/mol (dH + RT = %.2f)\n\n", Ea / 1e3, (60e3 + R * 300) / 1e3);

    double mA = 1.008 * AMU, mB = 35.45 * AMU, r = 0.30e-9, mu = mA * mB / (mA + mB), I = mu * r * r;
    std::printf("(3) atom + atom, r = 0.30 nm\n     T [K]    TST              collision theory   ratio\n");
    double Ts[2] = {300, 1000};
    for (double TT : Ts) {
        double p0 = 1e5, Vm = R * TT / p0;
        double Kbar = NA * std::pow(Lam(mA, TT), 3) * std::pow(Lam(mB, TT), 3) / (std::pow(Lam(mA + mB, TT), 3) * Vm)
                      * (2 * I * KB * TT / (HBAR * HBAR));
        double ktst = KB * TT / H * (R * TT / p0) * Kbar;
        double kct = NA * M_PI * r * r * std::sqrt(8 * KB * TT / (M_PI * mu));
        std::printf("    %6.0f   %.6e     %.6e       %.12f\n", TT, ktst * 1e3, kct * 1e3, ktst / kct);
    }
    return 0;
}
