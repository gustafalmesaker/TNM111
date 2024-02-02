import tkinter as tk
import pandas as pd
import math

class ScatterplotApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Interactive Scatterplot")

        self.canvas = tk.Canvas(root, width=500, height=500, bg="white")
        self.canvas.pack()

        # Read data from CSV
        data = pd.read_csv('data1.csv', header=None)
        self.x_values = data.iloc[:, 0].tolist()
        self.y_values = data.iloc[:, 1].tolist()
        self.types = data.iloc[:, 2].tolist()

        self.offset_x = 250
        self.offset_y = 250

        self.colors = {'a': 'red', 'b': 'blue', 'c': 'green'}  # Specify colors for each type

        self.points = self.offset_points()
        self.highlighted_points = set()

        # Variables to store translation information
        self.translation_active = False
        self.translation_start = None

        self.draw_scatterplot()

        # Binding mouse events to canvas
        self.canvas.bind("<Button-1>", self.on_canvas_left_click)
        self.canvas.bind("<B1-Motion>", self.on_canvas_left_drag)
        self.canvas.bind("<ButtonRelease-1>", self.on_canvas_left_release)
        self.canvas.bind("<Button-3>", self.on_canvas_right_click)

    def offset_points(self):
        return [(x + self.offset_x, y + self.offset_y, t) for x, y, t in zip(self.x_values, self.y_values, self.types)]

    def draw_scatterplot(self):
        self.canvas.delete("all")  # Clear canvas

        # Draw axes
        self.canvas.create_line(250, 0, 250, 400, fill="black")  # X-axis (centered)
        self.canvas.create_line(0, 200, 500, 200, fill="black")  # Y-axis (centered)

        for x, y, t in self.points:
            color = self.colors.get(t, 'black')  # Default to black if type not found
            x_pixel, y_pixel = int(x), int(y)
            fill_color = 'yellow' if (x, y, t) in self.highlighted_points else color
            self.canvas.create_oval(x_pixel - 5, y_pixel - 5, x_pixel + 5, y_pixel + 5, fill=fill_color, outline="black")

    def on_canvas_left_click(self, event):
        x, y = event.x, event.y

        if self.translation_active:
            # If translation is active, revert to original offset values
            self.offset_x += self.translation_start[0]
            self.offset_y += self.translation_start[1]
            self.translation_active = False
        else:
            # If translation is not active, set new offset values based on the clicked point
            self.translation_start = (-x + self.offset_x, -y + self.offset_y)
            self.translation_active = True

    def on_canvas_left_drag(self, event):
        if self.translation_active:
            x, y = event.x, event.y
            dx, dy = x - self.translation_start[0], y - self.translation_start[1]
            self.translation_start = (x, y)
            self.translation(dx, dy)

    def on_canvas_left_release(self, event):
        pass

    def translation(self, dx, dy):
        self.offset_x += dx
        self.offset_y += dy
        self.points = self.offset_points()
        self.draw_scatterplot()

    def on_canvas_right_click(self, event):
        x, y = event.x, event.y
        clicked_point = (x, y)

        if clicked_point in self.highlighted_points:
            # If clicked on the same point again, restore original colors
            self.highlighted_points.remove(clicked_point)
        else:
            # Find the 5 closest points excluding the clicked one
            closest_points = self.find_closest_points(clicked_point, num_points=5, exclude_clicked=True)
            self.highlighted_points.update(closest_points)

        # Redraw the scatterplot with highlighted points
        self.draw_scatterplot()

    def find_closest_points(self, target_point, num_points=5, exclude_clicked=False):
        distances = [math.dist(target_point, (x, y)) for x, y, _ in self.points]
        closest_indices = sorted(range(len(distances)), key=lambda i: distances[i])[1:num_points+1]
        closest_points = [self.points[i] for i in closest_indices]

        if exclude_clicked:
            self.highlighted_points.add(target_point)
            closest_points = [p for p in closest_points if p != target_point]

        return closest_points

# Create the main window
root = tk.Tk()
app = ScatterplotApp(root)

# Run the application
root.mainloop()
