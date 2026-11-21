// Week 13 (Physical Chemistry 2) - Crystal geometry of cubic lattices
//   1) cell volumes, nearest neighbours and packing fractions of SC, BCC, FCC
//   2) Miller indices from intercepts
//   3) interplanar spacing d_hkl = a / sqrt(h^2 + k^2 + l^2)
//   4) Bragg's law example from the lecture: {111} at 2theta = 22.4 deg, lambda = 154 pm
// Build: g++ -O2 -std=c++17 wk13_crystal_geometry.cpp -o geom
#include <cstdio>
#include <cmath>
#include <vector>
#include <numeric>
#include <algorithm>
#include <string>
#include <array>
static double det3(const double A[3][3]) {
    return A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1])
         - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0])
         + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
}
int main() {
    const double PI = std::acos(-1.0);
    const char* names[3] = {"SC", "BCC", "FCC"};
    const double L[3][3][3] = {
        {{1, 0, 0}, {0, 1, 0}, {0, 0, 1}},
        {{-.5, .5, .5}, {.5, -.5, .5}, {.5, .5, -.5}},
        {{0, .5, .5}, {.5, 0, .5}, {.5, .5, 0}}};
    std::printf("1) Cubic lattices (conventional cube edge a = 1)\n");
    for (int n = 0; n < 3; ++n) {
        double Vp = std::fabs(det3(L[n]));
        double dnn = 1e9; int z = 0;
        std::vector<double> d;
        for (int i = -3; i <= 3; ++i) for (int j = -3; j <= 3; ++j) for (int k = -3; k <= 3; ++k) {
            double x = i * L[n][0][0] + j * L[n][1][0] + k * L[n][2][0];
            double y = i * L[n][0][1] + j * L[n][1][1] + k * L[n][2][1];
            double w = i * L[n][0][2] + j * L[n][1][2] + k * L[n][2][2];
            double r = std::sqrt(x * x + y * y + w * w);
            if (r > 1e-9) d.push_back(r);
        }
        dnn = *std::min_element(d.begin(), d.end());
        for (double r : d) if (std::fabs(r - dnn) < 1e-9) ++z;
        double rr = dnn / 2, pf = 4.0 / 3.0 * PI * rr * rr * rr / Vp;
        std::printf("   %-3s: V_prim = %.4f a^3, points per cube = %.0f, z = %2d, d_nn = %.4f a, packing fraction = %.4f\n",
                    names[n], Vp, 1 / Vp, z, dnn, pf);
    }
    std::printf("\n2) Miller indices from intercepts (0 means parallel to that axis)\n");
    // intercepts as rationals p/q; reciprocal = q/p; clear denominators
    const int ic[6][3][2] = {{{3,1},{2,1},{2,1}}, {{1,1},{1,1},{1,1}}, {{1,1},{0,1},{0,1}},
                             {{1,2},{1,1},{0,1}}, {{2,1},{3,1},{6,1}}, {{1,1},{-1,1},{0,1}}};
    for (auto& t : ic) {
        long num[3], den[3];
        for (int i = 0; i < 3; ++i) {
            if (t[i][0] == 0) { num[i] = 0; den[i] = 1; }
            else { num[i] = t[i][1]; den[i] = t[i][0]; if (den[i] < 0) { num[i] = -num[i]; den[i] = -den[i]; } }
        }
        long l = 1; for (int i = 0; i < 3; ++i) l = std::lcm(l, den[i]);
        long h[3], g = 0;
        for (int i = 0; i < 3; ++i) { h[i] = num[i] * (l / den[i]); g = std::gcd(g, std::labs(h[i])); }
        for (int i = 0; i < 3; ++i) h[i] /= g;
        std::printf("   intercepts (%g, %g, %g) -> (%ld %ld %ld)\n",
                    t[0][0] ? double(t[0][0]) / t[0][1] : INFINITY, t[1][0] ? double(t[1][0]) / t[1][1] : INFINITY,
                    t[2][0] ? double(t[2][0]) / t[2][1] : INFINITY, h[0], h[1], h[2]);
    }
    std::printf("\n3) Interplanar spacing in a cubic lattice\n");
    const int H[8][3] = {{1,0,0},{1,1,0},{1,1,1},{2,0,0},{2,1,0},{2,1,1},{2,2,0},{3,1,1}};
    for (auto& h : H)
        std::printf("   (%d%d%d)  d = %.5f a\n", h[0], h[1], h[2], 1 / std::sqrt(double(h[0]*h[0] + h[1]*h[1] + h[2]*h[2])));
    std::printf("\n4) Bragg's law example (lecture slide 13)\n");
    double lam = 154.0, tth = 22.4;
    double d111 = lam / (2 * std::sin(tth / 2 * PI / 180));
    std::printf("   d111 = %.1f pm, a = sqrt(3) d111 = %.1f pm\n", d111, std::sqrt(3.0) * d111);
}
