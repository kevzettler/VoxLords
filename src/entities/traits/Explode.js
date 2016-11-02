var Trait = require('simple-traits');
var _ = require('lodash');

var Explode = Trait({
  mesh: Trait.require,
  
  explode: function(){
    // if(this.size < 0.3) {
    //     return;
    // }

    var block;
    for(var i = 0; i < 5; i++) {
        // block = game.physBlockPool.Get();
        // if(block != undefined) {
            block.Create(this.mesh.position.x+Math.random()*1,
                         this.mesh.position.y+Math.random()*1, 
                         this.mesh.position.z+Math.random()*1,
                         this.size/2,
                         0,
                         0,
                         0,
                         2,
                         Math.random()*180,
                         5);
//        }
    }
  },

  updateHandler: function(){

  },
});