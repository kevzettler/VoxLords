navigator = {};
const util = require('util');
const World = require('./World.js');
const Actor = require('./entities/Actor.js');
const GameLoop = require('fixed-game-loop');
const is_server = (typeof process === 'object' && process + '' === '[object process]');

const Game = function(network, canvas){
  this.network = network;
  this.canvas = canvas;
  //this.scene = new THREE.Scene();
  //  this.camera = new THREE.PerspectiveCamera(this.viewAngle, this.aspect, this.near, this.far);
  // this.scene.add(this.camera);

  this.loop = new GameLoop({
    update: this.update,
    render: this.render
  });

  
  this.getWorldState(function(worldState){
    this.world = new World(worldState);    
    this.loop.start();
  });
};

Game.prototype.update = function(dt, elapsed){
  this.world.update.call(w, dt);
};

Game.prototype.render = function(){
    if(is_server){return true;}
    this.world.render();
};

Game.prototype.getWorldState = function(callback){
  //pulled on startup. Either stored in a db or fetched from client on server
  // if(is_server)
  // {
  // }else{
  // }

  const worldState = {
      mapId: 4,
      mapFile: "maps/map4.png",
      mapName: "Voxadu Beach: Home of Lord Bolvox",
      playerPosition: new THREE.Vector3(16, 0.5, 119),
      playerModel: "player",
      fogColor: 0xeddeab,
      clearColor: 0xeddeab,
      blockSize: 0.5,
      wallHeight: 20,
      useWater: true,
      waterPosition: 0.2,
      entities: {
          "Tree": [
            {x:8,y:2,z:110,scale:2},
            {x:45,y:2, z:60, scale:2},
            {x:59,y:2,z:35, scale:2},
            {x:17,y:2,z:13, scale:2},
            {x:33,y:2,z:13, scale:2},
            {x:110,y:2.5,z:16, scale:2},
            {x:107,y:2.5,z:27, scale:2},
            {x:92,y:3.5,z:109, scale:2},
            {x:86,y:3.5,z:107, scale:2},
          ]
      },
      terrain: []
  };
  callback(wroldState);
};

module.exports = Game;
