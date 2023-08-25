from flask import Flask, render_template, request, abort
from lib.insta_api import get_collage, get_most_liked


app = Flask(__name__)


@app.errorhandler(404)
def page_not_found(error):
    return render_template("error.html", error=error.description), 404


@app.errorhandler(500)
def internal_error(error):
    return render_template("error.html", error=error.description), 500


@app.route("/")
def home():
    return render_template("home.html")


@app.route("/most-liked", methods=["GET"])
def most_liked():
    username = request.args.get("username", "leojesuz")
    year = request.args.get("year", 2022)
    try:
        posts = get_most_liked(username, int(year))
        return render_template(
            "most_liked.html", posts=posts, username=username, year=year
        )
    except Exception as e:
        abort(404, e)


@app.route("/collage", methods=["GET"])
def collage():
    username = request.args.get("username", "leojesuz")
    year = request.args.get("year", 2022)
    try:
        result = get_collage(username, int(year))
        return render_template(
            "collage.html", collage=result, username=username, year=year
        )
    except Exception as e:
        abort(404, e)
