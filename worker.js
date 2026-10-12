export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (request.method === "POST" && url.pathname === "/chat") {
      try {
        if (!env.AI) {
          return new Response(JSON.stringify({ 
            response: "⚠️ Error: The 'AI' binding is missing in Cloudflare settings." 
          }), { status: 200, headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" } });
        }

        const body = await request.json();
        const messages = body.messages || [{ role: "user", content: "Hello" }];
        const model = body.model || "@cf/meta/llama-3.2-3b-instruct";

        const aiResponse = await env.AI.run(model, { messages });

        return new Response(JSON.stringify(aiResponse), {
          headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ response: "⚠️ Worker AI Error: " + err.message }), {
          status: 200,
          headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("SolaceTech SOLACE AI+ Engine Active.", { status: 200 });
  }
};