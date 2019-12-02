const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const ee = require('@google/earthengine');
const http = require('http').Server(express); //chat
const io = require('socket.io')(http);
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});
const nodemailer = require('nodemailer');
const mailGun = require('nodemailer-mailgun-transport');
const auth = {
    auth: {
        api_key: process.env.MAILGUN_API,
        domain: process.env.MAILGUN_DOMAIN
    }
};
const transporter = nodemailer.createTransport(mailGun(auth));
  
ee.initialize(null, null, 3000);
//unsure if we need to initialize google earth engine without an assocated service account to authorize

app = express();
    app.use(express.static(path.join(__dirname, 'public')))
    .use(express.json())
    .use(express.urlencoded({ extended: false }))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .post('/randMap', (req, res) => {
      //const image = ee.Image()
  
      var image = ee.Image('CGIAR/SRTM90_V4');
      Map.setCenter(-110, 40, 5);
      Map.addLayer(image, {min: 0, max: 3000}, 'SRTM');
      console.log("yett2")  
      res.render('pages/login')  
      
    })
    .get('/', (req, res) => res.render('pages/login'))
    .get('/main', (req, res) => res.render('pages/NotAWebApp'))
    .get('/mainmenu', (req, res) => res.render('pages/mainmenu'))
    .get('/howto', (req, res) => res.render('pages/howto'))
    .get('/underconstruction', (req, res) => res.render('pages/underconstruction'))
    .get('/login', (req, res) => res.render('pages/login'))
    .post('/main', async(req, res) => { res.render('pages/NotAWebApp') })
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
    })
    .get('/review', async(req,res) => {
        try {
            const client = await pool.connect()
            const result = await client.query(`SELECT * FROM review;`);

            const results = { 'rows': result.rows };
            res.render('pages/review', results);
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    })
    .post('/review', async(req, res) => {    
        try {
            const client = await pool.connect()
            const result = await client.query(`INSERT INTO review VALUES('${req.body.name}', '${req.body.review}');`);
            
            const result2 = await client.query(`SELECT * FROM review;`);
            const results = { 'rows': result2.rows };
            res.render('pages/review', results);
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    })
    .get('/reportbugsucess', (req, res) => res.render('pages/reportbugsucess'))
    .get('/reportbugfail', (req, res) => res.render('pages/reportbugfail'))
    .get('/reportbug', (req, res) => res.render('pages/reportbug'))
    .post('/reportbug', async(req, res) => {
        const client = await pool.connect();
            
        const email = req.body.email;
        const subject = req.body.subject;
        const descript = req.body.descript;
     
        const mailOptions = {
            from: email,
            to: 'notawebappbugreport@gmail.com',
            subject: subject,
            text: descript
        };

        transporter.sendMail(mailOptions, function(err, data) {
            if (err) {
                res.render('pages/reportbugfail');
            } else {
                res.render('pages/reportbugsuccess');
            }
        });
        client.release();
    });

var counter = 0;
io.sockets.on('connection', function(socket) {
    socket.on('username', function(username) {
        socket.username = username;
        io.emit('is_online', '• <i>' + socket.username + ' joined the game</i>'); //what does the is_online do? does it print? delete if it does --> for the one below too
        counter++;
        socket.emit('counter', {count:counter});
    });
    socket.on('disconnect', function(username) {
        io.emit('is_online', '• <i>' + socket.username + ' left the game<i/>');
        counter--;
        socket.emit('counter', {count:counter});
    });
    socket.on('chat_message', function(message) {
        io.emit('chat_message', ' <strong> ' + socket.username + ' </strong>: ' + message);
    });
});

// pick one, comment the other
app.listen(PORT, () => { console.log(`Listening on ${ PORT }`);  }) 
// http.listen(PORT, () => { console.log(`Listening on ${ PORT }`);  }) 