% Wk04 - Hydrogen atom: Bohr model, spectral series, degeneracy
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% E_n = -13.606/n^2 eV;  lambda = hc/dE;  degeneracy 2n^2.

RY = 13.605693; HC = 1239.841984; A0 = 0.0529177;   % eV, eV nm, nm
E = @(n) -RY ./ n.^2;

fprintf(' n   r_n [nm]    E_n [eV]\n');
for n = 1:5
    fprintf('%2d  %9.4f  %9.4f\n', n, n^2*A0, E(n));
end

names = {'Lyman', 'Balmer', 'Paschen', 'Brackett', 'Pfund'};
fprintf('\nseries    n2->n1   dE [eV]   lambda [nm]\n');
for n1 = 1:5
    for n2 = n1+1 : n1+3
        dE = E(n2) - E(n1);
        fprintf('%-9s %d->%d   %7.4f   %9.1f\n', names{n1}, n2, n1, dE, HC/dE);
    end
end
fprintf('Balmer limit: %.1f nm\n\n', HC/(0 - E(2)));

fprintf(' n   #states |n,l,m,s>   2n^2\n');
for n = 1:4
    cnt = 0;
    for l = 0:n-1, cnt = cnt + 2*(2*l+1); end
    fprintf('%2d  %18d  %5d\n', n, cnt, 2*n^2);
end

figure(1);
subplot(1,2,1); hold on;
for n = 1:7
    yline(E(n), 'Color', [0 0.5 0.5]); text(0.92, E(n), sprintf('n=%d', n));
end
ylabel('E [eV]'); title('E = -13.6/n^2 eV'); xticks([]);
subplot(1,2,2); hold on;
for n2 = 3:7
    lam = HC/(E(n2) - E(2));
    xline(lam, 'LineWidth', 2); text(lam, 1.02, sprintf('%d\\rightarrow2', n2));
end
xlim([380 700]); ylim([0 1.15]); xlabel('wavelength [nm]');
title('Balmer series (visible)'); yticks([]);
