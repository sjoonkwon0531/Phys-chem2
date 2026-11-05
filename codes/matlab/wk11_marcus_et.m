% Week 11 - Marcus electron-transfer rate and bimolecular steady state
% Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
% k_ET = (2pi/hbar)|V|^2 (4 pi lam kT)^(-1/2) exp[-(lam + dG0)^2/(4 lam kT)]
% 1/k_r = 1/k_a + k_a'/(k_a k_et) (1 + k_et'/k_d)
function wk11_marcus_et()
    HBAR = 6.582119569e-16; KB = 8.617333262e-5; T = 298.15; kT = KB*T;
    lam = 1.0; V = 0.01; eta = 0.890e-3; ka = 8*8.314462618*T/(3*eta)*1e3; KA = 1.0;
    kM = @(dG0) 2*pi/HBAR*V^2/sqrt(4*pi*lam*kT)*exp(-(lam+dG0).^2/(4*lam*kT));
    karev = ka/KA; kd = karev;
    kr = @(dG0) 1./(1/ka + karev./(ka*kM(dG0)).*(1 + kM(dG0).*exp(dG0/kT)/kd));
    fprintf('k_a = %.3e M^-1 s^-1, k_ET max = %.4e s^-1\n', ka, kM(-lam));
    for dG0 = [0.2 0 -0.25 -0.5 -1 -1.5 -2 -2.5 -3]
        fprintf('%6.2f %8.4f %11.3e %11.3e\n', dG0, (lam+dG0)^2/(4*lam), kM(dG0), kr(dG0));
    end
    g = linspace(-3, 0.5, 400);
    figure; semilogy(-g, kM(g), -g, kr(g), 'LineWidth', 1.5);
    xlabel('-\Delta G^\circ (eV)'); ylabel('rate'); legend('k_{ET} (s^{-1})', 'k_r (M^{-1}s^{-1})'); grid on;
end
