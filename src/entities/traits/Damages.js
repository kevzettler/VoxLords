const Trait = require('simple-traits');
const _ = require('lodash');
const THREE = require('../../ThreeHelpers');

module.exports = Trait({
  init: function(){
    this.mesh.geometry.computeBoundingBox();
    this.bbox = new THREE.BoundingBoxHelper(this.mesh, 0xff0000);
  },

  updateHandler: function(){    
    this.bbox.update();    
    const nearby = _.chain(this.world.entities)
      .filter((entity, index) => { 
        if(!entity){
          return;
        }
        const buffer = 1 + this.mesh.geometry.boundingBox.max.x;

        return  (entity.type != 'Bullet' && 
                 entity.id != this.ownerId &&                   
                (this.mesh.position.x <= entity.mesh.position.x + buffer && this.mesh.position.x >= entity.mesh.position.x - buffer ) &&
                (this.mesh.position.y <= entity.mesh.position.y + buffer && this.mesh.position.y >= entity.mesh.position.y - buffer ) &&
                (this.mesh.position.z <= entity.mesh.position.z + buffer && this.mesh.position.z >= entity.mesh.position.z - buffer ))                                
     })
     .value();

    if(nearby.length){
      const target = nearby[0];
      if(!target.mesh.geometry.boundingBox){
        target.mesh.geometry.computeBoundingBox();
      }

      if(target.mesh.geometry.boundingBox.intersect(this.mesh.geometry.boundingBox)){
        this.remove();        
        target.hit();
      }
    }
  },
});
