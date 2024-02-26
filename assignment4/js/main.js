// Function to display nodes and links
function display(svg, nodes, links) {
    const width = svg.attr("width");
    const height = svg.attr("height");

    const filmSelector = document.getElementById("film-selector");
    const characterSelector = document.getElementById("character-selector");
    const filterOption = document.getElementById("filter-selector");
    const sliderUpper = document.getElementById("upper");
    const sliderLower = document.getElementById("lower");
    const graph = d3.select("#leftgraph"); // Initialize or re-select the SVG element
    const rightGraph = d3.select("#rightgraph");


    // Create the links
    var link = svg.selectAll(".link")
        .data(links)
        .enter().append("g")
        .attr("class", "link-group");

    // Append lines for links
    link.append("line")
        .attr("class", "link")
        .attr("stroke", "blue") // Set the stroke color of the links
        .attr("stroke-width", 1)
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
        .attr("fill", "white") // Set the color of the text
        .style("display", "none");

    // Use a force simulation to position the nodes
    var simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-175))
        .force("link", d3.forceLink(links).id(function (d) { return d.index; }).distance(100))
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
        .attr("r", 6)
        .attr("fill", function (d) { return d.colour; })
        .attr("fill-opacity", 0.9); // Set the opacity of the nodes

    // Append text elements for node names
    var text = node.append("text")
        .text(function (d) { return d.name; })
        .attr("dx", 12) // Adjust position relative to the circle
        .attr("dy", 4) // Adjust position relative to the circle
        .attr("fill", "white") // Set the color of the text
        .attr("stroke-width", 1)
        .attr("font-size", "12px")
        .style("display", "none"); // Hide text initially

    function clickedNode(d, i) {
        // Set the clicked node
        clickedNode = d;
        var selectedCharacter = d.name;
        var selectedCharacterScenes = d.value;
        document.getElementById("selected-character-scenes").textContent = selectedCharacterScenes;
        document.getElementById("info-selected-character").textContent = selectedCharacter;

        // Highlight the clicked circle in the left graph
        d3.select(this).select("circle")
            .attr("fill", "green")
            .attr("stroke-width", 1);

        // Highlight the links connected to the clicked circle in the left graph
        link.filter(function (l) {
            return l.source === d || l.target === d;
        }).select(".link")
            .attr("stroke", "green")
            .attr("stroke-width", 2);

        // Show text for links connected to the clicked node in the left graph
        link.filter(function (l) {
            return (l.source === d || l.target === d) && l.source !== l.target;
        }).select(".link-text")
            .attr("font-size", "0px")
            .style("display", "block");

        // Highlight the connected circles and show their names in the left graph
        var connectedNodesLeft = link.filter(function (l) {
            return l.source === d || l.target === d;
        }).data().map(function (l) {
            return l.source === d ? l.target : l.source;
        });
        circles.filter(function (c) {
            return connectedNodesLeft.includes(c) || c === d;
        }).attr("fill", "green");
        text.filter(function (n) {
            return connectedNodesLeft.includes(n) || n === d;
        }).style("display", "block");

        // Hide all nodes, links, and text in the right graph
        rightGraph.selectAll(".node, .link, .link-text")
            .style("display", "none");

        // Show only the clicked node, its attached links, and circles in the right graph
        rightGraph.selectAll(".node")
            .filter(function (r) {
                return connectedNodesLeft.includes(r) || r === d;
            }).style("display", "block")
            .select("circle")
            .attr("fill", "green");

        // Show the character text on all nodes in the right graph
        rightGraph.selectAll(".node text")
            .style("display", "block");

        // Highlight the links connected to the clicked node in the right graph
        rightGraph.selectAll(".link")
            .filter(function (l) {
                return l.source === d || l.target === d;
            }).attr("stroke", "green")
            .attr("stroke-width", 2)
            .style("display", "block");

        // Highlight the link text connected to the clicked node in the right graph
        rightGraph.selectAll(".link-text")
            .filter(function (l) {
                return (l.source === d || l.target === d) && l.source !== l.target;
            }).attr("font-size", "12px")
            .style("display", "block");
    }


    // Function to handle mouseover event on nodes
    function handleMouseOver(d, i) {
        // Reset the stroke width of all circles
        d3.selectAll("circle").attr("stroke-width", 0);

        // Highlight the hovered circle
        d3.select(this).attr("stroke-width", 2);

        // Highlight the links connected to the hovered circle
        link.filter(function (l) {
            return l.source === d || l.target === d;
        }).select(".link")
            .attr("stroke", "red")
            .attr("stroke-width", 2);

        // Highlight the connected circles and show their names
        var connectedNodes = link.filter(function (l) {
            return l.source === d || l.target === d;
        }).data().map(function (l) {
            return l.source === d ? l.target : l.source;
        });
        circles.filter(function (c) {
            return connectedNodes.includes(c) || c === d;
        }).attr("fill", "red");
        /*text.filter(function (n) {
            return connectedNodes.includes(n) || n === d;
        }).style("display", "block");*/

        // Find the corresponding circle in the right graph
        const rightCircle = rightGraph.selectAll(".node")
            .filter(function (r) { return r.name === d.name; });

        // Highlight the corresponding circle in the right graph
        rightCircle.select("circle")
            .attr("fill", "red");
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
            .attr("stroke", function (l) {
                if (clickedNode && (l.source === clickedNode || l.target === clickedNode)) {
                    return "green";
                }
                return "blue";
            })
            .attr("stroke-width", function (l) {
                return (clickedNode && (l.source === clickedNode || l.target === clickedNode)) ? 2 : 1;
            });
        // Hide link text for nodes not connected to the clicked node
        link.selectAll(".link-text")
            .style("display", function (l) {
                return (clickedNode && (l.source === clickedNode || l.target === clickedNode)) ? "block" : "none";
            });
        // Highlight the connected circles and show their names
        var connectedNodes = [clickedNode]; // Only the clicked node is considered connected
        /*var connectedNodes = link.filter(function (l) {
            return (l.source === clickedNode || l.target === clickedNode);
        }).data().map(function (l) {
            return l.source === clickedNode ? l.target : l.source;
        });*/
        circles.attr("fill", function (d) {
            return (connectedNodes.includes(d) || d === clickedNode) ? "green" : d.colour;
        });
        text.style("display", function (n) {
            return (connectedNodes.includes(n) || n === clickedNode) ? "block" : "none";
        });

        const rightCircle = rightGraph.selectAll(".node")
            .filter(function (r) { return r.name === d.name; });

        // Highlight the corresponding circle in the right graph
        rightCircle.select("circle")
            .attr("fill", "green", function (d) {
                return d.colour;
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


function findMax(data) {
    let maxPropertyValue = -Infinity; // Start with a very low value for maximum
    data.nodes.forEach(node => {
        // Check if the node has a numeric value property
        if (typeof node.value === 'number') {
            // Update the maximum value if necessary
            if (node.value > maxPropertyValue) {
                maxPropertyValue = node.value;
            }
        }
    });
    return maxPropertyValue;
}

function findMaxLinkValue(data) {
    let maxPropertyValue = -Infinity; // Start with a very low value for maximum
    data.links.forEach(link => {
        // Check if the node has a numeric value property
        if (typeof link.value === 'number') {
            // Update the maximum value if necessary
            if (link.value > maxPropertyValue) {
                maxPropertyValue = link.value;
            }
        }
    });
    return maxPropertyValue;
}

function findMin(data) {
    let minPropertyValue = Infinity; // Start with a very high value for minimum
    data.nodes.forEach(node => {
        // Check if the node has a numeric value property
        if (typeof node.value === 'number') {
            // Update the minimum value if necessary
            if (node.value < minPropertyValue) {
                minPropertyValue = node.value;
            }
        }
    });
    return minPropertyValue;
}

function findMinLinkValue(data) {
    let minPropertyValue = Infinity; // Start with a very high value for minimum
    data.links.forEach(link => {
        // Check if the node has a numeric value property
        if (typeof link.value === 'number') {
            // Update the minimum value if necessary
            if (link.value < minPropertyValue) {
                minPropertyValue = link.value;
            }
        }
    });
    return minPropertyValue;
}

// Main function
async function run() {
    filmSelector = document.getElementById("film-selector");
    characterSelector = document.getElementById("character-selector");
    filterOption = document.getElementById("filter-selector");
    sliderUpper = document.getElementById("upper");
    sliderLower = document.getElementById("lower");
    graph = d3.select("#leftgraph"); // Initialize or re-select the SVG element
    rightGraph = d3.select("#rightgraph");

    // Load default data (Episode 1)
    const defaultData = await getJSON("ep1");
    let data = defaultData;
    const characters = extractCharacterNames(defaultData.nodes);

    populateDropdown(characterSelector, characters); // Populate the character dropdown with names initially

    updateSliders(data);

    display(graph, defaultData.nodes, defaultData.links); // Display the default graph
    display(rightGraph, defaultData.nodes, defaultData.links); //Display an empty graph initially

    let rightData = defaultData;

    filmSelector.addEventListener("change", async () => {
        const selectedFilm = filmSelector.value;
        data = await getJSON(selectedFilm);
        rightData = data;
        updateSliders(data)
        updateRightGraph();
        const characters = extractCharacterNames(data.nodes);
        populateDropdown(characterSelector, characters);
        //characterValues = extractCharacterValues(data.nodes);
        if (!graph.empty()) {
            graph.selectAll("*").remove();
            display(graph, data.nodes, data.links);
        } else {
            console.error("SVG element not found!!");
        }
    });

    function updateRightGraph() {
        if (!rightGraph.empty()) { rightGraph.selectAll("*").remove(); }
        display(rightGraph, rightData.nodes, rightData.links);

        let lowerValue = document.getElementById("lower").value;
        let upperValue = document.getElementById("upper").value;
        switch (filterOption.value) {
            case "none":
                break;
            case "node-value":
                rightGraph.selectAll("circle")
                    .filter(function (d) { return d.value > upperValue || d.value < lowerValue })
                    .attr("display", "none");
                break;
            case "link-value":
                rightGraph.selectAll("line")
                    .filter(function (l) { return l.value < lowerValue || l.value > upperValue })
                    .attr("display", "none");
                break;
        }
    }

    function updateSliders(data) {
        if (filterOption.value === "none") {
            document.getElementById("upper").style.display = "none";
            document.querySelector('label[for="upper"]').style.display = "none";
            document.getElementById("lower").style.display = "none";
            document.querySelector('label[for="lower"]').style.display = "none";
        }
        else {
            document.getElementById("upper").style.display = "grid";
            document.querySelector('label[for="upper"]').style.display = "grid";
            document.getElementById("lower").style.display = "grid";
            document.querySelector('label[for="lower"]').style.display = "grid";
        }

        let max = findMax(data);
        let min = findMin(data);

        if (filterOption.value === "link-value") {
            max = findMaxLinkValue(data);
            min = findMinLinkValue(data);
        }

        document.getElementById("upper").setAttribute("max", max);
        document.getElementById("lower").setAttribute("min", min);
        document.getElementById("upper").setAttribute("min", min);
        document.getElementById("lower").setAttribute("max", max);
        document.getElementById("upper").value = max;
        document.getElementById("lower").value = min;
    }

    sliderUpper.addEventListener("change", async () => {
        document.getElementById("lower-value").value = document.getElementById("lower").value;
        document.getElementById("upper-value").value = document.getElementById("upper").value;
        updateRightGraph();
    });

    sliderLower.addEventListener("change", async () => {
        document.getElementById("lower-value").value = document.getElementById("lower").value;
        document.getElementById("upper-value").value = document.getElementById("upper").value;
        updateRightGraph();
    });

    characterSelector.addEventListener("change", async () => {
        const selectedCharacter = characterSelector.value;
        let selectedCharacterScenes = 0;

        // Reset the color of all circles to their original color
        d3.selectAll("circle")
            .attr("fill", function (d) { return d.colour; });

        // Change the color of the selected character's node to green
        d3.selectAll("circle")
            .filter(function (d) { return d.name === selectedCharacter; })
            .attr("fill", "green")
            .attr("opacity", 1);
        d3.selectAll(".node")
            .filter(function (d) { 
                if (d.name === selectedCharacter) 
                {   console.log(d);
                    selectedCharacterScenes = d.value; }; 
                return d.name === selectedCharacter })
            .style("display", "block");

        document.getElementById("info-selected-character").textContent = selectedCharacter;
        document.getElementById("selected-character-scenes").textContent = selectedCharacterScenes;
    });


    filterOption.addEventListener("change", async () => {
        updateSliders(data);
        updateRightGraph();
    });

    function highlightSelectedCharacter(selectedCharacter) {
        // Reset the color of all circles and hide all names
        d3.selectAll("circle")
            .attr("fill", function (d) { return d.colour; });
        d3.selectAll("text")
            .style("display", "none");

        d3.selectAll("circle")
            .attr("fill", function (d) { return d.colour; });
        d3.selectAll("text")
            .style("display", "none");

        // Remove highlighting from links connected to the previously clicked node
        d3.selectAll(".link")
            .attr("stroke", "blue")
            .attr("stroke-width", 1);

        // Reset the clickedNode variable
        clickedNode = null;


        // Change the color of the selected character's node to red
        d3.selectAll("circle")
            .filter(function (d) { return d.name === selectedCharacter; })
            .attr("fill", "red");

        // Show the name of the selected character
        d3.selectAll("text")
            .filter(function (d) { return d.name === selectedCharacter; })
            .style("display", "block");
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