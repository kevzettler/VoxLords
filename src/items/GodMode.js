const util = require('util');
const Item = require('./Item');

function GodMode() {
    Item.call(this);
    this.speed = 5;
    this.type = "godmode";
    this.model = "godmode";
}
util.inherits(GodMode, Item)

GodMode.prototype.Remove = function() {
    this.chunk.Explode(this.mesh.position);
    game.soundLoader.PlaySound("crate_explode", this.mesh.position, 300);
    this.remove = 1;
};

GodMode.prototype.Hit = function() {
    game.player.godMode = true;
    this.Remove();
};

module.exports = GodMode;