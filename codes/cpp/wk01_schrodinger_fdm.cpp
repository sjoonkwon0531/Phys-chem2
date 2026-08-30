// Wk01 - 1D time-independent Schrodinger equation by FDM
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk01_schrodinger_fdm.cpp -o wk01_schrodinger_fdm
// -(1/2) psi'' + V psi = E psi, hbar=m=1, Dirichlet BC.
// Symmetric tridiagonal eigenproblem solved by cyclic Jacobi rotations.
#include <cmath>
#include <cstdio>
#include <vector>
#include <algorithm>

using Mat = std::vector<std::vector<double>>;

// cyclic Jacobi for dense symmetric NxN (fine for N ~ 200)
void jacobi_eig(Mat& A, Mat& V, std::vector<double>& d) {
    int n = A.size();
    V.assign(n, std::vector<double>(n, 0.0));
    for (int i = 0; i < n; ++i) V[i][i] = 1.0;
    for (int sweep = 0; sweep < 60; ++sweep) {
        double off = 0;
        for (int p = 0; p < n; ++p)
            for (int q = p+1; q < n; ++q) off += A[p][q]*A[p][q];
        if (off < 1e-20) break;
        for (int p = 0; p < n; ++p)
            for (int q = p+1; q < n; ++q) {
                if (std::fabs(A[p][q]) < 1e-15) continue;
                double th = 0.5*(A[q][q]-A[p][p])/A[p][q];
                double t = (th >= 0 ? 1.0 : -1.0)/(std::fabs(th)+std::sqrt(th*th+1));
                double cph = 1.0/std::sqrt(t*t+1), s = t*cph;
                for (int k = 0; k < n; ++k) {
                    double akp = A[k][p], akq = A[k][q];
                    A[k][p] = cph*akp - s*akq;  A[k][q] = s*akp + cph*akq;
                }
                for (int k = 0; k < n; ++k) {
                    double apk = A[p][k], aqk = A[q][k];
                    A[p][k] = cph*apk - s*aqk;  A[q][k] = s*apk + cph*aqk;
                }
                for (int k = 0; k < n; ++k) {
                    double vkp = V[k][p], vkq = V[k][q];
                    V[k][p] = cph*vkp - s*vkq;  V[k][q] = s*vkp + cph*vkq;
                }
            }
    }
    d.resize(n);
    for (int i = 0; i < n; ++i) d[i] = A[i][i];
}

int main() {
    const double L = 1.0; const int N = 200;
    const double hh = L/(N+1);
    std::vector<double> xi(N);
    for (int i = 0; i < N; ++i) xi[i] = (i+1)*hh;

    auto solve = [&](const std::vector<double>& Vpot, const char* name,
                     std::vector<double>& Eout) {
        Mat A(N, std::vector<double>(N, 0.0)), Vec;
        for (int i = 0; i < N; ++i) {
            A[i][i] = 1.0/(hh*hh) + Vpot[i];
            if (i+1 < N) A[i][i+1] = A[i+1][i] = -0.5/(hh*hh);
        }
        std::vector<double> d;
        jacobi_eig(A, Vec, d);
        std::vector<int> idx(N); for (int i = 0; i < N; ++i) idx[i] = i;
        std::sort(idx.begin(), idx.end(), [&](int a, int b){ return d[a] < d[b]; });
        std::printf("%s : lowest 5 eigenvalues:\n", name);
        Eout.clear();
        for (int n = 0; n < 5; ++n) { Eout.push_back(d[idx[n]]); std::printf("  E%d = %.5f\n", n+1, d[idx[n]]); }
    };

    std::vector<double> E;
    std::vector<double> V0(N, 0.0);
    solve(V0, "infinite well (V=0)", E);
    std::printf("analytic E_n = n^2 pi^2/2 : ");
    for (int n = 1; n <= 5; ++n) std::printf("%.5f ", n*n*M_PI*M_PI/2);
    std::printf("\n\n");

    std::vector<double> Vh(N);
    for (int i = 0; i < N; ++i) Vh[i] = 0.5*8e4*std::pow(xi[i]-L/2, 2);
    solve(Vh, "harmonic (k=8e4)", E);
    double w = std::sqrt(8e4);
    std::printf("analytic E_n = (n+1/2) w : ");
    for (int n = 0; n < 5; ++n) std::printf("%.3f ", (n+0.5)*w);
    std::printf("\n");
    return 0;
}
