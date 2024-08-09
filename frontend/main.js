import * as THREE from 'three';
import { FirstPersonControls, GroundFirstPersonControls } from './FirstPersonControls.js';
import { Graveyard } from './grave.js';
import { UserManager } from './userManager.js';
// Set up the scene, camera, and renderer
export const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('app').appendChild(renderer.domElement);

// Create the icosahedron
const geometry = new THREE.IcosahedronGeometry(1, 0);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const icosahedron = new THREE.Mesh(geometry, material);
scene.add(icosahedron);

const gridhelper = new THREE.GridHelper(400, 400);
scene.add(gridhelper);
// Define the 2D shape of the triangle
const triangleShape = new THREE.Shape();
triangleShape.moveTo(0, -1);     // First vertex at the bottom
triangleShape.lineTo(-1, 1);   // Second vertex at the top left
triangleShape.lineTo(1, 1);    // Third vertex at the top right
triangleShape.lineTo(0, -1);     // Close the path back to the first vertex

// Set the extrusion settings
const extrudeSettings = {
    depth: 0.5,           // Thickness of the triangle
    bevelEnabled: false   // Disable bevel for a clean extrusion
};

const triangleGeometry = new THREE.ExtrudeGeometry(triangleShape, extrudeSettings);
const triangleMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const thickTriangleMesh = new THREE.Mesh(triangleGeometry, triangleMaterial);
const triangleHeight = 5;
scene.add(thickTriangleMesh);

// Variables to control the floating effect
const floatAmplitude = 0.5; // How much the triangle moves up and down
const floatSpeed = 0.05;    // Speed of the floating motion
let timeCounter = 0;        // Counter to simulate time

function animateFloatingTriangle() {
    timeCounter += floatSpeed;
    thickTriangleMesh.position.y = triangleHeight + Math.sin(timeCounter) * floatAmplitude;
}

// Start the animation

// Add lighting
const hemilight = new THREE.HemisphereLight(0xffffff, 1);
const light = new THREE.PointLight(0xffffff, 1, 30, 2);
scene.add(hemilight, light);

// Set initial camera position
camera.position.y = 10;

document.addEventListener('keydown', (event) => {
  if (event.key === 'p') {
    userManager.socket.close();
  }
});

export let userManager;
export let userLoggedData;
const userColor = Math.random() * 0xffffff;

// Function to initialize the user system
export function initializeUserSystem(localUserData) {
  userManager = new UserManager();
  userManager.connectWebSocket();
  userLoggedData = localUserData;
}

// Modified animation loop
export function animate() {
  requestAnimationFrame(animate);
  animateFloatingTriangle();

  // Update controls
  controls.update();

  // Rotate the icosahedron
  icosahedron.rotation.x += 0.01;
  icosahedron.rotation.y += 0.01;

  // Update local user position
  if (userManager && userManager.isConnected && userManager.id) {
    const message = JSON.stringify({
      id: userManager.id,
      user: {
      id: userLoggedData.id,
      login: userLoggedData.login,
      image: userLoggedData.image,
      color: userColor
      },
      position: {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z
      },
      rotation: {
      x: camera.rotation.x,
      y: camera.rotation.y,
      z: camera.rotation.z
      }
    });
    userManager.safeSend(message);
  }

  renderer.render(scene, camera);
}

// Initialize FirstPersonControls
// export const controls = new FirstPersonControls(camera, renderer.domElement);
export const controls = new GroundFirstPersonControls(camera, renderer.domElement, 1, light);

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
    new Graveyard(scene, jsonData);
  })
  .catch(error => console.error('Error loading JSON:', error));