// Base class for anything that lives on the terrain
const  _ = require('lodash');
const Vox = require('../Vox');
const THREE = require('three');

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

    _.extend(this, props.toJS());

    this.orgiy = this.position[2];
    
    if(!props.id){
      id++;
    }
  };
})();

Entity.prototype.update = function(){
    if(this.position.y > 2){
        this.position.y -= 2;
    }
};

Entity.prototype.attachVox = function(vox){
    this.vox = vox;
    this.chunk = vox.getChunk();
    this.chunk.Rebuild();
    this.mesh = vox.getMesh();
    this.mesh.geometry.center();
    this.mesh.geometry.computeBoundingBox();
    this.mesh.position.set(this.position[0], this.position[1], this.position[2]);

    //unsafe mutation of the classes position
    //helpful for moving mesh through the class
    this.position = this.mesh.position;

    this.mesh.scale.set(this.scale,this.scale,this.scale); 
}


module.exports = Entity;