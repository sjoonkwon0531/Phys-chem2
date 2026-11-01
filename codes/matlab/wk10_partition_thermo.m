% Wk10 — From the partition function to thermodynamics
% Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
%
% (1) two-level system: C_V = dU/dT = sigma_E^2/kT^2, Schottky peak
% (2) sigma_E/<E> ~ N^(-1/2)
% (3) diatomic q = qT qR qV qE and S° vs CODATA (constants: NIST CCCBDB)
% (4) Langmuir lattice gas: sigma_N^2 = kT d<N>/dmu = M theta(1-theta)
% (5) mu_trans = kT ln(n Lambda^3)
%
% Run:  wk10_partition_thermo
clear; rng(10);
KB = 1.380649e-23; H = 6.62607015e-34; C = 2.99792458e10; R = 8.314462618; AMU = 1.66053906660e-27;

t = linspace(0.05, 3, 6000); b = 1./t; Z = 1 + exp(-b);
U = exp(-b)./Z; CV = gradient(U, t); var = exp(-b)./Z - U.^2;
[cmax, i] = max(CV);
fprintf('(1) two-level: C_max = %.4f k at kT/eps = %.4f; max|dU/dT - sigma^2/kT^2| = %.1e\n\n', cmax, t(i), max(abs(CV(50:end-50) - var(50:end-50)./t(50:end-50).^2)));

p = exp(-1)/(1 + exp(-1));
fprintf('(2) sigma_E/<E> at kT = eps\n');
for N = [10 100 1000 10000 1e6]
    E = binornd(N, p, 20000, 1);
    fprintf('    N = %8d: simulated %.5f  theory %.5f\n', N, std(E)/mean(E), sqrt((1 - p)/(N*p)));
end

names = {'N2', 'O2', 'CO', 'HCl', 'I2'};
data = [28.0134 2358.57 1.998241 2 1 191.609; 31.9988 1580.161 1.44562 2 3 205.152;
        28.0101 2169.756 1.931602 1 1 197.660; 36.461 2990.925 10.5933 1 1 186.902;
        253.809 214.502 0.037372 2 1 260.687];
T = 298.15; p0 = 1e5;
fprintf('\n(3) S° at 298.15 K, 1 bar\n     mol    qR       qV      S_total   CODATA\n');
for k = 1:5
    m = data(k, 1)*AMU; Lam = H/sqrt(2*pi*m*KB*T);
    qTN = (KB*T/p0)/Lam^3; qR = KB*T/(data(k, 4)*H*C*data(k, 3));
    x = H*C*data(k, 2)/(KB*T); qV = 1/(1 - exp(-x));
    S = R*(log(qTN) + 2.5) + R*(log(qR) + 1) + R*(x/expm1(x) - log(1 - exp(-x))) + R*log(data(k, 5));
    fprintf('    %-4s  %7.1f  %7.4f   %6.1f    %6.1f\n', names{k}, qR, qV, S, data(k, 6));
end

fprintf('\n(4) Langmuir, M = 1000\n');
Nf = @(bmu) 1000*exp(bmu)./(1 + exp(bmu));
for bmu = [-2 0 2]
    th = exp(bmu)/(1 + exp(bmu)); h = 1e-5;
    fprintf('    beta mu = %+.1f: theta = %.4f, kT d<N>/dmu = %.2f, M theta(1-theta) = %.2f\n', bmu, th, (Nf(bmu + h) - Nf(bmu - h))/(2*h), 1000*th*(1 - th));
end

m = 28.0134*AMU; Lam = H/sqrt(2*pi*m*KB*T); n = p0/(KB*T);
fprintf('\n(5) N2: n Lambda^3 = %.3e, mu_trans = %.2f kT = %.1f kJ/mol\n', n*Lam^3, log(n*Lam^3), R*T*log(n*Lam^3)/1e3);
