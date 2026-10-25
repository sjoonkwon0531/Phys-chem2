% Wk09 — Encounter pairs, diffusion control, and the 1D material balance
% Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
%
% (1) k_r/k_d = k_a/(k_a + k_d')
% (2) k_d = 8RT/(3 eta);  Smoluchowski k_d = 4 pi R* (D_A + D_B) N_A
%     Brownian MC around an absorbing sphere vs. 4 pi c0 (t + 2 sqrt(t/pi))  (R* = D = 1)
% (3) dc/dt = D c'' - v c' - k c, finite differences vs. the analytic pulse
%
% Run:  wk09_diffusion_transport     (~30 s)
clear; rng(9);
R = 8.314462618; NA = 6.02214076e23;

fprintf('(1) k_r/k_d = k_a/(k_a + k_d'')\n');
for ka = [1e12 1e10 1e8]
    fprintf('    k_a = %.0e, k_d'' = 1e10:  k_r/k_d = %.4f\n', ka, ka/(ka+1e10));
end

T = 298.15;
sol = {'hexane', 'water', 'ethylene glycol', 'glycerol'}; eta = [0.300e-3 0.890e-3 16.06e-3 0.934];
fprintf('\n(2) k_d = 8RT/(3 eta) at 298.15 K\n');
for i = 1:4
    fprintf('    %-16s eta = %8.3f mPa s   k_d = %.2e dm^3 mol^-1 s^-1\n', sol{i}, eta(i)*1e3, 8*R*T/(3*eta(i))*1e3);
end
fprintf('    Smoluchowski, R* = 0.4 nm, D = 4e-9 m^2/s: k_d = %.3e dm^3 mol^-1 s^-1\n', 4*pi*0.4e-9*4e-9*NA*1e3);

% Brownian dynamics (units R* = 1, D = 1)
Np = 100000; Rout = 8; dt = 1e-3; nstep = 1500;
u = randn(Np, 3); u = u ./ vecnorm(u, 2, 2);
r = (1 + (Rout^3 - 1)*rand(Np, 1)).^(1/3);
pos = u .* r;
c0 = Np / (4/3*pi*(Rout^3 - 1));
alive = true(Np, 1); cap = 0;
fprintf('\n    Brownian MC (R* = 1, D = 1)\n      t      MC      theory   MC/theory\n');
for st = 1:nstep
    ro = vecnorm(pos, 2, 2);
    pos(alive, :) = pos(alive, :) + sqrt(2*dt)*randn(nnz(alive), 3);
    rr = vecnorm(pos, 2, 2);
    graze = rand(Np, 1) < exp(-max((ro - 1).*(rr - 1), 0)/dt);   % Brownian-bridge correction
    hit = alive & ((rr < 1) | graze);
    cap = cap + nnz(hit); alive = alive & ~hit;
    out = alive & (rr > Rout);
    pos(out, :) = pos(out, :) .* ((2*Rout - rr(out)) ./ rr(out));
    if mod(st, 250) == 0
        t = st*dt; th = 4*pi*c0*(t + 2*sqrt(t/pi));
        fprintf('    %5.2f   %6d   %8.1f    %6.3f\n', t, cap, th, cap/th);
    end
end

% (3) material balance
D = 1e-9; v = 2e-6; k = 50; L = 1.2e-4; nx = 1601;
x = linspace(-L/2, L/2, nx)'; dx = x(2) - x(1); h = 0.2*dx^2/D;
pulse = @(t) exp(-(x - v*t).^2/(4*D*t)) ./ (2*sqrt(pi*D*t)) * exp(-k*t);
t0 = 1e-3; tend = 0.03; t = t0; c = pulse(t0);
while t < tend - 1e-15
    hh = min(h, tend - t);
    lap = ([c(2:end); 0] - 2*c + [0; c(1:end-1)]) / dx^2;
    grad = ([c(2:end); 0] - [0; c(1:end-1)]) / (2*dx);
    c = c + hh*(D*lap - v*grad - k*c); c([1 end]) = 0; t = t + hh;
end
ca = pulse(t);
mass = sum(c)*dx; mu = sum(x.*c)*dx/mass; var = sum((x - mu).^2.*c)*dx/mass;
fprintf('\n(3) material balance, t = %.0f ms\n', t*1e3);
fprintf('    max |FD - analytic|/peak = %.2e\n', max(abs(c - ca))/max(ca));
fprintf('    amount %.5f  e^-kt = %.5f\n    mean %.4f um  vt = %.4f um\n    var %.4f um^2  2Dt = %.4f um^2\n', ...
        mass, exp(-k*t), mu*1e6, v*t*1e6, var*1e12, 2*D*t*1e12);
fprintf('    sqrt(D/k) = %.2f um\n', sqrt(D/k)*1e6);
