const util = require('util');
const Entity = require('./Entity');
const THREE = require('three');

function Guy(props){
    // const that = this;
    // return new Promise((resolve) => {
    //     Guy.super_.call(that,props).then((guy) => {
    //             console.log("wtf is guy promise", guy);
    //             guy.world.client.initPlayerCamera(guy);
    //             resolve(guy);
    //     }); 
    // });
    Guy.super_.call(this,props);
};
util.inherits(Guy, Entity);

Guy.prototype.update = function(dt){

};

Guy.prototype.render = function(dt){
    Guy.super_.prototype.render.call(this, dt);
};

module.exports = Guy;