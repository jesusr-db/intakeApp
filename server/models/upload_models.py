"""Upload models and validation schemas for the intake app."""

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, validator


# Data source and collection method are now free-text fields
# Removed DataSource and CollectionMethod enums


class ResearchPhase(str, Enum):
    """Research phase options."""
    RAW_DATA = "raw-data"
    PROCESSED = "processed"
    ANALYSIS = "analysis"
    RESULTS = "results"


class PrivacyLevel(str, Enum):
    """Privacy level options."""
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"


class WorkflowType(str, Enum):
    """File workflow type options based on accepted file formats."""
    CSV = "csv"
    JSON = "json"
    PDF = "pdf"
    XLSX = "xlsx"
    TXT = "txt"


class ProcessingRequirement(str, Enum):
    """Processing requirement options."""
    CLEANING_NEEDED = "cleaning-needed"
    VALIDATION_REQUIRED = "validation-required"
    TRANSFORMATION_READY = "transformation-ready"


class DateRange(BaseModel):
    """Date range for research data."""
    start: Optional[str] = Field(None, description="Start date in YYYY-MM-DD format")
    end: Optional[str] = Field(None, description="End date in YYYY-MM-DD format")


class ResearchMetadata(BaseModel):
    """Research-specific metadata for uploaded files."""
    project_name: str = Field(..., min_length=1, max_length=200, description="Project name")
    hypothesis: str = Field(..., min_length=1, max_length=1000, description="Research hypothesis or question")
    data_source: str = Field(..., min_length=1, max_length=200, description="Source of the research data")
    collection_method: str = Field(..., min_length=1, max_length=200, description="Method used to collect data")
    
    # Optional fields
    experiment_id: Optional[str] = Field(None, max_length=100, description="Experiment identifier")
    date_range: Optional[DateRange] = Field(None, description="Date range for data collection")
    research_phase: Optional[ResearchPhase] = Field(None, description="Current research phase")
    privacy_level: Optional[PrivacyLevel] = Field(None, description="Privacy/sensitivity level")

    @validator('project_name')
    def validate_project_name(cls, v):
        """Validate project name for folder safety."""
        # Remove or replace characters that could cause issues in folder names
        import re
        if not re.match(r'^[a-zA-Z0-9\s\-_]+$', v):
            raise ValueError('Project name can only contain letters, numbers, spaces, hyphens, and underscores')
        return v.strip()


class TechnicalMetadata(BaseModel):
    """Technical metadata for uploaded files."""
    workflow_type: WorkflowType = Field(..., description="Type of workflow for this file")
    processing_requirements: List[ProcessingRequirement] = Field(
        default_factory=list, 
        description="Processing requirements for this file"
    )


class UploadInfo(BaseModel):
    """Upload-specific information."""
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Upload timestamp")
    uploader: str = Field(..., description="Email of the person uploading")
    original_filename: str = Field(..., description="Original filename")
    stored_filename: str = Field(..., description="Filename as stored in volume")
    file_path: str = Field(..., description="Full path where file is stored")
    file_size_bytes: int = Field(..., gt=0, description="File size in bytes")
    file_format: str = Field(..., description="File format/extension")


class FileUploadRequest(BaseModel):
    """Complete file upload request."""
    research_metadata: ResearchMetadata
    technical_metadata: TechnicalMetadata


class FileUploadResponse(BaseModel):
    """Response after successful file upload."""
    success: bool = True
    message: str = "File uploaded successfully"
    upload_info: UploadInfo
    research_metadata: ResearchMetadata
    technical_metadata: TechnicalMetadata
    metadata_file_path: str = Field(..., description="Path to the metadata JSON file")


class UploadMetadata(BaseModel):
    """Complete metadata structure saved to JSON file."""
    upload_info: UploadInfo
    technical_metadata: TechnicalMetadata
    research_metadata: ResearchMetadata
    
    class Config:
        """Pydantic config."""
        json_encoders = {
            datetime: lambda v: v.isoformat() + 'Z'
        }