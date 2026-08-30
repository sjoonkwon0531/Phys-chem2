% Wk01 - Least action principle (Lagrangian mechanics)
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% SHO paths q = q_cl + eps*sin(n*pi*t/T): S[q] is minimized at eps = 0.

m = 1; w = 1; T = 2; qT = 1;
A = qT/sin(w*T);
t = linspace(0, T, 2001);
q_cl = A*sin(w*t);

action = @(q) trapz(t, 0.5*m*gradient(q, t).^2 - 0.5*m*w^2*q.^2);
S_cl = action(q_cl);
fprintf('classical action S_cl = %.6f\n', S_cl);

figure(1);
subplot(1,2,1); hold on;
for e = linspace(-0.8, 0.8, 9)
    plot(t, q_cl + e*sin(pi*t/T), 'Color', [0.7 0.7 0.7], 'LineWidth', 0.8);
end
plot(t, q_cl, 'r-', 'LineWidth', 2.2);
scatter([0 T], [0 qT], 40, 'k', 'filled');
xlabel('t'); ylabel('q(t)'); title('Path family (fixed endpoints)');

subplot(1,2,2); hold on;
eps = linspace(-1, 1, 81);
for n = 1:3
    S = arrayfun(@(e) action(q_cl + e*sin(n*pi*t/T)), eps);
    plot(eps, S, 'LineWidth', 1.5, 'DisplayName', sprintf('mode n=%d', n));
end
xline(0, 'k'); scatter(0, S_cl, 40, 'k', 'filled', 'DisplayName', 'classical');
xlabel('\epsilon'); ylabel('S[q]'); legend;
title('Action is minimized on the classical path');
