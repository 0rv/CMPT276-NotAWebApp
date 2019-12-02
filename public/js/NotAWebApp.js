//Add new user
function signupUser() {
    document.getElementById('signup-form').action = '/signup';
    document.getElementById('signup-form').submit();    //how do i do this on enter again?
}

//Login user
function loginUser() {
  // attempt to establish input rules here rather than index.js
  // document.getElementById('msg').innerHTML

  // document.getElementById('loginForm')[0].value
  // document.getElementById('loginForm')[1].value
  if (document.getElementById('loginForm')[0].value == "" || document.getElementById('loginForm')[1].value == "") {
    document.getElementById('msg').innerHTML = "Please enter a username and password"
  }
  
  document.getElementById('login-form').action = '/login';
  document.getElementById('login-form').submit();
}

function useMaps() {
  // just a test that the google earth engine APi is in use
  //document.getElementById
  document.getElementById('mapSubmit').action = '/randMap';
  document.getElementById('mapSubmit').submit();
  
}

function toggleTheme() {
    document.getElementsByTagName("body")[0].classList.toggle("toggle");
    if (document.getElementById("fright").innerHTML == "Dark Mode"){
        document.getElementById("fright").innerHTML = "Light Mode";
    }
    else {
        document.getElementById("fright").innerHTML = "Dark Mode";
    }
}

function randColor(){
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}; 

$( document ).ready(function() {
    //chat
    //var socket = io.connect('http://localhost:5000');  //originally without /main --> does it make a difference?
    var socket = io();  //originally without /main --> does it make a difference?
    //submit text message without reload/refresh the page
    $('form').submit(function(e){
        e.preventDefault();
        socket.emit('chat_message', $('#txt').val());
        $('#txt').val('');
        return false;
    });
    //append the chat text message
    socket.on('chat_message', function(msg) {
        console.log(msg);
        $('#messages').append($('<li>').html(msg));
    });
    //append text if someone is online
    socket.on('is_online', function(username) {
        $('#messages').append($('<li>').html(username).attr("style", "color:"+randColor()));    //colourful logon/off -->makes it fun to see
    });
    //ask username -- for now allowing user to choose a nickname instead of using their userid
    var username = prompt('Please choose a nickname');
    socket.emit('username', username);

    //number of users online
    socket.on('counter', function(data) {
        $("#counter").text(data.count);
    });
});
