module.exports = function StartRight(entity, dt){
  entity.mesh.translateX((-1 * entity.speed ) * dt);
};