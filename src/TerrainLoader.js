const ChunkTerrain = require('./ChunkTerrain');

function TerrainLoader(props){
//    this.chunkManager;
//    this.chunkSize = 16;
    this.chunks = 0;
    this.blocks = 0;

    Object.assign(this,props);
    this.chunkSize = this.world.chunkSize;
//    this.map = this.chunkManager.map;
};

TerrainLoader.prototype.imageLoadHandler = function(callback, loadEvent){
    const imgData = this.extractTerrainImageData(loadEvent);
    const terrainData = this.processTerrainImageData(imgData);
    const chunkList = this.readTerrainData(terrainData);
    callback(chunkList);
};

TerrainLoader.prototype.load = function(filename, wallHeight, blockSize, callback) {
    this.wallHeight = wallHeight;
    this.blockSize = blockSize;
    this.readTerrainImage(filename, this.imageLoadHandler.bind(this, callback));
};

TerrainLoader.prototype.readTerrainData = function(terrainData) {
    const chunkList = [];

    this.mapHeight = this.blockSize*terrainData.length;
    this.mapWidth = this.blockSize*terrainData.length;

    for(var cy = 0; cy < terrainData.length; cy+=this.chunkSize) {
        var alpha = 0;
        var total = 0;
        var chunk = new Array();
        for(var cx = 0; cx < terrainData.length; cx+=this.chunkSize) {
            var ix = 0;
            for(var x = cx; x < cx+this.chunkSize; x++) {
                chunk[ix] = new Array();
                var iy = 0;
                for (var y = cy; y < cy+this.chunkSize; y++) {
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
                    chunkSize: this.chunkSize,
                    blockSize: cSize,
                    posX: cx * cSize-this.blockSize/2,
                    posY: cy * cSize-this.blockSize/2,
                    map: chunk.splice(0),
                    wallHeight: this.wallHeight,
                    id: this.chunks
                };

                chunkList.push(terrainChunk);
                
                //const c = new ChunkTerrain({chunkManager: this.chunkManager});
                //c.Create(this.chunkSize, cSize, cx * cSize-this.blockSize/2, cy * cSize-this.blockSize/2, chunk, this.wallHeight, this.chunks);
                //this.chunkManager.AddTerrainChunk(c);
                
                // Save to Terrain map
                //var z = this.chunks%(terrainData.length/this.chunkSize);
                //var x = Math.floor(this.chunks/(terrainData.length/this.chunkSize));
                //this.TerrainMap[x][z] = {'id': this.chunks, 'avgHeight': c.GetAvgHeight()};
                this.chunks++;
            } else {
                console.log("=> Skipping invisible chunk.");
            }
        }
    }

    return chunkList;
}; 

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

TerrainLoader.prototype.readTerrainImage = function(filename, callback) {
    // Read png file binary and get color for each pixel
    // one pixel = one block
    // Read RGBA (alpha is height)
    // 255 = max height
    // a < 50 = floor
    var image = new Image();
    image.src = "/"+filename;
    image.onload = callback;
};

module.exports = TerrainLoader;