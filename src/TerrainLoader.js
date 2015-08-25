const ChunkTerrain = require('./ChunkTerrain');

function TerrainLoader(props){
    this.TerrainMap;
    this.chunkManager;
    this.chunkSize = 16;
    this.chunks = 0;
    this.blocks = 0;

    Object.assign(this,props);
    this.map = this.chunkManager.map;
};

TerrainLoader.prototype.load = function(filename, wallHeight, blockSize, callback) {
    this.wallHeight = wallHeight;
    this.blockSize = blockSize;
    this.readTerrainImage(filename, function(){
        this.readMap(callback);
    }.bind(this));
};

TerrainLoader.prototype.readMap = function(callback) {
    this.TerrainMap = new Array(this.map.length);
    
    for(var i = 0; i < this.TerrainMap.length; i++) {
        this.TerrainMap[i] = new Array();
    }
    
    this.mapHeight = this.blockSize*this.map.length;
    this.mapWidth = this.blockSize*this.map.length;

    for(var cy = 0; cy < this.map.length; cy+=this.chunkSize) {
        var alpha = 0;
        var total = 0;
        var chunk = new Array();
        for(var cx = 0; cx < this.map.length; cx+=this.chunkSize) {
            var ix = 0;
            for(var x = cx; x < cx+this.chunkSize; x++) {
                chunk[ix] = new Array();
                var iy = 0;
                for (var y = cy; y < cy+this.chunkSize; y++) {
                    if(this.map[x][y] == 0) {
                        alpha++;
                    } else {
                        this.blocks++;
                    }
                    chunk[ix][iy++] = this.map[x][y];
                    total++;
                }
                ix++;
            }
            var cSize = this.blockSize;

            if(total != alpha) {
                var c = new ChunkTerrain({chunkManager: this.chunkManager});
                c.Create(this.chunkSize, cSize, cx * cSize-this.blockSize/2, cy * cSize-this.blockSize/2, chunk, this.wallHeight, this.chunks);
                this.chunkManager.AddTerrainChunk(c);
                
                // Save to Terrain map
                var z = this.chunks%(this.map.length/this.chunkSize);
                var x = Math.floor(this.chunks/(this.map.length/this.chunkSize));
                this.TerrainMap[x][z] = {'id': this.chunks, 'avgHeight': c.GetAvgHeight()};
                this.chunks++;
            } else {
                console.log("=> Skipping invisible chunk.");
            }
        }
    }

    callback();
}; 

TerrainLoader.prototype.processTerrainImageData = function(imgData, callback){  
    const map = this.map; 
    this.TerrainMap = new Array();

    for(var y = 0; y < this.height; y++) {
        var pos = y * this.width * 4;
        map[y] = new Array();
        this.TerrainMap[y] = new Array();
        for(var x = 0; x < this.width; x++) {
            var r = imgData.data[pos++];
            var g = imgData.data[pos++];
            var b = imgData.data[pos++];
            var a = imgData.data[pos++];
            map[y][x] = {'r': r, 'g': g, 'b': b, 'a': a};
        }
    }

    console.log("Read Terrain complete.");
    this.chunkManager.maxChunks = (this.height / this.chunkSize)*(this.height/this.chunkSize);
    callback();
};

TerrainLoader.prototype.extractTerrainImageData = function(callback, e){
    const ctx = document.createElement('canvas').getContext('2d');
    const image = e.target;

    ctx.canvas.width  = image.width;
    ctx.canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    this.width = image.width;
    this.height = image.height;

    const imgData = ctx.getImageData(0, 0, this.width, this.height);
    this.processTerrainImageData(imgData, callback);
};

TerrainLoader.prototype.readTerrainImage = function(filename, callback) {
    // Read png file binary and get color for each pixel
    // one pixel = one block
    // Read RGBA (alpha is height)
    // 255 = max height
    // a < 50 = floor
    var image = new Image();
    image.src = "/"+filename;
    image.onload = this.extractTerrainImageData.bind(this, callback);
};

module.exports = TerrainLoader;