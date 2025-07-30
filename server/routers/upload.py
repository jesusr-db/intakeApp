"""Upload router for handling file upload endpoints."""

from typing import Dict

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.security import HTTPBearer

from server.models.upload_models import (
    FileUploadRequest,
    FileUploadResponse,
    PrivacyLevel,
    ProcessingRequirement,
    ResearchMetadata,
    ResearchPhase,
    TechnicalMetadata,
    WorkflowType,
    DateRange
)
from server.services.upload_service import UploadService
from server.services.user_service import UserService


router = APIRouter(prefix="/upload", tags=["upload"])
security = HTTPBearer()


async def get_current_user():
    """Get current user dependency for FastAPI."""
    user_service = UserService()
    return user_service.get_current_user()


def parse_form_data(
    # Required research metadata
    project_name: str = Form(..., description="Name of the research project"),
    hypothesis: str = Form(..., description="Research hypothesis or question"),
    data_source: str = Form(..., description="Source of the research data"),
    collection_method: str = Form(..., description="Method used to collect data"),
    
    # Required technical metadata
    workflow_type: WorkflowType = Form(..., description="Type of workflow for this file"),
    
    # Optional research metadata
    experiment_id: str = Form(None, description="Experiment identifier"),
    date_range_start: str = Form(None, description="Start date (YYYY-MM-DD)"),
    date_range_end: str = Form(None, description="End date (YYYY-MM-DD)"),
    research_phase: ResearchPhase = Form(None, description="Current research phase"),
    privacy_level: PrivacyLevel = Form(None, description="Privacy/sensitivity level"),
    
    # Optional technical metadata (processing requirements as comma-separated string)
    processing_requirements: str = Form("", description="Comma-separated processing requirements")
) -> FileUploadRequest:
    """Parse form data into structured upload request."""
    
    # Parse date range
    date_range = None
    if date_range_start or date_range_end:
        date_range = DateRange(start=date_range_start, end=date_range_end)
    
    # Parse processing requirements
    proc_reqs = []
    if processing_requirements.strip():
        req_list = [req.strip() for req in processing_requirements.split(',')]
        for req in req_list:
            try:
                proc_reqs.append(ProcessingRequirement(req))
            except ValueError:
                # Skip invalid processing requirements
                continue
    
    # Create research metadata
    research_metadata = ResearchMetadata(
        project_name=project_name,
        hypothesis=hypothesis,
        data_source=data_source,
        collection_method=collection_method,
        experiment_id=experiment_id,
        date_range=date_range,
        research_phase=research_phase,
        privacy_level=privacy_level
    )
    
    # Create technical metadata
    technical_metadata = TechnicalMetadata(
        workflow_type=workflow_type,
        processing_requirements=proc_reqs
    )
    
    return FileUploadRequest(
        research_metadata=research_metadata,
        technical_metadata=technical_metadata
    )


@router.post("/", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(..., description="File to upload"),
    upload_request: FileUploadRequest = Depends(parse_form_data),
    current_user = Depends(get_current_user)
) -> FileUploadResponse:
    """
    Upload a file with research and technical metadata.
    
    This endpoint accepts a file upload along with comprehensive metadata
    and stores both the file and metadata in the configured Databricks volume.
    """
    upload_service = UploadService()
    
    # Get user email for upload tracking
    uploader_email = getattr(current_user, 'email', 'unknown@databricks.com')
    
    try:
        response = await upload_service.process_upload(
            file=file,
            upload_request=upload_request,
            uploader_email=uploader_email
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/config")
async def get_upload_config(
    current_user = Depends(get_current_user)
) -> Dict:
    """Get upload configuration and limits."""
    upload_service = UploadService()
    return upload_service.get_upload_stats()


@router.get("/options")
async def get_form_options() -> Dict:
    """Get available options for form dropdowns."""
    return {
        "workflow_types": [{"value": item.value, "label": item.value.upper()} for item in WorkflowType],
        "research_phases": [{"value": item.value, "label": item.value.replace('_', ' ').title()} for item in ResearchPhase],
        "privacy_levels": [{"value": item.value, "label": item.value.title()} for item in PrivacyLevel],
        "processing_requirements": [{"value": item.value, "label": item.value.replace('_', ' ').title()} for item in ProcessingRequirement]
    }