ig.module(
  'game.entities.enemy'
)
.requires(
  'impact.entity',
  'plugins.ai'
)
.defines(function() {
  EntityEnemy = ig.Entity.extend({
    size: {x: 24, y: 30},
    collides: ig.Entity.COLLIDES.ACTIVE,
    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.A,
    animation: '',
    health: 500,
    pts: 100,
    lastHit: 'None',
    speed: 30,
    tag: '', // This and the the last one at the way bottom are the most important
    		// Tag allows us to assign unique IDs which is important for the database and data handling in general.
    animSheet: new ig.AnimationSheet('media/zombie.png', 32, 32),
    zombieClose: new ig.Sound('media/sounds/zombieClose.mp3'),
    zombieDead: new ig.Sound('media/sounds/zombieDead.mp3'),
    zombie1: new ig.Sound('media/sounds/zombie1.mp3'),
    zombie1: new ig.Sound('media/sounds/zombie2.mp3'),
    zombieSoundTimer: new ig.Timer(10),

    init: function(x, y, settings) {
    	this.addAnim('idle', 1, [0]);
    	this.addAnim('zombieDown', 0.2, [0,1,2]);
    	this.addAnim('zombieLeft', 0.2, [3,4,5]);
    	this.addAnim('zombieRight', 0.2, [6,7,8]);
    	this.addAnim('zombieUp', 0.2, [9,10,11]);

        ai = new ig.ai(this);
    	this.parent(x, y, settings);
    },

    update: function() {
    	var action = ai.getAction(this);
    	switch(action) {
		case ig.ai.ACTION.Rest:
		this.currentAnim = this.anims.idle;
		this.vel.x = 0;
		this.vel.y = 0;
		this.animation = 'idle';
		break;
		case ig.ai.ACTION.MoveLeft:
		this.currentAnim = this.anims.zombieLeft;
		this.vel.x = -this.speed;
		this.animation = 'zombieLeft';
		break;
		case ig.ai.ACTION.MoveRight:
		this.currentAnim = this.anims.zombieRight;
		this.vel.x = this.speed;
		this.animation = 'zombieRight';
		break;
		case ig.ai.ACTION.MoveUp:
		this.currentAnim = this.anims.zombieUp;
		this.vel.y = -this.speed;
		this.animation = 'zombieUp';
		break;
		case ig.ai.ACTION.MoveDown:
		this.currentAnim = this.anims.zombieDown;
		this.vel.y = this.speed;
		this.animation = 'zombieDown';
		break;
		case ig.ai.ACTION.Attack:
        this.zombieClose.play();
		this.currentAnim = this.anims.idle;
		this.vel.x = 0;
		this.vel.y = 0;
		this.animation = 'idle';
		ig.game.getEntitiesByType('EntityPlayer')[0].receiveDamage(30, this); 
		break; // We're probably gonna have to change this later since everyone's entityPlayer should be
		default: // Different or maybe not, I need to test it. But we prob. need a more precise way of dealing.
		this.currentAnim = idle; // my last comments will beo n the AI.
		this.vel.x = 0;
		this.vel.y = 0;
		this.animation = 'idle';
		break;
    	}
        if (this.zombieSoundTimer.delta()>0) {
          var chooseSound = Math.floor(Math.random()*2)
          if (chooseSound === 1) {
            this.zombie1.play();
          } else {
            this.zombie2.play();
          }
          this.zombieSoundTimer.set(10);
        }
    	this.parent();
    },
    kill: function() {
        this.zombieDead.play();
    	ig.game.increaseScore(100); //adds to score
    	ig.game.addKillCount(); //adds to kill count
    	if (GameInfo.score === 10000) {//Game is WON!
    		ig.game.gameWon();
    	}
    	socket.emit("score", this.lastHit, this.pts); // Tells the server who killed the guy and the points. 
    	this.parent();
    }
  });

});