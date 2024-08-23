import * as THREE from 'three';
import { graveMarker } from './graveMarker.js';

export class Graveyard {
    constructor(scene, jsonData) {
        this.scene = scene;
        this.graves = [];
        this.filteredUsers = this.filterUsers(jsonData);
        this.graveNumber = this.filteredUsers.length;
        const spacing = 8;

        let placedGraves = 0;
        let currentRadius = 12;

        while (placedGraves < this.graveNumber) {
            const circumference = 2 * Math.PI * currentRadius;
            const gravesInThisCircle = Math.floor(circumference / spacing);

            for (let i = 0; i < gravesInThisCircle && placedGraves < this.graveNumber; i++) {
                const userData = this.filteredUsers[placedGraves];
                const angle = (i / gravesInThisCircle) * 2 * Math.PI;
                const position = {
                    x: Math.cos(angle) * currentRadius,
                    y: 0,
                    z: Math.sin(angle) * currentRadius
                };

                let type;
                if (userData.user['staff?'])
                    type = 'Staff';
                else if (userData.user['alumni?'])
                    type = 'Alumni';
                else if (userData.blackholed_at === null)
                    type = 'PostCC';
                else if (new Date(userData.blackholed_at) > new Date())
                    type = 'Alive';
                else {
                    type = 'Blackholed';
                }
                const yRotation = Math.PI / 2 * 3;

                const grave = new Grave(scene, position, type, yRotation, userData);
                this.graves.push(grave);

                placedGraves++;
            }

            currentRadius += spacing;
        }
        this.countUserTypes(jsonData);
    }

    // Method to clear existing markers
    clearMarkers() {
        this.graves.forEach(grave => {
            if (grave.marker) {
                this.scene.remove(grave.marker.thickTriangleMesh);
                grave.marker = null;
            }
        });
    }

    markGrave(inputLogin) {
        const availableGraves = this.graves.filter(grave => !grave.marker);
        const targetGrave = availableGraves.find(grave => grave.login === inputLogin);
        if (!targetGrave) {
            console.log(`Grave with login ${inputLogin} not found or is already marked`);
            return;
        }

        targetGrave.hasArrow = true;
        const marker = new graveMarker(this.scene, targetGrave.log);
        marker.setPosition(targetGrave.position);
        this.clearMarkers();
        targetGrave.marker = marker; // Track the new marker
        console.log('Marked:', targetGrave.login);
    }

    filterUsers(jsonData) {
        const filter1 = jsonData.users.filter(userData => userData.user.first_name.toLowerCase() !== '3b3');
        const filter2 = filter1.filter(userData => !(userData.user['staff?'] === true && userData.user['active?'] === false));
        const filteredUsers = filter2.filter(userData =>  userData.user.image.link !== null);
        const filteredUsersBlackholed = filteredUsers.filter(userData => userData.blackholed_at !== null && new Date(userData.blackholed_at) <= new Date());
        return filteredUsersBlackholed;
    }

    countUserTypes(jsonData) {
        const userTypes = {
            Staff: 0,
            Alumni: 0,
            PostCC: 0,
            Alive: 0,
            Blackholed: 0
        };
        let totalUsers = 0;
        const filteredUsers = this.filterUsers(jsonData);
    
        filteredUsers.forEach(userData => {
            let type;
            if (userData.user['staff?'])
                type = 'Staff';
            else if (userData.user['alumni?'])
                type = 'Alumni';
            else if (userData.blackholed_at === null)
                type = 'PostCC';
            else if (new Date(userData.blackholed_at) > new Date())
                type = 'Alive';
            else
                type = 'Blackholed';
    
            userTypes[type]++;
            totalUsers++;
        });
    
        let consoleOutput = '%cUser Type Distribution:\n';
        Object.entries(userTypes).forEach(([type, count]) => {
            consoleOutput += `${type}: ${count}\n`;
        });
    
        consoleOutput += `Total Users: ${totalUsers}`;
        console.log(consoleOutput, 'color: yellow');
    }
}


export class Grave extends THREE.Object3D {
    constructor(scene, position, type, yRotation, userData) {
        super();
        this.marker = null;
        this.login = userData.user.login;
        this.imageUrl = userData.user.image.versions.small;

        const boxGeometry = new THREE.BoxGeometry(0.5, 1.5, 1.5);
        const cylinderGeometry = new THREE.CylinderGeometry(2, 2, 0.1, 32);
        
        const graveGeometry = new THREE.BoxGeometry(1, 2, 3);
        const grayMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const grave = new THREE.Mesh(graveGeometry, grayMaterial);
        grave.position.set(-1, 0, 0);
        this.add(grave);
        // Material for the tombstone
        const tombstoneMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        const tombstoneGeometry = new THREE.BoxGeometry(0.5, 2.5, 2);
        const tombstone = new THREE.Mesh(tombstoneGeometry, tombstoneMaterial);
        tombstone.position.set(0, 0.25, 0);
        tombstone.rotation.set(0, 0, Math.PI / 12 * 5);
        this.add(tombstone);
        
        // Load texture for the cube
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(this.imageUrl, (texture) => {
            const pictureMaterial = new THREE.MeshStandardMaterial({ map: texture });
            const picture = new THREE.Mesh(boxGeometry, pictureMaterial);
            picture.position.set(0.3, 0.4, 0);
              // Slightly above the base
              picture.rotation.set(0, 0, Math.PI / 12 * 5);
            this.add(picture);
        });

        // Material for the base
        let baseMaterial;
        if (type === 'Alive')
            baseMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        else if (type ==='Blackholed')
            baseMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        else if (type === 'Alumni')
            baseMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
        else if (type === 'Staff')
            baseMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
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