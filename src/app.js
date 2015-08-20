require('babel/polyfill');
const Game = require('./Game');
const game = new Game();
window.game = game;
window.game.Init(4);
