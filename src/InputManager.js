const Utils = require('./Utils');
const THREE = require('./ThreeHelpers');
const CommandManager = require('./CommandManager');
const KeyCommandMap = require('./consts/KeyCommandMap');

function InputManager(props){
  this.player_entity = null;
  Object.assign(this, props);

  this.commandManager = new CommandManager({
    Game: this.Game,
    player_entity: this.player_entity
  });

  this.initPlayerControls();
  //Utils.LockPointer();
}

InputManager.prototype.processCommand = function(command){
    this.Game.network.send('user_input', {
        command: command,
        update_tick: this.Game.update_tick,
        render_tick: this.Game.render_tick
    });


    this.commandManager.execute(command);
};

InputManager.prototype.initPlayerControls = function(){
  //document.addEventListener('mousemove', this.onMouseMove.bind(this));
  document.addEventListener('keydown', this.onKeyPress.bind(this));
  document.addEventListener('keyup', this.onKeyUp.bind(this));
};

InputManager.prototype.onKeyPress = function(event){
    console.log(event.keyIdentifier);
    this.processCommand('Start'+KeyCommandMap[event.keyIdentifier]);
};

InputManager.prototype.onKeyUp = function(event){
    this.processCommand("Stop"+KeyCommandMap[event.keyIdentifier]);
};

InputManager.prototype.onMouseMove = function(event) {
    if(this.player_entity.attached_camera == 1) {
        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX ||0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        var x = movementX*0.001;
        var y = movementY*0.001;
        
        var xAxis = new THREE.Vector3(0,0,1);
        Utils.rotateAroundObjectAxis(this.player_entity.mesh, xAxis, -(Math.PI / 2)*x);
    }
};

module.exports = InputManager;