module.exports = function(){
    var express = require('express');
    var session = require('express-session');
    var bodyParser = require('body-parser');
    var MySQLStore = require('express-mysql-session')(session);

    var app = express();
    app.set('views', './real_final_views');
    app.set('view engine', 'pug');
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(session({
        secret: 'happy',
        resave: false,
        saveUninitialized: true,
        store: new MySQLStore({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '123456',
            database: 'o2'
        })
    }));

    return app;
}