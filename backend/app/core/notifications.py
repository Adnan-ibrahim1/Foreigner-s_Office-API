from app.models.application import ApplicationStatus
from app.utils.email import send_email
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Status messages in different languages
STATUS_MESSAGES = {
    "de": {
        ApplicationStatus.EINGEGANGEN: "Ihr Antrag wurde eingegangen und wird bearbeitet.",
        ApplicationStatus.IN_BEARBEITUNG: "Ihr Antrag wird derzeit bearbeitet.",
        ApplicationStatus.NACHFRAGE: "Wir benötigen zusätzliche Informationen für Ihren Antrag.",
        ApplicationStatus.PRUEFUNG: "Ihr Antrag wird derzeit geprüft.",
        ApplicationStatus.ENTSCHEIDUNG: "Ihr Antrag befindet sich in der Entscheidungsphase.",
        ApplicationStatus.ABGESCHLOSSEN: "Ihr Antrag wurde erfolgreich bearbeitet.",
        ApplicationStatus.ABGELEHNT: "Ihr Antrag wurde leider abgelehnt."
    },
    "en": {
        ApplicationStatus.EINGEGANGEN: "Your application has been received and is being processed.",
        ApplicationStatus.IN_BEARBEITUNG: "Your application is currently being reviewed.",
        ApplicationStatus.NACHFRAGE: "We need additional information for your application.",
        ApplicationStatus.PRUEFUNG: "Your application is currently being verified.",
        ApplicationStatus.ENTSCHEIDUNG: "Your application is in the decision phase.",
        ApplicationStatus.ABGESCHLOSSEN: "Your application has been successfully processed.",
        ApplicationStatus.ABGELEHNT: "Your application has been rejected."
    },
    "ar": {
        ApplicationStatus.EINGEGANGEN: "تم استلام طلبك وهو قيد المعالجة.",
        ApplicationStatus.IN_BEARBEITUNG: "طلبك قيد المراجعة حالياً.",
        ApplicationStatus.NACHFRAGE: "نحتاج إلى معلومات إضافية لطلبك.",
        ApplicationStatus.PRUEFUNG: "طلبك قيد التحقق حالياً.",
        ApplicationStatus.ENTSCHEIDUNG: "طلبك في مرحلة اتخاذ القرار.",
        ApplicationStatus.ABGESCHLOSSEN: "تم معالجة طلبك بنجاح.",
        ApplicationStatus.ABGELEHNT: "تم رفض طلبك."
    }
}

# Email subjects in different languages
EMAIL_SUBJECTS = {
    "de": {
        ApplicationStatus.EINGEGANGEN: "Antragseingang bestätigt - {application_id}",
        ApplicationStatus.IN_BEARBEITUNG: "Antrag in Bearbeitung - {application_id}",
        ApplicationStatus.NACHFRAGE: "Zusätzliche Informationen erforderlich - {application_id}",
        ApplicationStatus.PRUEFUNG: "Antrag wird geprüft - {application_id}",
        ApplicationStatus.ENTSCHEIDUNG: "Antrag in Entscheidungsphase - {application_id}",
        ApplicationStatus.ABGESCHLOSSEN: "Antrag erfolgreich bearbeitet - {application_id}",
        ApplicationStatus.ABGELEHNT: "Antrag abgelehnt - {application_id}"
    },
    "en": {
        ApplicationStatus.EINGEGANGEN: "Application received - {application_id}",
        ApplicationStatus.IN_BEARBEITUNG: "Application under review - {application_id}",
        ApplicationStatus.NACHFRAGE: "Additional information required - {application_id}",
        ApplicationStatus.PRUEFUNG: "Application being verified - {application_id}",
        ApplicationStatus.ENTSCHEIDUNG: "Application in decision phase - {application_id}",
        ApplicationStatus.ABGESCHLOSSEN: "Application successfully processed - {application_id}",
        ApplicationStatus.ABGELEHNT: "Application rejected - {application_id}"
    },
    "ar": {
        ApplicationStatus.EINGEGANGEN: "تم استلام الطلب - {application_id}",
        ApplicationStatus.IN_BEARBEITUNG: "الطلب قيد المراجعة - {application_id}",
        ApplicationStatus.NACHFRAGE: "معلومات إضافية مطلوبة - {application_id}",
        ApplicationStatus.PRUEFUNG: "جاري التحقق من الطلب - {application_id}",
        ApplicationStatus.ENTSCHEIDUNG: "الطلب في مرحلة اتخاذ القرار - {application_id}",
        ApplicationStatus.ABGESCHLOSSEN: "تم معالجة الطلب بنجاح - {application_id}",
        ApplicationStatus.ABGELEHNT: "تم رفض الطلب - {application_id}"
    }
}

async def send_status_notification(
    email: str,
    application_id: str,
    status: ApplicationStatus,
    custom_message: str = "",
    language: str = "de"
):
    """Send status update notification via email"""
    try:
        # Get language-specific messages (fallback to German)
        if language not in STATUS_MESSAGES:
            language = "de"
        
        status_message = STATUS_MESSAGES[language].get(
            status, 
            STATUS_MESSAGES["de"][status]
        )
        
        subject = EMAIL_SUBJECTS[language].get(
            status,
            EMAIL_SUBJECTS["de"][status]
        ).format(application_id=application_id)
        
        # Create email body
        if language == "de":
            body = f"""
Liebe Antragstellerin, lieber Antragsteller,

{status_message}

Antragsnummer: {application_id}
Status: {status.value.replace('_', ' ').title()}

{custom_message if custom_message else ''}

Sie können den aktuellen Status Ihres Antrags jederzeit unter folgendem Link einsehen:
{settings.FRONTEND_URL}/status

Bei Fragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen
Ihr Team vom Bürgerbüro Leipzig

---
Dies ist eine automatisch generierte E-Mail. Bitte antworten Sie nicht direkt auf diese Nachricht.
            """
        elif language == "en":
            body = f"""
Dear Applicant,

{status_message}

Application Number: {application_id}
Status: {status.value.replace('_', ' ').title()}

{custom_message if custom_message else ''}

You can check the current status of your application at any time under the following link:
{settings.FRONTEND_URL}/status

If you have any questions, please don't hesitate to contact us.

Best regards
Your Leipzig Citizen Services Team

---
This is an automatically generated email. Please do not reply directly to this message.
            """
        else:  # Arabic
            body = f"""
عزيزي مقدم الطلب،

{status_message}

رقم الطلب: {application_id}
الحالة: {status.value.replace('_', ' ').title()}

{custom_message if custom_message else ''}

يمكنك التحقق من الحالة الحالية لطلبك في أي وقت تحت الرابط التالي:
{settings.FRONTEND_URL}/status

إذا كان لديك أي أسئلة، يرجى عدم التردد في الاتصال بنا.

مع أطيب التحيات
فريق خدمات المواطنين في لايبزيغ

---
هذه رسالة إلكترونية تم إنشاؤها تلقائيًا. يرجى عدم الرد مباشرة على هذه الرسالة.
            """
        
        # Send email
        await send_email(
            to_email=email,
            subject=subject,
            body=body,
            is_html=False
        )
        
        logger.info(f"Status notification sent to {email} for application {application_id}")
        
    except Exception as e:
        logger.error(f"Failed to send status notification: {str(e)}")

async def send_document_request_notification(
    email: str,
    application_id: str,
    required_documents: list,
    language: str = "de"
):
    """Send document request notification"""
    try:
        if language == "de":
            subject = f"Dokumente erforderlich - {application_id}"
            body = f"""
Liebe Antragstellerin, lieber Antragsteller,

für die Bearbeitung Ihres Antrags (Nr. {application_id}) benötigen wir noch folgende Dokumente:

{chr(10).join(f"• {doc}" for doc in required_documents)}

Bitte reichen Sie die fehlenden Dokumente zeitnah nach, um Verzögerungen zu vermeiden.

Sie können Dokumente hochladen unter: {settings.FRONTEND_URL}/status

Mit freundlichen Grüßen
Ihr Team vom Bürgerbüro Leipzig
            """
        elif language == "en":
            subject = f"Documents required - {application_id}"
            body = f"""
Dear Applicant,

For processing your application (No. {application_id}), we still need the following documents:

{chr(10).join(f"• {doc}" for doc in required_documents)}

Please submit the missing documents promptly to avoid delays.

You can upload documents at: {settings.FRONTEND_URL}/status

Best regards
Your Leipzig Citizen Services Team
            """
        else:  # Arabic
            subject = f"مستندات مطلوبة - {application_id}"
            body = f"""
عزيزي مقدم الطلب،

لمعالجة طلبك (رقم {application_id})، نحتاج إلى المستندات التالية:

{chr(10).join(f"• {doc}" for doc in required_documents)}

يرجى تقديم المستندات المفقودة بسرعة لتجنب التأخير.

يمكنك تحميل المستندات على: {settings.FRONTEND_URL}/status

مع أطيب التحيات
فريق خدمات المواطنين في لايبزيغ
            """
        
        await send_email(
            to_email=email,
            subject=subject,
            body=body,
            is_html=False
        )
        
        logger.info(f"Document request notification sent to {email} for application {application_id}")
        
    except Exception as e:
        logger.error(f"Failed to send document request notification: {str(e)}")

async def send_appointment_notification(
    email: str,
    application_id: str,
    appointment_date: str,
    appointment_time: str,
    location: str,
    language: str = "de"
):
    """Send appointment notification"""
    try:
        if language == "de":
            subject = f"Terminvereinbarung - {application_id}"
            body = f"""
Liebe Antragstellerin, lieber Antragsteller,

für Ihren Antrag (Nr. {application_id}) haben wir einen Termin für Sie vereinbart:

Datum: {appointment_date}
Uhrzeit: {appointment_time}
Ort: {location}

Bitte bringen Sie alle erforderlichen Dokumente mit und seien Sie pünktlich.

Bei Terminänderungen kontaktieren Sie uns bitte rechtzeitig.

Mit freundlichen Grüßen
Ihr Team vom Bürgerbüro Leipzig
            """
        elif language == "en":
            subject = f"Appointment scheduled - {application_id}"
            body = f"""
Dear Applicant,

We have scheduled an appointment for your application (No. {application_id}):

Date: {appointment_date}
Time: {appointment_time}
Location: {location}

Please bring all required documents and be punctual.

If you need to reschedule, please contact us in advance.

Best regards
Your Leipzig Citizen Services Team
            """
        else:  # Arabic
            subject = f"تم تحديد موعد - {application_id}"
            body = f"""
عزيزي مقدم الطلب،

لقد حددنا موعداً لطلبك (رقم {application_id}):

التاريخ: {appointment_date}
الوقت: {appointment_time}
المكان: {location}

يرجى إحضار جميع المستندات المطلوبة والحضور في الوقت المحدد.

إذا كنت بحاجة إلى إعادة جدولة الموعد، يرجى الاتصال بنا مسبقاً.

مع أطيب التحيات
فريق خدمات المواطنين في لايبزيغ
            """
        
        await send_email(
            to_email=email,
            subject=subject,
            body=body,
            is_html=False
        )
        
        logger.info(f"Appointment notification sent to {email} for application {application_id}")
        
    except Exception as e:
        logger.error(f"Failed to send appointment notification: {str(e)}")

# SMS notification functions (if SMS is enabled)
async def send_sms_notification(
    phone_number: str,
    message: str
):
    """Send SMS notification (requires Twilio or similar service)"""
    if not settings.SMS_API_KEY:
        logger.warning("SMS notifications are disabled (no API key configured)")
        return
    
    try:
        # Implementation would depend on SMS service provider
        # Example for Twilio:
        # from twilio.rest import Client
        # client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        # client.messages.create(
        #     body=message,
        #     from_=settings.TWILIO_PHONE_NUMBER,
        #     to=phone_number
        # )
        
        logger.info(f"SMS notification would be sent to {phone_number}: {message}")
        
    except Exception as e:
        logger.error(f"Failed to send SMS notification: {str(e)}")