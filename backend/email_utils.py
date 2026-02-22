import base64
from typing import Optional, List, Tuple, Dict, Any
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import (
    Mail, Attachment, FileContent, FileName, FileType, Disposition, Email, To
)

from config import Config


def send_email(
    to_email: str,
    subject: str,
    body_text: str,
    from_name: Optional[str] = None,
    attachments: Optional[List[Tuple[str, bytes]]] = None,
) -> bool:
    """
    Send an email with optional attachments using SendGrid API.
    Optimized for production with error handling.
    """

    # --- Validate config ---
    if not all([Config.SENDGRID_API_KEY, Config.SENDGRID_FROM_EMAIL]):
        print("Email not sent: SendGrid configuration is missing")
        return False

    from_name = from_name or Config.SENDGRID_FROM_NAME
    from_email = Config.SENDGRID_FROM_EMAIL

    try:
        # Create Mail object
        mail = Mail(
            from_email=Email(from_email, from_name),
            to_emails=To(to_email),
            subject=subject,
            plain_text_content=body_text
        )

        # Add attachments
        if attachments:
            for filename, file_bytes in attachments:
                encoded_file = base64.b64encode(file_bytes).decode()
                attachment = Attachment(
                    FileContent(encoded_file),
                    FileName(filename),
                    FileType('application/pdf'),
                    Disposition('attachment')
                )
                mail.add_attachment(attachment)

        # Send email via SendGrid
        sg = SendGridAPIClient(Config.SENDGRID_API_KEY)
        response = sg.send(mail)

        # Check response status
        if response.status_code in [200, 201, 202]:
            return True
        else:
            print(f"SendGrid error sending to {to_email}: Status {response.status_code}")
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
    Send emails in batches (up to 100 per batch) to improve throughput.
    
    Args:
        recipients: List of dicts with 'email', 'name', and optional 'data' for template
        subject: Email subject
        body_text_template: Email body template (use {name} for personalization)
        from_name: Sender name
        attachment_generator: Function that takes recipient dict and returns (filename, bytes) or None
        batch_size: Number of emails per SendGrid batch (default 100)
    
    Returns:
        Dict with 'success', 'failed', and 'errors' keys
    """

    # --- Validate config ---
    if not all([Config.SENDGRID_API_KEY, Config.SENDGRID_FROM_EMAIL]):
        print("Batch emails not sent: SendGrid configuration is missing")
        return {'success': 0, 'failed': len(recipients), 'errors': ['SendGrid config missing']}

    from_name = from_name or Config.SENDGRID_FROM_NAME
    from_email = Config.SENDGRID_FROM_EMAIL

    success_count = 0
    failed_count = 0
    errors = []

    try:
        sg = SendGridAPIClient(Config.SENDGRID_API_KEY)

        # Process in batches
        for i in range(0, len(recipients), batch_size):
            batch = recipients[i : i + batch_size]

            for recipient in batch:
                try:
                    to_email = recipient.get('email')
                    to_name = recipient.get('name', '')

                    if not to_email:
                        failed_count += 1
                        errors.append(f"Missing email for recipient {to_name}")
                        continue

                    # Personalize body text
                    body = body_text_template.format(name=to_name, **recipient.get('data', {}))

                    # Create Mail object
                    mail = Mail(
                        from_email=Email(from_email, from_name),
                        to_emails=To(to_email),
                        subject=subject,
                        plain_text_content=body
                    )

                    # Add attachment if generator provided
                    if attachment_generator:
                        attachment_data = attachment_generator(recipient)
                        if attachment_data:
                            filename, file_bytes = attachment_data
                            encoded_file = base64.b64encode(file_bytes).decode()
                            attachment = Attachment(
                                FileContent(encoded_file),
                                FileName(filename),
                                FileType('application/pdf'),
                                Disposition('attachment')
                            )
                            mail.add_attachment(attachment)

                    # Send email
                    response = sg.send(mail)

                    if response.status_code in [200, 201, 202]:
                        success_count += 1
                    else:
                        failed_count += 1
                        errors.append(
                            f"Email to {to_email} failed with status {response.status_code}"
                        )

                except Exception as e:
                    failed_count += 1
                    errors.append(f"Error sending to {recipient.get('email', 'unknown')}: {str(e)}")

        return {
            'success': success_count,
            'failed': failed_count,
            'errors': errors
        }

    except Exception as e:
        print(f"Batch email error: {str(e)}")
        return {
            'success': 0,
            'failed': len(recipients),
            'errors': [str(e)]
        }
