import os, json, urllib.request
from datetime import datetime, timezone

today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
digest = os.environ["DIGEST"]
brevo_key = os.environ["BREVO_KEY"]

payload = json.dumps({
    "sender": {"name": "AI Digest", "email": "susanho91@hotmail.com"},
    "to": [{"email": "susanho91@hotmail.com"}, {"email": "socletsd00@gmail.com"}, {"email": "cylin@victorextech.com"}],
    "subject": "AI/LLM Daily Digest - " + today,
    "htmlContent": digest
}).encode()

req = urllib.request.Request(
    "https://api.brevo.com/v3/smtp/email",
    data=payload,
    headers={
        "api-key": brevo_key,
        "Content-Type": "application/json",
        "Accept": "application/json"
    },
    method="POST"
)
try:
    with urllib.request.urlopen(req) as r:
        print(f"Email sent: {r.status} {r.read().decode()}")
except urllib.error.HTTPError as e:
    print(f"Brevo error {e.code}: {e.read().decode()}")
    raise
