# Wk01 - Helmholtz modes & cavity mode counting
# Physical Chemistry 2 - Prof. S. Joon Kwon - SPMDL - SKKU
using Plots, Printf

Lx = Ly = 1.0
xs = range(0, Lx, length=160); ys = range(0, Ly, length=160)
modes = [(1,1), (2,1), (2,2), (4,2)]

ps = []
for (nx, ny) in modes
    Z = [sin(nx*π*x/Lx)*sin(ny*π*y/Ly) for y in ys, x in xs]
    ω = π*sqrt((nx/Lx)^2 + (ny/Ly)^2)
    push!(ps, heatmap(xs, ys, Z, c=:RdBu, clim=(-1,1), aspect_ratio=1,
                      title=@sprintf("(%d,%d), w=%.2f", nx, ny, ω),
                      colorbar=false, axis=false))
end
p_modes = plot(ps..., layout=(1,4), size=(1200,300))

# 3D cavity mode counting
wmax = 14.0
freqs = Float64[]
for nx in 1:15, ny in 1:15, nz in 1:15
    wp = sqrt(nx^2 + ny^2 + nz^2)
    wp <= wmax && push!(freqs, wp)
end
sort!(freqs);  N = 1:length(freqs)

p_count = plot(freqs, N, seriestype=:steppost, label="exact staircase N(w')",
               xlabel="normalized frequency w'", ylabel="N(w')",
               title="Mode counting -> g(ν) ~ ν²")
ws = range(0, wmax, length=300)
plot!(p_count, ws, π/6 .* ws.^3, ls=:dash, c=:red, label="(π/6) w'³")
display(plot(p_modes, p_count, layout=@layout([a; b]), size=(1200,750)))
println("dN/dw' ~ (π/2) w'^2  =>  g(ν) = 8πV ν²/c³ (x2 polarization)")
readline()
