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
  if(is_server){
    //get terrain
    //get entities
  }else{

  }

  const worldState = {
      mapId: 4,
      mapFile: "maps/map4.png",
      mapName: "Voxadu Beach: Home of Lord Bolvox",
      playerPosition: new THREE.Vector3(16, 0, 119),
      playerModel: "player",
      fogColor: 0xeddeab,
      clearColor: 0xeddeab,
      blockSize: 0.5,
      wallHeight: 20,
      useWater: true,
      waterPosition: 0.2,
      entities: {
          "Guy": [
            {position:[16,-0.5,119]}
          ],

          "Tree": [
            {position:[0,-0.5,90], scale:2}
            // {position:[45,2,60], scale:2},
            // {position:[59,2,35], scale:2},
            // {position:[17,2,13], scale:2},
            // {position:[33,2,13], scale:2},
            //{position:[110,2.5,16], scale:2},
            // {position:[107,2.5,27], scale:2},
            // {position:[92,3.5,109], scale:2},
            // {position:[86,3.5,107], scale:2},
          ]
      },
      terrain: []
  };
  callback(worldState);
};

module.exports = Game;
