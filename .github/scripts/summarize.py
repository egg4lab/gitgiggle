import os, json, urllib.request

news_json = os.environ["NEWS_JSON"]
anthropic_key = os.environ["ANTHROPIC_KEY"]

data = json.loads(news_json)
articles = data.get("articles", [])[:7]

lines = []
for i, a in enumerate(articles, 1):
    title = a.get("title") or "No title"
    desc = a.get("description") or "No description"
    url = a.get("url") or ""
    lines.append(f"{i}. {title}\n   {desc}\n   URL: {url}")
articles_text = "\n\n".join(lines)

prompt = (
    "Summarize these 7 AI/LLM news articles into an HTML email digest. "
    "Use <h2> for the title 'AI/LLM Daily Digest', <ol> for the list, and for each <li> "
    "include the article title as a hyperlink and a 1-2 sentence summary.\n\n"
    "Articles:\n" + articles_text
)

payload = json.dumps({
    "model": "claude-haiku-4-5-20251001",
    "max_tokens": 1500,
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

print("Digest generated successfully")
