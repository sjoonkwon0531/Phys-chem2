// Week 3 - Angular Momentum & Ladder Operators (|l,m> basis, hbar = 1)
// Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
// [Lx,Ly] = i Lz, [L^2,Lz] = 0, L^2 = l(l+1) I, L+|l,m> = c+(l,m)|l,m+1>
// Build: g++ -O2 -std=c++17 wk03_angmom.cpp -o wk03_angmom
#include <cstdio>
#include <cmath>
#include <complex>
#include <vector>

using cd = std::complex<double>;
using Mat = std::vector<std::vector<cd>>;

Mat zeros(int d) { return Mat(d, std::vector<cd>(d, 0.0)); }

Mat mul(const Mat& A, const Mat& B) {
    int d = (int)A.size(); Mat C = zeros(d);
    for (int i = 0; i < d; ++i)
        for (int k = 0; k < d; ++k)
            for (int j = 0; j < d; ++j) C[i][j] += A[i][k] * B[k][j];
    return C;
}

Mat sub(const Mat& A, const Mat& B) {
    int d = (int)A.size(); Mat C = zeros(d);
    for (int i = 0; i < d; ++i) for (int j = 0; j < d; ++j) C[i][j] = A[i][j] - B[i][j];
    return C;
}

double maxAbs(const Mat& A) {
    double m = 0; for (auto& r : A) for (auto& v : r) m = std::max(m, std::abs(v));
    return m;
}

struct AngMom { Mat Lx, Ly, Lz, Lp, Lm, L2; int d; };

AngMom angmom(int l) {                        // basis m = l, l-1, ..., -l
    int d = 2 * l + 1;
    AngMom A{zeros(d), zeros(d), zeros(d), zeros(d), zeros(d), zeros(d), d};
    for (int k = 0; k < d; ++k) A.Lz[k][k] = (double)(l - k);
    for (int k = 1; k < d; ++k) {
        double m = (double)(l - k);
        A.Lp[k - 1][k] = std::sqrt(l * (l + 1.0) - m * (m + 1.0));   // raises m
        A.Lm[k][k - 1] = A.Lp[k - 1][k].real();                      // = (L+)^T
    }
    for (int i = 0; i < d; ++i)
        for (int j = 0; j < d; ++j) {
            A.Lx[i][j] = 0.5 * (A.Lp[i][j] + A.Lm[i][j]);
            A.Ly[i][j] = cd(0.0, -0.5) * (A.Lp[i][j] - A.Lm[i][j]);
        }
    Mat t = mul(A.Lx, A.Lx), u = mul(A.Ly, A.Ly), w = mul(A.Lz, A.Lz);
    for (int i = 0; i < d; ++i)
        for (int j = 0; j < d; ++j) A.L2[i][j] = t[i][j] + u[i][j] + w[i][j];
    return A;
}

int main() {
    for (int l : {1, 2}) {
        AngMom A = angmom(l);
        Mat c1 = sub(mul(A.Lx, A.Ly), mul(A.Ly, A.Lx));   // should equal i Lz
        for (int i = 0; i < A.d; ++i)
            for (int j = 0; j < A.d; ++j) c1[i][j] -= cd(0.0, 1.0) * A.Lz[i][j];
        Mat c2 = sub(mul(A.L2, A.Lz), mul(A.Lz, A.L2));
        Mat c3 = A.L2;
        for (int i = 0; i < A.d; ++i) c3[i][i] -= (double)(l * (l + 1));
        std::printf("l=%d: |[Lx,Ly]-iLz| = %.2e, |[L2,Lz]| = %.2e, |L2-l(l+1)I| = %.2e\n",
                    l, maxAbs(c1), maxAbs(c2), maxAbs(c3));
    }

    // Ladder coefficients & termination for l = 2
    AngMom A = angmom(2);
    std::printf("c+(2,m) matrix elements:");
    for (int k = 1; k < A.d; ++k) std::printf(" %.4f", A.Lp[k - 1][k].real());
    std::printf("\nL+|2,+2> column norm = %.1e (termination)\n", std::abs(A.Lp[0][0]));

    // Vector model: |L| = sqrt(l(l+1)), cone angles for l = 2
    double L = std::sqrt(6.0);
    for (int m = 2; m >= -2; --m)
        std::printf("l=2, m=%+d: cone angle = %.2f deg\n", m,
                    std::acos(m / L) * 180.0 / M_PI);
    return 0;
}
