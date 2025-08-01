from sqlalchemy import Column, String, DateTime, Boolean, Enum, ForeignKey
from sqlalchemy.orm import relationship, deferred
from sqlalchemy.sql import func
from app.database import Base
from enum import Enum as PyEnum

class UserRole(str, PyEnum):
    ADMIN = "admin"
    STAFF = "staff"
    SUPERVISOR = "supervisor"

class UserStatus(str, PyEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Personal information
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    employee_id = Column(String, unique=True)
    department = Column(String)
    
    # Role and permissions
    role = Column(Enum(UserRole), default=UserRole.STAFF)
    status = Column(Enum(UserStatus), default=UserStatus.ACTIVE)
    
    # Account metadata
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    last_login = Column(DateTime)
    last_activity = Column(DateTime)
    
    # Settings
    language = Column(String, default="de")
    timezone = Column(String, default="Europe/Berlin")
    email_notifications = Column(Boolean, default=True)
    
    # Two-factor authentication
    is_2fa_enabled = Column(Boolean, default=False)
    totp_secret = Column(String)
    
    # Relationships
    assigned_applications = relationship("Application", back_populates="case_worker")
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def is_active(self):
        return self.status == UserStatus.ACTIVE
    
    def can_access_application(self, application):
        """Check if user can access specific application"""
        if self.role == UserRole.ADMIN:
            return True
        if self.role == UserRole.SUPERVISOR:
            return True
        return self.id == application.case_worker_id