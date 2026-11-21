// Week 13 (Physical Chemistry 2) - Reciprocal lattice and Brillouin zones
//   1) b1 = 2 pi (a2 x a3) / (a1 . a2 x a3) etc.; check b_i . a_j = 2 pi delta_ij
//   2) reciprocal of SC is SC, of BCC is FCC, of FCC is BCC
//   3) BZ volume = (2 pi)^3 / V_cell and number of faces of the first BZ
//   4) 2D Wigner-Seitz cell by half-plane clipping
//   5) Fourier coefficients of a 1D periodic Gaussian density
// Build: g++ -O2 -std=c++17 wk13_reciprocal_lattice.cpp -o recip
#include <cstdio>
#include <cmath>
#include <vector>
#include <array>
using V = std::array<double, 3>;
static V cross(V a, V b) { return {a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]}; }
static double dot(V a, V b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
static V sub(V a, V b) { return {a[0]-b[0], a[1]-b[1], a[2]-b[2]}; }
static double nrm(V a) { return std::sqrt(dot(a, a)); }
int main() {
    const double PI = std::acos(-1.0);
    const char* names[3] = {"SC", "BCC", "FCC"};
    std::array<std::array<V, 3>, 3> L = {{
        {{{1,0,0},{0,1,0},{0,0,1}}},
        {{{-.5,.5,.5},{.5,-.5,.5},{.5,.5,-.5}}},
        {{{0,.5,.5},{.5,0,.5},{.5,.5,0}}}}};
    std::printf("1-3) Reciprocal vectors (units of 2pi/a), BZ volume, faces of the first BZ\n");
    for (int n = 0; n < 3; ++n) {
        auto& A = L[n];
        double Vc = dot(A[0], cross(A[1], A[2]));
        std::array<V, 3> B;
        B[0] = cross(A[1], A[2]); B[1] = cross(A[2], A[0]); B[2] = cross(A[0], A[1]);
        double err = 0;
        for (auto& b : B) for (auto& x : b) x *= 2 * PI / Vc;
        for (int i = 0; i < 3; ++i) for (int j = 0; j < 3; ++j)
            err = std::fmax(err, std::fabs(dot(B[i], A[j]) / (2 * PI) - (i == j)));
        double Vbz = std::fabs(dot(B[0], cross(B[1], B[2])));
        std::vector<V> G;
        for (int i = -2; i <= 2; ++i) for (int j = -2; j <= 2; ++j) for (int k = -2; k <= 2; ++k) {
            V g = {i*B[0][0]+j*B[1][0]+k*B[2][0], i*B[0][1]+j*B[1][1]+k*B[2][1], i*B[0][2]+j*B[1][2]+k*B[2][2]};
            if (nrm(g) > 1e-9) G.push_back(g);
        }
        int faces = 0;
        for (auto& g : G) {
            V c = {g[0]/2, g[1]/2, g[2]/2};
            bool ok = true;
            for (auto& h : G) if (nrm(sub(h, g)) > 1e-9 && nrm(sub(c, h)) <= nrm(c) + 1e-9) { ok = false; break; }
            faces += ok;
        }
        std::printf("   %-3s b1 = (%g %g %g), b2 = (%g %g %g), b3 = (%g %g %g); max err %.1e; "
                    "V_BZ*V_cell/(2pi)^3 = %.6f; faces = %d\n", names[n],
                    B[0][0]/(2*PI), B[0][1]/(2*PI), B[0][2]/(2*PI), B[1][0]/(2*PI), B[1][1]/(2*PI), B[1][2]/(2*PI),
                    B[2][0]/(2*PI), B[2][1]/(2*PI), B[2][2]/(2*PI), err, Vbz * std::fabs(Vc) / std::pow(2*PI, 3), faces);
    }
    std::printf("\n4) 2D Wigner-Seitz cells by half-plane clipping\n");
    struct P { double x, y; };
    auto ws = [](P a1, P a2) {
        std::vector<P> poly = {{-10,-10},{10,-10},{10,10},{-10,10}};
        for (int i = -3; i <= 3; ++i) for (int j = -3; j <= 3; ++j) {
            if (!i && !j) continue;
            P T = {i*a1.x + j*a2.x, i*a1.y + j*a2.y};
            double c = (T.x*T.x + T.y*T.y) / 2;
            std::vector<P> nw;
            for (size_t k = 0; k < poly.size(); ++k) {
                P p = poly[k], q = poly[(k+1) % poly.size()];
                double fp = p.x*T.x + p.y*T.y - c, fq = q.x*T.x + q.y*T.y - c;
                if (fp <= 0) nw.push_back(p);
                if (fp * fq < 0) nw.push_back({p.x + (q.x-p.x)*fp/(fp-fq), p.y + (q.y-p.y)*fp/(fp-fq)});
            }
            poly.clear();
            for (auto& q : nw) if (poly.empty() || std::hypot(q.x-poly.back().x, q.y-poly.back().y) > 1e-9) poly.push_back(q);
            if (poly.size() > 1 && std::hypot(poly[0].x-poly.back().x, poly[0].y-poly.back().y) < 1e-9) poly.pop_back();
        }
        return poly;
    };
    struct Case { const char* n; P a1, a2; };
    Case cs[3] = {{"square", {1,0}, {0,1}}, {"hexagonal", {1,0}, {0.5, std::sqrt(3.0)/2}}, {"oblique", {1,0}, {0.3,0.8}}};
    for (auto& c : cs) {
        auto p = ws(c.a1, c.a2);
        double A = 0;
        for (size_t k = 0; k < p.size(); ++k) { auto& u = p[k]; auto& v = p[(k+1) % p.size()]; A += u.x*v.y - v.x*u.y; }
        std::printf("   %-9s: %zu vertices, WS area = %.6f, |a1 x a2| = %.6f\n", c.n, p.size(), std::fabs(A)/2,
                    std::fabs(c.a1.x*c.a2.y - c.a1.y*c.a2.x));
    }
    std::printf("\n5) Fourier coefficients of a 1D Gaussian density (sigma = 0.08 a)\n");
    const int N = 4096; const double sig = 0.08;
    for (int p = 0; p < 6; ++p) {
        double re = 0;
        for (int i = 0; i < N; ++i) {
            double x = double(i) / N, n = 0;
            for (int m = -1; m <= 1; ++m) n += std::exp(-(x-m)*(x-m) / (2*sig*sig));
            n /= std::sqrt(2*PI) * sig;
            re += n * std::cos(2*PI*p*x);
        }
        std::printf("   p = %d: n_p = %+.5f (analytic %.5f)\n", p, re / N, std::exp(-std::pow(2*PI*p*sig, 2) / 2));
    }
}
