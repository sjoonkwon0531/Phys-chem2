% Week 12 - Debye model: k-point counting and the T^3 law
% Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
function wk12_debye_heat()
    R = 8.314462618;
    for M = [5 10 20 40]
        n = -M:M; [a, b, c] = ndgrid(n, n, n);
        fprintf('M = %2d: points %d, (4/3)pi M^3 = %.1f\n', M, nnz(a.^2 + b.^2 + c.^2 <= M^2), 4/3*pi*M^3);
    end
    A = 12*pi^4/5*R; th = 343; fprintf('T^3 coefficient = %.1f J/mol/K\n', A);
    for T = [5 10 20 40 100 200 300 1000]
        fprintf('T = %5d K: C_V = %8.4f, T^3 law %10.4f\n', T, debyeCv(T, th), A*(T/th)^3);
    end
    dU = debyeU(300, th) - debyeU(77, th);
    fprintf('Cu 300->77 K: Debye %.1f kJ/kg, Dulong-Petit %.1f kJ/kg\n', dU/63.546e-3/1e3, 3*R*223/63.546e-3/1e3);
end
function c = debyeCv(T, th)
    R = 8.314462618; n = 4000; xD = th/T; x = ((1:n) - 0.5)*xD/n;
    c = 9*R*(T/th)^3*sum(x.^4.*exp(x)./expm1(x).^2)*xD/n;
end
function u = debyeU(T, th)
    R = 8.314462618; n = 4000; xD = th/T; x = ((1:n) - 0.5)*xD/n;
    u = 9*R*T*(T/th)^3*sum(x.^3./expm1(x))*xD/n;
end
