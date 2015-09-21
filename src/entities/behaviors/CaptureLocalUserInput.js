const Utils = require('../../Utils');
const THREE = require('../../ThreeHelpers');
const CommandManager = require('../../CommandManager');
const KeyCommandMap = require('../../consts/KeyCommandMap');

function CaptureLocalUserInput(props){
  this.keys = {};

  this.commandManager = new CommandManager({
    Game: this.Game,
    player_entity: this.player_entity
  });

  this.initPlayerControls();
}

CaptureLocalUserInput.prototype.processCommand = function(command){
    // this.Game.network.send('user_input', {
    //     command: command,
    //     update_tick: this.Game.update_tick,
    //     render_tick: this.Game.render_tick
    // });

    this.commandManager.execute(command);
};

CaptureLocalUserInput.prototype.initPlayerControls = function(){
  document.addEventListener('keydown', this.onKeyDown.bind(this));
  document.addEventListener('keyup', this.onKeyUp.bind(this));
};

CaptureLocalUserInput.prototype.onKeyDown = function(event){
    if(!this.keys[event.keyIdentifier]){
      this.processCommand('Start'+KeyCommandMap[event.keyIdentifier]);
      this.keys[event.keyIdentifier] = true;
    }
};

CaptureLocalUserInput.prototype.onKeyUp = function(event){
    if(this.keys[event.keyIdentifier]){
      this.processCommand("Stop"+KeyCommandMap[event.keyIdentifier]);
      delete this.keys[event.keyIdentifier];
    }
};

CaptureLocalUserInput.prototype.onMouseMove = function(event) {
    if(this.player_entity.attached_camera == 1) {
        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX ||0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        var x = movementX*0.001;
        var y = movementY*0.001;
        
        var xAxis = new THREE.Vector3(0,0,1);
        Utils.rotateAroundObjectAxis(this.player_entity.mesh, xAxis, -(Math.PI / 2)*x);
    }
};

module.exports = CaptureLocalUserInput;