function CommandManager(props){
    this.player_entity = null;
    this.Game = null;
    Object.assign(this, props);
}

CommandManager.prototype.execute = function(command){
    console.log("Command Manger executing", command);
};



module.exports = CommandManager;