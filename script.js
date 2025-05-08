document.addEventListener('DOMContentLoaded', () => {
  const file1Input = document.getElementById('file1');
  const file2Input = document.getElementById('file2');
  const compareBtn = document.getElementById('compareBtn');
  const resultsDiv = document.getElementById('results');
  const comparisonTable = document.getElementById('comparisonTable');
  const warningsDiv = document.getElementById('warnings');
  const duplicationScore = document.getElementById('duplicationScore');

  // Enable analyze button when both files are selected
  function checkInputs() {
    compareBtn.disabled = !(file1Input.files.length && file2Input.files.length);
  }

  file1Input.addEventListener('change', checkInputs);
  file2Input.addEventListener('change', checkInputs);

  // Analyze files on button click
  compareBtn.addEventListener('click', async () => {
    const file1 = file1Input.files[0];
    const file2 = file2Input.files[0];
    comparisonTable.innerHTML = '';
    warningsDiv.innerHTML = '';
    duplicationScore.innerHTML = '';
    resultsDiv.classList.remove('hidden');

    // Extract metadata
    const meta1 = await getFileMetadata(file1);
    const meta2 = await getFileMetadata(file2);

    // Compare metadata and calculate duplication score
    const properties = ['Name', 'Size (bytes)', 'Type', 'Last Modified', 'Content Hash', 'EXIF Data'];
    const warnings = [];
    let score = 0;
    const weights = {
      hash: 80,   // Identical content
      exif: 20,   // Identical EXIF data (images)
      size: 15,   // Identical size
      name: 10,   // Similar name
      modified: 10, // Identical last modified date
      type: 5     // Identical type
    };

    properties.forEach(prop => {
      const row = document.createElement('tr');
      let val1, val2, isSimilar = false;

      switch (prop) {
        case 'Name':
          val1 = meta1.name;
          val2 = meta2.name;
          const similarity = 1 - levenshtein(val1, val2) / Math.max(val1.length, val2.length);
          if (similarity > 0.8) {
            score += weights.name * similarity;
            isSimilar = true;
            warnings.push(`File names are highly similar (${(similarity * 100).toFixed(0)}% match).`);
          }
          val1 = `${val1} (${(similarity * 100).toFixed(0)}% match)`;
          val2 = `${val2} (${(similarity * 100).toFixed(0)}% match)`;
          break;
        case 'Size (bytes)':
          val1 = meta1.size;
          val2 = meta2.size;
          if (val1 === val2) {
            score += weights.size;
            isSimilar = true;
            warnings.push('Files have identical sizes, which may indicate duplication.');
          }
          break;
        case 'Type':
          val1 = meta1.type;
          val2 = meta2.type;
          if (val1 === val2) {
            score += weights.type;
            isSimilar = true;
          }
          break;
        case 'Last Modified':
          val1 = meta1.lastModified;
          val2 = meta2.lastModified;
          if (val1 === val2 && val1 !== 'N/A') {
            score += weights.modified;
            isSimilar = true;
            warnings.push('Files have identical last modified dates, which may suggest copying.');
          }
          break;
        case 'Content Hash':
          val1 = meta1.hash;
          val2 = meta2.hash;
          if (val1 === val2) {
            score += weights.hash;
            isSimilar = true;
            warnings.push('Files have identical content hashes, strongly indicating duplication.');
          }
          break;
        case 'EXIF Data':
          val1 = meta1.exif ? JSON.stringify(meta1.exif, null, 2) : 'N/A';
          val2 = meta2.exif ? JSON.stringify(meta2.exif, null, 2) : 'N/A';
          if (val1 !== 'N/A' && val1 === val2) {
            score += weights.exif;
            isSimilar = true;
            warnings.push('Files have identical EXIF data, which may indicate same source.');
          }
          break;
      }

      row.innerHTML = `
        <td class="border p-2">${prop}</td>
        <td class="border p-2">${val1}</td>
        <td class="border p-2">${val2}</td>
      `;
      if (isSimilar) {
        row.classList.add('bg-similar');
      }
      comparisonTable.appendChild(row);
    });

    // Cap score at 100
    score = Math.min(score, 100);
    duplicationScore.innerHTML = `Duplication Probability: ${score.toFixed(2)}%`;

    // Display warnings
    if (warnings.length) {
      warningsDiv.innerHTML = '<strong>Warnings:</strong><ul>' + warnings.map(w => `<li>${w}</li>`).join('') + '</ul>';
    } else {
      warningsDiv.innerHTML = 'No significant duplication indicators detected.';
    }
  });

  // Extract file metadata
  async function getFileMetadata(file) {
    const metadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : 'N/A',
      hash: await getFileHash(file),
      exif: null
    };

    // Attempt to extract EXIF data for images
    if (file.type.startsWith('image/')) {
      try {
        metadata.exif = await getExifData(file);
      } catch (e) {
        console.warn('Failed to extract EXIF data:', e);
      }
    }

    return metadata;
  }

  // Get file hash using SHA-256
  async function getFileHash(file) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Get EXIF data using exif-js
  function getExifData(file) {
    return new Promise((resolve, reject) => {
      EXIF.getData(file, function() {
        const exifData = EXIF.getAllTags(this);
        if (Object.keys(exifData).length) {
          resolve(exifData);
        } else {
          resolve(null);
        }
      });
    });
  }

  // Levenshtein distance for name similarity
  function levenshtein(a, b) {
    const matrix = Array(b.length + 1).fill().map(() => Array(a.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    return matrix[b.length][a.length];
  }
});