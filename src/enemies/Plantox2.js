const Enemy = require('./Enemy');

function Plantox2() {
    Enemy.call(this);
    this.enemy_type = "Plantox2";
    this.vox = "plantox2";
    this.damage = 1;
    this.speed = 0.1;
    this.weapon = undefined;
    this.willShoot = true;
    this.maxHealth = 10;
    this.health = this.maxHealth;
}

module.exports = Plantox2;
