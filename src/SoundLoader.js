const Loader = require('./Loader');

/////////////////////////////////////////////////////////////
// Sounds
/////////////////////////////////////////////////////////////
function SoundLoader() {
    Loader.call(this);
    this.sounds = new Array();
    this.context;
    this.muted = false;

    SoundLoader.prototype.StopSound = function(name) {
        var source = this.sounds[name].context;
        source.stop = source.noteOff;
        source.stop(0);
    };

    SoundLoader.prototype.PlaySound = function(name, position, radius) {
        if(this.muted) {
            return;
        }   
        var source = this.sounds[name].context.createBufferSource();
        source.buffer = this.sounds[name].buffer;
        var gainNode = this.sounds[name].context.createGain();
        source.connect(gainNode);
        gainNode.connect(this.sounds[name].context.destination);

        if(position != undefined) {
            var vector = game.camera.localToWorld(new THREE.Vector3(0,0,0));        
            var distance = position.distanceTo( vector );
            if ( distance <= radius ) {
                var vol = 1 * ( 1 - distance / radius );
                gainNode.gain.value = vol;
                source.start(0);
            } else {
                gainNode.gain.value = 0;
            }
        } else {
            gainNode.gain.value = 1;
            source.start(0);        
        }
    };

    SoundLoader.prototype.Add = function(args) {
        this.sounds[args.name] = new Object();
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        if(this.context == undefined) {
            this.context = new AudioContext();
        }
        //var context = new AudioContext();
        var loader = new BufferLoader(this.context,
                                      [args.file],
                                      this.Load.bind(this, args.name));
                                      this.sounds[args.name].context = this.context;
                                      Loader.prototype.total++;
                                      loader.load();
    };

    SoundLoader.prototype.Load = function(name, buffer) {
        this.sounds[name].buffer = buffer[0];
        this.Loaded();
    };
}
SoundLoader.prototype = new Loader();
SoundLoader.prototype.constructor = SoundLoader;
module.exports = SoundLoader;