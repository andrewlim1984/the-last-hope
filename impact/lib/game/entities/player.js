ig.module (
  'game.entities.player'
)

.requires(
  'impact.entity'
)

.defines(function() {

  EntityPlayer = ig.Entity.extend({
  	size: {x: 22, y: 37}, //more accurately depicts collisions
    offset: {x: 13, y: 7}, //helps with collision accuracy
    maxVel: {x: 300, y: 300}, //gives us more breathing room for increasing max movement speed
    direction: 1,
    messageBox: "",
    type: ig.Entity.TYPE.A,
    netTimer: 10,
    movementSpeed: 100,
    name: 'player',
    gamename: instance_name,
    messageBoxTimer: 200,
  	speed: 100,
    health: 200,
    currentAnimation: '', // This is the biggest change here, I use a hash/object for animations
    checkAgainst: ig.Entity.TYPE.B, // We really don't need giant switch statements =( 
    collides: ig.Entity.COLLIDES.ACTIVE,
    canShoot: false,
    fireCooldown: new ig.Timer(),
    healthRegenerateTimer: new ig.Timer(0.5),

  	animSheet: new ig.AnimationSheet ('media/main1.png', 48, 48), //this will now be our primary character

  	init: function(x, y, settings) { //animation frame changes

  	  this.addAnim('up', 0.21, [9, 10, 11]);
      this.addAnim('down', 0.21, [0, 1, 2]);
      this.addAnim('left', 0.21, [3, 4, 5]);
      this.addAnim('right', 0.21, [6, 7, 8]);
      this.addAnim('idleup', 0.1, [10]);
      this.addAnim('idledown', 0.21, [1]);
      this.addAnim('idleleft', 0.21, [4]);
      this.addAnim('idleright', 0.21, [7]);
      this.addAnim('fireright', 0.05, [12, 6, 12, 6, 13, 7, 13, 7, 14, 8, 14, 8]);
      this.addAnim('fireidleright', 0.05, [22, 7, 22, 7, 13, 7, 13, 7, 22, 7, 22, 7]);
      this.addAnim('firedown', 0.05, [24, 0, 24, 0, 25, 1, 25, 1, 26, 2, 26, 2]);
      this.addAnim('fireidledown', 0.05, [25, 1, 25, 1, 18, 1, 18, 1, 25, 1, 25, 1]);
      this.addAnim('fireleft', 0.05, [15, 3, 15, 3, 16, 4, 16, 4, 17, 5, 17, 5]);
      this.addAnim('fireidleleft', 0.05, [16, 4, 16, 4, 19, 4, 19, 4, 16, 4, 16, 4]);
      //this.addAnim('fireup', 0.01, [9,9,9,9,10,10,10,10,11,11,11,11]);
      this.addAnim('fireidleup', 0.05, [10]);
      this.currentAnim = this.anims.idleup;

      socket.emit('initializePlayer', this.gamename);

  	  this.parent(x, y, settings);

  	},

  	update: function() {
      if (!ig.input.state('fire')) {
        this.speed = 100;
      }
      if (ig.input.state('left') && ismove != 1 && ismove != 2 && ismove != 4) {
        this.vel.x = -this.speed;
        ismove = 3;
        this.direction = 3;
        if (!ig.input.state('fire')) {//fixes bug with animation of walking and firing mixing up together
          this.currentAnim = this.anims.left;
        }
        this.currentAnimation = 'left';
      } else if (ig.input.state('right') && ismove != 1 && ismove != 3 && ismove != 4) {
        this.vel.x = +this.speed;
        ismove = 2;
        this.direction = 2;
        if (!ig.input.state('fire')) {
          this.currentAnim = this.anims.right;
        }
        this.currentAnimation = 'right';
      } else if (ig.input.state('up') && ismove != 2 && ismove != 3 && ismove != 4) {
        this.vel.y = -this.speed;
        ismove = 1;
        this.direction = 1;
        if (!ig.input.state('fire')) {
          this.currentAnim = this.anims.up;
        }
        this.currentAnimation = 'up';
      } else if (ig.input.state('down') && ismove != 2 && ismove != 3 && ismove != 1) {
        this.vel.y = +this.speed;
        ismove = 4;
        this.direction = 4;
        if (!ig.input.state('fire')) {
          this.currentAnim = this.anims.down;
        }
        this.currentAnimation = 'down';
      } else {
      	this.vel.x = 0;
      	this.vel.y = 0;
      	ismove = 0;

        if (this.direction === 4 && !ig.input.state('fire')) { //helps with fixing animation conflicts
          this.currentAnim = this.anims.idledown;
          this.currentAnimation = 'idledown';
        }
        if (this.direction === 3 && !ig.input.state('fire')) {
          this.currentAnim = this.anims.idleleft;
          this.currentAnimation = 'idleleft';
        }
        if (this.direction === 2 && !ig.input.state('fire')) {
          this.currentAnim = this.anims.idleright;
          this.currentAnimation = 'idleright';
        }
        if (this.direction === 1 && !ig.input.state('fire')) {
          this.currentAnim = this.anims.idleup;
          this.currentAnimation = 'idleup';
        }
      }
      if(this.fireCooldown.delta()>0){
        this.canShoot = true;
        this.fireCooldown.set(0.1);  // I changed the bottom stuff so it emits to the server
      }
      if (ig.input.state('fire') && this.canShoot) {
        this.speed = 70;
        if (this.direction === 2) {
          socket.emit('firing', this.pos.x+35, this.pos.y+15, this.direction, 'fireright', this.gamename)
          if (ig.input.state('right')) { //THIS IS VERY NECESSARY FOR CLEAN ANIMATION!
            this.currentAnim = this.anims.fireright;
          } else {
            this.currentAnim = this.anims.fireidleright;
          }
        } else if (this.direction === 4) {
          socket.emit('firing', this.pos.x+5, this.pos.y+35, this.direction, 'firedown', this.gamename)
          if (ig.input.state('down')) {
            this.currentAnim = this.anims.firedown;
          } else {
            this.currentAnim = this.anims.fireidledown;
          }
        } else if (this.direction === 3) {
          socket.emit('firing', this.pos.x-20, this.pos.y+15, this.direction, 'fireleft', this.gamename)
          if (ig.input.state('left')) {
            this.currentAnim = this.anims.fireleft;
          } else {
            this.currentAnim = this.anims.fireidleleft;
          }
        } else if (this.direction === 1) {
          socket.emit('firing', this.pos.x+15, this.pos.y-15, this.direction, 'fireup', this.gamename)
          if (ig.input.state('up')) {
            this.currentAnim = this.anims.up;
          } else {
            this.currentAnim = this.anims.fireidleup;
          }
        }
        this.canShoot = false;
      }
      if (this.netTimer < 1) {
        this.netTimer = 2;
        socket.emit('updatemove', this.pos.x, this.pos.y, this.currentAnimation, this.gamename, this.vel.x, this.vel.y);
      }
      this.netTimer = this.netTimer - 1;
      if (this.health < 200) {
        if (this.healthRegenerateTimer.delta() > 0) {
          this.health += 1;
          this.healthRegenerateTimer.set(0.5);
        }
      }
      this.parent();
      if (this.health < 1) {
        ig.game.gameLost();
      }
    },
    kill: function() {
      ig.game.gameLost();
    }

  });

  EntityOtherPlayer = ig.Entity.extend({
    size: {x: 22, y: 37},
    offset: {x: 13, y: 7},
    type: ig.Entity.TYPE.A, // Since we used the tutorial code this TYPE A was a TYPE B
    name: 'otherplayer', // and kept killing players and despawning them haha
    gamename: '',   // It took me forever to figure out why my character was despawning when I was shooting with  an ally
    animation: 'idleup', // Small shit man, small shit that gets you =( 
    destinationx: 99999999,
    destinationy: 99999999,
    collides: ig.Entity.COLLIDES.PASSIVE,
    direction: 0,
    
    animSheet: new ig.AnimationSheet ('media/main1.png', 48, 48),

    init: function(x, y, settings) {

      this.addAnim('up', 0.21, [9, 10, 11]);
      this.addAnim('down', 0.21, [0, 1, 2]);
      this.addAnim('left', 0.21, [3, 4, 5]);
      this.addAnim('right', 0.21, [6, 7, 8]);
      this.addAnim('idleup', 0.1, [10]);
      this.addAnim('idledown', 0.21, [1]);
      this.addAnim('idleleft', 0.21, [4]);
      this.addAnim('idleright', 0.21, [7]);
      this.addAnim('fireright', 0.05, [12, 6, 12, 6, 13, 7, 13, 7, 14, 8, 14, 8]);
      this.addAnim('fireidleright', 0.05, [22, 7, 22, 7, 13, 7, 13, 7, 22, 7, 22, 7]);
      this.addAnim('firedown', 0.05, [24, 0, 24, 0, 25, 1, 25, 1, 26, 2, 26, 2]);
      this.addAnim('fireidledown', 0.05, [25, 1, 25, 1, 18, 1, 18, 1, 25, 1, 25, 1]);
      this.addAnim('fireleft', 0.05, [15, 3, 15, 3, 16, 4, 16, 4, 17, 5, 17, 5]);
      this.addAnim('fireidleleft', 0.05, [16, 4, 16, 4, 19, 4, 19, 4, 16, 4, 16, 4]);
      //this.addAnim('fireup', 0.01, [9,9,9,9,10,10,10,10,11,11,11,11]);
      this.addAnim('fireidleup', 0.05, [10]);
      this.currentAnim = this.anims.idleup;

      this.parent(x, y, settings);

    },
   
    update: function() {
      this.currentAnim = this.anims[this.animation]; // So delicious. 
      this.parent();
    }


  });

})