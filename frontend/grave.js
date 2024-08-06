import * as THREE from 'three';

export class Graveyard {
    constructor(scene, jsonData) {
        const graves = [];
        const spacing = 8;
        const graveNumber = jsonData.total_users;
        const radius = (spacing * Math.sqrt(graveNumber)) / (2 * Math.PI);
        
        let placedGraves = 0;
        let currentRadius = spacing / 2;
        
        while (placedGraves < graveNumber) {
            const circumference = 2 * Math.PI * currentRadius;
            const gravesInThisCircle = Math.floor(circumference / spacing);
            
            for (let i = 0; i < gravesInThisCircle && placedGraves < graveNumber; i++) {
                const angle = (i / gravesInThisCircle) * 2 * Math.PI;
                const position = {
                    x: Math.cos(angle) * currentRadius,
                    y: 0,
                    z: Math.sin(angle) * currentRadius
                };
                
                const userData = jsonData.users[placedGraves];
                let isBlackholed;
                if (userData.blackholed_at === null)
                    isBlackholed = 2;
                else if (new Date(userData.blackholed_at) > new Date())
                    isBlackholed = 0;
                else
                    isBlackholed = 1;
                const yRotation = Math.random() * Math.PI * 2;
                const imageUrl = userData.user.image.versions.small;
                
                const grave = new Grave(scene, position, isBlackholed, yRotation, imageUrl);
                graves.push(grave);
                
                placedGraves++;
            }
            
            currentRadius += spacing;
        }
    }
}

export class Grave extends THREE.Object3D {
    constructor(scene, position, isBlackholed, yRotation, imageUrl) {
        super();

        const boxGeometry = new THREE.BoxGeometry(1, 2, 2);
        const cylinderGeometry = new THREE.CylinderGeometry(2, 2, 0.1, 32);

        // Load texture for the cube
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(imageUrl, (texture) => {
            const cubeMaterial = new THREE.MeshStandardMaterial({ map: texture });
            const cube = new THREE.Mesh(boxGeometry, cubeMaterial);
            cube.position.set(0, 1, 0);  // Slightly above the base
            this.add(cube);
        });

        // Material for the base
        let baseMaterial;
        if (isBlackholed === 0)
            baseMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        else if (isBlackholed === 1)
            baseMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        else
            baseMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const cylinder = new THREE.Mesh(cylinderGeometry, baseMaterial);
        this.add(cylinder);

        // Set position and rotation
        this.position.set(position.x, position.y, position.z);
        this.rotation.y = yRotation;

        scene.add(this);
    }
}