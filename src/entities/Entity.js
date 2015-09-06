// Base class for anything that lives on the terrain
const  _ = require('lodash');
const Vox = require('../Vox');

// Asyncronous constructor returns a promise
const Entity = (function(){
  let id = 1; // wrap id in a closure increment on each instance

  return function Entity(props){
    this.id = id;
    this.position = [0,0,0];
    this.scale = 2;
    this.remove = 0;
    this.origy = 0;    
    this.mesh;

    if(props.vox){
        this.attachVox(props.vox);
    }

    _.extend(this, props);

    this.orgiy = this.position[2];
    
    if(!props.id){
      id++;
    }
  };
})();

Entity.prototype.attachVox = function(Vox){
    this.vox = Vox;
    this.chunk = Vox.getChunk();
    this.chunk.Rebuild();
    this.mesh = vox.getMesh();
    this.mesh.geometry.center();
    this.mesh.geometry.computeBoundingBox();
    this.mesh.position.set(this.position[0], this.position[1], this.position[2]);
    this.mesh.scale.set(this.scale,this.scale,this.scale);                
}


Entity.prototype.destroy = function(){
  return this.world.removeEntity(this);
};

Entity.prototype.render = function(){
  // this.mesh = this.mesh || BABYLON.Mesh.CreateSphere(this.id, this.width, 2, this.world.scene);
  // this.mesh.position.x = this.position[0];
  // this.mesh.position.z = this.position[1];
  // this.mesh.position.y = 1;
  // this.mesh.showBoundingBox = true;
  // this.mesh.material = this.world.test_material;
};


module.exports = Entity;