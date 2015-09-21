const Gravity = function(){
    console.log("wtf is this from gravity", this);
    this.jump = false;
    this.on('update', this.updateHandler.bind(this));
};

Gravity.prototype.updateHandler = function(dt){
  this.mesh.translateY(this.forwardVelocity*dt);
  this.mesh.translateX(this.strafeVelocity*dt);

  const ground = this.getGround();

  if(!this.jump &&
     ground.length &&
     ground[0].distance > 0 ){
      if(ground[0].distance <= (this.gravity * dt)){
        this.position.y -= Math.floor(ground[0].distance)
      }else{
        this.position.y -= (this.gravity*dt);
      }
  }

  if(this.jump && ground.length){
     if(ground[0].distance <= this.jumpHeight){    
       this.position.y += this.jumpVelocity;
     }else if(ground[0].distance >= this.jumpHeight){
       this.jump = false;      
     }
  }
};

Gravity.prototype.getGround = function(){
  this.raycaster.set(this.position, this.groundDirection);
  const intersects = this.raycaster.intersectObjects(this.scene.children);
  return intersects;
};

module.exports = Gravity;