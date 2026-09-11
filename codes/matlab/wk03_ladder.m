%% Week 3 - Creation & Annihilation Operators (number-basis matrices)
%  Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
%  a|n> = sqrt(n)|n-1>, a'|n> = sqrt(n+1)|n+1>, [a,a'] = 1, H = a'a + 1/2
clear; clc;

N = 30;
a = diag(sqrt(1:N-1), 1);       % annihilation
ad = a';                        % creation

% [a, a'] = 1 (exact except truncation corner)
comm = a*ad - ad*a;
bulk = comm(1:N-1, 1:N-1) - eye(N-1);
fprintf('[a,a''] = 1: max bulk error = %.2e, corner = %+.1f\n', max(abs(bulk(:))), comm(N,N));

% Hamiltonian eigenvalues (n + 1/2)
H = ad*a + 0.5*eye(N);
ev = sort(eig(H));
fprintf('First 6 eigenvalues of H/hbar*omega: '); fprintf('%.1f ', ev(1:6)); fprintf('\n');

% X, P and [X,P] = i
X = (a + ad)/sqrt(2); P = 1i*(ad - a)/sqrt(2);
commXP = X*P - P*X;
fprintf('Im<0|[X,P]|0> = %.6f (expect 1)\n', imag(commXP(1,1)));

% Matrix elements <n-1|a|n> = sqrt(n)
da = diag(a, 1);
fprintf('<n-1|a|n> for n=1..5: '); fprintf('%.4f ', da(1:5)); fprintf('\n');

% Uncertainty product in |n>: sigma_x sigma_p = (n + 1/2) hbar
for n = [0 1 4]
    v = zeros(N,1); v(n+1) = 1;
    sx = sqrt(v'*(X*X)*v - (v'*X*v)^2);
    sp = sqrt(real(v'*(P*P)*v - (v'*P*v)^2));
    fprintf('n=%d: sigma_x*sigma_p = %.5f hbar (expect %.1f)\n', n, real(sx*sp), n+0.5);
end

% Heatmap of |<m|a'|n>|
figure; imagesc(abs(ad(1:8,1:8))); colorbar; axis square;
title('|<m|a^{\dagger}|n>| (first 8x8)'); xlabel('n'); ylabel('m');
