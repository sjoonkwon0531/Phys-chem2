% Wk06 - Chemical kinetics II: approach to equilibrium, relaxation, Arrhenius
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU

R = 8.314462618;

% (1) A <-> B: RK4 vs closed form
kf = 2; kb = 0.5; A0 = 1; dt = 1e-3; n = 3000;
a = A0; traj = zeros(1, n+1); traj(1) = a; f = @(a) -kf*a + kb*(A0 - a);
for s = 1:n
    k1 = f(a); k2 = f(a + dt/2*k1); k3 = f(a + dt/2*k2); k4 = f(a + dt*k3);
    a = a + dt*(k1 + 2*k2 + 2*k3 + k4)/6; traj(s+1) = a;
end
tt = (0:n)*dt; ex = A0*(kb + kf*exp(-(kf+kb)*tt))/(kf+kb);
Aeq = kb*A0/(kf+kb);
fprintf('max |RK4 - exact| = %.2e; K = %.3f = k/k'' = %.3f; tau = %.3f\n', ...
        max(abs(traj - ex)), (A0-Aeq)/Aeq, kf/kb, 1/(kf+kb));

% (2) temperature jump: water autoprotolysis
Kw = 1.008e-14; tau = 37e-6; K = Kw/55.6;
krev = (1/tau)/(K + 2*sqrt(Kw)); kfwd = K*krev;
fprintf('T-jump: k'' = %.2e dm^3/mol/s, k = %.2e 1/s (one event per %.0f h)\n', ...
        krev, kfwd, 1/kfwd/3600);

% (3) Arrhenius fit (acetaldehyde decomposition, textbook data)
T = [700 730 760 790 810 840 910 1000];
k = [0.011 0.035 0.105 0.343 0.789 2.17 20.0 145.0];
p = polyfit(1./T, log(k), 1);
fprintf('Arrhenius: Ea = %.0f kJ/mol, A = %.2e dm^3/mol/s\n', -p(1)*R/1e3, exp(p(2)));
fprintf('doubling per 10 K at 298 K <-> Ea = %.1f kJ/mol\n', log(2)*R/(1/298 - 1/308)/1e3);

% (4) catalysis
for dEa = [5e3 19e3 40e3]
    fprintf('dEa = %2.0f kJ/mol -> rate x %.3g\n', dEa/1e3, exp(dEa/(R*298)));
end

figure(1);
subplot(1,2,1); plot(tt, traj, tt, A0 - traj); yline(Aeq, ':'); legend('[A]', '[B]');
xlabel('t'); title('A <-> B');
subplot(1,2,2); plot(1e3./T, log(k), 'o', 1e3./T, polyval(p, 1./T), '-');
xlabel('1000/T'); ylabel('ln k'); title('Arrhenius plot');
