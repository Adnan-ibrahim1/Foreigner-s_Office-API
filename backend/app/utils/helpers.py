# app/utils/helpers.py
from datetime import datetime, timedelta
from app.models.application import ApplicationType, ApplicationStatus
from typing import Dict, Any, Optional
import logging
import uuid
import random
import string
import secrets
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.application import Message, Staff


logger = logging.getLogger(__name__)

def generate_application_id() -> str:
    """Generate a unique application ID"""
    # Format: LB-YYYY-XXXXXX (LB = Leipzig Bürgerbüro)
    year = datetime.now().year
    random_part = ''.join(random.choices(string.digits, k=6))
    return f"LB-{year}-{random_part}"

def calculate_estimated_completion(application_type) -> datetime:
    """
    Calculate estimated completion date based on application type
    Returns completion date in business days (excluding weekends)
    """
    try:
        logger.info(f"Calculating completion time for: {application_type}")
        
        # Handle ApplicationType enum or string
        if hasattr(application_type, 'value'):
            # It's already an enum, get its value
            app_type_str = application_type.value
        elif isinstance(application_type, str):
            app_type_str = application_type.lower()
        else:
            app_type_str = str(application_type).lower()
        
        # Find matching enum
        app_type = None
        for enum_item in ApplicationType:
            if enum_item.value == app_type_str:
                app_type = enum_item
                break
        
        if app_type is None:
            logger.warning(f"Unknown application type: {application_type}, using default")
            app_type = ApplicationType.OTHER

        # Processing time mapping (in business days)
        processing_times = {
            # Identity Documents (longer processing)
            ApplicationType.PASSPORT: 21,           # 3 weeks
            ApplicationType.ID_CARD: 14,            # 2 weeks
            ApplicationType.DRIVER_LICENSE: 10,     # 2 weeks
            
            # Certificates (quick processing)
            ApplicationType.BIRTH_CERTIFICATE: 5,   # 1 week
            ApplicationType.MARRIAGE_CERTIFICATE: 5,
            ApplicationType.DEATH_CERTIFICATE: 5,
            ApplicationType.CRIMINAL_RECORD: 7,     # 1 week
            
            # Residence Services (very quick)
            ApplicationType.ANMELDUNG: 1,                     # Same day (German)
            ApplicationType.RESIDENCE_REGISTRATION: 1,        # Same day
            ApplicationType.ABMELDUNG: 1,                     # Same day (German)
            ApplicationType.RESIDENCE_DEREGISTRATION: 1,      # Same day
            ApplicationType.RESIDENCE_CERTIFICATE: 3,         # 3 days
            
            # Business Services (moderate processing)
            ApplicationType.BUSINESS_REGISTRATION: 10,    # 2 weeks
            ApplicationType.BUSINESS_LICENSE: 21,         # 3 weeks
            ApplicationType.TRADE_LICENSE: 14,            # 2 weeks
            
            # Social Services (longer processing due to verification)
            ApplicationType.LOAN: 30,                     # 6 weeks
            ApplicationType.SOCIAL_BENEFITS: 21,          # 3 weeks
            ApplicationType.UNEMPLOYMENT_BENEFITS: 14,    # 2 weeks
            ApplicationType.CHILD_ALLOWANCE: 10,          # 2 weeks
            
            # Tax and Financial
            ApplicationType.TAX_CERTIFICATE: 7,           # 1 week
            ApplicationType.TAX_RETURN: 14,               # 2 weeks
            ApplicationType.INCOME_CERTIFICATE: 5,        # 1 week
            
            # Permits and Licenses (varies by complexity)
            ApplicationType.PARKING_PERMIT: 5,            # 1 week
            ApplicationType.BUILDING_PERMIT: 60,          # 3 months
            ApplicationType.EVENT_PERMIT: 14,             # 2 weeks
            
            # Other Services
            ApplicationType.NOTARY_SERVICE: 3,            # 3 days
            ApplicationType.APOSTILLE: 7,                 # 1 week
            ApplicationType.OTHER: 14,                    # Default 2 weeks
        }
        
        # Get processing days, default to 14 if not found
        processing_days = processing_times.get(app_type, 14)
        logger.info(f"Processing time for {app_type}: {processing_days} business days")
        
        # Calculate estimated completion (excluding weekends)
        estimated_date = datetime.now()
        days_added = 0
        
        while days_added < processing_days:
            estimated_date += timedelta(days=1)
            # Skip weekends (Monday = 0, Sunday = 6)
            if estimated_date.weekday() < 5:  # Monday to Friday
                days_added += 1
        
        logger.info(f"Estimated completion date: {estimated_date}")
        return estimated_date
        
    except Exception as e:
        logger.error(f"Error calculating estimated completion for {application_type}: {e}")
        # Return default processing time on error (14 business days)
        return add_business_days(datetime.now(), 14)

def calculate_progress_percentage(status: ApplicationStatus) -> int:
    """Calculate progress percentage based on application status."""
    status_progress = {
        ApplicationStatus.DRAFT: 0,
        ApplicationStatus.SUBMITTED: 10,
        ApplicationStatus.UNDER_REVIEW: 30,
        ApplicationStatus.APPROVED: 100,
        ApplicationStatus.REJECTED: 0,
        ApplicationStatus.PENDING_DOCUMENTS: 50,
        ApplicationStatus.CANCELLED: 0
    }
    return status_progress.get(status, 0)


def add_business_days(start_date: datetime, business_days: int) -> datetime:
    """Add business days to a date (excluding weekends)"""
    current_date = start_date
    days_added = 0
    
    while days_added < business_days:
        current_date += timedelta(days=1)
        if current_date.weekday() < 5:  # Monday to Friday
            days_added += 1
    
    return current_date

def get_application_type_display_name(application_type: str, language: str = "de") -> str:
    """Get human-readable display name for application type"""
    
    display_names = {
        "de": {  # German
            ApplicationType.PASSPORT: "Reisepass",
            ApplicationType.ID_CARD: "Personalausweis",
            ApplicationType.BIRTH_CERTIFICATE: "Geburtsurkunde",
            ApplicationType.MARRIAGE_CERTIFICATE: "Heiratsurkunde",
            ApplicationType.ANMELDUNG: "Anmeldung",
            ApplicationType.RESIDENCE_REGISTRATION: "Anmeldung",
            ApplicationType.ABMELDUNG: "Abmeldung",
            ApplicationType.RESIDENCE_DEREGISTRATION: "Abmeldung",
            ApplicationType.BUSINESS_REGISTRATION: "Gewerbeanmeldung",
            ApplicationType.LOAN: "Darlehen",
            ApplicationType.SOCIAL_BENEFITS: "Sozialleistungen",
            ApplicationType.PARKING_PERMIT: "Parkausweis",
            ApplicationType.BUILDING_PERMIT: "Baugenehmigung",
            ApplicationType.OTHER: "Sonstiges",
        },
        "en": {  # English
            ApplicationType.PASSPORT: "Passport",
            ApplicationType.ID_CARD: "ID Card",
            ApplicationType.BIRTH_CERTIFICATE: "Birth Certificate",
            ApplicationType.MARRIAGE_CERTIFICATE: "Marriage Certificate",
            ApplicationType.ANMELDUNG: "Residence Registration",
            ApplicationType.RESIDENCE_REGISTRATION: "Residence Registration",
            ApplicationType.ABMELDUNG: "Residence Deregistration", 
            ApplicationType.RESIDENCE_DEREGISTRATION: "Residence Deregistration",
            ApplicationType.BUSINESS_REGISTRATION: "Business Registration",
            ApplicationType.LOAN: "Loan Application",
            ApplicationType.SOCIAL_BENEFITS: "Social Benefits",
            ApplicationType.PARKING_PERMIT: "Parking Permit",
            ApplicationType.BUILDING_PERMIT: "Building Permit",
            ApplicationType.OTHER: "Other",
        }
    }
    
    try:
        app_type = ApplicationType(application_type.lower())
        return display_names.get(language, display_names["en"]).get(app_type, application_type)
    except ValueError:
        return application_type
    
def validate_json_schema(data: Dict[str, Any], required_fields: list) -> Dict[str, Any]:
    """Validate JSON data against required fields."""
    errors = []
    
    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: {field}")
        elif not data[field]:
            errors.append(f"Field '{field}' cannot be empty")
    
    return {
        'valid': len(errors) == 0,
        'errors': errors
    }


def safe_dict_get(dictionary: Dict[str, Any], key: str, default: Any = None) -> Any:
    """Safely get value from dictionary with nested key support."""
    keys = key.split('.')
    current = dictionary
    
    for k in keys:
        if isinstance(current, dict) and k in current:
            current = current[k]
        else:
            return default
    
    return current


def generate_uuid() -> str:
    """Generate a new UUID4 string."""
    return str(uuid.uuid4())


def generate_secure_token(length: int = 32) -> str:
    """Generate a cryptographically secure random token."""
    return secrets.token_urlsafe(length)


def generate_password(length: int = 12, include_symbols: bool = True) -> str:
    """Generate a secure random password."""
    characters = string.ascii_letters + string.digits
    if include_symbols:
        characters += "!@#$%^&*"
    
    return ''.join(secrets.choice(characters) for _ in range(length))


def generate_application_id() -> str:
    """Generate a unique application ID with prefix."""
    return f"APP-{uuid.uuid4().hex[:8].upper()}"


def format_datetime(dt: datetime, format_str: str = "%Y-%m-%d %H:%M:%S") -> str:
    """Format datetime object to string."""
    if not dt:
        return ""
    return dt.strftime(format_str)


def parse_datetime(date_str: str, format_str: str = "%Y-%m-%d %H:%M:%S") -> Optional[datetime]:
    """Parse string to datetime object."""
    try:
        return datetime.strptime(date_str, format_str)
    except (ValueError, TypeError):
        return None


def get_expiry_date(days: int = 30) -> datetime:
    """Get future expiry date."""
    return datetime.utcnow() + timedelta(days=days)


def is_expired(expiry_date: datetime) -> bool:
    """Check if given date has expired."""
    return datetime.utcnow() > expiry_date


def sanitize_filename(filename: str) -> str:
    """Sanitize filename by removing dangerous characters."""
    # Remove path separators and other dangerous characters
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    
    # Remove leading/trailing whitespace and dots
    filename = filename.strip(' .')
    
    # Ensure filename is not empty
    if not filename:
        filename = f"file_{uuid.uuid4().hex[:8]}"
    
    return filename


def validate_email(email: str) -> bool:
    """Basic email validation."""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_phone(phone: str) -> bool:
    """Basic phone number validation."""
    import re
    # Remove all non-digit characters
    digits_only = re.sub(r'\D', '', phone)
    # Check if it's between 10-15 digits
    return 10 <= len(digits_only) <= 15


def format_currency(amount: float, currency: str = "USD") -> str:
    """Format currency amount."""
    if currency == "USD":
        return f"${amount:,.2f}"
    elif currency == "EUR":
        return f"€{amount:,.2f}"
    elif currency == "GBP":
        return f"£{amount:,.2f}"
    else:
        return f"{amount:,.2f} {currency}"


def get_application_status_display(status: ApplicationStatus) -> str:
    """Get human-readable application status."""
    status_map = {
        ApplicationStatus.DRAFT: "Draft",
        ApplicationStatus.SUBMITTED: "Submitted",
        ApplicationStatus.UNDER_REVIEW: "Under Review",
        ApplicationStatus.APPROVED: "Approved",
        ApplicationStatus.REJECTED: "Rejected",
        ApplicationStatus.PENDING_DOCUMENTS: "Pending Documents",
        ApplicationStatus.CANCELLED: "Cancelled"
    }
    return status_map.get(status, str(status))


def get_application_type_display(app_type: ApplicationType) -> str:
    """Get human-readable application type."""
    type_map = {
        ApplicationType.LOAN: "Loan Application",
        ApplicationType.CREDIT_CARD: "Credit Card Application",
        ApplicationType.MORTGAGE: "Mortgage Application",
        ApplicationType.PERSONAL_LOAN: "Personal Loan",
        ApplicationType.BUSINESS_LOAN: "Business Loan",
        ApplicationType.AUTO_LOAN: "Auto Loan"
    }
    return type_map.get(app_type, str(app_type))


def calculate_age(birth_date: datetime) -> int:
    """Calculate age from birth date."""
    today = datetime.now().date()
    birth_date = birth_date.date() if isinstance(birth_date, datetime) else birth_date
    
    age = today.year - birth_date.year
    
    # Adjust if birthday hasn't occurred this year
    if today < birth_date.replace(year=today.year):
        age -= 1
    
    return age


def mask_sensitive_data(data: str, visible_chars: int = 4, mask_char: str = "*") -> str:
    """Mask sensitive data like SSN, credit card numbers."""
    if len(data) <= visible_chars:
        return mask_char * len(data)
    
    return data[:visible_chars] + mask_char * (len(data) - visible_chars)


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug."""
    import re
    # Convert to lowercase and replace spaces/special chars with hyphens
    slug = re.sub(r'[^\w\s-]', '', text.lower())
    slug = re.sub(r'[\s_-]+', '-', slug)
    return slug.strip('-')


def paginate_query(query, page: int = 1, per_page: int = 20) -> Dict[str, Any]:
    """Helper function for pagination."""
    offset = (page - 1) * per_page
    items = query.offset(offset).limit(per_page).all()
    total = query.count()
    
    return {
        'items': items,
        'total': total,
        'page': page,
        'per_page': per_page,
        'pages': (total + per_page - 1) // per_page,
        'has_prev': page > 1,
        'has_next': page * per_page < total,
        'prev_num': page - 1 if page > 1 else None,
        'next_num': page + 1 if page * per_page < total else None
    }


def generate_reference_number(prefix: str = "REF") -> str:
    """Generate a reference number with timestamp."""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_part = secrets.token_hex(4).upper()
    return f"{prefix}-{timestamp}-{random_part}"


def convert_size_to_bytes(size_str: str) -> int:
    """Convert size string (e.g., '10MB', '1GB') to bytes."""
    size_str = size_str.upper().strip()
    
    if size_str.endswith('KB'):
        return int(float(size_str[:-2]) * 1024)
    elif size_str.endswith('MB'):
        return int(float(size_str[:-2]) * 1024 * 1024)
    elif size_str.endswith('GB'):
        return int(float(size_str[:-2]) * 1024 * 1024 * 1024)
    else:
        return int(size_str)


def format_file_size(size_bytes: int) -> str:
    """Format file size in bytes to human readable format."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    elif size_bytes < 1024 * 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    else:
        return f"{size_bytes / (1024 * 1024 * 1024):.1f} GB"


def get_client_ip(request) -> str:
    """Get client IP address from request."""
    # Check for forwarded IP first (if behind proxy)
    forwarded_ip = request.headers.get('X-Forwarded-For')
    if forwarded_ip:
        return forwarded_ip.split(',')[0].strip()
    
    # Check for real IP header
    real_ip = request.headers.get('X-Real-IP')
    if real_ip:
        return real_ip
    
    # Fall back to remote address
    return request.remote_addr or 'unknown'


def generate_otp(length: int = 6) -> str:
    """Generate numeric OTP."""
    return ''.join(secrets.choice(string.digits) for _ in range(length))


def time_ago(dt: datetime) -> str:
    """Get human-readable time difference."""
    now = datetime.utcnow()
    diff = now - dt
    
    if diff.days > 0:
        return f"{diff.days} day{'s' if diff.days != 1 else ''} ago"
    elif diff.seconds > 3600:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    elif diff.seconds > 60:
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
    else:
        return "Just now"

def create_applicant_message(
    db: Session,
    application_id: str,
    message_text: str,
    sender_name: str = "Applicant"
) -> Message:
    """Create a message from an applicant"""
    
    message = Message(
        id=str(uuid.uuid4()),
        application_id=application_id,
        sender_type="applicant",
        sender_id=None,  # No foreign key for applicants
        sender_name=sender_name,
        message=message_text,
        is_internal=False
    )
    
    db.add(message)
    return message

def create_staff_message(
    db: Session,
    application_id: str,
    message_text: str,
    staff_id: str,
    is_internal: bool = False
) -> Message:
    """Create a message from a staff member"""
    
    # Get staff member details
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise ValueError(f"Staff member with ID {staff_id} not found")
    
    message = Message(
        id=str(uuid.uuid4()),
        application_id=application_id,
        sender_type="staff",
        sender_id=staff_id,  # Foreign key to staff table
        sender_name=f"{staff.first_name} {staff.last_name}",
        message=message_text,
        is_internal=is_internal
    )
    
    db.add(message)
    return message

def get_application_messages(
    db: Session,
    application_id: str,
    include_internal: bool = False
) -> list:
    """Get all messages for an application"""
    
    query = db.query(Message).filter(Message.application_id == application_id)
    
    if not include_internal:
        query = query.filter(Message.is_internal == False)
    
    return query.order_by(Message.created_at.desc()).all()

def get_staff_messages(
    db: Session,
    staff_id: str,
    limit: int = 50
) -> list:
    """Get recent messages sent by a staff member"""
    
    return db.query(Message).filter(
        Message.sender_id == staff_id
    ).order_by(
        Message.created_at.desc()
    ).limit(limit).all()