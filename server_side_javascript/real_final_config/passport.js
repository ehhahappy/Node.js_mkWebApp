module.exports = function(app){
    var conn = require('./db')();
    var bkfd2Password = require("pbkdf2-password");
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    var FacebookStrategy = require('passport-facebook').Strategy;
    var hasher = bkfd2Password();

    app.use(passport.initialize());
    app.use(passport.session());

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

    return passport;
}