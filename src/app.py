from flask import Flask, render_template, request
from lib.insta_api import get_collage, get_most_liked


app = Flask(__name__)


@app.route("/")
def home():
    return render_template("home.html")


@app.route("/most-liked", methods=["GET"])
def most_liked():
    username = request.args.get("username", "leojesuz")
    year = request.args.get("year", 2022)
    posts = get_most_liked(username, int(year))
    # print("posts", posts)
    return render_template("most_liked.html", posts=posts)


@app.route("/collage", methods=["GET"])
def collage():
    username = request.args.get("username", "leojesuz")
    year = request.args.get("year", 2022)
    result = get_collage(username, int(year))
    # print("posts", posts)
    return render_template("collage.html", collage=result)
