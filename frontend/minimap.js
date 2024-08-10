import * as THREE from 'three';
import { mainCamera, scene, userManager } from './main.js';

class Minimap {
    constructor() {
        this.minimapWidth = 200;
        this.minimapHeight = 200;

        // Create an orthographic camera for the minimap
        this.minimapCamera = new THREE.OrthographicCamera(
            this.minimapWidth / 12,  // left
            -this.minimapWidth / 12,   // right
            -this.minimapHeight / 12,  // top
            this.minimapHeight / 12, // bottom
            1,                // near
            4000              // far
        );

        this.minimapCamera.position.set(0, 100, 0);  // Increase height for a wider view
        // this.minimapHelper = new THREE.CameraHelper(this.minimapCamera);
        // scene.add(this.minimapHelper);

        const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        this.playerMarker = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(this.playerMarker);

        this.minimapRenderer = new THREE.WebGLRenderer();
        this.minimapRenderer.setSize(window.innerHeight * 0.35, window.innerHeight * 0.35);
        this.minimapRenderer.setClearColor(0x000000, 0);
        this.minimapRenderer.domElement.style.borderRadius = '100%';
        this.minimapRenderer.domElement.style.position = 'absolute';
        this.minimapRenderer.domElement.style.transform = 'translate(-50%, -50%)';
        this.minimapRenderer.domElement.style.border = '3px solid white';
        const minimapContainer = document.getElementById('minimapContainer');
        minimapContainer.appendChild(this.minimapRenderer.domElement);
        this.minimapCamera.lookAt(mainCamera.position);
    }

    update() {
        this.playerMarker.position.set(mainCamera.position.x, 50, mainCamera.position.z);
        this.minimapCamera.position.set(mainCamera.position.x, 100, mainCamera.position.z);
        this.minimapRenderer.render(scene, this.minimapCamera);
    }
}

export default Minimap;
