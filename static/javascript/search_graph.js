async function fetchDataAndDraw(proteinId, minWeight) {

	try {
		// Fetch data from Flask API
		const response = await fetch(`/api/fetchData/${proteinId}/${minWeight}`);
		const data = await response.json();

		
		// Update the graph
		const graph = updateGraph(data, minWeight);
		document.body.appendChild(graph)

	
	} catch (error) {
		console.error(error);
	}
}

function updateGraph(data, minWeight) {
	// Extract nodes and links from Neo4j response (replace with your data extraction logic)
	const nodes = extractNodes(data);
	const links = extractLinks(data);

	const width = window.innerWidth;
	const height = window.innerHeight;

	// Specify the color scale.
	const color = d3.scaleOrdinal(["#ffd700",
	"#ffb14e",
	"#fa8775",
	"#ea5f94",
	"#cd34b5",
	"#9d02d7",
	"#0000ff"]);

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
		.attr("viewBox", [-width/3.5/ 2, -height/3.5 / 2, width/3.5, height/3.5])
		.attr("style", "max-width: 100%; height: 99vh;");

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
		.attr("stroke-opacity", 1)
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
		.attr("fill", (d) => color(d.group))

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
			console.log(event.subject.id);
			// redirect to the exact same but with the new protein id and the same minWeight with a post request
			window.location.href = `/search?proteinId=${event.subject.title}&minWeight=${minWeight}`;
		}
		event.subject.fx = null;
		event.subject.fy = null;
	}

	const legend = document.createElement("div");
	legend.setAttribute("id", "legend");
	legend.setAttribute("style", "position: absolute; top: 10px; left: 10px; background-color: white; border-radius: 5px; border: 1px solid black; z-index: 99999999999999999999999; padding: 5px; width: 150px; height: 100px; display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start;");
	legend.innerHTML = "<h3>Legend :</h3>";
	// add color legend to the legend div the first color is the search protein color and the second is the color of the first neighbor and so on
	for (let i = 1; i < 4; i++) {
		const legendItem = document.createElement("div");
		legendItem.setAttribute("id", `legend-${i}`);
		// add a circle of the color and the text as explained above
		if (i == 1) {
			legendItem.innerHTML = `<svg width="20" height="20"><circle cx="10" cy="10" r="5" fill="${color(i)}"></circle></svg> Searched Protein`;
		} else {
			legendItem.innerHTML = `<svg width="20" height="20"><circle cx="10" cy="10" r="5" fill="${color(i)}"></circle></svg> Neighbor ${i - 1}`;
		}
		legend.appendChild(legendItem);
	}
	document.body.appendChild(legend);
	// change the scale of the graph to fit the screen

	return svg.node();
}

// Function to extract nodes from Neo4j response
function extractNodes(data) {
	// extract the Protein nodes from the data above
	return data.nodes.map(node => {
		return {
			id: node.id,
			label: node.labels,
			title: node.title,
			group: node.group,  
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

