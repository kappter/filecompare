# File Duplication Detector Web Application

## Overview
This web application assists teachers in detecting potential file upload abuse by comparing metadata of two student-submitted files to estimate the likelihood of duplication. The frontend, hosted on GitHub Pages, uses HTML, CSS, and JavaScript for user interaction and duplication scoring. A Node.js/Express backend, hosted on Render, extracts metadata, including true creation dates (`birthtime`), overcoming client-side limitations. The app reports a percentage chance of duplication, helping identify academic misconduct.

## Goal
As a teacher, I need to identify when students submit files that may be duplicates of another’s work, often with minor modifications like renaming. This application uploads two files to a backend, analyzes their metadata (creation date, last modified date, name, size, type, content hash, and EXIF data for images), and calculates a duplication probability. Hosted on GitHub Pages for the frontend and Render for the backend, it combines accessibility with robust metadata extraction.

## Analysis Approach
The application uses a client-server architecture:
- **Frontend**: Handles file uploads, sends files to the backend, and performs duplication scoring.
- **Backend**: Extracts metadata, including creation dates, and returns it to the frontend.

1. **File Upload**:
   - Users upload two files via the frontend’s file input fields.
   - Files are sent to the backend’s `POST /upload` endpoint using `FormData`.

2. **Metadata Extraction**:
   - The backend extracts:
     - **Name**: File name.
     - **Size**: File size in bytes.
     - **Type**: MIME type (e.g., `image/jpeg`).
     - **Creation Date**: File creation timestamp (`birthtime`) via `fs.stat`.
     - **Last Modified Date**: File modified timestamp (`mtime`).
     - **Content Hash**: SHA-256 hash of file content.
   - The frontend extracts:
     - **EXIF Data**: For images, using `exif-js` (client-side to reduce backend load).
   - Files are deleted immediately after processing.

3. **Duplication Scoring**:
   - The frontend compares metadata:
     - **Content Hash** (80% weight): Identical hashes indicate identical files.
     - **EXIF Data** (20% weight): Identical EXIF data suggests same image source.
     - **Size** (15% weight): Identical sizes are common in duplicates.
     - **Name** (10% weight): Name similarity via Levenshtein distance (80%+).
     - **Creation Date** (10% weight): Identical creation dates suggest copying.
     - **Last Modified Date** (10% weight): Identical modified dates are suggestive.
     - **Type** (5% weight): Identical MIME types are weak indicators.
   - A weighted score (0–100%) is computed, capped at 100%.

4. **Results Display**:
   - A table shows metadata, with similar attributes highlighted.
   - A duplication probability percentage is displayed.
   - Warnings list indicators (e.g., identical creation dates) or note no duplication.

## Technical Details
- **Frontend**:
  - **HTML**: Structures the interface (`index.html`).
  - **CSS**: Uses Tailwind CSS (CDN) and `styles.css`.
  - **JavaScript**: Handles uploads, API calls, and scoring (`script.js`).
  - **Dependencies**: `exif-js` (CDN), `js-sha256` (CDN).
  - **Hosting**: GitHub Pages (static site).
- **Backend**:
  - **Node.js/Express**: Handles uploads (`multer`) and metadata (`fs.stat`).
  - **Dependencies**: `express`, `multer`, `crypto` (built-in).
  - **Hosting**: Render free tier (750 hours/month).
  - **API**: `POST /upload` endpoint.
- **Privacy**:
  - Files deleted after processing.
  - HTTPS for API calls.
  - No persistent storage of student data.

## Setup and Deployment
### 1. Frontend (GitHub Pages)
1. Create a GitHub repository (e.g., `file-duplication-detector`).
2. Add `index.html`, `styles.css`, `script.js`.
3. Push to the `main` or `gh-pages` branch.
4. Enable GitHub Pages in repository settings: “Pages” > “Source” > “Deploy from a branch” (select `main` or `gh-pages`).
5. Access at `https://<username>.github.io/<repository>`.

### 2. Backend (Render)
1. Create a separate GitHub repository (e.g., `file-duplication-backend`).
2. Add `server.js` and `package.json`.
3. Deploy on Render:
   - Create a Web Service, link the backend repo.
   - Set runtime to Node.js, start command: `node server.js`.
   - Add environment variable `PORT` (e.g., `3000`) if needed.
   - Get the URL (e.g., `https://file-duplication-backend.onrender.com`).
4. Update `script.js` with the backend URL (replace `BACKEND_URL`).

### 3. Local Testing
1. **Backend**:
   - Install Node.js (https://nodejs.org).
   - Clone the backend repo.
   - Run `npm install` in the repo directory.
   - Start the server: `node server.js`.
   - Verify at `http://localhost:3000`.
2. **Frontend**:
   - Install a static server (e.g., `live-server`: `npm install -g live-server`).
   - Run `live-server` in the frontend repo directory.
   - Update `BACKEND_URL` in `script.js` to `http://localhost:3000/upload`.
3. Test by uploading files and checking creation date extraction.

## Limitations
- **Creation Date**:
  - `birthtime` depends on file system (e.g., NTFS, APFS support it; ext4 may not).
  - Client-side fallback uses `lastModified` if backend fails.
- **GitHub Pages**: Static hosting requires a separate backend.
- **Metadata Scope**: Limited to basic metadata and EXIF for images.
- **Content Modifications**: Hashing detects identical files, not modified duplicates.
- **Render Limits**: Free tier has 750 hours/month; heavy use may need a paid plan.
- **Privacy**: Ensure backend deletes files; review Render’s policies for FERPA compliance.

## Future Improvements
- **Extended Metadata**: Add server-side libraries (e.g., `pdf-lib` for PDFs).
- **Alternative Backends**: Explore AWS Lambda or Python/FastAPI.
- **Scoring Refinement**: Adjust weights or add partial content checks.
- **UI Enhancements**: Add upload progress, file type filters, or report exports.

## License
For educational use by teachers to ensure academic integrity. Not for commercial use.