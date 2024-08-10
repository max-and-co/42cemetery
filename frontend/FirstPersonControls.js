import * as THREE from 'three';

export class FirstPersonControls {
	constructor(camera, domElement) {
	  this.camera = camera;
	  this.domElement = domElement;
  
	  // Movement speed
	  this.moveSpeed = 0.2;
  
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
	if (event.target.tagName === 'INPUT')
		return;
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

export class GroundFirstPersonControls {
	constructor(camera, domElement, floorHeight = 0, light) {
	  this.camera = camera;
	  this.domElement = domElement;
	  this.floorHeight = floorHeight;
	  this.light = light;
  
	  // Movement speed
	  this.moveSpeed = 0.1;
	  this.jumpSpeed = 0.15;
	  this.gravity = 0.004;
  
	  // Mouse sensitivity
	  this.mouseSensitivity = 0.002;
  
	  // Current velocity
	  this.velocity = new THREE.Vector3();
  
	  // Jumping state
	  this.isJumping = false;
	  this.jumpVelocity = 0;
  
	  // Keyboard state
	  this.keys = {
		forward: false,
		backward: false,
		left: false,
		right: false,
		jump: false,
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
	
		  // Update the camera rotation in a different order
		  this.camera.rotation.set(this.mouseY, this.mouseX, 0, 'YXZ');
		}
	  }
  
	onKeyDown(event) {
	if (event.target.tagName === 'INPUT')
		return;
	  switch (event.code) {
		case 'KeyW': this.keys.forward = true; break;
		case 'KeyS': this.keys.backward = true; break;
		case 'KeyA': this.keys.left = true; break;
		case 'KeyD': this.keys.right = true; break;
		case 'Space': this.keys.jump = true; break;
	  }
	}
  
	onKeyUp(event) {
	  switch (event.code) {
		case 'KeyW': this.keys.forward = false; break;
		case 'KeyS': this.keys.backward = false; break;
		case 'KeyA': this.keys.left = false; break;
		case 'KeyD': this.keys.right = false; break;
		case 'Space': this.keys.jump = false; break;
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
  
	  // Rotate direction based on camera's rotation
	  direction.applyEuler(new THREE.Euler(0, this.camera.rotation.y, 0));
  
	  // Apply movement to camera
	  this.camera.position.x += direction.x * this.moveSpeed;
	  this.camera.position.z += direction.z * this.moveSpeed;
  
	  // Handle jumping
	  if (this.keys.jump && !this.isJumping) {
		this.isJumping = true;
		this.jumpVelocity = this.jumpSpeed;
	  }
  
	  if (this.isJumping) {
		this.camera.position.y += this.jumpVelocity;
		this.jumpVelocity -= this.gravity;
  
		if (this.camera.position.y <= this.floorHeight) {
		  this.camera.position.y = this.floorHeight;
		  this.isJumping = false;
		  this.jumpVelocity = 0;
		}
	  } else {
		this.camera.position.y = this.floorHeight;
	  }
	  this.light.position.copy(this.camera.position);
	}
  }