'use strict';
const THREE = require('three');
const environments = {
  client: require('./environments/ClientEnv'),
  server: require('./environments/ServerEnv')
};

const Game = function(props){
  this.network = null;
  this.render_container = null;
  this.client = null;
  this.render_tick = 0;
  this.update_tick = 0;
  this.scene = new THREE.Scene();
  Object.assign(this, props);

  this.client = new environments[this.environment](this);
};

module.exports = Game;
