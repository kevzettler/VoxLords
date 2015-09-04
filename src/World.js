const _ = require('lodash');
const ChunkManager = require('./ChunkManager');
const VoxLoader = require('./VoxLoader');
const Vox = require('./Vox');
const TerrainLoader = require('./TerrainLoader');
const ClientManager = require('./ClientManager');

const EntityClasses = require('./entities');
const THREE = require('three');
const async = require('async');
const is_server = (typeof process === 'object' && process + '' === '[object process]');

function World(props) {
    this.width = 0;
    this.height = 0;
    this.name = "Unknown";
    this.map = undefined;
    this.chunkSize = 16;
    this.chunks = 0;
    this.blocks = 0;
    this.blockSize = 0.5;
    this.wallHeight = 20;
    this.useWater = true;
    this.waterPosition = 0.2;
    this.mapWidth = 0;
    this.mapHeight = 0;
    this.meshes = {};
    this.entities = {};
    this.terrain = [];
    
    this.scene = new THREE.Scene();

    const tl = new TerrainLoader({world: this});

    tl.load('maps/map4.png', this.wallHeight, this.blockSize, (terrainChunkJSON) =>{

      this.chunkManager = new ChunkManager({
        world: this,
        terrainChunkJSON: terrainChunkJSON
      });

      this.chunkManager.BuildAllChunks(this.chunkManager.worldChunks);

      if(!is_server){ //put in client object?
        this.client = new ClientManager({
          scene: this.scene
        });
      }

      if(props.entities){
        let ents = props.entities;
        delete props.entities;
        this.importEntities(ents);
      }
    });

    Object.assign(this, props);
};

World.prototype.loadEntityModel = function(entity_type, callback){
    const vox = new Vox({
      filename: __dirname+ "/../models/" + entity_type+".vox",
      name: entity_type
    });

    vox.LoadModel((vox, entity_type) => {
        if(_.isUndefined(this.meshes[entity_type])){
          this.meshes[entity_type] = {};
        }

        this.meshes[entity_type].vox = vox;
        callback();
    });
}

World.prototype.importEntities = function(entity_tree){
  console.log("import Entities");
  const entity_types = _.keys(entity_tree);

  async.each(entity_types, 
             this.loadEntityModel.bind(this), 
             this.registerEntities(entity_tree));
};

World.prototype.registerEntities = function(entity_tree){
  const world = this;  
  _.each(_.keys(entity_tree), function(entity_type){
    _.each(entity_tree[entity_type], function(entity_props){
      delete entity_props.world;
      entity_props.world = world;
      const et = new EntityClasses[entity_type](entity_props);
      world.registerEntity(et);
    });
  });
};

World.prototype.registerEntity = function(entity){
  const entity_type = entity.constructor.name;
  if(_.isUndefined(this.entities[entity_type])){
    const eTree = {};
    eTree[entity.id] = entity;
    this.entities[entity_type] = eTree;
  }

  this.scene.add(entity.mesh);
  this.entities[entity_type][entity.id] = entity;
};

World.prototype.flatEntities = function(){
  return _.flatten(_.map(_.toArray(this.entities), function(et){ return _.toArray(et);}));
};

World.prototype.update = function(delta){
  const invMaxFps = 1/60;
  THREE.AnimationHandler.update(invMaxFps);
  //this.chunkManager.Draw(delta, invMaxFps);

  _.each(this.entities.Actor, function(actor){
    actor.update(delta);
  });
};

World.prototype.render = function(){
  if(this.client){
    this.client.render();
  }
};

module.exports = World;



