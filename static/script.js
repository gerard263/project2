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
            displayall.call();
        }

        document.addEventListener('click', event => {
            const element = event.target;
            if (element.className === 'toselect') {            
                document.querySelector("#chatareadiv").innerHTML = "you joined the channel: " + element.innerHTML;
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

    // When a new vote is announced, add to the unordered list
    socket.on('new messages', data => {
        document.querySelector('#yes').innerHTML = data.yes;
        document.querySelector('#no').innerHTML = data.no;
        document.querySelector('#maybe').innerHTML = data.maybe;
    });

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
        document.querySelector("#channeldiv").innerHTML = '';       
        data.channellist.forEach(add_channel);         
        if ("currentchannel" in data) {
            //alert(`currentchannel in data`);
            data.channeltexts.forEach(add_chat); 
            //document.querySelector("#channeldiv").innerHTML = '';
            
        }        
        else {
            //alert(`currentchannel not in data`);
        }
        document.querySelector("#channeldiv").innerHTML += `<p><input type="text" id="addchanneltxt"><button id="addchannelbtn">Add channel</button> </p>`;
        document.querySelector("#addchannelbtn").onclick = () => {                                   
            newchannelname = document.querySelector('#addchanneltxt').value;                        
            socket.emit('create channel', {'newchannelname': newchannelname});
        };
    });

    socket.on('channel joined', data => {
        data.forEach(add_chat); 
    });

    socket.on('channel created', data => {
        add_chat(data); 
    });

    socket.on('send error', data => {
        alert(data); 
    });    
});