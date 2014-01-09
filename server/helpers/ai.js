var Firebase = require('firebase')
var trigger = false;
exports.ai = {

   'render': function( client, fb) {
      
   	  var z_sum = [];
      fb.on('value', function( data ) {
          var result = data.val();
       //  var dat = data.val();
      	// var z_sum = {x: dat.x, y: dat.x, settings:{ tag: dat.tag, animation: dat.animation}};
        if(!trigger) {
          console.log("Render Should only happen once");
          client.emit('zrender', result);
          trigger = true;
        }		
      });
   },

   'spawner': function( fb ) { // This is called once somewhere. This fills a room/instance with
       if(!trigger) {          // zombies.  Right now it's on client side detection that will change.. soon. 
         for(var i = 0; i < 20; i++) { // or not. 
           fb.child(i).set({     // Note: GAME_CLIENT JS IS SUPER IMPORTANT READ THAT. 
             x: Math.floor(Math.random()*1350),
             y: Math.floor(Math.random()*900),
             animation: 'idle',
             health: 500,
             settings: {tag: i}
           });
         } 
       }
   }
}
