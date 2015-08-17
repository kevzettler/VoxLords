const Utils = require('../Utils');

function Item() {
    this.scale = 1;
    this.remove = 0;
    this.mesh = undefined;
    this.type = "item";
    this.model = undefined;
    this.speed = 5;
    this.chunk = undefined;
    this.mesh = undefined;
    this.skipDraw = 0;
}

Item.prototype.Explode = function() {
    game.chunkManager.ExplodeBomb(this.mesh.position.x, this.mesh.position.z, this.damage, false);
    this.chunk.Explode(this.mesh.position);
    game.scene.remove(this.mesh);
};

Item.prototype.Remove = function() {
    if(this.remove != 1) {
        this.Explode();
        this.remove = 1;
    }
};

Item.prototype.Create = function(pos) {
    this.chunk = game.voxLoader.GetModel(this.model);
    this.mesh = this.chunk.mesh;
    game.scene.add(this.mesh);
    this.mesh.position.set(pos.x, pos.y, pos.z);
    this.mesh.that = this;
    game.targets.push(this.mesh);
};

Item.prototype.Draw = function(time, delta) {
    if(game.player != undefined) {
        var dist = Utils.GetDistance(this.mesh.position, game.player.mesh.position);
        if(dist > 20) {
            // Optimization for performance, skipping frames when far away.
            this.skipDraw = Math.floor(dist/3);
        }
    }
    this.mesh.rotation.z = (time/this.speed);
};

module.exports = Item;

