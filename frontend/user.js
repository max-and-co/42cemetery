import * as THREE from 'three';
import { scene } from './main.js';
import { layer, setLayerOnly } from './minimap.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class User extends THREE.Object3D {
    constructor(userData) {
        super();
        this.initializeUserData(userData);
        this.sphere = null;
        this.duck = null;
        this.labels = {};
        this.levelLabel = null;
        scene.add(this);
    }

    initializeUserData(userData) {
        this.id = userData.id;
        this.login = userData.login;
        this.title = userData.title.replace('%login', this.login);
        this.image = userData.image;
        this.color = userData.color;
        this.level = userData.cursus_users.find(cursus => cursus.cursus_id === 21).level;
    }

    init() {
        this.createSphere();
        this.createDuck();
        this.create3DFrame();
        this.createLabel('login', this.title, 1.6, 'white', 32, 20);
        this.createLevelProgressBar(this.level);
        this.createMinimapLabel();
    }

    remove() {
        scene.remove(this);
    }

    createSphere() {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: this.color, transparent: true, opacity: 0.0 });
        this.sphere = new THREE.Mesh(geometry, material);
        this.add(this.sphere);
    }
    createDuck() {
        const loader = new GLTFLoader();
        loader.load('models/rubber_duck.glb', (gltf) => {
            this.duck = gltf.scene;
            this.duck.scale.set(1, 1, 1);
            this.duck.position.set(0, -0.5, 0);
            this.duck.rotation.x = Math.PI;
            this.sphere.add(this.duck);
        });
    }
    create3DFrame() {
        const texture = new THREE.TextureLoader().load(this.image.link);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(-1, -1);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.1), material);
        frame.position.set(0, 0.5, -0.95);
        this.sphere.add(frame);
    }

    createLabel(labelType, text, height, color, size, padding = 10) {
        const canvas = this.createLabelCanvas(text, size, padding, color);
        const label = this.createLabelSprite(canvas, 2, 1, 0, height + 0.3, 0);
        setLayerOnly(label, layer.MAIN_CAMERA);
        this.add(label);
        this.labels[labelType] = label;
    }

    createLabelCanvas(text, fontSize, padding, color) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = `${fontSize}px Verdana`;
        const textWidth = context.measureText(text).width;
        canvas.width = textWidth + padding * 2;
        canvas.height = fontSize + padding * 2;
        context.font = `${fontSize}px Verdana`;
        context.fillStyle = 'transparent';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = color;
        context.fillText(text, padding, fontSize + padding / 2);
        return canvas;
    }

    createLabelSprite(canvas, scaleX, scaleY, posX, posY, posZ) {
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(scaleX, scaleY, 1);
        sprite.position.set(posX, posY, posZ);
        return sprite;
    }

    createLevelProgressBar(progress) {
        const level = Math.floor(progress);
        const percentage = (progress - level) * 100;

        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 20;
        this.progressBarContext = canvas.getContext('2d');

        this.progressBar = this.createLabelSprite(canvas, 1.3, 0.1, 0, 1.2 + 0.3, 0);
        setLayerOnly(this.progressBar, layer.MAIN_CAMERA);
        this.add(this.progressBar);

        this.updateProgressBar(percentage);
        this.createLabel('level', `Level ${level}`, 1.2, '#00ff00', 28, 60);
    }

    updateProgressBar(percentage) {
        const ctx = this.progressBarContext;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const cornerRadius = 10;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#555555';
        this.roundRect(ctx, 0, 0, width, height, cornerRadius, true, false);
        ctx.fillStyle = '#00ff00';
        this.roundRect(ctx, 0, 0, width * (percentage / 100), height, cornerRadius, true, false);
        this.progressBar.material.map.needsUpdate = true;
    }

    roundRect(ctx, x, y, width, height, radius, fill, stroke) {
        if (typeof radius === 'number') {
            radius = {tl: radius, tr: radius, br: radius, bl: radius};
        } else {
            radius = {...{tl: 0, tr: 0, br: 0, bl: 0}, ...radius};
        }
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
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
    }

    createMinimapLabel() {
        const canvas = this.createMinimapLabelCanvas();
        this.minimapLabel = this.createLabelSprite(canvas, 10, 5, 0, 1, -1.5);
        setLayerOnly(this.minimapLabel, layer.MINIMAP);
        this.add(this.minimapLabel);
    }

    createMinimapLabelCanvas() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const fontSize = 15;
        const textWidth = context.measureText(this.login).width;
        canvas.width = textWidth + 20;
        canvas.height = fontSize + 10;
        context.font = `${fontSize}px Verdana`;
        context.fillStyle = 'white';
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(Math.PI);
        context.fillText(this.login, -textWidth / 2, fontSize / 2);
        return canvas;
    }

    updatePosition(x, y, z, rotation) {
        if (!this) return;
        
        this.position.set(parseFloat(x), parseFloat(y), parseFloat(z));

        const q = new THREE.Quaternion();
        q.setFromEuler(new THREE.Euler(rotation.x, rotation.y, rotation.z, 'YXZ'));
        q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI));
        this.sphere.quaternion.copy(q);
    }
}