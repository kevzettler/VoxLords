const util = require('util');
const Actor = require('./Actor');
const THREE = require('three');

function Guy(props){
    Guy.super_.call(this,props);
};
util.inherits(Guy, Actor);

Guy.prototype.update = function(dt){
    Guy.super_.prototype.update.call(this, dt);
};

Guy.prototype.render = function(dt){
    Guy.super_.prototype.render.call(this, dt);
};

module.exports = Guy;