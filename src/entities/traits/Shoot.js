const Trait = require('simple-traits');
const _ = require('lodash');
const THREE = require('three');
const Immutable = require('immutable');

const Shoot = Trait({
  position: Trait.required,
//  mesh: Trait.required,
  scene: Trait.required,

  bulletPosOrigin: [0, -0.8, 0.5],

  init: function(){
    this.bulletPos = new THREE.Object3D();
    this.bulletPos.position.set.apply(this.bulletPos.position, this.bulletPosOrigin);
    this.mesh.add(this.bulletPos);
  },

  shoot: function(){
    this.mesh.updateMatrixWorld();

    var vector = new THREE.Vector3();
    vector.setFromMatrixPosition( this.bulletPos.matrixWorld );

    var rotationMatrix = new THREE.Matrix4() ;
    rotationMatrix.extractRotation( this.mesh.matrix ) ;

    var rotationVector = new THREE.Vector3( 0, -1, 0 ) ;
    rotationVector.applyMatrix4(rotationMatrix) ;
    var ray = new THREE.Raycaster( vector, rotationVector );

    //this.scene.add( new THREE.ArrowHelper(ray.ray.direction, this.mesh.position, 50, 0x00FF00));

    this.world.initEntityInstance('Bullet', null, Immutable.fromJS({
      direction: ray.ray.direction.toArray(),
      position: vector.toArray(),
      ownerId: this.id,
    }));
  },

});

module.exports = Shoot;