import * as THREE from 'three';

// As dependências do módulo (World, CollisionManager, State) 
// serão injetadas através da função init para manter o código desacoplado.
let World;
let CollisionManager;
let State;

/**
 * TreeManager lida com a criação, remoção e renderização eficiente de árvores
 * usando InstancedMesh.
 */
const TreeManager = {
    instancedMesh: null,
    pool: [], // Pool de IDs de instância disponíveis
    activeInstances: new Map(), // Mapeia chunkId para um array de instanceIds
    dummy: new THREE.Object3D(), // Objeto auxiliar para definir a matriz de cada instância

    /**
     * Inicializa o TreeManager.
     * @param {object} worldRef - A referência para o módulo World.
     * @param {object} collisionManagerRef - A referência para o módulo CollisionManager.
     * @param {object} stateRef - A referência para o objeto de estado global do jogo.
     * @param {object} treeAsset - O ativo GLTF da árvore carregado pelo AssetManager.
     */
    init(worldRef, collisionManagerRef, stateRef, treeAsset) {
        World = worldRef;
        CollisionManager = collisionManagerRef;
        State = stateRef;

        if (!treeAsset) {
            console.error("Ativo da árvore (treeAsset) não fornecido para o TreeManager.");
            return;
        }

        const source = treeAsset.scene.children[0];
        if (!source || !source.isMesh) {
            console.error("Nenhuma malha encontrada no GLTF da árvore.");
            return;
        }

        const geometry = source.geometry;
        const material = source.material;
        const maxCount = 5000; // Máximo de árvores no mundo de uma vez

        this.instancedMesh = new THREE.InstancedMesh(geometry, material, maxCount);
        this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        World.scene.add(this.instancedMesh);

        // Preenche o pool com todos os índices disponíveis
        this.pool = Array.from({ length: maxCount }, (_, i) => i);
    },

    /**
     * Retorna o número total de árvores ativas na cena.
     * @returns {number}
     */
    getTotalTreeCount() {
        let count = 0;
        for (const ids of this.activeInstances.values()) {
            count += ids.length;
        }
        return count;
    },

    /**
     * Adiciona um conjunto de árvores para um chunk específico.
     * @param {string} chunkId - O identificador do chunk.
     * @param {THREE.Vector3[]} positions - Um array de posições para as novas árvores.
     */
    addTreesForChunk(chunkId, positions) {
        if (!this.instancedMesh) return;

        const instanceIdsForChunk = [];
        for (const pos of positions) {
            if (this.pool.length === 0) {
                console.warn("Pool do TreeManager está cheia. Não é possível adicionar mais árvores.");
                break;
            }
            const instanceId = this.pool.pop();
            
            const scale = THREE.MathUtils.randFloat(4.0, 5.5);
            // Usa o valor de deslocamento Y das configurações de depuração
            pos.y = State.debug.treeYOffset;

            this.dummy.position.copy(pos);
            this.dummy.rotation.y = Math.random() * Math.PI * 2;
            this.dummy.scale.set(scale, scale, scale);
            this.dummy.updateMatrix();
            
            this.instancedMesh.setMatrixAt(instanceId, this.dummy.matrix);
            
            instanceIdsForChunk.push(instanceId);
        }

        if (instanceIdsForChunk.length > 0) {
            this.activeInstances.set(chunkId, instanceIdsForChunk);
            CollisionManager.addTreeCollidersForChunk(chunkId, positions);
            this.instancedMesh.instanceMatrix.needsUpdate = true;
        }
    },

    /**
     * Remove todas as árvores associadas a um chunk.
     * @param {string} chunkId - O identificador do chunk a ser limpo.
     */
    removeTreesForChunk(chunkId) {
        if (!this.instancedMesh || !this.activeInstances.has(chunkId)) return;

        const instanceIds = this.activeInstances.get(chunkId);
        for (const instanceId of instanceIds) {
            // "Esconde" a instância escalando-a para zero
            this.dummy.scale.set(0, 0, 0);
            this.dummy.updateMatrix();
            this.instancedMesh.setMatrixAt(instanceId, this.dummy.matrix);

            // Retorna o índice para o pool para reutilização
            this.pool.push(instanceId);
        }
        
        this.activeInstances.delete(chunkId);
        CollisionManager.removeTreeCollidersForChunk(chunkId);
        this.instancedMesh.instanceMatrix.needsUpdate = true;
    }
};

export { TreeManager };
