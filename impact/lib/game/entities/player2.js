ig.module (
  'game.entities.player2'
)

.requires(
  'impact.entity'
)

.defines(function() {

  EntityPlayer2 = ig.Entity.extend({
    size: {x: 22, y: 37},
    offset: {x: 13, y: 7},
    maxVel: {x: 300, y: 300},
    direction: 1,
    type: ig.Entity.TYPE.A,
    netTimer: 10,
    movementSpeed: 150,
    name: 'player',
    gameName: instance_name,
    level: 1,
    attack: 300,
    speed: 150,
    health: 150,
    currentAnimation: '',
    checkAgainst: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.ACTIVE,
    canShoot: false,
    fireCooldown: new ig.Timer(),
    healthRegenerateTimer: new ig.Timer(0.5),
    walkTimer: new ig.Timer(),
    shotTimer: new ig.Timer(),
    levelKills: 5,

    animSheet: new ig.AnimationSheet ('media/sniper.png', 48, 48),
    sound: new ig.Sound( 'media/sounds/sniper.mp3' ),
    walking: new ig.Sound('media/sounds/walking.mp3'),
    levelup: new ig.Sound('media/sounds/levelgain.mp3'),

    init: function(x, y, settings) {
      var canvas = document.getElementById('canvas');
      canvas.style.cursor = 'crosshair';
      this.addAnim('up', 0.21, [9, 10, 11]);
      this.addAnim('down', 0.21, [0, 1, 2]);
      this.addAnim('left', 0.21, [3, 4, 5]);
      this.addAnim('right', 0.21, [6, 7, 8]);
      this.addAnim('idleUp', 0.1, [10]);
      this.addAnim('idleDown', 0.21, [1]);
      this.addAnim('idleLeft', 0.21, [4]);
      this.addAnim('idleRight', 0.21, [7]);
      this.addAnim('fireUp', 0.5, [10]);
      this.addAnim('fireRight', 0.5, [13]);
      this.addAnim('fireDown', 0.5, [25]);
      this.addAnim('fireLeft', 0.5,[16])
      this.currentAnim = this.anims.idledown;
      this.currentHealth = this.health;

      socket.emit('initializePlayer', this.gameName, this.pos.x, this.pos.y);

      this.parent(x, y, settings);

    },

    update: function() {
     if (GameInfo.killCount === this.levelKills) {
        this.levelup.play();
        this.levelKills = this.levelKills*2;
        this.level = this.level + 1;
        this.attack = Math.round(this.attack * 1.05);
        this.health = Math.round(this.currentHealth * 1.05);
        this.currentHealth = this.health;
      }
      if (ig.input.state('left') && ismove != 1 && ismove != 2 && ismove != 4) {
        if (this.walkTimer.delta() > 0) {
          this.walking.play();
          this.walkTimer.set(0.5);
        }
        this.vel.x = -this.speed;
        ismove = 3;
        this.direction = 3;
        this.currentAnim = this.anims.left;
        this.currentAnimation = 3;
      } else if (ig.input.state('right') && ismove != 1 && ismove != 3 && ismove != 4) {
        if (this.walkTimer.delta() > 0) {
          this.walking.play();
          this.walkTimer.set(0.5);
        }
        this.vel.x = +this.speed;
        ismove = 2;
        this.direction = 2;
        this.currentAnim = this.anims.right;
        this.currentAnimation = 4;
      } else if (ig.input.state('up') && ismove != 2 && ismove != 3 && ismove != 4) {
        if (this.walkTimer.delta() > 0) {
          this.walking.play();
          this.walkTimer.set(0.5);
        }
        this.vel.y = -this.speed;
        ismove = 1;
        this.direction = 1;
        this.currentAnim = this.anims.up;
        this.currentAnimation = 1;
      } else if (ig.input.state('down') && ismove != 2 && ismove != 3 && ismove != 1) {
        if (this.walkTimer.delta() > 0) {
          this.walking.play();
          this.walkTimer.set(0.5);
        }
        this.vel.y = +this.speed;
        ismove = 4;
        this.direction = 4;
        this.currentAnim = this.anims.down;
        this.currentAnimation = 2;
      } else {
        this.vel.x = 0;
        this.vel.y = 0;
        ismove = 0;

        if (this.direction === 4) {
          this.currentAnim = this.anims.idleDown;
          this.currentAnimation = 6;
        }
        if (this.direction === 3) {
          this.currentAnim = this.anims.idleLeft;
          this.currentAnimation = 7;
        }
        if (this.direction === 2) {
          this.currentAnim = this.anims.idleRight;
          this.currentAnimation = 8;
        }
        if (this.direction === 1) {
          this.currentAnim = this.anims.idleUp;
          this.currentAnimation = 5;
        }
      }
      if(this.fireCooldown.delta()>0){
        this.canShoot = true;
        this.fireCooldown.set(5);
      }
      if( ig.input.state('shoot') ) { //Basic shoot command
        var mx = (ig.input.mouse.x + ig.game.screen.x); //Figures out the x coord of the mouse in the entire world
        var my = (ig.input.mouse.y + ig.game.screen.y); //Figures out the y coord of the mouse in the entire world

        var r = Math.atan2(my-this.pos.y, mx-this.pos.x); //Gives angle in radians from player's location to the mouse location, assuming directly right is 0
        if (r > -2.5 && r < -0.5) {
          this.currentAnim = this.anims.idleUp;

          if (ig.input.released('shoot')) {
            if (this.shotTimer.delta()>0) {
              this.sound.play();
              this.currentAnim = this.anims.fireUp;
              ig.game.spawnEntity( EntitySniperBullet, this.pos.x +15, this.pos.y, {angle:r}); 
              this.direction = 1;
              this.shotTimer.set(1.5);
            }
          }
        } else if (r > -0.5 && r < 0.7) {
          this.currentAnim = this.anims.idleRight;
          if (ig.input.released('shoot')) {
            if (this.shotTimer.delta()>0) {
              this.sound.play();
              this.currentAnim = this.anims.fireRight;
              ig.game.spawnEntity( EntitySniperBullet, this.pos.x+35, this.pos.y+10, {angle:r});
              this.direction = 2;  
              this.shotTimer.set(1.5);
            }
          }
        } else if (r > -0.7 && r < 2.5) {
          this.currentAnim = this.anims.idleDown;
          if (ig.input.released('shoot')) {
            if (this.shotTimer.delta()>0) {
              this.sound.play();
              this.currentAnim = this.anims.fireDown;
              ig.game.spawnEntity( EntitySniperBullet, this.pos.x + 10, this.pos.y +30, {angle:r});
              this.direction = 4;
              this.shotTimer.set(1.5);
            }
          }
        } else if (r < -2.5 || r > 2.5) {
          this.currentAnim = this.anims.idleLeft;
          if (ig.input.released('shoot')) {
            if (this.shotTimer.delta()>0) {
              this.sound.play();
              this.currentAnim = this.anims.fireLeft;
              ig.game.spawnEntity( EntitySniperBullet, this.pos.x -20, this.pos.y +10, {angle:r});
              this.direction = 3;
              this.shotTimer.set(1.5);
            }
          }
        }
      }
      if (this.netTimer < 1) {
        this.netTimer = 5;
        socket.emit('recieveData', this.pos.x, this.pos.y, this.currentAnimation, this.gameName);
      }
      this.netTimer = this.netTimer - 1;
      if (this.health < this.currentHealth) {
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
    
    animSheet: new ig.AnimationSheet ('media/sniper.png', 48, 48),

    init: function(x, y, settings) {

      var canvas = document.getElementById('canvas');
      canvas.style.cursor = 'crosshair';
      this.addAnim('up', 0.21, [9, 10, 11]);
      this.addAnim('down', 0.21, [0, 1, 2]);
      this.addAnim('left', 0.21, [3, 4, 5]);
      this.addAnim('right', 0.21, [6, 7, 8]);
      this.addAnim('idleUp', 0.1, [10]);
      this.addAnim('idleDown', 0.21, [1]);
      this.addAnim('idleLeft', 0.21, [4]);
      this.addAnim('idleRight', 0.21, [7]);
      this.addAnim('fireUp', 0.5, [10]);
      this.addAnim('fireRight', 0.5, [13]);
      this.addAnim('fireDown', 0.5, [25]);
      this.addAnim('fireLeft', 0.5,[16])
      this.currentAnim = this.anims.idledown;
      this.currentHealth = this.health;
      this.currentAnim = this.anims.idleup;

      this.parent(x, y, settings);

    },
   
    update: function() {
      this.currentAnim = this.anims[this.animation]; // So delicious. 
      this.parent();
    }


  });

})