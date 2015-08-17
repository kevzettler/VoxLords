const Enemy = require('./Enemy');

function Plantox1() {
    Enemy.call(this);
    this.enemy_type = "Plantox1";
    this.vox = "plantox1";
    this.damage = 2;
    this.speed = 0.2;
    this.weapon = undefined;
    this.willShoot = true;
    this.maxHealth = 5;
    this.health = this.maxHealth;
}

module.exports = Enemy;