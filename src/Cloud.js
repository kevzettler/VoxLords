const Object3D = require('./Object3D');

////////////////////////////////////////////////////////////
// Cloud
/////////////////////////////////////////////////////////////
function Cloud() {
    Object3D.call(this);
    this.chunk = undefined;
    this.scale = 2;
    this.remove = 0;
    this.speed = 0;
    this.snow = true;
}

Cloud.prototype.Draw = function(time, delta) {
    this.mesh.position.z += this.speed;
    if(this.mesh.position.z > 200) {
        this.mesh.position.z = -200;
        this.mesh.position.x = Math.random()*120;
        this.mesh.position.y = 10+Math.random()*2;
    }
    if(this.snow) {
        if(this.mesh.position.z > 20 && this.mesh.position.z < 170) {
            var block = game.snowPool.Get();
            if(block != undefined) {
                block.Create(this.mesh.position.x+Math.random()*5, this.mesh.position.y, this.mesh.position.z+Math.random()*5,
                             0.2,
                             255,
                             255,
                             255,
                             20,
                             Math.random()*180,
                             1);
            }
        }
    }
};

Cloud.prototype.Create = function(type, snow) {
    this.snow = snow;
    this.chunk = game.voxLoader.GetModel(type);
    for(var x = 0; x < this.chunk.chunkSizeX; x++) {
        for(var y = 0; y < this.chunk.chunkSizeY; y++) {
            for(var z = 0; z < this.chunk.chunkSizeZ; z++) {
                this.chunk.blocks[x][y][z].r = 255;
                this.chunk.blocks[x][y][z].g = 255;
                this.chunk.blocks[x][y][z].b = 255;
            }
        }
    }
    this.chunk.Rebuild();
    this.mesh = this.chunk.mesh;
    this.mesh.geometry.computeBoundingBox();
    this.mesh.that = this;
    game.targets.push(this.mesh);
    var scale = 1+Math.random()*2;
    this.mesh.scale.set(scale,scale,scale);
    game.scene.add(this.mesh);
    this.speed = 0.05+Math.random()*0.1;
    this.mesh.position.z = -200;
    this.mesh.position.x = Math.random()*120;
    this.mesh.position.y = 10+Math.random()*2;
};

module.exports = Cloud;
