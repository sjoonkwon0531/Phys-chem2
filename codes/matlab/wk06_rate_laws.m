% Wk06 - Chemical kinetics I: rate laws, initial rates, integrated rate laws
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU

% (1) 2 N2O5 -> 4 NO2 + O2: P = (1 + 3 alpha/2) P0
for al = [0 0.25 0.5 1]
    fprintf('alpha = %.2f: P/P0 = %.3f\n', al, 1 + 1.5*al);
end

% (2) method of initial rates: 2 I + Ar -> I2 + Ar
I0 = [1 2 4 6]*1e-5; Ar = [1e-3 5e-3 1e-2];
v0 = [8.70e-4 3.48e-3 1.39e-2 3.13e-2;
      4.35e-3 1.74e-2 6.96e-2 1.57e-1;
      8.69e-3 3.47e-2 1.38e-1 3.13e-1];
lk = zeros(1,3);
for j = 1:3
    p = polyfit(log10(I0), log10(v0(j,:)), 1); lk(j) = p(2);
    fprintf('[Ar] = %4.1f mM: slope a = %.3f, log k'' = %.3f\n', Ar(j)*1e3, p(1), p(2));
end
p = polyfit(log10(Ar), lk, 1);
kall = v0 ./ (I0.^2 .* Ar');
fprintf('order in Ar b = %.3f; k = %.2e dm^6 mol^-2 s^-1 (12-point mean)\n', p(1), mean(kall(:)));

% (3) successive half-lives
hl = {@(k,A) A/(2*k), @(k,A) log(2)/k, @(k,A) 1/(k*A)};
for n = 0:2
    fprintf('order %d half-lives: %.3f, %.3f, %.3f\n', n, hl{n+1}(1,1), hl{n+1}(1,0.5), hl{n+1}(1,0.25));
end

% (4) azomethane at 600 K
t = [0 1000 2000 3000 4000]; pr = [10.9 7.63 5.32 3.71 2.59];
q = polyfit(t, log(pr/pr(1)), 1); k1 = -q(1);
fprintf('azomethane: k = %.2e s^-1, t1/2 = %.0f s, tau = %.0f s\n', k1, log(2)/k1, 1/k1);

% (5) A + B -> P, unequal concentrations: RK4 vs integrated form
kr = 2; A0 = 1; B0 = 1.5; y = [A0; B0]; dt = 1e-3;
f = @(y) -kr*y(1)*y(2)*[1; 1];
for s = 1:1000
    k1_ = f(y); k2_ = f(y + dt/2*k1_); k3_ = f(y + dt/2*k2_); k4_ = f(y + dt*k3_);
    y = y + dt*(k1_ + 2*k2_ + 2*k3_ + k4_)/6;
end
fprintf('A + B -> P: ln ratio = %.6f, (B0-A0) k t = %.6f\n', log((y(2)/B0)/(y(1)/A0)), (B0-A0)*kr);

figure(1);
subplot(1,2,1); loglog(I0, v0', 'o-'); xlabel('[I]_0'); ylabel('v_0'); title('initial rates: slope 2');
subplot(1,2,2); plot(t, log(pr/pr(1)), 'o', t, q(1)*t, '-'); xlabel('t [s]'); ylabel('ln(p/p_0)');
title('azomethane: slope = -k');
