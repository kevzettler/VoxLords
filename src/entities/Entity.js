'use strict';
var Trait = require('simple-traits');
var events = require('events');
var util = require("util");
var _ = require('lodash');
var THREE = require('../ThreeHelpers');
var traitMap = require('./traits');

let id = 1;
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

      _.each(entity, (method, methodName) => {
        if(methodName.match('init')){
          method.call(entity);
        }
      });

      if(!entity.id){
        entity.id = extenedProps.world.id + "-" + id;
        id++;
      }

      return entity;
    };
    util.inherits(EntityCons, events.EventEmitter);

    EntityCons.prototype.init = function(dt){};

    EntityCons.prototype.updateHandler = function(dt){
      if(this.REMOVE){ //dont update if REMOVED
        return;
      }
      
      _.each(this, (updateHandler, methodName) => {
          if(methodName.match('_updateHandler')){
              updateHandler.call(this, dt);
          };
      });
    };

    EntityCons.prototype.remove = function(){
      this.world.removeEntity(this.id);
    };

    EntityCons.prototype.getMatrixPos = function(){
      var vector = new THREE.Vector3();
          vector.setFromMatrixPosition( this.mesh.matrixWorld );
      return vector;
    };

    EntityCons.prototype.export = function(){
      return {
          position: this.mesh.position.toArray(),
          scale: this.scale,
          id: this.id,
          speed: this.speed,
          quaternion: this.mesh.quaternion.toArray(),
          jumpGoal: this.jumpGoal,
          jumpHeight: this.jumpHeight,
          direction: this.direction,
          ownerId: this.ownerId,
          type: this.type,
          REMOVE: this.REMOVE,       
      };
    };

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

  getTraitReference: function(traitName){
    if(typeof traitMap[traitName] === 'undefined'){
      throw "Tried to load missing trait " + traitName;
    }

    return traitMap[traitName];
  },

  resolveConflicts: function(traits){
    const resolveObj = [];
    const reversedConflictMap = this.findConflicts(traits);
    const nonConflicting = _.difference(traits, _.keys(reversedConflictMap));

    _.each(nonConflicting, (traitName) => {
      resolveObj.push(this.getTraitReference(traitName));
    });

    var resolved = _.map(reversedConflictMap, function(propsToResolve, traitName){
      if(!propsToResolve.length){
        return this.getTraitReference(traitName);
      }else{
        var resolveObj = {};
        _.map(propsToResolve, function(prop){
            resolveObj[prop] = traitName + "_" + prop;
        });
        return traitMap[traitName].resolve(resolveObj);
      }
    });

    return resolveObj.concat(resolved);
  },
}

module.exports = Entity;