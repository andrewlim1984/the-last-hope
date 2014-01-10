ig.module(
  'plugins.ai'
)
.defines(function() {
  ig.ai = ig.Class.extend({
  
    init: function(entity) {
      ig.ai.ACTION = {Rest: 0, MoveLeft: 1, MoveRight: 2, MoveUp: 3, MoveDown: 4, Attack: 5, Block: 6};
      this.entity = entity;
      this.attackTimer = new ig.Timer();
    },
    doAction: function(action) {
    	this.lastAction = action;
    	return action;
    },

    getAction: function(entity) {
      this.entity = entity;
      var playerList = ig.game.getEntitiesByType('EntityPlayer');
      var player = playerList[0];
      var distance = this.entity.distanceTo(player);
      var angle = this.entity.angleTo(player);
      var x_dist = distance * Math.cos(angle);
      var y_dist = distance * Math.sin(angle);
      var collision = ig.game.collisionMap;
      var res = collision.trace(this.entity.pos.x, this.entity.pos.y, x_dist, y_dist, this.entity.size.x, this.entity.size.y);
      if (res.collision.x) {
        if (angle > 0) {
          return this.doAction(ig.ai.ACTION.MoveUp);
        } else {
          return this.doAction(ig.ai.ACTION.MoveDown);
        }
      }
      if (res.collision.y) {
        if (Math.abs(angle) > Math.PI/2) {
          return this.doAction(ig.ai.ACTION.MoveLeft);
        } else {
          return this.doAction(ig.ai.ACTION.MoveRight);
        }
      }
      if (distance < 30) {
        if (this.attackTimer.delta()>0) {
          this.attackTimer.set(2);
          return this.doAction(ig.ai.ACTION.Attack);
        }
      }
      if (distance > 30 && distance < 4000) {
        if (Math.abs(angle) < Math.PI / 4) {
          return this.doAction(ig.ai.ACTION.MoveRight);
        }
        if (Math.abs(angle) > 3 * Math.PI / 4) {
          return this.doAction(ig.ai.ACTION.MoveLeft);
        }
        if (angle < 0) {
          return this.doAction(ig.ai.ACTION.MoveUp);
        }
        return this.doAction(ig.ai.ACTION.MoveDown);
      }
      return this.doAction(ig.ai.ACTION.Rest);
    }
  });
});