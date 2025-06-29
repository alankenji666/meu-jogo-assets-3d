// Este ficheiro age como um "módulo" separado para a relva.
// A biblioteca THREE é agora recebida como um parâmetro.

/**
 * Cria a relva do cenário usando InstancedMesh.
 * @param {THREE} THREE - A biblioteca Three.js passada pelo jogo principal.
 * @param {THREE.Scene} scene - A cena onde a relva será adicionada.
 * @param {Array<Object>} grassTiles - Um array com as posições dos tiles de relva.
 * @param {THREE.GLTFLoader} gltfLoader - O loader para carregar o modelo da relva.
 * @param {string} repoBaseUrl - O URL base do repositório de assets.
 * @param {number} tileSize - O tamanho de cada tile.
 * @param {number} groundLevel - A altura do chão.
 */
export async function createInstancedGrass(THREE, scene, grassTiles, gltfLoader, repoBaseUrl, tileSize, groundLevel) {
    if (grassTiles.length === 0) {
        console.log("Nenhum tile de grama encontrado para popular.");
        return;
    }

    try {
        const gltf = await gltfLoader.loadAsync(repoBaseUrl + 'grama3.glb');
        const grassSourceMesh = gltf.scene.children[0];

        if (!grassSourceMesh || !grassSourceMesh.isMesh) {
            console.error("Não foi possível encontrar uma malha no arquivo grama2.glb");
            return;
        }

        const grassGeometry = grassSourceMesh.geometry;
        const grassMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x38a300, 
            alphaTest: 0.5, 
            side: THREE.DoubleSide 
        });
        
        const instancesPerTile = 160; 
        const instanceCount = grassTiles.length * instancesPerTile;
        const instancedGrass = new THREE.InstancedMesh(grassGeometry, grassMaterial, instanceCount);

        const dummy = new THREE.Object3D();
        let instanceIndex = 0;

        grassTiles.forEach(tile => {
            for (let i = 0; i < instancesPerTile; i++) {
                dummy.position.set(
                    tile.x + (Math.random() - 0.5) * tileSize,
                    groundLevel,
                    tile.z + (Math.random() - 0.5) * tileSize
                );

                dummy.rotation.y = Math.random() * Math.PI * 2;
                const scale = Math.random() * 0.8 + 0.5;
                dummy.scale.set(scale, scale, scale);
                dummy.updateMatrix();
                instancedGrass.setMatrixAt(instanceIndex++, dummy.matrix);
            }
        });

        instancedGrass.instanceMatrix.needsUpdate = true;
        scene.add(instancedGrass);
        console.log(`[+] ${instanceCount} tufos de grama adicionados ao cenário.`);

    } catch (error) {
        console.error("Falha ao carregar e instanciar a grama:", error);
    }
}
