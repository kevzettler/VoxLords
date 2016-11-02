'use strict';
const _ = require('lodash');
const async = require('async');
const ChunkManager = require('./ChunkManager');
const VoxLoader = require('./VoxLoader');
const Vox = require('./Vox');
const EntityClasses = require('./entities');
const THREE = require('three');
const Immutable = require('immutable');
const Water = require('./Water');
const PhysBlockPool = require('./PhysBlockPool');

function World(props) {
    this.entities = {};
    this.chunkSize = 16;
    Object.assign(this, props);
    
    this.buildTerrain(
      this.worldState.get('blockSize'),
      this.scene,
      this.worldState.get('terrain')
    );

    this.water = new Water({
      environment: this.environment
    });
    this.water.Create(this.scene);

    this.importEntities(this.worldState.get('entityData'));

    if(this.render_container){
      this.blockPool = new PhysBlockPool({
        scene: this.scene,
        world: this
      }).Create(500);     
    }
};

World.prototype.buildTerrain = function(blockSize, scene, terrainChunkJSON){
    const chunkManager = new ChunkManager({
      blockSize: blockSize,
      scene: scene,
      world: this
    });

    this.chunkManager = chunkManager;

    //chunkManager.processChunkList(terrainChunkJSON);
    var wm = this.worldState.get('worldMap').toJS();
    _.each(wm, (ZList, XCoord) => {
      _.each(ZList, (chunkObj, ZCoord) => {
        chunkManager.createChunkFromData.call(chunkManager, Immutable.fromJS(chunkObj));
      });
    });
    chunkManager.BuildAllChunks(chunkManager.worldChunks);
};

World.prototype.initEntityType = function(entityData){
  if(!entityData){return;}
  this.initEntityInstance(entityData.get('type'), entityData.get('type'), entityData);
};

World.prototype.initEntityInstance = function(entityClassName, entityModelName, entityProps){  
  if(entityModelName === 'player'){
    entityModelName = 'Guy';
  }

  if(entityModelName === 'Bullet'){
    entityModelName = null;
  }
  
  let props = entityProps.toJS();
  if(props.REMOVE){
    return;
  }
  
  props.render_container = this.render_container;
  props.chunkManager = this.chunkManager;
  props.world = this;
  props.scene = this.scene;
  props.type = entityClassName;

  if(entityModelName){
    props.vox = this.worldState.get('entityMeshes').get(entityModelName)
  }

  if(!entityModelName){
    var geo = new THREE.BoxGeometry(1, 1, 1);
    var mat = new THREE.MeshBasicMaterial({color: 0xffffff});
    props.mesh = new THREE.Mesh(geo, mat);
  }

  const ent = new EntityClasses[entityClassName](props);
  ent.scene = this.scene;
  this.registerEntity(ent, entityClassName);
  return ent;
};

World.prototype.addPlayer = function(playerData){
  return this.initEntityInstance('player', 'Guy', Immutable.fromJS(playerData));
};

World.prototype.importEntities = function(entity_map){
//  const entity_iterator = entity_map.entries();
  entity_map.forEach(this.initEntityType.bind(this));
};

World.prototype.registerEntity = function(entity, entity_type){
  this.scene.add(entity.mesh);
  
  if(entity.bbox){
    this.scene.add(entity.bbox);
  }

  this.entities[entity.id] = entity;
};

//Primarily used on server?
World.prototype.exportEntities = function(){
  const ret = {};
  _.each(this.entities, (entity, id) => {
    ret[id] = entity.export();
  });
  return ret;
};

World.prototype.export = function(){
  return {
    /*
    * chunkManger.export provides a more compact data structure for terrain
    * none of the current import functions are setup to handle it
    */
    //terrain: this.chunkManager.export(),
    worldMap: this.worldState.get('worldMap').toJS(),
    entityData: this.exportEntities(),
    //blockSize: this.blockSize,    
  };
};


World.prototype.removeEntity = function(entityId){
  const entity = this.entities[entityId];
  if(entity.bbox){
    entity.bbox.visible = false;
  }
  entity.mesh.visible = false;
  entity.REMOVE = true;
};

World.prototype.update = function(delta, updateTick){
  //const invMaxFps = 1/60;
  //THREE.AnimationHandler.update(invMaxFps);

  //Redraw explode chunks here
  this.chunkManager.Draw(updateTick, delta);

  //this.water.Draw(updateTick / 5);

  //update all non static entities here  
  _.each(this.entities, (entity) => {
    if(entity){
      entity.updateHandler(delta);
    }
  });

  //update block particles
  if(this.render_container){
    _.each(this.blockPool.blocks, (physBlock) => {
      physBlock.Draw(Date.now(),delta);
    });
  }

};

module.exports = World;



