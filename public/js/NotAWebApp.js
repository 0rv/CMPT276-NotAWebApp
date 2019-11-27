
//Add new user
function signupUser() {
    document.getElementById('signup-form').action = '/signup';
    document.getElementById('signup-form').submit();
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

$(function(){
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
    socket.on('cat_message', function(msg) {
        console.log(msg);
        $('#messages').append($('<li>').html(msg));
    });
    //append text if someone is online
    socket.on('is_online', function(username) {
        $('#messages').append($('<li>').html(username));
    });
    //ask username -- for now allowing user to choose a nickname instead of using their userid
    var username = prompt('Please choose a nickname');
    socket.emit('username', username);

    //number of users online
    socket.on('counter', function(data) {
        $("#counter").text(data.count);
    });
});

//------ Count Down and Score -------
//global var
var initialTime = 60 * 1; //10 mins
var finishGame = false;

window.onload = function () {
    var timer = document.getElementById("count_down");
    
    var count = setInterval(function() {
        initialTime--;
        
        var m = Math.floor(initialTime/60);
        var s = Math.floor(initialTime%60);
        var min = m.toString();
        var sec = s.toString();
        if (m < 10) { min = "0" + min; }
        if (s < 10) { sec = "0" + sec; }
        timer.innerHTML = min + "m " + sec + "s";
        
        if (initialTime == 0) {
            clearInterval(count);
            timer.innerHTML = "Game Over";
            finishGame = true;
        }
        else if (finishGame == true) {
            clearInterval(count);
        }
    }, 1000);
}

function calculateScore() {
    var ans1 = document.getElementById("country_op");
    var ans2 = document.getElementById("area_op");
    var res = document.getElementById("score");
    var comment = document.getElementById("comment");
    
    var correct_ans1 = "canada";
    var correct_ans2 = "bc";
    
    if (initialTime > 0) {
        if (finishGame == false) {
            if ( (ans1.value == correct_ans1) && (ans2.value == correct_ans2) ) {
                res.innerHTML =  initialTime * 5;
                comment.innerHTML = "You got it!";
                finishGame = true;
            }
            else {
                comment.innerHTML = "oops, that's not the correct answer. try again!";
            }   
        }
    }
    else {
        res.innerHTML = "0";
    }
}