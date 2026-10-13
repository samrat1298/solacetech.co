/**
 * SOLACE Core - Base Text & Code Worker
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

      return Response.json({
        response: `SOLACE Core received your request: "${prompt}".`,
        telemetry: {
          latency: "1ms",
          tokens: "6,400,000,000",
          status: "Standard Mode"
        }
      }, { headers: corsHeaders });

    } catch (err) {
      return Response.json({
        response: "Server Exception: " + err.message
      }, { status: 500, headers: corsHeaders });
    }
  }
};