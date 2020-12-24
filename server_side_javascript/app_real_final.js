var app = require('./real_final_config/express')();
var passport = require('./real_final_config/passport')(app);
var auth = require('./real_final_routes/auth')(passport);
app.use('/auth', auth);

var topic = require('./real_final_routes/topic')();
app.use('/topic', topic);

app.listen(3000, function () {
    console.log('Connected, 3000 port');
});