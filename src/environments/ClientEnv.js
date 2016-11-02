'use strict';
const _ = require('lodash');
const util = require("util");
const Immutable = require('immutable');
const SimplePeer = require('simple-peer');
const pako = require('pako');
const THREE = require('../ThreeHelpers');
const BaseEnv = require('./base');
const DesktopInputManager = require('../DesktopInputManager');
const signalHub = require('signalhub');
const SIGNALHUB_HOST = process.env.SIGNALHUB_HOST || 'localhost';


function ClientEnv(props){
  this.far = 61;
  Object.assign(this, props);
  this.pendingServerUpdates = [];
  ClientEnv.super_.call(this, props);

  this.hub = signalHub('plebland', [
    `http://${SIGNALHUB_HOST}:8080`
  ]);
  
  this.network = this.setupNetwork();

  this.hub.subscribe(`server_${this.id}_ack`).on('data', (data) => {
    console.log("ClientEnv.hub.on'data' ", `server_${this.id}_ack`, data);
    this.network.signal(data);
  });  
};
util.inherits(ClientEnv, BaseEnv);

ClientEnv.prototype.serverConnect = function(data){
  this.serverDataHandler(this, data);
};

ClientEnv.prototype.serverUpdate = function(data){
  this.pendingServerUpdates.push(data);
};

ClientEnv.prototype.setupNetwork = function(){
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

  console.log('ClientEnv.setupNetwork ', this.id, "seeting up network");
  let client = new SimplePeer({ 
    initiator: true,
    trickle: true,
    channelConfig: {
      ordered:false,
      maxRetransmits: 0
    },
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

  });

  client.requestID = 0;

  client.on('signal', (data) =>{
    console.log("ClientEnv.client.on'signal' ", this.id, data);
    console.log("ClientEnv.hub.broadcast'client_offer'", this.id, data);
    this.hub.broadcast('client_offer', {id:this.id,offer:data});
  });

  client.on('connect', function () {
    console.log("ClientEnv.client.on'connect' ",this.id);
    client.send('Hello server from  client1');
  });

  var incomingLength = 0;
  var inProgressBuffer = new Buffer(0);
  client.on('data', (data) =>{
    //handle partial inProgressBuffers
    if(data.constructor.name === 'Buffer'){
      var headSeperator = "kjz:\n";
      var headSeperatorIndex = data.indexOf(headSeperator);

      //if we found a header this is the start of a new inProgressBuffer;
      if(headSeperatorIndex > 0){
        //inflator = new pako.Inflate();

        incomingLength = parseInt(data.slice(0, headSeperatorIndex).toString(),10);
        inProgressBuffer = Buffer.concat([inProgressBuffer, data.slice(headSeperatorIndex+headSeperator.length, data.length)]);
      }else if(incomingLength && inProgressBuffer.length < incomingLength){
        //todo streaming inflation here
        inProgressBuffer = Buffer.concat([inProgressBuffer, data]);
      }

      //sucessful end reached
      if(inProgressBuffer.length >= incomingLength){
        var payload = JSON.parse(pako.inflate(inProgressBuffer, {to: "string"}));
        incomingLength = 0;
        inProgressBuffer = new Buffer(0);

        if(payload.eventName){
          this[payload.eventName].call(this, payload.eventData);
        }
      }
    }
  });

  client.on('close', () => {
    console.log("server connection closed");
  });

  client.on('finish', () => {
    console.log("server connection finished");
  });

  client.on('end', () => {
    console.log("server connection end");
    this.network = this.setupNetwork();
  });  

  client.on('error', function(err){
    console.log("peer error", err);
  });

  return client;
}

ClientEnv.prototype.serverDataHandler = function(props, worldState){
  const entityNames = _.keys(worldState.entities);
  entityNames.push('Tree');
  entityNames.push('Guy');
  entityNames.push('MechSniper');
  this.loadEntityMeshes(entityNames, this.setupScene.bind(this, props, worldState));
};

ClientEnv.prototype.worldSetup = function(props, worldState){
  ClientEnv.super_.prototype.worldSetup.apply(this, [props, worldState]);
};

ClientEnv.prototype.initHandler = function(){
  const renderElement = this.render_container || document;
  this.displayWidth = this.render_container.clientWidth;
  this.displayHeight = this.render_container.clientHeight;
  this.aspect = this.displayWidth/this.displayHeight;  
  
  this.camera = new THREE.PerspectiveCamera(this.viewAngle, this.aspect, this.near, this.far);

  this.renderer = new THREE.WebGLRenderer( {antialias: true} );
  this.renderer.setSize(this.displayWidth, this.displayHeight);
  this.renderer.shadowMapEnabled = true;
  this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
  
  this.render_container.appendChild(this.renderer.domElement);

  // var captureInput = document.createElement('input');
  // captureInput.type = "text";
  // captureInput.className = "capture-input";
  // this.render_container.appendChild(captureInput);

  THREEx.WindowResize(this.renderer, this.camera);
  this.initPlayerCamera();

  // Init lights
  this.setLights();

  this.fogColor = 0xeddeab;
  this.clearColor = 0xeddeab;
  this.scene.fog = new THREE.Fog( this.fogColor, 40, 60 );
  this.renderer.setClearColor(this.clearColor, 1);

  if(this.debug){
    this.initStats();
  }

  ClientEnv.super_.prototype.initHandler.call(this);  
}

ClientEnv.prototype.setupScene = function(props, worldState, err, entityMeshes){
  worldState.entityMeshes = entityMeshes;
  this.worldSetup(props, Immutable.fromJS(worldState));
  this.playerEntity = this.world.entities[this.id];
  this.initHandler();
};

ClientEnv.prototype.serverUpdateEntityIterator = function(entityData, index){
  if(!entityData){
    return;
  }
  
  const entityType = entityData.type;
  let entRef = this.world.entities[entityData.id];

  if(typeof entRef === 'undefined' && !entityData.REMOVE){

    if(entityType === 'player'){
      entRef = this.world.addPlayer(entityData);
    }else{
      if(entityData.ownerId === this.id){
        return
      }
        entRef = this.world.initEntityInstance(entityType, entityType, Immutable.fromJS(entityData));
    }

    this.scene.add(entRef.mesh);
    return;
  }else if(entRef && entityData.REMOVE){
    this.scene.remove(entRef);
    delete this.world.entities[entityData.id]  // = null;
    return;      
  }

  if(entityData.id === this.id){
    // console.log(oldestUpdate);
    // _.each(this.inputCapture.commandHistory, (command) => {

    // });
  }else if(entRef){
    entRef.mesh.position.set.apply(entRef.mesh.position, entityData.position);
    entRef.mesh.quaternion.set.apply(entRef.mesh.quaternion, entityData.quaternion);
  }
};

ClientEnv.prototype.handlePendingServerUpdates = function(dt){
  if(!this.pendingServerUpdates.length){ return; }
  const oldestUpdate = this.pendingServerUpdates.shift();
  _.each(oldestUpdate.entityData, this.serverUpdateEntityIterator.bind(this));

  // this.world.entities = _.filter(this.world.entities, (entity) => {
  //   return !!entity
  // });
};

ClientEnv.prototype.update = function(dt){
  this.inputCapture.update(dt);
  this.handlePendingServerUpdates(dt);
  ClientEnv.super_.prototype.update.apply(this, arguments);
};

ClientEnv.prototype.initPlayerCamera = function(){
  const player_entity = this.playerEntity;
  player_entity.camera_obj = new THREE.Object3D();
  player_entity.mesh.add(player_entity.camera_obj);
  player_entity.camera_obj.add(this.camera);
  player_entity.attached_camera = 1;
  this.camera.position.set(0, 15, 7);
  this.camera.rotation.set(-Math.PI/2.6, 0, Math.PI);
  this.inputCapture = new DesktopInputManager({
    network: this.network,
    render_container: this.render_container,
    player_entity: player_entity,
    client_id: this.id,
  });
};


module.exports = ClientEnv;







