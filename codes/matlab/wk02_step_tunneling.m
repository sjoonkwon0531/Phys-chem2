% Wk02 - Step potential & quantum tunneling
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% Reproduces the lecture's FET / STM tunneling numbers.

HBARC = 197.3269804;  MC2 = 0.51099895e6;   % eV nm, eV
kappa = @(dE) sqrt(2*MC2*dE)/HBARC;         % nm^-1

Texact = @(E, V0, w) 1./(1 + V0^2*sinh(kappa(V0-E)*w).^2/(4*E*(V0-E)));

fprintf('E/V0    R        T        R+T\n');
for r = [1.2 1.5 2 4]
    k1 = sqrt(r); k2 = sqrt(r-1);
    R = ((k1-k2)/(k1+k2))^2; T = 4*k1*k2/(k1+k2)^2;
    fprintf('%4.1f  %.5f  %.5f  %.5f\n', r, R, T, R+T);
end
fprintf('FET: kappa = %.2f nm^-1, T = %.4f (lecture 0.044)\n', kappa(6), Texact(6,12,0.18));
fprintf('STM: T(1.0 nm) = %.2e,  T(0.5 nm) = %.2e\n', Texact(2,5,1), Texact(2,5,0.5));

figure(1);
subplot(1,3,1); rr = linspace(1.0001, 7, 400);
k1 = sqrt(rr); k2 = sqrt(rr-1);
plot(rr, 4*k1.*k2./(k1+k2).^2, 'b-', rr, ((k1-k2)./(k1+k2)).^2, 'r-', 'LineWidth', 1.4);
yline(1, 'k--'); xlabel('E/V_0'); legend('T', 'R'); title('Step: R & T');

subplot(1,3,2); EE = linspace(0.02, 0.98, 300)*5;
semilogy(EE/5, arrayfun(@(E) Texact(E,5,0.4), EE), 'b-', 'LineWidth', 1.4);
xlabel('E/V_0'); title('Barrier T (V_0=5 eV, w=0.4 nm)');

subplot(1,3,3); ww = linspace(0.1, 1.2, 300);
semilogy(ww, arrayfun(@(w) Texact(2,5,w), ww), 'b-', 'LineWidth', 1.4);
xlabel('width w [nm]'); title('T(w): STM principle');
