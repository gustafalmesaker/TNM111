// Function to display nodes and links
function display(svg, nodes, links) {
    const width = svg.attr("width");
    const height = svg.attr("height");

    // Create the links
    var link = svg.selectAll(".link")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .attr("stroke", "blue") // Set the stroke color of the links
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.4); // Set the width of the links

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
        .attr("class", "node")
        .on("click", selectedNode); //gör selectedNode klickbar

    // Append circles for nodes
    var circles = node.append("circle")
        .attr("r", 10)
        .attr("fill", function (d) { return d.colour; })
        .attr("fill-opacity", 0.5); // Set the opacity of the nodes

    // Append text elements for node names
    var text = node.append("text")
        //.text(function(d) { return d.name + ":" + d.value; })
        .text(function(d) { return d.name; })
        .attr("dx", 12) // Adjust position relative to the circle
        .attr("dy", 4) // Adjust position relative to the circle
        .attr("fill", "black") // Set the color of the text
        .style("display", "none"); // Hide text initially

    // Function to handle mouseover event on nodes
    function handleMouseOver(d, i) {
        // Highlight the hovered circle
        d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
        // Highlight the links connected to the hovered circle
        link.filter(function(l) {
            return l.source === d || l.target === d;
        }).attr("stroke", "red")
        .attr("stroke-width", 4);

        // Highlight the connected circles and show their names
        var connectedNodes = link.filter(function(l) {
            return l.source === d || l.target === d;
        }).data().map(function(l) {
            return l.source === d ? l.target : l.source;
        });
        circles.filter(function(c) {
            return connectedNodes.includes(c) || c === d;
        }).attr("fill", "red");
        text.filter(function(n) {
            return connectedNodes.includes(n) || n === d;
        }).style("display", "block");
    }

    function selectedNode(event, d) { //sus, måste ändra
        d3.selectAll("circle").attr('stroke', '#999').attr('stroke-width', 0);
        d3.selectAll('line').attr('stroke-width', 1);
        d3.select(this).attr('stroke', 'red').attr('stroke-width', 2);
        d3.selectAll('line').filter(link => link.source === d || link.target === d)
            .attr('stroke-opacity', '0.7')
            .attr('stroke-width', 2.5);
        console.log(d.name);
        console.log(d.value);
    }

    // Function to handle mouseout event on nodes
    function handleMouseOut(d, i) {
        // Reset the outline of the hovered circle
        d3.select(this).attr("stroke", "none");
        // Reset the fill color of the hovered circle
        d3.select(this).attr("fill", function(d) {
            return d.colour;
        });
        // Reset the stroke color of the links
        link.attr("stroke", "blue")
        .attr("stroke-width", 2);
        // Reset the fill color of connected circles
        circles.attr("fill", function(d) {
            return d.colour;
        });
        // Hide the text
        text.style("display", "none");
    }

    // Add event listeners to nodes
    circles.on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

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

// Function to highlight the selected node and its connections
function highlightNode(selectedNode) {
    // Reset the styles of all nodes and links
    svg.selectAll(".node circle")
        .attr("fill", function(d) { return d.colour; })
        .attr("stroke", "none");
    svg.selectAll(".link")
        .attr("stroke", "blue")
        .attr("stroke-width", 2);

    // Find links connected to the selected node
    svg.selectAll(".link")
        .filter(function(l) {
            return l.source === selectedNode || l.target === selectedNode;
        })
        .attr("stroke", "red")
        .attr("stroke-width", 4);

    // Highlight the selected node
    svg.selectAll(".node circle")
        .filter(function(d) {
            return d === selectedNode;
        })
        .attr("fill", "red")
        .attr("stroke", "black");
}

// Main function
async function run() {
    const filmSelector = document.getElementById("film-selector");
    const characterSelector = document.getElementById("character-selector");
    const svg = d3.select("#graph"); // Initialize or re-select the SVG element

    let simulation; // Variable to store the simulation

    // Event listener for film selection change
    filmSelector.addEventListener("change", async () => {
        const selectedFilm = filmSelector.value;
        const data = await getJSON(selectedFilm);
        const characters = extractCharacterNames(data.nodes); // Extract character names from the data
        populateDropdown(characterSelector, characters); // Populate the character dropdown with names
        if (!svg.empty()) {
            svg.selectAll("*").remove(); // Clear previous visualization
            simulation = display(svg, data.nodes, data.links); // Display the graph with new data and store the simulation
        } else {
            console.error("SVG element not found!!");
        }
    });

    // Event listener for character selection change
    characterSelector.addEventListener("change", () => {
        // Get the selected character
        const selectedCharacter = characterSelector.value;
        // Find the corresponding node in the data
        const selectedNode = simulation.nodes().find(node => node.name === selectedCharacter);
        if (selectedNode) {
            // Highlight the selected node and its connections
            highlightNode(selectedNode);
        }
    });

    // Load default data (Episode 1)
    const defaultData = await getJSON("ep1");
    const characters = extractCharacterNames(defaultData.nodes);
    populateDropdown(characterSelector, characters); // Populate the character dropdown with names initially
    simulation = display(svg, defaultData.nodes, defaultData.links); // Display the default graph and store the simulation

    // Function to extract unique character names from nodes
    function extractCharacterNames(nodes) {
        const characterSet = new Set();
        nodes.forEach(node => {
            characterSet.add(node.name); // Assuming each node has a "name" attribute
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
