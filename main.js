import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js"; // Import FBXLoader

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const scene = new THREE.Scene();
const canvas = document.getElementById("canvas");
let characterControl;
let signboard;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const loader = new GLTFLoader();
const fbxLoader = new FBXLoader();

let mixer; // Declare mixer for animation

// Create loading screen elements
const loadingScreen = document.createElement('div');
loadingScreen.id = 'loadingScreen';
loadingScreen.style.position = 'fixed';
loadingScreen.style.top = '0';
loadingScreen.style.left = '0';
loadingScreen.style.width = '100%';
loadingScreen.style.height = '100%';
loadingScreen.style.backgroundColor = 'rgba(0, 0, 0, 1)';
loadingScreen.style.color = 'white';
loadingScreen.style.display = 'flex';
loadingScreen.style.flexDirection = 'column';
loadingScreen.style.justifyContent = 'center';
loadingScreen.style.alignItems = 'center';
loadingScreen.style.fontSize = '24px';

// Create loading text
const loadingText = document.createElement('div');
loadingText.innerHTML = 'Generating World 0%';
loadingScreen.appendChild(loadingText);

// Create loading bar container
const loadingBarContainer = document.createElement('div');
loadingBarContainer.style.width = '50%';
loadingBarContainer.style.height = '10px';
loadingBarContainer.style.backgroundColor = '#333';
loadingBarContainer.style.borderRadius = '5px';
loadingBarContainer.style.marginTop = '50px';

// Create loading bar
const loadingBar = document.createElement('div');
loadingBar.style.width = '0%';
loadingBar.style.height = '100%';
loadingBar.style.backgroundColor = 'white';
loadingBar.style.borderRadius = '5px';

// Append loading bar to container
loadingBarContainer.appendChild(loadingBar);
loadingScreen.appendChild(loadingBarContainer);

document.body.appendChild(loadingScreen);

let loadedModels = 0;
const totalModels = 17; // Update this count based on the total number of models
let currentProgress = 0; // Track current progress for smooth transition
let loadingComplete = false; // Track if loading is complete

function updateLoadingScreen() {
  loadedModels++;
  const targetProgress = Math.floor((loadedModels / totalModels) * 100);
  
  // Smoothly update the progress
  const updateInterval = setInterval(() => {
    if (currentProgress < targetProgress) {
      currentProgress++;
      loadingText.innerHTML = `Generating World ${currentProgress}%`;
      loadingBar.style.width = `${currentProgress}%`;
    } else {
      clearInterval(updateInterval);
      if (loadedModels === totalModels) {
        setTimeout(() => {
          loadingScreen.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
          loadingScreen.style.opacity = '0';
          loadingScreen.style.transform = 'translateY(-100%)';
          setTimeout(() => {
            loadingScreen.style.display = 'none';
            loadingComplete = true; // Set loading complete to true
          }, 1000);
        }, 500);
      }
    }
  }, 10); // Adjust the interval time for smoother or faster transitions
}

const models = [
  { path: "./models/mystical_forest_cartoon.glb", scale: 0.01, position: [0, 0, 0], rotation: [0, 0, 0] },
  { path: "./models/my_avatar.glb", scale: 2, position: [-3, 2, 50], rotation: [0, Math.PI, 0], isAvatar: true },
  { path: "./models/Charzard Flying.glb", scale: 3, position: [0, 20, 0], rotation: [0, 0, 0], isCharizard: true },
  { path: "./models/phantump_shiny.glb", scale: 0.01, position: [3, 5, 9], rotation: [0, 0, 0] },
  { path: "./models/salamence.glb", scale: 0.3, position: [-30, 16, 27], rotation: [0, (Math.PI * 2) / 3, 0] },
  { path: "./models/bulbasaur.glb", scale: 2, position: [13, -0.5, 22], rotation: [0, 0, 0] },
  { path: "./models/lucario_and_riolu_toy_edition.glb", scale: 2, position: [-27, 6.5, 6], rotation: [0, Math.PI / 3, 0] },
  { path: "./models/eevee.glb", scale: 3.5, position: [7, 0, 10], rotation: [0, 0, 0] },
  { path: "./models/pikachu.glb", scale: 0.03, position: [5, 0, 10], rotation: [0, 0, 0] },
  { path: "./models/umbreon.glb", scale: 3, position: [6, 0, 10], rotation: [0, 0, 0] },
  { path: "./models/pidgey.glb", scale: 0.4, position: [-2.5, 7, 32], rotation: [0, Math.PI, 0] },
  { path: "./models/arcanine.glb", scale: 1, position: [10, 3.2, 29], rotation: [0, (-Math.PI * 3) / 4, 0] },
  { path: "./models/ssbb_pokemon_trainer.glb", scale: 0.4, position: [-14, 3, 21], rotation: [0, Math.PI / 2, 0], isTrainer: true },
  { path: "./models/plakia.glb", scale: 0.6, position: [-32, 23, -19], rotation: [0, Math.PI / 2, 0] },
  { path: "./models/entei.glb", scale: 0.4, position: [-25, 15.5, -4], rotation: [0, Math.PI / 2, 0] },
  { path: "./models/reshiram.glb", scale: 3.5, position: [60, 23, -14], rotation: [0, -Math.PI / 4, 0] },
  { path: "./models/old_medieval_sign_board.glb", scale: 7, position: [3, 0, 44], rotation: [0, 0, 0], isSignboard: true }
];

models.forEach(model => {
  loader.load(model.path, function (glb) {
    const obj = glb.scene;
    obj.scale.set(...Array(3).fill(model.scale));
    obj.position.set(...model.position);
    obj.rotation.set(...model.rotation);
    obj.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(obj);

    if (model.isAvatar) {
      mixer = new THREE.AnimationMixer(obj);
      characterControl = new CharacterControl(obj, mixer, new Map(), controls, camera, "idle");
    }

    if (model.isCharizard) {
      charizard = obj; // Assign charizard
      obj.initialY = obj.position.y;
    }

    if (model.isTrainer) {
      obj.traverse(child => {
        if (child.isMesh) {
          child.material = new THREE.MeshPhongMaterial({ color: 0x00010d });
        }
      });
    }

    if (model.isSignboard) {
      signboard = obj; // Assign signboard
      createHoveringArrow();
    }

    updateLoadingScreen(); // Update loading screen progress
  }, undefined, function (error) {
    console.error(`Error loading ${model.path}:`, error);
    updateLoadingScreen(); // Update loading screen progress even if there's an error
  });
});

// charizard flying
let charizard; // Declare globally

// Add this function to create and show popup
function showPopup() {
    // Create popup if it doesn't exist
    let popup = document.getElementById('welcomePopup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'welcomePopup';
        popup.className = 'popup';
        
        // Add close button
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = function() {
            popup.style.display = 'none';
        };
        
        // Add message
        const message = document.createElement('span');
        message.innerHTML = 'Welcome to the Pokemon World!';
        
        popup.appendChild(closeBtn);
        popup.appendChild(message);
        document.body.appendChild(popup);
    }

    // Show popup
    popup.style.display = 'block';

    // Optional: Auto-hide after 3 seconds
    // setTimeout(() => {
    //     popup.style.display = 'none';
    // }, 3000);
}

// Modify the onSignboardClick function
function onSignboardClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (signboard) {
        const intersects = raycaster.intersectObject(signboard, true);
        if (intersects.length > 0) {
            showPopup();
        }
    }
}

// Add click event listener
window.addEventListener('click', onSignboardClick);

const sun = new THREE.DirectionalLight(0xffffff, 1);
scene.add(sun);
sun.position.set(100, 100, 100);
sun.target.position.set(0, 0, 0);
sun.shadow.camera.left = -50;
sun.shadow.camera.right = 50;
sun.shadow.camera.top = 50;
sun.shadow.camera.bottom = -50;
sun.shadow.mapSize.width = 2048; // Increase for sharper shadows
sun.shadow.mapSize.height = 2048;

// const helper = new THREE.DirectionalLightHelper(sun, 10);
// scene.add(helper);

// const ShadowCamera = new THREE.CameraHelper(sun.shadow.camera);
// scene.add(ShadowCamera);
// console.log("Shadow info:", sun.shadow);

const light = new THREE.AmbientLight(0x404040, 3); // Soft white light
scene.add(light);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

scene.add(camera);
camera.position.set(-3, 3, 58);

// Initialize OrbitControls
const controls = new OrbitControls(camera, canvas);

// Enable damping for smoother interaction
controls.enableDamping = true;

// Limit the rotation
controls.maxPolarAngle = Math.PI / 2; // Limit to looking straight (90 degrees upwards)
controls.minPolarAngle = 0; // Prevent looking below the horizon (0 degrees)

// Optional: Limit horizontal rotation (if needed)
// controls.minAzimuthAngle = -Math.PI / 2; // Left limit (-90 degrees)
// controls.maxAzimuthAngle = Math.PI / 2; // Right limit (90 degrees)

// Optional: Restrict zooming (if needed)
// controls.minDistance = 50; // Minimum zoom distance
// controls.maxDistance = 50; // Maximum zoom distance

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("pointermove", (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// OR for arrow keys:
// const DIRECTIONS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

class CharacterControl {
  constructor(
    avatar,
    mixer,
    animationsMap = new Map(),
    orbitControls,
    camera,
    currentAction = "idle"
  ) {
    this.avatar = avatar;
    this.mixer = mixer; // Use the mixer passed from the loader
    this.animationsMap = animationsMap;
    this.currentAction = currentAction;
    this.toggleRun = true;
    this.orbitControls = orbitControls;
    this.camera = camera;
    this.walkDirection = new THREE.Vector3();
    this.rotateAngle = new THREE.Vector3(0, 1, 0);
    this.rotateQuarternion = new THREE.Quaternion();
    this.cameraTarget = new THREE.Vector3();
    this.fadeDuration = 0.2;
    this.runVelocity = 150;
    this.walkVelocity = 70;

    // Add character height property
    this.characterHeight = 4; // Adjust this based on your character's actual height

    // Modify collision rays to include height check
    this.collisionRays = [];
    this.rayDirections = [
      {
        direction: new THREE.Vector3(1, 0, 0),
        height: this.characterHeight / 2,
      },
      {
        direction: new THREE.Vector3(-1, 0, 0),
        height: this.characterHeight / 2,
      },
      {
        direction: new THREE.Vector3(0, 0, 1),
        height: this.characterHeight / 2,
      },
      {
        direction: new THREE.Vector3(0, 0, -1),
        height: this.characterHeight / 2,
      },
    ];

    // Load animations
    this.loadAnimations();

    // Add ground detection properties
    this.groundRaycaster = new THREE.Raycaster();
    this.groundRaycaster.ray.direction.set(0, -1, 0); // Ray pointing down
    this.minHeight = 0; // Minimum height the character can go
  }

  loadAnimations() {
    const animations = [
      { path: "./models/Idle.fbx", name: "idle", timeScale: 1.0 },
      { path: "./models/Walking.fbx", name: "walk", timeScale: 1.0 },
      { path: "./models/Running.fbx", name: "run", timeScale: 4.0 }
    ];

    animations.forEach(anim => {
      fbxLoader.load(anim.path, (fbx) => {
        const action = this.mixer.clipAction(fbx.animations[0]);
        action.setLoop(THREE.LoopRepeat);
        action.timeScale = anim.timeScale;
        this.animationsMap.set(anim.name, action);
        if (anim.name === "idle") action.play();
      });
    });
  }

  update(delta, keyPressed) {
    const directionPressed = ["w", "a", "s", "d"].some(
      (key) => keyPressed[key] === true
    );

    let play = "";
    if (directionPressed && this.toggleRun) {
      play = "run";
    } else if (directionPressed) {
      play = "walk";
    } else {
      play = "idle";
    }

    if (this.currentAction !== play) {
      const toPlay = this.animationsMap.get(play);
      const current = this.animationsMap.get(this.currentAction);

      if (current) {
        current.fadeOut(this.fadeDuration);
      }
      if (toPlay) {
        toPlay.reset().fadeIn(this.fadeDuration).play();
      }

      this.currentAction = play;
    }

    if (this.currentAction === "run" || this.currentAction === "walk") {
      // Movement code...
      var angleYCameraDirection = Math.atan2(
        this.camera.position.x - this.avatar.position.x,
        this.camera.position.z - this.avatar.position.z
      );
      var directionOffset = this.directionOffset(keyPressed);
      this.rotateQuarternion.setFromAxisAngle(
        this.rotateAngle,
        angleYCameraDirection + directionOffset + Math.PI
      );
      this.avatar.quaternion.rotateTowards(this.rotateQuarternion, 0.2);
      this.camera.getWorldDirection(this.walkDirection);
      this.walkDirection.y = 0;
      this.walkDirection.normalize();
      this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);

      const velocity =
        this.currentAction === "run" ? this.runVelocity : this.walkVelocity;
      const moveX = this.walkDirection.x * velocity * delta;
      const moveZ = this.walkDirection.z * velocity * delta;

      const previousPosition = this.avatar.position.clone();

      // Update horizontal position
      this.avatar.position.x += moveX;
      this.avatar.position.z += moveZ;

      // Check and adjust ground height
      const groundHeight = this.checkGround();
      this.avatar.position.y = groundHeight;

      // Check if new position is valid
      if (this.checkCollisions()) {
        this.avatar.position.copy(previousPosition);
      } else {
        this.updateCameraTarget(moveX, moveZ);
      }
    } else {
      // Even when not moving, ensure character stays on ground
      const groundHeight = this.checkGround();
      this.avatar.position.y = groundHeight;
    }

    // Update the mixer
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }

  updateCameraTarget(moveX, moveZ) {
    this.camera.position.x += moveX;
    this.camera.position.z += moveZ;

    this.cameraTarget.x = this.avatar.position.x;
    this.cameraTarget.y = this.avatar.position.y + 1;
    this.cameraTarget.z = this.avatar.position.z;
    this.orbitControls.target = this.cameraTarget;
  }

  directionOffset(keyPressed) {
    var directionOffset = 0;

    if (keyPressed["w"]) {
      if (keyPressed["a"]) {
        directionOffset = Math.PI / 4; // Forward-left (45 degrees)
      } else if (keyPressed["d"]) {
        directionOffset = -Math.PI / 4; // Forward-right (-45 degrees)
      } else {
        directionOffset = 0; // Forward (0 degrees)
      }
    } else if (keyPressed["s"]) {
      if (keyPressed["a"]) {
        directionOffset = (3 * Math.PI) / 4; // Backward-left (135 degrees)
      } else if (keyPressed["d"]) {
        directionOffset = -(3 * Math.PI) / 4; // Backward-right (-135 degrees)
      } else {
        directionOffset = Math.PI; // Backward (180 degrees)
      }
    } else if (keyPressed["a"]) {
      directionOffset = Math.PI / 2; // Left (90 degrees)
    } else if (keyPressed["d"]) {
      directionOffset = -Math.PI / 2; // Right (-90 degrees)
    }

    return directionOffset;
  }

  // Modify the collision check method
  checkCollisions() {
    if (!this.avatar) return false;

    const collisionObjects = scene.children.filter(
      (obj) => obj !== this.avatar && obj.type === "Group"
    );

    // Create raycasters for each direction
    for (let rayInfo of this.rayDirections) {
      const raycaster = new THREE.Raycaster();

      // Set raycaster origin at half character height
      const rayOrigin = this.avatar.position.clone();
      rayOrigin.y += rayInfo.height;

      raycaster.set(rayOrigin, rayInfo.direction);

      const intersects = raycaster.intersectObjects(collisionObjects, true);

      if (intersects.length > 0) {
        const collision = intersects[0];

        // Check if collision distance is within range
        if (collision.distance < 0.8) {
          // Reduced collision distance
          const objectHeight = this.calculateObjectHeight(collision.object);
          if (objectHeight > this.characterHeight * 0.75) {
            // Increased height requirement
            return true;
          }
        }
      }
    }
    return false;
  }

  // Add method to calculate object height
  calculateObjectHeight(object) {
    const bbox = new THREE.Box3().setFromObject(object);
    const height = bbox.max.y - bbox.min.y;
    return height;
  }

  // Update the debug visualization if needed
  debugCollisionRays() {
    // scene.children = scene.children.filter((child) => !child.isArrowHelper);

    this.rayDirections.forEach((rayInfo) => {
      const origin = this.avatar.position.clone();
      origin.y += rayInfo.height;

      // const arrow = new THREE.ArrowHelper(
      //   rayInfo.direction,
      //   origin,
      //   1,
      //   0xff0000
      // );
      // scene.add(arrow);
    });
  }

  // Add this new method to check ground height
  checkGround() {
    if (!this.avatar) return this.minHeight;

    // Cast ray downward from character position
    this.groundRaycaster.ray.origin.copy(this.avatar.position);
    this.groundRaycaster.ray.origin.y += 2; // Start ray from above character

    const groundObjects = scene.children.filter(
      (obj) => obj !== this.avatar && obj.type === "Group"
    );

    const intersects = this.groundRaycaster.intersectObjects(
      groundObjects,
      true
    );

    if (intersects.length > 0) {
      return Math.max(intersects[0].point.y, this.minHeight);
    }

    return this.minHeight;
  }
}

const keyPressed = {};

document.addEventListener(
  "keydown",
  (event) => {
    if (loadingComplete) { // Only allow key events if loading is complete
      if (event.shiftKey && characterControl) {
        characterControl.switchRunToggle();
      } else {
        keyPressed[event.key.toLowerCase()] = true;
      }
    }
  },
  false
);

document.addEventListener(
  "keyup",
  (event) => {
    if (loadingComplete) { // Only allow key events if loading is complete
      keyPressed[event.key.toLowerCase()] = false;
    }
  },
  false
);

function animateWings(charizard) {
  const time = clock.getElapsedTime(); // Get elapsed time

  // Get wing components
  const leftWing1 = charizard.getObjectByName("Wing1L");
  const leftWing2 = charizard.getObjectByName("Wing2L");
  const leftWing3 = charizard.getObjectByName("Wing3L");

  const rightWing1 = charizard.getObjectByName("Wing1R");
  const rightWing2 = charizard.getObjectByName("Wing2R");
  const rightWing3 = charizard.getObjectByName("Wing3R");

  if (leftWing1 && rightWing1) {
    // Use a sine wave to control the wing flapping
    const flapFrequency = 3; // Controls the speed of flapping
    const downstrokeAngle = Math.PI / 4; // Max angle for downstroke (45 degrees)
    const upstrokeAngle = Math.PI / 12; // Max angle for upstroke (15 degrees)

    // Calculate the flap angle
    const flapAngle =
      Math.sin(time * flapFrequency) > 0
        ? Math.sin(time * flapFrequency) * downstrokeAngle
        : Math.sin(time * flapFrequency) * upstrokeAngle;

    // Apply flapping angles to sub-wing components
    // leftWing1.rotation.y = flapAngle;
    // rightWing1.rotation.y = flapAngle;

    // Additional subcomponents for finer wing movement
    if (leftWing2 && rightWing2) {
      leftWing2.rotation.x = flapAngle * 2; // Delayed and smaller movement
      rightWing2.rotation.x = flapAngle * 2;
    }
    if (leftWing3 && rightWing3) {
      leftWing3.rotation.z = flapAngle * 0.5; // Even smaller and delayed
      rightWing3.rotation.z = flapAngle * 0.5;
    }
  }
}

let time = 0;
function animate() {
  time += 0.01;
  if (charizard) {
    animateWings(charizard);

    // Make Charizard oscillate around its initial position
    charizard.position.y = charizard.initialY + Math.sin(clock.getElapsedTime()) * 2; // Oscillate ±2 units
    charizard.rotation.x = Math.PI / 6;
  }
  raycaster.setFromCamera(pointer, camera);

  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(scene.children);

  for (let i = 0; i < intersects.length; i++) {
    intersects[i].object.material.color.set();
  }

  const delta = clock.getDelta(); // Get time elapsed since the last frame

  if (characterControl && mixer) {
    characterControl.update(delta, keyPressed);
  }

  if (mixer) mixer.update(delta);

  // Update controls
  controls.update();

  // Render the scene
  renderer.render(scene, camera);
}

// Start the animation loop
const clock = new THREE.Clock();
renderer.setAnimationLoop(animate);

// Create a hovering arrow and text above signboard
function createHoveringArrow() {
    // Create arrow geometry
    const arrowGeometry = new THREE.ConeGeometry(0.5, 2, 32);
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Yellow color
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    
    // Position the arrow above signboard
    arrow.position.set(3, 8, 44); // Adjust y value to position above signboard
    arrow.rotation.x = Math.PI; // Rotate to point downward
    scene.add(arrow);

    // Create text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    // Style the text
    context.fillStyle = 'white';
    context.font = 'bold 36px Arial';
    context.textAlign = 'center';
    context.fillText('Click Here', 128, 64);

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    const textGeometry = new THREE.PlaneGeometry(4, 2);
    const textMaterial = new THREE.MeshBasicMaterial({ 
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    
    // Position text above arrow
    textMesh.position.set(3, 8, 44); // Adjust position as needed
    scene.add(textMesh);

    // Add floating animation
    function animateArrowAndText() {
        const time = clock.getElapsedTime();
        
        // Floating motion
        arrow.position.y = 6 + Math.sin(time * 2) * 0.5; // Hover between 7.5 and 8.5
        textMesh.position.y = 8 + Math.sin(time * 2) * 0.5;
        
        requestAnimationFrame(animateArrowAndText);
    }
    animateArrowAndText();
}

// Add this function to show Pokemon popup
function showPokemonPopup(pokemonName) {
    // Remove existing pokemon popup if any
    let existingPopup = document.getElementById('pokemonPopup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create new popup
    const popup = document.createElement('div');
    popup.id = 'pokemonPopup';
    popup.className = 'pokemon-popup';
    popup.innerHTML = `Oh! This is a ${pokemonName}!`;
    document.body.appendChild(popup);

    // Show popup
    popup.style.display = 'block';

    // Auto-hide after 2 seconds
    setTimeout(() => {
        popup.style.display = 'none';
    }, 2000);
}

// Add this function to handle Pokemon clicks
function onPokemonClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Create an object to map 3D models to Pokemon names
    const pokemonModels = {
        phantump: { model: phantump, name: 'Phantump' },
        salamence: { model: salamence, name: 'Salamence' },
        charizard: { model: charizard, name: 'Charizard' },
        Bulbasaur: { model: Bulbasaur, name: 'Bulbasaur' },
        Lukario: { model: Lukario, name: 'Lucario' },
        eevee: { model: eevee, name: 'Eevee' },
        Pikachu: { model: Pikachu, name: 'Pikachu' },
        umbreon: { model: umbreon, name: 'Umbreon' },
        pidgey: { model: pidgey, name: 'Pidgey' },
        arcanine: { model: arcanine, name: 'Arcanine' }
    };

    // Check intersections with all Pokemon
    for (const [key, pokemon] of Object.entries(pokemonModels)) {
        if (pokemon.model) {
            const intersects = raycaster.intersectObject(pokemon.model, true);
            if (intersects.length > 0) {
                showPokemonPopup(pokemon.name);
                break;
            }
        }
    }
}

// Modify the click event listener to handle both signboard and Pokemon clicks
window.addEventListener('click', (event) => {
    onSignboardClick(event);
    onPokemonClick(event);
});