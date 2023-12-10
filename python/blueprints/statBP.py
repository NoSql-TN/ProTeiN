from flask import Blueprint,session,redirect, jsonify
from flask.templating import render_template
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
    res = jsonify(res[0])
    #print(res)
    #return in the json format the result of the query
    return res

@statBP.route("/interprofreq")
def get_interprofreq():
    res = use_neo4j(list_of_queries[6])
    res = jsonify(res[0])
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
    list=[]
    mergeddict={}
    mergeddict.update(res[0][0])
    mergeddict.update(res1[0][0])
    mergeddict.update(res2[0][0])
    mergeddict.update(res3[0][0])
    mergeddict.update(res4[0][0])
    mergeddict.update(res5[0][0])
    mergeddict.update(res6[0][0])
    mergeddict.update(res7[0][0])
    mergeddict.update(res8[0][0])
    mergeddict.update(res9[0][0])
    print(mergeddict)
    list.append(mergeddict)
    res = jsonify(list)
    print("trongol")
    print(res)
    #return in the json format the result of the query
    return res