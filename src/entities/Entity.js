// Base class for anything that lives on the map
// Tiles, Actors, Buildings,
const  _ = require('lodash');
const SAT = require('sat');
const BABYLON = require('babylonjs');
const createRect = require('../CreateRect');

const Entity = (function(){
  let id = 1; // wrap id in a closure increment on each instance

  return function Entity(props){
    this.id = id;
    this.position;

    _.extend(this, props);

    if(this.world){
      this.world.registerEntity(this);
    }
    
    if(!props.id){
      id++;
    }
  };
})();

Entity.prototype.render = function(){
  this.model = this.model || BABYLON.Mesh.CreateSphere(this.id, this.width, 2, this.world.scene);
  this.model.position.x = this.position[0];
  this.model.position.z = this.position[1];
  this.model.position.y = 1;
  this.model.showBoundingBox = true;
  this.model.material = this.world.test_material;
};

Entity.prototype.destroy = function(){
  return this.world.removeEntity(this);
};




module.exports = Entity;
