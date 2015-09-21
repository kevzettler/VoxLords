const StartJump = function(entity){
    if(entity.position.y < (entity.getGroundY() + entity.jumpHeight)){
        entity.jump = true;
    }
};

module.exports = StartJump;