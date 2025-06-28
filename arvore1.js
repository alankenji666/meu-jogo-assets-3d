/**
 * arvore1.js - Módulo de Geração de Árvores (Versão Otimizada)
 * * Este ficheiro substitui o original, mantendo a mesma interface (função exportada),
 * mas utiliza uma lógica de geração procedural muito mais avançada e otimizada.
 * Nenhuma alteração é necessária no código principal do jogo.
 * * Dependências: THREE.js deve ser carregado antes deste módulo.
 */

const THREE = window.THREE;

// --- Função Auxiliar Interna ---
// Para não criar uma nova dependência, a função `mergeGeometries` foi incluída diretamente aqui.
// Código original de three/examples/jsm/utils/BufferGeometryUtils.js
function mergeGeometries(geometries, useGroups = false) {
    const isIndexed = geometries[0].index !== null;
    const attributesUsed = new Set(Object.keys(geometries[0].attributes));
    const morphAttributesUsed = new Set(Object.keys(geometries[0].morphAttributes));
    const attributes = {};
    const morphAttributes = {};
    const morphTargetsRelative = geometries[0].morphTargetsRelative;
    const mergedGeometry = new THREE.BufferGeometry();
    let offset = 0;

    for (let i = 0; i < geometries.length; ++i) {
        const geometry = geometries[i];
        let attributesCount = 0;
        for (const name in geometry.attributes) {
            if (!attributesUsed.has(name)) continue;
            const attribute = geometry.attributes[name];
            if (attributes[name] === undefined) attributes[name] = [];
            attributes[name].push(attribute);
            attributesCount++;
        }
        if (attributesCount === 0) continue;
        if (useGroups) {
            let count;
            if (isIndexed) {
                count = geometry.index.count;
            } else if (geometry.attributes.position !== undefined) {
                count = geometry.attributes.position.count;
            } else {
                continue;
            }
            mergedGeometry.addGroup(offset, count, i);
            offset += count;
        }
    }

    for (const name in attributes) {
        const mergedAttribute = mergeAttributes(attributes[name]);
        if (!mergedAttribute) {
            return null;
        }
        mergedGeometry.setAttribute(name, mergedAttribute);
    }
    return mergedGeometry;
}

function mergeAttributes(attributes) {
    let arrayLength = 0;
    for (let i = 0; i < attributes.length; ++i) {
        const attribute = attributes[i];
        if (attribute.isInterleavedBufferAttribute) return null;
        arrayLength += attribute.array.length;
    }
    const array = new attributes[0].array.constructor(arrayLength);
    let offset = 0;
    for (let i = 0; i < attributes.length; ++i) {
        array.set(attributes[i].array, offset);
        offset += attributes[i].array.length;
    }
    return new THREE.BufferAttribute(array, attributes[0].itemSize, attributes[0].normalized);
}
// --- Fim da Função Auxiliar ---


// --- Geração da Geometria Base da Árvore ---
// Para performance, a geometria de UMA árvore é criada uma vez e guardada.
let cachedTreeGeometry = null;

function createBaseTreeGeometry() {
    if (cachedTreeGeometry) {
        return cachedTreeGeometry;
    }

    const trunkGeometries = [];
    const foliageGeometries = [];
    const appleGeometries = [];

    // Função recursiva para criar galhos
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

    cachedTreeGeometry = {
        trunk: mergeGeometries(trunkGeometries),
        foliage: mergeGeometries(foliageGeometries),
        apple: mergeGeometries(appleGeometries),
    };
    return cachedTreeGeometry;
}


/**
 * Cria um modelo 3D de uma árvore.
 * ESTA É A FUNÇÃO PRINCIPAL EXPORTADA.
 * A sua assinatura e retorno são idênticos ao do ficheiro original para garantir compatibilidade.
 * @param {number} x - A posição X da árvore.
 * @param {number} z - A posição Z da árvore.
 * @param {number} rotY - A rotação Y da árvore.
 * @param {THREE.Color | number} trunkColorInput - Cor do tronco (ignorada para usar o novo estilo).
 * @param {THREE.Color | number} foliageColorInput - Cor da copa (ignorada para usar o novo estilo).
 * @returns {THREE.Group} O objeto da árvore criado, contendo Meshes.
 */
export function createTree(x, z, rotY, trunkColorInput, foliageColorInput) {
    const treeGeom = createBaseTreeGeometry();

    const trunkColor = 0x2C1F1F;
    const foliageColor = 0xADFF2F;
    const appleColor = 0xdc143c;

    const trunkMaterial = new THREE.MeshLambertMaterial({ color: trunkColor });
    const foliageMaterial = new THREE.MeshBasicMaterial({ color: foliageColor, side: THREE.DoubleSide });
    const appleMaterial = new THREE.MeshLambertMaterial({ color: appleColor });

    const trunkMesh = new THREE.Mesh(treeGeom.trunk, trunkMaterial);
    const foliageMesh = new THREE.Mesh(treeGeom.foliage, foliageMaterial);
    const appleMesh = new THREE.Mesh(treeGeom.apple, appleMaterial);
    
    trunkMesh.castShadow = true;
    appleMesh.castShadow = true;
    trunkMesh.receiveShadow = true;
    
    // O retorno é um Group, exatamente como na versão original.
    const group = new THREE.Group();
    group.isTree = true;
    group.hp = 100;

    group.add(trunkMesh);
    group.add(foliageMesh);
    group.add(appleMesh);

    group.position.set(x, 0, z);
    group.rotation.y = rotY;
    
    // Adiciona uma propriedade para raio de colisão, caso o jogo a use.
    group.collisionRadius = 0.8;

    return group;
}
