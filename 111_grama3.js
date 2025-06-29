export async function createInstancedGrass(THREE, scene, grassTiles, gltfLoader, repoBaseUrl, tileSize, groundLevel) {
    if (grassTiles.length === 0) {
        console.log("Nenhum tile de grama encontrado para popular.");
        return;
    }

    try {
        const gltf = await gltfLoader.loadAsync(repoBaseUrl + '111_grama3.glb');
        const grassSourceMesh = gltf.scene.children[0];

        if (!grassSourceMesh || !grassSourceMesh.isMesh) {
            console.error("Não foi possível encontrar uma malha no arquivo 111_grama3.glb");
            return;
        }

        const grassGeometry = grassSourceMesh.geometry;
        const grassMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x38a300, 
            alphaTest: 0.5, 
            side: THREE.DoubleSide 
        });

        const instanceCount = grassTiles.length;
        const instancedGrass = new THREE.InstancedMesh(grassGeometry, grassMaterial, instanceCount);
        instancedGrass.castShadow = false; // otimização: sem sombra

        const dummy = new THREE.Object3D();

        grassTiles.forEach((tile, index) => {
            dummy.position.set(tile.x, groundLevel, tile.z);
            dummy.rotation.y = Math.random() * Math.PI * 2;
            const scale = tileSize * 0.5;
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            instancedGrass.setMatrixAt(index, dummy.matrix);
        });

        instancedGrass.instanceMatrix.needsUpdate = true;
        scene.add(instancedGrass);
        console.log(`[+] ${instanceCount} patches de grama adicionados ao cenário.`);

        return instancedGrass;

    } catch (error) {
        console.error("Falha ao carregar e instanciar a grama:", error);
    }
}
