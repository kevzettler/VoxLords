const util = require('util');
const Actor = require('./Actor');
const THREE = require('three');

function Guy(props){
    Guy.super_.call(this,props);
};
util.inherits(Guy, Actor);

module.exports = Guy;