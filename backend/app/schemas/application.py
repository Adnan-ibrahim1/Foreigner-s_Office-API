from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional, List
from datetime import datetime
from app.models.application import ApplicationStatus, ApplicationType, Priority

# Base schemas
class ApplicationBase(BaseModel):
    application_type: ApplicationType = Field(..., alias="type")
    email: EmailStr = Field(..., alias="email")
    first_name: str = Field(..., alias="firstName")
    last_name: str = Field(..., alias="lastName")
    date_of_birth: str = Field(..., alias="birthDate")
    phone: str = Field(..., alias="phone")

    nationality: Optional[str] = Field(None, alias="nationality")  # If it exists, same key
    address: Optional[str] = Field(None, alias="address")
    language_preference: str = Field("de", alias="languagePreference")
    

class ApplicationCreate(ApplicationBase):
    @validator('date_of_birth')
    def validate_date_of_birth(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
        except ValueError:
            raise ValueError('Date of birth must be in YYYY-MM-DD format')
        return v

class ApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None
    priority: Optional[Priority] = None
    case_worker_id: Optional[str] = None
    notes: Optional[str] = None
    internal_notes: Optional[str] = None
    is_urgent: Optional[bool] = None
    requires_appointment: Optional[bool] = None
    documents_complete: Optional[bool] = None

class ApplicationResponse(ApplicationBase):
    id: str
    status: ApplicationStatus
    priority: Priority
    submitted_at: datetime
    updated_at: datetime
    estimated_completion: Optional[datetime]
    actual_completion: Optional[datetime]
    case_worker_id: Optional[str]
    notes: Optional[str]
    is_urgent: bool
    requires_appointment: bool
    documents_complete: bool
    progress_percentage: int
    
    class Config:
        from_attributes = True

class ApplicationStatusCheck(BaseModel):
    application_id: str
    date_of_birth: str

# Status Update schemas
class StatusUpdateCreate(BaseModel):
    application_id: str
    new_status: ApplicationStatus
    message: str

class StatusUpdateResponse(BaseModel):
    id: str
    application_id: str
    old_status: Optional[ApplicationStatus]
    new_status: ApplicationStatus
    message: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Document schemas
class DocumentUpload(BaseModel):
    filename: str
    
class DocumentResponse(BaseModel):
    id: str
    application_id: str
    filename: str
    original_filename: str
    file_size: str
    uploaded_at: datetime
    uploaded_by: str
    is_verified: bool
    verified_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Message schemas
class MessageCreate(BaseModel):
    application_id: str
    message: str
    is_internal: bool = False

class MessageResponse(BaseModel):
    id: str
    application_id: str
    sender_type: str
    message: str
    is_internal: bool
    created_at: datetime
    read_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Dashboard schemas
class ApplicationSummary(BaseModel):
    total_applications: int
    pending_applications: int
    completed_applications: int
    urgent_applications: int
    applications_by_status: dict
    applications_by_type: dict
    average_processing_time: float

class ApplicationList(BaseModel):
    applications: List[ApplicationResponse]
    total: int
    page: int
    per_page: int
    total_pages: int