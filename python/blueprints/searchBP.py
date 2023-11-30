from flask import Blueprint,session,redirect
from flask.templating import render_template

# Definition of the blueprint
searchBP = Blueprint('searchBP', __name__)

# Definition of the search route
@searchBP.route("/search")
def home():
    return render_template("home.html")
