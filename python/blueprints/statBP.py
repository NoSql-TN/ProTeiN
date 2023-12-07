from flask import Blueprint,session,redirect
from flask.templating import render_template
from neo4j import GraphDatabase
import matplotlib.pyplot as plt
from io import BytesIO
from PIL import Image

# Definition of the blueprint
statBP = Blueprint('statBP', __name__)

# Definition of the search route
@statBP.route("/stat")
def stat():
    return render_template("stat.html")


class Neo4jStatistics:
    def __init__(self, uri, user, password):
        self._driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self._driver.close()

    def fetch_data(self, query):
        query = query
        with self._driver.session() as session:
            result = session.run(query)
            return result.data() , result.graph()


#use neo4j with the request 'query' and return the result
def use_neo4j(query):
    neo4j = Neo4jStatistics('bolt://localhost:7687', 'neo4j', 'remiremiremi2001')
    data, graph = neo4j.fetch_data(query)
    print(data)
    print(graph)
    neo4j.close()
    return data, graph

# #List of the queries
# list_of_queries = ["MATCH ()-[r:similarity]->() RETURN COUNT(r) AS nombreTotalRelations;", 
#                    "MATCH ()-[r:similarity]->()RETURN AVG(r.jaccardID) AS moyennePoidsTotale",
#                    "MATCH (p:Protein)-[r:similarity]->() RETURN p.Proteinid, COUNT(r) AS nombreRelations ORDER BY nombreRelations DESC LIMIT 10;",
#                    "MATCH ()-[r:similarity]->() WITH r.jaccardID AS jaccardID WITH CASE WHEN jaccardID >= 0 AND jaccardID < 0.2 THEN '0-0.2' WHEN jaccardID >= 0.2 AND jaccardID < 0.4 THEN '0.2-0.4' WHEN jaccardID >= 0.4 AND jaccardID < 0.6 THEN '0.4-0.6' WHEN jaccardID >= 0.6 AND jaccardID < 0.8 THEN '0.6-0.8' WHEN jaccardID >= 0.8 AND jaccardID <= 1 THEN '0.8-1.0' ELSE 'Out of range' END AS jaccardRange RETURN jaccardRange, COUNT(*) AS count ORDER BY jaccardRange;",
#                    "MATCH (p:Protein)-[r:similarity]->(q:Protein) WITH p, AVG(r.jaccardID) AS avgJaccard RETURN CASE WHEN avgJaccard >= 0 AND avgJaccard < 0.1 THEN '0 - 0.1' WHEN avgJaccard >= 0.1 AND avgJaccard < 0.2 THEN '0.1 - 0.2' WHEN avgJaccard >= 0.2 AND avgJaccard < 0.3 THEN '0.2 - 0.3' WHEN avgJaccard >= 0.3 AND avgJaccard < 0.4 THEN '0.3 - 0.4' WHEN avgJaccard >= 0.4 AND avgJaccard < 0.5 THEN '0.4 - 0.5' WHEN avgJaccard >= 0.5 AND avgJaccard < 0.6 THEN '0.5 - 0.6' WHEN avgJaccard >= 0.6 AND avgJaccard < 0.7 THEN '0.6 - 0.7' WHEN avgJaccard >= 0.7 AND avgJaccard < 0.8 THEN '0.7 - 0.8' WHEN avgJaccard >= 0.8 AND avgJaccard < 0.9 THEN '0.8 - 0.9' WHEN avgJaccard >= 0.9 AND avgJaccard <= 1.0 THEN '0.9 - 1.0' ELSE 'Other' END AS jaccardRange, COUNT(p) AS nodeCount ORDER BY jaccardRange;",
#                    "MATCH (p:Protein) RETURN size(p.interPro) AS numberOfInterPro, COUNT(p) AS numberOfProteins ORDER BY numberOfInterPro; ",
#                    "MATCH (p:Protein) WHERE p.interPro IS NOT NULL AND SIZE(p.interPro) > 0 UNWIND p.interPro AS interProElement WITH interProElement, COUNT(*) AS frequency RETURN interProElement, frequency ORDER BY frequency DESC LIMIT 10;",
#                    "MATCH (p:Protein) WHERE p.EC_number IS NOT NULL WITH p.EC_number AS ecNumber, COUNT(*) AS frequency RETURN ecNumber, frequency ORDER BY frequency DESC LIMIT 10;",
#                    "MATCH (p:Protein)-[r:similarity]-(q:Protein) WHERE p.organism IS NOT NULL AND q.organism IS NOT NULL WITH p.organism AS organism, AVG(r.jaccardID) AS avgSimilarity RETURN organism, avgSimilarity ORDER BY avgSimilarity DESC LIMIT 10;",
#                    "MATCH (p:Protein) WHERE p.organism = 'Homo sapiens (Human)' AND p.interPro IS NOT NULL AND SIZE(p.interPro) > 0 UNWIND p.interPro AS interProElement WITH p.organism AS organism, interProElement, COUNT(*) AS frequency RETURN organism, interProElement, frequency ORDER BY organism, frequency DESC LIMIT 1;",
#                    "MATCH (p:Protein) WHERE p.organism = 'Homo sapiens (Human)' AND p.EC_number IS NOT NULL WITH p.EC_number AS ecNumber, COUNT(*) AS frequency RETURN ecNumber, frequency ORDER BY frequency DESC LIMIT 1;"]
# #List of the names of the queries
# #list_of_names = ["nombreTotalRelations", "moyennePoidsTotale", "nombreRelationsmax10", "nombreRelationsJaccard", "nombreNodesJaccard", "nombreProteinsInterPro"]

# result0 = use_neo4j(list_of_queries[0])
# result1 = use_neo4j(list_of_queries[1])
# result2 = use_neo4j(list_of_queries[2])
# result3 = use_neo4j(list_of_queries[3])
# result4 = use_neo4j(list_of_queries[4])
# result5 = use_neo4j(list_of_queries[5])
# result6 = use_neo4j(list_of_queries[6])
# result7 = use_neo4j(list_of_queries[7])
# result8 = use_neo4j(list_of_queries[8])
# result9 = use_neo4j(list_of_queries[9])
# result10 = use_neo4j(list_of_queries[10])



# #collect the result of the query 0
# def collect_result0(result):
#     result0 = []
#     for i in range(len(result[0])):
#         result0.append(result[0][i]["nombreTotalRelations"])
#     return result0

# result0 = collect_result0(result0)
# print(result0)


# #collect the result of the query 1
# def collect_result1(result):
#     result1 = []
#     for i in range(len(result[0])):
#         result1.append(result[0][i]["moyennePoidsTotale"])
#     return result1

# result1 = collect_result1(result1)
# print(result1)


# #plot the graph of the query 2
# def plot_graph2(result):
#     x = []
#     y = []
#     for i in range(len(result[0])):
#         x.append(result[0][i]["p.Proteinid"])
#         y.append(result[0][i]["nombreRelations"])
#     plt.bar(x, y, color='skyblue')
#     plt.xlabel("Protein ID")
#     plt.ylabel("Number of relations")
#     plt.title("Number of relations for each protein ID")
#     plt.xticks(rotation=45, ha="right")
#     #increase a bit the size of the space below the bars for the labels
#     plt.subplots_adjust(bottom=0.2)
#     plt.savefig("static/images/result2.png")
#     plt.close()

# plot_graph2(result2)


# #plot the disk representation of the query 3
# def plot_graph3(result):
#     x = []
#     y = []
#     for i in range(len(result[0])):
#         x.append(result[0][i]["jaccardRange"])
#         y.append(result[0][i]["count"])
#     plt.pie(y, labels = x, autopct='%1.1f%%')
#     plt.title("Number of relations for each jaccard range")
#     plt.savefig("static/images/result3.png")
#     plt.close()

# plot_graph3(result3)

# #plot the disk representation of the query 4
# def plot_graph4(result):
#     x = []
#     y = []
#     for i in range(len(result[0])):
#         x.append(result[0][i]["jaccardRange"])
#         y.append(result[0][i]["nodeCount"])
#     plt.pie(y, labels = x, autopct='%1.1f%%')
#     plt.title("Number of nodes for each average jaccard range")
#     plt.savefig("static/images/result4.png")
#     plt.close()

# plot_graph4(result4)

# #plot the graph of the query 5
# def plot_graph5(result):
#     x = []
#     y = []
#     for i in range(len(result[0])):
#         x.append(result[0][i]["numberOfInterPro"])
#         y.append(result[0][i]["numberOfProteins"])
#     #transform the element of x into string
#     for i in range(len(x)):
#         x[i] = str(x[i])
#     plt.bar(x, y, color='skyblue')
#     plt.xlabel("Number of interPro")
#     plt.ylabel("Number of proteins")
#     plt.title("Number of proteins for each number of interPro")
#     # Rotate x-axis labels for better readability
#     plt.xticks(rotation=45, ha="right")
#     plt.subplots_adjust(bottom=0.2)
#     plt.savefig("static/images/result5.png")
#     plt.close()

# plot_graph5(result5)



# #plot the graph of the query 6
# def plot_graph6(result):
#     x = [item["interProElement"] for item in result[0]]
#     y = [item["frequency"] for item in result[0]]

#     plt.bar(x, y, color='skyblue')  # You can choose different colors
#     plt.xlabel("interPro")
#     plt.ylabel("Frequency")
#     plt.title("Frequency of each interPro")
#     plt.xticks(rotation=45, ha="right")  # Adjust rotation and alignment for better readability
#     plt.tight_layout()  # Adjust layout for better spacing
#     plt.savefig("static/images/result6.png")
#     plt.close()

# plot_graph6(result6)

# #plot the graph of the query 7
# def plot_graph7(result):
#     x = [item["ecNumber"] for item in result[0]]
#     y = [item["frequency"] for item in result[0]]

#     plt.bar(x, y, color='skyblue')  # You can choose different colors
#     plt.xlabel("EC number")
#     plt.ylabel("Frequency")
#     plt.title("10 most frequent EC_number")
#     plt.xticks(rotation=45, ha="right")  # Adjust rotation and alignment for better readability
#     plt.tight_layout()  # Adjust layout for better spacing
#     plt.savefig("static/images/result7.png")
#     plt.close()

# plot_graph7(result7)

# #plot the graph of the query 8
# def plot_graph8(result):
#     x = [item["organism"] for item in result[0]]
#     y = [item["avgSimilarity"] for item in result[0]]

#     plt.bar(x, y, color='skyblue')  # You can choose different colors
#     plt.xlabel("Organism")
#     plt.ylabel("Average similarity")
#     plt.title("10 organisms with the highest similarity score")
#     plt.xticks(rotation=45, ha="right")  # Adjust rotation and alignment for better readability
#     plt.tight_layout()  # Adjust layout for better spacing
#     plt.savefig("static/images/result8.png")
#     plt.close()

# plot_graph8(result8)

# #collect the result of the query 9
# def collect_result9(result):
#     result9 = []
#     for i in range(len(result[0])):
#         result9.append(result[0][i]["organism"])
#         result9.append(result[0][i]["interProElement"])
#         result9.append(result[0][i]["frequency"])
#     return result9

# result9 = collect_result9(result9)
# print(result9)

# #collect the result of the query 10
# def collect_result10(result):
#     result10 = []
#     for i in range(len(result[0])):
#         result10.append(result[0][i]["ecNumber"])
#         result10.append(result[0][i]["frequency"])
#     return result10

# result10 = collect_result10(result10)
# print(result10)
# resulttot = result9 + result10
# print(resulttot)

# #C'est cette idée mais il faut trouver les graphes adaptés et les graphes à faire.