import * as THREE from 'three';

export class Graveyard {
    constructor(scene, jsonData) {
        const graves = [];
        const spacing = 8;
        const filteredUsers = this.filterUsers(jsonData);
        const graveNumber = filteredUsers.length;

        let placedGraves = 0;
        let currentRadius = 12;
        
        while (placedGraves < graveNumber) {
            const circumference = 2 * Math.PI * currentRadius;
            const gravesInThisCircle = Math.floor(circumference / spacing);
            
            for (let i = 0; i < gravesInThisCircle && placedGraves < graveNumber; i++) {
                const userData = filteredUsers[placedGraves];
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
                const yRotation = Math.random() * Math.PI * 2;
                const imageUrl = userData.user.image.versions.small;
                
                const grave = new Grave(scene, position, type, yRotation, imageUrl);
                graves.push(grave);
                
                placedGraves++;
            }
            
            currentRadius += spacing;
        }
        this.countUserTypes(jsonData);
    }

    filterUsers(jsonData) {
        const filter1 = jsonData.users.filter(userData => userData.user.first_name.toLowerCase() !== '3b3');
        const filter2 = filter1.filter(userData => !(userData.user['staff?'] === true && userData.user['active?'] === false));
        const filteredUsers = filter2.filter(userData =>  userData.user.image.link !== null);
        return filteredUsers;
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
        // const removedUsers = jsonData.users.filter(userData => !filteredUsers.includes(userData));
        // removedUsers.forEach(user => console.log(user.user.login)); // Uncomment both lines to see the list of users removed from the graveyard
    
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
    constructor(scene, position, type, yRotation, imageUrl) {
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