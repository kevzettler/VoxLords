const Entity = require('./Entity');

module.exports = Entity.create({
    traits: [
             'CaptureLocalUserInput',
             'Gravity', 
             'Move',
            ],
});
