var distanceValue = "000";
var distanceField, texture,texture1;

function initialize(){
  Colors = {
    red:0xF25346,
    white:0xFFFFFF,
    yellow:0xF0E68C,
    blue:0x68C3C0,
    pink: 0xFAAFBE,
    black: 0x000000,
    green: 0x38761D,
    brown: 0x512B04,
    springGreen: 0x4AA02C,
    steelBlue: 0x4682B4
  };

  gameVariables = {
    textureLoaded: true,
    speedFactor: 1,
    speed: 0,
    baseSpeed: 0.00037,
    grassRotation: 0.0008,
    skyRotation: 0.0004,
    view: 90,
    rr: 0,

    deltaTime: 0,
    distance: 10,
    ratioSpeedDistance: 50,
    near: 10,
    far: 1000,
    farLight: 100,
  

    duckInitialHeight: 100,
    duckEndPositionY: 0.5,
    duckEndRotationY: 0.01,
    planeHeight: 90,
    duckSpeed: 0,
    wingRotation: 0.1,

    grassRadius: 650,
    grassLength: 1200,

    fishKeepDistance: 10,
    scoreValue: 5,
    fishSpeed: 0.7,
    fishLastAdd: 0,
    distanceAddFish: 115,

    obstacleKeepDistance: 10,
    obstacleLastAdd: 0,
    distanceAddObstacle: 170,
    score: 0,
    level: 0,
    life: 3,
    play: true,
    isGameOver: false,
  };
}

var scene, camera, renderer, container, ambientLight, hemisphereLight, directionalLight;

var newTime = new Date().getTime();
var oldTime = new Date().getTime();

var HEIGHT, WIDTH;

function CylinderGeom(topRad, BottomRad, height, Segments, color,
  x, y, z) {
  var geom = new THREE.CylinderGeometry(topRad, BottomRad, height, Segments);
  var mat = new THREE.MeshPhongMaterial({ color: color, flatShading: true });
  var cylinder = new THREE.Mesh(geom, mat);
  cylinder.castShadow = true;
  cylinder.receiveShadow = true;
  cylinder.position.set(x, y, z);
  return cylinder;
}
function SphereGeometry(topRad, BottomRad, height, Segments, color,
  x, y, z) {
  var geom = new THREE.SphereGeometry(topRad, BottomRad, height, Segments);
  var mat = new THREE.MeshPhongMaterial({ color: color, flatShading: true });
  var sphere = new THREE.Mesh(geom, mat);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  sphere.position.set(x, y, z);
  return sphere;
}


function configureTextureGrass() {
  texture = new THREE.TextureLoader().load("Textures/pratofiorito.png");
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
}

function configureTextureObstacle() {
  texture1 = new THREE.TextureLoader().load("Textures/rock.jpg");
  texture1.wrapS = THREE.ClampToEdgeWrapping;
  texture1.wrapT = THREE.ClampToEdgeWrapping;
}


function createScene() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  scene = new THREE.Scene();
  gameVariables.rr = WIDTH / HEIGHT;
  camera = new THREE.PerspectiveCamera(
    gameVariables.view,
    gameVariables.rr,
    gameVariables.near,
    gameVariables.far
  );
  scene.fog = new THREE.Fog(0xf7d9aa, 100,950);
  camera.position.x = 30;
  camera.position.z = 350;
  camera.position.y = 90;

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  renderer.setSize(WIDTH, HEIGHT);
  renderer.shadowMap.enabled = true;
  container = document.getElementById('scenario');
  container.appendChild(renderer.domElement);
  window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}
//
function createLightsAndShadows() {
  ambientLight = new THREE.AmbientLight(0xffffff);
  hemisphereLight = new THREE.HemisphereLight(0x808080,0x000000, 1);
  directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
  directionalLight.position.set(50,90,300);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.left = -400;
  directionalLight.shadow.camera.right = 300;
  directionalLight.shadow.camera.top = 300;
  directionalLight.shadow.camera.bottom = -300;
  directionalLight.shadow.camera.near = gameVariables.near;
  directionalLight.shadow.camera.far = gameVariables.farLight;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(hemisphereLight);
  scene.add(directionalLight);

}

Duck = function(color, transparent, setOpacity){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "duck";
  //Body
  var geomBody = new THREE.SphereGeometry( 50, 40, 40 );
  geomBody.applyMatrix( new THREE.Matrix4().makeScale( 3, 1, 1 ) );
  var matBody = new THREE.MeshPhongMaterial({
    color:Colors.white,
    flatShading:THREE.FlatShading,
    opacity: setOpacity,
    transparent:transparent
  });
  var body = new THREE.Mesh(geomBody, matBody);
  body.castShadow = true;
  body.receiveShadow = true;
  this.mesh.add(body);
//Neck
var geomNeck = new THREE.BoxGeometry( 40, 25, 30 );
var matNeck = new THREE.MeshPhongMaterial({
    color:Colors.brown,
    flatShading:THREE.FlatShading,
    opacity: setOpacity,
    transparent:transparent
  });
  this.neck = new THREE.Mesh(geomNeck, matNeck);
  this.neck.position.set(160,0,0);
  this.neck.castShadow = true;
  this.neck.receiveShadow = true;
  this.mesh.add(this.neck);
  //Head
  var geomHead = new THREE.SphereGeometry(35,35,20);
  geomHead.applyMatrix( new THREE.Matrix4().makeScale(1.2, 0.8, 0.6));
  var matHead = new THREE.MeshPhongMaterial({
    color:Colors.green,
    flatShading:THREE.FlatShading,
    opacity: setOpacity,
    transparent:transparent
  });
  this.head = new THREE.Mesh(geomHead, matHead);
  this.head.position.set(210,0,0);
  this.head.castShadow = true;
  this.head.receiveShadow = true;
  this.mesh.add(this.head);
 
  //Eye
  var geomEye = new THREE.SphereGeometry(9,9,9);
  geomEye.applyMatrix( new THREE.Matrix4().makeScale(1.2, 0.8, 0.6));
  var matEye = new THREE.MeshPhongMaterial({
    color: Colors.black,
    flatShading: THREE.FlatShading,
    opacity: setOpacity,
    transparent: transparent
  });
  this.eye = new THREE.Mesh(geomEye, matEye);
  this.eye.position.set(210,1,20);
  this.eye.castShadow = true;
  this.eye.receiveShadow = true;
  this.mesh.add(this.eye);
 //Beak
  var geomBeak = new THREE.CylinderGeometry(20, 40, 20);
  var matBeak = new THREE.MeshPhongMaterial({
   color: Colors.red,
   flatShading: THREE.FlatShading,
   opacity: setOpacity,
   transparent: transparent
  });
  this.beak = new THREE.Mesh(geomBeak, matBeak);
  this.beak.position.set(230,0,-9);
  this.beak.castShadow = true;
  this.beak.receiveShadow = true;
  this.mesh.add(this.beak);
  //Wing dx
  var geomSideDXWing = new THREE.BoxGeometry(100,8,100);
  var matSideDXWing = new THREE.MeshPhongMaterial({
    color:Colors.brown,
    flatShading:THREE.FlatShading,
    opacity: setOpacity,
    transparent:transparent
  });
  this.sideDXWing = new THREE.Mesh(geomSideDXWing, matSideDXWing);
  this.sideDXWing.position.set(0,0,30);
  this.sideDXWing.castShadow = true;
  this.sideDXWing.receiveShadow = true;
  this.mesh.add(this.sideDXWing);
  geomSideDXWing.vertices[4].y+=5;
  geomSideDXWing.vertices[5].y+=5;
  geomSideDXWing.vertices[5].z+=4;
  geomSideDXWing.vertices[7].z+=4;
  //Wing sx
  var geomSideSXWing = new THREE.BoxGeometry(100,8,100);
  var matSideSXWing = new THREE.MeshPhongMaterial({
    color:Colors.brown,
    flatShading:THREE.FlatShading,
    opacity: setOpacity,
    transparent:transparent
  });
  this.sideSXWing = new THREE.Mesh(geomSideSXWing, matSideSXWing);
  this.sideSXWing.position.set(0,0,-30);
  this.sideSXWing.castShadow = true;
  this.sideSXWing.receiveShadow = true;
  this.mesh.add(this.sideSXWing);
  geomSideSXWing.vertices[4].y+=5;
  geomSideSXWing.vertices[5].y+=5;
  geomSideSXWing.vertices[5].z-=4;
  geomSideSXWing.vertices[7].z-=4;
  //Tail
  var geomTail = new THREE.CylinderGeometry(30,60,5);
  var matTail = new THREE.MeshPhongMaterial({
    color:Colors.brown,
    flatShading:THREE.FlatShading,
    opacity: setOpacity,
    transparent:transparent
  });
  this.tail = new THREE.Mesh(geomTail, matTail);
  this.tail.position.set(-150,15,0);
  this.tail.castShadow = true;
  this.tail.receiveShadow = true;
  this.mesh.add(this.tail);
  // Leg Dx
  var geomLegDX = new THREE.BoxGeometry(90,10,10);
  var matLegDX = new THREE.MeshPhongMaterial({
    color:Colors.red,
    flatShading:THREE.FlatShading,
    opacity: setOpacity,
    transparent:transparent
  });
  this.LegDX = new THREE.Mesh(geomLegDX, matLegDX);
  this.LegDX.position.set(-100,-30,30);
  this.LegDX.castShadow = true;
  this.LegDX.receiveShadow = true;
  this.mesh.add(this.LegDX);
  // Leg Sx
  var geomLegSX = new THREE.BoxGeometry(90,10,10);
  var matLegSX = new THREE.MeshPhongMaterial({
    color: Colors.red,
    flatShading:THREE.FlatShading,
    opacity: setOpacity,
    transparent:transparent
  });
  this.LegSX = new THREE.Mesh(geomLegSX, matLegSX);
  this.LegSX.position.set(-100,-35,0);
  this.LegSX.castShadow = true;
  this.LegSX.receiveShadow = true;
  this.mesh.add(this.LegSX);
}


function Tree() {

  this.mesh = new THREE.Object3D();
  var top = CylinderGeom(1, 100, 100, 4, Colors.green, 0, 370, 0);
  var mid = CylinderGeom(1, 150, 150, 4, Colors.green, 0, 300, 0);
  var mid1 = CylinderGeom(1, 150, 200, 4, Colors.green, 0, 250, 0);
  var bottom = CylinderGeom(1, 190, 200, 4, Colors.green, 0, 150, 0);
  var trunk = CylinderGeom(10, 10, 150, 32, Colors.brown, 0, 0, 0);

  this.mesh.add(top);
  this.mesh.add(mid);
  this.mesh.add(mid1);
  this.mesh.add(bottom);
  this.mesh.add(trunk);

}


Sky = function(){
  this.mesh = new THREE.Object3D();
  this.numElem = 12;
  this.trees = [];
  var stepToAdd = Math.PI*2 / this.numElem;
  for(var i=0; i<this.numElem; i++){
    var c = new Tree();
    var s = 0.40+Math.random()*0.15;
    this.trees.push(c);
    var a = stepToAdd*i;
    var h = 650
    c.mesh.position.z = -100;
    c.mesh.rotation.z = a + Math.PI/-2;
    c.mesh.position.y = Math.sin(a)*h;
    c.mesh.position.x = Math.cos(a)*h;
    c.mesh.scale.set(s,s,s);
    this.mesh.add(c.mesh);
  }
 
}

Grass = function(){
  var geomGrass = new THREE.CylinderGeometry(gameVariables.grassRadius, gameVariables.grassRadius, gameVariables.grassLength, 200, 300);
  geomGrass.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
 
  if(gameVariables.textureLoaded)
  matGrass = new THREE.MeshPhongMaterial( {
    map: texture,
    side: THREE.DoubleSide
     });
  else
  matGrass = new THREE.MeshPhongMaterial({
  color:Colors.green,
  flatShading:THREE.FlatShading
  });

  this.mesh = new THREE.Mesh(geomGrass, matGrass);
  this.mesh.receiveShadow = true;
}


Obstacle = function(){
 
  var geom = new THREE.SphereBufferGeometry(15, 9, 7);
  if(gameVariables.textureLoaded)
  var mat = new THREE.MeshPhongMaterial({
    map: texture1,
    side: THREE.DoubleSide
  });
  else
  matGrass = new THREE.MeshPhongMaterial({
  color:Colors.green,
  flatShading:THREE.FlatShading
  });

  this.mesh = new THREE.Mesh(geom,mat);
  this.mesh.castShadow = true;
  this.angle = 0;
  this.dist = 0;
}

ObstacleOwner = function (){
  this.mesh = new THREE.Object3D();
  this.obstacleInScene = [];
  this.obstacleStock = [];
  var obstacle = new Obstacle();
  this.obstacleStock.push(obstacle);
}

ObstacleOwner.prototype.addObstacle = function(){
  var obstacle;
  var dist = gameVariables.grassRadius + gameVariables.duckInitialHeight + (-1 + Math.random() * 2) * (gameVariables.planeHeight-20);
  if (this.obstacleStock.length) {
    obstacle = this.obstacleStock.pop();
  }else{
    obstacle = new Obstacle();
  }
  this.mesh.add(obstacle.mesh);
  this.obstacleInScene.push(obstacle);
  obstacle.angle = -0.5;
  obstacle.distance = dist + Math.cos(0.7);
  obstacle.mesh.position.y = -gameVariables.grassRadius + Math.sin(obstacle.angle ) * obstacle.distance;
  obstacle.mesh.position.x = Math.cos(obstacle.angle) * obstacle.distance;
  
}


ObstacleOwner.prototype.obstacleAnimation = function(){
  for (var i=0; i < this.obstacleInScene.length; i++){
    var obstacle = this.obstacleInScene[i];
    if (obstacle.exploding)
      continue;
    obstacle.angle += gameVariables.speed * gameVariables.deltaTime * gameVariables.fishSpeed;
    if(obstacle.angle > Math.PI*2)
      obstacle.angle -= Math.PI*2;
    obstacle.mesh.position.y = -(gameVariables.grassRadius-100) + Math.sin(obstacle.angle) * obstacle.distance;
    obstacle.mesh.position.x = Math.cos(obstacle.angle) * (obstacle.distance * gameVariables.speedFactor);
    obstacle.mesh.rotation.y = Math.PI*.2;
    obstacle.mesh.rotation.z = Math.PI*.2;
    var dist = duck.mesh.position.clone().sub(obstacle.mesh.position.clone()).length();
    if(dist < gameVariables.obstacleKeepDistance){
      updateLife();
      this.obstacleStock.unshift(this.obstacleInScene.splice(i,1)[0]);
      duck.mesh.position.x -= 30;
      this.mesh.remove(obstacle.mesh);
      ambientLight.intensity = 2;
      if(scene.children[4].name == "Duck") {
        var visible = false;
        var opacity = 1.0;
        alarmmsg.style.opacity = opacity;
        alarmmsg.style.display="block";
        var timer = setInterval(function () {
          if (opacity <= 0){
            visible = true;
            alarmmsg.style.display = "none";
            scene.children[4].visible = visible;
            clearInterval(timer);
          }
          scene.children[4].visible = visible;
          visible = !visible;
          alarmmsg.style.opacity = opacity;
          alarmmsg.style.filter = 'alpha(opacity=' + opacity + ")";
          opacity -= 0.03;
        }, 50);
    }
      i--;
    }
  }
}

Fish = function(){
  this.mesh = new THREE.Object3D();
 
  var head = CylinderGeom(2, 7, 15, 2 , Colors.steelBlue, 0, 8, 0);
  var body = SphereGeometry(8, 1, 8, 10, Colors.steelBlue, 0, 0, 0);
  var eye = SphereGeometry(1, 1, 1, 30, Colors.white, 0, 12, 0);
  var tail = CylinderGeom(3, 10, 10, 2, Colors.steelBlue, 0, -12, 0);

  this.mesh.add(head);
  this.mesh.add(body);
  this.mesh.add(tail);
  this.mesh.add(eye);


  
}

FishOwner = function (num){
  this.mesh = new THREE.Object3D();
  this.fishInScene = [];
  this.fishStock = [];
  for (var i=0; i<num; i++){
    var fish = new Fish();
    this.fishStock.push(fish);
  }
}

FishOwner.prototype.addFish = function(){
  var num = Math.floor(Math.random()*5)+2;
  var amp = Math.round(Math.random()*10);
  var dist = gameVariables.grassRadius + gameVariables.duckInitialHeight + (-1 + Math.random() * 2) * (gameVariables.planeHeight-20);
  for (var i=0; i<num; i++){
    var fish;
    if (this.fishStock.length) {
      fish = this.fishStock.pop();
    }else{
      fish = new Fish();
    }
    this.mesh.add(fish.mesh);
    this.fishInScene.push(fish);
    fish.distance = dist + Math.cos(i*.5)*amp;
    fish.angle = -(i*0.02);
    fish.mesh.position.y = -gameVariables.grassRadius + Math.sin(fish.angle) * fish.distance;
    fish.mesh.position.x = Math.cos(fish.angle) * fish.distance;
  }
}

FishOwner.prototype.fishAnimation = function(){
  for (var i=0; i<this.fishInScene.length; i++){
    var fish = this.fishInScene[i];
    fish.angle += gameVariables.speed * gameVariables.deltaTime * gameVariables.fishSpeed;
    if(fish.angle > Math.PI*2)
      fish.angle -= Math.PI*2;
    fish.mesh.position.x = Math.cos(fish.angle) * (fish.distance * gameVariables.speedFactor);
    fish.mesh.position.y = -(gameVariables.grassRadius-100) + Math.sin(fish.angle) * fish.distance;
    fish.mesh.rotation.y += Math.random()*.1;
    fish.mesh.rotation.z += Math.random()*.1;
    var dist = duck.mesh.position.clone().sub(fish.mesh.position.clone()).length();
    if(dist < gameVariables.fishKeepDistance){
      updateScore();
      if(pointWin.style.display!="block") {
        var opacity = 1.0;
        pointWin.style.display="block";
        var timer = setInterval(function () {
          if (opacity <= 0){
              clearInterval(timer);
              pointWin.style.display = "none";
          }
          pointWin.style.opacity = opacity;
          pointWin.style.filter = 'alpha(opacity=' + opacity + ")";
          opacity -= 0.03;
        }, 50);
      }
      this.fishStock.unshift(this.fishInScene.splice(i,1)[0]);
      this.mesh.remove(fish.mesh);
      i--;
    }
  }
}

var grass, duck, sky, fishOwner, obstacleOwner;

function createGrass(){
  grass = new Grass();
  grass.mesh.position.y = -580;
  scene.add(grass.mesh);
}

function createSky(){
  sky = new Sky();
  sky.mesh.position.y = -580;
  scene.add(sky.mesh);
}

function createDuck(){
  duck = new Duck(Colors.pink, false, 1.0);
  duck.mesh.scale.set(0.28,0.28,0.28);
  duck.mesh.position.y = gameVariables.duckInitialHeight;
  duck.mesh.position.z = 0;
  scene.add(duck.mesh);
}

function createTree() {
  tree = new Tree();
  tree.mesh.scale.set(0.25, 0.25, 0.25);
  tree.mesh.position.y = 100;
  scene.add(tree.mesh);
}


function createFish(){
  fishOwner = new FishOwner(100);
  scene.add(fishOwner.mesh)
}

function createObstacle(){
  obstacleOwner = new ObstacleOwner(100);
  scene.add(obstacleOwner.mesh)
  
}

function loop(){
  newTime = new Date().getTime();
  gameVariables.deltaTime = newTime - oldTime;
  oldTime = newTime;
  if(gameVariables.play) {
    if (Math.floor(gameVariables.distance) % gameVariables.distanceAddFish == 0 && Math.floor(gameVariables.distance) > gameVariables.fishLastAdd){
      gameVariables.fishLastAdd = Math.floor(gameVariables.distance);
      fishOwner.addFish();
    }
    if (Math.floor(gameVariables.distance) % gameVariables.distanceAddObstacle == 0 && Math.floor(gameVariables.distance) > gameVariables.obstacleLastAdd){
      gameVariables.obstacleLastAdd = Math.floor(gameVariables.distance);
      obstacleOwner.addObstacle();
    }
    if(gameVariables.life == 0){
      gameVariables.isGameOver = true;
      showGameOver();
    }
    updateDuck();
    zoom();
    updateDistance();
    gameVariables.speed = gameVariables.baseSpeed * gameVariables.duckSpeed;
    fishOwner.fishAnimation();
    obstacleOwner.obstacleAnimation();
    grass.mesh.rotation.z += gameVariables.grassRotation;
    sky.mesh.rotation.z += gameVariables.skyRotation;
   
    var time = Date.now() * 0.0005;
    directionalLight.position.x = (Math.cos(time*0.05) *100);
    directionalLight.position.z = (Math.sin(time*0.05) *100);
    //hemisphereLight.intensity = (Math.cos(time*0.05) *100);
    //hemisphereLight.intensity = Math.min(0.1);

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
}

function preInit() {
  var scene = document.getElementById("scenario");
  scene.style.display = "none";
  document.getElementById("startButton").onclick = function ()  {
    init();
  };
}

function init(){
  var scene = document.getElementById("scenario");
  var presentation = document.getElementById("presentation");
  presentation.style.display = "none";
  scene.style.display = "block";
  distanceField = distanceValue;
  document.addEventListener('keydown', manageAnimation, false);
  gameOver = document.getElementById("gameOver");
  totalScore = document.getElementById("totalScore");
  currentLevel = document.getElementById("currentLevel");
  pauseGame = document.getElementById("pauseGame");
  alarmMsg = document.getElementById("alarmmsg");
  pointWin = document.getElementById("pointWin");
  document.getElementById("pageReset").onclick = function(){
    window.location.reload();
  };
  document.getElementById("muteAudio").onclick = function(){
    muteAudio();
  };
  document.getElementById("volumeSlider").onchange = function(event){
    volume = parseFloat(event.target.value);
    for(let i = 0; i < tracks.length; i++){
      sounds[i].setVolume(volume);
    }
  }
  document.addEventListener('mousemove', mouseMove, false);
  audioListener = new THREE.AudioListener();
  initialize();
  configureTextureGrass();
  configureTextureObstacle();
  createScene();
  createLightsAndShadows();
  createGrass();
  createSky();
  createDuck();
  createFish();
  createObstacle();
  ambientMusic();
  loop();
}

// Sound variables
var sound, audioListener, audioLoader;
var volume = 0.3;
const tracks = ["Audio/springSounds.mp3"];
var sounds = [];
var mute = false;

function ambientMusic() {
  audioLoader = new THREE.AudioLoader();
  for (let i = 0; i < tracks.length; i++) {
    sounds[i] = new THREE.Audio(audioListener);
    audioLoader.load(tracks[i], function(buffer) {
    	sounds[i].setBuffer(buffer);
    	sounds[i].setLoop(true);
    	sounds[i].setVolume(volume);
      if (i == 0) {
        sound = sounds[0];
        sound.play();
      }
    });
  }
}


function muteAudio(){
  if(mute){
    document.getElementById("muteAudio").innerHTML = "MUTE AUDIO";
    mute = false;
    if(gameVariables.play)
      sounds[0].play();
  }
  else{
    document.getElementById("muteAudio").innerHTML = "AUDIO ON";
    mute = true;
    sound.pause();
  }
}

function manageAnimation(event) {
  if(gameOver.style.display != "block") {
    if (event.keyCode == 32){
      gameVariables.play = !gameVariables.play;
      if (!gameVariables.play){
        pauseGame.style.display="block";
        if(!mute)
          sounds[0].pause();
        else {
          sounds[0].setVolume(0);
        }
        sounds[0].play();
      }
      else {
        pauseGame.style.display="none";
        sounds[0].pause();
        if(!mute){
          sounds[0].setVolume(volume);
          sounds[0].play();
        }
        else{
          sounds[0].setVolume(0);
        }
        loop();
      }
    }
  }
}

var mouse = {x:0, y:0};
function mouseMove(event) {
  var xAxis = -1 + (event.clientX / WIDTH) * 2;
  var yAxis = 1 - (event.clientY / HEIGHT) * 2;
  mouse = {x:xAxis, y:yAxis};
}

function move() {
  //Fly margins
  var duckX = fly(mouse.x, -1, 1, -100, 100);
  var duckY = fly(mouse.y, -1, 1, 100, 258);
  //Movements
  duck.mesh.position.y += (duckY - duck.mesh.position.y) * 0.1;
  duck.mesh.rotation.x = (duck.mesh.position.y - duckY) * 0.005;
  duck.mesh.rotation.z = (duckY - duck.mesh.position.y) * 0.01;
  duck.LegDX.rotation.z = (duckY - duck.mesh.position.y) * -0.03;
  duck.LegSX.rotation.z = (duckY - duck.mesh.position.y) * -0.03;
  duck.tail.rotation.z =  ( duck.mesh.position.y - duckY ) * -0.03;
}

function fly(mouse, minM, maxM, minR, maxR) {
  var border = Math.max(Math.min(mouse, maxM), minM);
  var middleM = maxM - minM;
  var delay = (border - minM) / middleM;
  var middleR = maxR - minR;
  var result = minR + (delay * middleR);
  return result;
}

function zoom() {
  camera.fov = fly(mouse.x, -1, 1, 70, 90);
  camera.updateProjectionMatrix();
}

function roundToOneValue(v,vmin,vmax,tmin,tmax){
  var nv = Math.max(Math.min(v,vmax), vmin);
  var dv = vmax-vmin;
  var pc = (nv-vmin)/dv;
  var dt = tmax-tmin;
  var tv = tmin + (pc*dt);
  return tv;
}

function updateDistance(){
  gameVariables.distance += gameVariables.speed * gameVariables.deltaTime * gameVariables.ratioSpeedDistance;
}

function updateDuck(){
  gameVariables.duckSpeed = roundToOneValue(0,-0.6,0.6, 0.9, 2);
  if(duck.sideDXWing.rotation.x > 0.8 || duck.sideDXWing.rotation.x < -0.8)
    gameVariables.wingRotation *= -1;
  duck.sideDXWing.rotation.x += gameVariables.wingRotation;
  duck.sideSXWing.rotation.x += -gameVariables.wingRotation;
  move();
}

function updateScore() {
  if(!gameVariables.isGameOver){
    gameVariables.score += gameVariables.scoreValue;
    var value = document.getElementById("score");
    value.textContent= gameVariables.score;
    if(gameVariables.score % 100 == 0 && gameVariables.score != 0)
      updateLevelandSpeed();
  }
}

function updateLife() {
  if(gameVariables.life > 0) {
    gameVariables.life -= 1;
    var value = document.getElementById("life");
    value.textContent = gameVariables.life;
  }
}

function updateLevelandSpeed() {
  gameVariables.level += 1;
  var value = document.getElementById("level");
  value.textContent = gameVariables.level;
  gameVariables.skyRotation += 0.0006;
  gameVariables.grassRotation += 0.0006;
  gameVariables.speedFactor += 0.26;
}

function showGameOver(){
  gameVariables.play = false;
  var timer = setInterval(function(){
    if (duck.mesh.position.y <= -50){
        gameVariables.play = false;
        clearInterval(timer);
    }
    duck.mesh.position.y -= gameVariables.duckEndPositionY;
    duck.mesh.rotation.y -= gameVariables.duckEndRotationY;
  }, 100);
  if(gameOver.style.display != "block" && totalScore.style.display != "block" && currentLevel.style.display != "block") {
    totalScore.textContent += gameVariables.score;
    currentLevel.textContent += gameVariables.level;
    gameOver.style.display = "block";
    totalScore.style.display = "block";
    currentLevel.style.display = "block";
  }
}

window.addEventListener('load', preInit, false);
