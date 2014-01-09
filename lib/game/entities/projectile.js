ig.module(
  'game.entities.projectile'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityProjectile = ig.Entity.extend({
    size: {x: 8, y: 4},
    offset: {x: 8, y: 6},
    maxVel: {x: 600, y: 600},
    type: ig.Entity.TYPE.A,
    checkAgainst: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.NONE,
    lifeTime: 0,
    bounciness: 1,
    direction: '',

    animSheet: new ig.AnimationSheet('media/bullet.png', 16, 16),

    init: function(x, y, settings) {
      this.player = ig.game.getEntitiesByType('EntityPlayer')[0];
      this.parent(x, y, settings); 
      direction = settings;
      if (direction === 2) {
        this.addAnim('shootRight', 0.2, [0]);
        this.vel.y = +(Math.floor(Math.random() < 0.5 ? Math.random()*50 : -Math.random()*50));
        this.vel.x = +600;
        currentPosition = this.pos.x;
        this.direction = 'right';
      } else if (direction === 4) {
        this.addAnim('shootDown', 0.2, [1]);
        this.vel.x = +(Math.floor(Math.random() < 0.5 ? Math.random()*50 : -Math.random()*50));
        this.vel.y = +600;
        currentPosition = this.pos.y;
        this.direction = 'down';
      } else if (direction === 3) {
        this.addAnim('shootLeft', 0.2, [3]);
        this.vel.y = -(Math.floor(Math.random() < 0.5 ? Math.random()*50 : -Math.random()*50));
        this.vel.x = -600;
        currentPosition = this.pos.x;
        this.direction = 'left';
      } else if (direction === 1) {
        this.addAnim('shootUp', 0.2, [2]);
        this.vel.x = -(Math.floor(Math.random() < 0.5 ? Math.random()*50 : -Math.random()*50));
        this.vel.y = -600;
        currentPosition = this.pos.y;
        this.direction = 'up';
      }
    },
    handleMovementTrace: function(res) {
      this.parent(res);
      if (res.collision.x || res.collision.y) {
        this.kill();
      }
    },
    update: function() {
      if (this.lifeTime <= 20) {
        this.lifeTime += 1;
      } else {
        this.kill();
      }
      this.parent();
    },
    check: function(other) {
      other.receiveDamage(this.player.attack, this);
      this.kill();
      this.parent();
    } 
  });
});