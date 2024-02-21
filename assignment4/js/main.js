// Function to display nodes and links
function display(svg, nodes, links) {
    const width = svg.attr("width");
    const height = svg.attr("height");

    // Create the links
    var link = svg.selectAll(".link")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .attr("stroke", "lightgray") // Set the stroke color of the links
        .attr("stroke-width", 2); // Set the width of the links

    // Use a force simulation to position the nodes
    var simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-500))
        .force("link", d3.forceLink(links).id(function(d) { return d.index; }).distance(100))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);

    // Display the nodes
    var node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node");

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

    function ticked() {
        // Ensure nodes stay within the bounds of the SVG container
        node.attr("transform", function(d) {
            d.x = Math.max(10, Math.min(width - 10, d.x));
            d.y = Math.max(10, Math.min(height - 10, d.y));
            return "translate(" + d.x + "," + d.y + ")";
        });

        // Update link positions
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
    }

    return simulation;
}

// Fetch JSON data
async function getJSON() {
    const ep1 = await fetch("starwars-interactions/starwars-episode-1-interactions-allCharacters.json");
    const data = await ep1.json();
    return data;
}

// Main function
async function run() {
    var data = await getJSON();
    var nodes = data.nodes;
    var links = data.links;

    // Adjusted size of SVG container to ensure nodes are visible
    var svg = d3.select("body").append("svg")
        .attr("width", window.innerWidth)
        .attr("height", window.innerHeight)
        .classed("svg-container1", true);

    // Call the display function for the first SVG element
    display(svg, nodes, links);
}

run();
