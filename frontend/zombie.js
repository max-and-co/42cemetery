import * as THREE from 'three';

export class Zombie {
  constructor(scene, startPosition) {
    // Create a cube to represent the zombie
    const zombieGeometry = new THREE.BoxGeometry(1, 1, 1);
    const zombieMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    this.mesh = new THREE.Mesh(zombieGeometry, zombieMaterial);

    // Set the initial position of the zombie
    this.mesh.position.copy(startPosition);
    this.speed = 2; // Adjust speed as needed

    // Store the scene reference and initialize icosahedrons list
    this.scene = scene;
    this.icosahedrons = [];

    // Time interval for throwing icosahedrons (in seconds)
    this.throwInterval = 2;
    this.timeSinceLastThrow = 0;

    scene.add(this.mesh);
  }

  update(targetPosition, deltaTime) {
    // Calculate the direction vector from zombie to the target (camera)
    const direction = new THREE.Vector3().subVectors(targetPosition, this.mesh.position);
    direction.y = 0; // Set the y component to 0 to ignore the y axis
    const distance = direction.length();

    if (distance > 0.1) { // Small threshold to stop moving when close enough
      direction.normalize();

      // Move the zombie towards the camera
      this.mesh.position.add(direction.multiplyScalar(this.speed * deltaTime));
    }

    // Log a message if the zombie is close enough to the target
    if (distance < 0.5) { // Collision threshold
      console.log('Zombie has touched the player!');
    }

    // Update the time since the last throw
    this.timeSinceLastThrow += deltaTime;

    // Check if it's time to throw a new icosahedron
    if (this.timeSinceLastThrow > this.throwInterval) {
      this.throwIcosahedron(targetPosition);
      this.timeSinceLastThrow = 0; // Reset timer
    }

    // Update all icosahedrons
    this.updateIcosahedrons(targetPosition, deltaTime);
  }

  throwIcosahedron(targetPosition) {
    const icosahedronGeometry = new THREE.IcosahedronGeometry(0.1, 0);
    const icosahedronMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const icosahedron = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
    icosahedron.position.copy(this.mesh.position);

    // Add the icosahedron to the scene and the list
    this.scene.add(icosahedron);
    this.icosahedrons.push({
      mesh: icosahedron,
      direction: new THREE.Vector3().subVectors(targetPosition, icosahedron.position).normalize()
    });
	
	setTimeout(() => {
		this.scene.remove(icosahedron);
		this.icosahedrons.splice(this.icosahedrons.length, 1);
	}, 1800);
  }

  updateIcosahedrons(targetPosition, deltaTime) {
    // Move each icosahedron towards the target position
    const speed = 30; // Adjust the speed of the icosahedrons

    for (let i = this.icosahedrons.length - 1; i >= 0; i--) {
      const icosahedron = this.icosahedrons[i];
      icosahedron.mesh.position.add(icosahedron.direction.clone().multiplyScalar(speed * deltaTime));

      // Check if an icosahedron is close enough to the target
      const distanceToTarget = icosahedron.mesh.position.distanceTo(targetPosition);
      if (distanceToTarget < 1) { // Collision threshold for icosahedrons
		console.log('Icosahedron has touched the player!');
	}

	
      // Remove icosahedrons that have reached near the player
      if (distanceToTarget < 1) {
        this.scene.remove(icosahedron.mesh);
        this.icosahedrons.splice(i, 1);
      }
    }
  }
}
