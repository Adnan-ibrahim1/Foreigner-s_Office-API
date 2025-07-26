from sqlalchemy import Column, String, DateTime, Enum, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from enum import Enum as PyEnum
from datetime import datetime

class ApplicationStatus(str, PyEnum):
    EINGEGANGEN = "eingegangen"  # Received
    IN_BEARBEITUNG = "in_bearbeitung"  # Under Review
    NACHFRAGE = "nachfrage"  # Additional Info Required
    PRUEFUNG = "pruefung"  # Verification
    ENTSCHEIDUNG = "entscheidung"  # Decision Phase
    ABGESCHLOSSEN = "abgeschlossen"  # Completed
    ABGELEHNT = "abgelehnt"  # Rejected

class ApplicationType(str, PyEnum):
    ANMELDUNG = "anmeldung"  # Registration
    PASSPORT = "passport"
    VISA_EXTENSION = "visa_extension"
    WORK_PERMIT = "work_permit"
    RESIDENCE_PERMIT = "residence_permit"

class Priority(str, PyEnum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(String, primary_key=True, index=True)
    application_type = Column(Enum(ApplicationType), nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.EINGEGANGEN)
    priority = Column(Enum(Priority), default=Priority.NORMAL)
    
    # Personal information
    email = Column(String, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    date_of_birth = Column(String, nullable=False)  # Format: YYYY-MM-DD
    phone = Column(String)
    nationality = Column(String)
    address = Column(Text)
    
    # Application metadata
    submitted_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    estimated_completion = Column(DateTime)
    actual_completion = Column(DateTime)
    
    # Staff assignment
    case_worker_id = Column(String, ForeignKey("users.id"))
    case_worker = relationship("User", back_populates="assigned_applications")
    
    # Additional information
    notes = Column(Text)
    internal_notes = Column(Text)  # Only visible to staff
    language_preference = Column(String, default="de")
    
    # Flags
    is_urgent = Column(Boolean, default=False)
    requires_appointment = Column(Boolean, default=False)
    documents_complete = Column(Boolean, default=False)
    
    # Relationships
    status_updates = relationship("StatusUpdate", back_populates="application")
    documents = relationship("Document", back_populates="application")
    messages = relationship("Message", back_populates="application")

class StatusUpdate(Base):
    __tablename__ = "status_updates"
    
    id = Column(String, primary_key=True, index=True)
    application_id = Column(String, ForeignKey("applications.id"), nullable=False)
    old_status = Column(Enum(ApplicationStatus))
    new_status = Column(Enum(ApplicationStatus), nullable=False)
    message = Column(Text)
    updated_by = Column(String, ForeignKey("users.id"), nullable=True)  
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    application = relationship("Application", back_populates="status_updates")
    updated_by_user = relationship("User")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, index=True)
    application_id = Column(String, ForeignKey("applications.id"), nullable=False)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(String)
    mime_type = Column(String)
    uploaded_at = Column(DateTime, default=func.now())
    uploaded_by = Column(String)  # 'citizen' or staff user id
    
    # Document verification
    is_verified = Column(Boolean, default=False)
    verified_by = Column(String, ForeignKey("users.id"))
    verified_at = Column(DateTime)
    
    # Relationships
    application = relationship("Application", back_populates="documents")
    verified_by_user = relationship("User")

class Staff(Base):
    __tablename__ = "staff"
    
    id = Column(String, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    department = Column(String, default="General")
    role = Column(String, nullable=False, default="processor")  # 'admin', 'processor', 'supervisor'
    is_active = Column(Boolean, default=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    
    # Relationship to messages they send
    sent_messages = relationship("Message", back_populates="sender", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True)
    application_id = Column(String, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    
    # Sender information with proper foreign key
    sender_type = Column(String, nullable=False, default="applicant")  # 'staff' or 'applicant'
    sender_id = Column(String, ForeignKey("staff.id", ondelete="SET NULL"), nullable=True)  # References staff.id, NULL for applicants
    sender_name = Column(String, nullable=False, default="Applicant")  # Display name
    
    message = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=False)  # Internal staff notes
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Proper relationships with foreign keys
    application = relationship("Application", back_populates="messages")
    sender = relationship("Staff", back_populates="sent_messages") 