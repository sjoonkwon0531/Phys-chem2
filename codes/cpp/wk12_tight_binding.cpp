// Week 12 - 1D tight-binding band: E(k) = eps0 - 2t cos(ka)
// Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
// Ring of N sites diagonalized with Jacobi rotations and compared with the Bloch result.
// Build: g++ -O2 -std=c++17 wk12_tight_binding.cpp -o tb
#include <cmath>
#include <cstdio>
#include <vector>
#include <algorithm>
#include <initializer_list>
const double PI = 3.14159265358979323846, HBAR2_ME = 7.619964;
using Mat = std::vector<std::vector<double>>;
std::vector<double> jacobi(Mat A) {
    int n = A.size();
    for (int sw = 0; sw < 100; ++sw) {
        double off = 0; for (int p = 0; p < n; ++p) for (int q = p + 1; q < n; ++q) off += A[p][q] * A[p][q];
        if (off < 1e-24) break;
        for (int p = 0; p < n; ++p) for (int q = p + 1; q < n; ++q) {
            if (std::fabs(A[p][q]) < 1e-300) continue;
            double th = 0.5 * std::atan2(2 * A[p][q], A[q][q] - A[p][p]), c = std::cos(th), s = std::sin(th);
            for (int k = 0; k < n; ++k) { double a = A[k][p], b = A[k][q]; A[k][p] = c * a - s * b; A[k][q] = s * a + c * b; }
            for (int k = 0; k < n; ++k) { double a = A[p][k], b = A[q][k]; A[p][k] = c * a - s * b; A[q][k] = s * a + c * b; }
        }
    }
    std::vector<double> e(n); for (int i = 0; i < n; ++i) e[i] = A[i][i]; std::sort(e.begin(), e.end()); return e;
}
int main() {
    int N = 12; double t = 1.0;
    Mat H(N, std::vector<double>(N, 0));
    for (int n = 0; n < N; ++n) { H[n][(n + 1) % N] = -t; H[(n + 1) % N][n] = -t; }
    auto e = jacobi(H); std::vector<double> a;
    for (int p = 0; p < N; ++p) a.push_back(-2 * t * std::cos(2 * PI * p / N));
    std::sort(a.begin(), a.end());
    double err = 0; for (int i = 0; i < N; ++i) err = std::fmax(err, std::fabs(e[i] - a[i]));
    std::printf("N = %d ring: max error %.2e, band width %.4f t\n", N, err, e.back() - e.front());
    std::printf("m*/m_e (t = 1 eV, a = 2.5 A) = %.3f\n", HBAR2_ME / (2 * 1.0 * 2.5 * 2.5));
    for (double f : {0.25, 0.5, 1.0, 1.5, 2.0}) std::printf("f = %.2f: band energy per site %+.4f t\n", f, -(4 / PI) * std::sin(PI * f / 2));
    return 0;
}
