const util = require('util');
const World = require('./World.js');
const GameLoop = require('fixed-game-loop');
const is_server = (typeof process === 'object' && process + '' === '[object process]');
const THREE = require('three');
const Immutable = require('immutable');
const TerrainLoader = require('./TerrainLoader');
const Vox = require('./Vox');
const async = require('async');

const Game = function(props){
  this.network = null;
  this.render_container = null;
  this.render_tick = 0;
  this.update_tick = 0;
  Object.assign(this, props);

  this.getWorldState((worldState) => {
    this.world = new World(worldState, this);
    window.world = this.world;

    this.loop = new GameLoop({
      update: this.update.bind(this),
      render: this.render.bind(this)
    });

    this.loop.start();
  });
};


Game.prototype.loadTerrain = function(callback){
  const wallHeight = 20;
  const blockSize = 0.5;
  const tl = new TerrainLoader();

  tl.load('maps/map4.png', 
          wallHeight, 
          blockSize,
          (terrainChunkJSON) => {callback(terrainChunkJSON)});
};

Game.prototype.loadVoxFile = function(entity_name, callback){
    const vox = new Vox({
        filename: entity_name+".vox",
        name: entity_name
    });
    
    vox.LoadModel((vox, name) =>{
        console.log("loaded mesh", name);
        callback(null, {[name]: vox});
    });
};

Game.prototype.loadEntityMeshes = function(entities, callback){
  function mergeMeshes(err, entity_meshes){
      const reducedMeshes = _.reduce(entity_meshes, (total, mesh) =>{
        return Object.assign(total, mesh);
      });
      callback(reducedMeshes);
  }

  async.map(Object.keys(entities), 
            this.loadVoxFile.bind(this), 
            mergeMeshes);
};

Game.prototype.loadEntities = function(callback){

      //TODO pull this from redis or something
      const entities = {
          "Guy": [
            {
//             position:[16, 200, 119],
             position:[76,200,107], 
             display: 'kevisazombie'
            }
          ],

          "Tree": [
            {position:[8,2,110], scale:2},
            // {position:[45,2,60], scale:2},
            // {position:[59,2,35], scale:2},
            // {position:[17,2,13], scale:2},
            // {position:[33,2,13], scale:2},
            // {position:[110,2.5,16], scale:2},
            // {position:[107,2.5,27], scale:2},
            // {position:[92,3.5,109], scale:2},
            // {position:[86,3.5,107], scale:2}
          ],

          // "Cloud": [
          //   {position:[16, 20, 110], scale:2},
          //   {position:[20, 30, 90], scale:2},            
          //   {position:[16, 40, 110], scale:2},
          //   {position:[16, 80, 110], scale:2},                        
          // ]
      };

    this.loadEntityMeshes(entities, (entity_meshes) =>{
        const allEntityData = {};
        _.each(_.keys(entity_meshes), (entity_type) => {
          allEntityData[entity_type] = {
            mesh: entity_meshes[entity_type],
            instances: entities[entity_type]
          };
        });

        callback(allEntityData);
    });
};

Game.prototype.getWorldState = function(callback){
  //TODO pull on startup. Either stored in a db or fetched from client on server
  // if(is_server){
  //   //get terrain
  //   //get entities
  // }else{ }

  const worldState = {
      mapId: 4,
      mapFile: "maps/map4.png",
      mapName: "Voxadu Beach: Home of Lord Bolvox",
      fogColor: 0xeddeab,
      clearColor: 0xeddeab,
      blockSize: 0.5,
      wallHeight: 20,
      useWater: true,
      waterPosition: 0.2,
      terrain: []
  };

  this.loadTerrain((terrainData) => {
    worldState.terrain = terrainData;
    this.loadEntities((entityData) => {
      worldState.entities = entityData;
      callback(Immutable.fromJS(worldState));
    });
  });
};

Game.prototype.update = function(dt, elapsed){
  this.world.update.call(this.world, dt);
  this.update_tick++;
};

Game.prototype.render = function(){
    if(is_server){return true;}
    this.world.render.call(this.world);
    this.render_tick++;
};

module.exports = Game;
