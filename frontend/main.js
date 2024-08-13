import * as THREE from 'three';
import { FirstPersonControls, GroundFirstPersonControls } from './FirstPersonControls.js';
import { Grave, Graveyard } from './grave.js';
import { UserManager } from './userManager.js';
import { Minimap } from './minimap.js';
import { Zombie } from './zombie.js';

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
mainCamera.layers.enable(1);
let moveMode = 'ground';

document.addEventListener('keydown', (event) => {
  if (event.key === 'p') {
    userManager.socket.close();
  }
  if (event.key === 'o') {
    userManager.connectWebSocket();
  }
  if (event.key === 'i' && moveMode === 'ground') {
    controls = new FirstPersonControls(mainCamera, renderer.domElement); 
    moveMode = 'fly';
  }
  else if (event.key === 'i' && moveMode === 'fly') {
    controls = new GroundFirstPersonControls(mainCamera, renderer.domElement, 1, light);
    moveMode = 'ground';
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

export let deltaTime = 0;
let previousTime = performance.now(); // Use performance.now() for higher precision

// Function to update deltaTime
function updateDeltaTime(currentTime) {
    // Calculate deltaTime in seconds
    deltaTime = (currentTime - previousTime) / 1000;

    // Update the previousTime to the current time
    previousTime = currentTime;
}

const zombie = new Zombie(scene, new THREE.Vector3(12, 0.5, 20));
const zombie1 = new Zombie(scene, new THREE.Vector3(123, 0.5, 20));
const zombie2 = new Zombie(scene, new THREE.Vector3(45, 0.5, 20));
const zombie3 = new Zombie(scene, new THREE.Vector3(63, 0.5, 20));



// Modified animation loop
export function animate(currentTime) {
  requestAnimationFrame(animate);

  updateDeltaTime(currentTime);
  controls.update();
  zombie.update(mainCamera.position, deltaTime);

  // Rotate the icosahedron
  icosahedron.rotation.x += 0.01 * deltaTime;
  icosahedron.rotation.y += 0.01 * deltaTime;

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
export let controls = new GroundFirstPersonControls(mainCamera, renderer.domElement, 1, light);

requestAnimationFrame(animate);

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



