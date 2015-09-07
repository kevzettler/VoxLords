const _ = require('lodash');
const async = require('async');
const ChunkManager = require('./ChunkManager');
const VoxLoader = require('./VoxLoader');
const TerrainLoader = require('./TerrainLoader');
const ClientManager = require('./ClientManager');
const Vox = require('./Vox');
const EntityClasses = require('./entities');
const THREE = require('three');
const Immutable = require('immutable');
const is_server = (typeof process === 'object' && process + '' === '[object process]');

function World(worldState) {
    // this.width = 0;
    // this.height = 0;
    // this.name = "Unknown";
    // this.map = undefined;
    // this.chunkSize = 16;
    // this.chunks = 0;
    // this.blocks = 0;
    // this.hemiLight = undefined;
    // this.dirLight = undefined;
    // this.blockSize = 0.5;
    // this.wallHeight = 20;
    // this.useWater = true;
    // this.waterPosition = 0.2;
    // this.mapWidth = 0;
    // this.mapHeight = 0;
    this.scene = new THREE.Scene();
    this.entities = {};
    
    this.buildTerrain(
      worldState.get('blockSize'),
      this.scene,
      worldState.get('terrain')
    );

    this.importEntities(worldState.get('entities'));

    this.client = new ClientManager({
      scene: this.scene
    });
    this.client.initPlayerCamera(this.entities.Guy[0]);

    // const tl = new TerrainLoader({
    //   chunkSize: this.chunkSize
    // });

    // tl.load('maps/map4.png', this.wallHeight, this.blockSize, (terrainChunkJSON) =>{

    //   this.chunkManager = new ChunkManager({
    //     blockSize: this.blockSize,
    //     scene: this.scene
    //   });
    //   this.chunkManager.processChunkList(Immutable.fromJS(terrainChunkJSON));
    //   this.chunkManager.BuildAllChunks(this.chunkManager.worldChunks);

    //   if(!is_server){ //put in client object?
    //     this.client = new ClientManager({
    //       scene: this.scene
    //     });
    //   }

    //   if(props.entities){
    //     let ents = props.entities;
    //     delete props.entities;
    //     this.importEntities(ents);
    //   }
    // });
};

World.prototype.buildTerrain = function(blockSize, scene, terrainChunkJSON){
    const chunkManager = new ChunkManager({
      blockSize: blockSize,
      scene: scene
    });
    chunkManager.processChunkList(terrainChunkJSON);
    chunkManager.BuildAllChunks(chunkManager.worldChunks);
}

World.prototype.initEntityType = function(entity_entry, entity_type){
  entity_entry.get('instances').forEach((entity_props) =>{
    const ent = new EntityClasses[entity_type](entity_props);
    ent.attachVox(entity_entry.get('mesh'));
    this.registerEntity(ent);
  });
};

World.prototype.importEntities = function(entity_map){
  const entity_iterator = entity_map.entries();
  entity_map.forEach(this.initEntityType.bind(this));
};

World.prototype.registerEntity = function(entity){
  const entity_type = entity.constructor.name;
  this.scene.add(entity.mesh);
  if(!this.entities[entity_type]){
    this.entities[entity_type] = [];
  }
  this.entities[entity_type].push(entity);
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



