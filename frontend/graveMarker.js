import * as THREE from 'three';

export class graveMarker {
    constructor(scene, login, triangleHeight = 8, floatAmplitude = 0.5, floatSpeed = 0.03) {
        this.scene = scene;
        this.triangleHeight = triangleHeight;
        this.floatAmplitude = floatAmplitude;
        this.floatSpeed = floatSpeed;

        // Create a group to hold both the triangle and the text
        this.group = new THREE.Group();

        // Define the 2D shape of the triangle
        const triangleShape = new THREE.Shape();
        triangleShape.moveTo(0, -1);     // First vertex at the bottom
        triangleShape.lineTo(-1, 1);   // Second vertex at the top left
        triangleShape.lineTo(1, 1);    // Third vertex at the top right
        triangleShape.lineTo(0, -1);     // Close the path back to the first vertex

        // Set the extrusion settings
        const extrudeSettings = {
            depth: 0.5,           // Thickness of the triangle
            bevelEnabled: false   // Disable bevel for a clean extrusion
        };

        const triangleGeometry = new THREE.ExtrudeGeometry(triangleShape, extrudeSettings);
        const triangleMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
        this.thickTriangleMesh = new THREE.Mesh(triangleGeometry, triangleMaterial);

        // Add the triangle mesh to the group
        this.group.add(this.thickTriangleMesh);

        // Create text
        const loader = new THREE.FontLoader();
        loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            const textGeometry = new THREE.TextGeometry(login, {
                font: font,
                size: 0.5,
                height: 0.1,
            });
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
            this.textMesh = new THREE.Mesh(textGeometry, textMaterial);

            // Position the text above the triangle
            textGeometry.computeBoundingBox();
            const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
            this.textMesh.position.set(-textWidth / 2, 1.5, 0.2); // Adjust these values as needed

            // Add the text mesh to the group
            this.group.add(this.textMesh);
        });

        this.timeCounter = 0;        // Counter to simulate time
        this.scene.add(this.group);
        this.animateFloatingTriangle();
    }

    animateFloatingTriangle() {
        this.timeCounter += this.floatSpeed;
        this.group.rotation.y += 0.01;
        this.group.position.y = this.triangleHeight + Math.sin(this.timeCounter) * this.floatAmplitude;
        requestAnimationFrame(() => this.animateFloatingTriangle());
    }

    setPosition(position) {
        this.group.position.set(position.x, this.triangleHeight, position.z);
    }

    remove() {
        this.scene.remove(this.group);
    }
}