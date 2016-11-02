const Trait = require('simple-traits');
const _ = require('lodash');
const THREE = require('three');

const Projectile = Trait({
  direction: Trait.required,
  position: Trait.required,
  mesh: Trait.required,
  speed: 20,
  range: 100,

  init: function(){
    //this.bbox = new THREE.BoundingBoxHelper(this.mesh, 0xff0000);
    this.mesh.position.set(this.position[0], this.position[1], this.position[2]);
  },

  updateHandler: function(dt){
    this.mesh.position.x += (this.direction[0] * this.speed) * dt;
    this.mesh.position.z += (this.direction[2] * this.speed) * dt;

    this.range -= 1;
    if(this.range === 0){
      this.remove();
    }
  },

});


module.exports = Projectile;