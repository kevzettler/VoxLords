// Base class for anything that lives on the terrain
const  _ = require('lodash');
const Vox = require('../Vox');
const THREE = require('three');
const util = require("util");
const events = require("events");
const Behaviors = require('./behaviors');

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

    Object.assign(this, props.toJS());
    if(this.behaviors){
        this.addBehaviors(this.behaviors);
        delete this.behaviors;
    }

    if(!props.id){
      id++;
    }
  };
})();
util.inherits(Entity, events.EventEmitter);


Entity.prototype.addBehaviors = function(possible_behaviors){
    if(possible_behaviors instanceof Array){
        _.each(possible_behaviors, this.addBehavior.bind(this));
    }

    if(possible_behaviors instanceof String){
        this.addComponent(possible_behaviors);
    }
};

Entity.prototype.addBehavior = function(behavior){
    const Bdef = Behaviors[behavior];
    const eventListeners = _.filter(_.keys(Bdef), function(key){return _.endsWith(key, '_')});
    const methods = _.keys(_.keys(Bdef), eventListeners);
    _.each(methods, (methodName) =>{
        this[methodName] = Bdef[methodName];
    });

    _.each(eventListeners, (listenerName) => {
        this.on(listenerName.split('L'), Bdef[listenerName].bind(this));
    });
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
    this.mesh.position.set(this.position[0], this.position[1], this.position[2]);

    //unsafe mutation of the classes position
    //helpful for moving mesh through the class
    this.position = this.mesh.position;

    this.raycaster = new THREE.Raycaster(this.position);

    //this.mesh.add( new THREE.ArrowHelper(this.raycaster.ray.direction, this.mesh.position, 30, 0x00FF00));

    this.mesh.scale.set(this.scale,this.scale,this.scale); 
}


module.exports = Entity;