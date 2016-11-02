require("source-map-support").install();
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Game = __webpack_require__(1);
	
	new Game({
	  debug: true,
	  environment: 'server',
	  id: "server",
	  render_container: document.getElementById('server')
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var THREE = __webpack_require__(2);
	var environments = {
	  client: __webpack_require__(3),
	  server: __webpack_require__(62)
	};
	
	var Game = function Game(props) {
	  this.network = null;
	  this.render_container = null;
	  this.client = null;
	  this.render_tick = 0;
	  this.update_tick = 0;
	  this.scene = new THREE.Scene();
	  Object.assign(this, props);
	
	  this.client = new environments[this.environment](this);
	};
	
	module.exports = Game;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("three");

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var _ = __webpack_require__(4);
	var util = __webpack_require__(5);
	var Immutable = __webpack_require__(6);
	var SimplePeer = __webpack_require__(7);
	var pako = __webpack_require__(8);
	var THREE = __webpack_require__(9);
	var BaseEnv = __webpack_require__(10);
	var DesktopInputManager = __webpack_require__(49);
	var signalHub = __webpack_require__(61);
	var SIGNALHUB_HOST = (undefined) || 'localhost';
	
	function ClientEnv(props) {
	  var _this = this;
	
	  this.far = 61;
	  Object.assign(this, props);
	  this.pendingServerUpdates = [];
	  ClientEnv.super_.call(this, props);
	
	  this.hub = signalHub('plebland', ['http://' + SIGNALHUB_HOST + ':8080']);
	
	  this.network = this.setupNetwork();
	
	  this.hub.subscribe('server_' + this.id + '_ack').on('data', function (data) {
	    console.log("ClientEnv.hub.on'data' ", 'server_' + _this.id + '_ack', data);
	    _this.network.signal(data);
	  });
	};
	util.inherits(ClientEnv, BaseEnv);
	
	ClientEnv.prototype.serverConnect = function (data) {
	  this.serverDataHandler(this, data);
	};
	
	ClientEnv.prototype.serverUpdate = function (data) {
	  this.pendingServerUpdates.push(data);
	};
	
	ClientEnv.prototype.setupNetwork = function () {
	  var _this2 = this;
	
	  var stunServers = ['stun.l.google.com:19302', 'stun1.l.google.com:19302', 'stun2.l.google.com:19302', 'stun3.l.google.com:19302', 'stun4.l.google.com:19302', 'stun01.sipphone.com', 'stun.ekiga.net', 'stun.fwdnet.net', 'stun.ideasip.com', 'stun.iptel.org', 'stun.rixtelecom.se', 'stun.schlund.de', 'stunserver.org', 'stun.softjoys.com', 'stun.voiparound.com', 'stun.voipbuster.com', 'stun.voipstunt.com', 'stun.voxgratia.org', 'stun.xten.com'];
	
	  console.log('ClientEnv.setupNetwork ', this.id, "seeting up network");
	  var client = new SimplePeer({
	    initiator: true,
	    trickle: true,
	    channelConfig: {
	      ordered: false,
	      maxRetransmits: 0
	    },
	    config: {
	      iceServers: [{
	        url: 'turn:numb.viagenie.ca',
	        credential: 'muazkh',
	        username: 'webrtc@live.com'
	      }, {
	        url: 'turn:192.158.29.39:3478?transport=udp',
	        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
	        username: '28224511:1379330808'
	      }, {
	        url: 'turn:192.158.29.39:3478?transport=tcp',
	        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
	        username: '28224511:1379330808'
	      }].concat(_.map(stunServers, function (server) {
	        return { url: "stun:" + server };
	      }))
	    }
	
	  });
	
	  client.requestID = 0;
	
	  client.on('signal', function (data) {
	    console.log("ClientEnv.client.on'signal' ", _this2.id, data);
	    console.log("ClientEnv.hub.broadcast'client_offer'", _this2.id, data);
	    _this2.hub.broadcast('client_offer', { id: _this2.id, offer: data });
	  });
	
	  client.on('connect', function () {
	    console.log("ClientEnv.client.on'connect' ", this.id);
	    client.send('Hello server from  client1');
	  });
	
	  var incomingLength = 0;
	  var inProgressBuffer = new Buffer(0);
	  client.on('data', function (data) {
	    //handle partial inProgressBuffers
	    if (data.constructor.name === 'Buffer') {
	      var headSeperator = "kjz:\n";
	      var headSeperatorIndex = data.indexOf(headSeperator);
	
	      //if we found a header this is the start of a new inProgressBuffer;
	      if (headSeperatorIndex > 0) {
	        //inflator = new pako.Inflate();
	
	        incomingLength = parseInt(data.slice(0, headSeperatorIndex).toString(), 10);
	        inProgressBuffer = Buffer.concat([inProgressBuffer, data.slice(headSeperatorIndex + headSeperator.length, data.length)]);
	      } else if (incomingLength && inProgressBuffer.length < incomingLength) {
	        //todo streaming inflation here
	        inProgressBuffer = Buffer.concat([inProgressBuffer, data]);
	      }
	
	      //sucessful end reached
	      if (inProgressBuffer.length >= incomingLength) {
	        var payload = JSON.parse(pako.inflate(inProgressBuffer, { to: "string" }));
	        incomingLength = 0;
	        inProgressBuffer = new Buffer(0);
	
	        if (payload.eventName) {
	          _this2[payload.eventName].call(_this2, payload.eventData);
	        }
	      }
	    }
	  });
	
	  client.on('close', function () {
	    console.log("server connection closed");
	  });
	
	  client.on('finish', function () {
	    console.log("server connection finished");
	  });
	
	  client.on('end', function () {
	    console.log("server connection end");
	    _this2.network = _this2.setupNetwork();
	  });
	
	  client.on('error', function (err) {
	    console.log("peer error", err);
	  });
	
	  return client;
	};
	
	ClientEnv.prototype.serverDataHandler = function (props, worldState) {
	  var entityNames = _.keys(worldState.entities);
	  entityNames.push('Tree');
	  entityNames.push('Guy');
	  entityNames.push('MechSniper');
	  this.loadEntityMeshes(entityNames, this.setupScene.bind(this, props, worldState));
	};
	
	ClientEnv.prototype.worldSetup = function (props, worldState) {
	  ClientEnv.super_.prototype.worldSetup.apply(this, [props, worldState]);
	};
	
	ClientEnv.prototype.initHandler = function () {
	  var renderElement = this.render_container || document;
	  this.displayWidth = this.render_container.clientWidth;
	  this.displayHeight = this.render_container.clientHeight;
	  this.aspect = this.displayWidth / this.displayHeight;
	
	  this.camera = new THREE.PerspectiveCamera(this.viewAngle, this.aspect, this.near, this.far);
	
	  this.renderer = new THREE.WebGLRenderer({ antialias: true });
	  this.renderer.setSize(this.displayWidth, this.displayHeight);
	  this.renderer.shadowMapEnabled = true;
	  this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
	
	  this.render_container.appendChild(this.renderer.domElement);
	
	  // var captureInput = document.createElement('input');
	  // captureInput.type = "text";
	  // captureInput.className = "capture-input";
	  // this.render_container.appendChild(captureInput);
	
	  THREEx.WindowResize(this.renderer, this.camera);
	  this.initPlayerCamera();
	
	  // Init lights
	  this.setLights();
	
	  this.fogColor = 0xeddeab;
	  this.clearColor = 0xeddeab;
	  this.scene.fog = new THREE.Fog(this.fogColor, 40, 60);
	  this.renderer.setClearColor(this.clearColor, 1);
	
	  if (this.debug) {
	    this.initStats();
	  }
	
	  ClientEnv.super_.prototype.initHandler.call(this);
	};
	
	ClientEnv.prototype.setupScene = function (props, worldState, err, entityMeshes) {
	  worldState.entityMeshes = entityMeshes;
	  this.worldSetup(props, Immutable.fromJS(worldState));
	  this.playerEntity = this.world.entities[this.id];
	  this.initHandler();
	};
	
	ClientEnv.prototype.serverUpdateEntityIterator = function (entityData, index) {
	  if (!entityData) {
	    return;
	  }
	
	  var entityType = entityData.type;
	  var entRef = this.world.entities[entityData.id];
	
	  if (typeof entRef === 'undefined' && !entityData.REMOVE) {
	
	    if (entityType === 'player') {
	      entRef = this.world.addPlayer(entityData);
	    } else {
	      if (entityData.ownerId === this.id) {
	        return;
	      }
	      entRef = this.world.initEntityInstance(entityType, entityType, Immutable.fromJS(entityData));
	    }
	
	    this.scene.add(entRef.mesh);
	    return;
	  } else if (entRef && entityData.REMOVE) {
	    this.scene.remove(entRef);
	    delete this.world.entities[entityData.id]; // = null;
	    return;
	  }
	
	  if (entityData.id === this.id) {
	    // console.log(oldestUpdate);
	    // _.each(this.inputCapture.commandHistory, (command) => {
	
	    // });
	  } else if (entRef) {
	      entRef.mesh.position.set.apply(entRef.mesh.position, entityData.position);
	      entRef.mesh.quaternion.set.apply(entRef.mesh.quaternion, entityData.quaternion);
	    }
	};
	
	ClientEnv.prototype.handlePendingServerUpdates = function (dt) {
	  if (!this.pendingServerUpdates.length) {
	    return;
	  }
	  var oldestUpdate = this.pendingServerUpdates.shift();
	  _.each(oldestUpdate.entityData, this.serverUpdateEntityIterator.bind(this));
	
	  // this.world.entities = _.filter(this.world.entities, (entity) => {
	  //   return !!entity
	  // });
	};
	
	ClientEnv.prototype.update = function (dt) {
	  this.inputCapture.update(dt);
	  this.handlePendingServerUpdates(dt);
	  ClientEnv.super_.prototype.update.apply(this, arguments);
	};
	
	ClientEnv.prototype.initPlayerCamera = function () {
	  var player_entity = this.playerEntity;
	  player_entity.camera_obj = new THREE.Object3D();
	  player_entity.mesh.add(player_entity.camera_obj);
	  player_entity.camera_obj.add(this.camera);
	  player_entity.attached_camera = 1;
	  this.camera.position.set(0, 15, 7);
	  this.camera.rotation.set(-Math.PI / 2.6, 0, Math.PI);
	  this.inputCapture = new DesktopInputManager({
	    network: this.network,
	    render_container: this.render_container,
	    player_entity: player_entity,
	    client_id: this.id
	  });
	};
	
	module.exports = ClientEnv;

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("lodash");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("util");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("immutable");

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("simple-peer");

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("pako");

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var THREE = __webpack_require__(2);
	
	/**
	 * @author WestLangley / http://github.com/WestLangley
	 */
	
	// a helper to show the world-axis-aligned bounding box for an object
	
	THREE.BoundingBoxHelper = function (object, hex) {
	
	    var color = hex !== undefined ? hex : 0x888888;
	
	    this.object = object;
	
	    this.box = new THREE.Box3();
	
	    THREE.Mesh.call(this, new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: color, wireframe: true }));
	};
	
	THREE.BoundingBoxHelper.prototype = Object.create(THREE.Mesh.prototype);
	THREE.BoundingBoxHelper.prototype.constructor = THREE.BoundingBoxHelper;
	
	THREE.BoundingBoxHelper.prototype.update = function () {
	
	    this.box.setFromObject(this.object);
	
	    this.box.size(this.scale);
	
	    this.box.center(this.position);
	};
	
	/**
	 * THREE.TargetCamera.js 1.1.0
	 * (c) 2013 Luke Moody (http://www.github.com/squarefeet)
	 *
	 * THREE.TargetCamera may be freely distributed under the MIT license
	 *  (See the LICENSE file at root of this repository.)
	 */
	THREE.TargetCamera = function (a, b, c, d) {
	    THREE.PerspectiveCamera.call(this), this.fov = void 0 !== a ? a : 50, this.aspect = void 0 !== b ? b : 1, this.near = void 0 !== c ? c : .1, this.far = void 0 !== d ? d : 2e3, this.targets = {}, this.targetOrder = [], this.currentTargetName = null, this._idealObject = new THREE.Object3D(), this._isTransitioning = !1, this._defaults = { name: null, targetObject: new THREE.Object3D(), cameraPosition: new THREE.Vector3(0, 30, 50), cameraRotation: void 0, fixed: !1, stiffness: .4, matchRotation: !0 }, this.updateProjectionMatrix();
	}, THREE.TargetCamera.prototype = Object.create(THREE.PerspectiveCamera.prototype), THREE.TargetCamera.prototype._translateIdealObject = function (a) {
	    var b = this._idealObject;0 !== a.x && b.translateX(a.x), 0 !== a.y && b.translateY(a.y), 0 !== a.z && b.translateZ(a.z);
	}, THREE.TargetCamera.prototype._createNewTarget = function () {
	    var a = this._defaults;return { name: a.name, targetObject: a.targetObject, cameraPosition: a.cameraPosition, cameraRotation: a.cameraRotation, fixed: a.fixed, stiffness: a.stiffness, matchRotation: a.matchRotation };
	}, THREE.TargetCamera.prototype._determineCameraRotation = function (a) {
	    return a instanceof THREE.Euler ? new THREE.Quaternion().setFromEuler(a) : a instanceof THREE.Quaternion ? a : void 0;
	}, THREE.TargetCamera.prototype.addTarget = function (a) {
	    var b = this._createNewTarget();if ("object" == typeof a) for (var c in a) b.hasOwnProperty(c) && ("cameraRotation" === c ? b[c] = this._determineCameraRotation(a[c]) : b[c] = a[c]);this.targets[a.name] = b, this.targetOrder.push(a.name);
	}, THREE.TargetCamera.prototype.setTarget = function (a) {
	    this.targets.hasOwnProperty(a) ? this.currentTargetName = a : console.warn("THREE.TargetCamera.setTarget: No target with name " + a);
	}, THREE.TargetCamera.prototype.removeTarget = function (a, b) {
	    var c = this.targets,
	        d = this.targetOrder;return 1 === d.length ? void console.warn("THREE.TargetCamera: Will not remove only existing camera target.") : (c.hasOwnProperty(a) && (d.splice(d.indexOf(a), 1), c[a] = null), void this.setTarget(b && c.hasOwnProperty(b) ? b : d[d.length - 1]));
	}, THREE.TargetCamera.prototype.update = function (a) {
	    var b = this.targets[this.currentTargetName],
	        c = this._idealObject;b && (b.fixed ? (this.position.copy(b.cameraPosition), this.lookAt(b.targetObject.position)) : (c.position.copy(b.targetObject.position), c.quaternion.copy(b.targetObject.quaternion), void 0 !== b.cameraRotation && c.quaternion.multiply(b.cameraRotation), this._translateIdealObject(b.cameraPosition), this.position.lerp(c.position, b.stiffness), b.matchRotation ? this.quaternion.slerp(c.quaternion, b.stiffness) : this.lookAt(b.targetObject.position)));
	};
	
	/**
	 * @author mrdoob / http://mrdoob.com/
	 * @author alteredq / http://alteredqualia.com/
	 * @author paulirish / http://paulirish.com/
	 */
	
	THREE.FirstPersonControls = function (object, inputCapture, domElement) {
	    this.object = object;
	    this.target = new THREE.Vector3(0, 0, 0);
	
	    this.domElement = domElement !== undefined ? domElement : document;
	
	    this.inputCapture = inputCapture !== undefined ? inputCapture : window;
	
	    this.enabled = true;
	
	    this.movementSpeed = 1.0;
	    this.lookSpeed = 0.005;
	
	    this.lookVertical = true;
	    this.autoForward = false;
	
	    this.activeLook = true;
	
	    this.heightSpeed = false;
	    this.heightCoef = 1.0;
	    this.heightMin = 0.0;
	    this.heightMax = 1.0;
	
	    this.constrainVertical = false;
	    this.verticalMin = 0;
	    this.verticalMax = Math.PI;
	
	    this.autoSpeedFactor = 0.0;
	
	    this.mouseX = 0;
	    this.mouseY = 0;
	
	    this.lat = 0;
	    this.lon = 0;
	    this.phi = 0;
	    this.theta = 0;
	
	    this.moveForward = false;
	    this.moveBackward = false;
	    this.moveLeft = false;
	    this.moveRight = false;
	
	    this.mouseDragOn = false;
	
	    this.viewHalfX = 0;
	    this.viewHalfY = 0;
	
	    if (this.domElement !== document) {
	
	        this.domElement.setAttribute('tabindex', -1);
	    }
	
	    //
	
	    this.handleResize = function () {
	
	        if (this.domElement === document) {
	
	            this.viewHalfX = window.innerWidth / 2;
	            this.viewHalfY = window.innerHeight / 2;
	        } else {
	
	            this.viewHalfX = this.domElement.offsetWidth / 2;
	            this.viewHalfY = this.domElement.offsetHeight / 2;
	        }
	    };
	
	    this.onMouseDown = function (event) {
	
	        if (this.domElement !== document) {
	
	            this.domElement.focus();
	        }
	
	        event.preventDefault();
	        event.stopPropagation();
	
	        if (this.activeLook) {
	
	            switch (event.button) {
	
	                case 0:
	                    this.moveForward = true;break;
	                case 2:
	                    this.moveBackward = true;break;
	
	            }
	        }
	
	        this.mouseDragOn = true;
	    };
	
	    this.onMouseUp = function (event) {
	
	        event.preventDefault();
	        event.stopPropagation();
	
	        if (this.activeLook) {
	
	            switch (event.button) {
	
	                case 0:
	                    this.moveForward = false;break;
	                case 2:
	                    this.moveBackward = false;break;
	
	            }
	        }
	
	        this.mouseDragOn = false;
	    };
	
	    this.onMouseMove = function (event) {
	
	        if (this.domElement === document) {
	
	            this.mouseX = event.pageX - this.viewHalfX;
	            this.mouseY = event.pageY - this.viewHalfY;
	        } else {
	
	            this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
	            this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;
	        }
	    };
	
	    this.onKeyDown = function (event) {
	        //event.preventDefault();
	
	        switch (event.keyCode) {
	
	            case 38: /*up*/
	            case 87:
	                /*W*/this.moveForward = true;break;
	
	            case 37: /*left*/
	            case 65:
	                /*A*/this.moveLeft = true;break;
	
	            case 40: /*down*/
	            case 83:
	                /*S*/this.moveBackward = true;break;
	
	            case 39: /*right*/
	            case 68:
	                /*D*/this.moveRight = true;break;
	
	            case 82:
	                /*R*/this.moveUp = true;break;
	            case 70:
	                /*F*/this.moveDown = true;break;
	
	        }
	    };
	
	    this.onKeyUp = function (event) {
	        switch (event.keyCode) {
	
	            case 38: /*up*/
	            case 87:
	                /*W*/this.moveForward = false;break;
	
	            case 37: /*left*/
	            case 65:
	                /*A*/this.moveLeft = false;break;
	
	            case 40: /*down*/
	            case 83:
	                /*S*/this.moveBackward = false;break;
	
	            case 39: /*right*/
	            case 68:
	                /*D*/this.moveRight = false;break;
	
	            case 82:
	                /*R*/this.moveUp = false;break;
	            case 70:
	                /*F*/this.moveDown = false;break;
	
	        }
	    };
	
	    this.update = function (delta) {
	        if (this.enabled === false) return;
	
	        if (this.heightSpeed) {
	
	            var y = THREE.Math.clamp(this.object.position.y, this.heightMin, this.heightMax);
	            var heightDelta = y - this.heightMin;
	
	            this.autoSpeedFactor = delta * (heightDelta * this.heightCoef);
	        } else {
	
	            this.autoSpeedFactor = 0.0;
	        }
	
	        var actualMoveSpeed = delta * this.movementSpeed;
	
	        if (this.moveForward || this.autoForward && !this.moveBackward) this.object.translateZ(-(actualMoveSpeed + this.autoSpeedFactor));
	        if (this.moveBackward) this.object.translateZ(actualMoveSpeed);
	
	        if (this.moveLeft) this.object.translateX(-actualMoveSpeed);
	        if (this.moveRight) this.object.translateX(actualMoveSpeed);
	
	        if (this.moveUp) this.object.translateY(actualMoveSpeed);
	        if (this.moveDown) this.object.translateY(-actualMoveSpeed);
	
	        var actualLookSpeed = delta * this.lookSpeed;
	
	        if (!this.activeLook) {
	
	            actualLookSpeed = 0;
	        }
	
	        var verticalLookRatio = 1;
	
	        if (this.constrainVertical) {
	
	            verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin);
	        }
	
	        this.lon += this.mouseX * actualLookSpeed;
	        if (this.lookVertical) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;
	
	        this.lat = Math.max(-85, Math.min(85, this.lat));
	        this.phi = THREE.Math.degToRad(90 - this.lat);
	
	        this.theta = THREE.Math.degToRad(this.lon);
	
	        if (this.constrainVertical) {
	
	            this.phi = THREE.Math.mapLinear(this.phi, 0, Math.PI, this.verticalMin, this.verticalMax);
	        }
	
	        var targetPosition = this.target,
	            position = this.object.position;
	
	        targetPosition.x = position.x + 100 * Math.sin(this.phi) * Math.cos(this.theta);
	        targetPosition.y = position.y + 100 * Math.cos(this.phi);
	        targetPosition.z = position.z + 100 * Math.sin(this.phi) * Math.sin(this.theta);
	
	        this.object.lookAt(targetPosition);
	    };
	
	    function contextmenu(event) {
	
	        event.preventDefault();
	    }
	
	    this.dispose = function () {
	
	        this.domElement.removeEventListener('contextmenu', contextmenu, false);
	        this.domElement.removeEventListener('mousedown', _onMouseDown, false);
	        this.domElement.removeEventListener('mousemove', _onMouseMove, false);
	        this.domElement.removeEventListener('mouseup', _onMouseUp, false);
	
	        this.inputCapture.removeEventListener('keydown', _onKeyDown, false);
	        this.inputCapture.removeEventListener('keyup', _onKeyUp, false);
	    };
	
	    var _onMouseMove = bind(this, this.onMouseMove);
	    var _onMouseDown = bind(this, this.onMouseDown);
	    var _onMouseUp = bind(this, this.onMouseUp);
	    var _onKeyDown = bind(this, this.onKeyDown);
	    var _onKeyUp = bind(this, this.onKeyUp);
	
	    this.domElement.addEventListener('contextmenu', contextmenu, false);
	    this.domElement.addEventListener('mousemove', _onMouseMove, false);
	    this.domElement.addEventListener('mousedown', _onMouseDown, false);
	    this.domElement.addEventListener('mouseup', _onMouseUp, false);
	
	    this.inputCapture.addEventListener('keydown', _onKeyDown, false);
	    this.inputCapture.addEventListener('keyup', _onKeyUp, false);
	
	    function bind(scope, fn) {
	
	        return function () {
	
	            fn.apply(scope, arguments);
	        };
	    }
	
	    this.handleResize();
	};
	
	module.exports = THREE;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	var async = __webpack_require__(11);
	var EventEmitter = __webpack_require__(12);
	var util = __webpack_require__(5);
	var GameLoop = __webpack_require__(13);
	var _ = __webpack_require__(4);
	var THREE = __webpack_require__(9);
	var World = __webpack_require__(14);
	var Vox = __webpack_require__(26);
	
	function BaseEnv(props) {
	  this.viewAngle = 40;
	  this.near = 1;
	  Object.assign(this, props);
	  EventEmitter.call(this);
	  this.on('init', this.initHandler.bind(this));
	};
	util.inherits(BaseEnv, EventEmitter);
	
	BaseEnv.prototype.initHandler = function () {
	  this.loop = new GameLoop({
	    update: this.update.bind(this),
	    render: this.render.bind(this)
	  });
	
	  this.loop.start();
	};
	
	BaseEnv.prototype.setLights = function () {
	  console.log("Initiate lights...");
	  var ambientLight = new THREE.AmbientLight(0x000033);
	  this.scene.add(ambientLight);
	
	  var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.9);
	  hemiLight.color.setHSL(0.6, 1, 0.6);
	  hemiLight.groundColor.setHSL(0.095, 1, 0.75);
	  hemiLight.position.set(0, 500, 0);
	  this.scene.add(hemiLight);
	
	  var dirLight = new THREE.DirectionalLight(0xffffff, 1);
	  dirLight.color.setHSL(0.1, 1, 0.95);
	  dirLight.position.set(10, 10.75, 10);
	  dirLight.position.multiplyScalar(10);
	  this.scene.add(dirLight);
	
	  dirLight.castShadow = true;
	
	  dirLight.shadowMapWidth = 2048;
	  dirLight.shadowMapHeight = 2048;
	
	  var d = 150;
	
	  dirLight.shadowCameraLeft = -d;
	  dirLight.shadowCameraRight = d;
	  dirLight.shadowCamefraTop = d;
	  dirLight.shadowCameraBottom = -d;
	
	  dirLight.shadowCameraFar = 3500;
	  dirLight.shadowBias = -0.0001;
	  dirLight.shadowDarkness = 0.45;
	};
	
	BaseEnv.prototype.initStats = function () {
	  var stats = {
	    begin: function begin() {},
	    end: function end() {}
	  };
	
	  stats = new Stats();
	  stats.setMode(0);
	  stats.domElement.style.position = 'absolute';
	  stats.domElement.style.left = '0px';
	  stats.domElement.style.top = '0px';
	  this.render_container.appendChild(stats.domElement);
	
	  this.stats = stats;
	};
	
	BaseEnv.prototype.worldSetup = function (props, worldState) {
	  this.world = new World(Object.assign({}, { worldState: worldState }, props));
	  if (this.debug) {
	    window.world = this.world;
	  }
	};
	
	BaseEnv.prototype.loadVoxFile = function (entity_name, callback) {
	  console.log("loading vox file", entity_name);
	  var vox = new Vox({
	    filename: entity_name + ".vox",
	    name: entity_name,
	    environment: this.environment,
	    world: this.world
	  });
	
	  vox.LoadModel(function (vox, name) {
	    console.log("loaded mesh", name);
	    callback(null, _defineProperty({}, name, vox));
	  });
	};
	
	/*
	*
	* entitiyNames -> ['Guy', 'Tree']
	* callback -> function({Guy: vox, Tree: vox})
	*/
	BaseEnv.prototype.loadEntityMeshes = function (entityNames, callback) {
	  function mergeMeshes(err, entity_meshes) {
	    var reducedMeshes = _.reduce(entity_meshes, function (total, mesh) {
	      return Object.assign(total, mesh);
	    });
	    callback(null, reducedMeshes);
	  }
	
	  async.map(entityNames, this.loadVoxFile.bind(this), mergeMeshes);
	};
	
	BaseEnv.prototype.assignEntityMeshes = function (entityData, entityMeshes) {
	  var entityInstancesAndMeshes = {};
	  _.each(_.keys(entityMeshes), function (entity_type) {
	    if (entityData[entity_type]) {
	      entityInstancesAndMeshes[entity_type] = {
	        mesh: entityMeshes[entity_type],
	        instances: entityData[entity_type]
	      };
	    }
	  });
	
	  return entityInstancesAndMeshes;
	};
	
	BaseEnv.prototype.update = function (dt, elapsed) {
	  if (this.stats) {
	    this.stats.begin();
	  }
	
	  this.world.update.call(this.world, dt, this.update_tick);
	  this.update_tick++;
	};
	
	BaseEnv.prototype.render = function () {
	  this.renderer.render(this.scene, this.camera);
	  this.render_tick++;
	
	  if (this.stats) {
	    this.stats.end();
	  }
	};
	
	module.exports = BaseEnv;

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("async");

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = require("events");

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = require("fixed-game-loop");

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var _ = __webpack_require__(4);
	var async = __webpack_require__(11);
	var ChunkManager = __webpack_require__(15);
	var VoxLoader = __webpack_require__(24);
	var Vox = __webpack_require__(26);
	var EntityClasses = __webpack_require__(29);
	var THREE = __webpack_require__(2);
	var Immutable = __webpack_require__(6);
	var Water = __webpack_require__(45);
	var PhysBlockPool = __webpack_require__(47);
	
	function World(props) {
	  this.entities = {};
	  this.chunkSize = 16;
	  Object.assign(this, props);
	
	  this.buildTerrain(this.worldState.get('blockSize'), this.scene, this.worldState.get('terrain'));
	
	  this.water = new Water({
	    environment: this.environment
	  });
	  this.water.Create(this.scene);
	
	  this.importEntities(this.worldState.get('entityData'));
	
	  if (this.render_container) {
	    this.blockPool = new PhysBlockPool({
	      scene: this.scene,
	      world: this
	    }).Create(500);
	  }
	};
	
	World.prototype.buildTerrain = function (blockSize, scene, terrainChunkJSON) {
	  var chunkManager = new ChunkManager({
	    blockSize: blockSize,
	    scene: scene,
	    world: this
	  });
	
	  this.chunkManager = chunkManager;
	
	  //chunkManager.processChunkList(terrainChunkJSON);
	  var wm = this.worldState.get('worldMap').toJS();
	  _.each(wm, function (ZList, XCoord) {
	    _.each(ZList, function (chunkObj, ZCoord) {
	      chunkManager.createChunkFromData.call(chunkManager, Immutable.fromJS(chunkObj));
	    });
	  });
	  chunkManager.BuildAllChunks(chunkManager.worldChunks);
	};
	
	World.prototype.initEntityType = function (entityData) {
	  if (!entityData) {
	    return;
	  }
	  this.initEntityInstance(entityData.get('type'), entityData.get('type'), entityData);
	};
	
	World.prototype.initEntityInstance = function (entityClassName, entityModelName, entityProps) {
	  if (entityModelName === 'player') {
	    entityModelName = 'Guy';
	  }
	
	  if (entityModelName === 'Bullet') {
	    entityModelName = null;
	  }
	
	  var props = entityProps.toJS();
	  if (props.REMOVE) {
	    return;
	  }
	
	  props.render_container = this.render_container;
	  props.chunkManager = this.chunkManager;
	  props.world = this;
	  props.scene = this.scene;
	  props.type = entityClassName;
	
	  if (entityModelName) {
	    props.vox = this.worldState.get('entityMeshes').get(entityModelName);
	  }
	
	  if (!entityModelName) {
	    var geo = new THREE.BoxGeometry(1, 1, 1);
	    var mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
	    props.mesh = new THREE.Mesh(geo, mat);
	  }
	
	  var ent = new EntityClasses[entityClassName](props);
	  ent.scene = this.scene;
	  this.registerEntity(ent, entityClassName);
	  return ent;
	};
	
	World.prototype.addPlayer = function (playerData) {
	  return this.initEntityInstance('player', 'Guy', Immutable.fromJS(playerData));
	};
	
	World.prototype.importEntities = function (entity_map) {
	  //  const entity_iterator = entity_map.entries();
	  entity_map.forEach(this.initEntityType.bind(this));
	};
	
	World.prototype.registerEntity = function (entity, entity_type) {
	  this.scene.add(entity.mesh);
	
	  if (entity.bbox) {
	    this.scene.add(entity.bbox);
	  }
	
	  this.entities[entity.id] = entity;
	};
	
	//Primarily used on server?
	World.prototype.exportEntities = function () {
	  var ret = {};
	  _.each(this.entities, function (entity, id) {
	    ret[id] = entity['export']();
	  });
	  return ret;
	};
	
	World.prototype['export'] = function () {
	  return {
	    /*
	    * chunkManger.export provides a more compact data structure for terrain
	    * none of the current import functions are setup to handle it
	    */
	    //terrain: this.chunkManager.export(),
	    worldMap: this.worldState.get('worldMap').toJS(),
	    entityData: this.exportEntities()
	  };
	};
	
	//blockSize: this.blockSize,   
	World.prototype.removeEntity = function (entityId) {
	  var entity = this.entities[entityId];
	  if (entity.bbox) {
	    entity.bbox.visible = false;
	  }
	  entity.mesh.visible = false;
	  entity.REMOVE = true;
	};
	
	World.prototype.update = function (delta, updateTick) {
	  //const invMaxFps = 1/60;
	  //THREE.AnimationHandler.update(invMaxFps);
	
	  //Redraw explode chunks here
	  this.chunkManager.Draw(updateTick, delta);
	
	  //this.water.Draw(updateTick / 5);
	
	  //update all non static entities here 
	  _.each(this.entities, function (entity) {
	    if (entity) {
	      entity.updateHandler(delta);
	    }
	  });
	
	  //update block particles
	  if (this.render_container) {
	    _.each(this.blockPool.blocks, function (physBlock) {
	      physBlock.Draw(Date.now(), delta);
	    });
	  }
	};
	
	module.exports = World;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var ChunkTerrain = __webpack_require__(16);
	var Immutable = __webpack_require__(6);
	var Buffer = __webpack_require__(20).Buffer;
	var _ = __webpack_require__(4);
	
	function ChunkManager(props) {
	    this.worldChunks = [];
	    this.totalBlocks = 0;
	    this.totalChunks = 0;
	    this.activeBlocks = 0;
	    this.activeTriangles = 0;
	    this.updateChunks = [];
	    this.maxChunks = 0;
	    this.blockSize = 0.5;
	    this.scene = null;
	    Object.assign(this, props);
	    this.worldMap = this.world.worldState.get('worldMap').toJS();
	};
	
	ChunkManager.prototype.processChunkList = function (chunkList) {
	    chunkList.forEach(this.createChunkFromData.bind(this));
	};
	
	ChunkManager.prototype.createChunkFromData = function (chunkData) {
	    var c = new ChunkTerrain({
	        scene: this.scene,
	        worldChunks: Immutable.fromJS(this.worldChunks)
	    });
	
	    c.Create(chunkData.get('posX'), chunkData.get('posY'), chunkData.get('mapData').toJS(), chunkData.get('id'));
	
	    this.AddTerrainChunk(c);
	};
	
	ChunkManager.prototype.AddTerrainChunk = function (chunk) {
	    this.totalChunks++;
	    this.totalBlocks += chunk.blocks.length * chunk.blocks.length * chunk.blocks.length;
	    this.activeBlocks += chunk.NoOfActiveBlocks();
	    this.worldChunks.push(chunk);
	};
	
	ChunkManager.prototype.BuildAllChunks = function (chunkList) {
	    _.each(chunkList, this.BuildAllChunksIterator.bind(this));
	    //this.AddTargets();
	    console.log("ACTIVE TRIANGLES: " + this.activeTriangles);
	    console.log("ACTIVE BLOCKS: " + this.activeBlocks);
	};
	
	ChunkManager.prototype.BuildAllChunksIterator = function (chunk) {
	    chunk.Rebuild();
	    this.activeTriangles += chunk.GetActiveTriangles();
	};
	
	ChunkManager.prototype.Draw = function (time, delta) {
	    if (this.updateChunks.length > 0) {
	        var cid = this.updateChunks.pop();
	        try {
	            this.worldChunks[cid].Rebuild();
	        } catch (ex) {
	            console.error("tried to rebuild missing chunk", cid, ex);
	        }
	    }
	};
	
	ChunkManager.prototype.Blood = function (x, z, power) {
	    var aChunks = [];
	    var aBlocksXZ = [];
	    var aBlocksZ = [];
	
	    x = Math.round(x);
	    z = Math.round(z);
	    var cid = 0;
	    var totals = 0;
	    var y = this.getHeight(x, z);
	    y = y / this.blockSize;
	    for (var rx = x + power; rx >= x - power; rx -= this.blockSize) {
	        for (var rz = z + power; rz >= z - power; rz -= this.blockSize) {
	            for (var ry = y + power; ry >= y - power; ry -= this.blockSize) {
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
	
	ChunkManager.prototype.explodeBombSmall = function (x, z) {
	    x = Math.round(x);
	    z = Math.round(z);
	    var y = this.getHeight(x, z);
	    y = Math.round(y / this.blockSize);
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
	        var block = this.world.blockPool.Get();
	        if (block != undefined) {
	            block.Create(x, y / 2, z, this.worldChunks[cid.id].blockSize / 2, this.worldChunks[cid.id].blocks[pos.x][pos.z][y].r, this.worldChunks[cid.id].blocks[pos.x][pos.z][y].g, this.worldChunks[cid.id].blocks[pos.x][pos.z][y].b, 2, Math.random() * 180, 2);
	        }
	    }
	};
	
	ChunkManager.prototype.explodeBomb = function (x, z, power, blood, iny) {
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
	        var y = this.getHeight(x, z);
	        y = Math.round(y / this.blockSize);
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
	    for (var rx = x + power; rx >= x - power; rx -= this.blockSize) {
	        for (var rz = z + power; rz >= z - power; rz -= this.blockSize) {
	            for (var ry = y + power; ry >= y - power; ry -= this.blockSize) {
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
	                                block = this.world.blockPool.Get();
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
	            crebuild[aChunks[i].id + Math.sqrt(this.worldMap.length)] = 0;
	        } else if (aBlocksY[i] == 0) {
	            crebuild[aChunks[i].id - Math.sqrt(this.worldMap.length)] = 0;
	        }
	
	        crebuild[aChunks[i].id] = 0;
	    }
	    for (var c in crebuild) {
	        this.updateChunks.push(c);
	    }
	};
	
	ChunkManager.prototype.AddTerrainChunk = function (chunk) {
	    this.totalChunks++;
	    this.totalBlocks += chunk.blocks.length * chunk.blocks.length * chunk.blocks.length;
	    this.activeBlocks += chunk.NoOfActiveBlocks();
	    this.worldChunks.push(chunk);
	};
	
	ChunkManager.prototype.BuildAllChunksIterator = function (chunk) {
	    chunk.Rebuild();
	    this.activeTriangles += chunk.GetActiveTriangles();
	};
	
	ChunkManager.prototype.BuildAllChunks = function (chunkList) {
	    _.each(chunkList, this.BuildAllChunksIterator.bind(this));
	    console.log("ACTIVE TRIANGLES: " + this.activeTriangles);
	    console.log("ACTIVE BLOCKS: " + this.activeBlocks);
	};
	
	ChunkManager.prototype.GetWorldChunkID = function (x, z) {
	    if (this.worldMap == undefined) {
	        return;
	    }
	
	    if (typeof this.blockSize == 'undefined') {
	        this.blockSize = 0.5;
	    }
	
	    var mp = this.world.chunkSize * this.blockSize;
	    var w_x = Math.floor(Math.abs(x) / mp);
	    var w_z = Math.floor(Math.abs(z) / mp);
	    if (this.worldMap[w_x] == undefined) {
	        return;
	    }
	    if (this.worldMap[w_x][w_z] == undefined) {
	        return;
	    }
	    var cid = this.worldMap[w_x][w_z];
	    return cid;
	};
	
	ChunkManager.prototype.GetChunk = function (x, z) {
	    var mp = this.world.chunkSize * this.blockSize;
	    var w_x = Math.floor(Math.abs(x) / mp);
	    var w_z = Math.floor(Math.abs(z) / mp);
	
	    if (this.worldMap[w_x][w_z] == undefined) {
	        return;
	    }
	    var cid = this.worldMap[w_x][w_z];
	    return this.worldChunks[cid.id];
	};
	
	ChunkManager.prototype.Translate = function (x, z, cid) {
	    var x1 = Math.round((z - this.worldChunks[cid.id].posX) / this.blockSize);
	    var z1 = Math.round((x - this.worldChunks[cid.id].posY) / this.blockSize);
	    x1 = Math.abs(x1 - 1);
	    z1 = Math.abs(z1 - 1);
	    return { x: x1, z: z1 };
	};
	
	ChunkManager.prototype.getHeight = function (x, z) {
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
	            var y = this.worldChunks[cid.id].blocks[x1][z1].height * this.blockSize;
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
	
	ChunkManager.prototype.cleanZ = function (blockMap, xIndex, yBlocks, zIndex) {
	    if (yBlocks.length) {
	        var yIndex = yBlocks.length - 1;
	        this.cleanY(blockMap, xIndex, zIndex, yBlocks[yIndex], yIndex);
	    }
	
	    //_.each(yBlocks, this.cleanY.bind(this, blockMap, xIndex, zIndex));
	};
	
	ChunkManager.prototype.cleanX = function (blockMap, zBlocks, xIndex) {
	    _.each(zBlocks, this.cleanZ.bind(this, blockMap, xIndex));
	};
	
	ChunkManager.prototype.cleanY = function (blockMap, xIndex, zIndex, block, yIndex) {
	    if (!block.isEmpty()) {
	        if (!blockMap[xIndex]) {
	            blockMap[xIndex] = {};
	        }
	
	        if (!blockMap[xIndex][zIndex]) {
	            blockMap[xIndex][zIndex] = {};
	        }
	
	        blockMap[xIndex][zIndex][yIndex] = block.clean();
	    }
	};
	
	ChunkManager.prototype.cleanBlocks = function (blocksX) {
	    var blockMap = {};
	    _.each(blocksX, this.cleanX.bind(this, blockMap));
	    return blockMap;
	};
	
	/*
	*
	* Creates a compact version of the terrain data in chunkManager
	* current world code is not setup to accept the compact version import
	*/
	ChunkManager.prototype['export'] = function () {
	    var _this = this;
	
	    var worldMap = {};
	
	    var chunkArray = _.each(this.worldChunks, function (chunk, index) {
	        var blocks = _this.cleanBlocks(chunk.blocks);
	
	        if (_.keys(blocks).length) {
	            worldMap[index] = [chunk.posX, chunk.posY, chunk.posZ, chunk.cid, blocks];
	        }
	    });
	
	    return worldMap;
	};
	
	module.exports = ChunkManager;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var util = __webpack_require__(5);
	var Chunk = __webpack_require__(17);
	var Block = __webpack_require__(18);
	var THREE = __webpack_require__(9);
	
	function ChunkTerrain(props) {
	    ChunkTerrain.super_.call(this);
	
	    this.wallHeight = 1;
	    this.worldWallHeight = 20; //wtf 
	    this.chunkSize = 16;
	    this.chunkSizeX = 16;
	    this.chunkSizeY = 16;
	    this.chunkSizeZ = 16;
	    this.blockSize = 0.5;
	
	    Object.assign(this, props);
	};
	util.inherits(ChunkTerrain, Chunk);
	
	ChunkTerrain.prototype.Create = function (posX, posY, mapData, id) {
	    this.cid = id;
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
	            this.wallHeight = mapData[x][y].a / this.worldWallHeight; // WTF
	            var v = 0;
	            for (var z = 0; z < this.chunkSize; z++) {
	                visible = false;
	
	                if (mapData[x][y].a > 0 && z <= this.wallHeight) {
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
	                this.blocks[x][y][z].Create(visible, mapData[x][y].r, mapData[x][y].g, mapData[x][y].b, mapData[x][y].a);
	            }
	        }
	    }
	};
	
	ChunkTerrain.prototype.Rebuild = function () {
	    var b = 0;
	    var vertices = [];
	    var colors = [];
	
	    // Reset merged blocks
	    for (var x = 0; x < this.chunkSize; x++) {
	        for (var y = 0; y < this.chunkSize; y++) {
	            for (var z = 0; z < this.chunkSizeZ; z++) {
	                this.blocks[x][y][z].dls = false;
	                this.blocks[x][y][z].dts = false;
	                this.blocks[x][y][z].dfs = false;
	                this.blocks[x][y][z].drs = false;
	                this.blocks[x][y][z].dbs = false;
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
	                        if (id >= 0 && id < this.worldChunks.size) {
	                            if (this.worldChunks.get(id).blocks[0][y][z] != null && this.worldChunks.get(id).blocks[0][y][z].isActive()) {
	                                if (this.blocks[x][y - 1][z].isActive() && this.blocks[x - 1][y][z].isActive() && this.blocks[x][y + 1][z].isActive() && this.blocks[x][y][z + 1].isActive()) {
	                                    continue;
	                                }
	                            }
	                        }
	                    }
	
	                    if (x == 0 && y < this.chunkSize - 1 && y > 0 && z < this.chunkSizeZ - 1) {
	                        var id = this.cid - 1;
	                        if (id >= 0 && id < this.worldChunks.size) {
	                            if (this.worldChunks.get(id).blocks[this.chunkSize - 1][y][z] != null && this.worldChunks.get(id).blocks[this.chunkSize - 1][y][z].isActive()) {
	                                if (this.blocks[x][y - 1][z].isActive() && this.blocks[x][y + 1][z].isActive() && this.blocks[x + 1][y][z].isActive() && this.blocks[x][y][z + 1].isActive()) {
	                                    continue;
	                                }
	                            }
	                        }
	                    }
	
	                    if (y == this.chunkSize - 1 && x < this.chunkSize - 1 && x > 0 && z < this.chunkSizeZ - 1) {
	                        var id = this.cid + Math.sqrt(this.worldChunks.size);
	                        if (id >= 0 && id < this.worldChunks.size) {
	                            if (this.worldChunks.get(id).blocks[x][0][z] != null && this.worldChunks.get(id).blocks[x][0][z].isActive()) {
	                                if (this.blocks[x - 1][y][z].isActive() && this.blocks[x + 1][y][z].isActive() && this.blocks[x][y - 1][z].isActive() && this.blocks[x][y][z + 1].isActive()) {
	                                    continue;
	                                }
	                            }
	                        }
	                    }
	
	                    if (y == 0 && x < this.chunkSize - 1 && x > 0 && z < this.chunkSizeZ - 1) {
	                        var id = this.cid - Math.sqrt(this.worldChunks.size);
	                        if (id >= 0 && id < this.worldChunks.size) {
	                            if (this.worldChunks.get(id).blocks[x][this.chunkSize - 1][z] != null && this.worldChunks.get(id).blocks[x][this.chunkSize - 1][z].isActive()) {
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
	                        if (id != -1 && this.worldChunks.get(id).blocks[this.chunkSize - 1][y][z] != null && //this.worldChunks.get(id).blocks[x][y][z].isActive() &&
	                        this.worldChunks.get(id).blocks[this.chunkSize - 1][y][z].drs) {
	                            drawBlock = false;
	                            this.blocks[x][y][z].dls = true;
	                        } else {
	                            drawBlock = true;
	                        }
	                    }
	
	                    if (drawBlock) {
	                        var countX = 0;
	                        var countY = 0;
	                        if (!this.blocks[x][y][z].dls) {
	                            for (var cx = 1; cx < this.chunkSize; cx++) {
	                                if (y + cx < this.chunkSize) {
	                                    if (this.blocks[x][y + cx][z].isActive() && !this.blocks[x][y + cx][z].dls && this.blocks[x][y + cx][z].r == this.blocks[x][y][z].r && this.blocks[x][y + cx][z].g == this.blocks[x][y][z].g && this.blocks[x][y + cx][z].b == this.blocks[x][y][z].b) {
	                                        countX++;
	                                        var tmpCountY = 0;
	                                        for (var cy = 1; cy < this.chunkSizeZ; cy++) {
	                                            if (z + cy < this.chunkSizeZ) {
	                                                if (this.blocks[x][y + cx][z + cy].isActive() && !this.blocks[x][y + cx][z + cy].dls && this.blocks[x][y + cx][z + cy].r == this.blocks[x][y][z].r && this.blocks[x][y + cx][z + cy].g == this.blocks[x][y][z].g && this.blocks[x][y + cx][z + cy].b == this.blocks[x][y][z].b) {
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
	                                    if (this.blocks[x][y + x1][z + y1].dls) {
	                                        countY = y1 - 1;
	                                    } else {
	                                        this.blocks[x][y + x1][z + y1].dls = true;
	                                    }
	                                }
	                            }
	                            this.blocks[x][y][z].dls = true;
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
	                        var id = this.cid - 1;
	                        if (this.worldChunks.get(id).blocks[0][y][z] != null && this.worldChunks.get(id).blocks[0][y][z].isActive() && !this.worldChunks.get(id).blocks[0][y][z].dls) {
	                            this.blocks[x][y][z].drs = true;
	                            drawBlock = false;
	                        } else {
	                            drawBlock = true;
	                        }
	                    }
	
	                    if (drawBlock) {
	                        var countX = 0;
	                        var countY = 0;
	                        if (!this.blocks[x][y][z].drs) {
	                            for (var cx = 1; cx < this.chunkSize; cx++) {
	                                if (y + cx < this.chunkSize) {
	                                    if (this.blocks[x][y + cx][z].isActive() && !this.blocks[x][y + cx][z].drs && this.blocks[x][y + cx][z].r == this.blocks[x][y][z].r && this.blocks[x][y + cx][z].g == this.blocks[x][y][z].g && this.blocks[x][y + cx][z].b == this.blocks[x][y][z].b) {
	                                        // Check how far we can draw other way
	                                        countX++;
	                                        var tmpCountY = 0;
	                                        for (var cy = 1; cy < this.chunkSizeZ; cy++) {
	                                            if (z + cy < this.chunkSizeZ) {
	                                                if (this.blocks[x][y + cx][z + cy].isActive() && !this.blocks[x][y + cx][z + cy].drs && this.blocks[x][y + cx][z + cy].r == this.blocks[x][y][z].r && this.blocks[x][y + cx][z + cy].g == this.blocks[x][y][z].g && this.blocks[x][y + cx][z + cy].b == this.blocks[x][y][z].b) {
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
	                                    if (this.blocks[x][y + x1][z + y1].drs) {
	                                        countY = y1 - 1;
	                                    } else {
	                                        this.blocks[x][y + x1][z + y1].drs = true;
	                                    }
	                                }
	                            }
	
	                            this.blocks[x][y][z].drs = true;
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
	                        if (!this.blocks[x][y][z].dfs) {
	                            for (var cx = 1; cx < this.chunkSize; cx++) {
	                                if (x + cx < this.chunkSize) {
	                                    if (this.blocks[x + cx][y][z].isActive() && !this.blocks[x + cx][y][z].dfs && this.blocks[x + cx][y][z].r == this.blocks[x][y][z].r && this.blocks[x + cx][y][z].g == this.blocks[x][y][z].g && this.blocks[x + cx][y][z].b == this.blocks[x][y][z].b) {
	                                        // Check how far we can draw other way
	                                        countX++;
	                                        var tmpCountY = 0;
	                                        for (var cy = 1; cy < this.chunkSizeZ; cy++) {
	                                            if (y + cy < this.chunkSizeZ) {
	                                                if (this.blocks[x + cx][y + cy][z].isActive() && !this.blocks[x + cx][y + cy][z].dfs && this.blocks[x + cx][y + cy][z].r == this.blocks[x][y][z].r && this.blocks[x + cx][y + cy][z].g == this.blocks[x][y][z].g && this.blocks[x + cx][y + cy][z].b == this.blocks[x][y][z].b) {
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
	                                    if (this.blocks[x + x1][y + y1][z].dfs) {
	                                        countY = y1 - 1;
	                                    } else {
	                                        this.blocks[x + x1][y + y1][z].dfs = true;
	                                    }
	                                }
	                            }
	                            this.blocks[x][y][z].dfs = true;
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
	                        var id = this.cid - Math.sqrt(this.worldChunks.size);
	                        if (id >= 0 && id < this.worldChunks.size) {
	                            if (this.worldChunks.get(id).blocks[x][this.chunkSize - 1][z] != null && this.worldChunks.get(id).blocks[x][this.chunkSize - 1][z].isActive()) {
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
	                        if (!this.blocks[x][y][z].dbs) {
	                            for (var cx = 1; cx < this.chunkSize; cx++) {
	                                if (x + cx < this.chunkSize) {
	                                    if (this.blocks[x + cx][y][z].isActive() && !this.blocks[x + cx][y][z].dbs && this.blocks[x + cx][y][z].r == this.blocks[x][y][z].r && this.blocks[x + cx][y][z].g == this.blocks[x][y][z].g && this.blocks[x + cx][y][z].b == this.blocks[x][y][z].b) {
	                                        countX++;
	                                        var tmpCountY = 0;
	                                        for (var cy = 1; cy < this.chunkSizeZ; cy++) {
	                                            if (z + cy < this.chunkSizeZ) {
	                                                if (this.blocks[x + cx][y][z + cy].isActive() && !this.blocks[x + cx][y][z + cy].dbs && this.blocks[x + cx][y][z + cy].r == this.blocks[x][y][z].r && this.blocks[x + cx][y][z + cy].g == this.blocks[x][y][z].g && this.blocks[x + cx][y][z + cy].b == this.blocks[x][y][z].b) {
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
	                                    if (this.blocks[x + x1][y][z + y1].dbs) {
	                                        countY = y1 - 1;
	                                    } else {
	                                        this.blocks[x + x1][y][z + y1].dbs = true;
	                                    }
	                                }
	                            }
	
	                            this.blocks[x][y][z].dbs = true;
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
	                        var id = this.cid + Math.sqrt(this.worldChunks.size);
	                        if (id >= 0 && id < this.worldChunks.size) {
	                            if (this.worldChunks.get(id).blocks[x][0][z] != null && this.worldChunks.get(id).blocks[x][0][z].isActive()) {
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
	                        if (!this.blocks[x][y][z].dts) {
	                            for (var cx = 1; cx < this.chunkSize; cx++) {
	                                if (x + cx < this.chunkSize) {
	                                    if (this.blocks[x + cx][y][z].isActive() && !this.blocks[x + cx][y][z].dts && this.blocks[x + cx][y][z].r == this.blocks[x][y][z].r && this.blocks[x + cx][y][z].g == this.blocks[x][y][z].g && this.blocks[x + cx][y][z].b == this.blocks[x][y][z].b) {
	                                        countX++;
	                                        var tmpCountY = 0;
	                                        for (var cy = 1; cy < this.chunkSizeZ; cy++) {
	                                            if (z + cy < this.chunkSizeZ) {
	                                                if (this.blocks[x + cx][y][z + cy].isActive() && !this.blocks[x + cx][y][z + cy].dts && this.blocks[x + cx][y][z + cy].r == this.blocks[x][y][z].r && this.blocks[x + cx][y][z + cy].g == this.blocks[x][y][z].g && this.blocks[x + cx][y][z + cy].b == this.blocks[x][y][z].b) {
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
	                                    if (this.blocks[x + x1][y][z + y1].dts) {
	                                        countY = y1 - 1;
	                                    } else {
	                                        this.blocks[x + x1][y][z + y1].dts = true;
	                                    }
	                                }
	                            }
	
	                            this.blocks[x][y][z].dts = true;
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
	        this.scene.remove(this.mesh);
	    }
	    this.scene.add(mesh);
	
	    mesh.that = this;
	    this.mesh = mesh;
	    this.activeTriangles = b;
	};
	
	module.exports = ChunkTerrain;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Block = __webpack_require__(18);
	var THREE = __webpack_require__(9);
	var Utils = __webpack_require__(19);
	
	function Chunk(props) {
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
	    this.world = null;
	
	    this.isBuilt = false;
	    this.avgHeight = 0;
	    Object.assign(this, props);
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
	
	Chunk.prototype.Explode = function (pos, scale, world) {
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
	                        block = world.blockPool.Get();
	
	                        if (block != undefined) {
	                            block.Create2(pos.x + this.blockSize * x / 2, pos.y + this.blockSize * y / 2, pos.z + this.blockSize * z / 2, (this.blockSize - Math.random() * this.blockSize / 2) * scale, this.blocks[x][y][z].r, this.blocks[x][y][z].g, this.blocks[x][y][z].b, 2, Math.random() * 180, 3);
	                        }
	                    }
	                }
	            }
	        }
	    }
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
	                this.blocks[x][y][z].dls = false;
	                this.blocks[x][y][z].dts = false;
	                this.blocks[x][y][z].dfs = false;
	                this.blocks[x][y][z].drs = false;
	                this.blocks[x][y][z].dbs = false;
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
	                        if (!this.blocks[x][y][z].dls) {
	                            for (var cx = 0; cx < this.chunkSizeY; cx++) {
	                                if (y + cx < this.chunkSizeY) {
	                                    if (this.blocks[x][y + cx][z].isActive() && !this.blocks[x][y + cx][z].dls && this.blocks[x][y + cx][z].r == this.blocks[x][y][z].r && this.blocks[x][y + cx][z].g == this.blocks[x][y][z].g && this.blocks[x][y + cx][z].b == this.blocks[x][y][z].b) {
	                                        countX++;
	                                        var tmpCountY = 0;
	                                        for (var cy = 0; cy < this.chunkSizeZ; cy++) {
	                                            if (z + cy < this.chunkSizeZ) {
	                                                if (this.blocks[x][y + cx][z + cy].isActive() && !this.blocks[x][y + cx][z + cy].dls && this.blocks[x][y + cx][z + cy].r == this.blocks[x][y][z].r && this.blocks[x][y + cx][z + cy].g == this.blocks[x][y][z].g && this.blocks[x][y + cx][z + cy].b == this.blocks[x][y][z].b) {
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
	                                    if (this.blocks[x][y + x1][z + y1].dls) {
	                                        //countY = y1-1;
	                                    } else {
	                                            this.blocks[x][y + x1][z + y1].dls = true;
	                                        }
	                                }
	                            }
	                            this.blocks[x][y][z].dls = true;
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
	                        if (!this.blocks[x][y][z].drs) {
	                            for (var cx = 0; cx < this.chunkSizeY; cx++) {
	                                if (y + cx < this.chunkSizeY) {
	                                    if (this.blocks[x][y + cx][z].isActive() && !this.blocks[x][y + cx][z].drs && this.blocks[x][y + cx][z].r == this.blocks[x][y][z].r && this.blocks[x][y + cx][z].g == this.blocks[x][y][z].g && this.blocks[x][y + cx][z].b == this.blocks[x][y][z].b) {
	                                        // Check how far we can draw other way
	                                        countX++;
	                                        var tmpCountY = 0;
	                                        for (var cy = 0; cy < this.chunkSizeZ; cy++) {
	                                            if (z + cy < this.chunkSizeZ) {
	                                                if (this.blocks[x][y + cx][z + cy].isActive() && !this.blocks[x][y + cx][z + cy].drs && this.blocks[x][y + cx][z + cy].r == this.blocks[x][y][z].r && this.blocks[x][y + cx][z + cy].g == this.blocks[x][y][z].g && this.blocks[x][y + cx][z + cy].b == this.blocks[x][y][z].b) {
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
	                                    if (this.blocks[x][y + x1][z + y1].drs) {
	                                        //   countY = y1-1;
	                                    } else {
	                                            this.blocks[x][y + x1][z + y1].drs = true;
	                                        }
	                                }
	                            }
	
	                            this.blocks[x][y][z].drs = true;
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
	                        if (!this.blocks[x][y][z].dfs) {
	                            for (var cx = 0; cx < this.chunkSizeX; cx++) {
	                                if (x + cx < this.chunkSizeX) {
	                                    if (this.blocks[x + cx][y][z].isActive() && !this.blocks[x + cx][y][z].dfs && this.blocks[x + cx][y][z].r == this.blocks[x][y][z].r && this.blocks[x + cx][y][z].g == this.blocks[x][y][z].g && this.blocks[x + cx][y][z].b == this.blocks[x][y][z].b) {
	                                        //this.blocks[x+cx][y][z].dfs = true;
	                                        // Check how far we can draw other way
	                                        countX++;
	                                        var tmpCountY = 0;
	                                        for (var cy = 0; cy < this.chunkSizeY; cy++) {
	                                            if (y + cy < this.chunkSizeY) {
	                                                if (this.blocks[x + cx][y + cy][z].isActive() && !this.blocks[x + cx][y + cy][z].dfs && this.blocks[x + cx][y + cy][z].r == this.blocks[x][y][z].r && this.blocks[x + cx][y + cy][z].g == this.blocks[x][y][z].g && this.blocks[x + cx][y + cy][z].b == this.blocks[x][y][z].b) {
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
	                                    if (this.blocks[x + x1][y + y1][z].dfs) {
	                                        //countY = y1-1;
	                                    } else {
	                                            this.blocks[x + x1][y + y1][z].dfs = true;
	                                        }
	                                }
	                            }
	                            this.blocks[x][y][z].dfs = true;
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
	                        if (!this.blocks[x][y][z].dts) {
	                            for (var cx = 0; cx < this.chunkSizeX; cx++) {
	                                if (x + cx < this.chunkSizeX) {
	                                    if (this.blocks[x + cx][y][z].isActive() && !this.blocks[x + cx][y][z].dts && this.blocks[x + cx][y][z].r == this.blocks[x][y][z].r && this.blocks[x + cx][y][z].g == this.blocks[x][y][z].g && this.blocks[x + cx][y][z].b == this.blocks[x][y][z].b) {
	                                        countX++;
	                                        var tmpCountY = 0;
	                                        for (var cy = 0; cy < this.chunkSizeZ; cy++) {
	                                            if (z + cy < this.chunkSizeZ) {
	                                                if (this.blocks[x + cx][y][z + cy].isActive() && !this.blocks[x + cx][y][z + cy].dts && this.blocks[x + cx][y][z + cy].r == this.blocks[x][y][z].r && this.blocks[x + cx][y][z + cy].g == this.blocks[x][y][z].g && this.blocks[x + cx][y][z + cy].b == this.blocks[x][y][z].b) {
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
	                                    if (this.blocks[x + x1][y][z + y1].dts) {
	                                        //  countY = y1-1;
	                                    } else {
	                                            this.blocks[x + x1][y][z + y1].dts = true;
	                                        }
	                                }
	                            }
	
	                            this.blocks[x][y][z].dts = true;
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
	                        if (!this.blocks[x][y][z].dbs) {
	                            for (var cx = 0; cx < this.chunkSizeX; cx++) {
	                                if (x + cx < this.chunkSizeX) {
	                                    if (this.blocks[x + cx][y][z].isActive() && !this.blocks[x + cx][y][z].dbs && this.blocks[x + cx][y][z].r == this.blocks[x][y][z].r && this.blocks[x + cx][y][z].g == this.blocks[x][y][z].g && this.blocks[x + cx][y][z].b == this.blocks[x][y][z].b) {
	                                        countX++;
	                                        var tmpCountY = 0;
	                                        for (var cy = 0; cy < this.chunkSizeZ; cy++) {
	                                            if (z + cy < this.chunkSizeZ) {
	                                                if (this.blocks[x + cx][y][z + cy].isActive() && !this.blocks[x + cx][y][z + cy].dbs && this.blocks[x + cx][y][z + cy].r == this.blocks[x][y][z].r && this.blocks[x + cx][y][z + cy].g == this.blocks[x][y][z].g && this.blocks[x + cx][y][z + cy].b == this.blocks[x][y][z].b) {
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
	                                    if (this.blocks[x + x1][y][z + y1].dbs) {
	                                        //  countY = y1-1;
	                                    } else {
	                                            this.blocks[x + x1][y][z + y1].dbs = true;
	                                        }
	                                }
	                            }
	
	                            this.blocks[x][y][z].dbs = true;
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
	    Utils.Log("VOX Model CREATED TRIANGLES: " + b);
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
	            }
	        }
	    }
	};
	
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
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(4);
	
	function rgb2hex(rgb) {
	    rgb = rgb.split(',');
	
	    function hex(x) {
	        return ("0" + parseInt(x).toString(16)).slice(-2);
	    }
	    return "#" + hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
	}
	
	function Block() {
	    this.on = false; //active
	    this.dls = false; //drawnLeftSide // Mark if it's drawn by different block
	    this.dts = false; //drawnTopSide
	    this.dfs = false; //drawnFrontSide
	    this.drs = false; //drawnRightSide
	    this.dbs = false; //drawnBottomSide
	    this.a = 0; //alpha
	    this.r = 0;
	    this.g = 0;
	    this.b = 0;
	};
	
	Block.prototype.Create = function (isActive, r, g, b, alpha) {
	    this.on = isActive;
	    this.a = alpha;
	    this.r = r;
	    this.g = g;
	    this.b = b;
	};
	
	Block.prototype.setActive = function (value) {
	    this.on = value;
	};
	
	Block.prototype.isActive = function () {
	    return this.on;
	};
	
	Block.prototype.isEmpty = function () {
	    return !this.on && !this.dls && !this.dts && !this.dfs && !this.dbs && !this.a && !this.r && !this.g && !this.b;
	};
	
	Block.prototype.clean = function () {
	    var _this = this;
	
	    var ret = [];
	    _.each(['on', 'dls', 'dts', 'dfs', 'drs', 'dbs', 'a', 'r', 'g', 'b'], function (key, index) {
	        if (_this[key]) {
	            ret[index] = _this[key];
	        }
	    });
	
	    return [this.a, rgb2hex([this.r, this.g, this.b].join(','))];
	
	    return ret;
	};
	
	module.exports = Block;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var THREE = __webpack_require__(9);
	
	var Utils = {
	    //KJZ deprecated use Object.rotateOnAxis
	    // Rotate an object around an arbitrary axis in object space
	    // rotateAroundObjectAxis: function(object, axis, radians) {
	    //     var rotObjectMatrix = new THREE.Matrix4();
	    //     rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
	    //     object.matrix.multiply(rotObjectMatrix);
	
	    //     object.rotation.setFromRotationMatrix(object.matrix);
	    // },
	
	    // Rotate an object around an arbitrary axis in world space      
	    rotateAroundWorldAxis: function rotateAroundWorldAxis(object, axis, radians) {
	        var rotWorldMatrix = new THREE.Matrix4();
	        rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
	        rotWorldMatrix.multiply(object.matrix); // pre-multiply
	        object.matrix = rotWorldMatrix;
	        object.rotation.setFromRotationMatrix(object.matrix);
	    },
	
	    GetDistance: function GetDistance(v1, v2) {
	        var dx = v1.x - v2.x;
	        var dy = v1.y - v2.y;
	        var dz = v1.z - v2.z;
	        return Math.sqrt(dx * dx + dy * dy + dz * dz);
	    },
	
	    UniqueArr: function UniqueArr(a) {
	        var temp = {};
	        for (var i = 0; i < a.length; i++) temp[a[i]] = true;
	        var r = [];
	        for (var k in temp) r.push(k);
	        return r;
	    },
	
	    timeStamp: function timeStamp() {
	        var now = new Date();
	        var date = [now.getMonth() + 1, now.getDate(), now.getFullYear()];
	        var time = [now.getHours(), now.getMinutes(), now.getSeconds()];
	        time[0] = time[0] < 12 ? time[0] : time[0] - 12;
	        time[0] = time[0] || 12;
	        for (var i = 1; i < 3; i++) {
	            if (time[i] < 10) {
	                time[i] = "0" + time[i];
	            }
	        }
	        return date.join("/") + " " + time.join(":");
	    },
	
	    Log: function Log(msg) {
	
	        if (typeof msg != 'object') {
	            console.log("[" + this.timeStamp() + "] " + msg);
	        } else {
	            console.log(msg);
	        }
	    },
	
	    MsgBoard: function MsgBoard(msg) {
	        $('#msgboard').fadeIn(1000);
	        $('#msgboard_msg').html("<font color='#FF0000'>" + msg + "</font>");
	        setTimeout(function () {
	            $('#msgboard').fadeOut(1000);
	        }, 2000);
	    },
	
	    // CreateBoundingBox2: function(obj) {
	    //     var object3D = obj.mesh;
	    //     var box = null;
	    //     object3D.geometry.computeBoundingBox();
	    //     box = geometry.boundingBox;
	
	    //     var x = box.max.x - box.min.x;
	    //     var y = box.max.y - box.min.y;
	    //     var z = box.max.z - box.min.z;
	
	    //     obj.bbox = box;
	
	    //     var bcube = new THREE.Mesh( new THREE.BoxGeometry( x, y, z ),
	    // 				new THREE.MeshNormalMaterial({ visible: false, wireframe: true, color: 0xAA3333}) );
	
	    //                 game.scene.add(bcube);
	    //     var bboxCenter = box.center();
	    //     bcube.translateX(bboxCenter.x);
	    //     bcube.translateY(bboxCenter.y);
	    //     bcube.translateZ(bboxCenter.z);
	    //     obj.bcube = bcube;
	    //     object3D.add(bcube);
	
	    //     bcube.that = obj.mesh.that;
	    // },
	
	    // CreateBoundingBox: function(obj) {
	    //     var object3D = obj.mesh;
	    //     var box = null;
	    //     object3D.traverse(function (obj3D) {
	    //         var geometry = obj3D.geometry;
	    //         if (geometry === undefined)  {
	    // 	    return;
	    // 	}
	    //         geometry.computeBoundingBox();
	    //         if (box === null) {
	    // 	    box = geometry.boundingBox;
	    //         } else {
	    // 	    box.union(geometry.boundingBox);
	    //         }
	    //     });
	
	    //     var x = box.max.x - box.min.x;
	    //     var y = box.max.y - box.min.y;
	    //     var z = box.max.z - box.min.z;
	
	    //     obj.bbox = box;
	
	    //     var bcube = new THREE.Mesh( new THREE.BoxGeometry( x, y, z ),
	    // 				new THREE.MeshNormalMaterial({ visible: false, wireframe: true, color: 0xAA3333}) );
	    //     var bboxCenter = box.center();
	    //     bcube.translateX(bboxCenter.x);
	    //     bcube.translateY(bboxCenter.y);
	    //     bcube.translateZ(bboxCenter.z);
	    //     obj.bcube = bcube;
	    //     object3D.add(bcube);
	
	    //     bcube.that = obj.mesh.that;
	
	    //     game.targets.push(bcube);
	    // },
	
	    rgbToHex: function rgbToHex(r, g, b) {
	        if (r < 0) r = 0;
	        if (g < 0) g = 0;
	        return "0x" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
	    },
	
	    rgbToHex2: function rgbToHex2(r, g, b) {
	        if (r < 0) r = 0;
	        if (g < 0) g = 0;
	        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
	    },
	
	    componentToHex: function componentToHex(c) {
	        var hex = c.toString(16);
	        return hex.length == 1 ? "0" + hex : hex;
	    },
	
	    // GetWorldYVector: function(vector) {
	    //     var world = game.terrain.GetNoise();
	    //     var x = Math.round(vector.x/10)+world.length/2;
	    //     var z = Math.round(vector.z/10)+world.length/2;
	    //     var y = 0;
	    //     if(x < world.length-1) {
	    // 	if(world[x] != undefined && z < world[x].length-1) {
	    // 	    y = world[x][z]*200;
	    // 	}
	    //     } else {
	    // 	y = 0;
	    //     }
	    //     return y;
	    // },
	
	    // GetWorldY: function(mesh) {
	    //     var world = game.terrain.GetNoise();
	    //     var x = Math.round(mesh.position.x/10)+world.length/2;
	    //     var z = Math.round(mesh.position.z/10)+world.length/2;
	    //     var y = 0;
	    //     if(x < world.length-1) {
	    // 	if(world[x] != undefined && z < world[x].length-1) {
	    // 	    y = world[x][z]*200;
	    // 	}
	    //     } else {
	    // 	y = 0;
	    //     }
	    //     return y;
	    // },
	
	    ReleasePointer: function ReleasePointer() {
	        var instructions = document.getElementsByTagName("body")[0];
	        instructions.removeEventListener('click', instrClick);
	        keys_enabled = 0;
	        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
	        document.exitPointerLock();
	    },
	
	    // http://www.html5rocks.com/en/tutorials/pointerlock/intro/
	    LockPointer: function LockPointer() {
	        var instructions = document.getElementsByTagName("body")[0];
	        instructions.addEventListener('click', this.instrClick, false);
	    },
	
	    instrClick: function instrClick(event) {
	        var element = document.body;
	        keys_enabled = 1;
	        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
	        element.requestPointerLock();
	    }
	};
	
	module.exports = Utils;

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */
	
	'use strict'
	
	var base64 = __webpack_require__(21)
	var ieee754 = __webpack_require__(22)
	var isArray = __webpack_require__(23)
	
	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192 // not used by this implementation
	
	var rootParent = {}
	
	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
	 *     on objects.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.
	
	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()
	
	function typedArraySupport () {
	  function Bar () {}
	  try {
	    var arr = new Uint8Array(1)
	    arr.foo = function () { return 42 }
	    arr.constructor = Bar
	    return arr.foo() === 42 && // typed array instances can be augmented
	        arr.constructor === Bar && // constructor can be set
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}
	
	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}
	
	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (arg) {
	  if (!(this instanceof Buffer)) {
	    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
	    if (arguments.length > 1) return new Buffer(arg, arguments[1])
	    return new Buffer(arg)
	  }
	
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    this.length = 0
	    this.parent = undefined
	  }
	
	  // Common case.
	  if (typeof arg === 'number') {
	    return fromNumber(this, arg)
	  }
	
	  // Slightly less common case.
	  if (typeof arg === 'string') {
	    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
	  }
	
	  // Unusual.
	  return fromObject(this, arg)
	}
	
	function fromNumber (that, length) {
	  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < length; i++) {
	      that[i] = 0
	    }
	  }
	  return that
	}
	
	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'
	
	  // Assumption: byteLength() return value is always < kMaxLength.
	  var length = byteLength(string, encoding) | 0
	  that = allocate(that, length)
	
	  that.write(string, encoding)
	  return that
	}
	
	function fromObject (that, object) {
	  if (Buffer.isBuffer(object)) return fromBuffer(that, object)
	
	  if (isArray(object)) return fromArray(that, object)
	
	  if (object == null) {
	    throw new TypeError('must start with number, buffer, array or string')
	  }
	
	  if (typeof ArrayBuffer !== 'undefined') {
	    if (object.buffer instanceof ArrayBuffer) {
	      return fromTypedArray(that, object)
	    }
	    if (object instanceof ArrayBuffer) {
	      return fromArrayBuffer(that, object)
	    }
	  }
	
	  if (object.length) return fromArrayLike(that, object)
	
	  return fromJsonObject(that, object)
	}
	
	function fromBuffer (that, buffer) {
	  var length = checked(buffer.length) | 0
	  that = allocate(that, length)
	  buffer.copy(that, 0, 0, length)
	  return that
	}
	
	function fromArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}
	
	// Duplicate of fromArray() to keep fromArray() monomorphic.
	function fromTypedArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  // Truncating the elements is probably not what people expect from typed
	  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
	  // of the old Buffer constructor.
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}
	
	function fromArrayBuffer (that, array) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    array.byteLength
	    that = Buffer._augment(new Uint8Array(array))
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromTypedArray(that, new Uint8Array(array))
	  }
	  return that
	}
	
	function fromArrayLike (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}
	
	// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
	// Returns a zero-length buffer for inputs that don't conform to the spec.
	function fromJsonObject (that, object) {
	  var array
	  var length = 0
	
	  if (object.type === 'Buffer' && isArray(object.data)) {
	    array = object.data
	    length = checked(array.length) | 0
	  }
	  that = allocate(that, length)
	
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}
	
	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	} else {
	  // pre-set for values that may exist in the future
	  Buffer.prototype.length = undefined
	  Buffer.prototype.parent = undefined
	}
	
	function allocate (that, length) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = Buffer._augment(new Uint8Array(length))
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that.length = length
	    that._isBuffer = true
	  }
	
	  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
	  if (fromPool) that.parent = rootParent
	
	  return that
	}
	
	function checked (length) {
	  // Note: cannot use `length < kMaxLength` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}
	
	function SlowBuffer (subject, encoding) {
	  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)
	
	  var buf = new Buffer(subject, encoding)
	  delete buf.parent
	  return buf
	}
	
	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}
	
	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }
	
	  if (a === b) return 0
	
	  var x = a.length
	  var y = b.length
	
	  var i = 0
	  var len = Math.min(x, y)
	  while (i < len) {
	    if (a[i] !== b[i]) break
	
	    ++i
	  }
	
	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }
	
	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}
	
	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}
	
	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')
	
	  if (list.length === 0) {
	    return new Buffer(0)
	  }
	
	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; i++) {
	      length += list[i].length
	    }
	  }
	
	  var buf = new Buffer(length)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}
	
	function byteLength (string, encoding) {
	  if (typeof string !== 'string') string = '' + string
	
	  var len = string.length
	  if (len === 0) return 0
	
	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'binary':
	      // Deprecated
	      case 'raw':
	      case 'raws':
	        return len
	      case 'utf8':
	      case 'utf-8':
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength
	
	function slowToString (encoding, start, end) {
	  var loweredCase = false
	
	  start = start | 0
	  end = end === undefined || end === Infinity ? this.length : end | 0
	
	  if (!encoding) encoding = 'utf8'
	  if (start < 0) start = 0
	  if (end > this.length) end = this.length
	  if (end <= start) return ''
	
	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)
	
	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)
	
	      case 'ascii':
	        return asciiSlice(this, start, end)
	
	      case 'binary':
	        return binarySlice(this, start, end)
	
	      case 'base64':
	        return base64Slice(this, start, end)
	
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)
	
	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	
	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}
	
	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}
	
	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}
	
	Buffer.prototype.compare = function compare (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return 0
	  return Buffer.compare(this, b)
	}
	
	Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
	  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
	  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
	  byteOffset >>= 0
	
	  if (this.length === 0) return -1
	  if (byteOffset >= this.length) return -1
	
	  // Negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)
	
	  if (typeof val === 'string') {
	    if (val.length === 0) return -1 // special case: looking for empty string always fails
	    return String.prototype.indexOf.call(this, val, byteOffset)
	  }
	  if (Buffer.isBuffer(val)) {
	    return arrayIndexOf(this, val, byteOffset)
	  }
	  if (typeof val === 'number') {
	    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
	      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
	    }
	    return arrayIndexOf(this, [ val ], byteOffset)
	  }
	
	  function arrayIndexOf (arr, val, byteOffset) {
	    var foundIndex = -1
	    for (var i = 0; byteOffset + i < arr.length; i++) {
	      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
	      } else {
	        foundIndex = -1
	      }
	    }
	    return -1
	  }
	
	  throw new TypeError('val must be string, number or Buffer')
	}
	
	// `get` is deprecated
	Buffer.prototype.get = function get (offset) {
	  console.log('.get() is deprecated. Access using array indexes instead.')
	  return this.readUInt8(offset)
	}
	
	// `set` is deprecated
	Buffer.prototype.set = function set (v, offset) {
	  console.log('.set() is deprecated. Access using array indexes instead.')
	  return this.writeUInt8(v, offset)
	}
	
	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }
	
	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')
	
	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) throw new Error('Invalid hex string')
	    buf[offset + i] = parsed
	  }
	  return i
	}
	
	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}
	
	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}
	
	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}
	
	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}
	
	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}
	
	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    var swap = encoding
	    encoding = offset
	    offset = length | 0
	    length = swap
	  }
	
	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining
	
	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('attempt to write outside buffer bounds')
	  }
	
	  if (!encoding) encoding = 'utf8'
	
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)
	
	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)
	
	      case 'ascii':
	        return asciiWrite(this, string, offset, length)
	
	      case 'binary':
	        return binaryWrite(this, string, offset, length)
	
	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)
	
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)
	
	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	
	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}
	
	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}
	
	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []
	
	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1
	
	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint
	
	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }
	
	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }
	
	    res.push(codePoint)
	    i += bytesPerSequence
	  }
	
	  return decodeCodePointsArray(res)
	}
	
	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000
	
	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }
	
	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}
	
	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)
	
	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}
	
	function binarySlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)
	
	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}
	
	function hexSlice (buf, start, end) {
	  var len = buf.length
	
	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len
	
	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}
	
	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}
	
	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end
	
	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }
	
	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }
	
	  if (end < start) end = start
	
	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = Buffer._augment(this.subarray(start, end))
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	  }
	
	  if (newBuf.length) newBuf.parent = this.parent || this
	
	  return newBuf
	}
	
	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}
	
	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	
	  return val
	}
	
	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }
	
	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }
	
	  return val
	}
	
	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}
	
	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}
	
	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}
	
	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}
	
	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}
	
	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80
	
	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)
	
	  return val
	}
	
	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80
	
	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)
	
	  return val
	}
	
	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}
	
	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}
	
	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}
	
	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}
	
	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}
	
	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}
	
	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}
	
	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}
	
	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}
	
	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	}
	
	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)
	
	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)
	
	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}
	
	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}
	
	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}
	
	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}
	
	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)
	
	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }
	
	  var i = 0
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)
	
	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }
	
	  var i = byteLength - 1
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}
	
	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}
	
	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	  if (offset < 0) throw new RangeError('index out of range')
	}
	
	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}
	
	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}
	
	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}
	
	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}
	
	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}
	
	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}
	
	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start
	
	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0
	
	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')
	
	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }
	
	  var len = end - start
	  var i
	
	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; i--) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; i++) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    target._set(this.subarray(start, start + len), targetStart)
	  }
	
	  return len
	}
	
	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function fill (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length
	
	  if (end < start) throw new RangeError('end < start')
	
	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return
	
	  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
	  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')
	
	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }
	
	  return this
	}
	
	/**
	 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
	 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
	 */
	Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
	  if (typeof Uint8Array !== 'undefined') {
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	      return (new Buffer(this)).buffer
	    } else {
	      var buf = new Uint8Array(this.length)
	      for (var i = 0, len = buf.length; i < len; i += 1) {
	        buf[i] = this[i]
	      }
	      return buf.buffer
	    }
	  } else {
	    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
	  }
	}
	
	// HELPER FUNCTIONS
	// ================
	
	var BP = Buffer.prototype
	
	/**
	 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
	 */
	Buffer._augment = function _augment (arr) {
	  arr.constructor = Buffer
	  arr._isBuffer = true
	
	  // save reference to original Uint8Array set method before overwriting
	  arr._set = arr.set
	
	  // deprecated
	  arr.get = BP.get
	  arr.set = BP.set
	
	  arr.write = BP.write
	  arr.toString = BP.toString
	  arr.toLocaleString = BP.toString
	  arr.toJSON = BP.toJSON
	  arr.equals = BP.equals
	  arr.compare = BP.compare
	  arr.indexOf = BP.indexOf
	  arr.copy = BP.copy
	  arr.slice = BP.slice
	  arr.readUIntLE = BP.readUIntLE
	  arr.readUIntBE = BP.readUIntBE
	  arr.readUInt8 = BP.readUInt8
	  arr.readUInt16LE = BP.readUInt16LE
	  arr.readUInt16BE = BP.readUInt16BE
	  arr.readUInt32LE = BP.readUInt32LE
	  arr.readUInt32BE = BP.readUInt32BE
	  arr.readIntLE = BP.readIntLE
	  arr.readIntBE = BP.readIntBE
	  arr.readInt8 = BP.readInt8
	  arr.readInt16LE = BP.readInt16LE
	  arr.readInt16BE = BP.readInt16BE
	  arr.readInt32LE = BP.readInt32LE
	  arr.readInt32BE = BP.readInt32BE
	  arr.readFloatLE = BP.readFloatLE
	  arr.readFloatBE = BP.readFloatBE
	  arr.readDoubleLE = BP.readDoubleLE
	  arr.readDoubleBE = BP.readDoubleBE
	  arr.writeUInt8 = BP.writeUInt8
	  arr.writeUIntLE = BP.writeUIntLE
	  arr.writeUIntBE = BP.writeUIntBE
	  arr.writeUInt16LE = BP.writeUInt16LE
	  arr.writeUInt16BE = BP.writeUInt16BE
	  arr.writeUInt32LE = BP.writeUInt32LE
	  arr.writeUInt32BE = BP.writeUInt32BE
	  arr.writeIntLE = BP.writeIntLE
	  arr.writeIntBE = BP.writeIntBE
	  arr.writeInt8 = BP.writeInt8
	  arr.writeInt16LE = BP.writeInt16LE
	  arr.writeInt16BE = BP.writeInt16BE
	  arr.writeInt32LE = BP.writeInt32LE
	  arr.writeInt32BE = BP.writeInt32BE
	  arr.writeFloatLE = BP.writeFloatLE
	  arr.writeFloatBE = BP.writeFloatBE
	  arr.writeDoubleLE = BP.writeDoubleLE
	  arr.writeDoubleBE = BP.writeDoubleBE
	  arr.fill = BP.fill
	  arr.inspect = BP.inspect
	  arr.toArrayBuffer = BP.toArrayBuffer
	
	  return arr
	}
	
	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g
	
	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}
	
	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}
	
	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}
	
	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []
	
	  for (var i = 0; i < length; i++) {
	    codePoint = string.charCodeAt(i)
	
	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }
	
	        // valid lead
	        leadSurrogate = codePoint
	
	        continue
	      }
	
	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }
	
	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }
	
	    leadSurrogate = null
	
	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }
	
	  return bytes
	}
	
	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}
	
	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    if ((units -= 2) < 0) break
	
	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }
	
	  return byteArray
	}
	
	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}
	
	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	
	;(function (exports) {
		'use strict';
	
	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array
	
		var PLUS   = '+'.charCodeAt(0)
		var SLASH  = '/'.charCodeAt(0)
		var NUMBER = '0'.charCodeAt(0)
		var LOWER  = 'a'.charCodeAt(0)
		var UPPER  = 'A'.charCodeAt(0)
		var PLUS_URL_SAFE = '-'.charCodeAt(0)
		var SLASH_URL_SAFE = '_'.charCodeAt(0)
	
		function decode (elt) {
			var code = elt.charCodeAt(0)
			if (code === PLUS ||
			    code === PLUS_URL_SAFE)
				return 62 // '+'
			if (code === SLASH ||
			    code === SLASH_URL_SAFE)
				return 63 // '/'
			if (code < NUMBER)
				return -1 //no match
			if (code < NUMBER + 10)
				return code - NUMBER + 26 + 26
			if (code < UPPER + 26)
				return code - UPPER
			if (code < LOWER + 26)
				return code - LOWER + 26
		}
	
		function b64ToByteArray (b64) {
			var i, j, l, tmp, placeHolders, arr
	
			if (b64.length % 4 > 0) {
				throw new Error('Invalid string. Length must be a multiple of 4')
			}
	
			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			var len = b64.length
			placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0
	
			// base64 is 4/3 + up to two characters of the original data
			arr = new Arr(b64.length * 3 / 4 - placeHolders)
	
			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length
	
			var L = 0
	
			function push (v) {
				arr[L++] = v
			}
	
			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
				push((tmp & 0xFF0000) >> 16)
				push((tmp & 0xFF00) >> 8)
				push(tmp & 0xFF)
			}
	
			if (placeHolders === 2) {
				tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
				push(tmp & 0xFF)
			} else if (placeHolders === 1) {
				tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
				push((tmp >> 8) & 0xFF)
				push(tmp & 0xFF)
			}
	
			return arr
		}
	
		function uint8ToBase64 (uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length
	
			function encode (num) {
				return lookup.charAt(num)
			}
	
			function tripletToBase64 (num) {
				return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
			}
	
			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
				output += tripletToBase64(temp)
			}
	
			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
					temp = uint8[uint8.length - 1]
					output += encode(temp >> 2)
					output += encode((temp << 4) & 0x3F)
					output += '=='
					break
				case 2:
					temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
					output += encode(temp >> 10)
					output += encode((temp >> 4) & 0x3F)
					output += encode((temp << 2) & 0x3F)
					output += '='
					break
			}
	
			return output
		}
	
		exports.toByteArray = b64ToByteArray
		exports.fromByteArray = uint8ToBase64
	}( false ? (this.base64js = {}) : exports))


/***/ },
/* 22 */
/***/ function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]
	
	  i += d
	
	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
	
	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
	
	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}
	
	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0
	
	  value = Math.abs(value)
	
	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }
	
	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }
	
	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
	
	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
	
	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 23 */
/***/ function(module, exports) {

	var toString = {}.toString;
	
	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var util = __webpack_require__(5);
	var Loader = __webpack_require__(25);
	var Vox = __webpack_require__(26);
	
	/////////////////////////////////////////////////////////////
	// Vox models
	/////////////////////////////////////////////////////////////
	function VoxLoader() {
	    Loader.call(this);
	    this.models = new Array();
	}
	util.inherits(VoxLoader, Loader);
	
	VoxLoader.prototype.GetModel = function (name) {
	    return this.models[name].chunk.Clone();
	};
	
	VoxLoader.prototype.Add = function (args) {
	    this.models[args.name] = new Object();
	    this.models[args.name].args = args;
	    Loader.prototype.total++;
	
	    var vox = new Vox({
	        filename: args.file,
	        name: args.name
	    });
	
	    vox.LoadModel(this.Load.bind(this));
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
	
	module.exports = VoxLoader;

/***/ },
/* 25 */
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
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var VoxelData = __webpack_require__(27);
	var Chunk = __webpack_require__(17);
	var fs = __webpack_require__(28);
	
	var voxColors = [0x00000000, 0xffffffff, 0xffccffff, 0xff99ffff, 0xff66ffff, 0xff33ffff, 0xff00ffff, 0xffffccff, 0xffccccff, 0xff99ccff, 0xff66ccff, 0xff33ccff, 0xff00ccff, 0xffff99ff, 0xffcc99ff, 0xff9999ff, 0xff6699ff, 0xff3399ff, 0xff0099ff, 0xffff66ff, 0xffcc66ff, 0xff9966ff, 0xff6666ff, 0xff3366ff, 0xff0066ff, 0xffff33ff, 0xffcc33ff, 0xff9933ff, 0xff6633ff, 0xff3333ff, 0xff0033ff, 0xffff00ff, 0xffcc00ff, 0xff9900ff, 0xff6600ff, 0xff3300ff, 0xff0000ff, 0xffffffcc, 0xffccffcc, 0xff99ffcc, 0xff66ffcc, 0xff33ffcc, 0xff00ffcc, 0xffffcccc, 0xffcccccc, 0xff99cccc, 0xff66cccc, 0xff33cccc, 0xff00cccc, 0xffff99cc, 0xffcc99cc, 0xff9999cc, 0xff6699cc, 0xff3399cc, 0xff0099cc, 0xffff66cc, 0xffcc66cc, 0xff9966cc, 0xff6666cc, 0xff3366cc, 0xff0066cc, 0xffff33cc, 0xffcc33cc, 0xff9933cc, 0xff6633cc, 0xff3333cc, 0xff0033cc, 0xffff00cc, 0xffcc00cc, 0xff9900cc, 0xff6600cc, 0xff3300cc, 0xff0000cc, 0xffffff99, 0xffccff99, 0xff99ff99, 0xff66ff99, 0xff33ff99, 0xff00ff99, 0xffffcc99, 0xffcccc99, 0xff99cc99, 0xff66cc99, 0xff33cc99, 0xff00cc99, 0xffff9999, 0xffcc9999, 0xff999999, 0xff669999, 0xff339999, 0xff009999, 0xffff6699, 0xffcc6699, 0xff996699, 0xff666699, 0xff336699, 0xff006699, 0xffff3399, 0xffcc3399, 0xff993399, 0xff663399, 0xff333399, 0xff003399, 0xffff0099, 0xffcc0099, 0xff990099, 0xff660099, 0xff330099, 0xff000099, 0xffffff66, 0xffccff66, 0xff99ff66, 0xff66ff66, 0xff33ff66, 0xff00ff66, 0xffffcc66, 0xffcccc66, 0xff99cc66, 0xff66cc66, 0xff33cc66, 0xff00cc66, 0xffff9966, 0xffcc9966, 0xff999966, 0xff669966, 0xff339966, 0xff009966, 0xffff6666, 0xffcc6666, 0xff996666, 0xff666666, 0xff336666, 0xff006666, 0xffff3366, 0xffcc3366, 0xff993366, 0xff663366, 0xff333366, 0xff003366, 0xffff0066, 0xffcc0066, 0xff990066, 0xff660066, 0xff330066, 0xff000066, 0xffffff33, 0xffccff33, 0xff99ff33, 0xff66ff33, 0xff33ff33, 0xff00ff33, 0xffffcc33, 0xffcccc33, 0xff99cc33, 0xff66cc33, 0xff33cc33, 0xff00cc33, 0xffff9933, 0xffcc9933, 0xff999933, 0xff669933, 0xff339933, 0xff009933, 0xffff6633, 0xffcc6633, 0xff996633, 0xff666633, 0xff336633, 0xff006633, 0xffff3333, 0xffcc3333, 0xff993333, 0xff663333, 0xff333333, 0xff003333, 0xffff0033, 0xffcc0033, 0xff990033, 0xff660033, 0xff330033, 0xff000033, 0xffffff00, 0xffccff00, 0xff99ff00, 0xff66ff00, 0xff33ff00, 0xff00ff00, 0xffffcc00, 0xffcccc00, 0xff99cc00, 0xff66cc00, 0xff33cc00, 0xff00cc00, 0xffff9900, 0xffcc9900, 0xff999900, 0xff669900, 0xff339900, 0xff009900, 0xffff6600, 0xffcc6600, 0xff996600, 0xff666600, 0xff336600, 0xff006600, 0xffff3300, 0xffcc3300, 0xff993300, 0xff663300, 0xff333300, 0xff003300, 0xffff0000, 0xffcc0000, 0xff990000, 0xff660000, 0xff330000, 0xff0000ee, 0xff0000dd, 0xff0000bb, 0xff0000aa, 0xff000088, 0xff000077, 0xff000055, 0xff000044, 0xff000022, 0xff000011, 0xff00ee00, 0xff00dd00, 0xff00bb00, 0xff00aa00, 0xff008800, 0xff007700, 0xff005500, 0xff004400, 0xff002200, 0xff001100, 0xffee0000, 0xffdd0000, 0xffbb0000, 0xffaa0000, 0xff880000, 0xff770000, 0xff550000, 0xff440000, 0xff220000, 0xff110000, 0xffeeeeee, 0xffdddddd, 0xffbbbbbb, 0xffaaaaaa, 0xff888888, 0xff777777, 0xff555555, 0xff444444, 0xff222222, 0xff111111];
	
	function Vox(props) {
	    this.world = null;
	    this.colors = [];
	    this.colors2 = undefined;
	    this.voxelData = [];
	    Object.assign(this, props);
	    this.chunk = new Chunk({
	        world: this.world
	    });
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
	
	Vox.prototype.proccesVoxData = function (arrayBuffer, callback, name) {
	    var buffer = new Uint8Array(arrayBuffer);
	    var voxId = this.readInt(buffer, 0);
	    var version = this.readInt(buffer, 4);
	    // TBD: Check version to support
	    var i = 8;
	    while (i < buffer.length) {
	        var subSample = false;
	        var sizex = 0,
	            sizey = 0,
	            sizez = 0;
	        var id = String.fromCharCode(parseInt(buffer[i++])) + String.fromCharCode(parseInt(buffer[i++])) + String.fromCharCode(parseInt(buffer[i++])) + String.fromCharCode(parseInt(buffer[i++]));
	
	        var chunkSize = this.readInt(buffer, i) & 0xFF;
	        i += 4;
	        var childChunks = this.readInt(buffer, i) & 0xFF;
	        i += 4;
	
	        if (id == "SIZE") {
	            sizex = this.readInt(buffer, i) & 0xFF;
	            i += 4;
	            sizey = this.readInt(buffer, i) & 0xFF;
	            i += 4;
	            sizez = this.readInt(buffer, i) & 0xFF;
	            i += 4;
	            if (sizex > 32 || sizey > 32) {
	                subSample = true;
	            }
	            console.log(this.filename + " => Create VOX Chunk!");
	            this.chunk.Create(sizex, sizey, sizez);
	            i += chunkSize - 4 * 3;
	        } else if (id == "XYZI") {
	            var numVoxels = Math.abs(this.readInt(buffer, i));
	            i += 4;
	            this.voxelData = new Array(numVoxels);
	            for (var n = 0; n < this.voxelData.length; n++) {
	                ;
	                this.voxelData[n] = new VoxelData();
	                this.voxelData[n].Create(buffer, i, subSample); // Read 4 bytes
	                i += 4;
	            }
	        } else if (id == "RGBA") {
	            console.log(this.filename + " => Regular color chunk");
	            this.colors2 = new Array(256);
	            for (var n = 0; n < 256; n++) {
	                var r = buffer[i++] & 0xFF;
	                var g = buffer[i++] & 0xFF;
	                var b = buffer[i++] & 0xFF;
	                var a = buffer[i++] & 0xFF;
	                this.colors2[n] = { 'r': r, 'g': g, 'b': b, 'a': a };
	            }
	        } else {
	            i += chunkSize;
	        }
	    }
	
	    if (this.voxelData == null || this.voxelData.length == 0) {
	        return null;
	    }
	
	    for (var n = 0; n < this.voxelData.length; n++) {
	        if (this.colors2 == undefined) {
	            var c = voxColors[Math.abs(this.voxelData[n].color - 1)];
	            var cRGBA = {
	                b: (c & 0xff0000) >> 16,
	                g: (c & 0x00ff00) >> 8,
	                r: c & 0x0000ff,
	                a: 1
	            };
	            this.chunk.ActivateBlock(this.voxelData[n].x, this.voxelData[n].y, this.voxelData[n].z, cRGBA);
	        } else {
	            this.chunk.ActivateBlock(this.voxelData[n].x, this.voxelData[n].y, this.voxelData[n].z, this.colors2[Math.abs(this.voxelData[n].color - 1)]);
	        }
	    }
	    callback(this, this.name);
	};
	
	Vox.prototype.onLoadHandler = function (callback, oEvent) {
	    var oReq = oEvent.currentTarget;
	    console.log("Loaded model: " + oReq.responseURL);
	
	    var arrayBuffer = oReq.response;
	    if (arrayBuffer) {
	        this.proccesVoxData(arrayBuffer, callback);
	    }
	};
	
	Vox.prototype.LoadModel = function (callback) {
	    var _this = this;
	
	    if (this.environment === 'server') {
	        fs.readFile('./models/' + this.filename, function (err, data) {
	            if (err) throw err;
	            _this.proccesVoxData(data, callback);
	        });
	    } else {
	        var oReq = new XMLHttpRequest();
	        oReq.open("GET", "models/" + this.filename, true);
	        oReq.responseType = "arraybuffer";
	        oReq.onload = this.onLoadHandler.bind(this, callback);
	        oReq.send(null);
	    }
	};
	
	module.exports = Vox;

/***/ },
/* 27 */
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
/* 28 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = {
	  Tree: __webpack_require__(30),
	  MechSniper: __webpack_require__(42),
	  Guy: __webpack_require__(43),
	  player: __webpack_require__(43),
	  Bullet: __webpack_require__(44)
	};
	// Cloud: require('./Cloud')

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Entity = __webpack_require__(31);
	
	module.exports = Entity.create({
	  traits: ['AttachedVox', 'Hit', 'Rooted']
	});

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var Trait = __webpack_require__(32);
	var events = __webpack_require__(12);
	var util = __webpack_require__(5);
	var _ = __webpack_require__(4);
	var THREE = __webpack_require__(9);
	var traitMap = __webpack_require__(33);
	
	var id = 1;
	var Entity = {
	
	  create: function create(entityDef) {
	    var traits = entityDef.traits.splice(0);
	
	    //resolve conflicts.
	    var resolveObj = this.resolveConflicts(traits);
	
	    // compose
	    var trait = Trait.compose.apply(this, resolveObj);
	
	    function EntityCons(extenedProps) {
	      var props = Object.assign({}, entityDef, extenedProps);
	      var entity = trait.create(EntityCons.prototype, props);
	
	      _.each(entity, function (method, methodName) {
	        if (methodName.match('init')) {
	          method.call(entity);
	        }
	      });
	
	      if (!entity.id) {
	        entity.id = extenedProps.world.id + "-" + id;
	        id++;
	      }
	
	      return entity;
	    };
	    util.inherits(EntityCons, events.EventEmitter);
	
	    EntityCons.prototype.init = function (dt) {};
	
	    EntityCons.prototype.updateHandler = function (dt) {
	      var _this = this;
	
	      if (this.REMOVE) {
	        //dont update if REMOVED
	        return;
	      }
	
	      _.each(this, function (updateHandler, methodName) {
	        if (methodName.match('_updateHandler')) {
	          updateHandler.call(_this, dt);
	        };
	      });
	    };
	
	    EntityCons.prototype.remove = function () {
	      this.world.removeEntity(this.id);
	    };
	
	    EntityCons.prototype.getMatrixPos = function () {
	      var vector = new THREE.Vector3();
	      vector.setFromMatrixPosition(this.mesh.matrixWorld);
	      return vector;
	    };
	
	    EntityCons.prototype['export'] = function () {
	      return {
	        position: this.mesh.position.toArray(),
	        scale: this.scale,
	        id: this.id,
	        speed: this.speed,
	        quaternion: this.mesh.quaternion.toArray(),
	        jumpGoal: this.jumpGoal,
	        jumpHeight: this.jumpHeight,
	        direction: this.direction,
	        ownerId: this.ownerId,
	        type: this.type,
	        REMOVE: this.REMOVE
	      };
	    };
	
	    return EntityCons;
	  },
	
	  findConflictMethodNames: function findConflictMethodNames(conflictMap) {
	    return _.compact(_.map(conflictMap, function (value, key, result) {
	      if (value.length > 1) {
	        return key;
	      }
	    }));
	  },
	
	  getConflictMethodMap: function getConflictMethodMap(traits) {
	    var conflictMap = {};
	    var Trait;
	
	    _.each(traits, function (traitName) {
	      Trait = traitMap[traitName];
	      _.each(Trait, function (value, key) {
	        if (value.value && !value.required) {
	          if (conflictMap[key]) {
	            conflictMap[key].push(traitName);
	          } else {
	            conflictMap[key] = [traitName];
	          }
	        }
	      });
	    });
	
	    return conflictMap;
	  },
	
	  reverseConflictMap: function reverseConflictMap(conflictMap) {
	    var resolveMap = {};
	    _.each(conflictMap, function (traitNames, propConflict) {
	      if (conflictMap[propConflict].length > 1) {
	        _.each(traitNames, function (traitName) {
	          if (resolveMap[traitName]) {
	            resolveMap[traitName].push(propConflict);
	          } else {
	            resolveMap[traitName] = [propConflict];
	          }
	        });
	      }
	    });
	
	    return resolveMap;
	  },
	
	  findConflicts: function findConflicts(traits) {
	    var conflictMap = this.getConflictMethodMap(traits);
	    var reversedConflictMap = this.reverseConflictMap(conflictMap);
	    return reversedConflictMap;
	  },
	
	  getTraitReference: function getTraitReference(traitName) {
	    if (typeof traitMap[traitName] === 'undefined') {
	      throw "Tried to load missing trait " + traitName;
	    }
	
	    return traitMap[traitName];
	  },
	
	  resolveConflicts: function resolveConflicts(traits) {
	    var _this2 = this;
	
	    var resolveObj = [];
	    var reversedConflictMap = this.findConflicts(traits);
	    var nonConflicting = _.difference(traits, _.keys(reversedConflictMap));
	
	    _.each(nonConflicting, function (traitName) {
	      resolveObj.push(_this2.getTraitReference(traitName));
	    });
	
	    var resolved = _.map(reversedConflictMap, function (propsToResolve, traitName) {
	      if (!propsToResolve.length) {
	        return this.getTraitReference(traitName);
	      } else {
	        var resolveObj = {};
	        _.map(propsToResolve, function (prop) {
	          resolveObj[prop] = traitName + "_" + prop;
	        });
	        return traitMap[traitName].resolve(resolveObj);
	      }
	    });
	
	    return resolveObj.concat(resolved);
	  }
	};
	
	module.exports = Entity;

/***/ },
/* 32 */
/***/ function(module, exports) {

	module.exports = require("simple-traits");

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = {
	  'AttachedVox': __webpack_require__(34),
	  'Gravity': __webpack_require__(35),
	  'Shoot': __webpack_require__(36),
	  'Projectile': __webpack_require__(37),
	  'Explode': __webpack_require__(38),
	  'Damages': __webpack_require__(39),
	  'Hit': __webpack_require__(40),
	  'Rooted': __webpack_require__(41)
	};

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Trait = __webpack_require__(32);
	var THREE = __webpack_require__(2);
	
	var AttachedVox = Trait({
	  position: Trait.required,
	  vox: Trait.required,
	
	  init: function init() {
	    this.chunk = this.vox.getChunk();
	    this.chunk.Rebuild();
	    this.mesh = this.vox.getMesh();
	    this.mesh.geometry.center();
	    this.mesh.geometry.computeBoundingBox();
	    this.mesh.position.set(this.position[0], this.position[1], this.position[2]);
	
	    if (this.debug) {
	      this.bbox = new THREE.BoundingBoxHelper(this.mesh, 0xff0000);
	      this.bbox.update();
	    }
	
	    //unsafe mutation of the classes position
	    //helpful for moving mesh through the class
	    this.position = this.mesh.position;
	
	    if (!this.scale) {
	      this.scale = 2;
	    }
	    this.mesh.scale.set(this.scale, this.scale, this.scale);
	  },
	
	  updateHandler: function updateHandler() {
	    if (this.bbox) {
	      this.bbox.update();
	    }
	  }
	});
	
	module.exports = AttachedVox;

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Trait = __webpack_require__(32);
	var _ = __webpack_require__(4);
	
	var Gravity = Trait({
	  position: Trait.required,
	  chunkManager: Trait.required,
	
	  gravity: 50,
	
	  updateHandler: function updateHandler(dt) {
	    var ground = this.getGround();
	
	    if (this.jumpGoal > 0) {
	      if (this.position.y < this.jumpGoal) {
	        this.position.y += this.gravity * dt;
	      }
	
	      if (this.position.y >= this.jumpGoal) {
	        this.jumpGoal = -1;
	      }
	      return;
	    }
	
	    if (this.position.y <= ground) {
	      this.position.y = ground;
	      this.jumpGoal = 0;
	      return;
	    }
	
	    if (this.position.y >= ground) {
	      this.position.y -= this.gravity * dt;
	      return;
	    }
	  },
	
	  getGround: function getGround() {
	    return this.chunkManager.getHeight(this.position.x, this.position.z);
	  }
	});
	
	module.exports = Gravity;

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Trait = __webpack_require__(32);
	var _ = __webpack_require__(4);
	var THREE = __webpack_require__(2);
	var Immutable = __webpack_require__(6);
	
	var Shoot = Trait({
	  position: Trait.required,
	  //  mesh: Trait.required,
	  scene: Trait.required,
	
	  bulletPosOrigin: [0, -0.8, 0.5],
	
	  init: function init() {
	    this.bulletPos = new THREE.Object3D();
	    this.bulletPos.position.set.apply(this.bulletPos.position, this.bulletPosOrigin);
	    this.mesh.add(this.bulletPos);
	  },
	
	  shoot: function shoot() {
	    this.mesh.updateMatrixWorld();
	
	    var vector = new THREE.Vector3();
	    vector.setFromMatrixPosition(this.bulletPos.matrixWorld);
	
	    var rotationMatrix = new THREE.Matrix4();
	    rotationMatrix.extractRotation(this.mesh.matrix);
	
	    var rotationVector = new THREE.Vector3(0, -1, 0);
	    rotationVector.applyMatrix4(rotationMatrix);
	    var ray = new THREE.Raycaster(vector, rotationVector);
	
	    //this.scene.add( new THREE.ArrowHelper(ray.ray.direction, this.mesh.position, 50, 0x00FF00));
	
	    this.world.initEntityInstance('Bullet', null, Immutable.fromJS({
	      direction: ray.ray.direction.toArray(),
	      position: vector.toArray(),
	      ownerId: this.id
	    }));
	  }
	
	});
	
	module.exports = Shoot;

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Trait = __webpack_require__(32);
	var _ = __webpack_require__(4);
	var THREE = __webpack_require__(2);
	
	var Projectile = Trait({
	  direction: Trait.required,
	  position: Trait.required,
	  mesh: Trait.required,
	  speed: 20,
	  range: 100,
	
	  init: function init() {
	    //this.bbox = new THREE.BoundingBoxHelper(this.mesh, 0xff0000);
	    this.mesh.position.set(this.position[0], this.position[1], this.position[2]);
	  },
	
	  updateHandler: function updateHandler(dt) {
	    this.mesh.position.x += this.direction[0] * this.speed * dt;
	    this.mesh.position.z += this.direction[2] * this.speed * dt;
	
	    this.range -= 1;
	    if (this.range === 0) {
	      this.remove();
	    }
	  }
	
	});
	
	module.exports = Projectile;

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Trait = __webpack_require__(32);
	var _ = __webpack_require__(4);
	
	var Explode = Trait({
	  mesh: Trait.require,
	
	  explode: function explode() {
	    // if(this.size < 0.3) {
	    //     return;
	    // }
	
	    var block;
	    for (var i = 0; i < 5; i++) {
	      // block = game.physBlockPool.Get();
	      // if(block != undefined) {
	      block.Create(this.mesh.position.x + Math.random() * 1, this.mesh.position.y + Math.random() * 1, this.mesh.position.z + Math.random() * 1, this.size / 2, 0, 0, 0, 2, Math.random() * 180, 5);
	      //        }
	    }
	  },
	
	  updateHandler: function updateHandler() {}
	});

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Trait = __webpack_require__(32);
	var _ = __webpack_require__(4);
	var THREE = __webpack_require__(9);
	
	module.exports = Trait({
	  init: function init() {
	    this.mesh.geometry.computeBoundingBox();
	    this.bbox = new THREE.BoundingBoxHelper(this.mesh, 0xff0000);
	  },
	
	  updateHandler: function updateHandler() {
	    var _this = this;
	
	    this.bbox.update();
	    var nearby = _.chain(this.world.entities).filter(function (entity, index) {
	      if (!entity) {
	        return;
	      }
	      var buffer = 1 + _this.mesh.geometry.boundingBox.max.x;
	
	      return entity.type != 'Bullet' && entity.id != _this.ownerId && _this.mesh.position.x <= entity.mesh.position.x + buffer && _this.mesh.position.x >= entity.mesh.position.x - buffer && _this.mesh.position.y <= entity.mesh.position.y + buffer && _this.mesh.position.y >= entity.mesh.position.y - buffer && _this.mesh.position.z <= entity.mesh.position.z + buffer && _this.mesh.position.z >= entity.mesh.position.z - buffer;
	    }).value();
	
	    if (nearby.length) {
	      var target = nearby[0];
	      if (!target.mesh.geometry.boundingBox) {
	        target.mesh.geometry.computeBoundingBox();
	      }
	
	      if (target.mesh.geometry.boundingBox.intersect(this.mesh.geometry.boundingBox)) {
	        this.remove();
	        target.hit();
	      }
	    }
	  }
	});

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Trait = __webpack_require__(32);
	var _ = __webpack_require__(4);
	
	module.exports = Trait({
	  life: 3,
	
	  hit: function hit() {
	    this.life -= 1;
	
	    if (this.life <= 0) {
	      this.chunk.Explode(this.mesh.position, this.scale, this.world);
	      this.remove();
	    }
	  }
	});

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Trait = __webpack_require__(32);
	var _ = __webpack_require__(4);
	
	module.exports = Trait({
	  updateHandler: function updateHandler(dt) {
	    if (!this.chunkManager.getHeight(this.position.x, this.position.z)) {
	      this.chunk.Explode(this.mesh.position, this.scale, this.world);
	      this.remove();
	    }
	  }
	});

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Entity = __webpack_require__(31);
	
	module.exports = Entity.create({
	  traits: ['AttachedVox', 'Hit', 'Gravity']
	});

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Entity = __webpack_require__(31);
	
	module.exports = Entity.create({
	         traits: ['AttachedVox', 'Gravity', 'Shoot', 'Hit']
	});

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Entity = __webpack_require__(31);
	
	module.exports = Entity.create({
	         traits: ['Projectile', 'Explode', 'Damages']
	});

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var util = __webpack_require__(5);
	var Object3D = __webpack_require__(46);
	var THREE = __webpack_require__(9);
	
	function Water(props) {
	    Object.assign(this, props);
	    var cool = Object3D.call(this);
	};
	util.inherits(Water, Object3D);
	
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
	
	    console.log("what", this.environment);
	    if (this.environment !== 'server') {
	        var texture = THREE.ImageUtils.loadTexture("textures/water2.png");
	        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	        texture.repeat.set(30, 30);
	    }
	
	    var material = new THREE.MeshBasicMaterial({
	        color: 0x00CCFF,
	        map: texture,
	        transparent: true,
	        opacity: 0.5
	    });
	
	    var mesh = new THREE.Mesh(geometry, material);
	    mesh.position.set(50, 0, 50);
	    //mesh.receiveShadow = true;
	    this.mesh = mesh;
	    scene.add(this.mesh);
	};
	
	Water.prototype.Draw = function (time) {
	    for (var i = 0, l = this.mesh.geometry.vertices.length; i < l; i++) {
	        this.mesh.geometry.vertices[i].y = 0.2 * Math.sin(i / 5 + (time + i) / 4);
	    }
	    this.mesh.geometry.verticesNeedUpdate = true;
	};
	
	module.exports = Water;

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var THREE = __webpack_require__(9);
	
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
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var PhysBlock = __webpack_require__(48);
	
	function PhysBlockPool(props) {
	    this.size = 0;
	    this.blocks = [];
	    this.scene = null;
	    this.world = null;
	    Object.assign(this, props);
	};
	
	PhysBlockPool.prototype.Create = function (amount) {
	    this.size = amount;
	
	    var b;
	    for (var i = 0; i < this.size; i++) {
	        b = new PhysBlock({
	            scene: this.scene,
	            world: this.world
	        });
	        b.remove = 1;
	        b.Init();
	        this.blocks.push(b);
	    }
	
	    return this;
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
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var THREE = __webpack_require__(9);
	var Utils = __webpack_require__(19);
	
	function PhysBlock(props) {
	    this.opacity = 1.0;
	    this.color = '0xFFFFFF';
	    this.life = 3;
	    this.mesh = undefined;
	    this.remove = 0;
	    this.velocity;
	    this.angle;
	    this.force = 0;
	    this.forceY = 0;
	    this.scene = null;
	    Object.assign(this, props);
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
	    this.scene.add(this.mesh);
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
	
	    var col = Utils.rgbToHex(Math.round(r), Math.round(g), Math.round(b));
	    this.mesh.material.color.setHex(col);
	    this.mesh.material.ambient.setHex(col);
	    this.mesh.material.needsUpdate = true;
	    this.mesh.scale.set(size, size, size);
	    this.mesh.position.set(x, y, z);
	    this.mesh.castShadow = true;
	    this.mesh.visible = true;
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
	
	    var col = Utils.rgbToHex(Math.round(r), Math.round(g), Math.round(b));
	    this.mesh.material.color.setHex(col);
	    this.mesh.material.needsUpdate = true;
	    this.mesh.scale.set(size, size, size);
	    this.mesh.position.set(x, y, z);
	    this.mesh.visible = true;
	
	    //game.objects.push(this);
	};
	
	PhysBlock.prototype.Draw = function (time, delta) {
	    if (!this.velocity) {
	        return;
	    }
	
	    this.life -= 0.01;
	    //this.mesh.material.alpha -= 0.1;
	    if (this.life <= 0 || this.mesh.position.y < 0) {
	        this.mesh.visible = false;
	        this.remove = 1;
	        this.life = 0;
	        return;
	    }
	
	    var height = this.world.chunkManager.getHeight(this.mesh.position.x, this.mesh.position.z);
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
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Trait = __webpack_require__(32);
	var _ = __webpack_require__(4);
	var THREE = __webpack_require__(2);
	var CommandManager = __webpack_require__(50);
	var KeyCommandMap = __webpack_require__(59);
	var Utils = __webpack_require__(19);
	var keydrown = __webpack_require__(60);
	
	var DesktopInputManager = function DesktopInputManager(props) {
	  Object.assign(this, props);
	  this.sequenceTick = 0;
	  this.commandHistory = [];
	  this.commandManager = new CommandManager({
	    Game: this.Game,
	    player_entity: this.player_entity
	  });
	
	  this.render_container.addEventListener('mousemove', this.onMouseMove.bind(this));
	  this.render_container.addEventListener('click', this.onClick.bind(this));
	};
	
	DesktopInputManager.prototype.update = function (dt) {
	  var _this = this;
	
	  _.each(KeyCommandMap, function (command, key) {
	    if (keydrown[key].isDown()) {
	      _this.processCommand('Press' + command, dt);
	    }
	  });
	};
	
	DesktopInputManager.prototype.processCommand = function (commandName, commandData) {
	  var eventData = {
	    commandName: commandName,
	    commandData: commandData,
	    sequenceTick: this.sequenceTick,
	    client_id: this.client_id
	  };
	
	  this.network.send({
	    eventName: 'playerInput',
	    eventData: eventData
	  });
	
	  this.commandManager.execute(commandName, commandData);
	
	  this.commandHistory.push(eventData);
	  this.sequenceTick++;
	};
	
	DesktopInputManager.prototype.onMouseMove = function (event) {
	  console.log("mouseMove", event);
	  var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
	  var x = movementX * 0.001;
	  var commandName = 'ViewChange';
	
	  this.processCommand(commandName, x);
	};
	
	DesktopInputManager.prototype.onClick = function (event) {
	  this.processCommand("Shoot");
	  this.render_container.requestPointerLock = this.render_container.requestPointerLock || this.render_container.mozRequestPointerLock || this.render_container.webkitRequestPointerLock;
	  this.render_container.requestPointerLock();
	};
	
	module.exports = DesktopInputManager;

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var Commands = __webpack_require__(51);
	
	function CommandManager(props) {
	    this.player_entity = null;
	    this.Game = null;
	    Object.assign(this, props);
	}
	
	CommandManager.prototype.execute = function (command, commandData) {
	    console.log("Command Manger executing", command);
	    Commands[command](this.player_entity, commandData);
	};
	
	module.exports = CommandManager;

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = {
	    PressJump: __webpack_require__(52),
	    PressLeft: __webpack_require__(53),
	    PressRight: __webpack_require__(54),
	    PressForward: __webpack_require__(55),
	    PressBack: __webpack_require__(56),
	    Shoot: __webpack_require__(57),
	    ViewChange: __webpack_require__(58)
	};

/***/ },
/* 52 */
/***/ function(module, exports) {

	"use strict";
	
	var StartJump = function StartJump(entity, dt) {
	  if (entity.jumpGoal > -1) {
	    entity.jumpGoal = entity.getGround() + entity.jumpHeight;
	  }
	};
	
	module.exports = StartJump;

/***/ },
/* 53 */
/***/ function(module, exports) {

	"use strict";
	
	module.exports = function StartLeft(entity, dt) {
	  entity.mesh.translateX(entity.speed * dt);
	};

/***/ },
/* 54 */
/***/ function(module, exports) {

	"use strict";
	
	module.exports = function StartRight(entity, dt) {
	  entity.mesh.translateX(-1 * entity.speed * dt);
	};

/***/ },
/* 55 */
/***/ function(module, exports) {

	"use strict";
	
	var StartForward = function StartForward(entity, dt) {
	  entity.mesh.translateY(-1 * entity.speed * dt);
	};
	
	module.exports = StartForward;

/***/ },
/* 56 */
/***/ function(module, exports) {

	"use strict";
	
	var StartBack = function StartBack(entity, dt) {
	  entity.mesh.translateY(entity.speed * dt);
	};
	
	module.exports = StartBack;

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var THREE = __webpack_require__(2);
	
	module.exports = function Shoot(entity, dt) {
	  entity.shoot();
	};

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var THREE = __webpack_require__(2);
	
	var ViewChange = function ViewChange(entity, xValue) {
	  var xAxis = new THREE.Vector3(0, 0, 1);
	  entity.mesh.rotateOnAxis(xAxis, -(Math.PI / 2) * xValue);
	};
	
	module.exports = ViewChange;

/***/ },
/* 59 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = {
	    'W': "Forward",
	    'A': "Left",
	    'S': "Back",
	    'D': "Right",
	    'SPACE': "Jump"
	};

/***/ },
/* 60 */
/***/ function(module, exports) {

	module.exports = require("keydrown");

/***/ },
/* 61 */
/***/ function(module, exports) {

	module.exports = require("signalhub");

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__dirname) {'use strict';
	
	var _ = __webpack_require__(4);
	var async = __webpack_require__(11);
	var Buffer = __webpack_require__(20).Buffer;
	var pako = __webpack_require__(8);
	var Immutable = __webpack_require__(6);
	var util = __webpack_require__(5);
	var BaseEnv = __webpack_require__(10);
	var THREE = __webpack_require__(9);
	var SimplePeer = __webpack_require__(7);
	var GameLoop = __webpack_require__(13);
	var CommandManager = __webpack_require__(50);
	var TerrainLoader = __webpack_require__(63);
	var signalHub = __webpack_require__(61);
	var SIGNALHUB_HOST = (undefined) || 'localhost';
	
	function ServerEnv(props) {
	  var _this = this;
	
	  this.far = 191;
	  this.clients = {};
	  this.players = {};
	  this.ready = false;
	  Object.assign(this, props);
	  ServerEnv.super_.call(this, Object.assign(this, props));
	
	  console.log("ServerEnv(), Environment Vars ....");
	  console.log(process.env.SIGNALHUB_PORT_8080_TCP_ADDR, "\n");
	  console.log(process.env.GATEWAY_ADDRESS, "\n");
	  console.log(process.env.GATEWAY_NETWORK, "\n");
	  console.log(process.env.ANSIBLE_NETWORK, "\n");
	  console.log(process.env.ETH0_NETWORK, "\n");
	  console.log(process.env.LO_NETWORK, "\n");
	  console.log(process.env.ALL_ANSIBLE, "\n");
	
	  console.log("ServerEnv() connecting to signal hub at ", SIGNALHUB_HOST);
	  this.hub = signalHub('plebland', ['http://' + SIGNALHUB_HOST + ':8080']);
	
	  console.log("SrverEnv() ", "subscribing to new clients on /client_offer");
	  this.hub.subscribe('client_offer').on('data', function (data) {
	    console.log("ServerEnv.hub.on'client_offer '", data);
	    _this.handleOffer(data.id, data.offer);
	  });
	
	  this.getWorldState(this.worldSetup.bind(this, props));
	};
	util.inherits(ServerEnv, BaseEnv);
	
	ServerEnv.prototype.initHandler = function () {
	  console.log("ServerEnv.initHandler()");
	
	  this.ready = true;
	  if (this.render_container) {
	    this.displayWidth = this.render_container.clientWidth;
	    this.displayHeight = this.render_container.clientHeight;
	    this.aspect = this.displayWidth / this.displayHeight;
	    this.camera = new THREE.PerspectiveCamera(this.viewAngle, this.aspect, this.near, this.far);
	
	    this.renderer = new THREE.WebGLRenderer({ antialias: true });
	    this.renderer.setSize(this.displayWidth, this.displayHeight);
	    this.renderer.shadowMapEnabled = true;
	    this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
	
	    this.render_container.appendChild(this.renderer.domElement);
	    THREEx.WindowResize(this.renderer, this.camera);
	    this.initPlayerCamera();
	    this.setLights();
	
	    this.clearColor = 0xeddeab;
	
	    this.renderer.setClearColor(this.clearColor, 1);
	
	    this.initStats();
	  }
	
	  console.log("ServerEnv.initHandler() clients ", this.clients);
	  _.each(this.clients, function (client) {
	    client.signal(client.offer);
	    delete client.offer;
	  });
	
	  ServerEnv.super_.prototype.initHandler.call(this);
	};
	
	ServerEnv.prototype.worldSetup = function (props, worldState) {
	  ServerEnv.super_.prototype.worldSetup.apply(this, [props, worldState]);
	  this.emit('init');
	};
	
	ServerEnv.prototype.handleOffer = function (client_id, offer) {
	  console.log("ServerEnv.handleOffer() ", client_id, offer);
	  if (!this.clients[client_id]) {
	    console.log("ServerEnv.handleOffer() initClient! ", client_id);
	    return this.initClient(client_id, offer);
	  } else {
	    this.clients[client_id].signal(offer);
	  }
	};
	
	ServerEnv.prototype.initClient = function (client_id, offer) {
	  var _this3 = this,
	      _arguments = arguments;
	
	  console.log("ServerEnv.initClient() ", client_id, offer);
	
	  //Client is connected and authenticated here
	  //fetch player data from DB
	  var player = {
	    position: [16, 2, 119],
	    speed: 10,
	    jumpHeight: 20,
	    model: 'Guy',
	    type: 'player',
	    id: client_id
	  };
	
	  var stunServers = ['stun.l.google.com:19302', 'stun1.l.google.com:19302', 'stun2.l.google.com:19302', 'stun3.l.google.com:19302', 'stun4.l.google.com:19302', 'stun01.sipphone.com', 'stun.ekiga.net', 'stun.fwdnet.net', 'stun.ideasip.com', 'stun.iptel.org', 'stun.rixtelecom.se', 'stun.schlund.de', 'stunserver.org', 'stun.softjoys.com', 'stun.voiparound.com', 'stun.voipbuster.com', 'stun.voipstunt.com', 'stun.voxgratia.org', 'stun.xten.com'];
	
	  var client = SimplePeer({
	    trickle: true,
	    config: {
	      iceServers: [{
	        url: 'turn:numb.viagenie.ca',
	        credential: 'muazkh',
	        username: 'webrtc@live.com'
	      }, {
	        url: 'turn:192.158.29.39:3478?transport=udp',
	        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
	        username: '28224511:1379330808'
	      }, {
	        url: 'turn:192.158.29.39:3478?transport=tcp',
	        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
	        username: '28224511:1379330808'
	      }].concat(_.map(stunServers, function (server) {
	        return { url: "stun:" + server };
	      }))
	    },
	    channelConfig: {
	      ordered: false,
	      maxRetransmits: 0
	    }
	  });
	
	  client.signal(offer);
	  //  client.offer = offer;
	  client.lastInputTick = 0;
	  player.connection = client;
	
	  client.on('signal', (function (data) {
	    console.log("ServerEnv.client.on'signal' ", data);
	    console.log("ServerEnv.hub.broadcast() ", 'server_' + client_id + '_ack');
	    this.hub.broadcast('server_' + client_id + '_ack', data);
	  }).bind(this));
	
	  client.on('connect', (function () {
	    var _this2 = this;
	
	    console.log("ServerEnv.client.on'connect' ", client_id);
	    client.connected = true;
	    client.send('hello from server');
	    player.entity = this.world.addPlayer(_.omit(player, 'connection'));
	
	    var worldExport = this.world['export'](client_id);
	    var wrap = {
	      eventName: "serverConnect",
	      eventData: worldExport
	    };
	
	    var zipped = pako.deflate(JSON.stringify(wrap));
	    var zbuf = new Buffer(zipped);
	    var head = new Buffer(zipped.length + "kjz:\n");
	    var payload = Buffer.concat([head, zbuf]);
	    console.log("ServerEnv.client.on'connect' sending payload", client_id);
	    client.send(payload);
	
	    client.CommandManager = new CommandManager({
	      player_entity: player.entity
	    });
	
	    client.updateInt = setInterval(function () {
	      var wrap = {
	        eventName: "serverUpdate",
	        eventData: {
	          entityData: _this2.world.exportEntities(),
	          lastInputTick: client.lastInputTick
	        }
	      };
	      var zipped = pako.deflate(JSON.stringify(wrap));
	      var zbuf = new Buffer(zipped);
	      var head = new Buffer(zipped.length + "kjz:\n");
	      var payload = Buffer.concat([head, zbuf]);
	      try {
	        client.send(payload);
	      } catch (ex) {
	        console.error("failed to send server update to client");
	      }
	    }, 100);
	  }).bind(this));
	
	  client.on('close', function () {
	    console.log("ServerEnv.client.on'close' ", client_id);
	
	    client.connected = false;
	    clearInterval(client.updateInt);
	    if (typeof _this3.world !== 'undefined') {
	      _this3.world.removeEntity(client_id);
	    }
	  });
	
	  client.on('data', function (data) {
	    console.log("ServerEnv.client.on data ", data);
	    if (data.eventName) {
	      _this3[data.eventName].apply(_this3, [client, data.eventData]);
	    }
	  });
	
	  client.on('error', function (err) {
	    clearInterval(client.updateInt);
	    console.log("ServerEnv.client.on'error' ", err);
	  });
	
	  client.on('finish', function () {
	    clearInterval(client.updateInt);
	    console.log("ServerEnv.client.on'finish", _arguments);
	  });
	
	  client.on('end', function () {
	    clearInterval(client.updateInt);
	    _this3.clients[client_id] = null; //best way to derference?
	    console.log("ServerEnv.client.on'end' ", _arguments);
	  });
	
	  this.players[client_id] = player;
	  this.clients[client_id] = player.connection;
	};
	
	ServerEnv.prototype.playerInput = function (client, inputData) {
	  client.CommandManager.execute(inputData.commandName, inputData.commandData);
	  client.lastInputTick = inputData.sequenceTick;
	};
	
	ServerEnv.prototype.initPlayerCamera = function (player_entity) {
	  // if(this.render_container){
	  //   const controls = new THREE.FirstPersonControls( this.camera, this.render_container, this.render_container );
	  //   controls.movementSpeed = 10;
	  //   controls.lookSpeed = 0.112;
	  //   controls.lookVertical = true;
	  //   this.controls = controls;
	  // } 
	  this.camera.position.set(66, 190, 68);
	  var target = this.camera.position.clone();
	  target.y = 0;
	  this.camera.lookAt(target);
	  this.camera.rotation.z = 3.0707963317943965;
	};
	
	ServerEnv.prototype.getWorldState = function (callback) {
	  var _this4 = this;
	
	  //TODO pull on startup. stored in DB or generated
	
	  var worldState = {
	    mapId: 4,
	    mapFile: "maps/map4.png",
	    mapName: "Voxadu Beach: Home of Lord Bolvox",
	    fogColor: 0xeddeab,
	    clearColor: 0xeddeab,
	    blockSize: 0.5,
	    wallHeight: 20,
	    useWater: true,
	    waterPosition: 0.2,
	    terrain: []
	  };
	
	  async.parallel({
	    worldMap: this.loadTerrain.bind(this),
	    entityData: this.fetchEntityData,
	    //todo this should be serial we don't know what entity meshes we need
	    //untill the entity data is fetched
	    entityMeshes: this.loadEntityMeshes.bind(this, ["Tree", "Guy", "MechSniper"])
	  }, function (err, results) {
	    console.log("Got everything?");
	
	    if (err) {
	      return console.log(err);
	    }
	
	    _this4.entityMeshes = results.entityMeshes;
	    Object.assign(worldState, results);
	    callback(Immutable.fromJS(worldState));
	  });
	};
	
	ServerEnv.prototype.fetchEntityData = function (callback) {
	  //TODO pull this from redis or something
	  var entities = [{ type: "Tree", id: 1, position: [8, 2, 110], scale: 2 }, { type: "Tree", id: 2, position: [45, 2, 60], scale: 2 }, { type: "Tree", id: 3, position: [59, 2, 35], scale: 2 }, { type: "Tree", id: 5, position: [33, 2, 13], scale: 2 }, { type: "Tree", id: 6, position: [110, 2.5, 16], scale: 2 }, { type: "Tree", id: 7, position: [107, 2.5, 27], scale: 2 }, { type: "Tree", id: 8, position: [92, 3.5, 109], scale: 2 }, { type: "Tree", id: 9, position: [86, 3.5, 107], scale: 2 }, { type: "MechSniper", id: 4, position: [20, 2, 110], scale: 2 }];
	
	  // "Cloud": [
	  //   {type:"Cloud", position:[16, 20, 110], scale:2},
	  //   {type:"Cloud", position:[20, 30, 90], scale:2},           
	  //   {type:"Cloud", position:[16, 40, 110], scale:2},
	  //   {type:"Cloud", position:[16, 80, 110], scale:2},                       
	  // ]
	
	  callback(null, entities);
	};
	
	ServerEnv.prototype.loadTerrain = function (callback) {
	  var wallHeight = 20;
	  var blockSize = 0.5;
	  var tl = new TerrainLoader();
	
	  console.log('where ami', __dirname);
	  tl.load('map4.png', wallHeight, blockSize, callback);
	};
	
	ServerEnv.prototype.update = function (dt, elapsed) {
	  ServerEnv.super_.prototype.update.apply(this, [dt, elapsed]);
	};
	
	ServerEnv.prototype.render = function (dt, elapsed) {
	  if (!this.render_container) {
	    return null;
	  }
	  ServerEnv.super_.prototype.render.apply(this, [dt, elapsed]);
	};
	
	module.exports = ServerEnv;
	/* WEBPACK VAR INJECTION */}.call(exports, "environments"))

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__dirname) {'use strict';
	var Base = __webpack_require__(64);
	var util = __webpack_require__(5);
	
	function ClientTerrainLoader(props) {
	  ClientTerrainLoader.super_.call(this, props);
	};
	util.inherits(ClientTerrainLoader, Base);
	
	ClientTerrainLoader.prototype.readTerrainImage = function (filename, callback) {
	  console.log("ClientTerrainLoader: loading file name?", filename);
	  var image = new Image();
	  image.onload = callback;
	  var path = "./maps/" + filename;
	  console.log("before assign", path, __dirname);
	  image.src = path;
	
	  //HACK electron-spawn and electrion seems to link files differntly
	  if (image.src.match('node_modules')) {
	    path = "../." + path;
	    image.src = path;
	  }
	
	  console.log('wtf is image', image.src);
	};
	
	ClientTerrainLoader.prototype.extractTerrainImageData = function (e) {
	  var ctx = document.createElement('canvas').getContext('2d');
	  var image = e.target;
	
	  ctx.canvas.width = image.width;
	  ctx.canvas.height = image.height;
	  ctx.drawImage(image, 0, 0);
	  this.width = image.width;
	  this.height = image.height;
	
	  var imgData = ctx.getImageData(0, 0, this.width, this.height);
	
	  return imgData;
	};
	
	module.exports = ClientTerrainLoader;
	/* WEBPACK VAR INJECTION */}.call(exports, "TerrainLoader"))

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var ChunkTerrain = __webpack_require__(16);
	
	function TerrainLoader(props) {
	    this.chunks = 0;
	    this.blocks = 0;
	    this.chunkSize = 16;
	
	    Object.assign(this, props);
	};
	
	TerrainLoader.prototype.imageLoadHandler = function (callback, loadEvent) {
	    console.log('image load handler!!');
	    var imgData = this.extractTerrainImageData(loadEvent);
	    var terrainData = this.processTerrainImageData(imgData);
	    var worldData = this.readTerrainData(terrainData);
	    callback(null, worldData.worldMap);
	};
	
	TerrainLoader.prototype.load = function (filename, wallHeight, blockSize, callback) {
	    this.wallHeight = wallHeight;
	    this.blockSize = blockSize;
	    this.readTerrainImage(filename, this.imageLoadHandler.bind(this, callback));
	};
	
	/*
	*
	* Iterate over the grid of rgb + alpha values
	* KJZ I think this just takes the terrainData and blows it out by chunksize?
	* Yeah and it seems changing chunk size breaks this.
	* essentially the pixel data is too small for a 1x1 mapping in 3d and this expands it?
	*/
	TerrainLoader.prototype.readTerrainData = function (terrainData) {
	    var worldMap = new Array(terrainData.length);
	    for (var i = 0; i < worldMap.length; i++) {
	        worldMap[i] = new Array();
	    }
	
	    this.mapHeight = this.blockSize * terrainData.length;
	    this.mapWidth = this.blockSize * terrainData.length;
	
	    for (var chunkY = 0; chunkY < terrainData.length; chunkY += this.chunkSize) {
	        var alpha = 0;
	        var total = 0;
	        var chunk = new Array();
	        for (var chunkX = 0; chunkX < terrainData.length; chunkX += this.chunkSize) {
	            var ix = 0;
	            for (var x = chunkX; x < chunkX + this.chunkSize; x++) {
	                chunk[ix] = new Array();
	                var iy = 0;
	                for (var y = chunkY; y < chunkY + this.chunkSize; y++) {
	                    if (terrainData[x][y] == 0) {
	                        alpha++;
	                    } else {
	                        this.blocks++;
	                    }
	                    chunk[ix][iy++] = terrainData[x][y];
	                    total++;
	                }
	                ix++;
	            }
	            var cSize = this.blockSize;
	
	            if (total != alpha) {
	                //this is the data structure for making chunks
	                var terrainChunk = {
	                    posX: chunkX * cSize - this.blockSize / 2,
	                    posY: chunkY * cSize - this.blockSize / 2,
	                    /* wtf */
	                    //this is actually passing a subset of the map color data {a r g b}
	                    //Its used to determine the chunks height for blocks
	                    mapData: chunk.splice(0), //KJZ wtf this is being silently mutated
	                    //because its defined in the parent loop
	                    //looks like it is a subset of the RGBA data for that chunk.
	                    //chunk manager calls this 'blocks'
	                    id: this.chunks
	                };
	
	                /*
	                *
	                * TODO KJZ there used to be a 'worldMap'
	                * data structure generated here in addition to the chunks
	                * This was used in all the chunkmanager calculations.
	                * maybe I can consolidate it with the chunk list?
	                */
	
	                // Save to world map
	                var z = this.chunks % (terrainData.length / this.chunkSize);
	                var x = Math.floor(this.chunks / (terrainData.length / this.chunkSize));
	                worldMap[x][z] = Object.assign({
	                    'id': this.chunks,
	                    'avgHeight': 0 }, //Height of blocks
	                terrainChunk);
	                this.chunks++;
	            } else {
	                console.log("=> Skipping invisible chunk.");
	            }
	        }
	    }
	
	    return {
	        worldMap: worldMap
	    };
	};
	
	/*
	* Iterate over all the pixels from image data and create
	* a grid of rgb and alpha values
	*/
	TerrainLoader.prototype.processTerrainImageData = function (imgData) {
	    var terrainData = [];
	
	    for (var y = 0; y < this.height; y++) {
	        var pos = y * this.width * 4;
	        terrainData[y] = new Array();
	        for (var x = 0; x < this.width; x++) {
	            var r = imgData.data[pos++];
	            var g = imgData.data[pos++];
	            var b = imgData.data[pos++];
	            var a = imgData.data[pos++];
	            terrainData[y][x] = { 'r': r, 'g': g, 'b': b, 'a': a };
	        }
	    }
	
	    return terrainData;
	};
	
	TerrainLoader.prototype.extractTerrainImageData = function (e) {
	    /*
	    * Get raw image pixel data, from an image tag load event image reference
	    */
	    throw "theres no extractTerrain implemented";
	};
	
	TerrainLoader.prototype.readTerrainImage = function (filename, callback) {
	    // Read png file binary and get color for each pixel
	    // one pixel = one block
	    // Read RGBA (alpha is height)
	    // 255 = max height
	    // a < 50 = floor
	    throw "unimplemented readTerrainImage";
	};
	
	module.exports = TerrainLoader;

/***/ }
/******/ ]);
//# sourceMappingURL=server.js.map