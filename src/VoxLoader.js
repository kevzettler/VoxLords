const util = require('util');
const Loader = require('./Loader');
const Vox = require('./Vox');

/////////////////////////////////////////////////////////////
// Vox models
/////////////////////////////////////////////////////////////
function VoxLoader() {
    Loader.call(this);
    this.models = new Array();
}
util.inherits(VoxLoader, Loader);

VoxLoader.prototype.GetModel = function(name) {
    return this.models[name].chunk.Clone();
};

VoxLoader.prototype.Add = function(args) {
    this.models[args.name] = new Object();
    this.models[args.name].args = args;
    Loader.prototype.total++;

    var vox = new Vox();
    vox.LoadModel(args.file, this.Load.bind(this), args.name);
    this.models[args.name].vox = vox;
};

VoxLoader.prototype.Load = function(vox, name) {
    console.log("Voxel: "+name+" loaded!");
    this.models[name].vox = vox;
    this.models[name].chunk = vox.getChunk();
    this.models[name].chunk.Rebuild();
    this.models[name].mesh = vox.getMesh();
    this.models[name].mesh.geometry.center();
    this.Loaded();
};

module.exports = VoxLoader;