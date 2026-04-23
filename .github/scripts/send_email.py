import os, smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timezone

today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
digest = os.environ["DIGEST"]
brevo_user = os.environ["BREVO_USER"]
brevo_key = os.environ["BREVO_KEY"]

msg = MIMEMultipart("alternative")
msg["Subject"] = "AI/LLM Daily Digest - " + today
msg["From"] = brevo_user
msg["To"] = "susanho91@hotmail.com"
msg.attach(MIMEText(digest, "html"))

with smtplib.SMTP("smtp-relay.brevo.com", 587) as server:
    server.starttls()
    server.login(brevo_user, brevo_key)
    server.sendmail(brevo_user, "susanho91@hotmail.com", msg.as_string())
    print("Email sent successfully via Brevo SMTP")
