var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/slider.html');
});


io.on('connection', function(socket){
  console.log('A user connected');
  socket.on('disconnect',function(msg){
    console.log('A user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});