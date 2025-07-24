import uuid
import secrets
import string
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from app.models.application import ApplicationType, ApplicationStatus


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

def calculate_estimated_completion(application_type: ApplicationType) -> timedelta:
    """Calculate estimated completion time based on application type."""
    if application_type == ApplicationType.LOAN:
        return timedelta(days=5)
    elif application_type == ApplicationType.CREDIT_CARD:
        return timedelta(days=7)
    elif application_type == ApplicationType.MORTGAGE:
        return timedelta(days=30)
    elif application_type == ApplicationType.PERSONAL_LOAN:
        return timedelta(days=10)
    elif application_type == ApplicationType.BUSINESS_LOAN:
        return timedelta(days=15)
    elif application_type == ApplicationType.AUTO_LOAN:
        return timedelta(days=20)
    else:
        return timedelta(days=7)  # Default case

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