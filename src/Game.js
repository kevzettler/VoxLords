const VoxLoader = require('./VoxLoader');
const SoundLoader = require('./SoundLoader');
const ChunkManager = require('./ChunkManager');
const MapManager = require('./MapManager');
const PhysBlockPool = require('./PhysBlockPool');
const AmmoPool = require('./AmmoPool');
const THREE = require('./ThreeHelpers');
const HealthBox = require('./items/HealthBox');
const WeaponBox = require('./items/WeaponBox');
const Godmode = require('./items/GodMode');
const Bomb = require('./items/Bomb');

//objects
const Cloud = require('./Cloud');
const Tree = require('./Tree');
const Lava = require('./Lava');
const Water = require('./Water');

function Game() {
    this.container;
    this.scene;
    this.camera;
    this.renderer;
    this.stats;
    this.clock;
    this.controls;

    // Scene settings
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    this.viewAngle = 40;
    this.aspect = this.screenWidth/this.screenHeight;
    this.near = 1;
    this.far = 61;
    this.invMaxFps = 1/60;
    this.frameDelta = 0;
    this.updateEnd = 0;
    this.animId = 0;
    this.spectate = 1;

    // Object arrays
    this.objects = [];
//    this.engines = [];
    this.targets = [];

    // Game
    this.world = undefined;
    this.rotateY = new THREE.Matrix4().makeRotationY( 0.005 );

    this.worldMap = undefined;
    this.chunkManager = undefined;
    this.player = undefined;
    this.physBlockPool = undefined;
    this.snowPool = undefined;
    this.ammoPool = undefined;
    this.voxLoader = new VoxLoader();
    this.soundLoader = new SoundLoader();
    this.currentMap = undefined;
    this.songMuted = false;
};


Game.prototype.LoadScene = function(mapId) {
    var x = game.voxLoader.PercentLoaded();
    console.log("Loaded: "+x+"%");
    if(x < 100) {
        setTimeout(function() { 
            game.LoadScene(mapId);
        }, 500);
        return;
    }

    this.SetMap(mapId);
    $('#status_1').text("Total blocks: "+this.chunkManager.totalBlocks);
    $('#status_2').text("Active blocks: "+this.chunkManager.activeBlocks);
    $('#status_3').text("Total chunks: "+this.chunkManager.totalChunks);
    $('#status_4').text("Active triangles: "+this.chunkManager.activeTriangles);

    setTimeout(function() {
        $('#container').fadeIn(1000);
        $('#menu').hide();
        game.setStatus("Kill all enemies and save princess Voxilia");
        $('#weapons').fadeIn(1000);
    }, 3000);

    this.physBlockPool = new PhysBlockPool();
    this.physBlockPool.Create(500);

    this.snowPool = new PhysBlockPool();
    this.snowPool.Create(1000);

    this.ammoPool = new AmmoPool();
    this.ammoPool.Create(30);
    this.animate();
};

//==========================================================
// Init other stuff
//==========================================================
Game.prototype.Init = function(mapId) {
    // $('#container').html("");
    // $('#container').hide();
    // $('#stats').html("");
    // $('#menu').html("");
    $('#main').css({"background": "url('gui/gui1/bg"+mapId+".png') no-repeat"});
    $('#main').css({"background-size": "cover"});
    this.clock = new THREE.Clock();
    this.stats = new Stats();
    $('#stats').append(this.stats.domElement);

    this.initScene(); // KJZ we only need to this on the client?

    // Load models
    // KJZ need this on the server. Need abastraction on client for
    // blob data
    this.voxLoader.Add({file: "box_hp.vox", name: "healthbox"});
    this.voxLoader.Add({file: "princess.vox", name: "princess"});
    this.voxLoader.Add({file: "player1.vox", name: "player"});
    // this.voxLoader.Add({file: "santa.vox", name: "santa"});
    // this.voxLoader.Add({file: "elf.vox", name: "elf"});
    // this.voxLoader.Add({file: "devil1.vox", name: "devil1"});
    // this.voxLoader.Add({file: "devil2.vox", name: "devil2"});
    this.voxLoader.Add({file: "cage.vox", name: "cage"});
    this.voxLoader.Add({file: "box_explode.vox", name: "bomb"});
    this.voxLoader.Add({file: "box_godmode.vox", name: "godmode"});
    this.voxLoader.Add({file: "castle1.vox", name: "castle"});
    this.voxLoader.Add({file: "weaponbox.vox", name: "weaponbox"});
    this.voxLoader.Add({file: "hula1.vox", name: "hula1"});
    this.voxLoader.Add({file: "hula2.vox", name: "hula2"});
    this.voxLoader.Add({file: "tree1.vox", name: "tree1"});
    this.voxLoader.Add({file: "tree2.vox", name: "tree2"});
    this.voxLoader.Add({file: "tree3.vox", name: "tree3"});
    this.voxLoader.Add({file: "tree4.vox", name: "tree4"});
    this.voxLoader.Add({file: "tree5.vox", name: "tree5"});
    this.voxLoader.Add({file: "tree7.vox", name: "tree7"});
    this.voxLoader.Add({file: "tree8.vox", name: "tree8"});
    this.voxLoader.Add({file: "hell1.vox", name: "hell1"});
    this.voxLoader.Add({file: "hell2.vox", name: "hell2"});
    this.voxLoader.Add({file: "cloud1.vox", name: "cloud1"});
    // this.voxLoader.Add({file: "plantox1.vox", name: "plantox1"});
    // this.voxLoader.Add({file: "plantox2.vox", name: "plantox2"});
   
    // Load sounds
    //KJZ defitnitly only need this on client
    this.soundLoader.Add({file: "sound/explosion2.mp3", name: "explode"});
    this.soundLoader.Add({file: "sound/shot2.mp3", name: "shot1"});
    this.soundLoader.Add({file: "sound/runcastle.wav", name: "princess_saved"});
    this.soundLoader.Add({file: "sound/help.wav", name: "princess_help"});
    this.soundLoader.Add({file: "sound/aj.wav", name: "princess_aj"});
    this.soundLoader.Add({file: "sound/saved.wav", name: "princess_castle"});
    this.soundLoader.Add({file: "sound/careful.wav", name: "princess_careful"});
    this.soundLoader.Add({file: "sound/voxaj.wav", name: "vox_aj"});
    this.soundLoader.Add({file: "sound/crate_explode.wav", name: "crate_explode"});
    this.soundLoader.Add({file: "sound/health.mp3", name: "health"});
    this.soundLoader.Add({file: "sound/die1.mp3", name: "die1"});
    this.soundLoader.Add({file: "sound/die2.mp3", name: "die2"});
    this.soundLoader.Add({file: "sound/growl1.mp3", name: "growl1"});
    this.soundLoader.Add({file: "sound/growl2.mp3", name: "growl2"});
    this.soundLoader.Add({file: "sound/jump.wav", name: "jump"});
    this.soundLoader.Add({file: "sound/swoosh.wav", name: "swoosh"});

    //KJZ only need on client
    this.renderer = new THREE.WebGLRenderer( {antialias: true} );
    this.renderer.setSize(this.screenWidth, this.screenHeight);
    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
    this.keyboard = new THREEx.KeyboardState();
    this.container = document.getElementById('container');
    this.container.appendChild(this.renderer.domElement);
    THREEx.WindowResize(this.renderer, this.camera);

    //KJZ BOTH
    this.chunkManager = new ChunkManager();

    // $('#statusCenter').html("<font size='20px' style='color: #FFFFFF; ' class=''>Loading, please wait...<br></font><font class='' style='font-size:20px; color: #FFFFFF;'>Walk/jump W-A-S-D-SPACE, click to shoot.<br>Keys 1-3 to choose weapon.</font>");
    // $('#statusCenter').show();

    //KJZ need on server but abstract method for blob on client
    this.LoadScene(mapId);
};

//==========================================================
// InitScene
//==========================================================
Game.prototype.initScene = function() {
    this.scene = new THREE.Scene();
    //this.scene.fog = new THREE.FogExp2( 0x000000, 0.0025 );
    this.camera = new THREE.PerspectiveCamera(this.viewAngle, this.aspect, this.near, this.far);
    this.scene.add(this.camera);
};

//==========================================================
// Re init
//==========================================================
Game.prototype.ReInit = function(mapId) {
    localStorage.setItem("mapId", mapId);
    localStorage.setItem("reload", 1);
    localStorage.setItem("sound", this.soundLoader.muted);
    localStorage.setItem("music", this.songMuted);
    window.location.reload();
};

//==========================================================
// Update status text such as objective
//==========================================================
Game.prototype.setStatus = function(text, color) {
    if(text != "") {
        if(color != undefined) {
            $('#status').css({'color': color});
        }
        $('#status').text(text);
        $('#status').fadeIn(600);
    } else {
        $('#status').text("");
        $('#status').fadeOut(600);
    }
};

//==========================================================
// Update progressbar for loading map
//==========================================================
// Game.prototype.updateProgress = function(txt, percent) {
//     $('#loading').fadeIn();
//     $('#progress').text(txt);
//     $('#progress').width(percent);
// };

//==========================================================
// Update status text such as "God mode ..."
//==========================================================
Game.prototype.setStatusCenter = function(text, color) {
    if(text != "") {
        if(color != undefined) {
            $('#statusCenter').css({'color': color});
        }
        $('#statusCenter').text(text);
        $('#statusCenter').fadeIn(600);
    } else {
        $('#statusCenter').text("");
        $('#statusCenter').fadeOut(600);
    }
};

Game.prototype.onWindowResize = function() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
};

//==========================================================
// Render
//==========================================================
Game.prototype.render = function() {
    this.renderer.render(this.scene, this.camera);
};

//==========================================================
// Animate
//==========================================================
Game.prototype.animate = function() {
    this.animId = requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.update();
};

//==========================================================
// Update
//==========================================================
Game.prototype.update = function() {
    var delta = this.clock.getDelta(),
    time = this.clock.getElapsedTime() * 10;

    this.frameDelta += delta;

    while(this.frameDelta >= this.invMaxFps) {
        THREE.AnimationHandler.update(this.invMaxFps);
        this.chunkManager.Draw(time, this.invMaxFps);
        for(var i = 0; i < this.objects.length; i++) {
            if(this.objects[i] != undefined) {
                if(this.objects[i].remove == 1) { 
                    this.objects.splice(i, 1);
                } else {
                    this.objects[i].Draw(time, this.invMaxFps, i);
                }
            }
        }
        for(var i = 0; i < this.targets.length; i++) {
            if(this.targets[i] != undefined) {
                if(this.targets[i].that.remove == 1) { 
                    this.targets.splice(i, 1);
                } else if(this.targets[i].that.skipDraw > 0) {
                    this.targets[i].that.skipDraw--;
                    continue;
                } else {
                    if(this.targets[i].that.type != "player") {
                        this.targets[i].that.Draw(time, this.invMaxFps);
                    }
                }
            }
        }
        this.frameDelta -= this.invMaxFps;
    }   
    this.stats.update();
};

Game.prototype.getDistance = function(v1, v2) {
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;
    return Math.sqrt(dx*dx+dy*dy+dz*dz);
};

Game.prototype.SetMap = function(id) {
    var map = new Object();
    map.mapId = 4;
    map.mapFile = "maps/map4.png";
    map.mapName = "Voxadu Beach: Home of Lord Bolvox";
    map.playerPosition = new THREE.Vector3(16, 0.5, 119);
    map.playerModel = "player";
    map.fogColor = 0xeddeab;
    map.clearColor = 0xeddeab;
    map.blockSize = 0.5;
    map.wallHeight = 20;
    map.useWater = true;
    map.waterPosition = 0.2;

    map.objects = function() {
        new Tree().Create(8,2,110, 2, "tree1");
        new Tree().Create(45,2,60, 2, "tree1");
        new Tree().Create(59,2,35, 2, "tree1");
        new Tree().Create(17,2,13, 2, "tree1");
        new Tree().Create(33,2,13, 2, "tree1");
        new Tree().Create(110,2.5,16, 2, "tree1");
        new Tree().Create(107,2.5,27, 2, "tree2");
        new Tree().Create(92,3.5,109, 2, "tree2");
        new Tree().Create(86,3.5,107, 2, "tree2");
    };

    map.items = function() {
       new HealthBox().Create(new THREE.Vector3(72, 2, 52));
       new HealthBox().Create(new THREE.Vector3(121, 1, 53));
       new WeaponBox().Create(new THREE.Vector3(92, 4, 97));
       new WeaponBox().Create(new THREE.Vector3(23, 3, 21));
       new Godmode().Create(new THREE.Vector3(101, 1, 39));
       new Godmode().Create(new THREE.Vector3(69, 3.5, 79));
       new Godmode().Create(new THREE.Vector3(25, 2.5, 120));
       new HealthBox().Create(new THREE.Vector3(69, 2.5, 18));
       new Bomb().Create(new THREE.Vector3(30, 1, 75));
       new HealthBox().Create(new THREE.Vector3(15, 3, 13));
    };

    map.lights = function() {
        console.log("Initiate lights...");
        var ambientLight = new THREE.AmbientLight( 0x000033 );
        game.scene.add( ambientLight );

        var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.9 );
        hemiLight.color.setHSL( 0.6, 1, 0.6 );
        hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
        hemiLight.position.set( 0, 500, 0 );
        game.scene.add( hemiLight );

        var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
        dirLight.color.setHSL( 0.1, 1, 0.95 );
        dirLight.position.set( 10, 10.75, 10 );
        dirLight.position.multiplyScalar( 10 );
        game.scene.add( dirLight );

        dirLight.castShadow = true;

        dirLight.shadowMapWidth = 2048;
        dirLight.shadowMapHeight = 2048;

        var d = 150;

        dirLight.shadowCameraLeft = -d;
        dirLight.shadowCameraRight = d;
        dirLight.shadowCameraTop = d;
        dirLight.shadowCameraBottom = -d;

        dirLight.shadowCameraFar = 3500;
        dirLight.shadowBias = -0.0001;
        dirLight.shadowDarkness = 0.45;
    };

    this.currentMap = new MapManager();
    this.currentMap.Create(map);
};

module.exports = Game;