require('babel/polyfill');
const Game = require('./Game');
 
const server = new Game({
    debug: true,
    environment: 'server',
    id: "serv",
    render_container: document.getElementById('server'),
});
window.server = server;

const client1 = new Game({
    debug: true,
    environment: 'client',
    //network: peer1,
    id: "client1",
    render_container: document.getElementById('client1')
});
window.client1 = client1;

const client2 = new Game({
    debug: true,
    environment: 'client',
    //network: peer1,
    id: "client2",
    render_container: document.getElementById('client2')
});
window.client2 = client2;
