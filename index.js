const express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
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

app.get('/', function (req, res) {
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

app.get('/todo', (req, res) => {
    db.serialize(function () {
        db.all('SELECT * FROM Todolist', function (
            err,
            row
        ) {
            res.send(row);
        });
    });
})

app.post('/todo', (req, res) => {
    const desc = req.body.deskripsi;
    const sql_insert = `INSERT INTO Todolist (deskripsi) VALUES (?)`;

    db.run(sql_insert, desc)
    res.end()
})

app.delete('/todo/:id', (req,res) => {
    const id = req.params.id
    const sql_delete = `DELETE FROM Todolist WHERE id=?`
    db.run(sql_delete, id)
})

app.listen(3000, function () {
    console.log('Server sudah jalan')
})