ig.module(
  'game.entities.projectile'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityProjectile = ig.Entity.extend({
    size: {x: 8, y: 4},
    offset: {x: 8, y: 6}, //offset to make sure that the bullets are firing from the correct location
    maxVel: {x: 600, y: 600},
    type: ig.Entity.TYPE.A,
    checkAgainst: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.NONE,
    lifeTime: 0,
    bounciness: 1,
    direction: '',
    owner:'', // Gotta' have an owner to figure out whose bullet this is. 

    animSheet: new ig.AnimationSheet('media/bullet.png', 16, 16),

    init: function(x, y, settings) {
      this.parent(x, y, settings); 

      if (this.direction === 2) {
        this.addAnim('shootRight', 0.2, [0]);
        this.vel.y = +(Math.floor(Math.random() < 0.5 ? Math.random()*50 : -Math.random()*50)); //more accurately spreads the fire
        this.vel.x = +600;
        currentPosition = this.pos.x;
        this.direction = 'right';
      } else if (this.direction === 4) {
        this.addAnim('shootDown', 0.2, [1]);
        this.vel.x = +(Math.floor(Math.random() < 0.5 ? Math.random()*50 : -Math.random()*50));
        this.vel.y = +600;
        currentPosition = this.pos.y;
        this.direction = 'down';
      } else if (this.direction === 3) {
        this.addAnim('shootLeft', 0.2, [3]);
        this.vel.y = +(Math.floor(Math.random() < 0.5 ? Math.random()*50 : -Math.random()*50));
        this.vel.x = -600;
        currentPosition = this.pos.x;
        this.direction = 'left';
      } else if (this.direction === 1) {
        this.addAnim('shootUp', 0.2, [2]);
        this.vel.x = +(Math.floor(Math.random() < 0.5 ? Math.random()*50 : -Math.random()*50));
        this.vel.y = -600;
        currentPosition = this.pos.y;
        this.direction = 'up';
      }
    },
    update: function() {
      if (this.lifeTime <= 20) {
      	this.lifeTime += 1;
      } else {
      	this.kill();
      }
      if ((this.vel.x < 0 && this.direction === 'right') || (this.vel.x > 0 && this.direction === 'left') || (this.vel.y > 0 && this.direction === 'up') || (this.vel.y < 0 && this.direction === 'down')) {
      	this.kill();
      }
      this.parent();
    },
    check: function(other) {
      other.lastHit = this.owner; // When it hits a zombie, it marks the zombie as "I hit it last"
      other.receiveDamage(100, this); // This is critical for figuring out who gets what. 
      this.kill();
      this.parent();
    } 
  });
});