'use strict';
const async = require('async');
const EventEmitter = require('events');
const util = require("util");
const GameLoop = require('fixed-game-loop');
const _ = require('lodash');
const THREE = require('../ThreeHelpers');
const World = require('../World');
const Vox = require('../Vox');

function BaseEnv(props){
  this.viewAngle = 40;
  this.near = 1;
  Object.assign(this, props);  
  EventEmitter.call(this);
  this.on('init', this.initHandler.bind(this));
};
util.inherits(BaseEnv, EventEmitter);

BaseEnv.prototype.initHandler = function(){
  this.loop = new GameLoop({
    update: this.update.bind(this),
    render: this.render.bind(this)
  });

  this.loop.start();
};

BaseEnv.prototype.setLights = function() {
  console.log("Initiate lights...");
  var ambientLight = new THREE.AmbientLight( 0x000033 );
  this.scene.add( ambientLight );

  var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.9 );
  hemiLight.color.setHSL( 0.6, 1, 0.6 );
  hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
  hemiLight.position.set( 0, 500, 0 );
  this.scene.add( hemiLight );

  var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
  dirLight.color.setHSL( 0.1, 1, 0.95 );
  dirLight.position.set( 10, 10.75, 10 );
  dirLight.position.multiplyScalar( 10 );
  this.scene.add( dirLight );

  dirLight.castShadow = true;

  dirLight.shadowMapWidth = 2048;
  dirLight.shadowMapHeight = 2048;

  var d = 150;

  dirLight.shadowCameraLeft = -d;
  dirLight.shadowCameraRight = d;
  dirLight.shadowCamefraTop = d;
  dirLight.shadowCameraBottom = -d;

  dirLight.shadowCameraFar = 3500;
  dirLight.shadowBias = -0.0001;
  dirLight.shadowDarkness = 0.45;
};

BaseEnv.prototype.initStats = function(){
  let stats = {
    begin: function(){},
    end: function(){}
  };

  stats = new Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  this.render_container.appendChild( stats.domElement );

  this.stats = stats;
};

BaseEnv.prototype.worldSetup = function(props, worldState){
  this.world = new World(Object.assign({}, {worldState: worldState}, props));
  if(this.debug){
    window.world = this.world;
  }
};

BaseEnv.prototype.loadVoxFile = function(entity_name, callback){
  console.log("loading vox file", entity_name);
  const vox = new Vox({
      filename: entity_name+".vox",
      name: entity_name,
      environment: this.environment,
      world: this.world
  });
  
  vox.LoadModel((vox, name) =>{
      console.log("loaded mesh", name);
      callback(null, {[name]: vox});
  });
};

/*
*
* entitiyNames -> ['Guy', 'Tree']
* callback -> function({Guy: vox, Tree: vox})
*/
BaseEnv.prototype.loadEntityMeshes = function(entityNames, callback){
  function mergeMeshes(err, entity_meshes){
      const reducedMeshes = _.reduce(entity_meshes, (total, mesh) =>{
        return Object.assign(total, mesh);
      });
      callback(null, reducedMeshes);
  }

  async.map(entityNames,
            this.loadVoxFile.bind(this), 
            mergeMeshes);
};

BaseEnv.prototype.assignEntityMeshes = function(entityData, entityMeshes){
  const entityInstancesAndMeshes = {};
  _.each(_.keys(entityMeshes), (entity_type) => {
    if(entityData[entity_type]){
      entityInstancesAndMeshes[entity_type] = {
        mesh: entityMeshes[entity_type],
        instances: entityData[entity_type]
      };
    }
  });

  return entityInstancesAndMeshes;
};

BaseEnv.prototype.update = function(dt, elapsed){
  if(this.stats){
    this.stats.begin();
  }

  this.world.update.call(this.world, dt, this.update_tick);
  this.update_tick++;
};

BaseEnv.prototype.render = function(){
  this.renderer.render(this.scene, this.camera);  
  this.render_tick++;

  if(this.stats){
    this.stats.end();
  }
};

module.exports = BaseEnv;







