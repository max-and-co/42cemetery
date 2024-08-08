import * as THREE from 'three';
import { scene } from './main.js';

export class User {
    constructor(userData) {
        this.id = userData.id;
        this.login = userData.login;
        this.image = userData.image;
        this.color = userData.color;
        // Add other user properties as needed

        this.frame = null;
        this.sphere = null;
    }

    init() {
        this.createSphere();
        this.create3DFrame();
    }

	remove() {
		scene.remove(this.sphere);
	}

    createSphere() {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: this.color });
        this.sphere = new THREE.Mesh(geometry, material);
        scene.add(this.sphere);
    }

    create3DFrame() {
        const texture = new THREE.TextureLoader().load(this.image.link);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        this.frame = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.1), material);
        this.frame.position.y = 0; // Position the frame above the sphere
        this.frame.position.z = -0.95; // Position the frame above the sphere
        this.sphere.add(this.frame); // Add the frame as a child of the sphere
    }

    updatePosition(x, y, z, rotation) {
        if (this.sphere) {
            this.sphere.position.set(parseFloat(x), parseFloat(y), parseFloat(z));
			this.sphere.rotation.y = rotation;
        }
    }
}

