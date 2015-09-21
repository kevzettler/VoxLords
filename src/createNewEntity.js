const Entity = require('./entities/Entity');
const _ = require('lodash');
const mixin = require('mixin');
const behaviorMap = require('./entities/behaviors');

let mixinBase = Entity;
let entityDefinition;

const Wrapped = function(){
    _.extend(this, _.omit(entityDefinition, 'behaviors'));
    mixinBase.call(this);  
};

const createNewEntity = function(entityDefinition){
    mixinBase = Entity;

    _.each(entityDefinition.behaviors, function(behaviorName){
        debugger;
        mixinBase = mixin(mixinBase, behaviorMap[behaviorName]);
    });

    //return a mixinBase wrapped in a constructor that sets the params
    return function(){
        _.extend(this, _.omit(entityDefinition, 'behaviors'));
        debugger;
        mixinBase.call(this);          
    }


};

module.exports = createNewEntity;