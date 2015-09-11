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
    this.gravity = 1;  
    this.mesh;

    _.extend(this, props.toJS());
    this.orgiy = this.position[2];


    if(!props.id){
      id++;
    }
  };
})();

Entity.prototype.getGroundY = function(){
    const direction = new THREE.Vector3(0, -1, 0);
    this.raycaster.set(this.position, direction);

    const intersects = this.raycaster.intersectObjects(this.scene.children);

    if(intersects.length){
        return intersects[0].object.position.y + 2; //2 is supposed Guy height
    }
};

Entity.prototype.update = function(){
    if(this.position.y > this.getGroundY()){
        this.position.y -= this.gravity;
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

    this.raycaster = new THREE.Raycaster(this.position);

    //this.mesh.add( new THREE.ArrowHelper(this.raycaster.ray.direction, this.mesh.position, 30, 0x00FF00));

    this.mesh.scale.set(this.scale,this.scale,this.scale); 
}


module.exports = Entity;