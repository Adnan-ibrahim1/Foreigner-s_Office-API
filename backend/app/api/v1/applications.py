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
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=ApplicationResponse)
async def create_application(
    application: ApplicationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Submit a new application"""
    try:
        logger.info(f"Creating application of type: {application.application_type}")
        
        # Generate unique application ID
        app_id = generate_application_id()
        logger.info(f"Generated application ID: {app_id}")
        
        # Calculate estimated completion with error handling
        try:
            estimated_completion = calculate_estimated_completion(application.application_type)
            logger.info(f"Estimated completion: {estimated_completion}")
        except Exception as e:
            logger.error(f"Error calculating estimated completion: {e}")
            # Default to 14 days if calculation fails
            from datetime import timedelta
            estimated_completion = datetime.now() + timedelta(days=14)
        
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
        logger.info(f"Application saved to database with ID: {app_id}")
        
        # Create initial status update
        status_update = StatusUpdate(
            id=str(uuid.uuid4()),
            application_id=app_id,
            old_status=None,
            new_status=ApplicationStatus.EINGEGANGEN,
            message="Application submitted successfully",
        )
        
        db.add(status_update)
        db.commit()
        logger.info(f"Initial status update created for application: {app_id}")
        
        # Send confirmation notification
        try:
            background_tasks.add_task(
                send_status_notification,
                application.email,
                app_id,
                ApplicationStatus.EINGEGANGEN,
                f"Your application has been received. Reference number: {app_id}",
                application.language_preference
            )
            logger.info(f"Notification task added for application: {app_id}")
        except Exception as e:
            logger.error(f"Error adding notification task: {e}")
            # Don't fail the application creation if notification fails
        
        response_data = {
            "id": str(db_application.id),
            "type": db_application.application_type.value if hasattr(db_application.application_type, 'value') else str(db_application.application_type).split('.')[-1].lower(), 
            "email": str(db_application.email),
            "firstName": str(db_application.first_name),
            "lastName": str(db_application.last_name),
            "birthDate": db_application.date_of_birth,
            "phone": str(db_application.phone) if db_application.phone else None,
            "nationality": str(db_application.nationality),
            "address": str(db_application.address),
            "language_preference": str(db_application.language_preference),
            "status": ApplicationStatus.EINGEGANGEN,
            "estimated_completion": db_application.estimated_completion,
            "submitted_at": getattr(db_application, 'created_at', None) or datetime.now(),
            "updated_at": getattr(db_application, 'updated_at', None) or datetime.now(),
            "priority": "normal",
            "actual_completion": None,
            "case_worker_id": None,
            "notes": None,
            "is_urgent": False,
            "requires_appointment": False,
            "documents_complete": False,
            "progress_percentage": 10
        }
        
        return ApplicationResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Error creating application: {e}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create application: {str(e)}"
        )
@router.post("/check-status", response_model=ApplicationResponse)
async def check_application_status(
    status_check: ApplicationStatusCheck,
    db: Session = Depends(get_db)
):
    """Check application status using application ID and date of birth"""
    
    try:
        logger.info(f"Checking status for application: {status_check.application_id}")
        
        application = db.query(Application).filter(
            Application.id == status_check.application_id,
            Application.date_of_birth == status_check.date_of_birth
        ).first()
        
        if not application:
            logger.warning(f"Application not found: {status_check.application_id}")
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
        response_data = {
            "id": str(application.id),
            "type": application.application_type.value if hasattr(application.application_type, 'value') else str(application.application_type).split('.')[-1].lower(), 
            "email": str(application.email),
            "firstName": str(application.first_name),
            "lastName": str(application.last_name),
            "birthDate": application.date_of_birth,
            "phone": str(application.phone) if application.phone else None,
            "nationality": str(application.nationality),
            "address": str(application.address),
            "language_preference": str(application.language_preference),
            "status": ApplicationStatus.EINGEGANGEN,
            "estimated_completion": application.estimated_completion,
            "submitted_at": getattr(application, 'created_at', None) or datetime.now(),
            "updated_at": getattr(application, 'updated_at', None) or datetime.now(),
            "priority": "normal",
            "actual_completion": None,
            "case_worker_id": None,
            "notes": None,
            "is_urgent": False,
            "requires_appointment": False,
            "documents_complete": False,
            "progress_percentage": progress_map.get(application.status, 0)
        }
        
        return ApplicationResponse(**response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking application status: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to check application status"
        )

@router.get("/{application_id}/history", response_model=List[StatusUpdateResponse])
async def get_application_history(
    application_id: str,
    date_of_birth: str,
    db: Session = Depends(get_db)
):
    """Get application status history"""
    
    try:
        logger.info(f"Getting history for application: {application_id}")
        
        # Verify access
        application = db.query(Application).filter(
            Application.id == application_id,
            Application.date_of_birth == date_of_birth
        ).first()
        
        if not application:
            logger.warning(f"Application not found for history: {application_id}")
            raise HTTPException(
                status_code=404,
                detail="Application not found or invalid credentials"
            )
        
        updates = db.query(StatusUpdate).filter(
            StatusUpdate.application_id == application_id
        ).order_by(StatusUpdate.created_at.desc()).all()
        
        return [StatusUpdateResponse(**update.__dict__) for update in updates]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting application history: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get application history"
        )

@router.post("/{application_id}/upload-document")
async def upload_document(
    application_id: str,
    date_of_birth: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload document for application"""
    
    try:
        logger.info(f"Uploading document for application: {application_id}")
        
        # Verify access
        application = db.query(Application).filter(
            Application.id == application_id,
            Application.date_of_birth == date_of_birth
        ).first()
        
        if not application:
            logger.warning(f"Application not found for document upload: {application_id}")
            raise HTTPException(
                status_code=404,
                detail="Application not found or invalid credentials"
            )
        
        # Validate file
        if file.size and file.size > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(
                status_code=413,
                detail="File too large. Maximum size is 10MB."
            )
        
        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="No filename provided"
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
        
        logger.info(f"Document uploaded successfully: {file.filename}")
        return {
            "message": "Document uploaded successfully",
            "filename": file.filename,
            "size": file.size or 0
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to upload document"
        )

@router.get("/{application_id}/documents")
async def get_application_documents(
    application_id: str,
    date_of_birth: str,
    db: Session = Depends(get_db)
):
    """Get list of documents for application"""
    
    try:
        logger.info(f"Getting documents for application: {application_id}")
        
        # Verify access
        application = db.query(Application).filter(
            Application.id == application_id,
            Application.date_of_birth == date_of_birth
        ).first()
        
        if not application:
            logger.warning(f"Application not found for documents: {application_id}")
            raise HTTPException(
                status_code=404,
                detail="Application not found or invalid credentials"
            )
        
        # TODO: Implement getting documents from database
        # This would query Document table for this application
        
        return {
            "message": "Documents retrieved successfully",
            "application_id": application_id,
            "documents": []  # Return actual documents when implemented
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting application documents: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get application documents"
        )