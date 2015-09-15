const _ = require('lodash');
const util = require('util');
const Entity = require('./Entity.js');

/* Actor is a moving entity */

function Actor(props){
  this.waypoints = [];
  this.current_waypoint = 0;
  this.move_target = null;
  this.attack_target = null;
  this.home = null;
  this.status = '';
  
  this.wander_angle = 0;
  this.mass = 20;
  this.speed = 2;
  this.base_force = 5.4;
  this.base_velocity = 3;

  this.gravity = 50;

  this.forwardVelocity = 0;
  this.strafeVelocity = 0;

  this.jump = false;
  this.jumpVelocity = 1;
  this.jumpHeight = 50;  

  this.max_avoid_ahead = 30;

  Actor.super_.call(this, props);
};
util.inherits(Actor, Entity);


Actor.prototype.update = function(dt){
  const ground = this.getGround();

  if(!this.jump &&
     ground.length &&
     ground[0].distance > 0 ){
      if(ground[0].distance <= (this.gravity * dt)){
        this.position.y -= Math.floor(ground[0].distance)
      }else{
        this.position.y -= (this.gravity*dt);
      }
  }

  if(this.jump && ground.length){
     debugger;
     if(ground[0].distance <= this.jumpHeight){    
       this.position.y += this.jumpVelocity;
     }else if(ground[0].distance >= this.jumpHeight){
       this.jump = false;      
     }
  }


  this.mesh.translateY(this.forwardVelocity*dt);
  this.mesh.translateX(this.strafeVelocity*dt);

  Actor.super_.prototype.update.call(this, dt);
};

Actor.prototype.render = function(){

};

module.exports = Actor;
