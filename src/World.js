const ChunkWorld = require('./ChunkWorld');

function World() {
    this.width = 0;
    this.height = 0;
    this.name = "Unknown";
    this.map = undefined;
    this.chunkSize = 16;
    this.chunks = 0;
    this.blocks = 0;
    this.hemiLight = undefined;
    this.dirLight = undefined;
    this.wallHeight = 15;
    this.blockSize = 0.1;
    this.mapWidth = 0;
    this.mapHeight = 0;
};

World.prototype.Load = function(filename, wallHeight, blockSize) {
    this.wallHeight = wallHeight;
    this.blockSize = blockSize;
    this.readWorldImage(filename);
    this.readMap();
};

World.prototype.readMap = function() {
    if(this.map == undefined) {
        var that = this;
        setTimeout(function() {
            that.readMap()
        }, 500);
        console.log("loading map...");
        return;
    }

    game.worldMap = new Array(this.map.length);
    for(var i = 0; i < game.worldMap.length; i++) {
        game.worldMap[i] = new Array();
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

            //KJZ DON"T THINK THIS IS GETTING EXECUTED?
            if(total != alpha) {
                var c = new ChunkWorld();
                c.Create(this.chunkSize, cSize, cx * cSize-this.blockSize/2, cy * cSize-this.blockSize/2, chunk, this.wallHeight, this.chunks);
                game.chunkManager.AddWorldChunk(c);
                
                // Save to world map
                var z = this.chunks%(this.map.length/this.chunkSize);
                var x = Math.floor(this.chunks/(this.map.length/this.chunkSize));
                game.worldMap[x][z] = {'id': this.chunks, 'avgHeight': c.GetAvgHeight()};
                this.chunks++;
            } else {
                console.log("=> Skipping invisible chunk.");
            }
        }
    }

}; 

World.prototype.processWorldImageData = function(imgData){  
    const map = new Array();  
    game.worldMap = new Array();

    for(var y = 0; y < this.height; y++) {
        var pos = y * this.width * 4;
        map[y] = new Array();
        game.worldMap[y] = new Array();
        for(var x = 0; x < this.width; x++) {
            var r = imgData.data[pos++];
            var g = imgData.data[pos++];
            var b = imgData.data[pos++];
            var a = imgData.data[pos++];
            map[y][x] = {'r': r, 'g': g, 'b': b, 'a': a};
        }
    }

    this.map = map;
    console.log("Read world complete.");
    game.chunkManager.maxChunks = (this.height / this.chunkSize)*(this.height/this.chunkSize);
    return map;
};

World.prototype.extractWorldImageData = function(e){
    const ctx = document.createElement('canvas').getContext('2d');
    const image = e.target;

    ctx.canvas.width  = image.width;
    ctx.canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    this.width = image.width;
    this.height = image.height;

    const imgData = ctx.getImageData(0, 0, this.width, this.height);
    this.processWorldImageData(imgData);
};

World.prototype.readWorldImage = function(filename) {
    // Read png file binary and get color for each pixel
    // one pixel = one block
    // Read RGBA (alpha is height)
    // 255 = max height
    // a < 50 = floor
    var image = new Image();
    image.src = "/"+filename;
    image.onload = this.extractWorldImageData.bind(this);
};
module.exports = World;



