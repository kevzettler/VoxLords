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
    this.groundDirection = new THREE.Vector3(0, -1, 0);

    
    this.mesh;

    _.extend(this, props.toJS());
    this.orgiy = this.position[2];


    if(!props.id){
      id++;
    }
  };
})();

Entity.prototype.getGround = function(){
    this.raycaster.set(this.position, this.groundDirection);
    const intersects = this.raycaster.intersectObjects(this.scene.children);
    return intersects;
}

// Entity.prototype.getGroundY = function(){
//     const ground = this.getGround();
//     if(ground.length){
//         return this.getGround()[0].object.position.y + 2; //2 is supposed Guy height
//     }else{
//         return this.position.y;
//     }
// };

Entity.prototype.update = function(dt){};

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