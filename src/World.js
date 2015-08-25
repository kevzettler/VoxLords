const _ = require('lodash');
const ChunkManager = require('./ChunkManager');
const VoxLoader = require('./VoxLoader');
const TerrainLoader = require('./TerrainLoader');

const EntityClasses = require('./entities');
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
    this.chunkManager = new ChunkManager({world: this});

    const tl = new TerrainLoader({
      chunkManager: this.chunkManager
    });

    tl.load('maps/map4.png', this.wallHeight, this.blockSize, (terrainChunks) =>{
      //KJZ if I operate on a list of terrainChunk data here it dosen't seem to work
      // see TerrainLoader.js:71
            
      //this.chunkManager.processChunkList(terrainChunks);
      this.chunkManager.BuildAllChunks();
      if(props.entities){
        let ents = props.entities;
        delete props.entities;
        this.importEntities(ents);
      }
    });

    if(!is_server){ //put in client object?
      this.viewAngle = 40;
      this.aspect = window.innerWidth/window.innerHeight;
      this.near = 1;
      this.far = 61;
      
      this.camera = new THREE.PerspectiveCamera(this.viewAngle, this.aspect, this.near, this.far);
      this.scene.add(this.camera);
      //this.camera.aspect = this.aspect;
      //this.camera.updateProjectionMatrix();
      this.camera.position.set(16, 0.5, 119);
      //this.camera.rotation.set(-Math.PI/2.6, 0, Math.PI);
      //this.camera.lookAt(new THREE.Vector3(8,2,110));



      window.camera = this.camera;
      

      this.renderer = new THREE.WebGLRenderer( {antialias: true} );
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.shadowMapEnabled = true;
      this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
      
      this.keyboard = new THREEx.KeyboardState();
      this.container = document.getElementById('container');
      this.container.appendChild(this.renderer.domElement);
      THREEx.WindowResize(this.renderer, this.camera);
      this.fogColor = 0xeddeab;
      this.clearColor = 0xeddeab;
      //this.scene.fog = new THREE.Fog( this.fogColor, 40, 60 );
      this.renderer.setClearColor(this.clearColor, 1);

      // Init lights
      this.setLights();
    }

    Object.assign(this, props);
};

World.prototype.setLights = function() {
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
    dirLight.shadowCameraTop = d;
    dirLight.shadowCameraBottom = -d;

    dirLight.shadowCameraFar = 3500;
    dirLight.shadowBias = -0.0001;
    dirLight.shadowDarkness = 0.45;
};

World.prototype.importEntities = function(entity_json_tree){
  const world = this;
  _.each(_.keys(entity_json_tree), function(entity_type){
    _.each(entity_json_tree[entity_type], function(entity_props){
      delete entity_props.world;
      entity_props.world = world;
      new EntityClasses[entity_type](entity_props).then((entInstance) => {
        world.registerEntity(entInstance);
      });
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
  // _.each(this.flatEntities(), function(entity){
  //   entity.render();
  // },this);
  this.renderer.render(this.scene, this.camera);
};

module.exports = World;



