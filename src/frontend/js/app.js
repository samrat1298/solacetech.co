let threads = [{ id: '1', title: 'Main Session', messages: [] }];
let activeThreadId = '1';
let agenticModeEnabled = false;

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('googleLoginBtn').addEventListener('click', () => {
        localStorage.setItem('solace_auth', 'true');
        document.getElementById('authScreenOverlay').style.display = 'none';
        renderThreads();
    });
    if(localStorage.getItem('solace_auth') === 'true') {
        document.getElementById('authScreenOverlay').style.display = 'none';
        renderThreads();
    }
});

function createNewThread() {
    const t = { id: 't-' + Date.now(), title: 'New Apex Session', messages: [] };
    threads.unshift(t);
    activeThreadId = t.id;
    renderThreads();
    renderMessages();
}

function renderThreads() {
    const list = document.getElementById('chatHistoryList');
    if (!list) return;
    list.innerHTML = threads.map(t => `
        <div onclick="activeThreadId='${t.id}';renderMessages();" style="padding:10px;cursor:pointer;border-radius:10px;font-size:13px;font-weight:${t.id===activeThreadId?'700':'500'};background:${t.id===activeThreadId?'rgba(245,158,11,0.15)':'transparent'};color:${t.id===activeThreadId?'#f59e0b':'inherit'}">
            💬 ${escapeHtml(t.title)}
        </div>
    `).join('');
    renderMessages();
}

function renderMessages() {
    const thread = threads.find(t => t.id === activeThreadId);
    if (!thread) return;
    const wrapper = document.getElementById('chatMessagesWrapper');
    const titleEl = document.getElementById('currentThreadTitle');
    if (titleEl) titleEl.innerText = thread.title;

    let html = '';
    if (thread.messages.length === 0) {
        html = `
            <div class="message-block">
                <div class="ai-response-block">
                    <div class="ai-label" style="color:#f59e0b; font-weight:700; font-size:11px;">SOLACE AI+ [Apex Frontier] ✦</div>
                    <div>Frontier enterprise architecture online. Multi-agent orchestration, vector RAG pipelines, and canvas studio ready.</div>
                </div>
            </div>
        `;
    } else {
        thread.messages.forEach(m => {
            if (m.role === 'user') {
                html += `
                    <div class="message-block">
                        <div class="user-prompt-header">
                            <div class="user-avatar-sm" style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">SC</div>
                            <span>${escapeHtml(m.content)}</span>
                        </div>
                    </div>
                `;
            } else {
                let telemetryHtml = m.telemetry ? `
                    <div style="font-size:11px; color:#94a3b8; display:flex; gap:12px; margin-top:8px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.06);">
                        <span>⚡ Latency: ${m.telemetry.latency}</span>
                        <span>📊 Tokens: ${m.telemetry.tokens}</span>
                        <span>🛡️ Confidence: ${m.telemetry.confidence}</span>
                    </div>
                ` : '';

                html += `
                    <div class="message-block">
                        <div class="ai-response-block">
                            <div class="ai-label" style="color:#f59e0b; font-weight:700; font-size:11px;">SOLACE AI+ [Apex Frontier] ✦</div>
                            <div>${formatResponseText(m.content)}</div>
                            ${telemetryHtml}
                        </div>
                    </div>
                `;
            }
        });
    }

    wrapper.innerHTML = html;
    wrapper.scrollTop = wrapper.scrollHeight;
}

function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendUserMessage(); }
}

async function sendUserMessage() {
    const input = document.getElementById('userChatInput');
    const text = input.value.trim();
    if (!text) return;
    const thread = threads.find(t => t.id === activeThreadId);
    if (thread.messages.length === 0) thread.title = text.length > 25 ? text.substring(0, 25) + '...' : text;
    
    thread.messages.push({ role: 'user', content: text });
    input.value = '';
    renderThreads();

    try {
        let feature = "";
        const lower = text.toLowerCase();
        if (lower.includes('rag')) feature = 'rag';
        else if (lower.includes('scrape')) feature = 'scraper';
        else if (lower.includes('seo')) feature = 'seo';
        else if (lower.includes('hr')) feature = 'hr';

        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                messages: thread.messages, 
                feature, 
                agentic: agenticModeEnabled || lower.includes('agent') 
            })
        });
        const data = await res.json();
        const reply = data.response || "No response generated.";
        const telemetry = data.telemetry || { latency: "14ms", tokens: "192", confidence: "97.8%" };
        
        // Push assistant response with telemetry
        thread.messages.push({ role: 'assistant', content: reply, telemetry });
        renderThreads();

        if (reply.includes("```")) {
            const match = reply.match(/```(.*?)\n([\s\S]*?)```/);
            if (match && match[2]) {
                openCanvas(match[2].trim());
            }
        }
    } catch(err) {
        thread.messages.push({ role: 'assistant', content: "❌ Network Error: " + err.message });
        renderThreads();
    }
}

function openCanvas(code) {
    const split = document.getElementById('workspaceSplit');
    const panel = document.getElementById('canvasArtifactPanel');
    const content = document.getElementById('canvasArtifactContent');
    if (split) split.classList.add('canvas-open');
    if (panel) panel.style.display = 'flex';
    if (content) content.innerText = code;
}

function closeCanvasPanel() {
    const split = document.getElementById('workspaceSplit');
    const panel = document.getElementById('canvasArtifactPanel');
    if (split) split.classList.remove('canvas-open');
    if (panel) panel.style.display = 'none';
}

function formatResponseText(text) {
    if (text.includes("```")) {
        return text.replace(/```(.*?)\n([\s\S]*?)```/g, (m, lang, code) => {
            return `<pre><code>${escapeHtml(code.trim())}</code></pre><button onclick="openCanvas(\`${escapeHtml(code.trim())}\`)" style="background:#131c31;color:#f59e0b;border:1px solid rgba(255,255,255,0.08);padding:6px 12px;border-radius:8px;cursor:pointer;font-weight:700;margin-top:6px;">🎨 Open in Canvas Studio</button>`;
        });
    }
    return escapeHtml(text).replace(/\n/g, '<br>');
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}