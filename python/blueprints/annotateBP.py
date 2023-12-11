from flask import Blueprint,session,redirect,request,flash
from flask.templating import render_template

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
        
        return render_template("annotate.html", stats=stats,proteinid=proteinid)
    else:
        return render_template("annotate.html", stats=stats,proteinid="")
        
        

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