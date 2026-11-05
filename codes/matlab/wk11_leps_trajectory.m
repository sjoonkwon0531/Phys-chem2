% Week 11 - Collinear A + BC on a LEPS surface: barrier and Polanyi rules
% Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
% Units eV, Angstrom, amu (time unit 10.18 fs). Sato K = 0.136 -> H3 barrier 0.416 eV at 0.931 A.
function wk11_leps_trajectory()
    S.symmetric = [4.746 4.746 4.746]; S.early = [5.5 4.746 4.746]; S.late = [4.746 5.5 4.746];
    names = fieldnames(S);
    for s = 1:3
        D = S.(names{s}); [Eb, r1, r2] = barrier(D);
        fprintf('%-9s barrier = %.3f eV at r_AB = %.3f, r_BC = %.3f A\n', names{s}, Eb, r1, r2);
    end
    tot = struct('early', 0.45, 'late', 1.30);
    for nm = {'early', 'late'}
        for f = [0.9 0.5 0.1]
            T = tot.(nm{1}); P = 0;
            for k = 0:23, P = P + trajectory(S.(nm{1}), T*f, T*(1-f), 2*pi*k/24); end
            fprintf('  %-5s E_trans = %.2f, E_vib = %.2f eV -> P = %.2f\n', nm{1}, T*f, T*(1-f), P/24);
        end
    end
    % contour plot of the symmetric surface
    [R1, R2] = meshgrid(linspace(0.5, 3, 200));
    figure; contour(R1, R2, leps(R1, R2, S.symmetric), -4.7:0.1:-3); axis equal;
    xlabel('r_{AB} (A)'); ylabel('r_{BC} (A)'); title('LEPS H + H_2');
end
function [Q, J, dQ, dJ] = qj(r, D)
    B = 1.942; RE = 0.742; K = 0.136; c = D/4/(1+K);
    e1 = exp(-B*(r-RE)); e2 = e1.^2;
    Q = c*((3+K)*e2 - (2+6*K)*e1);  J = c*((1+3*K)*e2 - (6+2*K)*e1);
    dQ = c*(-2*B*(3+K)*e2 + B*(2+6*K)*e1); dJ = c*(-2*B*(1+3*K)*e2 + B*(6+2*K)*e1);
end
function [V, g1, g2] = leps(r1, r2, D)
    [Q1,J1,dQ1,dJ1] = qj(r1, D(1)); [Q2,J2,dQ2,dJ2] = qj(r2, D(2)); [Q3,J3,dQ3,dJ3] = qj(r1+r2, D(3));
    S = sqrt(0.5*((J1-J2).^2 + (J2-J3).^2 + (J3-J1).^2)) + 1e-14;
    V = Q1 + Q2 + Q3 - S;
    g1 = dQ1 + dQ3 - (2*J1-J2-J3)./(2*S).*dJ1 - (2*J3-J1-J2)./(2*S).*dJ3;
    g2 = dQ2 + dQ3 - (2*J2-J1-J3)./(2*S).*dJ2 - (2*J3-J1-J2)./(2*S).*dJ3;
end
function [Eb, R1, R2] = barrier(D)
    best = -1e9;
    for x = linspace(-3, 3, 1201)
        y = linspace(abs(x)+0.5, abs(x)+4, 700); v = leps((y-x)/2, (y+x)/2, D); [vm, j] = min(v);
        if vm > best, best = vm; R1 = (y(j)-x)/2; R2 = (y(j)+x)/2; end
    end
    Eb = best + D(2);
end
function out = trajectory(D, Et, Ev, phase)
    M = 1.00784; B = 1.942; RE = 0.742; mu = M/2; w = B*sqrt(2*D(2)/mu); A = sqrt(2*Ev/(mu*w^2));
    r2 = RE + A*cos(phase); vr = -A*w*sin(phase); vrel = sqrt(2*Et/(2*M/3));
    x = [-4; 0; r2]; v = [2*vrel/3; -vr/2 - vrel/3; vr/2 - vrel/3]; dt = 0.002;
    f = force(x, D); out = 0.5;
    for t = 0:dt:15
        v = v + 0.5*dt*f/M; x = x + dt*v; f = force(x, D); v = v + 0.5*dt*f/M;
        a = x(2)-x(1); b = x(3)-x(2);
        if a > 5 && b < 2, out = 0; return; end
        if b > 5 && a < 2, out = 1; return; end
    end
end
function f = force(x, D)
    [~, g1, g2] = leps(x(2)-x(1), x(3)-x(2), D); f = [g1; -g1+g2; -g2];
end
