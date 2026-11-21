% Week 13 (Physical Chemistry 2) - Reciprocal lattice and Brillouin zones
%   1) b1 = 2 pi (a2 x a3)/(a1 . a2 x a3), etc.; check b_i . a_j = 2 pi delta_ij
%   2) reciprocal of SC is SC, of BCC is FCC, of FCC is BCC
%   3) BZ volume = (2 pi)^3 / V_cell and number of faces of the first BZ
%   4) 2D Wigner-Seitz cell by half-plane clipping
%   5) Fourier coefficients of a 1D periodic Gaussian density
clear; clc;
names = {'SC', 'BCC', 'FCC'};
L = {eye(3), [-1 1 1; 1 -1 1; 1 1 -1] / 2, [0 1 1; 1 0 1; 1 1 0] / 2};
fprintf('1-3) Reciprocal vectors (units of 2pi/a), BZ volume, faces of the first BZ\n');
for n = 1:3
    A = L{n}; Vc = dot(A(1, :), cross(A(2, :), A(3, :)));
    B = 2 * pi * [cross(A(2, :), A(3, :)); cross(A(3, :), A(1, :)); cross(A(1, :), A(2, :))] / Vc;
    err = max(max(abs(B * A' / (2 * pi) - eye(3))));
    G = [];
    for i = -2:2, for j = -2:2, for k = -2:2
        g = i * B(1, :) + j * B(2, :) + k * B(3, :);
        if norm(g) > 1e-9, G(end + 1, :) = g; end %#ok<AGROW>
    end, end, end
    faces = 0;
    for p = 1:size(G, 1)
        c = G(p, :) / 2; ok = true;
        for q = 1:size(G, 1)
            if q ~= p && norm(c - G(q, :)) <= norm(c) + 1e-9, ok = false; break; end
        end
        faces = faces + ok;
    end
    fprintf('   %-3s b1 = (%g %g %g), b2 = (%g %g %g), b3 = (%g %g %g); err %.1e; V_BZ V_cell/(2pi)^3 = %.6f; faces = %d\n', ...
        names{n}, B(1, :) / (2 * pi), B(2, :) / (2 * pi), B(3, :) / (2 * pi), err, ...
        abs(det(B)) * abs(Vc) / (2 * pi)^3, faces);
end

fprintf('\n4) 2D Wigner-Seitz cells by half-plane clipping\n');
cases = {'square', [1 0], [0 1]; 'hexagonal', [1 0], [0.5 sqrt(3) / 2]; 'oblique', [1 0], [0.3 0.8]};
for c = 1:3
    a1 = cases{c, 2}; a2 = cases{c, 3};
    P = [-10 -10; 10 -10; 10 10; -10 10];
    for i = -3:3, for j = -3:3
        if i == 0 && j == 0, continue; end
        T = i * a1 + j * a2; cc = dot(T, T) / 2; Q = [];
        for k = 1:size(P, 1)
            p = P(k, :); q = P(mod(k, size(P, 1)) + 1, :);
            fp = dot(p, T) - cc; fq = dot(q, T) - cc;
            if fp <= 0, Q(end + 1, :) = p; end %#ok<AGROW>
            if fp * fq < 0, Q(end + 1, :) = p + (q - p) * fp / (fp - fq); end %#ok<AGROW>
        end
        keep = [true; vecnorm(diff(Q), 2, 2) > 1e-9];
        P = Q(keep, :);
        if size(P, 1) > 1 && norm(P(1, :) - P(end, :)) < 1e-9, P(end, :) = []; end
    end, end
    fprintf('   %-9s: %d vertices, WS area = %.6f, |a1 x a2| = %.6f\n', cases{c, 1}, size(P, 1), ...
        polyarea(P(:, 1), P(:, 2)), abs(a1(1) * a2(2) - a1(2) * a2(1)));
end

fprintf('\n5) Fourier coefficients of a 1D Gaussian density (sigma = 0.08 a)\n');
N = 4096; sig = 0.08; x = (0:N - 1) / N;
n = (exp(-(x + 1).^2 / (2 * sig^2)) + exp(-x.^2 / (2 * sig^2)) + exp(-(x - 1).^2 / (2 * sig^2))) / (sqrt(2 * pi) * sig);
for p = 0:5
    np_ = mean(n .* exp(-2i * pi * p * x));
    fprintf('   p = %d: n_p = %+.5f (analytic %.5f)\n', p, real(np_), exp(-(2 * pi * p * sig)^2 / 2));
end
