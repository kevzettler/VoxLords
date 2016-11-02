const Commands = require('./commands');

function CommandManager(props){
    this.player_entity = null;
    this.Game = null;
    Object.assign(this, props);
}

CommandManager.prototype.execute = function(command, commandData){
    console.log("Command Manger executing", command);
    Commands[command](this.player_entity, commandData);
};


module.exports = CommandManager;