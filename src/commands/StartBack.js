const StartBack = function(entity, dt){
  entity.mesh.translateY(entity.speed * dt);    
};

module.exports = StartBack;