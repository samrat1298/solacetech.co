/**
 * SOLACE AI+ [PRO] - Frontend Client Script & Event Handlers
 */

let agenticModeEnabled = false;
let attachedFileContent = null;
let tempAvatarData = "";
let threads = [];
let activeThreadId = null;

window.addEventListener('DOMContentLoaded', () => {
    const googleBtn = document.getElementById('googleLoginBtn');
    const emailBtn = document.getElementById('emailLoginBtn');
    if (googleBtn) googleBtn.addEventListener('click', handleGoogleOAuthLogin);
    if (emailBtn) emailBtn.addEventListener('click', handleEmailAuthSubmit);

    const savedTheme = localStorage.getItem('solace_theme') || 'dark';
    if(savedTheme === 'light') {
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

    const savedModel = localStorage.getItem('solace_model');
    if(savedModel) {
        const modelSelect = document.getElementById('modelSelect');
        if (modelSelect) modelSelect.value = savedModel;
    }
    const savedMemory = localStorage.getItem('solace_persistent_memory');
    if(savedMemory) {
        const memInput = document.getElementById('persistentMemoryInput');
        if (memInput) memInput.value = savedMemory;
    }

    updateModelBadge();
    init3DOrb();
});

function loadThreadsFromStorage() {
    const stored = localStorage.getItem('solace_chat_threads');
    if (stored) {
        threads = JSON.parse(stored);
    }
    if (threads.length === 0) {
        createNewThread();
    } else {
        switchThread(threads[0].id);
    }
}

function saveThreadsToStorage() {
    localStorage.setItem('solace_chat_threads', JSON.stringify(threads));
    renderThreadList();
}

function createNewThread() {
    const newThread = {
        id: 'thread-' + Date.now(),
        title: 'New PRO Session',
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
        <div class="hero-3d-card" style="background:var(--bg-card); padding:20px; border-radius:18px; border:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
            <div>
                <h2 style="font-size:18px; font-weight:800;">SolaceTech SOLACE AI+ [PRO]</h2>
                <p style="font-size:13px; color:var(--text-muted);">Active Thread: ${escapeHtml(thread.title)}</p>
            </div>
            <div id="threeCanvasContainer" style="width:100px; height:100px;"></div>
        </div>
    `;

    if (thread.messages.length === 0) {
        html += `
            <div class="message-block">
                <div class="ai-response-block">
                    <div class="ai-label">SOLACE AI+ [PRO] ✦</div>
                    <div class="response-text">
                        Persistent memory & multi-threading active. Ask anything or select a preset below!
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
                            <div class="user-avatar-sm" id="msgAvatar">SC</div>
                            <span>${escapeHtml(m.content)}</span>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="message-block">
                        <div class="ai-response-block">
                            <div class="ai-label">SOLACE AI+ [PRO] ✦</div>
                            <div>${formatResponseText(m.content)}</div>
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

function applyPreset(text) {
    const input = document.getElementById('userChatInput');
    if (input) input.value = text;
    sendUserMessage();
}

function handleGoogleOAuthLogin() {
    localStorage.setItem('solace_is_logged_in', 'true');
    localStorage.setItem('solace_user_name', 'Samrat Chaudhary');
    localStorage.setItem('solace_user_email', 'samrat@gmail.com');
    localStorage.setItem('solace_avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop');
    
    const overlay = document.getElementById('authScreenOverlay');
    if (overlay) overlay.style.display = 'none';
    loadUserProfile();
    loadThreadsFromStorage();
}

function handleEmailAuthSubmit() {
    const emailField = document.getElementById('inputAuthEmail');
    const email = emailField ? emailField.value.trim() : '';
    if (!email) { alert('Please enter email.'); return; }
    let name = email.split('@')[0];
    name = name.charAt(0).toUpperCase() + name.slice(1);

    localStorage.setItem('solace_is_logged_in', 'true');
    localStorage.setItem('solace_user_email', email);
    localStorage.setItem('solace_user_name', name);
    
    const overlay = document.getElementById('authScreenOverlay');
    if (overlay) overlay.style.display = 'none';
    loadUserProfile();
    loadThreadsFromStorage();
}

function handleLogout() {
    localStorage.removeItem('solace_is_logged_in');
    location.reload();
}

function loadUserProfile() {
    const name = localStorage.getItem('solace_user_name') || 'Samrat Chaudhary';
    const avatarUrl = localStorage.getItem('solace_avatar_url') || '';
    const nameDisplay = document.getElementById('userNameDisplay');
    const profileName = document.getElementById('profileNameInput');
    const profileAvatar = document.getElementById('profileAvatarInput');

    if (nameDisplay) nameDisplay.innerText = name;
    if (profileName) profileName.value = name;
    if (profileAvatar) profileAvatar.value = avatarUrl;
    tempAvatarData = avatarUrl;
}

function handleProfileAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        tempAvatarData = e.target.result;
        const avatarInput = document.getElementById('profileAvatarInput');
        if (avatarInput) avatarInput.value = tempAvatarData;
    };
    reader.readAsDataURL(file);
}

function saveProfileChanges() {
    const name = document.getElementById('profileNameInput')?.value.trim() || 'User';
    const avatarUrl = document.getElementById('profileAvatarInput')?.value.trim() || tempAvatarData;
    localStorage.setItem('solace_user_name', name);
    localStorage.setItem('solace_avatar_url', avatarUrl);
    loadUserProfile();
    closeModal('authModal');
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
    if (!contentEl) return;
    const code = contentEl.innerText;
    try {
        const logs = [];
        const customConsole = { log: (...args) => logs.push(args.join(" ")) };
        const runFn = new Function('console', code);
        runFn(customConsole);
        alert("PRO Sandbox Output:\n\n" + (logs.join("\n") || "Executed successfully with no console output."));
    } catch (err) {
        alert("Runtime Execution Error: " + err.message);
    }
}

function toggleAgenticMode() {
    agenticModeEnabled = !agenticModeEnabled;
    const btn = document.getElementById('agentToggleBtn');
    if (btn) {
        btn.innerText = agenticModeEnabled ? "🤖 Agent Mode: ON" : "🤖 Agent Mode: OFF";
        btn.classList.toggle('active', agenticModeEnabled);
    }
}

function openMCPModal() { const m = document.getElementById('mcpModal'); if(m) m.style.display = 'flex'; }
function openAuthModal() { const m = document.getElementById('authModal'); if(m) m.style.display = 'flex'; }
function openSettingsModal() { const m = document.getElementById('settingsModal'); if(m) m.style.display = 'flex'; }
function closeModal(id) { const m = document.getElementById(id); if(m) m.style.display = 'none'; }

function saveSettings() {
    const modelSelect = document.getElementById('modelSelect');
    const memInput = document.getElementById('persistentMemoryInput');
    if (modelSelect) localStorage.setItem('solace_model', modelSelect.value);
    if (memInput) localStorage.setItem('solace_persistent_memory', memInput.value);
    updateModelBadge();
    closeModal('settingsModal');
}

function updateModelBadge() {
    const model = localStorage.getItem('solace_model') || '@cf/meta/llama-3.2-3b-instruct';
    let label = "⚡ Llama 3.2 3B [PRO]";
    if (model.includes("llama-3.1-8b")) label = "⚡ Llama 3.1 8B [PRO]";
    if (model.includes("mistral")) label = "⚡ Mistral 7B [PRO]";
    const badge = document.getElementById('topbarModelBadge');
    if (badge) badge.innerText = label;
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
        alert(`File "${file.name}" uploaded to PRO context!`);
    };
    reader.readAsDataURL(file);
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
    const text = input.value.trim();
    if (!text && !attachedFileContent) return;

    const thread = threads.find(t => t.id === activeThreadId);
    if (!thread) return;

    if (thread.messages.length === 0) {
        thread.title = text.length > 30 ? text.substring(0, 30) + '...' : text;
    }

    thread.messages.push({ role: 'user', content: text });
    input.value = '';
    const payloadFile = attachedFileContent;
    attachedFileContent = null;
    saveThreadsToStorage();
    renderActiveThreadMessages();

    try {
        const model = localStorage.getItem('solace_model') || "@cf/meta/llama-3.2-3b-instruct";
        const persistentMemory = localStorage.getItem('solace_persistent_memory'] || "";
        let systemPrompt = "You are SOLACE AI+ [PRO], an elite enterprise assistant.";
        if (persistentMemory) systemPrompt += " Persistent Enterprise Memory Context: " + persistentMemory;
        if (agenticModeEnabled) systemPrompt += " [PRO Agent Mode Enabled]";

        const apiMessages = [
            { role: "system", content: systemPrompt },
            ...thread.messages.map(m => ({ role: m.role, content: m.content }))
        ];

        let featureParam = "";
        const lowerText = text.toLowerCase();
        if (lowerText.includes("rag")) featureParam = "rag";
        else if (lowerText.includes("scrape")) featureParam = "scraper";
        else if (lowerText.includes("seo")) featureParam = "seo";
        else if (lowerText.includes("hr")) featureParam = "hr";

        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: apiMessages, model: model, image: payloadFile, feature: featureParam })
        });

        const data = await res.json();
        const reply = data.response || data.result?.response || JSON.stringify(data);

        thread.messages.push({ role: 'assistant', content: reply });
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
            return `<pre><code>${escapeHtml(code.trim())}</code></pre><button class="tool-btn" onclick="openCanvasPanel(\`${escapeHtml(code.trim())}\`)">🎨 Open in PRO Canvas</button>`;
        });
    }
    return escapeHtml(text).replace(/\n/g, '<br>');
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}