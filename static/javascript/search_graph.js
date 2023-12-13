async function fetchDataAndDraw(proteinId, minWeight, maxWeight,maxNeighborDepth, numberOfNodes, searchType) {

	try {
		// Fetch data from Flask API
		console.log(searchType);
		const response = await fetch(`/api/fetchData/${proteinId}/${minWeight}/${maxWeight}/${maxNeighborDepth}/${numberOfNodes}/${searchType}`);
		const data = await response.json();
		console.log(data);
		//rename the edges variable to links
		data.links = data.edges;

		// check if their is nodes in the graph
		if (data.nodes.length == 0) {
			// make a big message that says no nodes found on the screen by replacing the body with a div that contains the message
			const noNodes = document.createElement("div");
			noNodes.setAttribute("id", "noNodes");
			noNodes.setAttribute("style", "background-color: white;  z-index: 0; width: 100%; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;");
			noNodes.innerHTML = `<h3 style="padding-bottom: 10px; font-size: 50px;">No nodes found for this search</h3>`;
			document.body.innerHTML = "";
			const returnButton = document.createElement("button");
			returnButton.setAttribute("id", "returnButton");
			returnButton.setAttribute("style", " top: 10px; left: 10px; z-index: 99999999999999999999999; padding: 5px; width: auto; height: auto; background-color: white; border-radius: 5px; border: 1px solid black; font-size: 30px;");
			returnButton.innerHTML = "Return";
			returnButton.addEventListener("click", () => {
				window.location.href = "/";
			});
			noNodes.appendChild(returnButton);
			document.body.appendChild(noNodes);
			return;
		}
		
		// Update the graph
		const graph = updateGraph(data, minWeight, maxWeight, maxNeighborDepth, numberOfNodes);
		document.body.appendChild(graph)

		// add a bind when pressing the 3 key to switch to 3d
		document.addEventListener("keydown", (event) => {
			if (event.key == "3") {
				console.log("3 pressed");
				document.body.innerHTML = "";
				const graph = document.createElement("div");
				graph.setAttribute("id", "graph");
				document.body.appendChild(graph);	
				const Graph = ForceGraph3D()
				(document.getElementById('graph'))
					.backgroundColor('#000015')
					.graphData(data)
					.nodeLabel('title')
					.nodeColor(node => node.group == 1 ? "#ff0000" : node.group == 2 ? "#cd34b5" : "#9ce800")
					.linkDirectionalParticles("value")
					.linkDirectionalParticleSpeed(d => d.value * 0.01)
					.onNodeClick(node => {
						document.getElementById("proteinInfo").innerHTML = `<h3>Protein Info :</h3>
							<p style="padding-top: 10px;"><strong>Entry Name</strong>: ${node.title}</p>
							<p style="padding-top: 5px;"><strong>Organism</strong>: ${node.organism.length > 50 ? node.organism.slice(0, 50) + "..." : node.organism}</p>
							<p style="padding-top: 5px;"><strong>GO list</strong>: ${node.interpro}</p>
							<p style="padding-top: 5px;"><strong>EC Number</strong>: ${node.ec == null ? "None" : node.ec}</p>
							<p style="padding-top: 5px;"><strong>Start of sequence</strong>: ${node.start}</p>
							<p style="padding-top: 5px;"><strong>End of sequence</strong>: ${node.end}</p>
							<p style="padding-top: 5px;"><strong>Node ID</strong>: ${node.id}</p>`;
						// if the shift key is pressed when clicking on a node
						document.addEventListener("keydown", (event) => {
							if (event.shiftKey) {
								window.location.href = `/search?proteinId=${node.title}&minWeight=${minWeight}&maxNeighborDepth=${maxNeighborDepth}&maxWeight=${maxWeight}&numberOfNodes=${numberOfNodes}&searchType=proteinentry`;
							}
							}
						);
					});
				Graph.zoomToFit();
				createLeftContainer(maxNeighborDepth,["#ff0000",
					"#cd34b5",
					"#9ce800"]);
				var nodeInfo = {id: data.nodes[0].id, title: data.nodes[0].title, label: data.nodes[0].label, organism: data.nodes[0].organism, interpro: data.nodes[0].interpro, start: data.nodes[0].start, end: data.nodes[0].end, ec: data.nodes[0].ec};
				createRightContainer(nodeInfo, data.nodes, data.links, data);
				createSliders();
				create_bottom_container(minWeight,maxWeight,numberOfNodes,maxNeighborDepth,proteinId,searchType);
			}
			
			if (event.key == "2") {
				console.log("2 pressed");
				// reload the page
				window.location.href = `/search?proteinId=${proteinId}&minWeight=${minWeight}&maxNeighborDepth=${maxNeighborDepth}&maxWeight=${maxWeight}&numberOfNodes=${numberOfNodes}&searchType=${searchType}`;
			}
		});

	
	} catch (error) {
		console.error(error);
	}
}

function updateGraph(data, minWeight, maxWeight,maxNeighborDepth, numberOfNodes) {
	// Extract nodes and links from Neo4j response (replace with your data extraction logic)
	const nodes = extractNodes(data);
	const links = extractLinks(data);
	const nbr_nodes = nodes.length < 200 ? 200 : nodes.length;	
	const proteinId = nodes[0].title;
	maxNeighborDepth = parseInt(maxNeighborDepth);

	const width = window.innerWidth;
	const height = window.innerHeight;

	const colorPalette = ["#ff0000",
	"#cd34b5",
	"#9ce800"];

	// Specify the color scale.
	const color = d3.scaleOrdinal(colorPalette);

	// Create a simulation with several forces.
	const simulation = d3.forceSimulation(nodes)
		.force("link", d3.forceLink(links).id(d => d.id))
		.force("charge", d3.forceManyBody())
		.force("x", d3.forceX())
		.force("y", d3.forceY());

	// Create the SVG container.
	const svg = d3.create("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", [-width/ (4* 150/nbr_nodes), -height/ (4* 150/nbr_nodes), width/(2* 150/nbr_nodes), height/(2* 150/nbr_nodes)])
		.attr("style", "max-width: 100%; height: 99vh; max-height: 100%; position: absolute; top: 0; left: 0; z-index: 1;");

	// add zoom capabilities
	zoom = d3.zoom()
		.scaleExtent([0.1, 10]) // min-max zoom
		.on('zoom', handleZoom);

	// add zoom capabilities
	svg.call(zoom);

	function handleZoom(event) {
		svg.attr('transform', event.transform);
	}

	// Add a line for each link, and a circle for each node.
	const link = svg.append("g")
		.attr("stroke", "#aaa")
		.attr("stroke-opacity", 0.5)
		.selectAll("line")
		.data(links)
		.join("line")
		.attr("stroke-width", d => Math.round((d.value+1) ** 2));
	
	link.append("title")
		.text(d => d.value);

	const node = svg.append("g")
		.attr("stroke", "#fff")
		.attr("stroke-width", 1)
		.selectAll("circle")
		.data(nodes)
		.join("circle")
		.attr("r", 5)
		.attr("fill", (d) => colorPalette[Math.round(((colorPalette.length - 1)/(maxNeighborDepth == 0 ? 1 : maxNeighborDepth)) * (d.group-1))])

	node.append("title")
		.text(d => d.title);

	// Add a drag behavior.
	node.call(d3.drag()
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended));
	
	// Set the position attributes of links and nodes each time the simulation ticks.
	simulation.on("tick", () => {
		link
			.attr("x1", d => d.source.x)
			.attr("y1", d => d.source.y)
			.attr("x2", d => d.target.x)
			.attr("y2", d => d.target.y);

		node
			.attr("cx", d => d.x)
			.attr("cy", d => d.y);
	});

	// Reheat the simulation when drag starts, and fix the subject position.
	function dragstarted(event) {
		if (!event.active) simulation.alphaTarget(0.3).restart();
		event.subject.fx = event.subject.x;
		event.subject.fy = event.subject.y;
	}

	// Update the subject (dragged node) position during drag.
	function dragged(event) {
		event.subject.fx = event.x;
		event.subject.fy = event.y;
		
	}

	// Restore the target alpha so the simulation cools after dragging ends.
	// Unfix the subject position now that it’s no longer being dragged.
	function dragended(event) {
		if (!event.active) simulation.alphaTarget(0);
		if (event.sourceEvent.shiftKey) {
			window.location.href = `/search?proteinId=${event.subject.title}&minWeight=${minWeight}&maxNeighborDepth=${maxNeighborDepth}&maxWeight=${maxWeight}&numberOfNodes=${numberOfNodes}&searchType=proteinentry`;
		}
		document.getElementById("proteinInfo").innerHTML = `<h3>Protein Info :</h3>
			<p style="padding-top: 10px;"><strong>Entry Name</strong>: ${event.subject.title}</p>
			<p style="padding-top: 5px;"><strong>Organism</strong>: ${event.subject.organism.length > 50 ? event.subject.organism.slice(0, 50) + "..." : event.subject.organism}</p>
			<p style="padding-top: 5px;"><strong>GO list</strong>: ${event.subject.interpro}</p>
			<p style="padding-top: 5px;"><strong>EC Number</strong>: ${event.subject.ec == null ? "None" : event.subject.ec}</p>
			<p style="padding-top: 5px;"><strong>Start of sequence</strong>: ${event.subject.start}</p>
			<p style="padding-top: 5px;"><strong>End of sequence</strong>: ${event.subject.end}</p>
			<p style="padding-top: 5px;"><strong>Node ID</strong>: ${event.subject.id}</p>`;
		event.subject.fx = null;
		event.subject.fy = null;
	}

	createLeftContainer(maxNeighborDepth,colorPalette);

	var nodeInfo = {id: nodes[0].id, title: nodes[0].title, label: nodes[0].label, organism: nodes[0].organism, interpro: nodes[0].interpro, start: nodes[0].start, end: nodes[0].end, ec: nodes[0].ec};

	createRightContainer(nodeInfo, nodes, links, data);

	

	

	return svg.node();
}


function createSliders(minweight,maxweight,numberOfNodes,maxNeighborDepth,proteinid,searchType){

	const sliders = document.createElement("div");
	sliders.setAttribute(
		"style",
		"background-color: white; border-radius: 5px; border: 1px solid black; z-index: 99999999999999999999999; padding: 5px; width: auto; height: auto; display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start;"
	);
	sliders.innerHTML = `<h3>Weights :</h3>
		<form action="/search" method="get" style="display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start;">
			<input style="display: none; width: 0; height: 0;" type="text" name="minWeight" id="minWeight" value="${minweight}">
			<input style="display: none; width: 0; height: 0;" type="text" name="maxWeight" id="maxWeight" value="${maxweight}">
			<div class="range_container">
				<div class="sliders_control">
					<input id="fromSlider" type="range" value="${minweight}" min="0" max="1" step="0.01" />
					<input id="toSlider" type="range" value="${maxweight}" min="0" max="1" step="0.01"/>
				</div>
				<div class="sliders_values">
					<p>Weight Value: <span id="fromValue">${minweight}</span> - <span id="toValue">${maxweight}</span></p>
				</div>
			</div>
			<p><strong>Number of nodes</strong>: <span id="numberOfNodesValue">${numberOfNodes}</span></p>
			<input type="range" min="10" max="500" value="${numberOfNodes}" step="10" id="numberOfNodesSlider" style="margin-bottom: 15px;" name="numberOfNodes">
			<p style="padding-top: 5px;"><strong>Max neighbor depth</strong>: <span id="maxNeighborDepthValue">${maxNeighborDepth}</span></p>
			<input type="range" min="0" max="2" value="${maxNeighborDepth}" step="1" id="maxNeighborDepthSlider" style="margin-bottom: 15px;" name="maxNeighborDepth">
			<input type="hidden" name="proteinId" value="${proteinid}">
			<input type="hidden" name="searchType" value="${searchType}">
			<input type="submit" value="Search" style="margin: auto; margin-bottom: 15px; width: 100px; height: 30px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
		</form>`;

	const numberOfNodesSlider = sliders.querySelector("#numberOfNodesSlider");
	const numberOfNodesValue = sliders.querySelector("#numberOfNodesValue");
	numberOfNodesSlider.addEventListener("input", () => {
		numberOfNodesValue.textContent = numberOfNodesSlider.value;
	});

	const maxNeighborDepthSlider = sliders.querySelector("#maxNeighborDepthSlider");
	const maxNeighborDepthValue = sliders.querySelector("#maxNeighborDepthValue");
	maxNeighborDepthSlider.addEventListener("input", () => {
		maxNeighborDepthValue.textContent = maxNeighborDepthSlider.value;
	});

	return sliders;
}


function controlFromSlider(fromSlider, toSlider, fromValue, minweight, maxweight) {
	const [from, to] = getParsed(fromSlider, toSlider);
	fillSlider(fromSlider, toSlider, '#FFA500', '#0000FF', toSlider);
	if (from > to) {
		fromSlider.value = to;
		fromValue.innerHTML = to;
		minweight.value = to;
	} else {
		minweight.value = from;
		fromValue.innerHTML = from;
		fromSlider.value = from;
	}
}

function controlToSlider(fromSlider, toSlider, toValue, minweight, maxweight) {
	const [from, to] = getParsed(fromSlider, toSlider);
	fillSlider(fromSlider, toSlider, '#FFA500', '#0000FF', toSlider);
	setToggleAccessible(toSlider);
	if (from <= to) {
		toSlider.value = to;
		toValue.innerHTML = to;
		maxweight.value = to;
	} else {
		toValue.innerHTML = from;
		toSlider.value = from;
		maxweight.value = from;
	}
}

function getParsed(currentFrom, currentTo) {
	const from = parseFloat(currentFrom.value);
	const to = parseFloat(currentTo.value);
	return [from, to];
}

function fillSlider(from, to, sliderColor, rangeColor, controlSlider) {
	const rangeDistance = to.max - to.min;
	const fromPosition = from.value - to.min;
	const toPosition = to.value - to.min;
	controlSlider.style.background = `linear-gradient(
	to right,
	${sliderColor} 0%,
	${sliderColor} ${(fromPosition) / (rangeDistance) * 100}%,
	${rangeColor} ${((fromPosition) / (rangeDistance)) * 100}%,
	${rangeColor} ${(toPosition) / (rangeDistance) * 100}%, 
	${sliderColor} ${(toPosition) / (rangeDistance) * 100}%, 
	${sliderColor} 100%)`;
}

function setToggleAccessible(currentTarget) {
	const toSlider = document.querySelector('#toSlider');
	if (Number(currentTarget.value) <= 0) {
		toSlider.style.zIndex = 2;
	} else {
		toSlider.style.zIndex = 0;
	}
}


function create_bottom_container(minweight,maxweight,numberOfNodes,maxNeighborDepth,proteinid,searchType) {
	// create the bottom div that contains the sliders
	const bottomContainer = document.createElement("div");
	bottomContainer.setAttribute("id", "bottomContainer");
	bottomContainer.setAttribute("style", "position: absolute; bottom: 10px; left: 10px;");
	bottomContainer.appendChild(createSliders(minweight,maxweight,numberOfNodes,maxNeighborDepth,proteinid,searchType));
	document.body.appendChild(bottomContainer);

	const fromSlider = document.querySelector('#fromSlider');
	const toSlider = document.querySelector('#toSlider');
	const fromValue = document.querySelector('#fromValue');
	const toValue = document.querySelector('#toValue');
	const minweight_div = document.querySelector('#minWeight');
	const maxweight_div = document.querySelector('#maxWeight');
	fillSlider(fromSlider, toSlider, '#FFA500', '#0000FF', toSlider);
	setToggleAccessible(toSlider);
	fromSlider.oninput = () => controlFromSlider(fromSlider, toSlider, fromValue, minweight_div, maxweight_div);
	toSlider.oninput = () => controlToSlider(fromSlider, toSlider, toValue, minweight_div, maxweight_div);
}


// Function to extract nodes from Neo4j response
function extractNodes(data) {
	return data.nodes.map(node => {
		return {
			id: node.id,
			label: node.labels,
			title: node.title,
			group: node.group,  
			organism: node.organism,
			// add a cariage return to the interpro string every 4 interpros
			interpro: node.interpro.slice(0,-1).join(", ").split(", ").map((interpro, index) => (index + 1) % 4 == 0 ? interpro + ",<br>" : interpro + ",").join(" ").slice(0, (node.interpro.length - 1) % 4 == 0 ? -5 : -1),
			start: node.start,
			end: node.end,
			ec: node.ec,
		};
	});
}

// Function to extract links from Neo4j response
function extractLinks(data) {
	return data.edges.map(edge => {
		return {
			source: edge.source,
			target: edge.target,
			label: edge.label,
			title: edge.title,
			value: edge.value,
		};
	});
}

function createLegend(maxNeighborDepth,colorPalette) {
	const legend = document.createElement("div");
	legend.setAttribute("id", "legend");
	legend.setAttribute("style", "background-color: white; border-radius: 5px; border: 1px solid black; z-index: 99999999999999999999999; padding: 5px; width: 150px; height: auto; display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start;");
	legend.innerHTML = "<h3 style='padding-bottom: 5px;'>Legend :</h3>";
	// add color legend to the legend div the first color is the search protein color and the second is the color of the first neighbor and so on
	for (let i = 1; i <= (parseInt(maxNeighborDepth)+1); i++) {
		const legendItem = document.createElement("div");
		legendItem.setAttribute("id", `legend-${i}`);
		// add a circle of the color and the text as explained above
		if (i == 1) {
			legendItem.innerHTML = `<svg width="20" height="20"><circle cx="10" cy="10" r="5" fill="${colorPalette[Math.round(((colorPalette.length - 1)/(maxNeighborDepth == 0 ? 1 : maxNeighborDepth)) * (i-1))]}"></circle></svg> Searched Protein`;
		} else {
			legendItem.innerHTML = `<svg width="20" height="20"><circle cx="10" cy="10" r="5" fill="${colorPalette[Math.round(((colorPalette.length - 1)/(maxNeighborDepth == 0 ? 1 : maxNeighborDepth)) * (i-1))]}"></circle></svg> Neighbor ${i - 1}`;
		}
		legend.appendChild(legendItem);
	}
	return legend;
}

function createTutorial() {
	const tutorial = document.createElement("div");
	tutorial.setAttribute("id", "tutorial");
	tutorial.setAttribute("style", "background-color: white; border-radius: 5px; border: 1px solid black; z-index: 0; padding: 5px; width: auto; height: auto; display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start;");
	tutorial.innerHTML = `<h3>Tutorial :</h3>
		<p style="padding-top: 10px;"><strong>Switch between 2D and 3D</strong>: 2 or 3</p>
		<p style="padding-top: 5px;"><strong>Zoom</strong>: Scroll</p>
		<p style="padding-top: 5px;"><strong>Move</strong>: Click and drag</p>
		<p style="padding-top: 5px;"><strong>See info</strong>: Click on a node</p>
		<p style="padding-top: 5px;"><strong>Search a Neighbor</strong>: Shift + Click on a node</p>`;	
	return tutorial;
}

function createLeftContainer(maxNeighborDepth,colorPalette) {
	const leftContainer = document.createElement("div");
	leftContainer.setAttribute("id", "leftContainer");
	leftContainer.setAttribute("style", "position: absolute; top: 10px; left: 10px; ");
	leftContainer.appendChild(createTutorial());
	leftContainer.appendChild(document.createElement("br"));
	leftContainer.appendChild(createLegend(maxNeighborDepth,colorPalette));
	document.body.appendChild(leftContainer);
}


function createProteinInfo(nodeInfo ) {
	const proteinInfo = document.createElement("div");
	proteinInfo.setAttribute("id", "proteinInfo");
	proteinInfo.setAttribute("style", "background-color: white; border-radius: 5px; border: 1px solid black; z-index: 0; padding: 5px; width: auto; height: auto; display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start;");
	proteinInfo.innerHTML = `<h3>Protein Info :</h3>
		<p style="padding-top: 10px;"><strong>Entry Name</strong>: ${nodeInfo.title}</p>
		<p style="padding-top: 5px;"><strong>Organism</strong>: ${nodeInfo.organism.length > 50 ? nodeInfo.organism.slice(0, 50) + "..." : nodeInfo.organism}</p>
		<p style="padding-top: 5px;"><strong>EC Number</strong>: ${nodeInfo.ec == null ? "None" : nodeInfo.ec}</p>
		<p style="padding-top: 5px;"><strong>GO list</strong>: ${nodeInfo.interpro == null ? "None" : nodeInfo.interpro}</p>	
		<p style="padding-top: 5px;"><strong>Start of sequence</strong>: ${nodeInfo.start}</p>
		<p style="padding-top: 5px;"><strong>End of sequence</strong>: ${nodeInfo.end}</p>
		<p style="padding-top: 5px;"><strong>Node ID</strong>: ${nodeInfo.id}</p>`;
	return proteinInfo;
}

function createStats(nodes, links, data) {
	const stats = document.createElement("div");
	stats.setAttribute("id", "stats");
	stats.setAttribute("style", "background-color: white; border-radius: 5px; border: 1px solid black; z-index: 0; padding: 5px; width: fit-content; height: auto; display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start;");
	stats.innerHTML = `<h3>Stats :</h3>
		<p style="padding-top: 10px;"><strong>Number of nodes in the graph</strong>: ${nodes.length}</p>
		<p style="padding-top: 5px;"><strong>Number of links in the graph</strong>: ${links.length}</p>
		<p style="padding-top: 5px;"><strong>Number of 1st degree relation</strong>: ${data.stats.degree_1}</p>
		<p style="padding-top: 5px;"><strong>Number of 2nd degree relation</strong>: ${data.stats.degree_2}</p>
		<p style="padding-top: 5px;"><strong>Average relationship weight</strong>: ${(links.reduce((a, b) => a + b.value, 0) / links.length).toFixed(3)}</p>
		<p style="padding-top: 5px;"><strong>Max relationship weight</strong>: ${data.stats.max_weight[1]} <strong>with</strong> ${data.stats.max_weight[0]}</p>`
	return stats;
}

function createRightContainer(nodeInfo, nodes, links, data) {
	const rightContainer = document.createElement("div");
	rightContainer.setAttribute("id", "rightContainer");
	rightContainer.setAttribute("style", "position: absolute; top: 10px; right: 10px; display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-end; z-index: 0;");
	rightContainer.appendChild(createProteinInfo(nodeInfo));
	rightContainer.appendChild(document.createElement("br"));
	rightContainer.appendChild(createStats(nodes, links, data));
	document.body.appendChild(rightContainer);
}
