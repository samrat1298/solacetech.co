let currentChatHistory = [];
let attachedFileContent = null;

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    renderUserAvatar();
    window.render3DOrb('threeCanvasContainer');
});

function loadSettings() {
    const name = localStorage.getItem('solace_user_name') || 'Samrat Chaudhary';
    document.getElementById('userNameDisplay').innerText = name;
    
    const theme = localStorage.getItem('solace_theme') || 'dark';
    document.documentElement.className = theme;
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    document.documentElement.classList.toggle('light', !isDark);
    localStorage.setItem('solace_theme', isDark ? 'dark' : 'light');
}

function renderUserAvatar() {
    const name = localStorage.getItem('solace_user_name') || 'Samrat Chaudhary';
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    document.getElementById('sidebarUserAvatar').innerText = initials;
}

function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendUserMessage();
    }
}

async function sendUserMessage() {
    const input = document.getElementById('userChatInput');
    const text = input.value.trim();
    if (!text && !attachedFileContent) return;

    const container = document.getElementById('chatMessagesWrapper');
    const name = localStorage.getItem('solace_user_name') || 'User';
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    container.innerHTML += `
        <div class="message-block">
            <div class="user-prompt-header">
                <div class="user-avatar-sm">${initials}</div>
                <span>${escapeHtml(text)}</span>
            </div>
        </div>
    `;

    input.value = '';
    container.scrollTop = container.scrollHeight;

    const loadingId = 'loading-' + Date.now();
    container.innerHTML += `
        <div class="message-block" id="${loadingId}">
            <div class="ai-response-block">
                <div class="ai-label">SOLACE AI+ ✦</div>
                <div style="color:var(--text-muted)">Generating...</div>
            </div>
        </div>
    `;
    container.scrollTop = container.scrollHeight;

    try {
        const activePlugins = window.pluginSystem.getActiveList();
        const model = localStorage.getItem('solace_model') || "@cf/meta/llama-3.2-3b-instruct";
        const systemPrompt = localStorage.getItem('solace_system_prompt') || "You are SOLACE AI+, a helpful expert software assistant.";

        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: `${systemPrompt} Active plugins: ${activePlugins.join(', ')}` },
                    { role: "user", content: text }
                ],
                model: model,
                image: attachedFileContent
            })
        });

        const data = await res.json();
        const reply = data.response || data.result?.response || JSON.stringify(data);

        document.getElementById(loadingId).remove();

        const responseId = 'res-' + Date.now();
        container.innerHTML += `
            <div class="message-block">
                <div class="ai-response-block">
                    <div class="ai-label">
                        SOLACE AI+ ✦ 
                        <button class="tool-btn" style="margin-left:auto;" onclick="window.voiceEngine.speak(document.getElementById('${responseId}').innerText)">🔊 Read Aloud</button>
                    </div>
                    <div id="${responseId}">${formatResponseText(reply)}</div>
                </div>
            </div>
        `;
    } catch (err) {
        document.getElementById(loadingId).remove();
        container.innerHTML += `<div class="message-block"><div class="ai-response-block" style="color:#ef4444;">Error: ${err.message}</div></div>`;
    }
    container.scrollTop = container.scrollHeight;
}

function triggerVoiceInput() {
    window.voiceEngine.startListening(
        (transcript) => { document.getElementById('userChatInput').value = transcript; },
        () => { console.log('Voice listening stopped.'); }
    );
}

function formatResponseText(text) {
    // Basic Markdown code-block formatter
    if (text.includes("```")) {
        return text.replace(/```(.*?)\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre><code>${escapeHtml(code.trim())}</code></pre><button class="tool-btn" onclick="runArtifactCode(this)">▶️ Run Artifact Code</button>`;
        });
    }
    return escapeHtml(text).replace(/\n/g, '<br>');
}

function runArtifactCode(btn) {
    const code = btn.previousElementSibling.innerText;
    const output = window.pluginSystem.executeCodeArtifact(code);
    alert("Execution Result:\n\n" + output);
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}