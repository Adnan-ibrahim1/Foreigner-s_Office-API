from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.application import Application, StatusUpdate, ApplicationStatus, ApplicationType, Priority
from app.models.user import User
from app.schemas.application import (
    ApplicationResponse, ApplicationUpdate, StatusUpdateCreate, 
    ApplicationSummary, ApplicationList
)
from app.api.deps import get_current_staff_user, get_current_supervisor_user
from app.core.notifications import send_status_notification
from app.utils.helpers import calculate_progress_percentage
import uuid

router = APIRouter()

@router.get("/dashboard", response_model=ApplicationSummary)
async def get_dashboard_summary(
    current_user: User = Depends(get_current_staff_user),
    db: Session = Depends(get_db)
):
    """Get dashboard summary statistics"""
    
    # Base query - supervisors see all, staff see only assigned
    base_query = db.query(Application)
    if current_user.role.value == "staff":
        base_query = base_query.filter(Application.case_worker_id == current_user.id)
    
    # Total applications
    total_applications = base_query.count()
    
    # Pending applications (not completed or rejected)
    pending_applications = base_query.filter(
        and_(
            Application.status != ApplicationStatus.ABGESCHLOSSEN,
            Application.status != ApplicationStatus.ABGELEHNT
        )
    ).count()
    
    # Completed applications
    completed_applications = base_query.filter(
        Application.status == ApplicationStatus.ABGESCHLOSSEN
    ).count()
    
    # Urgent applications
    urgent_applications = base_query.filter(
        and_(
            Application.is_urgent == True,
            Application.status != ApplicationStatus.ABGESCHLOSSEN,
            Application.status != ApplicationStatus.ABGELEHNT
        )
    ).count()
    
    # Applications by status
    status_counts = db.query(
        Application.status,
        func.count(Application.id).label('count')
    ).group_by(Application.status)
    
    if current_user.role.value == "staff":
        status_counts = status_counts.filter(Application.case_worker_id == current_user.id)
    
    applications_by_status = {
        status.value: count for status, count in status_counts.all()
    }
    
    # Applications by type
    type_counts = db.query(
        Application.application_type,
        func.count(Application.id).label('count')
    ).group_by(Application.application_type)
    
    if current_user.role.value == "staff":
        type_counts = type_counts.filter(Application.case_worker_id == current_user.id)
    
    applications_by_type = {
        app_type.value: count for app_type, count in type_counts.all()
    }
    
    # Average processing time (completed applications in last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    completed_recent = base_query.filter(
        and_(
            Application.status == ApplicationStatus.ABGESCHLOSSEN,
            Application.actual_completion >= thirty_days_ago
        )
    ).all()
    
    if completed_recent:
        processing_times = [
            (app.actual_completion - app.submitted_at).days
            for app in completed_recent
            if app.actual_completion
        ]
        average_processing_time = sum(processing_times) / len(processing_times) if processing_times else 0
    else:
        average_processing_time = 0
    
    return ApplicationSummary(
        total_applications=total_applications,
        pending_applications=pending_applications,
        completed_applications=completed_applications,
        urgent_applications=urgent_applications,
        applications_by_status=applications_by_status,
        applications_by_type=applications_by_type,
        average_processing_time=average_processing_time
    )

@router.get("/applications", response_model=ApplicationList)
async def get_applications(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[ApplicationStatus] = None,
    application_type: Optional[ApplicationType] = None,
    priority: Optional[Priority] = None,
    is_urgent: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_staff_user),
    db: Session = Depends(get_db)
):
    """Get paginated list of applications"""
    
    # Base query
    query = db.query(Application)
    
    # Filter by user role
    if current_user.role.value == "staff":
        query = query.filter(Application.case_worker_id == current_user.id)
    
    # Apply filters
    if status:
        query = query.filter(Application.status == status)
    
    if application_type:
        query = query.filter(Application.application_type == application_type)
    
    if priority:
        query = query.filter(Application.priority == priority)
    
    if is_urgent is not None:
        query = query.filter(Application.is_urgent == is_urgent)
    
    if search:
        search_filter = or_(
            Application.id.ilike(f"%{search}%"),
            Application.first_name.ilike(f"%{search}%"),
            Application.last_name.ilike(f"%{search}%"),
            Application.email.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * per_page
    applications = query.order_by(
        Application.is_urgent.desc(),
        Application.submitted_at.desc()
    ).offset(offset).limit(per_page).all()
    
    # Convert to response format
    application_responses = [
        ApplicationResponse(
            **app.__dict__,
            progress_percentage=calculate_progress_percentage(app.status)
        )
        for app in applications
    ]
    
    return ApplicationList(
        applications=application_responses,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=(total + per_page - 1) // per_page
    )

@router.get("/applications/{application_id}", response_model=ApplicationResponse)
async def get_application_detail(
    application_id: str,
    current_user: User = Depends(get_current_staff_user),
    db: Session = Depends(get_db)
):
    """Get detailed application information"""
    
    application = db.query(Application).filter(Application.id == application_id).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check permissions
    if not current_user.can_access_application(application):
        raise HTTPException(status_code=403, detail="Access denied")
    
    return ApplicationResponse(
        **application.__dict__,
        progress_percentage=calculate_progress_percentage(application.status)
    )

@router.put("/applications/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: str,
    application_update: ApplicationUpdate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_staff_user),
    db: Session = Depends(get_db)
):
    """Update application details"""
    
    application = db.query(Application).filter(Application.id == application_id).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check permissions
    if not current_user.can_access_application(application):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Store old status for history
    old_status = application.status
    
    # Update fields
    update_data = application_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(application, field, value)
    
    application.updated_at = datetime.utcnow()
    
    # If status changed, create status update record
    if application_update.status and application_update.status != old_status:
        if application_update.status == ApplicationStatus.ABGESCHLOSSEN:
            application.actual_completion = datetime.utcnow()
    
    db.commit()
    db.refresh(application)
    
    return ApplicationResponse(
        **application.__dict__,
        progress_percentage=calculate_progress_percentage(application.status)
    )

@router.post("/applications/{application_id}/status")
async def update_application_status(
    application_id: str,
    status_update: StatusUpdateCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_staff_user),
    db: Session = Depends(get_db)
):
    """Update application status with notification"""
    
    application = db.query(Application).filter(Application.id == application_id).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check permissions
    if not current_user.can_access_application(application):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Store old status
    old_status = application.status
    
    # Update application status
    application.status = status_update.new_status
    application.updated_at = datetime.utcnow()
    
    # Set completion date if completed
    if status_update.new_status == ApplicationStatus.ABGESCHLOSSEN:
        application.actual_completion = datetime.utcnow()
    
    # Assign case worker if moving to in progress
    if status_update.new_status == ApplicationStatus.IN_BEARBEITUNG and not application.case_worker_id:
        application.case_worker_id = current_user.id
    
    db.commit()
    
    # Create status update record
    db_status_update = StatusUpdate(
        id=str(uuid.uuid4()),
        application_id=application_id,
        old_status=old_status,
        new_status=status_update.new_status,
        message=status_update.message,
    )
    
    db.add(db_status_update)
    db.commit()
    
    # Send notification
    background_tasks.add_task(
        send_status_notification,
        application.email,
        application_id,
        status_update.new_status,
        status_update.message,
        application.language_preference
    )
    
    return {"message": "Status updated successfully"}

@router.post("/applications/{application_id}/assign")
async def assign_application(
    application_id: str,
    case_worker_id: str,
    current_user: User = Depends(get_current_supervisor_user),
    db: Session = Depends(get_db)
):
    """Assign application to a case worker"""
    
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check if case worker exists
    case_worker = db.query(User).filter(User.id == case_worker_id).first()
    if not case_worker:
        raise HTTPException(status_code=404, detail="Case worker not found")
    
    # Update assignment
    old_worker_id = application.case_worker_id
    application.case_worker_id = case_worker_id
    application.updated_at = datetime.utcnow()
    
    # Move to in progress if still pending
    if application.status == ApplicationStatus.EINGEGANGEN:
        application.status = ApplicationStatus.IN_BEARBEITUNG
    
    db.commit()
    
    # Create status update record
    message = f"Application assigned to {case_worker.full_name}"
    status_update = StatusUpdate(
        id=str(uuid.uuid4()),
        application_id=application_id,
        old_status=application.status,
        new_status=application.status,
        message=message,
    )
    
    db.add(status_update)
    db.commit()
    
    return {"message": f"Application assigned to {case_worker.full_name}"}

@router.get("/applications/{application_id}/history")
async def get_application_status_history(
    application_id: str,
    current_user: User = Depends(get_current_staff_user),
    db: Session = Depends(get_db)
):
    """Get application status history"""
    
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check permissions
    if not current_user.can_access_application(application):
        raise HTTPException(status_code=403, detail="Access denied")
    
    updates = db.query(StatusUpdate).filter(
        StatusUpdate.application_id == application_id
    ).order_by(StatusUpdate.created_at.desc()).all()
    
    return [
        {
            "id": update.id,
            "old_status": update.old_status,
            "new_status": update.new_status,
            "message": update.message,
            "created_at": update.created_at
        }
        for update in updates
    ]

@router.get("/users")
async def get_staff_users(
    current_user: User = Depends(get_current_supervisor_user),
    db: Session = Depends(get_db)
):
    """Get list of staff users for assignment"""
    
    users = db.query(User).filter(
        User.status == "active"
    ).order_by(User.first_name, User.last_name).all()
    
    return [
        {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "department": user.department,
            "role": user.role.value
        }
        for user in users
    ]