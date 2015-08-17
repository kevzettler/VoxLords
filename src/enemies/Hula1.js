const util = require('util');
const Enemy = require('./Enemy');

function Hula1() {
    Enemy.call(this);
    this.enemy_type = "Hula1";
    this.vox = "hula1";
    this.damage = 2;
    this.speed = 0.1;
    this.weapon = undefined;
    this.willShoot = false;
    this.maxHealth = 3;
    this.health = this.maxHealth;
    this.scale = 2;
};

Hula1.prototype.Draw = function(time, delta) {
    Enemy.prototype.Draw.call(this);

    var dist = GetDistance(this.mesh.position, game.player.mesh.position);
    if(dist < 5) {
        this.Explode();
    }

};
util.inherits(Hula1, Enemy);
module.exports = Hula1;