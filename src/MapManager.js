const Water = require('./Water');
const Lava = require('./Lava');
const World = require('./World');
const Player = require('./Player');
const Princess = require('./Princess');
const THREE = require('./ThreeHelpers');

const Enemies = {
    Hula1 : require('./enemies/Hula1'),
    Hula2 : require('./enemies/Hula2')
};

function MapManager() {
    this.mapName = "Unknown";
    this.mapFile = "map1.png";
    this.startPosition = undefined;
    this.playerModel = "player.vox";
    this.voxModels = [];
    this.percentLoaded = 0;
    this.clearColor = 0x000000;
    this.fogColor = 0x000000;
    this.blockSize = 0.5;
    this.wallHeight = 20;
    this.useWater = false;
    this.enemiesKilled = 0;
    this.princess = undefined;
    this.waterPosition = 0;
    this.id = 0;
};

// MapManager.prototype.GetTotalEnemies = function() {
//     return this.enemiesBefore.length;
// };

// MapManager.prototype.GetEnemiesLeft = function() {
//     return (this.enemiesBefore.length - this.enemiesKilled);
// };

MapManager.prototype.Create = function(args) {
    this.mapName = args.mapName;
    this.mapFile = args.mapFile;
    this.playerPosition = args.playerPosition;
    this.playerModel = args.playerModel;
    this.princessPosition = args.princessPosition;
    this.princessModel = args.princessModel;
    this.cageModel = args.cageModel;
    this.cagePosition = args.cagePosition;
    this.castleModel = args.castleModel;
    this.castlePosition = args.castlePosition;
    this.enemiesBefore = args.enemiesBefore;
    this.enemiesAfter = args.enemiesAfter;
    this.fogColor = args.fogColor;
    this.clearColor = args.clearColor;
    this.blockSize = args.blockSize;
    this.wallHeight = args.wallHeight;
    this.useLava = args.useLava;
    this.useWater = args.useWater;
    this.waterPosition = args.waterPosition;
    this.lavaPosition = args.lavaPosition;
    this.id = args.mapId;

    game.scene.fog = new THREE.Fog( this.fogColor, 40, 60 );
    game.renderer.setClearColor(this.clearColor, 1);

    // Init lights
    args.lights();

    // Spawn items
    //args.items();
    // if(args.objects != undefined) {
    //     args.objects();
    // }

    this.SpawnWorld(function(){
        this.BuildWorldChunks();        
    }.bind(this));

};

MapManager.prototype.BuildWorldChunks = function() {
    var x = game.chunkManager.PercentLoaded();
    console.log("World loaded: "+x+"% ", game.chunkManager.maxChunks);

    game.chunkManager.BuildAllChunks();

    if(this.useWater) {
        var water = new Water();
        water.Create(game.scene); 
        game.objects.push(water);
    }

    this.SpawnPlayer();
//    $('#statusEnemies').fadeIn(600);
//    $('#statusEnemies').text("Enemies left: "+this.GetEnemiesLeft());
//    game.setStatusCenter(this.mapName, "#FF0000");
//    $('#statusCenter').fadeIn(1000);
    setTimeout(function() {
        $('#statusCenter').fadeOut(2000);
    }, 3000);
    $('#loading').hide();
};


MapManager.prototype.SpawnWorld = function(callback) {
    console.log("Spawning world.");
    // Load top
    game.world = new World();
    game.world.Load(this.mapFile, 
                    this.wallHeight, 
                    this.blockSize, callback); // 10924 triangles
};

MapManager.prototype.SpawnPlayer = function() {
    game.player = new Player();
    game.player.Create(this.playerModel, this.playerPosition);
};

module.exports = MapManager;