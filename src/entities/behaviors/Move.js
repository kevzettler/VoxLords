const Move = function(){
    this.on('update', Move.prototype.updateHandler.bind(this));
}

Move.prototype.updateHandler = function(){
    console.log("moving");
};

module.exports = Move;