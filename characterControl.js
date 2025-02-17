import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

const fbxLoader = new FBXLoader();

class CharacterControl {
  constructor(
    avatar,
    mixer,
    animationsMap = new Map(),
    orbitControls,
    camera,
    currentAction = "idle",
    scene // Add scene parameter
  ) {
    this.avatar = avatar;
    this.mixer = mixer; // Use the mixer passed from the loader
    this.animationsMap = animationsMap;
    this.currentAction = currentAction;
    this.toggleRun = true;
    this.orbitControls = orbitControls;
    this.camera = camera;
    this.scene = scene; // Assign scene to this.scene
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
      { path: "./models/Running.fbx", name: "run", timeScale: 6.0 } // Increase running animation speed
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
      this.avatar.quaternion.copy(this.rotateQuarternion); // Instantly set the quaternion
      this.camera.getWorldDirection(this.walkDirection);
      this.walkDirection.y = 0;
      this.walkDirection.normalize();
      this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);

      const velocity = this.walkVelocity; // Set a uniform velocity
      const moveX = this.walkDirection.x * velocity * delta;
      const moveZ = this.walkDirection.z * velocity * delta;

      const previousPosition = this.avatar.position.clone();

      // Update horizontal position
      this.avatar.position.x += moveX;
      this.avatar.position.z += moveZ;

      // Restrict movement within z bounds
      if (this.avatar.position.z < -50) {
        this.avatar.position.z = -50;
      } else if (this.avatar.position.z > 50) {
        this.avatar.position.z = 50;
      }

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

    // Ensure the character stays within z bounds
    if (this.avatar.position.z < -50) {
      this.avatar.position.z = -50;
    } else if (this.avatar.position.z > 50) {
      this.avatar.position.z = 50;
    }

    // Ensure the camera stays within z bounds
    if (this.camera.position.z < -42) {
      this.camera.position.z = -42;
    } else if (this.camera.position.z > 58) {
      this.camera.position.z = 58;
    }

    // Update the mixer
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }

  updateCameraTarget(moveX, moveZ) {
    this.camera.position.x += moveX;
    this.camera.position.z += moveZ;

    // Restrict camera movement within z bounds
    if (this.camera.position.z < -42) {
      this.camera.position.z = -42;
    } else if (this.camera.position.z > 58) {
      this.camera.position.z = 58;
    }

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

    const collisionObjects = this.scene.children.filter(
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
    // this.scene.children = this.scene.children.filter((child) => !child.isArrowHelper);

    this.rayDirections.forEach((rayInfo) => {
      const origin = this.avatar.position.clone();
      origin.y += rayInfo.height;

      // const arrow = new THREE.ArrowHelper(
      //   rayInfo.direction,
      //   origin,
      //   1,
      //   0xff0000
      // );
      // this.scene.add(arrow);
    });
  }

  // Add this new method to check ground height
  checkGround() {
    if (!this.avatar) return this.minHeight;

    // Cast ray downward from character position
    this.groundRaycaster.ray.origin.copy(this.avatar.position);
    this.groundRaycaster.ray.origin.y += 2; // Start ray from above character

    const groundObjects = this.scene.children.filter(
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

export { CharacterControl };
