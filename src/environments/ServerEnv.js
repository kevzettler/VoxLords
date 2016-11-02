const _ = require('lodash');
const async = require('async');
const Buffer = require('buffer/index.js').Buffer;
const pako = require('pako');
const Immutable = require('immutable');
const util = require("util");
const BaseEnv = require('./base');
const THREE = require('../ThreeHelpers');
const SimplePeer = require('simple-peer');
const GameLoop = require('fixed-game-loop');
const CommandManager = require('../CommandManager');
const TerrainLoader = require('../TerrainLoader/client');
const signalHub = require('signalhub');
const SIGNALHUB_HOST = process.env.SIGNALHUB_HOST || 'localhost';

function ServerEnv(props){
  this.far = 191;
  this.clients = {};
  this.players = {};
  this.ready = false;
  Object.assign(this, props);
  ServerEnv.super_.call(this, Object.assign(this, props));

  console.log("ServerEnv(), Environment Vars ....");
  console.log(process.env.SIGNALHUB_PORT_8080_TCP_ADDR, "\n");
  console.log(process.env.GATEWAY_ADDRESS, "\n");
  console.log(process.env.GATEWAY_NETWORK, "\n");
  console.log(process.env.ANSIBLE_NETWORK, "\n");  
  console.log(process.env.ETH0_NETWORK, "\n");    
  console.log(process.env.LO_NETWORK, "\n");      
  console.log(process.env.ALL_ANSIBLE, "\n");


  console.log("ServerEnv() connecting to signal hub at ", SIGNALHUB_HOST);
  this.hub = signalHub('plebland', [
    `http://${SIGNALHUB_HOST}:8080`
  ]);

  console.log("SrverEnv() ", "subscribing to new clients on /client_offer");
  this.hub.subscribe('client_offer').on('data', (data) => {
    console.log("ServerEnv.hub.on'client_offer '", data);
    this.handleOffer(data.id, data.offer);
  });

  this.getWorldState(this.worldSetup.bind(this, props));
};
util.inherits(ServerEnv, BaseEnv);

ServerEnv.prototype.initHandler = function(){
  console.log("ServerEnv.initHandler()");
  
  this.ready = true;
  if(this.render_container){
    this.displayWidth = this.render_container.clientWidth;
    this.displayHeight = this.render_container.clientHeight;
    this.aspect = this.displayWidth/this.displayHeight;
    this.camera = new THREE.PerspectiveCamera(this.viewAngle, this.aspect, this.near, this.far);

    this.renderer = new THREE.WebGLRenderer( {antialias: true} );
    this.renderer.setSize(this.displayWidth, this.displayHeight);
    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
    
    this.render_container.appendChild(this.renderer.domElement);
    THREEx.WindowResize(this.renderer, this.camera);
    this.initPlayerCamera();
    this.setLights();

    this.clearColor = 0xeddeab;

    this.renderer.setClearColor(this.clearColor, 1);

    this.initStats();
  }

  console.log("ServerEnv.initHandler() clients ", this.clients);
  _.each(this.clients, (client) =>{
    client.signal(client.offer);
    delete client.offer;
  });

  ServerEnv.super_.prototype.initHandler.call(this);
};

ServerEnv.prototype.worldSetup = function(props, worldState){
  ServerEnv.super_.prototype.worldSetup.apply(this, [props, worldState]);
  this.emit('init');
};


ServerEnv.prototype.handleOffer = function(client_id, offer){
  console.log("ServerEnv.handleOffer() ", client_id, offer);
  if(!this.clients[client_id]){
    console.log("ServerEnv.handleOffer() initClient! ", client_id);    
    return this.initClient(client_id, offer);
  }else{
    this.clients[client_id].signal(offer); 
  }
};

ServerEnv.prototype.initClient = function(client_id, offer){  
  console.log("ServerEnv.initClient() ", client_id, offer);

  //Client is connected and authenticated here
  //fetch player data from DB
  const player = {
    position: [16, 2, 119],
    speed: 10,
    jumpHeight: 20,
    model: 'Guy',
    type: 'player',
    id: client_id,
  };

  const stunServers = [
    'stun.l.google.com:19302',
    'stun1.l.google.com:19302',
    'stun2.l.google.com:19302',
    'stun3.l.google.com:19302',
    'stun4.l.google.com:19302',
    'stun01.sipphone.com',
    'stun.ekiga.net',
    'stun.fwdnet.net',
    'stun.ideasip.com',
    'stun.iptel.org',
    'stun.rixtelecom.se',
    'stun.schlund.de',
    'stunserver.org',
    'stun.softjoys.com',
    'stun.voiparound.com',
    'stun.voipbuster.com',
    'stun.voipstunt.com',
    'stun.voxgratia.org',
    'stun.xten.com',
  ];

  var client = SimplePeer({
    trickle: true,
    config:{
      iceServers: [
        {
          url: 'turn:numb.viagenie.ca',
          credential: 'muazkh',
          username: 'webrtc@live.com'
        },
        {
          url: 'turn:192.158.29.39:3478?transport=udp',
          credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          username: '28224511:1379330808'
        },
        {
          url: 'turn:192.158.29.39:3478?transport=tcp',
          credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          username: '28224511:1379330808'
        }
      ].concat(_.map(stunServers, (server) => {
        return {url: "stun:"+server};
      })),
    },
    channelConfig: {
      ordered:false,
      maxRetransmits: 0
    }
  });

  client.signal(offer);
//  client.offer = offer;
  client.lastInputTick = 0;
  player.connection = client;

  client.on('signal', function(data){
    console.log("ServerEnv.client.on'signal' ", data);
    console.log("ServerEnv.hub.broadcast() ", 'server_'+client_id+'_ack');    
    this.hub.broadcast('server_'+client_id+'_ack', data);
  }.bind(this));

  client.on('connect', function(){
    console.log("ServerEnv.client.on'connect' ", client_id);
    client.connected = true;
    client.send('hello from server');
    player.entity = this.world.addPlayer(_.omit(player, 'connection'));    

    var worldExport = this.world.export(client_id);
    var wrap = {
      eventName: "serverConnect",
      eventData: worldExport
    };

    var zipped = pako.deflate(JSON.stringify(wrap));
    var zbuf = new Buffer(zipped);
    var head = new Buffer(zipped.length+"kjz:\n");
    var payload = Buffer.concat([head, zbuf]);
    console.log("ServerEnv.client.on'connect' sending payload", client_id);
    client.send(payload);

    client.CommandManager = new CommandManager({
      player_entity: player.entity
    });

    client.updateInt = setInterval(() => {
      var wrap = {
        eventName: "serverUpdate",
        eventData: {
          entityData: this.world.exportEntities(),
          lastInputTick: client.lastInputTick,
        }
      };
      var zipped = pako.deflate(JSON.stringify(wrap));    
      var zbuf = new Buffer(zipped);
      var head = new Buffer(zipped.length+"kjz:\n");
      var payload = Buffer.concat([head, zbuf]);
      try{
        client.send(payload);      
      }catch(ex){
        console.error("failed to send server update to client");
      }
    }, 100);

  }.bind(this));

  client.on('close', () => {
    console.log("ServerEnv.client.on'close' ", client_id);

    client.connected = false;
    clearInterval(client.updateInt);
    if(typeof this.world !== 'undefined'){
      this.world.removeEntity(client_id);
    }
  });

  client.on('data', (data) => {
    console.log("ServerEnv.client.on data ", data);
    if(data.eventName){
      this[data.eventName].apply(this, [client, data.eventData]);
    }
  });

  client.on('error', (err) => {
    clearInterval(client.updateInt);
    console.log("ServerEnv.client.on'error' ", err);
  });

  client.on('finish', () => {
    clearInterval(client.updateInt);    
    console.log("ServerEnv.client.on'finish", arguments);
  })

  client.on('end', () => {
    clearInterval(client.updateInt);
    this.clients[client_id] = null; //best way to derference?
    console.log("ServerEnv.client.on'end' ", arguments);
  });

  this.players[client_id] = player;
  this.clients[client_id] = player.connection;
};

ServerEnv.prototype.playerInput = function(client, inputData){
  client.CommandManager.execute(inputData.commandName, inputData.commandData);
  client.lastInputTick = inputData.sequenceTick;
};

ServerEnv.prototype.initPlayerCamera = function(player_entity){
  // if(this.render_container){
  //   const controls = new THREE.FirstPersonControls( this.camera, this.render_container, this.render_container );
  //   controls.movementSpeed = 10;
  //   controls.lookSpeed = 0.112;
  //   controls.lookVertical = true;
  //   this.controls = controls;
  // }  
  this.camera.position.set(66, 190, 68);
  const target = this.camera.position.clone();
  target.y = 0;
  this.camera.lookAt(target);
  this.camera.rotation.z = 3.0707963317943965;
};

ServerEnv.prototype.getWorldState = function(callback){
  //TODO pull on startup. stored in DB or generated
  
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

  async.parallel({
    worldMap: this.loadTerrain.bind(this),
    entityData: this.fetchEntityData,
    //todo this should be serial we don't know what entity meshes we need
    //untill the entity data is fetched
    entityMeshes: this.loadEntityMeshes.bind(this, ["Tree", "Guy", "MechSniper"]) 
  },
  (err, results) => {
    console.log("Got everything?");

    if(err){
      return console.log(err);
    }
    
    this.entityMeshes = results.entityMeshes;
    Object.assign(worldState, results);
    callback(Immutable.fromJS(worldState));
  });
};

ServerEnv.prototype.fetchEntityData = function(callback){
  //TODO pull this from redis or something
  const entities = [
        {type:"Tree", id:1,position:[8,2,110], scale:2},
        {type:"Tree", id:2,position:[45,2,60], scale:2},
        {type:"Tree", id:3,position:[59,2,35], scale:2},
        {type:"Tree", id:5,position:[33,2,13], scale:2},
        {type:"Tree", id:6,position:[110,2.5,16], scale:2},
        {type:"Tree", id:7,position:[107,2.5,27], scale:2},
        {type:"Tree", id:8,position:[92,3.5,109], scale:2},
        {type:"Tree", id:9,position:[86,3.5,107], scale:2},
        {type:"MechSniper", id:4,position:[20,2,110], scale:2},
      ];

      // "Cloud": [
      //   {type:"Cloud", position:[16, 20, 110], scale:2},
      //   {type:"Cloud", position:[20, 30, 90], scale:2},            
      //   {type:"Cloud", position:[16, 40, 110], scale:2},
      //   {type:"Cloud", position:[16, 80, 110], scale:2},                        
      // ]

  callback(null, entities);
};


ServerEnv.prototype.loadTerrain = function(callback){
  const wallHeight = 20;
  const blockSize = 0.5;
  const tl = new TerrainLoader();

  console.log('where ami', __dirname);
  tl.load('map4.png', 
          wallHeight,
          blockSize,
          callback
  );
};

ServerEnv.prototype.update = function(dt, elapsed){
  ServerEnv.super_.prototype.update.apply(this, [dt, elapsed]);
};

ServerEnv.prototype.render = function(dt, elapsed){
  if(!this.render_container){return null;}
  ServerEnv.super_.prototype.render.apply(this, [dt, elapsed]);
};

module.exports = ServerEnv;








