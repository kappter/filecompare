const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const crypto = require('crypto');
const app = express();
const upload = multer({ dest: 'uploads/' });

// Enable CORS for GitHub Pages frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.post('/upload', upload.array('files', 2), async (req, res) => {
  try {
    const metadata = await Promise.all(req.files.map(async (file) => {
      const stats = await fs.stat(file.path);
      const fileBuffer = await fs.readFile(file.path);
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      return {
        name: file.originalname,
        size: stats.size,
        type: file.mimetype,
        created: stats.birthtime.toISOString(),
        modified: stats.mtime.toISOString(),
        hash
      };
    }));
    // Clean up uploaded files
    await Promise.all(req.files.map(file => fs.unlink(file.path)));
    res.json(metadata);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));