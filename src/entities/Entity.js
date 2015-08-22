// Base class for anything that lives on the terrain
const  _ = require('lodash');
const Vox = require('../Vox');

const Entity = (function(){
  let id = 1; // wrap id in a closure increment on each instance

  return function Entity(props){
    this.id = id;
    this.position = [0,0,0];
    this.scale= 2;
    this.remove = 0;
    this.origy = 0;    
    this.mesh;

    _.extend(this, props);

    // this.chunk = this.world.voxLoader.GetModel(type);
    // this.mesh = this.chunk.mesh;
    // this.mesh.geometry.computeBoundingBox();
    // this.mesh.position.set(x,y,z);
    // this.mesh.that = this;
    // this.mesh.scale.set(scale,scale,scale);
    // game.scene.add(this.mesh);
    // this.origy = y;
    this.orgiy = this.position[2];
    
    if(!props.id){
      id++;
    }

    return new Promise((resolve) =>{
        this.getMesh().then((vox) =>{
            this.vox = vox;
            this.chunk = vox.getChunk();
            this.chunk.Rebuild();
            this.mesh = vox.getMesh();
            this.mesh.geometry.center();
            this.mesh.geometry.computeBoundingBox();
            this.mesh.position.set.call(this, this.position);
            this.mesh.scale.set(this.scale,this.scale,this.scale);            
            resolve(this);
        });
    });
  };
})();

Entity.prototype.getMesh = function() {
    return new Promise((resolve) =>{
        if(this.world.meshes['Tree']){
            reslove(this.world.meshes['Tree'])
        }else{
            return this.loadVoxFile().then((vox) =>{
                resolve(vox);
            });
        }
    })
};

Entity.prototype.loadVoxFile = function(){
    var that = this;
    return new Promise((resolve) =>{
        var vox = new Vox({
            filename: "tree1.vox",
            name: 'Tree'
        });
        
        vox.LoadModel((vox, name) =>{
            if(_.isUndefined(that.world.meshes[name])){
                that.world.meshes[name] = {};
            }
            that.world.meshes[name].vox = vox;
            resolve(vox);
        });
    });
};

Entity.prototype.destroy = function(){
  return this.world.removeEntity(this);
};

Entity.prototype.render = function(){
  this.mesh = this.mesh || BABYLON.Mesh.CreateSphere(this.id, this.width, 2, this.world.scene);
  this.mesh.position.x = this.position[0];
  this.mesh.position.z = this.position[1];
  this.mesh.position.y = 1;
  this.mesh.showBoundingBox = true;
  this.mesh.material = this.world.test_material;
};


module.exports = Entity;