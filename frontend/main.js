import * as THREE from 'three';
import { FirstPersonControls } from './FirstPersonControls.js';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('app').appendChild(renderer.domElement);

// Create the icosahedron
const geometry = new THREE.IcosahedronGeometry(1, 0);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const icosahedron = new THREE.Mesh(geometry, material);
scene.add(icosahedron);
const gridhelper = new THREE.GridHelper(200, 200);
scene.add(gridhelper);

// Add lighting
const light = new THREE.HemisphereLight(0xffffff, 1);
scene.add(light);

// Set initial camera position
camera.position.z = 5;

// Create First Person Controls
const controls = new FirstPersonControls(camera, renderer.domElement);

// Generate a unique ID for this player
controls.id = Math.random().toString(36).substr(2, 9);

// Object to store other players
const players = {};

// WebSocket connection handling
let socket;
let isConnected = false;

function connectWebSocket() {
  socket = new WebSocket('ws://localhost:8080/ws');

  socket.onopen = () => {
    console.log('WebSocket connected');
    isConnected = true;
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.message && typeof data.message === 'string') {
      const [id, x, y, z] = data.message.split(',');
      if (id !== controls.id) {
        if (!players[id]) {
          const playerGeometry = new THREE.CylinderGeometry(1, 1, 5);
          const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
          players[id] = new THREE.Mesh(playerGeometry, playerMaterial);
          scene.add(players[id]);
        }
        players[id].position.set(parseFloat(x), parseFloat(y), parseFloat(z));
      }
    }
  };

  socket.onclose = (event) => {
    console.log('WebSocket disconnected:', event.reason);
    isConnected = false;
    setTimeout(connectWebSocket, 5000); // Attempt to reconnect after 5 seconds
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    socket.close();
  };
}

connectWebSocket();

// Function to safely send WebSocket messages
function safeSend(message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(message);
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Update controls
  controls.update();
  
  // Rotate the icosahedron
  icosahedron.rotation.x += 0.01;
  icosahedron.rotation.y += 0.01;
  
  // Send this player's position to the server
  if (isConnected) {
    safeSend(`${controls.id},${camera.position.x},${camera.position.y},${camera.position.z}`);
  }
  
  renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});