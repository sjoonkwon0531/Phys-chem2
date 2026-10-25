% Wk09 — Collision theory, steric factor, and the RRK model
% Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
%
% (1) Z_AA = (1/2) sigma c_rel n^2,  c_rel = (16 kT / pi m)^(1/2)
% (2) steric factor P = A_exp / A_theory
% (3) RRK: P(e1 >= E0 | E) = (1 - E0/E)^(s-1), Monte Carlo on the energy simplex;
%     thermal average with rho ~ E^(s-1) gives k(T) = nu exp(-E0/kT)
%
% Run:  wk09_collision_rrk
clear; rng(9);
KB = 1.380649e-23; NA = 6.02214076e23; AMU = 1.66053906660e-27;

% (1) N2 at 298.15 K, 1 bar, sigma = 0.43 nm^2
T = 298.15; p = 1e5; sigma = 0.43e-18; m = 28.0134*AMU;
n = p/(KB*T); cbar = sqrt(8*KB*T/(pi*m)); crel = sqrt(2)*cbar;
z = sigma*crel*n; ZAA = 0.5*sigma*crel*n^2;
fprintf('(1) N2, 298.15 K, 1 bar, sigma = 0.43 nm^2\n');
fprintf('    n = %.3e m^-3, mean speed = %.1f m/s, relative speed = %.1f m/s\n', n, cbar, crel);
fprintf('    z = %.3e s^-1,  Z_AA = %.3e m^-3 s^-1 = %.3e mol dm^-3 s^-1\n', z, ZAA, ZAA/NA/1e3);
fprintf('    A_theory = %.3e dm^3 mol^-1 s^-1\n\n', sigma*crel*NA*1e3);

% (2) steric factors
names = {'2NOCl -> 2NO + 2Cl', '2ClO -> Cl2 + O2', 'H2 + C2H4 -> C2H6', 'K + Br2 -> KBr + Br'};
Aexp = [9.4e9 6.3e7 1.24e6 1.0e12]; Ath = [5.9e10 2.5e10 7.4e11 2.1e11];
fprintf('(2) steric factor P = A_exp / A_theory\n');
for i = 1:4, fprintf('    %-22s P = %.2e\n', names{i}, Aexp(i)/Ath(i)); end

% (3) RRK Monte Carlo: uniform point on the simplex = normalised exponentials
fprintf('\n(3) RRK  P(e1 >= E0|E) = (1 - E0/E)^(s-1)\n     s   E0/E    formula     Monte Carlo\n');
N = 400000;
for s = [2 3 5 10]
    for x = [0.2 0.5]
        g = -log(rand(N, s));
        e1 = g(:,1) ./ sum(g, 2);
        fprintf('    %2d   %.1f   %.5f     %.5f\n', s, x, (1-x)^(s-1), mean(e1 >= x));
    end
end
s = 6; E0 = 1; kT = 0.25;
E = linspace(0, 60*kT, 600001);
w = E.^(s-1) .* exp(-E/kT);
kE = zeros(size(E)); msk = E >= E0; kE(msk) = (1 - E0./E(msk)).^(s-1);
fprintf('\n    thermal average (s = 6, E0/kT = 4): quadrature %.6e   exp(-E0/kT) = %.6e\n', ...
        trapz(E, kE.*w)/trapz(E, w), exp(-E0/kT));
