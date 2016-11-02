var _ = require('lodash');

function Entity() {
    this.x = 0;
    this.y = 1
}

Entity.prototype.doSomething = function(){
    console.log('Entity: do something');
};

function Behavior(){
    this.x = 1;
}

Behavior.prototype.doSomething = function(){
    console.log('Behavior: do something');
}

var a = new Entity();
a.doSomething();

Behavior.call(a);
_.extend(a, Behavior.prototype);
a.doSomething();

