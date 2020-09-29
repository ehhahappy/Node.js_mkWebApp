var express = require('express');
var app = express();
app.use(express.static('public'));
app.get('/', function(req, res){
    res.send('Hello home page');
});
app.get('/dynamic', function(req, res){
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
    res.send(output)
})
app.get('/route', function(req, res){
    res.send('Hello Router, <img src="/whale.png">')
})
app.get('/login', function(req, res){
    res.send('login plese')
})
app.listen(3000, function(){
    console.log('Conneted 3000 port!');
});