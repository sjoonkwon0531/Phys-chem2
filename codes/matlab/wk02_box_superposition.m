% Wk02 - Particle in a box: basis expansion, measurement & dynamics
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% hbar = m = L = 1.  c_n = -8 sqrt(15)/(n^3 pi^3) (odd n), <E> = 5.

L = 1; x = linspace(0, L, 4001);
psi = @(n) sqrt(2/L)*sin(n*pi*x/L);
En  = @(n) n^2*pi^2/2;

f = sqrt(30/L^5)*x.*(x - L);                 % lecture convention
fprintf('normalization: %.6f\n', trapz(x, f.^2));

N = 15; c = zeros(1, N);
for n = 1:N, c(n) = trapz(x, psi(n).*f); end
fprintf(' n   c_n         analytic     |c_n|^2\n');
for n = 1:2:7
    fprintf('%2d  %10.6f  %10.6f  %10.6f\n', n, c(n), -8*sqrt(15)/(n^3*pi^3), c(n)^2);
end
fprintf('Parseval: %.6f,  <E> = %.5f (analytic 5)\n', sum(c.^2), sum(c.^2.*arrayfun(En, 1:N)));

figure(1);
subplot(1,3,1); hold on; plot(x, f, 'k-', 'LineWidth', 2);
for Np = [1 3 5]
    g = zeros(size(x)); for n = 1:Np, g = g + c(n)*psi(n); end
    plot(x, g, '--');
end
title('Basis expansion'); legend('f', 'N=1', 'N=3', 'N=5');

subplot(1,3,2); bar(1:N, max(c.^2, 1e-12)); set(gca, 'YScale', 'log');
xlabel('n'); title('|c_n|^2 (measurement probabilities)');

subplot(1,3,3); hold on;
c1 = 2/sqrt(5); c2 = 1/sqrt(5); Tp = 2*pi/(En(2) - En(1));
for frac = [0 0.25 0.5]
    t = frac*Tp;
    Psi = c1*psi(1)*exp(-1i*En(1)*t) + c2*psi(2)*exp(-1i*En(2)*t);
    plot(x, abs(Psi).^2, 'LineWidth', 1.3, 'DisplayName', sprintf('t=%.2fT', frac));
end
plot(x, psi(1).^2, 'k:', 'DisplayName', 'stationary |1>');
legend; title('|\Psi(x,t)|^2 sloshing');
