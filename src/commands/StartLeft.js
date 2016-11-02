module.exports = function StartLeft(entity, dt){
  entity.mesh.translateX(entity.speed * dt);  
};