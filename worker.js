/**
 * SOLACE AGI Core - Main Backend Orchestrator
 */

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    if (request.method !== "POST") return new Response("SOLACE Gateway Active", { status: 200, headers: corsHeaders });

    try {
      const body = await request.json();
      const prompt = body.prompt || "";
      const messages = body.messages || [{ role: "user", content: prompt }];

      const apiKey = env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return Response.json({
          response: "Error: OPENROUTER_API_KEY is missing from your .dev.vars file.",
        }, { headers: corsHeaders });
      }

      const startTime = Date.now();

      // Call OpenRouter Free Auto-Router ($0.00 cost)
      const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:8787",
          "X-Title": "SOLACE AGI Platform",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: messages
        })
      });

      const data = await openRouterRes.json();
      const latency = `${Date.now() - startTime}ms`;

      if (data.error) {
        return Response.json({
          response: `OpenRouter Error: ${data.error.message}`,
        }, { headers: corsHeaders });
      }

      const replyContent = data.choices?.[0]?.message?.content || "No response generated.";

      return Response.json({
        response: replyContent,
        telemetry: {
          latency: latency,
          tokens: "6,400,000,000",
          model: "openrouter/free ($0.00)"
        }
      }, { headers: corsHeaders });

    } catch (err) {
      return Response.json({
        response: "Server Exception: " + err.message
      }, { status: 500, headers: corsHeaders });
    }
  }
};