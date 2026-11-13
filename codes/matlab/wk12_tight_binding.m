% Week 12 - 1D tight-binding band E(k) = eps0 - 2t cos(ka)
% Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
function wk12_tight_binding()
    N = 12; t = 1; H = zeros(N);
    for n = 1:N, m = mod(n, N) + 1; H(n, m) = -t; H(m, n) = -t; end
    e = sort(eig(H)); a = sort(-2*t*cos(2*pi*(0:N-1)'/N));
    fprintf('N = %d: max error %.2e, band width %.4f t\n', N, max(abs(e - a)), e(end) - e(1));
    fprintf('m*/m_e (t = 1 eV, a = 2.5 A) = %.3f\n', 7.619964/(2*1*2.5^2));
    for f = [0.25 0.5 1 1.5 2], fprintf('f = %.2f: band energy %+.4f t\n', f, -(4/pi)*sin(pi*f/2)); end
    k = linspace(-pi, pi, 200); figure; plot(k, -2*t*cos(k), 'LineWidth', 1.5); xlabel('ka'); ylabel('E/t'); grid on;
end
