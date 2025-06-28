// Este ficheiro age como um "módulo" separado para a nossa árvore.
// Aqui, definimos tudo o que é necessário para criar uma árvore
// e depois exportamos a função principal para que o nosso jogo a possa usar.

// É necessário ter o Three.js e o BufferGeometryUtils carregados antes de este módulo ser usado.
const THREE = window.THREE;
const { mergeGeometries } = window.THREE.BufferGeometryUtils;

// --- Geração da Geometria Base da Árvore (Otimizada) ---
// Para maximizar a performance, criamos a geometria de UMA árvore apenas uma vez
// e guardamos numa cache. Todas as árvores subsequentes serão clones desta geometria base.
let cachedTreeGeometry = null;

function createBaseTreeGeometry() {
    if (cachedTreeGeometry) {
        return cachedTreeGeometry;
    }

    const trunkColor = 0x2C1F1F;
    const foliageColor = new THREE.Color(0xADFF2F);
    
    const trunkGeometries = [];
    const foliageGeometries = [];
    const appleGeometries = [];

    // Função recursiva para criar a estrutura de galhos
    function createBranch(startPoint, direction, length, thickness, level) {
        if (level <= 0) return;

        const branchGeom = new THREE.CylinderGeometry(thickness * 0.7, thickness, length, 8);
        const endPoint = startPoint.clone().add(direction.clone().multiplyScalar(length));
        
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction.clone().normalize());
        const position = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5);
        const matrix = new THREE.Matrix4().compose(position, quaternion, new THREE.Vector3(1, 1, 1));
        branchGeom.applyMatrix4(matrix);
        trunkGeometries.push(branchGeom);

        const addFoliage = (level === 1) || (level === 2 && Math.random() > 0.1) || (level === 3 && Math.random() > 0.5) || (level === 4 && Math.random() > 0.7);

        if (addFoliage) {
            const leavesPerTwig = 25; 
            for (let i = 0; i < leavesPerTwig; i++) {
                const leafGeom = new THREE.PlaneGeometry(1.2, 1.0);
                const leafMatrix = new THREE.Matrix4();
                const offset = new THREE.Vector3((Math.random() - 0.5) * 2.5, (Math.random() - 0.5) * 2.5, (Math.random() - 0.5) * 2.5);
                const rotation = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                leafMatrix.makeRotationFromEuler(rotation);
                leafMatrix.setPosition(endPoint.clone().add(offset));
                leafGeom.applyMatrix4(leafMatrix);
                foliageGeometries.push(leafGeom);
            }
             if (Math.random() > 0.5) {
                const appleGeom = new THREE.IcosahedronGeometry(0.4, 1);
                const appleMatrix = new THREE.Matrix4();
                appleMatrix.makeTranslation(endPoint.x, endPoint.y, endPoint.z);
                appleGeom.applyMatrix4(appleMatrix);
                appleGeometries.push(appleGeom);
            }
        }
        
        const numNewBranches = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < numNewBranches; i++) {
            const newDirection = direction.clone();
            newDirection.x += (Math.random() - 0.5) * 1.5;
            newDirection.y += (Math.random() - 0.5) * 0.5;
            newDirection.z += (Math.random() - 0.5) * 1.5;
            newDirection.normalize();
            createBranch(endPoint, newDirection, length * 0.8, thickness * 0.7, level - 1);
        }
    }

    // --- Geração da Geometria ---
    const trunkHeight = 6;
    const trunkThickness = 0.6;
    const mainTrunkGeom = new THREE.CylinderGeometry(trunkThickness * 0.7, trunkThickness, trunkHeight, 10);
    mainTrunkGeom.translate(0, trunkHeight / 2, 0);
    trunkGeometries.push(mainTrunkGeom);
    
    const numMainBranches = 4;
    for (let i = 0; i < numMainBranches; i++) {
        const startY = trunkHeight * 0.4 + Math.random() * (trunkHeight * 0.3);
        const startPoint = new THREE.Vector3(0, startY, 0);
        const initialDirection = new THREE.Vector3((Math.random() - 0.5) * 2, 0.7 + Math.random() * 0.5, (Math.random() - 0.5) * 2).normalize();
        createBranch(startPoint, initialDirection, 5, trunkThickness * 0.7, 4);
    }
    
    // Junta todas as geometrias numa só para cada parte da árvore
    const finalTrunkGeom = mergeGeometries(trunkGeometries);
    const finalFoliageGeom = mergeGeometries(foliageGeometries);
    const finalAppleGeom = mergeGeometries(appleGeometries);

    // Guarda o resultado na cache
    cachedTreeGeometry = {
        trunk: finalTrunkGeom,
        foliage: finalFoliageGeom,
        apple: finalAppleGeom,
        foliageColor: foliageColor
    };

    return cachedTreeGeometry;
}


/**
 * Cria um modelo 3D de uma árvore, mantendo a assinatura da função original.
 * Esta função agora usa a geometria otimizada e cria objetos Mesh individuais
 * para ser compatível com o retorno esperado (um THREE.Group com Meshes).
 * @param {number} x - A posição X da árvore.
 * @param {number} z - A posição Z da árvore.
 * @param {number} rotY - A rotação Y da árvore.
 * @param {THREE.Color | number} trunkColorInput - A cor do tronco (ignorada, usa a cor pré-definida).
 * @param {THREE.Color | number} foliageColorInput - A cor da copa (ignorada, usa a cor pré-definida).
 * @returns {THREE.Group} O objeto da árvore criado.
 */
export function createTree(x, z, rotY, trunkColorInput, foliageColorInput) {
    // 1. Obtém a geometria base da árvore (da cache, se já existir)
    const treeGeom = createBaseTreeGeometry();

    // 2. Cria os materiais
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x2C1F1F });
    const foliageMaterial = new THREE.MeshBasicMaterial({ color: treeGeom.foliageColor, side: THREE.DoubleSide });
    const appleMaterial = new THREE.MeshLambertMaterial({ color: 0xdc143c });

    // 3. Cria as Meshes individuais a partir das geometrias fundidas
    const trunkMesh = new THREE.Mesh(treeGeom.trunk, trunkMaterial);
    const foliageMesh = new THREE.Mesh(treeGeom.foliage, foliageMaterial);
    const appleMesh = new THREE.Mesh(treeGeom.apple, appleMaterial);
    
    // Ativa as sombras para as partes que reagem à luz
    trunkMesh.castShadow = true;
    appleMesh.castShadow = true;
    trunkMesh.receiveShadow = true;

    // 4. Cria o grupo principal, tal como na função original
    const group = new THREE.Group();
    group.isTree = true; // Flag para identificar o objeto como uma árvore
    group.hp = 100;      // Pontos de vida iniciais da árvore

    // Adiciona as partes ao grupo
    group.add(trunkMesh);
    group.add(foliageMesh);
    group.add(appleMesh);

    // 5. Aplica a posição e rotação ao grupo, como esperado
    group.position.set(x, 0, z);
    group.rotation.y = rotY;
    
    return group;
}