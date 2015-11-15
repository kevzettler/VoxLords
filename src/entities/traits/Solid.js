const Solid = function(){
  this.on('update', this.updateHandler.bind(this));
}

Solid.prototype.updateHandler = function(){
  //cool
};

module.exports = Solid;