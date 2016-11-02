require('babel/polyfill');
const Game = require('./Game');
 
const client2 = new Game({
    debug: true,
    environment: 'client',
    id: Date.now(),
    render_container: document.getElementById('client')
});
