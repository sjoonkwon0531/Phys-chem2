% Wk01 - 1D time-independent Schrodinger equation by FDM
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% -(1/2) psi'' + V psi = E psi on [0,L], hbar = m = 1, Dirichlet BC.

L = 1; N = 400;
x = linspace(0, L, N+2); h = x(2) - x(1); xi = x(2:end-1)';

solveSE = @(V) deal_eigs(V, h, N);

cases = {
  'infinite well (V=0)',            zeros(N,1);
  'harmonic 0.5k(x-L/2)^2',         0.5*8e4*(xi-L/2).^2;
  'finite well (V0=2000, w=0.4L)',  2000*(abs(xi-L/2) >= 0.2*L);
};

figure(1);
for c = 1:3
    V = cases{c,2};
    [E, psi] = solveSE(V);
    subplot(1,3,c); hold on;
    for n = 1:4
        plot(xi, 40*psi(:,n)*sign(psi(round(N/5),n)+1e-12) + E(n), 'LineWidth', 1.3);
    end
    if max(V) > 0, plot(xi, V, 'k--'); ylim([0 1.3*E(4)]); end
    title(cases{c,1}, 'FontSize', 9); xlabel('x');
end
sgtitle('Quantization as an eigenvalue problem (FDM)');

[E_box, ~] = solveSE(zeros(N,1));
fprintf('infinite well: E_n = n^2 pi^2/2\n n    FDM        analytic    rel.err\n');
for n = 1:5
    Ea = n^2*pi^2/2;
    fprintf('%2d  %10.5f  %10.5f  %.2e\n', n, E_box(n), Ea, abs(E_box(n)-Ea)/Ea);
end

function [E, psi] = deal_eigs(V, h, N)
    Hmat = diag(1/h^2 + V) + diag(-0.5/h^2*ones(N-1,1), 1) ...
                            + diag(-0.5/h^2*ones(N-1,1), -1);
    [psi, D] = eig(Hmat, 'vector');
    [E, i] = sort(D); psi = psi(:, i)/sqrt(h);
end
