const Object3D = require('./Object3D');

/////////////////////////////////////////////////////////////
// Tree
/////////////////////////////////////////////////////////////
function Tree() {
    Object3D.call(this);
    this.chunk = undefined;
    this.scale = 2;
    this.remove = 0;
    this.origy = 0;
};

Tree.prototype.Draw = function(time, delta) {
    var y = game.chunkManager.GetHeight(this.mesh.position.x+this.chunk.blockSize*this.chunk.chunkSizeX/2,
                                        this.mesh.position.z+this.chunk.blockSize*this.chunk.chunkSizeX/2);
    
    // Explode tree if ground breaks.
     if(y < this.origy) {
       // this.Hit(0,0);
     }
};

Tree.prototype.Hit = function(data, dmg) {
    this.chunk.Explode(this.mesh.position, this.scale);
    this.remove = 1;
    game.scene.remove(this.mesh);
    console.log("TREE HIT!");
};

Tree.prototype.Create = function(x,y,z, scale, type) {
    this.chunk = game.voxLoader.GetModel(type);
    this.mesh = this.chunk.mesh;
    this.mesh.geometry.computeBoundingBox();
    this.mesh.position.set(x,y,z);
    this.mesh.that = this;
    game.targets.push(this.mesh);
    this.mesh.scale.set(scale,scale,scale);
    game.scene.add(this.mesh);
    this.origy = y;
};

module.exports = Tree;