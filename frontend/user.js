import * as THREE from 'three';
import { scene } from './main.js';

export class User {
    constructor(userData) {
        console.log(userData);
        this.id = userData.id;
        this.login = userData.login;

        this.title = userData.title.replace('%login', this.login);
        this.image = userData.image;
        this.color = userData.color;

        const cursusUsers = userData.cursus_users;
        const cursusUser = cursusUsers.find(cursus => cursus.cursus_id === 21);
        this.level = cursusUser.level;

        this.parent = null;  // Parent object
        this.sphere = null;
        this.labels = {};  // Object to store different labels
        this.levelLabel = null;
    }

    init() {
        this.createParent();
        this.createSphere();
        this.create3DFrame();
        this.createLabel('login', this.title, 1.6, 'white', 32, 20);
        this.createLevelProgressBar(this.level);  // Initialize with a sample value
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
        const material = new THREE.MeshBasicMaterial({ map: texture });
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(-1, -1);
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.1), material);
        frame.position.y = 0; // Position the frame above the sphere
        frame.position.z = -0.95; // Position the frame above the sphere
        this.sphere.add(frame); // Add the frame as a child of the sphere
    }

    createLabel(labelType, text, height, color, size, padding = 10) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const fontSize = size;

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

    createLevelProgressBar(progress) {
        const level = Math.floor(progress);
        const percentage = (progress - level) * 100;

        // Create a canvas for the progress bar
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 20;
        this.progressBarContext = canvas.getContext('2d');

        // Create a sprite material with the canvas as its texture
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        this.progressBar = new THREE.Sprite(spriteMaterial);

        // Scale and position the progress bar
        this.progressBar.scale.set(1.3, 0.1, 1);
        this.progressBar.position.set(0, 1.2, 0);

        this.parent.add(this.progressBar);

        // Update the progress bar texture
        this.updateProgressBar(percentage);

        // Create the level label above the progress bar
        this.createLabel('level', `Level ${level}`, 1.2, '#00ff00', 28, 60);
    }

    updateProgressBar(percentage) {
        const ctx = this.progressBarContext;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const cornerRadius = 10; // Adjust this value to change the roundness of corners

        // Clear the canvas
        ctx.clearRect(0, 0, width, height);

        // Draw the background (grey) with rounded corners
        ctx.fillStyle = '#555555';
        this.roundRect(ctx, 0, 0, width, height, cornerRadius, true, false);

        // Draw the filled portion (green) with rounded corners
        ctx.fillStyle = '#00ff00';
        this.roundRect(ctx, 0, 0, width * (percentage / 100), height, cornerRadius, true, false);

        // Update the texture
        this.progressBar.material.map.needsUpdate = true;
    }

    // Helper method to draw rounded rectangles
    roundRect(ctx, x, y, width, height, radius, fill, stroke) {
        if (typeof radius === 'number')
            radius = {tl: radius, tr: radius, br: radius, bl: radius};
        else radius = {...{tl: 0, tr: 0, br: 0, bl: 0}, ...radius};
        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        ctx.closePath();
        if (fill)
            ctx.fill();
        if (stroke)
            ctx.stroke();
    }

    updatePosition(x, y, z, rotation) {
        if (!this.parent)
            return;
        
        this.parent.position.set(parseFloat(x), parseFloat(y), parseFloat(z));

        const q = new THREE.Quaternion();
        q.setFromEuler(new THREE.Euler(rotation.x, rotation.y, rotation.z, 'YXZ'));
        q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI));

        this.sphere.quaternion.copy(q);

        // No need to adjust quaternions for labels or progress bar anymore
        // They will automatically face the camera
    }
}