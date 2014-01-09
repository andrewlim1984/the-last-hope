ig.module( // move this to back end later.  LOL NOPE. 
  'plugins.ai'
)
.defines(function() {
  ig.ai = ig.Class.extend({
  
    init: function(entity) {
      ig.ai.ACTION = {Rest: 0, MoveLeft: 1, MoveRight: 2, MoveUp: 3, MoveDown: 4, Attack: 5, Block: 6};
      this.entity = entity;
      this.attackTimer = new ig.Timer(2);
    },
    doAction: function(action) { 
    	this.lastAction = action;
    	return action;
    },

    getAction: function(entity) {
      this.entity = entity;
      var distm = '';
      var closest = {};
          closest.distance = 9000; 
          closest.player = '';
      var playerList = ig.game.getEntitiesByType(EntityOtherPlayer); // refactor the AI to make it make sense. 
      var player_client = ig.game.getEntitiesByType(EntityPlayer); // <-- this part makes no sense in multiplayer =(
      
      for(var i = 0; i < playerList.length; i++) {
        if(this.entity.distanceTo(playerList[i]) <= closest.distance) {
          distm = this.entity.distanceTo(playerList[i]);
          closest.player = playerList[i];
          closest.distance = distm + 0;
        }
      }

      distm = this.entity.distanceTo(player_client[0]);
      if(distm <= closest.distance) {
        closest.player = player_client[0];
        closest.distance = distm; 
      }

      var angle = this.entity.angleTo(closest.player);
      var x_dist = closest.distance * Math.cos(angle);
      var y_dist = closest.distance * Math.sin(angle);
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
      if (closest.distance < 70) {
         if(this.attackTimer.delta()>0) {
          this.attackTimer.set(2);
          return this.doAction(ig.ai.ACTION.Attack);
         }
      }
      if (closest.distance > 30 && closest.distance < 4000) {
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