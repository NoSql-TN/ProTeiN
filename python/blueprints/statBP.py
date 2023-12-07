from flask import Blueprint,session,redirect
from flask.templating import render_template
from neo4j import GraphDatabase
import numpy as np
import matplotlib.pyplot as plt
from io import BytesIO
from PIL import Image

# Definition of the blueprint
statBP = Blueprint('statBP', __name__)

# Definition of the search route
@statBP.route("/stat")
def stat():
    return render_template("stat.html")

