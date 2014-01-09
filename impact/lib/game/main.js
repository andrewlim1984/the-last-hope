ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	'game.levels.level1',
	'game.entities.player',
	'game.entities.player2',
	'game.entities.enemy',
	'game.entities.enemy2',
	'game.entities.projectile',
	'game.entities.sniperbullet',
	'impact.debug.debug',
	'plugins.ai',
	'plugins.functions.spawnlocations',
	'plugins.functions.spawnlocationsspider',
	'plugins.hud.hud'
)
.defines(function(){
	GameInfo = new function() {
		this.killCount = 0;
		this.score = 0;
	},
    GameEnd = ig.Game.extend({ // GAME END SCREEN. 
		EndImage : new ig.Image('media/endgame.png'),

		init: function() {
			ig.input.bind(ig.KEY.SPACE, "LoadGame");
		},

		update: function() {
			if (ig.input.pressed('LoadGame')) {
				ig.system.setGame(MyGame);
				GameInfo.killCount = 0;
				GameInfo.score = 0;
			}
		},

		draw: function() {
			this.parent();
			var font = new ig.Font('media/04b03.png');
			this.EndImage.draw(0, 0);
			font.draw('HIT SPACE TO RESTART', 300, 550);
		}
    }),
    MissionFail = ig.Game.extend({
		EndImage : new ig.Image('media/missionfail.png'),

		init: function() {
			ig.input.bind(ig.KEY.SPACE, "LoadGame");
		},

		update: function() {
			if (ig.input.pressed('LoadGame')) {
				ig.system.setGame(MyGame);
				GameInfo.killCount = 0;
				GameInfo.score = 0;
			}
		},

		draw: function() {
			this.parent();
			var font = new ig.Font('media/04b03.png');
			this.EndImage.draw(0, 0);
			font.draw('HIT SPACE TO RESTART', 300, 550);
		}
    }),
	MyGame = ig.Game.extend({
		
		font: new ig.Font( 'media/04b03.png' ),
		hud: new ig.hud(),
		spawnTimer: new ig.Timer(2),
		spawnTimerSpider: new ig.Timer(2),
        spaw: new ig.spawnlocations(),
        spawSpiders: new ig.spawnlocationsSpider(),
        paused: false,
        pausing: false,
        showStats: false,
		//spaw: new ig.spawnlocations(),
        choice: prompt('Please choose class: 0 - Machine Gunner, 1 - Sniper'),
		
		addKillCount: function () {
			GameInfo.killCount += 1;
		},

		increaseScore: function(points) {
			GameInfo.score += points;
		},
		
		init: function() {
			var player;
		    if (this.choice === '1') {
		        EntityPlayer = EntityPlayer2
		        player = new EntityPlayer();
		        ig.game.entities[0] = player;
		    }
			ig.input.bind(ig.KEY.P, "pause");
			ig.input.bind(ig.KEY.A, 'left');
			ig.input.bind(ig.KEY.S, 'down');
			ig.input.bind(ig.KEY.W, 'up');
			ig.input.bind(ig.KEY.D, 'right');
			ig.input.bind(ig.KEY.ENTER, 'fire');
			ig.input.bind(ig.KEY.MOUSE1, 'shoot');
		    ig.input.bind(ig.KEY.TAB, 'stats');
			this.loadLevel (LevelLevel1);
			
			player = ig.game.getEntitiesByType('EntityPlayer')[0];
			var mainMusic = new ig.Sound('media/sounds/background.mp3');
    		mainMusic.play();
    		this.hud.setMaxHealth(player.health);
    		this.currentLevel = player.level;
    		this.zombieSpawnNumber = 30;
            this.spiderSpawnNumber = 0;
            this.zombieSpawnFrequency = 2;
            this.spiderSpawnFrequency = 2;
		},
		
		update: function() {
			if(!ig.input.state('pause') && this.pausing) this.pausing=false;

        if (ig.input.state("pause")) {
          if (!this.pausing) {
              this.paused = (this.paused) ? false : true;
              this.pausing = true;
          }
        }

        if (this.paused) return;
          this.parent();
          var player = this.getEntitiesByType(EntityPlayer)[0];
        if (player) {
          this.screen.x = player.pos.x - ig.system.width/2;
          this.screen.y = player.pos.y - ig.system.height/2;
        }
        if (this.currentLevel !== player.level) {
        	this.hud.setMaxHealth(player.health);
        	this.currentLevel = player.level;
        }
        this.zombieSpawnNumber = 30;
        this.spiderSpawnNumber = 0;
        this.zombieSpawnFrequency = 2;
        this.spiderSpawnFrequency = 2;
		if (player.level === 3) {
		  this.spiderSpawnNumber = 10;
		}
		if (player.level === 5) {
		  this.zombieSpawnNumber = 40
		  this.spiderSpawnNumber = 15;
		  this.zombieSpawnFrequency = 1.5;
          this.spiderSpawnFrequency = 1.5;
		}
		if (player.level === 7) {
		  this.zombieSpawnNumber = 50
		  this.spiderSpawnNumber = 25;
		  this.zombieSpawnFrequency = 1;
          this.spiderSpawnFrequency = 1;
		}
		if (player.level === 9) {
		  this.zombieSpawnNumber = 50
		  this.spiderSpawnNumber = 35;
		  this.zombieSpawnFrequency = 0.7;
          this.spiderSpawnFrequency = 0.7;
		}
		if(this.spawnTimer.delta()>0){
        if (this.getEntitiesByType(EntityEnemy).length < this.zombieSpawnNumber) {
          var enemySpawnx = 500 + Math.floor(Math.random()*1100);
  			  var enemySpawny = 400 + Math.floor(Math.random()*800);
  			  this.spaw.spawnIf(enemySpawnx, enemySpawny);
          this.spawnTimer.set(this.zombieSpawnFrequency);
        }
        }
        if (this.spawnTimerSpider.delta()>0) {
          if (this.getEntitiesByType(EntityEnemy2).length < this.spiderSpawnNumber) {
            var enemySpawnx = 500 + Math.floor(Math.random()*1100);
      			var enemySpawny = 400 + Math.floor(Math.random()*800);
      			this.spawSpiders.spawnIf(enemySpawnx, enemySpawny);
            this.spawnTimerSpider.set(this.spiderSpawnFrequency);
          }
        }
		if (ig.input.state('stats')) {
			this.showStats = true;	
			//this.font.draw(this.itemTemp, x+80, y+160, ig.Font.ALIGN.CENTER);
 	  	}
   	    if (ig.input.released('stats')) {
   	    	this.showStats = false;
   	    }
		
		},
		
		draw: function() {
			this.parent();
			var player = ig.game.getEntitiesByType('EntityPlayer')[0];
      	    if (this.showStats) {
              var y = ig.system.height/2 - 20;
		      var x = ig.system.width/2;	
		      this.font.draw("LEVEL: " + player.level, x+80, y);	
		      this.font.draw("ATTACK: " + player.attack, x+80, y+20);
		    }
		},
		gameWon: function () {
          ig.system.setGame(GameEnd);
        },

        gameLost: function() {
          ig.system.setGame(MissionFail);
        }

	});


	// Start the Game with 60fps, a resolution of 320x240, scaled
	// up by a factor of 2
	ig.main( '#canvas', MyGame, 60, 800, 600, 1 );

});
