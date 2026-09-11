// Week 3 - Spherical Harmonics & the Hydrogen Atom (a0 = 1)
// Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
// psi_nlm = R_nl(r) Y_l^m(theta,phi), E_n = -13.6057/n^2 eV
// Build: g++ -O2 -std=c++17 wk03_hydrogen.cpp -o wk03_hydrogen
#include <cstdio>
#include <cmath>
#include <complex>
#include <vector>

using cd = std::complex<double>;

double factorial(int n) { double f = 1; for (int i = 2; i <= n; ++i) f *= i; return f; }

// Associated Legendre P_l^m(x), m >= 0, Condon-Shortley phase
double assocLegendre(int l, int m, double x) {
    double Pmm = 1.0;
    if (m > 0) {
        double somx2 = std::sqrt((1.0 - x) * (1.0 + x)), fact = 1.0;
        for (int i = 0; i < m; ++i) { Pmm *= -fact * somx2; fact += 2.0; }
    }
    if (l == m) return Pmm;
    double Pm1 = x * (2 * m + 1) * Pmm;
    if (l == m + 1) return Pm1;
    double Pll = 0.0;
    for (int ll = m + 2; ll <= l; ++ll) {
        Pll = (x * (2 * ll - 1) * Pm1 - (ll + m - 1) * Pmm) / (ll - m);
        Pmm = Pm1; Pm1 = Pll;
    }
    return Pll;
}

cd Ylm(int l, int m, double theta, double phi) {
    int am = std::abs(m);
    double N = std::sqrt((2 * l + 1) / (4.0 * M_PI) * factorial(l - am) / factorial(l + am));
    cd Y = N * assocLegendre(l, am, std::cos(theta)) * std::exp(cd(0.0, am * phi));
    if (m < 0) Y = std::pow(-1.0, m) * std::conj(Y);
    return Y;
}

// Associated Laguerre L_k^(alpha)(x) by recurrence
double laguerreL(int k, int alpha, double x) {
    if (k == 0) return 1.0;
    double Lm = 1.0, Lc = 1.0 + alpha - x;
    for (int i = 1; i < k; ++i) {
        double Ln = ((2 * i + 1 + alpha - x) * Lc - (i + alpha) * Lm) / (i + 1);
        Lm = Lc; Lc = Ln;
    }
    return Lc;
}

// Hydrogen radial function (a0 = 1)
double Rnl(int n, int l, double r) {
    double rho = 2.0 * r / n;
    double N = std::sqrt(std::pow(2.0 / n, 3) * factorial(n - l - 1) / (2.0 * n * factorial(n + l)));
    return N * std::pow(rho, l) * std::exp(-rho / 2.0) * laguerreL(n - l - 1, 2 * l + 1, rho);
}

int main() {
    // 1) Y_l^m orthonormality on the sphere (2D trapezoid rule)
    const int NT = 1200, NP = 1200;
    auto innerY = [&](int l1, int m1, int l2, int m2) {
        double dth = M_PI / NT, dph = 2.0 * M_PI / NP;
        cd sum = 0.0;
        for (int i = 0; i <= NT; ++i) {
            double th = i * dth, wt = (i == 0 || i == NT) ? 0.5 : 1.0;
            cd rowsum = 0.0;
            for (int j = 0; j <= NP; ++j) {
                double ph = j * dph, wp = (j == 0 || j == NP) ? 0.5 : 1.0;
                rowsum += wp * std::conj(Ylm(l1, m1, th, ph)) * Ylm(l2, m2, th, ph);
            }
            sum += wt * rowsum * std::sin(th);
        }
        return sum * dth * dph;
    };
    std::printf("<Y_1^0|Y_1^0> = %.6f\n", innerY(1, 0, 1, 0).real());
    std::printf("<Y_2^1|Y_2^1> = %.6f\n", innerY(2, 1, 2, 1).real());
    std::printf("<Y_1^0|Y_2^0> = %+.2e\n", innerY(1, 0, 2, 0).real());

    // 2) Radial normalization: int R_nl^2 r^2 dr = 1  (uniform trapezoid)
    const double RMAX = 120.0; const int NR = 400000;
    auto radInt = [&](auto f) {
        double h = RMAX / NR, s = 0.5 * (f(1e-12) + f(RMAX));
        for (int i = 1; i < NR; ++i) s += f(i * h);
        return s * h;
    };
    int pairs[4][2] = {{1, 0}, {2, 0}, {2, 1}, {3, 2}};
    for (auto& p : pairs) {
        int n = p[0], l = p[1];
        double I = radInt([&](double r) { double R = Rnl(n, l, r); return R * R * r * r; });
        std::printf("int R_%d%d^2 r^2 dr = %.6f\n", n, l, I);
    }

    // 3) <r>_1s = 1.5 a0, virial <V>_1s = 2 E_1 = -1 Ha
    double rExp = radInt([&](double r) { double R = Rnl(1, 0, r); return r * R * R * r * r; });
    double vExp = radInt([&](double r) { double R = Rnl(1, 0, r); return -1.0 / r * R * R * r * r; });
    std::printf("<r>_1s = %.5f a0 (exact 1.5), <V>_1s = %.5f Ha (virial: -1)\n", rExp, vExp);

    // 4) Energy levels & degeneracy
    const double Ry = 13.605693;
    for (int n = 1; n <= 3; ++n) std::printf("E_%d = %.4f eV\n", n, -Ry / (n * n));
    for (int n = 1; n <= 4; ++n) {
        int g = 0; for (int l = 0; l < n; ++l) g += 2 * l + 1;
        std::printf("n=%d: degeneracy = %d = n^2\n", n, g);
    }
    return 0;
}
