const Trait = require('simple-traits');
const THREE = require('three');

const AttachedVox = Trait({
  position: Trait.required,
  vox: Trait.required,

  init: function(){
    this.chunk = this.vox.getChunk();
    this.chunk.Rebuild();
    this.mesh = this.vox.getMesh();
    this.mesh.geometry.center();
    this.mesh.geometry.computeBoundingBox();
    this.mesh.position.set(this.position[0], this.position[1], this.position[2]);          

    if(this.debug){
      this.bbox = new THREE.BoundingBoxHelper(this.mesh, 0xff0000);
      this.bbox.update();
    }

    //unsafe mutation of the classes position
    //helpful for moving mesh through the class
    this.position = this.mesh.position;

    if(!this.scale){
      this.scale = 2;
    }
    this.mesh.scale.set(this.scale,this.scale,this.scale); 
  },

  updateHandler: function(){
    if(this.bbox){
      this.bbox.update();
    }
  },
});

module.exports = AttachedVox;