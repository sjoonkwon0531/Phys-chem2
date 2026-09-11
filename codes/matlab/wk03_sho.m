%% Week 3 - Quantum Harmonic Oscillator (Hermite polynomials)
%  Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
%  psi_n(y) = (1/pi)^(1/4)/sqrt(2^n n!) H_n(y) exp(-y^2/2), E_n = (n+1/2) hbar*w
clear; clc;

y = linspace(-12, 12, 240001);

% Hermite orthogonality: int e^{-y^2} H_m H_n dy = 2^n n! sqrt(pi) delta_mn
fprintf('Hermite orthogonality (normalized):\n');
for m = 0:3
    row = zeros(1,4);
    for n = 0:3
        I = trapz(y, exp(-y.^2).*hermiteH_rec(m,y).*hermiteH_rec(n,y));
        row(n+1) = I/(2^n*factorial(n)*sqrt(pi));
    end
    fprintf('  %+.6f %+.6f %+.6f %+.6f\n', row);
end

% Normalization & virial theorem
for n = [0 1 5 10]
    fprintf('<psi_%d|psi_%d> = %.6f\n', n, n, trapz(y, psiSHO(n,y).^2));
end
for n = [0 3]
    V = trapz(y, 0.5*y.^2.*psiSHO(n,y).^2);
    fprintf('n=%d: <V> = %.5f (E_n/2 = %.5f)\n', n, V, (n+0.5)/2);
end

% Classically forbidden probability beyond y_tp = sqrt(2n+1)
for n = [0 1 5]
    ytp = sqrt(2*n+1);
    Pout = trapz(y, (abs(y)>ytp).*psiSHO(n,y).^2);
    fprintf('n=%d: y_tp = %.4f, P(forbidden) = %.4f\n', n, ytp, Pout);
end

% Plot the first 4 eigenfunctions offset by their energies
figure; hold on;
yy = linspace(-5,5,801);
plot(yy, 0.5*yy.^2, 'k-', 'LineWidth', 1.2);
for n = 0:3
    plot(yy, (n+0.5) + 0.6*psiSHO(n,yy), 'LineWidth', 1.4);
end
xlabel('y'); ylabel('E/\hbar\omega'); title('SHO eigenfunctions on the potential');
grid on; ylim([0 4.5]);

function H = hermiteH_rec(n, y)
% Physicists' Hermite polynomial via H_{n+1} = 2y H_n - 2n H_{n-1}
    if n == 0, H = ones(size(y)); return; end
    if n == 1, H = 2*y; return; end
    Hm = ones(size(y)); Hc = 2*y;
    for k = 1:n-1
        Hn = 2*y.*Hc - 2*k*Hm; Hm = Hc; Hc = Hn;
    end
    H = Hc;
end

function p = psiSHO(n, y)
% Normalized SHO eigenfunction (hbar = m = omega = 1)
    p = 1/sqrt(2^n*factorial(n))*(1/pi)^0.25*hermiteH_rec(n,y).*exp(-y.^2/2);
end
