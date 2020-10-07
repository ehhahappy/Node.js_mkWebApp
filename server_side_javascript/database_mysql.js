var mysql = require('mysql');
var conn = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'123456',
    database:'o2'
});
conn.connect();

// SELECT
var sql = 'SELECT * FROM topic'
conn.query(sql, function(err, rows, fields){
    if(err){
        console.log(err);
    } else {
        for(var i=0; i<rows.length; i++){
            console.log(rows[i].title)
        }
    }
});

// INSERT
var sql = 'INSERT INTO topic (title, description, author) VALUES("Express", "Web framework", "duru")';
conn.query(sql, function (err, rows, fields) {
    if(err){
        console.log(err);
    } else {
        console.log(rows.insertId);
    }
})

// INSERT use params
var sql = 'INSERT INTO topic (title, description, author) VALUES(?, ?, ?)';
var params = ['Supervisor', 'Watcher', 'graphittie'];
conn.query(sql, params, function (err, rows, fields) {
    if(err){
        console.log(err);
    } else {
        console.log(rows.insertId);
    }
})

// UPDATE
var sql = 'UPDATE topic SET title=?, author=? WHERE id=?';
var params = ['NPM', 'leezche', 1];
conn.query(sql, params, function (err, rows, fields) {
    if(err){
        console.log(err);
    } else {
        console.log(rows);
    }
})

// DELETE
var sql = 'DELETE FROM topic WHERE id=?';
var params = [1];
conn.query(sql, params, function (err, rows, fields) {
    if(err){
        console.log(err);
    } else {
        console.log(rows);
    }
})
conn.end();