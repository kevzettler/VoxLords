const Trait = require('simple-traits');
const _ = require('lodash');

module.exports = Trait({
  life: 3,

  hit(){
    this.life -= 1;
    
    if(this.life <= 0){
      this.chunk.Explode(this.mesh.position, this.scale, this.world);
      this.remove();
    }

  }
});