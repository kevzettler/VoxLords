const PhysBlock = require('./PhysBlock');

function PhysBlockPool(props) {
    this.size = 0;
    this.blocks = [];
    this.scene = null;
    this.world = null;    
    Object.assign(this, props);
};

PhysBlockPool.prototype.Create = function(amount) {
    this.size = amount;

    var b;
    for(var i = 0; i < this.size; i++) {
        b = new PhysBlock({
          scene: this.scene,
          world: this.world
        });
        b.remove = 1;
        b.Init();
        this.blocks.push(b);
    }

    return this;
};

PhysBlockPool.prototype.Get = function() {
    for(var i = 0; i < this.size; i++) {
        if(this.blocks[i].remove == 1) {
            this.blocks[i].remove = 0;
            return this.blocks[i];
        }
    }
    return undefined;
};

PhysBlockPool.prototype.Free = function() {
    var f = 0;
    for(var i = 0; i < this.size; i++) {
        if(this.blocks[i].remove == 1) {
            f++;
        }
    }
    return f;
};

module.exports = PhysBlockPool;