'use strict';
const Base = require('./base');
const util = require('util');

function ClientTerrainLoader(props){
  ClientTerrainLoader.super_.call(this, props);
};
util.inherits(ClientTerrainLoader, Base);

ClientTerrainLoader.prototype.readTerrainImage = function(filename, callback){
  console.log("ClientTerrainLoader: loading file name?", filename);
  var image = new Image();
  image.onload = callback;
  let path = "./maps/" + filename;
  console.log("before assign", path, __dirname);
  image.src = path;

  //HACK electron-spawn and electrion seems to link files differntly
  if(image.src.match('node_modules')){
    path = "../." + path;
    image.src = path;
  }

  console.log('wtf is image', image.src );
};


ClientTerrainLoader.prototype.extractTerrainImageData = function(e){
    const ctx = document.createElement('canvas').getContext('2d');
    const image = e.target;

    ctx.canvas.width  = image.width;
    ctx.canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    this.width = image.width;
    this.height = image.height;

    const imgData = ctx.getImageData(0, 0, this.width, this.height);

    return imgData;
};


module.exports = ClientTerrainLoader;