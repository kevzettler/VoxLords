const util = require('util');
const Shot = require('./Shot');

function QuakeShot() {
    Shot.call(this);
    this.damage = 2;
    this.size = 0.3;
    this.life = 0.5;
    this.speed = 0.5;
    this.color = 0x3399FF;
    this.offset = 0.5;
    this.sound = "swoosh";
};
util.inherits(QuakeShot, Shot);

QuakeShot.prototype.Draw = function(time,delta) {
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
   }
   var dsx = this.direction.x * this.speed;
   var dsz = this.direction.z * this.speed;

   var height = game.chunkManager.GetHeight(this.mesh.position.x, this.mesh.position.z);
   if(height == undefined) {
       height = 0;
   }
   if(this.life <= this.life_max/1.5) {
       game.chunkManager.ExplodeBomb(this.mesh.position.x, this.mesh.position.z, this.damage, false, this.mesh.position.y+2);
   }
   this.mesh.position.x += dsx;
  // if(height != 0) {
  //   this.mesh.position.y = height + this.offset;
  // }
   this.mesh.position.z += dsz;
};


module.exports = QuakeShot;
