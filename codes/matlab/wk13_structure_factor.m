% Week 13 (Physical Chemistry 2) - Structure factor and extinction rules
%   S(hkl) = sum_j f_j exp(-i 2 pi (h x_j + k y_j + l z_j)), I ~ |S|^2
%   ionic form factors at zero angle = number of electrons: Na+ 10, Cl- 18, K+ 18, Cs+ 54
clear; clc;
F = 0.5; Q = 0.25;
fcc = [0 0 0; 0 F F; F 0 F; F F 0];
B.SC      = [1 0 0 0];
B.BCC     = [1 0 0 0; 1 F F F];
B.FCC     = [ones(4, 1) fcc];
B.diamond = [ones(4, 1) fcc; ones(4, 1) fcc + Q];
B.NaCl    = [10 * ones(4, 1) fcc; 18 * ones(4, 1) fcc + [F 0 0]];
B.CsCl    = [54 0 0 0; 18 F F F];
KCl       = [18 * ones(4, 1) fcc; 18 * ones(4, 1) fcc + [F 0 0]];
S = @(b, h) abs(sum(b(:, 1) .* exp(-2i * pi * (b(:, 2:4) * h(:)))));
names = fieldnames(B);
H = [1 0 0; 1 1 0; 1 1 1; 2 0 0; 2 1 0; 2 1 1; 2 2 0; 2 2 1; 3 0 0; 3 1 0; 3 1 1; 2 2 2; 3 2 0; 3 2 1];
fprintf('   hkl   N     SC     BCC     FCC diamond    NaCl    CsCl\n');
for r = 1:size(H, 1)
    fprintf('   %d%d%d %3d', H(r, :), sum(H(r, :).^2));
    for n = 1:numel(names), fprintf(' %7.2f', S(B.(names{n}), H(r, :))); end
    fprintf('\n');
end
fprintf('\n   Allowed N = h2+k2+l2 (first 8):\n');
for n = 1:numel(names)
    Ns = [];
    for N = 1:40
        ok = false;
        for h = 0:6, for k = 0:6, for l = 0:6
            if h^2 + k^2 + l^2 == N && S(B.(names{n}), [h k l]) > 1e-6, ok = true; end
        end, end, end
        if ok, Ns(end + 1) = N; end %#ok<AGROW>
        if numel(Ns) == 8, break; end
    end
    fprintf('   %-8s: %s\n', names{n}, num2str(Ns));
end
fprintf('\n   KCl (f_K = f_Cl = 18) versus NaCl\n');
for h = [1 1 1; 2 0 0; 2 2 0; 3 1 1; 2 2 2]'
    fprintf('   (%d%d%d): |S_NaCl| = %5.1f  |S_KCl| = %5.1f\n', h, S(B.NaCl, h), S(KCl, h));
end
