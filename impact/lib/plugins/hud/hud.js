ig.module(
'plugins.hud.hud'
)
.defines(function() {
	ig.hud = ig.Class.extend({
		canvas: document.getElementById('canvas'),
		context: canvas.getContext('2d'),
		maxHealth: null,

		init: function() {
			ig.Game.inject({
				draw: function() {
					this.parent();
					if (ig.game.getEntitiesByType('EntityPlayer').length !== 0) {
						if (this.hud) {
							//this.hud.number();
							this.hud.bar();
							this.hud.kills();
							this.hud.currentScore();
						}
					}
				}
			});
		},
		// number: function() {
		// 	if (!this.context) {
		// 		return null;
		// 	}
		// 	var player = ig.game.getEntitiesByType('EntityPlayer')[0];
		// 	var context = this.canvas.getContext('2d');
		// 	context.fillStyle = "rgb(0,0,0)";
		// 	context.setAlpha(0.7);
		// 	context.fillRect(10, 10, 100, 30);
		// 	context.fillStyle = "rgb(255, 255, 255)";
		// 	context.font = "15px Arial";
		// 	context.fillText('Health: ' + player.health, 20, 30);
		// 	context.setAlpha(1);
		// 	return null;
		// },
		bar: function() {
			if (!this.context) {
				return null;
			}
			var player = ig.game.getEntitiesByType('EntityPlayer')[0];
			var h = 100*Math.min(player.health / this.maxHealth, 100);
			var context = this.canvas.getContext('2d');
			context.fillStyle = 'rgb(0,0,0)';
			context.setAlpha(0.5);
			context.fillRect(10, 10, 100, 30);
			var color = h < 30 ? "rgb(150, 50, 50)" : "rgb(25,100,150)";
			context.fillStyle = color;
			context.setAlpha(0.9);
			context.fillRect(10, 10, h, 30);
			context.font = "15px Arial";
			context.fillStyle = 'rgb(255, 255, 255)'
			context.fillText(player.health + ' / ' + this.maxHealth, 20, 30);
			context.setAlpha(1);
			return null;
		},
		kills: function() {
			if (!this.context) {
				return null;
			}
			var context = this.canvas.getContext('2d');
			context.fillStyle = "rgb(0,0,0)";
			context.setAlpha(0.5);
			context.fillRect(10, 50, 100, 30);
			context.setAlpha(0.9);
			context.font = "15px Arial";
			context.fillStyle = "rgb(255, 255, 255)";
			context.fillText('Kills: ' + GameInfo.killCount, 20, 75);
			context.setAlpha(1);
			return null;
		},
		currentScore: function() {
			if (!this.context) {
				return null;
			}
			var context = this.canvas.getContext('2d');
			context.fillStyle = "rgb(0,0,0)";
			context.setAlpha(0.5);
			context.fillRect(10, 80, 100, 30);
			context.setAlpha(0.9);
			context.font = "15px Arial";
			context.fillStyle = "rgb(255, 255, 255)";
			context.fillText('Score: ' + GameInfo.score, 20, 95);
			context.setAlpha(1);
			return null;
		},
		setMaxHealth: function(health) {
			this.maxHealth = health;
		}
	});
});