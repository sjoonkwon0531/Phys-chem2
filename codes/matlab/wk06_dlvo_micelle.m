% Wk06 - Colloid stability (DLVO) and micelle formation
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% U = -A a/12h + (64 pi kT n0 a gamma^2/kappa^2) exp(-kappa h); CMC model.

E = 1.602176634e-19; KB = 1.380649e-23; NA = 6.02214076e23;
EPS = 78.5*8.8541878128e-12; T = 298.15; KT = KB*T;
kappa = @(c, z) sqrt(2*z^2*E^2*1000*NA*c/(EPS*KT));

fprintf('1:1 salt    kappa^-1 [nm]   0.304/sqrt(c)\n');
for c = [1e-3 1e-2 0.1 0.15 0.6]
    fprintf('  %.3f M   %8.3f      %8.3f\n', c, 1e9/kappa(c,1), 0.304/sqrt(c));
end

a = 100e-9; AH = 2e-20; phi0 = 0.030; z = 1;
g = tanh(z*E*phi0/(4*KT));
dlvo = @(h, c) (-AH*a./(12*h) + 64*pi*KT*1000*NA*c*a*g^2/kappa(c,z)^2 .* exp(-kappa(c,z)*h))/KT;
h = logspace(log10(0.1e-9), log10(100e-9), 6000);
fprintf('\na = 100 nm, A_H = 2e-20 J, phi0 = 30 mV:\n  c [M]   barrier/kT   h [nm]\n');
for c = [1e-3 1e-2 3e-2 0.1 0.6]
    [Um, j] = max(dlvo(h, c));
    if Um <= 0
        fprintf('  %.3f   no barrier -> rapid coagulation\n', c);
    else
        fprintf('  %.3f   %8.1f    %6.2f\n', c, Um, h(j)*1e9);
    end
end

% critical coagulation concentration (kappa h = 1 at the vanishing barrier)
ccc = @(zz, gg) (384*pi*EPS*KT^2*gg^2/(exp(1)*zz^2*E^2*AH))^2 * EPS*KT/(2*zz^2*E^2)/(1000*NA);
fprintf('\nccc at phi0 = 30 mV: z=1 %.1f mM, z=2 %.1f mM, z=3 %.2f mM\n', ...
        ccc(1, tanh(E*phi0/(4*KT)))*1e3, ccc(2, tanh(2*E*phi0/(4*KT)))*1e3, ...
        ccc(3, tanh(3*E*phi0/(4*KT)))*1e3);
fprintf('high-potential limit: 1 : 1/%.0f : 1/%.0f (Schulze-Hardy z^-6)\n', ...
        ccc(1,1)/ccc(2,1), ccc(1,1)/ccc(3,1));

% micelles: closed association, c = m + N K m^N (K = 1)
fprintf('\nfraction micellised:  c_tot    N=3     N=30    N=100\n');
for ct = [0.5 0.9 1.0 1.5 3.0 10.0]
    fr = zeros(1,3); Ns = [3 30 100];
    for q = 1:3
        lo = 0; hi = ct;
        for it = 1:200
            mid = (lo+hi)/2;
            if mid + Ns(q)*mid^Ns(q) > ct, hi = mid; else, lo = mid; end
        end
        fr(q) = 1 - lo/ct;
    end
    fprintf('                      %5.2f   %.3f   %.3f   %.3f\n', ct, fr);
end

figure(1); hold on;
for c = [1e-3 1e-2 3e-2 0.1]
    plot(h*1e9, dlvo(h, c), 'DisplayName', sprintf('%g mM', c*1e3));
end
set(gca, 'XScale', 'log'); ylim([-40 60]); yline(0, ':');
xlabel('gap h [nm]'); ylabel('U / kT'); legend; title('DLVO: salt lowers the barrier');
