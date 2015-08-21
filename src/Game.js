navigator = {};
const util = require('util');
const World = require('./World.js');
const GameLoop = require('fixed-game-loop');
const is_server = (typeof process === 'object' && process + '' === '[object process]');
const THREE = require('three');

const Game = function(network, canvas){
  this.network = network;
  this.canvas = canvas;

  this.loop = new GameLoop({
    update: this.update.bind(this),
    render: this.render.bind(this)
  });
  
  this.getWorldState((worldState) => {
    this.world = new World(worldState);
    window.world = this.world;    
    this.loop.start();
  });
};

Game.prototype.update = function(dt, elapsed){
  this.world.update.call(this.world, dt);
};


Game.prototype.render = function(){
    if(is_server){return true;}
    this.world.render();
};

Game.prototype.getWorldState = function(callback){
  //pulled on startup. Either stored in a db or fetched from client on server
  if(is_server)
    //get terrain
    //get entities
  {
  }else{

  }

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
            {x:45,y:2,z:60, scale:2},
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
  callback(worldState);
};

module.exports = Game;
