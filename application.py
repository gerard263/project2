import os

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

displaynames = []
texts = []
channels = {"thechannel": {},"bestechannel": {}}

@app.route("/", methods=["GET", "POST"])
def index():
    #if request.method == "POST": 
    #    displayname = request.form.get("displayname")
    #    if displayname is None:
    #        return render_template("error.html", message="please provide a display name")
    #    if username == "":
    #        return render_template("error.html", message="please provide a display name")
    #    return render_template("login.html")
    return render_template("index.html")


@socketio.on("submit text")
def submittext(data):
    chattext = data["chattext"]
    #displayname = data["displayname"]
    emit("vote totals", chattext, broadcast=True)


@socketio.on("create displayname")
def createdisplayname(data):
    #return "hello, displayname"
    displayname = data["displayname"]
    print(displayname)
    #return render_template("index.html")
    #displayname = data["displayname"]
    if displayname in displaynames:
        emit("displayname taken", displayname)
    else:
        displaynames.append(displayname)
        emit("displayname added", displayname)


@socketio.on("get channels")
def getchannels():
    print("return channels", list(channels.keys()))
    emit("return channels", list(channels.keys()))
