// grass_tile_generator.js

// Este script fornece a função `createInstancedGrass` para gerar grama
// instanciada em uma cena Three.js, otimizando a performance.

// Importe THREE e GLTFLoader no seu projeto principal, se ainda não o fez.
// Exemplo:
// import * as THREE from 'three';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Cria grama instanciada na cena para otimizar o desempenho.
 * A grama é carregada de um modelo GLTF e posicionada em múltiplos tiles.
 *
 * @param {object} THREE - O objeto global THREE.js.
 * @param {THREE.Scene} scene - A cena Three.js onde a grama será adicionada.
 * @param {Array<object>} grassTiles - Um array de objetos { x, z } representando as posições dos tiles de grama.
 * @param {GLTFLoader} gltfLoader - Uma instância do GLTFLoader para carregar o modelo da grama.
 * @param {string} repoBaseUrl - A URL base do repositório GitHub onde o modelo da grama está localizado.
 * @param {number} tileSize - O tamanho de cada tile no jogo (usado para posicionamento).
 * @param {number} groundLevel - O nível do chão onde a grama será posicionada.
 */
export async function createInstancedGrass(THREE, scene, grassTiles, gltfLoader, repoBaseUrl, tileSize, groundLevel) {
    if (!grassTiles || grassTiles.length === 0) {
        console.warn("Nenhum tile de grama fornecido para instanciar.");
        return;
    }

    const grassModelUrl = repoBaseUrl + '111_grama3.glb'; // Modelo GLTF da grama

    try {
        const gltf = await gltfLoader.loadAsync(grassModelUrl);
        const grassSourceMesh = gltf.scene.children[0]; // Assume que o primeiro filho é a malha da grama

        if (!grassSourceMesh || !grassSourceMesh.isMesh) {
            console.error("Não foi possível encontrar uma malha no arquivo 111_grama3.glb");
            return;
        }

        const grassGeometry = grassSourceMesh.geometry;
        // O material foi alterado para usar MeshLambertMaterial conforme a sua solicitação
        const grassMaterial = new THREE.MeshLambertMaterial({
            color: 0x38a300, // Cor verde da grama (ajustada conforme sua solicitação)
            alphaTest: 0.5,
            side: THREE.DoubleSide
        });

        const instanceCount = grassTiles.length;
        const instancedGrass = new THREE.InstancedMesh(grassGeometry, grassMaterial, instanceCount);
        instancedGrass.castShadow = false; // otimização: sem sombra (conforme sua solicitação)
        instancedGrass.receiveShadow = true; // Mantido para receber sombras de outros objetos

        const dummy = new THREE.Object3D(); // Objeto temporário para definir a transformação de cada instância

        // Para cada tile de grama, define a posição, rotação e escala da instância
        grassTiles.forEach((tile, index) => {
            dummy.position.set(
                tile.x,
                groundLevel, // Posiciona no nível do chão
                tile.z
            );
            // Adiciona uma rotação aleatória para variar a aparência da grama
            dummy.rotation.y = Math.random() * Math.PI * 2; // Rotação aleatória completa, removido o offset
            const scale = tileSize * 0.5; // Escala ajustada conforme sua solicitação
            dummy.scale.set(scale, scale, scale);

            dummy.updateMatrix(); // Atualiza a matriz do objeto dummy
            instancedGrass.setMatrixAt(index, dummy.matrix); // Aplica a matriz à instância
        });

        instancedGrass.instanceMatrix.needsUpdate = true; // Sinaliza que as instâncias precisam ser atualizadas

        scene.add(instancedGrass);
        console.log(`[+] ${instanceCount} patches de grama adicionados ao cenário.`);

        return instancedGrass; // Retorna a malha instanciada

    } catch (error) {
        console.error("Erro ao carregar ou instanciar o modelo da grama:", error);
    }
}
