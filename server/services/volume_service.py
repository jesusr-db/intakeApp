"""Databricks Volume service for file operations."""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import BinaryIO

from databricks.sdk import WorkspaceClient
from databricks.sdk.service.files import DirectoryEntry

from server.models.upload_models import UploadMetadata


class VolumeService:
    """Service for interacting with Databricks Volumes."""
    
    def __init__(self):
        """Initialize the volume service with Databricks client."""
        # Configure client with environment variables
        config = {}
        
        if os.getenv('DATABRICKS_CONFIG_PROFILE'):
            config['profile'] = os.getenv('DATABRICKS_CONFIG_PROFILE')
        
        if os.getenv('DATABRICKS_HOST'):
            config['host'] = os.getenv('DATABRICKS_HOST')
            
        if os.getenv('DATABRICKS_TOKEN'):
            config['token'] = os.getenv('DATABRICKS_TOKEN')
        
        self.client = WorkspaceClient(**config)
        self.volume_path = os.getenv('DATABRICKS_VOLUME_PATH', '/Volumes/jmr_demo/intake/storage')
        
    def _sanitize_folder_name(self, name: str) -> str:
        """Sanitize folder name for file system compatibility."""
        # Replace spaces with hyphens, remove special characters
        import re
        sanitized = re.sub(r'[^\w\s-]', '', name).strip()
        sanitized = re.sub(r'[-\s]+', '-', sanitized)
        return sanitized.lower()
    
    def _generate_filename(self, original_filename: str, workflow_type: str) -> str:
        """Generate a unique filename with metadata suffix."""
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        
        # Extract filename without extension
        name_parts = original_filename.rsplit('.', 1)
        base_name = name_parts[0]
        extension = name_parts[1] if len(name_parts) > 1 else ''
        
        # Create new filename
        new_name = f"{base_name}_{workflow_type}_{timestamp}"
        if extension:
            new_name += f".{extension}"
            
        return new_name
    
    def _get_project_folder_path(self, project_name: str) -> str:
        """Get the folder path for a project with date organization."""
        sanitized_project = self._sanitize_folder_name(project_name)
        date_folder = datetime.utcnow().strftime('%Y-%m-%d')
        return f"{self.volume_path}/{sanitized_project}/{date_folder}"
    
    def create_project_folder(self, project_name: str) -> str:
        """Create project folder structure if it doesn't exist."""
        folder_path = self._get_project_folder_path(project_name)
        
        try:
            # Create directory structure
            self.client.files.create_directory(folder_path)
            return folder_path
        except Exception as e:
            # Directory might already exist, which is fine
            if "already exists" not in str(e).lower():
                raise Exception(f"Failed to create project folder: {str(e)}")
            return folder_path
    
    def upload_file(
        self, 
        file_content: BinaryIO, 
        original_filename: str,
        project_name: str,
        workflow_type: str
    ) -> tuple[str, str]:
        """
        Upload file to the volume.
        
        Returns:
            tuple: (stored_filename, full_file_path)
        """
        # Create project folder structure
        folder_path = self.create_project_folder(project_name)
        
        # Generate unique filename
        stored_filename = self._generate_filename(original_filename, workflow_type)
        full_file_path = f"{folder_path}/{stored_filename}"
        
        try:
            # Upload file to volume
            self.client.files.upload(full_file_path, file_content, overwrite=True)
            return stored_filename, full_file_path
        except Exception as e:
            raise Exception(f"Failed to upload file to volume: {str(e)}")
    
    def save_metadata(self, metadata: UploadMetadata, file_path: str) -> str:
        """
        Save metadata as JSON file alongside the uploaded file.
        
        Returns:
            str: Path to the metadata JSON file
        """
        # Generate metadata filename
        path_parts = file_path.rsplit('/', 1)
        folder_path = path_parts[0]
        filename = path_parts[1]
        
        # Remove extension and add metadata prefix
        name_parts = filename.rsplit('.', 1)
        base_name = name_parts[0]
        metadata_filename = f"metadata_{base_name}.json"
        metadata_path = f"{folder_path}/{metadata_filename}"
        
        try:
            # Convert metadata to JSON with proper datetime handling
            import json
            from datetime import datetime
            
            def json_serializer(obj):
                """Custom JSON serializer for datetime objects."""
                if isinstance(obj, datetime):
                    return obj.isoformat() + 'Z'
                raise TypeError(f"Object of type {type(obj)} is not JSON serializable")
            
            metadata_dict = metadata.model_dump()
            metadata_json = json.dumps(metadata_dict, indent=2, ensure_ascii=False, default=json_serializer)
            
            # Upload metadata JSON to volume
            from io import BytesIO
            metadata_bytes = BytesIO(metadata_json.encode('utf-8'))
            self.client.files.upload(metadata_path, metadata_bytes, overwrite=True)
            
            return metadata_path
        except Exception as e:
            raise Exception(f"Failed to save metadata: {str(e)}")
    
    def list_project_files(self, project_name: str, date: str = None) -> list[DirectoryEntry]:
        """
        List files in a project folder.
        
        Args:
            project_name: Name of the project
            date: Specific date folder (YYYY-MM-DD) or None for today
        """
        sanitized_project = self._sanitize_folder_name(project_name)
        if date is None:
            date = datetime.utcnow().strftime('%Y-%m-%d')
        
        folder_path = f"{self.volume_path}/{sanitized_project}/{date}"
        
        try:
            return self.client.files.list_directory_contents(folder_path)
        except Exception as e:
            if "does not exist" in str(e).lower():
                return []
            raise Exception(f"Failed to list project files: {str(e)}")
    
    def file_exists(self, file_path: str) -> bool:
        """Check if a file exists in the volume."""
        try:
            self.client.files.get_metadata(file_path)
            return True
        except Exception:
            return False
    
    def get_file_info(self, file_path: str) -> dict:
        """Get file information from the volume."""
        try:
            metadata = self.client.files.get_metadata(file_path)
            return {
                'path': metadata.path,
                'size_bytes': metadata.file_size,
                'modified_at': metadata.modification_time
            }
        except Exception as e:
            raise Exception(f"Failed to get file info: {str(e)}")