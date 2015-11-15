const Move = function(){
    this.on('update', Move.prototype.updateHandler.bind(this));
}

Move.prototype.updateHandler = function(dt){
    this.mesh.translateY(this.forwardVelocity*dt);
    this.mesh.translateX(this.strafeVelocity*dt);
};

module.exports = Move;