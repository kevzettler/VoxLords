'use strict';
const ChunkTerrain = require('../ChunkTerrain');

function TerrainLoader(props){
    this.chunks = 0;
    this.blocks = 0;
    this.chunkSize = 16;

    Object.assign(this,props);
};

TerrainLoader.prototype.imageLoadHandler = function(callback, loadEvent){
    console.log('image load handler!!');
    const imgData = this.extractTerrainImageData(loadEvent);
    const terrainData = this.processTerrainImageData(imgData);
    const worldData = this.readTerrainData(terrainData);
    callback(null, worldData.worldMap);
};

TerrainLoader.prototype.load = function(filename, wallHeight, blockSize, callback) {
    this.wallHeight = wallHeight;
    this.blockSize = blockSize;
    this.readTerrainImage(filename, this.imageLoadHandler.bind(this, callback));
};

/*
*
* Iterate over the grid of rgb + alpha values
* KJZ I think this just takes the terrainData and blows it out by chunksize?
* Yeah and it seems changing chunk size breaks this.
* essentially the pixel data is too small for a 1x1 mapping in 3d and this expands it?
*/
TerrainLoader.prototype.readTerrainData = function(terrainData) {
    const worldMap = new Array(terrainData.length);
    for(var i = 0; i < worldMap.length; i++) {
        worldMap[i] = new Array();
    }

    this.mapHeight = this.blockSize*terrainData.length;
    this.mapWidth = this.blockSize*terrainData.length;

    for(var chunkY = 0; chunkY < terrainData.length; chunkY+=this.chunkSize) {
        var alpha = 0;
        var total = 0;
        var chunk = new Array();
        for(var chunkX = 0; chunkX < terrainData.length; chunkX+=this.chunkSize) {
            var ix = 0;
            for(var x = chunkX; x < chunkX+this.chunkSize; x++) {
                chunk[ix] = new Array();
                var iy = 0;
                for (var y = chunkY; y < chunkY+this.chunkSize; y++) {
                    if(terrainData[x][y] == 0) {
                        alpha++;
                    } else {
                        this.blocks++;
                    }
                    chunk[ix][iy++] = terrainData[x][y];
                    total++;
                }
                ix++;
            }
            var cSize = this.blockSize;

            if(total != alpha) {
                //this is the data structure for making chunks
                const terrainChunk = {
                    posX: chunkX * cSize-this.blockSize/2,
                    posY: chunkY * cSize-this.blockSize/2,
                    /* wtf */
                    //this is actually passing a subset of the map color data {a r g b}
                    //Its used to determine the chunks height for blocks
                    mapData: chunk.splice(0), //KJZ wtf this is being silently mutated
                    //because its defined in the parent loop
                    //looks like it is a subset of the RGBA data for that chunk.
                    //chunk manager calls this 'blocks'
                    id: this.chunks
                };

                /*
                *
                * TODO KJZ there used to be a 'worldMap'
                * data structure generated here in addition to the chunks
                * This was used in all the chunkmanager calculations.
                * maybe I can consolidate it with the chunk list?
                */

                // Save to world map
                var z = this.chunks%(terrainData.length/this.chunkSize);
                var x = Math.floor(this.chunks/(terrainData.length/this.chunkSize));
                worldMap[x][z] = Object.assign({
                    'id': this.chunks, 
                    'avgHeight': 0, //Height of blocks
                }, terrainChunk);
                this.chunks++;
            } else {
                console.log("=> Skipping invisible chunk.");
            }
        }
    }

    return {
        worldMap
    };
}; 

/*
* Iterate over all the pixels from image data and create
* a grid of rgb and alpha values
*/
TerrainLoader.prototype.processTerrainImageData = function(imgData){  
    const terrainData = [];

    for(var y = 0; y < this.height; y++) {
        var pos = y * this.width * 4;
        terrainData[y] = new Array();
        for(var x = 0; x < this.width; x++) {
            var r = imgData.data[pos++];
            var g = imgData.data[pos++];
            var b = imgData.data[pos++];
            var a = imgData.data[pos++];
            terrainData[y][x] = {'r': r, 'g': g, 'b': b, 'a': a};
        }
    }

    return terrainData;
};


TerrainLoader.prototype.extractTerrainImageData = function(e){
  /*
  * Get raw image pixel data, from an image tag load event image reference
  */
  throw "theres no extractTerrain implemented";
};


TerrainLoader.prototype.readTerrainImage = function(filename, callback) {
  // Read png file binary and get color for each pixel
  // one pixel = one block
  // Read RGBA (alpha is height)
  // 255 = max height
  // a < 50 = floor
  throw "unimplemented readTerrainImage";
};

module.exports = TerrainLoader;