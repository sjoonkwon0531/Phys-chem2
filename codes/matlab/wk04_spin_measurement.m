% Wk04 - Spin-1/2: Pauli algebra, sequential measurement, unitarity
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% hbar = 1. Checks [Sx,Sy]=i Sz, Stern-Gerlach chain, unitary basis change.

hbar = 1; I2 = eye(2);
sx = [0 1; 1 0]; sy = [0 -1i; 1i 0]; sz = [1 0; 0 -1];
Sx = hbar/2*sx; Sy = hbar/2*sy; Sz = hbar/2*sz;
S2 = Sx^2 + Sy^2 + Sz^2;

fprintf('||[Sx,Sy]-i hbar Sz|| = %.2e\n', max(abs(Sx*Sy-Sy*Sx - 1i*hbar*Sz), [], 'all'));
fprintf('||[S^2,Sx]||          = %.2e\n', max(abs(S2*Sx-Sx*S2), [], 'all'));
fprintf('S^2 = 3/4 I ? %d;  eig(Sx) = %s\n\n', isequal(round(S2,10), 0.75*I2), ...
        mat2str(round(eig(Sx)', 4)));

% sequential Stern-Gerlach (Monte Carlo)
rng(42); N = 1e5;
up_z = [1; 0]; up_x = [1; 1]/sqrt(2);
p1 = abs(up_x' * up_z)^2;             % P(Sx=+ | up_z)
got_x = rand(N,1) < p1;
p2 = abs(up_z' * up_x)^2;             % P(Sz=+ | up_x)
got_z = rand(sum(got_x),1) < p2;
fprintf('P(Sx=+h/2 | up_z): theory 0.5, MC %.4f\n', mean(got_x));
fprintf('P(Sz=+h/2 | up_x): theory 0.5, MC %.4f\n', mean(got_z));
fprintf('-> measuring Sx erased the known Sz value (incompatible observables)\n\n');

% unitary basis change (lecture: [Sy]'' = U^-1 [Sy] U)
dn_x = [1; -1]/sqrt(2);
U = [up_x, dn_x];
fprintf('U''*U = I ? %d\n', isequal(round(U'*U, 10), I2));
disp('[Sy]'' = U^-1 Sy U ='); disp(round(U' * Sy * U, 4));
f = [0.6; 0.8i]; g = [1; -1]/sqrt(2);
fprintf('<f|g> before %s  after %s (conserved)\n\n', ...
        num2str(f'*g), num2str((U*f)'*(U*g)));

% Zeeman splitting
muB = 5.7883818060e-5; ge = 2.0023;   % eV/T
for B = [0.5 1 5]
    dE = ge*muB*B;
    fprintf('B = %.1f T: splitting %.3e eV (ESR %.1f GHz)\n', ...
            B, dE, dE/4.135667696e-15/1e9);
end
