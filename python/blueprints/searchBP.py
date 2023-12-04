from flask import Blueprint,session,request,jsonify
from flask.templating import render_template
from neo4j import GraphDatabase

# Definition of the blueprint
searchBP = Blueprint('searchBP', __name__)

# Definition of the search route
@searchBP.route("/stat")
def stat():
    return render_template("stat.html")

# Definition of the search route
@searchBP.route("/search", methods=["POST", "GET"])
def search():
    if request.method == "POST":
        proteinid = request.form["proteinentry"]
        minweight = request.form["minweight"]
        maxweight = request.form["maxweight"]
        return render_template("search.html", proteinid=proteinid, minweight=minweight, maxweight=maxweight, maxNeighborDepth=2, numberOfNodes=200)
    elif request.method == "GET":
        args = request.args
        proteinid = args.get("proteinId")
        minweight = args.get("minWeight")
        maxweight = args.get("maxWeight")
        maxNeighborDepth = args.get("maxNeighborDepth")
        numberOfNodes = args.get("numberOfNodes")
        return render_template("search.html", proteinid=proteinid, minweight=minweight, maxweight=maxweight ,maxNeighborDepth=maxNeighborDepth, numberOfNodes=numberOfNodes)
    else:
        return render_template("search.html")


@searchBP.route('/api/fetchData/<protein_id>/<min_weight>/<max_weight>/<max_neighbor_depth>/<number_of_nodes>')
def fetch_data(protein_id, min_weight, max_weight, max_neighbor_depth, number_of_nodes):
    neo4j = Neo4j('bolt://localhost:7689', 'neo4j', 'remiremiremi2001')
    data, graph = neo4j.fetch_data(protein_id, min_weight, max_weight, max_neighbor_depth, number_of_nodes)
    
    nodes = []
    relationships = []
    count = 0
    # Get the id of the searched protein
    for node in graph.nodes:
        count += 1
        if node["Proteinid"] == protein_id:
            session['proteinid'] = node.id
    
    print(count)
    
    # Create the data to return
    for node in graph.nodes:
        nodes.append({"id": node.id, "label": next(iter(node.labels)), "title": node["Proteinid"], "group": compute_group(node.id, graph.relationships), "start": node["sequence"][0:10], "end": node["sequence"][-10:], "organism": node["organism"], "interpro": node["interPro"], "ec": node["EC_number"]})    
    for rel in graph.relationships:
        if float(rel["jaccardID"]) != 0:
            relationships.append({"source": rel.start_node.id, "target": rel.end_node.id, "label": rel.type, "title": rel["jaccardID"], "value": rel["jaccardID"]})
    
    
    stats = neo4j.fetch_stats(nodes)
    neo4j.close()
    
    
    data = {"stats": stats, "nodes": nodes, "edges": relationships}
    return jsonify(data)

class Neo4j:
    def __init__(self, uri, user, password):
        self._driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self._driver.close()

    def fetch_data(self, protein_id, min_weight, max_weight, max_neighbor_depth, number_of_nodes):
        query = generate_query(protein_id, min_weight, max_weight, max_neighbor_depth, number_of_nodes)
        with self._driver.session() as session:
            result = session.run(query)
            return result.data() , result.graph()
    
    def fetch_stats(self, nodes):
        stats={}
        query = f"MATCH (p:Protein) WHERE p.interPro IS NULL RETURN count(p)"
        with self._driver.session() as session:
            result = session.run(query)
            for record in result:
                stats["non_annotated_nodes_with_GO"] = record[0]
        query = f"MATCH (p:Protein) WHERE p.EC_number IS NULL RETURN count(p)"
        with self._driver.session() as session:
            result = session.run(query)
            for record in result:
                stats["non_annotated_nodes_with_EC"] = record[0]
        query = f"MATCH (p:Protein) WHERE p.EC_number IS NULL AND p.interPro IS NULL RETURN count(p)"
        with self._driver.session() as session:
            result = session.run(query)
            for record in result:
                stats["non_annotated_nodes_with_EC_and_GO"] = record[0]
        query = f"MATCH (p:Protein) WHERE p.EC_number IS NULL OR p.interPro IS NULL RETURN count(p)"
        with self._driver.session() as session:
            result = session.run(query)
            for record in result:
                stats["non_annotated_nodes_with_EC_or_GO"] = record[0]
        query = f"MATCH (p:Protein) WHERE NOT (p)-[:similarity]-() RETURN count(p)"
        with self._driver.session() as session:
            result = session.run(query)
            stats["isolated_nodes"] = result.single()[0]
        query = f"MATCH (p:Protein) RETURN count(p)"
        with self._driver.session() as session:
            result = session.run(query)
            stats["total_nodes"] = result.single()[0]
        return stats
        
        
def compute_group(nodeID, relations):
    def relationship_exists(nodeID, relations):
        for rel in relations:
            if rel.start_node.id == nodeID and rel.end_node.id == session['proteinid']:
                return True
            if rel.end_node.id == nodeID and rel.start_node.id == session['proteinid']:
                return True
        return False
    if session['proteinid'] == nodeID:
        return 1
    elif relationship_exists(nodeID, relations):
        return 2
    else:
        return 3
    
def generate_query(protein_id, min_weight, max_weight, max_neighbor_depth, number_of_nodes):
    
    if max_neighbor_depth == "0":
        return f"MATCH (p:Protein) WHERE p.Proteinid='{protein_id}' RETURN p"
    query = "MATCH p=(p1:Protein)-[r:similarity]->(p2:Protein)"
    for i in range(1, int(max_neighbor_depth)):
        query += f"-[r{i}:similarity]->(p{i+2}:Protein)"
    query += f" WHERE p1.Proteinid='{protein_id}'"
    query += f" AND r.jaccardID >= {min_weight}"
    query += f" AND r.jaccardID <= {max_weight}"
    for i in range(1, int(max_neighbor_depth)):
        query += f" AND r{i}.jaccardID >= {min_weight}"
        query += f" AND r{i}.jaccardID <= {max_weight}"
    query += " AND p1.Proteinid <> p2.Proteinid"
    for i in range(1, int(max_neighbor_depth)):
        query += f" AND p{i+1}.Proteinid <> p{i+2}.Proteinid"
    query += " RETURN p ORDER BY r.jaccardID DESC"
    for i in range(1, int(max_neighbor_depth)):
        query += f", r{i}.jaccardID DESC"   
    query += f" LIMIT {number_of_nodes}"
        
    return query