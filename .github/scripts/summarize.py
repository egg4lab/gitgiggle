import os, json, urllib.request, urllib.parse

news_key      = os.environ["NEWS_KEY"]
anthropic_key = os.environ["ANTHROPIC_KEY"]

# Fetch 7 articles across diverse AI topics using OR query
query = (
    "ChatGPT OR \"large language model\" OR \"AI agent\" OR \"generative AI\" "
    "OR \"machine learning\" OR \"Claude AI\" OR \"Gemini AI\" OR \"OpenAI\" "
    "OR \"AI regulation\" OR \"AI chip\""
)
url = (
    "https://newsapi.org/v2/everything"
    f"?q={urllib.parse.quote(query)}"
    "&sortBy=publishedAt&pageSize=20&language=en"
    f"&apiKey={news_key}"
)
with urllib.request.urlopen(url) as r:
    data = json.loads(r.read())

# De-duplicate by topic: pick articles with distinct titles
seen, articles = set(), []
for a in data.get("articles", []):
    title = (a.get("title") or "").lower()
    first3 = " ".join(title.split()[:3])
    if first3 not in seen and a.get("description"):
        seen.add(first3)
        articles.append(a)
    if len(articles) == 7:
        break

lines = []
for i, a in enumerate(articles, 1):
    title = a.get("title") or "No title"
    desc  = a.get("description") or "No description"
    url_a = a.get("url") or ""
    src   = (a.get("source") or {}).get("name", "")
    lines.append(f"{i}. [{src}] {title}\n   {desc}\n   URL: {url_a}")
articles_text = "\n\n".join(lines)

prompt = (
    "You are Beeper, a friendly AI digest robot. "
    "Summarize these 7 AI/tech news articles into a polished HTML email digest. "
    "Format: <h2>🤖 Beeper's AI Digest</h2> then <ol> with 7 <li> items. "
    "Each <li>: bold the article title as a hyperlink, then 2 sentences of insight — "
    "what it means and why it matters. Keep it punchy and smart. No fluff.\n\n"
    "Articles:\n" + articles_text
)

payload = json.dumps({
    "model": "claude-haiku-4-5-20251001",
    "max_tokens": 1800,
    "messages": [{"role": "user", "content": prompt}]
}).encode()

req = urllib.request.Request(
    "https://api.anthropic.com/v1/messages",
    data=payload,
    headers={
        "x-api-key": anthropic_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    },
    method="POST"
)
with urllib.request.urlopen(req) as r:
    result = json.loads(r.read())

digest = result["content"][0]["text"]

with open(os.environ["GITHUB_OUTPUT"], "a") as f:
    f.write("digest<<DIGESTEOF\n")
    f.write(digest + "\n")
    f.write("DIGESTEOF\n")

print(f"Digest generated — {len(articles)} articles, {result['usage']['output_tokens']} tokens")
