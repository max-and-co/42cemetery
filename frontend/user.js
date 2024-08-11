import * as THREE from 'three';
import { scene } from './main.js';

export class User {
    constructor(userData) {
        this.id = userData.id;
        this.login = userData.login;
        this.image = userData.image;
        this.color = userData.color;

        this.parent = null;  // Parent object
        this.sphere = null;
        this.labels = {};  // Object to store different labels
    }

    init() {
        this.createParent();
        this.createSphere();
        this.create3DFrame();
        this.createLabel('login', this.login, 2, 'white', 32);
        this.createLabel('title', 'le boss', 1.5, 'pink', 20);
    }

    remove() {
        scene.remove(this.parent);
    }

    createParent() {
        this.parent = new THREE.Object3D();
        scene.add(this.parent);
    }

    createSphere() {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: this.color });
        this.sphere = new THREE.Mesh(geometry, material);
        this.parent.add(this.sphere);  // Attach the sphere to the parent
    }

    create3DFrame() {
        const texture = new THREE.TextureLoader().load(this.image.link);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(-1, -1); // Flip the image vertically
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.1), material);
        frame.position.y = 0; // Position the frame above the sphere
        frame.position.z = -0.95; // Position the frame above the sphere
        this.sphere.add(frame); // Add the frame as a child of the sphere
    }

    createLabel(labelType, text, height, color, size) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const fontSize = size;
        const padding = 10;

        context.font = `${fontSize}px Verdana`;
        const textWidth = context.measureText(text).width;

        canvas.width = textWidth + padding * 2;
        canvas.height = fontSize + padding * 2;

        context.font = `${fontSize}px Verdana`;
        context.fillStyle = 'transparent'; // Set the background color to transparent
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = color;
        context.fillText(text, padding, fontSize + padding / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const label = new THREE.Sprite(spriteMaterial);

        // Position the label above the sphere
        label.scale.set(2, 1, 1); // Adjust the scale as needed
        label.position.set(0, height, 0); // Position the label above the sphere
        this.parent.add(label); // Attach the label to the parent

        // Store the label in the labels object
        this.labels[labelType] = label;
    }

    updatePosition(x, y, z, rotation) {
        if (!this.parent)
            return;
        
        // Update the position of the parent object
        this.parent.position.set(parseFloat(x), parseFloat(y), parseFloat(z));

        // Create a new Quaternion to represent the rotation
        const q = new THREE.Quaternion();
        q.setFromEuler(new THREE.Euler(rotation.x, rotation.y, rotation.z, 'YXZ'));

        // Apply an additional transformation to the quaternion
        q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI));

        // Set the sphere rotation using the transformed quaternion
        this.sphere.quaternion.copy(q);

        // Ensure all labels remain upright
        Object.values(this.labels).forEach(label => {
            label.quaternion.identity();
        });
    }
}