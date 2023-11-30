from flask import Blueprint,session,redirect
from flask.templating import render_template

# Definition of the blueprint
annotateBP = Blueprint('annotateBP', __name__)

# Definition of the annotate route
@annotateBP.route("/annotate")
def home():
    return render_template("home.html")
