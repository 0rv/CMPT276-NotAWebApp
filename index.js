const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const app = express();
const http = require('http').Server(app); //chat
const io = require('socket.io')(http);

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: true
});

// express()
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/login'))
app.get('/main', (req, res) => res.render('pages/NotAWebApp.ejs'))  //does it work without the ejs?
app.get('/login', (req, res) => res.render('pages/login'))
app.post('/login', async(req, res) => {
    try {
        const client = await pool.connect()
        const result = await client.query(`SELECT password FROM users WHERE userid = '${req.body.userid}'`);
        // pool.query(`INSERT INTO onlineUsers (userid) VALUES = '${req.body.userid}'`);

        const results = { 'results': (result) ? result.rows : null };
        if (result.rows[0].password == req.body.password) {
            res.render('pages/NotAWebApp', results);
            console.log("logged in");
        } else {
            res.render('pages/signup', results);
            console.log("not logged in");
        }
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
})
// app.post('/logout', async(req, res) => {
//     try {
//         const client = await pool.connect()
//         const result = await client.query(`DELETE FROM onlineUsers WHERE userid = '${req.body.userid}'`);

//         const results = { 'results': (result) ? result.rows : null };
//         res.render('pages/', results);
//         console.log("logged out");
//         client.release();
//     } catch (err) { //do i need this?
//         console.error(err);
//         res.send("Error " + err);
//     }
// })
app.get('/signup', (req, res) => res.render('pages/signup'))
app.post('/signup', async(req, res) => {
    try {
        const client = await pool.connect()
        const result = await client.query(`INSERT INTO users (userid, password) VALUES ('${req.body.userid}', '${req.body.password}')`);

        const results = { 'results': (result) ? result.rows : null };
        res.render('pages/login', results);
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
})
// app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

var count = 0;
// var $ipsConnected = [];
io.sockets.on('connection', function(socket) {
    // const username = client.query('')
    socket.on('username', function(username) {  //where does this username come from... how can i make it work if they have a userid they login with?
        socket.username = username;
        io.emit('is_online', '• <i>' + socket.username + 'joined the game</i>'); //what does the is_online do? does it print? delete if it does --> for the one below too
        counter++;
        socket.emit('counter', {count:count});
    });
    socket.on('disconnect', function(username) {
        io.emit('is_online', '• <i>' + socket.username + 'left the game<i/>');
        counter--;
        socket.emit('counter', {count:count});
    });
    socket.on('chat_message', function(message) {
        io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
    });
});

const server = http.listen(5000, function() {   //chat
    console.log('listening on *:5000');
});