// Function to display nodes and links
function display(svg, nodes, links) {
    const width = svg.attr("width");
    const height = svg.attr("height");
    

    // Create the links
    var link = svg.selectAll(".link")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .attr("stroke", "white") // Set the stroke color to pink
        .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

    // Display the nodes
    var node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")

    // Append circles for nodes
    node.append("circle")
        .attr("r", 10)
        .attr("fill", function (d) { return d.colour; });

    // Append text elements for node names
    node.append("text")
        .text(function(d) { return d.name + ":" + d.value; })
        .attr("dx", 12) // Adjust position relative to the circle
        .attr("dy", 4) // Adjust position relative to the circle
        .attr("fill", "black"); // Set the color of the text

    // Use a force simulation to position the nodes
    var simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-500))
        .force("link", d3.forceLink(links).id(function(d) { return d.index; }).distance(100))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX().strength(0.1).x(width / 2)) // Add force to keep nodes within x boundaries
        .force("y", d3.forceY().strength(0.1).y(height / 2)) // Add force to keep nodes within y boundaries  
        .on("tick", ticked);

        
    function ticked() {
        node.attr("transform", function(d) {
            d.x = Math.max(10, Math.min(width - 10, d.x)); // Ensure x is within the boundaries
            d.y = Math.max(10, Math.min(height - 10, d.y)); // Ensure y is within the boundaries
            return "translate(" + d.x + "," + d.y + ")";
        });

        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
    }

    // Filter nodes based on the selected character
    function filterNodes(character) {
        // Hide all nodes
        d3.selectAll(".node")
        .style("display", "none");

         // Show nodes for the selected character
        d3.selectAll(".node")
        .filter(function(d) { return d.name === character; })
        .style("display", "block");
}

    

    return simulation;
}


// Fetch JSON data
async function getJSON() {
    const ep1 = await fetch("starwars-interactions/starwars-full-interactions-allCharacters.json");
    const data = await ep1.json();
    return data;
}

// Main function
async function run() {
    var data = await getJSON();
    var nodes = data.nodes;
    var links = data.links;
    

    var svg = d3.select("body").append("svg")
        .attr("width", window.innerWidth)
        .attr("height", window.innerHeight)
        .classed("svg-container1", true);

    // Call the display function for the first SVG element
    display(svg, nodes, links);



}

run();