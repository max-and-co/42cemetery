import * as THREE from 'three';
import { Grave, Graveyard } from './grave.js';

class FirstPersonControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Movement speed
    this.moveSpeed = 0.1;


    // Mouse sensitivity
    this.mouseSensitivity = 0.002;

    // Current velocity
    this.velocity = new THREE.Vector3();

    // Keyboard state
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
    };

    // Mouse state
    this.mouseX = 0;
    this.mouseY = 0;

    // Set up event listeners
    this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));

    // Lock pointer
    this.domElement.addEventListener('click', () => {
      this.domElement.requestPointerLock();
    });
  }

  onMouseMove(event) {
    if (document.pointerLockElement === this.domElement) {
      this.mouseX -= event.movementX * this.mouseSensitivity;
      this.mouseY -= event.movementY * this.mouseSensitivity;

      // Clamp vertical rotation
      this.mouseY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.mouseY));

      this.camera.rotation.order = 'YXZ';
      this.camera.rotation.y = this.mouseX;
      this.camera.rotation.x = this.mouseY;
    }
  }

  onKeyDown(event) {
    console.log('Key pressed:', event.code);  // Add this line for debugging
    switch (event.code) {
      case 'KeyW': this.keys.forward = true; break;
      case 'KeyS': this.keys.backward = true; break;
      case 'KeyA': this.keys.left = true; break;
      case 'KeyD': this.keys.right = true; break;
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case 'KeyW': this.keys.forward = false; break;
      case 'KeyS': this.keys.backward = false; break;
      case 'KeyA': this.keys.left = false; break;
      case 'KeyD': this.keys.right = false; break;
    }
  }

  update() {
    // Calculate movement direction
    const direction = new THREE.Vector3();

    if (this.keys.forward) direction.z -= 1;
    if (this.keys.backward) direction.z += 1;
    if (this.keys.left) direction.x -= 1;
    if (this.keys.right) direction.x += 1;

    direction.normalize();

    // Apply movement to camera
    this.camera.translateX(direction.x * this.moveSpeed);
    this.camera.translateY(direction.y * this.moveSpeed);
    this.camera.translateZ(direction.z * this.moveSpeed);
  }
}


// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const cameraHelper = new THREE.CameraHelper(camera);
// scene.add(cameraHelper);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('app').appendChild(renderer.domElement);

// Create the icosahedron
const geometry = new THREE.IcosahedronGeometry(1, 0);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const gridhelper = new THREE.GridHelper(400, 400);
scene.add(gridhelper);
const icosahedron = new THREE.Mesh(geometry, material);
scene.add(icosahedron);

// Add lighting
const light = new THREE.HemisphereLight(0xffffff, 1);
scene.add(light);

// Set initial camera position
camera.position.y = 1;

// Create First Person Controls
const controls = new FirstPersonControls(camera, renderer.domElement);

// create a bunch of graves in a grid
const graveyard = new Graveyard(scene, 100);


// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Update controls
  controls.update();
  
  // Rotate the icosahedron
  icosahedron.rotation.x += 0.01;
  icosahedron.rotation.y += 0.01;
  
  renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

fetch('data.json')
  .then(response => response.json())
  .then(jsonData => {
    // Create the graveyard
    const graveyard = new Graveyard(scene, jsonData);
  })
  .catch(error => console.error('Error loading JSON:', error));



// Fetch data from backend
// fetch('http://localhost:8080/')
//   .then(response => response.json())
//   .then(data => console.log(data))
//   .catch(error => console.error('Error:', error));