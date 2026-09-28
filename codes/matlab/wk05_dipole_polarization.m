% Wk05 - Dipole moments, polarizability & the Debye equation
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% Vector addition of bond dipoles; Debye plot; Clausius-Mossotti -> n(CCl4).

EPS0 = 8.8541878128e-12; KB = 1.380649e-23; NA = 6.02214076e23;
DEBYE = 3.33564e-30;

% (1) dichlorobenzene isomers: mu_res = 2 mu1 cos(theta/2)
mu1 = 1.57;   % D (chlorobenzene)
iso = {'ortho' 60 2.25; 'meta' 120 1.48; 'para' 180 0.0};
fprintf('isomer  angle  mu_calc [D]  mu_obs [D]\n');
for i = 1:3
    mu = 2*mu1*cosd(iso{i,2}/2);
    fprintf('%-6s  %4d   %8.2f   %8.2f\n', iso{i,1}, iso{i,2}, mu, iso{i,3});
end

% (2) Debye plot: P_m = NA/(3 eps0) (alpha + mu^2/3kT)
mu_w = 1.85*DEBYE; alpha = 4*pi*EPS0*1.48e-30;
T = linspace(300, 500, 9);
Pm = NA/(3*EPS0)*(alpha + mu_w^2./(3*KB*T));
p = polyfit(1./T, Pm, 1);
mu_fit = sqrt(9*EPS0*KB*p(1)/NA);
alpha_fit = 3*EPS0*p(2)/NA;
fprintf('\nDebye plot: mu = %.3f D (input 1.850), alpha'' = %.3f e-30 m^3 (input 1.480)\n', ...
        mu_fit/DEBYE, alpha_fit/(4*pi*EPS0)*1e30);
figure(1); plot(1e3./T, Pm*1e6, 'o-');
xlabel('1000/T [1/K]'); ylabel('P_m [cm^3/mol]'); title('Debye plot');

% (3) Clausius-Mossotti for CCl4
x = 4*pi*1590*NA*10.5e-30/(3*0.1538);
eps_r = (1+2*x)/(1-x);
fprintf('CCl4: eps_r = %.3f, n = %.3f (experimental 1.4607)\n', eps_r, sqrt(eps_r));
fprintf('water: eps_r(static) = 78 but n^2 = 1.77 - dipoles cannot follow light\n');
