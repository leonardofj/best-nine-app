from flask import Flask, render_template
from lib.insta_api import get_most_liked


app = Flask(__name__)


@app.route("/")
def home():
    return render_template("home.html")


@app.route("/<username>")
def result(username=None):
    # leojesuz
    posts = get_most_liked(username, 2022)
    # print("posts", posts)
    return render_template("result.html", posts=posts)
