var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();
app.locals.pretty = true;

app.set('views', './views_final');
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/topic/new', function (req, res) {
    res.render('new');
});
app.get('/topic', function (req,res) {
    fs.readdir('data_final', function (err, files) {
        if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
        res.render('view', {topics:files});
    })
});
app.get('/topic/:id', function (req, res) {
    var id = req.params.id;
    fs.readdir('data_final', function (err, files) {
        if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
        fs.readFile('data_final/'+id,'utf8',function (err, data) {
            if(err){
                console.log(err);
                res.status(500).send('Internal Server Error');
            }
            res.render('view', {topics:files, title:id, description:data});
        })
    })
})
app.post('/topic', function (req, res) {
    var title = req.body.title;
    var description = req.body.description;
    fs.writeFile('data_final/'+title, description, function (err) {
        if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
        res.send('Success!');
    });
});


app.listen(3000, function () {
    console.log('Connected, 3000 port');
});