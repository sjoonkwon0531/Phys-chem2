% Week 12 - Two atoms per cell: band gap at the zone boundary
% Physical Chemistry 2, SKKU (Prof. S. Joon Kwon)
function wk12_diatomic_band()
    eA = 0.5; eB = -0.5; t = 1; k = linspace(-pi, pi, 400);
    eb = (eA + eB)/2; D = (eA - eB)/2; r = sqrt(D^2 + 4*t^2*cos(k/2).^2);
    fprintf('(a) gap %.4f (|eA - eB| = %.4f)\n', 2*sqrt(D^2 + 4*t^2*cos(pi/2)^2), abs(eA - eB));
    t1 = 1.1; t2 = 0.9; rb = abs(t1 + t2*exp(-1i*k));
    fprintf('(b) gap %.4f (2|t1 - t2| = %.4f)\n', 2*abs(t1 + t2*exp(-1i*pi)), 2*abs(t1 - t2));
    figure; plot(k, eb - r, 'b', k, eb + r, 'b', k, -rb, 'r--', k, rb, 'r--', 'LineWidth', 1.5);
    xlabel('ka'); ylabel('E/t'); legend('site energies', '', 'alternating hopping', ''); grid on;
end
