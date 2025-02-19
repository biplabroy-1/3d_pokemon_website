import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js"; // Import FBXLoader
import { models } from "./models.js"; // Import models
import { CharacterControl } from "./CharacterControl.js"; // Import CharacterControl
import { loadingScreen, loadingText, loadingBar, updateLoadingScreen, loadingComplete } from "./loadingScreen.js"; // Import loading screen
import { showPopup, showPokemonPopup, isPopupOpen } from "./popups.js"; // Import popup functions

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

document.body.appendChild(loadingScreen);

let loadedModels = 0;
const totalModels = 17; // Update this count based on the total number of models
let currentProgress = 0; // Track current progress for smooth transition

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
    obj.userData.pokemonName = model.name; // Assign Pokémon name
    scene.add(obj);

    if (model.isAvatar) {
      mixer = new THREE.AnimationMixer(obj);
      characterControl = new CharacterControl(obj, mixer, new Map(), controls, camera, "idle", scene); // Pass scene
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

// Add this function to handle Pokemon clicks
function onPokemonClick(event) {
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
      let clickedObject = intersects[0].object;

      // Traverse up to find the correct parent object that holds the Pokémon name
      while (clickedObject.parent) {
          if (clickedObject.userData.pokemonName) {
              showPokemonPopup(clickedObject.userData.pokemonName);
              return;
          }
          clickedObject = clickedObject.parent;
      }
  }
}


// Modify the click event listener to handle both signboard and Pokemon clicks
window.addEventListener('click', (event) => {
    onSignboardClick(event);
    onPokemonClick(event);
});

// Add event listener for the "c" key to show the chat box
document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'c') {
        showChatBox();
    }
});

function showChatBox() {
    let chatBox = document.getElementById('chatBox');
    if (!chatBox) {
        chatBox = document.createElement('div');
        chatBox.id = 'chatBox';
        chatBox.className = 'chat-box';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = function () {
            chatBox.style.display = 'none';
        };

        const chatContent = document.createElement('div');
        chatContent.className = 'chat-content';
        chatContent.innerHTML = 'This is a chat box.';

        chatBox.appendChild(closeBtn);
        chatBox.appendChild(chatContent);
        document.body.appendChild(chatBox);
    }
    chatBox.style.display = 'block';
}

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

const keyPressed = {};

document.addEventListener(
  "keydown",
  (event) => {
    if (loadingComplete && !isPopupOpen()) { // Only allow key events if loading is complete and popup is not open
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
    if (loadingComplete && !isPopupOpen()) { // Only allow key events if loading is complete and popup is not open
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