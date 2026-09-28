% Wk05 - 2D Lennard-Jones MD: gas vs liquid & the RDF
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% Velocity Verlet, reduced units, periodic box. Cooling condenses the gas.

rng(7);
N = 100; L = 12.0; rc2 = 9.0; dt = 0.004;

figure(1); clf;
Ts = [1.5 0.45]; lbs = {'hot gas T*=1.5', 'cold liquid T*=0.45'};
for k = 1:2
    [pos, ~] = runmd(Ts(k), N, L, rc2, dt, 1500, 1500);
    [rr, g] = rdf(pos, N, L);
    [~, im] = max(g);
    fprintf('%s: RDF peak at r* = %.2f (2^(1/6) = 1.12)\n', lbs{k}, rr(im));
    subplot(1,3,k); scatter(pos(:,1), pos(:,2), 14, 'filled');
    axis([0 L 0 L]); axis square; title(lbs{k});
    subplot(1,3,3); hold on; plot(rr, g, 'DisplayName', lbs{k});
end
subplot(1,3,3); yline(1,'--'); xline(2^(1/6),':');
xlabel('r/\sigma'); ylabel('g(r)'); legend; title('RDF');

function [pos, E] = runmd(Tt, N, L, rc2, dt, neq, nprod)
    side = ceil(sqrt(N));
    [gx, gy] = meshgrid(0:side-1, 0:side-1);
    g = [gx(:) gy(:)]; g = g(1:N,:);
    pos = (g + 0.5)*(L/side);
    vel = sqrt(Tt)*randn(N,2); vel = vel - mean(vel);
    [F, ~] = forces(pos, N, L, rc2);
    E = zeros(neq+nprod,1);
    for s = 1:neq+nprod
        vel = vel + 0.5*dt*F;
        pos = mod(pos + dt*vel, L);
        [F, pot] = forces(pos, N, L, rc2);
        vel = vel + 0.5*dt*F;
        ke = 0.5*sum(vel(:).^2);
        if s <= neq
            vel = vel*sqrt(1 + 0.02*(Tt*N/ke - 1));   % gentle thermostat
        end
        E(s) = ke + pot;
    end
end

function [F, pot] = forces(pos, N, L, rc2)
    dx = pos(:,1) - pos(:,1)'; dy = pos(:,2) - pos(:,2)';
    dx = dx - L*round(dx/L); dy = dy - L*round(dy/L);
    r2 = dx.^2 + dy.^2 + eye(N)*1e9;
    inv2 = (r2 < rc2)./r2; inv6 = inv2.^3;
    fmag = 24*inv2.*inv6.*(2*inv6 - 1);
    F = [sum(fmag.*dx, 2), sum(fmag.*dy, 2)];
    pot = 2*sum(inv6(:).^2 - inv6(:));
end

function [rc_, g] = rdf(pos, N, L)
    dx = pos(:,1) - pos(:,1)'; dy = pos(:,2) - pos(:,2)';
    dx = dx - L*round(dx/L); dy = dy - L*round(dy/L);
    r = sqrt(dx.^2 + dy.^2); r = r(triu(true(N),1));
    edges = linspace(0, 5, 61);
    h = histcounts(r, edges);
    rc_ = 0.5*(edges(1:end-1) + edges(2:end)); dr = edges(2) - edges(1);
    ideal = 2*pi*rc_*dr * N*(N-1)/2 / L^2 * 2;
    g = h ./ ideal;
end
