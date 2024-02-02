import tkinter as tk
import pandas as pd
import math
import colorsys
import numpy as np


class ScatterplotApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Interactive Scatterplot")

        global offsetX, offsetY, points_data, windowWidth, windowHeight, isMoved
        isMoved = False
        windowWidth = 500
        windowHeight = 500

        points_data = Points('data1.csv')

        offsetX = -1
        offsetY = -1
        if offsetX == -1 and offsetY == -1:
            offsetX = round(windowWidth / 2)
            offsetY = round(windowHeight / 2)

        self.canvas = tk.Canvas(root, width=windowWidth, height=windowHeight, bg="white")
        self.canvas.pack()
        self.draw_scatterplot()

        self.canvas.bind("<Button-1>", self.on_canvas_left_click)


    def draw_scatterplot(self):
        self.canvas.delete("all")  # Clear canvas
        # Draw axes
        self.canvas.create_line(round(windowWidth / 2), 0, round(windowWidth / 2), windowHeight, fill="black")  # X-axis (centered)
        self.canvas.create_line(0, round(windowHeight / 2), windowWidth, round(windowHeight / 2), fill="black")  # Y-axis (centered)
        for point in points_data:
            self.canvas.create_oval(point.x - 5  + offsetX, point.y - 5 + offsetY, point.x + 5 + offsetX, point.y + 5 + offsetY)
    
    def on_canvas_left_click(self, event):
        global offsetX, offsetY, windowHeight, windowWidth, isMoved

        x, y = event.x, event.y

        if isMoved:
            offsetX = round(windowWidth / 2)
            offsetY = round(windowHeight / 2)
            isMoved = False
        else:
            offsetX = windowWidth - x
            offsetY = windowHeight - y
            isMoved = True
        self.draw_scatterplot()



#---------classes for point and points-----------#
class Point:
    def __init__(self, x, y, point_type):
        self.x = x
        self.y = y
        self.point_type = point_type

class Points:
    def __init__(self, data):
        self.points = []
        self._load_data(data)

    def _load_data(self, csv_file):
        data = pd.read_csv(csv_file, header=None)
        self.points = [Point(x, y, point_type) for x, y, point_type in zip(data.iloc[:, 0], data.iloc[:, 1], data.iloc[:, 2])]

    def __iter__(self):
        return iter(self.points)

# Create the main window
root = tk.Tk()
app = ScatterplotApp(root)

# Run the application
root.mainloop()