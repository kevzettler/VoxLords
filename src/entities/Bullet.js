const Entity = require('./Entity');

module.exports = Entity.create({
  traits: [
           'Projectile',
           'Explode',
           'Damages'
          ],
});