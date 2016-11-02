var Trait = require('simple-traits');
var _ = require('lodash');

var Gravity = Trait({
    position: Trait.required,
    chunkManager: Trait.required,

    gravity: 50,


    updateHandler: function(dt){
      const ground = this.getGround();

      if(this.jumpGoal > 0){
        if(this.position.y < this.jumpGoal){
          this.position.y += (this.gravity*dt);
        }

        if(this.position.y >= this.jumpGoal){
          this.jumpGoal = -1;
        }
        return;
      }

      if(this.position.y <= ground){
        this.position.y = ground;
        this.jumpGoal = 0;
        return;
      }

      if(this.position.y >= ground){
        this.position.y -= (this.gravity*dt);
        return;
      }
    },

    getGround: function(){
      return this.chunkManager.getHeight(this.position.x, this.position.z);
    }
});


module.exports = Gravity;