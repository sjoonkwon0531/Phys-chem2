// Week 3 - Creation & Annihilation Operators (number-basis matrices)
// Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
// a|n> = sqrt(n)|n-1>, a'|n> = sqrt(n+1)|n+1>, [a,a'] = 1, H = a'a + 1/2
// Build: g++ -O2 -std=c++17 wk03_ladder.cpp -o wk03_ladder
#include <cstdio>
#include <cmath>
#include <complex>
#include <vector>

using cd = std::complex<double>;
using Mat = std::vector<std::vector<cd>>;

Mat zeros(int N) { return Mat(N, std::vector<cd>(N, 0.0)); }

Mat mul(const Mat& A, const Mat& B) {
    int N = (int)A.size();
    Mat C = zeros(N);
    for (int i = 0; i < N; ++i)
        for (int k = 0; k < N; ++k) {
            cd a = A[i][k];
            if (a == cd(0.0)) continue;
            for (int j = 0; j < N; ++j) C[i][j] += a * B[k][j];
        }
    return C;
}

Mat sub(const Mat& A, const Mat& B) {
    int N = (int)A.size(); Mat C = zeros(N);
    for (int i = 0; i < N; ++i) for (int j = 0; j < N; ++j) C[i][j] = A[i][j] - B[i][j];
    return C;
}

int main() {
    const int N = 30;
    Mat a = zeros(N), ad = zeros(N);
    for (int n = 1; n < N; ++n) {                 // <n-1|a|n> = sqrt(n)
        a[n - 1][n] = std::sqrt((double)n);
        ad[n][n - 1] = std::sqrt((double)n);
    }

    // 1) [a, a'] = 1 (exact except truncation corner)
    Mat comm = sub(mul(a, ad), mul(ad, a));
    double bulkErr = 0.0;
    for (int i = 0; i < N - 1; ++i)
        for (int j = 0; j < N - 1; ++j)
            bulkErr = std::max(bulkErr, std::abs(comm[i][j] - (i == j ? cd(1.0) : cd(0.0))));
    std::printf("[a,a'] = 1: max bulk error = %.2e, corner = %+.1f\n",
                bulkErr, comm[N - 1][N - 1].real());

    // 2) H = a'a + 1/2: diagonal in the number basis -> read eigenvalues directly
    Mat H = mul(ad, a);
    std::printf("First 6 eigenvalues of H/hbar*omega:");
    for (int n = 0; n < 6; ++n) std::printf(" %.1f", H[n][n].real() + 0.5);
    std::printf("\n");

    // 3) X, P and [X,P] = i
    Mat X = zeros(N), P = zeros(N);
    const double s2 = std::sqrt(2.0);
    for (int i = 0; i < N; ++i)
        for (int j = 0; j < N; ++j) {
            X[i][j] = (a[i][j] + ad[i][j]) / s2;
            P[i][j] = cd(0.0, 1.0) * (ad[i][j] - a[i][j]) / s2;
        }
    Mat cXP = sub(mul(X, P), mul(P, X));
    std::printf("Im<0|[X,P]|0> = %.6f (expect 1)\n", cXP[0][0].imag());

    // 4) Matrix elements <n-1|a|n> = sqrt(n)
    std::printf("<n-1|a|n> for n=1..5:");
    for (int n = 1; n <= 5; ++n) std::printf(" %.4f", a[n - 1][n].real());
    std::printf("\n");

    // 5) Uncertainty product in |n>: sigma_x sigma_p = (n + 1/2) hbar
    Mat XX = mul(X, X), PP = mul(P, P);
    for (int n : {0, 1, 4}) {
        double sx = std::sqrt(XX[n][n].real());   // <n|X|n> = 0
        double sp = std::sqrt(PP[n][n].real());   // <n|P|n> = 0
        std::printf("n=%d: sigma_x*sigma_p = %.5f hbar (expect %.1f)\n", n, sx * sp, n + 0.5);
    }
    return 0;
}
