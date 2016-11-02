const Game = require('../src/Game');

new Game({
  debug: true,
  environment: 'server',
  id: "server",
  render_container: document.getElementById('server')
});