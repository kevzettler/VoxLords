const _ = require('lodash');
const ChunkWorld = require('./ChunkWorld');
const EntityClasses = require('./entities');
const VoxLoader = require('./VoxLoader');
const THREE = require('three');
const is_server = (typeof process === 'object' && process + '' === '[object process]');

function World(props) {
    this.width = 0;
    this.height = 0;
    this.name = "Unknown";
    this.map = undefined;
    this.chunkSize = 16;
    this.chunks = 0;
    this.blocks = 0;
    this.hemiLight = undefined;
    this.dirLight = undefined;
    this.wallHeight = 15;
    this.blockSize = 0.1;
    this.mapWidth = 0;
    this.mapHeight = 0;
    this.entities = {};
    this.terrain = [];
    this.scene = new THREE.Scene();
    
    this.voxLoader = new VoxLoader();

    if(props.entities){
      let ents = props.entities;
      delete props.entities;
      this.processEntityJSON(ents);
    }

    if(!is_server){ //put in client object?
      this.viewAngle = 40;
      this.aspect = this.screenWidth/this.screenHeight;
      this.near = 1;
      this.far = 61;
      this.camera = new THREE.PerspectiveCamera(this.viewAngle, this.aspect, this.near, this.far);
      this.scene.add(this.camera);     
      this.renderer = new THREE.WebGLRenderer( {antialias: true} );
      this.renderer.setSize(this.screenWidth, this.screenHeight);
      this.renderer.shadowMapEnabled = true;
      this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
      this.keyboard = new THREEx.KeyboardState();
      this.container = document.getElementById('container');
      this.container.appendChild(this.renderer.domElement);
      THREEx.WindowResize(this.renderer, this.camera);
    }

    Object.assign(this, options);
};

World.prototype.EntityVoxLoadHandler = function(entity_type, entity_props){
  const entityObject = new EntityClasses[entity_type](entity_props);
  this.registerEntity(entityObject);
};

World.prototype.fromEntityJSON = function(entity_type, entity_props){
      delete entity_props.world;
      entity_props.world = this;
      this.voxLoader.getModel(entity_type, this.EntityVoxLoadHandler.bind(this, entity_type, entity_props));
};

World.prototype.processEntityJSON = function(entity_json){
  _.each(_.keys(entity_json), (entity_type) =>{
    _.each(entity_json[entity_type], this.fromEntityJSON.bind(this, entity_type));
  });
};

World.prototype.registerEntity = function(entity){
  const entity_type = entity.constructor.name;
  if(_.isUndefined(this.entities[entity_type])){
    const eTree = {};
    eTree[entity.id] = entity;
    this.entities[entity_type] = eTree;
  }else{
    this.entities[entity_type][entity.id] = entity;
  }
};

World.prototype.flatEntities = function(){
  return _.flatten(_.map(_.toArray(this.entities), function(et){ return _.toArray(et);}));
};

World.prototype.update = function(delta){
  _.each(this.entities.Actor, function(actor){
    actor.update(delta);
  });
};

World.prototype.render = function(){
  _.each(this.flatEntities(), function(entity){
    entity.render();
  },this);
  this.renderer.render(this.scene, this.camera);
};

module.exports = World;



