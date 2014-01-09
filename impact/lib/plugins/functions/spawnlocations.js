ig.module(
  'plugins.functions.spawnlocations'
)
.defines(function() {
  ig.spawnlocations = ig.Class.extend({
    spawnIf: function(x, y) {
    	if (/*this.CollisionAt(x, y) || */this.getEntitiesAt(x, y)) {
    		var x1 = Math.floor(Math.random()*1350);
    		var x2 = Math.floor(Math.random()*900);
    		this.spawnIf(x1, x2);
    	}
    	ig.game.spawnEntity('EntityEnemy', x, y);
    },
    getEntitiesAt: function(x, y) {
    	var n = ig.game.entities.length;
    	var ents = [];
    	for (var i = 0; i < n; i++) {
    		var ent = ig.game.entities[i],
    		x0 = ent.pos.x,
    		x1 = x0 + ent.size.x,
    		y0 = ent.pos.y,
    		y1 = y0 + ent.size.y;
    		if (x0 <= x && x1 > x && y0 <= y && y1 > y) {
    			return true;
    		}
    	}
    	return false;
    },
    CollisionAt: function(x, y) {
    	var Map = ig.game.collisionMap;
    	var ent = new EntityEnemy();
    	var res = Map.trace(x, y, x + ent.size.x, y + ent.size.y, ent.size.x, ent.size.y);
    	return res.collision.x || res.collision.y;
    }
  });
})