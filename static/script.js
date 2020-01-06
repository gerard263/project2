document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    var displayname;
    
    var x = document.getElementById("channeldiv");
    x.style.display = "none";

    // When connected, configure buttons
    socket.on('connect', () => {       
        if (localStorage.getItem("displayname") === null) {
            //var bdisplayname = false
            document.querySelector("#displaynamediv").innerHTML = "<h3>enter display name: <input type=\"text\" id=\"displayname\" placeholder=\"choose a display name\"><button id=\"setdisplayname\">Submit</button></h3>";
            document.querySelector("#setdisplayname").onclick = () => {                                   
                const displayname = document.querySelector('#displayname').value;            
                //alert(`hello, ${displayname}`);
                socket.emit('create displayname', {'displayname': displayname});
            }
        }
        else {        
            displayall();
        }

        document.addEventListener('click', event => {
            const element = event.target;
            if (element.className === 'toselect') {            
                localStorage.setItem('currentchannel', element.innerHTML); 
                socket.emit('join channel', {'channelname': element.innerHTML});            
            }
            if (element.className === 'submitchattext') {                
                const request = new XMLHttpRequest();
                request.open('POST', '/sendchatmessage');                               

                // Add start and end points to request data.
                const data = new FormData();
                data.append('displayname', localStorage.getItem('displayname'));
                data.append('currentchannel', localStorage.getItem("currentchannel"));                
                data.append('chattext', document.querySelector('#chattext').value);
                
                // Send request.
                request.send(data);
                document.querySelector('#chattext').value = '';
            }
            if (element.className === 'submitprivatetext') {                               
                socket.emit('send private', {'privatetext': document.querySelector('#privatetext').value, 
                'privatescreenname': document.querySelector('#privatescreenname').value, "displayname": localStorage.getItem('displayname')});   
                document.querySelector('#privatetext').value = '';
                document.querySelector('#privatescreenname').value = '';
            }
        });
    });

    // if user is logged on, display page
    function displayall() {
        var x = document.getElementById("channeldiv");
        x.style.display = "block";
        displayname = localStorage.getItem('displayname');
        document.querySelector("#displaynamediv").innerHTML = `<h3>welcome, ${displayname}</h3>`;                  
        socket.emit('get channels', {'currentchannel': localStorage.getItem("currentchannel")});
    }           


    function displaychat(data) {
        document.querySelector("#currentchanneldiv").innerHTML = "<h4>current channel is: " + localStorage.getItem("currentchannel") + "</h4>";                
        document.querySelectorAll(".chat").forEach (chat => chat.remove());
        data.forEach(add_chat);         
        document.querySelector('#posttextdiv').innerHTML = `<input type="text" id="chattext" placeholder="chat text..."><button class="submitchattext">send</button>`;
        document.querySelector('#privatemessagediv').innerHTML = `<input type="text" id="privatetext" placeholder="private chat text..."><input type="text" id="privatescreenname" placeholder="to screenname"><button class="submitprivatetext">send private message</button>`;        
    }                                                      

    const post_template = Handlebars.compile(document.querySelector('#channel').innerHTML);
    function add_channel(contents) {    
        const channel = post_template({'contents': contents});
        // Add post to DOM.
        document.querySelector('#channeldiv').innerHTML += channel;        
    }
    
    const p_template = Handlebars.compile(document.querySelector('#chat').innerHTML);
    function add_chat(contents) {    
        const chat = p_template({'contents': contents});
        // Add post to DOM.
        // alert(`hello, ${displayname}`);
        document.querySelector('#chatareadiv').innerHTML += chat;        
    }


    socket.on('displayname added', data => {        
        localStorage.setItem('displayname', data); 
        displayall.call();
    });

    socket.on('displayname taken', data => {
        document.querySelector("#displaynamediv").innerHTML = `<h3>displayname ${data} already taken, enter display name: <input type="text" id="displayname" placeholder="choose a display name"><button id="setdisplayname">Submit</button></h3>`;        
        document.querySelector("#setdisplayname").onclick = () => {                                   
            displayname = document.querySelector('#displayname').value;                        
            socket.emit('create displayname', {'displayname': displayname});
        };
    });

    socket.on('return channels', data => { 
        document.querySelector("#channeldiv").innerHTML = '<h3>channels:</h3>';       
        data.channellist.forEach(add_channel);         
        if ("currentchannel" in data) {
            displaychat(data.channeltexts)
            //alert(`currentchannel in data`);
            //data.channeltexts.forEach(add_chat); 
            //document.querySelector("#channeldiv").innerHTML = '';
            
        }        
        else {            
            //alert(`currentchannel not in data`);
        }
        document.querySelector("#addchanneldiv").innerHTML = `<p><input type="text" id="addchanneltxt" placeholder="new channel name"><button id="addchannelbtn">Add channel</button> </p>`;
        document.querySelector("#addchannelbtn").onclick = () => {                                   
            newchannelname = document.querySelector('#addchanneltxt').value;                        
            socket.emit('create channel', {'newchannelname': newchannelname});
        };
    });

    socket.on('channel joined', data => {
        displaychat(data)        
    });

    socket.on('channel created', data => {
        add_channel(data); 
    });

    socket.on('new chat message', data => { 
        if (data.channel === localStorage.getItem("currentchannel")) {
            add_chat(data.chatmessage); 
        }        
    });   

    socket.on('new private message', data => { 
        add_chat(data);                 
    });   
    
    socket.on('send error', data => {
        alert(data); 
    });    
});