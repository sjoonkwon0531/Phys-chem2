% Wk09 — Diffusion- and reaction-limited aggregation; Smoluchowski coagulation
% Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
%
% (1) 2D lattice particle-cluster aggregation with sticking probability alpha
%     (alpha = 1: DLA, d_f ~ 1.71; alpha << 1: RLA, denser). d_f from N ~ Rg^d_f.
%     Lecture values 1.45 / 1.55 (2D) refer to cluster-cluster aggregation.
% (2) Smoluchowski, constant kernel: c_s = c0 tau^(s-1)/(1+tau)^(s+1), tau = k c0 t/2
%
% Run:  wk09_dla_aggregation     (DLA loops take a few minutes in MATLAB)
clear; rng(9);
fprintf('(1) 2D lattice particle-cluster aggregation\n');
for alpha = [1.0 0.1]
    [Rg, df, G] = grow(2500, alpha);
    fprintf('    alpha = %4.2f, N = 2500:  Rg = %6.1f,  d_f = %.2f\n', alpha, Rg, df);
end
fprintf('    reference: Witten-Sander DLA d_f = 1.71 (2D); small clusters read a little high\n\n');
figure; imagesc(G); axis image off; colormap(gray); title('last cluster');

k = 1; c0 = 1; Smax = 400; dt = 1e-3; tend = 10;
c = zeros(Smax, 1); c(1) = c0;
rhs = @(y) smol(y, k, Smax);
for nstep = 1:round(tend/dt)
    k1 = rhs(c); k2 = rhs(c + dt/2*k1); k3 = rhs(c + dt/2*k2); k4 = rhs(c + dt*k3);
    c = c + dt/6*(k1 + 2*k2 + 2*k3 + k4);
end
tau = k*c0*tend/2; s = (1:Smax)';
exact = c0*exp((s - 1)*log(tau) - (s + 1)*log(1 + tau));
fprintf('(2) Smoluchowski, constant kernel, tau = %.1f\n', tau);
fprintf('    clusters %.6f (exact %.6f)   mass %.6f   <S> %.4f (exact %.4f)\n', ...
        sum(c), c0/(1 + tau), sum(s.*c), sum(s.*c)/sum(c), 1 + tau);
for si = [1 2 5 10], fprintf('    c_%-2d numeric %.6e   exact %.6e\n', si, c(si), exact(si)); end

function out = smol(y, k, Smax)
    conv2 = conv(y, y);                 % conv2(s-1) = sum_{i+j=s} y_i y_j  (1-based shift)
    out = zeros(Smax, 1);
    out(2:Smax) = 0.5*k*conv2(1:Smax-1);
    out = out - k*y*sum(y);
end

function [Rg, df, G] = grow(Npart, alpha)
    L = 401; c = (L + 1)/2; G = false(L);
    G(c, c) = true; rmax = 1; sum2 = 0; hist = zeros(0, 2);
    DX = [1 -1 0 0]; DY = [0 0 1 -1];
    for n = 2:Npart
        stuck = false;
        while ~stuck
            th = 2*pi*rand; x = round((rmax + 5)*cos(th)); y = round((rmax + 5)*sin(th));
            while true
                d = randi(4);
                if G(c + x + DX(d), c + y + DY(d)), continue; end
                x = x + DX(d); y = y + DY(d); r2 = x^2 + y^2;
                if r2 > (2*rmax + 20)^2, break; end
                if r2 > (rmax + 3)^2, continue; end
                if (G(c+x+1, c+y) || G(c+x-1, c+y) || G(c+x, c+y+1) || G(c+x, c+y-1)) && rand < alpha
                    G(c + x, c + y) = true; sum2 = sum2 + r2; rmax = max(rmax, sqrt(r2));
                    hist(end+1, :) = [n, sqrt(sum2/n)]; %#ok<AGROW>
                    stuck = true; break;
                end
            end
        end
    end
    Rg = hist(end, 2);
    h = hist(hist(:,1) >= 200, :);
    pf = polyfit(log(h(:,2)), log(h(:,1)), 1); df = pf(1);
end
