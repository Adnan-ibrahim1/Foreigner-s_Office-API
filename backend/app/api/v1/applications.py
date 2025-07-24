from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.application import Application, StatusUpdate, ApplicationStatus
from app.schemas.application import (
    ApplicationCreate, ApplicationResponse, ApplicationStatusCheck,
    StatusUpdateCreate, StatusUpdateResponse, ApplicationUpdate
)
from app.core.notifications import send_status_notification
from app.utils.helpers import generate_application_id, calculate_estimated_completion
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=ApplicationResponse)
async def create_application(
    application: ApplicationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Submit a new application"""
    
    # Generate unique application ID
    app_id = generate_application_id()
    
    # Calculate estimated completion
    estimated_completion = calculate_estimated_completion(application.application_type)
    
    # Create application record
    db_application = Application(
        id=app_id,
        application_type=application.application_type,
        email=application.email,
        first_name=application.first_name,
        last_name=application.last_name,
        date_of_birth=application.date_of_birth,
        phone=application.phone,
        nationality=application.nationality,
        address=application.address,
        language_preference=application.language_preference,
        estimated_completion=estimated_completion
    )
    
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    
    # Create initial status update
    status_update = StatusUpdate(
        id=str(uuid.uuid4()),
        application_id=app_id,
        old_status=None,
        new_status=ApplicationStatus.EINGEGANGEN,
        message="Application submitted successfully",
        updated_by="system"
    )
    
    db.add(status_update)
    db.commit()
    
    # Send confirmation notification
    background_tasks.add_task(
        send_status_notification,
        application.email,
        app_id,
        ApplicationStatus.EINGEGANGEN,
        f"Your application has been received. Reference number: {app_id}",
        application.language_preference
    )
    
    return ApplicationResponse(
        **db_application.__dict__,
        progress_percentage=10  # Initial progress
    )

@router.post("/check-status", response_model=ApplicationResponse)
async def check_application_status(
    status_check: ApplicationStatusCheck,
    db: Session = Depends(get_db)
):
    """Check application status using application ID and date of birth"""
    
    application = db.query(Application).filter(
        Application.id == status_check.application_id,
        Application.date_of_birth == status_check.date_of_birth
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=404, 
            detail="Application not found or invalid credentials"
        )
    
    # Calculate progress percentage
    progress_map = {
        ApplicationStatus.EINGEGANGEN: 10,
        ApplicationStatus.IN_BEARBEITUNG: 30,
        ApplicationStatus.NACHFRAGE: 45,
        ApplicationStatus.PRUEFUNG: 70,
        ApplicationStatus.ENTSCHEIDUNG: 85,
        ApplicationStatus.ABGESCHLOSSEN: 100,
        ApplicationStatus.ABGELEHNT: 100,
    }
    
    return ApplicationResponse(
        **application.__dict__,
        progress_percentage=progress_map.get(application.status, 0)
    )

@router.get("/{application_id}/history", response_model=List[StatusUpdateResponse])
async def get_application_history(
    application_id: str,
    date_of_birth: str,
    db: Session = Depends(get_db)
):
    """Get application status history"""
    
    # Verify access
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.date_of_birth == date_of_birth
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found or invalid credentials"
        )
    
    updates = db.query(StatusUpdate).filter(
        StatusUpdate.application_id == application_id
    ).order_by(StatusUpdate.created_at.desc()).all()
    
    return [StatusUpdateResponse(**update.__dict__) for update in updates]

@router.post("/{application_id}/upload-document")
async def upload_document(
    application_id: str,
    date_of_birth: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload document for application"""
    
    # Verify access
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.date_of_birth == date_of_birth
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found or invalid credentials"
        )
    
    # Validate file
    if file.size > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(
            status_code=413,
            detail="File too large. Maximum size is 10MB."
        )
    
    allowed_types = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']
    if not any(file.filename.lower().endswith(ext) for ext in allowed_types):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Allowed types: PDF, JPG, PNG, DOC, DOCX"
        )
    
    # TODO: Implement file saving logic
    # This would involve saving the file to disk/cloud storage
    # and creating a Document record in the database
    
    return {
        "message": "Document uploaded successfully",
        "filename": file.filename,
        "size": file.size
    }

@router.get("/{application_id}/documents")
async def get_application_documents(
    application_id: str,
    date_of_birth: str,
    db: Session = Depends(get_db)
):
    """Get list of documents for application"""
    
    # Verify access
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.date_of_birth == date_of_birth
    )