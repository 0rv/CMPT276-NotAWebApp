//Add new user
function signupUser() {
    document.getElementById('signup-form').action = '/signup';
    document.getElementById('signup-form').submit();
}

//Login user
function loginUser() {
    document.getElementById('login-form').action = '/login';
    document.getElementById('login-form').submit();
}