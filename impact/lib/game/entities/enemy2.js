ig.module(
  'game.entities.enemy2'
)
.requires(
  'impact.entity',
  'plugins.ai'
)
.defines(function() {
  EntityEnemy2 = ig.Entity.extend({
    size: {x: 24, y: 30},
    direction: '',
    collides: ig.Entity.COLLIDES.ACTIVE,
    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.A,
    mob: 'EntityEnemy2', // I should just change this to the Entity name =/
    animation: '',
    health: 500,
    pts: 100,
    lastHit: 'None',
    speed: 30,
    tag: '', // This and the the last one at the way bottom are the most important
    		// Tag allows us to assign unique IDs which is important for the database and data handling in general.
    animSheet: new ig.AnimationSheet('media/spider.png', 48, 48),

    init: function(x, y, settings) {
    	this.addAnim('idleDown', 0.2, [0]);
    	this.addAnim('idleLeft', 0.2, [5]);
    	this.addAnim('idleRight', 0.2, [9]);
    	this.addAnim('idleUp', 0.2, [13]);
    	this.addAnim('zombieDown', 0.2, [0,1,2]);
    	this.addAnim('zombieLeft', 0.2, [4,5,6]);
    	this.addAnim('zombieRight', 0.2, [8,9,10]);
    	this.addAnim('zombieUp', 0.2, [12,13,14]);
    	this.addAnim('spitUp', 0.9, [15, 15, 15, 13, 13, 15, 15, 15, 13, 13]);
    	this.addAnim('spitDown', 0.9, [3, 3, 3, 1, 1, 3, 3, 1, 1, 1]);
    	this.addAnim('spitLeft', 0.9, [7, 7, 7, 5, 5, 7, 7, 7, 5, 5]);
    	this.addAnim('spitRight', 0.9, [11, 11, 11, 9, 9, 11, 11, 11, 9, 9]);



        ai = new ig.ai(this);
    	this.parent(x, y, settings);
    },

    update: function() {
    	var action = ai.getAction(this);
    	switch(action) {
		case ig.ai.ACTION.Rest:
		  if (this.direction === 'up') {
			this.currentAnim = this.anims.idleUp;
			this.animation = 'idleUp';
		  } else if (this.direction === 'down') {
		    this.currentAnim = this.anims.idleDown;
		    this.animation = 'idleDown';
		  } else if (this.direction === 'left') {
			this.currentAnim = this.anims.idleLeft;
			this.animation = 'idleLeft';
		  } else if (this.direction === 'right') {
			this.currentAnim = this.anims.idleRight;
			this.animation = 'idleRight';
		  } else {
		  	this.currentAnim = this.anims.idleDown;
		  	this.animation = 'idleDown';
		  }
		this.vel.x = 0;
		this.vel.y = 0;
		break;
		case ig.ai.ACTION.MoveLeft:
		this.currentAnim = this.anims.zombieLeft;
		this.vel.x = -this.speed;
		this.direction = 'left';
		this.animation = 'zombieLeft';
		break;
		case ig.ai.ACTION.MoveRight:
		this.currentAnim = this.anims.zombieRight;
		this.vel.x = this.speed;
		this.direction = 'right';
		this.animation = 'zombieRight';
		break;
		case ig.ai.ACTION.MoveUp:
		this.currentAnim = this.anims.zombieUp;
		this.vel.y = -this.speed;
		this.direction = 'up';
		this.animation = 'zombieUp';
		break;
		case ig.ai.ACTION.MoveDown:
		this.currentAnim = this.anims.zombieDown;
		this.vel.y = this.speed;
		this.direction = 'down';
		this.animation = 'zombieDown';
		break;
		case ig.ai.ACTION.Attack:
		 if (this.animation === 'zombieLeft') {
		 	this.currentAnim = this.anims.spitLeft;
		 	this.animation = 'spitLeft';
		 } else if (this.animation === 'zombieRight') {
            this.currentAnim = this.anims.spitRight;
		 	this.animation = 'spitRight';
		 } else if (this.animation === 'zombieUp') {
            this.currentAnim = this.anims.spitUp;
		 	this.animation = 'spitUp';
		 } else if (this.animation === 'zombieDown') {
		 	this.currentAnim = this.anims.spitDown;
		 	this.animation = 'spitDown';
		 }
		this.vel.x = 0;
		this.vel.y = 0;
		ig.game.getEntitiesByType('EntityPlayer')[0].receiveDamage(30, this); 
		break; // We're probably gonna have to change this later since everyone's entityPlayer should be
		default: // Different or maybe not, I need to test it. But we prob. need a more precise way of dealing.
		this.currentAnim = idle; // my last comments will beo n the AI.
		this.vel.x = 0;
		this.vel.y = 0;
		this.animation = 'idle';
		break;
    	}
    	this.parent();
    },
    kill: function( removal ) {
    	if(removal !== undefined) {
          console.log('Despawning');
          return;
        };
    	ig.game.increaseScore(100); //adds to score
    	ig.game.addKillCount(); //adds to kill count
    	if (GameInfo.score === 1000) {//Game is WON!
    		ig.game.gameWon();
    	}
    	socket.emit("score", this.lastHit, this.pts);
    	socket.emit("mob_death", {mob: this.mob, tag: this.tag}); // Tells the server who killed the guy and the points. 
    	this.parent();
    }
  });

});