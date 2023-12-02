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
        return render_template("search.html", proteinid=proteinid, minweight=minweight)
    elif request.method == "GET":
        args = request.args
        proteinid = args.get("proteinId")
        minweight = args.get("minWeight")
        print(proteinid, minweight)
        return render_template("search.html", proteinid=proteinid, minweight=minweight)
    else:
        return render_template("search.html")


@searchBP.route('/api/fetchData/<protein_id>/<min_weight>', methods=['GET'])
def fetch_data(protein_id, min_weight):
    neo4j = Neo4j('bolt://localhost:7689', 'neo4j', 'remiremiremi2001')
    data, graph = neo4j.fetch_data(protein_id, min_weight)
    neo4j.close()
    
    nodes = []
    relationships = []
    
    # Get the id of the searched protein
    for node in graph.nodes:
        if node["Proteinid"] == protein_id:
            session['proteinid'] = node.id
    
    # Create the data to return
    for node in graph.nodes:
        nodes.append({"id": node.id, "label": next(iter(node.labels)), "title": node["Proteinid"], "group": compute_group(node.id, graph.relationships)})
    
    for rel in graph.relationships:
        relationships.append({"source": rel.start_node.id, "target": rel.end_node.id, "label": rel.type, "title": rel["jaccardID"], "value": rel["jaccardID"]})
    
    data = {"data": data, "nodes": nodes, "edges": relationships}
    
    return jsonify(data)

class Neo4j:
    def __init__(self, uri, user, password):
        self._driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self._driver.close()

    def fetch_data(self, protein_id, min_weight):
        query = f"MATCH p=(p1:Protein)-[r:similarity]->(p2:Protein)-[r2:similarity]->(p3:Protein) WHERE p1.Proteinid='{protein_id}' AND r.jaccardID >= {min_weight} AND r2.jaccardID >= {min_weight} AND p1.Proteinid <> p2.Proteinid AND p2.Proteinid <> p3.Proteinid AND p1.Proteinid <> p3.Proteinid RETURN p LIMIT 50"
        with self._driver.session() as session:
            result = session.run(query)
            return result.data() , result.graph()
        
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
    