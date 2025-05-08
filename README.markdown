# File Duplication Detector Web Application

## Overview
This web application is designed to assist teachers in detecting potential file upload abuse by analyzing and comparing the metadata of two student-submitted files to estimate the likelihood that one is a duplicate of the other. The application reports a percentage chance of duplication based on metadata similarities, helping identify cases where a student may have submitted a copied or slightly modified file as their own. Built using HTML, CSS, and JavaScript, it operates entirely client-side in the browser for simplicity and privacy.

## Goal
As a teacher, I need to identify when students submit files that may be duplicates of another student's work, often with minor modifications like renaming. This application allows me to upload two files, analyze their metadata (excluding creation date due to client-side limitations), and receive a percentage likelihood of duplication. The tool focuses on metadata attributes like file name, size, type, content hash, and EXIF data (for images) to flag potential academic misconduct.

## Analysis Approach
The application uses a client-side approach to extract metadata, compute a content hash, and calculate a duplication probability using a weighted scoring system. The analysis process includes:

1. **File Upload**:
   - Users upload two files via a web interface with separate file input fields.
   - The interface ensures both files are selected before enabling analysis.

2. **Metadata Extraction**:
   - For each file, the application extracts:
     - **Name**: The file's name as provided by the user.
     - **Size**: The file size in bytes.
     - **Type**: The MIME type (e.g., `image/jpeg`, `application/pdf`).
     - **Content Hash**: A SHA-256 hash of the file's content to detect identical files.
     - **EXIF Data**: For image files, EXIF metadata (e.g., camera model, date taken) using the `exif-js` library.
   - Non-image files have `EXIF Data` marked as `N/A`.

3. **Duplication Scoring**:
   - The application compares metadata attributes and assigns a duplication probability based on:
     - **Content Hash** (90% weight): Identical hashes indicate identical files.
     - **EXIF Data** (20% weight): Identical EXIF data suggests the same image source.
     - **Size** (15% weight): Identical sizes are common in duplicates.
     - **Name** (10% weight): Name similarity is calculated using Levenshtein distance (80%+ similarity contributes to the score).
     - **Type** (5% weight): Identical MIME types are a weak indicator.
   - A weighted score (0–100%) is computed, capped at 100%, reflecting the likelihood of duplication.

4. **Results Display**:
   - A table displays metadata side-by-side, with similar attributes highlighted in yellow.
   - A duplication probability percentage is shown prominently.
   - Warnings list specific indicators (e.g., identical hashes or similar names) or note if no significant duplication is detected.

## Technical Details
- **Technologies**:
  - **HTML**: Structures the interface with file inputs, an analyze button, a results table, and a score display.
  - **CSS**: Uses Tailwind CSS (via CDN) for responsive styling, with custom styles in `styles.css`.
  - **JavaScript**: Handles file input, metadata extraction, hashing, and scoring in `script.js`. Includes `exif-js` for EXIF parsing and `js-sha256` for content hashing.
- **Dependencies**:
  - Tailwind CSS (CDN)
  - `exif-js` (CDN)
  - `js-sha256` (CDN)
- **Client-Side Operation**: All processing occurs in the browser, ensuring no student data is sent to a server, prioritizing privacy but limiting metadata depth.

## Limitations
- **Metadata Scope**: The application analyzes basic metadata (name, size, type, hash) and EXIF data for images. Other file types (e.g., PDFs, DOCX) lack deep metadata parsing due to client-side constraints.
- **No Creation Date**: Client-side JavaScript cannot access true creation dates, so the application relies on other indicators like content hash and EXIF data.
- **Content Modifications**: Hashing detects identical files but not modified duplicates (e.g., a re-saved PDF with minor changes).
- **File Type Support**: EXIF extraction is image-specific. Other formats rely on basic metadata.
- **Scoring Subjectivity**: The weighted scoring system is heuristic-based and may require tuning for specific use cases.
- **Browser Compatibility**: Relies on `File` API, `crypto.subtle`, and modern browser features, which may vary in older browsers.

## Usage
1. Open `index.html` in a modern web browser.
2. Upload two files using the provided file input fields.
3. Click the "Analyze Files" button (enabled only when both files are selected).
4. Review the duplication probability, comparison table, and warnings to assess potential duplication.

## Future Improvements
- **Extended Metadata Parsing**: Add libraries like `pdf.js` for PDFs or `mammoth` for DOCX to support more file types.
- **Server-Side Option**: Implement a backend (e.g., with Python and `exiftool`) for deeper metadata analysis and modified content detection, if privacy concerns can be addressed.
- **Refined Scoring**: Adjust weights or add new indicators (e.g., partial content similarity) based on real-world testing.
- **UI Enhancements**: Include file type filters, progress indicators for large files, or downloadable reports.

## License
This project is intended for educational use by teachers to ensure academic integrity. It is not licensed for commercial use.