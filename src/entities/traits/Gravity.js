var Trait = require('simple-traits');
var _ = require('lodash');
var THREE = require('three');

var Gravity = Trait({
    gravity: 50,

    groundDirection: new THREE.Vector3(0, -1, 0),

    forwardVelocity: 0,
    strafeVelocity: 0,

    jump: false,
    jumpVelocity: 1,
    jumpHeight: 50,

    position: Trait.required,

    updateHandler: function(dt){
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
    },

    getGround: function(){
      this.raycaster.set(this.position, this.groundDirection);
      const intersects = this.raycaster.intersectObjects(this.scene.children);
      return intersects;
    }
});


// const Gravity = function(props){
//     this.gravity = 50;

//     this.forwardVelocity = 0;
//     this.strafeVelocity = 0;

//     this.jump = false;
//     this.jumpVelocity = 1;
//     this.jumpHeight = 50;
    
//     this.on('update', Gravity.prototype.updateHandler.bind(this));
// };

// Gravity.prototype.updateHandler = function(dt){
//   const ground = this.getGround();

//   if(!this.jump &&
//      ground.length &&
//      ground[0].distance > 0 ){
//       if(ground[0].distance <= (this.gravity * dt)){
//         this.position.y -= Math.floor(ground[0].distance)
//       }else{
//         this.position.y -= (this.gravity*dt);
//       }
//   }

//   if(this.jump && ground.length){
//      if(ground[0].distance <= this.jumpHeight){    
//        this.position.y += this.jumpVelocity;
//      }else if(ground[0].distance >= this.jumpHeight){
//        this.jump = false;      
//      }
//   }
// };

// Gravity.prototype.getGround = function(){
//   this.raycaster.set(this.position, this.groundDirection);
//   const intersects = this.raycaster.intersectObjects(this.scene.children);
//   return intersects;
// };

module.exports = Gravity;