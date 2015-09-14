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

function World(worldState, Game) {
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

    if(Game.render_container){
      this.client = new ClientManager({
        scene: this.scene,
        player_entity: this.entities.Guy[0],
        Game: Game
      });
    }else{
      Game.network.subscribe("user_input", (user_input) =>{
        console.log("SERVER: got some user input", user_input);
      });
    }


    window.guy = this.entities.Guy[0];
};

World.prototype.buildTerrain = function(blockSize, scene, terrainChunkJSON){
    const chunkManager = new ChunkManager({
      blockSize: blockSize,
      scene: scene
    });

    window.chunkManager = chunkManager;

    chunkManager.processChunkList(terrainChunkJSON);
    chunkManager.BuildAllChunks(chunkManager.worldChunks);
}

World.prototype.initEntityType = function(entity_entry, entity_type){
  entity_entry.get('instances').forEach((entity_props) =>{
    const ent = new EntityClasses[entity_type](entity_props);
    ent.attachVox(entity_entry.get('mesh'));
    ent.scene = this.scene;
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

  //Redraw explode chunks here
  //this.chunkManager.Draw(delta, invMaxFps);

  //update all non static entities here
  this.entities.Guy[0].update(delta);
};

World.prototype.render = function(){
  if(!this.client){return;}
  return this.client.render();
};

module.exports = World;



