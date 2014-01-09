var express = require('express');
var port = process.env.PORT || 5000;
var app = express();    //create our app with express
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);


app.configure(function() {
	app.use(express.static(__dirname)); //sets the static file location
	app.use(express.logger('dev')); //logs every request to the console
	app.use(express.cookieParser());
	app.use(express.bodyParser()); // pull information from html in POST
	app.use(express.methodOverride()); //simulate DELETE and PUT
	app.use(express.session({
		secret: 'pariscongobomie'
	}));
});

app.get('/', function(req, res){
  res.sendfile(__dirname + '/index.html');
});

server.listen(port, function() {
	console.log("App listening on port " + port);
});

var playerList = [];

//setup classes

io.sockets.on('connection', function (socket) {

  socket.on('initializePlayer', function (newPlayerName) {
    socket.clientName = newPlayerName;
    playerList.push(newPlayerName);
    io.sockets.emit('addPlayer', playerList, newPlayerName);
  });

  socket.on('recieveData', function (positionx, positiony, currentAnimation, gameName) {
    socket.broadcast.emit('playerMove', positionx, positiony, currentAnimation, gameName);

  });

  socket.on('spawnBullet', function(weaponType, gameName, angle) {
    socket.broadcast.emit('spawnClientBullet', weaponType, gameName, angle);
  });

  socket.on('disconnect', function() {
    delete playerList[socket.clientName];
    for (var i in playerList) {
      if (playerList[i] === socket.clientName) {
        playerList.splice(i, 1)
      }
    }
    socket.broadcast.emit('message', socket.clientName);
    socket.broadcast.emit('netReplayer', playerList);
  });
});