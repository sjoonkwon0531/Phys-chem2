% Wk06 - Macromolecules: molar-mass averages, random coils, entropic elasticity
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% Mn, Mw, Mz, D; freely jointed chain <R^2> = N l^2, Rg^2 = N l^2/6;
% tetrahedral chain F^2 = 2; F = (kT/2l) ln[(1+nu)/(1-nu)].

rng(6); KB = 1.380649e-23;

% (1) molar-mass averages
avg = @(Ni, Mi) [sum(Ni.*Mi)/sum(Ni), sum(Ni.*Mi.^2)/sum(Ni.*Mi), sum(Ni.*Mi.^3)/sum(Ni.*Mi.^2)];
m = avg([1 1], [10 100]);
fprintf('blend (equal numbers of 10 & 100 kg/mol): Mn = %.1f, Mw = %.1f, Mz = %.1f, D = %.3f\n', ...
        m(1), m(2), m(3), m(2)/m(1));
fprintf('Schulz-Flory, M0 = 100 g/mol:\n   p      Mn       Mw       Mz      D    1+p\n');
i = 1:200000;
for p = [0.90 0.99 0.999]
    m = avg((1-p)*p.^(i-1), 100*i);
    fprintf('  %.3f  %7.0f  %7.0f  %7.0f  %.3f  %.3f\n', p, m(1), m(2), m(3), m(2)/m(1), 1+p);
end

% (2) freely jointed chain Monte Carlo (3D and 1D)
N = 100; M = 20000;
for dim = [3 1]
    if dim == 1
        b = sign(rand(M, N, 1) - 0.5);
    else
        b = randn(M, N, 3); b = b ./ sqrt(sum(b.^2, 3));
    end
    r = cat(2, zeros(M, 1, dim), cumsum(b, 2));
    R2 = mean(sum(r(:, end, :).^2, 3));
    Rg2 = mean(mean(sum((r - mean(r, 2)).^2, 3), 2));
    fprintf('%dD FJC: <R^2> = %.2f (N l^2 = %d), Rg^2 = %.2f (N l^2/6 = %.2f)\n', ...
            dim, R2, N, Rg2, N/6);
end
idx = 0:N-1; S = sum(sum(abs(idx' - idx)));
fprintf('direct sum: Rg^2 = %.4f = (l^2/6)(N - 1/N) = %.4f\n', S/(2*N^2), (N - 1/N)/6);

% 1D distribution: exact binomial vs Gaussian
for n = [0 10 20 30]
    fprintf('  n = %2d: exact %.5f, Gaussian %.5f\n', n, ...
            exp(gammaln(N+1) - gammaln((N+n)/2+1) - gammaln((N-n)/2+1) - N*log(2)), ...
            sqrt(2/(pi*N))*exp(-n^2/(2*N)));
end

% (3) fixed bond angle (freely rotating chain), cos(gamma) = 1/3
Nb = 200; c = 1/3; s = sqrt(1 - c^2);
b = randn(M, 3); b = b ./ vecnorm(b, 2, 2); R = b;
for k = 1:Nb-1
    t = randn(M, 3);
    u = t - sum(t.*b, 2).*b; u = u ./ vecnorm(u, 2, 2);
    b = c*b + s*u; R = R + b;
end
fprintf('tetrahedral chain: <R^2>/(N l^2) = %.3f (F^2 = 2)\n', mean(sum(R.^2, 2))/Nb);
fprintf('polyethylene N = 4000, l = 0.154 nm: contour %.0f nm, R_rms = %.1f nm, Rg = %.2f nm\n', ...
        4000*0.154, sqrt(8000)*0.154, sqrt(4000/3)*0.154);

% (4) entropy and restoring force
l = 0.5e-9; T = 298.15;
for x = [0.1 0.5 0.9]
    fprintf('nu = %.1f: F = %.2f pN (Hooke %.2f pN)\n', x, ...
            KB*T/(2*l)*log((1+x)/(1-x))*1e12, x*KB*T/l*1e12);
end
nu = linspace(-0.95, 0.95, 381);
figure(1);
subplot(1,2,1); plot(nu, -0.5*log((1+nu).^(1+nu).*(1-nu).^(1-nu)));
xlabel('\nu = n/N'); ylabel('\DeltaS / Nk'); title('conformational entropy');
subplot(1,2,2); plot(nu, 0.5*log((1+nu)./(1-nu)), nu, nu, '--'); ylim([-2.2 2.2]);
xlabel('\nu = n/N'); ylabel('F l / kT'); legend('exact', 'Hooke'); title('entropic force');
