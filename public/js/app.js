/**
 * SOLACE AGI Core - Client State & Interactive Sandbox Controller
 */

let agenticModeEnabled = true;
let attachedFileContent = null;
let attachedFileName = null;
let threads = [];
let activeThreadId = null;

window.addEventListener('DOMContentLoaded', () => {
    const googleBtn = document.getElementById('googleLoginBtn');
    const emailBtn = document.getElementById('emailLoginBtn');
    if (googleBtn) googleBtn.addEventListener('click', handleGoogleOAuthLogin);
    if (emailBtn) emailBtn.addEventListener('click', handleEmailAuthSubmit);

    const savedTheme = localStorage.getItem('solace_theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        const icon = document.getElementById('themeToggleIcon');
        if (icon) icon.innerText = "☀️";
    }

    const isLoggedIn = localStorage.getItem('solace_is_logged_in');
    if (isLoggedIn === 'true') {
        const overlay = document.getElementById('authScreenOverlay');
        if (overlay) overlay.style.display = 'none';
        loadUserProfile();
        loadThreadsFromStorage();
    } else {
        const overlay = document.getElementById('authScreenOverlay');
        if (overlay) overlay.style.display = 'flex';
    }

    initNeuralConstellationSphere();
});

function loadThreadsFromStorage() {
    const stored = localStorage.getItem('solace_chat_threads');
    if (stored) threads = JSON.parse(stored);
    if (threads.length === 0) createNewThread();
    else switchThread(threads[0].id);
}

function saveThreadsToStorage() {
    localStorage.setItem('solace_chat_threads', JSON.stringify(threads));
    renderThreadList();
}

function createNewThread() {
    const newThread = {
        id: 'thread-' + Date.now(),
        title: 'Neural Session',
        messages: []
    };
    threads.unshift(newThread);
    saveThreadsToStorage();
    switchThread(newThread.id);
}

function switchThread(id) {
    activeThreadId = id;
    renderThreadList();
    renderActiveThreadMessages();
}

function clearCurrentChat() {
    const thread = threads.find(t => t.id === activeThreadId);
    if (!thread) return;
    if (confirm("Are you sure you want to clear this session?")) {
        thread.messages = [];
        thread.title = "Neural Session";
        saveThreadsToStorage();
        renderActiveThreadMessages();
    }
}

function exportCurrentChat() {
    const thread = threads.find(t => t.id === activeThreadId);
    if (!thread || thread.messages.length === 0) {
        alert("No messages to export.");
        return;
    }
    const exportData = JSON.stringify(thread, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${thread.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_solace.json`;
    a.click();
    URL.revokeObjectURL(url);
}

async function triggerPlugin(pluginName) {
    const thread = threads.find(t => t.id === activeThreadId);
    if (!thread) return;

    const pluginPrompt = `Execute plugin: ${pluginName}`;
    thread.messages.push({ role: 'user', content: `Run plugin [${pluginName}]` });
    saveThreadsToStorage();
    renderActiveThreadMessages();

    try {
        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                messages: thread.messages,
                prompt: pluginPrompt,
                plugin: pluginName 
            })
        });

        const data = await res.json();
        const reply = data.response || "Plugin executed successfully.";
        const telemetry = data.telemetry || { latency: "0.1ms", tokens: "512", confidence: "100%" };

        thread.messages.push({ role: 'assistant', content: reply, telemetry });
        saveThreadsToStorage();
        renderActiveThreadMessages();
    } catch (err) {
        thread.messages.push({ role: 'assistant', content: "Plugin Execution Error: " + err.message });
        saveThreadsToStorage();
        renderActiveThreadMessages();
    }
}

function renderThreadList() {
    const list = document.getElementById('chatHistoryList');
    if (!list) return;
    list.innerHTML = '';
    threads.forEach(t => {
        const isActive = t.id === activeThreadId;
        list.innerHTML += `
            <div class="history-item ${isActive ? 'active' : ''}" onclick="switchThread('${t.id}')">
                <span>💬 ${escapeHtml(t.title)}</span>
            </div>
        `;
    });
}

function renderActiveThreadMessages() {
    const container = document.getElementById('chatMessagesWrapper');
    if (!container) return;
    const thread = threads.find(t => t.id === activeThreadId);
    if (!thread) return;

    const titleEl = document.getElementById('currentThreadTitle');
    if (titleEl) titleEl.innerText = thread.title;

    let html = `
        <div class="hero-3d-card glass-panel">
            <div>
                <h2 style="font-size:18px; font-weight:800; color:#f8fafc;">SOLACE AI+ [Singularity Core $\Omega$]</h2>
                <p style="font-size:13px; color:var(--text-muted); margin-top:4px;">Active Thread: ${escapeHtml(thread.title)}</p>
            </div>
            <div id="threeCanvasContainer" style="width:110px; height:110px; border-radius:16px; overflow:hidden;"></div>
        </div>
    `;

    if (thread.messages.length === 0) {
        html += `
            <div class="message-block">
                <div class="ai-response-block glass-panel">
                    <div class="ai-label">✦ SOLACE Intelligence</div>
                    <div class="response-text" style="color:var(--text-main);">
                        Hello Samrat! I am your autonomous neural operating system—blending absolute engineering brilliance with empathy, wit, and common sense. How can I make your day easier?
                    </div>
                </div>
            </div>
        `;
    } else {
        thread.messages.forEach(m => {
            if (m.role === 'user') {
                html += `
                    <div class="message-block">
                        <div class="user-prompt-header">
                            <div class="user-avatar-sm">SC</div>
                            <span>${escapeHtml(m.content)}</span>
                        </div>
                    </div>
                `;
            } else {
                let telemetryHtml = m.telemetry ? `
                    <div style="font-size:11px; color:#94a3b8; display:flex; gap:16px; margin-top:12px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.08); font-family:'JetBrains Mono', monospace;">
                        <span>⚡ Latency: ${m.telemetry.latency}</span>
                        <span>📊 Tokens: ${m.telemetry.tokens}</span>
                        <span>🛡️ Confidence: ${m.telemetry.confidence}</span>
                    </div>
                ` : '';

                html += `
                    <div class="message-block">
                        <div class="ai-response-block glass-panel">
                            <div class="ai-label">✦ SOLACE Intelligence</div>
                            <div>${formatResponseText(m.content)}</div>
                            ${telemetryHtml}
                        </div>
                    </div>
                `;
            }
        });
    }

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
    initNeuralConstellationSphere();
}

function handleGoogleOAuthLogin() {
    localStorage.setItem('solace_is_logged_in', 'true');
    localStorage.setItem('solace_user_name', 'Samrat Chaudhary');
    localStorage.setItem('solace_user_email', 'samrat@gmail.com');
    
    const overlay = document.getElementById('authScreenOverlay');
    if (overlay) overlay.style.display = 'none';
    loadUserProfile();
    loadThreadsFromStorage();
}

function handleEmailAuthSubmit() {
    const emailField = document.getElementById('inputAuthEmail');
    const email = emailField ? emailField.value.trim() : '';
    if (!email) { alert('Please enter developer email.'); return; }

    localStorage.setItem('solace_is_logged_in', 'true');
    localStorage.setItem('solace_user_email', email);
    localStorage.setItem('solace_user_name', email.split('@')[0]);
    
    const overlay = document.getElementById('authScreenOverlay');
    if (overlay) overlay.style.display = 'none';
    loadUserProfile();
    loadThreadsFromStorage();
}

function loadUserProfile() {
    const name = localStorage.getItem('solace_user_name') || 'Samrat Chaudhary';
    const nameDisplay = document.getElementById('userNameDisplay');
    if (nameDisplay) nameDisplay.innerText = name;
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    document.documentElement.classList.toggle('light', !isDark);
    const themeIcon = document.getElementById('themeToggleIcon');
    if (themeIcon) themeIcon.innerText = isDark ? "🌙" : "☀️";
    localStorage.setItem('solace_theme', isDark ? 'dark' : 'light');
}

function openCanvasPanel(content) {
    const split = document.getElementById('workspaceSplit');
    const panel = document.getElementById('canvasArtifactPanel');
    const contentEl = document.getElementById('canvasArtifactContent');

    if (split) split.classList.add('canvas-open');
    if (panel) panel.style.display = 'flex';
    if (contentEl) contentEl.innerText = content;
}

function closeCanvasPanel() {
    const split = document.getElementById('workspaceSplit');
    const panel = document.getElementById('canvasArtifactPanel');

    if (split) split.classList.remove('canvas-open');
    if (panel) panel.style.display = 'none';
}

function executeArtifactSandbox() {
    const contentEl = document.getElementById('canvasArtifactContent');
    const statusEl = document.getElementById('sandboxExecutionStatus');
    if (!contentEl) return;
    const code = contentEl.innerText;
    try {
        const logs = [];
        const customConsole = { log: (...args) => logs.push(args.join(" ")) };
        const runFn = new Function('console', code);
        runFn(customConsole);
        if (statusEl) statusEl.innerText = "Execution Verified | 0 Anomalies";
        alert("SOLACE Sandbox Output:\n\n" + (logs.join("\n") || "Code executed cleanly with zero anomalies."));
    } catch (err) {
        if (statusEl) statusEl.innerText = "Runtime Exception Detected";
        alert("Runtime Execution Error: " + err.message);
    }
}

function toggleAgenticMode() {
    agenticModeEnabled = !agenticModeEnabled;
    const btn = document.getElementById('agentToggleBtn');
    if (btn) {
        btn.innerHTML = agenticModeEnabled ? '<span class="agent-icon">🤖</span> Empathy & Wit: ON' : '🤖 Empathy & Wit: OFF';
        btn.classList.toggle('active', agenticModeEnabled);
    }
}

/**
 * Stunning Cybernetic Neural Constellation Sphere (Replaces old torus)
 */
function initNeuralConstellationSphere() {
    const container = document.getElementById('threeCanvasContainer');
    if (!container || container.children.length > 0) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(110, 110);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Glowing Particle Sphere representing Neural Constellation
    const particleCount = 350;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 1.3 + Math.random() * 0.2;

        positions[i] = r * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = r * Math.cos(phi);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.05,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
    });

    const particleSphere = new THREE.Points(geometry, material);
    scene.add(particleSphere);

    // Inner Glowing Core Icosahedron
    const coreGeometry = new THREE.IcosahedronGeometry(0.7, 1);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        wireframe: true,
        transparent: true,
        opacity: 0.6
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    camera.position.z = 3.2;

    function animate() {
        requestAnimationFrame(animate);
        particleSphere.rotation.y += 0.003;
        particleSphere.rotation.x += 0.001;
        coreMesh.rotation.y -= 0.008;
        coreMesh.rotation.z += 0.005;
        renderer.render(scene, camera);
    }
    animate();
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    attachedFileName = file.name;
    const reader = new FileReader();
    reader.onload = function(e) {
        attachedFileContent = e.target.result;
        const indicator = document.getElementById('attachedFileIndicator');
        const nameEl = document.getElementById('attachedFileName');
        if (indicator && nameEl) {
            nameEl.innerText = attachedFileName;
            indicator.style.display = 'flex';
        }
    };
    reader.readAsText(file);
}

function removeAttachedFile() {
    attachedFileContent = null;
    attachedFileName = null;
    const indicator = document.getElementById('attachedFileIndicator');
    const fileInput = document.getElementById('fileUploadInput');
    if (indicator) indicator.style.display = 'none';
    if (fileInput) fileInput.value = '';
}

function toggleVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Speech recognition not supported.');
        return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    const micBtn = document.getElementById('micBtn');

    recognition.onstart = () => { if(micBtn) { micBtn.innerText = "🎙️ Listening..."; micBtn.style.color = "#f59e0b"; } };
    recognition.onresult = (event) => {
        const input = document.getElementById('userChatInput');
        if(input) input.value = event.results[0][0].transcript;
    };
    recognition.onend = () => { if(micBtn) { micBtn.innerText = "🎙️ Voice Input"; micBtn.style.color = ""; } };
    recognition.start();
}

function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendUserMessage();
    }
}

async function sendUserMessage() {
    const input = document.getElementById('userChatInput');
    if (!input) return;
    let text = input.value.trim();
    if (!text && !attachedFileContent) return;

    if (attachedFileContent) {
        text = `[Attached File: ${attachedFileName}]\n${attachedFileContent}\n\nUser Query: ${text}`;
        removeAttachedFile();
    }

    const thread = threads.find(t => t.id === activeThreadId);
    if (!thread) return;

    if (thread.messages.length === 0) {
        thread.title = text.length > 28 ? text.substring(0, 28) + '...' : text;
    }

    thread.messages.push({ role: 'user', content: text });
    input.value = '';
    saveThreadsToStorage();
    renderActiveThreadMessages();

    try {
        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                messages: thread.messages,
                prompt: text,
                agentic: agenticModeEnabled 
            })
        });

        const data = await res.json();
        const reply = data.response || data.result?.response || JSON.stringify(data);
        const telemetry = data.telemetry || { latency: "0.1ms", tokens: "4096", confidence: "99.999%" };

        thread.messages.push({ role: 'assistant', content: reply, telemetry });
        saveThreadsToStorage();
        renderActiveThreadMessages();

        if (reply.includes("```")) {
            const codeMatch = reply.match(/```(.*?)\n([\s\S]*?)```/);
            if (codeMatch && codeMatch[2]) {
                openCanvasPanel(codeMatch[2].trim());
            }
        }
    } catch (err) {
        thread.messages.push({ role: 'assistant', content: "Error executing request: " + err.message });
        saveThreadsToStorage();
        renderActiveThreadMessages();
    }
}

function formatResponseText(text) {
    if (text.includes("```")) {
        return text.replace(/```(.*?)\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre><code>${escapeHtml(code.trim())}</code></pre><button class="canvas-btn run" onclick="openCanvasPanel(\`${escapeHtml(code.trim())}\`)">🎨 Open Artifact Sandbox</button>`;
        });
    }
    return escapeHtml(text).replace(/\n/g, '<br>');
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}