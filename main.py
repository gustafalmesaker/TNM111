import tkinter as tk
import pandas as pd
import numpy as np
import math


class ScatterplotApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Interactive Scatterplot")

        global offsetX, offsetY, points_data, windowWidth, windowHeight, isMoved, isHighlighted, scaleX, scaleY, rangeX, rangeY
        
        isMoved = False
        isHighlighted = False
        windowWidth = 500
        windowHeight = 500

        offsetX = round(windowWidth / 2)
        offsetY = round(windowHeight / 2)
        
        points_data = Points('data2.csv')
        for point in points_data: #reverse the y-axis
            point.y = -point.y
        
        rangeX = round(max(abs(points_data.min_X), abs(points_data.max_X)))
        rangeY = round(max(abs(points_data.min_Y), abs(points_data.max_Y)))

        scaleX = offsetX / rangeX
        scaleY = offsetY / rangeY
        
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

        # Draw legends
        legend_x, legend_y = 10, 10  # Adjust these coordinates for the legend placement
        self.canvas.create_text(legend_x, legend_y, anchor="nw", text="Legend:")

        # Define legend shapes and labels
        legend_items = {
            'a': {'shape': 'circle', 'color': 'black', 'label': 'a / foo'},
            'b': {'shape': 'arc', 'color': 'black', 'label': 'b / bar'},
            'c': {'shape': 'square', 'color': 'black', 'label': 'c / baz'}
            # Add more types as needed
        }

        # Draw legends for each type
        for point_type, info in legend_items.items():
            legend_y += 30  # Adjust this value for the vertical spacing
            if info['shape'] == 'circle':
                self.canvas.create_oval(legend_x, legend_y, legend_x + 15, legend_y + 15, fill=info['color'])
            elif info['shape'] == 'arc':
                self.canvas.create_rectangle(legend_x, legend_y, legend_x + 15, legend_y + 15, fill=info['color'])
            elif info['shape'] == 'square':
                self.canvas.create_arc(legend_x, legend_y, legend_x + 15, legend_y + 15, fill=info['color'])
            self.canvas.create_text(legend_x + 30, legend_y + 7, anchor="w", text=info['label'])


        #labels and ticks
        # Draw X-axis ticks and values
        x_tick_step = 5
        for i in range(-rangeX, rangeX + 1, x_tick_step):
            x_tick = midX + i * (windowWidth / (2 * rangeX)*scaleX)
            self.canvas.create_line(x_tick, midY - 5, x_tick, midY + 5, fill="black")  # Tick marks
            self.canvas.create_text(x_tick, midY + 10, text=str(i), anchor="n")  # Tick values

        # Draw Y-axis ticks and values
            y_tick_step = 5
        for i in range(-rangeY, rangeY + 1, y_tick_step):
            y_tick = midY - i * (windowHeight / (2 * rangeY)*scaleY)
            self.canvas.create_line(midX - 5, y_tick, midX + 5, y_tick, fill="black")  # Tick marks
            self.canvas.create_text(midX - 10, y_tick, text=str(i), anchor="e")  # Tick values

        # Add legends to the axes
        legend_offset = 20  # Adjust the offset as needed
        self.canvas.create_text(midX - 10, legend_offset, text="Y-axis", anchor="e", font=("Helvetica", 10, "bold"))  # Y-axis legend at the top
        self.canvas.create_text(windowWidth - legend_offset, midY + 10, text="X-axis", anchor="e", font=("Helvetica", 10, "bold"))  # X-axis legend all the way to the right

    
        ##################
        for point in points_data:
            fillColor = 'black'
            if point.highlight:
                fillColor = 'yellow'
            elif scaleX * point.x + offsetX < midX and scaleY * point.y + offsetY < midY:
                fillColor = 'red'
            elif scaleX * point.x + offsetX < midX:
                fillColor = 'orange'
            elif scaleY * point.y + offsetY < midY:
                fillColor = 'green'
            else:
                fillColor = 'blue'
            #create types
            if point.point_type == 'a' or point.point_type == 'foo':
                self.canvas.create_oval(scaleX*point.x - 5  + offsetX, scaleY*point.y - 5 + offsetY, scaleX*point.x + 5 + offsetX, scaleY*point.y + 5 + offsetY, fill = fillColor)
            elif point.point_type == 'b' or point.point_type == 'bar':
                x, y = scaleX * point.x + offsetX, scaleY * point.y + offsetY
                size = 15
                self.canvas.create_arc(x, y, x + size, y + size, fill=fillColor, outline='black')                           
            elif point.point_type == 'c' or point.point_type == 'baz':
                self.canvas.create_rectangle(scaleX*point.x - 5 + offsetX, scaleY*point.y - 5 + offsetY, scaleX*point.x + 5 + offsetX, scaleY*point.y + 5 + offsetY, fill=fillColor)
    
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
                point.distance = math.sqrt(scaleX*(x - point.x)**2 + scaleY*(y - point.y)**2)
            
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
        self.distance = -1

class Points:
    def __init__(self, data):
        self.points = []
        self.min_X = float('inf')
        self.max_X = float('-inf')
        self.min_Y = float('inf')
        self.max_Y = float('-inf')
        self._load_data(data)

    def _load_data(self, csv_file):
        data = pd.read_csv(csv_file, header=None)
        self.points = [Point(x, y, point_type) for x, y, point_type in zip(data.iloc[:, 0], data.iloc[:, 1], data.iloc[:, 2])]

        for point in self.points:
            self.min_X = min(self.min_X, point.x)
            self.max_X = max(self.max_X, point.x)
            self.min_Y = min(self.min_Y, point.y)
            self.max_Y = max(self.max_Y, point.y)
            

    def __iter__(self):
        return iter(self.points)

# Create the main window
root = tk.Tk()
app = ScatterplotApp(root)

# Run the application
root.mainloop()