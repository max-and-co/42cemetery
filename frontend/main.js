import * as THREE from 'three';
import { FirstPersonControls, GroundFirstPersonControls } from './FirstPersonControls.js';
import { Grave, Graveyard } from './grave.js';
import { UserManager } from './userManager.js';
import Minimap from './minimap.js';
// Set up the scene, mainCamera, and renderer
export const scene = new THREE.Scene();
export const mainCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('app').appendChild(renderer.domElement);

// Create the icosahedron
const geometry = new THREE.IcosahedronGeometry(1, 0);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const icosahedron = new THREE.Mesh(geometry, material);
// scene.add(icosahedron);

const gridhelper = new THREE.GridHelper(400, 400);
scene.add(gridhelper);
// Add lighting
const hemilight = new THREE.HemisphereLight(0xffffff, 1);
const light = new THREE.PointLight(0xffffff, 1, 30, 2);
scene.add(hemilight, light);

// Set initial mainCamera position
mainCamera.position.y = 10;

document.addEventListener('keydown', (event) => {
  if (event.key === 'p') {
    userManager.socket.close();
  }
  if (event.key === 'o') {
    userManager.connectWebSocket();
  }
});

export let userManager;
export let userLoggedData;
export let minimap;
export const localUserColor = Math.random() * 0xffffff;

// Function to initialize the user system
export function initializeUserSystem(localUserData) {
  userManager = new UserManager(localUserData);
  userManager.connectWebSocket();
  // console.log(userManager.localUser);
  minimap = new Minimap();
  userLoggedData = localUserData;
}

// Modified animation loop
export function animate() {
  requestAnimationFrame(animate);

  // Update controls
  controls.update();

  // Rotate the icosahedron
  icosahedron.rotation.x += 0.01;
  icosahedron.rotation.y += 0.01;

  // Update local user position
  if (userManager && userManager.isConnected && userManager.id) {
    const message = JSON.stringify({
      id: userManager.id,
      position: {
        x: mainCamera.position.x,
        y: mainCamera.position.y,
        z: mainCamera.position.z
      },
      rotation: {
      x: mainCamera.rotation.x,
      y: mainCamera.rotation.y,
      z: mainCamera.rotation.z
      }
    });
    userManager.safeSend(message);
  }
  if (minimap)
    minimap.update();
  renderer.render(scene, mainCamera);
}

document.addEventListener('keydown', validateInput);

function validateInput(event) {
  if (event.key === "Enter") {
    const inputField = document.getElementById("inputField");
    const inputValue = inputField.value;

    graveyard.markGrave(inputValue);
    inputField.value = "";
    inputField.blur(); // Lose focus of the input bar
  }
}

// Initialize FirstPersonControls
// export const controls = new FirstPersonControls(mainCamera, renderer.domElement);
export const controls = new GroundFirstPersonControls(mainCamera, renderer.domElement, 1, light);

animate();

// Handle window resizing
window.addEventListener('resize', () => {
  mainCamera.aspect = window.innerWidth / window.innerHeight;
  mainCamera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let graveyard;

fetch('data.json')
  .then(response => response.json())
  .then(jsonData => {
    // Create the graveyard
    graveyard = new Graveyard(scene, jsonData);
  })
  .catch(error => console.error('Error loading JSON:', error));



