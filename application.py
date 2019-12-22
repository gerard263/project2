import os

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

displaynames = []
texts = []
channels = {"thechannel": ["hoi hoi hoi, dit is thechannel", "tweede bericht thechannel"],"bestechannel": ["maar dit is de beste", "en het beste tweede bericht"]}

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
def getchannels(data):
    returnchannels = {}
    returnchannels["channellist"] = list(channels.keys())
    if data["currentchannel"]:
        returnchannels["channeltexts"] = channels[data["currentchannel"]]    
        returnchannels["currentchannel"] = data["currentchannel"]    
    print("getchannels: return channels", returnchannels)
    emit("return channels", returnchannels)
    #emit("return channels", {"channellist": list(channels.keys()), "channeltexts": channels[currentchannel]})


@socketio.on("join channel")
def joinchannel(data):
    print(channels[data["channelname"]])
    emit("channel joined", channels[data["channelname"]])


@socketio.on("create channel")
def createchannel(data):
    if not data["newchannelname"] in channels:
        channels[data["newchannelname"]] = []
        print("new channel name added. channels = ",channels)
        emit("channel created", data["newchannelname"], broadcast=True)
    else:
        emit("send error", "cannot create channel that already exists")
