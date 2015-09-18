var util = require("util");
var events = require("events");

var mixin = require("mixin");

function Foo() {
    this.x = 0;
    this.on('cool', function(){
        console.log("cool Happened");
    });
}

Foo.prototype = {
   t1: function() { return 't1'; }
};

Foo = mixin(Foo, events.EventEmitter);

// var Entity = function(){
//     this.x = 0;
// };
// util.inherits(Entity, events.EventEmitter);

// Entity.prototype = {
//     t1: function(){ return 't1';}
// };

var Behavior = function(){
    this.x = 1;
    this.on('what', function(){
        console.log("What happened");
    });

    this.on('cool', function(){
        console.log(('cool from behavior'));
    });
};

Behavior.prototype.behaviorMethod = function(){
    console.log('whats this', this.x);
};

Foo = mixin(Foo, Behavior);


var Behavior2 = function(){
    this.x = 2;
    this.on('cool', function(){
        console.log('cool');
    });
};

Behavior2.prototype.behavior2Method = function(){
    console.log('2', this.x);
};
Foo = mixin(Foo, Behavior2);

var f = new Foo();
f.behaviorMethod();
f.behavior2Method();
console.log(f.x);

f.emit('cool');

// var e = new Entity();








