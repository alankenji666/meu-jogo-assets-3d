export function createLamppost(THREE, x, z, rotY) {
    const group = new THREE.Group();
    const postMat = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const lampMat = new THREE.MeshLambertMaterial({ color: 0xFFFF00, emissive: 0x000000 });

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 6, 4), postMat); // segmentos reduzidos
    post.position.y = 3;

    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.1), postMat);
    arm.position.set(0.4, 6, 0);

    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.3, 4, 4), lampMat); // segmentos reduzidos
    lamp.position.set(0.8, 5.8, 0);

    group.add(post, arm, lamp);
    group.position.set(x, 0.1, z);
    group.rotation.y = rotY;

    group.lamp = lamp;
    post.collisionRadius = 0.15;
    group.collisionObject = post;

    return group;
}
