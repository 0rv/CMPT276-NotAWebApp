const path = require('path')
const PORT = process.env.PORT || 5000
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});
// DO NOT CHANGE above instance variables; we're reasonably sure it all works
// less so for the following...
var express = require('express');
var app = express();
var fs = require('fs') //stopgag measure this is bad practice
var cities = require('./public/1000.json')
//holy this works?
//console.log(cities[0].fields.city, cities[0].fields.coordinates[0], cities[0].fields.coordinates[1])
//behold a loaded city item

var server = require('http').createServer(app);
var io = require('socket.io')(server);
// Look, whatever model this guy is using
// https://www.programwitherik.com/socket-io-tutorial-with-node-js-and-express/
// Just go with it we don't reasonably have time to make the perfect implementation
// i.e with react or other libraries

const map = require('mapillary-js') // https://www.npmjs.com/package/mapillary-js

// configuration for Heroku build
//https://stackoverflow.com/questions/11001817/allow-cors-rest-request-to-a-express-node-js-application-on-heroku
//The following enables CORS (Cross-Origin Resource Sharing) which would otherwise prevent some socket.io functionality by preventing the load of some required js. The long and short is that we should not be requiring any resource from an http connection while on https (and can be somewhat bypassed by revoking the secure connection on the remote deploy)
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

  app.use(allowCrossDomain)
  .use(express.static(path.join(__dirname + "/public"), {
    index: false,
    immutable: true,
    cacheControl: true,
    maxAge: "30d"
  }))
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .post('/socket', (req, res) => res.render('pages/socket'))
  .get('/', (req, res) => res.render('pages/login'))
  .get('/main', (req, res) => res.render('pages/notawebapp'))
  .get('/mainmenu', (req, res) => res.render('pages/mainmenu'))
  //.get('/socket', (req, res) => res.render('pages/socket'))
  .get('/underconstruction', (req, res) => res.render('pages/underconstruction'))
  .get('/login', (req, res) => res.render('pages/login'))
  .post('/main', async(req, res) => { res.render('pages/notawebapp') })
  .post('/login', async(req, res) => {
    try {
      // input sanitation (protection from injection attacks) is beyond the scope of the project because I'm depressed :)))
      console.log("recieved login request with uid", req.body.userid, "password", req.body.password)


      const client = await pool.connect()      
      const result = await client.query(`SELECT password FROM users WHERE userid = '${req.body.userid}'`);

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
  .get('/signup', (req, res) => res.render('pages/signup'))
  .post('/signup', async(req, res) => {
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

  var usr = null
  var mapno = 0
  

  io.on('connection', (socket) => {
    //usr = prompt('Please choose a nickname')
    socket.broadcast.emit('nickname', usr)
    console.log('Client connected.');
    socket.on('disconnect', () => console.log('Client disconnected.'))
    socket.on('chat', function(msg) {
      //console.log("Server got ", msg);
      socket.emit('chatresponse', msg); //sends to the other clients
      socket.broadcast.emit('chatresponse', msg); //sends to the original sender
    })
    
    socket.on('maprequest', function() {
      // if the users have asked for a new map
      // https://stackoverflow.com/questions/1527803
      mapno = Math.floor( Math.random() * 1000 )
      newmap = cities[mapno]
      socket.emit('newmap', newmap)
      socket.broadcast.emit('newmap', newmap)
      console.log("Sending new map with id "+mapno)
      //allows cheating but is also the only way we could possibly test this
      //spit the new map object back at clients, they can do the work
    })
  
    socket.on('mapguess', function(msg) {
      //when players guess the city
      if (msg == cities[mapno].fields.city) {
        socket.emit('chat', `SERVER: ${msg} WAS CORRECT`)
        socket.broadcast.emit('chat', `SERVER: ${msg} WAS CORRECT`)
        socket.emit('point', null)
        socket.broadcast.emit('point', null)
        console.log("Clients guessed correctly; point awarded")
        //could maybe roll this into a function
        mapno = Math.floor( Math.random() * 1000 )
        newmap = cities[mapno]
        socket.emit('newmap', newmap)
        socket.broadcast.emit('newmap', newmap)
        console.log("Sending new map with id "+mapno)
        
      } else {
        socket.emit('chat', `SERVER: ${msg} WAS INCORRECT`)
        socket.broadcast.emit('chat', `SERVER: ${msg} WAS INCORRECT`)
      }
      
    })
    
  })  

// Attempt at Mapillar features oh lord oh yikes
// We'll actually use sockets here because the users need to see the same things
  
  //indexing guide:
  //cities[0].fields.city
  //cities[0].fields.coordinates[0]
  //cities[0].fields.coordinates[1]

  
  



// pick one, comment the other
//app.listen(PORT, () => { console.log(`App listening on ${ PORT }`);  }) 
server.listen(PORT, () => { console.log(`Socket listening on ${ PORT }`);  }) 