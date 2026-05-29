"""
email_responder.py
──────────────────
Uses Claude API to draft a reply grounded in your support documentation.

Requirements:
    pip install anthropic python-dotenv

Setup:
    Add ANTHROPIC_API_KEY=your_key_here to your .env file in the project root.
"""

import os
from dotenv import load_dotenv

load_dotenv()


def generate_reply(support_docs: str, email_body: str, email_subject: str = '') -> str:
    """
    Call Claude API to draft a reply based on support documentation.

    Args:
        support_docs:   The full text of your support documentation.
        email_body:     The incoming email text.
        email_subject:  The email subject line (optional, adds context).

    Returns:
        A plain-text draft reply string.
    """
    import anthropic

    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY not found. Add it to your .env file.")

    client = anthropic.Anthropic(api_key=api_key)

    system_prompt = """You are a professional customer support agent.
Your job is to reply to customer emails using ONLY the information in the support documentation provided.

Rules:
- Base your reply strictly on what's in the support docs. Do not invent information.
- If the docs don't cover the topic, say you'll look into it and follow up.
- Keep replies clear, concise, and helpful.
- Use a warm but professional tone.
- Do not include a subject line — only write the email body.
- End with: Best regards, Support Team"""

    user_message = f"""SUPPORT DOCUMENTATION:
{support_docs}

---

INCOMING EMAIL:
Subject: {email_subject}

{email_body}

---

Draft a reply to this email based only on the support documentation above."""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=system_prompt,
        messages=[
            {"role": "user", "content": user_message}
        ]
    )

    return message.content[0].text.strip()


if __name__ == '__main__':
    # ── Quick test ──
    test_docs = """
    Return Policy: Customers can return items within 30 days of purchase for a full refund.
    Items must be unworn and in original packaging. To initiate a return, email support with your order number.

    Shipping: Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days.
    We ship internationally to 50+ countries. International orders may take 7-14 business days.

    Order Tracking: Once your order ships, you will receive a tracking number via email within 24 hours.
    """

    test_email = """
    Hi, I ordered a jacket 5 days ago and I haven't received a tracking number yet.
    Can you tell me when it will arrive?
    """

    print("Generating reply...\n")
    reply = generate_reply(test_docs, test_email, "Where is my order?")
    print("─" * 50)
    print(reply)
    print("─" * 50)
