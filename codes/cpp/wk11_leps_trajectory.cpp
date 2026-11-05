// Week 11 - Collinear A + BC on a LEPS surface: barrier location and Polanyi rules
// Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
// Units: eV, Angstrom, amu (time unit 10.18 fs). Sato K = 0.136 -> H3 barrier 0.416 eV at 0.931 A.
// Build: g++ -O2 -std=c++17 wk11_leps_trajectory.cpp -o leps
#include <cmath>
#include <cstdio>
#include <initializer_list>
const double B = 1.942, RE = 0.742, K = 0.136, M = 1.00784, PI = 3.14159265358979323846;
struct QJ { double Q, J, dQ, dJ; };
QJ qj(double r, double D) {
    double e1 = std::exp(-B * (r - RE)), e2 = e1 * e1, c = D / 4 / (1 + K);
    return { c * ((3 + K) * e2 - (2 + 6 * K) * e1), c * ((1 + 3 * K) * e2 - (6 + 2 * K) * e1),
             c * (-2 * B * (3 + K) * e2 + B * (2 + 6 * K) * e1), c * (-2 * B * (1 + 3 * K) * e2 + B * (6 + 2 * K) * e1) };
}
void leps(double r1, double r2, const double* D, double& V, double& g1, double& g2) {
    QJ a = qj(r1, D[0]), b = qj(r2, D[1]), c = qj(r1 + r2, D[2]);
    double S = std::sqrt(0.5 * ((a.J - b.J) * (a.J - b.J) + (b.J - c.J) * (b.J - c.J) + (c.J - a.J) * (c.J - a.J))) + 1e-14;
    double s1 = (2 * a.J - b.J - c.J) / (2 * S), s2 = (2 * b.J - a.J - c.J) / (2 * S), s3 = (2 * c.J - a.J - b.J) / (2 * S);
    V = a.Q + b.Q + c.Q - S;
    g1 = a.dQ + c.dQ - s1 * a.dJ - s3 * c.dJ;
    g2 = b.dQ + c.dQ - s2 * b.dJ - s3 * c.dJ;
}
double barrier(const double* D, double& R1, double& R2) {
    double best = -1e9;
    for (int i = 0; i <= 1200; ++i) {
        double x = -3 + 6.0 * i / 1200, vmin = 1e9, y1 = 0, y2 = 0;
        for (int j = 0; j < 700; ++j) {
            double y = std::fabs(x) + 0.5 + 3.5 * j / 699, V, g1, g2;
            leps((y - x) / 2, (y + x) / 2, D, V, g1, g2);
            if (V < vmin) { vmin = V; y1 = (y - x) / 2; y2 = (y + x) / 2; }
        }
        if (vmin > best) { best = vmin; R1 = y1; R2 = y2; }
    }
    return best + D[1];
}
double trajectory(const double* D, double Et, double Ev, double phase) {
    double mu = M / 2, w = B * std::sqrt(2 * D[1] / mu), A = std::sqrt(2 * Ev / (mu * w * w));
    double r2 = RE + A * std::cos(phase), vr = -A * w * std::sin(phase), vrel = std::sqrt(2 * Et / (2 * M / 3));
    double x[3] = {-4.0, 0.0, r2}, v[3] = {2 * vrel / 3, -vr / 2 - vrel / 3, vr / 2 - vrel / 3}, f[3];
    auto force = [&]() { double V, g1, g2; leps(x[1] - x[0], x[2] - x[1], D, V, g1, g2); f[0] = g1; f[1] = -g1 + g2; f[2] = -g2; };
    force();
    const double dt = 0.002;
    for (double t = 0; t < 15.0; t += dt) {
        for (int i = 0; i < 3; ++i) { v[i] += 0.5 * dt * f[i] / M; x[i] += dt * v[i]; }
        force();
        for (int i = 0; i < 3; ++i) v[i] += 0.5 * dt * f[i] / M;
        double a = x[1] - x[0], b = x[2] - x[1];
        if (a > 5 && b < 2) return 0;
        if (b > 5 && a < 2) return 1;
    }
    return 0.5;
}
int main() {
    const char* names[3] = {"symmetric", "early", "late"};
    double S[3][3] = {{4.746, 4.746, 4.746}, {5.5, 4.746, 4.746}, {4.746, 5.5, 4.746}};
    for (int s = 0; s < 3; ++s) {
        double r1, r2, Eb = barrier(S[s], r1, r2);
        std::printf("%-9s barrier = %.3f eV at r_AB = %.3f, r_BC = %.3f A\n", names[s], Eb, r1, r2);
    }
    double tot[2] = {0.45, 1.30};
    for (int s = 1; s <= 2; ++s)
        for (double f : {0.9, 0.5, 0.1}) {
            double P = 0;
            for (int k = 0; k < 24; ++k) P += trajectory(S[s], tot[s - 1] * f, tot[s - 1] * (1 - f), 2 * PI * k / 24);
            std::printf("  %-5s E_trans = %.2f, E_vib = %.2f eV -> P = %.2f\n", names[s], tot[s - 1] * f, tot[s - 1] * (1 - f), P / 24);
        }
    return 0;
}
