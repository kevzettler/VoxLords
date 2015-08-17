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
	var SoundLoader = __webpack_require__(12);
	var ChunkManager = __webpack_require__(13);
	var MapManager = __webpack_require__(14);
	var PhysBlockPool = __webpack_require__(24);
	var AmmoPool = __webpack_require__(26);

	//objects
	var Cloud = __webpack_require__(27);
	var Tree = __webpack_require__(28);
	var Lava = __webpack_require__(17);
	var Water = __webpack_require__(15);

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

	'use strict';

	var util = __webpack_require__(3);
	var Loader = __webpack_require__(7);
	var Vox = __webpack_require__(8);

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

	util.inherits(VoxLoader, Loader);
	module.exports = VoxLoader;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};


	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  if (process.noDeprecation === true) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	};


	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};


	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;


	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}


	function stylizeNoColor(str, styleType) {
	  return str;
	}


	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '', array = false, braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}


	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = __webpack_require__(5);

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}


	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}


	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}


	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};


	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(6);

	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};

	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(4)))

/***/ },
/* 4 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            currentQueue[queueIndex].run();
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	// TODO(shtylman)
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object'
	    && typeof arg.copy === 'function'
	    && typeof arg.fill === 'function'
	    && typeof arg.readUInt8 === 'function';
	}

/***/ },
/* 6 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 7 */
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
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var VoxelData = __webpack_require__(9);
	var Chunk = __webpack_require__(10);

	function Vox() {
	    this.chunk = undefined;

	    this.voxColors = [0x00000000, 0xffffffff, 0xffccffff, 0xff99ffff, 0xff66ffff, 0xff33ffff, 0xff00ffff, 0xffffccff, 0xffccccff, 0xff99ccff, 0xff66ccff, 0xff33ccff, 0xff00ccff, 0xffff99ff, 0xffcc99ff, 0xff9999ff, 0xff6699ff, 0xff3399ff, 0xff0099ff, 0xffff66ff, 0xffcc66ff, 0xff9966ff, 0xff6666ff, 0xff3366ff, 0xff0066ff, 0xffff33ff, 0xffcc33ff, 0xff9933ff, 0xff6633ff, 0xff3333ff, 0xff0033ff, 0xffff00ff, 0xffcc00ff, 0xff9900ff, 0xff6600ff, 0xff3300ff, 0xff0000ff, 0xffffffcc, 0xffccffcc, 0xff99ffcc, 0xff66ffcc, 0xff33ffcc, 0xff00ffcc, 0xffffcccc, 0xffcccccc, 0xff99cccc, 0xff66cccc, 0xff33cccc, 0xff00cccc, 0xffff99cc, 0xffcc99cc, 0xff9999cc, 0xff6699cc, 0xff3399cc, 0xff0099cc, 0xffff66cc, 0xffcc66cc, 0xff9966cc, 0xff6666cc, 0xff3366cc, 0xff0066cc, 0xffff33cc, 0xffcc33cc, 0xff9933cc, 0xff6633cc, 0xff3333cc, 0xff0033cc, 0xffff00cc, 0xffcc00cc, 0xff9900cc, 0xff6600cc, 0xff3300cc, 0xff0000cc, 0xffffff99, 0xffccff99, 0xff99ff99, 0xff66ff99, 0xff33ff99, 0xff00ff99, 0xffffcc99, 0xffcccc99, 0xff99cc99, 0xff66cc99, 0xff33cc99, 0xff00cc99, 0xffff9999, 0xffcc9999, 0xff999999, 0xff669999, 0xff339999, 0xff009999, 0xffff6699, 0xffcc6699, 0xff996699, 0xff666699, 0xff336699, 0xff006699, 0xffff3399, 0xffcc3399, 0xff993399, 0xff663399, 0xff333399, 0xff003399, 0xffff0099, 0xffcc0099, 0xff990099, 0xff660099, 0xff330099, 0xff000099, 0xffffff66, 0xffccff66, 0xff99ff66, 0xff66ff66, 0xff33ff66, 0xff00ff66, 0xffffcc66, 0xffcccc66, 0xff99cc66, 0xff66cc66, 0xff33cc66, 0xff00cc66, 0xffff9966, 0xffcc9966, 0xff999966, 0xff669966, 0xff339966, 0xff009966, 0xffff6666, 0xffcc6666, 0xff996666, 0xff666666, 0xff336666, 0xff006666, 0xffff3366, 0xffcc3366, 0xff993366, 0xff663366, 0xff333366, 0xff003366, 0xffff0066, 0xffcc0066, 0xff990066, 0xff660066, 0xff330066, 0xff000066, 0xffffff33, 0xffccff33, 0xff99ff33, 0xff66ff33, 0xff33ff33, 0xff00ff33, 0xffffcc33, 0xffcccc33, 0xff99cc33, 0xff66cc33, 0xff33cc33, 0xff00cc33, 0xffff9933, 0xffcc9933, 0xff999933, 0xff669933, 0xff339933, 0xff009933, 0xffff6633, 0xffcc6633, 0xff996633, 0xff666633, 0xff336633, 0xff006633, 0xffff3333, 0xffcc3333, 0xff993333, 0xff663333, 0xff333333, 0xff003333, 0xffff0033, 0xffcc0033, 0xff990033, 0xff660033, 0xff330033, 0xff000033, 0xffffff00, 0xffccff00, 0xff99ff00, 0xff66ff00, 0xff33ff00, 0xff00ff00, 0xffffcc00, 0xffcccc00, 0xff99cc00, 0xff66cc00, 0xff33cc00, 0xff00cc00, 0xffff9900, 0xffcc9900, 0xff999900, 0xff669900, 0xff339900, 0xff009900, 0xffff6600, 0xffcc6600, 0xff996600, 0xff666600, 0xff336600, 0xff006600, 0xffff3300, 0xffcc3300, 0xff993300, 0xff663300, 0xff333300, 0xff003300, 0xffff0000, 0xffcc0000, 0xff990000, 0xff660000, 0xff330000, 0xff0000ee, 0xff0000dd, 0xff0000bb, 0xff0000aa, 0xff000088, 0xff000077, 0xff000055, 0xff000044, 0xff000022, 0xff000011, 0xff00ee00, 0xff00dd00, 0xff00bb00, 0xff00aa00, 0xff008800, 0xff007700, 0xff005500, 0xff004400, 0xff002200, 0xff001100, 0xffee0000, 0xffdd0000, 0xffbb0000, 0xffaa0000, 0xff880000, 0xff770000, 0xff550000, 0xff440000, 0xff220000, 0xff110000, 0xffeeeeee, 0xffdddddd, 0xffbbbbbb, 0xffaaaaaa, 0xff888888, 0xff777777, 0xff555555, 0xff444444, 0xff222222, 0xff111111];
	};

	Vox.prototype.getChunk = function () {
	    return this.chunk;
	};

	Vox.prototype.getMesh = function () {
	    return this.chunk.mesh;
	};

	Vox.prototype.readInt = function (buffer, from) {
	    return buffer[from] | buffer[from + 1] << 8 | buffer[from + 2] << 16 | buffer[from + 3] << 24;
	};

	Vox.prototype.LoadModel = function (filename, loadptr, name) {
	    this.name = name;
	    var oReq = new XMLHttpRequest();
	    oReq.open("GET", "models/" + filename, true);
	    oReq.responseType = "arraybuffer";

	    var that = this;
	    oReq.onload = function (oEvent) {
	        var colors = [];
	        var colors2 = undefined;
	        var voxelData = [];
	        that.chunk = new Chunk();

	        console.log("Loaded model: " + oReq.responseURL);
	        var arrayBuffer = oReq.response;
	        if (arrayBuffer) {
	            var buffer = new Uint8Array(arrayBuffer);
	            var voxId = that.readInt(buffer, 0);
	            var version = that.readInt(buffer, 4);
	            // TBD: Check version to support
	            var i = 8;
	            while (i < buffer.length) {
	                var subSample = false;
	                var sizex = 0,
	                    sizey = 0,
	                    sizez = 0;
	                var id = String.fromCharCode(parseInt(buffer[i++])) + String.fromCharCode(parseInt(buffer[i++])) + String.fromCharCode(parseInt(buffer[i++])) + String.fromCharCode(parseInt(buffer[i++]));

	                var chunkSize = that.readInt(buffer, i) & 0xFF;
	                i += 4;
	                var childChunks = that.readInt(buffer, i) & 0xFF;
	                i += 4;

	                if (id == "SIZE") {
	                    sizex = that.readInt(buffer, i) & 0xFF;
	                    i += 4;
	                    sizey = that.readInt(buffer, i) & 0xFF;
	                    i += 4;
	                    sizez = that.readInt(buffer, i) & 0xFF;
	                    i += 4;
	                    if (sizex > 32 || sizey > 32) {
	                        subSample = true;
	                    }
	                    console.log(filename + " => Create VOX Chunk!");
	                    that.chunk.Create(sizex, sizey, sizez);
	                    i += chunkSize - 4 * 3;
	                } else if (id == "XYZI") {
	                    var numVoxels = Math.abs(that.readInt(buffer, i));
	                    i += 4;
	                    voxelData = new Array(numVoxels);
	                    for (var n = 0; n < voxelData.length; n++) {
	                        ;
	                        voxelData[n] = new VoxelData();
	                        voxelData[n].Create(buffer, i, subSample); // Read 4 bytes
	                        i += 4;
	                    }
	                } else if (id == "RGBA") {
	                    console.log(filename + " => Regular color chunk");
	                    colors2 = new Array(256);
	                    for (var n = 0; n < 256; n++) {
	                        var r = buffer[i++] & 0xFF;
	                        var g = buffer[i++] & 0xFF;
	                        var b = buffer[i++] & 0xFF;
	                        var a = buffer[i++] & 0xFF;
	                        colors2[n] = { 'r': r, 'g': g, 'b': b, 'a': a };
	                    }
	                } else {
	                    i += chunkSize;
	                }
	            }
	            if (voxelData == null || voxelData.length == 0) {
	                return null;
	            }

	            for (var n = 0; n < voxelData.length; n++) {
	                if (colors2 == undefined) {
	                    var c = that.voxColors[Math.abs(voxelData[n].color - 1)];
	                    var cRGBA = {
	                        b: (c & 0xff0000) >> 16,
	                        g: (c & 0x00ff00) >> 8,
	                        r: c & 0x0000ff,
	                        a: 1
	                    };
	                    that.chunk.ActivateBlock(voxelData[n].x, voxelData[n].y, voxelData[n].z, cRGBA);
	                } else {
	                    that.chunk.ActivateBlock(voxelData[n].x, voxelData[n].y, voxelData[n].z, colors2[Math.abs(voxelData[n].color - 1)]);
	                }
	            }
	            loadptr(that, name);
	        }
	    };

	    oReq.send(null);
	};

	module.exports = Vox;

/***/ },
/* 9 */
/***/ function(module, exports) {

	//==============================================================================
	// Author: Nergal
	// http://webgl.nu
	// Date: 2014-11-17
	//==============================================================================
	"use strict";

	function VoxelData() {
	    this.x;
	    this.y;
	    this.z;
	    this.color;

	    VoxelData.prototype.Create = function (buffer, i, subSample) {
	        this.x = subSample ? buffer[i] & 0xFF / 2 : buffer[i++] & 0xFF;
	        this.y = subSample ? buffer[i] & 0xFF / 2 : buffer[i++] & 0xFF;
	        this.z = subSample ? buffer[i] & 0xFF / 2 : buffer[i++] & 0xFF;
	        this.color = buffer[i] & 0xFF;
	    };
	}
	module.exports = VoxelData;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Block = __webpack_require__(11);

	function Chunk() {
	    this.wireframe = false;
	    this.blockSize = 0.1;
	    this.chunkSize = 4;
	    this.chunkSizeX = 0;
	    this.chunkSizeY = 0;
	    this.chunkSizeZ = 0;
	    this.posX = 0;
	    this.posY = 0;
	    this.posZ = 0;
	    this.type = "GenericChunk";
	    this.activeTriangles = 0;
	    this.mesh = undefined;
	    this.blocks = undefined;
	    this.cid = undefined;

	    this.isBuilt = false;
	    this.avgHeight = 0;
	};

	Chunk.prototype.Clone = function () {
	    var obj = new Chunk();

	    obj.wireframe = this.wireframe;
	    obj.blockSize = this.blockSize;
	    obj.chunkSize = this.chunkSize;
	    obj.chunkSizeX = this.chunkSizeX;
	    obj.chunkSizeY = this.chunkSizeY;
	    obj.chunkSizeZ = this.chunkSizeZ;
	    obj.posX = this.posX;
	    obj.posY = this.posY;
	    obj.posZ = this.posZ;
	    obj.type = this.type;
	    obj.activeTriangles = this.activeTriangles;
	    obj.mesh = this.mesh.clone();
	    obj.cid = this.cid;
	    obj.avgHeight = this.avgHeight;
	    obj.blocks = this.blocks;

	    return obj;
	};

	Chunk.prototype.SetWireFrame = function (val) {
	    this.wireframe = val;
	    this.Rebuild();
	};

	Chunk.prototype.GetActiveTriangles = function () {
	    return this.activeTriangles;
	};

	Chunk.prototype.GetAvgHeight = function () {
	    return this.avgHeight;
	};

	Chunk.prototype.GetBoundingBox = function () {
	    var minx = this.posX;
	    var maxx = this.posX + this.chunkSizeX * this.blockSize / 2;
	    var miny = this.posY;
	    var maxy = this.posY + this.chunkSizeY * this.blockSize / 2;

	    // y is actually Z when rotated.
	    this.box = { 'minx': minx, 'maxx': maxx,
	        'minz': miny, 'maxz': maxy };
	};

	Chunk.prototype.Explode = function (pos, scale) {
	    if (scale == undefined) {
	        scale = 1;
	    }
	    this.explodeDelta = 0;
	    // For each block create array with color etc and create a particleEngine
	    // with that array.
	    var block = undefined;
	    for (var x = 0; x < this.chunkSizeX; x++) {
	        for (var y = 0; y < this.chunkSizeY; y++) {
	            for (var z = 0; z < this.chunkSizeZ; z++) {
	                if (this.blocks[x][y][z].isActive()) {
	                    if (Math.random() > 0.85) {
	                        block = game.physBlockPool.Get();

	                        if (block != undefined) {
	                            //  console.log((this.posX+x) + ", "+ (this.posZ+z));
	                            block.Create2(pos.x + this.blockSize * x / 2, pos.y + this.blockSize * y / 2, pos.z + this.blockSize * z / 2, (this.blockSize - Math.random() * this.blockSize / 2) * scale,
	                            //this.blockSize,
	                            this.blocks[x][y][z].r, this.blocks[x][y][z].g, this.blocks[x][y][z].b, 2, Math.random() * 180, 3);
	                        }
	                    }
	                }
	            }
	        }
	    }
	    game.scene.remove(this.mesh);
	};

	Chunk.prototype.Rebuild = function () {
	    // Create mesh for each block and merge them to one geometry
	    // Set each color from block + alpha
	    if (this.NoOfActiveBlocks() <= 0) {
	        console.log("No active blocks.");
	        return;
	    }

	    var b = 0;
	    var vertices = [];
	    var colors = [];

	    // Reset merged blocks
	    for (var x = 0; x < this.chunkSizeX; x++) {
	        for (var y = 0; y < this.chunkSizeY; y++) {
	            for (var z = 0; z < this.chunkSizeZ; z++) {
	                this.blocks[x][y][z].drawnLeftSide = false;
	                this.blocks[x][y][z].drawnTopSide = false;
	                this.blocks[x][y][z].drawnFrontSide = false;
	                this.blocks[x][y][z].drawnRightSide = false;
	                this.blocks[x][y][z].drawnBottomSide = false;
	            }
	        }
	    }

	    var drawBlock = false;
	    for (var x = 0; x < this.chunkSizeX; x++) {
	        for (var y = 0; y < this.chunkSizeY; y++) {
	            for (var z = 0; z < this.chunkSizeZ; z++) {
	                if (this.blocks[x][y][z].isActive() == true) {
	                    var sides = 0;

	                    drawBlock = false;

	                    if (y > 0 && y < this.chunkSizeY - 1 && x > 0 && x < this.chunkSizeX - 1 && z > 0 && z < this.chunkSizeZ - 1) {
	                        if (this.blocks[x - 1][y][z].isActive() && this.blocks[x + 1][y][z].isActive() && this.blocks[x][y][z + 1].isActive() && this.blocks[x][y][z - 1].isActive() && this.blocks[x][y + 1][z].isActive() && this.blocks[x][y - 1][z].isActive()) {
	                            continue;
	                        }
	                    }

	                    // Left side (+X)
	                    if (x > 0) {
	                        if (!this.blocks[x - 1][y][z].isActive()) {
	                            drawBlock = true;
	                        }
	                    } else {
	                        drawBlock = true;
	                    }

	                    if (drawBlock) {
	                        var countX = 0;
	                        var countY = 0;
	                        if (!this.blocks[x][y][z].drawnLeftSide) {
	                            for (var cx = 0; cx < this.chunkSizeY; cx++) {
	                                if (y + cx < this.chunkSizeY) {
	                                    if (this.blocks[x][y + cx][z].isActive() && !this.blocks[x][y + cx][z].drawnLeftSide && this.blocks[x][y + cx][z].r == this.blocks[x][y][z].r && this.blocks[x][y + cx][z].g == this.blocks[x][y][z].g && this.blocks[x][y + cx][z].b == this.blocks[x][y][z].b) {
	                                        countX++;
	                                        var tmpCountY = 0;
	                                        for (var cy = 0; cy < this.chunkSizeZ; cy++) {
	                                            if (z + cy < this.chunkSizeZ) {
	                                                if (this.blocks[x][y + cx][z + cy].isActive() && !this.blocks[x][y + cx][z + cy].drawnLeftSide && this.blocks[x][y + cx][z + cy].r == this.blocks[x][y][z].r && this.blocks[x][y + cx][z + cy].g == this.blocks[x][y][z].g && this.blocks[x][y + cx][z + cy].b == this.blocks[x][y][z].b) {
	                                                    tmpCountY++;
	                                                } else {
	                                                    break;
	                                                }
	                                            }
	                                        }
	                                        if (tmpCountY < countY || countY == 0) {
	                                            countY = tmpCountY;
	                                        }
	                                        if (tmpCountY == 0 && countY > countX) {
	                                            break;
	                                        }
	                                    } else {
	                                        break;
	                                    }
	                                }
	                            }
	                            countY--;
	                            countX--;
	                            for (var x1 = 0; x1 < countX; x1++) {
	                                for (var y1 = 0; y1 < countY; y1++) {
	                                    if (this.blocks[x][y + x1][z + y1].drawnLeftSide) {
	                                        //countY = y1-1;
	                                    } else {
	                                            this.blocks[x][y + x1][z + y1].drawnLeftSide = true;
	                                        }
	                                }
	                            }
	                            this.blocks[x][y][z].drawnLeftSide = true;
	                            sides++;
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize + this.blockSize * countY]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize + this.blockSize * countX, z * this.blockSize + this.blockSize * countY]);

	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize + this.blockSize * countX, z * this.blockSize + this.blockSize * countY]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize + this.blockSize * countX, z * this.blockSize - this.blockSize]);

	                            for (var i = 0; i < 6; i++) {
	                                colors.push([this.blocks[x][y][z].r, this.blocks[x][y][z].g, this.blocks[x][y][z].b, this.blocks[x][y][z].a]);
	                            }
	                        }
	                    }

	                    // right side (-X)
	                    drawBlock = false;
	                    if (x < this.chunkSizeX - 1) {
	                        if (!this.blocks[x + 1][y][z].isActive()) {
	                            drawBlock = true;
	                        }
	                    } else {
	                        drawBlock = true;
	                    }

	                    if (drawBlock) {
	                        var countX = 0;
	                        var countY = 0;
	                        if (!this.blocks[x][y][z].drawnRightSide) {
	                            for (var cx = 0; cx < this.chunkSizeY; cx++) {
	                                if (y + cx < this.chunkSizeY) {
	                                    if (this.blocks[x][y + cx][z].isActive() && !this.blocks[x][y + cx][z].drawnRightSide && this.blocks[x][y + cx][z].r == this.blocks[x][y][z].r && this.blocks[x][y + cx][z].g == this.blocks[x][y][z].g && this.blocks[x][y + cx][z].b == this.blocks[x][y][z].b) {
	                                        // Check how far we can draw other way
	                                        countX++;
	                                        var tmpCountY = 0;
	                                        for (var cy = 0; cy < this.chunkSizeZ; cy++) {
	                                            if (z + cy < this.chunkSizeZ) {
	                                                if (this.blocks[x][y + cx][z + cy].isActive() && !this.blocks[x][y + cx][z + cy].drawnRightSide && this.blocks[x][y + cx][z + cy].r == this.blocks[x][y][z].r && this.blocks[x][y + cx][z + cy].g == this.blocks[x][y][z].g && this.blocks[x][y + cx][z + cy].b == this.blocks[x][y][z].b) {
	                                                    tmpCountY++;
	                                                } else {
	                                                    break;
	                                                }
	                                            }
	                                        }
	                                        if (tmpCountY < countY || countY == 0) {
	                                            countY = tmpCountY;
	                                        }
	                                        if (tmpCountY == 0 && countY > countX) {
	                                            break;
	                                        }
	                                    } else {
	                                        break;
	                                    }
	                                }
	                            }
	                            countX--;
	                            countY--;
	                            for (var x1 = 0; x1 < countX; x1++) {
	                                for (var y1 = 0; y1 < countY; y1++) {
	                                    if (this.blocks[x][y + x1][z + y1].drawnRightSide) {
	                                        //   countY = y1-1;
	                                    } else {
	                                            this.blocks[x][y + x1][z + y1].drawnRightSide = true;
	                                        }
	                                }
	                            }

	                            this.blocks[x][y][z].drawnRightSide = true;
	                            sides++;
	                            vertices.push([x * this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);
	                            vertices.push([x * this.blockSize, y * this.blockSize + this.blockSize * countX, z * this.blockSize + this.blockSize * countY]);
	                            vertices.push([x * this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize + this.blockSize * countY]);

	                            vertices.push([x * this.blockSize, y * this.blockSize + this.blockSize * countX, z * this.blockSize + this.blockSize * countY]);
	                            vertices.push([x * this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);
	                            vertices.push([x * this.blockSize, y * this.blockSize + this.blockSize * countX, z * this.blockSize - this.blockSize]);

	                            for (var i = 0; i < 6; i++) {
	                                colors.push([this.blocks[x][y][z].r, this.blocks[x][y][z].g, this.blocks[x][y][z].b, this.blocks[x][y][z].a]);
	                            }
	                        }
	                    }

	                    // Back side (-Z)  
	                    drawBlock = false;
	                    if (z > 0) {
	                        //this.chunkSize - 1) {
	                        if (!this.blocks[x][y][z - 1].isActive()) {
	                            drawBlock = true;
	                        }
	                    } else {
	                        drawBlock = true;
	                    }
	                    if (drawBlock) {
	                        sides++;
	                        vertices.push([x * this.blockSize, y * this.blockSize, z * this.blockSize - this.blockSize]);
	                        vertices.push([x * this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);
	                        vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);

	                        vertices.push([x * this.blockSize, y * this.blockSize, z * this.blockSize - this.blockSize]);
	                        vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);
	                        vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize, z * this.blockSize - this.blockSize]);
	                        for (var i = 0; i < 6; i++) {
	                            colors.push([this.blocks[x][y][z].r, this.blocks[x][y][z].g, this.blocks[x][y][z].b, 255]);
	                        }
	                    }

	                    // Front side (+Z)
	                    drawBlock = false;
	                    if (z < this.chunkSizeZ - 1) {
	                        if (!this.blocks[x][y][z + 1].isActive()) {
	                            drawBlock = true;
	                        }
	                    } else {
	                        drawBlock = true;
	                    }

	                    if (drawBlock) {
	                        var countX = 0;
	                        var countY = 0;
	                        if (!this.blocks[x][y][z].drawnFrontSide) {
	                            for (var cx = 0; cx < this.chunkSizeX; cx++) {
	                                if (x + cx < this.chunkSizeX) {
	                                    if (this.blocks[x + cx][y][z].isActive() && !this.blocks[x + cx][y][z].drawnFrontSide && this.blocks[x + cx][y][z].r == this.blocks[x][y][z].r && this.blocks[x + cx][y][z].g == this.blocks[x][y][z].g && this.blocks[x + cx][y][z].b == this.blocks[x][y][z].b) {
	                                        //this.blocks[x+cx][y][z].drawnFrontSide = true;
	                                        // Check how far we can draw other way
	                                        countX++;
	                                        var tmpCountY = 0;
	                                        for (var cy = 0; cy < this.chunkSizeY; cy++) {
	                                            if (y + cy < this.chunkSizeY) {
	                                                if (this.blocks[x + cx][y + cy][z].isActive() && !this.blocks[x + cx][y + cy][z].drawnFrontSide && this.blocks[x + cx][y + cy][z].r == this.blocks[x][y][z].r && this.blocks[x + cx][y + cy][z].g == this.blocks[x][y][z].g && this.blocks[x + cx][y + cy][z].b == this.blocks[x][y][z].b) {
	                                                    tmpCountY++;
	                                                } else {
	                                                    break;
	                                                }
	                                            }
	                                        }
	                                        if (tmpCountY < countY || countY == 0) {
	                                            countY = tmpCountY;
	                                        }
	                                        if (tmpCountY == 0 && countY > countX) {
	                                            break;
	                                        }
	                                    } else {
	                                        break;
	                                    }
	                                }
	                            }
	                            countX--;
	                            countY--;
	                            for (var x1 = 0; x1 < countX; x1++) {
	                                for (var y1 = 0; y1 < countY; y1++) {
	                                    if (this.blocks[x + x1][y + y1][z].drawnFrontSide) {
	                                        //countY = y1-1;
	                                    } else {
	                                            this.blocks[x + x1][y + y1][z].drawnFrontSide = true;
	                                        }
	                                }
	                            }
	                            this.blocks[x][y][z].drawnFrontSide = true;
	                            sides++;
	                            vertices.push([x * this.blockSize + this.blockSize * countX, y * this.blockSize + this.blockSize * countY, z * this.blockSize]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize + this.blockSize * countY, z * this.blockSize]);
	                            vertices.push([x * this.blockSize + this.blockSize * countX, y * this.blockSize - this.blockSize, z * this.blockSize]);

	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize + this.blockSize * countY, z * this.blockSize]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize]);
	                            vertices.push([x * this.blockSize + this.blockSize * countX, y * this.blockSize - this.blockSize, z * this.blockSize]);

	                            for (var i = 0; i < 6; i++) {
	                                colors.push([this.blocks[x][y][z].r * shade, this.blocks[x][y][z].g * shade, this.blocks[x][y][z].b * shade, 255]);
	                            }
	                        }
	                    }

	                    // top (+Y)
	                    drawBlock = false;
	                    if (y < this.chunkSizeY - 1) {
	                        if (!this.blocks[x][y + 1][z].isActive()) {
	                            drawBlock = true;
	                        }
	                    } else {
	                        drawBlock = true;
	                    }

	                    if (drawBlock) {
	                        var shade = 0.87;
	                        var countX = 0;
	                        var countY = 0;
	                        if (!this.blocks[x][y][z].drawnTopSide) {
	                            for (var cx = 0; cx < this.chunkSizeX; cx++) {
	                                if (x + cx < this.chunkSizeX) {
	                                    if (this.blocks[x + cx][y][z].isActive() && !this.blocks[x + cx][y][z].drawnTopSide && this.blocks[x + cx][y][z].r == this.blocks[x][y][z].r && this.blocks[x + cx][y][z].g == this.blocks[x][y][z].g && this.blocks[x + cx][y][z].b == this.blocks[x][y][z].b) {
	                                        countX++;
	                                        var tmpCountY = 0;
	                                        for (var cy = 0; cy < this.chunkSizeZ; cy++) {
	                                            if (z + cy < this.chunkSizeZ) {
	                                                if (this.blocks[x + cx][y][z + cy].isActive() && !this.blocks[x + cx][y][z + cy].drawnTopSide && this.blocks[x + cx][y][z + cy].r == this.blocks[x][y][z].r && this.blocks[x + cx][y][z + cy].g == this.blocks[x][y][z].g && this.blocks[x + cx][y][z + cy].b == this.blocks[x][y][z].b) {
	                                                    tmpCountY++;
	                                                } else {
	                                                    break;
	                                                }
	                                            }
	                                        }
	                                        if (tmpCountY < countY || countY == 0) {
	                                            countY = tmpCountY;
	                                        }
	                                        if (tmpCountY == 0 && countY > countX) {
	                                            break;
	                                        }
	                                    } else {
	                                        break;
	                                    }
	                                }
	                            }
	                            countX--;
	                            countY--;
	                            for (var x1 = 0; x1 < countX; x1++) {
	                                for (var y1 = 0; y1 < countY; y1++) {
	                                    if (this.blocks[x + x1][y][z + y1].drawnTopSide) {
	                                        //  countY = y1-1;
	                                    } else {
	                                            this.blocks[x + x1][y][z + y1].drawnTopSide = true;
	                                        }
	                                }
	                            }

	                            this.blocks[x][y][z].drawnTopSide = true;
	                            sides++;
	                            vertices.push([x * this.blockSize + this.blockSize * countX, y * this.blockSize, z * this.blockSize + this.blockSize * countY]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize, z * this.blockSize - this.blockSize]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize, z * this.blockSize + this.blockSize * countY]);

	                            vertices.push([x * this.blockSize + this.blockSize * countX, y * this.blockSize, z * this.blockSize + this.blockSize * countY]);
	                            vertices.push([x * this.blockSize + this.blockSize * countX, y * this.blockSize, z * this.blockSize - this.blockSize]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize, z * this.blockSize - this.blockSize]);

	                            for (var i = 0; i < 6; i++) {
	                                colors.push([this.blocks[x][y][z].r * shade, this.blocks[x][y][z].g * shade, this.blocks[x][y][z].b * shade, 255]);
	                            }
	                        }
	                    }

	                    // Bottom (-Y)
	                    drawBlock = false;
	                    if (y > 0) {
	                        if (!this.blocks[x][y - 1][z].isActive()) {
	                            drawBlock = true;
	                        }
	                    } else {
	                        drawBlock = true;
	                    }

	                    if (drawBlock) {
	                        var countX = 0;
	                        var countY = 0;
	                        if (!this.blocks[x][y][z].drawnBottomSide) {
	                            for (var cx = 0; cx < this.chunkSizeX; cx++) {
	                                if (x + cx < this.chunkSizeX) {
	                                    if (this.blocks[x + cx][y][z].isActive() && !this.blocks[x + cx][y][z].drawnBottomSide && this.blocks[x + cx][y][z].r == this.blocks[x][y][z].r && this.blocks[x + cx][y][z].g == this.blocks[x][y][z].g && this.blocks[x + cx][y][z].b == this.blocks[x][y][z].b) {
	                                        countX++;
	                                        var tmpCountY = 0;
	                                        for (var cy = 0; cy < this.chunkSizeZ; cy++) {
	                                            if (z + cy < this.chunkSizeZ) {
	                                                if (this.blocks[x + cx][y][z + cy].isActive() && !this.blocks[x + cx][y][z + cy].drawnBottomSide && this.blocks[x + cx][y][z + cy].r == this.blocks[x][y][z].r && this.blocks[x + cx][y][z + cy].g == this.blocks[x][y][z].g && this.blocks[x + cx][y][z + cy].b == this.blocks[x][y][z].b) {
	                                                    tmpCountY++;
	                                                } else {
	                                                    break;
	                                                }
	                                            }
	                                        }
	                                        if (tmpCountY < countY || countY == 0) {
	                                            countY = tmpCountY;
	                                        }
	                                        if (tmpCountY == 0 && countY > countX) {
	                                            break;
	                                        }
	                                    } else {
	                                        break;
	                                    }
	                                }
	                            }
	                            countX--;
	                            countY--;
	                            for (var x1 = 0; x1 < countX; x1++) {
	                                for (var y1 = 0; y1 < countY; y1++) {
	                                    if (this.blocks[x + x1][y][z + y1].drawnBottomSide) {
	                                        //  countY = y1-1;
	                                    } else {
	                                            this.blocks[x + x1][y][z + y1].drawnBottomSide = true;
	                                        }
	                                }
	                            }

	                            this.blocks[x][y][z].drawnBottomSide = true;
	                            sides++;

	                            vertices.push([x * this.blockSize + this.blockSize * countX, y * this.blockSize - this.blockSize, z * this.blockSize + this.blockSize * countY]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize + this.blockSize * countY]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);

	                            vertices.push([x * this.blockSize + this.blockSize * countX, y * this.blockSize - this.blockSize, z * this.blockSize + this.blockSize * countY]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);
	                            vertices.push([x * this.blockSize + this.blockSize * countX, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);

	                            for (var i = 0; i < 6; i++) {
	                                colors.push([this.blocks[x][y][z].r, this.blocks[x][y][z].g, this.blocks[x][y][z].b, 255]);
	                            }
	                        }
	                    }

	                    b += 2 * sides;
	                }
	            }
	        }
	    }
	    // Create Object
	    //
	    var geometry = new THREE.BufferGeometry();
	    var v = new THREE.BufferAttribute(new Float32Array(vertices.length * 3), 3);
	    for (var i = 0; i < vertices.length; i++) {
	        v.setXYZ(i, vertices[i][0], vertices[i][1], vertices[i][2]);
	        // console.log(i + ", "+ vertices[i][0] + ", "+ vertices[i][1]+ ", "+ vertices[i][2]);
	    }
	    geometry.addAttribute('position', v);

	    var c = new THREE.BufferAttribute(new Float32Array(colors.length * 4), 4);
	    for (var i = 0; i < colors.length; i++) {
	        c.setXYZW(i, colors[i][0] / 255, colors[i][1] / 255, colors[i][2] / 255, colors[i][3] / 255);
	        // c.setXYZW( i, Math.random(), Math.random(), Math.random(), Math.random() );
	    }
	    geometry.addAttribute('color', c);

	    geometry.computeBoundingBox();

	    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-geometry.boundingBox.max.x / 2, -geometry.boundingBox.max.z / 2, 0));
	    geometry.computeVertexNormals();

	    var material3 = new THREE.MeshLambertMaterial({ vertexColors: THREE.VertexColors, wireframe: this.wireframe });

	    // geometry.center();
	    var mesh = new THREE.Mesh(geometry, material3);
	    mesh.rotation.set(Math.PI / 2, Math.PI, 0);

	    mesh.castShadow = true;
	    mesh.receiveShadow = true;

	    mesh.position.set(0, 0, 0);
	    // game.scene.add( mesh );
	    mesh.that = this;
	    //game.targets.push(mesh); // TBD: Should this be here?
	    this.mesh = mesh;
	    this.GetBoundingBox();
	    this.isBuilt = true;
	    Log("VOX Model CREATED TRIANGLES: " + b);
	};

	Chunk.prototype.Destroy = function () {
	    var x = (this.mesh.pos.getX() - this.posX) / this.blockSize;
	    var y = (this.mesh.pos.getY() - this.posY) / this.blockSize;

	    if (x >= 0 && x < this.blocks.length && y >= 0 && y < this.blocks.length) {
	        if (this.blocks[x][y][z].isActive()) {
	            this.blocks[x][y][z].setActive(false);
	            this.Rebuild();
	            console.log("Destroy block: " + x + ", " + y + ", " + z);
	            return true;
	        }
	    }
	    return false;
	};

	Chunk.prototype.ActivateBlock = function (x, y, z, color) {
	    if (color.a == 0) {
	        this.blocks[x][y][z].setActive(false);
	    } else {
	        this.blocks[x][y][z].setActive(true);
	    }
	    this.blocks[x][y][z].r = color.r;
	    this.blocks[x][y][z].g = color.g;
	    this.blocks[x][y][z].b = color.b;
	    this.blocks[x][y][z].a = color.a;
	};

	Chunk.prototype.Create = function (sizex, sizey, sizez) {
	    this.chunkSizeX = sizex;
	    this.chunkSizeY = sizey;
	    this.chunkSizeZ = sizez;
	    console.log("Create: " + sizex + ", " + sizey + ", " + sizez);
	    this.blocks = new Array();

	    for (var x = 0; x < sizex; x++) {
	        this.blocks[x] = new Array();
	        for (var y = 0; y < sizey; y++) {
	            this.blocks[x][y] = new Array();
	            for (var z = 0; z < sizez; z++) {
	                this.blocks[x][y][z] = new Block();
	                this.blocks[x][y][z].Create(false, 0, 0, 0, 0);
	                //this.blocks[x][y][z].Create(true, 0, 0, 0, 0);
	            }
	        }
	    }
	};

	Chunk.prototype.ActivateAll = function () {};

	Chunk.prototype.NoOfActiveBlocks = function () {
	    var b = 0;
	    if (this.blocks != undefined) {
	        for (var x = 0; x < this.chunkSizeX; x++) {
	            for (var y = 0; y < this.chunkSizeY; y++) {
	                for (var z = 0; z < this.chunkSizeZ; z++) {
	                    if (this.blocks[x][y][z].isActive()) {
	                        b++;
	                    }
	                }
	            }
	        }
	    } else {
	        console.log("UNDEFINED BLOCKS");
	    }
	    return b;
	};

	module.exports = Chunk;

/***/ },
/* 11 */
/***/ function(module, exports) {

	"use strict";

	function Block() {
	    this.active = false;
	    this.drawnLeftSide = false; // Mark if it's drawn by different block
	    this.drawnTopSide = false;
	    this.drawnFrontSide = false;
	    this.drawnRightSide = false;
	    this.drawnBottomSide = false;
	    this.alpha = 0;
	    this.r = 0;
	    this.g = 0;
	    this.b = 0;
	};

	Block.prototype.Create = function (isActive, r, g, b, alpha) {
	    this.active = isActive;
	    this.alpha = alpha;
	    this.r = r;
	    this.g = g;
	    this.b = b;
	};

	Block.prototype.setActive = function (value) {
	    this.active = value;
	};

	Block.prototype.isActive = function () {
	    return this.active;
	};

	module.exports = Block;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Loader = __webpack_require__(7);

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
/* 13 */
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
	    if (this.totalChunks == 0) {
	        return 0;
	    }
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
	    debugger;
	    //KJZ worldchunks is empty for some reason??
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
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Water = __webpack_require__(15);
	var Lava = __webpack_require__(17);
	var World = __webpack_require__(18);
	var Player = __webpack_require__(20);

	var Enemies = {
	    Hula1: __webpack_require__(21),
	    Hula2: __webpack_require__(23)
	};

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
	    console.log("World loaded: " + x + "% ", game.chunkManager.maxChunks);
	    if (x < 100 || game.chunkManager.maxChunks == 0) {
	        var that = this;
	        debugger;
	        setTimeout(function () {
	            that.BuildWorldChunks();
	            debugger;
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

	    debugger;
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

	// MapManager.prototype.Loaded = function(type) {
	//     // TBD: Update percent loaded on site.
	//     // $('#loaded').text("Loading "+ type + "("+ this.percentLoaded + "%)");
	// };

	MapManager.prototype.SpawnEnemiesBefore = function () {
	    // For each in this.enemies
	    for (var i = 0; i < this.enemiesBefore.length; i++) {
	        console.log("Spawning enemy: " + this.enemiesBefore[i][0]);
	        var enemy = new Enemies[this.enemiesBefore[i][0]]();
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
	        var enemy = new Enemies[this.enemiesAfter[i][0]]();
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
	    debugger;
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
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var Object3D = __webpack_require__(16);

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

/***/ },
/* 16 */
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
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var Object3D = __webpack_require__(16);
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
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var ChunkWorld = __webpack_require__(19);

	function World() {
	    this.width = 0;
	    this.height = 0;
	    this.name = "Unknown";
	    this.map = undefined;
	    this.chunkSize = 16;
	    this.chunks = 0;
	    this.blocks = 0;
	    this.hemiLight = undefined;
	    this.dirLight = undefined;
	    this.wallHeight = 15;
	    this.blockSize = 0.1;
	    this.mapWidth = 0;
	    this.mapHeight = 0;
	};

	World.prototype.Load = function (filename, wallHeight, blockSize) {
	    debugger;
	    this.wallHeight = wallHeight;
	    this.blockSize = blockSize;
	    this.readWorld(filename);
	    this.readMap();
	};

	World.prototype.readMap = function () {
	    debugger;
	    if (this.map == undefined) {
	        var that = this;
	        setTimeout(function () {
	            that.readMap();
	        }, 500);
	        console.log("loading map...");
	        return;
	    }

	    debugger; //KJZ DO WE EVER GET HERE?

	    game.worldMap = new Array(this.map.length);
	    for (var i = 0; i < game.worldMap.length; i++) {
	        game.worldMap[i] = new Array();
	    }
	    this.mapHeight = this.blockSize * this.map.length;
	    this.mapWidth = this.blockSize * this.map.length;

	    debugger;
	    for (var cy = 0; cy < this.map.length; cy += this.chunkSize) {
	        var alpha = 0;
	        var total = 0;
	        var chunk = new Array();
	        for (var cx = 0; cx < this.map.length; cx += this.chunkSize) {
	            var ix = 0;
	            for (var x = cx; x < cx + this.chunkSize; x++) {
	                chunk[ix] = new Array();
	                var iy = 0;
	                for (var y = cy; y < cy + this.chunkSize; y++) {
	                    if (this.map[x][y] == 0) {
	                        alpha++;
	                    } else {
	                        this.blocks++;
	                    }
	                    chunk[ix][iy++] = this.map[x][y];
	                    total++;
	                }
	                ix++;
	            }
	            var cSize = this.blockSize;

	            //KJZ DON"T THINK THIS IS GETTING EXECUTED?
	            if (total != alpha) {
	                var c = new ChunkWorld();
	                c.Create(this.chunkSize, cSize, cx * cSize - this.blockSize / 2, cy * cSize - this.blockSize / 2, chunk, this.wallHeight, this.chunks);
	                game.chunkManager.AddWorldChunk(c);

	                // Save to world map
	                var z = this.chunks % (this.map.length / this.chunkSize);
	                var x = Math.floor(this.chunks / (this.map.length / this.chunkSize));
	                game.worldMap[x][z] = { 'id': this.chunks, 'avgHeight': c.GetAvgHeight() };
	                this.chunks++;
	            } else {
	                console.log("=> Skipping invisible chunk.");
	            }
	        }
	    }
	};

	World.prototype.readWorld = function (filename) {
	    debugger;
	    // Read png file binary and get color for each pixel
	    // one pixel = one block
	    // Read RGBA (alpha is height)
	    // 255 = max height
	    // a < 50 = floor
	    var image = new Image();
	    image.src = "/" + filename;

	    var ctx = document.createElement('canvas').getContext('2d');
	    var that = this;
	    image.onload = function () {
	        debugger;
	        ctx.canvas.width = image.width;
	        ctx.canvas.height = image.height;
	        ctx.drawImage(image, 0, 0);
	        that.width = image.width;
	        that.height = image.height;
	        that.map = new Array();
	        var imgData = ctx.getImageData(0, 0, that.width, that.height);

	        game.worldMap = new Array();
	        for (var y = 0; y < that.height; y++) {
	            var pos = y * that.width * 4;
	            that.map[y] = new Array();
	            game.worldMap[y] = new Array();
	            for (var x = 0; x < that.width; x++) {
	                var r = imgData.data[pos++];
	                var g = imgData.data[pos++];
	                var b = imgData.data[pos++];
	                var a = imgData.data[pos++];
	                that.map[y][x] = { 'r': r, 'g': g, 'b': b, 'a': a };
	            }
	        }

	        console.log("Read world complete.");
	        game.chunkManager.maxChunks = that.height / that.chunkSize * (that.height / that.chunkSize);
	        debugger;
	    };
	};
	module.exports = World;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var util = __webpack_require__(3);
	var Chunk = __webpack_require__(10);
	var Block = __webpack_require__(11);

	// Chunks of other types such as crates/weapons/mob/player
	function ChunkWorld() {
	    Chunk.call(this);
	    this.wallHeight = 1;
	};

	//Pretty sure this is getting h ammered by chunks Create method wtf
	ChunkWorld.prototype.Create = function (chunkSize, blockSize, posX, posY, map, wallHeight, id) {
	    debugger;
	    this.cid = id;
	    this.chunkSize = chunkSize;
	    this.chunkSizeX = chunkSize;
	    this.chunkSizeY = chunkSize;
	    this.chunkSizeZ = chunkSize;
	    this.blockSize = blockSize;
	    this.posX = posX;
	    this.posY = posY;

	    this.blocks = new Array();
	    var tmpBlocks = new Array();
	    var visible = false;
	    var maxHeight = 0;
	    for (var x = 0; x < this.chunkSize; x++) {
	        this.blocks[x] = new Array();
	        tmpBlocks[x] = new Array();
	        for (var y = 0; y < this.chunkSize; y++) {
	            this.blocks[x][y] = new Array();
	            tmpBlocks[x][y] = new Array();
	            this.wallHeight = map[x][y].a / wallHeight;
	            //     this.avgHeight += this.wallHeight;
	            var v = 0;
	            for (var z = 0; z < this.chunkSize; z++) {
	                visible = false;

	                if (map[x][y].a > 0 && z <= this.wallHeight) {
	                    visible = true;
	                    tmpBlocks[x][y][z] = 1;
	                    v++;
	                } else {
	                    tmpBlocks[x][y][z] = 0;
	                    visible = false;
	                }
	            }
	            if (maxHeight < v) {
	                maxHeight = v;
	            }
	        }
	    }
	    this.chunkSizeZ = maxHeight;

	    // Skipping _a_lot_ of blocks by just allocating maxHeight for each block.
	    for (var x = 0; x < this.chunkSize; x++) {
	        for (var y = 0; y < this.chunkSize; y++) {
	            for (var z = 0; z < this.chunkSizeZ; z++) {
	                this.blocks[x][y][z] = new Block();
	                var visible = false;
	                if (tmpBlocks[x][y][z] == 1) {
	                    visible = true;
	                }
	                this.blocks[x][y][z].Create(visible, map[x][y].r, map[x][y].g, map[x][y].b, map[x][y].a);
	            }
	        }
	    }
	};

	ChunkWorld.prototype.Rebuild = function () {
	    var b = 0;
	    var vertices = [];
	    var colors = [];

	    // Reset merged blocks
	    for (var x = 0; x < this.chunkSize; x++) {
	        for (var y = 0; y < this.chunkSize; y++) {
	            for (var z = 0; z < this.chunkSizeZ; z++) {
	                this.blocks[x][y][z].drawnLeftSide = false;
	                this.blocks[x][y][z].drawnTopSide = false;
	                this.blocks[x][y][z].drawnFrontSide = false;
	                this.blocks[x][y][z].drawnRightSide = false;
	                this.blocks[x][y][z].drawnBottomSide = false;
	            }
	        }
	    }

	    var drawBlock = false;
	    for (var x = 0; x < this.chunkSize; x++) {
	        for (var y = 0; y < this.chunkSize; y++) {
	            var height = 0;
	            for (var z = 1; z < this.chunkSizeZ; z++) {
	                // Draw from 1 to skip "black" spots caused by image when there aint sharp borders for opacity
	                if (this.blocks[x][y][z].isActive() == true) {
	                    if (height < z) {
	                        height = z;
	                    }

	                    // Check for hidden blocks on edges (between chunks)
	                    if (x == this.chunkSize - 1 && y < this.chunkSize - 1 && y > 0 && z < this.chunkSizeZ - 1) {
	                        var id = this.cid + 1;
	                        if (id >= 0 && id < game.chunkManager.worldChunks.length) {
	                            if (game.chunkManager.worldChunks[id].blocks[0][y][z] != null && game.chunkManager.worldChunks[id].blocks[0][y][z].isActive()) {
	                                if (this.blocks[x][y - 1][z].isActive() && this.blocks[x - 1][y][z].isActive() && this.blocks[x][y + 1][z].isActive() && this.blocks[x][y][z + 1].isActive()) {
	                                    continue;
	                                }
	                            }
	                        }
	                    }

	                    if (x == 0 && y < this.chunkSize - 1 && y > 0 && z < this.chunkSizeZ - 1) {
	                        var id = this.cid - 1;
	                        if (id >= 0 && id < game.chunkManager.worldChunks.length) {
	                            if (game.chunkManager.worldChunks[id].blocks[this.chunkSize - 1][y][z] != null && game.chunkManager.worldChunks[id].blocks[this.chunkSize - 1][y][z].isActive()) {
	                                if (this.blocks[x][y - 1][z].isActive() && this.blocks[x][y + 1][z].isActive() && this.blocks[x + 1][y][z].isActive() && this.blocks[x][y][z + 1].isActive()) {
	                                    continue;
	                                }
	                            }
	                        }
	                    }

	                    if (y == this.chunkSize - 1 && x < this.chunkSize - 1 && x > 0 && z < this.chunkSizeZ - 1) {
	                        var id = this.cid + Math.sqrt(game.world.map.length);
	                        if (id >= 0 && id < game.chunkManager.worldChunks.length) {
	                            if (game.chunkManager.worldChunks[id].blocks[x][0][z] != null && game.chunkManager.worldChunks[id].blocks[x][0][z].isActive()) {
	                                if (this.blocks[x - 1][y][z].isActive() && this.blocks[x + 1][y][z].isActive() && this.blocks[x][y - 1][z].isActive() && this.blocks[x][y][z + 1].isActive()) {
	                                    continue;
	                                }
	                            }
	                        }
	                    }

	                    if (y == 0 && x < this.chunkSize - 1 && x > 0 && z < this.chunkSizeZ - 1) {
	                        var id = this.cid - Math.sqrt(game.world.map.length);
	                        if (id >= 0 && id < game.chunkManager.worldChunks.length) {
	                            if (game.chunkManager.worldChunks[id].blocks[x][this.chunkSize - 1][z] != null && game.chunkManager.worldChunks[id].blocks[x][this.chunkSize - 1][z].isActive()) {
	                                if (this.blocks[x - 1][y][z].isActive() && this.blocks[x + 1][y][z].isActive() && this.blocks[x][y + 1][z].isActive() && this.blocks[x][y][z + 1].isActive()) {
	                                    continue;
	                                }
	                            }
	                        }
	                    }

	                    var sides = 0;

	                    drawBlock = false;

	                    // left side (+X)
	                    if (x > 0) {
	                        if (!this.blocks[x - 1][y][z].isActive()) {
	                            drawBlock = true;
	                        }
	                    } else {
	                        var id = this.cid - 1;
	                        if (id != -1 && game.chunkManager.worldChunks[id].blocks[this.chunkSize - 1][y][z] != null && //game.chunkManager.worldChunks[id].blocks[x][y][z].isActive() &&
	                        game.chunkManager.worldChunks[id].blocks[this.chunkSize - 1][y][z].drawnRightSide) {
	                            drawBlock = false;
	                            this.blocks[x][y][z].drawnLeftSide = true;
	                        } else {
	                            drawBlock = true;
	                        }
	                    }

	                    if (drawBlock) {
	                        var countX = 0;
	                        var countY = 0;
	                        if (!this.blocks[x][y][z].drawnLeftSide) {
	                            for (var cx = 1; cx < this.chunkSize; cx++) {
	                                if (y + cx < this.chunkSize) {
	                                    if (this.blocks[x][y + cx][z].isActive() && !this.blocks[x][y + cx][z].drawnLeftSide && this.blocks[x][y + cx][z].r == this.blocks[x][y][z].r && this.blocks[x][y + cx][z].g == this.blocks[x][y][z].g && this.blocks[x][y + cx][z].b == this.blocks[x][y][z].b) {
	                                        countX++;
	                                        var tmpCountY = 0;
	                                        for (var cy = 1; cy < this.chunkSizeZ; cy++) {
	                                            if (z + cy < this.chunkSizeZ) {
	                                                if (this.blocks[x][y + cx][z + cy].isActive() && !this.blocks[x][y + cx][z + cy].drawnLeftSide && this.blocks[x][y + cx][z + cy].r == this.blocks[x][y][z].r && this.blocks[x][y + cx][z + cy].g == this.blocks[x][y][z].g && this.blocks[x][y + cx][z + cy].b == this.blocks[x][y][z].b) {
	                                                    tmpCountY++;
	                                                } else {
	                                                    break;
	                                                }
	                                            }
	                                        }
	                                        if (tmpCountY < countY || countY == 0) {
	                                            countY = tmpCountY;
	                                        }
	                                        if (tmpCountY == 0 && countY > countX) {
	                                            break;
	                                        }
	                                    } else {
	                                        break;
	                                    }
	                                }
	                            }

	                            for (var x1 = 0; x1 <= countX; x1++) {
	                                for (var y1 = 0; y1 <= countY; y1++) {
	                                    if (this.blocks[x][y + x1][z + y1].drawnLeftSide) {
	                                        countY = y1 - 1;
	                                    } else {
	                                        this.blocks[x][y + x1][z + y1].drawnLeftSide = true;
	                                    }
	                                }
	                            }
	                            this.blocks[x][y][z].drawnLeftSide = true;
	                            sides++;
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize + this.blockSize * countY]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize + this.blockSize * countX, z * this.blockSize + this.blockSize * countY]);

	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize + this.blockSize * countX, z * this.blockSize + this.blockSize * countY]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize + this.blockSize * countX, z * this.blockSize - this.blockSize]);

	                            for (var i = 0; i < 6; i++) {
	                                colors.push([this.blocks[x][y][z].r, this.blocks[x][y][z].g, this.blocks[x][y][z].b, 255]);
	                            }
	                        }
	                    }
	                    drawBlock = false;

	                    // right side (-X)
	                    if (x < this.chunkSize - 1) {
	                        if (!this.blocks[x + 1][y][z].isActive()) {
	                            drawBlock = true;
	                        }
	                    } else {
	                        var id = this.cid + 1;
	                        if (game.chunkManager.worldChunks[id].blocks[0][y][z] != null && game.chunkManager.worldChunks[id].blocks[0][y][z].isActive() && !game.chunkManager.worldChunks[id].blocks[0][y][z].drawnLeftSide) {
	                            this.blocks[x][y][z].drawnRightSide = true;
	                            drawBlock = false;
	                        } else {
	                            drawBlock = true;
	                        }
	                    }

	                    if (drawBlock) {
	                        var countX = 0;
	                        var countY = 0;
	                        if (!this.blocks[x][y][z].drawnRightSide) {
	                            for (var cx = 1; cx < this.chunkSize; cx++) {
	                                if (y + cx < this.chunkSize) {
	                                    if (this.blocks[x][y + cx][z].isActive() && !this.blocks[x][y + cx][z].drawnRightSide && this.blocks[x][y + cx][z].r == this.blocks[x][y][z].r && this.blocks[x][y + cx][z].g == this.blocks[x][y][z].g && this.blocks[x][y + cx][z].b == this.blocks[x][y][z].b) {
	                                        // Check how far we can draw other way
	                                        countX++;
	                                        var tmpCountY = 0;
	                                        for (var cy = 1; cy < this.chunkSizeZ; cy++) {
	                                            if (z + cy < this.chunkSizeZ) {
	                                                if (this.blocks[x][y + cx][z + cy].isActive() && !this.blocks[x][y + cx][z + cy].drawnRightSide && this.blocks[x][y + cx][z + cy].r == this.blocks[x][y][z].r && this.blocks[x][y + cx][z + cy].g == this.blocks[x][y][z].g && this.blocks[x][y + cx][z + cy].b == this.blocks[x][y][z].b) {
	                                                    tmpCountY++;
	                                                } else {
	                                                    break;
	                                                }
	                                            }
	                                        }
	                                        if (tmpCountY < countY || countY == 0) {
	                                            countY = tmpCountY;
	                                        }
	                                        if (tmpCountY == 0 && countY > countX) {
	                                            break;
	                                        }
	                                    } else {
	                                        break;
	                                    }
	                                }
	                            }

	                            for (var x1 = 0; x1 <= countX; x1++) {
	                                for (var y1 = 0; y1 <= countY; y1++) {
	                                    if (this.blocks[x][y + x1][z + y1].drawnRightSide) {
	                                        countY = y1 - 1;
	                                    } else {
	                                        this.blocks[x][y + x1][z + y1].drawnRightSide = true;
	                                    }
	                                }
	                            }

	                            this.blocks[x][y][z].drawnRightSide = true;
	                            sides++;
	                            vertices.push([x * this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);
	                            vertices.push([x * this.blockSize, y * this.blockSize + this.blockSize * countX, z * this.blockSize + this.blockSize * countY]);
	                            vertices.push([x * this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize + this.blockSize * countY]);

	                            vertices.push([x * this.blockSize, y * this.blockSize + this.blockSize * countX, z * this.blockSize + this.blockSize * countY]);
	                            vertices.push([x * this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);
	                            vertices.push([x * this.blockSize, y * this.blockSize + this.blockSize * countX, z * this.blockSize - this.blockSize]);

	                            for (var i = 0; i < 6; i++) {
	                                colors.push([this.blocks[x][y][z].r, this.blocks[x][y][z].g, this.blocks[x][y][z].b, 255]);
	                            }
	                        }
	                    }

	                    // TBD: If this is world chunk -> don't draw this side!

	                    // Back side (-Z)  
	                    if (z > 0) {
	                        if (!this.blocks[x][y][z - 1].isActive()) {
	                            drawBlock = true;
	                        }
	                    } else {
	                        drawBlock = true;
	                    }
	                    drawBlock = false; // skip this for world.
	                    if (drawBlock) {
	                        sides++;
	                        vertices.push([x * this.blockSize, y * this.blockSize, z * this.blockSize - this.blockSize]);
	                        vertices.push([x * this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);
	                        vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);

	                        vertices.push([x * this.blockSize, y * this.blockSize, z * this.blockSize - this.blockSize]);
	                        vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);
	                        vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize, z * this.blockSize - this.blockSize]);
	                        for (var i = 0; i < 6; i++) {
	                            colors.push([this.blocks[x][y][z].r, this.blocks[x][y][z].g, this.blocks[x][y][z].b, 255]);
	                        }
	                    }
	                    drawBlock = false;

	                    // Front side (+Z)
	                    if (z < this.chunkSizeZ - 1) {
	                        if (!this.blocks[x][y][z + 1].isActive()) {
	                            drawBlock = true;
	                        }
	                    } else {
	                        drawBlock = true;
	                    }

	                    if (drawBlock) {
	                        var countX = 0;
	                        var countY = 0;
	                        if (!this.blocks[x][y][z].drawnFrontSide) {
	                            for (var cx = 1; cx < this.chunkSize; cx++) {
	                                if (x + cx < this.chunkSize) {
	                                    if (this.blocks[x + cx][y][z].isActive() && !this.blocks[x + cx][y][z].drawnFrontSide && this.blocks[x + cx][y][z].r == this.blocks[x][y][z].r && this.blocks[x + cx][y][z].g == this.blocks[x][y][z].g && this.blocks[x + cx][y][z].b == this.blocks[x][y][z].b) {
	                                        // Check how far we can draw other way
	                                        countX++;
	                                        var tmpCountY = 0;
	                                        for (var cy = 1; cy < this.chunkSizeZ; cy++) {
	                                            if (y + cy < this.chunkSizeZ) {
	                                                if (this.blocks[x + cx][y + cy][z].isActive() && !this.blocks[x + cx][y + cy][z].drawnFrontSide && this.blocks[x + cx][y + cy][z].r == this.blocks[x][y][z].r && this.blocks[x + cx][y + cy][z].g == this.blocks[x][y][z].g && this.blocks[x + cx][y + cy][z].b == this.blocks[x][y][z].b) {
	                                                    tmpCountY++;
	                                                } else {
	                                                    break;
	                                                }
	                                            }
	                                        }
	                                        if (tmpCountY < countY || countY == 0) {
	                                            countY = tmpCountY;
	                                        }
	                                        if (tmpCountY == 0 && countY > countX) {
	                                            break;
	                                        }
	                                    } else {
	                                        break;
	                                    }
	                                }
	                            }

	                            for (var x1 = 0; x1 <= countX; x1++) {
	                                for (var y1 = 0; y1 <= countY; y1++) {
	                                    if (this.blocks[x + x1][y + y1][z].drawnFrontSide) {
	                                        countY = y1 - 1;
	                                    } else {
	                                        this.blocks[x + x1][y + y1][z].drawnFrontSide = true;
	                                    }
	                                }
	                            }
	                            this.blocks[x][y][z].drawnFrontSide = true;
	                            sides++;
	                            vertices.push([x * this.blockSize + this.blockSize * countX, y * this.blockSize + this.blockSize * countY, z * this.blockSize]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize + this.blockSize * countY, z * this.blockSize]);
	                            vertices.push([x * this.blockSize + this.blockSize * countX, y * this.blockSize - this.blockSize, z * this.blockSize]);

	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize + this.blockSize * countY, z * this.blockSize]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize]);
	                            vertices.push([x * this.blockSize + this.blockSize * countX, y * this.blockSize - this.blockSize, z * this.blockSize]);

	                            for (var i = 0; i < 6; i++) {
	                                colors.push([this.blocks[x][y][z].r, this.blocks[x][y][z].g, this.blocks[x][y][z].b, 255]);
	                            }
	                        }
	                    }
	                    drawBlock = false;

	                    // Bottom (-Y)
	                    if (y > 0) {
	                        if (!this.blocks[x][y - 1][z].isActive()) {
	                            drawBlock = true;
	                        }
	                    } else {
	                        //drawBlock = true;
	                        var id = this.cid - Math.sqrt(game.world.map.length);
	                        if (id >= 0 && id < game.chunkManager.worldChunks.length) {
	                            if (game.chunkManager.worldChunks[id].blocks[x][this.chunkSize - 1][z] != null && game.chunkManager.worldChunks[id].blocks[x][this.chunkSize - 1][z].isActive()) {
	                                // &&
	                                drawBlock = false;
	                            } else {
	                                drawBlock = true;
	                            }
	                        } else {
	                            drawBlock = true;
	                        }
	                    }

	                    if (drawBlock) {
	                        var countX = 0;
	                        var countY = 0;
	                        if (!this.blocks[x][y][z].drawnBottomSide) {
	                            for (var cx = 1; cx < this.chunkSize; cx++) {
	                                if (x + cx < this.chunkSize) {
	                                    if (this.blocks[x + cx][y][z].isActive() && !this.blocks[x + cx][y][z].drawnBottomSide && this.blocks[x + cx][y][z].r == this.blocks[x][y][z].r && this.blocks[x + cx][y][z].g == this.blocks[x][y][z].g && this.blocks[x + cx][y][z].b == this.blocks[x][y][z].b) {
	                                        countX++;
	                                        var tmpCountY = 0;
	                                        for (var cy = 1; cy < this.chunkSizeZ; cy++) {
	                                            if (z + cy < this.chunkSizeZ) {
	                                                if (this.blocks[x + cx][y][z + cy].isActive() && !this.blocks[x + cx][y][z + cy].drawnBottomSide && this.blocks[x + cx][y][z + cy].r == this.blocks[x][y][z].r && this.blocks[x + cx][y][z + cy].g == this.blocks[x][y][z].g && this.blocks[x + cx][y][z + cy].b == this.blocks[x][y][z].b) {
	                                                    tmpCountY++;
	                                                } else {
	                                                    break;
	                                                }
	                                            }
	                                        }
	                                        if (tmpCountY < countY || countY == 0) {
	                                            countY = tmpCountY;
	                                        }
	                                        if (tmpCountY == 0 && countY > countX) {
	                                            break;
	                                        }
	                                    } else {
	                                        break;
	                                    }
	                                }
	                            }

	                            for (var x1 = 0; x1 <= countX; x1++) {
	                                for (var y1 = 0; y1 <= countY; y1++) {
	                                    if (this.blocks[x + x1][y][z + y1].drawnBottomSide) {
	                                        countY = y1 - 1;
	                                    } else {
	                                        this.blocks[x + x1][y][z + y1].drawnBottomSide = true;
	                                    }
	                                }
	                            }

	                            this.blocks[x][y][z].drawnBottomSide = true;
	                            sides++;

	                            vertices.push([x * this.blockSize + this.blockSize * countX, y * this.blockSize - this.blockSize, z * this.blockSize + this.blockSize * countY]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize + this.blockSize * countY]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);

	                            vertices.push([x * this.blockSize + this.blockSize * countX, y * this.blockSize - this.blockSize, z * this.blockSize + this.blockSize * countY]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);
	                            vertices.push([x * this.blockSize + this.blockSize * countX, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);

	                            for (var i = 0; i < 6; i++) {
	                                colors.push([this.blocks[x][y][z].r, this.blocks[x][y][z].g, this.blocks[x][y][z].b, 255]);
	                            }
	                        }
	                    }

	                    drawBlock = false;

	                    // top (+Y)
	                    if (y < this.chunkSize - 1) {
	                        if (!this.blocks[x][y + 1][z].isActive()) {
	                            drawBlock = true;
	                        }
	                    } else {
	                        var id = this.cid + Math.sqrt(game.world.map.length);
	                        if (id >= 0 && id < game.chunkManager.worldChunks.length) {
	                            if (game.chunkManager.worldChunks[id].blocks[x][0][z] != null && game.chunkManager.worldChunks[id].blocks[x][0][z].isActive()) {
	                                drawBlock = false;
	                            } else {
	                                drawBlock = true;
	                            }
	                        } else {
	                            drawBlock = true;
	                        }
	                    }

	                    if (drawBlock) {
	                        var countX = 0;
	                        var countY = 0;
	                        if (!this.blocks[x][y][z].drawnTopSide) {
	                            for (var cx = 1; cx < this.chunkSize; cx++) {
	                                if (x + cx < this.chunkSize) {
	                                    if (this.blocks[x + cx][y][z].isActive() && !this.blocks[x + cx][y][z].drawnTopSide && this.blocks[x + cx][y][z].r == this.blocks[x][y][z].r && this.blocks[x + cx][y][z].g == this.blocks[x][y][z].g && this.blocks[x + cx][y][z].b == this.blocks[x][y][z].b) {
	                                        countX++;
	                                        var tmpCountY = 0;
	                                        for (var cy = 1; cy < this.chunkSizeZ; cy++) {
	                                            if (z + cy < this.chunkSizeZ) {
	                                                if (this.blocks[x + cx][y][z + cy].isActive() && !this.blocks[x + cx][y][z + cy].drawnTopSide && this.blocks[x + cx][y][z + cy].r == this.blocks[x][y][z].r && this.blocks[x + cx][y][z + cy].g == this.blocks[x][y][z].g && this.blocks[x + cx][y][z + cy].b == this.blocks[x][y][z].b) {
	                                                    tmpCountY++;
	                                                } else {
	                                                    break;
	                                                }
	                                            }
	                                        }
	                                        if (tmpCountY < countY || countY == 0) {
	                                            countY = tmpCountY;
	                                        }
	                                        if (tmpCountY == 0 && countY > countX) {
	                                            break;
	                                        }
	                                    } else {
	                                        break;
	                                    }
	                                }
	                            }

	                            for (var x1 = 0; x1 <= countX; x1++) {
	                                for (var y1 = 0; y1 <= countY; y1++) {
	                                    if (this.blocks[x + x1][y][z + y1].drawnTopSide) {
	                                        countY = y1 - 1;
	                                    } else {
	                                        this.blocks[x + x1][y][z + y1].drawnTopSide = true;
	                                    }
	                                }
	                            }

	                            this.blocks[x][y][z].drawnTopSide = true;
	                            sides++;
	                            vertices.push([x * this.blockSize + this.blockSize * countX, y * this.blockSize, z * this.blockSize + this.blockSize * countY]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize, z * this.blockSize - this.blockSize]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize, z * this.blockSize + this.blockSize * countY]);

	                            vertices.push([x * this.blockSize + this.blockSize * countX, y * this.blockSize, z * this.blockSize + this.blockSize * countY]);
	                            vertices.push([x * this.blockSize + this.blockSize * countX, y * this.blockSize, z * this.blockSize - this.blockSize]);
	                            vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize, z * this.blockSize - this.blockSize]);

	                            for (var i = 0; i < 6; i++) {
	                                colors.push([this.blocks[x][y][z].r, this.blocks[x][y][z].g, this.blocks[x][y][z].b, 255]);
	                            }
	                        }
	                    }

	                    // Add colors0
	                    b += 2 * sides;

	                    // Fully visible
	                    if (sides == 6) {
	                        // Create physBlock and remove this?
	                    }
	                }
	            }
	            this.blocks[x][y].height = height;
	        }
	    }
	    // Create Object
	    //
	    var geometry = new THREE.BufferGeometry();
	    var v = new THREE.BufferAttribute(new Float32Array(vertices.length * 3), 3);
	    for (var i = 0; i < vertices.length; i++) {
	        v.setXYZ(i, vertices[i][0], vertices[i][1], vertices[i][2]);
	    }
	    geometry.addAttribute('position', v);

	    var c = new THREE.BufferAttribute(new Float32Array(colors.length * 4), 4);
	    for (var i = 0; i < colors.length; i++) {
	        c.setXYZW(i, colors[i][0] / 255, colors[i][1] / 255, colors[i][2] / 255, colors[i][3] / 255);
	    }
	    geometry.addAttribute('color', c);

	    geometry.computeVertexNormals();
	    geometry.computeFaceNormals();

	    var material3 = new THREE.MeshLambertMaterial({ vertexColors: THREE.VertexColors, wireframe: this.wireframe });
	    var mesh = new THREE.Mesh(geometry, material3);
	    mesh.rotation.set(Math.PI / 2, Math.PI, Math.PI / 2);
	    mesh.position.set(this.posY, 0, this.posX);

	    mesh.receiveShadow = true;
	    mesh.castShadow = true;

	    if (this.mesh != undefined) {
	        game.scene.remove(this.mesh);
	    }
	    game.scene.add(mesh);

	    mesh.that = this;
	    this.mesh = mesh;
	    this.activeTriangles = b;
	};

	Object.keys(Chunk.prototype).forEach(function (method) {
	    if (typeof ChunkWorld.prototype[method] === 'undefined') {
	        ChunkWorld.prototype[method] = Chunk.prototype[method];
	    }
	});

	//ChunkWorld.prototype = new Chunk();
	//ChunkWorld.prototype.constructor = ChunkWorld;
	module.exports = ChunkWorld;

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var SmallShot = __webpack_require__(29);

	function Player() {
	    this.type = "player";
	    this.mesh = undefined;
	    this.chunk = undefined;
	    this.jump = 0;
	    this.velocityY = 0;
	    this.gravity = 0.06;

	    this.t_delta = 0;
	    this.camera_obj = 0;
	    this.attached_camera = 0;
	    this.keyboard = undefined;
	    this.dead = false;
	    this.falling = false;
	    this.wf = false; // wireframe temp
	    this.wf_delta = 0;
	    this.remove = 0;
	    this.model = "";
	    this.pos = 0;
	    this.hpPerBar = 0;
	    this.bars = 12;
	    this.health = 20;
	    this.healthBoxes = [];
	    this.godMode = false;
	    this.loaded = false;
	    this.bulletPos = undefined;
	    this.weapon = 1;
	    this.destruction_mode = false;

	    $(document).mousemove(this.OnMouseMove.bind(this));
	}

	Player.prototype.AddHealth = function () {
	    this.health = 20;
	    for (var i = 0; i < this.healthBoxes.length; i++) {
	        this.mesh.remove(this.healthBoxes.pop());
	    }
	    this.CreateHealth();
	};

	Player.prototype.CreateHealth = function () {
	    this.hpPerBar = this.health / this.bars;
	    for (var i = 0; i < this.bars; i++) {
	        var geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
	        var color;
	        switch (i) {
	            case 0:
	                color = 0x880000;
	                break;
	            case 1:
	                color = 0x980000;
	                break;
	            case 2:
	                color = 0xB80000;
	                break;
	            case 3:
	                color = 0xF80000;
	                break;
	            case 4:
	                color = 0xFF6600;
	                break;
	            case 5:
	                color = 0xFF9900;
	                break;
	            case 6:
	                color = 0xFFCC00;
	                break;
	            case 7:
	                color = 0xFFFF00;
	                break;
	            case 8:
	                color = 0x99FF33;
	                break;
	            default:
	                color = 0x00FF00;
	        }
	        var mat = new THREE.MeshBasicMaterial({ 'color': color });
	        var b = new THREE.Mesh(geo, mat);
	        b.position.set(i * 0.1 + 0.01 - this.bars / 2 * 0.1, 0, 2);
	        this.healthBoxes.push(b);
	        this.mesh.add(b);
	    };
	};

	Player.prototype.Hit = function (shooter, dmg) {
	    if (shooter == "player") {
	        return;
	    }
	    if (this.godMode) {
	        return;
	    }

	    game.soundLoader.PlaySound("vox_aj", this.mesh.position, 300);
	    this.health -= dmg;
	    var remove = Math.round(this.healthBoxes.length - this.health / this.hpPerBar);
	    for (var i = 0; i <= remove; i++) {
	        this.mesh.remove(this.healthBoxes.pop());
	    }
	    if (this.health <= 0) {
	        this.Die();
	    }
	};

	Player.prototype.Remove = function (data) {
	    scene.remove(this.mesh);
	};

	Player.prototype.Create = function (model, pos) {
	    var that = this;
	    this.model = model;
	    this.pos = pos;
	    this.keyboard = new THREEx.KeyboardState();
	    this.chunk = game.voxLoader.GetModel(model);
	    this.mesh = this.chunk.mesh;

	    game.scene.add(this.mesh);
	    // that.mesh.position.set(0,(santa.getChunk().chunkSizeY*santa.getChunk().blockSize)/2 - 0.5,0);

	    this.camera_obj = new THREE.Object3D();

	    this.mesh.add(this.camera_obj);
	    this.camera_obj.add(game.camera);
	    this.attached_camera = 1;

	    //game.camera.position.set(0, 15, 4);
	    //game.camera.rotation.set(-Math.PI/2, 0, Math.PI);

	    this.mesh.position.set(pos.x, pos.y - 0.5, pos.z);
	    game.camera.position.set(0, 15, 7);
	    //this.mesh.rotation.set(Math.PI/2, Math.PI, 0);
	    game.camera.rotation.set(-Math.PI / 2.6, 0, Math.PI);

	    // var axisHelper = new THREE.AxisHelper( 5 );
	    // this.mesh.add( axisHelper );

	    this.mesh.that = this;
	    game.targets.push(this.mesh);
	    game.objects.push(this);
	    this.CreateHealth();
	    this.mesh.geometry.computeBoundingBox();
	    this.mesh.geometry.center();
	    //   var bbox = new THREE.BoundingBoxHelper( this.mesh, 0xFF0000 );
	    //bbox.update();
	    //   this.mesh.add( bbox );
	    //       this.mesh.rotation.set(Math.PI/2, Math.PI, 0);
	    this.loaded = true;

	    // Add bullet position
	    //   var b = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5, 0.5),
	    //                    new THREE.MeshBasicMaterial({color: 0x00FF00}));
	    this.bulletPos = new THREE.Object3D();
	    this.bulletPos.position.set(0, -0.8, 0.5);
	    this.mesh.add(this.bulletPos);

	    // TBD: fix this bug! This is just a workaround for player
	    var that = this;
	    setTimeout(function () {
	        that.AddBindings();
	        LockPointer();
	    }, 1500);
	    console.log("Player loaded...");
	};

	Player.prototype.Draw = function (time, delta) {
	    var rotateAngle = Math.PI / 1.5 * delta;
	    var moveDistance = 10 * delta;
	    if (this.destruction_mode) {
	        this.godMode = true;
	    }
	    if (this.godMode) {
	        if (this.wf_delta < 10) {
	            if (!this.destruction_mode) {
	                this.wf_delta += delta;
	            }
	            game.setStatusCenter("GOD MODE " + (10 - Math.round(this.wf_delta)) + " sec.", "#FF00FF");
	        } else {
	            this.godMode = false;
	            this.wf_delta = 0;
	            game.setStatusCenter("");
	        }
	    }

	    if (this.keyboard.pressed("v")) {
	        if (this.wf) {
	            this.wf = false;
	        } else {
	            this.wf = true;
	        }
	        var chunk = game.chunkManager.GetChunk(this.mesh.position.x, this.mesh.position.z);
	        console.log("ACTIVE BLOCKS: " + chunk.NoOfActiveBlocks());
	        // var id = chunk.cid - Math.sqrt(game.world.map.length);
	        // if(id >= 0  && id < game.chunkManager.worldChunks.length) {
	        //     game.chunkManager.worldChunks[id].SetWireFrame(true);
	        // }
	        chunk.SetWireFrame(this.wf);
	        var c = game.chunkManager.GetWorldChunkID(this.mesh.position.x, this.mesh.position.z);
	        //game.chunkManager.worldChunks[chunk.cid-1].SetWireFrame(true);
	        //   console.log("C: "+c.id);
	        //    var right = c.id + Math.sqrt(game.world.map.length);
	        //    var left = c.id - Math.sqrt(game.world.map.length);
	        //    var up = c.id - 1;
	        //    var down = c.id +1;
	        //    game.chunkManager.worldChunks[up].SetWireFrame(this.wf);
	        //   game.chunkManager.worldChunks[down].SetWireFrame(this.wf);
	        //    game.chunkManager.worldChunks[left].SetWireFrame(this.wf);
	        //    game.chunkManager.worldChunks[right].SetWireFrame(this.wf);
	        //    console.log("R: "+right + " L: "+left + " Up: "+up + " Down: "+down);
	    }

	    // Only allow movement when alive
	    if (!this.dead && !this.falling) {
	        if (this.keyboard.pressed("space")) {
	            if (!this.jump) {
	                this.jump = true;
	                this.velocityY = 1;
	                game.soundLoader.PlaySound("jump", this.mesh.position, 300);
	            }
	        }
	        if (this.keyboard.pressed("P")) {
	            if (this.wf_delta < 0.2) {
	                return;
	            }
	            this.wf_delta = 0;
	            var power = 2 + Math.random() * 5;
	            var blood = Math.random() > 0.5 ? true : false;
	            game.chunkManager.ExplodeBomb(this.mesh.position.x, this.mesh.position.z, 2 + Math.random() * 5, blood);
	            console.log("Free blocks: " + game.physBlockPool.Free());
	        }
	        if (this.keyboard.pressed("B")) {
	            if (this.wf_delta < 0.2) {
	                return;
	            }
	            this.wf_delta = 0;
	            game.chunkManager.Blood(this.mesh.position.x, this.mesh.position.z, 1 + Math.random() * 3);
	        }
	        if (this.keyboard.pressed("m")) {
	            console.log("MESH Position: ");
	            console.log(this.mesh.position);
	        }
	        if (this.keyboard.pressed("W")) {
	            this.mesh.translateY(-moveDistance);
	        }
	        if (this.keyboard.pressed("S")) {
	            this.mesh.translateY(moveDistance);
	        }
	        if (this.keyboard.pressed("A")) {
	            this.mesh.translateX(moveDistance);
	        }
	        if (this.keyboard.pressed("K")) {
	            this.Die();
	        }
	        if (this.keyboard.pressed("O")) {
	            this.Respawn();
	        }

	        // WEAPONS
	        // TBD: Some function handling this.
	        if (this.keyboard.pressed("1")) {
	            this.weapon = 1;
	            $('#weapon1').fadeTo(0, 1);
	            $('#weapon2').fadeTo(0, 0.3);
	            $('#weapon3').fadeTo(0, 0.3);
	        }
	        if (this.keyboard.pressed("2")) {
	            this.weapon = 2;
	            $('#weapon1').fadeTo(0, 0.3);
	            $('#weapon2').fadeTo(0, 1);
	            $('#weapon3').fadeTo(0, 0.3);
	        }
	        if (this.keyboard.pressed("3")) {
	            this.weapon = 3;
	            $('#weapon1').fadeTo(0, 0.3);
	            $('#weapon2').fadeTo(0, 0.3);
	            $('#weapon3').fadeTo(0, 1);
	        }

	        if (this.keyboard.pressed("L")) {
	            if (Math.random() > 0.5) {
	                var enemy = new Devil1();
	                enemy.Create(100 - Math.random() * 50, 1, 100 - Math.random() * 50, "SmallShot");
	            } else {
	                var enemy = new Devil2();
	                enemy.Create(100 - Math.random() * 50, 1, 100 - Math.random() * 50, "SmallShot");
	            }
	        }
	        if (this.keyboard.pressed("D")) {
	            this.mesh.translateX(-moveDistance);
	        }
	    }

	    this.UpdatePos(time);
	};

	Player.prototype.Die = function (fall) {
	    if (true) {
	        return;
	    }
	    if (fall) {
	        $('#statusCenter').text("Vox slipped and died!");
	        $('#statusCenter').fadeIn(1000);
	        $('#weapons').fadeOut(1000);
	    } else {
	        game.chunkManager.Blood(this.mesh.position.x, this.mesh.position.z, 2 + Math.random() * 1);
	    }
	    $('#statusCenter').text("Vox were killed!");
	    $('#statusCenter').fadeIn(1000);
	    this.chunk.Explode(this.mesh.position);
	    this.dead = true;
	    this.remove = 1;
	    setTimeout(function () {
	        game.ReInit(game.currentMap.id);
	    }, 3500);
	};

	Player.prototype.UpdatePos = function (time) {
	    var y = 0;
	    if (!this.dead) {
	        y = game.chunkManager.GetHeight(this.mesh.position.x + this.chunk.blockSize * this.chunk.chunkSizeX / 2, this.mesh.position.z + this.chunk.blockSize * this.chunk.chunkSizeX / 2);
	    }
	    if (this.jump && time != 0) {
	        this.velocityY -= this.gravity;
	        this.mesh.position.y += this.velocityY;
	        if (this.mesh.position.y < game.currentMap.lavaPosition - 0.5) {
	            if (!this.dead) {
	                this.Die(1);
	            }
	        }
	        if (this.mesh.position.y < y) {
	            this.mesh.position.y = y;
	            this.velocityY = 0;
	            this.jump = false;
	        }
	        return;
	    }

	    if (this.godMode) {
	        this.mesh.position.y = y;
	        return;
	    }

	    if (y <= 0) {
	        if (this.mesh.position.y > game.currentMap.lavaPosition) {
	            this.falling = true;
	            this.mesh.position.y -= 0.3;
	            //     if(!this.dead) {
	            //         this.mesh.remove(this.camera_obj);
	            //         game.scene.add(this.camera_obj);
	            //         this.camera_obj.position.set(this.mesh.position.x, 2, this.mesh.position.z);
	            //         this.camera_obj.rotateOnAxis(new THREE.Vector3(1,0,0), 30);
	            //         this.dead = true;
	            //     }
	            //this.camera_obj.translateY(-0.1);
	            //    this.camera_obj.lookAt(this.mesh.position);
	            //this.camera_obj.position.x = this.
	            //                this.camera_obj.translateY(0.01);
	        } else {
	                if (!this.dead) {
	                    this.Die(1);
	                }
	            }
	    } else {
	        this.mesh.position.y = y; //-this.chunk.blockSize;
	    }
	};

	Player.prototype.OnMouseMove = function (jevent) {
	    var event = jevent.originalEvent; // jquery convert
	    if (this.attached_camera == 1) {
	        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
	        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
	        var x = movementX * 0.001;
	        var y = movementY * 0.001;

	        var xAxis = new THREE.Vector3(0, 0, 1);
	        rotateAroundObjectAxis(this.mesh, xAxis, -(Math.PI / 2) * x);
	        //this.UpdatePos(-1);
	    }
	};

	Player.prototype.OnMouseUp = function (event) {
	    if (this.dead) {
	        return;
	    }
	    var mouseButton = event.keyCode || event.which;
	    if (mouseButton != 1) {
	        return;
	    }

	    this.mesh.updateMatrixWorld();
	    var vector = new THREE.Vector3();
	    vector.setFromMatrixPosition(this.bulletPos.matrixWorld);

	    var rotationMatrix = new THREE.Matrix4();
	    rotationMatrix.extractRotation(this.mesh.matrix);
	    var rotationVector = new THREE.Vector3(0, -1, 0);
	    rotationVector.applyMatrix4(rotationMatrix);
	    var ray = new THREE.Raycaster(vector, rotationVector);

	    // game.scene.add( new THREE.ArrowHelper(ray.ray.direction, this.mesh.position, 50, 0x00FF00));
	    // game.scene.add( new THREE.ArrowHelper(ray.ray.direction, initialPosition, 30, 0x00FF00));

	    this.mouseDown = 0;

	    var shot;
	    if (this.weapon === 1) {
	        shot = new SmallShot();
	    } else if (this.weapon == 2) {
	        shot = new QuakeShot();
	    } else if (this.weapon == 3) {
	        shot = new FloatingShot();
	    }
	    shot.Create(ray, vector, this.type);

	    //this.UpdatePos(-1);
	};

	Player.prototype.Respawn = function () {
	    // TBD: Better solution
	    this.Create(this.model, this.pos);
	};

	Player.prototype.OnMouseDown = function (event) {
	    var mouseButton = event.keyCode || event.which;
	    if (mouseButton === 1) {
	        //this.mouseDown = 1;
	    }
	};

	Player.prototype.RemoveBindings = function () {
	    $(document).unbind('mouseup');
	    $(document).unbind('mousemove');
	    $(document).unbind('mousedown');
	};

	Player.prototype.AddBindings = function () {
	    $(document).mouseup(this.OnMouseUp.bind(this));
	    $(document).mousedown(this.OnMouseDown.bind(this));
	};

	module.exports = Player;

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var util = __webpack_require__(3);
	var Enemy = __webpack_require__(22);

	function Hula1() {
	    Enemy.call(this);
	    this.enemy_type = "Hula1";
	    this.vox = "hula1";
	    this.damage = 2;
	    this.speed = 0.1;
	    this.weapon = undefined;
	    this.willShoot = false;
	    this.maxHealth = 3;
	    this.health = this.maxHealth;
	    this.scale = 2;
	};

	Hula1.prototype.Draw = function (time, delta) {
	    Enemy.prototype.Draw.call(this);

	    var dist = GetDistance(this.mesh.position, game.player.mesh.position);
	    if (dist < 5) {
	        this.Explode();
	    }
	};
	util.inherits(Hula1, Enemy);
	module.exports = Hula1;

/***/ },
/* 22 */
/***/ function(module, exports) {

	"use strict";

	function Enemy() {
	    this.type = "enemy";
	    this.mesh = undefined;
	    this.chunk = undefined;
	    this.vox = undefined;
	    this.direction = undefined;
	    this.remove = 0;
	    this.y = 0;
	    this.ray = undefined;
	    this.willShoot = false;
	    this.shotType = undefined;
	    this.healthBoxes = [];
	    this.health = 3;
	    this.bars = 12;
	    this.hpPerBar = 0;
	    this.skipDraw = false;
	    this.active = false;
	    this.maxHealth = 0;
	    this.health = 0;
	    this.skipDraw = 0;
	    this.damage = 2;
	    this.scale = 1;
	};

	Enemy.prototype.CreateHealth = function () {
	    this.hpPerBar = this.health / this.bars;
	    for (var i = 0; i < this.bars; i++) {
	        var geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
	        var color;
	        switch (i) {
	            case 0:
	                color = 0x880000;
	                break;
	            case 1:
	                color = 0x980000;
	                break;
	            case 2:
	                color = 0xB80000;
	                break;
	            case 3:
	                color = 0xF80000;
	                break;
	            case 4:
	                color = 0xFF6600;
	                break;
	            case 5:
	                color = 0xFF9900;
	                break;
	            case 6:
	                color = 0xFFCC00;
	                break;
	            case 7:
	                color = 0xFFFF00;
	                break;
	            case 8:
	                color = 0x99FF33;
	                break;
	            default:
	                color = 0x00FF00;
	        }
	        var mat = new THREE.MeshBasicMaterial({ 'color': color });
	        var b = new THREE.Mesh(geo, mat);
	        b.position.set(i * 0.1 + 0.01 - this.bars / 2 * 0.06, 0, 2);
	        this.healthBoxes.push(b);
	        this.mesh.add(b);
	    };
	};

	Enemy.prototype.Hit = function (data, dmg) {
	    this.health -= dmg;
	    var remove = Math.round(this.healthBoxes.length - this.health / this.hpPerBar);
	    for (var i = 0; i <= remove; i++) {
	        this.mesh.remove(this.healthBoxes.pop());
	    }
	    if (this.health <= 0) {
	        this.Remove();
	    }
	    var r = Math.random();
	    if (r > 0.9) {
	        game.soundLoader.PlaySound("growl1", this.mesh.position, 300);
	    } else if (r < 0.1) {
	        game.soundLoader.PlaySound("growl2", this.mesh.position, 300);
	    }
	};

	Enemy.prototype.Remove = function (fall) {
	    if (this.remove != 1) {
	        this.chunk.Explode(this.mesh.position, this.scale);
	        // Don't splat blood if falling to death
	        if (!fall) {
	            game.chunkManager.Blood(this.mesh.position.x + this.chunk.blockSize * this.chunk.chunkSizeX / 2, this.mesh.position.z + this.chunk.blockSize * this.chunk.chunkSizeZ / 2, 1 + Math.random() * 2);
	        }
	        this.remove = 1;
	        game.scene.remove(this.mesh);
	        game.currentMap.enemiesKilled++;
	        var el = game.currentMap.GetEnemiesLeft();
	        $('#statusEnemies').text("Enemies left: " + el);
	        if (Math.random() > 0.5) {
	            game.soundLoader.PlaySound("die1", this.mesh.position, 300);
	        } else {
	            game.soundLoader.PlaySound("die2", this.mesh.position, 300);
	        }
	    }
	};

	Enemy.prototype.Shoot = function () {
	    if (game.player.dead) {
	        return;
	    }
	    if (this.willShoot) {
	        if (Math.random() > 0.98) {
	            var shot;
	            if (this.shotType == "QuakeShot") {
	                shot = new QuakeShot();
	            } else if (this.shotType == "SmallShot") {
	                shot = new SmallShot();
	            } else if (this.shotType == "FloatingShot") {
	                shot = new FloatingShot();
	            }
	            shot.Create(this.ray, this.mesh.position, this.type);
	            shot.setDamage(this.damage);
	            // game.scene.add( new THREE.ArrowHelper(this.ray.ray.direction, this.mesh.position, 10, 0x00FF00));
	        }
	    }
	};

	Enemy.prototype.setDamage = function (damage) {
	    this.damage = damage;
	};

	Enemy.prototype.Create = function (x, y, z, shotType) {
	    this.shotType = shotType;
	    this.chunk = game.voxLoader.GetModel(this.vox);
	    this.mesh = this.chunk.mesh;
	    this.mesh.geometry.computeBoundingBox();
	    game.scene.add(this.mesh);
	    this.mesh.position.set(x, y, z);
	    this.mesh.that = this;
	    game.targets.push(this.mesh);
	    this.mesh.scale.set(this.scale, this.scale, this.scale);
	    console.log("Spawning enemy: " + this.type);
	    this.CreateHealth();
	};

	Enemy.prototype.Draw = function (time, delta) {
	    var dist = GetDistance(this.mesh.position, game.player.mesh.position);
	    if (dist > 20) {
	        // Optimization for performance, skipping frames when far away.
	        this.skipDraw = Math.floor(dist / 4);
	    }
	    var rotateAngle = Math.PI / 1.5 * delta;
	    var moveDistance = 20 * delta;

	    if (!game.player.dead) {
	        var playerPos = game.player.mesh.position.clone();
	        this.mesh.lookAt(new THREE.Vector3(playerPos.x, 360, playerPos.z));

	        var initialPosition = this.mesh.position.clone();
	        initialPosition.y += this.mesh.geometry.boundingBox.max.y + 0.5;
	        var rotationMatrix = new THREE.Matrix4();
	        rotationMatrix.extractRotation(this.mesh.matrix);
	        var rotationVector = new THREE.Vector3(0, -1, -0.05);
	        rotationVector.applyMatrix4(rotationMatrix);
	        var ray = new THREE.Raycaster(initialPosition, rotationVector);
	        this.ray = ray;
	        this.direction = ray.ray.direction;
	        //}
	    }

	    this.y = game.chunkManager.GetHeight(this.mesh.position.x + this.chunk.blockSize * this.chunk.chunkSizeX / 2, this.mesh.position.z + this.chunk.blockSize * this.chunk.chunkSizeX / 2);
	    if (this.y <= 0) {
	        if (this.mesh.position.y > game.currentMap.lavaPosition) {
	            this.mesh.position.y -= 0.2;
	        } else {
	            this.Remove(1);
	        }
	        return;
	    }
	    this.mesh.position.y = this.y;

	    if (dist < 15 || this.health < this.maxHealth) {
	        this.Shoot();
	        this.active = true;
	        if (dist > 2) {
	            this.mesh.position.x += this.direction.x * this.speed;
	            this.mesh.position.z += this.direction.z * this.speed;
	        }
	    }
	};

	Enemy.prototype.Explode = function () {
	    this.Remove();
	    game.chunkManager.ExplodeBomb(this.mesh.position.x, this.mesh.position.z, this.damage, true);
	};

	module.exports = Enemy;

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var util = __webpack_require__(3);
	var Enemy = __webpack_require__(22);

	function Hula2() {
	    Enemy.call(this);
	    this.enemy_type = "Hula2";
	    this.vox = "hula2";
	    this.damage = 2;
	    this.speed = 0.1;
	    this.weapon = undefined;
	    this.willShoot = false;
	    this.maxHealth = 3;
	    this.health = this.maxHealth;
	    this.scale = 1.5;

	    Hula2.prototype.Draw = function (time, delta) {
	        Enemy.prototype.Draw.call(this);

	        var dist = GetDistance(this.mesh.position, game.player.mesh.position);
	        if (dist < 5) {
	            this.Explode();
	        }
	    };
	}
	util.inherits(Hula2, Enemy);
	module.exports = Hula2;

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var PhysBlock = __webpack_require__(25);

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
/* 25 */
/***/ function(module, exports) {

	'use strict';

	function PhysBlock() {
	    this.opacity = 1.0;
	    this.color = '0xFFFFFF';
	    this.life = 3;
	    this.mesh = undefined;
	    this.remove = 0;
	    this.velocity;
	    this.angle;
	    this.force = 0;
	    this.forceY = 0;
	};

	PhysBlock.prototype.Init = function () {
	    var geo = new THREE.BoxGeometry(1, 1, 1);
	    var mat = new THREE.MeshLambertMaterial({
	        color: 0xFFFFFF,
	        ambient: 0x996633,
	        specular: 0x050505,
	        shininess: 100
	    });
	    this.mesh = new THREE.Mesh(geo, mat);
	    game.scene.add(this.mesh);
	    this.mesh.visible = false;
	    this.mesh.castShadow = true;
	};

	PhysBlock.prototype.Create2 = function (x, y, z, size, r, g, b, life, angle, force) {
	    this.angle = angle * Math.PI / 180; // to rad
	    if (force > 3) {
	        force = 3;
	    }
	    this.force = force;
	    this.forceY = force;

	    this.velocity = { x: Math.random() * force - force / 2,
	        //y: (Math.random() * force)-(force/2),
	        y: Math.random() * force,
	        z: Math.random() * force - force / 2 };
	    this.life = life + Math.random() * 1;
	    size = size - Math.random() * size / 1.5;

	    var col = rgbToHex(Math.round(r), Math.round(g), Math.round(b));
	    this.mesh.material.color.setHex(col);
	    this.mesh.material.ambient.setHex(col);
	    this.mesh.material.needsUpdate = true;
	    this.mesh.scale.set(size, size, size);
	    this.mesh.position.set(x, y, z);
	    this.mesh.castShadow = true;
	    this.mesh.visible = true;

	    game.objects.push(this);
	};

	PhysBlock.prototype.Create = function (x, y, z, size, r, g, b, life, angle, force) {
	    this.angle = angle * Math.PI / 180; // to rad
	    if (force > 3) {
	        force = 3;
	    }
	    this.force = force;
	    this.forceY = force;
	    this.velocity = { x: this.force * Math.cos(this.angle),
	        y: this.force * Math.sin(this.angle),
	        z: this.force * Math.cos(this.angle) };
	    this.life = life + Math.random() * 1;
	    size = size - Math.random() * size / 1.5;

	    var col = rgbToHex(Math.round(r), Math.round(g), Math.round(b));
	    this.mesh.material.color.setHex(col);
	    this.mesh.material.needsUpdate = true;
	    this.mesh.scale.set(size, size, size);
	    this.mesh.position.set(x, y, z);
	    this.mesh.visible = true;

	    game.objects.push(this);
	};

	PhysBlock.prototype.Draw = function (time, delta) {
	    this.life -= 0.01;
	    //this.mesh.material.alpha -= 0.1;
	    if (this.life <= 0 || this.mesh.position.y < game.currentMap.lavaPosition) {
	        this.mesh.visible = false;
	        this.remove = 1;
	        this.life = 0;
	        return;
	    }
	    var height = game.chunkManager.GetHeight(this.mesh.position.x, this.mesh.position.z);
	    if (height == undefined) {
	        height = 0;
	    }

	    if (height == 0 || height < this.mesh.position.y || this.mesh.position.y < -1) {
	        this.mesh.position.x += this.force * this.velocity.x * delta;
	        this.mesh.position.y += this.forceY * this.velocity.y * delta;
	        this.mesh.position.z += this.force * this.velocity.z * delta;
	        this.mesh.rotation.set(this.velocity.x * time * (this.life / 150) * this.life / 2, this.velocity.y * time * (this.life / 150) * this.life / 2, this.velocity.z * time * (this.life / 150) * this.life / 2);
	    }
	    if (this.force > 0.4) {
	        this.force -= 0.04;
	    }
	    this.forceY -= 0.07;
	};

	PhysBlock.prototype.getColor = function () {
	    return parseInt(this.color);
	};
	module.exports = PhysBlock;

/***/ },
/* 26 */
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
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var util = __webpack_require__(3);
	var Object3D = __webpack_require__(16);

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

	util.inherits(Cloud, Object3D);
	module.exports = Cloud;

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var Object3D = __webpack_require__(16);

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
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var Shot = __webpack_require__(30);

	function SmallShot() {
	    Shot.call(this);
	    this.damage = 1;
	    this.size = 0.1;
	    this.life = 0.10;
	    this.color = 0xFF00FF;
	    this.sound = "shot1";
	    this.offset = 1;
	    this.speed = 2;
	};

	SmallShot.prototype.Draw = function (time, delta) {
	    this.life -= 0.01;
	    //this.mesh.position.y = this.offset;

	    if (this.life <= 0) {
	        this.Remove();
	        return;
	    }

	    if (this.hitObject != undefined) {
	        var distance = GetDistance(this.mesh.position, this.hitObject.position);
	        if (this.distance != undefined) {
	            if (this.distance <= 0 || distance > this.distance) {
	                if (this.hitObject.that.Hit != undefined) {
	                    //this.hitObject.that.Hit(this.mesh.position, this.damage);
	                    this.hitObject.that.Hit(this.shooter, this.damage);
	                }
	                this.Remove();
	                // this.Explode();
	                // this.remove = 1;
	                // game.scene.remove(this.mesh);
	            }
	        }
	        this.distance = distance;
	    } else {
	        var height = game.chunkManager.GetHeight(this.mesh.position.x, this.mesh.position.z);
	        if (height != undefined) {
	            if (height >= this.mesh.position.y + 1) {
	                game.chunkManager.ExplodeBombSmall(this.mesh.position.x, this.mesh.position.z);
	                this.Remove();
	            }
	        }
	    }

	    this.mesh.position.x += this.direction.x * this.speed;
	    this.mesh.position.z += this.direction.z * this.speed;
	};
	module.exports = SmallShot;

/***/ },
/* 30 */
/***/ function(module, exports) {

	"use strict";

	function Shot() {
	    this.id = 0;
	    this.life = 3;
	    this.life_max = 3;
	    this.mesh = undefined;
	    this.remove = 0;
	    this.velocity;
	    this.angle;
	    this.force = 0;
	    this.forceY = 0;
	    this.size = 1;
	    this.direction = undefined;
	    this.ray = undefined;
	    this.hitObject = undefined;
	    this.distance = undefined;
	    this.sound = undefined;
	    this.shooter = "";
	};

	Shot.prototype.Remove = function () {
	    this.Explode();
	    this.life = 0;
	    this.remove = 1;
	    this.mesh.that.Release(this.mesh);
	};

	Shot.prototype.setDamage = function (damage) {
	    this.damage = damage;
	};

	Shot.prototype.Explode = function () {
	    if (this.size < 0.3) {
	        return;
	    }
	    var block;
	    for (var i = 0; i < 5; i++) {
	        block = game.physBlockPool.Get();
	        if (block != undefined) {
	            block.Create(this.mesh.position.x + Math.random() * 1, this.mesh.position.y + Math.random() * 1, this.mesh.position.z + Math.random() * 1, this.size / 2, 0, 0, 0, 2, Math.random() * 180, 5);
	        }
	    }
	};

	Shot.prototype.Create = function (ray, pos, shooter) {
	    this.shooter = shooter;
	    this.life_max = this.life;
	    this.ray = ray;
	    this.direction = ray.ray.direction;

	    if (this.sound != undefined) {
	        game.soundLoader.PlaySound(this.sound, game.player.mesh.position, 300);
	    }

	    this.mesh = game.ammoPool.Get();
	    if (this.mesh == undefined) {
	        console.log("Ammo pool empty!");
	        return;
	    }
	    this.mesh.scale.set(this.size, this.size, this.size);
	    this.mesh.position.set(pos.x, pos.y, pos.z);
	    this.mesh.material.color.setHex(this.color);
	    this.mesh.material.needsUpdate = true;

	    // Check if we hit something, then set how for to it. And when it's hit, "hit" the target.
	    var intersects = this.ray.intersectObjects(game.targets);
	    if (intersects.length > 0) {
	        for (var i = 0; i < intersects.length; i++) {
	            if (intersects[i].object.that.Hit != undefined && !(this.shooter == 'player' && intersects[i].object.that.type == 'player')) {
	                this.hitObject = intersects[i].object;
	                break;
	            }
	        }
	    }

	    game.scene.add(this.mesh);
	    game.objects.push(this);
	};

	Shot.prototype.Draw = function (time, delta) {};

	Shot.prototype.getColor = function () {
	    return parseInt(this.color);
	};

	module.exports = Shot;

/***/ }
/******/ ]);