export function createStreetStones(THREE, scene, streetTiles, tileSize, groundLevel) {
    if (streetTiles.length === 0) return null;

    const stoneGeometry = new THREE.DodecahedronGeometry(0.2, 0);
    const stoneColors = [
        new THREE.Color(0x6e5c4e),
        new THREE.Color(0xa18870),
        new THREE.Color(0xbc9f85),
        new THREE.Color(0x8d8071)
    ];

    const streetStonesGroup = new THREE.Group();
    const stonesPerColor = Math.floor(10 / stoneColors.length); // densidade reduzida

    stoneColors.forEach(colorValue => {
        const material = new THREE.MeshLambertMaterial({ color: colorValue });
        const mesh = new THREE.InstancedMesh(stoneGeometry, material, stonesPerColor * streetTiles.length);
        const dummy = new THREE.Object3D();
        let instanceIndex = 0;

        streetTiles.forEach(tile => {
            for (let i = 0; i < stonesPerColor; i++) {
                dummy.position.set(tile.x + (Math.random() - 0.5) * tileSize, groundLevel, tile.z + (Math.random() - 0.5) * tileSize);
                dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                const scale = Math.random() * 0.5 + 0.3;
                dummy.scale.set(scale, scale, scale);
                dummy.position.y -= scale * 0.1;
                dummy.updateMatrix();
                mesh.setMatrixAt(instanceIndex++, dummy.matrix);
            }
        });
        mesh.instanceMatrix.needsUpdate = true;
        streetStonesGroup.add(mesh);
    });

    scene.add(streetStonesGroup);
    return streetStonesGroup;
}
