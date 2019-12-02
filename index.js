const express = require('express')
const app = express();
const path = require('path')
const PORT = process.env.PORT || 5000
const ee = require('@google/earthengine');
const http = require('http').Server(app); //chat
const io = require('socket.io')(http);  //try replacing http with 5000?

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: true                        //uncomment when done
});
  
ee.initialize(null, null, 3000);
//unsure if we need to initialize google earth engine without an assocated service account to authorize

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.post('/randMap', (req, res) => {
    //const image = ee.Image()

    var image = ee.Image('CGIAR/SRTM90_V4');
    Map.setCenter(-110, 40, 5);
    Map.addLayer(image, {min: 0, max: 3000}, 'SRTM');
    console.log("yett2")  
    res.render('pages/login')  
    
})
app.get('/', (req, res) => res.render('pages/login'))
app.get('/main', (req, res) => res.render('pages/NotAWebApp'))
app.get('/mainmenu', (req, res) => res.render('pages/mainmenu'))
app.get('/underconstruction', (req, res) => res.render('pages/underconstruction'))
app.get('/login', (req, res) => res.render('pages/login'))
app.post('/main', async(req, res) => { 
    res.render('pages/NotAWebApp')
});
app.post('/login', async(req, res) => {
    try {
        // input sanitation (protection from injection attacks) is beyond the scope of the project because I'm depressed :)))
        console.log("recieved login request with uid", req.body.userid, "password", req.body.password)


        const client = await pool.connect()          
        const result = await client.query(`SELECT password FROM users WHERE userid = '${req.body.userid}'`);
        // const username = `${req.body.userid}`;   //try this for username in chat

        const results = { 'results': (result) ? result.rows : null };
        if (result.rows[0].password == req.body.password) {
            res.render('pages/mainmenu', results);
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
});

var counter = 0;
var users = {};
io.sockets.on('connection', function(socket) {  // why does this say ppl are leaving the chat when theyre still logged in?
    socket.on('username', function(username) {
        users[socket.id] = username;
        io.emit('is_online', '• <i>' + ' <strong> ' + users[socket.id] + ' </strong> ' +' joined the game</i>'); //what does the is_online do? does it print? delete if it does --> for the one below too
        counter++;
        io.emit('counter', {count: Object.keys(users).length});
    });
    socket.on('disconnect', function(username) {
        io.emit('is_online', '• <i>' + ' <strong> ' + users[socket.id] + ' </strong> ' +' left the game<i/>'); //get rid of this if i cant get it to work properly --> keeps outputting "undefined left the chat"
        delete users[socket.id];
        counter--;
        io.emit('counter', {count: Object.keys(users).length});
    });
    socket.on('chat_message', function(message) {
        io.emit('chat_message', ' <strong> ' + users[socket.id] + ' </strong>: ' + message);
    });
});

// pick one, comment the other
const server = http.listen(PORT, function() {
    console.log(`Listening on ${ PORT }`);
})
// app.listen(PORT, () => { console.log(`Listening on ${ PORT }`);  }) 
// http.listen(PORT, () => { console.log(`Listening on ${ PORT }`);  }) 