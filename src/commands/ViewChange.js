const THREE = require('three');

const ViewChange = function(entity, xValue){
  const xAxis = new THREE.Vector3(0,0,1);
  entity.mesh.rotateOnAxis(xAxis, -(Math.PI / 2)*xValue);
};

module.exports = ViewChange;