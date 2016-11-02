require('babel/polyfill');
var Trait = require('simple-traits');
var events = require('events');
var util = require("util");
var _ = require('lodash');

var Gravity = Trait({
    gravity: Trait.required,
    y: Trait.required,

    updateHandler: function(){
        console.log('Udataing');
    },

    getGround: function(){
        console.log("get this groung", this.y);
    }
});

var Move = Trait({
    x: Trait.required,
    y: Trait.required,

    // init: function(){
    //     console.log("init whatever");
    // },

    updateHandler: function(){

    }
});

var Solid = Trait({
    x: Trait.required,
    y: Trait.required,

    collide: function(){
        console.log("some collision thing");
    }
});

var traitMap = {
    'Gravity': Gravity,
    'Move': Move
};

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


var Guy = Entity.create({
    traits: ['Gravity', 'Move'],    
    y: 5,
    x: 10,
    gravity: 10,
    cool: function(){
        console.log('lol cool');
    }
});


var new_guy = new Guy();

console.log(new_guy.cool());
console.log(new_guy.gravity);
console.log(new_guy.y);

console.log("emitting");
new_guy.emit('update');

