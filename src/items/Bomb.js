const util = require('util');
const Item = require('./Item');

function Bomb() {
    Item.call(this);
    this.type = "bomb";
    this.speed = 10;
    this.hit = false;
    this.model = "bomb";
    this.damage = 5;
}
util.inherits(Bomb, Item);

Bomb.prototype.Remove = function() {
    this.Explode();
    this.remove = 1;
    game.soundLoader.PlaySound("explode", this.mesh.position, 300);
};

Bomb.prototype.Hit = function() {
    this.hit = true;
};

Bomb.prototype.Draw = function(time, delta) {
    if(this.hit) {
        this.speed -= 0.1;
    }
    if(this.speed <= 1) {
        this.Remove();
    } else {
       this.mesh.rotation.z = (time/this.speed);
    }
};

module.exports = Bomb;