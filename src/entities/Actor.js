const _ = require('lodash');
const util = require('util');
const Entity = require('./Entity.js');
const Actions = require('./actions');
const normalize = require('vectors/normalize')(2);
const mag = require('vectors/mag')(2);
const add = require('vectors/add')(2);
const mult = require('vectors/mult')(2);

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

  this.max_avoid_ahead = 30;

  this.is_patrolling = false;

  this.fillColor = "#EB8007";
  
  Actor.super_.call(this, props);
};
util.inherits(Actor, Entity);

Actor.prototype.getMaxForce = function(){
  return this.speed * this.base_force;
};

Actor.prototype.getAhead = function(){
  var tv = this.velocity.slice();
  tv = normalize(tv);
  mult(tv, (this.max_avoid_ahead * mag(this.velocity) / this.getMaxVelocity()));

  var ahead = add(this.position.slice(), tv);
  return ahead;
};

Actor.prototype.getAhead2 = function(){
  return add(this.getAhead(), this.getAhead());
};

Actor.prototype.getMaxVelocity = function(){
  return this.speed * this.base_velocity;
};

Actor.prototype.update = function(delta){
  var actionClass = this.getAction();
  var action = new actionClass();
  action.exec(this, delta);
};

Actor.prototype.getAction = function(){
  if(this.attack_target){
    return Actions.Attack;
  }

  if(this.waypoints.length > 0){
    return Actions.Move;
  }

  if(!this.home){
    return Actions.Wander;
  }

  return Actions.Idle;
};

Actor.prototype.addWayPoint = function(object){
  var _self = this, position;

  if(object.length){
    position = object;
  }

  if(object.position){
    position = object.position.slice();
  }

  if(!position){
    return console.log("Tried to set a null waypoint");
  }

  this.waypoints.push({
    position: position
  });

  if(this.is_patrolling && this.waypoints.length == 1){
    this.waypoints.push({
      position: _self.position.slice()
    });
  }
};

Actor.prototype.resetCurrentWaypoint = function(){
  this.waypoints[this.current_waypoint].distance = null;
  this.waypoints[this.current_waypoint].start = null;
};

Actor.prototype.render = function(){
  Actor.super_.prototype.render.apply(this);
};

module.exports = Actor;
