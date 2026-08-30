// Wk01 - Helmholtz modes & cavity mode counting
// Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
// Build: g++ -O2 -std=c++17 wk01_helmholtz_modes.cpp -o wk01_helmholtz_modes
// Output: mode_XX.pgm images (view: gimp/feh) + mode_counting.csv
#include <cmath>
#include <cstdio>
#include <vector>
#include <algorithm>

void write_mode_pgm(int nx, int ny) {
    const int W = 320, H = 320;
    char name[64];
    std::snprintf(name, 64, "mode_%d%d.pgm", nx, ny);
    FILE* f = std::fopen(name, "w");
    std::fprintf(f, "P2\n%d %d\n255\n", W, H);
    for (int j = 0; j < H; ++j) {
        for (int i = 0; i < W; ++i) {
            double x = double(i)/(W-1), y = double(j)/(H-1);
            double v = std::sin(nx*M_PI*x)*std::sin(ny*M_PI*y);   // in [-1,1]
            std::fprintf(f, "%d ", int(127.5*(v+1.0)));
        }
        std::fprintf(f, "\n");
    }
    std::fclose(f);
    std::printf("wrote %s  (w = %.3f, c=1, L=1)\n", name,
                M_PI*std::sqrt(double(nx*nx + ny*ny)));
}

int main() {
    // (1) 2D membrane modes -> PGM heatmaps
    int modes[4][2] = {{1,1},{2,1},{2,2},{4,2}};
    for (auto& m : modes) write_mode_pgm(m[0], m[1]);

    // (2) 3D cavity mode counting: w' = sqrt(nx^2+ny^2+nz^2)
    const double wmax = 14.0;
    std::vector<double> freqs;
    for (int nx = 1; nx <= 15; ++nx)
        for (int ny = 1; ny <= 15; ++ny)
            for (int nz = 1; nz <= 15; ++nz) {
                double wp = std::sqrt(double(nx*nx + ny*ny + nz*nz));
                if (wp <= wmax) freqs.push_back(wp);
            }
    std::sort(freqs.begin(), freqs.end());

    FILE* f = std::fopen("mode_counting.csv", "w");
    std::fprintf(f, "w_prime,N_exact,N_smooth\n");
    for (size_t i = 0; i < freqs.size(); ++i)
        std::fprintf(f, "%.5f,%zu,%.3f\n", freqs[i], i+1,
                     M_PI/6.0*std::pow(freqs[i], 3));
    std::fclose(f);
    std::printf("wrote mode_counting.csv  (N ~ (pi/6) w'^3 => g(nu) ~ nu^2)\n");
    return 0;
}
