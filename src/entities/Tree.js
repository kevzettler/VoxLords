// const Object3D = require('../Object3D');
// const util = require('util');
// const Entity = require('./Entity');

// function Tree(props) {
//     Tree.super_.call(this,props);
// };
// util.inherits(Tree, Entity);

// // Tree.prototype.hit = function(data, dmg) {
// //     this.chunk.Explode(this.mesh.position, this.scale);
// //     this.remove = 1;
// //     game.scene.remove(this.mesh);
// //     console.log("TREE HIT!");
// // };



// module.exports = Tree;
const Entity = require('./Entity');

module.exports = Entity.create({
    traits: ['Move']
});