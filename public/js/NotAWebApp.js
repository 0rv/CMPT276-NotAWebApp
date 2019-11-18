//Add new user
function signupUser() {
    //document.getElementById('signup-form').action = '/signup';
    //document.getElementById('signup-form').submit();
    alert("Eyo");
    console.log("idk");
}

//Login user
function loginUser() {
    document.getElementById('login-form').action = '/login';
    document.getElementById('login-form').submit();
}

// function logoutUser() {
//     document.getElementById('logout-form').action = '/logout';
//     document.getElementById('logout-form').submit();
// }

//chat
var socket = io.connect('http://localhost:5000/main');  //originally without /main --> does it make a difference?
//submit text message without reload/refresh the page
$('form').submit(function(e) {
    e.preventDefault();
    socket.emit('chat_message', $('#txt').val());
    $('#txt').val('');
    return false;
});
//append the chat text message
socket.on('cat_message', function(msg) {
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