document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    var displayname;
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

    function displayall() {        
        displayname = localStorage.getItem('displayname');
        document.querySelector("#displaynamediv").innerHTML = `welcome, ${displayname}`;
        socket.emit('get channels');

    }
       
    document.addEventListener('click', event => {
        const element = event.target;
        if (element.className === 'toselect') {
            //alert('hoi');
            //const channel = post_template({'contents': "hoihoih"});

            // Add post to DOM.
            //document.querySelector('#channeldiv').innerHTML += channel;

            document.querySelector("#chatareadiv").innerHTML = element.innerHTML;

            //element.parentElement.style.animationPlayState = 'running';
            //element.parentElement.addEventListener('animationend', () =>  {
            //    element.parentElement.remove();
            //});
        }
    });

    const post_template = Handlebars.compile(document.querySelector('#channel').innerHTML);
    function add_channel(contents) {    
        const channel = post_template({'contents': contents});
        // Add post to DOM.
        document.querySelector('#channeldiv').innerHTML += channel;
    }
    
    
    // When connected, configure buttons
    socket.on('connect', () => {       

        // When text is sent to server
        //document.querySelector('#sendtext').onclick = () => {            
        //    const chattext = document.querySelector('#chattextbox').value;
        //    const username = localStorage.getItem('username')

        //    socket.emit('submit text', {'chattext': chattext, 'username': username});        
        //};
    });

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
        document.querySelector("#displaynamediv").innerHTML = "displayname taken, enter display name: <input type=\"text\" id=\"displayname\"><button id=\"setdisplayname\">Submit</button>";        
        document.querySelector("#setdisplayname").onclick = () => {                                   
            displayname = document.querySelector('#displayname').value;                        
            socket.emit('create displayname', {'displayname': displayname});
        };
    });

    socket.on('return channels', data => { 
        document.querySelector("#channeldiv").innerHTML = '';       
        data.forEach(add_channel);         
    });

    socket.on('announce vote', data => {
              
    });
});
