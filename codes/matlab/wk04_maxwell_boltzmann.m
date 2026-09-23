% Wk04 - Kinetic model & Maxwell-Boltzmann distribution
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% f(v) = 4 pi (M/2piRT)^{3/2} v^2 exp(-Mv^2/2RT); v_mp < v_mean < v_rms.

R = 8.314462618;
fspeed = @(v, M, T) 4*pi*(M/(2*pi*R*T)).^1.5 .* v.^2 .* exp(-M*v.^2/(2*R*T));

M = 0.0280134; T = 298.15;             % N2
v = linspace(0, 3000, 60001);
fv = fspeed(v, M, T);
vmp = sqrt(2*R*T/M); vmean = sqrt(8*R*T/(pi*M)); vrms = sqrt(3*R*T/M);
fprintf('N2 at 298 K:\n');
fprintf('  int f dv = %.6f\n', trapz(v, fv));
fprintf('  v_mp = %.1f, v_mean = %.1f (num %.1f), v_rms = %.1f (num %.1f) m/s\n', ...
        vmp, vmean, trapz(v, v.*fv), vrms, sqrt(trapz(v, v.^2.*fv)));
fprintf('  <KE>/mol = %.1f J = 3/2 RT = %.1f J\n', ...
        0.5*M*trapz(v, v.^2.*fv), 1.5*R*T);
fprintf('  ratios 1 : %.4f : %.4f (theory 1 : 1.1284 : 1.2247)\n\n', vmean/vmp, vrms/vmp);

figure(1);
subplot(1,2,1); hold on;
for Tp = [100 298 1000]
    plot(v(1:20000), fspeed(v(1:20000), M, Tp), 'DisplayName', sprintf('T = %d K', Tp));
end
xlabel('v [m/s]'); legend; title('N_2: hotter -> broader');
subplot(1,2,2); hold on;
gases = {0.002016 'H_2'; 0.004003 'He'; 0.0280134 'N_2'; 0.1313 'Xe'};
for i = 1:4
    plot(v, fspeed(v, gases{i,1}, 298.15), 'DisplayName', gases{i,2});
end
xlabel('v [m/s]'); legend; title('lighter -> faster (298 K)');

% equipartition ladder
fprintf('DOF f -> Cv = f/2 R:\n');
for fd = [3 5 7]
    fprintf('  f = %d: Cv = %.2f J/mol K\n', fd, fd/2*R);
end
fprintf('-> Cv(T) of H2 steps 3/2R -> 5/2R -> 7/2R (quantum freeze-out)\n');
