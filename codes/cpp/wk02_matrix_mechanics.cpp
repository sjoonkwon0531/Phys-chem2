// Wk02 - Matrix mechanics: [X,P] = i hbar seen numerically
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk02_matrix_mechanics.cpp -o wk02_matrix_mechanics
// X real symmetric, P = i*Pi (Pi real antisymmetric) in the box basis.
// Im(XP-PX) = X*Pi - Pi*X -> hbar * I in the interior of the matrix.
#include <cmath>
#include <cstdio>
#include <vector>

int main() {
    const double L = 1.0, hbar = 1.0;
    const int Nb = 20, Nx = 6001;
    std::vector<double> x(Nx);
    for (int i = 0; i < Nx; ++i) x[i] = L*i/(Nx-1);
    double h = x[1] - x[0];

    auto X  = std::vector<std::vector<double>>(Nb, std::vector<double>(Nb));
    auto Pi = X, M = X;
    for (int mq = 1; mq <= Nb; ++mq)
        for (int nq = 1; nq <= Nb; ++nq) {
            double sX = 0, sP = 0;
            for (int i = 0; i < Nx; ++i) {
                double pm  = std::sqrt(2/L)*std::sin(mq*M_PI*x[i]/L);
                double pn  = std::sqrt(2/L)*std::sin(nq*M_PI*x[i]/L);
                double dpn = std::sqrt(2/L)*(nq*M_PI/L)*std::cos(nq*M_PI*x[i]/L);
                double wgt = (i == 0 || i == Nx-1) ? 0.5 : 1.0;
                sX += wgt*pm*x[i]*pn;
                sP += wgt*pm*dpn;
            }
            X[mq-1][nq-1]  = h*sX;
            Pi[mq-1][nq-1] = -hbar*h*sP;
        }
    for (int i = 0; i < Nb; ++i)
        for (int j = 0; j < Nb; ++j) {
            double s = 0;
            for (int k = 0; k < Nb; ++k) s += X[i][k]*Pi[k][j] - Pi[i][k]*X[k][j];
            M[i][j] = s;
        }

    std::printf("n   Im[X,P]_nn/hbar (should be 1 in the interior)\n");
    for (int n : {1, 2, 5, 10, 15, 19, 20})
        std::printf("%2d  %10.5f\n", n, M[n-1][n-1]/hbar);
    std::printf("-> plateau at 1, breakdown near n ~ N: infinite matrices needed!\n");
    std::printf("X_12: %.6f vs analytic %.6f\n", X[0][1], -8.0*1*2/(M_PI*M_PI*9));

    std::printf("\n n  sigma_x*sigma_p/hbar (bound 0.5)\n");
    for (int n = 1; n <= 5; ++n)
        std::printf("%2d  %.5f\n", n, std::sqrt(1.0/12 - 1.0/(2*n*n*M_PI*M_PI))*n*M_PI);
    return 0;
}
