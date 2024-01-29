import pandas as pd
import pygame

pygame.init()

# Read the CSV file without header
data = pd.read_csv('data1.csv', header=None)

# Extract x, y, and type columns using positional indexing
x_values = data.iloc[:, 0].tolist()
y_values = data.iloc[:, 1].tolist()
types = data.iloc[:, 2].tolist()

# Define colors
background_color = (255, 255, 255)
point_color_a = (255, 0, 0)
point_color_b = (0, 0, 255)
translation = 250
# Create canvas
canvas = pygame.display.set_mode((500, 500))
pygame.display.set_caption("Scatterplot")

# Main loop
exit_game = False
while not exit_game:
    canvas.fill(background_color)

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            exit_game = True

    for x, y, point_type in zip(x_values, y_values, types):
        if point_type == 'a':
            pygame.draw.circle(canvas, point_color_a, (int(x) + translation, int(y) + translation), 5)
        elif point_type == 'b':
            pygame.draw.circle(canvas, point_color_b, (int(x) + translation, int(y) + translation), 5)

    pygame.display.update()

pygame.quit()

