import * as THREE from 'three';
import { localUserColor, mainCamera, scene, userManager } from './main.js';

export const layer = {
    MINIMAP: 2,
    MAIN_CAMERA: 1,
    ALL: 0
};

export function setLayerOnly(object, layerToAdd) {
    object.layers.disable(layer.ALL);
    object.layers.enable(layerToAdd);
}

export class Minimap {
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

        // Define the 2D shape of the triangle
        const triangleShape = new THREE.Shape();
        triangleShape.moveTo(0, -1);     // First vertex at the bottom
        triangleShape.lineTo(-1, 1);   // Second vertex at the top left
        triangleShape.lineTo(0, 0.5);
        triangleShape.lineTo(1, 1);    // Third vertex at the top right
        triangleShape.lineTo(0, -1);     // Close the path back to the first vertex

        // Set the extrusion settings
        const extrudeSettings = {
            depth: 0.5,           // Thickness of the triangle
            bevelEnabled: false   // Disable bevel for a clean extrusion
        };
        // Rotate the triangle 90 degrees in the x-axis
        const triangleGeometry = new THREE.ExtrudeGeometry(triangleShape, extrudeSettings);
        const triangleMaterial = new THREE.MeshBasicMaterial({ color: localUserColor });
        this.thickTriangleMesh = new THREE.Mesh(triangleGeometry, triangleMaterial);
        this.thickTriangleMesh.rotation.x = Math.PI / 2;
        
        // Add the triangle mesh to the group
        setLayerOnly(this.thickTriangleMesh, layer.MINIMAP);
        scene.add(this.thickTriangleMesh); 
        
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
        this.minimapCamera.layers.enable(layer.MINIMAP);
    }

    update() {
        this.thickTriangleMesh.rotation.z = -mainCamera.rotation.y;
        this.thickTriangleMesh.position.set(mainCamera.position.x, 50, mainCamera.position.z);
        this.minimapCamera.position.set(mainCamera.position.x, 100, mainCamera.position.z);
        this.minimapRenderer.render(scene, this.minimapCamera);
    }
}

