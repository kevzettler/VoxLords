const Object3D = require('./Object3D');
/////////////////////////////////////////////////////////////
// Lava
/////////////////////////////////////////////////////////////
function Lava() {
    Object3D.call(this);
}

Lava.prototype.Create = function(scene) {
    var width = 400;
    var depth = 400;
    var geometry = new THREE.PlaneGeometry( width, depth, 64 - 1, 64- 1 );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
    geometry.dynamic = true;

    var i, j, il, jl;
    for ( i = 0, il = geometry.vertices.length; i < il; i ++ ) {
        geometry.vertices[ i ].y = 0.4 * Math.sin( i/2 );
    }

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    var texture = THREE.ImageUtils.loadTexture( "textures/lava3.png" );
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 30, 30 );

    //var material = new THREE.MeshBasicMaterial( { color: 0x00CCFF, map: texture, transparent: false, opacity: 1} );
    var material = new THREE.MeshBasicMaterial( { map: texture, transparent: true, opacity: 0.8} );

    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(50, game.currentMap.lavaPosition, 50);
    //mesh.receiveShadow = true;
    this.mesh = mesh;
    scene.add(this.mesh);
};

Lava.prototype.Draw = function(time, delta, i) {
    for ( var i = 0, l = this.mesh.geometry.vertices.length; i < l; i ++ ) {
     //   this.mesh.geometry.vertices[ i ].y = 0.1 * Math.sin( i / 5 + ( time + i ) / 7 );    
        this.mesh.geometry.vertices[ i ].y = 0.2 * Math.sin( i / 5 + ( time + i ) / 4 );
    }
    this.mesh.geometry.verticesNeedUpdate = true;
};

module.exports = Lava;