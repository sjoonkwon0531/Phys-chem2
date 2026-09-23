// Wk04 - Spin-1/2: Pauli algebra, sequential measurement, unitarity
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk04_spin_measurement.cpp -o wk04_spin_measurement
// hbar = 1. 2x2 complex matrices: [Sx,Sy] = i Sz; SG chain; unitary check.
#include <cmath>
#include <cstdio>
#include <complex>
#include <random>
#include <array>

using C = std::complex<double>;
using M2 = std::array<std::array<C, 2>, 2>;

M2 mul(const M2& A, const M2& B) {
    M2 R{};
    for (int i = 0; i < 2; ++i)
        for (int j = 0; j < 2; ++j)
            for (int k = 0; k < 2; ++k) R[i][j] += A[i][k] * B[k][j];
    return R;
}
M2 sub(const M2& A, const M2& B) {
    M2 R{};
    for (int i = 0; i < 2; ++i)
        for (int j = 0; j < 2; ++j) R[i][j] = A[i][j] - B[i][j];
    return R;
}
double maxabs(const M2& A) {
    double m = 0;
    for (auto& r : A) for (auto& v : r) m = std::max(m, std::abs(v));
    return m;
}

int main() {
    const double hbar = 1.0;
    const C i(0, 1);
    M2 Sx{{{C(0), C(0.5)}, {C(0.5), C(0)}}};
    M2 Sy{{{C(0), C(0, -0.5)}, {C(0, 0.5), C(0)}}};
    M2 Sz{{{C(0.5), C(0)}, {C(0), C(-0.5)}}};

    // [Sx,Sy] - i Sz
    M2 comm = sub(mul(Sx, Sy), mul(Sy, Sx));
    M2 iSz{};
    for (int a = 0; a < 2; ++a) for (int b = 0; b < 2; ++b) iSz[a][b] = i * hbar * Sz[a][b];
    std::printf("||[Sx,Sy] - i hbar Sz|| = %.2e\n", maxabs(sub(comm, iSz)));

    M2 S2 = mul(Sx, Sx);
    M2 t = mul(Sy, Sy);
    for (int a = 0; a < 2; ++a) for (int b = 0; b < 2; ++b) S2[a][b] += t[a][b];
    t = mul(Sz, Sz);
    for (int a = 0; a < 2; ++a) for (int b = 0; b < 2; ++b) S2[a][b] += t[a][b];
    std::printf("S^2 diag = %.4f, %.4f (-> 3/4 hbar^2)\n\n",
                S2[0][0].real(), S2[1][1].real());

    // sequential Stern-Gerlach Monte Carlo: |up_z> -> Sx -> Sz
    std::mt19937 rng(42);
    std::uniform_real_distribution<double> uni(0, 1);
    const int N = 100000;
    // P(Sx=+ | up_z) = |<up_x|up_z>|^2 = 1/2; then P(Sz=+ | up_x) = 1/2
    int nx = 0, nz = 0, nxTot = 0;
    for (int k = 0; k < N; ++k) {
        if (uni(rng) < 0.5) {            // collapsed to |up_x>
            ++nx; ++nxTot;
            if (uni(rng) < 0.5) ++nz;    // z-measurement is 50/50 AGAIN
        }
    }
    std::printf("P(Sx=+h/2 | up_z): theory 0.5, MC %.4f\n", double(nx) / N);
    std::printf("P(Sz=+h/2 | up_x): theory 0.5, MC %.4f\n", double(nz) / nxTot);
    std::printf("-> measuring Sx erased the known Sz value\n\n");

    // unitary basis change U = [up_x dn_x]; [Sy]' = U^dag Sy U
    const double s2 = 1 / std::sqrt(2.0);
    M2 U{{{C(s2), C(s2)}, {C(s2), C(-s2)}}};
    M2 Ud{{{C(s2), C(s2)}, {C(s2), C(-s2)}}};   // real symmetric here
    M2 UdU = mul(Ud, U);
    std::printf("U^dag U = [[%.3f,%.3f],[%.3f,%.3f]] (-> I)\n",
                UdU[0][0].real(), UdU[0][1].real(), UdU[1][0].real(), UdU[1][1].real());
    M2 Syp = mul(Ud, mul(Sy, U));
    std::printf("[Sy]' = [[%.3f%+.3fi, %.3f%+.3fi],[%.3f%+.3fi, %.3f%+.3fi]]\n\n",
                Syp[0][0].real(), Syp[0][0].imag(), Syp[0][1].real(), Syp[0][1].imag(),
                Syp[1][0].real(), Syp[1][0].imag(), Syp[1][1].real(), Syp[1][1].imag());

    // Zeeman splitting
    const double muB = 5.7883818060e-5, ge = 2.0023, h_eVs = 4.135667696e-15;
    for (double B : {0.5, 1.0, 5.0})
        std::printf("B = %.1f T: splitting %.3e eV (ESR %.1f GHz)\n",
                    B, ge * muB * B, ge * muB * B / h_eVs / 1e9);
    return 0;
}
