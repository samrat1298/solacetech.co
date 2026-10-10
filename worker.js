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

    // If it's a POST request, handle the AI chat generation
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

    // If it's a GET request, return a friendly message or instructions
    return new Response("SolaceTech SOLACE AI Worker is active and running Llama 3.2 3B!", {
      headers: { "content-type": "text/plain", "Access-Control-Allow-Origin": "*" }
    });
  }
};
