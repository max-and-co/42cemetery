import * as THREE from 'three';
import { scene } from './main.js';

export class User {
    constructor(userData) {
        this.id = userData.id;
        this.login = userData.login;
        this.image = userData.image;
        // Add other user properties as needed

        this.frame = null;
        this.cylinder = null;
    }

    init() {
        this.createCylinder();
        this.create3DFrame();
    }

	remove() {
		scene.remove(this.cylinder);
	}

    createCylinder() {
        const geometry = new THREE.CylinderGeometry(1, 1, 5, 10);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.cylinder = new THREE.Mesh(geometry, material);
        scene.add(this.cylinder);
    }

    create3DFrame() {
        const texture = new THREE.TextureLoader().load(this.image.link);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        this.frame = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.1), material);
        this.frame.position.y = 2;
        this.frame.position.z = 0.95; // Position the frame above the cylinder
        this.cylinder.add(this.frame); // Add the frame as a child of the cylinder
    }

    updatePosition(x, y, z) {
        if (this.cylinder) {
            this.cylinder.position.set(parseFloat(x), parseFloat(y), parseFloat(z));
        }
    }
}

