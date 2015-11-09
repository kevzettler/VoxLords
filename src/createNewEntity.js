const Entity = require('./entities/Entity');
const _ = require('lodash');
const mixin = require('mixin');
const behaviorMap = require('./entities/behaviors');

const createNewEntity = function(entityDefinition){ 
    let mixinBase = Entity;

    _.each(entityDefinition.behaviors, function(behaviorName){
        mixinBase = mixin(mixinBase, behaviorMap[behaviorName]);
    });

    //return a mixinBase wrapped in a constructor that sets the params
    return function(props){
        const mixin = new mixinBase();
        _.extend(mixin, _.omit(entityDefinition, 'behaviors'), props);
        return mixin;
    }

};

module.exports = createNewEntity;