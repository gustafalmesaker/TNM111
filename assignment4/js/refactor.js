// Function to display nodes and links
function display(svg, nodes, links) {
    const width = svg.attr("width");
    const height = svg.attr("height");


    // Create the links
    var link = svg.selectAll(".link")
        .data(links)
        .enter().append("g")
        .attr("class", "link-group");

    // Append lines for links
    link.append("line")
        .attr("class", "link")
        .attr("stroke", "blue") // Set the stroke color of the links
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.4);

    // Append text for each link
    link.append("text")
        .text(function (d) {
            // Customize this part to format the text as you desire
            return d.value; // You can modify this line to display relevant text for each link
        })
        .attr("class", "link-text")
        .attr("dx", 5) // Adjust position relative to the line
        .attr("dy", -5) // Adjust position relative to the line
        .attr("fill", "black") // Set the color of the text
        .style("display", "none");

    // Use a force simulation to position the nodes
    var simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-100))
        .force("link", d3.forceLink(links).id(function (d) { return d.index; }).distance(10))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);

    // Display the nodes
    var node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .on("click", clickedNode);

    // Append circles for nodes
    var circles = node.append("circle")
        .attr("r", 10)
        .attr("fill", function (d) { return d.colour; })
        .attr("fill-opacity", 0.5); // Set the opacity of the nodes

    // Append text elements for node names
    var text = node.append("text")
        .text(function (d) { return d.name; })
        .attr("dx", 12) // Adjust position relative to the circle
        .attr("dy", 4) // Adjust position relative to the circle
        .attr("fill", "black") // Set the color of the text
        .style("display", "none"); // Hide text initially

    function clickedNode(d, i) {
        // Highlight the clicked circle
        d3.select(this).select("circle")
            .attr("fill", "green")
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Highlight the links connected to the clicked circle
        link.filter(function (l) {
            return l.source === d || l.target === d;
        }).select(".link")
            .attr("stroke", "green")
            .attr("stroke-width", 4);

        // Show text for links connected to the clicked node
        link.filter(function (l) {
            return (l.source === d || l.target === d) && l.source !== l.target;
        }).select(".link-text")
            .style("display", "block");

        // Highlight the connected circles and show their names
        var connectedNodes = link.filter(function (l) {
            return l.source === d || l.target === d;
        }).data().map(function (l) {
            return l.source === d ? l.target : l.source;
        });
        circles.filter(function (c) {
            return connectedNodes.includes(c) || c === d;
        }).attr("fill", "green");
        text.filter(function (n) {
            return connectedNodes.includes(n) || n === d;
        }).style("display", "block");
    }


    // Function to handle mouseover event on nodes
    function handleMouseOver(d, i) {
        // Highlight the hovered circle
        d3.select(this).attr("stroke", "black").attr("stroke-width", 2);

        // Highlight the links connected to the hovered circle
        link.filter(function (l) {
            return l.source === d || l.target === d;
        }).select(".link")
            .attr("stroke", "red")
            .attr("stroke-width", 4);

        // Highlight the connected circles and show their names
        var connectedNodes = link.filter(function (l) {
            return l.source === d || l.target === d;
        }).data().map(function (l) {
            return l.source === d ? l.target : l.source;
        });
        circles.filter(function (c) {
            return connectedNodes.includes(c) || c === d;
        }).attr("fill", "red");
        text.filter(function (n) {
            return connectedNodes.includes(n) || n === d;
        }).style("display", "block");

    }

    // Function to handle mouseout event on nodes
    function handleMouseOut(d, i) {
        // Reset the outline of the hovered circle
        d3.select(this).attr("stroke", "none");
        // Reset the fill color of the hovered circle
        d3.select(this).attr("fill", function (d) {
            return d.colour;
        });
        // Reset the stroke color of the links
        link.selectAll(".link")
            .attr("stroke", "blue")
            .attr("stroke-width", 2);
        // Reset the fill color of connected circles
        circles.attr("fill", function (d) {
            return d.colour;
        });
        // Hide all link texts
        link.select(".link-text")
            .style("display", "none");
        // Hide the text for connected circles
        text.style("display", "none");
    }


    // Add event listeners to nodes
    circles.on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);


    function ticked() {
        // Calculate the boundaries of the container
        const minX = 10;
        const maxX = width - 10;
        const minY = 10;
        const maxY = height - 10;

        // Ensure nodes stay within the bounds of the SVG container
        node.attr("transform", function (d) {
            d.x = Math.max(minX, Math.min(maxX, d.x));
            d.y = Math.max(minY, Math.min(maxY, d.y));
            return "translate(" + d.x + "," + d.y + ")";
        });

        // Update link positions
        link.select(".link")
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        // Update text positions
        link.select(".link-text")
            .attr("x", function (d) { return (d.source.x + d.target.x) / 2; })
            .attr("y", function (d) { return (d.source.y + d.target.y) / 2; });
    }

    return simulation;
}

// Fetch JSON data
async function getJSON(film) {
    let url;
    switch (film) {
        case "ep1":
            url = "starwars-interactions/starwars-episode-1-interactions-allCharacters.json";
            break;
        case "ep2":
            url = "starwars-interactions/starwars-episode-2-interactions-allCharacters.json";
            break;
        case "ep3":
            url = "starwars-interactions/starwars-episode-3-interactions-allCharacters.json";
            break;
        case "ep4":
            url = "starwars-interactions/starwars-episode-4-interactions-allCharacters.json";
            break;
        case "ep5":
            url = "starwars-interactions/starwars-episode-5-interactions-allCharacters.json";
            break;
        case "ep6":
            url = "starwars-interactions/starwars-episode-6-interactions-allCharacters.json";
            break;
        case "ep7":
            url = "starwars-interactions/starwars-episode-7-interactions-allCharacters.json";
            break;
        case "full":
            url = "starwars-interactions/starwars-full-interactions-allCharacters.json";
            break;
        default:
            return null;
    }
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

// Main function
async function run() {
    const filmSelector = document.getElementById("film-selector");
    const characterSelector = document.getElementById("character-selector");
    const filterOption = document.getElementById("filter-selector");
    const graph = d3.select("#leftgraph"); // Initialize or re-select the SVG element
    const rightGraph = d3.select("#rightgraph");

    // Load default data (Episode 1)
    const defaultData = await getJSON("ep1");
    const characters = extractCharacterNames(defaultData.nodes);
    populateDropdown(characterSelector, characters); // Populate the character dropdown with names initially
    display(graph, defaultData.nodes, defaultData.links); // Display the default graph
    display(rightGraph, defaultData.nodes, defaultData.links); //Display an empty graph initially

    let rightData = defaultData;

    filmSelector.addEventListener("change", async () => {
        const selectedFilm = filmSelector.value;
        const data = await getJSON(selectedFilm);
        rightData = data;
        updateRightGraph();
        const characters = extractCharacterNames(data.nodes);
        populateDropdown(characterSelector, characters);
        if (!graph.empty()) {
            graph.selectAll("*").remove();
            display(graph, data.nodes, data.links);

        } else {
            console.error("SVG element not found!!");
        }
    });
    
    
    function updateRightGraph(){
        if (!rightGraph.empty()) { rightGraph.selectAll("*").remove(); }
        display(rightGraph, rightData.nodes, rightData.links);

        switch (filterOption.value) {
            case "none":
                break;
            case "node-value":
                console.log("node-value")
                rightGraph.selectAll("circle")
                .filter(function(d) {console.log(d);return d.value < 5})
                .attr("display" , "none");
                break;
            case "link-value":
                console.log("link-value");
                rightGraph.selectAll("line")
                .filter(function(l) {console.log(l);return l.value < 5})
                .attr("display" , "none");
                break;
        }
    }

    characterSelector.addEventListener("change", async () => {
        const selectedCharacter = characterSelector.value;

        // Reset the color of all circles to their original color
        d3.selectAll("circle")
            .attr("fill", function (d) { return d.colour; });

        // Change the color of the selected character's node to green
        d3.selectAll("circle")
            .filter(function (d) { return d.name === selectedCharacter; })
            .attr("fill", "green")
            .attr("opacity", 1);
    });


    filterOption.addEventListener("change", async () => {
        updateRightGraph();
    });

    // Function to extract unique character names from nodes
    function extractCharacterNames(nodes) {
        const characterSet = new Set();
        nodes.forEach(node => {
            characterSet.add(node.name);
        });
        return Array.from(characterSet); // Convert set to array
    }

    // Function to populate dropdown with character names
    function populateDropdown(dropdown, characters) {
        // Clear existing options
        dropdown.innerHTML = "";

        // Add default option
        const defaultOption = document.createElement("option");
        defaultOption.text = "Select a character";
        dropdown.add(defaultOption);

        // Add options for each character
        characters.forEach(character => {
            const option = document.createElement("option");
            option.value = character;
            option.text = character;
            dropdown.add(option);
        });
    }

}

run();
