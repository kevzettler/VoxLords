const util = require('util');
const Entity = require('./Entity');
const THREE = require('three');

function Guy(props){
    var that = this;
    // This is awful 
    // This initalizes the a camera to follow the Guy entity
    // Needed for Player setup
    return new Promise((resolve) => {
        Guy.super_.call(that,props).then((guy) => {
            guy.camera_obj = new THREE.Object3D();
            guy.mesh.add(guy.camera_obj);
            guy.camera_obj.add(guy.world.camera);
            guy.attached_camera = 1;
            guy.world.camera.position.set(0, 15, 7);
            guy.world.camera.rotation.set(-Math.PI/2.6, 0, Math.PI);
            resolve(guy);
        });
    });
};
util.inherits(Guy, Entity);

Guy.prototype.update = function(dt){

};

Guy.prototype.render = function(dt){
    Guy.super_.prototype.render.call(this, dt);
};

module.exports = Guy;