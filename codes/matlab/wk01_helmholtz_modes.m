% Wk01 - Helmholtz modes & cavity mode counting
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU

Lx = 1; Ly = 1;
[X, Y] = meshgrid(linspace(0,Lx,160), linspace(0,Ly,160));
modes = [1 1; 2 1; 2 2; 4 2];

figure(1);
for k = 1:4
    nx = modes(k,1); ny = modes(k,2);
    subplot(1,4,k);
    contourf(X, Y, sin(nx*pi*X/Lx).*sin(ny*pi*Y/Ly), 41, 'LineStyle', 'none');
    colormap(flipud(redblue_like())); axis square off;
    w = pi*sqrt((nx/Lx)^2 + (ny/Ly)^2);
    title(sprintf('(%d,%d), w=%.2f', nx, ny, w));
end
sgtitle('Helmholtz modes on a square membrane');

% 3D cavity mode counting: w' = sqrt(nx^2+ny^2+nz^2) <= wmax
wmax = 14; freqs = [];
for nx = 1:wmax, for ny = 1:wmax, for nz = 1:wmax
    wp = sqrt(nx^2 + ny^2 + nz^2);
    if wp <= wmax, freqs(end+1) = wp; end %#ok<SAGROW>
end, end, end
freqs = sort(freqs); N = 1:numel(freqs);

figure(2); hold on;
stairs(freqs, N, 'b-', 'LineWidth', 1.2);
ws = linspace(0, wmax, 300);
plot(ws, pi/6*ws.^3, 'r--', 'LineWidth', 1.5);
xlabel("normalized frequency w'"); ylabel("N(w')");
legend('exact staircase', '(\pi/6) w''^3'); 
title('Mode counting \rightarrow g(\nu) \propto \nu^2');

function cmap = redblue_like()
    n = 128; up = [linspace(0,1,n)' linspace(0,1,n)' ones(n,1)];
    dn = [ones(n,1) linspace(1,0,n)' linspace(1,0,n)'];
    cmap = [up; dn];
end
