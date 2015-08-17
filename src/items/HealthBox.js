const util = require('util');
const Item = require('./Item');

function HealthBox() {
    Item.call(this);
    this.speed = 5;
    this.type = "healthbox";
    this.model = "healthbox";
}
util.inherits(HealthBox, Item);

HealthBox.prototype.Remove = function() {
    this.remove = 1;
    this.chunk.Explode(this.mesh.position);
    game.soundLoader.PlaySound("health", this.mesh.position, 300);
};

HealthBox.prototype.Hit = function() {
    this.Remove();
    game.player.AddHealth();
};

module.exports = HealthBox;