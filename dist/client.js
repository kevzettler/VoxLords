/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Game = __webpack_require__(1);
	var game = new Game();
	window.game = game;
	window.game.Init(4);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var VoxLoader = __webpack_require__(2);
	var SoundLoader = __webpack_require__(4);
	var ChunkManager = __webpack_require__(5);
	var MapManager = __webpack_require__(6);
	var PhysBlockPool = __webpack_require__(7);
	var AmmoPool = __webpack_require__(8);

	//objects
	var Cloud = __webpack_require__(9);
	var Tree = __webpack_require__(11);
	var Lava = __webpack_require__(12);
	var Water = __webpack_require__(13);

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
	    this.aspect = this.screenWidth / this.screenHeight;
	    this.near = 1;
	    this.far = 61;
	    this.invMaxFps = 1 / 60;
	    this.frameDelta = 0;
	    this.updateEnd = 0;
	    this.animId = 0;
	    this.spectate = 1;

	    // Object arrays
	    this.objects = [];
	    this.engines = [];
	    this.targets = [];

	    // Game
	    this.world = undefined;
	    this.rotateY = new THREE.Matrix4().makeRotationY(0.005);

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

	Game.prototype.LoadScene = function (mapId) {
	    var x = game.voxLoader.PercentLoaded();
	    console.log("Loaded: " + x + "%");
	    if (x < 100) {
	        setTimeout(function () {
	            game.LoadScene(mapId);
	        }, 500);
	        return;
	    }
	    this.SetMap(mapId);
	    $('#status_1').text("Total blocks: " + this.chunkManager.totalBlocks);
	    $('#status_2').text("Active blocks: " + this.chunkManager.activeBlocks);
	    $('#status_3').text("Total chunks: " + this.chunkManager.totalChunks);
	    $('#status_4').text("Active triangles: " + this.chunkManager.activeTriangles);

	    setTimeout(function () {
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
	Game.prototype.Init = function (mapId) {
	    localStorage.setItem("mapId", 0);
	    localStorage.setItem("reload", 0);
	    $('#container').html("");
	    $('#container').hide();
	    $('#stats').html("");
	    $('#menu').html("");
	    $('#main').css({ "background": "url('gui/gui1/bg" + mapId + ".png') no-repeat" });
	    $('#main').css({ "background-size": "cover" });
	    this.clock = new THREE.Clock();
	    this.stats = new Stats();
	    $('#stats').append(this.stats.domElement);

	    this.initScene();

	    // Load models
	    this.voxLoader.Add({ file: "box_hp.vox", name: "healthbox" });
	    this.voxLoader.Add({ file: "princess.vox", name: "princess" });
	    this.voxLoader.Add({ file: "player1.vox", name: "player" });
	    this.voxLoader.Add({ file: "santa.vox", name: "santa" });
	    this.voxLoader.Add({ file: "elf.vox", name: "elf" });
	    this.voxLoader.Add({ file: "devil1.vox", name: "devil1" });
	    this.voxLoader.Add({ file: "devil2.vox", name: "devil2" });
	    this.voxLoader.Add({ file: "cage.vox", name: "cage" });
	    this.voxLoader.Add({ file: "box_explode.vox", name: "bomb" });
	    this.voxLoader.Add({ file: "box_godmode.vox", name: "godmode" });
	    this.voxLoader.Add({ file: "castle1.vox", name: "castle" });
	    this.voxLoader.Add({ file: "weaponbox.vox", name: "weaponbox" });
	    this.voxLoader.Add({ file: "hula1.vox", name: "hula1" });
	    this.voxLoader.Add({ file: "hula2.vox", name: "hula2" });
	    this.voxLoader.Add({ file: "tree1.vox", name: "tree1" });
	    this.voxLoader.Add({ file: "tree2.vox", name: "tree2" });
	    this.voxLoader.Add({ file: "tree3.vox", name: "tree3" });
	    this.voxLoader.Add({ file: "tree4.vox", name: "tree4" });
	    this.voxLoader.Add({ file: "tree5.vox", name: "tree5" });
	    this.voxLoader.Add({ file: "tree7.vox", name: "tree7" });
	    this.voxLoader.Add({ file: "tree8.vox", name: "tree8" });
	    this.voxLoader.Add({ file: "hell1.vox", name: "hell1" });
	    this.voxLoader.Add({ file: "hell2.vox", name: "hell2" });
	    this.voxLoader.Add({ file: "cloud1.vox", name: "cloud1" });
	    this.voxLoader.Add({ file: "plantox1.vox", name: "plantox1" });
	    this.voxLoader.Add({ file: "plantox2.vox", name: "plantox2" });

	    // Load sounds
	    this.soundLoader.Add({ file: "sound/explosion2.mp3", name: "explode" });
	    this.soundLoader.Add({ file: "sound/shot2.mp3", name: "shot1" });
	    this.soundLoader.Add({ file: "sound/runcastle.wav", name: "princess_saved" });
	    this.soundLoader.Add({ file: "sound/help.wav", name: "princess_help" });
	    this.soundLoader.Add({ file: "sound/aj.wav", name: "princess_aj" });
	    this.soundLoader.Add({ file: "sound/saved.wav", name: "princess_castle" });
	    this.soundLoader.Add({ file: "sound/careful.wav", name: "princess_careful" });
	    this.soundLoader.Add({ file: "sound/voxaj.wav", name: "vox_aj" });
	    this.soundLoader.Add({ file: "sound/crate_explode.wav", name: "crate_explode" });
	    this.soundLoader.Add({ file: "sound/health.mp3", name: "health" });
	    this.soundLoader.Add({ file: "sound/die1.mp3", name: "die1" });
	    this.soundLoader.Add({ file: "sound/die2.mp3", name: "die2" });
	    this.soundLoader.Add({ file: "sound/growl1.mp3", name: "growl1" });
	    this.soundLoader.Add({ file: "sound/growl2.mp3", name: "growl2" });
	    this.soundLoader.Add({ file: "sound/jump.wav", name: "jump" });
	    this.soundLoader.Add({ file: "sound/swoosh.wav", name: "swoosh" });

	    this.renderer = new THREE.WebGLRenderer({ antialias: true });
	    this.renderer.setSize(this.screenWidth, this.screenHeight);
	    this.renderer.shadowMapEnabled = true;
	    this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
	    this.keyboard = new THREEx.KeyboardState();
	    this.container = document.getElementById('container');
	    //this.container.innerHTML = '';
	    this.container.appendChild(this.renderer.domElement);

	    THREEx.WindowResize(this.renderer, this.camera);

	    this.chunkManager = new ChunkManager();
	    this.chunkManager.Create();

	    $('#statusCenter').html("<font size='20px' style='color: #FFFFFF; ' class=''>Loading, please wait...<br></font><font class='' style='font-size:20px; color: #FFFFFF;'>Walk/jump W-A-S-D-SPACE, click to shoot.<br>Keys 1-3 to choose weapon.</font>");
	    $('#statusCenter').show();

	    this.LoadScene(mapId);
	};

	//==========================================================
	// InitScene
	//==========================================================
	Game.prototype.initScene = function () {
	    this.scene = new THREE.Scene();
	    //this.scene.fog = new THREE.FogExp2( 0x000000, 0.0025 );
	    this.camera = new THREE.PerspectiveCamera(this.viewAngle, this.aspect, this.near, this.far);
	    this.scene.add(this.camera);
	};

	//==========================================================
	// Re init
	//==========================================================
	Game.prototype.ReInit = function (mapId) {
	    localStorage.setItem("mapId", mapId);
	    localStorage.setItem("reload", 1);
	    localStorage.setItem("sound", this.soundLoader.muted);
	    localStorage.setItem("music", this.songMuted);
	    window.location.reload();
	};

	//==========================================================
	// Update status text such as objective
	//==========================================================
	Game.prototype.setStatus = function (text, color) {
	    if (text != "") {
	        if (color != undefined) {
	            $('#status').css({ 'color': color });
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
	Game.prototype.updateProgress = function (txt, percent) {
	    $('#loading').fadeIn();
	    $('#progress').text(txt);
	    $('#progress').width(percent);
	};

	//==========================================================
	// Update status text such as "God mode ..."
	//==========================================================
	Game.prototype.setStatusCenter = function (text, color) {
	    if (text != "") {
	        if (color != undefined) {
	            $('#statusCenter').css({ 'color': color });
	        }
	        $('#statusCenter').text(text);
	        $('#statusCenter').fadeIn(600);
	    } else {
	        $('#statusCenter').text("");
	        $('#statusCenter').fadeOut(600);
	    }
	};

	Game.prototype.onWindowResize = function () {
	    this.camera.aspect = window.innerWidth / window.innerHeight;
	    this.camera.updateProjectionMatrix();
	    this.renderer.setSize(window.innerWidth, window.innerHeight);
	};

	//==========================================================
	// Render
	//==========================================================
	Game.prototype.render = function () {
	    this.renderer.render(this.scene, this.camera);
	};

	//==========================================================
	// Animate
	//==========================================================
	Game.prototype.animate = function () {
	    this.animId = requestAnimationFrame(this.animate.bind(this));
	    this.render();
	    this.update();
	};

	//==========================================================
	// Update
	//==========================================================
	Game.prototype.update = function () {
	    var delta = this.clock.getDelta(),
	        time = this.clock.getElapsedTime() * 10;

	    this.frameDelta += delta;

	    while (this.frameDelta >= this.invMaxFps) {
	        THREE.AnimationHandler.update(this.invMaxFps);
	        this.chunkManager.Draw(time, this.invMaxFps);
	        for (var i = 0; i < this.objects.length; i++) {
	            if (this.objects[i] != undefined) {
	                if (this.objects[i].remove == 1) {
	                    this.objects.splice(i, 1);
	                } else {
	                    this.objects[i].Draw(time, this.invMaxFps, i);
	                }
	            }
	        }
	        for (var i = 0; i < this.targets.length; i++) {
	            if (this.targets[i] != undefined) {
	                if (this.targets[i].that.remove == 1) {
	                    this.targets.splice(i, 1);
	                } else if (this.targets[i].that.skipDraw > 0) {
	                    this.targets[i].that.skipDraw--;
	                    continue;
	                } else {
	                    if (this.targets[i].that.type != "player") {
	                        this.targets[i].that.Draw(time, this.invMaxFps);
	                    }
	                }
	            }
	        }
	        this.frameDelta -= this.invMaxFps;
	    }
	    this.stats.update();
	};

	Game.prototype.getDistance = function (v1, v2) {
	    var dx = v1.x - v2.x;
	    var dy = v1.y - v2.y;
	    var dz = v1.z - v2.z;
	    return Math.sqrt(dx * dx + dy * dy + dz * dz);
	};

	Game.prototype.SetMap = function (id) {
	    var map = new Object();

	    map.mapId = 4;
	    map.mapFile = "maps/map4.png";
	    map.mapName = "Voxadu Beach: Home of Lord Bolvox";
	    map.playerPosition = new THREE.Vector3(16, 0.5, 119);
	    map.playerModel = "player";
	    map.princessModel = "princess";
	    map.cageModel = "cage";
	    map.cagePosition = new THREE.Vector3(107, 2, 21);
	    map.princessPosition = new THREE.Vector3(107, 2.5, 21);
	    map.castlePosition = new THREE.Vector3(77, 3.5, 104);
	    map.castleModel = "castle";
	    // Devil2 = axe devil, devil 1 = old man
	    map.enemiesBefore = [["Hula1", 23, 0.5, 67, "SmallShot"], ["Hula1", 20, 5, 53, "SmallShot"], ["Hula2", 14, 2.5, 21, "FloatingShot"], ["Hula2", 30, 2.5, 18, "FloatingShot"], ["Hula2", 44, 2, 58, "FloatingShot"], ["Hula1", 101, 1, 17, "SmallShot"], ["Hula1", 102, 1.5, 22, "SmallShot"], ["Hula1", 106, 2.5, 27, "SmallShot"]];
	    map.enemiesAfter = [["Hula1", 72, 3.5, 91, "QuakeShot"], ["Hula1", 101, 3.5, 93, "FloatingShot"], ["Hula1", 93, 3.5, 91, "FloatingShot"], ["Hula2", 92, 3.5, 78, "SmallShot"], ["Hula2", 98, 3.5, 79, "SmallShot"], ["Hula2", 105, 3.5, 78, "SmallShot"], ["Hula2", 88, 5, 70, "QuakeShot"]];
	    map.fogColor = 0xeddeab;
	    map.clearColor = 0xeddeab;
	    map.blockSize = 0.5;
	    map.wallHeight = 20;
	    map.useLava = false, map.useWater = true;
	    map.waterPosition = 0.2;
	    map.lavaPosition = 0;
	    map.objects = function () {
	        new Tree().Create(8, 2, 110, 2, "tree1");
	        new Tree().Create(45, 2, 60, 2, "tree1");
	        new Tree().Create(59, 2, 35, 2, "tree1");
	        new Tree().Create(17, 2, 13, 2, "tree1");
	        new Tree().Create(33, 2, 13, 2, "tree1");
	        new Tree().Create(110, 2.5, 16, 2, "tree1");
	        new Tree().Create(107, 2.5, 27, 2, "tree2");
	        new Tree().Create(92, 3.5, 109, 2, "tree2");
	        new Tree().Create(86, 3.5, 107, 2, "tree2");
	    };
	    map.items = function () {
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
	    map.lights = function () {
	        console.log("Initiate lights...");
	        var ambientLight = new THREE.AmbientLight(0x000033);
	        game.scene.add(ambientLight);

	        var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.9);
	        hemiLight.color.setHSL(0.6, 1, 0.6);
	        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
	        hemiLight.position.set(0, 500, 0);
	        game.scene.add(hemiLight);

	        var dirLight = new THREE.DirectionalLight(0xffffff, 1);
	        dirLight.color.setHSL(0.1, 1, 0.95);
	        dirLight.position.set(10, 10.75, 10);
	        dirLight.position.multiplyScalar(10);
	        game.scene.add(dirLight);

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
	        //dirLight.shadowCameraVisible = true;
	    };

	    this.currentMap = new MapManager();
	    this.currentMap.Create(map);
	};

	module.exports = Game;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var Loader = __webpack_require__(3);

	/////////////////////////////////////////////////////////////
	// Vox models
	/////////////////////////////////////////////////////////////
	function VoxLoader() {
	    Loader.call(this);
	    this.models = new Array();

	    VoxLoader.prototype.GetModel = function (name) {
	        return this.models[name].chunk.Clone();
	    };

	    VoxLoader.prototype.Add = function (args) {
	        this.models[args.name] = new Object();
	        this.models[args.name].args = args;
	        Loader.prototype.total++;

	        var vox = new Vox();
	        vox.LoadModel(args.file, this.Load.bind(this), args.name);
	        this.models[args.name].vox = vox;
	    };

	    VoxLoader.prototype.Load = function (vox, name) {
	        console.log("Voxel: " + name + " loaded!");
	        this.models[name].vox = vox;
	        this.models[name].chunk = vox.getChunk();
	        this.models[name].chunk.Rebuild();
	        this.models[name].mesh = vox.getMesh();
	        this.models[name].mesh.geometry.center();
	        this.Loaded();
	    };
	}
	VoxLoader.prototype = new Loader();
	VoxLoader.prototype.constructor = VoxLoader;
	module.exports = VoxLoader;

/***/ },
/* 3 */
/***/ function(module, exports) {

	/////////////////////////////////////////////////////////////
	// Autor: Nergal
	// Date: 2015-01-19
	/////////////////////////////////////////////////////////////
	"use strict";

	function Loader() {
	    Loader.prototype.total = 0;
	    Loader.prototype.loaded = 0;
	    Loader.prototype.percentLoaded = 0;

	    Loader.prototype.PercentLoaded = function () {
	        return Math.round(Loader.prototype.loaded / Loader.prototype.total * 100);
	    };

	    Loader.prototype.Loaded = function () {
	        Loader.prototype.loaded++;
	    };
	}

	module.exports = Loader;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Loader = __webpack_require__(3);

	/////////////////////////////////////////////////////////////
	// Sounds
	/////////////////////////////////////////////////////////////
	function SoundLoader() {
	    Loader.call(this);
	    this.sounds = new Array();
	    this.context;
	    this.muted = false;

	    SoundLoader.prototype.StopSound = function (name) {
	        var source = this.sounds[name].context;
	        source.stop = source.noteOff;
	        source.stop(0);
	    };

	    SoundLoader.prototype.PlaySound = function (name, position, radius) {
	        if (this.muted) {
	            return;
	        }
	        var source = this.sounds[name].context.createBufferSource();
	        source.buffer = this.sounds[name].buffer;
	        var gainNode = this.sounds[name].context.createGain();
	        source.connect(gainNode);
	        gainNode.connect(this.sounds[name].context.destination);

	        if (position != undefined) {
	            var vector = game.camera.localToWorld(new THREE.Vector3(0, 0, 0));
	            var distance = position.distanceTo(vector);
	            if (distance <= radius) {
	                var vol = 1 * (1 - distance / radius);
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

	    SoundLoader.prototype.Add = function (args) {
	        this.sounds[args.name] = new Object();
	        window.AudioContext = window.AudioContext || window.webkitAudioContext;
	        if (this.context == undefined) {
	            this.context = new AudioContext();
	        }
	        //var context = new AudioContext();
	        var loader = new BufferLoader(this.context, [args.file], this.Load.bind(this, args.name));
	        this.sounds[args.name].context = this.context;
	        Loader.prototype.total++;
	        loader.load();
	    };

	    SoundLoader.prototype.Load = function (name, buffer) {
	        this.sounds[name].buffer = buffer[0];
	        this.Loaded();
	    };
	}
	SoundLoader.prototype = new Loader();
	SoundLoader.prototype.constructor = SoundLoader;
	module.exports = SoundLoader;

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";

	function ChunkManager() {
	    this.worldChunks = [];
	    this.totalBlocks = 0;
	    this.totalChunks = 0;
	    this.activeBlocks = 0;
	    this.activeTriangles = 0;
	    this.updateChunks = [];
	    this.maxChunks = 0;
	};

	ChunkManager.prototype.PercentLoaded = function () {
	    console.log("TOTAL: " + this.totalChunks + " MAX: " + this.maxChunks);

	    return Math.round(this.maxChunks / this.totalChunks * 100);
	};

	ChunkManager.prototype.Draw = function (time, delta) {
	    if (this.updateChunks.length > 0) {
	        var cid = this.updateChunks.pop();
	        this.worldChunks[cid].Rebuild();
	    }
	};

	ChunkManager.prototype.Create = function () {};

	ChunkManager.prototype.Blood = function (x, z, power) {
	    var aChunks = [];
	    var aBlocksXZ = [];
	    var aBlocksZ = [];

	    x = Math.round(x);
	    z = Math.round(z);
	    var cid = 0;
	    var totals = 0;
	    var y = this.GetHeight(x, z);
	    y = y / game.world.blockSize;
	    for (var rx = x + power; rx >= x - power; rx -= game.world.blockSize) {
	        for (var rz = z + power; rz >= z - power; rz -= game.world.blockSize) {
	            for (var ry = y + power; ry >= y - power; ry -= game.world.blockSize) {
	                if ((rx - x) * (rx - x) + (ry - y) * (ry - y) + (rz - z) * (rz - z) <= power * power) {
	                    if (Math.random() > 0.7) {
	                        // Set random shade to the blocks to look as burnt.
	                        cid = this.GetWorldChunkID(rx, rz);
	                        if (cid == undefined) {
	                            continue;
	                        }
	                        var pos = this.Translate(rx, rz, cid);

	                        var yy = Math.round(ry);
	                        if (yy <= 0) {
	                            yy = 0;
	                        }
	                        if (this.worldChunks[cid.id].blocks[pos.x][pos.z][yy] != undefined) {
	                            if (this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].active) {
	                                this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].r = 111 + Math.random() * 60;
	                                this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].g = 0;
	                                this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].b = 0;
	                                aChunks.push(cid);
	                            }
	                        }
	                    }
	                }
	            }
	        }
	    }
	    var crebuild = {};
	    for (var i = 0; i < aChunks.length; i++) {
	        crebuild[aChunks[i].id] = 0;
	    }
	    for (var c in crebuild) {
	        this.updateChunks.push(c);
	    }
	};

	ChunkManager.prototype.ExplodeBombSmall = function (x, z) {
	    x = Math.round(x);
	    z = Math.round(z);
	    var y = this.GetHeight(x, z);
	    y = Math.round(y / game.world.blockSize);
	    var cid = this.GetWorldChunkID(x, z);
	    if (cid == undefined) {
	        return;
	    }
	    var pos = this.Translate(x, z, cid);
	    if (this.worldChunks[cid.id].blocks[pos.x][pos.z][y] == undefined) {
	        return;
	    }
	    this.worldChunks[cid.id].blocks[pos.x][pos.z][y].setActive(false);
	    this.worldChunks[cid.id].Rebuild();

	    for (var i = 0; i < 6; i++) {
	        var block = game.physBlockPool.Get();
	        if (block != undefined) {
	            block.Create(x, y / 2, z, this.worldChunks[cid.id].blockSize / 2, this.worldChunks[cid.id].blocks[pos.x][pos.z][y].r, this.worldChunks[cid.id].blocks[pos.x][pos.z][y].g, this.worldChunks[cid.id].blocks[pos.x][pos.z][y].b, 2, Math.random() * 180, 2);
	        }
	    }
	};

	ChunkManager.prototype.ExplodeBomb = function (x, z, power, blood, iny) {
	    // Get all blocks in the explosion.
	    // then for each block get chunk and remove the blocks
	    // and rebuild the affected chunks.
	    var aChunks = [];
	    var aBlocksXZ = [];
	    var aBlocksY = [];
	    x = Math.round(x);
	    z = Math.round(z);
	    var cid = 0;

	    var totals = 0;
	    var y;
	    if (iny == undefined) {
	        var y = this.GetHeight(x, z);
	        y = Math.round(y / game.world.blockSize);
	    } else {
	        y = iny;
	    }
	    var shade = 0.5;

	    var yy = 0;
	    var pos = 0;
	    var val = 0;
	    var pow = 0;
	    var rand = 0;
	    var block = undefined;
	    for (var rx = x + power; rx >= x - power; rx -= game.world.blockSize) {
	        for (var rz = z + power; rz >= z - power; rz -= game.world.blockSize) {
	            for (var ry = y + power; ry >= y - power; ry -= game.world.blockSize) {
	                val = (rx - x) * (rx - x) + (ry - y) * (ry - y) + (rz - z) * (rz - z);
	                pow = power * power;
	                if (val <= pow) {
	                    cid = this.GetWorldChunkID(rx, rz);
	                    if (cid == undefined) {
	                        continue;
	                    }
	                    pos = this.Translate(rx, rz, cid);
	                    if (ry <= 0) {
	                        yy = 0;
	                    } else {
	                        yy = Math.round(ry);
	                    }
	                    if (this.worldChunks[cid.id].blocks[pos.x] == undefined) {
	                        continue;
	                    }
	                    if (this.worldChunks[cid.id].blocks[pos.x][pos.z] == undefined) {
	                        continue;
	                    }

	                    if (this.worldChunks[cid.id].blocks[pos.x][pos.z][yy] != undefined) {
	                        if (this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].isActive()) {
	                            aBlocksXZ.push(pos);
	                            aChunks.push(cid);
	                            aBlocksY.push(yy);
	                            totals++;
	                            if (Math.random() > 0.95) {
	                                // Create PhysBlock
	                                block = game.physBlockPool.Get();
	                                if (block != undefined) {
	                                    block.Create(rx, yy, rz, this.worldChunks[cid.id].blockSize, this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].r, this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].g, this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].b, 3, Math.random() * 180, power);
	                                }
	                            }
	                        } else {
	                            //console.log("NO ACTIVE CID: "+cid.id+ " X: "+pos.z + " Z: "+pos.z + " Y: "+yy);
	                        }
	                    }
	                } else if (val <= pow * 1.2 && val >= pow) {
	                        // Set random shade to the blocks to look as burnt.
	                        cid = this.GetWorldChunkID(rx, rz);
	                        if (cid == undefined) {
	                            continue;
	                        }
	                        pos = this.Translate(rx, rz, cid);

	                        yy = Math.round(ry);
	                        if (yy <= 0) {
	                            yy = 0;
	                        }
	                        if (pos == undefined) {
	                            continue;
	                        }
	                        if (this.worldChunks[cid.id].blocks[pos.x] == undefined) {
	                            continue;
	                        }
	                        if (this.worldChunks[cid.id].blocks[pos.x][pos.z] == undefined) {
	                            continue;
	                        }
	                        if (this.worldChunks[cid.id].blocks[pos.x][pos.z][yy] != undefined) {
	                            if (this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].isActive()) {
	                                if (blood) {
	                                    rand = Math.random() * 60;
	                                    if (rand > 20) {
	                                        aBlocksXZ.push(pos);
	                                        aChunks.push(cid);
	                                        aBlocksY.push(yy);
	                                        this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].r = 111 + rand;
	                                        this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].g = 0;
	                                        this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].b = 0;
	                                    }
	                                } else {
	                                    aBlocksXZ.push(pos);
	                                    aChunks.push(cid);
	                                    aBlocksY.push(yy);
	                                    this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].r *= shade;
	                                    this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].g *= shade;
	                                    this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].b *= shade;
	                                }
	                            }
	                        }
	                    }
	            }
	        }
	    }

	    // Deactivate all and rebuild chunks
	    var crebuild = {};
	    for (var i = 0; i < aChunks.length; i++) {
	        this.worldChunks[aChunks[i].id].blocks[aBlocksXZ[i].x][aBlocksXZ[i].z][aBlocksY[i]].setActive(false);
	        // Check if on border
	        if (aBlocksXZ[i].x == this.worldChunks[aChunks[i].id].chunkSizeX - 1) {
	            crebuild[aChunks[i].id + 1] = 0;
	        } else if (aBlocksXZ[i].x == 0) {
	            crebuild[aChunks[i].id - 1] = 0;
	        }

	        if (aBlocksXZ[i].z == this.worldChunks[aChunks[i].id].chunkSizeZ - 1) {} else if (aBlocksXZ[i].z == 0) {}

	        if (aBlocksY[i] == this.worldChunks[aChunks[i].id].chunkSizeY - 1) {
	            crebuild[aChunks[i].id + Math.sqrt(game.world.map.length)] = 0;
	        } else if (aBlocksY[i] == 0) {
	            crebuild[aChunks[i].id - Math.sqrt(game.world.map.length)] = 0;
	        }

	        crebuild[aChunks[i].id] = 0;
	    }
	    for (var c in crebuild) {
	        this.updateChunks.push(c);
	    }
	};

	ChunkManager.prototype.AddWorldChunk = function (chunk) {
	    this.totalChunks++;
	    this.totalBlocks += chunk.blocks.length * chunk.blocks.length * chunk.blocks.length;
	    this.activeBlocks += chunk.NoOfActiveBlocks();
	    this.worldChunks.push(chunk);
	};

	ChunkManager.prototype.BuildAllChunks = function () {
	    for (var i = 0; i < this.worldChunks.length; i++) {
	        this.worldChunks[i].Rebuild();
	        this.activeTriangles += this.worldChunks[i].GetActiveTriangles();
	    }
	    this.AddTargets();
	    console.log("ACTIVE TRIANGLES: " + this.activeTriangles);
	    console.log("ACTIVE BLOCKS: " + this.activeBlocks);
	};

	ChunkManager.prototype.AddTargets = function () {
	    for (var i = 0; i < this.worldChunks.length; i++) {
	        var chunk = this.worldChunks[i];
	    }
	};

	ChunkManager.prototype.GetWorldChunkID = function (x, z) {
	    if (game.worldMap == undefined) {
	        return;
	    }
	    var mp = game.world.chunkSize * game.world.blockSize;
	    var w_x = Math.floor(Math.abs(x) / mp);
	    var w_z = Math.floor(Math.abs(z) / mp);
	    if (game.worldMap[w_x] == undefined) {
	        return;
	    }
	    if (game.worldMap[w_x][w_z] == undefined) {
	        return;
	    }
	    var cid = game.worldMap[w_x][w_z];
	    return cid;
	};

	ChunkManager.prototype.GetChunk = function (x, z) {
	    var mp = game.world.chunkSize * game.world.blockSize;
	    var w_x = Math.floor(Math.abs(x) / mp);
	    var w_z = Math.floor(Math.abs(z) / mp);
	    if (game.worldMap[w_x][w_z] == undefined) {
	        return;
	    }
	    var cid = game.worldMap[w_x][w_z];
	    return this.worldChunks[cid.id];
	};

	ChunkManager.prototype.Translate = function (x, z, cid) {
	    var x1 = Math.round((z - this.worldChunks[cid.id].posX) / game.world.blockSize);
	    var z1 = Math.round((x - this.worldChunks[cid.id].posY) / game.world.blockSize);
	    x1 = Math.abs(x1 - 1);
	    z1 = Math.abs(z1 - 1);
	    return { x: x1, z: z1 };
	};

	ChunkManager.prototype.GetHeight = function (x, z) {
	    var cid = this.GetWorldChunkID(x, z);
	    if (cid == undefined) {
	        return undefined;
	    }
	    if (this.worldChunks[cid.id] == undefined) {
	        return undefined;
	    }
	    var tmp = this.Translate(x, z, cid);

	    var x1 = Math.round(tmp.x);
	    var z1 = Math.round(tmp.z);
	    if (this.worldChunks[cid.id].blocks[x1] != undefined) {
	        if (this.worldChunks[cid.id].blocks[x1][z1] != undefined) {
	            var y = this.worldChunks[cid.id].blocks[x1][z1].height * game.world.blockSize;
	        }
	    }

	    if (y > 0) {
	        return y;
	    } else {
	        return 0;
	    }
	};

	ChunkManager.prototype.CheckActive = function (x, z, y) {
	    var cid = this.GetWorldChunkID(x, z);
	    if (cid == undefined) {
	        return false;
	    }
	    var tmp = this.Translate(x, z, cid); //x+1
	    var x1 = tmp.x;
	    var z1 = tmp.z;
	    if (this.worldChunks[cid.id] == undefined || this.worldChunks[cid.id].blocks[x1][z1][y] == undefined) {
	        return false;
	    } else {
	        this.worldChunks[cid.id].blocks[x1][z1][y].r = 255;
	        return !this.worldChunks[cid.id].blocks[x1][z1][y].isActive();
	    }
	};

	module.exports = ChunkManager;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Water = __webpack_require__(13);
	var Lava = __webpack_require__(12);

	function MapManager() {
	    this.mapName = "Unknown";
	    this.mapFile = "map1.png";
	    this.startPosition = undefined;
	    this.playerModel = "player.vox";
	    this.princessModel = "princess.vox";
	    this.cageModel = "cage.vox";
	    this.cagePosition = undefined;
	    this.castleModel = "castle.vox";
	    this.castlePosition = undefined;
	    this.voxModels = [];
	    this.enemiesBefore = [];
	    this.enemiesAfter = [];
	    this.percentLoaded = 0;
	    this.clearColor = 0x000000;
	    this.fogColor = 0x000000;
	    this.blockSize = 0.5;
	    this.wallHeight = 20;
	    this.useLava = true;
	    this.useWater = false;
	    this.enemiesKilled = 0;
	    this.princess = undefined;
	    this.waterPosition = 0;
	    this.lavaPosition = 0;
	    this.id = 0;
	};

	MapManager.prototype.GetTotalEnemies = function () {
	    return this.enemiesBefore.length;
	};

	MapManager.prototype.GetEnemiesLeft = function () {
	    return this.enemiesBefore.length - this.enemiesKilled;
	};

	MapManager.prototype.Create = function (args) {
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

	    game.scene.fog = new THREE.Fog(this.fogColor, 40, 60);
	    game.renderer.setClearColor(this.clearColor, 1);

	    // Init lights
	    args.lights();

	    // Spawn items
	    args.items();
	    if (args.objects != undefined) {
	        args.objects();
	    }

	    this.SpawnWorld();
	    this.BuildWorldChunks();
	};

	MapManager.prototype.BuildWorldChunks = function () {
	    var x = game.chunkManager.PercentLoaded();
	    console.log("World loaded: " + x + "%");
	    if (x < 100 || game.chunkManager.maxChunks == 0) {
	        var that = this;
	        setTimeout(function () {
	            that.BuildWorldChunks();
	        }, 500);
	        return;
	    }
	    game.chunkManager.BuildAllChunks();

	    this.SpawnPrincess();
	    this.SpawnCage();
	    this.SpawnEnemiesBefore();
	    this.SpawnCastle();

	    if (this.useLava) {
	        var lava = new Lava();
	        lava.Create(game.scene);
	        game.objects.push(lava);
	    }
	    if (this.useWater) {
	        var water = new Water();
	        water.Create(game.scene);
	        game.objects.push(water);
	    }
	    this.SpawnPlayer();
	    $('#statusEnemies').fadeIn(600);
	    $('#statusEnemies').text("Enemies left: " + this.GetEnemiesLeft());
	    game.setStatusCenter(this.mapName, "#FF0000");
	    $('#statusCenter').fadeIn(1000);
	    setTimeout(function () {
	        $('#statusCenter').fadeOut(2000);
	    }, 3000);
	    $('#loading').hide();
	};

	MapManager.prototype.Loaded = function (type) {
	    // TBD: Update percent loaded on site.
	    // $('#loaded').text("Loading "+ type + "("+ this.percentLoaded + "%)");
	};

	MapManager.prototype.SpawnEnemiesBefore = function () {
	    // For each in this.enemies
	    for (var i = 0; i < this.enemiesBefore.length; i++) {
	        console.log("Spawning enemy: " + this.enemiesBefore[i][0]);
	        var enemy = new window[this.enemiesBefore[i][0]]();
	        enemy.Create(this.enemiesBefore[i][1], this.enemiesBefore[i][2], this.enemiesBefore[i][3], this.enemiesBefore[i][4]);
	        if (this.enemiesBefore[i][5] != undefined) {
	            enemy.setDamage(this.enemiesBefore[i][5]);
	        }
	    }
	};

	MapManager.prototype.SpawnEnemiesAfter = function () {
	    // For each in this.enemies
	    for (var i = 0; i < this.enemiesAfter.length; i++) {
	        console.log("Spawning enemy: " + this.enemiesAfter[i][0]);
	        var enemy = new window[this.enemiesAfter[i][0]]();
	        enemy.Create(this.enemiesAfter[i][1], this.enemiesAfter[i][2], this.enemiesAfter[i][3], this.enemiesAfter[i][4]);
	        if (this.enemiesAfter[i][5] != undefined) {
	            enemy.setDamage(this.enemiesAfter[i][5]);
	        }
	    }
	};

	MapManager.prototype.SpawnWorld = function () {
	    console.log("Spawning world.");
	    // Load top
	    game.world = new World();
	    // game.world.Load("maps/test5.png", 20, 0.5); // 10924 triangles
	    game.world.Load(this.mapFile, this.wallHeight, this.blockSize); // 10924 triangles
	    // TBD: Fix so that we don't depend on timeout.
	};

	MapManager.prototype.SpawnPrincess = function () {
	    console.log("Spawning princess.");
	    this.princess = new Princess();
	    this.princess.Create(this.princessPosition);
	};

	MapManager.prototype.SpawnCastle = function () {
	    console.log("Spawning castle.");
	    var castle = game.voxLoader.GetModel(this.castleModel);
	    game.scene.add(castle.mesh);
	    castle.mesh.scale.set(5, 5, 5);
	    castle.mesh.that = castle;
	    castle.mesh.position.set(this.castlePosition.x, this.castlePosition.y, this.castlePosition.z);
	};

	MapManager.prototype.SpawnCage = function () {
	    console.log("Spawning cage.");
	    var cage = game.voxLoader.GetModel(this.cageModel);
	    game.scene.add(cage.mesh);
	    cage.mesh.that = cage;
	    cage.Draw = function () {
	        return;
	    };
	    cage.princess = this.princess;
	    cage.isHit = false;
	    cage.Hit = function (pos) {
	        if (game.currentMap.GetEnemiesLeft() != 0) {
	            game.setStatus("Kill all enemies before rescuing the princess.");
	            return;
	        }
	        //pos.z += 4;
	        if (!this.isHit) {
	            this.princess.Saved();
	            this.Explode(new THREE.Vector3(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z));
	            this.isHit = true;
	            game.currentMap.SpawnEnemiesAfter();
	            game.setStatus("Transport Voxilia to the castle.");
	            $('#statusEnemies').hide();
	        }
	    };
	    game.targets.push(cage.mesh);

	    cage.mesh.position.set(this.cagePosition.x, this.cagePosition.y, this.cagePosition.z);
	};

	MapManager.prototype.SpawnPlayer = function () {
	    game.player = new Player();
	    game.player.Create(this.playerModel, this.playerPosition);
	};

	module.exports = MapManager;

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";

	function PhysBlockPool() {
	    this.size = 0;
	    this.blocks = [];
	};

	PhysBlockPool.prototype.Create = function (amount) {
	    this.size = amount;

	    var b;
	    for (var i = 0; i < this.size; i++) {
	        b = new PhysBlock();
	        b.remove = 1;
	        b.Init();
	        this.blocks.push(b);
	    }
	};

	PhysBlockPool.prototype.Get = function () {
	    for (var i = 0; i < this.size; i++) {
	        if (this.blocks[i].remove == 1) {
	            this.blocks[i].remove = 0;
	            return this.blocks[i];
	        }
	    }
	    return undefined;
	};

	PhysBlockPool.prototype.Free = function () {
	    var f = 0;
	    for (var i = 0; i < this.size; i++) {
	        if (this.blocks[i].remove == 1) {
	            f++;
	        }
	    }
	    return f;
	};

	module.exports = PhysBlockPool;

/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";

	function AmmoPool() {
	    this.size = 0;
	    this.ammo = [];
	};

	AmmoPool.prototype.Create = function (amount) {
	    this.size = amount;

	    var b;
	    for (var i = 0; i < this.size; i++) {
	        var geo = new THREE.BoxGeometry(1, 1, 1);
	        var mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
	        b = new THREE.Mesh(geo, mat);
	        b.position.set(-100, -500, -100);
	        game.scene.add(b);
	        b.remove = 1;
	        b.that = this;
	        b.ammoId = i;
	        this.ammo.push(b);
	    }
	};

	AmmoPool.prototype.Get = function () {
	    for (var i = 0; i < this.size; i++) {
	        if (this.ammo[i].remove == 1) {
	            this.ammo[i].remove = 0;
	            return this.ammo[i];
	        }
	    }
	    return undefined;
	};

	AmmoPool.prototype.Free = function () {
	    var f = 0;
	    for (var i = 0; i < this.size; i++) {
	        if (this.ammo[i].remove == 1) {
	            f++;
	        }
	    }
	    return f;
	};

	AmmoPool.prototype.Release = function (mesh) {
	    this.ammo[mesh.ammoId].remove = 1;
	    this.ammo[mesh.ammoId].position.set(-100, -500, -100);
	};

	module.exports = AmmoPool;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Object3D = __webpack_require__(10);

	////////////////////////////////////////////////////////////
	// Cloud
	/////////////////////////////////////////////////////////////
	function Cloud() {
	    Object3D.call(this);
	    this.chunk = undefined;
	    this.scale = 2;
	    this.remove = 0;
	    this.speed = 0;
	    this.snow = true;
	}

	Cloud.prototype.Draw = function (time, delta) {
	    this.mesh.position.z += this.speed;
	    if (this.mesh.position.z > 200) {
	        this.mesh.position.z = -200;
	        this.mesh.position.x = Math.random() * 120;
	        this.mesh.position.y = 10 + Math.random() * 2;
	    }
	    if (this.snow) {
	        if (this.mesh.position.z > 20 && this.mesh.position.z < 170) {
	            var block = game.snowPool.Get();
	            if (block != undefined) {
	                block.Create(this.mesh.position.x + Math.random() * 5, this.mesh.position.y, this.mesh.position.z + Math.random() * 5, 0.2, 255, 255, 255, 20, Math.random() * 180, 1);
	            }
	        }
	    }
	};

	Cloud.prototype.Create = function (type, snow) {
	    this.snow = snow;
	    this.chunk = game.voxLoader.GetModel(type);
	    for (var x = 0; x < this.chunk.chunkSizeX; x++) {
	        for (var y = 0; y < this.chunk.chunkSizeY; y++) {
	            for (var z = 0; z < this.chunk.chunkSizeZ; z++) {
	                this.chunk.blocks[x][y][z].r = 255;
	                this.chunk.blocks[x][y][z].g = 255;
	                this.chunk.blocks[x][y][z].b = 255;
	            }
	        }
	    }
	    this.chunk.Rebuild();
	    this.mesh = this.chunk.mesh;
	    this.mesh.geometry.computeBoundingBox();
	    this.mesh.that = this;
	    game.targets.push(this.mesh);
	    var scale = 1 + Math.random() * 2;
	    this.mesh.scale.set(scale, scale, scale);
	    game.scene.add(this.mesh);
	    this.speed = 0.05 + Math.random() * 0.1;
	    this.mesh.position.z = -200;
	    this.mesh.position.x = Math.random() * 120;
	    this.mesh.position.y = 10 + Math.random() * 2;
	};

	module.exports = Cloud;

/***/ },
/* 10 */
/***/ function(module, exports) {

	"use strict";

	function Object3D() {
	    // THREE.Mesh.apply(this, arguments); inherite from mesh
	    this.mesh;
	    this.time;
	}

	Object3D.prototype.GetObject = function () {
	    return this.mesh;
	};

	Object3D.prototype.Draw = function () {
	    //draw object
	};

	Object3D.prototype.AddToScene = function (scene) {
	    scene.add(this.mesh);
	};
	module.exports = Object3D;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var Object3D = __webpack_require__(10);

	/////////////////////////////////////////////////////////////
	// Tree
	/////////////////////////////////////////////////////////////
	function Tree() {
	    Object3D.call(this);
	    this.chunk = undefined;
	    this.scale = 2;
	    this.remove = 0;
	    this.origy = 0;
	};

	Tree.prototype.Draw = function (time, delta) {
	    var y = game.chunkManager.GetHeight(this.mesh.position.x + this.chunk.blockSize * this.chunk.chunkSizeX / 2, this.mesh.position.z + this.chunk.blockSize * this.chunk.chunkSizeX / 2);

	    // Explode tree if ground breaks.
	    if (y < this.origy) {
	        // this.Hit(0,0);
	    }
	};

	Tree.prototype.Hit = function (data, dmg) {
	    this.chunk.Explode(this.mesh.position, this.scale);
	    this.remove = 1;
	    game.scene.remove(this.mesh);
	    console.log("TREE HIT!");
	};

	Tree.prototype.Create = function (x, y, z, scale, type) {
	    this.chunk = game.voxLoader.GetModel(type);
	    this.mesh = this.chunk.mesh;
	    this.mesh.geometry.computeBoundingBox();
	    this.mesh.position.set(x, y, z);
	    this.mesh.that = this;
	    game.targets.push(this.mesh);
	    this.mesh.scale.set(scale, scale, scale);
	    game.scene.add(this.mesh);
	    this.origy = y;
	};

	module.exports = Tree;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var Object3D = __webpack_require__(10);
	/////////////////////////////////////////////////////////////
	// Lava
	/////////////////////////////////////////////////////////////
	function Lava() {
	    Object3D.call(this);
	}

	Lava.prototype.Create = function (scene) {
	    var width = 400;
	    var depth = 400;
	    var geometry = new THREE.PlaneGeometry(width, depth, 64 - 1, 64 - 1);
	    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
	    geometry.dynamic = true;

	    var i, j, il, jl;
	    for (i = 0, il = geometry.vertices.length; i < il; i++) {
	        geometry.vertices[i].y = 0.4 * Math.sin(i / 2);
	    }

	    geometry.computeFaceNormals();
	    geometry.computeVertexNormals();

	    var texture = THREE.ImageUtils.loadTexture("textures/lava3.png");
	    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	    texture.repeat.set(30, 30);

	    //var material = new THREE.MeshBasicMaterial( { color: 0x00CCFF, map: texture, transparent: false, opacity: 1} );
	    var material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.8 });

	    var mesh = new THREE.Mesh(geometry, material);
	    mesh.position.set(50, game.currentMap.lavaPosition, 50);
	    //mesh.receiveShadow = true;
	    this.mesh = mesh;
	    scene.add(this.mesh);
	};

	Lava.prototype.Draw = function (time, delta, i) {
	    for (var i = 0, l = this.mesh.geometry.vertices.length; i < l; i++) {
	        //   this.mesh.geometry.vertices[ i ].y = 0.1 * Math.sin( i / 5 + ( time + i ) / 7 );   
	        this.mesh.geometry.vertices[i].y = 0.2 * Math.sin(i / 5 + (time + i) / 4);
	    }
	    this.mesh.geometry.verticesNeedUpdate = true;
	};

	module.exports = Lava;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var Object3D = __webpack_require__(10);

	/////////////////////////////////////////////////////////////
	// Water
	/////////////////////////////////////////////////////////////
	function Water() {
	    Object3D.call(this);
	};

	Water.prototype.Create = function (scene) {
	    var width = 400;
	    var depth = 400;
	    var geometry = new THREE.PlaneGeometry(width, depth, 64 - 1, 64 - 1);
	    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
	    geometry.dynamic = true;

	    var i, j, il, jl;
	    for (i = 0, il = geometry.vertices.length; i < il; i++) {
	        geometry.vertices[i].y = 0.4 * Math.sin(i / 2);
	    }

	    geometry.computeFaceNormals();
	    geometry.computeVertexNormals();

	    var texture = THREE.ImageUtils.loadTexture("textures/water2.png");
	    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	    texture.repeat.set(30, 30);

	    var material = new THREE.MeshBasicMaterial({ color: 0x00CCFF, map: texture, transparent: true, opacity: 0.5 });
	    //var material = new THREE.MeshBasicMaterial( { map: texture, transparent: false, opacity: 1} );

	    var mesh = new THREE.Mesh(geometry, material);
	    mesh.position.set(50, game.currentMap.waterPosition, 50);
	    //mesh.receiveShadow = true;
	    this.mesh = mesh;
	    scene.add(this.mesh);
	};

	Water.prototype.Draw = function (time, delta, i) {
	    for (var i = 0, l = this.mesh.geometry.vertices.length; i < l; i++) {
	        // this.mesh.geometry.vertices[ i ].y = 0.1 * Math.sin( i / 5 + ( time + i ) / 7 );   
	        this.mesh.geometry.vertices[i].y = 0.2 * Math.sin(i / 5 + (time + i) / 4);
	    }
	    this.mesh.geometry.verticesNeedUpdate = true;
	};

	module.exports = Water;

/***/ }
/******/ ]);