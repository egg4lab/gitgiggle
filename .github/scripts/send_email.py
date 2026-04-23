import os, json, urllib.request
from datetime import datetime, timezone

today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
digest = os.environ["DIGEST"]
resend_key = os.environ["RESEND_KEY"]

payload = json.dumps({
    "from": "AI Digest <onboarding@resend.dev>",
    "to": ["susanho91@hotmail.com"],
    "subject": "AI/LLM Daily Digest - " + today,
    "html": digest
}).encode()

req = urllib.request.Request(
    "https://api.resend.com/emails",
    data=payload,
    headers={
        "Authorization": "Bearer " + resend_key,
        "Content-Type": "application/json"
    },
    method="POST"
)
try:
    with urllib.request.urlopen(req) as r:
        print(f"Email sent: {r.status} {r.read().decode()}")
except urllib.error.HTTPError as e:
    print(f"Resend error {e.code}: {e.read().decode()}")
    raise
