function Shot() {
    this.id = 0;
    this.life = 3;
    this.life_max = 3;
    this.mesh = undefined;
    this.remove = 0;
    this.velocity;
    this.angle;
    this.force = 0;
    this.forceY = 0;
    this.size = 1;
    this.direction = undefined;
    this.ray = undefined;
    this.hitObject = undefined;
    this.distance = undefined;
    this.sound = undefined;
    this.shooter = "";
};

Shot.prototype.Remove = function() {
    this.Explode();
    this.life = 0;
    this.remove = 1;
    this.mesh.that.Release(this.mesh);
};

Shot.prototype.setDamage = function(damage) {
    this.damage = damage;
};

Shot.prototype.Explode = function() {
    if(this.size < 0.3) {
        return;
    }
    var block;
    for(var i = 0; i < 5; i++) {
        block = game.physBlockPool.Get();
        if(block != undefined) {
            block.Create(this.mesh.position.x+Math.random()*1,
                         this.mesh.position.y+Math.random()*1, 
                         this.mesh.position.z+Math.random()*1,
                         this.size/2,
                         0,
                         0,
                         0,
                         2,
                         Math.random()*180,
                         5);
        }
    }

};

Shot.prototype.Create = function(ray, pos, shooter) {
    this.shooter = shooter;
    this.life_max = this.life;
    this.ray = ray;
    this.direction = ray.ray.direction;
    
    if(this.sound != undefined) {
        game.soundLoader.PlaySound(this.sound,game.player.mesh.position, 300);
    }

    this.mesh = game.ammoPool.Get();
    if(this.mesh == undefined) {
        console.log("Ammo pool empty!");
        return;
    }
    this.mesh.scale.set(this.size, this.size, this.size);
    this.mesh.position.set(pos.x, pos.y, pos.z);
    this.mesh.material.color.setHex(this.color);
    this.mesh.material.needsUpdate = true;

    // Check if we hit something, then set how for to it. And when it's hit, "hit" the target.
    var intersects = this.ray.intersectObjects(game.targets);
    if (intersects.length > 0) {
        for(var i=0; i < intersects.length; i++) {
            if(intersects[i].object.that.Hit != undefined &&
              !(this.shooter == 'player' && intersects[i].object.that.type == 'player')) {
                this.hitObject = intersects[i].object;
                break;
            }
        }
    }
    
    game.scene.add(this.mesh);
    game.objects.push(this);
};

Shot.prototype.Draw = function(time, delta) {
};

Shot.prototype.getColor= function() {
    return parseInt(this.color);
};

module.exports = Shot;