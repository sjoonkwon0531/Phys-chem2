// Week 13 (Physical Chemistry 2) - Powder XRD pattern of cubic crystals (Cu K-alpha1)
//   2theta from lambda = 2 d sin(theta), d = a / sqrt(h2+k2+l2)
//   I ~ |S|^2 x multiplicity x LP, LP = (1 + cos^2 2theta)/(sin^2 theta cos theta)
//   teaching form factor f = Z exp(-B s^2), s = sin(theta)/lambda, B = 2 A^2
//   Scherrer: tau = K lambda / (beta cos theta), K = 0.9
// Build: g++ -O2 -std=c++17 wk13_powder_xrd.cpp -o xrd
#include <cstdio>
#include <cmath>
#include <complex>
#include <vector>
#include <map>
#include <array>
#include <algorithm>
#include <string>
struct Atom { double Z, x, y, z; };
struct Peak { double tth, d, I; int mult; };
const double PI = std::acos(-1.0), LAM = 1.5406;
std::map<std::array<int,3>, Peak> pattern(double a, const std::vector<Atom>& basis, double B = 2.0, double tmax = 100) {
    std::map<std::array<int,3>, Peak> pk;
    for (int h = -6; h <= 6; ++h) for (int k = -6; k <= 6; ++k) for (int l = -6; l <= 6; ++l) {
        if (!h && !k && !l) continue;
        double d = a / std::sqrt(double(h*h + k*k + l*l)), s = LAM / (2 * d);
        if (s >= 1) continue;
        double th = std::asin(s);
        if (2 * th * 180 / PI > tmax) continue;
        std::complex<double> S = 0;
        for (auto& at : basis)
            S += at.Z * std::exp(-B * std::pow(s / LAM, 2)) * std::exp(std::complex<double>(0, -2*PI*(h*at.x + k*at.y + l*at.z)));
        if (std::abs(S) < 1e-6) continue;
        std::array<int,3> key = {std::abs(h), std::abs(k), std::abs(l)};
        std::sort(key.begin(), key.end(), std::greater<int>());
        double lp = (1 + std::pow(std::cos(2*th), 2)) / (std::pow(std::sin(th), 2) * std::cos(th));
        auto it = pk.find(key);
        if (it == pk.end()) pk[key] = {2 * th * 180 / PI, d, std::norm(S) * lp, 1};
        else { it->second.I += std::norm(S) * lp; it->second.mult += 1; }
    }
    return pk;
}
int main() {
    const double F = 0.5;
    const double fcc[4][3] = {{0,0,0},{0,F,F},{F,0,F},{F,F,0}};
    std::vector<Atom> cu, fe = {{26,0,0,0},{26,F,F,F}}, si, nacl;
    for (auto& p : fcc) {
        cu.push_back({29, p[0], p[1], p[2]});
        si.push_back({14, p[0], p[1], p[2]}); si.push_back({14, p[0]+.25, p[1]+.25, p[2]+.25});
        nacl.push_back({11, p[0], p[1], p[2]}); nacl.push_back({17, p[0]+F, p[1], p[2]});
    }
    struct Cr { std::string n; double a; std::vector<Atom> b; };
    std::vector<Cr> cr = {{"Cu (FCC)", 3.61, cu}, {"a-Fe (BCC)", 2.87, fe}, {"Si (diamond)", 5.43, si}, {"NaCl (rock salt)", 5.63, nacl}};
    double tth111 = 0;
    for (auto& c : cr) {
        auto pk = pattern(c.a, c.b);
        std::vector<std::pair<std::array<int,3>, Peak>> v(pk.begin(), pk.end());
        std::sort(v.begin(), v.end(), [](auto& x, auto& y) { return x.second.tth < y.second.tth; });
        double Imax = 0; for (auto& p : v) Imax = std::max(Imax, p.second.I);
        double s1 = std::pow(std::sin(v[0].second.tth / 2 * PI / 180), 2);
        if (c.n == "Cu (FCC)") tth111 = v[0].second.tth;
        std::printf("%s, a = %.2f A, lambda = %.4f A\n", c.n.c_str(), c.a, LAM);
        for (size_t i = 0; i < v.size() && i < 7; ++i) {
            auto& p = v[i];
            std::printf("   (%d%d%d)  2theta = %6.2f deg  d = %.4f A  mult = %2d  I = %5.1f  sin2 ratio = %.3f\n",
                        p.first[0], p.first[1], p.first[2], p.second.tth, p.second.d, p.second.mult,
                        100 * p.second.I / Imax, std::pow(std::sin(p.second.tth / 2 * PI / 180), 2) / s1);
        }
        std::printf("\n");
    }
    std::printf("Scherrer crystallite size, Cu (111), K = 0.9\n");
    for (double w : {0.1, 0.3, 1.0})
        std::printf("   FWHM = %.1f deg -> tau = %.1f nm\n", w, 0.9 * LAM / (w * PI / 180 * std::cos(tth111 / 2 * PI / 180)) / 10);
}
