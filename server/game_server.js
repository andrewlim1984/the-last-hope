var io = require('socket.io'), // refactor this entire thing to use Socket.io rooms. Le sigh.
  once = false,
  db = require('firebase'),
  zomb = require('./helpers/ai.js'),
  pl = require('./helpers/player.js'),
  util = require('./helpers/utilities.js');
  
var snapshot = {};
var rooms = {};  
var ids = {};   
var base = {}; 
var name_base = {};   
var scores = {}; 
var seed = {};
var entity = {};
var hasCulled = false; 
var hasCalled = true; 

exports.setIO = function( obj ) { // 
	io = obj;                    
	return console.log("IO has been set on handler"); 
}

exports.handler = function( socket ) {

  socket.on('room', function( room, instance_name ) { 
  	if(rooms[room] === undefined) {
      scores[room] = {};
      scores[room].name = {};
      snapshot[room] = {};
      snapshot[room].players = {};
      snapshot[room].mobs = {};
      snapshot[room].req = 0;
      snapshot[room].init = true; 
  		rooms[room] = {};
      rooms[room].syncCall = false;         
  		rooms[room].playerList = {}; 
  		rooms[room].socketid = {};
      rooms[room].playerCount = 1;   
  		rooms[room].playerList[instance_name] = instance_name; // Also instances are needed so we can have
  		rooms[room].socketid[socket.id] = socket.id; // unlimited games hosted. 
      sync(rooms[room]);

  	} else {
      rooms[room].playerList[instance_name] = instance_name;
      rooms[room].socketid[socket.id] = socket.id;
      rooms[room].playerCount += 1;
  	}
    console.log(rooms[room].playerCount)
  	ids[socket.id] = room; // A bit on Socket io. Each client has a unique socket id that is 'permanent'
  });                     

  socket.on('initializePlayer', function( name ) { 
  	console.log("Initializing  " + name + " with ID of " + socket.id);
    var instance = ids[socket.id];
        instance = rooms[instance];
    var room = ids[socket.id];
    if(snapshot[room].init === true) {
      snapshot[room].init = false;
      io.sockets.socket(socket.id).emit('root');
      return;
    }
    for(var i in instance.socketid) {
      io.sockets.socket(instance.socketid[i]).emit('snapShot');
    }
  });

  socket.on('snapReply', function( obj, flags ) { // need a mutex?
    if(obj === undefined) {
      return; 
    }
    var instance = ids[socket.id];
        instance = rooms[instance];
    var room = ids[socket.id];

    if(flags !== undefined) {
      if(snapshot[room].req !== false) { 
        return; 
      } else {
        for(var k in instance.socketid) { 
          io.sockets.socket(instance.socketid[k]).emit('staged', flags);
        };
      } 
      return;
    };
  
    if(snapshot[room].req !== 0) { 
      return; 
    } 
    snapshot[room].req = 1; 
    processShot(obj, room);  
    for(var k in instance.socketid) { 
       io.sockets.socket(instance.socketid[k]).emit('staged');
    }
  });

 socket.on('ready', function( flags ) {
   if(flags !== undefined) {
     var instance = ids[socket.id];
         instance = rooms[instance];
    for(var k in instance.socketid) { 
       io.sockets.socket(instance.socketid[k]).emit('reMap');
    }
    return;
   }
   var room = ids[socket.id];
   snapshot[room].req = 0;
   io.sockets.socket(socket.id).emit('draw', snapshot[room]);
 });
  
 socket.on('insert_player', function( name ) {
   var instance = ids[socket.id];
       instance = rooms[instance];

    for(var i in instance.socketid) {
      if(instance.socketid[i] !== socket.id) {
       io.sockets.socket(instance.socketid[i]).emit('addPlayer', name);
      };
    }
 });

  socket.on('updatemove', function( x, y, animation, client_name, velx, vely) { // eventually store and do checking before broadcasting
  	var instance = ids[socket.id];
        instance = rooms[instance];

    for(var i in instance.socketid) { // My next refactoring will be to use velocity rather than x/y
  	  io.sockets.socket(instance.socketid[i]).emit('moveplayer', x, y, animation, client_name, velx, vely);
  	}                                
  });

  socket.on('disconnect', function() { 
  	var instance = ids[socket.id];
        instance = rooms[instance];
    
    var room = ids[socket.id];   
    console.log("A client has disconnected from an instance:  " + room)
    instance.playerCount -= 1;  
    
    if(instance.playerCount === 0) {
      console.log("Nuking ze room: " + room)
      util('nukeRoom', room);
      snapshot[room] === undefined; 
      return;
    }

    for(var i in instance.socketid) {
  	  io.sockets.socket(instance.socketid[i]).emit('rollcall');
  	}                            
    
    if(!hasCulled) {
    	hasCulled = true;          
      setTimeout( function(){ 
      	cullPlayers(instance, room);
      }, 2000);
    }

  });

  socket.on('salute', function( name ) { 
  	var instance = ids[socket.id];      
        instance = rooms[instance];    

  	instance.playerList[name] = true;
  });

  var cullPlayers = function( instance, room ) { 
    for(var i in instance.playerList) {   
      if(instance.playerList[i] === true) { 
      	instance.playerList[i] = i;
        hasPlayers = true;       
      } else {
      	for(var x in instance.socketid) {
  	      io.sockets.socket(instance.socketid[x]).emit('deletePlayer', i)
  	    }                               
      }                                
    }
  
    hasCulled = false;
  };
 
 socket.on('firing', function( x, y, direction, animation, gamename ) {
    var instance = ids[socket.id];  
        instance = rooms[instance]; 
    for(var i in instance.socketid) {  
      io.sockets.socket(instance.socketid[i]).emit('spawnbullet', x, y, {direction: direction, owner:gamename});
    }                               
  });


 socket.on('zombie', function( type, obj ) {
    var instance = ids[socket.id];   
        instance = rooms[instance];  
    if(base[obj.room] === undefined) { 
      base[obj.room] = new db("https://hrproj.firebaseio.com/Rooms/" + obj.room + "/Zombies");
      zomb.ai['spawner'](base[obj.room]); 
    }
    for(var i in instance.socketid) {
      zomb.ai[type]( io.sockets.socket(instance.socketid[i]), base[obj.room], obj);
    }
 });

 socket.on('mob_death', function( obj ) {
   var instance = ids[socket.id];
       instance = rooms[instance];
    for(var i in instance.socketid) {
      io.sockets.socket(instance.socketid[i]).emit('kill_mob', obj);
    }
 });

 socket.on('account', function( name, room ) {
   name_base[name] = new db('https://hrproj.firebaseio.com/Rooms/' + room + "/Users/" + name + "/");
   name_base[name].child('health').set(300);
   name_base[name].child('kills').set(0);
   name_base[name].child('score').set(0);

   
   scores[room].name[name] = {};
   scores[room].name[name].kills = 0;
   scores[room].name[name].score = 0;   
   io.sockets.socket(socket.id).emit('accountList', scores);
 });

 socket.on('score', function( kb, points ) {
    var instance = ids[socket.id]; 
    var name = kb;
    io.sockets.socket(socket.id).emit('accountList', scores);
    scores[instance].name[name].kills += 1; 
    scores[instance].name[name].score += points;
    name_base[name].child('kills').set( scores[instance].name[name].kills );
    name_base[name].child('score').set( scores[instance].name[name].score );
 });

 };


var sync = function( room ) {
  var that = room; 
  for(var i in room.socketid) {
    io.sockets.socket(room.socketid[i]).emit('snapShot', 'resync');
  };
  setTimeout(function() {
    sync(that);
  },5000);
}

var processShot = function( obj, room ) {
    for(var i in obj.players) {
       snapshot[room].players[i] = {};
       snapshot[room].players[i].x = obj.players[i].x;
       snapshot[room].players[i].y = obj.players[i].y;
       snapshot[room].players[i].tag = obj.players[i].tag;
    }

    for(var z in obj.mobs) {
       snapshot[room].mobs[z] = {};
       snapshot[room].mobs[z].x = obj.mobs[z].x; 
       snapshot[room].mobs[z].y = obj.mobs[z].y;
       snapshot[room].mobs[z].tag = obj.mobs[z].tag;
       snapshot[room].mobs[z].type = obj.mobs[z].type;
    }
};