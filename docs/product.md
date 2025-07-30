# Product Requirements Document

## Executive Summary

**Problem Statement:** Marketing researchers (internal and external) need a streamlined way to upload research files to Databricks volumes with proper metadata collection for both research context and technical processing requirements.

**Solution:** A beautiful, minimalistic intake workflow app that provides a single-form interface for file uploads with automated technical metadata collection and structured research metadata capture.

## Target Users

**Primary Users:** Marketing researchers (internal and external teams)
- Upload frequency: Per-project basis (not daily routine)
- Technical expertise: Mixed (some technical, some non-technical)
- Primary goal: Quick, organized file submission with proper documentation

**User Workflow:**
1. Researcher completes a marketing study
2. Needs to upload study data/results to Databricks for analysis
3. Wants to provide context about the research for future reference
4. Expects files to be properly organized and findable

## Core Features

### 1. File Upload Interface
- **Clean, single-form design** (no drag-and-drop complexity)
- **Traditional file input** with browse button
- **File type support:** CSV, JSON, PDF, structured data files
- **File size limit:** Optimized for MB-range files
- **Single file per upload** (focused workflow)

### 2. Research Metadata Collection
**Required Fields:**
- Project name (free-text entry)
- Hypothesis/research question (text area)
- Data source (dropdown: survey, interview, experiment, external, other)
- Collection method (dropdown: online, in-person, automated, third-party)

**Optional Fields:**
- Experiment ID (text input)
- Date range (date picker range)
- Research phase (dropdown: raw-data, processed, analysis, results)
- Privacy level (dropdown: public, internal, confidential)

### 3. Technical Metadata
**Automatic Detection:**
- File size (bytes)
- File format (extension-based)
- Upload timestamp
- Uploader information (from auth)

**User-Selected:**
- Workflow type (dropdown: structured, csv, json, pdf)
- Processing requirements (checkbox: cleaning-needed, validation-required, transformation-ready)

### 4. File Organization & Storage
**Folder Structure:** `/volume/project-name/yyyy-mm-dd/`
**File Naming Convention:** `original-name_workflow-type_timestamp.extension`
**Metadata Output:** One JSON file per upload containing all metadata

### 5. Upload Confirmation
- **Success page** showing file location and metadata summary
- **Validation messages** for required fields and file type compatibility
- **Direct link** to uploaded file location in Databricks

## Success Metrics

**Primary Success Indicators:**
- Upload completion rate (target: >95%)
- Time to complete upload workflow (target: <3 minutes)
- Metadata completeness (target: >90% of optional fields filled)

**User Experience Metrics:**
- User satisfaction with interface simplicity
- Reduced support requests about file organization
- Increased research data discoverability

**Technical Metrics:**
- Successful volume writes (target: 99.9%)
- JSON metadata validation success
- File accessibility post-upload

## Implementation Priority

### Phase 1: Core Upload Workflow (MVP)
1. Basic file upload to Databricks volume
2. Essential research metadata form (project name, hypothesis, data source)
3. Automatic technical metadata detection
4. Simple folder organization by project name
5. Upload success confirmation

### Phase 2: Enhanced Metadata & Organization
1. Complete research metadata fields
2. Advanced folder structure with date organization
3. File naming convention implementation
4. JSON metadata file generation
5. Validation and error handling

### Phase 3: User Experience Polish
1. Form validation and user feedback
2. Upload progress indicators
3. Metadata preview before submission
4. File accessibility verification
5. Responsive design optimization

## User Stories

**As a marketing researcher, I want to:**
- Upload my study data quickly without complex technical setup
- Provide research context so others can understand my work
- Know that my files are properly organized and findable
- Have confidence that my upload was successful

**As a data analyst, I want to:**
- Find research files easily using metadata
- Understand the context and processing requirements for each dataset
- Access both the raw data and research documentation
- Trust that technical metadata is accurate and complete