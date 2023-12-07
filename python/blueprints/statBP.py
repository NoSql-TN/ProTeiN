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
    print(res)
    #return in the json format the result of the query
    return res
