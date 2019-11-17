const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});

express()
    .use(express.static(path.join(__dirname, 'public')))
    .use(express.json())
    .use(express.urlencoded({ extended: false }))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/login'))
    .get('/main', (req, res) => res.render('pages/NotAWebApp'))
    .get('/mainmenu', (req, res) => res.render('pages/mainmenu'))
    .get('/underconstruction', (req, res) => res.render('pages/underconstruction'))
    .get('/login', (req, res) => res.render('pages/login'))
    .post('/login', async(req, res) => {
        try {
            const client = await pool.connect()
            const result = await client.query(`SELECT password FROM users WHERE userid = '${req.body.userid}'`);

            var results = { 'rows': result.rows };
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
    .listen(PORT, () => console.log(`Listening on ${ PORT }`))