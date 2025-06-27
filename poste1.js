// Este ficheiro age como um "módulo" separado para o nosso poste de luz.
// É necessário ter o Three.js carregado antes de este módulo ser usado.
const THREE = window.THREE;

/**
 * Cria um modelo 3D de um poste de luz.
 * @param {number} x - A posição X do poste.
 * @param {number} z - A posição Z do poste.
 * @param {number} rotY - A rotação Y do poste.
 * @returns {THREE.Group} O objeto do poste de luz criado.
 */
export function createLamppost(x, z, rotY) {
    const group = new THREE.Group();
    const postMat = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const lampMat = new THREE.MeshLambertMaterial({ color: 0xFFFF00, emissive: 0x000000 });
    
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 6, 8), postMat);
    post.position.y = 3;

    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.1), postMat);
    arm.position.set(0.4, 6, 0);

    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), lampMat);
    lamp.position.set(0.8, 5.8, 0);
    
    group.add(post, arm, lamp);
    group.position.set(x, 0.1, z);
    group.rotation.y = rotY;
    
    // Adicionamos a lâmpada ao grupo para que a lógica de dia/noite a possa encontrar
    group.lamp = lamp;
    
    // O raio de colisão pertence ao poste principal
    post.collisionRadius = 0.15;
    group.collisionObject = post;

    return group;
}