const Entity = require('./Entity');

module.exports = Entity.create({
    traits: [
      'AttachedVox', 
      'Hit',
      'Rooted',
    ]
});