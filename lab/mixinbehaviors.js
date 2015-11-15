var util = require("util");
var events = require("events");
var mixin = require("mixin");
var _ = require('lodash');

function Entity() {
    this.x = 0;
}
util.inherits(Entity, events.EventEmitter);

Entity.prototype.update = function(dt){
    this.emit('update', dt);
};


var Gravity = function(){
    this.x = 1;
    this.on('update', Gravity.prototype.updateHandler.bind(this));
};

Gravity.prototype.updateHandler = function(){
        console.log(('gracity update handler from behavior'));
};


var Move = function(){
    this.x = 1;
    this.on('update', this.updateHandler.bind(this));
};

Move.prototype.updateHandler = function(){
        console.log(('Move update handler from behavior'));
};

var a = new Entity();
console.log(a);

Gravity.call(a);
console.log(a);





