from flask import Blueprint,session,redirect,request,flash
from flask.templating import render_template
from neo4j import GraphDatabase
import pandas as pd
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

from tensorflow.keras.models import load_model

# Definition of the blueprint
annotateBP = Blueprint('annotateBP', __name__)

# Definition of the annotate route
@annotateBP.route("/annotation", methods=["POST", "GET"])
def home():
    stats = []
    if request.method == "POST":
        proteinid = request.form["annotation"]
        if proteinid == "":
            flash("Please enter a valid protein ID", "Red_flash")
            return render_template("home.html")
        threshold = request.form["threshold"]
        if threshold == "":
            threshold = 0
        data = file_loader("protein.tsv")
        sequence = ""
        for line in data:
            if line[0] == proteinid:
                sequence = line[5]
                break
        if sequence == "":
            flash("Please enter a valid protein ID", "Red_flash")
            return render_template("home.html")
        
        stats = model_stats(sequence, threshold)
        ec_numbers = get_ec_numbers(proteinid)
        for ec_number in list(ec_numbers):
            if ec_numbers[ec_number] < float(threshold):
                del ec_numbers[ec_number]
                
        print(ec_numbers)
        
        return render_template("annotate.html", stats=stats,proteinid=proteinid, ec_numbers=ec_numbers)
    else:
        return render_template("annotate.html", stats=stats,proteinid="")
        
        

class Neo4j:
    def __init__(self, uri, user, password):
        self._driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self._driver.close()

    def get_closest_protein(self, protein_id, nbr_proteins):
        query = f"MATCH (p:Protein)-[r:similarity]->(q:Protein) WHERE p.Proteinid = '{protein_id}' RETURN q.Proteinid, r.jaccardID ORDER BY r.jaccardID DESC LIMIT {nbr_proteins}"
        with self._driver.session() as session:
            result = session.run(query)
            return result.data()
        
def get_ec_numbers(protein_id):
    
    uri = "mongodb+srv://remibourdais:d2pt90JS6L9VRODO@clustertest.fu6wceb.mongodb.net/?retryWrites=true&w=majority"
    client = MongoClient(uri, server_api=ServerApi('1'))
    
    neo4j = Neo4j("bolt://localhost:7687", "neo4j", "remiremiremi2001")
    data = neo4j.get_closest_protein(protein_id, 20)
    neo4j.close()
    
    number_of_neighbors = len(data)
    probability_ec_numbers = {}
    for neighbor in data:
        neighbor_id = neighbor["q.Proteinid"]
        neighbor_jaccard = neighbor["r.jaccardID"]
        neighbor_ec_numbers = client["ClusterTest"]["protein"].find({"Entry": neighbor_id}, {"EC number": 1, "_id": 0})[0]["EC number"]
        for ec_number in neighbor_ec_numbers.split(";"):
            ec_number = ec_number.strip()
            if ec_number not in probability_ec_numbers:
                probability_ec_numbers[ec_number] = 0
            probability_ec_numbers[ec_number] += neighbor_jaccard / number_of_neighbors
    for ec_number in probability_ec_numbers:
        probability_ec_numbers[ec_number] = round(probability_ec_numbers[ec_number], 2)
        if probability_ec_numbers[ec_number] > 1:
            probability_ec_numbers[ec_number] = 1
    
    client.close()

    return probability_ec_numbers

def file_loader(file):
    data = []
    with open(file, "r") as f:
        for line in f:
            data.append(line.strip().split("\t"))
    return data

def model_stats(sequence, threshold):
    # each model in models/ takes as input ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'O','P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z','Sequence_length'] 
    dico = {}
    for lettre in "ABCDEFGHIKLMNOPQRSTUVWXYZ":
        dico[lettre] = sequence.count(lettre)
    dico["Sequence_length"] = len(sequence)
    
    sequence_stats = []
    for i in dico:
        sequence_stats.append(dico[i])
    # Load the keras models
    models = []
    list = ["31","211","711","2776","27111"]
    
    for i in list:
        models.append(load_model("models/model_"+i+".h5"))
        
    # Predict the probability of each model
    probabilities = []

    for model in models:
        probabilities.append(model.predict([sequence_stats]))
        
    # Get the predictions
    new_dico = {}
    new_list = ["3.1.-.-","2.1.1.-","7.1.1.-","2.7.7.6","2.7.11.1"]
    for i in range(len(probabilities)):
        if probabilities[i][0][0] > float(threshold):
           new_dico[new_list[i]] = round(probabilities[i][0][0]*100,2)
    return new_dico