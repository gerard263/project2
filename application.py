import os
from datetime import datetime
from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

privatedict = {}
displaynames = []
texts = []
channels = {"dummy": ["hi, this is just a dummy channel"],"bestechannel": ["maar dit is de beste", "en het beste tweede bericht"]}

@app.route("/", methods=["GET", "POST"])
def index():
    return render_template("index.html")


@app.route("/sendchatmessage", methods=["POST"])
def sendchatmessage():
    displayname = request.form.get("displayname")
    currentchannel = request.form.get("currentchannel")
    chattext = request.form.get("chattext")
    chatmessage = datetime.now().strftime('%Y-%m-%d %H:%M:%S') + " " + displayname + ": " + chattext
    channels[currentchannel].append(chatmessage)
    if len(channels[currentchannel]) > 100:
        del channels[currentchannel][0]
    socketio.emit("new chat message", {"chatmessage": chatmessage, "channel": currentchannel}, broadcast=True)    
    return jsonify({"displayname": displayname})


@socketio.on("create displayname")
def createdisplayname(data):
    displayname = data["displayname"]
    if displayname in displaynames:
        emit("displayname taken", displayname)
    else:
        displaynames.append(displayname)
        emit("displayname added", displayname)
        privatedict[displayname] = request.sid


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


@socketio.on("send private")
def sendprivate(data):
    print("private message, data = ", data)
    if data["privatescreenname"] in privatedict:
        print(data["privatescreenname"], " exists in ", privatedict)
        emit("new private message", datetime.now().strftime('%Y-%m-%d %H:%M:%S') + "<you received a private message from " + data["displayname"] + ">: " + data["privatetext"], room=privatedict[data["privatescreenname"]])   
        emit("new private message", datetime.now().strftime('%Y-%m-%d %H:%M:%S') + "<you sent a private message to " + data["privatescreenname"] + ">: " + data["privatetext"])
    else:
        print("error name not found")
        emit("send error", "error, private message not sent. Cannot find user with screenname " + data["privatescreenname"])

    
    #emit("private message", channels[data["channelname"]])
