const Gravity = function(props){
    console.log("wtf is this from gravity", this);
    this.gravity = 50;

    this.forwardVelocity = 0;
    this.strafeVelocity = 0;

    this.jump = false;
    this.jumpVelocity = 1;
    this.jumpHeight = 50;  
    
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