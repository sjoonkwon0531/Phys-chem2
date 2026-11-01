% Wk10 — Where the Boltzmann distribution comes from
% Physical Chemistry 2 — Prof. S. Joon Kwon — SPMDL — SKKU
%
% (1) Stirling: ln N! ~ N ln N - N
% (2) Einstein solid: P(n) = C(Q-n+N-2, N-2)/C(Q+N-1, N-1) -> (1-x) x^n, x = Q/(Q+N)
% (3) Energy-exchange game relaxes to exp(-beta eps)
% (4) beta = d ln W / dE
%
% Run:  wk10_boltzmann_exchange     (~20 s)
clear; rng(10);
lnC = @(n, k) gammaln(n + 1) - gammaln(k + 1) - gammaln(n - k + 1);

fprintf('(1) Stirling: ln N!  vs  N ln N - N\n');
for N = [10 100 1000 1e6]
    ex = gammaln(N + 1); ap = N*log(N) - N;
    fprintf('  %10.0f   %16.4f   %16.4f   rel. error %9.2e\n', N, ex, ap, (ex - ap)/ex);
end

fprintf('\n(2) Einstein solid, <n> = 1 -> Boltzmann x = 1/2\n     n   N=10      N=100     N=1000    Boltzmann\n');
for n = 0:6
    fprintf('    %2d', n);
    for N = [10 100 1000]
        Q = N; fprintf('   %.5f', exp(lnC(Q - n + N - 2, N - 2) - lnC(Q + N - 1, N - 1)));
    end
    fprintf('   %.5f\n', 0.5*0.5^n);
end

N = 2000; q0 = 2; sweeps = 400;
e = q0*ones(N, 1); hist = zeros(15, 1);
for s = 1:sweeps
    pairs = randi(N, N, 2);
    for k = 1:N
        i = pairs(k, 1); j = pairs(k, 2);
        if i ~= j && e(i) > 0, e(i) = e(i) - 1; e(j) = e(j) + 1; end
    end
    if s > sweeps/2, hist = hist + accumarray(min(e, 14) + 1, 1, [15 1]); end
end
hist = hist / (N*sweeps/2); x = q0/(q0 + 1);
fprintf('\n(3) exchange game: N = %d, start n = %d\n     n   simulation   Boltzmann\n', N, q0);
for k = 0:7, fprintf('    %2d    %.4f       %.4f\n', k, hist(k + 1), (1 - x)*x^k); end
pf = polyfit((0:9)', log(hist(1:10)), 1);
fprintf('    fitted beta*eps = %.3f   exact ln((q0+1)/q0) = %.3f\n', -pf(1), log((q0 + 1)/q0));

for Q = [500 1000 2000]
    Nn = 1000; d = lnC(Q + 1 + Nn - 1, Nn - 1) - lnC(Q + Nn - 1, Nn - 1);
    fprintf('(4) N = 1000, Q = %d: d lnW/dQ = %.4f   ln((Q+N)/Q) = %.4f\n', Q, d, log((Q + Nn)/Q));
end
