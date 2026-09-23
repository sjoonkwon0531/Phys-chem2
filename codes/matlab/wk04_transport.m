% Wk04 - Transport properties of a perfect gas
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% lambda = kT/(sqrt2 sigma P); D = 1/3 lambda v; effusion (Cs example).

kB = 1.380649e-23; NA = 6.02214076e23; R = kB*NA;
gases = {'He' 0.21 4.003e-3; 'N2' 0.43 28.0134e-3; ...
         'CO2' 0.52 44.01e-3; 'C6H6' 0.88 78.11e-3};
T = 298.15; P = 101325;

fprintf('gas    sigma[nm2]  v_mean[m/s]  lambda[nm]    z[1/s]\n');
for i = 1:4
    s = gases{i,2}*1e-18; M = gases{i,3};
    vmean = sqrt(8*R*T/(pi*M));
    lam = kB*T/(sqrt(2)*s*P);
    fprintf('%-5s  %9.2f  %11.1f  %10.1f  %9.3e\n', ...
            gases{i,1}, gases{i,2}, vmean, lam*1e9, vmean/lam);
end
fprintf('-> N2: lambda ~ 67 nm at 1 atm\n\n');

% transport coefficients for N2
s = 0.43e-18; M = 28.0134e-3;
vmean = sqrt(8*R*T/(pi*M));
lam = kB*T/(sqrt(2)*s*P);
n = P/(kB*T); rho = n*M/NA;
D = lam*vmean/3; mu = rho*D;
kth = vmean*lam*n/NA*2.5*R/3;
fprintf('N2: D = %.2e m2/s, mu = %.1f uPa s, k = %.1f mW/m K, Sc = %.2f\n', ...
        D, mu*1e6, kth*1e3, mu/(rho*D));

% viscosity is independent of P
fprintf('mu at 0.1/1/10 atm: ');
for pf = [0.1 1 10]
    lam_ = kB*T/(sqrt(2)*s*P*pf); rho_ = (P*pf/(kB*T))*M/NA;
    fprintf('%.1f ', rho_*lam_*vmean/3*1e6);
end
fprintf('uPa s -> constant!\n\n');

% Cs effusion example (lecture): expect 8.7 kPa
M_Cs = 132.905e-3; T_Cs = 500; A0 = pi*(0.25e-3)^2;
P_Cs = sqrt(2*pi*R*T_Cs/M_Cs) * 385e-6/(A0*100);
fprintf('Cs vapor pressure from effusion: %.2f kPa (lecture 8.7 kPa)\n', P_Cs/1e3);
