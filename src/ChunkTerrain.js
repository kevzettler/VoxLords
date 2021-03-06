const util = require('util');
const Chunk = require('./Chunk');
const Block = require('./Block');
const THREE = require('./ThreeHelpers');

function ChunkTerrain(props) {
  ChunkTerrain.super_.call(this);  

  this.wallHeight = 1;
  this.worldWallHeight = 20; //wtf  
  this.chunkSize = 16;
  this.chunkSizeX = 16;
  this.chunkSizeY = 16;
  this.chunkSizeZ = 16;
  this.blockSize = 0.5;
  
  Object.assign(this,props);
};
util.inherits(ChunkTerrain,Chunk);

ChunkTerrain.prototype.Create = function(posX, posY, mapData, id) {
    this.cid = id;
    this.posX = posX;
    this.posY = posY;

    this.blocks = new Array();
    var tmpBlocks = new Array();
    var visible = false;
    var maxHeight = 0;
    for(var x = 0; x < this.chunkSize; x++) {
        this.blocks[x] = new Array();
        tmpBlocks[x] = new Array();
        for(var y = 0; y < this.chunkSize; y++) {
            this.blocks[x][y] = new Array();
            tmpBlocks[x][y] = new Array();
            this.wallHeight = mapData[x][y].a/this.worldWallHeight; // WTF
            var v = 0;
            for(var z = 0; z < this.chunkSize; z++) {
                visible = false; 

                if(mapData[x][y].a > 0  && z <= this.wallHeight) {
                    visible = true;
                    tmpBlocks[x][y][z] = 1;
                    v++;
                } else {
                    tmpBlocks[x][y][z] = 0;
                    visible = false;
                }
            }
            if(maxHeight < v) {
                maxHeight = v;
            }
        }
    }
    this.chunkSizeZ = maxHeight;

    // Skipping _a_lot_ of blocks by just allocating maxHeight for each block.
    for(var x = 0; x < this.chunkSize; x++) {
        for(var y = 0; y < this.chunkSize; y++) {
            for(var z = 0; z < this.chunkSizeZ; z++) {
                this.blocks[x][y][z] = new Block();
                var visible = false;
                if(tmpBlocks[x][y][z] == 1) {
                    visible = true;
                }
                this.blocks[x][y][z].Create(visible, 
                                            mapData[x][y].r, 
                                            mapData[x][y].g, 
                                            mapData[x][y].b, 
                                            mapData[x][y].a);
            }
        }
    }
};


ChunkTerrain.prototype.Rebuild = function() {
   var b = 0;
   var vertices = [];
   var colors = [];

   // Reset merged blocks
   for(var x = 0; x < this.chunkSize; x++) {
       for(var y = 0; y < this.chunkSize; y++) {
           for(var z = 0; z < this.chunkSizeZ; z++) {
               this.blocks[x][y][z].dls = false;
               this.blocks[x][y][z].dts = false;
               this.blocks[x][y][z].dfs = false;
               this.blocks[x][y][z].drs = false;
               this.blocks[x][y][z].dbs = false;
           }
       }
   }

   var drawBlock = false;
   for(var x = 0; x < this.chunkSize; x++) {
       for(var y = 0; y < this.chunkSize; y++) {
           var height = 0;
           for(var z = 1; z < this.chunkSizeZ; z++) { // Draw from 1 to skip "black" spots caused by image when there aint sharp borders for opacity
                if(this.blocks[x][y][z].isActive() == true) {
                    if(height < z) {
                        height = z;
                    }

                    // Check for hidden blocks on edges (between chunks)
                    if(x == this.chunkSize-1 && y < this.chunkSize-1 && y > 0 && z < this.chunkSizeZ-1) {
                        var id = this.cid + 1;
                        if(id >= 0 && id < this.worldChunks.size ) {
                            if(this.worldChunks.get(id).blocks[0][y][z] != null && this.worldChunks.get(id).blocks[0][y][z].isActive()) {
                                if(this.blocks[x][y-1][z].isActive() && 
                                   this.blocks[x-1][y][z].isActive() &&
                                       this.blocks[x][y+1][z].isActive() &&
                                           this.blocks[x][y][z+1].isActive()) {
                                    continue;
                                }
                            }
                          }
                    }

                    if(x == 0 && y < this.chunkSize-1 && y > 0 && z < this.chunkSizeZ-1 ) {
                        var id = this.cid - 1;
                        if(id >= 0 && id < this.worldChunks.size ) {
                            if(this.worldChunks.get(id).blocks[this.chunkSize-1][y][z] != null && this.worldChunks.get(id).blocks[this.chunkSize-1][y][z].isActive()) {
                                if(this.blocks[x][y-1][z].isActive() && 
                                   this.blocks[x][y+1][z].isActive() &&
                                       this.blocks[x+1][y][z].isActive() &&
                                           this.blocks[x][y][z+1].isActive()) {
                                    continue;
                                }
                            }
                        }
                    }


                    if(y == this.chunkSize-1 && x < this.chunkSize-1 && x > 0 && z < this.chunkSizeZ-1) {
                        var id = this.cid + Math.sqrt(this.worldChunks.size);
                        if(id >= 0 && id < this.worldChunks.size ) {
                            if(this.worldChunks.get(id).blocks[x][0][z] != null && this.worldChunks.get(id).blocks[x][0][z].isActive()) {
                                if(this.blocks[x-1][y][z].isActive() && 
                                   this.blocks[x+1][y][z].isActive() &&
                                       this.blocks[x][y-1][z].isActive() &&
                                           this.blocks[x][y][z+1].isActive()) {
                                    continue;
                                }
                            }
                        }
                    }

                    if(y == 0 && x < this.chunkSize-1 && x > 0 && z < this.chunkSizeZ-1 ) {
                        var id = this.cid - Math.sqrt(this.worldChunks.size);
                        if(id >= 0 && id < this.worldChunks.size ) {
                            if(this.worldChunks.get(id).blocks[x][this.chunkSize-1][z] != null && this.worldChunks.get(id).blocks[x][this.chunkSize-1][z].isActive()) {
                                if(this.blocks[x-1][y][z].isActive() && 
                                   this.blocks[x+1][y][z].isActive() &&
                                       this.blocks[x][y+1][z].isActive() &&
                                           this.blocks[x][y][z+1].isActive()) {
                                    continue;
                                }
                            }
                          }
                    }

                    var sides = 0;

                    drawBlock = false;

                    // left side (+X)
                    if(x > 0 ) { 
                        if(!this.blocks[x-1][y][z].isActive()) {
                            drawBlock = true;
                        } 
                    } else {
                        var id = this.cid - 1;
                        if(id != -1 && this.worldChunks.get(id).blocks[this.chunkSize-1][y][z] != null && //this.worldChunks.get(id).blocks[x][y][z].isActive() && 
                           this.worldChunks.get(id).blocks[this.chunkSize-1][y][z].drs) {
                            drawBlock = false;
                            this.blocks[x][y][z].dls = true;
                        } else {
                            drawBlock = true;
                        }
                    }

                    if(drawBlock) {
                        var countX = 0;
                        var countY = 0;
                        if(!this.blocks[x][y][z].dls) {
                            for(var cx = 1; cx < this.chunkSize; cx++) {
                               if(y+cx < this.chunkSize) {
                                    if(this.blocks[x][y+cx][z].isActive() && !this.blocks[x][y+cx][z].dls &&
                                       this.blocks[x][y+cx][z].r == this.blocks[x][y][z].r &&
                                           this.blocks[x][y+cx][z].g == this.blocks[x][y][z].g &&
                                               this.blocks[x][y+cx][z].b == this.blocks[x][y][z].b) 
                                        {
                                            countX++;
                                            var tmpCountY = 0;
                                            for(var cy = 1; cy < this.chunkSizeZ; cy++) {
                                                if(z+cy < this.chunkSizeZ) {
                                                    if(this.blocks[x][y+cx][z+cy].isActive() && !this.blocks[x][y+cx][z+cy].dls &&
                                                       this.blocks[x][y+cx][z+cy].r == this.blocks[x][y][z].r &&
                                                           this.blocks[x][y+cx][z+cy].g == this.blocks[x][y][z].g &&
                                                               this.blocks[x][y+cx][z+cy].b == this.blocks[x][y][z].b) 
                                                        {
                                                            tmpCountY++;
                                                        } else {
                                                            break;
                                                        }
                                                }
                                            }
                                            if(tmpCountY < countY || countY == 0) {
                                                countY = tmpCountY;
                                            }
                                            if(tmpCountY == 0 && countY > countX) {
                                                break;
                                            }
                                        } else {
                                            break;
                                        }
                               }
                            }

                            for(var x1 = 0; x1 <= countX; x1++) {
                                for(var y1 = 0; y1 <= countY; y1++) {
                                    if(this.blocks[x][y+x1][z+y1].dls) {
                                        countY = y1-1;
                                    } else {
                                        this.blocks[x][y+x1][z+y1].dls = true;
                                    }
                                }
                            }
                            this.blocks[x][y][z].dls = true;
                            sides++;
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize+(this.blockSize*countY)]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize+(this.blockSize*countX), z*this.blockSize+(this.blockSize*countY)]);

                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize+(this.blockSize*countX), z*this.blockSize+(this.blockSize*countY)]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize+(this.blockSize*countX), z*this.blockSize-this.blockSize]);

                            for(var i = 0; i < 6; i++) {
                                colors.push([this.blocks[x][y][z].r,
                                            this.blocks[x][y][z].g,
                                            this.blocks[x][y][z].b,
                                            255]);
                            }
                        }
                    }
                    drawBlock = false;

                    // right side (-X)
                    if(x < this.chunkSize - 1) {
                        if(!this.blocks[x+1][y][z].isActive()) {
                            drawBlock = true;
                        }
                    } else {
                        var id = this.cid - 1;
                          if(this.worldChunks.get(id).blocks[0][y][z] != null && this.worldChunks.get(id).blocks[0][y][z].isActive() && 
                             !this.worldChunks.get(id).blocks[0][y][z].dls) {
                              this.blocks[x][y][z].drs = true;
                              drawBlock = false;
                          } else {
                             drawBlock = true;
                          }
                    }

                    if(drawBlock) {
                        var countX = 0;
                        var countY = 0;
                        if(!this.blocks[x][y][z].drs) {
                            for(var cx = 1; cx < this.chunkSize; cx++) {
                                if(y+cx < this.chunkSize ) {
                                    if(this.blocks[x][y+cx][z].isActive() && !this.blocks[x][y+cx][z].drs &&
                                       this.blocks[x][y+cx][z].r == this.blocks[x][y][z].r &&
                                       this.blocks[x][y+cx][z].g == this.blocks[x][y][z].g &&
                                       this.blocks[x][y+cx][z].b == this.blocks[x][y][z].b) 
                                        {
                                            // Check how far we can draw other way
                                            countX++;
                                            var tmpCountY = 0;
                                            for(var cy = 1; cy < this.chunkSizeZ; cy++) {
                                                if(z+cy < this.chunkSizeZ) {
                                                    if(this.blocks[x][y+cx][z+cy].isActive() && !this.blocks[x][y+cx][z+cy].drs &&
                                                       this.blocks[x][y+cx][z+cy].r == this.blocks[x][y][z].r &&
                                                       this.blocks[x][y+cx][z+cy].g == this.blocks[x][y][z].g &&
                                                       this.blocks[x][y+cx][z+cy].b == this.blocks[x][y][z].b) 
                                                        {
                                                            tmpCountY++;
                                                        } else {
                                                            break;
                                                        }
                                                }
                                            }
                                            if(tmpCountY < countY || countY == 0) {
                                                countY = tmpCountY;
                                            }
                                            if(tmpCountY == 0 && countY > countX) {
                                                break;
                                            }
                                        } else {
                                            break;
                                        }
                                }
                            }

                            for(var x1 = 0; x1 <= countX; x1++) {
                                for(var y1 = 0; y1 <= countY; y1++) {
                                    if(this.blocks[x][y+x1][z+y1].drs) {
                                        countY = y1-1;
                                    } else {
                                        this.blocks[x][y+x1][z+y1].drs = true;
                                    }
                                }
                            }

                            this.blocks[x][y][z].drs = true;
                            sides++;
                            vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize, y*this.blockSize+(this.blockSize*countX), z*this.blockSize+(this.blockSize*countY)]);
                            vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize+(this.blockSize*countY)]);

                            vertices.push([x*this.blockSize, y*this.blockSize+(this.blockSize*countX), z*this.blockSize+(this.blockSize*countY)]);
                            vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize, y*this.blockSize+(this.blockSize*countX), z*this.blockSize-this.blockSize]);

                            for(var i = 0; i < 6; i++) {
                                colors.push([this.blocks[x][y][z].r,
                                            this.blocks[x][y][z].g,
                                            this.blocks[x][y][z].b,
                                            255]);
                            }
                        }
                     }

                     // TBD: If this is world chunk -> don't draw this side!

                     // Back side (-Z)   
                     if(z > 0 ) { 
                         if(!this.blocks[x][y][z-1].isActive()) {
                             drawBlock = true;
                         }
                     } else {
                         drawBlock = true;
                     }
                     drawBlock = false; // skip this for world.
                     if(drawBlock) {
                         sides++;
                         vertices.push([x*this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);
                         vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                         vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);

                         vertices.push([x*this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);
                         vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                         vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);
                         for(var i = 0; i < 6; i++) {
                             colors.push([this.blocks[x][y][z].r,
                                         this.blocks[x][y][z].g,
                                         this.blocks[x][y][z].b,
                                         255]);
                         }
                     }
                     drawBlock = false;
                    

                    // Front side (+Z)
                    if(z < this.chunkSizeZ - 1 ) {
                        if(!this.blocks[x][y][z+1].isActive()) {
                            drawBlock = true;
                        }
                    } else {
                        drawBlock = true;
                    }

                    if(drawBlock) {
                        var countX = 0;
                        var countY = 0;
                        if(!this.blocks[x][y][z].dfs) {
                            for(var cx = 1; cx < this.chunkSize; cx++) {
                                if(x+cx < this.chunkSize ) {
                                    if(this.blocks[x+cx][y][z].isActive() && !this.blocks[x+cx][y][z].dfs &&
                                       this.blocks[x+cx][y][z].r == this.blocks[x][y][z].r &&
                                       this.blocks[x+cx][y][z].g == this.blocks[x][y][z].g &&
                                       this.blocks[x+cx][y][z].b == this.blocks[x][y][z].b) 
                                        {
                                            // Check how far we can draw other way
                                            countX++;
                                            var tmpCountY = 0;
                                            for(var cy = 1; cy < this.chunkSizeZ; cy++) {
                                                if(y+cy < this.chunkSizeZ) {
                                                    if(this.blocks[x+cx][y+cy][z].isActive() && !this.blocks[x+cx][y+cy][z].dfs &&
                                                       this.blocks[x+cx][y+cy][z].r == this.blocks[x][y][z].r &&
                                                       this.blocks[x+cx][y+cy][z].g == this.blocks[x][y][z].g &&
                                                       this.blocks[x+cx][y+cy][z].b == this.blocks[x][y][z].b) 
                                                        {
                                                            tmpCountY++;
                                                        } else {
                                                            break;
                                                        }
                                                }
                                            }
                                            if(tmpCountY < countY || countY == 0) {
                                                countY = tmpCountY;
                                            }
                                            if(tmpCountY == 0 && countY > countX) {
                                                break;
                                            }
                                        } else {
                                            break;
                                        }
                                }
                            }

                            for(var x1 = 0; x1 <= countX; x1++) {
                                for(var y1 = 0; y1 <= countY; y1++) {
                                    if(this.blocks[x+x1][y+y1][z].dfs) {
                                        countY = y1-1;
                                    } else {
                                        this.blocks[x+x1][y+y1][z].dfs = true;
                                    }
                                }
                            }
                            this.blocks[x][y][z].dfs = true;
                            sides++;
                            vertices.push([x*this.blockSize+(this.blockSize*countX), y*this.blockSize+(this.blockSize*countY), z*this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize+(this.blockSize*countY), z*this.blockSize]);
                            vertices.push([x*this.blockSize+(this.blockSize*countX), y*this.blockSize-this.blockSize, z*this.blockSize]);

                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize+(this.blockSize*countY), z*this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize]);
                            vertices.push([x*this.blockSize+(this.blockSize*countX), y*this.blockSize-this.blockSize, z*this.blockSize]);

                            for(var i = 0; i < 6; i++) {
                                colors.push([this.blocks[x][y][z].r,
                                            this.blocks[x][y][z].g,
                                            this.blocks[x][y][z].b,
                                            255]);
                            }
                        }
                    } 
                    drawBlock = false;

                    // Bottom (-Y)
                    if(y > 0 ) {
                        if(!this.blocks[x][y-1][z].isActive()) {
                            drawBlock = true;
                        }
                    } else {
                        //drawBlock = true;
                        var id = this.cid - Math.sqrt(this.worldChunks.size);
                        if(id >= 0  && id < this.worldChunks.size) {
                            if(this.worldChunks.get(id).blocks[x][this.chunkSize-1][z] != null && this.worldChunks.get(id).blocks[x][this.chunkSize-1][z].isActive()) { // && 
                                drawBlock = false;
                            } else {
                                drawBlock = true;
                            }
                        } else {
                           drawBlock = true;
                        }
                    }

                    if(drawBlock) {
                        var countX = 0;
                        var countY = 0;
                        if(!this.blocks[x][y][z].dbs) {
                            for(var cx = 1; cx < this.chunkSize; cx++) {
                                if(x+cx < this.chunkSize) {
                                    if(this.blocks[x+cx][y][z].isActive() && !this.blocks[x+cx][y][z].dbs &&
                                       this.blocks[x+cx][y][z].r == this.blocks[x][y][z].r &&
                                       this.blocks[x+cx][y][z].g == this.blocks[x][y][z].g &&
                                       this.blocks[x+cx][y][z].b == this.blocks[x][y][z].b) 
                                        {
                                            countX++;
                                            var tmpCountY = 0;
                                            for(var cy = 1; cy < this.chunkSizeZ; cy++) {
                                                if(z+cy < this.chunkSizeZ) {
                                                    if(this.blocks[x+cx][y][z+cy].isActive() && !this.blocks[x+cx][y][z+cy].dbs &&
                                                       this.blocks[x+cx][y][z+cy].r == this.blocks[x][y][z].r &&
                                                       this.blocks[x+cx][y][z+cy].g == this.blocks[x][y][z].g &&
                                                       this.blocks[x+cx][y][z+cy].b == this.blocks[x][y][z].b) 
                                                        {
                                                            tmpCountY++;
                                                        } else {
                                                            break;
                                                        }
                                                }
                                            }
                                            if(tmpCountY < countY || countY == 0) {
                                                countY = tmpCountY;
                                            }
                                            if(tmpCountY == 0 && countY > countX) {
                                                break;
                                            }
                                        } else {
                                            break;
                                        }
                                }
                            }

                            for(var x1 = 0; x1 <= countX; x1++) {
                                for(var y1 = 0; y1 <= countY; y1++) {
                                    if(this.blocks[x+x1][y][z+y1].dbs) {
                                        countY = y1-1;
                                    } else {
                                        this.blocks[x+x1][y][z+y1].dbs = true;
                                    }
                                }
                            }
                          
                            this.blocks[x][y][z].dbs = true;
                            sides++;

                            vertices.push([x*this.blockSize+(this.blockSize*countX), y*this.blockSize-this.blockSize, z*this.blockSize+(this.blockSize*countY)]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize+(this.blockSize*countY)]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);

                            vertices.push([x*this.blockSize+(this.blockSize*countX), y*this.blockSize-this.blockSize, z*this.blockSize+(this.blockSize*countY)]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize+(this.blockSize*countX), y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);

                            for(var i = 0; i < 6; i++) {
                                colors.push([this.blocks[x][y][z].r,
                                            this.blocks[x][y][z].g,
                                            this.blocks[x][y][z].b,
                                            255]);
                            }
                        }
                    }

                    drawBlock = false;

                    // top (+Y) 
                    if(y < this.chunkSize - 1) {
                        if(!this.blocks[x][y+1][z].isActive()) {
                            drawBlock = true;
                        }
                    } else {
                        var id = this.cid + Math.sqrt(this.worldChunks.size);
                        if(id >= 0  && id < this.worldChunks.size) {
                            if(this.worldChunks.get(id).blocks[x][0][z] != null && this.worldChunks.get(id).blocks[x][0][z].isActive()) {
                                drawBlock = false;
                            } else {
                                drawBlock = true;
                            }
                        } else {
                         drawBlock = true;
                        }
                    }
                    
                    if(drawBlock) {
                        var countX = 0;
                        var countY = 0;
                        if(!this.blocks[x][y][z].dts) {
                            for(var cx = 1; cx < this.chunkSize; cx++) {
                                if(x+cx < this.chunkSize) {
                                    if(this.blocks[x+cx][y][z].isActive() && !this.blocks[x+cx][y][z].dts &&
                                       this.blocks[x+cx][y][z].r == this.blocks[x][y][z].r &&
                                       this.blocks[x+cx][y][z].g == this.blocks[x][y][z].g &&
                                       this.blocks[x+cx][y][z].b == this.blocks[x][y][z].b) 
                                        {
                                            countX++;
                                            var tmpCountY = 0;
                                            for(var cy = 1; cy < this.chunkSizeZ; cy++) {
                                                if(z+cy < this.chunkSizeZ) {
                                                    if(this.blocks[x+cx][y][z+cy].isActive() && !this.blocks[x+cx][y][z+cy].dts &&
                                                       this.blocks[x+cx][y][z+cy].r == this.blocks[x][y][z].r &&
                                                       this.blocks[x+cx][y][z+cy].g == this.blocks[x][y][z].g &&
                                                       this.blocks[x+cx][y][z+cy].b == this.blocks[x][y][z].b) 
                                                        {
                                                            tmpCountY++;
                                                        } else {
                                                            break;
                                                        }
                                                }
                                            }
                                            if(tmpCountY < countY || countY == 0) {
                                                countY = tmpCountY;
                                            }
                                            if(tmpCountY == 0 && countY > countX) {
                                                break;
                                            }
                                        } else {
                                            break;
                                        }
                                }
                            }

                            for(var x1 = 0; x1 <= countX; x1++) {
                                for(var y1 = 0; y1 <= countY; y1++) {
                                    if(this.blocks[x+x1][y][z+y1].dts) {
                                        countY = y1-1;
                                    } else {
                                        this.blocks[x+x1][y][z+y1].dts = true;
                                    }
                                }
                            }

                            this.blocks[x][y][z].dts = true;
                            sides++;
                            vertices.push([x*this.blockSize+(this.blockSize*countX), y*this.blockSize, z*this.blockSize+(this.blockSize*countY)]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize+(this.blockSize*countY)]);

                            vertices.push([x*this.blockSize+(this.blockSize*countX), y*this.blockSize, z*this.blockSize+(this.blockSize*countY)]);
                            vertices.push([x*this.blockSize+(this.blockSize*countX), y*this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);
                            
                            for(var i = 0; i < 6; i++) {
                                colors.push([this.blocks[x][y][z].r,
                                            this.blocks[x][y][z].g,
                                            this.blocks[x][y][z].b,
                                            255]);
                            }
                        }
                    }


                    // Add colors0
                    b += 2*sides;

                    // Fully visible
                    if(sides == 6) {
                        // Create physBlock and remove this?
                    }
                }                    
           }
           this.blocks[x][y].height = height;
       }
   }
   // Create Object
   //
   var geometry = new THREE.BufferGeometry();
   var v = new THREE.BufferAttribute( new Float32Array( vertices.length * 3), 3 );
   for ( var i = 0; i < vertices.length; i++ ) {
       v.setXYZ(i, vertices[i][0], vertices[i][1], vertices[i][2]);
   }
   geometry.addAttribute( 'position', v );

   var c = new THREE.BufferAttribute(new Float32Array( colors.length *4), 4 );
   for ( var i = 0; i < colors.length; i++ ) {
       c.setXYZW( i, colors[i][0]/255, colors[i][1]/255, colors[i][2]/255, colors[i][3]/255);
   }
   geometry.addAttribute( 'color', c );

   geometry.computeVertexNormals();
   geometry.computeFaceNormals();

   var material3 = new THREE.MeshLambertMaterial({ vertexColors: THREE.VertexColors, wireframe: this.wireframe});
   var mesh = new THREE.Mesh( geometry, material3 );
   mesh.rotation.set(Math.PI/2, Math.PI, Math.PI/2);
   mesh.position.set(this.posY, 0 , this.posX);

   mesh.receiveShadow = true;
   mesh.castShadow = true;

   if(this.mesh != undefined) {
        this.scene.remove(this.mesh);
   }
   this.scene.add( mesh );

   mesh.that = this;
   this.mesh = mesh;
   this.activeTriangles = b;
};


module.exports = ChunkTerrain;