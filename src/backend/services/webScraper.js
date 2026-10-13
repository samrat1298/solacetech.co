export function handleWebScraperGenerator() {
  const codeSnippet = `import requests
from bs4 import BeautifulSoup
import json

def scrape_enterprise_target(url):
    headers = {"User-Agent": "SolaceTech-Scraper/3.0"}
    res = requests.get(url, headers=headers, timeout=15)
    res.raise_for_status()
    
    soup = BeautifulSoup(res.text, 'html.parser')
    results = []
    
    for item in soup.select('.data-card, article'):
        title = item.select_one('h2, h3, .title')
        price = item.select_one('.price')
        results.append({
            "title": title.get_text(strip=True) if title else "N/A",
            "price": price.get_text(strip=True) if price else "N/A"
        })
    return json.dumps(results, indent=2)`;

  return `🕷️ [SOLACE Web Scraper & JSON Structuring Engine]\n\n\`\`\`python\n${codeSnippet}\n\`\`\``;
}