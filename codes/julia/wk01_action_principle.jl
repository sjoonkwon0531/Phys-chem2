# Wk01 - Least action principle (Lagrangian mechanics)
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
using Plots, Printf

m, ω, T, qT = 1.0, 1.0, 2.0, 1.0
A = qT/sin(ω*T)
t = range(0, T, length=2001);  dt = step(t)
q_cl = A .* sin.(ω .* t)

grad(y) = [ (y[2]-y[1])/dt; (y[3:end].-y[1:end-2])./(2dt); (y[end]-y[end-1])/dt ]
trapz(y) = dt*(sum(y) - 0.5*(y[1]+y[end]))
action(q) = trapz(0.5m .* grad(q).^2 .- 0.5m*ω^2 .* q.^2)

S_cl = action(q_cl)
@printf("classical action S_cl = %.6f\n", S_cl)

p1 = plot(xlabel="t", ylabel="q(t)", title="Path family (fixed endpoints)", legend=false)
for e in range(-0.8, 0.8, length=9)
    plot!(p1, t, q_cl .+ e .* sin.(π .* t ./ T), c=:gray, lw=0.8)
end
plot!(p1, t, q_cl, c=:red, lw=2.2)
scatter!(p1, [0, T], [0, qT], c=:black)

p2 = plot(xlabel="ε", ylabel="S[q]", title="S minimized on classical path")
eps = range(-1, 1, length=81)
for n in 1:3
    S = [action(q_cl .+ e .* sin.(n*π .* t ./ T)) for e in eps]
    plot!(p2, eps, S, lw=1.5, label="mode n=$n")
end
scatter!(p2, [0.0], [S_cl], c=:black, label="classical")
display(plot(p1, p2, layout=(1,2), size=(1100,420)))
readline()
