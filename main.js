import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js"; // Import FBXLoader

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const scene = new THREE.Scene();
const canvas = document.getElementById("canvas");
let charizard; // Declare globally
let characterControl;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const loader = new GLTFLoader();
const fbxLoader = new FBXLoader();

let mixer; // Declare mixer for animation

// Load the mystical forest model
loader.load(
  "./models/mystical_forest_cartoon.glb",
  function (glb) {
    // console.log("Mystical forest loaded:", glb);
    const model = glb.scene;
    model.scale.set(0.01, 0.01, 0.01);
    glb.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(glb.scene);
  },
  undefined,
  function (error) {
    console.error("Error loading mystical forest:", error);
  }
);

// Load the avatar model
let avatar;
loader.load(
  "./models/my_avatar.glb",
  function (glb) {
    avatar = glb.scene;
    avatar.scale.set(2, 2, 2);
    avatar.position.set(-3, 2, 45);
    avatar.rotation.set(0, Math.PI, 0);
    avatar.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(avatar);

    // Create a single mixer for the avatar
    mixer = new THREE.AnimationMixer(avatar);

    // Create CharacterControl instance with the mixer
    characterControl = new CharacterControl(
      avatar,
      mixer,
      new Map(),  // Empty map that will be populated by loadAnimations
      controls,
      camera,
      'idle'  // Set initial action to idle
    );
  },
  undefined,
  function (error) {
    console.error("Error loading avatar:", error);
  }
);
// charizard flying
loader.load(
  "./models/Charzard Flying.glb", // Path to your GLB file
  function (glb) {
    charizard = glb.scene;

    charizard.scale.set(3, 3, 3); // Adjust scaling as per your scene
    // charizard.position.set(20,20,20)
    // Enable shadows for the Charizard model
    charizard.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Position Charizard in the sky
    charizard.position.set(0, 17, 0); // Adjust position as needed
    scene.add(charizard);

    // console.log("Charizard loaded successfully!", charizard);
    charizard.getObjectByName("Armature").traverse((child) => {
      // console.log("charizard components: ", child.name); // Log all child object names
    });
  },
  undefined,
  function (error) {
    console.error("Error loading Charizard:", error);
  }
);

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

const helper = new THREE.DirectionalLightHelper(sun, 10);
scene.add(helper);

const ShadowCamera = new THREE.CameraHelper(sun.shadow.camera);
scene.add(ShadowCamera);
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
camera.position.set(-3, 3, 50);

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
  constructor(avatar, mixer, animationsMap = new Map(), orbitControls, camera, currentAction = 'idle') {
    this.avatar = avatar;
    this.mixer = mixer;  // Use the mixer passed from the loader
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

    // Initialize collision properties
    this.collisionRays = [];
    this.rayDirections = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, -1),
    ];

    // Load animations
    this.loadAnimations();

    // Add ground detection properties
    this.groundRaycaster = new THREE.Raycaster();
    this.groundRaycaster.ray.direction.set(0, -1, 0); // Ray pointing down
    this.minHeight = 0; // Minimum height the character can go
  }

  loadAnimations() {
    fbxLoader.load("./models/Idle.fbx", (fbx) => {
      const idleAction = this.mixer.clipAction(fbx.animations[0]);
      idleAction.setLoop(THREE.LoopRepeat);
      // idleAction.timeScale = 1.0;
      this.animationsMap.set("idle", idleAction);
      idleAction.play();
    });

    fbxLoader.load("./models/Walking.fbx", (fbx) => {
      const walkAction = this.mixer.clipAction(fbx.animations[0]);
      walkAction.setLoop(THREE.LoopRepeat);
      // walkAction.timeScale = 2.0;
      this.animationsMap.set("walk", walkAction);
    });

    fbxLoader.load("./models/Running.fbx", (fbx) => {
      const runAction = this.mixer.clipAction(fbx.animations[0]);
      runAction.setLoop(THREE.LoopRepeat);
      // runAction.timeScale = 2;
      this.animationsMap.set("run", runAction);
    });
  }

  update(delta, keyPressed) {
    const directionPressed = ["w", "a", "s", "d"].some(key => keyPressed[key] === true);
    
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

      const velocity = this.currentAction === "run" ? this.runVelocity : this.walkVelocity;
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

  // Add this new method to check collisions
  checkCollisions() {
    const collisionObjects = scene.children.filter(
      (obj) => obj !== this.avatar && obj.type === "Group" // Adjust based on your 3D objects' types
    );

    for (let ray of this.collisionRays) {
      // Update raycaster position to avatar's current position
      ray.ray.origin.copy(this.avatar.position);

      const intersects = ray.intersectObjects(collisionObjects, true);

      if (intersects.length > 0 && intersects[0].distance < 1) {
        return true; // Collision detected
      }
    }
    return false;
  }

  // Add this method to CharacterControl class
  debugCollisionRays() {
    // Remove old debug arrows if they exist
    scene.children = scene.children.filter((child) => !child.isArrowHelper);

    // Create new debug arrows
    this.collisionRays.forEach((ray) => {
      const arrow = new THREE.ArrowHelper(
        ray.ray.direction,
        ray.ray.origin,
        1, // length
        0xff0000 // color
      );
      scene.add(arrow);
    });
  }

  // Add this new method to check ground height
  checkGround() {
    if (!this.avatar) return this.minHeight;

    // Cast ray downward from character position
    this.groundRaycaster.ray.origin.copy(this.avatar.position);
    this.groundRaycaster.ray.origin.y += 2; // Start ray from above character

    const groundObjects = scene.children.filter(
      obj => obj !== this.avatar && obj.type === "Group"
    );

    const intersects = this.groundRaycaster.intersectObjects(groundObjects, true);
    
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
    if (event.shiftKey && characterControl) {
      characterControl.switchRunToggle();
    } else {
      keyPressed[event.key.toLowerCase()] = true;
    }
  },
  false
);

document.addEventListener(
  "keyup",
  (event) => {
    keyPressed[event.key.toLowerCase()] = false;
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

    // Other animations (movement, rotation, etc.)
    charizard.position.y += Math.sin(clock.getElapsedTime()) * -0.1;
    charizard.rotation.x = Math.PI / 6; // Forward tilt
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
