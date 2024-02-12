import numpy as np
import matplotlib.pyplot as plt

# Sample 1D data
x = np.linspace(0, 10, 100)
y = np.sin(x)

# Parameters for focal planes
focal_depths = [0, 1, 2]  # Depth positions of the focal planes
opacities = [1.0, 0.7, 0.4]  # Opacity values for each focal plane

# Rendering function for focal planes
def render_focal_plane(data, depth, opacity):
    plt.plot(x, data + depth, alpha=opacity)

# Plotting
plt.figure(figsize=(8, 6))

# Loop through each focal plane
for depth, opacity in zip(focal_depths, opacities):
    render_focal_plane(y, depth, opacity)

plt.xlabel('X-axis')
plt.ylabel('Y-axis')
plt.title('Polyfocal Display Transfer Function')
plt.legend(['Focal Plane 1', 'Focal Plane 2', 'Focal Plane 3'])
plt.show()
