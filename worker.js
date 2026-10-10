export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    try {
      const { messages } = await request.json();
      
      // Runs Llama 3.2 3B natively on Cloudflare Workers AI
      const aiResponse = await env.AI.run("@cf/meta/llama-3.2-3b-instruct", { messages });
      
      return new Response(JSON.stringify(aiResponse), {
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
  }
};
