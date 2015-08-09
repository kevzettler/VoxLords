const Game = require('./Game');
const game = new Game();
window.game = game;
window.game.Init(4);

$(document).ready( function() {
    $('#menu').html($('#menu_content').html());
  // MuteSound(true);

    if(localStorage.getItem("reload") == 1) {
        Start(localStorage.getItem("mapId"));
        if(localStorage.getItem("sound") == 'true') {
               MuteSound();
        }
        if(localStorage.getItem("music") == 'true') {
               MuteSong(); 
        }
    }
});


function Start(mapId) {
    $('#menu').hide();
    var start = 0;
    game.Init(mapId);
}