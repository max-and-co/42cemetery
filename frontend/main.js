import * as THREE from 'three';
import { FirstPersonControls } from './FirstPersonControls.js';
import { Graveyard } from './grave.js';
import { User } from './user.js';

// Set up the scene, camera, and renderer
export const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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

class UserManager {
  constructor() {
      this.users = [];
      this.localUser = null;
      this.socket = null;
      this.id = Math.random().toString(36).substr(2, 9);
      this.isConnected = false;
  }

  createUser(userData) {
    const user = new User(userData);
    user.init();
    return user;
  }

  connectWebSocket() {
      console.log('Attempting to connect WebSocket');
      this.socket = new WebSocket('ws://localhost:8080/ws');

      this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
      };

      this.socket.onmessage = (event) => {
        const messageData = JSON.parse(event.data);
        const messageString = messageData.message;
        const data = JSON.parse(messageString);
      if (data.id !== this.id) {
        if (!this.users[data.id]) {
          this.users[data.id] = this.createUser(data.user);
        }
        this.users[data.id].updatePosition(data.position.x, data.position.y, data.position.z);
      };
    };

      this.socket.onclose = (event) => {
          console.log('WebSocket disconnected:', event.reason);
          this.isConnected = false;
          setTimeout(() => this.connectWebSocket(), 15000); // Attempt to reconnect after 5 seconds
      };

      this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.socket.close();
      };
  }

  safeSend(message) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(message);
      }
  }

}
// Create and export the UserManager instance

document.addEventListener('keydown', (event) => {
  if (event.key === 'p') {
    console.log(userManage.localUser);
  }
});

export let userManager;
export let userLoggedData;

// Function to initialize the user system
export function initializeUserSystem(localUserData) {
  userManager = new UserManager();
  userManager.connectWebSocket();
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
  if (userManager && userManager.isConnected) {
    const message = JSON.stringify({
      id: userManager.id,
      user: {
        id: userLoggedData.id,
        login: userLoggedData.login,
        image: userLoggedData.image
      },
      position: {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
      }
    });
    userManager.safeSend(message);
  }

  renderer.render(scene, camera);
}

// Initialize FirstPersonControls
export const controls = new FirstPersonControls(camera, renderer.domElement);

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