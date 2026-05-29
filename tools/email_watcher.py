"""
email_watcher.py
────────────────
Watches a Gmail inbox for new unread emails and triggers the responder.

Requirements:
    pip install google-auth google-auth-oauthlib google-api-python-client

Setup:
    1. Go to https://console.cloud.google.com
    2. Enable Gmail API
    3. Create OAuth credentials → download as credentials.json → place in project root
    4. Run this script once to authenticate (browser will open)
    5. token.json is saved for future runs
"""

import os
import time
import base64
import json
from email.mime.text import MIMEText
from pathlib import Path

# ── Lazy imports (only loaded when running for real) ──
def get_gmail_service():
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build

    SCOPES = ['https://www.googleapis.com/auth/gmail.modify']
    creds = None

    if Path('token.json').exists():
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as f:
            f.write(creds.to_json())

    return build('gmail', 'v1', credentials=creds)


def get_unread_emails(service, label='INBOX', max_results=10):
    """Fetch unread emails from Gmail."""
    result = service.users().messages().list(
        userId='me',
        labelIds=[label],
        q='is:unread',
        maxResults=max_results
    ).execute()

    messages = result.get('messages', [])
    emails = []

    for msg in messages:
        full = service.users().messages().get(userId='me', id=msg['id'], format='full').execute()
        headers = {h['name']: h['value'] for h in full['payload']['headers']}

        body = ''
        if 'parts' in full['payload']:
            for part in full['payload']['parts']:
                if part['mimeType'] == 'text/plain':
                    data = part['body'].get('data', '')
                    body = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                    break
        elif full['payload']['body'].get('data'):
            body = base64.urlsafe_b64decode(
                full['payload']['body']['data']
            ).decode('utf-8', errors='ignore')

        emails.append({
            'id': msg['id'],
            'thread_id': full['threadId'],
            'from': headers.get('From', ''),
            'subject': headers.get('Subject', ''),
            'body': body.strip(),
        })

    return emails


def mark_as_read(service, msg_id):
    """Mark an email as read after replying."""
    service.users().messages().modify(
        userId='me',
        id=msg_id,
        body={'removeLabelIds': ['UNREAD']}
    ).execute()


def send_reply(service, thread_id, to, subject, body):
    """Send a reply in the same thread."""
    message = MIMEText(body)
    message['to'] = to
    message['subject'] = f"Re: {subject}" if not subject.startswith('Re:') else subject
    message['threadId'] = thread_id

    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    service.users().messages().send(
        userId='me',
        body={'raw': raw, 'threadId': thread_id}
    ).execute()


def watch_and_respond(support_docs: str, poll_interval: int = 30, label: str = 'INBOX'):
    """
    Main loop: poll inbox → parse emails → call responder → send replies.

    Args:
        support_docs: The full text of your support documentation.
        poll_interval: Seconds between inbox checks (default: 30).
        label: Gmail label to watch (default: 'INBOX').
    """
    from tools.email_responder import generate_reply

    print(f"[watcher] Starting. Polling '{label}' every {poll_interval}s...")
    service = get_gmail_service()

    while True:
        try:
            print("[watcher] Checking inbox...")
            emails = get_unread_emails(service, label=label)

            if not emails:
                print("[watcher] No new emails.")
            else:
                for email in emails:
                    print(f"[watcher] Processing: {email['subject']} from {email['from']}")

                    reply = generate_reply(
                        support_docs=support_docs,
                        email_body=email['body'],
                        email_subject=email['subject'],
                    )

                    send_reply(
                        service=service,
                        thread_id=email['thread_id'],
                        to=email['from'],
                        subject=email['subject'],
                        body=reply,
                    )
                    mark_as_read(service, email['id'])
                    print(f"[watcher] Replied to {email['from']} ✓")

        except Exception as e:
            print(f"[watcher] Error: {e}")

        time.sleep(poll_interval)


if __name__ == '__main__':
    # ── Load support docs ──
    docs_path = Path('support_docs.txt')
    if docs_path.exists():
        support_docs = docs_path.read_text()
    else:
        print("[watcher] No support_docs.txt found. Create one in the project root.")
        support_docs = "No support documentation provided."

    watch_and_respond(support_docs=support_docs, poll_interval=30)
