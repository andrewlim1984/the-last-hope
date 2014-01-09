ig.module(
  'game.entities.sniperbullet'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntitySniperBullet = ig.Entity.extend({
    size: {x: 8, y: 9},
    maxVel: {x: 900, y: 900},
    type: ig.Entity.TYPE.A,
    checkAgainst: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.NONE,
    bounciness: 1,
    direction: '',

    animSheet: new ig.AnimationSheet('media/sniperbullet.png', 8, 9),

    init: function(x, y, settings) {
      this.player = ig.game.getEntitiesByType('EntityPlayer')[0];
      this.parent(x, y, settings); 
      direction = settings;
      this.addAnim('bullet', 0.2, [0]);
      var vely = Math.sin(this.angle) * 700;
      var velx =  Math.cos(this.angle) * 700;
      this.maxVel.x = this.vel.x = this.accel.x = velx;
      this.maxVel.y = this.vel.y = this.accel.y = vely;
    },
    handleMovementTrace: function(res) {
      this.parent(res);
      if (res.collision.x || res.collision.y) {
        this.kill();
      }
    },
    update: function() {
      this.parent();
    },
    check: function(other) {
      other.receiveDamage(this.player.attack, this);
      this.kill();
      this.parent();
    } 
  });
});