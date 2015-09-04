// Base class for anything that lives on the terrain
const  _ = require('lodash');
const Vox = require('../Vox');

// Asyncronous constructor returns a promise
const Entity = (function(){
  let id = 1; // wrap id in a closure increment on each instance

  return function Entity(props){
    this.id = id;
    this.position = [0,0,0];
    this.scale = 2;
    this.remove = 0;
    this.origy = 0;    
    this.mesh;

    _.extend(this, props);

    this.orgiy = this.position[2];
    
    if(!props.id){
      id++;
    }

    // return new Promise((resolve) =>{
    //     this.getMesh().then((vox) =>{
    //         this.vox = vox;
    //         this.chunk = vox.getChunk();
    //         this.chunk.Rebuild();
    //         this.mesh = vox.getMesh();
    //         this.mesh.geometry.center();
    //         this.mesh.geometry.computeBoundingBox();
    //         this.mesh.position.set(this.position[0], this.position[1], this.position[2]);
    //         this.mesh.scale.set(this.scale,this.scale,this.scale);            
    //         resolve(this);
    //     });
    // });
  };
})();

Entity.prototype.getMesh = function() {
    const name = this.constructor.name;
    return new Promise((resolve) =>{
        if(this.world.meshes[name]){
            reslove(this.world.meshes[name]);
        }else{
            return this.loadVoxFile().then((vox) =>{
                resolve(vox);
            });
        }
    })
};

Entity.prototype.loadVoxFile = function(){
    const that = this;

    return new Promise((resolve) =>{
        const vox = new Vox({
            filename: that.constructor.name+".vox",
            name: that.constructor.name
        });
        
        vox.LoadModel((vox, name) =>{
            if(_.isUndefined(that.world.meshes[name])){
                that.world.meshes[name] = {};
            }
            console.log("storing model", name);
            that.world.meshes[name].vox = vox;
            resolve(vox);
        });
    });
};

Entity.prototype.destroy = function(){
  return this.world.removeEntity(this);
};

Entity.prototype.render = function(){
  // this.mesh = this.mesh || BABYLON.Mesh.CreateSphere(this.id, this.width, 2, this.world.scene);
  // this.mesh.position.x = this.position[0];
  // this.mesh.position.z = this.position[1];
  // this.mesh.position.y = 1;
  // this.mesh.showBoundingBox = true;
  // this.mesh.material = this.world.test_material;
};


module.exports = Entity;