from flask import Blueprint,session,redirect
from flask.templating import render_template

# Definition of the blueprint
mainBP = Blueprint('mainBP', __name__)

# Definition of the main route
@mainBP.route("/")
@mainBP.route("/home")
def home():
    return render_template("home.html")
