import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from typing import Optional, List, Tuple

from config import Config


def send_email(
    to_email: str,
    subject: str,
    body_text: str,
    from_name: Optional[str] = None,
    attachments: Optional[List[Tuple[str, bytes]]] = None,
) -> bool:
    """
    Send an email with optional attachments using SMTP settings from Config.

    Args:
        to_email: Recipient email address
        subject: Email subject
        body_text: Plain text body
        from_name: Sender name (optional)
        attachments: List of tuples (filename, file_bytes) for attachments

    Returns True on success, False on failure.
    """
    if not Config.MAIL_SERVER or not Config.MAIL_USERNAME or not Config.MAIL_PASSWORD:
        print("Email not sent: SMTP configuration is missing")
        return False

    from_name = from_name or "PCU Admissions Office"
    from_email = Config.MAIL_USERNAME

    msg = MIMEMultipart()
    msg["From"] = f"{from_name} <{from_email}>"
    msg["To"] = to_email
    msg["Subject"] = subject

    # Add body
    msg.attach(MIMEText(body_text, "plain"))

    # Add attachments
    if attachments:
        for filename, file_bytes in attachments:
            attachment = MIMEApplication(file_bytes, _subtype="pdf")
            attachment.add_header('Content-Disposition', 'attachment', filename=filename)
            msg.attach(attachment)

    try:
        server = smtplib.SMTP(Config.MAIL_SERVER, Config.MAIL_PORT)
        if str(Config.MAIL_USE_TLS).lower() in ("true", "1", "yes"):
            server.starttls()
        server.login(Config.MAIL_USERNAME, Config.MAIL_PASSWORD)
        server.sendmail(from_email, [to_email], msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email to {to_email}: {e}")
        return False

