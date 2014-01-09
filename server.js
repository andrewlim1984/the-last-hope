var Firebase = require('firebase');
var express = require('express'),
    port = 8081,
    root = __dirname + '/impact/',
    app = express();
var io = require('socket.io');
var game = require('./server/game_server.js'); 
var server = require('http').createServer(app)
    io = io.listen(server);

app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.bodyParser());
 
});


app.use(express.static(__dirname));

app.use('/signin', function( req, res, next ) { 
  var user = req.body.user;
  var pw = req.body.pw;

  var fb = new Firebase('https://hrproj.firebaseio.com/Users/' + user + '/pw');
    
  fb.on('value', function( snapshot ) {
    
     if( snapshot.val() === pw ) {
       next();
     } else {
       res.send('/'); 
     }
  });


});

app.use(function( req, res, next ) {
  console.log("Passed");
  res.send('/impact/');
});


server.listen(port);

game.setIO(io);
io.sockets.on('connection', game.handler); 

// game.sync(game.sync);

console.log('app listening on port', port);