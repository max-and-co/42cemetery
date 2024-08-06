import * as THREE from 'three';

export class FirstPersonControls {
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