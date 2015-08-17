const util = require('util');
const Item = require('./Item');

function WeaponBox() {
    Item.call(this);
    this.type = "bomb";
    this.speed = 10;
    this.hit = false;
    this.model = "weaponbox";
    this.damage = 10;
}
util.inherits(WeaponBox, Item);

WeaponBox.prototype.Remove = function() {
    this.Explode();
    this.remove = 1;
    game.soundLoader.PlaySound("explode", this.mesh.position, 300);
};

WeaponBox.prototype.Hit = function() {
    this.hit = true;
};

WeaponBox.prototype.Draw = function(time, delta) {
    if(this.hit) {
        this.speed -= 0.1;
    }
    if(this.speed <= 1) {
        this.Remove();
    } else {
       this.mesh.rotation.z = (time/this.speed);
    }
};

module.exports = WeaponBox;
