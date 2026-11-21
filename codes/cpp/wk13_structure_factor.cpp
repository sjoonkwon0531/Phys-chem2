// Week 13 (Physical Chemistry 2) - Structure factor and extinction rules
//   S(hkl) = sum_j f_j exp(-i 2 pi (h x_j + k y_j + l z_j)), I ~ |S|^2
//   bases in the conventional cubic cell: SC, BCC, FCC, diamond, NaCl, CsCl; and KCl with f_K = f_Cl
//   ionic form factors at zero angle = number of electrons: Na+ 10, Cl- 18, K+ 18, Cs+ 54
// Build: g++ -O2 -std=c++17 wk13_structure_factor.cpp -o sf
#include <cstdio>
#include <cmath>
#include <complex>
#include <vector>
#include <array>
#include <string>
struct Atom { double f; double x, y, z; };
using Basis = std::vector<Atom>;
static double absS(const Basis& b, int h, int k, int l) {
    const double PI = std::acos(-1.0);
    std::complex<double> s = 0;
    for (auto& a : b) s += a.f * std::exp(std::complex<double>(0, -2 * PI * (h * a.x + k * a.y + l * a.z)));
    return std::abs(s);
}
int main() {
    const double F = 0.5, Q = 0.25;
    const double fcc[4][3] = {{0,0,0},{0,F,F},{F,0,F},{F,F,0}};
    Basis sc = {{1,0,0,0}}, bcc = {{1,0,0,0},{1,F,F,F}}, f, dia, nacl, kcl, cscl = {{54,0,0,0},{18,F,F,F}};
    for (auto& p : fcc) {
        f.push_back({1, p[0], p[1], p[2]});
        dia.push_back({1, p[0], p[1], p[2]}); dia.push_back({1, p[0]+Q, p[1]+Q, p[2]+Q});
        nacl.push_back({10, p[0], p[1], p[2]}); nacl.push_back({18, p[0]+F, p[1], p[2]});
        kcl.push_back({18, p[0], p[1], p[2]}); kcl.push_back({18, p[0]+F, p[1], p[2]});
    }
    std::vector<std::pair<std::string, Basis>> all = {{"SC", sc}, {"BCC", bcc}, {"FCC", f}, {"diamond", dia}, {"NaCl", nacl}, {"CsCl", cscl}};
    const int H[14][3] = {{1,0,0},{1,1,0},{1,1,1},{2,0,0},{2,1,0},{2,1,1},{2,2,0},{2,2,1},{3,0,0},{3,1,0},{3,1,1},{2,2,2},{3,2,0},{3,2,1}};
    std::printf("   hkl   N     SC     BCC     FCC diamond    NaCl    CsCl\n");
    for (auto& h : H) {
        std::printf("   %d%d%d %3d", h[0], h[1], h[2], h[0]*h[0] + h[1]*h[1] + h[2]*h[2]);
        for (auto& b : all) std::printf(" %7.2f", absS(b.second, h[0], h[1], h[2]));
        std::printf("\n");
    }
    std::printf("\n   Allowed N = h2+k2+l2 (first 8):\n");
    for (auto& b : all) {
        std::printf("   %-8s:", b.first.c_str());
        int cnt = 0;
        for (int N = 1; N <= 40 && cnt < 8; ++N) {
            bool ok = false;
            for (int h = 0; h <= 6 && !ok; ++h) for (int k = 0; k <= 6 && !ok; ++k) for (int l = 0; l <= 6 && !ok; ++l)
                if (h*h + k*k + l*l == N && absS(b.second, h, k, l) > 1e-6) ok = true;
            if (ok) { std::printf(" %d", N); ++cnt; }
        }
        std::printf("\n");
    }
    std::printf("\n   KCl (f_K = f_Cl = 18) versus NaCl\n");
    const int K[5][3] = {{1,1,1},{2,0,0},{2,2,0},{3,1,1},{2,2,2}};
    for (auto& h : K)
        std::printf("   (%d%d%d): |S_NaCl| = %5.1f  |S_KCl| = %5.1f\n", h[0], h[1], h[2],
                    absS(nacl, h[0], h[1], h[2]), absS(kcl, h[0], h[1], h[2]));
}
