import smtplib
import socket
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
    Safe for production (timeouts + TLS + error handling).
    """

    # --- Validate config ---
    if not all([
        Config.MAIL_SERVER,
        Config.MAIL_PORT,
        Config.MAIL_USERNAME,
        Config.MAIL_PASSWORD,
    ]):
        print("Email not sent: SMTP configuration is missing")
        return False

    from_name = from_name or "PCU Admissions Office"
    from_email = Config.MAIL_USERNAME

    # --- Build email ---
    msg = MIMEMultipart()
    msg["From"] = f"{from_name} <{from_email}>"
    msg["To"] = to_email
    msg["Subject"] = subject

    msg.attach(MIMEText(body_text, "plain"))

    # --- Attachments ---
    if attachments:
        for filename, file_bytes in attachments:
            attachment = MIMEApplication(file_bytes, _subtype="pdf")
            attachment.add_header(
                "Content-Disposition",
                "attachment",
                filename=filename
            )
            msg.attach(attachment)

    try:
        # ⭐ CRITICAL: timeout prevents Gunicorn worker hang
        server = smtplib.SMTP(
            Config.MAIL_SERVER,
            Config.MAIL_PORT,
            timeout=10
        )

        # Required handshake
        server.ehlo()

        # TLS (required for Gmail on 587)
        if str(Config.MAIL_USE_TLS).lower() in ("true", "1", "yes"):
            server.starttls()
            server.ehlo()

        # Login
        server.login(
            Config.MAIL_USERNAME,
            Config.MAIL_PASSWORD
        )

        # Send email
        server.sendmail(
            from_email,
            [to_email],
            msg.as_string()
        )

        server.quit()
        return True

    except (smtplib.SMTPException, socket.timeout) as e:
        print(f"SMTP error sending to {to_email}: {e}")
        return False

    except Exception as e:
        print(f"Unexpected email error for {to_email}: {e}")
        return False
