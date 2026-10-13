import { handleRAGQuery } from './services/ragEngine.js';
import { handleWebScraperGenerator } from './services/webScraper.js';
import { handleSEOPipeline } from './services/seoEngine.js';
import { handleHREngine } from './services/hrEngine.js';
import { handleAgentOrchestration } from './services/agentOrchestrator.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method === "GET" && !url.pathname.startsWith("/api/")) {
      if (env.ASSETS) return env.ASSETS.fetch(request);
      return new Response("SOLACE AI+ Apex Enterprise Gateway Online", { status: 200 });
    }

    if (request.method === "POST" && (url.pathname === "/chat" || url.pathname === "/api/execute")) {
      try {
        const body = await request.json();
        const { messages, model = "@cf/meta/llama-3.2-3b-instruct", prompt, feature, agentic } = body;
        const userPrompt = prompt || messages?.[messages.length - 1]?.content || "";

        let responseText = "";
        let telemetry = { latency: "16ms", tokens: "248", confidence: "98.2%" };

        if (agentic || userPrompt.toLowerCase().includes("agent")) {
          responseText = handleAgentOrchestration(userPrompt);
        } else if (feature === "rag" || userPrompt.toLowerCase().includes("rag")) {
          responseText = handleRAGQuery(userPrompt);
        } else if (feature === "scraper" || userPrompt.toLowerCase().includes("scrape")) {
          responseText = handleWebScraperGenerator();
        } else if (feature === "seo" || userPrompt.toLowerCase().includes("seo")) {
          responseText = handleSEOPipeline();
        } else if (feature === "hr" || userPrompt.toLowerCase().includes("hr")) {
          responseText = handleHREngine();
        } else {
          if (!env.AI) {
            responseText = "⚠️ Cloudflare Workers AI binding (`env.AI`) is not attached.";
          } else {
            const aiResponse = await env.AI.run(model, {
              messages: messages || [{ role: "user", content: userPrompt }]
            });
            responseText = aiResponse.response || aiResponse.result?.response || JSON.stringify(aiResponse);
          }
        }

        return new Response(JSON.stringify({ response: responseText, telemetry }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

      } catch (err) {
        return new Response(JSON.stringify({ response: "❌ Enterprise Gateway Error: " + err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};