% Wk02 - Matrix mechanics: [X,P] = i hbar seen numerically
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% X_mn = <m|x|n>, P = i*Pi in the box basis; diag Im[X,P] -> hbar.

L = 1; hbar = 1; Nb = 20;
x = linspace(0, L, 6001);
X = zeros(Nb); Pi_ = zeros(Nb);
for m = 1:Nb
    pm = sqrt(2/L)*sin(m*pi*x/L);
    for n = 1:Nb
        pn  = sqrt(2/L)*sin(n*pi*x/L);
        dpn = sqrt(2/L)*(n*pi/L)*cos(n*pi*x/L);
        X(m,n)   = trapz(x, pm.*x.*pn);
        Pi_(m,n) = -hbar*trapz(x, pm.*dpn);
    end
end
M = X*Pi_ - Pi_*X;                 % Im part of (XP - PX)
d = diag(M)/hbar;
fprintf('n   Im[X,P]_nn/hbar\n');
for n = [1 2 5 10 15 19 20], fprintf('%2d  %10.5f\n', n, d(n)); end
fprintf('-> 1 in the interior; fails near n ~ N (infinite matrices!)\n');
fprintf('X_12: %.6f vs analytic %.6f\n', X(1,2), -8*1*2/(pi^2*(1-4)^2));

fprintf('\n n  sigma_x*sigma_p/hbar (bound 0.5)\n');
for n = 1:5
    fprintf('%2d  %.5f\n', n, sqrt(1/12 - 1/(2*n^2*pi^2))*n*pi);
end

figure(1);
subplot(1,2,1); imagesc(M/hbar, [-1.2 1.2]); colorbar; axis square;
title('Im(XP-PX)/hbar ~ identity');
subplot(1,2,2); plot(1:Nb, d, 'o-'); yline(1, 'r--'); ylim([-2 2]);
xlabel('n'); title('diagonal -> hbar (interior)');
