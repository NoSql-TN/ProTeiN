from flask import Blueprint,session,request,jsonify
from flask.templating import render_template
from neo4j import GraphDatabase

# Definition of the blueprint
searchBP = Blueprint('searchBP', __name__)

# Definition of the search route
@searchBP.route("/search", methods=["POST", "GET"])
def search():
    if request.method == "POST":
        proteinid = request.form["proteinentry"]
        minweight = request.form["minweight"]
        maxweight = request.form["maxweight"]
        searchType = request.form["searchtype"]
        return render_template("search.html", proteinid=proteinid, minweight=minweight, maxweight=maxweight, maxNeighborDepth=2, numberOfNodes=200, searchType=searchType)
    elif request.method == "GET":
        args = request.args
        proteinid = args.get("proteinId")
        minweight = args.get("minWeight")
        maxweight = args.get("maxWeight")
        maxNeighborDepth = args.get("maxNeighborDepth")
        numberOfNodes = args.get("numberOfNodes")
        searchType = args.get("searchType")
        return render_template("search.html", proteinid=proteinid, minweight=minweight, maxweight=maxweight ,maxNeighborDepth=maxNeighborDepth, numberOfNodes=numberOfNodes, searchType=searchType)
    else:
        return render_template("search.html")


@searchBP.route('/api/fetchData/<protein_id>/<min_weight>/<max_weight>/<max_neighbor_depth>/<number_of_nodes>/<search_type>')
def fetch_data(protein_id, min_weight, max_weight, max_neighbor_depth, number_of_nodes, search_type):
    neo4j = Neo4j('bolt://localhost:7687', 'neo4j', 'remiremiremi2001')
    graph, data = neo4j.fetch_data(protein_id, min_weight, max_weight, max_neighbor_depth, number_of_nodes, search_type)
    nodes = []
    relationships = []

    
    # Create the data to return
    for node in graph.nodes:
        nodes.append({"id": node.id, "label": next(iter(node.labels)), "title": node["Proteinid"], "group": compute_group(node["Proteinid"], data), "start": node["sequence"][0:10], "end": node["sequence"][-10:], "organism": node["organism"], "interpro": node["interPro"], "ec": node["EC_number"]})    
    for rel in graph.relationships:
        if float(rel["jaccardID"]) != 0:
            relationships.append({"source": rel.start_node.id, "target": rel.end_node.id, "label": rel.type, "title": rel["jaccardID"], "value": rel["jaccardID"]})
    
    
    stats = neo4j.fetch_stats(protein_id, search_type)
    stats["degree_1"] = 0
    stats["degree_2"] = 0
    for node in nodes:
        if node["group"] == 2:
            stats["degree_1"] += 1
        elif node["group"] == 3:
            stats["degree_2"] += 1
    neo4j.close()
    
    
    data = {"stats": stats, "nodes": nodes, "edges": relationships}
    return jsonify(data)

class Neo4j:
    def __init__(self, uri, user, password):
        self._driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self._driver.close()

    def fetch_data(self, protein_id, min_weight, max_weight, max_neighbor_depth, number_of_nodes, search_type):
        query = generate_query(protein_id, min_weight, max_weight, max_neighbor_depth, number_of_nodes, search_type)
        with self._driver.session() as session:
            result = session.run(query)
            if max_neighbor_depth == "0":
                return result.graph()
            # there is multiple searched protein in the graph and we want all of them
            return result.graph(), result.data("r")
    
    def fetch_stats(self, searched_protein_id, search_type):
        stats={}
        # Highest relationship weight of the searched protein and the protein with the highest weight
        query = "MATCH (p:Protein)-[r:similarity]->(q:Protein)" 
        if search_type == "organism":
            query += f" WHERE p.organism CONTAINS '{searched_protein_id}'"
        elif search_type == "proteinsequence":
            query += f" WHERE p.sequence CONTAINS '{searched_protein_id}'"
        elif search_type == "proteinentry":
            query += f" WHERE p.Proteinid CONTAINS '{searched_protein_id}'"
        query += " RETURN q.Proteinid, r.jaccardID ORDER BY r.jaccardID DESC LIMIT 1"
        stats["max_weight"] = self._driver.session().run(query).single()
        return stats
        
        
def compute_group(nodeID, data):
    for relationship in data:
        if relationship["r"][0]["Proteinid"] == nodeID:
            return 1
        elif relationship["r"][2]["Proteinid"] == nodeID:
            return 2
    return 3
    
def generate_query(protein_id, min_weight, max_weight, max_neighbor_depth, number_of_nodes, search_type):
    
    if max_neighbor_depth == "0":
        return f"MATCH (p:Protein) WHERE p.Proteinid='{protein_id}' RETURN p"
    query = "MATCH p=(p1:Protein)-[r:similarity]->(p2:Protein)"
    for i in range(1, int(max_neighbor_depth)):
        query += f"-[r{i}:similarity]->(p{i+2}:Protein)"
    if search_type == "organism":
        query += f" WHERE p1.organism CONTAINS '{protein_id}'"
    elif search_type == "proteinsequence":
        query += f" WHERE p1.sequence CONTAINS '{protein_id}'"
    elif search_type == "proteinentry":
        query += f" WHERE p1.Proteinid CONTAINS '{protein_id}'"
    query += f" AND r.jaccardID >= {min_weight}"
    query += f" AND r.jaccardID <= {max_weight}"
    for i in range(1, int(max_neighbor_depth)):
        query += f" AND r{i}.jaccardID >= {min_weight}"
        query += f" AND r{i}.jaccardID <= {max_weight}"
    query += " AND p1.Proteinid <> p2.Proteinid"
    for i in range(1, int(max_neighbor_depth)):
        query += f" AND p{i+1}.Proteinid <> p{i+2}.Proteinid"
    query += " RETURN p, r"
    for i in range(1, int(max_neighbor_depth)):
        query += f", r{i}"
    query += " ORDER BY r.jaccardID DESC"
    for i in range(1, int(max_neighbor_depth)):
        query += f", r{i}.jaccardID DESC"   
    query += f" LIMIT {number_of_nodes}"
        
    return query