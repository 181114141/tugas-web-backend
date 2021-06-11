const express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
const auth = require('./middlewares/auth.js')

const app = express()
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('my.db');

app.use(bodyParser.json(), bodyParser.urlencoded({ extended: true }));
app.use(cors())

const sql_create = `CREATE TABLE IF NOT EXISTS Todolist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deskripsi VARCHAR(100)
  );`;

db.run(sql_create);

db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(100),
    password VARCHAR(100)
  );`)

app.get('/', auth, function (req, res) {
    res.send(`
    <html>
        <body>
            <form action="/todo" method="post">
                <input name="deskripsi" />
                <button>Add</button>
            </form>
        </body>
    </html`)
    res.end()
})

app.get('/todo', auth, (req, res) => {
    db.serialize(function () {
        db.all('SELECT * FROM Todolist', function (
            err,
            row
        ) {
            res.send(row);
        });
    });
})

app.post('/todo', auth, (req, res) => {
    const desc = req.body.deskripsi;
    const sql_insert = `INSERT INTO Todolist (deskripsi) VALUES (?)`;

    db.run(sql_insert, desc)
    res.end()
})

app.delete('/todo/:id', auth, (req,res) => {
    const id = req.params.id
    const sql_delete = `DELETE FROM Todolist WHERE id=?`
    db.run(sql_delete, id)
})

app.get('/user', auth, (req, res) => {
    db.serialize(function () {
        db.all('SELECT * FROM users', function (
            err,
            row
        ) {
            res.send(row);
        });
    });
})

app.post('/user', (req,res, next) => {
    const stmt = db.prepare('SELECT COUNT(*) as jumlah_user FROM users')
    stmt.get((err,result) => {
        if (result.jumlah_user > 0){
            auth(req, res, next)
        } else {
            next()
        }
    })
}, (req, res) => {
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?,?)')
    stmt.run(req.body.username, req.body.password, function(err) {
        if (err) {
            res.end(500)
            return
        }

        res.json({id: this.lastID, username: req.body.username})
    })
})

app.delete('/user/:id', (req,res, next) => {
    const stmt = db.prepare('SELECT COUNT(*) as jumlah_user FROM users')
    stmt.get((err,result) => {
        if (result.jumlah_user > 1){
            auth(req, res, next)
        } else {
            res.send(403)
        }
    })
}, (req, res) => {
    const id = req.params.id
    const sql_delete = `DELETE FROM users WHERE id=?`
    db.run(sql_delete, id)
    res.end()
})

app.listen(3000, function () {
    console.log('Server sudah jalan')
})