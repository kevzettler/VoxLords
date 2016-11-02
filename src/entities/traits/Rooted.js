const Trait = require('simple-traits');
const _ = require('lodash');

module.exports = Trait({
  updateHandler(dt){
    if(!this.chunkManager.getHeight(this.position.x, this.position.z)){
      this.chunk.Explode(this.mesh.position, this.scale, this.world);
      this.remove();
    }
  }
});