// Este ficheiro age como um "módulo" separado para a nossa árvore.
// Aqui, definimos tudo o que é necessário para criar uma árvore
// e depois exportamos a função principal para que o nosso jogo a possa usar.

// É necessário ter o Three.js carregado antes de este módulo ser usado.
const THREE = window.THREE;

/**
 * Cria um modelo 3D de uma árvore com um tronco e uma copa mais detalhada.
 * @param {number} x - A posição X da árvore.
 * @param {number} z - A posição Z da árvore.
 * @param {number} rotY - A rotação Y da árvore.
 * @param {THREE.Color | number} trunkColor - A cor do tronco.
 * @param {THREE.Color | number} foliageColor - A cor da copa.
 * @returns {THREE.Group} O objeto da árvore criado.
 */
export function createTree(x, z, rotY, trunkColor, foliageColor) {
    // Cria um grupo para conter todas as partes da árvore.
    // Desta forma, podemos mover, rodar ou apagar a árvore toda de uma vez.
    const group = new THREE.Group();
    group.isTree = true; // Flag para identificar o objeto como uma árvore
    group.hp = 100;      // Pontos de vida iniciais da árvore

    // Materiais com cores definidas. Usamos MeshLambertMaterial para que reaja à luz.
    const trunkMat = new THREE.MeshLambertMaterial({ color: trunkColor });
    const foliageMat = new THREE.MeshLambertMaterial({ color: foliageColor });

    // --- Criação do Tronco ---
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.3, 3, 8), 
        trunkMat
    );
    trunk.position.y = 1.5; // Levanta o tronco para que a base fique no chão

    // --- Criação da Copa (Foliage) ---
    // Usamos várias esferas para dar um aspeto mais "cheio" e natural.
    const foliage1 = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 6), foliageMat);
    foliage1.position.y = 3 + 1.2;

    const foliage2 = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 6), foliageMat);
    foliage2.position.set(0.8, 2.5, 0.5);

    const foliage3 = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), foliageMat);
    foliage3.position.set(-0.5, 2.8, -0.8);
    
    // Adiciona todas as partes ao grupo principal da árvore
    group.add(trunk, foliage1, foliage2, foliage3);

    // --- Posicionamento e Rotação Final ---
    group.position.set(x, 0.1, z); // Posição no mundo do jogo
    group.rotation.y = rotY;          // Rotação inicial

    // Define um raio de colisão para o tronco, para que o jogador não o atravesse.
    trunk.collisionRadius = 0.3;
    
    return group;
}
