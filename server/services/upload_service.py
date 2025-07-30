"""Upload service for handling file uploads and metadata processing."""

import os
from datetime import datetime
from typing import BinaryIO

from fastapi import HTTPException, UploadFile

from server.models.upload_models import (
    FileUploadRequest,
    FileUploadResponse, 
    TechnicalMetadata,
    UploadInfo,
    UploadMetadata
)
from server.services.volume_service import VolumeService


class UploadService:
    """Service for handling file uploads and metadata processing."""
    
    def __init__(self):
        """Initialize upload service."""
        self.volume_service = VolumeService()
        self.max_file_size = int(os.getenv('MAX_FILE_SIZE_MB', '100')) * 1024 * 1024  # Convert MB to bytes
        self.allowed_types = os.getenv('ALLOWED_FILE_TYPES', 'csv,json,pdf,xlsx,txt').split(',')
    
    def _validate_file(self, file: UploadFile) -> None:
        """Validate uploaded file."""
        # Check file size
        if file.size and file.size > self.max_file_size:
            max_mb = self.max_file_size / (1024 * 1024)
            raise HTTPException(
                status_code=413,
                detail=f"File size exceeds maximum allowed size of {max_mb}MB"
            )
        
        # Check file type
        if file.filename:
            file_extension = file.filename.split('.')[-1].lower()
            if file_extension not in self.allowed_types:
                raise HTTPException(
                    status_code=400,
                    detail=f"File type '.{file_extension}' is not allowed. Allowed types: {', '.join(self.allowed_types)}"
                )
    
    def _extract_technical_metadata(self, file: UploadFile, technical_metadata: TechnicalMetadata) -> dict:
        """Extract technical metadata from the uploaded file."""
        file_extension = ''
        if file.filename:
            file_extension = file.filename.split('.')[-1].lower()
        
        return {
            'file_size_bytes': file.size or 0,
            'file_format': file_extension,
            'workflow_type': technical_metadata.workflow_type.value,
            'processing_requirements': [req.value for req in technical_metadata.processing_requirements]
        }
    
    def _create_upload_info(
        self, 
        file: UploadFile, 
        stored_filename: str, 
        file_path: str,
        uploader_email: str
    ) -> UploadInfo:
        """Create upload information object."""
        file_extension = ''
        if file.filename:
            file_extension = file.filename.split('.')[-1].lower()
        
        return UploadInfo(
            timestamp=datetime.utcnow(),
            uploader=uploader_email,
            original_filename=file.filename or 'unknown',
            stored_filename=stored_filename,
            file_path=file_path,
            file_size_bytes=file.size or 0,
            file_format=file_extension
        )
    
    async def process_upload(
        self, 
        file: UploadFile, 
        upload_request: FileUploadRequest,
        uploader_email: str
    ) -> FileUploadResponse:
        """
        Process the complete file upload workflow.
        
        Args:
            file: The uploaded file
            upload_request: Upload request with metadata
            uploader_email: Email of the user uploading the file
            
        Returns:
            FileUploadResponse: Response with upload details
        """
        try:
            # Validate the file
            self._validate_file(file)
            
            # Read file content
            file_content = await file.read()
            file.file.seek(0)  # Reset file pointer for potential re-reads
            
            # Upload file to volume
            from io import BytesIO
            file_stream = BytesIO(file_content)
            
            stored_filename, file_path = self.volume_service.upload_file(
                file_content=file_stream,
                original_filename=file.filename or 'unknown',
                project_name=upload_request.research_metadata.project_name,
                workflow_type=upload_request.technical_metadata.workflow_type.value
            )
            
            # Create upload info
            upload_info = self._create_upload_info(
                file=file,
                stored_filename=stored_filename,
                file_path=file_path,
                uploader_email=uploader_email
            )
            
            # Create complete metadata object
            metadata = UploadMetadata(
                upload_info=upload_info,
                technical_metadata=upload_request.technical_metadata,
                research_metadata=upload_request.research_metadata
            )
            
            # Save metadata to volume
            metadata_path = self.volume_service.save_metadata(metadata, file_path)
            
            # Return success response
            return FileUploadResponse(
                upload_info=upload_info,
                research_metadata=upload_request.research_metadata,
                technical_metadata=upload_request.technical_metadata,
                metadata_file_path=metadata_path
            )
            
        except HTTPException:
            # Re-raise HTTP exceptions as-is
            raise
        except Exception as e:
            # Convert other exceptions to HTTP exceptions
            raise HTTPException(
                status_code=500,
                detail=f"Upload failed: {str(e)}"
            )
    
    def get_upload_stats(self) -> dict:
        """Get basic upload statistics."""
        # This could be expanded to track actual statistics
        return {
            'max_file_size_mb': self.max_file_size / (1024 * 1024),
            'allowed_file_types': self.allowed_types,
            'volume_path': self.volume_service.volume_path
        }