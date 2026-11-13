% Week 12 - Planck distribution and the Einstein heat capacity
% Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
% <n> = 1/(e^x - 1), x = hbar w/kT;  C_V = 3R x^2 e^x/(e^x - 1)^2
function wk12_planck_einstein()
    R = 8.314462618; s = 0:3999;
    for x = [0.1 0.5 1 2 5]
        w = exp(-s*x); fprintf('x = %.1f: sum %.8f  formula %.8f\n', x, sum(s.*w)/sum(w), 1/expm1(x));
    end
    th = 240; T = [10 30 60 120 240 600 2000]; x = th./T;
    Cv = 3*R*x.^2.*exp(x)./expm1(x).^2;
    for i = 1:numel(T), fprintf('T = %5d K: C_V = %7.3f J/mol/K (C_V/3R = %.4f)\n', T(i), Cv(i), Cv(i)/(3*R)); end
    Tp = linspace(2, 600, 300); xp = th./Tp;
    figure; plot(Tp, 3*R*xp.^2.*exp(xp)./expm1(xp).^2/(3*R), 'LineWidth', 1.5); xlabel('T (K)'); ylabel('C_V/3R'); grid on;
end
