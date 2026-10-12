// Initialize 3D Orb & Chat Logic on Load
window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('threeCanvasContainer');
    if (container) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(100, 100);
        container.appendChild(renderer.domElement);

        const geometry = new THREE.IcosahedronGeometry(1.6, 2);
        const material = new THREE.MeshNormalMaterial({ wireframe: true });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        camera.position.z = 4.5;

        function animate() {
            requestAnimationFrame(animate);
            sphere.rotation.x += 0.008;
            sphere.rotation.y += 0.01;
            renderer.render(scene, camera);
        }
        animate();
    }
});

function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById('userChatInput');
    const text = input.value.trim();
    if (!text) return;

    const container = document.getElementById('chatMessages');
    
    // Append User Message
    container.innerHTML += `
        <div class="message-block">
            <div class="user-header">
                <div class="avatar-circle">SC</div>
                <span>${escapeHtml(text)}</span>
            </div>
        </div>
    `;
    input.value = '';
    container.scrollTop = container.scrollHeight;

    // Loading state
    const loadId = 'loading-' + Date.now();
    container.innerHTML += `
        <div class="message-block" id="${loadId}">
            <div class="ai-body" style="color:var(--text-muted);">Generating response from Llama 3.2 3B...</div>
        </div>
    `;
    container.scrollTop = container.scrollHeight;

    try {
        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: "user", content: text }] })
        });
        const data = await res.json();
        const reply = data.response || data.result?.response || JSON.stringify(data);

        document.getElementById(loadId).remove();

        container.innerHTML += `
            <div class="message-block">
                <div class="ai-body">
                    <span style="color:var(--accent-purple); font-weight:700;">SOLACE AI+ ✦</span><br>
                    ${escapeHtml(reply).replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
    } catch (err) {
        document.getElementById(loadId).remove();
        container.innerHTML += `
            <div class="message-block">
                <div class="ai-body" style="color:#ef4444;">Error: ${err.message}</div>
            </div>
        `;
    }
    container.scrollTop = container.scrollHeight;
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}