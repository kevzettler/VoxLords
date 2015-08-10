function Object3D() {
    // THREE.Mesh.apply(this, arguments); inherite from mesh
    this.mesh;
    this.time;
}

Object3D.prototype.GetObject = function() {
    return this.mesh;
};

Object3D.prototype.Draw = function() {
    //draw object
};

Object3D.prototype.AddToScene = function(scene) {
    scene.add(this.mesh);
};
module.exports = Object3D;