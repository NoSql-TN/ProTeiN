from flask import Blueprint,session,redirect, jsonify
from flask.templating import render_template
import numpy as np
from scipy.stats import norm
from python.core.stats import *


# Definition of the blueprint
statBP = Blueprint('statBP', __name__)

# Definition of the search route
@statBP.route("/stat")
def stat():
    return render_template("stat.html")

@statBP.route("/relations")
def get_relations():
    res = use_neo4j(list_of_queries[2])
    res = jsonify(res[0])
    # print(res)
    #return in the json format the result of the query
    return res

@statBP.route("/jaccard")
def get_jaccard():
    res = use_neo4j(list_of_queries[3])
    res = jsonify(res[0])
    #print(res)
    #return in the json format the result of the query
    return res

@statBP.route("/jaccardavg")
def get_jaccardavg():
    res = use_neo4j(list_of_queries[4])
    res = jsonify(res[0])
    #print(res)
    #return in the json format the result of the query
    return res

@statBP.route("/interpro")
def get_interpro():
    res = use_neo4j(list_of_queries[5])
    data = {}
    values = []
    max_interpro, min_interpro = 0, 10000000000000
    for i in range(len(res[0])):
        if res[0][i]['numberOfProteins'] == "Null":
            continue
        data[res[0][i]['numberOfInterPro']] = res[0][i]['numberOfProteins']
        values.append(res[0][i]['numberOfInterPro'])
        if res[0][i]['numberOfInterPro'] > max_interpro:
            max_interpro = res[0][i]['numberOfInterPro']
        if res[0][i]['numberOfInterPro'] < min_interpro:
            min_interpro = res[0][i]['numberOfInterPro']
    hist = []
    print(list(data.keys()))
    print(max_interpro, min_interpro)
    for i in range(min_interpro, max_interpro+1):
        if i in data.keys():
            hist.append(data[i])
        else:
            hist.append(0)
    print(hist)
    # found the closest distribution that follows the same pattern
    mu, sigma = np.mean(hist), np.std(hist)
    print(mu, sigma)
    x = np.linspace(min_interpro, max_interpro, 100)
    theoretical_curve = norm.pdf(x, mu, sigma)
    # adapt the theoretical curve to the data
    theoretical_curve *= max(hist)/max(theoretical_curve)

    res = jsonify(res[0])
    
    # make a histogram of the data and save it to static/images
    fig, ax = plt.subplots()
    ax.bar(data.keys(), data.values())
    ax.plot(x, theoretical_curve, 'r', linewidth=2)
    ax.set_xlabel('Number of InterPro')
    ax.set_ylabel('Number of Proteins')
    ax.set_title('Histogram of the number of InterPro per protein')
    fig.savefig('static/images/interpro.png')
    
    return res

@statBP.route("/interprofreq")
def get_interprofreq():
    res = use_neo4j(list_of_queries[6])
    res = jsonify(res[0][1:])
    #print(res)
    #return in the json format the result of the query
    return res

@statBP.route("/ec")
def get_ec():
    res = use_neo4j(list_of_queries[7])
    res = jsonify(res[0])
    #print(res)
    #return in the json format the result of the query
    return res

@statBP.route("/human")
def get_human():
    res = use_neo4j(list_of_queries[9])
    res1 = use_neo4j(list_of_queries[10])
    res2 = use_neo4j(list_of_queries[11])
    res3 = use_neo4j(list_of_queries[12])
    res4 = use_neo4j(list_of_queries[13])
    res5 = use_neo4j(list_of_queries[14])
    res6 = use_neo4j(list_of_queries[15])
    res7 = use_neo4j(list_of_queries[16])
    res8 = use_neo4j(list_of_queries[17])
    res9 = use_neo4j(list_of_queries[18])
    list=[res[0][1],res1[0][0],res2[0][1],res3[0][0],res4[0][1],res5[0][0],res6[0][1],res7[0][0],res8[0][1],res9[0][0]]
    res = jsonify(list)
    print("trongol")
    print(res)
    #return in the json format the result of the query
    return res