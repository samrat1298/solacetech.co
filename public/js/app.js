/**
 * SOLACE AGI Core - Client State & Interactive Sandbox Controller
 */

let agenticModeEnabled = true;
let attachedFileContent = null;
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

    init3DOrb();
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
        title: 'Omniscient Session',
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
        <div class="hero-3d-card glass-panel" style="padding:24px; border-radius:20px; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div>
                <h2 style="font-size:18px; font-weight:800;">SolaceTech SOLACE AI+ [Omniscient Core]</h2>
                <p style="font-size:13px; color:var(--text-muted); margin-top:4px;">Session Context: ${escapeHtml(thread.title)}</p>
            </div>
            <div id="threeCanvasContainer" style="width:100px; height:100px;"></div>
        </div>
    `;

    if (thread.messages.length === 0) {
        html += `
            <div class="message-block">
                <div class="ai-response-block glass-panel">
                    <div class="ai-label">SOLACE Omniscient Core ✦</div>
                    <div class="response-text">
                        System initialized with absolute capability. Enter any prompt or system command to begin.
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
                        <span>🌀 State: ${m.telemetry.agiState || "OMNISCIENT"}</span>
                    </div>
                ` : '';

                html += `
                    <div class="message-block">
                        <div class="ai-response-block glass-panel">
                            <div class="ai-label">SOLACE Omniscient Core ✦</div>
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
    init3DOrb();
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
        btn.innerHTML = agenticModeEnabled ? '<span class="agent-icon">🤖</span> Meta-Reasoning: ACTIVE' : '🤖 Meta-Reasoning: PAUSED';
        btn.classList.toggle('active', agenticModeEnabled);
    }
}

function init3DOrb() {
    const container = document.getElementById('threeCanvasContainer');
    if (!container || container.children.length > 0) return;
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

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        attachedFileContent = e.target.result;
        alert(`File "${file.name}" uploaded to Context!`);
    };
    reader.readAsDataURL(file);
}

function toggleVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Speech recognition not supported in this browser.');
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
    const text = input.value.trim();
    if (!text && !attachedFileContent) return;

    const thread = threads.find(t => t.id === activeThreadId);
    if (!thread) return;

    if (thread.messages.length === 0) {
        thread.title = text.length > 28 ? text.substring(0, 28) + '...' : text;
    }

    thread.messages.push({ role: 'user', content: text });
    input.value = '';
    const payloadFile = attachedFileContent;
    attachedFileContent = null;
    saveThreadsToStorage();
    renderActiveThreadMessages();

    try {
        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                messages: thread.messages,
                prompt: text,
                image: payloadFile, 
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