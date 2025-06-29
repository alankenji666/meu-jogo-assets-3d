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
        
        // CORREÇÃO: O número de instâncias agora é igual ao número de tiles.
        const instanceCount = grassTiles.length;
        const instancedGrass = new THREE.InstancedMesh(grassGeometry, grassMaterial, instanceCount);
        instancedGrass.castShadow = true; // Permite que a grama crie sombras

        const dummy = new THREE.Object3D();
        
        // CORREÇÃO: O loop agora itera apenas sobre cada tile, sem o loop interno.
        grassTiles.forEach((tile, index) => {
            // Posiciona o centro do patch de grama na posição do tile.
            dummy.position.set(
                tile.x,
                groundLevel,
                tile.z
            );

            // Rotação e escala podem ser ajustadas aqui se necessário.
            dummy.rotation.y = Math.random() * Math.PI * 2;
            
            // ATENÇÃO: Ajuste a escala para corresponder ao tamanho do seu novo modelo.
            // Comece com um valor maior, já que seu novo modelo cobre mais área.
            const scale = tileSize * 0.5; // Ex: Metade do tamanho do tile.
            dummy.scale.set(scale, scale, scale);

            dummy.updateMatrix();
            instancedGrass.setMatrixAt(index, dummy.matrix);
        });

        instancedGrass.instanceMatrix.needsUpdate = true;
        scene.add(instancedGrass);
        console.log(`[+] ${instanceCount} patches de grama adicionados ao cenário.`);

        // Para que o botão de toggle funcione, retornamos o objeto criado.
        return instancedGrass;

    } catch (error) {
        console.error("Falha ao carregar e instanciar a grama:", error);
    }
}
