%% Week 3 - Angular Momentum & Ladder Operators (|l,m> basis, hbar = 1)
%  Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
%  [Lx,Ly] = i Lz, [L^2,Lz] = 0, L^2 = l(l+1) I, L+|l,m> = c+(l,m)|l,m+1>
clear; clc;

for l = [1 2]
    [Lx, Ly, Lz, Lp, Lm, L2] = angmom(l);
    d = 2*l + 1; I = eye(d);
    e1 = max(abs(Lx*Ly - Ly*Lx - 1i*Lz), [], 'all');
    e2 = max(abs(L2*Lz - Lz*L2), [], 'all');
    e3 = max(abs(L2 - l*(l+1)*I), [], 'all');
    fprintf('l=%d: |[Lx,Ly]-iLz| = %.2e, |[L2,Lz]| = %.2e, |L2-l(l+1)I| = %.2e\n', l, e1, e2, e3);
end

% Ladder termination for l = 2
[~, ~, ~, Lp, Lm, ~] = angmom(2);
top = [1;0;0;0;0]; bot = [0;0;0;0;1];
fprintf('|L+|2,+2>| = %.1e, |L-|2,-2>| = %.1e\n', norm(Lp*top), norm(Lm*bot));

% Generalized uncertainty in |1,+1>: sigma_Lx sigma_Ly >= |<Lz>|/2
[Lx, Ly, Lz] = angmom(1);
v = [1;0;0];
sx = sqrt(real(v'*(Lx*Lx)*v) - real(v'*Lx*v)^2);
sy = sqrt(real(v'*(Ly*Ly)*v) - real(v'*Ly*v)^2);
fprintf('|1,+1>: sLx*sLy = %.4f >= |<Lz>|/2 = %.4f\n', sx*sy, abs(real(v'*Lz*v))/2);

% Vector model: cone angles for l = 2
L = sqrt(2*3);
for m = 2:-1:-2
    fprintf('l=2, m=%+d: cone angle = %.2f deg\n', m, acosd(m/L));
end

function [Lx, Ly, Lz, Lp, Lm, L2] = angmom(l)
% Matrices in basis m = l, l-1, ..., -l
    d = 2*l + 1;
    ms = l:-1:-l;
    Lz = diag(ms);
    Lp = zeros(d);
    for k = 2:d
        m = ms(k);
        Lp(k-1, k) = sqrt(l*(l+1) - m*(m+1));
    end
    Lm = Lp';
    Lx = (Lp + Lm)/2; Ly = (Lp - Lm)/(2i);
    L2 = Lx*Lx + Ly*Ly + Lz*Lz;
end
