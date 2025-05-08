# File Metadata Comparison Web Application

## Overview
This web application is designed to assist teachers in detecting potential file upload abuse by comparing the metadata of two student-submitted files. The goal is to identify suspicious similarities or discrepancies in file metadata that may indicate a student has submitted a slightly modified version of another student's work. The application is built using HTML, CSS, and JavaScript, ensuring it runs entirely client-side in the browser for simplicity and privacy.

## Goal
As a teacher, I often suspect that students submit files created by others, with minor modifications, as their own work. This application enables me to upload two files and compare their metadata, such as file name, size, type, last modified date, and EXIF data (for images). By highlighting identical or suspicious metadata, the tool helps flag potential cases of file copying or unauthorized reuse, focusing on metadata analysis rather than content plagiarism.

## Analysis Approach
The application uses a client-side approach to extract and compare file metadata, leveraging the browser's `File` API and the `exif-js` library for image-specific metadata. The analysis process includes the following steps:

1. **File Upload**:
   - Users upload two files via a web interface with separate file input fields.
   - The interface ensures both files are selected before enabling the comparison.

2. **Metadata Extraction**:
   - For each file, the application extracts:
     - **Name**: The file's name as provided by the user.
     - **Size**: The file size in bytes.
     - **Type**: The MIME type (e.g., `image/jpeg`, `application/pdf`).
     - **Last Modified Date**: The file's last modified timestamp, converted to ISO format.
     - **EXIF Data**: For image files, EXIF metadata (e.g., camera model, date taken) is extracted using the `exif-js` library.
   - Non-image files have `EXIF Data` marked as `N/A`.

3. **Comparison**:
   - The extracted metadata is displayed in a table, with one column per file.
   - Properties are compared to identify similarities:
     - Identical values (e.g., same last modified date or EXIF data) are highlighted in yellow to draw attention.
     - Warnings are generated for suspicious cases, such as identical last modified dates or EXIF data, which may suggest file duplication.

4. **Results Display**:
   - A table presents the metadata side-by-side for easy comparison.
   - A warnings section lists potential issues, such as identical timestamps, to help the teacher decide if further investigation is needed.

## Technical Details
- **Technologies**:
  - **HTML**: Structures the user interface with file inputs, a compare button, and a results table.
  - **CSS**: Uses Tailwind CSS (via CDN) for responsive styling, with minimal custom styles in `styles.css`.
  - **JavaScript**: Handles file input, metadata extraction, and comparison logic in `script.js`. The `exif-js` library is included for EXIF data extraction.
- **Dependencies**:
  - Tailwind CSS (CDN)
  - `exif-js` (via CDN for EXIF parsing)
- **Client-Side Operation**: All processing occurs in the browser, ensuring no student data is sent to a server, which prioritizes privacy but limits metadata depth.

## Limitations
- **Metadata Scope**: The application extracts basic metadata (name, size, type, last modified date) and EXIF data for images. Other file types (e.g., PDFs, DOCX) are not deeply analyzed due to client-side constraints.
- **Creation Date**: The `lastModified` date is used, which reflects the last modification time, not the original creation time. Millisecond precision is not guaranteed due to browser and file system variations.
- **Content Analysis**: The tool does not compare file content (e.g., text similarity), focusing solely on metadata. Content plagiarism detection requires additional tools.
- **File Type Support**: EXIF extraction is limited to images. Other formats require additional libraries or server-side processing.
- **Browser Compatibility**: The application relies on the `File` API and works in modern browsers, but functionality may vary in older browsers.

## Usage
1. Open `index.html` in a modern web browser.
2. Upload two files using the provided file input fields.
3. Click the "Compare Files" button (enabled only when both files are selected).
4. Review the comparison table and warnings to identify suspicious metadata similarities.

## Future Improvements
- **Extended Metadata Parsing**: Integrate libraries like `pdf.js` for PDFs or `mammoth` for DOCX to support more file types.
- **Server-Side Option**: Add a backend (e.g., with Python and `exiftool`) for deeper metadata extraction and content comparison, if privacy concerns can be addressed.
- **Enhanced Warnings**: Develop more sophisticated heuristics to flag potential abuse based on metadata patterns.
- **UI Enhancements**: Add file type filters, progress indicators for large files, or exportable reports.

## License
This project is intended for educational use by teachers to ensure academic integrity. It is not licensed for commercial use.