var socket = io.connect();
var instance_name = prompt("Player Name"); 
var room_name = "Room2"; 
var _loaded = false;

socket.emit('room', room_name, instance_name);
	
socket.emit('account', instance_name, room_name);

socket.on('accountList', function( obj ) {
  console.log(obj);
});

socket.on('addPlayer', function( name ) { 
	console.log("Initializing " + name);			 
	ig.game.spawnEntity(EntityOtherPlayer, 1178, 861, {gamename: name });
});

socket.on('root', function() {
  console.log("The player that initializes the room should spawn these.")
  socket.emit('zombie', 'render', {room: room_name});
  _loaded = true;  	
});

socket.on('snapShot', function( flags ) { 
  var results; 
  if(_loaded === false) {
  	return;
  };
  if( flags !== undefined ) {
    results = gameState();
    console.log('Syncing')
    socket.emit('snapReply', results, flags);
  } else {
    results = gameState();
    socket.emit('snapReply', results);
  }
});

socket.on('staged', function() {
  if(_loaded === false) {
  	socket.emit('ready');
  } else {
    socket.emit('ready', 'sync')
  }
});


socket.on('draw', function( snapshot ) {
 redraw(snapshot);
	_loaded = true;
  socket.emit("insert_player", instance_name);
});

socket.on('reMap', function( snapshot ) {
  remap(snapshot);
});

socket.on('moveplayer', function( x, y, animation, client_name, velx, vely) {
	var playermove = ig.game.getEntitiesByType(EntityOtherPlayer); 
	for(var i = 0; i < playermove.length; i++) {
		if(playermove[i].gamename === client_name) { 
      playermove[i].vel.x = 0;
      playermove[i].vel.y = 0;
			playermove[i].animation = animation; 
			// playermove[i].pos.x = x;
			// playermove[i].pos.y = y; 
      playermove[i].vel.x = velx;
      playermove[i].vel.y = vely;
			return;
		}
	}
});


socket.on('rollcall', function() { 
	socket.emit('salute', instance_name, room_name);
});

socket.on('deletePlayer', function( name ) { 
	console.log("Received")
  var deleteTarget = ig.game.getEntitiesByType(EntityOtherPlayer);
  for(var i = 0; i < deleteTarget.length; i++) { 
    if(deleteTarget[i].gamename === name) {
      deleteTarget[i].kill();
    }
    console.log("Successfully culled " + name);
    return;
  }
});

socket.on('spawnbullet', function( x, y, obj) { 
	ig.game.spawnEntity(EntityProjectile, x, y, obj); 
});

socket.on('kill_mob', function( obj ) {
  var m_type = ig.game.getEntitiesByType(obj.mob);
  for(var i = 0; i < m_type.length; i++) {
    if(m_type[i].tag === obj.tag) {
      m_type[i].kill('despawn');
    }
  }
});


socket.on('zrender', function( arr ) { // Renders the zombies. 
	for(var i = 0; i < arr.length; i++) {		
		ig.game.spawnEntity(EntityEnemy2, arr[i].x, arr[i].y, arr[i].settings );
	}
});


var redraw = function( snapshot ) {
  var mobs = snapshot.mobs;
  var players = snapshot.players; 
  for(var i in mobs) { 
    ig.game.spawnEntity(mobs[i].type, mobs[i].x, mobs[i].y, {tag: mobs[i].tag});
  };
  for(var x in players) {
    ig.game.spawnEntity(EntityOtherPlayer, players[x].x, players[x].y, {gamename: players[x].tag})
  };
}


var gameState = function() {
  var results = {};
      results.players = {};
      results.mobs = {};
  var players = ig.game.getEntitiesByType(EntityOtherPlayer);
  var client = ig.game.getEntitiesByType(EntityPlayer);
  // I suspect we'll get more than one.. due to child references. 
  var mobs_a = ig.game.getEntitiesByType(EntityEnemy); // Need ot consolidate this if I can use child references.
  var mobs_b = ig.game.getEntitiesByType(EntityEnemy2);

      players = players.concat(client);
      mobs_a = mobs_a.concat(mobs_b);

  for(var i = 0; i < players.length; i++) {
    results.players[i] = {};
    results.players[i].tag = players[i].gamename;
    results.players[i].x = players[i].pos.x;
    results.players[i].y = players[i].pos.y; 
  };

  for(var x = 0; x < mobs_a.length; x++) {
    results.mobs[x] = {};
    results.mobs[x].tag = mobs_a[x].tag;
    results.mobs[x].x = mobs_a[x].pos.x;
    results.mobs[x].y = mobs_a[x].pos.y;
    results.mobs[x].type = mobs_a[x].mob; 
  };

  return results; 
}

var remap = function( snapshot ) {
  console.log("Resyncing")
  var pents = playerents();
  var ments = mobsents();
  var plength = pents.length;
  var mlength = ments.length;
  for(var i = 0; i < plength; i++) {
    for(var x in snapshot) {
      if(snapshot.players[x].tag === pents[i].gamename) {
        pents[i].pos.x = snapshot.players[x].x; 
        pents[i].pos.y = snapshot.players[x].y;
      }
    }
  }
  for(var k = 0; k < mlength; k++) {
    for(var z in snapshot) {
      if(snapshot.mobs[z].tag === ments[k].tag && snapshot.mobs[z].type === ments[k].mob) {
        ments[k].pos.x = snapshot.mobs[z].x;
        ments[k].pos.y = snapshot.mobs[z].y;
      }
    }
  } 
};

var playerents = function() {
  var results = ig.game.getEntitiesByType(EntityPlayer);
      results = results.concat(ig.game.getEntitiesByType(EntityOtherPlayer));
  return results; 
}

var mobsents = function() {
  var results = ig.game.getEntitiesByType(EntityEnemy);
      results = results.concat(ig.game.getEntitiesByType(EntityEnemy2)); 
  return results;
}
