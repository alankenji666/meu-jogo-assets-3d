

/**
 * Cria árvores usando InstancedMesh para otimizar o desempenho.
 * @param {THREE.Scene} scene - A cena onde as árvores serão adicionadas.
 * @param {Array<Object>} treeTiles - Um array com as posições das árvores.
 * @param {number} trunkColor - Cor do tronco.
 * @param {number} foliageColor - Cor da copa.
 * @param {number} groundLevel - Altura do solo.
 * @returns {{ trunks: THREE.InstancedMesh, foliage: THREE.InstancedMesh }}
 */
export function createInstancedTrees(THREE, scene, treeTiles, trunkColor = 0x8B4513, foliageColor = 0x228B22, groundLevel = 0.1) {
    if (!treeTiles || treeTiles.length === 0) {
        console.log("Nenhuma árvore para instanciar.");
        return;
    }

    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 3, 8);
    const foliageGeometry = new THREE.SphereGeometry(1.5, 8, 6);

    const trunkMaterial = new THREE.MeshLambertMaterial({ color: trunkColor });
    const foliageMaterial = new THREE.MeshLambertMaterial({ color: foliageColor });

    const trunkMesh = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, treeTiles.length);
    const foliageMesh = new THREE.InstancedMesh(foliageGeometry, foliageMaterial, treeTiles.length);

    const dummy = new THREE.Object3D();

    treeTiles.forEach((tile, i) => {
        const x = tile.x;
        const z = tile.z;
        const rotY = Math.random() * Math.PI * 2;

        // Tronco
        dummy.position.set(x, groundLevel + 1.5, z);
        dummy.rotation.set(0, rotY, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        trunkMesh.setMatrixAt(i, dummy.matrix);

        // Copa
        dummy.position.set(x, groundLevel + 3.5, z);
        dummy.rotation.set(0, rotY, 0);
        const scale = Math.random() * 0.3 + 0.9;
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        foliageMesh.setMatrixAt(i, dummy.matrix);
    });

    trunkMesh.instanceMatrix.needsUpdate = true;
    foliageMesh.instanceMatrix.needsUpdate = true;

    scene.add(trunkMesh);
    scene.add(foliageMesh);

    console.log(`[+] ${treeTiles.length} árvores instanciadas com sucesso.`);

    return { trunks: trunkMesh, foliage: foliageMesh };
}
