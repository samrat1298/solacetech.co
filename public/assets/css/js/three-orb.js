function render3DOrb(containerId) {
    const container = document.getElementById(containerId);
    if (!container || container.children.length > 0) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(120, 120);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(1.8, 2);
    const material = new THREE.MeshNormalMaterial({ wireframe: true });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    camera.position.z = 4.5;

    function animate() {
        requestAnimationFrame(animate);
        sphere.rotation.x += 0.006;
        sphere.rotation.y += 0.009;
        renderer.render(scene, camera);
    }
    animate();
}

window.render3DOrb = render3DOrb;