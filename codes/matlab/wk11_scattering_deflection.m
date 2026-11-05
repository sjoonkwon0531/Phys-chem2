% Week 11 - Classical elastic scattering: deflection function (Lennard-Jones, reduced units)
% Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
% theta(b) = pi - 2 b Int_{r0}^inf dr / (r^2 sqrt(1 - b^2/r^2 - V(r)/E)),  u = r0/r = 1 - w^2
function wk11_scattering_deflection()
    % hard sphere Monte Carlo: dsigma/dOmega = d^2/4 in every cos(theta) bin
    rng(1); n = 200000; b = sqrt(rand(n,1)); th = 2*acos(b);
    counts = histcounts(cos(th), linspace(-1,1,11));
    fprintf('Hard sphere dsigma/dOmega (expect 0.25): %s\n', mat2str(round(pi*counts/n/(2*pi*0.2),3)));
    for E = [2 5 10]
        bs = linspace(0.02, 3, 600); th = arrayfun(@(bb) deflection(bb, E), bs);
        [tmin, i] = min(th); [~, j] = min(abs(th(1:i-1)));
        fprintf('E* = %5.1f: rainbow = %7.2f deg at b = %.3f, glory at b = %.3f\n', E, rad2deg(tmin), bs(i), bs(j));
    end
    figure; plot(bs, rad2deg(th), 'LineWidth', 1.5); xlabel('b/\sigma'); ylabel('\theta (deg)');
    title('LJ deflection function, E^* = 10'); grid on;
end
function v = V(r), v = 4*(r.^-12 - r.^-6); end
function r0 = turning(b, E)
    f = @(r) 1 - (b./r).^2 - V(r)/E;
    rs = linspace(max(5, 3*b), 0.5, 6000); fv = f(rs);
    i = find(fv(1:end-1) > 0 & fv(2:end) <= 0, 1);
    r0 = fzero(f, [rs(i+1) rs(i)]);
end
function th = deflection(b, E)
    N = 1000; r0 = turning(b, E); w = ((1:N) - 0.5)/N; u = 1 - w.^2;
    g = 1 - (b*u/r0).^2 - V(r0./u)/E;
    th = pi - 2*b/r0*sum(2*w./sqrt(max(g, 1e-300)))/N;
end
