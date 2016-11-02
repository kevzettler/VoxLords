'use strict';
const Base = require('./base');
const util = require('util');
const fs = require('fs');
//if(typeof window === 'undefined'){
const Canvas = require('canvas');
//}

function ServerTerrainLoader(props){
  ServerTerrainLoader.super_.call(this, props);
};
util.inherits(ServerTerrainLoader, Base);

ServerTerrainLoader.prototype.readTerrainImage = function(filename, callback){

  fs.readFile('./' + filename, (err, data) =>{
    if (err) throw err;
    var img = new Canvas.Image();        
    this.img = img;    
    img.onload = callback;
    img.src = data;
  });
};

ServerTerrainLoader.prototype.extractTerrainImageData = function(){
  const canvas = new Canvas(this.img.width, this.img.height)      
  const ctx = canvas.getContext('2d');

  ctx.drawImage(this.img, 0, 0);
  this.width = this.img.width;
  this.height = this.img.height;

  const imgData = ctx.getImageData(0, 0, this.width, this.height);

  return imgData;
};

module.exports = ServerTerrainLoader;