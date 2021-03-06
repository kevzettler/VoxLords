const ChunkTerrain = require('./ChunkTerrain');
const Immutable = require('immutable');
const Buffer = require('buffer/index.js').Buffer;
const _ = require('lodash');

function ChunkManager(props) {
    this.worldChunks = [];
    this.totalBlocks = 0;
    this.totalChunks = 0;
    this.activeBlocks = 0;
    this.activeTriangles = 0;
    this.updateChunks = [];
    this.maxChunks = 0;
    this.blockSize = 0.5;
    this.scene = null;
    Object.assign(this,props);
    this.worldMap = this.world.worldState.get('worldMap').toJS();
};

ChunkManager.prototype.processChunkList = function(chunkList){
    chunkList.forEach(this.createChunkFromData.bind(this));
};

ChunkManager.prototype.createChunkFromData = function(chunkData){
    const c = new ChunkTerrain({
        scene: this.scene,
        worldChunks: Immutable.fromJS(this.worldChunks)
    });

    c.Create(chunkData.get('posX'),
             chunkData.get('posY'),
             chunkData.get('mapData').toJS(),
             chunkData.get('id')
            );

    this.AddTerrainChunk(c);
};

ChunkManager.prototype.AddTerrainChunk = function(chunk) {
   this.totalChunks++;
   this.totalBlocks += (chunk.blocks.length*chunk.blocks.length*chunk.blocks.length);
   this.activeBlocks += chunk.NoOfActiveBlocks();
   this.worldChunks.push(chunk);
};

ChunkManager.prototype.BuildAllChunks = function(chunkList) {
    _.each(chunkList, this.BuildAllChunksIterator.bind(this));
    //this.AddTargets();
    console.log("ACTIVE TRIANGLES: "+this.activeTriangles);
    console.log("ACTIVE BLOCKS: "+this.activeBlocks);
};

ChunkManager.prototype.BuildAllChunksIterator = function(chunk){
    chunk.Rebuild();
    this.activeTriangles += chunk.GetActiveTriangles();
};

ChunkManager.prototype.Draw = function (time, delta) {
    if(this.updateChunks.length > 0) {
        var cid = this.updateChunks.pop();
        try{
          this.worldChunks[cid].Rebuild();
        }catch(ex){
          console.error("tried to rebuild missing chunk", cid, ex);
        }
    }
};


ChunkManager.prototype.Blood = function(x, z, power) {
    var aChunks = [];
    var aBlocksXZ = [];
    var aBlocksZ = [];

    x = Math.round(x);
    z = Math.round(z);
    var cid = 0;
    var totals = 0;
    var y = this.getHeight(x,z);
    y = y/this.blockSize;
    for(var rx = x+power; rx >= x-power; rx-=this.blockSize) {
        for(var rz = z+power; rz >= z-power; rz-=this.blockSize) {
            for(var ry = y+power; ry >= y-power; ry-=this.blockSize) {
                if((rx-x)*(rx-x)+(ry-y)*(ry-y)+(rz-z)*(rz-z) <= power*power) {
                    if(Math.random() > 0.7) {
                        // Set random shade to the blocks to look as burnt.
                        cid = this.GetWorldChunkID(rx,rz);
                        if(cid == undefined) { continue; }
                        var pos = this.Translate(rx,rz,cid);

                        var yy = Math.round(ry);
                        if(yy <= 0) {
                            yy = 0;
                        }
                        if(this.worldChunks[cid.id].blocks[pos.x][pos.z][yy] != undefined) {
                            if(this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].active) {
                                this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].r = 111+Math.random()*60;
                                this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].g = 0;
                                this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].b = 0;
                                aChunks.push(cid);
                            }
                        }
                    }
                }
            }
        }
    }
    var crebuild = {};
    for(var i = 0; i < aChunks.length; i++) {
        crebuild[aChunks[i].id] = 0;
    }
    for(var c in crebuild) {
        this.updateChunks.push(c);
    }
};

ChunkManager.prototype.explodeBombSmall = function(x,z) {
    x = Math.round(x);
    z = Math.round(z);
    var y = this.getHeight(x, z);
    y = Math.round(y/this.blockSize);
    var cid = this.GetWorldChunkID(x, z);
    if(cid == undefined) {
        return;
    }
    var pos = this.Translate(x, z, cid);
    if(this.worldChunks[cid.id].blocks[pos.x][pos.z][y] == undefined) {
        return;
    }
    this.worldChunks[cid.id].blocks[pos.x][pos.z][y].setActive(false);
    this.worldChunks[cid.id].Rebuild();

    for(var i = 0; i < 6; i++) {
        var block = this.world.blockPool.Get();
        if(block != undefined) {
            block.Create(x,y/2,z,
                         this.worldChunks[cid.id].blockSize/2,
                         this.worldChunks[cid.id].blocks[pos.x][pos.z][y].r,
                         this.worldChunks[cid.id].blocks[pos.x][pos.z][y].g,
                         this.worldChunks[cid.id].blocks[pos.x][pos.z][y].b,
                         2,
                         Math.random()*180,
                         2);
        }
    }
}

ChunkManager.prototype.explodeBomb = function(x,z, power, blood, iny) {
    // Get all blocks in the explosion.
    // then for each block get chunk and remove the blocks
    // and rebuild the affected chunks.
    var aChunks = [];
    var aBlocksXZ = [];
    var aBlocksY = [];
    x = Math.round(x);
    z = Math.round(z);
    var cid = 0;
    
    var totals = 0;
    var y;
    if(iny == undefined) {
        var y = this.getHeight(x,z);
        y = Math.round(y/this.blockSize);
    } else {
        y = iny;
    }
    var shade = 0.5;
    
    var yy = 0;
    var pos = 0;
    var val = 0;
    var pow = 0;
    var rand = 0;
    var block = undefined;
    for(var rx = x+power; rx >= x-power; rx-=this.blockSize) {
        for(var rz = z+power; rz >= z-power; rz-=this.blockSize) {
            for(var ry = y+power; ry >= y-power; ry-=this.blockSize) {
                val = (rx-x)*(rx-x)+(ry-y)*(ry-y)+(rz-z)*(rz-z);
                pow = power*power;
                if(val <= pow) {
                    cid = this.GetWorldChunkID(rx,rz);
                    if(cid == undefined) { continue; }
                    pos = this.Translate(rx,rz,cid);
                    if(ry <= 0) {
                        yy = 0;
                    } else {
                        yy = Math.round(ry);
                    }
                    if(this.worldChunks[cid.id].blocks[pos.x] == undefined) {
                        continue;
                    }
                    if(this.worldChunks[cid.id].blocks[pos.x][pos.z] == undefined) {
                        continue;
                    }

                    if(this.worldChunks[cid.id].blocks[pos.x][pos.z][yy] != undefined) {
                        if(this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].isActive()) {
                            aBlocksXZ.push(pos);
                            aChunks.push(cid);
                            aBlocksY.push(yy);
                            totals++;
                            if(Math.random() > 0.95) {
                                // Create PhysBlock
                                block = this.world.blockPool.Get();
                                if(block != undefined) {
                                    block.Create(rx,yy,rz,
                                             this.worldChunks[cid.id].blockSize,
                                             this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].r,
                                             this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].g,
                                             this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].b,
                                             3,
                                             Math.random()*180,
                                             power);
                                }
                            }
                        } else {
                            //console.log("NO ACTIVE CID: "+cid.id+ " X: "+pos.z + " Z: "+pos.z + " Y: "+yy);
                        }
                    }
                } else if(val <= pow*1.2 && val >= pow) {
                    // Set random shade to the blocks to look as burnt.
                    cid = this.GetWorldChunkID(rx,rz);
                    if(cid == undefined) {
                        continue; 
                    }
                    pos = this.Translate(rx,rz,cid);

                    yy = Math.round(ry);
                    if(yy <= 0) {
                        yy = 0;
                    }
                    if(pos == undefined) {
                        continue;
                    }
                    if(this.worldChunks[cid.id].blocks[pos.x] == undefined) {
                        continue;
                    }
                    if(this.worldChunks[cid.id].blocks[pos.x][pos.z] == undefined) {
                        continue;
                    }
                    if(this.worldChunks[cid.id].blocks[pos.x][pos.z][yy] != undefined) {
                        if(this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].isActive()) {
                            if(blood) {
                                rand = Math.random()*60;
                                if(rand > 20) {
                                    aBlocksXZ.push(pos);
                                    aChunks.push(cid);
                                    aBlocksY.push(yy);
                                    this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].r = 111+rand;
                                    this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].g = 0;
                                    this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].b = 0;
                                }
                            } else {
                                aBlocksXZ.push(pos);
                                aChunks.push(cid);
                                aBlocksY.push(yy);
                                this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].r *= shade;
                                this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].g *= shade;
                                this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].b *= shade;
                            }
                        }
                    }
                }
            }
        }
    }

   // Deactivate all and rebuild chunks
    var crebuild = {};
    for(var i = 0; i < aChunks.length; i++) {
        this.worldChunks[aChunks[i].id].blocks[aBlocksXZ[i].x][aBlocksXZ[i].z][aBlocksY[i]].setActive(false);
        // Check if on border
        if(aBlocksXZ[i].x == this.worldChunks[aChunks[i].id].chunkSizeX-1) {
            crebuild[aChunks[i].id+1] = 0;
        } else if(aBlocksXZ[i].x == 0) {
            crebuild[aChunks[i].id-1] = 0;
        }
        
        if(aBlocksXZ[i].z == this.worldChunks[aChunks[i].id].chunkSizeZ-1) {

        } else if(aBlocksXZ[i].z == 0) {

        }


        if(aBlocksY[i] == this.worldChunks[aChunks[i].id].chunkSizeY-1) {
            crebuild[aChunks[i].id + Math.sqrt(this.worldMap.length)] = 0;
        } else if(aBlocksY[i] == 0) {
            crebuild[aChunks[i].id - Math.sqrt(this.worldMap.length)] = 0;
        }

        crebuild[aChunks[i].id] = 0;
    }
    for(var c in crebuild) {
        this.updateChunks.push(c);
    }
};

ChunkManager.prototype.AddTerrainChunk = function(chunk) {
   this.totalChunks++;
   this.totalBlocks += (chunk.blocks.length*chunk.blocks.length*chunk.blocks.length);
   this.activeBlocks += chunk.NoOfActiveBlocks();
   this.worldChunks.push(chunk);
};

ChunkManager.prototype.BuildAllChunksIterator = function(chunk){
    chunk.Rebuild();
    this.activeTriangles += chunk.GetActiveTriangles();
};

ChunkManager.prototype.BuildAllChunks = function(chunkList) {
    _.each(chunkList, this.BuildAllChunksIterator.bind(this));
    console.log("ACTIVE TRIANGLES: "+this.activeTriangles);
    console.log("ACTIVE BLOCKS: "+this.activeBlocks);
};

ChunkManager.prototype.GetWorldChunkID = function(x,z) {
    if(this.worldMap == undefined) {
        return;
    }

    if(typeof this.blockSize == 'undefined'){
      this.blockSize = 0.5;
    }

    var mp = this.world.chunkSize*this.blockSize;
    var w_x = Math.floor(Math.abs(x)/mp);
    var w_z = Math.floor(Math.abs(z)/mp);
    if(this.worldMap[w_x] == undefined) {
        return;
    }
    if(this.worldMap[w_x][w_z] == undefined) {
        return;
    }
    var cid = this.worldMap[w_x][w_z];
    return cid;
};

ChunkManager.prototype.GetChunk = function(x,z) {
    var mp = this.world.chunkSize*this.blockSize;
    var w_x = Math.floor(Math.abs(x)/mp);
    var w_z = Math.floor(Math.abs(z)/mp);

    if(this.worldMap[w_x][w_z] == undefined) {
        return; 
    }
    var cid = this.worldMap[w_x][w_z];
    return this.worldChunks[cid.id];
};

ChunkManager.prototype.Translate = function(x, z, cid) {
    var x1 = Math.round((z-this.worldChunks[cid.id].posX) / this.blockSize);
    var z1 = Math.round((x-this.worldChunks[cid.id].posY) / this.blockSize); 
    x1 = Math.abs(x1-1); 
    z1 = Math.abs(z1-1);
    return {x: x1, z: z1};
};

ChunkManager.prototype.getHeight = function(x, z) {
    var cid = this.GetWorldChunkID(x,z);
    if(cid == undefined) {
        return undefined;
    }
    if(this.worldChunks[cid.id] == undefined) {
        return undefined;
    }
    var tmp = this.Translate(x, z, cid);

    var x1 = Math.round(tmp.x);
    var z1 = Math.round(tmp.z);
    if(this.worldChunks[cid.id].blocks[x1] != undefined) {
        if(this.worldChunks[cid.id].blocks[x1][z1] != undefined) {
            var y = this.worldChunks[cid.id].blocks[x1][z1].height*this.blockSize;
        }
    }

    if(y > 0) {
        return y;
    } else {
        return 0;
    }
};

ChunkManager.prototype.CheckActive = function(x, z, y) {
    var cid = this.GetWorldChunkID(x,z);
    if(cid == undefined) {
        return false;
    }
    var tmp = this.Translate(x, z, cid); //x+1
    var x1 = tmp.x;
    var z1 = tmp.z;
    if(this.worldChunks[cid.id] == undefined || this.worldChunks[cid.id].blocks[x1][z1][y] == undefined) {
        return false;
    } else {
        this.worldChunks[cid.id].blocks[x1][z1][y].r = 255;
        return !this.worldChunks[cid.id].blocks[x1][z1][y].isActive();
    }
};

ChunkManager.prototype.cleanZ = function(blockMap, xIndex, yBlocks, zIndex){
    if(yBlocks.length){
        const yIndex = yBlocks.length-1;
        this.cleanY(blockMap, xIndex, zIndex, yBlocks[yIndex], yIndex);
    }

    //_.each(yBlocks, this.cleanY.bind(this, blockMap, xIndex, zIndex));
};

ChunkManager.prototype.cleanX = function(blockMap, zBlocks, xIndex){
    _.each(zBlocks, this.cleanZ.bind(this, blockMap, xIndex));
};

ChunkManager.prototype.cleanY = function(blockMap, xIndex, zIndex, block, yIndex){
    if(!block.isEmpty()){
        if(!blockMap[xIndex]){
            blockMap[xIndex] = {};
        }

        if(!blockMap[xIndex][zIndex]){
            blockMap[xIndex][zIndex] = {};
        }


        blockMap[xIndex][zIndex][yIndex] = block.clean();
    }
};

ChunkManager.prototype.cleanBlocks = function(blocksX){
    var blockMap = {};
    _.each(blocksX, this.cleanX.bind(this, blockMap));
    return blockMap;
};

/*
*
* Creates a compact version of the terrain data in chunkManager
* current world code is not setup to accept the compact version import
*/
ChunkManager.prototype.export = function(){
     const worldMap = {};

     const chunkArray = _.each(this.worldChunks, (chunk,index) => {
        const blocks = this.cleanBlocks(chunk.blocks);

        if(_.keys(blocks).length){
            worldMap[index] = [
                chunk.posX,
                chunk.posY,
                chunk.posZ,
                chunk.cid,
                blocks
            ];
        }
    });

    return worldMap;
};

module.exports = ChunkManager;
