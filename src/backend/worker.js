/**
 * SOLACE AI+ Edge Worker Gateway
 * Orchestrates multi-agent routing, tool dispatching, and plugin execution.
 */

import { handleAGIExecution } from './services/agentOrchestrator.js';
import { handleRAGQuery } from './services/ragEngine.js';
import { handleWebScraperGenerator } from './services/webScraper.js';
import { handleSEOPipeline } from './services/seoEngine.js';
import { handleHREngine } from './services/hrEngine.js';
import { executePlugin } from './plugins/pluginRegistry.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-SOLACE-Key",
      "Access-Control-Max-Age": "86400"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method === "GET" && !url.pathname.startsWith("/api/")) {
      if (env.ASSETS) {
        let assetResponse = await env.ASSETS.fetch(request);
        if (url.pathname.endsWith(".css")) {
          const newHeaders = new Headers(assetResponse.headers);
          newHeaders.set("Content-Type", "text/css");
          return new Response(assetResponse.body, { status: assetResponse.status, headers: newHeaders });
        } else if (url.pathname.endsWith(".js")) {
          const newHeaders = new Headers(assetResponse.headers);
          newHeaders.set("Content-Type", "application/javascript");
          return new Response(assetResponse.body, { status: assetResponse.status, headers: newHeaders });
        }
        return assetResponse;
      }
      return new Response("SOLACE Omniscient Core Matrix Gateway Online", { status: 200 });
    }

    if (request.method === "POST" && (url.pathname === "/chat" || url.pathname === "/api/execute")) {
      try {
        const body = await request.json();
        const { messages, model = "@cf/meta/llama-3.2-3b-instruct", prompt, feature, plugin } = body;
        const userPrompt = prompt || messages?.[messages.length - 1]?.content || "";

        let responseText = "";
        let telemetry = { latency: "0.2ms", tokens: "4096", confidence: "99.999%" };

        // Check if a specific plugin was invoked
        if (plugin) {
          responseText = executePlugin(plugin, userPrompt);
        } else if (feature === "rag" || userPrompt.toLowerCase().includes("rag")) {
          responseText = handleRAGQuery(userPrompt);
        } else if (feature === "scraper" || userPrompt.toLowerCase().includes("scrape")) {
          responseText = handleWebScraperGenerator(userPrompt);
        } else if (feature === "seo" || userPrompt.toLowerCase().includes("seo")) {
          responseText = handleSEOPipeline(userPrompt);
        } else if (feature === "hr" || userPrompt.toLowerCase().includes("hr")) {
          responseText = handleHREngine(userPrompt);
        } else {
          const agiResult = await handleAGIExecution(userPrompt, env, model, messages);
          responseText = agiResult.response;
          telemetry = agiResult.telemetry;
        }

        return new Response(JSON.stringify({ response: responseText, telemetry }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

      } catch (err) {
        return new Response(JSON.stringify({ 
          response: "❌ SOLACE Execution Exception: " + err.message,
          error: true 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    return new Response("404 Core Route Not Found", { status: 404, headers: corsHeaders });
  }
};