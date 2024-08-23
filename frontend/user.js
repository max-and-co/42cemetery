import * as THREE from 'three';
import { scene } from './main.js';
import { layer, setLayerOnly } from './minimap.js';

export class User {
    constructor(userData, isLocalUser = false) {
        this.initializeUserData(userData);
        this.parent = null;
        this.sphere = null;
        this.labels = {};
        this.userInfoSprite = null;
        this.levelLabel = null;
        this.isLocalUser = isLocalUser;
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
        this.createParent();
        this.createSphere();
        this.create3DFrame();
        if (this.isLocalUser)
            return;
        this.createUserInfoDisplay();
        this.createMinimapLabel();
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
        this.parent.add(this.sphere);
    }
    
    create3DFrame() {
        const texture = new THREE.TextureLoader().load(this.image.link);
        if (!this.isLocalUser) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(-1, -1);
        }
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.1), material);
        frame.position.set(0, 0, -0.95);
        this.sphere.add(frame);
    }
    
    createUserInfoDisplay() {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 200; // Increased height to accommodate login, level, and progress bar
        this.userInfoContext = canvas.getContext('2d');

        this.userInfoSprite = this.createLabelSprite(canvas, 4, 2, 0, 3, 0);
        setLayerOnly(this.userInfoSprite, layer.MAIN_CAMERA);
        this.parent.add(this.userInfoSprite);

        this.updateUserInfoDisplay();
    }

    updateUserInfoDisplay() {
        const ctx = this.userInfoContext;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const level = Math.floor(this.level);
        const percentage = (this.level - level) * 100;
    
        ctx.clearRect(0, 0, width, height);
    
        // Calculate vertical positions
        const topPadding = 30; // Space at the top of the canvas
        const bottomPadding = 20; // Space at the bottom of the canvas
        const elementHeight = 70; // Approximate height for each text element
        const spacing = (height - topPadding - bottomPadding - 2 * elementHeight - 20) / 2; // Space between elements
    
        // Draw login (positioned at top)
        ctx.font = 'bold 70px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(this.title, width / 2, topPadding);
    
        // Draw level (positioned in the middle)
        ctx.font = 'bold 60px Arial';
        ctx.fillStyle = '#00ff00';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`Level ${level}`, width / 2, topPadding + elementHeight + spacing);
    
        // Draw progress bar (positioned at the bottom)
        const barWidth = width - 20;
        const barHeight = 30;
        const barY = topPadding - 20 + 2 * elementHeight + 2 * spacing + 10; // Adjust based on element positions
        ctx.fillStyle = '#555555';
        this.roundRect(ctx, 10, barY, barWidth, barHeight, 10, true, false);
        ctx.fillStyle = '#00ff00';
        this.roundRect(ctx, 10, barY, barWidth * (percentage / 100), barHeight, 10, true, false);
    
        this.userInfoSprite.material.map.needsUpdate = true;
    }
    

    createLabelSprite(canvas, scaleX, scaleY, posX, posY, posZ) {
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(scaleX, scaleY, 1);
        sprite.position.set(posX, posY, posZ);
        return sprite;
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
        this.minimapLabel = this.createLabelSprite(canvas, 10, 5, -1, 1, 2);
        setLayerOnly(this.minimapLabel, layer.MINIMAP);
        this.parent.add(this.minimapLabel);
    }

    createMinimapLabelCanvas() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const fontSize = 20;
        const textWidth = context.measureText(this.login).width;
        canvas.width = textWidth + 50;
        canvas.height = fontSize + 10;
        context.font = `${fontSize}px Arial`;
        context.fillStyle = 'white';
        context.translate(canvas.width / 2, canvas.height / 2);
        context.fillText(this.login, -textWidth / 2, fontSize / 2);
        return canvas;
    }

    updatePosition(x, y, z, rotation) {
        if (!this.parent) return;
        
        this.parent.position.set(parseFloat(x), parseFloat(y), parseFloat(z));

        const q = new THREE.Quaternion();
        q.setFromEuler(new THREE.Euler(rotation.x, rotation.y, rotation.z, 'YXZ'));
        q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI));

        this.sphere.quaternion.copy(q);
    }
}