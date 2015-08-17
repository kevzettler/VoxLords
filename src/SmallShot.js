const util = require('util');
const Shot = require('./Shot');

function SmallShot() {
    Shot.call(this);
    this.damage = 1;
    this.size = 0.1;
    this.life = 0.10;
    this.color = 0xFF00FF;
    this.sound = "shot1";
    this.offset = 1;
    this.speed = 2;
};
util.inherits(SmallShot, Shot);

SmallShot.prototype.Draw = function(time,delta) {
   this.life -= 0.01;

   if(this.life <= 0) {
        this.Remove();
        return;
   }

   if(this.hitObject != undefined) {
       var distance = GetDistance(this.mesh.position, this.hitObject.position);
       if(this.distance != undefined) {
           if(this.distance <= 0 || distance > this.distance) {
               if(this.hitObject.that.Hit != undefined) {
                   //this.hitObject.that.Hit(this.mesh.position, this.damage);
                   this.hitObject.that.Hit(this.shooter, this.damage);

               } 
               this.Remove();
              // this.Explode();
              // this.remove = 1;
              // game.scene.remove(this.mesh);
           }
       }
       this.distance = distance;
   } else {
       var height = game.chunkManager.GetHeight(this.mesh.position.x, this.mesh.position.z);
       if(height != undefined) {
           if(height >= this.mesh.position.y+1) {
               game.chunkManager.ExplodeBombSmall(this.mesh.position.x, this.mesh.position.z);
               this.Remove();
           }
       }
   }
   

   this.mesh.position.x += this.direction.x * this.speed;
       this.mesh.position.z += this.direction.z * this.speed;
};

module.exports = SmallShot;