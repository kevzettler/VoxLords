const Trait = require('simple-traits');
const _ = require('lodash');
const THREE = require('three');
const CommandManager = require('./CommandManager');
const KeyCommandMap = require('./consts/KeyCommandMap');
const Utils = require('./Utils');
const keydrown = require('keydrown');

const DesktopInputManager = function(props){  
  Object.assign(this, props);
  this.sequenceTick = 0;
  this.commandHistory = [];  
  this.commandManager = new CommandManager({
    Game: this.Game,
    player_entity: this.player_entity
  });

  this.render_container.addEventListener('mousemove', this.onMouseMove.bind(this));
  this.render_container.addEventListener('click', this.onClick.bind(this));  
};

DesktopInputManager.prototype.update = function(dt){
  _.each(KeyCommandMap, (command, key) => {
    if(keydrown[key].isDown()){
      this.processCommand('Press'+command, dt);
    }
  });
};

DesktopInputManager.prototype.processCommand = function(commandName, commandData){
  const eventData = {
    commandName,
    commandData,
    sequenceTick: this.sequenceTick,
    client_id: this.client_id,
  };

  this.network.send({
      eventName: 'playerInput',
      eventData,
  });

  this.commandManager.execute(commandName, commandData);

  this.commandHistory.push(eventData);
  this.sequenceTick++;
};

DesktopInputManager.prototype.onMouseMove = function(event) {
  console.log("mouseMove", event);
  const movementX = event.movementX || event.mozMovementX || event.webkitMovementX ||0;
  const x = movementX*0.001;
  const commandName = 'ViewChange';

  this.processCommand(commandName, x);
};

DesktopInputManager.prototype.onClick = function(event) {
  this.processCommand("Shoot");
  this.render_container.requestPointerLock = this.render_container.requestPointerLock || this.render_container.mozRequestPointerLock || this.render_container.webkitRequestPointerLock;
  this.render_container.requestPointerLock();
};


module.exports = DesktopInputManager;