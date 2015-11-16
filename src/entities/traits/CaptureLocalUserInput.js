var Trait = require('simple-traits');
var _ = require('lodash');
var THREE = require('three');
const CommandManager = require('../../CommandManager');
const KeyCommandMap = require('../../consts/KeyCommandMap');

var CaptureLocalUserInput = Trait({
  keys: {},

  //TODO fix entity trait conflict resolution to support
  //Traits with no conflicts :\
  updateHandler(){

  },

  initPlayerControls(){
    this.commandManager = new CommandManager({
      Game: this.Game,
      player_entity: this
    });
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  },

  onKeyDown(event){
      if(!this.keys[event.keyIdentifier]){
        this.processCommand('Start'+KeyCommandMap[event.keyIdentifier]);
        this.keys[event.keyIdentifier] = true;
      }
  },

  onKeyUp(event){
      if(this.keys[event.keyIdentifier]){
        this.processCommand("Stop"+KeyCommandMap[event.keyIdentifier]);
        delete this.keys[event.keyIdentifier];
      }
  },

  processCommand(command){
    // this.Game.network.send('user_input', {
    //     command: command,
    //     update_tick: this.Game.update_tick,
    //     render_tick: this.Game.render_tick
    // });

    this.commandManager.execute(command);
  },

  onMouseMove(event) {
      if(this.player_entity.attached_camera == 1) {
          var movementX = event.movementX || event.mozMovementX || event.webkitMovementX ||0;
          var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
          var x = movementX*0.001;
          var y = movementY*0.001;
          
          var xAxis = new THREE.Vector3(0,0,1);
          Utils.rotateAroundObjectAxis(this.player_entity.mesh, xAxis, -(Math.PI / 2)*x);
      }
  },

});


module.exports = CaptureLocalUserInput;