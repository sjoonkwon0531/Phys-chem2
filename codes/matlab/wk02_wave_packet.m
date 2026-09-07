% Wk02 - Gaussian wave packet: minimum uncertainty & dispersion
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% hbar = m = 1.  sigma_x sigma_p = hbar/2;  sigma_x(t)^2 = eps + t^2/(4 eps).

hbar = 1; m = 1; p0 = 2;
x = linspace(-30, 30, 20001);
p = linspace(-10, 14, 20001);

fprintf('eps    sigma_x    sigma_p    product/hbar\n');
for eps = [0.5 1 2 3]
    Px = abs((1/(2*pi*eps))^0.25 * exp(-x.^2/(4*eps))).^2;
    Pp = abs((2*eps/(pi*hbar^2))^0.25 * exp(-eps*(p-p0).^2/hbar^2)).^2;
    sx = sqrt(trapz(x, x.^2.*Px) - trapz(x, x.*Px)^2);
    sp = sqrt(trapz(p, p.^2.*Pp) - trapz(p, p.*Pp)^2);
    fprintf('%4.1f  %9.5f  %9.5f  %11.5f\n', eps, sx, sp, sx*sp/hbar);
end

eps = 1.0;
figure(1);
subplot(1,2,1); hold on;
xs = linspace(-8, 28, 800);
for t = [0 3 6]
    s2 = eps + (hbar*t)^2/(4*m^2*eps); xc = p0*t/m;
    plot(xs, exp(-(xs-xc).^2/(2*s2))/sqrt(2*pi*s2), 'LineWidth', 1.4, ...
         'DisplayName', sprintf('t=%d, sigma=%.2f', t, sqrt(s2)));
end
xlabel('x'); ylabel('|\Psi(x,t)|^2'); legend; title('Free-packet dispersion');

subplot(1,2,2); hold on;
ts = linspace(0, 10, 300);
plot(ts, sqrt(eps + (hbar*ts).^2/(4*m^2*eps)), 'b-', 'LineWidth', 1.5);
yline(hbar/(2*sqrt(eps)), 'r--');
plot(ts, hbar*ts/(2*m*sqrt(eps)), 'k:');
xlabel('t'); legend('\sigma_x(t)', '\sigma_p (const)', 'asymptote');
title('Position uncertainty grows with time');
