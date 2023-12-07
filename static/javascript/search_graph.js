async function fetchDataAndDraw(proteinId, minWeight, maxWeight,maxNeighborDepth, numberOfNodes, searchType) {

	try {
		// Fetch data from Flask API
		const response = await fetch(`/api/fetchData/${proteinId}/${minWeight}/${maxWeight}/${maxNeighborDepth}/${numberOfNodes}/${searchType}`);
		const data = await response.json();

		
		// Update the graph
		const graph = updateGraph(data, minWeight, maxWeight, maxNeighborDepth, numberOfNodes);
		document.body.appendChild(graph)

	
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

	const colorPalette = ["#ffd700",
	"#ffb14e",
	"#fa8775",
	"#ea5f94",
	"#cd34b5",
	"#9d02d7",
	"#0000ff"];

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
		.attr("viewBox", [-width/ (4* 150/nbr_nodes), -height/ (4* 150/nbr_nodes), width/(2* 150/nbr_nodes), height/(2* 0/nbr_nodes)])
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
		.attr("stroke-width", d => Math.round(d.value * 30)/7);
	
	link.append("title")
		.text(d => d.value);

	const node = svg.append("g")
		.attr("stroke", "#fff")
		.attr("stroke-width", 1)
		.selectAll("circle")
		.data(nodes)
		.join("circle")
		.attr("r", 5)
		.attr("fill", (d) => colorPalette[Math.round(((colorPalette.length - 1)/(maxNeighborDepth+1)) * d.group)])

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
			window.location.href = `/search?proteinId=${event.subject.title}&minWeight=${minWeight}&maxNeighborDepth=${maxNeighborDepth}&maxWeight=${maxWeight}&numberOfNodes=${numberOfNodes}&searchType="proteinentry"`;
		}
		document.getElementById("proteinInfo").innerHTML = `<h3>Protein Info :</h3>
			<p style="padding-top: 10px;"><strong>Entry Name</strong>: ${event.subject.title}</p>
			<p style="padding-top: 5px;"><strong>Organism</strong>: ${event.subject.organism}</p>
			<p style="padding-top: 5px;"><strong>GO list</strong>: ${event.subject.interpro}</p>
			<p style="padding-top: 5px;"><strong>EC Number</strong>: ${event.subject.ec == null ? "None" : event.subject.ec}</p>
			<p style="padding-top: 5px;"><strong>Start of sequence</strong>: ${event.subject.start}</p>
			<p style="padding-top: 5px;"><strong>End of sequence</strong>: ${event.subject.end}</p>
			<p style="padding-top: 5px;"><strong>Node ID</strong>: ${event.subject.id}</p>`;
		event.subject.fx = null;
		event.subject.fy = null;
	}

	function createLegend() {
		const legend = document.createElement("div");
		legend.setAttribute("id", "legend");
		legend.setAttribute("style", "background-color: white; border-radius: 5px; border: 1px solid black; z-index: 99999999999999999999999; padding: 5px; width: 150px; height: auto; display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start;");
		legend.innerHTML = "<h3 style='padding-bottom: 5px;'>Legend :</h3>";
		// add color legend to the legend div the first color is the search protein color and the second is the color of the first neighbor and so on
		for (let i = 1; i <= (maxNeighborDepth+1); i++) {
			const legendItem = document.createElement("div");
			legendItem.setAttribute("id", `legend-${i}`);
			// add a circle of the color and the text as explained above
			if (i == 1) {
				legendItem.innerHTML = `<svg width="20" height="20"><circle cx="10" cy="10" r="5" fill="${colorPalette[Math.round(((colorPalette.length - 1)/(maxNeighborDepth+1)) * i)]}"></circle></svg> Searched Protein`;
			} else {
				legendItem.innerHTML = `<svg width="20" height="20"><circle cx="10" cy="10" r="5" fill="${colorPalette[Math.round(((colorPalette.length - 1)/(maxNeighborDepth+1)) * i)]}"></circle></svg> Neighbor ${i - 1}`;
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
			<p style="padding-top: 10px;"><strong>Zoom</strong>: Scroll</p>
			<p style="padding-top: 5px;"><strong>Drag</strong>: Click and drag</p>
			<p style="padding-top: 5px;"><strong>See info</strong>: Click on a node</p>
			<p style="padding-top: 5px;"><strong>Search a Neighbor</strong>: Shift + Click on a node</p>`;	
		return tutorial;
	}

	// create the left div that contains the legend and the tutorial
	leftContainer = document.createElement("div");
	leftContainer.setAttribute("id", "leftContainer");
	leftContainer.setAttribute("style", "position: absolute; top: 10px; left: 10px; ");
	leftContainer.appendChild(createTutorial());
	leftContainer.appendChild(document.createElement("br"));
	leftContainer.appendChild(createLegend());
	document.body.appendChild(leftContainer);

	var nodeInfo = {id: nodes[0].id, title: nodes[0].title, label: nodes[0].label, organism: nodes[0].organism, interpro: nodes[0].interpro, start: nodes[0].start, end: nodes[0].end, ec: nodes[0].ec};
	
	function createProteinInfo() {
		const proteinInfo = document.createElement("div");
		proteinInfo.setAttribute("id", "proteinInfo");
		proteinInfo.setAttribute("style", "background-color: white; border-radius: 5px; border: 1px solid black; z-index: 0; padding: 5px; width: auto; height: auto; display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start;");
		proteinInfo.innerHTML = `<h3>Protein Info :</h3>
			<p style="padding-top: 10px;"><strong>Entry Name</strong>: ${nodeInfo.title}</p>
			<p style="padding-top: 5px;"><strong>Organism</strong>: ${nodeInfo.organism}</p>
			<p style="padding-top: 5px;"><strong>EC Number</strong>: ${nodeInfo.ec == null ? "None" : nodeInfo.ec}</p>
			<p style="padding-top: 5px;"><strong>GO list</strong>: ${nodeInfo.interpro == null ? "None" : nodeInfo.interpro}</p>	
			<p style="padding-top: 5px;"><strong>Start of sequence</strong>: ${nodeInfo.start}</p>
			<p style="padding-top: 5px;"><strong>End of sequence</strong>: ${nodeInfo.end}</p>
			<p style="padding-top: 5px;"><strong>Node ID</strong>: ${nodeInfo.id}</p>`;
		return proteinInfo;
	}

	function createStats() {
		const stats = document.createElement("div");
		stats.setAttribute("id", "stats");
		stats.setAttribute("style", "background-color: white; border-radius: 5px; border: 1px solid black; z-index: 0; padding: 5px; width: fit-content; height: auto; display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start;");
		stats.innerHTML = `<h3>Stats :</h3>
			<p style="padding-top: 10px;"><strong>Number of nodes in the graph</strong>: ${nodes.length}</p>
			<p style="padding-top: 5px;"><strong>Number of links in the graph</strong>: ${links.length}</p>
			<p style="padding-top: 5px;"><strong>Number of nodes in the graph with first degree relation</strong>: ${data.stats.degree_1}</p>
			<p style="padding-top: 5px;"><strong>Number of nodes in the graph with second degree relation</strong>: ${data.stats.degree_2}</p>
			<p style="padding-top: 5px;"><strong>Average relationship weight</strong>: ${links.reduce((a, b) => a + b.value, 0) / links.length}</p>
			<p style="padding-top: 5px;"><strong>Max relationship weight</strong>: ${data.stats.max_weight[1]} <strong>with</strong> ${data.stats.max_weight[0]}</p>`
		return stats;
	}

	// create the right div that contains the protein info and the stats
	rightContainer = document.createElement("div");
	rightContainer.setAttribute("id", "rightContainer");
	rightContainer.setAttribute("style", "position: absolute; top: 10px; right: 10px; display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-end; z-index: 0;");
	rightContainer.appendChild(createProteinInfo());
	rightContainer.appendChild(document.createElement("br"));
	rightContainer.appendChild(createStats());
	document.body.appendChild(rightContainer);

	

	

	return svg.node();
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

