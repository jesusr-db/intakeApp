# Technical Design Document

## High-Level Design

### System Architecture
**Pattern:** Single-page application with REST API backend
**Data Flow:** Form submission → File processing → Volume storage → Metadata persistence
**Storage:** Databricks Volumes for files + JSON metadata

### Technology Stack

**Backend (FastAPI):**
- `FastAPI` - REST API with multipart file upload support
- `databricks-sdk` - Volume operations and workspace integration
- `python-multipart` - File upload handling
- `pydantic` - Data validation and serialization
- `pathlib` - File system operations
- `datetime` - Timestamp generation

**Frontend (React + shadcn/ui):**
- `React` - Component-based UI framework
- `React Hook Form` - Form state management and validation
- `shadcn/ui` - Pre-built UI components (Button, Input, Select, Card)
- `React Query` - API state management and upload progress
- `date-fns` - Date formatting and manipulation

### Libraries and Frameworks

**New Dependencies to Add:**
```bash
# Backend
uv add python-multipart databricks-sdk

# Frontend  
bun add react-hook-form @hookform/resolvers zod react-query date-fns
```

**shadcn/ui Components to Install:**
```bash
npx shadcn@latest add form select textarea label progress
```

### Data Architecture

**File Storage Structure:**
```
/volumes/main/default/intake/
├── project-name-1/
│   └── 2025-01-30/
│       ├── data_structured_20250130_143022.csv
│       ├── metadata_data_structured_20250130_143022.json
│       └── ...
└── project-name-2/
    └── 2025-01-29/
        ├── report_pdf_20250129_091015.pdf
        ├── metadata_report_pdf_20250129_091015.json
        └── ...
```

**Metadata JSON Schema:**
```json
{
  "upload_info": {
    "timestamp": "2025-01-30T14:30:22Z",
    "uploader": "jesus.rodriguez@databricks.com",
    "original_filename": "marketing_data.csv",
    "stored_filename": "data_structured_20250130_143022.csv",
    "file_path": "/volumes/main/default/intake/project-name-1/2025-01-30/"
  },
  "technical_metadata": {
    "file_size_bytes": 1048576,
    "file_format": "csv",
    "workflow_type": "structured",
    "processing_requirements": ["cleaning-needed", "validation-required"]
  },
  "research_metadata": {
    "project_name": "Consumer Behavior Q1 2025",
    "hypothesis": "Social media ads increase purchase intent",
    "data_source": "survey",
    "collection_method": "online",
    "experiment_id": "EXP-2025-001",
    "date_range": {
      "start": "2025-01-15",
      "end": "2025-01-28"
    },
    "research_phase": "raw-data",
    "privacy_level": "internal"
  }
}
```

### Integration Points

**Databricks SDK Integration:**
- Volume API for file storage operations
- Workspace API for authentication context
- Error handling for volume access permissions

**Authentication Flow:**
- Inherit from existing FastAPI user authentication
- Pass through Databricks workspace context
- Validate volume write permissions

## Implementation Plan

### Phase 1: Core Upload Workflow (MVP)

**1.1: Backend API Foundation**
- Create `FileUploadRouter` in `server/routers/upload.py`
- Implement `/api/upload` POST endpoint with multipart support
- Add basic file validation (size, type, name)
- Implement simple folder structure (`/volume/project-name/`)

**1.2: Volume Integration**
- Add Databricks SDK volume client setup
- Implement file write operations to volume
- Create basic metadata JSON generation
- Add error handling for volume operations

**1.3: Frontend Upload Form**
- Replace WelcomePage with UploadPage component
- Implement form with required fields (project name, hypothesis, data source)
- Add file input with basic validation
- Create upload submission with progress indication

**1.4: Success Confirmation**
- Implement upload success page
- Display file location and basic metadata
- Add error handling and user feedback

### Phase 2: Enhanced Metadata & Organization

**2.1: Complete Metadata Collection**
- Add all optional research metadata fields
- Implement dropdown components with predefined options
- Add date range picker for research dates
- Create processing requirements checkboxes

**2.2: Advanced File Organization**
- Implement date-based folder structure (`/project-name/yyyy-mm-dd/`)
- Add file naming convention with metadata suffix
- Create comprehensive metadata JSON schema
- Add metadata validation and sanitization

**2.3: Upload Enhancements**
- Add file preview/info before upload
- Implement upload progress tracking with React Query
- Add file type-specific validation rules
- Create batch validation for multiple fields

### Phase 3: User Experience Polish

**3.1: Form Validation & UX**
- Add real-time form validation with zod schema
- Implement field-level error messages
- Add form auto-save to prevent data loss
- Create tooltip help for complex fields

**3.2: Upload Flow Optimization**
- Add upload progress indicators
- Implement file size and type warnings
- Create metadata preview before final submission
- Add confirmation dialog for large files

**3.3: Error Handling & Recovery**
- Comprehensive error boundary implementation
- Network error recovery with retry logic
- Volume permission error messaging
- Upload failure recovery options

## Development Workflow

### File Structure (Additive Changes)
```
server/
├── routers/
│   ├── user.py (existing)
│   └── upload.py (NEW)
├── services/
│   ├── user_service.py (existing)
│   ├── upload_service.py (NEW)
│   └── volume_service.py (NEW)
└── models/
    └── upload_models.py (NEW)

client/src/
├── pages/
│   ├── WelcomePage.tsx (REPLACE)
│   ├── UploadPage.tsx (NEW)
│   └── SuccessPage.tsx (NEW)
├── components/
│   ├── forms/
│   │   ├── UploadForm.tsx (NEW)
│   │   ├── MetadataForm.tsx (NEW)
│   │   └── FileInput.tsx (NEW)
│   └── ui/ (existing shadcn components + new ones)
└── hooks/
    └── useUpload.ts (NEW)
```

### Implementation Steps

**Step 1: Setup & Dependencies**
1. Add backend dependencies (python-multipart, databricks-sdk)
2. Add frontend dependencies (react-hook-form, zod, date-fns)
3. Install additional shadcn/ui components
4. Update FastAPI app to include new upload router

**Step 2: Backend Implementation**
1. Create upload models and validation schemas
2. Implement volume service for Databricks integration
3. Create upload service with file processing logic
4. Build upload router with comprehensive error handling

**Step 3: Frontend Implementation**
1. Replace WelcomePage with new UploadPage
2. Create reusable form components with shadcn/ui
3. Implement upload hook with React Query
4. Add success page with metadata display

**Step 4: Integration & Testing**
1. Test file upload end-to-end workflow
2. Validate metadata JSON generation
3. Verify volume folder structure creation
4. Test error scenarios and recovery

### Volume Setup Requirements

**Before Implementation:**
1. Create volume in Databricks: `/volumes/main/default/intake/`
2. Verify volume write permissions for app service account
3. Test volume accessibility from workspace context
4. Configure volume path in environment variables

**Environment Variables to Add:**
```bash
# Add to .env.local
DATABRICKS_VOLUME_PATH=/volumes/main/default/intake
MAX_FILE_SIZE_MB=100
ALLOWED_FILE_TYPES=csv,json,pdf,xlsx,txt
```

This design provides a complete roadmap for implementing the marketing research intake app with proper Databricks integration and clean user experience.