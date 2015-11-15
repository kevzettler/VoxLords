var util = require("util");
var events = require("events");
var mixin = require("mixin");
var _ = require('lodash');

function Entity() {
    this.x = 0;
    this.on('cool', function(){
        console.log("cool base Entity");
    });
}

Entity.prototype = {
   t1: function() { return 't1'; },

   addBehavior: function(behavior){
        _.extend(this, behavior.prototype);
        behavior.call(this);        
   }
};  
Entity = mixin(Entity, events.EventEmitter);

var createNewEntity = function(entityDefinition){
    var constructor = Entity;
    _.each(entityDefinition.behaviors, function(behaviorName){
        constructor = mixin(constructor, behaviorMap[behaviorName]);
    });

    return constructor;
};


var Behavior = function(){
    this.x = 1;
    this.on('what', function(){
        console.log("What happened");
    });

    this.on('cool', this.coolHandler.bind(this));
};

Behavior.prototype.coolHandler = function(){
        console.log(('cool from behavior'));
};

Behavior.prototype.behaviorMethod = function(){
    console.log('whats this', this.x);
};

var Behavior2 = function(){
    this.x = 2;
    //this.on('cool', this.coolHandler.bind(this));
};

Behavior2.prototype.coolHandler = function(){
    console.log('cool');    
};

Behavior2.prototype.behavior2Method = function(){
    console.log('2', this.x);
};

var Behavior3 = function(){
    this.x = 3;
    this.on('cool', this.coolHandler.bind(this));
};

Behavior3.prototype.coolHandler = function(){
    console.log('cool33333');   
}

Behavior3.prototype.behavior3Method = function(){
    console.log('3', this.x);
};

var behaviorMap = {
    'Behavior': Behavior,
    'Behavior2': Behavior2,
    'Behavior3': Behavior3
};

var Guy = {
    x: 666,
    y: 'your mom',
    behaviors : ['Behavior', 'Behavior2']
};


var a = new createNewEntity(Guy);

a.emit('cool');
a.behaviorMethod();

// a.addBehavior(Behavior3);

// a.emit('cool');
// a.behavior3Method();








