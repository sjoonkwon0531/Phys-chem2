// Wk01 - Least action principle (Lagrangian mechanics)
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build:  g++ -O2 -std=c++17 wk01_action_principle.cpp -o wk01_action_principle
// SHO: q(t) = q_cl(t) + eps*sin(n*pi*t/T)  ->  S(eps) minimized at eps = 0.
#include <cmath>
#include <cstdio>
#include <vector>

int main() {
    const double m = 1, w = 1, T = 2, qT = 1;
    const double A = qT/std::sin(w*T);
    const int Nt = 2000;
    const double dt = T/Nt;

    auto action = [&](double eps, int n) {
        double S = 0;
        for (int i = 0; i < Nt; ++i) {
            double t0 = i*dt, t1 = (i+1)*dt, tm = 0.5*(t0+t1);
            auto q = [&](double t){ return A*std::sin(w*t) + eps*std::sin(n*M_PI*t/T); };
            double qd = (q(t1) - q(t0))/dt;               // midpoint rule
            double qm = q(tm);
            S += (0.5*m*qd*qd - 0.5*m*w*w*qm*qm)*dt;
        }
        return S;
    };

    std::printf("classical action S_cl = %.6f\n\n", action(0.0, 1));
    std::printf("%8s  %12s  %12s  %12s\n", "eps", "S(n=1)", "S(n=2)", "S(n=3)");
    FILE* f = std::fopen("action_vs_eps.csv", "w");
    std::fprintf(f, "eps,S_n1,S_n2,S_n3\n");
    for (int k = 0; k <= 40; ++k) {
        double eps = -1.0 + 2.0*k/40;
        double s1 = action(eps,1), s2 = action(eps,2), s3 = action(eps,3);
        std::fprintf(f, "%.4f,%.8f,%.8f,%.8f\n", eps, s1, s2, s3);
        if (k % 5 == 0)
            std::printf("%8.3f  %12.6f  %12.6f  %12.6f\n", eps, s1, s2, s3);
    }
    std::fclose(f);
    std::printf("\nwrote action_vs_eps.csv — S(eps) is a parabola with min at eps=0\n");
    return 0;
}
