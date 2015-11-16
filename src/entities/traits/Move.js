var Trait = require('simple-traits');
var _ = require('lodash');

module.exports = Trait({
    updateHandler: function(dt){
       this.mesh.translateY(this.forwardVelocity*dt);
       this.mesh.translateX(this.strafeVelocity*dt);
    },

});
