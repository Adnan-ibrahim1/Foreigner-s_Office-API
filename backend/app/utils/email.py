import asyncio
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import aiosmtplib
from pathlib import Path
from typing import List, Optional
from app.config import settings
import logging

logger = logging.getLogger(__name__)

async def send_email(
    to_email: str,
    subject: str,
    body: str,
    from_email: Optional[str] = None,
    from_name: Optional[str] = None,
    is_html: bool = False,
    attachments: Optional[List[str]] = None
) -> bool:
    """Send email using async SMTP"""
    try:
        # Email configuration
        from_email = from_email or settings.EMAIL_FROM
        from_name = from_name or "Leipzig Bürgerbüro"
        
        # Create message
        message = MIMEMultipart()
        message["From"] = f"{from_name} <{from_email}>"
        message["To"] = to_email
        message["Subject"] = subject
        
        # Add body
        body_type = "html" if is_html else "plain"
        message.attach(MIMEText(body, body_type, "utf-8"))
        
        # Add attachments if any
        if attachments:
            for file_path in attachments:
                if Path(file_path).exists():
                    with open(file_path, "rb") as attachment:
                        part = MIMEBase("application", "octet-stream")
                        part.set_payload(attachment.read())
                        encoders.encode_base64(part)
                        part.add_header(
                            "Content-Disposition",
                            f"attachment; filename= {Path(file_path).name}",
                        )
                        message.attach(part)
        
        # Send email
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            start_tls=True,
            username=settings.SMTP_USERNAME,
            password=settings.SMTP_PASSWORD,
        )
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

def send_email_sync(
    to_email: str,
    subject: str,
    body: str,
    from_email: Optional[str] = None,
    from_name: Optional[str] = None,
    is_html: bool = False,
    attachments: Optional[List[str]] = None
) -> bool:
    """Send email using synchronous SMTP"""
    try:
        # Email configuration
        from_email = from_email or settings.EMAIL_FROM
        from_name = from_name or "Leipzig Bürgerbüro"
        
        # Create message
        message = MIMEMultipart()
        message["From"] = f"{from_name} <{from_email}>"
        message["To"] = to_email
        message["Subject"] = subject
        
        # Add body
        body_type = "html" if is_html else "plain"
        message.attach(MIMEText(body, body_type, "utf-8"))
        
        # Add attachments if any
        if attachments:
            for file_path in attachments:
                if Path(file_path).exists():
                    with open(file_path, "rb") as attachment:
                        part = MIMEBase("application", "octet-stream")
                        part.set_payload(attachment.read())
                        encoders.encode_base64(part)
                        part.add_header(
                            "Content-Disposition",
                            f"attachment; filename= {Path(file_path).name}",
                        )
                        message.attach(part)
        
        # Send email
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(message)
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

async def send_password_reset_email(
    email: str,
    name: str,
    reset_token: str
) -> bool:
    """Send password reset email"""
    subject = "Password Reset - Leipzig Bürgerbüro"
    
    body = f"""
Hallo {name},

Sie haben eine Passwort-Zurücksetzung für Ihr Leipzig Bürgerbüro Konto angefordert.

Klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:
{settings.FRONTEND_URL}/reset-password?token={reset_token}

Dieser Link ist 1 Stunde gültig.

Falls Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail bitte.

Mit freundlichen Grüßen
Ihr Team vom Bürgerbüro Leipzig

---
Dies ist eine automatisch generierte E-Mail.
    """
    
    return await send_email(
        to_email=email,
        subject=subject,
        body=body
    )

async def send_welcome_email(
    email: str,
    name: str,
    username: str,
    temporary_password: str
) -> bool:
    """Send welcome email to new staff member"""
    subject = "Willkommen im Leipzig Bürgerbüro System"
    
    body = f"""
Hallo {name},

Willkommen im Leipzig Bürgerbüro Antragsbearbeitungssystem!

Ihre Anmeldedaten:
Benutzername: {username}
Temporäres Passwort: {temporary_password}

Bitte loggen Sie sich unter folgendem Link ein und ändern Sie Ihr Passwort:
{settings.FRONTEND_URL}/staff/login

Wichtige Hinweise:
- Ändern Sie Ihr Passwort nach der ersten Anmeldung
- Geben Sie Ihre Anmeldedaten niemals an Dritte weiter
- Bei Problemen wenden Sie sich an den Administrator

Mit freundlichen Grüßen
Ihr Leipzig Bürgerbüro Team

---
Dies ist eine automatisch generierte E-Mail.
    """
    
    return await send_email(
        to_email=email,
        subject=subject,
        body=body
    )

async def send_daily_summary_email(
    email: str,
    name: str,
    summary_data: dict
) -> bool:
    """Send daily summary email to staff"""
    subject = f"Tagesübersicht - {summary_data.get('date', 'Heute')}"
    
    body = f"""
Hallo {name},

Hier ist Ihre Tagesübersicht für {summary_data.get('date', 'heute')}:

Neue Anträge: {summary_data.get('new_applications', 0)}
Bearbeitete Anträge: {summary_data.get('processed_applications', 0)}
Abgeschlossene Anträge: {summary_data.get('completed_applications', 0)}
Offene Anträge: {summary_data.get('pending_applications', 0)}

Anträge nach Status:
{chr(10).join(f"- {status}: {count}" for status, count in summary_data.get('status_counts', {}).items())}

Ihre Aufgaben für morgen:
- {summary_data.get('urgent_count', 0)} dringende Anträge
- {summary_data.get('review_count', 0)} Anträge zur Prüfung
- {summary_data.get('followup_count', 0)} Nachfragen zu bearbeiten

Dashboard: {settings.FRONTEND_URL}/staff/dashboard

Mit freundlichen Grüßen
Ihr Leipzig Bürgerbüro System

---
Dies ist eine automatisch generierte E-Mail.
    """
    
    return await send_email(
        to_email=email,
        subject=subject,
        body=body
    )

def create_html_email_template(
    title: str,
    content: str,
    footer: str = None
) -> str:
    """Create HTML email template"""
    footer = footer or "Leipzig Bürgerbüro - Automatisch generierte E-Mail"
    
    return f"""
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background-color: #004B87;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }}
        .content {{
            background-color: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
        }}
        .footer {{
            background-color: #666;
            color: white;
            padding: 10px;
            text-align: center;
            font-size: 12px;
            border-radius: 0 0 5px 5px;
        }}
        .button {{
            display: inline-block;
            padding: 10px 20px;
            background-color: #004B87;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
        }}
        .status {{
            padding: 5px 10px;
            border-radius: 3px;
            font-weight: bold;
            display: inline-block;
        }}
        .status-received {{ background-color: #e3f2fd; color: #1976d2; }}
        .status-processing {{ background-color: #fff3e0; color: #f57c00; }}
        .status-completed {{ background-color: #e8f5e8; color: #388e3c; }}
        .status-rejected {{ background-color: #ffebee; color: #d32f2f; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Leipzig Bürgerbüro</h1>
    </div>
    <div class="content">
        {content}
    </div>
    <div class="footer">
        {footer}
    </div>
</body>
</html>
    """