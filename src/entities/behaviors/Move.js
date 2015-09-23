const Move = function(){
    this.on('update', this.updateHandler.bind(this));
}

Move.prototype.updateHandler = function(){
    console.log("moving");
};

module.exports = Move;