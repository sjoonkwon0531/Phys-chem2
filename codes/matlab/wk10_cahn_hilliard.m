% Wk10 — Cahn-Hilliard spinodal decomposition and Allen-Cahn coarsening
% Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
%
% f(phi) = chi phi(1-phi) + phi ln phi + (1-phi) ln(1-phi),  mu = f'(phi) - 2 kappa lap(phi)
% Cahn-Hilliard: d phi/dt = lap(mu);  Allen-Cahn: d phi/dt = -(phi^3 - phi - 2 kappa lap(phi))
% Linear theory: R(q) = -q^2 (f'' + 2 kappa q^2), q_m^2 = -f''/(4 kappa), lambda_m = 2 pi/q_m
%
% Run:  wk10_cahn_hilliard
clear; rng(10);
N = 128; kappa = 1;
k = 2*pi*[0:N/2-1, -N/2:-1]/N; [KX, KY] = ndgrid(k, k); K2 = KX.^2 + KY.^2; K = sqrt(K2);
fp = @(p, chi) log(min(max(p, 1e-9), 1 - 1e-9)./(1 - min(max(p, 1e-9), 1 - 1e-9))) + chi*(1 - 2*min(max(p, 1e-9), 1 - 1e-9));

cases = [3.0 0.5; 2.6 0.5; 3.0 0.35];
fprintf('(1) early dominant wavelength vs linear theory\n    chi   phi0   lambda_m theory   measured\n');
for c = 1:3
    chi = cases(c, 1); p0 = cases(c, 2);
    fpp = 1/(p0*(1 - p0)) - 2*chi; qm = sqrt(-fpp/4); Rm = qm^2*(-fpp - 2*qm^2);
    phi = ch(p0 + 1e-3*randn(N), chi, kappa, K2, log(50)/Rm, 0.05, fp);
    fprintf('    %3.1f   %4.2f      %7.2f        %7.2f\n', chi, p0, 2*pi/qm, 2*pi/peakq(phi, K, N));
end

phi = ch(0.5 + 1e-2*randn(N), 3.0, kappa, K2, 400, 0.1, fp);
s = sort(phi(:));
fprintf('\n(2) chi = 3, t = 400: mean phi = %.6f, phases %.3f / %.3f (binodal 0.071 / 0.929)\n', mean(phi(:)), s(round(0.02*N^2)), s(round(0.98*N^2)));
figure; imagesc(phi); axis image off; colormap(parula); title('Cahn-Hilliard, \chi = 3, t = 400');

% Allen-Cahn
phi = 0.1*randn(N); dt = 0.05; den = 1 + dt*2*0.5*K2;
for n = 1:4000
    phi = real(ifft2(fft2(phi + dt*(phi - phi.^3))./den));
end
fprintf('\n(3) Allen-Cahn: mean phi drifts to %+.3f (non-conserved order parameter)\n', mean(phi(:)));
figure; imagesc(phi); axis image off; title('Allen-Cahn, t = 200');

function phi = ch(phi, chi, kappa, K2, tend, dt, fp)
    A = 2*chi; den = 1 + dt*K2.*(A + 2*kappa*K2);
    for n = 1:round(tend/dt)
        ph = fft2(phi); muh = fft2(fp(phi, chi));
        phi = real(ifft2((ph - dt*K2.*(muh - A*ph))./den));
    end
end
function q = peakq(phi, K, N)
    S = abs(fft2(phi - mean(phi(:)))).^2; dq = 2*pi/N;
    b = round(K/dq); Sq = accumarray(b(:) + 1, S(:)); c = accumarray(b(:) + 1, 1);
    Sq = Sq(2:N/2)./c(2:N/2); [~, i] = max(Sq); q = i*dq;
end
