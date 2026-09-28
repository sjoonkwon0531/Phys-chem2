% Wk05 - Surface tension: Young-Laplace, capillary rise, wetting, Kelvin
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU

Rg = 8.314462618; G = 9.80665;
SIG = 72.75e-3; RHO = 998.0; VM = 1.807e-5;   % water

% (1) Young-Laplace
fprintf('water droplet r      excess pressure 2 sigma/r\n');
for r = [1e-3 1e-6 1e-8]
    dp = 2*SIG/r;
    fprintf('  %10.0f nm   %10.3e Pa = %8.3f atm\n', r*1e9, dp, dp/101325);
end

% (2) capillary rise sigma = rho g h a / (2 cos theta)
fprintf('\ncapillary rise:\n');
for a = [0.2e-3 0.5e-3 1e-3]
    h = 2*SIG/(RHO*G*a);
    fprintf('  water, a = %.1f mm: h = %6.1f mm\n', a*1e3, h*1e3);
end
h_hg = 2*472e-3*cosd(140)/(13546*G*0.5e-3);
fprintf('  mercury (140 deg), a = 0.5 mm: h = %6.1f mm (depression)\n', h_hg*1e3);

% (3) Young equation & wetting
fprintf('\nsurface        theta_c   1+cos(theta) = w_ad/sigma_lg\n');
surfs = {'glass' 5; 'polymer' 95; 'rubber' 110; 'PTFE' 125};
for i = 1:4
    fprintf('  %-10s %6d   %7.3f  (%s)\n', surfs{i,1}, surfs{i,2}, ...
            1+cosd(surfs{i,2}), ternary(surfs{i,2} < 90, 'wets', 'non-wetting'));
end

% (4) Kelvin equation
T = 298.15;
fprintf('\nKelvin: p/p* = exp(2 sigma Vm / r R T)\n');
for r = [1e-6 1e-7 1e-8 1e-9]
    fprintf('  r = %6.0f nm: p/p* = %7.3f\n', r*1e9, exp(2*SIG*VM/(r*Rg*T)));
end
fprintf('-> Ostwald ripening: small droplets feed the large ones\n');

figure(1);
rr = logspace(-9, -6, 200);
subplot(1,2,1); loglog(rr*1e9, 2*SIG./rr/1e5);
xlabel('r [nm]'); ylabel('\Delta p [bar]'); title('Laplace pressure');
subplot(1,2,2); semilogx(rr*1e9, exp(2*SIG*VM./(rr*Rg*T))); yline(1,'--');
xlabel('r [nm]'); ylabel('p/p*'); title('Kelvin equation');

function s = ternary(c, a, b)
    if c, s = a; else, s = b; end
end
