// Week 3 - Quantum Harmonic Oscillator (Hermite polynomials)
// Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
// psi_n(y) = (1/pi)^(1/4)/sqrt(2^n n!) H_n(y) exp(-y^2/2), E_n = (n+1/2) hbar*w
// Build: g++ -O2 -std=c++17 wk03_sho.cpp -o wk03_sho
#include <cstdio>
#include <cmath>
#include <vector>

double hermiteH(int n, double y) {           // H_{n+1} = 2y H_n - 2n H_{n-1}
    if (n == 0) return 1.0;
    if (n == 1) return 2.0 * y;
    double Hm = 1.0, Hc = 2.0 * y;
    for (int k = 1; k < n; ++k) {
        double Hn = 2.0 * y * Hc - 2.0 * k * Hm;
        Hm = Hc; Hc = Hn;
    }
    return Hc;
}

double factorial(int n) { double f = 1; for (int i = 2; i <= n; ++i) f *= i; return f; }

double psiSHO(int n, double y) {             // hbar = m = omega = 1
    double norm = 1.0 / std::sqrt(std::pow(2.0, n) * factorial(n)) * std::pow(M_PI, -0.25);
    return norm * hermiteH(n, y) * std::exp(-y * y / 2.0);
}

// trapezoid rule on a uniform grid
template <typename F>
double integrate(F f, double a, double b, int N) {
    double h = (b - a) / N, s = 0.5 * (f(a) + f(b));
    for (int i = 1; i < N; ++i) s += f(a + i * h);
    return s * h;
}

int main() {
    const double A = 12.0; const int NG = 240000;

    // 1) Hermite orthogonality: int e^{-y^2} H_m H_n dy = 2^n n! sqrt(pi) delta_mn
    std::printf("Hermite orthogonality (normalized):\n");
    for (int m = 0; m < 4; ++m) {
        for (int n = 0; n < 4; ++n) {
            double I = integrate([&](double y) {
                return std::exp(-y * y) * hermiteH(m, y) * hermiteH(n, y); }, -A, A, NG);
            std::printf(" %+.6f", I / (std::pow(2.0, n) * factorial(n) * std::sqrt(M_PI)));
        }
        std::printf("\n");
    }

    // 2) Normalization & virial theorem
    for (int n : {0, 1, 5, 10}) {
        double I = integrate([&](double y) { double p = psiSHO(n, y); return p * p; }, -A, A, NG);
        std::printf("<psi_%d|psi_%d> = %.6f\n", n, n, I);
    }
    for (int n : {0, 3}) {
        double V = integrate([&](double y) { double p = psiSHO(n, y); return 0.5 * y * y * p * p; }, -A, A, NG);
        std::printf("n=%d: <V> = %.5f (E_n/2 = %.5f)\n", n, V, (n + 0.5) / 2.0);
    }

    // 3) Classically forbidden probability beyond y_tp = sqrt(2n+1)
    for (int n : {0, 1, 5}) {
        double ytp = std::sqrt(2.0 * n + 1.0);
        double P = 2.0 * integrate([&](double y) { double p = psiSHO(n, y); return p * p; }, ytp, A, NG);
        std::printf("n=%d: y_tp = %.4f, P(forbidden) = %.4f\n", n, ytp, P);
    }
    return 0;
}
