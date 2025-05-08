document.addEventListener('DOMContentLoaded', () => {
  const file1Input = document.getElementById('file1');
  const file2Input = document.getElementById('file2');
  const compareBtn = document.getElementById('compareBtn');
  const resultsDiv = document.getElementById('results');
  const comparisonTable = document.getElementById('comparisonTable');
  const warningsDiv = document.getElementById('warnings');

  // Enable compare button when both files are selected
  function checkInputs() {
    compareBtn.disabled = !(file1Input.files.length && file2Input.files.length);
  }

  file1Input.addEventListener('change', checkInputs);
  file2Input.addEventListener('change', checkInputs);

  // Compare files on button click
  compareBtn.addEventListener('click', async () => {
    const file1 = file1Input.files[0];
    const file2 = file2Input.files[0];
    comparisonTable.innerHTML = '';
    warningsDiv.innerHTML = '';
    resultsDiv.classList.remove('hidden');

    // Extract metadata
    const meta1 = await getFileMetadata(file1);
    const meta2 = await getFileMetadata(file2);

    // Compare metadata
    const properties = ['Name', 'Size (bytes)', 'Type', 'Last Modified', 'EXIF Data'];
    const warnings = [];

    properties.forEach(prop => {
      const row = document.createElement('tr');
      let val1, val2;

      switch (prop) {
        case 'Name':
          val1 = meta1.name;
          val2 = meta2.name;
          break;
        case 'Size (bytes)':
          val1 = meta1.size;
          val2 = meta2.size;
          break;
        case 'Type':
          val1 = meta1.type;
          val2 = meta2.type;
          break;
        case 'Last Modified':
          val1 = meta1.lastModified;
          val2 = meta2.lastModified;
          if (val1 === val2 && val1 !== 'N/A') {
            warnings.push('Files have identical last modified dates, which may indicate copying.');
          }
          break;
        case 'EXIF Data':
          val1 = meta1.exif ? JSON.stringify(meta1.exif, null, 2) : 'N/A';
          val2 = meta2.exif ? JSON.stringify(meta2.exif, null, 2) : 'N/A';
          if (val1 !== 'N/A' && val1 === val2) {
            warnings.push('Files have identical EXIF data, which may indicate duplication.');
          }
          break;
      }

      row.innerHTML = `
        <td class="border p-2">${prop}</td>
        <td class="border p-2">${val1}</td>
        <td class="border p-2">${val2}</td>
      `;
      if (val1 === val2 && val1 !== 'N/A') {
        row.classList.add('bg-similar');
      }
      comparisonTable.appendChild(row);
    });

    // Display warnings
    if (warnings.length) {
      warningsDiv.innerHTML = '<strong>Warnings:</strong><ul>' + warnings.map(w => `<li>${w}</li>`).join('') + '</ul>';
    }
  });

  // Extract file metadata
  async function getFileMetadata(file) {
    const metadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : 'N/A',
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
});