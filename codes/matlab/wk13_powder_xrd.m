% Week 13 (Physical Chemistry 2) - Powder XRD pattern of cubic crystals (Cu K-alpha1)
%   2theta from lambda = 2 d sin(theta), d = a / sqrt(h2+k2+l2)
%   I ~ |S|^2 x multiplicity x LP, LP = (1 + cos^2 2theta)/(sin^2 theta cos theta)
%   teaching form factor f = Z exp(-B s^2), s = sin(theta)/lambda, B = 2 A^2
%   Scherrer: tau = K lambda / (beta cos theta), K = 0.9
clear; clc;
LAM = 1.5406; F = 0.5;
fcc = [0 0 0; 0 F F; F 0 F; F F 0];
cr = {'Cu (FCC)', 3.61, [29 * ones(4, 1) fcc];
      'a-Fe (BCC)', 2.87, [26 0 0 0; 26 F F F];
      'Si (diamond)', 5.43, [14 * ones(8, 1) [fcc; fcc + 0.25]];
      'NaCl (rock salt)', 5.63, [11 * ones(4, 1) fcc; 17 * ones(4, 1) fcc + [F 0 0]]};
for c = 1:size(cr, 1)
    a = cr{c, 2}; b = cr{c, 3};
    keys = zeros(0, 3); tth = []; dd = []; I = []; mult = [];
    for h = -6:6, for k = -6:6, for l = -6:6
        if ~any([h k l]), continue; end
        d = a / norm([h k l]); s = LAM / (2 * d);
        if s >= 1, continue; end
        th = asin(s);
        if 2 * th * 180 / pi > 100, continue; end
        Sg = sum(b(:, 1) .* exp(-2 * (s / LAM)^2) .* exp(-2i * pi * (b(:, 2:4) * [h; k; l])));
        if abs(Sg) < 1e-6, continue; end
        key = sort(abs([h k l]), 'descend');
        lp = (1 + cos(2 * th)^2) / (sin(th)^2 * cos(th));
        [tf, idx] = ismember(key, keys, 'rows');
        if tf
            I(idx) = I(idx) + abs(Sg)^2 * lp; mult(idx) = mult(idx) + 1;
        else
            keys(end + 1, :) = key; tth(end + 1) = 2 * th * 180 / pi; dd(end + 1) = d; %#ok<AGROW>
            I(end + 1) = abs(Sg)^2 * lp; mult(end + 1) = 1; %#ok<AGROW>
        end
    end, end, end
    [tth, o] = sort(tth); keys = keys(o, :); dd = dd(o); I = I(o); mult = mult(o);
    if c == 1, tth111 = tth(1); end
    fprintf('%s, a = %.2f A, lambda = %.4f A\n', cr{c, 1}, a, LAM);
    s1 = sind(tth(1) / 2)^2;
    for p = 1:min(7, numel(tth))
        fprintf('   (%d%d%d)  2theta = %6.2f deg  d = %.4f A  mult = %2d  I = %5.1f  sin2 ratio = %.3f\n', ...
            keys(p, :), tth(p), dd(p), mult(p), 100 * I(p) / max(I), sind(tth(p) / 2)^2 / s1);
    end
    fprintf('\n');
end
fprintf('Scherrer crystallite size, Cu (111), K = 0.9\n');
for w = [0.1 0.3 1.0]
    fprintf('   FWHM = %.1f deg -> tau = %.1f nm\n', w, 0.9 * LAM / (deg2rad(w) * cosd(tth111 / 2)) / 10);
end
