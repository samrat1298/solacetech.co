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

    if (request.method === "POST") {
      try {
        if (!env.AI) {
          return new Response(JSON.stringify({ 
            response: "⚠️ Configuration Error: The Cloudflare 'AI' binding is missing." 
          }), {
            status: 200,
            headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" }
          });
        }

        const body = await request.json();
        const messages = body.messages || [{ role: "user", content: "Hello" }];
        const requestedModel = body.model || "@cf/meta/llama-3.2-3b-instruct";

        // If an image or file is included in the payload for vision-capable models
        let aiPayload = { messages: messages };
        if (body.image && requestedModel.includes("vision")) {
          // Pass image data to Cloudflare Workers AI vision models if supported
          aiPayload.image = body.image; 
        }

        const aiResponse = await env.AI.run(requestedModel, aiPayload);

        return new Response(JSON.stringify(aiResponse), {
          headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ 
          response: "⚠️ Worker AI Error: " + err.message 
        }), {
          status: 200,
          headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("SolaceTech SOLACE AI+ Backend Active", { status: 200 });
  }
};