// Week 11 - 1D monatomic and diatomic chains: dispersion and phonon heat capacity
// Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
// Finite periodic chain eigenvalues are compared with the analytic dispersion.
// For a periodic chain the dynamical matrix is block-circulant, so each allowed
// k = 2 pi p / N gives a 2x2 (diatomic) Hermitian matrix that we solve directly,
// and we cross-check with a Jacobi diagonalisation of the full real matrix.
// Build: g++ -O2 -std=c++17 wk11_phonon_chain.cpp -o phonon
#include <cmath>
#include <cstdio>
#include <initializer_list>
#include <vector>
#include <algorithm>
const double PI = 3.14159265358979323846;
using Mat = std::vector<std::vector<double>>;
std::vector<double> jacobiEig(Mat A) {           // symmetric eigenvalues (cyclic Jacobi)
    int n = A.size();
    for (int sweep = 0; sweep < 100; ++sweep) {
        double off = 0;
        for (int p = 0; p < n; ++p) for (int q = p + 1; q < n; ++q) off += A[p][q] * A[p][q];
        if (off < 1e-22) break;
        for (int p = 0; p < n; ++p) for (int q = p + 1; q < n; ++q) {
            if (std::fabs(A[p][q]) < 1e-300) continue;
            double th = 0.5 * std::atan2(2 * A[p][q], A[q][q] - A[p][p]), c = std::cos(th), s = std::sin(th);
            for (int k = 0; k < n; ++k) { double akp = A[k][p], akq = A[k][q]; A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq; }
            for (int k = 0; k < n; ++k) { double apk = A[p][k], aqk = A[q][k]; A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk; }
        }
    }
    std::vector<double> e(n); for (int i = 0; i < n; ++i) e[i] = A[i][i];
    return e;
}
Mat chainMatrix(const std::vector<double>& m, const std::vector<double>& s) {
    int n = m.size(); Mat D(n, std::vector<double>(n, 0));
    for (int i = 0; i < n; ++i) { int j = (i + 1) % n; D[i][i] += s[i]; D[j][j] += s[i]; D[i][j] -= s[i]; D[j][i] -= s[i]; }
    for (int i = 0; i < n; ++i) for (int j = 0; j < n; ++j) D[i][j] /= std::sqrt(m[i] * m[j]);
    return D;
}
void omegaDi(double k, double m1, double m2, double k1, double k2, double& ac, double& op) {
    double S = k1 + k2, inv = 1 / m1 + 1 / m2, sn = std::sin(k / 2);
    double root = std::sqrt(std::fmax(S * S * inv * inv - 16 * k1 * k2 * sn * sn / (m1 * m2), 0));
    ac = std::sqrt(std::fmax(0.5 * (S * inv - root), 0)); op = std::sqrt(0.5 * (S * inv + root));
}
int main() {
    int N = 20; double m1 = 1, m2 = 2, k1 = 1, k2 = 1;
    std::vector<double> mm, ss;
    for (int i = 0; i < N; ++i) { mm.push_back(m1); mm.push_back(m2); ss.push_back(k1); ss.push_back(k2); }
    auto ev = jacobiEig(chainMatrix(mm, ss));
    std::vector<double> wn, wa;
    for (double e : ev) wn.push_back(std::sqrt(std::fabs(e)));
    for (int p = 0; p < N; ++p) { double ac, op; omegaDi(2 * PI * p / N, m1, m2, k1, k2, ac, op); wa.push_back(ac); wa.push_back(op); }
    std::sort(wn.begin(), wn.end()); std::sort(wa.begin(), wa.end());
    double err = 0; for (int i = 0; i < 2 * N; ++i) err = std::fmax(err, std::fabs(wn[i] - wa[i]));
    std::printf("Diatomic chain, %d cells: %zu modes, max |numeric - analytic| = %.2e\n", N, wn.size(), err);
    double ac, op; omegaDi(PI, m1, m2, k1, k2, ac, op);
    std::printf("Zone boundary: acoustic %.4f, optical %.4f, gap %.4f\n", ac, op, op - ac);
    // monatomic heat capacity (hbar = k = 1, kappa = m = a = 1)
    int Nb = 2000;
    for (double T : {0.05, 0.2, 0.5, 1.0, 2.0, 5.0}) {
        double C = 0;
        for (int p = 1; p < Nb; ++p) {
            double w = 2 * std::fabs(std::sin(PI * p / Nb)), x = w / T;
            C += (x < 1e-8) ? 1.0 : x * x * std::exp(x) / std::pow(std::expm1(x), 2);
        }
        std::printf("  T = %4.2f: C/Nk = %.4f\n", T, C / (Nb - 1));
    }
    double c = 2.99792458e10, amu = 1.66053906660e-27, w = 2 * PI * c * 520.2, m = 28.0855 * amu;
    std::printf("Si effective spring = %.0f N/m\n", m * w * w / 4);
    return 0;
}
