% Week 13 (Physical Chemistry 2) - Crystal geometry of cubic lattices
%   1) cell volumes, nearest neighbours and packing fractions of SC, BCC, FCC
%   2) Miller indices from intercepts
%   3) interplanar spacing d_hkl = a / sqrt(h^2 + k^2 + l^2)
%   4) Bragg's law example: {111} at 2theta = 22.4 deg, lambda = 154 pm
clear; clc;
names = {'SC', 'BCC', 'FCC'};
L = {eye(3), [-1 1 1; 1 -1 1; 1 1 -1] / 2, [0 1 1; 1 0 1; 1 1 0] / 2};
fprintf('1) Cubic lattices (conventional cube edge a = 1)\n');
for n = 1:3
    A = L{n}; Vp = abs(det(A)); d = [];
    for i = -3:3, for j = -3:3, for k = -3:3
        r = norm(i * A(1, :) + j * A(2, :) + k * A(3, :));
        if r > 1e-9, d(end + 1) = r; end %#ok<AGROW>
    end, end, end
    dnn = min(d); z = sum(abs(d - dnn) < 1e-9);
    pf = 4 / 3 * pi * (dnn / 2)^3 / Vp;
    fprintf('   %-3s: V_prim = %.4f a^3, points per cube = %.0f, z = %2d, d_nn = %.4f a, packing fraction = %.4f\n', ...
        names{n}, Vp, 1 / Vp, z, dnn, pf);
end

fprintf('\n2) Miller indices from intercepts (Inf = parallel to that axis)\n');
IC = [3 2 2; 1 1 1; 1 Inf Inf; 0.5 1 Inf; 2 3 6; 1 -1 Inf];
for r = 1:size(IC, 1)
    rec = 1 ./ IC(r, :);                       % reciprocals, Inf -> 0
    [num, den] = rat(rec);
    l = 1; for q = den, l = lcm(l, q); end
    h = num .* (l ./ den);
    g = 0; for q = abs(h(h ~= 0)), g = gcd(g, q); end
    fprintf('   intercepts (%g, %g, %g) -> (%d %d %d)\n', IC(r, :), h / g);
end

fprintf('\n3) Interplanar spacing in a cubic lattice\n');
H = [1 0 0; 1 1 0; 1 1 1; 2 0 0; 2 1 0; 2 1 1; 2 2 0; 3 1 1];
for r = 1:size(H, 1)
    fprintf('   (%d%d%d)  d = %.5f a\n', H(r, :), 1 / norm(H(r, :)));
end

fprintf('\n4) Bragg''s law example (lecture slide 13)\n');
lam = 154; tth = 22.4;
d111 = lam / (2 * sind(tth / 2));
fprintf('   d111 = %.1f pm, a = sqrt(3) d111 = %.1f pm\n', d111, sqrt(3) * d111);
