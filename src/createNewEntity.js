const Entity = require('./entities/Entity');
const _ = require('lodash');
const mixin = require('mixin');
const behaviorMap = require('./entities/behaviors');

let mixinBase = Entity;
let entityDefinition;

const createNewEntity = function(entityDefinition){ 
    _.each(entityDefinition.behaviors, function(behaviorName){
        mixinBase = mixin(mixinBase, behaviorMap[behaviorName]);
    });

    //return a mixinBase wrapped in a constructor that sets the params
    return function(){
        const mixin = new mixinBase();
        _.extend(mixin, _.omit(entityDefinition, 'behaviors'));
        return mixin;
    }

};

module.exports = createNewEntity;