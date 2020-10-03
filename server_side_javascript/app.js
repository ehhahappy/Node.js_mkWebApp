var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.locals.pretty = true;
app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/form_get', function(req, res){  // 정보전달(get 방식)
    res.render('form_get');
});
app.get('/form_receiver', function(req, res){
    var title = req.query.title;
    var description = req.query.description;
    res.send(title+','+description)
});
app.get('/form_post', function(req, res){ // 정보전달(post 방식)
    res.render('form_post');
});
app.post('/form_receiver', function(req, res){
    var title = req.body.title;
    var description = req.body.description;
    res.send(title+','+description);
});
app.get('/s_topic/:id',function(req, res){  // 시맨틱 URL 사용
    var topics = [
        'Javascript is ...',
        'Nodejs is ...',
        'Express is ...'
    ];
    var output =`
        <a href="/s_topic/0">JavaScript</a><br>
        <a href="/s_topic/1">Nodejs</a><br>
        <a href="/s_topic/2">Express</a><br><br>
        ${topics[req.params.id]}
    `
    res.send(output)
});
app.get("/s_topic/:id/:mode", function(req, res){  // 두가지 변수를 받음
    res.send(req.params.id+','+req.params.mode)
});
app.get('/topic',function(req, res){ // 쿼리스트링 사용
    var topics = [
        'Javascript is ...',
        'Nodejs is ...',
        'Express is ...'
    ];
    var output =`
        <a href="/topic?id=0">JavaScript</a><br>
        <a href="/topic?id=1">Nodejs</a><br>
        <a href="/topic?id=2">Express</a><br><br>
        ${topics[req.query.id]}
    `
    res.send(output)
});
app.get('/template', function (req, res){  // pug 패키지 사용(view폴더)
    res.render('index', {time:Date()});
});
app.get('/', function(req, res){  // home dir
    res.send('Hello home page');
});
app.get('/dynamic', function(req, res){  // 동적 페이지
    var lis = ''
    for(var i=0; i<5; i++){
        lis = lis + '<li>coding</li>'
    }
    var time = Date();
    var output = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dynamic</title>
</head>
<body>
    Hello, Dynamic!
    <ul>
        ${lis}
    </ul>
    ${time}
</body>
</html>`
    res.send(output);
});
app.get('/route', function(req, res){ // 이미지 출력
    res.send('Hello Router, <img src="/whale.png">');
});
app.get('/login', function(req, res){ // 글자 출력
    res.send('login plese');
});
app.listen(3000, function(){
    console.log('Conneted 3000 port!');
});