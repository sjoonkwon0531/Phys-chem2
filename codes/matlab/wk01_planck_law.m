% Wk01 - Planck's law of blackbody radiation
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% Rayleigh-Jeans / Wien / Planck spectra, Wien displacement, Stefan-Boltzmann.

h = 6.62607015e-34; c = 2.99792458e8; kB = 1.380649e-23;
sigma = 5.670374419e-8;
C1 = 2*pi*h*c^2;  C2 = h*c/kB;

planck = @(lam,T) C1./lam.^5 ./ (exp(C2./(lam*T)) - 1);
rj     = @(lam,T) 2*pi*c*kB*T ./ lam.^4;
wienap = @(lam,T) C1./lam.^5 .* exp(-C2./(lam*T));

lam = logspace(-7, -4.5, 800);
Ts  = [3000 4000 5000 5800];

figure(1); subplot(1,2,1); hold on;
for T = Ts, plot(lam*1e6, planck(lam,T), 'LineWidth', 1.5); end
plot(lam*1e6, rj(lam,5800), 'k--');
plot(lam*1e6, wienap(lam,5800), 'k:');
xlim([0 3]); ylim([0 1.15*max(planck(lam,5800))]);
xlabel('wavelength [\mum]'); ylabel('E_{b\lambda} [W/m^2/m]');
legend('3000 K','4000 K','5000 K','5800 K','R-J 5800 K','Wien 5800 K');
title('Blackbody spectra & UV catastrophe');

fprintf('T [K]   lambda_max [um]   lambda_max*T [um K]\n');
for T = Ts
    [~, i] = max(planck(lam, T));
    fprintf('%6.0f  %14.4f  %16.1f\n', T, lam(i)*1e6, lam(i)*T*1e6);
end
fprintf('Wien predicts lambda_max*T = 2898 um K\n\n');

lam_i = logspace(-8, -3, 40000);
fprintf('T [K]    integral            sigma*T^4        ratio\n');
for T = Ts
    Etot = trapz(lam_i, planck(lam_i, T));
    fprintf('%6.0f  %16.6e  %14.6e  %8.5f\n', T, Etot, sigma*T^4, Etot/(sigma*T^4));
end

subplot(1,2,2); Tspan = linspace(1000, 8000, 60); lmax = zeros(size(Tspan));
for k = 1:numel(Tspan)
    [~, i] = max(planck(lam, Tspan(k))); lmax(k) = lam(i);
end
plot(Tspan, lmax*1e6, 'b-', Tspan, 2898./Tspan, 'r--', 'LineWidth', 1.5);
xlabel('T [K]'); ylabel('\lambda_{max} [\mum]');
legend('numerical peak','2898/T (Wien)'); title("Wien's displacement law");
