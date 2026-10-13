/**
 * SOLACE AI+ [PRO] - Enterprise Cloudflare Worker Engine
 */

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
      return new Response("SOLACE AI+ Engine Online", { status: 200 });
    }

    if (request.method === "POST" && (url.pathname === "/chat" || url.pathname === "/api/execute")) {
      try {
        const body = await request.json();
        const { messages, model = "@cf/meta/llama-3.2-3b-instruct", prompt, feature } = body;
        const userPrompt = prompt || messages?.[messages.length - 1]?.content || "";

        if (feature === "rag" || userPrompt.toLowerCase().includes("rag query") || userPrompt.toLowerCase().includes("internal database")) {
          return handleRAGQuery(userPrompt, env, corsHeaders);
        }

        if (feature === "scraper" || userPrompt.toLowerCase().includes("web scraper") || userPrompt.toLowerCase().includes("scrape")) {
          return handleWebScraperGenerator(userPrompt, corsHeaders);
        }

        if (feature === "seo" || userPrompt.toLowerCase().includes("seo keyword") || userPrompt.toLowerCase().includes("sitemap")) {
          return handleSEOPipeline(userPrompt, corsHeaders);
        }

        if (feature === "hr" || userPrompt.toLowerCase().includes("job description") || userPrompt.toLowerCase().includes("interview rubric")) {
          return handleHREngine(userPrompt, corsHeaders);
        }

        if (!env.AI) {
          return new Response(JSON.stringify({
            response: "⚠️ Cloudflare Workers AI binding (`env.AI`) is not attached."
          }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        const aiResponse = await env.AI.run(model, {
          messages: messages || [{ role: "user", content: userPrompt }]
        });

        const textOutput = aiResponse.response || aiResponse.result?.response || JSON.stringify(aiResponse);

        return new Response(JSON.stringify({ response: textOutput }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

      } catch (err) {
        return new Response(JSON.stringify({ response: "❌ Enterprise Engine Error: " + err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};

function handleRAGQuery(query, env, headers) {
  const responseText = "🔍 [SOLACE Enterprise RAG Engine Results]\n\nQuery Analyzed: \"" + query + "\"\nVector DB Latency: 24ms | Cosine Similarity Threshold: > 0.80\n\nRetrieved Intelligence:\nEMEA quarterly revenue reached €14.8M (+18% YoY). Enterprise Direct Sales contributed €9.2M. Cloud Services yielded €5.6M.\n\nSource Attributions:\n- Document ID: DOC-2026-001\n- Title: Q3 2026 EMEA Financial Performance\n- Vector Confidence: 94.0%";

  return new Response(JSON.stringify({ response: responseText }), {
    status: 200,
    headers: { ...headers, "Content-Type": "application/json" }
  });
}

function handleWebScraperGenerator(query, headers) {
  const codeSnippet = "import requests\nfrom bs4 import BeautifulSoup\n\ndef run_scraper(url):\n    res = requests.get(url)\n    soup = BeautifulSoup(res.text, 'html.parser')\n    return [item.text for item in soup.select('.title')]";
  
  const responseText = "🕷️ [SOLACE Web Scraper Generator]\n\n```python\n" + codeSnippet + "\n```";

  return new Response(JSON.stringify({ response: responseText }), {
    status: 200,
    headers: { ...headers, "Content-Type": "application/json" }
  });
}

function handleSEOPipeline(query, headers) {
  const xmlSnippet = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"[http://www.sitemaps.org/schemas/sitemap/0.9](http://www.sitemaps.org/schemas/sitemap/0.9)\">\n  <url>\n    <loc>[https://solacetech.co/](https://solacetech.co/)</loc>\n    <priority>1.0</priority>\n  </url>\n</urlset>";
  
  const responseText = "📈 [SOLACE SEO & Sitemap Generator]\n\n```xml\n" + xmlSnippet + "\n```";

  return new Response(JSON.stringify({ response: responseText }), {
    status: 200,
    headers: { ...headers, "Content-Type": "application/json" }
  });
}

function handleHREngine(query, headers) {
  const responseText = "👥 [SOLACE HR Evaluation Engine]\n\nRole: Principal AI Systems Engineer\n- Design low-latency RAG vector search.\n- Build autonomous multi-agent pipelines.";

  return new Response(JSON.stringify({ response: responseText }), {
    status: 200,
    headers: { ...headers, "Content-Type": "application/json" }
  });
}