% Week 11 - 1D monatomic and diatomic chains: dispersion and phonon heat capacity
% Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
function wk11_phonon_chain()
    N = 40; m1 = 1; m2 = 2; k1 = 1; k2 = 1;
    masses = repmat([m1 m2], 1, N); springs = repmat([k1 k2], 1, N);
    wn = sort(sqrt(abs(eig(chainMatrix(masses, springs)))));
    ks = 2*pi*(0:N-1)/N; [ac, op] = omegaDi(ks, m1, m2, k1, k2);
    wa = sort([ac op])';
    fprintf('Diatomic, %d cells: %d modes, max error = %.2e\n', N, numel(wn), max(abs(wn - wa)));
    [a, o] = omegaDi(pi, m1, m2, k1, k2); fprintf('Zone boundary: acoustic %.4f, optical %.4f\n', a, o);
    Nb = 2000; w = 2*abs(sin(pi*(1:Nb-1)/Nb));
    for T = [0.05 0.2 0.5 1 2 5]
        x = w/T; c = x.^2.*exp(x)./expm1(x).^2; fprintf('  T = %4.2f: C/Nk = %.4f\n', T, mean(c));
    end
    k = linspace(-pi, pi, 400); [ac, op] = omegaDi(k, m1, m2, k1, k2);
    figure; plot(k, ac, k, op, 'LineWidth', 1.5); xlabel('ka'); ylabel('\omega'); grid on;
end
function D = chainMatrix(m, s)
    n = numel(m); D = zeros(n);
    for i = 1:n
        j = mod(i, n) + 1;
        D(i,i) = D(i,i) + s(i); D(j,j) = D(j,j) + s(i); D(i,j) = D(i,j) - s(i); D(j,i) = D(j,i) - s(i);
    end
    D = D ./ sqrt(m' * m);
end
function [ac, op] = omegaDi(k, m1, m2, k1, k2)
    S = k1 + k2; inv = 1/m1 + 1/m2;
    root = sqrt(max(S^2*inv^2 - 16*k1*k2*sin(k/2).^2/(m1*m2), 0));
    ac = sqrt(max(0.5*(S*inv - root), 0)); op = sqrt(0.5*(S*inv + root));
end
