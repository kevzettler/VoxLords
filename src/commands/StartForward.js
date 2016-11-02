const StartForward = function(entity, dt){
  entity.mesh.translateY((-1 * entity.speed )*dt);
};

module.exports = StartForward;