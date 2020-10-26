var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var MySQLStore = require('express-mysql-session')(session);
var bkfd2Password = require("pbkdf2-password");
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var hasher = bkfd2Password();
var mysql = require('mysql');
var conn = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'123456',
    database:'o2'
});
conn.connect();
var app = express();
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
app.use(passport.initialize());
app.use(passport.session());

app.get("/count", function(req, res){
    if(req.session.count){
        req.session.count++;
    } else{
        req.session.count = 1;
    }
    res.send('count: '+ req.session.count);
});

app.get('/auth/logout', function(req, res){
    req.logout();
    req.session.save(function() {
        res.redirect('/welcome')
    });
});

app.get('/welcome', function(req, res){
    if(req.user && req.user.displayName){
        res.send(`
            <h1>Hello, ${req.user.displayName}</h1>
            <a href="/auth/logout">logout</a>
        `);
    } else {
        res.send(`
            <h1>Welcome</h1>
            <ul>
                <li><a href="/auth/login">Login</a></li>
                <li><a href="/auth/register">Register</a></li>
            </ul>
        `);
    }
});

passport.serializeUser(function(user, done) {  // 세션 관련, 로그인에 성공했을 경우 done의 실행으로 user데이터가 넘어오고 실행됨.
    console.log('serializeUser', user);
    done(null, user.authId);
});
passport.deserializeUser(function(id, done) {  // 세션에 로그인 정보가 저장되었을 경우 실행됨
    console.log('deserializeUser', id);
    var sql = 'SELECT * FROM users WHERE authId=?';
    conn.query(sql, [id], function(err, results){
        if(err){
            console.log(err);
            done('There is no user.');
        } else {
            done(null,results[0]);
        }
    });
});
passport.use(new LocalStrategy(  // passport를 사용함에 있어서 로컬 전략을 사용하겠다는 객체생성
    function(username, password, done){
        var uname = username;
        var pwd = password;
        var sql = 'SELECT * FROM users WHERE authId=?';
        conn.query(sql, ['local:'+uname],function(err, results){
            if(err){
                return done('There is no user.');
            }
            var user = results[0];
            return hasher({password: pwd, salt: user.salt}, function (err, pass, salt, hash) {
                if (hash === user.password) {
                    console.log('LocalStrategy', user);
                    done(null, user);
                } else {
                    done(null, false);
                }
            });
        });
    }
));

passport.use(new FacebookStrategy({
        clientID: '730974174296520',
        clientSecret: '1bbc56c751c9df1ecef08cc998d875ab',
        callbackURL: "/auth/facebook/callback",
        profileFields:['id', 'email', 'gender', 'link', 'locale',
            'name', 'timezone', 'updated_time', 'verified', 'displayName']
    },
    function(accessToken, refreshToken, profile, done) {
        console.log(profile);
        var authId = 'facebook:'+profile.id;
        var sql = 'SELECT * FROM users WHERE authId=?';
        conn.query(sql, [authId], function(err, results){
            if(results.length>0){
                done(null, results[0]);
            } else {
                var newuser = {
                    'authId':authId,
                    'displayName':profile.displayName,
                    'email':profile.emails[0].value
                };
                var sql = 'INSERT INTO users SET ?';
                conn.query(sql, newuser, function(err, results){
                    if(err){
                        console.log(err);
                        done('Error');
                    } else {
                        done(null, newuser);
                    }
                })
            }
        });
    }
));

app.post('/auth/login', passport.authenticate('local',
    { //successRedirect: '/welcome',
        failureRedirect: '/auth/login', failureFlash: false
    }),
    function(req, res){
    req.session.save(function(){
        res.redirect('/welcome')
    })
    }
);
app.get('/auth/facebook',
    passport.authenticate('facebook',
        {scope:'email'}));
app.get('/auth/facebook/callback',
    passport.authenticate(
        'facebook',
        {//successRedirect: '/welcome',
            failureRedirect: '/auth/login'
        }),
    function(req, res){
    req.session.save(function(){
        res.redirect('/welcome')
    })
    }
);

app.get('/auth/login', function(req, res){
    var output = `
    <h1>Login</h1>
    <form action="/auth/login" method="post">
        <p>
            <input type="text" name="username" placeholder="username">
        </p>
        <p>
            <input type="password" name="password" placeholder="password">
        </p>
        <p>
            <input type="submit">
        </p>
    </form>
    <a href="/auth/facebook">facebook</a>
    `;
    res.send(output);
});

app.post('/auth/register', function(req, res){
    hasher({password:req.body.password}, function(err, pass, salt, hash){
        var user = {
            authId:'local:'+req.body.username,
            username:req.body.username,
            password:hash,
            salt:salt,
            displayName:req.body.displayName
        };
        var sql = 'INSERT INTO users SET ?';
        conn.query(sql, user, function(err, results){
            if(err){
                console.log(err);
                res.status(500);
            } else {
                req.login(user, function(err){
                    req.session.save(function(){
                        res.redirect('/welcome');
                    });
                })
            }
        });
    });
});
app.get('/auth/register', function(req, res){
    var output =`
    <h1>Register</h1>
    <form action="/auth/register" method="post">
        <p>
            <input type="text" name="username" placeholder="username">
        </p>
        <p>
            <input type="password" name="password" placeholder="password">
        </p>
        <p>
            <input type="text" name="displayName" placeholder="displayName">
        </p>
        <p>
            <input type="submit">
        </p>
    </form>
    `;
    res.send(output);
});

app.listen(3003, function(){
    console.log("Connected 3003 port!!!");
});