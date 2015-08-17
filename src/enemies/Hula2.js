const util = require('util');
const Enemy = require('./Enemy');

function Hula2() {
    Enemy.call(this);
    this.enemy_type = "Hula2";
    this.vox = "hula2";
    this.damage = 2;
    this.speed = 0.1;
    this.weapon = undefined;
    this.willShoot = false;
    this.maxHealth = 3;
    this.health = this.maxHealth;
    this.scale = 1.5;

    Hula2.prototype.Draw = function(time, delta) {
        Enemy.prototype.Draw.call(this);

        var dist = GetDistance(this.mesh.position, game.player.mesh.position);
        if(dist < 5) {
            this.Explode();
        }

    };
}
util.inherits(Hula2, Enemy);
module.exports = Hula2;