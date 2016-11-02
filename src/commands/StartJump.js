const StartJump = function(entity, dt){
    if(entity.jumpGoal > -1){
      entity.jumpGoal = entity.getGround() + entity.jumpHeight
    }
};

module.exports = StartJump;