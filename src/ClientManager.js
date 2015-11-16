const THREE = require('./ThreeHelpers');

/* responsible for rendering different clients */
function ClientManager(props){
  this.viewAngle = 40;
  this.aspect = window.innerWidth/window.innerHeight;
  this.near = 1;
  this.far = 61;
  this.player_entity = null;
  this.container = null;

  Object.assign(this, props);  
  
  this.camera = new THREE.PerspectiveCamera(this.viewAngle, this.aspect, this.near, this.far);
  window.camera = this.camera;

  this.renderer = new THREE.WebGLRenderer( {antialias: true} );
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  this.renderer.shadowMapEnabled = true;
  this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
  
  this.keyboard = new THREEx.KeyboardState();

  this.Game.render_container.appendChild(this.renderer.domElement);

  THREEx.WindowResize(this.renderer, this.camera);
  this.fogColor = 0xeddeab;
  this.clearColor = 0xeddeab;
  this.scene.fog = new THREE.Fog( this.fogColor, 40, 60 );
  this.renderer.setClearColor(this.clearColor, 1);

  this.initPlayerCamera(this.player_entity);

  // Init lights
  this.setLights();
};

ClientManager.prototype.setLights = function() {
    console.log("Initiate lights...");
    var ambientLight = new THREE.AmbientLight( 0x000033 );
    this.scene.add( ambientLight );

    var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.9 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    hemiLight.position.set( 0, 500, 0 );
    this.scene.add( hemiLight );

    var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set( 10, 10.75, 10 );
    dirLight.position.multiplyScalar( 10 );
    this.scene.add( dirLight );

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

ClientManager.prototype.render = function(){
    this.renderer.render(this.scene, this.camera);
};

ClientManager.prototype.initPlayerCamera = function(player_entity){
    player_entity.camera_obj = new THREE.Object3D();
    player_entity.mesh.add(player_entity.camera_obj);
    player_entity.camera_obj.add(this.camera);
    player_entity.attached_camera = 1;
    this.camera.position.set(0, 15, 7);
    this.camera.rotation.set(-Math.PI/2.6, 0, Math.PI);
    debugger;
    //player_entity.addBehavior('CaptureLocalUserInput');
};

module.exports = ClientManager;







