% Wk10 — Lattice (regular-solution) model of a binary mixture A/B
% Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
%
% (1) dF/(NkT) = chi phi(1-phi) + phi ln phi + (1-phi) ln(1-phi)
%     spinodal chi_s = 1/(2 phi(1-phi)); binodal ln(phi/(1-phi)) = chi(2phi-1); chi_c = 2
% (2) Kawasaki Monte Carlo (z = 4): unlike-pair cost = kappa/z = chi kT/4.
%     Exact 2D critical point chi_c = 2z/2.269 = 3.53, not the mean-field 2.
%
% Run:  wk10_lattice_mixing     (Monte Carlo loops: a few minutes in MATLAB)
clear; rng(10);
fprintf('(1) mean-field phase boundaries\n     chi    T/Tc    binodal    spinodal\n');
for chi = [2.2 2.5 3.0 3.5 4.0]
    b = fzero(@(p) log(p/(1 - p)) - chi*(2*p - 1), [1e-12 0.5 - 1e-6]);
    fprintf('    %4.1f   %5.3f    %.4f     %.4f\n', chi, 2/chi, b, 0.5*(1 - sqrt(1 - 2/chi)));
end

L = 48; sweeps = 400; dx = [1 -1 0 0]; dy = [0 0 1 -1];
wrap = @(i) mod(i - 1, L) + 1;
fprintf('\n(2) Kawasaki MC, %dx%d, phi = 0.5\n     chi    unlike-bond fraction (random = 0.5)\n', L, L);
for chi = [1.0 2.5 3.5 4.5 6.0]
    s = 2*(rand(L) < 0.5) - 1; de = chi/4;
    for step = 1:sweeps*L*L
        i = randi(L); j = randi(L); d = randi(4); k = wrap(i + dx(d)); l = wrap(j + dy(d));
        v1 = s(i, j); v2 = s(k, l);
        if v1 == v2, continue; end
        before = unl(s, i, j, v1, L) + unl(s, k, l, v2, L);
        s(i, j) = v2; s(k, l) = v1;
        after = unl(s, i, j, v2, L) + unl(s, k, l, v1, L);
        dE = (after - before)*de;
        if dE > 0 && rand >= exp(-dE), s(i, j) = v1; s(k, l) = v2; end
    end
    ub = (sum(s(:) ~= reshape(circshift(s, 1, 1), [], 1)) + sum(s(:) ~= reshape(circshift(s, 1, 2), [], 1)))/(2*L*L);
    fprintf('    %4.1f        %.3f\n', chi, ub);
end
figure; imagesc(s); axis image off; colormap(gray); title('last configuration');

function c = unl(s, i, j, v, L)
    w = @(a) mod(a - 1, L) + 1;
    c = (s(w(i + 1), j) ~= v) + (s(w(i - 1), j) ~= v) + (s(i, w(j + 1)) ~= v) + (s(i, w(j - 1)) ~= v);
end
