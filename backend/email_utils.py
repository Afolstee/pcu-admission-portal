import base64
import resend
from typing import Optional, List, Tuple, Dict, Any

from config import Config


def send_email(
    to_email: str,
    subject: str,
    body_text: str,
    from_name: Optional[str] = None,
    attachments: Optional[List[Tuple[str, bytes]]] = None,
) -> bool:
    """
    Send an email with optional attachments using Resend API.
    Optimized for production with error handling.
    """

    # --- Validate config ---
    if not all([Config.RESEND_API_KEY, Config.RESEND_FROM_EMAIL]):
        print("Email not sent: Resend configuration is missing")
        return False

    resend.api_key = Config.RESEND_API_KEY

    sender_name = from_name or Config.RESEND_FROM_NAME
    from_email  = f"{sender_name} <{Config.RESEND_FROM_EMAIL}>"

    try:
        params: dict = {
            "from":    from_email,
            "to":      [to_email],
            "subject": subject,
            "text":    body_text,
        }

        # Add attachments
        if attachments:
            params["attachments"] = [
                {
                    "filename": filename,
                    "content":  list(file_bytes),   # Resend expects a list of ints
                }
                for filename, file_bytes in attachments
            ]

        response = resend.Emails.send(params)

        # Resend returns a dict with an 'id' key on success
        if response and response.get("id"):
            return True
        else:
            print(f"Resend error sending to {to_email}: {response}")
            return False

    except Exception as e:
        print(f"Error sending email to {to_email}: {str(e)}")
        return False


def send_batch_emails(
    recipients: List[Dict[str, Any]],
    subject: str,
    body_text_template: str,
    from_name: Optional[str] = None,
    attachment_generator: Optional[callable] = None,
    batch_size: int = 100
) -> Dict[str, Any]:
    """
    Send emails in batches to improve throughput.

    Args:
        recipients: List of dicts with 'email', 'name', and optional 'data' for template
        subject: Email subject
        body_text_template: Email body template (use {name} for personalization)
        from_name: Sender name
        attachment_generator: Function that takes recipient dict and returns (filename, bytes) or None
        batch_size: Number of emails per batch (default 100)

    Returns:
        Dict with 'success', 'failed', and 'errors' keys
    """

    # --- Validate config ---
    if not all([Config.RESEND_API_KEY, Config.RESEND_FROM_EMAIL]):
        print("Batch emails not sent: Resend configuration is missing")
        return {'success': 0, 'failed': len(recipients), 'errors': ['Resend config missing']}

    resend.api_key = Config.RESEND_API_KEY

    sender_name = from_name or Config.RESEND_FROM_NAME
    from_email  = f"{sender_name} <{Config.RESEND_FROM_EMAIL}>"

    success_count = 0
    failed_count  = 0
    errors        = []

    try:
        # Process in batches
        for i in range(0, len(recipients), batch_size):
            batch = recipients[i : i + batch_size]

            for recipient in batch:
                try:
                    to_email = recipient.get('email')
                    to_name  = recipient.get('name', '')

                    if not to_email:
                        failed_count += 1
                        errors.append(f"Missing email for recipient {to_name}")
                        continue

                    # Personalize body text
                    body = body_text_template.format(name=to_name, **recipient.get('data', {}))

                    params: dict = {
                        "from":    from_email,
                        "to":      [to_email],
                        "subject": subject,
                        "text":    body,
                    }

                    # Add attachment if generator provided
                    if attachment_generator:
                        attachment_data = attachment_generator(recipient)
                        if attachment_data:
                            filename, file_bytes = attachment_data
                            params["attachments"] = [
                                {
                                    "filename": filename,
                                    "content":  list(file_bytes),
                                }
                            ]

                    response = resend.Emails.send(params)

                    if response and response.get("id"):
                        success_count += 1
                    else:
                        failed_count += 1
                        errors.append(f"Email to {to_email} failed: {response}")

                except Exception as e:
                    failed_count += 1
                    errors.append(f"Error sending to {recipient.get('email', 'unknown')}: {str(e)}")

        return {
            'success': success_count,
            'failed':  failed_count,
            'errors':  errors
        }

    except Exception as e:
        print(f"Batch email error: {str(e)}")
        return {
            'success': 0,
            'failed':  len(recipients),
            'errors':  [str(e)]
        }
