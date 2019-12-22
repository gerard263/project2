document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    var displayname;
    

    // When connected, configure buttons
    socket.on('connect', () => {       
        if (localStorage.getItem("displayname") === null) {
            //var bdisplayname = false
            document.querySelector("#displaynamediv").innerHTML = "enter display name: <input type=\"text\" id=\"displayname\"><button id=\"setdisplayname\">Submit</button>";
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
        });
    });

    // if user is logged on, display page
    function displayall() {        
        displayname = localStorage.getItem('displayname');
        document.querySelector("#displaynamediv").innerHTML = `welcome, ${displayname}`;                  
        socket.emit('get channels', {'currentchannel': localStorage.getItem("currentchannel")});
    }           


    function displaychat(data) {
        document.querySelector("#currentchanneldiv").innerHTML = "current channel is: " + localStorage.getItem("currentchannel");                
        document.querySelectorAll(".chat").forEach (chat => chat.remove());
        data.forEach(add_chat);         
        document.querySelector('#posttextdiv').innerHTML = `<form action="" method="POST">
                <input type="text" name="chattext">
                <input type="submit">
                </form>`;
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
        document.querySelector("#displaynamediv").innerHTML = `displayname ${data} already taken, enter display name: <input type="text" id="displayname"><button id="setdisplayname">Submit</button>`;        
        document.querySelector("#setdisplayname").onclick = () => {                                   
            displayname = document.querySelector('#displayname').value;                        
            socket.emit('create displayname', {'displayname': displayname});
        };
    });

    socket.on('return channels', data => { 
        document.querySelector("#channeldiv").innerHTML = 'channels:';       
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
        document.querySelector("#addchanneldiv").innerHTML = `<p><input type="text" id="addchanneltxt"><button id="addchannelbtn">Add channel</button> </p>`;
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

    socket.on('send error', data => {
        alert(data); 
    });    
});