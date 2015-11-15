var Trait = require('simple-traits');
var events = require('events');
var util = require("util");
var _ = require('lodash');

var Entity = {

    create: function(entityDef){
        var traits = entityDef.traits.splice(0);

        //resolve conflicts.
        var resolveObj = this.resolveConflicts(traits);

        // compose
        var trait = Trait.compose.apply(this, resolveObj);

        function EntityCons(extenedProps){
            var props = Object.assign({}, entityDef, extenedProps);
            var entity = trait.create(EntityCons.prototype, props);
            entity.on('update', entity.updateHandler.bind(entity));
            return entity;
        };
        util.inherits(EntityCons, events.EventEmitter);

        EntityCons.prototype.updateHandler = function(){
            _.each(this, function(value, key){
                if(key.match('_updateHandler')){
                    value.apply(this, arguments);
                };
            });
        };

        EntityCons.prototype.attachVox = function(vox){
          this.vox = vox;
          this.chunk = vox.getChunk();
          this.chunk.Rebuild();
          this.mesh = vox.getMesh();
          this.mesh.geometry.center();
          this.mesh.geometry.computeBoundingBox();
          this.mesh.position.set(this.position[0], this.position[1], this.position[2]);

          //unsafe mutation of the classes position
          //helpful for moving mesh through the class
          this.position = this.mesh.position;

          this.raycaster = new THREE.Raycaster(this.position);
          //this.mesh.add( new THREE.ArrowHelper(this.raycaster.ray.direction, this.mesh.position, 30, 0x00FF00));

          this.mesh.scale.set(this.scale,this.scale,this.scale); 
        }

        return EntityCons;
    },


    findConflictMethodNames: function(conflictMap){
        return _.compact(_.map(conflictMap, function(value, key, result){
            if(value.length > 1){
                return key;
            }
        }));
    },

    getConflictMethodMap:function(traits){
        var conflictMap = {};
        var Trait;

        _.each(traits, function(traitName){
            Trait = traitMap[traitName];
            _.each(Trait, function(value, key){
                if(value.value && !value.required){
                    if(conflictMap[key]){
                        conflictMap[key].push(traitName)
                    }else{
                        conflictMap[key] = [traitName];
                    }
                }
            });
        });

        return conflictMap;
    },

    reverseConflictMap: function(conflictMap){
        var resolveMap = {};
        _.each(conflictMap, function(traitNames, propConflict){
            if(conflictMap[propConflict].length > 1){
                _.each(traitNames, function(traitName){
                    if(resolveMap[traitName]){
                        resolveMap[traitName].push(propConflict);
                    }else{
                        resolveMap[traitName] = [propConflict];
                    }
                });
            }
        });

        return resolveMap;
    },

    findConflicts: function(traits){
        var conflictMap = this.getConflictMethodMap(traits);
        var reversedConflictMap = this.reverseConflictMap(conflictMap);
        return reversedConflictMap;
    },

    resolveConflicts: function(traits){
        var reversedConflictMap = this.findConflicts(traits);
        var resolveObj = _.map(reversedConflictMap, function(propsToResolve, traitName){
            if(!propsToResolve.length){
                return traitMap[traitName];
            }else{
                var resolveObj = {};
                _.map(propsToResolve, function(prop){
                    resolveObj[prop] = traitName + "_" + prop;
                });
                return traitMap[traitName].resolve(resolveObj);
            }
        });

        return resolveObj;
    },
}

// Entity.prototype.attachVox = function(vox){
//   this.vox = vox;
//   this.chunk = vox.getChunk();
//   this.chunk.Rebuild();
//   this.mesh = vox.getMesh();
//   this.mesh.geometry.center();
//   this.mesh.geometry.computeBoundingBox();
//   this.mesh.position.set(this.position[0], this.position[1], this.position[2]);

//   //unsafe mutation of the classes position
//   //helpful for moving mesh through the class
//   this.position = this.mesh.position;

//   this.raycaster = new THREE.Raycaster(this.position);
//   //this.mesh.add( new THREE.ArrowHelper(this.raycaster.ray.direction, this.mesh.position, 30, 0x00FF00));

//   this.mesh.scale.set(this.scale,this.scale,this.scale); 
// }


module.exports = Entity;