import tkinter as tk
import pandas as pd
import numpy as np
import math


class ScatterplotApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Interactive Scatterplot")

        global offsetX, offsetY, points_data, windowWidth, windowHeight, isMoved, isHighlighted, scaleX, scaleY
        isMoved = False
        isHighlighted = False
        windowWidth = 500
        windowHeight = 500

        points_data = Points('data2.csv')

        offsetX = round(windowWidth / 2)
        offsetY = round(windowHeight / 2)

        #scaleX = max(points_data.points.X) - min(points_data.points.X) / offsetX
        #scaleY = max(points_data.points.X) - min(points_data.points.Y) / offsetY

        self.canvas = tk.Canvas(root, width=windowWidth, height=windowHeight, bg="white")
        self.canvas.pack()
        self.draw_scatterplot()

        self.canvas.bind("<Button-1>", self.on_canvas_left_click)
        self.canvas.bind("<Button-3>", self.on_canvas_right_click)

    def draw_scatterplot(self):
        self.canvas.delete("all")  # Clear canvas
        # Draw axes
        midX = round(windowWidth / 2)
        midY = round(windowHeight / 2)
        self.canvas.create_line(midX, 0, midX, windowHeight, fill="black")  # X-axis (centered)
        self.canvas.create_line(0, midY, windowWidth, midY, fill="black")  # Y-axis (centered)
        for point in points_data:
            fillColor = 'black'
            #x = (point.x + offsetX) * scaleX
            #x = (point.Y + offsetY) * scaleY
            if point.highlight:
                fillColor = 'yellow'
            elif point.x + offsetX < midX and point.y + offsetY < midY:
                fillColor = 'red'
            elif point.x + offsetX < midX:
                fillColor = 'orange'
            elif point.y + offsetY < midY:
                fillColor = 'green'
            else:
                fillColor = 'blue'
            #create types
            if point.point_type == 'a' or point.point_type == 'foo':
                self.canvas.create_oval(point.x - 5  + offsetX, point.y - 5 + offsetY, point.x + 5 + offsetX, point.y + 5 + offsetY, fill = fillColor)
            elif point.point_type == 'b' or point.point_type == 'bar':
                x, y = point.x + offsetX, point.y + offsetY
                size = 5
                self.canvas.create_polygon(x, y - size, x - size, y + size, x + size, y - size, x - size, y - size, x + size, y + size, x, y - 2 * size, fill=fillColor, outline='black')               
                
            elif point.point_type == 'c' or point.point_type == 'baz':
            #self.canvas.create_oval(point.x - 5  + offsetX, point.y - 5 + offsetY, point.x + 5 + offsetX, point.y + 5 + offsetY, fill = fillColor)
                self.canvas.create_rectangle(point.x - 5 + offsetX, point.y - 5 + offsetY, point.x + 5 + offsetX, point.y + 5 + offsetY, fill=fillColor)
    
    def on_canvas_left_click(self, event):
        global offsetX, offsetY, windowHeight, windowWidth, isMoved, isHighlighted

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

    def on_canvas_right_click(self, event):
        x, y = event.x, event.y
        x = round(x - offsetX)
        y = round(y - offsetY)
        global isHighlighted 

        if isHighlighted:
            for point in points_data:
                if point.highlight:
                    point.highlight = False
            isHighlighted = False

        else:
            for point in points_data:
                point.distance = math.sqrt((x - point.x)**2 + (y - point.y)**2)
            
            points_data.points.sort(key = lambda x: x.distance)

            i = 0
            for point in points_data:
                point.highlight = True
                i = i+1
                if i > 6:
                    break
            isHighlighted = True

        self.draw_scatterplot()

#---------classes for point and points-----------#
class Point:
    def __init__(self, x, y, point_type):
        self.x = x
        self.y = y
        self.point_type = point_type
        self.highlight = False
        self.distance = -1 #sort on distance

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