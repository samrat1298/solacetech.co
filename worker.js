export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    // Handle AI Chat POST requests
    if (request.method === "POST") {
      try {
        const { messages } = await request.json();

        // Run Llama 3.2 3B via Cloudflare Workers AI binding
        const aiResponse = await env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
          messages: messages || [{ role: "user", content: "Hello" }]
        });

        return new Response(JSON.stringify(aiResponse), {
          headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }

    // Serve the full SolaceTech UI for GET requests
    const html = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SolaceTech — SOLACE AI Workspace (Llama 3.2 3B)</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-base: #0a0c0f;
            --bg-sidebar: #0f1318;
            --bg-card: #141921;
            --bg-card-hover: #1b222d;
            --bg-input: #121720;
            --border-color: rgba(255, 255, 255, 0.08);
            --text-main: #f3f4f6;
            --text-muted: #9ca3af;
            --text-dimmed: #6b7280;
            --accent: #10b981;
            --accent-hover: #059669;
            --accent-glow: rgba(16, 185, 129, 0.2);
            --sidebar-width: 260px;
            --right-panel-width: 290px;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: var(--bg-base); color: var(--text-main); height: 100vh; overflow: hidden; }
        .app-container { display: grid; grid-template-columns: var(--sidebar-width) 1fr var(--right-panel-width); height: 100vh; width: 100vw; }
        @media (max-width: 1024px) { .app-container { grid-template-columns: var(--sidebar-width) 1fr; } .right-panel { display: none; } }
        @media (max-width: 768px) { .app-container { grid-template-columns: 1fr; } .sidebar { display: none; } }
        .sidebar { background-color: var(--bg-sidebar); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; padding: 16px; gap: 16px; overflow-y: auto; }
        .sidebar-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--border-color); }
        .logo-area { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 16px; color: #ffffff; cursor: pointer; }
        .logo-icon { width: 28px; height: 28px; background: linear-gradient(135deg, #10b981 0%, #047857 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px var(--accent-glow); }
        .logo-icon svg { width: 16px; height: 16px; fill: #fff; }
        .user-card { display: flex; align-items: center; background: var(--bg-card); border: 1px solid var(--border-color); padding: 10px 12px; border-radius: 12px; gap: 10px; }
        .user-avatar { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; border: 1px solid var(--accent); }
        .user-name { font-size: 13px; font-weight: 600; color: var(--text-main); }
        .user-role { font-size: 11px; color: var(--text-muted); }
        .search-box { position: relative; }
        .search-input { width: 100%; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 12px 8px 34px; color: var(--text-main); font-size: 13px; outline: none; }
        .search-input:focus { border-color: var(--accent); }
        .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-dimmed); width: 14px; height: 14px; }
        .nav-section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-dimmed); margin-bottom: 8px; font-weight: 600; }
        .nav-list { display: flex; flex-direction: column; gap: 4px; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; font-size: 13px; color: var(--text-muted); text-decoration: none; cursor: pointer; transition: all 0.2s; }
        .nav-item:hover, .nav-item.active { background: var(--bg-card); color: var(--text-main); }
        .nav-item svg { width: 16px; height: 16px; fill: currentColor; }
        .main-chat-area { display: flex; flex-direction: column; background-color: var(--bg-base); position: relative; overflow: hidden; }
        .chat-topbar { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid var(--border-color); background: rgba(10, 12, 15, 0.8); backdrop-filter: blur(10px); z-index: 10; }
        .chat-title-wrapper h1 { font-size: 15px; font-weight: 600; color: var(--text-main); display: flex; align-items: center; gap: 8px; }
        .chat-title-wrapper p { font-size: 12px; color: var(--text-muted); }
        .chat-messages { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px; }
        .message-row { display: flex; flex-direction: column; gap: 6px; max-width: 800px; margin: 0 auto; width: 100%; }
        .message-row.user { align-items: flex-end; }
        .message-row.assistant { align-items: flex-start; }
        .message-bubble { background: var(--bg-card); border: 1px solid var(--border-color); padding: 14px 18px; border-radius: 12px; font-size: 13.5px; line-height: 1.5; color: var(--text-main); max-width: 100%; }
        .message-row.user .message-bubble { background: #1b222d; border-color: rgba(255, 255, 255, 0.12); }
        .chat-input-container { padding: 16px 24px 20px; background: linear-gradient(180deg, rgba(10, 12, 15, 0) 0%, var(--bg-base) 40%); }
        .chat-input-wrapper { max-width: 800px; margin: 0 auto; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; padding: 12px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5); }
        .chat-input-wrapper:focus-within { border-color: var(--accent); }
        .tags-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .tag-pill { background: rgba(16, 185, 129, 0.1); color: var(--accent); border: 1px solid rgba(16, 185, 129, 0.3); font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; display: flex; align-items: center; gap: 6px; }
        .tag-pill button { background: none; border: none; color: var(--accent); cursor: pointer; }
        .textarea-row { display: flex; align-items: flex-end; gap: 10px; }
        .chat-textarea { flex: 1; background: none; border: none; color: var(--text-main); font-family: inherit; font-size: 13.5px; resize: none; outline: none; max-height: 120px; min-height: 24px; }
        .send-btn { background: var(--accent); color: #000; border: none; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .send-btn:hover { background: var(--accent-hover); color: #fff; transform: scale(1.05); }
        .send-btn svg { width: 14px; height: 14px; fill: currentColor; }
        .disclaimer-text { text-align: center; font-size: 10.5px; color: var(--text-dimmed); margin-top: 8px; }
        .right-panel { background-color: var(--bg-sidebar); border-left: 1px solid var(--border-color); display: flex; flex-direction: column; padding: 16px; gap: 16px; overflow-y: auto; }
        .panel-header { font-size: 14px; font-weight: 700; color: var(--text-main); display: flex; align-items: center; justify-content: space-between; }
        .model-selector-box { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 10px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; }
        .model-info { display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 600; }
        .model-dot { width: 8px; height: 8px; background: var(--accent); border-radius: 50%; box-shadow: 0 0 8px var(--accent); }
        .module-desc { font-size: 12px; color: var(--text-muted); line-height: 1.4; background: var(--bg-card); padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); }
        .code-snippet { background: #000; border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--accent); overflow-x: auto; white-space: pre; margin-top: 6px; }
    </style>
</head>
<body>
    <div class="app-container">
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="logo-area" onclick="location.reload()">
                    <div class="logo-icon"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>
                    <span>SolaceTech</span>
                </div>
            </div>
            <div class="user-card">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="Avatar" class="user-avatar">
                <div>
                    <div class="user-name">Samrat Chaudhary</div>
                    <div class="user-role">Llama 3.2 3B Edge</div>
                </div>
            </div>
            <div class="search-box">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input type="text" class="search-input" placeholder="Search chats...">
            </div>
            <div class="nav-section-title">Navigation</div>
            <div class="nav-list">
                <a class="nav-item active" href="#"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>SOLACE AI Chat</a>
            </div>
        </aside>

        <main class="main-chat-area">
            <header class="chat-topbar">
                <div class="chat-title-wrapper">
                    <h1>SOLACE AI <span style="font-size:10px; background:rgba(16,185,129,0.2); color:var(--accent); padding:2px 6px; border-radius:4px;">Llama 3.2 3B</span></h1>
                    <p>Connected to Cloudflare Workers AI edge model</p>
                </div>
            </header>
            <div class="chat-messages" id="chatMessagesContainer">
                <div class="message-row assistant">
                    <div class="message-bubble">Hello <strong>Samrat</strong>. I am your <strong>Llama 3.2 3B</strong> model running live via Cloudflare Workers AI. Type your prompt below to start chatting!</div>
                </div>
            </div>
            <div class="chat-input-container">
                <div class="chat-input-wrapper">
                    <div class="tags-row"><div class="tag-pill">⚡ Llama 3.2 3B <button onclick="this.parentElement.remove()">×</button></div></div>
                    <div class="textarea-row">
                        <textarea class="chat-textarea" id="userChatInput" placeholder="Ask Llama 3.2 3B anything..." rows="1" onkeydown="handleKeyPress(event)"></textarea>
                        <button class="send-btn" onclick="sendUserMessage()"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>
                    </div>
                </div>
                <div class="disclaimer-text">Powered by Cloudflare Workers AI & Llama 3.2 3B.</div>
            </div>
        </main>

        <aside class="right-panel">
            <div class="panel-header"><span>AI Module</span><span style="font-size:11px; color:var(--accent);">Active</span></div>
            <div class="model-selector-box"><div class="model-info"><div class="model-dot"></div><span>Llama 3.2 3B</span></div></div>
            <div class="module-desc"><strong>Model:</strong> <code>@cf/meta/llama-3.2-3b-instruct</code><br>Running live on Cloudflare Edge.</div>
        </aside>
    </div>

    <script>
        function handleKeyPress(e) {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendUserMessage(); }
        }
        async function sendUserMessage() {
            const input = document.getElementById('userChatInput');
            const text = input.value.trim();
            if (!text) return;
            const container = document.getElementById('chatMessagesContainer');
            container.innerHTML += '<div class="message-row user"><div class="message-bubble">' + escapeHtml(text) + '</div></div>';
            input.value = '';
            container.scrollTop = container.scrollHeight;

            const loadingId = 'loading-' + Date.now();
            container.innerHTML += '<div class="message-row assistant" id="' + loadingId + '"><div class="message-bubble" style="color:var(--text-muted)">Generating with Llama 3.2 3B on Cloudflare Edge...</div></div>';
            container.scrollTop = container.scrollHeight;

            try {
                const res = await fetch(window.location.href, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: [{ role: "user", content: text }] })
                });
                const data = await res.json();
                const reply = data.response || data.result?.response || JSON.stringify(data);
                document.getElementById(loadingId).remove();
                container.innerHTML += '<div class="message-row assistant"><div class="message-bubble">' + escapeHtml(reply).replace(/\\n/g, '<br>') + '</div></div>';
            } catch(err) {
                document.getElementById(loadingId).remove();
                container.innerHTML += '<div class="message-row assistant"><div class="message-bubble" style="color:#ef4444">Error: ' + err.message + '</div></div>';
            }
            container.scrollTop = container.scrollHeight;
        }
        function escapeHtml(str) {
            return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
    </script>
</body>
</html>`;

    return new Response(html, {
      headers: { "content-type": "text/html;charset=UTF-8", "Access-Control-Allow-Origin": "*" }
    });
  }
};
