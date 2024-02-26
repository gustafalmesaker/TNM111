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
        .attr("stroke", "gray") // Set the stroke color of the links
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.4);

    // Append text for each link
    link.append("text")
        .text(function(d) {
            // Customize this part to format the text as you desire
            return d.value; // You can modify this line to display relevant text for each link
        })
        .attr("class", "link-text")
        .attr("dx", 5) // Adjust position relative to the line
        .attr("dy", -5) // Adjust position relative to the line
        .attr("fill", "black") // Set the color of the text
        .style("display","none");

    // Use a force simulation to position the nodes
    var simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("link", d3.forceLink().links(links))
        .on("tick", ticked);

    // Display the nodes
    var node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .on("click", clickedNode);

    // Append circles for nodes
    var circles = node.append("circle")
        .attr("r", 4)
        .attr("fill", function (d) { return d.colour; }); 

    // Append text elements for node names
    var text = node.append("text")
        .text(function(d) { return d.name; })
        .attr("dx", 12) // Adjust position relative to the circle
        .attr("dy", 4) // Adjust position relative to the circle
        .attr("fill", "black") // Set the color of the text
        .attr("stroke-width", 1)
        .attr("font-size", "8px")
        .style("display", "none"); // Hide text initially
        

        function clickedNode(d, i) {
            // Set the clicked node
            clickedNode = d;
        
            // Highlight the clicked circle
            d3.select(this).select("circle")
                .attr("fill", "green")
                .attr("stroke-width", 1);

            
        
            // Highlight the links connected to the clicked circle
            link.filter(function(l) {
                return l.source === d || l.target === d;
            }).select(".link")
            .attr("stroke", "green")
            .attr("stroke-width", 2);
        
            // Show text for links connected to the clicked node
            link.filter(function(l) {
                return (l.source === d || l.target === d) && l.source !== l.target;
            }).select(".link-text")
            .attr("font-size", "8px")
            .style("display", "block");
        
            // Highlight the connected circles and show their names
            var connectedNodes = link.filter(function(l) {
                return l.source === d || l.target === d;
            }).data().map(function(l) {
                return l.source === d ? l.target : l.source;
            });
            circles.filter(function(c) {
                return connectedNodes.includes(c) || c === d;
            }).attr("fill", "green");
            text.filter(function(n) {
                return connectedNodes.includes(n) || n === d;
            }).style("display", "block");

            
        }
        

        
    
// Function to handle mouseover event on nodes
function handleMouseOver(d, i) {
    // Reset the stroke width of all circles
    d3.selectAll("circle").attr("stroke-width", 0);

    // Highlight the hovered circle
    d3.select(this).attr("stroke-width", 2);

    // Highlight the links connected to the hovered circle
    link.filter(function(l) {
        return l.source === d || l.target === d;
    }).select(".link")
    .attr("stroke", "red")
    .attr("stroke-width", 2);

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


function handleMouseOut(d, i) {
    // Reset the outline of the hovered circle
    d3.select(this).attr("stroke", "none");
    // Reset the fill color of the hovered circle
    d3.select(this).attr("fill", function(d) {
        return d.colour;
    });
    // Reset the stroke color of the links
    link.selectAll(".link")
    .attr("stroke", function(l) {
        if (clickedNode && (l.source === clickedNode || l.target === clickedNode)) {
            return "green";
        }
        return "gray";
    })
    .attr("stroke-width", function(l) {
        return (clickedNode && (l.source === clickedNode || l.target === clickedNode)) ? 2 : 1;
    });
    // Hide link text for nodes not connected to the clicked node
    link.selectAll(".link-text")
    .style("display", function(l) {
        return (clickedNode && (l.source === clickedNode || l.target === clickedNode)) ? "block" : "none";
    });
    // Highlight the connected circles and show their names
    var connectedNodes = link.filter(function(l) {
        return (l.source === clickedNode || l.target === clickedNode);
    }).data().map(function(l) {
        return l.source === clickedNode ? l.target : l.source;
    });
    circles.attr("fill", function(d) {
        return (connectedNodes.includes(d) || d === clickedNode) ? "green" : d.colour;
    });
    text.style("display", function(n) {
        return (connectedNodes.includes(n) || n === clickedNode) ? "block" : "none";
    });
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
    node.attr("transform", function(d) {
        d.x = Math.max(minX, Math.min(maxX, d.x));
        d.y = Math.max(minY, Math.min(maxY, d.y));
        return "translate(" + d.x + "," + d.y + ")";
    });

        // Update link positions
        link.select(".link")
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        // Update text positions
        link.select(".link-text")
            .attr("x", function(d) { return (d.source.x + d.target.x) / 2; })
            .attr("y", function(d) { return (d.source.y + d.target.y) / 2; });
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
    const graph = d3.select("#leftgraph"); // Initialize or re-select the SVG element

    // Event listener for film selection change
    filmSelector.addEventListener("change", async () => {
        const selectedFilm = filmSelector.value;
        const data = await getJSON(selectedFilm);
        const characters = extractCharacterNames(data.nodes); // Extract character names from the data
        populateDropdown(characterSelector, characters); // Populate the character dropdown with names
        if (!graph.empty()) {
            graph.selectAll("*").remove(); // Clear previous visualization
            display(graph, data.nodes, data.links); // Display the graph with new data
        } else {
            console.error("SVG element not found!!");
        }
    });

    // Load default data (Episode 1)
    const defaultData = await getJSON("ep1");
    const characters = extractCharacterNames(defaultData.nodes);
    populateDropdown(characterSelector, characters); // Populate the character dropdown with names initially
    display(graph, defaultData.nodes, defaultData.links); // Display the default graph


        // Function to highlight selected character
    function highlightSelectedCharacter(selectedCharacter) {
        // Reset the color of all circles and hide all names
        d3.selectAll("circle")
            .attr("fill", function(d) { return d.colour; });
        d3.selectAll("text")
            .style("display", "none");

        // Reset the clickedNode variable
        clickedNode = null;

        // Change the color of the selected character's node to red
        d3.selectAll("circle")
            .filter(function(d) { return d.name === selectedCharacter; })
            .attr("fill", "red");

        // Show the name of the selected character
        d3.selectAll("text")
            .filter(function(d) { return d.name === selectedCharacter; })
            .style("display", "block");

        // Display the selected character in the info container
        document.getElementById("info-selected-character").textContent = selectedCharacter;
    }

    
    characterSelector.addEventListener("change", async () => {
        const selectedCharacter = characterSelector.value;
        highlightSelectedCharacter(selectedCharacter);
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
