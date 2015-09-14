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

  this.gravity = 1;

  this.jump = false;
  this.jumpVelocity = 1;
  this.jumpHeight = 100;  

  this.max_avoid_ahead = 30;

  Actor.super_.call(this, props);
};
util.inherits(Actor, Entity);

Actor.prototype.update = function(delta){
  if(!this.jump &&
      this.position.y > this.getGroundY()){
      this.position.y -= this.gravity;
  }

  if(this.jump){
     if(this.position.y < (this.getGroundY() + this.jumpHeight)){
       this.position.y += (this.jumpVelocity * dt);
       console.log("jumping");
     }

     if(this.position.y >= (this.getGroundY() + this.jumpHeight)){
       this.jump = false;
     }
  }
  Actor.super_.prototype.update.call(this, delta);
};

Actor.prototype.render = function(){

};

module.exports = Actor;
