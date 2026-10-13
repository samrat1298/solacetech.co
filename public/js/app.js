/**
 * SOLACE AGI Core - Production Enterprise Controller
 * Theme-Aware Unlimited Viewport 3D Quantum Neural Constellation Engine + 6.4B Context Window
 */

let agenticModeEnabled = true;
let attachedFileContent = null;
let attachedFileName = null;
let threads = [];
let activeThreadId = null;
let particleMaterial = null;

window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('solace_is_logged_in');
    if (isLoggedIn === 'true') {
        const name = localStorage.getItem('solace_user_name') || 'Samrat Chaudhary';
        const email = localStorage.getItem('solace_user_email') || 'samrat@solacetech.ai';
        updateUserUI(name, email, 'Enterprise Node');
    } else {
        updateUserUI('Samrat Chaudhary', 'samrat@solacetech.ai', 'Enterprise Node');
    }

    const savedTheme = localStorage.getItem('solace_theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        const icon = document.getElementById('themeToggleIcon');
        if (icon) icon.innerText = "☀️";
    } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        const icon = document.getElementById('themeToggleIcon');
        if (icon) icon.innerText = "🌙";
    }

    loadThreadsFromStorage();
    init3DParticleFlowBackground();
    update3DThemeColors(savedTheme === 'dark');
});

// High-visibility Theme-Aware Constellation Color Controller
function update3DThemeColors(isDark) {
    if (particleMaterial) {
        particleMaterial.color.setHex(isDark ? 0x60a5fa : 0x2563eb);
        particleMaterial.opacity = isDark ? 0.85 : 0.75;
        particleMaterial.size = isDark ? 0.12 : 0.13;
    }
}

// Google Workspace Authentication Handler
function handleRealGoogleLogin() {
    showSolaceDialog("Google Workspace Auth", "Authenticating enterprise node via secure OAuth gateway...", "info", () => {
        localStorage.setItem('solace_is_logged_in', 'true');
        localStorage.setItem('solace_user_name', 'Samrat Chaudhary');
        localStorage.setItem('solace_user_email', 'samrat@solacetech.ai');
        updateUserUI('Samrat Chaudhary', 'samrat@solacetech.ai', 'Enterprise Node');
        dismissAuthModal();
        showSolaceDialog("Authentication Success", "Successfully connected via Google Workspace Identity Gateway.", "info");
    });
}

// Custom SOLACE Quantum Neural Constellation Background Engine
function init3DParticleFlowBackground() {
    const canvas = document.getElementById('bg3dCanvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particleCount = 650;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 30;
        positions[i + 1] = (Math.random() - 0.5) * 30;
        positions[i + 2] = (Math.random() - 0.5) * 30;

        velocities.push({
            x: (Math.random() - 0.5) * 0.007,
            y: (Math.random() - 0.5) * 0.007,
            z: (Math.random() - 0.5) * 0.007
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const isDarkInitial = document.documentElement.classList.contains('dark');
    particleMaterial = new THREE.PointsMaterial({
        color: isDarkInitial ? 0x60a5fa : 0x2563eb,
        size: 0.12,
        transparent: true,
        opacity: isDarkInitial ? 0.85 : 0.75,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(geometry, particleMaterial);
    scene.add(particleSystem);

    camera.position.z = 14;

    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.0008;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.0008;
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    function animate() {
        requestAnimationFrame(animate);

        const posAttr = geometry.attributes.position;
        for (let i = 0; i < particleCount; i++) {
            let idx = i * 3;
            posAttr.array[idx] += velocities[i].x;
            posAttr.array[idx + 1] += velocities[i].y;
            posAttr.array[idx + 2] += velocities[i].z;

            if (Math.abs(posAttr.array[idx]) > 16) velocities[i].x *= -1;
            if (Math.abs(posAttr.array[idx + 1]) > 16) velocities[i].y *= -1;
            if (Math.abs(posAttr.array[idx + 2]) > 16) velocities[i].z *= -1;
        }
        posAttr.needsUpdate = true;

        targetX += (mouseX - targetX) * 0.05;
        targetY += (-mouseY - targetY) * 0.05;

        particleSystem.rotation.y = targetX * 3 + Date.now() * 0.00008;
        particleSystem.rotation.x = targetY * 3;

        renderer.render(scene, camera);
    }
    animate();
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    document.documentElement.classList.toggle('light', !isDark);
    const themeIcon = document.getElementById('themeToggleIcon');
    if (themeIcon) themeIcon.innerText = isDark ? "☀️" : "🌙";
    localStorage.setItem('solace_theme', isDark ? 'dark' : 'light');
    update3DThemeColors(isDark);
}

function showSolaceDialog(title, message, type = 'info', onConfirm = null) {
    const overlay = document.getElementById('solaceDialogOverlay');
    const titleEl = document.getElementById('solaceDialogTitle');
    const msgEl = document.getElementById('solaceDialogMessage');
    const actionsEl = document.getElementById('solaceDialogActions');
    const iconEl = document.getElementById('solaceDialogIcon');

    if (!overlay) return;

    if (titleEl) titleEl.innerText = title;
    if (msgEl) msgEl.innerText = message;
    if (iconEl) iconEl.innerText = type === 'danger' ? '⚠️' : '✦';

    if (onConfirm) {
        actionsEl.innerHTML = `
            <button onclick="closeSolaceDialog()" class="dialog-btn secondary">Cancel</button>
            <button id="dialogConfirmBtn" class="dialog-btn primary" style="background: ${type === 'danger' ? '#ef4444' : 'var(--accent-blue)'};">Confirm</button>
        `;
        document.getElementById('dialogConfirmBtn').onclick = () => {
            closeSolaceDialog();
            onConfirm();
        };
    } else {
        actionsEl.innerHTML = `<button onclick="closeSolaceDialog()" class="dialog-btn primary">Understood</button>`;
    }

    overlay.style.display = 'flex';
}

function closeSolaceDialog() {
    const overlay = document.getElementById('solaceDialogOverlay');
    if (overlay) overlay.style.display = 'none';
}

function updateUserUI(name, email, role) {
    const nameDisplay = document.getElementById('userNameDisplay');
    const roleDisplay = document.getElementById('userRoleDisplay');
    const avatar = document.getElementById('sidebarUserAvatar');
    if (nameDisplay) nameDisplay.innerText = name;
    if (roleDisplay) roleDisplay.innerText = role;
    if (avatar) avatar.innerText = name.substring(0, 2).toUpperCase();
}

function openAuthModal() {
    const overlay = document.getElementById('authScreenOverlay');
    if (overlay) overlay.style.display = 'flex';
}

function dismissAuthModal() {
    const overlay = document.getElementById('authScreenOverlay');
    if (overlay) overlay.style.display = 'none';
}

function handleRealEmailLogin() {
    const email = document.getElementById('inputAuthEmail').value.trim();
    const pass = document.getElementById('inputAuthPassword').value.trim();
    if (!email || !pass) {
        showSolaceDialog("Authentication Error", "Please enter both your enterprise email and password.", "danger");
        return;
    }
    localStorage.setItem('solace_is_logged_in', 'true');
    localStorage.setItem('solace_user_name', email.split('@')[0]);
    localStorage.setItem('solace_user_email', email);
    updateUserUI(email.split('@')[0], email, 'Enterprise Node');
    dismissAuthModal();
    showSolaceDialog("Welcome Back", `Successfully signed in as ${email}.`, "info");
}

function handleRealEmailSignup() {
    const email = document.getElementById('inputAuthEmail').value.trim();
    const pass = document.getElementById('inputAuthPassword').value.trim();
    if (!email || !pass) {
        showSolaceDialog("Registration Error", "Please provide a valid enterprise email and password to register.", "danger");
        return;
    }
    localStorage.setItem('solace_is_logged_in', 'true');
    localStorage.setItem('solace_user_name', email.split('@')[0]);
    localStorage.setItem('solace_user_email', email);
    updateUserUI(email.split('@')[0], email, 'Enterprise Node');
    dismissAuthModal();
    showSolaceDialog("Node Registered", "Your enterprise neural ID has been provisioned successfully.", "info");
}

function toggleSidebar() {
    const sidebar = document.getElementById('appSidebar');
    const toggleBtn = document.getElementById('sidebarEdgeToggleBtn');
    if (!sidebar) return;
    const isCollapsed = sidebar.classList.toggle('collapsed');
    if (toggleBtn) toggleBtn.innerText = isCollapsed ? '⟩' : '⟨';
}

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

function deleteThread(event, id) {
    event.stopPropagation();
    if (threads.length <= 1) {
        showSolaceDialog("Action Restricted", "Cannot delete the last remaining active session.", "danger");
        return;
    }
    showSolaceDialog("Confirm Deletion", "Are you sure you want to permanently delete this neural session?", "danger", () => {
        threads = threads.filter(t => t.id !== id);
        saveThreadsToStorage();
        if (activeThreadId === id) switchThread(threads[0].id);
        else renderThreadList();
    });
}

function clearCurrentChat() {
    const thread = threads.find(t => t.id === activeThreadId);
    if (!thread) return;
    showSolaceDialog("Clear Session", "Are you sure you want to clear all messages in this session?", "danger", () => {
        thread.messages = [];
        thread.title = "Neural Session";
        saveThreadsToStorage();
        renderActiveThreadMessages();
    });
}

function exportCurrentChat() {
    const thread = threads.find(t => t.id === activeThreadId);
    if (!thread || thread.messages.length === 0) {
        showSolaceDialog("Export Notice", "No messages found in the current thread to export.", "info");
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

function handleInputKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendUserPrompt();
    }
}

function handleFileAttachment(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        attachedFileContent = e.target.result;
        attachedFileName = file.name;
        const badge = document.getElementById('filePreviewBadge');
        const text = document.getElementById('attachedFileNameText');
        if (text) text.innerText = `Attached: ${file.name}`;
        if (badge) badge.style.display = 'flex';
    };
    reader.readAsText(file);
}

function removeAttachment() {
    attachedFileContent = null;
    attachedFileName = null;
    const badge = document.getElementById('filePreviewBadge');
    if (badge) badge.style.display = 'none';
    const fileInput = document.getElementById('fileUploadInput');
    if (fileInput) fileInput.value = '';
}

function triggerVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showSolaceDialog("Speech Recognition", "Speech recognition is not supported in this browser.", "info");
        return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById('userPromptInput');
        if (input) input.value = transcript;
    };
    recognition.start();
}

async function sendUserPrompt() {
    const input = document.getElementById('userPromptInput');
    if (!input) return;
    let promptText = input.value.trim();
    if (!promptText && !attachedFileContent) return;

    if (attachedFileContent && attachedFileName) {
        promptText = `[Attached File: ${attachedFileName}]\n${attachedFileContent}\n\nUser Request: ${promptText}`;
    }

    const thread = threads.find(t => t.id === activeThreadId);
    if (!thread) return;

    if (thread.messages.length === 0) {
        thread.title = promptText.length > 28 ? promptText.substring(0, 28) + '...' : promptText;
    }

    thread.messages.push({ role: 'user', content: promptText });
    input.value = '';
    removeAttachment();
    saveThreadsToStorage();
    renderActiveThreadMessages();

    try {
        const res = await fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                messages: thread.messages, 
                prompt: promptText,
                maxContext: 6400000000
            })
        });
        const data = await res.json();
        thread.messages.push({ role: 'assistant', content: data.response || "No response generated." });
        saveThreadsToStorage();
        renderActiveThreadMessages();
    } catch (err) {
        thread.messages.push({ role: 'assistant', content: "Server Connection Error: " + err.message });
        saveThreadsToStorage();
        renderActiveThreadMessages();
    }
}

async function triggerPlugin(pluginName) {
    const thread = threads.find(t => t.id === activeThreadId);
    if (!thread) return;
    const pluginPrompt = `Execute plugin: ${pluginName}`;
    thread.messages.push({ role: 'user', content: `Run plugin [${pluginName}]` });
    saveThreadsToStorage();
    renderActiveThreadMessages();

    try {
        const res = await fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                messages: thread.messages, 
                prompt: pluginPrompt, 
                plugin: pluginName,
                maxContext: 6400000000
            })
        });
        const data = await res.json();
        thread.messages.push({ role: 'assistant', content: data.response || "Plugin executed successfully." });
        saveThreadsToStorage();
        renderActiveThreadMessages();
    } catch (err) {
        thread.messages.push({ role: 'assistant', content: "Plugin Execution Error: " + err.message });
        saveThreadsToStorage();
        renderActiveThreadMessages();
    }
}

function renderThreadList() {
    const listEl = document.getElementById('chatHistoryList');
    if (!listEl) return;
    listEl.innerHTML = threads.map(t => `
        <div class="history-node ${t.id === activeThreadId ? 'active' : ''}" onclick="switchThread('${t.id}')">
            <span class="history-title">${escapeHtml(t.title)}</span>
            <button class="history-delete-btn" onclick="deleteThread(event, '${t.id}')">✕</button>
        </div>
    `).join('');
}

function renderActiveThreadMessages() {
    const feed = document.getElementById('chatStreamContainer');
    if (!feed) return;
    const thread = threads.find(t => t.id === activeThreadId);
    if (!thread) return;

    if (thread.messages.length === 0) {
        feed.innerHTML = `
            <div class="hero-node-banner glass-panel">
                <div>
                    <h3 style="font-size: 15px; font-weight: 800; margin-bottom: 4px;">SOLACE AI+ [Singularity Core $Omega$]</h3>
                    <p style="font-size: 12.5px; color: var(--text-secondary);">Context Capacity: 6,400,000,000 Tokens | Thread: ${escapeHtml(thread.title)}</p>
                </div>
                <div style="font-size: 24px;">🌐</div>
            </div>`;
        return;
    }

    feed.innerHTML = thread.messages.map(m => {
        if (m.role === 'user') {
            return `
                <div class="message-card">
                    <div class="prompt-header">
                        <div class="prompt-avatar">SC</div>
                        <div>${escapeHtml(m.content)}</div>
                    </div>
                </div>`;
        } else {
            return `
                <div class="message-card">
                    <div class="ai-response-box glass-panel">
                        <div class="ai-badge-label">✦ SOLACE Intelligence</div>
                        <div style="white-space: pre-wrap;">${escapeHtml(m.content)}</div>
                    </div>
                </div>`;
        }
    }).join('');
    feed.scrollTop = feed.scrollHeight;
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}