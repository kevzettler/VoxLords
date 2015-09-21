require('babel/polyfill');
const Game = require('./Game');

const network = {
    channels: {},

    send: function(channel, message){
        this.channels[channel].forEach(function(client){
            client(message);
        });
    },

    subscribe: function(channel, callback){
        if(!this.channels[channel]){
            this.channels[channel] = [];
        }

        this.channels[channel].push(callback);
    },
};

// const server = new Game({
//     network: network
// });

const client = new Game({
    network: network,
    render_container: document.getElementById('container')
});



