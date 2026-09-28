% Wk05 - Van der Waals forces: Keesom, induction, London
% Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
% All three share -C/r^6; dispersion dominates for most pairs.

EPS0 = 8.8541878128e-12; KB = 1.380649e-23; NA = 6.02214076e23;
DEBYE = 3.33564e-30; EV = 1.602176634e-19; T = 298.15;

% name, mu [D], alpha' [1e-30 m^3], I [eV]
mol = {'Ar' 0 1.66 15.76; 'CH4' 0 2.60 12.61; 'HCl' 1.08 2.63 12.74; ...
       'NH3' 1.47 2.22 10.07; 'H2O' 1.85 1.48 12.62; 'C6H6' 0 10.4 9.24};

r = 0.40e-9;
fprintf('pair         C_Keesom  C_induc  C_London [1e-79 Jm^6]  V(0.4nm) kJ/mol\n');
for i = 1:size(mol,1)
    mu = mol{i,2}*DEBYE; ap = mol{i,3}*1e-30; I = mol{i,4}*EV;
    cK = 2*mu^4/(3*(4*pi*EPS0)^2*KB*T);
    cD = 2*mu^2*ap/(4*pi*EPS0);
    cL = 1.5*ap^2*(I/2);
    V  = -(cK+cD+cL)/r^6*NA/1e3;
    fprintf('%-5s-%-5s  %8.2f  %7.2f  %8.2f  %18.2f\n', ...
            mol{i,1}, mol{i,1}, cK*1e79, cD*1e79, cL*1e79, V);
end
fprintf('-> benzene: zero dipole yet largest attraction (polarizability wins)\n');

% r-dependence for the water pair
mu = 1.85*DEBYE; ap = 1.48e-30; I = 12.62*EV;
cK = 2*mu^4/(3*(4*pi*EPS0)^2*KB*T); cD = 2*mu^2*ap/(4*pi*EPS0); cL = 1.5*ap^2*I/2;
rr = linspace(0.3, 1.2, 200)*1e-9;
figure(1); hold on;
Cs = [cK cD cL cK+cD+cL]; lb = {'Keesom','induction','London','total'};
for k = 1:4, plot(rr*1e9, -Cs(k)./rr.^6*NA/1e3, 'DisplayName', lb{k}); end
xlabel('r [nm]'); ylabel('V [kJ/mol]'); legend; title('H_2O pair: 1/r^6 family');
