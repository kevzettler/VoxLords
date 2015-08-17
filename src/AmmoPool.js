const THREE = require('./ThreeHelpers');

function AmmoPool() {
    this.size = 0;
    this.ammo = [];
};

AmmoPool.prototype.Create = function(amount) {
    this.size = amount;

    var b;
    for(var i = 0; i < this.size; i++) {
        var geo = new THREE.BoxGeometry(1, 1, 1);
        var mat = new THREE.MeshBasicMaterial({color: 0xffffff});
        b = new THREE.Mesh(geo, mat);
        b.position.set(-100, -500, -100);
        game.scene.add(b);
        b.remove = 1;
        b.that = this;
        b.ammoId = i;
        this.ammo.push(b);
    }
};

AmmoPool.prototype.Get = function() {
    for(var i = 0; i < this.size; i++) {
        if(this.ammo[i].remove == 1) {
            this.ammo[i].remove = 0;
            return this.ammo[i];
        }
    }
    return undefined;
};

AmmoPool.prototype.Free = function() {
    var f = 0;
    for(var i = 0; i < this.size; i++) {
        if(this.ammo[i].remove == 1) {
            f++;
        }
    }
    return f;
};

AmmoPool.prototype.Release = function(mesh) {
    this.ammo[mesh.ammoId].remove = 1;
    this.ammo[mesh.ammoId].position.set(-100, -500, -100);
};

module.exports = AmmoPool;