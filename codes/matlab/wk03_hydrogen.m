%% Week 3 - Spherical Harmonics & the Hydrogen Atom (a0 = 1)
%  Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
%  psi_nlm = R_nl(r) Y_l^m(theta,phi), E_n = -13.6057/n^2 eV
clear; clc;

% Y_l^m orthonormality on the sphere (via legendre + explicit norm)
th = linspace(0, pi, 1201); ph = linspace(0, 2*pi, 1201);
[TH, PH] = ndgrid(th, ph);
fprintf('<Y_1^0|Y_1^0> = %.6f\n', real(innerY(1,0,1,0,TH,PH,th,ph)));
fprintf('<Y_2^1|Y_2^1> = %.6f\n', real(innerY(2,1,2,1,TH,PH,th,ph)));
fprintf('<Y_1^0|Y_2^0> = %+.2e\n', real(innerY(1,0,2,0,TH,PH,th,ph)));

% Radial normalization: int R_nl^2 r^2 dr = 1
r = linspace(1e-8, 120, 400001);
pairs = [1 0; 2 0; 2 1; 3 2];
for k = 1:size(pairs,1)
    n = pairs(k,1); l = pairs(k,2);
    I = trapz(r, Rnl(n,l,r).^2.*r.^2);
    fprintf('int R_%d%d^2 r^2 dr = %.6f\n', n, l, I);
end

% <r>_1s = 1.5 a0, most probable r = a0, virial <V> = 2E
P1s = Rnl(1,0,r).^2.*r.^2;
[~, im] = max(P1s);
fprintf('<r>_1s = %.5f a0, r_mp = %.4f a0\n', trapz(r, r.*P1s), r(im));
fprintf('<V>_1s = %.5f Ha (= 2E_1 = -1)\n', trapz(r, -1./r.*P1s));

% Energy levels
Ry = 13.605693;
for n = 1:3, fprintf('E_%d = %.4f eV\n', n, -Ry/n^2); end

% Radial functions plot
figure; hold on;
rr = linspace(0, 25, 1001);
plot(rr, Rnl(1,0,rr), rr, Rnl(2,0,rr), rr, Rnl(2,1,rr), rr, Rnl(3,0,rr), 'LineWidth', 1.4);
legend('R_{10}','R_{20}','R_{21}','R_{30}'); xlabel('r/a_0'); ylabel('R_{nl}'); grid on;

function I = innerY(l1,m1,l2,m2,TH,PH,th,ph)
    f = conj(Ylm(l1,m1,TH,PH)).*Ylm(l2,m2,TH,PH).*sin(TH);
    I = trapz(th, trapz(ph, f, 2));
end

function Y = Ylm(l, m, TH, PH)
% Complex spherical harmonic with Condon-Shortley phase
    am = abs(m);
    P = legendre(l, cos(TH(:,1)));       % (l+1) x length(th), includes C-S phase
    Pl = P(am+1, :).';                   % column over theta
    N = sqrt((2*l+1)/(4*pi)*factorial(l-am)/factorial(l+am));
    Y = N*(Pl*ones(1,size(TH,2))).*exp(1i*am*PH);
    if m < 0, Y = (-1)^m*conj(Y); end
end

function R = Rnl(n, l, r)
% Hydrogen radial function via associated Laguerre recurrence (a0 = 1)
    rho = 2*r/n;
    N = sqrt((2/n)^3*factorial(n-l-1)/(2*n*factorial(n+l)));
    R = N.*rho.^l.*exp(-rho/2).*laguerreL_rec(n-l-1, 2*l+1, rho);
end

function L = laguerreL_rec(k, alpha, x)
    if k == 0, L = ones(size(x)); return; end
    Lm = ones(size(x)); Lc = 1 + alpha - x;
    for i = 1:k-1
        Ln = ((2*i+1+alpha-x).*Lc - (i+alpha)*Lm)/(i+1);
        Lm = Lc; Lc = Ln;
    end
    L = Lc;
end
