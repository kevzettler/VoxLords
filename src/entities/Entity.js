// Base class for anything that lives on the terrain
const  _ = require('lodash');
const Vox = require('../Vox');
const THREE = require('three');
const util = require("util");
const mixin = require('mixin');
const events = require("events");
const Behaviors = require('./behaviors');

let entity_id = 0;

function Entity(){
  this.id = entity_id;
  this.position = [0,0,0];
  this.scale = 2;
  this.remove = 0;
  this.origy = 0;
  this.groundDirection = new THREE.Vector3(0, -1, 0);
  this.mesh;

  entity_id++;
};

Entity.prototype.addBehaviors = function(possible_behaviors){
  if(possible_behaviors instanceof Array){
    _.each(possible_behaviors, this.addBehavior.bind(this));
  }

  if(possible_behaviors instanceof String){
    this.addBehavior(possible_behaviors);
  }
};

Entity.prototype.addBehavior = function(behavior){
  Behaviors[behavior].call(this);
  _.extend(this, Behaviors[behavior]);
};

Entity.prototype.update = function(dt){
  this.emit('update', dt);
};

Entity.prototype.attachVox = function(vox){
  this.vox = vox;
  this.chunk = vox.getChunk();
  this.chunk.Rebuild();
  this.mesh = vox.getMesh();
  this.mesh.geometry.center();
  this.mesh.geometry.computeBoundingBox();
  debugger;
  this.mesh.position.set(this.position[0], this.position[1], this.position[2]);

  //unsafe mutation of the classes position
  //helpful for moving mesh through the class
  this.position = this.mesh.position;

  this.raycaster = new THREE.Raycaster(this.position);
  //this.mesh.add( new THREE.ArrowHelper(this.raycaster.ray.direction, this.mesh.position, 30, 0x00FF00));

  this.mesh.scale.set(this.scale,this.scale,this.scale); 
}

Entity = mixin(Entity, events.EventEmitter);

module.exports = Entity;