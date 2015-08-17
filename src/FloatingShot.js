const Shot = require('./Shot');

function FloatingShot() {
    Shot.call(this);
    this.damage = 3;
    this.size = 0.5;
    this.life = 0.5;
    this.color = 0xCC0000;
    this.speed = 0.5;
    this.offset = 1;
    this.sound = "swoosh";    
};

FloatingShot.prototype.Draw = function(time,delta) {
   this.life -= 0.01;

   if(this.life <= 0) {
        game.chunkManager.ExplodeBomb(this.mesh.position.x, this.mesh.position.z, this.damage, false);
        game.soundLoader.PlaySound("explode", this.mesh.position, 300);
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
                    game.chunkManager.ExplodeBomb(this.mesh.position.x, this.mesh.position.z, this.damage, false);
               } 
               this.Remove();
              // this.Explode();
              // this.remove = 1;
              // game.scene.remove(this.mesh);
           }
       }
       this.distance = distance;
   }
   var height = game.chunkManager.GetHeight(this.mesh.position.x, this.mesh.position.z);
   if(height == undefined) {
       height = 0;
   }
   this.mesh.position.x += this.direction.x * this.speed;
   this.mesh.position.y = height + this.offset;
   this.mesh.position.z += this.direction.z * this.speed;
};


module.exports = FloatingShot;
