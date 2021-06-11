var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./my.db')

module.exports = function (req, res, next) {
    const username = req.headers.username
    const password = req.headers.password

    const stmt = db.prepare('SELECT username FROM users WHERE username=? AND password=?')
    stmt.all(username, password, function (err, rows) {
        if (rows.length > 0) {
            next()
        } else {
            res.send(401)
        }
    })
}