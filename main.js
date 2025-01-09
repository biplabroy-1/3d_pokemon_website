import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js"; // Import FBXLoader

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const scene = new THREE.Scene();
const canvas = document.getElementById("canvas");
let charizard; // Declare globally

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
  "./mystical_forest_cartoon.glb",
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
  "./my_avatar.glb",
  function (glb) {
    // console.log("Avatar loaded:", glb);
    avatar = glb.scene;
    avatar.scale.set(2, 2, 2); // Adjust scale as needed
    avatar.position.set(-3, 0, 45); // Adjust position to place the avatar in the scene
    avatar.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(avatar);

    // Load the Running animation and apply it to the avatar
    fbxLoader.load(
      "./Running.fbx",
      function (fbx) {
        // console.log("Running animation loaded:", fbx);

        mixer = new THREE.AnimationMixer(avatar); // Create mixer for the avatar
        const action = mixer.clipAction(fbx.animations[0]); // Use the first animation
        action.play(); // Start the animation
      },
      undefined,
      function (error) {
        console.error("Error loading Running animation:", error);
      }
    );
  },
  undefined,
  function (error) {
    console.error("Error loading avatar:", error);
  }
);

loader.load(
  "./models/Charzard Flying.glb", // Path to your GLB file
  function (glb) {
    charizard = glb.scene;

    // Scale the Charizard model (if needed)
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
    charizard.position.set(0, 20, 0); // Adjust position as needed
    scene.add(charizard);

    console.log("Charizard loaded successfully!", charizard);
    charizard.getObjectByName("Armature").traverse((child) => {
      console.log("charizard components: ", child.name); // Log all child object names
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
controls.minAzimuthAngle = -Math.PI / 2; // Left limit (-90 degrees)
controls.maxAzimuthAngle = Math.PI / 2; // Right limit (90 degrees)

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

function animateWings(charizard) {
  const time = clock.getElapsedTime(); // Get time

  // Get left and right wing base
  const leftWing = charizard.getObjectByName("Wing_baseL");
  const rightWing = charizard.getObjectByName("Wing_baseR");

  if (leftWing && rightWing) {
    // Flap the wings by modifying their rotation
    const flapAngle = (Math.cos(time * 3) * 5 + 50) * Math.PI * 0.1;

    rightWing.rotation.x = -flapAngle; // Flap right wing (opposite direction)
    leftWing.rotation.x = -flapAngle; // Flap right wing (opposite direction)
    // You can add finer details by animating sub-components like Wing1L, Wing2R, etc.
    const leftWing1 = charizard.getObjectByName("Wing1L");
    const rightWing1 = charizard.getObjectByName("Wing1R");
    if (leftWing1 && rightWing1) {
      leftWing1.rotation.x = -flapAngle;
      rightWing1.rotation.x = -flapAngle;
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
    charizard.rotation.x = -150;
  }
  raycaster.setFromCamera(pointer, camera);

  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(scene.children);

  for (let i = 0; i < intersects.length; i++) {
    intersects[i].object.material.color.set();
  }

  const delta = clock.getDelta(); // Get time elapsed since the last frame
  if (mixer) mixer.update(delta); // Update animation mixer

  // Update controls
  controls.update();

  // Render the scene
  renderer.render(scene, camera);
}

// Start the animation loop
const clock = new THREE.Clock();
renderer.setAnimationLoop(animate);
