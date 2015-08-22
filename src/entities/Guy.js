const util = require('util');
const Entity = require('./Entity');

function Guy(props){
    return Guy.super_.call(this,props);
};
util.inherits(Guy, Entity);

Guy.prototype.update = function(dt){

};

Guy.prototype.render = function(dt){
    Guy.super_.prototype.render.call(this, dt);
};

module.exports = Guy;